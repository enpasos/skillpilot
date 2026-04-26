package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.StreamSupport;
import org.junit.jupiter.api.Test;

class LandscapeServiceTest {

        private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
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
        private static final String CANONICAL_BW_RULE_OF_THREE_ID = "ca9093cd-9ccf-5fb4-9dd8-bf4f92af4e70";
        private static final String CANONICAL_BW_COORDINATE_SYSTEM_ID = "25593605-5e13-55cc-9a05-8f3d737e15e9";
        private static final String CANONICAL_PHYSICS_KINETIC_ENERGY_ID = "7eeff2de-6015-49a6-a96e-a488d886dc9f";
        private static final String HESSEN_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
        private static final String BAVARIA_GYMNASIUM_ROOT_ID = "12322e3f-f351-5d40-b4ea-4a13d7e15854";
        private static final String HESSEN_LOWER_OVERVIEW_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
        private static final String HESSEN_LOWER_OVERVIEW_WHY_ID = "27e64f66-856d-5316-ad35-653259580816";
        private static final String HESSEN_LOWER_MATH_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
        private static final String HESSEN_LOWER_MATH_PROCESS_CLUSTER_ID = "69eae42e-5386-4892-a6c3-0263661f66ce";
        private static final String NRW_LOWER_MATH_ID = "c862423f-d0ac-4a65-8ad2-9a6e560313a8";
        private static final String NRW_UPPER_MATH_ID = "d3a068ca-90c6-4d7f-ab6b-4d8b43085cb1";
        private static final String NRW_UPPER_PHYSICS_ID = "8abb46ff-072b-41b7-9d70-0334cb5a1a6c";
        private static final String NRW_LOWER_FUNCTION_CLUSTER_ID = "f43fd248-195e-4168-bf70-ce92f864738f";
        private static final String NRW_UPPER_ANALYSIS_CLUSTER_ID = "31305eea-edf2-41b3-b312-bb1bc92f8fb7";
        private static final String NRW_UPPER_PHYSICS_ENTRY_CLUSTER_ID = "8cf56a06-2097-436b-80a0-86d2977ce171";
        private static final String NIEDERSACHSEN_LOWER_MATH_ID = "2b995085-dc5e-47c6-a563-9dcfc01fb74d";
        private static final String NIEDERSACHSEN_LOWER_FUNCTION_CLUSTER_ID = "9dcde142-1bae-417b-b08c-999ce0a3e963";
        private static final String NIEDERSACHSEN_UPPER_MATH_ID = "fcb04661-6ea2-4030-a9b2-97e6cc03daf8";
        private static final String NIEDERSACHSEN_UPPER_ANALYSIS_CLUSTER_ID = "6aa63fbe-6b48-41ae-a650-7d80074c5a94";
        private static final String BADEN_WUERTTEMBERG_LOWER_MATH_ID = "6232b783-199c-4c50-92f2-9fb31277e619";
        private static final String BADEN_WUERTTEMBERG_LOWER_FUNCTION_CLUSTER_ID = "fda87c17-1522-4764-b3ac-743c5331c03d";
        private static final String BADEN_WUERTTEMBERG_UPPER_MATH_ID = "fa8f864a-aac5-486d-8e77-40df2af038a3";
        private static final String BADEN_WUERTTEMBERG_UPPER_ANALYSIS_CLUSTER_ID = "c8fc1595-a76c-4858-bbd4-411ceed59c71";
        private static final String BAVARIA_MATH_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
        private static final String BAVARIA_PHYSICS_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
        private static final String BAVARIA_CHEMISTRY_ID = "ff1ca997-b6cc-5ece-8e13-5498b4bbf808";
        private static final String BAVARIA_BIOLOGY_ID = "357a7003-b636-570e-a0bd-6bb63518d2f6";
        private static final String BAVARIA_CHINESE_ID = "40744ec5-7de1-5e41-9fc2-a1e774721644";
        private static final String BAVARIA_INFORMATICS_ID = "1af3eba8-749f-5359-8f12-18f87b13616c";
        private static final String BAVARIA_FRENCH_ID = "49aefe0c-f365-5f30-b84f-b9a7699e4f2c";
        private static final String BAVARIA_HISTORY_ID = "01c2ba7a-ebd4-5840-bc09-123d7b31c914";
        private static final String BAVARIA_POLITICS_SOCIETY_ID = "486a8278-39b2-5450-96f8-1076a47b655b";
        private static final String BAVARIA_GREEK_ID = "22703293-7307-5ad2-b158-efe6ae28c7c3";
        private static final String BAVARIA_LATIN_ID = "c7eeaaa4-7c23-5ab7-8643-b7a03760cd6b";
        private static final String BAVARIA_MUSIC_ID = "a00d70bf-3d3c-58fc-af4f-881b29635c2e";
        private static final String BAVARIA_ITALIAN_ID = "c7643536-1163-50d8-86a6-9645c8fd3e25";
        private static final String BAVARIA_RUSSIAN_ID = "2b6e79f6-5130-56cb-9a2f-d08e6dc4b4d7";
        private static final String BAVARIA_POLISH_ID = "21148204-794c-515d-ae20-c4d5cd4e56d8";
        private static final String BAVARIA_CZECH_ID = "097f3667-2488-57b2-a3e0-2cb334e422a2";
        private static final String BAVARIA_MATH_FUNCTION_CLUSTER_ID = "f9538605-8bf4-5279-b00a-c18786f9cc51";
        private static final String BAVARIA_PHYSICS_DIAGRAMS_ID = "0074dc7c-b4ab-5bfb-b1b7-a8f5cdb9accc";
        private static final String BAVARIA_BIOLOGY_GENETICS_CLUSTER_ID = "83af486d-92eb-501a-b32d-15a256be7d60";

