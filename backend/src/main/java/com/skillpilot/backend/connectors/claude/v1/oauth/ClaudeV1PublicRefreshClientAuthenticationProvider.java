package com.skillpilot.backend.connectors.claude.v1.oauth;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/** Authenticates a public Claude v1 client for refresh-token rotation. */
final class ClaudeV1PublicRefreshClientAuthenticationProvider implements AuthenticationProvider {

    private final RegisteredClientRepository registeredClients;

    ClaudeV1PublicRefreshClientAuthenticationProvider(RegisteredClientRepository registeredClients) {
        this.registeredClients = registeredClients;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        OAuth2ClientAuthenticationToken client = (OAuth2ClientAuthenticationToken) authentication;
        if (!ClientAuthenticationMethod.NONE.equals(client.getClientAuthenticationMethod())
                || !AuthorizationGrantType.REFRESH_TOKEN.getValue()
                        .equals(client.getAdditionalParameters().get("grant_type"))) {
            return null;
        }
        RegisteredClient registered = registeredClients.findByClientId(client.getPrincipal().toString());
        if (registered == null
                || !registered.getClientAuthenticationMethods().contains(ClientAuthenticationMethod.NONE)
                || !registered.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN)) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
        }
        return new OAuth2ClientAuthenticationToken(registered, ClientAuthenticationMethod.NONE, null);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
