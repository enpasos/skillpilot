package com.skillpilot.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class SpaControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new SpaController()).build();
    }

    @Test
    void faqDeepLinkForwardsToSpaIndex() throws Exception {
        mockMvc.perform(get("/faq"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void pluginCatalogForwardsToSpaIndex() throws Exception {
        mockMvc.perform(get("/plugins"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void learningGoalBookForwardsToSpaIndex() throws Exception {
        mockMvc.perform(get("/lernzielbuch"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void learningGoalFeedbackPilotForwardsToSpaIndex() throws Exception {
        mockMvc.perform(get("/lernziel-feedback?goalId=example"))
                .andExpect(status().isOk())
                .andExpect(forwardedUrl("/index.html"));
    }
}
