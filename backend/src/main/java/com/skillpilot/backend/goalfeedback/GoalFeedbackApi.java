package com.skillpilot.backend.goalfeedback;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Wire types shared by the public intake and the operator handoff API. */
public final class GoalFeedbackApi {

    public static final String SCHEMA_URL =
            "https://skillpilot.com/schemas/goal-evidence/v2/goal-public-feedback.schema.json";
    public static final String PRIVACY_NOTICE_VERSION = "2026-08-30.1";
    public static final Set<String> PRIVACY_NOTICE_LOCALES = Set.of("de", "en");
    public static final String SUBMISSION_ENDPOINT = "/api/public/goal-feedback/v1/submissions";

    private GoalFeedbackApi() {
    }

    public record LinkBinding(
            String bookId,
            String edition,
            String goalId,
            String goalFingerprint,
            String pageFingerprint,
            String bookDigest,
            int page) {
    }

    public record TrustedContext(
            String goalId,
            String goalFingerprint,
            String pageFingerprint,
            String bookId,
            String bookEdition,
            String bookDigest,
            String locale,
            String scopeLabel,
            int pageNumber,
            String canonicalUrl,
            String publicationManifestFingerprint) {
    }

    public record Goal(String title, String description, List<String> breadcrumbs) {
    }

    public record ResolvedContext(
            int schemaVersion,
            TrustedContext context,
            Goal goal,
            String submissionEndpoint) {
    }

    public record SubmissionReceipt(UUID feedbackId, Instant receivedAt) {
    }

    public record DeletedExportReceipt(
            int schemaVersion,
            UUID exportId,
            String payloadDigest,
            int recordCount,
            String status,
            Instant deletedAt) {
    }
}
