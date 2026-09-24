package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

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
            OAuthProfileDiagnostics.markReasonIfAbsent(
                    OAuthProfileDiagnostics.Reason.CLIENT_AUTHENTICATION_REJECTED);
            throw failure;
        }
    }

    @Override public boolean supports(Class<?> authentication) {
        return delegate.supports(authentication);
    }
}
