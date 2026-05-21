package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.domain.ChatSession;
import com.skillpilot.backend.repository.ChatSessionRepository;
import com.skillpilot.backend.repository.ChatStartCodeRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ChatSessionServiceTest {

    @Test
    void resolveSkillpilotId_returnsGoneForExpiredSessionToken() {
        ChatStartCodeRepository startCodeRepository = mock(ChatStartCodeRepository.class);
        ChatSessionRepository sessionRepository = mock(ChatSessionRepository.class);
        LearnerService learnerService = mock(LearnerService.class);
        ChatSessionService service = new ChatSessionService(
                startCodeRepository,
                sessionRepository,
                learnerService,
                Duration.ofMinutes(5),
                Duration.ofHours(24),
                "test-secret");

        ChatSession expiredSession = new ChatSession();
        expiredSession.setExpiresAt(Instant.now().minusSeconds(1));
        when(sessionRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expiredSession));

        assertThatThrownBy(() -> service.resolveSkillpilotId("sps_expired"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    org.assertj.core.api.Assertions.assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.GONE);
                    org.assertj.core.api.Assertions.assertThat(exception.getReason())
                            .contains("Chat session has expired")
                            .contains("skillpilot.com");
                });
    }
}
