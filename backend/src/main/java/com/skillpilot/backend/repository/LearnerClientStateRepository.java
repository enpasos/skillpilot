package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerClientStateId;
import java.util.List;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerClientStateRepository extends JpaRepository<LearnerClientState, LearnerClientStateId> {
    List<LearnerClientState> findByLearner_SkillpilotId(String skillpilotId);

    @Query("select state from LearnerClientState state where state.id.skillpilotId = :skillpilotId and state.id.nodeId in :nodeIds")
    List<LearnerClientState> findByLearnerAndNodeIds(@Param("skillpilotId") String skillpilotId,
                                                 @Param("nodeIds") Collection<String> nodeIds);
}
