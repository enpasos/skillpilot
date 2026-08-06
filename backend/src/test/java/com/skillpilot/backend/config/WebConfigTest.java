package com.skillpilot.backend.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@SpringJUnitConfig
@WebAppConfiguration
@ContextConfiguration(classes = WebConfigTest.TestConfiguration.class)
class WebConfigTest {

    private static final String VISUALIZATION =
            "/assets/goal-visualizations/mathematik/89ca5089-7122-5a82-b21f-17d0bd46a3bd/"
                    + "89ca5089-7122-5a82-b21f-17d0bd46a3bd.jpg";

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void revalidatesStableGoalVisualizationUrls() throws Exception {
        mockMvc.perform(get(VISUALIZATION))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("no-cache")));
    }

    @Test
    void keepsContentHashedFrontendAssetsLongLived() throws Exception {
        mockMvc.perform(get("/assets/test-content-deadbeef.js"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=31536000")));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    @Import(WebConfig.class)
    static class TestConfiguration {
    }
}
