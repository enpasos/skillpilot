package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

class OpenAiDeJwtClientAssertionValidatorTest {

    private static final Instant NOW = Instant.parse("2026-07-26T10:00:00Z");

    @Test
    void consumesEachValidAssertionIdExactlyOnce() {
        OpenAiDeJwtClientAssertionValidator validator =
                new OpenAiDeJwtClientAssertionValidator(10, Clock.fixed(NOW, ZoneOffset.UTC));
        Jwt assertion = assertion("assertion-1", "kid-1", NOW.plusSeconds(60));

        assertThat(validator.validate(assertion).hasErrors()).isFalse();
        assertThat(validator.validate(assertion).hasErrors()).isTrue();
    }

    @Test
    void requiresKidJtiAndExpiration() {
        OpenAiDeJwtClientAssertionValidator validator =
                new OpenAiDeJwtClientAssertionValidator(10, Clock.fixed(NOW, ZoneOffset.UTC));

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
    void expiresReplayEntriesAndFailsClosedAtCapacity() {
        OpenAiDeJwtClientAssertionValidator validator =
                new OpenAiDeJwtClientAssertionValidator(1, Clock.fixed(NOW, ZoneOffset.UTC));

        assertThat(validator.validate(assertion("expired", "kid-1", NOW.minusSeconds(1))).hasErrors())
                .isFalse();
        assertThat(validator.validate(assertion("fresh", "kid-1", NOW.plusSeconds(60))).hasErrors())
                .isFalse();
        assertThat(validator.validate(assertion("second", "kid-1", NOW.plusSeconds(60))).hasErrors())
                .isTrue();
    }

    private static Jwt assertion(String jti, String kid, Instant expiresAt) {
        return Jwt.withTokenValue(jti)
                .header("alg", "RS256")
                .header("kid", kid)
                .issuer("client")
                .subject("client")
                .audience(java.util.List.of("https://skillpilot.test/api/openai/de"))
                .jti(jti)
                .issuedAt(expiresAt.minusSeconds(60))
                .expiresAt(expiresAt)
                .build();
    }
}
