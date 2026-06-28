package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.CreateLearnerResponse;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.RedeemStartCodeRequest;
import com.skillpilot.backend.api.RedeemStartCodeResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping(value = "/api/ai/{lang}", produces = MediaType.APPLICATION_JSON_VALUE)
public class LearnerAiController {

    private final LearnerService learnerService;
    private final ChatSessionService chatSessionService;
    private static final String IMAGE_PATH_PREFIX = "IMAGE_PATH: ";

    @Value("${skillpilot.public-base-url:https://skillpilot.com}")
    private String publicBaseUrl;

    public LearnerAiController(LearnerService learnerService, ChatSessionService chatSessionService) {
        this.learnerService = learnerService;
        this.chatSessionService = chatSessionService;
    }

    @ExceptionHandler(ChatSessionService.ChatSessionExpiredException.class)
    public org.springframework.http.ResponseEntity<Map<String, String>> handleChatSessionExpired() {
        return org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.GONE)
                .body(Map.of(
                        "error", "chat_session_expired",
                        "message", "The SkillPilot chat session has expired.",
                        "recovery", "Ask the learner to return to skillpilot.com, load their saved access or enter their SkillPilot ID there, and start the learning coach again to get a new start code for ChatGPT. Do not ask for the SkillPilot ID inside ChatGPT."));
    }

    @PostMapping("/learners")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public CreateLearnerResponse createLearner(@RequestBody(required = false) CreateLearnerRequest request) {
        Learner learner = learnerService.createLearner(request);
        UnifiedLearnerStateResponse state = withAbsoluteExamAssetUrls(
                learnerService.getLearnerState(learner.getSkillpilotId()));

        // Optimization: If a curriculum is already selected (e.g. via topic),
        // don't return the huge list of available landscapes to save tokens.
        java.util.List<com.skillpilot.backend.landscape.LandscapeSummary> available = (learner
                .getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isEmpty())
                        ? java.util.Collections.emptyList()
                        : learnerService.getAvailableBaseCurricula(false);

        return new CreateLearnerResponse(
                state,
                available);
    }

    @GetMapping("/learners/{skillpilotId}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getLearnerState(@PathVariable String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/learners/{skillpilotId}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setScope(@PathVariable String skillpilotId, @RequestBody ScopeRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setScope(skillpilotId, request.goalIds());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/learners/{skillpilotId}/active-goal")
    @Operation(description = "Set active goal.", extensions = @Extension(properties = @ExtensionProperty(
            name = "x-openai-isConsequential",
            value = "false",
            parseValue = true)))
    public UnifiedLearnerStateResponse setActiveGoal(@PathVariable String skillpilotId,
            @Valid @RequestBody ActiveGoalRequest request) {
        return setActiveGoalForLearner(skillpilotId, request, false);
    }

    private UnifiedLearnerStateResponse setActiveGoalForLearner(
            String skillpilotId,
            ActiveGoalRequest request,
            boolean hideSkillpilotId) {
        learnerService.assertWritableLearningSession(skillpilotId);
        UnifiedLearnerStateResponse state = learnerService.getLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        boolean redirect = Boolean.TRUE.equals(request.redirect());
        if (!"setActiveGoal".equals(requiredAction)) {
            if (allowsActiveGoalRedirect(requiredAction) && redirect) {
                // Allow explicit user redirect while an active goal is locked.
            } else if (requiredAction != null) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "Required action is " + requiredAction + ". Follow stateMachine.requiredAction.");
            }
        }
        learnerService.setActiveGoal(skillpilotId, request.goalId());
        return prepareLearnerState(skillpilotId, hideSkillpilotId);
    }

    @PostMapping("/learners/{skillpilotId}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public org.springframework.http.ResponseEntity<?> setMastery(
            @PathVariable String skillpilotId,
            @RequestBody(required = false) MasteryUpdateRequest request) {
        return setMasteryForLearner(skillpilotId, request, false);
    }

    @PostMapping("/chat-start/redeem")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public RedeemStartCodeResponse redeemStartCode(
            @PathVariable String lang,
            @RequestBody RedeemStartCodeRequest request) {
        ChatSessionService.RedeemedSession session = chatSessionService.redeemStartCode(
                request == null ? null : request.startCode(),
                lang);
        return new RedeemStartCodeResponse(
                session.chatSessionToken(),
                session.expiresAt(),
                prepareLearnerState(session.skillpilotId(), true));
    }

    @GetMapping("/sessions/{chatSessionToken}/state")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse getSessionState(@PathVariable String chatSessionToken) {
        return prepareLearnerState(resolveSessionLearnerId(chatSessionToken), true);
    }

    @PostMapping("/sessions/{chatSessionToken}/scope")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setSessionScope(
            @PathVariable String chatSessionToken,
            @RequestBody ScopeRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setScope(skillpilotId, request.goalIds());
        return prepareLearnerState(skillpilotId, true);
    }

    @PostMapping("/sessions/{chatSessionToken}/active-goal")
    @Operation(description = "Set active goal.", extensions = @Extension(properties = @ExtensionProperty(
            name = "x-openai-isConsequential",
            value = "false",
            parseValue = true)))
    public UnifiedLearnerStateResponse setSessionActiveGoal(
            @PathVariable String chatSessionToken,
            @Valid @RequestBody ActiveGoalRequest request) {
        return setActiveGoalForLearner(resolveSessionLearnerId(chatSessionToken), request, true);
    }

    @PostMapping("/sessions/{chatSessionToken}/mastery")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public org.springframework.http.ResponseEntity<?> setSessionMastery(
            @PathVariable String chatSessionToken,
            @RequestBody(required = false) MasteryUpdateRequest request) {
        return setMasteryForLearner(resolveSessionLearnerId(chatSessionToken), request, true);
    }

    @PostMapping("/sessions/{chatSessionToken}/verified-recall/start")
    @Operation(
            summary = "Start card check",
            description = "Start card check.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallPromptResponse startSessionVerifiedRecall(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody(required = false) VerifiedRecallStartRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        return withoutSkillpilotId(learnerService.startVerifiedRecall(skillpilotId, lang, request));
    }

    @PostMapping("/sessions/{chatSessionToken}/verified-recall/answer")
    @Operation(
            summary = "Get card answer",
            description = "Get card answer.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallAnswerResponse getSessionVerifiedRecallAnswer(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody VerifiedRecallAnswerRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        return learnerService.getVerifiedRecallAnswer(skillpilotId, lang, request);
    }

    @PostMapping("/sessions/{chatSessionToken}/verified-recall/result")
    @Operation(
            summary = "Save card result",
            description = "Save card result.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallResultResponse recordSessionVerifiedRecallResult(
            @PathVariable String lang,
            @PathVariable String chatSessionToken,
            @RequestBody VerifiedRecallResultRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        learnerService.assertWritableLearningSession(skillpilotId);
        return withoutSkillpilotId(learnerService.recordVerifiedRecallResult(skillpilotId, lang, request));
    }

    @PostMapping("/sessions/{chatSessionToken}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setSessionCurriculum(
            @PathVariable String chatSessionToken,
            @RequestBody UpdateCurriculumRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
        return prepareLearnerState(skillpilotId, true);
    }

    @PostMapping("/sessions/{chatSessionToken}/personalization")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setSessionPersonalization(
            @PathVariable String chatSessionToken,
            @RequestBody com.skillpilot.backend.api.PersonalizationRequest request) {
        String skillpilotId = resolveSessionLearnerId(chatSessionToken);
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setPersonalCurriculum(skillpilotId, request.config(), request.goalIds(), request.filters());
        return prepareLearnerState(skillpilotId, true);
    }

    private org.springframework.http.ResponseEntity<?> setMasteryForLearner(
            String skillpilotId,
            MasteryUpdateRequest request,
            boolean hideSkillpilotId) {
        learnerService.assertWritableLearningSession(skillpilotId);

        org.springframework.http.ResponseEntity<?> validationError = validateAiMasteryRequest(request);
        if (validationError != null) {
            return validationError;
        }
        MasteryUpdateRequest effectiveRequest = normalizeAiMasteryRequest(request);

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        if (requiredAction != null && !allowsMasteryWrite(requiredAction)) {
            // Recovery path:
            // If the conversation already selected a goal but the backend active goal was
            // not persisted, allow /mastery to auto-lock that goal first.
            if ("setActiveGoal".equals(requiredAction)) {
                String selectedGoalId = extractGoalIdFromMasteryRequest(effectiveRequest);
                if (selectedGoalId != null && !selectedGoalId.isBlank()) {
                    try {
                        learnerService.setActiveGoal(skillpilotId, selectedGoalId);
                        state = learnerService.getLearnerState(skillpilotId);
                        requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
                    } catch (org.springframework.web.server.ResponseStatusException e) {
                        if (org.springframework.http.HttpStatus.CONFLICT.equals(e.getStatusCode())
                                || org.springframework.http.HttpStatus.BAD_REQUEST.equals(e.getStatusCode())) {
                            UnifiedLearnerStateResponse conflictState = learnerService.getLearnerState(skillpilotId);
                            return org.springframework.http.ResponseEntity
                                    .status(org.springframework.http.HttpStatus.CONFLICT)
                                    .body(prepareLearnerState(conflictState, hideSkillpilotId));
                        }
                        throw e;
                    }
                }
            }
            if (requiredAction != null && !allowsMasteryWrite(requiredAction)) {
                return org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.CONFLICT)
                        .body(prepareLearnerState(state, hideSkillpilotId));
            }
        }

        try {
            MasteryUpdateResponse response = learnerService.setMastery(skillpilotId, effectiveRequest);
            return org.springframework.http.ResponseEntity.ok(withAbsoluteExamAssetUrls(response));
        } catch (org.springframework.web.server.ResponseStatusException e) {
            if (org.springframework.http.HttpStatus.CONFLICT.equals(e.getStatusCode())) {
                UnifiedLearnerStateResponse conflictState = learnerService.getLearnerState(skillpilotId);
                return org.springframework.http.ResponseEntity
                        .status(org.springframework.http.HttpStatus.CONFLICT)
                        .body(prepareLearnerState(conflictState, hideSkillpilotId));
            }
            throw e;
        }
    }

    private org.springframework.http.ResponseEntity<?> validateAiMasteryRequest(MasteryUpdateRequest request) {
        if (request == null) {
            return badMasteryRequest("setMastery requires a goalId.");
        }
        boolean hasMasteryMap = request.mastery() != null && !request.mastery().isEmpty();
        if (!hasMasteryMap) {
            if (request.goalId() == null || request.goalId().isBlank()) {
                return badMasteryRequest("setMastery requires a goalId.");
            }
            return null;
        }
        if (request.mastery().size() != 1) {
            return badMasteryRequest("setMastery accepts exactly one mastery update at a time.");
        }
        Map.Entry<String, Double> entry = request.mastery().entrySet().iterator().next();
        if (entry.getKey() == null || entry.getKey().isBlank()) {
            return badMasteryRequest("setMastery requires a non-empty goal ID in mastery.");
        }
        Double value = entry.getValue();
        if (!isValidMasteryValue(value)) {
            return badMasteryRequest("setMastery value must be between 0.0 and 1.0.");
        }
        return null;
    }

    private MasteryUpdateRequest normalizeAiMasteryRequest(MasteryUpdateRequest request) {
        if (request.mastery() != null && !request.mastery().isEmpty()) {
            return request;
        }
        return new MasteryUpdateRequest(Map.of(request.goalId(), 1.0), request.goalId());
    }

    private boolean isValidMasteryValue(Double value) {
        return value != null && !value.isNaN() && !value.isInfinite() && value >= 0.0 && value <= 1.0;
    }

    private org.springframework.http.ResponseEntity<?> badMasteryRequest(String message) {
        return org.springframework.http.ResponseEntity
                .status(org.springframework.http.HttpStatus.BAD_REQUEST)
                .body(Map.of("error", message));
    }

    private boolean allowsMasteryWrite(String requiredAction) {
        return "setMastery".equals(requiredAction) || "teachActiveGoal".equals(requiredAction);
    }

    private boolean allowsActiveGoalRedirect(String requiredAction) {
        return allowsMasteryWrite(requiredAction) || "chooseMemoryMode".equals(requiredAction);
    }

    private String extractGoalIdFromMasteryRequest(MasteryUpdateRequest request) {
        if (request == null) {
            return null;
        }
        if (request.goalId() != null && !request.goalId().isBlank()) {
            return request.goalId().trim();
        }
        if (request.mastery() != null && request.mastery().size() == 1) {
            String key = request.mastery().keySet().iterator().next();
            if (key != null && !key.isBlank()) {
                return key.trim();
            }
        }
        return null;
    }

    @PostMapping("/learners/{skillpilotId}/verified-recall/start")
    @Operation(
            summary = "Start card check",
            description = "Start card check.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallPromptResponse startVerifiedRecall(
            @PathVariable String lang,
            @PathVariable String skillpilotId,
            @RequestBody(required = false) VerifiedRecallStartRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.startVerifiedRecall(skillpilotId, lang, request);
    }

    @PostMapping("/learners/{skillpilotId}/verified-recall/answer")
    @Operation(
            summary = "Get card answer",
            description = "Get card answer.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            @PathVariable String lang,
            @PathVariable String skillpilotId,
            @RequestBody VerifiedRecallAnswerRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getVerifiedRecallAnswer(skillpilotId, lang, request);
    }

    @PostMapping("/learners/{skillpilotId}/verified-recall/result")
    @Operation(
            summary = "Save card result",
            description = "Save card result.",
            extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public VerifiedRecallResultResponse recordVerifiedRecallResult(
            @PathVariable String lang,
            @PathVariable String skillpilotId,
            @RequestBody VerifiedRecallResultRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.recordVerifiedRecallResult(skillpilotId, lang, request);
    }

    @PostMapping("/learners/{skillpilotId}/curriculum")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public UnifiedLearnerStateResponse setCurriculum(@PathVariable String skillpilotId,
            @RequestBody UpdateCurriculumRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setCurriculum(skillpilotId, request.getCurriculumId());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    @PostMapping("/learners/{skillpilotId}/personalization")
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))

    public UnifiedLearnerStateResponse setPersonalization(@PathVariable String skillpilotId,
            @RequestBody com.skillpilot.backend.api.PersonalizationRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        learnerService.setPersonalCurriculum(skillpilotId, request.config(), request.goalIds(), request.filters());
        return withAbsoluteExamAssetUrls(learnerService.getLearnerState(skillpilotId));
    }

    private String resolveSessionLearnerId(String chatSessionToken) {
        String skillpilotId = chatSessionService.resolveSkillpilotId(chatSessionToken);
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return skillpilotId;
    }

    private UnifiedLearnerStateResponse prepareLearnerState(String skillpilotId, boolean hideSkillpilotId) {
        return prepareLearnerState(learnerService.getLearnerState(skillpilotId), hideSkillpilotId);
    }

    private UnifiedLearnerStateResponse prepareLearnerState(
            UnifiedLearnerStateResponse state,
            boolean hideSkillpilotId) {
        UnifiedLearnerStateResponse prepared = withAbsoluteExamAssetUrls(state);
        return hideSkillpilotId ? withoutSkillpilotId(prepared) : prepared;
    }

    private UnifiedLearnerStateResponse withoutSkillpilotId(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        return new UnifiedLearnerStateResponse(
                null,
                state.curriculum(),
                state.frontier(),
                state.goals(),
                state.nextAllowedActions(),
                state.activeFilters(),
                state.copySources(),
                state.learningState(),
                state.activeGoal(),
                state.stateMachine());
    }

    private VerifiedRecallPromptResponse withoutSkillpilotId(VerifiedRecallPromptResponse response) {
        if (response == null) {
            return null;
        }
        return new VerifiedRecallPromptResponse(
                response.status(),
                response.instruction(),
                null,
                response.goalId(),
                response.goalTitle(),
                response.totalCards(),
                response.verifiedCards(),
                response.pendingCards(),
                response.eligibleCards(),
                response.blockedCards(),
                response.nextEligibleAt(),
                response.batchSize(),
                response.cards(),
                response.cardId(),
                response.prompt(),
                response.category());
    }

    private VerifiedRecallResultResponse withoutSkillpilotId(VerifiedRecallResultResponse response) {
        if (response == null) {
            return null;
        }
        return new VerifiedRecallResultResponse(
                response.savedCardId(),
                response.passed(),
                response.verifiedCards(),
                response.pendingCards(),
                withoutSkillpilotId(response.next()));
    }

    private UnifiedLearnerStateResponse withAbsoluteExamAssetUrls(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        String baseUrl = resolveBaseUrl();
        if (baseUrl.isBlank()) {
            return state;
        }
        String assetBase = baseUrl + "/ai-assets";

        com.skillpilot.backend.api.FrontierGoal activeGoal = rewriteExamData(state.activeGoal(), assetBase);
        com.skillpilot.backend.api.StateMachineInfo sm = state.stateMachine();
        List<com.skillpilot.backend.api.FrontierGoal> frontier = prepareSelectableGoalsForAi(filterFrontierForAi(
                rewriteExamData(state.frontier(), assetBase),
                sm));
        com.skillpilot.backend.api.LearnerGoals goals = rewriteLearnerGoals(state.goals(), assetBase);
        com.skillpilot.backend.api.StateMachineInfo smUpdated = sm == null ? null
                : new com.skillpilot.backend.api.StateMachineInfo(
                        sm.state(),
                        sm.requiredAction(),
                        prepareSelectableGoalsForAi(rewriteExamData(sm.goalOptions(), assetBase)),
                        sm.curriculumOptions(),
                        rewriteExamData(sm.activeGoal(), assetBase),
                        sm.modeOptions());

        return new UnifiedLearnerStateResponse(
                state.skillpilotId(),
                state.curriculum(),
                frontier,
                goals,
                state.nextAllowedActions(),
                state.activeFilters(),
                state.copySources(),
                state.learningState(),
                activeGoal,
                smUpdated);
    }

    private MasteryUpdateResponse withAbsoluteExamAssetUrls(MasteryUpdateResponse response) {
        if (response == null) {
            return null;
        }
        String baseUrl = resolveBaseUrl();
        if (baseUrl.isBlank()) {
            return response;
        }
        String assetBase = baseUrl + "/ai-assets";
        com.skillpilot.backend.api.StateMachineInfo sm = response.stateMachine();
        List<com.skillpilot.backend.api.FrontierGoal> frontier = prepareSelectableGoalsForAi(filterFrontierForAi(
                rewriteExamData(response.frontier(), assetBase),
                sm));
        com.skillpilot.backend.api.FrontierGoal activeGoal = rewriteExamData(response.activeGoal(), assetBase);
        com.skillpilot.backend.api.StateMachineInfo smUpdated = sm == null ? null
                : new com.skillpilot.backend.api.StateMachineInfo(
                        sm.state(),
                        sm.requiredAction(),
                        prepareSelectableGoalsForAi(rewriteExamData(sm.goalOptions(), assetBase)),
                        sm.curriculumOptions(),
                        rewriteExamData(sm.activeGoal(), assetBase),
                        sm.modeOptions());

        return new MasteryUpdateResponse(
                response.saved(),
                response.savedGoalId(),
                response.savedMastery(),
                frontier,
                response.nextAllowedActions(),
                response.learningState(),
                activeGoal,
                smUpdated,
                response.goals());
    }

    private com.skillpilot.backend.api.LearnerGoals rewriteLearnerGoals(
            com.skillpilot.backend.api.LearnerGoals goals,
            String assetBase) {
        if (goals == null) {
            return null;
        }
        return new com.skillpilot.backend.api.LearnerGoals(
                stripExamDataFromSelectableGoals(rewriteExamData(goals.planned(), assetBase)),
                goals.mastered_count(),
                goals.total_count(),
                goals.personalized(),
                goals.scope(),
                goals.scope_completed());
    }

    private List<com.skillpilot.backend.api.FrontierGoal> rewriteExamData(
            List<com.skillpilot.backend.api.FrontierGoal> goals,
            String assetBase) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .map(goal -> rewriteExamData(goal, assetBase))
                .toList();
    }

    private List<com.skillpilot.backend.api.FrontierGoal> stripExamDataFromSelectableGoals(
            List<com.skillpilot.backend.api.FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .map(this::stripExamDataFromSelectableGoal)
                .toList();
    }

    private List<com.skillpilot.backend.api.FrontierGoal> prepareSelectableGoalsForAi(
            List<com.skillpilot.backend.api.FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .filter(this::isSelectableGoalReadyForAi)
                .map(this::stripExamDataFromSelectableGoal)
                .toList();
    }

    private boolean isSelectableGoalReadyForAi(com.skillpilot.backend.api.FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if (goal.examData() == null) {
            return true;
        }
        return isExamDataReadyForHardCheck(goal.examData());
    }

    private com.skillpilot.backend.api.FrontierGoal stripExamDataFromSelectableGoal(
            com.skillpilot.backend.api.FrontierGoal goal) {
        if (goal == null || goal.examData() == null) {
            return goal;
        }
        return new com.skillpilot.backend.api.FrontierGoal(
                goal.id(),
                normalizeMathDelimitersForChat(goal.title()),
                normalizeMathDelimitersForChat(goal.description()),
                goal.type(),
                goal.nodeKind(),
                goal.reason(),
                goal.tags(),
                goal.resourceLinks(),
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                null);
    }

    private List<com.skillpilot.backend.api.FrontierGoal> filterFrontierForAi(
            List<com.skillpilot.backend.api.FrontierGoal> frontier,
            com.skillpilot.backend.api.StateMachineInfo sm) {
        if (frontier == null || frontier.isEmpty() || sm == null) {
            return frontier;
        }
        if (!"setActiveGoal".equals(sm.requiredAction())) {
            return frontier;
        }
        // When the next action is to set an active goal, keep atomic goals only.
        List<com.skillpilot.backend.api.FrontierGoal> atomic = frontier.stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .toList();
        return atomic.isEmpty() ? frontier : atomic;
    }

    private com.skillpilot.backend.api.FrontierGoal rewriteExamData(
            com.skillpilot.backend.api.FrontierGoal goal,
            String assetBase) {
        if (goal == null) {
            return null;
        }
        List<GoalSourceLink> resourceLinks = rewriteResourceLinks(goal.resourceLinks(), assetBase);
        if (goal.examData() == null) {
            return new com.skillpilot.backend.api.FrontierGoal(
                    goal.id(),
                    normalizeMathDelimitersForChat(goal.title()),
                    normalizeMathDelimitersForChat(goal.description()),
                    goal.type(),
                    goal.nodeKind(),
                    goal.reason(),
                    goal.tags(),
                    resourceLinks,
                    goal.sourceRef(),
                    goal.sourceLicense(),
                    goal.sourceLicenseUrl(),
                    null);
        }
        com.skillpilot.backend.landscape.ExamData exam = goal.examData();
        com.skillpilot.backend.landscape.ExamData updated = new com.skillpilot.backend.landscape.ExamData();
        updated.setReviewStatus(exam.getReviewStatus());
        updated.setCoveredGoalIds(exam.getCoveredGoalIds());
        updated.setCoveredStrands(exam.getCoveredStrands());
        updated.setDemandLevels(exam.getDemandLevels());
        updated.setSourceArtifactPath(exam.getSourceArtifactPath());
        updated.setTaskContent(normalizeTaskContentForAi(goal.id(),
                rewriteAssetLinks(exam.getTaskContent(), assetBase)));
        updated.setTaskContentEn(normalizeTaskContentForAi(goal.id(),
                rewriteAssetLinks(exam.getTaskContentEn(), assetBase)));
        updated.setSolutionContent(normalizeMathDelimitersForChat(
                rewriteAssetLinks(exam.getSolutionContent(), assetBase)));
        updated.setSolutionContentEn(normalizeMathDelimitersForChat(
                rewriteAssetLinks(exam.getSolutionContentEn(), assetBase)));
        updated.setScoring(exam.getScoring());

        return new com.skillpilot.backend.api.FrontierGoal(
                goal.id(),
                normalizeMathDelimitersForChat(goal.title()),
                normalizeMathDelimitersForChat(goal.description()),
                goal.type(),
                goal.nodeKind(),
                goal.reason(),
                goal.tags(),
                resourceLinks,
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                updated);
    }

    private List<GoalSourceLink> rewriteResourceLinks(List<GoalSourceLink> links, String assetBase) {
        if (links == null || links.isEmpty()) {
            return links;
        }
        return links.stream()
                .map(link -> rewriteResourceLink(link, assetBase))
                .toList();
    }

    private GoalSourceLink rewriteResourceLink(GoalSourceLink link, String assetBase) {
        if (link == null) {
            return null;
        }
        return new GoalSourceLink(
                link.type(),
                link.title(),
                rewriteResourceLinkUrl(link.url(), assetBase),
                link.resourceType(),
                link.provider(),
                link.sections(),
                link.description(),
                link.lang(),
                link.license(),
                link.skillpilotId(),
                link.role(),
                link.altText(),
                link.reviewStatus());
    }

    private String rewriteResourceLinkUrl(String url, String assetBase) {
        if (url == null || url.isBlank() || assetBase == null || assetBase.isBlank()) {
            return url;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        String baseUrl = assetBase.replaceAll("/ai-assets$", "");
        if (trimmed.startsWith("/assets/")) {
            return assetBase + trimmed.substring("/assets".length());
        }
        if (trimmed.startsWith("/ai-assets/")) {
            return baseUrl + trimmed;
        }
        if (trimmed.startsWith("/")) {
            return baseUrl + trimmed;
        }
        return trimmed;
    }

    private boolean isExamDataReadyForHardCheck(com.skillpilot.backend.landscape.ExamData exam) {
        if (exam == null) {
            return false;
        }
        if (hasBlockingReviewStatus(exam.getReviewStatus())) {
            return false;
        }
        if (containsPlaceholderExamText(exam)) {
            return false;
        }
        return hasScoringStructure(exam)
                && exam.getTaskContent() != null
                && !exam.getTaskContent().isBlank()
                && exam.getSolutionContent() != null
                && !exam.getSolutionContent().isBlank();
    }

    private boolean hasBlockingReviewStatus(String reviewStatus) {
        if (reviewStatus == null || reviewStatus.isBlank()) {
            return false;
        }
        String normalized = reviewStatus.trim().toLowerCase(Locale.ROOT);
        return !"released".equals(normalized);
    }

    private boolean containsPlaceholderExamText(com.skillpilot.backend.landscape.ExamData exam) {
        String task = normalizeForInspection(exam.getTaskContent());
        String solution = normalizeForInspection(exam.getSolutionContent());
        if (task.matches("^eine materialgestuetzte j\\d+[- ]uebungsaufgabe\\b.*")) {
            return true;
        }
        if (task.matches("^eine integrative sek[- ]i[- ]abschlussaufgabe\\b.*")) {
            return true;
        }
        if (task.contains("uebungsaufgabe verbindet") && !hasSubtaskMarkers(task)) {
            return true;
        }
        return solution.startsWith("die loesung zeigt ")
                && !hasSubtaskMarkers(task)
                && !task.matches(".*\\b\\d+[,.]?\\d*\\b.*");
    }

    private boolean hasSubtaskMarkers(String normalizedTask) {
        return normalizedTask.matches("(?s).*(?:\\b1\\.|\\ba\\)|\\baufgabe\\s+1\\b|\\bteilaufgabe\\b).*");
    }

    private String normalizeForInspection(String value) {
        if (value == null) {
            return "";
        }
        return value
                .toLowerCase(Locale.ROOT)
                .replace("ü", "ue")
                .replace("ä", "ae")
                .replace("ö", "oe")
                .replace("ß", "ss")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasScoringStructure(com.skillpilot.backend.landscape.ExamData exam) {
        com.skillpilot.backend.landscape.ExamData.Scoring scoring = exam.getScoring();
        return scoring != null
                && scoring.getMaxPoints() > 0
                && scoring.getPassingPoints() > 0
                && scoring.getSteps() != null
                && !scoring.getSteps().isEmpty();
    }

    private String rewriteAssetLinks(String content, String assetBase) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("\\((/assets/[^)]+)\\)");
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String path = matcher.group(1);
            String normalized = path.startsWith("/assets/") ? path.substring("/assets".length()) : path;
            matcher.appendReplacement(sb, "(" + assetBase + normalized + ")");
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String normalizeTaskContentForAi(String goalId, String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern imagePattern = Pattern.compile("!\\[[^\\]]*\\]\\(([^)]+)\\)");
        Matcher matcher = imagePattern.matcher(content);
        String firstUrl = null;
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            if (firstUrl == null) {
                firstUrl = matcher.group(1);
            }
            matcher.appendReplacement(sb, "");
        }
        matcher.appendTail(sb);
        String stripped = normalizeMathDelimitersForChat(sb.toString().replaceAll("(?m)^\\s*$\\n?", "").trim());
        if (firstUrl == null || firstUrl.isBlank()) {
            return stripped;
        }
        String relativePath = toRelativeAssetPath(firstUrl);
        if (relativePath == null || relativePath.isBlank()) {
            return stripped;
        }
        String normalized = IMAGE_PATH_PREFIX + relativePath + "\n\n" + stripped;
        if ("bc60e300-96be-599a-89b6-8fcca380803d".equals(goalId)
                || "68a262fc-43f4-5d23-af30-853870bfd45b".equals(goalId)) {
            normalized = buildExamPackagedContent(relativePath, stripped);
        }
        return normalized;
    }

    private String buildExamPackagedContent(String imagePath, String body) {
        String safeBody = body == null ? "" : body.trim();
        String imageLine = (imagePath == null || imagePath.isBlank())
                ? ""
                : IMAGE_PATH_PREFIX + imagePath + "\n\n";
        return imageLine
                + "**Prüfungsmodus – Mathematik LK (Analysis)**\n\n"
                + "Hinweis: Du bearbeitest jetzt eine prüfungsnahe Abituraufgabe.\n\n"
                + "Arbeite selbstständig, strukturiert und rechne sauber.\n"
                + "Ich gebe keine Hinweise während der Bearbeitung.\n\n"
                + "---\n\n"
                + safeBody + "\n\n"
                + "---\n\n"
                + "Bitte reiche deine vollständige Lösung in einer Nachricht ein (Text reicht, Skizze gern beschrieben).\n"
                + "Wenn du abbrechen möchtest, sag einfach Bescheid.";
    }

    private String normalizeMathDelimitersForChat(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        String displayFixed = convertDisplayDollarMathForChat(content);
        return convertInlineDollarMathForChat(displayFixed);
    }

    private String convertDisplayDollarMathForChat(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("(?s)\\$\\$(.+?)\\$\\$");
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String inner = matcher.group(1).trim();
            String replacement = "\\[\n" + inner + "\n\\]";
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String convertInlineDollarMathForChat(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("(?<!\\\\)\\$(?!\\$)([^$\\n]+?)(?<!\\\\)\\$");
        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();
        while (matcher.find()) {
            String inner = matcher.group(1).trim();
            String replacement = "\\(" + inner + "\\)";
            matcher.appendReplacement(sb, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private String toRelativeAssetPath(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("/")) {
            return trimmed;
        }
        try {
            java.net.URI uri = java.net.URI.create(trimmed);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return null;
            }
            String query = uri.getQuery();
            return query == null || query.isBlank() ? path : path + "?" + query;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String resolveBaseUrl() {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
        if (baseUrl.isBlank()) {
            baseUrl = publicBaseUrl == null ? "" : publicBaseUrl.trim().replaceAll("/+$", "");
        }
        return baseUrl;
    }

}
