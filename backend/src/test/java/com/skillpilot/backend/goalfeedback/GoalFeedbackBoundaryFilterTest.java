package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class GoalFeedbackBoundaryFilterTest {

    private static final String TOKEN = "production-operator-token-at-least-32-bytes";

    @Test
    void publicIntakeRequiresAllowedOriginAndJsonAndBuffersOnlyTheBoundedBody() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(10);

        MockHttpServletRequest missingOrigin = submissionRequest("{}");
        MockHttpServletResponse missingOriginResponse = new MockHttpServletResponse();
        filter.doFilter(missingOrigin, missingOriginResponse, new MockFilterChain());
        assertThat(missingOriginResponse.getStatus()).isEqualTo(403);

        MockHttpServletRequest wrongContentType = submissionRequest("{}");
        wrongContentType.addHeader("Origin", "https://skillpilot.test");
        wrongContentType.setContentType("text/plain");
        MockHttpServletResponse wrongContentTypeResponse = new MockHttpServletResponse();
        filter.doFilter(wrongContentType, wrongContentTypeResponse, new MockFilterChain());
        assertThat(wrongContentTypeResponse.getStatus()).isEqualTo(415);

        MockHttpServletRequest accepted = submissionRequest("{\"feedback\":true}");
        accepted.addHeader("Origin", "https://skillpilot.test");
        MockHttpServletResponse acceptedResponse = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        filter.doFilter(accepted, acceptedResponse, chain);
        assertThat(chain.getRequest()).isNotNull();
        assertThat(chain.getRequest().getInputStream().readAllBytes())
                .isEqualTo("{\"feedback\":true}".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void publicIntakeHasABoundedPerRemoteAddressWindowAndBodyLimit() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1);

        MockHttpServletRequest first = submissionRequest("{}");
        first.addHeader("Origin", "http://localhost:5173");
        filter.doFilter(first, new MockHttpServletResponse(), new MockFilterChain());

        MockHttpServletRequest second = submissionRequest("{}");
        second.addHeader("Origin", "http://localhost:5173");
        MockHttpServletResponse limited = new MockHttpServletResponse();
        filter.doFilter(second, limited, new MockFilterChain());
        assertThat(limited.getStatus()).isEqualTo(429);
        assertThat(limited.getHeader("Retry-After")).isEqualTo("60");

        GoalFeedbackPublicProtectionFilter sizeFilter = publicFilter(10);
        MockHttpServletRequest oversized = submissionRequest("x".repeat(
                GoalFeedbackSubmissionService.MAX_BODY_BYTES + 1));
        oversized.addHeader("Origin", "https://skillpilot.test");
        MockHttpServletResponse oversizedResponse = new MockHttpServletResponse();
        sizeFilter.doFilter(oversized, oversizedResponse, new MockFilterChain());
        assertThat(oversizedResponse.getStatus()).isEqualTo(413);
    }

    @Test
    void operationsAuthenticationFailsClosedAndDoesNotRequireABrowserOrigin() throws Exception {
        MockHttpServletRequest request = operationsRequest();

        assertThatThrownBy(() -> new GoalFeedbackOperatorAuthenticationFilter(""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("requires SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN");

        GoalFeedbackOperatorAuthenticationFilter configured =
                new GoalFeedbackOperatorAuthenticationFilter(TOKEN);
        MockHttpServletResponse missing = new MockHttpServletResponse();
        configured.doFilter(operationsRequest(), missing, new MockFilterChain());
        assertThat(missing.getStatus()).isEqualTo(401);

        MockHttpServletRequest wrongRequest = operationsRequest();
        wrongRequest.addHeader("Authorization", "Bearer wrong");
        MockHttpServletResponse wrong = new MockHttpServletResponse();
        configured.doFilter(wrongRequest, wrong, new MockFilterChain());
        assertThat(wrong.getStatus()).isEqualTo(401);

        MockHttpServletRequest acceptedRequest = operationsRequest();
        acceptedRequest.addHeader("Authorization", "Bearer " + TOKEN);
        acceptedRequest.addHeader("Origin", "https://unrelated-cli-origin.example");
        MockFilterChain chain = new MockFilterChain();
        configured.doFilter(acceptedRequest, new MockHttpServletResponse(), chain);
        assertThat(chain.getRequest()).isSameAs(acceptedRequest);
    }

    private static GoalFeedbackPublicProtectionFilter publicFilter(int requests) {
        return new GoalFeedbackPublicProtectionFilter(
                "https://skillpilot.test/path-is-ignored",
                "http://localhost:5173",
                requests,
                Duration.ofMinutes(1),
                10,
                Clock.fixed(Instant.parse("2026-08-30T10:00:00Z"), ZoneOffset.UTC));
    }

    private static MockHttpServletRequest submissionRequest(String body) {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST", GoalFeedbackPublicProtectionFilter.SUBMISSION_PATH);
        request.setRemoteAddr("192.0.2.12");
        request.setContentType("application/json");
        request.setContent(body.getBytes(StandardCharsets.UTF_8));
        return request;
    }

    private static MockHttpServletRequest operationsRequest() {
        return new MockHttpServletRequest(
                "POST", "/api/operations/goal-feedback/v1/export-batches");
    }
}
