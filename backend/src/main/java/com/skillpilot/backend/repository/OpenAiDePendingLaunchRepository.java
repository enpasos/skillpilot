package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDePendingLaunch;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface OpenAiDePendingLaunchRepository extends JpaRepository<OpenAiDePendingLaunch, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OpenAiDePendingLaunch> findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
            String connectionSubject,
            Instant now);

    void deleteAllByConnectionSubjectIn(Collection<String> connectionSubjects);

    long deleteByExpiresAtLessThanEqual(Instant cutoff);
}
