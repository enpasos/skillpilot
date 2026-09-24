package com.skillpilot.backend.openai.nativev1.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.Flow;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class OpenAiNativeCimdValidatorTest {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String CLIENT = "https://chatgpt.com/oauth/codex/native-callback_123/client.json";
    private static final URI CLIENT_URI = URI.create(CLIENT);
    private static final String REDIRECT = "http://127.0.0.1/callback/native-callback_123";

    @Test
    void acceptsPinnedDocumentAndFetchesOnlyConfiguredClient() {
        var validator = new OpenAiNativeCimdValidator(CLIENT, MAPPER, requested -> {
            assertThat(requested).isEqualTo(CLIENT_URI);
            return response(document());
        });
        assertThatCode(validator::verify).doesNotThrowAnyException();
        assertThat(validator.clientId()).isEqualTo(CLIENT);
        assertThat(validator.redirectUri()).isEqualTo(REDIRECT);
    }

    @Test
    void acceptsSingularOrPluralPublicAuthenticationDeclaration() {
        ObjectNode plural = document();
        plural.remove("token_endpoint_auth_method");
        plural.putArray("token_endpoint_auth_methods_supported").add("none");
        assertThatCode(validator(response(plural))::verify).doesNotThrowAnyException();
        plural.put("token_endpoint_auth_method", "none");
        assertThatCode(validator(response(plural))::verify).doesNotThrowAnyException();
    }

    @Test
    void acceptsOfficialLocalhostMetadataAlternativeButNeverAuthorizesIt() {
        ObjectNode official = document();
        official.withArray("redirect_uris").add("http://localhost/callback/native-callback_123");
        var validator = validator(response(official));
        assertThatCode(validator::verify).doesNotThrowAnyException();
        assertThat(validator.validRedirect("http://localhost:12345/callback/native-callback_123")).isFalse();
        assertThat(validator.validRedirect("http://127.0.0.1:12345/callback/native-callback_123")).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "https://chatgpt.com/oauth/client.json",
            "https://chatgpt.com/oauth/codex/client.json", "https://chatgpt.com/oauth/codex//client.json",
            "https://chatgpt.com/oauth/codex/../client.json", "http://chatgpt.com/oauth/codex/id/client.json",
            "https://chatgpt.com:443/oauth/codex/id/client.json",
            "https://CHATGPT.COM/oauth/codex/id/client.json", "https://chatgpt.com./oauth/codex/id/client.json",
            "https://user@chatgpt.com/oauth/codex/id/client.json",
            "https://chatgpt.com.evil.example/oauth/codex/id/client.json",
            "https://chatgpt.com/oauth/codex/%69d/client.json",
            "https://chatgpt.com/oauth/codex/id/client.json?x=y",
            "https://chatgpt.com/oauth/codex/id/client.json#fragment",
            " https://chatgpt.com/oauth/codex/id/client.json"})
    void refusesNoncanonicalClientPinsWithoutFetching(String clientId) {
        assertThatThrownBy(() -> new OpenAiNativeCimdValidator(clientId, MAPPER, ignored -> {
            throw new AssertionError("Invalid pin must not trigger a fetch");
        })).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void redirectValidationAllowsOnlySelectedExplicitLoopbackPortAndDoesNotFetch() {
        var validator = new OpenAiNativeCimdValidator(CLIENT, MAPPER, ignored -> {
            throw new AssertionError("Redirect matching must not fetch metadata");
        });
        for (int port : List.of(1, 1023, 1024, 43210, 65535)) {
            assertThat(validator.validRedirect("http://127.0.0.1:" + port + "/callback/native-callback_123"))
                    .isTrue();
        }
        assertThat(validator.validRedirect(null)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "http://127.0.0.1/callback/native-callback_123",
            "http://127.0.0.1:0/callback/native-callback_123", "http://127.0.0.1:65536/callback/native-callback_123",
            "http://127.0.0.1:080/callback/native-callback_123", "http://127.0.0.1:-1/callback/native-callback_123",
            "http://localhost:43210/callback/native-callback_123", "http://[::1]:43210/callback/native-callback_123",
            "http://127.0.0.2:43210/callback/native-callback_123", "http://127.1:43210/callback/native-callback_123",
            "https://127.0.0.1:43210/callback/native-callback_123", "HTTP://127.0.0.1:43210/callback/native-callback_123",
            "http://user@127.0.0.1:43210/callback/native-callback_123",
            "http://127.0.0.1:43210/callback/native-callback_123?x=y",
            "http://127.0.0.1:43210/callback/native-callback_123#fragment",
            "http://127.0.0.1:43210/callback/native-callback_123?",
            "http://127.0.0.1:43210/callback/native-callback_123/",
            "http://127.0.0.1:43210/callback/native-callback_124",
            "http://127.0.0.1:43210/callback/%6eative-callback_123",
            "http://127.0.0.1:43210/x/../callback/native-callback_123"})
    void rejectsRedirectVariants(String redirect) {
        assertThat(validator(response(document())).validRedirect(redirect)).isFalse();
    }

    @Test
    void rejectsIdentityNameAuthenticationAndRedirectConflicts() {
        ObjectNode wrongId = document();
        wrongId.put("client_id", "https://chatgpt.com/oauth/codex/other/client.json");
        fails(wrongId);
        for (String field : List.of("client_id", "client_name", "token_endpoint_auth_method", "redirect_uris")) {
            ObjectNode missing = document();
            missing.remove(field);
            fails(missing);
        }
        ObjectNode blankName = document();
        blankName.put("client_name", " ");
        fails(blankName);
        ObjectNode wrongMethod = document();
        wrongMethod.put("token_endpoint_auth_method", "client_secret_basic");
        wrongMethod.putArray("token_endpoint_auth_methods_supported").add("none");
        fails(wrongMethod);
        ObjectNode noNone = document();
        noNone.putArray("token_endpoint_auth_methods_supported").add("private_key_jwt");
        fails(noNone);
        for (String redirect : List.of("http://localhost/callback/native-callback_123",
                "http://127.0.0.1:1234/callback/native-callback_123", "http://127.0.0.1/callback/other")) {
            ObjectNode wrongRedirect = document();
            wrongRedirect.putArray("redirect_uris").add(redirect);
            fails(wrongRedirect);
        }
        ObjectNode extraRedirect = document();
        extraRedirect.withArray("redirect_uris").add("https://evil.example/callback");
        fails(extraRedirect);
        ObjectNode duplicateRedirect = document();
        duplicateRedirect.withArray("redirect_uris").add(REDIRECT);
        fails(duplicateRedirect);
        ObjectNode duplicateMethod = document();
        duplicateMethod.putArray("token_endpoint_auth_methods_supported").add("none").add("none");
        fails(duplicateMethod);
    }

    @Test
    void rejectsTransportErrorsRedirectsAndUnboundedOrNonJsonBodies() {
        byte[] valid = bytes(document());
        for (int status : List.of(201, 204, 302, 401, 403, 404, 500)) {
            fails(new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, CLIENT_URI, status, "application/json", valid));
        }
        URI other = URI.create("https://chatgpt.com/oauth/codex/other/client.json");
        fails(new OpenAiNativeCimdValidator.MetadataResponse(other, CLIENT_URI, 200, "application/json", valid));
        fails(new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, other, 200, "application/json", valid));
        fails(new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, CLIENT_URI, 200, "text/json", valid));
        fails(new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, CLIENT_URI, 200, null, valid));
        fails(new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, CLIENT_URI, 200, "application/json", null));
        fails(response(new byte[0]));
        fails(response(new byte[OpenAiNativeCimdValidator.MAX_DOCUMENT_BYTES + 1]));
        fails((OpenAiNativeCimdValidator.MetadataResponse) null);
    }

    @ParameterizedTest
    @ValueSource(strings = {"[]", "null", "true", "{", "{}{}",
            "{\"client_id\":\"wrong\",\"client_id\":\"https://chatgpt.com/oauth/codex/native-callback_123/client.json\"}"})
    void rejectsInvalidJsonAndDuplicateKeys(String json) {
        fails(response(json.getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void positiveCacheExpiresAndNeverReusesStaleSuccessOnFailure() {
        var clock = new MutableClock();
        var count = new AtomicInteger();
        var mode = new AtomicReference<>(response(document()));
        var validator = new OpenAiNativeCimdValidator(CLIENT, MAPPER, ignored -> {
            count.incrementAndGet();
            return mode.get();
        }, clock);
        assertThat(validator.hasVerifiedMetadata()).isFalse();
        assertThat(count.get()).isZero();
        validator.verify();
        assertThat(validator.hasVerifiedMetadata()).isTrue();
        assertThat(count.get()).isEqualTo(1);
        clock.advance(Duration.ofMinutes(5).minusSeconds(1));
        assertThat(validator.hasVerifiedMetadata()).isTrue();
        assertThat(count.get()).isEqualTo(1);
        validator.verify();
        assertThat(count.get()).isEqualTo(1);
        mode.set(response("{}".getBytes(StandardCharsets.UTF_8)));
        clock.advance(Duration.ofSeconds(1));
        assertThat(validator.hasVerifiedMetadata()).isFalse();
        assertThat(count.get()).isEqualTo(1);
        assertThatThrownBy(validator::verify).isInstanceOf(IllegalStateException.class);
        assertThat(validator.hasVerifiedMetadata()).isFalse();
        assertThat(count.get()).isEqualTo(2);
        mode.set(response(document()));
        clock.advance(Duration.ofSeconds(29));
        assertThat(validator.hasVerifiedMetadata()).isFalse();
        assertThat(count.get()).isEqualTo(2);
        assertThatThrownBy(validator::verify).isInstanceOf(IllegalStateException.class);
        assertThat(count.get()).isEqualTo(2);
        clock.advance(Duration.ofSeconds(1));
        assertThat(validator.hasVerifiedMetadata()).isFalse();
        assertThat(count.get()).isEqualTo(2);
        assertThatCode(validator::verify).doesNotThrowAnyException();
        assertThat(validator.hasVerifiedMetadata()).isTrue();
        assertThat(count.get()).isEqualTo(3);
    }

    @Test
    void retrievalFailureIsNegativelyCachedAndInterruptIsPreserved() {
        var count = new AtomicInteger();
        var clock = new MutableClock();
        var validator = new OpenAiNativeCimdValidator(CLIENT, MAPPER, ignored -> {
            count.incrementAndGet();
            throw new IOException("transport unavailable");
        }, clock);
        assertThatThrownBy(validator::verify).hasCauseInstanceOf(IOException.class);
        assertThatThrownBy(validator::verify).hasCauseInstanceOf(IOException.class);
        assertThat(count.get()).isEqualTo(1);
        clock.advance(Duration.ofSeconds(30));
        assertThatThrownBy(validator::verify).hasCauseInstanceOf(IOException.class);
        assertThat(count.get()).isEqualTo(2);

        var interrupted = new OpenAiNativeCimdValidator(CLIENT, MAPPER, ignored -> {
            throw new InterruptedException("stop");
        });
        try {
            assertThatThrownBy(interrupted::verify).hasCauseInstanceOf(InterruptedException.class);
            assertThat(Thread.currentThread().isInterrupted()).isTrue();
        } finally {
            Thread.interrupted();
        }
    }

    @Test
    void limitsBodyWhileStreamingAcrossChunksBeforeBufferingExcessBytes() {
        var subscriber = new OpenAiNativeCimdValidator.BoundedBodySubscriber();
        var subscription = new TestSubscription();
        subscriber.onSubscribe(subscription);
        subscriber.onNext(List.of(ByteBuffer.wrap(new byte[OpenAiNativeCimdValidator.MAX_DOCUMENT_BYTES - 1])));
        subscriber.onNext(List.of(ByteBuffer.wrap(new byte[1])));
        assertThat(subscription.cancelled).isFalse();
        subscriber.onNext(List.of(ByteBuffer.wrap(new byte[1])));
        assertThat(subscription.cancelled).isTrue();
        assertThatThrownBy(() -> subscriber.getBody().toCompletableFuture().join())
                .hasCauseInstanceOf(IOException.class);

        var exact = new OpenAiNativeCimdValidator.BoundedBodySubscriber();
        exact.onSubscribe(new TestSubscription());
        exact.onNext(List.of(ByteBuffer.wrap(new byte[OpenAiNativeCimdValidator.MAX_DOCUMENT_BYTES])));
        exact.onComplete();
        assertThat(exact.getBody().toCompletableFuture().join()).hasSize(OpenAiNativeCimdValidator.MAX_DOCUMENT_BYTES);
    }

    @Test
    void publicDnsBoundaryRejectsLocalSpecialAndDocumentationAddresses() throws Exception {
        for (String address : List.of("0.0.0.0", "10.0.0.1", "127.0.0.1", "169.254.1.1",
                "172.16.0.1", "192.168.1.1", "100.64.0.1", "198.18.0.1", "224.0.0.1",
                "192.0.0.1", "192.0.2.1", "198.51.100.1", "203.0.113.1",
                "::", "::1", "fe80::1", "fc00::1", "2001:db8::1", "2001::1")) {
            assertThat(OpenAiNativeCimdValidator.isPublicAddress(InetAddress.getByName(address)))
                    .as(address).isFalse();
        }
        for (String address : List.of("8.8.8.8", "104.18.1.1", "2606:4700::1111")) {
            assertThat(OpenAiNativeCimdValidator.isPublicAddress(InetAddress.getByName(address)))
                    .as(address).isTrue();
        }
    }

    private static ObjectNode document() {
        ObjectNode document = MAPPER.createObjectNode();
        document.put("client_id", CLIENT);
        document.put("client_name", "ChatGPT");
        document.put("token_endpoint_auth_method", "none");
        document.putArray("redirect_uris").add(REDIRECT);
        return document;
    }

    private static byte[] bytes(ObjectNode document) {
        try { return MAPPER.writeValueAsBytes(document); }
        catch (IOException exception) { throw new AssertionError(exception); }
    }

    private static OpenAiNativeCimdValidator.MetadataResponse response(ObjectNode document) {
        return response(bytes(document));
    }

    private static OpenAiNativeCimdValidator.MetadataResponse response(byte[] bytes) {
        return new OpenAiNativeCimdValidator.MetadataResponse(CLIENT_URI, CLIENT_URI, 200,
                "application/json; charset=utf-8", bytes);
    }

    private static OpenAiNativeCimdValidator validator(OpenAiNativeCimdValidator.MetadataResponse response) {
        return new OpenAiNativeCimdValidator(CLIENT, MAPPER, ignored -> response);
    }

    private static void fails(ObjectNode document) { fails(response(document)); }

    private static void fails(OpenAiNativeCimdValidator.MetadataResponse response) {
        assertThatThrownBy(validator(response)::verify).isInstanceOf(IllegalStateException.class);
    }

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-09-24T10:00:00Z");
        void advance(Duration duration) { now = now.plus(duration); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    private static final class TestSubscription implements Flow.Subscription {
        private boolean cancelled;
        @Override public void request(long count) {}
        @Override public void cancel() { cancelled = true; }
    }
}
