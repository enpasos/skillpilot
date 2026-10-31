package com.skillpilot.backend.completion;

import java.util.List;
import java.util.Set;

/** Immutable scope identity and graph; historical reviewed and automatic semantics remain distinct. */
public final class CompiledCompletionProfile extends CompiledCompletionGraph {
    private final CompletionProfileDefinition definition;
    private final String curriculumGeneration;
    private final boolean automatic;

    CompiledCompletionProfile(CompletionProfileDefinition definition, String curriculumGeneration,
            List<String> goalIds, int[][] prerequisites, int[] order, Set<String> targets,
            Set<String> assessments, Set<String> protectedGoals, List<CompiledRule> rules) {
        this(definition, curriculumGeneration, goalIds, prerequisites, order, targets, assessments,
                protectedGoals, rules, false);
    }

    CompiledCompletionProfile(CompletionProfileDefinition definition, String curriculumGeneration,
            List<String> goalIds, int[][] prerequisites, int[] order, Set<String> targets,
            Set<String> assessments, Set<String> protectedGoals, List<CompiledRule> rules, boolean automatic) {
        super(goalIds, prerequisites, order, targets, assessments, protectedGoals, rules);
        this.definition = definition;
        this.curriculumGeneration = curriculumGeneration;
        this.automatic = automatic;
    }

    public CompletionProfileDefinition definition() { return definition; }
    public CompletionProfileDefinition profile() { return definition; }
    public String curriculumGeneration() { return curriculumGeneration; }
    public boolean automatic() { return automatic; }
}
