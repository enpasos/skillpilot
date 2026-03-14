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
import com.skillpilot.backend.landscape.ExamData;
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
    private LearnerAiController controller;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        controller = new LearnerAiController(learnerService);

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
        UnifiedLearnerStateResponse before = learnerState(skillpilotId, "setActiveGoal");

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before);

        var response = controller.setMastery(skillpilotId, new MasteryUpdateRequest(null, null));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isInstanceOf(UnifiedLearnerStateResponse.class);

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
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
                List.of(nextGoal),
                List.of("setMastery"),
                "TEACHING",
                nextGoal,
                new StateMachineInfo("TEACHING", "setMastery", List.of(nextGoal), List.of(), nextGoal),
                null);

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before);
        when(learnerService.setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class))).thenReturn(masteryResponse);

        var response = controller.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(Map.of(currentGoalId, 1.0), currentGoalId));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isInstanceOf(MasteryUpdateResponse.class);
        MasteryUpdateResponse body = (MasteryUpdateResponse) response.getBody();
        assertThat(body.activeGoal()).isNotNull();
        assertThat(body.activeGoal().id()).isEqualTo(nextGoalId);
        assertThat(body.stateMachine()).isNotNull();
        assertThat(body.stateMachine().requiredAction()).isEqualTo("setMastery");

        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verify(learnerService).setMastery(eq(skillpilotId), any(MasteryUpdateRequest.class));
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void normalizeMathDelimitersForChat_usesDollarLatexDelimitersForChat() throws Exception {
        String raw = "Inline \\(Q=900\\\\,\\\\mathrm{kJ}\\) and block \\[\\\\eta=\\\\frac{W}{Q}\\].";

        String normalized = invokeNormalizeMathDelimitersForChat(raw);

        assertThat(normalized).contains("$Q=900\\\\,\\\\mathrm{kJ}$");
        assertThat(normalized).contains("$$\n\\\\eta=\\\\frac{W}{Q}\n$$");
        assertThat(normalized).doesNotContain("\\\\(");
        assertThat(normalized).doesNotContain("\\\\[");
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
                new StateMachineInfo("TEACHING", "setMastery", List.of(activeExamGoal), List.of(), activeExamGoal));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().examData()).isNotNull();
        assertThat(state.activeGoal().examData().getTaskContent()).contains("Task body");
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
                new StateMachineInfo("TEACHING", "setMastery", List.of(activeExamGoal), List.of(), activeExamGoal));

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
        examData.setTaskContent("Task body");
        examData.setSolutionContent("Solution body");
        return new FrontierGoal(
                goalId,
                "Exam Goal",
                "Description",
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
