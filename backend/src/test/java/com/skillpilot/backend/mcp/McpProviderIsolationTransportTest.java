package com.skillpilot.backend.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.actionregression.ActionRegressionAuditLogger;
import com.skillpilot.backend.actionregression.ActionRegressionService;
import com.skillpilot.backend.claude.mcp.ClaudeMcpConfiguration;
import com.skillpilot.backend.claude.mcp.ClaudeMcpServerConfiguration;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpServerConfiguration;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.liquibase.autoconfigure.LiquibaseAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.context.SpringBootTest(
        classes = McpProviderIsolationTransportTest.TestApplication.class,
        webEnvironment = org.springframework.boot.test.context.SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(properties = {
        "spring.ai.mcp.server.enabled=false",
        "skillpilot.claude.enabled=true",
        "skillpilot.claude.mcp.enabled=true",
        "skillpilot.claude.mcp.coach-enabled=false",
        "skillpilot.claude.mcp.regression-enabled=true",
        "skillpilot.openai.de.enabled=true",
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.openai.de.server-build=test-build",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.mcp.enabled=true"
})
class McpProviderIsolationTransportTest {

    private static final String PROTOCOL_VERSION = "2025-11-25";

    @Autowired
    private WebApplicationContext applicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
    }

    @Test
    void providerEndpointsExposeOnlyTheirExplicitToolContracts() throws Exception {
        assertThat(toolNames(postJson("/api/claude/mcp", 1)))
                .containsExactlyInAnyOrder("createRegressionProbe", "verifyRegressionProbe")
                .doesNotContain("openai_de_native");

        assertThat(toolNames(postJson(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, 2)))
                .containsExactly("openai_de_native")
                .doesNotContain("createRegressionProbe", "verifyRegressionProbe");
    }

    @Test
    void openAiEndpointPreservesNativeStructuredContent() throws Exception {
        MvcResult result = mockMvc.perform(post(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("MCP-Protocol-Version", PROTOCOL_VERSION)
                        .content("""
                                {"jsonrpc":"2.0","id":3,"method":"tools/call","params":{
                                  "name":"openai_de_native","arguments":{}}}
                                """))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsByteArray());
        assertThat(body.path("result").path("structuredContent").path("locale").asText())
                .isEqualTo("de");
    }

    @Test
    void toolListPublishesTopLevelSecuritySchemesAndCompatibilityMirror() throws Exception {
        JsonNode tool = postJson(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, 4)
                .path("result")
                .path("tools")
                .get(0);

        assertThat(tool.path("securitySchemes").isArray()).isTrue();
        assertThat(tool.path("securitySchemes")).isEqualTo(tool.path("_meta").path("securitySchemes"));
        assertThat(tool.path("securitySchemes").get(0).path("type").asText()).isEqualTo("oauth2");
    }

    private JsonNode postJson(String endpoint, int id) throws Exception {
        MvcResult result = mockMvc.perform(post(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("MCP-Protocol-Version", PROTOCOL_VERSION)
                        .content("""
                                {"jsonrpc":"2.0","id":%d,"method":"tools/list","params":{}}
                                """.formatted(id)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private List<String> toolNames(JsonNode response) {
        return response.path("result").path("tools").valueStream()
                .map(tool -> tool.path("name").asText())
                .toList();
    }

    private static McpStatelessServerFeatures.SyncToolSpecification openAiTool() {
        McpSchema.Tool tool = McpSchema.Tool.builder("openai_de_native")
                .description("German OpenAI test tool")
                .inputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(),
                        "additionalProperties", false))
                .outputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of("locale", Map.of("type", "string")),
                        "required", List.of("locale"),
                        "additionalProperties", false))
                .meta(Map.of("securitySchemes", List.of(Map.of(
                        "type", "oauth2",
                        "scopes", List.of("skillpilot.openai.de.read")))))
                .build();
        return McpStatelessServerFeatures.SyncToolSpecification.builder()
                .tool(tool)
                .callHandler((context, request) -> McpSchema.CallToolResult.builder()
                        .isError(false)
                        .addTextContent("German OpenAI result")
                        .structuredContent(Map.of("locale", "de"))
                        .build())
                .build();
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            LiquibaseAutoConfiguration.class,
            SecurityAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import({
            SkillPilotStatelessMcpServerFactory.class,
            ClaudeMcpConfiguration.class,
            ClaudeMcpServerConfiguration.class,
            OpenAiDeMcpServerConfiguration.class
    })
    static class TestApplication {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        ActionRegressionAuditLogger actionRegressionAuditLogger() {
            return mock(ActionRegressionAuditLogger.class);
        }

        @Bean
        ActionRegressionService actionRegressionService(ActionRegressionAuditLogger auditLogger) {
            return new ActionRegressionService(
                    new ObjectMapper(),
                    auditLogger,
                    "https://regression.example.test",
                    "mcp-provider-isolation-test");
        }

        @Bean
        OpenAiDeV1McpContractAdapter openAiDeCoachMcpContract() {
            OpenAiDeV1McpContractAdapter contract = mock(OpenAiDeV1McpContractAdapter.class);
            when(contract.serverInstructions()).thenReturn("German OpenAI test instructions");
            when(contract.toolSpecifications()).thenReturn(List.of(openAiTool()));
            when(contract.resourceSpecifications()).thenReturn(List.of());
            return contract;
        }
    }
}
