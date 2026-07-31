package com.skillpilot.backend.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.context.SpringBootTest(
        classes = SkillPilotStatelessMcpServerFactoryTest.TestApplication.class,
        webEnvironment = org.springframework.boot.test.context.SpringBootTest.WebEnvironment.MOCK,
        properties = "spring.ai.mcp.server.enabled=false")
class SkillPilotStatelessMcpServerFactoryTest {

    private static final String PROTOCOL_VERSION = "2025-11-25";
    private static final String MODERN_PROTOCOL_VERSION = "2026-07-28";

    @Autowired
    private WebApplicationContext applicationContext;

    @Autowired
    @Qualifier("alphaMcpRegistration")
    private SkillPilotStatelessMcpServerFactory.Registration alphaRegistration;

    @Autowired
    private SkillPilotStatelessMcpServerFactory serverFactory;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
    }

    @Test
    void routesTwoServersWithIndependentIdentityInstructionsAndToolAllowlists() throws Exception {
        JsonNode alphaInitialize = postJson("/mcp/alpha", initializeRequest(1));
        JsonNode betaInitialize = postJson("/mcp/beta", initializeRequest(2));

        assertThat(alphaInitialize.path("result").path("serverInfo").path("name").asText())
                .isEqualTo("alpha-server");
        assertThat(alphaInitialize.path("result").path("instructions").asText())
                .isEqualTo("Alpha instructions");
        assertThat(betaInitialize.path("result").path("serverInfo").path("name").asText())
                .isEqualTo("beta-server");
        assertThat(betaInitialize.path("result").path("instructions").asText())
                .isEqualTo("Beta instructions");

        assertThat(toolNames(postJson("/mcp/alpha", toolsListRequest(3))))
                .containsExactly("alpha_tool", "alpha_auth");
        assertThat(toolNames(postJson("/mcp/beta", toolsListRequest(4))))
                .containsExactly("beta_tool");
    }

    @Test
    void listsAndReadsOnlyResourcesRegisteredForThatServer() throws Exception {
        JsonNode alphaResources = postJson(
                "/mcp/alpha",
                """
                {"jsonrpc":"2.0","id":20,"method":"resources/list","params":{}}
                """);
        assertThat(alphaResources.path("result").path("resources"))
                .singleElement()
                .satisfies(resource -> {
                    assertThat(resource.path("uri").asText()).isEqualTo("ui://alpha/card.html");
                    assertThat(resource.path("mimeType").asText())
                            .isEqualTo("text/html;profile=mcp-app");
                });

        JsonNode read = postJson(
                "/mcp/alpha",
                """
                {"jsonrpc":"2.0","id":21,"method":"resources/read","params":{
                  "uri":"ui://alpha/card.html"}}
                """);
        assertThat(read.path("result").path("contents"))
                .singleElement()
                .satisfies(resource -> {
                    assertThat(resource.path("uri").asText()).isEqualTo("ui://alpha/card.html");
                    assertThat(resource.path("text").asText()).isEqualTo("<main>alpha</main>");
                    assertThat(resource.path("_meta").path("ui").path("prefersBorder").asBoolean())
                            .isTrue();
                });

        JsonNode betaInitialize = postJson("/mcp/beta", initializeRequest(22));
        assertThat(betaInitialize.path("result").path("capabilities").has("resources"))
                .isFalse();
    }

    @Test
    void preservesNativeStructuredContentAndAuthenticationMetadata() throws Exception {
        JsonNode call = postJson("/mcp/alpha", callRequest(5, "alpha_tool"));

        assertThat(call.path("result").path("isError").asBoolean()).isFalse();
        assertThat(call.path("result").path("structuredContent").path("origin").asText())
                .isEqualTo("alpha");
        assertThat(call.path("result").path("content").path(0).path("text").asText())
                .isEqualTo("alpha text");

        JsonNode auth = postJson("/mcp/alpha", callRequest(6, "alpha_auth"));
        assertThat(auth.path("result").path("isError").asBoolean()).isTrue();
        assertThat(auth.path("result").path("_meta")
                        .path(SkillPilotMcpToolResults.WWW_AUTHENTICATE_META_KEY)
                        .path(0)
                        .asText())
                .isEqualTo("Bearer resource_metadata=\"https://skillpilot.test/.well-known/resource\"");
    }

    @Test
    void enablesImmediateExecutionAndRejectsDuplicateToolNames() {
        assertThat(ReflectionTestUtils.getField(alphaRegistration.server(), "immediateExecution"))
                .isEqualTo(true);

        McpStatelessServerFeatures.SyncToolSpecification duplicate = tool("duplicate", "one");
        assertThatThrownBy(() -> serverFactory.create(
                        "/mcp/duplicate",
                        "duplicate-server",
                        "1.0.0",
                        "Duplicate test",
                        List.of(duplicate, tool("duplicate", "two"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("duplicate MCP tool name: duplicate");

        McpStatelessServerFeatures.SyncResourceSpecification duplicateResource =
                resource("ui://duplicate/card.html", "duplicate", "one");
        assertThatThrownBy(() -> serverFactory.create(
                        "/mcp/duplicate-resource",
                        "duplicate-resource-server",
                        "1.0.0",
                        "Duplicate resource test",
                        Duration.ofSeconds(30),
                        List.of(tool("only_tool", "only")),
                        List.of(
                                duplicateResource,
                                resource("ui://duplicate/card.html", "duplicate-two", "two"))))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("duplicate MCP resource URI: ui://duplicate/card.html");
    }

    @Test
    void returnsLegacyFallbackSignalForModernDiscoveryProbe() throws Exception {
        String discoverRequest = """
                {"jsonrpc":"2.0","id":"discover-1","method":"server/discover","params":{
                  "_meta":{
                    "io.modelcontextprotocol/protocolVersion":"2026-07-28",
                    "io.modelcontextprotocol/clientInfo":{"name":"factory-test","version":"1.0"},
                    "io.modelcontextprotocol/clientCapabilities":{}}}}
                """;

        MvcResult versionedProbe = mockMvc.perform(post("/mcp/alpha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("MCP-Protocol-Version", MODERN_PROTOCOL_VERSION)
                        .content(discoverRequest))
                .andExpect(status().isBadRequest())
                .andReturn();
        MvcResult methodProbe = mockMvc.perform(post("/mcp/alpha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("Mcp-Method", "server/discover")
                        .content(discoverRequest))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertThat(versionedProbe.getResponse().getContentAsByteArray()).isEmpty();
        assertThat(versionedProbe.getResolvedException()).isNull();
        assertThat(methodProbe.getResponse().getContentAsByteArray()).isEmpty();
        assertThat(methodProbe.getResolvedException()).isNull();
        assertThat(toolNames(postJson("/mcp/alpha", toolsListRequest(7))))
                .containsExactly("alpha_tool", "alpha_auth");
    }

    private JsonNode postJson(String endpoint, String json) throws Exception {
        MvcResult result = mockMvc.perform(post(endpoint)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("MCP-Protocol-Version", PROTOCOL_VERSION)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private List<String> toolNames(JsonNode response) {
        return response.path("result").path("tools").valueStream()
                .map(tool -> tool.path("name").asText())
                .toList();
    }

    private String initializeRequest(int id) {
        return """
                {"jsonrpc":"2.0","id":%d,"method":"initialize","params":{
                  "protocolVersion":"2025-11-25","capabilities":{},
                  "clientInfo":{"name":"factory-test","version":"1.0"}}}
                """.formatted(id);
    }

    private String toolsListRequest(int id) {
        return """
                {"jsonrpc":"2.0","id":%d,"method":"tools/list","params":{}}
                """.formatted(id);
    }

    private String callRequest(int id, String toolName) {
        return """
                {"jsonrpc":"2.0","id":%d,"method":"tools/call","params":{
                  "name":"%s","arguments":{}}}
                """.formatted(id, toolName);
    }

    private static McpStatelessServerFeatures.SyncToolSpecification tool(String name, String origin) {
        McpSchema.Tool tool = McpSchema.Tool.builder(name)
                .description("Tool owned by " + origin)
                .inputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(),
                        "additionalProperties", false))
                .outputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of("origin", Map.of("type", "string")),
                        "required", List.of("origin"),
                        "additionalProperties", false))
                .build();
        return McpStatelessServerFeatures.SyncToolSpecification.builder()
                .tool(tool)
                .callHandler((context, request) -> McpSchema.CallToolResult.builder()
                        .isError(false)
                        .addTextContent(origin + " text")
                        .structuredContent(Map.of("origin", origin))
                        .build())
                .build();
    }

    private static McpStatelessServerFeatures.SyncToolSpecification authTool() {
        McpSchema.Tool tool = McpSchema.Tool.builder("alpha_auth")
                .description("Returns a standards-compliant authentication challenge")
                .inputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(),
                        "additionalProperties", false))
                .build();
        return McpStatelessServerFeatures.SyncToolSpecification.builder()
                .tool(tool)
                .callHandler((context, request) -> SkillPilotMcpToolResults.authenticationRequired(
                        "Bearer resource_metadata=\"https://skillpilot.test/.well-known/resource\""))
                .build();
    }

    private static McpStatelessServerFeatures.SyncResourceSpecification resource(
            String uri,
            String name,
            String text) {
        String mimeType = "text/html;profile=mcp-app";
        Map<String, Object> meta = Map.of("ui", Map.of("prefersBorder", true));
        McpSchema.Resource resource = McpSchema.Resource.builder(uri, name)
                .mimeType(mimeType)
                .meta(meta)
                .build();
        return new McpStatelessServerFeatures.SyncResourceSpecification(
                resource,
                (context, request) -> new McpSchema.ReadResourceResult(List.of(
                        new McpSchema.TextResourceContents(uri, mimeType, text, meta))));
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            LiquibaseAutoConfiguration.class,
            SecurityAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import(SkillPilotStatelessMcpServerFactory.class)
    static class TestApplication {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean(name = "alphaMcpRegistration", destroyMethod = "close")
        SkillPilotStatelessMcpServerFactory.Registration alphaMcpRegistration(
                SkillPilotStatelessMcpServerFactory factory) {
            return factory.create(
                    "/mcp/alpha",
                    "alpha-server",
                    "1.0.0",
                    "Alpha instructions",
                    Duration.ofSeconds(30),
                    List.of(tool("alpha_tool", "alpha"), authTool()),
                    List.of(resource("ui://alpha/card.html", "alpha-card", "<main>alpha</main>")));
        }

        @Bean(name = "alphaMcpRouter")
        RouterFunction<ServerResponse> alphaMcpRouter(
                @Qualifier("alphaMcpRegistration")
                        SkillPilotStatelessMcpServerFactory.Registration registration) {
            return registration.routerFunction();
        }

        @Bean(name = "betaMcpRegistration", destroyMethod = "close")
        SkillPilotStatelessMcpServerFactory.Registration betaMcpRegistration(
                SkillPilotStatelessMcpServerFactory factory) {
            return factory.create(
                    "/mcp/beta",
                    "beta-server",
                    "2.0.0",
                    "Beta instructions",
                    List.of(tool("beta_tool", "beta")));
        }

        @Bean(name = "betaMcpRouter")
        RouterFunction<ServerResponse> betaMcpRouter(
                @Qualifier("betaMcpRegistration")
                        SkillPilotStatelessMcpServerFactory.Registration registration) {
            return registration.routerFunction();
        }
    }
}
