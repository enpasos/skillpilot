package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.Objects;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

public class LearnerFrontierInvariantTest {

    private static final String LEARNER_ID = "test-learner";
    private static final String CURRICULUM_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String Q22_CLUSTER_ID = "edef12b4-638c-4d19-8c8d-2c0e102ef2d1";
    private static final String Q22_VECTORS_ID = "db064bbe-5adb-4661-bb78-932789919e36";
    private static final String FILTER_ID = "LK";

    private static ObjectMapper objectMapper;
    private static LandscapeService landscapeService;
    private static GoalMappingService goalMappingService;

    private LearnerService learnerService;
    private LearnerRepository learnerRepository;
    private LearnerClientStateRepository learnerClientStateRepository;
    private MasteryRepository masteryRepository;
    private PlannedGoalRepository plannedGoalRepository;
    private DeckResourceService deckResourceService;
    private ApplicationEventPublisher eventPublisher;
    private Learner learner;

    @BeforeAll
    static void initLandscapeService() {
        objectMapper = new ObjectMapper();
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(resolveCurriculaDir().toString());
        landscapeService = new LandscapeService(properties, objectMapper);
        goalMappingService = new GoalMappingService(properties, objectMapper);
    }

    @BeforeEach
    void setUp() throws Exception {
        learnerRepository = mock(LearnerRepository.class);
        learnerClientStateRepository = mock(LearnerClientStateRepository.class);
        masteryRepository = mock(MasteryRepository.class);
        plannedGoalRepository = mock(PlannedGoalRepository.class);
        deckResourceService = mock(DeckResourceService.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        learnerService = new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                objectMapper,
                eventPublisher);

        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setPersonalCurriculum(buildPersonalConfigJson());

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class))).thenAnswer(i -> i.getArguments()[0]);
    }

    @Test
    void frontierIncludesAtomicInQ22Scope() {
        setPlannedGoals(Q22_CLUSTER_ID);
        setMastery(Collections.emptyMap());

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .anyMatch(goal -> Q22_VECTORS_ID.equals(goal.id()) && "atomic".equals(goal.type()));
    }

    @Test
    void frontierMatchesReferenceForQ22Scope() throws Exception {
        setPlannedGoals(Q22_CLUSTER_ID);

        for (Map<String, Double> mastery : buildMasteryScenarios()) {
            setMastery(mastery);
            List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);
            Set<String> actual = frontier.stream().map(FrontierGoal::id).collect(Collectors.toSet());

            Set<String> expected = computeReferenceFrontier(mastery, List.of(Q22_CLUSTER_ID));

            assertThat(actual).containsExactlyInAnyOrderElementsOf(expected);
        }
    }

    @Test
    void stateMachineGoalOptionsRemainAtomicWhenPossible() {
        setPlannedGoals(Q22_CLUSTER_ID);
        setMastery(Collections.emptyMap());

        var state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(state.stateMachine().goalOptions())
                .isNotEmpty()
                .allMatch(goal -> "atomic".equals(goal.type()));
    }

    @Test
    void autoPilotLocksFirstAtomicFrontierGoalServerSide() {
        learner.setAutoPilot(true);
        setPlannedGoals(Q22_CLUSTER_ID);
        setMastery(Collections.emptyMap());

        var state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().id()).isEqualTo(learner.getActiveGoalId());
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setMastery");
        assertThat(state.stateMachine().activeGoal()).isNotNull();
        assertThat(state.stateMachine().activeGoal().id()).isEqualTo(state.activeGoal().id());
        assertThat(state.stateMachine().goalOptions())
                .hasSize(1)
                .first()
                .extracting(FrontierGoal::id)
                .isEqualTo(state.activeGoal().id());
    }

    @Test
    void frontierMatchesExportSnapshot() throws Exception {
        Snapshot snapshot = loadSnapshot("exports/learner_export_1c90a010.json");

        learner.setSelectedCurriculum(snapshot.selectedCurriculum());
        learner.setPersonalCurriculum(snapshot.personalCurriculum());

        setPlannedGoals(snapshot.plannedGoals());
        setMastery(snapshot.mastery());

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);
        Set<String> actual = frontier.stream().map(FrontierGoal::id).collect(Collectors.toSet());

        Set<String> expected = computeReferenceFrontier(
                snapshot.selectedCurriculum(),
                snapshot.personalCurriculum(),
                snapshot.mastery(),
                snapshot.plannedGoals());

        assertThat(actual).containsExactlyInAnyOrderElementsOf(expected);

        Map<String, LearningGoal> filteredGoals = getFilteredGoals(snapshot.selectedCurriculum(),
                snapshot.personalCurriculum());
        Set<String> expectedAtomic = expected.stream()
                .map(filteredGoals::get)
                .filter(Objects::nonNull)
                .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                .map(LearningGoal::getId)
                .collect(Collectors.toSet());

        if (!expectedAtomic.isEmpty()) {
            var state = learnerService.getLearnerState(LEARNER_ID);
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
            assertThat(state.stateMachine().goalOptions()).isNotEmpty()
                    .allMatch(goal -> "atomic".equals(goal.type()));
            Set<String> optionIds = state.stateMachine().goalOptions().stream()
                    .map(FrontierGoal::id)
                    .collect(Collectors.toSet());
            assertThat(optionIds).isSubsetOf(expectedAtomic);
        }
    }

    @Test
    void snapshotHasAtomicFrontierWhenAtomicUnmasteredExists() throws Exception {
        Snapshot snapshot = loadSnapshot("exports/learner_export_1c90a010.json");

        learner.setSelectedCurriculum(snapshot.selectedCurriculum());
        learner.setPersonalCurriculum(snapshot.personalCurriculum());

        setPlannedGoals(snapshot.plannedGoals());
        setMastery(snapshot.mastery());

        Map<String, LearningGoal> filteredGoals = getFilteredGoals(snapshot.selectedCurriculum(),
                snapshot.personalCurriculum());
        Map<String, LearningGoal> structuralGoals = getFilteredGoals(snapshot.selectedCurriculum(), "{}");
        Set<String> scope = computeScope(snapshot.plannedGoals(), structuralGoals);

        boolean hasUnmasteredAtomic = filteredGoals.values().stream()
                .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                .filter(goal -> scope.contains(goal.getId()))
                .anyMatch(goal -> snapshot.mastery().getOrDefault(goal.getId(), 0.0) < 0.9);

        assertThat(hasUnmasteredAtomic).isTrue();

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier).anyMatch(goal -> "atomic".equals(goal.type()));
    }

    private void setPlannedGoals(String... ids) {
        List<PlannedGoal> planned = Arrays.stream(ids)
                .map(id -> new PlannedGoal(learner, id))
                .toList();
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(planned);
    }

    private void setPlannedGoals(List<String> ids) {
        setPlannedGoals(ids.toArray(new String[0]));
    }

    private void setMastery(Map<String, Double> mastery) {
        List<Mastery> entries = mastery.entrySet().stream()
                .map(entry -> new Mastery(learner, entry.getKey(), entry.getValue()))
                .toList();
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(entries);
    }

    private static String buildPersonalConfigJson() throws Exception {
        Map<String, Object> overviewConfig = new HashMap<>();
        overviewConfig.put("selected", true);
        overviewConfig.put("filterId", FILTER_ID);

        Map<String, Object> mathConfig = new HashMap<>();
        mathConfig.put("selected", true);
        mathConfig.put("filterId", FILTER_ID);

        Map<String, Map<String, Object>> config = new HashMap<>();
        config.put(CURRICULUM_ID, overviewConfig);
        config.put(MATH_LANDSCAPE_ID, mathConfig);

        return objectMapper.writeValueAsString(config);
    }

    private static Path resolveCurriculaDir() {
        Path[] candidates = new Path[] { Path.of("..", "curricula"), Path.of("curricula") };
        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate)) {
                return candidate.toAbsolutePath().normalize();
            }
        }
        throw new IllegalStateException("Could not locate curricula directory from test execution path.");
    }

    private static List<Map<String, Double>> buildMasteryScenarios() throws Exception {
        List<Map<String, Double>> scenarios = new ArrayList<>();

        scenarios.add(Collections.emptyMap());

        Map<String, Double> oneMastered = new HashMap<>();
        oneMastered.put(Q22_VECTORS_ID, 1.0);
        scenarios.add(oneMastered);

        Map<String, Double> nearlyAll = new HashMap<>();
        Map<String, LearningGoal> filteredGoals = getFilteredGoals(CURRICULUM_ID, buildPersonalConfigJson());
        Map<String, LearningGoal> structuralGoals = getFilteredGoals(CURRICULUM_ID, "{}");
        Set<String> scope = computeScope(List.of(Q22_CLUSTER_ID), structuralGoals);
        for (String id : scope) {
            LearningGoal g = filteredGoals.get(id);
            if (g != null && (g.getContains() == null || g.getContains().isEmpty())) {
                nearlyAll.put(id, 1.0);
            }
        }
        nearlyAll.put(Q22_VECTORS_ID, 0.0); // keep one atomic unmastered
        scenarios.add(nearlyAll);

        return scenarios;
    }

    private static Set<String> computeReferenceFrontier(Map<String, Double> masteryMap, List<String> plannedIds)
            throws Exception {
        return computeReferenceFrontier(CURRICULUM_ID, buildPersonalConfigJson(), masteryMap, plannedIds);
    }

    private static Set<String> computeReferenceFrontier(String curriculumId, String personalCurriculumJson,
            Map<String, Double> masteryMap, List<String> plannedIds) throws Exception {
        Map<String, LearningGoal> filteredGoals = getFilteredGoals(curriculumId, personalCurriculumJson);
        Map<String, LearningGoal> structuralGoals = getFilteredGoals(curriculumId, "{}");

        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(filteredGoals);
        Map<String, Double> effectiveMastery = computeEffectiveMastery(filteredGoals, masteryMap);
        Map<String, Double> effectivePrereqMastery = computeEffectivePrereqMastery(filteredGoals, masteryMap);
        Set<String> scope = computeScope(plannedIds, structuralGoals);

        List<String> frontier = new ArrayList<>();
        for (LearningGoal goal : filteredGoals.values()) {
            if (!plannedIds.isEmpty() && !scope.contains(goal.getId())) {
                continue;
            }

            Double currentMastery = effectiveMastery.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= 0.9) {
                continue;
            }

            boolean prerequisitesMet = true;
            List<String> requires = effectiveRequires.getOrDefault(goal.getId(), goal.getRequires());
            if (requires != null) {
                for (String reqId : requires) {
                    String resolvedReqId = resolveGoalRef(reqId, filteredGoals);
                    if (resolvedReqId == null) {
                        continue;
                    }
                    if (!plannedIds.isEmpty() && !scope.contains(resolvedReqId)) {
                        continue;
                    }
                    Double reqMastery = effectivePrereqMastery.getOrDefault(resolvedReqId, 0.0);
                    if (reqMastery < 0.9) {
                        prerequisitesMet = false;
                        break;
                    }
                }
            }

            if (prerequisitesMet) {
                frontier.add(goal.getId());
            }
        }

        if (frontier.size() > 20) {
            List<String> atomic = frontier.stream()
                    .filter(id -> {
                        LearningGoal goal = filteredGoals.get(id);
                        return goal != null && (goal.getContains() == null || goal.getContains().isEmpty());
                    })
                    .limit(20)
                    .toList();
            if (!atomic.isEmpty()) {
                return new LinkedHashSet<>(atomic);
            }

            List<String> clusters = frontier.stream()
                    .filter(id -> {
                        LearningGoal goal = filteredGoals.get(id);
                        return goal != null && goal.getContains() != null && !goal.getContains().isEmpty();
                    })
                    .limit(20)
                    .toList();
            if (!clusters.isEmpty()) {
                return new LinkedHashSet<>(clusters);
            }

            return new LinkedHashSet<>(frontier.subList(0, Math.min(frontier.size(), 20)));
        }

        return new LinkedHashSet<>(frontier);
    }

    private static Snapshot loadSnapshot(String resourcePath) throws Exception {
        try (var stream = LearnerFrontierInvariantTest.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (stream == null) {
                throw new IllegalStateException("Snapshot resource not found: " + resourcePath);
            }
            var root = objectMapper.readTree(stream);
            var data = root.path("serverExport").path("data");
            var learnerNode = data.path("learner");
            String selectedCurriculum = learnerNode.path("selectedCurriculum").asText();
            String personalCurriculum = learnerNode.path("personalCurriculum").asText();

            List<String> plannedGoals = new ArrayList<>();
            data.path("plannedGoals").forEach(node -> plannedGoals.add(node.asText()));

            Map<String, Double> mastery = new HashMap<>();
            var masteryNode = data.path("mastery");
            var fields = masteryNode.fieldNames();
            while (fields.hasNext()) {
                String goalId = fields.next();
                double value = masteryNode.path(goalId).path("value").asDouble(0.0);
                mastery.put(goalId, value);
            }

            return new Snapshot(selectedCurriculum, personalCurriculum, plannedGoals, mastery);
        }
    }

    private record Snapshot(String selectedCurriculum, String personalCurriculum, List<String> plannedGoals,
            Map<String, Double> mastery) {
    }

    private static Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson)
            throws Exception {
        List<LearningLandscape> closure = landscapeService.getClosure(curriculumId);
        LearningLandscape root = landscapeService.getById(curriculumId);
        if (root != null && closure.stream().noneMatch(l -> l.getLandscapeId().equals(root.getLandscapeId()))) {
            closure = new ArrayList<>(closure);
            closure.add(root);
        }

        Map<String, Map<String, Object>> config = new HashMap<>();
        if (personalCurriculumJson != null && !personalCurriculumJson.isBlank()) {
            config = objectMapper.readValue(personalCurriculumJson, new TypeReference<>() {
            });
            if (config == null) {
                config = new HashMap<>();
            }
        }

        Map<String, LearningGoal> allGoals = new HashMap<>();
        for (LearningLandscape landscape : closure) {
            boolean isSelected = true;
            String filterId = null;

            if (!config.isEmpty()) {
                Map<String, Object> landscapeConfig = config.get(landscape.getLandscapeId());
                if (landscapeConfig != null) {
                    Object selectedObj = landscapeConfig.get("selected");
                    if (selectedObj instanceof Boolean) {
                        isSelected = (Boolean) selectedObj;
                    }
                    Object filterObj = landscapeConfig.get("filterId");
                    if (filterObj instanceof String) {
                        filterId = (String) filterObj;
                    }
                } else {
                    isSelected = false;
                    if (landscape.getLandscapeId().equals(curriculumId)) {
                        isSelected = true;
                    }
                }
            }

            if (!isSelected) {
                continue;
            }

            if (landscape.getGoals() != null) {
                for (LearningGoal g : landscape.getGoals()) {
                    if (filterId != null && !filterId.isBlank()) {
                        boolean tagMatch = false;
                        if (g.getTags() == null || g.getTags().isEmpty() || g.getTags().contains(filterId)) {
                            tagMatch = true;
                        }
                        if (!tagMatch) {
                            continue;
                        }
                    }
                    allGoals.put(g.getId(), g);
                }
            }
        }

        return allGoals;
    }

    private static Map<String, List<String>> computeEffectiveRequires(Map<String, LearningGoal> allGoals) {
        Map<String, List<String>> parentMap = new HashMap<>();
        for (LearningGoal goal : allGoals.values()) {
            List<String> contains = goal.getContains();
            if (contains == null) {
                continue;
            }
            for (String childRef : contains) {
                String resolvedChild = resolveGoalRef(childRef, allGoals);
                if (resolvedChild == null) {
                    continue;
                }
                parentMap.computeIfAbsent(resolvedChild, key -> new ArrayList<>()).add(goal.getId());
            }
        }

        Map<String, List<String>> memo = new HashMap<>();
        Set<String> visiting = new HashSet<>();

        for (String goalId : allGoals.keySet()) {
            collectEffectiveRequires(goalId, allGoals, parentMap, memo, visiting);
        }

        return memo;
    }

    private static List<String> collectEffectiveRequires(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, List<String>> parentMap, Map<String, List<String>> memo, Set<String> visiting) {
        if (memo.containsKey(goalId)) {
            return memo.get(goalId);
        }
        if (visiting.contains(goalId)) {
            LearningGoal self = allGoals.get(goalId);
            List<String> direct = self != null && self.getRequires() != null ? self.getRequires()
                    : Collections.emptyList();
            memo.put(goalId, direct);
            return direct;
        }

        visiting.add(goalId);

        LinkedHashSet<String> effective = new LinkedHashSet<>();
        LearningGoal goal = allGoals.get(goalId);
        if (goal != null && goal.getRequires() != null) {
            effective.addAll(goal.getRequires());
        }

        List<String> parents = parentMap.getOrDefault(goalId, Collections.emptyList());
        for (String parentId : parents) {
            List<String> parentReqs = collectEffectiveRequires(parentId, allGoals, parentMap, memo, visiting);
            effective.addAll(parentReqs);
        }

        effective.remove(goalId);

        List<String> result = new ArrayList<>(effective);
        memo.put(goalId, result);
        visiting.remove(goalId);
        return result;
    }

    private static Map<String, Double> computeEffectiveMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();

        for (String goalId : allGoals.keySet()) {
            computeEffectiveMastery(goalId, allGoals, masteryMap, cache, visiting);
        }

        return cache;
    }

    private static double computeEffectiveMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<Double> childValues = new ArrayList<>();
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                childValues.add(computeEffectiveMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private static Map<String, Double> computeEffectivePrereqMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();

        for (String goalId : allGoals.keySet()) {
            computeEffectivePrereqMastery(goalId, allGoals, masteryMap, cache, visiting);
        }

        return cache;
    }

    private static double computeEffectivePrereqMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<String> childIds = new ArrayList<>();
            boolean hasCoreChild = false;
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                childIds.add(childId);
                LearningGoal child = allGoals.get(childId);
                if (child != null && isCoreForPrereqs(child)) {
                    hasCoreChild = true;
                }
            }

            List<Double> childValues = new ArrayList<>();
            for (String childId : childIds) {
                LearningGoal child = allGoals.get(childId);
                if (child == null) {
                    continue;
                }
                if (hasCoreChild && !isCoreForPrereqs(child)) {
                    continue;
                }
                childValues.add(computeEffectivePrereqMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private static boolean isCoreForPrereqs(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }
        return tags.contains("GK");
    }

    private static Set<String> computeScope(List<String> plannedIds, Map<String, LearningGoal> allGoals) {
        if (plannedIds == null || plannedIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> scope = new HashSet<>();
        for (String pid : plannedIds) {
            if (allGoals.containsKey(pid)) {
                scope.add(pid);
            }
        }

        Set<String> descendants = new HashSet<>();
        for (String pid : plannedIds) {
            collectDescendants(pid, allGoals, descendants);
        }
        scope.addAll(descendants);
        return scope;
    }

    private static void collectDescendants(String goalId, Map<String, LearningGoal> allGoals, Set<String> result) {
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null || goal.getContains() == null) {
            return;
        }

        Deque<String> stack = new ArrayDeque<>(goal.getContains());
        while (!stack.isEmpty()) {
            String childRef = stack.pop();
            String childId = resolveGoalRef(childRef, allGoals);
            if (childId == null) {
                continue;
            }
            if (result.add(childId)) {
                LearningGoal child = allGoals.get(childId);
                if (child != null && child.getContains() != null) {
                    stack.addAll(child.getContains());
                }
            }
        }
    }

    private static String resolveGoalRef(String ref, Map<String, LearningGoal> allGoals) {
        if (ref == null || ref.isBlank() || allGoals == null || allGoals.isEmpty()) {
            return null;
        }
        if (allGoals.containsKey(ref)) {
            return ref;
        }
        if (ref.contains(":")) {
            String[] parts = ref.split(":", 2);
            if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                return parts[1];
            }
        }
        String suffix = ":" + ref;
        for (String key : allGoals.keySet()) {
            if (key.endsWith(suffix)) {
                return key;
            }
        }
        return null;
    }
}
