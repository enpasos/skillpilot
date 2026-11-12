package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
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
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

/**
 * Required-learning gate {@code APV-102} on the canonical catalog as it is: in every offered
 * configuration of every subject and jurisdiction, each atom the selected Personal Curriculum
 * needs is an emitted acquisition target with a visible definition and enters automatic
 * completion. The production services resolve every scope; no proof registry, document
 * digest or goal count is involved.
 */
class CanonicalRequiredLearningGateTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String BIOLOGY = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    // Subjects with GUI offerings; this list changes only with the offerings, never with goals.
    private static final List<String> SUBJECTS = List.of(
            "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced", // Mathematik
            BIOLOGY,
            "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0", // Chemie
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", // Physik
            "605bdaf6-32d5-56fd-8d92-5a80c2fd2901", // Wirtschaft
            "67bd301b-e11a-582d-94ba-4f4b1a4cefff", // Deutsch
            "92406d94-e3c1-58ec-b7c6-12122278d25a", // Geschichte
            "7d51b38c-a149-5407-bddc-d2ce7878b020", // Informatik
            "668cf206-941e-51f8-8704-3e8938631235", // Latein
            "51b60137-46e8-5498-973e-ea38bb32f327"); // Politik und Wirtschaft
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path BIOLOGY_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json");
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

    /** Synthetic closed learning basis: a missing acquisition target or definition fails closed. */
    @Test
    void canonicalProbeUsesClosedLearningBasisAndMissingAcquisitionTargetsFailClosed() throws Exception {
        Map<String, LearningGoal> graph = new TreeMap<>();
        for (String id : List.of("T", "K", "P", "Q")) {
            LearningGoal goal = new LearningGoal();
            goal.setId(id); goal.setType("K".equals(id) ? "cluster" : "atomic");
            goal.setContains("K".equals(id) ? List.of("P") : List.of());
            goal.setRequires("T".equals(id) ? List.of("K") : "P".equals(id) ? List.of("Q") : List.of());
            graph.put(id, goal);
        }
        var service = new LearnerService(mock(LearnerRepository.class), mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class), mock(PlannedGoalRepository.class), mock(LandscapeService.class),
                mock(GoalMappingService.class), mock(DeckResourceService.class), MAPPER, mock(ApplicationEventPublisher.class));
        JsonNode canonicalBefore = MAPPER.valueToTree(graph);
        CanonicalProbe probe = canonicalProbe(graph, Set.of("T"));
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(probe.projection(), "learningScope");
        assertThat(learning.seedAtomicGoalIds()).containsExactly("T");
        assertThat(learning.learningAtomicGoalIds()).containsExactlyInAnyOrder("T", "P", "Q");
        assertThat(roleProbe(service, probe.graph(), probe.projection(), "T", probe.topology())).isTrue();
        Object missingTarget = withoutAcquisitionTarget(probe.projection(), "Q");
        PersonalCurriculumLearningScope broken = ReflectionTestUtils.invokeMethod(missingTarget, "learningScope");
        assertThat(broken.seedAtomicGoalIds()).isEqualTo(learning.seedAtomicGoalIds());
        assertThat(broken.learningAtomicGoalIds()).doesNotContain("Q");
        assertThat(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(missingTarget, "visibleGoals")).doesNotContainKey("Q");
        assertThat(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(missingTarget, "canonicalPrerequisiteGoals")).isSameAs(graph);
        assertThat(roleProbe(service, probe.graph(), missingTarget, "T", probe.topology())).isFalse();
        assertThat(roleProbe(service, probe.graph(), withoutNonAtomicRole(probe.projection(), "K"), "T", probe.topology())).isTrue();
        assertThat((JsonNode) MAPPER.valueToTree(graph)).isEqualTo(canonicalBefore);
        assertThat(learning.learningAtomicGoalIds()).contains("Q");
        Map<String, LearningGoal> missingDefinition = new TreeMap<>(graph);
        missingDefinition.remove("Q");
        assertThatThrownBy(() -> canonicalProbe(missingDefinition, Set.of("T")))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("MISSING_REFERENCE"));
    }

    @Test
    void currentCatalogLearningScopesRetainEveryCanonicalAcquisitionTarget() throws Exception {
        var fixture = new CatalogFixture();
        // Every subject the root reaches can be selected in a Personal Curriculum.
        Set<String> subjects = new TreeSet<>();
        fixture.landscapes.getClosure(ROOT).forEach(landscape -> subjects.add(landscape.getLandscapeId()));
        assertThat(subjects).contains(ROOT);
        subjects.remove(ROOT);
        JsonNode guiOfferings = readGuiOfferings();
        Set<String> guiSubjects = new TreeSet<>();
        guiOfferings.fieldNames().forEachRemaining(guiSubjects::add);
        assertThat(guiSubjects).containsExactlyInAnyOrderElementsOf(SUBJECTS);
        assertThat(subjects).containsAll(guiSubjects);
        Set<String> jurisdictions = new TreeSet<>();
        fixture.landscapes.getById(ROOT).getFilters().forEach(filter -> jurisdictions.add(filter.getId()));
        assertThat(jurisdictions).contains("ALL", "DE-BY", "DE-HE");
        Map<String, String> coverage = new TreeMap<>();
        Set<String> visitedSubjects = new TreeSet<>();
        var publicService = spy(fixture.service);
        String learnerId = "unsaved-current-catalog-scope-control";
        for (String subject : subjects) {
            Discovery discovery = discover(fixture, subject, guiOfferings.path(subject), jurisdictions);
            int checked = 0, unavailable = 0, incomplete = 0, invalid = 0;
            for (var entry : discovery.configurations().entrySet()) {
                String key = subject + "/" + entry.getKey();
                Map<String, Map<String, Object>> config = entry.getValue();
                PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                        (id, settings) -> ReflectionTestUtils.invokeMethod(
                                fixture.service, "resolvePersonalizationOfferingScope", id, settings), config);
                String category;
                if (plan.valid() && !plan.required()) {
                    // resolve checks actual emitted targets/definitions/completion against
                    // separately selected seeds and the unpruned canonical prerequisite graph.
                    ResolvedScope scope = fixture.resolve(config);
                    assertThat(scope.atomicTargets()).as("nonempty complete scope %s", key).isNotEmpty();
                    category = "checked";
                    checked++;
                } else {
                    assertThat(discovery.plannerScopes()).as("native completed scopes cannot become incomplete").doesNotContain(entry.getKey());
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(config));
                    doReturn(learner).when(publicService).getLearner(learnerId);
                    assertThatThrownBy(() -> publicService.getPlanningScope(learnerId, subject))
                            .isInstanceOfSatisfying(ResponseStatusException.class, failure -> {
                                assertThat(failure.getStatusCode().value()).isEqualTo(409);
                                assertThat(failure.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                            });
                    category = plan.valid() ? "incomplete" : "invalid:" + plan.problemCode();
                    if (plan.valid()) incomplete++; else invalid++;
                }
                assertThat(coverage.putIfAbsent(key, category)).as("one coverage outcome per actual configuration").isNull();
            }
            for (String jurisdiction : jurisdictions) {
                boolean hasConfiguration = discovery.configurations().values().stream().anyMatch(config ->
                        jurisdiction.equals(config.get(ROOT).get("filterId")));
                if (hasConfiguration) continue;
                for (var entry : discovery.offeredPlans().entrySet()) {
                    Map<String, Map<String, Object>> config = MAPPER.readValue(entry.getKey(), new TypeReference<>() { });
                    if (!jurisdiction.equals(config.get(ROOT).get("filterId"))) continue;
                    assertThat(entry.getValue().options()).as("an offered subject must have a discovered scope: %s/%s", subject, jurisdiction)
                            .noneMatch(option -> subject.equals(option.landscapeId()));
                }
                assertThat(coverage.putIfAbsent(subject + "/" + jurisdiction + "/no-offer", "not-offered")).isNull();
                unavailable++;
            }
            assertThat(checked + incomplete + invalid).isEqualTo(discovery.configurations().size());
            if (guiSubjects.contains(subject)) assertThat(checked).as("required subject has real checked scopes: %s", subject).isPositive();
            assertThat(visitedSubjects.add(subject)).isTrue();
            System.out.printf("CURRENT_NATIVE_LEARNING_SCOPE subject=%s checked=%d notOffered=%d incomplete=%d invalid=%d guiDeclared=%s%n",
                    subject, checked, unavailable, incomplete, invalid, guiSubjects.contains(subject));
        }
        assertThat(visitedSubjects).isEqualTo(subjects);
        assertThat(coverage).isNotEmpty();
        System.out.printf("CURRENT_NATIVE_LEARNING_SCOPE_COVERAGE subjects=%d jurisdictions=%d guiSubjects=%d classifiedRows=%d multiSubjectPowerSet=false%n",
                visitedSubjects.size(), jurisdictions.size(), guiSubjects.size(), coverage.size());
    }

    @Test
    void currentBiologyBavariaProjectionRetainsRequiredLearningAcrossJurisdictions() throws Exception {
        String assessment = "487c79f5-7e4d-5da8-ad8f-f0f96c23a974";
        String hessenPreparation = "afde0001-d7d7-5ed3-8a60-383e8da5620e";
        String bavarianPreparation = "11675f1a-5de2-5926-be78-1e8275f19f5b";
        var fixture = new CatalogFixture();
        byte[] sourceBefore = Files.readAllBytes(BIOLOGY_SOURCE);
        Map<String, Map<String, Object>> config = Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-BY", "stage", "CrossStage", "durationModel", "G9"),
                BIOLOGY, Map.of("selected", true, "filterId", "GK"));
        // Finish only the actual planner's outstanding group confirmations.
        // The selected country, stage, duration and subject remain fixed.
        for (int step = 0; ; step++) {
            assertThat(step).isLessThan(10);
            PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                    (id, settings) -> ReflectionTestUtils.invokeMethod(
                            fixture.service, "resolvePersonalizationOfferingScope", id, settings), config);
            assertThat(plan.valid()).isTrue();
            if (!plan.required()) break;
            PersonalizationPlan.Option option = plan.options().stream()
                    .filter(candidate -> candidate.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                    .findFirst().orElseThrow(() -> new AssertionError("Unexpected unresolved Biology selection: " + plan));
            Map<String, Object> mutable = new LinkedHashMap<>();
            config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
            ReflectionTestUtils.invokeMethod(CurriculumPersonalizationPlanner.class,
                    "recordGroupCompletion", mutable, ROOT, option);
            config = MAPPER.convertValue(mutable, new TypeReference<>() { });
        }
        ResolvedScope scope = fixture.resolve(config);
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(scope.projection(), "learningScope");
        assertThat(learning.seedAtomicGoalIds()).contains(assessment).doesNotContain(hessenPreparation);
        assertThat(scope.topology().transitivePrerequisites(assessment))
                .contains(hessenPreparation, bavarianPreparation);
        assertThat(scope.atomicTargets()).contains(assessment, hessenPreparation, bavarianPreparation);
        // The premise of this regression: a Hessen-only atom is required learning in Bavaria.
        assertThat(fixture.canonicalGoals.get(hessenPreparation).getApplicability().get("jurisdiction"))
                .containsExactly("DE-HE");

        String learnerId = "unsaved-biology-required-learning-control";
        scope.learner().setSkillpilotId(learnerId);
        when(fixture.learners.findById(learnerId)).thenReturn(Optional.of(scope.learner()));
        var exported = fixture.service.getLearnerLandscapeClosure(learnerId, ROOT, "de");
        Set<String> exportedTargets = new TreeSet<>(), plannedTargets = new TreeSet<>();
        for (var landscape : exported) {
            var metadata = landscape.getPersonalCurriculumProjection();
            if (metadata == null || metadata.targetGoalIds().isEmpty()) continue;
            exportedTargets.addAll(metadata.targetGoalIds());
            var plan = fixture.service.getPlanningScope(learnerId, landscape.getLandscapeId());
            plannedTargets.addAll(plan.scopeAtomicGoalIds());
        }
        assertThat(exportedTargets).isEqualTo(scope.atomicTargets());
        assertThat(plannedTargets).isEqualTo(scope.atomicTargets());
        assertThat(plannedTargets).contains(hessenPreparation, bavarianPreparation);

        // Keep the independently compiled L, seeds, canonical graph and full mastery intact.
        // Dropping only an emitted target or only its visible definition must fail.
        Map<String, Double> fullMastery = new TreeMap<>();
        scope.graph().keySet().forEach(id -> fullMastery.put(id, 1.0));
        for (boolean removeTarget : List.of(true, false)) {
            Object broken = withoutEmittedAcquisitionAtom(scope.projection(), hessenPreparation, removeTarget);
            assertThat(ReflectionTestUtils.<PersonalCurriculumLearningScope>invokeMethod(broken, "learningScope"))
                    .isSameAs(learning);
            assertThatThrownBy(() -> fixture.assertLearningEmission(
                    scope.learner().getPersonalCurriculum(), broken)).isInstanceOf(AssertionError.class)
                    .hasMessageContaining("APV-102");
            assertThat(roleProbe(fixture.service, scope.graph(), broken, assessment, scope.topology())).isFalse();
            Object narrowed = ReflectionTestUtils.invokeMethod(fixture.service, "frontierPrerequisites",
                    scope.learner(), broken, fullMastery, Set.of(assessment));
            assertThat(ReflectionTestUtils.<Object>invokeMethod(narrowed, "topology")).isNotNull();
            assertThat(ReflectionTestUtils.<Boolean>invokeMethod(fixture.service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(assessment), broken, narrowed)).isFalse();
        }
        verify(fixture.mastery, never()).save(any(Mastery.class));
        verify(fixture.mastery, never()).saveAll(any());
        assertThat(Files.readAllBytes(BIOLOGY_SOURCE)).isEqualTo(sourceBefore);
    }

    private record ResolvedScope(Learner learner, Object projection, Set<String> atomicTargets,
            Map<String, LearningGoal> graph, CompletionProfileCompiler.PrerequisiteTopology topology) { }
    private record CanonicalProbe(Map<String, LearningGoal> graph,
            CompletionProfileCompiler.PrerequisiteTopology topology, Object projection) { }
    private record Discovery(Map<String, Map<String, Map<String, Object>>> configurations,
            Set<String> plannerScopes, Map<String, PersonalizationPlan> offeredPlans) { }

    private static CanonicalProbe canonicalProbe(Map<String, LearningGoal> graph, Set<String> atoms) throws Exception {
        var learningScope = PersonalCurriculumLearningScope.compile(graph, atoms);
        Set<String> targets = learningScope.learningAtomicGoalIds();
        var compiler = new CompletionProfileCompiler();
        var topology = compiler.normalizePrerequisites(graph);
        topology.validateContext(targets);
        compiler.compileAutomatic(graph, targets, targets, "canonical-atomic-probe");
        Set<String> support = new TreeSet<>();
        atoms.forEach(atom -> support.addAll(topology.transitiveGoalPrerequisites(atom)));
        support.removeAll(targets);
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$GoalProjection");
        var constructor = type.getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class, Set.class,
                List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(graph, targets, support, graph, Set.of(),
                atoms.stream().sorted().toList(), true, learningScope, graph);
        return new CanonicalProbe(graph, topology, projection);
    }

    /** Production services over the committed curricula, with unsaved learners only. */
    private static final class CatalogFixture {
        final ObjectMapper mapper = new ObjectMapper();
        final LandscapeService landscapes;
        final LearnerService service;
        final Map<String, LearningGoal> canonicalGoals;
        final CompletionProfileCompiler.PrerequisiteTopology canonicalTopology;
        final Set<String> canonicalAtomicIds;
        final LearnerRepository learners = mock(LearnerRepository.class);
        final MasteryRepository mastery = mock(MasteryRepository.class);

        CatalogFixture() {
            var properties = new LandscapeProperties();
            properties.setDirectory(REPOSITORY.resolve("curricula").toString());
            landscapes = new LandscapeService(properties, mapper);
            landscapes.pinRuntimeGeneration();
            var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
            canonicalGoals = Collections.unmodifiableMap(canonical);
            canonicalTopology = new CompletionProfileCompiler().normalizePrerequisites(canonicalGoals);
            Set<String> atomicIds = new TreeSet<>();
            canonical.forEach((id, goal) -> {
                if (goal.getContains().isEmpty()) atomicIds.add(id);
            });
            canonicalAtomicIds = Collections.unmodifiableSet(atomicIds);
            Map<String, List<String>> contains = new TreeMap<>();
            canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
            service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery,
                    mock(PlannedGoalRepository.class), landscapes, new GoalMappingService(properties, mapper),
                    mock(DeckResourceService.class), mapper, mock(ApplicationEventPublisher.class));
            ReflectionTestUtils.setField(service, "compositionViewService", new CompositionViewService(properties, mapper, () -> contains));
            var catalog = mock(CompletionProfileCatalog.class);
            when(catalog.automatic()).thenReturn(true);
            when(catalog.available()).thenReturn(true);
            ReflectionTestUtils.setField(service, "completionApplicationService", new CompletionApplicationService(catalog));
        }

        ResolvedScope resolve(Map<String, Map<String, Object>> config) throws Exception {
            String personalCurriculum = mapper.writeValueAsString(config);
            var learner = new Learner();
            learner.setSelectedCurriculum(ROOT);
            learner.setPersonalCurriculum(personalCurriculum);
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT, personalCurriculum, false);
            assertLearningEmission(personalCurriculum, projection);
            Set<String> atomic = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", "automatic:personal-curriculum", projection);
            Set<String> targets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Map<String, LearningGoal> graph = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            Object frontier = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", learner, projection, Map.of(), null);
            CompletionProfileCompiler.PrerequisiteTopology topology = ReflectionTestUtils.invokeMethod(frontier, "topology");
            assertThat(topology).as("actual runtime prerequisite topology: %s", personalCurriculum).isNotNull();
            topology.validateContext(atomic);
            // The scope's actual completion graph must compile.
            new CompletionProfileCompiler().compileAutomatic(graph, atomic, targets, "canonical-required-learning-gate");
            return new ResolvedScope(learner, projection, atomic, graph, topology);
        }

        void assertLearningEmission(String personalCurriculum, Object projection) {
            Object seeds = ReflectionTestUtils.invokeMethod(service, "computeSeedGoalProjection", ROOT, personalCurriculum, false);
            Set<String> seedTargets = ReflectionTestUtils.invokeMethod(seeds, "targetGoalIds");
            Map<String, LearningGoal> seedDefinitions = ReflectionTestUtils.invokeMethod(seeds, "structuralGoals");
            Set<String> expected = new TreeSet<>();
            for (String id : seedTargets) {
                LearningGoal seed = seedDefinitions.get(id);
                assertThat(seed).as("APV-102 seed definition %s", id).isNotNull();
                if (seed.getContains() != null && !seed.getContains().isEmpty()) continue;
                LearningGoal goal = canonicalGoals.get(id);
                assertThat(goal).as("APV-102 canonical atomic seed %s", id).isNotNull();
                assertThat(goal.getContains()).as("APV-102 canonical seed must be atomic: %s", id).isEmpty();
                expected.add(id);
                expected.addAll(canonicalTopology.transitivePrerequisites(id));
            }
            Set<String> targetIds = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
            Set<String> actualAtoms = new TreeSet<>();
            for (String id : targetIds) {
                LearningGoal goal = structural.get(id);
                assertThat(goal).as("APV-102 emitted target definition %s", id).isNotNull();
                if (goal.getContains() != null && !goal.getContains().isEmpty()) continue;
                assertThat(canonicalAtomicIds).as("APV-102 emitted target must be a known canonical atom: %s", id).contains(id);
                actualAtoms.add(id);
            }
            assertThat(actualAtoms).as("APV-102 emitted targets equal independent canonical demand: %s", personalCurriculum)
                    .isEqualTo(expected);
            Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(projection, "visibleGoals");
            assertThat(visible.keySet()).as("APV-102 every required target has an emitted definition").containsAll(expected);
            Set<String> completion = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets",
                    "automatic:personal-curriculum", projection);
            assertThat(completion).as("APV-102 completion receives the complete independent acquisition basis").isEqualTo(expected);
        }
    }

    private static Discovery discover(CatalogFixture fixture, String subject, JsonNode declared,
            Set<String> jurisdictions) throws Exception {
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
        // GUI-declared configurations the planner did not complete are classified as well.
        Set<String> gui = new TreeSet<>();
        declared.properties().forEach(country -> {
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
        return new Discovery(configurations, planner, offeredPlans);
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

    /** Effective-role check of one goal with every goal of the graph mastered. */
    private static boolean roleProbe(LearnerService service, Map<String, LearningGoal> graph, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        Map<String, Double> mastered = new TreeMap<>();
        graph.keySet().forEach(id -> mastered.put(id, 1.0));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$FrontierPrerequisites");
        var constructor = type.getDeclaredConstructor(Map.class, CompletionProfileCompiler.PrerequisiteTopology.class, Map.class, Set.class);
        constructor.setAccessible(true);
        Object prerequisites = constructor.newInstance(graph, topology, mastered, null);
        return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered", graph.get(sourceId), projection, prerequisites);
    }

    /** Deliberately broken emitted acquisition basis; canonical definitions remain resolvable. */
    private static Object withoutAcquisitionTarget(Object projection, String id) throws Exception {
        PersonalCurriculumLearningScope original = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        assertThat(original).isNotNull();
        assertThat(original.learningAtomicGoalIds()).as("missing-target fixture removes an actual acquisition atom").contains(id);
        Set<String> learning = new TreeSet<>(original.learningAtomicGoalIds());
        Map<String, List<String>> paths = new TreeMap<>(original.requiredByPaths());
        learning.remove(id); paths.remove(id);
        var broken = new PersonalCurriculumLearningScope(original.seedAtomicGoalIds(), learning, paths);
        Map<String, LearningGoal> visible = new TreeMap<>(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(projection, "visibleGoals"));
        visible.remove(id);
        return copyProjectionWithoutRole(projection, id, visible, broken);
    }

    /** Corrupt only one emitted representation; canonical definitions and the full L stay intact. */
    private static Object withoutEmittedAcquisitionAtom(Object projection, String id, boolean removeTarget) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Map<String, LearningGoal> visible = new TreeMap<>(ReflectionTestUtils.<Map<String, LearningGoal>>invokeMethod(projection, "visibleGoals"));
        assertThat(targets).contains(id);
        assertThat(visible).containsKey(id);
        if (removeTarget) targets.remove(id);
        else visible.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class,
                Set.class, List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        return constructor.newInstance(visible, targets,
                ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied"),
                ReflectionTestUtils.invokeMethod(projection, "learningScope"),
                ReflectionTestUtils.invokeMethod(projection, "canonicalPrerequisiteGoals"));
    }

    /** A non-atomic authored support role alone is not an acquisition obligation. */
    private static Object withoutNonAtomicRole(Object projection, String id) throws Exception {
        PersonalCurriculumLearningScope learning = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        assertThat(learning).isNotNull();
        assertThat(learning.learningAtomicGoalIds()).doesNotContain(id);
        Map<String, LearningGoal> structural = ReflectionTestUtils.invokeMethod(projection, "structuralGoals");
        assertThat(structural.get(id)).as("non-atomic role fixture keeps its canonical definition").isNotNull();
        assertThat(structural.get(id).getContains()).isNotEmpty();
        return copyProjectionWithoutRole(projection, id,
                ReflectionTestUtils.invokeMethod(projection, "visibleGoals"), learning);
    }

    private static Object copyProjectionWithoutRole(Object projection, String id,
            Map<String, LearningGoal> visible, PersonalCurriculumLearningScope learning) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Set<String> support = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "prerequisiteOnlyGoalIds"));
        targets.remove(id); support.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class,
                Set.class, List.class, boolean.class, PersonalCurriculumLearningScope.class, Map.class);
        constructor.setAccessible(true);
        return constructor.newInstance(visible, targets, support,
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"), ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"),
                ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied"), learning,
                ReflectionTestUtils.invokeMethod(projection, "canonicalPrerequisiteGoals"));
    }
}
