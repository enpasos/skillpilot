package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerGoalCompletion;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearnerGoalCompletionRepository extends JpaRepository<LearnerGoalCompletion, UUID> {
    boolean existsByLearner_SkillpilotIdAndGoalIdAndCompletionDate(
            String skillpilotId, String goalId, LocalDate completionDate);

    List<LearnerGoalCompletion> findByLearner_SkillpilotIdAndCompletionDateOrderByOccurredAtAsc(
            String skillpilotId, LocalDate completionDate);

    List<LearnerGoalCompletion> findByLearner_SkillpilotIdOrderByOccurredAtDesc(String skillpilotId);
}
