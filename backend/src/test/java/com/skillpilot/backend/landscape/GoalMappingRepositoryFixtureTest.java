package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.assertj.core.groups.Tuple;
import org.junit.jupiter.api.Test;

class GoalMappingRepositoryFixtureTest {

    private static final String HESSEN_MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_MATH_SEK1_LANDSCAPE_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
    private static final String HESSEN_PHYSICS_SEK1_LANDSCAPE_ID = "996d097a-cac2-4b5f-979a-b3a0b9803265";
    private static final String HESSEN_CHEMISTRY_SEK1_LANDSCAPE_ID = "bea90c22-b9c5-4c0c-9b10-89d875f50772";
    private static final String HESSEN_BIOLOGY_SEK1_LANDSCAPE_ID = "71438941-0ceb-46ee-ad31-773cee700779";
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
    private static final String HESSEN_MUSIC_LANDSCAPE_ID = "a8c23058-6998-49f2-9f3b-a85e951d5ab0";
    private static final String HESSEN_ECONOMICS_LANDSCAPE_ID = "a334a745-1d67-4e1d-86a5-dadc04f144d2";
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
    private static final String CANONICAL_MUSIC_ID = "f620c251-c1e1-41c1-b4e1-b10950b43608";
    private static final String CANONICAL_ECONOMICS_ID = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
    private static final Path HESSEN_UPPER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary");
    private static final Path MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_math_upper_secondary_to_canonical_math_pilot.json");
    private static final Path PHYSICS_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_physics_upper_secondary_to_canonical_physics_pilot.json");
    private static final Path CHEMISTRY_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_chemistry_upper_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_biology_upper_secondary_to_canonical_biology.json");
    private static final Path INFORMATICS_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_informatics_upper_secondary_to_canonical_informatics.json");
    private static final Path HISTORY_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_history_upper_secondary_to_canonical_history.json");
    private static final Path GERMAN_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_german_upper_secondary_to_canonical_german.json");
    private static final Path POLITICS_ECONOMICS_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_politics_economics_upper_secondary_to_canonical_politics_economics.json");
    private static final Path ENGLISH_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_english_upper_secondary_to_canonical_english.json");
    private static final Path FRENCH_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_french_upper_secondary_to_canonical_french.json");
    private static final Path LATIN_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_latin_upper_secondary_to_canonical_latin.json");
    private static final Path SPANISH_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_spanish_upper_secondary_to_canonical_spanish.json");
    private static final Path GREEK_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_greek_upper_secondary_to_canonical_greek.json");
    private static final Path CHINESE_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_chinese_upper_secondary_to_canonical_chinese.json");
    private static final Path MUSIC_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_music_upper_secondary_to_canonical_music.json");
    private static final Path ECONOMICS_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_economics_upper_secondary_to_canonical_economics.json");
    private static final Path SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_math_lower_secondary_to_canonical_math_pilot.json");
    private static final Path PHYSICS_SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_physics_lower_secondary_to_canonical_physics.json");
    private static final Path CHEMISTRY_SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_chemistry_lower_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_SEK1_MAPPING_FILE = Path.of("../curricula/DE/HE/Kultusministerium/Gymnasium_9_Mittelstufe/mapping/hessen_biology_lower_secondary_to_canonical_biology.json");
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
    void parsesRepositoryBackedCanonicalPhysicsSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(PHYSICS_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_PHYSICS_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
        assertThat(file.getMappings()).hasSize(7);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }

