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

    @Test
    void testFilteredPrereqDoesNotBlockAtomicFrontier() throws Exception {
        try {
            // Setup:
            // - Visible atomic requires a hidden (filtered-out) prerequisite.
            // - Filter is "LK", hidden prereq is "GK".
            // Expected: Visible atomic remains in frontier (optimistic filtering).

            Map<String, Object> personalConfig = new HashMap<>();
            personalConfig.put("test-landscape", Map.of("selected", true, "filterId", "LK"));
            String configJson = new ObjectMapper().writeValueAsString(personalConfig);

            learner.setSelectedCurriculum("test-landscape");
            learner.setPersonalCurriculum(configJson);

            LearningGoal hidden = goal("Hidden", null, null);
            hidden.setTags(List.of("GK"));

            LearningGoal visible = goal("Visible", List.of("Hidden"), null);
            visible.setTags(List.of("LK"));

            LearningGoal cluster = goal("Cluster", null, List.of("Hidden", "Visible"));
            cluster.setTags(List.of("LK"));

            LearningLandscape landscape = new LearningLandscape();
            landscape.setLandscapeId("test-landscape");
            landscape.setTitle("Test");
            landscape.setDescription("Desc");
            landscape.setCountry("DE");
            landscape.setRegion("HES");
            landscape.setSchoolType("GYM");
            landscape.setSubject("Math");
            landscape.setLocale("de-DE");
            landscape.setGoals(List.of(cluster, hidden, visible));

            when(landscapeService.getById("test-landscape")).thenReturn(landscape);
            when(landscapeService.getClosure("test-landscape")).thenReturn(List.of(landscape));

            // Plan: Cluster
            when(plannedGoalRepository.findByLearner_SkillpilotId("test-learner"))
                    .thenReturn(List.of(new com.skillpilot.backend.domain.PlannedGoal(learner, "Cluster")));

            // Mastery: None
            when(masteryRepository.findByLearner_SkillpilotId("test-learner")).thenReturn(Collections.emptyList());

            // Run getRichFrontier
            List<FrontierGoal> frontier = learnerService.getRichFrontier("test-learner");

            System.out.println("DEBUG: testFilteredPrereqDoesNotBlockAtomicFrontier Frontier: " + frontier);

            // Assertions
            assertThat(frontier).isNotEmpty();
            assertThat(frontier).anyMatch(g -> g.id().equals("Visible"));
            assertThat(frontier).anyMatch(g -> g.id().equals("Visible") && "atomic".equals(g.type()));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Test
    void testPhantomPlannedGoalReturnsTopLevel() throws Exception {
        try {
            // Setup: Plan is "PhantomID" (does not exist in Landscape).
            // Landscape has "Root" -> "Child".
            // Expected: "PhantomID" is ignored. Plan effectively empty. Returns Top Level
            // ("Root").
            // Actual (Hypothesis): Scope = {PhantomID}. Frontier = Empty.

            Map<String, Object> personalConfig = new HashMap<>();
            String configJson = new ObjectMapper().writeValueAsString(personalConfig);

            learner.setSelectedCurriculum("test-landscape");
            learner.setPersonalCurriculum(configJson);

            LearningGoal root = goal("Root", null, List.of("Child"));
            LearningGoal child = goal("Child", null, null);

            LearningLandscape landscape = new LearningLandscape();
            landscape.setLandscapeId("test-landscape");
            landscape.setTitle("Test");
            landscape.setDescription("Desc");
            landscape.setCountry("DE");
            landscape.setRegion("HES");
            landscape.setSchoolType("GYM");
            landscape.setSubject("Math");
            landscape.setLocale("de-DE");
            landscape.setGoals(List.of(root, child));

            when(landscapeService.getById("test-landscape")).thenReturn(landscape);
            when(landscapeService.getClosure("test-landscape")).thenReturn(List.of(landscape));

            // Plan: PhantomID
            when(plannedGoalRepository.findByLearner_SkillpilotId("test-learner"))
                    .thenReturn(List.of(new com.skillpilot.backend.domain.PlannedGoal(learner, "PhantomID")));

            // Mastery: None
            when(masteryRepository.findByLearner_SkillpilotId("test-learner")).thenReturn(Collections.emptyList());

            // Run getRichFrontier
            List<FrontierGoal> frontier = learnerService.getRichFrontier("test-learner");

            System.out.println("DEBUG: testPhantomPlannedGoalReturnsTopLevel Frontier: " + frontier);

            // Assertions
            // If PhantomID is ignored, we should see "Child" (The Top Level Module
            // contained in Root).
            assertThat(frontier).isNotEmpty();
            assertThat(frontier).anyMatch(g -> g.id().equals("Child"));

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Test
    void testFrontierWithMasteredPrerequisites() throws Exception {
        try {
            // Setup:
            // Cluster E.2 (GK) -> Contains:
            // - Target (GK, Unmastered) -> Requires Prereq
            // - Prereq (GK, Mastered) -> Requires DeepPrereq
            // - DeepPrereq (GK, Mastered)
            // Plan: E.2
            // Expected: Target should be in Frontier (since Prereq is mastered)

            Map<String, Object> personalConfig = new HashMap<>();
            personalConfig.put("test-landscape", Map.of("selected", true, "filterId", "GK"));
            String configJson = new ObjectMapper().writeValueAsString(personalConfig);

            learner.setSelectedCurriculum("test-landscape");
            learner.setPersonalCurriculum(configJson);

            LearningGoal target = goal("Target", List.of("Prereq"), null);
            target.setTags(List.of("GK"));

            LearningGoal prereq = goal("Prereq", List.of("DeepPrereq"), null);
            prereq.setTags(List.of("GK"));

            LearningGoal deepPrereq = goal("DeepPrereq", null, null);
            deepPrereq.setTags(List.of("GK"));

            LearningGoal cluster = goal("E.2", null, List.of("Target", "Prereq", "DeepPrereq"));
            cluster.setTags(List.of("GK"));

            LearningLandscape landscape = new LearningLandscape();
            landscape.setLandscapeId("test-landscape");
            landscape.setTitle("Test");
            landscape.setDescription("Desc");
            landscape.setCountry("DE");
            landscape.setRegion("HES");
            landscape.setSchoolType("GYM");
            landscape.setSubject("Math");
            landscape.setLocale("de-DE");
            landscape.setGoals(List.of(cluster, target, prereq, deepPrereq));

            when(landscapeService.getById("test-landscape")).thenReturn(landscape);
            when(landscapeService.getClosure("test-landscape")).thenReturn(List.of(landscape));

            // Plan: E.2
            when(plannedGoalRepository.findByLearner_SkillpilotId("test-learner"))
                    .thenReturn(List.of(new com.skillpilot.backend.domain.PlannedGoal(learner, "E.2")));

            // Mastery: Prereq and DeepPrereq are Mastered (1.0)
            com.skillpilot.backend.domain.Mastery m1 = new com.skillpilot.backend.domain.Mastery(learner, "Prereq",
                    1.0);
            com.skillpilot.backend.domain.Mastery m2 = new com.skillpilot.backend.domain.Mastery(learner, "DeepPrereq",
                    1.0);
            when(masteryRepository.findByLearner_SkillpilotId("test-learner")).thenReturn(List.of(m1, m2));

            // Run getRichFrontier
            List<FrontierGoal> frontier = learnerService.getRichFrontier("test-learner");

            System.out.println("DEBUG: testFrontierWithMasteredPrerequisites Frontier: " + frontier);

            // Assertions
            // "Target" should be visible
            assertThat(frontier).isNotEmpty();
            assertThat(frontier).anyMatch(g -> g.id().equals("Target"));

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
        return g;
    }
}
