package com.skillpilot.backend.teachersupervision;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.teachersupervision.TeacherPersonalizationProjector.Projection;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CourseCreated;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CourseMember;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.CourseView;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationAccepted;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationCreated;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.InvitationPreview;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.LearnerMembership;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.LearnerMemberships;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.MasteryProjection;
import com.skillpilot.backend.teachersupervision.TeacherSupervisionApi.WorkspaceCreated;
import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@ConditionalOnTeacherSupervisionEnabled
public class TeacherSupervisionService {

    private static final Duration INVITATION_TTL = Duration.ofDays(7);
    private static final Pattern WORKSPACE_TOKEN = Pattern.compile("sptw_[A-Za-z0-9_-]{43}");
    private static final Pattern INVITATION_TOKEN = Pattern.compile("spti_[A-Za-z0-9_-]{43}");
    private static final List<String> READ_CAPABILITIES = List.of(
            "PERSONAL_CURRICULUM_READ",
            "MASTERY_READ");
    private static final List<TeacherMembershipStatus> LEARNER_VISIBLE_STATUSES = List.of(
            TeacherMembershipStatus.PENDING,
            TeacherMembershipStatus.ACTIVE);

    private final TeacherWorkspaceRepository workspaceRepository;
    private final TeacherCourseRepository courseRepository;
    private final TeacherMembershipRepository membershipRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerService learnerService;
    private final LandscapeService landscapeService;
    private final TeacherPersonalizationProjector personalizationProjector;

    public TeacherSupervisionService(
            TeacherWorkspaceRepository workspaceRepository,
            TeacherCourseRepository courseRepository,
            TeacherMembershipRepository membershipRepository,
            LearnerRepository learnerRepository,
            LearnerService learnerService,
            LandscapeService landscapeService,
            ObjectMapper objectMapper) {
        this.workspaceRepository = workspaceRepository;
        this.courseRepository = courseRepository;
        this.membershipRepository = membershipRepository;
        this.learnerRepository = learnerRepository;
        this.learnerService = learnerService;
        this.landscapeService = landscapeService;
        this.personalizationProjector = new TeacherPersonalizationProjector(
                objectMapper,
                landscapeService);
    }

    @Transactional
    public WorkspaceCreated createWorkspace() {
        String clearToken = TeacherSupervisionTokenCodec.newWorkspaceToken();
        TeacherWorkspace workspace = workspaceRepository.save(
                new TeacherWorkspace(TeacherSupervisionTokenCodec.sha256(clearToken)));
        return new WorkspaceCreated(workspace.getId(), clearToken);
    }

    @Transactional
    public CourseCreated createCourse(
            String authorization,
            String courseLabel,
            String teacherDisplayName) {
        TeacherWorkspace workspace = authenticate(authorization);
        TeacherCourse course = courseRepository.save(new TeacherCourse(
                workspace,
                normalizedLabel(courseLabel),
                normalizedLabel(teacherDisplayName)));
        return new CourseCreated(
                course.getId(),
                course.getCourseLabel(),
                course.getTeacherDisplayName(),
                course.getCreatedAt());
    }

    @Transactional
    public InvitationCreated createInvitation(
            String authorization,
            UUID courseId,
            String skillpilotId) {
        TeacherWorkspace workspace = authenticate(authorization);
        TeacherCourse course = ownedCourseForUpdate(courseId, workspace);
        String normalizedLearnerId = normalizedLearnerId(skillpilotId);
        Learner learner = learnerRepository.findById(normalizedLearnerId)
                .orElseThrow(TeacherSupervisionService::learnerUnavailable);

        String clearToken = TeacherSupervisionTokenCodec.newInvitationToken();
        String tokenHash = TeacherSupervisionTokenCodec.sha256(clearToken);
        Instant expiresAt = Instant.now().plus(INVITATION_TTL);
        TeacherMembership membership = membershipRepository
                .findByCourse_IdAndLearner_SkillpilotId(course.getId(), normalizedLearnerId)
                .map(existing -> renew(existing, tokenHash, expiresAt))
                .orElseGet(() -> new TeacherMembership(course, learner, tokenHash, expiresAt));
        membershipRepository.save(membership);
        return new InvitationCreated(
                membership.getInvitationId(),
                membership.getMemberId(),
                "/betreuung#invite=" + clearToken,
                membership.getStatus().name(),
                membership.getExpiresAt());
    }

