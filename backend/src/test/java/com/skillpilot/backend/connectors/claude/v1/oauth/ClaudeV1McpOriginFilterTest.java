package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClaudeV1McpOriginFilterTest {

    private final ClaudeV1McpOriginFilter filter = new ClaudeV1McpOriginFilter();

    @Test
    void nonBrowserClientWithoutOriginIsAccepted() throws Exception {
        Result result = filter(request());

        assertEquals(200, result.response().getStatus());
        assertTrue(result.chainInvoked());
    }

    @Test
    void exactHostedClaudeOriginIsAccepted() throws Exception {
        MockHttpServletRequest request = request();
        request.addHeader("Origin", "https://claude.ai");

        Result result = filter(request);

        assertEquals(200, result.response().getStatus());
        assertTrue(result.chainInvoked());
    }

    @Test
    void unknownNullAndMultipleOriginsAreRejected() throws Exception {
        for (String origin : new String[] {"https://attacker.example", "null", "https://claude.ai/"}) {
            MockHttpServletRequest request = request();
            request.addHeader("Origin", origin);
            Result result = filter(request);
            assertEquals(403, result.response().getStatus(), () -> "Origin was " + origin);
            assertFalse(result.chainInvoked());
        }

        MockHttpServletRequest duplicate = request();
        duplicate.addHeader("Origin", "https://claude.ai");
        duplicate.addHeader("Origin", "https://attacker.example");
        Result result = filter(duplicate);
        assertEquals(403, result.response().getStatus());
        assertFalse(result.chainInvoked());
    }

    private Result filter(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean();
        filter.doFilter(request, response, (ignoredRequest, ignoredResponse) -> invoked.set(true));
        return new Result(response, invoked.get());
    }

    private static MockHttpServletRequest request() {
        return new MockHttpServletRequest("POST", ClaudeV1Contract.INTERNAL_MCP_PATH);
    }

    private record Result(MockHttpServletResponse response, boolean chainInvoked) {}
}
