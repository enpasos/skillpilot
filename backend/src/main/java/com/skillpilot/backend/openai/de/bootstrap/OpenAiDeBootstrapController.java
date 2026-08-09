package com.skillpilot.backend.openai.de.bootstrap;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.io.IOException;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

/** Capability-authorized, cookie-free direct-start endpoint for Coach V1. */
@RestController
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapController {

    private record ErrorResponse(int schemaVersion, String status, String fallbackUrl) {
    }

    private static final String AUTHORIZATION_PREFIX = "SkillPilotSetup ";
    private static final int MAX_REQUEST_BYTES = 8 * 1024;
    private static final Map<OpenAiDeBootstrapErrorCode, HttpStatus> ERROR_STATUS = errorStatuses();

    private final OpenAiDeBootstrapAttemptService attemptService;
    private final ObjectMapper strictMapper;

    public OpenAiDeBootstrapController(
            OpenAiDeBootstrapAttemptService attemptService,
            ObjectMapper objectMapper) {
        this.attemptService = attemptService;
        this.strictMapper = objectMapper.copy()
                .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
    }

    @PostMapping(
            path = OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<OpenAiDeBootstrapLaunchResponse> launch(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false)
                    String authorization,
            @RequestBody byte[] body) {
        String capability = parseCapability(authorization);
        OpenAiDeBootstrapLaunchRequest request = parseRequest(body);
        return ResponseEntity.ok()
                .headers(noStoreHeaders())
                .body(attemptService.launch(capability, request));
    }

    @ExceptionHandler(OpenAiDeBootstrapException.class)
    public ResponseEntity<ErrorResponse> bootstrapFailure(OpenAiDeBootstrapException exception) {
        OpenAiDeBootstrapErrorCode code = exception.code();
        HttpStatus status = ERROR_STATUS.getOrDefault(code, HttpStatus.BAD_REQUEST);
        String publicStatus = switch (code) {
            case INVALID_CAPABILITY, OAUTH_AUTHORIZATION_INVALID -> "START_NOT_AUTHORIZED";
            case POLICY_UNAVAILABLE -> "START_UNAVAILABLE";
            case IDEMPOTENCY_KEY_REUSED -> "IDEMPOTENCY_KEY_REUSED";
            case PROFILE_UNAVAILABLE -> "PROFILE_UNAVAILABLE";
            case RETRY_EXPIRED -> "RETRY_EXPIRED";
            case DELIVERY_EXPIRED -> "DELIVERY_EXPIRED";
            case DELIVERY_UNAVAILABLE, RATE_LIMITED -> "TEMPORARILY_UNAVAILABLE";
            case INVALID_REQUEST -> "INVALID_REQUEST";
        };
        HttpHeaders headers = noStoreHeaders();
        if (code == OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE
                || code == OpenAiDeBootstrapErrorCode.RATE_LIMITED) {
            headers.set(HttpHeaders.RETRY_AFTER, "30");
        }
        return ResponseEntity.status(status)
                .headers(headers)
                .body(new ErrorResponse(1, publicStatus, "https://skillpilot.com/"));
    }

    private OpenAiDeBootstrapLaunchRequest parseRequest(byte[] body) {
        if (body == null || body.length == 0 || body.length > MAX_REQUEST_BYTES) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        try {
            return strictMapper.readValue(body, OpenAiDeBootstrapLaunchRequest.class);
        } catch (IOException exception) {
            throw new OpenAiDeBootstrapException(
                    OpenAiDeBootstrapErrorCode.INVALID_REQUEST,
                    exception);
        }
    }

    private static String parseCapability(String authorization) {
        if (authorization == null
                || !authorization.startsWith(AUTHORIZATION_PREFIX)
                || authorization.length() <= AUTHORIZATION_PREFIX.length()) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
        String capability = authorization.substring(AUTHORIZATION_PREFIX.length());
        if (capability.isBlank() || capability.chars().anyMatch(Character::isWhitespace)) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
        return capability;
    }

    private static HttpHeaders noStoreHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.noStore());
        headers.setPragma("no-cache");
        headers.set("Referrer-Policy", "no-referrer");
        headers.set("X-Content-Type-Options", "nosniff");
        return headers;
    }

    private static Map<OpenAiDeBootstrapErrorCode, HttpStatus> errorStatuses() {
        Map<OpenAiDeBootstrapErrorCode, HttpStatus> statuses =
                new EnumMap<>(OpenAiDeBootstrapErrorCode.class);
        statuses.put(OpenAiDeBootstrapErrorCode.INVALID_REQUEST, HttpStatus.BAD_REQUEST);
        statuses.put(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY, HttpStatus.UNAUTHORIZED);
        statuses.put(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID, HttpStatus.UNAUTHORIZED);
        statuses.put(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
        statuses.put(OpenAiDeBootstrapErrorCode.RATE_LIMITED, HttpStatus.TOO_MANY_REQUESTS);
        statuses.put(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED, HttpStatus.CONFLICT);
        statuses.put(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE, HttpStatus.UNPROCESSABLE_ENTITY);
        statuses.put(OpenAiDeBootstrapErrorCode.RETRY_EXPIRED, HttpStatus.GONE);
        statuses.put(OpenAiDeBootstrapErrorCode.DELIVERY_EXPIRED, HttpStatus.GONE);
        statuses.put(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE, HttpStatus.SERVICE_UNAVAILABLE);
        return Map.copyOf(statuses);
    }
}
