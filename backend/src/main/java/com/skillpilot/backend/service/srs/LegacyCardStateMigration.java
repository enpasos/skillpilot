package com.skillpilot.backend.service.srs;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import liquibase.change.custom.CustomTaskChange;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.exception.CustomChangeException;
import liquibase.exception.SetupException;
import liquibase.exception.ValidationErrors;
import liquibase.resource.ResourceAccessor;

/**
 * One-time migration of the former JSON block per learner and deck goal
 * ({@code learner_client_state}) into one row per card ({@code learner_card_state}).
 *
 * <p>Every block becomes one node record plus one row per card. The node record
 * keeps the block's timestamp, so the Cockpit's optimistic-concurrency value is
 * unchanged. A card row keeps the card's complete state object. A block that the
 * service could not read before (missing, not JSON, not an object of card
 * objects, or an invalid Verified Recall result) becomes a damaged node record
 * holding the raw text, so strict reads keep failing closed and normal
 * projections keep omitting it.</p>
 *
 * <p>The old table and its rows are not changed. The migration walks the old
 * table in key order, commits every page, and skips blocks whose node record
 * already exists, so an interrupted run can simply start again.</p>
 */
public class LegacyCardStateMigration implements CustomTaskChange {

    static final int PAGE_SIZE = 200;
    static final String INVALID = "invalid";
    static final String MISSING = "missing";

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Result result;

    /** Counts of one run. */
    public record Result(int migratedNodes, int damagedNodes, int skippedNodes, int cardRows) { }

    @Override
    public void execute(Database database) throws CustomChangeException {
        try {
            Connection connection = ((JdbcConnection) database.getConnection()).getUnderlyingConnection();
            result = migrate(connection);
        } catch (SQLException | RuntimeException error) {
            throw new CustomChangeException("Card state migration failed", error);
        }
    }

    /** Migrates all blocks; commits after every page when the connection is not in auto-commit mode. */
    public static Result migrate(Connection connection) throws SQLException {
        boolean autoCommit = connection.getAutoCommit();
        connection.setAutoCommit(false);
        int migrated = 0;
        int damaged = 0;
        int skipped = 0;
        int cardRows = 0;
        try {
            String lastLearner = "";
            String lastNode = "";
            boolean first = true;
            while (true) {
                List<LegacyBlock> page = readPage(connection, first, lastLearner, lastNode);
                if (page.isEmpty()) {
                    break;
                }
                first = false;
                for (LegacyBlock block : page) {
                    if (nodeRecordExists(connection, block.learnerId(), block.nodeId())) {
                        skipped++;
                        continue;
                    }
                    Converted converted = convert(block.nodeId(), block.state());
                    insert(connection, block, converted);
                    migrated++;
                    if (converted.invalidReason() != null) {
                        damaged++;
                    }
                    cardRows += converted.cards().size();
                }
                connection.commit();
                LegacyBlock last = page.getLast();
                lastLearner = last.learnerId();
                lastNode = last.nodeId();
            }
            connection.commit();
        } catch (SQLException | RuntimeException error) {
            connection.rollback();
            throw error;
        } finally {
            connection.setAutoCommit(autoCommit);
        }
        return new Result(migrated, damaged, skipped, cardRows);
    }

    private record LegacyBlock(String learnerId, String nodeId, String state, LocalDateTime updatedAt) { }

    /** One converted card: its complete state object as JSON and the typed projection. */
    record ConvertedCard(String cardId, String json, SrsCardStateSummary summary) { }

    /** Either card rows, or a damage marker with the raw block text. */
    record Converted(List<ConvertedCard> cards, String invalidReason, String invalidState) { }

