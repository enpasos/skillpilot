package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.domain.PlannedGoalId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlannedGoalRepository extends JpaRepository<PlannedGoal, PlannedGoalId> {
    List<PlannedGoal> findByLearner_SkillpilotId(String skillpilotId);
    void deleteByLearner_SkillpilotId(String skillpilotId);
}
