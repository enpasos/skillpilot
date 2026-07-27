package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.List;
import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.transaction.support.TransactionTemplate;

class OpenAiDeOAuthLegacyClientCutoverTest {

    private JdbcTemplate jdbc;
    private OpenAiDeOAuthLegacyClientCutover cutover;

    @BeforeEach
    void setUp() {
        DataSource dataSource = new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .generateUniqueName(true)
                .build();
        jdbc = new JdbcTemplate(dataSource);
        cutover = new OpenAiDeOAuthLegacyClientCutover(
                jdbc,
                new TransactionTemplate(new DataSourceTransactionManager(dataSource)));
        createSchema();
    }

    @Test
    void cutsOverOnlyExactAllowlistedLegacyClientsAndTheirSubjects() {
        insertRegisteredClient("legacy-registration", "legacy-openai-de", "none");
        insertRegisteredClient("foreign-registration", "foreign-provider", "none");
        insertAuthorization("legacy-registration", "authorized-subject");
        insertConsent("legacy-registration", "consent-only-subject");
        insertAuthorization("foreign-registration", "foreign-subject");
        insertConsent("foreign-registration", "foreign-subject");
        for (String subject : List.of(
                "authorized-subject",
                "consent-only-subject",
                "foreign-subject")) {
            insertConnectionAndTransientState(subject);
        }

        OpenAiDeProperties properties = secureProperties("legacy-openai-de");
        cutover.execute(properties);
        cutover.execute(properties);

        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_registered_client WHERE client_id = ?",
                        "legacy-openai-de"))
                .isZero();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_registered_client WHERE client_id = ?",
                        "foreign-provider"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_authorization WHERE registered_client_id = ?",
                        "legacy-registration"))
                .isZero();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_authorization_consent WHERE registered_client_id = ?",
                        "legacy-registration"))
                .isZero();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_authorization WHERE registered_client_id = ?",
                        "foreign-registration"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_authorization_consent WHERE registered_client_id = ?",
                        "foreign-registration"))
                .isOne();

        assertSubjectWasRevokedAndTransientStateDeleted("authorized-subject");
        assertSubjectWasRevokedAndTransientStateDeleted("consent-only-subject");
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_connection WHERE subject = ? AND revoked_at IS NULL AND oauth_expires_at IS NULL",
                        "foreign-subject"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_pending_launch WHERE connection_subject = ?",
                        "foreign-subject"))
                .isOne();
    }

    @Test
    void rollsBackEntireCutoverWhenAllowlistTargetsANonLegacyClient() {
        insertRegisteredClient("first-registration", "first-legacy", "none");
        insertRegisteredClient("protected-registration", "not-a-legacy-client", "private_key_jwt");
        insertAuthorization("first-registration", "first-subject");
        insertConnectionAndTransientState("first-subject");
        OpenAiDeProperties properties = secureProperties(
                "first-legacy",
                "not-a-legacy-client");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> cutover.execute(properties))
                .withMessageContaining("does not use only")
                .withMessageContaining("not-a-legacy-client");

        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_registered_client WHERE client_id = ?",
                        "first-legacy"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_authorization WHERE registered_client_id = ?",
                        "first-registration"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_connection WHERE subject = ? AND revoked_at IS NULL",
                        "first-subject"))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_pending_launch WHERE connection_subject = ?",
                        "first-subject"))
                .isOne();
    }

    @Test
    void legacyModeNeverRunsTheSecureCutover() {
        insertRegisteredClient("legacy-registration", "legacy-openai-de", "none");
        OpenAiDeProperties properties = secureProperties("legacy-openai-de");
        properties.getOauth().setClientAuthenticationMethod("none");

        cutover.execute(properties);

        assertThat(count(
                        "SELECT COUNT(*) FROM oauth2_registered_client WHERE client_id = ?",
                        "legacy-openai-de"))
                .isOne();
    }

    private void assertSubjectWasRevokedAndTransientStateDeleted(String subject) {
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_connection WHERE subject = ? AND revoked_at IS NOT NULL AND oauth_expires_at IS NOT NULL",
                        subject))
                .isOne();
        assertThat(count(
                        "SELECT COUNT(*) FROM openai_de_pending_launch WHERE connection_subject = ?",
                        subject))
                .isZero();
    }

    private OpenAiDeProperties secureProperties(String... legacyClientIds) {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setClientAuthenticationMethod("client_secret_basic");
        properties.getOauth().setClientSecret(
                "test-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        properties.getOauth().setLegacyClientIds(List.of(legacyClientIds));
        return properties;
    }

    private void insertRegisteredClient(String id, String clientId, String authenticationMethods) {
        jdbc.update(
                "INSERT INTO oauth2_registered_client (id, client_id, client_authentication_methods) VALUES (?, ?, ?)",
                id,
                clientId,
                authenticationMethods);
    }

    private void insertAuthorization(String registeredClientId, String principalName) {
        jdbc.update(
                "INSERT INTO oauth2_authorization (registered_client_id, principal_name) VALUES (?, ?)",
                registeredClientId,
                principalName);
    }

    private void insertConsent(String registeredClientId, String principalName) {
        jdbc.update(
                "INSERT INTO oauth2_authorization_consent (registered_client_id, principal_name) VALUES (?, ?)",
                registeredClientId,
                principalName);
    }

    private void insertConnectionAndTransientState(String subject) {
        jdbc.update(
                "INSERT INTO openai_de_connection (subject, revoked_at, oauth_expires_at) VALUES (?, NULL, NULL)",
                subject);
        jdbc.update(
                "INSERT INTO openai_de_pending_launch (id, connection_subject) VALUES (?, ?)",
                "launch-" + subject,
                subject);
    }

    private int count(String sql, String value) {
        Integer result = jdbc.queryForObject(sql, Integer.class, value);
        return result == null ? 0 : result;
    }

    private void createSchema() {
        jdbc.execute(
                """
                CREATE TABLE oauth2_registered_client (
                    id VARCHAR(100) PRIMARY KEY,
                    client_id VARCHAR(500) NOT NULL UNIQUE,
                    client_authentication_methods VARCHAR(1000) NOT NULL
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE oauth2_authorization (
                    registered_client_id VARCHAR(100) NOT NULL,
                    principal_name VARCHAR(200) NOT NULL
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE oauth2_authorization_consent (
                    registered_client_id VARCHAR(100) NOT NULL,
                    principal_name VARCHAR(200) NOT NULL
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE openai_de_connection (
                    subject VARCHAR(96) PRIMARY KEY,
                    revoked_at TIMESTAMP WITH TIME ZONE,
                    oauth_expires_at TIMESTAMP WITH TIME ZONE
                )
                """);
        jdbc.execute(
                """
                CREATE TABLE openai_de_pending_launch (
                    id VARCHAR(200) PRIMARY KEY,
                    connection_subject VARCHAR(96) NOT NULL
                )
                """);
    }
}
