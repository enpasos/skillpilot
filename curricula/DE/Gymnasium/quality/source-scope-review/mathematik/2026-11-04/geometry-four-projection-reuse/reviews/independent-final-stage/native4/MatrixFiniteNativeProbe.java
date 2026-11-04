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
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Finite empty-mastery projection; public chosen-cursor tests are a separate private-Main run. */
public class MatrixFiniteNativeProbe {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String TASK = "aa56cd8e-232e-5c16-bd9b-7ccdbe67c22a";
    private static final String OLD_J8 = "5fb3ee61-059c-47f4-8c6f-7285d7982a41";
    private static final String CONTAINER = "reviewed-stage-additions-de-sh";

    private static boolean mutation(java.lang.reflect.Method method) {
        String name = method.getName();
        return name.startsWith("save") || name.startsWith("delete") || name.startsWith("flush")
                || method.isAnnotationPresent(org.springframework.data.jpa.repository.Modifying.class);
    }

    private static void noMutations(List<Object> repositories, ApplicationEventPublisher events) {
        for (Object repository : repositories) {
            for (var invocation : org.mockito.Mockito.mockingDetails(repository).getInvocations()) {
                if (mutation(invocation.getMethod())) {
                    throw new AssertionError("Projection mutation: " + invocation.getMethod());
                }
            }
        }
        org.mockito.Mockito.verifyNoInteractions(events);
    }

