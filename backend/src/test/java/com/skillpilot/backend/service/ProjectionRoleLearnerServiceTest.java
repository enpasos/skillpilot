package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ReleaseMetadata;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
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
    private static final String ROOT_CLUSTER_ID = "projection-root";
    private static final String NESTED_CLUSTER_ID = "projection-nested";
    private static final String OUTSIDE_TARGET_ID = "outside-target";
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
    void releasedExamWithMasteredDirectDidacticPrerequisiteCanEnterFrontier() {
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
                .extracting(FrontierGoal::id)
                .containsExactly(OUTSIDE_TARGET_ID);
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
    void setPlannedGoalsStillAllowsEmptySetToClearFocus() {
        Fixture fixture = fixture(view(goalEntry(TARGET_ID)));
        PlannedGoal existingGoal = new PlannedGoal(fixture.learner(), TARGET_ID);
        when(fixture.plannedGoalRepository().findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(existingGoal))
                .thenReturn(List.of());

        assertThat(fixture.service().setPlannedGoals(LEARNER_ID, Set.of())).isEmpty();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Iterable<PlannedGoal>> deleted =
                ArgumentCaptor.forClass(Iterable.class);
        verify(fixture.plannedGoalRepository()).deleteAll(deleted.capture());
        assertThat(deleted.getValue())
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(TARGET_ID);
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

        assertThat(fixture.service().getPlannedGoals(LEARNER_ID)).isEmpty();
        assertThat(fixture.service().getRichFrontier(LEARNER_ID))
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        var learnerState = fixture.service().getLearnerState(LEARNER_ID);
        assertThat(learnerState.goals().planned()).isEmpty();
        assertThat(learnerState.frontier())
                .extracting(FrontierGoal::id)
                .containsExactlyInAnyOrder(NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)
                .doesNotContain(PREREQUISITE_ID, TRANSITIVE_PREREQUISITE_ID);

        verify(fixture.plannedGoalRepository(), never())
                .deleteAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
        verify(fixture.plannedGoalRepository(), never())
                .saveAll(org.mockito.ArgumentMatchers.<Iterable<PlannedGoal>>any());
    }

    private Fixture fixture(Map<String, Object> matchedView) {
        SkillLandscape landscape = landscape();
        LandscapeService landscapeService = mock(LandscapeService.class);
        CompositionViewService compositionViewService = mock(CompositionViewService.class);
        LearnerRepository learnerRepository = mock(LearnerRepository.class);
        MasteryRepository masteryRepository = mock(MasteryRepository.class);
        PlannedGoalRepository plannedGoalRepository = mock(PlannedGoalRepository.class);
        GoalMappingService goalMappingService = mock(GoalMappingService.class);

        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapeService.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(landscapeService.getOverview("de", true))
                .thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(compositionViewService.isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(true);
        if (matchedView != null) {
            when(compositionViewService.findLearnerScopeView(eq(LANDSCAPE_ID), anyMap()))
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
                mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
        return new Fixture(
                service,
                learner,
                landscape,
                masteryRepository,
                compositionViewService,
                plannedGoalRepository,
                goalMappingService,
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
        landscape.setGoals(List.of(
                clusterGoal(
                        ROOT_CLUSTER_ID,
                        List.of(NESTED_CLUSTER_ID, OUTSIDE_TARGET_ID)),
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
        Object projection = ReflectionTestUtils.invokeMethod(
                service,
                "getGoalProjection",
                LANDSCAPE_ID,
                PERSONAL_CURRICULUM);
        Set<String> targetGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
        Set<String> prerequisiteOnlyGoalIds =
                ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
        return new ProjectionSets(targetGoalIds, prerequisiteOnlyGoalIds);
    }

    private record Fixture(
            LearnerService service,
            Learner learner,
            SkillLandscape landscape,
            MasteryRepository masteryRepository,
            CompositionViewService compositionViewService,
            PlannedGoalRepository plannedGoalRepository,
            GoalMappingService goalMappingService,
            List<PlannedGoal> savedGoals) {
    }

    private record ProjectionSets(
            Set<String> targetGoalIds,
            Set<String> prerequisiteOnlyGoalIds) {
    }
}
