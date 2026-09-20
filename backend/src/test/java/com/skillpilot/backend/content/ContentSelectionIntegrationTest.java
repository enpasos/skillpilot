package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.ChampionPracticeFingerprint;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Real schema, persistence, import isolation, revision and lifecycle regression. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:content-pilot;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "spring.security.oauth2.client.registration.github.client-id=content-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=content-test-secret",
        "skillpilot.security.signing-secret=content-test-signing-secret",
        "skillpilot.learner-retention.enabled=false", "skillpilot.claude.enabled=false",
        "skillpilot.openai.coach.v1.enabled=false", "skillpilot.content.enabled=true"
})
@ActiveProfiles("test")
class ContentSelectionIntegrationTest {
    private static final String A = "content-test-a";
    private static final String B = "content-test-b";
    private static final String KEY = "a".repeat(43); // synthetic test capability, never provisioned
    private static final String PACKAGE = "physik-libre-gymnasium";
    private static final String GOAL = "d67502e3-5e0a-595b-a24b-65b1c40de36e";

    @DynamicPropertySource static void grants(DynamicPropertyRegistry properties) {
        properties.add("skillpilot.content.configuration-grants-json", () ->
                "{\"" + A + "\":\"" + ChampionPracticeFingerprint.digest(KEY) + "\"}");
    }

    @Autowired ContentSelectionService selections;
    @Autowired ContentMaterialResolver materials;
    @Autowired LearnerRepository learners;
    @Autowired LearnerService learnerService;
    @Autowired LearnerLifecycleService lifecycle;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired CoachToolFacade coach;
    @Autowired PlatformTransactionManager transactionManager;

    @Test void optInPersistenceIsolationImportConcurrencyAndDeletion() throws Exception {
        Learner a = new Learner(); a.setSkillpilotId(A); a.setActiveGoalId(GOAL);
        Learner b = new Learner(); b.setSkillpilotId(B); b.setActiveGoalId(GOAL);
        learners.saveAndFlush(a); learners.saveAndFlush(b);
        jdbc.update("INSERT INTO mastery (skillpilot_id, goal_key, value, updated_at) VALUES (?, ?, 0.5, CURRENT_TIMESTAMP)", A, GOAL);
        jdbc.update("INSERT INTO planned_goal (skillpilot_id, goal_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)", A, GOAL);
        var masteryBefore = jdbc.queryForList("SELECT * FROM mastery WHERE skillpilot_id = ?", A);
        var plannedBefore = jdbc.queryForList("SELECT * FROM planned_goal WHERE skillpilot_id = ?", A);

        assertThat(materials.resolve(A, GOAL, "de")).isEmpty();
        var selected = selections.update(A, KEY, 0, List.of(PACKAGE));
        assertThat(selected.revision()).isEqualTo(1);
        assertThat(selections.selectedPackageIds(A)).containsExactly(PACKAGE);
        assertThat(materials.resolve(A, GOAL, "de")).hasSize(1);
        var activeGoal = new FrontierGoal(GOAL, "Videoanalyse", "Bewegungen untersuchen", "atomic",
                "tutor", "content", null, List.of(), List.of(), null, null, null, null, false);
        assertThat(coach.getAdditionalLearningMaterials(A, activeGoal, "de")).hasSize(1);
        assertThat(mapper.writeValueAsString(coach.getAdditionalLearningMaterials(A, activeGoal, "de")))
                .doesNotContain(A, B, KEY, "selectedPackageIds");
        assertThat(materials.resolve(B, GOAL, "de")).isEmpty();
        assertThat(materials.resolve(A, "unmapped", "de")).isEmpty();
        assertThat(learners.findById(A).orElseThrow().getActiveGoalId()).isEqualTo(GOAL);
        assertThat(learners.findById(A).orElseThrow().getCoachStateRevision()).isEqualTo(1);
        assertThat(jdbc.queryForList("SELECT * FROM mastery WHERE skillpilot_id = ?", A)).isEqualTo(masteryBefore);
        assertThat(jdbc.queryForList("SELECT * FROM planned_goal WHERE skillpilot_id = ?", A)).isEqualTo(plannedBefore);
        assertThat(selections.update(A, KEY, 1, List.of(PACKAGE))).isEqualTo(selected);
        assertThat(learners.findById(A).orElseThrow().getCoachStateRevision()).isEqualTo(1);
        assertStatus(() -> selections.update(A, KEY, 0, List.of()), HttpStatus.CONFLICT);
        assertStatus(() -> selections.update(B, KEY, 0, List.of(PACKAGE)), HttpStatus.FORBIDDEN);
        assertStatus(() -> selections.update(A, KEY, 1, List.of("unknown")), HttpStatus.BAD_REQUEST);

        var archive = learnerService.exportLearner(A);
        assertThat(mapper.writeValueAsString(archive)).doesNotContain(PACKAGE, KEY, "selectedPackageIds");
        learnerService.importLearner(A, archive);
        learnerService.importLearner(B, archive);
        assertThat(selections.selectedPackageIds(A)).containsExactly(PACKAGE);
        assertThat(selections.selectedPackageIds(B)).isEmpty();

        assertThat(selections.update(A, KEY, 1, List.of()).selectedPackageIds()).isEmpty();
        assertThat(materials.resolve(A, GOAL, "de")).isEmpty();
        assertThat(coach.getAdditionalLearningMaterials(A, activeGoal, "de")).isEmpty();
        assertThat(selections.selection(A).revision()).isEqualTo(2);
        // Real profile deletion cascades through the newly isolated table as well.
        lifecycle.deleteConfirmed(A, A);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM learner_content_selection WHERE learner_id = ?", Long.class, A)).isZero();
        assertThat(learners.existsById(B)).isTrue();
    }

    @Test void failedOptionalSqlLookupCannotRollBackTheOuterLearningTransaction() {
        String learnerId = "content-failure-isolation";
        Learner learner = new Learner(); learner.setSkillpilotId(learnerId);
        learners.saveAndFlush(learner);
        jdbc.update("INSERT INTO mastery (skillpilot_id, goal_key, value, updated_at) VALUES (?, ?, 0, CURRENT_TIMESTAMP)",
                learnerId, GOAL);

        // Real SQL failure, not a mocked resolver: rename only this isolated test database's
        // optional table outside the transaction so the proxied selection read actually fails.
        jdbc.execute("ALTER TABLE learner_content_selection RENAME TO learner_content_selection_unavailable");
        try {
            new TransactionTemplate(transactionManager).executeWithoutResult(status -> {
                jdbc.update("UPDATE mastery SET value = 0.5 WHERE skillpilot_id = ? AND goal_key = ?", learnerId, GOAL);
                assertThat(materials.resolve(learnerId, GOAL, "de")).isEmpty();
                assertThat(status.isRollbackOnly()).as("optional SQL must not poison the learning transaction").isFalse();
                jdbc.update("UPDATE mastery SET value = 1 WHERE skillpilot_id = ? AND goal_key = ?", learnerId, GOAL);
            });
            assertThat(jdbc.queryForObject("SELECT value FROM mastery WHERE skillpilot_id = ? AND goal_key = ?",
                    Double.class, learnerId, GOAL)).isEqualTo(1.0);
        } finally {
            jdbc.execute("ALTER TABLE learner_content_selection_unavailable RENAME TO learner_content_selection");
            jdbc.update("DELETE FROM mastery WHERE skillpilot_id = ?", learnerId);
            learners.deleteById(learnerId);
        }
    }

    private static void assertStatus(Runnable action, HttpStatus status) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                ex -> assertThat(ex.getStatusCode()).isEqualTo(status));
    }
}
