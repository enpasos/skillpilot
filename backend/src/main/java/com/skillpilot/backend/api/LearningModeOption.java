package com.skillpilot.backend.api;

public record LearningModeOption(
        String id,
        String title,
        String description,
        String action,
        String target,
        String goalId) {
}
