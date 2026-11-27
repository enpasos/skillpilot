package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class OpenAiDeOAuthMetadataControllerTest {
    private static final String PRIMARY_CLIENT = "https://chatgpt.com/oauth/primary-fixture/client.json";
    private static final String BASIC_CLIENT = "basic-fixture";
    private static final String PORTAL_CLIENT = "https://chatgpt.com/oauth/portal-fixture/client.json";
    private static final String PORTAL_CALLBACK = "https://chatgpt.com/connector/oauth/portal-fixture";
    private static final String CONTENT_SECURITY_POLICY = "Content-Security-Policy";
    private static final String SAME_ORIGIN_POLICY =
            "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'";

    private OpenAiDeOAuthMetadataController controller;

    @BeforeEach
    void configureHostedAndExistingClients() {
        var properties = new OpenAiDeProperties();
        var oauth = properties.getOauth();
        oauth.setClientAuthenticationMethod("private_key_jwt");
        oauth.setClientId(PRIMARY_CLIENT);
        oauth.setRedirectUris(List.of("https://chatgpt.com/connector/oauth/primary-fixture"));
        oauth.getNativeCimd().setEnabled(true);
        oauth.getTransitionalBasic().setEnabled(true);
        oauth.getTransitionalBasic().setClientId(BASIC_CLIENT);

        var portal = oauth.getPortalCimd();
        portal.setEnabled(true);
        portal.setClientId(PORTAL_CLIENT);
        portal.setRedirectUri(PORTAL_CALLBACK);
        portal.setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        portal.setClientAssertionAudience("https://skillpilot.test/api/openai/v1");
        portal.setAuthorizationPolicyVersion("portal-fixture-v1");

        controller = new OpenAiDeOAuthMetadataController("https://skillpilot.test", properties);
    }

    @Test
    void portalConsentAllowsItsConfiguredCallbackAndStillPostsToSkillPilot() {
        var response = controller.consent(PORTAL_CLIENT, OpenAiDeOAuthConfiguration.READ_SCOPE, "fixture-state");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getFirst(CONTENT_SECURITY_POLICY)).isEqualTo(
                "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' " + PORTAL_CALLBACK
                        + "; base-uri 'none'");
        assertThat(response.getBody()).contains(
                "<form method=\"post\" action=\"" + OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "\">");
    }

    @Test
    void existingConsentAndConnectRequiredKeepSameOriginPolicy() {
        for (String clientId : List.of(PRIMARY_CLIENT, BASIC_CLIENT, OpenAiDeProperties.OAuth.NativeCimd.CLIENT_ID)) {
            var response = controller.consent(clientId, OpenAiDeOAuthConfiguration.READ_SCOPE, "fixture-state");

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getHeaders().getFirst(CONTENT_SECURITY_POLICY)).isEqualTo(SAME_ORIGIN_POLICY);
        }
        assertThat(controller.connectRequired("expired").getHeaders().getFirst(CONTENT_SECURITY_POLICY))
                .isEqualTo(SAME_ORIGIN_POLICY);
    }

    @Test
    void unregisteredClientCannotReceiveThePortalConsentPage() {
        var response = controller.consent(PORTAL_CLIENT + "-other", null, "fixture-state");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getHeaders().getFirst(CONTENT_SECURITY_POLICY)).isNull();
        assertThat(response.getBody()).doesNotContain("<form");
    }
}
