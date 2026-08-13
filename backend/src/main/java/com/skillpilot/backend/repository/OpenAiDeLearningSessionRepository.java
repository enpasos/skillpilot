package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpenAiDeLearningSessionRepository
        extends JpaRepository<OpenAiDeLearningSession, String> {

    long deleteByExpiresAtLessThanEqual(Instant cutoff);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select session
            from OpenAiDeLearningSession session
            where session.tokenHash = :tokenHash
            """)
    Optional<OpenAiDeLearningSession> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash);

    @Query("""
            select session.learner.skillpilotId
            from OpenAiDeLearningSession session
            where session.tokenHash = :tokenHash
            """)
    Optional<String> findLearnerSkillpilotIdByTokenHash(
            @Param("tokenHash") String tokenHash);
}
