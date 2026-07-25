package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.landscape.PersonalizationFlow;
import com.skillpilot.backend.landscape.PersonalizationGroup;
import com.skillpilot.backend.landscape.PersonalizationOptionSource;
import com.skillpilot.backend.landscape.PersonalizationSourceKind;
import com.skillpilot.backend.landscape.PersonalizationStage;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class LearnerSelectedLandscapeRuntimeTest {

    private static final String ROOT_ID = "landscape-orbit-runtime";
    private static final String SELECTED_ID = "landscape-cobalt-runtime";
    private static final String FOREIGN_ID = "landscape-foreign-runtime";
    private static final String MODE_ALPHA = "Mode-Alpha";
    private static final String MODE_BETA = "Mode-Beta";

    private final LandscapeService landscapeService = mock(LandscapeService.class);

    private LearnerService learnerService;

    @BeforeEach
    void setUp() {
        LearningLandscape root = landscape(
                ROOT_ID,
                List.of(goal("goal-root-runtime")),
                List.of());
        LearningLandscape selected = landscape(
                SELECTED_ID,
                List.of(
                        goal("goal-cobalt-alpha-runtime", MODE_ALPHA),
                        goal("goal-cobalt-beta-runtime", MODE_BETA)),
                List.of(
                        filter(MODE_ALPHA),
                        filter(MODE_BETA)));
        LearningLandscape foreign = landscape(
                FOREIGN_ID,
                List.of(goal("goal-foreign-runtime")),
                List.of());
        root.setPersonalizationFlow(flowForSelectedLandscape());

        when(landscapeService.getClosure(ROOT_ID)).thenReturn(List.of(root));
        when(landscapeService.getById(ROOT_ID)).thenReturn(root);
        when(landscapeService.getById(SELECTED_ID)).thenReturn(selected);
        when(landscapeService.getById(FOREIGN_ID)).thenReturn(foreign);

        learnerService = new LearnerService(
                mock(LearnerRepository.class),
                mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class),
                landscapeService,
                mock(GoalMappingService.class),
                mock(DeckResourceService.class),
                new ObjectMapper(),
                mock(ApplicationEventPublisher.class));
    }

    @Test
    void selectedFlowLandscapeContributesGoalsWithoutAnyGraphConnection() {
        Set<String> atomicGoalIds = learnerService.getFilteredAtomicGoalIds(
                ROOT_ID,
                """
                {
                  "landscape-cobalt-runtime": {
                    "selected": true,
                    "filterId": "Mode-Alpha"
                  }
                }
                """,
                null,
                false);

        assertThat(atomicGoalIds)
                .containsExactly(
                        "goal-root-runtime",
                        "goal-cobalt-alpha-runtime");
    }

    @Test
    void selectedConfigurationCannotInjectALandscapeOutsideTheAuthoredFlow() {
        Set<String> atomicGoalIds = learnerService.getFilteredAtomicGoalIds(
                ROOT_ID,
                """
                {
                  "landscape-cobalt-runtime": {
                    "selected": true,
                    "filterId": "Mode-Alpha"
                  },
                  "landscape-foreign-runtime": {
                    "selected": true
                  }
                }
                """,
                null,
                false);

        assertThat(atomicGoalIds)
                .containsExactly(
                        "goal-root-runtime",
                        "goal-cobalt-alpha-runtime")
                .doesNotContain("goal-foreign-runtime");
    }

    @Test
    void unselectedFlowLandscapeDoesNotContributeGoals() {
        Set<String> atomicGoalIds = learnerService.getFilteredAtomicGoalIds(
                ROOT_ID,
                """
                {
                  "landscape-cobalt-runtime": {
                    "selected": false
                  }
                }
                """,
                null,
                false);

        assertThat(atomicGoalIds)
                .containsExactly("goal-root-runtime");
    }

    private static LearningLandscape landscape(
            String id,
            List<LearningGoal> goals,
            List<LandscapeFilter> filters) {
        LearningLandscape landscape = new LearningLandscape();
        landscape.setLandscapeId(id);
        landscape.setSubject(id);
        landscape.setFrameworkId("neutral-runtime");
        landscape.setGoals(goals);
        landscape.setFilters(filters);
        return landscape;
    }

    private static LearningGoal goal(String id, String... tags) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setDescription(id);
        goal.setCore(true);
        goal.setWeight(1);
        goal.setContains(List.of());
        goal.setRequires(List.of());
        goal.setTags(List.of(tags));
        return goal;
    }

    private static LandscapeFilter filter(String id) {
        LandscapeFilter filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(id);
        return filter;
    }

    private static PersonalizationFlow flowForSelectedLandscape() {
        PersonalizationFlow flow = new PersonalizationFlow();
        flow.setVersion("1");
        flow.setStages(List.of(
                stage(
                        "stage-landscape",
                        1,
                        group(
                                "group-landscape",
                                1,
                                landscapes(SELECTED_ID))),
                stage(
                        "stage-mode",
                        2,
                        group(
                                "group-mode",
                                1,
                                filtersForSelectedLandscapes("group-landscape")))));
        return flow;
    }

    private static PersonalizationStage stage(
            String id,
            int order,
            PersonalizationGroup group) {
        PersonalizationStage stage = new PersonalizationStage();
        stage.setId(id);
        stage.setOrder(order);
        stage.setLabel(id);
        stage.setGroups(List.of(group));
        return stage;
    }

    private static PersonalizationGroup group(
            String id,
            int order,
            PersonalizationOptionSource source) {
        PersonalizationGroup group = new PersonalizationGroup();
        group.setId(id);
        group.setOrder(order);
        group.setLabel(id);
        group.setMinSelections(1);
        group.setMaxSelections(1);
        group.setSource(source);
        return group;
    }

    private static PersonalizationOptionSource landscapes(String... landscapeIds) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.LANDSCAPES);
        source.setLandscapeIds(List.of(landscapeIds));
        return source;
    }

    private static PersonalizationOptionSource filtersForSelectedLandscapes(
            String groupId) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.FILTERS_FOR_SELECTED_LANDSCAPES);
        source.setSelectedLandscapesFromGroupId(groupId);
        return source;
    }
}
