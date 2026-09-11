package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.oauth.JdbcOAuthClientAssertionReplayStore;
import com.skillpilot.backend.oauth.OAuthClientSecurityTestDatabase;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.security.oauth2.jwt.Jwt;

class OpenAiDeJwtClientAssertionValidatorTest {

    private static final Instant NOW = Instant.parse("2026-07-26T10:00:00Z");

    @Test
    void consumesEachValidAssertionIdExactlyOnce() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        OpenAiDeJwtClientAssertionValidator validator = validator(db, NOW, 10);
        Jwt assertion = assertion("assertion-1", "kid-1", NOW.plusSeconds(60));

        assertThat(validator.validate(assertion).hasErrors()).isFalse();
        assertThat(validator(db, NOW, 10).validate(assertion).hasErrors()).isTrue();
    }

    @Test
    void requiresKidJtiAndExpiration() throws Exception {
        OpenAiDeJwtClientAssertionValidator validator = validator(OAuthClientSecurityTestDatabase.create(), NOW, 10);

        Jwt missingKid = Jwt.withTokenValue("missing-kid")
                .header("alg", "RS256")
                .subject("client")
                .jti("jti-1")
                .expiresAt(NOW.plusSeconds(60))
                .build();
        Jwt missingJti = Jwt.withTokenValue("missing-jti")
                .header("alg", "RS256")
                .header("kid", "kid-1")
                .subject("client")
                .expiresAt(NOW.plusSeconds(60))
                .build();
        Jwt missingExpiration = Jwt.withTokenValue("missing-exp")
                .header("alg", "RS256")
                .header("kid", "kid-1")
                .subject("client")
                .jti("jti-2")
                .build();

        assertThat(validator.validate(missingKid).hasErrors()).isTrue();
        assertThat(validator.validate(missingJti).hasErrors()).isTrue();
        assertThat(validator.validate(missingExpiration).hasErrors()).isTrue();
    }

    @Test
    void expiresReplayEntriesAndFailsClosedAtCapacity() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        OpenAiDeJwtClientAssertionValidator validator = validator(db, NOW, 1);

        assertThat(validator.validate(assertion("expired", "kid-1", NOW.minusSeconds(31))).hasErrors())
                .isTrue();
        assertThat(validator.validate(assertion("fresh", "kid-1", NOW.plusSeconds(60))).hasErrors())
                .isFalse();
        assertThat(validator.validate(assertion("second", "kid-1", NOW.plusSeconds(60))).hasErrors())
                .isTrue();
    }

    @Test
    void replayStaysConsumedAfterExpiryAndAtClockToleranceBoundary() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var assertion = assertion("at-exp", "kid-1", NOW);
        assertThat(validator(db, NOW, 10).validate(assertion).hasErrors()).isFalse();
        assertThat(validator(db, NOW.plusSeconds(1), 10).validate(assertion).hasErrors()).isTrue();
        assertThat(validator(db, NOW.plusSeconds(30), 10).validate(assertion).hasErrors()).isTrue();
        assertThat(validator(db, NOW.plusSeconds(31), 10).validate(assertion).hasErrors()).isTrue();
    }

    @Test
    void storageOutageFailsClosedWithoutInMemoryFallback() {
        var store = mock(JdbcOAuthClientAssertionReplayStore.class);
        when(store.consume(anyString(), anyString(), any(), anyInt()))
                .thenThrow(new DataAccessResourceFailureException("synthetic outage"));
        var validator = new OpenAiDeJwtClientAssertionValidator(store, 10, Duration.ofSeconds(30), Clock.fixed(NOW, ZoneOffset.UTC));
        assertThat(validator.validate(assertion("one", "kid", NOW.plusSeconds(60))).hasErrors()).isTrue();
    }

    private static OpenAiDeJwtClientAssertionValidator validator(OAuthClientSecurityTestDatabase db, Instant now, int capacity) {
        var clock = Clock.fixed(now, ZoneOffset.UTC);
        var store = new JdbcOAuthClientAssertionReplayStore(db.jdbc(), db.transactions(), clock);
        return new OpenAiDeJwtClientAssertionValidator(store, capacity, Duration.ofSeconds(30), clock);
    }

    private static Jwt assertion(String jti, String kid, Instant expiresAt) {
        return Jwt.withTokenValue(jti)
                .header("alg", "RS256")
                .header("kid", kid)
                .issuer("client")
                .subject("client")
                .audience(java.util.List.of("https://skillpilot.test/api/openai/v1"))
                .jti(jti)
                .issuedAt(expiresAt.minusSeconds(60))
                .expiresAt(expiresAt)
                .build();
    }
}
