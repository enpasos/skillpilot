package com.skillpilot.backend.connectors.claude.v1.oauth;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/** Authenticates a public Claude v1 client at the token-revocation endpoint. */
final class ClaudeV1PublicRevocationClientAuthenticationProvider implements AuthenticationProvider {

    private final RegisteredClientRepository registeredClients;

    ClaudeV1PublicRevocationClientAuthenticationProvider(RegisteredClientRepository registeredClients) {
        this.registeredClients = registeredClients;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        OAuth2ClientAuthenticationToken client = (OAuth2ClientAuthenticationToken) authentication;
        if (!ClientAuthenticationMethod.NONE.equals(client.getClientAuthenticationMethod())
                || !Boolean.TRUE.equals(client.getAdditionalParameters().get(
                        ClaudeV1PublicRevocationClientAuthenticationConverter.PUBLIC_REVOCATION_REQUEST))) {
            return null;
        }
        RegisteredClient registered = registeredClients.findByClientId(client.getPrincipal().toString());
        if (registered == null
                || !registered.getClientAuthenticationMethods().contains(ClientAuthenticationMethod.NONE)) {
            throw new OAuth2AuthenticationException(OAuth2ErrorCodes.INVALID_CLIENT);
        }
        return new OAuth2ClientAuthenticationToken(registered, ClientAuthenticationMethod.NONE, null);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
