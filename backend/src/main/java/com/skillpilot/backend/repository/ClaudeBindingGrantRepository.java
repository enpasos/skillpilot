package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.ClaudeBindingGrant;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClaudeBindingGrantRepository extends JpaRepository<ClaudeBindingGrant, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from ClaudeBindingGrant g where g.tokenHash = :tokenHash")
    Optional<ClaudeBindingGrant> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);
}
