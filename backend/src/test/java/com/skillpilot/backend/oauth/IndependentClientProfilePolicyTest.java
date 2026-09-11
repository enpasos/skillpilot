package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

class IndependentClientProfilePolicyTest {
    private static final AuthenticatedClientPolicy.Profile PUBLIC = profile("claude-cimd-public", "public-v1", "none");
    private static final AuthenticatedClientPolicy.Profile SECRET = profile("claude-custom-confidential", "custom-v1", "client_secret_basic");
    private static final AuthenticatedClientPolicy.Profile JWT = profile("chatgpt-cimd-jwt", "jwt-v1", "private_key_jwt");
    private static final AuthenticatedClientPolicy.Profile BASIC = new AuthenticatedClientPolicy.Profile(
            "chatgpt-basic-transition", "basic-v1", "client_secret_basic", true);

    @Test
    void publicClaudeAndJwtChatGptIssueIndependentProvenanceAndRejectCrossEndpointAccess() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var policy = policy(db);
        var claude = service(policy, delegate, "claude", List.of(PUBLIC), Map.of("claude-registration", PUBLIC.id()));
        var openai = service(policy, delegate, "openai", List.of(JWT), Map.of("openai-registration", JWT.id()));
        policy.afterSingletonsInstantiated();
        issue(claude, "public", "claude-registration");
        issue(openai, "jwt", "openai-registration");
        var publicGrant = claude.findById("public");
        assertThat(publicGrant.<String>getAttribute(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE)).isEqualTo(PUBLIC.id());
        assertThat(publicGrant.<String>getAttribute(AuthenticatedClientPolicy.METHOD_ATTRIBUTE)).isEqualTo("none");
        assertThat(openai.findById("jwt").<String>getAttribute(AuthenticatedClientPolicy.METHOD_ATTRIBUTE)).isEqualTo("private_key_jwt");
        assertThat(openai.findByToken("access-public", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThat(claude.findByToken("access-jwt", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThatThrownBy(() -> openai.save(publicGrant)).isInstanceOf(IllegalArgumentException.class);
        policy.assertActiveProfile("claude", PUBLIC.id());
        policy.assertActiveProfile("openai", JWT.id());
    }

    @Test
    void delayedConsentCannotReplaceRemoveOrReactivateAnIssuedCode() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var policy = policy(db);
        var secured = service(policy, delegate, "openai", List.of(JWT), Map.of("registered", JWT.id()));
        policy.afterSingletonsInstantiated();
        secured.save(authorization("consent-race", "registered"));
        var consentSnapshot = secured.findById("consent-race");
        var code = new org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode(
                "synthetic-original-code", Instant.now(), Instant.now().plusSeconds(60));
        secured.save(OAuth2Authorization.from(consentSnapshot).token(code).build());
        var differentCode = new org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode(
                "synthetic-delayed-consent-code", Instant.now(), Instant.now().plusSeconds(60));
        assertThatThrownBy(() -> secured.save(OAuth2Authorization.from(consentSnapshot).token(differentCode).build()))
                .isInstanceOf(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class);
        assertThatThrownBy(() -> secured.save(consentSnapshot))
                .isInstanceOf(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class);
        var issued = secured.findById("consent-race");
        secured.save(OAuth2Authorization.from(issued).token(code,
                metadata -> metadata.put(OAuth2Authorization.Token.INVALIDATED_METADATA_NAME, true)).build());
        assertThatThrownBy(() -> secured.save(issued))
                .isInstanceOf(org.springframework.security.oauth2.core.OAuth2AuthenticationException.class);
        assertThat(secured.findById("consent-race").getToken(code.getTokenValue()).isInvalidated()).isTrue();
    }

    @Test
    void publicGrantCannotBecomeConfidentialByChangingRegistrationOrConfiguration() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var first = policy(db);
        var publicService = service(first, delegate, "claude", List.of(PUBLIC), Map.of("same-registration", PUBLIC.id()));
        first.afterSingletonsInstantiated();
        issue(publicService, "public", "same-registration");
        var old = publicService.findById("public");
        var second = policy(db);
        var secretService = service(second, delegate, "claude", List.of(SECRET), Map.of("same-registration", SECRET.id()));
        second.afterSingletonsInstantiated();
        assertThat(secretService.findByToken("access-public", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThat(secretService.findByToken("refresh-public", OAuth2TokenType.REFRESH_TOKEN)).isNull();
        assertThatThrownBy(() -> secretService.save(old)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> publicService.findById("public")).isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        issue(secretService, "new", "same-registration");
        assertThat(secretService.findById("new").<String>getAttribute(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE)).isEqualTo(SECRET.id());
    }

    @Test
    void enablingJwtKeepsExistingBasicGrantsWithoutPromotingThem() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var old = tokens(authorization("old-basic", "basic-registration"));
        delegate.save(old);
        var policy = policy(db);
        var openai = service(policy, delegate, "openai", List.of(JWT, BASIC),
                Map.of("basic-registration", BASIC.id(), "jwt-registration", JWT.id()));
        policy.afterSingletonsInstantiated();
        assertThat(openai.findByToken("access-old-basic", OAuth2TokenType.ACCESS_TOKEN)).isNotNull();
        openai.save(OAuth2Authorization.from(old).attribute("normal-refresh-update", "unchanged-assurance").build());
        assertThat(openai.findById("old-basic").<Object>getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE)).isNull();
        issue(openai, "new-basic", "basic-registration");
        assertThat(openai.findById("new-basic").<String>getAttribute(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE)).isEqualTo(BASIC.id());
        issue(openai, "new-jwt", "jwt-registration");
        var jwt = openai.findById("new-jwt");
        var forged = OAuth2Authorization.from(old).attributes(attributes -> {
            attributes.put(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE, jwt.getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE));
            attributes.put(AuthenticatedClientPolicy.PROFILE_ATTRIBUTE, JWT.id());
            attributes.put(AuthenticatedClientPolicy.METHOD_ATTRIBUTE, "private_key_jwt");
        }).build();
        assertThatThrownBy(() -> openai.save(forged)).isInstanceOf(IllegalArgumentException.class);
        delegate.save(tokens(authorization("old-public", "jwt-registration")));
        assertThat(openai.findByToken("access-old-public", OAuth2TokenType.ACCESS_TOKEN)).isNull();
    }

