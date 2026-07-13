package com.skillpilot.backend.actionregression;

import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;

@RestController
@RequestMapping(ActionRegressionService.PREFIX)
public class ActionRegressionController {

    private static final byte[] EMPTY_BODY = new byte[0];
    private static final Pattern CF_RAY_PATTERN = Pattern.compile("^[A-Za-z0-9-]{1,64}$");

    private final ActionRegressionService service;
    private final ActionRegressionAuditLogger auditLogger;
    private final AtomicLong requestSequence = new AtomicLong();

    public ActionRegressionController(
            ActionRegressionService service,
            ActionRegressionAuditLogger auditLogger) {
        this.service = service;
        this.auditLogger = auditLogger;
    }

    @GetMapping("/healthz")
    public void health(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RequestContext context = startRequest();
        byte[] responseBody = service.healthJson();
        writeAndAudit(
                request,
                response,
                context,
                "health_checked",
                HttpServletResponse.SC_OK,
                "application/json",
                BodyCapture.empty(),
                responseBody,
                Map.of());
    }

    @GetMapping(value = "/openapi.yaml")
    public void openApi(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RequestContext context = startRequest();
        byte[] responseBody = service.openApiBytes();
        writeAndAudit(
                request,
                response,
                context,
                "openapi_served",
                HttpServletResponse.SC_OK,
                "application/yaml",
                BodyCapture.empty(),
                responseBody,
                Map.of());
    }

    @GetMapping("/v1/probe")
    public void probe(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RequestContext context = startRequest();
        ActionRegressionService.Probe probe = service.issueProbe();
        byte[] responseBody = service.probeJson(probe);
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("probe_id", probe.probeId());
        details.put("token", probe.token());
        details.put("proof", probe.proof());
        writeAndAudit(
                request,
                response,
                context,
                "probe_issued",
                HttpServletResponse.SC_OK,
                "application/json",
                BodyCapture.empty(),
                responseBody,
                details);
    }

    @PostMapping("/v1/verify")
    public void verify(HttpServletRequest request, HttpServletResponse response) throws IOException {
        RequestContext context = startRequest();
        BodyCapture requestBody = readBody(request);

        if (requestBody.capturedBytes().length > ActionRegressionService.MAX_REQUEST_BODY_BYTES) {
            reject(
                    request,
                    response,
                    context,
                    HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE,
                    "payload_too_large",
                    "Request body exceeds 4096 bytes.",
                    requestBody);
            return;
        }

        if (!isApplicationJson(request.getContentType())) {
            reject(
                    request,
                    response,
                    context,
                    HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE,
                    "unsupported_media_type",
                    "Content-Type must be application/json.",
                    requestBody);
            return;
        }

        ActionRegressionService.VerificationInput input = service.parseVerification(requestBody.capturedBytes());
        if (input == null) {
            reject(
                    request,
                    response,
                    context,
                    HttpServletResponse.SC_BAD_REQUEST,
                    "invalid_request",
                    "Body must contain exactly the string fields probe_id, token, and proof in their documented formats.",
                    requestBody);
            return;
        }

        boolean proofValid = service.verify(input);
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("verify_called", true);
        details.put("probe_id", input.probeId());
        details.put("token", input.token());
        details.put("proof", input.proof());
        details.put("proof_valid", proofValid);
        writeAndAudit(
                request,
                response,
                context,
                "probe_verified",
                HttpServletResponse.SC_OK,
                "application/json",
                requestBody,
                service.verificationJson(input, proofValid),
                details);
    }

    private void reject(
            HttpServletRequest request,
            HttpServletResponse response,
            RequestContext context,
            int status,
            String error,
            String message,
            BodyCapture requestBody) throws IOException {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("verify_called", true);
        details.put("error", error);
        details.put("error_code", error);
        writeAndAudit(
                request,
                response,
                context,
                "probe_verification_rejected",
                status,
                "application/json",
                requestBody,
                service.errorJson(error, message),
                details);
    }

