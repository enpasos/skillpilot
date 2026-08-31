package com.skillpilot.backend.teachersupervision;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Closed wire contract for the additive, read-only teacher supervision MVP. */
public final class TeacherSupervisionApi {

    public static final String ENABLED_PROPERTY = "skillpilot.teacher-supervision.enabled";
    public static final String BASE_PATH = "/api/ui/teacher-supervision/v1";

    private TeacherSupervisionApi() {
    }

    public record WorkspaceCreated(UUID workspaceId, String accessToken) {
    }

    /** Deliberately empty JSON object; requiring JSON prevents simple cross-site form POSTs. */
    public record CreateWorkspaceRequest() {
    }

    public record CreateCourseRequest(
            @NotBlank @Size(max = 80) String courseLabel,
            @NotBlank @Size(max = 80) String teacherDisplayName) {
    }

    public record CourseCreated(
            UUID courseId,
            String courseLabel,
            String teacherDisplayName,
            Instant createdAt) {
    }

    public record CreateInvitationRequest(
            @NotBlank @Size(max = 80) String skillpilotId) {
    }

    public record InvitationCreated(
            UUID invitationId,
            UUID memberId,
            String invitationUrl,
            String status,
            Instant expiresAt) {
    }

    public record InvitationTokenRequest(
            @NotBlank @Size(max = 128) String invitationToken) {
    }

    public record AcceptInvitationRequest(
            @NotBlank @Size(max = 128) String invitationToken,
            @NotBlank @Size(max = 80) String skillpilotId,
            @AssertTrue boolean acknowledged) {
    }

    public record InvitationPreview(
            String courseLabel,
            String teacherDisplayName,
            String status,
            Instant expiresAt,
            List<String> requestedCapabilities) {
    }

    public record InvitationAccepted(
            UUID memberId,
            String courseLabel,
            String teacherDisplayName,
            String status,
            List<String> capabilities) {
    }

    public record ScopeProjection(
            String jurisdiction,
            String durationModel,
            String stage) {
    }

    public record SubjectProjection(
            String landscapeId,
            String subject,
            String title,
            String filterId,
            String jurisdiction,
            String durationModel,
            String stage) {
    }

    public record CourseMember(
            UUID memberId,
            String status,
            Instant createdAt,
            Instant acceptedAt,
            Instant expiresAt,
            List<String> capabilities,
            String personalizationFingerprint,
            String rootLandscapeId,
            ScopeProjection scope,
            List<SubjectProjection> subjects) {
    }

    public record CourseView(
            UUID courseId,
            String courseLabel,
            String teacherDisplayName,
            Instant createdAt,
            List<CourseMember> members) {
    }

    public record MasteryProjection(
            UUID memberId,
            String landscapeId,
            String personalizationFingerprint,
            Map<String, Double> mastery) {
    }

    public record MasteryProjectionRequest(
            @NotBlank @Size(max = 80) String landscapeId) {
    }

    public record LearnerMembership(
            UUID memberId,
            String status,
            String courseLabel,
            String teacherDisplayName,
            Instant createdAt,
            Instant acceptedAt,
            Instant expiresAt,
            List<String> capabilities) {
    }

    public record LearnerMemberships(List<LearnerMembership> memberships) {
    }

    public record LearnerMembershipListRequest(
            @NotBlank @Size(max = 80) String skillpilotId) {
    }

    public record RevokeLearnerMembershipRequest(
            @NotBlank @Size(max = 80) String skillpilotId,
            @NotNull UUID memberId) {
    }
}
