package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.claude.oauth.ClaudeOAuthConfiguration;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Authenticated MCP adapter for the provider-neutral coach facade.
 *
 * <p>No method accepts or returns a permanent SkillPilot ID or an OAuth token.
 * The learner is resolved from the opaque OAuth subject carried by the MCP
 * transport.</p>
 */
public final class ClaudeCoachMcpTools {

    public record CoachContext(
            boolean pendingLaunchConsumed,
            String language,
            String selectedCurriculum,
            CoachState state,
            String instruction) {
    }

    /**
     * Explicit allowlist for data sent to Claude. In particular, this excludes
     * the learner's permanent SkillPilot ID and copy-source learner IDs.
     */
    public record CoachState(
            LandscapeSummary curriculum,
            List<FrontierGoal> frontier,
            LearnerGoals goals,
            List<String> nextAllowedActions,
            List<String> activeFilters,
            String learningState,
            FrontierGoal activeGoal,
            StateMachineInfo stateMachine) {
    }

    public record MasteryToolResult(
            String status,
            MasteryUpdateResponse update,
            CoachState state,
            String error) {
    }

    public record ExamEvaluationToolResult(
            String goalId,
            String solutionContent,
            CoachToolFacade.ExamScoring scoring,
            String instruction) {
    }

    private final CoachToolFacade coachTools;
    private final ClaudeCoachConnectionService connectionService;
    private final CoachStateProjection stateProjection;

    ClaudeCoachMcpTools(
            CoachToolFacade coachTools,
            ClaudeCoachConnectionService connectionService,
            CoachStateProjection stateProjection) {
        this.coachTools = coachTools;
        this.connectionService = connectionService;
        this.stateProjection = stateProjection;
    }

    @Tool(
            name = "getCoachContext",
            description = "Load the current SkillPilot learning state from the backend. Call this at the beginning "
                    + "of a learning session and whenever older tool results may no longer be in context. "
                    + "The response never contains the permanent SkillPilot ID or authentication credentials.")
    public CoachContext getCoachContext() {
        String subject = connectionSubject();
        String skillpilotId = connectionService.resolveSkillpilotId(subject);
        Optional<ClaudeCoachConnectionService.PendingLaunch> launch = connectionService.consumePendingLaunch(subject);
        CoachState state = toCoachState(coachTools.getLearnerState(skillpilotId));
        return new CoachContext(
                launch.isPresent(),
                launch.map(ClaudeCoachConnectionService.PendingLaunch::language).orElse(null),
                launch.map(ClaudeCoachConnectionService.PendingLaunch::selectedCurriculum).orElse(null),
                state,
                "When language is present, answer in that language; otherwise continue in the user's language. "
                        + "Follow state.stateMachine.requiredAction. "
                        + "When requiredAction=orientActiveGoal and activeGoal.semanticKind=orientation, build interest "
                        + "by showing accessible possibilities and positive perspectives; do not test prior or detailed "
                        + "subject knowledge or grade answers as right or wrong. Save 1.0 only after the learner engages "
                        + "with a perspective or explicitly chooses to continue. "
                        + "Reload this context instead of relying on an old tool result.");
    }

    @Tool(
            name = "setScope",
            description = "Replace the learner's current SkillPilot goal scope with the exact goal IDs supplied. "
                    + "Use only goal IDs from the current coach context.")
    public CoachState setScope(
            @ToolParam(description = "Exact SkillPilot goal IDs from the current coach context") List<String> goalIds) {
        requireWriteScope();
        return toCoachState(coachTools.setScope(skillpilotId(), new ScopeRequest(goalIds)));
    }

    @Tool(
            name = "setPersonalization",
            description = "Apply the learner's selected curriculum personalization when required by "
                    + "stateMachine.requiredAction. Use only goal IDs or filter IDs from the current coach context.")
    public CoachState setPersonalization(
            @ToolParam(description = "Exact personalization goal IDs; use an empty list when filters are used")
            List<String> goalIds,
            @ToolParam(description = "Exact curriculum filter IDs; use an empty list when goal IDs are used")
            List<String> filters) {
        requireWriteScope();
        return toCoachState(coachTools.setPersonalization(
                skillpilotId(),
                new PersonalizationRequest(
                        Map.of(),
                        goalIds == null ? List.of() : goalIds,
                        filters == null ? List.of() : filters)));
    }

