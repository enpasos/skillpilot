package com.skillpilot.backend.actionregression;

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

class ActionRegressionPageControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ActionRegressionPageController()).build();
    }

    @Test
    void publicPageIsSelfContainedAndLinksExactReproducerMaterials() throws Exception {
        MvcResult result = mockMvc.perform(get(ActionRegressionPageController.PAGE_PATH))
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
                .contains("RUN_RETAIN", "RECALL_RETAIN", "RETAIN_READY", "RETAIN_MISSING")
                .contains("RUN_SINGLE", "RUN_CHAIN", "proof_valid=true")
                .contains("This is temporal correlation, not a claim about its cause.")
                .contains("https://skillpilot.com/openai/custom-gpt-action-regression")
                .contains("https://chatgpt.com/g/g-6a54e58149c0819185c43250323a3c31-regressiongpt")
                .contains("/api/action-regression/openapi.yaml")
                .contains("REGRESSION_GPT_INSTRUCTIONS.md")
                .doesNotContain("<script", "Conversation ID", "start code:", "session token:");
    }

    @Test
    void trailingSlashServesTheSamePage() throws Exception {
        byte[] canonical = mockMvc.perform(get(ActionRegressionPageController.PAGE_PATH))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        byte[] trailingSlash = mockMvc.perform(get(ActionRegressionPageController.PAGE_PATH + "/"))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsByteArray();

        assertThat(trailingSlash).isEqualTo(canonical);
    }
}
