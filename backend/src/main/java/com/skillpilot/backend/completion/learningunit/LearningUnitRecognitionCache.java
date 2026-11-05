package com.skillpilot.backend.completion.learningunit;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Bounded learner snapshot reuse; contains no persisted evidence or scope eligibility. */
public final class LearningUnitRecognitionCache {
    private static final int DEFAULT_MAXIMUM_LEARNERS = 128;
    private final int maximumLearners;
    private final LearningUnitEvaluator evaluator = new LearningUnitEvaluator();
    private final Map<String, Entry> entries = new LinkedHashMap<>(16, .75f, true);

    public LearningUnitRecognitionCache() { this(DEFAULT_MAXIMUM_LEARNERS); }
    public LearningUnitRecognitionCache(int maximumLearners) {
        if (maximumLearners <= 0) throw new IllegalArgumentException("Learning-unit cache budget must be positive");
        this.maximumLearners = maximumLearners;
    }

    public synchronized LearningUnitEvaluation evaluate(String learnerId, CompiledLearningUnits compiled,
                                                        Set<String> explicitMastery) {
        if (learnerId == null || learnerId.isBlank()) throw new IllegalArgumentException("Learner cache identity is required");
        Objects.requireNonNull(compiled, "compiled contracts");
        Set<String> snapshot = Set.copyOf(explicitMastery);
        Entry previous = entries.get(learnerId);
        if (previous != null && previous.digest().equals(compiled.digest()) && previous.mastery().equals(snapshot)) {
            return previous.state().evaluation();
        }
        boolean reusable = previous != null && previous.digest().equals(compiled.digest());
        var state = evaluator.evaluate(compiled, snapshot, reusable ? previous.mastery() : null,
                reusable ? previous.state().candidates() : null);
        while (!entries.containsKey(learnerId) && entries.size() >= maximumLearners) entries.remove(entries.keySet().iterator().next());
        entries.put(learnerId, new Entry(compiled.digest(), snapshot, state));
        return state.evaluation();
    }

    public synchronized int size() { return entries.size(); }

    private record Entry(String digest, Set<String> mastery, LearningUnitEvaluator.EvaluationState state) { }
}
