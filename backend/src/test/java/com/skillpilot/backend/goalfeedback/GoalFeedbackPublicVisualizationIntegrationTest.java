package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.LinkBinding;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:goal-feedback-public-visualization;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
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
        "skillpilot.goal-feedback.enabled=true",
        "skillpilot.goal-feedback.operator-token=public-visualization-test-token-at-least-32-bytes"
})
class GoalFeedbackPublicVisualizationIntegrationTest {

    private static final String BOOK_ID = "goal-feedback-public-visualization-test";
    private static final String EDITION = "test-edition-v1";
    private static final String GOAL_ID = "public-visualization-goal";
    private static final String MODEL_URL = "/lernzielbuch/goal-feedback-public-visualization-test.book-model.json";
    private static final String MODEL_DIGEST = "sha256:" + "1".repeat(64);
    private static final String GOAL_FINGERPRINT = "sha256:" + "2".repeat(64);
    private static final String PAGE_FINGERPRINT = "sha256:" + "3".repeat(64);
    private static final String MANIFEST_DIGEST = "sha256:" + "4".repeat(64);
    private static final String IMAGE_URL =
            "/assets/goal-visualizations/test/public-visualization-goal.png";
    private static final byte[] IMAGE_BYTES = Base64.getDecoder().decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GoalFeedbackCanonicalJson canonicalJson;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private GoalFeedbackPublicationRegistry activePublications;

    @Autowired
    private GoalFeedbackSubmissionService submissionService;

    @Test
    void exposesTheExactStaticImageOnlyInThePublicGetShape() throws Exception {
        byte[] modelBytes = modelBytes();
        byte[] indexBytes = indexBytes(modelBytes);
        ResourceLoader resources = new DefaultResourceLoader(getClass().getClassLoader()) {
            @Override
            public Resource getResource(String location) {
                if ("classpath:static/lernzielbuch/index.json".equals(location)) {
                    return new ByteArrayResource(indexBytes, "public visualization test index");
                }
                if (("classpath:static" + MODEL_URL).equals(location)) {
                    return new ByteArrayResource(modelBytes, "public visualization test model");
                }
                if (("classpath:static" + IMAGE_URL).equals(location)) {
                    return new ByteArrayResource(IMAGE_BYTES, "public visualization test image");
                }
                return super.getResource(location);
            }
        };

        GoalFeedbackPublicationRegistry registry = new GoalFeedbackPublicationRegistry(
                objectMapper,
                canonicalJson,
                resources,
                jdbc,
                transactionManager,
                "https://skillpilot.com");
        registry.afterPropertiesSet();

        LinkBinding binding = new LinkBinding(
                BOOK_ID,
                EDITION,
                GOAL_ID,
                GOAL_FINGERPRINT,
                PAGE_FINGERPRINT,
                MODEL_DIGEST,
                1);
        GoalFeedbackApi.PublicResolvedContext publicContext = registry.resolvePublic(binding).orElseThrow();
        GoalFeedbackApi.ResolvedContext trustedContext = registry.resolve(binding).orElseThrow();

        String imageDigest = sha256(IMAGE_BYTES);
        assertThat(publicContext.goal().visualization()).isEqualTo(new GoalFeedbackApi.GoalVisualization(
                "Visualisierung: Testziel",
                GoalFeedbackApi.VISUALIZATION_ENDPOINT_PREFIX
                        + imageDigest.substring("sha256:".length()),
                "Didaktische Visualisierung zum Testziel."));
        GoalFeedbackPublicationRegistry.VisualizationAsset asset = registry
                .resolvePublicVisualization(imageDigest.substring("sha256:".length()))
                .orElseThrow();
        assertThat(asset.bytes()).isEqualTo(IMAGE_BYTES);
        assertThat(asset.mediaType()).isEqualTo("image/png");
        assertThat(asset.digest()).isEqualTo(imageDigest);
        JsonNode trustedJson = objectMapper.valueToTree(trustedContext);
        assertThat(trustedJson.path("goal").has("visualization")).isFalse();
        String snapshotJson = jdbc.queryForObject(
                "SELECT snapshot_json FROM goal_feedback_publication_snapshot WHERE book_id = ?",
                String.class,
                BOOK_ID);
        assertThat(canonicalJson.parseStored(snapshotJson).path("pages").get(0).has("visualization")).isFalse();
    }

