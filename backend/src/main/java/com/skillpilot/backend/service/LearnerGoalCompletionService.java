package com.skillpilot.backend.service;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.repository.LearnerGoalCompletionRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LearnerGoalCompletionService {

    private static final double COMPLETION_THRESHOLD = 0.9;
    private static final ZoneId DAY_ZONE = ZoneId.of("Europe/Berlin");
    private final LearnerGoalCompletionRepository repository;

    public LearnerGoalCompletionService(LearnerGoalCompletionRepository repository) {
        this.repository = repository;
    }

    /**
     * Called only by actual mastery writes while their learner row is locked.
     * Joining that same transaction makes rollback remove both state and event.
     * Imports deliberately never call this method. Replays and same-day resets
     * retain the first observed event; the database uniqueness is a final guard.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void recordTransition(
            Learner lockedLearner, String goalId, double previousValue, double nextValue, Instant occurredAt) {
        recordTransition(lockedLearner, goalId, previousValue, nextValue, occurredAt, null, null);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void recordTransition(
            Learner lockedLearner, String goalId, double previousValue, double nextValue, Instant occurredAt,
            String practiceSource, String contentFingerprint) {
        if (!Double.isFinite(previousValue) || !Double.isFinite(nextValue)) return;
        boolean crossing = previousValue < COMPLETION_THRESHOLD && nextValue >= COMPLETION_THRESHOLD;
        boolean practice = nextValue >= COMPLETION_THRESHOLD && contentFingerprint != null
                && ("coach_learning".equals(practiceSource) || "verified_recall".equals(practiceSource));
        if (!crossing && !practice) return;
        LocalDate date = occurredAt.atZone(DAY_ZONE).toLocalDate();
        LearnerGoalCompletion completion = repository.findByLearner_SkillpilotIdAndGoalIdAndCompletionDate(
                lockedLearner.getSkillpilotId(), goalId, date).orElse(null);
        if (completion == null) {
            completion = new LearnerGoalCompletion(lockedLearner, goalId, date, occurredAt, nextValue);
            completion.setObservedTransition(crossing);
        } else if (crossing) {
            completion.markObservedTransition(occurredAt, nextValue);
        }
        if (practice) completion.bindPracticeEvidence(practiceSource, contentFingerprint, occurredAt);
        repository.save(completion);
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getCompletionsOnDate(String skillpilotId, LocalDate date) {
        return repository.findByLearner_SkillpilotIdAndCompletionDateOrderByOccurredAtAsc(skillpilotId, date)
                .stream().filter(LearnerGoalCompletion::isObservedTransition).toList();
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getCompletionsBetween(String skillpilotId, LocalDate startDate, LocalDate endDate) {
        return repository.findByLearner_SkillpilotIdAndCompletionDateBetweenOrderByOccurredAtAsc(skillpilotId, startDate, endDate)
                .stream().filter(LearnerGoalCompletion::isObservedTransition).toList();
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getPracticeHistory(String skillpilotId) {
        return repository.findByLearner_SkillpilotIdOrderByOccurredAtDesc(skillpilotId);
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getHistory(String skillpilotId) {
        return repository.findByLearner_SkillpilotIdOrderByOccurredAtDesc(skillpilotId)
                .stream().filter(LearnerGoalCompletion::isObservedTransition).toList();
    }
}
