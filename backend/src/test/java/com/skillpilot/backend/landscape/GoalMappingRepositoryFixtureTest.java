package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class GoalMappingRepositoryFixtureTest {

    private static final String HESSEN_MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_MATH_SEK1_LANDSCAPE_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
    private static final String BAYERN_MATH_LANDSCAPE_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String CANONICAL_MATH_PILOT_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final Path MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_math_upper_secondary_to_canonical_math_pilot.json");
    private static final Path SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_math_lower_secondary_to_canonical_math_pilot.json");
    private static final Path BAYERN_MAPPING_FILE = Path.of("../curricula/DE/BY/Gymnasium/mapping/bavaria_math_to_canonical_math_pilot.json");
    private static final Path CURRICULA_DIR = Path.of("../curricula");

    @Test
    void parsesRepositoryBackedCanonicalMathPilotMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(file.getMappings()).hasSize(9);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }

    @Test
    void parsesRepositoryBackedCanonicalMathPilotSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MATH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(file.getMappings()).hasSize(10);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }

    @Test
    void repositoryFixtureIsDiscoveredByGoalMappingServiceWithoutSpecialFilenameSuffix() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(CURRICULA_DIR.toAbsolutePath().normalize().toString());
        GoalMappingService service = new GoalMappingService(properties, new ObjectMapper());

        assertThat(service.getMappingsForSourceLandscape(HESSEN_MATH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_MATH_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_MATH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_PILOT_ID.equals(mapping.targetLandscapeId()));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathPilotBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(file.getMappings()).hasSize(13);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }
}
