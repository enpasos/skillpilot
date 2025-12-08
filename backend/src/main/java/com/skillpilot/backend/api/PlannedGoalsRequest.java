package com.skillpilot.backend.api;

import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record PlannedGoalsRequest(@NotNull Set<String> goals) {
}
