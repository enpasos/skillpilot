package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class LearnerGoalCompletionMigrationTest {
    @Test
    void createsEmptyLedgerWithoutBackfillAndEnforcesDailyUniquenessAndLearnerCascade() throws Exception {
        try (Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:goal-completion-migration;MODE=PostgreSQL;DB_CLOSE_DELAY=-1");
                Statement statement = connection.createStatement()) {
            statement.execute("CREATE TABLE learner (skillpilot_id VARCHAR(80) PRIMARY KEY)");
            statement.execute("CREATE TABLE mastery (skillpilot_id VARCHAR(80), goal_key VARCHAR(255), "
                    + "mastery_value DOUBLE PRECISION, updated_at TIMESTAMP WITH TIME ZONE)");
            statement.execute("INSERT INTO learner VALUES ('learner-1')");
            statement.execute("INSERT INTO mastery VALUES ('learner-1', 'goal', 1.0, CURRENT_TIMESTAMP)");
            new Liquibase(
                    "db/changelog/changes/033-add-learner-goal-completions.yaml",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection)).update(new Contexts());
            assertCount(statement, 0);
            String insert = """
                    INSERT INTO learner_goal_completion
                      (id, learner_id, goal_id, completion_date, occurred_at, mastery_value)
                    VALUES ('2bcd497b-77f1-426b-a52d-1e9ad11fb771', 'learner-1', 'goal',
                            DATE '2026-09-11', CURRENT_TIMESTAMP, 1.0)
                    """;
            statement.executeUpdate(insert);
            assertThatThrownBy(() -> statement.executeUpdate(insert.replace(
                    "2bcd497b-77f1-426b-a52d-1e9ad11fb771", "0b321c15-48bd-49c9-a176-6a79b69eae35")))
                    .isInstanceOf(java.sql.SQLException.class);
            statement.executeUpdate(insert.replace("2026-09-11", "2026-09-12")
                    .replace("2bcd497b-77f1-426b-a52d-1e9ad11fb771", "7a3e41b1-4d2d-4f19-8378-af326e6a3bfa"));
            assertCount(statement, 2);
            statement.executeUpdate("DELETE FROM learner WHERE skillpilot_id = 'learner-1'");
            assertCount(statement, 0);
        }
    }

    private void assertCount(Statement statement, int expected) throws Exception {
        try (ResultSet row = statement.executeQuery("SELECT COUNT(*) FROM learner_goal_completion")) {
            assertThat(row.next()).isTrue();
            assertThat(row.getInt(1)).isEqualTo(expected);
        }
    }
}
