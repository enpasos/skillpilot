package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import org.junit.jupiter.api.Test;

class PackageLandscapeModelParityTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void roundTripsCompiledLandscapeContractFields() throws Exception {
        SkillLandscape landscape = objectMapper.readValue("""
                {
                  "$schema": "https://skillpilot.com/schemas/curriculum-package/v1/compiled-landscape.schema.json",
                  "landscapeFormatVersion": "1.0",
                  "landscapeId": "DE-TEST",
                  "locale": "de-DE",
                  "title": "Testlandschaft",
                  "description": "DTO-Parität",
                  "compatibilityOnly": false,
                  "legacyHiddenByDefault": true,
                  "goals": [
                    {
                      "id": "GOAL-1",
                      "title": "Testziel",
                      "description": "Die lernende Person kann das Testziel prüfen.",
                      "core": false,
                      "weight": 1,
                      "tags": [],
                      "dimensionTags": {
                        "framework": "test",
                        "demandLevel": "AB2",
                        "processCompetencies": [],
                        "guidingIdeas": [],
                        "phase": "Q1"
                      },
                      "courseLevel": "both",
                      "themenfeld": "Q1.1",
                      "leitideen": ["L1"],
                      "kompetenzen": ["K1"],
                      "requires": [],
                      "contains": [],
                      "experimentData": {
                        "title": "Versuch",
                        "description": "Ein reproduzierbarer Versuch.",
                        "equipment": ["Messgerät"]
                      },
                      "phase": "Q1",
                      "semanticAtomic": false,
                      "type": "atomic",
                      "nodeKind": "exam",
                      "semanticKind": "practiceAssessment",
                      "examData": {
                        "reviewStatus": "needs_review",
                        "reviewNote": "Fachliche Freigabe steht aus.",
                        "taskContent": "Aufgabe",
                        "solutionContent": "Lösung",
                        "scoring": {
                          "maxPoints": 2,
                          "passingPoints": 1,
                          "steps": []
                        }
                      }
                    }
                  ]
                }
                """, SkillLandscape.class);

        LearningGoal goal = landscape.getGoals().getFirst();
        assertThat(landscape.getSchema()).endsWith("compiled-landscape.schema.json");
        assertThat(landscape.getLandscapeFormatVersion()).isEqualTo("1.0");
        assertThat(landscape.getCompatibilityOnly()).isFalse();
        assertThat(landscape.getLegacyHiddenByDefault()).isTrue();
        assertThat(goal.getCore()).isFalse();
        assertThat(goal.isCore()).isFalse();
        assertThat(goal.getCourseLevel()).isEqualTo("both");
        assertThat(goal.getThemenfeld()).isEqualTo("Q1.1");
        assertThat(goal.getLeitideen()).containsExactly("L1");
        assertThat(goal.getKompetenzen()).containsExactly("K1");
        assertThat(goal.getExperimentData().getEquipment()).containsExactly("Messgerät");
        assertThat(goal.getPhase()).isEqualTo("Q1");
        assertThat(goal.getSemanticAtomic()).isFalse();
        assertThat(goal.getSemanticKind()).isEqualTo("practiceAssessment");
        assertThat(goal.getExamData().getReviewNote()).isEqualTo("Fachliche Freigabe steht aus.");

        JsonNode serialized = objectMapper.valueToTree(landscape);
        JsonNode serializedGoal = serialized.path("goals").get(0);
        assertThat(serialized.path("$schema").asText()).endsWith("compiled-landscape.schema.json");
        assertThat(serialized.path("landscapeFormatVersion").asText()).isEqualTo("1.0");
        assertThat(serialized.path("compatibilityOnly").asBoolean()).isFalse();
        assertThat(serialized.path("legacyHiddenByDefault").asBoolean()).isTrue();
        assertThat(serializedGoal.path("core").asBoolean()).isFalse();
        assertThat(serializedGoal.path("semanticAtomic").asBoolean()).isFalse();
        assertThat(serializedGoal.path("semanticKind").asText()).isEqualTo("practiceAssessment");
        assertThat(serializedGoal.path("experimentData").path("equipment").get(0).asText())
                .isEqualTo("Messgerät");
        assertThat(serializedGoal.path("examData").path("reviewNote").asText())
                .isEqualTo("Fachliche Freigabe steht aus.");
    }

    @Test
    void keepsAbsentCoreDistinctFromExplicitFalseWhilePreservingIsCoreCompatibility() throws Exception {
        LearningGoal absent = objectMapper.readValue("{}", LearningGoal.class);
        LearningGoal explicitFalse = objectMapper.readValue("{\"core\":false}", LearningGoal.class);
        LearningGoal explicitTrue = objectMapper.readValue("{\"core\":true}", LearningGoal.class);

        assertThat(absent.getCore()).isNull();
        assertThat(absent.isCore()).isFalse();
        assertThat(objectMapper.valueToTree(absent).has("core")).isFalse();

        assertThat(explicitFalse.getCore()).isFalse();
        assertThat(explicitFalse.isCore()).isFalse();
        assertThat(objectMapper.valueToTree(explicitFalse).path("core").asBoolean()).isFalse();

        assertThat(explicitTrue.getCore()).isTrue();
        assertThat(explicitTrue.isCore()).isTrue();
        assertThat(objectMapper.valueToTree(explicitTrue).path("core").asBoolean()).isTrue();
    }
}
