package com.skillpilot.backend.ai.visiblesession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.swagger.v3.oas.annotations.Operation;
import java.lang.reflect.Method;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class VisibleSessionAiControllerTest {

    @Test
    void expiredSessionReturnsGoneWithoutLeakingToken() throws Exception {
        String token = "sps_expiredVisibleSecret";
        VisibleSessionService service = mock(VisibleSessionService.class);
        when(service.getState(token, "de"))
                .thenThrow(new com.skillpilot.backend.service.ChatSessionService.ChatSessionExpiredException());
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new VisibleSessionAiController(service))
                .build();

        MvcResult result = mockMvc.perform(get(
                        "/api/ai/de/sessions/{chatSessionToken}/visible/state",
                        token))
                .andExpect(status().isGone())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.error").value("chat_session_expired"))
                .andReturn();

        assertThat(result.getResponse().getContentAsString())
                .doesNotContain(token);
    }

    @Test
    void successfulStateResponseIsNotCacheable() throws Exception {
        String token = "sps_visibleSecret";
        VisibleSessionService service = mock(VisibleSessionService.class);
        when(service.getState(token, "de")).thenReturn(new VisibleCoachStateResponse(
                "— SkillPilot · Sitzung: " + token,
                "READY",
                "setCurriculum",
                "selection",
                null,
                null,
                null,
                null,
                null,
                null,
                java.util.List.of(),
                "Auswahl anzeigen."));
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new VisibleSessionAiController(service))
                .build();

        mockMvc.perform(get(
                        "/api/ai/de/sessions/{chatSessionToken}/visible/state",
                        token))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"));
    }

    @Test
    void controllerOperationIdsMatchVisibleCustomGptContract() throws Exception {
        assertOperationId("getState", new Class<?>[] { String.class, String.class }, "getVisibleState");
        assertOperationId(
                "choose",
                new Class<?>[] { String.class, String.class, VisibleChoiceRequest.class },
                "applyVisibleChoice");
        assertOperationId(
                "requestNavigation",
                new Class<?>[] { String.class, String.class, VisibleNavigationRequest.class },
                "requestVisibleNavigation");
        assertOperationId(
                "setActiveGoal",
                new Class<?>[] { String.class, String.class, VisibleActiveGoalRequest.class },
                "setVisibleActiveGoal");
        assertOperationId(
                "setMastery",
                new Class<?>[] { String.class, String.class, VisibleMasteryRequest.class },
                "setVisibleMastery");
        assertOperationId(
                "startVerifiedRecall",
                new Class<?>[] { String.class, String.class, com.skillpilot.backend.api.VerifiedRecallStartRequest.class },
                "startVisibleVerifiedRecall");
        assertOperationId(
                "getVerifiedRecallAnswer",
                new Class<?>[] { String.class, String.class, com.skillpilot.backend.api.VerifiedRecallAnswerRequest.class },
                "getVisibleVerifiedRecallAnswer");
        assertOperationId(
                "recordVerifiedRecallResult",
                new Class<?>[] { String.class, String.class, com.skillpilot.backend.api.VerifiedRecallResultRequest.class },
                "recordVisibleVerifiedRecallResult");
        assertOperationId(
                "getExamEvaluation",
                new Class<?>[] { String.class, String.class, VisibleExamEvaluationRequest.class },
                "getVisibleExamEvaluation");
    }

    private void assertOperationId(String methodName, Class<?>[] parameterTypes, String expected) throws Exception {
        Method method = VisibleSessionAiController.class.getDeclaredMethod(methodName, parameterTypes);
        assertThat(method.getAnnotation(Operation.class).operationId()).isEqualTo(expected);
    }
}
