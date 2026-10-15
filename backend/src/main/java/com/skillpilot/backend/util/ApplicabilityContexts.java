package com.skillpilot.backend.util;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Exact eligibility only. Target enrollment remains owned by a selected composition. */
public final class ApplicabilityContexts {
    private static final Set<String> KEYS = Set.of("schoolForm", "jurisdiction", "stage", "durationModel", "courseProfile");
    private static final Set<String> JURISDICTIONS = Set.of("DE", "DE-BB", "DE-BE", "DE-BW", "DE-BY", "DE-HB", "DE-HE", "DE-HH", "DE-MV", "DE-NI", "DE-NW", "DE-RP", "DE-SH", "DE-SL", "DE-SN", "DE-ST", "DE-TH");
    private ApplicabilityContexts() {}

    public static boolean isPresent(LearningGoal goal) {
        return goal != null && goal.getExtendedData() != null && goal.getExtendedData().containsKey("applicabilityContexts");
    }

    private static boolean valid(Map<?, ?> value, boolean closed) {
        if (!value.keySet().containsAll(KEYS) || (closed && !value.keySet().equals(KEYS))) return false;
        if (!"Gymnasium".equals(value.get("schoolForm")) || !(value.get("jurisdiction") instanceof String jurisdiction) || !JURISDICTIONS.contains(jurisdiction)) return false;
        Object duration = value.get("durationModel");
        if (duration != null && !"G8".equals(duration) && !"G9".equals(duration)) return false;
        return "SekI".equals(value.get("stage")) ? value.get("courseProfile") == null
                : "SekII".equals(value.get("stage")) && ("GK".equals(value.get("courseProfile")) || "LK".equals(value.get("courseProfile")));
    }

    /** Loading rejects malformed data; matching also denies it defensively. */
    public static void validate(LearningGoal goal) {
        if (!isPresent(goal)) return;
        if (goal.getApplicability() != null || goal.getExtendedData().containsKey("applicabilityOverrides"))
            throw new IllegalArgumentException("Exact applicability contexts cannot coexist with legacy applicability: " + goal.getId());
        Object raw = goal.getExtendedData().get("applicabilityContexts");
        if (!(raw instanceof List<?> contexts)) throw new IllegalArgumentException("applicabilityContexts must be an array: " + goal.getId());
        Set<Map<?, ?>> seen = new HashSet<>();
        for (Object item : contexts) {
            if (!(item instanceof Map<?, ?> context) || !valid(context, true) || !seen.add(context))
                throw new IllegalArgumentException("Malformed or duplicate exact applicability context: " + goal.getId());
        }
    }

    public static boolean matches(LearningGoal goal, Map<String, ?> selectedScope) {
        if (!isPresent(goal)) return true;
        try { validate(goal); } catch (IllegalArgumentException error) { return false; }
        if (selectedScope == null || !valid(selectedScope, false)) return false;
        for (Object item : (List<?>) goal.getExtendedData().get("applicabilityContexts")) {
            Map<?, ?> context = (Map<?, ?>) item;
            boolean matches = true;
            for (String key : KEYS) if (!java.util.Objects.equals(context.get(key), selectedScope.get(key))) { matches = false; break; }
            if (matches) return true;
        }
        return false;
    }
}