    private void writeAndAudit(
            HttpServletRequest request,
            HttpServletResponse response,
            RequestContext context,
            String eventName,
            int status,
            String contentType,
            BodyCapture requestBody,
            byte[] responseBody,
            Map<String, ?> details) throws IOException {
        response.setStatus(status);
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Regression-Request-Id", context.requestId());
        response.setContentType(contentType);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentLength(responseBody.length);
        response.getOutputStream().write(responseBody);
        response.flushBuffer();

        Map<String, Object> event = new LinkedHashMap<>();
        event.put("ts", Instant.now().toString());
        event.put("event", eventName);
        event.put("service", "skillpilot-action-regression");
        event.put("application_id", service.applicationId());
        event.put("hmac_key_id", service.hmacKeyId());
        event.put("request_id", context.requestId());
        event.put("request_sequence", context.sequence());
        event.put("request_started_at", context.startedAt().toString());
        event.put("method", request.getMethod());
        event.put("path", request.getRequestURI());
        event.put("selected_headers", selectedHeaders(request));
        event.put("request_body_bytes", requestBody.exactBytes());
        event.put("request_body_bytes_exact", requestBody.complete());
        event.put("request_body_observed_bytes", requestBody.observedBytes());
        event.put("request_body_capture_bytes", requestBody.capturedBytes().length);
        event.put("request_body_sha256", requestBody.complete()
                ? ActionRegressionService.sha256Hex(requestBody.capturedBytes())
                : null);
        event.put("request_body_capture_sha256", ActionRegressionService.sha256Hex(requestBody.capturedBytes()));
        event.put("request_body_truncated", !requestBody.complete());
        event.put("status", status);
        event.put("duration_ms", (System.nanoTime() - context.startedNanos()) / 1_000_000L);
        event.put("response_body_raw", new String(responseBody, StandardCharsets.UTF_8));
        event.put("response_body_bytes", responseBody.length);
        event.put("response_body_sha256", ActionRegressionService.sha256Hex(responseBody));
        event.put("response_committed", response.isCommitted());
        event.putAll(details);
        auditLogger.log(event);
    }

    private static BodyCapture readBody(HttpServletRequest request) throws IOException {
        try (ServletInputStream input = request.getInputStream();
                ByteArrayOutputStream capture = new ByteArrayOutputStream(ActionRegressionService.MAX_AUDIT_CAPTURE_BYTES)) {
            byte[] buffer = new byte[1024];
            long observed = 0;
            boolean complete = false;
            while (capture.size() <= ActionRegressionService.MAX_AUDIT_CAPTURE_BYTES) {
                int remainingWithSentinel = ActionRegressionService.MAX_AUDIT_CAPTURE_BYTES - capture.size() + 1;
                int count = input.read(buffer, 0, Math.min(buffer.length, remainingWithSentinel));
                if (count < 0) {
                    complete = true;
                    break;
                }
                observed += count;
                int captureCount = Math.min(
                        count,
                        ActionRegressionService.MAX_AUDIT_CAPTURE_BYTES - capture.size());
                if (captureCount > 0) {
                    capture.write(buffer, 0, captureCount);
                }
                if (captureCount < count) {
                    break;
                }
            }
            return new BodyCapture(capture.toByteArray(), observed, complete);
        }
    }

    private static boolean isApplicationJson(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return false;
        }
        try {
            MediaType parsed = MediaType.parseMediaType(contentType);
            return "application".equalsIgnoreCase(parsed.getType())
                    && "json".equalsIgnoreCase(parsed.getSubtype());
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static Map<String, String> selectedHeaders(HttpServletRequest request) {
        Map<String, String> headers = new LinkedHashMap<>();
        String contentType = request.getContentType();
        if (contentType != null) {
            headers.put("content-type-class", isApplicationJson(contentType) ? "application/json" : "other");
        }
        long contentLength = request.getContentLengthLong();
        if (contentLength >= 0) {
            headers.put("content-length", Long.toString(contentLength));
        }
        String userAgent = request.getHeader("User-Agent");
        if (userAgent != null) {
            byte[] bytes = userAgent.getBytes(StandardCharsets.UTF_8);
            headers.put("user-agent-bytes", Integer.toString(bytes.length));
            headers.put("user-agent-sha256", ActionRegressionService.sha256Hex(bytes));
        }
        String cfRay = request.getHeader("CF-Ray");
        if (cfRay != null && CF_RAY_PATTERN.matcher(cfRay).matches()) {
            headers.put("cf-ray", cfRay);
        }
        return headers;
    }

    private static String newRequestId() {
        return UUID.randomUUID().toString();
    }

    private RequestContext startRequest() {
        long sequence = requestSequence.incrementAndGet();
        return new RequestContext(newRequestId(), sequence, Instant.now(), System.nanoTime());
    }

    private record RequestContext(String requestId, long sequence, Instant startedAt, long startedNanos) {
    }

    private record BodyCapture(byte[] capturedBytes, long observedBytes, boolean complete) {
        private static BodyCapture empty() {
            return new BodyCapture(EMPTY_BODY, 0, true);
        }

        private Long exactBytes() {
            return complete ? observedBytes : null;
        }
    }
}
