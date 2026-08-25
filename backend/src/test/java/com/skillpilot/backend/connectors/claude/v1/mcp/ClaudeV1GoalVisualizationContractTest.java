package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1GoalVisualizationContractTest {

    private static final long STATE_VERSION = 10L;
    private static final String GOAL_ID = "visual-goal";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1LearningSessionRepository connectionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CoachToolFacade coachToolFacade;

    private String learningSessionId;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository,
                connectionRepository,
                STATE_VERSION);
        learningSessionId = bound.connectionId();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                bound.connectionId(),
                "unused",
                List.of(new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ))));
        when(coachToolFacade.getLearnerState(bound.learnerId())).thenReturn(visualState());
        when(coachToolFacade.getPersonalizationPlan(bound.learnerId()))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(coachToolFacade.showGoalVisualizationsInChat(bound.learnerId())).thenReturn(true);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void freshContextRequiresTheRenderAndTwoAuthorizedCallsBothReturnTheUiPayload() throws Exception {
        McpSchema.CallToolResult contextResult = call(
                ClaudeV1Contract.TOOL_GET_COACH_CONTEXT,
                Map.of("language", "en"));
        Map<String, Object> context = payload(contextResult);

        assertThat(context)
                .containsEntry("stateVersion", (int) STATE_VERSION)
                .containsKey("goalVisualization")
                .hasEntrySatisfying(
                        "presentationInstruction",
                        instruction -> assertThat(instruction.toString())
                                .contains("previously unseen pair", "immediate next SkillPilot tool"));

        Map<String, Object> renderArguments = Map.of(
                "goalId", GOAL_ID,
                "expectedStateVersion", STATE_VERSION,
                "language", "en");
        McpSchema.CallToolResult first = call(
                ClaudeV1Contract.TOOL_RENDER_GOAL_VISUALIZATION,
                renderArguments);
        McpSchema.CallToolResult explicitReShow = call(
                ClaudeV1Contract.TOOL_RENDER_GOAL_VISUALIZATION,
                renderArguments);

        assertThat(first.isError()).isFalse();
        assertThat(explicitReShow.isError()).isFalse();
        assertThat(first.structuredContent()).isEqualTo(explicitReShow.structuredContent());
        assertThat(map(first.structuredContent()))
                .containsOnlyKeys("goalVisualization")
                .hasEntrySatisfying(
                        "goalVisualization",
                        visualization -> assertThat(map(visualization))
                                .containsEntry("goalId", GOAL_ID)
                                .containsEntry(
                                        "imageUrl",
                                        "https://skillpilot.com/assets/goal-visualizations/visual-goal.png"));
        assertThat(first.meta()).isNull();
        assertThat(explicitReShow.meta()).isNull();
    }

    @Test
    void staleRenderRemainsTextOnlyAndCannotMountAnApp() {
        McpSchema.CallToolResult stale = call(
                ClaudeV1Contract.TOOL_RENDER_GOAL_VISUALIZATION,
                Map.of(
                        "goalId", GOAL_ID,
                        "expectedStateVersion", STATE_VERSION - 1,
                        "language", "en"));

        assertThat(stale.isError()).isTrue();
        assertThat(stale.structuredContent()).isNull();
        assertThat(stale.content().toString()).contains("STALE_STATE");
    }

    private McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        Map<String, Object> sessionArguments = new LinkedHashMap<>(arguments);
        sessionArguments.put("learningSessionId", learningSessionId);
        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> toolName.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, sessionArguments));
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) throws Exception {
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        String json = ((McpSchema.TextContent) result.content().getFirst()).text();
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> map(Object value) {
        return (Map<String, Object>) value;
    }

    private UnifiedLearnerStateResponse visualState() {
        FrontierGoal goal = visualGoal();
        return new UnifiedLearnerStateResponse(
                null,
                curriculum(),
                List.of(goal),
                new LearnerGoals(List.of(goal), 0, 1, null, null, false),
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                goal,
                null);
    }

    private FrontierGoal visualGoal() {
        GoalSourceLink visualization = new GoalSourceLink(
                "goal-visualization",
                "Image",
                "/assets/goal-visualizations/visual-goal.png",
                "image",
                "SkillPilot",
                List.of(),
                null,
                "en",
                null,
                GOAL_ID,
                "primary",
                "A coordinate system for the learning goal.",
                "approved");
        return new FrontierGoal(
                GOAL_ID,
                "Use radians",
                "Understand and apply angles measured in radians.",
                "atomic",
                "tutor",
                "content",
                null,
                List.of(),
                List.of(visualization),
                null,
                null,
                null,
                null,
                false);
    }

    private LandscapeSummary curriculum() {
        return new LandscapeSummary(
                "curriculum-1",
                "Gymnasium (DE)",
                null,
                "DE",
                "ALL",
                "school",
                "Mathematics",
                "en",
                List.of(),
                true,
                true);
    }
}
