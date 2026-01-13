package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;

public class LearnerServiceReproTest {

    private LearnerService learnerService;
    private LandscapeService landscapeService;
    private LearnerRepository learnerRepository;
    private MasteryRepository masteryRepository;
    private PlannedGoalRepository plannedGoalRepository;
    private ApplicationEventPublisher eventPublisher;

    // Promoted to class field
    private Learner learner;

    private String learnerId = "test-learner";
    private String curriculumId = "CURR_1";

    @BeforeEach
    void setUp() {
        landscapeService = mock(LandscapeService.class);
        learnerRepository = mock(LearnerRepository.class);
        masteryRepository = mock(MasteryRepository.class);
        plannedGoalRepository = mock(PlannedGoalRepository.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        learnerService = new LearnerService(
                learnerRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                new ObjectMapper(),
                eventPublisher);

        // Mock Learner
        learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(curriculumId);
        learner.setLearningState(LearningState.FRONTIER);
        when(learnerRepository.findById(learnerId)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(learnerId)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class))).thenAnswer(i -> i.getArguments()[0]);

        // Mock Planned Goals (Focus on Year 11)
        when(plannedGoalRepository.findByLearner_SkillpilotId(learnerId)).thenReturn(List.of(
                new com.skillpilot.backend.domain.PlannedGoal(learner, "YEAR_11")));

        // Mock Mastery (Empty for now)
        when(masteryRepository.findByLearner_SkillpilotId(learnerId)).thenReturn(Collections.emptyList());
    }

    @Test
    void getRichFrontier_shouldResolveQualifiedIdsMatches() {
        LearningLandscape landscape = new LearningLandscape();
        landscape.setLandscapeId(curriculumId);

        LearningGoal root = goal("ROOT", null, List.of("YEAR_11"));
        LearningGoal year11 = goal("YEAR_11", null, List.of("Subject:GoalA", "Subject:GoalB")); // Qualified Ref

        // In the map/closure, we have simple IDs
        LearningGoal goalA = goal("GoalA", List.of("EXTERNAL_REQ"), null);
        LearningGoal goalB = goal("GoalB", List.of("GoalA"), null);

        landscape.setGoals(List.of(root, year11, goalA, goalB));

        when(landscapeService.getById(curriculumId)).thenReturn(landscape);
        when(landscapeService.getClosure(curriculumId)).thenReturn(List.of(landscape));

        // Execute
        List<FrontierGoal> frontier = null;
        try {
            frontier = learnerService.getRichFrontier(learnerId);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }

        // Debug output
        System.out.println("Frontier: " + frontier);

        // Assert
        assertThat(frontier).isNotEmpty();
        // GoalA should be visible because EXTERNAL_REQ is out of scope (Pragmatic
        // Filter)
        assertThat(frontier).anyMatch(g -> g.id().equals("GoalA"));

        // GoalB should NOT be visible because GoalA is unmastered
        assertThat(frontier).noneMatch(g -> g.id().equals("GoalB"));
    }

    @Test
    void testStrictTagFilteringHidesChildren() throws Exception {
        try {
            // Setup: "Cluster" has "GK" tag, "Atomic" child has NO tags (or "LK")
            // Filter is "GK".
            // Expected: Cluster passes filter, Atomic is dropped.
            // Result: collectDescendants fails to find Atomic. Frontier shows Cluster only.

            Map<String, Object> personalConfig = new HashMap<>();
            personalConfig.put("test-landscape", Map.of("selected", true, "filterId", "GK"));
            String configJson = new ObjectMapper().writeValueAsString(personalConfig);

            learner.setSelectedCurriculum("test-landscape");
            learner.setPersonalCurriculum(configJson);

            LearningGoal itemA = goal("A", null, List.of("B"));
            itemA.setTags(List.of("GK")); // Passes filter

            LearningGoal itemB = goal("B", null, null);
            itemB.setTags(Collections.emptyList()); // No tags -> FAILS filter "GK"

            LearningLandscape landscape = new LearningLandscape();
            landscape.setLandscapeId("test-landscape");
            landscape.setTitle("Test");
            landscape.setDescription("Desc");
            landscape.setCountry("DE");
            landscape.setRegion("HES");
            landscape.setSchoolType("GYM");
            landscape.setSubject("Math");
            landscape.setLocale("de-DE");
            landscape.setGoals(List.of(itemA, itemB));
            when(landscapeService.getById("test-landscape")).thenReturn(landscape);
            when(landscapeService.getClosure("test-landscape")).thenReturn(List.of(landscape));

            // Plan: A
            when(plannedGoalRepository.findByLearner_SkillpilotId("test-learner"))
                    .thenReturn(List.of(new com.skillpilot.backend.domain.PlannedGoal(learner, "A")));

            // Mastery: None
            when(masteryRepository.findByLearner_SkillpilotId("test-learner")).thenReturn(Collections.emptyList());

            // Run getRichFrontier
            List<FrontierGoal> frontier = learnerService.getRichFrontier("test-learner");

            System.out.println("DEBUG: testStrictTagFilteringHidesChildren Frontier: " + frontier);

            // Assertions
            // "A" should be in frontier.
            // "B" should ALSO be in frontier if we allow untagged goals to match filters.
            // So frontier has size 2 ("A", "B").
            assertThat(frontier).isNotEmpty();
            assertThat(frontier).hasSize(2);
            assertThat(frontier).anyMatch(g -> g.id().equals("A"));
            assertThat(frontier).anyMatch(g -> g.id().equals("B"));

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    private LearningGoal goal(String id, List<String> requires, List<String> contains) {
        LearningGoal g = new LearningGoal();
        g.setId(id);
        g.setTitle("Title for " + id);
        g.setRequires(requires == null ? new ArrayList<>() : new ArrayList<>(requires));
        g.setContains(contains == null ? new ArrayList<>() : new ArrayList<>(contains));
        if (contains == null || contains.isEmpty()) {
            // atomic
        }
        return g;
    }
}
