package com.skillpilot.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final Object AI_TRACE_LOCK = new Object();

    private final ObjectMapper objectMapper;

    @Value("${skillpilot.ai.trace.enabled:false}")
    private boolean aiTraceEnabled;

    @Value("${skillpilot.ai.trace.path:}")
    private String aiTracePath;

    @Value("${skillpilot.ai.trace.max-body-chars:50000}")
    private int aiTraceMaxBodyChars;

    public RequestLoggingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request, 50000);
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        try {
            filterChain.doFilter(requestWrapper, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String requestBody = new String(requestWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
            String responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);

            logger.info("API Request: {} {} | Status: {} | Duration: {}ms",
                    request.getMethod(), request.getRequestURI(), response.getStatus(), duration);

            if (!requestBody.isBlank()) {
                logger.info("Request Body: {}", requestBody);
            }

            if (!responseBody.isBlank()) {
                // Limit response logging to avoid flooding logs with huge JSONs if needed,
                // but for debugging purposes we log it all or a reasonable prefix.
                // For now, let's log it all as requested.
                logger.info("Response Body: {}", responseBody);
            }

            if (aiTraceEnabled && request.getRequestURI().startsWith("/api/ai")) {
                writeAiTrace(request, response, duration, requestBody, responseBody);
            }

            responseWrapper.copyBodyToResponse();
        }
    }

    private void writeAiTrace(HttpServletRequest request,
                              HttpServletResponse response,
                              long duration,
                              String requestBody,
                              String responseBody) {
        Path path = resolveAiTracePath();
        String skillpilotId = resolveSkillpilotId(request.getRequestURI(), requestBody, responseBody);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("ts", Instant.now().toString());
        entry.put("method", request.getMethod());
        entry.put("path", request.getRequestURI());
        entry.put("query", request.getQueryString());
        entry.put("status", response.getStatus());
        entry.put("durationMs", duration);
        entry.put("skillpilotId", skillpilotId);
        entry.put("requestBody", formatBodyForTrace(requestBody));
        entry.put("responseBody", formatBodyForTrace(responseBody));

        try {
            String line = objectMapper.writeValueAsString(entry) + System.lineSeparator();
            writeTraceLine(path, line);
            writeTraceLine(resolvePerLearnerTracePath(path, skillpilotId), line);
        } catch (IOException e) {
            logger.warn("Failed to serialize AI trace entry", e);
        }
    }

    private Path resolveAiTracePath() {
        String pathValue = (aiTracePath == null || aiTracePath.isBlank())
                ? "tmp/ai-trace.jsonl"
                : aiTracePath;
        return Paths.get(pathValue);
    }

    private Path resolvePerLearnerTracePath(Path basePath, String skillpilotId) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            return null;
        }
        String safeId = sanitizeSkillpilotId(skillpilotId);
        Path parent = basePath.getParent();
        if (parent == null) {
            parent = Paths.get("tmp");
        }
        return parent.resolve("ai-trace-" + safeId + ".jsonl");
    }

    private void writeTraceLine(Path path, String line) {
        if (path == null) {
            return;
        }
        try {
            synchronized (AI_TRACE_LOCK) {
                Path parent = path.getParent();
                if (parent != null) {
                    Files.createDirectories(parent);
                }
                Files.writeString(path, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            }
        } catch (IOException e) {
            logger.warn("Failed to write AI trace log to {}", path, e);
        }
    }

    private String truncate(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        if (value.length() <= aiTraceMaxBodyChars) {
            return value;
        }
        return value.substring(0, aiTraceMaxBodyChars) + "...(truncated)";
    }

    private Object formatBodyForTrace(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        if (body.length() > aiTraceMaxBodyChars) {
            return truncate(body);
        }
        try {
            return objectMapper.readTree(body);
        } catch (IOException e) {
            return body;
        }
    }

    private String resolveSkillpilotId(String uri, String requestBody, String responseBody) {
        String skillpilotId = extractSkillpilotId(uri);
        if (!skillpilotId.isBlank()) {
            return skillpilotId;
        }
        skillpilotId = extractSkillpilotIdFromJson(requestBody);
        if (!skillpilotId.isBlank()) {
            return skillpilotId;
        }
        return extractSkillpilotIdFromJson(responseBody);
    }

    private String extractSkillpilotIdFromJson(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            JsonNode direct = node.get("skillpilotId");
            if (direct != null && !direct.asText("").isBlank()) {
                return direct.asText("");
            }
            JsonNode state = node.get("state");
            if (state != null) {
                JsonNode nested = state.get("skillpilotId");
                if (nested != null && !nested.asText("").isBlank()) {
                    return nested.asText("");
                }
            }
        } catch (IOException ignored) {
            return "";
        }
        return "";
    }

    private String extractSkillpilotId(String uri) {
        if (uri == null) {
            return "";
        }
        String[] parts = uri.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if ("learners".equals(parts[i])) {
                return parts[i + 1];
            }
        }
        return "";
    }

    private String sanitizeSkillpilotId(String value) {
        return value.replaceAll("[^A-Za-z0-9._-]", "_");
    }
}
