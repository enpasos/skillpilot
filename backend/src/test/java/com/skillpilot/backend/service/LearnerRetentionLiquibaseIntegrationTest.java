package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.sql.Timestamp;
import java.time.Instant;
import org.springframework.dao.DataIntegrityViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/** Executes the real Liquibase schema, native retention query and DB cascades. */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:learner-retention-liquibase;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        // The production schema is validated against PostgreSQL. H2 reports
        // TEXT as CLOB, so this portability gate runs Liquibase and the real
        // queries/cascades without Hibernate's type-name comparison.
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "spring.security.oauth2.client.registration.github.client-id=retention-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=retention-test-secret",
        "skillpilot.security.signing-secret=retention-test-signing-secret",
        "skillpilot.learner-retention.enabled=false",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false"
})
class LearnerRetentionLiquibaseIntegrationTest {

    private static final String DUE_ID = "retention-due";
    private static final String ACTIVE_ID = "retention-active";
    private static final String REJECTED_ID = "retention-rejected";
    private static final String CLAUDE_SUBJECT = "retention-claude-subject";
    private static final String APP_OAUTH_PRINCIPAL = "openai-v1-app-principal";
    private static final String TEACHER_WORKSPACE_ID = "4b557af7-00f1-4bb5-a137-12840a81982d";
    private static final String TEACHER_COURSE_ID = "7ccb3e06-d821-48a3-b34d-b159d286b9b0";
    private static final String TEACHER_MEMBER_ID = "95943d3c-4cc9-4a24-a177-967896ff86d7";

    @Autowired
    private LearnerRepository learners;

