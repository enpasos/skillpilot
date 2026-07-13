package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.ClaudePendingLaunch;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Collection;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface ClaudePendingLaunchRepository extends JpaRepository<ClaudePendingLaunch, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ClaudePendingLaunch> findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
            String connectionSubject,
            Instant now);

    void deleteAllByConnectionSubjectIn(Collection<String> connectionSubjects);
}
