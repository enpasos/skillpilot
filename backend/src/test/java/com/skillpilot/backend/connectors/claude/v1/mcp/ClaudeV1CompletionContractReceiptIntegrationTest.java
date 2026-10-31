package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
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
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

/** Real MCP handlers and committed repositories; a receipt is not a host-compliance claim. */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:completion-mcp;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1CompletionContractReceiptIntegrationTest {
    private static final String PROFILE = "automatic:personal-curriculum";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    @Autowired ClaudeV1McpContractAdapter adapter;
    @Autowired ClaudeV1CompletionContractRegistry contract;
    @Autowired ClaudeV1SessionCoordinator coordinator;
    @Autowired ClaudeV1LearningSessionService sessions;
    @Autowired ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository mastery;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    @Autowired io.micrometer.core.instrument.MeterRegistry meters;
    private String learnerId;
    private String session;

    @BeforeEach void freshPendingSession() throws Exception {
        Learner learner = new Learner();
        learnerId = "completion-receipt-" + UUID.randomUUID();
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
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("synthetic-oauth-subject", "unused", List.of(
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }
    @AfterEach void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @Test void pendingContextContainsOnlyTechnicalReceiptAndConfirmationIsMetadataOnlyAndIdempotent() throws Exception {
        long revision = version();
        String workflow = learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow();
        Map<String, Object> pending = context();
        assertThat(pending.keySet()).containsExactlyInAnyOrder("stateVersion", "language", "state", "completionContract", "instruction");
        assertThat(map(pending, "completionContract")).containsEntry("status", "pending");
        assertThat(stamp(session)).isEqualTo(contract.pendingStamp());
        String receipt = receipt(pending);
        Map<String, Object> response = successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt));
        assertThat(response).containsEntry("confirmed", true);
        assertThat(successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt))).isEqualTo(response);
        assertThat(stamp(session)).isEqualTo(contract.confirmedStamp());
        assertThat(version()).isEqualTo(revision);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(focus.findByLearner_SkillpilotId(learnerId)).extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
        assertThat(mastery.findByLearner_SkillpilotId(learnerId)).isEmpty();
        assertThat(context()).containsKey("levelCompletion").doesNotContainKey("completionContract");
    }

    @Test void pendingActiveProfileCannotReadAssessmentOrWriteThroughOrdinaryTools() throws Exception {
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start",
                new com.skillpilot.backend.api.CompletionAssessmentStart(PROFILE, EXAM, version()))).learningSessionId();
        long revision = version();
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(EXAM);
        assertThat(context()).doesNotContainKeys("activeGoal", "task", "exam", "goalVisualization");
        assertThat(call(session, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM)).isError()).isTrue();
        assertThat(call(session, ClaudeV1Contract.TOOL_GET_NAVIGATION_OPTIONS, Map.of()).isError()).isTrue();
        assertThat(call(session, ClaudeV1Contract.TOOL_RENDER_GOAL_VISUALIZATION,
                Map.of("goalId", EXAM, "expectedStateVersion", revision)).isError()).isTrue();
        assertThat(call(session, ClaudeV1Contract.TOOL_SET_MASTERY,
                writeArgs(Map.of("goalId", EXAM))).isError()).isTrue();
        assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs(Map.of("choice", "invented"))).isError()).isTrue();
        assertThat(version()).isEqualTo(revision);
        assertThat(mastery.findByLearner_SkillpilotId(learnerId)).isEmpty();
        successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt(context())));
        assertThat(call(session, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM)).isError()).isFalse();
        assertThat(version()).isEqualTo(revision);
    }

    @Test void ordinaryLearningWithoutProfileWorksAndLaterProfileActivationRequiresReceipt() throws Exception {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", null, null, null, version()));
        assertThat(map(context(), "completionContract")).containsEntry("status", "pending");
        assertThat(context().get("state")).isNotEqualTo("completionContractPaused");
        assertThat(call(session, ClaudeV1Contract.TOOL_GET_NAVIGATION_OPTIONS, Map.of()).isError()).isFalse();
        assertThat(coordinator.read(session, ctx -> "ordinary read").value()).isEqualTo("ordinary read");
        assertThat(stamp(session)).isEqualTo(contract.pendingStamp());
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, version()));
        assertThat(map(context(), "completionContract")).containsEntry("status", "pending");
    }

    @Test void firstSectionCanBeChosenInTheCoachAfterAnOptionalOrdinaryContextReceipt() throws Exception {
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", null, null, null, version()));
        long revision = version();
        successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", receipt(context())));
        assertThat(version()).isEqualTo(revision);
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow()).isNull();
        Map<String, Object> ready = context();
        String choice = ((List<?>) map(ready, "levelCompletion").get("choices")).stream().map(String::valueOf)
                .filter(label -> label.startsWith("Abschnitt wählen: ")).findFirst().orElseThrow();
        String selectedProfile = learners.getLearnerState(learnerId).levelCompletion().profileOptions().stream()
                .filter(option -> choice.equals("Abschnitt wählen: " + option.title().get("de")))
                .map(option -> option.profileId()).findFirst().orElseThrow();
        successful(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, writeArgs(Map.of("choice", choice)));
        assertThat(mapper.readValue(learnerRepository.findById(learnerId).orElseThrow().getCompletionWorkflow(),
                com.skillpilot.backend.completion.CompletionWorkflowState.class).profileId()).isEqualTo(selectedProfile);
        assertThat(selectedProfile).startsWith("automatic:").isNotEqualTo(PROFILE);
        assertThat(context()).containsKey("levelCompletion").doesNotContainKey("completionContract");
        assertThat(mastery.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void onlyActualExpectedAndReplayRevisionConflictsAreCountedForCompletion() throws Exception {
        var conflicts = meters.get("skillpilot.completion.revision.conflicts").tag("source", "coach").counter();
        double before = conflicts.count();
        Map<String, Object> stale = writeArgs(Map.of("choice", "invented"));
        stale.put("expectedStateVersion", version() - 1);
        assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, stale).isError()).isTrue();
        assertThat(conflicts.count()).isEqualTo(before); // Contract rejection happens before revision/replay.
        successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt(context())));
        assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, stale).isError()).isTrue();
        assertThat(conflicts.count()).isEqualTo(before + 1);
        assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE,
                writeArgs(Map.of("choice", "invented"))).isError()).isTrue();
        assertThat(conflicts.count()).isEqualTo(before + 1); // A current but unpublished choice is not a revision conflict.
        String choice = ((List<?>) map(context(), "levelCompletion").get("choices")).stream().map(String::valueOf)
                .filter(label -> label.startsWith("Prüfung direkt versuchen: ")).findFirst().orElseThrow();
        Map<String, Object> accepted = writeArgs(Map.of("choice", choice));
        Map<String, Object> saved = successful(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, accepted);
        assertThat(successful(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, accepted)).isEqualTo(saved);
        assertThat(conflicts.count()).isEqualTo(before + 1);
        learners.chooseLevelCompletion(learnerId, new LevelCompletionActionRequest("leaveProfile", null, null, null, version()));
        long currentRevision = version();
        assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, accepted).isError()).isTrue();
        assertThat(conflicts.count()).isEqualTo(before + 2);
        assertThatThrownBy(() -> coordinator.mutate(session, ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL,
                UUID.randomUUID().toString(), currentRevision - 1, Map.of("goalId", PREPARATION),
                ignored -> { throw new AssertionError("A stale ordinary write must not reach the operation"); }))
                .isInstanceOf(ClaudeV1SessionCoordinator.StaleStateException.class);
        assertThat(conflicts.count()).isEqualTo(before + 2); // Ordinary-route conflicts use their existing observability.
        assertThat(version()).isEqualTo(currentRevision);
        assertThat(mastery.findByLearner_SkillpilotId(learnerId)).isEmpty();
    }

    @Test void foreignSessionAndClaimedVersionCannotConfirmThePendingSession() throws Exception {
        String receipt = receipt(context());
        String otherSession = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        assertThat(call(otherSession, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt)).isError()).isTrue();
        assertThat(call(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", receipt, "contractVersion", "completion@1")).isError()).isTrue();
        assertThat(stamp(otherSession)).isEqualTo(contract.pendingStamp());
        assertThat(stamp(session)).isEqualTo(contract.pendingStamp());
        successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt));
    }

    static Stream<String> unsupportedStamps() {
        return Stream.of(null, "completion@1", "pending:" + "b".repeat(64), "confirmed:" + "b".repeat(64));
    }
    @ParameterizedTest @MethodSource("unsupportedStamps")
    void legacyAndForeignBindingsNeverReceiveOrAcceptAnUpgradeReceipt(String stamp) throws Exception {
        String validButOldReceipt = receipt(context());
        sessionRepository.updateCompletionContract(sessionTokens.hash(session), stamp);
        Map<String, Object> paused = map(context(), "completionContract");
        assertThat(paused).containsEntry("status", "unavailable").doesNotContainKey("receiptCapability");
        assertThat(call(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", validButOldReceipt)).isError()).isTrue();
        assertThat(stamp(session)).isEqualTo(stamp);
    }

    @Test void newGenerationRegistryRejectsOldReceiptAndExactReplayBeforeDomainReentry() throws Exception {
        String receipt = receipt(context());
        successful(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt));
        String choice = ((List<?>) map(context(), "levelCompletion").get("choices")).stream().map(String::valueOf)
                .filter(label -> label.startsWith("Prüfung direkt versuchen: ")).findFirst().orElseThrow();
        Map<String, Object> args = writeArgs(Map.of("choice", choice));
        Map<String, Object> saved = successful(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, args);
        assertThat(successful(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, args)).isEqualTo(saved);
        long revision = version();
        // A separate immutable registry is exactly the binding boundary of a restarted server.
        var next = new ClaudeV1CompletionContractRegistry(mapper,
                new CompletionProfileCatalog(Map.of(), Map.of(), "next-immutable-generation"));
        next.register(adapter.serverInstructions(), adapter.toolSpecifications().stream().map(spec -> spec.tool()).toList());
        assertThat(next.contractFingerprint()).isEqualTo(contract.contractFingerprint());
        assertThat(next.bindingDigest()).isNotEqualTo(contract.bindingDigest());
        ReflectionTestUtils.setField(coordinator, "completionContract", next);
        try {
            assertThat(call(session, ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE, args).isError()).isTrue();
            assertThat(map(context(), "completionContract")).containsEntry("status", "unavailable");
            assertThat(call(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", receipt)).isError()).isTrue();
            assertThat(version()).isEqualTo(revision);
            assertThat(mastery.findByLearner_SkillpilotId(learnerId)).isEmpty();
        } finally {
            ReflectionTestUtils.setField(coordinator, "completionContract", contract);
        }
    }

    private String stamp(String id) { return sessionRepository.findByTokenHash(sessionTokens.hash(id)).orElseThrow().completionContract(); }
    private long version() { return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision(); }
    private Map<String, Object> context() throws Exception { return successful(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()); }
    private String receipt(Map<String, Object> context) { return (String) map(context, "completionContract").get("receiptCapability"); }
    private Map<String, Object> writeArgs(Map<String, Object> extra) {
        var result = new LinkedHashMap<>(extra); result.put("expectedStateVersion", version()); result.put("clientRequestId", UUID.randomUUID().toString()); return result;
    }
    private McpSchema.CallToolResult call(String id, String tool, Map<String, Object> arguments) {
        Map<String, Object> request = new LinkedHashMap<>(arguments); request.put("learningSessionId", id); request.put("language", "de");
        var specification = adapter.toolSpecifications().stream().filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        return specification.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, request));
    }
    private Map<String, Object> successful(String id, String tool, Map<String, Object> arguments) throws Exception {
        var response = call(id, tool, arguments); assertThat(response.isError()).as("%s: %s", tool, response.content()).isFalse();
        return mapper.readValue(((McpSchema.TextContent) response.content().getFirst()).text(), new TypeReference<>() {});
    }
    @SuppressWarnings("unchecked") private Map<String, Object> map(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class); return (Map<String, Object>) parent.get(key);
    }
}
