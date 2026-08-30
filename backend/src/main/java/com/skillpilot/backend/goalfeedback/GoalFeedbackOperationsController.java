package com.skillpilot.backend.goalfeedback;

import com.fasterxml.jackson.databind.JsonNode;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.DeletedExportReceipt;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/operations/goal-feedback/v1/export-batches")
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackOperationsController {

    private final GoalFeedbackExportService exports;
    private final GoalFeedbackCanonicalJson canonicalJson;
    private final GoalFeedbackRetentionCoordinator retention;

    public GoalFeedbackOperationsController(
            GoalFeedbackExportService exports,
            GoalFeedbackCanonicalJson canonicalJson,
            GoalFeedbackRetentionCoordinator retention) {
        this.exports = exports;
        this.canonicalJson = canonicalJson;
        this.retention = retention;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> create(
            @RequestParam(defaultValue = "100") int limit) {
        retention.purgeAllExpiredContent();
        JsonNode response = exports.create(limit);
        if (response == null) {
            return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.ETAG, entityTag(response.path("payloadDigest").textValue()))
                .body(canonicalJson.serialize(response));
    }

    @GetMapping(path = "/{exportId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> get(@PathVariable UUID exportId) {
        retention.purgeAllExpiredContent();
        JsonNode response = exports.get(exportId);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header(HttpHeaders.ETAG, entityTag(response.path("payloadDigest").textValue()))
                .body(canonicalJson.serialize(response));
    }

    @DeleteMapping(path = "/{exportId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DeletedExportReceipt> delete(
            @PathVariable UUID exportId,
            @RequestHeader(value = "If-Match", required = false) String ifMatch) {
        retention.purgeAllExpiredContent();
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(exports.delete(exportId, ifMatch));
    }

    private static String entityTag(String payloadDigest) {
        return "\"" + payloadDigest + "\"";
    }
}
