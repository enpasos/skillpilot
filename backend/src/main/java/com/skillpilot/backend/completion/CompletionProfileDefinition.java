package com.skillpilot.backend.completion;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Reviewed curriculum policy. It never contains an individual learner result. */
public record CompletionProfileDefinition(
        int schemaVersion,
        String id,
        String revision,
        Map<String, String> title,
        String levelScopeRef,
        Map<String, List<String>> applicability,
        List<String> protectedGoalIds,
        Review review,
        List<WaiverRule> rules) {

    public CompletionProfileDefinition {
        title = title == null ? Map.of() : Collections.unmodifiableMap(new LinkedHashMap<>(title));
        Map<String, List<String>> applicabilityCopy = new LinkedHashMap<>();
        if (applicability != null) {
            applicability.forEach((key, values) -> applicabilityCopy.put(key,
                    values == null ? List.of() : List.copyOf(values)));
        }
        applicability = Collections.unmodifiableMap(applicabilityCopy);
        protectedGoalIds = protectedGoalIds == null ? List.of() : List.copyOf(protectedGoalIds);
        rules = rules == null ? List.of() : List.copyOf(rules);
    }

    public record Review(String reference, String scopeRevision, String taskRevision, String rubricRevision) {
    }

    public record WaiverRule(
            String ruleId,
            List<String> assessmentGoalIds,
            List<String> waivableGoalIds,
            String rationale,
            String reviewRef) {
        public WaiverRule {
            assessmentGoalIds = assessmentGoalIds == null ? List.of() : List.copyOf(assessmentGoalIds);
            waivableGoalIds = waivableGoalIds == null ? List.of() : List.copyOf(waivableGoalIds);
        }
    }
}
