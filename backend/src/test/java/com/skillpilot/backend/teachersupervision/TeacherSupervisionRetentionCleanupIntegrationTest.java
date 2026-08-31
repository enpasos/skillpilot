package com.skillpilot.backend.teachersupervision;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Duration;
import java.sql.Timestamp;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "skillpilot.teacher-supervision.enabled=true",
        "skillpilot.teacher-supervision.retention.terminal=PT1H",
        "skillpilot.teacher-supervision.retention.initial-delay-ms=3600000",
        "spring.liquibase.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.claude.connector.v1.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false"
})
class TeacherSupervisionRetentionCleanupIntegrationTest {

    private static final String LEARNER_ID = "teacher-retention-learner";

    @Autowired
    private TeacherSupervisionService supervision;

    @Autowired
    private TeacherSupervisionRetentionCleanupJob cleanup;

    @Autowired
    private TeacherMembershipRepository memberships;

    @Autowired
    private TeacherCourseRepository courses;

    @Autowired
    private TeacherWorkspaceRepository workspaces;

    @Autowired
    private LearnerRepository learners;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void setUp() {
        memberships.deleteAll();
        courses.deleteAll();
        workspaces.deleteAll();
        learners.deleteById(LEARNER_ID);
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum("retention-test-curriculum");
        learner.setPersonalCurriculum("{}");
        learners.saveAndFlush(learner);
    }

    @Test
    void neverAllowsTerminalMetadataToRemainConfiguredBeyondThirtyDays() {
        assertThat(TeacherSupervisionRetentionCleanupJob.boundedTerminalRetention(Duration.ofDays(365)))
                .isEqualTo(Duration.ofDays(30));
        assertThat(TeacherSupervisionRetentionCleanupJob.boundedTerminalRetention(Duration.ofDays(7)))
                .isEqualTo(Duration.ofDays(7));
        assertThat(TeacherSupervisionRetentionCleanupJob.boundedTerminalRetention(null))
                .isEqualTo(Duration.ofDays(30));
    }

    @Test
    void keepsActiveApprovalAndPurgesTerminalChainAfterThirtyDayEquivalentWindow() {
        TeacherSupervisionApi.WorkspaceCreated workspace = supervision.createWorkspace();
        String authorization = "Bearer " + workspace.accessToken();
        TeacherSupervisionApi.CourseCreated course = supervision.createCourse(
                authorization,
                "Einzelbetreuung",
                "Lehrkraft");
        TeacherSupervisionApi.InvitationCreated invitation = supervision.createInvitation(
                authorization,
                course.courseId(),
                LEARNER_ID);
        String invitationToken = invitation.invitationUrl().split("=", 2)[1];
        supervision.acceptInvitation(invitationToken, LEARNER_ID, true);

        Timestamp old = Timestamp.from(Instant.now().minusSeconds(7_200));
        jdbc.update("UPDATE teacher_workspace SET created_at = ? WHERE id = ?", old, workspace.workspaceId());
        jdbc.update("UPDATE teacher_course SET created_at = ? WHERE id = ?", old, course.courseId());
        cleanup.cleanupTerminalRecords();

        assertThat(workspaces.count()).isOne();
        assertThat(courses.count()).isOne();
        assertThat(memberships.count()).isOne();

        supervision.closeCourse(authorization, course.courseId());
        jdbc.update("UPDATE teacher_course SET closed_at = ? WHERE id = ?", old, course.courseId());
        jdbc.update("UPDATE teacher_membership SET revoked_at = ? WHERE member_id = ?", old, invitation.memberId());
        cleanup.cleanupTerminalRecords();

        assertThat(memberships.count()).isZero();
        assertThat(courses.count()).isZero();
        assertThat(workspaces.count()).isZero();
    }

    @Test
    void purgesExpiredUnacceptedInvitationWithoutTouchingLearner() {
        TeacherSupervisionApi.WorkspaceCreated workspace = supervision.createWorkspace();
        String authorization = "Bearer " + workspace.accessToken();
        TeacherSupervisionApi.CourseCreated course = supervision.createCourse(
                authorization,
                "Nicht bestätigt",
                "Lehrkraft");
        TeacherSupervisionApi.InvitationCreated invitation = supervision.createInvitation(
                authorization,
                course.courseId(),
                LEARNER_ID);

        Timestamp old = Timestamp.from(Instant.now().minusSeconds(7_200));
        jdbc.update("UPDATE teacher_workspace SET created_at = ? WHERE id = ?", old, workspace.workspaceId());
        jdbc.update("UPDATE teacher_course SET created_at = ? WHERE id = ?", old, course.courseId());
        jdbc.update("UPDATE teacher_membership SET expires_at = ? WHERE member_id = ?", old, invitation.memberId());
        cleanup.cleanupTerminalRecords();

        assertThat(memberships.count()).isZero();
        assertThat(courses.count()).isZero();
        assertThat(workspaces.count()).isZero();
        assertThat(learners.existsById(LEARNER_ID)).isTrue();
    }
}
