package com.skillpilot.backend.openai.nativev1.oauth;

import java.util.function.Consumer;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.server.authorization.authentication.*;

/** Changes only the exact native client's redirect validation; hosted clients retain Spring defaults. */
public final class OpenAiNativeAuthorizationValidator implements Consumer<OAuth2AuthorizationCodeRequestAuthenticationContext> {
    private final OpenAiNativeCimdValidator metadata;
    public OpenAiNativeAuthorizationValidator(OpenAiNativeCimdValidator metadata) { this.metadata = metadata; }
    @Override public void accept(OAuth2AuthorizationCodeRequestAuthenticationContext context) {
        if (!metadata.clientId().equals(context.getRegisteredClient().getClientId())) {
            OAuth2AuthorizationCodeRequestAuthenticationValidator.DEFAULT_REDIRECT_URI_VALIDATOR.accept(context);
            OAuth2AuthorizationCodeRequestAuthenticationValidator.DEFAULT_SCOPE_VALIDATOR.accept(context);
            return;
        }
        OAuth2AuthorizationCodeRequestAuthenticationToken request = context.getAuthentication();
        if (!metadata.validRedirect(request.getRedirectUri())) reject("invalid_request", "Invalid native callback.");
        if (!"S256".equals(request.getAdditionalParameters().get("code_challenge_method"))
                || !(request.getAdditionalParameters().get("code_challenge") instanceof String challenge)
                || !challenge.matches("[A-Za-z0-9_-]{43}")) reject("invalid_request", "S256 PKCE is required.");
        try { metadata.verify(); } catch (IllegalStateException unavailable) {
            reject("invalid_client", "Native client metadata is unavailable.");
        }
        OAuth2AuthorizationCodeRequestAuthenticationValidator.DEFAULT_SCOPE_VALIDATOR.accept(context);
    }
    private static void reject(String code, String description) {
        // Never redirect an error to an unvalidated callback.
        throw new OAuth2AuthorizationCodeRequestAuthenticationException(new OAuth2Error(code, description, null), null);
    }
}
