package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.ui.LearnerUiController;
import java.nio.file.Path;
import java.nio.file.Files;
import org.junit.jupiter.api.io.TempDir;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.server.ResponseStatusException;
import com.skillpilot.backend.service.srs.SrsStateUnavailableException;

class StoredCompositionFocusTest {
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String OVERVIEW = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String LEARNER = "stored-composition-focus";
    private static final String ACTIVE = "61686d85-0301-550e-bab9-bd9411c3e7ce";
    private static final String MEMORY = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static SkillLandscape landscape;
    private static Map<String, LearningGoal> goals;
    private static LandscapeProperties properties;
    private static SkillLandscape historicalBeforeMathematics;
    private static LandscapeService historicalBeforeCatalog;
    private static LandscapeService historicalAfterCatalog;
    private static GoalMappingService historicalBeforeMappings;
    private static GoalMappingService historicalAfterMappings;
    private static LandscapeProperties historicalBeforeProperties;
    private static LandscapeProperties historicalAfterProperties;
    private static CompositionViewService historicalBeforeViews;
    private static CompositionViewService historicalAfterViews;
    private static SkillLandscape compiledShMathematics;
    private static com.fasterxml.jackson.databind.JsonNode shFixtureBasis;

    @BeforeAll static void loadActualHessianMathematics(@TempDir Path historicalDirectory) throws Exception {
        Path curricula = Path.of("../curricula").toAbsolutePath().normalize();
        properties = new LandscapeProperties();
        properties.setDirectory(curricula.toString());
        landscape = MAPPER.readValue(curricula.resolve(
                "DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile(), SkillLandscape.class);
        goals = landscape.getGoals().stream().collect(Collectors.toMap(LearningGoal::getId, goal -> goal));
        try (var input = StoredCompositionFocusTest.class.getResourceAsStream(
                "/composition-focus-reparenting/sh-runtime-fixture-basis.json")) {
            assertThat(input).isNotNull();
            shFixtureBasis = MAPPER.readTree(input);
        }
        String beforeText = historicalText("math-v30.before.de.json.gz");
        String overviewText = historicalText("overview-v30.de.json.gz");
        historicalBeforeMathematics = MAPPER.readValue(beforeText, SkillLandscape.class);
        assertThat(sha256(beforeText)).isEqualTo(shFixtureBasis.path("canonicalBefore").path("sha256").asText());
        String beforeGoal = shFixtureBasis.path("beforeGoalJson").asText();
        String afterGoal = shFixtureBasis.path("afterGoalJson").asText();
        assertThat(beforeText.indexOf(beforeGoal)).isGreaterThanOrEqualTo(0).isEqualTo(beforeText.lastIndexOf(beforeGoal));
        String compiledText = beforeText.replace(beforeGoal, afterGoal);
        assertThat(sha256(compiledText)).isEqualTo(shFixtureBasis.path("canonicalAfter").path("sha256").asText());
        var oldGoal = (com.fasterxml.jackson.databind.node.ObjectNode) MAPPER.readTree(beforeGoal);
        var newGoal = (com.fasterxml.jackson.databind.node.ObjectNode) MAPPER.readTree(afterGoal);
        assertThat(oldGoal.path("applicability").path("jurisdiction")).hasSize(15);
        assertThat(newGoal.path("applicability").path("jurisdiction")).hasSize(16);
        var oldContract = oldGoal.deepCopy(); oldContract.remove("applicability");
        var newContract = newGoal.deepCopy(); newContract.remove("applicability");
        assertThat(newContract).isEqualTo(oldContract);
        compiledShMathematics = MAPPER.readValue(compiledText, SkillLandscape.class);
        // Only the concrete SH reparenting cases use this immutable historical
        // generation. Existing generic/Recall fixtures keep live Math/decks.
        historicalBeforeProperties = materializeHistoricalShSnapshot(
                historicalDirectory.resolve("before"), beforeText, overviewText, false);
        historicalAfterProperties = materializeHistoricalShSnapshot(
                historicalDirectory.resolve("after"), compiledText, overviewText, true);
        historicalBeforeMappings = new GoalMappingService(historicalBeforeProperties, MAPPER);
        historicalAfterMappings = new GoalMappingService(historicalAfterProperties, MAPPER);
        historicalBeforeMappings.pinRuntimeGeneration();
        historicalAfterMappings.pinRuntimeGeneration();
        historicalBeforeCatalog = new LandscapeService(historicalBeforeProperties, MAPPER, historicalBeforeMappings);
        historicalAfterCatalog = new LandscapeService(historicalAfterProperties, MAPPER, historicalAfterMappings);
        historicalBeforeCatalog.pinRuntimeGeneration();
        historicalAfterCatalog.pinRuntimeGeneration();
        for (var id : shFixtureBasis.path("historicalFlowSourceClosure").path("exactOverviewSourceLandscapeIds")) {
            assertThat(historicalBeforeCatalog.getById(id.asText()).getLandscapeId()).isEqualTo(id.asText());
            assertThat(historicalAfterCatalog.getById(id.asText()).getLandscapeId()).isEqualTo(id.asText());
        }
        assertThat(historicalBeforeCatalog.getAll()).hasSize(21);
        assertThat(historicalAfterCatalog.getAll()).hasSize(21);
        historicalBeforeViews = new CompositionViewService(historicalBeforeProperties, MAPPER, historicalBeforeCatalog);
        historicalAfterViews = new CompositionViewService(historicalAfterProperties, MAPPER, historicalAfterCatalog);
    }

    @ParameterizedTest
    @ValueSource(strings = {"q21-common-functions", "q24-gk-fixed-vectors",
            "q24-gk-transition-processes", "q25-gk-selected-matrix-mappings"})
    void removedStoredWrapperRequiresNewChoiceAcrossPublicReadsWithoutChangingStoredFocus(String wrapper) throws Exception {
        var f = fixture();
        String stale = f.stale(wrapper);
        f.focus().add(stale);
        String config = f.learner().getPersonalCurriculum();
        for (int read = 0; read < 2; read++) {
            assertThat(f.service().getCoachPersonalizationPlan(LEARNER).required()).isFalse();
            assertThat(f.service().getPlannedGoals(LEARNER)).isEmpty();
            assertThat(f.ui().getFrontier(LEARNER).goals()).isEmpty();
            assertThat(f.service().getRichFrontier(LEARNER)).isNotEmpty()
                    .allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
            var state = f.service().getLearnerState(LEARNER);
            assertThat(state.activeGoal()).isNull();
            assertThat(state.goals().planned()).isEmpty();
            assertThat(state.nextAllowedActions()).contains("setScope").doesNotContain("setActiveGoal");
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(state.stateMachine().goalOptions()).isNotEmpty()
                    .allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
            assertThat(state.frontier()).isNotEmpty()
                    .allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
            var coach = f.service().getCoachLearnerState(LEARNER);
            assertThat(coach.goals().planned()).isEmpty();
            assertThat(coach.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(coach.frontier()).isNotEmpty()
                    .allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
            assertThat(f.focus()).containsExactly(stale);
            assertThat(f.learner().getPersonalCurriculum()).isEqualTo(config);
        }
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).save(any());
        verify(f.planned(), never()).saveAll(any());
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void mixedValidAndRemovedRootsKeepOnlyTheChosenValidScopeWithoutReadMutation() throws Exception {
        var f = fixture();
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, ACTIVE));
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.service().getFrontier(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.service().getLearnerState(LEARNER).goals().planned())
                .extracting(goal -> goal.id()).containsExactly(ACTIVE);
        assertThat(f.focus()).containsExactly(stale, ACTIVE);
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).save(any());
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void chosenActiveAtomCanFinishBeforeAFreshFocusChoiceWithoutAutopilotWidening() throws Exception {
        var f = fixture();
        String stale = f.stale("q21-common-functions");
        f.focus().add(stale);
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        f.learner().setAutoPilot(true);
        var teaching = f.service().getLearnerState(LEARNER);
        assertThat(teaching.activeGoal().id()).isEqualTo(ACTIVE);
        assertThat(teaching.nextAllowedActions()).contains("setMastery");
        assertThat(f.service().getFrontier(LEARNER)).isEmpty();
        verify(f.masteryRepository(), never()).save(any());

        var result = f.service().setMastery(LEARNER, new MasteryUpdateRequest(Map.of(ACTIVE, 1.0), ACTIVE));
        assertThat(result.activeGoal()).isNull();
        assertThat(result.frontier()).isNotEmpty()
                .allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
        assertThat(f.mastery()).containsExactly(Map.entry(ACTIVE, 1.0));
        assertThat(f.focus()).containsExactly(stale);
        assertThat(f.service().getPlannedGoals(LEARNER)).isEmpty();
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).save(any());
    }

