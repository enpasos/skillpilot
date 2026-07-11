package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;

class DeckResourceServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void resolveDeckResource_prefersCurriculaJsonSource() throws Exception {
        Path deckDir = tempDir.resolve("DE/HE/Test/json");
        Files.createDirectories(deckDir);
        Path deckFile = deckDir.resolve("sample_deck.de.json");
        Files.writeString(deckFile, "{ \"cards\": [] }");

        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        DeckResourceService service = new DeckResourceService(properties);

        Resource resource = service.resolveDeckResource("/data/sample_deck.de.json");

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.getFile().toPath().toAbsolutePath().normalize())
                .isEqualTo(deckFile.toAbsolutePath().normalize());
    }

    @Test
    void resolveDeckResource_acceptsCanonicalFlashcardDeckNames() throws Exception {
        Path deckDir = tempDir.resolve("DE/Gymnasium/Test/json");
        Files.createDirectories(deckDir);
        Path deckFile = deckDir.resolve("de_gymnasium_math_flashcards_seki_core.de.json");
        Files.writeString(deckFile, "{ \"cards\": [] }");

        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        DeckResourceService service = new DeckResourceService(properties);

        Resource resource = service.resolveDeckResource("/data/de_gymnasium_math_flashcards_seki_core.de.json");

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.getFile().toPath().toAbsolutePath().normalize())
                .isEqualTo(deckFile.toAbsolutePath().normalize());
    }

    @Test
    void resolveDeckResource_acceptsCanonicalMemoryDeckDirectory() throws Exception {
        Path deckDir = tempDir.resolve("DE/Gymnasium/memory-decks");
        Files.createDirectories(deckDir);
        Path deckFile = deckDir.resolve("de_gymnasium_math_flashcards_seki_core.de.json");
        Files.writeString(deckFile, "{ \"cards\": [] }");

        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        DeckResourceService service = new DeckResourceService(properties);

        Resource resource = service.resolveDeckResource("/data/de_gymnasium_math_flashcards_seki_core.de.json");

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.getFile().toPath().toAbsolutePath().normalize())
                .isEqualTo(deckFile.toAbsolutePath().normalize());
    }

    @Test
    void resolveDeckResource_rejectsInvalidFileNames() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        DeckResourceService service = new DeckResourceService(properties);

        Resource resource = service.resolveDeckResource("/data/not-a-deck.json");

        assertThat(resource).isNull();
    }

    @Test
    void packageModeResolvesOnlyGoalBoundSnapshotDecks() throws Exception {
        PackageCurriculumResourceState state = mock(PackageCurriculumResourceState.class);
        PackageCurriculumResourceState.ResolvedArtifact artifact =
                new PackageCurriculumResourceState.ResolvedArtifact(
                        "{\"cards\":[]}".getBytes(StandardCharsets.UTF_8),
                        "application/json",
                        "deck.de.json",
                        "a".repeat(64),
                        "/api/ui/curriculum-resources/packages/org.example/1.0.0/decks/deck/de-DE");
        when(state.resolveGoalDeck("goal-1", "data/cards/deck.de.json"))
                .thenReturn(Optional.of(artifact));
        DeckResourceService service = new DeckResourceService(state);

        Resource resource = service.resolveDeckResource("goal-1", "data/cards/deck.de.json");

        assertThat(resource).isNotNull();
        assertThat(resource.getFilename()).isEqualTo("deck.de.json");
        assertThat(resource.getContentAsString(StandardCharsets.UTF_8)).isEqualTo("{\"cards\":[]}");
        assertThat(service.resolveDeckResource("data/cards/deck.de.json")).isNull();
        assertThat(service.resolveDeckResource("goal-2", "data/cards/deck.de.json")).isNull();
        verify(state).resolveGoalDeck("goal-1", "data/cards/deck.de.json");
        verify(state).resolveGoalDeck("goal-2", "data/cards/deck.de.json");
    }
}
