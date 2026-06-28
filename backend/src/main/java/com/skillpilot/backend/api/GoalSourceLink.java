package com.skillpilot.backend.api;

public record GoalSourceLink(
        String type,
        String title,
        String url,
        String resourceType,
        String provider,
        java.util.List<String> sections,
        String description,
        String lang,
        String license,
        String skillpilotId,
        String role,
        String altText,
        String reviewStatus) {
}
