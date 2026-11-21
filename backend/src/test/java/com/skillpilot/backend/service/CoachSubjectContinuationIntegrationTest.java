package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CompletionContractRegistry;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1McpContractAdapter;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionService;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.*;
import java.util.*;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

/** Real provider handlers/session coordinators, canonical graph and persisted learner results. */
@SpringBootTest(properties = {
    ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
    ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
    GeminiV1TestProperties.ENABLED, GeminiV1TestProperties.SIGNING_SECRET,
    GeminiV1TestProperties.CAPABILITY_SECRET, GeminiV1TestProperties.GATEWAY_SECRET,
    GeminiV1TestProperties.GATEWAY_AUDIENCE,
    "skillpilot.openai.coach.v1.enabled=true", "skillpilot.openai.coach.v1.writes-enabled=true",
    "skillpilot.openai.coach.v1.oauth.enabled=true", "skillpilot.openai.coach.v1.mcp.enabled=true",
    "skillpilot.openai.coach.v1.security.secure-mode=true",
    "skillpilot.openai.coach.v1.oauth.client-id=subject-navigation-test-client",
    "skillpilot.openai.coach.v1.oauth.client-secret=subject-navigation-client-secret-0123456789",
    "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/subject-test-callback",
    "skillpilot.security.signing-secret=subject-navigation-signing-secret-0123456789",
    "skillpilot.completion.unit-assessment-pilot-enabled=true",
    "spring.datasource.url=jdbc:h2:mem:coach-subject-navigation;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
    "spring.jpa.show-sql=false"
})
@ActiveProfiles("test")
class CoachSubjectContinuationIntegrationTest {
    static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    static final String FREE_FALL = "09029573-864f-40ca-bf8a-cee7bf6dcb73";
    @Autowired LearnerService learners;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LearnerRepository repository;
    @Autowired MasteryRepository mastery;
    @Autowired VerifiedExamPassService passes;
    @Autowired ObjectMapper json;
    @Autowired ClaudeV1McpContractAdapter claude;
    @Autowired GeminiV1McpContractAdapter gemini;
    @Autowired OpenAiDeV1McpContractAdapter openai;
    @Autowired ClaudeV1LearningSessionService claudeSessions;
    @Autowired GeminiV1LearningSessionService geminiSessions;
    @Autowired OpenAiDeCoachConnectionService openaiSessions;
    enum Provider { CLAUDE, OPENAI, GEMINI }
    record Session(Provider provider, String token, String learner) { }
    record Unit(String learner, List<String> parts, UUID planId, long revision) { }

    @AfterEach void reset() {
        SecurityContextHolder.clearContext();
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
    }

    @ParameterizedTest
    @CsvSource({"CLAUDE,false", "CLAUDE,true", "OPENAI,false", "OPENAI,true", "GEMINI,false", "GEMINI,true"})
    void onlyChosenSubjectsArePublishedAndAnUnchosenSubjectCannotBeSwitched(Provider provider, boolean pilot) throws Exception {
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        String id = learner("G9", "GK", false);
        assertThat(learners.getPlanningScope(id, MATH).scopeAtomicGoalIds()).isNotEmpty();
        assertThat(learners.getPersonalCurriculumSubjectIds(id)).containsExactly(PHYSICS);
        Session session = session(provider, id);
        assertThat(context(session).path("learningPlanToday").path("subjects").findValuesAsText("subject")).containsExactly("Physik");
        var original = storedMastery(id);
        assertThat(call(session, "switch_skillpilot_learning_plan_subject", Map.of("subject", "Mathematik"), true).isError()).isTrue();
        assertThat(repository.findById(id).orElseThrow().getActiveGoalId()).isNull();
        JsonNode switched = successful(session, "switch_skillpilot_learning_plan_subject", Map.of("subject", "Physik"), true);
        String active = repository.findById(id).orElseThrow().getActiveGoalId();
        String activeIdKey = provider == Provider.OPENAI ? "goalId" : "id";
        assertThat(switched.path("context").path("activeGoal").path(activeIdKey).asText()).isEqualTo(active);
        assertPhysicsFoundation(id, active);
        assertThat(storedMastery(id)).isEqualTo(original);
    }

    @ParameterizedTest
    @CsvSource({"CLAUDE,false", "CLAUDE,true", "OPENAI,false", "OPENAI,true", "GEMINI,false", "GEMINI,true"})
    void aChosenSecondSubjectRemainsSelectableWithoutItsOwnPlan(Provider provider, boolean pilot) throws Exception {
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        String id = learner("G8", "GK", true);
        Session session = session(provider, id);
        assertThat(context(session).path("learningPlanToday").path("subjects").findValuesAsText("subject"))
                .containsExactlyInAnyOrder("Physik", "Mathematik");
        successful(session, "switch_skillpilot_learning_plan_subject", Map.of("subject", "Mathematik"), true);
        assertThat(learners.getPlanningScope(id, MATH).scopeAtomicGoalIds())
                .contains(repository.findById(id).orElseThrow().getActiveGoalId());
    }

