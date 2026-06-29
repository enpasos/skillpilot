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
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.RedeemStartCodeRequest;
import com.skillpilot.backend.api.RedeemStartCodeResponse;
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
import java.time.Instant;
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
    void setActiveGoal_allowsExplicitRedirectFromMemoryMode() {
        String skillpilotId = "learner-1";
        String memoryGoalId = "memory-goal";
        String nextGoalId = "goal-2";
        FrontierGoal memoryGoal = new FrontierGoal(
                memoryGoalId,
                "Memory Goal",
                "Description",
                "atomic",
                "memory",
                "Active",
                List.of("srs-deck:test"),
                List.of(),
                null,
                null,
                null,
                null);
        FrontierGoal nextGoal = simpleGoal(nextGoalId, "Next Goal");
        UnifiedLearnerStateResponse before = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(nextGoal),
                null,
                List.of("chooseMemoryMode", "startVerifiedRecall"),
                List.of(),
                Set.of(),
                "TEACHING",
                memoryGoal,
                new StateMachineInfo("TEACHING", "chooseMemoryMode", List.of(memoryGoal), List.of(), memoryGoal));
        UnifiedLearnerStateResponse after = learnerState(skillpilotId, "teachActiveGoal", nextGoal);

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(before, after);
        doNothing().when(learnerService).setActiveGoal(skillpilotId, nextGoalId);

        UnifiedLearnerStateResponse response = controller.setActiveGoal(
                skillpilotId,
                new ActiveGoalRequest(nextGoalId, true));

        assertThat(response.activeGoal()).isNotNull();
        assertThat(response.activeGoal().id()).isEqualTo(nextGoalId);

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(skillpilotId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        ordered.verify(learnerService).setActiveGoal(skillpilotId, nextGoalId);
        ordered.verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
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
    void handleChatSessionExpired_returnsActionableRecoveryBody() {
        var response = controller.handleChatSessionExpired();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.GONE);
        assertThat(response.getBody()).containsEntry("error", "chat_session_expired");
        assertThat(response.getBody().get("recovery"))
                .contains("skillpilot.com")
                .contains("new start code")
                .contains("Do not ask for the SkillPilot ID");
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
                2,
                0,
                null,
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
    void startSessionVerifiedRecall_hidesSkillpilotIdFromGptResponse() {
        String chatSessionToken = "chat-token";
        String skillpilotId = "learner-1";
        VerifiedRecallStartRequest request = new VerifiedRecallStartRequest("goal-1", false);
        VerifiedRecallPromptResponse serviceResponse = new VerifiedRecallPromptResponse(
                "ready",
                "ask prompt",
                skillpilotId,
                "goal-1",
                "Goal",
                3,
                1,
                2,
                2,
                0,
                null,
                "card-1",
                "Prompt",
                "Formeln");

        when(chatSessionService.resolveSkillpilotId(chatSessionToken)).thenReturn(skillpilotId);
        when(learnerService.startVerifiedRecall(skillpilotId, "de", request)).thenReturn(serviceResponse);

        VerifiedRecallPromptResponse response = controller.startSessionVerifiedRecall("de", chatSessionToken, request);

        assertThat(response.skillpilotId()).isNull();
        assertThat(response.goalId()).isEqualTo("goal-1");
        assertThat(response.cardId()).isEqualTo("card-1");
        verify(chatSessionService).resolveSkillpilotId(chatSessionToken);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).startVerifiedRecall(skillpilotId, "de", request);
        verifyNoMoreInteractions(chatSessionService, learnerService);
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
                0,
                0,
                null,
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
    void recordSessionVerifiedRecallResult_hidesSkillpilotIdFromNestedNextPrompt() {
        String chatSessionToken = "chat-token";
        String skillpilotId = "learner-1";
        VerifiedRecallResultRequest request = new VerifiedRecallResultRequest("goal-1", "card-1", true, "ok");
        VerifiedRecallPromptResponse next = new VerifiedRecallPromptResponse(
                "ready",
                "next prompt",
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
                "Prompt 2",
                "Formeln");
        VerifiedRecallResultResponse serviceResponse = new VerifiedRecallResultResponse("card-1", true, 1, 1, next);

        when(chatSessionService.resolveSkillpilotId(chatSessionToken)).thenReturn(skillpilotId);
        when(learnerService.recordVerifiedRecallResult(skillpilotId, "de", request)).thenReturn(serviceResponse);

        VerifiedRecallResultResponse response = controller.recordSessionVerifiedRecallResult("de", chatSessionToken, request);

        assertThat(response.next()).isNotNull();
        assertThat(response.next().skillpilotId()).isNull();
        assertThat(response.next().cardId()).isEqualTo("card-2");
        verify(chatSessionService).resolveSkillpilotId(chatSessionToken);
        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).assertWritableLearningSession(skillpilotId);
        verify(learnerService).recordVerifiedRecallResult(skillpilotId, "de", request);
        verifyNoMoreInteractions(chatSessionService, learnerService);
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
    void getLearnerState_filtersUnreleasedPlaceholderExamDataFromSelectableGoals() {
        String skillpilotId = "learner-1";
        FrontierGoal readyExamCandidate = examGoal("ready-goal");
        FrontierGoal placeholderExamCandidate = placeholderExamGoal("placeholder-goal");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(readyExamCandidate, placeholderExamCandidate),
                new LearnerGoals(List.of(readyExamCandidate, placeholderExamCandidate), 0, 2, null, null, false),
                List.of("setActiveGoal"),
                List.of(),
                Set.of(),
                "FRONTIER",
                null,
                new StateMachineInfo(
                        "FRONTIER",
                        "setActiveGoal",
                        List.of(readyExamCandidate, placeholderExamCandidate),
                        List.of(),
                        null));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        assertThat(state.frontier()).extracting(FrontierGoal::id).containsExactly("ready-goal");
        assertThat(state.frontier().get(0).examData()).isNull();
        assertThat(state.stateMachine().goalOptions()).extracting(FrontierGoal::id).containsExactly("ready-goal");
        assertThat(state.stateMachine().goalOptions().get(0).examData()).isNull();

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
    void getLearnerState_exposesActiveGoalVisualizationMarkdownWithAbsoluteAiAssetUrl() {
        String skillpilotId = "learner-1";
        FrontierGoal activeGoal = visualizationGoal("goal-1");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(activeGoal),
                null,
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(activeGoal), List.of(), activeGoal));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        String expectedUrl = "https://skillpilot.test/ai-assets/goal-visualizations/mathematik/goal-1/goal-1.jpg";
        assertThat(state.activeGoal().resourceLinks()).hasSize(1);
        assertThat(state.activeGoal().resourceLinks().get(0).url()).isEqualTo(expectedUrl);
        assertThat(state.stateMachine().activeGoalVisualization()).isNotNull();
        assertThat(state.stateMachine().activeGoalVisualization().url()).isEqualTo(expectedUrl);
        assertThat(state.stateMachine().activeGoalVisualizationMarkdown())
                .isEqualTo("![Visualisierung](%s)".formatted(expectedUrl));

        verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void redeemStartCode_exposesActiveGoalVisualizationAsResponsePrefix() {
        String skillpilotId = "learner-1";
        String chatSessionToken = "sps_test-token";
        Instant expiresAt = Instant.parse("2026-06-29T12:00:00Z");
        FrontierGoal activeGoal = visualizationGoal("goal-1");
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(activeGoal),
                null,
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(activeGoal), List.of(), activeGoal));

        when(chatSessionService.redeemStartCode("SP-1234-5678", "de"))
                .thenReturn(new ChatSessionService.RedeemedSession(chatSessionToken, expiresAt, skillpilotId));
        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();

        RedeemStartCodeResponse response = controller.redeemStartCode(
                "de",
                new RedeemStartCodeRequest("SP-1234-5678"),
                servletRequest);

        String expectedUrl = "https://skillpilot.test/ai-assets/goal-visualizations/mathematik/goal-1/goal-1.jpg";
        String expectedMarkdown = "![Visualisierung](%s)".formatted(expectedUrl);
        assertThat(response.chatSessionToken()).isEqualTo(chatSessionToken);
        assertThat(response.state().skillpilotId()).isNull();
        assertThat(response.state().stateMachine().activeGoalVisualizationMarkdown()).isEqualTo(expectedMarkdown);
        assertThat(response.assistantResponsePrefixMarkdown()).isEqualTo(expectedMarkdown);
        assertThat(response.mandatoryFirstAssistantLineMarkdown()).isEqualTo(expectedMarkdown);
        assertThat(response.assistantDisplayInstruction())
                .contains("Markdown-Bildzeile")
                .contains("erste sichtbare Zeile");
        assertThat(servletRequest.getAttribute("skillpilot.ai.trace.skillpilotId")).isEqualTo(skillpilotId);

        verify(chatSessionService).redeemStartCode("SP-1234-5678", "de");
        verify(learnerService).getLearnerState(skillpilotId);
        verifyNoMoreInteractions(chatSessionService, learnerService);
    }

    @Test
    void getLearnerState_keepsMemoryModeOptionsForAi() {
        String skillpilotId = "learner-1";
        FrontierGoal memoryGoal = new FrontierGoal(
                "memory-goal",
                "Lernkarten",
                "Memory goal",
                "atomic",
                "memory",
                "Ready",
                List.of("memorization", "srs-deck:test"),
                List.of(),
                null,
                null,
                null,
                null);
        LearningModeOption practice = new LearningModeOption(
                "practice",
                "Im Cockpit üben",
                "Practice in cockpit",
                "openCockpitPractice",
                "cockpit",
                memoryGoal.id());
        LearningModeOption verify = new LearningModeOption(
                "verify",
                "Mit Lerncoach prüfen",
                "Use verified recall",
                "startVerifiedRecall",
                "gpt",
                memoryGoal.id());
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                skillpilotId,
                null,
                List.of(memoryGoal),
                null,
                List.of("chooseMemoryMode", "startVerifiedRecall"),
                List.of(),
                Set.of(),
                "TEACHING",
                memoryGoal,
                new StateMachineInfo(
                        "TEACHING",
                        "chooseMemoryMode",
                        List.of(memoryGoal),
                        List.of(),
                        memoryGoal,
                        List.of(practice, verify)));

        when(learnerService.getLearnerState(skillpilotId)).thenReturn(rawState);

        UnifiedLearnerStateResponse state = controller.getLearnerState(skillpilotId);

        assertThat(state.stateMachine().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThat(state.stateMachine().modeOptions()).extracting(LearningModeOption::id)
                .containsExactly("practice", "verify");
        assertThat(state.stateMachine().modeOptions()).extracting(LearningModeOption::action)
                .containsExactly("openCockpitPractice", "startVerifiedRecall");

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
        examData.setScoring(scoring("step-1"));
        return examGoal(goalId, examData);
    }

    private static FrontierGoal placeholderExamGoal(String goalId) {
        ExamData examData = new ExamData();
        examData.setReviewStatus("needs_review");
        examData.setTaskContent("Eine materialgestützte J5-Übungsaufgabe verbindet natürliche Zahlen und Größen.");
        examData.setSolutionContent("Die Lösung zeigt einen vollständigen J5-Bearbeitungsgang.");
        examData.setScoring(scoring("placeholder-step"));
        return examGoal(goalId, examData);
    }

    private static FrontierGoal examGoal(String goalId, ExamData examData) {
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

    private static FrontierGoal visualizationGoal(String goalId) {
        GoalSourceLink visualization = new GoalSourceLink(
                "goal-visualization",
                "Visualisierung",
                "/assets/goal-visualizations/mathematik/%s/%s.jpg".formatted(goalId, goalId),
                "image",
                "provider",
                List.of(),
                "description",
                "de",
                "license",
                goalId,
                "primary",
                "Visualisierung zum Lernziel",
                "pilot");
        return new FrontierGoal(
                goalId,
                "Goal",
                "Description",
                "atomic",
                null,
                "Ready",
                List.of(),
                List.of(visualization),
                null,
                null,
                null,
                null);
    }

    private static ExamData.Scoring scoring(String stepId) {
        ExamData.Step step = new ExamData.Step();
        step.setId(stepId);
        step.setPoints(5);
        step.setDescription("Evaluate the mathematical work.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(5);
        scoring.setPassingPoints(3);
        scoring.setSteps(List.of(step));
        return scoring;
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
