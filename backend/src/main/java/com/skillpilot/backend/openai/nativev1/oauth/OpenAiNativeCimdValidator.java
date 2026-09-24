package com.skillpilot.backend.openai.nativev1.oauth;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.ByteBuffer;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Flow;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.regex.Pattern;

/** Verifies one deployment-pinned native ChatGPT public client, never arbitrary client URLs. */
public final class OpenAiNativeCimdValidator {
    static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(3);
    static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(5);
    static final Duration POSITIVE_TTL = Duration.ofMinutes(5);
    static final Duration NEGATIVE_TTL = Duration.ofSeconds(30);
    static final int MAX_DOCUMENT_BYTES = 64 * 1024;
    private static final Pattern CLIENT_ID = Pattern.compile(
            "https://chatgpt\\.com/oauth/codex/([A-Za-z0-9_-]+)/client\\.json");

    private final String clientId;
    private final URI metadataUri;
    private final String redirectUri;
    private final String redirectPath;
    private final ObjectMapper objectMapper;
    private final MetadataRetriever retriever;
    private final Clock clock;
    private volatile Instant expiresAt = Instant.MIN;
    private volatile IllegalStateException cachedFailure;

    public OpenAiNativeCimdValidator(String clientId, ObjectMapper objectMapper,
            MetadataRetriever retriever) {
        this(clientId, objectMapper, retriever, Clock.systemUTC());
    }

    OpenAiNativeCimdValidator(String clientId, ObjectMapper objectMapper,
            MetadataRetriever retriever, Clock clock) {
        var match = CLIENT_ID.matcher(Objects.requireNonNull(clientId, "clientId"));
        if (!match.matches()) {
            throw failure("Client ID must be a pinned HTTPS chatgpt.com/oauth/codex/<callback_id>/client.json URI.");
        }
        this.clientId = clientId;
        this.metadataUri = URI.create(clientId);
        this.redirectPath = "/callback/" + match.group(1);
        this.redirectUri = "http://127.0.0.1" + redirectPath;
        // Strict duplicate handling is local to this parser; do not mutate the shared mapper.
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
        this.retriever = Objects.requireNonNull(retriever, "retriever");
        this.clock = Objects.requireNonNull(clock, "clock");
    }

    public static OpenAiNativeCimdValidator production(String clientId, ObjectMapper objectMapper) {
        return new OpenAiNativeCimdValidator(clientId, objectMapper, new TrustedRetriever());
    }

    public String clientId() { return clientId; }

    /** The portless redirect published in the client metadata. */
    public String redirectUri() { return redirectUri; }

    /** Read-only diagnostic: health checks never fetch remote metadata or hold up hosted clients. */
    public boolean hasVerifiedMetadata() {
        Instant observedExpiry = expiresAt;
        return clock.instant().isBefore(observedExpiry) && cachedFailure == null;
    }

