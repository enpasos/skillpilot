package com.skillpilot.backend.connectors.gemini.v1.session;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.LearnerService;
import java.time.Duration;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class GeminiV1LearningSessionServiceTest {
    private final GeminiV1LearningSessionRepository sessions = mock(GeminiV1LearningSessionRepository.class);
    private final LearnerRepository learners = mock(LearnerRepository.class);
    private final LearnerService learnerService = mock(LearnerService.class);
    private final GeminiV1SessionTokenCodec tokens = new GeminiV1SessionTokenCodec(GeminiV1TestProperties.validProperties());
    private final GeminiV1LearningSessionService service =
            new GeminiV1LearningSessionService(sessions, tokens, learners, learnerService);

    @Test void launchUsesCanonicalLearnerAndIndependentAbsolute24HourSessionWithSafePrompt() {
        Learner learner = new Learner();
        learner.setSkillpilotId("private-permanent-learner-id");
        learner.setCoachStateRevision(37);
        when(learners.findBySkillpilotIdForUpdate(learner.getSkillpilotId())).thenReturn(Optional.of(learner));

        var launch = service.createFirstPartyLaunch(learner.getSkillpilotId(), new GeminiV1CoachStartRequest("DE", "web-start"));
        var capture = ArgumentCaptor.forClass(GeminiV1LearningSession.class);
        verify(sessions).insert(capture.capture());
        var persisted = capture.getValue();
        var ordered = inOrder(learnerService, learners, sessions);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(learner.getSkillpilotId());
        ordered.verify(learners).findBySkillpilotIdForUpdate(learner.getSkillpilotId());
        ordered.verify(sessions).insert(persisted);

        assertEquals(Duration.ofHours(24), Duration.between(persisted.startedAt(), persisted.expiresAt()));
        assertEquals(launch.expiresAt(), persisted.expiresAt());
        assertEquals(tokens.hash(launch.learningSessionId()), persisted.tokenHash());
        assertEquals(37, persisted.stateVersion());
        assertEquals("de", persisted.communicationLocale());
        assertTrue(launch.prompt().startsWith("@SkillPilot "));
        assertTrue(launch.prompt().contains("get_skillpilot_coach_context"));
        assertEquals(1, launch.prompt().split(launch.learningSessionId(), -1).length - 1);
        assertFalse(launch.prompt().contains(learner.getSkillpilotId()));
        assertFalse(launch.toString().contains(learner.getSkillpilotId()));
        assertEquals("https://gemini.google.com/app?hl=en", launch.webUrl());
        assertFalse(launch.webUrl().contains(launch.learningSessionId()));
        assertEquals(persisted.startedAt(), learner.getLastActivityAt());
    }

    @Test void onlyFirstPartyStartWithSupportedLocaleMayCreateASession() {
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch("learner", new GeminiV1CoachStartRequest("en", "gemini")));
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch("learner", new GeminiV1CoachStartRequest("fr", "web-start")));
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch("learner", null));
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch(" ", new GeminiV1CoachStartRequest("en", "web-start")));
        verifyNoInteractions(sessions, learners, learnerService);
    }

    @Test void retiredOrUnauthorizedLearnerCannotStartGeminiSession() {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Retired learner"))
                .when(learnerService).assertActiveLearnerRouteAccess("learner");
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch("learner", new GeminiV1CoachStartRequest("en", "web-start")));
        verifyNoInteractions(sessions, learners);
    }
}
