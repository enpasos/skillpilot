package com.skillpilot.backend.actionregression;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

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

    void log(Map<String, ?> event) {
        try {
            sink.accept(objectMapper.writeValueAsString(event));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not serialize action-regression audit event.", exception);
        }
    }
}