    @Autowired
    private LearnerLifecycleService lifecycle;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void cleanupExecutesNativeLockingQueryAndDeletesOnlyTheCompleteDueLearnerGraph() {
        Instant now = Instant.now();
        learners.saveAndFlush(learner(DUE_ID, now.minus(LearnerLifecycleService.RETENTION_PERIOD).minusSeconds(60)));
        learners.saveAndFlush(learner(ACTIVE_ID, now.minus(LearnerLifecycleService.RETENTION_PERIOD).plusSeconds(60)));

        jdbc.update(
                "INSERT INTO mastery (skillpilot_id, goal_key, value, updated_at) VALUES (?, ?, ?, ?)",
                DUE_ID, "goal-due", 0.5, Timestamp.from(now));
        jdbc.update(
                "INSERT INTO planned_goal (skillpilot_id, goal_id, created_at) VALUES (?, ?, ?)",
                DUE_ID, "focus-due", Timestamp.from(now));
        jdbc.update(
                "INSERT INTO learner_client_state (skillpilot_id, node_id, client_state, client_state_updated_at) VALUES (?, ?, ?, ?)",
                DUE_ID, "node-due", "{}", Timestamp.from(now));
        jdbc.update(
                "INSERT INTO curriculum_champion "
                        + "(id, curriculum_id, skillpilot_id, github_id, issues_count, pull_requests_count, created_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?)",
                "champion-due", "curriculum-due", DUE_ID, "github-due", 1, 2, Timestamp.from(now));
        jdbc.update(
                "INSERT INTO chat_start_code (code_hash, learner_skillpilot_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
                "due-start-code", DUE_ID, Timestamp.from(now), Timestamp.from(now.plusSeconds(300)));
        jdbc.update(
                "INSERT INTO chat_session (token_hash, learner_skillpilot_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
                "due-chat-session", DUE_ID, Timestamp.from(now), Timestamp.from(now.plusSeconds(300)));
        jdbc.update(
                "INSERT INTO openai_de_learning_session "
                        + "(token_hash, learner_id, started_at, expires_at, contract_major, state_version, "
                        + "state_schema_version, workflow_version, curriculum_revision, communication_locale, "
                        + "verified_recall_batch_size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                "due-openai-session", DUE_ID, Timestamp.from(now), Timestamp.from(now.plusSeconds(300)),
                1, 0, 1, "coach@1.0", "repository@test", "de", 10);
        jdbc.update(
                "INSERT INTO claude_connection (subject, learner_skillpilot_id, created_at) VALUES (?, ?, ?)",
                CLAUDE_SUBJECT, DUE_ID, Timestamp.from(now));
        jdbc.update(
                "INSERT INTO teacher_workspace (id, access_token_hash, created_at) VALUES (?, ?, ?)",
                TEACHER_WORKSPACE_ID, "a".repeat(64), Timestamp.from(now));
        jdbc.update(
                "INSERT INTO teacher_course "
                        + "(id, workspace_id, course_label, teacher_display_name, created_at) "
                        + "VALUES (?, ?, ?, ?, ?)",
                TEACHER_COURSE_ID, TEACHER_WORKSPACE_ID, "Retention course", "Teacher", Timestamp.from(now));
        jdbc.update(
                "INSERT INTO teacher_membership "
                        + "(member_id, invitation_id, course_id, learner_id, status, "
                        + "personal_curriculum_read, mastery_read, expires_at, created_at, accepted_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                TEACHER_MEMBER_ID, "c1b8b69d-dd32-47d5-86ed-e43ae888dccc",
                TEACHER_COURSE_ID, DUE_ID, "ACTIVE", true, true,
                Timestamp.from(now.plusSeconds(300)), Timestamp.from(now), Timestamp.from(now));

        // A different learner currently records the due ID as import provenance.
        jdbc.update(
                "INSERT INTO learner_copy_sources (learner_id, source_id, copied_at) VALUES (?, ?, ?)",
                ACTIVE_ID, DUE_ID, Timestamp.from(now));

        insertAuthorization("learner-oauth", CLAUDE_SUBJECT);
        insertConsent("learner-client", CLAUDE_SUBJECT);
        insertAuthorization("app-oauth", APP_OAUTH_PRINCIPAL);
        insertConsent("app-client", APP_OAUTH_PRINCIPAL);

        assertThat(lifecycle.deleteInactiveBatch(10)).isEqualTo(1);

        assertThat(learners.existsById(DUE_ID)).isFalse();
        assertThat(learners.existsById(ACTIVE_ID)).isTrue();
        assertThat(count("mastery", "skillpilot_id", DUE_ID)).isZero();
        assertThat(count("planned_goal", "skillpilot_id", DUE_ID)).isZero();
        assertThat(count("learner_client_state", "skillpilot_id", DUE_ID)).isZero();
        assertThat(count("curriculum_champion", "skillpilot_id", DUE_ID)).isZero();
        assertThat(count("chat_start_code", "learner_skillpilot_id", DUE_ID)).isZero();
        assertThat(count("chat_session", "learner_skillpilot_id", DUE_ID)).isZero();
        assertThat(count("openai_de_learning_session", "learner_id", DUE_ID)).isZero();
        assertThat(count("claude_connection", "learner_skillpilot_id", DUE_ID)).isZero();
        assertThat(count("teacher_membership", "learner_id", DUE_ID)).isZero();
        assertThat(count("teacher_course", "id", TEACHER_COURSE_ID)).isOne();
        assertThat(count("learner_copy_sources", "source_id", DUE_ID)).isZero();
        assertThat(count("oauth2_authorization", "principal_name", CLAUDE_SUBJECT)).isZero();
        assertThat(count("oauth2_authorization_consent", "principal_name", CLAUDE_SUBJECT)).isZero();

        // OpenAI V1 OAuth is application-wide and has no learner subject link.
        assertThat(count("oauth2_authorization", "principal_name", APP_OAUTH_PRINCIPAL)).isOne();
        assertThat(count("oauth2_authorization_consent", "principal_name", APP_OAUTH_PRINCIPAL)).isOne();

        // The database prevents a concurrent or later import from recreating
        // the deleted raw ID as provenance. An import can still restore the
        // learning data while omitting a source ID that no longer exists.
        org.assertj.core.api.Assertions.assertThatThrownBy(() -> jdbc.update(
                        "INSERT INTO learner_copy_sources (learner_id, source_id, copied_at) VALUES (?, ?, ?)",
                        ACTIVE_ID, DUE_ID, Timestamp.from(now)))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void rejectedDomainResultRollsBackStateMutationAndRetentionActivity() {
        Instant lastActivityAt = Instant.parse("2026-01-01T00:00:00Z");
        Learner learner = learner(REJECTED_ID, lastActivityAt);
        learner.setActiveGoalId("goal-before");
        learners.saveAndFlush(learner);

        String result = lifecycle.withActivity(
                REJECTED_ID,
                () -> {
                    jdbc.update(
                            "UPDATE learner SET active_goal_id = ? WHERE skillpilot_id = ?",
                            "goal-after",
                            REJECTED_ID);
                    return "conflict";
                },
                "updated"::equals);

        assertThat(result).isEqualTo("conflict");
        assertThat(jdbc.queryForObject(
                        "SELECT active_goal_id FROM learner WHERE skillpilot_id = ?",
                        String.class,
                        REJECTED_ID))
                .isEqualTo("goal-before");
        assertThat(jdbc.queryForObject(
                                "SELECT last_activity_at FROM learner WHERE skillpilot_id = ?",
                                Timestamp.class,
                                REJECTED_ID)
                        .toInstant())
                .isEqualTo(lastActivityAt);
    }

    private Learner learner(String id, Instant lastActivityAt) {
        Learner learner = new Learner();
        learner.setSkillpilotId(id);
        learner.setLastActivityAt(lastActivityAt);
        return learner;
    }

    private void insertAuthorization(String id, String principal) {
        jdbc.update(
                "INSERT INTO oauth2_authorization "
                        + "(id, registered_client_id, principal_name, authorization_grant_type) "
                        + "VALUES (?, ?, ?, ?)",
                id, "retention-client", principal, "authorization_code");
    }

    private void insertConsent(String clientId, String principal) {
        jdbc.update(
                "INSERT INTO oauth2_authorization_consent "
                        + "(registered_client_id, principal_name, authorities) VALUES (?, ?, ?)",
                clientId, principal, "SCOPE_read");
    }

    private long count(String table, String column, String value) {
        Long count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM " + table + " WHERE " + column + " = ?",
                Long.class,
                value);
        return count == null ? 0L : count;
    }
}
