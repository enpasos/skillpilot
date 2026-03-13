package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

class GoalMappingRepositoryFixtureTest {

    private static final String HESSEN_MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_MATH_SEK1_LANDSCAPE_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
    private static final String HESSEN_PHYSICS_LANDSCAPE_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String HESSEN_CHEMISTRY_LANDSCAPE_ID = "2f391ba2-ba1e-40e4-a8d2-dff049516c13";
    private static final String HESSEN_BIOLOGY_LANDSCAPE_ID = "3e56aa75-c76c-4de5-883b-0aac98297846";
    private static final String HESSEN_INFORMATICS_LANDSCAPE_ID = "c1a02ddd-736d-4975-920b-18b03aff147f";
    private static final String HESSEN_HISTORY_LANDSCAPE_ID = "bdc89685-73d3-446c-af5a-eaf642c07463";
    private static final String HESSEN_GERMAN_LANDSCAPE_ID = "f1ba2118-853f-4aa0-bef5-4f749bc621ed";
    private static final String HESSEN_POLITICS_ECONOMICS_LANDSCAPE_ID = "1d0e9f8f-0087-49e4-8ea2-976e5a89b165";
    private static final String HESSEN_ENGLISH_LANDSCAPE_ID = "bc2124fa-2974-46cc-85e7-2392e61250e1";
    private static final String HESSEN_FRENCH_LANDSCAPE_ID = "30acd190-609c-4109-8ee7-06fc5594af19";
    private static final String HESSEN_LATIN_LANDSCAPE_ID = "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1";
    private static final String HESSEN_SPANISH_LANDSCAPE_ID = "936efc61-a4d5-49fd-8694-085d1347db80";
    private static final String HESSEN_GREEK_LANDSCAPE_ID = "c7209caa-18e5-4dd8-b68f-dd86e228d045";
    private static final String HESSEN_CHINESE_LANDSCAPE_ID = "7651cbe2-5fb8-464d-b0c4-3e830cda41dd";
    private static final String BAYERN_MATH_LANDSCAPE_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String BAYERN_PHYSICS_LANDSCAPE_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String CANONICAL_MATH_PILOT_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_PHYSICS_PILOT_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_CHEMISTRY_ID = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String CANONICAL_BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String CANONICAL_INFORMATICS_ID = "7d51b38c-a149-5407-bddc-d2ce7878b020";
    private static final String CANONICAL_HISTORY_ID = "92406d94-e3c1-58ec-b7c6-12122278d25a";
    private static final String CANONICAL_GERMAN_ID = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String CANONICAL_POLITICS_ECONOMICS_ID = "51b60137-46e8-5498-973e-ea38bb32f327";
    private static final String CANONICAL_ENGLISH_ID = "c8c84073-46ae-57ec-898a-882d08d7a72f";
    private static final String CANONICAL_FRENCH_ID = "96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977";
    private static final String CANONICAL_LATIN_ID = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String CANONICAL_SPANISH_ID = "90eedebf-9ea8-5247-85dd-31c147f907c3";
    private static final String CANONICAL_GREEK_ID = "70a2cb55-127b-5c6e-b518-4a1c9f4f77a0";
    private static final String CANONICAL_CHINESE_ID = "8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80";
    private static final Path MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_math_upper_secondary_to_canonical_math_pilot.json");
    private static final Path PHYSICS_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_physics_upper_secondary_to_canonical_physics_pilot.json");
    private static final Path CHEMISTRY_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_chemistry_upper_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_biology_upper_secondary_to_canonical_biology.json");
    private static final Path INFORMATICS_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_informatics_upper_secondary_to_canonical_informatics.json");
    private static final Path HISTORY_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_history_upper_secondary_to_canonical_history.json");
    private static final Path GERMAN_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_german_upper_secondary_to_canonical_german.json");
    private static final Path POLITICS_ECONOMICS_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_politics_economics_upper_secondary_to_canonical_politics_economics.json");
    private static final Path ENGLISH_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_english_upper_secondary_to_canonical_english.json");
    private static final Path FRENCH_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_french_upper_secondary_to_canonical_french.json");
    private static final Path LATIN_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_latin_upper_secondary_to_canonical_latin.json");
    private static final Path SPANISH_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_spanish_upper_secondary_to_canonical_spanish.json");
    private static final Path GREEK_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_greek_upper_secondary_to_canonical_greek.json");
    private static final Path CHINESE_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasiale_Oberstufe/mapping/hessen_chinese_upper_secondary_to_canonical_chinese.json");
    private static final Path SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_math_lower_secondary_to_canonical_math_pilot.json");
    private static final Path BAYERN_MAPPING_FILE = Path.of("../curricula/DE/BY/Gymnasium/mapping/bavaria_math_to_canonical_math_pilot.json");
    private static final Path BAYERN_PHYSICS_MAPPING_FILE = Path.of("../curricula/DE/BY/Gymnasium/mapping/bavaria_physics_to_canonical_physics_pilot.json");
    private static final Path CURRICULA_DIR = Path.of("../curricula");

