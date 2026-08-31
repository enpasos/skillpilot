package com.skillpilot.backend.teachersupervision;

import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TeacherCourseRepository extends JpaRepository<TeacherCourse, UUID> {
    Optional<TeacherCourse> findByIdAndWorkspace_IdAndClosedAtIsNull(UUID id, UUID workspaceId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from TeacherCourse c "
            + "where c.id = :courseId and c.workspace.id = :workspaceId and c.closedAt is null")
    Optional<TeacherCourse> findOwnedForUpdate(
            @Param("courseId") UUID courseId,
            @Param("workspaceId") UUID workspaceId);
}