    @Test
    void publicUnmarkedTokenAndExistingAuthorizationCodeRequireReconnection() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var oldCode = authorization("old-code", "claude-registration");
        var oldTokens = tokens(authorization("old-token", "claude-registration"));
        delegate.save(oldCode);
        delegate.save(oldTokens);
        var policy = policy(db);
        var claude = service(policy, delegate, "claude", List.of(PUBLIC), Map.of("claude-registration", PUBLIC.id()));
        policy.afterSingletonsInstantiated();
        assertThat(claude.findById("old-code")).isNull();
        assertThat(claude.findByToken("access-old-token", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThatThrownBy(() -> claude.save(oldCode)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> claude.save(oldTokens)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rollingBackOnlySecretProfileLeavesPublicAndOtherProviderWorking() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var first = policy(db);
        var claude1 = service(first, delegate, "claude", List.of(PUBLIC, SECRET),
                Map.of("public", PUBLIC.id(), "secret", SECRET.id()));
        var openai = service(first, delegate, "openai", List.of(JWT), Map.of("jwt", JWT.id()));
        first.afterSingletonsInstantiated();
        issue(claude1, "public", "public");
        issue(claude1, "secret", "secret");
        issue(openai, "jwt", "jwt");
        var disableSecret = policy(db);
        var claude2 = service(disableSecret, delegate, "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        disableSecret.afterSingletonsInstantiated();
        assertThat(claude2.findById("public")).isNotNull();
        assertThat(claude1.findById("public")).isNotNull();
        assertThat(openai.findById("jwt")).isNotNull();
        assertThat(claude2.findById("secret")).isNull();
        assertThatThrownBy(() -> claude1.findById("secret")).isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThatThrownBy(() -> policy(db).assertProfileAvailable("claude", SECRET))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class).hasMessageContaining("revision");
        var restoredSecret = profile(SECRET.id(), "custom-v2", "client_secret_basic");
        var restore = policy(db);
        var claude3 = service(restore, delegate, "claude", List.of(PUBLIC, restoredSecret),
                Map.of("public", PUBLIC.id(), "secret", SECRET.id()));
        restore.afterSingletonsInstantiated();
        assertThat(claude3.findById("secret")).isNull();
        assertThat(claude3.findById("public")).isNotNull();
        issue(claude3, "secret-new", "secret");
        assertThat(claude3.findById("secret-new")).isNotNull();
    }

    @Test
    void restartWithSameProfileKeepsProvenanceDespiteLegacyFloorBarrier() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var first = policy(db);
        var claude1 = service(first, delegate, "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        first.afterSingletonsInstantiated();
        issue(claude1, "public", "public");
        var restart = policy(db);
        restart.assertCompatible();
        var claude2 = service(restart, delegate, "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        restart.afterSingletonsInstantiated();
        assertThat(claude2.findById("public")).isNotNull();
        assertThatThrownBy(() -> new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false).assertCompatible())
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
    }

    @Test
    void invalidConfigurationCannotActivateAndEarlyRequestsRemainClosed() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var policy = policy(db);
        var claude = service(policy, new InMemoryOAuth2AuthorizationService(), "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        assertThatThrownBy(() -> claude.save(authorization("early", "public")))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThatThrownBy(() -> policy.assertActiveProfile("claude", PUBLIC.id()))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThat(db.jdbc().queryForObject("SELECT authenticated_required FROM oauth_client_security_policy WHERE id=1", Boolean.class)).isFalse();
        assertThatThrownBy(() -> new AuthenticatedClientPolicy.Profile(PUBLIC.id(), "v1", "none", true))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new AuthenticatedClientPolicy.Profile("anything", "v1", "unrecognized", false))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void databaseOutageCannotBypassPublicProfileChecks() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var policy = policy(db);
        var claude = service(policy, new InMemoryOAuth2AuthorizationService(), "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        policy.afterSingletonsInstantiated();
        issue(claude, "public", "public");
        // Only this test's random in-memory schema is affected.
        db.jdbc().execute("ALTER TABLE oauth_client_auth_profile RENAME TO unavailable_test_profile");
        assertThatThrownBy(() -> claude.findById("public")).isInstanceOf(org.springframework.dao.DataAccessException.class);
        assertThatThrownBy(() -> claude.save(authorization("new", "public"))).isInstanceOf(org.springframework.dao.DataAccessException.class);
    }

    @Test
    void historicalClaudeV1AggregateCannotRemainActiveOrRestartAfterMigration() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var old = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var stale = old.protect(new InMemoryOAuth2AuthorizationService(), "claude-v1", "legacy-confidential-policy");
        old.afterSingletonsInstantiated();
        old.assertActiveProfile("claude-v1");
        var current = policy(db);
        service(current, new InMemoryOAuth2AuthorizationService(), "claude", List.of(PUBLIC), Map.of("public", PUBLIC.id()));
        current.afterSingletonsInstantiated();
        current.assertActiveProfile("claude", PUBLIC.id());
        assertThatThrownBy(() -> stale.findById("unknown")).isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThatThrownBy(() -> new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true)
                .protect(new InMemoryOAuth2AuthorizationService(), "claude-v1", "legacy-confidential-policy"))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
    }

