package com.skillpilot.backend.openai.de;

import java.time.Duration;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(OpenAiDeProperties.class)
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public class OpenAiDeConfiguration {

    @Bean
    InitializingBean validateOpenAiDeRuntimeMode(
            OpenAiDeProperties properties,
            Environment environment) {
        return () -> {
            String signingSecret =
                    environment.getProperty("skillpilot.security.signing-secret");
            if (!OpenAiDeSecureModeValidation.isValidSigningSecret(signingSecret)) {
                throw new IllegalStateException(
                        "skillpilot.security.signing-secret must be a high-entropy secret "
                                + "with at least "
                                + OpenAiDeSecureModeValidation.MINIMUM_SIGNING_SECRET_LENGTH
                                + " non-whitespace characters when the OpenAI-DE provider "
                                + "is enabled.");
            }
            if (properties.isBootstrapEnabled()) {
                throw new IllegalStateException(
                        "skillpilot.openai.de.bootstrap-enabled and "
                                + "skillpilot.openai.de.enabled must not both be true.");
            }
            if (!Duration.ofHours(24).equals(properties.getLearningSessionTtl())) {
                throw new IllegalStateException(
                        "skillpilot.openai.de.learning-session-ttl must be exactly PT24H.");
            }
            OpenAiDeSecureModeValidation.Result secureMode =
                    OpenAiDeSecureModeValidation.inspect(properties);
            if (!secureMode.valid()) {
                throw new IllegalStateException(
                        "OpenAI-DE secure mode is incomplete; invalid settings: "
                                + String.join(", ", secureMode.violations()));
            }
        };
    }
}
