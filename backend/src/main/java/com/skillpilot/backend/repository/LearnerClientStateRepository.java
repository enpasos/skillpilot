package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LearnerClientStateRepository extends JpaRepository<LearnerClientState, LearnerClientStateId> {
    List<LearnerClientState> findByLearner_SkillpilotId(String skillpilotId);
}
