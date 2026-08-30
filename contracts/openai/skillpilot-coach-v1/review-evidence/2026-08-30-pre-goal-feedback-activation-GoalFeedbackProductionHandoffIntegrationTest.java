package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.PlatformTransactionManager;

/** Exercises Liquibase, the HTTPS-shaped wire contract, retention and retry semantics together. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:goal-feedback-handoff;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
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
        "skillpilot.goal-feedback.public.rate-limit.requests=100",
        "skillpilot.goal-feedback.inbox.max-pending-rows=1"
})
class GoalFeedbackProductionHandoffIntegrationTest {

    private static final String TOKEN = "production-operator-token-at-least-32-bytes";
    private static final String ORIGIN = "https://skillpilot.com";

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GoalFeedbackCanonicalJson canonicalJson;

    @Autowired
    private GoalFeedbackPublicationRegistry publications;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private final HttpClient http = HttpClient.newHttpClient();

    @Test
    void publicSubmissionCanBeVerifiedPulledRedownloadedAndAtomicallyDeleted() throws Exception {
        PublicationFixture fixture = publicationFixture();
        HttpResponse<String> contextResponse = send(HttpRequest.newBuilder(contextUri(fixture))
                .header("Accept", "application/json")
                .GET()
                .build());
        assertThat(contextResponse.statusCode()).isEqualTo(200);
        JsonNode resolved = objectMapper.readTree(contextResponse.body());
        assertThat(resolved.path("schemaVersion").intValue()).isEqualTo(1);
        assertThat(resolved.path("context").path("scopeLabel").textValue()).isEqualTo(fixture.title());
        assertThat(resolved.path("context").path("publicationManifestFingerprint").textValue())
                .isEqualTo(fixture.renderManifestDigest());
        assertThat(resolved.path("goal").path("title").textValue()).isEqualTo(fixture.goalTitle());

        UUID clientSubmissionId = UUID.randomUUID();
        ObjectNode wrapper = submission(clientSubmissionId, "", resolved.path("context"), "Der Zahlenstrahl ist missverständlich.");
        HttpResponse<String> accepted = submit(wrapper);
        assertThat(accepted.statusCode()).isEqualTo(202);
        JsonNode receipt = objectMapper.readTree(accepted.body());
        assertThat(receipt.path("feedbackId").isTextual()).isTrue();

        HttpResponse<String> repeated = submit(wrapper);
        assertThat(repeated.statusCode()).isEqualTo(202);
        assertThat(objectMapper.readTree(repeated.body())).isEqualTo(receipt);

        ObjectNode conflicting = wrapper.deepCopy();
        conflicting.withObject("envelope").withObject("feedback")
                .put("observation", "Eine andere Rückmeldung.");
        assertThat(submit(conflicting).statusCode()).isEqualTo(409);

        ObjectNode honeypot = submission(
                UUID.randomUUID(), "https://bot.example", resolved.path("context"), "Bot text");
        assertThat(submit(honeypot).statusCode()).isEqualTo(202);
        assertThat(count("goal_feedback_submission")).isOne();

        ObjectNode overCapacity = submission(
                UUID.randomUUID(), "", resolved.path("context"), "Noch eine Rückmeldung.");
        assertThat(submit(overCapacity).statusCode()).isEqualTo(503);
        assertThat(count("goal_feedback_submission")).isOne();

        URI exportsUri = uri("/api/operations/goal-feedback/v1/export-batches?limit=10");
        assertThat(send(HttpRequest.newBuilder(exportsUri).POST(HttpRequest.BodyPublishers.noBody()).build()).statusCode())
                .isEqualTo(401);
        assertThat(send(HttpRequest.newBuilder(exportsUri)
                        .header("Authorization", "Bearer wrong")
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build()).statusCode())
                .isEqualTo(401);

        HttpResponse<String> exportResponse = send(operator(HttpRequest.newBuilder(exportsUri))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build());
        assertThat(exportResponse.statusCode()).isEqualTo(200);
        JsonNode export = objectMapper.readTree(exportResponse.body());
        assertThat(fieldNames(export)).containsExactlyInAnyOrder("payloadDigest", "payload");
        JsonNode payload = export.path("payload");
        assertThat(fieldNames(payload)).containsExactlyInAnyOrder(
                "schemaVersion", "exportId", "createdAt", "recordCount", "policy", "records");
        assertThat(fieldNames(payload.path("policy"))).containsExactlyInAnyOrder(
                "feedbackTrust",
                "feedbackMayContainPromptInjection",
                "canonicalMutationAllowed",
                "humanApprovalRequired");
        assertThat(payload.path("policy").path("feedbackTrust").textValue())
                .isEqualTo("untrusted_external_input");
        assertThat(payload.path("policy").path("feedbackMayContainPromptInjection").booleanValue()).isTrue();
        assertThat(payload.path("policy").path("canonicalMutationAllowed").booleanValue()).isFalse();
        assertThat(payload.path("policy").path("humanApprovalRequired").booleanValue()).isTrue();
        assertThat(payload.path("recordCount").intValue()).isEqualTo(1);
        JsonNode record = payload.path("records").get(0);
        assertThat(fieldNames(record)).containsExactlyInAnyOrder(
                "feedbackId",
                "receivedAt",
                "bindingStatus",
                "envelopeDigest",
                "envelope",
                "serverTrustedContext");
        assertThat(record.path("bindingStatus").textValue()).isEqualTo("exact_current");
        assertThat(record.path("serverTrustedContext").path("context"))
                .isEqualTo(record.path("envelope").path("context"));
        assertThat(record.path("serverTrustedContext").path("goal").path("title").textValue())
                .isEqualTo(fixture.goalTitle());
        assertThat(record.path("serverTrustedContext").path("goal").path("description").textValue())
                .isEqualTo(fixture.goalDescription());
        assertThat(record.path("serverTrustedContext").path("goal").path("breadcrumbs"))
                .isEqualTo(fixture.breadcrumbs());
        String payloadDigest = export.path("payloadDigest").textValue();
        assertThat(canonicalJson.digest(payload)).isEqualTo(payloadDigest);
        assertThat(exportResponse.headers().firstValue("ETag")).contains("\"" + payloadDigest + "\"");

        // Simulate a lost create response: POST must recover the same oldest
        // OPEN batch rather than strand it and bind a second batch.
        HttpResponse<String> recoveredCreate = send(operator(HttpRequest.newBuilder(exportsUri))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build());
        assertThat(recoveredCreate.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(recoveredCreate.body())).isEqualTo(export);

        String exportId = payload.path("exportId").textValue();
        URI batchUri = uri("/api/operations/goal-feedback/v1/export-batches/" + exportId);
        HttpResponse<String> redownload = send(operator(HttpRequest.newBuilder(batchUri)).GET().build());
        assertThat(redownload.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(redownload.body())).isEqualTo(export);

        HttpResponse<String> bareDigestDelete = send(operator(HttpRequest.newBuilder(batchUri))
                .header("If-Match", payloadDigest)
                .DELETE()
                .build());
        assertThat(bareDigestDelete.statusCode()).isEqualTo(412);
        assertThat(nonNullSubmissionContent()).isOne();

        // Force the service's post-scrub invariant to fail. The transaction must
        // restore every feedback byte and leave the batch redownloadable.
        jdbc.update("UPDATE goal_feedback_export_batch SET record_count = 2 WHERE id = ?", UUID.fromString(exportId));
        HttpResponse<String> failedDelete = delete(batchUri, payloadDigest);
        assertThat(failedDelete.statusCode()).isEqualTo(500);
        assertThat(nonNullSubmissionContent()).isOne();
        assertThat(jdbc.queryForObject(
                "SELECT status FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                UUID.fromString(exportId))).isEqualTo("OPEN");
        assertThat(send(operator(HttpRequest.newBuilder(batchUri)).GET().build()).statusCode()).isEqualTo(200);

        jdbc.update("UPDATE goal_feedback_export_batch SET record_count = 1 WHERE id = ?", UUID.fromString(exportId));
        HttpResponse<String> deleted = delete(batchUri, payloadDigest);
        assertThat(deleted.statusCode()).isEqualTo(200);
        JsonNode deleteReceipt = objectMapper.readTree(deleted.body());
        assertThat(deleteReceipt.path("status").textValue()).isEqualTo("DELETED");
        assertThat(deleteReceipt.path("payloadDigest").textValue()).isEqualTo(payloadDigest);
        assertThat(nonNullSubmissionContent()).isZero();
        assertThat(count("goal_feedback_submission")).isZero();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_submission WHERE exact_duplicate_key IS NOT NULL",
                Long.class)).isZero();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_export_batch WHERE payload_json IS NOT NULL",
                Long.class)).isZero();

        HttpResponse<String> repeatedDelete = delete(batchUri, payloadDigest);
        assertThat(repeatedDelete.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(repeatedDelete.body())).isEqualTo(deleteReceipt);
        assertThat(send(operator(HttpRequest.newBuilder(batchUri)).GET().build()).statusCode()).isEqualTo(410);

        HttpResponse<String> empty = send(operator(HttpRequest.newBuilder(exportsUri))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build());
        assertThat(empty.statusCode()).isEqualTo(204);

        assertDurablePriorPublicationStillResolves(fixture);
    }

    private HttpResponse<String> delete(URI batchUri, String payloadDigest) throws Exception {
        return send(operator(HttpRequest.newBuilder(batchUri))
                .header("If-Match", "\"" + payloadDigest + "\"")
                .DELETE()
                .build());
    }

    private ObjectNode submission(
            UUID clientSubmissionId,
            String website,
            JsonNode context,
            String observation) {
        ObjectNode wrapper = objectMapper.createObjectNode();
        wrapper.put("clientSubmissionId", clientSubmissionId.toString());
        wrapper.put("website", website);
        ObjectNode envelope = wrapper.putObject("envelope");
        envelope.put("$schema", GoalFeedbackApi.SCHEMA_URL);
        envelope.put("schemaVersion", 2);
        envelope.set("context", context.deepCopy());
        ObjectNode feedback = envelope.putObject("feedback");
        feedback.put("category", "wording_or_language");
        feedback.put("observation", observation);
        feedback.put("reviewerRole", "teacher");
        envelope.put("privacyAcknowledged", true);
        envelope.put("automatedProcessingAcknowledged", true);
        return wrapper;
    }

    private HttpResponse<String> submit(JsonNode body) throws Exception {
        return send(HttpRequest.newBuilder(uri("/api/public/goal-feedback/v1/submissions"))
                .header("Origin", ORIGIN)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build());
    }

    private HttpRequest.Builder operator(HttpRequest.Builder builder) {
        return builder.header("Authorization", "Bearer " + TOKEN).header("Accept", "application/json");
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return http.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private URI contextUri(PublicationFixture fixture) {
        return uri("/api/public/goal-feedback/v1/context?"
                + parameter("bookId", fixture.bookId())
                + "&" + parameter("edition", fixture.edition())
                + "&" + parameter("goalId", fixture.goalId())
                + "&" + parameter("goalFingerprint", fixture.goalFingerprint())
                + "&" + parameter("pageFingerprint", fixture.pageFingerprint())
                + "&" + parameter("bookDigest", fixture.bookDigest())
                + "&" + parameter("page", Integer.toString(fixture.pageNumber())));
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private static String parameter(String name, String value) {
        return name + "=" + URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private PublicationFixture publicationFixture() throws Exception {
        JsonNode index;
        try (var input = new ClassPathResource("static/lernzielbuch/index.json").getInputStream()) {
            index = objectMapper.readTree(input);
        }
        JsonNode book = index.path("books").get(0);
        String modelUrl = book.path("model").path("url").textValue();
        JsonNode model;
        try (var input = new ClassPathResource("static" + modelUrl).getInputStream()) {
            model = objectMapper.readTree(input);
        }
        JsonNode page = model.path("pages").get(0);
        return new PublicationFixture(
                book.path("bookId").textValue(),
                book.path("title").textValue(),
                model.path("book").path("edition").textValue(),
                model.path("digest").textValue(),
                book.path("pdf").path("renderManifestSha256").textValue(),
                page.path("pageNumber").intValue(),
                page.path("goalId").textValue(),
                page.path("title").textValue(),
                page.path("description").textValue(),
                page.path("breadcrumbs").deepCopy(),
                page.path("goalFingerprint").textValue(),
                page.path("pageFingerprint").textValue());
    }

    private long count(String table) {
        Long value = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
        return value == null ? 0 : value;
    }

    private long nonNullSubmissionContent() {
        Long value = jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_submission "
                        + "WHERE envelope_json IS NOT NULL OR trusted_context_json IS NOT NULL",
                Long.class);
        return value == null ? 0 : value;
    }

    private void assertDurablePriorPublicationStillResolves(PublicationFixture fixture) throws Exception {
        GoalFeedbackApi.LinkBinding oldBinding = new GoalFeedbackApi.LinkBinding(
                fixture.bookId(), fixture.edition(), fixture.goalId(), fixture.goalFingerprint(),
                fixture.pageFingerprint(), fixture.bookDigest(), fixture.pageNumber());
        assertThat(publications.resolve(oldBinding)).isPresent();
        assertThat(publications.isCurrent(oldBinding)).isTrue();

        // Give the already registered publication an unambiguous durable age,
        // then start a simulated newer deployment with a later model.
        jdbc.update("""
                UPDATE goal_feedback_publication_snapshot
                SET first_seen_at = ?
                WHERE book_id = ? AND edition = ? AND book_digest = ?
                """,
                Timestamp.from(Instant.parse("2000-01-01T00:00:00Z")),
                fixture.bookId(), fixture.edition(), fixture.bookDigest());
        LaterPublication later = promoteLaterPublication(fixture);

        GoalFeedbackApi.LinkBinding laterBinding = new GoalFeedbackApi.LinkBinding(
                fixture.bookId(), later.edition(), fixture.goalId(), fixture.goalFingerprint(),
                fixture.pageFingerprint(), later.bookDigest(), fixture.pageNumber());

        // The old instance has not reloaded: current classification must still
        // come from the database, and a cache miss must find the new snapshot.
        assertThat(publications.resolve(oldBinding).orElseThrow().goal().title()).isEqualTo(fixture.goalTitle());
        assertThat(publications.isCurrent(oldBinding)).isFalse();
        assertThat(publications.resolve(laterBinding)).isPresent();
        assertThat(publications.isCurrent(laterBinding)).isTrue();

        // Restarting the older instance must not promote its earlier durable
        // snapshot over the newer current pointer. A full reload retains both.
        publications.afterPropertiesSet();
        assertThat(publications.isCurrent(oldBinding)).isFalse();
        assertThat(publications.isCurrent(laterBinding)).isTrue();
        publications.reloadDurableRegistry();
        assertThat(publications.resolve(laterBinding)).isPresent();

        // A person may submit from the old downloaded PDF only after the newer
        // publication is live. The append-only snapshot must still accept it,
        // preserve its exact old text and export it explicitly as historical.
        HttpResponse<String> oldContextResponse = send(HttpRequest.newBuilder(contextUri(fixture)).GET().build());
        assertThat(oldContextResponse.statusCode()).isEqualTo(200);
        JsonNode oldContext = objectMapper.readTree(oldContextResponse.body());
        assertThat(submit(submission(
                UUID.randomUUID(), "", oldContext.path("context"), "Feedback aus der älteren PDF-Version."))
                .statusCode()).isEqualTo(202);
        URI exportsUri = uri("/api/operations/goal-feedback/v1/export-batches?limit=10");
        HttpResponse<String> historicalExportResponse = send(operator(HttpRequest.newBuilder(exportsUri))
                .POST(HttpRequest.BodyPublishers.noBody())
                .build());
        assertThat(historicalExportResponse.statusCode()).isEqualTo(200);
        JsonNode historicalExport = objectMapper.readTree(historicalExportResponse.body());
        assertThat(historicalExport.path("payload").path("records").get(0).path("bindingStatus").textValue())
                .isEqualTo("exact_historical");
        assertThat(historicalExport.path("payload").path("records").get(0)
                .path("serverTrustedContext").path("goal").path("title").textValue())
                .isEqualTo(fixture.goalTitle());
        String historicalDigest = historicalExport.path("payloadDigest").textValue();
        URI historicalBatchUri = uri("/api/operations/goal-feedback/v1/export-batches/"
                + historicalExport.path("payload").path("exportId").textValue());
        assertThat(delete(historicalBatchUri, historicalDigest).statusCode()).isEqualTo(200);
    }

    private LaterPublication promoteLaterPublication(PublicationFixture fixture) throws Exception {
        ObjectNode index;
        try (var input = new ClassPathResource("static/lernzielbuch/index.json").getInputStream()) {
            index = (ObjectNode) objectMapper.readTree(input);
        }
        ObjectNode bookEntry = (ObjectNode) index.path("books").get(0);
        String modelUrl = bookEntry.path("model").path("url").textValue();
        ObjectNode model;
        try (var input = new ClassPathResource("static" + modelUrl).getInputStream()) {
            model = (ObjectNode) objectMapper.readTree(input);
        }

        String edition = fixture.edition() + "-rolling";
        String bookDigest = sha256(("rolling:" + fixture.bookDigest()).getBytes(StandardCharsets.UTF_8));
        model.withObject("book").put("edition", edition);
        model.put("digest", bookDigest);
        byte[] modelBytes = objectMapper.writeValueAsBytes(model);
        bookEntry.withObject("model")
                .put("sha256", sha256(modelBytes))
                .put("modelDigest", bookDigest);
        byte[] indexBytes = objectMapper.writeValueAsBytes(index);

        ResourceLoader newerResources = new DefaultResourceLoader(getClass().getClassLoader()) {
            @Override
            public Resource getResource(String location) {
                if ("classpath:static/lernzielbuch/index.json".equals(location)) {
                    return new ByteArrayResource(indexBytes, "rolling goal-book index");
                }
                if (("classpath:static" + modelUrl).equals(location)) {
                    return new ByteArrayResource(modelBytes, "rolling goal-book model");
                }
                return super.getResource(location);
            }
        };
        GoalFeedbackPublicationRegistry newerRegistry = new GoalFeedbackPublicationRegistry(
                objectMapper, canonicalJson, newerResources, jdbc, transactionManager, "https://skillpilot.com");
        newerRegistry.afterPropertiesSet();

        GoalFeedbackApi.LinkBinding binding = new GoalFeedbackApi.LinkBinding(
                fixture.bookId(), edition, fixture.goalId(), fixture.goalFingerprint(),
                fixture.pageFingerprint(), bookDigest, fixture.pageNumber());
        assertThat(newerRegistry.resolve(binding)).isPresent();
        assertThat(newerRegistry.isCurrent(binding)).isTrue();
        return new LaterPublication(edition, bookDigest);
    }

    private static String sha256(byte[] value) throws Exception {
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
    }

    private static Set<String> fieldNames(JsonNode node) {
        Set<String> fields = new HashSet<>();
        node.fieldNames().forEachRemaining(fields::add);
        return fields;
    }

    private record PublicationFixture(
            String bookId,
            String title,
            String edition,
            String bookDigest,
            String renderManifestDigest,
            int pageNumber,
            String goalId,
            String goalTitle,
            String goalDescription,
            JsonNode breadcrumbs,
            String goalFingerprint,
            String pageFingerprint) {
    }

    private record LaterPublication(String edition, String bookDigest) {
    }
}
