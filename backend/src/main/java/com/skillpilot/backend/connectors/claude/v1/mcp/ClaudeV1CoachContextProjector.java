package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.stereotype.Component;

/**
 * Builds a text-safe, structured coach context for Claude from the canonical state projection.
 *
 * <p>Exam goals are projected with the task and the maximum score only. Passing threshold, scoring
 * rubric and sample solution are withheld here and released solely through the exam evaluation
 * tool, so ordinary coaching context can never reveal how much is enough or what the answer is.</p>
 */
@Component
@ConditionalOnClaudeV1Enabled
public class ClaudeV1CoachContextProjector {

    private final CoachStateProjection coachStateProjection;
    private final CoachToolFacade coachToolFacade;

    public ClaudeV1CoachContextProjector(
            CoachStateProjection coachStateProjection,
            CoachToolFacade coachToolFacade) {
        this.coachStateProjection = Objects.requireNonNull(coachStateProjection, "coachStateProjection");
        this.coachToolFacade = Objects.requireNonNull(coachToolFacade, "coachToolFacade");
    }

    public Map<String, Object> projectContext(String skillpilotId, long stateVersion, String language) {
        UnifiedLearnerStateResponse rawState = coachToolFacade.getLearnerState(skillpilotId);
        UnifiedLearnerStateResponse projectedState = coachStateProjection.project(rawState);

        Map<String, Object> context = new LinkedHashMap<>();
        context.put("stateVersion", stateVersion);
        context.put("language", language);
        context.put("curriculum", projectedState.curriculum());

        StateMachineInfo stateMachine = projectedState.stateMachine();
        if (stateMachine != null) {
            Map<String, Object> stateMachineContext = new LinkedHashMap<>();
            stateMachineContext.put("state", stateMachine.state());
            stateMachineContext.put("requiredAction", stateMachine.requiredAction());
            if (stateMachine.modeOptions() != null && !stateMachine.modeOptions().isEmpty()) {
                stateMachineContext.put("modeOptions", stateMachine.modeOptions());
            }
            context.put("stateMachine", stateMachineContext);
        }

        context.put("activeGoal", formatGoal(projectedState.activeGoal()));

        if (isOrientationGoal(projectedState.activeGoal())) {
            context.put("orientationOutlook", projectOrientationOutlook(
                    coachToolFacade.getOrientationOutlook(skillpilotId, language),
                    projectedState.activeGoal().id()));
        }

        List<FrontierGoal> frontier = projectedState.frontier();
        context.put("frontier", frontier == null ? List.of() : frontier.stream().map(this::formatGoal).toList());

        LearnerGoals goals = projectedState.goals();
        if (goals != null) {
            Map<String, Object> progress = new LinkedHashMap<>();
            progress.put("totalGoals", goals.total_count());
            progress.put("masteredGoals", goals.mastered_count());
            context.put("progress", progress);
        }

        return context;
    }

    public Map<String, Object> formatGoal(FrontierGoal goal) {
        if (goal == null) {
            return null;
        }
        Map<String, Object> formatted = new LinkedHashMap<>();
        formatted.put("id", goal.id());
        formatted.put("title", goal.title());
        formatted.put("description", goal.description());
        formatted.put("nodeKind", goal.nodeKind());
        formatted.put("semanticKind", goal.semanticKind());
        formatted.put("tags", goal.tags());

        if (goal.examData() != null) {
            Map<String, Object> exam = new LinkedHashMap<>();
            if (goal.examData().getTaskContent() != null) {
                exam.put("taskDe", goal.examData().getTaskContent());
            }
            if (goal.examData().getTaskContentEn() != null) {
                exam.put("taskEn", goal.examData().getTaskContentEn());
            }
            if (goal.examData().getScoring() != null) {
                // maxPoints only. passingPoints and the step rubric stay behind the evaluation
                // tool so the coaching context cannot leak the pass mark.
                exam.put("maxPoints", goal.examData().getScoring().getMaxPoints());
            }
            formatted.put("examData", exam);
        }
        return formatted;
    }

    /**
     * Formats a published navigation option together with its complete focus replacement payload.
     *
     * <p>A widening option can replace one focus branch while retaining independent roots. Its
     * display id is therefore not necessarily the complete value accepted by
     * {@code set_skillpilot_focus}. Keeping this field out of ordinary goal projections avoids
     * presenting an internal selection detail where it is not actionable.</p>
     */
    public Map<String, Object> formatNavigationGoal(FrontierGoal goal) {
        Map<String, Object> formatted = formatGoal(goal);
        if (formatted != null) {
            formatted.put("goalIds", goal.selectionGoalIds());
        }
        return formatted;
    }

    public List<FrontierGoal> projectNavigationGoals(List<FrontierGoal> goals) {
        return coachStateProjection.projectNavigationGoals(goals == null ? List.of() : goals);
    }

    public String projectReleasedEvaluationContent(String content) {
        return coachStateProjection.projectReleasedEvaluationContent(content);
    }

    private Map<String, Object> projectOrientationOutlook(OrientationOutlook outlook, String activeGoalId) {
        if (outlook == null
                || !Objects.equals(activeGoalId, outlook.orientationGoalId())
                || outlook.paths() == null) {
            return null;
        }
        Map<String, Object> projected = new LinkedHashMap<>();
        projected.put("orientationGoalId", outlook.orientationGoalId());
        projected.put("paths", outlook.paths().stream()
                .filter(Objects::nonNull)
                .map(path -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("pathId", path.pathId());
                    item.put("title", path.title());
                    item.put("learningOutlook", path.learningOutlook());
                    item.put("practicalContexts",
                            path.practicalContexts() == null ? List.of() : path.practicalContexts());
                    item.put("representativeGoals",
                            path.representativeGoals() == null ? List.of() : path.representativeGoals());
                    // relatedGoalIds is an internal transition allowlist and is deliberately not
                    // exposed to the model.
                    return item;
                })
                .toList());
        return projected;
    }

    private boolean isOrientationGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("orientation".equalsIgnoreCase(goal.semanticKind())) {
            return true;
        }
        return goal.tags() != null && goal.tags().stream()
                .filter(Objects::nonNull)
                .anyMatch(tag -> "orientation".equalsIgnoreCase(tag)
                        || "semantic:orientation".equalsIgnoreCase(tag));
    }
}
