package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.io.IOException;
import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

/**
 * Validates Claude Client Identity Metadata Documents (CIMD) and the redirect URIs they permit.
 *
 * <p>Only the two official Anthropic client identities are accepted, and the document behind such
 * an identity is fetched under strict limits: short timeouts, a hard body cap, no redirect
 * following, no private or loopback network targets, and a bounded positive cache. The URL is also
 * required to describe itself — {@code client_id} inside the document must equal the URL it was
 * loaded from — so a document cannot claim an identity that is not its own.</p>
 */
@Component
@ConditionalOnClaudeV1Enabled
public class ClaudeV1CimdMetadataValidator {

    private static final int MAX_DOCUMENT_BYTES = 64 * 1024;
    private static final Duration NEGATIVE_CACHE_TTL = Duration.ofSeconds(30);
    private static final Set<String> HOSTED_METADATA_REDIRECTS =
            Set.of(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK);
    private static final Set<String> CODE_METADATA_REDIRECTS =
            Set.of("http://127.0.0.1/callback", "http://localhost/callback");

    private record CachedDocument(boolean valid, Instant expiresAt) {}

    private final ClaudeV1Properties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final ConcurrentHashMap<String, CachedDocument> cache = new ConcurrentHashMap<>();

    public ClaudeV1CimdMetadataValidator(ClaudeV1Properties properties, ObjectMapper objectMapper) {
        this.properties = Objects.requireNonNull(properties, "properties");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(properties.getCimdConnectTimeout())
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
    }

    /** Structural check: is this one of the two client identities Claude v1 accepts at all? */
    public boolean isAllowedClientId(String clientId) {
        return clientId != null && ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS.contains(clientId);
    }

    /**
     * Full check including document retrieval. A fetch failure denies the request rather than
     * falling back to the allowlist alone.
     */
    public boolean isVerifiedClientId(String clientId) {
        if (!isAllowedClientId(clientId)) {
            return false;
        }
        CachedDocument cached = cache.get(clientId);
        if (cached != null && Instant.now().isBefore(cached.expiresAt())) {
            return cached.valid();
        }
        boolean valid = fetchAndValidate(clientId);
        Duration cacheTtl = valid ? properties.getCimdCacheTtl() : NEGATIVE_CACHE_TTL;
        cache.put(clientId, new CachedDocument(valid, Instant.now().plus(cacheTtl)));
        return valid;
    }

    public boolean isValidRedirectUri(String clientId, String redirectUri) {
        if (!isAllowedClientId(clientId) || redirectUri == null || redirectUri.isBlank()) {
            return false;
        }

        URI uri;
        try {
            uri = URI.create(redirectUri);
        } catch (IllegalArgumentException e) {
            return false;
        }
        if (uri.getFragment() != null || uri.getRawQuery() != null || !uri.isAbsolute()) {
            return false;
        }

        String scheme = uri.getScheme();
        String host = uri.getHost();
        String path = uri.getPath();

        if (ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID.equals(clientId)) {
            // Hosted Claude posts back to exactly one URL; compare the whole thing.
            return ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK.equals(redirectUri);
        }

        if (ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID.equals(clientId)) {
            // Claude Code binds an ephemeral loopback port. Only the port may vary: scheme, host
            // and path are compared exactly, and the port must be explicitly present. Claude Code
            // declares portless callbacks in CIMD but supplies an ephemeral runtime port.
            return "http".equalsIgnoreCase(scheme)
                    && host != null
                    && ClaudeV1Contract.LOOPBACK_CALLBACK_HOSTS.contains(host.toLowerCase(java.util.Locale.ROOT))
                    && ClaudeV1Contract.LOOPBACK_CALLBACK_PATH.equals(path)
                    && uri.getPort() > 1023
                    && uri.getUserInfo() == null;
        }

        return false;
    }

    public void validateRedirectUri(String clientId, String redirectUri) {
        if (!isValidRedirectUri(clientId, redirectUri)) {
            throw new IllegalArgumentException("Redirect URI is not permitted for this Claude client.");
        }
    }

    private boolean fetchAndValidate(String clientId) {
        try {
            URI documentUri = URI.create(clientId);
            if (!"https".equalsIgnoreCase(documentUri.getScheme()) || isNonPublicTarget(documentUri.getHost())) {
                return false;
            }

            HttpRequest request = HttpRequest.newBuilder(documentUri)
                    .timeout(properties.getCimdReadTimeout())
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<InputStream> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() != 200) {
                return false;
            }

            byte[] body = readBounded(response.body());
            if (body == null) {
                return false;
            }

            JsonNode document = objectMapper.readTree(body);
            return isWellFormedDocument(document, clientId);
        } catch (IOException | IllegalArgumentException e) {
            return false;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /** Reads at most {@link #MAX_DOCUMENT_BYTES}; returns {@code null} when the body is larger. */
    private byte[] readBounded(InputStream stream) throws IOException {
        try (stream) {
            byte[] body = stream.readNBytes(MAX_DOCUMENT_BYTES + 1);
            return body.length > MAX_DOCUMENT_BYTES ? null : body;
        }
    }

    boolean isWellFormedDocument(JsonNode document, String clientId) {
        if (document == null || !document.isObject()) {
            return false;
        }
        // Self-reference: the document must name the URL it was served from.
        if (!clientId.equals(document.path("client_id").asText(null))) {
            return false;
        }
        JsonNode clientName = document.path("client_name");
        if (!clientName.isTextual()
                || clientName.asText().isBlank()
                || clientName.asText().length() > 200) {
            return false;
        }
        JsonNode redirectUris = document.path("redirect_uris");
        if (!redirectUris.isArray() || redirectUris.isEmpty()) {
            return false;
        }
        Set<String> declaredRedirects = new HashSet<>();
        for (JsonNode redirectUri : redirectUris) {
            if (!redirectUri.isTextual() || !declaredRedirects.add(redirectUri.asText())) {
                return false;
            }
        }
        Set<String> expectedRedirects = ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID.equals(clientId)
                ? HOSTED_METADATA_REDIRECTS
                : CODE_METADATA_REDIRECTS;
        if (!declaredRedirects.equals(expectedRedirects)) {
            return false;
        }
        JsonNode authMethod = document.path("token_endpoint_auth_method");
        if (!authMethod.isTextual() || !"none".equals(authMethod.asText())) {
            return false;
        }
        return containsOnlyAndRequires(document.path("grant_types"),
                        Set.of(
                                "authorization_code",
                                "refresh_token",
                                "urn:ietf:params:oauth:grant-type:jwt-bearer"),
                        "authorization_code")
                && containsOnlyAndRequires(document.path("response_types"), Set.of("code"), "code");
    }

    private boolean containsOnlyAndRequires(JsonNode node, Set<String> allowed, String required) {
        if (!node.isArray() || node.isEmpty()) {
            return false;
        }
        Set<String> values = new HashSet<>();
        for (JsonNode value : node) {
            if (!value.isTextual() || !allowed.contains(value.asText()) || !values.add(value.asText())) {
                return false;
            }
        }
        return values.contains(required);
    }

    private boolean isNonPublicTarget(String host) {
        if (host == null || host.isBlank()) {
            return true;
        }
        try {
            for (InetAddress address : InetAddress.getAllByName(host)) {
                if (address.isLoopbackAddress()
                        || address.isLinkLocalAddress()
                        || address.isSiteLocalAddress()
                        || address.isAnyLocalAddress()
                        || address.isMulticastAddress()) {
                    return true;
                }
            }
            return false;
        } catch (UnknownHostException e) {
            return true;
        }
    }
}
