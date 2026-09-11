package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.nimbusds.jose.KeySourceException;
import com.nimbusds.jose.jwk.JWKMatcher;
import com.nimbusds.jose.jwk.JWKSelector;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;

class OpenAiDePinnedJwkSourceTest {
    private static final URI PIN = URI.create("https://chatgpt.com/oauth/jwks.json");

    @Test void cachesKnownKeysAndBoundsUnknownKidRefreshWhileAllowingRotation() throws Exception {
        var first = new RSAKeyGenerator(2048).keyID("old").generate().toPublicJWK();
        var rotated = new RSAKeyGenerator(2048).keyID("new").generate().toPublicJWK();
        var published = new AtomicReference<>(new JWKSet(first));
        var requests = new AtomicInteger();
        var clock = new MutableClock();
        var source = new OpenAiDePinnedJwkSource(PIN, uri -> {
            assertThat(uri).isEqualTo(PIN);
            requests.incrementAndGet();
            return response(published.get().toString());
        }, clock);
        assertThat(source.get(selector("old"), null)).containsExactly(first);
        assertThat(source.get(selector("old"), null)).containsExactly(first);
        published.set(new JWKSet(rotated));
        for (int i = 0; i < 100; i++) {
            assertThat(source.get(selector("unknown-" + i), null)).isEmpty();
        }
        assertThat(requests).hasValue(1);
        clock.now = clock.now.plusSeconds(5);
        assertThat(source.get(selector("new"), null)).containsExactly(rotated);
        assertThat(requests).hasValue(2);
        assertThat(source.get(selector("old"), null)).isEmpty();
    }

    @Test void expiredKeysFailClosedAndFetchFailuresAreRateLimited() throws Exception {
        var key = new RSAKeyGenerator(2048).keyID("key").generate().toPublicJWK();
        var requests = new AtomicInteger();
        var clock = new MutableClock();
        var source = new OpenAiDePinnedJwkSource(PIN, uri -> {
            if (requests.incrementAndGet() > 1) { throw new IOException("synthetic unavailable"); }
            return response(new JWKSet(key).toString());
        }, clock);
        assertThat(source.get(selector("key"), null)).hasSize(1);
        clock.now = clock.now.plusSeconds(300);
        for (int i = 0; i < 10; i++) {
            assertThatThrownBy(() -> source.get(selector("key"), null)).isInstanceOf(KeySourceException.class);
        }
        assertThat(requests).hasValue(2);
    }

    @Test void rejectsPrivateDuplicateAndMalformedKeyDocuments() throws Exception {
        var key = new RSAKeyGenerator(2048).keyID("key").generate();
        for (String json : new String[] { "{}", "{\"keys\":[]}",
                new JWKSet(key).toString(false),
                new JWKSet(java.util.List.of(key.toPublicJWK(), key.toPublicJWK())).toString() }) {
            var source = new OpenAiDePinnedJwkSource(PIN, uri -> response(json), new MutableClock());
            assertThatThrownBy(() -> source.get(selector("key"), null)).isInstanceOf(KeySourceException.class);
        }
    }

    @Test void trustsOnlyPinnedOfficialHttpsDocumentsAndPublicAddresses() throws Exception {
        for (String url : new String[] {"http://chatgpt.com/oauth/jwks.json", "https://127.0.0.1/oauth/jwks.json",
                "https://chatgpt.com.evil.test/oauth/jwks.json", "https://chatgpt.com:8443/oauth/jwks.json",
                "https://chatgpt.com/oauth/jwks.json?redirect=evil", "https://user@chatgpt.com/oauth/jwks.json",
                "https://chatgpt.com/oauth/../private"}) {
            assertThatThrownBy(() -> OpenAiDeTrustedJsonRetriever.requireTrustedUri(URI.create(url)))
                    .isInstanceOf(IllegalStateException.class);
        }
        for (String address : new String[] {"127.0.0.1", "10.0.0.1", "169.254.169.254", "100.64.0.1",
                "172.16.0.1", "192.168.0.1", "198.18.0.1", "::1", "fc00::1", "fe80::1"}) {
            assertThat(OpenAiDeTrustedJsonRetriever.isPublicAddress(InetAddress.getByName(address))).isFalse();
        }
        assertThat(OpenAiDeTrustedJsonRetriever.isPublicAddress(InetAddress.getByName("8.8.8.8"))).isTrue();
    }

    private static JWKSelector selector(String kid) {
        return new JWKSelector(new JWKMatcher.Builder().keyID(kid).build());
    }
    private static OpenAiDeCimdMetadataValidator.MetadataResponse response(String json) {
        return new OpenAiDeCimdMetadataValidator.MetadataResponse(PIN, PIN, 200, "application/json",
                json.getBytes(StandardCharsets.UTF_8));
    }
    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-09-11T12:00:00Z");
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }
}
