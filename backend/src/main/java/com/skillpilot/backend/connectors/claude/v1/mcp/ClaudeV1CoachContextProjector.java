package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    static final String GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION =
            "Required presentation: form the pair from goalVisualization.goalId and this result's "
                    + "top-level stateVersion. For every previously unseen pair in this conversation, "
                    + "call render_skillpilot_goal_visualization exactly once as the immediate next "
                    + "SkillPilot tool, before any learner-facing response, copying the pair to goalId "
                    + "and expectedStateVersion. Do this even if a different pair was rendered earlier. "
                    + "A repeated pair creates no automatic call. If the learner explicitly asks to show "
                    + "the current image again, reload the current context once and allow one new one-shot "
                    + "call if it still qualifies. Do not retry automatically or claim that the host "
                    + "displayed the component. This server-approved image remains a supplementary "
                    + "presentation step in every interaction mode, including voice mode: never make it "
                    + "carry a task, assume it is visible or ask a question that requires inspecting it. "
                    + "Never infer or request a client type.";
    private static final String GOAL_VISUALIZATION_ASSET_PREFIX =
            "/assets/goal-visualizations/";
    private static final Set<String> CURATED_GOAL_VISUALIZATION_STATUSES = Set.of(
            "pilot", "accepted", "approved", "release_approved", "released");

    private final CoachStateProjection coachStateProjection;
    private final CoachToolFacade coachToolFacade;
    private final String publicBaseUrl;

    ClaudeV1CoachContextProjector(
            CoachStateProjection coachStateProjection,
            CoachToolFacade coachToolFacade) {
        this(coachStateProjection, coachToolFacade, "https://skillpilot.com");
    }

    @Autowired
    public ClaudeV1CoachContextProjector(
            CoachStateProjection coachStateProjection,
            CoachToolFacade coachToolFacade,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.coachStateProjection = Objects.requireNonNull(coachStateProjection, "coachStateProjection");
        this.coachToolFacade = Objects.requireNonNull(coachToolFacade, "coachToolFacade");
        this.publicBaseUrl = normalizePublicBaseUrl(publicBaseUrl);
    }

    public Map<String, Object> projectContext(String skillpilotId, long stateVersion, String language) {
        UnifiedLearnerStateResponse rawState = coachToolFacade.getLearnerState(skillpilotId);
        UnifiedLearnerStateResponse projectedState = coachStateProjection.project(rawState);

        Map<String, Object> context = new LinkedHashMap<>();
        context.put("stateVersion", stateVersion);
        context.put("language", language);
        context.put("curriculum", projectCurriculum(projectedState.curriculum()));
        List<Map<String, Object>> learningContext = projectLearningContext(
                coachToolFacade.getPersonalizationPlan(skillpilotId), language);
        if (!learningContext.isEmpty()) {
            context.put("learningContext", learningContext);
        }

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

        FrontierGoal activeGoal = projectedState.activeGoal();
        context.put("activeGoal", formatGoal(activeGoal));

        if (coachToolFacade.showGoalVisualizationsInChat(skillpilotId)) {
            Map<String, Object> goalVisualization = projectGoalVisualization(
                    projectedState.curriculum(), activeGoal, language);
            if (goalVisualization != null) {
                context.put("goalVisualization", goalVisualization);
                context.put(
                        "presentationInstruction",
                        GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION);
            }
        }

        if (isOrientationGoal(activeGoal)) {
            context.put("orientationOutlook", projectOrientationOutlook(
                    coachToolFacade.getOrientationOutlook(skillpilotId, language),
                    activeGoal.id()));
        }

        List<FrontierGoal> frontier = projectedState.frontier();
        String activeGoalId = activeGoal == null ? null : activeGoal.id();
        context.put("frontier", frontier == null ? List.of() : frontier.stream()
                .filter(Objects::nonNull)
                .filter(goal -> !Objects.equals(activeGoalId, goal.id()))
                .map(this::formatGoal)
                .toList());

        LearnerGoals goals = projectedState.goals();
        if (goals != null) {
            Map<String, Object> progress = new LinkedHashMap<>();
            progress.put("totalGoals", goals.total_count());
            progress.put("masteredGoals", goals.mastered_count());
            context.put("progress", progress);
        }

        return context;
    }

    /**
     * Builds the bounded public projection consumed by the dedicated image-only MCP App. The
     * link-level status allowlist is defense in depth; the authoritative content approval remains
     * the hash-bound visualization QA gate that runs before canonical runtime assets are built.
     */
    Map<String, Object> projectGoalVisualization(
            LandscapeSummary curriculum,
            FrontierGoal goal,
            String language) {
        if (goal == null
                || !"atomic".equalsIgnoreCase(goal.type())
                || goal.id() == null
                || goal.id().isBlank()
                || goal.resourceLinks() == null) {
            return null;
        }
        GoalSourceLink visualization = goal.resourceLinks().stream()
                .filter(link -> link != null
                        && "goal-visualization".equals(link.type())
                        && "image".equals(link.resourceType())
                        && "primary".equals(link.role())
                        && isCuratedGoalVisualizationStatus(link.reviewStatus())
                        && goal.id().equals(link.skillpilotId())
                        && link.url() != null
                        && !link.url().isBlank())
                .findFirst()
                .orElse(null);
        if (visualization == null) {
            return null;
        }
        String imageUrl = publicAssetUrl(visualization.url());
        String cockpitUrl = cockpitUrl(
                curriculum == null ? null : curriculum.getCurriculumId(),
                goal.id());
        if (imageUrl == null || cockpitUrl == null) {
            return null;
        }
        String title = goal.title() == null || goal.title().isBlank()
                ? goal.id()
                : goal.title().trim();
        String altText = visualization.altText();
        if (altText == null || altText.isBlank()) {
            altText = language != null && language.toLowerCase(java.util.Locale.ROOT).startsWith("en")
                    ? "Didactic visualisation for the learning goal “" + title + "”."
                    : "Didaktische Visualisierung zum Lernziel „" + title + "“.";
        }
        Map<String, Object> projected = new LinkedHashMap<>();
        projected.put("goalId", goal.id());
        projected.put("title", bounded(title, 320));
        projected.put("imageUrl", imageUrl);
        projected.put("altText", bounded(altText.trim(), 1_000));
        projected.put("cockpitUrl", cockpitUrl);
        return Map.copyOf(projected);
    }

    private static boolean isCuratedGoalVisualizationStatus(String reviewStatus) {
        return reviewStatus != null
                && CURATED_GOAL_VISUALIZATION_STATUSES.contains(
                        reviewStatus.trim().toLowerCase(Locale.ROOT));
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
     * Projects only learner-relevant curriculum identity.
     *
     * <p>The canonical summary also carries maintainer descriptions, filter inventories and
     * compatibility flags. Those fields are useful to first-party configuration surfaces, but
     * they are neither learning content nor Claude control data. Keeping them out here prevents
     * quality-level, CI/QA and configuration terminology from reaching an ordinary learner
     * response through an otherwise innocent context summary.</p>
     */
    Map<String, Object> projectCurriculum(LandscapeSummary curriculum) {
        if (curriculum == null) {
            return Map.of();
        }
        Map<String, Object> projected = new LinkedHashMap<>();
        putIfPresent(projected, "title", curriculum.getTitle());
        return projected;
    }

    /**
     * Publishes the already completed Personal-Curriculum choices as localized labels only.
     *
     * <p>This gives the coach the learner's actual subject/stage context without leaking the
     * opaque option, rewind, landscape, filter or scope identifiers used by the authored setup
     * protocol. The connector remains read-only for Level-2 configuration.</p>
     */
    List<Map<String, Object>> projectLearningContext(PersonalizationPlan plan, String language) {
        if (plan == null) {
            return List.of();
        }
        List<Map<String, Object>> projected = new java.util.ArrayList<>();
        for (PersonalizationPlan.CompletedDecision decision : plan.completedDecisions()) {
            addLearningContextDecision(
                    projected,
                    localized(language, decision.groupLabel(), decision.groupLabelEn()),
                    decision.selectedOptions(),
                    language);
        }
        for (PersonalizationPlan.DecisionSummary decision : plan.preservedDecisions()) {
            addLearningContextDecision(
                    projected,
                    localized(language, decision.groupLabel(), decision.groupLabelEn()),
                    decision.selectedOptions(),
                    language);
        }
        return List.copyOf(projected);
    }

    private void addLearningContextDecision(
            List<Map<String, Object>> target,
            String label,
            List<PersonalizationPlan.Option> options,
            String language) {
        if (label == null || options == null) {
            return;
        }
        List<String> values = options.stream()
                .filter(Objects::nonNull)
                .filter(option -> option.kind() != PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                .map(option -> localizedOptionLabel(language, option))
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (!values.isEmpty()) {
            target.add(Map.of("label", label, "values", values));
        }
    }

    private String localizedOptionLabel(String language, PersonalizationPlan.Option option) {
        String localizedScope = localized(language, option.scopeLabel(), option.scopeLabelEn());
        if (localizedScope != null) {
            return localizedScope;
        }
        String localizedFilter = localized(language, option.filterLabel(), option.filterLabelEn());
        if (localizedFilter != null) {
            return localizedFilter;
        }
        return localized(language, option.landscapeLabel(), option.landscapeLabelEn());
    }

    private String localized(String language, String germanOrDefault, String english) {
        String selected = language != null && language.toLowerCase(java.util.Locale.ROOT).startsWith("en")
                ? english
                : germanOrDefault;
        if (selected == null || selected.isBlank()) {
            selected = germanOrDefault;
        }
        return selected == null || selected.isBlank() ? null : selected;
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

    private void putIfPresent(Map<String, Object> target, String key, String value) {
        if (value != null && !value.isBlank()) {
            target.put(key, value);
        }
    }

    private String publicAssetUrl(String path) {
        if (path == null) {
            return null;
        }
        String normalized = path.trim();
        if (!normalized.startsWith(GOAL_VISUALIZATION_ASSET_PREFIX)
                || normalized.contains("..")
                || normalized.contains("\\")
                || normalized.contains("%")
                || normalized.contains("?")
                || normalized.contains("#")) {
            return null;
        }
        return publicBaseUrl + normalized;
    }

    private String cockpitUrl(String curriculumId, String goalId) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        StringBuilder url = new StringBuilder(publicBaseUrl).append("/?");
        if (curriculumId != null && !curriculumId.isBlank()) {
            url.append("l=").append(queryValue(curriculumId)).append('&');
        }
        return url.append("goal=").append(queryValue(goalId)).toString();
    }

    private String queryValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String bounded(String value, int maxLength) {
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private String normalizePublicBaseUrl(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty()) {
            return "https://skillpilot.com";
        }
        return normalized.replaceAll("/+$", "");
    }
}
