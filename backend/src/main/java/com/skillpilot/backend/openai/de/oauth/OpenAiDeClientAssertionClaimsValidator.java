package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics.Reason;
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
            if (!clientId.equals(jwt.getClaimAsString("iss")) || !clientId.equals(jwt.getSubject())) {
                return invalid(Reason.JWT_IDENTITY_REJECTED);
            }
            if (!List.of(audience).equals(jwt.getAudience())) {
                return invalid(audienceMismatchReason(jwt.getAudience()));
            }
            if (expires == null || !expires.plus(skew).isAfter(now)
                    || expires.isAfter(now.plus(maxLifetime).plus(skew))
                    || (issued != null && (issued.isAfter(now.plus(skew)) || !expires.isAfter(issued)
                        || expires.isAfter(issued.plus(maxLifetime))))
                    || (notBefore != null && (notBefore.isAfter(now.plus(skew)) || !expires.isAfter(notBefore)))) {
                return invalid(Reason.JWT_TIME_REJECTED);
            }
            if (jwt.getHeaders().containsKey("jku") || jwt.getHeaders().containsKey("jwk")
                    || jwt.getHeaders().containsKey("x5u")) {
                return invalid(Reason.JWT_HEADER_REJECTED);
            }
            return OAuth2TokenValidatorResult.success();
        } catch (RuntimeException exception) {
            return invalid(Reason.JWT_DECODE_REJECTED);
        }
    }

    private Reason audienceMismatchReason(List<String> actual) {
        // Configuration already pins exactly the issuer or its token endpoint. These
        // bounded labels identify only the other known form, never an arbitrary URL.
        String tokenSuffix = "/oauth2/token";
        String issuer = audience.endsWith(tokenSuffix)
                ? audience.substring(0, audience.length() - tokenSuffix.length()) : audience;
        if (List.of(issuer).equals(actual)) {
            return Reason.JWT_AUDIENCE_USES_ISSUER;
        }
        if (List.of(issuer + tokenSuffix).equals(actual)) {
            return Reason.JWT_AUDIENCE_USES_TOKEN_ENDPOINT;
        }
        return Reason.JWT_AUDIENCE_REJECTED;
    }

    private static OAuth2TokenValidatorResult invalid(Reason reason) {
        OAuthProfileDiagnostics.markReasonIfAbsent(reason);
        return INVALID;
    }
}
