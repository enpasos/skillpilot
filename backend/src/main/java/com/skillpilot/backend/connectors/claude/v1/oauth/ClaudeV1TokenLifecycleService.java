package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Revocation for the learner-free Claude v1 app authorization.
 *
 * <p>Revocation removes only the selected OAuth authorization. It never selects, extends or revokes
 * a separate 24-hour learning session and never affects another provider lane.</p>
 */
@Service
@ConditionalOnClaudeV1Enabled
public class ClaudeV1TokenLifecycleService {

    private final OAuth2AuthorizationService authorizationService;

    public ClaudeV1TokenLifecycleService(
            // Qualified explicitly: an unqualified OAuth2AuthorizationService could bind another
            // provider lane's service and revoke against the wrong token store.
            @Qualifier("claudeV1AuthorizationService") OAuth2AuthorizationService authorizationService) {
        this.authorizationService = Objects.requireNonNull(authorizationService, "authorizationService");
    }

    @Transactional
    public void revokeToken(String token, String tokenTypeHint) {
        if (token == null || token.isBlank()) {
            return;
        }

        OAuth2TokenType primaryType = "refresh_token".equalsIgnoreCase(tokenTypeHint)
                ? OAuth2TokenType.REFRESH_TOKEN
                : OAuth2TokenType.ACCESS_TOKEN;

        OAuth2Authorization authorization = authorizationService.findByToken(token, primaryType);
        if (authorization == null) {
            OAuth2TokenType fallbackType = primaryType.equals(OAuth2TokenType.ACCESS_TOKEN)
                    ? OAuth2TokenType.REFRESH_TOKEN
                    : OAuth2TokenType.ACCESS_TOKEN;
            authorization = authorizationService.findByToken(token, fallbackType);
        }
        if (authorization == null) {
            // RFC 7009: an unknown token is not an error.
            return;
        }

        authorizationService.remove(authorization);
    }
}
