package com.skillpilot.backend.connectors.gemini.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Contract;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

/** Native host contract checks; these do not assert that Gemini invoked or displayed a tool. */
class GeminiV1NativeContractTest {
    private final CoachToolFacade facade = mock(CoachToolFacade.class);
    private final GeminiV1SessionCoordinator coordinator = mock(GeminiV1SessionCoordinator.class);
    private GeminiV1McpContractAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new GeminiV1McpContractAdapter(facade, mock(GeminiV1CoachContextProjector.class),
                coordinator, mock(GeminiV1CapabilityService.class), new GeminiV1Telemetry(),
                new GeminiV1Properties(), new ObjectMapper());
    }

    @AfterEach
    void clearAuthentication() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @SuppressWarnings("unchecked")
    void catalogueIsNativeAndStrictWithAllWritesVersioned() {
        assertThat(adapter.resourceSpecifications()).isEmpty();
        assertThat(adapter.toolSpecifications()).hasSize(15);
        assertThat(adapter.toolSpecifications().stream().map(spec -> spec.tool().name()))
                .containsExactlyInAnyOrderElementsOf(GeminiV1Contract.ALL_TOOL_NAMES);
        for (var specification : adapter.toolSpecifications()) {
            McpSchema.Tool tool = specification.tool();
            assertThat(tool.meta()).isNullOrEmpty();
            assertThat(tool.annotations().readOnlyHint())
                    .isEqualTo(GeminiV1Contract.READ_TOOL_NAMES.contains(tool.name()));
            Map<String, Object> schema = (Map<String, Object>) tool.inputSchema();
            assertThat(schema.get("additionalProperties")).isEqualTo(false);
            List<String> required = (List<String>) schema.get("required");
            assertThat(required).contains("learningSessionId");
            Map<String, Object> properties = (Map<String, Object>) schema.get("properties");
            assertThat(properties).doesNotContainKeys("learnerId", "skillpilotId", "answer", "chat",
                    "transcript", "feedback", "clientType", "voiceMode");
            if (GeminiV1Contract.WRITE_TOOL_NAMES.contains(tool.name())) {
                assertThat(required).contains("expectedStateVersion", "clientRequestId");
            }
        }
        Set<String> combined = new java.util.HashSet<>(GeminiV1Contract.READ_TOOL_NAMES);
        combined.addAll(GeminiV1Contract.WRITE_TOOL_NAMES);
        assertThat(combined).containsExactlyInAnyOrderElementsOf(GeminiV1Contract.ALL_TOOL_NAMES);
    }

    @Test
    void readScopeCannotReachAnyCanonicalWrite() {
        authenticate(false);
        for (String name : GeminiV1Contract.WRITE_TOOL_NAMES) {
            McpSchema.CallToolResult result = call(name, Map.of());
            assertThat(result.isError()).isTrue();
            assertThat(result.content().toString()).contains("UNAUTHORIZED");
        }
        verifyNoInteractions(facade, coordinator);
    }

    @Test
    void foreignProviderSessionAndChatTextFailBeforeResolvingLearner() {
        authenticate(true);
        var foreign = call(GeminiV1Contract.TOOL_GET_COACH_CONTEXT,
                Map.of("learningSessionId", "spc_" + "A".repeat(43)));
        assertThat(foreign.isError()).isTrue();
        assertThat(foreign.content().toString()).contains("LEARNING_SESSION_REQUIRED");
        var prose = call(GeminiV1Contract.TOOL_SET_MASTERY,
                Map.of("learningSessionId", "spg_" + "A".repeat(43), "goalId", "goal",
                        "expectedStateVersion", 1, "clientRequestId", UUID.randomUUID().toString(),
                        "answer", "private learner prose"));
        assertThat(prose.isError()).isTrue();
        assertThat(prose.content().toString()).contains("INVALID_INPUT")
                .doesNotContain("private learner prose");
        verifyNoInteractions(facade, coordinator);
    }

    private void authenticate(boolean write) {
        var authorities = new java.util.ArrayList<SimpleGrantedAuthority>();
        authorities.add(new SimpleGrantedAuthority("SCOPE_" + GeminiV1Contract.SCOPE_READ));
        if (write) authorities.add(new SimpleGrantedAuthority("SCOPE_" + GeminiV1Contract.SCOPE_WRITE));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("spga_test_connection", "unused", authorities));
    }

    private McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        McpStatelessServerFeatures.SyncToolSpecification spec = adapter.toolSpecifications().stream()
                .filter(candidate -> candidate.tool().name().equals(name)).findFirst().orElseThrow();
        return spec.callHandler().apply(McpTransportContext.EMPTY, new McpSchema.CallToolRequest(name, arguments));
    }
}
