package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
    void catalogSupportsLegacyAndVersionedMaterialWithOptionalCardsAndRejectsUnknownVersions(@TempDir Path repository) throws IOException {
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
        var introFile = folder.resolve("intro.json");
        var mapper = new ObjectMapper();
        var versioned = (ObjectNode) mapper.readTree(introFile.toFile());
        versioned.put("schemaVersion", 1);
        mapper.writeValue(introFile.toFile(), versioned);
        assertThat(UnitLearningMaterialService.fromRepository(repository, mapper).find("computing", "lecture", "algorithms"))
                .contains(lecture);
        versioned.put("schemaVersion", 5);
        mapper.writeValue(introFile.toFile(), versioned);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .isInstanceOf(IOException.class).hasMessageContaining("Unsupported unit learning material version");
    }

    @Test
    void versionTwoBindsTheExactOpeningAndSharedSceneForActualViews(@TempDir Path repository) throws IOException {
        Files.writeString(repository.resolve("unit-learning-materials.json"), """
                {"schemaVersion":1,"materials":["unit.json"]}
                """);
        Files.writeString(repository.resolve("unit.json"), """
                {"schemaVersion":2,"unit":{"landscapeId":"physics","compositionNodeId":"motion",
                  "viewIds":["gk","lk"],"orientationGoalId":"opening"},
                 "intro":{"de":{"question":"Wo landet der Ball?","promise":"Bewegungen beschreiben",
                  "scene":"Ein blauer Ball rollt zum Tischrand.","imageUrl":"/assets/ball.png","imageAlt":"Ball am Tisch",
                  "topics":["Bewegungen"]},"en":{"question":"Where does it land?","promise":"Describe motion",
                  "scene":"A blue ball rolls towards the edge.","imageUrl":"/assets/ball.png","imageAlt":"Ball on table",
                  "topics":["Motion"]}}}
                """);
        var service = UnitLearningMaterialService.fromRepository(repository, new ObjectMapper());
        var material = service.find("physics", "merged:gk+lk", "motion").orElseThrow();
        assertThat(material.orientationGoalId()).isEqualTo("opening");
        assertThat(material.introduction("de").scene()).contains("blauer Ball");
        assertThat(material.introduction("en").imageUrl()).isEqualTo("/assets/ball.png");
        assertThat(service.orientationBindings(List.of("merged:gk+lk"))).singleElement()
                .satisfies(binding -> assertThat(binding.sectionGoalId()).isEqualTo("composition:merged:gk+lk:structure:motion"));
        assertThat(service.orientationBindings(List.of("merged:gk+missing"))).isEmpty();
        assertThat(service.isUnitOrientationGoal("opening")).isTrue();
        var mapper = new ObjectMapper();
        var file = repository.resolve("unit.json").toFile();
        var data = (ObjectNode) mapper.readTree(file);
        var exercise = data.putArray("exercises").addObject();
        exercise.put("goalId", "experiment");
        exercise.putObject("de").put("title", "Messen").put("prompt", "Lies den Messwert ab.");
        exercise.putObject("en").put("title", "Measure").put("prompt", "Read the measurement.");
        exercise.put("requiredForRegularLearning", true);
        mapper.writeValue(file, data);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("version 3 boolean");
        data.put("schemaVersion", 3);
        mapper.writeValue(file, data);
        assertThat(UnitLearningMaterialService.fromRepository(repository, mapper)
                .find("physics", "merged:gk+lk", "motion").orElseThrow().exercises().get("experiment")
                .requiredForRegularLearning()).isTrue();
        exercise.put("requiredForRegularLearning", "yes");
        mapper.writeValue(file, data);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("version 3 boolean");
        assertThat(service.orientationBindings(List.of("unrelated-view"))).isEmpty();
        assertThat(service.isUnitOrientationGoal("unrelated-goal")).isFalse();
        assertThat(service.isUnitOrientationGoal(null)).isFalse();
        assertThat(UnitLearningMaterialService.empty().isUnitOrientationGoal("opening")).isFalse();
        var invalid = new ObjectMapper().readTree(repository.resolve("unit.json").toFile());
        ((ObjectNode) invalid.required("unit")).remove("orientationGoalId");
        new ObjectMapper().writeValue(repository.resolve("unit.json").toFile(), invalid);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, new ObjectMapper()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("orientationGoalId");
    }

    @Test
    void guidedStudyOrderBelongsToTheSelectedViewsAndEndsAtTheirOwnAssessment(@TempDir Path repository) throws IOException {
        var mapper = new ObjectMapper();
        var source = mapper.createObjectNode();
        source.put("schemaVersion", 3);
        var unit = source.putObject("unit");
        unit.put("landscapeId", "computing").put("compositionNodeId", "search")
                .put("orientationGoalId", "opening").put("assessmentGoalId", "test")
                .putArray("viewIds").add("lecture").add("lab");
        var intro = source.putObject("intro");
        for (var language : List.of("de", "en")) {
            intro.putObject(language).put("question", "Search?").put("promise", "Search.")
                    .put("scene", "Books.").put("imageUrl", "/assets/books.png")
                    .put("imageAlt", "Books").putArray("topics").add("Search");
        }
        var file = repository.resolve("unit.json");
        Files.writeString(repository.resolve("unit-learning-materials.json"), "{\"schemaVersion\":1,\"materials\":[\"unit.json\"]}");
        source.putArray("guidedStudyOrder").add("inspect").add("compare").add("test");
        mapper.writeValue(file.toFile(), source);
        var service = UnitLearningMaterialService.fromRepository(repository, mapper);
        assertThat(service.orientationBindings(List.of("merged:lecture+lab"))).singleElement().satisfies(binding ->
                assertThat(binding.guidedStudyOrder()).containsExactly("inspect", "compare", "test"));
        assertThat(service.orientationBindings(List.of("merged:lecture+tutorial"))).isEmpty();
        source.put("schemaVersion", 2);
        mapper.writeValue(file.toFile(), source);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .hasMessageContaining("version 3 guidedStudyOrder");
        source.put("schemaVersion", 3);
        for (var invalid : List.of(List.of("test"), List.of("opening", "test"), List.of("inspect", "inspect", "test"),
                List.of("inspect", "other"))) {
            source.set("guidedStudyOrder", mapper.valueToTree(invalid));
            mapper.writeValue(file.toFile(), source);
            assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper)).hasMessageContaining("guidedStudyOrder");
        }
    }

    @Test
    void studyRecommendationsBindTwoIndependentChoicesInTheSelectedViews(@TempDir Path repository) throws IOException {
        var mapper = new ObjectMapper();
        var example = Path.of("../curricula/DE/Gymnasium/materials/physics/he-e1-motion-practice.json");
        var source = (ObjectNode) mapper.readTree(example.toFile());
        // Since the E.1 cut (23 Nov 2026) both throw assessments require the throw goal, so the shipped
        // material no longer carries these two recommendations. The format is checked on a copy.
        assertThat(source.has("studyRecommendations")).isFalse();
        var injected = source.putArray("studyRecommendations");
        for (String after : List.of("39f52dcb-ff1d-5cad-9ccb-30da803cfa85", "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9")) {
            injected.addObject().put("beforeGoalId", "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2").put("afterGoalId", after);
        }
        Files.writeString(repository.resolve("unit-learning-materials.json"),
                "{\"schemaVersion\":1,\"materials\":[\"unit.json\"]}");
        var material = repository.resolve("unit.json");
        mapper.writeValue(material.toFile(), source);
        var service = UnitLearningMaterialService.fromRepository(repository, mapper);
        var pairs = service.orientationBindings(List.of("merged:de-he-gym-physics-gk-g8+de-he-gym-physics-lk-g8"))
                .getFirst().studyRecommendations();
        assertThat(pairs).hasSize(2);
        assertThat(pairs).extracting(UnitLearningMaterialService.StudyRecommendation::beforeGoalId)
                .containsOnly("89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2");
        assertThat(pairs).extracting(UnitLearningMaterialService.StudyRecommendation::afterGoalId).containsExactlyInAnyOrder(
                "39f52dcb-ff1d-5cad-9ccb-30da803cfa85", "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9");
        assertThat(service.orientationBindings(List.of("merged:de-he-gym-physics-gk-g8+unrelated"))).isEmpty();

        source.put("schemaVersion", 3);
        mapper.writeValue(material.toFile(), source);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .hasMessageContaining("version 4 studyRecommendations");
        source.put("schemaVersion", 4);
        ((ObjectNode) source.required("studyRecommendations").get(0))
                .put("afterGoalId", pairs.getFirst().beforeGoalId());
        mapper.writeValue(material.toFile(), source);
        assertThatThrownBy(() -> UnitLearningMaterialService.fromRepository(repository, mapper))
                .hasMessageContaining("Invalid or repeated studyRecommendations pair");
    }

    @Test
    void resolvesTheSameIntroductionAndGoalReferencesOnlyForMatchingPersonalViews() throws IOException {
        var service = UnitLearningMaterialService.fromRepository(Path.of("../curricula"), new ObjectMapper());
        var g8 = service.find(PHYSICS, "de-he-gym-physics-gk-g8", MOTION).orElseThrow();
        assertThat(service.find(PHYSICS, "de-he-gym-physics-gk-g9", MOTION)).contains(g8);
        assertThat(service.find(PHYSICS, "merged:de-he-gym-sekii-physics-lk+de-he-gym-sekii-physics-gk", MOTION)).contains(g8);
        assertThat(g8.question("de")).isEqualTo("Ein Ball rollt vom Tisch. Wo landet er?");
        assertThat(g8.promise("en")).contains("measurements", "part B");
        assertThat(g8.flashcardGoalId()).isEqualTo("9f2f5ab8-0ae4-5792-b831-82a05af5895c");
        assertThat(g8.assessmentGoalId()).isEqualTo("a9562b05-c54d-5635-9244-3f7dd24a8642");
        // Both common E.1 extras remain voluntary in every assignment view.
        String common = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9";
        String freeFallSeries = "f41e4e30-794e-5ce4-ba5e-cc72712cd691";
        assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentGoalIds()).containsExactly(common, freeFallSeries);

        for (String view : g8.assessmentContract().viewIds()) {
            var expected = List.of(common, freeFallSeries);
            assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentsFor(view)).as(view)
                    .containsExactlyElementsOf(expected);
        }
        for (String neutral : List.of("de-he-gym-physics-gk", "de-he-gym-physics-lk")) {
            assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentsFor(neutral)).as(neutral)
                    .containsExactly(common, freeFallSeries);
        }
        for (String merged : List.of("merged:de-he-gym-sekii-physics-lk+de-he-gym-sekii-physics-gk",
                "merged:de-he-gym-sekii-physics-gk+de-he-gym-sekii-physics-lk")) {
            assertThat(g8.sectionAssessmentPolicy().voluntaryAssessmentsFor(merged))
                    .containsExactly(common, freeFallSeries);
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