    @Test
    void parsesRepositoryBackedCanonicalChemistrySek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(CHEMISTRY_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_CHEMISTRY_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CHEMISTRY_ID);
        assertThat(file.getMappings()).hasSize(8);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
    }

    @Test
    void parsesRepositoryBackedCanonicalBiologySek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BIOLOGY_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_BIOLOGY_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_BIOLOGY_ID);
        assertThat(file.getMappings()).hasSize(14);
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
    void parsesRepositoryBackedCanonicalEconomicsMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(ECONOMICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_ECONOMICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_ECONOMICS_ID);
        assertThat(file.getMappings()).hasSize(225);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalMusicMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(MUSIC_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MUSIC_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MUSIC_ID);
        assertThat(file.getMappings()).hasSize(76);
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
        assertThat(service.getMappingsForSourceLandscape(HESSEN_PHYSICS_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_CHEMISTRY_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_BIOLOGY_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
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
        assertThat(service.getMappingsForSourceLandscape(HESSEN_MUSIC_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MUSIC_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_ECONOMICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_ECONOMICS_ID.equals(mapping.targetLandscapeId()));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathPilotBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(file.getMappings()).hasSize(64);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("e58ed4dd-67fd-5ece-b30c-1d39dcb918a2", "6377e1e3-8c26-4cf1-997d-8802690d74dd", "partial"),
                        Tuple.tuple("505f7dc0-9656-582d-be8a-d4bc55eb5889", "ca834a7d-5a66-4876-b24c-143b1464d937", "partial"),
                        Tuple.tuple("fd9fbf2a-f74e-5bdd-874f-4ba62db3bd54", "cafd6520-c4af-4109-9863-cc49ba6fad4d", "partial"),
                        Tuple.tuple("f9e2689e-c719-554b-83bf-7672610d65f2", "8f7bb79b-f014-4bb6-8dce-7e3f1c92e893", "partial"),
                        Tuple.tuple("0235cf56-da4b-5657-86be-92608b235e6c", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("fc5f5e55-a6c4-5175-8e96-a04dee910927", "e07fa2ee-c26f-4032-9140-358a4f6c1457", "partial"),
                        Tuple.tuple("f236d582-5efb-5f5f-896b-c09264a49238", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("ae549d5b-434c-56f8-9be2-949e926f0256", "325771e1-602d-4bca-a199-a8f39a2d3dee", "partial"),
                        Tuple.tuple("4d86904c-6259-53c6-9768-55d314a041fe", "612dfc95-95cb-44df-80ae-d8446199cb0d", "partial"),
                        Tuple.tuple("97efb769-8e4f-56a1-acaf-f2d230263ef9", "34ba4714-a0ff-4a48-857f-d2481cbe0441", "partial"),
                        Tuple.tuple("9a14516b-775f-5d35-8a04-bd705a57e09b", "fa72cf74-a31e-402e-90d7-422c118f4a5b", "partial"),
                        Tuple.tuple("20ddd1d4-c0fd-5dc8-9a8f-a6cd4bd665f5", "c420e0be-1e74-4050-834c-d8da7f41095a", "partial"),
                        Tuple.tuple("6c6f187b-d9c4-5743-b507-b51d54f3414e", "6596405a-9728-41df-9163-53670ec2a937", "partial"),
                        Tuple.tuple("e5acc4c2-02ec-5df7-9b7d-fd9328e47b83", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "partial"),
                        Tuple.tuple("67193ff0-3eee-5bff-9bf5-0ee7ea7adf3d", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "exact"),
                        Tuple.tuple("577b706d-e03e-53e8-b2fa-ddd9738b01db", "5a7095a2-2b3a-48bf-9536-eca79ee5ff8c", "partial"),
                        Tuple.tuple("3911d7c9-3248-5cee-bc31-77a1bf5f30b5", "546bf0b3-6921-416b-a2ef-8fd37d429dc7", "partial"),
                        Tuple.tuple("b7644f86-2499-58c6-ac63-1409de0c8c69", "d64516eb-9dd2-4808-91d0-0040ccdc281f", "partial"),
                        Tuple.tuple("3d5cd025-ef32-5447-9626-ae79a51a6a73", "902de188-6f27-47c2-ace1-9b2c5771fde8", "partial"),
                        Tuple.tuple("51b3e1f8-f6e9-5db8-a5ce-403815407d45", "8a0b0baf-c7e6-43df-a470-f56050ecaa46", "partial"),
                        Tuple.tuple("65594e82-8ecb-5c2d-ba80-98c0ac7fc6ad", "759485a9-51c0-4261-af7d-caa3c0e5d68b", "partial"),
                        Tuple.tuple("c31989a6-71bc-56b9-b858-3012be82ad00", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "partial"),
                        Tuple.tuple("fb20bed3-2c5b-5745-8031-c34a902ac9e7", "219ce079-6bfd-4827-8b66-5dd199e44686", "partial"),
                        Tuple.tuple("ef7d6c31-704c-57df-b974-3ec8b7bed6ed", "71a483ba-9680-4654-bb5e-5ab5427f0919", "partial"),
                        Tuple.tuple("c35677b0-5174-5c90-8a27-b8bf2948ea8c", "efc3506a-5f35-4d77-9498-d70a091a470b", "partial"),
                        Tuple.tuple("76b7e724-aff5-5e69-93a5-8ca1d4e72a8d", "e55edcb9-2184-4a24-890e-70cc91028990", "partial"),
                        Tuple.tuple("03bb6fae-84a6-59c5-b56a-0f4128688706", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"),
                        Tuple.tuple("4c449fa1-6695-5bf5-867d-3e29e0f669e5", "5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11", "partial"),
                        Tuple.tuple("ef731877-eaae-5569-aa24-4214f1e412a5", "1ce8af38-082a-477b-af48-b924c92761bf", "partial"),
                        Tuple.tuple("f7f35bcd-6ff5-5129-90e1-07aa2fdf704a", "6248bbd7-c7e8-4f91-b3dc-de885cf5abce", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPhysicsPilotBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_PHYSICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_PHYSICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
        assertThat(file.getMappings()).hasSize(23);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("e11f30f3-937f-5775-998e-13674c877f74", "5c44b9ba-9b05-4774-95d5-073230d3fc4f", "exact"),
                        Tuple.tuple("7c3355b3-7488-53eb-8f04-bd6f18d5c02d", "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd", "exact"),
                        Tuple.tuple("c8acde94-88ba-51a7-a5f8-6888207081b0", "a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20", "exact"),
                        Tuple.tuple("ec2bc490-efbc-54ba-aff3-3369767f0a83", "68c90ba6-c438-463c-9a53-cf61062d416a", "exact"),
                        Tuple.tuple("37327429-a775-5bd8-a777-e8695d4df244", "94784e0a-7ddc-48be-91fb-dc82b78eb322", "exact"),
                        Tuple.tuple("01dae520-33a8-5953-ab1d-f3329aff9a09", "6affc2ea-ecd2-4fcd-8877-3ffa15b0425b", "exact"),
                        Tuple.tuple("3c283b9c-4a1a-5c7a-bd1b-e19a961b7710", "32b896b9-f2f1-4d4e-96ad-e869ac3d3759", "exact"),
                        Tuple.tuple("aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b", "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3", "partial"),
                        Tuple.tuple("479784b2-511c-5b2a-a1a1-f9c7625fd5bb", "a0aaedcb-41f8-4891-af77-a69a76b8c10d", "exact"));
    }
}
