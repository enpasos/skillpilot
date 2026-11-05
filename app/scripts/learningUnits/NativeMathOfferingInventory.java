package com.skillpilot.backend.completion;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import com.skillpilot.backend.service.*;
import com.skillpilot.backend.completion.learningunit.LearningUnitApplicationService;
import java.nio.file.*;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Read-only measurement adapter: all scope decisions and projections belong to the real backend. */
public final class NativeMathOfferingInventory {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final Map<String, String> INPUT_DIGESTS = new TreeMap<>();
    private static final ObjectMapper MAPPER = new ObjectMapper(new TrackingJsonFactory());
    private static final class TrackingJsonFactory extends JsonFactory {
        TrackingJsonFactory() { super(); }
        TrackingJsonFactory(TrackingJsonFactory source) { super(source, null); }
        @Override public JsonFactory copy() { return new TrackingJsonFactory(this); }
        @Override public JsonParser createParser(java.io.File file) throws java.io.IOException {
            String path = file.toPath().toAbsolutePath().normalize().toString();
            INPUT_DIGESTS.putIfAbsent(path, fileDigest(file.toPath()));
            return super.createParser(file);
        }
    }
    private static final List<Map<String, Object>> DISCOVERY_FAILURES = new ArrayList<>();

    public static void main(String[] args) throws Exception {
        Path root = Path.of(args[0]).toAbsolutePath().normalize();
        var properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        var landscapes = new LandscapeService(properties, MAPPER);
        var mappings = new GoalMappingService(properties, MAPPER);
        Map<String, LearningGoal> canonical = new CompletionCanonicalGraphResolver(landscapes, MAPPER).load(ROOT);
        Map<String, List<String>> contains = new TreeMap<>();
        canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
        var views = new CompositionViewService(properties, MAPPER, () -> contains);
        var service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), MAPPER, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(service, "compositionViewService", views);
        var completion = mock(CompletionApplicationService.class);
        var catalog = mock(CompletionProfileCatalog.class);
        when(completion.catalog()).thenReturn(catalog);
        when(catalog.automatic()).thenReturn(true);
        when(completion.automaticCanonicalGraph(eq(ROOT), any())).thenReturn(canonical);
        ReflectionTestUtils.setField(service, "completionApplicationService", completion);
        var learner = new Learner();
        learner.setSelectedCurriculum(ROOT);
        var learningUnits = new LearningUnitApplicationService(properties, MAPPER, landscapes,
                new CompletionCanonicalGraphResolver(landscapes, MAPPER), "repository",
                mock(org.springframework.beans.factory.ObjectProvider.class));

