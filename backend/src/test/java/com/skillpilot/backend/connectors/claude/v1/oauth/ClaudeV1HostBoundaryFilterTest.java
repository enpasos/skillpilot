package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClaudeV1HostBoundaryFilterTest {

    private final ClaudeV1HostBoundaryFilter filter = new ClaudeV1HostBoundaryFilter(new ClaudeV1Properties());

    @Test
    void forwardedAppearanceCannotTurnAnExternalBackendPeerIntoTheTrustedEdge() throws Exception {
        MockHttpServletRequest raw = new MockHttpServletRequest("POST", ClaudeV1Contract.INTERNAL_MCP_PATH);
        raw.setRemoteAddr("203.0.113.42");
        HttpServletRequest wrapped = expectedPublicRequest(raw, "/mcp");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean();

        filter.doFilter(wrapped, response, (request, result) -> invoked.set(true));

        assertEquals(404, response.getStatus());
        assertFalse(invoked.get());
    }

    @Test
    void trustedLoopbackEdgeAndExactResolvedOriginReachTheConnector() throws Exception {
        MockHttpServletRequest raw = new MockHttpServletRequest("POST", ClaudeV1Contract.INTERNAL_MCP_PATH);
        raw.setRemoteAddr("127.0.0.1");
        HttpServletRequest wrapped = expectedPublicRequest(raw, "/mcp");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicBoolean invoked = new AtomicBoolean();

        filter.doFilter(wrapped, response, (request, result) -> invoked.set(true));

        assertEquals(200, response.getStatus());
        assertTrue(invoked.get());
    }

    private static HttpServletRequest expectedPublicRequest(
            MockHttpServletRequest raw,
            String resolvedRequestUri) {
        return new HttpServletRequestWrapper(raw) {
            @Override
            public String getScheme() {
                return "https";
            }

            @Override
            public String getServerName() {
                return "mcp-claude-v1.skillpilot.com";
            }

            @Override
            public int getServerPort() {
                return 443;
            }

            @Override
            public String getRequestURI() {
                return resolvedRequestUri;
            }
        };
    }
}
