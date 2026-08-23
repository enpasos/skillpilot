package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClaudeV1OAuthBoundaryFilterTest {

    private static final int BUDGET = 3;

    @Test
    void theAbuseBudgetIsNotSharedAcrossCallersOfTheSameClient() throws Exception {
        // Both CIMD client identities are shared by the whole user base. Keying the budget on
        // client_id alone would put every learner into one bucket, so the peer address must
        // continue to separate callers.
        ClaudeV1OAuthBoundaryFilter filter = filter();
        AtomicInteger passed = new AtomicInteger();

        for (int attempt = 0; attempt < BUDGET + 2; attempt++) {
            call(filter, authorize(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, "198.51.100.7"), passed);
        }
        assertEquals(BUDGET, passed.get(), "First caller must be limited to its own budget");

        AtomicInteger otherCaller = new AtomicInteger();
        call(filter, authorize(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, "203.0.113.9"), otherCaller);
        assertEquals(1, otherCaller.get(), "A different caller must not inherit an exhausted budget");
    }

    @Test
    void theTwoClaudeLanesDoNotShareOneBudget() throws Exception {
        ClaudeV1OAuthBoundaryFilter filter = filter();
        AtomicInteger hosted = new AtomicInteger();

        for (int attempt = 0; attempt < BUDGET + 2; attempt++) {
            call(filter, authorize(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, "198.51.100.7"), hosted);
        }
        assertEquals(BUDGET, hosted.get());

        AtomicInteger claudeCode = new AtomicInteger();
        call(filter, authorize(ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, "198.51.100.7"), claudeCode);
        assertEquals(1, claudeCode.get(), "A second client identity must have its own budget");
    }

    private static ClaudeV1OAuthBoundaryFilter filter() {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setMaxOAuthRequestsPerCallerPerMinute(BUDGET);
        return new ClaudeV1OAuthBoundaryFilter(properties);
    }

    private static MockHttpServletRequest authorize(String clientId, String remoteAddr) {
        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH);
        request.setParameter("client_id", clientId);
        request.setRemoteAddr(remoteAddr);
        return request;
    }

    private static void call(
            ClaudeV1OAuthBoundaryFilter filter,
            MockHttpServletRequest request,
            AtomicInteger passed) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> passed.incrementAndGet());
    }
}
