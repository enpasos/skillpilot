package com.skillpilot.backend.openai.de.bootstrap;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.Set;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.stereotype.Component;

/**
 * Validates the stable Spring Authorization Server authorization ID.
 *
 * <p>The principal name, OAuth subject and access-token value are deliberately
 * ignored. This verifier proves only the registered V1 app/resource grant.</p>
 */
@Component
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapOAuthAuthorizationVerifier
        implements OpenAiDeBootstrapAuthorizationVerifier {

    private final OAuth2AuthorizationService authorizations;
    private final RegisteredClientRepository registeredClients;
    private final OpenAiDeProperties properties;

    public OpenAiDeBootstrapOAuthAuthorizationVerifier(
            @Qualifier("openAiDeAuthorizationService") OAuth2AuthorizationService authorizations,
            @Qualifier("openAiDeRegisteredClientRepository") RegisteredClientRepository registeredClients,
            OpenAiDeProperties properties) {
        this.authorizations = authorizations;
        this.registeredClients = registeredClients;
        this.properties = properties;
    }

    @Override
    public void requireActiveAuthorization(String oauthAuthorizationReference) {
        if (oauthAuthorizationReference == null
                || oauthAuthorizationReference.isBlank()
                || oauthAuthorizationReference.length() > 100) {
            throw invalidAuthorization();
        }
        String clientId = properties.getOauth().getClientId();
        if (clientId == null || clientId.isBlank()) {
            throw invalidAuthorization();
        }
        OAuth2Authorization authorization = authorizations.findById(oauthAuthorizationReference);
        RegisteredClient expectedClient = registeredClients.findByClientId(clientId);
        if (authorization == null
                || !oauthAuthorizationReference.equals(authorization.getId())
                || expectedClient == null
                || !expectedClient.getId().equals(authorization.getRegisteredClientId())
                || authorization.getAccessToken() == null
                || !authorization.getAccessToken().isActive()) {
            throw invalidAuthorization();
        }

        OAuth2AuthorizationRequest authorizationRequest =
                authorization.getAttribute(OAuth2AuthorizationRequest.class.getName());
        Object resource = authorizationRequest == null
                ? null
                : authorizationRequest.getAdditionalParameters().get("resource");
        if (!(resource instanceof String value) || !OpenAiDeBootstrapConstants.RESOURCE.equals(value)) {
            throw invalidAuthorization();
        }
        Set<String> scopes = authorization.getAccessToken().getToken().getScopes();
        if (scopes == null || !scopes.containsAll(OpenAiDeBootstrapConstants.REQUIRED_SCOPES)) {
            throw invalidAuthorization();
        }
    }

    private static OpenAiDeBootstrapException invalidAuthorization() {
        return new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
    }
}
