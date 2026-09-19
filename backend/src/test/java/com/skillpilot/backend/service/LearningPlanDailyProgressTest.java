package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.service.learningplan.PlanBalanceResult;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class LearningPlanDailyProgressTest {
    private static final LocalDate TODAY = LocalDate.parse("2026-09-11");
    private static final List<LearnerLearningPlanApi.Block> BLOCKS = List.of(
            block("old", "2026-09-10", List.of("a", "b", "c", "d")),
            block("today", "2026-09-11", List.of("e", "f")));

    @Test
    void overdueSuccessFillsPeriodQuotaBeforeReducingResidualBacklog() {
        var before = progress(BLOCKS, TODAY, Map.of(), Set.of());
        var after = progress(BLOCKS, TODAY, Map.of("a", 1.0), Set.of("a"));
        assertThat(before.offenesPeriodenpensum()).isEqualTo(2);
        assertThat(after.erfuelltesPeriodenziel()).isEqualTo(1);
        assertThat(after.offenesPeriodenpensum()).isEqualTo(1);
        assertThat(after.rueckstand()).isEqualTo(4);
    }

    @Test
    void reachedPeriodTargetCanRetainBacklogAndFurtherCompletionsReduceIt() {
        var reached = progress(BLOCKS, TODAY, Map.of("a", 1.0, "b", 1.0), Set.of("a", "b"));
        var further = progress(BLOCKS, TODAY, Map.of("a", 1.0, "b", 1.0, "c", 1.0), Set.of("a", "b", "c"));
        assertThat(reached.erfuelltesPeriodenziel()).isEqualTo(2);
        assertThat(reached.offenesPeriodenpensum()).isZero();
        assertThat(reached.rueckstand()).isEqualTo(4);
        assertThat(further.erfuelltesPeriodenziel()).isEqualTo(2);
        assertThat(further.rueckstand()).isEqualTo(3);
    }

    @Test
    void oldMasteryAndImportsAreNeverFabricatedAsPeriodCompletions() {
        var result = progress(BLOCKS, TODAY, Map.of("a", 1.0, "e", 1.0), Set.of());
        assertThat(result.erfuelltesPeriodenziel()).isZero();
        assertThat(result.rueckstand()).isEqualTo(2);
    }

    @Test
    void advanceWorkCoversQuotaWithoutShrinkingTheOriginalPlannedPensum() {
        var before = progress(BLOCKS, TODAY,
                Map.of("a", 1.0, "b", 1.0, "c", 1.0, "d", 1.0, "e", 1.0), Set.of());
        var after = progress(BLOCKS, TODAY,
                Map.of("a", 1.0, "b", 1.0, "c", 1.0, "d", 1.0, "e", 1.0, "f", 1.0), Set.of("f"));
        assertThat(before.erfuelltesPeriodenziel()).isEqualTo(1);
        assertThat(before.offenesPeriodenpensum()).isEqualTo(1);
        assertThat(after.erfuelltesPeriodenziel()).isEqualTo(2);
        assertThat(after.offenesPeriodenpensum()).isZero();
    }

    @Test
    void unrelatedGoalsAndRevokedMasteryReceiveNoCredit() {
        var result = progress(BLOCKS, TODAY, Map.of("physics", 1.0, "outside-plan", 1.0, "a", 0.5),
                Set.of("physics", "outside-plan", "a"));
        assertThat(result.erfuelltesPeriodenziel()).isZero();
        assertThat(result.rueckstand()).isEqualTo(4);
    }

    @Test
    void masteredFuturePlanGoalsCountAsAdvanceWork() {
        var blocks = List.of(block("due", "2026-09-11", List.of("a")),
                block("future", "2026-09-14", List.of("b")));
        var result = progress(blocks, TODAY, Map.of("b", 1.0), Set.of());
        assertThat(result.erfuelltesPeriodenziel()).isEqualTo(1);
        assertThat(result.offenesPeriodenpensum()).isZero();
        assertThat(result.rueckstand()).isZero();
    }

    @Test
    void dayRolloverMovesRemainingWorkIntoBacklogWithoutReusingEvents() {
        var result = progress(BLOCKS, TODAY.plusDays(1), Map.of("a", 1.0), Set.of());
        assertThat(result.erfuelltesPeriodenziel()).isZero();
        assertThat(result.offenesPeriodenpensum()).isZero();
        assertThat(result.rueckstand()).isEqualTo(5);
    }

    @Test
    void overlappingBlocksCountEachGoalOnlyOnce() {
        var result = progress(List.of(
                block("one", "2026-09-11", List.of("a", "b")),
                block("two", "2026-09-11", List.of("a", "c"))), TODAY,
                Map.of("a", 1.0), Set.of("a"));
        assertThat(result.erfuelltesPeriodenziel()).isEqualTo(1);
        assertThat(result.offenesPeriodenpensum()).isEqualTo(2);
    }

    @Test
    void inconsistentPlanGoalAndScheduleBasisIsRejected() {
        assertThatThrownBy(() -> LearnerLearningPlanService.calculateBalance(Set.of("a"),
                Map.of("b", TODAY), TODAY, TODAY, Map.of(), Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void missingOrOutOfPeriodTimestampsDoNotTurnKnownMasteryIntoPeriodCompletions() {
        Map<String, Instant> timestamps = new java.util.HashMap<>();
        timestamps.put("a", null);
        timestamps.put("b", Instant.parse("2026-09-10T12:00:00Z"));
        var dueDates = LearnerLearningPlanService.scheduledAtomicGoalDueDatesForSchedule(BLOCKS);
        var result = LearnerLearningPlanService.calculateBalance(dueDates.keySet(), dueDates,
                TODAY, TODAY, Map.of("a", 1.0, "b", 1.0), timestamps);
        assertThat(result.erfuelltesPeriodenziel()).isZero();
        assertThat(result.rueckstand()).isEqualTo(2);
    }

    private static PlanBalanceResult progress(List<LearnerLearningPlanApi.Block> blocks,
            LocalDate date, Map<String, Double> mastery, Set<String> completions) {
        Map<String, LocalDate> dueDates = LearnerLearningPlanService.scheduledAtomicGoalDueDatesForSchedule(blocks);
        return LearnerLearningPlanService.calculateBalance(dueDates.keySet(), dueDates, date, date, mastery,
                completions.stream().collect(Collectors.toMap(id -> id, id -> Instant.parse("2026-09-11T12:00:00Z"))));
    }

    private static LearnerLearningPlanApi.Block block(String id, String date, List<String> goals) {
        return new LearnerLearningPlanApi.Block(id, "learning", "focus", id,
                LocalDate.parse(date), LocalDate.parse(date), null, goals);
    }
}
