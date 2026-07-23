package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeBindingGrant;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpenAiDeBindingGrantRepository extends JpaRepository<OpenAiDeBindingGrant, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from OpenAiDeBindingGrant g where g.tokenHash = :tokenHash")
    Optional<OpenAiDeBindingGrant> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from OpenAiDeBindingGrant g where g.activeBrowserSessionHash = :browserSessionHash")
    Optional<OpenAiDeBindingGrant> findByActiveBrowserSessionHashForUpdate(
            @Param("browserSessionHash") String browserSessionHash);

    long deleteByExpiresAtLessThanEqual(Instant cutoff);
}
