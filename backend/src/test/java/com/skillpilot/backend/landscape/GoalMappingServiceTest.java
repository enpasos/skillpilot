package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GoalMappingServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @TempDir
    Path tempDir;

    @Test
    void loadsGoalMappingsAndIndexesByLegacyGoalId() throws IOException {
        writeJson(tempDir.resolve("mapping/math_legacy_to_canonical.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    },
                    {
                      "legacyGoalId": "legacy-2",
                      "canonicalGoalId": "canon-2",
                      "matchType": "partial"
                    }
                  ]
                }
                """);

        writeJson(tempDir.resolve("json/legacy_landscape.json"), """
                {
                  "landscapeId": "legacy-math",
                  "title": "Legacy Math",
                  "goals": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(2);
        assertThat(service.findByLegacyGoalId("legacy-1"))
                .get()
                .extracting(
                        ResolvedGoalMapping::sourceLandscapeId,
                        ResolvedGoalMapping::targetLandscapeId,
                        ResolvedGoalMapping::canonicalGoalId,
                        ResolvedGoalMapping::matchType,
                        ResolvedGoalMapping::sourceFile)
                .containsExactly("legacy-math", "canonical-math", "canon-1", "exact",
                        tempDir.resolve("mapping/math_legacy_to_canonical.json").toString());
        assertThat(service.findByLegacyGoalId("missing")).isEmpty();
        assertThat(service.getMappingsForSourceLandscape("legacy-math")).hasSize(2);
    }

    @Test
    void ignoresNonMappingJsonFiles() throws IOException {
        writeJson(tempDir.resolve("json/random.json"), """
                {
                  "hello": "world"
                }
                """);
        writeJson(tempDir.resolve("json/landscape.json"), """
                {
                  "landscapeId": "some-landscape",
                  "title": "Some Landscape",
                  "goals": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).isEmpty();
    }

    @Test
    void rejectsConflictingMappingsForSameLegacyGoalId() throws IOException {
        writeJson(tempDir.resolve("mapping/one.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("mapping/two.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-2",
                      "matchType": "exact"
                    }
                  ]
                }
                """);

        assertThatThrownBy(() -> createService(tempDir))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting goal mappings for legacyGoalId legacy-1");
    }

    @Test
    void rejectsUnsupportedMatchTypes() throws IOException {
        writeJson(tempDir.resolve("mapping/invalid.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "broader"
                    }
                  ]
                }
                """);

        assertThatThrownBy(() -> createService(tempDir))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unsupported matchType");
    }

    @Test
    void allowsPlaceholderMappingFilesWithEmptyMappings() throws IOException {
        writeJson(tempDir.resolve("mapping/planned.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "planned-state-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).isEmpty();
        assertThat(service.getMappingsForSourceLandscape("planned-state-math")).isEmpty();
    }

    private GoalMappingService createService(Path directory) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new GoalMappingService(properties, objectMapper);
    }

    private void writeJson(Path file, String json) throws IOException {
        Files.createDirectories(file.getParent());
        Files.writeString(file, json);
    }
}
