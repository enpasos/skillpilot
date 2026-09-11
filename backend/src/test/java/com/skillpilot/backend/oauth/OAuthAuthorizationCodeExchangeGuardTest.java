package com.skillpilot.backend.oauth;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2AuthorizationCodeAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

public class OAuthAuthorizationCodeExchangeGuardTest {
    private JdbcTemplate jdbc;
    private DataSourceTransactionManager transactions;
    @BeforeEach void database() throws Exception {
        var database = OAuthClientSecurityTestDatabase.create();
        jdbc = database.jdbc(); transactions = database.transactions();
    }
    @Test void parallelInstancesExchangeACodeOnlyOnceAndRevokeTheReplayedGrant() throws Exception {
        verifyConcurrentCodeExchange(jdbc, transactions);
    }

    @Test void policyWriterAndCodeExchangeHaveTheSameDatabaseLockOrder() throws Exception {
        verifyPolicyWriterAndCodeExchange(jdbc, transactions);
    }

    /** Forces the formerly inverted locks; also exercised against real PostgreSQL in CI. */
    public static void verifyPolicyWriterAndCodeExchange(JdbcOperations jdbc, PlatformTransactionManager transactions) throws Exception {
        Fixture fixture = new Fixture(jdbc);
        var policyHeld = new CountDownLatch(1);
        var exchangeWaitingForPolicy = new CountDownLatch(1);
        JdbcOperations guardedJdbc = org.mockito.Mockito.mock(JdbcOperations.class, invocation -> {
            if (invocation.getMethod().getName().equals("queryForObject")
                    && invocation.getArgument(0).equals("SELECT authenticated_required FROM oauth_client_security_policy WHERE id = 1 FOR UPDATE")) {
                exchangeWaitingForPolicy.countDown();
            }
            try { return invocation.getMethod().invoke(jdbc, invocation.getRawArguments()); }
            catch (java.lang.reflect.InvocationTargetException failure) { throw failure.getCause(); }
        });
        var guard = new OAuthAuthorizationCodeExchangeGuard(provider(authentication -> {
            // Equivalent to the delegate's secured lookup/save, both re-enter the policy lock.
            AuthenticatedClientPolicy.lockPolicyRow(guardedJdbc);
            fixture.consume();
            return new TestingAuthenticationToken("synthetic", null);
        }), fixture, fixture, guardedJdbc, transactions);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var writer = executor.submit(() -> new TransactionTemplate(transactions).execute(status -> {
                AuthenticatedClientPolicy.lockPolicyRow(jdbc);
                policyHeld.countDown();
                try { assertTrue(exchangeWaitingForPolicy.await(5, TimeUnit.SECONDS)); }
                catch (InterruptedException interrupted) { throw new IllegalStateException(interrupted); }
                // With row -> policy in the code guard, this UPDATE deadlocks. With the
                // common policy -> row order it completes, letting the exchange proceed.
                return jdbc.update("UPDATE oauth2_authorization SET test_code_active = ? WHERE id = ?", true, Fixture.ID);
            }));
            assertTrue(policyHeld.await(5, TimeUnit.SECONDS));
            var exchanged = executor.submit(() -> guard.authenticate(fixture.request()));
            assertEquals(1, writer.get(10, TimeUnit.SECONDS));
            assertNotNull(exchanged.get(10, TimeUnit.SECONDS));
        }
        assertFalse(fixture.findById(Fixture.ID).getToken(OAuth2AuthorizationCode.class).isActive());
    }

    /** Also run against an isolated real PostgreSQL schema by CI; no production tables are touched. */
    public static void verifyConcurrentCodeExchange(JdbcOperations jdbc, PlatformTransactionManager transactions) throws Exception {
        Fixture fixture = new Fixture(jdbc);
        var barrier = new CyclicBarrier(2);
        OAuth2AuthorizationService initialLookup = new OAuth2AuthorizationService() {
            public void save(OAuth2Authorization value) { fixture.save(value); }
            public void remove(OAuth2Authorization value) { fixture.remove(value); }
            public OAuth2Authorization findById(String id) { return fixture.findById(id); }
            public OAuth2Authorization findByToken(String token, OAuth2TokenType type) {
                var result = fixture.findByToken(token, type);
                try { barrier.await(10, java.util.concurrent.TimeUnit.SECONDS); } catch (Exception e) { throw new IllegalStateException(e); }
                return result;
            }
        };
        AtomicInteger success = new AtomicInteger();
        AuthenticationProvider exchange = provider(authentication -> {
            var current = fixture.findById(Fixture.ID);
            assertTrue(current.getToken(OAuth2AuthorizationCode.class).isActive());
            fixture.consume(); success.incrementAndGet(); return new TestingAuthenticationToken("synthetic", null);
        });
        var first = new OAuthAuthorizationCodeExchangeGuard(exchange, initialLookup, fixture, jdbc, transactions);
        var second = new OAuthAuthorizationCodeExchangeGuard(exchange, initialLookup, fixture, jdbc, transactions);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var a = executor.submit(() -> accepted(first, fixture.request()));
            var b = executor.submit(() -> accepted(second, fixture.request()));
            assertNotEquals(a.get(15, java.util.concurrent.TimeUnit.SECONDS), b.get(15, java.util.concurrent.TimeUnit.SECONDS));
        }
        assertEquals(1, success.get());
        assertNull(fixture.findById(Fixture.ID), "Authenticated code reuse revokes the whole grant after releasing the row lock");
    }

    @Test void failedExchangePreservesDeliberateInvalidationEvenWhenCallerRollsBack() {
        Fixture fixture = new Fixture(jdbc);
        var guard = new OAuthAuthorizationCodeExchangeGuard(provider(authentication -> {
            fixture.consume(); throw new OAuth2AuthenticationException("invalid_grant");
        }), fixture, fixture, jdbc, transactions);
        new TransactionTemplate(transactions).execute(status -> {
            assertThrows(OAuth2AuthenticationException.class, () -> guard.authenticate(fixture.request()));
            status.setRollbackOnly(); return null;
        });
        assertFalse(fixture.findById(Fixture.ID).getToken(OAuth2AuthorizationCode.class).isActive());
    }

    @Test void wrongClientCannotConsumeOrRevokeCode() {
        Fixture fixture = new Fixture(jdbc);
        var guard = new OAuthAuthorizationCodeExchangeGuard(provider(authentication -> { fail("Unexpected exchange"); return null; }), fixture, fixture, jdbc, transactions);
        var foreign = RegisteredClient.from(fixture.client).id("foreign-client").clientId("foreign").build();
        var request = new OAuth2AuthorizationCodeAuthenticationToken(Fixture.CODE,
                new OAuth2ClientAuthenticationToken(foreign, ClientAuthenticationMethod.NONE, null), "https://claude.ai/api/mcp/auth_callback", Map.of());
        assertThrows(OAuth2AuthenticationException.class, () -> guard.authenticate(request));
        assertTrue(fixture.findById(Fixture.ID).getToken(OAuth2AuthorizationCode.class).isActive());
    }

    @Test void absentClientAuthenticationNeverLooksUpOrRevokesAGrant() {
        var secured = org.mockito.Mockito.mock(OAuth2AuthorizationService.class);
        var raw = org.mockito.Mockito.mock(OAuth2AuthorizationService.class);
        var sql = org.mockito.Mockito.mock(JdbcOperations.class);
        var guard = new OAuthAuthorizationCodeExchangeGuard(provider(authentication -> {
            throw new OAuth2AuthenticationException("invalid_client");
        }), secured, raw, sql, transactions);
        var client = new OAuth2ClientAuthenticationToken("synthetic-client", ClientAuthenticationMethod.NONE, null, Map.of());
        var request = new OAuth2AuthorizationCodeAuthenticationToken(Fixture.CODE, client, "https://claude.ai/api/mcp/auth_callback", Map.of());
        assertThrows(OAuth2AuthenticationException.class, () -> guard.authenticate(request));
        org.mockito.Mockito.verifyNoInteractions(secured, raw, sql);
    }

    @Test void unexpectedStorageOrGeneratorFailureRollsBackPartialExchange() {
        Fixture fixture = new Fixture(jdbc);
        var guard = new OAuthAuthorizationCodeExchangeGuard(provider(authentication -> {
            fixture.consume(); throw new IllegalStateException("synthetic storage failure");
        }), fixture, fixture, jdbc, transactions);
        assertThrows(IllegalStateException.class, () -> guard.authenticate(fixture.request()));
        assertTrue(fixture.findById(Fixture.ID).getToken(OAuth2AuthorizationCode.class).isActive());
    }

    private static boolean accepted(AuthenticationProvider provider, Authentication authentication) {
        try { assertNotNull(provider.authenticate(authentication)); return true; }
        catch (OAuth2AuthenticationException e) { assertEquals("invalid_grant", e.getError().getErrorCode()); return false; }
    }
    private static AuthenticationProvider provider(java.util.function.Function<Authentication, Authentication> exchange) {
        return new AuthenticationProvider() {
            public Authentication authenticate(Authentication authentication) { return exchange.apply(authentication); }
            public boolean supports(Class<?> type) { return OAuth2AuthorizationCodeAuthenticationToken.class.isAssignableFrom(type); }
        };
    }
    private static final class Fixture implements OAuth2AuthorizationService {
        static final String ID = "synthetic-authorization-row";
        static final String CODE = "synthetic-authorization-code";
        final JdbcOperations jdbc;
        final RegisteredClient client = RegisteredClient.withId("synthetic-client-row").clientId("synthetic-client")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE).authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://claude.ai/api/mcp/auth_callback").scope("skillpilot.read").build();
        Fixture(JdbcOperations jdbc) {
            this.jdbc = jdbc;
            jdbc.execute("CREATE TABLE oauth2_authorization (id VARCHAR(100) PRIMARY KEY, test_code_active BOOLEAN NOT NULL)");
            jdbc.update("INSERT INTO oauth2_authorization (id, test_code_active) VALUES (?, ?)", ID, true);
        }
        public void save(OAuth2Authorization authorization) {
            jdbc.update("UPDATE oauth2_authorization SET test_code_active = ? WHERE id = ?", authorization.getToken(OAuth2AuthorizationCode.class).isActive(), authorization.getId());
        }
        void consume() { jdbc.update("UPDATE oauth2_authorization SET test_code_active = ? WHERE id = ?", false, ID); }
        public void remove(OAuth2Authorization authorization) { jdbc.update("DELETE FROM oauth2_authorization WHERE id = ?", authorization.getId()); }
        public OAuth2Authorization findById(String id) {
            var rows = jdbc.query("SELECT test_code_active FROM oauth2_authorization WHERE id = ?", (rs, row) -> rs.getBoolean(1), id);
            if (rows.isEmpty()) return null;
            return OAuth2Authorization.withRegisteredClient(client).id(ID).principalName("synthetic-app")
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .token(new OAuth2AuthorizationCode(CODE, Instant.now().minusSeconds(60), Instant.now().plusSeconds(60)),
                            metadata -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, !rows.getFirst())).build();
        }
        public OAuth2Authorization findByToken(String token, OAuth2TokenType type) { return CODE.equals(token) ? findById(ID) : null; }
        OAuth2AuthorizationCodeAuthenticationToken request() { return new OAuth2AuthorizationCodeAuthenticationToken(CODE,
                new OAuth2ClientAuthenticationToken(client, ClientAuthenticationMethod.NONE, null), "https://claude.ai/api/mcp/auth_callback", Map.of()); }
    }
}
