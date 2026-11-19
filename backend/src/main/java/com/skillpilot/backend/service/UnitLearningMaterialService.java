package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ActiveGoalContext.PracticeExercise;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Stream;

/** Unit introductions, activity references and exercise prompts shared by the map and the coach. */
public final class UnitLearningMaterialService {
    private record Key(String landscape, String view, String node) {}
    public record Intro(String question, String promise) {}
    public record Material(String flashcardGoalId, String assessmentGoalId, Map<String, Intro> intro,
            Map<String, Map<String, PracticeExercise>> exercises) {
        public Material {
            intro = Map.copyOf(intro);
            exercises = Map.copyOf(exercises);
        }

        public String question(String language) { return localized(language).question(); }
        public String promise(String language) { return localized(language).promise(); }

        public Optional<PracticeExercise> exercise(String goalId, String language) {
            if (goalId == null || !exercises.containsKey(goalId)) return Optional.empty();
            return Optional.ofNullable(exercises.get(goalId).get("en".equalsIgnoreCase(language) ? "en" : "de"));
        }

        private Intro localized(String language) {
            return "en".equalsIgnoreCase(language) ? intro.get("en") : intro.get("de");
        }
    }

    private final Map<Key, Material> materials;

    private UnitLearningMaterialService(Map<Key, Material> materials) {
        this.materials = Map.copyOf(materials);
    }

    public static UnitLearningMaterialService empty() {
        return new UnitLearningMaterialService(Map.of());
    }

    public static UnitLearningMaterialService fromRepository(Path directory, ObjectMapper mapper) throws IOException {
        Path folder = directory.resolve("DE/Gymnasium/materials");
        if (!Files.isDirectory(folder)) return empty();
        Map<Key, Material> materials = new HashMap<>();
        try (Stream<Path> files = Files.walk(folder)) {
            for (Path file : files.filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().endsWith("-practice.json")).toList()) {
                JsonNode data = mapper.readTree(file.toFile());
                JsonNode unit = data.required("unit");
                Map<String, Intro> intros = new HashMap<>();
                for (String language : new String[] {"de", "en"}) {
                    JsonNode intro = data.required("intro").required(language);
                    intros.put(language, new Intro(intro.required("question").asText(), intro.required("promise").asText()));
                }
                Material material = new Material(unit.path("flashcardGoalId").textValue(),
                        unit.path("assessmentGoalId").textValue(), intros, readExercises(data.path("exercises"), file));
                String landscape = unit.required("landscapeId").asText();
                String node = unit.required("compositionNodeId").asText();
                for (JsonNode view : unit.required("viewIds")) {
                    Key key = new Key(landscape, view.asText(), node);
                    if (materials.putIfAbsent(key, material) != null) {
                        throw new IllegalArgumentException("Duplicate unit material for " + key + " in " + file);
                    }
                }
            }
        }
        return new UnitLearningMaterialService(materials);
    }

    private static Map<String, Map<String, PracticeExercise>> readExercises(JsonNode entries, Path file) {
        if (entries.isMissingNode()) return Map.of();
        if (!entries.isArray()) throw new IllegalArgumentException("Expected array of unit exercises in " + file);
        Map<String, Map<String, PracticeExercise>> exercises = new HashMap<>();
        for (JsonNode entry : entries) {
            String goal = requiredText(entry, "goalId", file);
            if (exercises.putIfAbsent(goal, Map.of("de", readExercise(entry.required("de"), file),
                    "en", readExercise(entry.required("en"), file))) != null) {
                throw new IllegalArgumentException("Duplicate exercise for " + goal + " in " + file);
            }
        }
        return exercises;
    }

    private static PracticeExercise readExercise(JsonNode entry, Path file) {
        return new PracticeExercise(requiredText(entry, "title", file), requiredText(entry, "prompt", file));
    }

    private static String requiredText(JsonNode entry, String field, Path file) {
        String value = entry.path(field).textValue();
        if (value == null || value.isBlank()) throw new IllegalArgumentException("Missing exercise " + field + " in " + file);
        return value;
    }

    public Optional<Material> find(String landscapeId, String viewId, String compositionNodeId) {
        if (viewId == null || viewId.isBlank()) return Optional.empty();
        String[] views = viewId.startsWith("merged:") ? viewId.substring(7).split("\\+", -1) : new String[] {viewId};
        Material selected = materials.get(new Key(landscapeId, views[0], compositionNodeId));
        for (String view : views) {
            if (selected == null || !selected.equals(materials.get(new Key(landscapeId, view, compositionNodeId)))) {
                return Optional.empty();
            }
        }
        return Optional.of(selected);
    }
}
