package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import java.time.Instant;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Revocation and lifecycle maintenance for Claude v1 connections.
 *
 * <p>Revocation is scoped to one Claude v1 connection: its tokens, its open binding transactions
 * and its idempotency records. The canonical learner state and every other provider lane are left
 * untouched, so disconnecting Claude never ends a ChatGPT or WebGUI session.</p>
 */
@Service
@ConditionalOnClaudeV1Enabled
public class ClaudeV1TokenLifecycleService {

    private final OAuth2AuthorizationService authorizationService;
    private final ClaudeV1BindingService bindingService;
    private final ClaudeV1ConnectionRepository connectionRepository;
    private final ClaudeV1IdempotencyRepository idempotencyRepository;

    public ClaudeV1TokenLifecycleService(
            // Qualified explicitly: an unqualified OAuth2AuthorizationService could bind another
            // provider lane's service and revoke against the wrong token store.
            @Qualifier("claudeV1AuthorizationService") OAuth2AuthorizationService authorizationService,
            ClaudeV1BindingService bindingService,
            ClaudeV1ConnectionRepository connectionRepository,
            ClaudeV1IdempotencyRepository idempotencyRepository) {
        this.authorizationService = Objects.requireNonNull(authorizationService, "authorizationService");
        this.bindingService = Objects.requireNonNull(bindingService, "bindingService");
        this.connectionRepository = Objects.requireNonNull(connectionRepository, "connectionRepository");
        this.idempotencyRepository = Objects.requireNonNull(idempotencyRepository, "idempotencyRepository");
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

        String connectionId = authorization.getPrincipalName();
        authorizationService.remove(authorization);
        if (connectionId != null && !connectionId.isBlank()) {
            revokeConnection(connectionId);
        }
    }

    @Transactional
    public void revokeConnection(String connectionId) {
        if (connectionId == null || connectionId.isBlank()) {
            return;
        }
        bindingService.revokeConnection(connectionId);
        idempotencyRepository.deleteForConnection(connectionId);
    }

    /**
     * Reclaims expired binding transactions and idempotency records.
     *
     * <p>Invoked opportunistically rather than from a scheduler bean, which this lane is not
     * permitted to create.</p>
     */
    @Transactional
    public void performMaintenanceCleanup() {
        Instant now = Instant.now();
        connectionRepository.deleteExpiredBindingTransactions(now);
        idempotencyRepository.deleteExpired(now);
    }
}
