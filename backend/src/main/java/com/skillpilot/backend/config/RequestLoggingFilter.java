package com.skillpilot.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
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
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

@Component
public class RequestLoggingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final Object AI_TRACE_LOCK = new Object();
    public static final String AI_TRACE_SKILLPILOT_ID_ATTRIBUTE = "skillpilot.ai.trace.skillpilotId";
    private static final String REDACTED = "<redacted>";
    private static final int OPERATIONAL_LOG_MAX_BODY_CHARS = 4000;

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

        boolean openAiMcp = isInternalOpenAiMcp(request.getRequestURI());
        if (!request.getRequestURI().startsWith("/api") && !openAiMcp) {
            filterChain.doFilter(request, response);
            return;
        }

        // The Custom GPT action regression probe has its own byte-accurate audit log.
        // MCP responses can contain an entire learner state inside a JSON-RPC text
        // field, which cannot be safely redacted as ordinary nested JSON. OAuth
        // token/authorization forms can likewise contain codes, verifiers or refresh
        // tokens. These protocol endpoints are therefore not body-logged here.
        String requestUri = request.getRequestURI();
        if (requestUri.equals("/api/action-regression")
                || requestUri.startsWith("/api/action-regression/")
                || requestUri.equals("/api/claude/mcp")
                || requestUri.startsWith("/api/claude/mcp/")
                || openAiMcp
                // OAuth token, authorization and revocation requests use form bodies.
                // Do not pass those credentials through the general JSON body logger.
                || requestUri.startsWith("/api/claude/oauth")
                || requestUri.startsWith("/api/openai/de/oauth")
                // The provider-start body carries a typed learner goal/curriculum
                // intent. It is not a credential, but it is still learner data and
                // therefore stays out of the generic request-body log.
                || (requestUri.startsWith("/api/ui/learners/")
                        && requestUri.contains("/openai/de/"))) {
            filterChain.doFilter(request, response);
            return;
        }

        // Skip response wrapping for SSE endpoints - they need to stay open!
        if (request.getRequestURI().contains("/updates/")) {
            logger.debug("Skipping response logging for SSE endpoint: {}", request.getRequestURI());
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
                    request.getMethod(), sanitizeUriForOperationalLog(request.getRequestURI()), response.getStatus(), duration);

            if (logger.isDebugEnabled()) {
                if (!requestBody.isBlank()) {
                    logger.debug("Request Body: {}", formatBodyForOperationalLog(requestBody));
                }
                if (!responseBody.isBlank()) {
                    logger.debug("Response Body: {}", formatBodyForOperationalLog(responseBody));
                }
            }

            if (aiTraceEnabled && request.getRequestURI().startsWith("/api/ai")) {
                writeAiTrace(request, response, duration, requestBody, responseBody);
            }

            responseWrapper.copyBodyToResponse();
        }
    }

    private static boolean isInternalOpenAiMcp(String requestUri) {
        return requestUri != null
                && (requestUri.equals(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH)
                        || requestUri.startsWith(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/"));
    }

    private void writeAiTrace(HttpServletRequest request,
            HttpServletResponse response,
            long duration,
            String requestBody,
            String responseBody) {
        Path path = resolveAiTracePath();
        TraceSubject traceSubject = resolveTraceSubject(request, requestBody, responseBody);
        String skillpilotRef = traceFileKey(traceSubject);
        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("ts", Instant.now().toString());
        entry.put("method", request.getMethod());
        entry.put("path", sanitizeUriForOperationalLog(request.getRequestURI()));
        entry.put("operationId", resolveAiOperationId(request.getMethod(), request.getRequestURI()));
        entry.put("query", sanitizeQueryForTrace(request.getQueryString()));
        entry.put("status", response.getStatus());
        entry.put("durationMs", duration);
        entry.put("traceSubjectType", traceSubject.type());
        entry.put("skillpilotRef", skillpilotRef);
        entry.put("requestBody", formatBodyForTrace(requestBody));
        entry.put("responseBody", formatBodyForTrace(responseBody));

        try {
            String line = objectMapper.writeValueAsString(entry) + System.lineSeparator();
            writeTraceLine(path, line);
            writeTraceLine(resolvePerLearnerTracePath(path, skillpilotRef), line);
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

    private Path resolvePerLearnerTracePath(Path basePath, String skillpilotRef) {
        if (skillpilotRef == null || skillpilotRef.isBlank()) {
            return null;
        }
        Path parent = basePath.getParent();
        if (parent == null) {
            parent = Paths.get("tmp");
        }
        return parent.resolve("ai-trace-" + skillpilotRef + ".jsonl");
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

    private String traceFileKey(TraceSubject traceSubject) {
        if (traceSubject == null || traceSubject.value() == null || traceSubject.value().isBlank()) {
            return "";
        }
        if ("skillpilotId".equals(traceSubject.type())) {
            return sanitizeTraceFileSegment(traceSubject.value());
        }
        return stableSensitiveRef(traceSubject.value());
    }

    private String sanitizeTraceFileSegment(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String sanitized = value.replaceAll("[^A-Za-z0-9._-]", "_");
        return sanitized.length() <= 128 ? sanitized : sanitized.substring(0, 128);
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

    Object formatBodyForTrace(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        if (body.length() > aiTraceMaxBodyChars) {
            return truncate(redactPlainText(body));
        }
        try {
            return redactJsonNode(objectMapper.readTree(body));
        } catch (IOException e) {
            return redactPlainText(body);
        }
    }

    String formatBodyForOperationalLog(String body) {
        if (body == null || body.isBlank()) {
            return "";
        }
        try {
            String serialized = objectMapper.writeValueAsString(redactJsonNode(objectMapper.readTree(body)));
            return truncateOperationalLogBody(serialized);
        } catch (IOException e) {
            return "<non-json body omitted>";
        }
    }

    String sanitizeUriForOperationalLog(String uri) {
        if (uri == null || uri.isBlank()) {
            return "";
        }
        return uri
                .replaceAll("(/api/(?:ui|ai/[^/]+)/learners/)[^/]+", "$1<skillpilotId>")
                .replaceAll("(/api/ui/updates/)[^/]+", "$1<skillpilotId>")
                .replaceAll("(/api/ai/[^/]+/sessions/)[^/]+", "$1<chatSessionToken>");
    }

    String stableSensitiveRef(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest, 0, 8);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available.", e);
        }
    }

    String resolveTraceSubjectType(String uri, String requestBody, String responseBody) {
        return resolveTraceSubject(uri, requestBody, responseBody).type();
    }

    String resolveTraceSubjectRef(String uri, String requestBody, String responseBody) {
        return traceFileKey(resolveTraceSubject(uri, requestBody, responseBody));
    }

    String resolveTraceSubjectType(HttpServletRequest request, String requestBody, String responseBody) {
        return resolveTraceSubject(request, requestBody, responseBody).type();
    }

    String resolveTraceSubjectRef(HttpServletRequest request, String requestBody, String responseBody) {
        return traceFileKey(resolveTraceSubject(request, requestBody, responseBody));
    }

    String resolveAiOperationId(String method, String uri) {
        String normalizedMethod = method == null ? "" : method.trim().toUpperCase(Locale.ROOT);
        String normalizedUri = uri == null ? "" : uri;
        if ("POST".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/chat-start/redeem/?$")) {
            return "redeemStartCode";
        }
        if ("GET".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/state/?$")) {
            return "getVisibleState";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/choice/?$")) {
            return "applyVisibleChoice";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/navigation/?$")) {
            return "requestVisibleNavigation";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/active-goal/?$")) {
            return "setVisibleActiveGoal";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/mastery/?$")) {
            return "setVisibleMastery";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/verified-recall/start/?$")) {
            return "startVisibleVerifiedRecall";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/verified-recall/answer/?$")) {
            return "getVisibleVerifiedRecallAnswer";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/verified-recall/result/?$")) {
            return "recordVisibleVerifiedRecallResult";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/visible/exam/evaluation/?$")) {
            return "getVisibleExamEvaluation";
        }
        if ("GET".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/state/?$")) {
            return "getLearnerState";
        }
        if ("POST".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/scope/?$")) {
            return "setScope";
        }
        if ("POST".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/active-goal/?$")) {
            return "setActiveGoal";
        }
        if ("POST".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/mastery/?$")) {
            return "setMastery";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/verified-recall/start/?$")) {
            return "startVerifiedRecall";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/verified-recall/answer/?$")) {
            return "getVerifiedRecallAnswer";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/verified-recall/result/?$")) {
            return "recordVerifiedRecallResult";
        }
        if ("POST".equals(normalizedMethod) && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/curriculum/?$")) {
            return "setCurriculum";
        }
        if ("POST".equals(normalizedMethod)
                && normalizedUri.matches(".*/api/ai/[^/]+/sessions/[^/]+/personalization/?$")) {
            return "setPersonalization";
        }
        return "";
    }

    private String sanitizeQueryForTrace(String query) {
        if (query == null || query.isBlank()) {
            return "";
        }
        String[] pairs = query.split("&");
        StringBuilder sanitized = new StringBuilder();
        for (String pair : pairs) {
            if (sanitized.length() > 0) {
                sanitized.append('&');
            }
            int separator = pair.indexOf('=');
            String key = separator >= 0 ? pair.substring(0, separator) : pair;
            String value = separator >= 0 ? pair.substring(separator + 1) : "";
            sanitized.append(key);
            if (separator >= 0) {
                sanitized.append('=')
                        .append(isSensitiveFieldName(key) ? REDACTED : redactPlainText(value));
            }
        }
        return sanitized.toString();
    }

    private JsonNode redactJsonNode(JsonNode node) {
        if (node == null || node.isNull()) {
            return node;
        }
        if (node.isObject()) {
            ObjectNode redacted = objectMapper.createObjectNode();
            Iterator<Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Entry<String, JsonNode> field = fields.next();
                if (isSensitiveFieldName(field.getKey())) {
                    redacted.put(field.getKey(), REDACTED);
                } else {
                    redacted.set(field.getKey(), redactJsonNode(field.getValue()));
                }
            }
            return redacted;
        }
        if (node.isArray()) {
            ArrayNode redacted = objectMapper.createArrayNode();
            for (JsonNode item : node) {
                redacted.add(redactJsonNode(item));
            }
            return redacted;
        }
        if (node.isTextual()) {
            return objectMapper.getNodeFactory().textNode(redactPlainText(node.asText()));
        }
        return node;
    }

    private boolean isSensitiveFieldName(String fieldName) {
        String normalized = fieldName == null
                ? ""
                : fieldName.replaceAll("[^A-Za-z0-9]", "").toLowerCase(Locale.ROOT);
        return normalized.contains("skillpilotid")
                || normalized.contains("learnerid")
                || normalized.contains("chatsessiontoken")
                || normalized.contains("startcode")
                || normalized.equals("promptcontext")
                || normalized.equals("authorization")
                || normalized.equals("password")
                || normalized.endsWith("password")
                || normalized.endsWith("token")
                || normalized.endsWith("secret");
    }

    private String redactPlainText(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value
                .replaceAll("sps_[A-Za-z0-9_-]+", "<chatSessionToken>")
                .replaceAll("SP-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}", "<startCode>");
    }

    private String truncateOperationalLogBody(String value) {
        if (value.length() <= OPERATIONAL_LOG_MAX_BODY_CHARS) {
            return value;
        }
        return value.substring(0, OPERATIONAL_LOG_MAX_BODY_CHARS) + "...(truncated)";
    }

    private TraceSubject resolveTraceSubject(HttpServletRequest request, String requestBody, String responseBody) {
        if (request != null) {
            Object attribute = request.getAttribute(AI_TRACE_SKILLPILOT_ID_ATTRIBUTE);
            if (attribute instanceof String skillpilotId && !skillpilotId.isBlank()) {
                return new TraceSubject("skillpilotId", skillpilotId);
            }
            return resolveTraceSubject(request.getRequestURI(), requestBody, responseBody);
        }
        return resolveTraceSubject("", requestBody, responseBody);
    }

    private TraceSubject resolveTraceSubject(String uri, String requestBody, String responseBody) {
        String skillpilotId = extractSkillpilotId(uri);
        if (!skillpilotId.isBlank()) {
            return new TraceSubject("skillpilotId", skillpilotId);
        }
        skillpilotId = extractSkillpilotIdFromJson(requestBody);
        if (!skillpilotId.isBlank()) {
            return new TraceSubject("skillpilotId", skillpilotId);
        }
        skillpilotId = extractSkillpilotIdFromJson(responseBody);
        if (!skillpilotId.isBlank()) {
            return new TraceSubject("skillpilotId", skillpilotId);
        }

        String chatSessionToken = extractPathSegmentAfter(uri, "sessions");
        if (!chatSessionToken.isBlank()) {
            return new TraceSubject("chatSessionToken", chatSessionToken);
        }
        chatSessionToken = extractTextFieldFromJson(responseBody, "chatSessionToken");
        if (!chatSessionToken.isBlank()) {
            return new TraceSubject("chatSessionToken", chatSessionToken);
        }
        chatSessionToken = extractTextFieldFromJson(requestBody, "chatSessionToken");
        if (!chatSessionToken.isBlank()) {
            return new TraceSubject("chatSessionToken", chatSessionToken);
        }

        String startCode = extractTextFieldFromJson(requestBody, "startCode");
        if (!startCode.isBlank()) {
            return new TraceSubject("startCode", startCode);
        }
        startCode = extractTextFieldFromJson(responseBody, "startCode");
        if (!startCode.isBlank()) {
            return new TraceSubject("startCode", startCode);
        }
        return new TraceSubject("", "");
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
        return extractPathSegmentAfter(uri, "learners");
    }

    private String extractPathSegmentAfter(String uri, String segment) {
        if (uri == null || segment == null || segment.isBlank()) {
            return "";
        }
        String[] parts = uri.split("/");
        for (int i = 0; i < parts.length - 1; i++) {
            if (segment.equals(parts[i]) && parts[i + 1] != null && !parts[i + 1].isBlank()) {
                return parts[i + 1];
            }
        }
        return "";
    }

    private String extractTextFieldFromJson(String body, String fieldName) {
        if (body == null || body.isBlank() || fieldName == null || fieldName.isBlank()) {
            return "";
        }
        try {
            JsonNode node = objectMapper.readTree(body);
            JsonNode direct = node.get(fieldName);
            if (direct != null && direct.isTextual() && !direct.asText("").isBlank()) {
                return direct.asText("");
            }
        } catch (IOException ignored) {
            return "";
        }
        return "";
    }

    private record TraceSubject(String type, String value) {
    }
}
