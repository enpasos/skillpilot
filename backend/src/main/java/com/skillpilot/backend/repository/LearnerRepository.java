package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Learner;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerRepository extends JpaRepository<Learner, String> {
    @Query("select l.createdAt from Learner l")
    List<Instant> findAllCreatedAt();

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.value >= :threshold")
    List<Instant> findAllCreatedAtWithAchievements(@Param("threshold") double threshold);

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.updatedAt >= :since")
    List<Instant> findAllCreatedAtActiveSince(@Param("since") Instant since);
}
