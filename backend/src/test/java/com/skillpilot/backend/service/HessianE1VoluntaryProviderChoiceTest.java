package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
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
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.StreamSupport;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest(properties = {
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
        "spring.datasource.url=jdbc:h2:mem:hesse-e1-provider-choice;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class HessianE1VoluntaryProviderChoiceTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String REQUIRED_EXAM = "39f52dcb-ff1d-5cad-9ccb-30da803cfa85";
    private static final String EXAM = "bcc56921-7107-5f5f-b721-3d5e0d7e1cd9";
    private static final String TITLE = "Waagerechter Wurf: Zwei Bewegungen, eine gemeinsame Zeit";
    private static final String VOLUNTARY_PREFIX = "Freiwillig: ";
    // Compact UTF-8 JSON of the regular E.1 choice measured before the title formatter changed.
    private static final String BASE_OPENAI_OPTION = "3775161e0aa7a13161630e88d1c5dbd87feb56ba678b72ad69d995ffd3b6b49c";
    private static final String BASE_GEMINI_CONTEXT = "ec8d3c3e9010761313012c444c542727142e371e0dd861e694988f75a52d48b8";

    @Autowired LearnerService learners;
    @Autowired LearnerRepository rows;
    @Autowired MasteryRepository mastery;
    @Autowired CompositionViewService compositionViews;
    @Autowired ObjectMapper json;
    @Autowired GeminiV1McpContractAdapter gemini;
    @Autowired GeminiV1LearningSessionService geminiSessions;
    @Autowired OpenAiDeV1McpContractAdapter openai;
    @Autowired OpenAiDeCoachConnectionService openaiSessions;
    @MockitoBean OpenAiDeCoachIdentityResolver openaiIdentity;

    @DynamicPropertySource
    static void secureOpenAiProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @ParameterizedTest
    @CsvSource({"openai,true", "openai,false", "gemini,true", "gemini,false"})
    void canonicalE1AssessmentInTheOrdinarySelection(String lane, boolean pilot) throws Exception {
        Object previous = ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String id = learnerAtE1Assessment();
            var state = learners.getCoachLearnerState(id);
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
            assertThat(state.frontier()).filteredOn(goal -> EXAM.equals(goal.id())).singleElement().satisfies(goal -> {
                assertThat(goal.title()).isEqualTo(TITLE);
                assertThat(goal.voluntaryStudy()).isTrue();
            });
            JsonNode choice = "openai".equals(lane) ? openAiChoice(id) : geminiChoice(id);
            String textField = "openai".equals(lane) ? "label" : "title";
            assertThat(choice.path(textField).asText()).isEqualTo(VOLUNTARY_PREFIX + TITLE);
        } finally {
            ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", previous);
            SecurityContextHolder.clearContext();
        }
    }

    private String learnerAtE1Assessment() throws Exception {
        String id = "hesse-e1-provider-choice-" + UUID.randomUUID();
        var learner = new Learner();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setAutoPilot(false);
        learner.setStrictMode(false);
        learner.setFollowLearningPlans(false);
        learner.setUseAssessmentShortcuts(false);
        learner.setPersonalCurriculum(json.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        var saved = rows.saveAndFlush(learner);
        String viewId = (String) compositionViews.findLearnerScopeView(PHYSICS, Map.of(
                "schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII",
                "courseProfile", "GK", "durationModel", "G9")).get("viewId");
        learners.setPlannedGoals(id, Set.of("composition:" + viewId + ":structure:physics-e1-motion"));
        var preparation = learners.getPersonalCurriculumAtomicTargetsByLandscape(id).values().stream()
                .flatMap(List::stream).filter(goalId -> !EXAM.equals(goalId) && !REQUIRED_EXAM.equals(goalId))
                .map(goalId -> new Mastery(saved, goalId, 1.0)).toList();
        mastery.saveAllAndFlush(preparation);
        return id;
    }

    private JsonNode openAiChoice(String id) throws Exception {
        String session = openaiSessions.createFirstPartyLaunch(id,
                new OpenAiDeCoachStartRequest("de", "web-start", ROOT, true, null)).learningSessionId();
        when(openaiIdentity.resolveSkillpilotId(any(), anyString())).thenReturn(id);
        authenticate(session, OpenAiDeV1McpContractAdapter.READ_SCOPE);
        JsonNode context = read(openai.toolSpecifications(), OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of("learningSessionId", session));
        JsonNode choices = context.path("options");
        assertRegularChoice(choices, BASE_OPENAI_OPTION);
        JsonNode choice = assessment(choices, EXAM);
        assertThat(choice.path("goalIds").get(0).asText()).isEqualTo(EXAM);

        JsonNode navigation = read(openai.toolSpecifications(), OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("learningSessionId", session, "target", "goal"));
        JsonNode navigationChoices = navigation.path("options");
        assertRegularChoice(navigationChoices, BASE_OPENAI_OPTION);
        JsonNode navigationChoice = assessment(navigationChoices, EXAM);
        assertThat(navigationChoice.path("label").asText()).isEqualTo(choice.path("label").asText());
        assertThat(navigationChoice.path("goalIds").get(0).asText()).isEqualTo(EXAM);
        return choice;
    }

    private JsonNode geminiChoice(String id) throws Exception {
        String session = geminiSessions.createFirstPartyLaunch(id,
                new GeminiV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate(session, GeminiV1Contract.SCOPE_READ);
        JsonNode choices = read(gemini.toolSpecifications(), GeminiV1Contract.TOOL_GET_COACH_CONTEXT,
                Map.of("learningSessionId", session, "language", "de")).path("frontier");
        assertRegularChoice(choices, BASE_GEMINI_CONTEXT);
        return assessment(choices, EXAM);
    }

    private void authenticate(String session, String readScope) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                session, "unused", List.of(new SimpleGrantedAuthority("SCOPE_" + readScope))));
    }

    private JsonNode read(List<McpStatelessServerFeatures.SyncToolSpecification> suite, String tool,
            Map<String, Object> arguments) throws JsonProcessingException {
        var spec = suite.stream().filter(candidate -> tool.equals(candidate.tool().name())).findFirst().orElseThrow();
        var result = spec.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(tool, arguments));
        assertThat(result.isError()).as("%s: %s", tool, result.content()).isFalse();
        if (result.structuredContent() != null) return json.valueToTree(result.structuredContent());
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        return json.readTree(((McpSchema.TextContent) result.content().getFirst()).text());
    }

    private void assertRegularChoice(JsonNode choices, String baselineDigest) throws Exception {
        assertThat(StreamSupport.stream(choices.spliterator(), false).map(choice -> choice.path("id").asText()).toList())
                .containsExactly(REQUIRED_EXAM, EXAM);
        var required = assessment(choices, REQUIRED_EXAM);
        byte[] compact = json.writeValueAsBytes(required);
        String digest = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(compact));
        assertThat(digest).as("regular E.1 option %s", required).isEqualTo(baselineDigest);
    }

    private JsonNode assessment(JsonNode choices, String assessmentId) {
        var matching = StreamSupport.stream(choices.spliterator(), false)
                .filter(choice -> assessmentId.equals(choice.path("id").asText())).toList();
        assertThat(matching).as("E.1 exam %s in the published choices %s", assessmentId, choices).hasSize(1);
        return matching.getFirst();
    }
}
