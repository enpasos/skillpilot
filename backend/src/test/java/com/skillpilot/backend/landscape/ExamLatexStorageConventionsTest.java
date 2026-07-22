package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

class ExamLatexStorageConventionsTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String J7_TASK_4_ID = "a157b619-e875-5db6-b26a-607a39de00dc";

    @Test
    void examDataMustNotContainOverEscapedLatexDelimiters() throws Exception {
        Path curriculaDir = resolveCurriculaDir();
        List<String> violations = new ArrayList<>();

        try (Stream<Path> files = Files.walk(curriculaDir)) {
            for (Path file : files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .collect(Collectors.toList())) {
                checkFileForViolations(file, violations);
            }
        }

        assertThat(violations)
                .withFailMessage("Found over-escaped LaTeX delimiters in examData:\n%s", String.join("\n", violations))
                .isEmpty();
    }

    @Test
    void j7TaskFourMustUseUprightCurrencyTypesetting() throws Exception {
        Path canonicalMath = resolveCurriculaDir()
                .resolve("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
        JsonNode root = MAPPER.readTree(canonicalMath.toFile());
        JsonNode task = null;
        for (JsonNode goal : root.path("goals")) {
            if (J7_TASK_4_ID.equals(goal.path("id").asText())) {
                task = goal;
                break;
            }
        }

        assertThat(task).as("canonical J7 Task 4").isNotNull();
        String taskContent = task.path("examData").path("taskContent").asText();
        String solutionContent = task.path("examData").path("solutionContent").asText();

        assertThat(taskContent)
                .contains("$1{,}80\\,\\mathrm{EUR}$")
                .doesNotContain("$1.80 EUR$");
        assertThat(solutionContent)
                .contains("$1{,}80\\,\\mathrm{EUR}$")
                .contains("81\\,\\mathrm{EUR}")
                .contains("0\\,\\mathrm{EUR}")
                .doesNotContain("1.80 EUR", "81 EUR", "0 EUR");
    }

    private static void checkFileForViolations(Path file, List<String> violations) {
        JsonNode root;
        try {
            root = MAPPER.readTree(file.toFile());
        } catch (IOException e) {
            return;
        }

        JsonNode goals = root.get("goals");
        if (goals == null || !goals.isArray()) {
            return;
        }

        for (JsonNode goal : goals) {
            JsonNode examData = goal.get("examData");
            if (examData == null || !examData.isObject()) {
                continue;
            }
            String goalId = goal.path("id").asText("unknown-goal");
            checkField(file, goalId, examData, "taskContent", violations);
            checkField(file, goalId, examData, "solutionContent", violations);
            checkField(file, goalId, examData, "taskContentEn", violations);
            checkField(file, goalId, examData, "solutionContentEn", violations);
        }
    }

    private static void checkField(Path file, String goalId, JsonNode examData, String field, List<String> violations) {
        JsonNode node = examData.get(field);
        if (node == null || !node.isTextual()) {
            return;
        }
        String content = node.asText();
        if (hasOverEscapedDelimiter(content)) {
            violations.add(file + " | goal=" + goalId + " | field=" + field);
        }
    }

    private static boolean hasOverEscapedDelimiter(String s) {
        // Parsed JSON should contain \(...\) or \[...\] at most.
        // If it still contains double backslashes before delimiters, it was stored over-escaped.
        return s.contains("\\\\(") || s.contains("\\\\)") || s.contains("\\\\[") || s.contains("\\\\]");
    }

    private static Path resolveCurriculaDir() {
        Path[] candidates = new Path[] { Path.of("..", "curricula"), Path.of("curricula") };
        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate)) {
                return candidate.toAbsolutePath().normalize();
            }
        }
        throw new IllegalStateException("Could not locate curricula directory.");
    }
}
