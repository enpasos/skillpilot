package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;

class LandscapeServiceTest {

        private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
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
        private static final String HESSEN_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
        private static final String HESSEN_LOWER_OVERVIEW_ID = "f050ee48-6891-4f83-995f-0f8be5e31b7f";
        private static final String HESSEN_LOWER_OVERVIEW_WHY_ID = "27e64f66-856d-5316-ad35-653259580816";
        private static final String HESSEN_LOWER_MATH_ID = "b167b4cd-4b78-4c84-a721-6b2adbbcab3c";
        private static final String HESSEN_LOWER_MATH_PROCESS_CLUSTER_ID = "69eae42e-5386-4892-a6c3-0263661f66ce";

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
                                                CANONICAL_MATH_PILOT_ID,
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
                                .doesNotContain("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da", HESSEN_LOWER_OVERVIEW_ID);
                assertThat(landscapeService.getBaseCurricula(false))
                                .extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain("bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da", HESSEN_LOWER_OVERVIEW_ID);
        }

        @Test
        void getOverviewMarksHessenLowerOverviewAsLegacyHiddenByDefault() {
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

                assertThat(lowerOverviewSummary.isLegacyHiddenByDefault()).isTrue();
                assertThat(lowerOverviewSummary.isCompatibilityOnly()).isFalse();
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
                                .doesNotContain(CANONICAL_MATH_PILOT_ID, CANONICAL_PHYSICS_PILOT_ID, CANONICAL_CHEMISTRY_ID,
                                                CANONICAL_BIOLOGY_ID, CANONICAL_INFORMATICS_ID, CANONICAL_HISTORY_ID,
                                                CANONICAL_GERMAN_ID, CANONICAL_POLITICS_ECONOMICS_ID,
                                                CANONICAL_ECONOMICS_ID);
                assertThat(landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID, CANONICAL_MATH_PILOT_ID, CANONICAL_PHYSICS_PILOT_ID,
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
        void loadsCanonicalMathPilotAsChildCurriculum() {
                LandscapeProperties properties = new LandscapeProperties();
                properties.setDirectory("../curricula");
                ObjectMapper objectMapper = new ObjectMapper();
                LandscapeService landscapeService = new LandscapeService(properties, objectMapper);

                LearningLandscape pilot = landscapeService.getById(CANONICAL_MATH_PILOT_ID);

                assertThat(pilot).isNotNull();
                assertThat(pilot.getTitle()).isEqualTo("Mathematik (Gymnasium, DE)");
                assertThat(pilot.getGoals()).isNotEmpty();
                assertThat(pilot.getGoals())
                                .extracting(LearningGoal::getTitle)
                                .contains(
                                                "Funktionsgrundlagen (Sek I)",
                                                "Lineare Funktionen rechnerisch untersuchen",
                                                "Scheitelpunkte quadratischer Funktionen bestimmen",
                                                "Q3 Stochastik",
                                                "Prozessbezogene Kompetenzen (K)");
                assertThat(pilot.getFilters())
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
                                .contains(CANONICAL_PHYSICS_PILOT_ID, CANONICAL_MATH_PILOT_ID)
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
