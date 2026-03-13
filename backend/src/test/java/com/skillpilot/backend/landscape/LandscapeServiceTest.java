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
        private static final String HESSEN_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";

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
                                                CANONICAL_PHYSICS_PILOT_ID);
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
                                .contains("Warum Gymnasium gemeinsam denken? - Faecher, Voraussetzungen & Wege");
                assertThat(landscapeService.getOverview().getSummaries())
                                .extracting(LandscapeSummary::getCurriculumId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID)
                                .doesNotContain(CANONICAL_MATH_PILOT_ID, CANONICAL_PHYSICS_PILOT_ID);
                assertThat(landscapeService.getClosure(CANONICAL_GYMNASIUM_ROOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_GYMNASIUM_ROOT_ID, CANONICAL_MATH_PILOT_ID, CANONICAL_PHYSICS_PILOT_ID)
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
                                                "Methode: Messunsicherheit und Fehleranalyse",
                                                "Einfuehrungsphase: Mechanik, Gravitation, Thermodynamik und Drehbewegungen",
                                                "Bewegungen mit Diagrammen untersuchen",
                                                "Newtons Axiome und Inertialsysteme",
                                                "Erhaltungssaetze",
                                                "Q4 Struktur von Materie, Raum und Zeit",
                                                "Abiturpruefung Physik (GK)",
                                                "Abiturpruefung Physik (LK)");
                assertThat(pilot.getFilters())
                                .extracting(LandscapeFilter::getId)
                                .containsExactly("GK", "LK");
                assertThat(landscapeService.getClosure(CANONICAL_PHYSICS_PILOT_ID))
                                .extracting(LearningLandscape::getLandscapeId)
                                .contains(CANONICAL_PHYSICS_PILOT_ID, CANONICAL_MATH_PILOT_ID)
                                .doesNotContain(HESSEN_UPPER_MATH_ID);
        }

        private void assertFiltersEmpty(List<LandscapeSummary> summaries, String curriculumId) {
                LandscapeSummary summary = summaries.stream()
                                .filter(s -> s.getCurriculumId().equals(curriculumId))
                                .findFirst()
                                .orElseThrow(() -> new AssertionError("Curriculum " + curriculumId + " not found"));

                assertThat(summary.getFilters()).isNotNull().isEmpty();
        }
}
