package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
                ExamData examData,
                @JsonIgnore boolean examReadyForSelection,
                @JsonIgnore java.util.List<String> selectionGoalIds) {

        public FrontierGoal {
                selectionGoalIds = selectionGoalIds == null || selectionGoalIds.isEmpty()
                                ? id == null || id.isBlank() ? java.util.List.of() : java.util.List.of(id)
                                : java.util.List.copyOf(selectionGoalIds);
        }

        /**
         * Compatibility constructor for callers without a compound focus
         * selection. Ordinary goals select themselves; a broader-focus option
         * may carry several replacement roots through {@link #selectionGoalIds()}.
         */
        public FrontierGoal(
                        String id,
                        String title,
                        String description,
                        String type,
                        String nodeKind,
                        String semanticKind,
                        String reason,
                        java.util.List<String> tags,
                        java.util.List<GoalSourceLink> resourceLinks,
                        String sourceRef,
                        String sourceLicense,
                        String sourceLicenseUrl,
                        ExamData examData,
                        boolean examReadyForSelection) {
                this(
                                id,
                                title,
                                description,
                                type,
                                nodeKind,
                                semanticKind,
                                reason,
                                tags,
                                resourceLinks,
                                sourceRef,
                                sourceLicense,
                                sourceLicenseUrl,
                                examData,
                                examReadyForSelection,
                                id == null || id.isBlank() ? java.util.List.of() : java.util.List.of(id));
        }

        /**
         * Compatibility constructor for callers without the internal exam
         * readiness proof. Only the learner service may set that proof after
         * validating the canonical exam payload.
         */
        public FrontierGoal(
                        String id,
                        String title,
                        String description,
                        String type,
                        String nodeKind,
                        String semanticKind,
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
                                semanticKind,
                                reason,
                                tags,
                                resourceLinks,
                                sourceRef,
                                sourceLicense,
                                sourceLicenseUrl,
                                examData,
                                false,
                                id == null || id.isBlank() ? java.util.List.of() : java.util.List.of(id));
        }

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
                                examData,
                                false,
                                id == null || id.isBlank() ? java.util.List.of() : java.util.List.of(id));
        }

        public FrontierGoal withSelectionGoalIds(java.util.List<String> goalIds) {
                return new FrontierGoal(
                                id,
                                title,
                                description,
                                type,
                                nodeKind,
                                semanticKind,
                                reason,
                                tags,
                                resourceLinks,
                                sourceRef,
                                sourceLicense,
                                sourceLicenseUrl,
                                examData,
                                examReadyForSelection,
                                goalIds);
        }
}
