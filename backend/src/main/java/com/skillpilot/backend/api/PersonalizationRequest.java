package com.skillpilot.backend.api;

import java.util.Map;

/**
 * Provider-neutral reference to one currently offered personalization option.
 *
 * <p>{@code config} remains in the wire shape for backwards compatibility,
 * but coach adapters must leave it empty. Only the cockpit may replace a full
 * personalization configuration. {@code optionId} is the authoritative opaque
 * MCP/app reference and is revalidated atomically against the current authored
 * stage. The older {@code goalIds}/{@code filters} fields remain only as an
 * unambiguous compatibility bridge for already deployed adapters.</p>
 */
public record PersonalizationRequest(
        Map<String, Object> config,
        java.util.List<String> goalIds,
        java.util.List<String> filters,
        String optionId) {

    public PersonalizationRequest(
            Map<String, Object> config,
            java.util.List<String> goalIds,
            java.util.List<String> filters) {
        this(config, goalIds, filters, null);
    }
}
