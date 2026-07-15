package com.skillpilot.backend.claude.mcp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ClaudeMcpRegressionPageControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ClaudeMcpRegressionPageController()).build();
    }

    @Test
    void publicPageDocumentsTheIsolatedAuthenticatedMcpProtocol() throws Exception {
        MvcResult result = mockMvc.perform(get(ClaudeMcpRegressionPageController.PAGE_PATH))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Security-Policy",
                        "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; "
                                + "form-action 'none'; frame-ancestors 'none'"))
                .andReturn();

        assertThat(result.getResponse().getContentType())
                .isEqualTo(new MediaType(MediaType.TEXT_HTML, StandardCharsets.UTF_8).toString());
        assertThat(result.getResponse().getContentLength())
                .isEqualTo(result.getResponse().getContentAsByteArray().length);

        String page = result.getResponse().getContentAsString(StandardCharsets.UTF_8);
        assertThat(page)
                .contains("https://skillpilot.com/claude/mcp-regression")
                .contains("blank SkillPilot test learner", "normal Claude OAuth flow")
                .contains("Customize &gt; Connectors", "+ &gt; Connectors", "transparent prompt sheet")
                .contains("do not paste the whole file", "standing instructions")
                .contains("SKILLPILOT_CLAUDE_COACH_TOOLS_ENABLED=false")
                .contains("SKILLPILOT_CLAUDE_REGRESSION_TOOLS_ENABLED=true")
                .contains("connector exposes exactly", "Stop if any coach tool is visible")
                .contains("Streamable HTTP MCP", "does not call a Custom GPT Action")
                .contains("Test A prompt", "Test B prompt", "Test C first prompt", "Test C second prompt")
                .contains("inert synthetic sample data", "ok=true", "integrity_valid=true", "policy refusal")
                .contains("createRegressionProbe", "verifyRegressionProbe")
                .contains("ai/claude/mcp-regression/CLAUDE_INSTRUCTIONS.md")
                .contains("ai/claude/mcp-regression/TEST_PROTOCOL.md")
                .contains("/claude/mcp-regression/status.json")
                .contains("/api/action-regression/healthz")
                .contains("/api/claude/oauth/protected-resource")
                .contains("/openai/custom-gpt-action-regression")
                .contains("support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp")
                .doesNotContain("<script", "skillpilotId=", "Authorization: Bearer", "access_token=");
    }

    @Test
    void trailingSlashServesTheSamePage() throws Exception {
        byte[] canonical = mockMvc.perform(get(ClaudeMcpRegressionPageController.PAGE_PATH))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        byte[] trailingSlash = mockMvc.perform(get(ClaudeMcpRegressionPageController.PAGE_PATH + "/"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        assertThat(trailingSlash).isEqualTo(canonical);
    }
}