    @Tool(
            name = "setActiveGoal",
            description = "Set the active learning goal when required by stateMachine.requiredAction. "
                    + "Set redirect=true only when the learner explicitly changes an already active goal.")
    public CoachState setActiveGoal(
            @ToolParam(description = "Exact goal ID from goalOptions or the current frontier") String goalId,
            @ToolParam(description = "Whether this is an explicit learner-requested redirect") Boolean redirect) {
        requireWriteScope();
        return toCoachState(coachTools.setActiveGoal(skillpilotId(), new ActiveGoalRequest(goalId, redirect)));
    }

    @Tool(
            name = "setMastery",
            description = "For semanticKind=orientation, do not test subject knowledge: first show accessible "
                    + "possibilities and positive perspectives, then save 1.0 only after the learner engages or "
                    + "chooses to continue. For other goals, save one mastery value only after the learner has "
                    + "provided sufficient evidence. "
                    + "The value must be between 0.0 and 1.0. Never batch several goals in this tool.")
    public MasteryToolResult setMastery(
            @ToolParam(description = "Exact active goal ID") String goalId,
            @ToolParam(description = "Mastery estimate between 0.0 and 1.0") Double mastery) {
        requireWriteScope();
        String normalizedGoalId = goalId == null ? null : goalId.trim();
        if (normalizedGoalId == null || normalizedGoalId.isEmpty()) {
            return badMasteryRequest("setMastery requires a non-empty goalId.");
        }
        if (mastery == null || !Double.isFinite(mastery) || mastery < 0.0 || mastery > 1.0) {
            return badMasteryRequest("setMastery value must be between 0.0 and 1.0.");
        }
        CoachToolFacade.MasteryResult result = coachTools.setMastery(
                skillpilotId(),
                new MasteryUpdateRequest(Map.of(normalizedGoalId, mastery), normalizedGoalId));
        return new MasteryToolResult(
                result.status().name().toLowerCase(Locale.ROOT),
                stateProjection.project(result.update()),
                toCoachState(result.state()),
                result.error());
    }

    @Tool(
            name = "setCurriculum",
            description = "Select a curriculum using an exact curriculum ID returned in the coach context.")
    public CoachState setCurriculum(
            @ToolParam(description = "Exact curriculum ID") String curriculumId) {
        requireWriteScope();
        UpdateCurriculumRequest request = new UpdateCurriculumRequest();
        request.setCurriculumId(curriculumId);
        return toCoachState(coachTools.setCurriculum(skillpilotId(), request));
    }

    @Tool(
            name = "getExamEvaluation",
            description = "Load the released solution and scoring rubric for the active exam goal only after the "
                    + "learner has visibly submitted a complete answer. Normal coach context never contains this material.")
    public ExamEvaluationToolResult getExamEvaluation(
            @ToolParam(description = "Exact active exam goal ID") String goalId,
            @ToolParam(description = "Response language, normally de or en") String language) {
        requireWriteScope();
        CoachToolFacade.ExamEvaluationResult result = coachTools.getExamEvaluation(
                skillpilotId(),
                new CoachToolFacade.ExamEvaluationRequest(goalId));
        String normalizedLanguage = normalizeLanguage(language);
        String localizedSolution = localizedContent(
                normalizedLanguage,
                result.solutionContent(),
                result.solutionContentEn());
        String instruction = localizedContent(
                normalizedLanguage,
                "Bewerte die bereits vorliegende Antwort kriteriumsbezogen nach Aufgabe und Raster. Die Lösung ist nur Referenz: Fachlich gleichwertige Ergebnisse, Darstellungen, Begründungen und korrekte alternative Wege zählen voll, sofern Aufgabe oder Raster keine bestimmte Antwortform verlangt; ausdrückliche Anforderungen bleiben verbindlich. Bewerte abschließend ohne Rückfrage; benenne Unleserliches als solches und erfinde daraus keinen konkreten fachlichen Fehler. Speichere Mastery erst nach einem final bestandenen Ergebnis.",
                "Grade the answer already present criterion by criterion against the task and rubric. The solution is a reference only: give full credit to subject-correct equivalent results, representations, explanations, and alternative methods unless the task or rubric explicitly requires a specific answer form; explicit requirements remain binding. Grade conclusively without follow-up questions; identify illegible work as such and never invent a specific subject error from it. Save mastery only after a final passing result.");
        return new ExamEvaluationToolResult(
                result.goalId(),
                stateProjection.projectReleasedEvaluationContent(localizedSolution),
                result.scoring(),
                instruction);
    }

