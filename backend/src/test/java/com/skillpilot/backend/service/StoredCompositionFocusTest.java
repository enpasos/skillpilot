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
import java.util.ArrayList;
import java.util.LinkedHashMap;
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

    @BeforeAll static void loadActualHessianMathematics() throws Exception {
        Path curricula = Path.of("../curricula").toAbsolutePath().normalize();
        properties = new LandscapeProperties();
        properties.setDirectory(curricula.toString());
        landscape = MAPPER.readValue(curricula.resolve(
                "DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile(), SkillLandscape.class);
        goals = landscape.getGoals().stream().collect(Collectors.toMap(LearningGoal::getId, goal -> goal));
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

    @Test void anOutsideActiveGoalWithoutAnyLostReferenceKeepsNormalScopeInvalidation() throws Exception {
        var f = fixture(true);
        f.focus().add(MEMORY);
        f.learner().setActiveGoalId(ACTIVE);
        f.learner().setLearningState(LearningState.TEACHING);
        assertThat(f.service().getLearnerState(LEARNER).activeGoal()).isNull();
        assertThat(f.learner().getActiveGoalId()).isNull();
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

    private static Fixture fixture() throws Exception {
        return fixture(false);
    }

    private static Fixture fixture(boolean actualDeck) throws Exception {
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getById(MATH)).thenReturn(landscape);
        when(landscapes.getClosure(MATH)).thenReturn(List.of(landscape));
        when(landscapes.getAll()).thenReturn(List.of(landscape));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> goals.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn(MATH);
        when(landscapes.getOverview(anyString(), anyBoolean())).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        Map<String, List<String>> contains = new LinkedHashMap<>();
        goals.forEach((id, goal) -> contains.put(id, goal.getContains()));
        var views = new CompositionViewService(properties, MAPPER, () -> contains);
        var learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(MATH);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setAutoPilot(false);
        learner.setPersonalCurriculum(MAPPER.writeValueAsString(Map.of(
                MATH, Map.of("selected", true, "filterId", "GK+LK", "stage", "CrossStage", "durationModel", "G8"),
                OVERVIEW, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G8"))));
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
        when(clientStates.save(any(LearnerClientState.class))).thenAnswer(call -> {
            LearnerClientState saved = call.getArgument(0); storedCards.put(saved.getId(), saved); return saved;
        });
        var decks = actualDeck ? spy(new DeckResourceService(properties)) : mock(DeckResourceService.class);
        var service = new LearnerService(learners, clientStates, masteries, planned,
                landscapes, mock(GoalMappingService.class), decks,
                views, MAPPER, mock(ApplicationEventPublisher.class), null, null);
        String viewId = (String) views.findLearnerScopeView(MATH, Map.of("schoolForm", "Gymnasium",
                "jurisdiction", "DE-HE", "stage", "CrossStage", "durationModel", "G8", "courseProfile", "GK+LK")).get("viewId");
        return new Fixture(service, new LearnerUiController(service, null, null), learner, planned, masteries,
                focus, mastery, viewId, decks);
    }

    private record Fixture(LearnerService service, LearnerUiController ui, Learner learner,
            PlannedGoalRepository planned, MasteryRepository masteryRepository, List<String> focus,
            Map<String, Double> mastery, String viewId, DeckResourceService decks) {
        String stale(String wrapper) { return "composition:" + viewId + ":structure:" + wrapper; }
    }
}
