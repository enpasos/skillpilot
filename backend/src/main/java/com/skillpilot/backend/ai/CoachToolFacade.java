package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Provider-neutral application boundary for learning-coach tool adapters.
 *
 * <p>The facade owns the tool workflow and state-machine guards. Transport and
 * provider-specific response rendering stay in the calling adapter.</p>
 */
@Service
public class CoachToolFacade {

    public record RedeemedCoachSession(
            String sessionToken,
            Instant expiresAt,
            String skillpilotId,
            UnifiedLearnerStateResponse state) {
    }

    public enum MasteryStatus {
        UPDATED,
        BAD_REQUEST,
        CONFLICT
    }

    public record MasteryResult(
            MasteryStatus status,
            MasteryUpdateResponse update,
            UnifiedLearnerStateResponse state,
            String error) {

        static MasteryResult updated(MasteryUpdateResponse update) {
            return new MasteryResult(MasteryStatus.UPDATED, update, null, null);
        }

        static MasteryResult badRequest(String error) {
            return new MasteryResult(MasteryStatus.BAD_REQUEST, null, null, error);
        }

        static MasteryResult conflict(UnifiedLearnerStateResponse state) {
            return new MasteryResult(MasteryStatus.CONFLICT, null, state, null);
        }
    }

    /**
     * Provider-neutral request for the protected evaluation material of the
     * currently active exam goal.
     */
    public record ExamEvaluationRequest(String goalId) {
    }

    /**
     * Released exam evaluation material. It deliberately contains neither a
     * learner identifier nor provider-specific rendering instructions.
     */
    public record ExamEvaluationResult(
            String goalId,
            String solutionContent,
            String solutionContentEn,
            ExamScoring scoring) {
    }

    public record ExamScoring(
            double maxPoints,
            double passingPoints,
            List<ExamScoringStep> steps) {
    }

    public record ExamScoringStep(
            String id,
            double points,
            String description) {
    }

    private final LearnerService learnerService;
    private final ChatSessionService chatSessionService;
    private final CoachStateProjection coachStateProjection;

    public CoachToolFacade(
            LearnerService learnerService,
            ChatSessionService chatSessionService,
            CoachStateProjection coachStateProjection) {
        this.learnerService = learnerService;
        this.chatSessionService = chatSessionService;
        this.coachStateProjection = coachStateProjection;
    }

    public UnifiedLearnerStateResponse getLearnerState(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getCoachLearnerState(skillpilotId);
    }

    public boolean showGoalVisualizationsInChat(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.showGoalVisualizationsInChat(skillpilotId);
    }

