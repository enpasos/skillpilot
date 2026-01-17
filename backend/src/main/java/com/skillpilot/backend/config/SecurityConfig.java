package com.skillpilot.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/ui/curricula/champions/**").authenticated() // Protect
                                                                                                                   // champion
                                                                                                                   // endpoints
                                                .anyRequest().permitAll())
                                .oauth2Login(oauth2 -> oauth2
                                                // Redirect to frontend on success.
                                                // In production, this URL should be dynamic/configurable.
                                                .successHandler(authenticationSuccessHandler()))
                                .exceptionHandling(e -> e
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)));

                return http.build();
        }

        private org.springframework.security.web.authentication.AuthenticationSuccessHandler authenticationSuccessHandler() {
                return (request, response, authentication) -> {
                        // Add timestamp to URL to bypass service worker cache
                        String redirectUrl = "/curricula?auth_success=true&t=" + System.currentTimeMillis();
                        response.sendRedirect(redirectUrl);
                };
        }
}
