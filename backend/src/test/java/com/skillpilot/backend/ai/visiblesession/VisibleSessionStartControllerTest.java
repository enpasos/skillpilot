package com.skillpilot.backend.ai.visiblesession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class VisibleSessionStartControllerTest {

    @Test
    void createVisibleChatStart_checksRouteAccessAndReturnsNoStoreResponse() {
        LearnerService learnerService = mock(LearnerService.class);
        ChatSessionService chatSessionService = mock(ChatSessionService.class);
        VisibleSessionStartController controller = new VisibleSessionStartController(
                learnerService,
                chatSessionService);
        String skillpilotId = "permanent-id-never-in-response";
        String token = "sps_visibleToken";
        Instant expiresAt = Instant.parse("2026-07-22T12:00:00Z");
        String prompt = "Starte meinen SkillPilot-Lerncoach.\n\nSkillPilot-Sitzung: " + token;
        ChatStartRequest request = new ChatStartRequest("de", "chatgpt-visible-v1", "math", null);
        when(chatSessionService.createVisibleSession(skillpilotId, request))
                .thenReturn(new ChatSessionService.IssuedVisibleSession(token, expiresAt, prompt));

        var response = controller.createVisibleChatStart(skillpilotId, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getCacheControl()).isEqualTo("no-store");
        assertThat(response.getBody()).isEqualTo(new VisibleChatStartResponse(token, expiresAt, prompt));
        assertThat(response.getBody().toString()).doesNotContain(skillpilotId);
        InOrder ordered = inOrder(learnerService, chatSessionService);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(skillpilotId);
        ordered.verify(chatSessionService).createVisibleSession(skillpilotId, request);
    }

    @Test
    void createVisibleChatStart_doesNotIssueSessionWhenRouteAccessIsDenied() {
        LearnerService learnerService = mock(LearnerService.class);
        ChatSessionService chatSessionService = mock(ChatSessionService.class);
        VisibleSessionStartController controller = new VisibleSessionStartController(
                learnerService,
                chatSessionService);
        String skillpilotId = "retired-learner";
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "retired"))
                .when(learnerService)
                .assertActiveLearnerRouteAccess(skillpilotId);

        assertThatThrownBy(() -> controller.createVisibleChatStart(skillpilotId, null))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verifyNoInteractions(chatSessionService);
    }
}
