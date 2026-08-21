package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller serving the OAuth 2.1 discovery documents for Claude v1:
 * 1. Protected Resource Metadata (RFC 9728) at /.well-known/oauth-protected-resource/mcp
 * 2. Authorization Server Metadata (RFC 8414) at /.well-known/oauth-authorization-server
 */
@RestController
@ConditionalOnClaudeV1Enabled
public class ClaudeV1OAuthMetadataController {

    private final ClaudeV1Properties properties;

    public ClaudeV1OAuthMetadataController(ClaudeV1Properties properties) {
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @GetMapping(
            value = ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getProtectedResourceMetadata() {
        Map<String, Object> metadata = Map.of(
                "resource", properties.getPublicMcpUrl(),
                "authorization_servers", List.of(properties.getPublicOrigin()),
                "scopes_supported", List.of(ClaudeV1Contract.SCOPE_READ, ClaudeV1Contract.SCOPE_WRITE),
                "bearer_methods_supported", List.of("header"),
                "resource_documentation", properties.getPublicDocumentationUrl());
        return ResponseEntity.ok(metadata);
    }

    @GetMapping(
            value = ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAuthorizationServerMetadata() {
        String publicOrigin = properties.getPublicOrigin();
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("issuer", publicOrigin);
        metadata.put("authorization_endpoint", publicOrigin + "/oauth2/authorize");
        metadata.put("token_endpoint", publicOrigin + "/oauth2/token");
        metadata.put("revocation_endpoint", publicOrigin + "/oauth2/revoke");
        metadata.put("scopes_supported", List.of(ClaudeV1Contract.SCOPE_READ, ClaudeV1Contract.SCOPE_WRITE, ClaudeV1Contract.SCOPE_OFFLINE_ACCESS));
        metadata.put("response_types_supported", List.of("code"));
        metadata.put("grant_types_supported", List.of("authorization_code", "refresh_token"));
        metadata.put("token_endpoint_auth_methods_supported", List.of("none"));
        metadata.put("revocation_endpoint_auth_methods_supported", List.of("none"));
        metadata.put("code_challenge_methods_supported", List.of("S256"));
        metadata.put("client_id_metadata_document_supported", true);
        return ResponseEntity.ok(metadata);
    }
}
