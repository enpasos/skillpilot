package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeBootstrapCapability;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpenAiDeBootstrapCapabilityRepository
        extends JpaRepository<OpenAiDeBootstrapCapability, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from OpenAiDeBootstrapCapability c where c.capabilityFingerprint = :fingerprint")
    Optional<OpenAiDeBootstrapCapability> findByFingerprintForUpdate(
            @Param("fingerprint") String fingerprint);

    @Modifying
    @Query("""
            delete from OpenAiDeBootstrapCapability c
            where c.expiresAt <= :now
              and not exists (
                select a.id from OpenAiDeBootstrapLaunchAttempt a
                where a.capabilityFingerprint = c.capabilityFingerprint
              )
            """)
    int deleteUnusedExpired(@Param("now") Instant now);
}