    @Test
    void basicRevisionChangeCannotResurrectAnOldUnmarkedGrant() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var legacy = tokens(authorization("legacy-basic", "basic"));
        delegate.save(legacy);
        var first = policy(db);
        var basic1 = service(first, delegate, "openai", List.of(BASIC, JWT), Map.of("basic", BASIC.id(), "jwt", JWT.id()));
        first.afterSingletonsInstantiated();
        assertThat(basic1.findById("legacy-basic")).isNotNull();
        var disable = policy(db);
        service(disable, delegate, "openai", List.of(JWT), Map.of("jwt", JWT.id()));
        disable.afterSingletonsInstantiated();
        var revised = new AuthenticatedClientPolicy.Profile(BASIC.id(), "basic-v2", "client_secret_basic", true);
        var restore = policy(db);
        var basic2 = service(restore, delegate, "openai", List.of(revised, JWT), Map.of("basic", BASIC.id(), "jwt", JWT.id()));
        restore.afterSingletonsInstantiated();
        assertThat(basic2.findById("legacy-basic")).isNull();
        assertThat(basic2.findByToken("refresh-legacy-basic", OAuth2TokenType.REFRESH_TOKEN)).isNull();
        assertThatThrownBy(() -> basic2.save(legacy)).isInstanceOf(IllegalArgumentException.class);
        issue(basic2, "new-basic", "basic");
        assertThat(basic2.findById("new-basic")).isNotNull();
    }

    @Test
    void grantIdentityCannotBeReassignedEvenThroughTheUnmarkedBasicException() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        delegate.save(tokens(authorization("same-id", "old-public")));
        var policy = policy(db);
        var service = service(policy, delegate, "openai", List.of(BASIC, JWT),
                Map.of("old-public", JWT.id(), "basic", BASIC.id()));
        policy.afterSingletonsInstantiated();
        assertThatThrownBy(() -> service.save(tokens(authorization("same-id", "basic"))))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("client");
        issue(service, "marked-basic", "basic");
        var existing = service.findById("marked-basic");
        assertThatThrownBy(() -> service.save(OAuth2Authorization.from(existing).principalName("different-app").build()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("principal");
    }

    private static AuthenticatedClientPolicy policy(OAuthClientSecurityTestDatabase db) {
        return AuthenticatedClientPolicy.independentProfiles(db.jdbc(), db.transactions());
    }

    private static AuthenticatedClientPolicy.Profile profile(String id, String revision, String method) {
        return new AuthenticatedClientPolicy.Profile(id, revision, method, false);
    }

    private static OAuth2AuthorizationService service(AuthenticatedClientPolicy policy, OAuth2AuthorizationService delegate,
            String provider, List<AuthenticatedClientPolicy.Profile> profiles, Map<String, String> registrations) {
        return policy.protectProfiles(delegate, provider, profiles, registrations::get);
    }

    private static void issue(OAuth2AuthorizationService service, String id, String registration) {
        service.save(authorization(id, registration));
        service.save(tokens(service.findById(id)));
    }

    private static OAuth2Authorization authorization(String id, String registration) {
        var client = RegisteredClient.withId(registration).clientId(registration)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://client.example/callback").scope("read").build();
        return OAuth2Authorization.withRegisteredClient(client).id(id).principalName("synthetic-app")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).build();
    }

    private static OAuth2Authorization tokens(OAuth2Authorization authorization) {
        var now = Instant.now();
        return OAuth2Authorization.from(authorization).accessToken(new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER, "access-" + authorization.getId(), now, now.plusSeconds(60), Set.of("read")))
                .refreshToken(new OAuth2RefreshToken("refresh-" + authorization.getId(), now, now.plusSeconds(600))).build();
    }
}
