package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.sql.Connection;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

/** PDF rerendering must not mutate or invalidate the durable semantic publication. */
class GoalFeedbackPublicationRenderVariantTest {
    private static final String INDEX = "classpath:static/lernzielbuch/index.json";
    private static final String MODEL_URL = "/lernzielbuch/goal-feedback-test-book.book-model.json";
    private static final String FIRST_MANIFEST = "sha256:" + "4".repeat(64);
    private static final String LATER_MANIFEST = "sha256:" + "6".repeat(64);

    private final ObjectMapper mapper = new ObjectMapper();
    private final GoalFeedbackCanonicalJson canonicalJson = new GoalFeedbackCanonicalJson(mapper);
    private JdbcTemplate jdbc;
    private DataSourceTransactionManager transactions;
    private Connection databaseLifetime;
    private ObjectNode model;
    private byte[] modelBytes;

    @BeforeEach
    void setUp() throws Exception {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:goal-book-render-" + UUID.randomUUID()
                + ";MODE=PostgreSQL");
        databaseLifetime = dataSource.getConnection();
        jdbc = new JdbcTemplate(dataSource);
        transactions = new DataSourceTransactionManager(dataSource);
        // Minimal copies of the existing publication tables; the production
        // handoff integration test separately exercises the real Liquibase DDL.
        jdbc.execute("CREATE TABLE goal_feedback_inbox_capacity (id SMALLINT PRIMARY KEY)");
        jdbc.update("INSERT INTO goal_feedback_inbox_capacity (id) VALUES (1)");
        jdbc.execute("""
                CREATE TABLE goal_feedback_publication_snapshot (
                    id UUID PRIMARY KEY, book_id VARCHAR(200) NOT NULL,
                    edition VARCHAR(200) NOT NULL, book_digest VARCHAR(71) NOT NULL,
                    model_sha256 VARCHAR(71) NOT NULL, title VARCHAR(1000) NOT NULL,
                    locale VARCHAR(50) NOT NULL, render_manifest_fingerprint VARCHAR(71) NOT NULL,
                    snapshot_json TEXT NOT NULL, first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    UNIQUE (book_id, edition, book_digest))
                """);
        jdbc.execute("""
                CREATE TABLE goal_feedback_publication_current (
                    book_id VARCHAR(200) PRIMARY KEY,
                    snapshot_id UUID NOT NULL UNIQUE REFERENCES goal_feedback_publication_snapshot(id),
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL)
                """);
        try (var input = new ClassPathResource("static" + MODEL_URL).getInputStream()) {
            model = (ObjectNode) mapper.readTree(input);
        }
        modelBytes = mapper.writeValueAsBytes(model);
    }

    @AfterEach
    void tearDown() throws Exception {
        databaseLifetime.close();
    }

    @Test
    void rerenderAndRestartsPreserveOriginalAuditRowsAndAllLinkBindings() throws Exception {
        GoalFeedbackPublicationRegistry first = start(FIRST_MANIFEST, modelBytes);
        GoalFeedbackApi.LinkBinding binding = binding();
        GoalFeedbackApi.ResolvedContext original = first.resolve(binding).orElseThrow();
        List<Map<String, Object>> snapshotBefore = snapshotRows();
        List<Map<String, Object>> currentBefore = currentRows();

        GoalFeedbackPublicationRegistry rebuilt = start(LATER_MANIFEST, modelBytes);
        assertThatCode(rebuilt::afterPropertiesSet).doesNotThrowAnyException();
        assertThatCode(first::afterPropertiesSet).doesNotThrowAnyException();

        assertThat(snapshotRows()).isEqualTo(snapshotBefore);
        assertThat(currentRows()).isEqualTo(currentBefore);
        assertThat(rebuilt.resolve(binding)).contains(original);
        assertThat(rebuilt.resolveCurrentBinding(binding.bookId(), binding.goalId())).contains(binding);
        assertThat(rebuilt.isCurrent(binding)).isTrue();
        assertThat(rebuilt.resolvePublic(binding).orElseThrow().context()).isEqualTo(original.context());
        assertThat(original.context().publicationManifestFingerprint()).isEqualTo(FIRST_MANIFEST);

        GoalFeedbackApi.LinkBinding wrongPageFingerprint = new GoalFeedbackApi.LinkBinding(
                binding.bookId(), binding.edition(), binding.goalId(), binding.goalFingerprint(),
                "sha256:" + "9".repeat(64), binding.bookDigest(), binding.page());
        assertThat(rebuilt.resolve(wrongPageFingerprint)).isEmpty();
    }

    @Test
    void sameManifestRestartIsAlsoIdempotent() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        List<Map<String, Object>> before = snapshotRows();
        start(FIRST_MANIFEST, modelBytes);
        assertThat(snapshotRows()).isEqualTo(before);
    }

    @Test
    void rejectsDifferentModelBytesEvenWhenTheParsedBookAndDigestAreUnchanged() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        byte[] differentBytes = (new String(modelBytes, StandardCharsets.UTF_8) + "\n")
                .getBytes(StandardCharsets.UTF_8);
        rejectsWithoutChangingRows(LATER_MANIFEST, differentBytes);
    }

    @Test
    void rejectsChangedPageTextUnderAnUnchangedBookDigest() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        ((ObjectNode) model.withArray("pages").get(0)).put("description", "Unzulässig veränderter Lernzieltext.");
        rejectsWithoutChangingRows(LATER_MANIFEST, mapper.writeValueAsBytes(model));
    }

    @Test
    void rejectsTamperedStoredPageEvenWhenModelHashAndManifestColumnsStillMatch() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        ObjectNode snapshot = storedSnapshot();
        ((ObjectNode) snapshot.withArray("pages").get(0)).put("title", "Veränderter gespeicherter Titel");
        jdbc.update("UPDATE goal_feedback_publication_snapshot SET snapshot_json = ?",
                canonicalJson.serialize(snapshot));
        rejectsWithoutChangingRows(LATER_MANIFEST, modelBytes);
    }

    @Test
    void rejectsManifestColumnThatDisagreesWithTheImmutableSnapshotJson() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        jdbc.update("UPDATE goal_feedback_publication_snapshot SET render_manifest_fingerprint = ?",
                LATER_MANIFEST);
        rejectsWithoutChangingRows(LATER_MANIFEST, modelBytes);
    }

    @Test
    void rejectsSnapshotManifestThatDisagreesWithItsColumn() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        ObjectNode snapshot = storedSnapshot();
        snapshot.put("renderManifestFingerprint", LATER_MANIFEST);
        jdbc.update("UPDATE goal_feedback_publication_snapshot SET snapshot_json = ?",
                canonicalJson.serialize(snapshot));
        rejectsWithoutChangingRows(LATER_MANIFEST, modelBytes);
    }

    @Test
    void rejectsInvalidStoredManifestEvenIfItsColumnAndSnapshotAgree() throws Exception {
        start(FIRST_MANIFEST, modelBytes);
        ObjectNode snapshot = storedSnapshot();
        snapshot.put("renderManifestFingerprint", "not-a-digest");
        jdbc.update("""
                UPDATE goal_feedback_publication_snapshot
                SET render_manifest_fingerprint = ?, snapshot_json = ?
                """, "not-a-digest", canonicalJson.serialize(snapshot));
        rejectsWithoutChangingRows(LATER_MANIFEST, modelBytes);
    }

    private void rejectsWithoutChangingRows(String manifest, byte[] bytes) {
        List<Map<String, Object>> snapshotBefore = snapshotRows();
        List<Map<String, Object>> currentBefore = currentRows();
        assertThatThrownBy(() -> start(manifest, bytes))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Durable goal-book snapshot conflicts with verified static publication");
        assertThat(snapshotRows()).isEqualTo(snapshotBefore);
        assertThat(currentRows()).isEqualTo(currentBefore);
    }

    private GoalFeedbackPublicationRegistry start(String manifest, byte[] bytes) throws Exception {
        ObjectNode index;
        try (var input = new ClassPathResource("static/lernzielbuch/index.json").getInputStream()) {
            index = (ObjectNode) mapper.readTree(input);
        }
        ObjectNode book = (ObjectNode) index.withArray("books").get(0);
        book.withObject("model").put("sha256", "sha256:"
                + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)));
        book.withObject("pdf").put("renderManifestSha256", manifest);
        byte[] indexBytes = mapper.writeValueAsBytes(index);
        ResourceLoader resources = new DefaultResourceLoader() {
            @Override
            public Resource getResource(String location) {
                if (INDEX.equals(location)) return new ByteArrayResource(indexBytes);
                if (("classpath:static" + MODEL_URL).equals(location)) return new ByteArrayResource(bytes);
                throw new AssertionError("Unexpected resource: " + location);
            }
        };
        GoalFeedbackPublicationRegistry result = new GoalFeedbackPublicationRegistry(
                mapper, canonicalJson, resources, jdbc, transactions, "https://skillpilot.com");
        result.afterPropertiesSet();
        return result;
    }

    private GoalFeedbackApi.LinkBinding binding() {
        var book = model.path("book");
        var page = model.withArray("pages").get(0);
        return new GoalFeedbackApi.LinkBinding(
                book.path("id").asText(), book.path("edition").asText(), page.path("goalId").asText(),
                page.path("goalFingerprint").asText(), page.path("pageFingerprint").asText(),
                model.path("digest").asText(), page.path("pageNumber").asInt());
    }

    private ObjectNode storedSnapshot() throws Exception {
        return (ObjectNode) mapper.readTree(jdbc.queryForObject(
                "SELECT snapshot_json FROM goal_feedback_publication_snapshot", String.class));
    }

    private List<Map<String, Object>> snapshotRows() {
        return jdbc.queryForList("SELECT * FROM goal_feedback_publication_snapshot");
    }

    private List<Map<String, Object>> currentRows() {
        return jdbc.queryForList("SELECT * FROM goal_feedback_publication_current");
    }
}
