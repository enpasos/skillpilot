package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LandscapeServiceSourceRegistryTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @TempDir
    Path tempDir;

    @Test
    void resolvesJurisdictionFromSourceLandscapeRegistryWhenLoadedLandscapeHasNoRegion() throws IOException {
        writeJson(tempDir.resolve("legacy/math.json"), """
                {
                  "landscapeId": "legacy-math",
                  "title": "Legacy Math",
                  "goals": []
                }
                """);
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-landscape-registry.json"), """
                {
                  "version": 1,
                  "entries": [
                    {
                      "landscapeId": "legacy-math",
                      "jurisdiction": "DE-HE",
                      "sourcePath": "curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/json/DE_HES_S_GYM_2_MATHEMATIK.de.json",
                      "archivePath": "curricula/DE/Gymnasium/input/DE-HE/upper-secondary/"
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.getById("legacy-math")).isNotNull();
        assertThat(service.resolveSourceLandscapeJurisdiction("legacy-math")).isEqualTo("DE-HE");
    }

    @Test
    void resolvesAtomicGoalClosureFromSourceGoalClosureRegistry() throws IOException {
        writeJson(tempDir.resolve("DE/Gymnasium/provenance/source-goal-closure-registry.json"), """
                {
                  "version": 1,
                  "landscapes": [
                    {
                      "landscapeId": "legacy-math",
                      "goalAtomicClosures": {
                        "cluster-1": ["atom-1", "atom-2"],
                        "atom-1": ["atom-1"]
                      }
                    }
                  ]
                }
                """);

        LandscapeService service = createService(tempDir);

        assertThat(service.resolveSourceAtomicGoalIds("legacy-math", "cluster-1"))
                .containsExactly("atom-1", "atom-2");
        assertThat(service.resolveSourceAtomicGoalIds("legacy-math", "missing")).isEmpty();
    }

    private LandscapeService createService(Path directory) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new LandscapeService(properties, objectMapper);
    }

    private void writeJson(Path file, String json) throws IOException {
        Files.createDirectories(file.getParent());
        Files.writeString(file, json);
    }
}
