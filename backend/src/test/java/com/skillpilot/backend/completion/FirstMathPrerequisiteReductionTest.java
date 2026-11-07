package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.PersonalizationPlan;
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
import com.skillpilot.backend.service.CurriculumPersonalizationPlanner;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Live native regression for one authored edge, independent of ignored measurement receipts. */
class FirstMathPrerequisiteReductionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String BIOLOGY = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String BIOLOGY_ORIENTATION = "2d451684-6e53-565e-a987-f362da919d2c";
    private static final String EXCLUDED_NAVIGATION_CLUSTER = "d11b3b18-deec-5d1a-bff6-512cddf595a2";
    private static final String SOURCE = "bf17cada-3ccd-5d9a-b9e3-42065cfdbb01";
    private static final String RETAINED = "91e2f564-3bc8-4924-af85-2a3fa84c1471";
    private static final String REMOVED = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final List<String> BEFORE = List.of(RETAINED, REMOVED);
    private static final List<String> AFTER = List.of(RETAINED);
    private static final List<String> SUBJECTS = List.of(MATH,
            BIOLOGY, "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", "605bdaf6-32d5-56fd-8d92-5a80c2fd2901",
            "67bd301b-e11a-582d-94ba-4f4b1a4cefff", "92406d94-e3c1-58ec-b7c6-12122278d25a",
            "7d51b38c-a149-5407-bddc-d2ce7878b020", "668cf206-941e-51f8-8704-3e8938631235",
            "51b60137-46e8-5498-973e-ea38bb32f327");
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path MATH_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static Path findRepositoryRoot() {
        Path start = Path.of("").toAbsolutePath().normalize();
        for (Path candidate = start; candidate != null; candidate = candidate.getParent()) {
            if (Files.isDirectory(candidate.resolve("curricula"))
                    && Files.isDirectory(candidate.resolve("app/src/generated"))
                    && Files.isDirectory(candidate.resolve("backend"))) {
                return candidate;
            }
        }
        throw new IllegalStateException("Cannot locate SkillPilot repository root from " + start);
    }

    @Test
    void firstMathEdgePreservesLiveOfferingsProjectionsAtomicDemandAndDirectRoleValidity() throws Exception {
        byte[] sourceBytes = Files.readAllBytes(MATH_SOURCE);
        var before = new NativeFixture(BEFORE);
        var after = new NativeFixture(AFTER);
        JsonNode offerings = readGuiOfferings();
        int sourceTargets = 0, sourceContextsOnly = 0, foreignContexts = 0;
        int validRoles = 0, invalidRoles = 0;
        boolean negativeRoleCaseChecked = false;
        boolean navigationClusterCaseChecked = false;
        Map<String, Integer> configurationCounts = new TreeMap<>();

        for (String subject : SUBJECTS) {
            Discovery original = discover(before, subject, offerings.path(subject));
            Discovery reduced = discover(after, subject, offerings.path(subject));
            assertThat(reduced).as("actual offered and selected configurations: %s", subject).isEqualTo(original);
            assertThat(original.plannerScopes()).as("native planner coverage: %s", subject).isNotEmpty();
            assertThat(original.guiScopes()).as("declared GUI coverage: %s", subject).isNotEmpty();
            configurationCounts.put(subject, original.configurations().size());
            for (var entry : original.configurations().entrySet()) {
                String scope = subject + "/" + entry.getKey();
                NativeScope left = before.resolve(entry.getValue());
                NativeScope right = after.resolve(reduced.configurations().get(entry.getKey()));
                assertThat(right.roles()).as("projection roles and views: %s", scope).isEqualTo(left.roles());
                assertThat(right.graph().keySet()).as("complete resolved graph: %s", scope)
                        .isEqualTo(left.graph().keySet());
                assertThat(right.context()).as("complete native compiler context: %s", scope).isEqualTo(left.context());

                if (BIOLOGY.equals(subject) && "DE-BY/CrossStage/G9/GK".equals(entry.getKey())) {
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.roles().targets()).contains(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.roles().atomicTargets()).doesNotContain(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.graph()).doesNotContainKey(EXCLUDED_NAVIGATION_CLUSTER);
                    }
                    assertBiologyOrientationAvailable(before.service, left);
                    assertBiologyOrientationAvailable(after.service, right);
                    assertInvalidAtomicRequirementOutsideFocusFailsClosed(before.service, left);
                    navigationClusterCaseChecked = true;
                }

                if (!MATH.equals(subject)) {
                    assertThat(left.graph()).as("foreign resolved context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(right.graph()).as("foreign reduced context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(left.context()).as(scope).doesNotContain(SOURCE);
                    assertThat(right.context()).as(scope).doesNotContain(SOURCE);
                    foreignContexts++;
                }
                for (String id : left.graph().keySet()) {
                    // Only SOURCE may differ; foreign contexts therefore have identical actual topology.
                    if (!SOURCE.equals(id)) {
                        assertThat(right.graph().get(id).getRequires()).as("requires %s: %s", id, scope)
                                .isEqualTo(left.graph().get(id).getRequires());
                    }
                    assertThat(right.graph().get(id).getContains()).as("contains %s: %s", id, scope)
                            .isEqualTo(left.graph().get(id).getContains());
                }
                if (!left.context().contains(SOURCE)) continue;
                assertThat(subject).as("source reached only from Math: %s", scope).isEqualTo(MATH);
                for (String id : left.context()) {
                    assertThat(right.topology().transitivePrerequisites(id)).as("full atomic demand %s: %s", id, scope)
                            .isEqualTo(left.topology().transitivePrerequisites(id));
                }
                assertThat(left.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(BEFORE);
                assertThat(right.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(AFTER);
                assertThat(hasDeclaredRole(left, REMOVED)).as("removed prerequisite retains a declared role: %s", scope).isTrue();
                assertThat(hasDeclaredRole(right, REMOVED)).as("reduced prerequisite retains a declared role: %s", scope).isTrue();
                boolean originalHelper = roleProbe(before.service, left, left.projection());
                boolean reducedHelper = roleProbe(after.service, right, right.projection());
                assertThat(reducedHelper).as("native direct-role helper: %s", scope).isEqualTo(originalHelper);
                if (originalHelper) validRoles++; else invalidRoles++;
                if (left.roles().targets().contains(SOURCE)) sourceTargets++; else sourceContextsOnly++;

                if (!negativeRoleCaseChecked && originalHelper
                        && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                    // Same real graphs and atomic demand, but deleting the direct endpoint's role
                    // changes the native helper. Reachability equality alone cannot approve a repair.
                    assertThat(roleProbe(before.service, left, withoutRole(left.projection(), REMOVED))).isFalse();
                    assertThat(roleProbe(after.service, right, withoutRole(right.projection(), REMOVED))).isTrue();
                    negativeRoleCaseChecked = true;
                }
            }
        }
        assertThat(sourceTargets).as("actual Math target coverage").isPositive();
        assertThat(sourceContextsOnly).as("Math source present only in supporting compiler context").isPositive();
        assertThat(foreignContexts).isPositive();
        assertThat(validRoles).isPositive();
        // Existing GK projections may omit RETAINED's direct role. Preserve those false results.
        assertThat(invalidRoles).isPositive();
        assertThat(negativeRoleCaseChecked).as("direct-role negative control executed").isTrue();
        assertThat(navigationClusterCaseChecked).as("actual Bio navigation-cluster counterexample executed").isTrue();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        assertThat(Files.readAllBytes(MATH_SOURCE)).as("canonical source remains untouched").isEqualTo(sourceBytes);
        System.out.printf("FIRST_MATH_REDUCTION_NATIVE_COVERAGE configurations=%s sourceTargets=%d sourceContextsOnly=%d foreignContexts=%d validRoles=%d invalidRoles=%d%n",
                configurationCounts, sourceTargets, sourceContextsOnly, foreignContexts, validRoles, invalidRoles);
    }

    private record Roles(Set<String> targets, Set<String> atomicTargets, Set<String> support, Set<String> viewIds) { }
    private record NativeScope(Learner learner, Object projection, Object frontier, Roles roles,
            Map<String, LearningGoal> graph, Set<String> context, CompletionProfileCompiler.PrerequisiteTopology topology) { }
    private record Discovery(Map<String, Map<String, Map<String, Object>>> configurations,
            Set<String> plannerScopes, Set<String> guiScopes, Map<String, PersonalizationPlan> offeredPlans) { }

    private static final class NativeFixture {
        final ObjectMapper mapper;
        final LandscapeService landscapes;
        final LearnerService service;
        final LearnerRepository learners = mock(LearnerRepository.class);
        final LearnerClientStateRepository clients = mock(LearnerClientStateRepository.class);
        final MasteryRepository mastery = mock(MasteryRepository.class);
        final PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);

        NativeFixture(List<String> requires) {
            // Reuse the measurement adapter's parser overlay: no source file or runtime class is changed.
            mapper = new ObjectMapper(new SingleEdgeJsonFactory(requires));
            var properties = new LandscapeProperties();
            properties.setDirectory(REPOSITORY.resolve("curricula").toString());
            landscapes = new LandscapeService(properties, mapper);
            landscapes.pinRuntimeGeneration();
            var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
            assertThat(CompletionProfileCompiler.isOrientation(canonical.get(REMOVED))).isTrue();
            Map<String, List<String>> contains = new TreeMap<>();
            canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
            service = new LearnerService(learners, clients, mastery, plans, landscapes,
                    new GoalMappingService(properties, mapper), mock(DeckResourceService.class), mapper, events);
            ReflectionTestUtils.setField(service, "compositionViewService", new CompositionViewService(properties, mapper, () -> contains));
            var catalog = mock(CompletionProfileCatalog.class);
            when(catalog.automatic()).thenReturn(true);
            when(catalog.available()).thenReturn(true);
            ReflectionTestUtils.setField(service, "completionApplicationService", new CompletionApplicationService(catalog));
        }

        NativeScope resolve(Map<String, Map<String, Object>> config) throws Exception {
            String personalCurriculum = mapper.writeValueAsString(config);
            var learner = new Learner();
            learner.setSelectedCurriculum(ROOT);
            learner.setPersonalCurriculum(personalCurriculum);
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT, personalCurriculum, false);
            Set<String> atomic = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", "automatic:personal-curriculum", projection);
            Set<String> targets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
            Set<String> views = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
            Map<String, LearningGoal> graph = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            var compiler = new CompletionProfileCompiler();
            Object frontier = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", learner, projection, Map.of(), null);
            CompletionProfileCompiler.PrerequisiteTopology topology = ReflectionTestUtils.invokeMethod(frontier, "topology");
            assertThat(topology).as("actual runtime prerequisite topology: %s", personalCurriculum).isNotNull();
            topology.validateContext(atomic);
            var compiled = compiler.compileAutomatic(graph, atomic, targets, "first-math-edge-regression");
            return new NativeScope(learner, projection, frontier, new Roles(targets, atomic, support, views), graph, compiled.contextGoalIds(), topology);
        }

        void verifyOnlyUnsavedFixtures() {
            // Native option application invokes persistence, intercepted exclusively by this mock.
            verify(learners, atLeastOnce()).save(argThat(learner -> learner.getSkillpilotId() == null));
            verifyNoMoreInteractions(learners);
            verifyNoInteractions(clients, mastery, plans);
        }
    }

    private static final class SingleEdgeJsonFactory extends JsonFactory {
        private final List<String> requires;
        SingleEdgeJsonFactory(List<String> requires) { this.requires = requires; }
        private SingleEdgeJsonFactory(SingleEdgeJsonFactory source) { super(source, null); requires = source.requires; }
        @Override public JsonFactory copy() { return new SingleEdgeJsonFactory(this); }
        @Override public JsonParser createParser(File file) throws IOException {
            if (!file.toPath().toAbsolutePath().normalize().equals(MATH_SOURCE)) return super.createParser(file);
            JsonNode tree = MAPPER.readTree(file);
            assertThat(tree.path("landscapeId").asText()).isEqualTo(MATH);
            Map<String, JsonNode> goals = new TreeMap<>();
            tree.path("goals").forEach(goal -> goals.put(goal.path("id").asText(), goal));
            for (String id : List.of(SOURCE, RETAINED, REMOVED)) {
                assertThat(goals).containsKey(id);
                assertThat(goals.get(id).path("type").asText()).as("structurally atomic witness: %s", id).isEqualTo("atomic");
                assertThat(goals.get(id).path("contains").isArray()).isTrue();
                assertThat(goals.get(id).path("contains").isEmpty()).isTrue();
            }
            assertThat(goals.get(SOURCE).path("requires")).as("exact supported current raw state")
                    .isIn(MAPPER.valueToTree(BEFORE), MAPPER.valueToTree(AFTER));
            assertThat(goals.get(RETAINED).path("requires")).as("second direct authored witness edge")
                    .contains(MAPPER.getNodeFactory().textNode(REMOVED));
            ((ObjectNode) goals.get(SOURCE)).set("requires", MAPPER.valueToTree(requires));
            return super.createParser(tree.toString());
        }
    }

    private static Discovery discover(NativeFixture fixture, String subject, JsonNode declared) throws Exception {
        assertThat(declared.isObject() && !declared.isEmpty()).as("GUI offerings for %s", subject).isTrue();
        Set<String> jurisdictions = new TreeSet<>();
        declared.fieldNames().forEachRemaining(jurisdictions::add);
        jurisdictions.add("ALL");
        Map<String, Map<String, Map<String, Object>>> configurations = new TreeMap<>();
        Map<String, PersonalizationPlan> offeredPlans = new TreeMap<>();
        for (String jurisdiction : jurisdictions) {
            ArrayDeque<Map<String, Map<String, Object>>> pending = new ArrayDeque<>();
            pending.add(Map.of(ROOT, Map.of("selected", true, "filterId", jurisdiction)));
            Set<Map<String, Map<String, Object>>> visited = new HashSet<>();
            while (!pending.isEmpty()) {
                var config = pending.removeFirst();
                if (!visited.add(config)) continue;
                assertThat(visited.size()).as("bounded actual planner discovery").isLessThan(10000);
                PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                        (id, scope) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", id, scope), config);
                assertThat(plan.valid()).as("planner failure must not disappear: %s %s %s", subject, config, plan.problemCode()).isTrue();
                offeredPlans.put(MAPPER.writeValueAsString(config), plan);
                if (!plan.required()) {
                    if (Boolean.TRUE.equals(config.getOrDefault(subject, Map.of()).get("selected"))) {
                        assertThat(configurations.putIfAbsent(identity(config, subject), config)).as("unique planner configuration").isNull();
                    }
                    continue;
                }
                for (PersonalizationPlan.Option option : plan.options()) {
                    if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP || ROOT.equals(option.landscapeId()) || subject.equals(option.landscapeId())) {
                        Map<String, Object> mutable = new LinkedHashMap<>();
                        config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
                        var learner = new Learner(); learner.setSelectedCurriculum(ROOT);
                        ReflectionTestUtils.invokeMethod(fixture.service, "applyCurrentPersonalizationOption", learner, mutable, option);
                        pending.add(MAPPER.readValue(learner.getPersonalCurriculum(), new TypeReference<>() { }));
                    }
                }
            }
        }
        Set<String> planner = new TreeSet<>(configurations.keySet());
        Set<String> gui = new TreeSet<>();
        declared.fields().forEachRemaining(country -> {
            JsonNode settings = country.getValue();
            assertThat(settings.path("stages").isArray() && !settings.path("stages").isEmpty()).isTrue();
            assertThat(settings.path("durationModels").isArray()).isTrue();
            List<String> durations = new ArrayList<>();
            settings.path("durationModels").forEach(duration -> {
                assertThat(duration.asText()).isIn("G8", "G9"); durations.add(duration.asText());
            });
            if (durations.isEmpty()) durations.add("");
            settings.path("stages").forEach(stage -> {
                assertThat(stage.asText()).isIn("SekI", "SekII", "CrossStage");
                for (String duration : durations) for (String course : "SekI".equals(stage.asText()) ? List.of("") : List.of("GK", "LK", "GK+LK")) {
                    String identity = String.join("/", country.getKey(), stage.asText(), duration, course);
                    assertThat(gui.add(identity)).as("unique declared GUI configuration").isTrue();
                    Map<String, Object> root = new TreeMap<>(Map.of("selected", true, "filterId", country.getKey(), "stage", stage.asText()));
                    if (!duration.isBlank()) root.put("durationModel", duration);
                    Map<String, Object> selection = new TreeMap<>(Map.of("selected", true));
                    if (!course.isBlank()) selection.put("filterId", course);
                    configurations.putIfAbsent(identity, Map.of(ROOT, root, subject, selection));
                }
            });
        });
        return new Discovery(configurations, planner, gui, offeredPlans);
    }

    private static String identity(Map<String, Map<String, Object>> config, String subject) {
        Map<String, Object> root = config.get(ROOT);
        return String.join("/", (String) root.get("filterId"), (String) root.get("stage"),
                (String) root.getOrDefault("durationModel", ""), (String) config.get(subject).getOrDefault("filterId", ""));
    }

    private static JsonNode readGuiOfferings() throws IOException {
        String source = Files.readString(REPOSITORY.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker = "export const GYMNASIUM_CONTENT_OFFERINGS = ";
        int start = source.indexOf(marker), end = source.indexOf(" as const satisfies GymnasiumContentOfferings", start);
        assertThat(start).isNotNegative();
        assertThat(end).isGreaterThan(start);
        return new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(source.substring(start + marker.length(), end));
    }

    private static boolean hasDeclaredRole(NativeScope scope, String id) {
        return scope.roles().targets().contains(id) || scope.roles().support().contains(id);
    }

    private static void assertBiologyOrientationAvailable(LearnerService service, NativeScope scope) {
        LearningGoal orientation = scope.graph().get(BIOLOGY_ORIENTATION);
        assertThat(orientation).isNotNull();
        assertThat(CompletionProfileCompiler.isOrientation(orientation)).isTrue();
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                orientation, scope.projection(), scope.frontier())).isTrue();
    }

    private static void assertInvalidAtomicRequirementOutsideFocusFailsClosed(LearnerService service, NativeScope scope) {
        String outsideFocus = scope.roles().atomicTargets().stream()
                .filter(id -> !BIOLOGY_ORIENTATION.equals(id) && "atomic".equals(scope.graph().get(id).getType()))
                .sorted().findFirst().orElseThrow();
        LearningGoal outsideGoal = scope.graph().get(outsideFocus);
        List<String> original = outsideGoal.getRequires();
        try {
            // The cached native definition is changed only in this isolated fixture.
            outsideGoal.setRequires(List.of("unknown-atomic-requirement-outside-focus"));
            Object rejected = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", scope.learner(),
                    scope.projection(), Map.of(), Set.of(BIOLOGY_ORIENTATION));
            assertThat(ReflectionTestUtils.<Object>invokeMethod(rejected, "topology")).isNull();
            assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(BIOLOGY_ORIENTATION), scope.projection(), rejected)).isFalse();
        } finally {
            outsideGoal.setRequires(original);
        }
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection) throws Exception {
        Map<String, Double> mastered = new TreeMap<>();
        scope.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$FrontierPrerequisites");
        var constructor = type.getDeclaredConstructor(Map.class, CompletionProfileCompiler.PrerequisiteTopology.class, Map.class, Set.class);
        constructor.setAccessible(true);
        Object prerequisites = constructor.newInstance(scope.graph(), scope.topology(), mastered, null);
        return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered", scope.graph().get(SOURCE), projection, prerequisites);
    }

    private static Object withoutRole(Object projection, String id) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Set<String> support = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "prerequisiteOnlyGoalIds"));
        targets.remove(id); support.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class, Set.class, List.class, boolean.class);
        constructor.setAccessible(true);
        return constructor.newInstance(ReflectionTestUtils.invokeMethod(projection, "visibleGoals"), targets, support,
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"), ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"), true);
    }
}
