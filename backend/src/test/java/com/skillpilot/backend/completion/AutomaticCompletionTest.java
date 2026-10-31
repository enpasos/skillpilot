package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

class AutomaticCompletionTest {
    private final CompletionProfileCompiler compiler = new CompletionProfileCompiler();
    private final CompletionEvaluator evaluator = new CompletionEvaluator();

    @Test void masteredIntermediateStopsDemandFromAnOpenAssessment() {
        var graph = graph(atom("a"), atom("b", "a"), exam("c", "b"));
        var compiled = compile(graph);
        assertThat(compiled.directPrerequisites("c")).containsExactly("b");
        var result = evaluator.evaluateAutomatic(compiled, Set.of("b"));
        assertThat(result.waivedGoalIds()).containsExactly("a");
        assertThat(result.pendingTargetGoalIds()).containsExactly("c");
        assertThat(result.masteredGoalIds()).containsExactly("b");
        assertThat(result.complete()).isFalse();
    }

    @Test void anAdditionalDirectEdgeKeepsThePrerequisiteNecessary() {
        var result = evaluate(graph(atom("a"), atom("b", "a"), exam("c", "a", "b")), Set.of("b"));
        assertThat(result.waivedGoalIds()).isEmpty();
        assertThat(result.pendingTargetGoalIds()).containsExactly("a", "c");
        assertThat(result.blockedByGoalIds()).containsEntry("a", "c");
    }

    @Test void ordinaryTerminalGoalsOrientationAndCardsHaveNoExtraProtection() {
        var orientation = atom("orientation", "a");
        orientation.setSemanticKind("orientation");
        var cards = atom("cards", "a");
        cards.setNodeKind("memory");
        var compiled = compile(graph(atom("a"), atom("ordinary", "a"), orientation, cards, exam("exam")));
        var result = evaluator.evaluateAutomatic(compiled, Set.of());
        assertThat(compiled.protectedGoalIds()).containsExactly("exam");
        assertThat(result.waivedGoalIds()).containsExactly("a", "cards", "ordinary", "orientation");
        assertThat(result.pendingTargetGoalIds()).containsExactly("exam");
    }

    @Test void anAssessmentFreeScopeCompletesWithoutAnyStoredMastery() {
        var result = evaluate(graph(atom("a"), atom("b", "a"), atom("c", "b")), Set.of());
        assertThat(result.complete()).isTrue();
        assertThat(result.masteredGoalIds()).isEmpty();
        assertThat(result.masteredTargetCount()).isZero();
        assertThat(result.waivedTargetCount()).isEqualTo(3);
        assertThat(result.requiredAssessmentCount()).isZero();
    }

    @Test void sharedPreparationRemainsNecessaryUntilEveryActiveConsumerIsDone() {
        var graph = graph(atom("a"), exam("q", "a"), exam("r", "a"));
        assertThat(evaluate(graph, Set.of("q")).waivedGoalIds()).isEmpty();
        assertThat(evaluate(graph, Set.of("q", "r")).waivedGoalIds()).containsExactly("a");
        // Withdrawal is recalculated from the current binary snapshot.
        assertThat(evaluate(graph, Set.of("r")).pendingTargetGoalIds()).containsExactly("a", "q");
    }

    @Test void aContextAssessmentRemainsRequiredWithoutBeingATargetOrHavingAConsumer() {
        var graph = graph(atom("a"), exam("hidden", "a"), atom("target", "hidden"), exam("outside"));
        var compiled = compiler.compileAutomatic(graph, Set.of("target"), Set.of("target"), "generation");
        assertThat(compiled.contextGoalIds()).containsExactly("a", "hidden", "target");
        assertThat(compiled.assessmentGoalIds()).containsExactly("hidden");
        var result = evaluator.evaluateAutomatic(compiled, Set.of());
        assertThat(result.waivedGoalIds()).containsExactly("target");
        assertThat(result.pendingTargetGoalIds()).isEmpty();
        assertThat(result.complete()).isFalse();
        assertThat(result.requiredAssessmentCount()).isEqualTo(1);
    }

