package com.skillpilot.backend.completion;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Isolated, empty-mastery fixture; no live/private learner state or DB. */
class HbWholeSymmetryScopeProbe {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String TASK = "62a1c6f2-1775-5a19-98e0-ed3dd722039f";

    public static void main(String[] args) throws Exception {
        var mapper = new ObjectMapper();
        Path root = Path.of(args[0]).toAbsolutePath().normalize();
        var properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        var landscapes = new LandscapeService(properties, mapper);
        var mappings = new GoalMappingService(properties, mapper);
        var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
        Map<String, List<String>> contains = new LinkedHashMap<>();
        canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
        var viewProperties = new LandscapeProperties();
        viewProperties.setDirectory(Path.of(args[3]).resolve("curricula").toString());
        var views = new CompositionViewService(viewProperties, mapper, () -> contains);
        var learnerService = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), mapper, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(learnerService, "compositionViewService", views);
        var completion = mock(CompletionApplicationService.class);
        var catalog = mock(CompletionProfileCatalog.class);
        when(completion.catalog()).thenReturn(catalog);
        when(catalog.automatic()).thenReturn(true);
        when(completion.automaticCanonicalGraph(eq(ROOT), any())).thenReturn(canonical);
        ReflectionTestUtils.setField(learnerService, "completionApplicationService", completion);
        var learner = new Learner();
        learner.setSelectedCurriculum(ROOT);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (var scope : mapper.readTree(Path.of(args[2]).toFile()).path("scopes")) {
            if (!"Mathematik".equals(scope.path("subject").asText()) || !scope.path("authoritative").asBoolean()) continue;
            String[] parts = scope.path("scope").asText().split("/");
            String stage = parts[1];
            String course = parts[3];
                Map<String, Object> rootConfig = new LinkedHashMap<>();
                rootConfig.put("selected", true);
                rootConfig.put("filterId", parts[0]);
                rootConfig.put("stage", stage);
                rootConfig.put("durationModel", parts[2]);
                String config = mapper.writeValueAsString(Map.of(ROOT, rootConfig,
                        MATH, Map.of("selected", true, "filterId", course)));
                Object projection = ReflectionTestUtils.invokeMethod(learnerService, "getGoalProjection", ROOT, config, false);
                Set<String> targets = ReflectionTestUtils.invokeMethod(learnerService,
                        "automaticCompletionTargets", "automatic:personal-curriculum", projection);
                Map<String, LearningGoal> effective = ReflectionTestUtils.invokeMethod(learnerService,
                        "completionGraph", learner, projection);
                Set<String> viewIds = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
                var graph = new CompletionProfileCompiler().compileAutomatic(effective, targets, targets, "hb-whole-symmetry-course-scope-candidate");
                Set<String> protectedIds = new TreeSet<>();
                Set<String> hiddenProtected = new TreeSet<>();
                Set<String> taskConsumers = new TreeSet<>();
                for (String id : graph.contextGoalIds()) {
                    LearningGoal goal = effective.get(id);
                    if (CompletionProfileCompiler.isAssessment(goal) || CompletionProfileCompiler.isMemory(goal)) {
                        protectedIds.add(id);
                        if (!targets.contains(id)) hiddenProtected.add(id);
                    }
                    if (graph.directPrerequisites(id).contains(TASK)) taskConsumers.add(id);
                }
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("scope", scope.path("scope").asText());
                row.put("compositionViewIds", new TreeSet<>(viewIds));
                row.put("targetGoalIds", new TreeSet<>(targets));
                row.put("contextGoalIds", new TreeSet<>(graph.contextGoalIds()));
                row.put("protectedContextGoalIds", protectedIds);
                row.put("protectedSupportContextGoalIds", hiddenProtected);
                row.put("uncoveredTargetGoalIds", new TreeSet<>(AutomaticCompletionIntegrity.uncoveredTargets(graph)));
                
                Set<String> unready = new TreeSet<>();
                for (String id : targets) if (CompletionProfileCompiler.isAssessment(effective.get(id)) && !com.skillpilot.backend.landscape.ExamTaskReadiness.isReady(effective.get(id).getExamData())) unready.add(id);
                row.put("unreadyAssessmentGoalIds", unready);
                Set<String> navigation = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
                Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
                Set<String> expectedNavigation = new TreeSet<>(navigation);
                expectedNavigation.retainAll(landscapes.getById(MATH).getGoals().stream().map(LearningGoal::getId).toList());
                Map<String, List<String>> paths = new java.util.TreeMap<>();
                for (String viewId : new TreeSet<>(viewIds)) {
                    Map<String, Object> view = views.findViewById(viewId);
                    if (view != null && MATH.equals(view.get("landscapeId"))) {
                        ReflectionTestUtils.invokeMethod(CurriculumCompletionIntegrityTest.class, "collectVisibleCompositionPaths", (List<?>) view.get("rootNodes"), navigation, structural, viewId, paths);
                    }
                }
                Map<String, List<String>> duplicatePaths = new java.util.TreeMap<>();
                paths.forEach((id, p) -> { if (p.size() > 1) duplicatePaths.put(id, p); });
                Set<String> missingVisible = new TreeSet<>(expectedNavigation); missingVisible.removeAll(paths.keySet());
                Set<String> unexpectedVisible = new TreeSet<>(paths.keySet()); unexpectedVisible.removeAll(expectedNavigation);
                row.put("duplicateVisibleGoalPaths", duplicatePaths);
                row.put("missingVisibleGoalIds", missingVisible);
                row.put("unexpectedVisibleGoalIds", unexpectedVisible);
                row.put("taskVisiblePaths", paths.getOrDefault(TASK, List.of()));
                row.put("selectedProtectedTargetGoalIds", new TreeSet<>(graph.protectedTargetGoalIds()));
                Map<String,Object> monitored = new java.util.TreeMap<>();
                for (String id : List.of(TASK,"dd6c5e08-0cc6-53c0-b317-ebaba277c776","772b11c9-1348-5ab9-bc3f-458c46b312b6","a12bef54-7595-5f48-a7a8-9cfe1d8e9729","4c6369b0-4b58-5ac0-915c-82c348ae1c14")) {
                    Set<String> consumers = new TreeSet<>();
                    for (String consumer : graph.contextGoalIds()) if (graph.directPrerequisites(consumer).contains(id)) consumers.add(consumer);
                    monitored.put(id, Map.of("isTarget",targets.contains(id),"isContext",graph.contextGoalIds().contains(id),"isSelectedProtectedObligation",graph.protectedTargetGoalIds().contains(id),"isHiddenProtectedSupport",hiddenProtected.contains(id),"effectiveImmediateContextConsumers",consumers,"visiblePaths",paths.getOrDefault(id,List.of())));
                }
                row.put("monitoredGoalFacts",monitored);
                Map<String, List<String>> selectedConsumerPaths = new java.util.TreeMap<>();
                for (String target : targets) {
                    if (target.equals(TASK)) continue;
                    var pending = new java.util.ArrayDeque<List<String>>();
                    pending.add(List.of(target));
                    Set<String> visited = new java.util.HashSet<>();
                    while (!pending.isEmpty()) {
                        List<String> path = pending.removeFirst();
                        String last = path.getLast();
                        if (!visited.add(last)) continue;
                        if (last.equals(TASK)) { selectedConsumerPaths.put(target, path); break; }
                        for (String prerequisite : graph.directPrerequisites(last)) {
                            List<String> next = new ArrayList<>(path); next.add(prerequisite); pending.add(next);
                        }
                    }
                }
                row.put("selectedConsumerPathsToWholeSymmetry", selectedConsumerPaths);
                rows.add(row);
        }
        mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(), Map.of(
                "fixture", "real-backend-all154-math-offered-scopes-empty-mastery", "inputRoot", root.toString(),
                "noPrivateLearnerState", true, "scopes", rows));
        System.out.println("Wrote actual Mathematics target/context projection for " + rows.size() + " scopes.");
    }
}
