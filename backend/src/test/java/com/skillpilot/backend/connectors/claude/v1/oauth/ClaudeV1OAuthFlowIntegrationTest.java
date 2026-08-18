package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    @Autowired
    @Qualifier("claudeV1AuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    @Qualifier("claudeV1RegisteredClientRepository")
    private RegisteredClientRepository registeredClientRepository;

    @Autowired
    @Qualifier("claudeV1OpaqueTokenIntrospector")
    private OpaqueTokenIntrospector introspector;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1TokenLifecycleService tokenLifecycleService;

    @Autowired
    private ClaudeV1Properties properties;

    @Autowired
    private JdbcOperations jdbcOperations;

    private String connectionId;
    private String accessTokenValue;

    @BeforeEach
    void setUp() {
        connectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 1L).connectionId();
        accessTokenValue = issueToken(
                connectionId,
                Set.of(ClaudeV1Contract.SCOPE_READ, ClaudeV1Contract.SCOPE_WRITE),
                properties.getPublicMcpUrl());
    }

    private String issueToken(String principal, Set<String> scopes, String audience) {
        RegisteredClient client =
                registeredClientRepository.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        assertNotNull(client, "The hosted Claude client must be registered at startup");

        String token = "claude-v1-token-" + UUID.randomUUID();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                token,
                Instant.now(),
                Instant.now().plusSeconds(3600),
                scopes);

        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
                .id(UUID.randomUUID().toString())
                .principalName(principal)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .token(accessToken, metadata -> {
                    // Mutable collections: the JDBC authorization store serializes this metadata
                    // through a restricted polymorphic type validator.
                    Map<String, Object> claims = new java.util.LinkedHashMap<>();
                    claims.put("aud", audience == null
                            ? new java.util.ArrayList<String>()
                            : new java.util.ArrayList<>(List.of(audience)));
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, claims);
                })
                .build();
        authorizationService.save(authorization);
        return token;
    }

    @Test
    void bothOfficialClientTypesAreRegisteredAsPublicPkceClients() {
        for (String clientId : ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS) {
            RegisteredClient client = registeredClientRepository.findByClientId(clientId);
            assertNotNull(client, () -> "Missing registration for " + clientId);

            assertEquals(
                    Set.of(ClientAuthenticationMethod.NONE),
                    client.getClientAuthenticationMethods(),
                    "Claude clients are public: no client secret may be accepted");
            assertTrue(client.getClientSettings().isRequireProofKey(), "PKCE must be mandatory");
            assertTrue(client.getAuthorizationGrantTypes().contains(AuthorizationGrantType.AUTHORIZATION_CODE));
            assertTrue(client.getAuthorizationGrantTypes().contains(AuthorizationGrantType.REFRESH_TOKEN));
            assertFalse(
                    client.getAuthorizationGrantTypes().contains(AuthorizationGrantType.CLIENT_CREDENTIALS),
                    "The client-credentials grant must not be available");
        }
    }

    @Test
    void hostedClaudeIsPinnedToTheSingleOfficialCallback() {
        RegisteredClient hosted =
                registeredClientRepository.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        assertEquals(Set.of(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK), hosted.getRedirectUris());
    }

    @Test
    void anotherLanesClientIsNotVisibleInsideTheClaudeBoundary() {
        assertNull(registeredClientRepository.findByClientId("skillpilot-coach-v1"));
        assertNull(registeredClientRepository.findByClientId("https://chat.openai.com/aip/plugin"));
        assertNull(registeredClientRepository.findByClientId("unknown-client"));
    }

    @Test
    void aValidTokenIntrospectsToTheOpaqueConnectionSubject() {
        OAuth2AuthenticatedPrincipal principal = introspector.introspect(accessTokenValue);

        assertEquals(connectionId, principal.getName());
        assertEquals(connectionId, principal.getAttribute("connection_id"));
        assertTrue(principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("SCOPE_" + ClaudeV1Contract.SCOPE_READ)));
    }

    @Test
    void theIntrospectedPrincipalNeverCarriesThePermanentLearnerId() {
        String learnerId = connectionRepository.findConnectionById(connectionId).orElseThrow().skillpilotId();
        OAuth2AuthenticatedPrincipal principal = introspector.introspect(accessTokenValue);

        assertFalse(principal.getAttributes().toString().contains(learnerId));
        assertFalse(principal.getName().contains(learnerId));
    }

    @Test
    void aTokenIssuedForAnotherAudienceIsRejected() {
        String foreignAudienceToken = issueToken(
                connectionId,
                Set.of(ClaudeV1Contract.SCOPE_READ),
                "https://mcp-coach-v1.skillpilot.com/mcp");

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(foreignAudienceToken));
    }

    @Test
    void aTokenWithoutAnAudienceIsRejected() {
        String noAudienceToken = issueToken(connectionId, Set.of(ClaudeV1Contract.SCOPE_READ), null);

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(noAudienceToken));
    }

    @Test
    void aTokenWithClaudeAudiencePlusAnotherAudienceIsRejected() {
        RegisteredClient client =
                registeredClientRepository.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        String token = "claude-v1-multi-aud-" + UUID.randomUUID();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                token,
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Set.of(ClaudeV1Contract.SCOPE_READ));
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
                .id(UUID.randomUUID().toString())
                .principalName(connectionId)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .token(accessToken, metadata -> {
                    Map<String, Object> claims = new java.util.LinkedHashMap<>();
                    claims.put("aud", new java.util.ArrayList<>(List.of(
                            properties.getPublicMcpUrl(), "https://attacker.example/mcp")));
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, claims);
                })
                .build();
        authorizationService.save(authorization);

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(token));
    }

    @Test
    void anUnmarkedAuthorizationFromTheSharedTableIsInvisibleToV1() {
        RegisteredClient client =
                registeredClientRepository.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        String token = "legacy-unmarked-" + UUID.randomUUID();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                token,
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Set.of(ClaudeV1Contract.SCOPE_READ));
        OAuth2Authorization unmarked = OAuth2Authorization.withRegisteredClient(client)
                .id(UUID.randomUUID().toString())
                .principalName(connectionId)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .token(accessToken, metadata -> {
                    Map<String, Object> claims = new java.util.LinkedHashMap<>();
                    claims.put("aud", new java.util.ArrayList<>(List.of(properties.getPublicMcpUrl())));
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, claims);
                })
                .build();
        OAuth2AuthorizationService rawSharedService = new JdbcOAuth2AuthorizationService(
                jdbcOperations,
                new JdbcRegisteredClientRepository(jdbcOperations));
        rawSharedService.save(unmarked);

        assertNull(authorizationService.findByToken(token, OAuth2TokenType.ACCESS_TOKEN));
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(token));
    }

    @Test
    void aReadOnlyTokenCarriesNoWriteAuthority() {
        String readOnlyToken =
                issueToken(connectionId, Set.of(ClaudeV1Contract.SCOPE_READ), properties.getPublicMcpUrl());

        OAuth2AuthenticatedPrincipal principal = introspector.introspect(readOnlyToken);
        assertTrue(principal.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE)));
    }

    @Test
    void unknownAndEmptyTokensAreRejected() {
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect("unknown-token"));
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(""));
        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(null));
    }

    @Test
    void revokingATokenEndsAccessAndTheConnection() {
        assertNotNull(introspector.introspect(accessTokenValue));

        tokenLifecycleService.revokeToken(accessTokenValue, "access_token");

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(accessTokenValue));
        assertTrue(connectionRepository.findActiveConnectionById(connectionId).isEmpty());
        var revoked = connectionRepository.findConnectionById(connectionId).orElseThrow();
        assertTrue(revoked.skillpilotId().isBlank());
        assertTrue(revoked.learnerIdHash().isBlank());
    }

    @Test
    void revokingOneConnectionLeavesOtherConnectionsUntouched() {
        String secondConnectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 1L).connectionId();
        String secondToken = issueToken(
                secondConnectionId, Set.of(ClaudeV1Contract.SCOPE_READ), properties.getPublicMcpUrl());

        tokenLifecycleService.revokeToken(accessTokenValue, "access_token");

        assertNotNull(introspector.introspect(secondToken));
        assertTrue(connectionRepository.findActiveConnectionById(secondConnectionId).isPresent());
    }

    @Test
    void revokingAnUnknownTokenIsNotAnError() {
        tokenLifecycleService.revokeToken("never-issued", "access_token");
        tokenLifecycleService.revokeToken(null, null);
        assertNotNull(introspector.introspect(accessTokenValue));
    }

    @Test
    void aTokenForARevokedConnectionStopsWorkingImmediately() {
        connectionRepository.revokeConnection(connectionId);

        assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect(accessTokenValue));
    }
}
