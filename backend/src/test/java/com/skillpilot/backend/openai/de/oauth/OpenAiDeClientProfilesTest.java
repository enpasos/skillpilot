package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;

class OpenAiDeClientProfilesTest {
    private static final String BASIC = "synthetic-old-basic";
    private static final String SECRET = "synthetic-profile-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/previous";

    @Test void movingExistingBasicIntoExplicitTransitionDoesNotChangeItsPolicyIdentity() {
        var basic = basicProperties();
        var jwt = jwtProperties();
        var secondary = OpenAiDeClientProfiles.configurations(jwt).get(1);
        assertThat(OpenAiDeOAuthConfiguration.policyFingerprint(secondary))
                .isEqualTo(OpenAiDeOAuthConfiguration.policyFingerprint(basic));
        jwt.getOauth().setAuthorizationPolicyVersion("jwt-only-rollback-2");
        assertThat(OpenAiDeOAuthConfiguration.policyFingerprint(OpenAiDeClientProfiles.configurations(jwt).get(1)))
                .isEqualTo(OpenAiDeOAuthConfiguration.policyFingerprint(basic));
        assertThat(OpenAiDeClientProfiles.primaryProfileId(secondary)).isEqualTo("chatgpt-basic-transition");
        assertThat(OpenAiDeOAuthMetadataController.authorizationServerMetadata("https://skillpilot.com/api/openai/v1", jwt))
                .containsEntry("token_endpoint_auth_methods_supported", List.of("private_key_jwt", "client_secret_basic"));
    }

    @Test void runtimePinsIsolateDatabaseTamperingToOnlyItsOwnProfile() throws Exception {
        var jwt = jwtProperties();
        var delegate = repository();
        var bounded = new OpenAiDeRegisteredClientRepository(delegate, jwt);
        var configuration = new OpenAiDeOAuthConfiguration();
        for (var profile : OpenAiDeClientProfiles.configurations(jwt)) {
            configuration.registerOpenAiDeClient(bounded, profile).afterPropertiesSet();
        }
        String cimd = jwt.getOauth().getClientId();
        var originalJwt = delegate.findByClientId(cimd);
        var originalBasic = delegate.findByClientId(BASIC);
        assertThat(bounded.findByClientId("foreign-client")).isNull();
        delegate.save(RegisteredClient.from(originalJwt).clientAuthenticationMethods(methods -> {
            methods.clear(); methods.add(ClientAuthenticationMethod.NONE);
        }).build());
        assertThat(bounded.findByClientId(cimd)).isNull();
        assertThat(bounded.findByClientId(BASIC)).isNotNull();
        delegate.save(originalJwt);
        delegate.save(RegisteredClient.from(originalBasic).clientSecret("{noop}attacker-value").build());
        assertThat(bounded.findByClientId(BASIC)).isNull();
        assertThat(bounded.findByClientId(cimd)).isNotNull();
    }

    @Test void existingPublicRegistrationCannotBePromotedToBasicAndAdoptItsUnmarkedGrants() {
        var properties = basicProperties();
        var delegate = repository();
        delegate.save(RegisteredClient.withId("old-public-id").clientId(BASIC)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(CALLBACK).scope(OpenAiDeOAuthConfiguration.READ_SCOPE).build());
        var bounded = new OpenAiDeRegisteredClientRepository(delegate, properties);
        assertThatThrownBy(() -> new OpenAiDeOAuthConfiguration().registerOpenAiDeClient(bounded, properties).afterPropertiesSet())
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Changing authentication method");
        assertThat(delegate.findByClientId(BASIC).getClientAuthenticationMethods())
                .containsExactly(ClientAuthenticationMethod.NONE);
    }

    @Test void unprofiledBasicMustAlreadyHaveItsSafeRegistrationBeforeRetainingAnyGrants() throws Exception {
        var properties = basicProperties();
        var delegate = repository();
        new OpenAiDeOAuthConfiguration().registerOpenAiDeClient(delegate, properties).afterPropertiesSet();
        var prior = delegate.findByClientId(BASIC);
        var settings = new java.util.HashMap<>(prior.getClientSettings().getSettings());
        settings.remove(OpenAiDeOAuthConfiguration.CLIENT_POLICY_SETTING);
        delegate.save(RegisteredClient.from(prior).clientSettings(ClientSettings.withSettings(settings)
                .requireProofKey(false).build()).build());
        var bounded = new OpenAiDeRegisteredClientRepository(delegate, properties);
        assertThatThrownBy(() -> new OpenAiDeOAuthConfiguration().registerOpenAiDeClient(bounded, properties).afterPropertiesSet())
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("already match the trusted");
        assertThat(delegate.findByClientId(BASIC).getClientSettings().isRequireProofKey()).isFalse();
    }

    @Test void secondaryBasicCannotShareCimdIdentityOrBeRetiredByCleanup() {
        for (String id : List.of("", "https://chatgpt.com/oauth/test/client.json")) {
            var properties = jwtProperties();
            properties.getOauth().getTransitionalBasic().setClientId(id);
            assertThatThrownBy(() -> OpenAiDeClientProfiles.configurations(properties)).isInstanceOf(IllegalStateException.class);
        }
        var properties = jwtProperties();
        properties.getOauth().setLegacyClientIds(List.of(BASIC));
        assertThatThrownBy(() -> OpenAiDeClientProfiles.configurations(properties)).isInstanceOf(IllegalStateException.class);
    }

    private static InMemoryRegisteredClientRepository repository() {
        return new InMemoryRegisteredClientRepository(RegisteredClient.withId("foreign-id").clientId("foreign-client")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC).clientSecret("{noop}foreign")
                .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS).scope("foreign.read").build());
    }

    private static OpenAiDeProperties basicProperties() {
        var properties = new OpenAiDeProperties();
        properties.setEnabled(true);
        properties.setServerBuild("synthetic-profile-tests");
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setEnabled(true);
        properties.getOauth().setClientId(BASIC);
        properties.getOauth().setClientSecret(SECRET);
        properties.getOauth().setRedirectUris(List.of(CALLBACK));
        return properties;
    }

    private static OpenAiDeProperties jwtProperties() {
        var properties = basicProperties();
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().setClientId("https://chatgpt.com/oauth/test/client.json");
        properties.getOauth().setClientSecret("");
        properties.getOauth().setRedirectUris(List.of("https://chatgpt.com/connector/oauth/current"));
        properties.getOauth().setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        properties.getOauth().setClientAssertionAudience("https://skillpilot.com/api/openai/v1/oauth2/token");
        var secondary = properties.getOauth().getTransitionalBasic();
        secondary.setEnabled(true);
        secondary.setClientId(BASIC);
        secondary.setClientSecret(SECRET);
        secondary.setRedirectUris(List.of(CALLBACK));
        return properties;
    }
}
