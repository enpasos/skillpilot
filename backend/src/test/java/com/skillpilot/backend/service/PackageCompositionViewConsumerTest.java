package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.repository.CurriculumChampionRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

class PackageCompositionViewConsumerTest {

    private static final String LANDSCAPE_ID = "package-math";
    private static final String GOAL_ID = "goal-1";
    private static final String CHILD_ID = "goal-child";
    private static final String PERSONAL_CURRICULUM = """
            {
              "package-math": {"selected": true, "filterId": "GK"}
            }
            """;

    @Test
    @SuppressWarnings("unchecked")
    void learnerScopeUsesNeutralCrossStageForSubjectCourseProfileWithoutExplicitStage() {
        LearnerService service = learnerService(
                mock(LandscapeService.class),
                mock(CompositionViewService.class));

        for (String courseProfile : List.of("GK", "LK")) {
            Map<String, String> scope = (Map<String, String>) ReflectionTestUtils.invokeMethod(
                    service,
                    "deriveCompositionScope",
                    LANDSCAPE_ID,
                    Map.of(
                            LANDSCAPE_ID,
                            Map.<String, Object>of("selected", true, "filterId", courseProfile)));

            assertThat(scope)
                    .containsEntry("courseProfile", courseProfile)
                    .containsEntry("stage", "CrossStage");
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void learnerScopePreservesExplicitCrossStageWithEachSubjectCourseProfile() {
        LearnerService service = learnerService(
                mock(LandscapeService.class),
                mock(CompositionViewService.class));

        for (String courseProfile : List.of("GK", "LK")) {
            Map<String, String> scope = (Map<String, String>) ReflectionTestUtils.invokeMethod(
                    service,
                    "deriveCompositionScope",
                    LANDSCAPE_ID,
                    Map.of(
                            LANDSCAPE_ID,
                            Map.<String, Object>of("selected", true, "filterId", courseProfile),
                            "__skillpilot_stage_scope_sek1__",
                            Map.<String, Object>of("selected", true),
                            "__skillpilot_stage_scope_sek2__",
                            Map.<String, Object>of("selected", true)));

            assertThat(scope)
                    .containsEntry("stage", "CrossStage")
                    .containsEntry("courseProfile", courseProfile);
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void curriculaScopeUsesNeutralCrossStageForSubjectCourseProfileWithoutExplicitStage() {
        LearningLandscape landscape = landscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        CurriculaService service = curriculaService(landscapes);

        for (String courseProfile : List.of("GK", "LK")) {
            Map<String, String> scope = (Map<String, String>) ReflectionTestUtils.invokeMethod(
                    service,
                    "deriveRuntimeCompositionScope",
                    LANDSCAPE_ID,
                    """
                    {
                      "package-math": {"selected": true, "filterId": "%s"}
                    }
                    """.formatted(courseProfile));

            assertThat(scope)
                    .containsEntry("courseProfile", courseProfile)
                    .containsEntry("stage", "CrossStage");
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void curriculaScopePreservesExplicitCrossStageWithEachSubjectCourseProfile() {
        LearningLandscape landscape = landscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        CurriculaService service = curriculaService(landscapes);

        for (String courseProfile : List.of("GK", "LK")) {
            Map<String, String> scope = (Map<String, String>) ReflectionTestUtils.invokeMethod(
                    service,
                    "deriveRuntimeCompositionScope",
                    LANDSCAPE_ID,
                    """
                    {
                      "package-math": {"selected": true, "filterId": "%s"},
                      "__skillpilot_stage_scope_sek1__": {"selected": true},
                      "__skillpilot_stage_scope_sek2__": {"selected": true}
                    }
                    """.formatted(courseProfile));

            assertThat(scope)
                    .containsEntry("stage", "CrossStage")
                    .containsEntry("courseProfile", courseProfile);
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void learnerFilteringDoesNotFallBackToAllGoalsForUnsupportedPackageScope() {
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findMatchingView(eq(LANDSCAPE_ID), anyMap())).thenReturn(null);

        LearnerService service = new LearnerService(
                mock(LearnerRepository.class),
                mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class),
                mock(LandscapeService.class),
                mock(GoalMappingService.class),
                mock(DeckResourceService.class),
                compositionViews,
                new ObjectMapper(),
                mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));

        LearningLandscape landscape = landscape();
        LearningGoal goal = landscape.getGoals().getFirst();
        Map<String, LearningGoal> scoped = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                service,
                "applyCompositionViewScope",
                LANDSCAPE_ID,
                Map.of(GOAL_ID, goal),
                Map.of(LANDSCAPE_ID, Map.of("selected", true, "filterId", "GK")),
                List.of(landscape));

        assertThat(scoped).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void legacyGymnasiumAdapterDoesNotExposeGenericPackageForUnsupportedScope() {
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        LearnerService service = learnerService(mock(LandscapeService.class), compositionViews);
        LearningLandscape landscape = landscape();
        landscape.setFrameworkId("other-framework");
        LearningGoal goal = landscape.getGoals().getFirst();

        Map<String, LearningGoal> scoped = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                service,
                "applyCompositionViewScope",
                LANDSCAPE_ID,
                Map.of(GOAL_ID, goal),
                Map.of(LANDSCAPE_ID, Map.of("selected", true, "filterId", "custom")),
                List.of(landscape));

        assertThat(scoped).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void championMetricsDoNotFallBackToFilteredGoalsForUnsupportedPackageScope() {
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape());
        LearnerService learners = mock(LearnerService.class);
        when(learners.getFilteredAtomicGoalIds(
                        LANDSCAPE_ID,
                        PERSONAL_CURRICULUM,
                        null,
                        false))
                .thenReturn(Set.of(GOAL_ID));
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findMatchingView(eq(LANDSCAPE_ID), anyMap())).thenReturn(null);

        CurriculaService service = new CurriculaService(
                landscapes,
                mock(MasteryRepository.class),
                mock(LearnerRepository.class),
                mock(CurriculumChampionRepository.class),
                mock(GitHubStatsService.class),
                learners,
                compositionViews,
                new ObjectMapper(),
                new PackageCurriculumQualitySnapshotProvider());
        Learner learner = new Learner();
        learner.setSkillpilotId("learner");
        learner.setSelectedCurriculum(LANDSCAPE_ID);
        learner.setPersonalCurriculum(PERSONAL_CURRICULUM);

        Set<String> resolved = (Set<String>) ReflectionTestUtils.invokeMethod(
                service,
                "resolveChampionAtomicIds",
                LANDSCAPE_ID,
                null,
                "learner",
                learner,
                Map.of(GOAL_ID, Set.of(LANDSCAPE_ID)));

        assertThat(resolved).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void learnerFilteringUsesDefaultOfferingButKeepsStructuralLookupUnfiltered() {
        LearningLandscape landscape = clusteredLandscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findDefaultView(LANDSCAPE_ID)).thenReturn(Map.of(
                "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", GOAL_ID))));
        LearnerService service = learnerService(landscapes, compositionViews);
        Map<String, LearningGoal> allGoals = Map.of(
                GOAL_ID, landscape.getGoals().get(0),
                CHILD_ID, landscape.getGoals().get(1));

        Map<String, LearningGoal> learnerFacing = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                service,
                "applyCompositionViewScope",
                LANDSCAPE_ID,
                allGoals,
                Map.of(),
                List.of(landscape));
        Map<String, LearningGoal> structural = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                service,
                "getStructuralGoals",
                LANDSCAPE_ID);

