package com.skillpilot.backend.service.srs;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Map;

/**
 * The typed facts the backend filters on, derived from one card state object.
 *
 * <p>The complete state object stays stored as written; these values are a
 * projection of it with the same rules the service has always applied to the
 * JSON: a card is due without a usable schedule, and a Verified Recall result
 * counts as passed only with status {@code passed} and a {@code passedAt}
 * timestamp.</p>
 *
 * @param recallStatus {@code passed}, {@code failed} or {@code null}
 * @param recallTestedAt the last Verified Recall test, if any
 * @param nextReviewAt epoch milliseconds of the next practice review; {@code null} means due now
 * @param practiceRepetition consecutive successful practice reviews (SM-2 repetition)
 */
public record SrsCardStateSummary(
        String recallStatus,
        Instant recallTestedAt,
        Long nextReviewAt,
        int practiceRepetition) {

    public static final String PASSED = "passed";
    public static final String FAILED = "failed";

    public boolean recallPassed() {
        return PASSED.equals(recallStatus);
    }

    public boolean testedOn(Instant instant, ZoneId zone) {
        if (recallTestedAt == null || instant == null) {
            return false;
        }
        LocalDate tested = recallTestedAt.atZone(zone).toLocalDate();
        return tested.equals(instant.atZone(zone).toLocalDate());
    }

    public boolean testedAfter(Instant instant) {
        return recallTestedAt != null && instant != null && recallTestedAt.isAfter(instant);
    }

    /** Practice due-ness of a stored state; a card without stored state is always due. */
    public boolean due(Instant now) {
        return nextReviewAt == null || nextReviewAt <= now.toEpochMilli();
    }

    /** Projects one stored card state object. */
    public static SrsCardStateSummary of(Object rawState) {
        if (!(rawState instanceof Map<?, ?> state)) {
            // Not a stored object: treated like a card without state (always due, no result).
            return new SrsCardStateSummary(null, null, null, 0);
        }
        Object verified = state.get("verifiedRecall");
        String status = null;
        Instant testedAt = null;
        if (verified instanceof Map<?, ?> recall) {
            Object rawStatus = recall.get("status");
            if (PASSED.equals(rawStatus) && recall.get("passedAt") instanceof String passedAt && !passedAt.isBlank()) {
                status = PASSED;
            } else if (FAILED.equals(rawStatus)) {
                status = FAILED;
            }
            testedAt = parseInstant(recall.get("lastTestedAt"));
        }
        return new SrsCardStateSummary(status, testedAt, nextReviewAt(state), repetition(state));
    }

    /** {@code null} when the schedule is unusable, which makes the card due (former rule). */
    private static Long nextReviewAt(Map<?, ?> state) {
        double interval = numberValue(state.get("interval"), Double.NaN);
        Object rawNextReview = state.get("nextReview");
        if (!Double.isFinite(interval)
                || (rawNextReview instanceof Number number && !Double.isFinite(number.doubleValue()))) {
            return null;
        }
        return parseNextReview(rawNextReview);
    }

    private static int repetition(Map<?, ?> state) {
        Object value = state.get("repetition");
        if (value == null) {
            value = state.get("repetitions");
        }
        double parsed = numberValue(value, 0);
        if (!Double.isFinite(parsed)) {
            return 0;
        }
        return Math.max(0, (int) parsed);
    }

    private static double numberValue(Object value, double fallback) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (value instanceof String text) {
            try {
                return Double.parseDouble(text.trim());
            } catch (Exception ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    /** Same accepted forms as the former reader: epoch milliseconds or an ISO-8601 instant. */
    public static Long parseNextReview(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text) {
            String trimmed = text.trim();
            if (trimmed.isEmpty()) {
                return null;
            }
            try {
                return Long.parseLong(trimmed);
            } catch (NumberFormatException ignored) {
                // Fallback to ISO-8601 timestamp.
            }
            try {
                return Instant.parse(trimmed).toEpochMilli();
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }

    /** Same accepted forms as the former reader: Instant, epoch milliseconds or ISO-8601 text. */
    public static Instant parseInstant(Object value) {
        if (value instanceof Instant instant) {
            return instant;
        }
        if (value instanceof Number number) {
            return Instant.ofEpochMilli(number.longValue());
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Instant.parse(text.trim());
            } catch (Exception ignored) {
                try {
                    return Instant.ofEpochMilli(Long.parseLong(text.trim()));
                } catch (Exception ignoredAgain) {
                    return null;
                }
            }
        }
        return null;
    }
}
