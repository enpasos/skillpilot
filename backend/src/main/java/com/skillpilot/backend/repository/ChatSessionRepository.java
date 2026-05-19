package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.ChatSession;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatSessionRepository extends JpaRepository<ChatSession, String> {
    Optional<ChatSession> findByTokenHash(String tokenHash);
}
