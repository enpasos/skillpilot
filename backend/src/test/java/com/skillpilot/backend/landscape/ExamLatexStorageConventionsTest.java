package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;

class ExamLatexStorageConventionsTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern INLINE_MATH =
            Pattern.compile("(?<!\\\\)\\$(?!\\$)(.*?)(?<!\\\\)\\$(?!\\$)", Pattern.DOTALL);
    private static final String UPRIGHT_EURO = "\\,\\mathrm{EUR}";

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
    void examDataMathCurrencyMustUseUprightEuroTypesetting() throws Exception {
        Path curriculaDir = resolveCurriculaDir();
        List<String> violations = new ArrayList<>();

        try (Stream<Path> files = Files.walk(curriculaDir)) {
            for (Path file : files
                    .filter(Files::isRegularFile)
                    .filter(p -> p.getFileName().toString().endsWith(".json"))
                    .collect(Collectors.toList())) {
                checkFileForCurrencyViolations(file, violations);
            }
        }

        assertThat(violations)
                .withFailMessage(
                        "Found EUR inside examData math without the exact \\,\\mathrm{EUR} typesetting:\n%s",
                        String.join("\n", violations))
                .isEmpty();
    }

    private static void checkFileForCurrencyViolations(Path file, List<String> violations) {
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
            checkCurrencyField(file, goalId, examData, "taskContent", violations);
            checkCurrencyField(file, goalId, examData, "solutionContent", violations);
            checkCurrencyField(file, goalId, examData, "taskContentEn", violations);
            checkCurrencyField(file, goalId, examData, "solutionContentEn", violations);
        }
    }

    private static void checkCurrencyField(
            Path file, String goalId, JsonNode examData, String field, List<String> violations) {
        JsonNode node = examData.get(field);
        if (node == null || !node.isTextual()) {
            return;
        }

        Matcher matcher = INLINE_MATH.matcher(node.asText());
        while (matcher.find()) {
            String expression = matcher.group(1);
            String withoutCorrectEuroTokens = expression.replace(UPRIGHT_EURO, "");
            if (withoutCorrectEuroTokens.contains("EUR")) {
                violations.add(file + " | goal=" + goalId + " | field=" + field + " | math=$"
                        + expression.replace("\n", "\\n") + "$");
            }
        }
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
