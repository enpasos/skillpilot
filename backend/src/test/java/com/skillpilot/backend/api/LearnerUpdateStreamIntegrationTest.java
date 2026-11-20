package com.skillpilot.backend.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.SseService;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "server.address=127.0.0.1",
        "spring.datasource.url=jdbc:h2:mem:learner-update-stream;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE",
        "spring.datasource.hikari.maximum-pool-size=1",
        "spring.datasource.hikari.connection-timeout=2000"
})
class LearnerUpdateStreamIntegrationTest {
    @LocalServerPort int port;
    @Autowired LearnerService learners;
    @Autowired ApplicationEventPublisher publisher;
    @Autowired SseService updates;

    @Test
    void anOpenUpdateStreamLeavesTheConnectionAvailableForLearning() throws Exception {
        String id = learners.createLearner().getSkillpilotId();
        URI ui = URI.create("http://127.0.0.1:" + port + "/api/ui/");
        HttpURLConnection stream = (HttpURLConnection) ui.resolve("updates/" + id).toURL().openConnection();
        stream.setRequestProperty("Accept", "text/event-stream");
        stream.setConnectTimeout(10000);
        stream.setReadTimeout(10000);
        try (HttpClient client = HttpClient.newHttpClient();
                var events = new BufferedReader(new InputStreamReader(stream.getInputStream(), StandardCharsets.UTF_8))) {
            assertThat(stream.getResponseCode()).isEqualTo(200);
            assertThat(events.readLine()).isEqualTo("event:connected");

            HttpRequest mastery = HttpRequest.newBuilder(ui.resolve("learners/" + id + "/mastery"))
                    .timeout(Duration.ofSeconds(10)).build();
            HttpResponse<String> response = client.send(mastery, HttpResponse.BodyHandlers.ofString());
            assertThat(response.statusCode()).isEqualTo(200);
            assertThat(response.body()).contains("\"mastery\"");

            publisher.publishEvent(new LearnerStateChangedEvent(this, id, "CLIENT_STATE_UPDATED", "goal"));
            assertThat(events.lines().filter("event:client-state"::equals).findFirst()).isPresent();
        } finally {
            updates.forgetLearner(id);
            stream.disconnect();
        }
    }
}
