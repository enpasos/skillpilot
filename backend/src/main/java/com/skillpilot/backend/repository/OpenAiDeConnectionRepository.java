package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeConnection;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpenAiDeConnectionRepository extends JpaRepository<OpenAiDeConnection, String> {

    @Query("select c.learner.skillpilotId from OpenAiDeConnection c where c.subject = :subject")
    Optional<String> findLearnerSkillpilotIdBySubject(@Param("subject") String subject);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OpenAiDeConnection c where c.subject = :subject")
    Optional<OpenAiDeConnection> findBySubjectForUpdate(@Param("subject") String subject);

    Optional<OpenAiDeConnection>
            findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                    String skillpilotId, Instant now);

    List<OpenAiDeConnection> findAllByLearnerSkillpilotIdAndRevokedAtIsNull(String skillpilotId);

    List<OpenAiDeConnection> findAllByLastAuthorizedAtIsNullAndRevokedAtIsNullAndCreatedAtLessThanEqual(
            Instant cutoff);

    List<OpenAiDeConnection> findAllByLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtIsNull();

    List<OpenAiDeConnection>
            findAllByLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtLessThanEqual(Instant cutoff);

    boolean existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfter(
            String skillpilotId, Instant now);

    long deleteByRevokedAtLessThanEqual(Instant cutoff);
}
