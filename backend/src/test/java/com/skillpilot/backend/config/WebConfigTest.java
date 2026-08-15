package com.skillpilot.backend.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
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
            "/assets/goal-visualizations/test-goal/test-goal.txt";
    private static final String OPENAI_REVIEW_VIDEO =
            "/api/public/openai/review/skillpilot-coach-v1/1.0.0/test-video.mp4";
    private static final String QUICKSTART_VIDEO =
            "/api/public/quickstart/videos/skillpilot-coach-v1/1.0.0/de/test-video.mp4";
    private static final String OPENAI_ORIGIN = "https://platform.openai.com";
    private static final String OPENAI_REVIEW_VIDEO_FIXTURE =
            "0123456789abcdefghijklmnopqrstuvwxyz\n";
    private static final String QUICKSTART_VIDEO_FIXTURE =
            "quickstart-video-fixture-0123456789\n";

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

    @Test
    void servesContentAddressedOpenAiReviewVideoOnlyFromNetworkOnlyApiPath() throws Exception {
        mockMvc.perform(get(OPENAI_REVIEW_VIDEO))
                .andExpect(status().isOk())
                .andExpect(content().contentType("video/mp4"))
                .andExpect(content().string(OPENAI_REVIEW_VIDEO_FIXTURE))
                .andExpect(header().string(HttpHeaders.ACCEPT_RANGES, "bytes"))
                .andExpect(header().string(
                        HttpHeaders.CACHE_CONTROL,
                        containsString("max-age=31536000")));

        mockMvc.perform(get("/assets/openai/review/skillpilot-coach-v1/1.0.0/test-video.mp4"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/openai-review/skillpilot-coach-v1/1.0.0/test-video.mp4"))
                .andExpect(status().isNotFound());
    }

    @Test
    void servesOpenAiReviewVideoByteRanges() throws Exception {
        mockMvc.perform(get(OPENAI_REVIEW_VIDEO)
                        .header(HttpHeaders.RANGE, "bytes=0-15"))
                .andExpect(status().isPartialContent())
                .andExpect(content().contentType("video/mp4"))
                .andExpect(content().string(OPENAI_REVIEW_VIDEO_FIXTURE.substring(0, 16)))
                .andExpect(header().string(HttpHeaders.ACCEPT_RANGES, "bytes"))
                .andExpect(header().string(HttpHeaders.CONTENT_LENGTH, "16"))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_RANGE,
                        "bytes 0-15/" + OPENAI_REVIEW_VIDEO_FIXTURE.length()));
    }

    @Test
    void servesQuickstartVideoFromNetworkOnlyApiPath() throws Exception {
        mockMvc.perform(get(QUICKSTART_VIDEO))
                .andExpect(status().isOk())
                .andExpect(content().contentType("video/mp4"))
                .andExpect(content().string(QUICKSTART_VIDEO_FIXTURE))
                .andExpect(header().string(HttpHeaders.ACCEPT_RANGES, "bytes"));

        mockMvc.perform(get(QUICKSTART_VIDEO)
                        .header(HttpHeaders.RANGE, "bytes=0-15"))
                .andExpect(status().isPartialContent())
                .andExpect(content().contentType("video/mp4"))
                .andExpect(content().string(QUICKSTART_VIDEO_FIXTURE.substring(0, 16)))
                .andExpect(header().string(HttpHeaders.ACCEPT_RANGES, "bytes"))
                .andExpect(header().string(HttpHeaders.CONTENT_LENGTH, "16"))
                .andExpect(header().string(
                        HttpHeaders.CONTENT_RANGE,
                        "bytes 0-15/" + QUICKSTART_VIDEO_FIXTURE.length()));
    }

    @Test
    void servesCrossOriginOpenAiReviewVideoRangesWithoutCredentials() throws Exception {
        mockMvc.perform(get(OPENAI_REVIEW_VIDEO)
                        .header(HttpHeaders.ORIGIN, OPENAI_ORIGIN)
                        .header(HttpHeaders.RANGE, "bytes=0-15"))
                .andExpect(status().isPartialContent())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS))
                .andExpect(header().string(
                        HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS,
                        "Accept-Ranges, Content-Length, Content-Range"));

        mockMvc.perform(options(OPENAI_REVIEW_VIDEO)
                        .header(HttpHeaders.ORIGIN, OPENAI_ORIGIN)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Range"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "Range"))
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS));
    }

    @Configuration(proxyBeanMethods = false)
    @EnableWebMvc
    @Import({WebConfig.class, CorsConfig.class})
    static class TestConfiguration {
    }
}
