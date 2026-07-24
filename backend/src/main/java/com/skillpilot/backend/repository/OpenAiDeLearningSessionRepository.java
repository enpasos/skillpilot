package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OpenAiDeLearningSessionRepository
        extends JpaRepository<OpenAiDeLearningSession, String> {

    long deleteByExpiresAtLessThanEqual(Instant cutoff);
}
