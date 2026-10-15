package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PrerequisiteBlocker;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ReleaseMetadata;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class ProjectionRoleLearnerServiceTest {

    private static final String LANDSCAPE_ID = "projection-roles";
    private static final String LEARNER_ID = "projection-role-learner";
    private static final String TARGET_ID = "sek2-target";
    private static final String PREREQUISITE_ID = "sek1-bridge";
    private static final String TRANSITIVE_PREREQUISITE_ID = "sek1-deep";
    private static final String EXTERNAL_PREREQUISITE_ID = "external-sek1-bridge";
    private static final String EXTERNAL_PREREQUISITE_ROOT_ID = "external-sek1-root";
    private static final String EXTERNAL_PREREQUISITE_CHILD_ID = "external-sek1-child";
    private static final String ROOT_CLUSTER_ID = "projection-root";
    private static final String NESTED_CLUSTER_ID = "projection-nested";
    private static final String OUTSIDE_TARGET_ID = "outside-target";
    private static final String PHYSICS_ORIENTATION_ID = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
    private static final String OBSERVATION_ID = "5355fee0-0477-5570-a234-561477bf77ba";
    private static final String SI_UNITS_ID = "3ed3279e-c524-5230-a277-dda89493df6d";
    private static final String MODELS_ID = "e5bc2227-d900-585f-8ac0-9d3f1cb40e27";
    private static final String SOURCE_CRITIQUE_ID = "d2e6f87d-795b-5631-a7cc-0bfb5dc5142e";
    private static final String SOLAR_SYSTEM_CLASSIFICATION_ID = "982df2f3-e040-5f4b-b668-0fe05d994b29";
    private static final String OPEN_COSMOLOGICAL_QUESTIONS_ID = "6ae54ff9-dc3b-563b-b2ee-09a0f0d00162";
    private static final List<String> PHYSICS_METHOD_IDS =
            List.of(OBSERVATION_ID, SI_UNITS_ID, MODELS_ID, SOURCE_CRITIQUE_ID);
    private static final List<String> MASTERED_PHYSICS_CONTEXT_IDS = List.of(
            PHYSICS_ORIENTATION_ID,
            "af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93", // Aufbau des Sonnensystems
            "c52d55c3-b687-586c-b0f9-8ffcd1069424"); // Urknallmodell
    private static final String GLOBAL_ASSESSMENT_ROOT_ID = "global-assessment-root";
    private static final String GLOBAL_ASSESSMENT_EXAM_ID = "global-assessment-exam";
    private static final String SYNTHETIC_STRUCTURE_ID =
            "composition:projection-role-test:structure:sek2";
    private static final String PERSONAL_CURRICULUM = """
            {
              "projection-roles": {
                "selected": true,
                "filterId": "LK"
              }
            }
            """;

    @Test
    void exactEligibilityWithoutAuthoredTargetStaysSupportUntilPrimaryPlacementAuthorizesIt() throws Exception {
        Fixture fixture = fixture(null);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(false);
        LearningGoal target = exactScopeTarget(fixture, "G9");
        String config = exactScopeConfig(true);

        for (boolean ignoreCourseFilters : List.of(false, true)) {
            assertThat(fixture.service().getFilteredAtomicGoalIds(LANDSCAPE_ID, config, null, ignoreCourseFilters))
                    .contains(OUTSIDE_TARGET_ID) // Absent-field legacy fallback remains unchanged.
                    .doesNotContain(TARGET_ID);
        }
        assertThat(projectionSets(fixture.service(), config).structuralGoalIds()).contains(TARGET_ID);
        assertThat(target.getRequires()).contains(PREREQUISITE_ID); // Neither contains nor requires enrolls it.

        ProgramUnit unit = new ProgramUnit();
        unit.setId("exact-scope-year");
        unit.setKind("year");
        unit.setLabel("Reviewed placement");
        GoalPlacement placement = new GoalPlacement();
        placement.setGoalId(TARGET_ID);
        placement.setUnitId(unit.getId());
        placement.setRelation("primary");
        placement.setContext(Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                "stage", "SekII", "durationModel", "G9", "courseProfile", "GK"));
        fixture.landscape().setProgramUnits(List.of(unit));
        fixture.landscape().setGoalPlacements(List.of(placement));
        assertThat(fixture.service().getFilteredAtomicGoalIds(LANDSCAPE_ID, config, null, false)).contains(TARGET_ID);
        placement.setRelation("secondary");
        assertThat(fixture.service().getFilteredAtomicGoalIds(LANDSCAPE_ID, config, null, false)).doesNotContain(TARGET_ID);
        assertThat(fixture.savedGoals()).isEmpty();
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
    }

    @Test
    void selectedLandscapeAndNamespacedSubtreeReferencesAuthorizeTheirExactTargets() throws Exception {
        for (Map<String, Object> reference : List.of(
                Map.<String, Object>of("kind", "landscapeEntry", "landscapeId", LANDSCAPE_ID),
                canonicalSubtree(LANDSCAPE_ID + ":" + NESTED_CLUSTER_ID))) {
            Map<String, Object> selected = new LinkedHashMap<>(view(reference));
            selected.put("scope", exactScopeContext("G9"));
            Fixture fixture = fixture(selected);
            exactScopeTarget(fixture, "G9");
            assertThat(fixture.service().getFilteredAtomicGoalIds(
                    LANDSCAPE_ID, exactScopeConfig(true), null, false)).contains(TARGET_ID);
        }
    }

    @Test
    void selectedTargetCannotConvertMissingDurationIntoAnExplicitNoneContext() throws Exception {
        Map<String, Object> selected = new LinkedHashMap<>(view(goalEntry(TARGET_ID)));
        Map<String, Object> unresolvedScope = exactScopeContext(null);
        unresolvedScope.remove("durationModel");
        selected.put("scope", unresolvedScope);
        Fixture fixture = fixture(selected);
        exactScopeTarget(fixture, null); // Literal null is resolved none, never a missing-choice wildcard.

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                LANDSCAPE_ID, exactScopeConfig(false), null, false)).doesNotContain(TARGET_ID);
        assertThat(projectionSets(fixture.service(), exactScopeConfig(false)).structuralGoalIds()).contains(TARGET_ID);
    }

    private LearningGoal exactScopeTarget(Fixture fixture, String duration) {
        LearningGoal target = fixture.landscape().getGoals().stream()
                .filter(goal -> TARGET_ID.equals(goal.getId())).findFirst().orElseThrow();
        target.setExtendedData(Map.of("applicabilityContexts", List.of(exactScopeContext(duration))));
        return target;
    }

    private Map<String, Object> exactScopeContext(String duration) {
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("schoolForm", "Gymnasium");
        context.put("jurisdiction", "DE-HE");
        context.put("stage", "SekII");
        context.put("durationModel", duration);
        context.put("courseProfile", "GK");
        return context;
    }

    private String exactScopeConfig(boolean durationSelected) throws Exception {
        Map<String, Object> root = new LinkedHashMap<>(Map.of(
                "selected", true, "filterId", "DE-HE", "stage", "SekII"));
        if (durationSelected) root.put("durationModel", "G9");
        return new ObjectMapper().writeValueAsString(Map.of(
                "a0e13c56-c25f-4742-9272-3a1a603ee52e", root,
                LANDSCAPE_ID, Map.of("selected", true, "filterId", "GK")));
    }

    @Test
    void stalledExternalSupportIsExplainedWithoutChangingLearnerStateOrCoachLevelTwoAuthority() throws Exception {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        LearningGoal prerequisite = fixture.landscape().getGoals().stream()
                .filter(goal -> PREREQUISITE_ID.equals(goal.getId())).findFirst().orElseThrow();
        prerequisite.setTitle("Werte ablesen");
        prerequisite.setTitleEn("Read values");
        String initialConfig = fixture.learner().getPersonalCurriculum();

        var state = fixture.service().getCoachLearnerState(LEARNER_ID);

        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("getFrontier");
        assertThat(state.goals().scope_completed()).isFalse();
        assertThat(state.goals().total_count()).isEqualTo(1);
        assertThat(state.stateMachine().goalOptions()).isEmpty();
        assertThat(state.stateMachine().prerequisiteBlockers()).containsExactly(new PrerequisiteBlocker(
                TARGET_ID, TARGET_ID, null, PREREQUISITE_ID, "Werte ablesen", "Read values",
                "EXTERNAL_PREREQUISITE_UNMASTERED", "OPEN_PERSONAL_CURRICULUM"));
        assertThat(fixture.learner().getPersonalCurriculum()).isEqualTo(initialConfig);
        assertThat(fixture.learner().getActiveGoalId()).isNull();
        assertThat(fixture.savedGoals()).isEmpty();
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.plannedGoalRepository(), never()).saveAll(any());
        var projected = new CoachStateProjection("https://skillpilot.com").project(state);
        assertThat(projected.stateMachine().prerequisiteBlockers()).singleElement()
                .satisfies(blocker -> {
                    assertThat(blocker.reason()).isEqualTo("EXTERNAL_PREREQUISITE_UNMASTERED");
                    assertThat(blocker.remediation()).isNull();
                });
        assertThat(new ObjectMapper().writeValueAsString(projected))
                .doesNotContain(LEARNER_ID, "OPEN_PERSONAL_CURRICULUM", "personalCurriculum");

        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
        assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers()).isEmpty();
    }

    @Test
    void unknownDirectReferenceFailsClosedInBothCompositionFrontiersWithoutEchoingRawReference() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of("unknown-reference-private-looking-text"));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers())
                    .containsExactly(new PrerequisiteBlocker(TARGET_ID, TARGET_ID, null,
                            null, null, null, "UNKNOWN_PREREQUISITE", null));
        }
    }

    @Test
    void knownUnprojectedRequirementStaysBlockedEvenWithSavedMasteryAndOffersNoLearnerRepair() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers())
                    .singleElement().satisfies(blocker -> {
                        assertThat(blocker.prerequisiteId()).isEqualTo(PREREQUISITE_ID);
                        assertThat(blocker.reason()).isEqualTo("PREREQUISITE_NOT_PROJECTED");
                        assertThat(blocker.remediation()).isNull();
                    });
        }
    }

    @Test
    void legacyUnknownReferenceRetainsOptimisticModeButBothStrictFrontiersBlock() {
        Fixture fixture = fixture(null);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(false);
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of("legacy-unresolved"));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).contains(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).contains(TARGET_ID);
        fixture.learner().setStrictMode(true);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).doesNotContain(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).doesNotContain(TARGET_ID);
    }

    @Test
    void knownExternalDefinitionCanExplainMissingProjectionButCannotAuthorizeSupport() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of(EXTERNAL_PREREQUISITE_ID));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), EXTERNAL_PREREQUISITE_ID, 1.0)));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers())
                .singleElement().satisfies(blocker -> {
                    assertThat(blocker.reason()).isEqualTo("PREREQUISITE_NOT_PROJECTED");
                    assertThat(blocker.prerequisiteId()).isEqualTo(EXTERNAL_PREREQUISITE_ID);
                    assertThat(blocker.remediation()).isNull();
                });
        assertThat(projectionSets(fixture.service()).structuralGoalIds()).doesNotContain(EXTERNAL_PREREQUISITE_ID);
        assertThat(projectionSets(fixture.service()).prerequisiteOnlyGoalIds()).isEmpty();
    }

    @Test
    void manualOrImportedDependentMasteryDoesNotCreateTransitiveMasteryOrRequirements() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID, "prerequisiteOnly"),
                goalEntry(TRANSITIVE_PREREQUISITE_ID, "prerequisiteOnly")));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));
        assertThat(fixture.service().getMastery(LEARNER_ID).getOrDefault(TRANSITIVE_PREREQUISITE_ID, 0.0)).isZero();
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
        assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers()).isEmpty();

        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID));
        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers())
                .singleElement().satisfies(blocker -> assertThat(blocker.prerequisiteId()).isEqualTo(TRANSITIVE_PREREQUISITE_ID));
    }

    @Test
    void blockerFactsAreSortedDeduplicatedAndBounded() {
        List<String> supportIds = new ArrayList<>();
        List<Map<String, Object>> references = new ArrayList<>();
        references.add(goalEntry(TARGET_ID));
        for (int index = 24; index >= 0; index--) {
            String id = "external-" + String.format("%02d", index);
            supportIds.add(id);
            references.add(goalEntry(id, "prerequisiteOnly"));
        }
        Fixture fixture = fixture(view(references.toArray(Map[]::new)));
        for (String id : supportIds) {
            LearningGoal support = atomicGoal(id, List.of());
            support.setTitle("x".repeat(300));
            when(fixture.landscapeService().getGoalDefinition(id)).thenReturn(support);
        }
        supportIds.add(supportIds.getFirst());
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(supportIds);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        var blockers = fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers();
        assertThat(blockers).hasSize(20);
        assertThat(blockers).extracting(PrerequisiteBlocker::prerequisiteId).isSorted().doesNotHaveDuplicates();
        assertThat(blockers.getFirst().prerequisiteTitle()).hasSize(240);
        assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers()).isEqualTo(blockers);
    }

    @Test
    void blockerReadDoesNotInterruptActiveLearningOrReopenMasteredTargets() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        fixture.learner().setActiveGoalId(TARGET_ID);
        var active = fixture.service().getCoachLearnerState(LEARNER_ID);
        assertThat(active.activeGoal().id()).isEqualTo(TARGET_ID);
        assertThat(active.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(active.stateMachine().prerequisiteBlockers()).isEmpty();

        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), TARGET_ID, 1.0)));
        var mastered = fixture.service().getCoachLearnerState(LEARNER_ID);
        assertThat(mastered.activeGoal()).isNull();
        assertThat(mastered.goals().scope_completed()).isTrue();
        assertThat(mastered.stateMachine().prerequisiteBlockers()).isEmpty();
        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(TARGET_ID);
        assertThat(fixture.service().getMastery(LEARNER_ID).getOrDefault(PREREQUISITE_ID, 0.0)).isZero();
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.plannedGoalRepository(), never()).saveAll(any());
    }

    @Test
    void independentTargetPrerequisiteOutsideCurrentFocusBlocksBothModesWithoutBroadeningFocus() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(OUTSIDE_TARGET_ID)));
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of(OUTSIDE_TARGET_ID));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));
        String initialConfig = fixture.learner().getPersonalCurriculum();
        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
            var state = fixture.service().getCoachLearnerState(LEARNER_ID);
            assertThat(state.stateMachine().requiredAction()).isEqualTo("getFrontier");
            assertThat(state.stateMachine().goalOptions()).isEmpty();
            assertThat(state.stateMachine().prerequisiteBlockers()).containsExactly(new PrerequisiteBlocker(
                    TARGET_ID, TARGET_ID, null, OUTSIDE_TARGET_ID, OUTSIDE_TARGET_ID, null,
                    "PREREQUISITE_OUTSIDE_FOCUS", "REVIEW_FOCUS"));
            assertThat(state.goals().planned()).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
            assertThat(state.goals().total_count()).isEqualTo(1);
            assertThat(state.goals().personalized().total_atomic()).isEqualTo(2);
            assertThat(state.goals().scope_completed()).isFalse();
            assertThat(fixture.service().getUncompactedRichFrontierForFocus(LEARNER_ID,
                    List.of(TARGET_ID, OUTSIDE_TARGET_ID))).extracting(FrontierGoal::id).containsExactly(OUTSIDE_TARGET_ID);
            var coach = new CoachStateProjection("https://skillpilot.com").project(state);
            assertThat(coach.stateMachine().prerequisiteBlockers()).singleElement().satisfies(blocker -> {
                assertThat(blocker.reason()).isEqualTo("PREREQUISITE_OUTSIDE_FOCUS");
                assertThat(blocker.remediation()).isNull();
            });
        }
        assertThat(fixture.learner().getPersonalCurriculum()).isEqualTo(initialConfig);
        assertThat(fixture.learner().getActiveGoalId()).isNull();
        assertThat(fixture.savedGoals()).isEmpty();
        verify(fixture.plannedGoalRepository(), never()).saveAll(any());
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), OUTSIDE_TARGET_ID, 1.0)));
        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
            assertThat(fixture.service().getCoachLearnerState(LEARNER_ID).stateMachine().prerequisiteBlockers()).isEmpty();
        }
    }

    @Test
    void inheritedTargetPrerequisiteOutsideFocusBlocksBothModesInAuthoredView() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID)));
        fixture.landscape().getGoals().stream().filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of());
        fixture.landscape().getGoals().stream().filter(goal -> NESTED_CLUSTER_ID.equals(goal.getId()))
                .findFirst().orElseThrow().setRequires(List.of(OUTSIDE_TARGET_ID));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).isEmpty();
            var state = fixture.service().getCoachLearnerState(LEARNER_ID);
            assertThat(state.stateMachine().prerequisiteBlockers()).containsExactly(new PrerequisiteBlocker(
                    TARGET_ID, TARGET_ID, null, OUTSIDE_TARGET_ID, OUTSIDE_TARGET_ID, null,
                    "PREREQUISITE_OUTSIDE_FOCUS", "REVIEW_FOCUS"));
            assertThat(state.goals().planned()).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
            assertThat(state.goals().scope_completed()).isFalse();
        }
        verify(fixture.plannedGoalRepository(), never()).saveAll(any());
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));

        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), OUTSIDE_TARGET_ID, 1.0)));
        for (boolean strict : List.of(false, true)) {
            fixture.learner().setStrictMode(strict);
            assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
            assertThat(fixture.service().getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(TARGET_ID);
        }
    }

    @Test
    void missingRoleDefaultsToTargetAndPrerequisiteOnlyIsNotTargetOrTransitivelyInferred() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactly(TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).containsExactly(PREREQUISITE_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .doesNotContain(TRANSITIVE_PREREQUISITE_ID);
    }

    @Test
    void externalPrerequisiteOnlyGoalEntryHydratesExactlyOneStructuralGoal() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID, "prerequisiteOnly")));
        LearningGoal externalPrerequisite = atomicGoal(
                EXTERNAL_PREREQUISITE_ID,
                List.of());
        LearningGoal externalChild = atomicGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of());
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(externalPrerequisite);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_CHILD_ID))
                .thenReturn(externalChild);
        fixture.landscape().getGoals().stream()
                .filter(goal -> TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow()
                .setRequires(List.of(EXTERNAL_PREREQUISITE_ID));
        Mastery externalMastery = new Mastery(
                fixture.learner(),
                EXTERNAL_PREREQUISITE_ID,
                1.0);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of())
                .thenReturn(List.of(externalMastery));

        ProjectionSets projection = projectionSets(fixture.service());

        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .containsExactly(EXTERNAL_PREREQUISITE_ID);
        assertThat(projection.structuralGoalIds())
                .contains(EXTERNAL_PREREQUISITE_ID)
                .doesNotContain(EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.visibleGoalIds())
                .doesNotContain(
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);
    }

    @Test
    void externalPrerequisiteOnlyCanonicalSubtreeHydratesAllStructuralDescendants() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                canonicalSubtree(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
        LearningGoal externalRoot = clusterGoal(
                EXTERNAL_PREREQUISITE_ROOT_ID,
                List.of(EXTERNAL_PREREQUISITE_ID));
        LearningGoal externalPrerequisite = clusterGoal(
                EXTERNAL_PREREQUISITE_ID,
                List.of(EXTERNAL_PREREQUISITE_CHILD_ID));
        LearningGoal externalChild = atomicGoal(EXTERNAL_PREREQUISITE_CHILD_ID, List.of());
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ROOT_ID))
                .thenReturn(externalRoot);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(externalPrerequisite);
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_CHILD_ID))
                .thenReturn(externalChild);

        ProjectionSets projection = projectionSets(fixture.service());

        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.structuralGoalIds())
                .contains(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
        assertThat(projection.visibleGoalIds())
                .doesNotContain(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        EXTERNAL_PREREQUISITE_ID,
                        EXTERNAL_PREREQUISITE_CHILD_ID);
    }

    @Test
    void unknownExternalPrerequisiteOnlyReferenceMakesProjectionInvalid() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry("unknown-external-prerequisite", "prerequisiteOnly")));

        assertThatThrownBy(() -> projectionSets(fixture.service()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid prerequisiteOnly composition reference")
                .hasMessageContaining("unknown-external-prerequisite")
                .hasMessageContaining("does not resolve");
    }

    @Test
    void externalPrerequisiteOnlyClusterGoalEntryMakesProjectionInvalid() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ROOT_ID, "prerequisiteOnly")));
        when(fixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ROOT_ID))
                .thenReturn(clusterGoal(
                        EXTERNAL_PREREQUISITE_ROOT_ID,
                        List.of(EXTERNAL_PREREQUISITE_CHILD_ID)));

        assertThatThrownBy(() -> projectionSets(fixture.service()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid prerequisiteOnly composition reference")
                .hasMessageContaining(EXTERNAL_PREREQUISITE_ROOT_ID)
                .hasMessageContaining("goalEntry must reference an atomic goal");
    }

    @Test
    void externalTargetOrMixedRoleReferenceDoesNotHydrateStructuralGoals() {
        Fixture targetFixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID)));
        when(targetFixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));

        Fixture mixedRoleFixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID),
                goalEntry(EXTERNAL_PREREQUISITE_ID, "prerequisiteOnly")));
        when(mixedRoleFixture.landscapeService().getGoalDefinition(EXTERNAL_PREREQUISITE_ID))
                .thenReturn(atomicGoal(EXTERNAL_PREREQUISITE_ID, List.of()));

        for (ProjectionSets projection : List.of(
                projectionSets(targetFixture.service()),
                projectionSets(mixedRoleFixture.service()))) {
            assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
            assertThat(projection.prerequisiteOnlyGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
            assertThat(projection.structuralGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
            assertThat(projection.visibleGoalIds())
                    .doesNotContain(EXTERNAL_PREREQUISITE_ID);
        }
    }

    @Test
    void explicitPrerequisiteOnlyGoalBlocksAndReleasesTargetUsingGlobalMastery() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        Mastery prerequisiteMastery = new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0);
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of())
                .thenReturn(List.of(prerequisiteMastery))
                .thenReturn(List.of(prerequisiteMastery));

        assertThat(fixture.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getFrontier(LEARNER_ID)).containsExactly(TARGET_ID);

        assertThat(fixture.service().getMastery(LEARNER_ID))
                .containsEntry(PREREQUISITE_ID, 1.0);
        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);
    }

    @Test
    void explicitPhysicsMethodTargetsUnlockAstronomyOnlyAfterEachPrerequisiteIsMastered() throws Exception {
        Fixture fixture = physicsSourceRouteFixture("target");

        assertPhysicsSourceRouteFrontier(fixture, Set.of(), OBSERVATION_ID, SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID), MODELS_ID, SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID, MODELS_ID), SI_UNITS_ID);
        assertPhysicsSourceRouteFrontier(
                fixture, Set.of(OBSERVATION_ID, MODELS_ID, SI_UNITS_ID), SOURCE_CRITIQUE_ID);
        assertPhysicsSourceRouteFrontier(
                fixture, Set.copyOf(PHYSICS_METHOD_IDS),
                SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
    }

    @Test
    void omittedOrPrerequisiteOnlyPhysicsMethodsDoNotProvideALearnableAstronomyRoute() throws Exception {
        for (String methodRole : List.of("omitted", "prerequisiteOnly")) {
            Fixture fixture = physicsSourceRouteFixture(methodRole);

            assertThat(fixture.service().getFilteredAtomicGoalIds(
                            LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                    .containsExactlyInAnyOrder(
                            SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
            assertPhysicsSourceRouteFrontier(fixture, Set.of());
            assertPhysicsSourceRouteFrontier(fixture, Set.of(OBSERVATION_ID, MODELS_ID, SI_UNITS_ID));

            if ("prerequisiteOnly".equals(methodRole)) {
                assertPhysicsSourceRouteFrontier(
                        fixture, Set.copyOf(PHYSICS_METHOD_IDS),
                        SOLAR_SYSTEM_CLASSIFICATION_ID, OPEN_COSMOLOGICAL_QUESTIONS_ID);
            } else {
                assertPhysicsSourceRouteFrontier(fixture, Set.copyOf(PHYSICS_METHOD_IDS));
            }
        }
    }

    @Test
    void omittedDirectPrerequisiteFailsClosedButOmittedInheritedCompatibilityPrerequisiteDoesNotBlock() {
        Fixture directRequirement = fixture(view(goalEntry(TARGET_ID)));
        when(directRequirement.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(directRequirement.learner(), TARGET_ID)));

        assertThat(directRequirement.service().getFrontier(LEARNER_ID)).isEmpty();
        assertThat(directRequirement.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .doesNotContain(TARGET_ID);

        Fixture inheritedRequirement = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        inheritedRequirement.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow()
                .setRequires(List.of(PREREQUISITE_ID));
        when(inheritedRequirement.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(inheritedRequirement.learner(), OUTSIDE_TARGET_ID)));

        assertThat(inheritedRequirement.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(inheritedRequirement.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactly(OUTSIDE_TARGET_ID);
    }

    @Test
    void releasedExamWithoutDirectDidacticPrerequisiteNeverEntersFrontier() {
        Fixture fixture = fixture(view(goalEntry(OUTSIDE_TARGET_ID)));
        LearningGoal exam = fixture.landscape().getGoals().stream()
                .filter(goal -> OUTSIDE_TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        exam.setExamData(releasedExamData());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .doesNotContain(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .doesNotContain(OUTSIDE_TARGET_ID);
    }

    @Test
    void releasedExamWithMasteredDirectDidacticPrerequisiteCanEnterFrontier() throws Exception {
        Fixture fixture = fixture(view(
                goalEntry(OUTSIDE_TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        LearningGoal exam = fixture.landscape().getGoals().stream()
                .filter(goal -> OUTSIDE_TARGET_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        exam.setRequires(List.of(PREREQUISITE_ID));
        exam.setExamData(releasedExamData());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .singleElement()
                .satisfies(candidate -> {
                    assertThat(candidate.id()).isEqualTo(OUTSIDE_TARGET_ID);
                    assertThat(candidate.examData()).isNull();
                    assertThat(candidate.examReadyForSelection()).isTrue();
                });

        var projected = new CoachStateProjection("https://skillpilot.test")
                .project(fixture.service().getCoachLearnerState(LEARNER_ID));
        assertThat(projected.frontier())
                .extracting(FrontierGoal::id)
                .containsExactly(OUTSIDE_TARGET_ID);
        assertThat(projected.stateMachine().goalOptions())
                .singleElement()
                .satisfies(candidate -> {
                    assertThat(candidate.id()).isEqualTo(OUTSIDE_TARGET_ID);
                    assertThat(candidate.examData()).isNull();
                });
        assertThat(new ObjectMapper().writeValueAsString(projected))
                .doesNotContain(
                        "examReadyForSelection",
                        "taskContent",
                        "solutionContent",
                        "passingPoints");
    }

    @Test
    void simpleFrontierRespectsThePlannedTargetScope() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), OUTSIDE_TARGET_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactly(OUTSIDE_TARGET_ID);
    }

    @Test
    void activeGoalSelectionUsesFullFrontierWhileStillRejectingOutOfProjectionGoals() {
        Fixture fixture = fixture(view(canonicalSubtree(ROOT_CLUSTER_ID)));
        LearningGoal root = fixture.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        List<String> compactableGoalIds = java.util.stream.IntStream.range(0, 24)
                .mapToObj(index -> "compactable-goal-" + index)
                .toList();
        List<LearningGoal> expandedGoals = new java.util.ArrayList<>(fixture.landscape().getGoals());
        compactableGoalIds.forEach(goalId -> expandedGoals.add(atomicGoal(goalId, List.of())));
        fixture.landscape().setGoals(expandedGoals);
        root.setContains(new java.util.ArrayList<>(compactableGoalIds));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID)));

        Set<String> compactFrontierIds = fixture.service().getRichFrontier(LEARNER_ID).stream()
                .map(FrontierGoal::id)
                .collect(java.util.stream.Collectors.toSet());
        Set<String> fullFrontierIds = fixture.service().getUncompactedRichFrontier(LEARNER_ID).stream()
                .map(FrontierGoal::id)
                .collect(java.util.stream.Collectors.toSet());
        String compactedAwayGoalId = compactableGoalIds.stream()
                .filter(fullFrontierIds::contains)
                .filter(goalId -> !compactFrontierIds.contains(goalId))
                .findFirst()
                .orElseThrow();

        fixture.service().setActiveGoal(LEARNER_ID, compactedAwayGoalId);

        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(compactedAwayGoalId);
        assertThatThrownBy(() -> fixture.service().setActiveGoal(
                        LEARNER_ID,
                        TRANSITIVE_PREREQUISITE_ID))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason()).contains("current frontier");
                });
        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(compactedAwayGoalId);
    }

    @Test
    void broadSyntheticCurriculumFocusDoesNotEnableGlobalAssessmentOfferBranch() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of(PREREQUISITE_ID));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(ROOT_CLUSTER_ID, GLOBAL_ASSESSMENT_ROOT_ID)));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), SYNTHETIC_STRUCTURE_ID)));
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(fixture.learner(), PREREQUISITE_ID, 1.0)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .contains(OUTSIDE_TARGET_ID)
                .doesNotContain(GLOBAL_ASSESSMENT_ROOT_ID, GLOBAL_ASSESSMENT_EXAM_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .contains(OUTSIDE_TARGET_ID)
                .doesNotContain(GLOBAL_ASSESSMENT_ROOT_ID, GLOBAL_ASSESSMENT_EXAM_ID);
    }

    @Test
    void explicitCanonicalAssessmentFocusEnablesReleasedOfferExamWithoutDirectPrerequisite() {
        Fixture fixture = fixture(view(canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of());
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), GLOBAL_ASSESSMENT_ROOT_ID)));

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .contains(GLOBAL_ASSESSMENT_EXAM_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .contains(GLOBAL_ASSESSMENT_EXAM_ID);
    }

    @Test
    void switchingFromExplicitAssessmentFocusToBroadSyntheticScopeClearsActiveExam() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(GLOBAL_ASSESSMENT_ROOT_ID)));
        addGlobalAssessmentBranch(fixture, List.of());
        LearningGoal broadRoot = fixture.landscape().getGoals().stream()
                .filter(goal -> ROOT_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        broadRoot.setContains(List.of(
                NESTED_CLUSTER_ID,
                OUTSIDE_TARGET_ID,
                GLOBAL_ASSESSMENT_ROOT_ID));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(ROOT_CLUSTER_ID)));
        fixture.learner().setActiveGoalId(GLOBAL_ASSESSMENT_EXAM_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(
                        fixture.learner(),
                        GLOBAL_ASSESSMENT_ROOT_ID)));

        fixture.service().setPlannedGoals(
                LEARNER_ID,
                Set.of(GLOBAL_ASSESSMENT_ROOT_ID));
        assertThat(fixture.learner().getActiveGoalId()).isEqualTo(GLOBAL_ASSESSMENT_EXAM_ID);

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of(SYNTHETIC_STRUCTURE_ID));

        assertThat(fixture.learner().getActiveGoalId()).isNull();
    }

    @Test
    void targetDominatesPrerequisiteOnlyWhenSameStableGoalIsReferencedInBothRoles() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(TARGET_ID, "prerequisiteOnly")));

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactly(TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).doesNotContain(TARGET_ID);
        assertThat(projection.presentationRootGoalIds())
                .containsExactly(ROOT_CLUSTER_ID);
    }

    @Test
    void directGoalEntryOverridesInheritedCanonicalSubtreeRegardlessOfRole() {
        Fixture directPrerequisite = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                goalEntry(TARGET_ID, "prerequisiteOnly")));

        ProjectionSets directPrerequisiteProjection =
                projectionSets(directPrerequisite.service());
        assertThat(directPrerequisiteProjection.targetGoalIds())
                .contains(ROOT_CLUSTER_ID, NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(TARGET_ID);
        assertThat(directPrerequisiteProjection.prerequisiteOnlyGoalIds())
                .contains(TARGET_ID);

        Fixture directTarget = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                goalEntry(TARGET_ID)));

        ProjectionSets directTargetProjection = projectionSets(directTarget.service());
        assertThat(directTargetProjection.targetGoalIds()).containsExactly(TARGET_ID);
        assertThat(directTargetProjection.prerequisiteOnlyGoalIds())
                .contains(ROOT_CLUSTER_ID, NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(TARGET_ID);
    }

    @Test
    void deeperCanonicalSubtreeOverridesShallowerSubtreeRegardlessOfRole() {
        Fixture deeperPrerequisite = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                canonicalSubtree(NESTED_CLUSTER_ID, "prerequisiteOnly")));

        ProjectionSets deeperPrerequisiteProjection =
                projectionSets(deeperPrerequisite.service());
        assertThat(deeperPrerequisiteProjection.targetGoalIds())
                .containsExactlyInAnyOrder(ROOT_CLUSTER_ID, OUTSIDE_TARGET_ID);
        assertThat(deeperPrerequisiteProjection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(
                        NESTED_CLUSTER_ID,
                        TARGET_ID,
                        PREREQUISITE_ID);

        Fixture deeperTarget = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                canonicalSubtree(NESTED_CLUSTER_ID)));

        ProjectionSets deeperTargetProjection = projectionSets(deeperTarget.service());
        assertThat(deeperTargetProjection.targetGoalIds())
                .containsExactlyInAnyOrder(
                        NESTED_CLUSTER_ID,
                        TARGET_ID,
                        PREREQUISITE_ID);
        assertThat(deeperTargetProjection.prerequisiteOnlyGoalIds())
                .containsExactlyInAnyOrder(ROOT_CLUSTER_ID, OUTSIDE_TARGET_ID);
    }

    @Test
    void independentlySelectedSubjectTargetSurvivesAnotherSubjectsDirectSupportReference() throws Exception {
        assertSelectedSubjectSupportRole(List.of(canonicalSubtree("supporting-subject-root")), true);
    }

    @Test
    void selectedSubjectStillResolvesItsOwnSpecificExclusionsBeforeJoiningTargets() throws Exception {
        assertSelectedSubjectSupportRole(List.of(
                canonicalSubtree("supporting-subject-root"),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")), false);
        assertSelectedSubjectSupportRole(List.of(
                canonicalSubtree("supporting-subject-root"),
                canonicalSubtree(PREREQUISITE_ID, "prerequisiteOnly")), false);
    }

    private void assertSelectedSubjectSupportRole(
            List<Map<String, Object>> supportingReferences, boolean expectedTarget) throws Exception {
        String supportingSubjectId = "supporting-subject";
        Fixture fixture = fixture(view(goalEntry(TARGET_ID), goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        SkillLandscape supportingSubject = new SkillLandscape();
        supportingSubject.setLandscapeId(supportingSubjectId);
        supportingSubject.setFrameworkId("canonical-gymnasium-supporting-subject");
        supportingSubject.setGoals(List.of(
                clusterGoal("supporting-subject-root", List.of(PREREQUISITE_ID)),
                atomicGoal(PREREQUISITE_ID, List.of(TRANSITIVE_PREREQUISITE_ID))));
        when(fixture.landscapeService().getById(supportingSubjectId)).thenReturn(supportingSubject);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(supportingSubjectId)).thenReturn(true);
        when(fixture.compositionViewService().findLearnerScopeView(eq(supportingSubjectId), anyMap()))
                .thenReturn(Map.of("viewId", "supporting-subject-view", "landscapeId", supportingSubjectId,
                        "rootNodes", supportingReferences));
        String bothSubjects = new ObjectMapper().writeValueAsString(Map.of(
                LANDSCAPE_ID, Map.of("selected", true, "filterId", "LK"),
                supportingSubjectId, Map.of("selected", true, "filterId", "GK")));
        for (List<SkillLandscape> closure : List.of(
                List.of(fixture.landscape(), supportingSubject),
                List.of(supportingSubject, fixture.landscape()))) {
            when(fixture.landscapeService().getClosure(LANDSCAPE_ID)).thenReturn(closure);
            ProjectionSets projection = projectionSets(fixture.service(), bothSubjects);
            assertThat(projection.targetGoalIds()).contains(TARGET_ID);
            if (expectedTarget) {
                assertThat(projection.targetGoalIds()).contains(PREREQUISITE_ID);
                assertThat(projection.prerequisiteOnlyGoalIds()).doesNotContain(PREREQUISITE_ID);
                assertThat(fixture.service().getFilteredAtomicGoalIds(LANDSCAPE_ID, bothSubjects, null, false))
                        .contains(TARGET_ID, PREREQUISITE_ID);
            } else {
                assertThat(projection.targetGoalIds()).doesNotContain(PREREQUISITE_ID);
                assertThat(projection.prerequisiteOnlyGoalIds()).contains(PREREQUISITE_ID);
            }
        }
    }

    @Test
    void legacyProjectionKeepsAllAtomicGoalsAsTargets() {
        Fixture fixture = fixture(null);
        when(fixture.compositionViewService().isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(false);

        assertThat(fixture.service().getFilteredAtomicGoalIds(
                        LANDSCAPE_ID, PERSONAL_CURRICULUM, null, false))
                .containsExactlyInAnyOrder(
                        TARGET_ID,
                        PREREQUISITE_ID,
                        TRANSITIVE_PREREQUISITE_ID,
                        OUTSIDE_TARGET_ID);

        ProjectionSets projection = projectionSets(fixture.service());
        assertThat(projection.targetGoalIds())
                .containsExactlyInAnyOrder(
                        TARGET_ID,
                        PREREQUISITE_ID,
                        TRANSITIVE_PREREQUISITE_ID,
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID);
        assertThat(projection.prerequisiteOnlyGoalIds()).isEmpty();
    }

    @Test
    void setPlannedGoalsRejectsPrerequisiteOnlyAndUnknownGoalsBeforePersistence() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), TARGET_ID)));

        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(LEARNER_ID, Set.of(PREREQUISITE_ID)),
                PREREQUISITE_ID);
        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(LEARNER_ID, Set.of("unknown-goal")),
                "unknown-goal");

        assertThat(fixture.savedGoals()).isEmpty();
        verify(fixture.plannedGoalRepository(), never())
                .deleteAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
    }

    @Test
    void setScopeRejectsStructurallyKnownButLearnerFacingInvisibleGoal() {
        Fixture fixture = fixture(view(
                goalEntry(TARGET_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));

        assertInvalidProjectedFocus(
                () -> fixture.service().setScope(LEARNER_ID, List.of(OUTSIDE_TARGET_ID)),
                OUTSIDE_TARGET_ID);

        assertThat(fixture.savedGoals()).isEmpty();
    }

    @Test
    void setPlannedGoalsNormalizesLegacyTargetIdBeforeProjectionValidation() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.goalMappingService().findAllByLegacyGoalId("legacy-target"))
                .thenReturn(List.of(new ResolvedGoalMapping(
                        "legacy-landscape",
                        LANDSCAPE_ID,
                        "legacy-target",
                        TARGET_ID,
                        "exact",
                        "test-mapping.json")));

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of("legacy-target"));

        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(TARGET_ID);
    }

    @Test
    void setPlannedGoalsAllowsVisibleSyntheticCompositionStructureTarget() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        when(fixture.compositionViewService().resolveStructureReference(SYNTHETIC_STRUCTURE_ID))
                .thenReturn(new CompositionViewService.CompositionStructureResolution(
                        SYNTHETIC_STRUCTURE_ID,
                        "projection-role-test",
                        "sek2",
                        "Sekundarstufe II",
                        List.of(TARGET_ID)));

        fixture.service().setPlannedGoals(LEARNER_ID, Set.of(SYNTHETIC_STRUCTURE_ID));

        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(SYNTHETIC_STRUCTURE_ID);
    }

    @Test
    void setPlannedGoalsNormalizesEmptySetToFirstVisibleRootAfterPersonalization() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        PlannedGoal existingGoal = new PlannedGoal(fixture.learner(), TARGET_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(existingGoal))
                .thenReturn(List.of());

        assertThat(fixture.service().setPlannedGoals(LEARNER_ID, Set.of()))
                .containsExactly(ROOT_CLUSTER_ID);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PlannedGoal>> deleted =
                ArgumentCaptor.forClass(Iterable.class);
        verify(fixture.plannedGoalRepository()).deleteAll(deleted.capture());
        assertThat(deleted.getValue())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(TARGET_ID);
        assertThat(fixture.savedGoals())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(ROOT_CLUSTER_ID);
        verify(fixture.eventPublisher()).publishEvent(
                org.mockito.ArgumentMatchers.argThat(event ->
                        event instanceof com.skillpilot.backend.events.LearnerStateChangedEvent change
                                && "PLANNED_GOALS_UPDATE".equals(change.getChangeType())));
    }

    @Test
    void selectingCurriculumWithoutLevelTwoQuestionsPersistsItsDefaultFocusImmediately() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        fixture.learner().setSelectedCurriculum(null);
        fixture.learner().setPersonalCurriculum(null);

        fixture.service().setCurriculum(LEARNER_ID, LANDSCAPE_ID);

        verify(fixture.plannedGoalRepository()).deleteByLearner_SkillpilotId(LEARNER_ID);
        verify(fixture.plannedGoalRepository()).save(
                org.mockito.ArgumentMatchers.argThat(goal ->
                        ROOT_CLUSTER_ID.equals(goal.getGoalId())));
    }

    @Test
    void prerequisiteOnlyStructureAncestorCannotBecomeFocusThroughTargetDescendant() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID, "prerequisiteOnly"),
                goalEntry(TARGET_ID)));

        assertInvalidProjectedFocus(
                () -> fixture.service().setPlannedGoals(
                        LEARNER_ID,
                        Set.of(ROOT_CLUSTER_ID)),
                ROOT_CLUSTER_ID);
    }

    @Test
    void storedPrerequisiteOnlyFocusIsFilteredFromLearnerFacingReadsAndCannotConstrainFrontier() {
        Fixture fixture = fixture(view(
                canonicalSubtree(ROOT_CLUSTER_ID),
                goalEntry(PREREQUISITE_ID, "prerequisiteOnly")));
        PlannedGoal stalePrerequisiteOnlyFocus =
                new PlannedGoal(fixture.learner(), PREREQUISITE_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(stalePrerequisiteOnlyFocus));

        assertThat(fixture.service().getPlannedGoals(LEARNER_ID))
                .containsExactly(ROOT_CLUSTER_ID);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        var learnerState = fixture.service().getLearnerState(LEARNER_ID);
        assertThat(learnerState.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(ROOT_CLUSTER_ID);
        assertThat(learnerState.frontier())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(
                        ROOT_CLUSTER_ID,
                        NESTED_CLUSTER_ID,
                        OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        verify(fixture.plannedGoalRepository())
                .deleteAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
        verify(fixture.plannedGoalRepository()).save(
                org.mockito.ArgumentMatchers.argThat(goal ->
                        ROOT_CLUSTER_ID.equals(goal.getGoalId())));
    }

    private Fixture physicsSourceRouteFixture(String methodRole) throws Exception {
        List<Map<String, Object>> entries = new ArrayList<>();
        entries.add(goalEntry(SOLAR_SYSTEM_CLASSIFICATION_ID));
        entries.add(goalEntry(OPEN_COSMOLOGICAL_QUESTIONS_ID));
        MASTERED_PHYSICS_CONTEXT_IDS.forEach(id -> entries.add(goalEntry(id, "prerequisiteOnly")));
        if (!"omitted".equals(methodRole)) {
            PHYSICS_METHOD_IDS.forEach(id -> entries.add(goalEntry(id, methodRole)));
        }
        Fixture fixture = fixture(Map.of(
                "viewId", "projection-role-test",
                "landscapeId", LANDSCAPE_ID,
                "rootNodes", entries));

        List<String> routeIds = new ArrayList<>(PHYSICS_METHOD_IDS);
        routeIds.add(SOLAR_SYSTEM_CLASSIFICATION_ID);
        routeIds.add(OPEN_COSMOLOGICAL_QUESTIONS_ID);
        routeIds.addAll(MASTERED_PHYSICS_CONTEXT_IDS);
        LearningGoal root = clusterGoal(ROOT_CLUSTER_ID, routeIds);
        root.setTags(List.of("root"));
        List<LearningGoal> goals = new ArrayList<>(List.of(root));
        ObjectMapper mapper = new ObjectMapper();
        // Keep canonical requirements intact in this small runtime fixture. The other
        // astronomy prerequisites are already mastered; real composition views have separate tests.
        for (var node : mapper.readTree(Path.of(
                "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json")
                .toFile()).path("goals")) {
            if (routeIds.contains(node.path("id").asText())) {
                goals.add(mapper.treeToValue(node, LearningGoal.class));
            }
        }
        assertThat(goals).extracting(LearningGoal::getId)
                .containsAll(routeIds).hasSize(routeIds.size() + 1);
        fixture.landscape().setGoals(goals);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(fixture.learner(), ROOT_CLUSTER_ID)));
        return fixture;
    }

    private void assertPhysicsSourceRouteFrontier(
            Fixture fixture, Set<String> masteredMethods, String... expectedFrontier) {
        Map<String, Double> explicitMastery = new LinkedHashMap<>();
        MASTERED_PHYSICS_CONTEXT_IDS.forEach(id -> explicitMastery.put(id, 1.0));
        PHYSICS_METHOD_IDS.forEach(id -> explicitMastery.put(id, masteredMethods.contains(id) ? 1.0 : 0.0));
        explicitMastery.put(SOLAR_SYSTEM_CLASSIFICATION_ID, 0.0);
        explicitMastery.put(OPEN_COSMOLOGICAL_QUESTIONS_ID, 0.0);
        List<Mastery> storedMastery = explicitMastery.entrySet().stream()
                .map(entry -> new Mastery(fixture.learner(), entry.getKey(), entry.getValue()))
                .toList();
        when(fixture.masteryRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(storedMastery);

        assertThat(fixture.service().getFrontier(LEARNER_ID))
                .containsExactlyInAnyOrder(expectedFrontier);
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(expectedFrontier);
        assertThat(fixture.service().getMastery(LEARNER_ID)).isEqualTo(explicitMastery);
        assertThat(storedMastery).allSatisfy(mastery ->
                assertThat(mastery.getValue()).isEqualTo(explicitMastery.get(mastery.getGoalKey())));
        verify(fixture.masteryRepository(), never()).save(any(Mastery.class));
        verify(fixture.masteryRepository(), never()).saveAll(any());
        verify(fixture.masteryRepository(), never()).saveAndFlush(any(Mastery.class));
    }

    private Fixture fixture(Map<String, Object> matchedView) {
        SkillLandscape landscape = landscape();
        LandscapeService landscapeService = mock(LandscapeService.class);
        CompositionViewService compositionViewService = mock(CompositionViewService.class);
        LearnerRepository learnerRepository = mock(LearnerRepository.class);
        MasteryRepository masteryRepository = mock(MasteryRepository.class);
        PlannedGoalRepository plannedGoalRepository = mock(PlannedGoalRepository.class);
        GoalMappingService goalMappingService = mock(GoalMappingService.class);
        ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);

        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapeService.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(landscapeService.getOverview("de", true))
                .thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(compositionViewService.isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(true);
        if (matchedView != null) {
            when(compositionViewService.findLearnerScopeView(eq(LANDSCAPE_ID), anyMap()))
                    .thenReturn(matchedView);
            when(compositionViewService.findDefaultView(LANDSCAPE_ID))
                    .thenReturn(matchedView);
        }

        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(LANDSCAPE_ID);
        learner.setPersonalCurriculum(PERSONAL_CURRICULUM);
        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.of(learner));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());

        List<PlannedGoal> savedGoals = new java.util.ArrayList<>();
        when(plannedGoalRepository.saveAll(
                        org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any()))
                .thenAnswer(invocation -> {
                    Iterable<PlannedGoal> goals = invocation.getArgument(0);
                    goals.forEach(savedGoals::add);
                    return savedGoals;
                });

        LearnerService service = new LearnerService(
                learnerRepository,
                mock(LearnerClientStateRepository.class),
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                mock(DeckResourceService.class),
                compositionViewService,
                new ObjectMapper(),
                eventPublisher,
                mock(PlatformTransactionManager.class));
        return new Fixture(
                service,
                learner,
                landscape,
                landscapeService,
                masteryRepository,
                compositionViewService,
                plannedGoalRepository,
                goalMappingService,
                eventPublisher,
                savedGoals);
    }

    private void assertInvalidProjectedFocus(
            org.assertj.core.api.ThrowableAssert.ThrowingCallable invocation,
            String invalidGoalId) {
        assertThatThrownBy(invocation)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason())
                            .contains("learner-facing targets")
                            .contains(invalidGoalId);
                });
    }

    private SkillLandscape landscape() {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(LANDSCAPE_ID);
        landscape.setFrameworkId("canonical-gymnasium-projection-role-test");
        LearningGoal rootGoal = clusterGoal(
                ROOT_CLUSTER_ID,
                List.of(NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID));
        rootGoal.setTags(List.of("root"));
        landscape.setGoals(List.of(
                rootGoal,
                clusterGoal(
                        NESTED_CLUSTER_ID,
                        List.of(TARGET_ID, PREREQUISITE_ID)),
                atomicGoal(TARGET_ID, List.of(PREREQUISITE_ID)),
                atomicGoal(PREREQUISITE_ID, List.of(TRANSITIVE_PREREQUISITE_ID)),
                atomicGoal(TRANSITIVE_PREREQUISITE_ID, List.of()),
                atomicGoal(OUTSIDE_TARGET_ID, List.of())));
        return landscape;
    }

    private LearningGoal clusterGoal(String id, List<String> contains) {
        LearningGoal goal = atomicGoal(id, List.of());
        goal.setType("cluster");
        goal.setContains(contains);
        return goal;
    }

    private LearningGoal atomicGoal(String id, List<String> requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setType("atomic");
        goal.setTags(List.of());
        goal.setRequires(requires);
        goal.setContains(List.of());
        return goal;
    }

    private ExamData releasedExamData() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setTaskContent("Solve the reviewed assessment task.");
        exam.setSolutionContent("Reviewed solution.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(1.0);
        scoring.setPassingPoints(1.0);
        ExamData.Step step = new ExamData.Step();
        step.setId("s1");
        step.setPoints(1.0);
        step.setDescription("Reviewed scoring step");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return exam;
    }

    private void addGlobalAssessmentBranch(Fixture fixture, List<String> examRequires) {
        LearningGoal root = clusterGoal(
                GLOBAL_ASSESSMENT_ROOT_ID,
                List.of(GLOBAL_ASSESSMENT_EXAM_ID));
        ReleaseMetadata release = new ReleaseMetadata();
        release.setKind("offer");
        release.setStatus("released");
        root.setRelease(release);

        LearningGoal exam = atomicGoal(GLOBAL_ASSESSMENT_EXAM_ID, examRequires);
        exam.setExamData(releasedExamData());

        List<LearningGoal> goals = new java.util.ArrayList<>(fixture.landscape().getGoals());
        goals.add(root);
        goals.add(exam);
        fixture.landscape().setGoals(goals);
    }

    private Map<String, Object> view(Map<String, Object>... entries) {
        return Map.of(
                "viewId", "projection-role-test",
                "landscapeId", LANDSCAPE_ID,
                "rootNodes", List.of(entries));
    }

    private Map<String, Object> goalEntry(String goalId) {
        return Map.of(
                "kind", "goalEntry",
                "goalId", goalId);
    }

    private Map<String, Object> goalEntry(String goalId, String projectionRole) {
        return Map.of(
                "kind", "goalEntry",
                "goalId", goalId,
                "projectionRole", projectionRole);
    }

    private Map<String, Object> canonicalSubtree(String goalId) {
        return Map.of(
                "kind", "canonicalSubtree",
                "goalId", goalId);
    }

    private Map<String, Object> canonicalSubtree(String goalId, String projectionRole) {
        return Map.of(
                "kind", "canonicalSubtree",
                "goalId", goalId,
                "projectionRole", projectionRole);
    }

    @SuppressWarnings("unchecked")
    private ProjectionSets projectionSets(LearnerService service) {
        return projectionSets(service, PERSONAL_CURRICULUM);
    }

    @SuppressWarnings("unchecked")
    private ProjectionSets projectionSets(LearnerService service, String personalCurriculum) {
        Object projection = ReflectionTestUtils.invokeMethod(
                service,
                "getGoalProjection",
                LANDSCAPE_ID,
                personalCurriculum);
        Set<String> targetGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
        Set<String> prerequisiteOnlyGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
        List<String> presentationRootGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds");
        Map<String, LearningGoal> visibleGoals =
                ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
        Map<String, LearningGoal> structuralGoals =
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
        return new ProjectionSets(
                targetGoalIds,
                prerequisiteOnlyGoalIds,
                presentationRootGoalIds,
                visibleGoals.keySet(),
                structuralGoals.keySet());
    }

    private record Fixture(
            LearnerService service,
            Learner learner,
            SkillLandscape landscape,
            LandscapeService landscapeService,
            MasteryRepository masteryRepository,
            CompositionViewService compositionViewService,
            PlannedGoalRepository plannedGoalRepository,
            GoalMappingService goalMappingService,
            ApplicationEventPublisher eventPublisher,
            List<PlannedGoal> savedGoals) {
    }

    private record ProjectionSets(
            Set<String> targetGoalIds,
            Set<String> prerequisiteOnlyGoalIds,
            List<String> presentationRootGoalIds,
            Set<String> visibleGoalIds,
            Set<String> structuralGoalIds) {
    }
}
