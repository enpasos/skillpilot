package com.skillpilot.backend.oauth;

import java.util.Objects;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** Serializes the complete code exchange, including Spring PKCE validation and token persistence. */
public final class OAuthAuthorizationCodeExchangeGuard implements AuthenticationProvider {
    private final AuthenticationProvider delegate;
    private final OAuth2AuthorizationService secured;
    private final OAuth2AuthorizationService raw;
    private final JdbcOperations jdbc;
    private final TransactionTemplate exchangeTransaction;
    public OAuthAuthorizationCodeExchangeGuard(AuthenticationProvider delegate, OAuth2AuthorizationService secured,
            JdbcOperations jdbc, PlatformTransactionManager manager) {
        this(delegate, secured, new JdbcOAuth2AuthorizationService(jdbc, new JdbcRegisteredClientRepository(jdbc)), jdbc, manager);
    }
    OAuthAuthorizationCodeExchangeGuard(AuthenticationProvider delegate, OAuth2AuthorizationService secured,
            OAuth2AuthorizationService raw, JdbcOperations jdbc, PlatformTransactionManager manager) {
        this.delegate = Objects.requireNonNull(delegate); this.secured = Objects.requireNonNull(secured);
        this.raw = Objects.requireNonNull(raw); this.jdbc = Objects.requireNonNull(jdbc);
        this.exchangeTransaction = new TransactionTemplate(manager);
        this.exchangeTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }
    @Override public Authentication authenticate(Authentication authentication) {
        var exchange = (OAuth2AuthorizationCodeAuthenticationToken) authentication;
        if (!(exchange.getPrincipal() instanceof OAuth2ClientAuthenticationToken client) || !client.isAuthenticated()
                || client.getRegisteredClient() == null) return delegate.authenticate(authentication);
        // Finish provider-policy lookup BEFORE acquiring an authorization row lock.
        OAuth2Authorization initial = secured.findByToken(exchange.getCode(), new OAuth2TokenType("code"));
        requireBoundCode(initial, exchange.getCode(), client.getRegisteredClient().getId());
        if (!initial.getToken(OAuth2AuthorizationCode.class).isActive()) {
            secured.remove(initial);
            throw new OAuth2AuthenticationException("invalid_grant");
        }
        record Result(Authentication authentication, OAuth2AuthenticationException denial, OAuth2Authorization revoke) {}
        Result result = exchangeTransaction.execute(status -> {
            AuthenticatedClientPolicy.lockPolicyRow(jdbc);
            if (jdbc.queryForList("SELECT id FROM oauth2_authorization WHERE id = ? FOR UPDATE", String.class, initial.getId()).size() != 1) {
                throw new OAuth2AuthenticationException("invalid_grant");
            }
            // Order: policy -> authorization. Reload RAW so a consumed code exits without
            // touching its family; refresh has family -> policy -> authorization order.
            // Active codes have no committed family; profile save forbids late consent from
            // replacing/reactivating an issued code. Replay revocation happens after commit.
            OAuth2Authorization current = raw.findById(initial.getId());
            requireBoundCode(current, exchange.getCode(), client.getRegisteredClient().getId());
            if (!current.getToken(OAuth2AuthorizationCode.class).isActive()) {
                return new Result(null, new OAuth2AuthenticationException("invalid_grant"), current);
            }
            try { return new Result(delegate.authenticate(authentication), null, null); }
            catch (OAuth2AuthenticationException failure) {
                // Preserve Spring's deliberate invalidation on rejected PKCE/code exchanges.
                return new Result(null, failure, null);
            }
        });
        if (result == null) throw new OAuth2AuthenticationException("invalid_grant");
        // Preserve replay-triggered grant revocation, but never acquire a family/profile lock
        // while holding a consumed authorization's row lock (a refresh may be in flight).
        if (result.revoke() != null) secured.remove(result.revoke());
        if (result.denial() != null) throw result.denial();
        return result.authentication();
    }
    private static void requireBoundCode(OAuth2Authorization authorization, String suppliedCode, String registeredId) {
        var code = authorization == null ? null : authorization.getToken(OAuth2AuthorizationCode.class);
        if (code == null || !suppliedCode.equals(code.getToken().getTokenValue())
                || !registeredId.equals(authorization.getRegisteredClientId())) {
            throw new OAuth2AuthenticationException("invalid_grant");
        }
    }
    @Override public boolean supports(Class<?> type) { return delegate.supports(type); }
}
