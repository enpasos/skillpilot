package com.skillpilot.backend.openai.nativev1.oauth;

import java.util.Objects;
import java.util.Set;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/** Applies family revocation to refresh AND access lookup without changing learner/session state. */
public final class OpenAiNativeFamilyAuthorizationService implements OAuth2AuthorizationService {
    private final OAuth2AuthorizationService delegate;
    private final RegisteredClientRepository clients;
    private final OpenAiNativeRefreshTokenFamilies families;
    private final String nativeClientId;

    public OpenAiNativeFamilyAuthorizationService(OAuth2AuthorizationService delegate, RegisteredClientRepository clients,
            OpenAiNativeRefreshTokenFamilies families, String nativeClientId) {
        this.delegate = Objects.requireNonNull(delegate);
        this.clients = Objects.requireNonNull(clients);
        this.families = Objects.requireNonNull(families);
        this.nativeClientId = Objects.requireNonNull(nativeClientId);
        if (nativeClientId.isBlank()) throw new IllegalArgumentException("Native client ID must not be blank.");
    }

    @Override
    public void save(OAuth2Authorization authorization) {
        if (!isNativePublic(authorization)) {
            delegate.save(authorization);
            return;
        }
        families.transaction(() -> {
            // Spring's revocation provider saves an invalidated token rather than
            // removing the authorization. Revoke its siblings in the same family.
            if (hasInvalidatedFamilyToken(authorization)) families.revoke(authorization.getId());
            else families.record(authorization);
            delegate.save(authorization);
            return null;
        });
    }

    @Override
    public void remove(OAuth2Authorization authorization) {
        if (!isNativePublic(authorization)) {
            delegate.remove(authorization);
            return;
        }
        families.transaction(() -> {
            families.revoke(authorization.getId());
            delegate.remove(authorization);
            return null;
        });
    }

    @Override
    public OAuth2Authorization findById(String id) { return keep(delegate.findById(id)); }

    @Override
    public OAuth2Authorization findByToken(String token, OAuth2TokenType type) { return keep(delegate.findByToken(token, type)); }

    private OAuth2Authorization keep(OAuth2Authorization candidate) {
        return candidate != null && (!isNativePublic(candidate) || families.permits(candidate)) ? candidate : null;
    }

    private boolean isNativePublic(OAuth2Authorization authorization) {
        var client = clients.findById(authorization.getRegisteredClientId());
        return client != null && nativeClientId.equals(client.getClientId())
                && client.getClientAuthenticationMethods().equals(Set.of(ClientAuthenticationMethod.NONE));
    }

    private static boolean hasInvalidatedFamilyToken(OAuth2Authorization authorization) {
        return authorization.getRefreshToken() != null && authorization.getRefreshToken().isInvalidated()
                || authorization.getAccessToken() != null && authorization.getAccessToken().isInvalidated();
    }
}
