package com.skillpilot.backend.migration;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.Instant;
import liquibase.Contexts;
import liquibase.Liquibase;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.junit.jupiter.api.Test;

class TeacherSupervisionRemovalMigrationTest {

    private static final String ADD_CHANGELOG =
            "db/changelog/changes/027-add-teacher-supervision.yaml";
    private static final String DROP_CHANGELOG =
            "db/changelog/changes/028-drop-teacher-supervision.yaml";
    private static final String DATABASE_URL =
            "jdbc:h2:mem:teacher-supervision-removal;MODE=PostgreSQL;DB_CLOSE_DELAY=-1";

    @Test
    void appliedTeacherSupervisionSchemaAndDataAreRemovedByForwardMigration() throws Exception {
        try (Connection connection = DriverManager.getConnection(DATABASE_URL)) {
            createLearnerTable(connection);
            apply(connection, ADD_CHANGELOG);
            insertActiveRelationship(connection);

            assertThat(tableExists(connection, "TEACHER_WORKSPACE")).isTrue();
            assertThat(tableExists(connection, "TEACHER_COURSE")).isTrue();
            assertThat(tableExists(connection, "TEACHER_MEMBERSHIP")).isTrue();

            apply(connection, DROP_CHANGELOG);
            assertThat(tableExists(connection, "TEACHER_MEMBERSHIP")).isFalse();
            assertThat(tableExists(connection, "TEACHER_COURSE")).isFalse();
            assertThat(tableExists(connection, "TEACHER_WORKSPACE")).isFalse();
            assertThat(changeSetRan(connection, "027-add-teacher-supervision")).isTrue();
            assertThat(changeSetRan(connection, "028-drop-teacher-supervision")).isTrue();
        }
    }

    private static void createLearnerTable(Connection connection) throws Exception {
        try (Statement statement = connection.createStatement()) {
            statement.execute("""
                    CREATE TABLE learner (
                      skillpilot_id VARCHAR(80) PRIMARY KEY
                    )
                    """);
            statement.execute("INSERT INTO learner (skillpilot_id) VALUES ('learner-1')");
        }
    }

    private static void insertActiveRelationship(Connection connection) throws Exception {
        Instant now = Instant.parse("2026-08-31T12:00:00Z");
        try (PreparedStatement workspace = connection.prepareStatement("""
                INSERT INTO teacher_workspace (id, access_token_hash, created_at)
                VALUES (?, ?, ?)
                """)) {
            workspace.setString(1, "4b557af7-00f1-4bb5-a137-12840a81982d");
            workspace.setString(2, "a".repeat(64));
            workspace.setTimestamp(3, Timestamp.from(now));
            workspace.executeUpdate();
        }
        try (PreparedStatement course = connection.prepareStatement("""
                INSERT INTO teacher_course
                  (id, workspace_id, course_label, teacher_display_name, created_at)
                VALUES (?, ?, ?, ?, ?)
                """)) {
            course.setString(1, "7ccb3e06-d821-48a3-b34d-b159d286b9b0");
            course.setString(2, "4b557af7-00f1-4bb5-a137-12840a81982d");
            course.setString(3, "Retired course");
            course.setString(4, "Retired teacher label");
            course.setTimestamp(5, Timestamp.from(now));
            course.executeUpdate();
        }
        try (PreparedStatement membership = connection.prepareStatement("""
                INSERT INTO teacher_membership
                  (member_id, invitation_id, course_id, learner_id, status,
                   personal_curriculum_read, mastery_read, expires_at, created_at, accepted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """)) {
            membership.setString(1, "95943d3c-4cc9-4a24-a177-967896ff86d7");
            membership.setString(2, "c1b8b69d-dd32-47d5-86ed-e43ae888dccc");
            membership.setString(3, "7ccb3e06-d821-48a3-b34d-b159d286b9b0");
            membership.setString(4, "learner-1");
            membership.setString(5, "ACTIVE");
            membership.setBoolean(6, true);
            membership.setBoolean(7, true);
            membership.setTimestamp(8, Timestamp.from(now.plusSeconds(300)));
            membership.setTimestamp(9, Timestamp.from(now));
            membership.setTimestamp(10, Timestamp.from(now));
            membership.executeUpdate();
        }
    }

    private static void apply(Connection connection, String changelog) throws Exception {
        Liquibase liquibase = new Liquibase(
                changelog,
                new ClassLoaderResourceAccessor(),
                new JdbcConnection(connection));
        liquibase.update(new Contexts());
    }

    private static boolean tableExists(Connection connection, String tableName) throws Exception {
        DatabaseMetaData metadata = connection.getMetaData();
        try (ResultSet tables = metadata.getTables(null, null, tableName, new String[] {"TABLE"})) {
            return tables.next();
        }
    }

    private static boolean changeSetRan(Connection connection, String id) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COUNT(*) FROM databasechangelog WHERE id = ?")) {
            statement.setString(1, id);
            try (ResultSet rows = statement.executeQuery()) {
                return rows.next() && rows.getInt(1) == 1;
            }
        }
    }
}
