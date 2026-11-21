package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Read-only context attached to one confirmed active learning goal. */
public record ActiveGoalContext(
        String goalId,
        String phase,
        List<UnitPath> unitPaths,
        List<Prerequisite> prerequisites,
        UnitIntroduction unitIntroduction,
        List<Activity> activities,
        PracticeExercise practiceExercise) {

    public ActiveGoalContext(String goalId, String phase, List<UnitPath> unitPaths,
            List<Prerequisite> prerequisites, UnitIntroduction unitIntroduction, List<Activity> activities) {
        this(goalId, phase, unitPaths, prerequisites, unitIntroduction, activities, null);
    }

    public record UnitPath(List<String> sections, boolean inCurrentFocus, boolean otherPlacements) { }

    public record Prerequisite(String goalId, String title, boolean recorded, boolean planningCredit) {
        public Prerequisite(String goalId, String title, boolean recorded) {
            this(goalId, title, recorded, false);
        }
    }

    public record UnitIntroduction(String sectionTitle, String question, String promise) { }

    public record PracticeExercise(String title, String prompt,
            @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> evidenceCriteria) {
        public PracticeExercise {
            evidenceCriteria = evidenceCriteria == null ? List.of() : List.copyOf(evidenceCriteria);
        }

        public PracticeExercise(String title, String prompt) {
            this(title, prompt, List.of());
        }
    }

    public record Activity(String goalId, String title, String kind, String sectionTitle, String route,
            String practiceScopeId) { }
}
