package com.skillpilot.backend.api;

public record FrontierGoal(
                String id,
                String title,
                String description,
                String type, // "atomic" or "cluster"
                String reason,
                java.util.List<String> tags) {
}
