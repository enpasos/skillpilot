package com.skillpilot.backend.connectors.claude.v1.oauth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1OAuthFlowIntegrationTest {

    @Autowired @Qualifier("claudeV1AuthorizationService")
    private OAuth2AuthorizationService authorizationService;
    @Autowired @Qualifier("claudeV1RegisteredClientRepository")
    private RegisteredClientRepository registeredClients;
    @Autowired @Qualifier("claudeV1OpaqueTokenIntrospector")
    private OpaqueTokenIntrospector introspector;
    @Autowired private ClaudeV1TokenLifecycleService tokenLifecycleService;
    @Autowired private ClaudeV1Properties properties;
    @Autowired private ClaudeV1LearningSessionRepository sessions;
    @Autowired private ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired private LearnerRepository learners;

    private String appSubject;
    private String accessToken;

    @BeforeEach
    void setUp() {
        appSubject = ClaudeV1AppAuthenticationFilter.APP_SUBJECT_PREFIX + UUID.randomUUID();
        accessToken = issueToken(appSubject, Set.of(
                ClaudeV1Contract.SCOPE_READ,
                ClaudeV1Contract.SCOPE_WRITE), properties.getPublicMcpUrl());
    }

    @Test
    void bothOfficialClientTypesAreLearnerFreePublicPkceClients() {
        for (String clientId : ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS) {
            RegisteredClient client = registeredClients.findByClientId(clientId);
            assertNotNull(client);
            assertEquals(Set.of(ClientAuthenticationMethod.NONE), client.getClientAuthenticationMethods());
            assertTrue(client.getClientSettings().isRequireProofKey());
            assertTrue(client.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN));
            assertTrue(client.getScopes().contains(ClaudeV1Contract.SCOPE_OFFLINE_ACCESS));
        }
    }

    @Test
    void validTokenIntrospectsToTechnicalAppPrincipalWithoutLearnerBinding() {
        OAuth2AuthenticatedPrincipal principal = introspector.introspect(accessToken);
        assertEquals(appSubject, principal.getName());
        assertEquals(appSubject, principal.getAttribute("sub"));
        assertNull(principal.getAttribute("connection_id"));
        assertFalse(principal.getAttributes().containsKey("skillpilotId"));
    }

    @Test
    void authorizationServiceRejectsAnyLearnerOrLegacyConnectionPrincipal() {
        assertThrows(IllegalArgumentException.class, () -> issueToken(
                UUID.randomUUID().toString(),
                Set.of(ClaudeV1Contract.SCOPE_READ),
                properties.getPublicMcpUrl()));
        assertThrows(IllegalArgumentException.class, () -> issueToken(
                "conn_claude_v1_legacy",
                Set.of(ClaudeV1Contract.SCOPE_READ),
                properties.getPublicMcpUrl()));
    }

    @Test
    void foreignAudienceAndUnknownTokensAreRejected() {
        String foreign = issueToken(
                appSubject,
                Set.of(ClaudeV1Contract.SCOPE_READ),
                "https://attacker.example/mcp");
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(foreign));
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect("unknown"));
    }

    @Test
    void revokingAppTokenNeverRevokesOrExtendsLearningSession() {
        ClaudeV1TestFixtures.BoundLearner learner =
                ClaudeV1TestFixtures.createBoundLearner(learners, sessions, 3L);
        String sessionHash = sessionTokens.hash(learner.connectionId());
        Instant expiryBefore = sessions.findByTokenHash(sessionHash).orElseThrow().expiresAt();

        tokenLifecycleService.revokeToken(accessToken, "access_token");

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(accessToken));
        assertEquals(expiryBefore, sessions.findByTokenHash(sessionHash).orElseThrow().expiresAt());
    }

    @Test
    void anotherProvidersClientIsInvisibleInsideClaudeRepository() {
        assertNull(registeredClients.findByClientId("skillpilot-coach-v1"));
    }

    private String issueToken(String principal, Set<String> scopes, String audience) {
        RegisteredClient client = registeredClients.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        String tokenValue = "claude-v1-token-" + UUID.randomUUID();
        OAuth2AccessToken token = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                tokenValue,
                Instant.now(),
                Instant.now().plusSeconds(3600),
                scopes);
        Map<String, Object> claims = new LinkedHashMap<>();
        claims.put("aud", new java.util.ArrayList<>(List.of(audience)));
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
                .id(UUID.randomUUID().toString())
                .principalName(principal)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .token(token, metadata -> metadata.put(
                        OAuth2Authorization.Token.CLAIMS_METADATA_NAME,
                        claims))
                .build();
        authorizationService.save(authorization);
        return tokenValue;
    }
}
