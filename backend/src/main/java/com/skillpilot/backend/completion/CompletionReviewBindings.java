package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/** Shared, transport-independent binding of static review to its actual curriculum inputs. */
public final class CompletionReviewBindings {
    private CompletionReviewBindings() { }

    public static void validate(CompletionProfileDefinition profile, CompletionScopeDefinition scope,
            JsonNode scopeDocument, Map<String, JsonNode> goals, ObjectMapper mapper) throws Exception {
        Map<String, JsonNode> targets = targetGoals(scope, goals);
        Map<String, Object> scopeBinding = new TreeMap<>();
        scopeBinding.put("scope", scopeDocument);
        scopeBinding.put("targetGoals", new ArrayList<>(targets.values()));
        requireHash(profile.review().scopeRevision(), canonicalHash(mapper.valueToTree(scopeBinding), mapper),
                "scope/target semantics");
        Map<String, Object> tasks = new TreeMap<>();
        Map<String, JsonNode> rubrics = new TreeMap<>();
        for (var entry : targets.entrySet()) {
            LearningGoal goal = mapper.treeToValue(entry.getValue(), LearningGoal.class);
            if (!CompletionProfileCompiler.isAssessment(goal)) continue;
            JsonNode data = entry.getValue().path("examData");
            if (!data.path("taskContent").isTextual() || !data.path("solutionContent").isTextual()
                    || !data.path("scoring").isObject()) {
                throw new IllegalArgumentException("Required assessment lacks reviewed task, solution or rubric");
            }
            tasks.put(entry.getKey(), Map.of("taskContent", data.path("taskContent"),
                    "solutionContent", data.path("solutionContent")));
            rubrics.put(entry.getKey(), data.path("scoring"));
        }
        if (tasks.isEmpty()) throw new IllegalArgumentException("Reviewed scope has no required assessment");
        Object taskBinding = tasks.size() == 1 ? tasks.values().iterator().next() : tasks;
        Object rubricBinding = rubrics.size() == 1 ? rubrics.values().iterator().next() : rubrics;
        requireHash(profile.review().taskRevision(), canonicalHash(mapper.valueToTree(taskBinding), mapper),
                "assessment tasks/solutions");
        requireHash(profile.review().rubricRevision(), canonicalHash(mapper.valueToTree(rubricBinding), mapper),
                "assessment rubrics");
    }

    public static Map<String, JsonNode> targetGoals(CompletionScopeDefinition scope, Map<String, JsonNode> goals) {
        Map<String, JsonNode> targets = new TreeMap<>();
        Set<String> seen = new LinkedHashSet<>();
        ArrayDeque<String> queue = new ArrayDeque<>(scope.targetRootIds());
        while (!queue.isEmpty()) {
            String id = queue.removeFirst();
            if (!seen.add(id)) continue;
            JsonNode goal = goals.get(id);
            if (goal == null) throw new IllegalArgumentException("Unknown or ambiguous reviewed scope goal: " + id);
            JsonNode children = goal.path("contains");
            if (!children.isArray() || children.isEmpty()) targets.put(id, goal);
            else for (JsonNode child : children) queue.addLast(child.asText());
        }
        return targets;
    }

    public static String canonicalHash(JsonNode node, ObjectMapper mapper) throws Exception {
        StringBuilder canonical = new StringBuilder();
        appendCanonical(node, mapper, canonical);
        return "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(canonical.toString().getBytes(StandardCharsets.UTF_8)));
    }

    private static void appendCanonical(JsonNode node, ObjectMapper mapper, StringBuilder output) throws IOException {
        if (node.isObject()) {
            output.append('{');
            Map<String, JsonNode> sorted = new TreeMap<>();
            node.fields().forEachRemaining(entry -> sorted.put(entry.getKey(), entry.getValue()));
            boolean first = true;
            for (var entry : sorted.entrySet()) {
                if (!first) output.append(',');
                first = false;
                output.append(mapper.writeValueAsString(entry.getKey())).append(':');
                appendCanonical(entry.getValue(), mapper, output);
            }
            output.append('}');
        } else if (node.isArray()) {
            output.append('[');
            boolean first = true;
            for (JsonNode value : node) {
                if (!first) output.append(',');
                first = false;
                appendCanonical(value, mapper, output);
            }
            output.append(']');
        } else output.append(mapper.writeValueAsString(node));
    }

    private static void requireHash(String expected, String actual, String input) {
        if (!actual.equals(expected)) throw new IllegalArgumentException("Stale completion review for " + input);
    }
}
