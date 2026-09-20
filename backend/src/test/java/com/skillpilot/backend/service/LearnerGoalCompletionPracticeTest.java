package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.repository.LearnerGoalCompletionRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class LearnerGoalCompletionPracticeTest {
    @Test
    void repeatedPracticalCompletionIsEvidenceButNeverDailyProgressCredit() {
        var repository = mock(LearnerGoalCompletionRepository.class);
        var service = new LearnerGoalCompletionService(repository);
        var learner = new Learner(); learner.setSkillpilotId("learner");
        Instant now = Instant.parse("2026-09-20T10:00:00Z");
        service.recordTransition(learner, "goal", 1.0, 1.0, now, "coach_learning", "content-v2");
        var capture = ArgumentCaptor.forClass(LearnerGoalCompletion.class);
        verify(repository).save(capture.capture());
        var receipt = capture.getValue();
        assertThat(receipt.isObservedTransition()).isFalse();
        assertThat(receipt.getContentFingerprint()).isEqualTo("content-v2");
        assertThat(receipt.getPracticeRecordedAt()).isEqualTo(now);
        when(repository.findByLearner_SkillpilotIdOrderByOccurredAtDesc("learner")).thenReturn(List.of(receipt));
        when(repository.findByLearner_SkillpilotIdAndCompletionDateOrderByOccurredAtAsc("learner", LocalDate.of(2026, 9, 20)))
                .thenReturn(List.of(receipt));
        assertThat(service.getHistory("learner")).isEmpty();
        assertThat(service.getCompletionsOnDate("learner", LocalDate.of(2026, 9, 20))).isEmpty();
        assertThat(service.getPracticeHistory("learner")).containsExactly(receipt);
    }

    @Test
    void sameDayPracticeRefreshDoesNotRewriteFirstObservedCompletion() {
        var repository = mock(LearnerGoalCompletionRepository.class);
        var service = new LearnerGoalCompletionService(repository);
        var learner = new Learner(); learner.setSkillpilotId("learner");
        Instant first = Instant.parse("2026-09-20T10:00:00Z");
        var receipt = new LearnerGoalCompletion(learner, "goal", LocalDate.of(2026, 9, 20), first, 1);
        when(repository.findByLearner_SkillpilotIdAndGoalIdAndCompletionDate("learner", "goal", LocalDate.of(2026, 9, 20)))
                .thenReturn(java.util.Optional.of(receipt));
        service.recordTransition(learner, "goal", 1, 1, first.plusSeconds(600), "verified_recall", "new-content");
        assertThat(receipt.getOccurredAt()).isEqualTo(first);
        assertThat(receipt.isObservedTransition()).isTrue();
        assertThat(receipt.getPracticeRecordedAt()).isEqualTo(first.plusSeconds(600));
        assertThat(receipt.getContentFingerprint()).isEqualTo("new-content");
    }

    @Test
    void multipleContentVersionsOnSameDayRemainAppendOnlyAndLateCrossingGetsItsOwnTime() {
        var repository = mock(LearnerGoalCompletionRepository.class);
        var service = new LearnerGoalCompletionService(repository);
        var learner = new Learner(); learner.setSkillpilotId("learner");
        Instant first = Instant.parse("2026-09-20T10:00:00Z");
        var receipt = new LearnerGoalCompletion(learner, "goal", LocalDate.of(2026, 9, 20), first, 1);
        receipt.setObservedTransition(false);
        receipt.bindPracticeEvidence("coach_learning", "version-one", first);
        when(repository.findByLearner_SkillpilotIdAndGoalIdAndCompletionDate("learner", "goal", LocalDate.of(2026, 9, 20)))
                .thenReturn(java.util.Optional.of(receipt));
        service.recordTransition(learner, "goal", 0, 1, first.plusSeconds(600), "coach_learning", "version-two");
        service.recordTransition(learner, "goal", 1, 1, first.plusSeconds(900), "coach_learning", "version-two");
        assertThat(receipt.getPracticeEvidence()).hasSize(2);
        assertThat(receipt.getPracticeEvidence().getFirst().fingerprint()).isEqualTo("version-one");
        assertThat(receipt.getPracticeEvidence().getFirst().recordedAt()).isEqualTo(first);
        assertThat(receipt.getOccurredAt()).isEqualTo(first.plusSeconds(600));
        assertThat(receipt.isObservedTransition()).isTrue();
    }

    @Test
    void untrustedManualSourceDoesNotCreatePracticeEvidence() {
        var repository = mock(LearnerGoalCompletionRepository.class);
        var service = new LearnerGoalCompletionService(repository);
        var learner = new Learner(); learner.setSkillpilotId("learner");
        service.recordTransition(learner, "goal", 0, 1, Instant.now(), "manual", "fingerprint");
        var capture = ArgumentCaptor.forClass(LearnerGoalCompletion.class);
        verify(repository).save(capture.capture());
        assertThat(capture.getValue().getContentFingerprint()).isNull();
        assertThat(capture.getValue().getPracticeSource()).isNull();
        assertThat(capture.getValue().isObservedTransition()).isTrue();
    }
}
