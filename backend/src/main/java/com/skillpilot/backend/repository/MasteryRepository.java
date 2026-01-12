package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MasteryRepository extends JpaRepository<Mastery, MasteryId> {
    interface LearnerAchievementDate {
        String getSkillpilotId();

        Instant getFirstAchievedAt();
    }

    List<Mastery> findByLearner_SkillpilotId(String skillpilotId);

    List<Mastery> findAllByValueGreaterThanEqual(double value);

    @Query("select m.learner.skillpilotId as skillpilotId, min(m.updatedAt) as firstAchievedAt " +
            "from Mastery m where m.value >= :threshold group by m.learner.skillpilotId")
    List<LearnerAchievementDate> findFirstAchievementDates(@Param("threshold") double threshold);

    @Query("select m.updatedAt from Mastery m where m.value >= :threshold")
    List<Instant> findAllAchievementDates(@Param("threshold") double threshold);

    @Modifying
    @Query("UPDATE Mastery m SET m.updatedAt = :timestamp WHERE m.id.skillpilotId = :skillpilotId AND m.id.goalKey = :goalKey")
    void updateTimestamp(@Param("skillpilotId") String skillpilotId, @Param("goalKey") String goalKey,
            @Param("timestamp") Instant timestamp);
}
