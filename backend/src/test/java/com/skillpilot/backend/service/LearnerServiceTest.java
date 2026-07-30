package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class LearnerServiceTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String COMPOSITION_J8_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j8-g9";
    private static final String COMPOSITION_J9_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j9-g9";
    private static final String COMPOSITION_J10_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:j10-g9";
    private static final String COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID =
            "composition:de-de-gym-math-lk:structure:math-root";
    private static final String COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID =
            "composition:de-de-gym-physics-lk:structure:physics-root";
    private static final String CANONICAL_SPANISH_LANDSCAPE_ID =
            "90eedebf-9ea8-5247-85dd-31c147f907c3";
    private static final String CANONICAL_SPANISH_ROOT_SCOPE_ID =
            "1b23eb50-e5f6-5958-8c99-ff8ca9668031";
    private static final String SEK1_EXERCISES_SCOPE_ID = "bfc4fe23-bfa4-4836-9bd2-793f4305d682";
    private static final String REMOVED_SEK1_CAPSTONE_ID = "30b62966-80d0-45f1-bdd9-b4fb815c7111";
    private static final String VISIBLE_POLYNOMIAL_FUNCTIONS_ID = "1ce8af38-082a-477b-af48-b924c92761bf";
    private static final String HIDDEN_TRIGONOMETRIC_EXPONENTIAL_CORRIDOR_ID =
            "0756b198-0074-49d5-becd-9bb9f161a291";
    private static final String HIDDEN_POLYNOMIAL_END_BEHAVIOR_ID = "283ec44e-747c-55e3-9a61-4a4cc70ebfab";
    private static final String SEK1_CORE_FORMULAS_FLASHCARDS_ID = "4eefbd04-9e49-41ea-a087-9ad6ac71ec5a";
    private static final String FUNCTIONS_FLASHCARDS_ID = "77259806-add7-5fcb-b89c-376e1b0c88d6";
    private static final String LEGACY_HIDDEN_CURRICULUM_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
    private static final String COMPATIBILITY_CURRICULUM_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private LearnerClientStateRepository learnerClientStateRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LandscapeService landscapeService;

    private String learnerId;

    @BeforeEach
    void setUp() {
        Learner learner = new Learner();
        learner.setSkillpilotId("test-learner");
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @AfterEach
    void tearDown() {
        learnerClientStateRepository.deleteAll();
        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();
    }

    @Test
    @Transactional
    void setPlannedGoals_isIdempotentForSameTargetSet() {
        selectCompletedCanonicalMathCurriculum();
        assertThatCode(() -> learnerService.setPlannedGoals(
                        learnerId,
                        Set.of(COMPOSITION_J8_SCOPE_ID)))
                .doesNotThrowAnyException();
        assertThatCode(() -> learnerService.setPlannedGoals(
                        learnerId,
                        Set.of(COMPOSITION_J8_SCOPE_ID)))
                .doesNotThrowAnyException();

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo(COMPOSITION_J8_SCOPE_ID);
    }

    @Test
    @Transactional
    void setPlannedGoals_updatesDiffWithoutDuplicates() {
        selectCompletedCanonicalMathCurriculum();
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(COMPOSITION_J8_SCOPE_ID, COMPOSITION_J9_SCOPE_ID));
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(COMPOSITION_J9_SCOPE_ID));

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo(COMPOSITION_J9_SCOPE_ID);
    }

    @Test
    @Transactional
    void setPlannedGoals_requiresABaseCurriculumForNonEmptyFocusButAllowsClearing() {
        assertThatThrownBy(() ->
                        learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));

        assertThat(learnerService.setPlannedGoals(learnerId, Set.of()))
                .isEmpty();
    }

    @Test
    void importLearnerPreservesCurriculumAndMasteryWhileDiscardingFocusFromIncompletePersonalization() {
        String sourceLearnerId = "legacy-export-source";
        String staleFocusId = "legacy-stale-focus";
        String masteryGoalId = "legacy-global-mastery";
        Learner sourceLearner = new Learner();
        sourceLearner.setSkillpilotId(sourceLearnerId);
        sourceLearner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        sourceLearner.setPersonalCurriculum("{}");
        learnerRepository.saveAndFlush(sourceLearner);
        plannedGoalRepository.saveAndFlush(new PlannedGoal(sourceLearner, staleFocusId));
        masteryRepository.saveAndFlush(new Mastery(sourceLearner, masteryGoalId, 0.625));

        assertThat(learnerService.getPlannedGoals(sourceLearnerId)).isEmpty();
        var signedExport = learnerService.exportLearner(sourceLearnerId);
        assertThat(signedExport.data().plannedGoals()).containsExactly(staleFocusId);

        assertThatCode(() -> learnerService.importLearner(learnerId, signedExport))
                .doesNotThrowAnyException();

        Learner importedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(importedLearner.getSelectedCurriculum())
                .isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(importedLearner.getPersonalCurriculum()).isEqualTo("{}");
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .isEmpty();
        assertThat(masteryRepository.findById(new MasteryId(learnerId, masteryGoalId)))
                .get()
                .extracting(Mastery::getValue)
                .isEqualTo(0.625);
    }

    @Test
    void computeEffectiveRequires_inheritsAlongContainsChain() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of("PREREQ_ROOT"), List.of("A")));
        goals.put("A", goal("A", List.of("PREREQ_A"), List.of("B")));
        goals.put("B", goal("B", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("ROOT")).containsExactly("PREREQ_ROOT");
        assertThat(effective.get("A")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
        assertThat(effective.get("B")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
    }

    @Test
    void computeEffectiveRequires_dropsSelfDependencyFromInherited() {
        Map<String, LearningGoal> goals = new HashMap<>();
        // Parent requires child; child would otherwise inherit itself
        goals.put("PARENT", goal("PARENT", List.of("CHILD"), List.of("CHILD")));
        goals.put("CHILD", goal("CHILD", List.of("LEAF_REQ"), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("CHILD")).containsExactlyInAnyOrder("LEAF_REQ");
    }

    @Test
    void computeEffectiveRequires_normalizesColonReferences() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("P", goal("P", List.of("X"), List.of("L1:CH")));
        goals.put("CH", goal("CH", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);
        assertThat(effective.get("CH")).contains("X");
    }

    @Test
    @Transactional
    void getLearnerState_returnsUpdateCurriculum_whenNoCurriculumSelected() {
        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.nextAllowedActions()).containsExactly("setCurriculum");
        assertThat(state.stateMachine().curriculumOptions())
                .extracting(option -> option.getCurriculumId())
                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                .doesNotContain(LEGACY_HIDDEN_CURRICULUM_ID, COMPATIBILITY_CURRICULUM_ID);
    }

    @Test
    @Transactional
    void setCurriculumFromPublicCatalogAcceptsTheCurrentPublishedRoot() {
        learnerService.setCurriculumFromPublicCatalog(learnerId, CANONICAL_GYMNASIUM_ROOT_ID);

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(learner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
    }

    @Test
    @Transactional
    void setCurriculumFromPublicCatalogRejectsCompatibilityAndLegacyHiddenRootsAsConflicts() {
        for (String unpublishedId : List.of(
                LEGACY_HIDDEN_CURRICULUM_ID,
                COMPATIBILITY_CURRICULUM_ID)) {
            assertThatThrownBy(() ->
                            learnerService.setCurriculumFromPublicCatalog(learnerId, unpublishedId))
                    .isInstanceOf(ResponseStatusException.class)
                    .satisfies(error -> assertThat(
                                    ((ResponseStatusException) error).getStatusCode())
                            .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        }

        assertThat(learnerRepository.findById(learnerId).orElseThrow().getSelectedCurriculum())
                .isNull();
    }

    @Test
    @Transactional
    void getLearnerState_returnsStandardActions_whenCurriculumSelected() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.save(learner);

        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactlyInAnyOrder(
                "setScope", "getFrontier");
    }

    @Test
    void patchPersonalCurriculumRejectsAStaleSelectionWithoutChangingCockpitConfiguration() throws Exception {
        String mathLandscapeId = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
        String physicsLandscapeId = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.patchPersonalCurriculum(
                        learnerId,
                        Map.of(),
                        List.of(),
                        List.of("DE-HE")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("stale");

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("ALL");
        assertThat(config.path(mathLandscapeId).path("filterId").asText()).isEqualTo("GK");
        assertThat(config.path(physicsLandscapeId).path("filterId").asText()).isEqualTo("GK");
    }

    @Test
    void patchPersonalCurriculumInitializesAnEmptyCanonicalRootForHessen() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(null);
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void patchPersonalCurriculumRejectsAStaleFilterForCompleteCockpitConfiguration() throws Exception {
        Map<String, Object> fullCockpitConfig = new LinkedHashMap<>();
        for (SkillLandscape landscape : landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID)) {
            Map<String, Object> settings = new LinkedHashMap<>();
            settings.put("selected", true);
            if (landscape.getFilters() != null && !landscape.getFilters().isEmpty()) {
                settings.put("filterId", landscape.getFilters().getFirst().getId());
            }
            fullCockpitConfig.put(landscape.getLandscapeId(), settings);
        }
        fullCockpitConfig.putIfAbsent(
                CANONICAL_GYMNASIUM_ROOT_ID,
                new LinkedHashMap<>(Map.of("selected", true)));

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(fullCockpitConfig));
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.patchPersonalCurriculum(
                        learnerId,
                        Map.of(),
                        List.of(),
                        List.of("DE-HE")))
                .isInstanceOf(ResponseStatusException.class);

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.size()).isEqualTo(fullCockpitConfig.size());
    }

    @Test
    void patchPersonalCurriculumAcceptsLegacyLandscapeConfigurationForHessen() throws Exception {
        String legacyConfiguration = """
                {
                  "24f2ca0f-b94a-444e-bb70-677cb6f85c02": {"selected": false},
                  "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da": {"selected": true},
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"},
                  "obsolete-landscape": {"selected": "true", "filterId": 17}
                }
                """;
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(legacyConfiguration);
        learner.setActiveGoalId("legacy-goal-that-no-longer-exists");
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(config.path("2796fc7b-ba9d-446f-8f26-711dd6d8a9a3").path("filterId").asText())
                .isEqualTo("LK");
        assertThat(updated.getActiveGoalId()).isNull();
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void patchPersonalCurriculumRecoversFromMalformedStoredConfigurationForHessen() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("{not-valid-json");
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of("DE-HE"));

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(state.activeFilters()).contains("DE-HE");
    }

    @Test
    void setPersonalCurriculumKeepsFullReplacementSemanticsForCockpitWrites() throws Exception {
        String obsoleteLandscapeId = "obsolete-landscape";
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "obsolete-landscape": {"selected": true, "filterId": "OLD"}
                }
                """);
        learnerRepository.saveAndFlush(learner);

        learnerService.setPersonalCurriculum(
                learnerId,
                Map.of(
                        CANONICAL_GYMNASIUM_ROOT_ID,
                        Map.of("selected", true, "filterId", "DE-HE")),
                null,
                null);

        Learner updated = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode config = objectMapper.readTree(updated.getPersonalCurriculum());
        assertThat(config.has(CANONICAL_GYMNASIUM_ROOT_ID)).isTrue();
        assertThat(config.has(obsoleteLandscapeId)).isFalse();
    }

    @Test
    @Transactional
    void getLearnerState_resolvesCompositionViewPlannedScopeForAiFrontier() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learnerRepository.save(learner);

        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().planned())
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.id()).isEqualTo(COMPOSITION_J8_SCOPE_ID);
                    assertThat(goal.title()).isEqualTo("Jahrgangsstufe 8");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
        assertThat(state.goals().scope()).isNotNull();
        assertThat(state.goals().scope().total_atomic()).isLessThan(state.goals().personalized().total_atomic());
        assertThat(state.frontier())
                .extracting(goal -> goal.title())
                .doesNotContain("Mathematik", "Physik");
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
    }

    @Test
    @Transactional
    void publishedCrossStageScopeOptionIsAcceptedByScopeWriteAndNavigation() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);

        var initialState = learnerService.getLearnerState(learnerId);

        assertThat(initialState.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(initialState.frontier())
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.id()).isEqualTo(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID);
                    assertThat(option.title()).isEqualTo("Mathematik");
                    assertThat(option.type()).isEqualTo("cluster");
                });
        assertThat(learnerService.getScopeNavigationOptions(learnerId))
                .extracting(FrontierGoal::id)
                .containsExactly(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID);

        assertThatCode(() -> learnerService.setScope(
                        learnerId,
                        List.of(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID)))
                .doesNotThrowAnyException();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID);
    }

    @Test
    @Transactional
    void initialScopePublishesOneWritableRootPerSelectedCompositionLandscape() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "ALL",
                    "stage": "CrossStage"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "LK"
                  },
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                    "selected": true,
                    "filterId": "LK"
                  }
                }
                """));
        learnerRepository.saveAndFlush(learner);

        var initialState = learnerService.getLearnerState(learnerId);

        assertThat(initialState.frontier())
                .extracting(FrontierGoal::id)
                .containsExactly(
                        COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID,
                        COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID);
        assertThatCode(() -> learnerService.setScope(
                        learnerId,
                        List.of(
                                COMPOSITION_DE_MATH_LK_ROOT_SCOPE_ID,
                                COMPOSITION_DE_PHYSICS_LK_ROOT_SCOPE_ID)))
                .doesNotThrowAnyException();
    }

    @Test
    @SuppressWarnings("unchecked")
    void initialScopeKeepsWritableTargetFallbackWhenCompositionHasNoViewId() throws Exception {
        LearningGoal spanishRoot = landscapeService.getById(CANONICAL_SPANISH_LANDSCAPE_ID)
                .getGoals()
                .stream()
                .filter(goal -> CANONICAL_SPANISH_ROOT_SCOPE_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        Map<String, LearningGoal> visibleGoals =
                Map.of(CANONICAL_SPANISH_ROOT_SCOPE_ID, spanishRoot);
        Class<?> projectionType = java.util.Arrays.stream(LearnerService.class.getDeclaredClasses())
                .filter(type -> "GoalProjection".equals(type.getSimpleName()))
                .findFirst()
                .orElseThrow();
        var constructor = projectionType.getDeclaredConstructor(
                Map.class,
                Set.class,
                Set.class,
                Map.class,
                Set.class,
                boolean.class);
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(
                visibleGoals,
                Set.of(CANONICAL_SPANISH_ROOT_SCOPE_ID),
                Set.of(),
                visibleGoals,
                Set.of(),
                true);

        List<FrontierGoal> options = (List<FrontierGoal>) ReflectionTestUtils.invokeMethod(
                learnerService,
                "getInitialScopeOptions",
                CANONICAL_GYMNASIUM_ROOT_ID,
                projection);

        assertThat(options)
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.id()).isEqualTo(CANONICAL_SPANISH_ROOT_SCOPE_ID);
                    assertThat(option.title()).isEqualTo("Spanisch");
                });
    }

    @Test
    @Transactional
    @SuppressWarnings("unchecked")
    void getFilteredGoals_appliesCanonicalDeCrossStageCompositionView() {
        Map<String, LearningGoal> filteredGoals = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                learnerService,
                "getFilteredGoals",
                CANONICAL_GYMNASIUM_ROOT_ID,
                """
                        {
                          "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                            "selected": true,
                            "filterId": "ALL",
                            "stage": "CrossStage"
                          },
                          "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                          "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                        }
                        """);

        assertThat(filteredGoals).isNotNull();
        assertThat(filteredGoals).containsKeys(VISIBLE_POLYNOMIAL_FUNCTIONS_ID, SEK1_EXERCISES_SCOPE_ID);
        assertThat(filteredGoals)
                .doesNotContainKeys(HIDDEN_TRIGONOMETRIC_EXPONENTIAL_CORRIDOR_ID, HIDDEN_POLYNOMIAL_END_BEHAVIOR_ID);
    }

    @Test
    @Transactional
    void getLearnerState_offersNextCompositionYearWhenCurrentYearScopeIsComplete() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        completeCurrentScope();

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .contains(COMPOSITION_J9_SCOPE_ID);
        assertThat(state.stateMachine().goalOptions())
                .filteredOn(goal -> COMPOSITION_J9_SCOPE_ID.equals(goal.id()))
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.title()).isEqualTo("Jahrgangsstufe 9");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
    }

    @Test
    @Transactional
    void getLearnerState_requiresMemoryModeChoiceForActiveFlashcardGoal() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.stateMachine().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThat(state.stateMachine().activeGoal()).isNotNull();
        assertThat(state.stateMachine().activeGoal().nodeKind()).isEqualTo("memory");
        assertThat(state.stateMachine().modeOptions())
                .extracting(option -> option.id())
                .containsExactly("practice", "verify");
        assertThat(state.stateMachine().modeOptions())
                .filteredOn(option -> "verify".equals(option.id()))
                .singleElement()
                .satisfies(option -> {
                    assertThat(option.action()).isEqualTo("startVerifiedRecall");
                    assertThat(option.target()).isEqualTo("gpt");
                    assertThat(option.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
                });
        assertThat(state.nextAllowedActions()).contains("chooseMemoryMode", "startVerifiedRecall");
        assertThat(state.nextAllowedActions()).doesNotContain("setMastery");
    }

    @Test
    @Transactional
    void verifiedRecallForSekOneFlashcardsStartsAndControlsSrsMastery() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        assertThat(learnerService.getMastery(learnerId).getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));

        assertThat(prompt.status()).isEqualTo("ready");
        assertThat(prompt.goalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(prompt.goalTitle()).isEqualTo("Lernkarten - Sek I Kernformeln");
        assertThat(prompt.totalCards()).isPositive();
        assertThat(prompt.verifiedCards()).isZero();
        assertThat(prompt.pendingCards()).isEqualTo(prompt.totalCards());
        assertThat(prompt.batchSize()).isEqualTo(1);
        assertThat(prompt.cards()).hasSize(1);
        assertThat(prompt.cardId()).isNotBlank();
        assertThat(prompt.prompt()).isNotBlank();

        com.skillpilot.backend.api.VerifiedRecallResultResponse finalResult = null;
        for (int i = 0; i < prompt.totalCards(); i++) {
            assertThat(prompt.cardId()).isNotBlank();
            var result = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, prompt.cardId(), true, "ok"));
            assertThat(result.passed()).isTrue();
            finalResult = result;
            prompt = result.next();
        }

        assertThat(finalResult).isNotNull();
        assertThat(finalResult.masterySaved()).isTrue();
        assertThat(finalResult.masteryGoalId()).isEqualTo(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(finalResult.instruction()).contains("Backend").contains("Mastery").contains("setMastery");
        assertThat(prompt.status()).isEqualTo("complete");
        assertThat(prompt.pendingCards()).isZero();
        assertThat(learnerService.getMastery(learnerId).get(SEK1_CORE_FORMULAS_FLASHCARDS_ID)).isEqualTo(1.0);
        assertThat(masteryRepository.findById(new MasteryId(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID)))
                .hasValueSatisfying(mastery -> assertThat(mastery.getValue()).isEqualTo(1.0));
        Learner updatedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(updatedLearner.getActiveGoalId()).isNull();
        assertThat(updatedLearner.getLearningState()).isEqualTo(LearningState.FRONTIER);
    }

    @Test
    @Transactional
    void verifiedRecallRejectsCardOutsideTheActiveMemoryGoalBeforeAnswerOrStateWrite() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(FUNCTIONS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID, FUNCTIONS_FLASHCARDS_ID));

        var foreignPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(FUNCTIONS_FLASHCARDS_ID, false));
        assertThat(foreignPrompt.goalId()).isEqualTo(FUNCTIONS_FLASHCARDS_ID);
        assertThat(foreignPrompt.cardId()).isNotBlank();

        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswer(
                        learnerId,
                        "de",
                        new VerifiedRecallAnswerRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                foreignPrompt.cardId())))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Card is not part of this memorization goal");
        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                        learnerId,
                        "de",
                        new VerifiedRecallResultRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                foreignPrompt.cardId(),
                                true,
                                "must not be stored")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Card is not part of this memorization goal");

        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerService.getMastery(learnerId)
                        .getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();
    }

    @Test
    @Transactional
    void verifiedRecallOperationsFailClosedWhenTheLockedActiveGoalHasChanged() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID, FUNCTIONS_FLASHCARDS_ID));
        var originalPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, false));

        learner.setActiveGoalId(FUNCTIONS_FLASHCARDS_ID);
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.startVerifiedRecall(
                        learnerId,
                        "de",
                        new VerifiedRecallStartRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, false)))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        assertThatThrownBy(() -> learnerService.getVerifiedRecallAnswer(
                        learnerId,
                        "de",
                        new VerifiedRecallAnswerRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                originalPrompt.cardId())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                        learnerId,
                        "de",
                        new VerifiedRecallResultRequest(
                                SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                originalPrompt.cardId(),
                                true,
                                "must not be stored")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));

        assertThat(learnerClientStateRepository.findAll()).isEmpty();
        assertThat(learnerService.getMastery(learnerId)
                        .getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();
    }

    @Test
    @Transactional
    void verifiedRecallStartCanReturnOptInBatchForNewClients() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 10));

        assertThat(prompt.status()).isEqualTo("ready");
        assertThat(prompt.batchSize()).isEqualTo(Math.min(10, prompt.totalCards()));
        assertThat(prompt.cards()).hasSize(prompt.batchSize());
        assertThat(prompt.cardId()).isEqualTo(prompt.cards().get(0).cardId());
        assertThat(prompt.prompt()).isEqualTo(prompt.cards().get(0).prompt());
        assertThat(prompt.cards())
                .extracting(VerifiedRecallPromptCard::cardId)
                .doesNotHaveDuplicates();
    }

    @Test
    void concurrentVerifiedRecallResultsPreserveBothCardUpdates() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));
        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 2));
        assertThat(prompt.cards()).hasSize(2);

        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            var results = prompt.cards().stream()
                    .map(card -> executor.submit(() -> {
                        ready.countDown();
                        assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                        return learnerService.recordVerifiedRecallResult(
                                learnerId,
                                "de",
                                new VerifiedRecallResultRequest(
                                        SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                                        card.cardId(),
                                        true,
                                        "parallel verified"));
                    }))
                    .toList();
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            for (Future<?> result : results) {
                assertThat(result.get(20, TimeUnit.SECONDS)).isNotNull();
            }
        } finally {
            executor.shutdownNow();
        }

        var restarted = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false, 2));
        assertThat(restarted.verifiedCards()).isEqualTo(2);
    }

    @Test
    void concurrentScopeReplacementNeverMergesTwoExclusiveSelections() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.saveAndFlush(learner);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        try {
            Future<?> first = executor.submit(() -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                learnerService.setScope(learnerId, List.of(COMPOSITION_J8_SCOPE_ID));
                return null;
            });
            Future<?> second = executor.submit(() -> {
                ready.countDown();
                assertThat(start.await(10, TimeUnit.SECONDS)).isTrue();
                learnerService.setScope(learnerId, List.of(COMPOSITION_J9_SCOPE_ID));
                return null;
            });
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            first.get(20, TimeUnit.SECONDS);
            second.get(20, TimeUnit.SECONDS);
        } finally {
            executor.shutdownNow();
        }

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .extracting(planned -> planned.getGoalId())
                .singleElement()
                .isIn(COMPOSITION_J8_SCOPE_ID, COMPOSITION_J9_SCOPE_ID);
    }

    @Test
    @Transactional
    void verifiedRecallFailureLocksCardForRestOfDay() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var firstPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));
        String failedCardId = firstPrompt.cardId();

        var failedResult = learnerService.recordVerifiedRecallResult(
                learnerId,
                "de",
                new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, failedCardId, false, "nicht gewusst"));

        assertThat(failedResult.passed()).isFalse();
        assertThat(failedResult.next().status()).isEqualTo("ready");
        assertThat(failedResult.next().cardId()).isNotEqualTo(failedCardId);
        assertThat(failedResult.next().blockedCards()).isEqualTo(1);
        assertThat(failedResult.next().nextEligibleAt()).isNotBlank();
        assertThat(Instant.parse(failedResult.next().nextEligibleAt())).isAfter(Instant.now());
        assertThat(learnerService.getMastery(learnerId).getOrDefault(SEK1_CORE_FORMULAS_FLASHCARDS_ID, 0.0))
                .isZero();

        assertThatThrownBy(() -> learnerService.recordVerifiedRecallResult(
                learnerId,
                "de",
                new VerifiedRecallResultRequest(SEK1_CORE_FORMULAS_FLASHCARDS_ID, failedCardId, true, "zweiter Versuch")))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already been tested today");

        var restartedPrompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));

        assertThat(restartedPrompt.status()).isEqualTo("ready");
        assertThat(restartedPrompt.cardId()).isNotEqualTo(failedCardId);
        assertThat(restartedPrompt.blockedCards()).isEqualTo(1);
        assertThat(restartedPrompt.pendingCards()).isEqualTo(restartedPrompt.totalCards());
    }

    @Test
    @Transactional
    void getLearnerStateDoesNotOfferFlashcardGoalWhenNoCardsAreEligibleToday() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """));
        learner.setActiveGoalId(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(
                learnerId,
                Set.of(SEK1_CORE_FORMULAS_FLASHCARDS_ID));

        var prompt = learnerService.startVerifiedRecall(
                learnerId,
                "de",
                new VerifiedRecallStartRequest(null, false));
        boolean failedOneCard = false;
        while ("ready".equals(prompt.status())) {
            boolean passed = failedOneCard;
            var result = learnerService.recordVerifiedRecallResult(
                    learnerId,
                    "de",
                    new VerifiedRecallResultRequest(
                            SEK1_CORE_FORMULAS_FLASHCARDS_ID,
                            prompt.cardId(),
                            passed,
                            passed ? "ok" : "nicht gewusst"));
            failedOneCard = true;
            prompt = result.next();
        }

        assertThat(failedOneCard).isTrue();
        assertThat(prompt.status()).isEqualTo("waiting");
        assertThat(prompt.eligibleCards()).isZero();
        assertThat(prompt.blockedCards()).isPositive();

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.activeGoal()).isNull();
        assertThat(state.stateMachine().activeGoal()).isNull();
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("chooseMemoryMode");
        assertThat(state.nextAllowedActions()).doesNotContain("chooseMemoryMode", "startVerifiedRecall");
        assertThat(state.frontier())
                .extracting(goal -> goal.id())
                .doesNotContain(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .doesNotContain(SEK1_CORE_FORMULAS_FLASHCARDS_ID);
        assertThatThrownBy(() -> learnerService.setActiveGoal(learnerId, SEK1_CORE_FORMULAS_FLASHCARDS_ID))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("goalId must be an atomic goal from the current frontier");
    }

    @Test
    @Transactional
    void getLearnerState_doesNotOfferSeparateSekOneCapstoneAfterFinalCompositionYearScopeIsComplete() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
                }
                """));
        learnerRepository.save(learner);
        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J10_SCOPE_ID));

        completeCurrentScope(200);

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.id())
                .doesNotContain(REMOVED_SEK1_CAPSTONE_ID);
        assertThat(state.stateMachine().goalOptions())
                .extracting(goal -> goal.title())
                .doesNotContain("Sek-I-Abschlussaufgaben Mathematik");
    }

    @Test
    void sequentialAutopilot_prefersNextLocalExamSiblingOverGlobalFrontierOrder() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of(), List.of("J5_EXAMS", "SEK2")));
        goals.put("J5_EXAMS", goal("J5_EXAMS", List.of(), List.of("J5_TASK_1", "J5_TASK_2", "J5_TASK_3")));
        goals.put("J5_TASK_1", goal("J5_TASK_1", List.of(), List.of()));
        goals.put("J5_TASK_2", goal("J5_TASK_2", List.of(), List.of()));
        goals.put("J5_TASK_3", goal("J5_TASK_3", List.of(), List.of()));
        goals.put("SEK2", goal("SEK2", List.of(), List.of("SEK2_TASK")));
        goals.put("SEK2_TASK", goal("SEK2_TASK", List.of(), List.of()));

        List<FrontierGoal> globalFrontierOrder = List.of(
                frontierGoal("SEK2_TASK"),
                frontierGoal("J5_TASK_2"),
                frontierGoal("J5_TASK_3"));

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "findSequentialLocalFrontierGoal",
                "J5_TASK_1",
                globalFrontierOrder,
                goals);

        assertThat(selected).isNotNull();
        assertThat(selected.id()).isEqualTo("J5_TASK_2");
    }

    @Test
    void sequentialAutopilot_doesNotFallBackToGlobalFrontierAfterLocalExamTask() {
        Learner learner = new Learner();
        learner.setLearningStrategy("SEQUENTIAL");
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of(), List.of("J5_EXAMS", "SEK2")));
        goals.put("J5_EXAMS", goal("J5_EXAMS", List.of(), List.of("J5_TASK_1", "J5_TASK_2")));
        goals.put("J5_TASK_1", goal("J5_TASK_1", List.of(), List.of()));
        goals.put("J5_TASK_2", goal("J5_TASK_2", List.of(), List.of()));
        goals.put("SEK2", goal("SEK2", List.of(), List.of("SEK2_TASK")));
        goals.put("SEK2_TASK", goal("SEK2_TASK", List.of(), List.of()));

        FrontierGoal selected = ReflectionTestUtils.invokeMethod(
                learnerService,
                "chooseAutopilotFrontierGoal",
                learner,
                List.of(frontierGoal("SEK2_TASK")),
                List.of(frontierGoal("SEK2_TASK")),
                "J5_TASK_1",
                goals);

        assertThat(selected).isNull();
    }

    private void completeCurrentScope() {
        completeCurrentScope(50);
    }

    private void completeCurrentScope(int maxIterations) {
        for (int iteration = 0; iteration < maxIterations; iteration += 1) {
            var state = learnerService.getLearnerState(learnerId);
            if (Boolean.TRUE.equals(state.goals().scope_completed())) {
                return;
            }
            var nextGoal = state.frontier().stream()
                    .filter(goal -> "atomic".equals(goal.type()))
                    .findFirst()
                    .orElseThrow(() -> new AssertionError("Expected an atomic frontier goal before scope completion."));
            learnerService.setMastery(
                    learnerId,
                    new MasteryUpdateRequest(Map.of(nextGoal.id(), 1.0), nextGoal.id()));
        }
        throw new AssertionError("Scope did not complete within " + maxIterations + " mastery updates.");
    }

    private void selectCompletedCanonicalMathCurriculum() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "stage": "CrossStage",
                    "durationModel": "G9"
                  },
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {
                    "selected": true,
                    "filterId": "GK"
                  }
                }
                """));
        learnerRepository.save(learner);
    }

    @SuppressWarnings("unchecked")
    private String completedPersonalizationConfig(String json) {
        try {
            Map<String, Object> config = objectMapper.readValue(json, Map.class);
            Map<String, Object> rootConfig = config.get(CANONICAL_GYMNASIUM_ROOT_ID) instanceof Map<?, ?> rawRoot
                    ? new LinkedHashMap<>((Map<String, Object>) rawRoot)
                    : new LinkedHashMap<>();
            rootConfig.putIfAbsent("selected", true);
            rootConfig.putIfAbsent("stage", "CrossStage");
            rootConfig.putIfAbsent("durationModel", "G9");
            config.put(CANONICAL_GYMNASIUM_ROOT_ID, rootConfig);
            Map<String, Object> flowState = new LinkedHashMap<>();
            flowState.put(
                    CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                    CANONICAL_GYMNASIUM_ROOT_ID);
            flowState.put(
                    CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                    List.of());
            flowState.put(
                    CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                    true);
            config.put(
                    CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                    flowState);
            return objectMapper.writeValueAsString(config);
        } catch (Exception exception) {
            throw new AssertionError("Invalid test personalization fixture", exception);
        }
    }

    private static LearningGoal goal(String id, List<String> requires, List<String> contains) {
        LearningGoal g = new LearningGoal();
        g.setId(id);
        g.setRequires(requires == null ? List.of() : new ArrayList<>(requires));
        g.setContains(contains == null ? List.of() : new ArrayList<>(contains));
        return g;
    }

    private static FrontierGoal frontierGoal(String id) {
        return new FrontierGoal(id, id, "", "atomic", "exam", "Prerequisites met",
                List.of(), List.of(), null, null, null, null);
    }
}
