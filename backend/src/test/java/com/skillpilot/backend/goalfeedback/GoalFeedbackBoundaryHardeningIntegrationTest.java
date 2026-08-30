package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/** Full-stack regressions for the feedback HTTP and transaction boundaries. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:goal-feedback-boundary-hardening;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "spring.datasource.hikari.maximum-pool-size=2",
        "spring.datasource.hikari.connection-timeout=2000",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "spring.security.oauth2.client.registration.github.client-id=goal-feedback-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=goal-feedback-test-secret",
        "skillpilot.security.signing-secret=goal-feedback-test-signing-secret",
        "skillpilot.learner-retention.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false",
        "skillpilot.public-base-url=https://skillpilot.com",
        "cors.allowed-origins=https://skillpilot.com",
        "skillpilot.goal-feedback.enabled=true",
        "skillpilot.goal-feedback.operator-token=production-operator-token-at-least-32-bytes",
        "skillpilot.goal-feedback.public.rate-limit.requests=100"
})
class GoalFeedbackBoundaryHardeningIntegrationTest {

    private static final String TOKEN = "production-operator-token-at-least-32-bytes";
    private static final String ORIGIN = "https://skillpilot.com";

    @LocalServerPort
    private int port;

    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Test
    void matrixParametersCannotBypassFeedbackBoundariesBeforeFirewallRejection() throws Exception {
        URI publicSubmission = uri("/api/public/goal-feedback;probe=1/v1/submissions");
        HttpRequest missingOrigin = HttpRequest.newBuilder(publicSubmission)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        assertThat(send(missingOrigin).statusCode()).isEqualTo(403);

        HttpRequest acceptedByBoundary = HttpRequest.newBuilder(publicSubmission)
                .header("Content-Type", "application/json")
                .header("Origin", ORIGIN)
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        assertThat(send(acceptedByBoundary).statusCode()).isEqualTo(400);

        URI operations = uri("/api/operations/goal-feedback;probe=1/v1/export-batches");
        assertThat(send(HttpRequest.newBuilder(operations)
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build()).statusCode())
                .isEqualTo(401);
        assertThat(send(operator(HttpRequest.newBuilder(operations))
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build()).statusCode())
                .isEqualTo(400);
    }

    @Test
    void retentionCleanupDoesNotHoldAnOuterConnectionUnderConcurrentExports() throws Exception {
        URI exports = uri("/api/operations/goal-feedback/v1/export-batches?limit=10");
        CountDownLatch start = new CountDownLatch(1);
        ArrayList<Future<Integer>> responses = new ArrayList<>();

        try (var executor = Executors.newFixedThreadPool(8)) {
            for (int request = 0; request < 8; request++) {
                responses.add(executor.submit(() -> {
                    start.await();
                    return send(operator(HttpRequest.newBuilder(exports))
                                    .POST(HttpRequest.BodyPublishers.noBody())
                                    .build())
                            .statusCode();
                }));
            }
            start.countDown();
            for (Future<Integer> response : responses) {
                assertThat(response.get()).isEqualTo(204);
            }
        }
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static HttpRequest.Builder operator(HttpRequest.Builder request) {
        return request.header("Authorization", "Bearer " + TOKEN);
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }
}
