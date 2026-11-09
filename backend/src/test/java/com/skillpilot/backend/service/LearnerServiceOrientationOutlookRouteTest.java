// SPDX-License-Identifier: Apache-2.0
package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.springframework.context.ApplicationEventPublisher;

class LearnerServiceOrientationOutlookRouteTest {

    private final LearnerService service = new LearnerService(
            mock(LearnerRepository.class),
            mock(LearnerClientStateRepository.class),
            mock(MasteryRepository.class),
            mock(PlannedGoalRepository.class),
            mock(LandscapeService.class),
            mock(GoalMappingService.class),
            mock(DeckResourceService.class),
            new ObjectMapper(),
            mock(ApplicationEventPublisher.class));

    @Test
    void acceptsDirectAuthoredReferenceUsingTheExistingResolver() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal entry = leaf("entry", "math:orientation");

        assertThat(hasPath(entry, "orientation", entry, anchor)).isTrue();
    }

    @Test
    void acceptsMultipleAuthoredEdgesWithoutRawSemanticKindMetadata() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal bridge = leaf("bridge", "orientation");
        LearningGoal entry = leaf("entry", "bridge");

        assertThat(entry.getSemanticKind()).isNull();
        assertThat(bridge.getSemanticKind()).isNull();
        assertThat(hasPath(entry, "orientation", entry, bridge, anchor)).isTrue();
    }

    @Test
    void acceptsAValidAlternativeBesideANonLeafBranch() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal bridge = leaf("bridge", "orientation");
        LearningGoal cluster = leaf("cluster", "orientation");
        cluster.setContains(List.of("bridge"));
        LearningGoal entry = leaf("entry", "cluster", "bridge");

        assertThat(hasPath(entry, "orientation", entry, cluster, bridge, anchor)).isTrue();
    }

    @Test
    void rejectsAMissingInnerAuthoredRequirement() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal bridge = leaf("bridge");
        bridge.setRequires(null);
        LearningGoal entry = leaf("entry", "bridge");

        assertThat(hasPath(entry, "orientation", entry, bridge, anchor)).isFalse();
    }

    @Test
    void rejectsAnUnknownBridge() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal entry = leaf("entry", "unknown-bridge");

        assertThat(hasPath(entry, "orientation", entry, anchor)).isFalse();
    }

    @Test
    void rejectsAPathToADifferentExistingAnchor() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal otherAnchor = leaf("other-orientation");
        LearningGoal entry = leaf("entry", "other-orientation");

        assertThat(hasPath(entry, "orientation", entry, otherAnchor, anchor)).isFalse();
    }

    @Test
    void doesNotUseAContainsParentAsAnInheritedRequirementOrigin() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal entry = leaf("entry");
        LearningGoal parent = leaf("parent", "orientation");
        parent.setContains(List.of("entry"));

        assertThat(hasPath(entry, "orientation", entry, parent, anchor)).isFalse();
    }

    @Test
    void rejectsANonLeafBridgeEvenWithAnAuthoredAnchorRequirement() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal child = leaf("child");
        LearningGoal cluster = leaf("cluster", "orientation");
        cluster.setContains(List.of("child"));
        LearningGoal entry = leaf("entry", "cluster");

        assertThat(hasPath(entry, "orientation", entry, cluster, child, anchor)).isFalse();
    }

    @Test
    @Timeout(1)
    void rejectsACycleThatDoesNotReachTheAnchor() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal bridge = leaf("bridge", "entry");
        LearningGoal entry = leaf("entry", "bridge");

        assertThat(hasPath(entry, "orientation", entry, bridge, anchor)).isFalse();
    }

    @Test
    void sourceEqualToAnchorWithoutAnAuthoredEdgeIsNotAPath() throws Exception {
        LearningGoal anchor = leaf("orientation");

        assertThat(hasPath(anchor, "orientation", anchor)).isFalse();
    }

    @Test
    void requiresTheAnchorToExistInTheStructuralMap() throws Exception {
        LearningGoal entry = leaf("entry", "orientation");

        assertThat(hasPath(entry, "orientation", entry)).isFalse();
    }

    @Test
    void requiresTheAnchorToBeAStructuralLeaf() throws Exception {
        LearningGoal child = leaf("child");
        LearningGoal anchor = leaf("orientation");
        anchor.setContains(List.of("child"));
        LearningGoal entry = leaf("entry", "orientation");

        assertThat(hasPath(entry, "orientation", entry, anchor, child)).isFalse();
    }

    @Test
    void requiresTheSourceToBeAStructuralLeaf() throws Exception {
        LearningGoal anchor = leaf("orientation");
        LearningGoal child = leaf("child");
        LearningGoal entry = leaf("entry", "orientation");
        entry.setContains(List.of("child"));

        assertThat(hasPath(entry, "orientation", entry, child, anchor)).isFalse();
    }

    private boolean hasPath(LearningGoal source, String anchorId, LearningGoal... goals)
            throws ReflectiveOperationException {
        Map<String, LearningGoal> structuralGoals = new HashMap<>();
        for (LearningGoal goal : goals) {
            structuralGoals.put(goal.getId(), goal);
        }
        Method method = LearnerService.class.getDeclaredMethod(
                "hasAuthoredAtomicRequiresPath", LearningGoal.class, String.class, Map.class);
        method.setAccessible(true);
        return (boolean) method.invoke(service, source, anchorId, structuralGoals);
    }

    private static LearningGoal leaf(String id, String... requirements) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setContains(List.of());
        goal.setRequires(List.of(requirements));
        return goal;
    }
}
