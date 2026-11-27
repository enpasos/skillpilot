package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.LearnerAiController;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Contract;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1McpContractAdapter;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionService;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachStartRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeSecureOAuthTestServer;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** Real native handlers and canonical selection; OpenAI app authentication alone is substituted. */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        GeminiV1TestProperties.ENABLED, GeminiV1TestProperties.SIGNING_SECRET,
        GeminiV1TestProperties.CAPABILITY_SECRET, GeminiV1TestProperties.GATEWAY_SECRET,
        GeminiV1TestProperties.GATEWAY_AUDIENCE,
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.coach.v1.enabled=true", "skillpilot.openai.coach.v1.server-build=test-build",
        "skillpilot.openai.coach.v1.writes-enabled=true", "skillpilot.openai.coach.v1.mcp.enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/callback",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-openai.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-openai.skillpilot.com/mcp",
        "spring.datasource.url=jdbc:h2:mem:voluntary-native-continue;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
class VoluntaryOfferNativeContinueTest {
    @Autowired LearnerService learners;
    @Autowired LearnerAiController legacyCoach;
    @Autowired LearnerRepository rows;
    @Autowired MasteryRepository mastery;
    @Autowired ObjectMapper json;
    @Autowired ClaudeV1McpContractAdapter claude;
    @Autowired ClaudeV1LearningSessionService claudeSessions;
    @Autowired GeminiV1McpContractAdapter gemini;
    @Autowired GeminiV1LearningSessionService geminiSessions;
    @Autowired OpenAiDeV1McpContractAdapter openai;
    @Autowired OpenAiDeCoachConnectionService openaiSessions;
    @MockitoBean OpenAiDeCoachIdentityResolver openaiIdentity;

    @DynamicPropertySource
    static void secureOpenAiProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @AfterEach
    void clearAuthentication() { SecurityContextHolder.clearContext(); }

