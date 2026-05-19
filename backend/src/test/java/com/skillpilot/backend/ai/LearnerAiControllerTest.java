package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class LearnerAiControllerTest {

    private LearnerService learnerService;
    private ChatSessionService chatSessionService;
    private LearnerAiController controller;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        chatSessionService = mock(ChatSessionService.class);
        controller = new LearnerAiController(learnerService, chatSessionService);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("https");
        request.setServerName("skillpilot.test");
        request.setServerPort(443);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void setMastery_autoRecoversBySettingActiveGoalWhenRequiredActionIsSetActiveGoal() {
        String skillpilotId = "learner-1";
        String goalId = "goal-1";

        UnifiedLearnerStateResponse before = learnerState(skillpilotId, "setActiveGoal");
        UnifiedLearnerStateResponse after = learnerState(skillpilotId, "setMastery");
        MasteryUpdateResponse masteryResponse = new MasteryUpdateResponse(
                true,
                goalId,
                1.0,
                List.of(),
                List.of("getFrontier"),
                "FRONTIER",
                null,
                null,
                null);

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before, after);
        doNothing().when(learnerService).setActiveGoal(skillpilotId, goalId);
        when(learnerService.setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class))).thenReturn(masteryResponse);

        var response = controller.setMastery(skillpilotId, new MasteryUpdateRequest(Map.of(goalId, 1.0), null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(MasteryUpdateResponse.class);

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(skillpilotId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        ordered.verify(learnerService).setActiveGoal(skillpilotId, goalId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        ordered.verify(learnerService).setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class));
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void setMastery_returnsConflictWhenSetActiveGoalIsRequiredButNoGoalIsProvided() {
        String skillpilotId = "learner-1";

        var response = controller.setMastery(skillpilotId, new MasteryUpdateRequest(null, null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void setMastery_acceptsGoalIdOnlyPayloadForActionCompatibility() {
        String skillpilotId = "learner-1";
        String goalId = "goal-1";
        FrontierGoal currentGoal = simpleGoal(goalId, "Current Goal");
        UnifiedLearnerStateResponse before = learnerState(skillpilotId, "teachActiveGoal", currentGoal);
        MasteryUpdateResponse masteryResponse = new MasteryUpdateResponse(
                true,
                goalId,
                1.0,
                List.of(),
                List.of("getFrontier"),
                "FRONTIER",
                null,
                null,
                null);

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before);
        when(learnerService.setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class))).thenReturn(masteryResponse);

        var response = controller.setMastery(skillpilotId, new MasteryUpdateRequest(null, goalId));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(MasteryUpdateResponse.class);
        MasteryUpdateResponse body = (MasteryUpdateResponse) response.getBody();
        assertThat(body.saved()).isTrue();
        assertThat(body.savedGoalId()).isEqualTo(goalId);
        assertThat(body.savedMastery()).isEqualTo(1.0);

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verify(learnerService).setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class));
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void setMastery_rejectsMultipleMasteryEntriesWithoutSaving() {
        String skillpilotId = "learner-1";

        var response = controller.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(Map.of("goal-1", 1.0, "goal-2", 1.0), null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void setMastery_returnsServerAutoAdvancedGoalWithoutManualReselection() {
        String skillpilotId = "learner-1";
        String currentGoalId = "goal-1";
        String nextGoalId = "goal-2";
        FrontierGoal currentGoal = simpleGoal(currentGoalId, "Current Goal");
        FrontierGoal nextGoal = simpleGoal(nextGoalId, "Next Goal");

        UnifiedLearnerStateResponse before = learnerState(skillpilotId, "setMastery", currentGoal);
        MasteryUpdateResponse masteryResponse = new MasteryUpdateResponse(
                true,
                currentGoalId,
                1.0,
                List.of(nextGoal),
                List.of("setMastery"),
                "TEACHING",
                nextGoal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(nextGoal), List.of(), nextGoal),
                null);

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before);
        when(learnerService.setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class))).thenReturn(masteryResponse);

        var response = controller.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(Map.of(currentGoalId, 1.0), currentGoalId));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(MasteryUpdateResponse.class);
        MasteryUpdateResponse body = (MasteryUpdateResponse) response.getBody();
        assertThat(body.saved()).isTrue();
        assertThat(body.savedGoalId()).isEqualTo(currentGoalId);
        assertThat(body.savedMastery()).isEqualTo(1.0);
        assertThat(body.activeGoal()).isNotNull();
        assertThat(body.activeGoal().id()).isEqualTo(nextGoalId);
        assertThat(body.stateMachine()).isNotNull();
        assertThat(body.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verify(learnerService).setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class));
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void startVerifiedRecall_usesActiveRouteReadAccessAndDelegatesToService() {
        String skillpilotId = "learner-1";
        VerifiedRecallStartRequest request = new VerifiedRecallStartRequest("goal-1", false);
        VerifiedRecallPromptResponse expected = new VerifiedRecallPromptResponse(
                "ready",
                "ask prompt",
                skillpilotId,
                "goal-1",
                "Goal",
                3,
                1,
                2,
                "card-1",
                "Prompt",
                "Formeln");

        when(learnerService.startVerifiedRecall(skillpilotId, "de", request)).thenReturn(expected);

        VerifiedRecallPromptResponse response = controller.startVerifiedRecall("de", skillpilotId, request);

        assertThat(response).isSameAs(expected);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).startVerifiedRecall(skillpilotId, "de", request);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void getVerifiedRecallAnswer_usesActiveRouteReadAccessAndDelegatesToService() {
        String skillpilotId = "learner-1";
        VerifiedRecallAnswerRequest request = new VerifiedRecallAnswerRequest("goal-1", "card-1");
        VerifiedRecallAnswerResponse expected = new VerifiedRecallAnswerResponse(
                "compare",
                "goal-1",
                "card-1",
                "Prompt",
                "Expected answer",
                "Formeln");

        when(learnerService.getVerifiedRecallAnswer(skillpilotId, "de", request)).thenReturn(expected);

        VerifiedRecallAnswerResponse response = controller.getVerifiedRecallAnswer("de", skillpilotId, request);

        assertThat(response).isSameAs(expected);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getVerifiedRecallAnswer(skillpilotId, "de", request);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void recordVerifiedRecallResult_usesWritableSessionAndDelegatesToService() {
        String skillpilotId = "learner-1";
        VerifiedRecallResultRequest request = new VerifiedRecallResultRequest("goal-1", "card-1", true, "ok");
        VerifiedRecallPromptResponse next = new VerifiedRecallPromptResponse(
                "complete",
                "done",
                skillpilotId,
                "goal-1",
                "Goal",
                1,
                1,
                0,
                null,
                null,
                null);
        VerifiedRecallResultResponse expected = new VerifiedRecallResultResponse("card-1", true, 1, 0, next);

        when(learnerService.recordVerifiedRecallResult(skillpilotId, "de", request)).thenReturn(expected);

        VerifiedRecallResultResponse response = controller.recordVerifiedRecallResult("de", skillpilotId, request);

        assertThat(response).isSameAs(expected);
        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).recordVerifiedRecallResult(skillpilotId, "de", request);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void normalizeMathDelimitersForChat_usesChatGptLatexDelimiters() throws Exception {
        String raw = "Inline $Q=900\\\\,\\\\mathrm{kJ}$ and block $$\n\\\\eta=\\\\frac{W}{Q}\n$$. "
                + "Existing \\(x\\) and \\[y\\] stay valid.";

        String normalized = invokeNormalizeMathDelimitersForChat(raw);

        assertThat(normalized).contains("\\(Q=900\\\\,\\\\mathrm{kJ}\\)");
        assertThat(normalized).contains("\\[\n\\\\eta=\\\\frac{W}{Q}\n\\]");
        assertThat(normalized).contains("\\(x\\)");
        assertThat(normalized).contains("\\[y\\]");
        assertThat(normalized).doesNotContain("$Q=900");
        assertThat(normalized).doesNotContain("$$");
    }

    @Test
    void getLearnerState_stripsExamDataFromSelectableGoals() {
        String skillpilotId = "learner-1";
        FrontierGoal examCandidate = examGoal("goal-1");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(examCandidate),
                new LearnerGoals(List.of(examCandidate), 0, 1, null, null, false),
                List.of("setActiveGoal"),
                List.of(),
                Set.of(),
                "FRONTIER",
                null,
                new StateMachineInfo("FRONTIER", "setActiveGoal", List.of(examCandidate), List.of(), null));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        assertThat(state.frontier()).hasSize(1);
        assertThat(state.frontier().get(0).nodeKind()).isEqualTo("exam");
        assertThat(state.frontier().get(0).examData()).isNull();
        assertThat(state.stateMachine().goalOptions()).hasSize(1);
        assertThat(state.stateMachine().goalOptions().get(0).examData()).isNull();
        assertThat(state.goals().planned()).hasSize(1);
        assertThat(state.goals().planned().get(0).examData()).isNull();

        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void getLearnerState_keepsExamDataOnActiveGoal() {
        String skillpilotId = "learner-1";
        FrontierGoal activeExamGoal = examGoal("goal-1");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(activeExamGoal),
                null,
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeExamGoal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(activeExamGoal), List.of(), activeExamGoal));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().description()).contains("\\(x\\)");
        assertThat(state.activeGoal().examData()).isNotNull();
        assertThat(state.activeGoal().examData().getTaskContent()).contains("Task body");
        assertThat(state.activeGoal().examData().getTaskContent()).contains("\\(x\\)");
        assertThat(state.activeGoal().examData().getTaskContent()).doesNotContain("$x$");
        assertThat(state.stateMachine().activeGoal()).isNotNull();
        assertThat(state.stateMachine().activeGoal().examData()).isNotNull();
        assertThat(state.frontier()).hasSize(1);
        assertThat(state.frontier().get(0).examData()).isNull();

        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void getLearnerState_doesNotExposeInternalReleaseMetadata() throws Exception {
        String skillpilotId = "learner-1";
        FrontierGoal activeExamGoal = examGoal("goal-1");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(activeExamGoal),
                new LearnerGoals(List.of(activeExamGoal), 0, 1, null, null, false),
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeExamGoal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(activeExamGoal), List.of(), activeExamGoal));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);
        String json = new ObjectMapper().writeValueAsString(state);

        assertThat(json).doesNotContain("\"release\"");

        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    private String invokeNormalizeMathDelimitersForChat(String content) throws Exception {
        Method method = LearnerAiController.class.getDeclaredMethod("normalizeMathDelimitersForChat", String.class);
        method.setAccessible(true);
        return (String) method.invoke(controller, content);
    }

    private static FrontierGoal examGoal(String goalId) {
        ExamData examData = new ExamData();
        examData.setTaskContent("Task body $x$");
        examData.setSolutionContent("Solution body");
        return new FrontierGoal(
                goalId,
                "Exam Goal",
                "Description $x$",
                "atomic",
                "exam",
                "Ready",
                List.of(),
                List.of(),
                null,
                null,
                null,
                examData);
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
                Set.of(),
                activeGoal == null ? "FRONTIER" : "TEACHING",
                activeGoal,
                new StateMachineInfo("state", requiredAction, activeGoal == null ? List.of() : List.of(activeGoal),
                        List.of(), activeGoal));
    }

    private static FrontierGoal simpleGoal(String goalId, String title) {
        return new FrontierGoal(
                goalId,
                title,
                "Description",
                "atomic",
                null,
                "Ready",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }
}