        assertThat(learnerFacing).containsOnlyKeys(GOAL_ID);
        assertThat(learnerFacing.get(GOAL_ID).getContains()).isEmpty();
        assertThat(learnerFacing.get(GOAL_ID).getType()).isEqualTo("atomic");
        assertThat(structural).containsOnlyKeys(GOAL_ID, CHILD_ID);
        assertThat(structural.get(GOAL_ID).getContains()).containsExactly(CHILD_ID);
    }

    @Test
    @SuppressWarnings("unchecked")
    void goalEntryDoesNotExpandDescendants() {
        LearningLandscape landscape = clusteredLandscape();
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findMatchingView(eq(LANDSCAPE_ID), anyMap())).thenReturn(Map.of(
                "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", GOAL_ID))));
        LearnerService service = learnerService(mock(LandscapeService.class), compositionViews);
        Map<String, LearningGoal> allGoals = Map.of(
                GOAL_ID, landscape.getGoals().get(0),
                CHILD_ID, landscape.getGoals().get(1));

        Map<String, LearningGoal> scoped = (Map<String, LearningGoal>) ReflectionTestUtils.invokeMethod(
                service,
                "applyCompositionViewScope",
                LANDSCAPE_ID,
                allGoals,
                Map.of(LANDSCAPE_ID, Map.of("selected", true, "filterId", "GK")),
                List.of(landscape));

        assertThat(scoped).containsOnlyKeys(GOAL_ID);
        assertThat(scoped.get(GOAL_ID).getContains()).isEmpty();
        assertThat(scoped.get(GOAL_ID).getType()).isEqualTo("atomic");
    }

    @Test
    void topicAtomicIdsKeepOpaqueEntryAndSeparatelyPlacedDescendant() {
        LearningLandscape landscape = clusteredLandscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getClosure(LANDSCAPE_ID)).thenReturn(List.of(landscape));
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapes.getGoalDefinition(GOAL_ID)).thenReturn(landscape.getGoals().get(0));
        when(landscapes.getGoalDefinition(CHILD_ID)).thenReturn(landscape.getGoals().get(1));
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findMatchingView(eq(LANDSCAPE_ID), anyMap())).thenReturn(Map.of(
                "rootNodes", List.of(
                        Map.of("kind", "goalEntry", "goalId", GOAL_ID),
                        Map.of("kind", "goalEntry", "goalId", CHILD_ID))));
        LearnerService service = learnerService(landscapes, compositionViews);

        Set<String> atomicIds = service.getFilteredAtomicGoalIds(
                LANDSCAPE_ID,
                PERSONAL_CURRICULUM,
                GOAL_ID,
                false);

        assertThat(atomicIds).containsExactlyInAnyOrder(GOAL_ID, CHILD_ID);
    }

    @Test
    @SuppressWarnings("unchecked")
    void championMetricsUseDefaultForMissingPersonalization() {
        LearningLandscape landscape = clusteredLandscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapes.getGoalDefinition(GOAL_ID)).thenReturn(landscape.getGoals().get(0));
        when(landscapes.getGoalDefinition(CHILD_ID)).thenReturn(landscape.getGoals().get(1));
        LearnerService learners = mock(LearnerService.class);
        when(learners.getFilteredAtomicGoalIds(LANDSCAPE_ID, "{}", null, false))
                .thenReturn(Set.of(CHILD_ID));
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findDefaultView(LANDSCAPE_ID)).thenReturn(Map.of(
                "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", CHILD_ID))));
        CurriculaService service = new CurriculaService(
                landscapes,
                mock(MasteryRepository.class),
                mock(LearnerRepository.class),
                mock(CurriculumChampionRepository.class),
                mock(GitHubStatsService.class),
                learners,
                compositionViews,
                new ObjectMapper(),
                new PackageCurriculumQualitySnapshotProvider());
        Learner learner = new Learner();
        learner.setSelectedCurriculum(LANDSCAPE_ID);
        learner.setPersonalCurriculum(null);

        Set<String> resolved = (Set<String>) ReflectionTestUtils.invokeMethod(
                service,
                "resolveChampionAtomicIds",
                LANDSCAPE_ID,
                null,
                "learner",
                learner,
                Map.of(CHILD_ID, Set.of(LANDSCAPE_ID)));

        assertThat(resolved).containsExactly(CHILD_ID);
    }

    @Test
    @SuppressWarnings("unchecked")
    void championMetricsCountOpaqueClusterGoalEntryAsProjectedLeaf() {
        LearningLandscape landscape = clusteredLandscape();
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById(LANDSCAPE_ID)).thenReturn(landscape);
        when(landscapes.getGoalDefinition(GOAL_ID)).thenReturn(landscape.getGoals().get(0));
        LearnerService learners = mock(LearnerService.class);
        when(learners.getFilteredAtomicGoalIds(LANDSCAPE_ID, "{}", null, false))
                .thenReturn(Set.of(GOAL_ID));
        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.isAuthoritativeForLandscape(LANDSCAPE_ID)).thenReturn(true);
        when(compositionViews.findDefaultView(LANDSCAPE_ID)).thenReturn(Map.of(
                "rootNodes", List.of(Map.of("kind", "goalEntry", "goalId", GOAL_ID))));
        CurriculaService service = new CurriculaService(
                landscapes,
                mock(MasteryRepository.class),
                mock(LearnerRepository.class),
                mock(CurriculumChampionRepository.class),
                mock(GitHubStatsService.class),
                learners,
                compositionViews,
                new ObjectMapper(),
                new PackageCurriculumQualitySnapshotProvider());
        Learner learner = new Learner();
        learner.setSelectedCurriculum(LANDSCAPE_ID);

        Set<String> resolved = (Set<String>) ReflectionTestUtils.invokeMethod(
                service,
                "resolveChampionAtomicIds",
                LANDSCAPE_ID,
                null,
                "learner",
                learner,
                Map.of(CHILD_ID, Set.of(LANDSCAPE_ID)));

        assertThat(resolved).containsExactly(GOAL_ID);
    }

    private static LearnerService learnerService(
            LandscapeService landscapes,
            CompositionViewService compositionViews) {
        return new LearnerService(
                mock(LearnerRepository.class),
                mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class),
                landscapes,
                mock(GoalMappingService.class),
                mock(DeckResourceService.class),
                compositionViews,
                new ObjectMapper(),
                mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
    }

    private static CurriculaService curriculaService(LandscapeService landscapes) {
        return new CurriculaService(
                landscapes,
                mock(MasteryRepository.class),
                mock(LearnerRepository.class),
                mock(CurriculumChampionRepository.class),
                mock(GitHubStatsService.class),
                mock(LearnerService.class),
                mock(CompositionViewService.class),
                new ObjectMapper(),
                new PackageCurriculumQualitySnapshotProvider());
    }

    private static LearningLandscape landscape() {
        LearningGoal goal = new LearningGoal();
        goal.setId(GOAL_ID);
        goal.setTitle("Goal");
        goal.setContains(List.of());
        LearningLandscape landscape = new LearningLandscape();
        landscape.setLandscapeId(LANDSCAPE_ID);
        landscape.setFrameworkId("canonical-gymnasium-test");
        landscape.setGoals(List.of(goal));
        return landscape;
    }

    private static LearningLandscape clusteredLandscape() {
        LearningGoal cluster = new LearningGoal();
        cluster.setId(GOAL_ID);
        cluster.setTitle("Cluster");
        cluster.setContains(List.of(CHILD_ID));
        LearningGoal child = new LearningGoal();
        child.setId(CHILD_ID);
        child.setTitle("Child");
        child.setContains(List.of());
        LearningLandscape landscape = new LearningLandscape();
        landscape.setLandscapeId(LANDSCAPE_ID);
        landscape.setFrameworkId("canonical-gymnasium-test");
        landscape.setGoals(List.of(cluster, child));
        return landscape;
    }
}