    static Stream<Arguments> pausedCases() {
        return Arrays.stream(Provider.values()).flatMap(provider -> Stream.of(false, true).flatMap(pilot ->
                Stream.of(2, 4).map(count -> Arguments.of(provider, pilot, count,
                        count == 2 ? "G8" : "G9", provider == Provider.CLAUDE ? "GK" : "LK"))));
    }

    @ParameterizedTest
    @MethodSource("pausedCases")
    void pauseKeepsPhysicsAvailableWithoutAnUnrelatedDefault(Provider provider, boolean pilot,
            int count, String duration, String course) throws Exception {
        Unit unit = completedParts(duration, course, count);
        plans.setUnitAssignmentActivity(unit.learner(), unit.planId(),
                new LearnerLearningPlanApi.UnitAssignmentActivity(unit.revision(), "unit", false));
        // Existing, correctly bound assignments can remain stored when the pilot is switched off.
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        boolean strictIndividual = pilot && count == 4 && provider == Provider.CLAUDE;
        if (strictIndividual) learners.setPreferences(unit.learner(), null, false, true);
        var receipts = json.valueToTree(passes.findForGoals(unit.learner(), unit.parts()));
        var original = storedMastery(unit.learner());
        Session session = session(provider, unit.learner());
        JsonNode before = context(session);
        JsonNode today = before.path("learningPlanToday");
        assertThat(today.path("subjects").findValuesAsText("subject")).containsExactly("Physik");
        assertThat(today.path("subjects").get(0).path("canContinue").asBoolean()).isTrue();
        assertThat(today.path("resumeAvailable").asBoolean()).isTrue();
        if (strictIndividual) {
            confirm(session, before);
            JsonNode confirmed = context(session);
            assertThat(confirmed.path("levelCompletion").path("individualPractice")).hasSize(11);
            String choice = confirmed.path("levelCompletion").path("individualPractice").valueStream()
                    .filter(item -> item.path("choice").asText().contains("Freier Fall experimentell untersuchen"))
                    .findFirst().orElseThrow().path("choice").asText();
            successful(session, "choose_skillpilot_completion_route", Map.of("choice", choice), true);
            String active = repository.findById(unit.learner()).orElseThrow().getActiveGoalId();
            assertThat(active).isNotEqualTo(FREE_FALL);
            assertThat(learners.getPlanningScope(unit.learner(), MATH).scopeAtomicGoalIds()).contains(active);
            assertThat(requires(FREE_FALL, active, learners.getLearningPlanCompletionContext(unit.learner()).canonicalGoals(), new HashSet<>()))
                    .as("The mathematical start after pausing really prepares the chosen free-fall experiment").isTrue();
        } else {
            successful(session, "resume_skillpilot_learning_plan", Map.of(), true);
            assertPhysicsFoundation(unit.learner(), repository.findById(unit.learner()).orElseThrow().getActiveGoalId());
        }
        assertThat(repository.findById(unit.learner()).orElseThrow().getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(storedMastery(unit.learner())).isEqualTo(original);
        assertThat(json.<JsonNode>valueToTree(passes.findForGoals(unit.learner(), unit.parts()))).isEqualTo(receipts);
    }

    private String learner(String duration, String course, boolean mathematics) throws Exception {
        Learner l = learners.createLearner(); l.setSelectedCurriculum(ROOT);
        l.setFollowLearningPlans(true); l.setAutoPilot(false); l.setStrictMode(true);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", duration));
        config.put(PHYSICS, Map.of("selected", true, "filterId", course));
        if (mathematics) config.put(MATH, Map.of("selected", true, "filterId", "GK"));
        config.put("__skillpilotPersonalizationFlow", Map.of("rootLandscapeId", ROOT, "completedOptionIds", List.of(), "migrationCompleted", true));
        l.setPersonalCurriculum(json.writeValueAsString(config)); repository.saveAndFlush(l);
        return l.getSkillpilotId();
    }
    private Unit completedParts(String duration, String course, int count) throws Exception {
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        String id = learner(duration, course, false); learners.setPreferences(id, null, false, false);
        String section = "composition:de-he-gym-sekii-physics-" + course.toLowerCase(Locale.ROOT) + ":structure:physics-e1-motion";
        learners.setPlannedGoals(id, Set.of(section));
        var option = learners.getUnitAssignmentOptions(id, PHYSICS).stream().filter(x -> section.equals(x.sectionGoalId())).findFirst().orElseThrow();
        var parts = option.parts().stream().map(LearnerLearningPlanApi.UnitAssignmentPart::goalId).toList();
        var day = LocalDate.now(ZoneId.of("Europe/Berlin"));
        var monday = day.with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        var block = new LearnerLearningPlanApi.Block("unit", "learning", null, "E.1", monday, monday.plusDays(6), null, parts, List.of(section), true, option.binding());
        var plan = plans.upsert(id, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(block)), day);
        for (int index : List.of(2, 3, 0, 1).subList(0, count)) grade(id, section, parts.get(index));
        learners.chooseLevelCompletion(id, new LevelCompletionActionRequest("selectProfile", "automatic:" + section, null, null, version(id)));
        for (String action : List.of("pauseProfile", "leaveProfile")) learners.chooseLevelCompletion(id, new LevelCompletionActionRequest(action, null, null, null, version(id)));
        learners.setPlannedGoals(id, Set.of());
        return new Unit(id, parts, plan.planId(), plan.revision());
    }
    private void grade(String id, String section, String goal) throws Exception {
        Session s = new Session(Provider.CLAUDE, claudeSessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start",
                new CompletionAssessmentStart("automatic:" + section, goal, version(id)))).learningSessionId(), id);
        confirm(s, context(s));
        JsonNode evaluation = successful(s, ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", goal), false);
        successful(s, ClaudeV1Contract.TOOL_SET_MASTERY, Map.of("goalId", goal,
                "earnedPoints", evaluation.path("scoring").path("passingPoints").asInt(), "evaluationCapability", evaluation.path("evaluationCapability").asText()), true);
        String normal = context(s).path("levelCompletion").path("choices").valueStream().map(JsonNode::asText)
                .filter(choice -> choice.startsWith("Zur normalen Lernansicht")).findFirst().orElseThrow();
        successful(s, "choose_skillpilot_completion_route", Map.of("choice", normal), true);
    }
    private void confirm(Session s, JsonNode c) throws Exception {
        if (c.has("completionContract")) successful(s, ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", c.path("completionContract").path("receiptCapability").asText()), false);
    }
    private Session session(Provider p, String id) {
        return new Session(p, switch (p) {
            case CLAUDE -> claudeSessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
            case GEMINI -> geminiSessions.createFirstPartyLaunch(id, new GeminiV1CoachStartRequest("de", "web-start")).learningSessionId();
            case OPENAI -> openaiSessions.createFirstPartyLaunch(id, new OpenAiDeCoachStartRequest("de", "web-start", null, true, null)).learningSessionId();
        }, id);
    }
    private JsonNode context(Session s) throws Exception {
        return successful(s, s.provider() == Provider.OPENAI ? "get_skillpilot_context" : "get_skillpilot_coach_context", Map.of(), false);
    }
    private JsonNode successful(Session s, String tool, Map<String, Object> input, boolean write) throws Exception {
        var r = call(s, tool, input, write); assertThat(r.isError()).as(tool + " " + r.content()).isNotEqualTo(true);
        return s.provider() == Provider.OPENAI ? json.valueToTree(r.structuredContent())
                : json.readTree(((McpSchema.TextContent) r.content().getFirst()).text());
    }
    private McpSchema.CallToolResult call(Session s, String tool, Map<String, Object> input, boolean write) {
        String scope = s.provider() == Provider.OPENAI ? "skillpilot.openai.v1." : "skillpilot.";
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(s.token(), null,
                List.of(new SimpleGrantedAuthority("SCOPE_" + scope + "read"), new SimpleGrantedAuthority("SCOPE_" + scope + "write"))));
        var args = new LinkedHashMap<>(input); args.put("learningSessionId", s.token());
        if (s.provider() != Provider.OPENAI) args.put("language", "de");
        if (write) { args.put("clientRequestId", UUID.randomUUID().toString()); args.put("expectedStateVersion", version(s.learner())); }
        List<McpStatelessServerFeatures.SyncToolSpecification> specs = switch (s.provider()) {
            case CLAUDE -> claude.toolSpecifications(); case GEMINI -> gemini.toolSpecifications(); case OPENAI -> openai.toolSpecifications();
        };
        return specs.stream().filter(x -> x.tool().name().equals(tool)).findFirst().orElseThrow().callHandler()
                .apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, args));
    }
    private long version(String id) { return learners.getLearner(id).getCoachStateRevision(); }
    private JsonNode storedMastery(String id) {
        var rows = new TreeMap<String, Object>();
        mastery.findByLearner_SkillpilotId(id).forEach(x -> rows.put(x.getGoalKey(), Map.of("value", x.getValue(), "at", x.getUpdatedAt())));
        return json.valueToTree(rows);
    }
    private void assertPhysicsFoundation(String id, String active) {
        assertThat(active).isNotBlank();
        var graph = learners.getLearningPlanCompletionContext(id).canonicalGoals();
        var ownSeeds = learners.getLearnerLandscapeClosure(id, ROOT, "de").stream()
                .filter(landscape -> PHYSICS.equals(landscape.getLandscapeId())).findFirst().orElseThrow()
                .getPersonalCurriculumProjection().seedAtomicGoalIds();
        assertThat(ownSeeds.stream()
                .anyMatch(target -> requires(target, active, graph, new HashSet<>())))
                .as("The started atom is an own reviewed physics seed or its actual canonical prerequisite").isTrue();
    }
    private boolean requires(String goal, String prerequisite, Map<String, LearningGoal> graph, Set<String> visited) {
        if (goal.equals(prerequisite)) return true;
        if (!visited.add(goal)) return false;
        var entry = graph.get(goal);
        if (entry == null || entry.getRequires() == null) return false;
        return entry.getRequires().stream().map(ref -> graph.containsKey(ref) ? ref : ref.substring(ref.lastIndexOf(':') + 1))
                .anyMatch(ref -> requires(ref, prerequisite, graph, visited));
    }
}
