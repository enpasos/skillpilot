package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.ResourceLoader;

class ChampionPracticeFingerprintTest {
    @TempDir Path directory;

    @Test
    void changedActualImageBytesInvalidateEvidenceButCosmeticTagsDoNot() throws Exception {
        Path image = directory.resolve("image.jpg");
        Files.write(image, new byte[] {1, 2, 3});
        ResourceLoader resources = mock(ResourceLoader.class);
        when(resources.getResource("classpath:static/assets/image.jpg")).thenReturn(new FileSystemResource(image));
        var fingerprints = new ChampionPracticeFingerprint(new ObjectMapper(), mock(DeckResourceService.class), resources);
        LearningGoal goal = new LearningGoal(); goal.setId("goal"); goal.setDescription("Competence");
        goal.setResourceLinks(List.of(Map.of("type", "goal-visualization", "url", "/assets/image.jpg")));
        goal.setTags(List.of("canonical", "reviewed"));
        String original = fingerprints.forGoal(goal);
        assertThat(original).isNotNull();
        goal.setTags(List.of("different-authoring-label", "canonical"));
        assertThat(fingerprints.forGoal(goal)).isEqualTo(original);
        Files.write(image, new byte[] {1, 2, 3, 4});
        assertThat(fingerprints.forGoal(goal)).isNotEqualTo(original);
    }

    @Test
    void orientationContentAndMemorySelectionAreSemanticWhileTreeOrderIsCosmetic() {
        var fingerprints = new ChampionPracticeFingerprint(new ObjectMapper(), mock(DeckResourceService.class));
        LearningGoal goal = new LearningGoal(); goal.setId("goal"); goal.setDescription("Competence");
        goal.setExtendedData(Map.of("orientationOutlook", "Explore stars", "treeOrder", 1));
        String original = fingerprints.forGoal(goal);
        goal.setExtendedData(Map.of("orientationOutlook", "Explore stars", "treeOrder", 42));
        assertThat(fingerprints.forGoal(goal)).isEqualTo(original);
        goal.setExtendedData(Map.of("orientationOutlook", "Explore chemistry", "treeOrder", 42));
        assertThat(fingerprints.forGoal(goal)).isNotEqualTo(original);
        original = fingerprints.forGoal(goal);
        goal.setTags(List.of("select:required"));
        assertThat(fingerprints.forGoal(goal)).isNotEqualTo(original);
    }

    @Test
    void missingBoundMaterialFailsClosed() {
        var resources = mock(ResourceLoader.class);
        when(resources.getResource(anyString())).thenReturn(new FileSystemResource(directory.resolve("missing.jpg")));
        var fingerprints = new ChampionPracticeFingerprint(new ObjectMapper(), mock(DeckResourceService.class), resources);
        LearningGoal goal = new LearningGoal(); goal.setId("goal");
        goal.setResourceLinks(List.of(Map.of("type", "goal-visualization", "url", "/assets/missing.jpg")));
        assertThat(fingerprints.forGoal(goal)).isNull();
    }
}
