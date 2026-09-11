package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.oauth.JdbcOAuthClientAssertionReplayStore;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import org.springframework.dao.DataAccessException;
import org.springframework.transaction.TransactionException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Enforces assertion properties that are security-critical for SkillPilot but
 * are not part of Spring Authorization Server's default client-assertion
 * validator.
 *
 * <p>The default validator must run first. This validator then requires a key
 * identifier and a unique JWT ID and consumes the JWT ID exactly once for the
 * assertion lifetime.</p>
 */
final class OpenAiDeJwtClientAssertionValidator implements OAuth2TokenValidator<Jwt> {

    private final int maxEntries;
    private final Clock clock;
    private final Duration clockSkew;
    private final JdbcOAuthClientAssertionReplayStore replayStore;

    OpenAiDeJwtClientAssertionValidator(
            JdbcOAuthClientAssertionReplayStore replayStore, int maxEntries, Duration clockSkew) {
        this(replayStore, maxEntries, clockSkew, Clock.systemUTC());
    }

    OpenAiDeJwtClientAssertionValidator(
            JdbcOAuthClientAssertionReplayStore replayStore, int maxEntries, Duration clockSkew, Clock clock) {
        if (maxEntries <= 0) {
            throw new IllegalArgumentException("maxEntries must be positive");
        }
        this.maxEntries = maxEntries;
        this.clock = Objects.requireNonNull(clock);
        this.clockSkew = Objects.requireNonNull(clockSkew);
        if (clockSkew.isNegative() || clockSkew.compareTo(Duration.ofMinutes(2)) > 0) {
            throw new IllegalArgumentException("Assertion clock skew must be between zero and two minutes.");
        }
        this.replayStore = Objects.requireNonNull(replayStore);
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        Object kid = jwt.getHeaders().get("kid");
        if (!(kid instanceof String kidValue) || kidValue.isBlank() || kidValue.length() > 256) {
            return failure("The private_key_jwt assertion must contain a non-empty kid header.");
        }
        if (jwt.getId() == null || jwt.getId().isBlank() || jwt.getId().length() > 512) {
            return failure("The private_key_jwt assertion must contain a non-empty jti claim.");
        }
        if (jwt.getExpiresAt() == null) {
            return failure("The private_key_jwt assertion must contain an exp claim.");
        }
        if (jwt.getSubject() == null || jwt.getSubject().isBlank() || jwt.getSubject().length() > 2048) {
            return failure("The private_key_jwt assertion must identify its client.");
        }

        Instant now = clock.instant();
        Instant retainUntil;
        try {
            retainUntil = jwt.getExpiresAt().plus(clockSkew);
        } catch (RuntimeException invalidTime) {
            return failure("Invalid private_key_jwt expiration.");
        }
        if (retainUntil.isBefore(now)) {
            return failure("The private_key_jwt assertion has expired.");
        }
        try {
            return replayStore.consume(jwt.getSubject(), jwt.getId(), retainUntil, maxEntries)
                    ? OAuth2TokenValidatorResult.success()
                    : failure("The private_key_jwt assertion cannot be consumed.");
        } catch (DataAccessException | TransactionException unavailable) {
            // Storage failure is an authentication failure, never an in-memory fallback.
            return failure("The private_key_jwt replay protection is unavailable.");
        }
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                OAuth2ErrorCodes.INVALID_CLIENT,
                description,
                null));
    }
}
