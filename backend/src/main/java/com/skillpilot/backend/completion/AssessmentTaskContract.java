package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/** Fingerprint of the actual current task and grading contract, not its bibliography. */
public final class AssessmentTaskContract {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private AssessmentTaskContract() { }

    public static CompletionWorkflowState.AssessmentStart start(LearningGoal goal) {
        if (!CompletionProfileCompiler.isAssessment(goal) || goal.getExamData() == null) {
            throw new IllegalArgumentException("A concrete assessment task is required");
        }
        ExamData exam = goal.getExamData();
        ObjectNode contract = MAPPER.createObjectNode();
        contract.put("goalId", goal.getId());
        contract.put("taskContent", exam.getTaskContent());
        contract.put("taskContentEn", exam.getTaskContentEn());
        contract.put("solutionContent", exam.getSolutionContent());
        contract.put("solutionContentEn", exam.getSolutionContentEn());
        contract.set("scoring", MAPPER.valueToTree(exam.getScoring()));
        contract.set("coveredGoalIds", MAPPER.valueToTree(exam.getCoveredGoalIds()));
        try {
            byte[] bytes = canonical(contract).toString().getBytes(StandardCharsets.UTF_8);
            return new CompletionWorkflowState.AssessmentStart(goal.getId(), "sha256:"
                    + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)));
        } catch (java.security.NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }

    private static JsonNode canonical(JsonNode node) {
        if (node.isObject()) {
            ObjectNode sorted = MAPPER.createObjectNode();
            List<String> names = new ArrayList<>(); node.fieldNames().forEachRemaining(names::add);
            names.sort(String::compareTo);
            for (String name : names) sorted.set(name, canonical(node.get(name)));
            return sorted;
        }
        if (node.isArray()) {
            ArrayNode array = MAPPER.createArrayNode();
            node.forEach(value -> array.add(canonical(value))); return array;
        }
        return node;
    }
}
