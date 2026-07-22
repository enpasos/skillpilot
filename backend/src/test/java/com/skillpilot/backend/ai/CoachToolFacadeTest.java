package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class CoachToolFacadeTest {

    private LearnerService learnerService;
    private ChatSessionService chatSessionService;
    private CoachToolFacade facade;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        chatSessionService = mock(ChatSessionService.class);
        facade = new CoachToolFacade(
                learnerService,
                chatSessionService,
                new CoachStateProjection("https://skillpilot.test"));
    }

    @Test
    void redeemStartCodeReturnsProviderSafeInitialStateAndInternalTraceId() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        Instant expiresAt = Instant.parse("2026-07-14T10:00:00Z");
        when(chatSessionService.redeemStartCode("START-123", "de"))
                .thenReturn(new ChatSessionService.RedeemedSession(sessionToken, expiresAt, skillpilotId));
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "setActiveGoal"));

        CoachToolFacade.RedeemedCoachSession result = facade.redeemStartCode("START-123", "de");

        assertThat(result.sessionToken()).isEqualTo(sessionToken);
        assertThat(result.expiresAt()).isEqualTo(expiresAt);
        assertThat(result.skillpilotId()).isEqualTo(skillpilotId);
        assertThat(result.state().skillpilotId()).isNull();
        assertThat(result.state().copySources()).isEmpty();
        assertThat(result.state().stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        verify(chatSessionService).redeemStartCode("START-123", "de");
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void sessionActiveGoalUsesTheSameRedirectGuardAndHidesLearnerId() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        String goalId = "goal-2";
        when(chatSessionService.resolveSkillpilotId(sessionToken)).thenReturn(skillpilotId);
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(
                        learnerState(skillpilotId, "chooseMemoryMode"),
                        learnerState(skillpilotId, "teachActiveGoal"));

        UnifiedLearnerStateResponse result = facade.setSessionActiveGoal(
                sessionToken,
                new ActiveGoalRequest(goalId, true));

        assertThat(result.skillpilotId()).isNull();
        assertThat(result.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        InOrder ordered = inOrder(chatSessionService, learnerService);
        ordered.verify(chatSessionService).resolveSkillpilotId(sessionToken);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        ordered.verify(learnerService).assertWritableLearningSession(skillpilotId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        ordered.verify(learnerService).setActiveGoal(skillpilotId, goalId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void sessionNavigationCatalogReadsResolveTheSessionWithoutMutatingLearnerState() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        LandscapeSummary curriculum = mock(LandscapeSummary.class);
        FrontierGoal scope = new FrontierGoal(
                "scope-1", "Scope", "Beschreibung", "cluster", null, null,
                List.of(), List.of(), null, null, null, null);
        when(chatSessionService.resolveSkillpilotId(sessionToken)).thenReturn(skillpilotId);
        when(learnerService.getAvailableBaseCurricula()).thenReturn(List.of(curriculum));
        when(learnerService.getScopeNavigationOptions(skillpilotId)).thenReturn(List.of(scope));

        assertThat(facade.getSessionCurriculumOptions(sessionToken)).containsExactly(curriculum);
        assertThat(facade.getSessionScopeOptions(sessionToken)).containsExactly(scope);

        verify(chatSessionService, org.mockito.Mockito.times(2)).resolveSkillpilotId(sessionToken);
        verify(learnerService, org.mockito.Mockito.times(2)).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getAvailableBaseCurricula();
        verify(learnerService).getScopeNavigationOptions(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void goalIdOnlyMasteryRequestIsNormalizedToFullMastery() {
        String skillpilotId = "learner-1";
        String goalId = "goal-1";
        MasteryUpdateResponse serviceResult = masteryUpdate(goalId);
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "teachActiveGoal"));
        ArgumentCaptor<MasteryUpdateRequest> requestCaptor = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        when(learnerService.setMastery(
                org.mockito.ArgumentMatchers.eq(skillpilotId),
                org.mockito.ArgumentMatchers.any(MasteryUpdateRequest.class)))
                .thenReturn(serviceResult);

        CoachToolFacade.MasteryResult result = facade.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(null, goalId));

        assertThat(result.status()).isEqualTo(CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(result.update()).isSameAs(serviceResult);
        verify(learnerService).setMastery(org.mockito.ArgumentMatchers.eq(skillpilotId), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(goalId);
        assertThat(requestCaptor.getValue().mastery()).containsExactlyEntriesOf(Map.of(goalId, 1.0));
        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void sessionMasteryConflictReturnsProviderSafeCurrentState() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        when(chatSessionService.resolveSkillpilotId(sessionToken)).thenReturn(skillpilotId);
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "setPersonalization"));

        CoachToolFacade.MasteryResult result = facade.setSessionMastery(
                sessionToken,
                new MasteryUpdateRequest(Map.of("goal-1", 1.0), "goal-1"));

        assertThat(result.status()).isEqualTo(CoachToolFacade.MasteryStatus.CONFLICT);
        assertThat(result.state().skillpilotId()).isNull();
        assertThat(result.state().stateMachine().requiredAction()).isEqualTo("setPersonalization");
        verify(chatSessionService).resolveSkillpilotId(sessionToken);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void invalidMasteryRequestIsRejectedBeforeStateEvaluation() {
        CoachToolFacade.MasteryResult result = facade.setMastery("learner-1", null);

        assertThat(result.status()).isEqualTo(CoachToolFacade.MasteryStatus.BAD_REQUEST);
        assertThat(result.error()).isEqualTo("setMastery requires a goalId.");
        verify(learnerService).assertWritableLearningSession("learner-1");
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void sessionVerifiedRecallResultHidesLearnerIdInNestedPrompt() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        VerifiedRecallResultRequest request = new VerifiedRecallResultRequest("goal-1", "card-1", true, "ok");
        VerifiedRecallPromptResponse next = new VerifiedRecallPromptResponse(
                "ready",
                "next",
                skillpilotId,
                "goal-1",
                "Goal",
                2,
                1,
                1,
                1,
                0,
                null,
                "card-2",
                "Question",
                "Category");
        when(chatSessionService.resolveSkillpilotId(sessionToken)).thenReturn(skillpilotId);
        when(learnerService.recordVerifiedRecallResult(skillpilotId, "de", request))
                .thenReturn(new VerifiedRecallResultResponse("card-1", true, 1, 1, next));

        VerifiedRecallResultResponse result = facade.recordSessionVerifiedRecallResult(sessionToken, "de", request);

        assertThat(result.next()).isNotNull();
        assertThat(result.next().skillpilotId()).isNull();
        assertThat(result.next().cardId()).isEqualTo("card-2");
        verify(chatSessionService).resolveSkillpilotId(sessionToken);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).recordVerifiedRecallResult(skillpilotId, "de", request);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void idBasedExamEvaluationReturnsOnlyTypedReleasedMaterialFromTheRawActiveGoal() {
        String skillpilotId = "learner-1";
        FrontierGoal examGoal = examGoal("exam-1", "released");
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "teachActiveGoal", examGoal));

        CoachToolFacade.ExamEvaluationResult result = facade.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(examGoal.id()));

        assertThat(result.goalId()).isEqualTo(examGoal.id());
        assertThat(result.solutionContent()).isEqualTo("Musterlösung: $x=2$.");
        assertThat(result.solutionContentEn()).isEqualTo("Solution: $x=2$.");
        assertThat(result.scoring().maxPoints()).isEqualTo(10);
        assertThat(result.scoring().passingPoints()).isEqualTo(5);
        assertThat(result.scoring().steps()).singleElement().satisfies(step -> {
            assertThat(step.id()).isEqualTo("step-1");
            assertThat(step.points()).isEqualTo(10);
            assertThat(step.description()).isEqualTo("Vollständig gelöst");
        });
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void sessionExamEvaluationOnlyResolvesTheTokenAndDelegatesToTheIdBasedGuard() {
        String skillpilotId = "learner-1";
        String sessionToken = "session-token";
        FrontierGoal examGoal = examGoal("exam-1", "released");
        when(chatSessionService.resolveSkillpilotId(sessionToken)).thenReturn(skillpilotId);
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "teachActiveGoal", examGoal));

        CoachToolFacade.ExamEvaluationResult result = facade.getSessionExamEvaluation(
                sessionToken,
                new CoachToolFacade.ExamEvaluationRequest(examGoal.id()));

        assertThat(result.goalId()).isEqualTo(examGoal.id());
        InOrder ordered = inOrder(chatSessionService, learnerService);
        ordered.verify(chatSessionService).resolveSkillpilotId(sessionToken);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void examEvaluationPreservesBadRequestAndConflictGuards() {
        String skillpilotId = "learner-1";
        FrontierGoal examGoal = examGoal("exam-1", "released");
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(learnerState(skillpilotId, "teachActiveGoal", examGoal));

        assertThatThrownBy(() -> facade.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(" ")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> facade.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest("other-goal")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void examEvaluationRejectsUnreleasedAndIncompleteActiveExamData() {
        String skillpilotId = "learner-1";
        FrontierGoal draft = examGoal("exam-draft", "needs_review");
        FrontierGoal incomplete = examGoal("exam-incomplete", "released");
        incomplete.examData().setScoring(null);
        when(learnerService.getLearnerState(skillpilotId))
                .thenReturn(
                        learnerState(skillpilotId, "teachActiveGoal", draft),
                        learnerState(skillpilotId, "teachActiveGoal", incomplete));

        assertThatThrownBy(() -> facade.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(draft.id())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
        assertThatThrownBy(() -> facade.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(incomplete.id())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    private static UnifiedLearnerStateResponse learnerState(String skillpilotId, String requiredAction) {
        return learnerState(skillpilotId, requiredAction, null);
    }

    private static UnifiedLearnerStateResponse learnerState(
            String skillpilotId,
            String requiredAction,
            FrontierGoal activeGoal) {
        return new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(),
                null,
                List.of(),
                List.of(),
                Set.of(new CopySource(
                        "copied-learner-secret-id",
                        Instant.parse("2026-01-01T00:00:00Z"))),
                "TEACHING",
                activeGoal,
                new StateMachineInfo("TEACHING", requiredAction, List.of(), List.of(), activeGoal));
    }

    private static FrontierGoal examGoal(String id, String reviewStatus) {
        ExamData exam = new ExamData();
        exam.setReviewStatus(reviewStatus);
        exam.setTaskContent("Berechne $x$.");
        exam.setTaskContentEn("Compute $x$.");
        exam.setSolutionContent("Musterlösung: $x=2$.");
        exam.setSolutionContentEn("Solution: $x=2$.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(5);
        ExamData.Step step = new ExamData.Step();
        step.setId("step-1");
        step.setPoints(10);
        step.setDescription("Vollständig gelöst");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return new FrontierGoal(
                id,
                "Prüfung",
                "Bearbeite die Prüfung.",
                "atomic",
                "exam",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                exam);
    }

    private static MasteryUpdateResponse masteryUpdate(String goalId) {
        return new MasteryUpdateResponse(
                true,
                goalId,
                1.0,
                List.of(),
                List.of(),
                "FRONTIER",
                null,
                null,
                null);
    }
}