    /** Performs no network I/O. The selected port must be preserved exactly through code exchange. */
    public boolean validRedirect(String candidate) {
        if (candidate == null) return false;
        try {
            URI uri = URI.create(candidate);
            int port = uri.getPort();
            return "http".equals(uri.getScheme())
                    && "127.0.0.1".equals(uri.getHost())
                    && port >= 1 && port <= 65535
                    && ("127.0.0.1:" + port).equals(uri.getRawAuthority())
                    && redirectPath.equals(uri.getRawPath())
                    && uri.getRawQuery() == null && uri.getRawFragment() == null
                    && uri.getRawUserInfo() == null;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    /** Bounded single-entry cache: an expired success is never reused after retrieval failure. */
    public synchronized void verify() {
        if (clock.instant().isBefore(expiresAt)) {
            if (cachedFailure != null) throw cachedFailure;
            return;
        }
        try {
            validate(retriever.retrieve(metadataUri));
            cachedFailure = null;
            expiresAt = clock.instant().plus(POSITIVE_TTL);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            cacheFailure(failure("Metadata retrieval interrupted.", exception));
        } catch (IOException | RuntimeException exception) {
            cacheFailure(failure("Metadata verification failed.", exception));
        }
    }

    private void cacheFailure(IllegalStateException exception) {
        cachedFailure = exception;
        expiresAt = clock.instant().plus(NEGATIVE_TTL);
        throw exception;
    }

    private void validate(MetadataResponse response) throws IOException {
        if (response == null || !metadataUri.equals(response.requestedUri())
                || !metadataUri.equals(response.effectiveUri())) {
            throw failure("Metadata redirects or different client documents are forbidden.");
        }
        if (response.statusCode() != 200) throw failure("Metadata endpoint did not return HTTP 200.");
        String mediaType = response.contentType() == null ? ""
                : response.contentType().split(";", 2)[0].trim().toLowerCase(Locale.ROOT);
        if (!"application/json".equals(mediaType)
                && !(mediaType.startsWith("application/") && mediaType.endsWith("+json"))) {
            throw failure("Metadata must have a JSON content type.");
        }
        byte[] body = response.body();
        if (body == null || body.length == 0 || body.length > MAX_DOCUMENT_BYTES) {
            throw failure("Metadata body is empty or exceeds the size limit.");
        }
        JsonNode document;
        try (JsonParser parser = objectMapper.getFactory().createParser(body)) {
            parser.enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION);
            document = objectMapper.readTree(parser);
            if (parser.nextToken() != null) throw failure("Metadata has trailing JSON data.");
        }
        if (document == null || !document.isObject()) throw failure("Metadata must be a JSON object.");
        requireText(document, "client_id", clientId);
        JsonNode name = document.get("client_name");
        if (name == null || !name.isTextual() || name.textValue().isBlank()) {
            throw failure("Metadata client_name must be a nonempty string.");
        }
        boolean singular = document.has("token_endpoint_auth_method");
        boolean plural = document.has("token_endpoint_auth_methods_supported");
        if (!singular && !plural) throw failure("Metadata must explicitly support public-client authentication.");
        if (singular) requireText(document, "token_endpoint_auth_method", "none");
        if (plural && !textSet(document, "token_endpoint_auth_methods_supported").contains("none")) {
            throw failure("Metadata must support token endpoint authentication method none.");
        }
        Set<String> redirects = textSet(document, "redirect_uris");
        // The official document also publishes its localhost alternative. It is
        // accepted as metadata, but this authorization server only uses 127.0.0.1.
        if (!redirects.contains(redirectUri)
                || !Set.of(redirectUri, "http://localhost" + redirectPath).containsAll(redirects)) {
            throw failure("Metadata must publish the pinned portless loopback callback without unrelated redirects.");
        }
    }

    private static void requireText(JsonNode document, String field, String expected) {
        JsonNode value = document.get(field);
        if (value == null || !value.isTextual() || !expected.equals(value.textValue())) {
            throw failure("Metadata field " + field + " does not match its pin.");
        }
    }

    private static Set<String> textSet(JsonNode document, String field) {
        JsonNode value = document.get(field);
        if (value == null || !value.isArray() || value.isEmpty()) {
            throw failure("Metadata field " + field + " must be a nonempty string array.");
        }
        Set<String> strings = new HashSet<>();
        for (JsonNode item : value) {
            if (!item.isTextual() || item.textValue().isBlank() || !strings.add(item.textValue())) {
                throw failure("Metadata field " + field + " has invalid or duplicate values.");
            }
        }
        return strings;
    }

    private static IllegalStateException failure(String message) {
        return new IllegalStateException("OpenAI native client refused: " + message);
    }

    private static IllegalStateException failure(String message, Throwable cause) {
        return new IllegalStateException("OpenAI native client refused: " + message, cause);
    }

    @FunctionalInterface
    public interface MetadataRetriever {
        MetadataResponse retrieve(URI requestedUri) throws IOException, InterruptedException;
    }

    public record MetadataResponse(URI requestedUri, URI effectiveUri, int statusCode,
            String contentType, byte[] body) {}

    private static final class TrustedRetriever implements MetadataRetriever {
        private final HttpClient client = HttpClient.newBuilder().connectTimeout(CONNECT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NEVER).build();

        @Override public MetadataResponse retrieve(URI uri) throws IOException, InterruptedException {
            if (!CLIENT_ID.matcher(uri.toString()).matches()) throw failure("Untrusted metadata URL.");
            // The hostname is fixed and HTTPS hostname verification stays enabled.
            // Reject local/private DNS answers as an additional SSRF boundary.
            for (InetAddress address : InetAddress.getAllByName("chatgpt.com")) {
                if (!isPublicAddress(address)) throw new IOException("Metadata DNS returned a non-public address.");
            }
            HttpRequest request = HttpRequest.newBuilder(uri).timeout(REQUEST_TIMEOUT)
                    .header("Accept", "application/json").GET().build();
            var pending = client.sendAsync(request, ignored -> new BoundedBodySubscriber());
            try {
                var response = pending.get(REQUEST_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
                return new MetadataResponse(uri, response.uri(), response.statusCode(),
                        response.headers().firstValue("Content-Type").orElse(""), response.body());
            } catch (ExecutionException | TimeoutException exception) {
                pending.cancel(true);
                throw new IOException("Metadata transfer failed or timed out.", exception);
            } catch (InterruptedException exception) {
                pending.cancel(true);
                throw exception;
            }
        }
    }

    static boolean isPublicAddress(InetAddress address) {
        if (address.isAnyLocalAddress() || address.isLoopbackAddress() || address.isLinkLocalAddress()
                || address.isSiteLocalAddress() || address.isMulticastAddress()) return false;
        byte[] bytes = address.getAddress();
        if (bytes.length == 4) {
            int first = bytes[0] & 255;
            int second = bytes[1] & 255;
            int third = bytes[2] & 255;
            return first != 0 && first < 224
                    && !(first == 100 && second >= 64 && second <= 127)
                    && !(first == 192 && second == 0 && (third == 0 || third == 2))
                    && !(first == 198 && (second == 18 || second == 19 || second == 51 && third == 100))
                    && !(first == 203 && second == 0 && third == 113);
        }
        // Global unicast only, excluding documentation and protocol-assignment ranges.
        return (bytes[0] & 0xe0) == 0x20
                && !((bytes[0] & 255) == 0x20 && (bytes[1] & 255) == 0x01
                        && (((bytes[2] & 255) == 0x0d && (bytes[3] & 255) == 0xb8)
                                || (bytes[2] & 255) < 2));
    }

    static final class BoundedBodySubscriber implements HttpResponse.BodySubscriber<byte[]> {
        private final CompletableFuture<byte[]> result = new CompletableFuture<>();
        private final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        private Flow.Subscription subscription;

        @Override public CompletionStage<byte[]> getBody() { return result; }
        @Override public void onSubscribe(Flow.Subscription subscription) {
            this.subscription = subscription;
            subscription.request(1);
        }
        @Override public void onNext(List<ByteBuffer> buffers) {
            if (result.isDone()) return;
            for (ByteBuffer buffer : buffers) {
                if (buffer.remaining() > MAX_DOCUMENT_BYTES - bytes.size()) {
                    subscription.cancel();
                    result.completeExceptionally(new IOException("Metadata exceeds the size limit."));
                    return;
                }
                byte[] chunk = new byte[buffer.remaining()];
                buffer.get(chunk);
                bytes.writeBytes(chunk);
            }
            subscription.request(1);
        }
        @Override public void onError(Throwable throwable) { result.completeExceptionally(throwable); }
        @Override public void onComplete() { result.complete(bytes.toByteArray()); }
    }
}
