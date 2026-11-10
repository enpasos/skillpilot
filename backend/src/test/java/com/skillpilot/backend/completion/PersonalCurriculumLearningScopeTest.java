package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;

class PersonalCurriculumLearningScopeTest {
    @Test
    void actualChemistryBronstedTargetIncludesSymbolsAndOrientationWithoutMutatingSources() throws Exception {
        String target = "1c1420c2-a8e2-520f-8015-6df637a973bd";
        String symbols = "e7c363d4-e02d-4895-8750-ba62c2eb63fe";
        String orientation = "a9c22adc-b543-5b0c-a2d8-3189facdff08";
        Set<String> boundedIds = Set.of(target, symbols, orientation);
        ObjectMapper mapper = new ObjectMapper();
        JsonNode document = mapper.readTree(Path.of(
                "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json").toFile());
        Map<String, LearningGoal> canonical = new LinkedHashMap<>();
        for (JsonNode node : document.path("goals")) {
            if (boundedIds.contains(node.path("id").asText())) {
                LearningGoal goal = mapper.treeToValue(node, LearningGoal.class);
                canonical.put(goal.getId(), goal);
            }
        }
        assertThat(canonical).containsOnlyKeys(target, symbols, orientation);
        assertThat(canonical.get(target).getRequires()).containsExactly(symbols, orientation);
        assertThat(canonical.get(symbols).getRequires()).isEmpty();
        assertThat(canonical.get(orientation).getRequires()).isEmpty();
        JsonNode before = mapper.valueToTree(canonical);

        var scope = PersonalCurriculumLearningScope.compile(canonical, Set.of(target));

        assertThat(scope.seedAtomicGoalIds()).containsExactly(target);
        assertThat(scope.learningAtomicGoalIds()).containsExactlyInAnyOrder(target, symbols, orientation);
        assertThat(scope.requiredByPaths()).containsEntry(symbols, List.of(target, symbols))
                .containsEntry(orientation, List.of(target, orientation)).doesNotContainKey(target);
        assertThat((JsonNode) mapper.valueToTree(canonical)).isEqualTo(before);
    }

    @Test
    void inheritsAndExpandsRequiredClustersWithoutEnrollingParentsOrUnrelatedSiblings() {
        var parent = cluster("parent", List.of("seed", "unrelated"), "required-cluster");
        var required = cluster("required-cluster", List.of("foreign:b", "foreign:c"));
        var canonical = graph(parent, required, atom("seed"), atom("unrelated"),
                atom("foreign:b", "foreign:foundation"), atom("foreign:c"), atom("foreign:foundation"));

        var scope = PersonalCurriculumLearningScope.compile(canonical, Set.of("seed"));

        assertThat(scope.learningAtomicGoalIds()).containsExactly(
                "seed", "foreign:b", "foreign:c", "foreign:foundation");
        assertThat(scope.requiredByPaths()).containsEntry("foreign:b", List.of("seed", "foreign:b"))
                .containsEntry("foreign:foundation", List.of("seed", "foreign:b", "foreign:foundation"));
        assertThat(scope.learningAtomicGoalIds()).doesNotContain("parent", "required-cluster", "unrelated");
        assertThat(parent.getContains()).containsExactly("seed", "unrelated");
    }

