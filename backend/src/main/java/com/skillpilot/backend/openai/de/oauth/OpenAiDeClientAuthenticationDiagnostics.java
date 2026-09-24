package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics.ClientAuthMethod;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics.Reason;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;

/** Classifies client-authentication failures without changing the provider or its error response. */
final class OpenAiDeClientAuthenticationDiagnostics implements AuthenticationProvider {
    private final AuthenticationProvider delegate;

    OpenAiDeClientAuthenticationDiagnostics(AuthenticationProvider delegate) {
        this.delegate = delegate;
    }

    @Override public Authentication authenticate(Authentication authentication) {
        try {
            return delegate.authenticate(authentication);
        } catch (OAuth2AuthenticationException failure) {
            OAuthProfileDiagnostics.markClientAuthMethod(clientAuthMethod(authentication));
            OAuthProfileDiagnostics.markReasonIfAbsent(reason(failure.getError()));
            throw failure;
        }
    }

    private static ClientAuthMethod clientAuthMethod(Authentication authentication) {
        if (!(authentication instanceof OAuth2ClientAuthenticationToken client)) return ClientAuthMethod.UNKNOWN;
        ClientAuthenticationMethod method = client.getClientAuthenticationMethod();
        if (method == null) return ClientAuthMethod.UNKNOWN;
        if (ClientAuthenticationMethod.NONE.equals(method)) return ClientAuthMethod.NONE;
        if (ClientAuthenticationMethod.CLIENT_SECRET_BASIC.equals(method)) return ClientAuthMethod.SECRET_BASIC;
        if (ClientAuthenticationMethod.CLIENT_SECRET_POST.equals(method)) return ClientAuthMethod.SECRET_POST;
        // SAS initially represents both JWT assertion mechanisms by the assertion-type URN.
        // This label deliberately makes no claim about the assertion's signing algorithm.
        if (ClientAuthenticationMethod.PRIVATE_KEY_JWT.equals(method)
                || ClientAuthenticationMethod.CLIENT_SECRET_JWT.equals(method)
                || "urn:ietf:params:oauth:client-assertion-type:jwt-bearer".equals(method.getValue())) {
            return ClientAuthMethod.JWT_ASSERTION;
        }
        return ClientAuthMethod.OTHER;
    }

    private static Reason reason(OAuth2Error error) {
        String description = error.getDescription();
        if (description == null) return Reason.CLIENT_AUTHENTICATION_REJECTED;
        // Exact SAS-generated constants only. Never emit descriptions, exception messages,
        // credentials, assertion contents, or arbitrary parameter names into diagnostics.
        if ("invalid_client".equals(error.getErrorCode())) {
            return switch (description) {
                case "Client authentication failed: authentication_method" -> Reason.CLIENT_METHOD_REJECTED;
                case "Client authentication failed: client_id" -> Reason.CLIENT_REGISTRATION_NOT_FOUND;
                case "Client authentication failed: credentials" -> Reason.CLIENT_CREDENTIALS_MISSING;
                case "Client authentication failed: client_secret",
                        "Client authentication failed: client_secret_expires_at" -> Reason.CLIENT_SECRET_REJECTED;
                default -> Reason.CLIENT_AUTHENTICATION_REJECTED;
            };
        }
        if ("invalid_grant".equals(error.getErrorCode())) {
            return switch (description) {
                case "Client authentication failed: code" -> Reason.AUTHORIZATION_CODE_REJECTED;
                case "Client authentication failed: code_verifier",
                        "Client authentication failed: code_challenge" -> Reason.PKCE_REJECTED;
                default -> Reason.CLIENT_AUTHENTICATION_REJECTED;
            };
        }
        return Reason.CLIENT_AUTHENTICATION_REJECTED;
    }

    @Override public boolean supports(Class<?> authentication) {
        return delegate.supports(authentication);
    }
}
