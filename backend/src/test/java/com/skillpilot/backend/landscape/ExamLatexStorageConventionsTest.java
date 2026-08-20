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
    private static final Pattern MATRIX_ROW_SPACING = Pattern.compile(
            Pattern.quote("\\\\[")
                    + "[ \\t]*[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:pt|pc|in|bp|cm|mm|dd|cc|sp|ex|em)[ \\t]*"
                    + Pattern.quote("]"));
    private static final String UPRIGHT_EURO = "\\,\\mathrm{EUR}";

    @Test
    void matrixRowSpacingMustNotBeConfusedWithOverEscapedDisplayMath() {
        assertThat(hasOverEscapedDelimiter("\\begin{pmatrix}1\\\\[2pt]2\\end{pmatrix}")).isFalse();
        assertThat(hasOverEscapedDelimiter("\\(x\\) and \\[x\\]")).isFalse();

        assertThat(hasOverEscapedDelimiter("\\\\(x\\\\)")).isTrue();
        assertThat(hasOverEscapedDelimiter("\\\\[\\nx\\n\\\\]")).isTrue();
        assertThat(hasOverEscapedDelimiter("\\\\[2pt")).isTrue();
        assertThat(hasOverEscapedDelimiter("\\\\[2]")).isTrue();
        assertThat(hasOverEscapedDelimiter("\\\\[foo]")).isTrue();
        assertThat(hasOverEscapedDelimiter("\\\\\\[2pt]")).isTrue();
    }

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
        if (s.contains("\\\\(") || s.contains("\\\\)") || s.contains("\\\\]")) {
            return true;
        }
        for (int index = s.indexOf("\\\\["); index >= 0; index = s.indexOf("\\\\[", index + 1)) {
            // In a matrix, exactly two backslashes followed by a complete numeric
            // TeX length such as \\[2pt] are a row break with optional spacing,
            // not an over-escaped display-math delimiter. Longer backslash runs
            // and every malformed/non-numeric lookalike remain violations.
            if (index > 0 && s.charAt(index - 1) == '\\') {
                return true;
            }
            Matcher rowSpacing = MATRIX_ROW_SPACING.matcher(s);
            rowSpacing.region(index, s.length());
            if (!rowSpacing.lookingAt()) {
                return true;
            }
        }
        return false;
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
