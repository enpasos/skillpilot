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
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}
