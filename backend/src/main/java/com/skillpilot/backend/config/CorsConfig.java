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

                // Goal visualizations are public, immutable learning assets. The
                // submitted MCP App renders them from its dedicated widget origin.
                // Keep this mapping before the general credentialed application
                // mapping so native ChatGPT WebViews can load the image without
                // granting the widget cross-origin access to any API endpoint.
                registry.addMapping("/assets/goal-visualizations/**")
                        .allowedOrigins(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN)
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
