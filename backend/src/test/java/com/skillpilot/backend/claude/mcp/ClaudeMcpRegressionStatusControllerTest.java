package com.skillpilot.backend.claude.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.actionregression.ActionRegressionAuditLogger;
import com.skillpilot.backend.actionregression.ActionRegressionService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ClaudeMcpRegressionStatusControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void reportsTheEffectiveFlagsAndRegisteredRegressionToolsWithoutSecrets() throws Exception {
        ActionRegressionMcpTools tools = new ActionRegressionMcpTools(
                mock(ActionRegressionService.class),
                mock(ActionRegressionAuditLogger.class));
        ToolCallbackProvider provider = MethodToolCallbackProvider.builder()
                .toolObjects(tools)
                .build();
        ClaudeMcpRegressionStatusController controller = new ClaudeMcpRegressionStatusController(
                true,
                true,
                false,
                true,
                List.of(provider));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MvcResult result = mockMvc.perform(get(ClaudeMcpRegressionStatusController.STATUS_PATH))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsByteArray());
        assertThat(body.path("status").asText()).isEqualTo("ready");
        assertThat(body.path("claude_enabled").asBoolean()).isTrue();
        assertThat(body.path("mcp_enabled").asBoolean()).isTrue();
        assertThat(body.path("coach_tools_enabled").asBoolean()).isFalse();
        assertThat(body.path("regression_tools_enabled").asBoolean()).isTrue();
        assertThat(body.path("regression_tools_ready").asBoolean()).isTrue();
        assertThat(body.path("registered_tool_count").asInt()).isEqualTo(2);
        assertThat(StreamSupport.stream(body.path("registered_regression_tools").spliterator(), false)
                .map(JsonNode::asText))
                .containsExactly("createRegressionProbe", "verifyRegressionProbe");
        assertThat(result.getResponse().getContentAsString())
                .doesNotContain("token", "proof", "secret", "skillpilotId");
    }

    @Test
    void reportsNotReadyWhenRegressionToolsAreDisabledAndUnregistered() throws Exception {
        ClaudeMcpRegressionStatusController controller = new ClaudeMcpRegressionStatusController(
                true,
                true,
                true,
                false,
                List.of());
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        MvcResult result = mockMvc.perform(get(ClaudeMcpRegressionStatusController.STATUS_PATH))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsByteArray());
        assertThat(body.path("status").asText()).isEqualTo("not_ready");
        assertThat(body.path("regression_tools_ready").asBoolean()).isFalse();
        assertThat(body.path("registered_tool_count").asInt()).isZero();
        assertThat(body.path("registered_regression_tools").isEmpty()).isTrue();
    }
}
