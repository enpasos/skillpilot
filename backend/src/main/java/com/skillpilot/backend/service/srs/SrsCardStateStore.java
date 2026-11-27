package com.skillpilot.backend.service.srs;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.LearnerCardState;
import com.skillpilot.backend.domain.LearnerCardStateId;
import com.skillpilot.backend.repository.LearnerCardStateRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.TreeMap;
import java.util.function.BiFunction;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * The learner's card states, one row per learner, deck goal node and card.
 *
 * <p>This replaces the former JSON block per learner and deck goal
 * ({@code learner_client_state}). That table and its rows stay in place,
 * unread and unwritten, as the fallback copy of the one-time migration
 * (Liquibase change 047). A practice rating or a Verified Recall result writes
 * only the rows of the cards concerned. Whole-node writes (Cockpit sync and
 * signed restore) also write the node record, the node's synchronization
 * timestamp.</p>
 *
 * <p>The optimistic-concurrency timestamp of a node is the latest
 * {@code updated_at} of its rows, node record included.</p>
 */
@Component
@Transactional
public class SrsCardStateStore {

    private static final int QUERY_BATCH_SIZE = 500;
    private static final String INVALID_MISSING = "missing";

    private final LearnerCardStateRepository rows;
    private final ObjectMapper mapper;

    public SrsCardStateStore(LearnerCardStateRepository rows, ObjectMapper mapper) {
        this.rows = Objects.requireNonNull(rows, "rows");
        this.mapper = Objects.requireNonNull(mapper, "mapper");
    }

    /**
     * Complete state of one node: synchronization timestamp and card state
     * objects by card id. A damaged node still reports its timestamp; its cards
     * are readable only through {@link #readable()}, which then fails closed.
     */
    public record NodeState(Instant updatedAt, Map<String, Object> cards, String damage, Throwable cause) {
        public Map<String, Object> readable() {
            if (damage != null) {
                throw cause == null ? new SrsStateUnavailableException(damage)
                        : new SrsStateUnavailableException(damage, cause);
            }
            return cards;
        }
    }

    /** Typed facts of one node; a damaged node carries the failure strict readers must report. */
    public record NodeSummary(String damage, Map<String, SrsCardStateSummary> cards) {
        public boolean damaged() {
            return damage != null;
        }

        public SrsCardStateSummary card(String cardId) {
            return cards.get(cardId);
        }

        public void requireReadable() {
            if (damage != null) {
                throw new SrsStateUnavailableException(damage);
            }
        }
    }

    /** Reads the complete node state; see {@link NodeState#readable()} for damaged nodes. */
    public NodeState loadNode(String skillpilotId, String nodeId) {
        return toNodeState(rows.findNode(skillpilotId, nodeId));
    }

    /** Typed facts of many nodes with one query per 500 nodes; nodes without rows are absent. */
    public Map<String, NodeSummary> summaries(String skillpilotId, Collection<String> nodeIds) {
        if (nodeIds == null || nodeIds.isEmpty()) {
            return Map.of();
        }
        List<String> ids = List.copyOf(new java.util.LinkedHashSet<>(nodeIds));
        Map<String, String> damage = new HashMap<>();
        Map<String, Map<String, SrsCardStateSummary>> cards = new HashMap<>();
        for (int from = 0; from < ids.size(); from += QUERY_BATCH_SIZE) {
            for (var row : rows.findSummaries(skillpilotId, ids.subList(from, Math.min(from + QUERY_BATCH_SIZE, ids.size())))) {
                Map<String, SrsCardStateSummary> node = cards.computeIfAbsent(row.nodeId(), ignored -> new HashMap<>());
                if (LearnerCardState.NODE_RECORD_CARD_ID.equals(row.cardId())) {
                    if (row.invalidReason() != null) {
                        damage.put(row.nodeId(), damageMessage(row.invalidReason()));
                    }
                    continue;
                }
                node.put(row.cardId(), new SrsCardStateSummary(row.recallStatus(), recallTestedAt(row),
                        row.nextReviewAt(), row.practiceRepetition()));
            }
        }
        Map<String, NodeSummary> result = new HashMap<>();
        cards.forEach((nodeId, nodeCards) -> result.put(nodeId,
                new NodeSummary(damage.get(nodeId), Collections.unmodifiableMap(nodeCards))));
        return Collections.unmodifiableMap(result);
    }

