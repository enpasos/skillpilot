package com.skillpilot.backend.claude.oauth;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenContext;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;

/**
 * Refresh-token generator for the explicitly registered Claude CIMD public
 * client.
 *
 * <p>Spring Authorization Server intentionally suppresses refresh tokens for
 * public authorization-code clients. MCP OAuth 2.1 clients, including Claude,
 * require rotating refresh tokens instead. The surrounding authorization
 * server registers only the trusted Claude hosted client and configures
 * {@code reuseRefreshTokens(false)}, so a fresh opaque token is generated on
 * every successful refresh.</p>
 */
final class ClaudePublicRefreshTokenGenerator implements OAuth2TokenGenerator<OAuth2RefreshToken> {

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
        String tokenValue = Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
        return new OAuth2RefreshToken(tokenValue, issuedAt, expiresAt);
    }
}
