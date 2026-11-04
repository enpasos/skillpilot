package com.skillpilot.backend.composition;

import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Existing canonical course semantics, shared by availability and composition. */
public final class CourseProfileAvailability {
    private static final String CANONICAL_MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";

    private CourseProfileAvailability() { }

    public static boolean authoredCourseSelection(String landscapeId, String jurisdiction) {
        return CANONICAL_MATH.equals(landscapeId) && "DE-BY".equals(normalize(jurisdiction));
    }

    public static boolean matches(LearningGoal goal, String courseProfile) {
        String profile = normalize(courseProfile);
        if ("GK+LK".equals(profile)) return matches(goal, "GK") || matches(goal, "LK");
        if (profile.isEmpty() || "ALL".equals(profile)) return true;
        List<String> tags = goal.getTags();
        // Preserve the existing ordering: an untagged goal is unrestricted,
        // including when legacy release metadata happens to name a course.
        if (tags == null || tags.isEmpty()) return true;
        if (tags.contains(profile)) return true;
        String releaseCourse = goal.getRelease() == null ? "" : normalize(goal.getRelease().getCourseLevel());
        if (profile.equals(releaseCourse)) return true;
        return !tags.contains("GK") && !tags.contains("LK") && releaseCourse.isEmpty();
    }

    /**
     * Null retains the non-canonical landscape's existing presentation policy.
     * Common jurisdiction/stage/duration filters remain with the actual request;
     * only this component's course availability is applied before the role union.
     */
    public static Set<String> unavailableGoals(SkillLandscape landscape, Map<String, String> scope) {
        if (landscape == null || landscape.getFrameworkId() == null
                || !landscape.getFrameworkId().startsWith("canonical-gymnasium")) return null;
        // This is called only after authored source views have actually matched.
        if (authoredCourseSelection(landscape.getLandscapeId(), scope.get("jurisdiction"))) return Set.of();
        Set<String> unavailable = new LinkedHashSet<>();
        if (landscape.getGoals() != null) {
            for (LearningGoal goal : landscape.getGoals()) {
                if (!matches(goal, scope.get("courseProfile"))) unavailable.add(goal.getId());
            }
        }
        return Collections.unmodifiableSet(unavailable);
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
