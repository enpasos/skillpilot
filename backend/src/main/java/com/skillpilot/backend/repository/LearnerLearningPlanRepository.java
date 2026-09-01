package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.LearnerLearningPlan;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerLearningPlanRepository extends JpaRepository<LearnerLearningPlan, UUID> {

    List<LearnerLearningPlan> findByLearner_SkillpilotIdOrderByLandscapeIdAsc(String skillpilotId);

    Optional<LearnerLearningPlan> findByLearner_SkillpilotIdAndLandscapeId(
            String skillpilotId,
            String landscapeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select plan from LearnerLearningPlan plan
            where plan.learner.skillpilotId = :skillpilotId
              and plan.landscapeId = :landscapeId
            """)
    Optional<LearnerLearningPlan> findForUpdate(
            @Param("skillpilotId") String skillpilotId,
            @Param("landscapeId") String landscapeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select plan from LearnerLearningPlan plan
            where plan.learner.skillpilotId = :skillpilotId
              and plan.id = :planId
            """)
    Optional<LearnerLearningPlan> findByIdForUpdate(
            @Param("skillpilotId") String skillpilotId,
            @Param("planId") UUID planId);

    void deleteByLearner_SkillpilotId(String skillpilotId);
}
