package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerCard;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchSavedResult;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.srs.SrsCardStepFacts;
import com.skillpilot.backend.service.srs.UnitCheckStart;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
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

/**
 * The card step of issue #85 in the Claude lane: the server-owned block in every full coach
 * context and the unit card check that start_skillpilot_verified_recall begins outside an
 * active memory goal. Counts and published actions only; no card text, no learner identifier.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1CardStepContractTest {

    private static final long STATE_VERSION = 30L;
    private static final String DECK = "deck-goal";
    private static final String UNIT = "physics-e1-motion";
    private static final String ACTIVE = "ordinary-goal";
    private static final List<String> CARDS = List.of("card-1", "card-2");

    @Autowired private ClaudeV1McpContractAdapter contractAdapter;
    @Autowired private ClaudeV1CoachContextProjector projector;
    @Autowired private ClaudeV1CapabilityService capabilityService;
    @Autowired private LearnerRepository learnerRepository;
    @Autowired private ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired private ObjectMapper objectMapper;
    @MockitoBean private CoachToolFacade coachToolFacade;

    private String learnerId;
    private String connectionId;
    private Instant issuedAt;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository, sessionRepository, STATE_VERSION);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
        issuedAt = Instant.now().minusSeconds(2);
        when(coachToolFacade.getLearnerState(learnerId)).thenReturn(state(goal(ACTIVE, "tutor")));
        when(coachToolFacade.getPersonalizationPlan(learnerId)).thenReturn(PersonalizationPlan.complete(List.of()));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                connectionId, "unused", List.of(
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void withAutopilotTheCoachOpensTheDueCardsDirectlyOncePerOfferKey() {
        Map<String, Object> step = projector.projectCardStep(
                new SrsCardStepFacts(UNIT, List.of(DECK), 5, 9, false, DECK, DECK, true, "cs-1234"), STATE_VERSION);

        assertThat(step).containsEntry("dueCards", 5).containsEntry("boxCards", 9)
                .containsEntry("proposeCheck", false).containsEntry("offerKey", "cs-1234");
        assertThat(step.get("practiceAction")).isEqualTo(Map.of("tool", ClaudeV1Contract.TOOL_START_MEMORY_PRACTICE,
                "arguments", Map.of("goalId", DECK, "practiceScopeId", UNIT, "expectedStateVersion", STATE_VERSION)));
        assertThat(step.get("checkAction")).isEqualTo(Map.of("tool", ClaudeV1Contract.TOOL_START_VERIFIED_RECALL,
                "arguments", Map.of()));
        assertThat(step.get("instruction").toString())
                .contains("at most once for each offerKey", "normal learning start", "a resume",
                        "continue after a completed goal", "call practiceAction first",
                        "before the next goal's content or image", "copying its arguments unchanged",
                        "Status-only questions, pauses, explicit subject or goal requests",
                        "feedback or questions still owed", "completion route", "Never show, answer or rate card content",
                        "explicitly asks to check this unit's flashcards", "do not propose the check yourself yet")
                .doesNotContain("first option");
    }

    @Test
    void withoutAutopilotTheCardsAreTheFirstOptionAndTheLearnerChooses() {
        Map<String, Object> step = projector.projectCardStep(
                new SrsCardStepFacts(UNIT, List.of(DECK), 3, 3, true, DECK, DECK, false, "cs-5678"), STATE_VERSION);

        assertThat(step).containsEntry("proposeCheck", true).containsKey("practiceAction").containsKey("checkAction");
        assertThat(step.get("instruction").toString())
                .contains("offer the flashcards as the first option", "only after the learner chooses the cards",
                        "otherwise follow the learner's choice", "propose the unit card check",
                        "only after the learner agrees", "at least two days")
                .doesNotContain("call practiceAction first");
    }

    @Test
    void aReadyUnitWithoutDueCardsProposesOnlyTheCheck() {
        Map<String, Object> step = projector.projectCardStep(
                new SrsCardStepFacts(UNIT, List.of(DECK), 0, 4, true, null, DECK, true, "cs-9"), STATE_VERSION);

        assertThat(step).doesNotContainKey("practiceAction").containsKey("checkAction")
                .containsEntry("offerKey", "cs-9").containsEntry("proposeCheck", true);
        assertThat(step.get("instruction").toString()).contains("first propose the unit card check",
                "Call checkAction only after the learner agrees");
    }

    @Test
    void withoutDueCardsTheBlockSaysSoAndTheCoachProceeds() {
        for (SrsCardStepFacts facts : List.of(SrsCardStepFacts.none(),
                new SrsCardStepFacts(UNIT, List.of(DECK), 0, 2, false, null, null, true, null))) {
            Map<String, Object> step = projector.projectCardStep(facts, STATE_VERSION);
            assertThat(step).containsEntry("dueCards", 0).containsEntry("proposeCheck", false)
                    .doesNotContainKeys("offerKey", "practiceAction", "checkAction");
            assertThat(step.get("instruction").toString())
                    .isEqualTo("No flashcards are due in the current learning context: continue without a card step.");
        }
        assertThat(projector.projectCardStep(null, STATE_VERSION)).doesNotContainKey("practiceAction");
    }

    @Test
    void everyFullCoachContextCarriesTheCardStepWithoutCardTextOrLearnerIdentity() {
        when(coachToolFacade.getCardStepFacts(learnerId, "de"))
                .thenReturn(new SrsCardStepFacts(UNIT, List.of(DECK), 2, 2, false, DECK, DECK, false, "cs-ab"));

        Map<String, Object> context = projector.projectContext(learnerId, STATE_VERSION, "de");

        @SuppressWarnings("unchecked")
        Map<String, Object> step = (Map<String, Object>) context.get("cardStep");
        assertThat(step).containsEntry("dueCards", 2).containsKey("practiceAction");
        assertThat(context.toString()).doesNotContain(learnerId, "card-1");
    }

    @Test
    void outsideAnActiveMemoryGoalRecallStartsTheServerChosenUnitCheckBoundToItsUnit() throws Exception {
        when(coachToolFacade.startVerifiedRecallUnitCheck(learnerId, "de"))
                .thenReturn(new UnitCheckStart(DECK, UNIT, prompt("ready", CARDS, null)));

        McpSchema.CallToolResult started = call(ClaudeV1Contract.TOOL_START_VERIFIED_RECALL, Map.of("language", "de"));

        assertThat(started.isError()).isFalse();
        Map<String, Object> batch = payload(started);
        assertThat(batch).containsEntry("status", "ready").doesNotContainKeys("goalId", "practiceScopeId");
        assertThat(batch.toString()).doesNotContain(learnerId);
        var claim = capabilityService.verifyRecallBatchCapability(
                (String) batch.get("batchCapability"), connectionId, null, STATE_VERSION);
        assertThat(claim.goalId()).isEqualTo(DECK);
        assertThat(claim.practiceScopeId()).isEqualTo(UNIT);
        assertThat(claim.cardIds()).isEqualTo(CARDS);
        verify(coachToolFacade, never()).startVerifiedRecallBatch(any(), any(), any());

        // The answers need no active memory goal: the capability carries the unit.
        when(coachToolFacade.getVerifiedRecallAnswersBatch(eq(learnerId), eq("de"),
                any(VerifiedRecallBatchAnswerRequest.class), eq(UNIT)))
                .thenReturn(new VerifiedRecallBatchAnswerResponse("untrusted", DECK, List.of(
                        new VerifiedRecallBatchAnswerCard("card-1", "Q1", "A1", null),
                        new VerifiedRecallBatchAnswerCard("card-2", "Q2", "A2", null))));
        Map<String, Object> answers = payload(call(ClaudeV1Contract.TOOL_GET_VERIFIED_RECALL_ANSWERS,
                Map.of("batchCapability", batch.get("batchCapability"), "language", "de")));
        String grading = (String) answers.get("gradingCapability");
        assertThat(capabilityService.verifyRecallGradingCapability(grading, connectionId, DECK, STATE_VERSION)
                .practiceScopeId()).isEqualTo(UNIT);

        // The result write goes to the unit check and returns to the current goal.
        when(coachToolFacade.recordVerifiedRecallResultsBatch(eq(learnerId), eq("de"),
                any(VerifiedRecallBatchResultRequest.class), eq(UNIT))).thenAnswer(invocation -> {
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    return new VerifiedRecallBatchResultResponse(List.of(
                            new VerifiedRecallBatchSavedResult("card-1", true),
                            new VerifiedRecallBatchSavedResult("card-2", true)), 2, 5, false, null,
                            prompt("waiting", List.of(), null), state(goal(ACTIVE, "tutor")));
                });
        McpSchema.CallToolResult recorded = call(ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS, Map.of(
                "gradingCapability", grading,
                "results", List.of(Map.of("cardId", "card-1", "passed", true), Map.of("cardId", "card-2", "passed", true)),
                "expectedStateVersion", STATE_VERSION,
                "clientRequestId", UUID.randomUUID().toString(),
                "language", "de"));
        assertThat(recorded.isError()).isFalse();
        Map<String, Object> receipt = payload(recorded);
        assertThat(receipt).containsEntry("masterySaved", false).containsEntry("stateVersion", 31);
        assertThat(receipt.get("presentationInstruction").toString())
                .contains("unit card check, not the completion of a learning goal", "return to the learner's current goal");
        @SuppressWarnings("unchecked")
        Map<String, Object> context = (Map<String, Object>) receipt.get("context");
        assertThat(context).containsEntry("stateVersion", 31);
        assertThat(receipt.toString()).doesNotContain(learnerId);
        assertThat(receipt.get("next").toString()).contains("waiting", "Es gibt keinen Termin",
                "kündige keine Fortsetzung für morgen an", "Das Lernkartenziel bleibt offen");
        verify(coachToolFacade, never()).recordVerifiedRecallResultsBatch(any(), any(),
                any(VerifiedRecallBatchResultRequest.class));
        verify(coachToolFacade, never()).setMastery(any(), any());
        verify(coachToolFacade, never()).setActiveGoal(any(), any());
        verify(coachToolFacade, never()).setPublishedFrontierGoal(any(), any());
    }

    @Test
    void withoutAPublishedUnitCheckTheStartIsAConflictAndAMemoryGoalBatchNeedsItsGoal() throws Exception {
        when(coachToolFacade.startVerifiedRecallUnitCheck(learnerId, "de")).thenThrow(
                new ResponseStatusException(HttpStatus.CONFLICT, "No unit card check is available"));

        McpSchema.CallToolResult refused = call(ClaudeV1Contract.TOOL_START_VERIFIED_RECALL, Map.of("language", "de"));

        assertThat(refused.isError()).isTrue();
        assertThat(payload(refused).toString()).contains("cardStep");
        // A batch of a memory goal's own check is no unit check: it needs that goal to stay active.
        String memoryBatch = capabilityService.mintRecallBatchCapability(
                connectionId, DECK, CARDS, 10, STATE_VERSION, issuedAt);
        McpSchema.CallToolResult answers = call(ClaudeV1Contract.TOOL_GET_VERIFIED_RECALL_ANSWERS,
                Map.of("batchCapability", memoryBatch, "language", "de"));
        assertThat(answers.isError()).isTrue();
        assertThat(payload(answers).toString()).contains("no longer the recall goal");
        verify(coachToolFacade, never()).getVerifiedRecallAnswersBatch(any(), any(), any());
        verify(coachToolFacade, never()).getVerifiedRecallAnswersBatch(any(), any(), any(), any());
    }

    @Test
    void waitingWordingIsTruthfulForASameDayBlockAndForVerifiedReleasedCards() {
        Map<String, Object> sameDay = contractAdapter.projectRecallPrompt(connectionId, learnerId, DECK,
                STATE_VERSION, "de", prompt("waiting", List.of(), issuedAt.plusSeconds(3600).toString()));
        assertThat(sameDay.get("instruction").toString()).contains("heute geprüfte Karten",
                "veröffentlichten nächsten Zeitpunkt", "Das Lernkartenziel bleibt offen");
        Map<String, Object> released = contractAdapter.projectRecallPrompt(connectionId, learnerId, DECK,
                STATE_VERSION, "en", prompt("waiting", List.of(), null));
        assertThat(released.get("instruction").toString())
                .contains("Every currently released card of this check is verified",
                        "do not announce a continuation tomorrow", "The memory goal stays open",
                        "do not report it as completed")
                .doesNotContain("published next time");
        Map<String, Object> releasedDe = contractAdapter.projectRecallPrompt(connectionId, learnerId, DECK,
                STATE_VERSION, "de", prompt("waiting", List.of(), null));
        assertThat(releasedDe.get("instruction").toString())
                .contains("kündige keine Fortsetzung für morgen an", "melde es nicht als abgeschlossen");
    }

    private VerifiedRecallPromptResponse prompt(String status, List<String> cards, String nextEligibleAt) {
        List<VerifiedRecallPromptCard> promptCards = cards.stream()
                .map(id -> new VerifiedRecallPromptCard(id, "Prompt " + id, null)).toList();
        int pending = 7;
        int eligible = promptCards.size();
        return new VerifiedRecallPromptResponse(status, "untrusted", learnerId, DECK, "Lernkarten E-Phase", 9, 2,
                pending, eligible, pending - eligible, nextEligibleAt, promptCards.size(), promptCards,
                promptCards.isEmpty() ? null : promptCards.getFirst().cardId(),
                promptCards.isEmpty() ? null : promptCards.getFirst().prompt(), null, 10, issuedAt);
    }

    private McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        Map<String, Object> sessionArguments = new LinkedHashMap<>(arguments);
        sessionArguments.put("learningSessionId", connectionId);
        return contractAdapter.toolSpecifications().stream()
                .filter(specification -> toolName.equals(specification.tool().name()))
                .findFirst().orElseThrow().callHandler()
                .apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(toolName, sessionArguments));
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) throws Exception {
        return objectMapper.readValue(((McpSchema.TextContent) result.content().getFirst()).text(),
                new TypeReference<>() {});
    }

    private UnifiedLearnerStateResponse state(FrontierGoal goal) {
        return new UnifiedLearnerStateResponse(null, null, List.of(goal), null, List.of(), List.of(), Set.of(),
                "TEACHING", goal, new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(goal), List.of(), goal));
    }

    private FrontierGoal goal(String id, String nodeKind) {
        return new FrontierGoal(id, id, "Lernzielbeschreibung", "atomic", nodeKind, "content", null,
                List.of(), List.of(), null, null, null, null, false);
    }
}
