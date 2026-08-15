package com.skillpilot.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174}")
    private String allowedOrigins;

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = allowedOrigins.split(",");
                for (int i = 0; i < origins.length; i++) {
                    origins[i] = origins[i].trim();
                }

                // Keep the explicitly public asset mappings before the general
                // credentialed application mapping; no other API endpoint
                // inherits these public CORS policies.
                //
                // The content-addressed review video is public submission evidence.
                // OpenAI's portal may validate or stream it from a foreign origin.
                registry.addMapping("/api/public/openai/review/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "HEAD", "OPTIONS")
                        .allowedHeaders("Range")
                        .exposedHeaders("Accept-Ranges", "Content-Length", "Content-Range")
                        .allowCredentials(false)
                        .maxAge(3600);

                // Goal visualizations are public, immutable learning assets. ChatGPT
                // hosts the same MCP App resource from product-owned sandbox origins,
                // and native WebViews may use an opaque `null` origin. Allow every
                // origin to read only these public image bytes without credentials.
                registry.addMapping("/assets/goal-visualizations/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "HEAD", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);

                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
