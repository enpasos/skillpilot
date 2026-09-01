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

class LearnerLearningPlanMigrationTest {

    private static final String CHANGELOG =
            "db/changelog/changes/029-add-learner-learning-plans.yaml";

    @Test
    void migrationCreatesLearnerOwnedUniqueCascadeAndDisabledOptIn() throws Exception {
        try (Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:learner-learning-plan-migration;MODE=PostgreSQL;DB_CLOSE_DELAY=-1")) {
            try (Statement statement = connection.createStatement()) {
                statement.execute("CREATE TABLE learner (skillpilot_id VARCHAR(80) PRIMARY KEY)");
                statement.execute("INSERT INTO learner (skillpilot_id) VALUES ('learner-1')");
            }
            Liquibase liquibase = new Liquibase(
                    CHANGELOG,
                    new ClassLoaderResourceAccessor(),
                    new JdbcConnection(connection));
            liquibase.update(new Contexts());

            try (Statement statement = connection.createStatement();
                    ResultSet row = statement.executeQuery(
                            "SELECT follow_learning_plans FROM learner WHERE skillpilot_id='learner-1'")) {
                assertThat(row.next()).isTrue();
                assertThat(row.getBoolean(1)).isFalse();
            }

            String insert = """
                    INSERT INTO learner_learning_plan
                      (id, learner_id, landscape_id, curriculum_id, scope_fingerprint,
                       revision, blocks_json, captured_at, created_at, updated_at)
                    VALUES
                      ('2bcd497b-77f1-426b-a52d-1e9ad11fb771', 'learner-1', 'math',
                       'curriculum', 'sha256:abc', 1, '[]', CURRENT_TIMESTAMP,
                       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    """;
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate(insert);
                assertThatThrownBy(() -> statement.executeUpdate(insert.replace(
                                "2bcd497b-77f1-426b-a52d-1e9ad11fb771",
                                "0b321c15-48bd-49c9-a176-6a79b69eae35")))
                        .isInstanceOf(Exception.class);
                statement.executeUpdate("DELETE FROM learner WHERE skillpilot_id='learner-1'");
            }
            try (Statement statement = connection.createStatement();
                    ResultSet row = statement.executeQuery("SELECT COUNT(*) FROM learner_learning_plan")) {
                assertThat(row.next()).isTrue();
                assertThat(row.getInt(1)).isZero();
            }
        }
    }
}
