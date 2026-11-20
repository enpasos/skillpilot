package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.UUID;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class VerifiedExamPassMigrationTest {
    @Test
    void startsEmptyAndEnforcesPassingScoresUniqueMaterialAndLearnerDeletion() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:" + UUID.randomUUID() + ";MODE=PostgreSQL");
                var sql = connection.createStatement()) {
            sql.execute("CREATE TABLE learner (skillpilot_id VARCHAR(80) PRIMARY KEY)");
            sql.execute("INSERT INTO learner VALUES ('learner')");
            sql.execute("CREATE TABLE mastery (goal_key VARCHAR(255), mastery_value DOUBLE PRECISION)");
            sql.execute("INSERT INTO mastery VALUES ('exam', 1.0)");
            new Liquibase("db/changelog/changes/044-add-verified-exam-pass.yaml",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection)).update(new Contexts());
            assertThat(count(connection)).isZero();
            String hash = "sha256:" + "a".repeat(64);
            try (var insert = connection.prepareStatement("""
                    INSERT INTO verified_exam_pass
                    (id, learner_id, goal_id, task_revision, rubric_revision, material_fingerprint, passed_at,
                     earned_points, max_points, passing_points)
                    VALUES (RANDOM_UUID(), 'learner', 'exam', ?, ?, ?, CURRENT_TIMESTAMP, ?, 10, 7)
                    """)) {
                insert.setString(1, hash);
                insert.setString(2, hash);
                insert.setString(3, hash);
                insert.setDouble(4, 6);
                assertThatThrownBy(insert::executeUpdate).isInstanceOf(SQLException.class);
                insert.setDouble(4, 7);
                assertThat(insert.executeUpdate()).isOne();
                assertThatThrownBy(insert::executeUpdate).isInstanceOf(SQLException.class);
            }
            assertThat(count(connection)).isOne();
            sql.executeUpdate("DELETE FROM learner WHERE skillpilot_id = 'learner'");
            assertThat(count(connection)).isZero();
        }
    }

    private static int count(Connection connection) throws SQLException {
        try (var statement = connection.createStatement();
                var result = statement.executeQuery("SELECT count(*) FROM verified_exam_pass")) {
            result.next();
            return result.getInt(1);
        }
    }
}
