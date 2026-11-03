package com.skillpilot.backend.landscape;

/** Authoritative memory-goal markers shared by completion and verified recall. */
public final class MemoryGoalClassification {
    private MemoryGoalClassification() { }

    public static boolean isMemory(LearningGoal goal) {
        if (goal == null) return false;
        if ("memory".equalsIgnoreCase(goal.getNodeKind()) || "memory".equalsIgnoreCase(goal.getSemanticKind())
                || "memorization".equalsIgnoreCase(goal.getSemanticKind())) return true;
        if (goal.getExtendedData() != null && goal.getExtendedData().get("vocabularySource") instanceof String) return true;
        return goal.getTags() != null && goal.getTags().stream().anyMatch(tag -> tag != null
                && (tag.startsWith("srs-deck") || "memorization".equals(tag)));
    }
}
