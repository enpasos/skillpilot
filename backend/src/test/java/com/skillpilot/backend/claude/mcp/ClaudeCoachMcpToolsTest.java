package com.skillpilot.backend.claude.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.claude.oauth.ClaudeOAuthConfiguration;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

class ClaudeCoachMcpToolsTest {

    private static final String SUBJECT = "spc_connection_subject";
    private static final String SKILLPILOT_ID = "permanent-skillpilot-id";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CoachToolFacade coachTools;
    private ClaudeCoachConnectionService connectionService;
    private CoachStateProjection stateProjection;
    private ClaudeCoachMcpTools tools;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        connectionService = mock(ClaudeCoachConnectionService.class);
        stateProjection = new CoachStateProjection("https://skillpilot.test");
        tools = new ClaudeCoachMcpTools(coachTools, connectionService, stateProjection);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void resolvesLearnerFromAuthenticatedConnectionSubjectAndRedactsPermanentId() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.of(
                new ClaudeCoachConnectionService.PendingLaunch(
                        "launch-id",
                        "de",
                        "curriculum-id",
                        Instant.parse("2030-01-01T00:00:00Z"))));
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();

        assertThat(context.pendingLaunchConsumed()).isTrue();
        assertThat(context.language()).isEqualTo("de");
        assertThat(context.selectedCurriculum()).isEqualTo("curriculum-id");
        assertThat(context.state().learningState()).isEqualTo("learning");
        assertThat(objectMapper.writeValueAsString(context)).doesNotContain(SKILLPILOT_ID);
        assertThat(objectMapper.writeValueAsString(context)).doesNotContain("copied-learner-secret-id");
        verify(connectionService).resolveSkillpilotId(SUBJECT);
        verify(connectionService).consumePendingLaunch(SUBJECT);
        verify(coachTools).getLearnerState(SKILLPILOT_ID);
    }

    @Test
    void rejectsMissingAuthenticationBeforeResolvingLearner() {
        assertThatThrownBy(tools::getCoachContext)
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("authentication is required");
        verifyNoInteractions(coachTools, connectionService);
    }

    @Test
    void doesNotInventGermanLanguageWhenAConsumedLaunchIsReloaded() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.empty());
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();

        assertThat(context.pendingLaunchConsumed()).isFalse();
        assertThat(context.language()).isNull();
        assertThat(context.instruction()).contains("user's language");
    }

    @Test
    void orientationContractBuildsInterestWithoutAssessingSubjectKnowledge() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.empty());
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();
        org.springframework.ai.tool.annotation.Tool masteryTool = ClaudeCoachMcpTools.class
                .getMethod("setMastery", String.class, Double.class)
                .getAnnotation(org.springframework.ai.tool.annotation.Tool.class);

        assertThat(context.instruction())
                .contains("requiredAction=orientActiveGoal")
                .contains("accessible possibilities and positive perspectives")
                .contains("do not test prior or detailed subject knowledge")
                .contains("explicitly chooses to continue");
        assertThat(masteryTool).isNotNull();
        assertThat(masteryTool.description())
                .contains("semanticKind=orientation")
                .contains("do not test subject knowledge")
                .contains("positive perspectives")
                .contains("save 1.0")
                .contains("For other goals")
                .contains("sufficient evidence");
    }

    @Test
    void rejectsWriteWithoutWriteScopeAndAllowsItWithScope() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);

        assertThatThrownBy(() -> tools.setScope(List.of("goal-1")))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("write scope");
        assertThatThrownBy(() -> tools.getExamEvaluation("exam-1", "de"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("write scope");
        verifyNoInteractions(coachTools, connectionService);

        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(coachTools.setScope(eq(SKILLPILOT_ID), any(ScopeRequest.class)))
                .thenReturn(stateWithSkillpilotId());

        ClaudeCoachMcpTools.CoachState response = tools.setScope(List.of("goal-1"));

        assertThat(objectMapper.writeValueAsString(response)).doesNotContain(SKILLPILOT_ID);
        ArgumentCaptor<ScopeRequest> request = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(coachTools).setScope(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().goalIds()).containsExactly("goal-1");
    }

    @Test
    void nullOrInvalidMasteryReturnsBadRequestWithoutMapOfFailureOrBackendCall() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);

        assertBadMastery(tools.setMastery(null, 0.5), "goalId");
        assertBadMastery(tools.setMastery("goal-1", null), "between 0.0 and 1.0");
        assertBadMastery(tools.setMastery("goal-1", Double.NaN), "between 0.0 and 1.0");
        assertBadMastery(tools.setMastery("goal-1", 1.1), "between 0.0 and 1.0");
        verifyNoInteractions(coachTools, connectionService);
    }

    @Test
    void redactsPermanentIdFromMasteryConflictState() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(coachTools.setMastery(eq(SKILLPILOT_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.CONFLICT,
                        null,
                        stateWithSkillpilotId(),
                        null));

        ClaudeCoachMcpTools.MasteryToolResult result = tools.setMastery(" goal-1 ", 0.75);

        assertThat(result.status()).isEqualTo("conflict");
        assertThat(result.state().learningState()).isEqualTo("learning");
        assertThat(objectMapper.writeValueAsString(result)).doesNotContain(SKILLPILOT_ID);
        ArgumentCaptor<MasteryUpdateRequest> request = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(coachTools).setMastery(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().goalId()).isEqualTo("goal-1");
        assertThat(request.getValue().mastery()).containsEntry("goal-1", 0.75);
    }

    @Test
    void projectsMasteryUpdateBeforeReturningItToClaude() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        UnifiedLearnerStateResponse unsafeState = stateWithReleasedExam();
        MasteryUpdateResponse unsafeUpdate = new MasteryUpdateResponse(
                true,
                "exam-1",
                1.0,
                unsafeState.frontier(),
                unsafeState.nextAllowedActions(),
                unsafeState.learningState(),
                unsafeState.activeGoal(),
                unsafeState.stateMachine(),
                unsafeState.goals());
        when(coachTools.setMastery(eq(SKILLPILOT_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        unsafeUpdate,
                        null,
                        null));

        ClaudeCoachMcpTools.MasteryToolResult result = tools.setMastery("exam-1", 1.0);

        assertThat(result.update().saved()).isTrue();
        assertThat(result.update().savedGoalId()).isEqualTo("exam-1");
        assertThat(result.update().savedMastery()).isEqualTo(1.0);
        String json = objectMapper.writeValueAsString(result);
        assertThat(json)
                .contains("Visible task", "maxPoints")
                .doesNotContain(
                        "SECRET SOLUTION",
                        "SECRET RUBRIC",
                        "SECRET SOURCE",
                        "solutionContent",
                        "passingPoints",
                        "sourceArtifactPath",
                        "\"steps\"");
    }

    @Test
    void normalCoachContextProjectsReleasedExamWithoutSolutionOrRubric() throws Exception {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(connectionService.consumePendingLaunch(SUBJECT)).thenReturn(Optional.empty());
        when(coachTools.getLearnerState(SKILLPILOT_ID)).thenReturn(stateWithReleasedExam());

        ClaudeCoachMcpTools.CoachContext context = tools.getCoachContext();

        String json = objectMapper.writeValueAsString(context);
        assertThat(json)
                .contains("Visible task", "maxPoints")
                .doesNotContain(
                        SKILLPILOT_ID,
                        "copied-learner-secret-id",
                        "SECRET SOLUTION",
                        "SECRET RUBRIC",
                        "passingPoints",
                        "sourceArtifactPath");
        assertThat(context.state().activeGoal().examData().getScoring().getMaxPoints()).isEqualTo(10.0);
    }

    @Test
    void appliesPersonalizationThroughTheSharedFacade() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        when(coachTools.setPersonalization(eq(SKILLPILOT_ID), any(PersonalizationRequest.class)))
                .thenReturn(stateWithSkillpilotId());

        tools.setPersonalization(List.of("scope-1"), List.of("filter-1"));

        ArgumentCaptor<PersonalizationRequest> request = ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(coachTools).setPersonalization(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().config()).isEmpty();
        assertThat(request.getValue().goalIds()).containsExactly("scope-1");
        assertThat(request.getValue().filters()).containsExactly("filter-1");
    }

    @Test
    void releasesLocalizedExamEvaluationOnlyThroughTheDedicatedTool() {
        authenticate(ClaudeOAuthConfiguration.READ_SCOPE, ClaudeOAuthConfiguration.WRITE_SCOPE);
        when(connectionService.resolveSkillpilotId(SUBJECT)).thenReturn(SKILLPILOT_ID);
        CoachToolFacade.ExamScoring scoring = new CoachToolFacade.ExamScoring(
                10.0,
                5.0,
                List.of(new CoachToolFacade.ExamScoringStep("step-1", 10.0, "Rubric")));
        when(coachTools.getExamEvaluation(
                eq(SKILLPILOT_ID),
                any(CoachToolFacade.ExamEvaluationRequest.class)))
                .thenReturn(new CoachToolFacade.ExamEvaluationResult(
                        "exam-1",
                        "Deutsche Lösung $x$",
                        "English solution $x$",
                        scoring));

        ClaudeCoachMcpTools.ExamEvaluationToolResult result =
                tools.getExamEvaluation("exam-1", "en");

        assertThat(result.goalId()).isEqualTo("exam-1");
        assertThat(result.solutionContent()).isEqualTo("English solution \\(x\\)");
        assertThat(result.scoring()).isSameAs(scoring);
        assertThat(result.instruction())
                .contains("reference only")
                .contains("equivalent")
                .contains("specific answer form")
                .contains("requirements remain binding")
                .contains("without follow-up questions")
                .contains("never invent a specific subject error");
        ArgumentCaptor<CoachToolFacade.ExamEvaluationRequest> request =
                ArgumentCaptor.forClass(CoachToolFacade.ExamEvaluationRequest.class);
        verify(coachTools).getExamEvaluation(eq(SKILLPILOT_ID), request.capture());
        assertThat(request.getValue().goalId()).isEqualTo("exam-1");
    }

    private void authenticate(String... scopes) {
        List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(scopes)
                .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope))
                .toList();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(SUBJECT, "unused", authorities));
    }

    private UnifiedLearnerStateResponse stateWithSkillpilotId() {
        return new UnifiedLearnerStateResponse(
                SKILLPILOT_ID,
                null,
                List.of(),
                null,
                List.of(),
                List.of(),
                Set.of(new CopySource(
                        "copied-learner-secret-id",
                        Instant.parse("2026-01-01T00:00:00Z"))),
                "learning",
                null,
                null);
    }

    private UnifiedLearnerStateResponse stateWithReleasedExam() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setSourceArtifactPath("SECRET SOURCE");
        exam.setTaskContent("Visible task");
        exam.setSolutionContent("SECRET SOLUTION");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10.0);
        scoring.setPassingPoints(5.0);
        ExamData.Step step = new ExamData.Step();
        step.setId("step-1");
        step.setPoints(10.0);
        step.setDescription("SECRET RUBRIC");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        FrontierGoal active = new FrontierGoal(
                "exam-1",
                "Exam",
                "Solve it",
                "atomic",
                "exam",
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                exam);
        return new UnifiedLearnerStateResponse(
                SKILLPILOT_ID,
                null,
                List.of(active),
                null,
                List.of("teachActiveGoal"),
                List.of(),
                Set.of(new CopySource(
                        "copied-learner-secret-id",
                        Instant.parse("2026-01-01T00:00:00Z"))),
                "learning",
                active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
    }

    private void assertBadMastery(ClaudeCoachMcpTools.MasteryToolResult result, String errorPart) {
        assertThat(result.status()).isEqualTo("bad_request");
        assertThat(result.update()).isNull();
        assertThat(result.state()).isNull();
        assertThat(result.error()).contains(errorPart);
    }
}
