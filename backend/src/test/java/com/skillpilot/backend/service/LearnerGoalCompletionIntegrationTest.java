package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerGoalCompletionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.transaction.TestTransaction;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LearnerGoalCompletionIntegrationTest {

    private static final String GOAL = "completion-ledger-goal";
    private static final LocalDate DAY = LocalDate.parse("2026-09-11");
    private static final Instant FIRST = Instant.parse("2026-09-11T10:00:00Z");

    @Autowired private LearnerService service;
    @Autowired private LearnerRepository learners;
    @Autowired private MasteryRepository mastery;
    @Autowired private LearnerGoalCompletionRepository completions;

    private String learnerId;

    @BeforeEach
    void setUp() {
        learnerId = "completion-" + UUID.randomUUID();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setAutoPilot(false);
        learners.saveAndFlush(learner);
        setTime(FIRST);
    }

    @AfterEach
    void restoreClocks() {
        ReflectionTestUtils.setField(service, "learningPlanClock", Clock.system(ZoneId.of("Europe/Berlin")));
        ReflectionTestUtils.setField(service, "verifiedRecallClock", Clock.systemUTC());
    }

    @Test
    void partialWorkCompletionReplayAndResetKeepOneImmutableEvent() {
        writeMastery(0.5);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).isEmpty();
        writeMastery(0.9);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, FIRST));

        setTime(FIRST.plusSeconds(600));
        writeMastery(1.0);
        writeMastery(1.0);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, FIRST));

        writeMastery(0.0);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).isEmpty();
        assertThat(service.getHistory(learnerId)).singleElement().satisfies(entry -> {
            assertThat(entry.timestamp()).isEqualTo(FIRST);
            assertThat(entry.source()).isEqualTo("completion_event");
        });
        writeMastery(1.0);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, FIRST));
        assertThat(completions.findByLearner_SkillpilotIdOrderByOccurredAtDesc(learnerId)).hasSize(1);
    }

    @Test
    void firstCompletionWithNoPriorMasteryCreatesOneEvent() {
        writeMastery(1.0);
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, FIRST));
    }

    @Test
    void BerlinMidnightSeparatesDaysEvenBeforeUtcMidnight() {
        Instant before = Instant.parse("2026-09-11T21:59:59Z");
        Instant after = Instant.parse("2026-09-11T22:00:00Z");
        setTime(before);
        writeMastery(1.0);
        setTime(after);
        writeMastery(0.0);
        writeMastery(1.0);

        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, before));
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY.plusDays(1)))
                .containsExactly(Map.entry(GOAL, after));
    }

    @Test
    void importingMasteryOrCopyingLearnerNeverImportsCompletionCredit() {
        writeMastery(1.0);
        var backup = service.exportLearner(learnerId);
        Learner copy = new Learner();
        String copyId = "completion-copy-" + UUID.randomUUID();
        copy.setSkillpilotId(copyId);
        learners.saveAndFlush(copy);

        service.importLearner(copyId, backup);

        assertThat(mastery.findById(new MasteryId(copyId, GOAL))).get()
                .extracting(Mastery::getValue).isEqualTo(1.0);
        assertThat(service.getGoalCompletionsOnDate(copyId, DAY)).isEmpty();
        assertThat(service.getHistory(copyId)).singleElement()
                .extracting(entry -> entry.source()).isEqualTo("legacy_last_updated");
        service.importLearner(learnerId, backup);
        assertThat(completions.findByLearner_SkillpilotIdOrderByOccurredAtDesc(learnerId)).hasSize(1);
    }

    @Test
    void snapshotsDoNotBackfillDailyCompletionsAndLegacyHistoryRemainsLabelled() {
        Learner learner = learners.findById(learnerId).orElseThrow();
        mastery.saveAndFlush(new Mastery(learner, GOAL, 1.0));

        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).isEmpty();
        assertThat(service.getHistory(learnerId)).singleElement()
                .extracting(entry -> entry.source()).isEqualTo("legacy_last_updated");
        writeMastery(1.0);
        assertThat(completions.findByLearner_SkillpilotIdOrderByOccurredAtDesc(learnerId)).isEmpty();
    }

    @Test
    void verifiedRecallPersistenceRecordsTheFirstTransitionAndPreservesItsTimestamp() {
        LearningGoal goal = new LearningGoal();
        goal.setId(GOAL);
        ReflectionTestUtils.invokeMethod(service, "persistVerifiedRecallMastery", learnerId, goal, false);
        setTime(FIRST.plusSeconds(600));
        ReflectionTestUtils.invokeMethod(service, "persistVerifiedRecallMastery", learnerId, goal, false);

        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).containsExactly(Map.entry(GOAL, FIRST));
    }

    @Test
    void transactionRollbackRemovesMasteryAndCompletionTogether() {
        writeMastery(1.0);
        completions.flush();
        assertThat(service.getGoalCompletionsOnDate(learnerId, DAY)).hasSize(1);
        TestTransaction.flagForRollback();
        TestTransaction.end();
        TestTransaction.start();

        assertThat(mastery.findById(new MasteryId(learnerId, GOAL))).isEmpty();
        assertThat(completions.findByLearner_SkillpilotIdOrderByOccurredAtDesc(learnerId)).isEmpty();
    }

    @Test
    void uniqueConstraintGuardsAgainstIndependentDuplicateInsertion() {
        writeMastery(1.0);
        completions.flush();
        Learner learner = learners.findById(learnerId).orElseThrow();
        assertThatThrownBy(() -> completions.saveAndFlush(
                new LearnerGoalCompletion(learner, GOAL, DAY, FIRST.plusSeconds(60), 1.0)))
                .isInstanceOf(org.springframework.dao.DataIntegrityViolationException.class);
    }

    private void writeMastery(double value) {
        Learner learner = learners.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(GOAL);
        learners.saveAndFlush(learner);
        service.setMastery(learnerId, new MasteryUpdateRequest(Map.of(GOAL, value), GOAL));
    }

    private void setTime(Instant instant) {
        ReflectionTestUtils.setField(service, "learningPlanClock", Clock.fixed(instant, ZoneOffset.UTC));
        ReflectionTestUtils.setField(service, "verifiedRecallClock", Clock.fixed(instant, ZoneOffset.UTC));
    }
}
