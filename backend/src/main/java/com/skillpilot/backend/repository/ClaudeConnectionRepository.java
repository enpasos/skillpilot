package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.ClaudeConnection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaudeConnectionRepository extends JpaRepository<ClaudeConnection, String> {

    @Query("select c.learner.skillpilotId from ClaudeConnection c where c.subject = :subject")
    Optional<String> findLearnerSkillpilotIdBySubject(@Param("subject") String subject);

    Optional<ClaudeConnection>
            findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                    String skillpilotId);

    List<ClaudeConnection> findAllByLearnerSkillpilotIdAndRevokedAtIsNull(String skillpilotId);

    boolean existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNull(String skillpilotId);
}
