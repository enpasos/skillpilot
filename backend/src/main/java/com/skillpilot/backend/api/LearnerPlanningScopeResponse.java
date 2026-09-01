package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Side-effect-free snapshot of the learner-facing atomic targets available to
 * local course planning.
 */
public record LearnerPlanningScopeResponse(
        String curriculumId,
        String landscapeId,
        List<String> focusGoalIds,
        List<String> scopeGoalIds,
        long totalAtomicGoalCount,
        long masteredAtomicGoalCount,
        List<String> openAtomicGoalIds,
        Instant capturedAt) {

    public LearnerPlanningScopeResponse {
        requireText(curriculumId, "curriculumId");
        requireText(landscapeId, "landscapeId");
        focusGoalIds = immutableDistinctIds(focusGoalIds, "focusGoalIds", false);
        scopeGoalIds = immutableDistinctIds(scopeGoalIds, "scopeGoalIds", false);
        openAtomicGoalIds = immutableDistinctIds(openAtomicGoalIds, "openAtomicGoalIds", true);
        if (capturedAt == null) {
            throw new IllegalArgumentException("capturedAt is required");
        }
        if (totalAtomicGoalCount != scopeGoalIds.size()) {
            throw new IllegalArgumentException("totalAtomicGoalCount must equal scopeGoalIds size");
        }
        if (masteredAtomicGoalCount < 0 || masteredAtomicGoalCount > totalAtomicGoalCount) {
            throw new IllegalArgumentException("masteredAtomicGoalCount is outside the atomic scope");
        }
        if (!Set.copyOf(scopeGoalIds).containsAll(openAtomicGoalIds)) {
            throw new IllegalArgumentException("openAtomicGoalIds must be a subset of scopeGoalIds");
        }
        if (masteredAtomicGoalCount != totalAtomicGoalCount - openAtomicGoalIds.size()) {
            throw new IllegalArgumentException("atomic mastery counts are inconsistent");
        }
    }

    private static void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }

    private static List<String> immutableDistinctIds(
            List<String> values,
            String field,
            boolean allowEmpty) {
        if (values == null || (!allowEmpty && values.isEmpty())) {
            throw new IllegalArgumentException(field + " must not be empty");
        }
        LinkedHashSet<String> normalized = new LinkedHashSet<>();
        for (String value : values) {
            requireText(value, field + " entry");
            if (!normalized.add(value)) {
                throw new IllegalArgumentException(field + " must not contain duplicates");
            }
        }
        return List.copyOf(normalized);
    }
}
