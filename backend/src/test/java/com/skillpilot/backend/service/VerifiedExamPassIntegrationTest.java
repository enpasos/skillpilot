package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@SpringBootTest
@ActiveProfiles("test")
class VerifiedExamPassIntegrationTest {
    private static final String EXAM = "exam";
    private static final AssessmentMaterialRevision ORIGINAL = new AssessmentMaterialRevision(
            hash("a"), hash("b"), hash("c"));
    private static final AssessmentMaterialRevision REVISED = new AssessmentMaterialRevision(
            hash("a"), hash("d"), hash("e"));

    @Autowired private VerifiedExamPassService passes;
    @Autowired private LearnerRepository learners;
    @Autowired private MasteryRepository mastery;
    @Autowired private PlatformTransactionManager transactionManager;
    private TransactionTemplate transactions;

    private final String learnerId = "exam-pass-" + UUID.randomUUID();
    private final String otherLearnerId = "exam-pass-" + UUID.randomUUID();

    @BeforeEach
    void createLearners() {
        transactions = new TransactionTemplate(transactionManager);
        for (String id : List.of(learnerId, otherLearnerId)) {
            Learner learner = new Learner();
            learner.setSkillpilotId(id);
            learners.saveAndFlush(learner);
        }
    }

    @Test
    void concurrentPassingSubmissionsForTheSameMaterialAreIdempotent() throws Exception {
        var start = new CyclicBarrier(2);
        Callable<Void> submit = () -> {
            start.await(10, TimeUnit.SECONDS);
            record(learnerId, ORIGINAL, 8, 10, 7);
            return null;
        };
        try (var workers = Executors.newFixedThreadPool(2)) {
            var first = workers.submit(submit);
            var second = workers.submit(submit);
            first.get(40, TimeUnit.SECONDS);
            second.get(40, TimeUnit.SECONDS);
        }
        assertThat(passes.findForGoal(learnerId, EXAM)).hasSize(1);
    }

    @AfterEach
    void removeLearners() {
        learners.deleteAllById(List.of(learnerId, otherLearnerId));
    }

    @Test
    void retainsFirstPassingScoreForEachRevisionAcrossTransactionsAndCurriculumChanges() {
        record(learnerId, ORIGINAL, 7.5, 10, 7);
        var firstPass = passes.findForGoal(learnerId, EXAM).getFirst();
        assertThat(firstPass.earnedPoints()).isEqualTo(7.5);
        assertThat(firstPass.maxPoints()).isEqualTo(10);
        assertThat(firstPass.passingPoints()).isEqualTo(7);
        assertThat(firstPass.taskRevision()).isEqualTo(ORIGINAL.taskRevision());
        assertThat(firstPass.rubricRevision()).isEqualTo(ORIGINAL.rubricRevision());
        assertThat(firstPass.fingerprint()).isEqualTo(ORIGINAL.fingerprint());
        assertThat(firstPass.passedAt()).isNotNull();

        record(learnerId, ORIGINAL, 10, 10, 7);
        transactions.executeWithoutResult(status ->
                learners.findById(learnerId).orElseThrow().setSelectedCurriculum("new-curriculum"));
        record(learnerId, REVISED, 18, 20, 15);
        var results = passes.findForGoal(learnerId, EXAM);
        assertThat(results).hasSize(2).contains(firstPass);
        assertThat(results).filteredOn(pass -> pass.fingerprint().equals(REVISED.fingerprint())).singleElement()
                .satisfies(pass -> {
                    assertThat(pass.earnedPoints()).isEqualTo(18);
                    assertThat(pass.rubricRevision()).isEqualTo(REVISED.rubricRevision());
                });
        assertThat(mastery.findById(new MasteryId(learnerId, EXAM))).isEmpty();
    }

    @Test
    void rejectsUnqualifiedScoresAndMissingRevisions() {
        for (double[] scores : List.of(new double[] {6, 10, 7}, new double[] {11, 10, 7},
                new double[] {0, 10, 0}, new double[] {1, 0, 1}, new double[] {7, 10, 11},
                new double[] {Double.NaN, 10, 7}, new double[] {7, Double.POSITIVE_INFINITY, 7},
                new double[] {7, 10, Double.NaN})) {
            assertThatThrownBy(() -> record(learnerId, ORIGINAL, scores[0], scores[1], scores[2]))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThatThrownBy(() -> record(learnerId, null, 8, 10, 7)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> record(learnerId, new AssessmentMaterialRevision(
                "unknown", ORIGINAL.rubricRevision(), ORIGINAL.fingerprint()), 8, 10, 7))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(passes.findForGoal(learnerId, EXAM)).isEmpty();
    }

    @Test
    void deletingOneLearnerErasesOnlyTheirPasses() {
        record(learnerId, ORIGINAL, 10, 10, 7);
        assertThat(passes.findForGoal(otherLearnerId, EXAM)).isEmpty();
        assertThat(passes.findForGoal(learnerId, "different-exam")).isEmpty();
        record(otherLearnerId, ORIGINAL, 7, 10, 7);
        learners.deleteById(learnerId);
        assertThat(passes.findForGoal(learnerId, EXAM)).isEmpty();
        assertThat(passes.findForGoal(otherLearnerId, EXAM)).singleElement()
                .extracting(VerifiedExamPassResponse::earnedPoints).isEqualTo(7.0);
    }

    @Test
    void requiresTheCallerTransactionAndRollsBackAlongsideTheMasteryWrite() {
        assertThatThrownBy(() -> passes.record(learnerId, EXAM, ORIGINAL, 8, 10, 7))
                .isInstanceOf(IllegalTransactionStateException.class);
        transactions.executeWithoutResult(status -> {
            var learner = learners.findBySkillpilotIdForUpdate(learnerId).orElseThrow();
            mastery.saveAndFlush(new Mastery(learner, EXAM, 1.0));
            passes.record(learnerId, EXAM, ORIGINAL, 8, 10, 7);
            assertThat(passes.findForGoal(learnerId, EXAM)).hasSize(1);
            status.setRollbackOnly();
        });
        assertThat(passes.findForGoal(learnerId, EXAM)).isEmpty();
        assertThat(mastery.findById(new MasteryId(learnerId, EXAM))).isEmpty();
        assertThat(learners.existsById(learnerId)).isTrue();
    }

    private void record(String learner, AssessmentMaterialRevision revision,
            double earnedPoints, double maxPoints, double passingPoints) {
        transactions.executeWithoutResult(status ->
                passes.record(learner, EXAM, revision, earnedPoints, maxPoints, passingPoints));
    }

    private static String hash(String digit) {
        return "sha256:" + digit.repeat(64);
    }
}
