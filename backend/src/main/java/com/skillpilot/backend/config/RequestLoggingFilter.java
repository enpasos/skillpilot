package com.skillpilot.backend.config;

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
        String pathValue = (aiTracePath == null || aiTracePath.isBlank())
                ? "tmp/ai-trace.jsonl"
                : aiTracePath;
        Path path = Paths.get(pathValue);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("ts", Instant.now().toString());
        entry.put("method", request.getMethod());
        entry.put("path", request.getRequestURI());
        entry.put("query", request.getQueryString());
        entry.put("status", response.getStatus());
        entry.put("durationMs", duration);
        entry.put("skillpilotId", extractSkillpilotId(request.getRequestURI()));
        entry.put("requestBody", truncate(requestBody));
        entry.put("responseBody", truncate(responseBody));

        try {
            String line = objectMapper.writeValueAsString(entry) + System.lineSeparator();
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
}
