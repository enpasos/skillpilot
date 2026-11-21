package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class UnitLearningMaterialServiceTest {
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MOTION = "physics-e1-motion";

    @Test
    void catalogResolvesAnUnrelatedProgramWithAndWithoutCards(@TempDir Path repository) throws IOException {
        var folder = Files.createDirectories(repository.resolve("university/computing/units"));
        String source = """
                {"unit":{"landscapeId":"computing","compositionNodeId":"algorithms","viewIds":["%s"]%s},
                 "intro":{"de":{"question":"Wie sucht man?","promise":"Suchverfahren vergleichen"},
                         "en":{"question":"How do we search?","promise":"Compare search methods"}}}
                """;
        Files.writeString(folder.resolve("intro.json"), source.formatted("lecture", ""));
        Files.writeString(folder.resolve("recall.json"), source.formatted("seminar", ",\"flashcardGoalId\":\"algorithms-deck\""));
        Files.writeString(repository.resolve("unit-learning-materials.json"), """
                {"schemaVersion":1,"materials":["university/computing/units/intro.json","university/computing/units/recall.json"]}
                """);
        var materials = UnitLearningMaterialService.fromRepository(repository, new ObjectMapper());
        var lecture = materials.find("computing", "lecture", "algorithms").orElseThrow();
        assertThat(lecture.flashcardGoalId()).isNull();
        assertThat(lecture.assessmentContract()).isNull();
        assertThat(materials.find("computing", "seminar", "algorithms").orElseThrow().flashcardGoalId()).isEqualTo("algorithms-deck");
        assertThat(materials.find("computing", "merged:lecture+seminar", "algorithms")).isEmpty();
        assertThat(materials.find("physics", "seminar", "algorithms")).isEmpty();
    }

    @Test
    void resolvesTheSameIntroductionAndGoalReferencesOnlyForMatchingPersonalViews() throws IOException {
        var service = UnitLearningMaterialService.fromRepository(Path.of("../curricula"), new ObjectMapper());
        var g8 = service.find(PHYSICS, "de-he-gym-physics-gk-g8", MOTION).orElseThrow();
        assertThat(service.find(PHYSICS, "de-he-gym-physics-gk-g9", MOTION)).contains(g8);
        assertThat(service.find(PHYSICS, "merged:de-he-gym-sekii-physics-lk+de-he-gym-sekii-physics-gk", MOTION)).contains(g8);
        assertThat(g8.question("de")).isEqualTo("Ein Ball rollt vom Tisch. Wo landet er?");
        assertThat(g8.promise("en")).contains("motion data");
        assertThat(g8.flashcardGoalId()).isEqualTo("9f2f5ab8-0ae4-5792-b831-82a05af5895c");
        assertThat(g8.assessmentGoalId()).isEqualTo("a9562b05-c54d-5635-9244-3f7dd24a8642");
        assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentGoalIds())
                .containsExactly("6ea3fb3c-abdc-568f-ab13-97c36dc274e4");
        String common = "6ea3fb3c-abdc-568f-ab13-97c36dc274e4";
        String advanced = "2b9e565f-d9b4-5e23-b5b7-b7977cecff06";
        for (String view : g8.assessmentContract().viewIds()) {
            assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentsFor(view))
                    .containsExactlyElementsOf(view.contains("-lk") ? List.of(common, advanced) : List.of(common));
        }
        for (String merged : List.of("merged:de-he-gym-sekii-physics-lk+de-he-gym-sekii-physics-gk",
                "merged:de-he-gym-sekii-physics-gk+de-he-gym-sekii-physics-lk")) {
            assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentsFor(merged)).containsExactly(common, advanced);
        }
        assertThat(service.find(PHYSICS, "merged:de-he-gym-physics-lk-g8+another-view", MOTION)).isEmpty();
        assertThat(service.find(PHYSICS, "de-he-gym-physics-gk-g9", "physics-q1")).isEmpty();
        assertThat(service.find("mathematics", "de-he-gym-physics-gk-g9", MOTION)).isEmpty();
    }

    @Test
    void durationNeutralCrossStageOffersLearningMaterialsWhileTheFourPartAwardUsesItsOwnViews() throws IOException {
        var directory = Path.of("../curricula");
        var mapper = new ObjectMapper();
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        var views = new CompositionViewService(properties, mapper);
        var materials = UnitLearningMaterialService.fromRepository(directory, mapper);
        var g8Exercises = materials.find(PHYSICS, "de-he-gym-physics-gk-g8", MOTION).orElseThrow().exercises();
        for (String course : List.of("GK", "LK", "GK+LK")) {
            var scope = new LinkedHashMap<>(Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                    "stage", "CrossStage", "courseProfile", course));
            String neutral = (String) views.findLearnerScopeView(PHYSICS, scope).get("viewId");
            assertThat(neutral).isEqualTo("GK+LK".equals(course)
                    ? "merged:de-he-gym-physics-lk+de-he-gym-physics-gk"
                    : "de-he-gym-physics-" + course.toLowerCase(Locale.ROOT));
            var material = materials.find(PHYSICS, neutral, MOTION).orElseThrow();
            assertThat(material.question("de")).isEqualTo("Ein Ball rollt vom Tisch. Wo landet er?");
            assertThat(material.exercises()).isEqualTo(g8Exercises);
            assertThat(material.flashcardGoalId()).isEqualTo("9f2f5ab8-0ae4-5792-b831-82a05af5895c");
            assertThat(materials.assessmentBindings(List.of(neutral))).isEmpty();
            assertThat(materials.assessmentBindingForReference("composition:" + neutral + ":structure:" + MOTION)).isEmpty();
            for (String duration : List.of("G8", "G9")) {
                scope.put("durationModel", duration);
                for (String stage : List.of("CrossStage", "SekII")) {
                    scope.put("stage", stage);
                    String selected = (String) views.findLearnerScopeView(PHYSICS, scope).get("viewId");
                    assertThat(selected).isNotEqualTo(neutral);
                    assertThat(materials.assessmentBindings(List.of(selected))).singleElement().satisfies(binding ->
                            assertThat(binding.contract().parts()).hasSize(4));
                }
            }
        }
    }

    @Test
    void changingOrRemovingARequiredPartDisablesTheVoluntarySectionException(@TempDir Path repository) throws IOException {
        var mapper = new ObjectMapper();
        var source = mapper.readTree(Path.of("../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json").toFile());
        var local = Files.createDirectories(repository.resolve("DE/Gymnasium/materials")).resolve("sample-practice.json");
        for (boolean removePart : List.of(false, true)) {
            var changed = source.deepCopy();
            var parts = (com.fasterxml.jackson.databind.node.ArrayNode) changed.at("/unit/assessmentContract/parts");
            if (removePart) parts.remove(0);
            else ((com.fasterxml.jackson.databind.node.ObjectNode) parts.get(0).get("material"))
                    .put("rubricRevision", "sha256:" + "b".repeat(64));
            mapper.writeValue(local.toFile(), changed);
            var material = UnitLearningMaterialService.fromRepository(repository, mapper)
                    .find(PHYSICS, "de-he-gym-physics-gk-g9", MOTION).orElseThrow();
            assertThat(material.assessmentContract()).isNotNull();
            assertThat(material.sectionAssessmentPolicy()).isNull();
        }
    }

    @Test
    void anUnknownViewOrRepeatedOrRequiredAdditionalGoalInvalidatesTheSectionPolicy(@TempDir Path repository) throws IOException {
        var mapper = new ObjectMapper();
        var source = mapper.readTree(Path.of("../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json").toFile());
        var local = Files.createDirectories(repository.resolve("DE/Gymnasium/materials")).resolve("sample-practice.json");
        String view = "de-he-gym-sekii-physics-lk";
        String common = source.at("/unit/sectionAssessmentPolicy/voluntaryAssessmentGoalIds/0").asText();
        String required = source.at("/unit/assessmentContract/parts/0/goalId").asText();
        for (var refs : List.of(Map.of("unknown-view", List.of(common)),
                Map.of(view, List.of(common)), Map.of(view, List.of(required)), Map.of(view, List.of("repeat", "repeat")))) {
            var changed = source.deepCopy();
            var policy = (com.fasterxml.jackson.databind.node.ObjectNode) changed.at("/unit/sectionAssessmentPolicy");
            policy.set("additionalVoluntaryAssessmentGoalIdsByView", mapper.valueToTree(refs));
            mapper.writeValue(local.toFile(), changed);
            assertThat(UnitLearningMaterialService.fromRepository(repository, mapper)
                    .find(PHYSICS, view, MOTION).orElseThrow().sectionAssessmentPolicy()).isNull();
        }
    }

    @Test
    void loadsOnlyTheLocalizedTitlePromptAndAnyAuthoredEvidenceCriteria() throws IOException {
        var mapper = new ObjectMapper();
        var curricula = Path.of("../curricula");
        var service = UnitLearningMaterialService.fromRepository(curricula, mapper);
        var actualSource = mapper.readTree(curricula.resolve("DE/Gymnasium/materials/physics/he-e1-motion-practice.json").toFile());
        for (String view : new String[] {"de-he-gym-physics-gk-g8", "de-he-gym-physics-gk-g9"}) {
            var material = service.find(PHYSICS, view, MOTION).orElseThrow();
            for (JsonNode exercise : actualSource.required("exercises")) {
                String goalId = exercise.required("goalId").asText();
                for (String language : new String[] {"de", "en"}) {
                    var localized = exercise.required(language);
                    var projected = material.exercise(goalId, language).orElseThrow();
                    var expected = mapper.createObjectNode();
                    expected.set("title", localized.required("title"));
                    expected.set("prompt", localized.required("prompt"));
                    if (localized.has("evidenceCriteria")) expected.set("evidenceCriteria", localized.get("evidenceCriteria"));
                    assertThat(mapper.<JsonNode>valueToTree(projected)).isEqualTo(expected);
                }
            }
            assertThat(material.exercise(material.assessmentGoalId(), "de")).isEmpty();
            assertThat(material.exercise(null, "de")).isEmpty();
        }
    }
}
