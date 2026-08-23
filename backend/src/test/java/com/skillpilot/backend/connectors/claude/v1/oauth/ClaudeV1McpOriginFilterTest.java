package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
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

    @Test
    void nonMcpPathsAreNotOriginFilteredEvenWithABrowserOrigin() throws Exception {
        for (String path : new String[] {
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH,
                ClaudeV1Contract.INTERNAL_TOKEN_PATH}) {
            MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
            request.addHeader("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL);

            Result result = filter(request);

            assertEquals(200, result.response().getStatus(), () -> "Path was " + path);
            assertTrue(result.chainInvoked(), () -> "Path was " + path);
        }
    }

    @Test
    void anUnresolvableRawUriDoesNotTurnTheFilterOnForEveryPath() throws Exception {
        // When wrapper depth defeats raw-URI resolution the filter must fall back to the container
        // URI. Filtering everything would reject the OAuth endpoints with 403.
        MockHttpServletRequest authorize =
                new MockHttpServletRequest("GET", ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH);
        authorize.addHeader("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL);

        Result result = filterWrapped(authorize);

        assertEquals(200, result.response().getStatus());
        assertTrue(result.chainInvoked());
    }

    @Test
    void anUnresolvableRawUriStillEnforcesTheOriginOnTheMcpPath() throws Exception {
        MockHttpServletRequest mcp = request();
        mcp.addHeader("Origin", "https://attacker.example");

        Result result = filterWrapped(mcp);

        assertEquals(403, result.response().getStatus());
        assertFalse(result.chainInvoked());
    }

    /** Nests the request deeper than {@code RawHttpServletRequest} unwraps, so the raw URI is null. */
    private Result filterWrapped(MockHttpServletRequest request) throws Exception {
        HttpServletRequest wrapped = request;
        for (int depth = 0; depth < 20; depth++) {
            wrapped = new HttpServletRequestWrapper(wrapped);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean();
        filter.doFilter(wrapped, response, (ignoredRequest, ignoredResponse) -> invoked.set(true));
        return new Result(response, invoked.get());
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
