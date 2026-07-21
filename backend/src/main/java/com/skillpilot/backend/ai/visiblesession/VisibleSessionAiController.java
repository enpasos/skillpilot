package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.service.ChatSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Isolated Phase-1 Action surface for the visible-session Custom GPT. Legacy
 * Custom GPT routes remain untouched.
 */
@RestController
@RequestMapping(
        value = "/api/ai/{lang}/sessions/{chatSessionToken}/visible",
        produces = MediaType.APPLICATION_JSON_VALUE)
public class VisibleSessionAiController {

    private final VisibleSessionService visibleSessionService;

    public VisibleSessionAiController(VisibleSessionService visibleSessionService) {
        this.visibleSessionService = visibleSessionService;
    }

    @ExceptionHandler(ChatSessionService.ChatSessionExpiredException.class)
    public ResponseEntity<Map<String, String>> handleChatSessionExpired() {
        return ResponseEntity.status(HttpStatus.GONE)
                .cacheControl(CacheControl.noStore())
                .body(Map.of(
                        "error", "chat_session_expired",
                        "message", "The SkillPilot chat session has expired.",
                        "recovery", "Ask the learner to return to skillpilot.com and start the Visible Session coach again. Do not ask for the SkillPilot ID inside ChatGPT."));
    }

    @GetMapping("/state")
    @Operation(
            operationId = "getVisibleState",
            summary = "Get compact visible-session coach state",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleCoachStateResponse> getState(
            @PathVariable String lang,
            @PathVariable String chatSessionToken) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(visibleSessionService.getState(chatSessionToken, lang));
    }

    @PostMapping("/choice")
    @Operation(
            operationId = "applyVisibleChoice",
            summary = "Apply a numbered visible-session choice",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleCoachStateResponse> choose(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @Valid @RequestBody VisibleChoiceRequest request) {
        VisibleSessionService.ActionOutcome outcome = visibleSessionService.choose(
                chatSessionToken,
                lang,
                request);
        return ResponseEntity.status(outcome.status())
                .cacheControl(CacheControl.noStore())
                .body(outcome.response());
    }

    @PostMapping("/active-goal")
    @Operation(
            operationId = "setVisibleActiveGoal",
            summary = "Set an explicitly cited public learning-goal ID",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleCoachStateResponse> setActiveGoal(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @Valid @RequestBody VisibleActiveGoalRequest request) {
        VisibleSessionService.ActionOutcome outcome = visibleSessionService.setActiveGoal(
                chatSessionToken,
                lang,
                request);
        return ResponseEntity.status(outcome.status())
                .cacheControl(CacheControl.noStore())
                .body(outcome.response());
    }

    @PostMapping("/mastery")
    @Operation(
            operationId = "setVisibleMastery",
            summary = "Save mastery for the explicitly cited active learning goal",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleCoachStateResponse> setMastery(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @Valid @RequestBody VisibleMasteryRequest request) {
        VisibleSessionService.ActionOutcome outcome = visibleSessionService.setMastery(
                chatSessionToken,
                lang,
                request);
        return ResponseEntity.status(outcome.status())
                .cacheControl(CacheControl.noStore())
                .body(outcome.response());
    }
}
