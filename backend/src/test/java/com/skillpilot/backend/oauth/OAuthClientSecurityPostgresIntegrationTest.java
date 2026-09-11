package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.transaction.support.TransactionTemplate;

/** CI must explicitly enable this suite and reject missing/skipped test reports. */
@EnabledIfEnvironmentVariable(named = "SKILLPILOT_OAUTH_POSTGRES_TEST_ENABLED", matches = "true")
class OAuthClientSecurityPostgresIntegrationTest {
    private OAuthClientSecurityTestDatabase db;
    private JdbcTemplate admin;
    private String schema;
    private boolean schemaCreated;

    @BeforeEach
    void createIsolatedSchema() throws Exception {
        String url = required("SKILLPILOT_OAUTH_TEST_POSTGRES_URL");
        URI address = URI.create(url.substring("jdbc:".length()));
        if (!url.startsWith("jdbc:postgresql://")
                || address.getRawQuery() != null || address.getRawFragment() != null || address.getRawUserInfo() != null
                || !List.of("127.0.0.1", "localhost", "postgres").contains(address.getHost())
                || !"/skillpilot_oauth_test".equals(address.getPath())) {
            throw new IllegalArgumentException("PostgreSQL security tests require a local disposable skillpilot_oauth_test database.");
        }
        String user = required("SKILLPILOT_OAUTH_TEST_POSTGRES_USER");
        String password = System.getenv("SKILLPILOT_OAUTH_TEST_POSTGRES_PASSWORD");
        if (password == null) throw new IllegalStateException("Explicit synthetic PostgreSQL test password is required (may be empty locally).");
        admin = new JdbcTemplate(new DriverManagerDataSource(url, user, password));
        schema = "oauth_security_" + UUID.randomUUID().toString().replace("-", "");
        if (!schema.matches("oauth_security_[0-9a-f]{32}")) throw new IllegalStateException("Invalid test schema.");
        admin.execute("CREATE SCHEMA " + schema);
        schemaCreated = true;
        var scoped = new DriverManagerDataSource(url, user, password);
        Properties connection = new Properties();
        connection.setProperty("currentSchema", schema);
        scoped.setConnectionProperties(connection);
        db = OAuthClientSecurityTestDatabase.migrate(scoped);
    }

    @AfterEach
    void dropOnlyCreatedSyntheticSchema() {
        if (schemaCreated && admin != null && schema != null && schema.matches("oauth_security_[0-9a-f]{32}")) {
            admin.execute("DROP SCHEMA IF EXISTS " + schema + " CASCADE");
        }
    }

    @Test
    void realRowLockAdmitsOneConcurrentConsumerAndSurvivesStoreReconstruction() throws Exception {
        String jti = UUID.randomUUID().toString();
        Instant until = Instant.now().plusSeconds(120);
        try (var executor = Executors.newFixedThreadPool(8)) {
            List<Callable<Boolean>> attempts = new ArrayList<>();
            for (int i = 0; i < 24; i++) attempts.add(() -> store().consume("openai-client", jti, until, 100));
            int successes = 0;
            for (var result : executor.invokeAll(attempts)) if (result.get()) successes++;
            assertThat(successes).isEqualTo(1);
        }
        assertThat(store().consume("openai-client", jti, until, 100)).isFalse();
    }

    @Test
    void failedGrantCannotRollBackCommittedAssertionConsumption() {
        String jti = UUID.randomUUID().toString();
        Instant until = Instant.now().plusSeconds(120);
        assertThatThrownBy(() -> new TransactionTemplate(db.transactions()).executeWithoutResult(status -> {
            assertThat(store().consume("openai-client", jti, until, 100)).isTrue();
            throw new IllegalStateException("synthetic grant failure");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(store().consume("openai-client", jti, until, 100)).isFalse();
    }

    @Test
    void durableFloorRejectsRestartedAndAlreadyRunningCompatibilityInstances() {
        var compatibility = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false);
        var oldService = compatibility.protect(new InMemoryOAuth2AuthorizationService(), "openai", "old");
        compatibility.afterSingletonsInstantiated();
        var strict = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        strict.protect(new InMemoryOAuth2AuthorizationService(), "openai", "jwt-v1");
        strict.afterSingletonsInstantiated();
        assertThatThrownBy(() -> oldService.findById("unknown")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false).assertCompatible())
                .isInstanceOf(IllegalStateException.class);
        assertThat(db.jdbc().queryForObject("SELECT authenticated_required FROM oauth_client_security_policy WHERE id = 1", Boolean.class)).isTrue();
        var next = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        next.protect(new InMemoryOAuth2AuthorizationService(), "openai", "jwt-v2");
        next.afterSingletonsInstantiated();
        var stale = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        assertThatThrownBy(() -> {
            stale.protect(new InMemoryOAuth2AuthorizationService(), "openai", "jwt-v1");
            stale.afterSingletonsInstantiated();
        })
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
    }

    @Test
    void databaseClockRejectsExpiredRetentionEvenIfCallerWouldAcceptOldAssertion() {
        assertThat(store().consume("lagging-node-client", UUID.randomUUID().toString(), Instant.now().minusSeconds(1), 100)).isFalse();
    }

    @Test
    void independentProfilesKeepClaudePublicWhileOnlyTheSecretRevisionChanges() {
        var publicProfile = new AuthenticatedClientPolicy.Profile("claude-cimd-public", "pg-public-1", "none", false);
        var secret1 = new AuthenticatedClientPolicy.Profile("claude-custom-confidential", "pg-secret-1", "client_secret_basic", false);
        var first = AuthenticatedClientPolicy.independentProfiles(db.jdbc(), db.transactions());
        first.protectProfiles(new InMemoryOAuth2AuthorizationService(), "claude", List.of(publicProfile, secret1), id -> null);
        first.afterSingletonsInstantiated();
        var secret2 = new AuthenticatedClientPolicy.Profile("claude-custom-confidential", "pg-secret-2", "client_secret_basic", false);
        var second = AuthenticatedClientPolicy.independentProfiles(db.jdbc(), db.transactions());
        second.protectProfiles(new InMemoryOAuth2AuthorizationService(), "claude", List.of(publicProfile, secret2), id -> null);
        second.afterSingletonsInstantiated();
        first.assertActiveProfile("claude", publicProfile.id());
        assertThatThrownBy(() -> first.assertActiveProfile("claude", secret1.id()))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThatThrownBy(() -> first.assertProfileAvailable("claude", secret1))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        second.assertActiveProfile("claude", secret2.id());
    }

    @Test
    void publicRefreshReuseRevokesExactlyItsFamilyAcrossDatabaseClientsAndRestarts() throws Exception {
        com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1RefreshTokenFamiliesTest
                .verifyConcurrentReuseAndIsolation(db.jdbc(), db.transactions());
    }

    @Test
    void authorizationCodeHasExactlyOneExchangeAcrossDatabaseClients() throws Exception {
        OAuthAuthorizationCodeExchangeGuardTest.verifyConcurrentCodeExchange(db.jdbc(), db.transactions());
    }

    @Test
    void codeExchangeAndConcurrentPolicyWriterCannotInvertDatabaseLocks() throws Exception {
        OAuthAuthorizationCodeExchangeGuardTest.verifyPolicyWriterAndCodeExchange(db.jdbc(), db.transactions());
    }

    private JdbcOAuthClientAssertionReplayStore store() {
        return new JdbcOAuthClientAssertionReplayStore(db.jdbc(), db.transactions());
    }

    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) throw new IllegalStateException("Required synthetic PostgreSQL setting is missing: " + name);
        return value;
    }
}
