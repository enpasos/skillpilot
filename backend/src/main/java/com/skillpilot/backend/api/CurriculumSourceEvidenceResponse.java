package com.skillpilot.backend.api;

import java.util.List;

/** Path-free, package-bound source evidence for one canonical curriculum goal. */
public record CurriculumSourceEvidenceResponse(
        String generationSha256,
        String packageId,
        String packageVersion,
        String targetLandscapeId,
        String goalId,
        String jurisdiction,
        String matchType,
        SourceCollection sourceCollection,
        SourceGoal sourceGoal,
        SourceDocument sourceDocument) {

    public record SourceCollection(
            String sourceCollectionId,
            String sourceLandscapeId,
            String subject,
            String stage,
            List<String> durationModels) {
        public SourceCollection {
            durationModels = List.copyOf(durationModels);
        }
    }

    public record SourceGoal(
            String sourceGoalId,
            String title,
            String description,
            String sourceText,
            String sourceTextSha256,
            String parentBulletText,
            SourceLocator locator,
            SourceClassification classification,
            SourceLineage lineage) {
    }

    public record SourceLocator(
            String passageId,
            String topicCode,
            String sourceSpan,
            String sourceRef,
            Integer sourcePage,
            Integer sourceLine) {
    }

    public record SourceClassification(
            String granularity,
            String category,
            String stage,
            String phase,
            String courseLevel,
            String grade,
            String area,
            String level) {
    }

    public record SourceLineage(
            String splitFromSourceGoalId,
            int splitIndex,
            int splitPartCount) {
    }

    public record SourceDocument(
            String sourceDocumentId,
            String sourceKey,
            String title,
            String role,
            String semanticType,
            String url,
            String landingUrl,
            String durationModel) {
    }
}
