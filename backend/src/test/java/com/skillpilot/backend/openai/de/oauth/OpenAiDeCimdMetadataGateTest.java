package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

class OpenAiDeCimdMetadataGateTest {
    @Test void metadataOutageIncompatibilityRecoveryAndExpiryAffectOnlyJwtAndNeverFetchDuringLookup() throws Exception {
        var properties = properties();
        var clock = new MutableClock();
        var calls = new AtomicInteger();
        var responseMode = new AtomicInteger(503);
        var validator = new OpenAiDeCimdMetadataValidator(new ObjectMapper(), uri -> {
            calls.incrementAndGet();
            String callback = responseMode.get() == 400 ? "https://chatgpt.com/connector/oauth/other" : properties.getOauth().getRedirectUris().getFirst();
            String body = """
                    {"client_id":"%s","client_name":"Synthetic fixture","redirect_uris":["%s"],
                    "jwks_uri":"https://chatgpt.com/oauth/jwks.json","token_endpoint_auth_methods_supported":["none","private_key_jwt"]}
                    """.formatted(uri, callback);
            return new OpenAiDeCimdMetadataValidator.MetadataResponse(uri, uri, responseMode.get() == 503 ? 503 : 200,
                    "application/json", body.getBytes(StandardCharsets.UTF_8));
        });
        try (var gate = new OpenAiDeCimdMetadataGate(() -> validator.validate(properties), clock, Duration.ofSeconds(1))) {
            var delegate = new InMemoryRegisteredClientRepository(RegisteredClient.withId("foreign").clientId("foreign")
                    .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS).build());
            var clients = new OpenAiDeRegisteredClientRepository(delegate, properties, gate::isReady);
            for (var profile : OpenAiDeClientProfiles.configurations(properties)) {
                new OpenAiDeOAuthConfiguration().registerOpenAiDeClient(clients, profile).afterPropertiesSet();
            }
            gate.initialRefresh();
            assertThat(gate.isReady()).isFalse();
            assertThat(clients.findByClientId(properties.getOauth().getClientId())).isNull();
            assertThat(clients.findByClientId("synthetic-old-basic")).isNotNull();
            assertThat(calls).hasValue(1);
            responseMode.set(200);
            for (int i = 0; i < 20; i++) { gate.retry(); clients.findByClientId(properties.getOauth().getClientId()); }
            assertThat(calls).hasValue(1); // Polling/runtime calls cannot bypass retry policy or perform network I/O.
            clock.advance(Duration.ofSeconds(31));
            gate.initialRefresh();
            assertThat(gate.isReady()).isTrue();
            assertThat(clients.findByClientId(properties.getOauth().getClientId())).isNotNull();
            assertThat(calls).hasValue(2);
            clock.advance(Duration.ofMinutes(5));
            assertThat(gate.isReady()).isFalse();
            assertThat(clients.findByClientId(properties.getOauth().getClientId())).isNull();
            assertThat(clients.findByClientId("synthetic-old-basic")).isNotNull();
            responseMode.set(400); // Valid HTTP, incompatible published callback.
            gate.initialRefresh();
            assertThat(gate.isReady()).isFalse();
            assertThat(calls).hasValue(3);
        }
    }

    @Test void aHungFetchDoesNotBlockStartupOrSpawnAnUnboundedRetryQueue() throws Exception {
        var clock = new MutableClock();
        var started = new CountDownLatch(1);
        var release = new CountDownLatch(1);
        var calls = new AtomicInteger();
        try (var gate = new OpenAiDeCimdMetadataGate(() -> {
            calls.incrementAndGet(); started.countDown();
            boolean done = false;
            while (!done) {
                try { done = release.await(100, TimeUnit.MILLISECONDS); }
                catch (InterruptedException ignored) { /* Deliberately simulate a non-interruptible resolver. */ }
            }
        }, clock, Duration.ofMillis(50))) {
            long before = System.nanoTime();
            gate.initialRefresh();
            assertThat(Duration.ofNanos(System.nanoTime() - before)).isLessThan(Duration.ofSeconds(1));
            assertThat(started.await(1, TimeUnit.SECONDS)).isTrue();
            assertThat(gate.isReady()).isFalse();
            for (int i = 0; i < 20; i++) { clock.advance(Duration.ofSeconds(31)); gate.retry(); }
            assertThat(calls).hasValue(1);
        } finally {
            release.countDown();
        }
    }

    @Test void gateDeadlineCannotBeDisabledOrExtendedBeyondItsHardBound() {
        for (Duration budget : List.of(Duration.ZERO, Duration.ofMillis(-1), Duration.ofSeconds(7))) {
            assertThatThrownBy(() -> new OpenAiDeCimdMetadataGate(() -> {}, Clock.systemUTC(), budget))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

    private static OpenAiDeProperties properties() {
        var properties = new OpenAiDeProperties();
        properties.setServerBuild("synthetic-metadata-gate");
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setEnabled(true);
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().setClientId("https://chatgpt.com/oauth/test/client.json");
        properties.getOauth().setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        properties.getOauth().setClientAssertionAudience("https://skillpilot.com/api/openai/v1/oauth2/token");
        properties.getOauth().setRedirectUris(List.of("https://chatgpt.com/connector/oauth/current"));
        var basic = properties.getOauth().getTransitionalBasic();
        basic.setEnabled(true); basic.setClientId("synthetic-old-basic");
        basic.setClientSecret("synthetic-gate-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        basic.setRedirectUris(List.of("https://chatgpt.com/connector/oauth/previous"));
        return properties;
    }

    private static final class MutableClock extends Clock {
        private Instant value = Instant.parse("2026-09-11T00:00:00Z");
        void advance(Duration duration) { value = value.plus(duration); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return value; }
    }
}
