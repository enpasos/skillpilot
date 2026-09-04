package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1LearningPlanContractTest {

    private static final long INITIAL_STATE_VERSION = 20L;
    private static final String RESUMED_GOAL_ID = "backend-selected-plan-goal";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1LearningSessionRepository sessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CoachToolFacade coachToolFacade;

    private String learnerId;
    private String connectionId;
    private AtomicReference<FrontierGoal> activeGoal;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository,
                sessionRepository,
                INITIAL_STATE_VERSION);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
        activeGoal = new AtomicReference<>();
        when(coachToolFacade.getLearnerState(learnerId))
                .thenAnswer(invocation -> learnerState(activeGoal.get()));
        when(coachToolFacade.getPersonalizationPlan(learnerId))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(coachToolFacade.getLearningPlanTodayStatus(learnerId, "de")).thenReturn(todayStatus());
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                connectionId,
                "unused",
                List.of(
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void coachContextReadsDailyPlanStatusWithoutReconcilingOrAdvancingState() throws Exception {
        McpSchema.CallToolResult result = call(
                ClaudeV1Contract.TOOL_GET_COACH_CONTEXT,
                Map.of("learningSessionId", connectionId, "language", "de"));

        assertThat(result.isError()).isFalse();
        assertThat(payload(result))
                .containsEntry("stateVersion", 20)
                .hasEntrySatisfying("learningPlanToday", value -> assertThat(value.toString())
                        .contains("Mathematik", "Physik", "completedToday", "openOverdue")
                        .doesNotContain("private-math-landscape", "private-physics-landscape"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
        verify(coachToolFacade, times(1)).getLearningPlanTodayStatus(learnerId, "de");
        verify(coachToolFacade, never()).resumeLearningPlan(learnerId, "de");
    }

    @Test
    @SuppressWarnings("unchecked")
    void resumeUsesCanonicalReconcileAndReturnsFreshFullContextIdempotently() throws Exception {
        when(coachToolFacade.resumeLearningPlan(learnerId, "de")).thenAnswer(invocation -> {
            FrontierGoal selected = goal(RESUMED_GOAL_ID);
            activeGoal.set(selected);
            Learner learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
            learnerRepository.save(learner);
            return new LearnerLearningPlanApi.TransitionResponse(
                    UUID.randomUUID(),
                    7L,
                    "private-math-landscape",
                    "private-focus",
                    RESUMED_GOAL_ID,
                    true,
                    learnerState(selected));
        });
        String clientRequestId = UUID.randomUUID().toString();
        Map<String, Object> arguments = resumeArguments(clientRequestId);

        McpSchema.CallToolResult first = call(
                ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN,
                arguments);
        McpSchema.CallToolResult replay = call(
                ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN,
                arguments);

        Map<String, Object> response = payload(first);
        assertThat(first.isError()).isFalse();
        assertThat(payload(replay)).isEqualTo(response);
        assertThat(response)
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 21)
                .containsEntry(
                        "presentationInstruction",
                        ClaudeV1McpContractAdapter.PLAN_RESUME_CONTINUATION_INSTRUCTION)
                .doesNotContainKeys("planId", "landscapeId", "focusGoalId");
        Map<String, Object> context = (Map<String, Object>) response.get("context");
        assertThat(context)
                .containsEntry("stateVersion", 21)
                .hasEntrySatisfying("activeGoal", value -> assertThat(value)
                        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("id", RESUMED_GOAL_ID));
        Map<String, Object> planToday =
                (Map<String, Object>) context.get("learningPlanToday");
        assertThat(planToday)
                .containsEntry("asOf", "2026-09-04")
                .containsEntry("followLearningPlans", true)
                .containsEntry("resumeAvailable", false)
                .doesNotContainKeys("planId", "landscapeId");
        assertThat(planToday.toString())
                .contains("Mathematik", "Physik")
                .doesNotContain("private-math-landscape", "private-physics-landscape");
        assertThat(currentStateVersion()).isEqualTo(21L);
        verify(coachToolFacade, times(2)).getLearningPlanTodayStatus(learnerId, "de");
        verify(coachToolFacade, times(1)).resumeLearningPlan(learnerId, "de");
    }

    @Test
    void resumeRefusesToReplaceAnExistingActiveGoal() throws Exception {
        activeGoal.set(goal("already-active"));

        McpSchema.CallToolResult result = call(
                ClaudeV1Contract.TOOL_RESUME_LEARNING_PLAN,
                resumeArguments(UUID.randomUUID().toString()));

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "CONFLICT")
                .hasEntrySatisfying("message", value -> assertThat(value.toString())
                        .contains("already active"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
        verify(coachToolFacade, never()).getLearningPlanTodayStatus(learnerId, "de");
        verify(coachToolFacade, never()).resumeLearningPlan(learnerId, "de");
    }

    @Test
    @SuppressWarnings("unchecked")
    void explicitSubjectSwitchUsesOnlyTheLocalizedNameAndReturnsFreshContextIdempotently()
            throws Exception {
        activeGoal.set(goal("unfinished-math-goal"));
        when(coachToolFacade.switchLearningPlanSubject(learnerId, "de", "Physik"))
                .thenAnswer(invocation -> {
                    FrontierGoal selected = goal("backend-selected-physics-goal");
                    activeGoal.set(selected);
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    return new LearnerLearningPlanApi.TransitionResponse(
                            UUID.randomUUID(),
                            8L,
                            "private-physics-landscape",
                            "private-physics-focus",
                            selected.id(),
                            true,
                            learnerState(selected));
                });
        String clientRequestId = UUID.randomUUID().toString();
        Map<String, Object> arguments = switchArguments("Physik", clientRequestId);

        McpSchema.CallToolResult first = call(
                ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                arguments);
        McpSchema.CallToolResult replay = call(
                ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                arguments);

        assertThat(first.isError()).isFalse();
        Map<String, Object> response = payload(first);
        assertThat(payload(replay)).isEqualTo(response);
        assertThat(response)
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 21)
                .containsEntry(
                        "presentationInstruction",
                        ClaudeV1McpContractAdapter.PLAN_SUBJECT_SWITCH_CONTINUATION_INSTRUCTION)
                .doesNotContainKeys(
                        "subject", "planId", "landscapeId", "focusGoalId", "displacedGoalId");
        Map<String, Object> context = (Map<String, Object>) response.get("context");
        assertThat(context)
                .containsEntry("stateVersion", 21)
                .hasEntrySatisfying("activeGoal", value -> assertThat(value)
                        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("id", "backend-selected-physics-goal"));
        assertThat(context.get("learningPlanToday").toString())
                .contains("Mathematik", "Physik")
                .doesNotContain("private-math-landscape", "private-physics-landscape");
        assertThat(currentStateVersion()).isEqualTo(21L);
        verify(coachToolFacade, times(1))
                .switchLearningPlanSubject(learnerId, "de", "Physik");
    }

    @Test
    void subjectSwitchFailsClosedWithoutLeakingInternalPlanIdentifiers() throws Exception {
        activeGoal.set(goal("unfinished-math-goal"));
        when(coachToolFacade.switchLearningPlanSubject(learnerId, "de", "Chemie"))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "private-plan-id private-landscape-id private-goal-id"));

        McpSchema.CallToolResult result = call(
                ClaudeV1Contract.TOOL_SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Chemie", UUID.randomUUID().toString()));

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "CONFLICT")
                .hasEntrySatisfying("message", value -> assertThat(value.toString())
                        .contains("cannot be switched")
                        .doesNotContain(
                                "private-plan-id", "private-landscape-id", "private-goal-id"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
    }

    private LearnerPlanTodayStatus todayStatus() {
        return new LearnerPlanTodayStatus(
                LocalDate.of(2026, 9, 4),
                true,
                true,
                List.of(
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-math-landscape", "Mathematik", 3, 1, 2, 1),
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-physics-landscape", "Physik", 2, 0, 2, 0)),
                new LearnerPlanTodayStatus.Totals(5, 1, 4, 1),
                0);
    }

    private Map<String, Object> resumeArguments(String clientRequestId) {
        Map<String, Object> arguments = new LinkedHashMap<>();
        arguments.put("learningSessionId", connectionId);
        arguments.put("expectedStateVersion", INITIAL_STATE_VERSION);
        arguments.put("clientRequestId", clientRequestId);
        arguments.put("language", "de");
        return Map.copyOf(arguments);
    }

    private Map<String, Object> switchArguments(String subject, String clientRequestId) {
        Map<String, Object> arguments = new LinkedHashMap<>();
        arguments.put("learningSessionId", connectionId);
        arguments.put("subject", subject);
        arguments.put("expectedStateVersion", INITIAL_STATE_VERSION);
        arguments.put("clientRequestId", clientRequestId);
        arguments.put("language", "de");
        return Map.copyOf(arguments);
    }

    private UnifiedLearnerStateResponse learnerState(FrontierGoal selected) {
        String requiredAction = selected == null ? "setActiveGoal" : "teachActiveGoal";
        return new UnifiedLearnerStateResponse(
                null,
                null,
                selected == null ? List.of(goal(RESUMED_GOAL_ID)) : List.of(selected),
                null,
                List.of(requiredAction),
                List.of(),
                Set.of(),
                selected == null ? "FRONTIER" : "TEACHING",
                selected,
                new StateMachineInfo(
                        selected == null ? "FRONTIER" : "TEACHING",
                        requiredAction,
                        selected == null ? List.of(goal(RESUMED_GOAL_ID)) : List.of(selected),
                        List.of(),
                        selected));
    }

    private FrontierGoal goal(String id) {
        return new FrontierGoal(
                id,
                "Learning goal " + id,
                "Learner-facing description",
                "atomic",
                "tutor",
                "content",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        McpStatelessServerFeatures.SyncToolSpecification specification =
                contractAdapter.toolSpecifications().stream()
                        .filter(candidate -> toolName.equals(candidate.tool().name()))
                        .findFirst()
                        .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, arguments));
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) throws Exception {
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        String json = ((McpSchema.TextContent) result.content().getFirst()).text();
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    private long currentStateVersion() {
        return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();
    }
}
