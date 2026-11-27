package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class LearnerScopeParityTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Path GYMNASIUM = Path.of("../curricula/DE/Gymnasium");

    @Test
    void everyExistingViewKeepsItsReviewedLearnerScope() throws Exception {
        // Per-view projectionSha256 values from VR1's independently captured baseline and candidate
        // (both bound by reader-boundaries-20261127.json, SHA-256 c3f80026… for each full report).
        var expected = JSON.readValue(getClass().getResource("/learner-scope/vr1-current-view-scopes.json"),
                new TypeReference<Map<String, String>>() {});
        Map<String, SkillLandscape> byId = new LinkedHashMap<>();
        try (var files = Files.list(GYMNASIUM.resolve("canonical"))) {
            for (var file : files.filter(path -> path.toString().endsWith(".json")).sorted().toList()) {
                var landscape = JSON.readValue(file.toFile(), SkillLandscape.class);
                byId.put(landscape.getLandscapeId(), landscape);
            }
        }
        assertThat(byId).hasSize(21);
        assertThat(expected).hasSize(387);
        var catalog = new ArrayList<>(byId.values());
        var decks = new LearnerDeckParity();
        Map<String, String> actual = new HashMap<>();
        try (var files = Files.walk(GYMNASIUM.resolve("composition-views"))) {
            for (var file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                var view = JSON.readValue(file.toFile(), new TypeReference<Map<String, Object>>() {});
                String viewId = (String) view.get("viewId");
                String subject = (String) view.get("landscapeId");
                // Supply this exact view, including standalone GK views that the profile reader can merge
                // into an LK view. This exercises the learner scope for every authored root separately.
                var views = mock(CompositionViewService.class);
                when(views.isAuthoritativeForLandscape(subject)).thenReturn(true);
                when(views.findLearnerScopeView(eq(subject), anyMap())).thenReturn(view);
                var service = LearnerProjectionTestFixture.service(byId.get(subject), catalog, views);
                String previous = actual.put(viewId, digest(service, subject, viewId, decks));
                assertThat(previous).as("duplicate view %s", viewId).isNull();
            }
        }
        assertThat(actual).containsExactlyInAnyOrderEntriesOf(expected);
        decks.report();
    }

    // Use the same canonical field order and ID sorting as the VR1 measurement. The digest covers
    // membership and required-by paths, so replacing an atom with another of equal count is detected.
    private static String digest(LearnerService service, String subject, String viewId, LearnerDeckParity decks)
            throws Exception {
        String selection = LearnerProjectionTestFixture.personalCurriculum(subject);
        var publicAtoms = service.getFilteredAtomicGoalIds(subject, selection, null, false);
        Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", subject, selection);
        decks.check(viewId, service, ReflectionTestUtils.invokeMethod(projection, "visibleGoals"));
        Map<String, Object> snapshot = new TreeMap<>();
        snapshot.put("publicAtomicGoalIds", sorted(publicAtoms));
        for (var field : List.of("targetGoalIds", "prerequisiteOnlyGoalIds", "compositionViewIds", "presentationRootGoalIds")) {
            snapshot.put(field, sorted(ReflectionTestUtils.invokeMethod(projection, field)));
        }
        for (var field : List.of("visibleGoals", "structuralGoals", "canonicalPrerequisiteGoals")) {
            Map<?, ?> goals = ReflectionTestUtils.invokeMethod(projection, field);
            snapshot.put(field, sorted(goals.keySet()));
        }
        Boolean applied = ReflectionTestUtils.invokeMethod(projection, "compositionViewApplied");
        assertThat(applied).as("composition view applied in %s", subject).isTrue();
        snapshot.put("compositionViewApplied", applied);
        Object learning = ReflectionTestUtils.invokeMethod(projection, "learningScope");
        snapshot.put("hasLearningScope", learning != null);
        if (learning != null) {
            for (var field : List.of("seedAtomicGoalIds", "learningAtomicGoalIds")) {
                snapshot.put(field, sorted(ReflectionTestUtils.invokeMethod(learning, field)));
            }
            Map<String, List<String>> paths = ReflectionTestUtils.invokeMethod(learning, "requiredByPaths");
            snapshot.put("requiredByPaths", new TreeMap<>(paths));
        }
        return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(JSON.writeValueAsBytes(snapshot)));
    }

    private static List<String> sorted(Collection<?> ids) {
        return ids.stream().map(Object::toString).sorted().toList();
    }
}
