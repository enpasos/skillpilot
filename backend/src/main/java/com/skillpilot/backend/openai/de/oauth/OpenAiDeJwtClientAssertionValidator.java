package com.skillpilot.backend.openai.de.oauth;

import java.time.Clock;
import java.time.Instant;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
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
    private final Map<String, Instant> seenAssertions = new LinkedHashMap<>();

    OpenAiDeJwtClientAssertionValidator(int maxEntries) {
        this(maxEntries, Clock.systemUTC());
    }

    OpenAiDeJwtClientAssertionValidator(int maxEntries, Clock clock) {
        if (maxEntries <= 0) {
            throw new IllegalArgumentException("maxEntries must be positive");
        }
        this.maxEntries = maxEntries;
        this.clock = clock;
    }

    @Override
    public synchronized OAuth2TokenValidatorResult validate(Jwt jwt) {
        Object kid = jwt.getHeaders().get("kid");
        if (!(kid instanceof String kidValue) || kidValue.isBlank()) {
            return failure("The private_key_jwt assertion must contain a non-empty kid header.");
        }
        if (jwt.getId() == null || jwt.getId().isBlank()) {
            return failure("The private_key_jwt assertion must contain a non-empty jti claim.");
        }
        if (jwt.getExpiresAt() == null) {
            return failure("The private_key_jwt assertion must contain an exp claim.");
        }

        Instant now = clock.instant();
        for (Iterator<Map.Entry<String, Instant>> iterator = seenAssertions.entrySet().iterator();
                iterator.hasNext(); ) {
            if (!iterator.next().getValue().isAfter(now)) {
                iterator.remove();
            }
        }

        String replayKey = jwt.getSubject() + '\0' + jwt.getId();
        if (seenAssertions.containsKey(replayKey)) {
            return failure("The private_key_jwt assertion has already been used.");
        }
        if (seenAssertions.size() >= maxEntries) {
            return failure("The private_key_jwt replay cache is at capacity.");
        }
        seenAssertions.put(replayKey, jwt.getExpiresAt());
        return OAuth2TokenValidatorResult.success();
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                OAuth2ErrorCodes.INVALID_CLIENT,
                description,
                null));
    }
}
