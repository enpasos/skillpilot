package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

class ProjectionRoleLearnerServiceTest {

    private static final String LANDSCAPE_ID = "projection-roles";
    private static final String LEARNER_ID = "projection-role-learner";
    private static final String TARGET_ID = "sek2-target";
    private static final String PREREQUISITE_ID = "sek1-bridge";
    private static final String TRANSITIVE_PREREQUISITE_ID = "sek1-deep";
    private static final String ROOT_CLUSTER_ID = "projection-root";
    private static final String NESTED_CLUSTER_ID = "projection-nested";
    private static final String OUTSIDE_TARGET_ID = "outside-target";
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

    private Fixture fixture(Map<String, Object> matchedView) {
        SkillLandscape landscape = landscape();
        LandscapeService landscapeService = mock(LandscapeService.class);
        CompositionViewService compositionViewService = mock(CompositionViewService.class);
        LearnerRepository learnerRepository = mock(LearnerRepository.class);
        MasteryRepository masteryRepository = mock(MasteryRepository.class);

        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapeService.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(compositionViewService.isAuthoritativeForLandscape(LANDSCAPE_ID))
                .thenReturn(true);
        if (matchedView != null) {
            when(compositionViewService.findMatchingView(eq(LANDSCAPE_ID), anyMap()))
                    .thenReturn(matchedView);
        }

        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(LANDSCAPE_ID);
        learner.setPersonalCurriculum(PERSONAL_CURRICULUM);
        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());

        LearnerService service = new LearnerService(
                learnerRepository,
                mock(LearnerClientStateRepository.class),
                masteryRepository,
                mock(PlannedGoalRepository.class),
                landscapeService,
                mock(GoalMappingService.class),
                mock(DeckResourceService.class),
                compositionViewService,
                new ObjectMapper(),
                mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
        return new Fixture(
                service,
                learner,
                masteryRepository,
                compositionViewService);
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
            MasteryRepository masteryRepository,
            CompositionViewService compositionViewService) {
    }

    private record ProjectionSets(
            Set<String> targetGoalIds,
            Set<String> prerequisiteOnlyGoalIds) {
    }
}
