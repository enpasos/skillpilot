package com.skillpilot.backend.openai.de;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class OpenAiAppsChallengeControllerTest {

    @Test
    void failsClosedUntilAnExactChallengeIsConfigured() {
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
