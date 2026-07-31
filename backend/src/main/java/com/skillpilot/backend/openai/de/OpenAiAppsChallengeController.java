package com.skillpilot.backend.openai.de;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/** Serves the OpenAI domain-verification challenge on the public V1 MCP origin. */
@Controller
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public final class OpenAiAppsChallengeController {

    public static final String PATH = "/.well-known/openai-apps-challenge";

    private final OpenAiDeProperties properties;

    public OpenAiAppsChallengeController(OpenAiDeProperties properties) {
        this.properties = properties;
    }

    @GetMapping(value = PATH, produces = MediaType.TEXT_PLAIN_VALUE)
    @ResponseBody
    public ResponseEntity<String> challenge() {
        String challenge = properties.getOpenAiAppsChallenge();
        if (challenge == null || challenge.isBlank()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.TEXT_PLAIN)
                .body(challenge.trim());
    }
}
