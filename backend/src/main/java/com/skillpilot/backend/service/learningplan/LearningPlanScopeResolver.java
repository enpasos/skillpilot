package com.skillpilot.backend.service.learningplan;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.function.Function;
import org.springframework.web.server.ResponseStatusException;

/** Selected learning work, independently of the dated quota schedule. */
public final class LearningPlanScopeResolver {
    private LearningPlanScopeResolver() { }

    public record Scope(String kind, String sourceBlockId, String title,
            List<String> goalIds, LocalDate examDate) {
        public Scope {
            goalIds = List.copyOf(new LinkedHashSet<>(goalIds));
        }
    }

    public static Scope resolve(List<LearnerLearningPlanApi.Block> blocks, LocalDate asOf,
            Function<List<String>, List<String>> expandRoots, List<String> boundGoalIds) {
        List<LearnerLearningPlanApi.Block> candidates = blocks.stream()
                .filter(block -> block.isActive() && "milestone".equals(block.kind()))
                .filter(block -> !block.focusGoalIds().isEmpty())
                .sorted(Comparator.comparing(LearnerLearningPlanApi.Block::date)
                        .thenComparing(LearnerLearningPlanApi.Block::id))
                .toList();
        var expanded = new LinkedHashMap<LearnerLearningPlanApi.Block, List<String>>();
        for (var exam : candidates) {
            List<String> atoms = expandExam(exam, expandRoots);
            if (!atoms.isEmpty()) expanded.put(exam, atoms);
        }
        List<LearnerLearningPlanApi.Block> exams = List.copyOf(expanded.keySet());
        // A saved exact focus binds the ongoing exam, including after its date.
        // Only an explicit start resolves a new upcoming exam with an empty binding.
        Set<String> bound = Set.copyOf(boundGoalIds);
        if (!bound.isEmpty()) {
            List<LearnerLearningPlanApi.Block> matches = new java.util.ArrayList<>();
            for (var exam : exams) {
                List<String> atoms = expanded.get(exam);
                if (Set.copyOf(atoms).equals(bound)) matches.add(exam);
            }
            if (!matches.isEmpty()) {
                var matching = nextMilestone(matches, asOf);
                if (matching == null) matching = matches.getLast();
                return examScope(matching, expanded.get(matching));
            }
        }
        var next = nextMilestone(exams, asOf);
        if (next == null && !exams.isEmpty()) next = exams.getLast();
        if (next != null && !next.focusGoalIds().isEmpty()) {
            List<String> atoms = expanded.get(next);
            if (!atoms.isEmpty()) return examScope(next, atoms);
        }
        LinkedHashSet<String> atoms = new LinkedHashSet<>();
        blocks.stream().filter(block -> block.isActive() && "learning".equals(block.kind()))
                .filter(block -> block.atomicGoalIds() != null)
                .forEach(block -> atoms.addAll(block.atomicGoalIds()));
        return new Scope("plan", null, "Lernplan", List.copyOf(atoms), null);
    }

    public static LearnerLearningPlanApi.Block nextMilestone(
            List<LearnerLearningPlanApi.Block> blocks, LocalDate asOf) {
        return blocks.stream()
                .filter(block -> block.isActive() && "milestone".equals(block.kind()))
                .filter(block -> !block.date().isBefore(asOf))
                .min(Comparator.comparing(LearnerLearningPlanApi.Block::date)
                        .thenComparing(LearnerLearningPlanApi.Block::id))
                .orElse(null);
    }

    private static Scope examScope(LearnerLearningPlanApi.Block exam, List<String> atoms) {
        return new Scope("exam", exam.id(), exam.title(), atoms, exam.date());
    }

    private static List<String> expandExam(LearnerLearningPlanApi.Block exam,
            Function<List<String>, List<String>> expandRoots) {
        try {
            return expandRoots.apply(exam.focusGoalIds());
        } catch (ResponseStatusException exception) {
            // Legacy single goalId was unvalidated descriptive metadata. Explicit
            // lists are authoritative and must still fail closed when invalid.
            if (exam.goalIds() == null && exception.getStatusCode().is4xxClientError()) return List.of();
            throw exception;
        }
    }
}
