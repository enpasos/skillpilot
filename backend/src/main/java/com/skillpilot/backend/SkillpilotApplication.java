package com.skillpilot.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({ com.skillpilot.backend.landscape.LandscapeProperties.class })
public class SkillpilotApplication {
    public static void main(String[] args) {
        SpringApplication.run(SkillpilotApplication.class, args);
    }

    @org.springframework.context.annotation.Bean
    public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
        return new com.fasterxml.jackson.databind.ObjectMapper();
    }
}
