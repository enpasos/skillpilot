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

    private static final String CARDS_WITHOUT_ORIGINS = """
            {"cards":[{"id":"c1","front":"Q","back":"A","category":"K","tags":["GK","goal:g1"]}]}""";

    private static ChampionPracticeFingerprint fingerprints(String deckJson) {
        DeckResourceService decks = mock(DeckResourceService.class);
        when(decks.resolveDeckResource("memory", "/data/deck.json")).thenAnswer(call ->
                new org.springframework.core.io.ByteArrayResource(deckJson.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        return new ChampionPracticeFingerprint(new ObjectMapper(), decks);
    }

    private static LearningGoal memoryGoal() {
        LearningGoal goal = new LearningGoal(); goal.setId("memory"); goal.setNodeKind("memory");
        goal.setExtendedData(Map.of("vocabularySource", "/data/deck.json"));
        return goal;
    }

    private static String fingerprint(String deckJson) {
        return fingerprints(deckJson).forGoal(memoryGoal());
    }

    @Test
    void originGoalIdsAreReleaseMetadataAndKeepTheFingerprintOfThePracticedCards() {
        String before = fingerprint(CARDS_WITHOUT_ORIGINS);
        assertThat(before).isNotNull();
        // For a deck without the field the new value equals the pre-change rule (whole cards node).
        assertThat(fingerprints(CARDS_WITHOUT_ORIGINS).legacyForGoal(memoryGoal())).isEqualTo(before);

        assertThat(fingerprint("""
                {"schemaVersion":2,"cards":[{"id":"c1","front":"Q","back":"A","originGoalIds":["g1"],
                  "category":"K","tags":["GK","goal:g1"]}]}""")).isEqualTo(before);
        assertThat(fingerprint("""
                {"cards":[{"id":"c1","front":"Q2","back":"A","category":"K","tags":["GK","goal:g1"]}]}"""))
                .isNotEqualTo(before);
        assertThat(fingerprint("""
                {"cards":[{"id":"c1","front":"Q","back":"A2","category":"K","tags":["GK","goal:g1"]}]}"""))
                .isNotEqualTo(before);
        assertThat(fingerprint("""
                {"cards":[{"id":"c1","front":"Q","back":"A","category":"K2","tags":["GK","goal:g1"]}]}"""))
                .isNotEqualTo(before);
        assertThat(fingerprint("""
                {"cards":[{"id":"c1","front":"Q","back":"A","category":"K","tags":["LK","goal:g1"]}]}"""))
                .isNotEqualTo(before);
    }

    @Test
    void evidenceOfDecksThatAlreadyCarriedOriginGoalIdsRemainsRecognizable() {
        String deck = """
                {"schemaVersion":1,"cards":[{"id":"c1","front":"Q","back":"A","originGoalIds":["g1"]}]}""";
        var fingerprints = fingerprints(deck);
        LearningGoal goal = memoryGoal();
        // The legacy rule reproduces what such a deck produced before issue #85.
        assertThat(fingerprints.legacyForGoal(goal)).isNotNull().isNotEqualTo(fingerprints.forGoal(goal));
        assertThat(fingerprints.forGoal(goal)).isEqualTo(fingerprint("""
                {"cards":[{"id":"c1","front":"Q","back":"A"}]}"""));
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
