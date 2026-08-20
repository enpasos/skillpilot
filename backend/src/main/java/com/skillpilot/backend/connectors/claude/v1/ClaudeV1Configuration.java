package com.skillpilot.backend.connectors.claude.v1;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Main Spring configuration for SkillPilot Claude Connector v1.
 *
 * <p>The properties holder is registered unconditionally because it is inert: it publishes no
 * route, filter or scheduled work, and reading it is how the rest of the application observes that
 * the lane is switched off. Everything with an observable effect is gated on
 * {@link ConditionalOnClaudeV1Enabled}.</p>
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(ClaudeV1Properties.class)
public class ClaudeV1Configuration {

    @Bean
    @ConditionalOnClaudeV1Enabled
    public InitializingBean validateClaudeV1Runtime(ClaudeV1Properties properties, Environment environment) {
        return () -> {
            ClaudeV1RuntimeValidation.ValidationResult result =
                    ClaudeV1RuntimeValidation.inspect(properties, environment);
            if (!result.valid()) {
                // Violation texts name properties, never their values, so a failed startup cannot
                // print a secret into the service log.
                throw new IllegalStateException(
                        "Claude Connector v1 runtime configuration is invalid: "
                                + String.join("; ", result.violations()));
            }
        };
    }
}
