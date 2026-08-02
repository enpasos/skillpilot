package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.ExamData;

public record FrontierGoal(
                String id,
                String title,
                String description,
                String type, // "atomic" or "cluster"
                String nodeKind, // "exam" | "tutor" | "memory"
                String semanticKind, // authoritative goal semantics, e.g. "orientation"
                String reason,
                java.util.List<String> tags,
                java.util.List<GoalSourceLink> resourceLinks,
                String sourceRef,
                String sourceLicense,
                String sourceLicenseUrl,
                ExamData examData) {

        /**
         * Compatibility constructor for callers that do not yet publish semantic
         * classification. Runtime projections should prefer the canonical
         * constructor so an explicit semantic kind cannot be lost and then
         * reconstructed from legacy tags.
         */
        public FrontierGoal(
                        String id,
                        String title,
                        String description,
                        String type,
                        String nodeKind,
                        String reason,
                        java.util.List<String> tags,
                        java.util.List<GoalSourceLink> resourceLinks,
                        String sourceRef,
                        String sourceLicense,
                        String sourceLicenseUrl,
                        ExamData examData) {
                this(
                                id,
                                title,
                                description,
                                type,
                                nodeKind,
                                null,
                                reason,
                                tags,
                                resourceLinks,
                                sourceRef,
                                sourceLicense,
                                sourceLicenseUrl,
                                examData);
        }
}