    @Tool(
            name = "startVerifiedRecall",
            description = "Start or resume a strict SkillPilot memory-card check for the active memorization goal.")
    public VerifiedRecallPromptResponse startVerifiedRecall(
            @ToolParam(description = "Exact active memorization goal ID") String goalId,
            @ToolParam(description = "Whether already verified cards should be tested again") Boolean retest,
            @ToolParam(description = "Number of prompts in this batch") Integer batchSize,
            @ToolParam(description = "Response language, normally de or en") String language) {
        requireWriteScope();
        return withoutSkillpilotId(coachTools.startVerifiedRecall(
                skillpilotId(),
                normalizeLanguage(language),
                new VerifiedRecallStartRequest(goalId, retest, batchSize)));
    }

    @Tool(
            name = "getVerifiedRecallAnswer",
            description = "Load the expected answer for one recall card only after the learner has answered it.")
    public VerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            @ToolParam(description = "Exact goal ID from the recall prompt") String goalId,
            @ToolParam(description = "Exact card ID from the recall prompt") String cardId,
            @ToolParam(description = "Response language, normally de or en") String language) {
        return coachTools.getVerifiedRecallAnswer(
                skillpilotId(),
                normalizeLanguage(language),
                new VerifiedRecallAnswerRequest(goalId, cardId));
    }

    @Tool(
            name = "recordVerifiedRecallResult",
            description = "Persist passed or failed for exactly one recall card after comparing the learner's answer.")
    public VerifiedRecallResultResponse recordVerifiedRecallResult(
            @ToolParam(description = "Exact goal ID from the recall prompt") String goalId,
            @ToolParam(description = "Exact card ID from the recall prompt") String cardId,
            @ToolParam(description = "True only if the learner answered correctly without help") Boolean passed,
            @ToolParam(description = "Short evidence-based feedback") String feedback,
            @ToolParam(description = "Response language, normally de or en") String language) {
        requireWriteScope();
        return withoutSkillpilotId(coachTools.recordVerifiedRecallResult(
                skillpilotId(),
                normalizeLanguage(language),
                new VerifiedRecallResultRequest(goalId, cardId, passed, feedback)));
    }

    private String skillpilotId() {
        return connectionService.resolveSkillpilotId(connectionSubject());
    }

    private MasteryToolResult badMasteryRequest(String error) {
        return new MasteryToolResult("bad_request", null, null, error);
    }

    private String connectionSubject() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Claude MCP authentication is required.");
        }
        return authentication.getName();
    }

    private void requireWriteScope() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean allowed = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> ("SCOPE_" + ClaudeOAuthConfiguration.WRITE_SCOPE)
                        .equals(authority.getAuthority()));
        if (!allowed) {
            throw new AccessDeniedException("The SkillPilot write scope is required for this tool.");
        }
    }

    private String normalizeLanguage(String language) {
        String normalized = language == null ? "" : language.trim().toLowerCase();
        return normalized.startsWith("en") ? "en" : "de";
    }

    private String localizedContent(String language, String german, String english) {
        if ("en".equals(language) && english != null && !english.isBlank()) {
            return english;
        }
        return german;
    }

    private CoachState toCoachState(UnifiedLearnerStateResponse state) {
        UnifiedLearnerStateResponse projected = stateProjection.project(state);
        if (projected == null) {
            return null;
        }
        return new CoachState(
                projected.curriculum(),
                projected.frontier(),
                projected.goals(),
                projected.nextAllowedActions(),
                projected.activeFilters(),
                projected.learningState(),
                projected.activeGoal(),
                projected.stateMachine());
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