    /** Reviewed, personalized map used only while an orientation goal is active. */
    public OrientationOutlook getOrientationOutlook(String skillpilotId, String communicationLocale) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getCoachOrientationOutlook(skillpilotId, communicationLocale);
    }

    /** Complete frontier used for authored transitions, never for compact UI rendering. */
    public List<FrontierGoal> getUncompactedFrontier(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getUncompactedRichFrontier(skillpilotId);
    }

    /** Read-only curriculum catalog for authenticated, ID-based coach adapters. */
    public List<LandscapeSummary> getCurriculumOptions(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getAvailableBaseCurricula(false);
    }

    /** Metadata-driven next personalization stage for the selected curriculum. */
    public PersonalizationPlan getPersonalizationPlan(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getCoachPersonalizationPlan(skillpilotId);
    }

    /** Read-only personalized scope roots for authenticated, ID-based coach adapters. */
    public List<FrontierGoal> getScopeOptions(String skillpilotId) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getScopeNavigationOptions(skillpilotId);
    }

    public UnifiedLearnerStateResponse setScope(String skillpilotId, ScopeRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.setScope(skillpilotId, request.goalIds());
    }

    public UnifiedLearnerStateResponse setActiveGoal(String skillpilotId, ActiveGoalRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        UnifiedLearnerStateResponse state = learnerService.getCoachLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        boolean redirect = Boolean.TRUE.equals(request.redirect());
        FrontierGoal currentActiveGoal = activeGoal(state);
        boolean confirmsCurrentActiveGoal = currentActiveGoal != null
                && request.goalId() != null
                && request.goalId().equals(currentActiveGoal.id());
        if (!"setActiveGoal".equals(requiredAction)) {
            if (confirmsCurrentActiveGoal) {
                // Autopilot may already have activated the successor returned by
                // a mastery mutation. Reconfirming that exact goal is an
                // idempotent continuation, not a redirect or a state conflict.
            } else if (allowsActiveGoalRedirect(requiredAction) && redirect) {
                // Explicit learner redirect while an active goal is locked.
            } else if (requiredAction != null) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Required action is " + requiredAction + ". Follow stateMachine.requiredAction.");
            }
        }
        learnerService.setActiveGoal(skillpilotId, request.goalId());
        return learnerService.getCoachLearnerState(skillpilotId);
    }

    public MasteryResult setMastery(String skillpilotId, MasteryUpdateRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);

        String validationError = validateMasteryRequest(request);
        if (validationError != null) {
            return MasteryResult.badRequest(validationError);
        }
        MasteryUpdateRequest effectiveRequest = normalizeMasteryRequest(request);

        UnifiedLearnerStateResponse state = learnerService.getCoachLearnerState(skillpilotId);
        String requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
        if (requiredAction != null && !allowsMasteryWrite(requiredAction)) {
            // Recovery path for a conversation that selected a goal but did not persist
            // it before attempting the mastery write.
            if ("setActiveGoal".equals(requiredAction)) {
                String selectedGoalId = extractGoalIdFromMasteryRequest(effectiveRequest);
                if (selectedGoalId != null && !selectedGoalId.isBlank()) {
                    try {
                        learnerService.setActiveGoal(skillpilotId, selectedGoalId);
                        state = learnerService.getCoachLearnerState(skillpilotId);
                        requiredAction = state.stateMachine() != null ? state.stateMachine().requiredAction() : null;
                    } catch (ResponseStatusException exception) {
                        if (HttpStatus.CONFLICT.equals(exception.getStatusCode())
                                || HttpStatus.BAD_REQUEST.equals(exception.getStatusCode())) {
                            return MasteryResult.conflict(learnerService.getCoachLearnerState(skillpilotId));
                        }
                        throw exception;
                    }
                }
            }
            if (requiredAction != null && !allowsMasteryWrite(requiredAction)) {
                return MasteryResult.conflict(state);
            }
        }

        try {
            return MasteryResult.updated(learnerService.setMastery(skillpilotId, effectiveRequest));
        } catch (ResponseStatusException exception) {
            if (HttpStatus.CONFLICT.equals(exception.getStatusCode())) {
                return MasteryResult.conflict(learnerService.getCoachLearnerState(skillpilotId));
            }
            throw exception;
        }
    }

    public MemoryPracticeResponse startMemoryPractice(
            String skillpilotId,
            String language,
            MemoryPracticeStartRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.startMemoryPractice(skillpilotId, language, request);
    }

    public MemoryPracticeResponse reviewMemoryPracticeCard(
            String skillpilotId,
            String language,
            MemoryPracticeReviewRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.reviewMemoryPracticeCard(skillpilotId, language, request);
    }

    public VerifiedRecallPromptResponse startVerifiedRecall(
            String skillpilotId,
            String language,
            VerifiedRecallStartRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.startVerifiedRecall(skillpilotId, language, request);
    }

    public VerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            String skillpilotId,
            String language,
            VerifiedRecallAnswerRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getVerifiedRecallAnswer(skillpilotId, language, request);
    }

    public VerifiedRecallResultResponse recordVerifiedRecallResult(
            String skillpilotId,
            String language,
            VerifiedRecallResultRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        return learnerService.recordVerifiedRecallResult(skillpilotId, language, request);
    }

    /**
     * Authorizes access to evaluation material for an active, released and
     * structurally complete exam goal. OAuth/MCP adapters use this ID-based
     * variant after resolving the authenticated learner outside the model
     * arguments.
     */
    public ExamEvaluationResult getExamEvaluation(
            String skillpilotId,
            ExamEvaluationRequest request) {
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        UnifiedLearnerStateResponse state = learnerService.getCoachLearnerState(skillpilotId);
        if (request == null || request.goalId() == null || request.goalId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "goalId must not be empty.");
        }
        FrontierGoal active = activeGoal(state);
        if (active == null || !request.goalId().equals(active.id()) || !isExamGoal(active)
                || !coachStateProjection.isExamReadyForHardCheck(active)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The cited goal is not the active exam goal.");
        }
        ExamData exam = active.examData();
        if (exam.getSolutionContent() == null || exam.getSolutionContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The active exam has no released evaluation data.");
        }
        return new ExamEvaluationResult(
                active.id(),
                exam.getSolutionContent(),
                exam.getSolutionContentEn(),
                examScoring(exam.getScoring()));
    }

    public UnifiedLearnerStateResponse setCurriculum(String skillpilotId, UpdateCurriculumRequest request) {
        learnerService.setCurriculumFromPublicCatalog(skillpilotId, request.getCurriculumId());
        return learnerService.getCoachLearnerState(skillpilotId);
    }

    public UnifiedLearnerStateResponse setPersonalization(String skillpilotId, PersonalizationRequest request) {
        learnerService.assertWritableLearningSession(skillpilotId);
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Personalization request is required.");
        }
        if (request.config() != null && !request.config().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Coach personalization accepts only current option references; raw config is not supported.");
        }
        return learnerService.patchPersonalCurriculum(
                skillpilotId,
                request.config(),
                request.goalIds(),
                request.filters(),
                request.optionId());
    }

    public RedeemedCoachSession redeemStartCode(String startCode, String language) {
        ChatSessionService.RedeemedSession session = chatSessionService.redeemStartCode(startCode, language);
        return new RedeemedCoachSession(
                session.chatSessionToken(),
                session.expiresAt(),
                session.skillpilotId(),
                withoutSkillpilotId(learnerService.getCoachLearnerState(session.skillpilotId())));
    }

    public UnifiedLearnerStateResponse getSessionState(String sessionToken) {
        return withoutSkillpilotId(learnerService.getCoachLearnerState(resolveSessionLearnerId(sessionToken)));
    }

    /** Read-only catalog access used for explicit mid-session curriculum navigation. */
    public List<LandscapeSummary> getSessionCurriculumOptions(String sessionToken) {
        resolveSessionLearnerId(sessionToken);
        return learnerService.getAvailableBaseCurricula(false);
    }

    /** Read-only personalized scope roots for an explicit mid-session focus switch. */
    public List<com.skillpilot.backend.api.FrontierGoal> getSessionScopeOptions(String sessionToken) {
        return learnerService.getScopeNavigationOptions(resolveSessionLearnerId(sessionToken));
    }

    public UnifiedLearnerStateResponse setSessionScope(String sessionToken, ScopeRequest request) {
        return withoutSkillpilotId(setScope(resolveSessionLearnerId(sessionToken), request));
    }

    public UnifiedLearnerStateResponse setSessionActiveGoal(String sessionToken, ActiveGoalRequest request) {
        return withoutSkillpilotId(setActiveGoal(resolveSessionLearnerId(sessionToken), request));
    }

    public MasteryResult setSessionMastery(String sessionToken, MasteryUpdateRequest request) {
        MasteryResult result = setMastery(resolveSessionLearnerId(sessionToken), request);
        if (result.status() != MasteryStatus.CONFLICT || result.state() == null) {
            return result;
        }
        return MasteryResult.conflict(withoutSkillpilotId(result.state()));
    }

    public MemoryPracticeResponse startSessionMemoryPractice(
            String sessionToken,
            String language,
            MemoryPracticeStartRequest request) {
        return startMemoryPractice(resolveSessionLearnerId(sessionToken), language, request);
    }

    public MemoryPracticeResponse reviewSessionMemoryPracticeCard(
            String sessionToken,
            String language,
            MemoryPracticeReviewRequest request) {
        return reviewMemoryPracticeCard(resolveSessionLearnerId(sessionToken), language, request);
    }

    public VerifiedRecallPromptResponse startSessionVerifiedRecall(
            String sessionToken,
            String language,
            VerifiedRecallStartRequest request) {
        String skillpilotId = resolveSessionLearnerId(sessionToken);
        return withoutSkillpilotId(learnerService.startVerifiedRecall(skillpilotId, language, request));
    }

    public VerifiedRecallAnswerResponse getSessionVerifiedRecallAnswer(
            String sessionToken,
            String language,
            VerifiedRecallAnswerRequest request) {
        String skillpilotId = resolveSessionLearnerId(sessionToken);
        return learnerService.getVerifiedRecallAnswer(skillpilotId, language, request);
    }

    public VerifiedRecallResultResponse recordSessionVerifiedRecallResult(
            String sessionToken,
            String language,
            VerifiedRecallResultRequest request) {
        String skillpilotId = resolveSessionLearnerId(sessionToken);
        learnerService.assertWritableLearningSession(skillpilotId);
        return withoutSkillpilotId(learnerService.recordVerifiedRecallResult(skillpilotId, language, request));
    }

    /** Session-token adapter for {@link #getExamEvaluation(String, ExamEvaluationRequest)}. */
    public ExamEvaluationResult getSessionExamEvaluation(
            String sessionToken,
            ExamEvaluationRequest request) {
        return getExamEvaluation(chatSessionService.resolveSkillpilotId(sessionToken), request);
    }

    public UnifiedLearnerStateResponse setSessionCurriculum(String sessionToken, UpdateCurriculumRequest request) {
        return withoutSkillpilotId(setCurriculum(resolveSessionLearnerId(sessionToken), request));
    }

    public UnifiedLearnerStateResponse setSessionPersonalization(
            String sessionToken,
            PersonalizationRequest request) {
        return withoutSkillpilotId(setPersonalization(resolveSessionLearnerId(sessionToken), request));
    }

    private String resolveSessionLearnerId(String sessionToken) {
        String skillpilotId = chatSessionService.resolveSkillpilotId(sessionToken);
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return skillpilotId;
    }

    private String validateMasteryRequest(MasteryUpdateRequest request) {
        if (request == null) {
            return "setMastery requires a goalId.";
        }
        boolean hasMasteryMap = request.mastery() != null && !request.mastery().isEmpty();
        if (!hasMasteryMap) {
            if (request.goalId() == null || request.goalId().isBlank()) {
                return "setMastery requires a goalId.";
            }
            return null;
        }
        if (request.mastery().size() != 1) {
            return "setMastery accepts exactly one mastery update at a time.";
        }
        Map.Entry<String, Double> entry = request.mastery().entrySet().iterator().next();
        if (entry.getKey() == null || entry.getKey().isBlank()) {
            return "setMastery requires a non-empty goal ID in mastery.";
        }
        if (!isValidMasteryValue(entry.getValue())) {
            return "setMastery value must be between 0.0 and 1.0.";
        }
        return null;
    }

    private MasteryUpdateRequest normalizeMasteryRequest(MasteryUpdateRequest request) {
        if (request.mastery() != null && !request.mastery().isEmpty()) {
            return request;
        }
        return new MasteryUpdateRequest(Map.of(request.goalId(), 1.0), request.goalId());
    }

    private boolean isValidMasteryValue(Double value) {
        return value != null && !value.isNaN() && !value.isInfinite() && value >= 0.0 && value <= 1.0;
    }

    private boolean allowsMasteryWrite(String requiredAction) {
        return "setMastery".equals(requiredAction)
                || "teachActiveGoal".equals(requiredAction)
                || "orientActiveGoal".equals(requiredAction);
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

    private FrontierGoal activeGoal(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        if (state.stateMachine() != null && state.stateMachine().activeGoal() != null) {
            return state.stateMachine().activeGoal();
        }
        return state.activeGoal();
    }

    private boolean isExamGoal(FrontierGoal goal) {
        return goal != null && ("exam".equals(goal.nodeKind()) || goal.examData() != null);
    }

    private ExamScoring examScoring(ExamData.Scoring scoring) {
        if (scoring == null) {
            return null;
        }
        List<ExamScoringStep> steps = scoring.getSteps() == null
                ? List.of()
                : scoring.getSteps().stream()
                        .map(step -> new ExamScoringStep(step.getId(), step.getPoints(), step.getDescription()))
                        .toList();
        return new ExamScoring(scoring.getMaxPoints(), scoring.getPassingPoints(), steps);
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
                Set.of(),
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
                response.masterySaved(),
                response.masteryGoalId(),
                response.instruction(),
                withoutSkillpilotId(response.next()));
    }
}
