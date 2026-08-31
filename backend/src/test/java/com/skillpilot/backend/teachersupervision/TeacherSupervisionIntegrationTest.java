package com.skillpilot.backend.teachersupervision;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "skillpilot.teacher-supervision.enabled=true",
        "spring.liquibase.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.claude.connector.v1.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false"
})
class TeacherSupervisionIntegrationTest {

    private static final String BASE = "/api/ui/teacher-supervision/v1";
    private static final String LEARNER_ID = "existing-math-physics-learner";
    private static final String OTHER_LEARNER_ID = "other-private-learner";
    private static final String ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MATH_GOAL_ID = "4b67bed9-06da-40b2-a306-24e9e7dfd390";
    private static final String PHYSICS_GOAL_ID = "2eecd0e2-a7ca-4568-9b12-3d47706c65fb";

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LearnerRepository learners;

    @Autowired
    private MasteryRepository mastery;

    @Autowired
    private TeacherMembershipRepository memberships;

    @Autowired
    private TeacherCourseRepository courses;

    @Autowired
    private TeacherWorkspaceRepository workspaces;

    @Autowired
    private JdbcTemplate jdbc;

    private final HttpClient http = HttpClient.newHttpClient();

    @BeforeEach
    void setUp() {
        memberships.deleteAll();
        courses.deleteAll();
        workspaces.deleteAll();
        mastery.deleteAll();
        learners.deleteAllById(java.util.List.of(LEARNER_ID, OTHER_LEARNER_ID));

        Learner learner = learner(LEARNER_ID, directPersonalization());
        mastery.save(new Mastery(learner, MATH_GOAL_ID, 0.75));
        mastery.save(new Mastery(learner, PHYSICS_GOAL_ID, 0.5));
        learners.saveAndFlush(learner(OTHER_LEARNER_ID, directPersonalization()));
    }

