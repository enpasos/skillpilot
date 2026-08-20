package com.skillpilot.backend.connectors.claude.v1.oauth;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;

/** Issues a fresh opaque refresh token for the trusted public CIMD clients. */
final class ClaudeV1PublicRefreshTokenGenerator implements OAuth2TokenGenerator<OAuth2RefreshToken> {

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    public OAuth2RefreshToken generate(OAuth2TokenContext context) {
        if (!OAuth2TokenType.REFRESH_TOKEN.equals(context.getTokenType())) {
            return null;
        }
        byte[] entropy = new byte[72];
        secureRandom.nextBytes(entropy);
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(
                context.getRegisteredClient().getTokenSettings().getRefreshTokenTimeToLive());
        return new OAuth2RefreshToken(
                Base64.getUrlEncoder().withoutPadding().encodeToString(entropy),
                issuedAt,
                expiresAt);
    }
}
