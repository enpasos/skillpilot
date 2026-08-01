package com.skillpilot.backend.openai.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/** Serves the OpenAI domain-verification challenge on the public V1 MCP origin. */
@Controller
@ConditionalOnProperty(name = "skillpilot.openai.coach.de.v1.enabled", havingValue = "true")
public final class OpenAiAppsChallengeController {

    public static final String PATH =
            OpenAiDeV1ContractMetadata.INTERNAL_OPENAI_APPS_CHALLENGE_PATH;

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