    private static Set<String> needed(CompiledAutomaticCompletion graph) {
        Set<String> needed = new TreeSet<>();
        var pending = new ArrayDeque<>(graph.protectedTargetGoalIds());
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (needed.add(id)) pending.addAll(graph.directPrerequisites(id));
        }
        return needed;
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 4) throw new IllegalArgumentException("dataRoot gzipOutput decisionJson rootMainClasses");
        var mapper = new ObjectMapper();
        Path root = Path.of(args[0]).toAbsolutePath().normalize();
        Path expectedMain = Path.of(args[3]).toAbsolutePath().normalize();
        Map<String, String> origins = new TreeMap<>();
        for (Class<?> type : List.of(LearnerService.class, LandscapeService.class, GoalMappingService.class,
                CompositionViewService.class, CompletionProfileCompiler.class)) {
            Path origin = Path.of(type.getProtectionDomain().getCodeSource().getLocation().toURI()).toAbsolutePath().normalize();
            if (!origin.equals(expectedMain)) throw new AssertionError("Unexpected Root Main origin: " + type);
            origins.put(type.getName(), origin.toString());
        }
        origins.put(CurriculumCompletionIntegrityTest.class.getName(), Path.of(
                CurriculumCompletionIntegrityTest.class.getProtectionDomain().getCodeSource().getLocation().toURI()).toString());
        var properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        var landscapes = new LandscapeService(properties, mapper);
        var mappings = new GoalMappingService(properties, mapper);
        landscapes.pinRuntimeGeneration();
        mappings.pinRuntimeGeneration();
        var views = new CompositionViewService(properties, mapper, landscapes);
        Map<String, LearningGoal> canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
        var taskChain = new CompletionProfileCompiler().compileAutomatic(canonical, Set.of(TASK), Set.of(TASK), "matrix-whole-task-support");
        Set<String> support = new TreeSet<>(taskChain.contextGoalIds());
        support.remove(TASK);
        if (support.size() != 18) throw new AssertionError("Expected full18 preparation atoms");

        var learners = mock(LearnerRepository.class);
        var clients = mock(LearnerClientStateRepository.class);
        var masteries = mock(MasteryRepository.class);
        var plans = mock(PlannedGoalRepository.class);
        var events = mock(ApplicationEventPublisher.class);
        var service = new LearnerService(learners, clients, masteries, plans, landscapes, mappings,
                mock(DeckResourceService.class), mapper, events);
        ReflectionTestUtils.setField(service, "compositionViewService", views);
        // Same isolated automatic-canonical adapter as the existing corpus sampler.
        // No public capability/evaluation path uses this adapter.
        var completion = mock(CompletionApplicationService.class);
        var catalog = mock(CompletionProfileCatalog.class);
        when(completion.catalog()).thenReturn(catalog);
        when(catalog.automatic()).thenReturn(true);
        when(completion.automaticCanonicalGraph(eq(ROOT), any())).thenReturn(canonical);
        ReflectionTestUtils.setField(service, "completionApplicationService", completion);
        var learner = new Learner();
        learner.setSelectedCurriculum(ROOT);
        String initialLearner = mapper.writeValueAsString(learner);

        // Existing ALL planner needs mock setup writes. Keep them outside the measured service.
        var setupLearners = mock(LearnerRepository.class);
        var setupClients = mock(LearnerClientStateRepository.class);
        var setupMasteries = mock(MasteryRepository.class);
        var setupPlans = mock(PlannedGoalRepository.class);
        var setupEvents = mock(ApplicationEventPublisher.class);
        var setup = new LearnerService(setupLearners, setupClients, setupMasteries, setupPlans, landscapes,
                mappings, mock(DeckResourceService.class), mapper, setupEvents);
        ReflectionTestUtils.setField(setup, "compositionViewService", views);
        var offerings = currentOfferings(root, setup, landscapes);
        int setupSaveCount = 0;
        for (var invocation : org.mockito.Mockito.mockingDetails(setupLearners).getInvocations()) {
            if (mutation(invocation.getMethod())) {
                if (!invocation.getMethod().getName().equals("save") || invocation.getArguments().length != 1
                        || !(invocation.getArgument(0) instanceof Learner draft)
                        || draft.getSkillpilotId() != null || !ROOT.equals(draft.getSelectedCurriculum())) {
                    throw new AssertionError("Unexpected inventory setup mutation");
                }
                setupSaveCount++;
            }
        }
        for (Object repository : List.of(setupClients, setupMasteries, setupPlans)) {
            for (var invocation : org.mockito.Mockito.mockingDetails(repository).getInvocations()) {
                if (mutation(invocation.getMethod())) throw new AssertionError("Inventory non-learner mutation");
            }
        }
        int setupEventCount = 0;
        for (var invocation : org.mockito.Mockito.mockingDetails(setupEvents).getInvocations()) {
            if (!invocation.getMethod().getName().equals("publishEvent") || invocation.getArguments().length != 1
                    || !(invocation.getArgument(0) instanceof com.skillpilot.backend.events.LearnerStateChangedEvent event)
                    || event.getSkillpilotId() != null || !"PERSONALIZATION_UPDATE".equals(event.getChangeType())) {
                throw new AssertionError("Unexpected inventory setup event");
            }
            setupEventCount++;
        }
        if (setupSaveCount <= 0 || setupSaveCount != setupEventCount) throw new AssertionError("Missing inventory setup evidence");
        Map<String, String> decisions = new TreeMap<>();
        for (var row : mapper.readTree(Path.of(args[2]).toFile()).path("pairs")) {
            if (decisions.put(row.path("scope").asText(), row.path("decision").asText()) != null) {
                throw new AssertionError("Duplicate approved scope");
            }
        }
        if (!decisions.keySet().equals(offerings.stream().map(s -> s.offering().id())
                .collect(java.util.stream.Collectors.toCollection(TreeSet::new)))) throw new AssertionError("Current161 inventory drift");

        List<Map<String, Object>> rows = new ArrayList<>();
        for (var scoped : offerings) {
            String scope = scoped.offering().id();
            String config = mapper.writeValueAsString(scoped.config());
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT, config, false);
            Set<String> targets = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", "automatic:personal-curriculum", projection);
            Map<String, LearningGoal> graphGoals = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            var graph = new CompletionProfileCompiler().compileAutomatic(graphGoals, targets, targets, "matrix-finite-current161-M0");
            Set<String> navigation = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Set<String> prerequisiteOnly = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
            Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
            Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
            Set<String> viewIds = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
            Set<String> demand = needed(graph);
            Map<String, Set<String>> relations = new TreeMap<>();
            graph.contextGoalIds().forEach(id -> relations.put(id, new TreeSet<>(graph.directPrerequisites(id))));
            Map<String, Object> eligibility = new TreeMap<>();
            Set<String> unready = new TreeSet<>();
            for (var goal : canonical.values()) {
                if (!CompletionProfileCompiler.isAssessment(goal) && !CompletionProfileCompiler.isMemory(goal)) continue;
                String id = goal.getId();
                boolean ready = !CompletionProfileCompiler.isAssessment(goal)
                        || com.skillpilot.backend.landscape.ExamTaskReadiness.isReady(goal.getExamData());
                if (targets.contains(id) && !ready) unready.add(id);
                eligibility.put(id, Map.of("structurallyAvailable", structural.containsKey(id),
                        "projectedVisible", visible.containsKey(id), "isTarget", targets.contains(id),
                        "isContext", graph.contextGoalIds().contains(id), "isSelectedProtectedObligation",
                        graph.protectedTargetGoalIds().contains(id), "isHiddenProtectedSupport",
                        graph.contextGoalIds().contains(id) && !targets.contains(id), "examReady", ready));
            }
            Map<String, Object> supportFacts = new TreeMap<>();
            for (String id : support) supportFacts.put(id, Map.of("title", canonical.get(id).getTitle(),
                    "isTarget", targets.contains(id), "isNavigationTarget", navigation.contains(id),
                    "projectedVisible", visible.containsKey(id),
                    "isPrerequisiteOnly", prerequisiteOnly.contains(id), "isContext", graph.contextGoalIds().contains(id),
                    "neededAtM0", demand.contains(id), "directPrerequisiteIds", new TreeSet<>(taskChain.directPrerequisites(id))));
            Map<String, List<String>> paths = new TreeMap<>();
            Map<String, Object> duplicateStructures = new TreeMap<>();
            Map<String, Object> mathTrees = new TreeMap<>();
            for (String viewId : new TreeSet<>(viewIds)) {
                Map<String, Object> view = views.findViewById(viewId);
                if (view == null || !MATH.equals(view.get("landscapeId"))) continue;
                Map<String, List<String>> duplicates = ReflectionTestUtils.invokeMethod(CurriculumCompletionIntegrityTest.class,
                        "duplicateStructureIds", (List<?>) view.get("rootNodes"), viewId);
                if (!duplicates.isEmpty()) duplicateStructures.put(viewId, duplicates);
                ReflectionTestUtils.invokeMethod(CurriculumCompletionIntegrityTest.class, "collectVisibleCompositionPaths",
                        (List<?>) view.get("rootNodes"), navigation, structural, viewId, paths);
                mathTrees.put(viewId, view);
            }
            if (mathTrees.isEmpty()) throw new AssertionError("Missing actual Math view: " + scope);
            Map<String, List<String>> duplicatePaths = new TreeMap<>();
            paths.forEach((id, locations) -> { if (locations.size() > 1) duplicatePaths.put(id, locations); });
            Set<String> expectedVisible = new TreeSet<>(navigation);
            expectedVisible.retainAll(landscapes.getById(MATH).getGoals().stream().map(LearningGoal::getId).toList());
            Set<String> missing = new TreeSet<>(expectedVisible); missing.removeAll(paths.keySet());
            Set<String> unexpected = new TreeSet<>(paths.keySet()); unexpected.removeAll(expectedVisible);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("scope", scope); row.put("personalCurriculumConfig", scoped.config());
            row.put("scopeDecision", decisions.get(scope)); row.put("compositionViewIds", new TreeSet<>(viewIds));
            row.put("targetGoalIds", new TreeSet<>(targets)); row.put("wholeNavigationTargetGoalIds", new TreeSet<>(navigation));
            row.put("prerequisiteOnlyGoalIds", new TreeSet<>(prerequisiteOnly)); row.put("contextGoalIds", new TreeSet<>(graph.contextGoalIds()));
            row.put("effectiveDirectPrerequisitesByContextGoalId", relations); row.put("neededContextGoalIdsAtM0", demand);
            row.put("selectedProtectedTargetGoalIds", new TreeSet<>(graph.protectedTargetGoalIds()));
            row.put("uncoveredTargetGoalIds", new TreeSet<>(AutomaticCompletionIntegrity.uncoveredTargets(graph)));
            Set<String> endpoints = new TreeSet<>(AutomaticCompletionIntegrity.uncoveredTargets(graph));
            relations.values().forEach(endpoints::removeAll); row.put("uncoveredEndpointGoalIds", endpoints);
            row.put("allExistingProtectedEligibility", eligibility); row.put("whole18PreparationFacts", supportFacts);
            row.put("unreadyAssessmentGoalIds", unready); row.put("duplicateVisibleGoalPaths", duplicatePaths);
            row.put("duplicateStructureIds", duplicateStructures); row.put("missingVisibleGoalIds", missing);
            row.put("unexpectedVisibleGoalIds", unexpected); row.put("visibleGoalPaths", paths);
            row.put("taskVisiblePaths", paths.getOrDefault(TASK, List.of())); row.put("authoritative", true);
            boolean hierarchy = !duplicatePaths.isEmpty() || !duplicateStructures.isEmpty() || !missing.isEmpty() || !unexpected.isEmpty();
            row.put("passed", AutomaticCompletionIntegrity.uncoveredTargets(graph).isEmpty() && unready.isEmpty() && !hierarchy);
            if (scope.startsWith("DE-SH/") && !scope.contains("/SekII/")) {
                Map<String, Object> focusFacts = new TreeMap<>();
                for (String viewId : mathTrees.keySet()) {
                    for (String ref : List.of(OLD_J8, "composition:" + viewId + ":structure:" + CONTAINER)) {
                        List<String> validated = ReflectionTestUtils.invokeMethod(service, "resolveProjectedTargetFocusIds", List.of(ref), projection);
                        List<String> members = ReflectionTestUtils.invokeMethod(service, "resolveProjectedFocusTargetIds", ref, projection);
                        Set<String> atoms = ReflectionTestUtils.invokeMethod(service, "projectedAtomicTargetIds", List.of(ref), projection);
                        focusFacts.put(ref, Map.of("validatedStoredFocusIds", validated,
                                "fullProjectedFocusTargetGoalIds", new TreeSet<>(members),
                                "fullProjectedAtomicTargetGoalIds", new TreeSet<>(atoms)));
                    }
                }
                row.put("actualResolvedMathTrees", mathTrees); row.put("actualPureFocusResolutionFacts", focusFacts);
                row.put("publicCursorOrCommitBehaviorMeasuredHere", false);
            }
            // Retain actual merged trees for the 36 specifically reviewed vector placements.
            // Diagnostic output only: projection, demand, and all acceptance checks above are unchanged.
            if (Set.of("DE-BE/CrossStage/G8/GK", "DE-BE/CrossStage/G8/GK+LK", "DE-BE/CrossStage/G8/LK", "DE-BE/CrossStage/G9/GK", "DE-BE/CrossStage/G9/GK+LK", "DE-BE/CrossStage/G9/LK", "DE-BE/SekI/G8/GK+LK", "DE-BE/SekI/G9/GK+LK", "DE-BY/CrossStage/G9/GK", "DE-BY/CrossStage/G9/GK+LK", "DE-BY/CrossStage/G9/LK", "DE-BY/SekI/G9/GK+LK", "DE-HB/CrossStage/G8/GK", "DE-HB/CrossStage/G8/GK+LK", "DE-HB/CrossStage/G8/LK", "DE-HB/SekI/G8/GK+LK", "DE-HH/CrossStage/G8/GK", "DE-HH/CrossStage/G8/GK+LK", "DE-HH/CrossStage/G8/LK", "DE-HH/SekI/G8/GK+LK", "DE-NI/CrossStage/G9/GK", "DE-NI/CrossStage/G9/GK+LK", "DE-NI/CrossStage/G9/LK", "DE-NI/SekI/G9/GK+LK", "DE-NW/CrossStage/G9/GK", "DE-NW/CrossStage/G9/GK+LK", "DE-NW/CrossStage/G9/LK", "DE-NW/SekI/G9/GK+LK", "DE-SN/CrossStage/G8/GK", "DE-SN/CrossStage/G8/GK+LK", "DE-SN/CrossStage/G8/LK", "DE-SN/SekI/G8/GK+LK", "DE-ST/CrossStage/G8/GK", "DE-ST/CrossStage/G8/GK+LK", "DE-ST/CrossStage/G8/LK", "DE-ST/SekI/G8/GK+LK").contains(scope)) {
                row.put("actualResolvedMathTrees", mathTrees);
            }
            rows.add(row);
        }
        noMutations(List.of(learners, clients, masteries, plans), events);
        if (!initialLearner.equals(mapper.writeValueAsString(learner))) throw new AssertionError("Inert learner mutated");
        if (rows.size() != 161) throw new AssertionError("Expected161 actual scopes");
        long unions = rows.stream().filter(r -> {
            String[] p = ((String) r.get("scope")).split("/", -1);
            return p[3].equals("GK+LK") && !p[1].equals("SekI");
        }).count();
        if (unions != 46) throw new AssertionError("Expected46 real component unions");
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("kind", "finite-matrix-current161-empty-mastery-native-not-completion-acceptance");
        report.put("dataRoot", root.toString()); report.put("scopes", rows); report.put("actualScopeCount", 161);
        report.put("actualUnionCount", unions); report.put("runtimeClassOrigins", origins);
        report.put("wholeTaskGoal", canonical.get(TASK)); report.put("whole18PreparationGoalIds", support);
        Map<String, LearningGoal> preparationObjects = new TreeMap<>(); support.forEach(id -> preparationObjects.put(id, canonical.get(id)));
        report.put("whole18PreparationGoalObjects", preparationObjects);
        report.put("taskEffectiveDirectPrerequisiteIds", new TreeSet<>(taskChain.directPrerequisites(TASK)));
        report.put("separateInventoryMockSetupSaves", setupSaveCount); report.put("separateInventoryMockSetupEvents", setupEventCount);
        report.put("measurementRepositoryMutationCount", 0); report.put("measurementEventCount", 0);
        report.put("inertLearnerUnchanged", true); report.put("masteryScenarioCount", 1);
        report.put("failedScopes", rows.stream().filter(r -> !Boolean.TRUE.equals(r.get("passed"))).count());
        report.put("publicFocusClaimsExcluded", true);
        try (var output = new java.util.zip.GZIPOutputStream(java.nio.file.Files.newOutputStream(Path.of(args[1])))) {
            mapper.writeValue(output, report);
        }
        System.out.println("Finite native projection wrote161 M0 rows and46 actual unions; no completion acceptance.");
    }

    /** Exact existing inventory mechanism, retaining absent duration/course dimensions for canonical ALL. */
    private static List<CurriculumCompletionIntegrityTest.ScopedCurriculum> currentOfferings(
            Path root, LearnerService service, LandscapeService landscapes) {
        com.fasterxml.jackson.databind.JsonNode inventory = ReflectionTestUtils.invokeMethod(
                CurriculumCompletionIntegrityTest.class, "readCurrentOfferings", root);
        var selected = new ArrayList<CurriculumCompletionIntegrityTest.ScopedCurriculum>();
        for (var offering : CurriculumCompletionIntegrityTest.offeredScopes(inventory.path(MATH))) {
            Map<String, Object> config = new LinkedHashMap<>();
            config.put("selected", true); config.put("filterId", offering.country()); config.put("stage", offering.stage());
            if (!offering.duration().isEmpty()) config.put("durationModel", offering.duration());
            selected.add(new CurriculumCompletionIntegrityTest.ScopedCurriculum(offering,
                    Map.of(ROOT, config, MATH, Map.of("selected", true, "filterId", offering.course()))));
        }
        for (var config : CurriculumCompletionIntegrityTest.canonicalPersonalCurricula(MATH,
                candidate -> com.skillpilot.backend.service.CurriculumPersonalizationPlanner.plan(ROOT, landscapes::getById,
                        (id, scope) -> ReflectionTestUtils.invokeMethod(service, "resolvePersonalizationOfferingScope", id, scope), candidate),
                (candidate, option) -> ReflectionTestUtils.invokeMethod(CurriculumCompletionIntegrityTest.class,
                        "applyNativePersonalizationOption", service, candidate, option))) {
            var rootConfig = config.get(ROOT);
            selected.add(new CurriculumCompletionIntegrityTest.ScopedCurriculum(
                    new CurriculumCompletionIntegrityTest.Offering("ALL", (String) rootConfig.get("stage"),
                            (String) rootConfig.getOrDefault("durationModel", ""),
                            (String) config.get(MATH).getOrDefault("filterId", "")), config));
        }
        if (selected.size() != 161) throw new AssertionError("Expected actual161 offered configurations");
        return selected;
    }
}
