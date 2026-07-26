package com.skillpilot.backend.openai.de.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Defense in depth for the OpenAI-DE MCP resource.
 *
 * <p>TLS certificate validation happens at nginx. This filter prevents a
 * publicly reachable backend port or forged client headers from bypassing
 * that edge: the request must come from an explicitly trusted local proxy and
 * carry the two headers which the mTLS-only nginx location overwrites after
 * successful certificate validation.</p>
 *
 * <p>OAuth and well-known discovery endpoints deliberately remain outside
 * this filter because browsers must be able to reach them without an OpenAI
 * client certificate.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.de.enabled",
            "skillpilot.openai.de.mtls-edge.enabled"
        },
        havingValue = "true")
public final class OpenAiDeMtlsEdgeFilter extends OncePerRequestFilter {

    public static final String VERIFIED_HEADER = "X-SkillPilot-OpenAI-mTLS-Verified";
    public static final String SAN_HEADER = "X-SkillPilot-OpenAI-mTLS-SAN";
    public static final String VERIFIED_VALUE = "SUCCESS";
    public static final String EXPECTED_SAN = "mtls.prod.connectors.openai.com";

    private static final String MCP_PATH = "/api/openai/de/mcp";

    private final Set<String> trustedProxyAddresses;

    public OpenAiDeMtlsEdgeFilter(
            @Value("${skillpilot.openai.de.mtls-edge.trusted-proxies:127.0.0.1,::1}")
            String trustedProxies) {
        trustedProxyAddresses = Arrays.stream(trustedProxies.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .map(OpenAiDeMtlsEdgeFilter::normalizeNumericAddress)
                .collect(Collectors.toUnmodifiableSet());
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !(path.equals(MCP_PATH) || path.startsWith(MCP_PATH + "/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (!trustedProxyAddresses.contains(normalizeNumericAddress(request.getRemoteAddr()))
                || !VERIFIED_VALUE.equals(request.getHeader(VERIFIED_HEADER))
                || !EXPECTED_SAN.equals(request.getHeader(SAN_HEADER))) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.setHeader(HttpHeaders.PRAGMA, "no-cache");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write("{\"error\":\"mcp_client_not_authorized\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static String normalizeNumericAddress(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String candidate = value.trim();
        if (!candidate.matches("[0-9a-fA-F:.]+")) {
            return "";
        }
        try {
            return InetAddress.getByName(candidate).getHostAddress();
        } catch (UnknownHostException exception) {
            return "";
        }
    }
}
