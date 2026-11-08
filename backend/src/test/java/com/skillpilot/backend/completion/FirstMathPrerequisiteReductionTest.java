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
import java.util.Collections;
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

/** Live native regression for the registered reductions, independent of ignored measurement receipts. */
class FirstMathPrerequisiteReductionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String BIOLOGY = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String LATIN = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String BIOLOGY_ORIENTATION = "2d451684-6e53-565e-a987-f362da919d2c";
    private static final String LATIN_CLUSTER = "e82cc731-ebf4-588f-9fea-f0d31f7ad0e7";
    private static final String LATIN_ATOM = "bd6b8f87-f9b5-54ad-828e-e1c36c1d4d82";
    private static final String LATIN_BRIDGE = "1476af3f-0ff9-59c0-8a1a-e81dfc011ae2";
    private static final String LATIN_ORIENTATION = "551f2d6c-a030-57cc-9dbd-af30b2c3972a";
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
            "7d51b38c-a149-5407-bddc-d2ce7878b020", LATIN,
            "51b60137-46e8-5498-973e-ea38bb32f327");
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path MATH_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
    private static final Path BIOLOGY_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json");
    private static final Path LATIN_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json");
    private static final Path REDUCTION_REGISTRY = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json");
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
    void firstMathEdgePreservesLiveOfferingsProjectionsAtomicDemandAndEffectiveRoleValidity() throws Exception {
        ReductionRegistry registry = readReductionRegistry();
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : registry.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        // Both frames use the current native policy. Before reconstructs the full
        // original registry baseline, including the first Math reduction.
        var before = new NativeFixture(registry, true);
        var after = new NativeFixture(registry, false);
        assertThat(after.canonicalAtomicIds).as("canonical atomic classification before scope")
                .isEqualTo(before.canonicalAtomicIds);
        assertThat(after.atomicProbesBySource).as("canonical descendant coverage before scope")
                .isEqualTo(before.atomicProbesBySource);
        JsonNode offerings = readGuiOfferings();
        int sourceTargets = 0, sourceContextsOnly = 0, foreignContexts = 0;
        int validRoles = 0, invalidRoles = 0;
        boolean negativeRoleCaseChecked = false;
        boolean navigationClusterCaseChecked = false;
        boolean inheritedRoleCaseChecked = false, transitiveRoleCaseChecked = false;
        boolean latinMissingRoleCaseChecked = false;
        Map<String, Integer> configurationCounts = new TreeMap<>();
        Map<String, Integer> changedContextPairs = new TreeMap<>();
        Map<String, Integer> changedTargetPairs = new TreeMap<>();
        Map<String, Integer> changedValidRoles = new TreeMap<>();
        Map<String, Integer> changedInvalidRoles = new TreeMap<>();
        Set<String> coveredChangedSources = new TreeSet<>();
        Map<String, Set<String>> coveredAtomicProbes = new TreeMap<>();
        long atomicFrontierComparisons = 0;
        long contextGoalComparisons = 0;

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

                if (BIOLOGY.equals(subject) && "DE-MV/SekI/G8/".equals(entry.getKey())) {
                    assertDuplicateRemovalKeepsMissingRoleInvalid(before.service, left,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    assertDuplicateRemovalKeepsMissingRoleInvalid(after.service, right,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.graph().get("b530a382-2786-5794-8821-3e01a62d88fd").getType()).isEqualTo("cluster");
                    }
                    inheritedRoleCaseChecked = true;
                }
                if (MATH.equals(subject) && "ALL/CrossStage//GK".equals(entry.getKey())) {
                    assertDuplicateRemovalKeepsMissingRoleInvalid(before.service, left,
                            "1878f680-095c-511d-aaed-e98393f7fde9", "9460c3ff-e72d-4107-bc73-087d217200aa");
                    assertDuplicateRemovalKeepsMissingRoleInvalid(after.service, right,
                            "1878f680-095c-511d-aaed-e98393f7fde9", "9460c3ff-e72d-4107-bc73-087d217200aa");
                    transitiveRoleCaseChecked = true;
                }

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
                    // The registry overlay changes only these raw requires arrays.
                    if (!registry.changedSources().containsKey(id)) {
                        assertThat(right.graph().get(id).getRequires()).as("requires %s: %s", id, scope)
                                .isEqualTo(left.graph().get(id).getRequires());
                    }
                    assertThat(right.graph().get(id).getContains()).as("contains %s: %s", id, scope)
                            .isEqualTo(left.graph().get(id).getContains());
                }
                for (String id : left.context()) {
                    // Classify against the full canonical contains graph, never the
                    // pruned scope. Non-atomic navigation-source E+ may change.
                    if (!before.canonicalAtomicIds.contains(id)) continue;
                    assertThat(right.topology().transitivePrerequisites(id)).as("full atomic demand %s: %s", id, scope)
                            .isEqualTo(left.topology().transitivePrerequisites(id));
                    assertThat(right.topology().transitiveGoalPrerequisites(id))
                            .as("pre-expansion prerequisite roles for canonical atom %s: %s", id, scope)
                            .isEqualTo(left.topology().transitiveGoalPrerequisites(id));
                    contextGoalComparisons++;
                }
                Map<String, Boolean> originalRoleValidity = new LinkedHashMap<>();
                for (ChangedSource changed : registry.changedSources().values()) {
                    if (left.graph().containsKey(changed.goalId())) {
                        assertThat(left.graph().get(changed.goalId()).getRequires())
                                .as("original registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.originalRequires());
                        assertThat(right.graph().get(changed.goalId()).getRequires())
                                .as("current registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.currentRequires());
                    }
                    for (String id : before.atomicProbesBySource.get(changed.goalId())) {
                        if (!left.context().contains(id)) continue;
                        boolean originalHelper = roleProbe(before.service, left, left.projection(), id, left.topology());
                        boolean reducedHelper = roleProbe(after.service, right, right.projection(), id, right.topology());
                        assertThat(reducedHelper).as("native effective-role helper %s for source %s: %s",
                                id, changed.goalId(), scope).isEqualTo(originalHelper);
                        originalRoleValidity.put(id, originalHelper);
                        coveredChangedSources.add(changed.goalId());
                        coveredAtomicProbes.computeIfAbsent(changed.goalId(), ignored -> new TreeSet<>()).add(id);
                        changedContextPairs.merge(changed.owner(), 1, Integer::sum);
                        if (left.roles().targets().contains(id)) changedTargetPairs.merge(changed.owner(), 1, Integer::sum);
                        (originalHelper ? changedValidRoles : changedInvalidRoles).merge(changed.owner(), 1, Integer::sum);
                        if (!changed.atomicSource() && left.roles().atomicTargets().contains(id)) {
                            atomicFrontierComparisons += assertLatinAtomicFrontierPreserved(
                                    before.service, left, after.service, right, id, originalHelper, scope);
                            if (!latinMissingRoleCaseChecked && originalHelper
                                    && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                                assertThat(roleProbe(before.service, left, withoutRole(left.projection(), LATIN_ORIENTATION),
                                        id, left.topology())).isFalse();
                                assertThat(roleProbe(after.service, right, withoutRole(right.projection(), LATIN_ORIENTATION),
                                        id, right.topology())).isFalse();
                                latinMissingRoleCaseChecked = true;
                            }
                        }
                    }
                }
                if (!left.context().contains(SOURCE)) continue;
                assertThat(subject).as("first Math source reached only from Math: %s", scope).isEqualTo(MATH);
                assertThat(left.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(BEFORE);
                assertThat(right.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(AFTER);
                assertThat(hasDeclaredRole(left, REMOVED)).as("removed prerequisite retains a declared role: %s", scope).isTrue();
                assertThat(hasDeclaredRole(right, REMOVED)).as("reduced prerequisite retains a declared role: %s", scope).isTrue();
                boolean originalHelper = originalRoleValidity.get(SOURCE);
                if (originalHelper) validRoles++; else invalidRoles++;
                if (left.roles().targets().contains(SOURCE)) sourceTargets++; else sourceContextsOnly++;

                if (!negativeRoleCaseChecked && originalHelper
                        && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                    // The endpoint remains required transitively under the same E+ role policy.
                    assertThat(roleProbe(before.service, left, withoutRole(left.projection(), REMOVED))).isFalse();
                    assertThat(roleProbe(after.service, right, withoutRole(right.projection(), REMOVED))).isFalse();
                    negativeRoleCaseChecked = true;
                }
            }
        }
        Set<String> missingChangedSources = new TreeSet<>(registry.changedSources().keySet());
        missingChangedSources.removeAll(coveredChangedSources);
        assertThat(coveredChangedSources).as("all registered sources receive native role probes; missing=%s", missingChangedSources)
                .containsExactlyInAnyOrderElementsOf(registry.changedSources().keySet());
        before.atomicProbesBySource.forEach((source, probes) ->
                assertThat(coveredAtomicProbes.getOrDefault(source, Set.of()))
                        .as("all canonical atomic probes for registered source %s", source)
                        .containsExactlyInAnyOrderElementsOf(probes));
        assertThat(configurationCounts.values().stream().mapToInt(Integer::intValue).sum())
                .as("all actual native planner and GUI configurations").isEqualTo(1240);
        assertThat(sourceTargets).as("actual Math target coverage").isPositive();
        assertThat(sourceContextsOnly).as("Math source present only in supporting compiler context").isPositive();
        assertThat(foreignContexts).isPositive();
        assertThat(validRoles).isPositive();
        // Existing incomplete GK roles remain invalid under the unified policy.
        assertThat(invalidRoles).isPositive();
        assertThat(negativeRoleCaseChecked).as("effective-role negative control executed").isTrue();
        assertThat(navigationClusterCaseChecked).as("actual Bio navigation-cluster counterexample executed").isTrue();
        assertThat(inheritedRoleCaseChecked).as("actual Bio inherited-role counterexample executed").isTrue();
        assertThat(transitiveRoleCaseChecked).as("actual Math transitive-role counterexample executed").isTrue();
        assertThat(latinMissingRoleCaseChecked).as("Latin descendant still requires the removed orientation role").isTrue();
        assertThat(atomicFrontierComparisons).as("actual Latin atomic-target frontier comparisons").isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) {
            assertThat(Files.readAllBytes(source.getKey())).as("canonical source remains untouched: %s", source.getKey())
                    .isEqualTo(source.getValue());
        }
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).as("registry remains untouched").isEqualTo(registryBytes);
        System.out.printf("FIRST_MATH_REDUCTION_NATIVE_COVERAGE configurations=%s sourceTargets=%d sourceContextsOnly=%d foreignContexts=%d validRoles=%d invalidRoles=%d%n",
                configurationCounts, sourceTargets, sourceContextsOnly, foreignContexts, validRoles, invalidRoles);
        System.out.printf("REGISTERED_REDUCTION_NATIVE_COVERAGE baseline=original-registry currentPolicy=true configurations=%d contextGoalComparisons=%d registeredSources=%d reachedSources=%d contextPairs=%s targetPairs=%s validRoles=%s invalidRoles=%s atomicFrontierComparisons=%d%n",
                configurationCounts.values().stream().mapToInt(Integer::intValue).sum(), contextGoalComparisons,
                registry.changedSources().size(), coveredChangedSources.size(), changedContextPairs, changedTargetPairs,
                changedValidRoles, changedInvalidRoles, atomicFrontierComparisons);
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
        final Set<String> canonicalAtomicIds;
        final Map<String, Set<String>> atomicProbesBySource;
        final LearnerRepository learners = mock(LearnerRepository.class);
        final LearnerClientStateRepository clients = mock(LearnerClientStateRepository.class);
        final MasteryRepository mastery = mock(MasteryRepository.class);
        final PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);

        NativeFixture(ReductionRegistry registry, boolean originalBaseline) {
            // Only the baseline's registered raw requires arrays are overlaid.
            mapper = new ObjectMapper(new RegistryBaselineJsonFactory(registry, originalBaseline));
            var properties = new LandscapeProperties();
            properties.setDirectory(REPOSITORY.resolve("curricula").toString());
            landscapes = new LandscapeService(properties, mapper);
            landscapes.pinRuntimeGeneration();
            var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
            assertThat(CompletionProfileCompiler.isOrientation(canonical.get(REMOVED))).isTrue();
            Set<String> atomicIds = new TreeSet<>();
            canonical.forEach((id, goal) -> {
                if (goal.getContains().isEmpty()) atomicIds.add(id);
            });
            canonicalAtomicIds = Collections.unmodifiableSet(atomicIds);
            Map<String, Set<String>> probes = new TreeMap<>();
            for (ChangedSource changed : registry.changedSources().values()) {
                LearningGoal source = canonical.get(changed.goalId());
                assertThat(source).as("native overlay source %s", changed.goalId()).isNotNull();
                assertThat(source.getRequires()).as("native %s raw overlay for %s",
                        originalBaseline ? "original" : "current", changed.goalId())
                        .containsExactlyElementsOf(originalBaseline ? changed.originalRequires() : changed.currentRequires());
                assertThat(canonicalAtomicIds.contains(changed.goalId()))
                        .as("unfiltered source classification %s", changed.goalId()).isEqualTo(changed.atomicSource());
                probes.put(changed.goalId(), canonicalAtomicDescendants(changed.goalId(), canonical));
            }
            atomicProbesBySource = Collections.unmodifiableMap(probes);
            assertThat(atomicProbesBySource.get(LATIN_CLUSTER)).containsExactly(LATIN_ATOM);
            assertThat(canonical.get(LATIN_ATOM).getRequires()).contains(LATIN_BRIDGE);
            assertThat(canonical.get(LATIN_BRIDGE).getRequires()).contains(LATIN_ORIENTATION);
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

    private record ChangedSource(String owner, String goalId, List<String> originalRequires,
            List<String> currentRequires, boolean atomicSource) { }
    private record ReductionRegistry(Map<Path, String> canonicalOwners,
            Map<Path, List<ChangedSource>> changesByFile, Map<String, ChangedSource> changedSources) { }

    private static ReductionRegistry readReductionRegistry() throws IOException {
        JsonNode registry = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isEqualTo("atomic-descendant-covered-cluster-reduction-v2");
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("catalogSources").isArray()).isTrue();
        assertThat(registry.path("originalRequires").isArray() && !registry.path("originalRequires").isEmpty()).isTrue();
        assertThat(registry.path("originalRequires").get(0).path("source").asText()).isEqualTo(MATH + ":" + SOURCE);

        Map<Path, String> canonicalOwners = new LinkedHashMap<>();
        Map<String, Path> ownerFiles = new LinkedHashMap<>();
        Map<String, Map<String, JsonNode>> goalsByOwner = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            String owner = source.path("landscapeId").asText();
            String relative = source.path("path").asText();
            assertThat(owner).isNotBlank();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(file.startsWith(REPOSITORY)).isTrue();
            assertThat(canonicalOwners.putIfAbsent(file, owner)).as("unique canonical registry path: %s", file).isNull();
            assertThat(ownerFiles.putIfAbsent(owner, file)).as("unique canonical registry owner: %s", owner).isNull();
            JsonNode canonical = MAPPER.readTree(file.toFile());
            assertThat(canonical.path("landscapeId").asText()).isEqualTo(owner);
            goalsByOwner.put(owner, rawGoals(canonical));
        }
        assertThat(canonicalOwners).containsKeys(MATH_SOURCE, BIOLOGY_SOURCE, LATIN_SOURCE);
        assertThat(registry.path("removals").isArray()).isTrue();
        int legacyRemovals = 0, clusterRemovals = 0;
        for (JsonNode removal : registry.path("removals")) {
            if (!removal.has("atomicWitnesses")) {
                assertThat(removal.path("witness").isArray()).isTrue();
                legacyRemovals++;
                continue;
            }
            clusterRemovals++;
            assertThat(removal.path("source").asText()).isEqualTo(LATIN + ":" + LATIN_CLUSTER);
            assertThat(removal.path("prerequisite").asText()).isEqualTo(LATIN + ":" + LATIN_ORIENTATION);
            assertThat(removal.has("witness")).isFalse();
            assertThat(removal.path("atomicWitnesses").isArray()).isTrue();
            assertThat(removal.path("atomicWitnesses")).hasSize(1);
            assertThat(rawRequires(removal.path("atomicWitnesses").get(0), LATIN_CLUSTER))
                    .containsExactly(LATIN + ":" + LATIN_ATOM, LATIN + ":" + LATIN_BRIDGE,
                            LATIN + ":" + LATIN_ORIENTATION);
        }
        assertThat(legacyRemovals).as("original Math and 186 Bio operations retained").isEqualTo(187);
        assertThat(clusterRemovals).as("one explicitly covered Latin cluster operation").isEqualTo(1);

        Map<Path, List<ChangedSource>> changesByFile = new LinkedHashMap<>();
        Map<String, ChangedSource> changedSources = new LinkedHashMap<>();
        for (JsonNode original : registry.path("originalRequires")) {
            String qualifiedSource = original.path("source").asText();
            String[] identity = qualifiedSource.split(":", -1);
            assertThat(identity).as("qualified registered source: %s", qualifiedSource).hasSize(2);
            String owner = identity[0], id = identity[1];
            assertThat(owner).isNotBlank();
            assertThat(id).isNotBlank();
            assertThat(ownerFiles).as("registered source owner: %s", qualifiedSource).containsKey(owner);
            JsonNode goal = goalsByOwner.get(owner).get(id);
            assertThat(goal).as("registered native source %s", qualifiedSource).isNotNull();
            assertThat(goal.path("contains").isArray()).isTrue();
            boolean atomicSource = goal.path("contains").isEmpty();
            if (atomicSource) {
                assertAtomicWitness(goal, qualifiedSource);
            } else {
                assertThat(owner).isEqualTo(LATIN);
                assertThat(id).isEqualTo(LATIN_CLUSTER);
                assertThat(goal.path("type").asText()).isEqualTo("cluster");
                assertThat(rawRequires(goal.path("contains"), qualifiedSource)).containsExactly(LATIN_ATOM);
            }
            List<String> before = rawRequires(original.path("requires"), qualifiedSource);
            List<String> after = rawRequires(goal.path("requires"), qualifiedSource);
            assertThat(after).as("registered source has an actual raw reduction: %s", qualifiedSource).isNotEqualTo(before);
            ChangedSource changed = new ChangedSource(owner, id, before, after, atomicSource);
            assertThat(changedSources.putIfAbsent(id, changed)).as("unique registered canonical source: %s", id).isNull();
            changesByFile.computeIfAbsent(ownerFiles.get(owner), ignored -> new ArrayList<>()).add(changed);
        }
        ChangedSource firstMath = changedSources.get(SOURCE);
        assertThat(firstMath.owner()).isEqualTo(MATH);
        assertThat(firstMath.originalRequires()).containsExactlyElementsOf(BEFORE);
        assertThat(firstMath.currentRequires()).containsExactlyElementsOf(AFTER);
        Map<String, JsonNode> math = goalsByOwner.get(MATH);
        for (String id : List.of(SOURCE, RETAINED, REMOVED)) assertAtomicWitness(math.get(id), id);
        assertThat(math.get(RETAINED).path("requires")).as("second direct authored Math witness edge")
                .contains(MAPPER.getNodeFactory().textNode(REMOVED));
        ChangedSource latin = changedSources.get(LATIN_CLUSTER);
        assertThat(latin).as("registered Latin raw cluster overlay").isNotNull();
        assertThat(latin.atomicSource()).isFalse();
        assertThat(latin.originalRequires()).containsExactly(LATIN_ORIENTATION);
        assertThat(latin.currentRequires()).isEmpty();
        assertThat(changedSources.values().stream().filter(ChangedSource::atomicSource).count())
                .as("legacy native source checks remain atomic").isEqualTo(187);
        assertThat(changedSources.values().stream().filter(changed -> !changed.atomicSource()).count())
                .as("only the new registered source is a cluster").isEqualTo(1);

        Map<Path, List<ChangedSource>> immutableChanges = new LinkedHashMap<>();
        changesByFile.forEach((file, changes) -> immutableChanges.put(file, List.copyOf(changes)));
        return new ReductionRegistry(Collections.unmodifiableMap(canonicalOwners),
                Collections.unmodifiableMap(immutableChanges), Collections.unmodifiableMap(changedSources));
    }

    private static Map<String, JsonNode> rawGoals(JsonNode canonical) {
        assertThat(canonical.path("goals").isArray()).isTrue();
        Map<String, JsonNode> goals = new LinkedHashMap<>();
        canonical.path("goals").forEach(goal -> {
            String id = goal.path("id").asText();
            assertThat(id).isNotBlank();
            assertThat(goals.putIfAbsent(id, goal)).as("unique raw canonical goal: %s", id).isNull();
        });
        return goals;
    }

    private static Set<String> canonicalAtomicDescendants(String sourceId, Map<String, LearningGoal> canonical) {
        Set<String> visited = new TreeSet<>(), atoms = new TreeSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(List.of(sourceId));
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!visited.add(id)) continue;
            LearningGoal goal = canonical.get(id);
            assertThat(goal).as("complete canonical contains descendant %s of %s", id, sourceId).isNotNull();
            if (goal.getContains().isEmpty()) atoms.add(id);
            else pending.addAll(goal.getContains());
        }
        assertThat(atoms).as("nonempty canonical atomic basis of %s", sourceId).isNotEmpty();
        return Collections.unmodifiableSet(atoms);
    }

    private static void assertAtomicWitness(JsonNode goal, String id) {
        assertThat(goal).as("registered native source/witness: %s", id).isNotNull();
        assertThat(goal.path("type").asText()).as("structurally atomic witness: %s", id).isEqualTo("atomic");
        assertThat(goal.path("contains").isArray()).isTrue();
        assertThat(goal.path("contains").isEmpty()).isTrue();
    }

    private static List<String> rawRequires(JsonNode references, String id) {
        assertThat(references.isArray()).as("raw ordered requires: %s", id).isTrue();
        List<String> result = new ArrayList<>();
        for (JsonNode reference : references) {
            assertThat(reference.isTextual()).isTrue();
            assertThat(reference.asText()).isNotBlank();
            result.add(reference.asText());
        }
        return List.copyOf(result);
    }

    private static final class RegistryBaselineJsonFactory extends JsonFactory {
        private final ReductionRegistry registry;
        private final boolean originalBaseline;
        RegistryBaselineJsonFactory(ReductionRegistry registry, boolean originalBaseline) {
            this.registry = registry;
            this.originalBaseline = originalBaseline;
        }
        private RegistryBaselineJsonFactory(RegistryBaselineJsonFactory source) {
            super(source, null);
            registry = source.registry;
            originalBaseline = source.originalBaseline;
        }
        @Override public JsonFactory copy() { return new RegistryBaselineJsonFactory(this); }
        @Override public JsonParser createParser(File file) throws IOException {
            Path source = file.toPath().toAbsolutePath().normalize();
            List<ChangedSource> changes = registry.changesByFile().get(source);
            if (changes == null) return super.createParser(file);
            JsonNode tree = MAPPER.readTree(file);
            assertThat(tree.path("landscapeId").asText()).isEqualTo(registry.canonicalOwners().get(source));
            Map<String, JsonNode> goals = rawGoals(tree);
            for (ChangedSource changed : changes) {
                JsonNode goal = goals.get(changed.goalId());
                if (changed.atomicSource()) {
                    assertAtomicWitness(goal, changed.goalId());
                } else {
                    assertThat(goal.path("type").asText()).isEqualTo("cluster");
                    assertThat(rawRequires(goal.path("contains"), changed.goalId())).containsExactly(LATIN_ATOM);
                }
                assertThat(rawRequires(goal.path("requires"), changed.goalId())).as("pinned current raw requires: %s", changed.goalId())
                        .containsExactlyElementsOf(changed.currentRequires());
                if (originalBaseline) ((ObjectNode) goal).set("requires", MAPPER.valueToTree(changed.originalRequires()));
            }
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

    private record AtomicFrontierCase(String name, Map<String, Double> mastery, Set<String> focus,
            boolean strict, Boolean expected) { }

    private static int assertLatinAtomicFrontierPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String atomId, boolean validRoles, String scope) {
        assertThat(atomId).isEqualTo(LATIN_ATOM);
        assertThat(before.topology().transitivePrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        assertThat(before.topology().transitiveGoalPrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(LATIN_ORIENTATION);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("normal-empty", Map.of(), null, false, null),
                new AtomicFrontierCase("normal-mastered", mastered, null, false, validRoles),
                new AtomicFrontierCase("strict-mastered", mastered, null, true, validRoles),
                new AtomicFrontierCase("strict-mastered-intermediate-missing-orientation", missingOrientation, null, true, false),
                new AtomicFrontierCase("strict-only-orientation-mastered", Map.of(LATIN_ORIENTATION, 1.0), null, true, false),
                new AtomicFrontierCase("normal-atomic-focus-empty", Map.of(), Set.of(atomId), false, validRoles),
                new AtomicFrontierCase("strict-atomic-focus-empty", Map.of(), Set.of(atomId), true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, atomId, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, atomId, probe);
            assertThat(reduced).as("native atomic frontier %s/%s: %s", atomId, probe.name(), scope).isEqualTo(original);
            if (probe.expected() != null) {
                assertThat(original).as("native frontier control %s/%s: %s", atomId, probe.name(), scope)
                        .isEqualTo(probe.expected());
            }
        }
        return cases.size();
    }

    private static boolean atomicFrontierProbe(LearnerService service, NativeScope scope,
            String atomId, AtomicFrontierCase probe) {
        Boolean originalStrictMode = scope.learner().getStrictMode();
        try {
            scope.learner().setStrictMode(probe.strict());
            Object prerequisites = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites",
                    scope.learner(), scope.projection(), probe.mastery(), probe.focus());
            assertThat(ReflectionTestUtils.<Object>invokeMethod(prerequisites, "topology"))
                    .as("actual atomic frontier topology: %s", probe.name()).isNotNull();
            return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(atomId), scope.projection(), prerequisites);
        } finally {
            scope.learner().setStrictMode(originalStrictMode);
        }
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
        return roleProbe(service, scope, projection, SOURCE, scope.topology());
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        Map<String, Double> mastered = new TreeMap<>();
        scope.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$FrontierPrerequisites");
        var constructor = type.getDeclaredConstructor(Map.class, CompletionProfileCompiler.PrerequisiteTopology.class, Map.class, Set.class);
        constructor.setAccessible(true);
        Object prerequisites = constructor.newInstance(scope.graph(), topology, mastered, null);
        return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered", scope.graph().get(sourceId), projection, prerequisites);
    }

    private static void assertDuplicateRemovalKeepsMissingRoleInvalid(LearnerService service, NativeScope scope,
            String sourceId, String prerequisiteId) throws Exception {
        assertThat(scope.roles().targets()).contains(sourceId);
        assertThat(scope.context()).contains(sourceId);
        assertThat(hasDeclaredRole(scope, prerequisiteId)).isFalse();
        assertThat(scope.topology().transitiveGoalPrerequisites(sourceId)).contains(prerequisiteId);
        assertThat(roleProbe(service, scope, scope.projection(), sourceId, scope.topology())).isFalse();
        LearningGoal source = scope.graph().get(sourceId);
        List<String> original = source.getRequires();
        assertThat(original).contains(prerequisiteId);
        try {
            // Remove just this duplicate in the isolated native graph, never in canonical data.
            source.setRequires(original.stream().filter(id -> !prerequisiteId.equals(id)).toList());
            var reduced = new CompletionProfileCompiler().normalizePrerequisites(scope.graph());
            reduced.validateContext(scope.roles().atomicTargets());
            assertThat(reduced.transitiveGoalPrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitiveGoalPrerequisites(sourceId));
            assertThat(reduced.transitivePrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitivePrerequisites(sourceId));
            assertThat(roleProbe(service, scope, scope.projection(), sourceId, reduced)).isFalse();
        } finally {
            source.setRequires(original);
        }
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
