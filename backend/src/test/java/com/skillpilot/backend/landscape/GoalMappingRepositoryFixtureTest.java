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
    private static final String HESSEN_FRENCH_SEK1_LANDSCAPE_ID = "762de708-85fa-4324-958e-56002a318f7f";
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
    private static final String NRW_MATH_SEK1_LANDSCAPE_ID = "c862423f-d0ac-4a65-8ad2-9a6e560313a8";
    private static final String NRW_MATH_UPPER_SECONDARY_LANDSCAPE_ID = "d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1";
    private static final String NRW_PHYSICS_UPPER_SECONDARY_LANDSCAPE_ID = "8abb46ff-072b-41b7-9d70-0334cb5a1a6c";
    private static final String NIEDERSACHSEN_MATH_SEK1_LANDSCAPE_ID = "2b995085-dc5e-47c6-a563-9dcfc01fb74d";
    private static final String NIEDERSACHSEN_MATH_UPPER_SECONDARY_LANDSCAPE_ID = "fcb04661-6ea2-4030-a9b2-97e6cc03daf8";
    private static final String BADEN_WUERTTEMBERG_MATH_SEK1_LANDSCAPE_ID = "6232b783-199c-4c50-92f2-9fb31277e619";
    private static final String BADEN_WUERTTEMBERG_MATH_UPPER_SECONDARY_LANDSCAPE_ID = "fa8f864a-aac5-486d-8e77-40df2af038a3";
    private static final String BADEN_WUERTTEMBERG_PHYSICS_UPPER_SECONDARY_LANDSCAPE_ID = "eee2dc63-f96b-42c3-a2c9-b906432ccf5d";
    private static final String SCHLESWIG_HOLSTEIN_MATH_UPPER_SECONDARY_LANDSCAPE_ID = "01ffba7d-7588-4221-bd2b-1a692839809a";
    private static final String BRANDENBURG_MATH_UPPER_SECONDARY_LANDSCAPE_ID = "c36ba9b3-4d11-4b19-a278-cd6c3c3fcc71";
    private static final String BAYERN_MATH_LANDSCAPE_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String BAYERN_PHYSICS_LANDSCAPE_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String BAYERN_CHEMISTRY_LANDSCAPE_ID = "ff1ca997-b6cc-5ece-8e13-5498b4bbf808";
    private static final String BAYERN_BIOLOGY_LANDSCAPE_ID = "357a7003-b636-570e-a0bd-6bb63518d2f6";
    private static final String CANONICAL_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
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
    private static final String CANONICAL_ITALIAN_ID = "25c6b527-10d6-5d92-9d76-fab23585f29b";
    private static final String CANONICAL_RUSSIAN_ID = "242ba9bd-7ec7-5ec3-a15e-4f0f2b01aa37";
    private static final String CANONICAL_POLISH_ID = "f145785b-0c44-5246-af66-8a153d202cb9";
    private static final String CANONICAL_CZECH_ID = "0900df4c-beeb-5542-86f9-bd479c94746a";
    private static final String CANONICAL_GREEK_ID = "70a2cb55-127b-5c6e-b518-4a1c9f4f77a0";
    private static final String CANONICAL_CHINESE_ID = "8fdb83f5-b42a-5b36-ab5d-64edd4b2ab80";
    private static final String CANONICAL_MUSIC_ID = "f620c251-c1e1-41c1-b4e1-b10950b43608";
    private static final String CANONICAL_ECONOMICS_ID = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
    private static final Path HESSEN_UPPER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary");
    private static final Path HESSEN_LOWER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary");
    private static final Path NRW_UPPER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-NW/upper-secondary");
    private static final Path NRW_LOWER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-NW/lower-secondary");
    private static final Path NIEDERSACHSEN_UPPER_SECONDARY_MAPPING_DIR =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary");
    private static final Path NIEDERSACHSEN_LOWER_SECONDARY_MAPPING_DIR =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary");
    private static final Path BADEN_WUERTTEMBERG_UPPER_SECONDARY_MAPPING_DIR =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary");
    private static final Path BADEN_WUERTTEMBERG_LOWER_SECONDARY_MAPPING_DIR =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary");
    private static final Path BAVARIA_GYMNASIUM_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-BY/gymnasium");
    private static final Path MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_math_upper_secondary_to_canonical_math.json");
    private static final Path PHYSICS_MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_physics_upper_secondary_to_canonical_physics.json");
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
    private static final Path SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_math_lower_secondary_to_canonical_math.json");
    private static final Path PHYSICS_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_physics_lower_secondary_to_canonical_physics.json");
    private static final Path CHEMISTRY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_chemistry_lower_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_biology_lower_secondary_to_canonical_biology.json");
    private static final Path FRENCH_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_french_lower_secondary_to_canonical_french.json");
    private static final Path NRW_SEK1_MAPPING_FILE =
            NRW_LOWER_SECONDARY_MAPPING_DIR.resolve("nrw_math_lower_secondary_to_canonical_math.json");
    private static final Path NRW_UPPER_SECONDARY_MAPPING_FILE =
            NRW_UPPER_SECONDARY_MAPPING_DIR.resolve("nrw_math_upper_secondary_to_canonical_math.json");
    private static final Path NRW_PHYSICS_UPPER_SECONDARY_MAPPING_FILE =
            NRW_UPPER_SECONDARY_MAPPING_DIR.resolve("nrw_physics_upper_secondary_to_canonical_physics.json");
    private static final Path NIEDERSACHSEN_SEK1_MAPPING_FILE =
            NIEDERSACHSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("ni_math_lower_secondary_to_canonical_math.json");
    private static final Path NIEDERSACHSEN_UPPER_SECONDARY_MAPPING_FILE =
            NIEDERSACHSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("ni_math_upper_secondary_to_canonical_math.json");
    private static final Path BADEN_WUERTTEMBERG_SEK1_MAPPING_FILE =
            BADEN_WUERTTEMBERG_LOWER_SECONDARY_MAPPING_DIR.resolve("bw_math_lower_secondary_to_canonical_math.json");
    private static final Path BADEN_WUERTTEMBERG_UPPER_SECONDARY_MAPPING_FILE =
            BADEN_WUERTTEMBERG_UPPER_SECONDARY_MAPPING_DIR.resolve("bw_math_upper_secondary_to_canonical_math.json");
    private static final Path BADEN_WUERTTEMBERG_PHYSICS_UPPER_SECONDARY_MAPPING_FILE =
            BADEN_WUERTTEMBERG_UPPER_SECONDARY_MAPPING_DIR.resolve("bw_physics_upper_secondary_to_canonical_physics.json");
    private static final Path SCHLESWIG_HOLSTEIN_UPPER_SECONDARY_MAPPING_FILE =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_math_upper_secondary_to_canonical_math.json");
    private static final Path BRANDENBURG_UPPER_SECONDARY_MAPPING_FILE =
            Path.of("../curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_math_upper_secondary_to_canonical_math.json");
    private static final Path BAYERN_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_math_to_canonical_math.json");
    private static final Path BAYERN_PHYSICS_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_physics_to_canonical_physics.json");
    private static final Path BAYERN_CHEMISTRY_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_chemistry_to_canonical_chemistry.json");
    private static final Path BAYERN_BIOLOGY_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_biology_to_canonical_biology.json");
    private static final Path BAYERN_ITALIAN_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_italian_to_canonical_italian.json");
    private static final Path BAYERN_RUSSIAN_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_russian_to_canonical_russian.json");
    private static final Path BAYERN_POLISH_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_polish_to_canonical_polish.json");
    private static final Path BAYERN_CZECH_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_czech_to_canonical_czech.json");
    private static final Path CURRICULA_DIR = Path.of("../curricula");

    @Test
    void parsesRepositoryBackedCanonicalMathMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(451);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
    }

    @Test
    void parsesRepositoryBackedCanonicalMathSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_MATH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(37);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("fcaf48ce-f837-53fc-b864-d61fd18d88ed", "65365dce-f33f-49d8-9516-42f75883aa86", "exact"),
                        Tuple.tuple("d20fcef5-b5dd-4e97-945a-52f7b7d89306", "cf474eab-1379-4877-907e-58b0892ce734", "exact"),
                        Tuple.tuple("05b6a520-c23a-414a-842a-ba1c0e57b776", "e6eb42c7-454f-49bf-b598-64d2935d2735", "exact"),
                        Tuple.tuple("172f1e73-b8fa-47be-b7af-50c93ce8cc7b", "e322310f-f33a-485d-bc23-2412a6b8fa12", "exact"),
                        Tuple.tuple("10589d55-210f-46b2-9bb5-2e02aa1638ff", "8a0b0baf-c7e6-43df-a470-f56050ecaa46", "exact"),
                        Tuple.tuple("9c37b136-6026-4a14-ac32-6d439d095351", "de39c9fe-5940-4320-aca8-2be85d6ada8f", "exact"),
                        Tuple.tuple("2c46a8bc-6ebb-455e-8855-f076f7db58e2", "fd860da9-73ba-47cd-a1a8-452424915a80", "exact"),
                        Tuple.tuple("07046536-ea3f-4ac1-ac68-464dc284b6b0", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "exact"),
                        Tuple.tuple("856a6399-caa8-497f-b0f0-8444b4da0a29", "ca834a7d-5a66-4876-b24c-143b1464d937", "exact"),
                        Tuple.tuple("a0e53af8-51cf-421f-b7e0-a0a456fdc375", "8da730f1-8947-498d-9e78-7fb20b00a994", "exact"),
                        Tuple.tuple("b559ea6d-6fb9-46a9-817b-c2656ba592d6", "f0a49da2-018b-4cda-adbd-27047b610a0f", "exact"),
                        Tuple.tuple("4df9013c-e218-4199-a539-7bff0470d7a5", "4d78bbcc-89b8-47f0-aa45-516199e4da5d", "exact"),
                        Tuple.tuple("cf02e2eb-c3d2-4e9f-9488-81206181d0e3", "415bd48b-8a76-4d4f-bfdd-d085573e7ac3", "exact"),
                        Tuple.tuple("279fb3b6-2acd-4517-82f1-2d0dbdbcb1b1", "6596405a-9728-41df-9163-53670ec2a937", "exact"),
                        Tuple.tuple("6f712b32-da84-4872-89e8-3c075988c21f", "66077296-a8f8-4645-938b-7c3424cb2f14", "exact"),
                        Tuple.tuple("20392274-8be0-4e2c-a6bd-cd96001ce71b", "87c55be5-06a9-41e2-a0d4-c60f7c8b8078", "exact"),
                        Tuple.tuple("209a6413-6598-47d6-b296-962207b2f5b1", "1f89d69e-ead1-424b-8221-fae37fdea2bc", "exact"),
                        Tuple.tuple("f7df6004-58c2-4e4c-bd86-e1cf564f8487", "f2e42af5-67a6-477e-82ea-e65b09cc6cb3", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathNrwSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(NRW_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(NRW_MATH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(67);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(18);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(49);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .containsExactly(
                        Tuple.tuple("779925c9-038c-4905-b049-de083db123ac", "65365dce-f33f-49d8-9516-42f75883aa86", "exact"),
                        Tuple.tuple("af088299-b91e-4391-b207-c67138ad64ac", "cf474eab-1379-4877-907e-58b0892ce734", "exact"),
                        Tuple.tuple("de1e6925-473e-46c4-8bfd-fdab0989f231", "4b67bed9-06da-40b2-a306-24e9e7dfd390", "exact"),
                        Tuple.tuple("ab9cf03f-8b77-446c-b920-6e424f4df612", "cafd6520-c4af-4109-9863-cc49ba6fad4d", "exact"),
                        Tuple.tuple("01f52928-45d2-4844-bce3-0004e8cedf30", "c9e01667-24c4-56a2-8cf4-dfb6c360d7b9", "exact"),
                        Tuple.tuple("475ad23a-258b-4ae0-920c-991ed0787897", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "exact"),
                        Tuple.tuple("d54b396e-653f-48c6-966d-cada189a84aa", "c1f50bcc-7848-4e49-b9de-0ec030cc6bca", "partial"),
                        Tuple.tuple("7f0633f8-c54a-443c-86a3-23a31a3dcbba", "aad80460-c4b2-4d6f-964b-01c80e7ec6f2", "partial"),
                        Tuple.tuple("04bed57b-31f4-4513-9c49-cfc168868d5d", "5d1decb2-b01b-5c85-88fc-9fc255ff9776", "partial"),
                        Tuple.tuple("d245975a-6af2-4d77-ae4e-186feb927612", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "partial"),
                        Tuple.tuple("bc628bd0-ae77-46b9-a80e-47bdc356d574", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "partial"),
                        Tuple.tuple("7514b55e-2fa7-43a0-896b-f65e95c0779a", "aad80460-c4b2-4d6f-964b-01c80e7ec6f2", "partial"),
                        Tuple.tuple("ac621b54-5023-4c00-818f-9c3c9562493c", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("26b7eb5a-9223-4407-a922-41de79aa379a", "792b3f32-4c13-423d-89c2-facb34827f47", "partial"),
                        Tuple.tuple("13693171-73a6-40ce-a289-09529143cedf", "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb", "partial"),
                        Tuple.tuple("527f56fd-3163-4845-b9e6-3ea75aa7ea96", "7dea79d2-67f2-4d92-b6cc-ad1b953dca3d", "exact"),
                        Tuple.tuple("5cf6e2fd-ce79-4a7e-b21f-fd5f68d97edc", "3babad6e-d860-40e9-8f69-0060bdeb4cb3", "partial"),
                        Tuple.tuple("b958a8e3-ff11-4cfb-b65c-184c73c00d99", "09f47964-2cd0-410e-93ee-9632b582fc91", "exact"),
                        Tuple.tuple("ca652aeb-4f91-4718-acaf-b1c398567abe", "c65ecabf-d00b-4e2d-99ae-b64692325ffb", "partial"),
                        Tuple.tuple("6d4fedfd-96b5-4237-aab0-74b9d60ea800", "a8c42ee9-2898-4247-819f-c235032ac78a", "partial"),
                        Tuple.tuple("0159a2d5-baca-4652-8515-350f7b853267", "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186", "partial"),
                        Tuple.tuple("cfadb2dd-a25f-4f83-bbf6-6df00bdd091d", "e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e", "partial"),
                        Tuple.tuple("890a6667-7cec-41ac-be6b-c7ed6121b0d7", "a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf", "partial"),
                        Tuple.tuple("25372707-8ba6-40c5-9d3d-2735ce8f58a1", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"),
                        Tuple.tuple("f02c5ec8-cb34-410a-bf5e-fb331b0a2080", "5bced7dc-6557-4af1-9e70-d87f850d3b7f", "partial"),
                        Tuple.tuple("ec6f0c55-6008-4792-b315-09918e7f7248", "2d75fd3f-c68b-4a11-89ae-19a30fefc47a", "partial"),
                        Tuple.tuple("bc765026-e158-4706-9550-1a9be4fc33aa", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("d342185c-0e18-41b3-ae4c-81baa9cac560", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("c1d6a313-813c-4fac-8d82-c792f595b14a", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("cbd61ee1-2038-433a-a93e-ae4708515187", "0c5ab1e7-1060-4d1f-b96b-4b1cb2f0a96f", "partial"),
                        Tuple.tuple("bfdfd5ff-1749-4579-af96-bb1fd4d0975b", "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb", "partial"),
                        Tuple.tuple("f43fd248-195e-4168-bf70-ce92f864738f", "88f8e185-a89b-4a34-869d-766042977f38", "partial"),
                        Tuple.tuple("688b5e70-8472-57e4-a0c1-c892490000e4", "ed631938-ad77-405e-ac25-b06d750b9c05", "partial"),
                        Tuple.tuple("56e68356-1a7c-5cb7-a031-fc4940697c74", "8e68f24a-8b0e-4ce6-9567-a49e706f83be", "partial"),
                        Tuple.tuple("431671e6-4b07-5b9f-9dd3-cf2d1e80194b", "ecce03e4-0082-41e1-95bd-0244e76ed292", "partial"),
                        Tuple.tuple("641811e9-b545-5797-aa8d-83175db31412", "ed631938-ad77-405e-ac25-b06d750b9c05", "partial"),
                        Tuple.tuple("009de949-cbf8-57da-96f2-31504aa642c7", "ca834a7d-5a66-4876-b24c-143b1464d937", "partial"),
                        Tuple.tuple("e163282a-0acb-59e8-a0d3-daa975a1725b", "d98849c7-bd0b-50d4-90aa-6293a3adb211", "exact"),
                        Tuple.tuple("4ef06a4c-3da0-5f99-864f-77bdec1b68d4", "25593605-5e13-55cc-9a05-8f3d737e15e9", "exact"),
                        Tuple.tuple("28c297ae-547a-5016-8e31-acc1a05b3f97", "c5d04810-c893-45e9-bf2d-ae0b4b4f2bc0", "partial"),
                        Tuple.tuple("7cc3b8ee-b402-5c9b-94e7-d58fa47dd550", "2331caf2-ccb2-5492-9fc6-48763b848bae", "exact"),
                        Tuple.tuple("a977db43-3784-5175-902f-91121ac197b5", "a569561a-49bf-4426-b1d0-7edd8554c2a3", "partial"),
                        Tuple.tuple("1132391a-f5a1-5af5-b8ed-4e5584d70038", "8e68f24a-8b0e-4ce6-9567-a49e706f83be", "partial"),
                        Tuple.tuple("87f2b7af-ab3a-539d-af00-5a13ec9bdb83", "fc047e6e-5d6d-460f-99fc-ade3a23b9a8e", "exact"),
                        Tuple.tuple("52d7fa9e-4937-55e5-9f5e-b0f816c23f49", "36728db8-da44-4add-97b8-0fdd7cfd9c41", "partial"),
                        Tuple.tuple("f31fb597-4091-5eeb-8a98-2de8176caec6", "f0a49da2-018b-4cda-adbd-27047b610a0f", "partial"),
                        Tuple.tuple("448645a7-c92b-5f8b-9bd1-24028b147e85", "f6ef3ce8-5264-4f43-a6e9-22f7f8ec8824", "exact"),
                        Tuple.tuple("aeacb33f-6bfc-509c-b10b-d633d2edadeb", "87c55be5-06a9-41e2-a0d4-c60f7c8b8078", "exact"),
                        Tuple.tuple("13a34627-237b-5c1b-b9b3-0cb8d91da151", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "partial"),
                        Tuple.tuple("a2f202f1-2b76-5812-ad7f-c0543e7a2124", "8064088b-dc0a-4a67-ad63-360fdcc9869d", "partial"),
                        Tuple.tuple("2aaaf1f6-ceaf-5fd7-b39b-6b388b9c8eb5", "5ecf51c3-07bd-44fb-9862-5f2e5f2a99d1", "partial"),
                        Tuple.tuple("72a10bf8-bed8-550b-829b-5a904db099ff", "e6d4e44b-0c42-4cd9-9b83-53e3885d2f38", "partial"),
                        Tuple.tuple("f4a62c39-0a2e-514f-9c42-7da1896c18a6", "71a483ba-9680-4654-bb5e-5ab5427f0919", "partial"),
                        Tuple.tuple("e0a80468-3e82-5d4e-ade3-fb804b47b0ad", "0cefa694-636e-4c4b-abff-3ac3750dca18", "partial"),
                        Tuple.tuple("eff200ff-8402-59ee-9809-97800768f06f", "728db43c-cf11-4fb6-b1dc-27e76573bcfc", "partial"),
                        Tuple.tuple("6fd8f178-8bca-51a0-a09f-35a5e7cda6d8", "a66c8d6d-8f3c-4e15-855a-019186e5eee4", "partial"),
                        Tuple.tuple("6844db7c-62e5-5410-85e0-565170f87d9e", "c7911f0f-83d4-44ba-9f28-bdc1a5e8cb4a", "partial"),
                        Tuple.tuple("75dd90ef-4c8b-5c8e-bdc6-fee3b66d2398", "728db43c-cf11-4fb6-b1dc-27e76573bcfc", "partial"),
                        Tuple.tuple("9d266916-5cb0-5a06-b67a-a2c5a770aa53", "91571d3f-3651-4477-ba21-320fc4077453", "partial"),
                        Tuple.tuple("3cda33da-b3c7-5653-9e32-161e83341cef", "075ef99c-7f84-48b5-97f1-4e28c7d78f95", "partial"),
                        Tuple.tuple("80294bcb-d3ed-5c11-9ee2-569d5ad644f8", "efc3506a-5f35-4d77-9498-d70a091a470b", "exact"),
                        Tuple.tuple("2e018d58-b501-59bd-9e93-dcd63fb4b436", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "partial"),
                        Tuple.tuple("fd0bfe6c-c03c-5c96-ae9e-e01947897a71", "e55edcb9-2184-4a24-890e-70cc91028990", "exact"),
                        Tuple.tuple("1186e72c-628a-51d7-ac91-6c3806d7029d", "acbb7e26-f85f-405b-a3e5-affa6add6711", "exact"),
                        Tuple.tuple("3e8ef701-37df-5b99-865c-fb6407ed8964", "50aeb801-d2b5-4939-b66b-2fcae0352dcf", "partial"),
                        Tuple.tuple("124e1adb-1076-5e48-8f04-2dd3c19fa72b", "c7911f0f-83d4-44ba-9f28-bdc1a5e8cb4a", "partial"),
                        Tuple.tuple("44c7ffd0-124a-55df-a606-a980d617157b", "3d8f5e4c-8f7b-49cf-bd83-1d9876db5bf6", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathNiedersachsenSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(NIEDERSACHSEN_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(NIEDERSACHSEN_MATH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(53);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(9);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(44);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("e1942eb6-f1a5-45a7-b160-c7be0b5e30fa", "65365dce-f33f-49d8-9516-42f75883aa86", "exact"),
                        Tuple.tuple("430a4b3b-1442-4542-a27a-5fe8726dc447", "f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97", "exact"),
                        Tuple.tuple("2c6d3275-ac7d-47d9-9de6-bbf2ad6b4d69", "2f565855-bcd6-4da5-bc80-4b72a2d93d50", "exact"),
                        Tuple.tuple("20f4e9dc-d898-45e2-b7df-eb89c9ee6195", "199fe2ed-2576-4611-b8de-fd56fb9f78fc", "exact"),
                        Tuple.tuple("08dbb0ce-effb-478c-be9e-d49e0651a618", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "exact"),
                        Tuple.tuple("90e973e4-0641-4a51-86dd-93aeaa351fc5", "4d78bbcc-89b8-47f0-aa45-516199e4da5d", "exact"),
                        Tuple.tuple("c14c321b-16fa-450b-ba7c-f5ec36f39e46", "f8704a7b-e93d-4e32-b0f9-1b171545fe28", "partial"),
                        Tuple.tuple("b5a7205b-0670-4511-8ba7-fd480da448be", "71a483ba-9680-4654-bb5e-5ab5427f0919", "exact"),
                        Tuple.tuple("3e8f4903-88f5-47f2-a4a3-4de43bc61f56", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "partial"),
                        Tuple.tuple("3ef0f5d5-6212-439c-9bdf-e9800d51c09b", "ef40a255-b6d4-4a1e-93b1-b79e65fb585d", "partial"),
                        Tuple.tuple("9d07bd0c-f19c-4c69-a480-c7b2a9a28779", "18eb8537-5d25-4252-9450-ea8c42270211", "partial"),
                        Tuple.tuple("ccb0bdf5-58e5-42d6-8dcd-2f71799ff9b8", "9023226b-fc17-412b-807c-2bb45cd551d5", "partial"),
                        Tuple.tuple("74f3c191-d350-4080-9610-93c6fbbdd7d6", "a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf", "partial"),
                        Tuple.tuple("04c1b6bf-bb7c-4318-a982-41814693081d", "3f3557a8-7d89-4f96-8a32-e24745c34d82", "exact"),
                        Tuple.tuple("52bd16c1-ce2a-46ac-a89c-8c41cc40bf9e", "c1f50bcc-7848-4e49-b9de-0ec030cc6bca", "partial"),
                        Tuple.tuple("0f2a3cbe-37b8-4701-a5f0-87a58241765c", "09f47964-2cd0-410e-93ee-9632b582fc91", "partial"),
                        Tuple.tuple("7ad51e84-1b5b-41e9-a0ec-854c11b45fee", "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186", "partial"),
                        Tuple.tuple("9856310a-23c9-4237-8243-0e19c6ede3d1", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("d3c99e6b-0e90-4b30-976e-0c037032e349", "0c5ab1e7-1060-4d1f-b96b-4b1cb2f0a96f", "partial"),
                        Tuple.tuple("cd5e0341-1b6a-4e75-aadc-a11c1272d1e4", "a569561a-49bf-4426-b1d0-7edd8554c2a3", "partial"),
                        Tuple.tuple("7d5a10af-ac76-4ebc-8d34-fb5358dfb3f6", "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb", "partial"),
                        Tuple.tuple("9dcde142-1bae-417b-b08c-999ce0a3e963", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("2390d3c2-5859-40b4-9819-4fcace9bbc02", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("44535000-5ace-49f6-bbf3-5b1118abb704", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("7b0ac262-c039-460c-a628-b9c37122cc7a", "728db43c-cf11-4fb6-b1dc-27e76573bcfc", "partial"),
                        Tuple.tuple("beb816fd-50b6-4938-a59a-d0fddd91a837", "1b02d4ec-acc0-4c5f-b3f3-5c3876c42654", "partial"),
                        Tuple.tuple("0802b695-822f-4fd3-9c06-a209328212aa", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "partial"),
                        Tuple.tuple("f026868c-54f1-47fe-9fc5-baebbdec525f", "efc3506a-5f35-4d77-9498-d70a091a470b", "partial"),
                        Tuple.tuple("b8e7eeee-4712-4110-9d77-72a8ae448720", "50aeb801-d2b5-4939-b66b-2fcae0352dcf", "partial"),
                        Tuple.tuple("1c0b4160-1269-4740-8f61-7130d0601618", "ed631938-ad77-405e-ac25-b06d750b9c05", "partial"),
                        Tuple.tuple("1bf645cf-7244-4182-8f0e-4d5603163c4f", "88f8e185-a89b-4a34-869d-766042977f38", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathBadenWuerttembergSek1MappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(BADEN_WUERTTEMBERG_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BADEN_WUERTTEMBERG_MATH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(101);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(13);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(88);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("1bec2c6e-b631-433f-b25d-7ea4db6ef68c", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("572f46ab-e5a7-471d-955e-a07aa7ae6a72", "65365dce-f33f-49d8-9516-42f75883aa86", "exact"),
                        Tuple.tuple("332b3bd1-afc0-4266-a977-49ef0843e5b1", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "partial"),
                        Tuple.tuple("73c424f2-f564-477b-bce5-d8aa9d2adf78", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("b92035f8-8791-4c99-a878-9f93a87e85f7", "8f7bb79b-f014-4bb6-8dce-7e3f1c92e893", "partial"),
                        Tuple.tuple("ad1ed851-c2bf-4350-82de-d4664eade277", "88f8e185-a89b-4a34-869d-766042977f38", "partial"),
                        Tuple.tuple("5b8ce056-99af-4bc1-87bb-481a09bef876", "d64516eb-9dd2-4808-91d0-0040ccdc281f", "partial"),
                        Tuple.tuple("609b2753-d996-4314-a77b-0c16acd3260d", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"),
                        Tuple.tuple("fda87c17-1522-4764-b3ac-743c5331c03d", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("0f0ce9be-b4fb-4ff8-9c00-8fceec417444", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("d45b4ec2-8604-490e-9c11-d3b8fc54251b", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("c2cb2ba0-f7c0-4a2c-b45b-2b99da1d85ab", "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb", "partial"),
                        Tuple.tuple("583d3503-4a0b-48da-815c-d00bc0152fff", "a569561a-49bf-4426-b1d0-7edd8554c2a3", "partial"),
                        Tuple.tuple("eab578ea-8d2f-4a34-89ac-2a409cdf8226", "8e68f24a-8b0e-4ce6-9567-a49e706f83be", "partial"),
                        Tuple.tuple("78c4ce93-d8bb-4a8b-901f-c9906485f60f", "a66c8d6d-8f3c-4e15-855a-019186e5eee4", "partial"),
                        Tuple.tuple("a7840b04-88b2-4f2a-8f94-8a75e0a27200", "c1f50bcc-7848-4e49-b9de-0ec030cc6bca", "partial"),
                        Tuple.tuple("52b15961-33be-4ee9-97ec-1911dc982910", "09f47964-2cd0-410e-93ee-9632b582fc91", "partial"),
                        Tuple.tuple("95bee2cc-cdb0-4611-8bc9-36f6263ea417", "a8c42ee9-2898-4247-819f-c235032ac78a", "partial"),
                        Tuple.tuple("eca22013-61e3-4fad-a771-fa4e224fe1d5", "af3d6bff-c5fb-4ec6-a9f0-c0be09fc9186", "partial"),
                        Tuple.tuple("72041e85-2d03-4a3c-862c-57ebc79e9dbb", "ae772695-d55e-4cc5-81bc-6605272759b4", "partial"),
                        Tuple.tuple("9cb473f6-06f0-4fa3-9bf1-34445aa58551", "2d75fd3f-c68b-4a11-89ae-19a30fefc47a", "partial"),
                        Tuple.tuple("57e5d7b8-eac3-4ee3-a496-c61e0c2667b7", "325771e1-602d-4bca-a199-a8f39a2d3dee", "partial"),
                        Tuple.tuple("665d6a1a-a732-43cd-80fb-b60cfbad1e89", "0a154cbd-1218-4553-835c-a754e9901bba", "partial"),
                        Tuple.tuple("8a5098e9-4455-4ee7-be6c-0a08668b5ea7", "8a0b0baf-c7e6-43df-a470-f56050ecaa46", "partial"),
                        Tuple.tuple("74e28638-39fb-47e3-a447-3c37d66f436d", "9023226b-fc17-412b-807c-2bb45cd551d5", "partial"),
                        Tuple.tuple("6a81140f-55fb-49ba-a277-df4d4bd4e074", "546bf0b3-6921-416b-a2ef-8fd37d429dc7", "partial"),
                        Tuple.tuple("b0f8a598-5858-40d7-8c5d-270426de9a74", "e6eb42c7-454f-49bf-b598-64d2935d2735", "partial"),
                        Tuple.tuple("1eeb1ea0-cd04-488f-82f3-cefadff5b53c", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("d09486f6-f097-4582-ad99-e82e37b9afe6", "f0a49da2-018b-4cda-adbd-27047b610a0f", "partial"),
                        Tuple.tuple("3df78b4c-c23a-46fd-8046-753fd9a0926c", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "partial"),
                        Tuple.tuple("43bcccb1-27f7-4779-9b28-de1a02d17d01", "1b02d4ec-acc0-4c5f-b3f3-5c3876c42654", "partial"),
                        Tuple.tuple("54ade724-7473-49e2-9a39-0405be6e8a68", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "partial"),
                        Tuple.tuple("c4cdc49c-8b49-4a82-9bb4-abae85d08cf9", "ed631938-ad77-405e-ac25-b06d750b9c05", "partial"),
                        Tuple.tuple("85d737c1-3edd-4525-baf8-b81be9bacc2b", "728db43c-cf11-4fb6-b1dc-27e76573bcfc", "partial"),
                        Tuple.tuple("5ff24726-957b-4bd1-95ac-c05f2cd7fa5a", "ed631938-ad77-405e-ac25-b06d750b9c05", "partial"),
                        Tuple.tuple("286a5ac0-d9ed-4d64-8ddd-51fb2238e35d", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("8bb23e8e-0bdb-48d5-8036-04871cbb8f05", "71a483ba-9680-4654-bb5e-5ab5427f0919", "partial"),
                        Tuple.tuple("7f0c399e-eed6-468d-bc31-d08624e5cb69", "415bd48b-8a76-4d4f-bfdd-d085573e7ac3", "partial"),
                        Tuple.tuple("1c95ad04-87d5-45c7-ba38-6945e943fb2a", "74d29d0c-80b3-4d46-a5f5-3c2f609e8483", "partial"),
                        Tuple.tuple("98d778f1-0e0b-4d88-a031-29019d8b34e7", "219ce079-6bfd-4827-8b66-5dd199e44686", "partial"),
                        Tuple.tuple("fd397325-2a81-4663-8436-d111decc717b", "9710e996-f6d0-4b8b-b893-592213c91767", "partial"),
                        Tuple.tuple("f122ce22-a84c-406b-bbd0-5435154510cb", "a4f6f5e4-f790-48d1-8b49-c9dc048c9d83", "partial"),
                        Tuple.tuple("8e08950a-bc78-4dc2-947d-7aa575076655", "9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5", "partial"),
                        Tuple.tuple("7c5598d1-7282-4922-a9ae-2c3f552e8d99", "1ea06c0c-5c60-45cd-8f31-638de98820b4", "exact"),
                        Tuple.tuple("6c3ec1db-059e-452c-9829-fb0ba6b968ec", "aad80460-c4b2-4d6f-964b-01c80e7ec6f2", "partial"),
                        Tuple.tuple("ee9c8840-2e44-4c1e-80dd-4e70ae77f104", "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb", "partial"),
                        Tuple.tuple("5f5499eb-d53b-4348-b0c1-0ccca4642207", "289db903-2831-45ef-afc2-c0619c91d680", "partial"),
                        Tuple.tuple("d437c65f-902a-4138-9b3c-b7e3d66d8c70", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"),
                        Tuple.tuple("aa406778-ec53-47c1-9437-404a669ae63f", "dd550132-2a3f-5b4e-a3c6-f940621186ac", "partial"),
                        Tuple.tuple("8de4eafd-63d4-403b-8e47-46b9ad0ce2d1", "67ef9787-d540-5f30-9995-f1f9c39a1a45", "partial"),
                        Tuple.tuple("de7051a6-6401-4c04-b588-f7f2f69a8478", "508292f2-671b-4fd3-acbf-53d705e44693", "partial"),
                        Tuple.tuple("25bc86dc-6329-40a0-9c1d-ec846d6fd929", "dabff49b-d40a-4c81-a584-21408b2d4219", "partial"),
                        Tuple.tuple("abe38788-1e88-4f17-bb31-e4564ebc285f", "da95ab35-bac2-54f2-b38f-8b612cde8b54", "partial"),
                        Tuple.tuple("de3016f9-490c-45e1-b9a7-0d3b37a373b4", "34735a1a-c9d9-5378-805e-b48f9c2d947f", "partial"),
                        Tuple.tuple("720a367c-0e5e-47cd-b4ec-808e07f765f4", "837b015a-c2a2-5f31-831c-ae16ee2ee6ce", "partial"),
                        Tuple.tuple("1d3affbe-5453-4188-9a61-28446b64da17", "42d300e3-e982-5889-98d7-fc297f10eff1", "partial"),
                        Tuple.tuple("8ba195f9-76ba-4e50-8c87-b0fb9d5ec7fa", "7d41b805-0fd8-5ac3-980d-79112a27c1b4", "partial"),
                        Tuple.tuple("ce637779-a106-49ab-b073-829796a45de0", "6596405a-9728-41df-9163-53670ec2a937", "partial"),
                        Tuple.tuple("1540732d-b74e-4762-b474-692fd45f3247", "66077296-a8f8-4645-938b-7c3424cb2f14", "partial"),
                        Tuple.tuple("9f559636-9383-4ffe-87e6-7dac403ba27e", "d8c9eb57-1614-4c1d-829a-618134def352", "partial"),
                        Tuple.tuple("ac0cd912-4b08-4e94-83e5-92d6ce122c05", "42e19186-6769-41ac-a7bf-ab39bdb50661", "partial"),
                        Tuple.tuple("253a59c7-ebf0-45a7-85c4-a62547ab1e5a", "5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11", "partial"),
                        Tuple.tuple("84a1ca7e-1fb5-40ca-a60d-760d5b0d1e22", "78bcc25b-e48c-471b-9236-6c3b23d48a8b", "partial"),
                        Tuple.tuple("47e1e733-de23-4120-bcab-cabc1427ff79", "7156558c-57f1-4372-9ba7-0640c3f7cb3a", "exact"),
                        Tuple.tuple("12adfa53-f4a7-4908-8a6b-3fb49262fc6b", "9f2fc0d1-e1e7-4051-ba70-87ba1dd8dd1c", "exact"),
                        Tuple.tuple("3eb6b0db-af4b-4072-991f-81c9e7644257", "1a18dbb3-f350-4766-9c8b-20ca018ccef1", "exact"),
                        Tuple.tuple("875691d3-8df2-4980-9694-760b7fb69c4a", "b43a1e45-f05c-4d78-8453-f6fa677dc24c", "exact"),
                        Tuple.tuple("2ba03f56-61d4-4735-8c10-805e929fe93d", "f9fdb733-5838-4983-888a-05624eabbe17", "exact"),
                        Tuple.tuple("91142067-0be0-4bd3-951a-0610f67207d9", "6fd35cc4-c375-4e58-b6f1-5382d8422906", "partial"),
                        Tuple.tuple("97bc16bc-bc64-48b8-8217-8a74c8bcc296", "94b48b93-473f-4bc5-8c93-8c1a5e2cd1a6", "exact"),
                        Tuple.tuple("4122e400-b048-4a10-a396-08ff5348b610", "57f6d5e4-7c24-4e70-9cf6-737f01d79914", "exact"),
                        Tuple.tuple("f04a65b1-915d-4842-b938-9c8b2d049b60", "a8ff2666-8df3-4253-8021-3efe42114e40", "exact"),
                        Tuple.tuple("10ddff91-ce1f-4d50-ba3b-e8682632f4db", "235ae698-369f-4dbe-b46f-87e8b65bb03d", "exact"),
                        Tuple.tuple("2673c5be-0d1b-4821-8b7f-54053d62be82", "b025df0c-994c-4807-9c5f-2d548905b73f", "exact"),
                        Tuple.tuple("f38a028f-ff36-40a9-88ea-7381fecebd90", "ba343971-10e5-4b05-b005-405b9c1ce447", "exact"),
                        Tuple.tuple("3ad03fd2-d542-4e0b-9c7a-6ca30dd7afad", "624764d6-becd-5f9b-ada3-0d4f9d143073", "partial"),
                        Tuple.tuple("6fe045f9-edf6-4c4c-8962-2c47de192a15", "f2d4a7de-57c3-5749-bbb4-6cd4b57b7562", "partial"),
                        Tuple.tuple("bd59aec0-5af5-49b2-bcce-6ebe98e25c86", "f2e42af5-67a6-477e-82ea-e65b09cc6cb3", "partial"),
                        Tuple.tuple("739b783e-a763-4a02-a958-b959898f5d96", "d98849c7-bd0b-50d4-90aa-6293a3adb211", "partial"),
                        Tuple.tuple("2eeaf455-e449-4f1b-8859-2d55b315d038", "91571d3f-3651-4477-ba21-320fc4077453", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathNrwUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(NRW_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(NRW_MATH_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(100);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .containsExactly(
                        Tuple.tuple("8fe81d64-ff44-46cf-964b-3312ca6dfa28", "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2", "exact"),
                        Tuple.tuple("ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81", "30c013ac-5164-4c3c-8bc1-9a10b2f49533", "exact"),
                        Tuple.tuple("fb1eebf2-3d5d-40a6-a0e5-879bb7d4f422", "1ce8af38-082a-477b-af48-b924c92761bf", "exact"),
                        Tuple.tuple("22e2cc01-be7c-4478-8d22-0409ff5b14a0", "7a28dc26-0f05-4d58-a1f0-76f64c19f0bf", "exact"),
                        Tuple.tuple("4b513ab3-0505-48ad-86bc-348c441d7a8a", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("5e27ba51-5540-4de9-b6bd-bcd46605260c", "6b3e75b2-fbfd-51c1-9e02-e9b9f7080d44", "exact"),
                        Tuple.tuple("3962cc81-a5b4-4db7-876e-1396bfd77dac", "075f1ef2-6860-4b20-9df2-878157eb395e", "partial"),
                        Tuple.tuple("d42ed7e0-690a-4aa6-bdea-a168fce8ad7f", "525b1da9-7fdd-4a70-9f30-ff01d7511b04", "exact"),
                        Tuple.tuple("6bc7445a-5d1e-4386-816b-566eb990f6a0", "69beb31d-5d02-4505-9500-3ec81af86f1e", "exact"),
                        Tuple.tuple("0527926b-5904-4bc4-9044-7ba4f2e3cc8b", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("7b5a157c-5d30-4f26-ae6b-35e3c156cde4", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("1e944a03-990b-49f8-8304-58c40ff3ac14", "9460c3ff-e72d-4107-bc73-087d217200aa", "exact"),
                        Tuple.tuple("8bcdb737-6121-4b5a-982e-06d87abba7c3", "ed62ab23-4991-52e2-93fc-a1052fd0063a", "exact"),
                        Tuple.tuple("ca613a95-4d20-43c7-9fab-0f1e22be2fe9", "06de364f-9b63-4044-8229-a975621dc6df", "exact"),
                        Tuple.tuple("c84d49e3-6626-4149-a351-26ac92500ee6", "baf7276f-60a0-4d96-b959-d63acfb929de", "exact"),
                        Tuple.tuple("61dd1254-898f-4b4b-9a5e-6ec20774138a", "18be713b-7d90-4f01-b60a-5582ac4df0e8", "exact"),
                        Tuple.tuple("42de8784-043e-43c6-af4e-dfed3ed0a655", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("547dee54-d84f-49ef-a1d4-1947c114b6ec", "d785943c-d61b-51a1-a9c2-c36a9e0cc97d", "exact"),
                        Tuple.tuple("e714f54a-190a-456a-9610-a5bfe11aceda", "f613634b-39fb-5021-9970-790ef34c9932", "exact"),
                        Tuple.tuple("f89a7279-3bd4-494c-8506-b21fcc8bd2bf", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("22a06cd8-7995-47b7-9f4b-95c637685b1e", "ed62ab23-4991-52e2-93fc-a1052fd0063a", "exact"),
                        Tuple.tuple("bb58b9ef-5bb9-40e9-90e8-eccb4d2077e2", "0f4f9957-8afe-4aab-9dd8-c26c9aee2afd", "exact"),
                        Tuple.tuple("d1ddfe3e-7b56-4f07-9457-e8e0f4a9c02e", "baf7276f-60a0-4d96-b959-d63acfb929de", "exact"),
                        Tuple.tuple("8ddec0a9-d7e9-4eca-8473-588b63fc29d5", "57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5", "exact"),
                        Tuple.tuple("639ffae1-7133-4eb6-9730-7541c544572a", "fac75b4a-4ec2-5d38-bbce-9b002c8a4904", "exact"),
                        Tuple.tuple("ef524e6d-7d87-480c-8633-e3f56df43ff0", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("0ac97510-3158-57dc-9fe0-f8a0a9596c05", "8cb5c712-9c58-5910-8c63-8c3736369b80", "partial"),
                        Tuple.tuple("06645aa7-fac8-5bca-a48f-5c350d281156", "8cb5c712-9c58-5910-8c63-8c3736369b80", "exact"),
                        Tuple.tuple("2f008c08-4bd9-4341-bca4-57f99fc46216", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("43e208cc-c385-5d15-81d9-a358e52257ab", "dd550132-2a3f-5b4e-a3c6-f940621186ac", "partial"),
                        Tuple.tuple("de8694f1-00a1-53b5-9da6-3a73c529179e", "0408ac7f-0530-5de5-b248-cf581c9b5a17", "partial"),
                        Tuple.tuple("101ab503-e86d-587e-9857-d88b0ddb5ad3", "1462c189-8679-5f32-bf58-6e81e99e4635", "partial"),
                        Tuple.tuple("8e485153-e1b6-5f91-8b33-a48253e1c6c7", "71d1fd4d-8471-5f25-94a0-4c531a74783c", "exact"),
                        Tuple.tuple("294d9db1-3dd0-5a44-8b7e-a2d05b1d88cd", "4ac925cf-3862-4810-be2a-d92efff7d735", "exact"),
                        Tuple.tuple("738d1fc0-24b4-506e-9920-914fa9e99b66", "d81bc960-4eff-5c87-90b8-fec8e1cb8b3a", "exact"),
                        Tuple.tuple("7718ad42-f3d8-405e-ae40-6c544aef5220", "f1a95baf-b91f-44db-bcb1-70a4d2e3f7d1", "exact"),
                        Tuple.tuple("1d38f454-495c-4ec9-ae52-4aeda8cec524", "f1a95baf-b91f-44db-bcb1-70a4d2e3f7d1", "partial"),
                        Tuple.tuple("bcec7423-8af4-5520-af8c-3b12ae570dd5", "2a1158e5-d4ca-51d4-860c-f43bd5a86836", "exact"),
                        Tuple.tuple("2af87c49-be30-5fd0-86a1-3f18f3736390", "52e57eb5-7cd1-5df0-a8c6-7b090f097d9f", "exact"),
                        Tuple.tuple("b6b710d1-1356-472c-9cb3-4c3b11a126e6", "dabff49b-d40a-4c81-a584-21408b2d4219", "exact"),
                        Tuple.tuple("ae506288-1567-4786-98bb-d4316ed38e99", "508292f2-671b-4fd3-acbf-53d705e44693", "exact"),
                        Tuple.tuple("16294415-5ccb-4422-9b8c-00eb1fc8049e", "187c1bef-57bc-4a93-a26b-04191879626c", "exact"),
                        Tuple.tuple("49de95ca-6154-45a4-9b93-8f844ce84cda", "d711bc18-c27c-4739-8289-edac53dc8ba3", "exact"),
                        Tuple.tuple("9ad9a558-b673-45e1-b27d-f077b483d628", "9dfd0e4a-d7ea-5ce2-906e-678f0cf978b0", "exact"),
                        Tuple.tuple("7c71314c-610d-45b2-89be-1a20fbe43ce6", "6053aeda-84f7-4c2c-98d7-1753a7e26dcc", "exact"),
                        Tuple.tuple("55a6ec39-5a3f-4e20-9c02-9ee05c4a74dc", "42d300e3-e982-5889-98d7-fc297f10eff1", "exact"),
                        Tuple.tuple("3657fc37-fced-4147-a468-a70b1654faed", "66f432e9-22d3-51a9-8787-35f91db30616", "exact"),
                        Tuple.tuple("14e62dd5-ebcf-4815-b5f3-f22efe564eeb", "4af3fe2f-851c-520a-9a1d-b8036ac1dbb1", "partial"),
                        Tuple.tuple("d16b03c5-be1b-40e5-93d7-7cb17a435d56", "f85419c4-63ac-5d6d-b73b-fcb12a0ff89f", "partial"),
                        Tuple.tuple("725bb031-423c-481e-95b1-e9efd98cce2f", "5f328147-619c-568d-9a0d-e1787ca0c01b", "exact"),
                        Tuple.tuple("7c26b244-40bf-4694-8e6a-d5e2e8a1bd99", "410221ed-540c-5daf-8c42-d8dd12e9100a", "exact"),
                        Tuple.tuple("91df70b1-c66a-4967-afe4-3b5347f5b05f", "35e14223-54fc-5ec1-ae73-ac9f13b07db2", "partial"),
                        Tuple.tuple("56dcdcec-4ad2-4ca0-94b3-461ed1e9dac1", "c92133c6-d5de-4902-936c-321915cf21e9", "exact"),
                        Tuple.tuple("c6a14b58-da80-4a6d-9ec5-6338d3cba6a5", "b431148b-526c-4bde-b04b-48d23101d0d3", "exact"),
                        Tuple.tuple("b85792fc-2a99-4a02-8285-828362063d6c", "7d9c565c-8df1-40ca-b3c6-2d4ec51e9140", "exact"),
                        Tuple.tuple("0c1195ec-efe3-4d68-9219-e46a807c802d", "ae20183e-92b5-5521-b8e0-9a8662cf51f5", "exact"),
                        Tuple.tuple("3d1a8d83-27a4-4a0d-b8e0-c738f274d4bd", "2143e9e8-b176-545b-b2fa-91bbb6c8cf5c", "partial"),
                        Tuple.tuple("c3791879-8901-443a-ac91-bf9cd712b38e", "b1dcc191-d046-50de-984a-ee5c17157628", "partial"),
                        Tuple.tuple("c876c75b-dcc4-426e-be0f-15698add835d", "845440ce-f63f-5835-903f-739145ca27bd", "partial"),
                        Tuple.tuple("0c3056ad-ee56-49e8-aff4-fabcae51eb98", "858113c5-e53b-57bb-b01f-ba95c3ddcb6f", "partial"),
                        Tuple.tuple("fd54f82d-0846-4277-ae97-b3964fb41de0", "350fc8b1-ead0-4239-b28a-217cbd3bd1c3", "partial"),
                        Tuple.tuple("53563e97-253b-4f3c-8911-d1ec1ac1edb3", "b3604df4-15a8-41c8-a8b0-50dadd698bd3", "partial"),
                        Tuple.tuple("c714c662-b476-4945-9352-e62869770bed", "528cab0b-399d-4d4b-97ea-c32733eb821c", "partial"),
                        Tuple.tuple("ef475a7e-a647-4140-bad9-304ca3a53ef5", "1511b39a-4094-5450-a755-4a3ad3339733", "partial"),
                        Tuple.tuple("99e37d46-3b0c-4989-b8a8-c8a72501fc15", "71683f37-24de-4e0f-badd-858b56fa4d64", "exact"),
                        Tuple.tuple("1b742861-ac55-4a6d-bd84-71ed6c291eda", "fec30a5a-835a-4932-a436-d83549029486", "exact"),
                        Tuple.tuple("70705293-c65e-4a96-b771-5b9883e1d17d", "8fa32a68-46eb-414e-8292-a4c4052b2522", "exact"),
                        Tuple.tuple("aa3e0764-3046-47c1-aa9b-35a144cf02d6", "3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb", "exact"),
                        Tuple.tuple("85be691c-c569-4cdf-b332-b9d77d47666d", "c15fe32d-1c83-4127-b1a4-9125af3d8f5d", "exact"),
                        Tuple.tuple("e0c4432f-fc34-48c2-84d8-0e998b978500", "dbc13bb0-963b-49a8-a441-2183f4b64c8e", "exact"),
                        Tuple.tuple("8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b", "91e2f564-3bc8-4924-af85-2a3fa84c1471", "exact"),
                        Tuple.tuple("d9121fe6-058a-4ab8-a8ce-68d6eefea520", "899ed286-0cc2-4d6d-ba46-7d4e40a11f41", "exact"),
                        Tuple.tuple("43b21038-8dbb-4f85-ab8e-898a9cef38fb", "6aed5be9-f62f-482a-9b98-4253c3275e6e", "exact"),
                        Tuple.tuple("71539804-c722-4fe6-bc71-e4e2abe1773f", "269675a9-13cd-4a3a-ab75-63794f5c9710", "exact"),
                        Tuple.tuple("5b7ada45-c947-48af-b975-13548091cf2d", "23c8b5f9-ab35-4071-a3d4-b76a669a0995", "exact"),
                        Tuple.tuple("371359c2-6e29-4863-879f-d53b044204ce", "9441bb35-2a2f-4edc-9d8a-bc58c257054d", "exact"),
                        Tuple.tuple("18a7ac50-2fb1-4b2a-9eed-3f7f290bdb69", "b559e2ea-60ef-4b3f-a37c-669b867ace29", "exact"),
                        Tuple.tuple("de62f8db-076b-4849-b742-f14408292fd0", "8675a3d8-9aaa-4f35-b4ed-383d1c93ea24", "exact"),
                        Tuple.tuple("fbbdebe3-b945-48d6-a0d4-1c7b33d3bbb4", "31be24f0-3ab1-54d2-856d-fa9b7f36552f", "exact"),
                        Tuple.tuple("a39a1fb7-bf12-4d5b-8d73-1aafd5b18e19", "649b673c-1a74-5dc5-af01-b4c9e090b90d", "exact"),
                        Tuple.tuple("df210bbb-749a-40ff-841e-c2fded9cca31", "e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd", "partial"),
                        Tuple.tuple("29604321-22f8-5259-8b64-672ee142c25b", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("c4c8f1e4-ab8d-5709-a592-24864b7fc859", "23c8b5f9-ab35-4071-a3d4-b76a669a0995", "exact"),
                        Tuple.tuple("b0a122e9-027b-5a29-ad78-5deea4de53a3", "e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd", "exact"),
                        Tuple.tuple("173acc48-3aec-5833-ac1e-7f1dfa1c3cbb", "bfc2bf06-9b37-4912-a8eb-25fb5d489d72", "exact"),
                        Tuple.tuple("b1f131d2-844b-5ff1-a674-39d2d533a216", "19481f5d-94de-4a74-b765-cbebd1525994", "exact"),
                        Tuple.tuple("5c521d80-f9d3-56f1-b284-c09e3a1bf33b", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("b3b8d1f6-123f-5209-ae6f-2dc0c1322556", "ced4f794-9b42-4be4-bde5-7d44f134a140", "exact"),
                        Tuple.tuple("61304725-35ea-5245-9454-16c827545c8f", "31be24f0-3ab1-54d2-856d-fa9b7f36552f", "exact"),
                        Tuple.tuple("1ea6c233-b333-5854-bec1-36b4cba577e9", "3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4", "exact"),
                        Tuple.tuple("207160c0-e810-5f31-8b82-03d2d4102d37", "649b673c-1a74-5dc5-af01-b4c9e090b90d", "exact"),
                        Tuple.tuple("54d2c225-f931-4ba7-ab9e-0d9055820c09", "6fc51848-6705-532f-9dfe-2070bef2f9ad", "partial"),
                        Tuple.tuple("3ad7040a-095d-4356-9972-2403cf0967bb", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("3c33eb29-3c7f-4980-acd7-e8e917eccc29", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("3ae0f88b-3dcb-462f-a909-b46b1fca49e6", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("06ef6e21-0c8d-41b8-b08a-b266ec5e7d9a", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("31305eea-edf2-41b3-b312-bb1bc92f8fb7", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("a429a190-e7c7-4584-8ff6-2c5e6559b6e5", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("7abaddf3-772f-4546-aa29-1c476fc4134b", "ce774aad-edd7-4f86-a431-6ca921b8e570", "partial"),
                        Tuple.tuple("cc57ef8b-b0a6-4a42-b82d-92433e0ad227", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathNiedersachsenUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(NIEDERSACHSEN_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(NIEDERSACHSEN_MATH_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(165);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(9);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(156);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("250ba641-b2a1-4717-9a27-4ee0e6aa83c2", "ae20183e-92b5-5521-b8e0-9a8662cf51f5", "partial"),
                        Tuple.tuple("234dde5d-cc9d-4508-af9e-092e614ea304", "2143e9e8-b176-545b-b2fa-91bbb6c8cf5c", "partial"),
                        Tuple.tuple("6c021ee2-f600-4977-a4a8-877ece6c8c3b", "b1dcc191-d046-50de-984a-ee5c17157628", "partial"),
                        Tuple.tuple("d1ca482c-4184-464f-a057-2d61ba077803", "845440ce-f63f-5835-903f-739145ca27bd", "partial"),
                        Tuple.tuple("21411df3-4671-4ab9-b03d-f7790ecc9e4a", "848af536-c7e5-4df0-a4e9-d5d0ff15244c", "exact"),
                        Tuple.tuple("e28ce2d2-2853-4c90-b827-956878f46f79", "3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb", "exact"),
                        Tuple.tuple("ebe6fbe1-3a31-4b9b-a08f-6cfc2df4506f", "c3c057a3-caf9-44a5-ae60-639e3119e94a", "exact"),
                        Tuple.tuple("5f0418a4-b162-4811-8b2c-5c71c1935866", "3a5bf7e5-aacf-4666-b4fa-9868a1e6fcfb", "exact"),
                        Tuple.tuple("5a1b268d-bc78-457e-9948-c4e5fea55b67", "c3c057a3-caf9-44a5-ae60-639e3119e94a", "exact"),
                        Tuple.tuple("8f345568-a502-4acb-9618-2ba42a939212", "ccd83f05-a0ae-4cd1-8917-24793a219fee", "exact"),
                        Tuple.tuple("d3ea1cd8-6e70-4d85-88ad-0fe17f0b23bf", "886caebc-a042-4a94-91f9-6dc184203c42", "exact"),
                        Tuple.tuple("5b284b66-f417-4366-8685-012ae000b3b1", "858113c5-e53b-57bb-b01f-ba95c3ddcb6f", "partial"),
                        Tuple.tuple("23e03002-37c4-4268-ba3a-ddcdffc2e666", "0264591c-fdd7-41c6-9fb9-7cb3a03f7658", "partial"),
                        Tuple.tuple("22074d55-5227-4487-9fcc-4bc5dcec970e", "350fc8b1-ead0-4239-b28a-217cbd3bd1c3", "partial"),
                        Tuple.tuple("d3e91530-938e-46c9-b0de-55bbae83e5a0", "b3604df4-15a8-41c8-a8b0-50dadd698bd3", "partial"),
                        Tuple.tuple("40d5b2bd-1e2c-4c9d-9b43-5a73110e13a5", "d900e0a4-0c45-50dd-a37b-01f9f91a134c", "exact"),
                        Tuple.tuple("270b0f43-623c-413c-b7f1-eb690079ad8d", "1511b39a-4094-5450-a755-4a3ad3339733", "partial"),
                        Tuple.tuple("dc0170c6-bbe8-48e4-98da-1f609023d216", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("6aa63fbe-6b48-41ae-a650-7d80074c5a94", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("dc54c62a-2537-4b5f-98ab-84b33a2cffd0", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("c5ada0d0-1dda-4606-bcd6-75256a4e663e", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("d7d7969f-4adf-493d-87dd-516ef01ea7e3", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("793520e1-48e4-433b-8552-6b3e92aabd70", "213c3e11-3e8d-4db7-a04e-3a05c13304a5", "partial"),
                        Tuple.tuple("d5c7783c-3f21-4cdc-bd1a-96f82935226b", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("b02168d7-690e-4aae-852c-48774e829fe5", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("a668d4d4-69ab-4317-82f8-9aa28153ccd1", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("c5631617-ff7d-49ac-bb8a-94f295039915", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("1a1a1fac-b3ac-4a30-89cc-6ee283c87cbe", "213c3e11-3e8d-4db7-a04e-3a05c13304a5", "partial"),
                        Tuple.tuple("fe598333-6c43-4518-be0a-51ad412e8353", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("f3c60cea-3fd6-4120-819e-578e33a029f8", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("6fc360b2-8b1a-40da-815c-46fd0ac29c17", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("c3ab2545-c054-40c5-91be-b122a2d6d69f", "c89ba738-4b7f-459f-b060-83fe1c01f91b", "partial"),
                        Tuple.tuple("349755d3-03b8-4125-9416-a245d60ba61e", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("03e55d0b-24a6-483c-b38a-a6438ff02106", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("6a7ec1c1-f295-465c-b50e-c386afc7fe99", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("c995589b-bc17-4c71-9d4d-5db7afac0acc", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("9e83365d-01e0-4067-9d38-79e7b1b74609", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("63015895-1473-49fe-bc2a-6f7525111d90", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("a84e6bc9-f1da-4b3d-ab73-ffd9a702ab33", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("e7e97cd3-d923-404f-ae4d-996e3cdad3c2", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("a982c8bf-c3cd-41ae-8c6b-e5dca0ceb808", "6fd35cc4-c375-4e58-b6f1-5382d8422906", "partial"),
                        Tuple.tuple("1ab5aa53-ec44-4cfe-a1c1-9a1c91e07677", "ce774aad-edd7-4f86-a431-6ca921b8e570", "partial"),
                        Tuple.tuple("0a73cb8c-2e34-442f-8dc0-016847f4d724", "ce774aad-edd7-4f86-a431-6ca921b8e570", "partial"),
                        Tuple.tuple("ffd46419-e496-4f06-a6f0-70ab37aee958", "6fd35cc4-c375-4e58-b6f1-5382d8422906", "partial"),
                        Tuple.tuple("0901faa2-94b8-4701-a4c8-e48cea011a50", "ce774aad-edd7-4f86-a431-6ca921b8e570", "partial"),
                        Tuple.tuple("d6f34105-f627-43cc-a944-c6dc74ceb51b", "ce774aad-edd7-4f86-a431-6ca921b8e570", "partial"),
                        Tuple.tuple("ac68fb30-e742-4ac8-8073-42de9e8bf5f0", "213c3e11-3e8d-4db7-a04e-3a05c13304a5", "partial"),
                        Tuple.tuple("0d271a5b-5f2e-4080-8783-1f9952279637", "44dba16e-2e86-56be-974b-a62093ef9211", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathBadenWuerttembergUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(BADEN_WUERTTEMBERG_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BADEN_WUERTTEMBERG_MATH_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(89);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(23);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(66);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("f84004f9-0987-40f4-88dd-830c039b7bf6", "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2", "exact"),
                        Tuple.tuple("e0769810-ba73-4a52-8e9c-660d1fb9d6e6", "628928a6-4f48-54dc-952d-dec0e69dc856", "partial"),
                        Tuple.tuple("7bf62048-84ba-467f-ba23-f053c4e2989f", "a9ed219d-d497-55e5-a4e0-4d45d2554f6b", "partial"),
                        Tuple.tuple("46690ab9-0b1f-4bd9-9409-4976a40c6ec2", "e9ad45b9-c0d2-5804-b6bf-79e5ce041d2c", "partial"),
                        Tuple.tuple("c5739dd3-a261-4229-aff6-678d8ee618b3", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("13e285f3-522c-4eae-9fed-8b13b2af7b7d", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("34ee3898-2b07-4096-adbb-9cc4bd6db065", "bb25e25c-173f-463f-b602-2687d3ebf66f", "exact"),
                        Tuple.tuple("8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("8c12f6ea-154d-44ab-af4d-4de8c5c325c7", "d900e0a4-0c45-50dd-a37b-01f9f91a134c", "exact"),
                        Tuple.tuple("8d7a8269-f56d-483a-b733-a0f50e257b49", "0f4f9957-8afe-4aab-9dd8-c26c9aee2afd", "exact"),
                        Tuple.tuple("97ab0ab9-9444-410d-b2d9-1ac9fa935ad8", "2afba4a2-287d-5e8f-aeee-a3bcf8652236", "exact"),
                        Tuple.tuple("d344ae76-c06b-4ad2-93eb-d287a4fdec36", "7d9c565c-8df1-40ca-b3c6-2d4ec51e9140", "exact"),
                        Tuple.tuple("7289bdba-0913-4a64-b46f-a58c3c431c42", "7d9c565c-8df1-40ca-b3c6-2d4ec51e9140", "exact"),
                        Tuple.tuple("8f8c4bc8-5b0c-4a62-b6d7-f7fb263c7f1d", "460b3df5-5d18-43c0-b29a-1c347a0a27f6", "exact"),
                        Tuple.tuple("e0c333ea-9873-4718-819c-d39b22ccee30", "b9bbd2a8-1379-5ffb-817f-41467d48abef", "exact"),
                        Tuple.tuple("72d7ad67-e2ef-41a0-bb52-b62eb5d071e0", "2afba4a2-287d-5e8f-aeee-a3bcf8652236", "exact"),
                        Tuple.tuple("65117831-b95b-4f8a-b1af-606785b92b5c", "ccd47872-4d9d-44db-8c8d-eda24019b502", "exact"),
                        Tuple.tuple("fb742d93-6c9b-487a-bc7c-f54b363c0c01", "93ac7fc8-6d83-5394-bbea-80758b463da1", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPhysicsBadenWuerttembergUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper()
                .readValue(BADEN_WUERTTEMBERG_PHYSICS_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BADEN_WUERTTEMBERG_PHYSICS_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_ID);
        assertThat(file.getMappings()).hasSize(58);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .containsExactly(
                        Tuple.tuple("a55e2959-e951-4955-91be-18c8d8ca1f44", "bf980fff-b62b-4ea4-a20d-31681a7ad785", "partial"),
                        Tuple.tuple("81d3e73e-8d07-4c5a-950b-a5fee02a4493", "5c44b9ba-9b05-4774-95d5-073230d3fc4f", "exact"),
                        Tuple.tuple("fd1b1df1-e290-48d1-be1a-78a0f332cf41", "0735269d-703d-57ab-8861-6f7e1c5e2b8a", "partial"),
                        Tuple.tuple("13de2e6a-3f04-4291-bc21-bc682ae8e966", "0735269d-703d-57ab-8861-6f7e1c5e2b8a", "partial"),
                        Tuple.tuple("74a66527-2bdb-4224-9fee-666ddc0d1657", "b2b74d0a-575c-5c6b-8e24-b0b0f32c1126", "partial"),
                        Tuple.tuple("68e8fe5b-491f-418c-91e4-7c4b82579db0", "a522c8c0-f3a4-5568-acae-3010ed9feb87", "exact"),
                        Tuple.tuple("f4e46a3b-ea03-44e9-8ff7-7d53be023d25", "eb1ea150-ec6c-5000-bce3-f46c820dccf8", "partial"),
                        Tuple.tuple("f9736f4f-f5f2-44ef-854a-ab3e6804a7ed", "37f28bc4-def2-57cf-a06b-191dfd228205", "partial"),
                        Tuple.tuple("d6d04798-465b-46d6-a9b1-3cc9fe1423b1", "fdcd5faf-f9bf-4fa9-87f4-4e22d8d3387c", "exact"),
                        Tuple.tuple("eaa3f96e-3175-4e77-877c-8bf580bb1be9", "ffbbf243-c2eb-4330-b050-837de994c130", "exact"),
                        Tuple.tuple("b3b0488e-6725-40c6-99a8-1195ff5a556e", "fcefb129-ad4c-50a2-9762-a910caa1af16", "partial"),
                        Tuple.tuple("c14d4cd7-f827-47a5-92d8-ebd2310c72a4", "d03f1cb6-c224-53db-ad91-76cc7827978d", "partial"),
                        Tuple.tuple("4f582420-153d-40c1-be1a-bf7673840a8a", "fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e", "partial"),
                        Tuple.tuple("17b9bcbf-8cc9-46cd-b216-a5c6ac28da9b", "05af2893-0201-4d7f-985b-272d7b88e26e", "exact"),
                        Tuple.tuple("275b8549-f30f-4e6f-b82e-16b6ea1855c4", "78cf6eff-b3bc-5444-9ef8-5d39dae8d17d", "partial"),
                        Tuple.tuple("dd7b3c43-5f49-4355-8fda-03b84b7ee788", "ac4ba260-6086-5fcc-bea2-c06f1425a1cc", "partial"),
                        Tuple.tuple("8abca9db-468c-4170-80e4-31f9f76eeb7c", "a844895e-2cdc-4665-aad2-a49c62f11759", "exact"),
                        Tuple.tuple("e82111bd-59ef-477a-b482-45fa68674f6b", "dc38c943-11f6-5f4f-945b-67e330814727", "partial"),
                        Tuple.tuple("70aeb32f-0c20-4314-9519-c305352a6dd3", "cb0ced6d-b7c1-5b7d-9922-8c394f6030e8", "partial"),
                        Tuple.tuple("479dca2d-d21d-486d-8fb8-d84ae2cb4fb2", "d716a35e-e422-5aba-b39a-f2e22f1e1e74", "partial"),
                        Tuple.tuple("8acb6a56-cda8-42c0-a72c-a7d2f3ca7fe8", "d5772db3-120c-5c37-ab46-2336d02236b0", "partial"),
                        Tuple.tuple("e74856ed-f053-4296-9f14-4e88dbaced9b", "224243cd-5a53-5d6e-bed5-564cca167a80", "partial"),
                        Tuple.tuple("22a2464f-92d0-431a-a37d-75685af1cc17", "9dba2826-b179-59f0-8d91-5916079e5abe", "partial"),
                        Tuple.tuple("96651a24-46b1-40fe-86c4-34768e68c916", "4a7cbe83-b694-57d3-85ce-1eeca418daaf", "partial"),
                        Tuple.tuple("f4168e57-fd14-47aa-a398-7f18e5f10ca1", "0735269d-703d-57ab-8861-6f7e1c5e2b8a", "partial"),
                        Tuple.tuple("2c7fe4b9-eaf8-43bd-95e5-fc5befe0282a", "d7bc20e0-5ee9-593a-a7a9-d7cbb88392e6", "partial"),
                        Tuple.tuple("3aaa0f49-d5c0-4b48-80bc-26ce91747a42", "13e882bd-2fc6-59c6-a2a8-32eb1fbf1751", "partial"),
                        Tuple.tuple("c3dea24b-4b95-4b78-a9bb-5a2f8ee7b90c", "a522c8c0-f3a4-5568-acae-3010ed9feb87", "exact"),
                        Tuple.tuple("389f5d11-b557-4597-8bee-c8a9ff0616c2", "eb1ea150-ec6c-5000-bce3-f46c820dccf8", "exact"),
                        Tuple.tuple("6076b7c3-5b6b-47ba-b9ea-019308726225", "37f28bc4-def2-57cf-a06b-191dfd228205", "exact"),
                        Tuple.tuple("6850b598-26a2-4960-9544-52e5fc31f750", "fcefb129-ad4c-50a2-9762-a910caa1af16", "partial"),
                        Tuple.tuple("e6e0636f-ff78-4e42-99f7-0be0fcd1e151", "b2fb9a25-4d26-5cf2-a917-823909dcb6bd", "exact"),
                        Tuple.tuple("4cbe6dac-2bcb-44cb-83d4-6a8b7719411a", "a7255b83-336c-4d42-ba5c-bc2f6248ea36", "exact"),
                        Tuple.tuple("47770f3f-cc2f-4a65-ada9-f3cceb9e9908", "4888444f-4520-437a-9ba7-e74e8f8ed129", "exact"),
                        Tuple.tuple("f51888a6-7a59-4b66-a0a1-dd0adfbd0a47", "158e1c19-7ccb-4c8c-931c-b685951ab161", "exact"),
                        Tuple.tuple("bf252790-f980-4ac4-86ae-bc8b543b7d74", "5da7d4d0-878e-44fd-b398-1b1de8b636a4", "exact"),
                        Tuple.tuple("d78b903d-5e2b-4fe3-99b8-52a4ce593533", "5b90066f-b5b3-4e82-8d31-7b95ff0a0451", "exact"),
                        Tuple.tuple("d2443d8c-a324-4f3c-a83b-914c70ea1e50", "8ad305d2-bde0-4223-9477-517b2943148b", "exact"),
                        Tuple.tuple("d8027a5f-6137-4c7e-a2e6-e72b7a2e05a3", "c71315c1-f329-4289-a145-d99819da7bad", "exact"),
                        Tuple.tuple("5b3c1760-b5cf-4b6b-9ce9-cab696dd3d87", "2c6af966-7703-4176-a117-5ddb8295bedf", "exact"),
                        Tuple.tuple("7b93414b-dd50-41c2-8f49-10778158e070", "c64820e1-c0ee-4342-9225-f981650f0c52", "exact"),
                        Tuple.tuple("9eab2921-588d-4cd1-87f1-626d7ebb702d", "31ed4e95-3ed4-4cfb-9b11-9f3c1341f2d4", "exact"),
                        Tuple.tuple("fb7ccbb9-1903-4006-999a-ba91c5167e29", "c2b6acd8-b298-4e4e-aa7a-553a8a65f913", "exact"),
                        Tuple.tuple("776b6333-501a-4cb3-9cad-cebad8091ea1", "4245c54f-d609-41bc-9eff-e9ceeff4902f", "exact"),
                        Tuple.tuple("88bda530-af99-4e8a-a764-f87db088836e", "5c57dbc7-d258-4aad-a84c-e773f3c493ae", "exact"),
                        Tuple.tuple("610fa85f-8f6f-4ff0-b97b-979bc95e3710", "1a1c09f0-96b7-4c33-a623-0e8101537876", "exact"),
                        Tuple.tuple("6e23dc59-32d9-4b47-a27f-c1a57c8a930f", "6031bed0-9baa-4f45-b2a5-57ffb00d39cc", "exact"),
                        Tuple.tuple("74ea86cb-0b10-4b5d-b8a9-5497d8dc2262", "cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f", "exact"),
                        Tuple.tuple("f13e8c8c-8800-4dd3-8434-010daf6cae45", "d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec", "exact"),
                        Tuple.tuple("01e362b6-53a6-477e-9a33-1fa1f9398720", "dfa53498-34f5-5326-9d94-87e7b528caf3", "exact"),
                        Tuple.tuple("c4a045f0-63ef-49dd-b384-964b44624d3e", "4245c54f-d609-41bc-9eff-e9ceeff4902f", "exact"),
                        Tuple.tuple("39193a03-8e6b-4bc0-96b4-861f56881392", "5c57dbc7-d258-4aad-a84c-e773f3c493ae", "exact"),
                        Tuple.tuple("994d00f8-8152-4add-afb6-cdab6ac6bd11", "1a1c09f0-96b7-4c33-a623-0e8101537876", "exact"),
                        Tuple.tuple("8efdd0b8-8cee-4e58-b797-179fda2300cc", "6031bed0-9baa-4f45-b2a5-57ffb00d39cc", "exact"),
                        Tuple.tuple("70f19a7b-3a4e-44bd-b159-e90e52360ea2", "f6e5929f-d52a-42a4-a5d2-ff498ee7083f", "exact"),
                        Tuple.tuple("e06d5a30-7aa0-4adc-b153-9f45d033956a", "cb0e05ff-e47d-55e7-bd5b-f8d78f2cb91f", "exact"),
                        Tuple.tuple("19579f3d-1667-4c5b-856a-99321986552d", "d2860d7f-32ff-5d74-b2f8-b7bfc8d75aec", "exact"),
                        Tuple.tuple("7d1a08bc-6966-4176-91eb-0e2676164f2a", "dfa53498-34f5-5326-9d94-87e7b528caf3", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathSchleswigHolsteinUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(SCHLESWIG_HOLSTEIN_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(SCHLESWIG_HOLSTEIN_MATH_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(41);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(29);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(12);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("sh-sek2-root", "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2", "exact"),
                        Tuple.tuple("sh-sek2-e-analysis", "bc68c585-3b1d-4c94-8a2b-c10a4dcdb4e8", "partial"),
                        Tuple.tuple("sh-sek2-e-analysis-ableitungen", "858113c5-e53b-57bb-b01f-ba95c3ddcb6f", "exact"),
                        Tuple.tuple("sh-sek2-e-analysis-extrempunkte", "350fc8b1-ead0-4239-b28a-217cbd3bd1c3", "exact"),
                        Tuple.tuple("sh-sek2-e-analysis-wendepunkte", "b3604df4-15a8-41c8-a8b0-50dadd698bd3", "exact"),
                        Tuple.tuple("sh-sek2-q1-analysis-integralrechnung", "93ac7fc8-6d83-5394-bbea-80758b463da1", "exact"),
                        Tuple.tuple("sh-sek2-q1-analysis-integralrechnung-hauptsatz", "b9bbd2a8-1379-5ffb-817f-41467d48abef", "exact"),
                        Tuple.tuple("sh-sek2-q1-analysis-integralrechnung-integrale", "a9ed219d-d497-55e5-a4e0-4d45d2554f6b", "exact"),
                        Tuple.tuple("sh-sek2-q1-analysis-e-funktion", "628928a6-4f48-54dc-952d-dec0e69dc856", "exact"),
                        Tuple.tuple("sh-sek2-q1-stochastik", "67ef9787-d540-5f30-9995-f1f9c39a1a45", "exact"),
                        Tuple.tuple("sh-sek2-q1-stochastik-hypergeometrische-verteilungen", "1462c189-8679-5f32-bf58-6e81e99e4635", "exact"),
                        Tuple.tuple("sh-sek2-q1-analysis-vertiefung", "76842ec4-c76b-5c03-9694-8a18acb1da0f", "exact"),
                        Tuple.tuple("sh-sek2-q2-analysis-vertiefung", "76842ec4-c76b-5c03-9694-8a18acb1da0f", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalMathBrandenburgUpperSecondaryMappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(BRANDENBURG_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BRANDENBURG_MATH_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(91);
        assertThat(file.getMappings()).filteredOn(entry -> "exact".equals(entry.getMatchType())).hasSize(78);
        assertThat(file.getMappings()).filteredOn(entry -> "partial".equals(entry.getMatchType())).hasSize(13);
        assertThat(file.getMappings())
                .filteredOn(entry -> "partial".equals(entry.getMatchType()))
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .containsExactlyInAnyOrder(
                        Tuple.tuple("9dc8f677-83c2-4e11-a6bd-1d2c503cfd28", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("bed222b2-5c5c-4883-9e5d-f7cbd8d8a69e", "c8951a07-a3e7-59d2-8a23-dce545dd811a", "partial"),
                        Tuple.tuple("da8d18b7-9735-49ae-af32-b8938d59ce5b", "98dcf9bd-d119-5eb1-835c-7d719f67b485", "partial"),
                        Tuple.tuple("5c68c777-d8ca-4709-81d6-d3bda6d0c0b4", "3e937f39-1187-58b3-96c3-ec39278c0e3c", "partial"),
                        Tuple.tuple("e7bc2abb-9b89-47d3-8da4-f8694c3fbb4a", "6c8a677b-ede8-5c2c-86d8-0ef0be8ace28", "partial"),
                        Tuple.tuple("28d6faea-7459-4e61-8450-c5affcb93a48", "c01b1ce9-a667-4a46-b251-ec33ae602b15", "partial"),
                        Tuple.tuple("894106f4-dde7-4b91-97a8-b5074a9db25e", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("86c14536-f791-42cf-8f27-53594b238ce5", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("15c72375-64d6-4b46-9483-89f1d54ca1f9", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("e74e14f2-6c11-43f8-be93-3f466edcf816", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("f8b502ab-33b1-46e6-9458-e886907dc4bf", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("23ec0621-7322-432a-9b79-7d2210b17dc4", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"),
                        Tuple.tuple("427adfc9-774a-4344-a5a0-4618fb9cff5f", "4720daf4-cefe-43a9-a0e8-9db55286f558", "partial"));
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("e498bdf5-d30a-43c9-b466-47fce7512c14", "24174bba-a654-5f81-8de3-ca5bd09d9b6f", "exact"),
                        Tuple.tuple("f3ad980a-175b-428d-9b0e-9e5cdffad8f0", "57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5", "exact"),
                        Tuple.tuple("3e7e513c-e755-47e9-b386-3168916b0f3c", "bc68c585-3b1d-4c94-8a2b-c10a4dcdb4e8", "exact"),
                        Tuple.tuple("37b5fa56-688e-4819-9ae9-e1c99325ed00", "38234acf-d0f8-4ff9-a6f8-852d1596a692", "exact"),
                        Tuple.tuple("f03af434-834f-4471-b7e6-190e3f7742ad", "b1dcc191-d046-50de-984a-ee5c17157628", "exact"),
                        Tuple.tuple("f0be1e0f-d6e6-4d9b-afa2-15f15f382742", "b42bdfcc-3db7-5697-8b3e-69e50962ca86", "exact"),
                        Tuple.tuple("5a9ba880-322d-49e6-a81a-24b67405b0f5", "f042385e-f772-42db-9c96-f21a792ac5ea", "exact"),
                        Tuple.tuple("cdefe13f-53f1-4597-be12-0de37fe5981b", "9460c3ff-e72d-4107-bc73-087d217200aa", "exact"),
                        Tuple.tuple("dde04e67-35f0-4a56-9f98-daf562ce9d5b", "effe43eb-cabe-56cb-a228-35887d7915c1", "exact"),
                        Tuple.tuple("8b615e9f-142c-47dc-85ea-365273d04a46", "ec6447d1-97da-5b77-94ae-4973b43f094e", "exact"),
                        Tuple.tuple("0551e6b0-8a7f-4b1d-948e-1237cf81796b", "845440ce-f63f-5835-903f-739145ca27bd", "exact"),
                        Tuple.tuple("660b1fc5-b4d6-4a83-a0d4-3ed8265fdfad", "b3604df4-15a8-41c8-a8b0-50dadd698bd3", "exact"),
                        Tuple.tuple("cf2c56a8-0ee9-4306-a5f1-1f03b7619a5f", "48e7615d-3e6e-4b5c-9df3-310e510f91f0", "exact"),
                        Tuple.tuple("49b654c4-2503-4f88-aadb-48405394f77d", "d51e649f-5dc8-40b8-b580-589016137458", "exact"),
                        Tuple.tuple("14700552-4956-45f3-9da5-b6fb9c2eae21", "781f133a-08bb-54b9-8fda-efa2f8f9b12c", "exact"),
                        Tuple.tuple("4c2ae2be-1a19-48f4-886c-41d1169b9279", "346efb31-c400-5bd3-a698-dd9a7e1bc3f7", "exact"),
                        Tuple.tuple("77989a74-8d9b-4a71-822e-c4f05c67e8dd", "d900e0a4-0c45-50dd-a37b-01f9f91a134c", "exact"),
                        Tuple.tuple("200a8423-f9fd-4091-908e-b4bd0f9bbebb", "ab720928-9dbc-53c2-a1f8-865dda92122d", "exact"),
                        Tuple.tuple("01ed534e-44d1-4e5d-bc32-f0103a1348d9", "bbef7cf2-90fa-59fa-a115-8b651aab9231", "exact"),
                        Tuple.tuple("c5fec5b3-fcd8-462a-beb5-d5d5d7544fec", "31cbe2ae-67be-4b2e-9276-4f81fbfb6d96", "exact"),
                        Tuple.tuple("045be183-58ef-4902-babf-f6ea92609d1d", "266f4250-04a2-4a53-ab24-d81c4e099950", "exact"),
                        Tuple.tuple("6606aca9-3fef-40d9-8f73-bdaed7dd39fe", "f1a95baf-b91f-44db-bcb1-70a4d2e3f7d1", "exact"),
                        Tuple.tuple("a0036a03-9fae-409b-aae8-aa91eaaec69f", "0f8fc8bc-3a9e-49a3-8afb-b125b571af97", "exact"),
                        Tuple.tuple("df54cacc-bc46-44c6-86b9-5cf39f742aa2", "460b3df5-5d18-43c0-b29a-1c347a0a27f6", "exact"),
                        Tuple.tuple("0ddfc0cd-4eb6-4db1-8798-188a51dbe486", "2a1158e5-d4ca-51d4-860c-f43bd5a86836", "exact"),
                        Tuple.tuple("f4d6a5f3-82ff-4199-a6a1-55046a7e8e53", "52e57eb5-7cd1-5df0-a8c6-7b090f097d9f", "exact"),
                        Tuple.tuple("a1c9e805-f1bb-4de3-82d0-335b319ab31a", "508292f2-671b-4fd3-acbf-53d705e44693", "exact"),
                        Tuple.tuple("dec2d72e-ad55-4179-885b-f3e5d64d8776", "bd63c0fc-50ef-55aa-ae6c-25cf73d02636", "exact"),
                        Tuple.tuple("557b2a54-2a52-45d1-8c97-c1fe3d0a934d", "9cc650e0-100d-5ae1-a83b-2b854ab7c5c8", "exact"),
                        Tuple.tuple("61fdfe96-fd1a-43ec-b42a-ed3e44191ea1", "7c0dee9b-a827-456d-9f88-b196fc4e9a13", "exact"),
                        Tuple.tuple("f2820843-e4f7-49d1-89f3-bf19ba8d9d9d", "fa02cf14-0411-4fe3-8be7-a62c69743e26", "exact"),
                        Tuple.tuple("a77aba90-bdc9-420d-8805-872f71114ec4", "075f1ef2-6860-4b20-9df2-878157eb395e", "exact"),
                        Tuple.tuple("55041b6e-7a4a-4dd1-bcc8-1bc5759f4702", "858113c5-e53b-57bb-b01f-ba95c3ddcb6f", "exact"),
                        Tuple.tuple("699b2590-2c7c-4ff3-8c2a-0ae14a214c0c", "90662398-a0fd-45bf-9ce9-2abbc20428ed", "exact"),
                        Tuple.tuple("cf83da48-17ef-488b-9a68-75323d5764de", "ce774aad-edd7-4f86-a431-6ca921b8e570", "exact"),
                        Tuple.tuple("c673e3dd-370d-4cb3-9c98-bf41328a4b57", "3b0d30b8-148b-43e0-b883-907fc691fc11", "exact"),
                        Tuple.tuple("9270a0db-4378-4045-a2f1-b1c481ca7990", "985a62b1-c657-4c07-982b-72afd4c86e40", "exact"),
                        Tuple.tuple("13a20456-21ef-48ea-9768-9f4eececb975", "616c72a4-972d-5cc0-b903-e2a24bcb150c", "exact"),
                        Tuple.tuple("7c467c89-5608-4f73-ad40-0bd38d06c5ef", "fd2fa63c-5626-4dc3-86b3-3672e906e34a", "exact"),
                        Tuple.tuple("a04efa06-7d34-4a35-8080-5c76a5e6bae6", "f378917f-2ca7-4c68-bd66-3f9457095dd5", "exact"),
                        Tuple.tuple("db92cb2f-dfa2-409e-b272-27f5d2f89aaf", "3862890e-9ea9-4c62-bcf2-e354c9d8f306", "exact"),
                        Tuple.tuple("53b553ff-647f-4397-b106-19e049c8ad54", "187c1bef-57bc-4a93-a26b-04191879626c", "exact"),
                        Tuple.tuple("091586f3-22fe-4b82-a207-719daa638558", "75efcc7c-3c96-47c6-a681-1e9337862a20", "exact"),
                        Tuple.tuple("7ddb6b75-55a5-48b4-8ce4-2f5a3dc5274e", "1383d2c8-ad8f-42a0-9a50-6897185bafd1", "exact"),
                        Tuple.tuple("dc5f227f-2c12-409f-b1ba-39c7e3da086b", "e402f330-8ac6-525f-b3ff-bc4be229d131", "exact"),
                        Tuple.tuple("abd1f3e5-bcb7-4d01-a37f-d0c1ad69c782", "5927ca6a-91d5-4541-84e9-833bbb2cd7df", "exact"),
                        Tuple.tuple("654f9d22-b554-4528-86e1-52c5f94fbd7e", "9dfd0e4a-d7ea-5ce2-906e-678f0cf978b0", "exact"),
                        Tuple.tuple("d8a872b0-befb-47d3-9699-9bcb6b6b5074", "f7879354-1a82-4195-8e3c-a339a820439c", "exact"),
                        Tuple.tuple("f7858e56-1005-450e-bad5-c2d3f782a9f4", "990d7514-c4c3-485e-907e-91687676a8cc", "exact"),
                        Tuple.tuple("e69bb038-3ffc-4546-a22b-2e4bdc6b3960", "a9ed219d-d497-55e5-a4e0-4d45d2554f6b", "exact"),
                        Tuple.tuple("32bc5f5b-e9de-45c3-bf97-4bd7a53bdb30", "ece68088-71a8-466b-874c-09e6baac19fc", "exact"),
                        Tuple.tuple("e73327b5-5b20-4fa3-a36b-8516469a848c", "164eb50f-1a5e-44a2-932e-561862e1378e", "exact"),
                        Tuple.tuple("df7abdf8-02cd-4a75-a632-7db47db60133", "8eb14d81-353a-4909-9464-61be7b1ba5b8", "exact"),
                        Tuple.tuple("d7662486-edb1-4fef-8fc2-b953387763cb", "3256476b-ec65-4038-9f5a-a8808fbcf207", "exact"),
                        Tuple.tuple("3aca21da-835a-4adc-8ebb-0d1797888a5d", "509ae03b-96b1-4bb1-b015-b83d14569dae", "exact"),
                        Tuple.tuple("44c4ffc1-f854-4343-8a8e-e83b8f2195f8", "5da12e3a-9abb-4134-a0a3-f44aa8de0a03", "exact"),
                        Tuple.tuple("4ec28779-2898-4e08-b36d-e764a53e0531", "18293a33-a5ff-4a0f-9b6a-085f171cbffe", "exact"),
                        Tuple.tuple("b7cacf56-bae8-4d8f-b02f-6d6434da0eab", "dabff49b-d40a-4c81-a584-21408b2d4219", "exact"),
                        Tuple.tuple("f920f775-6588-4b5b-be64-675df24d74a3", "4aa70ad4-171d-5671-a864-c0c7758fa0ed", "exact"),
                        Tuple.tuple("f7d5be1b-108d-4424-9f9e-f6cc9f2dcaa8", "83a5546e-0ea6-576e-83e2-3387b30872bb", "exact"),
                        Tuple.tuple("8eb4e580-262c-497d-9868-3b3799dcb613", "e9114fc2-1a87-5ef5-8fa3-7ee4c9bbe0dd", "exact"),
                        Tuple.tuple("9d3139f9-b93f-4742-ac3c-56fb3d71f57f", "34604a97-0c64-5b06-81e2-6ac818732d60", "exact"),
                        Tuple.tuple("61eeaa40-223f-4d04-a1b3-e637480946d3", "b5062446-332f-4a67-aaf7-3bfa3e5aded9", "exact"),
                        Tuple.tuple("a8c18e63-99f2-42da-bb8e-1a5b10e21453", "f242a3e8-55a3-492e-8354-b81b24cdbb78", "exact"),
                        Tuple.tuple("2ad7cafd-b7f8-49e8-b7c0-bb5bf132978b", "19f170e4-b88f-4c06-b72a-ce6923748bb4", "exact"),
                        Tuple.tuple("fdfaafde-d430-406a-a03e-6c985671cf4b", "3016ec37-1c2e-47db-83f5-e767923bc97e", "exact"),
                        Tuple.tuple("3206078a-175a-47d3-b1c7-ce75447a8ca8", "ed5d869b-af4e-4b80-b34d-a2338e16ce34", "exact"),
                        Tuple.tuple("a04efa06-7d34-4a35-8080-5c76a5e6bae6", "f378917f-2ca7-4c68-bd66-3f9457095dd5", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPhysicsSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(PHYSICS_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_PHYSICS_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_ID);
        assertThat(file.getMappings()).hasSize(53);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("22f30637-5c9c-45c9-9c39-fd736ae565fb", "9645f0d8-43a3-5f29-873c-daa5ace638db", "exact"),
                        Tuple.tuple("e960edce-07a1-4678-b909-ca9889ae8f16", "e41356c1-968b-435a-af25-b663f080ae5a", "exact"),
                        Tuple.tuple("73c87a76-9f85-48f4-8baa-bedb65ec4755", "10bb8262-fb0f-40cf-94ef-408420ec7cf2", "exact"),
                        Tuple.tuple("ac0b8d1b-294b-4faa-b407-e719b9f914c1", "cd4fe3f9-a04d-4dcc-9c0b-db214daa72ba", "exact"),
                        Tuple.tuple("3ebf05d1-ddd5-4199-8899-9d2fe34cf484", "722857cf-f327-5740-8151-64eb92195ec8", "exact"),
                        Tuple.tuple("9d0b0fea-c866-42da-8c26-9a9691977d35", "051cedc5-d380-4716-9751-b18f2e67a912", "exact"),
                        Tuple.tuple("16100fe0-3569-4290-94df-e14c472cbd6e", "2d3d42ae-492b-4795-a22f-eeca03aaed38", "exact"),
                        Tuple.tuple("c8a36d2b-19f9-4cbf-b564-537678388646", "dd7cdcea-0950-461b-96ac-ce49989fca47", "exact"),
                        Tuple.tuple("f9ae3721-ff6d-40fe-94e0-3ed12264d044", "940978fa-1f2d-4e54-9c28-081a6df9b76f", "exact"),
                        Tuple.tuple("6866bdd0-1015-4a9d-9be3-91535d66cf97", "d27c8860-12a4-4d7d-9849-ccd8b7caca48", "exact"),
                        Tuple.tuple("15e2d789-f003-4934-a73c-e01d3f22e7f1", "9ac4973a-21d5-48a5-90b4-eb90e10391ae", "exact"),
                        Tuple.tuple("46717be6-c3b6-40d4-9f21-1bac1a1b05e7", "fbe0faae-7fba-482b-888e-341f926770f3", "exact"),
                        Tuple.tuple("cea91b60-1970-40bb-bbed-b0c142f26b0e", "79cb1695-f985-443a-b93e-27b57ab474b7", "exact"),
                        Tuple.tuple("10109c2a-788e-4969-9476-82d7cdd06f8f", "cca06d84-28fe-4b80-9bcd-968dda026e0e", "exact"),
                        Tuple.tuple("800df877-c091-400c-ac88-2286b79524c0", "4924d83e-5e4b-4819-9d70-86cda3496195", "exact"),
                        Tuple.tuple("98906541-600f-4c98-9e90-b47c72f0ea18", "f778a659-1467-4aa7-97b2-bed78c530634", "exact"),
                        Tuple.tuple("303d4fb2-00c8-41ce-99b4-4adac0105897", "75bdf5ca-cda4-4658-9ec7-84c77b3759db", "exact"),
                        Tuple.tuple("fbe3078b-7c31-4531-9c6b-da46d98375d3", "a5f652cc-e091-4c90-bec2-c357ae54fcf1", "exact"),
                        Tuple.tuple("5e56c17f-b5ce-4259-b525-10c636b0ffc6", "f1a078ae-6262-4444-a4bc-a5ab275621cf", "exact"),
                        Tuple.tuple("057a39fd-bcfd-4008-b30c-f91370b34007", "bbabac7c-9613-4c7e-877e-d7dc3df5300f", "exact"),
                        Tuple.tuple("1e84b1e2-6802-45d3-9cac-f124cdcc39d8", "32111497-d5ca-453e-906d-d352f885b126", "exact"),
                        Tuple.tuple("5e34edd7-75d0-46aa-8d10-954bde3a1166", "53196a71-9dbd-4835-b2f9-ff21b8a8962c", "exact"),
                        Tuple.tuple("53801090-6ef2-4e61-8106-6833a348f701", "01bebdfc-5819-4610-a03e-ea5e794fc954", "exact"),
                        Tuple.tuple("669d4da4-762a-40db-98b9-dab127d86346", "1911920e-b099-4310-82f2-b47f51a78b33", "exact"),
                        Tuple.tuple("c4dd83af-0a29-401b-af0b-95d76d3470fa", "eeba6bf8-a2b9-4d7d-a1d6-67286c923cef", "exact"),
                        Tuple.tuple("9a37d05c-e957-4900-b722-539e6cec4ca7", "cbb26ed2-6979-46f6-a4ae-128f5c5d9d76", "exact"),
                        Tuple.tuple("facfd62d-9240-47bf-b2a5-919ada412987", "8917c71a-bfcb-4003-971c-188a69446b60", "exact"),
                        Tuple.tuple("f882cc85-6225-4f63-98f7-2349d2c7385c", "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb", "exact"),
                        Tuple.tuple("24350b45-cd48-4c91-b0c6-71480fa1681f", "f6f646db-3544-49ed-8f55-67bc684e80ce", "exact"),
                        Tuple.tuple("89e717eb-c36a-4945-872c-5da7b1292b5c", "979e0d0d-8933-4ace-814f-f28060ad280f", "exact"),
                        Tuple.tuple("eb6bf9d8-943c-42af-85fc-1b3d08985b6f", "84b1bc70-dadf-449b-a8d4-8bcee1da1fea", "exact"),
                        Tuple.tuple("171b3ec7-1039-45a6-8dcb-be560f1517e5", "078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5", "exact"),
                        Tuple.tuple("1402524f-0965-44f1-b560-7a29690ae8a8", "90e1e6cf-4092-41d6-81f7-5206f9d68f84", "exact"),
                        Tuple.tuple("8690086e-dfbf-4dd1-a996-e34b7e7db712", "6367d45e-919e-4c19-bcd9-7770a2d51139", "exact"),
                        Tuple.tuple("bdfe02d7-0792-454b-8a00-684c8f4ac11d", "84096c02-0767-4725-8956-37ce7e4b9bbf", "exact"),
                        Tuple.tuple("6c0b16ef-94d3-417b-8ba8-0da48aa2e989", "5308de76-79f0-44f4-8cb7-fc9de4772217", "exact"),
                        Tuple.tuple("dffc852e-d7a3-42b9-968e-19575a52bd1e", "310b4f62-e261-46be-bb1b-1f125fc1699a", "exact"),
                        Tuple.tuple("f6f2eaca-e635-402b-ba7a-5bac7de925e4", "e11b2ee9-e528-4857-9ecd-59bd460fba81", "exact"),
                        Tuple.tuple("ddb0a146-de79-44ce-832a-81295f7c4b8d", "24b4686a-e8a6-4583-8952-33e6f653c2a3", "exact"),
                        Tuple.tuple("7d8f00d0-311a-42a3-a5ad-bb9904ebecc8", "41fd5575-b1a6-40e7-8ea2-66b75a597a79", "exact"),
                        Tuple.tuple("e5e63e4e-6b2c-4474-b6d7-3f0fde2834fb", "c1006f55-0406-48cc-92d4-0d8345897cf4", "exact"),
                        Tuple.tuple("4e05720e-2009-420f-a2d3-5c2d3489e809", "3c82510a-1f12-4eaa-81c2-8599437a5b85", "exact"),
                        Tuple.tuple("2b396054-8508-4f4d-80ef-2c89cc64ec7f", "10aad90e-a1db-42b6-8d1e-1d856e14b47d", "exact"),
                        Tuple.tuple("28dfd9ce-59b3-4d32-8d28-f7dd22cb08c4", "3e33813d-db75-4571-8345-3845b02b956d", "exact"),
                        Tuple.tuple("9e98a602-fddd-4aad-b55a-cff4900097e4", "e62e48bc-2387-4b2b-8d6f-7a06c8e7580e", "exact"),
                        Tuple.tuple("cc82aa80-b71d-46b8-8ebe-cee49531f907", "48fb4a0b-62a0-4c8f-9792-3aeef6316885", "exact"),
                        Tuple.tuple("39fd7151-c6ee-4d60-84e3-e762d3cac33e", "a4681378-ade4-4f20-bf77-fb020469510f", "exact"),
                        Tuple.tuple("503f87c1-9e30-4731-8753-6a382f0ce31d", "cdab9fd1-5054-4a7e-8c9a-4474062ddd23", "exact"),
                        Tuple.tuple("27a7deb7-f195-4a65-a064-74d170f181fc", "1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075", "exact"),
                        Tuple.tuple("2ac88d02-ef92-4968-9df3-e4c22e7e4749", "cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalNrwUpperSecondaryPhysicsMappingFixture() throws Exception {
        GoalMappingFile file =
                new ObjectMapper().readValue(NRW_PHYSICS_UPPER_SECONDARY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(NRW_PHYSICS_UPPER_SECONDARY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_ID);
        assertThat(file.getMappings()).hasSize(20);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .containsExactly(
                        Tuple.tuple("715c722a-bf7d-46d2-8d03-73ccb17fbd15", "bf980fff-b62b-4ea4-a20d-31681a7ad785", "partial"),
                        Tuple.tuple("86e3c110-14ac-4886-8d2d-6e1c30d3cc2e", "5c44b9ba-9b05-4774-95d5-073230d3fc4f", "exact"),
                        Tuple.tuple("8cf56a06-2097-436b-80a0-86d2977ce171", "942de15b-32f1-5713-80e5-e7aeb8749fc4", "partial"),
                        Tuple.tuple("1c4f3881-7b07-45ce-b994-fe0cbfeb1466", "d03f1cb6-c224-53db-ad91-76cc7827978d", "partial"),
                        Tuple.tuple("839e9bf1-812e-4f8c-bb5f-b561e54acb1c", "7e0308d8-a239-5c0f-b2c0-724f21e4da60", "partial"),
                        Tuple.tuple("c7bd088a-4bae-470e-a4fe-ba240051cff7", "9fd26b99-b790-5efd-8858-c7e6c20b005e", "partial"),
                        Tuple.tuple("cc33e6c0-4f16-401d-ac77-4ce89025609f", "a359c859-eee0-40ef-a9d1-88db2e6c55b2", "exact"),
                        Tuple.tuple("9d6c16e1-30ad-4f1b-a7cb-348b1a2f7591", "defe44d2-c3d3-456b-a786-fad2cef13fe8", "exact"),
                        Tuple.tuple("120ce5fd-d62e-4629-92a3-b742a0db186d", "c1563745-2722-503d-819f-95d336937e2b", "partial"),
                        Tuple.tuple("cfcada5e-df7c-4803-894d-bd5784a38850", "741774ef-15fc-4bcf-a370-e2c5cf4257d0", "exact"),
                        Tuple.tuple("d6a20f83-15f7-4305-8844-b6ca0883cfcc", "9854589c-5feb-4942-b90f-311ddf36eb78", "exact"),
                        Tuple.tuple("de7778a9-afa1-4be9-a3e7-eb192fab790b", "5482bc19-3836-51a5-ba98-fbf5e265b908", "partial"),
                        Tuple.tuple("632e9015-a835-4baa-92f1-811206ebacbe", "ab636b78-6031-5a5b-afa2-9ffefbdd5dda", "partial"),
                        Tuple.tuple("5e1fd0d1-73ae-45e2-b2da-ea2f2c6731b8", "72c2bf5d-c62b-5744-9971-4c117f2a432d", "partial"),
                        Tuple.tuple("c5ad11dd-330d-4fc2-bc03-d7383aeab823", "e5c08365-a0d3-592c-ad8e-d2c2c6e2b717", "partial"),
                        Tuple.tuple("21fea954-275f-4eac-a937-1c27b44add6d", "a12fddce-0215-58d9-bd91-21be8a960d25", "partial"),
                        Tuple.tuple("e59d5e73-3e45-49b4-825c-11fc5a41310d", "b3f3f4f7-b5cc-40e1-b57a-3d93649baa61", "partial"),
                        Tuple.tuple("7353846c-3bbb-4fd9-9f96-9bc8f9332b9b", "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb", "partial"),
                        Tuple.tuple("950a23da-4714-4b21-84bb-ceec26f88616", "bb5c5eab-2fc1-5336-b8cf-14d147695487", "partial"),
                        Tuple.tuple("4fafb71a-589d-4923-a174-a2a54ebec3eb", "7e719cc2-0866-5267-a252-e7e7ac0d03f1", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalChemistrySek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(CHEMISTRY_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_CHEMISTRY_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CHEMISTRY_ID);
        assertThat(file.getMappings()).hasSize(32);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("8feb6b0f-d39c-4daf-9a13-9cb00413ff55", "3588c15e-adbe-5b81-b3a7-10da20574e3d", "exact"),
                        Tuple.tuple("3b6a4f7c-178c-4b0a-b786-f7e11693ea6d", "c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0", "exact"),
                        Tuple.tuple("474c73d9-d8bf-4fa3-9fbf-ee21207c2aab", "5a709938-e0f5-42b7-94f0-cfded08963a2", "exact"),
                        Tuple.tuple("13a84828-e2e6-4bde-9c26-f4b54eb90fd3", "a00d302b-7762-4b9d-a6d7-de0c58b35540", "exact"),
                        Tuple.tuple("ff3db7ec-444f-44d6-bd8c-7e452de3f2a0", "8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566", "exact"),
                        Tuple.tuple("0b9ff7a1-3767-4942-8573-3474aa0fd572", "bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a", "exact"),
                        Tuple.tuple("8933dbfb-1d50-41fc-8e59-3ec9b65ed482", "bb707fda-504c-4699-a78c-d0a6c320658f", "exact"),
                        Tuple.tuple("b6808c45-970e-4918-b57e-294d03409ad7", "1286f2fe-89b7-4454-8e11-85b6abd6e278", "exact"),
                        Tuple.tuple("4f94579b-7db0-4792-84f2-eb38df3327b3", "1bdaf7f2-ff3b-455a-a7fb-95a44642762a", "exact"),
                        Tuple.tuple("ef2e2a68-566f-4059-acd4-9ed504c411b9", "fb3bdf39-4baf-4510-a192-c8a12fbf5dba", "exact"),
                        Tuple.tuple("d902cc1b-fe62-4a4a-bbc1-d1dc54b34a54", "e0d05c36-eaac-4c75-8ead-3fd5bdafefca", "exact"),
                        Tuple.tuple("ae7e4674-eadc-4d75-a3a0-8466a5688e25", "9b5d6326-d27c-4ece-8c72-debda705464a", "exact"),
                        Tuple.tuple("aba0f8ad-06c3-4553-ad37-e060c38cb0ff", "e7c363d4-e02d-4895-8750-ba62c2eb63fe", "exact"),
                        Tuple.tuple("877990c1-6534-4328-81aa-5351396eb3d1", "11bea4c6-7b8a-47e0-8293-2eb1ce34cf66", "exact"),
                        Tuple.tuple("343e6f57-6dcf-49c1-91c7-001dbe446c4e", "22133f29-ef02-4408-8f8d-2bbea3275d91", "exact"),
                        Tuple.tuple("cdff3dff-00c4-4a72-9dd0-10b04c8e2c47", "702f774d-ad93-4a6b-98f6-c53310e176c4", "exact"),
                        Tuple.tuple("33e281e4-db5b-4c3c-b04e-73ceaf38170c", "018bec90-445f-4a88-b8bc-228f8335dee6", "exact"),
                        Tuple.tuple("9c2c627d-a8dc-47ff-83fa-6785bf132475", "4285d84a-2c9a-4d51-8250-8bed4daf2d2e", "exact"),
                        Tuple.tuple("cdbc8b2c-fa4b-4ece-8c55-172c2f3df648", "70b12d1c-abaf-45c6-ae9e-b571e9cbc126", "exact"),
                        Tuple.tuple("a50d139e-bdf7-4bf2-872c-41f2a566a201", "1e803ef8-fc76-493d-85c5-de877cd38fda", "exact"),
                        Tuple.tuple("fd02c993-0950-41a4-a861-7522d1bd3f8c", "72236f2c-771e-4ab6-933a-e549ee49d15b", "exact"),
                        Tuple.tuple("9ebc6606-c22c-4fe9-8852-4e3eecc3f4db", "f5efab9d-2c61-44ea-b36a-87f873b51fd8", "exact"),
                        Tuple.tuple("2a469485-d750-453a-ad40-a31e0c69c4d4", "e9d74940-1e0e-4511-9718-4851f49ad7a5", "exact"),
                        Tuple.tuple("85bfad0b-2308-40e2-9040-dc29794f7e93", "a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca", "exact"),
                        Tuple.tuple("41de0477-78e2-48b5-82f7-e5864f2f66cc", "950c73c6-4ed1-488a-9267-1142e95e0055", "exact"));
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
    void parsesRepositoryBackedCanonicalFrenchSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(FRENCH_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_FRENCH_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_FRENCH_ID);
        assertThat(file.getMappings()).hasSize(152);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("2470bbf6-afaf-47de-a60a-c378aa10633a", "f7f02fb7-8376-5aba-961c-743e528d1ff7", "exact"),
                        Tuple.tuple("3b56ea78-beef-5bfa-84d8-ac8df9904f01", "81f0501c-890a-5ebd-be54-4ae7698d4d52", "exact"),
                        Tuple.tuple("8bfee19a-5594-4aa2-8a80-10409a34db15", "40d64ae5-d572-5b31-8fb2-4f789fc4b55a", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPhysicsPilotMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(PHYSICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_PHYSICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_ID);
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
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_MATH_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_PHYSICS_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_CHEMISTRY_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_BIOLOGY_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_MATH_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_CHEMISTRY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_BIOLOGY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_CHEMISTRY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_BIOLOGY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_FRENCH_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_FRENCH_ID.equals(mapping.targetLandscapeId()));
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
    void parsesRepositoryBackedCanonicalMathBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_MATH_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_MATH_ID);
        assertThat(file.getMappings()).hasSize(351);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("1877cd7b-d4ce-5356-a938-f28ddd8d7f3c", "4b67bed9-06da-40b2-a306-24e9e7dfd390", "exact"),
                        Tuple.tuple("edd3e6df-7f3d-5230-9377-dcf9d095c49c", "ae772695-d55e-4cc5-81bc-6605272759b4", "exact"),
                        Tuple.tuple("6e7ff196-a9e4-5bac-afee-621801ec85c2", "3e4032bd-4d8c-4e72-bfdd-64a34df053c9", "exact"),
                        Tuple.tuple("e58ed4dd-67fd-5ece-b30c-1d39dcb918a2", "6377e1e3-8c26-4cf1-997d-8802690d74dd", "partial"),
                        Tuple.tuple("6d03a193-d2ce-59b5-b527-7b872a7e8fc2", "cf474eab-1379-4877-907e-58b0892ce734", "partial"),
                        Tuple.tuple("ccd385d1-13f8-5b0a-bb7c-2c1428f6eaf3", "d6d8904c-896f-5850-8181-06c223346b80", "partial"),
                        Tuple.tuple("c0959210-c934-4498-b94d-44c90b1a4ad1", "33c6e64c-5955-5b07-85d4-74a97b19dd56", "exact"),
                        Tuple.tuple("0cb17a53-944d-47b7-9bac-2094e91793eb", "8d893e63-d7de-52d9-8bcb-f48f47d1ccbf", "exact"),
                        Tuple.tuple("38dbde78-57b3-5dc4-bee6-8bad8b47f267", "4b67bed9-06da-40b2-a306-24e9e7dfd390", "partial"),
                        Tuple.tuple("02329f33-1106-5b6a-8999-e2cd6d52df42", "3010d965-b9b9-4dc5-9d04-d706725e9a30", "exact"),
                        Tuple.tuple("5e334eeb-c4d3-5ec8-94ee-ead8e4cd0db0", "78238608-aaaa-4d12-a9de-54f325e9cf6f", "exact"),
                        Tuple.tuple("ebfe1143-8e03-5eaa-ab73-5c8f9d282331", "3c1d6ce7-099e-4267-9ff2-3d1526209a89", "exact"),
                        Tuple.tuple("37db79b4-aef7-54f5-b02c-d487e730c167", "c088fd81-fe4f-4282-99af-ebc0d1a7d202", "exact"),
                        Tuple.tuple("2682b837-da8a-522a-ba32-94fa05d28846", "27b63e2e-6a34-483e-8e5a-fe0f49670d1d", "exact"),
                        Tuple.tuple("ca389b32-a76b-520f-8110-46d31fe1751a", "8d30d241-0247-48ac-83d3-4e0de61584d3", "exact"),
                        Tuple.tuple("2af4026c-ed70-520d-b56f-97e8584f77c8", "c8818eae-0c4d-4fa1-9085-04a9c95a668b", "exact"),
                        Tuple.tuple("0a279639-f6c7-5901-b132-0aafa9aacd61", "53b47494-ec60-4128-840d-2a4c4bab6d32", "exact"),
                        Tuple.tuple("1846b95c-c454-5e81-a454-4a0e5cbdf4c1", "302a857d-ad71-4bdf-81f3-851c95aeefe1", "exact"),
                        Tuple.tuple("6d225375-ae85-556d-be33-b485e900113f", "862e3334-6c47-5270-944d-3a8829c8d1ea", "partial"),
                        Tuple.tuple("92f79724-c35d-59a2-b511-2bcd2af72a39", "e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32", "partial"),
                        Tuple.tuple("e8ef7d6c-d91e-5965-b8b5-f7e9e7429a68", "d51e649f-5dc8-40b8-b580-589016137458", "partial"),
                        Tuple.tuple("a67f6c16-8eeb-5a9b-a0ff-656361efcf34", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("2cee715f-0523-59ca-b167-4e4c00714656", "61686d85-0301-550e-bab9-bd9411c3e7ce", "partial"),
                        Tuple.tuple("1fb5227c-e535-5c53-a265-bd4aadd8cf5b", "61686d85-0301-550e-bab9-bd9411c3e7ce", "partial"),
                        Tuple.tuple("24ce0df9-f47f-5335-9756-16e07031d0eb", "61686d85-0301-550e-bab9-bd9411c3e7ce", "partial"),
                        Tuple.tuple("f5dc4c22-52f6-505d-a8a5-bd523ea201ec", "61686d85-0301-550e-bab9-bd9411c3e7ce", "partial"),
                        Tuple.tuple("e52be326-be1d-5c15-a386-def41bac7b23", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("cfc2fec1-3357-5fc4-80a7-ba76016dbed0", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("231e956c-8060-580b-a338-24df122be696", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("c2577df2-b27b-5e60-b948-109c5ed6bfed", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("2d882eb2-0243-595b-abe4-6bf1ec10e71e", "d8c9eb57-1614-4c1d-829a-618134def352", "partial"),
                        Tuple.tuple("d3ab926c-a573-51fd-94fc-9f65549c32b1", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("f0658347-aca7-5bd9-ab7a-41d1b2ddfba7", "c9d92f32-167a-4006-a940-b8063a6ed434", "partial"),
                        Tuple.tuple("c3e9295c-d54a-504f-b822-a2fe261279b3", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("88c43f5e-c871-5a90-84fe-dede346093c5", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("ffa408f9-f6e8-5f71-bbcd-e1b41e1cfc27", "392440db-6a43-59c0-a48d-958128fa16a8", "partial"),
                        Tuple.tuple("b2650cbe-490c-547e-a55a-d5916c3c0647", "899ed286-0cc2-4d6d-ba46-7d4e40a11f41", "partial"),
                        Tuple.tuple("af7ae4e0-5087-5b65-9061-f6c051d67950", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("05c7d971-c46d-5d60-b755-49a89f4bf3f2", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("6fce1904-c871-52c2-a9ba-61be93414398", "677be619-5f0a-59bf-9730-0071c7d3f150", "exact"),
                        Tuple.tuple("a1a9a722-5c60-5f66-a1cd-04626f6ac893", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("f52a2ccb-626d-573b-bc8d-938e10ca982d", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("14d3173b-5baf-5f7c-afde-ebf26c6372e9", "61686d85-0301-550e-bab9-bd9411c3e7ce", "partial"),
                        Tuple.tuple("58647fc9-9a9c-58ae-ae8f-f48cf1c22870", "5ebfc509-0b4c-5c60-befb-2477eb24d4b5", "partial"),
                        Tuple.tuple("49a778eb-5af6-540f-8cbf-1ffe9666d7fc", "a668ea17-9226-4074-8f8e-051acbe839eb", "partial"),
                        Tuple.tuple("771f1178-5c78-5906-a214-e06b2de4888a", "972cc7e8-be9c-444c-ba45-98e817b3cf14", "partial"),
                        Tuple.tuple("74fdeb6a-176b-539c-9455-b882e50c1c9f", "31be24f0-3ab1-54d2-856d-fa9b7f36552f", "partial"),
                        Tuple.tuple("3b3a1c81-6d78-5b28-b2f9-0217893b4726", "dd550132-2a3f-5b4e-a3c6-f940621186ac", "partial"),
                        Tuple.tuple("0555e436-b1af-5e09-bea9-7be198a364bd", "da95ab35-bac2-54f2-b38f-8b612cde8b54", "partial"),
                        Tuple.tuple("728eb44b-24fc-5ac5-86e5-0dd983817749", "35e14223-54fc-5ec1-ae73-ac9f13b07db2", "partial"),
                        Tuple.tuple("d8c42bfc-ee1b-52b3-9409-276164c61829", "c92133c6-d5de-4902-936c-321915cf21e9", "exact"),
                        Tuple.tuple("8a81f8bb-f573-588b-a488-0a5f8f3e5468", "b431148b-526c-4bde-b04b-48d23101d0d3", "exact"),
                        Tuple.tuple("16abc50f-5e93-51c1-b578-cc390655b7d0", "35e14223-54fc-5ec1-ae73-ac9f13b07db2", "partial"),
                        Tuple.tuple("fbcfacdf-0561-5bca-8c4b-d0405c212054", "3d9530ef-8355-59fc-b8c1-afe42cf9e888", "exact"),
                        Tuple.tuple("0296b1d9-dedb-5a26-8618-4d524e2e1603", "213c3e11-3e8d-4db7-a04e-3a05c13304a5", "partial"),
                        Tuple.tuple("f4459784-ee4a-5262-bea9-9eabea21ef78", "1383d2c8-ad8f-42a0-9a50-6897185bafd1", "partial"),
                        Tuple.tuple("850ed5f0-7c6c-55aa-b58e-8c142c5607ec", "1383d2c8-ad8f-42a0-9a50-6897185bafd1", "partial"),
                        Tuple.tuple("9f1d1322-713b-5116-a732-344bf29f7ed6", "213c3e11-3e8d-4db7-a04e-3a05c13304a5", "partial"),
                        Tuple.tuple("03a3ed9c-7d59-5043-a410-b04739714c7d", "75efcc7c-3c96-47c6-a681-1e9337862a20", "partial"),
                        Tuple.tuple("0a84bd93-8e6d-5291-b55c-c5704eaf9eb1", "895a60ea-606a-4e77-a5af-ecc13d68e8fb", "exact"),
                        Tuple.tuple("ac97191f-18ea-59d1-a000-74271547f0ab", "a6c8db0a-a8a2-46bf-af04-d73d69d6c8b1", "exact"),
                        Tuple.tuple("135f52c8-f617-506d-95ac-d20f04f93950", "7f11ffe0-7c43-4507-9101-50374a60b0e8", "exact"),
                        Tuple.tuple("59fd8c55-84e2-5945-87f4-831692d6d396", "15ce2a7e-a5dc-44f7-8a5e-6d04dd81db12", "partial"),
                        Tuple.tuple("5fd97d13-0a33-5937-be0f-70cf86d896dd", "6a4716bd-8038-46bb-b647-0db4a254fee7", "exact"),
                        Tuple.tuple("dba05195-9751-5639-a48b-2a5b8fdc7ec1", "0190e463-51a7-4860-9b35-d875530a85ba", "exact"),
                        Tuple.tuple("9f5e3473-3a66-54ff-91f5-d31c478d04c4", "1a25ef44-f310-4c23-9ba8-44baec60d3b0", "exact"),
                        Tuple.tuple("505f7dc0-9656-582d-be8a-d4bc55eb5889", "ca834a7d-5a66-4876-b24c-143b1464d937", "exact"),
                        Tuple.tuple("abbeb3fa-8b35-5567-a60b-d182256d4465", "8d1bb6ce-2433-4637-94ba-3bdc35fa5b10", "exact"),
                        Tuple.tuple("33b94ce0-366f-5e2e-b88a-f1f8864c3dd4", "191c67db-44a8-4f63-994a-d85e8e301194", "exact"),
                        Tuple.tuple("2a0c0c00-d8ce-5f13-86f5-b554c6adb55c", "2ae76eae-799c-463e-9ec9-82327f8209a8", "exact"),
                        Tuple.tuple("422ff66e-1c62-5db8-8441-2bc1fb00d5c1", "191c67db-44a8-4f63-994a-d85e8e301194", "exact"),
                        Tuple.tuple("4cecec79-3787-5813-b906-1dd4c27ff716", "54148506-c23f-41b8-959b-068dd194cf15", "exact"),
                        Tuple.tuple("4d77f5fc-016f-527e-a1c3-44797aead19a", "5d1decb2-b01b-5c85-88fc-9fc255ff9776", "exact"),
                        Tuple.tuple("3abd1c47-94bf-51b5-be22-bc6254b5c5d9", "191c67db-44a8-4f63-994a-d85e8e301194", "partial"),
                        Tuple.tuple("a4d493e3-d0ea-5b91-bada-aa44e64e431d", "b5de0574-93ed-409c-80ee-312211420cd6", "exact"),
                        Tuple.tuple("bc28dc07-590a-5e10-89d6-a36a580cfcc3", "b5de0574-93ed-409c-80ee-312211420cd6", "exact"),
                        Tuple.tuple("a080d619-2432-5f2f-bf8f-bfbbd8d71680", "03a87896-088d-4b21-a37b-d0604d784540", "exact"),
                        Tuple.tuple("13fbb93a-d54f-5785-a186-3f1ad76c7069", "de39c9fe-5940-4320-aca8-2be85d6ada8f", "exact"),
                        Tuple.tuple("2aa11de2-4cbc-5c4c-b024-c5483a94958f", "a075ae99-7669-563d-807a-f91b119c020a", "exact"),
                        Tuple.tuple("37111b61-0ec2-5768-b19c-16b42cbf3b9f", "c9e01667-24c4-56a2-8cf4-dfb6c360d7b9", "exact"),
                        Tuple.tuple("1bd6fc10-3149-5617-8bd0-93bba977ce88", "ca8b2e67-7d14-5baf-8404-26820fe3d548", "exact"),
                        Tuple.tuple("fc9f6f92-3413-5d08-b34e-495a9842b70e", "4eeab7d5-eeb3-579b-845e-1c52ffe9e89f", "exact"),
                        Tuple.tuple("2ebe83ff-92fb-5361-a22c-59e9dabc8da0", "ee48e811-4c9c-5080-9836-8403fc9f0810", "exact"),
                        Tuple.tuple("5b08c1b6-30ef-54bd-b37e-9edec60a135d", "26f668a0-6425-5466-9cf7-6295dd189005", "exact"),
                        Tuple.tuple("81b0008e-77cc-59eb-b47f-ff771798feea", "0a6dab2e-1bbb-5587-adb0-456d3991c327", "exact"),
                        Tuple.tuple("b8c61260-042e-56f3-8ff8-beced2e27ea2", "25593605-5e13-55cc-9a05-8f3d737e15e9", "exact"),
                        Tuple.tuple("8de6f8fb-9321-544b-84c2-5e84ea612edc", "2231c29b-eb4e-51ae-9cb1-eb033bf16099", "exact"),
                        Tuple.tuple("b6f39123-3374-54f1-bf82-41d8d3d7da26", "31a89d59-7d45-5e60-a8e8-561001b05f2d", "exact"),
                        Tuple.tuple("c1f22e65-7c06-50a5-98d0-7873bf9f986e", "2331caf2-ccb2-5492-9fc6-48763b848bae", "exact"),
                        Tuple.tuple("a36f594f-1af9-5b23-b221-71b162bee6fa", "d98849c7-bd0b-50d4-90aa-6293a3adb211", "exact"),
                        Tuple.tuple("fd9fbf2a-f74e-5bdd-874f-4ba62db3bd54", "cafd6520-c4af-4109-9863-cc49ba6fad4d", "partial"),
                        Tuple.tuple("38b79bab-b0f8-5c05-8265-41405438fba0", "cafd6520-c4af-4109-9863-cc49ba6fad4d", "partial"),
                        Tuple.tuple("8d77f0e4-6922-5d12-a83d-23273f225645", "5d1decb2-b01b-5c85-88fc-9fc255ff9776", "partial"),
                        Tuple.tuple("f9e2689e-c719-554b-83bf-7672610d65f2", "8f7bb79b-f014-4bb6-8dce-7e3f1c92e893", "partial"),
                        Tuple.tuple("202bc527-89a6-5d79-9858-275cf354ada7", "f2e42af5-67a6-477e-82ea-e65b09cc6cb3", "partial"),
                        Tuple.tuple("16137458-ec89-5a6f-8e3f-43e94b577f9e", "d6c3fb37-ece6-5b56-9221-1eeb21845877", "partial"),
                        Tuple.tuple("8e3ba386-9628-53a7-8316-b5f362915245", "de39c9fe-5940-4320-aca8-2be85d6ada8f", "partial"),
                        Tuple.tuple("5fb837ec-f4a3-59af-8328-a5f9ba2d8bcb", "ca8b2e67-7d14-5baf-8404-26820fe3d548", "partial"),
                        Tuple.tuple("93d8b115-f221-5246-9460-b8ab07bb31d4", "4eeab7d5-eeb3-579b-845e-1c52ffe9e89f", "partial"),
                        Tuple.tuple("96d899b1-a90e-5884-8c16-a93c2a2da783", "ee48e811-4c9c-5080-9836-8403fc9f0810", "partial"),
                        Tuple.tuple("6771c65a-5cb0-59f2-a1b1-b0b095cb40c2", "0a6dab2e-1bbb-5587-adb0-456d3991c327", "partial"),
                        Tuple.tuple("a1c494bd-8269-5ff6-bb75-9d251d05a81a", "87c55be5-06a9-41e2-a0d4-c60f7c8b8078", "partial"),
                        Tuple.tuple("e22589c0-cc0d-5df1-8103-b02fc26be319", "1f89d69e-ead1-424b-8221-fae37fdea2bc", "partial"),
                        Tuple.tuple("0235cf56-da4b-5657-86be-92608b235e6c", "fd860da9-73ba-47cd-a1a8-452424915a80", "exact"),
                        Tuple.tuple("15791d46-b748-5777-8648-af4c6af9bee5", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("ca560cc7-44cc-587d-a0b7-d3cb241de1e0", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("4aa5a331-6709-5c03-a105-b4bcd58e313c", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("7ee3da1c-1f20-5038-9828-ab74e0e1e49f", "c65ecabf-d00b-4e2d-99ae-b64692325ffb", "partial"),
                        Tuple.tuple("54ec2f95-b4b6-5749-ad24-2cb2e1654a19", "eb993c0c-9b1d-52af-97c8-4a534fd78be3", "partial"),
                        Tuple.tuple("f5089a02-6357-5d00-b8de-8f9ab9b79163", "fd860da9-73ba-47cd-a1a8-452424915a80", "exact"),
                        Tuple.tuple("ec1ffbeb-7195-5dc5-959a-b3473fcccad1", "fd860da9-73ba-47cd-a1a8-452424915a80", "partial"),
                        Tuple.tuple("fc5f5e55-a6c4-5175-8e96-a04dee910927", "e07fa2ee-c26f-4032-9140-358a4f6c1457", "exact"),
                        Tuple.tuple("dcee9e49-f692-5b96-bf72-9c45c46ebe28", "491e0858-e977-516e-a339-1cc2f9e9690f", "exact"),
                        Tuple.tuple("8b1bb498-dd60-5dfb-bba0-dab3d7f28873", "b44f038c-fb1f-527e-b9ad-382214d0328a", "exact"),
                        Tuple.tuple("5038bcee-e704-5314-bc3b-69d970cbb4c8", "57fbbf31-9b8c-5408-9af5-fbc73acd12bb", "exact"),
                        Tuple.tuple("a0ffba4e-bc61-5461-af88-c14577534f15", "32c9955e-c0e7-4085-8a9a-9341376a453b", "exact"),
                        Tuple.tuple("daa23b30-8add-5020-a20b-553475e48c49", "71d43fcc-d787-4874-ae4a-2336364e9c0a", "exact"),
                        Tuple.tuple("514f2677-ab12-575f-859d-076c5a638608", "72b6bfa5-8e34-4029-8f85-0277207c485e", "exact"),
                        Tuple.tuple("139f9c35-eadb-500e-831a-8ad2fc135d2a", "91571d3f-3651-4477-ba21-320fc4077453", "partial"),
                        Tuple.tuple("6ea1627f-a173-55c5-b673-9d72b01a1b96", "acbb7e26-f85f-405b-a3e5-affa6add6711", "exact"),
                        Tuple.tuple("53bdf2fb-bd6d-504f-a0b4-6911dac6df41", "15505229-efec-4d01-8e71-acf15f9c2424", "exact"),
                        Tuple.tuple("96f18796-b6a6-57c3-aba1-2ee9b7ab4a14", "075ef99c-7f84-48b5-97f1-4e28c7d78f95", "exact"),
                        Tuple.tuple("9728e341-4cf5-5afb-ae2a-86ecccdf5e9c", "2242c379-ddbb-4f03-8aed-13f49a4674e8", "exact"),
                        Tuple.tuple("411d5503-e9d7-5804-8c18-e9da20432d81", "3e0c9bce-2528-4cf1-9b1f-c79146b0a5f2", "exact"),
                        Tuple.tuple("121d4786-c326-5539-b64e-ca0f0d3ea8c8", "b819973b-4cad-48a4-9f7e-f74b5e75ea6c", "exact"),
                        Tuple.tuple("f236d582-5efb-5f5f-896b-c09264a49238", "8da730f1-8947-498d-9e78-7fb20b00a994", "exact"),
                        Tuple.tuple("24f8022a-1e3c-590e-940c-1757a57234c3", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("4384d588-b950-5f60-a25b-63cd0474d4f9", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("44353f81-3eb6-57d7-b32c-ada4438b7562", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("03937245-9cb8-51eb-81d3-b93079213f3c", "8da730f1-8947-498d-9e78-7fb20b00a994", "partial"),
                        Tuple.tuple("ae549d5b-434c-56f8-9be2-949e926f0256", "325771e1-602d-4bca-a199-a8f39a2d3dee", "exact"),
                        Tuple.tuple("ea991d73-738b-5ea6-8878-49e912ee3044", "325771e1-602d-4bca-a199-a8f39a2d3dee", "partial"),
                        Tuple.tuple("cbe9c909-ac17-5ad4-b16e-1e013b8d4f72", "325771e1-602d-4bca-a199-a8f39a2d3dee", "exact"),
                        Tuple.tuple("81e8bae0-979b-585a-81ec-bd4ed60d5aa6", "f0a49da2-018b-4cda-adbd-27047b610a0f", "exact"),
                        Tuple.tuple("6606025c-9967-511b-ab42-2aabebfb06a5", "f0a49da2-018b-4cda-adbd-27047b610a0f", "exact"),
                        Tuple.tuple("022570e5-d25c-538a-bc21-281e1e04319b", "f0a49da2-018b-4cda-adbd-27047b610a0f", "exact"),
                        Tuple.tuple("f9538605-8bf4-5279-b00a-c18786f9cc51", "5c6b7342-0f67-4b4c-894d-fd83a6df64b3", "partial"),
                        Tuple.tuple("0042dc1e-859b-5c95-95a4-48aeff1bae63", "09f47964-2cd0-410e-93ee-9632b582fc91", "exact"),
                        Tuple.tuple("32a0f358-c1e9-5663-b8cf-67789355387c", "a8c42ee9-2898-4247-819f-c235032ac78a", "partial"),
                        Tuple.tuple("915c61ed-2e79-5171-9d6d-cf584a4b0528", "e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb", "partial"),
                        Tuple.tuple("4d86904c-6259-53c6-9768-55d314a041fe", "612dfc95-95cb-44df-80ae-d8446199cb0d", "exact"),
                        Tuple.tuple("97efb769-8e4f-56a1-acaf-f2d230263ef9", "34ba4714-a0ff-4a48-857f-d2481cbe0441", "exact"),
                        Tuple.tuple("9a14516b-775f-5d35-8a04-bd705a57e09b", "fa72cf74-a31e-402e-90d7-422c118f4a5b", "exact"),
                        Tuple.tuple("20ddd1d4-c0fd-5dc8-9a8f-a6cd4bd665f5", "c420e0be-1e74-4050-834c-d8da7f41095a", "exact"),
                        Tuple.tuple("6c6f187b-d9c4-5743-b507-b51d54f3414e", "6596405a-9728-41df-9163-53670ec2a937", "exact"),
                        Tuple.tuple("e5acc4c2-02ec-5df7-9b7d-fd9328e47b83", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "exact"),
                        Tuple.tuple("40b2829a-35fd-5e6e-96ba-20ec6928940d", "5ab17678-bba7-4e6b-9aff-5a909e24d40e", "partial"),
                        Tuple.tuple("3911d7c9-3248-5cee-bc31-77a1bf5f30b5", "546bf0b3-6921-416b-a2ef-8fd37d429dc7", "exact"),
                        Tuple.tuple("9cbeea58-0cff-5503-837e-4a995928d1ad", "546bf0b3-6921-416b-a2ef-8fd37d429dc7", "exact"),
                        Tuple.tuple("d2705044-4ab6-5020-b500-7093f80df8f3", "415bd48b-8a76-4d4f-bfdd-d085573e7ac3", "exact"),
                        Tuple.tuple("df2633fe-483d-580d-9405-ba107c0b185d", "415bd48b-8a76-4d4f-bfdd-d085573e7ac3", "partial"),
                        Tuple.tuple("67193ff0-3eee-5bff-9bf5-0ee7ea7adf3d", "2bb4bb91-7929-483a-b735-44275f6b5cdc", "exact"),
                        Tuple.tuple("577b706d-e03e-53e8-b2fa-ddd9738b01db", "5a7095a2-2b3a-48bf-9536-eca79ee5ff8c", "partial"),
                        Tuple.tuple("b7644f86-2499-58c6-ac63-1409de0c8c69", "d64516eb-9dd2-4808-91d0-0040ccdc281f", "partial"),
                        Tuple.tuple("3d5cd025-ef32-5447-9626-ae79a51a6a73", "902de188-6f27-47c2-ace1-9b2c5771fde8", "partial"),
                        Tuple.tuple("51b3e1f8-f6e9-5db8-a5ce-403815407d45", "8a0b0baf-c7e6-43df-a470-f56050ecaa46", "exact"),
                        Tuple.tuple("0a656ad8-0c77-5ad6-9470-fb1df7fcc552", "f8704a7b-e93d-4e32-b0f9-1b171545fe28", "exact"),
                        Tuple.tuple("ff811135-d54c-532a-82e1-a3ef98a1feeb", "7676b0f9-340d-4a91-ab1f-92745a8f88db", "exact"),
                        Tuple.tuple("2cd98956-470a-58a4-97c7-274366ba9794", "c9eb293a-9be7-4a3d-8cd0-a1d885a3fdc1", "exact"),
                        Tuple.tuple("62713690-253f-5266-b11f-8f694b97b395", "4f889e45-3c1d-4a8e-8fcb-3582d40d9e8a", "exact"),
                        Tuple.tuple("4a6cfdff-0b94-5713-913b-5db6f0e068ac", "62e0a4e3-d1d3-46a2-982d-6b99dca6d3fb", "exact"),
                        Tuple.tuple("15c31e1c-ddaf-5db8-a6a2-5d177fdad216", "5a9702f4-7e4d-457d-b98c-f0bafcd1e386", "exact"),
                        Tuple.tuple("1aab2db4-7a01-53d5-88ce-ef89adc54f02", "d4a9fc20-d1be-46e7-86e9-2bf8d7a9cc40", "exact"),
                        Tuple.tuple("aa132996-19d1-5788-a303-2d9a3d44337a", "0d4a6f56-2f87-4c39-98ab-5f13f5cbdd40", "exact"),
                        Tuple.tuple("c74ac5a2-32bb-5c9c-af1a-627fe7b55782", "5bced7dc-6557-4af1-9e70-d87f850d3b7f", "exact"),
                        Tuple.tuple("9bb26164-a8a2-5a4e-9b8d-b4992c8351ec", "9023226b-fc17-412b-807c-2bb45cd551d5", "exact"),
                        Tuple.tuple("cb153956-608d-5f83-98f2-da7f479c7ba2", "e0c3359d-7d8a-4d01-a25e-a8cd5ebce90e", "exact"),
                        Tuple.tuple("cd991abf-058c-54a3-8690-a76ed51060f8", "7bff61c1-1a69-4991-97de-0cff764f507e", "exact"),
                        Tuple.tuple("c7a84905-dab0-53da-be54-e4bb8a499d2c", "5743b8f9-86cb-4e24-8859-351708d070ab", "exact"),
                        Tuple.tuple("9c7c7e7c-68e5-5432-8ec9-44ca6d47a23d", "a7ccb7a9-6fb0-4e2d-b6e0-6420cc5ae0bf", "exact"),
                        Tuple.tuple("5b3b5702-0d1d-5c74-b768-98775ef63a22", "50aeb801-d2b5-4939-b66b-2fcae0352dcf", "exact"),
                        Tuple.tuple("65594e82-8ecb-5c2d-ba80-98c0ac7fc6ad", "759485a9-51c0-4261-af7d-caa3c0e5d68b", "exact"),
                        Tuple.tuple("a00ca20b-d872-5e7a-82d1-a840e2e95ed9", "4ac925cf-3862-4810-be2a-d92efff7d735", "exact"),
                        Tuple.tuple("c31989a6-71bc-56b9-b858-3012be82ad00", "ffd1ae26-c461-4439-9b18-d835c8f38e1a", "exact"),
                        Tuple.tuple("220d1b8c-ec1c-530e-a812-a5b4190da8f9", "289db903-2831-45ef-afc2-c0619c91d680", "exact"),
                        Tuple.tuple("eedd3bfb-3d04-536b-aff9-b24f36d29bfc", "289db903-2831-45ef-afc2-c0619c91d680", "partial"),
                        Tuple.tuple("85cd279d-bdbe-5691-bc23-f911c5d8b4f7", "4d78bbcc-89b8-47f0-aa45-516199e4da5d", "exact"),
                        Tuple.tuple("2b739fed-39cf-537c-ae6f-754b2efb1d01", "4d78bbcc-89b8-47f0-aa45-516199e4da5d", "exact"),
                        Tuple.tuple("fb20bed3-2c5b-5745-8031-c34a902ac9e7", "219ce079-6bfd-4827-8b66-5dd199e44686", "exact"),
                        Tuple.tuple("ef7d6c31-704c-57df-b974-3ec8b7bed6ed", "71a483ba-9680-4654-bb5e-5ab5427f0919", "exact"),
                        Tuple.tuple("5c48c28e-71b1-51c3-9dc4-ba200746a18d", "0cefa694-636e-4c4b-abff-3ac3750dca18", "exact"),
                        Tuple.tuple("e8867a12-8662-5d23-85ca-081e6559403f", "97b3232d-b89f-48b8-9fa1-7a25a1bdbb3d", "exact"),
                        Tuple.tuple("87b53bf0-19ff-5f09-bef0-f210b2d6199f", "ef40a255-b6d4-4a1e-93b1-b79e65fb585d", "exact"),
                        Tuple.tuple("e16247e4-db2b-5cc7-81d4-5d7e279a5dd4", "42e19186-6769-41ac-a7bf-ab39bdb50661", "exact"),
                        Tuple.tuple("5e334eeb-c4d3-5ec8-94ee-ead8e4cd0db0", "78238608-aaaa-4d12-a9de-54f325e9cf6f", "exact"),
                        Tuple.tuple("9d1147ec-f55b-5ebf-83ca-48b494e6d160", "c7911f0f-83d4-44ba-9f28-bdc1a5e8cb4a", "exact"),
                        Tuple.tuple("3d826a45-982d-59b1-a761-69503d6ac0b3", "efc3506a-5f35-4d77-9498-d70a091a470b", "exact"),
                        Tuple.tuple("35e00329-f800-5d1a-9ccc-0c10cabcc8ab", "e55edcb9-2184-4a24-890e-70cc91028990", "exact"),
                        Tuple.tuple("4c449fa1-6695-5bf5-867d-3e29e0f669e5", "5d17ebb4-4e27-4f9c-8d0b-3520f34b2e11", "exact"),
                        Tuple.tuple("ef731877-eaae-5569-aa24-4214f1e412a5", "1ce8af38-082a-477b-af48-b924c92761bf", "exact"),
                        Tuple.tuple("c35677b0-5174-5c90-8a27-b8bf2948ea8c", "efc3506a-5f35-4d77-9498-d70a091a470b", "exact"),
                        Tuple.tuple("f7f35bcd-6ff5-5129-90e1-07aa2fdf704a", "6248bbd7-c7e8-4f91-b3dc-de885cf5abce", "exact"),
                        Tuple.tuple("be9839c4-54b0-5665-883e-20a42b874660", "74d29d0c-80b3-4d46-a5f5-3c2f609e8483", "exact"),
                        Tuple.tuple("b66f6a12-a56b-58d0-bc9b-de5c37232b97", "b9f2cf6b-f892-46a5-8f0b-2a916f0f2f8e", "exact"),
                        Tuple.tuple("668aa24f-078f-5e84-99ee-4307fe2b9556", "a4f6f5e4-f790-48d1-8b49-c9dc048c9d83", "exact"),
                        Tuple.tuple("b2e5d0bd-a102-5d6c-a55e-1f48c1796638", "4fc77ab5-90aa-4aa7-941f-6c807dde54fe", "exact"),
                        Tuple.tuple("beb76ec1-ff8b-58bd-b564-c8af364dea5a", "50612a57-7b9d-45fd-bc08-e95556444760", "exact"),
                        Tuple.tuple("5ddd53f7-1c68-5a70-bf48-6f25d08e5735", "1ea06c0c-5c60-45cd-8f31-638de98820b4", "exact"),
                        Tuple.tuple("3c673acf-6a61-57ee-93aa-4ed70881f9d3", "6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9", "exact"),
                        Tuple.tuple("406dd91f-417d-5fc5-8982-49aa618dd301", "bd63c0fc-50ef-55aa-ae6c-25cf73d02636", "exact"),
                        Tuple.tuple("3f7dc22b-a981-5462-8849-1c61273c1438", "f7879354-1a82-4195-8e3c-a339a820439c", "exact"),
                        Tuple.tuple("e5f72636-49b6-59a5-b725-da89600d96b6", "1e26404a-93ef-45f3-a28c-15679fbae96b", "exact"),
                        Tuple.tuple("9bb817bd-9d30-5667-88db-0dc6bcbf1e8a", "074d755a-d307-4569-baa9-128ad6ea97dd", "partial"),
                        Tuple.tuple("532c66d0-f4f1-5689-b97d-025f7730da5d", "0a024ecf-27ee-40a2-bf41-0e2faaeb1252", "partial"),
                        Tuple.tuple("76b7e724-aff5-5e69-93a5-8ca1d4e72a8d", "e55edcb9-2184-4a24-890e-70cc91028990", "partial"),
                        Tuple.tuple("03bb6fae-84a6-59c5-b56a-0f4128688706", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPhysicsPilotBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_PHYSICS_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_PHYSICS_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_ID);
        assertThat(file.getMappings()).hasSize(26);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("e11f30f3-937f-5775-998e-13674c877f74", "5c44b9ba-9b05-4774-95d5-073230d3fc4f", "exact"),
                        Tuple.tuple("7c3355b3-7488-53eb-8f04-bd6f18d5c02d", "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd", "exact"),
                        Tuple.tuple("c75cb2dd-c143-5537-82aa-4676a1148c71", "31a2ef52-114b-4d2c-a720-6ef5a390b6dc", "partial"),
                        Tuple.tuple("a114f68b-91d5-593e-9d5b-d31d3240bf19", "5ea765ac-c279-551a-8a94-a07da2381e5b", "partial"),
                        Tuple.tuple("c8acde94-88ba-51a7-a5f8-6888207081b0", "a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20", "exact"),
                        Tuple.tuple("ec2bc490-efbc-54ba-aff3-3369767f0a83", "68c90ba6-c438-463c-9a53-cf61062d416a", "exact"),
                        Tuple.tuple("f431504c-3f62-562b-9af2-1475a3eaeed8", "feb70838-931c-4b45-b9a9-930605d93efa", "partial"),
                        Tuple.tuple("37327429-a775-5bd8-a777-e8695d4df244", "94784e0a-7ddc-48be-91fb-dc82b78eb322", "exact"),
                        Tuple.tuple("01dae520-33a8-5953-ab1d-f3329aff9a09", "6affc2ea-ecd2-4fcd-8877-3ffa15b0425b", "exact"),
                        Tuple.tuple("b0a2ec7a-df5f-5bf3-b8eb-f3668c25917d", "722857cf-f327-5740-8151-64eb92195ec8", "partial"),
                        Tuple.tuple("3c283b9c-4a1a-5c7a-bd1b-e19a961b7710", "32b896b9-f2f1-4d4e-96ad-e869ac3d3759", "exact"),
                        Tuple.tuple("aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b", "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3", "partial"),
                        Tuple.tuple("3d13ecad-1fab-527e-a833-5596edaa23c5", "912febf0-754a-4409-9f8b-7d66810edc08", "partial"),
                        Tuple.tuple("479784b2-511c-5b2a-a1a1-f9c7625fd5bb", "a0aaedcb-41f8-4891-af77-a69a76b8c10d", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalChemistryBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_CHEMISTRY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_CHEMISTRY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CHEMISTRY_ID);
        assertThat(file.getMappings()).hasSize(60);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("6600db65-5d0e-5d6b-8b51-20ac0d06e3fa", "442c31c5-c561-5c7a-90bb-2335d779175c", "exact"),
                        Tuple.tuple("64e24cec-2ff4-536c-8a16-aa65958162f7", "3588c15e-adbe-5b81-b3a7-10da20574e3d", "partial"),
                        Tuple.tuple("23135ca7-9f40-593a-9542-aeadb070ab92", "a9c22adc-b543-5b0c-a2d8-3189facdff08", "exact"),
                        Tuple.tuple("546af1fa-285f-572e-8565-d5d56b38db6b", "c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0", "exact"),
                        Tuple.tuple("5cc8161e-c2d6-5dbc-a74f-894f94561040", "5a709938-e0f5-42b7-94f0-cfded08963a2", "exact"),
                        Tuple.tuple("4e4df093-4242-5797-926c-1c224f0ae7a5", "d2ccd1d5-56f7-583f-9724-e97441367f91", "exact"),
                        Tuple.tuple("95174725-dac5-5218-83c7-d5de8bc85dfb", "1bdaf7f2-ff3b-455a-a7fb-95a44642762a", "exact"),
                        Tuple.tuple("69d093e8-d576-5059-9dbb-026ef668ed40", "f5efab9d-2c61-44ea-b36a-87f873b51fd8", "exact"),
                        Tuple.tuple("60c79401-7618-51f2-ac20-be5024fa5ccb", "70b12d1c-abaf-45c6-ae9e-b571e9cbc126", "exact"),
                        Tuple.tuple("9ac37e41-7308-593c-b99a-d47df850ebef", "a1632ea9-ca04-4f6a-bed2-06b3aa8d38ca", "exact"),
                        Tuple.tuple("fe0fba92-5f7c-5af1-ab2e-7acd057f8721", "950c73c6-4ed1-488a-9267-1142e95e0055", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalBiologyBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_BIOLOGY_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(BAYERN_BIOLOGY_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_BIOLOGY_ID);
        assertThat(file.getMappings()).hasSize(104);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("3684bc95-f3db-5b57-b12e-9e02de718fad", "e8d54127-d42e-51f5-bfa5-51d826069f95", "exact"),
                        Tuple.tuple("51457572-b3ad-5ba3-aa12-86ca45067b08", "2d451684-6e53-565e-a987-f362da919d2c", "exact"),
                        Tuple.tuple("83af486d-92eb-501a-b32d-15a256be7d60", "3ae95c96-e058-5045-b5e7-a613b8086f8b", "exact"),
                        Tuple.tuple("e4f857b8-85da-58e5-9fb4-b4f05048d3b5", "0daa79f6-8f61-5506-98f9-65db83062ba8", "exact"),
                        Tuple.tuple("b17074cd-317a-512a-a4d8-6fbd5d037dd4", "7008979d-7890-5f7b-ad07-27b8bb597cbe", "exact"),
                        Tuple.tuple("d5f642ff-c74a-5bac-ab9c-2e2ba0c38ea8", "02f8a5a3-9c44-50ec-b9b8-a0b7f402aaa8", "exact"),
                        Tuple.tuple("bece32f5-e9d0-507a-bfe0-6dda01dbfc3c", "ce19b80f-d392-5851-ac92-750c85adfb3e", "exact"),
                        Tuple.tuple("28f74263-1c3e-5167-a8a3-1f5665e07cce", "c7f2fc89-543d-5ad1-9875-d6fcedf0d1fb", "exact"),
                        Tuple.tuple("861204d6-ce05-53c9-979f-6a69513a2313", "ce6550f0-4ec3-5dd9-ab02-0296da98a371", "exact"),
                        Tuple.tuple("bdcdaefb-beca-5619-9069-971878b0f2c4", "b530a382-2786-5794-8821-3e01a62d88fd", "partial"),
                        Tuple.tuple("ea1d4041-df5d-55e4-8286-3898c3063826", "91df35c7-e384-50d6-bb3a-37e74a6086f1", "exact"),
                        Tuple.tuple("1bd09328-9ddd-588a-a249-2925d4b2b638", "b1dff57f-329e-5264-b2b9-2db71a0b2172", "partial"),
                        Tuple.tuple("52dacb20-f483-57f5-b807-d0525a92a90a", "e0d04e58-1591-5230-bfa6-5c685b56d25b", "partial"),
                        Tuple.tuple("b0468d88-9a13-5f8c-ac3b-02c0761dda94", "fc8c4b02-02f2-5ad6-b481-224d36121da1", "partial"),
                        Tuple.tuple("d0cf0ae9-8943-5c29-9708-b394592d214c", "0dbe758c-73c8-530b-bbbd-fb55540f942f", "partial"),
                        Tuple.tuple("39e911cd-891b-5aa3-af27-bf5d3053d6ff", "0d96a802-2a8d-5445-a7fa-02387f6b1f2d", "partial"),
                        Tuple.tuple("85368f70-5bd9-505d-a526-59163690bf59", "e6f128c8-b38e-5167-9367-77e079a994c3", "partial"),
                        Tuple.tuple("8dfbf944-a8f0-554e-9d59-ab3cdb58c4f1", "576d59e2-397a-5654-b853-7c0c4870fbd3", "partial"),
                        Tuple.tuple("4937d96f-d201-5b33-8846-adaed54f90fd", "ec782ce3-475e-5628-b3fe-947d72e74a74", "partial"),
                        Tuple.tuple("2cc41e62-ec79-5add-9d43-2499b4e147b2", "fc89ed54-1a78-55a9-8e54-751d6d46dad6", "partial"),
                        Tuple.tuple("28cff3a6-fbf0-5a20-99fb-1275396c92fc", "860c80f9-e463-598b-8ef8-79f65c12f235", "partial"),
                        Tuple.tuple("a161e6be-c302-513e-ba6b-ae217ed84a78", "8e7c6b98-fb1a-5f08-8531-685a4ffba4ad", "partial"),
                        Tuple.tuple("f1cd45f3-3468-57fd-b104-4c8d2ddc0350", "ffef97e3-12d6-5090-9816-46ab9e57fae2", "exact"),
                        Tuple.tuple("61a685c4-b335-5c2b-a803-60c1c9e2cea6", "523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0", "partial"),
                        Tuple.tuple("6070f87e-700f-5b57-9081-71d5f71975a4", "440854be-7f06-5678-91cb-ba8dcab56959", "exact"),
                        Tuple.tuple("65529a29-8e40-5c29-ab13-43c5e9d91fe0", "2706c28e-1c21-50de-8a63-c450f5fe8b07", "partial"),
                        Tuple.tuple("b36b6f3b-658b-5850-8f78-281a84e9c823", "43673384-387a-51ea-9d04-6831b0ad7e2d", "partial"),
                        Tuple.tuple("60dd81ee-67d7-5b65-add8-07fc9c111c85", "25eaa5cf-e8f9-573d-8a53-8ae9d1cd02e2", "exact"),
                        Tuple.tuple("e8e2f7a6-c2e2-537e-85aa-cd00aeb61941", "914fb22b-e19e-5f5e-adfd-eff27bf5f1f5", "partial"));
    }

    @Test
    void parsesRepositoryBackedCanonicalItalianBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_ITALIAN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo("c7643536-1163-50d8-86a6-9645c8fd3e25");
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_ITALIAN_ID);
        assertThat(file.getMappings()).hasSize(8);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("36bfe00a-bc24-51c3-a637-75e1dfcfcd61", "cb32eb5a-9a4b-5dd5-80be-73d8fbda172c", "exact"),
                        Tuple.tuple("fcb79ea5-e777-50a0-927a-72edc5dfb4c5", "7c89bfc4-b001-59c1-9a19-9c9e4a83fd21", "exact"),
                        Tuple.tuple("a6a8a7eb-30a9-5337-a02d-33a7f8be17a8", "df6d1dc9-dadc-5ff0-bebe-eface1b95948", "exact"),
                        Tuple.tuple("171c1c85-16bd-521a-ad1d-b9d3d1b5e8b9", "6eec68b1-4dd2-5a42-8467-5b7deb213dfa", "exact"),
                        Tuple.tuple("9c91106a-0182-5ac0-af41-fd34580ecb81", "f8810521-c399-5775-b779-1af2cb588663", "exact"),
                        Tuple.tuple("b710be14-8d49-5f14-ab37-394b35b84e10", "a9b442ce-de30-55f4-b682-838a706f26a4", "exact"),
                        Tuple.tuple("fff7f4a6-0f64-5f5f-9d49-a95e3f585205", "23f29732-237f-5f20-b0b0-5e865b9b593c", "exact"),
                        Tuple.tuple("cee158c8-bf51-5eaf-8e7a-026c2ad1426f", "563b7785-04ac-51ae-b580-769f15630b9f", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalRussianBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_RUSSIAN_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo("2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7");
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_RUSSIAN_ID);
        assertThat(file.getMappings()).hasSize(8);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("012e0bc6-3a26-5714-9b24-b680c39c4c67", "19432aca-4835-5af0-9424-a1e0cbd5ec13", "exact"),
                        Tuple.tuple("37df8430-2f97-50f8-a852-84e0be2da04e", "90e9542c-d052-5919-b6f7-ab461d155e75", "exact"),
                        Tuple.tuple("9cbf13bd-be33-5065-8bf9-fccd417ffde3", "a60dcdfb-e81d-5d16-9c7b-086e16a5503d", "exact"),
                        Tuple.tuple("1870e5d4-820b-5b5f-977c-18b057650f8f", "5f0b7317-bb89-5372-926b-89d2a3752d3d", "exact"),
                        Tuple.tuple("7734c2e5-082e-5627-890e-3a7a4d6ba087", "d20ee7f6-a045-5918-b650-49b93e6c9301", "exact"),
                        Tuple.tuple("3ee5e185-0780-5393-bffa-0969a0333812", "749d4bf1-adae-5c7d-a3e3-bd589074454f", "exact"),
                        Tuple.tuple("27a72fb0-ff7a-57c0-b099-f4db126f2113", "23be9650-c714-53eb-8854-0c0bbdbe1ae4", "exact"),
                        Tuple.tuple("0c88e884-8ae3-5c64-8ee3-09a27a8781a8", "ec657ef1-ec24-5e59-8eeb-1f7ef7748eee", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalPolishBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_POLISH_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo("21148204-794c-515d-ae20-c4d5cd4e56d8");
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_POLISH_ID);
        assertThat(file.getMappings()).hasSize(5);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("de5177a9-8ab6-5212-8df4-3caa69d1f465", "bada14f4-1b44-5ff1-89d1-8a3c8c2127ca", "exact"),
                        Tuple.tuple("22cafb13-f570-501c-b7e6-1455f9db04e9", "dbe53e98-bc35-5568-89ed-fa292051c1dd", "exact"),
                        Tuple.tuple("44807e72-96c6-576e-bd89-43954a0e281a", "7253caaf-5994-558d-a03f-ff52414ddc37", "exact"),
                        Tuple.tuple("fe788439-8cf6-5974-9027-317cc4be0555", "89b2c61e-d557-553d-9998-8e79ee95c5ce", "exact"),
                        Tuple.tuple("05cf291b-4511-5083-ac04-ace963b1461b", "44045cab-2b51-5c1a-836e-8d3bafe14e29", "exact"));
    }

    @Test
    void parsesRepositoryBackedCanonicalCzechBavariaMappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(BAYERN_CZECH_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo("097f3667-2488-57b2-a3e0-2cb334e422a2");
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_CZECH_ID);
        assertThat(file.getMappings()).hasSize(5);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .containsOnly("exact");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
                        Tuple.tuple("31ccde1c-6733-5e7b-888c-885111a2ce59", "b75e9bca-6470-5c4e-b7c8-1f52012a27c9", "exact"),
                        Tuple.tuple("c09a1fe9-529b-5022-a541-a073b28f3d76", "bce55678-c4c3-52e9-9e21-97c0ba051135", "exact"),
                        Tuple.tuple("fada773b-c6bb-5574-bffc-728e0cb78052", "6d8b2fdb-af63-5110-abc2-fee9946b91ff", "exact"),
                        Tuple.tuple("7fd2f437-be58-5f8b-acef-4e8b6b6113a5", "6c3b3d83-8114-5a20-a317-eff44a1dd250", "exact"),
                        Tuple.tuple("983cd7b4-717c-5871-b4d1-b6b0681153b2", "37ddd926-3e77-585a-bf0f-1a27fa2689d6", "exact"));
    }
}
