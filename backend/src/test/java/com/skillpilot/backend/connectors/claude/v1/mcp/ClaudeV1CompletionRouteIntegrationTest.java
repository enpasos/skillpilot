package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
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
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;

/** Real canonical pilot through the MCP handler, capabilities and persisted coordinator transactions. */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:completion-mcp;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1CompletionRouteIntegrationTest {
    private static final String PROFILE = "math-dot-product-projection";
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
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
    }

    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    private void returnToOrdinaryLearning() {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "leaveProfile", PROFILE, null, null, version()));
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(com.skillpilot.backend.domain.LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
    }

    @Test void ordinaryCoachSessionOffersAndStartsTheExamWithoutPriorSectionSelection() throws Exception {
        returnToOrdinaryLearning();
        long before = version();
        var pending = context();
        assertThat(map(pending, "activeGoal")).containsEntry("id", PREPARATION);
        assertThat(map(pending, "levelCompletion").get("choices")).isEqualTo(List.of());
        assertThat(pending).doesNotContainKey("assessmentShortcuts");
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        var offered = context();
        String start = choice(offered, "Prüfung direkt versuchen: ");
        assertThat(start).contains("Skalarprodukt über eine orthogonale Projektion erklären");
        assertThat(mapper.writeValueAsString(offered)).doesNotContain("taskContent", "solutionContent", "evaluationCapability");
        assertThat(version()).isEqualTo(before);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("stale-direct-entry", before - 1, Map.of("choice", start))).isError()).isTrue();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(PREPARATION);
        var started = successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("ordinary-direct-entry", before, Map.of("choice", start)));
        assertThat(version()).isEqualTo(before + 1);
        assertThat(map(map(started, "context"), "activeGoal")).containsEntry("id", EXAM);
        assertThat(map(map(started, "context"), "levelCompletion")).containsEntry("directAssessmentRunning", true);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }

    @Test void anObsoleteOrdinarySessionKeepsTeachingAndOffersOnlyTheReadOnlyCockpitHandoff() throws Exception {
        returnToOrdinaryLearning();
        sessionRepository.updateCompletionContract(sessionTokens.hash(session), "confirmed:obsolete-contract");
        long before = version();
        var ordinary = context();
        assertThat(map(ordinary, "activeGoal")).containsEntry("id", PREPARATION);
        assertThat(ordinary).doesNotContainKey("completionContract");
        assertThat(map(ordinary, "levelCompletion").get("choices")).isEqualTo(List.of());
        var handoff = map(ordinary, "assessmentShortcuts");
        assertThat(handoff.get("notice").toString()).contains("Normales Lernen", "neue unterstützte Claude-Sitzung");
        assertThat(handoff.get("options").toString()).contains("/learner/" + EXAM + "?completionShortcuts=1");
        assertThat(handoff.toString()).doesNotContain(learnerId, session, "taskContent", "solutionContent");
        assertThat(version()).isEqualTo(before);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void firstPartyDirectLaunchSelectsTheSectionAndBindsOnlyItsNewSession() throws Exception {
        returnToOrdinaryLearning();
        String oldSession = session;
        long before = version();
        var launch = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                new com.skillpilot.backend.api.CompletionAssessmentStart(PROFILE, EXAM, before)));
        assertThat(launch.prompt()).contains("level-completion context");
        assertThat(version()).isEqualTo(before + 1);
        session = launch.learningSessionId();
        authenticate();
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        assertThat(map(context(), "activeGoal")).containsEntry("id", EXAM);
        session = oldSession;
        authenticate();
        var oldPending = context();
        if (oldPending.containsKey("completionContract")) {
            successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(oldPending, "completionContract").get("receiptCapability")));
        }
        var foreign = context();
        assertThat(foreign.get("activeGoal")).isNull();
        assertThat(map(foreign, "levelCompletion").get("choices")).isEqualTo(List.of());
        assertThat(call(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM)).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void failedAssessmentRetryAndConfirmedMasteryUseFreshCapabilitiesAndOneBinaryResult() throws Exception {
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
        assertThat(map(map(saved, "context"), "levelCompletion")).containsEntry("complete", true);
        assertThat(map(map(saved, "context"), "levelCompletion").get("waivedPreparation").toString())
                .contains("Definition des Skalarprodukts", "Skalarprodukt über eine orthogonale Projektion erklären");
        assertThat(successful(ClaudeV1Contract.TOOL_SET_MASTERY, passArgs)).isEqualTo(saved);
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("new-write", version(), Map.of("goalId", EXAM))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).singleElement()
                .satisfies(m -> { assertThat(m.getGoalKey()).isEqualTo(EXAM); assertThat(m.getValue()).isEqualTo(1.0); });
        assertThat(learners.getLearnerState(learnerId).levelCompletion().waivedTargetCount()).isEqualTo(1);
    }

    @Test void cockpitOptOutInvalidatesAlreadyIssuedExamAndRouteCapabilities() throws Exception {
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        String start = choice(context(), "Prüfung direkt versuchen: ");
        successful(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("start-before-opt-out", version(), Map.of("choice", start)));
        var evaluation = successful(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM));
        String oldRoute = choice(context(), "Prüfung erneut versuchen");
        long before = version();
        learners.setPreferences(learnerId, null, null, null, null, null, null, false);
        assertThat(version()).isGreaterThan(before);
        assertThat(context()).doesNotContainKey("levelCompletion");
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("stale-grade-after-opt-out", before,
                Map.of("goalId", EXAM, "evaluationCapability", evaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(call(ClaudeV1Contract.TOOL_SET_MASTERY, writeArgs("old-evaluation-new-version", version(),
                Map.of("goalId", EXAM, "evaluationCapability", evaluation.get("evaluationCapability"), "earnedPoints", 10.0))).isError()).isTrue();
        assertThat(call(ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs("old-route-after-opt-out", version(), Map.of("choice", oldRoute))).isError()).isTrue();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
        learners.setPreferences(learnerId, null, null, null, null, null, null, true);
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(learner.getCompletionWorkflow()).isNull();
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(choice(context(), "Prüfung direkt versuchen: ")).isNotBlank();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void aSessionStartedWhileOptedOutCanUseFreshChoicesAfterReEnabling() throws Exception {
        learners.setPreferences(learnerId, null, null, null, null, null, null, false);
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        assertThat(context()).doesNotContainKey("levelCompletion");
        learners.setPreferences(learnerId, null, null, null, null, null, null, true);
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        var pending = context();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(pending, "completionContract").get("receiptCapability")));
        assertThat(choice(context(), "Prüfung direkt versuchen: ")).isNotBlank();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learnerId)).isEmpty();
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
                .filter(label -> label.startsWith(prefix)).findFirst().orElseThrow();
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