    @Test
    void parsesRepositoryBackedCanonicalMathPilotMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(file.getMappings()).hasSize(451);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
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
    void parsesRepositoryBackedCanonicalPhysicsPilotMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(PHYSICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_PHYSICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
        assertThat(file.getMappings()).hasSize(376);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalChemistryMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(CHEMISTRY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_CHEMISTRY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CHEMISTRY_ID);
        assertThat(file.getMappings()).hasSize(187);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalBiologyMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BIOLOGY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_BIOLOGY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_BIOLOGY_ID);
        assertThat(file.getMappings()).hasSize(204);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalInformaticsMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(INFORMATICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_INFORMATICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_INFORMATICS_ID);
        assertThat(file.getMappings()).hasSize(209);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalHistoryMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(HISTORY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_HISTORY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_HISTORY_ID);
        assertThat(file.getMappings()).hasSize(210);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalGermanMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(GERMAN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_GERMAN_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_GERMAN_ID);
        assertThat(file.getMappings()).hasSize(166);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalPoliticsEconomicsMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(POLITICS_ECONOMICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_POLITICS_ECONOMICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_POLITICS_ECONOMICS_ID);
        assertThat(file.getMappings()).hasSize(208);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalEnglishMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(ENGLISH_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_ENGLISH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_ENGLISH_ID);
        assertThat(file.getMappings()).hasSize(130);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalFrenchMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(FRENCH_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_FRENCH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_FRENCH_ID);
        assertThat(file.getMappings()).hasSize(175);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalLatinMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(LATIN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_LATIN_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_LATIN_ID);
        assertThat(file.getMappings()).hasSize(142);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalSpanishMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(SPANISH_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_SPANISH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_SPANISH_ID);
        assertThat(file.getMappings()).hasSize(83);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalGreekMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(GREEK_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_GREEK_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_GREEK_ID);
        assertThat(file.getMappings()).hasSize(193);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalChineseMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(CHINESE_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_CHINESE_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CHINESE_ID);
        assertThat(file.getMappings()).hasSize(187);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
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
        assertThat(service.getMappingsForSourceLandscape(BAYERN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_CHEMISTRY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_BIOLOGY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_INFORMATICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_INFORMATICS_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_HISTORY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_HISTORY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_GERMAN_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_GERMAN_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_POLITICS_ECONOMICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_POLITICS_ECONOMICS_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_ENGLISH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_ENGLISH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_FRENCH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_FRENCH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_LATIN_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_LATIN_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_SPANISH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_SPANISH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_GREEK_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_GREEK_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_CHINESE_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHINESE_ID.equals(mapping.targetLandscapeId()));
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

    @Test
    void parsesRepositoryBackedCanonicalPhysicsPilotBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_PHYSICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_PHYSICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
        assertThat(file.getMappings()).hasSize(15);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }
}
