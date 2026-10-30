package com.skillpilot.backend.completion;

import java.util.List;
import java.util.Map;

/** Authored program unit: references canonical roots and contains no goal definitions. */
public record CompletionScopeDefinition(int schemaVersion, String id, String revision,
                                        Map<String, String> title, List<String> targetRootIds) {
    public CompletionScopeDefinition {
        title = Map.copyOf(title);
        targetRootIds = List.copyOf(targetRootIds);
        if (schemaVersion != 1 || id == null || id.isBlank() || revision == null || revision.isBlank()
                || targetRootIds.isEmpty() || targetRootIds.stream().distinct().count() != targetRootIds.size()) {
            throw new IllegalArgumentException("Invalid completion scope definition");
        }
    }
}
