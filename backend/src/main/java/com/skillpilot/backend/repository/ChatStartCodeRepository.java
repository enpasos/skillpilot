package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.ChatStartCode;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatStartCodeRepository extends JpaRepository<ChatStartCode, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from ChatStartCode c where c.codeHash = :codeHash")
    Optional<ChatStartCode> findByCodeHashForUpdate(@Param("codeHash") String codeHash);
}
