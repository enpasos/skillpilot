package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClaudeV1CimdMetadataValidatorTest {

    private ClaudeV1CimdMetadataValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ClaudeV1CimdMetadataValidator(new ClaudeV1Properties(), new ObjectMapper());
    }

    @Test
    void onlyTheTwoOfficialClientIdentitiesAreAccepted() {
        assertTrue(validator.isAllowedClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID));
        assertTrue(validator.isAllowedClientId(ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID));

        assertFalse(validator.isAllowedClientId("https://evil.example/client-metadata"));
        assertFalse(validator.isAllowedClientId("https://claude.ai/oauth/mcp-oauth-client-metadata/../x"));
        assertFalse(validator.isAllowedClientId(null));
        assertFalse(validator.isAllowedClientId(""));
    }

    @Test
    void hostedClaudeAcceptsExactlyOneCallback() {
        String clientId = ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID;
        assertTrue(validator.isValidRedirectUri(clientId, ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK));

        // The plan pins the hosted callback to claude.ai; no other host or path is permitted.
        assertFalse(validator.isValidRedirectUri(clientId, "https://claude.com/api/mcp/auth_callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "https://claude.ai/evil/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://claude.ai/api/mcp/auth_callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "https://claude.ai/api/mcp/auth_callback?x=1"));
        assertFalse(validator.isValidRedirectUri(clientId, "https://claude.ai/api/mcp/auth_callback#f"));
        assertFalse(validator.isValidRedirectUri(clientId, "https://claude.ai.evil.example/api/mcp/auth_callback"));
    }

    @Test
    void claudeCodeAcceptsLoopbackWithAnyEphemeralPort() {
        String clientId = ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID;
        assertTrue(validator.isValidRedirectUri(clientId, "http://127.0.0.1:49215/callback"));
        assertTrue(validator.isValidRedirectUri(clientId, "http://localhost:8080/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://[::1]:51000/callback"));
    }

    @Test
    void claudeCodeVariesOnlyByPort() {
        String clientId = ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID;
        assertFalse(validator.isValidRedirectUri(clientId, "https://127.0.0.1:49215/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://192.168.1.1:8080/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://example.com:8080/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://127.0.0.1:49215/other"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://127.0.0.1:49215/callback/sub"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://127.0.0.1:49215"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://user@127.0.0.1:49215/callback"));
        // A privileged port is not something an ephemeral client binding would obtain.
        assertFalse(validator.isValidRedirectUri(clientId, "http://127.0.0.1:80/callback"));
        assertFalse(validator.isValidRedirectUri(clientId, "http://127.0.0.1/callback"));
    }

    @Test
    void redirectUrisAreNeverSharedBetweenTheTwoClientTypes() {
        assertFalse(validator.isValidRedirectUri(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, "http://127.0.0.1:49215/callback"));
        assertFalse(validator.isValidRedirectUri(
                ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK));
    }

    @Test
    void unknownClientIdsCanNeverSupplyAValidRedirect() {
        assertFalse(validator.isValidRedirectUri("https://evil.example/metadata", "http://127.0.0.1:1/callback"));
        assertFalse(validator.isValidRedirectUri(null, ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK));
        assertFalse(validator.isValidRedirectUri(ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, null));
    }

    @Test
    void validateRedirectUriThrowsWithoutEchoingTheInput() {
        assertDoesNotThrow(() -> validator.validateRedirectUri(
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK));

        IllegalArgumentException error = assertThrows(IllegalArgumentException.class, () ->
                validator.validateRedirectUri(
                        ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                        "https://attacker.example/callback"));
        assertFalse(error.getMessage().contains("attacker.example"));
    }

    @Test
    void documentVerificationFailsClosedForUnreachableMetadata() {
        // No network is available in this context; an unverifiable document must deny, not allow.
        assertFalse(validator.isVerifiedClientId("https://evil.example/client-metadata"));
        assertFalse(validator.isVerifiedClientId(null));
    }

    @Test
    void officialHostedMetadataShapeIsAcceptedWithoutEnablingItsExtraGrant() throws Exception {
        var document = new ObjectMapper().readTree("""
                {
                  "client_id": "https://claude.ai/oauth/mcp-oauth-client-metadata",
                  "client_name": "Claude",
                  "client_uri": "https://claude.ai",
                  "redirect_uris": ["https://claude.ai/api/mcp/auth_callback"],
                  "grant_types": ["authorization_code", "refresh_token", "urn:ietf:params:oauth:grant-type:jwt-bearer"],
                  "response_types": ["code"],
                  "token_endpoint_auth_method": "none"
                }
                """);

        assertTrue(validator.isWellFormedDocument(
                document, ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID));
    }

    @Test
    void claudeCodeMetadataDeclaresPortlessCallbacksButRuntimeCallbacksRequireAPort() throws Exception {
        var document = new ObjectMapper().readTree("""
                {
                  "client_id": "https://claude.ai/oauth/claude-code-client-metadata",
                  "client_name": "Claude Code",
                  "client_uri": "https://claude.ai",
                  "redirect_uris": ["http://localhost/callback", "http://127.0.0.1/callback"],
                  "grant_types": ["authorization_code", "refresh_token"],
                  "response_types": ["code"],
                  "token_endpoint_auth_method": "none"
                }
                """);

        assertTrue(validator.isWellFormedDocument(
                document, ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID));
        assertFalse(validator.isValidRedirectUri(
                ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, "http://localhost/callback"));
        assertTrue(validator.isValidRedirectUri(
                ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, "http://localhost:49152/callback"));
    }
}