    @Test
    void acceptsAndPreservesThePreviouslyPublishedNoticeVersionForCachedForms() throws Exception {
        JsonNode index;
        try (var input = new ClassPathResource("static/lernzielbuch/index.json").getInputStream()) {
            index = objectMapper.readTree(input);
        }
        JsonNode book = index.path("books").get(0);
        JsonNode model;
        try (var input = new ClassPathResource(
                "static" + book.path("model").path("url").textValue()).getInputStream()) {
            model = objectMapper.readTree(input);
        }
        JsonNode page = model.path("pages").get(0);
        LinkBinding binding = new LinkBinding(
                book.path("bookId").textValue(),
                model.path("book").path("edition").textValue(),
                page.path("goalId").textValue(),
                page.path("goalFingerprint").textValue(),
                page.path("pageFingerprint").textValue(),
                model.path("digest").textValue(),
                page.path("pageNumber").intValue());
        GoalFeedbackApi.ResolvedContext resolved = activePublications.resolve(binding).orElseThrow();

        ObjectNode wrapper = objectMapper.createObjectNode();
        wrapper.put("clientSubmissionId", UUID.randomUUID().toString());
        wrapper.put("website", "");
        ObjectNode envelope = wrapper.putObject("envelope");
        envelope.put("$schema", GoalFeedbackApi.SCHEMA_URL);
        envelope.put("schemaVersion", 2);
        envelope.set("context", objectMapper.valueToTree(resolved.context()));
        envelope.putObject("feedback")
                .put("category", "other")
                .put("observation", "Hinweis aus einem noch zwischengespeicherten Formular.");
        envelope.put("privacyNoticeVersion", "2026-08-30.1");
        envelope.put("privacyNoticeLocale", "de");
        envelope.put("privacyAcknowledged", true);
        envelope.put("automatedProcessingAcknowledged", true);

        GoalFeedbackApi.SubmissionReceipt receipt = submissionService.submit(
                objectMapper.writeValueAsBytes(wrapper));
        String storedEnvelope = jdbc.queryForObject(
                "SELECT envelope_json FROM goal_feedback_submission WHERE id = ?",
                String.class,
                receipt.feedbackId());
        assertThat(canonicalJson.parseStored(storedEnvelope).path("privacyNoticeVersion").textValue())
                .isEqualTo("2026-08-30.1");
    }

    private byte[] modelBytes() throws Exception {
        ObjectNode model = objectMapper.createObjectNode();
        ObjectNode book = model.putObject("book");
        book.put("id", BOOK_ID);
        book.put("title", "Lernzielbuch-Visualisierungstest");
        book.put("locale", "de-DE");
        book.put("pageCount", 1);
        book.put("edition", EDITION);
        model.put("digest", MODEL_DIGEST);
        ObjectNode page = model.putArray("pages").addObject();
        page.put("pageNumber", 1);
        page.put("goalId", GOAL_ID);
        page.put("title", "Testziel");
        page.put("description", "Die lernende Person kann das Testziel nachvollziehen.");
        page.putArray("breadcrumbs").add("Testkapitel");
        ObjectNode visualization = page.putObject("visualization");
        visualization.put("resourceType", "image");
        visualization.put("title", "Visualisierung: Testziel");
        visualization.put("url", IMAGE_URL);
        visualization.put("altText", "Didaktische Visualisierung zum Testziel.");
        visualization.put("originalDigest", sha256(IMAGE_BYTES));
        visualization.put("qaStatus", "approved");
        visualization.put("approvedForPublication", true);
        page.put("goalFingerprint", GOAL_FINGERPRINT);
        page.put("pageFingerprint", PAGE_FINGERPRINT);
        return objectMapper.writeValueAsBytes(model);
    }

    private byte[] indexBytes(byte[] modelBytes) throws Exception {
        ObjectNode index = objectMapper.createObjectNode();
        index.put("schemaVersion", 1);
        ObjectNode book = index.putArray("books").addObject();
        book.put("bookId", BOOK_ID);
        book.put("title", "Lernzielbuch-Visualisierungstest");
        book.put("locale", "de-DE");
        book.put("pageCount", 1);
        ObjectNode model = book.putObject("model");
        model.put("url", MODEL_URL);
        model.put("sha256", sha256(modelBytes));
        model.put("modelDigest", MODEL_DIGEST);
        book.putObject("pdf").put("renderManifestSha256", MANIFEST_DIGEST);
        return objectMapper.writeValueAsBytes(index);
    }

    private static String sha256(byte[] value) throws Exception {
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value));
    }
}