    private Instant recallTestedAt(LearnerCardStateRepository.Summary row) {
        // Older rows may keep their only pass date in the portable card payload.
        if (row.undatedPassState() == null) return row.recallTestedAt();
        try {
            var recall = mapper.readTree(row.undatedPassState()).path("verifiedRecall");
            return SrsCardStateSummary.parseInstant(recall.path("passedAt").asText(null));
        } catch (com.fasterxml.jackson.core.JsonProcessingException malformed) {
            return null;
        }
    }

    /** Complete state objects of the named cards of one node; absent cards have no entry. */
    public Map<String, Map<String, Object>> loadCards(String skillpilotId, String nodeId, Collection<String> cardIds) {
        if (cardIds == null || cardIds.isEmpty()) {
            return Map.of();
        }
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        for (LearnerCardState row : rows.findCards(skillpilotId, nodeId, List.copyOf(cardIds))) {
            if (!row.isNodeRecord()) {
                result.put(row.getId().getCardId(), readCard(row));
            }
        }
        return result;
    }

    /**
     * Reads, changes and writes exactly the named card rows with one query;
     * other cards and the node record stay untouched. The function receives a
     * mutable copy of the stored state object (empty for a card without row)
     * and returns the state to store.
     */
    public Map<String, Map<String, Object>> updateCards(String skillpilotId, String nodeId, List<String> cardIds,
            BiFunction<String, Map<String, Object>, Map<String, Object>> update, Instant at) {
        if (cardIds == null || cardIds.isEmpty()) {
            return Map.of();
        }
        Map<String, LearnerCardState> existing = new HashMap<>();
        rows.findCards(skillpilotId, nodeId, List.copyOf(cardIds))
                .forEach(row -> existing.put(row.getId().getCardId(), row));
        Instant stored = truncate(at);
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        List<LearnerCardState> changed = new ArrayList<>();
        for (String cardId : cardIds) {
            requireCardId(cardId);
            LearnerCardState row = existing.get(cardId);
            Map<String, Object> current = row == null ? new LinkedHashMap<>() : new LinkedHashMap<>(readCard(row));
            Map<String, Object> next = update.apply(cardId, current);
            if (row == null) {
                row = new LearnerCardState(new LearnerCardStateId(skillpilotId, nodeId, cardId));
            }
            write(row, next, stored);
            changed.add(row);
            result.put(cardId, next);
        }
        rows.saveAll(changed);
        return result;
    }

    /**
     * Replaces the whole node state (Cockpit sync, signed restore): unchanged
     * cards keep their rows, changed cards are rewritten, omitted cards are
     * removed, and the node record takes the given timestamp.
     */
    public void replaceNode(String skillpilotId, String nodeId, Map<String, ?> cards, Instant at) {
        Instant stored = truncate(at);
        Map<String, LearnerCardState> existing = new HashMap<>();
        LearnerCardState nodeRecord = null;
        for (LearnerCardState row : rows.findNode(skillpilotId, nodeId)) {
            if (row.isNodeRecord()) {
                nodeRecord = row;
            } else {
                existing.put(row.getId().getCardId(), row);
            }
        }
        List<LearnerCardState> changed = new ArrayList<>();
        for (var entry : cards.entrySet()) {
            requireCardId(entry.getKey());
            String json = serialize(entry.getValue());
            LearnerCardState row = existing.remove(entry.getKey());
            if (row != null && json.equals(row.getCardState())) {
                continue;
            }
            if (row == null) {
                row = new LearnerCardState(new LearnerCardStateId(skillpilotId, nodeId, entry.getKey()));
            }
            write(row, json, entry.getValue(), stored);
            changed.add(row);
        }
        if (nodeRecord == null) {
            nodeRecord = new LearnerCardState(new LearnerCardStateId(
                    skillpilotId, nodeId, LearnerCardState.NODE_RECORD_CARD_ID));
        }
        nodeRecord.setUpdatedAt(stored);
        changed.add(nodeRecord);
        if (!existing.isEmpty()) {
            rows.deleteAll(existing.values());
        }
        rows.saveAll(changed);
    }

