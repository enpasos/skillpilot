package com.skillpilot.backend.connectors.gemini.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Contract;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/** Native MCP envelope checks; actual Gemini display is a separate host test. */
class GeminiV1NativeImageResultTest {
    private static final String SESSION = "spg_" + "A".repeat(43);
    private static final String LEARNER = "internal-test-learner";
    private static final String GOAL = "active-image-goal";
    private static final String IMAGE = "https://skillpilot.com/assets/goal-visualizations/approved.png";
    private final ObjectMapper mapper = new ObjectMapper();
    private final CoachToolFacade facade = mock(CoachToolFacade.class);
    private final GeminiV1CoachContextProjector projector = mock(GeminiV1CoachContextProjector.class);
    private final GeminiV1SessionCoordinator coordinator = mock(GeminiV1SessionCoordinator.class);
    private GeminiV1McpContractAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new GeminiV1McpContractAdapter(facade, projector, coordinator,
                mock(GeminiV1CapabilityService.class), new GeminiV1Telemetry(),
                new GeminiV1Properties(), mapper);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "spga-test-connection", "unused",
                List.of(new SimpleGrantedAuthority("SCOPE_" + GeminiV1Contract.SCOPE_READ))));
        when(coordinator.read(eq(SESSION), any())).thenAnswer(invocation -> {
            Function<GeminiV1SessionCoordinator.ReadContext, Object> operation = invocation.getArgument(1);
            return new GeminiV1SessionCoordinator.Outcome<>(operation.apply(
                    new GeminiV1SessionCoordinator.ReadContext("private-binding", LEARNER, 10L, "de")), 10L);
        });
        when(projector.projectContext(LEARNER, 10L, "de"))
                .thenReturn(Map.of("goalVisualization", visualization()));
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rendererKeepsFirstJsonAndStructuredResultAndAddsAnActionableImageText() throws Exception {
        McpSchema.CallToolResult result = render(GOAL, 10L);
        assertThat(result.isError()).isFalse();
        assertThat(result.meta()).isNullOrEmpty();
        assertThat(result.content()).hasSize(2);
        Map<String, Object> first = mapper.readValue(
                ((McpSchema.TextContent) result.content().getFirst()).text(), new TypeReference<>() {});
        assertThat(first).isEqualTo(Map.of("goalVisualization", visualization()));
        assertThat(result.structuredContent()).isEqualTo(first);
        String presentation = ((McpSchema.TextContent) result.content().get(1)).text();
        assertThat(presentation).contains("![Approved image](<" + IMAGE + ">)",
                "[Lernzielbild öffnen](<" + IMAGE + ">)", "visible reply now")
                .doesNotContain(SESSION, LEARNER, GOAL, "private-binding");
        verifyNoInteractions(facade);
    }

    @Test
    void staleOrDifferentGoalProducesNoImagePresentation() {
        for (McpSchema.CallToolResult result : List.of(render(GOAL, 9L), render("other-goal", 10L))) {
            assertThat(result.isError()).isTrue();
            assertThat(result.structuredContent()).isNull();
            assertThat(result.content()).hasSize(1);
            assertThat(result.content().toString()).doesNotContain(IMAGE, "![", "visible reply now");
        }
        verifyNoInteractions(facade);
    }

    @Test
    void unexpectedUnapprovedImageCannotBecomeAnActionableLink() {
        when(projector.projectContext(LEARNER, 10L, "de")).thenReturn(Map.of("goalVisualization",
                Map.of("goalId", GOAL, "imageUrl", "javascript:alert(1)", "altText", "Image")));
        McpSchema.CallToolResult result = render(GOAL, 10L);
        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("CONFLICT").doesNotContain("javascript", "![");
        assertThat(result.structuredContent()).isNull();
    }

    private McpSchema.CallToolResult render(String goal, long version) {
        var tool = adapter.toolSpecifications().stream().filter(spec ->
                GeminiV1Contract.TOOL_RENDER_GOAL_VISUALIZATION.equals(spec.tool().name()))
                .findFirst().orElseThrow();
        return tool.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(
                GeminiV1Contract.TOOL_RENDER_GOAL_VISUALIZATION,
                Map.of("learningSessionId", SESSION, "goalId", goal, "expectedStateVersion", version,
                        "language", "en")));
    }

    private Map<String, Object> visualization() {
        return Map.of("goalId", GOAL, "title", "Learning goal", "imageUrl", IMAGE,
                "altText", "Approved image", "cockpitUrl", "https://skillpilot.com/?goal=" + GOAL);
    }
}
