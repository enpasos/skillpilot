package com.skillpilot.backend.teachersupervision;

import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.AcceptInvitationRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CourseCreated;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CourseView;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CreateCourseRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CreateInvitationRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CreateWorkspaceRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationAccepted;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationCreated;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationPreview;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationTokenRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.LearnerMembershipListRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.LearnerMemberships;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.MasteryProjection;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.MasteryProjectionRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.RevokeLearnerMembershipRequest;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.WorkspaceCreated;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@ConditionalOnTeacherSupervisionEnabled
@RequestMapping(
        value = TeacherSupervisionApi.BASE_PATH,
        produces = MediaType.APPLICATION_JSON_VALUE)
public class TeacherSupervisionController {

    private final TeacherSupervisionService service;

    public TeacherSupervisionController(TeacherSupervisionService service) {
        this.service = service;
    }

    @PostMapping(value = "/workspaces", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<WorkspaceCreated> createWorkspace(
            @Valid @RequestBody CreateWorkspaceRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(service.createWorkspace());
    }

    @PostMapping(value = "/courses", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CourseCreated> createCourse(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @Valid @RequestBody CreateCourseRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(service.createCourse(
                        authorization,
                        request.courseLabel(),
                        request.teacherDisplayName()));
    }

    @PostMapping(
            value = "/courses/{courseId}/invitations",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationCreated> createInvitation(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateInvitationRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(service.createInvitation(authorization, courseId, request.skillpilotId()));
    }

    @PostMapping(value = "/invitations/preview", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationPreview> previewInvitation(
            @Valid @RequestBody InvitationTokenRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(service.previewInvitation(request.invitationToken()));
    }

    @PostMapping(value = "/invitations/accept", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<InvitationAccepted> acceptInvitation(
            @Valid @RequestBody AcceptInvitationRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(service.acceptInvitation(
                        request.invitationToken(),
                        request.skillpilotId(),
                        request.acknowledged()));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<CourseView> getCourse(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID courseId,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(service.getCourse(authorization, courseId));
    }

    @DeleteMapping("/courses/{courseId}")
    public ResponseEntity<Void> closeCourse(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID courseId,
            HttpServletResponse response) {
        noStore(response);
        service.closeCourse(authorization, courseId);
        return ResponseEntity.noContent()
                .cacheControl(CacheControl.noStore())
                .build();
    }

    @PostMapping(
            value = "/courses/{courseId}/members/{memberId}/mastery",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<MasteryProjection> getMastery(
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @PathVariable UUID courseId,
            @PathVariable UUID memberId,
            @Valid @RequestBody MasteryProjectionRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(service.getMastery(
                        authorization,
                        courseId,
                        memberId,
                        request.landscapeId()));
    }

    @PostMapping(
            value = "/learner-memberships/list",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<LearnerMemberships> getLearnerMemberships(
            @Valid @RequestBody LearnerMembershipListRequest request,
            HttpServletResponse response) {
        noStore(response);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(service.getLearnerMemberships(request.skillpilotId()));
    }

    @PostMapping(
            value = "/learner-memberships/revoke",
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> revokeLearnerMembership(
            @Valid @RequestBody RevokeLearnerMembershipRequest request,
            HttpServletResponse response) {
        noStore(response);
        service.revokeLearnerMembership(request.skillpilotId(), request.memberId());
        return ResponseEntity.noContent()
                .cacheControl(CacheControl.noStore())
                .build();
    }

    private static void noStore(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
    }
}
