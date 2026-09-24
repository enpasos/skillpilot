package com.skillpilot.backend.openai.nativev1.oauth;

import java.util.Objects;
import java.util.Set;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2RefreshTokenAuthenticationToken;

/** Serializes public refresh exchanges across all application instances using the database family lock. */
public final class OpenAiNativeFamilyRefreshAuthenticationProvider implements AuthenticationProvider {
    private final AuthenticationProvider delegate;
    private final OpenAiNativeRefreshTokenFamilies families;
    private final String nativeClientId;

    public OpenAiNativeFamilyRefreshAuthenticationProvider(AuthenticationProvider delegate,
            OpenAiNativeRefreshTokenFamilies families, String nativeClientId) {
        this.delegate = Objects.requireNonNull(delegate);
        this.families = Objects.requireNonNull(families);
        this.nativeClientId = Objects.requireNonNull(nativeClientId);
        if (nativeClientId.isBlank()) throw new IllegalArgumentException("Native client ID must not be blank.");
    }

    @Override
    public Authentication authenticate(Authentication authentication) {
        if (authentication instanceof OAuth2RefreshTokenAuthenticationToken refresh
                && refresh.getPrincipal() instanceof OAuth2ClientAuthenticationToken client && client.isAuthenticated()
                && ClientAuthenticationMethod.NONE.equals(client.getClientAuthenticationMethod())
                && client.getRegisteredClient() != null
                && nativeClientId.equals(client.getRegisteredClient().getClientId())
                && client.getRegisteredClient().getClientAuthenticationMethods().equals(Set.of(ClientAuthenticationMethod.NONE))) {
            return families.refresh(refresh.getRefreshToken(), client.getRegisteredClient().getId(), () -> delegate.authenticate(authentication));
        }
        return delegate.authenticate(authentication);
    }

    @Override
    public boolean supports(Class<?> type) { return delegate.supports(type); }
}
