package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.*;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;
import org.junit.jupiter.api.Test;

class OpenAiDeNativeClientProfilesTest {
    private OpenAiDeProperties hosted() {
        var properties = new OpenAiDeProperties();
        properties.getOauth().setClientId("existing-hosted-client");
        properties.getOauth().setClientSecret("existing-hosted-secret-at-least-thirty-two-characters");
        properties.getOauth().setRedirectUris(List.of("https://chatgpt.com/connector/oauth/existing"));
        return properties;
    }
    @Test void disabledByDefaultKeepsExistingProfileAndDiscovery() {
        var properties = hosted();
        assertThat(properties.getOauth().getNativeCimd().isEnabled()).isFalse();
        assertThat(OpenAiDeClientProfiles.configurations(properties)).containsExactly(properties);
        var metadata = OpenAiDeOAuthMetadataController.authorizationServerMetadata("https://skillpilot.com/api/openai/v1", properties);
        assertThat(metadata).doesNotContainKey("client_id_metadata_document_supported");
        assertThat(metadata.get("token_endpoint_auth_methods_supported")).isEqualTo(List.of("client_secret_basic"));
    }
    @Test void nativeAddsOneDistinctPinnedProfileWithoutChangingHostedFingerprint() {
        var properties = hosted();
        String fingerprint = OpenAiDeOAuthConfiguration.policyFingerprint(properties);
        properties.getOauth().getNativeCimd().setEnabled(true);
        var profiles = OpenAiDeClientProfiles.configurations(properties);
        assertThat(profiles).hasSize(2);
        assertThat(profiles.getFirst()).isSameAs(properties);
        var nativeProfile = profiles.get(1);
        assertThat(OpenAiDeClientProfiles.primaryProfileId(nativeProfile)).isEqualTo(OpenAiDeClientProfiles.NATIVE_CIMD_PUBLIC);
        assertThat(nativeProfile.getOauth().getClientAuthenticationMethod()).isEqualTo("none");
        assertThat(nativeProfile.getOauth().getClientSecret()).isEmpty();
        assertThat(nativeProfile.getOauth().getRedirectUris()).containsExactly(OpenAiDeProperties.OAuth.NativeCimd.REDIRECT_URI);
        assertThat(nativeProfile.getOauthResource()).isEqualTo(properties.getOauthResource());
        assertThat(OpenAiDeOAuthConfiguration.policyFingerprint(properties)).isEqualTo(fingerprint);
        assertThat(OpenAiDeOAuthConfiguration.policyFingerprint(nativeProfile)).isNotEqualTo(fingerprint);
    }
    @Test void nativePinAndRevisionCannotBeArbitraryOrRetired() {
        var properties = hosted();
        properties.getOauth().getNativeCimd().setEnabled(true);
        properties.getOauth().getNativeCimd().setClientId("https://chatgpt.com/oauth/codex/foreign/client.json");
        assertThatIllegalStateException().isThrownBy(() -> OpenAiDeClientProfiles.configurations(properties));
        properties.getOauth().getNativeCimd().setClientId(OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID);
        properties.getOauth().setLegacyClientIds(List.of(OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID));
        assertThatIllegalStateException().isThrownBy(() -> OpenAiDeClientProfiles.configurations(properties));
        properties.getOauth().setLegacyClientIds(List.of());
        properties.getOauth().getNativeCimd().setAuthorizationPolicyVersion(" ");
        assertThatIllegalStateException().isThrownBy(() -> OpenAiDeClientProfiles.configurations(properties));
    }
    @Test void jwtBasicAndNativeCoexistWithoutMixingClientMethods() {
        var properties = hosted();
        properties.getOauth().setClientId("https://chatgpt.com/oauth/client.json");
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().getNativeCimd().setEnabled(true);
        var basic = properties.getOauth().getTransitionalBasic();
        basic.setEnabled(true); basic.setClientId("transition");
        var profiles = OpenAiDeClientProfiles.configurations(properties);
        assertThat(profiles).extracting(OpenAiDeClientProfiles::primaryProfileId)
                .containsExactly(OpenAiDeClientProfiles.CIMD_JWT, OpenAiDeClientProfiles.NATIVE_CIMD_PUBLIC, OpenAiDeClientProfiles.BASIC_TRANSITION);
        assertThat(OpenAiDeOAuthMetadataController.authorizationServerMetadata("https://skillpilot.com/api/openai/v1", properties)
                .get("token_endpoint_auth_methods_supported")).isEqualTo(List.of("private_key_jwt", "none", "client_secret_basic"));
    }
    @Test void disablingNativeRejectsStoredNativeGrantsWhileHostedGrantsRemainVisible() throws Exception {
        var properties = hosted();
        properties.setServerBuild("native-isolation-test");
        properties.getOauth().getNativeCimd().setEnabled(true);
        var seed = org.springframework.security.oauth2.server.authorization.client.RegisteredClient.withId("unrelated")
                .clientId("unrelated").clientAuthenticationMethod(org.springframework.security.oauth2.core.ClientAuthenticationMethod.NONE)
                .authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://unrelated.test/callback").build();
        var store = new org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository(seed);
        var enabled = new OpenAiDeRegisteredClientRepository(store, properties);
        var configuration = new OpenAiDeOAuthConfiguration();
        for (var profile : OpenAiDeClientProfiles.configurations(properties)) configuration.registerOpenAiDeClient(enabled, profile).afterPropertiesSet();
        var nativeClient = enabled.findByClientId(OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID);
        var hostedClient = enabled.findByClientId(properties.getOauth().getClientId());
        var nativeGrant = org.springframework.security.oauth2.server.authorization.OAuth2Authorization.withRegisteredClient(nativeClient)
                .principalName("native-app").authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE).build();
        var hostedGrant = org.springframework.security.oauth2.server.authorization.OAuth2Authorization.withRegisteredClient(hostedClient)
                .principalName("hosted-app").authorizationGrantType(org.springframework.security.oauth2.core.AuthorizationGrantType.AUTHORIZATION_CODE).build();
        var grants = new org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService(nativeGrant, hostedGrant);
        properties.getOauth().getNativeCimd().setEnabled(false);
        var disabled = new OpenAiDeRegisteredClientRepository(store, properties);
        configuration.registerOpenAiDeClient(disabled, properties).afterPropertiesSet();
        var scoped = new com.skillpilot.backend.oauth.ProviderScopedOAuth2AuthorizationService(grants, disabled);
        assertThat(disabled.findByClientId(nativeClient.getClientId())).isNull();
        assertThat(disabled.findById(nativeClient.getId())).isNull();
        assertThat(scoped.findById(nativeGrant.getId())).isNull();
        assertThat(scoped.findById(hostedGrant.getId())).isEqualTo(hostedGrant);
        assertThat(store.findById(nativeClient.getId())).isNotNull();
    }
    @Test void enablingNativeDoesNotPermitDowngradingPrimaryClientToNone() {
        var properties = hosted();
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setEnabled(true);
        properties.getOauth().getNativeCimd().setEnabled(true);
        properties.getOauth().setClientAuthenticationMethod("none");
        assertThat(com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation.inspect(properties).violations())
                .contains("oauth.client-authentication-method");
    }

}
