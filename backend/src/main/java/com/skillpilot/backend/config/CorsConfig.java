package com.skillpilot.backend.config;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
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

                // Goal visualizations are public, immutable learning assets. ChatGPT
                // hosts the same MCP App resource from product-owned sandbox origins,
                // and native WebViews may use an opaque `null` origin. Allow every
                // origin to read only these public image bytes without credentials.
                // Keep this mapping before the general credentialed application
                // mapping; no API endpoint inherits this public CORS policy.
                registry.addMapping("/assets/goal-visualizations/**")
                        .allowedOrigins("*")
                        .allowedMethods("GET", "HEAD", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);

                // The direct-start component sends the opaque learner key only
                // to this fixed SkillPilot endpoint. It never uses cookies or
                // ambient credentials; the short-lived setup capability is the
                // endpoint-specific authorization boundary.
                registry.addMapping(OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH)
                        .allowedOrigins(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN)
                        .allowedMethods("POST", "OPTIONS")
                        .allowedHeaders("Authorization", "Content-Type")
                        .exposedHeaders("Retry-After")
                        .allowCredentials(false)
                        .maxAge(300);

                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
