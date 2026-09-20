package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.*;
import java.sql.DriverManager;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class ChampionTrialMigrationTest {
    @Test
    void upgradesExistingAssignmentsAndLedgerWithoutInventingHumanPractice() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:champion-trial-migration;MODE=PostgreSQL;DB_CLOSE_DELAY=-1");
                var statement = connection.createStatement()) {
            statement.execute("CREATE TABLE curriculum_champion (id VARCHAR(36) PRIMARY KEY)");
            statement.execute("CREATE TABLE learner_goal_completion (id VARCHAR(36) PRIMARY KEY)");
            statement.execute("INSERT INTO curriculum_champion VALUES ('registered-only')");
            statement.execute("INSERT INTO learner_goal_completion VALUES ('old-transition')");
            new Liquibase("db/changelog/changes/035-add-champion-human-trial.yaml",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection)).update(new Contexts());
            try (var row = statement.executeQuery("SELECT * FROM curriculum_champion")) {
                assertThat(row.next()).isTrue();
                assertThat(row.getObject("trial_started_at")).isNull();
                assertThat(row.getString("trial_confirmations_json")).isNull();
                assertThat(row.getObject("assignment_ended_at")).isNull();
            }
            try (var row = statement.executeQuery("SELECT * FROM learner_goal_completion")) {
                assertThat(row.next()).isTrue();
                assertThat(row.getBoolean("observed_transition")).isTrue();
                assertThat(row.getString("practice_evidence_json")).isNull();
            }
        }
    }
}