        @Test
        void getOverview_returnsEmptyFilters_forModifiedCurricula() {
                // Setup
                LandscapeProperties properties = new LandscapeProperties();
                // Point to the actual curricula directory relative to backend module
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                // Execute
                LandscapeOverviewResponse response = landscapeService.getOverview();

                // Verify
                List<LandscapeSummary> summaries = response.getSummaries();

                // Check for specific curricula that should have empty filters
                // Check for specific curricula that should have empty filters
                // "d79c5e83-34d0-4fc7-8ee5-5da57083f7b8" -> EU_EUR_L_CEFR_ENGLISH
                assertFiltersEmpty(summaries, "d79c5e83-34d0-4fc7-8ee5-5da57083f7b8");
                // "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da" -> DE_HES_S_GYM_2_OVERVIEW
                assertFiltersEmpty(summaries, "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da");
        }

        @Test
        void getOverview_filtersOutContainedCurricula() {
                // Setup
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                // Execute
                LandscapeOverviewResponse response = landscapeService.getOverview();
                List<LandscapeSummary> summaries = response.getSummaries();

                // Verify roots are present
                // Verify roots are present
                // "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da" -> DE_HES_S_GYM_2_OVERVIEW
                // "4a7e9ee2-c24e-55a2-9fdc-5e3350947052" -> DE_BAY_U_TUM_BSC_PHYSIK
                assertThat(summaries).extracting(LandscapeSummary::getCurriculumId)
                                .contains("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da",
                                                CANONICAL_GYMNASIUM_ROOT_ID,
                                                "4a7e9ee2-c24e-55a2-9fdc-5e3350947052");

                // Verify contained curricula are ABSENT
                // "3e56aa75-c76c-4de5-883b-0aac98297846" -> DE_HES_S_GYM_2_BIOLOGIE
                // "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3" -> DE_HES_S_GYM_2_MATHEMATIK
                assertThat(summaries).extracting(LandscapeSummary::getCurriculumId)
                                .doesNotContain("3e56aa75-c76c-4de5-883b-0aac98297846",
                                                "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3",
                                                CANONICAL_MATH_ID,
                                                CANONICAL_PHYSICS_ID,
                                                CANONICAL_CHEMISTRY_ID,
                                                CANONICAL_BIOLOGY_ID,
                                                CANONICAL_INFORMATICS_ID,
                                                CANONICAL_HISTORY_ID,
                                                CANONICAL_GERMAN_ID,
                                                CANONICAL_POLITICS_ECONOMICS_ID,
                                                CANONICAL_ENGLISH_ID,
                                                CANONICAL_FRENCH_ID,
                                                CANONICAL_LATIN_ID,
                                                CANONICAL_SPANISH_ID,
                                                CANONICAL_ITALIAN_ID,
                                                CANONICAL_RUSSIAN_ID,
                                                CANONICAL_POLISH_ID,
                                                CANONICAL_CZECH_ID,
                                                CANONICAL_GREEK_ID,
                                                CANONICAL_CHINESE_ID,
                                                CANONICAL_MUSIC_ID,
                                                CANONICAL_ECONOMICS_ID);

                LandscapeSummary canonicalRootSummary = summaries.stream()
                                .filter(summary -> CANONICAL_GYMNASIUM_ROOT_ID.equals(summary.getCurriculumId()))
                                .findFirst()
                                .orElseThrow();
                LandscapeSummary hessenOverviewSummary = summaries.stream()
                                .filter(summary -> "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da".equals(summary.getCurriculumId()))
                                .findFirst()
                                .orElseThrow();

                assertThat(canonicalRootSummary.isCompatibilityOnly()).isFalse();
                assertThat(hessenOverviewSummary.isCompatibilityOnly()).isTrue();
        }

        @Test
        void getOverviewWithoutCompatibilityExcludesCompatibilityRoots() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LandscapeOverviewResponse response = landscapeService.getOverview("de", false);