    /** All nodes of a learner in node order; any damaged node makes the export a technical failure. */
    public Map<String, Map<String, Object>> exportAll(String skillpilotId) {
        Map<String, List<LearnerCardState>> byNode = new TreeMap<>();
        for (LearnerCardState row : rows.findLearner(skillpilotId)) {
            byNode.computeIfAbsent(row.getId().getNodeId(), ignored -> new ArrayList<>()).add(row);
        }
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        byNode.forEach((nodeId, nodeRows) -> result.put(nodeId, toNodeState(nodeRows).readable()));
        return result;
    }

    /** The stored projection used for filtering, for callers that hold a state object. */
    public static SrsCardStateSummary summarize(Object state) {
        return SrsCardStateSummary.of(state);
    }

    private NodeState toNodeState(List<LearnerCardState> nodeRows) {
        Instant updatedAt = null;
        String damage = null;
        List<LearnerCardState> cards = new ArrayList<>();
        for (LearnerCardState row : nodeRows) {
            if (row.isNodeRecord() && row.getInvalidReason() != null) {
                damage = damageMessage(row.getInvalidReason());
            }
            if (row.getUpdatedAt() != null && (updatedAt == null || row.getUpdatedAt().isAfter(updatedAt))) {
                updatedAt = row.getUpdatedAt();
            }
            if (!row.isNodeRecord()) {
                cards.add(row);
            }
        }
        if (damage != null) {
            return new NodeState(updatedAt, Map.of(), damage, null);
        }
        cards.sort(Comparator.comparing(row -> row.getId().getCardId()));
        Map<String, Object> state = new LinkedHashMap<>();
        try {
            for (LearnerCardState row : cards) {
                state.put(row.getId().getCardId(), readCard(row));
            }
        } catch (SrsStateUnavailableException unreadable) {
            return new NodeState(updatedAt, Map.of(), unreadable.getMessage(), unreadable.getCause());
        }
        return new NodeState(updatedAt, Collections.unmodifiableMap(state), null, null);
    }

    private Map<String, Object> readCard(LearnerCardState row) {
        if (row.getCardState() == null || row.getCardState().isBlank()) {
            throw new SrsStateUnavailableException("Stored SRS state is missing");
        }
        try {
            Map<String, Object> state = mapper.readValue(row.getCardState(), new TypeReference<Map<String, Object>>() { });
            if (state == null) {
                throw new SrsStateUnavailableException("Stored SRS state is invalid");
            }
            return state;
        } catch (SrsStateUnavailableException unavailable) {
            throw unavailable;
        } catch (Exception error) {
            throw new SrsStateUnavailableException("Stored SRS state is invalid", error);
        }
    }

    private void write(LearnerCardState row, Map<String, Object> state, Instant at) {
        write(row, serialize(state), state, at);
    }

    private static void write(LearnerCardState row, String json, Object state, Instant at) {
        SrsCardStateSummary summary = SrsCardStateSummary.of(state);
        row.setCardState(json);
        row.setRecallStatus(summary.recallStatus());
        row.setRecallTestedAt(truncate(summary.recallTestedAt()));
        row.setNextReviewAt(summary.nextReviewAt());
        row.setPracticeRepetition(summary.practiceRepetition());
        row.setUpdatedAt(at);
    }

    private String serialize(Object state) {
        if (!(state instanceof Map<?, ?>)) {
            throw new IllegalArgumentException("Each SRS card state must be an object");
        }
        try {
            return mapper.writeValueAsString(state);
        } catch (Exception error) {
            throw new IllegalStateException("Card state could not be stored", error);
        }
    }

    private static Instant truncate(Instant at) {
        return at == null ? null : at.truncatedTo(ChronoUnit.MICROS);
    }

    private static void requireCardId(String cardId) {
        if (cardId == null || cardId.isBlank() || cardId.length() > 255) {
            throw new IllegalArgumentException("SRS state identifier is invalid");
        }
    }

    static String damageMessage(String invalidReason) {
        return INVALID_MISSING.equals(invalidReason) ? "Stored SRS state is missing" : "Stored SRS state is invalid";
    }
}
