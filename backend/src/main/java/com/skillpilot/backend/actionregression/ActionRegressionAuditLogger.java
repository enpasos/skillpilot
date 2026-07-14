package com.skillpilot.backend.actionregression;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;

/**
 * Emits one JSON object per action-regression event. The regular API request
 * logger deliberately skips this route so these messages remain unredacted and
 * the request/response byte hashes remain authoritative for the synthetic test.
 */
@Component
public class ActionRegressionAuditLogger {

    private static final Logger LOGGER = LoggerFactory.getLogger("skillpilot.action-regression.audit");

    private final ObjectMapper objectMapper;
    private final Consumer<String> sink;

    @Autowired
    public ActionRegressionAuditLogger(ObjectMapper objectMapper) {
        this(objectMapper, line -> LOGGER.info("{}", line));
    }

    ActionRegressionAuditLogger(ObjectMapper objectMapper, Consumer<String> sink) {
        this.objectMapper = objectMapper;
        this.sink = sink;
    }

    /**
     * Records a probe returned through Claude's MCP transport without writing
     * the reusable token or proof to the log.
     */
    public void logClaudeMcpProbeIssued(String probeId, String token, String proof) {
        Map<String, Object> event = privacySafeClaudeMcpEvent("probe_issued", probeId, token, proof);
        log(event);
    }

    /**
     * Records a probe verification through Claude's MCP transport. Hashing the
     * markers permits create/verify correlation while keeping their values out
     * of application logs.
     */
    public void logClaudeMcpProbeVerified(
            String probeId,
            String token,
            String proof,
            boolean proofValid) {
        Map<String, Object> event = privacySafeClaudeMcpEvent("probe_verified", probeId, token, proof);
        event.put("verify_called", true);
        event.put("proof_valid", proofValid);
        log(event);
    }

    private static Map<String, Object> privacySafeClaudeMcpEvent(
            String eventName,
            String probeId,
            String token,
            String proof) {
        Map<String, Object> event = new LinkedHashMap<>();
        event.put("ts", Instant.now().toString());
        event.put("event", eventName);
        event.put("service", "skillpilot-action-regression");
        event.put("transport", "claude-mcp");
        event.put("probe_id", probeId);
        event.put("token_sha256", markerHash(token));
        event.put("proof_sha256", markerHash(proof));
        return event;
    }

    private static String markerHash(String marker) {
        return ActionRegressionService.sha256Hex(marker.getBytes(StandardCharsets.UTF_8));
    }

    void log(Map<String, ?> event) {
        try {
            sink.accept(objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize action-regression audit event.", exception);
        }
    }
}
