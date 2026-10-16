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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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

    @ParameterizedTest
    @ValueSource(strings = {
            "DE/Gymnasium/quality/review/memory-decks",
            "DE/Gymnasium/quality/review/json",
            "mapping/quality/json",
            "other/quality/memory-decks"
    })
    void resolveDeckResource_ignoresQualityOnlyDecks(String directory) throws Exception {
        writeDeck(tempDir.resolve(directory).resolve("quality_only_regression_deck.de.json"));
        DeckResourceService service = repositoryService(tempDir);

        assertThat(service.resolveDeckResource("/data/quality_only_regression_deck.de.json")).isNull();
    }

    @Test
    void resolveDeckResource_qualityCopyCannotOverrideALaterSortingLiveDeck() throws Exception {
        Path review = writeDeck(tempDir.resolve("A/quality/memory-decks/shared_regression_deck.de.json"));
        Path live = writeDeck(tempDir.resolve("Z/memory-decks/shared_regression_deck.de.json"));
        assertThat(review.toString().compareTo(live.toString())).isNegative();
        DeckResourceService service = repositoryService(tempDir);

        Resource resource = service.resolveDeckResource("/data/shared_regression_deck.de.json");

        assertThat(resource).isNotNull();
        assertThat(resource.getFile().toPath()).isEqualTo(live);
    }

    @Test
    void resolveDeckResource_acceptsConfiguredQualityRootAndDistinctDirectoryNames() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("quality"));
        Path capitalized = writeDeck(root.resolve("Quality/json/capitalized_regression_deck.de.json"));
        Path neighbor = writeDeck(root.resolve("quality-neighbor/memory-decks/neighbor_regression_deck.de.json"));
        DeckResourceService service = repositoryService(root);

        assertThat(service.resolveDeckResource("/data/capitalized_regression_deck.de.json").getFile().toPath())
                .isEqualTo(capitalized);
        assertThat(service.resolveDeckResource("/data/neighbor_regression_deck.de.json").getFile().toPath())
                .isEqualTo(neighbor);
    }

    @Test
    void resolveDeckResource_preservesDuplicateOrderAndFileLinksWithoutFollowingDirectoryLinks() throws Exception {
        Path root = Files.createDirectory(tempDir.resolve("curricula"));
        Path first = writeDeck(root.resolve("A/json/shared_regression_deck.de.json"));
        writeDeck(root.resolve("Z/memory-decks/shared_regression_deck.de.json"));
        Path external = writeDeck(tempDir.resolve("external/json/directory_only_regression_deck.de.json"));
        Path link = Files.createSymbolicLink(first.getParent().resolve("linked_regression_deck.de.json"), external);
        Files.createSymbolicLink(root.resolve("directory-link"), external.getParent().getParent());
        DeckResourceService service = repositoryService(root);

        assertThat(service.resolveDeckResource("/data/shared_regression_deck.de.json").getFile().toPath())
                .isEqualTo(first);
        assertThat(service.resolveDeckResource("/data/linked_regression_deck.de.json").getFile().toPath())
                .isEqualTo(link);
        assertThat(service.resolveDeckResource("/data/directory_only_regression_deck.de.json")).isNull();
    }

    private Path writeDeck(Path file) throws Exception {
        Files.createDirectories(file.getParent());
        return Files.writeString(file, "{\"cards\":[]}");
    }

    private DeckResourceService repositoryService(Path root) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(root.toString());
        return new DeckResourceService(properties);
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
