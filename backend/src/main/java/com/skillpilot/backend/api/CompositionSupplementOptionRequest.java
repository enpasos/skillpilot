package com.skillpilot.backend.api;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
/** No configuration, goal IDs, view IDs or supplemental IDs accepted. */
@JsonIgnoreProperties(ignoreUnknown = false)
public record CompositionSupplementOptionRequest(String optionId) {
    @com.fasterxml.jackson.annotation.JsonAnySetter
    public void rejectUnknown(String field, Object value) {
        throw new IllegalArgumentException("Only a current opaque preparation option is accepted");
    }
}
