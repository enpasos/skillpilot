package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
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
    void rejectedPostRequestsDoNotConsumeTheValidatedSubmissionWindow() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1);

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

        MockHttpServletRequest oversized = submissionRequest("x".repeat(
                GoalFeedbackSubmissionService.MAX_BODY_BYTES + 1));
        oversized.addHeader("Origin", "https://skillpilot.test");
        MockHttpServletResponse oversizedResponse = new MockHttpServletResponse();
        filter.doFilter(oversized, oversizedResponse, new MockFilterChain());
        assertThat(oversizedResponse.getStatus()).isEqualTo(413);

        MockHttpServletRequest accepted = submissionRequest("{}");
        accepted.addHeader("Origin", "https://skillpilot.test");
        MockFilterChain acceptedChain = new MockFilterChain();
        filter.doFilter(accepted, new MockHttpServletResponse(), acceptedChain);
        assertThat(acceptedChain.getRequest()).isNotNull();

        MockHttpServletRequest limited = submissionRequest("{}");
        limited.addHeader("Origin", "https://skillpilot.test");
        MockHttpServletResponse limitedResponse = new MockHttpServletResponse();
        filter.doFilter(limited, limitedResponse, new MockFilterChain());
        assertThat(limitedResponse.getStatus()).isEqualTo(429);
    }

    @Test
    void publicContextAndSubmissionUseIndependentBoundedWindows() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1);

        MockHttpServletRequest firstContext = new MockHttpServletRequest(
                "GET", GoalFeedbackPublicProtectionFilter.CONTEXT_PATH);
        firstContext.setRemoteAddr("192.0.2.20");
        MockFilterChain acceptedContext = new MockFilterChain();
        filter.doFilter(firstContext, new MockHttpServletResponse(), acceptedContext);
        assertThat(acceptedContext.getRequest()).isSameAs(firstContext);

        MockHttpServletRequest firstSubmission = submissionRequest("{}");
        firstSubmission.setRemoteAddr("192.0.2.20");
        firstSubmission.addHeader("Origin", "https://skillpilot.test");
        MockFilterChain acceptedSubmission = new MockFilterChain();
        filter.doFilter(firstSubmission, new MockHttpServletResponse(), acceptedSubmission);
        assertThat(acceptedSubmission.getRequest()).isNotNull();

        MockHttpServletRequest secondContext = new MockHttpServletRequest(
                "GET", GoalFeedbackPublicProtectionFilter.CONTEXT_PATH);
        secondContext.setRemoteAddr("192.0.2.20");
        MockHttpServletResponse limitedContext = new MockHttpServletResponse();
        filter.doFilter(secondContext, limitedContext, new MockFilterChain());
        assertThat(limitedContext.getStatus()).isEqualTo(429);
        assertThat(limitedContext.getHeader("Retry-After")).isEqualTo("60");

        MockHttpServletRequest secondSubmission = submissionRequest("{}");
        secondSubmission.setRemoteAddr("192.0.2.20");
        secondSubmission.addHeader("Origin", "https://skillpilot.test");
        MockHttpServletResponse limitedSubmission = new MockHttpServletResponse();
        filter.doFilter(secondSubmission, limitedSubmission, new MockFilterChain());
        assertThat(limitedSubmission.getStatus()).isEqualTo(429);
        assertThat(limitedSubmission.getHeader("Retry-After")).isEqualTo("60");

        MockHttpServletRequest unrelated = new MockHttpServletRequest(
                "GET", "/api/public/goal-feedback/v1/not-a-route");
        MockFilterChain unrelatedChain = new MockFilterChain();
        filter.doFilter(unrelated, new MockHttpServletResponse(), unrelatedChain);
        assertThat(unrelatedChain.getRequest()).isSameAs(unrelated);
    }

    @Test
    void knownClientsKeepTheirCounterWhenTheClientMapIsFull() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1, 2);

        assertThat(contextStatus(filter, "192.0.2.1")).isEqualTo(200);
        assertThat(contextStatus(filter, "192.0.2.2")).isEqualTo(200);
        assertThat(filter.contextClientBucketCount()).isEqualTo(2);

        // A full map must not redirect a known, exhausted client to a fresh
        // overflow counter.
        assertThat(contextStatus(filter, "192.0.2.1")).isEqualTo(429);

        // One genuinely new client can use the separate overflow counter; all
        // further new clients share that already exhausted counter.
        assertThat(contextStatus(filter, "192.0.2.3")).isEqualTo(200);
        assertThat(contextStatus(filter, "192.0.2.4")).isEqualTo(429);
        assertThat(filter.contextClientBucketCount()).isEqualTo(2);
        assertThat(filter.submissionClientBucketCount()).isZero();
    }

    @Test
    void concurrentNewClientsCannotExceedTheStrictBucketBound() throws Exception {
        int maximumClients = 8;
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1, maximumClients);
        CountDownLatch start = new CountDownLatch(1);
        ArrayList<Future<Integer>> responses = new ArrayList<>();

        try (var executor = Executors.newFixedThreadPool(32)) {
            for (int index = 0; index < 64; index++) {
                String remoteAddress = "198.51.100." + index;
                responses.add(executor.submit(() -> {
                    start.await();
                    return contextStatus(filter, remoteAddress);
                }));
            }
            start.countDown();
            long accepted = 0;
            for (Future<Integer> response : responses) {
                if (response.get() == 200) {
                    accepted++;
                }
            }
            assertThat(accepted).isEqualTo(maximumClients + 1L);
        }

        assertThat(filter.contextClientBucketCount()).isEqualTo(maximumClients);
    }

    @Test
    void matrixParametersCannotBypassOrBroadenThePublicBoundary() throws Exception {
        GoalFeedbackPublicProtectionFilter filter = publicFilter(1);

        MockHttpServletRequest rejectedSubmission = new MockHttpServletRequest(
                "POST", "/api/public/goal-feedback;probe=1/v1/submissions");
        rejectedSubmission.setContentType("application/json");
        rejectedSubmission.setContent("{}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse rejectedResponse = new MockHttpServletResponse();
        filter.doFilter(rejectedSubmission, rejectedResponse, new MockFilterChain());
        assertThat(rejectedResponse.getStatus()).isEqualTo(403);

        MockHttpServletRequest acceptedSubmission = new MockHttpServletRequest(
                "POST", "/api/public/goal-feedback;probe=1/v1/submissions");
        acceptedSubmission.setContentType("application/json");
        acceptedSubmission.setContent("{}".getBytes(StandardCharsets.UTF_8));
        acceptedSubmission.addHeader("Origin", "https://skillpilot.test");
        MockFilterChain acceptedChain = new MockFilterChain();
        filter.doFilter(acceptedSubmission, new MockHttpServletResponse(), acceptedChain);
        assertThat(acceptedChain.getRequest()).isNotNull();

        MockHttpServletRequest firstContext = new MockHttpServletRequest(
                "GET", "/api/public/goal-feedback/v1/context;probe=1");
        MockFilterChain contextChain = new MockFilterChain();
        filter.doFilter(firstContext, new MockHttpServletResponse(), contextChain);
        assertThat(contextChain.getRequest()).isSameAs(firstContext);

        MockHttpServletRequest limitedContext = new MockHttpServletRequest(
                "HEAD", "/api/public;probe=1/goal-feedback/v1/context");
        MockHttpServletResponse limitedResponse = new MockHttpServletResponse();
        filter.doFilter(limitedContext, limitedResponse, new MockFilterChain());
        assertThat(limitedResponse.getStatus()).isEqualTo(429);

        MockHttpServletRequest nonControllerPath = new MockHttpServletRequest(
                "POST", "/api/public/goal-feedback/v1/submissions/extra");
        MockFilterChain nonControllerChain = new MockFilterChain();
        filter.doFilter(nonControllerPath, new MockHttpServletResponse(), nonControllerChain);
        assertThat(nonControllerChain.getRequest()).isSameAs(nonControllerPath);
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

    @Test
    void matrixParametersCannotBypassOrBroadenOperationsAuthentication() throws Exception {
        GoalFeedbackOperatorAuthenticationFilter filter =
                new GoalFeedbackOperatorAuthenticationFilter(TOKEN);

        MockHttpServletRequest collection = new MockHttpServletRequest(
                "POST", "/api/operations/goal-feedback;probe=1/v1/export-batches");
        MockHttpServletResponse collectionResponse = new MockHttpServletResponse();
        filter.doFilter(collection, collectionResponse, new MockFilterChain());
        assertThat(collectionResponse.getStatus()).isEqualTo(401);

        MockHttpServletRequest item = new MockHttpServletRequest(
                "GET", "/api;probe=1/operations/goal-feedback/v1/export-batches/"
                        + java.util.UUID.randomUUID());
        MockHttpServletResponse itemResponse = new MockHttpServletResponse();
        filter.doFilter(item, itemResponse, new MockFilterChain());
        assertThat(itemResponse.getStatus()).isEqualTo(401);

        MockHttpServletRequest accepted = new MockHttpServletRequest(
                "POST", "/api/operations/goal-feedback/v1/export-batches;probe=1");
        accepted.addHeader("Authorization", "Bearer " + TOKEN);
        MockFilterChain acceptedChain = new MockFilterChain();
        filter.doFilter(accepted, new MockHttpServletResponse(), acceptedChain);
        assertThat(acceptedChain.getRequest()).isSameAs(accepted);

        MockHttpServletRequest nonControllerPath = new MockHttpServletRequest(
                "POST", "/api/operations/goal-feedback/v1/export-batches/one/two");
        MockFilterChain nonControllerChain = new MockFilterChain();
        filter.doFilter(nonControllerPath, new MockHttpServletResponse(), nonControllerChain);
        assertThat(nonControllerChain.getRequest()).isSameAs(nonControllerPath);
    }

    private static GoalFeedbackPublicProtectionFilter publicFilter(int requests) {
        return publicFilter(requests, 10);
    }

    private static GoalFeedbackPublicProtectionFilter publicFilter(int requests, int maximumClients) {
        return new GoalFeedbackPublicProtectionFilter(
                "https://skillpilot.test/path-is-ignored",
                "http://localhost:5173",
                requests,
                Duration.ofMinutes(1),
                maximumClients,
                Clock.fixed(Instant.parse("2026-08-30T10:00:00Z"), ZoneOffset.UTC));
    }

    private static int contextStatus(
            GoalFeedbackPublicProtectionFilter filter,
            String remoteAddress) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET", GoalFeedbackPublicProtectionFilter.CONTEXT_PATH);
        request.setRemoteAddr(remoteAddress);
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response.getStatus();
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
