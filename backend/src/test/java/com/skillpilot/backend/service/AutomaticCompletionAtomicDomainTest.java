package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.completion.PersonalCurriculumLearningScope;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AutomaticCompletionAtomicDomainTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private final LearnerService service = new LearnerService(
            null, null, null, null, null, null, null, mapper, null);

    @Test
    void aDisplayPrunedUnitCannotAddAnUnknownCompletionObligation() throws Exception {
        LearningGoal foundation = goal("foundation", "atomic");
        LearningGoal target = goal("target", "atomic");
        target.setRequires(List.of("foundation"));
        Map<String, LearningGoal> canonical = Map.of("foundation", foundation, "target", target);
        PersonalCurriculumLearningScope learning = PersonalCurriculumLearningScope.compile(
                canonical, Set.of("target"));
        LearningGoal structuralUnit = goal("composition:fixture:structure:year", "cluster", "target");
        LearningGoal visibleUnit = goal(structuralUnit.getId(), "cluster");
        Map<String, LearningGoal> structural = new LinkedHashMap<>(canonical);
        structural.put(structuralUnit.getId(), structuralUnit);
        Map<String, LearningGoal> visible = new LinkedHashMap<>(canonical);
        visible.put(visibleUnit.getId(), visibleUnit);
        Object projection = projection(visible, structural, learning, canonical);

        Set<String> all = completionTargets("automatic:personal-curriculum", projection);
        assertThat(all).containsExactlyInAnyOrder("foundation", "target");
        new CompletionProfileCompiler().normalizePrerequisites(canonical).validateContext(all);
        assertThat(completionTargets("automatic:target", projection)).containsExactly("target");
        assertThat(visibleUnit.getType()).isEqualTo("cluster");
        assertThat(structuralUnit.getContains()).containsExactly("target");
    }

    @Test
    void legacyCompletionKeepsUntypedLeavesButExcludesExplicitEmptyClusters() throws Exception {
        Map<String, LearningGoal> visible = Map.of(
                "legacy", goal("legacy", null), "unit", goal("unit", "cluster"));
        Object projection = projection(visible, visible, null, Map.of());

        assertThat(completionTargets("automatic:personal-curriculum", projection))
                .containsExactly("legacy");
        assertThat(completionTargets("automatic:unit", projection)).isEmpty();
    }

    @Test
    void pruningACanonicalClusterDoesNotAuthorizeAnAtomicOverride() throws Exception {
        LearningGoal target = goal("target", "atomic");
        LearningGoal cluster = goal("topic", "cluster", "target");
        Map<String, LearningGoal> canonical = Map.of("topic", cluster, "target", target);
        Map<String, LearningGoal> visible = Map.of("topic", goal("topic", "cluster"), "target", target);
        Object projection = projection(visible, canonical, null, Map.of());

        Map<String, LearningGoal> resolved = ReflectionTestUtils.invokeMethod(
                service, "applyAuthoredAtomicEntries", canonical, projection);
        assertThat(resolved.get("topic").getType()).isEqualTo("cluster");
        assertThat(resolved.get("topic").getContains()).containsExactly("target");
    }

    @Test
    void anExplicitAtomicEntryStillUsesTheReviewedCompatibilityPath() throws Exception {
        Map<String, LearningGoal> canonical = Map.of(
                "topic", goal("topic", "cluster", "target"), "target", goal("target", "atomic"));
        Map<String, LearningGoal> visible = Map.of("topic", goal("topic", "atomic"));
        Object projection = projection(visible, canonical, null, Map.of());

        Map<String, LearningGoal> resolved = ReflectionTestUtils.invokeMethod(
                service, "applyAuthoredAtomicEntries", canonical, projection);
        assertThat(resolved.get("topic").getType()).isEqualTo("atomic");
        assertThat(resolved.get("topic").getContains()).isEmpty();
        assertThat(canonical.get("topic").getContains()).containsExactly("target");
    }

    @Test
    void completedWorkDoesNotInventCompletionForNullOrEmptyNavigation() {
        LearningGoal waived = goal("waived", "atomic");
        LearningGoal nullNavigation = goal("null-navigation", "cluster");
        nullNavigation.setContains(null);
        LearningGoal emptyNavigation = goal("empty-navigation", "cluster");
        LearningGoal realParent = goal("real-parent", "cluster", "waived");
        LearningGoal navigationParent = goal("navigation-parent", "cluster",
                "waived", "null-navigation", "empty-navigation");
        Map<String, LearningGoal> goals = Map.of(
                waived.getId(), waived, nullNavigation.getId(), nullNavigation,
                emptyNavigation.getId(), emptyNavigation, realParent.getId(), realParent,
                navigationParent.getId(), navigationParent);

        Set<String> completed = ReflectionTestUtils.invokeMethod(service, "completedFrontierWork",
                goals, Map.of(), Set.of("waived"));

        assertThat(completed).containsExactlyInAnyOrder("waived", "real-parent");
        assertThat(nullNavigation.getContains()).isNull();
        assertThat(emptyNavigation.getContains()).isEmpty();
    }

    private Set<String> completionTargets(String id, Object projection) {
        return ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", id, projection);
    }

    private Object projection(Map<String, LearningGoal> visible, Map<String, LearningGoal> structural,
            PersonalCurriculumLearningScope learning, Map<String, LearningGoal> canonical) throws Exception {
        return LearnerProjectionTestFixture.projection(visible, visible.keySet(), Set.of(), structural,
                Set.of(), List.of(), true, learning, canonical, Set.of());
    }

    private static LearningGoal goal(String id, String type, String... children) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setType(type);
        goal.setContains(List.of(children));
        goal.setRequires(List.of());
        return goal;
    }
}
