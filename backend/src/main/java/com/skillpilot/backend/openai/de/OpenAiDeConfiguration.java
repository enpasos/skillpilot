package com.skillpilot.backend.openai.de;

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
        };
    }
}
