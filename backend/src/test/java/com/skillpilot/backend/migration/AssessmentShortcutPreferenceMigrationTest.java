package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.*;

import java.sql.DriverManager;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class AssessmentShortcutPreferenceMigrationTest {
    @Test void enablesExistingAndNewLearnersWithoutChangingMastery() throws Exception {
        try (var connection = DriverManager.getConnection("jdbc:h2:mem:assessment-shortcut-migration;MODE=PostgreSQL");
                var statement = connection.createStatement()) {
            statement.execute("CREATE TABLE learner (skillpilot_id VARCHAR(80) PRIMARY KEY)");
            statement.execute("CREATE TABLE mastery (skillpilot_id VARCHAR(80), mastery_value DOUBLE PRECISION)");
            statement.execute("INSERT INTO learner VALUES ('existing')");
            statement.execute("INSERT INTO mastery VALUES ('existing', 1)");
            new Liquibase("db/changelog/changes/042-add-assessment-shortcuts-preference.yaml",
                    new ClassLoaderResourceAccessor(), new JdbcConnection(connection)).update(new Contexts());
            statement.execute("INSERT INTO learner (skillpilot_id) VALUES ('new')");
            try (var rows = statement.executeQuery("SELECT use_assessment_shortcuts FROM learner ORDER BY skillpilot_id")) {
                assertThat(rows.next()).isTrue(); assertThat(rows.getBoolean(1)).isTrue();
                assertThat(rows.next()).isTrue(); assertThat(rows.getBoolean(1)).isTrue();
                assertThat(rows.next()).isFalse();
            }
            statement.execute("UPDATE learner SET use_assessment_shortcuts = false WHERE skillpilot_id = 'existing'");
            assertThatThrownBy(() -> statement.execute("UPDATE learner SET use_assessment_shortcuts = NULL"))
                    .isInstanceOf(java.sql.SQLException.class);
            try (var rows = statement.executeQuery("SELECT mastery_value FROM mastery")) {
                assertThat(rows.next()).isTrue(); assertThat(rows.getDouble(1)).isEqualTo(1);
                assertThat(rows.next()).isFalse();
            }
        }
    }
}
