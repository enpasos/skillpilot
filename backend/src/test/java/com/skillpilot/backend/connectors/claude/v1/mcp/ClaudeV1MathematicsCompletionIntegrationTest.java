package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.AutomaticCompletionIntegrity;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.CompletionEvaluator;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.completion.LearningPlanCompletionContext;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.LearnerService;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

/**
 * Real Mathematics direct-assessment transaction with an explicit integrity-type contract.
 * Unknown completion stays unknown; this single scope never replaces the strict 161-scope data gate.
 */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:completion-math-mcp;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1MathematicsCompletionIntegrationTest {
    private static final String PROFILE = "automatic:personal-curriculum";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    private String learnerId;
    private String session;

    @BeforeEach void launchSupportedProfileSession() throws Exception {
        Learner learner = new Learner();
        learnerId = "completion-mcp-" + UUID.randomUUID();
        learner.setSkillpilotId(learnerId); learner.setSelectedCurriculum(ROOT);
        learner.setStrictMode(true); learner.setAutoPilot(false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"),
                MATH, Map.of("selected", true, "filterId", "GK+LK"),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                "__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", ROOT,
                        "completedOptionIds", List.of(), "migrationCompleted", true))));
        learner = learnerRepository.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
        var launch = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start"));
        assertThat(launch.prompt()).isEqualTo(
                "Nutze den SkillPilot-Coach-Skill und lerne mit meinem aktuellen SkillPilot-Lernkontext weiter."
                        + "\nlearningSessionId: " + launch.learningSessionId());
        session = launch.learningSessionId();
        authenticate();
    }

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test void failedAssessmentRetryAndConfirmedMasteryUseFreshCapabilitiesAndOneBinaryResult() throws Exception {
        // Use the complete real Level-2 inputs, not the bounded MCP choice list or a smaller focus.
        var inputs = learners.getLearningPlanCompletionContext(learnerId);
        assertThat(inputs.semantics()).isEqualTo(LearningPlanCompletionContext.Semantics.AUTOMATIC);
        Set<String> atomicTargets = inputs.level2TargetGoalIds().stream().filter(id -> {
            var goal = inputs.canonicalGoals().get(id);
            return goal.getContains() == null || goal.getContains().isEmpty();
        }).collect(Collectors.toSet());
        var graph = new CompletionProfileCompiler().compileAutomatic(inputs.canonicalGoals(),
                atomicTargets, inputs.level2TargetGoalIds(), inputs.generation());
        Set<String> uncovered = AutomaticCompletionIntegrity.uncoveredTargets(graph);
        assertThat(graph.assessmentGoalIds()).hasSizeGreaterThan(24).contains(EXAM);
        assertThat(graph.targetGoalIds()).contains(EXAM, PREPARATION);
        var before = learners.getLearnerState(learnerId).levelCompletion();
        assertThat(before.curriculumGeneration()).isEqualTo(inputs.generation());
        assertThat(before.assessments()).extracting(assessment -> assessment.goalId())
                .containsExactlyInAnyOrderElementsOf(graph.assessmentGoalIds());
        assertThat(before.profileOptions()).filteredOn(option -> PROFILE.equals(option.profileId()))
                .singleElement().satisfies(option -> assertThat(option.assessments())
                        .extracting(assessment -> assessment.goalId())
                        .containsExactlyInAnyOrderElementsOf(graph.assessmentGoalIds()));
        assertThat(before.calculationStatus()).isEqualTo(uncovered.isEmpty() ? "valid" : "invalid");
        assertThat(before.notice()).isEqualTo(uncovered.isEmpty() ? null : "completion_target_routes_uncovered");
        Map<String, Object> pending = context();
        String receipt = (String) map(pending, "completionContract").get("receiptCapability");
        long beforeReceipt = version();
        assertThat(successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", receipt)).get("confirmed")).isEqualTo(true);
        assertThat(version()).isEqualTo(beforeReceipt);
        Map<String, Object> initial = context();
        String start = choice(initial, "Prüfung direkt versuchen: ");
        long beforeStart = version();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("forged-choice", beforeStart, Map.of("choice", "Prüfung direkt versuchen"))).isError()).isTrue();
        assertThat(version()).isEqualTo(beforeStart);
        var started = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("direct-start", beforeStart, Map.of("choice", start)));
        assertThat(map(map(started, "context"), "activeGoal")).containsEntry("id", EXAM);
        String projected = mapper.writeValueAsString(map(started, "context"));
        assertThat(projected).doesNotContain("solutionContent", "passingPoints", "evaluationCapability", "sessionBinding");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getStrictMode()).isTrue();
        assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);

        Map<String, Object> firstEvaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        long activeVersion = version();
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("not-passed", activeVersion,
                Map.of("goalId", EXAM, "evaluationCapability", firstEvaluation.get("evaluationCapability"), "earnedPoints", 4.0))).isError()).isTrue();
        assertThat(version()).isEqualTo(activeVersion);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(learners.getLearnerState(learnerId).levelCompletion().directAssessmentRunning()).isTrue();

        String retry = choice(context(), "Prüfung erneut versuchen");
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("retry", activeVersion, Map.of("choice", retry)));
        long retryVersion = version();
        assertThat(retryVersion).isGreaterThan(activeVersion);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("stale-capability", retryVersion,
                Map.of("goalId", EXAM, "evaluationCapability", firstEvaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();

        Map<String, Object> freshEvaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        Map<String, Object> passArgs = writeArgs("confirmed-pass", retryVersion, Map.of("goalId", EXAM,
                "evaluationCapability", freshEvaluation.get("evaluationCapability"), "earnedPoints", 10.0));
        var saved = successful(ClaudeV1Contract.TOOL_SET_MASTERY, passArgs);
        assertThat(saved).containsEntry("savedGoalId", EXAM).containsEntry("savedMastery", 1.0);
        var completed = learners.getLearnerState(learnerId).levelCompletion();
        var projectedCompletion = map(map(saved, "context"), "levelCompletion");
        assertThat(completed.assessments()).extracting(assessment -> assessment.goalId())
                .containsExactlyInAnyOrderElementsOf(graph.assessmentGoalIds());
        assertThat(completed.assessments()).hasSizeGreaterThan(24)
                .anySatisfy(assessment -> assertThat(assessment.mastered()).isFalse());
        if (uncovered.isEmpty()) {
            // A real repair automatically restores every original valid-result requirement.
            assertThat(completed.calculationStatus()).isEqualTo("valid");
            assertThat(completed.notice()).isNull();
            assertThat(projectedCompletion).containsEntry("complete", false);
            assertThat(completed.complete()).isFalse();
            assertThat(completed.masteredAssessmentCount()).isEqualTo(1);
            assertThat(completed.requiredAssessmentCount()).isGreaterThan(24)
                    .isEqualTo(graph.assessmentGoalIds().size());
            assertThat(completed.pendingTargetCount()).isPositive();
            var evaluated = new CompletionEvaluator().evaluateAutomatic(graph, Set.of(EXAM));
            assertThat(completed.targetCount()).isEqualTo(evaluated.targetCount());
            assertThat(completed.masteredTargetCount()).isEqualTo(evaluated.masteredTargetCount());
            assertThat(completed.waivedTargetCount()).isEqualTo(evaluated.waivedTargetCount());
            assertThat(completed.pendingTargetCount()).isEqualTo(evaluated.pendingTargetGoalIds().size());
        } else {
            // A genuine task result does not repair unrelated curriculum routes or invent totals.
            assertThat(completed.calculationStatus()).isEqualTo("invalid");
            assertThat(completed.notice()).isEqualTo("completion_target_routes_uncovered");
            assertThat(completed.complete()).isNull();
            assertThat(completed.waivedTargetGoalIds()).isEmpty();
            assertThat(completed.waiverDetails()).isEmpty();
            assertThat(projectedCompletion).containsEntry("calculationStatus", "invalid")
                    .doesNotContainKeys("complete", "text", "waivedPreparation");
            assertThatThrownBy(() -> new CompletionEvaluator().evaluateAutomatic(graph, Set.of(EXAM)))
                    .isInstanceOfSatisfying(CompletionCompilationException.class, failure ->
                            assertThat(failure.code()).isEqualTo("UNCOVERED_COMPLETION_TARGETS"));
        }
        assertThat(completed.assessments()).filteredOn(assessment -> EXAM.equals(assessment.goalId()))
                .singleElement().satisfies(assessment -> assertThat(assessment.mastered()).isTrue());
        assertThat(successful(ClaudeV1Contract.TOOL_SET_MASTERY, passArgs)).isEqualTo(saved);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("new-write", version(), Map.of("goalId", EXAM))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).singleElement()
                .satisfies(m -> { assertThat(m.getGoalKey()).isEqualTo(EXAM); assertThat(m.getValue()).isEqualTo(1.0); });
        assertThat(learners.getMastery(learnerId).getOrDefault(PREPARATION, 0.0)).isZero();
    }

    private void authenticate() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", List.of(
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }
    private long version() { return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision(); }
    private Map<String, Object> context() throws Exception { return successful(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()); }
    private Map<String, Object> writeArgs(String request, long revision, Map<String, Object> extra) {
        var result = new LinkedHashMap<>(extra);
        result.put("clientRequestId", UUID.nameUUIDFromBytes(request.getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString());
        result.put("expectedStateVersion", revision); return result;
    }
    private String choice(Map<String, Object> context, String prefix) {
        return ((List<?>) map(context, "levelCompletion").get("choices")).stream().map(String::valueOf)
                .filter(label -> label.startsWith(prefix))
                .filter(label -> !prefix.equals("Prüfung direkt versuchen: ")
                        || label.contains("Skalarprodukt über eine orthogonale Projektion erklären"))
                .findFirst().orElseThrow();
    }
    private McpSchema.CallToolResult call(String tool, Map<String, Object> arguments) {
        Map<String, Object> request = new LinkedHashMap<>(arguments);
        request.put("learningSessionId", session); request.put("language", "de");
        var specification = adapter.toolSpecifications().stream().filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        return specification.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, request));
    }
    private Map<String, Object> successful(String tool, Map<String, Object> arguments) throws Exception {
        var response = call(tool, arguments);
        assertThat(response.isError()).as("%s: %s", tool, response.content()).isFalse();
        return mapper.readValue(((McpSchema.TextContent) response.content().getFirst()).text(), new TypeReference<>() {});
    }
    @SuppressWarnings("unchecked") private Map<String, Object> map(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class); return (Map<String, Object>) parent.get(key);
    }
}
