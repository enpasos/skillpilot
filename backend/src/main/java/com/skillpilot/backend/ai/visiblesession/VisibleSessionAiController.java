package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
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

    @PostMapping("/navigation")
    @Operation(
            operationId = "requestVisibleNavigation",
            summary = "Open a fresh visible navigation choice without mutating learner state",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleCoachStateResponse> requestNavigation(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @Valid @RequestBody VisibleNavigationRequest request) {
        VisibleSessionService.ActionOutcome outcome = visibleSessionService.requestNavigation(
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

    @PostMapping("/verified-recall/start")
    @Operation(
            operationId = "startVisibleVerifiedRecall",
            summary = "Start visible verified recall for the active memory goal",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleVerifiedRecallPromptResponse> startVerifiedRecall(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody(required = false) VerifiedRecallStartRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(visibleSessionService.startVerifiedRecall(chatSessionToken, lang, request));
    }

    @PostMapping("/verified-recall/answer")
    @Operation(
            operationId = "getVisibleVerifiedRecallAnswer",
            summary = "Reveal the expected answer after the learner answered",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleVerifiedRecallAnswerResponse> getVerifiedRecallAnswer(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody VerifiedRecallAnswerRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(visibleSessionService.getVerifiedRecallAnswer(chatSessionToken, lang, request));
    }

    @PostMapping("/verified-recall/result")
    @Operation(
            operationId = "recordVisibleVerifiedRecallResult",
            summary = "Record a visible verified-recall result",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleVerifiedRecallResultResponse> recordVerifiedRecallResult(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody VerifiedRecallResultRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(visibleSessionService.recordVerifiedRecallResult(chatSessionToken, lang, request));
    }

    @PostMapping("/exam/evaluation")
    @Operation(
            operationId = "getVisibleExamEvaluation",
            summary = "Load the evaluation material for the active exam after submission",
            extensions = @Extension(properties = @ExtensionProperty(
                    name = "x-openai-isConsequential",
                    value = "false",
                    parseValue = true)))
    public ResponseEntity<VisibleExamEvaluationResponse> getExamEvaluation(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @Valid @RequestBody VisibleExamEvaluationRequest request) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(visibleSessionService.getExamEvaluation(chatSessionToken, lang, request));
    }
}
