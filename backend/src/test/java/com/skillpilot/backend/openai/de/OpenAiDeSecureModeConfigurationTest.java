package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeSecureModeConfigurationTest {

    private final ApplicationContextRunner runner =
            new ApplicationContextRunner().withUserConfiguration(OpenAiDeConfiguration.class);

    @Test
    void secureModeAcceptsPinnedPublicClientAuthentication() {
        runner.withPropertyValues(validPublicClientSecureProperties())
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    OpenAiDeSecureModeValidation.Result status =
                            OpenAiDeSecureModeValidation.inspect(
                                    context.getBean(OpenAiDeProperties.class));
                    assertThat(status.valid()).isTrue();
                    assertThat(status.publicClient()).isTrue();
                    assertThat(status.privateKeyJwt()).isFalse();
                    assertThat(status.clientIdConfigured()).isTrue();
                });
    }

    @Test
    void secureModeRejectsUnsupportedClientAuthentication() {
        runner.withPropertyValues(
                        securePropertiesWith(
                                "skillpilot.openai.de.oauth.client-authentication-method=client_secret_basic"))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "oauth.client-authentication-method"));
    }

    @Test
    void secureModeRejectsMissingPublicClientId() {
        runner.withPropertyValues(
                        publicSecurePropertiesWith(
                                "skillpilot.openai.de.oauth.client-id="))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "oauth.client-id"));
    }

    @Test
    void secureModeRejectsDisabledOauth() {
        runner.withPropertyValues(
                        publicSecurePropertiesWith(
                                "skillpilot.openai.de.oauth.enabled=false"))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "oauth.enabled"));
    }

    @Test
    void secureModeRejectsMissingOrNonHttpsRedirects() {
        for (String invalidRedirect : new String[] {
                "",
                "http://localhost/callback",
                "https://chatgpt.com/connector/oauth/callback?tenant=one",
                "https://chatgpt.com/connector/oauth/callback#fragment"
        }) {
            runner.withPropertyValues(
                            publicSecurePropertiesWith(
                                    "skillpilot.openai.de.oauth.redirect-uris[0]="
                                            + invalidRedirect))
                    .run(context -> assertSecureStartupFailure(
                            context.getStartupFailure(),
                            "oauth.redirect-uris"));
        }
    }

    @Test
    void strictProtocolUrisRejectQueriesFragmentsAndSurroundingWhitespace() {
        for (String unsafeUri : new String[] {
                "https://skillpilot.test/api/openai/de/mcp?tenant=one",
                "https://skillpilot.test/api/openai/de/mcp#fragment",
                " https://skillpilot.test/api/openai/de/mcp",
                "https://skillpilot.test/api/openai/de/mcp "
        }) {
            assertThat(OpenAiDeSecureModeValidation.isStrictHttpsUri(unsafeUri))
                    .as(unsafeUri)
                    .isFalse();
        }
    }

    @Test
    void secureModeAcceptsTlsAndOauthWithMtlsEdgeDisabled() {
        runner.withPropertyValues(
                        securePropertiesWith(
                                "skillpilot.openai.de.mtls-edge.enabled=false"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    OpenAiDeSecureModeValidation.Result status =
                            OpenAiDeSecureModeValidation.inspect(
                                    context.getBean(OpenAiDeProperties.class));
                    assertThat(status.valid()).isTrue();
                    assertThat(status.mtlsEdgeEnabled()).isFalse();
                    assertThat(status.violations()).isEmpty();
                });
    }

    @Test
    void secureModeRejectsHostnamesAndCidrsAsTrustedProxyPeers() {
        for (String invalidProxy : new String[] {"localhost", "127.0.0.0/8"}) {
            runner.withPropertyValues(
                            securePropertiesWith(
                                    "skillpilot.openai.de.mtls-edge.trusted-proxies[0]="
                                            + invalidProxy))
                    .run(context -> assertSecureStartupFailure(
                            context.getStartupFailure(),
                            "mtls-edge.trusted-proxies"));
        }
    }

    @Test
    void normalProviderRejectsExplicitSecureModeDowngrade() {
        runner.withPropertyValues(
                        "skillpilot.openai.de.enabled=true",
                        "skillpilot.openai.de.security.secure-mode=false",
                        "skillpilot.openai.de.oauth.client-authentication-method=none",
                        "skillpilot.openai.de.mtls-edge.enabled=false")
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "security.secure-mode"));
    }

    @Test
    void completeSecureModeConfigurationStarts() {
        runner.withPropertyValues(validSecureProperties())
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    OpenAiDeProperties properties = context.getBean(OpenAiDeProperties.class);
                    OpenAiDeSecureModeValidation.Result status =
                            OpenAiDeSecureModeValidation.inspect(properties);
                    assertThat(status.valid()).isTrue();
                    assertThat(status.trustedProxyCount()).isEqualTo(2);
                });
    }

    private static String[] validSecureProperties() {
        return new String[] {
            "skillpilot.openai.de.enabled=true",
            "skillpilot.openai.de.security.secure-mode=true",
            "skillpilot.openai.de.oauth.enabled=true",
            "skillpilot.openai.de.oauth.client-authentication-method=private_key_jwt",
            "skillpilot.openai.de.oauth.client-id=https://chatgpt.com/oauth/skillpilot/client.json",
            "skillpilot.openai.de.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
            "skillpilot.openai.de.oauth.client-jwk-set-uri=https://chatgpt.com/oauth/jwks.json",
            "skillpilot.openai.de.oauth.client-assertion-signing-algorithm=RS256",
            "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=10000",
            "skillpilot.openai.de.mtls-edge.enabled=true",
            "skillpilot.openai.de.mtls-edge.trusted-proxies[0]=127.0.0.1",
            "skillpilot.openai.de.mtls-edge.trusted-proxies[1]=::1"
        };
    }

    private static String[] validPublicClientSecureProperties() {
        return new String[] {
            "skillpilot.openai.de.enabled=true",
            "skillpilot.openai.de.security.secure-mode=true",
            "skillpilot.openai.de.oauth.enabled=true",
            "skillpilot.openai.de.oauth.client-authentication-method=none",
            "skillpilot.openai.de.oauth.client-id=skillpilot-chatgpt-de-prod",
            "skillpilot.openai.de.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
            "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=0",
            "skillpilot.openai.de.mtls-edge.enabled=true",
            "skillpilot.openai.de.mtls-edge.trusted-proxies[0]=127.0.0.1",
            "skillpilot.openai.de.mtls-edge.trusted-proxies[1]=::1"
        };
    }

    private static String[] securePropertiesWith(String override) {
        String[] baseline = validSecureProperties();
        String[] combined = java.util.Arrays.copyOf(baseline, baseline.length + 1);
        combined[baseline.length] = override;
        return combined;
    }

    private static String[] publicSecurePropertiesWith(String override) {
        String[] baseline = validPublicClientSecureProperties();
        String[] combined = java.util.Arrays.copyOf(baseline, baseline.length + 1);
        combined[baseline.length] = override;
        return combined;
    }

    private static void assertSecureStartupFailure(Throwable failure, String setting) {
        assertThat(failure)
                .isNotNull()
                .hasRootCauseInstanceOf(IllegalStateException.class);
        assertThat(rootCause(failure).getMessage())
                .contains("OpenAI-DE secure mode is incomplete")
                .contains(setting);
    }

    private static Throwable rootCause(Throwable failure) {
        Throwable current = failure;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current;
    }
}
