package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Learner;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerRepository extends JpaRepository<Learner, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Learner l where l.skillpilotId = :skillpilotId")
    Optional<Learner> findBySkillpilotIdForUpdate(@Param("skillpilotId") String skillpilotId);

    @Query("select l.createdAt from Learner l")
    List<Instant> findAllCreatedAt();

    @Query("select l.skillpilotId from Learner l where l.selectedCurriculum = :curriculumId")
    List<String> findSkillpilotIdsBySelectedCurriculum(@Param("curriculumId") String curriculumId);

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.value >= :threshold")
    List<Instant> findAllCreatedAtWithAchievements(@Param("threshold") double threshold);

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.updatedAt >= :since")
    List<Instant> findAllCreatedAtActiveSince(@Param("since") Instant since);
}
