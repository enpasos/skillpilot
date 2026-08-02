package com.skillpilot.backend.openai.de.oauth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Fetches and validates the configured ChatGPT CIMD document before the OAuth
 * client is registered.
 *
 * <p>The configured values are pins, not substitutes for discovery. Startup
 * fails unless the remotely published document confirms them exactly.</p>
 */
final class OpenAiDeCimdMetadataValidator {

    static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);
    static final int MAX_DOCUMENT_BYTES = 256 * 1024;

    private final ObjectMapper objectMapper;
    private final MetadataRetriever metadataRetriever;

    OpenAiDeCimdMetadataValidator(
            ObjectMapper objectMapper,
            MetadataRetriever metadataRetriever) {
        this.objectMapper = objectMapper;
        this.metadataRetriever = metadataRetriever;
    }

    static OpenAiDeCimdMetadataValidator production(ObjectMapper objectMapper) {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        return new OpenAiDeCimdMetadataValidator(
                objectMapper,
                requestedUri -> retrieve(client, requestedUri));
    }

    void validate(OpenAiDeProperties properties) {
        URI clientId = URI.create(properties.getOauth().getClientId().trim());
        MetadataResponse response;
        try {
            response = metadataRetriever.retrieve(clientId);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw failure("CIMD metadata retrieval was interrupted.", exception);
        } catch (IOException | RuntimeException exception) {
            throw failure("CIMD metadata could not be retrieved.", exception);
        }

        if (!clientId.equals(response.requestedUri())
                || !clientId.equals(response.effectiveUri())) {
            throw failure("CIMD metadata redirects are not allowed.");
        }
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw failure("CIMD metadata endpoint returned HTTP " + response.statusCode() + ".");
        }
        if (!isJsonContentType(response.contentType())) {
            throw failure("CIMD metadata endpoint must return a JSON Content-Type.");
        }
        if (response.body() == null || response.body().length == 0) {
            throw failure("CIMD metadata document is empty.");
        }
        if (response.body().length > MAX_DOCUMENT_BYTES) {
            throw failure("CIMD metadata document exceeds the size limit.");
        }

        JsonNode document;
        try {
            document = objectMapper.readTree(response.body());
        } catch (IOException exception) {
            throw failure("CIMD metadata document is not valid JSON.", exception);
        }
        if (document == null || !document.isObject()) {
            throw failure("CIMD metadata document must be a JSON object.");
        }

        requireExactText(document, "client_id", properties.getOauth().getClientId().trim());
        requireNonBlankText(document, "client_name");
        requireArrayContains(
                document,
                "token_endpoint_auth_methods_supported",
                OpenAiDeOAuthConfiguration.CLIENT_AUTH_PRIVATE_KEY_JWT);
        requireExactText(
                document,
                "jwks_uri",
                properties.getOauth().getClientJwkSetUri().trim());

        Set<String> publishedRedirectUris = requireTextSet(document, "redirect_uris");
        for (String configuredRedirectUri : properties.getOauth().getRedirectUris()) {
            String pinnedRedirectUri = configuredRedirectUri == null
                    ? ""
                    : configuredRedirectUri.trim();
            if (!publishedRedirectUris.contains(pinnedRedirectUri)) {
                throw failure(
                        "Configured OAuth redirect URI is not published by the CIMD document.");
            }
        }

        JsonNode signingAlgorithms =
                document.get("token_endpoint_auth_signing_alg_values_supported");
        if (signingAlgorithms != null) {
            requireArrayContains(
                    document,
                    "token_endpoint_auth_signing_alg_values_supported",
                    properties.getOauth().getClientAssertionSigningAlgorithm()
                            .trim()
                            .toUpperCase(Locale.ROOT));
        }
    }

    private static MetadataResponse retrieve(HttpClient client, URI requestedUri)
            throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(requestedUri)
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<InputStream> response =
                client.send(request, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream body = response.body()) {
            byte[] bytes = body.readNBytes(MAX_DOCUMENT_BYTES + 1);
            return new MetadataResponse(
                    requestedUri,
                    response.uri(),
                    response.statusCode(),
                    response.headers().firstValue("Content-Type").orElse(""),
                    bytes);
        }
    }

    private static void requireExactText(
            JsonNode document,
            String field,
            String expected) {
        JsonNode value = document.get(field);
        if (value == null || !value.isTextual() || !expected.equals(value.textValue())) {
            throw failure("CIMD metadata field '" + field + "' does not match its configured pin.");
        }
    }

    private static void requireNonBlankText(JsonNode document, String field) {
        JsonNode value = document.get(field);
        if (value == null || !value.isTextual() || value.textValue().isBlank()) {
            throw failure("CIMD metadata field '" + field + "' must be a non-empty string.");
        }
    }

    private static void requireArrayContains(
            JsonNode document,
            String field,
            String expected) {
        Set<String> values = requireTextSet(document, field);
        if (!values.contains(expected)) {
            throw failure("CIMD metadata field '" + field + "' does not contain '" + expected + "'.");
        }
    }

    private static Set<String> requireTextSet(JsonNode document, String field) {
        JsonNode value = document.get(field);
        if (value == null || !value.isArray() || value.isEmpty()) {
            throw failure("CIMD metadata field '" + field + "' must be a non-empty array.");
        }
        LinkedHashSet<String> values = new LinkedHashSet<>();
        for (JsonNode item : value) {
            if (!item.isTextual() || item.textValue().isBlank() || !values.add(item.textValue())) {
                throw failure(
                        "CIMD metadata field '" + field + "' must contain unique non-empty strings.");
            }
        }
        return Set.copyOf(values);
    }

    private static boolean isJsonContentType(String contentType) {
        if (contentType == null) {
            return false;
        }
        String mediaType = contentType.split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        return "application/json".equals(mediaType) || mediaType.endsWith("+json");
    }

    private static IllegalStateException failure(String message) {
        return new IllegalStateException("OpenAI Coach V1 secure startup refused: " + message);
    }

    private static IllegalStateException failure(String message, Throwable cause) {
        return new IllegalStateException("OpenAI Coach V1 secure startup refused: " + message, cause);
    }

    @FunctionalInterface
    interface MetadataRetriever {
        MetadataResponse retrieve(URI requestedUri) throws IOException, InterruptedException;
    }

    record MetadataResponse(
            URI requestedUri,
            URI effectiveUri,
            int statusCode,
            String contentType,
            byte[] body) {}
}