    @Test
    void explicitGrantProjectsTwoSubjectsWithoutExposingThePermanentLearnerId() throws Exception {
        HttpResponse<String> formWorkspace = http.send(
                HttpRequest.newBuilder(uri("/workspaces"))
                        .header("Origin", "http://localhost:5173")
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(""))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
        assertThat(formWorkspace.statusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value());
        assertThat(workspaces.count()).isZero();

        JsonNode workspace = json(post("/workspaces", "{}", null));
        String workspaceToken = workspace.path("accessToken").asText();
        assertThat(workspaceToken).matches("sptw_[A-Za-z0-9_-]{43}");
        assertThat(workspaces.findById(java.util.UUID.fromString(workspace.path("workspaceId").asText()))
                .orElseThrow()
                .getAccessTokenHash())
                .matches("[0-9a-f]{64}")
                .doesNotContain(workspaceToken);

        HttpResponse<String> unauthorizedCourse = post(
                "/courses",
                "{\"courseLabel\":\"Physik LK\",\"teacherDisplayName\":\"Frau Curie\"}",
                null);
        assertThat(unauthorizedCourse.statusCode()).isEqualTo(HttpStatus.UNAUTHORIZED.value());

        JsonNode course = json(post(
                "/courses",
                "{\"courseLabel\":\"Physik LK\",\"teacherDisplayName\":\"Frau Curie\"}",
                workspaceToken));
        String courseId = course.path("courseId").asText();

        JsonNode invitation = json(post(
                "/courses/" + courseId + "/invitations",
                "{\"skillpilotId\":\"" + LEARNER_ID + "\"}",
                workspaceToken));
        String memberId = invitation.path("memberId").asText();
        String invitationUrl = invitation.path("invitationUrl").asText();
        assertThat(invitationUrl).startsWith("/betreuung#invite=spti_").doesNotContain("?invite=");
        String invitationToken = invitationUrl.substring(invitationUrl.indexOf("=") + 1);
        assertThat(memberships.findById(java.util.UUID.fromString(memberId))
                .orElseThrow()
                .getInvitationTokenHash())
                .matches("[0-9a-f]{64}")
                .doesNotContain(invitationToken);

        HttpResponse<String> pendingCourse = get("/courses/" + courseId, workspaceToken);
        assertThat(pendingCourse.body())
                .doesNotContain(LEARNER_ID)
                .doesNotContain("personalCurriculum")
                .doesNotContain("Mathematik")
                .doesNotContain("Physik (Gymnasium");
        assertThat(objectMapper.readTree(pendingCourse.body())
                .path("members").get(0).path("capabilities").isEmpty()).isTrue();

        HttpResponse<String> previewResponse = post(
                "/invitations/preview",
                "{\"invitationToken\":\"" + invitationToken + "\"}",
                null);
        assertThat(previewResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(previewResponse.body())
                .contains("Physik LK", "Frau Curie", "requestedCapabilities", "MASTERY_READ")
                .doesNotContain(LEARNER_ID)
                .doesNotContain(invitationToken);

        HttpResponse<String> wrongLearner = post(
                "/invitations/accept",
                acceptance(invitationToken, OTHER_LEARNER_ID),
                null);
        assertThat(wrongLearner.statusCode()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(wrongLearner.body()).doesNotContain(LEARNER_ID).doesNotContain(invitationToken);

        HttpResponse<String> acceptedResponse = post(
                "/invitations/accept",
                acceptance(invitationToken, LEARNER_ID),
                null);
        assertThat(acceptedResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(acceptedResponse.body())
                .contains(memberId, "ACTIVE")
                .doesNotContain(LEARNER_ID)
                .doesNotContain(invitationToken);
        assertThat(post(
                "/invitations/preview",
                "{\"invitationToken\":\"" + invitationToken + "\"}",
                null).statusCode()).isEqualTo(HttpStatus.NOT_FOUND.value());

        HttpResponse<String> activeCourseResponse = get("/courses/" + courseId, workspaceToken);
        assertThat(activeCourseResponse.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(activeCourseResponse.body())
                .contains("Mathematik (Gymnasium, DE)", "Physik (Gymnasium, DE)", "DE-HE", "G9")
                .doesNotContain(LEARNER_ID)
                .doesNotContain("personalCurriculum");
        JsonNode activeCourse = objectMapper.readTree(activeCourseResponse.body());
        JsonNode activeMember = activeCourse.path("members").get(0);
        assertThat(activeMember.path("subjects").size()).isEqualTo(2);
        String fingerprint = activeMember.path("personalizationFingerprint").asText();
        assertThat(fingerprint).matches("sha256:[0-9a-f]{64}");

        Learner learner = learners.findById(LEARNER_ID).orElseThrow();
        learner.setPersonalCurriculum(wrappedAndReorderedPersonalization());
        learners.saveAndFlush(learner);
        JsonNode reorderedCourse = json(get("/courses/" + courseId, workspaceToken));
        assertThat(reorderedCourse.path("members").get(0).path("personalizationFingerprint").asText())
                .isEqualTo(fingerprint);

        HttpResponse<String> mathMastery = post(
                "/courses/" + courseId + "/members/" + memberId + "/mastery",
                masteryRequest(MATH_ID),
                workspaceToken);
        assertThat(mathMastery.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(mathMastery.body())
                .contains(MATH_GOAL_ID)
                .doesNotContain(PHYSICS_GOAL_ID)
                .doesNotContain(LEARNER_ID);

        HttpResponse<String> physicsMastery = post(
                "/courses/" + courseId + "/members/" + memberId + "/mastery",
                masteryRequest(PHYSICS_ID),
                workspaceToken);
        assertThat(physicsMastery.statusCode()).isEqualTo(HttpStatus.OK.value());
        assertThat(physicsMastery.body())
                .contains(PHYSICS_GOAL_ID)
                .doesNotContain(MATH_GOAL_ID)
                .doesNotContain(LEARNER_ID);

        HttpResponse<String> learnerMemberships = post(
                "/learner-memberships/list",
                learnerMembershipListRequest(),
                null);
        assertThat(learnerMemberships.body())
                .contains(memberId, "Physik LK", "Frau Curie", "ACTIVE")
                .doesNotContain(LEARNER_ID);

        HttpResponse<String> revoked = post(
                "/learner-memberships/revoke",
                revokeMembershipRequest(memberId),
                null);
        assertThat(revoked.statusCode()).isEqualTo(HttpStatus.NO_CONTENT.value());
        assertThat(post(
                "/courses/" + courseId + "/members/" + memberId + "/mastery",
                masteryRequest(MATH_ID),
                workspaceToken).statusCode()).isEqualTo(HttpStatus.NOT_FOUND.value());
        HttpResponse<String> revokedCourse = get("/courses/" + courseId, workspaceToken);
        assertThat(revokedCourse.body())
                .contains("REVOKED")
                .doesNotContain("MASTERY_READ")
                .doesNotContain("PERSONAL_CURRICULUM_READ")
                .doesNotContain("Mathematik (Gymnasium, DE)")
                .doesNotContain(LEARNER_ID);
    }

    @Test
    void deletingALinkedCourseRevokesItsGrantAndClosesTeacherAccess() throws Exception {
        JsonNode workspace = json(post("/workspaces", "{}", null));
        String token = workspace.path("accessToken").asText();
        JsonNode course = json(post(
                "/courses",
                "{\"courseLabel\":\"Einzelbetreuung\",\"teacherDisplayName\":\"Herr Planck\"}",
                token));
        String courseId = course.path("courseId").asText();
        JsonNode invitation = json(post(
                "/courses/" + courseId + "/invitations",
                "{\"skillpilotId\":\"" + LEARNER_ID + "\"}",
                token));
        String invitationToken = invitation.path("invitationUrl").asText().split("=", 2)[1];
        assertThat(post(
                "/invitations/accept",
                acceptance(invitationToken, LEARNER_ID),
                null).statusCode()).isEqualTo(HttpStatus.OK.value());

        assertThat(delete("/courses/" + courseId, token).statusCode())
                .isEqualTo(HttpStatus.NO_CONTENT.value());
        assertThat(get("/courses/" + courseId, token).statusCode())
                .isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(post("/learner-memberships/list", learnerMembershipListRequest(), null).body())
                .doesNotContain("Einzelbetreuung");
    }

    @Test
    void expiredPendingInvitationIsReportedAsExpiredAndCanBeRenewed() throws Exception {
        JsonNode workspace = json(post("/workspaces", "{}", null));
        String token = workspace.path("accessToken").asText();
        String courseId = json(post(
                "/courses",
                "{\"courseLabel\":\"Zeitlich begrenzt\",\"teacherDisplayName\":\"Lehrkraft\"}",
                token)).path("courseId").asText();
        JsonNode invitation = json(post(
                "/courses/" + courseId + "/invitations",
                "{\"skillpilotId\":\"" + LEARNER_ID + "\"}",
                token));
        String memberId = invitation.path("memberId").asText();
        String oldInvitationToken = invitation.path("invitationUrl").asText().split("=", 2)[1];
        jdbc.update(
                "UPDATE teacher_membership SET expires_at = ? WHERE member_id = ?",
                java.sql.Timestamp.from(java.time.Instant.now().minusSeconds(60)),
                java.util.UUID.fromString(memberId));

        assertThat(get("/courses/" + courseId, token).body())
                .contains("EXPIRED")
                .doesNotContain("Mathematik (Gymnasium, DE)");
        assertThat(post("/learner-memberships/list", learnerMembershipListRequest(), null).body())
                .contains("EXPIRED")
                .doesNotContain("MASTERY_READ");
        assertThat(post(
                "/invitations/preview",
                "{\"invitationToken\":\"" + oldInvitationToken + "\"}",
                null).statusCode()).isEqualTo(HttpStatus.NOT_FOUND.value());

        JsonNode renewed = json(post(
                "/courses/" + courseId + "/invitations",
                "{\"skillpilotId\":\"" + LEARNER_ID + "\"}",
                token));
        assertThat(renewed.path("memberId").asText()).isEqualTo(memberId);
        assertThat(renewed.path("invitationUrl").asText()).doesNotContain(oldInvitationToken);
        assertThat(get("/courses/" + courseId, token).body()).contains("PENDING");
    }

    private Learner learner(String id, String personalCurriculum) {
        Learner learner = new Learner();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT_ID);
        learner.setPersonalCurriculum(personalCurriculum);
        return learners.saveAndFlush(learner);
    }

    private static String directPersonalization() {
        return """
                {
                  "%s":{"selected":true,"filterId":"DE-HE","durationModel":"G9","stage":"CrossStage"},
                  "%s":{"selected":true,"filterId":"LK"},
                  "%s":{"selected":true,"filterId":"GK"}
                }
                """.formatted(ROOT_ID, MATH_ID, PHYSICS_ID);
    }

    private static String wrappedAndReorderedPersonalization() {
        return """
                {"personalCurriculum":{
                  "%s":{"filterId":"GK","selected":true},
                  "%s":{"filterId":"LK","selected":true},
                  "%s":{"stage":"CrossStage","selected":true,"durationModel":"G9","filterId":"DE-HE"}
                }}
                """.formatted(PHYSICS_ID, MATH_ID, ROOT_ID);
    }

    private static String acceptance(String invitationToken, String learnerId) {
        return "{\"invitationToken\":\"" + invitationToken
                + "\",\"skillpilotId\":\"" + learnerId
                + "\",\"acknowledged\":true}";
    }

    private static String learnerMembershipListRequest() {
        return "{\"skillpilotId\":\"" + LEARNER_ID + "\"}";
    }

    private static String revokeMembershipRequest(String memberId) {
        return "{\"skillpilotId\":\"" + LEARNER_ID
                + "\",\"memberId\":\"" + memberId + "\"}";
    }

    private static String masteryRequest(String landscapeId) {
        return "{\"landscapeId\":\"" + landscapeId + "\"}";
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).isBetween(200, 299);
        return objectMapper.readTree(response.body());
    }

    private HttpResponse<String> post(String path, String body, String bearer) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path))
                .header("Origin", "http://localhost:5173")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        authorize(request, bearer);
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> get(String path, String bearer) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path)).GET();
        authorize(request, bearer);
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> delete(String path, String bearer) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(uri(path))
                .header("Origin", "http://localhost:5173")
                .DELETE();
        authorize(request, bearer);
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private static void authorize(HttpRequest.Builder request, String bearer) {
        if (bearer != null) {
            request.header("Authorization", "Bearer " + bearer);
        }
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + BASE + path);
    }
}
