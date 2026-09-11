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
        if (!(previousValue < COMPLETION_THRESHOLD && nextValue >= COMPLETION_THRESHOLD)
                || !Double.isFinite(previousValue) || !Double.isFinite(nextValue)) {
            return;
        }
        LocalDate date = occurredAt.atZone(DAY_ZONE).toLocalDate();
        if (repository.existsByLearner_SkillpilotIdAndGoalIdAndCompletionDate(
                lockedLearner.getSkillpilotId(), goalId, date)) {
            return;
        }
        repository.save(new LearnerGoalCompletion(lockedLearner, goalId, date, occurredAt, nextValue));
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getCompletionsOnDate(String skillpilotId, LocalDate date) {
        return repository.findByLearner_SkillpilotIdAndCompletionDateOrderByOccurredAtAsc(skillpilotId, date);
    }

    @Transactional(readOnly = true)
    public List<LearnerGoalCompletion> getHistory(String skillpilotId) {
        return repository.findByLearner_SkillpilotIdOrderByOccurredAtDesc(skillpilotId);
    }
}
