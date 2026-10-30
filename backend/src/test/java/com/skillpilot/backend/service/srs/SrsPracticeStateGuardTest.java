package com.skillpilot.backend.service.srs;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;

class SrsPracticeStateGuardTest {
    @Test
    void aFreshClientClockDoesNotReplaceTheExpectedServerRevision() {
        Instant current = Instant.parse("2026-10-30T12:00:00Z");
        assertThat(SrsPracticeStateGuard.matches(current, current)).isTrue();
        assertThat(SrsPracticeStateGuard.matches(current, current.plusSeconds(1))).isFalse();
        assertThat(SrsPracticeStateGuard.matches(current, null)).isFalse();
        assertThat(SrsPracticeStateGuard.matches(null, null)).isTrue();
    }

    @Test
    void onlyPracticeFieldsCanComeFromTheClient() {
        var result = SrsPracticeStateGuard.mergePractice(Map.of(), Map.of("card", Map.of(
                "id", "wrong", "interval", 1, "nextReview", 2,
                "verifiedRecall", Map.of("status", "passed"), "arbitrary", "ignored")));
        assertThat(result).containsEntry("card", Map.of("id", "card", "interval", 1, "nextReview", 2));
    }

    @Test
    void omissionOrReplacementCannotEraseAuthoritativeRecall() {
        var verified = Map.of("status", "passed", "passedAt", "2026-10-30T12:00:00Z");
        var current = Map.<String, Object>of(
                "one", Map.of("id", "one", "nextReview", 9, "verifiedRecall", verified),
                "two", Map.of("id", "two", "nextReview", 8, "verifiedRecall", verified));
        var result = SrsPracticeStateGuard.mergePractice(current,
                Map.of("one", Map.of("nextReview", 11, "verifiedRecall", Map.of("status", "failed"))));
        assertThat(result.get("one")).isEqualTo(Map.of("id", "one", "nextReview", 11, "verifiedRecall", verified));
        assertThat(result.get("two")).isEqualTo(current.get("two"));
    }

    @Test
    void malformedStoredStateIsNotAnUnmasteredResult() {
        assertThatThrownBy(() -> SrsPracticeStateGuard.mergePractice(Map.of("card", "broken"), Map.of()))
                .isInstanceOf(SrsStateUnavailableException.class);
        assertThatThrownBy(() -> SrsPracticeStateGuard.validatePortable(Map.of("goal", Map.of("card", "broken"))))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void existingMinimalAuthoritativePassNeedsNoNewAttemptMetadata() {
        SrsPracticeStateGuard.validatePortable(Map.of("goal", Map.of("card", Map.of("verifiedRecall",
                Map.of("status", "passed", "passedAt", "2026-01-01T00:00:00Z")))));
    }

    @Test
    void malformedRecallStructureIsATechnicalInputError() {
        for (var recall : java.util.List.of(Map.of(), Map.of("status", "unknown"),
                Map.of("status", "passed"), Map.of("status", "passed", "passedAt", "not-a-timestamp"),
                Map.of("status", "failed", "attempts", -1))) {
            assertThatThrownBy(() -> SrsPracticeStateGuard.validatePortable(
                    Map.of("goal", Map.of("card", Map.of("verifiedRecall", recall)))))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }
}