    @Test void inheritedAndClusterRequirementsAreExpandedIntoDirectAtomicEdges() {
        var parentOne = atom("parent-one", "required-cluster");
        parentOne.setContains(List.of("exam"));
        var parentTwo = atom("parent-two", "other");
        parentTwo.setContains(List.of("exam"));
        var required = atom("required-cluster");
        required.setContains(List.of("a", "b"));
        var graph = graph(parentOne, parentTwo, required, atom("a"), atom("b"), atom("other"), exam("exam"));
        var compiled = compiler.compileAutomatic(graph, Set.of("exam"), Set.of("exam"), "generation");
        assertThat(compiled.directPrerequisites("exam")).containsExactly("a", "b", "other");
        assertThat(evaluator.evaluateAutomatic(compiled, Set.of()).waivedGoalIds()).isEmpty();
        assertThat(evaluator.evaluateAutomatic(compiled, Set.of("exam")).waivedGoalIds())
                .containsExactly("a", "b", "other");
    }

    @Test void implicitReasonsNeverInventAssessmentEvidenceForOrdinaryMastery() {
        var result = evaluate(graph(atom("a"), atom("b", "a"), exam("c", "b")), Set.of("b"));
        assertThat(result.waiverReasons()).containsOnlyKeys("a");
        assertThat(result.waiverReasons().get("a").ruleId()).isEqualTo("no_remaining_demand");
        assertThat(result.waiverReasons().get("a").assessmentGoalIds()).isEmpty();
        assertThat(result.masteredAssessmentGoalIds()).isEmpty();
    }

    @Test void existingScopeMetadataDispatchesAutomaticSemanticsWithoutAReview() {
        var definition = new CompletionProfileDefinition(1, "automatic-scope", "generation",
                Map.of("de", "Abschnitt", "en", "Section"), "scope", Map.of(), List.of("a"), null, List.of());
        var graph = graph(atom("a"));
        var compiled = compiler.compileAutomaticProfile(definition, graph, Set.of("a"), Set.of("a"), "generation");
        assertThat(compiled.automatic()).isTrue();
        assertThat(compiled.profile()).isSameAs(definition);
        assertThat(evaluator.evaluate(compiled, Set.of()).waivedGoalIds()).containsExactly("a");
    }

    @Test void invalidGenerationReferencesAndCyclesStillFailClosed() {
        assertFailure("INVALID_GENERATION", () -> compiler.compileAutomatic(graph(atom("a")), Set.of("a"), Set.of("a"), ""));
        assertFailure("MISSING_REFERENCE", () -> compile(graph(atom("a", "missing"))));
        assertFailure("REQUIRES_CYCLE", () -> compile(graph(atom("a", "b"), atom("b", "a"))));
        assertFailure("FOREIGN_TARGET", () -> compiler.compileAutomatic(graph(atom("a")), Set.of("a"), Set.of(), "generation"));
        var cluster = atom("cluster");
        cluster.setContains(List.of("a"));
        assertFailure("ATOMIC_CYCLE", () -> compiler.compileAutomatic(graph(cluster, atom("a", "cluster")),
                Set.of("a"), Set.of("a"), "generation"));
    }