    /** Applies the service's former read rules to one block. */
    static Converted convert(String nodeId, String state) {
        if (state == null || state.isBlank()) {
            return new Converted(List.of(), MISSING, state);
        }
        try {
            Map<String, Object> cards = MAPPER.readValue(state, new TypeReference<LinkedHashMap<String, Object>>() { });
            if (cards == null) {
                return new Converted(List.of(), INVALID, state);
            }
            Map<String, Map<String, Object>> typed = new LinkedHashMap<>();
            for (var entry : cards.entrySet()) {
                if (!(entry.getValue() instanceof Map<?, ?>)) {
                    return new Converted(List.of(), INVALID, state);
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> card = (Map<String, Object>) entry.getValue();
                typed.put(entry.getKey(), card);
            }
            SrsPracticeStateGuard.validatePortable(Map.of(nodeId, cards));
            List<ConvertedCard> converted = new ArrayList<>();
            for (var entry : typed.entrySet()) {
                converted.add(new ConvertedCard(entry.getKey(), MAPPER.writeValueAsString(entry.getValue()),
                        SrsCardStateSummary.of(entry.getValue())));
            }
            return new Converted(converted, null, null);
        } catch (Exception unreadable) {
            return new Converted(List.of(), INVALID, state);
        }
    }

    private static List<LegacyBlock> readPage(Connection connection, boolean first, String lastLearner,
            String lastNode) throws SQLException {
        String sql = "SELECT skillpilot_id, node_id, client_state, client_state_updated_at FROM learner_client_state"
                + (first ? "" : " WHERE skillpilot_id > ? OR (skillpilot_id = ? AND node_id > ?)")
                + " ORDER BY skillpilot_id, node_id";
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            if (!first) {
                statement.setString(1, lastLearner);
                statement.setString(2, lastLearner);
                statement.setString(3, lastNode);
            }
            statement.setMaxRows(PAGE_SIZE);
            List<LegacyBlock> page = new ArrayList<>();
            try (ResultSet rows = statement.executeQuery()) {
                while (rows.next() && page.size() < PAGE_SIZE) {
                    page.add(new LegacyBlock(rows.getString(1), rows.getString(2), rows.getString(3),
                            rows.getObject(4, LocalDateTime.class)));
                }
            }
            return page;
        }
    }

    private static boolean nodeRecordExists(Connection connection, String learnerId, String nodeId) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COUNT(*) FROM learner_card_state WHERE skillpilot_id = ? AND node_id = ? AND card_id = ?")) {
            statement.setString(1, learnerId);
            statement.setString(2, nodeId);
            statement.setString(3, "");
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() && rows.getLong(1) > 0;
            }
        }
    }

    private static void insert(Connection connection, LegacyBlock block, Converted converted) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO learner_card_state (skillpilot_id, node_id, card_id, card_state, recall_status,"
                        + " recall_tested_at, next_review_at, practice_repetition, invalid_reason, invalid_state,"
                        + " updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")) {
            bind(statement, block, "", null, null, 0, converted.invalidReason(), converted.invalidState());
            statement.addBatch();
            for (ConvertedCard card : converted.cards()) {
                bind(statement, block, card.cardId(), card.json(), card.summary(), card.summary().practiceRepetition(),
                        null, null);
                statement.addBatch();
            }
            statement.executeBatch();
        }
    }

    private static void bind(PreparedStatement statement, LegacyBlock block, String cardId, String json,
            SrsCardStateSummary summary, int repetition, String invalidReason, String invalidState) throws SQLException {
        statement.setString(1, block.learnerId());
        statement.setString(2, block.nodeId());
        statement.setString(3, cardId);
        statement.setString(4, json);
        statement.setString(5, summary == null ? null : summary.recallStatus());
        if (summary == null || summary.recallTestedAt() == null) {
            statement.setNull(6, Types.TIMESTAMP_WITH_TIMEZONE);
        } else {
            statement.setObject(6, OffsetDateTime.ofInstant(
                    summary.recallTestedAt().truncatedTo(java.time.temporal.ChronoUnit.MICROS), ZoneOffset.UTC));
        }
        if (summary == null || summary.nextReviewAt() == null) {
            statement.setNull(7, Types.BIGINT);
        } else {
            statement.setLong(7, summary.nextReviewAt());
        }
        statement.setInt(8, repetition);
        statement.setString(9, invalidReason);
        statement.setString(10, invalidState);
        // The block's stored value is copied unchanged, so it reads back as the same instant.
        if (block.updatedAt() == null) {
            statement.setNull(11, Types.TIMESTAMP);
        } else {
            statement.setObject(11, block.updatedAt());
        }
    }

    @Override
    public String getConfirmationMessage() {
        return result == null ? "Card state migration did not run"
                : "Migrated " + result.migratedNodes() + " card state blocks (" + result.damagedNodes()
                        + " kept as damaged, " + result.skippedNodes() + " already migrated) into "
                        + result.cardRows() + " card rows";
    }

    @Override
    public void setUp() throws SetupException {
        // No parameters.
    }

    @Override
    public void setFileOpener(ResourceAccessor resourceAccessor) {
        // No resources.
    }

    @Override
    public ValidationErrors validate(Database database) {
        return new ValidationErrors();
    }
}
