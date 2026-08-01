package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class OpenAiAppsChallengeControllerTest {

    @Test
    void failsClosedUntilAnExactChallengeIsConfigured() {
        assertThat(OpenAiAppsChallengeController.PATH)
                .isEqualTo(OpenAiDeV1ContractMetadata.INTERNAL_OPENAI_APPS_CHALLENGE_PATH)
                .startsWith("/internal/openai/de/v1/");

        OpenAiDeProperties properties = new OpenAiDeProperties();
        OpenAiAppsChallengeController controller =
                new OpenAiAppsChallengeController(properties);

        assertThat(controller.challenge().getStatusCode().value()).isEqualTo(404);

        properties.setOpenAiAppsChallenge("  openai-domain-proof  ");
        ResponseEntity<String> response = controller.challenge();
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("openai-domain-proof");
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
    }
}
