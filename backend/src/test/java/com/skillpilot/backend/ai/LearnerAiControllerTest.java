package com.skillpilot.backend.ai;

import com.skillpilot.backend.service.LearnerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class LearnerAiControllerTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private LearnerService learnerService;

    @Value("${skillpilot.ai.api-key:}")
    private String apiKey;

    @Test
    void setMastery_shouldAcceptGoalIdOnly() {
        String skillpilotId = "59f95a0b-2307-4c12-b9cd-63c0bf1182c7"; // using an ID that likely exists or create one if
                                                                      // needed, but for validation 400 check it doesn't
                                                                      // matter much if 404
        // Actually, for 400 validation, we don't need the learner to exist if
        // validation happens first.
        // But to be safe, we might need a valid learner. The integration test created
        // one.
        // Let's create one on the fly if needed, but 'learnerService' is here.
        // For reproduction of 400 Bad Request on DTO, we just need the endpoint to be
        // hit.

        String goalId = "ccf9569b-b0e4-4d76-98d5-65be461d4d76";
        String json = "{\"goalId\": \"" + goalId + "\"}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (apiKey != null && !apiKey.isBlank()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        HttpEntity<String> request = new HttpEntity<>(json, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/ai/learners/" + skillpilotId + "/mastery",
                request,
                String.class);

        // We expect 200 OK (if fixed) or at least NOT 400.
        // If learner not found, it might be 404, which also proves 400 (validation) is
        // passed.
        assertThat(response.getStatusCode().value()).isNotEqualTo(400);
    }
}
