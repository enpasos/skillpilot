package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.completion.CompletionProfileDefinition;
import com.skillpilot.backend.completion.CompletionScopeDefinition;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
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
    private Learner learner;

    @BeforeEach void createProtectedMemoryScope() throws Exception {
        originalApplication = ReflectionTestUtils.getField(service, "completionApplicationService");
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
