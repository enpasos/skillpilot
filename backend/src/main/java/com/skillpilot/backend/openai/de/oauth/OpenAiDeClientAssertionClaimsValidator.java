package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/** Deliberately does not use Spring's issuer-plus-endpoint audience concatenation. */
final class OpenAiDeClientAssertionClaimsValidator implements OAuth2TokenValidator<Jwt> {
    private static final OAuth2TokenValidatorResult INVALID = OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_client", "Invalid OpenAI client assertion claims.", null));
    private final String clientId;
    private final String audience;
    private final Duration skew;
    private final Duration maxLifetime;
    private final Clock clock;

    OpenAiDeClientAssertionClaimsValidator(OpenAiDeProperties properties, Clock clock) {
        this.clientId = properties.getOauth().getClientId();
        this.audience = properties.getOauth().getClientAssertionAudience();
        this.skew = properties.getOauth().getClientAssertionClockSkew();
        this.maxLifetime = properties.getOauth().getClientAssertionMaxLifetime();
        this.clock = clock;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        try {
            Instant now = clock.instant();
            Instant expires = jwt.getExpiresAt();
            Instant issued = jwt.getIssuedAt();
            Instant notBefore = jwt.getNotBefore();
            if (!clientId.equals(jwt.getClaimAsString("iss")) || !clientId.equals(jwt.getSubject())
                    || !List.of(audience).equals(jwt.getAudience())
                    || expires == null || !expires.plus(skew).isAfter(now)
                    || expires.isAfter(now.plus(maxLifetime).plus(skew))
                    || (issued != null && (issued.isAfter(now.plus(skew)) || !expires.isAfter(issued)
                        || expires.isAfter(issued.plus(maxLifetime))))
                    || (notBefore != null && (notBefore.isAfter(now.plus(skew)) || !expires.isAfter(notBefore)))
                    || jwt.getHeaders().containsKey("jku") || jwt.getHeaders().containsKey("jwk")
                    || jwt.getHeaders().containsKey("x5u")) {
                return INVALID;
            }
            return OAuth2TokenValidatorResult.success();
        } catch (RuntimeException exception) {
            return INVALID;
        }
    }
}
