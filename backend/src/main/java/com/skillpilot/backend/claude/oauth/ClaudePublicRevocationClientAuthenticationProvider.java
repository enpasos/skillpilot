package com.skillpilot.backend.claude.oauth;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/** Authenticates the public Claude client at the token-revocation endpoint. */
final class ClaudePublicRevocationClientAuthenticationProvider implements AuthenticationProvider {

    private final RegisteredClientRepository registeredClients;

    ClaudePublicRevocationClientAuthenticationProvider(RegisteredClientRepository registeredClients) {
        this.registeredClients = registeredClients;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        OAuth2ClientAuthenticationToken client = (OAuth2ClientAuthenticationToken) authentication;
        if (!ClientAuthenticationMethod.NONE.equals(client.getClientAuthenticationMethod())
                || !Boolean.TRUE.equals(client.getAdditionalParameters().get(
                        ClaudePublicRevocationClientAuthenticationConverter.PUBLIC_REVOCATION_REQUEST))) {
            return null;
        }

        String clientId = client.getPrincipal().toString();
        RegisteredClient registeredClient = registeredClients.findByClientId(clientId);
        if (registeredClient == null
                || !registeredClient.getClientAuthenticationMethods().contains(ClientAuthenticationMethod.NONE)) {
            throw new OAuth2AuthenticationException(new OAuth2Error(OAuth2ErrorCodes.INVALID_CLIENT));
        }
        return new OAuth2ClientAuthenticationToken(
                registeredClient,
                ClientAuthenticationMethod.NONE,
                null);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return OAuth2ClientAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
