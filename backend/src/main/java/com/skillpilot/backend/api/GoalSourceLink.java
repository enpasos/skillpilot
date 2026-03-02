package com.skillpilot.backend.api;

public record GoalSourceLink(
        String type,
        String title,
        String url,
        String resourceType,
        String license) {
}
