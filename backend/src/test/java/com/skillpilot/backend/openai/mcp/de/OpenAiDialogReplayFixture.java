package com.skillpilot.backend.openai.mcp.de;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/**
 * Test-only, in-memory domain fixture with the real MCP adapter and session coordinator.
 * No Spring application, database, network client, production identity or environment key is used.
 * This checks model orchestration against adapter outputs, not production domain or host acceptance.
 */
public final class OpenAiDialogReplayFixture {
    public static final String LEARNER_ID = "synthetic-dialog-fixture-learner";
    public static final String SESSION_ID = "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    public static final String SIGNING_SECRET = "skillpilot-dialog-fixture-public-test-secret-only";
    public static final String EVIDENCE_LAYER = "model-api-with-simulated-domain";

    public final String caseId;
    public final CoachToolFacade coachTools = mock(CoachToolFacade.class);
    public final OpenAiDeCoachIdentityResolver identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
    public final OpenAiDeV1McpContractAdapter contract;
    public final Map<String, McpSchema.CallToolResult> lastResults = new LinkedHashMap<>();
    public final List<Map<String, Object>> callAudit = new ArrayList<>();
    public final Map<String, Object> domainState = new LinkedHashMap<>();
    public UnifiedLearnerStateResponse state;
    public PersonalizationPlan personalization = PersonalizationPlan.complete(List.of());
    public LearnerPlanTodayStatus planStatus = new LearnerPlanTodayStatus(
            LocalDate.parse("2026-09-09"), false, false, List.of(),
            new LearnerPlanTodayStatus.Totals(0, 0, 0, 0), 0);
    public boolean sessionValid = true;
    public String preparedMessage = "Bitte verwende SkillPilot Coach v1 und lade meinen aktuellen Kontext. "
            + "learningSessionId: " + SESSION_ID;
    public List<Map<String, Object>> priorConversation = List.of();
    public Function<String, List<McpSchema.CallToolResult>> uiDriver = turnId -> {
        throw new IllegalArgumentException("No simulated component action for this fixture");
    };

    private final Learner learner = new Learner();
    private final Map<Object, OpenAiDeIdempotencyRecord> receipts = new LinkedHashMap<>();
    private String actor = "model";