        JsonNode declared = readOfferings(root).path(MATH);
        Set<String> jurisdictions = new TreeSet<>();
        declared.fieldNames().forEachRemaining(jurisdictions::add);
        jurisdictions.add("ALL");
        Map<String, Map<String, Map<String, Object>>> nativeScopes = new TreeMap<>();
        for (String jurisdiction : jurisdictions) {
            discover(service, landscapes, jurisdiction).forEach(config -> {
                String identity = identity(config);
                if (nativeScopes.putIfAbsent(identity, config) != null) {
                    throw new IllegalStateException("Duplicate planner offering: " + identity);
                }
            });
        }
        Set<String> plannerScopeIds = new TreeSet<>(nativeScopes.keySet());
        Set<String> declaredScopeIds = declaredScopes(declared);
        for (String identity : declaredScopeIds) {
            if (nativeScopes.containsKey(identity)) continue;
            String[] dimensions = identity.split("/", -1);
            Map<String, Object> rootConfig = new TreeMap<>(Map.of("selected", true, "filterId", dimensions[0], "stage", dimensions[1]));
            if (!dimensions[2].isBlank()) rootConfig.put("durationModel", dimensions[2]);
            Map<String, Object> mathConfig = new TreeMap<>(Map.of("selected", true));
            if (!dimensions[3].isBlank()) mathConfig.put("filterId", dimensions[3]);
            nativeScopes.put(identity, Map.of(ROOT, rootConfig, MATH, mathConfig));
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (var scope : nativeScopes.entrySet()) {
            Map<String, Object> row = new TreeMap<>();
            row.put("scopeId", scope.getKey());
            row.put("offeredByNativePlanner", plannerScopeIds.contains(scope.getKey()));
            row.put("declaredByRepositoryGui", declaredScopeIds.contains(scope.getKey()));
            row.put("personalCurriculum", scope.getValue());
            try {
                Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT,
                        MAPPER.writeValueAsString(scope.getValue()), false);
                Set<String> targets = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets",
                        "automatic:personal-curriculum", projection);
                Map<String, LearningGoal> effective = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
                Set<String> allTargets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
                Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
                Set<String> viewIds = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
                Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
                Set<String> mathIds = new TreeSet<>();
                landscapes.getById(MATH).getGoals().forEach(goal -> mathIds.add(goal.getId()));
                Set<String> mathTargets = new TreeSet<>(targets); mathTargets.retainAll(mathIds);
                row.put("targetAtomicGoalIds", mathTargets);
                row.put("targetGoalIds", intersection(allTargets, mathIds));
                row.put("prerequisiteOnlyGoalIds", intersection(support, mathIds));
                row.put("compositionViewIds", new TreeSet<>(viewIds));
                row.put("requestedCompositionScope", ReflectionTestUtils.invokeMethod(service, "deriveCompositionScope", MATH, scope.getValue()));
                row.put("assessmentGoalIds", select(mathTargets, effective, "assessment"));
                row.put("recallGoalIds", select(mathTargets, effective, "recall"));
                row.put("orientationGoalIds", select(mathTargets, effective, "orientation"));
                row.put("learningUnitReadModel", learningUnits.readModel(learningUnits.evaluate("native-inventory", Set.of()), mathTargets));
                Map<String, List<String>> paths = new TreeMap<>();
                Map<String, Object> resolvedViews = new TreeMap<>();
                for (String viewId : new TreeSet<>(viewIds)) {
                    Map<String, Object> view = views.findViewById(viewId);
                    if (view != null && MATH.equals(view.get("landscapeId"))) {
                        resolvedViews.put(viewId, view);
                        collectPaths((List<?>) view.get("rootNodes"), allTargets, structural, viewId, paths);
                    }
                }
                row.put("resolvedSubjectViews", resolvedViews);
                row.put("visibleGoalPaths", paths);
                Map<String, List<String>> duplicatePaths = new TreeMap<>();
                paths.forEach((id, occurrences) -> { if (occurrences.size() > 1) duplicatePaths.put(id, occurrences); });
                row.put("duplicateVisibleGoalPaths", duplicatePaths);
                Set<String> expected = intersection(allTargets, mathIds);
                Set<String> missing = new TreeSet<>(expected); missing.removeAll(paths.keySet());
                row.put("missingVisibleGoalIds", missing);
                row.put("projectionResolved", true);
                try {
                    var compiled = new CompletionProfileCompiler().compileAutomatic(effective, mathTargets, allTargets, "native-inventory");
                    Map<String, List<String>> prerequisites = new TreeMap<>();
                    compiled.contextGoalIds().forEach(id -> prerequisites.put(id, compiled.directPrerequisites(id)));
                    Set<String> outside = new TreeSet<>(compiled.contextGoalIds()); outside.removeAll(mathTargets);
                    row.put("atomicPrerequisites", prerequisites);
                    row.put("externalSupportAtomicGoalIds", outside);
                    row.put("prerequisiteCompilationResolved", true);
                } catch (RuntimeException error) {
                    row.put("prerequisiteCompilationResolved", false);
                    row.put("prerequisiteCompilationError", error.toString());
                }
            } catch (RuntimeException error) {
                row.put("projectionResolved", false);
                row.put("projectionError", error.toString());
            }
            rows.add(row);
            System.out.println("NATIVE_MATH_SCOPE " + scope.getKey() + " " + row.get("projectionResolved"));
        }
        Map<String, Object> report = new TreeMap<>();
        report.put("schemaVersion", 1);
        report.put("measurement", "actual-backend-planner-and-learner-projection");
        report.put("learnerState", "unsaved fixture; repositories mocked; no mastery/SRS writes");
        report.put("scopeDiscovery", "Native planner options for each declared jurisdiction and ALL; exactly Mathematics selected");
        report.put("declaredScopeIds", declaredScopeIds);
        report.put("plannerScopeIds", plannerScopeIds);
        Set<String> declaredOnly = new TreeSet<>(declaredScopeIds); declaredOnly.removeAll(plannerScopeIds);
        Set<String> plannerOnly = new TreeSet<>(plannerScopeIds); plannerOnly.removeAll(declaredScopeIds);
        report.put("declaredButNotPlannerScopes", declaredOnly);
        report.put("plannerOnlyScopes", plannerOnly);
        report.put("discoveryFailures", DISCOVERY_FAILURES);
        report.put("scopes", rows);
        report.put("canonicalGraphGoalCount", canonical.size());
        report.put("learningUnitCatalogQuarantines", learningUnits.catalog().quarantined());
        report.put("globalRecognitionAfterProjectionAssessment", learningUnits.evaluate("native-inventory",
                Set.of("e98672c6-871a-5d0b-889c-5afc51040f0d")).recognizedGoalIds());
        if (canonical.containsKey("e5494c67-aed6-5710-8ae3-51ae147c10e9")) {
            var prismPass = learningUnits.evaluate("native-prism-inventory", Set.of("e5494c67-aed6-5710-8ae3-51ae147c10e9"));
            report.put("globalRecognitionAfterPrismAssessment", prismPass.recognizedGoalIds());
            report.put("globalRecognitionAtEmptyMastery", learningUnits.evaluate("native-prism-inventory", Set.of()).recognizedGoalIds());
            report.put("prismPassReadModelOverCanonicalMathTargets", learningUnits.readModel(prismPass,
                    landscapes.getById(MATH).getGoals().stream().filter(goal -> goal.getContains().isEmpty()).map(LearningGoal::getId)
                            .collect(java.util.stream.Collectors.toSet())));
        }
        report.put("publicBaseCurricula", landscapes.getBaseCurricula(false));
        List<Map<String, Object>> publicMathModules = new ArrayList<>();
        for (var base : landscapes.getBaseCurricula(false)) {
            for (var landscape : landscapes.getClosure(base.getCurriculumId())) {
                String subject = Objects.toString(landscape.getSubject(), "");
                String title = Objects.toString(landscape.getTitle(), "");
                if (subject.toLowerCase(Locale.ROOT).contains("math") || title.toLowerCase(Locale.ROOT).contains("mathemat")) {
                    publicMathModules.add(Map.of("baseCurriculumId", base.getCurriculumId(), "baseTitle", base.getTitle(),
                            "landscapeId", landscape.getLandscapeId(), "subject", subject, "title", title,
                            "atomicGoalCount", landscape.getGoals().stream().filter(goal -> goal.getContains() == null || goal.getContains().isEmpty()).count()));
                }
            }
        }
        report.put("publicMathModules", publicMathModules);
        Map<String, String> inputs = new TreeMap<>();
        for (var input : INPUT_DIGESTS.entrySet()) {
            if (!input.getValue().equals(fileDigest(Path.of(input.getKey())))) throw new IllegalStateException("Native input changed during measurement: " + input.getKey());
            inputs.put(root.relativize(Path.of(input.getKey())).toString(), input.getValue());
        }
        report.put("nativeMapperInputSha256", inputs);
        report.put("inputBindingCoverage", "Every file parser opened by the shared runtime ObjectMapper; generated offerings and source code bound by invoking script");
        Files.createDirectories(Path.of(args[1]).getParent());
        MAPPER.writerWithDefaultPrettyPrinter().writeValue(Path.of(args[1]).toFile(), report);
    }

    private static String fileDigest(Path path) throws java.io.IOException {
        try {
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path)));
        } catch (java.security.NoSuchAlgorithmException error) { throw new IllegalStateException(error); }
    }

    private static Set<String> intersection(Set<String> left, Set<String> right) {
        Set<String> result = new TreeSet<>(left); result.retainAll(right); return result;
    }

    private static Set<String> select(Set<String> ids, Map<String, LearningGoal> goals, String kind) {
        Set<String> result = new TreeSet<>();
        for (String id : ids) {
            LearningGoal goal = goals.get(id);
            if (("assessment".equals(kind) && CompletionProfileCompiler.isAssessment(goal))
                    || ("recall".equals(kind) && CompletionProfileCompiler.isMemory(goal))
                    || ("orientation".equals(kind) && CompletionProfileCompiler.isOrientation(goal))) result.add(id);
        }
        return result;
    }

    private static String identity(Map<String, Map<String, Object>> config) {
        Map<String, Object> root = config.get(ROOT);
        return String.join("/", (String) root.get("filterId"), (String) root.get("stage"),
                (String) root.getOrDefault("durationModel", ""), (String) config.get(MATH).getOrDefault("filterId", ""));
    }

    private static List<Map<String, Map<String, Object>>> discover(LearnerService service, LandscapeService landscapes, String jurisdiction) {
        ArrayDeque<Map<String, Map<String, Object>>> pending = new ArrayDeque<>();
        pending.add(Map.of(ROOT, Map.of("selected", true, "filterId", jurisdiction)));
        Set<Map<String, Map<String, Object>>> visited = new HashSet<>();
        List<Map<String, Map<String, Object>>> complete = new ArrayList<>();
        while (!pending.isEmpty()) {
            Map<String, Map<String, Object>> config = pending.removeFirst();
            if (!visited.add(config)) continue;
            if (visited.size() > 10000) throw new IllegalStateException("Unbounded native planner discovery");
            PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, landscapes::getById,
                    (id, scope) -> ReflectionTestUtils.invokeMethod(service, "resolvePersonalizationOfferingScope", id, scope), config);
            if (!plan.valid()) {
                DISCOVERY_FAILURES.add(Map.of("jurisdiction", jurisdiction, "config", config, "problemCode", Objects.toString(plan.problemCode(), "unknown")));
                continue;
            }
            if (!plan.required()) {
                if (Boolean.TRUE.equals(config.getOrDefault(MATH, Map.of()).get("selected"))) complete.add(config);
                continue;
            }
            for (PersonalizationPlan.Option option : plan.options()) {
                if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP || ROOT.equals(option.landscapeId()) || MATH.equals(option.landscapeId())) {
                    Map<String, Object> mutable = new LinkedHashMap<>();
                    config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
                    Learner fixture = new Learner(); fixture.setSelectedCurriculum(ROOT);
                    ReflectionTestUtils.invokeMethod(service, "applyCurrentPersonalizationOption", fixture, mutable, option);
                    try {
                        pending.add(MAPPER.readValue(fixture.getPersonalCurriculum(), new com.fasterxml.jackson.core.type.TypeReference<>() {}));
                    } catch (Exception error) { throw new IllegalStateException("Native option produced invalid config", error); }
                }
            }
        }
        return complete;
    }

    private static Set<String> declaredScopes(JsonNode countries) {
        if (!countries.isObject() || countries.isEmpty()) throw new IllegalArgumentException("Missing declared Mathematics offerings");
        Set<String> result = new TreeSet<>();
        countries.fields().forEachRemaining(country -> {
            if (country.getKey().isBlank() || !country.getValue().path("stages").isArray()
                    || country.getValue().path("stages").isEmpty() || !country.getValue().path("durationModels").isArray()) {
                throw new IllegalArgumentException("Missing/malformed declared stages or durations: " + country.getKey());
            }
            List<String> durations = new ArrayList<>(); country.getValue().path("durationModels").forEach(node -> durations.add(node.asText()));
            if (durations.stream().anyMatch(duration -> !Set.of("G8", "G9").contains(duration))) throw new IllegalArgumentException("Unknown declared duration: " + country.getKey());
            if (durations.isEmpty()) durations.add("");
            for (JsonNode stageNode : country.getValue().path("stages")) {
                String stage = stageNode.asText();
                if (!Set.of("SekI", "SekII", "CrossStage").contains(stage)) throw new IllegalArgumentException("Unknown declared stage: " + stage);
                for (String duration : durations) for (String course : "SekI".equals(stage) ? List.of("") : List.of("GK", "LK", "GK+LK")) {
                    if (!result.add(String.join("/", country.getKey(), stage, duration, course))) throw new IllegalStateException("Duplicate declared scope");
                }
            }
        });
        return result;
    }

    private static JsonNode readOfferings(Path root) throws Exception {
        String source = Files.readString(root.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker = "export const GYMNASIUM_CONTENT_OFFERINGS = ";
        int start = source.indexOf(marker);
        int end = source.indexOf(" as const satisfies GymnasiumContentOfferings", start);
        if (start < 0 || end < 0) throw new IllegalStateException("Missing/malformed authoritative offering object");
        return new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(source.substring(start + marker.length(), end));
    }

    private static void collectPaths(List<?> nodes, Set<String> targets, Map<String, LearningGoal> structural,
            String path, Map<String, List<String>> paths) {
        for (int index = 0; index < nodes.size(); index++) {
            Map<?, ?> node = (Map<?, ?>) nodes.get(index);
            String current = path + "/" + index;
            if ("structure".equals(node.get("kind"))) collectPaths((List<?>) node.get("children"), targets, structural, current, paths);
            else if (!"prerequisiteOnly".equals(node.get("projectionRole"))) collectGoalPaths((String) node.get("goalId"),
                    "canonicalSubtree".equals(node.get("kind")), targets, structural, current, paths, Set.of());
        }
    }

    private static void collectGoalPaths(String reference, boolean subtree, Set<String> targets,
            Map<String, LearningGoal> structural, String path, Map<String, List<String>> paths, Set<String> ancestors) {
        String id = structural.containsKey(reference) ? reference : reference.substring(reference.indexOf(':') + 1);
        if (!targets.contains(id)) return;
        if (ancestors.contains(id)) throw new IllegalStateException("Native contains cycle at " + path);
        paths.computeIfAbsent(id, ignored -> new ArrayList<>()).add(path);
        if (!subtree) return;
        LearningGoal goal = structural.get(id);
        if (goal == null) throw new IllegalStateException("Unknown projected target: " + id);
        Set<String> next = new TreeSet<>(ancestors); next.add(id);
        for (String child : goal.getContains()) collectGoalPaths(child, true, targets, structural, path + "/" + child, paths, next);
    }
}
