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
class rpMathCandidateBackendProjectionDiagnostic {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String TASK = "64f37348-20f7-55b1-82a8-8fc388087577";

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
        var views = new CompositionViewService(properties, mapper, () -> contains);
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
        for (String duration : List.of("G8", "G9")) {
        for (String stage : List.of("SekI", "SekII", "CrossStage")) {
            for (String course : "SekI".equals(stage) ? List.of("GK+LK") : List.of("GK", "LK", "GK+LK")) {
                Map<String, Object> rootConfig = new LinkedHashMap<>();
                rootConfig.put("selected", true);
                rootConfig.put("filterId", "DE-RP");
                rootConfig.put("stage", stage);
                rootConfig.put("durationModel", duration);
                String config = mapper.writeValueAsString(Map.of(ROOT, rootConfig,
                        MATH, Map.of("selected", true, "filterId", course)));
                Object projection = ReflectionTestUtils.invokeMethod(learnerService, "getGoalProjection", ROOT, config, false);
                Set<String> targets = ReflectionTestUtils.invokeMethod(learnerService,
                        "automaticCompletionTargets", "automatic:personal-curriculum", projection);
                Map<String, LearningGoal> effective = ReflectionTestUtils.invokeMethod(learnerService,
                        "completionGraph", learner, projection);
                Set<String> viewIds = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
                var graph = new CompletionProfileCompiler().compileAutomatic(effective, targets, targets, "rp-source-candidate");
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
                row.put("scope", "DE-RP/" + stage + "/" + duration + "/" + course);
                row.put("compositionViewIds", new TreeSet<>(viewIds));
                row.put("targetGoalIds", new TreeSet<>(targets));
                row.put("contextGoalIds", new TreeSet<>(graph.contextGoalIds()));
                row.put("protectedContextGoalIds", protectedIds);
                row.put("unaddressableProtectedContextGoalIds", hiddenProtected);
                row.put("sphereSurfaceIsTarget", targets.contains(TASK));
                row.put("sphereSurfaceIsContext", graph.contextGoalIds().contains(TASK));
                row.put("sphereSurfaceImmediateContextConsumerIds", taskConsumers);
                row.put("uncoveredTargetGoalIds", new TreeSet<>(AutomaticCompletionIntegrity.uncoveredTargets(graph)));
                Map<String, Object> taskDetails = new LinkedHashMap<>();
                for (String taskId : List.of(TASK, "926d0551-4537-569e-b6ad-fc33bb17546e", "e5055665-89ae-5be6-8fc7-42a9e991d63d")) {
                    Map<String, Object> detail = new LinkedHashMap<>();
                    detail.put("target", targets.contains(taskId));
                    detail.put("context", graph.contextGoalIds().contains(taskId));
                    detail.put("effectiveDirectPrerequisiteIds", new TreeSet<>(graph.directPrerequisites(taskId)));
                    Set<String> support = new TreeSet<>();
                    var queue = new java.util.ArrayDeque<String>(graph.directPrerequisites(taskId));
                    while (!queue.isEmpty()) {
                        var id = queue.removeFirst();
                        if (support.add(id)) queue.addAll(graph.directPrerequisites(id));
                    }
                    detail.put("supportContextGoalIds", support);
                    taskDetails.put(taskId, detail);
                }
                row.put("taskDetails", taskDetails);
                rows.add(row);
            }
        }
        }
        mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(), Map.of(
                "fixture", "real-backend-RP-fourteen-offered-scopes-empty-mastery", "inputRoot", root.toString(),
                "noPrivateLearnerState", true, "scopes", rows));
        System.out.println("Wrote actual RP target/context projection for " + rows.size() + " scopes.");
    }
}
