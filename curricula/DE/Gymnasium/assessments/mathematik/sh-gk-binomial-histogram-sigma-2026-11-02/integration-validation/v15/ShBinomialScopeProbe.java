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
class ShBinomialScopeProbe {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String TASK = "c6536bfb-e658-5bf5-b207-7caeca98632c";

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
                var graph = new CompletionProfileCompiler().compileAutomatic(effective, targets, targets, "common-math-stage-and-contract-candidate");
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
                row.put("variantIsTarget", targets.contains(TASK));
                row.put("gkMatrixIsTarget", targets.contains("57aff94e-91b8-5cc6-9f85-3f317ecf36ca"));
                row.put("variantIsContext", graph.contextGoalIds().contains(TASK));
                row.put("variantImmediateContextConsumerIds", taskConsumers);
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
                row.put("normalTaskIsTarget", targets.contains("9cf020ee-4f6b-554e-97d6-eca3e2aabe99"));
                row.put("hypothesisTaskIsTarget", targets.contains("99e45593-8509-5f51-832e-39ed2a9c10d9"));
                row.put("approximationIsTarget", targets.contains("44dba16e-2e86-56be-974b-a62093ef9211"));
                row.put("approximationIsContext", graph.contextGoalIds().contains("44dba16e-2e86-56be-974b-a62093ef9211"));
                row.put("normalProbabilityIsTarget", targets.contains("8c32d941-b51c-5663-951c-a610f8900f76"));
                row.put("normalProbabilityIsContext", graph.contextGoalIds().contains("8c32d941-b51c-5663-951c-a610f8900f76"));
                Map<String, Object> directTaskRequirements = new java.util.TreeMap<>();
                for (String task : List.of("9cf020ee-4f6b-554e-97d6-eca3e2aabe99", "99e45593-8509-5f51-832e-39ed2a9c10d9"))
                    if (graph.contextGoalIds().contains(task)) directTaskRequirements.put(task, graph.directPrerequisites(task));
                row.put("normalTaskDirectRequirements", directTaskRequirements);
                row.put("sigmaIsTarget", targets.contains("8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d"));
                row.put("sigmaIsContext", graph.contextGoalIds().contains("8ad2c9c4-9362-5cb9-8fc1-e3815bfa504d"));
                row.put("newAssessmentEffectiveDirectRequirements", graph.contextGoalIds().contains(TASK) ? graph.directPrerequisites(TASK) : Set.of());
                rows.add(row);
        }
        mapper.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(), Map.of(
                "fixture", "real-backend-all154-math-offered-scopes-empty-mastery", "inputRoot", root.toString(),
                "noPrivateLearnerState", true, "scopes", rows));
        System.out.println("Wrote actual Mathematics target/context projection for " + rows.size() + " scopes.");
    }
}
