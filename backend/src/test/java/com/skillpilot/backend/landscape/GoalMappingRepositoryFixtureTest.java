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
    private static final Path HESSEN_LOWER_SECONDARY_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary");
    private static final Path BAVARIA_GYMNASIUM_MAPPING_DIR = Path.of("../curricula/DE/Gymnasium/mapping/DE-BY/gymnasium");
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
    private static final Path SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_math_lower_secondary_to_canonical_math_pilot.json");
    private static final Path PHYSICS_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_physics_lower_secondary_to_canonical_physics.json");
    private static final Path CHEMISTRY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_chemistry_lower_secondary_to_canonical_chemistry.json");
    private static final Path BIOLOGY_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_biology_lower_secondary_to_canonical_biology.json");
    private static final Path FRENCH_SEK1_MAPPING_FILE = HESSEN_LOWER_SECONDARY_MAPPING_DIR.resolve("hessen_french_lower_secondary_to_canonical_french.json");
    private static final Path BAYERN_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_math_to_canonical_math_pilot.json");
    private static final Path BAYERN_PHYSICS_MAPPING_FILE = BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_physics_to_canonical_physics_pilot.json");
    private static final Path BAYERN_CHEMISTRY_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_chemistry_to_canonical_chemistry.json");
    private static final Path BAYERN_BIOLOGY_MAPPING_FILE =
            BAVARIA_GYMNASIUM_MAPPING_DIR.resolve("bavaria_biology_to_canonical_biology.json");
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
                        Tuple.tuple("1877cd7b-d4ce-5356-a938-f28ddd8d7f3c", "4b67bed9-06da-40b2-a306-24e9e7dfd390", "exact"),
                        Tuple.tuple("edd3e6df-7f3d-5230-9377-dcf9d095c49c", "ae772695-d55e-4cc5-81bc-6605272759b4", "exact"),
                        Tuple.tuple("6e7ff196-a9e4-5bac-afee-621801ec85c2", "3e4032bd-4d8c-4e72-bfdd-64a34df053c9", "exact"),
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
}
