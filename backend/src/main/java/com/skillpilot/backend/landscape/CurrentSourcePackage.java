package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.goalfeedback.GoalFeedbackCanonicalJson;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/** Java counterpart of scripts/current_source_packages.py for retained-source readers. */
final class CurrentSourcePackage {
    private static final GoalFeedbackCanonicalJson STABLE_JSON = new GoalFeedbackCanonicalJson(new ObjectMapper());

    private CurrentSourcePackage() {
    }

    static Map<String, Path> currentExtractions(Path curriculaDir, JsonNode entries, ObjectMapper mapper)
            throws IOException {
        Map<String, Integer> identities = new HashMap<>();
        entries.forEach(entry -> identities.merge(entry.path("landscapeId").asText(), 1, Integer::sum));
        Map<String, Path> result = new LinkedHashMap<>();
        Set<String> registeredPaths = new HashSet<>();
        for (JsonNode entry : entries) {
            if (!entry.has("sourcePackages")) continue;
            String identity = text(entry, "landscapeId");
            if (identities.get(identity) != 1) throw invalid("Duplicate versioned source identity: " + identity);
            JsonNode scope = entry.path("packageScope");
            for (String field : Set.of("subject", "stage", "schoolType", "validity", "targetLandscapeId")) {
                text(scope, field);
            }
            Map<String, JsonNode> editions = indexed(entry.path("sourcePackages"), "id");
            JsonNode current = null;
            for (JsonNode edition : editions.values()) {
                String status = text(edition, "status");
                if (!Set.of("current", "draft", "historical").contains(status)) {
                    throw invalid("Unknown source package status: " + status);
                }
                if ("current".equals(status)) {
                    if (current != null) throw invalid("Multiple current extractions for " + identity);
                    current = edition;
                }
                for (String field : Set.of("extraction", "review")) {
                    String path = text(edition.path(field), "path");
                    if (!registeredPaths.add(path)) throw invalid("Ambiguous source package path: " + path);
                }
            }
            if (current == null) throw invalid("Missing current extraction for " + identity);
            Path extractionPath = checkedFile(curriculaDir, current.path("extraction"));
            JsonNode source = mapper.readTree(extractionPath.toFile());
            JsonNode review = mapper.readTree(checkedFile(curriculaDir, current.path("review")).toFile());
            checkedFile(curriculaDir, current.path("document"));
            if (!text(review, "sourceExtractionPath").equals(text(current.path("extraction"), "path"))
                    || !text(source.path("sourceDocument"), "path").equals(text(current.path("document"), "path"))
                    || !identity.equals(text(source, "sourceLandscapeId"))
                    || !identity.equals(text(review, "sourceLandscapeId"))
                    || !text(source, "jurisdiction").equals(text(entry, "jurisdiction"))
                    || !text(source, "subject").equals(text(scope, "subject"))
                    || !text(source, "stage").equals(text(scope, "stage"))
                    || !text(review, "targetLandscapeId").equals(text(scope, "targetLandscapeId"))) {
                throw invalid("Inconsistent source package identity: " + identity);
            }
            validateRows(source, review, text(current, "format"));
            result.put(identity, extractionPath);
        }
        return result;
    }

    private static void validateRows(JsonNode source, JsonNode review, String format) {
        Map<String, JsonNode> goals = indexed(source.path("sourceGoals"), "id");
        Map<String, JsonNode> decisions = indexed(review.path("decisions"), "sourceGoalId");
        Map<String, JsonNode> passages = indexed(source.path("passages"), "id");
        if (!goals.keySet().equals(decisions.keySet())
                || goals.values().stream().anyMatch(row -> !passages.containsKey(text(row, "passageId")))) {
            throw invalid("Incomplete source package review or orphaned ID");
        }
        Set<Pair> expected = new HashSet<>();
        for (Map.Entry<String, JsonNode> entry : decisions.entrySet()) {
            for (JsonNode target : array(entry.getValue(), "canonicalGoalIds")) {
                expected.add(new Pair(entry.getKey(), target.asText()));
            }
        }
        Set<Pair> actual = new HashSet<>();
        for (JsonNode mapping : array(review, "mappings")) {
            if (!actual.add(new Pair(text(mapping, "legacyGoalId"), text(mapping, "canonicalGoalId")))) {
                throw invalid("Duplicate source package mapping pair");
            }
        }
        if (!actual.equals(expected)) throw invalid("Inconsistent source package mapping pairs");
        if ("literal-v1".equals(format)) {
            for (Map.Entry<String, JsonNode> entry : goals.entrySet()) {
                JsonNode row = entry.getValue();
                JsonNode decision = decisions.get(entry.getKey());
                JsonNode targets = array(decision, "canonicalGoalIds");
                String outcome = text(decision, "decision");
                Set<String> uniqueTargets = new HashSet<>();
                targets.forEach(target -> uniqueTargets.add(target.asText()));
                if (!Set.of("mapped", "needsCanonicalGoal").contains(outcome)
                        || "mapped".equals(outcome) != !targets.isEmpty()
                        || uniqueTargets.size() != targets.size()) {
                    throw invalid("Incomplete mapping decision: " + entry.getKey());
                }
                if (!text(decision, "sourceGoalSha256").equals(STABLE_JSON.digest(row).substring("sha256:".length()))
                        || !text(decision, "sourceSpan").equals(text(row, "sourceSpan"))) {
                    throw invalid("Changed reviewed source row: " + entry.getKey());
                }
            }
        } else if (!"retained-v1".equals(format)) {
            throw invalid("Unknown source package format: " + format);
        }
    }

    private static Path checkedFile(Path curriculaDir, JsonNode binding) throws IOException {
        String relative = text(binding, "path");
        Path local = Path.of(relative);
        if (!relative.startsWith("curricula/") || local.isAbsolute()
                || !local.normalize().toString().equals(relative)
                || local.toString().contains("\\")) {
            throw invalid("Invalid source package path: " + relative);
        }
        Path path = curriculaDir.resolve(relative.substring("curricula/".length()));
        try {
            String digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(path)));
            if (!digest.equals(text(binding, "sha256"))) throw invalid("Stale source package binding: " + relative);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
        return path;
    }

    private static Map<String, JsonNode> indexed(JsonNode rows, String key) {
        if (!rows.isArray() || rows.isEmpty()) throw invalid("Empty source package inventory: " + key);
        Map<String, JsonNode> result = new LinkedHashMap<>();
        for (JsonNode row : rows) {
            String id = text(row, key);
            if (result.putIfAbsent(id, row) != null) throw invalid("Duplicate source package " + key + ": " + id);
        }
        return result;
    }

    private static JsonNode array(JsonNode row, String key) {
        JsonNode value = row.path(key);
        if (!value.isArray()) throw invalid("Missing source package array: " + key);
        return value;
    }

    private static String text(JsonNode row, String key) {
        JsonNode value = row == null ? null : row.get(key);
        if (value == null || !value.isTextual() || value.textValue().isEmpty()) {
            throw invalid("Missing source package text: " + key);
        }
        return value.textValue();
    }

    private static IllegalStateException invalid(String message) {
        return new IllegalStateException(message);
    }

    private record Pair(String source, String target) {
    }
}
