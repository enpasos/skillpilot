package com.skillpilot.backend.ui;

import com.skillpilot.backend.api.TrackingEventRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.extensions.Extension;
import io.swagger.v3.oas.annotations.extensions.ExtensionProperty;
import java.time.Instant;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;

@RestController
@RequestMapping(value = "/api/ui/events", produces = MediaType.APPLICATION_JSON_VALUE)
public class TelemetryUiController {

    private static final Logger log = LoggerFactory.getLogger(TelemetryUiController.class);

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(extensions = @Extension(properties = @ExtensionProperty(name = "x-openai-isConsequential", value = "false", parseValue = true)))
    public ResponseEntity<Map<String, String>> captureEvent(@RequestBody TrackingEventRequest request) {
        if (request == null || request.event() == null || request.event().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Missing event name");
        }
        Instant occurredAt = request.occurredAt() != null ? request.occurredAt() : Instant.now();
        int contextSize = request.context() != null ? request.context().size() : 0;
        log.info(
                "UI_EVENT event={} skillpilotId={} path={} occurredAt={} contextSize={}",
                request.event(),
                request.skillpilotId(),
                request.path(),
                occurredAt,
                contextSize);
        return ResponseEntity.accepted().body(Map.of("status", "accepted"));
    }
}
