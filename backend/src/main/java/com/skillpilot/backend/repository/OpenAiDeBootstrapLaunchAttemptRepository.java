package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.OpenAiDeBootstrapAttemptStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapLaunchAttempt;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OpenAiDeBootstrapLaunchAttemptRepository
        extends JpaRepository<OpenAiDeBootstrapLaunchAttempt, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a from OpenAiDeBootstrapLaunchAttempt a
            where a.capabilityFingerprint = :fingerprint
            """)
    Optional<OpenAiDeBootstrapLaunchAttempt> findByCapabilityFingerprintForUpdate(
            @Param("fingerprint") String fingerprint);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select a from OpenAiDeBootstrapLaunchAttempt a
            where a.contractMajor = :contractMajor
              and a.oauthAuthorizationReference = :authorizationReference
              and a.clientRequestId = :clientRequestId
            """)
    Optional<OpenAiDeBootstrapLaunchAttempt> findByIdempotencyTupleForUpdate(
            @Param("contractMajor") int contractMajor,
            @Param("authorizationReference") String authorizationReference,
            @Param("clientRequestId") String clientRequestId);

    @Modifying
    @Query("""
            update OpenAiDeBootstrapLaunchAttempt a
               set a.responseKeyId = null,
                   a.responseNonce = null,
                   a.responseCiphertext = null
             where a.status = :succeeded
               and a.responseExpiresAt <= :now
               and a.responseCiphertext is not null
            """)
    int clearExpiredDeliveries(
            @Param("succeeded") OpenAiDeBootstrapAttemptStatus succeeded,
            @Param("now") Instant now);

    @Modifying
    @Query("delete from OpenAiDeBootstrapLaunchAttempt a where a.recordExpiresAt <= :now")
    int deleteExpiredTombstones(@Param("now") Instant now);
}
