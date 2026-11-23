package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.srs.LegacyCardStateMigration;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** Change 047: every former JSON block becomes one node record plus one row per card, once and losslessly. */
class LearnerCardStateMigrationTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String DECK_BLOCK = """
            {"c1":{"id":"c1","interval":6,"repetition":2,"ef":2.36,"nextReview":1700000000000,"lastReviewed":1699000000000},
             "c2":{"id":"c2","interval":1,"nextReview":5,"verifiedRecall":{"status":"passed","attempts":1,"failures":0,
                   "lastTestedAt":"2026-10-01T10:00:00Z","passedAt":"2026-10-01T10:00:00Z"}},
             "c3":{"id":"c3","nextReview":"2026-12-01T00:00:00Z","repetitions":1,"verifiedRecall":{"status":"failed",
                   "attempts":2,"failures":2,"lastTestedAt":"2026-11-20T09:00:00Z","lastFailedAt":"2026-11-20T09:00:00Z",
                   "nextEligibleAt":"2026-11-20T23:00:00Z"}}}""";
    private static final LocalDateTime DECK_UPDATED = LocalDateTime.parse("2026-11-20T09:00:00.123456");

    @ParameterizedTest
    @ValueSource(strings = {";MODE=PostgreSQL", ""})
    void blocksBecomeCardRowsOnceAndUnreadableBlocksStayDamaged(String mode) throws Exception {
        try (Connection connection = DriverManager.getConnection("jdbc:h2:mem:" + UUID.randomUUID() + mode)) {
            verifyMigration(connection);
        }
    }

    /** The same migration on a real PostgreSQL server, in a disposable schema of the loopback test database. */
    @Test
    @EnabledIfEnvironmentVariable(named = "SKILLPILOT_TEST_POSTGRES_URL", matches = "jdbc:postgresql://(localhost|127\\.0\\.0\\.1)(:\\d+)?/skillpilot_completion_test")
    void blocksBecomeCardRowsOnceOnPostgres() throws Exception {
        String schema = "card_state_migration_" + UUID.randomUUID().toString().replace("-", "");
        try (Connection connection = DriverManager.getConnection(System.getenv("SKILLPILOT_TEST_POSTGRES_URL"),
                System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_USER", "completion_test"),
                System.getenv().getOrDefault("SKILLPILOT_TEST_POSTGRES_PASSWORD", ""))) {
            try (var sql = connection.createStatement()) {
                sql.execute("CREATE SCHEMA " + schema);
                sql.execute("SET search_path TO " + schema);
            }
            try {
                verifyMigration(connection);
            } finally {
                connection.setAutoCommit(true);
                try (var sql = connection.createStatement()) {
                    sql.execute("DROP SCHEMA " + schema + " CASCADE");
                }
            }
        }
    }

    private static void verifyMigration(Connection connection) throws Exception {
        try (var sql = connection.createStatement()) {
            sql.execute("CREATE TABLE learner (skillpilot_id VARCHAR(80) PRIMARY KEY)");
            sql.execute("""
                    CREATE TABLE learner_client_state (
                      skillpilot_id VARCHAR(80) NOT NULL REFERENCES learner(skillpilot_id),
                      node_id VARCHAR(255) NOT NULL, client_state TEXT, client_state_updated_at TIMESTAMP,
                      PRIMARY KEY (skillpilot_id, node_id))""");
            sql.execute("INSERT INTO learner VALUES ('learner-a'), ('learner-b')");
            legacy(connection, "learner-a", "deck", DECK_BLOCK, DECK_UPDATED);
            legacy(connection, "learner-a", "empty", "{}", LocalDateTime.parse("2026-11-01T08:00:00"));
            legacy(connection, "learner-a", "broken", "not-json", LocalDateTime.parse("2026-11-02T08:00:00"));
            legacy(connection, "learner-a", "missing", null, null);
            legacy(connection, "learner-b", "array", "[]", LocalDateTime.parse("2026-11-03T08:00:00"));
            legacy(connection, "learner-b", "invalid-recall", "{\"c\":{\"verifiedRecall\":{\"status\":\"maybe\"}}}",
                    LocalDateTime.parse("2026-11-04T08:00:00"));
            // More blocks than one migration page.
            for (int index = 0; index < 450; index++) {
                legacy(connection, "learner-b", "page-%03d".formatted(index),
                        "{\"card\":{\"id\":\"card\",\"interval\":1,\"nextReview\":" + index + "}}",
                        LocalDateTime.parse("2026-10-01T00:00:00").plusSeconds(index));
            }
            List<List<Object>> legacyBefore = rows(connection,
                    "SELECT skillpilot_id, node_id, client_state, client_state_updated_at FROM learner_client_state ORDER BY 1, 2");

            new Liquibase("db/changelog/changes/047-add-learner-card-state.yaml",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection)).update(new Contexts());

            // The former table is the untouched fallback copy.
            assertThat(rows(connection, "SELECT skillpilot_id, node_id, client_state, client_state_updated_at "
                    + "FROM learner_client_state ORDER BY 1, 2")).isEqualTo(legacyBefore);

            // Lossless card rows, typed projection and the node's synchronization timestamp.
            Map<String, Object> expected = MAPPER.readValue(DECK_BLOCK, new TypeReference<LinkedHashMap<String, Object>>() { });
            Map<String, Object> migrated = new LinkedHashMap<>();
            try (PreparedStatement select = connection.prepareStatement("""
                    SELECT card_id, card_state, recall_status, recall_tested_at, next_review_at, practice_repetition,
                           invalid_reason, updated_at FROM learner_card_state
                    WHERE skillpilot_id = 'learner-a' AND node_id = 'deck' ORDER BY card_id""");
                    ResultSet result = select.executeQuery()) {
                while (result.next()) {
                    String cardId = result.getString(1);
                    assertThat(result.getObject(8, LocalDateTime.class)).isEqualTo(DECK_UPDATED);
                    assertThat(result.getString(7)).isNull();
                    if (cardId.isEmpty()) {
                        assertThat(result.getString(2)).isNull();
                        continue;
                    }
                    migrated.put(cardId, MAPPER.readValue(result.getString(2), new TypeReference<LinkedHashMap<String, Object>>() { }));
                    OffsetDateTime testedAt = result.getObject(4, OffsetDateTime.class);
                    long nextReview = result.getLong(5);
                    boolean noNextReview = result.wasNull();
                    switch (cardId) {
                        case "c1" -> {
                            assertThat(result.getString(3)).isNull();
                            assertThat(nextReview).isEqualTo(1700000000000L);
                            assertThat(result.getInt(6)).isEqualTo(2);
                        }
                        case "c2" -> {
                            assertThat(result.getString(3)).isEqualTo("passed");
                            assertThat(testedAt.toInstant()).isEqualTo(Instant.parse("2026-10-01T10:00:00Z"));
                            assertThat(nextReview).isEqualTo(5L);
                        }
                        case "c3" -> {
                            assertThat(result.getString(3)).isEqualTo("failed");
                            assertThat(testedAt.toInstant()).isEqualTo(Instant.parse("2026-11-20T09:00:00Z"));
                            assertThat(noNextReview).as("without an interval the card is due").isTrue();
                            assertThat(result.getInt(6)).isEqualTo(1);
                        }
                        default -> throw new AssertionError(cardId);
                    }
                }
            }
            assertThat(migrated).isEqualTo(expected);

            assertThat(nodeRecord(connection, "learner-a", "empty")).containsExactly(null, null, 0L);
            assertThat(nodeRecord(connection, "learner-a", "broken")).containsExactly("invalid", "not-json", 0L);
            assertThat(nodeRecord(connection, "learner-a", "missing")).containsExactly("missing", null, 0L);
            assertThat(nodeRecord(connection, "learner-b", "array")).containsExactly("invalid", "[]", 0L);
            assertThat(nodeRecord(connection, "learner-b", "invalid-recall").get(0)).isEqualTo("invalid");
            assertThat(count(connection, "node_id LIKE 'page-%' AND card_id = ''")).isEqualTo(450);
            assertThat(count(connection, "node_id LIKE 'page-%' AND card_id = 'card'")).isEqualTo(450);
            long total = count(connection, "1 = 1");

            // Idempotent: a second run migrates nothing.
            var second = LegacyCardStateMigration.migrate(connection);
            assertThat(second.migratedNodes()).isZero();
            assertThat(second.skippedNodes()).isEqualTo(legacyBefore.size());
            assertThat(count(connection, "1 = 1")).isEqualTo(total);

            // An interrupted run continues with exactly the blocks still missing.
            sql.executeUpdate("DELETE FROM learner_card_state WHERE skillpilot_id = 'learner-a' AND node_id = 'deck'");
            if (!connection.getAutoCommit()) connection.commit();
            var resumed = LegacyCardStateMigration.migrate(connection);
            assertThat(resumed.migratedNodes()).isOne();
            assertThat(resumed.cardRows()).isEqualTo(3);
            assertThat(count(connection, "1 = 1")).isEqualTo(total);

            // Learner deletion removes the learner's card rows.
            sql.executeUpdate("DELETE FROM learner_client_state WHERE skillpilot_id = 'learner-a'");
            sql.executeUpdate("DELETE FROM learner WHERE skillpilot_id = 'learner-a'");
            assertThat(count(connection, "skillpilot_id = 'learner-a'")).isZero();
            assertThat(count(connection, "skillpilot_id = 'learner-b'")).isEqualTo(902);
        }
    }

    private static void legacy(Connection connection, String learner, String node, String state, LocalDateTime updatedAt)
            throws SQLException {
        try (PreparedStatement insert = connection.prepareStatement("INSERT INTO learner_client_state VALUES (?, ?, ?, ?)")) {
            insert.setString(1, learner);
            insert.setString(2, node);
            insert.setString(3, state);
            insert.setObject(4, updatedAt);
            insert.executeUpdate();
        }
    }

    private static List<Object> nodeRecord(Connection connection, String learner, String node) throws SQLException {
        try (PreparedStatement select = connection.prepareStatement("""
                SELECT invalid_reason, invalid_state,
                       (SELECT COUNT(*) FROM learner_card_state c WHERE c.skillpilot_id = n.skillpilot_id
                        AND c.node_id = n.node_id AND c.card_id <> '')
                FROM learner_card_state n WHERE skillpilot_id = ? AND node_id = ? AND card_id = ''""")) {
            select.setString(1, learner);
            select.setString(2, node);
            try (ResultSet result = select.executeQuery()) {
                assertThat(result.next()).as("node record of %s", node).isTrue();
                List<Object> values = new ArrayList<>();
                values.add(result.getString(1));
                values.add(result.getString(2));
                values.add(result.getLong(3));
                return values;
            }
        }
    }

    private static long count(Connection connection, String condition) throws SQLException {
        try (var statement = connection.createStatement();
                var result = statement.executeQuery("SELECT COUNT(*) FROM learner_card_state WHERE " + condition)) {
            result.next();
            return result.getLong(1);
        }
    }

    private static List<List<Object>> rows(Connection connection, String query) throws SQLException {
        List<List<Object>> rows = new ArrayList<>();
        try (var statement = connection.createStatement(); var result = statement.executeQuery(query)) {
            while (result.next()) {
                List<Object> row = new ArrayList<>();
                for (int column = 1; column <= result.getMetaData().getColumnCount(); column++) {
                    row.add(column == 4 ? result.getObject(column, LocalDateTime.class) : result.getString(column));
                }
                rows.add(row);
            }
        }
        return rows;
    }
}
