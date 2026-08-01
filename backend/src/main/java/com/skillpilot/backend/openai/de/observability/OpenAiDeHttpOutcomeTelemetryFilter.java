package com.skillpilot.backend.openai.de.observability;

import com.skillpilot.backend.openai.de.OpenAiAppsChallengeController;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthMetadataController;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeoutException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.filter.OncePerRequestFilter;

/** Observes only status classes and fixed flow names; request data is never recorded. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 30)
@ConditionalOnExpression(
        "${skillpilot.openai.coach.de.v1.enabled:false} || "
                + "${skillpilot.openai.coach.de.v1.bootstrap-enabled:false}")
public final class OpenAiDeHttpOutcomeTelemetryFilter extends OncePerRequestFilter {

    private static final String OPENAI_API_PREFIX = "/api/openai/de/";

    private final OpenAiDeOperationalTelemetry telemetry;

    public OpenAiDeHttpOutcomeTelemetryFilter(OpenAiDeOperationalTelemetry telemetry) {
        this.telemetry = telemetry;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !(path.startsWith(OPENAI_API_PREFIX)
                || path.equals(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH)
                || path.startsWith(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/")
                || OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH.equals(path)
                || OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH.equals(path)
                || OpenAiAppsChallengeController.PATH.equals(path)
                || isOpenAiUiPath(path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } catch (AsyncRequestTimeoutException exception) {
            telemetry.record(Event.TIMEOUT);
            throw exception;
        } catch (ServletException exception) {
            if (hasTimeoutCause(exception)) {
                telemetry.record(Event.TIMEOUT);
            }
            throw exception;
        } finally {
            int status = response.getStatus();
            telemetry.recordHttpStatus(status);
            if (status >= 400 && isOAuthProtocolPath(request.getRequestURI())) {
                telemetry.record(Event.OAUTH_FAILURE);
                if ("refresh_token".equals(request.getParameter("grant_type"))) {
                    telemetry.record(Event.REFRESH_FAILURE);
                }
            }
        }
    }

    private static boolean hasTimeoutCause(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof TimeoutException) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private static boolean isOAuthProtocolPath(String path) {
        return path != null && (path.startsWith("/api/openai/de/oauth2/")
                || path.equals("/api/openai/de/oauth/consent"));
    }

    private static boolean isOpenAiUiPath(String path) {
        return path != null
                && path.startsWith("/api/ui/learners/")
                && path.contains("/openai/de/");
    }
}
