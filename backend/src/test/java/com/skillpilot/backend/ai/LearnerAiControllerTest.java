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

import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
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

        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void normalizeMathDelimitersForChat_usesSingleBackslashLatexDelimiters() throws Exception {
        String raw = "Inline $Q=900\\\\,\\\\mathrm{kJ}$ and block $$\\\\eta=\\\\frac{W}{Q}$$.";

        String normalized = invokeNormalizeMathDelimitersForChat(raw);

        assertThat(normalized).contains("\\(Q=900\\\\,\\\\mathrm{kJ}\\)");
        assertThat(normalized).contains("\\[\n\\\\eta=\\\\frac{W}{Q}\n\\]");
        assertThat(normalized).doesNotContain("\\\\(");
        assertThat(normalized).doesNotContain("\\\\[");
    }

    private String invokeNormalizeMathDelimitersForChat(String content) throws Exception {
        Method method = LearnerAiController.class.getDeclaredMethod("normalizeMathDelimitersForChat", String.class);
        method.setAccessible(true);
        return (String) method.invoke(controller, content);
    }

    private static UnifiedLearnerStateResponse learnerState(String skillpilotId, String requiredAction) {
        return new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(),
                null,
                List.of(),
                List.of(),
                Set.of(),
                "FRONTIER",
                null,
                new StateMachineInfo("state", requiredAction, List.of(), List.of(), null));
    }
}
