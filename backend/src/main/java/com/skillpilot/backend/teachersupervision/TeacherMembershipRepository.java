package com.skillpilot.backend.teachersupervision;

import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeacherMembershipRepository extends JpaRepository<TeacherMembership, UUID> {

    Optional<TeacherMembership> findByCourse_IdAndLearner_SkillpilotId(
            UUID courseId,
            String skillpilotId);

    List<TeacherMembership> findByCourse_IdOrderByCreatedAtAscMemberIdAsc(UUID courseId);

    List<TeacherMembership> findByLearner_SkillpilotIdAndStatusInOrderByCreatedAtAscMemberIdAsc(
            String skillpilotId,
            Collection<TeacherMembershipStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from TeacherMembership m "
            + "join fetch m.course c join fetch c.workspace "
            + "join fetch m.learner "
            + "where m.invitationTokenHash = :tokenHash")
    Optional<TeacherMembership> findInvitationForUpdate(@Param("tokenHash") String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from TeacherMembership m "
            + "join fetch m.course c join fetch c.workspace "
            + "join fetch m.learner "
            + "where m.memberId = :memberId")
    Optional<TeacherMembership> findByMemberIdForUpdate(@Param("memberId") UUID memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select m from TeacherMembership m where m.course.id = :courseId")
    List<TeacherMembership> findByCourseIdForUpdate(@Param("courseId") UUID courseId);
}
