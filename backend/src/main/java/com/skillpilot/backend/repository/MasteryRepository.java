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
    List<Mastery> findByLearner_SkillpilotId(String skillpilotId);

    List<Mastery> findAllByValueGreaterThanEqual(double value);

    @Modifying
    @Query("UPDATE Mastery m SET m.updatedAt = :timestamp WHERE m.id.skillpilotId = :skillpilotId AND m.id.goalKey = :goalKey")
    void updateTimestamp(@Param("skillpilotId") String skillpilotId, @Param("goalKey") String goalKey,
            @Param("timestamp") Instant timestamp);
}
