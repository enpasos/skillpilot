package com.skillpilot.backend.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;

public record BulkCanonicalGymnasiumCutoverRequest(
        @NotEmpty Set<@NotBlank String> skillpilotIds,
        boolean dryRun) {
}
