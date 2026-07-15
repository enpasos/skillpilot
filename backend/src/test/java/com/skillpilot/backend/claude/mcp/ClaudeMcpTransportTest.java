package com.skillpilot.backend.claude.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.actionregression.ActionRegressionAuditLogger;
import com.skillpilot.backend.actionregression.ActionRegressionService;
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

import java.util.stream.StreamSupport;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.context.SpringBootTest(
        classes = ClaudeMcpTransportTest.TestApplication.class,
        webEnvironment = org.springframework.boot.test.context.SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(properties = {
        "skillpilot.claude.enabled=true",
        "skillpilot.claude.mcp.enabled=true",
        "skillpilot.claude.mcp.regression-enabled=true"
})
class ClaudeMcpTransportTest {

    private static final String ENDPOINT = "/api/claude/mcp";
    private static final String PROTOCOL_VERSION = "2025-11-25";
    @Autowired
    private WebApplicationContext applicationContext;
    @Autowired
    private ActionRegressionAuditLogger auditLogger;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(applicationContext).build();
    }

    @Test
    void initializesAsStatelessServerAndListsRegressionTools() throws Exception {
        MvcResult initialize = postJson("""
                {
                  "jsonrpc": "2.0",
                  "id": 1,
                  "method": "initialize",
                  "params": {
                    "protocolVersion": "2025-11-25",
                    "capabilities": {},
                    "clientInfo": {"name": "skillpilot-test", "version": "1.0"}
                  }
                }
                """);

        JsonNode initializeBody = jsonBody(initialize);
        assertThat(initializeBody.path("result").path("protocolVersion").asText()).isEqualTo(PROTOCOL_VERSION);
        assertThat(initializeBody.path("result").path("serverInfo").path("name").asText())
                .isEqualTo("skillpilot-claude-mcp");
        assertThat(initializeBody.path("result").path("instructions").asText())
                .contains("Follow the user's explicit request")
                .contains("state.stateMachine.requiredAction")
                .contains("Preserve backend-provided fields unchanged")
                .contains("Never ask for or expose a permanent SkillPilot ID");
        assertThat(initializeBody.path("result").path("instructions").asText())
                .doesNotContain("instead of relying on old tool results");
        assertThat(initialize.getResponse().getHeader("Mcp-Session-Id")).isNull();

        JsonNode listBody = jsonBody(postJson("""
                {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
                """));
        assertThat(StreamSupport.stream(listBody.path("result").path("tools").spliterator(), false)
                .map(tool -> tool.path("name").asText()))
                .contains("createRegressionProbe", "verifyRegressionProbe");

        JsonNode verifyTool = StreamSupport.stream(
                        listBody.path("result").path("tools").spliterator(), false)
                .filter(tool -> tool.path("name").asText().equals("verifyRegressionProbe"))
                .findFirst()
                .orElseThrow();
        assertThat(verifyTool.path("inputSchema").path("properties").fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder("probe_id", "token", "proof");
    }

    @Test
    void createsAndVerifiesAProbeOverStatelessStreamableHttp() throws Exception {
        JsonNode createBody = jsonBody(postJson("""
                {
                  "jsonrpc":"2.0",
                  "id":3,
                  "method":"tools/call",
                  "params":{"name":"createRegressionProbe","arguments":{}}
                }
                """));
        assertThat(createBody.path("result").path("isError").asBoolean()).isFalse();
        JsonNode probe = toolTextJson(createBody);
        assertThat(probe.path("probe_id").asText())
                .matches("^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$");
        assertThat(probe.path("token").asText()).matches("^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$");
        assertThat(probe.path("proof").asText()).matches("^[0-9a-f]{32}$");

        JsonNode verifyRequest = objectMapper.createObjectNode()
                .put("jsonrpc", "2.0")
                .put("id", 4)
                .put("method", "tools/call");
        JsonNode params = ((com.fasterxml.jackson.databind.node.ObjectNode) verifyRequest).putObject("params");
        ((com.fasterxml.jackson.databind.node.ObjectNode) params).put("name", "verifyRegressionProbe");
        ((com.fasterxml.jackson.databind.node.ObjectNode) params).set("arguments", probe);

        JsonNode verifyBody = jsonBody(postJson(objectMapper.writeValueAsString(verifyRequest)));
        assertThat(verifyBody.path("result").path("isError").asBoolean()).isFalse();
        JsonNode verification = toolTextJson(verifyBody);
        assertThat(verification.path("ok").asBoolean()).isTrue();
        assertThat(verification.path("probe_id").asText()).isEqualTo(probe.path("probe_id").asText());
        assertThat(verification.path("proof_valid").asBoolean()).isTrue();
        verify(auditLogger).logClaudeMcpProbeIssued(
                probe.path("probe_id").asText(),
                probe.path("token").asText(),
                probe.path("proof").asText());
        verify(auditLogger).logClaudeMcpProbeVerified(
                probe.path("probe_id").asText(),
                probe.path("token").asText(),
                probe.path("proof").asText(),
                true);
    }

    private MvcResult postJson(String json) throws Exception {
        return mockMvc.perform(post(ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .header("MCP-Protocol-Version", PROTOCOL_VERSION)
                        .content(json))
                .andExpect(status().isOk())
                .andReturn();
    }

    private JsonNode jsonBody(MvcResult result) throws Exception {
        return objectMapper.readTree(result.getResponse().getContentAsByteArray());
    }

    private JsonNode toolTextJson(JsonNode callResponse) throws Exception {
        return objectMapper.readTree(callResponse.path("result").path("content").path(0).path("text").asText());
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            LiquibaseAutoConfiguration.class,
            SecurityAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import(ClaudeMcpConfiguration.class)
    static class TestApplication {

        @Bean
        ActionRegressionAuditLogger actionRegressionAuditLogger() {
            return mock(ActionRegressionAuditLogger.class);
        }

        @Bean
        ActionRegressionService actionRegressionService(ActionRegressionAuditLogger auditLogger) {
            ObjectMapper mapper = new ObjectMapper();
            return new ActionRegressionService(
                    mapper,
                    auditLogger,
                    "https://regression.example.test",
                    "claude-mcp-transport-test");
        }
    }
}
