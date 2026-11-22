package preview;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.SkillpilotApplication;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CompletionContractRegistry;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.LearnerLearningPlanService;
import com.skillpilot.backend.service.LearnerService;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/** Standalone, one-shot QA entry point compiled by the local preview script only. */
public final class HesseE1GradedPreview {
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    // These are hypotheses from the subject review. Query the real frontier for each distinct goal.
    private static final List<String> SUCCESSORS = List.of("31a2ef52-114b-4d2c-a720-6ef5a390b6dc",
            "32b896b9-f2f1-4d4e-96ad-e869ac3d3759", "d03f1cb6-c224-53db-ad91-76cc7827978d");
    private final ObjectMapper mapper;
    private final LearnerService learners;
    private final LearnerLearningPlanService plans;
    private final ClaudeV1LearningSessionService sessions;
    private final ClaudeV1McpContractAdapter adapter;

    private HesseE1GradedPreview(ConfigurableApplicationContext spring) {
        mapper = spring.getBean(ObjectMapper.class);
        learners = spring.getBean(LearnerService.class);
        plans = spring.getBean(LearnerLearningPlanService.class);
        sessions = spring.getBean(ClaudeV1LearningSessionService.class);
        adapter = spring.getBean(ClaudeV1McpContractAdapter.class);
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 0) throw new IllegalArgumentException("Preview takes no command-line overrides");
        var config = new ObjectMapper().readTree(System.getenv("SPRING_APPLICATION_JSON"));
        if (!"127.0.0.1".equals(config.path("server.address").asText())
                || !"jdbc:h2:mem:hesse-e1;DB_CLOSE_DELAY=-1;NON_KEYWORDS=VALUE".equals(config.path("spring.datasource.url").asText())) {
            throw new IllegalArgumentException("Graded preview requires a loopback server and its disposable H2 database");
        }
        var spring = SpringApplication.run(SkillpilotApplication.class);
        try {
            // The parent creates new profiles through the UI API and closes this pipe once.
            var preview = new HesseE1GradedPreview(spring);
            byte[] input = System.in.readNBytes(8193);
            if (input.length > 8192) throw new IllegalArgumentException("Too many preview profiles");
            var profiles = preview.mapper.readTree(input);
            var states = new LinkedHashMap<String, Object>();
            var seen = new HashSet<UUID>();
            for (String duration : List.of("G8", "G9")) {
                var group = profiles.required(duration);
                for (String scenario : List.of("viewer", "CD", "ABCD", "unitOpen", "unitCD", "unitABCD", "mixed", "oriented", "parentOriented")) {
                    UUID id = UUID.fromString(group.required(scenario).asText());
                    if (!seen.add(id)) throw new IllegalArgumentException("Each scenario needs a fresh learner");
                    try {
                        states.put(duration + "/" + scenario, preview.prepare(id.toString(), group.required("E1").asText(), scenario));
                    } catch (Exception failure) {
                        throw new IllegalStateException(duration + "/" + scenario + ": " + failure.getMessage(), failure);
                    }
                }
            }
            Path pending = Path.of("grading-pending.json");
            preview.mapper.writeValue(pending.toFile(), states);
            Files.move(pending, Path.of("grading.json"), StandardCopyOption.ATOMIC_MOVE);
        } catch (Exception failure) {
            System.err.println("Graded preview failed: " + failure);
            spring.close();
            throw failure;
        }
    }

    private Map<String, Object> prepare(String id, String section, String scenario) throws Exception {
        var initial = learners.getLearnerState(id).levelCompletion().unitAssessment();
        if (!section.equals(initial.sectionGoalId()) || initial.parts().size() != 4
                || initial.parts().stream().anyMatch(part -> part.passed()) || learners.getMastery(id).values().stream().anyMatch(value -> value > 0)) {
            throw new IllegalStateException("Expected an untouched four-part E.1 viewer");
        }
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Berlin"));
        var monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        boolean unitAssignment = scenario.startsWith("unit") || scenario.equals("mixed");
        var blocks = new ArrayList<LearnerLearningPlanApi.Block>();
        if (unitAssignment) {
            learners.setPreferences(id, null, null, null, null, true);
            var option = learners.getUnitAssignmentOptions(id, PHYSICS).stream()
                    .filter(item -> section.equals(item.sectionGoalId())).findFirst().orElseThrow();
            blocks.add(new LearnerLearningPlanApi.Block("motion-unit", "learning", null, "Einheitenauftrag E.1",
                    monday, monday.plusDays(6), null, option.parts().stream().map(part -> part.goalId()).toList(),
                    List.of(section), true, option.binding()));
            if (scenario.equals("mixed")) {
                String goal = "ae67bcf1-f3ee-50d6-9a12-25a159dff659";
                blocks.add(new LearnerLearningPlanApi.Block("individual", "learning", goal, "Einzelauftrag Weg-Zeit-Diagramme",
                        monday, monday.plusDays(6), null, List.of(goal), List.of(goal), true));
            }
        } else {
            var atoms = learners.resolveLearningPlanGoalIds(id, PHYSICS, List.of(section));
            blocks.add(new LearnerLearningPlanApi.Block("motion", "learning", null, "Einzelziele E.1", monday,
                    monday.plusDays(6), null, atoms, List.of(section), true));
        }
        plans.upsert(id, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, unitAssignment ? "Einheitenauftrag E.1" : "Einzelziele E.1", blocks), today);
        if (scenario.equals("oriented") || scenario.equals("parentOriented")) {
            learners.chooseLevelCompletion(id, new LevelCompletionActionRequest("leaveProfile", null, null, null, revision(id)));
            var parentOpening = "a4d4efe1-7d30-526b-ac9c-806113da4363";
            var orientations = scenario.equals("oriented")
                    ? List.of(parentOpening, "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e") : List.of(parentOpening);
            for (String goal : orientations) completeOrientation(id, goal);
            learners.setPlannedGoals(id, Set.of(section));
            var saved = learners.getMastery(id).entrySet().stream()
                    .filter(entry -> entry.getValue() > 0).map(Map.Entry::getKey).collect(java.util.stream.Collectors.toSet());
            if (!saved.equals(Set.copyOf(orientations))) throw new IllegalStateException("Unexpected results for the return profile");
            return Map.of("completedOpenings", orientations);
        }
        String parts = switch (scenario) {
            case "CD", "unitCD" -> "CD";
            case "ABCD", "unitABCD", "mixed" -> "ABCD";
            default -> "";
        };
        if (!parts.isEmpty()) {
            for (char part : parts.toCharArray()) {
                grade(id, section, initial.parts().get("ABCD".indexOf(part)).goalId());
            }
            learners.chooseLevelCompletion(id, new LevelCompletionActionRequest("selectProfile", "automatic:" + section,
                    null, null, revision(id)));
        }
        if (unitAssignment) {
            // Return to the ordinary plan through the published route exit.
            learners.chooseLevelCompletion(id, new LevelCompletionActionRequest("leaveProfile", null, null, null, revision(id)));
        }
        var inScope = learners.getLearningPlanCompletionContext(id).canonicalGoals();
        var targeted = offeredSuccessors(id, inScope);
        boolean strictAtStart = Boolean.TRUE.equals(learners.getLearner(id).getStrictMode());
        List<Map<String, Object>> strictTargets;
        try {
            learners.setPreferences(id, null, null, true);
            strictTargets = offeredSuccessors(id, inScope);
        } finally {
            learners.setPreferences(id, null, null, strictAtStart);
        }
        var frontier = learners.getFrontier(id).stream().map(goalId ->
                Map.of("id", goalId, "title", inScope.get(goalId).getTitle())).toList();
        var plan = plans.getPlan(id, PHYSICS, today);
        var next = plan.nextEligibleGoal();
        var status = plans.getTodayStatus(id, "de").subjects().stream()
                .filter(subject -> subject.landscapeIds().contains(PHYSICS)).findFirst().orElseThrow();
        var unit = learners.getLearnerState(id).levelCompletion().unitAssessment();
        var result = new LinkedHashMap<String, Object>();
        result.put("targetedFrontier", targeted);
        result.put("strictTargetedFrontier", strictTargets);
        result.put("frontier", frontier);
        result.put("passed", unit.parts().stream().filter(part -> part.passed()).count());
        result.put("credited", unit.planningCreditGoalIds().size());
        result.put("individuallyOpen", unit.individuallyOpenGoalIds().size());
        result.put("planPositionCount", status.periodGauge() == null ? null : status.periodGauge().target());
        result.put("completed", status.periodGauge() == null ? null : status.periodGauge().completed());
        result.put("next", next == null ? "" : inScope.get(next.goalId()).getTitle());
        result.put("asOf", today.toString());
        if (unitAssignment) result.put("unitAssignments", status.unitAssignments());
        return result;
    }

    private List<Map<String, Object>> offeredSuccessors(String id, Map<String, LearningGoal> graph) {
        var targeted = new ArrayList<Map<String, Object>>();
        for (String candidate : SUCCESSORS) {
            boolean offered = learners.getUncompactedRichFrontierForFocus(id, List.of(candidate)).stream()
                    .anyMatch(goal -> goal.id().equals(candidate));
            targeted.add(Map.of("id", candidate, "title", graph.get(candidate).getTitle(), "offered", offered));
        }
        return targeted;
    }

    private long revision(String id) {
        return learners.getLearnerState(id).levelCompletion().learnerRevision();
    }

    private void completeOrientation(String id, String goal) throws Exception {
        learners.setPlannedGoals(id, Set.of(goal));
        learners.setActiveGoal(id, goal);
        String session = sessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start", null)).learningSessionId();
        authenticatePreview(session);
        try {
            var context = call(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
            if (context.has("completionContract")) {
                call(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability",
                        context.required("completionContract").required("receiptCapability").asText()));
                context = call(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
            }
            var opening = context.required("activeGoalContext").required("unitIntroduction");
            if (!goal.equals(opening.required("orientationGoalId").asText()) || !"orientation".equals(opening.required("state").asText())) {
                throw new IllegalStateException("Expected an active unit orientation");
            }
            // This disposable return profile represents a learner who accepted the coach's closing offer.
            call(session, ClaudeV1Contract.TOOL_SET_MASTERY, Map.of("goalId", goal,
                    "clientRequestId", UUID.randomUUID().toString(), "expectedStateVersion", revision(id)));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private static void authenticatePreview(String session) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, null, List.of(
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }

    private void grade(String id, String section, String goal) throws Exception {
        String session = sessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start",
                new CompletionAssessmentStart("automatic:" + section, goal, revision(id)))).learningSessionId();
        // Only the calling thread simulates a local authenticated coach for this particular learning session.
        authenticatePreview(session);
        try {
            var context = call(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
            if (context.has("completionContract")) {
                call(session, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability",
                        context.required("completionContract").required("receiptCapability").asText()));
            }
            var evaluation = call(session, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", goal));
            int points = evaluation.required("scoring").required("passingPoints").intValue();
            call(session, ClaudeV1Contract.TOOL_SET_MASTERY, Map.of("goalId", goal, "earnedPoints", points,
                    "evaluationCapability", evaluation.required("evaluationCapability").asText(),
                    "clientRequestId", UUID.randomUUID().toString(), "expectedStateVersion", revision(id)));
            var choices = call(session, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()).required("levelCompletion").required("choices");
            String normal = choices.valueStream().map(JsonNode::asText)
                    .filter(label -> label.startsWith("Zur normalen Lernansicht")).findFirst().orElseThrow();
            call(session, "choose_skillpilot_completion_route", Map.of("choice", normal,
                    "clientRequestId", UUID.randomUUID().toString(), "expectedStateVersion", revision(id)));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private JsonNode call(String session, String tool, Map<String, Object> args) throws Exception {
        var request = new LinkedHashMap<>(args);
        request.put("learningSessionId", session);
        request.put("language", "de");
        var spec = adapter.toolSpecifications().stream().filter(item -> item.tool().name().equals(tool)).findFirst().orElseThrow();
        var result = spec.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, request));
        var content = mapper.readTree(((McpSchema.TextContent) result.content().getFirst()).text());
        if (Boolean.TRUE.equals(result.isError())) {
            throw new IllegalStateException(tool + " rejected preview action for " + args.getOrDefault("goalId", "navigation")
                    + ": " + content.path("errorCode").asText() + " " + content.path("message").asText());
        }
        return content;
    }
}
