package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

class AuthenticatedClientPolicyTest {
    @Test
    void activationBlocksCompatibilityStartupAndAlreadyRunningService() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var oldPolicy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false);
        var oldService = oldPolicy.protect(delegate, "openai", "legacy");
        oldPolicy.assertActiveProfile("openai");
        oldService.save(authorization("legacy", true));
        assertThat(oldService.findByToken("access-legacy", OAuth2TokenType.ACCESS_TOKEN)).isNotNull();
        var strict = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var service = strict.protect(delegate, "openai", "private_key_jwt-v1");
        strict.afterSingletonsInstantiated();
        assertThat(service.findByToken("access-legacy", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThat(service.findByToken("refresh-legacy", OAuth2TokenType.REFRESH_TOKEN)).isNull();
        assertThatThrownBy(oldPolicy::assertCompatible).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> oldPolicy.assertActiveProfile("openai"))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThatThrownBy(() -> oldService.findById("legacy")).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> oldService.save(authorization("later", false))).isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false).assertCompatible())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void newFlowRetainsProvenanceOnTokensAndRejectsCrossProviderOrUnmarkedSaves() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var policy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var service = policy.protect(delegate, "openai", "jwt-v1");
        var other = policy.protect(delegate, "claude", "secret-v1");
        policy.afterSingletonsInstantiated();
        service.save(authorization("new", false));
        var marked = service.findById("new");
        assertThat((String) marked.getAttribute(AuthenticatedClientPolicy.PROVENANCE_ATTRIBUTE)).startsWith("openai:");
        var issued = OAuth2Authorization.from(marked).accessToken(accessToken("new")).build();
        service.save(issued);
        assertThat(service.findByToken("access-new", OAuth2TokenType.ACCESS_TOKEN)).isNotNull();
        assertThat(other.findByToken("access-new", OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThatThrownBy(() -> other.save(issued)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> service.save(authorization("unmarked", true))).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void changedProfileInvalidatesTokensAndRunningOldProfile() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var policy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var old = policy.protect(delegate, "openai", "version-1");
        policy.afterSingletonsInstantiated();
        policy.assertActiveProfile("openai");
        old.save(authorization("first", false));
        var nextPolicy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var replacement = nextPolicy.protect(delegate, "openai", "version-2");
        nextPolicy.afterSingletonsInstantiated();
        nextPolicy.assertActiveProfile("openai");
        assertThatThrownBy(() -> policy.assertActiveProfile("openai"))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThat(replacement.findById("first")).isNull();
        assertThatThrownBy(() -> old.findById("first")).isInstanceOf(IllegalStateException.class);
        var restartedPolicy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var afterRestart = restartedPolicy.protect(delegate, "openai", "version-2");
        restartedPolicy.afterSingletonsInstantiated();
        afterRestart.save(authorization("second", false));
        assertThat(afterRestart.findById("second")).isNotNull();
        var stalePolicy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        assertThatThrownBy(() -> {
            stalePolicy.protect(delegate, "openai", "version-1");
            stalePolicy.afterSingletonsInstantiated();
        })
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class)
                .hasMessageContaining("retired");
        assertThat(afterRestart.findById("second")).isNotNull();
        assertThat(afterRestart.findById("first")).isNull();
    }

    @Test
    void preCutoverAuthorizationCodeCannotBeRelabelledAsNew() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var delegate = new InMemoryOAuth2AuthorizationService();
        var old = authorization("pending-old-code", false);
        delegate.save(old);
        var policy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        var service = policy.protect(delegate, "openai", "jwt-v1");
        policy.afterSingletonsInstantiated();
        assertThat(service.findById(old.getId())).isNull();
        assertThatThrownBy(() -> service.save(old)).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void constructingStrictProfilesDoesNotActivateBeforeOtherStartupValidatorsPass() throws Exception {
        var db = OAuthClientSecurityTestDatabase.create();
        var policy = new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), true);
        policy.assertCompatible();
        assertThatThrownBy(() -> policy.assertActiveProfile("openai"))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        var service = policy.protect(new InMemoryOAuth2AuthorizationService(), "openai", "jwt-v1");
        assertThatThrownBy(() -> policy.assertActiveProfile("openai"))
                .isInstanceOf(AuthenticatedClientPolicy.PolicyRejectedException.class);
        assertThat(db.jdbc().queryForObject("SELECT authenticated_required FROM oauth_client_security_policy WHERE id = 1", Boolean.class)).isFalse();
        assertThatThrownBy(() -> service.save(authorization("too-early", false))).isInstanceOf(IllegalStateException.class);
        new AuthenticatedClientPolicy(db.jdbc(), db.transactions(), false).assertCompatible();
    }

    private static OAuth2Authorization authorization(String id, boolean tokens) {
        var client = RegisteredClient.withId("same-registration").clientId("client")
                .clientAuthenticationMethod(ClientAuthenticationMethod.PRIVATE_KEY_JWT)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://client.test/callback").scope("read").build();
        var builder = OAuth2Authorization.withRegisteredClient(client).id(id).principalName("synthetic-app-principal")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE);
        if (tokens) {
            var now = Instant.now();
            builder.accessToken(accessToken(id)).refreshToken(new OAuth2RefreshToken("refresh-" + id, now, now.plusSeconds(600)));
        }
        return builder.build();
    }

    private static OAuth2AccessToken accessToken(String id) {
        var now = Instant.now();
        return new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "access-" + id, now, now.plusSeconds(60), Set.of("read"));
    }
}
