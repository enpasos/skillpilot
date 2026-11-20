package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Files;
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
        assertThat(service.find(PHYSICS, "merged:de-he-gym-physics-lk-g8+another-view", MOTION)).isEmpty();
        assertThat(service.find(PHYSICS, "de-he-gym-physics-gk-g9", "physics-q1")).isEmpty();
        assertThat(service.find("mathematics", "de-he-gym-physics-gk-g9", MOTION)).isEmpty();
    }

    @Test
    void onlyTheExactLocalizedExerciseTitleAndPromptAreLoaded() throws IOException {
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
                    assertThat(projected.title()).isEqualTo(localized.required("title").asText());
                    assertThat(projected.prompt()).isEqualTo(localized.required("prompt").asText());
                    assertThat(mapper.<JsonNode>valueToTree(projected).properties()).hasSize(2);
                }
            }
            assertThat(material.exercise(material.assessmentGoalId(), "de")).isEmpty();
            assertThat(material.exercise(null, "de")).isEmpty();
        }
    }
}
