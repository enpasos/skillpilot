package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.oauth.OAuthProfileDiagnostics;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;

/** Bounded client set and immutable per-process registration pins on every token/code/MCP lookup. */
final class OpenAiDeRegisteredClientRepository implements RegisteredClientRepository {
    private final RegisteredClientRepository delegate;
    private final Map<String, OpenAiDeProperties> profiles;
    private final Map<String, String> secretPins = new ConcurrentHashMap<>();
    private final java.util.function.BooleanSupplier jwtMetadataReady;

    OpenAiDeRegisteredClientRepository(RegisteredClientRepository delegate, OpenAiDeProperties properties) {
        this(delegate, properties, () -> true);
    }

    OpenAiDeRegisteredClientRepository(RegisteredClientRepository delegate, OpenAiDeProperties properties,
            java.util.function.BooleanSupplier jwtMetadataReady) {
        this.delegate = delegate;
        this.jwtMetadataReady = jwtMetadataReady;
        profiles = OpenAiDeClientProfiles.configurations(properties).stream().collect(Collectors.toUnmodifiableMap(
                value -> value.getOauth().getClientId().trim(), value -> value));
    }

    RegisteredClient findForRegistration(String id) {
        return profiles.containsKey(id) ? delegate.findByClientId(id) : null;
    }

    @Override public void save(RegisteredClient client) {
        if (!profiles.containsKey(client.getClientId())) {
            throw new IllegalArgumentException("OAuth client does not belong to the configured OpenAI profiles.");
        }
        delegate.save(client);
        secretPins.put(client.getClientId(), Objects.toString(client.getClientSecret(), ""));
    }

    @Override public RegisteredClient findById(String id) { return keep(delegate.findById(id)); }

    @Override public RegisteredClient findByClientId(String id) {
        return profiles.containsKey(id) ? keep(delegate.findByClientId(id)) : null;
    }

    private RegisteredClient keep(RegisteredClient client) {
        if (client == null) return null;
        var properties = profiles.get(client.getClientId());
        if (properties == null || !secretPins.containsKey(client.getClientId())) return null;
        OAuthProfileDiagnostics.markProfile(OpenAiDeClientProfiles.primaryProfileId(properties));
        var oauth = properties.getOauth();
        var method = new ClientAuthenticationMethod(OpenAiDeOAuthConfiguration.normalizedClientAuthenticationMethod(properties));
        boolean jwt = OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties);
        if (jwt && !jwtMetadataReady.getAsBoolean()) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.METADATA_UNAVAILABLE);
            return null;
        }
        if (!Set.of(method).equals(client.getClientAuthenticationMethods())
                || !Objects.equals(secretPins.get(client.getClientId()), Objects.toString(client.getClientSecret(), ""))
                || !Set.copyOf(oauth.getRedirectUris()).equals(client.getRedirectUris())
                || !Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE, OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                        OpenAiDeOAuthConfiguration.OFFLINE_SCOPE).equals(client.getScopes())
                || !Set.of(AuthorizationGrantType.AUTHORIZATION_CODE, AuthorizationGrantType.REFRESH_TOKEN)
                        .equals(client.getAuthorizationGrantTypes())
                || !client.getClientSettings().isRequireProofKey() || !client.getClientSettings().isRequireAuthorizationConsent()
                || !Objects.equals(OpenAiDeOAuthConfiguration.policyFingerprint(properties),
                        client.getClientSettings().getSetting(OpenAiDeOAuthConfiguration.CLIENT_POLICY_SETTING))
                || !Objects.equals(jwt ? oauth.getClientJwkSetUri() : null, client.getClientSettings().getJwkSetUrl())
                || !Objects.equals(jwt ? OpenAiDeOAuthConfiguration.clientAssertionSigningAlgorithm(properties) : null,
                        client.getClientSettings().getTokenEndpointAuthenticationSigningAlgorithm())
                || !OAuth2TokenFormat.REFERENCE.equals(client.getTokenSettings().getAccessTokenFormat())
                || !oauth.getAccessTokenTtl().equals(client.getTokenSettings().getAccessTokenTimeToLive())
                || !oauth.getRefreshTokenTtl().equals(client.getTokenSettings().getRefreshTokenTimeToLive())
                || client.getTokenSettings().isReuseRefreshTokens()) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.POLICY_REJECTED);
            return null;
        }
        return client;
    }
}