                assertThat(response.getSummaries()).extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da", HESSEN_LOWER_OVERVIEW_ID,
                                                BAVARIA_GYMNASIUM_ROOT_ID);
                assertThat(landscapeService.getBaseCurricula(false))
                                .extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da", HESSEN_LOWER_OVERVIEW_ID,
                                                BAVARIA_GYMNASIUM_ROOT_ID);
        }

        @Test
        void getOverviewMarksBavariaGymnasiumRootAsLegacyHiddenByDefault() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LandscapeOverviewResponse response = landscapeService.getOverview("de", true);

                LandscapeSummary bavariaRootSummary = response.getSummaries().stream()
                                .filter(summary -> BAVARIA_GYMNASIUM_ROOT_ID.equals(summary.getCurriculumId()))
                                .findFirst()
                                .orElseThrow();

                assertThat(bavariaRootSummary.isLegacyHiddenByDefault()).isTrue();
                assertThat(bavariaRootSummary.isCompatibilityOnly()).isTrue();
        }

        @Test
        void classifiesBavariaLegacyTreeAsCompatibilityOnly() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_GYMNASIUM_ROOT_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_GYMNASIUM_ROOT_ID)).isTrue();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_MATH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_MATH_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_PHYSICS_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_PHYSICS_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_CHEMISTRY_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_CHEMISTRY_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_BIOLOGY_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_BIOLOGY_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_CHINESE_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_CHINESE_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_INFORMATICS_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_INFORMATICS_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_FRENCH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_FRENCH_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_HISTORY_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_HISTORY_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_POLITICS_SOCIETY_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_POLITICS_SOCIETY_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_GREEK_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_GREEK_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_LATIN_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_LATIN_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_MUSIC_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_MUSIC_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_ITALIAN_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_ITALIAN_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_RUSSIAN_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_RUSSIAN_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_POLISH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_POLISH_ID)).isFalse();
                assertThat(landscapeService.isCompatibilityOnlyLandscape(BAVARIA_CZECH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BAVARIA_CZECH_ID)).isFalse();
        }

        @Test
        void getOverviewServesHessenLowerOverviewFromCompatibilityArchive() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LandscapeOverviewResponse response = landscapeService.getOverview("de", true);

                LandscapeSummary lowerOverviewSummary = response.getSummaries().stream()
                                .filter(summary -> HESSEN_LOWER_OVERVIEW_ID.equals(summary.getCurriculumId()))
                                .findFirst()
                                .orElseThrow();
                LandscapeSummary canonicalRootSummary = response.getSummaries().stream()
                                .filter(summary -> CANONICAL_GYMNASIUM_ROOT_ID.equals(summary.getCurriculumId()))
                                .findFirst()
                                .orElseThrow();

                assertThat(lowerOverviewSummary.isLegacyHiddenByDefault()).isFalse();
                assertThat(lowerOverviewSummary.isCompatibilityOnly()).isTrue();
                assertThat(canonicalRootSummary.isLegacyHiddenByDefault()).isFalse();
        }

        @Test
        void resolvesLowerSecondaryArchivedGoalMembershipFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveLandscapeIdForGoalIncludingArchived(HESSEN_LOWER_OVERVIEW_WHY_ID))
                                .isEqualTo(HESSEN_LOWER_OVERVIEW_ID);
        }

        @Test
        void resolvesLowerSecondaryArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                HESSEN_LOWER_MATH_ID,
                                HESSEN_LOWER_MATH_PROCESS_CLUSTER_ID))
                                .containsExactly(
                                                "5e98e2f2-c53c-44ce-99af-af2dc755bd94",
                                                "e5f5f559-a768-4474-a98d-c0a5b5abe767",
                                                "cb39ebff-23a2-48cb-aca1-e640985f43ca",
                                                "52b3be07-60ac-4342-94c6-7a7ab6d91b0b",
                                                "9e694f53-bdd8-42aa-9938-2f14f4a74cce",
                                                "75eb887e-0f14-4ac9-86a0-81671bcc1c90");
        }

        @Test
        void resolvesBavariaArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                BAVARIA_MATH_ID,
                                BAVARIA_MATH_FUNCTION_CLUSTER_ID))
                                .containsExactly(
                                                "0042dc1e-859b-5c95-95a4-48aeff1bae63",
                                                "32a0f358-c1e9-5663-b8cf-67789355387c",
                                                "67193ff0-3eee-5bff-9bf5-0ee7ea7adf3d");
        }

        @Test
        void loadsNrwArchivedSourceLandscapesFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.getById(NRW_LOWER_MATH_ID)).isNotNull();
                assertThat(landscapeService.getById(NRW_UPPER_MATH_ID)).isNotNull();
                assertThat(landscapeService.getById(NRW_UPPER_PHYSICS_ID)).isNotNull();
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(NRW_LOWER_MATH_ID)).isEqualTo("DE-NW");
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(NRW_UPPER_MATH_ID)).isEqualTo("DE-NW");
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(NRW_UPPER_PHYSICS_ID)).isEqualTo("DE-NW");
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(NRW_LOWER_MATH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(NRW_UPPER_MATH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(NRW_UPPER_PHYSICS_ID)).isTrue();
        }

        @Test
        void resolvesNrwArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NRW_LOWER_MATH_ID,
                                NRW_LOWER_FUNCTION_CLUSTER_ID))
                                .containsExactly(
                                                "527f56fd-3163-4845-b9e6-3ea75aa7ea96",
                                                "ca652aeb-4f91-4718-acaf-b1c398567abe",
                                                "6d4fedfd-96b5-4237-aab0-74b9d60ea800",
                                                "b958a8e3-ff11-4cfb-b65c-184c73c00d99",
                                                "0159a2d5-baca-4652-8515-350f7b853267",
                                                "ec6f0c55-6008-4792-b315-09918e7f7248",
                                                "cfadb2dd-a25f-4f83-bbf6-6df00bdd091d",
                                                "f02c5ec8-cb34-410a-bf5e-fb331b0a2080",
                                                "890a6667-7cec-41ac-be6b-c7ed6121b0d7");
                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NRW_UPPER_MATH_ID,
                                NRW_UPPER_ANALYSIS_CLUSTER_ID))
                                .containsExactly(
                                                "ae5ec3d2-7ff8-4f08-92c0-5dec8006cf81",
                                                "fb1eebf2-3d5d-40a6-a0e5-879bb7d4f422",
                                                "0c1195ec-efe3-4d68-9219-e46a807c802d",
                                                "c3791879-8901-443a-ac91-bf9cd712b38e",
                                                "43b21038-8dbb-4f85-ab8e-898a9cef38fb",
                                                "c876c75b-dcc4-426e-be0f-15698add835d",
                                                "0c3056ad-ee56-49e8-aff4-fabcae51eb98",
                                                "fd54f82d-0846-4277-ae97-b3964fb41de0",
                                                "53563e97-253b-4f3c-8911-d1ec1ac1edb3",
                                                "ef475a7e-a647-4140-bad9-304ca3a53ef5",
                                                "99e37d46-3b0c-4989-b8a8-c8a72501fc15",
                                                "70705293-c65e-4a96-b771-5b9883e1d17d",
                                                "aa3e0764-3046-47c1-aa9b-35a144cf02d6",
                                                "1b742861-ac55-4a6d-bd84-71ed6c291eda",
                                                "71539804-c722-4fe6-bc71-e4e2abe1773f",
                                                "5b7ada45-c947-48af-b975-13548091cf2d",
                                                "371359c2-6e29-4863-879f-d53b044204ce",
                                                "18a7ac50-2fb1-4b2a-9eed-3f7f290bdb69",
                                                "de62f8db-076b-4849-b742-f14408292fd0",
                                                "fbbdebe3-b945-48d6-a0d4-1c7b33d3bbb4",
                                                "a39a1fb7-bf12-4d5b-8d73-1aafd5b18e19",
                                                "df210bbb-749a-40ff-841e-c2fded9cca31",
                                                "8ddb7c8f-b27e-4353-85b4-6801a7fdfa5b",
                                                "d9121fe6-058a-4ab8-a8ce-68d6eefea520",
                                                "85be691c-c569-4cdf-b332-b9d77d47666d",
                                                "e0c4432f-fc34-48c2-84d8-0e998b978500",
                                                "b3b8d1f6-123f-5209-ae6f-2dc0c1322556",
                                                "61304725-35ea-5245-9454-16c827545c8f",
                                                "1ea6c233-b333-5854-bec1-36b4cba577e9",
                                                "207160c0-e810-5f31-8b82-03d2d4102d37",
                                                "c4c8f1e4-ab8d-5709-a592-24864b7fc859",
                                                "b0a122e9-027b-5a29-ad78-5deea4de53a3",
                                                "173acc48-3aec-5833-ac1e-7f1dfa1c3cbb",
                                                "b1f131d2-844b-5ff1-a674-39d2d533a216");
        }

        @Test
        void loadsNiedersachsenArchivedSourceLandscapeFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.getById(NIEDERSACHSEN_LOWER_MATH_ID)).isNotNull();
                assertThat(landscapeService.getById(NIEDERSACHSEN_UPPER_MATH_ID)).isNotNull();
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(NIEDERSACHSEN_LOWER_MATH_ID))
                                .isEqualTo("DE-NI");
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(NIEDERSACHSEN_UPPER_MATH_ID))
                                .isEqualTo("DE-NI");
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(NIEDERSACHSEN_LOWER_MATH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(NIEDERSACHSEN_UPPER_MATH_ID)).isTrue();
        }

        @Test
        void resolvesNiedersachsenArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NIEDERSACHSEN_LOWER_MATH_ID,
                                NIEDERSACHSEN_LOWER_FUNCTION_CLUSTER_ID))
                                .containsExactly(
                                                "08dbb0ce-effb-478c-be9e-d49e0651a618",
                                                "52bd16c1-ce2a-46ac-a89c-8c41cc40bf9e",
                                                "a0518109-541e-43a9-b38e-93ace522ad71",
                                                "5d08f9c9-c45a-4b7d-a416-d21fae73df57",
                                                "0f2a3cbe-37b8-4701-a5f0-87a58241765c",
                                                "7ad51e84-1b5b-41e9-a0ec-854c11b45fee",
                                                "a11a70bd-7c0d-4c8c-865e-a6eb095a4f77",
                                                "35de148c-6991-48fa-b517-2690c28d4f35");
                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NIEDERSACHSEN_UPPER_MATH_ID,
                                NIEDERSACHSEN_UPPER_ANALYSIS_CLUSTER_ID))
                                .containsExactly(
                                                "5e7e8e47-2183-44cf-a026-6285f3b0083a",
                                                "55d56662-56db-4a76-a965-01a7f5534da6",
                                                "d83b5cdd-3060-4c6f-874a-99473a205214",
                                                "250ba641-b2a1-4717-9a27-4ee0e6aa83c2",
                                                "234dde5d-cc9d-4508-af9e-092e614ea304",
                                                "6c021ee2-f600-4977-a4a8-877ece6c8c3b",
                                                "d1ca482c-4184-464f-a057-2d61ba077803",
                                                "5b284b66-f417-4366-8685-012ae000b3b1",
                                                "23e03002-37c4-4268-ba3a-ddcdffc2e666",
                                                "22074d55-5227-4487-9fcc-4bc5dcec970e",
                                                "d3e91530-938e-46c9-b0de-55bbae83e5a0",
                                                "270b0f43-623c-413c-b7f1-eb690079ad8d");
                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NIEDERSACHSEN_UPPER_MATH_ID,
                                "d08d5280-3561-4d02-91f0-5f7465dd88a7"))
                                .containsExactly(
                                                "23e03002-37c4-4268-ba3a-ddcdffc2e666",
                                                "22074d55-5227-4487-9fcc-4bc5dcec970e",
                                                "d3e91530-938e-46c9-b0de-55bbae83e5a0",
                                                "270b0f43-623c-413c-b7f1-eb690079ad8d");
                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                NIEDERSACHSEN_UPPER_MATH_ID,
                                "f4515a28-7161-49ae-8e74-f58d81ec0812"))
                                .containsExactly(
                                                "22074d55-5227-4487-9fcc-4bc5dcec970e",
                                                "d3e91530-938e-46c9-b0de-55bbae83e5a0");
        }

        @Test
        void loadsBadenWuerttembergArchivedSourceLandscapesFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.getById(BADEN_WUERTTEMBERG_LOWER_MATH_ID)).isNotNull();
                assertThat(landscapeService.getById(BADEN_WUERTTEMBERG_UPPER_MATH_ID)).isNotNull();
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(BADEN_WUERTTEMBERG_LOWER_MATH_ID))
                                .isEqualTo("DE-BW");
                assertThat(landscapeService.resolveSourceLandscapeJurisdiction(BADEN_WUERTTEMBERG_UPPER_MATH_ID))
                                .isEqualTo("DE-BW");
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BADEN_WUERTTEMBERG_LOWER_MATH_ID)).isTrue();
                assertThat(landscapeService.isLegacyHiddenByDefaultLandscape(BADEN_WUERTTEMBERG_UPPER_MATH_ID)).isTrue();
        }

        @Test
        void resolvesBadenWuerttembergArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                BADEN_WUERTTEMBERG_LOWER_MATH_ID,
                                BADEN_WUERTTEMBERG_LOWER_FUNCTION_CLUSTER_ID))
                                .containsExactly(
                                                "83041ef8-6480-435c-aeb6-a09cb4af5ec2",
                                                "332b3bd1-afc0-4266-a977-49ef0843e5b1",
                                                "0886ec62-bfa3-4501-9bc9-daee3d84b758",
                                                "0282af40-1f9f-4f74-a3ac-d9fe29796068",
                                                "5e889254-5088-4c9f-ac62-e94d95113644",
                                                "56842db6-253b-4fea-b50c-2940db2fd174",
                                                "95bee2cc-cdb0-4611-8bc9-36f6263ea417",
                                                "a7840b04-88b2-4f2a-8f94-8a75e0a27200",
                                                "52b15961-33be-4ee9-97ec-1911dc982910",
                                                "eca22013-61e3-4fad-a771-fa4e224fe1d5",
                                                "72041e85-2d03-4a3c-862c-57ebc79e9dbb",
                                                "9cb473f6-06f0-4fa3-9bf1-34445aa58551");
                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                BADEN_WUERTTEMBERG_UPPER_MATH_ID,
                                BADEN_WUERTTEMBERG_UPPER_ANALYSIS_CLUSTER_ID))
                                .containsExactly(
                                                "e0769810-ba73-4a52-8e9c-660d1fb9d6e6",
                                                "7bf62048-84ba-467f-ba23-f053c4e2989f",
                                                "46690ab9-0b1f-4bd9-9409-4976a40c6ec2",
                                                "c5739dd3-a261-4229-aff6-678d8ee618b3",
                                                "97ab0ab9-9444-410d-b2d9-1ac9fa935ad8",
                                                "e0c333ea-9873-4718-819c-d39b22ccee30",
                                                "fa4597c7-fabd-4a55-8be3-d06f7c432738",
                                                "13e285f3-522c-4eae-9fed-8b13b2af7b7d",
                                                "8ab263f6-a460-4ca2-bbe9-b7e9a22bbaa2",
                                                "72d7ad67-e2ef-41a0-bb52-b62eb5d071e0",
                                                "fb742d93-6c9b-487a-bc7c-f54b363c0c01");
        }

        @Test
        void resolvesBavariaBiologyArchivedAtomicClosureFromRealRegistry() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                assertThat(landscapeService.resolveSourceAtomicGoalIds(
                                BAVARIA_BIOLOGY_ID,
                                BAVARIA_BIOLOGY_GENETICS_CLUSTER_ID))
                                .containsExactly(
                                                "caa62aba-fb03-5b28-8df1-d09624168990",
                                                "e4f857b8-85da-58e5-9fb4-b4f05048d3b5",
                                                "a6ad1554-558e-51e4-9d05-aa9b38ebfa40",
                                                "673d3825-e43d-585c-9ee7-58bb143fd382",
                                                "b9b18077-88f5-57ed-981e-2f7e2512af4c",
                                                "55793844-76b0-57d8-a3c1-e5db5fa2e370",
                                                "e0bbe3b2-96d7-5e7a-b8c1-d649a084e355",
                                                "706204f2-4768-56d3-984a-85e9ec6fc370",
                                                "a3e24e24-e489-57ad-88f1-64e85633225d",
                                                "2802979c-6270-521c-87e0-1ed9360d6bea",
                                                "1ad96d9d-03d9-565f-94b2-94f6ed17c523");
        }

        @Test
        void bavariaPilotLandscapesArePresentInRealGoalMembershipRegistry() throws Exception {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(Files.readString(
                                Path.of("../curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json")));
                JsonNode landscapes = root.path("landscapes");

                JsonNode bavariaMath = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> BAVARIA_MATH_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();
                JsonNode bavariaPhysics = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> BAVARIA_PHYSICS_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();
                JsonNode bavariaBiology = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> BAVARIA_BIOLOGY_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();

                assertThat(StreamSupport.stream(bavariaMath.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(BAVARIA_MATH_FUNCTION_CLUSTER_ID);
                assertThat(StreamSupport.stream(bavariaPhysics.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(BAVARIA_PHYSICS_DIAGRAMS_ID);
                assertThat(StreamSupport.stream(bavariaBiology.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(BAVARIA_BIOLOGY_GENETICS_CLUSTER_ID);
        }

        @Test
        void nrwPilotMathSourceLandscapesArePresentInRealGoalMembershipRegistry() throws Exception {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(Files.readString(
                                Path.of("../curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json")));
                JsonNode landscapes = root.path("landscapes");

                JsonNode nrwLowerMath = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> NRW_LOWER_MATH_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();
                JsonNode nrwUpperMath = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> NRW_UPPER_MATH_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();

                assertThat(StreamSupport.stream(nrwLowerMath.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(NRW_LOWER_FUNCTION_CLUSTER_ID);
                assertThat(StreamSupport.stream(nrwUpperMath.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(NRW_UPPER_ANALYSIS_CLUSTER_ID);
        }

        @Test
        void nrwPilotPhysicsSourceLandscapeIsPresentInRealGoalMembershipRegistry() throws Exception {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(Files.readString(
                                Path.of("../curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json")));
                JsonNode landscapes = root.path("landscapes");

                JsonNode nrwUpperPhysics = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> NRW_UPPER_PHYSICS_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();

                assertThat(StreamSupport.stream(nrwUpperPhysics.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(NRW_UPPER_PHYSICS_ENTRY_CLUSTER_ID);
        }

        @Test
        void niedersachsenPilotMathSourceLandscapeIsPresentInRealGoalMembershipRegistry() throws Exception {
                ObjectMapper objectMapper = new ObjectMapper();
                JsonNode root = objectMapper.readTree(Files.readString(
                                Path.of("../curricula/DE/Gymnasium/provenance/source-goal-membership-registry.json")));
                JsonNode landscapes = root.path("landscapes");

                JsonNode niedersachsenLowerMath = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> NIEDERSACHSEN_LOWER_MATH_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();
                JsonNode niedersachsenUpperMath = StreamSupport.stream(landscapes.spliterator(), false)
                                .filter(node -> NIEDERSACHSEN_UPPER_MATH_ID.equals(node.path("landscapeId").asText()))
                                .findFirst()
                                .orElseThrow();

                assertThat(StreamSupport.stream(niedersachsenLowerMath.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(NIEDERSACHSEN_LOWER_FUNCTION_CLUSTER_ID);
                assertThat(StreamSupport.stream(niedersachsenUpperMath.path("goalIds").spliterator(), false)
                                .map(JsonNode::asText)
                                .toList())
                                .contains(NIEDERSACHSEN_UPPER_ANALYSIS_CLUSTER_ID);
        }

        @Test
        void loadsCanonicalGymnasiumOverviewAsRootCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape root = landscapeService.getById(CANONICAL_GYMNASIUM_ROOT_ID);

                assertThat(root).isNotNull();
                assertThat(root.getTitle()).isEqualTo("Gymnasium (DE)");
                assertThat(root.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("ALL", "DE-BW", "DE-HE", "DE-BY", "DE-BB", "DE-BE", "DE-NI", "DE-NW",
                                                "DE-SH", "DE-HB", "DE-HH", "DE-MV", "DE-RP", "DE-SL", "DE-SN",
                                                "DE-ST", "DE-TH");
                assertThat(landscapeService.getOverview().getSummaries())
                                .extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain(CANONICAL_MATH_ID, CANONICAL_PHYSICS_ID, CANONICAL_CHEMISTRY_ID,
                                                CANONICAL_BIOLOGY_ID, CANONICAL_INFORMATICS_ID, CANONICAL_HISTORY_ID,
                                                CANONICAL_GERMAN_ID, CANONICAL_POLITICS_ECONOMICS_ID,
                                                CANONICAL_ECONOMICS_ID);
                assertThat(landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID, CANONICAL_MATH_ID, CANONICAL_PHYSICS_ID,
                                                CANONICAL_CHEMISTRY_ID, CANONICAL_BIOLOGY_ID, CANONICAL_INFORMATICS_ID,
                                                CANONICAL_HISTORY_ID, CANONICAL_GERMAN_ID,
                                                CANONICAL_POLITICS_ECONOMICS_ID, CANONICAL_ENGLISH_ID,
                                                CANONICAL_FRENCH_ID, CANONICAL_LATIN_ID,
                                                CANONICAL_SPANISH_ID, CANONICAL_GREEK_ID,
                                                CANONICAL_CHINESE_ID, CANONICAL_MUSIC_ID,
                                                CANONICAL_ECONOMICS_ID)
                                .doesNotContain(HESSEN_UPPER_MATH_ID);
        }

        @Test
        void loadsCanonicalMathAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape landscape = landscapeService.getById(CANONICAL_MATH_ID);

                assertThat(landscape).isNotNull();
                assertThat(landscape.getTitle()).isEqualTo("Mathematik (Gymnasium, DE)");
                assertThat(landscape.getGoals()).isNotEmpty();
                assertThat(landscape.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Funktionsgrundlagen",
                                                "Lineare Funktionen rechnerisch untersuchen",
                                                "Scheitelpunkte quadratischer Funktionen bestimmen",
                                                "Wahrscheinlichkeitsverteilungen, Hypothesentests und Statistik",
                                                "Problemlösen und Argumentieren",
                                                "Übungen Prozesskompetenzen");
                assertThat(landscape.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void localizedCanonicalMathUnionsExplicitAndDerivedApplicabilityForBwSekOneGoals() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape canonicalMath = landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID).stream()
                                .filter(landscape -> CANONICAL_MATH_ID.equals(landscape.getLandscapeId()))
                                .findFirst()
                                .orElseThrow();

                LearningGoal ruleOfThreeGoal = canonicalMath.getGoals().stream()
                                .filter(goal -> CANONICAL_BW_RULE_OF_THREE_ID.equals(goal.getId()))
                                .findFirst()
                                .orElseThrow();
                LearningGoal coordinateSystemGoal = canonicalMath.getGoals().stream()
                                .filter(goal -> CANONICAL_BW_COORDINATE_SYSTEM_ID.equals(goal.getId()))
                                .findFirst()
                                .orElseThrow();

                assertThat(ruleOfThreeGoal.getApplicability()).containsKey("jurisdiction");
                assertThat(ruleOfThreeGoal.getApplicability().get("jurisdiction"))
                                .contains("DE-BW", "DE-HE");
                assertThat(coordinateSystemGoal.getApplicability()).containsKey("jurisdiction");
                assertThat(coordinateSystemGoal.getApplicability().get("jurisdiction"))
                                .contains("DE-BW", "DE-HE");
        }

        @Test
        void localizedCanonicalPhysicsUnionsRegistryOverridesAndDerivedApplicability() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape canonicalPhysics = landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID).stream()
                                .filter(landscape -> CANONICAL_PHYSICS_ID.equals(landscape.getLandscapeId()))
                                .findFirst()
                                .orElseThrow();

                LearningGoal kineticEnergyGoal = canonicalPhysics.getGoals().stream()
                                .filter(goal -> CANONICAL_PHYSICS_KINETIC_ENERGY_ID.equals(goal.getId()))
                                .findFirst()
                                .orElseThrow();

                assertThat(kineticEnergyGoal.getExtendedData()).isNull();
                assertThat(kineticEnergyGoal.getApplicability()).containsKey("jurisdiction");
                assertThat(kineticEnergyGoal.getApplicability().get("jurisdiction"))
                                .contains("DE-BY", "DE-HE");
        }

        @Test
        void loadsCanonicalPhysicsPilotAsChildCurriculumAndClosureIncludesMathPilot() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape pilot = landscapeService.getById(CANONICAL_PHYSICS_ID);

                assertThat(pilot).isNotNull();
                assertThat(pilot.getTitle()).isEqualTo("Physik (Gymnasium, DE)");
                assertThat(pilot.getGoals()).isNotEmpty();
                assertThat(pilot.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Mechanische Grundlagen (Sek I)",
                                                "Methode: Messunsicherheit und Fehleranalyse",
                                                "Einführungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen",
                                                "Bewegungen mit Diagrammen untersuchen",
                                                "Newtons Axiome und Inertialsysteme",
                                                "Erhaltungssätze",
                                                "Q4 Struktur von Materie, Raum und Zeit",
                                                "Abiturprüfung Physik (GK)",
                                                "Abiturprüfung Physik (LK)");
                assertThat(pilot.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
                assertThat(pilot.getProgramUnits())
                                .extracting(ProgramUnit::getId)
                                .containsExactly(
                                                "de-gym-physics-program",
                                                "de-gym-physics-sek1",
                                                "de-gym-physics-sek2",
                                                "de-gym-physics-e",
                                                "de-gym-physics-q1",
                                                "de-gym-physics-q2",
                                                "de-gym-physics-q3",
                                                "de-gym-physics-q4",
                                                "de-gym-physics-abitur");
                assertThat(pilot.getGoalPlacements()).hasSize(19);
                assertThat(pilot.getGoalPlacements())
                                .extracting(GoalPlacement::getUnitId)
                                .contains(
                                                "de-gym-physics-program",
                                                "de-gym-physics-sek1",
                                                "de-gym-physics-e",
                                                "de-gym-physics-q1",
                                                "de-gym-physics-q2",
                                                "de-gym-physics-q3",
                                                "de-gym-physics-q4",
                                                "de-gym-physics-abitur");
                assertThat(pilot.getCompetencyCatalog())
                                .extracting(CompetencyCatalogEntry::getId)
                                .containsExactly(
                                                "PROCESS.PK1",
                                                "PROCESS.PK2",
                                                "PROCESS.PK3",
                                                "PROCESS.PK4",
                                                "PROCESS.PK5");
                LearningGoal physicsRoot = pilot.getGoals().stream()
                                .filter(goal -> "Physik".equals(goal.getTitle()))
                                .findFirst()
                                .orElseThrow();
                assertThat(physicsRoot.getCompetencyRefs())
                                .containsExactly(
                                                "PROCESS.PK1",
                                                "PROCESS.PK2",
                                                "PROCESS.PK3",
                                                "PROCESS.PK4",
                                                "PROCESS.PK5");
                assertThat(physicsRoot.getExtendedData()).isNull();
                assertThat(landscapeService.resolveGoalProvenance(physicsRoot))
                                .containsEntry("sourceLandscapeId", "24f2ca0f-b94a-444e-bb70-677cb6f85c02")
                                .containsEntry("sourceGoalId", "1b716911-2c34-4806-9240-7c31f71312bb");
                assertThat(landscapeService.getClosure(CANONICAL_PHYSICS_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_PHYSICS_ID, CANONICAL_MATH_ID)
                                .doesNotContain(HESSEN_UPPER_MATH_ID);
        }

        @Test
        void loadsCanonicalChemistryAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape chemistry = landscapeService.getById(CANONICAL_CHEMISTRY_ID);

                assertThat(chemistry).isNotNull();
                assertThat(chemistry.getTitle()).isEqualTo("Chemie (Gymnasium, DE)");
                assertThat(chemistry.getGoals()).isNotEmpty();
                assertThat(chemistry.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Chemie? - Relevanz und Orientierung",
                                                "Chemische Grundlagen (Sek I)",
                                                "Einführungsphase Reaktionsgrundlagen",
                                                "Stoffgruppen",
                                                "Energie und Nachhaltigkeit",
                                                "Abiturprüfung Chemie (GK)",
                                                "Abiturprüfung Chemie (LK)");
                assertThat(chemistry.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalBiologyAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape biology = landscapeService.getById(CANONICAL_BIOLOGY_ID);

                assertThat(biology).isNotNull();
                assertThat(biology.getTitle()).isEqualTo("Biologie (Gymnasium, DE)");
                assertThat(biology.getGoals()).isNotEmpty();
                assertThat(biology.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Biologische Grundlagen (Sek I)",
                                                "Fotosynthese und Zellatmung (Sek I)",
                                                "Warum Biologie? - Relevanz und Orientierung",
                                                "Einführungsphase Zellbiologie",
                                                "Genetik und Gentechnik",
                                                "Ökologie & Stoffwechsel",
                                                "Abiturprüfung Biologie (GK)",
                                                "Abiturprüfung Biologie (LK)");
                assertThat(biology.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalInformaticsAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape informatics = landscapeService.getById(CANONICAL_INFORMATICS_ID);

                assertThat(informatics).isNotNull();
                assertThat(informatics.getTitle()).isEqualTo("Informatik (Gymnasium, DE)");
                assertThat(informatics.getGoals()).isNotEmpty();
                assertThat(informatics.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Informatik? - Relevanz und Orientierung",
                                                "Einführungsphase Informatik",
                                                "Algorithmik & objektorientierte Modellierung",
                                                "Vertiefendes Themenfeld",
                                                "Abiturpruefung Informatik (GK)",
                                                "Abiturpruefung Informatik (LK)");
                assertThat(informatics.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalHistoryAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape history = landscapeService.getById(CANONICAL_HISTORY_ID);

                assertThat(history).isNotNull();
                assertThat(history.getTitle()).isEqualTo("Geschichte (Gymnasium, DE)");
                assertThat(history.getGoals()).isNotEmpty();
                assertThat(history.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Geschichte? - Relevanz und Orientierung",
                                                "E-Phase Geschichte",
                                                "Q1 19. Jahrhundert",
                                                "Q4 Erinnerungskultur",
                                                "Abiturprüfung Geschichte (GK)",
                                                "Abiturprüfung Geschichte (LK)");
                assertThat(history.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalGermanAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape german = landscapeService.getById(CANONICAL_GERMAN_ID);

                assertThat(german).isNotNull();
                assertThat(german.getTitle()).isEqualTo("Deutsch (Gymnasium, DE)");
                assertThat(german.getGoals()).isNotEmpty();
                assertThat(german.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Deutsch? - Relevanz und Orientierung",
                                                "E-Phase Deutsch",
                                                "Q1",
                                                "Q4",
                                                "Abiturprüfung Deutsch (GK)",
                                                "Abiturprüfung Deutsch (LK)");
                assertThat(german.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalPoliticsEconomicsAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape politicsEconomics = landscapeService.getById(CANONICAL_POLITICS_ECONOMICS_ID);

                assertThat(politicsEconomics).isNotNull();
                assertThat(politicsEconomics.getTitle()).isEqualTo("Politik und Wirtschaft (Gymnasium, DE)");
                assertThat(politicsEconomics.getGoals()).isNotEmpty();
                assertThat(politicsEconomics.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Politik und Wirtschaft? - Relevanz und Orientierung",
                                                "E-Phase: Grundlagen Gesellschaft, Wirtschaft, Ökologie",
                                                "Q1: Politik",
                                                "Q4: Europa",
                                                "Abiturprüfung Politik und Wirtschaft (GK)",
                                                "Abiturprüfung Politik und Wirtschaft (LK)");
                assertThat(politicsEconomics.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalEnglishAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape english = landscapeService.getById(CANONICAL_ENGLISH_ID);

                assertThat(english).isNotNull();
                assertThat(english.getTitle()).isEqualTo("Englisch (Gymnasium, DE)");
                assertThat(english.getGoals()).isNotEmpty();
                assertThat(english.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Englisch? - Relevanz und Orientierung",
                                                "E-Phase Englisch",
                                                "Q1",
                                                "Q4",
                                                "Abiturprüfung Englisch (GK)",
                                                "Abiturprüfung Englisch (LK)");
                assertThat(english.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalFrenchAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape french = landscapeService.getById(CANONICAL_FRENCH_ID);

                assertThat(french).isNotNull();
                assertThat(french.getTitle()).isEqualTo("Französisch (Gymnasium, DE)");
                assertThat(french.getGoals()).isNotEmpty();
                assertThat(french.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Französisch? - Relevanz und Orientierung",
                                                "Französisch Sek I",
                                                "Jahrgangsstufe 5",
                                                "Compréhension écrite Le cercle familial et amical",
                                                "Compréhension écrite E-Phase Französisch",
                                                "Compréhension écrite Französisch Oberstufe (KC 2024)");
                assertThat(french.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalLatinAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape latin = landscapeService.getById(CANONICAL_LATIN_ID);

                assertThat(latin).isNotNull();
                assertThat(latin.getTitle()).isEqualTo("Latein (Gymnasium, DE)");
                assertThat(latin.getGoals()).isNotEmpty();
                assertThat(latin.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Latein? - Relevanz und Orientierung",
                                                "E-Phase Latein",
                                                "Rhetorik",
                                                "Rezeption",
                                                "Abiturprüfung Latein (GK)",
                                                "Abiturprüfung Latein (LK)");
                assertThat(latin.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalSpanishAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape spanish = landscapeService.getById(CANONICAL_SPANISH_ID);

                assertThat(spanish).isNotNull();
                assertThat(spanish.getTitle()).isEqualTo("Spanisch (Gymnasium, DE)");
                assertThat(spanish.getGoals()).isNotEmpty();
                assertThat(spanish.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Spanisch? - Relevanz und Orientierung",
                                                "E-Phase Spanisch",
                                                "Q1 Spanisch",
                                                "Q4 Spanisch",
                                                "Abiturprüfung Spanisch (GK)",
                                                "Abiturprüfung Spanisch (LK)");
                assertThat(spanish.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalGreekAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape greek = landscapeService.getById(CANONICAL_GREEK_ID);

                assertThat(greek).isNotNull();
                assertThat(greek.getTitle()).isEqualTo("Griechisch (Gymnasium, DE)");
                assertThat(greek.getGoals()).isNotEmpty();
                assertThat(greek.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Griechisch? - Relevanz und Orientierung",
                                                "Originaltexte kursorisch lesen und Inhalte erfassen",
                                                "Lektüre Q1 Griechisch",
                                                "Lektüre Q4 Griechisch",
                                                "Abiturprüfung Griechisch (GK)",
                                                "Abiturprüfung Griechisch (LK)");
                assertThat(greek.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalChineseAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape chinese = landscapeService.getById(CANONICAL_CHINESE_ID);

                assertThat(chinese).isNotNull();
                assertThat(chinese.getTitle()).isEqualTo("Chinesisch (Gymnasium, DE)");
                assertThat(chinese.getGoals()).isNotEmpty();
                assertThat(chinese.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Chinesisch? - Relevanz und Orientierung",
                                                "Leseverstehen E-Phase Chinesisch",
                                                "Leseverstehen Q1 Chinesisch",
                                                "Leseverstehen Q4 Chinesisch",
                                                "Übungen Q4");
                assertThat(chinese.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalEconomicsAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape economics = landscapeService.getById(CANONICAL_ECONOMICS_ID);

                assertThat(economics).isNotNull();
                assertThat(economics.getTitle()).isEqualTo("Wirtschaftswissenschaften (Gymnasium, DE)");
                assertThat(economics.getGoals()).isNotEmpty();
                assertThat(economics.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Wirtschaftswissenschaften? - Relevanz und Orientierung",
                                                "E1 Gesellschaftlicher Wandel",
                                                "Q2 Wirtschaft und Wirtschaftspolitik",
                                                "Q4 Wirtschaftsethik & Entwicklung",
                                                "Abiturprüfung Wirtschaftswissenschaften (GK)",
                                                "Abiturprüfung Wirtschaftswissenschaften (LK)");
                assertThat(economics.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalMusicAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape music = landscapeService.getById(CANONICAL_MUSIC_ID);

                assertThat(music).isNotNull();
                assertThat(music.getTitle()).isEqualTo("Musik (Gymnasium, DE)");
                assertThat(music.getGoals()).isNotEmpty();
                assertThat(music.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Warum Musik? - Relevanz und Orientierung",
                                                "E-Phase Musik",
                                                "Q2 Musik",
                                                "Q4 Musik",
                                                "Abiturprüfung Musik (GK)",
                                                "Abiturprüfung Musik (LK)");
                assertThat(music.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        private void assertFiltersEmpty(List<LandscapeSummary> summaries, String curriculumId) {
                LandscapeSummary summary = summaries.stream()
                                .filter(s -> s.getCurriculumId().equals(curriculumId))
                                .findFirst()
                                .orElseThrow(() -> new AssertionError("Curriculum " + curriculumId + " not found"));

                assertThat(summary.getFilters()).isNotNull().isEmpty();
        }
}
