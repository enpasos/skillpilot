package com.skillpilot.backend.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class OpenAiDeLearningSessionDirectiveMigrationTest {

    private static final String CHANGELOG =
            "db/changelog/changes/021-pin-openai-recall-launch-directive.yaml";
    private static final String DATABASE_URL =
            "jdbc:h2:mem:openai-session-directive-migration;DB_CLOSE_DELAY=-1";

    @Test
    void migrationBackfillsLegacySessionsAndDropsTemporaryDefaults() throws Exception {
        try (Connection connection = DriverManager.getConnection(DATABASE_URL)) {
            try (Statement statement = connection.createStatement()) {
                statement.execute("""
                        CREATE TABLE openai_de_learning_session (
                          token_hash VARCHAR(128) PRIMARY KEY
                        )
                        """);
                statement.execute("""
                        INSERT INTO openai_de_learning_session (token_hash)
                        VALUES ('legacy-session')
                        """);
            }

            try (Liquibase liquibase = new Liquibase(
                    CHANGELOG,
                    new ClassLoaderResourceAccessor(),
                    new JdbcConnection(connection))) {
                liquibase.update(new Contexts());
            }
        }

        try (Connection connection = DriverManager.getConnection(DATABASE_URL)) {
            try (Statement statement = connection.createStatement();
                    ResultSet row = statement.executeQuery("""
                            SELECT verified_recall_batch_size
                            FROM openai_de_learning_session
                            WHERE token_hash = 'legacy-session'
                            """)) {
                assertThat(row.next()).isTrue();
                assertThat(row.getInt("verified_recall_batch_size")).isEqualTo(10);
            }

            assertThat(columnDefault(connection, "VERIFIED_RECALL_BATCH_SIZE")).isNull();
            assertThat(columnNullable(connection, "VERIFIED_RECALL_BATCH_SIZE")).isFalse();
        }
    }

    private String columnDefault(Connection connection, String columnName) throws Exception {
        try (ResultSet columns = connection.getMetaData().getColumns(
                null,
                null,
                "OPENAI_DE_LEARNING_SESSION",
                columnName)) {
            assertThat(columns.next()).isTrue();
            String value = columns.getString("COLUMN_DEF");
            return value == null || "NULL".equalsIgnoreCase(value) ? null : value;
        }
    }

    private boolean columnNullable(Connection connection, String columnName) throws Exception {
        try (ResultSet columns = connection.getMetaData().getColumns(
                null,
                null,
                "OPENAI_DE_LEARNING_SESSION",
                columnName)) {
            assertThat(columns.next()).isTrue();
            return columns.getInt("NULLABLE") != java.sql.DatabaseMetaData.columnNoNulls;
        }
    }
}
