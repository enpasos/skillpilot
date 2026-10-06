// SPDX-License-Identifier: Apache-2.0
package com.skillpilot.backend.connectors.gemini.v1.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.gemini.v1.ConditionalOnGeminiV1Enabled;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;

/** Only signed gateway requests enter the separate Gemini MCP namespace. */
@Configuration(proxyBeanMethods = false)
@ConditionalOnGeminiV1Enabled
public class GeminiV1GatewaySecurityConfiguration {
    @Bean
    @Order(-90)
    SecurityFilterChain geminiV1GatewaySecurity(HttpSecurity http, GeminiV1Properties properties, ObjectMapper mapper) throws Exception {
        return http.securityMatcher("/gemini/v1/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .addFilterBefore(new GeminiV1GatewayFilter(properties, mapper), AnonymousAuthenticationFilter.class)
                .exceptionHandling(errors -> errors.authenticationEntryPoint((req, res, exception) -> res.setStatus(401)))
                .build();
    }
}
