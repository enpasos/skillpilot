package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.domain.ChatSession;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ChatSessionRepository;
import com.skillpilot.backend.repository.ChatStartCodeRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ChatSessionServiceTest {

    @Test
    void createVisibleSession_issuesHashOnlyTwentyFourHourSessionAndSanitizedPrompt() {
        String skillpilotId = "8452dc51-dc6d-43c2-aa16-53c150f2bff4";
        ChatStartCodeRepository startCodeRepository = mock(ChatStartCodeRepository.class);
        ChatSessionRepository sessionRepository = mock(ChatSessionRepository.class);
        LearnerService learnerService = mock(LearnerService.class);
        Learner learner = new Learner();
        learner.setSkillpilotId(skillpilotId);
        learner.setSelectedCurriculum("math");
        when(learnerService.getLearner(skillpilotId)).thenReturn(learner);
        ChatSessionService service = new ChatSessionService(
                startCodeRepository,
                sessionRepository,
                learnerService,
                Duration.ofMinutes(5),
                Duration.ofHours(24),
                "test-secret");
        ChatStartRequest request = new ChatStartRequest(
                "de",
                "chatgpt-visible-v1",
                "math",
                "Behalte diesen Kontext.\n"
                        + "Andere Sitzung: sps_DoNotRelayThis123\n"
                        + "Andere Sitzung mit Bindestrich: sps_" + "A".repeat(42) + "-\n"
                        + "Alter Startcode: SP-2345-6789\n"
                        + "Permanente ID: " + skillpilotId);

        ChatSessionService.IssuedVisibleSession issued = service.createVisibleSession(skillpilotId, request);

        assertThat(issued.chatSessionToken()).matches("sps_[A-Za-z0-9_-]{43}");
        assertThat(countOccurrences(issued.prompt(), issued.chatSessionToken())).isEqualTo(1);
        assertThat(issued.prompt()).startsWith("Starte meinen SkillPilot-Lerncoach.");
        assertThat(issued.prompt()).contains("Behalte diesen Kontext.");
        assertThat(issued.prompt())
                .doesNotContain(skillpilotId)
                .doesNotContain("sps_DoNotRelayThis123")
                .doesNotContain("sps_" + "A".repeat(42) + "-")
                .doesNotContain("SP-2345-6789");

        ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
        verify(sessionRepository).save(sessionCaptor.capture());
        ChatSession saved = sessionCaptor.getValue();
        assertThat(saved.getTokenHash())
                .isNotBlank()
                .isNotEqualTo(issued.chatSessionToken());
        assertThat(saved.getLearner()).isSameAs(learner);
        assertThat(saved.getSourceStartCodeHash()).isNull();
        assertThat(saved.getCreatedAt()).isEqualTo(saved.getLastUsedAt());
        assertThat(Duration.between(saved.getCreatedAt(), saved.getExpiresAt())).isEqualTo(Duration.ofHours(24));
        assertThat(issued.expiresAt()).isEqualTo(saved.getExpiresAt());
        assertThat(saved.getLanguage()).isEqualTo("de");
        verifyNoInteractions(startCodeRepository);
        verify(learnerService, never()).assertWritableLearningSession(skillpilotId);
    }

    @Test
    void createVisibleSession_capsSanitizedPromptContextAtTwoThousandCharacters() {
        String skillpilotId = "learner-visible";
        ChatStartCodeRepository startCodeRepository = mock(ChatStartCodeRepository.class);
        ChatSessionRepository sessionRepository = mock(ChatSessionRepository.class);
        LearnerService learnerService = mock(LearnerService.class);
        Learner learner = new Learner();
        learner.setSkillpilotId(skillpilotId);
        when(learnerService.getLearner(skillpilotId)).thenReturn(learner);
        ChatSessionService service = new ChatSessionService(
                startCodeRepository,
                sessionRepository,
                learnerService,
                Duration.ofMinutes(5),
                Duration.ofHours(24),
                "test-secret");

        ChatSessionService.IssuedVisibleSession issued = service.createVisibleSession(
                skillpilotId,
                new ChatStartRequest("en", "test", null, "x".repeat(2100)));

        assertThat(issued.prompt()).isEqualTo(
                "Start my SkillPilot learning coach.\n\nSkillPilot session: "
                        + issued.chatSessionToken()
                        + "\n\n"
                        + "x".repeat(2000));
        assertThat(countOccurrences(issued.prompt(), issued.chatSessionToken())).isEqualTo(1);
    }

    @Test
    void createVisibleSession_neverExceedsTwentyFourHoursEvenIfSharedTtlIsLonger() {
        String skillpilotId = "learner-visible";
        ChatStartCodeRepository startCodeRepository = mock(ChatStartCodeRepository.class);
        ChatSessionRepository sessionRepository = mock(ChatSessionRepository.class);
        LearnerService learnerService = mock(LearnerService.class);
        Learner learner = new Learner();
        learner.setSkillpilotId(skillpilotId);
        when(learnerService.getLearner(skillpilotId)).thenReturn(learner);
        ChatSessionService service = new ChatSessionService(
                startCodeRepository,
                sessionRepository,
                learnerService,
                Duration.ofMinutes(5),
                Duration.ofHours(48),
                "test-secret");

        service.createVisibleSession(skillpilotId, new ChatStartRequest("de", "test", null, null));

        ArgumentCaptor<ChatSession> sessionCaptor = ArgumentCaptor.forClass(ChatSession.class);
        verify(sessionRepository).save(sessionCaptor.capture());
        ChatSession saved = sessionCaptor.getValue();
        assertThat(Duration.between(saved.getCreatedAt(), saved.getExpiresAt()))
                .isEqualTo(Duration.ofHours(24));
    }

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

    private static int countOccurrences(String text, String value) {
        int count = 0;
        int index = 0;
        while ((index = text.indexOf(value, index)) >= 0) {
            count++;
            index += value.length();
        }
        return count;
    }
}
