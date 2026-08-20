package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.util.Objects;
import java.util.function.Consumer;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.endpoint.OAuth2ParameterNames;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationContext;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationException;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeRequestAuthenticationToken;

/**
 * Replaces the default redirect-URI check for the Claude v1 authorization endpoint.
 *
 * <p>The stock validator treats only literal loopback IP addresses as port-variable and compares
 * everything else by exact string. Claude Code binds an ephemeral port and may present either
 * {@code 127.0.0.1} or {@code localhost}, so the stock rule rejects half of the valid callbacks.
 * This validator delegates to {@link ClaudeV1CimdMetadataValidator}, which pins scheme, host and
 * path exactly and permits only the port to vary.</p>
 */
public final class ClaudeV1RedirectUriValidator
        implements Consumer<OAuth2AuthorizationCodeRequestAuthenticationContext> {

    private final ClaudeV1CimdMetadataValidator cimdValidator;
    private final ClaudeV1Properties properties;

    public ClaudeV1RedirectUriValidator(
            ClaudeV1CimdMetadataValidator cimdValidator,
            ClaudeV1Properties properties) {
        this.cimdValidator = Objects.requireNonNull(cimdValidator, "cimdValidator");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Override
    public void accept(OAuth2AuthorizationCodeRequestAuthenticationContext context) {
        OAuth2AuthorizationCodeRequestAuthenticationToken authentication = context.getAuthentication();
        String clientId = context.getRegisteredClient().getClientId();
        String requestedRedirectUri = authentication.getRedirectUri();

        if (requestedRedirectUri == null || requestedRedirectUri.isBlank()) {
            // Claude always sends one; an omitted redirect_uri would otherwise fall back to the
            // first registered entry and could send a code to the wrong client type.
            throwInvalidRedirectUri(authentication);
        }
        if (!cimdValidator.isValidRedirectUri(clientId, requestedRedirectUri)) {
            throwInvalidRedirectUri(authentication);
        }
        if (!cimdValidator.isVerifiedClientId(clientId)) {
            throw new OAuth2AuthorizationCodeRequestAuthenticationException(
                    new OAuth2Error(
                            OAuth2ErrorCodes.INVALID_CLIENT,
                            "The client identity metadata document could not be verified.",
                            properties.getPublicAuthServerMetadataUrl()),
                    null);
        }
    }

    private void throwInvalidRedirectUri(OAuth2AuthorizationCodeRequestAuthenticationToken authentication) {
        // No redirect is attached to the error: an unvalidated redirect_uri must never be used to
        // deliver the failure back to the caller.
        throw new OAuth2AuthorizationCodeRequestAuthenticationException(
                new OAuth2Error(
                        OAuth2ErrorCodes.INVALID_REQUEST,
                        "Invalid " + OAuth2ParameterNames.REDIRECT_URI + " for this Claude client.",
                        properties.getPublicAuthServerMetadataUrl()),
                null);
    }
}
