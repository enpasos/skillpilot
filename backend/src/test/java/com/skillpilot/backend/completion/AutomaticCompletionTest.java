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
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;

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

    @Test void memoryGoalsAreProtectedWithoutAlsoProtectingOrientationOrOrdinaryGoals() {
        var orientation = atom("orientation", "a");
        orientation.setSemanticKind("orientation");
        var cards = atom("cards", "a");
        cards.setNodeKind("memory");
        var compiled = compile(graph(atom("a"), atom("ordinary", "a"), orientation, cards,
                exam("exam", "ordinary", "orientation")));
        var result = evaluator.evaluateAutomatic(compiled, Set.of("exam"));
        assertThat(compiled.protectedGoalIds()).containsExactly("cards", "exam");
        assertThat(compiled.assessmentGoalIds()).containsExactly("exam");
        assertThat(result.waivedGoalIds()).containsExactly("ordinary", "orientation");
        assertThat(result.pendingTargetGoalIds()).containsExactly("a", "cards");
        assertThat(result.blockedByGoalIds()).containsExactlyEntriesOf(Map.of("a", "cards"));
    }

    @ParameterizedTest
    @MethodSource("memoryEncodings")
    void everySupportedMemoryEncodingRetainsItsPreparationUntilExplicitlyMastered(Consumer<LearningGoal> encode) {
        var cards = atom("cards", "preparation");
        encode.accept(cards);
        var compiled = compile(graph(cards, atom("preparation")));
        var open = evaluator.evaluateAutomatic(compiled, Set.of());
        assertThat(compiled.protectedGoalIds()).containsExactly("cards");
        assertThat(compiled.assessmentGoalIds()).isEmpty();
        assertThat(open.waivedGoalIds()).isEmpty();
        assertThat(open.pendingTargetGoalIds()).containsExactly("cards", "preparation");
        assertThat(open.complete()).isFalse();
        assertThat(open.requiredAssessmentCount()).isZero();

        var mastered = evaluator.evaluateAutomatic(compiled, Set.of("cards"));
        assertThat(mastered.waivedGoalIds()).containsExactly("preparation");
        assertThat(mastered.masteredGoalIds()).containsExactly("cards");
        assertThat(mastered.masteredAssessmentGoalIds()).isEmpty();
        assertThat(mastered.complete()).isTrue();
        assertThat(evaluator.evaluateAutomatic(compiled, Set.of()).waivedGoalIds()).isEmpty();
    }

    static java.util.stream.Stream<Consumer<LearningGoal>> memoryEncodings() {
        return java.util.stream.Stream.of(
                goal -> goal.setNodeKind("memory"),
                goal -> goal.setSemanticKind("memory"),
                goal -> goal.setSemanticKind("memorization"),
                goal -> goal.setExtendedData(Map.of("vocabularySource", "deck.json")),
                goal -> goal.setTags(List.of("srs-deck:example")),
                goal -> goal.setTags(List.of("memorization")));
    }

    @Test void masteringAnExamDoesNotWaiveMemoryOrItsSharedPreparation() {
        var compiled = compile(graph(atom("preparation"), memory("cards", "preparation"),
                exam("exam", "cards", "preparation")));
        var result = evaluator.evaluateAutomatic(compiled, Set.of("exam"));
        assertThat(result.masteredAssessmentCount()).isEqualTo(1);
        assertThat(result.waivedGoalIds()).isEmpty();
        assertThat(result.pendingTargetGoalIds()).containsExactly("cards", "preparation");
        assertThat(result.complete()).isFalse();
        assertThat(evaluator.evaluateAutomatic(compiled, Set.of("cards", "exam")).waivedGoalIds())
                .containsExactly("preparation");
    }

    @ParameterizedTest
    @ValueSource(strings = {"memory", "exam"})
    void protectedSupportOnlyRetainsDemandWhileReachedFromAnOpenSelectedTarget(String kind) {
        var hidden = atom("hidden", "preparation");
        hidden.setNodeKind(kind);
        var graph = graph(atom("preparation"), hidden, exam("target", "hidden"),
                memory("outside"));
        var compiled = compiler.compileAutomatic(graph, Set.of("target"), Set.of("target"), "generation");
        assertThat(compiled.contextGoalIds()).containsExactly("hidden", "preparation", "target");
        assertThat(compiled.protectedGoalIds()).containsExactly("hidden", "target");
        assertThat(compiled.protectedTargetGoalIds()).containsExactly("target");
        assertThat(compiled.assessmentGoalIds()).containsExactly("target");
        assertThat(AutomaticCompletionIntegrity.uncoveredTargets(compiled)).isEmpty();
        var open = evaluator.evaluateAutomatic(compiled, Set.of());
        assertThat(open.pendingTargetGoalIds()).containsExactly("target");
        assertThat(open.waivedGoalIds()).isEmpty();
        assertThat(open.blockedByGoalIds()).containsEntry("preparation", "target");
        assertThat(open.complete()).isFalse();
        var result = evaluator.evaluateAutomatic(compiled, Set.of("target"));
        assertThat(result.pendingTargetGoalIds()).isEmpty();
        assertThat(result.waivedGoalIds()).containsExactly("preparation");
        assertThat(result.masteredGoalIds()).containsExactly("target");
        assertThat(result.waiverReasons()).doesNotContainKey("hidden");
        assertThat(result.complete()).isTrue();
        assertThat(result.requiredAssessmentCount()).isEqualTo(1);

        // Selection, rather than context classification, makes the same hidden
        // goal an independent obligation. Its explicit result is then required.
        var selected = compiler.compileAutomatic(graph, Set.of("hidden", "target"),
                Set.of("hidden", "target"), "generation");
        var selectedOpen = evaluator.evaluateAutomatic(selected, Set.of("target"));
        assertThat(selectedOpen.pendingTargetGoalIds()).containsExactly("hidden");
        assertThat(selectedOpen.waivedGoalIds()).isEmpty();
        assertThat(selectedOpen.complete()).isFalse();
        assertThat(selectedOpen.requiredAssessmentCount()).isEqualTo("exam".equals(kind) ? 2 : 1);
        assertThat(evaluator.evaluateAutomatic(selected, Set.of("hidden", "target")).complete()).isTrue();
    }

    @Test void masteredIntermediateStopsDemandFromOpenMemoryWithoutWaivingMemory() {
        var result = evaluate(graph(atom("a"), atom("b", "a"), memory("cards", "b")), Set.of("b"));
        assertThat(result.waivedGoalIds()).containsExactly("a");
        assertThat(result.pendingTargetGoalIds()).containsExactly("cards");
        assertThat(result.complete()).isFalse();
    }

    @Test void automaticScopeMetadataPreservesMemoryProtectionAndExcludesItFromExamCounts() {
        var definition = new CompletionProfileDefinition(1, "automatic-scope", "generation",
                Map.of("de", "Abschnitt", "en", "Section"), "scope", Map.of(), List.of(), null, List.of());
        var graph = graph(atom("preparation"), memory("cards", "preparation"));
        var compiled = compiler.compileAutomaticProfile(definition, graph, Set.of("cards"), Set.of("cards"), "generation");
        assertThat(evaluator.evaluate(compiled, Set.of()).complete()).isFalse();
        assertThat(evaluator.evaluate(compiled, Set.of()).waivedGoalIds()).isEmpty();
        assertThat(evaluator.evaluate(compiled, Set.of("cards")).complete()).isTrue();
        assertThat(evaluator.evaluate(compiled, Set.of("cards")).masteredAssessmentGoalIds()).isEmpty();
    }

    @Test void ordinaryOrphanTargetsCannotBecomeImplicitThroughAnAuthoringDefect() {
        var compiled = compile(graph(atom("a"), atom("b", "a"), atom("c", "b")));
        assertThat(AutomaticCompletionIntegrity.uncoveredTargets(compiled)).containsExactlyInAnyOrder("a", "b", "c");
        assertFailure("UNCOVERED_COMPLETION_TARGETS", () -> evaluator.evaluateAutomatic(compiled, Set.of()));
        assertFailure("UNCOVERED_COMPLETION_TARGETS", () -> evaluator.evaluateAutomatic(compiled, Set.of("b", "c")));
        var explicit = evaluator.evaluateAutomatic(compiled, Set.of("a", "b", "c"));
        assertThat(explicit.complete()).isTrue();
        assertThat(explicit.masteredTargetCount()).isEqualTo(3);
        assertThat(explicit.waivedGoalIds()).isEmpty();
        assertThat(explicit.requiredAssessmentCount()).isZero();
        // Explicit results do not change the strict static authoring diagnosis.
        assertThat(AutomaticCompletionIntegrity.uncoveredTargets(compiled)).hasSize(3);
    }

    @Test void sharedPreparationRemainsNecessaryUntilEveryActiveConsumerIsDone() {
        var graph = graph(atom("a"), exam("q", "a"), exam("r", "a"));
        assertThat(evaluate(graph, Set.of("q")).waivedGoalIds()).isEmpty();
        assertThat(evaluate(graph, Set.of("q", "r")).waivedGoalIds()).containsExactly("a");
        // Withdrawal is recalculated from the current binary snapshot.
        assertThat(evaluate(graph, Set.of("r")).pendingTargetGoalIds()).containsExactly("a", "q");
    }

    @Test void aHiddenAssessmentDoesNotRepairAnOrdinaryTargetWithoutASelectedProtectedRoot() {
        var graph = graph(atom("a"), exam("hidden", "a"), atom("target", "hidden"), exam("outside"));
        var compiled = compiler.compileAutomatic(graph, Set.of("target"), Set.of("target"), "generation");
        assertThat(compiled.contextGoalIds()).containsExactly("a", "hidden", "target");
        assertThat(compiled.assessmentGoalIds()).isEmpty();
        assertThat(compiled.protectedGoalIds()).containsExactly("hidden");
        assertThat(compiled.protectedTargetGoalIds()).isEmpty();
        assertThat(AutomaticCompletionIntegrity.uncoveredTargets(compiled)).containsExactly("target");
        assertFailure("UNCOVERED_COMPLETION_TARGETS", () -> evaluator.evaluateAutomatic(compiled, Set.of()));
        var result = evaluator.evaluateAutomatic(compiled, Set.of("target"));
        assertThat(result.masteredGoalIds()).containsExactly("target");
        assertThat(result.waivedGoalIds()).isEmpty();
        assertThat(result.pendingTargetGoalIds()).isEmpty();
        assertThat(result.complete()).isTrue();
        assertThat(result.requiredAssessmentCount()).isZero();
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
        var graph = graph(atom("a"), exam("q", "a"));
        var compiled = compiler.compileAutomaticProfile(definition, graph, graph.keySet(), graph.keySet(), "generation");
        assertThat(compiled.automatic()).isTrue();
        assertThat(compiled.profile()).isSameAs(definition);
        assertThat(evaluator.evaluate(compiled, Set.of("q")).waivedGoalIds()).containsExactly("a");
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

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void everySmallDagAndBinaryAssignmentMatchesTheIndependentLocalConsumerFixedPoint(boolean includeMemory) {
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
                for (int protectedMask = 0; protectedMask < 1 << count; protectedMask++) {
                    Set<String> protectedGoals = new TreeSet<>();
                    for (int node = 0; node < count; node++) {
                        boolean isProtected = (protectedMask & 1 << node) != 0;
                        String kind = includeMemory && node % 2 == 0 ? "memory" : "exam";
                        graph.get("v" + node).setNodeKind(isProtected ? kind : null);
                        if (isProtected) protectedGoals.add("v" + node);
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
                                if (done.contains(id) || protectedGoals.contains(id)) continue;
                                boolean allConsumersDone = graph.values().stream()
                                        .filter(g -> g.getRequires().contains(id)).allMatch(g -> done.contains(g.getId()));
                                if (allConsumersDone) changed |= done.add(id);
                            }
                        } while (changed);
                        if (masteryMask == 0) {
                            assertThat(AutomaticCompletionIntegrity.uncoveredTargets(compiled))
                                    .containsExactlyInAnyOrderElementsOf(done);
                        }
                        Set<String> expected = new TreeSet<>(done);
                        expected.removeAll(mastery);
                        if (!AutomaticCompletionIntegrity.uncoveredTargets(compiled).isEmpty()
                                && !mastery.containsAll(graph.keySet())) {
                            assertFailure("UNCOVERED_COMPLETION_TARGETS", () -> evaluator.evaluateAutomatic(compiled, mastery));
                            continue;
                        }
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

    private static LearningGoal memory(String id, String... requires) {
        var goal = atom(id, requires); goal.setNodeKind("memory"); return goal;
    }
}
