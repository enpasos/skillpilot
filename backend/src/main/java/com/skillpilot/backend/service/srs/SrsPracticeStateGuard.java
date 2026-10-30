package com.skillpilot.backend.service.srs;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Separates untrusted practice scheduling from server-owned recall results. */
public final class SrsPracticeStateGuard {
    private static final Set<String> PRACTICE_FIELDS = Set.of(
            "id", "interval", "repetition", "ef", "nextReview", "lastReviewed");

    private SrsPracticeStateGuard() { }

    public static boolean matches(Instant current, Instant expected) {
        return Objects.equals(current, expected);
    }

    public static Map<String, Object> mergePractice(
            Map<String, Object> current, Map<String, Object> incoming) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (incoming != null) {
            for (var entry : incoming.entrySet()) {
                requireCardId(entry.getKey());
                if (!(entry.getValue() instanceof Map<?, ?> card)) {
                    throw new IllegalArgumentException("Each SRS card state must be an object");
                }
                Map<String, Object> practice = new LinkedHashMap<>();
                for (String field : PRACTICE_FIELDS) {
                    if (card.containsKey(field)) {
                        practice.put(field, card.get(field));
                    }
                }
                practice.put("id", entry.getKey());
                result.put(entry.getKey(), practice);
            }
        }
        // A client may neither create a result nor erase one by omitting a card.
        for (var entry : current.entrySet()) {
            if (!(entry.getValue() instanceof Map<?, ?> card)) {
                throw new SrsStateUnavailableException("Stored SRS card state is invalid");
            }
            Object verified = card.get("verifiedRecall");
            if (verified == null) {
                continue;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> merged = result.containsKey(entry.getKey())
                    ? (Map<String, Object>) result.get(entry.getKey())
                    : new LinkedHashMap<>((Map<String, Object>) card);
            merged.put("verifiedRecall", verified);
            result.put(entry.getKey(), merged);
        }
        return result;
    }

    public static void validatePortable(Map<String, Map<String, Object>> states) {
        if (states == null || states.size() > 10_000) {
            throw new IllegalArgumentException("Signed SRS states are missing or too large");
        }
        for (var entry : states.entrySet()) {
            requireCardId(entry.getKey());
            if (entry.getValue() == null || entry.getValue().size() > 100_000) {
                throw new IllegalArgumentException("Signed SRS goal state is invalid");
            }
            for (var card : entry.getValue().entrySet()) {
                requireCardId(card.getKey());
                if (!(card.getValue() instanceof Map<?, ?> value)) {
                    throw new IllegalArgumentException("Signed SRS card state must be an object");
                }
                Object verified = value.get("verifiedRecall");
                if (verified != null) {
                    if (!(verified instanceof Map<?, ?> recall)) {
                        throw new IllegalArgumentException("Signed recall state must be an object");
                    }
                    Object status = recall.get("status");
                    if (!"passed".equals(status) && !"failed".equals(status)) {
                        throw new IllegalArgumentException("Recall status is invalid");
                    }
                    // Old authoritative passes need no newly introduced attempt metadata.
                    // A malformed result must still remain distinguishable from no result.
                    if ("passed".equals(status)) requireTimestamp(recall.get("passedAt"));
                    for (String field : Set.of("lastTestedAt", "lastFailedAt", "nextEligibleAt", "passedAt")) {
                        if (recall.containsKey(field)) requireTimestamp(recall.get(field));
                    }
                    for (String field : Set.of("attempts", "failures")) {
                        if (recall.containsKey(field) && (!(recall.get(field) instanceof Number number)
                                || !Double.isFinite(number.doubleValue()) || number.doubleValue() < 0
                                || number.doubleValue() != Math.rint(number.doubleValue()))) {
                            throw new IllegalArgumentException("Recall counter is invalid");
                        }
                    }
                }
            }
        }
    }

    private static void requireTimestamp(Object value) {
        if (!(value instanceof String text) || text.isBlank()) throw new IllegalArgumentException("Recall timestamp is missing");
        try { Instant.parse(text); }
        catch (RuntimeException invalid) { throw new IllegalArgumentException("Recall timestamp is invalid", invalid); }
    }

    private static void requireCardId(String id) {
        if (id == null || id.isBlank() || id.length() > 255) {
            throw new IllegalArgumentException("SRS state identifier is invalid");
        }
    }
}
