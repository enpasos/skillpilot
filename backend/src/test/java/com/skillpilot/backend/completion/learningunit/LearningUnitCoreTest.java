package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCompilationException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitCoreTest {
    private final LearningUnitCompiler compiler = new LearningUnitCompiler();
    private final LearningUnitEvaluator evaluator = new LearningUnitEvaluator();

    @Test
    void zeroMasteryNeverRecognizesCoveredOrdinaryTargets() {
        var unit = unit("local", graph("Q", "B", "B", "A"), Set.of("Q", "A", "B"), Set.of("Q"), Set.of(), List.of());
        var result = evaluator.evaluate(compiler.compile(List.of(unit)), Set.of());
        assertThat(result.recognizedGoalIds()).isEmpty();
        assertThat(result.units().get(unit.ref()).complete()).isFalse();
    }

    @Test
    void fullDemandPassesThroughExplicitMasteryAndOutsideSupport() {
        var unit = unit("local", graph("Q", "B", "B", "outside", "outside", "A"), Set.of("Q", "A", "B"), Set.of("Q"), Set.of(), List.of());
        var compiled = compiler.compile(List.of(unit));
        assertThat(evaluator.evaluate(compiled, Set.of("B", "outside")).recognizedGoalIds()).isEmpty();
        var result = evaluator.evaluate(compiled, Set.of("Q"));
        assertThat(result.recognizedGoalIds()).containsExactlyInAnyOrder("A", "B");
        assertThat(result.effectiveMasteryGoalIds()).doesNotContain("outside");
        assertThat(result.units().get(unit.ref()).targetCount()).isEqualTo(3);
    }

    @Test
    void independentRecognitionDoesNotWaitForUnrelatedOwnRecall() {
        var unit = unit("local", graph("Q", "A", "K", "B"), Set.of("Q", "A", "K"), Set.of("Q"), Set.of("K"), List.of());
        var result = evaluator.evaluate(compiler.compile(List.of(unit)), Set.of("Q"));
        assertThat(result.recognizedGoalIds()).containsExactly("A");
        assertThat(result.effectiveMasteryGoalIds()).doesNotContain("K", "B");
        assertThat(result.units().get(unit.ref()).complete()).isFalse();
    }

    @Test
    void everyOwnAssessmentRetainsItsSharedCompetenceUntilPassed() {
        var shared = unit("shared", graph("Q1", "A", "Q2", "A"),
                Set.of("Q1", "Q2", "A"), Set.of("Q1", "Q2"), Set.of(), List.of());
        var compiled = compiler.compile(List.of(shared));
        assertThat(evaluator.evaluate(compiled, Set.of("Q1")).recognizedGoalIds()).isEmpty();
        assertThat(evaluator.evaluate(compiled, Set.of("Q1", "Q2")).recognizedGoalIds()).containsExactly("A");
        var disjoint = unit("disjoint", graph("Q1", "A", "Q2", "B"),
                Set.of("Q1", "Q2", "A", "B"), Set.of("Q1", "Q2"), Set.of(), List.of());
        var result = evaluator.evaluate(compiler.compile(List.of(disjoint)), Set.of("Q1"));
        assertThat(result.recognizedGoalIds()).containsExactly("A");
        assertThat(result.units().get(disjoint.ref()).complete()).isFalse();
    }

    @Test
    void historicalLocalContractKeepsCreditWhenNewLargerContractHasOpenDuties() {
        var historical = unit("historical", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var expanded = unit("expanded", graph("Q", "A", "P", "A", "P", "B"),
                Set.of("Q", "P", "A", "B"), Set.of("Q", "P"), Set.of(), List.of());
        var result = evaluator.evaluate(compiler.compile(List.of(historical, expanded)), Set.of("Q"));
        assertThat(result.recognizedGoalIds()).containsExactly("A");
        assertThat(result.units().get(historical.ref()).complete()).isTrue();
        assertThat(result.units().get(expanded.ref()).complete()).isFalse();
    }

    @Test
    void childAndParentObligationsNeverPassEachOther() {
        var child = unit("child", graph("Q", "A", "K", "A"), Set.of("Q", "A", "K"), Set.of("Q"), Set.of("K"), List.of());
        var parent = unit("parent", graph("P", "Q"), Set.of("P"), Set.of("P"), Set.of(), List.of(child.ref()));
        var aggregate = unit("course", Map.of(), Set.of(), Set.of(), Set.of(), List.of(parent.ref()));
        var compiled = compiler.compile(List.of(aggregate, parent, child));
        var childrenDone = evaluator.evaluate(compiled, Set.of("Q", "K"));
        assertThat(childrenDone.recognizedGoalIds()).containsExactly("A");
        assertThat(childrenDone.units().get(child.ref()).complete()).isTrue();
        assertThat(childrenDone.units().get(parent.ref()).complete()).isFalse();
        assertThat(childrenDone.units().get(aggregate.ref()).complete()).isFalse();
        var parentDone = evaluator.evaluate(compiled, Set.of("P"));
        assertThat(parentDone.recognizedGoalIds()).isEmpty();
        assertThat(parentDone.units().get(child.ref()).complete()).isFalse();
        var all = evaluator.evaluate(compiled, Set.of("P", "Q", "K"));
        assertThat(all.units().get(aggregate.ref()).complete()).isTrue();
        assertThat(all.units().get(aggregate.ref()).targetCount()).isEqualTo(4);
    }

    @Test
    void otherOpenConsumersAndScopeChangesDoNotRevokeLocalRecognition() {
        var acquisition = unit("acquisition", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var later = unit("later", graph("P", "A"), Set.of("P"), Set.of("P"), Set.of(), List.of());
        var compiled = compiler.compile(List.of(acquisition, later));
        var cache = new LearningUnitRecognitionCache();
        var result = cache.evaluate("learner", compiled, Set.of("Q"));
        assertThat(result.recognizedGoalIds()).containsExactly("A");
        assertThat(result.units().get(later.ref()).complete()).isFalse();
        // There is deliberately no Personal Curriculum or previous-visit input.
        assertThat(cache.evaluate("learner", compiled, Set.of("Q"))).isSameAs(result);
    }

    @Test
    void implicitMasteryNeverFeedsBackIntoAnotherLocalDerivation() {
        var first = unit("first", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var second = unit("second", graph("P", "A", "A", "B"), Set.of("P", "B"), Set.of("P"), Set.of(), List.of());
        var result = evaluator.evaluate(compiler.compile(List.of(first, second)), Set.of("Q"));
        assertThat(result.recognizedGoalIds()).containsExactly("A");
        assertThat(result.effectiveMasteryGoalIds()).doesNotContain("B");
    }

    @Test
    void invalidCoverageAndDuplicateDirectOwnershipFail() {
        var uncovered = unit("bad", Map.of("A", List.of()), Set.of("A"), Set.of(), Set.of(), List.of());
        assertCode("UNCOVERED_OWN_TARGET", () -> compiler.compile(List.of(uncovered)));
        var first = unit("first", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var second = unit("second", graph("P", "A"), Set.of("P", "A"), Set.of("P"), Set.of(), List.of());
        var parent = unit("parent", Map.of(), Set.of(), Set.of(), Set.of(), List.of(first.ref(), second.ref()));
        assertCode("AMBIGUOUS_ACQUISITION_OWNER", () -> compiler.compile(List.of(parent, first, second)));
    }

    @Test
    void missingSupportAndAtomicAndUnitCyclesFailClosed() {
        var missing = unit("missing", Map.of("Q", List.of("A")), Set.of("Q"), Set.of("Q"), Set.of(), List.of());
        assertCode("MISSING_REFERENCE", () -> compiler.compile(List.of(missing)));
        var cycle = unit("cycle", graph("Q", "A", "A", "Q"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        assertCode("ATOMIC_CYCLE", () -> compiler.compile(List.of(cycle)));
        var a = unit("a", Map.of(), Set.of(), Set.of(), Set.of(), List.of(new LearningUnitDefinition.ContractRef("b", "1")));
        var b = unit("b", Map.of(), Set.of(), Set.of(), Set.of(), List.of(a.ref()));
        assertCode("UNIT_CYCLE", () -> compiler.compile(List.of(a, b)));
    }

    @Test
    void ordinaryExplicitChangesAndProtectedCorrectionsInvalidateCacheCorrectly() {
        var unit = unit("unit", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var compiled = compiler.compile(List.of(unit));
        var cache = new LearningUnitRecognitionCache(2);
        assertThat(cache.evaluate("one", compiled, Set.of("Q")).recognizedGoalIds()).containsExactly("A");
        assertThat(cache.evaluate("one", compiled, Set.of("Q", "A")).recognizedGoalIds()).isEmpty();
        assertThat(cache.evaluate("one", compiled, Set.of("A")).effectiveMasteryGoalIds()).containsExactly("A");
        assertThat(cache.evaluate("one", compiled, Set.of()).recognizedGoalIds()).isEmpty();
        cache.evaluate("two", compiled, Set.of());
        cache.evaluate("three", compiled, Set.of("Q"));
        assertThat(cache.size()).isEqualTo(2);
        assertThat(cache.evaluate("one", compiled, Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test
    void archivedMeaningCannotBeBroadenedByReusingAnAssessmentId() {
        var old = unit("old", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var broader = unit("new", graph("Q", "A", "Q", "B"), Set.of("Q", "A", "B"), Set.of("Q"), Set.of(), List.of());
        assertCode("ASSESSMENT_MEANING_CONFLICT", () -> compiler.compile(List.of(old, broader)));
    }

    @Test
    void contractsRoundTripAndRemainImmutableAfterInputMutation() throws Exception {
        var unit = unit("unit", graph("Q", "A"), Set.of("Q", "A"), Set.of("Q"), Set.of(), List.of());
        var mapper = new ObjectMapper();
        assertThat(mapper.readValue(mapper.writeValueAsBytes(unit), LearningUnitDefinition.class)).isEqualTo(unit);
        var compiled = compiler.compile(List.of(unit));
        var result = evaluator.evaluate(compiled, Set.of("Q"));
        assertThatThrownBy(() -> result.recognizedGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> unit.atomicPrerequisites().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThat(compiled.digest()).hasSize(64);
    }

    @Test
    void boundedRandomDagResultsMatchIndependentSetReachability() {
        Random random = new Random(20261105);
        for (int attempt = 0; attempt < 80; attempt++) {
            Map<String, List<String>> graph = new LinkedHashMap<>();
            int count = 4 + random.nextInt(32);
            for (int i = 0; i < count; i++) {
                List<String> edges = new ArrayList<>();
                for (int j = i + 1; j < count; j++) if (random.nextDouble() < .18) edges.add("n" + j);
                graph.put("n" + i, edges);
            }
            graph.put("Q", new ArrayList<>(graph.keySet()));
            graph.put("K", List.of("n" + random.nextInt(count)));
            var unit = unit("random", graph, graph.keySet(), Set.of("Q"), Set.of("K"), List.of());
            var compiled = compiler.compile(List.of(unit));
            for (int trial = 0; trial < 12; trial++) {
                Set<String> explicit = new HashSet<>();
                graph.keySet().forEach(id -> { if (random.nextBoolean()) explicit.add(id); });
                Set<String> needed = new HashSet<>();
                ArrayDeque<String> queue = new ArrayDeque<>();
                for (String id : List.of("Q", "K")) if (!explicit.contains(id)) queue.add(id);
                while (!queue.isEmpty()) {
                    String id = queue.removeFirst();
                    if (needed.add(id)) queue.addAll(graph.get(id));
                }
                Set<String> expected = new HashSet<>(graph.keySet());
                expected.removeAll(Set.of("Q", "K"));
                expected.removeAll(explicit);
                expected.removeAll(needed);
                assertThat(evaluator.evaluate(compiled, explicit).recognizedGoalIds()).isEqualTo(expected);
            }
        }
    }

    private static Map<String, List<String>> graph(String... pairs) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        for (int i = 0; i < pairs.length; i += 2) {
            result.computeIfAbsent(pairs[i], ignored -> new ArrayList<>()).add(pairs[i + 1]);
            result.computeIfAbsent(pairs[i + 1], ignored -> new ArrayList<>());
        }
        return result;
    }

    private static LearningUnitDefinition unit(String id, Map<String, List<String>> graph, Set<String> own,
            Set<String> assessments, Set<String> recall, List<LearningUnitDefinition.ContractRef> children) {
        Map<String, LearningUnitDefinition.AssessmentClaim> claims = new LinkedHashMap<>();
        for (String q : assessments) {
            Set<String> covered = new LinkedHashSet<>();
            ArrayDeque<String> pending = new ArrayDeque<>(graph.getOrDefault(q, List.of()));
            while (!pending.isEmpty()) {
                String next = pending.removeFirst();
                if (covered.add(next)) pending.addAll(graph.getOrDefault(next, List.of()));
            }
            covered.removeAll(assessments);
            covered.removeAll(recall);
            claims.put(q, new LearningUnitDefinition.AssessmentClaim(new ArrayList<>(new java.util.TreeSet<>(covered)), "task-" + q, "rubric-" + q, "review-" + q));
        }
        Map<String, String> meanings = new HashMap<>();
        Map<String, LearningUnitDefinition.GoalMeaning> snapshots = new HashMap<>();
        Map<String, String> kinds = new HashMap<>();
        own.forEach(goal -> {
            var meaning = new LearningUnitDefinition.GoalMeaning(goal, "Goal " + goal, null, "Can apply " + goal,
                    null, "atomic", assessments.contains(goal) ? "exam" : recall.contains(goal) ? "memory" : "tutor",
                    assessments.contains(goal) ? "practiceAssessment" : recall.contains(goal) ? "memory" : "curricularAtomic");
            snapshots.put(goal, meaning);
            kinds.put(goal, assessments.contains(goal) ? "assessment" : recall.contains(goal) ? "memory" : "ordinary");
            meanings.put(goal, LearningUnitSourceBindings.canonicalDigest(meaning));
        });
        return new LearningUnitDefinition(1, LearningUnitDefinition.SEMANTICS, id, "1",
                new LearningUnitDefinition.SourceBinding("math", "unit-" + id, "placements-1", Map.of()),
                Map.of("de", "Unit " + id, "en", "Unit " + id),
                Map.of("de", "Learner can apply " + id, "en", "Learner can apply " + id),
                Map.of("de", "This unit matters because " + id, "en", "This unit matters because " + id),
                new ArrayList<>(new java.util.TreeSet<>(own)), children,
                new ArrayList<>(new java.util.TreeSet<>(assessments)), new ArrayList<>(new java.util.TreeSet<>(recall)),
                List.of(), snapshots, kinds, meanings, graph, claims, "independent-review-1");
    }

    private static void assertCode(String code, Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(CompletionCompilationException.class,
                error -> assertThat(error.code()).isEqualTo(code));
    }
}
