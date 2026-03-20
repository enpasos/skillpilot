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
        private static final String HESSEN_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
        private static final String BAVARIA_GYMNASIUM_ROOT_ID = "12322e3f-f351-5d40-b4ea-4a13d7e15854";
        private static final String HESSEN_LOWER_OVERVIEW_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
        private static final String HESSEN_LOWER_OVERVIEW_WHY_ID = "27e64f66-856d-5316-ad35-653259580816";
        private static final String HESSEN_LOWER_MATH_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
        private static final String HESSEN_LOWER_MATH_PROCESS_CLUSTER_ID = "69eae42e-5386-4892-a6c3-0263661f66ce";
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
                                                CANONICAL_PHYSICS_PILOT_ID,
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
                                .containsExactly("ALL", "DE-HE", "DE-BY");
                assertThat(root.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains("Warum Gymnasium gemeinsam denken? - Fächer, Voraussetzungen & Wege");
                assertThat(landscapeService.getOverview().getSummaries())
                                .extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain(CANONICAL_MATH_ID, CANONICAL_PHYSICS_PILOT_ID, CANONICAL_CHEMISTRY_ID,
                                                CANONICAL_BIOLOGY_ID, CANONICAL_INFORMATICS_ID, CANONICAL_HISTORY_ID,
                                                CANONICAL_GERMAN_ID, CANONICAL_POLITICS_ECONOMICS_ID,
                                                CANONICAL_ECONOMICS_ID);
                assertThat(landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID, CANONICAL_MATH_ID, CANONICAL_PHYSICS_PILOT_ID,
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
                                                "Funktionsgrundlagen (Sek I)",
                                                "Lineare Funktionen rechnerisch untersuchen",
                                                "Scheitelpunkte quadratischer Funktionen bestimmen",
                                                "Q3 Stochastik",
                                                "Prozessbezogene Kompetenzen (K)");
                assertThat(landscape.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
        }

        @Test
        void loadsCanonicalPhysicsPilotAsChildCurriculumAndClosureIncludesMathPilot() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape pilot = landscapeService.getById(CANONICAL_PHYSICS_PILOT_ID);

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
                assertThat(landscapeService.getClosure(CANONICAL_PHYSICS_PILOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_PHYSICS_PILOT_ID, CANONICAL_MATH_ID)
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
                                                "Q1 Stoffgruppen",
                                                "Q4 Energie und Nachhaltigkeit",
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
                                                "Q1 Genetik und Gentechnik",
                                                "Q3 Ökologie & Stoffwechsel",
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
                                                "Q1 Algorithmik & objektorientierte Modellierung",
                                                "Q4 Vertiefendes Themenfeld",
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
                                                "Q1 Rhetorik",
                                                "Q4 Rezeption",
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
                                                "Lektüre E-Phase Griechisch",
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
