package com.skillpilot.backend.openai.de.mtls;

import com.skillpilot.backend.config.RawHttpServletRequest;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeProperties.MtlsEdgeMode;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.server.PathContainer;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

/**
 * Verifies the classification produced by the root-owned OpenAI V1 mTLS edge.
 *
 * <p>This is a defense-in-depth assertion, not a replacement for TLS client
 * certificate validation in Nginx. It applies only to the internal MCP route,
 * rejects mode drift, and trusts edge headers only when the raw transport peer
 * is loopback. OAuth, discovery, the domain challenge, and first-party UI
 * routes deliberately remain outside this filter.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@ConditionalOnExpression(
        "${skillpilot.openai.coach.v1.enabled:false} || "
                + "${skillpilot.openai.coach.v1.bootstrap-enabled:false}")
public final class OpenAiDeMtlsEdgeClassificationFilter extends OncePerRequestFilter {

    public static final String CLASSIFICATION_HEADER =
            "X-SkillPilot-OpenAI-mTLS-Classification";
    public static final String MODE_HEADER = "X-SkillPilot-OpenAI-mTLS-Mode";
    public static final String SAN_HEADER = "X-SkillPilot-OpenAI-mTLS-SAN";
    public static final String EXPECTED_OPENAI_SAN = "mtls.prod.connectors.openai.com";
    public static final String EXPECTED_EDGE_HOST = "mcp-coach-v1.skillpilot.com";

    static final String VERIFIED = "VERIFIED";
    static final String OBSERVE_NO_CERT = "OBSERVE_NO_CERT";
    static final String LOCAL_OPERATOR = "LOCAL_OPERATOR";

    private static final String REJECTION_BODY = "{\"error\":\"forbidden\"}";
    private static final PathPattern INTERNAL_V1_NAMESPACE =
            PathPatternParser.defaultInstance.parse("/internal/openai/v1/**");

    private final MtlsEdgeMode mode;
    private final OpenAiDeOperationalTelemetry telemetry;

    public OpenAiDeMtlsEdgeClassificationFilter(
            OpenAiDeProperties properties,
            OpenAiDeOperationalTelemetry telemetry) {
        this.mode = properties.getMtlsEdgeMode();
        this.telemetry = telemetry;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        HttpServletRequest rawRequest = RawHttpServletRequest.unwrap(request);
        if (rawRequest == null) {
            return false;
        }
        String path = rawRequest.getRequestURI();
        if (isPublicInternalSupportPath(path) || !isInternalV1Namespace(path)) {
            return true;
        }
        return mode == MtlsEdgeMode.DISABLED
                && !hasAnyEdgeHeader(rawRequest);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        HttpServletRequest rawRequest = RawHttpServletRequest.unwrap(request);
        if (mode == null
                || mode == MtlsEdgeMode.DISABLED
                || rawRequest == null
                || !isLoopbackAddress(rawRequest.getRemoteAddr())
                || !headerValues(rawRequest, HttpHeaders.HOST).equals(List.of(EXPECTED_EDGE_HOST))) {
            reject(response);
            return;
        }

        String headerMode = exactlyOneHeader(rawRequest, MODE_HEADER);
        String classification = exactlyOneHeader(rawRequest, CLASSIFICATION_HEADER);
        if (headerMode == null
                || classification == null
                || !mode.wireValue().equals(headerMode)
                || !isAllowedClassification(rawRequest, classification)) {
            reject(response);
            return;
        }

        if (OBSERVE_NO_CERT.equals(classification)) {
            telemetry.record(Event.MTLS_EDGE_OBSERVED_NO_CERT);
        } else if (VERIFIED.equals(classification)) {
            telemetry.record(Event.MTLS_EDGE_VERIFIED);
        } else if (LOCAL_OPERATOR.equals(classification)) {
            telemetry.record(Event.MTLS_EDGE_LOCAL_OPERATOR);
        }
        filterChain.doFilter(request, response);
    }

    private boolean isAllowedClassification(
            HttpServletRequest request,
            String classification) {
        List<String> sanValues = headerValues(request, SAN_HEADER);
        if (VERIFIED.equals(classification)) {
            return sanValues.equals(List.of(EXPECTED_OPENAI_SAN));
        }
        if (!sanValues.isEmpty()) {
            return false;
        }
        return switch (mode) {
            case OBSERVE -> OBSERVE_NO_CERT.equals(classification);
            case ENFORCE -> LOCAL_OPERATOR.equals(classification);
            case DISABLED -> false;
        };
    }

    private void reject(HttpServletResponse response) throws IOException {
        telemetry.record(Event.MTLS_EDGE_REJECTED);
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(REJECTION_BODY);
    }

    private static String exactlyOneHeader(
            HttpServletRequest request,
            String name) {
        List<String> values = headerValues(request, name);
        return values.size() == 1 ? values.getFirst() : null;
    }

    private static List<String> headerValues(
            HttpServletRequest request,
            String name) {
        return Collections.list(request.getHeaders(name));
    }

    private static boolean hasAnyEdgeHeader(HttpServletRequest request) {
        return !headerValues(request, MODE_HEADER).isEmpty()
                || !headerValues(request, CLASSIFICATION_HEADER).isEmpty()
                || !headerValues(request, SAN_HEADER).isEmpty();
    }

    /**
     * Unwraps framework forwarding wrappers so X-Forwarded-For can never turn
     * a non-loopback socket peer into a trusted edge peer.
     */
    static boolean isRawTransportPeerLoopback(HttpServletRequest request) {
        HttpServletRequest rawRequest = RawHttpServletRequest.unwrap(request);
        return rawRequest != null && isLoopbackAddress(rawRequest.getRemoteAddr());
    }

    private static boolean isInternalV1Namespace(String path) {
        if (path == null) {
            return false;
        }
        try {
            return INTERNAL_V1_NAMESPACE.matches(PathContainer.parsePath(path));
        } catch (IllegalArgumentException exception) {
            return path.startsWith("/internal/openai/v1/");
        }
    }

    private static boolean isPublicInternalSupportPath(String path) {
        return OpenAiDeV1ContractMetadata.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH.equals(path)
                || OpenAiDeV1ContractMetadata.INTERNAL_OPENAI_APPS_CHALLENGE_PATH.equals(path);
    }

    private static boolean isLoopbackAddress(String address) {
        return "127.0.0.1".equals(address)
                || "::1".equals(address)
                || "0:0:0:0:0:0:0:1".equals(address);
    }
}
