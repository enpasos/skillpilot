package com.skillpilot.backend.connectors.claude.v1.oauth;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.Executors;
import liquibase.integration.spring.SpringLiquibase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

public class ClaudeV1RefreshTokenFamiliesTest {
    private JdbcTemplate jdbc;
    private DataSourceTransactionManager transactions;
    @BeforeEach void database() throws Exception {
        var dataSource = new DriverManagerDataSource("jdbc:h2:mem:claude_families_" + UUID.randomUUID() + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "sa", "");
        var migration = new SpringLiquibase(); migration.setDataSource(dataSource);
        migration.setChangeLog("classpath:db/changelog/changes/032-add-claude-refresh-token-families.yaml"); migration.afterPropertiesSet();
        jdbc = new JdbcTemplate(dataSource); transactions = new DataSourceTransactionManager(dataSource);
    }

    @Test void concurrentInstancesPermitOneRotationThenRevokeThatFamilyOnly() throws Exception {
        verifyConcurrentReuseAndIsolation(jdbc, transactions);
    }

    /** Shared scenario also executed by the real PostgreSQL CI test after migration 032. */
    public static void verifyConcurrentReuseAndIsolation(JdbcOperations jdbc, PlatformTransactionManager transactions) throws Exception {
        var first = new ClaudeV1RefreshTokenFamilies(jdbc, transactions);
        var second = new ClaudeV1RefreshTokenFamilies(jdbc, transactions);
        var original = authorization("client-a"); var independent = authorization("client-a");
        first.transaction(() -> { first.record(original); first.record(independent); return null; });
        var renewed = renew(original);
        java.util.concurrent.Callable<Boolean> exchange = () -> {
            try {
                second.refresh(original.getRefreshToken().getToken().getTokenValue(), "client-a", () -> {
                    second.record(renewed); return new TestingAuthenticationToken("synthetic", null);
                }); return true;
            } catch (OAuth2AuthenticationException exception) {
                assertEquals("invalid_grant", exception.getError().getErrorCode()); return false;
            }
        };
        try (var executor = Executors.newFixedThreadPool(2)) {
            var a = executor.submit(exchange); var b = executor.submit(exchange);
            assertNotEquals(a.get(), b.get());
        }
        var restarted = new ClaudeV1RefreshTokenFamilies(jdbc, transactions);
        assertFalse(restarted.permits(original)); assertFalse(restarted.permits(renewed)); assertTrue(restarted.permits(independent));
        assertThrows(OAuth2AuthenticationException.class, () -> restarted.refresh(renewed.getRefreshToken().getToken().getTokenValue(), "client-a", () -> {
            fail("A revoked family must never reach the exchange provider"); return null;
        }));
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_refresh_history WHERE authorization_id = ?", Integer.class, original.getId()));
    }

    @Test void wrongClientAndUnknownTokenCannotRevokeAValidFamily() {
        var families = new ClaudeV1RefreshTokenFamilies(jdbc, transactions); var original = authorization("client-a");
        families.transaction(() -> { families.record(original); return null; });
        assertThrows(OAuth2AuthenticationException.class, () -> families.refresh(original.getRefreshToken().getToken().getTokenValue(), "client-b", () -> null));
        assertThrows(OAuth2AuthenticationException.class, () -> families.refresh("synthetic-unknown", "client-a", () -> null));
        assertTrue(families.permits(original));
    }

    @Test void failedExchangeRollsBackRotationButReuseRevocationSurvivesOuterRollback() {
        var families = new ClaudeV1RefreshTokenFamilies(jdbc, transactions); var original = authorization("client-a"); var renewed = renew(original);
        families.transaction(() -> { families.record(original); return null; });
        assertThrows(IllegalStateException.class, () -> families.refresh(original.getRefreshToken().getToken().getTokenValue(), "client-a", () -> {
            families.record(renewed); throw new IllegalStateException("synthetic exchange failure");
        }));
        assertNotNull(families.refresh(original.getRefreshToken().getToken().getTokenValue(), "client-a", () -> {
            families.record(renewed); return new TestingAuthenticationToken("synthetic", null);
        }));
        new TransactionTemplate(transactions).execute(status -> {
            assertThrows(OAuth2AuthenticationException.class, () -> families.refresh(original.getRefreshToken().getToken().getTokenValue(), "client-a", () -> null));
            status.setRollbackOnly(); return null;
        });
        assertFalse(new ClaudeV1RefreshTokenFamilies(jdbc, transactions).permits(renewed));
    }

    @Test void staleWriterCannotRestoreConsumedToken() {
        var families = new ClaudeV1RefreshTokenFamilies(jdbc, transactions); var original = authorization("client-a");
        families.transaction(() -> { families.record(original); families.record(renew(original)); return null; });
        assertThrows(OAuth2AuthenticationException.class, () -> families.transaction(() -> { families.record(original); return null; }));
    }

    @Test void cleanupDeletesOnlyExpiredFamiliesAndNeverMakesTheirTokensValidAgain() {
        var families = new ClaudeV1RefreshTokenFamilies(jdbc, transactions); var expired = authorization("client-a"); var active = authorization("client-a");
        families.transaction(() -> { families.record(expired); families.record(active); families.record(renew(active)); return null; });
        jdbc.update("UPDATE claude_v1_refresh_family SET expires_at = ? WHERE authorization_id = ?",
                java.sql.Timestamp.from(Instant.now().minusSeconds(60)), expired.getId());
        families.cleanupExpiredFamilies();
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_refresh_family WHERE authorization_id = ?", Integer.class, expired.getId()));
        assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_refresh_history WHERE authorization_id = ?", Integer.class, expired.getId()));
        assertEquals(2, jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_refresh_history WHERE authorization_id = ?", Integer.class, active.getId()));
        assertFalse(families.permits(expired)); assertTrue(families.permits(active));
    }

    private static OAuth2Authorization authorization(String clientId) {
        RegisteredClient client = RegisteredClient.withId(clientId).clientId("synthetic-" + clientId)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE).authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://claude.ai/api/mcp/auth_callback").scope("skillpilot.read").build();
        return renew(OAuth2Authorization.withRegisteredClient(client).principalName("synthetic-app")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).build());
    }
    private static OAuth2Authorization renew(OAuth2Authorization source) {
        return OAuth2Authorization.from(source).refreshToken(new OAuth2RefreshToken("synthetic-refresh-" + UUID.randomUUID(),
                Instant.now(), Instant.now().plusSeconds(3600))).build();
    }
}
