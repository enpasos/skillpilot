package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningPlanDailyProgressTest {
    private static final LocalDate TODAY = LocalDate.parse("2026-09-11");
    // Four older goals and two newly due goals; the quota is two, not all six.
    private static final List<LearnerLearningPlanApi.Block> BLOCKS = List.of(
            block("old", "2026-09-10", List.of("a", "b", "c", "d")),
            block("today", "2026-09-11", List.of("e", "f")));

    @Test
    void overdueSuccessFillsTodaysQuotaBeforeReducingResidualBacklog() {
        var before = progress(Map.of(), Set.of());
        var after = progress(Map.of("a", 1.0), Set.of("a"));
        assertThat(before.dueToday()).isEqualTo(2);
        assertThat(after.dueToday()).isEqualTo(2);
        assertThat(after.completedDueToday()).isEqualTo(1);
        assertThat(after.openDueToday()).isEqualTo(1);
        assertThat(after.extraCompletedToday()).isZero();
        assertThat(after.openDueThroughToday() - after.openDueToday()).isEqualTo(4);
    }

    @Test
    void quotaCompletionIsRealEvenWhenTodaysAssignedIdsAreStillOpen() {
        var result = progress(Map.of("a", 1.0, "b", 1.0), Set.of("a", "b"));
        assertThat(result.dueToday()).isEqualTo(2);
        assertThat(result.completedDueToday()).isEqualTo(2);
        assertThat(result.openDueToday()).isZero();
        assertThat(result.openDueThroughToday()).isEqualTo(4);
    }

    @Test
    void extraCompletionsAreSeparateAndCannotInflateQuotaCredit() {
        var result = progress(Map.of("a", 1.0, "b", 1.0, "c", 1.0), Set.of("a", "b", "c"));
        assertThat(result.dueToday()).isEqualTo(2);
        assertThat(result.completedDueToday()).isEqualTo(2);
        assertThat(result.extraCompletedToday()).isEqualTo(1);
        assertThat(result.openDueThroughToday()).isEqualTo(3);
    }

    @Test
    void oldMasteryAndImportsAreNeverFabricatedAsTodaysSuccesses() {
        var result = progress(Map.of("a", 1.0, "e", 1.0), Set.of());
        assertThat(result.completedDueToday()).isZero();
        assertThat(result.extraCompletedToday()).isZero();
        assertThat(result.dueToday()).isEqualTo(2);
    }

    @Test
    void quotaDoesNotDemandMoreThanRemainingWorkAndRemainsStableThroughCompletion() {
        Map<String, Double> earlier = Map.of("a", 1.0, "b", 1.0, "c", 1.0, "d", 1.0, "e", 1.0);
        var before = progress(earlier, Set.of());
        var after = progress(Map.of("a", 1.0, "b", 1.0, "c", 1.0, "d", 1.0, "e", 1.0, "f", 1.0), Set.of("f"));
        assertThat(before.dueToday()).isEqualTo(1);
        assertThat(after.dueToday()).isEqualTo(before.dueToday());
        assertThat(after.completedDueToday()).isEqualTo(1);
        assertThat(after.openDueToday()).isZero();
    }

    @Test
    void noCrossSubjectOrFutureGoalCreditAndNoCreditForRevokedMastery() {
        var result = progress(Map.of("physics", 1.0, "future", 1.0, "a", 0.5),
                Set.of("physics", "future", "a"));
        assertThat(result.completedDueToday()).isZero();
        assertThat(result.extraCompletedToday()).isZero();
    }

    @Test
    void weekendHasNoObligationButCelebratesVoluntaryExtra() {
        var result = LearnerLearningPlanService.dailyMetrics(BLOCKS, TODAY.plusDays(1),
                Map.of("a", 1.0), Set.of("a"));
        assertThat(result.dueToday()).isZero();
        assertThat(result.openDueToday()).isZero();
        assertThat(result.extraCompletedToday()).isEqualTo(1);
    }

    @Test
    void dayRolloverDoesNotReuseYesterdaysEvents() {
        var result = LearnerLearningPlanService.dailyMetrics(BLOCKS, TODAY.plusDays(1),
                Map.of("a", 1.0), Set.of());
        assertThat(result.completedDueToday()).isZero();
        assertThat(result.extraCompletedToday()).isZero();
    }

    @Test
    void overlappingBlocksCountEachGoalOnlyOnce() {
        var result = LearnerLearningPlanService.dailyMetrics(List.of(
                block("one", "2026-09-11", List.of("a", "b")),
                block("two", "2026-09-11", List.of("a", "c"))), TODAY,
                Map.of("a", 1.0), Set.of("a"));
        assertThat(result.dueToday()).isEqualTo(3);
        assertThat(result.completedDueToday()).isEqualTo(1);
        assertThat(result.openDueToday()).isEqualTo(2);
    }

    private static LearnerLearningPlanApi.Metrics progress(Map<String, Double> mastery, Set<String> completions) {
        return LearnerLearningPlanService.dailyMetrics(BLOCKS, TODAY, mastery, completions);
    }

    private static LearnerLearningPlanApi.Block block(String id, String date, List<String> goals) {
        return new LearnerLearningPlanApi.Block(id, "learning", "focus", id,
                LocalDate.parse(date), LocalDate.parse(date), null, goals);
    }
}
