package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestFactory;

class CompletionCoreTest {
    private final CompletionProfileCompiler compiler = new CompletionProfileCompiler();
    private final CompletionEvaluator evaluator = new CompletionEvaluator();

    @TestFactory
    Stream<DynamicTest> sharedAuthoringConformanceCorpus() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode corpus = mapper.readTree(Files.readString(repositoryPath(
                "contracts/assessment-completion/v1/fixtures/cases.json")));
        List<DynamicTest> tests = new ArrayList<>();
        for (JsonNode fixture : corpus.path("cases")) {
            tests.add(DynamicTest.dynamicTest(fixture.path("id").asText(), () -> {
                Map<String, LearningGoal> graph = new LinkedHashMap<>();
                for (JsonNode node : fixture.path("graph")) {
                    LearningGoal goal = mapper.treeToValue(node, LearningGoal.class);
                    assertThat(graph.put(goal.getId(), goal)).as("fixture duplicate identity").isNull();
                }
                var profile = mapper.treeToValue(fixture.path("profile"), CompletionProfileDefinition.class);
                if (fixture.has("expectedError")) {
                    assertThatThrownBy(() -> compiler.compile(profile, graph,
                            strings(fixture.path("targetGoalIds")), strings(fixture.path("level2TargetGoalIds")),
                            fixture.path("curriculumGeneration").asText("fixture-generation")))
                            .isInstanceOfSatisfying(CompletionCompilationException.class,
                                    error -> assertThat(error.code()).isEqualTo(fixture.path("expectedError").asText()));
                } else {
                    var compiled = compiler.compile(profile, graph,
                            strings(fixture.path("targetGoalIds")), strings(fixture.path("level2TargetGoalIds")),
                            fixture.path("curriculumGeneration").asText("fixture-generation"));
                    var result = evaluator.evaluate(compiled, strings(fixture.path("masteredGoalIds")));
                    var expected = fixture.path("expected");
                    assertThat(result.waivedGoalIds()).isEqualTo(strings(expected.path("waivedGoalIds")));
                    assertThat(result.pendingTargetGoalIds()).isEqualTo(strings(expected.path("pendingTargetGoalIds")));
                    assertThat(result.complete()).isEqualTo(expected.path("complete").asBoolean());
                    assertThat(result.masteredTargetCount() + result.waivedTargetCount() + result.pendingTargetCount())
                            .isEqualTo(result.targetCount());
                }
            }));
        }
        assertThat(tests).hasSizeGreaterThanOrEqualTo(20);
        return tests.stream();
    }

    @Test
    void exhaustiveSmallDagsMatchIndependentTransitiveFixedPoint() {
        // A mastered sentinel assessment reaches every test node. This permits every E/W
        // assignment while keeping every authored rule valid under the real compiler.
        for (int n = 1; n <= 4; n++) {
            List<int[]> possible = new ArrayList<>();
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) possible.add(new int[]{i, j});
            for (int graphMask = 0; graphMask < 1 << possible.size(); graphMask++) {
                Map<String, Set<String>> edges = new LinkedHashMap<>();
                for (int i = 0; i < n; i++) edges.put("v" + i, new LinkedHashSet<>());
                for (int bit = 0; bit < possible.size(); bit++) if ((graphMask & 1 << bit) != 0) {
                    edges.get("v" + possible.get(bit)[0]).add("v" + possible.get(bit)[1]);
                }
                checkAllAssignments(edges, n);
            }
        }
    }

    @Test
    void arbitraryLabelsAndDenseGraphsMatchIndependentReference() {
        Random random = new Random(20261030);
        for (int attempt = 0; attempt < 200; attempt++) {
            int n = 6 + random.nextInt(75);
            List<String> labels = new ArrayList<>();
            for (int i = 0; i < n; i++) labels.add("node-" + i);
            Collections.shuffle(labels, random);
            Map<String, Set<String>> edges = new LinkedHashMap<>();
            for (String label : labels) edges.put(label, new LinkedHashSet<>());
            double density = attempt % 2 == 0 ? .05 : .7;
            for (int i = 0; i < n; i++) for (int j = i + 1; j < n; j++) {
                if (random.nextDouble() < density) edges.get(labels.get(i)).add(labels.get(j));
            }
            Map<String, Set<String>> consumers = transitiveConsumers(edges);
            for (int trial = 0; trial < 8; trial++) {
                Set<String> mastered = new HashSet<>();
                Set<String> eligible = new HashSet<>();
                for (String label : labels) {
                    if (random.nextBoolean()) mastered.add(label);
                    if (random.nextBoolean()) eligible.add(label);
                }
                compareWithReference(edges, consumers, mastered, eligible);
            }
        }
    }

    @Test
    void allContainsParentsAndAllRequiredClusterAtomsParticipate() {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        graph.put("Q", goal("Q", List.of("branch-one", "branch-two"), List.of(), true));
        graph.put("branch-one", goal("branch-one", List.of("required-cluster"), List.of("B"), false));
        graph.put("branch-two", goal("branch-two", List.of("Z"), List.of("B"), false));
        graph.put("required-cluster", goal("required-cluster", List.of(), List.of("GK", "LK"), false));
        for (String id : List.of("B", "GK", "LK", "Z")) graph.put(id, goal(id, List.of(), List.of(), false));
        graph.get("GK").setTags(List.of("GK"));
        graph.get("LK").setTags(List.of("LK"));
        var compiled = compiler.compile(profile(List.of("GK", "LK", "Z", "B")), graph,
                Set.of("Q", "B"), Set.of("Q", "B"), "generation-1");
        assertThat(compiled.contextGoalIds()).containsExactlyInAnyOrder("Q", "B", "GK", "LK", "Z");
        assertThat(compiled.directPrerequisites("B")).containsExactly("GK", "LK", "Z");
        assertThat(compiled.targetGoalIds()).containsExactly("B", "Q");
        var result = evaluator.evaluate(compiled, Set.of("Q"));
        assertThat(result.complete()).isTrue();
        assertThat(result.waivedTargetCount()).isEqualTo(1);
        assertThat(result.waivedGoalIds()).hasSize(4); // Supporting waivers are not target progress.
    }

    @Test
    void immutableCompilationAndStableReasonSurviveInputMutationAndReordering() {
        Map<String, LearningGoal> graph = simpleGraph();
        var definition = profile(List.of("A", "B"));
        var compiled = compiler.compile(definition, graph, graph.keySet(), graph.keySet(), "generation-1");
        graph.get("Q").setRequires(List.of("missing"));
        graph.clear();
        var result = evaluator.evaluate(compiled, Set.of("Q", "foreign-mastered-goal"));
        assertThat(result.complete()).isTrue();
        assertThat(result.masteredGoalIds()).containsExactly("Q");
        assertThat(result.waiverReasons().get("A").ruleId()).isEqualTo("rule-1");
        assertThatThrownBy(() -> compiled.targetGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> compiled.goalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> result.waivedGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);

        var other = new CompletionProfileDefinition(1, "profile", "1", definition.title(), "scope", Map.of(),
                List.of(), definition.review(), List.of(
                new CompletionProfileDefinition.WaiverRule("z-rule", List.of("Q"), List.of("A", "B"), "rationale", "review"),
                new CompletionProfileDefinition.WaiverRule("a-rule", List.of("Q"), List.of("A", "B"), "rationale", "review")));
        var g = simpleGraph();
        var sortedReasons = evaluator.evaluate(compiler.compile(other, g, g.keySet(), g.keySet(), "generation-2"), Set.of("Q"));
        assertThat(sortedReasons.waiverReasons().get("A").ruleId()).isEqualTo("a-rule");
    }

    @Test
    void openConsumerRemainsReasonThroughAMasteredIntermediate() {
        var graph = simpleGraph();
        var compiled = compiler.compile(profile(List.of("A")), graph, graph.keySet(), graph.keySet(), "generation-1");
        var result = evaluator.evaluate(compiled, Set.of("B"));
        assertThat(result.waivedGoalIds()).isEmpty(); // No passed assessment, so no enabled rule.
        graph.put("C", goal("C", List.of("B"), List.of(), false));
        compiled = compiler.compile(profile(List.of("A")), graph, graph.keySet(), graph.keySet(), "generation-1");
        result = evaluator.evaluate(compiled, Set.of("Q", "B"));
        assertThat(result.blockedByGoalIds()).containsEntry("A", "C");
        assertThat(result.pendingTargetGoalIds()).containsExactly("A", "C");
    }

    @Test
    void compilationOfDeepGraphDoesNotUseTheJavaCallStack() {
        int n = 20_000;
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        graph.put("Q", goal("Q", List.of("v0"), List.of(), true));
        for (int i = 0; i < n; i++) graph.put("v" + i,
                goal("v" + i, i + 1 == n ? List.of() : List.of("v" + (i + 1)), List.of(), false));
        var compiled = compiler.compile(profile(List.of()), graph, Set.of("Q"), Set.of("Q"), "generation-1");
        assertThat(compiled.contextGoalIds()).hasSize(n + 1);
        assertThat(compiled.expandedEdgeCount()).isEqualTo(n);
        assertThat(evaluator.evaluate(compiled, Set.of("Q")).complete()).isTrue();
    }

    private void checkAllAssignments(Map<String, Set<String>> edges, int n) {
        Map<String, Set<String>> consumers = transitiveConsumers(edges);
        for (int e = 0; e < 1 << n; e++) for (int w = 0; w < 1 << n; w++) {
            Set<String> mastered = new HashSet<>();
            Set<String> eligible = new HashSet<>();
            for (int i = 0; i < n; i++) {
                if ((e & 1 << i) != 0) mastered.add("v" + i);
                if ((w & 1 << i) != 0) eligible.add("v" + i);
            }
            compareWithReference(edges, consumers, mastered, eligible);
        }
    }

    private void compareWithReference(Map<String, Set<String>> edges, Map<String, Set<String>> consumers,
                                      Set<String> mastered, Set<String> eligible) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        edges.forEach((id, refs) -> graph.put(id, goal(id, new ArrayList<>(refs), List.of(), false)));
        graph.put("Q", goal("Q", new ArrayList<>(edges.keySet()), List.of(), true));
        Set<String> inputMastery = new HashSet<>(mastered);
        inputMastery.add("Q");
        var compiled = compiler.compile(profile(new ArrayList<>(eligible)), graph,
                graph.keySet(), graph.keySet(), "test-generation");
        var actual = evaluator.evaluate(compiled, inputMastery);
        Set<String> reference = fixedPoint(consumers, mastered, eligible);
        Set<String> waived = new HashSet<>(reference);
        waived.removeAll(mastered);
        assertThat(actual.waivedGoalIds()).as("graph=%s mastery=%s eligible=%s", edges, mastered, eligible).isEqualTo(waived);
        Set<String> expectedPending = new HashSet<>(edges.keySet());
        expectedPending.removeAll(reference);
        assertThat(actual.pendingTargetGoalIds()).isEqualTo(expectedPending);
    }

    /** Independent reference: BFS transitive closure, then simultaneous set-based iteration. */
    private static Map<String, Set<String>> transitiveConsumers(Map<String, Set<String>> edges) {
        Map<String, Set<String>> consumers = new LinkedHashMap<>();
        for (String id : edges.keySet()) consumers.put(id, new HashSet<>());
        for (String source : edges.keySet()) {
            Set<String> seen = new HashSet<>();
            ArrayDeque<String> queue = new ArrayDeque<>(edges.get(source));
            while (!queue.isEmpty()) {
                String current = queue.removeFirst();
                if (seen.add(current)) {
                    consumers.get(current).add(source);
                    queue.addAll(edges.get(current));
                }
            }
        }
        return consumers;
    }

    private static Set<String> fixedPoint(Map<String, Set<String>> consumers, Set<String> mastered, Set<String> eligible) {
        Set<String> done = new HashSet<>(mastered);
        while (true) {
            Set<String> next = new HashSet<>(done);
            for (String id : eligible) if (done.containsAll(consumers.get(id))) next.add(id);
            if (next.equals(done)) return done;
            done = next;
        }
    }

    private static Map<String, LearningGoal> simpleGraph() {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        graph.put("Q", goal("Q", List.of("B"), List.of(), true));
        graph.put("B", goal("B", List.of("A"), List.of(), false));
        graph.put("A", goal("A", List.of(), List.of(), false));
        return graph;
    }

    private static CompletionProfileDefinition profile(List<String> waivable) {
        return new CompletionProfileDefinition(1, "profile", "1", Map.of("de", "Abschnitt", "en", "Scope"),
                "scope", Map.of(), List.of(), new CompletionProfileDefinition.Review("review", "s1", "t1", "r1"),
                List.of(new CompletionProfileDefinition.WaiverRule("rule-1", List.of("Q"), waivable, "Reviewed fixture policy", "review")));
    }

    private static LearningGoal goal(String id, List<String> requires, List<String> contains, boolean assessment) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setRequires(requires);
        goal.setContains(contains);
        goal.setType(contains.isEmpty() ? "atomic" : "cluster");
        if (assessment) goal.setNodeKind("exam");
        return goal;
    }

    private static Set<String> strings(JsonNode node) {
        Set<String> strings = new LinkedHashSet<>();
        for (JsonNode value : node) strings.add(value.asText());
        return strings;
    }

    private static Path repositoryPath(String relative) {
        Path current = Path.of("").toAbsolutePath();
        while (current != null) {
            Path path = current.resolve(relative);
            if (Files.exists(path)) return path;
            current = current.getParent();
        }
        throw new IllegalStateException("Missing repository fixture " + relative);
    }
}
