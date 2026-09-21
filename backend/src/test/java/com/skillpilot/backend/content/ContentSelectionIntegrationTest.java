package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
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
        "skillpilot.openai.coach.v1.enabled=false"
})
@ActiveProfiles("test")
class ContentSelectionIntegrationTest {
    private static final String A = "content-test-a";
    private static final String B = "content-test-b";
    private static final String PACKAGE = "physik-libre-gymnasium";
    private static final String GOAL = "d67502e3-5e0a-595b-a24b-65b1c40de36e";

    @Autowired ContentSelectionService selections;
    @Autowired ContentMaterialResolver materials;
    @Autowired LearnerRepository learners;
    @Autowired LearnerService learnerService;
    @Autowired LearnerLifecycleService lifecycle;
    @Autowired JdbcTemplate jdbc;
    @Autowired ObjectMapper mapper;
    @Autowired CoachToolFacade coach;
    @Autowired PlatformTransactionManager transactionManager;
    @Autowired ContentAvailability availability;
    @Autowired WebApplicationContext applicationContext;

    private MockMvc http() {
        // Exercise the real MVC converters: a forced Jackson 2 converter hid a
        // production failure when Boot's Jackson 3 could not read the request type.
        return MockMvcBuilders.webAppContextSetup(applicationContext).build();
    }

    @Test void optInPersistenceIsolationImportConcurrencyAndDeletion() throws Exception {
        Learner a = new Learner(); a.setSkillpilotId(A); a.setActiveGoalId(GOAL);
        Learner b = new Learner(); b.setSkillpilotId(B); b.setActiveGoalId(GOAL);
        learners.saveAndFlush(a); learners.saveAndFlush(b);
        jdbc.update("INSERT INTO mastery (skillpilot_id, goal_key, value, updated_at) VALUES (?, ?, 0.5, CURRENT_TIMESTAMP)", A, GOAL);
        jdbc.update("INSERT INTO planned_goal (skillpilot_id, goal_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)", A, GOAL);
        var masteryBefore = jdbc.queryForList("SELECT * FROM mastery WHERE skillpilot_id = ?", A);
        var plannedBefore = jdbc.queryForList("SELECT * FROM planned_goal WHERE skillpilot_id = ?", A);

        assertThat(materials.resolve(A, GOAL, "de")).isEmpty();
        assertThat(availability.isEnabled()).as("ordinary material settings are available by default").isTrue();
        var selected = selections.update(A, 0, List.of(PACKAGE));
        assertThat(selected.revision()).isEqualTo(1);
        assertThat(selections.selectedPackageIds(A)).containsExactly(PACKAGE);
        assertThat(materials.resolve(A, GOAL, "de")).hasSize(1);
        var activeGoal = new FrontierGoal(GOAL, "Videoanalyse", "Bewegungen untersuchen", "atomic",
                "tutor", "content", null, List.of(), List.of(), null, null, null, null, false);
        assertThat(coach.getAdditionalLearningMaterials(A, activeGoal, "de")).hasSize(1);
        assertThat(mapper.writeValueAsString(coach.getAdditionalLearningMaterials(A, activeGoal, "de")))
                .doesNotContain(A, B, "selectedPackageIds");
        assertThat(materials.resolve(B, GOAL, "de")).isEmpty();
        assertThat(materials.resolve(A, "unmapped", "de")).isEmpty();
        assertThat(learners.findById(A).orElseThrow().getActiveGoalId()).isEqualTo(GOAL);
        assertThat(learners.findById(A).orElseThrow().getCoachStateRevision()).isEqualTo(1);
        assertThat(jdbc.queryForList("SELECT * FROM mastery WHERE skillpilot_id = ?", A)).isEqualTo(masteryBefore);
        assertThat(jdbc.queryForList("SELECT * FROM planned_goal WHERE skillpilot_id = ?", A)).isEqualTo(plannedBefore);
        assertThat(selections.update(A, 1, List.of(PACKAGE))).isEqualTo(selected);
        assertThat(learners.findById(A).orElseThrow().getCoachStateRevision()).isEqualTo(1);
        assertStatus(() -> selections.update(A, 0, List.of()), HttpStatus.CONFLICT);
        assertStatus(() -> selections.update(A, 1, List.of("unknown")), HttpStatus.BAD_REQUEST);

        var archive = learnerService.exportLearner(A);
        assertThat(mapper.writeValueAsString(archive)).doesNotContain(PACKAGE, "selectedPackageIds");
        learnerService.importLearner(A, archive);
        learnerService.importLearner(B, archive);
        assertThat(selections.selectedPackageIds(A)).containsExactly(PACKAGE);
        assertThat(selections.selectedPackageIds(B)).isEmpty();

        assertThat(selections.update(A, 1, List.of()).selectedPackageIds()).isEmpty();
        assertThat(materials.resolve(A, GOAL, "de")).isEmpty();
        assertThat(coach.getAdditionalLearningMaterials(A, activeGoal, "de")).isEmpty();
        assertThat(selections.selection(A).revision()).isEqualTo(2);
        // Real profile deletion cascades through the newly isolated table as well.
        lifecycle.deleteConfirmed(A, A);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM learner_content_selection WHERE learner_id = ?", Long.class, A)).isZero();
        assertThat(learners.existsById(B)).isTrue();
    }

