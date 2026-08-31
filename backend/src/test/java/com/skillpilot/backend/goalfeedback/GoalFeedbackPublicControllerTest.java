package com.skillpilot.backend.goalfeedback;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.GoalVisualization;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.PublicGoal;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.PublicResolvedContext;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.SubmissionReceipt;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.TrustedContext;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class GoalFeedbackPublicControllerTest {

    private static final String DIGEST = "sha256:" + "a".repeat(64);
    private GoalFeedbackPublicationRegistry publications;
    private GoalFeedbackSubmissionService submissions;
    private GoalFeedbackRetentionCoordinator retention;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        publications = mock(GoalFeedbackPublicationRegistry.class);
        submissions = mock(GoalFeedbackSubmissionService.class);
        retention = mock(GoalFeedbackRetentionCoordinator.class);
        mvc = MockMvcBuilders.standaloneSetup(
                        new GoalFeedbackPublicController(publications, submissions, retention))
                .build();
    }

    @Test
    void contextRequiresTheExactSevenPartPublicationBinding() throws Exception {
        PublicResolvedContext resolved = new PublicResolvedContext(
                1,
                new TrustedContext(
                        "goal+1", DIGEST, DIGEST, "book+1", "edition+1", DIGEST,
                        "de-DE", "Buch", 1, "https://skillpilot.com/lernzielbuch#goal-goal-1", DIGEST),
                new PublicGoal(
                        "Titel",
                        "Beschreibung",
                        List.of("Kapitel"),
                        new GoalVisualization(
                                "Visualisierung: Titel",
                                GoalFeedbackApi.VISUALIZATION_ENDPOINT_PREFIX + "b".repeat(64),
                                "Didaktische Visualisierung zum Titel.")),
                GoalFeedbackApi.SUBMISSION_ENDPOINT);
        when(publications.resolvePublic(any())).thenReturn(Optional.of(resolved));
        String imageDigest = "b".repeat(64);
        byte[] imageBytes = {1, 2, 3, 4};
        when(publications.resolvePublicVisualization(imageDigest)).thenReturn(Optional.of(
                new GoalFeedbackPublicationRegistry.VisualizationAsset(
                        imageBytes,
                        MediaType.IMAGE_PNG_VALUE,
                        "sha256:" + imageDigest)));

        mvc.perform(get("/api/public/goal-feedback/v1/context")
                        .param("bookId", "book+1")
                        .param("edition", "edition+1")
                        .param("goalId", "goal+1")
                        .param("goalFingerprint", DIGEST)
                        .param("pageFingerprint", DIGEST)
                        .param("bookDigest", DIGEST)
                        .param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.schemaVersion").value(1))
                .andExpect(jsonPath("$.context.scopeLabel").value("Buch"))
                .andExpect(jsonPath("$.goal.breadcrumbs[0]").value("Kapitel"))
                .andExpect(jsonPath("$.goal.visualization.url")
                        .value(GoalFeedbackApi.VISUALIZATION_ENDPOINT_PREFIX + "b".repeat(64)))
                .andExpect(jsonPath("$.goal.visualization.altText")
                        .value("Didaktische Visualisierung zum Titel."));

        mvc.perform(get("/api/public/goal-feedback/v1/visualizations/{digest}", imageDigest))
                .andExpect(status().isOk())
                .andExpect(header().string("ETag", "\"sha256:" + imageDigest + "\""))
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(content().bytes(imageBytes));

        mvc.perform(get("/api/public/goal-feedback/v1/context")
                        .param("bookId", "book-1")
                        .param("edition", "edition-1")
                        .param("goalId", "goal-1")
                        .param("goalFingerprint", DIGEST)
                        .param("pageFingerprint", DIGEST)
                        .param("bookDigest", DIGEST)
                        .param("page", "1")
                        .param("extra", "not-allowed"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submissionReturnsTheStableAcceptedReceipt() throws Exception {
        UUID feedbackId = UUID.fromString("c9333185-54b2-4b6b-8469-c060cb38f855");
        when(submissions.submit(any())).thenReturn(new SubmissionReceipt(
                feedbackId, Instant.parse("2026-08-30T10:00:00Z")));

        mvc.perform(post("/api/public/goal-feedback/v1/submissions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isAccepted())
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.feedbackId").value(feedbackId.toString()))
                .andExpect(jsonPath("$.receivedAt").value("2026-08-30T10:00:00Z"));

        InOrder order = inOrder(retention, submissions);
        order.verify(retention).purgeAllExpiredContent();
        order.verify(submissions).submit(any());
    }
}
