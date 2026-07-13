package com.skillpilot.backend.claude.mcp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.boot.test.context.SpringBootTest(
        classes = ClaudeMcpTransportTest.TestApplication.class,
        webEnvironment = org.springframework.boot.test.context.SpringBootTest.WebEnvironment.MOCK)
class ClaudeMcpDisabledTransportTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ApplicationContext applicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void endpointAndToolsAreAbsentByDefault() throws Exception {
        assertThat(applicationContext.getBeansOfType(ActionRegressionMcpTools.class)).isEmpty();
        assertThat(applicationContext.getBeansOfType(ToolCallbackProvider.class)).isEmpty();

        mockMvc.perform(post("/api/claude/mcp")
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON, MediaType.TEXT_EVENT_STREAM)
                        .content("""
                                {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
                                """))
                .andExpect(status().isNotFound());
    }
}
