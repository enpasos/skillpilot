package com.skillpilot.backend.oauth;

import java.util.List;
import java.util.Objects;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2TokenRevocationAuthenticationProvider;

/**
 * RFC 7009 revokes access/refresh tokens, not authorization codes or consent state.
 * Spring's default provider uses an untyped lookup, which would also find codes.
 * Restrict only that provider's view; the code-exchange service must still find codes.
 *
 * <p>Non-token requests therefore never become authorization writers. Writers and
 * guarded code exchanges share policy -> authorization lock order; consumed-code
 * family revocation happens outside those locks. Existing provider/client/profile
 * checks still run through the secured delegate.</p>
 */
public final class OAuthTokenRevocationBoundary implements OAuth2AuthorizationService {
    private final OAuth2AuthorizationService delegate;

    public OAuthTokenRevocationBoundary(OAuth2AuthorizationService delegate) {
        this.delegate = Objects.requireNonNull(delegate);
    }

    public static void restrict(List<AuthenticationProvider> providers, OAuth2AuthorizationService secured) {
        for (int i = 0; i < providers.size(); i++) {
            if (providers.get(i) instanceof OAuth2TokenRevocationAuthenticationProvider) {
                providers.set(i, new OAuth2TokenRevocationAuthenticationProvider(new OAuthTokenRevocationBoundary(secured)));
            }
        }
    }

    @Override public void save(OAuth2Authorization authorization) { delegate.save(authorization); }
    @Override public void remove(OAuth2Authorization authorization) { delegate.remove(authorization); }
    @Override public OAuth2Authorization findById(String id) { return delegate.findById(id); }

    @Override public OAuth2Authorization findByToken(String token, OAuth2TokenType type) {
        if (type != null) {
            return OAuth2TokenType.ACCESS_TOKEN.equals(type) || OAuth2TokenType.REFRESH_TOKEN.equals(type)
                    ? delegate.findByToken(token, type) : null;
        }
        OAuth2Authorization authorization = delegate.findByToken(token, OAuth2TokenType.ACCESS_TOKEN);
        return authorization != null ? authorization : delegate.findByToken(token, OAuth2TokenType.REFRESH_TOKEN);
    }
}
