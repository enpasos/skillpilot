package com.skillpilot.backend.teachersupervision;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherWorkspaceRepository extends JpaRepository<TeacherWorkspace, UUID> {
    Optional<TeacherWorkspace> findByAccessTokenHashAndRevokedAtIsNull(String accessTokenHash);
}
