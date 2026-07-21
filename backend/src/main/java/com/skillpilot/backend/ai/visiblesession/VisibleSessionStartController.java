package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cockpit-only entry point for the separate visible-session Custom GPT. */
@RestController
@RequestMapping(value = "/api/ui/learners", produces = MediaType.APPLICATION_JSON_VALUE)
public class VisibleSessionStartController {

    private final LearnerService learnerService;
    private final ChatSessionService chatSessionService;

    public VisibleSessionStartController(
            LearnerService learnerService,
            ChatSessionService chatSessionService) {
        this.learnerService = learnerService;
        this.chatSessionService = chatSessionService;
    }

    @PostMapping("/{skillpilotId}/visible-chat-start")
    @Operation(
            summary = "Create a directly visible 24-hour chat session",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleChatStartResponse> createVisibleChatStart(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) ChatStartRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        ChatSessionService.IssuedVisibleSession session = chatSessionService.createVisibleSession(
                skillpilotId,
                request);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(new VisibleChatStartResponse(
                        session.chatSessionToken(),
                        session.expiresAt(),
                        session.prompt()));
    }
}