    @Test void ordinaryCockpitHttpSettingIsRevisionSafeAndProfileLocalWithoutAdditionalCredentials() throws Exception {
        String first = "content-http-first";
        String second = "content-http-second";
        for (String id : List.of(first, second)) {
            Learner learner = new Learner(); learner.setSkillpilotId(id);
            learners.saveAndFlush(learner);
        }
        MockMvc mvc = http();
        String selectedBody = "{\"expectedRevision\":0,\"selectedPackageIds\":[\"" + PACKAGE + "\"]}";
        mvc.perform(get("/api/ui/learners/{id}/content-selection", first))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(0))
                .andExpect(jsonPath("$.selectedPackageIds").isEmpty())
                .andExpect(jsonPath("$.packages[0].packageId").value(PACKAGE));
        mvc.perform(put("/api/ui/learners/{id}/content-selection", first)
                        .contentType(MediaType.APPLICATION_JSON).content(selectedBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(1));
        mvc.perform(get("/api/ui/learners/{id}/content-selection", first))
                .andExpect(status().isOk()).andExpect(jsonPath("$.selectedPackageIds[0]").value(PACKAGE));
        mvc.perform(get("/api/ui/learners/{id}/content-selection", second))
                .andExpect(status().isOk()).andExpect(jsonPath("$.selectedPackageIds").isEmpty());
        var firstActivity = learners.findById(first).orElseThrow().getLastActivityAt();

        // Stale tabs and invalid package IDs do not overwrite preferences or record activity.
        mvc.perform(put("/api/ui/learners/{id}/content-selection", first)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":0,\"selectedPackageIds\":[]}"))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/ui/learners/{id}/content-selection", first)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":1,\"selectedPackageIds\":[\"unknown\"]}"))
                .andExpect(status().isBadRequest());
        assertThat(selections.selection(first)).isEqualTo(new ContentSelectionService.Selection(1, Set.of(PACKAGE)));
        assertThat(learners.findById(first).orElseThrow().getLastActivityAt()).isEqualTo(firstActivity);
        assertThat(learners.findById(first).orElseThrow().getCoachStateRevision()).isEqualTo(1);

        // A second known SkillPilot ID uses the same normal setting, without provisioning.
        mvc.perform(put("/api/ui/learners/{id}/content-selection", second)
                        .contentType(MediaType.APPLICATION_JSON).content(selectedBody))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(1));
        mvc.perform(put("/api/ui/learners/{id}/content-selection", first)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":1,\"selectedPackageIds\":[]}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(2))
                .andExpect(jsonPath("$.selectedPackageIds").isEmpty());
        mvc.perform(get("/api/ui/learners/{id}/content-selection", first))
                .andExpect(status().isOk()).andExpect(jsonPath("$.revision").value(2))
                .andExpect(jsonPath("$.selectedPackageIds").isEmpty());
        assertThat(selections.selectedPackageIds(second)).containsExactly(PACKAGE);
        lifecycle.deleteConfirmed(first, first);
        lifecycle.deleteConfirmed(second, second);
    }

    @Test void actualMvcRejectsInvalidJsonWithoutChangingSavedSelectionOrActivity() throws Exception {
        String id = "content-http-invalid-json";
        Learner learner = new Learner(); learner.setSkillpilotId(id);
        learners.saveAndFlush(learner);
        MockMvc mvc = http();
        mvc.perform(put("/api/ui/learners/{id}/content-selection", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":0,\"selectedPackageIds\":[\"" + PACKAGE + "\"]}"))
                .andExpect(status().isOk());
        var activityBefore = learners.findById(id).orElseThrow().getLastActivityAt();
        try {
            for (String invalid : List.of(
                    "{\"expectedRevision\":1,\"selectedPackageIds\":[],\"extra\":true}",
                    "{\"expectedRevision\":\"1\",\"selectedPackageIds\":[]}",
                    "{\"expectedRevision\":null,\"selectedPackageIds\":[]}",
                    "{\"expectedRevision\":1.5,\"selectedPackageIds\":[]}",
                    "{\"expectedRevision\":9223372036854775808,\"selectedPackageIds\":[]}",
                    "{\"expectedRevision\":1,\"selectedPackageIds\":null}",
                    "{\"expectedRevision\":1,\"selectedPackageIds\":\"" + PACKAGE + "\"}",
                    "{\"expectedRevision\":1,\"selectedPackageIds\":[null]}",
                    "{\"expectedRevision\":1,\"selectedPackageIds\":[true]}",
                    "{\"expectedRevision\":1,\"selectedPackageIds\":["
                            + String.join(",", java.util.Collections.nCopies(21, "\"" + PACKAGE + "\"")) + "]}",
                    "{}", "[]", "true", "null", "{broken")) {
                mvc.perform(put("/api/ui/learners/{id}/content-selection", id)
                                .contentType(MediaType.APPLICATION_JSON).content(invalid))
                        .andExpect(status().isBadRequest());
            }
            assertThat(selections.selection(id))
                    .isEqualTo(new ContentSelectionService.Selection(1, Set.of(PACKAGE)));
            var unchanged = learners.findById(id).orElseThrow();
            assertThat(unchanged.getLastActivityAt()).isEqualTo(activityBefore);
            assertThat(unchanged.getCoachStateRevision()).isEqualTo(1);
        } finally {
            lifecycle.deleteConfirmed(id, id);
        }
    }

    @Test void ordinaryAccessGuardsRejectMissingDeletedDerivedAndRetiredProfiles() throws Exception {
        String deleted = "content-http-deleted";
        Learner learner = new Learner(); learner.setSkillpilotId(deleted);
        learners.saveAndFlush(learner);
        selections.update(deleted, 0, List.of(PACKAGE));
        lifecycle.deleteConfirmed(deleted, deleted);
        MockMvc mvc = http();
        for (String id : List.of("content-http-missing", deleted, "sps_" + "a".repeat(43))) {
            mvc.perform(get("/api/ui/learners/{id}/content-selection", id))
                    .andExpect(status().isNotFound());
            mvc.perform(get("/api/ui/learners/{id}/content-materials", id).queryParam("goalId", GOAL))
                    .andExpect(status().isNotFound());
            mvc.perform(put("/api/ui/learners/{id}/content-selection", id)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"expectedRevision\":0,\"selectedPackageIds\":[\"" + PACKAGE + "\"]}"))
                    .andExpect(status().isNotFound());
            assertThat(learners.existsById(id)).isFalse();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM learner_content_selection WHERE learner_id = ?",
                    Long.class, id)).isZero();
        }

        String retiredId = "content-http-retired";
        Learner retired = new Learner(); retired.setSkillpilotId(retiredId);
        retired.setSelectedCurriculum("c1600692-e543-5cf2-a399-6bd96e6b817f");
        learners.saveAndFlush(retired);
        var activityBefore = learners.findById(retiredId).orElseThrow().getLastActivityAt();
        mvc.perform(get("/api/ui/learners/{id}/content-selection", retiredId))
                .andExpect(status().isConflict());
        mvc.perform(get("/api/ui/learners/{id}/content-materials", retiredId).queryParam("goalId", GOAL))
                .andExpect(status().isConflict());
        mvc.perform(put("/api/ui/learners/{id}/content-selection", retiredId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":0,\"selectedPackageIds\":[\"" + PACKAGE + "\"]}"))
                .andExpect(status().isConflict());
        assertThat(selections.selection(retiredId)).isEqualTo(new ContentSelectionService.Selection(0, Set.of()));
        assertThat(learners.findById(retiredId).orElseThrow().getLastActivityAt()).isEqualTo(activityBefore);
        assertThat(learners.findById(retiredId).orElseThrow().getCoachStateRevision()).isZero();
        lifecycle.deleteConfirmed(retiredId, retiredId);
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
