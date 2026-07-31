package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeSecureModeConfigurationTest {

    private static final String TEST_CLIENT_SECRET =
            "test-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String TEST_SIGNING_SECRET =
            "7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg";

    private final ApplicationContextRunner runner =
            new ApplicationContextRunner().withUserConfiguration(OpenAiDeConfiguration.class);

    @Test
    void secureModeAcceptsStaticConfidentialClientAuthentication() {
        runner.withPropertyValues(validSecureProperties())
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    OpenAiDeSecureModeValidation.Result status =
                            OpenAiDeSecureModeValidation.inspect(
                                    context.getBean(OpenAiDeProperties.class));
                    assertThat(status.valid()).isTrue();
                    assertThat(status.publicClient()).isFalse();
                    assertThat(status.privateKeyJwt()).isFalse();
                    assertThat(status.clientSecretBasic()).isTrue();
                    assertThat(status.clientIdConfigured()).isTrue();
                    assertThat(status.clientSecretConfigured()).isTrue();
                });
    }

    @Test
    void secureModeRejectsPublicPrivateKeyJwtAndUnsupportedClientAuthentication() {
        for (String authenticationMethod : new String[] {
                "none", "private_key_jwt", "client_secret_post"
        }) {
            runner.withPropertyValues(
                            securePropertiesWith(
                                    "skillpilot.openai.de.oauth.client-authentication-method="
                                            + authenticationMethod))
                    .run(context -> assertSecureStartupFailure(
                            context.getStartupFailure(),
                            "oauth.client-authentication-method"));
        }
    }

    @Test
    void secureModeRejectsMissingConfidentialClientId() {
        runner.withPropertyValues(
                        securePropertiesWith(
                                "skillpilot.openai.de.oauth.client-id="))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "oauth.client-id"));
    }

    @Test
    void secureModeRejectsDisabledOauth() {
        runner.withPropertyValues(
                        securePropertiesWith(
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
                            securePropertiesWith(
                                    "skillpilot.openai.de.oauth.redirect-uris[0]="
                                            + invalidRedirect))
                    .run(context -> assertSecureStartupFailure(
                            context.getStartupFailure(),
                            "oauth.redirect-uris"));
        }
    }

    @Test
    void secureModeRejectsMissingShortOrWhitespaceClientSecret() {
        for (String invalidSecret : new String[] {
                "",
                "too-short",
                "test-client-secret-0123456789 contains-whitespace"
        }) {
            runner.withPropertyValues(
                            securePropertiesWith(
                                    "skillpilot.openai.de.oauth.client-secret="
                                            + invalidSecret))
                    .run(context -> assertSecureStartupFailure(
                            context.getStartupFailure(),
                            "oauth.client-secret"));
        }
    }

    @Test
    void enabledProviderRejectsMissingPlaceholderWhitespaceOrLowEntropySigningSecret() {
        for (String invalidSecret : new String[] {
                "",
                "default-insecure-secret-change-me",
                "DEFAULT-INSECURE-SECRET-CHANGE-ME",
                "too-short",
                "7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0L aEuBiOg",
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        }) {
            runner.withPropertyValues(
                            securePropertiesWith(
                                    "skillpilot.security.signing-secret=" + invalidSecret))
                    .run(context -> {
                        Throwable failure = context.getStartupFailure();
                        assertThat(failure)
                                .isNotNull()
                                .hasRootCauseInstanceOf(IllegalStateException.class);
                        assertThat(rootCause(failure).getMessage())
                                .contains("skillpilot.security.signing-secret")
                                .doesNotContain(
                                        "default-insecure-secret-change-me",
                                        "too-short",
                                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                    });
        }
    }

    @Test
    void strictProtocolUrisRejectQueriesFragmentsAndSurroundingWhitespace() {
        for (String unsafeUri : new String[] {
                "https://skillpilot.test/internal/openai/de/v1/mcp?tenant=one",
                "https://skillpilot.test/internal/openai/de/v1/mcp#fragment",
                " https://skillpilot.test/internal/openai/de/v1/mcp",
                "https://skillpilot.test/internal/openai/de/v1/mcp "
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
                        "skillpilot.security.signing-secret=" + TEST_SIGNING_SECRET,
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
            "skillpilot.security.signing-secret=" + TEST_SIGNING_SECRET,
            "skillpilot.openai.de.server-build=test-build",
            "skillpilot.openai.de.security.secure-mode=true",
            "skillpilot.openai.de.oauth.enabled=true",
            "skillpilot.openai.de.oauth.client-id=skillpilot-chatgpt-de-prod",
            "skillpilot.openai.de.oauth.client-secret=" + TEST_CLIENT_SECRET,
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