    @Transactional
    public InvitationPreview previewInvitation(String invitationToken) {
        TeacherMembership membership = availableInvitation(invitationToken);
        return new InvitationPreview(
                membership.getCourse().getCourseLabel(),
                membership.getCourse().getTeacherDisplayName(),
                membership.getStatus().name(),
                membership.getExpiresAt(),
                capabilities(membership));
    }

    @Transactional
    public InvitationAccepted acceptInvitation(
            String invitationToken,
            String skillpilotId,
            boolean acknowledged) {
        if (!acknowledged) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Explicit acknowledgement is required.");
        }
        TeacherMembership membership = availableInvitation(invitationToken);
        if (!TeacherSupervisionTokenCodec.sameSecret(
                membership.getLearner().getSkillpilotId(),
                normalizedLearnerId(skillpilotId))) {
            throw invitationUnavailable();
        }
        membership.accept(Instant.now());
        membershipRepository.save(membership);
        return new InvitationAccepted(
                membership.getMemberId(),
                membership.getCourse().getCourseLabel(),
                membership.getCourse().getTeacherDisplayName(),
                membership.getStatus().name(),
                capabilities(membership));
    }

    @Transactional(readOnly = true)
    public CourseView getCourse(String authorization, UUID courseId) {
        TeacherWorkspace workspace = authenticate(authorization);
        TeacherCourse course = ownedCourse(courseId, workspace);
        List<CourseMember> members = membershipRepository
                .findByCourse_IdOrderByCreatedAtAscMemberIdAsc(courseId)
                .stream()
                .map(this::courseMember)
                .toList();
        return new CourseView(
                course.getId(),
                course.getCourseLabel(),
                course.getTeacherDisplayName(),
                course.getCreatedAt(),
                members);
    }

    @Transactional
    public void closeCourse(String authorization, UUID courseId) {
        TeacherWorkspace workspace = authenticate(authorization);
        TeacherCourse course = ownedCourseForUpdate(courseId, workspace);
        Instant now = Instant.now();
        course.close(now);
        for (TeacherMembership membership : membershipRepository.findByCourseIdForUpdate(courseId)) {
            if (membership.getStatus() != TeacherMembershipStatus.REVOKED) {
                membership.revoke(now);
            }
        }
    }

    @Transactional(readOnly = true)
    public MasteryProjection getMastery(
            String authorization,
            UUID courseId,
            UUID memberId,
            String landscapeId) {
        TeacherWorkspace workspace = authenticate(authorization);
        TeacherCourse course = ownedCourse(courseId, workspace);
        TeacherMembership membership = membershipRepository.findById(memberId)
                .filter(candidate -> candidate.getCourse().getId().equals(course.getId()))
                .filter(candidate -> candidate.getStatus() == TeacherMembershipStatus.ACTIVE)
                .filter(TeacherMembership::isPersonalCurriculumRead)
                .filter(TeacherMembership::isMasteryRead)
                .orElseThrow(TeacherSupervisionService::resourceUnavailable);

        Projection projection = personalizationProjector.project(membership.getLearner());
        boolean selectedSubject = projection.subjects().stream()
                .anyMatch(subject -> subject.landscapeId().equals(landscapeId));
        if (!selectedSubject) {
            throw resourceUnavailable();
        }
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null) {
            throw resourceUnavailable();
        }
        Set<String> allowedGoalIds = new HashSet<>();
        if (landscape.getGoals() != null) {
            for (LearningGoal goal : landscape.getGoals()) {
                if (goal.getId() != null && !goal.getId().isBlank()) {
                    allowedGoalIds.add(goal.getId());
                }
                if (goal.getShortKey() != null && !goal.getShortKey().isBlank()) {
                    allowedGoalIds.add(goal.getShortKey());
                }
            }
        }
        Map<String, Double> filtered = new LinkedHashMap<>();
        learnerService.getMastery(membership.getLearner().getSkillpilotId()).forEach((goalKey, value) -> {
            if (belongsToLandscape(goalKey, allowedGoalIds)) {
                filtered.put(goalKey, value);
            }
        });
        return new MasteryProjection(
                membership.getMemberId(),
                landscapeId,
                projection.fingerprint(),
                Map.copyOf(filtered));
    }

    @Transactional(readOnly = true)
    public LearnerMemberships getLearnerMemberships(String skillpilotId) {
        String normalizedLearnerId = normalizedLearnerId(skillpilotId);
        if (!learnerRepository.existsById(normalizedLearnerId)) {
            return new LearnerMemberships(List.of());
        }
        List<LearnerMembership> memberships = membershipRepository
                .findByLearner_SkillpilotIdAndStatusInOrderByCreatedAtAscMemberIdAsc(
                        normalizedLearnerId,
                        LEARNER_VISIBLE_STATUSES)
                .stream()
                .filter(membership -> membership.getCourse().getClosedAt() == null)
                .map(this::learnerMembership)
                .toList();
        return new LearnerMemberships(memberships);
    }

    @Transactional
    public void revokeLearnerMembership(String skillpilotId, UUID memberId) {
        String normalizedLearnerId = normalizedLearnerId(skillpilotId);
        TeacherMembership membership = membershipRepository.findByMemberIdForUpdate(memberId)
                .filter(candidate -> TeacherSupervisionTokenCodec.sameSecret(
                        candidate.getLearner().getSkillpilotId(),
                        normalizedLearnerId))
                .orElseThrow(TeacherSupervisionService::resourceUnavailable);
        if (membership.getStatus() != TeacherMembershipStatus.REVOKED) {
            membership.revoke(Instant.now());
        }
    }

    private TeacherWorkspace authenticate(String authorization) {
        String token = bearerToken(authorization);
        return workspaceRepository
                .findByAccessTokenHashAndRevokedAtIsNull(
                        TeacherSupervisionTokenCodec.sha256(token))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Teacher workspace access denied."));
    }

    private TeacherCourse ownedCourse(UUID courseId, TeacherWorkspace workspace) {
        if (courseId == null) {
            throw resourceUnavailable();
        }
        return courseRepository.findByIdAndWorkspace_IdAndClosedAtIsNull(courseId, workspace.getId())
                .orElseThrow(TeacherSupervisionService::resourceUnavailable);
    }

    private TeacherCourse ownedCourseForUpdate(UUID courseId, TeacherWorkspace workspace) {
        if (courseId == null) {
            throw resourceUnavailable();
        }
        return courseRepository.findOwnedForUpdate(courseId, workspace.getId())
                .orElseThrow(TeacherSupervisionService::resourceUnavailable);
    }

    private TeacherMembership availableInvitation(String token) {
        String checkedToken = invitationToken(token);
        TeacherMembership membership = membershipRepository
                .findInvitationForUpdate(TeacherSupervisionTokenCodec.sha256(checkedToken))
                .orElseThrow(TeacherSupervisionService::invitationUnavailable);
        if (membership.getStatus() != TeacherMembershipStatus.PENDING
                || membership.getCourse().getClosedAt() != null
                || membership.getCourse().getWorkspace().getRevokedAt() != null
                || !membership.getExpiresAt().isAfter(Instant.now())) {
            throw invitationUnavailable();
        }
        return membership;
    }

    private CourseMember courseMember(TeacherMembership membership) {
        String wireStatus = wireStatus(membership);
        if (!"ACTIVE".equals(wireStatus)
                || !membership.isPersonalCurriculumRead()) {
            return new CourseMember(
                    membership.getMemberId(),
                    wireStatus,
                    membership.getCreatedAt(),
                    membership.getAcceptedAt(),
                    wireExpiresAt(membership),
                    List.of(),
                    null,
                    null,
                    null,
                    List.of());
        }
        Projection projection = personalizationProjector.project(membership.getLearner());
        return new CourseMember(
                membership.getMemberId(),
                membership.getStatus().name(),
                membership.getCreatedAt(),
                membership.getAcceptedAt(),
                wireExpiresAt(membership),
                capabilities(membership),
                projection.fingerprint(),
                projection.rootLandscapeId(),
                projection.scope(),
                projection.subjects());
    }

    private LearnerMembership learnerMembership(TeacherMembership membership) {
        String wireStatus = wireStatus(membership);
        return new LearnerMembership(
                membership.getMemberId(),
                wireStatus,
                membership.getCourse().getCourseLabel(),
                membership.getCourse().getTeacherDisplayName(),
                membership.getCreatedAt(),
                membership.getAcceptedAt(),
                wireExpiresAt(membership),
                "ACTIVE".equals(wireStatus) ? capabilities(membership) : List.of());
    }

    private static String wireStatus(TeacherMembership membership) {
        if (membership.getStatus() == TeacherMembershipStatus.PENDING
                && !membership.getExpiresAt().isAfter(Instant.now())) {
            return "EXPIRED";
        }
        return membership.getStatus().name();
    }

    private static Instant wireExpiresAt(TeacherMembership membership) {
        return membership.getStatus() == TeacherMembershipStatus.PENDING
                ? membership.getExpiresAt()
                : null;
    }

    private static TeacherMembership renew(
            TeacherMembership membership,
            String tokenHash,
            Instant expiresAt) {
        if (membership.getStatus() == TeacherMembershipStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "The learner is already linked to this course.");
        }
        membership.renewInvitation(tokenHash, expiresAt);
        return membership;
    }

    private static List<String> capabilities(TeacherMembership membership) {
        if (membership.isPersonalCurriculumRead() && membership.isMasteryRead()) {
            return READ_CAPABILITIES;
        }
        if (membership.isPersonalCurriculumRead()) {
            return List.of("PERSONAL_CURRICULUM_READ");
        }
        if (membership.isMasteryRead()) {
            return List.of("MASTERY_READ");
        }
        return List.of();
    }

    private static boolean belongsToLandscape(String goalKey, Set<String> allowedGoalIds) {
        if (goalKey == null) {
            return false;
        }
        if (allowedGoalIds.contains(goalKey)) {
            return true;
        }
        int separator = goalKey.indexOf(':');
        return separator >= 0
                && separator < goalKey.length() - 1
                && allowedGoalIds.contains(goalKey.substring(separator + 1));
    }

    private static String bearerToken(String authorization) {
        if (authorization == null || authorization.length() > 160
                || !authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Teacher workspace access denied.");
        }
        String token = authorization.substring(7).trim();
        if (!WORKSPACE_TOKEN.matcher(token).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Teacher workspace access denied.");
        }
        return token;
    }

    private static String invitationToken(String token) {
        String normalized = token == null ? "" : token.trim();
        if (!INVITATION_TOKEN.matcher(normalized).matches()) {
            throw invitationUnavailable();
        }
        return normalized;
    }

    private static String normalizedLearnerId(String skillpilotId) {
        String normalized = skillpilotId == null ? "" : skillpilotId.trim();
        if (normalized.isEmpty() || normalized.length() > 80 || containsControl(normalized)) {
            throw learnerUnavailable();
        }
        return normalized;
    }

    private static String normalizedLabel(String label) {
        String normalized = label == null ? "" : label.trim();
        if (normalized.isEmpty() || normalized.length() > 80 || containsControl(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid course label.");
        }
        return normalized;
    }

    private static boolean containsControl(String value) {
        return value.codePoints().anyMatch(Character::isISOControl);
    }

    private static ResponseStatusException invitationUnavailable() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation unavailable.");
    }

    private static ResponseStatusException learnerUnavailable() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner unavailable.");
    }

    private static ResponseStatusException resourceUnavailable() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Supervision resource unavailable.");
    }
}
