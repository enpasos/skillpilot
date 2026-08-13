package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.Learner;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearnerRepository extends JpaRepository<Learner, String> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from Learner l where l.skillpilotId = :skillpilotId")
    Optional<Learner> findBySkillpilotIdForUpdate(@Param("skillpilotId") String skillpilotId);

    @Query(value = """
            select skillpilot_id
             from learner
             where last_activity_at <= :cutoff
             order by last_activity_at, skillpilot_id
             limit :batchSize
             for update skip locked
            """, nativeQuery = true)
    List<String> findInactiveSkillpilotIdsForUpdate(
            @Param("cutoff") Instant cutoff,
            @Param("batchSize") int batchSize);

    @Modifying
    @Query(value = "delete from learner_copy_sources where source_id = :skillpilotId", nativeQuery = true)
    int deleteInboundCopySourceReferences(@Param("skillpilotId") String skillpilotId);

    @Query("select l.skillpilotId from Learner l where l.skillpilotId in :skillpilotIds")
    List<String> findExistingSkillpilotIds(
            @Param("skillpilotIds") Collection<String> skillpilotIds);

    @Query("select l.createdAt from Learner l")
    List<Instant> findAllCreatedAt();

    @Query("select l.skillpilotId from Learner l where l.selectedCurriculum = :curriculumId")
    List<String> findSkillpilotIdsBySelectedCurriculum(@Param("curriculumId") String curriculumId);

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.value >= :threshold")
    List<Instant> findAllCreatedAtWithAchievements(@Param("threshold") double threshold);

    @Query("select distinct l.createdAt from Learner l join Mastery m on m.learner = l where m.updatedAt >= :since")
    List<Instant> findAllCreatedAtActiveSince(@Param("since") Instant since);
}
