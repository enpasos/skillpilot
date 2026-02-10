package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.landscape.LandscapeProperties;
import java.nio.file.Files;
import java.nio.file.Path;
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
    void resolveDeckResource_rejectsInvalidFileNames() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        DeckResourceService service = new DeckResourceService(properties);

        Resource resource = service.resolveDeckResource("/data/not-a-deck.json");

        assertThat(resource).isNull();
    }
}