    @Test void firstTimeLearnerStillGetsTheExistingDefaultAndCanExplicitlyChooseAnotherFocus() throws Exception {
        var f = fixture();
        assertThat(f.service().getPlannedGoals(LEARNER)).isNotEmpty();
        f.service().getLearnerState(LEARNER);
        assertThat(f.focus()).isNotEmpty();
        assertThat(f.service().setPlannedGoals(LEARNER, Set.of(ACTIVE))).containsExactly(ACTIVE);
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.service().getFrontier(LEARNER)).containsExactly(ACTIVE);
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void explicitFocusChoiceReplacesTheRetainedRemovedWrapper() throws Exception {
        var f = fixture();
        f.focus().add(f.stale("q21-common-functions"));
        assertThat(f.service().getCoachLearnerState(LEARNER).stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(f.service().setPlannedGoals(LEARNER, Set.of(ACTIVE))).containsExactly(ACTIVE);
        assertThat(f.focus()).containsExactly(ACTIVE);
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.ui().getFrontier(LEARNER).goals()).containsExactly(ACTIVE);
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void alreadyChosenMemoryContinuesThroughStrictRecallWithoutFreeMasteryOrMissingDeckFallback() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().add(stale);
        f.learner().setActiveGoalId(MEMORY);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
        assertThat(f.service().getCoachLearnerState(LEARNER).stateMachine().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThatThrownBy(() -> f.service().setMastery(LEARNER,
                new MasteryUpdateRequest(Map.of(MEMORY, 1.0), MEMORY)))
                .isInstanceOf(ResponseStatusException.class);
        var prompt = f.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1);
        assertThat(prompt.cards()).hasSize(1);
        var result = f.service().recordVerifiedRecallResult(LEARNER, "de",
                new VerifiedRecallResultRequest(MEMORY, prompt.cards().getFirst().cardId(), true));
        assertThat(result.verifiedCards()).isEqualTo(1);
        assertThat(result.pendingCards()).isPositive();
        assertThat(result.masterySaved()).isFalse();
        verify(f.masteryRepository(), never()).save(any());
        assertThat(f.focus()).containsExactly(stale);
        assertThatThrownBy(() -> f.service().startVerifiedRecallBatch(LEARNER, "de", ACTIVE, 1))
                .isInstanceOf(ResponseStatusException.class);

        f.mastery().put(MEMORY, 1.0);
        doReturn(null).when(f.decks()).resolveDeckResource(org.mockito.ArgumentMatchers.eq(MEMORY), anyString());
        assertThatThrownBy(() -> f.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1))
                .isInstanceOfAny(SrsStateUnavailableException.class, ResponseStatusException.class);
        assertThat(f.mastery()).containsExactly(Map.entry(MEMORY, 1.0));
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void mixedStoredFocusKeepsChosenOrdinaryWorkWithoutChangingTheValidSubset() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, MEMORY));
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        f.learner().setAutoPilot(true);
        String before = MAPPER.writeValueAsString(f.learner());
        for (int read = 0; read < 2; read++) {
            var state = f.service().getLearnerState(LEARNER);
            var coach = f.service().getCoachLearnerState(LEARNER);
            assertThat(state.activeGoal().id()).isEqualTo(ACTIVE);
            assertThat(coach.activeGoal().id()).isEqualTo(ACTIVE);
            assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
            assertThat(state.nextAllowedActions()).contains("setMastery");
            assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(MEMORY);
            assertThat(f.service().getFrontier(LEARNER)).containsExactly(MEMORY);
            assertThat(state.goals().planned()).extracting(goal -> goal.id()).containsExactly(MEMORY);
            assertThat(f.focus()).containsExactly(stale, MEMORY);
            assertThat(MAPPER.writeValueAsString(f.learner())).isEqualTo(before);
        }
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).save(any());
        verify(f.planned(), never()).saveAll(any());
    }

    @Test void mixedStoredFocusOrdinaryCompletionCannotAutopilotOutsideTheValidSubset() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, MEMORY));
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        f.learner().setAutoPilot(true);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(ACTIVE);
        var result = f.service().setMastery(LEARNER,
                new MasteryUpdateRequest(Map.of(ACTIVE, 1.0), ACTIVE));
        assertThat(f.mastery()).containsExactly(Map.entry(ACTIVE, 1.0));
        verify(f.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
        if (result.activeGoal() != null) {
            assertThat(result.activeGoal().id()).isEqualTo(MEMORY);
        }
        assertThat(f.service().getFrontier(LEARNER)).containsExactly(MEMORY);
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(MEMORY);
        assertThat(f.focus()).containsExactly(stale, MEMORY);
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).saveAll(any());
    }

    @Test void mixedStoredFocusMemoryUsesOnlyStrictRecallAndNoGeneralMasteryWrite() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, ACTIVE));
        f.learner().setActiveGoalId(MEMORY);
        f.learner().setLearningState(LearningState.TEACHING);
        f.learner().setAutoPilot(true);
        String before = MAPPER.writeValueAsString(f.learner());
        for (int read = 0; read < 2; read++) {
            assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
            assertThat(f.service().getCoachLearnerState(LEARNER).stateMachine().requiredAction())
                    .isEqualTo("chooseMemoryMode");
            assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
            assertThat(f.service().getFrontier(LEARNER)).containsExactly(ACTIVE);
            assertThat(f.focus()).containsExactly(stale, ACTIVE);
            assertThat(MAPPER.writeValueAsString(f.learner())).isEqualTo(before);
        }
        assertThatThrownBy(() -> f.service().setMastery(LEARNER,
                new MasteryUpdateRequest(Map.of(MEMORY, 1.0), MEMORY)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
        var prompt = f.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1);
        assertThat(prompt.cards()).hasSize(1);
        var partial = f.service().recordVerifiedRecallResult(LEARNER, "de",
                new VerifiedRecallResultRequest(MEMORY, prompt.cards().getFirst().cardId(), true));
        assertThat(partial.masterySaved()).isFalse();
        assertThat(partial.pendingCards()).isPositive();
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.focus()).containsExactly(stale, ACTIVE);
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).saveAll(any());
    }

    @Test void mixedStoredFocusMemoryCanFinishItsRealDeckWithoutAnOutsideSuccessor() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, ACTIVE));
        f.learner().setActiveGoalId(MEMORY);
        f.learner().setLearningState(LearningState.TEACHING);
        f.learner().setAutoPilot(true);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
        var prompt = f.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1);
        boolean completed = false;
        int assessedCards = 0;
        while (!prompt.cards().isEmpty() && assessedCards < 200) {
            var result = f.service().recordVerifiedRecallResult(LEARNER, "de",
                    new VerifiedRecallResultRequest(MEMORY, prompt.cards().getFirst().cardId(), true));
            assessedCards++;
            if (result.masterySaved()) {
                assertThat(result.pendingCards()).isZero();
                completed = true;
                break;
            }
            assertThat(f.mastery()).isEmpty();
            prompt = result.next();
        }
        assertThat(completed).as("real deck completed only through individually verified recall").isTrue();
        assertThat(assessedCards).isGreaterThan(1);
        assertThat(f.mastery()).containsExactly(Map.entry(MEMORY, 1.0));
        verify(f.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
        var state = f.service().getLearnerState(LEARNER);
        if (state.activeGoal() != null) {
            assertThat(state.activeGoal().id()).isEqualTo(ACTIVE);
        }
        assertThat(f.service().getPlannedGoals(LEARNER)).containsExactly(ACTIVE);
        assertThat(f.focus()).containsExactly(stale, ACTIVE);
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).saveAll(any());
    }

    @Test void anExplicitFocusWriteStillRevalidatesAndClearsAnOutsideActiveGoal() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, MEMORY));
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(ACTIVE);
        assertThat(f.service().setPlannedGoals(LEARNER, Set.of(MEMORY))).containsExactly(MEMORY);
        assertThat(f.learner().getActiveGoalId()).isNull();
        assertThat(f.focus()).containsExactly(MEMORY);
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void rewritingTheSameValidFocusExplicitlyClearsAnOutsideCursor() throws Exception {
        var f = fixture(true);
        f.focus().add(MEMORY);
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(ACTIVE);
        assertThat(f.service().setPlannedGoals(LEARNER, Set.of(MEMORY))).containsExactly(MEMORY);
        assertThat(f.learner().getActiveGoalId()).isNull();
        assertThat(f.service().getLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(f.service().getCoachLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(f.focus()).containsExactly(MEMORY);
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void mixedStoredFocusCannotContinueMissingTargetsOrUnavailableRecall() throws Exception {
        for (boolean missingTarget : List.of(false, true)) {
            var f = fixture();
            String stale = f.stale("q21-common-functions");
            f.focus().addAll(List.of(stale, ACTIVE));
            f.learner().setActiveGoalId(missingTarget ? "missing-target" : MEMORY);
            f.learner().setLearningState(LearningState.TEACHING);
            assertThat(f.service().getLearnerState(LEARNER).activeGoal()).isNull();
            assertThat(f.learner().getActiveGoalId()).isNull();
            assertThat(f.focus()).containsExactly(stale, ACTIVE);
            assertThat(f.mastery()).isEmpty();
            verify(f.masteryRepository(), never()).save(any());
            verify(f.planned(), never()).deleteAll(any());
            verify(f.planned(), never()).saveAll(any());
        }
    }

    @Test void mixedStoredFocusCannotPromoteAPrerequisiteOnlyActivePointer() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, ACTIVE));
        Object projection = org.springframework.test.util.ReflectionTestUtils.invokeMethod(
                f.service(), "getGoalProjection", MATH, f.learner().getPersonalCurriculum());
        Set<String> prerequisiteOnly = org.springframework.test.util.ReflectionTestUtils.invokeMethod(
                projection, "prerequisiteOnlyGoalIds");
        Set<String> targets = org.springframework.test.util.ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
        String support = prerequisiteOnly.stream().filter(goals::containsKey).filter(id -> !targets.contains(id))
                .filter(id -> goals.get(id).getContains() == null || goals.get(id).getContains().isEmpty())
                .findFirst().orElseThrow();
        f.learner().setActiveGoalId(support);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(f.learner().getActiveGoalId()).isNull();
        assertThat(f.focus()).containsExactly(stale, ACTIVE);
        assertThat(f.mastery()).isEmpty();
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void mixedStoredFocusRecallRepositoryFailureStillRefusesWithoutMasteryOrFocusWrite() throws Exception {
        var f = fixture(true);
        String stale = f.stale("q21-common-functions");
        f.focus().addAll(List.of(stale, ACTIVE));
        f.learner().setActiveGoalId(MEMORY);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
        LearnerClientStateRepository cards = (LearnerClientStateRepository)
                org.springframework.test.util.ReflectionTestUtils.getField(f.service(), "learnerClientStateRepository");
        IllegalStateException repositoryFailure = new IllegalStateException("real-fixture SRS repository outage");
        when(cards.findById(any())).thenThrow(repositoryFailure);
        assertThatThrownBy(() -> f.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1))
                .isSameAs(repositoryFailure);
        assertThat(f.mastery()).isEmpty();
        assertThat(f.learner().getActiveGoalId()).isEqualTo(MEMORY);
        assertThat(f.focus()).containsExactly(stale, ACTIVE);
        verify(f.masteryRepository(), never()).save(any());
        verify(f.planned(), never()).deleteAll(any());
        verify(f.planned(), never()).saveAll(any());
    }


    private static final String SH_CONTAINER = "reviewed-stage-additions-de-sh";
    private static final String AREA = "491e0858-e977-516e-a339-1cc2f9e9690f";
    private static final String VOLUME_UNITS = "57fbbf31-9b8c-5408-9af5-fbc73acd12bb";
    private static final String REMAINDER = "02013455-72a0-5213-9509-ed77f7ede62b";

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void actualShSurvivingContainerRetainsItsLegitimatelyAdmittedAtomsOnReads(String duration,
            @TempDir Path temp) throws Exception {
        for (String moved : List.of(AREA, VOLUME_UNITS)) {
            var old = shAdmittedFixture(duration, moved);
            List<String> oldMembers = old.views().resolveStructureReference(old.stale(SH_CONTAINER)).referencedGoalIds();
            assertThat(oldMembers).hasSize(24).contains(AREA, VOLUME_UNITS);
            var current = reproject(old, actualAfterView(duration), temp.resolve(moved));
            List<String> members = current.views().resolveStructureReference(current.stale(SH_CONTAINER)).referencedGoalIds();
            assertThat(members).hasSize(22).containsExactlyInAnyOrderElementsOf(
                    oldMembers.stream().filter(id -> !Set.of(AREA, VOLUME_UNITS).contains(id)).toList());
            assertThat(current.views().findLearnerFacingFocusAncestors(current.viewId(), moved,
                    current.landscapes().getById(MATH).getGoals().stream().collect(Collectors.toMap(LearningGoal::getId, g -> g)))).isNotEmpty();
            assertSnapshotTargets(old, duration, false);
            assertSnapshotTargets(current, duration, true);
            org.mockito.Mockito.clearInvocations(current.learners(), current.cards(),
                    current.planned(), current.masteryRepository(), current.events());
            String learnerBefore = MAPPER.writeValueAsString(current.learner());
            String masteryBefore = MAPPER.writeValueAsString(current.mastery());
            for (int read = 0; read < 2; read++) {
                var state = current.service().getLearnerState(LEARNER);
                var coach = current.service().getCoachLearnerState(LEARNER);
                assertThat(state.activeGoal().id()).isEqualTo(moved);
                assertThat(coach.activeGoal().id()).isEqualTo(moved);
                assertThat(state.nextAllowedActions()).contains("setMastery");
                assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
                assertThat(current.service().getPlannedGoals(LEARNER)).containsExactly(current.stale(SH_CONTAINER));
                assertThat(current.focus()).containsExactly(old.stale(SH_CONTAINER));
                assertThat(current.service().getFrontier(LEARNER)).allMatch(members::contains).doesNotContain(moved);
                assertThat(MAPPER.writeValueAsString(current.learner())).isEqualTo(learnerBefore);
                assertThat(MAPPER.writeValueAsString(current.mastery())).isEqualTo(masteryBefore);
            }
            assertNoReadMutations(current);
            verify(current.masteryRepository(), never()).save(any());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void actualShOrdinaryCompletionKeepsTheTwentyTwoMemberFocusAndNoOutsideAutopilot(String duration,
            @TempDir Path temp) throws Exception {
        for (String moved : List.of(AREA, VOLUME_UNITS)) for (boolean autopilot : List.of(false, true)) {
            var old = shAdmittedFixture(duration, moved);
            old.learner().setAutoPilot(autopilot);
            old.learner().setLearningStrategy("SEQUENTIAL");
            var current = reproject(old, actualAfterView(duration), temp.resolve(moved + autopilot));
            assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(moved);
            var result = current.service().setMastery(LEARNER, new MasteryUpdateRequest(Map.of(moved, 1.0), moved));
            assertThat(current.mastery().get(moved)).isEqualTo(1.0);
            verify(current.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
            List<String> members = current.views().resolveStructureReference(current.stale(SH_CONTAINER)).referencedGoalIds();
            assertThat(members).hasSize(22).doesNotContain(AREA, VOLUME_UNITS);
            if (result.activeGoal() != null) assertThat(members).contains(result.activeGoal().id());
            for (int read = 0; read < 2; read++) {
                var state = current.service().getLearnerState(LEARNER);
                if (state.activeGoal() != null) assertThat(members).contains(state.activeGoal().id());
                assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
                assertThat(current.service().getFrontier(LEARNER)).allMatch(members::contains);
                assertThat(current.focus()).containsExactly(current.stale(SH_CONTAINER));
            }
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void currentShFocusNeverAdmitsANewOutsideChoiceAndAnExplicitSameFocusWriteClearsIt(String duration,
            @TempDir Path temp) throws Exception {
        for (String moved : List.of(AREA, VOLUME_UNITS)) {
            var old = shAdmittedFixture(duration, moved);
            var current = reproject(old, actualAfterView(duration), temp.resolve(moved));
            assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(moved);
            assertThatThrownBy(() -> current.service().setActiveGoal(LEARNER, moved))
                    .isInstanceOf(ResponseStatusException.class);
            current.service().setScope(LEARNER, List.of(current.stale(SH_CONTAINER)));
            assertThat(current.learner().getActiveGoalId()).isNull();
            assertThat(current.service().getLearnerState(LEARNER).activeGoal()).isNull();
            assertThatThrownBy(() -> current.service().setActiveGoal(LEARNER, moved))
                    .isInstanceOf(ResponseStatusException.class);
            current.learner().setAutoPilot(true);
            var state = current.service().getLearnerState(LEARNER);
            if (state.activeGoal() != null) assertThat(state.activeGoal().id()).isNotIn(AREA, VOLUME_UNITS);
            current.learner().setAutoPilot(false);
            current.service().setScope(LEARNER, List.of(moved));
            current.service().setActiveGoal(LEARNER, moved);
            assertThat(current.learner().getActiveGoalId()).isEqualTo(moved);
            verify(current.masteryRepository(), never()).save(any());
        }
    }

    @Test void anActualLevelTwoWriteRevalidatesTheRetainedOutsideCursor(@TempDir Path temp) throws Exception {
        var old = shAdmittedFixture("G8", AREA);
        var current = reproject(old, actualAfterView("G8"), temp);
        assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(AREA);
        String masteryBefore = MAPPER.writeValueAsString(current.mastery());
        var committed = current.service().getPersonalizationPlan(LEARNER);
        String durationDecision = committed.completedDecisions().stream()
                .filter(d -> "durationModel".equals(d.groupId()))
                .map(com.skillpilot.backend.api.PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst().orElseThrow();
        var offered = current.service().rewindPersonalization(LEARNER, durationDecision);
        assertThat(offered.groupId()).isEqualTo("durationModel");
        assertThat(offered.options()).anySatisfy(option -> {
            assertThat(option.scopeKey()).isEqualTo("durationModel");
            assertThat(option.scopeValue()).isEqualTo("G9");
        });
        assertThat(current.learner().getActiveGoalId()).isNull();
        completeActualPersonalization(current, "DE-SH", "G9", "SekI");
        assertThat(MAPPER.readTree(current.learner().getPersonalCurriculum()).path(OVERVIEW).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(current.learner().getActiveGoalId()).isNull();
        assertThat(current.service().getLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(MAPPER.writeValueAsString(current.mastery())).isEqualTo(masteryBefore);
        verify(current.masteryRepository(), never()).save(any());
    }

    @Test void survivingMemoryRootUsesOnlyRealStrictRecallAndItsOneNormalResult(@TempDir Path temp) throws Exception {
        var old = reproject(fixture(true), memoryView(true), temp.resolve("old"));
        old.service().setPlannedGoals(LEARNER, Set.of(old.stale("surviving-memory-focus")));
        old.service().setActiveGoal(LEARNER, MEMORY);
        var current = reproject(old, memoryView(false), temp.resolve("after"));
        current.learner().setAutoPilot(true);
        String before = MAPPER.writeValueAsString(current.learner());
        for (int read = 0; read < 2; read++) {
            assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
            var coach = current.service().getCoachLearnerState(LEARNER);
            assertThat(coach.stateMachine().requiredAction()).isEqualTo("chooseMemoryMode");
            assertThat(coach.nextAllowedActions()).doesNotContain("setMastery");
            assertThat(MAPPER.writeValueAsString(current.learner())).isEqualTo(before);
        }
        assertThatThrownBy(() -> current.service().setMastery(LEARNER,
                new MasteryUpdateRequest(Map.of(MEMORY, 1.0), MEMORY)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> current.service().startVerifiedRecallBatch(LEARNER, "de", ACTIVE, 1))
                .isInstanceOf(ResponseStatusException.class);
        verify(current.masteryRepository(), never()).save(any());
        var prompt = current.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1);
        boolean completed = false;
        int assessed = 0;
        while (!prompt.cards().isEmpty() && assessed < 200) {
            var result = current.service().recordVerifiedRecallResult(LEARNER, "de",
                    new VerifiedRecallResultRequest(MEMORY, prompt.cards().getFirst().cardId(), true));
            assessed++;
            if (result.masterySaved()) { assertThat(result.pendingCards()).isZero(); completed = true; break; }
            assertThat(result.pendingCards()).isPositive();
            assertThat(current.mastery()).isEmpty();
            verify(current.masteryRepository(), never()).save(any());
            prompt = result.next();
        }
        assertThat(completed).isTrue();
        assertThat(assessed).isGreaterThan(1);
        assertThat(current.mastery()).containsExactly(Map.entry(MEMORY, 1.0));
        verify(current.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
        var state = current.service().getLearnerState(LEARNER);
        if (state.activeGoal() != null) assertThat(state.activeGoal().id()).isEqualTo(ACTIVE);
        assertThat(current.focus()).containsExactly(current.stale("surviving-memory-focus"));
    }

    @Test void survivingMemoryRootStillRejectsAMissingDeckAndRepositoryFailure(@TempDir Path temp) throws Exception {
        for (boolean missingDeck : List.of(false, true)) {
            var old = reproject(fixture(true), memoryView(true), temp.resolve("old" + missingDeck));
            old.service().setPlannedGoals(LEARNER, Set.of(old.stale("surviving-memory-focus")));
            old.service().setActiveGoal(LEARNER, MEMORY);
            var current = reproject(old, memoryView(false), temp.resolve("after" + missingDeck));
            assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
            if (missingDeck) {
                doReturn(null).when(current.decks()).resolveDeckResource(org.mockito.ArgumentMatchers.eq(MEMORY), anyString());
                assertThatThrownBy(() -> current.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1))
                        .isInstanceOfAny(SrsStateUnavailableException.class, ResponseStatusException.class);
            } else {
                var failure = new IllegalStateException("retained-memory SRS outage");
                when(current.cards().findById(any())).thenThrow(failure);
                assertThatThrownBy(() -> current.service().startVerifiedRecallBatch(LEARNER, "de", MEMORY, 1)).isSameAs(failure);
            }
            assertThat(current.mastery()).isEmpty();
            verify(current.masteryRepository(), never()).save(any());
        }
    }


    @Test void aSignedImportRevalidatesFocusAndCannotInjectItsArchivedOrClientCursor(@TempDir Path temp) throws Exception {
        var old = reproject(fixture(true), memoryView(true), temp.resolve("old"));
        old.service().setPlannedGoals(LEARNER, Set.of(old.stale("surviving-memory-focus")));
        old.service().setActiveGoal(LEARNER, MEMORY);
        var current = reproject(old, memoryView(false), temp.resolve("after"));
        assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(MEMORY);
        var imported = MAPPER.readValue(MAPPER.writeValueAsString(current.learner()), Learner.class);
        imported.setActiveGoalId(MEMORY);
        imported.setClientState("{\"activeGoalId\":\"" + MEMORY + "\"}");
        var data = new com.skillpilot.backend.api.LearnerDataDTO(imported,
                Map.of(ACTIVE, new com.skillpilot.backend.api.MasteryEntryDTO(1.0, null)),
                List.of(current.stale("surviving-memory-focus")), Set.of(), null);
        org.springframework.test.util.ReflectionTestUtils.setField(current.service(), "signingSecret", "private-focus-test-secret");
        String signature = org.springframework.test.util.ReflectionTestUtils.invokeMethod(current.service(), "calculateSignature", data);
        when(current.masteryRepository().saveAndFlush(any(Mastery.class))).thenAnswer(call -> {
            Mastery saved = call.getArgument(0); current.mastery().put(saved.getGoalKey(), saved.getValue()); return saved;
        });
        current.service().importLearner(LEARNER, new com.skillpilot.backend.api.SignedLearnerDataDTO(data, signature));
        assertThat(current.learner().getActiveGoalId()).isNull();
        assertThat(current.mastery()).containsExactly(Map.entry(ACTIVE, 1.0));
        assertThat(current.focus()).containsExactly(current.stale("surviving-memory-focus"));
        assertThat(current.service().getLearnerState(LEARNER).activeGoal()).isNull();
        verify(current.masteryRepository(), never()).save(any());
    }

    @Test void currentInFocusMemoryKeepsItsExistingGeneralResultContract() throws Exception {
        var f = fixture(true);
        f.service().setPlannedGoals(LEARNER, Set.of(MEMORY));
        f.service().setActiveGoal(LEARNER, MEMORY);
        f.service().setMastery(LEARNER, new MasteryUpdateRequest(Map.of(MEMORY, 1.0), MEMORY));
        assertThat(f.mastery()).containsExactly(Map.entry(MEMORY, 1.0));
        verify(f.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
    }

    @Test void survivingRootReadDoesNotBindAnUnstartedExamButPreservesARealStart(@TempDir Path temp) throws Exception {
        String exam = "3ce97753-f442-52c5-882c-bf78a5be9925";
        for (boolean started : List.of(false, true)) {
            var old = reproject(fixture(), movedView("stored-exam-reparenting", exam, true), temp.resolve("old" + started));
            old.service().setPlannedGoals(LEARNER, Set.of(old.stale("surviving-memory-focus")));
            if (started) old.service().setActiveGoal(LEARNER, exam);
            else { old.learner().setActiveGoalId(exam); old.learner().setLearningState(LearningState.TEACHING); }
            String taskAssociation = old.learner().getCompletionWorkflow();
            var current = reproject(old, movedView("stored-exam-reparenting", exam, false), temp.resolve("after" + started));
            var facade = new com.skillpilot.backend.ai.CoachToolFacade(current.service(), null,
                    new com.skillpilot.backend.ai.CoachStateProjection("https://skillpilot.com"), null);
            var state = current.service().getLearnerState(LEARNER);
            assertThat(state.activeGoal().id()).isEqualTo(exam);
            assertThat(current.learner().getCompletionWorkflow()).isEqualTo(taskAssociation);
            if (started) {
                current.service().assertCurrentAssessmentStarted(LEARNER, exam);
                assertThat(facade.getExamEvaluation(LEARNER,
                        new com.skillpilot.backend.ai.CoachToolFacade.ExamEvaluationRequest(exam)).goalId()).isEqualTo(exam);
            } else {
                assertThat(state.nextAllowedActions()).doesNotContain("setMastery");
                assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
                assertThatThrownBy(() -> facade.getExamEvaluation(LEARNER,
                        new com.skillpilot.backend.ai.CoachToolFacade.ExamEvaluationRequest(exam)))
                        .isInstanceOf(ResponseStatusException.class);
                assertThat(facade.setMastery(LEARNER, new MasteryUpdateRequest(Map.of(exam, 1.0), exam)).status().name())
                        .isEqualTo("CONFLICT");
            }
            assertThat(current.learner().getCompletionWorkflow()).isEqualTo(taskAssociation);
            assertThat(current.mastery()).isEmpty();
            verify(current.masteryRepository(), never()).save(any());
        }
    }

    @Test void survivingRootStillClearsAMasteredCursorWithoutRequalifyingIt(@TempDir Path temp) throws Exception {
        var old = shAdmittedFixture("G8", AREA);
        var current = reproject(old, actualAfterView("G8"), temp);
        current.mastery().put(AREA, 1.0);
        String masteryBefore = MAPPER.writeValueAsString(current.mastery());
        assertThat(current.service().getLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(current.learner().getActiveGoalId()).isNull();
        assertThat(MAPPER.writeValueAsString(current.mastery())).isEqualTo(masteryBefore);
        verify(current.masteryRepository(), never()).save(any());
    }


    @Test void survivingRootCannotRetainMissingPrerequisiteOnlyClusterOrUnavailableExamPointers(@TempDir Path temp) throws Exception {
        String cluster = "b3d2284c-21e0-5af8-942a-a4c11390c84a";
        String exam = "3ce97753-f442-52c5-882c-bf78a5be9925";
        for (String invalid : List.of("missing-target", MEMORY, cluster, exam)) {
            var f = fixture(true);
            Map<String, Object> view = new LinkedHashMap<>(movedView("stored-invalid-reparenting", MEMORY, false));
            List<Map<String, Object>> roots = new ArrayList<>();
            roots.add(Map.of("kind", "structure", "id", "surviving-memory-focus", "label", "Focus", "children",
                    List.of(Map.of("kind", "goalEntry", "goalId", ACTIVE))));
            roots.add(Map.of("kind", "goalEntry", "goalId", MEMORY, "projectionRole", "prerequisiteOnly"));
            roots.add(Map.of("kind", "canonicalSubtree", "goalId", cluster));
            roots.add(Map.of("kind", "goalEntry", "goalId", exam));
            view.put("rootNodes", roots);
            if (invalid.equals(exam)) {
                SkillLandscape unavailable = MAPPER.readValue(MAPPER.writeValueAsString(landscape), SkillLandscape.class);
                unavailable.getGoals().stream().filter(g -> exam.equals(g.getId())).findFirst().orElseThrow()
                        .getExamData().setReviewStatus("draft");
                when(f.landscapes().getById(MATH)).thenReturn(unavailable);
                when(f.landscapes().getClosure(MATH)).thenReturn(List.of(unavailable));
                when(f.landscapes().getAll()).thenReturn(List.of(unavailable));
            }
            var current = reproject(f, view, temp.resolve(invalid));
            current.service().setPlannedGoals(LEARNER, Set.of(current.stale("surviving-memory-focus")));
            current.learner().setActiveGoalId(invalid);
            current.learner().setLearningState(LearningState.TEACHING);
            assertThat(current.service().getLearnerState(LEARNER).activeGoal()).isNull();
            assertThat(current.learner().getActiveGoalId()).isNull();
            assertThat(current.focus()).containsExactly(current.stale("surviving-memory-focus"));
            assertThat(current.mastery()).isEmpty();
            verify(current.masteryRepository(), never()).save(any());
        }
    }


    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void actualShLostCanonicalExamFolderRetainsOnlyItsAlreadyStartedCurrentTask(String duration,
            @TempDir Path temp) throws Exception {
        String oldFolder = "5fb3ee61-059c-47f4-8c6f-7285d7982a41";
        var expected = shFixtureBasis.path("cases").path(duration).path("historicalLostJ8Focus");
        var old = fixture(false, "DE-SH", duration, "SekI");
        old.service().setPlannedGoals(LEARNER, Set.of(oldFolder));
        Set<String> oldMembers = actualFocusMembers(old, oldFolder);
        assertThat(oldMembers).isNotEmpty().containsExactlyInAnyOrderElementsOf(
                MAPPER.convertValue(expected.path("beforeWholeAtomicMembers"), List.class));
        String task = old.service().getFrontier(LEARNER).stream().filter(oldMembers::contains)
                .filter(id -> old.landscapes().getGoalDefinition(id).getExamData() != null)
                .findFirst().orElseThrow();
        old.service().setActiveGoal(LEARNER, task);
        old.service().assertCurrentAssessmentStarted(LEARNER, task);
        var current = reproject(old, actualAfterView(duration), temp);
        current.learner().setAutoPilot(true);
        assertThat(actualFocusMembers(current, oldFolder)).isEmpty();
        org.mockito.Mockito.clearInvocations(current.learners(), current.cards(),
                current.planned(), current.masteryRepository(), current.events());
        String learnerBefore = MAPPER.writeValueAsString(current.learner());
        for (int read = 0; read < 2; read++) {
            assertThat(current.service().getLearnerState(LEARNER).activeGoal().id()).isEqualTo(task);
            assertThat(current.service().getCoachLearnerState(LEARNER).activeGoal().id()).isEqualTo(task);
            assertThat(current.service().getPlannedGoals(LEARNER)).isEmpty();
            assertThat(current.service().getFrontier(LEARNER)).isEmpty();
            assertThat(current.focus()).containsExactly(oldFolder);
            assertThat(MAPPER.writeValueAsString(current.learner())).isEqualTo(learnerBefore);
        }
        assertNoReadMutations(current);
        current.service().assertCurrentAssessmentStarted(LEARNER, task);
        var result = current.service().setMastery(LEARNER, new MasteryUpdateRequest(Map.of(task, 1.0), task));
        assertThat(result.activeGoal()).isNull();
        assertThat(current.mastery()).containsExactly(Map.entry(task, 1.0));
        verify(current.masteryRepository(), org.mockito.Mockito.times(1)).save(any());
        assertThat(current.service().getLearnerState(LEARNER).stateMachine().requiredAction()).isEqualTo("setScope");
        assertThatThrownBy(() -> current.service().setScope(LEARNER, List.of(oldFolder)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(current.focus()).containsExactly(oldFolder);
        String replacement = current.stale(expected.path("explicitAfterReplacementStructureId").asText());
        assertThat(actualFocusMembers(current, replacement)).containsExactlyInAnyOrderElementsOf(
                MAPPER.convertValue(expected.path("explicitAfterReplacementWholeAtomicMembers"), List.class));
        current.service().setScope(LEARNER, List.of(replacement));
        assertThat(current.service().getPlannedGoals(LEARNER)).containsExactly(replacement);
        Set<String> replacementMembers = actualFocusMembers(current, replacement);
        assertThat(current.service().getFrontier(LEARNER)).allMatch(replacementMembers::contains);
        assertThat(replacementMembers).doesNotContain("3045f00d-a5b9-547c-b568-593aeac9ffa3");
    }

    private static Set<String> actualFocusMembers(Fixture f, String root) {
        Object projection = org.springframework.test.util.ReflectionTestUtils.invokeMethod(f.service(), "getGoalProjection",
                f.learner().getSelectedCurriculum(), f.learner().getPersonalCurriculum(), false);
        return org.springframework.test.util.ReflectionTestUtils.invokeMethod(f.service(), "projectedAtomicTargetIds",
                List.of(root), projection);
    }

    private static Fixture shAdmittedFixture(String duration, String moved) throws Exception {
        var f = fixture(false, "DE-SH", duration, "SekI");
        historicalBeforeMathematics.getGoals().forEach(goal -> {
            String id = goal.getId();
            if (!id.equals(moved) && !id.equals(REMAINDER)
                    && (goal.getContains() == null || goal.getContains().isEmpty())) f.mastery().put(id, 1.0);
        });
        f.service().setPlannedGoals(LEARNER, Set.of(f.stale(SH_CONTAINER)));
        assertThat(f.service().getCoachPersonalizationPlan(LEARNER).required()).isFalse();
        assertThat(f.service().getFrontier(LEARNER)).contains(moved);
        f.service().setActiveGoal(LEARNER, moved);
        assertThat(f.learner().getActiveGoalId()).isEqualTo(moved);
        return f;
    }

    private static Map<String, Object> actualAfterView(String duration) throws Exception {
        String resource = "/composition-focus-reparenting/de-sh-seki-" + duration.toLowerCase(java.util.Locale.ROOT)
                + ".after.view.json";
        try (var input = StoredCompositionFocusTest.class.getResourceAsStream(resource)) {
            assertThat(input).as("exact reviewed SH presentation fixture").isNotNull();
            return MAPPER.readValue(input, Map.class);
        }
    }

    private static Map<String, Object> memoryView(boolean before) {
        return movedView("stored-memory-reparenting", MEMORY, before);
    }

    private static Map<String, Object> movedView(String viewId, String moved, boolean before) {
        List<Map<String, Object>> focus = before
                ? List.of(Map.of("kind", "goalEntry", "goalId", ACTIVE), Map.of("kind", "goalEntry", "goalId", moved))
                : List.of(Map.of("kind", "goalEntry", "goalId", ACTIVE));
        List<Map<String, Object>> roots = new ArrayList<>(actualPreparationReferences(ACTIVE, moved));
        roots.add(Map.of("kind", "structure", "id", "surviving-memory-focus", "label", "Current focus", "children", focus));
        if (!before) roots.add(Map.of("kind", "structure", "id", "new-memory-location", "label", "Memory", "children",
                List.of(Map.of("kind", "goalEntry", "goalId", moved))));
        return Map.of("viewId", viewId, "landscapeId", MATH,
                "scope", Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "CrossStage",
                        "durationModel", "G8", "courseProfile", "GK+LK"), "rootNodes", roots);
    }

    /** Preserve complete real preparation as POnly outside the two authored targets. */
    private static List<Map<String, Object>> actualPreparationReferences(String... targets) {
        Map<String, List<String>> parents = new LinkedHashMap<>();
        goals.values().forEach(goal -> {
            if (goal.getContains() != null) for (String child : goal.getContains())
                parents.computeIfAbsent(child, ignored -> new ArrayList<>()).add(goal.getId());
        });
        Set<String> inspected = new LinkedHashSet<>();
        Set<String> requirements = new LinkedHashSet<>();
        var pending = new java.util.ArrayDeque<String>(List.of(targets));
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!inspected.add(id)) continue;
            LearningGoal goal = goals.get(id);
            assertThat(goal).as("real preparation reference %s", id).isNotNull();
            var ancestors = new java.util.ArrayDeque<String>(); ancestors.add(id);
            Set<String> seenAncestors = new LinkedHashSet<>();
            while (!ancestors.isEmpty()) {
                String ancestor = ancestors.removeFirst();
                if (!seenAncestors.add(ancestor)) continue;
                LearningGoal definition = goals.get(ancestor);
                assertThat(definition).as("real preparation ancestor %s", ancestor).isNotNull();
                if (definition.getRequires() != null) for (String required : definition.getRequires()) {
                    requirements.add(required); pending.addLast(required);
                }
                ancestors.addAll(parents.getOrDefault(ancestor, List.of()));
            }
            if (goal.getContains() != null) pending.addAll(goal.getContains());
        }
        return requirements.stream().map(id -> {
            LearningGoal required = goals.get(id);
            String kind = required.getContains() == null || required.getContains().isEmpty()
                    ? "goalEntry" : "canonicalSubtree";
            return Map.<String, Object>of("kind", kind, "goalId", id, "projectionRole", "prerequisiteOnly");
        }).toList();
    }

    private static Fixture reproject(Fixture f, Map<String, Object> view, Path temp) throws Exception {
        boolean actualSh = OVERVIEW.equals(f.learner().getSelectedCurriculum());
        CompositionViewService views;
        LandscapeService currentCatalog;
        GoalMappingService mappings;
        if (actualSh) {
            views = historicalAfterViews;
            currentCatalog = historicalAfterCatalog;
            mappings = historicalAfterMappings;
        } else {
            Path destination = temp.resolve("DE/Gymnasium/composition-views/mathematik/fixture.view.json");
            Files.createDirectories(destination.getParent());
            MAPPER.writeValue(destination.toFile(), view);
            var viewProperties = new LandscapeProperties(); viewProperties.setDirectory(temp.toString());
            Map<String, List<String>> contains = new LinkedHashMap<>();
            goals.forEach((id, goal) -> contains.put(id, goal.getContains()));
            views = new CompositionViewService(viewProperties, MAPPER, () -> contains);
            currentCatalog = f.landscapes(); mappings = mock(GoalMappingService.class);
        }
        var service = new LearnerService(f.learners(), f.cards(), f.masteryRepository(), f.planned(),
                currentCatalog, mappings, f.decks(), views, MAPPER, f.events(), null, null);
        return new Fixture(service, new LearnerUiController(service, null, null), f.learner(), f.planned(),
                f.masteryRepository(), f.focus(), f.mastery(), (String) view.get("viewId"), f.decks(),
                f.learners(), f.cards(), currentCatalog, views, f.events());
    }

    private static String historicalText(String resource) throws Exception {
        var binding = shFixtureBasis.path("historicalResources").path(resource);
        try (var input = StoredCompositionFocusTest.class.getResourceAsStream("/composition-focus-reparenting/" + resource)) {
            assertThat(input).isNotNull();
            byte[] zipped = input.readAllBytes();
            assertThat(java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(zipped)))
                    .isEqualTo(binding.path("gzipSha256").asText());
            try (var gzip = new java.util.zip.GZIPInputStream(new java.io.ByteArrayInputStream(zipped))) {
                String text = new String(gzip.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                assertThat(sha256(text)).isEqualTo(binding.path("uncompressedSha256").asText());
                return text;
            }
        }
    }

    private static LandscapeProperties materializeHistoricalShSnapshot(
            Path directory, String mathText, String overviewText, boolean after) throws Exception {
        var closure = MAPPER.readTree(historicalText("sh-flow-source-closure.json.gz"));
        assertThat(closure.path("files")).hasSize(42);
        for (var source : closure.path("files")) {
            Path relative = Path.of(source.path("path").asText());
            assertThat(relative.isAbsolute()).isFalse();
            Path destination = directory.resolve(relative).normalize();
            assertThat(destination.startsWith(directory.normalize())).isTrue();
            String text = source.path("content").asText();
            assertThat(sha256(text)).isEqualTo(source.path("sha256").asText());
            Files.createDirectories(destination.getParent());
            Files.writeString(destination, text);
        }
        Path canonical = directory.resolve("DE/Gymnasium/canonical");
        Files.createDirectories(canonical);
        Files.writeString(canonical.resolve("DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"), mathText);
        Files.writeString(canonical.resolve("DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json"), overviewText);
        Path views = directory.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(views);
        for (String duration : List.of("g8", "g9")) {
            String viewText;
            if (after) {
                try (var input = StoredCompositionFocusTest.class.getResourceAsStream(
                        "/composition-focus-reparenting/de-sh-seki-" + duration + ".after.view.json")) {
                    assertThat(input).isNotNull();
                    viewText = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
                assertThat(sha256(viewText)).isEqualTo(shFixtureBasis.path("cases")
                        .path(duration.toUpperCase(java.util.Locale.ROOT)).path("afterView").path("sha256").asText());
            } else viewText = historicalText("de-sh-seki-" + duration + ".before.view.json.gz");
            Files.writeString(views.resolve("de-sh-seki-" + duration + ".view.json"), viewText);
        }
        var properties = new LandscapeProperties(); properties.setDirectory(directory.toString());
        return properties;
    }

    /** Actual opaque options commit through the public path; no forged flow confirmations. */
    private static void completeActualPersonalization(Fixture f, String country, String duration, String stage) throws Exception {
        for (int step = 0; step < 20; step++) {
            var plan = f.service().getPersonalizationPlan(LEARNER);
            assertThat(plan.valid()).as("actual Overview planner: %s", plan).isTrue();
            if (!plan.required()) {
                assertThat(f.learner().getSelectedCurriculum()).isEqualTo(OVERVIEW);
                var config = MAPPER.readTree(f.learner().getPersonalCurriculum());
                assertThat(config.path(OVERVIEW).path("filterId").asText()).isEqualTo(country);
                assertThat(config.path(OVERVIEW).path("stage").asText()).isEqualTo(stage);
                assertThat(config.path(OVERVIEW).path("durationModel").asText()).isEqualTo(duration);
                assertThat(config.path(MATH).path("selected").asBoolean()).isTrue();
                assertThat(plan.completedDecisions()).extracting(d -> d.groupId())
                        .contains("jurisdiction", "durationModel", "stage", "subject");
                return;
            }
            var option = plan.options().stream().filter(o -> o.kind()
                    == com.skillpilot.backend.api.PersonalizationPlan.OptionKind.COMPLETE_GROUP).findFirst()
                    .orElseGet(() -> plan.options().stream().filter(o ->
                            ("jurisdiction".equals(o.groupId()) && country.equals(o.filterId()))
                            || ("durationModel".equals(o.scopeKey()) && duration.equals(o.scopeValue()))
                            || ("stage".equals(o.scopeKey()) && stage.equals(o.scopeValue()))
                            || ("subject".equals(o.groupId()) && MATH.equals(o.landscapeId()))
                            || ("subjectProfile".equals(o.groupId()) && MATH.equals(o.landscapeId())
                                    && "GK+LK".equals(o.filterId())))
                            .findFirst().orElseThrow(() -> new AssertionError("No real offered option: " + plan)));
            f.service().patchPersonalCurriculum(LEARNER, Map.of(), null, null, option.optionId());
        }
        throw new AssertionError("Actual Overview personalization did not finish");
    }

    private static void assertSnapshotTargets(Fixture f, String duration, boolean after) {
        Object projection = org.springframework.test.util.ReflectionTestUtils.invokeMethod(f.service(), "getGoalProjection",
                OVERVIEW, f.learner().getPersonalCurriculum(), false);
        Set<String> actual = org.springframework.test.util.ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
        Map<String, LearningGoal> structural = org.springframework.test.util.ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
        Set<String> mathIds = f.landscapes().getById(MATH).getGoals().stream().map(LearningGoal::getId).collect(Collectors.toSet());
        var expected = shFixtureBasis.path("cases").path(duration);
        String phase = after ? "after" : "before";
        assertThat(actual).as("complete historical Personal Curriculum Target set; no subject-only truncation")
                .containsExactlyInAnyOrderElementsOf(MAPPER.convertValue(expected.path(phase + "WholeTargetGoalIds"), List.class));
        Set<String> mathTargets = actual.stream().filter(mathIds::contains).collect(Collectors.toCollection(LinkedHashSet::new));
        assertThat(mathTargets).containsExactlyInAnyOrderElementsOf(
                MAPPER.convertValue(expected.path(phase + "WholeTargetGoalIds"), List.class));
        Set<String> canonicalAtoms = actual.stream().filter(id -> structural.get(id) != null
                && (structural.get(id).getContains() == null || structural.get(id).getContains().isEmpty()))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        assertThat(canonicalAtoms).containsExactlyInAnyOrderElementsOf(
                MAPPER.convertValue(expected.path(phase + "WholeCanonicalAtomicTargetGoalIds"), List.class));
        assertThat(canonicalAtoms.contains("3045f00d-a5b9-547c-b568-593aeac9ffa3")).isEqualTo(after);
        assertThat(f.views().resolveStructureReference(f.stale(SH_CONTAINER)).referencedGoalIds())
                .containsExactlyElementsOf(MAPPER.convertValue(expected.path(phase + "WholeContainerGoalIds"), List.class));
    }

    private static void assertNoReadMutations(Fixture f) {
        for (Object repo : List.of(f.learners(), f.cards(), f.planned(), f.masteryRepository())) {
            for (var call : org.mockito.Mockito.mockingDetails(repo).getInvocations()) {
                String name = call.getMethod().getName();
                assertThat(name.startsWith("save") || name.startsWith("delete") || name.startsWith("flush")
                        || call.getMethod().isAnnotationPresent(org.springframework.data.jpa.repository.Modifying.class)).isFalse();
            }
        }
        org.mockito.Mockito.verifyNoInteractions(f.events());
    }

    private static String sha256(String value) throws Exception {
        return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    }

    private static Fixture fixture() throws Exception {
        return fixture(false);
    }

    private static Fixture fixture(boolean actualDeck) throws Exception {
        return fixture(actualDeck, "DE-HE", "G8", "CrossStage");
    }

    private static Fixture fixture(boolean actualDeck, String jurisdiction, String duration, String stage) throws Exception {
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getById(MATH)).thenReturn(landscape);
        when(landscapes.getClosure(MATH)).thenReturn(List.of(landscape));
        when(landscapes.getAll()).thenReturn(List.of(landscape));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> goals.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn(MATH);
        when(landscapes.getOverview(anyString(), anyBoolean())).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        boolean actualSh = "DE-SH".equals(jurisdiction);
        if (actualSh) landscapes = historicalBeforeCatalog;
        Map<String, List<String>> contains = new LinkedHashMap<>();
        goals.forEach((id, goal) -> contains.put(id, goal.getContains()));
        var views = actualSh ? historicalBeforeViews
                : new CompositionViewService(properties, MAPPER, () -> contains);
        var learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(actualSh ? OVERVIEW : MATH);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setAutoPilot(false);
        if (!actualSh) learner.setPersonalCurriculum(MAPPER.writeValueAsString(Map.of(
                MATH, Map.of("selected", true, "filterId", "GK+LK", "stage", stage, "durationModel", duration),
                OVERVIEW, Map.of("selected", true, "filterId", jurisdiction, "stage", stage, "durationModel", duration))));
        var learners = mock(LearnerRepository.class);
        when(learners.existsById(LEARNER)).thenReturn(true);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.save(any(Learner.class))).thenAnswer(call -> call.getArgument(0));
        List<String> focus = new ArrayList<>();
        var planned = mock(PlannedGoalRepository.class);
        when(planned.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call -> focus.stream()
                .map(id -> new PlannedGoal(learner, id)).toList());
        doAnswer(call -> { Iterable<PlannedGoal> removed = call.getArgument(0);
            removed.forEach(goal -> focus.remove(goal.getGoalId())); return null;
        }).when(planned).deleteAll(any());
        when(planned.save(any(PlannedGoal.class))).thenAnswer(call -> {
            PlannedGoal saved = call.getArgument(0); focus.add(saved.getGoalId()); return saved;
        });
        when(planned.saveAll(any())).thenAnswer(call -> { Iterable<PlannedGoal> saved = call.getArgument(0);
            saved.forEach(goal -> focus.add(goal.getGoalId())); return saved;
        });
        Map<String, Double> mastery = new LinkedHashMap<>();
        var masteries = mock(MasteryRepository.class);
        when(masteries.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call -> mastery.entrySet().stream()
                .map(entry -> new Mastery(learner, entry.getKey(), entry.getValue())).toList());
        when(masteries.save(any(Mastery.class))).thenAnswer(call -> {
            Mastery saved = call.getArgument(0); mastery.put(saved.getGoalKey(), saved.getValue()); return saved;
        });
        Map<LearnerClientStateId, LearnerClientState> storedCards = new LinkedHashMap<>();
        var clientStates = mock(LearnerClientStateRepository.class);
        when(clientStates.findById(any())).thenAnswer(call -> Optional.ofNullable(storedCards.get(call.getArgument(0))));
        when(clientStates.findByLearnerAndNodeIds(anyString(), any())).thenAnswer(call -> {
            String learnerId = call.getArgument(0);
            java.util.Collection<String> nodeIds = call.getArgument(1);
            return nodeIds.stream().map(id -> storedCards.get(new LearnerClientStateId(learnerId, id)))
                    .filter(java.util.Objects::nonNull).toList();
        });
        when(clientStates.save(any(LearnerClientState.class))).thenAnswer(call -> {
            LearnerClientState saved = call.getArgument(0); storedCards.put(saved.getId(), saved); return saved;
        });
        var decks = actualDeck ? spy(new DeckResourceService(properties)) : mock(DeckResourceService.class);
        var events = mock(ApplicationEventPublisher.class);
        var service = new LearnerService(learners, clientStates, masteries, planned,
                landscapes, actualSh ? historicalBeforeMappings : mock(GoalMappingService.class), decks,
                views, MAPPER, events, null, null);
        String viewId = (String) views.findLearnerScopeView(MATH, Map.of("schoolForm", "Gymnasium",
                "jurisdiction", jurisdiction, "stage", stage, "durationModel", duration, "courseProfile", "GK+LK")).get("viewId");
        var result = new Fixture(service, new LearnerUiController(service, null, null), learner, planned, masteries,
                focus, mastery, viewId, decks, learners, clientStates, landscapes, views, events);
        if (actualSh) completeActualPersonalization(result, jurisdiction, duration, stage);
        return result;
    }

    private record Fixture(LearnerService service, LearnerUiController ui, Learner learner,
            PlannedGoalRepository planned, MasteryRepository masteryRepository, List<String> focus,
            Map<String, Double> mastery, String viewId, DeckResourceService decks,
            LearnerRepository learners, LearnerClientStateRepository cards, LandscapeService landscapes,
            CompositionViewService views, ApplicationEventPublisher events) {
        String stale(String wrapper) { return "composition:" + viewId + ":structure:" + wrapper; }
    }
}