    @ParameterizedTest
    @ValueSource(strings = {"claude", "openai", "gemini"})
    void autopilotCompletionAndPlainContinueNeverChooseAnUnselectedOfferInTheNativeLane(String lane) throws Exception {
        String id = learnerWithPhysics(true);
        learners.setPlannedGoals(id, Set.of(MIXED));
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED)))
                .filteredOn(goal -> ARROW.equals(goal.id())).singleElement().matches(FrontierGoal::voluntaryStudy);
        learners.setActiveGoal(id, TEMPERATURE);

        String session;
        List<McpStatelessServerFeatures.SyncToolSpecification> tools;
        String contextTool;
        String masteryTool;
        List<SimpleGrantedAuthority> authorities;
        if (lane.equals("claude")) {
            session = claudeSessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
            tools = claude.toolSpecifications();
            contextTool = ClaudeV1Contract.TOOL_GET_COACH_CONTEXT;
            masteryTool = ClaudeV1Contract.TOOL_SET_MASTERY;
            authorities = scopes(ClaudeV1Contract.SCOPE_READ, ClaudeV1Contract.SCOPE_WRITE);
        } else if (lane.equals("gemini")) {
            session = geminiSessions.createFirstPartyLaunch(id, new GeminiV1CoachStartRequest("de", "web-start")).learningSessionId();
            tools = gemini.toolSpecifications();
            contextTool = GeminiV1Contract.TOOL_GET_COACH_CONTEXT;
            masteryTool = GeminiV1Contract.TOOL_SET_MASTERY;
            authorities = scopes(GeminiV1Contract.SCOPE_READ, GeminiV1Contract.SCOPE_WRITE);
        } else {
            session = openaiSessions.createFirstPartyLaunch(id,
                    new OpenAiDeCoachStartRequest("de", "web-start", ROOT, true, null)).learningSessionId();
            when(openaiIdentity.resolveSkillpilotId(any(), anyString())).thenReturn(id);
            tools = openai.toolSpecifications();
            contextTool = OpenAiDeV1McpContractAdapter.GET_CONTEXT;
            masteryTool = OpenAiDeV1McpContractAdapter.SET_MASTERY;
            authorities = scopes(OpenAiDeV1McpContractAdapter.READ_SCOPE, OpenAiDeV1McpContractAdapter.WRITE_SCOPE);
        }
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(session, "unused", authorities));
        call(tools, contextTool, Map.of("learningSessionId", session, "language", "de"));
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isEqualTo(TEMPERATURE);

        var completion = new LinkedHashMap<String, Object>();
        completion.put("learningSessionId", session);
        if (!lane.equals("openai")) completion.put("language", "de");
        completion.put("expectedStateVersion", rows.findById(id).orElseThrow().getCoachStateRevision());
        completion.put("clientRequestId", UUID.randomUUID().toString());
        completion.put("goalId", TEMPERATURE);
        // No offer or successor choice is supplied to this native completion write.
        call(tools, masteryTool, completion);
        assertThat(learners.getMastery(id)).containsEntry(TEMPERATURE, 1.0).doesNotContainKey(ARROW);
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isNull();
        // A plain continuation refreshes the same context with no goal selector.
        call(tools, contextTool, Map.of("learningSessionId", session, "language", "de"));
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isNull();
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED)))
                .filteredOn(goal -> ARROW.equals(goal.id())).singleElement().matches(FrontierGoal::voluntaryStudy);
    }

    @Test
    void nativeClaudeCanStartAndKeepAnOfferedPrerequisiteOfTheSelectedOffer() throws Exception {
        String id = learnerWithPhysics(false);
        learners.setPlannedGoals(id, Set.of(ARROW_TASK));
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(ARROW_TASK)))
                .extracting(FrontierGoal::id).contains(ARROW).doesNotContain(ARROW_TASK);

        String session = claudeSessions.createFirstPartyLaunch(id, new ClaudeV1CoachStartRequest("de", "web-start"))
                .learningSessionId();
        var authorities = scopes(ClaudeV1Contract.SCOPE_READ, ClaudeV1Contract.SCOPE_WRITE);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(session, "unused", authorities));
        var tools = claude.toolSpecifications();
        call(tools, ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of("learningSessionId", session, "language", "de"));
        call(tools, ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL, Map.of(
                "learningSessionId", session, "language", "de", "goalId", ARROW,
                "expectedStateVersion", rows.findById(id).orElseThrow().getCoachStateRevision(),
                "clientRequestId", UUID.randomUUID().toString()));

        assertThat(learners.getCoachLearnerState(id).activeGoal()).extracting(FrontierGoal::id).isEqualTo(ARROW);
        assertThat(learners.getLearnerState(id).activeGoal()).extracting(FrontierGoal::id).isEqualTo(ARROW);
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isEqualTo(ARROW);
        assertThat(learners.getPlannedGoals(id)).containsExactly(ARROW_TASK);
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
    }

    @Test
    void legacyCoachBareMasteryCannotChooseOrCompleteAnOffer() throws Exception {
        String id = learnerWithPhysics(false);
        learners.setPlannedGoals(id, Set.of(MIXED));
        var before = learners.getCoachLearnerState(id);
        assertThat(before.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(before.stateMachine().goalOptions()).extracting(FrontierGoal::id).contains(ARROW);
        long version = rows.findById(id).orElseThrow().getCoachStateRevision();

        var rejected = legacyCoach.setMastery(id, new MasteryUpdateRequest(Map.of(ARROW, 1.0), ARROW));

        assertThat(rejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        var after = rows.findById(id).orElseThrow();
        assertThat(after.getActiveGoalId()).isNull();
        assertThat(after.getCoachStateRevision()).isEqualTo(version);
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
    }

    private String learnerWithPhysics(boolean autoPilot) throws Exception {
        var learner = new Learner();
        String id = "offer-native-" + UUID.randomUUID();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setAutoPilot(autoPilot);
        learner.setStrictMode(false);
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                MATH, Map.of("selected", false),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learner = rows.saveAndFlush(learner);
        mastery.saveAndFlush(new Mastery(learner, INTRO, 1.0));
        return id;
    }

    private static List<SimpleGrantedAuthority> scopes(String read, String write) {
        return List.of(new SimpleGrantedAuthority("SCOPE_" + read), new SimpleGrantedAuthority("SCOPE_" + write));
    }

    private static void call(List<McpStatelessServerFeatures.SyncToolSpecification> tools, String tool, Map<String, Object> arguments) {
        var specification = tools.stream().filter(spec -> tool.equals(spec.tool().name())).findFirst().orElseThrow();
        var result = specification.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, arguments));
        assertThat(result.isError()).as("%s: %s", tool, result.content()).isFalse();
    }
}
