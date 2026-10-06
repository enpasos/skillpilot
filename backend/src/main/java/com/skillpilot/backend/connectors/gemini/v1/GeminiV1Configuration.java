package com.skillpilot.backend.connectors.gemini.v1;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Main Spring configuration for SkillPilot Gemini Connector v1.
 *
 * <p>The properties holder is registered unconditionally because it is inert: it publishes no
 * route, filter or scheduled work, and reading it is how the rest of the application observes that
 * the lane is switched off. Everything with an observable effect is gated on
 * {@link ConditionalOnGeminiV1Enabled}.</p>
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(GeminiV1Properties.class)
public class GeminiV1Configuration {

    @Bean
    @ConditionalOnGeminiV1Enabled
    public InitializingBean validateGeminiV1Runtime(GeminiV1Properties properties, Environment environment) {
        return () -> {
            GeminiV1RuntimeValidation.ValidationResult result =
                    GeminiV1RuntimeValidation.inspect(properties, environment);
            if (!result.valid()) {
                // Violation texts name properties, never their values, so a failed startup cannot
                // print a secret into the service log.
                throw new IllegalStateException(
                        "Gemini Connector v1 runtime configuration is invalid: "
                                + String.join("; ", result.violations()));
            }
        };
    }
}
