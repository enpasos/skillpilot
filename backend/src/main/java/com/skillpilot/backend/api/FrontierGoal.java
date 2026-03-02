package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.ExamData;

public record FrontierGoal(
                String id,
                String title,
                String description,
                String type, // "atomic" or "cluster"
                String nodeKind, // "exam" | "tutor" | "memory"
                String reason,
                java.util.List<String> tags,
                java.util.List<GoalSourceLink> resourceLinks,
                String sourceRef,
                String sourceLicense,
                String sourceLicenseUrl,
                ExamData examData) {
}
