package com.skillpilot.backend.openai.mcp.de.v1;

import java.util.Map;

/** Public, privacy-safe version metadata pinned to one learning session. */
public record OpenAiDeV1SessionMetadata(
        int contractMajor,
        long stateVersion,
        int stateSchemaVersion,
        String workflowVersion,
        String curriculumRevision,
        Map<String, Object> extensions) {

    public OpenAiDeV1SessionMetadata {
        extensions = extensions == null ? Map.of() : Map.copyOf(extensions);
    }
}
