package com.skillpilot.backend.openai.mcp.de.v1;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Stable, public V1 error codes.
 *
 * <p>Callers must branch on {@link #code()} and never parse user-facing prose.
 * Existing entries are part of the V1 compatibility surface: they may only be
 * removed or semantically changed in a new contract major.</p>
 */
public enum OpenAiDeV1ErrorCode {
    STATE_VERSION_CONFLICT("state", true, "reload_context_once"),
    IDEMPOTENCY_KEY_REUSED("state", false, "use_new_client_request_id"),
    SESSION_VERSION_UNAVAILABLE("state", false, "restart_learning_session"),
    SESSION_REQUIRED("session", false, "restart_learning_session"),
    SESSION_RENEWAL_REQUIRED("session", false, "restart_learning_session"),
    AUTHENTICATION_REQUIRED("auth", true, "authenticate"),
    INSUFFICIENT_SCOPE("scope", false, "grant_required_scope"),
    INVALID_INPUT("input", false, "correct_input"),
    STATE_CONFLICT("conflict", true, "reload_context_once"),
    TIMEOUT("timeout", true, "retry_later"),
    SERVICE_UNAVAILABLE("availability", true, "retry_later"),
    INTERNAL_ERROR("internal", false, "stop_and_report_reference");

    private final String category;
    private final boolean retryable;
    private final String recovery;

    OpenAiDeV1ErrorCode(String category, boolean retryable, String recovery) {
        this.category = category;
        this.retryable = retryable;
        this.recovery = recovery;
    }

    public String code() {
        return name();
    }

    public String category() {
        return category;
    }

    public boolean retryable() {
        return retryable;
    }

    public boolean stateChanged() {
        return false;
    }

    public String recovery() {
        return recovery;
    }

    /** Deterministic machine-readable catalog exported into every V1 release snapshot. */
    public static Map<String, Object> publicCatalog() {
        List<Map<String, Object>> errors = java.util.Arrays.stream(values())
                .map(OpenAiDeV1ErrorCode::publicDescriptor)
                .toList();
        Map<String, Object> catalog = new LinkedHashMap<>();
        catalog.put("schemaVersion", 1);
        catalog.put("contractMajor", OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        catalog.put("errors", errors);
        return catalog;
    }

    private Map<String, Object> publicDescriptor() {
        Map<String, Object> descriptor = new LinkedHashMap<>();
        descriptor.put("code", code());
        descriptor.put("category", category);
        descriptor.put("retryable", retryable);
        descriptor.put("stateChanged", stateChanged());
        descriptor.put("recovery", recovery);
        return descriptor;
    }
}