    @Test
    void sharedDiamondUsesShortestStableWitnessAcrossAllSeedsAndInputOrders() {
        var canonical = graph(atom("seed-z", "shared"), atom("right", "tie", "shared"),
                atom("seed-a", "right", "left"), atom("left", "shared", "tie"),
                atom("shared", "foundation"), atom("tie"), atom("foundation"));
        Set<String> seeds = new LinkedHashSet<>(List.of("seed-z", "seed-a"));

        var first = PersonalCurriculumLearningScope.compile(canonical, seeds);
        assertThat(first.seedAtomicGoalIds()).containsExactly("seed-a", "seed-z");
        assertThat(first.learningAtomicGoalIds()).hasSize(7);
        assertThat(first.requiredByPaths()).containsEntry("shared", List.of("seed-z", "shared"))
                .containsEntry("tie", List.of("seed-a", "left", "tie"))
                .containsEntry("foundation", List.of("seed-z", "shared", "foundation"));

        List<LearningGoal> reversed = new ArrayList<>(canonical.values());
        Collections.reverse(reversed);
        for (LearningGoal goal : reversed) {
            var refs = new ArrayList<>(goal.getRequires());
            Collections.reverse(refs);
            goal.setRequires(refs);
        }
        var second = PersonalCurriculumLearningScope.compile(
                graph(reversed.toArray(LearningGoal[]::new)), Set.of("seed-a", "seed-z"));
        assertThat(second).isEqualTo(first);
        assertThat(new ArrayList<>(second.learningAtomicGoalIds()))
                .isEqualTo(new ArrayList<>(first.learningAtomicGoalIds()));
        assertThat(new ArrayList<>(second.requiredByPaths().keySet()))
                .isEqualTo(new ArrayList<>(first.requiredByPaths().keySet()));
    }

    @Test
    void aPrerequisiteAlreadySelectedElsewhereRemainsOneSeedAndOneLearningObligation() {
        var scope = PersonalCurriculumLearningScope.compile(
                graph(atom("physics", "math"), atom("math", "foundation"), atom("foundation")),
                Set.of("physics", "math"));

        assertThat(scope.learningAtomicGoalIds()).containsExactly("math", "physics", "foundation");
        assertThat(scope.requiredByPaths()).containsOnlyKeys("foundation")
                .containsEntry("foundation", List.of("math", "foundation"));
    }

