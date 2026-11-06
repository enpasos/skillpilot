package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchCardResult;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.completion.CompletionProfileDefinition;
import com.skillpilot.backend.completion.CompletionScopeDefinition;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.Clock;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Exercises strict completion and tolerant ordinary projection together against real repositories.
 * The additional protected memory target belongs only to this synthetic test profile; the shipped
 * two-target pilot, its reviewed waiver and all authored curriculum files remain unchanged. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:completion-srs;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE;LOCK_TIMEOUT=30000"
})
@ActiveProfiles("test")
@Transactional
class AssessmentCompletionSrsIntegrationTest {
    private static final String PROFILE = "math-dot-product-projection";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private static final String MEMORY = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
    private static final String SOURCE = "/data/de_gymnasium_math_flashcards_seki_core.de.json";
    @Autowired LearnerService service;
    @Autowired LearnerRepository learners;
    @Autowired MasteryRepository mastery;
    @Autowired PlannedGoalRepository focus;
    @Autowired LearnerClientStateRepository cardStates;
    @Autowired ObjectMapper mapper;
    @MockitoSpyBean DeckResourceService decks;
    private Object originalApplication;
    private Clock originalRecallClock;
    private Learner learner;

    @BeforeEach void createProtectedMemoryScope() throws Exception {
        originalApplication = ReflectionTestUtils.getField(service, "completionApplicationService");
        originalRecallClock = (Clock) ReflectionTestUtils.getField(service, "verifiedRecallClock");
        Path base = Path.of("../curricula/DE/Gymnasium");
        var profile = mapper.readValue(Files.readString(base.resolve("completion-profiles/" + PROFILE + ".json")),
                CompletionProfileDefinition.class);
        var scope = new CompletionScopeDefinition(1, PROFILE, "synthetic-memory-test", profile.title(),
                List.of(PREPARATION, EXAM, MEMORY));
        ReflectionTestUtils.setField(service, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(PROFILE, profile), Map.of(PROFILE, scope), "synthetic-memory-generation")));
        learner = new Learner();
        learner.setSkillpilotId("completion-srs-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        learner.setAutoPilot(false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"),
                MATH, Map.of("selected", true, "filterId", "GK+LK"),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learner = learners.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
    }

    @AfterEach void restoreApplication() {
        ReflectionTestUtils.setField(service, "completionApplicationService", originalApplication);
        ReflectionTestUtils.setField(service, "verifiedRecallClock", originalRecallClock);
    }

    @Test void missingRequiredDeckIsUnavailableAndDoesNotRevokeStoredMastery() {
        assertDeckFailure(null);
    }

    @Test void unreadableRequiredDeckIsUnavailableAndDoesNotRevokeStoredMastery() {
        assertDeckFailure(resource("not-json"));
    }

    @Test void emptyRequiredDeckIsUnavailableAndDoesNotRevokeStoredMastery() {
        assertDeckFailure(resource("{\"cards\":[]}"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"cards\":[{\"id\":\"card-1\",\"front\":\"Question\"}]}",
            "{\"cards\":[{\"id\":\"card-1\",\"back\":\"Answer\"}]}"
    })
    void requiredCardsWithoutQuestionOrAnswerAreUnavailable(String json) {
        assertDeckFailure(resource(json));
    }

    @Test void unreadableStoredRecallProducesUnavailableWithoutMutatingItsSavedOutcome() {
        Resource valid = decks.resolveDeckResource(MEMORY, SOURCE);
        assertThat(valid).isNotNull();
        assertThat(valid.exists()).isTrue();
        mastery.saveAndFlush(new Mastery(learner, MEMORY, 1.0));
        cardStates.saveAndFlush(new LearnerClientState(learner, MEMORY, "invalid-json", Instant.now()));
        assertUnavailableWithoutResultOrFocusMutation();
        assertThat(cardStates.findByLearner_SkillpilotId(learner.getSkillpilotId())).singleElement()
                .satisfies(state -> assertThat(state.getClientState()).isEqualTo("invalid-json"));
    }

    @Test void validRequiredDeckWithoutPreviousLearnerStateMeansUnmasteredRatherThanUnavailable() {
        Resource valid = decks.resolveDeckResource(MEMORY, SOURCE);
        assertThat(valid).isNotNull();
        assertThat(valid.exists()).isTrue();
        var state = service.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("valid");
        assertThat(state.levelCompletion().complete()).isFalse();
        assertThat(state.levelCompletion().targetCount()).isEqualTo(3);
        assertThat(state.levelCompletion().masteredTargetCount()).isZero();
        assertThat(state.levelCompletion().pendingTargetCount()).isEqualTo(3);
        assertThat(service.getMastery(learner.getSkillpilotId()).getOrDefault(MEMORY, 0.0)).isZero();
        assertThat(mastery.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        assertThat(cardStates.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        assertFocusUnchanged();
    }

    @Test void laterDueDatesDoNotReopenACompletedMemoryGoalOrRevokeItsExplicitResult() {
        activateTwoCardMemoryGoal();
        Instant assessedAt = Instant.now().minusSeconds(3 * 24 * 60 * 60);
        ReflectionTestUtils.setField(service, "verifiedRecallClock", Clock.fixed(assessedAt, ZoneOffset.UTC));
        var completed = passIssuedBatch(2);
        assertThat(completed.masterySaved()).isTrue();
        assertThat(completed.next().status()).isEqualTo("complete");
        assertThat(completed.next().pendingCards()).isZero();
        assertThat(completed.next().cards()).isEmpty();
        assertThat(learners.findById(learner.getSkillpilotId()).orElseThrow().getActiveGoalId()).isNull();

        var savedCards = cardStates.findById(new LearnerClientStateId(learner.getSkillpilotId(), MEMORY)).orElseThrow();
        String cardBytes = savedCards.getClientState();
        Instant cardUpdatedAt = savedCards.getClientStateUpdatedAt();
        var savedMastery = mastery.findByLearner_SkillpilotId(learner.getSkillpilotId()).stream()
                .filter(row -> MEMORY.equals(row.getGoalKey())).findFirst().orElseThrow();
        Instant masteryUpdatedAt = savedMastery.getUpdatedAt();
        var persisted = service.getClientState(learner.getSkillpilotId(), MEMORY).srsState();
        assertThat(persisted).hasSize(2);
        long readAt = Instant.now().toEpochMilli();
        assertThat(persisted.values()).allSatisfy(value -> assertThat(value).isInstanceOfSatisfying(Map.class, card -> {
            // Establish actual later scheduling eligibility from saved service output,
            // rather than inferring due status merely from the assessment's age.
            assertThat(card.get("nextReview")).isInstanceOfSatisfying(Number.class, nextReview ->
                    assertThat(nextReview.longValue()).isGreaterThan(assessedAt.toEpochMilli()).isLessThan(readAt));
            assertThat(card.get("verifiedRecall")).isInstanceOfSatisfying(Map.class,
                    verified -> assertThat(verified).containsEntry("status", "passed"));
        }));
        ReflectionTestUtils.setField(service, "verifiedRecallClock", originalRecallClock);

        assertThat(service.getMastery(learner.getSkillpilotId())).containsEntry(MEMORY, 1.0);
        assertThat(service.getRichFrontier(learner.getSkillpilotId())).noneMatch(goal -> MEMORY.equals(goal.id()));
        var strictCompletion = service.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(strictCompletion.levelCompletion().calculationStatus()).isEqualTo("valid");
        assertThat(strictCompletion.levelCompletion().targetCount()).isEqualTo(3);
        assertThat(strictCompletion.levelCompletion().masteredTargetCount()).isEqualTo(1);
        assertThat(strictCompletion.levelCompletion().pendingTargetCount()).isEqualTo(2);
        assertThat(service.getMastery(learner.getSkillpilotId())).containsEntry(MEMORY, 1.0);
        assertThat(savedMastery.getValue()).isEqualTo(1.0);
        assertThat(savedMastery.getUpdatedAt()).isEqualTo(masteryUpdatedAt);
        assertThat(savedCards.getClientState()).isEqualTo(cardBytes);
        assertThat(savedCards.getClientStateUpdatedAt()).isEqualTo(cardUpdatedAt);
    }

    @Test void passedCardsCannotBeRetestedBySingleFalseWriteOrForgedBatchWhileOtherCardsRemainOpen() {
        activateTwoCardMemoryGoal();
        ReflectionTestUtils.setField(service, "verifiedRecallClock",
                Clock.fixed(Instant.now().minusSeconds(3 * 24 * 60 * 60), ZoneOffset.UTC));
        var first = passIssuedBatch(1);
        assertThat(first.masterySaved()).isFalse();
        assertThat(first.pendingCards()).isEqualTo(1);
        String passedCard = first.savedResults().getFirst().cardId();
        ReflectionTestUtils.setField(service, "verifiedRecallClock", originalRecallClock);
        var outstanding = service.startVerifiedRecallBatch(learner.getSkillpilotId(), "de", MEMORY, 1);
        assertThat(outstanding.status()).isEqualTo("ready");
        assertThat(outstanding.verifiedCards()).isEqualTo(1);
        assertThat(outstanding.cards()).hasSize(1).noneMatch(card -> passedCard.equals(card.cardId()));
        assertThat(learners.findById(learner.getSkillpilotId()).orElseThrow().getActiveGoalId()).isEqualTo(MEMORY);
        var row = cardStates.findById(new LearnerClientStateId(learner.getSkillpilotId(), MEMORY)).orElseThrow();
        String before = row.getClientState();
        Instant updatedAt = row.getClientStateUpdatedAt();
        long revision = learner.getCoachStateRevision();

        assertThatThrownBy(() -> service.recordVerifiedRecallResult(learner.getSkillpilotId(), "de",
                new VerifiedRecallResultRequest(MEMORY, passedCard, false)))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("already been verified");
        assertThatThrownBy(() -> service.recordVerifiedRecallResultsBatch(learner.getSkillpilotId(), "de",
                new VerifiedRecallBatchResultRequest(MEMORY, 1, List.of(passedCard), outstanding.issuedAt(),
                        List.of(new VerifiedRecallBatchCardResult(passedCard, false)))))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("incomplete, reordered, or no longer current");
        assertThat(row.getClientState()).isEqualTo(before);
        assertThat(row.getClientStateUpdatedAt()).isEqualTo(updatedAt);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(mastery.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .noneMatch(result -> MEMORY.equals(result.getGoalKey()));

        // The denial protects only the passed card. The genuine outstanding
        // server batch can still finish the goal and retain the earlier pass.
        var remainingIds = outstanding.cards().stream().map(VerifiedRecallPromptCard::cardId).toList();
        var completed = service.recordVerifiedRecallResultsBatch(learner.getSkillpilotId(), "de",
                new VerifiedRecallBatchResultRequest(MEMORY, 1, remainingIds, outstanding.issuedAt(),
                        remainingIds.stream().map(id -> new VerifiedRecallBatchCardResult(id, true)).toList()));
        assertThat(completed.masterySaved()).isTrue();
        assertThat(completed.verifiedCards()).isEqualTo(2);
        assertThat(completed.pendingCards()).isZero();
        assertThat(service.getClientState(learner.getSkillpilotId(), MEMORY).srsState().get(passedCard))
                .isEqualTo(mapper.convertValue(readCard(before, passedCard), Map.class));
        assertThat(service.getMastery(learner.getSkillpilotId())).containsEntry(MEMORY, 1.0);
    }

    private Object readCard(String json, String cardId) {
        try { return mapper.readValue(json, Map.class).get(cardId); }
        catch (Exception exception) { throw new AssertionError("Invalid server-produced card fixture", exception); }
    }

    private void activateTwoCardMemoryGoal() {
        doReturn(resource("{\"cards\":[{\"id\":\"card-1\",\"front\":\"2+3?\",\"back\":\"5\",\"tags\":[\"GK\",\"LK\",\"SekI\"]},"
                + "{\"id\":\"card-2\",\"front\":\"3+4?\",\"back\":\"7\",\"tags\":[\"GK\",\"LK\",\"SekI\"]}]}"))
                .when(decks).resolveDeckResource(eq(MEMORY), anyString());
        focus.deleteAll(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()));
        focus.flush();
        focus.saveAndFlush(new PlannedGoal(learner, MEMORY));
        mastery.saveAndFlush(new Mastery(learner, "65365dce-f33f-49d8-9516-42f75883aa86", 1.0));
        learner.setActiveGoalId(MEMORY);
        learner.setLearningState(LearningState.TEACHING);
        learners.saveAndFlush(learner);
    }

    private VerifiedRecallBatchResultResponse passIssuedBatch(int batchSize) {
        var prompt = service.startVerifiedRecallBatch(learner.getSkillpilotId(), "de", MEMORY, batchSize);
        assertThat(prompt.status()).isEqualTo("ready");
        var ids = prompt.cards().stream().map(VerifiedRecallPromptCard::cardId).toList();
        return service.recordVerifiedRecallResultsBatch(learner.getSkillpilotId(), "de",
                new VerifiedRecallBatchResultRequest(MEMORY, batchSize, ids, prompt.issuedAt(),
                        ids.stream().map(id -> new VerifiedRecallBatchCardResult(id, true)).toList()));
    }

    private void assertDeckFailure(Resource broken) {
        doReturn(broken).when(decks).resolveDeckResource(eq(MEMORY), anyString());
        mastery.saveAndFlush(new Mastery(learner, MEMORY, 1.0));
        assertUnavailableWithoutResultOrFocusMutation();
        assertThat(cardStates.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    private void assertUnavailableWithoutResultOrFocusMutation() {
        var state = service.chooseLevelCompletion(learner.getSkillpilotId(), new LevelCompletionActionRequest(
                "selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("unavailable");
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().pendingTargetCount()).isZero();
        assertThat(state.levelCompletion().assessments()).isEmpty();
        assertThat(state.levelCompletion().actions()).allSatisfy(action ->
                assertThat(action.action()).isEqualTo("leaveProfile"));
        assertThat(state.activeGoal()).isNull();
        assertThat(service.getMastery(learner.getSkillpilotId())).containsEntry(MEMORY, 1.0);
        assertThat(mastery.findByLearner_SkillpilotId(learner.getSkillpilotId())).singleElement()
                .satisfies(saved -> {
                    assertThat(saved.getGoalKey()).isEqualTo(MEMORY);
                    assertThat(saved.getValue()).isEqualTo(1.0);
                });
        assertFocusUnchanged();
    }

    private void assertFocusUnchanged() {
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }

    private static Resource resource(String json) {
        return new ByteArrayResource(json.getBytes(StandardCharsets.UTF_8), "synthetic completion SRS failure fixture");
    }
}
