package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.ExamTaskReadiness;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.CurriculumPersonalizationPlanner;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/**
 * Zero-mastery obligation coverage for complete curricula, using the real backend
 * projection and prerequisite compiler. A route-profile subset must never hide a
 * learner-facing orphan. This is deliberately not a test of arbitrary Level-3 focus.
 */
class CurriculumCompletionIntegrityTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATHEMATICS = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    static final String SUBJECT_PROPERTY = "skillpilot.completion.integrity.subject";
    static final Set<String> REQUIRED_PROTECTED_SUBJECTS = Set.of(
            "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced", "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a",
            "08a43a1b-d97e-522c-9dfa-c950a493364e", "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
            "605bdaf6-32d5-56fd-8d92-5a80c2fd2901");

    @Test
    @Tag("curriculum-corpus")
    void everyM7CurriculumTargetRemainsNeededUntilARealGoalIsMastered() throws Exception {
        Path root = Files.isDirectory(Path.of("../curricula")) ? Path.of("..").toAbsolutePath().normalize()
                : Path.of("").toAbsolutePath().normalize();
        JsonNode floors = MAPPER.readTree(root.resolve("app/scripts/config/curriculum-maturity-floor-policy.json").toFile());
        JsonNode status = MAPPER.readTree(root.resolve("docs/qa-ci/status/curriculum-quality-status.json").toFile());
        Map<String, String> protectedSubjects = protectedInventory(floors, status);
        String selector = System.getProperty(SUBJECT_PROPERTY);
        Map<String, String> subjects = selectSubjects(protectedSubjects, selector);
        Path manifest = Path.of(System.getProperty("skillpilot.completion.integrity.inputs",
                "missing-dedicated-curriculum-integrity-input-manifest"));
        JsonNode inputBinding = MAPPER.readTree(manifest.toFile());
        assertThat(inputBinding.path("subjectSelector").isNull() ? null : inputBinding.path("subjectSelector").asText())
                .as("Dedicated task selector binding").isEqualTo(selector);
        verifyInputs(root, inputBinding);
        System.out.println("CURRICULUM_COMPLETION_AUDIT_EXECUTION:" + inputBinding.path("executionId").asText());

        // Selection changes only the outer target inventory. Every subject's
        // canonical graph and cross-subject prerequisite context remain loaded.
        var properties = new LandscapeProperties();
        properties.setDirectory(root.resolve("curricula").toString());
        var landscapes = new LandscapeService(properties, MAPPER);
        var mappings = new GoalMappingService(properties, MAPPER);
        var canonical = new CompletionCanonicalGraphResolver(landscapes, MAPPER).load(ROOT);
        Map<String, List<String>> contains = new LinkedHashMap<>();
        canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
        var views = new CompositionViewService(properties, MAPPER, landscapes);
        var learnerService = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), landscapes, mappings,
                mock(DeckResourceService.class), MAPPER, mock(ApplicationEventPublisher.class));
        ReflectionTestUtils.setField(learnerService, "compositionViewService", views);
        var completion = mock(CompletionApplicationService.class);
        var catalog = mock(CompletionProfileCatalog.class);
        when(completion.catalog()).thenReturn(catalog);
        when(catalog.automatic()).thenReturn(true);
        when(completion.automaticCanonicalGraph(eq(ROOT), any())).thenReturn(canonical);
        ReflectionTestUtils.setField(learnerService, "completionApplicationService", completion);
        var learner = new Learner();
        learner.setSelectedCurriculum(ROOT);

        JsonNode offerings = readCurrentOfferings(root);
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        String fatalError = null;
        try {
            for (var subject : subjects.entrySet()) {
                String landscapeId = subject.getKey();
                Set<String> allAtoms = new TreeSet<>();
                landscapes.getById(landscapeId).getGoals().stream().filter(CurriculumCompletionIntegrityTest::isAtomic)
                        .forEach(goal -> allAtoms.add(goal.getId()));
                // The raw canonical union includes nonoffered support/draft nodes.
                // Keep it as repair evidence; offered target scopes define the gate.
                audit(subject.getValue(), "canonical", canonical, allAtoms, false, Set.of(), rows, failures);
                rows.getLast().put("landscapeId", landscapeId);
                List<ScopedCurriculum> scopedCurricula = new ArrayList<>();
                for (Offering offering : offeredScopes(offerings.path(landscapeId))) {
                    Map<String, Object> rootConfig = new LinkedHashMap<>();
                    rootConfig.put("selected", true);
                    rootConfig.put("filterId", offering.country());
                    rootConfig.put("stage", offering.stage());
                    if (!offering.duration().isEmpty()) rootConfig.put("durationModel", offering.duration());
                    scopedCurricula.add(new ScopedCurriculum(offering, Map.of(ROOT, rootConfig,
                            landscapeId, Map.of("selected", true, "filterId", offering.course()))));
                }
                for (Map<String, Map<String, Object>> config : canonicalPersonalCurricula(landscapeId,
                        candidate -> CurriculumPersonalizationPlanner.plan(ROOT, landscapes::getById,
                                (id, scope) -> ReflectionTestUtils.invokeMethod(learnerService,
                                        "resolvePersonalizationOfferingScope", id, scope), candidate),
                        (candidate, option) -> applyNativePersonalizationOption(learnerService, candidate, option))) {
                    Map<String, Object> rootConfig = config.get(ROOT);
                    scopedCurricula.add(new ScopedCurriculum(new Offering("ALL", (String) rootConfig.get("stage"),
                            (String) rootConfig.getOrDefault("durationModel", ""),
                            (String) config.get(landscapeId).getOrDefault("filterId", "")), config));
                }
                for (ScopedCurriculum scoped : scopedCurricula) {
                    Offering offering = scoped.offering();
                    // Both country and ALL scopes use the real projection and
                    // course merger. Missing dimensions stay absent in config.
                    String config = MAPPER.writeValueAsString(scoped.config());
                    Object projection = ReflectionTestUtils.invokeMethod(learnerService, "getGoalProjection",
                            ROOT, config, false);
                    Set<String> targets = ReflectionTestUtils.invokeMethod(learnerService,
                            "automaticCompletionTargets", "automatic:personal-curriculum", projection);
                    Map<String, LearningGoal> effectiveGraph = ReflectionTestUtils.invokeMethod(learnerService,
                            "completionGraph", learner, projection);
                    Set<String> viewIds = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
                    audit(subject.getValue(), offering.id(), effectiveGraph, targets, true, viewIds, rows, failures);
                    rows.getLast().put("landscapeId", landscapeId);
                    if ("ALL".equals(offering.country())) {
                        rows.getLast().put("personalCurriculumConfig", scoped.config());
                        rows.getLast().put("requestedCompositionScope", ReflectionTestUtils.invokeMethod(learnerService,
                                "deriveCompositionScope", landscapeId, scoped.config()));
                    }
                    if (MATHEMATICS.equals(landscapeId)) {
                        Set<String> navigationTargets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
                        Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
                        Set<String> canonicalSubjectIds = new TreeSet<>();
                        landscapes.getById(landscapeId).getGoals().forEach(goal -> canonicalSubjectIds.add(goal.getId()));
                        Set<String> expectedNavigationTargets = new TreeSet<>(navigationTargets);
                        expectedNavigationTargets.retainAll(canonicalSubjectIds);
                        Map<String, List<String>> paths = new TreeMap<>();
                        Map<String, Map<String, List<String>>> duplicateStructures = new TreeMap<>();
                        Set<String> inspectedViews = new TreeSet<>();
                        for (String viewId : new TreeSet<>(viewIds)) {
                            Map<String, Object> resolvedView = views.findViewById(viewId);
                            // Overview/catalog references are not the subject's
                            // authored learner tree. Inspect the actual resolved
                            // Mathematics offering, including its merged tree.
                            if (resolvedView != null && MATHEMATICS.equals(resolvedView.get("landscapeId"))) {
                                inspectedViews.add(viewId);
                                collectVisibleCompositionPaths((List<?>) resolvedView.get("rootNodes"),
                                        navigationTargets, structural, viewId, paths);
                                Map<String, List<String>> duplicatesInView = duplicateStructureIds(
                                        (List<?>) resolvedView.get("rootNodes"), viewId);
                                if (!duplicatesInView.isEmpty()) duplicateStructures.put(viewId, duplicatesInView);
                            }
                        }
                        assertThat(inspectedViews).as("Actual Mathematics tree for %s", offering.id()).isNotEmpty();
                        Map<String, List<String>> duplicates = new TreeMap<>();
                        paths.forEach((id, occurrences) -> { if (occurrences.size() > 1) duplicates.put(id, occurrences); });
                        Set<String> missingVisible = new TreeSet<>(expectedNavigationTargets);
                        missingVisible.removeAll(paths.keySet());
                        Set<String> unexpectedVisible = new TreeSet<>(paths.keySet());
                        unexpectedVisible.removeAll(expectedNavigationTargets);
                        rows.getLast().put("duplicateVisibleGoalPaths", duplicates);
                        rows.getLast().put("duplicateStructureIds", duplicateStructures);
                        rows.getLast().put("visibleHierarchyViewIds", inspectedViews);
                        rows.getLast().put("visibleHierarchyGoalCount", paths.size());
                        rows.getLast().put("visibleHierarchyTargetGoalIds", expectedNavigationTargets);
                        rows.getLast().put("visibleHierarchyGoalIds", new TreeSet<>(paths.keySet()));
                        rows.getLast().put("missingVisibleGoalIds", missingVisible);
                        rows.getLast().put("unexpectedVisibleGoalIds", unexpectedVisible);
                        if (hasHierarchyFailure(rows.getLast())) {
                            rows.getLast().put("passed", false);
                            failures.add(subject.getValue() + " " + offering.id() + ": "
                                    + duplicates.size() + " goals with multiple visible composition paths; "
                                    + duplicateStructures.values().stream().mapToInt(Map::size).sum()
                                    + " globally duplicate structure IDs; "
                                    + missingVisible.size() + " missing and " + unexpectedVisible.size() + " unexpected visible goals");
                        }
                    }
                }
            }
            verifyInputs(root, inputBinding);
        } catch (RuntimeException | AssertionError error) {
            fatalError = error.toString();
            failures.add("Incomplete or changed audit inputs: " + fatalError);
        }
        Path report = manifest.resolveSibling("audit.json");
        Files.createDirectories(report.getParent());
        Map<String, Object> output = new LinkedHashMap<>();
        output.put("schemaVersion", 4);
        output.put("rule", "Every offered target must be reachable from a selected assessment or memory target through effective requires; "
                + "selected assessments must satisfy the shared task and rubric readiness contract");
        output.put("auditMode", selector == null ? "all-protected-subjects" : "single-subject");
        output.put("subjectSelector", selector);
        output.put("mastery", "empty");
        output.put("protectedSubjects", protectedSubjects);
        output.put("selectedSubjects", subjects);
        Map<String, String> unexamined = new LinkedHashMap<>(protectedSubjects);
        subjects.keySet().forEach(unexamined::remove);
        output.put("unexaminedSubjects", unexamined);
        output.put("currentMaturityStatus", maturityStatus(protectedSubjects, floors, status));
        output.put("completeProtectedInventoryAudited", selector == null && fatalError == null);
        output.put("selectedIntegrityPassed", failures.isEmpty());
        output.put("allProtectedSubjectsIntegrityPassed", selector == null && failures.isEmpty());
        output.put("inputBinding", inputBinding);
        output.put("fatalError", fatalError);
        output.put("subjects", subjects);
        output.put("scopes", rows);
        output.put("failedScopes", failedAuthoritativeScopeCount(rows));
        output.put("checkedScopes", rows.size());
        output.put("checkedOfferedScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))).count());
        output.put("failedRouteScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && row.get("uncovered") instanceof List<?> missing && !missing.isEmpty()).count());
        output.put("failedReadinessScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && row.get("unreadyAssessments") instanceof List<?> unready && !unready.isEmpty()).count());
        output.put("failedHierarchyScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && hasHierarchyFailure(row)).count());
        output.put("checkedCountryOfferedScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && ((String) row.get("scope")).startsWith("DE-")).count());
        output.put("checkedCanonicalPersonalCurriculumScopes", rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && ((String) row.get("scope")).startsWith("ALL/")).count());
        output.put("canonicalDiagnosticScopes", rows.stream().filter(row -> Boolean.FALSE.equals(row.get("authoritative"))).count());
        MAPPER.writerWithDefaultPrettyPrinter().writeValue(report.toFile(), output);
        assertThat(failures.size()).as("Invalid target routes, assessment tasks, or visible hierarchy in %s offered M7 scopes (%s diagnostics). "
                + "Full evidence: %s. First findings: %s", failedAuthoritativeScopeCount(rows), failures.size(), report,
                failures.stream().limit(12).toList()).isZero();
    }

    private static long failedAuthoritativeScopeCount(List<Map<String, Object>> rows) {
        return rows.stream().filter(row -> Boolean.TRUE.equals(row.get("authoritative"))
                && !Boolean.TRUE.equals(row.get("passed"))).count();
    }

    @Test
    void failedScopeCountCountsEachOfferedRowOnceAndKeepsRawDiagnosticsSeparate() {
        Map<String, Object> routeAndHierarchyFailure = Map.of("authoritative", true, "passed", false,
                "uncovered", List.of("uncovered-target"),
                "duplicateStructureIds", Map.of("view", Map.of("duplicate", List.of("0/0", "1/0"))));
        Map<String, Object> rawFailure = Map.of("authoritative", false, "passed", false);
        Map<String, Object> passed = Map.of("authoritative", true, "passed", true);
        assertThat(failedAuthoritativeScopeCount(List.of(routeAndHierarchyFailure, rawFailure, passed))).isOne();
        assertThat(failedAuthoritativeScopeCount(List.of(rawFailure, passed))).isZero();
        assertThat(failedAuthoritativeScopeCount(List.of(Map.of("authoritative", true)))).isOne();
    }

    private static boolean hasHierarchyFailure(Map<String, Object> row) {
        return (row.get("duplicateVisibleGoalPaths") instanceof Map<?, ?> duplicates && !duplicates.isEmpty())
                || (row.get("duplicateStructureIds") instanceof Map<?, ?> structureDuplicates && !structureDuplicates.isEmpty())
                || (row.get("missingVisibleGoalIds") instanceof Set<?> missing && !missing.isEmpty())
                || (row.get("unexpectedVisibleGoalIds") instanceof Set<?> unexpected && !unexpected.isEmpty());
    }

    // Structure IDs are global within one actual resolved view, including empty
    // or prerequisite-only wrappers. Independent source views have independent IDs.
    private static Map<String, List<String>> duplicateStructureIds(List<?> nodes, String viewId) {
        Map<String, List<String>> paths = new TreeMap<>();
        collectStructureIdPaths(nodes, viewId, paths);
        Map<String, List<String>> duplicates = new TreeMap<>();
        paths.forEach((id, occurrences) -> { if (occurrences.size() > 1) duplicates.put(id, occurrences); });
        return duplicates;
    }

    private static void collectStructureIdPaths(List<?> nodes, String path, Map<String, List<String>> paths) {
        for (int index = 0; index < nodes.size(); index++) {
            Map<?, ?> node = (Map<?, ?>) nodes.get(index);
            if (!"structure".equals(node.get("kind"))) continue;
            String id = (String) node.get("id");
            String current = path + "/" + index;
            assertThat(id).as("Structure identity at %s", current).isNotBlank();
            paths.computeIfAbsent(id, ignored -> new ArrayList<>()).add(current);
            collectStructureIdPaths((List<?>) node.get("children"), current, paths);
        }
    }

    // Inspect the received service tree without merging, choosing a parent, or
    // recalculating roles. The native projection supplies the effective target
    // set; unlike visibleGoals (a map), the traversal retains every visible path.
    private static void collectVisibleCompositionPaths(List<?> nodes, Set<String> targets,
            Map<String, LearningGoal> structural, String path, Map<String, List<String>> paths) {
        for (int index = 0; index < nodes.size(); index++) {
            Map<?, ?> node = (Map<?, ?>) nodes.get(index);
            String current = path + "/" + index;
            if ("structure".equals(node.get("kind"))) {
                collectVisibleCompositionPaths((List<?>) node.get("children"), targets, structural, current, paths);
            } else if (!"prerequisiteOnly".equals(node.get("projectionRole"))) {
                String kind = (String) node.get("kind");
                assertThat(kind).as("Mathematics composition reference %s", current)
                        .isIn("canonicalSubtree", "goalEntry");
                collectVisibleGoalPaths((String) node.get("goalId"), "canonicalSubtree".equals(kind),
                        targets, structural, current, paths, Set.of());
            }
        }
    }

    private static void collectVisibleGoalPaths(String reference, boolean subtree, Set<String> targets,
            Map<String, LearningGoal> structural, String path, Map<String, List<String>> paths, Set<String> ancestors) {
        String id = structural.containsKey(reference) ? reference : reference.substring(reference.indexOf(':') + 1);
        if (!targets.contains(id)) return;
        assertThat(ancestors).as("Canonical contains cycle in %s", path).doesNotContain(id);
        paths.computeIfAbsent(id, ignored -> new ArrayList<>()).add(path);
        if (!subtree) return;
        LearningGoal goal = structural.get(id);
        assertThat(goal).as("Known canonical target %s", id).isNotNull();
        Set<String> nextAncestors = new TreeSet<>(ancestors);
        nextAncestors.add(id);
        for (String child : goal.getContains()) {
            collectVisibleGoalPaths(child, true, targets, structural, path + "/" + child, paths, nextAncestors);
        }
    }

    @Test
    void visibleHierarchyCheckRetainsDistinctPathsAndIgnoresHiddenAndOpaqueReferences() {
        Map<String, LearningGoal> structural = new TreeMap<>();
        for (String id : List.of("root", "left", "right", "shared")) {
            LearningGoal goal = new LearningGoal(); goal.setId(id); goal.setContains(List.of()); structural.put(id, goal);
        }
        structural.get("root").setContains(List.of("left", "right"));
        structural.get("left").setContains(List.of("shared"));
        structural.get("right").setContains(List.of("shared"));
        Map<String, List<String>> paths = new TreeMap<>();
        collectVisibleCompositionPaths(List.of(Map.of("kind", "canonicalSubtree", "goalId", "root")),
                structural.keySet(), structural, "actual-view", paths);
        assertThat(paths.get("shared")).hasSize(2).doesNotHaveDuplicates();

        paths.clear();
        collectVisibleCompositionPaths(List.of(
                Map.of("kind", "canonicalSubtree", "goalId", "root", "projectionRole", "prerequisiteOnly"),
                Map.of("kind", "goalEntry", "goalId", "left"),
                Map.of("kind", "goalEntry", "goalId", "shared")),
                structural.keySet(), structural, "actual-view", paths);
        assertThat(paths.keySet()).containsExactlyInAnyOrder("left", "shared");
        assertThat(paths.get("shared")).hasSize(1);
    }

    @Test
    void duplicateStructureIdentityFailsWithoutDuplicateGoalsIncludingHiddenAndEmptyWrappers() {
        List<?> nodes = List.of(
                Map.of("kind", "structure", "id", "left", "label", "Left", "children", List.of(
                        Map.of("kind", "structure", "id", "shared", "label", "Practice", "children", List.of(
                                Map.of("kind", "goalEntry", "goalId", "hidden", "projectionRole", "prerequisiteOnly"))))),
                Map.of("kind", "structure", "id", "right", "label", "Right", "children", List.of(
                        Map.of("kind", "structure", "id", "shared", "label", "Practice", "children", List.of()))));
        Map<String, List<String>> visibleGoals = new TreeMap<>();
        collectVisibleCompositionPaths(nodes, Set.of(), Map.of(), "actual-view", visibleGoals);
        assertThat(visibleGoals).isEmpty();
        Map<String, List<String>> duplicates = duplicateStructureIds(nodes, "actual-view");
        assertThat(duplicates).containsExactly(Map.entry("shared", List.of("actual-view/0/0", "actual-view/1/0")));
        Map<String, Object> row = Map.of("duplicateVisibleGoalPaths", visibleGoals,
                "duplicateStructureIds", Map.of("actual-view", duplicates),
                "missingVisibleGoalIds", Set.of(), "unexpectedVisibleGoalIds", Set.of());
        assertThat(hasHierarchyFailure(row)).isTrue();
    }

    @Test
    void distinctStructureIdsMayShareLabelsAndIndependentViewsMayReuseIds() {
        List<?> nodes = List.of(
                Map.of("kind", "structure", "id", "first", "label", "Practice", "children", List.of()),
                Map.of("kind", "structure", "id", "second", "label", "Practice", "children", List.of()));
        assertThat(duplicateStructureIds(nodes, "actual-view")).isEmpty();
        List<?> single = List.of(Map.of("kind", "structure", "id", "same-source-id", "children", List.of()));
        assertThat(duplicateStructureIds(single, "source-a")).isEmpty();
        assertThat(duplicateStructureIds(single, "source-b")).isEmpty();
        assertThat(hasHierarchyFailure(Map.of("duplicateVisibleGoalPaths", Map.of(), "duplicateStructureIds", Map.of(),
                "missingVisibleGoalIds", Set.of(), "unexpectedVisibleGoalIds", Set.of()))).isFalse();
    }

    static Map<String, String> protectedInventory(JsonNode floors, JsonNode status) {
        Map<String, String> inventory = new LinkedHashMap<>();
        for (JsonNode floor : floors.path("floors")) {
            if ("M7".equals(floor.path("minimumMaturity").asText())) {
                inventory.put(floor.path("landscapeId").asText(), floor.path("subject").asText());
            }
        }
        for (JsonNode curriculum : status.path("curricula")) {
            if ("M7".equals(curriculum.path("maturity").asText())) {
                inventory.put(curriculum.path("landscapeId").asText(), curriculum.path("subject").asText());
            }
        }
        if (!inventory.keySet().containsAll(REQUIRED_PROTECTED_SUBJECTS)
                || inventory.entrySet().stream().anyMatch(entry -> entry.getKey().isBlank() || entry.getValue().isBlank())) {
            throw new IllegalStateException("Complete protected M7 inventory must retain all five established subjects");
        }
        return Collections.unmodifiableMap(inventory);
    }

    static Map<String, String> selectSubjects(Map<String, String> inventory, String selector) {
        // Validate the entire protected inventory before narrowing the outer loop.
        if (!inventory.keySet().containsAll(REQUIRED_PROTECTED_SUBJECTS)) {
            throw new IllegalStateException("Incomplete protected inventory before subject selection");
        }
        if (selector == null) return inventory;
        if (selector.isBlank() || !inventory.containsKey(selector)) {
            throw new IllegalArgumentException("Subject selector must be one exact known protected landscape ID: " + selector);
        }
        return Map.of(selector, inventory.get(selector));
    }

    record Offering(String country, String stage, String duration, String course) {
        String id() { return String.join("/", country, stage, duration, course); }
    }

    record ScopedCurriculum(Offering offering, Map<String, Map<String, Object>> config) {}

    /** Enumerate actual planner actions, retaining exactly one selected subject.
     * No stage, duration or course choices are manufactured from a Cartesian product. */
    static List<Map<String, Map<String, Object>>> canonicalPersonalCurricula(String subject,
            Function<Map<String, Map<String, Object>>, PersonalizationPlan> planner,
            BiFunction<Map<String, Map<String, Object>>, PersonalizationPlan.Option,
                    Map<String, Map<String, Object>>> applyOption) {
        ArrayDeque<Map<String, Map<String, Object>>> pending = new ArrayDeque<>();
        pending.add(Map.of(ROOT, Map.of("selected", true, "filterId", "ALL")));
        Set<Map<String, Map<String, Object>>> visited = new HashSet<>();
        List<Map<String, Map<String, Object>>> complete = new ArrayList<>();
        while (!pending.isEmpty()) {
            Map<String, Map<String, Object>> config = pending.removeFirst();
            if (!visited.add(config)) continue;
            PersonalizationPlan plan = planner.apply(config);
            if (!plan.valid()) continue; // An authored stage need not offer this subject.
            if (!plan.required()) {
                if (Boolean.TRUE.equals(config.getOrDefault(subject, Map.of()).get("selected"))) complete.add(config);
                continue;
            }
            for (PersonalizationPlan.Option option : plan.options()) {
                if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP
                        || ROOT.equals(option.landscapeId()) || subject.equals(option.landscapeId())) {
                    pending.add(applyOption.apply(config, option));
                }
            }
        }
        assertThat(complete).as("Offered ALL Personal Curricula for %s", subject).isNotEmpty();
        Set<String> identities = new TreeSet<>();
        for (Map<String, Map<String, Object>> config : complete) {
            Map<String, Object> root = config.get(ROOT);
            String identity = new Offering("ALL", (String) root.get("stage"),
                    (String) root.getOrDefault("durationModel", ""),
                    (String) config.get(subject).getOrDefault("filterId", "")).id();
            assertThat(identities.add(identity)).as("Unique ALL offering %s", identity).isTrue();
        }
        return List.copyOf(complete);
    }

    private static Map<String, Map<String, Object>> applyNativePersonalizationOption(LearnerService service,
            Map<String, Map<String, Object>> config, PersonalizationPlan.Option option) {
        Map<String, Object> mutable = new LinkedHashMap<>();
        config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
        Learner fixture = new Learner(); // Unsaved fixture; every repository is mocked.
        fixture.setSelectedCurriculum(ROOT);
        ReflectionTestUtils.invokeMethod(service, "applyCurrentPersonalizationOption", fixture, mutable, option);
        try {
            return MAPPER.readValue(fixture.getPersonalCurriculum(), new com.fasterxml.jackson.core.type.TypeReference<>() {});
        } catch (java.io.IOException error) {
            throw new IllegalStateException("Cannot read the backend's final Personal Curriculum", error);
        }
    }

    static List<Offering> offeredScopes(JsonNode countries) {
        if (!countries.isObject() || countries.isEmpty()) throw new IllegalArgumentException("Missing or empty subject offerings");
        List<Offering> result = new ArrayList<>();
        Set<String> identities = new TreeSet<>();
        for (var iterator = countries.fields(); iterator.hasNext();) {
            var country = iterator.next();
            JsonNode stages = country.getValue().path("stages");
            JsonNode durationNodes = country.getValue().path("durationModels");
            if (country.getKey().isBlank() || !stages.isArray() || stages.isEmpty() || !durationNodes.isArray()) {
                throw new IllegalArgumentException("Missing offered stages or duration inventory: " + country.getKey());
            }
            List<String> durations = new ArrayList<>();
            durationNodes.forEach(node -> durations.add(node.asText()));
            if (durations.stream().anyMatch(String::isBlank)) throw new IllegalArgumentException("Empty offered duration");
            if (durations.isEmpty()) durations.add(""); // Existing no-duration scope semantics.
            for (JsonNode stageNode : stages) {
                String stage = stageNode.asText();
                if (!Set.of("SekI", "SekII", "CrossStage").contains(stage)) {
                    throw new IllegalArgumentException("Unknown offered stage: " + stage);
                }
                for (String duration : durations) {
                    for (String course : "SekI".equals(stage) ? List.of("GK+LK") : List.of("GK", "LK", "GK+LK")) {
                        var offering = new Offering(country.getKey(), stage, duration, course);
                        if (!identities.add(offering.id())) throw new IllegalArgumentException("Duplicate offered scope: " + offering.id());
                        result.add(offering);
                    }
                }
            }
        }
        if (result.isEmpty()) throw new IllegalArgumentException("Subject has zero offered scopes");
        return List.copyOf(result);
    }

    private static Map<String, Object> maturityStatus(Map<String, String> inventory, JsonNode floors, JsonNode status) {
        Map<String, Object> result = new LinkedHashMap<>();
        inventory.forEach((id, subject) -> {
            String floor = "unreported", current = "unreported";
            for (JsonNode node : floors.path("floors")) {
                if (id.equals(node.path("landscapeId").asText())) floor = node.path("minimumMaturity").asText();
            }
            for (JsonNode node : status.path("curricula")) {
                if (id.equals(node.path("landscapeId").asText())) current = node.path("maturity").asText();
            }
            result.put(id, Map.of("subject", subject, "protectedFloor", floor, "currentStatus", current));
        });
        return result;
    }

    static void verifyInputs(Path root, JsonNode binding) {
        if (!binding.path("files").isObject() || binding.path("files").isEmpty()) {
            throw new IllegalStateException("Dedicated audit requires a complete input manifest");
        }
        try {
            Set<String> expectedPaths = currentInputPaths(root);
            Set<String> boundPaths = new TreeSet<>();
            binding.path("files").fieldNames().forEachRemaining(boundPaths::add);
            if (!expectedPaths.equals(boundPaths)) throw new IllegalStateException("Changed audit input path inventory");
            for (var iterator = binding.path("files").fields(); iterator.hasNext();) {
                var entry = iterator.next();
                Path file = root.resolve(entry.getKey()).normalize();
                if (!file.startsWith(root) || !Files.isRegularFile(file)) {
                    throw new IllegalStateException("Missing audit input: " + entry.getKey());
                }
                String actual = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(file)));
                if (!actual.equals(entry.getValue().asText())) throw new IllegalStateException("Changed audit input: " + entry.getKey());
            }
        } catch (java.io.IOException | java.security.NoSuchAlgorithmException error) {
            throw new IllegalStateException("Cannot verify curriculum audit inputs", error);
        }
    }

    static Set<String> currentInputPaths(Path root) throws java.io.IOException {
        // Use the same inventory as Gradle and the Python report gate. Resolve
        // the tool from this checkout even when root is a temporary fixture.
        Path tool = Path.of("../scripts/curriculum_completion_inputs.py").toAbsolutePath().normalize();
        if (!Files.isRegularFile(tool)) tool = Path.of("scripts/curriculum_completion_inputs.py").toAbsolutePath().normalize();
        Process process = new ProcessBuilder("python3", tool.toString(), "--root", root.toAbsolutePath().toString())
                .redirectErrorStream(true).start();
        String output = new String(process.getInputStream().readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        try {
            if (process.waitFor() != 0) throw new java.io.IOException("Shared input inventory failed: " + output);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new java.io.IOException("Interrupted shared input inventory", error);
        }
        Set<String> result = new TreeSet<>();
        for (JsonNode path : MAPPER.readTree(output)) result.add(path.asText());
        return result;
    }

    static void audit(String subject, String scope, Map<String, LearningGoal> canonical, Set<String> targets,
            boolean authoritative, Set<String> viewIds, List<Map<String, Object>> rows, List<String> failures) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("subject", subject);
        row.put("scope", scope);
        row.put("targetCount", targets.size());
        row.put("targetGoalIds", new TreeSet<>(targets));
        row.put("authoritative", authoritative);
        row.put("compositionViewIds", new TreeSet<>(viewIds));
        rows.add(row);
        try {
            assertThat(targets).as("Nonempty authoritative scope %s %s", subject, scope).isNotEmpty();
            var graph = new CompletionProfileCompiler().compileAutomatic(canonical, targets, targets, "structural-integrity");
            Set<String> obligations = new TreeSet<>();
            List<Map<String, Object>> protectedSupport = new ArrayList<>();
            List<Map<String, Object>> unreadyAssessments = new ArrayList<>();
            Map<String, Set<String>> consumers = new TreeMap<>();
            for (String id : graph.contextGoalIds()) {
                LearningGoal goal = canonical.get(id);
                boolean assessment = CompletionProfileCompiler.isAssessment(goal);
                boolean memory = CompletionProfileCompiler.isMemory(goal);
                if (assessment || memory) {
                    if (targets.contains(id)) {
                        obligations.add(id);
                        if (assessment && !ExamTaskReadiness.isReady(goal.getExamData())) {
                            unreadyAssessments.add(Map.of("goalId", id, "title", goal.getTitle()));
                        }
                    } else {
                        protectedSupport.add(Map.of("goalId", id, "title", goal.getTitle(),
                                "kind", assessment ? "assessment" : "memory"));
                    }
                }
                for (String requirement : graph.directPrerequisites(id)) {
                    consumers.computeIfAbsent(requirement, ignored -> new TreeSet<>()).add(id);
                }
            }
            // Independent structural oracle: runtime fallback must never hide a
            // graph defect by adding ordinary terminal goals as obligations.
            Set<String> needed = new TreeSet<>();
            ArrayDeque<String> queue = new ArrayDeque<>(obligations);
            while (!queue.isEmpty()) {
                String id = queue.removeFirst();
                if (needed.add(id)) queue.addAll(graph.directPrerequisites(id));
            }
            List<Map<String, Object>> uncovered = new ArrayList<>();
            for (String id : targets) {
                if (needed.contains(id)) continue;
                Set<String> dependents = consumers.getOrDefault(id, Set.of());
                uncovered.add(Map.of("goalId", id, "title", canonical.get(id).getTitle(),
                        "unexpectedEndpoint", dependents.isEmpty(), "consumerIds", dependents));
            }
            assertThat(AutomaticCompletionIntegrity.uncoveredTargets(graph))
                    .as("Runtime integrity checker must agree with independent reachability for %s %s", subject, scope)
                    .containsExactlyInAnyOrderElementsOf(uncovered.stream().map(goal -> (String) goal.get("goalId")).toList());
            row.put("obligationCount", obligations.size());
            row.put("uncovered", uncovered);
            // Support protection is classification, not an independent target.
            // Direct exam startability additionally requires a usable task/rubric.
            row.put("protectedSupportContext", protectedSupport);
            row.put("unreadyAssessments", unreadyAssessments);
            row.put("passed", uncovered.isEmpty() && unreadyAssessments.isEmpty());
            if (authoritative && (!uncovered.isEmpty() || !unreadyAssessments.isEmpty())) {
                failures.add(subject + " " + scope + ": " + uncovered.size()
                        + " goals without a selected protected endpoint; " + unreadyAssessments.size()
                        + " target assessments without a ready task and rubric");
            }
        } catch (RuntimeException | AssertionError error) {
            row.put("passed", false);
            row.put("error", error.toString());
            if (authoritative) failures.add(subject + " " + scope + ": " + error);
        }
    }

    @Test
    void ordinaryTerminalGoalIsADefectEvenWhenAnAssessmentExistsElsewhere() {
        var foundation = atom("foundation");
        var orphan = atom("orphan", "foundation");
        var exam = readyExam("exam", "foundation");
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        audit("fixture", "offered", Map.of("foundation", foundation, "orphan", orphan, "exam", exam),
                Set.of("foundation", "orphan", "exam"), true, Set.of(), rows, failures);
        assertThat(failures).hasSize(1);
        assertThat(rows.getFirst().get("uncovered")).isEqualTo(List.of(Map.of("goalId", "orphan",
                "title", "orphan", "unexpectedEndpoint", true, "consumerIds", Set.of())));
    }

    @Test
    void memoryEndpointProtectsItsWholeRequiredRouteWithoutAnExam() {
        var foundation = atom("foundation");
        var content = atom("content", "foundation");
        var cards = atom("cards", "content");
        cards.setNodeKind("memory");
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        audit("fixture", "offered", Map.of("foundation", foundation, "content", content, "cards", cards),
                Set.of("foundation", "content", "cards"), true, Set.of(), rows, failures);
        assertThat(failures).isEmpty();
        assertThat(rows.getFirst().get("uncovered")).isEqualTo(List.of());
    }

    @Test
    void hiddenMemorySupportIsProtectedWithoutCreatingAnIndependentObligation() {
        var cards = atom("cards");
        cards.setNodeKind("memory");
        var content = atom("content", "cards");
        var exam = readyExam("exam", "content");
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        audit("fixture", "offered", Map.of("cards", cards, "content", content, "exam", exam),
                Set.of("content", "exam"), true, Set.of(), rows, failures);
        assertThat(rows.getFirst().get("uncovered")).isEqualTo(List.of());
        assertThat(rows.getFirst().get("protectedSupportContext")).isEqualTo(List.of(
                Map.of("goalId", "cards", "title", "cards", "kind", "memory")));
        assertThat(rows.getFirst().get("obligationCount")).isEqualTo(1);
        assertThat(failures).isEmpty();
    }

    @Test
    void targetMembershipDoesNotMakeAnAssessmentTaskStartable() {
        var exam = atom("exam");
        exam.setNodeKind("exam");
        exam.setExamData(null);
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        audit("fixture", "offered", Map.of("exam", exam), Set.of("exam"), true, Set.of(), rows, failures);
        assertThat(rows.getFirst().get("uncovered")).isEqualTo(List.of());
        assertThat(rows.getFirst().get("unreadyAssessments"))
                .isEqualTo(List.of(Map.of("goalId", "exam", "title", "exam")));
        assertThat(failures).hasSize(1);
    }

    @Test
    void semanticAssessmentWithDraftTaskFailsTheSameReadinessContract() {
        var exam = readyExam("exam");
        exam.setNodeKind(null);
        exam.setSemanticKind("assessment");
        exam.getExamData().setReviewStatus("draft");
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        audit("fixture", "offered", Map.of("exam", exam), Set.of("exam"), true, Set.of(), rows, failures);
        assertThat(rows.getFirst().get("unreadyAssessments"))
                .isEqualTo(List.of(Map.of("goalId", "exam", "title", "exam")));
        assertThat(failures).hasSize(1);
    }

    private static LearningGoal atom(String id, String... requirements) {
        var goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of(requirements));
        return goal;
    }

    static LearningGoal readyExam(String id, String... requirements) {
        var goal = atom(id, requirements);
        goal.setNodeKind("exam");
        var exam = new ExamData();
        exam.setTaskContent("1. Berechne 2 + 3 und begründe das Ergebnis.");
        exam.setSolutionContent("2 + 3 = 5.");
        var scoring = new ExamData.Scoring();
        scoring.setMaxPoints(1);
        scoring.setPassingPoints(1);
        var step = new ExamData.Step();
        step.setId("sum");
        step.setPoints(1);
        step.setDescription("Richtiges Ergebnis begründet");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        goal.setExamData(exam);
        return goal;
    }

    private static boolean isAtomic(LearningGoal goal) {
        return goal != null && !"cluster".equalsIgnoreCase(goal.getType())
                && (goal.getContains() == null || goal.getContains().isEmpty());
    }

    /** Read the checked-in generated offering object consumed by the Cockpit. */
    private static JsonNode readCurrentOfferings(Path root) throws Exception {
        String source = Files.readString(root.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker = "export const GYMNASIUM_CONTENT_OFFERINGS = ";
        int start = source.indexOf(marker);
        if (start < 0) throw new IllegalStateException("Missing authoritative Cockpit offering object");
        start += marker.length();
        int end = source.indexOf(" as const satisfies GymnasiumContentOfferings", start);
        if (end < 0) throw new IllegalStateException("Malformed authoritative Cockpit offering object");
        return new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(source.substring(start, end));
    }
}