    @Test
    void resultCollectionsAndWitnessesAreImmutableAndRetainNoMutableInputState() {
        var canonical = graph(atom("seed", "preparation"), atom("preparation"));
        var seeds = new LinkedHashSet<>(Set.of("seed"));
        var scope = PersonalCurriculumLearningScope.compile(canonical, seeds);
        seeds.clear();
        canonical.get("seed").setRequires(List.of());
        canonical.clear();

        assertThat(scope.seedAtomicGoalIds()).containsExactly("seed");
        assertThat(scope.learningAtomicGoalIds()).containsExactly("seed", "preparation");
        assertThat(scope.requiredByPaths()).containsEntry("preparation", List.of("seed", "preparation"));
        assertThatThrownBy(() -> scope.seedAtomicGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> scope.learningAtomicGoalIds().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> scope.requiredByPaths().clear()).isInstanceOf(UnsupportedOperationException.class);
        assertThatThrownBy(() -> scope.requiredByPaths().get("preparation").clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void missingEmptyOrNonAtomicSeedsFailClosed() {
        var canonical = graph(cluster("cluster", List.of("atom")), atom("atom"));
        assertFailure("EMPTY_SCOPE", () -> PersonalCurriculumLearningScope.compile(canonical, null));
        assertFailure("EMPTY_SCOPE", () -> PersonalCurriculumLearningScope.compile(canonical, Set.of()));
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(canonical, Set.of("missing")));
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(canonical, Set.of(" ")));
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(canonical,
                new LinkedHashSet<>(Arrays.asList((String) null))));
        assertFailure("TARGET_NOT_ATOMIC", () -> PersonalCurriculumLearningScope.compile(canonical, Set.of("cluster")));
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(null, Set.of("atom")));
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(Map.of(), Set.of("atom")));
    }

    @Test
    void canonicalUnknownReferencesAndRawCyclesUseExistingCompilerFailures() {
        assertFailure("MISSING_REFERENCE", () -> PersonalCurriculumLearningScope.compile(
                graph(atom("seed", "missing")), Set.of("seed")));
        assertFailure("REQUIRES_CYCLE", () -> PersonalCurriculumLearningScope.compile(
                graph(atom("seed", "other"), atom("other", "seed")), Set.of("seed")));
        assertFailure("CONTAINS_CYCLE", () -> PersonalCurriculumLearningScope.compile(
                graph(cluster("one", List.of("two")), cluster("two", List.of("one")), atom("seed")),
                Set.of("seed")));
    }

    @Test
    void onlyReachableExpandedAtomicCyclesInvalidateTheLearningContext() {
        var unrelatedCycle = graph(atom("seed", "preparation"), atom("preparation"),
                cluster("unrelated-parent", List.of("unrelated"), "unrelated"), atom("unrelated"));
        assertThat(PersonalCurriculumLearningScope.compile(unrelatedCycle, Set.of("seed"))
                .learningAtomicGoalIds()).containsExactly("seed", "preparation");
        assertFailure("ATOMIC_CYCLE", () -> PersonalCurriculumLearningScope.compile(
                graph(cluster("parent", List.of("seed"), "seed"), atom("seed")), Set.of("seed")));
    }

    @Test
    void everySmallDagAndNonemptySeedUnionMatchesIndependentTransitiveReachability() {
        for (int count = 1; count <= 4; count++) {
            List<int[]> possibleEdges = new ArrayList<>();
            for (int from = 0; from < count; from++) for (int to = from + 1; to < count; to++)
                possibleEdges.add(new int[]{from, to});
            for (int edgeMask = 0; edgeMask < 1 << possibleEdges.size(); edgeMask++) {
                Map<String, LearningGoal> canonical = new LinkedHashMap<>();
                boolean[][] reachable = new boolean[count][count];
                for (int node = 0; node < count; node++) canonical.put("v" + node, atom("v" + node));
                for (int bit = 0; bit < possibleEdges.size(); bit++) if ((edgeMask & 1 << bit) != 0) {
                    int[] edge = possibleEdges.get(bit);
                    reachable[edge[0]][edge[1]] = true;
                    var goal = canonical.get("v" + edge[0]);
                    var refs = new ArrayList<>(goal.getRequires());
                    refs.add("v" + edge[1]);
                    goal.setRequires(refs);
                }
                for (int via = 0; via < count; via++) for (int from = 0; from < count; from++)
                    for (int to = 0; to < count; to++) reachable[from][to] |= reachable[from][via] && reachable[via][to];
                for (int seedMask = 1; seedMask < 1 << count; seedMask++) {
                    Set<String> seeds = new TreeSet<>();
                    Set<String> expected = new TreeSet<>();
                    for (int seed = 0; seed < count; seed++) if ((seedMask & 1 << seed) != 0) {
                        seeds.add("v" + seed);
                        expected.add("v" + seed);
                        for (int target = 0; target < count; target++)
                            if (reachable[seed][target]) expected.add("v" + target);
                    }
                    var scope = PersonalCurriculumLearningScope.compile(canonical, seeds);
                    assertThat(scope.learningAtomicGoalIds()).isEqualTo(expected);
                    assertThat(scope.requiredByPaths().keySet()).isEqualTo(
                            expected.stream().filter(id -> !seeds.contains(id)).collect(java.util.stream.Collectors.toSet()));
                    for (var entry : scope.requiredByPaths().entrySet()) {
                        List<String> path = entry.getValue();
                        assertThat(seeds).contains(path.getFirst());
                        assertThat(path.getLast()).isEqualTo(entry.getKey());
                        for (int step = 1; step < path.size(); step++)
                            assertThat(canonical.get(path.get(step - 1)).getRequires()).contains(path.get(step));
                    }
                }
            }
        }
    }

    private static LearningGoal atom(String id, String... requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of(requires));
        return goal;
    }

    private static LearningGoal cluster(String id, List<String> children, String... requires) {
        LearningGoal goal = atom(id, requires);
        goal.setType("cluster");
        goal.setContains(children);
        return goal;
    }

    private static Map<String, LearningGoal> graph(LearningGoal... goals) {
        Map<String, LearningGoal> result = new LinkedHashMap<>();
        for (LearningGoal goal : goals) result.put(goal.getId(), goal);
        return result;
    }

    private static void assertFailure(String code, org.assertj.core.api.ThrowableAssert.ThrowingCallable call) {
        assertThatThrownBy(call).isInstanceOfSatisfying(CompletionCompilationException.class,
                failure -> assertThat(failure.code()).isEqualTo(code));
    }
}
