package com.skillpilot.backend.openai.mcp.de.v1;

import java.util.Map;

/** Public, privacy-safe version metadata pinned to one learning session. */
public record OpenAiDeV1SessionMetadata(
        int contractMajor,
        long stateVersion,
        int stateSchemaVersion,
        String workflowVersion,
        String curriculumRevision,
        String communicationLocale,
        Map<String, Object> extensions,
        RecallDirective recallDirective) {

    public record RecallDirective(int verifiedRecallBatchSize) {
    }

    public OpenAiDeV1SessionMetadata {
        extensions = extensions == null ? Map.of() : Map.copyOf(extensions);
    }

    public OpenAiDeV1SessionMetadata(
            int contractMajor,
            long stateVersion,
            int stateSchemaVersion,
            String workflowVersion,
            String curriculumRevision,
            String communicationLocale,
            Map<String, Object> extensions) {
        this(
                contractMajor,
                stateVersion,
                stateSchemaVersion,
                workflowVersion,
                curriculumRevision,
                communicationLocale,
                extensions,
                null);
    }

    public Integer verifiedRecallBatchSize() {
        return recallDirective == null
                ? null
                : recallDirective.verifiedRecallBatchSize();
    }
}
