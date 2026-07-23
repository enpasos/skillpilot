package com.skillpilot.backend.openai.de;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(OpenAiDeProperties.class)
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public class OpenAiDeConfiguration {
}
