package com.skillpilot.backend.openai.nativev1.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import liquibase.integration.spring.SpringLiquibase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2RefreshTokenAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.transaction.support.TransactionTemplate;

class OpenAiNativeRefreshTokenFamiliesTest {
    private static final String NATIVE_CLIENT_ID = "https://chatgpt.com/oauth/codex/native-test/client.json";
    private static final RegisteredClient NATIVE = client("native-client", NATIVE_CLIENT_ID, ClientAuthenticationMethod.NONE);
    private JdbcTemplate jdbc;
    private DataSourceTransactionManager transactions;
    private OpenAiNativeRefreshTokenFamilies families;

    @BeforeEach
    void database() throws Exception {
        var source = new DriverManagerDataSource("jdbc:h2:mem:openai_native_families_" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1", "sa", "");
        var migration = new SpringLiquibase();
        migration.setDataSource(source);
        migration.setChangeLog("classpath:db/changelog/changes/038-add-openai-native-refresh-families.yaml");
        migration.afterPropertiesSet();
        jdbc = new JdbcTemplate(source);
        transactions = new DataSourceTransactionManager(source);
        families = new OpenAiNativeRefreshTokenFamilies(jdbc, transactions);
    }

    @Test
    void concurrentInstancesAllowOneExchangeAndRevokeTheReusedFamilyOnly() throws Exception {
        var second = new OpenAiNativeRefreshTokenFamilies(jdbc, transactions);
        var original = authorization(NATIVE);
        var independent = authorization(NATIVE);
        record(original, independent);
        var renewed = renew(original);
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var exchanges = new AtomicInteger();
        try (var executor = Executors.newFixedThreadPool(2)) {
            Callable<Boolean> firstExchange = concurrentExchange(families, original, renewed, ready, start, exchanges);
            Callable<Boolean> secondExchange = concurrentExchange(second, original, renewed, ready, start, exchanges);
            var firstResult = executor.submit(firstExchange);
            var secondResult = executor.submit(secondExchange);
            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            assertThat(firstResult.get(10, TimeUnit.SECONDS)).isNotEqualTo(secondResult.get(10, TimeUnit.SECONDS));
        }
        assertThat(exchanges.get()).isEqualTo(1);
        var restarted = new OpenAiNativeRefreshTokenFamilies(jdbc, transactions);
        assertThat(restarted.permits(original)).isFalse();
        assertThat(restarted.permits(renewed)).isFalse();
        assertThat(restarted.permits(independent)).isTrue();
        assertInvalidGrant(() -> restarted.refresh(refreshValue(renewed), NATIVE.getId(), () -> {
            fail("A revoked family cannot reach the exchange provider");
            return null;
        }));
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM openai_native_refresh_history WHERE authorization_id = ?",
                Integer.class, original.getId())).isEqualTo(2);
    }

    @Test
    void reuseInvalidatesNewestAccessAndRefreshLookupWithoutAffectingOtherSessions() {
        var store = service(new InMemoryOAuth2AuthorizationService(), NATIVE);
        var original = authorization(NATIVE);
        var independent = authorization(NATIVE);
        store.save(original);
        store.save(independent);
        var renewed = renew(original);
        families.refresh(refreshValue(original), NATIVE.getId(), () -> {
            store.save(renewed);
            return success();
        });
        assertThat(store.findByToken(accessValue(renewed), OAuth2TokenType.ACCESS_TOKEN)).isNotNull();
        assertThat(store.findByToken(refreshValue(renewed), OAuth2TokenType.REFRESH_TOKEN)).isNotNull();
        assertInvalidGrant(() -> families.refresh(refreshValue(original), NATIVE.getId(), () -> {
            fail("Consumed token must not be exchanged twice");
            return null;
        }));
        assertThat(store.findById(original.getId())).isNull();
        assertThat(store.findByToken(accessValue(renewed), OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThat(store.findByToken(refreshValue(renewed), OAuth2TokenType.REFRESH_TOKEN)).isNull();
        assertThat(store.findByToken(accessValue(independent), OAuth2TokenType.ACCESS_TOKEN)).isNotNull();
    }

    @Test
    void foreignClientAndUnknownTokenCannotRevokeEvenWithAConsumedToken() {
        var original = authorization(NATIVE);
        var renewed = renew(original);
        record(original);
        families.refresh(refreshValue(original), NATIVE.getId(), () -> {
            families.record(renewed);
            return success();
        });
        assertInvalidGrant(() -> families.refresh(refreshValue(original), "foreign-client", () -> null));
        assertInvalidGrant(() -> families.refresh(refreshValue(renewed), "foreign-client", () -> null));
        assertInvalidGrant(() -> families.refresh("synthetic-unknown", NATIVE.getId(), () -> null));
        assertThat(families.permits(renewed)).isTrue();
    }

    @Test
    void failedExchangeRollsBackRotationButReuseRevocationSurvivesOuterRollback() {
        var original = authorization(NATIVE);
        var renewed = renew(original);
        record(original);
        assertThatThrownBy(() -> families.refresh(refreshValue(original), NATIVE.getId(), () -> {
            families.record(renewed);
            throw new IllegalStateException("synthetic exchange failure");
        })).isInstanceOf(IllegalStateException.class);
        assertThat(families.refresh(refreshValue(original), NATIVE.getId(), () -> {
            families.record(renewed);
            return success();
        })).isNotNull();
        new TransactionTemplate(transactions).execute(status -> {
            assertInvalidGrant(() -> families.refresh(refreshValue(original), NATIVE.getId(), () -> null));
            status.setRollbackOnly();
            return null;
        });
        assertThat(new OpenAiNativeRefreshTokenFamilies(jdbc, transactions).permits(renewed)).isFalse();
    }

    @Test
    void staleWriterCannotRestoreConsumedTokenOrChangeFamilyOwner() {
        var original = authorization(NATIVE);
        record(original, renew(original));
        assertInvalidGrant(() -> families.transaction(() -> {
            families.record(original);
            return null;
        }));
        var foreign = client("foreign", "foreign", ClientAuthenticationMethod.NONE);
        var collision = OAuth2Authorization.withRegisteredClient(foreign).id(original.getId())
                .principalName("synthetic-app").authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .refreshToken(new OAuth2RefreshToken("synthetic-foreign", Instant.now(), Instant.now().plusSeconds(3600)))
                .build();
        assertInvalidGrant(() -> families.transaction(() -> {
            families.record(collision);
            return null;
        }));
    }

    @Test
    void removalRevokesFamilyAndRejectsAnyStaleAuthorizationThatReappears() {
        var delegate = new InMemoryOAuth2AuthorizationService();
        var store = service(delegate, NATIVE);
        var original = authorization(NATIVE);
        store.save(original);
        store.remove(original);
        assertThat(jdbc.queryForObject("SELECT revoked FROM openai_native_refresh_family WHERE authorization_id = ?",
                Boolean.class, original.getId())).isTrue();
        delegate.save(original);
        assertThat(store.findById(original.getId())).isNull();
        assertThat(store.findByToken(accessValue(original), OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertInvalidGrant(() -> store.save(original));
    }

    @Test
    void savingInvalidatedRefreshOrAccessTokenRevokesItsStillActiveSibling() {
        var delegate = new InMemoryOAuth2AuthorizationService();
        var store = service(delegate, NATIVE);
        for (boolean invalidateRefresh : List.of(true, false)) {
            var original = authorization(NATIVE);
            store.save(original);
            var revoked = invalidateRefresh
                    ? OAuth2Authorization.from(original).token(original.getRefreshToken().getToken(), metadata ->
                            metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true)).build()
                    : OAuth2Authorization.from(original).token(original.getAccessToken().getToken(), metadata ->
                            metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true)).build();
            store.save(revoked);
            assertThat(delegate.findById(original.getId())).isSameAs(revoked);
            assertThat(store.findByToken(refreshValue(original), OAuth2TokenType.REFRESH_TOKEN)).isNull();
            assertThat(store.findByToken(accessValue(original), OAuth2TokenType.ACCESS_TOKEN)).isNull();
            assertThat(families.permits(original)).isFalse();
        }
    }

    @Test
    void hostedBasicJwtAndUnrelatedPublicClientsBypassFamilyStorageCompletely() {
        var untouched = mock(OpenAiNativeRefreshTokenFamilies.class);
        var basic = client("hosted-basic", "hosted-basic", ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
        var jwt = client("hosted-jwt", "hosted-jwt", ClientAuthenticationMethod.PRIVATE_KEY_JWT);
        var otherPublic = client("other-public", "other-public", ClientAuthenticationMethod.NONE);
        var mixed = RegisteredClient.from(NATIVE).id("mixed").clientAuthenticationMethod(ClientAuthenticationMethod.PRIVATE_KEY_JWT).build();
        var clients = new InMemoryRegisteredClientRepository(basic, jwt, otherPublic, mixed);
        var store = new OpenAiNativeFamilyAuthorizationService(new InMemoryOAuth2AuthorizationService(), clients,
                untouched, NATIVE_CLIENT_ID);
        for (RegisteredClient client : List.of(basic, jwt, otherPublic, mixed)) {
            var authorization = authorization(client);
            store.save(authorization);
            assertThat(store.findById(authorization.getId())).isSameAs(authorization);
            assertThat(store.findByToken(refreshValue(authorization), OAuth2TokenType.REFRESH_TOKEN)).isSameAs(authorization);
            assertThat(store.findByToken(accessValue(authorization), OAuth2TokenType.ACCESS_TOKEN)).isSameAs(authorization);
            store.remove(authorization);
        }
        verifyNoInteractions(untouched);
    }

    @Test
    void refreshProviderWrapsOnlyAuthenticatedExactNativePublicClient() {
        var untouched = mock(OpenAiNativeRefreshTokenFamilies.class);
        var calls = new AtomicInteger();
        AuthenticationProvider delegate = provider(request -> {
            calls.incrementAndGet();
            return success();
        });
        var wrapper = new OpenAiNativeFamilyRefreshAuthenticationProvider(delegate, untouched, NATIVE_CLIENT_ID);
        var basic = client("hosted-basic", "hosted-basic", ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
        var jwt = client("hosted-jwt", "hosted-jwt", ClientAuthenticationMethod.PRIVATE_KEY_JWT);
        var otherPublic = client("other-public", "other-public", ClientAuthenticationMethod.NONE);
        for (RegisteredClient client : List.of(basic, jwt, otherPublic)) {
            var method = client.getClientAuthenticationMethods().iterator().next();
            assertThat(wrapper.authenticate(refreshRequest(client, method, "synthetic-refresh"))).isNotNull();
        }
        var unauthenticated = new OAuth2ClientAuthenticationToken(NATIVE_CLIENT_ID, ClientAuthenticationMethod.NONE, null, null);
        assertThat(wrapper.authenticate(new OAuth2RefreshTokenAuthenticationToken("synthetic-refresh", unauthenticated, null, null)))
                .isNotNull();
        assertThat(wrapper.supports(OAuth2RefreshTokenAuthenticationToken.class)).isTrue();
        assertThat(calls.get()).isEqualTo(4);
        verifyNoInteractions(untouched);
    }

    @Test
    void nativeRefreshProviderUsesFamilyLockAndNeverExchangesReplayedToken() {
        var store = service(new InMemoryOAuth2AuthorizationService(), NATIVE);
        var original = authorization(NATIVE);
        var renewed = renew(original);
        store.save(original);
        var calls = new AtomicInteger();
        var wrapper = new OpenAiNativeFamilyRefreshAuthenticationProvider(provider(request -> {
            calls.incrementAndGet();
            store.save(renewed);
            return success();
        }), families, NATIVE_CLIENT_ID);
        var request = refreshRequest(NATIVE, ClientAuthenticationMethod.NONE, refreshValue(original));
        assertThat(wrapper.authenticate(request)).isNotNull();
        assertInvalidGrant(() -> wrapper.authenticate(request));
        assertThat(calls.get()).isEqualTo(1);
        assertThat(store.findByToken(accessValue(renewed), OAuth2TokenType.ACCESS_TOKEN)).isNull();
    }

    @Test
    void cleanupKeepsActiveHashesAndDeletesExpiredFamilyWithoutRestoringTokens() {
        var expired = authorization(NATIVE);
        var active = authorization(NATIVE);
        record(expired, active, renew(active));
        jdbc.update("UPDATE openai_native_refresh_family SET expires_at = ? WHERE authorization_id = ?",
                Timestamp.from(Instant.now().minusSeconds(60)), expired.getId());
        families.cleanupExpiredFamilies();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM openai_native_refresh_family WHERE authorization_id = ?",
                Integer.class, expired.getId())).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM openai_native_refresh_history WHERE authorization_id = ?",
                Integer.class, expired.getId())).isZero();
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM openai_native_refresh_history WHERE authorization_id = ?",
                Integer.class, active.getId())).isEqualTo(2);
        assertThat(families.permits(expired)).isFalse();
        assertThat(families.permits(active)).isTrue();
    }

    @Test
    void retentionCoversLongerAccessLifetimeAndStoresHashesInsteadOfRawRefreshTokens() {
        Instant now = Instant.now();
        var original = OAuth2Authorization.from(authorization(NATIVE))
                .accessToken(new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "synthetic-longer-access",
                        now, now.plusSeconds(7200))).build();
        record(original);
        assertThat(jdbc.queryForObject("SELECT expires_at FROM openai_native_refresh_family WHERE authorization_id = ?",
                Timestamp.class, original.getId()).toInstant()).isAfter(now.plusSeconds(7199));
        assertThat(jdbc.queryForObject("SELECT token_hash FROM openai_native_refresh_history WHERE authorization_id = ?",
                String.class, original.getId())).isEqualTo(OpenAiNativeRefreshTokenFamilies.hash(refreshValue(original)))
                .hasSize(64).isNotEqualTo(refreshValue(original));
    }

    private Callable<Boolean> concurrentExchange(OpenAiNativeRefreshTokenFamilies instance,
            OAuth2Authorization original, OAuth2Authorization renewed, CountDownLatch ready,
            CountDownLatch start, AtomicInteger exchanges) {
        return () -> {
            ready.countDown();
            assertThat(start.await(5, TimeUnit.SECONDS)).isTrue();
            try {
                instance.refresh(refreshValue(original), NATIVE.getId(), () -> {
                    exchanges.incrementAndGet();
                    instance.record(renewed);
                    return success();
                });
                return true;
            } catch (OAuth2AuthenticationException exception) {
                assertThat(exception.getError().getErrorCode()).isEqualTo("invalid_grant");
                return false;
            }
        };
    }

    private void record(OAuth2Authorization... authorizations) {
        families.transaction(() -> {
            for (OAuth2Authorization authorization : authorizations) families.record(authorization);
            return null;
        });
    }

    private OpenAiNativeFamilyAuthorizationService service(InMemoryOAuth2AuthorizationService delegate,
            RegisteredClient... clients) {
        return new OpenAiNativeFamilyAuthorizationService(delegate, new InMemoryRegisteredClientRepository(clients),
                families, NATIVE_CLIENT_ID);
    }

    private static void assertInvalidGrant(org.assertj.core.api.ThrowableAssert.ThrowingCallable action) {
        assertThatThrownBy(action).isInstanceOfSatisfying(OAuth2AuthenticationException.class,
                exception -> assertThat(exception.getError().getErrorCode()).isEqualTo("invalid_grant"));
    }

    private static RegisteredClient client(String id, String clientId, ClientAuthenticationMethod method) {
        return RegisteredClient.withId(id).clientId(clientId).clientAuthenticationMethod(method)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                .redirectUri("http://127.0.0.1/callback/native-test").scope("skillpilot.read").build();
    }

    private static OAuth2Authorization authorization(RegisteredClient client) {
        return renew(OAuth2Authorization.withRegisteredClient(client).principalName("synthetic-app")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).build());
    }

    private static OAuth2Authorization renew(OAuth2Authorization source) {
        Instant now = Instant.now();
        return OAuth2Authorization.from(source)
                .refreshToken(new OAuth2RefreshToken("synthetic-refresh-" + UUID.randomUUID(), now, now.plusSeconds(3600)))
                .accessToken(new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
                        "synthetic-access-" + UUID.randomUUID(), now, now.plusSeconds(600), Set.of("skillpilot.read")))
                .build();
    }

    private static String refreshValue(OAuth2Authorization authorization) {
        return authorization.getRefreshToken().getToken().getTokenValue();
    }

    private static String accessValue(OAuth2Authorization authorization) {
        return authorization.getAccessToken().getToken().getTokenValue();
    }

    private static Authentication success() { return new TestingAuthenticationToken("synthetic", null); }

    private static OAuth2RefreshTokenAuthenticationToken refreshRequest(RegisteredClient client,
            ClientAuthenticationMethod method, String token) {
        var principal = new OAuth2ClientAuthenticationToken(client, method, null);
        return new OAuth2RefreshTokenAuthenticationToken(token, principal, null, null);
    }

    private static AuthenticationProvider provider(java.util.function.Function<Authentication, Authentication> exchange) {
        return new AuthenticationProvider() {
            @Override public Authentication authenticate(Authentication authentication) { return exchange.apply(authentication); }
            @Override public boolean supports(Class<?> type) { return OAuth2RefreshTokenAuthenticationToken.class.isAssignableFrom(type); }
        };
    }
}
