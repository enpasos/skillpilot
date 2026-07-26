package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeSecureModeConfigurationTest {

    private final ApplicationContextRunner runner =
            new ApplicationContextRunner().withUserConfiguration(OpenAiDeConfiguration.class);

    @Test
    void secureModeRejectsPublicNoneClientAuthentication() {
        runner.withPropertyValues(
                        securePropertiesWith(
                                "skillpilot.openai.de.oauth.client-authentication-method=none"))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "oauth.client-authentication-method"));
    }

    @Test
    void secureModeRejectsDisabledMtlsEdge() {
        runner.withPropertyValues(
                        securePropertiesWith(
                                "skillpilot.openai.de.mtls-edge.enabled=false"))
                .run(context -> assertSecureStartupFailure(
                        context.getStartupFailure(),
                        "mtls-edge.enabled"));
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
            "skillpilot.openai.de.oauth.client-jwk-set-uri=https://chatgpt.com/oauth/jwks.json",
            "skillpilot.openai.de.oauth.client-assertion-signing-algorithm=RS256",
            "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=10000",
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
