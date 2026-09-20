package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.ResourceLoader;

/** The one exact link relocation preserves receipts, never future semantic/content edits. */
class HistoricalContentLinkBindingsTest {
    private static final String VIDEO_GOAL = "d67502e3-5e0a-595b-a24b-65b1c40de36e";
    private final ObjectMapper mapper = new ObjectMapper();
    @TempDir Path directory;
    private Path image;
    private ChampionPracticeFingerprint fingerprints;
    private JsonNode migration;
    private Map<String, JsonNode> currentGoals;

    @BeforeEach
    void setUp() throws Exception {
        try (var stream = new ClassPathResource(
                "content/migrations/physik-libre-links-2026-09-20.json").getInputStream()) {
            migration = mapper.readTree(stream);
        }
        JsonNode currentCurriculum = mapper.readTree(Path.of(
                "../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile());
        currentGoals = new LinkedHashMap<>();
        for (JsonNode goal : currentCurriculum.path("goals")) {
            currentGoals.put(goal.path("id").asText(), goal);
        }
        image = directory.resolve("current-image.jpg");
        Files.write(image, new byte[] {1, 2, 3});
        ResourceLoader resources = mock(ResourceLoader.class);
        when(resources.getResource(anyString())).thenAnswer(invocation -> {
            assertThat((String) invocation.getArgument(0)).startsWith("classpath:static/assets/");
            return new FileSystemResource(image);
        });
        fingerprints = new ChampionPracticeFingerprint(mapper, mock(DeckResourceService.class), resources);
    }

    @Test
    void allElevenExactRelocationsPreserveOriginalPracticeFingerprintsWithoutRestoringRuntimeLinks()
            throws Exception {
        assertThat(migration.path("entries")).hasSize(11);
        for (JsonNode entry : migration.path("entries")) {
            String goalId = entry.path("goalId").asText();
            LearningGoal before = currentGoal(goalId);
            before.setResourceLinks(links(entry.path("beforeResourceLinks")));
            LearningGoal after = currentGoal(goalId);
            after.setResourceLinks(links(entry.path("afterResourceLinks")));
            JsonNode runtimeLinksBeforeFingerprinting = mapper.valueToTree(after.getResourceLinks());

            String original = fingerprints.forGoal(before);
            assertThat(original).as("original fingerprint for %s", goalId).isNotNull();
            assertThat(fingerprints.forGoal(after)).as("link-only relocation for %s", goalId).isEqualTo(original);
            assertThat(mapper.<JsonNode>valueToTree(after.getResourceLinks())).isEqualTo(runtimeLinksBeforeFingerprinting);
            assertThat(mapper.writeValueAsString(after)).doesNotContain("https://physikbuch.schule/");
            assertThat(mapper.<JsonNode>valueToTree(HistoricalContentLinkBindings.forFingerprint(
                    goalId, after.getResourceLinks()))).isEqualTo(entry.path("beforeResourceLinks"));
        }
    }

    @Test
    void goalTitleDescriptionAndPrerequisiteChangesStillInvalidateHistoricalEvidence() throws Exception {
        LearningGoal originalGoal = migratedGoal(VIDEO_GOAL);
        String original = fingerprints.forGoal(originalGoal);
        assertThat(original).isNotNull();

        LearningGoal changedTitle = migratedGoal(VIDEO_GOAL);
        changedTitle.setTitle(changedTitle.getTitle() + " – fachlich geändert");
        assertThat(fingerprints.forGoal(changedTitle)).isNotNull().isNotEqualTo(original);

        LearningGoal changedDescription = migratedGoal(VIDEO_GOAL);
        changedDescription.setDescription(changedDescription.getDescription() + " Zusätzliche Kompetenz.");
        assertThat(fingerprints.forGoal(changedDescription)).isNotNull().isNotEqualTo(original);

        LearningGoal changedPrerequisite = migratedGoal(VIDEO_GOAL);
        List<String> requires = new ArrayList<>(changedPrerequisite.getRequires() == null
                ? List.of() : changedPrerequisite.getRequires());
        requires.add("new-didactic-prerequisite");
        changedPrerequisite.setRequires(requires);
        assertThat(fingerprints.forGoal(changedPrerequisite)).isNotNull().isNotEqualTo(original);
    }

    @Test
    void liveImageBytesStillInvalidateHistoricalEvidenceAfterLinkRelocation() throws Exception {
        LearningGoal goal = migratedGoal(VIDEO_GOAL);
        String original = fingerprints.forGoal(goal);
        assertThat(original).isNotNull();
        Files.write(image, new byte[] {7, 8, 9, 10});
        assertThat(fingerprints.forGoal(goal)).isNotNull().isNotEqualTo(original);
        assertThat(mapper.<JsonNode>valueToTree(HistoricalContentLinkBindings.forFingerprint(
                VIDEO_GOAL, goal.getResourceLinks()))).isEqualTo(binding(VIDEO_GOAL).path("beforeResourceLinks"));
    }

    @Test
    void changedImageBindingsAndUnknownGoalsCannotUseTheExactCompatibilityMapping() throws Exception {
        LearningGoal goal = migratedGoal(VIDEO_GOAL);
        String original = fingerprints.forGoal(goal);
        List<Map<String, Object>> changedLinks = new ArrayList<>();
        for (Map<String, Object> link : goal.getResourceLinks()) {
            Map<String, Object> changed = new LinkedHashMap<>(link);
            if ("goal-visualization".equals(changed.get("type"))) {
                changed.put("url", "/assets/goal-visualizations/replacement.jpg");
            }
            changedLinks.add(changed);
        }
        goal.setResourceLinks(changedLinks);
        assertThat(HistoricalContentLinkBindings.forFingerprint(VIDEO_GOAL, changedLinks)).isEqualTo(changedLinks);
        assertThat(fingerprints.forGoal(goal)).isNotNull().isNotEqualTo(original);
        List<Map<String, Object>> exactAfter = links(binding(VIDEO_GOAL).path("afterResourceLinks"));
        assertThat(HistoricalContentLinkBindings.forFingerprint("different-goal", exactAfter))
                .isEqualTo(exactAfter);
        assertThat(HistoricalContentLinkBindings.forFingerprint(VIDEO_GOAL, List.of())).isEmpty();
    }

    private LearningGoal currentGoal(String goalId) throws Exception {
        assertThat(currentGoals).containsKey(goalId);
        return mapper.treeToValue(currentGoals.get(goalId), LearningGoal.class);
    }

    private LearningGoal migratedGoal(String goalId) throws Exception {
        LearningGoal goal = currentGoal(goalId);
        goal.setResourceLinks(links(binding(goalId).path("afterResourceLinks")));
        return goal;
    }

    private JsonNode binding(String goalId) {
        for (JsonNode entry : migration.path("entries")) {
            if (goalId.equals(entry.path("goalId").asText())) return entry;
        }
        throw new AssertionError("Missing migration binding: " + goalId);
    }

    private List<Map<String, Object>> links(JsonNode node) {
        return mapper.convertValue(node, new TypeReference<>() {});
    }
}
