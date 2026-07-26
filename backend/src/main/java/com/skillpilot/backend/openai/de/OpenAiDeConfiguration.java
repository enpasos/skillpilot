package com.skillpilot.backend.openai.de;

import java.time.Duration;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(OpenAiDeProperties.class)
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public class OpenAiDeConfiguration {

    @Bean
    InitializingBean validateOpenAiDeRuntimeMode(OpenAiDeProperties properties) {
        return () -> {
            if (properties.isBootstrapEnabled()) {
                throw new IllegalStateException(
                        "skillpilot.openai.de.bootstrap-enabled and "
                                + "skillpilot.openai.de.enabled must not both be true.");
            }
            if (properties.getLearningSessionTtl() == null
                    || properties.getLearningSessionTtl().isZero()
                    || properties.getLearningSessionTtl().isNegative()) {
                throw new IllegalStateException(
                        "skillpilot.openai.de.learning-session-ttl must be positive.");
            }
            if (properties.getLearningSessionTtl().compareTo(Duration.ofHours(24)) > 0) {
                throw new IllegalStateException(
                        "skillpilot.openai.de.learning-session-ttl must not exceed PT24H.");
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
