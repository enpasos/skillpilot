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
    private static final String BAYERN_MATH_LANDSCAPE_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String BAYERN_PHYSICS_LANDSCAPE_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String BAYERN_CHEMISTRY_LANDSCAPE_ID = "ff1ca997-b6cc-5ece-8e13-5498b4bbf808";
    private static final String BAYERN_BIOLOGY_LANDSCAPE_ID = "357a7003-b636-570e-a0bd-6bb63518d2f6";
    private static final String CANONICAL_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
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
    private static final Path BAVARIA_GYMNASIUM_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-BY/gymnasium");
    private static final Path MAPPING_FILE = HESSEN_UPPER_SECONDARY_MAPPING_DIR.resolve("hessen_math_upper_secondary_to_canonical_math.json");
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
    private static final Path SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_math_lower_secondary_to_canonical_math.json");
    private static final Path PHYSICS_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_physics_lower_secondary_to_canonical_physics.json");
    private static final Path CHEMISTRY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_chemistry_lower_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_biology_lower_secondary_to_canonical_biology.json");
    private static final Path FRENCH_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_french_lower_secondary_to_canonical_french.json");
    private static final Path BAYERN_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_math_to_canonical_math.json");
    private static final Path BAYERN_PHYSICS_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_physics_to_canonical_physics_pilot.json");
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
        assertThat(file.getMappings()).hasSize(33);
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getMatchType)
                .contains("exact", "partial");
        assertThat(file.getMappings())
                .extracting(GoalMappingEntry::getLegacyGoalId, GoalMappingEntry::getCanonicalGoalId, GoalMappingEntry::getMatchType)
                .contains(
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
    void parsesRepositoryBackedCanonicalPhysicsSek1MappingFixture() throws Exception {
        GoalMappingFile file = new ObjectMapper().readValue(PHYSICS_SEK1_MAPPING_FILE.toFile(), GoalMappingFile.class);

        assertThat(file.getVersion()).isEqualTo(1);
        assertThat(file.getSourceLandscapeId()).isEqualTo(HESSEN_PHYSICS_SEK1_LANDSCAPE_ID);
        assertThat(file.getTargetLandscapeId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
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
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_MATH_SEK1_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
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
                .allMatch(mapping -> CANONICAL_MATH_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_PILOT_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_CHEMISTRY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_CHEMISTRY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(BAYERN_BIOLOGY_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_BIOLOGY_ID.equals(mapping.targetLandscapeId()));
        assertThat(service.getMappingsForSourceLandscape(HESSEN_PHYSICS_LANDSCAPE_ID))
                .isNotEmpty()
                .allMatch(mapping -> CANONICAL_PHYSICS_PILOT_ID.equals(mapping.targetLandscapeId()));
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
        assertThat(file.getMappings()).hasSize(267);
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
                        Tuple.tuple("38dbde78-57b3-5dc4-bee6-8bad8b47f267", "4b67bed9-06da-40b2-a306-24e9e7dfd390", "partial"),
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
                        Tuple.tuple("32a0f358-c1e9-5663-b8cf-67789355387c", "09f47964-2cd0-410e-93ee-9632b582fc91", "partial"),
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
                        Tuple.tuple("5e334eeb-c4d3-5ec8-94ee-ead8e4cd0db0", "42e19186-6769-41ac-a7bf-ab39bdb50661", "exact"),
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
                        Tuple.tuple("b2e5d0bd-a102-5d6c-a55e-1f48c1796638", "9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5", "partial"),
                        Tuple.tuple("beb76ec1-ff8b-58bd-b564-c8af364dea5a", "9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5", "exact"),
                        Tuple.tuple("5ddd53f7-1c68-5a70-bf48-6f25d08e5735", "1ea06c0c-5c60-45cd-8f31-638de98820b4", "exact"),
                        Tuple.tuple("3c673acf-6a61-57ee-93aa-4ed70881f9d3", "6c122f0e-8017-4ec1-91d6-0d7a1c75f8c9", "exact"),
                        Tuple.tuple("76b7e724-aff5-5e69-93a5-8ca1d4e72a8d", "e55edcb9-2184-4a24-890e-70cc91028990", "partial"),
                        Tuple.tuple("03bb6fae-84a6-59c5-b56a-0f4128688706", "845f2a2c-e6aa-4991-8a12-645b8a9f70fe", "partial"));
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
