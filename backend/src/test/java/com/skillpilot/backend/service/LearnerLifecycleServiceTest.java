package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.LearnerRetentionResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ClaudeConnectionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.ui.LearnerUiController;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.web.server.ResponseStatusException;

class LearnerLifecycleServiceTest {

    private static final String LEARNER_ID = "learner-retention";
    private static final Instant NOW = Instant.parse("2026-08-13T12:00:00Z");

    private LearnerRepository learners;
    private ClaudeConnectionRepository claudeConnections;
    private OpenAiDeConnectionRepository legacyOpenAiConnections;
    private JdbcOperations jdbc;
    private SseService sse;
    private LearnerLifecycleService lifecycle;

    @BeforeEach
    void setUp() {
        learners = mock(LearnerRepository.class);
        claudeConnections = mock(ClaudeConnectionRepository.class);
        legacyOpenAiConnections = mock(OpenAiDeConnectionRepository.class);
        jdbc = mock(JdbcOperations.class);
        sse = mock(SseService.class);
        lifecycle = new LearnerLifecycleService(
                learners,
                claudeConnections,
                legacyOpenAiConnections,
                jdbc,
                sse,
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void resumeUsesServerTimeAndSchedulesDeletionExactly365DaysLater() {
        Learner learner = learner(LEARNER_ID, NOW.minusSeconds(100));
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));

        LearnerRetentionResponse response = lifecycle.resume(LEARNER_ID);

        assertThat(response.lastActivityAt()).isEqualTo(NOW);
        assertThat(response.scheduledDeletionAt())
                .isEqualTo(NOW.plus(LearnerLifecycleService.RETENTION_PERIOD));
        assertThat(learner.getLastActivityAt()).isEqualTo(NOW);
        verify(learners).save(learner);
    }

    @Test
    void failedIntentionalActivityDoesNotAdvanceRetentionTimestamp() {
        Instant previousActivity = NOW.minusSeconds(100);
        Learner learner = learner(LEARNER_ID, previousActivity);
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));

        assertThatThrownBy(() -> lifecycle.withActivity(LEARNER_ID, () -> {
                    throw new IllegalStateException("operation failed");
                }))
                .isInstanceOf(IllegalStateException.class);

        assertThat(learner.getLastActivityAt()).isEqualTo(previousActivity);
        verify(learners, never()).save(learner);
    }

    @Test
    void successfulImportEndpointCountsButFailedImportDoesNot() {
        Instant previousActivity = NOW.minusSeconds(100);
        Learner learner = learner(LEARNER_ID, previousActivity);
        LearnerService learnerService = mock(LearnerService.class);
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));
        LearnerUiController controller = new LearnerUiController(
                learnerService,
                mock(ChatSessionService.class),
                lifecycle);

        controller.importLearner(LEARNER_ID, null);

        assertThat(learner.getLastActivityAt()).isEqualTo(NOW);
        verify(learners).save(learner);

        learner.setLastActivityAt(previousActivity);
        doThrow(new IllegalArgumentException("invalid archive"))
                .when(learnerService)
                .importLearner(LEARNER_ID, null);

        assertThatThrownBy(() -> controller.importLearner(LEARNER_ID, null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(learner.getLastActivityAt()).isEqualTo(previousActivity);
    }

    @Test
    void inactivityCutoffIncludesExactly365DaysButRechecksEveryLockedLearner() {
        Instant cutoff = NOW.minus(LearnerLifecycleService.RETENTION_PERIOD);
        Learner exactlyDue = learner("exactly-due", cutoff);
        Learner becameActive = learner("became-active", cutoff.plusMillis(1));
        when(learners.findInactiveSkillpilotIdsForUpdate(cutoff, 10))
                .thenReturn(List.of(exactlyDue.getSkillpilotId(), becameActive.getSkillpilotId()));
        when(learners.findBySkillpilotIdForUpdate(exactlyDue.getSkillpilotId()))
                .thenReturn(Optional.of(exactlyDue));
        when(learners.findBySkillpilotIdForUpdate(becameActive.getSkillpilotId()))
                .thenReturn(Optional.of(becameActive));
        when(claudeConnections.findSubjectsByLearnerSkillpilotId(exactlyDue.getSkillpilotId()))
                .thenReturn(List.of());
        when(legacyOpenAiConnections.findSubjectsByLearnerSkillpilotId(exactlyDue.getSkillpilotId()))
                .thenReturn(List.of());

        assertThat(lifecycle.deleteInactiveBatch(10)).isEqualTo(1);

        verify(learners).delete(exactlyDue);
        verify(learners, never()).delete(becameActive);
        verify(sse).forgetLearner(exactlyDue.getSkillpilotId());
        verify(sse, never()).forgetLearner(becameActive.getSkillpilotId());
    }

    @Test
    void confirmedDeleteRemovesOauthRowsInboundProvenanceLearnerAndLiveSseState() {
        Learner learner = learner(LEARNER_ID, NOW);
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(claudeConnections.findSubjectsByLearnerSkillpilotId(LEARNER_ID))
                .thenReturn(List.of("claude-subject"));
        when(legacyOpenAiConnections.findSubjectsByLearnerSkillpilotId(LEARNER_ID))
                .thenReturn(List.of("legacy-openai-subject"));

        lifecycle.deleteConfirmed(LEARNER_ID, LEARNER_ID);

        verify(jdbc).update("DELETE FROM oauth2_authorization WHERE principal_name = ?", "claude-subject");
        verify(jdbc).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                "claude-subject");
        verify(jdbc).update(
                "DELETE FROM oauth2_authorization WHERE principal_name = ?",
                "legacy-openai-subject");
        verify(jdbc).update(
                "DELETE FROM oauth2_authorization_consent WHERE principal_name = ?",
                "legacy-openai-subject");
        verify(jdbc).update(
                "DELETE FROM learner_copy_sources WHERE learner_id = ?",
                LEARNER_ID);
        verify(jdbc).update("DELETE FROM mastery WHERE skillpilot_id = ?", LEARNER_ID);
        verify(jdbc).update("DELETE FROM planned_goal WHERE skillpilot_id = ?", LEARNER_ID);
        verify(jdbc).update(
                "DELETE FROM curriculum_champion WHERE skillpilot_id = ?",
                LEARNER_ID);
        verify(jdbc).update(
                "DELETE FROM learner_client_state WHERE skillpilot_id = ?",
                LEARNER_ID);
        verify(learners).deleteInboundCopySourceReferences(LEARNER_ID);
        verify(learners).delete(learner);
        verify(learners).flush();
        verify(sse).forgetLearner(LEARNER_ID);
    }

    @Test
    void deleteRequiresExactConfirmationBeforeLookingUpLearner() {
        assertThatThrownBy(() -> lifecycle.deleteConfirmed(LEARNER_ID, "different-id"))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode().value())
                        .isEqualTo(400));

        verifyNoInteractions(learners, claudeConnections, legacyOpenAiConnections, jdbc, sse);
    }

    private static Learner learner(String skillpilotId, Instant lastActivityAt) {
        Learner learner = new Learner();
        learner.setSkillpilotId(skillpilotId);
        learner.setLastActivityAt(lastActivityAt);
        return learner;
    }
}