    public OpenAiDialogReplayFixture(String caseId) {
        this.caseId = caseId;
        learner.setSkillpilotId(LEARNER_ID);
        learner.setCoachStateRevision(0L);
        var session = new OpenAiDeLearningSession();
        var now = Instant.now();
        String tokenHash = tokenHash(SESSION_ID);
        session.setLearner(learner);
        session.setTokenHash(tokenHash);
        session.setStartedAt(now.minusSeconds(10));
        session.setExpiresAt(now.plusSeconds(7200));
        session.setContractMajor(1);
        session.setStateVersion(0L);
        session.setStateSchemaVersion(1);
        session.setWorkflowVersion(OpenAiDeV1ContractMetadata.WORKFLOW_VERSION);
        session.setCurriculumRevision("synthetic-dialog-curriculum-v1");
        session.setCommunicationLocale("de-DE");
        session.setVerifiedRecallBatchSize(10);
        var sessions = mock(OpenAiDeLearningSessionRepository.class);
        var learners = mock(LearnerRepository.class);
        var requests = mock(OpenAiDeIdempotencyRecordRepository.class);
        var revisions = mock(OpenAiDeCurriculumRevisionProvider.class);
        when(revisions.currentRevision()).thenReturn("synthetic-dialog-curriculum-v1");
        when(sessions.findLearnerSkillpilotIdByTokenHash(any())).thenAnswer(invocation ->
                sessionValid && tokenHash.equals(invocation.getArgument(0))
                        ? Optional.of(LEARNER_ID) : Optional.empty());
        when(sessions.findByTokenHashForUpdate(any())).thenAnswer(invocation ->
                sessionValid && tokenHash.equals(invocation.getArgument(0))
                        ? Optional.of(session) : Optional.empty());
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learners.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(sessions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(requests.findById(any())).thenAnswer(invocation ->
                Optional.ofNullable(receipts.get(invocation.getArgument(0))));
        when(requests.save(any())).thenAnswer(invocation -> {
            OpenAiDeIdempotencyRecord receipt = invocation.getArgument(0);
            receipts.put(receipt.getId(), receipt);
            return receipt;
        });
        when(identityResolver.resolveSkillpilotId(any(), any())).thenAnswer(invocation -> {
            if (!sessionValid || !SESSION_ID.equals(invocation.getArgument(1))) {
                throw new OpenAiDeLearningSessionRequiredException();
            }
            return LEARNER_ID;
        });
        when(identityResolver.authenticationChallenge())
                .thenReturn("Bearer resource_metadata=\"https://skillpilot.test/metadata\"");
        when(coachTools.getLearnerState(LEARNER_ID)).thenAnswer(invocation -> state);
        when(coachTools.getPersonalizationPlan(LEARNER_ID)).thenAnswer(invocation -> personalization);
        when(coachTools.getLearningPlanTodayStatus(eq(LEARNER_ID), any()))
                .thenAnswer(invocation -> planStatus);
        when(coachTools.showGoalVisualizationsInChat(LEARNER_ID)).thenReturn(true);
        var coordinator = new OpenAiDeV1McpSessionCoordinator(
                sessions, learners, requests, new OpenAiDeProperties(), revisions, SIGNING_SECRET);
        contract = new OpenAiDeV1McpContractAdapter(
                coachTools, new CoachStateProjection("https://skillpilot.com"), identityResolver,
                new OpenAiDeMcpTelemetry(new SimpleMeterRegistry()), coordinator,
                "https://skillpilot.com", "dialog-fixture", SIGNING_SECRET, true);
    }

    public long currentStateVersion() {
        return learner.getCoachStateRevision();
    }

    public List<McpSchema.Tool> modelTools() {
        return contract.toolSpecifications().stream().map(spec -> spec.tool())
                .filter(OpenAiDialogReplayFixture::modelVisible).toList();
    }

    public McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        var specification = contract.toolSpecifications().stream()
                .filter(spec -> name.equals(spec.tool().name())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown fixture tool"));
        if ("model".equals(actor) && !modelVisible(specification.tool())) {
            throw new IllegalArgumentException("App-only tool cannot be invoked by model");
        }
        var result = specification.callHandler().apply(
                McpTransportContext.EMPTY, new McpSchema.CallToolRequest(name, arguments));
        lastResults.put(name, result);
        callAudit.add(Map.of("type", "tool", "actor", actor, "name", name,
                "arguments", Map.copyOf(arguments), "result", result));
        return result;
    }

    public List<McpSchema.CallToolResult> ui(String turnId) {
        String previousActor = actor;
        actor = "component";
        try {
            return uiDriver.apply(turnId);
        } finally {
            actor = previousActor;
        }
    }

    public Map<String, Object> snapshot() {
        Map<String, Long> calls = new LinkedHashMap<>();
        mockingDetails(coachTools).getInvocations().forEach(invocation ->
                calls.merge(invocation.getMethod().getName(), 1L, Long::sum));
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("caseId", caseId);
        snapshot.put("evidenceLayer", EVIDENCE_LAYER);
        snapshot.put("stateVersion", currentStateVersion());
        snapshot.put("activeGoalId", state == null || state.activeGoal() == null
                ? "" : state.activeGoal().id());
        snapshot.put("facadeCalls", calls);
        snapshot.put("confirmedWriteCount", receipts.size());
        snapshot.put("masteryWrites", calls.getOrDefault("setMastery", 0L));
        snapshot.put("scopeWrites", calls.getOrDefault("setScope", 0L));
        snapshot.put("resumeWrites", calls.getOrDefault("resumeLearningPlan", 0L));
        snapshot.put("subjectSwitchWrites", calls.getOrDefault("switchLearningPlanSubject", 0L));
        snapshot.put("memoryReviewWrites", calls.getOrDefault("reviewMemoryPracticeCard", 0L));
        snapshot.put("domainState", Map.copyOf(domainState));
        return snapshot;
    }

    private static boolean modelVisible(McpSchema.Tool tool) {
        if (tool.meta() == null || !(tool.meta().get("ui") instanceof Map<?, ?> ui)
                || !(ui.get("visibility") instanceof List<?> visibility)) return true;
        return visibility.contains("model");
    }

    private static String tokenHash(String token) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(SIGNING_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception error) {
            throw new IllegalStateException("Cannot initialize synthetic fixture", error);
        }
    }
}