    @Test void compiledContextsAndResultsDoNotRetainMutableAuthoredOrLearnerState() {
        var graph = graph(atom("a"), exam("q", "a"));
        var compiled = compile(graph);
        graph.get("q").setRequires(List.of());
        graph.get("q").setNodeKind(null);
        graph.clear();
        assertThat(evaluator.evaluateAutomatic(compiled, Set.of()).pendingTargetGoalIds()).containsExactly("a", "q");
        var mastery = new HashSet<>(Set.of("q"));
        var result = evaluator.evaluateAutomatic(compiled, mastery);
        mastery.clear();
        assertThat(result.waivedGoalIds()).containsExactly("a");
        assertThatThrownBy(() -> compiled.contextGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> result.waivedGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
    }

    @Test void everySmallDagAndBinaryAssignmentMatchesTheIndependentLocalConsumerFixedPoint() {
        for (int count = 1; count <= 4; count++) {
            List<int[]> possibleEdges = new ArrayList<>();
            for (int from = 0; from < count; from++) for (int to = from + 1; to < count; to++)
                possibleEdges.add(new int[]{from, to});
            for (int edgeMask = 0; edgeMask < 1 << possibleEdges.size(); edgeMask++) {
                Map<String, LearningGoal> graph = new LinkedHashMap<>();
                for (int node = 0; node < count; node++) graph.put("v" + node, atom("v" + node));
                for (int bit = 0; bit < possibleEdges.size(); bit++) if ((edgeMask & 1 << bit) != 0) {
                    int[] edge = possibleEdges.get(bit);
                    var from = graph.get("v" + edge[0]);
                    var refs = new ArrayList<>(from.getRequires());
                    refs.add("v" + edge[1]);
                    from.setRequires(refs);
                }
                for (int assessmentMask = 0; assessmentMask < 1 << count; assessmentMask++) {
                    Set<String> assessments = new TreeSet<>();
                    for (int node = 0; node < count; node++) {
                        boolean isExam = (assessmentMask & 1 << node) != 0;
                        graph.get("v" + node).setNodeKind(isExam ? "exam" : null);
                        if (isExam) assessments.add("v" + node);
                    }
                    var compiled = compile(graph);
                    for (int masteryMask = 0; masteryMask < 1 << count; masteryMask++) {
                        Set<String> mastery = new TreeSet<>();
                        for (int node = 0; node < count; node++) if ((masteryMask & 1 << node) != 0) mastery.add("v" + node);
                        // Independent semantics: repeatedly discharge ordinary goals
                        // whose direct consumers are all already done, starting at M.
                        Set<String> done = new HashSet<>(mastery);
                        boolean changed;
                        do {
                            changed = false;
                            for (String id : graph.keySet()) {
                                if (done.contains(id) || assessments.contains(id)) continue;
                                boolean allConsumersDone = graph.values().stream()
                                        .filter(g -> g.getRequires().contains(id)).allMatch(g -> done.contains(g.getId()));
                                if (allConsumersDone) changed |= done.add(id);
                            }
                        } while (changed);
                        Set<String> expected = new TreeSet<>(done);
                        expected.removeAll(mastery);
                        var actual = evaluator.evaluateAutomatic(compiled, mastery);
                        assertThat(actual.waivedGoalIds()).isEqualTo(expected);
                        assertThat(actual.masteredTargetCount() + actual.waivedTargetCount() + actual.pendingTargetCount())
                                .isEqualTo(count);
                        assertThat(actual.complete()).isEqualTo(done.containsAll(graph.keySet()));
                    }
                }
            }
        }
    }

    private CompiledAutomaticCompletion compile(Map<String, LearningGoal> graph) {
        return compiler.compileAutomatic(graph, graph.keySet(), graph.keySet(), "generation");
    }

    private CompletionEvaluation evaluate(Map<String, LearningGoal> graph, Set<String> mastery) {
        return evaluator.evaluateAutomatic(compile(graph), mastery);
    }

    private static void assertFailure(String code, org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
        assertThatThrownBy(call).isInstanceOfSatisfying(CompletionCompilationException.class,
                failure -> assertThat(failure.code()).isEqualTo(code));
    }

    private static Map<String, LearningGoal> graph(LearningGoal... goals) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (var goal : goals) graph.put(goal.getId(), goal);
        return graph;
    }

    private static LearningGoal atom(String id, String... requires) {
        var goal = new LearningGoal();
        goal.setId(id); goal.setTitle(id); goal.setRequires(List.of(requires)); goal.setContains(List.of());
        return goal;
    }

    private static LearningGoal exam(String id, String... requires) {
        var goal = atom(id, requires); goal.setNodeKind("exam"); return goal;
    }
}
