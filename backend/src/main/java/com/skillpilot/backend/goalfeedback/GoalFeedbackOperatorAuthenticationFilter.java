package com.skillpilot.backend.goalfeedback;

import com.skillpilot.backend.config.RawHttpServletRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Independent fail-closed bearer boundary for the production export API. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackOperatorAuthenticationFilter extends OncePerRequestFilter {

    public static final String OPERATIONS_PREFIX = "/api/operations/goal-feedback/v1";
    private final byte[] configuredTokenDigest;

    public GoalFeedbackOperatorAuthenticationFilter(
            @Value("${skillpilot.goal-feedback.operator-token:${SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN:}}")
                    String configuredToken) {
        if (configuredToken == null || configuredToken.isBlank() || configuredToken.length() < 32) {
            throw new IllegalStateException(
                    "Enabled goal feedback requires SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN with at least 32 characters");
        }
        this.configuredTokenDigest = sha256(configuredToken.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = RawHttpServletRequest.requestUri(request);
        return path == null || !(path.equals(OPERATIONS_PREFIX) || path.startsWith(OPERATIONS_PREFIX + "/"));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        java.util.Enumeration<String> authorizationHeaders = request.getHeaders(HttpHeaders.AUTHORIZATION);
        String authorization = authorizationHeaders != null && authorizationHeaders.hasMoreElements()
                ? authorizationHeaders.nextElement()
                : null;
        if (authorizationHeaders != null && authorizationHeaders.hasMoreElements()) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_operator_token");
            return;
        }
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_operator_token");
            return;
        }
        byte[] suppliedDigest = sha256(authorization.substring(7).getBytes(StandardCharsets.UTF_8));
        if (!MessageDigest.isEqual(configuredTokenDigest, suppliedDigest)) {
            reject(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_operator_token");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static void reject(HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        if (status == HttpServletResponse.SC_UNAUTHORIZED) {
            response.setHeader(HttpHeaders.WWW_AUTHENTICATE, "Bearer");
        }
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"" + code + "\"}");
    }

    private static byte[] sha256(byte[] value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
