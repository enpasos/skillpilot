package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Objects;
import java.util.Set;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

/** Local policy, independent of client-supplied discovery metadata. Contains no signing keys. */
final class ClaudeV1ClientPolicy {
    static final String CLIENT_PROFILE_SETTING = "skillpilot.claude.v1.client-profile";
    static final String CLIENT_POLICY_SETTING = "skillpilot.claude.v1.client-policy";
    static final String CONFIDENTIAL_PROFILE = "anthropic-directory-v1";

    static boolean isConfidentialClient(ClaudeV1Properties properties, RegisteredClient client) {
        return client != null && properties.getOauth().isConfidential()
                && Objects.equals(properties.getOauth().getClientId(), client.getClientId());
    }

    static String profileId(ClaudeV1Properties properties, RegisteredClient client) {
        return isConfidentialClient(properties, client) ? properties.getOauth().getProfileId()
                : ClaudeV1Properties.OAuth.PUBLIC_PROFILE;
    }

    static ClientAuthenticationMethod authenticationMethod(ClaudeV1Properties properties) {
        String method = properties.getOauth().getClientAuthenticationMethod();
        if (!Set.of("client_secret_basic", "client_secret_post").contains(Objects.toString(method, ""))) {
            throw new IllegalStateException("Claude oauth.client-authentication-method must be explicitly configured.");
        }
        return new ClientAuthenticationMethod(method);
    }

    static boolean permitsClient(ClaudeV1Properties properties, RegisteredClient client) {
        if (client == null) {
            return false;
        }
        if (!isConfidentialClient(properties, client)) {
            return properties.getOauth().isPublicCimdEnabled()
                    && ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS.contains(client.getClientId())
                    && client.getClientAuthenticationMethods().equals(Set.of(ClientAuthenticationMethod.NONE))
                    && client.getClientSecret() == null && client.getClientSettings().isRequireProofKey()
                    && client.getScopes().equals(ClaudeV1Contract.SUPPORTED_SCOPES)
                    && client.getRedirectUris().equals(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID.equals(client.getClientId())
                            ? Set.of(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                            : Set.of("http://127.0.0.1/callback", "http://localhost/callback"));
        }
        return Objects.equals(properties.getOauth().getClientId(), client.getClientId())
                && client.getClientAuthenticationMethods().equals(Set.of(authenticationMethod(properties)))
                && properties.getOauth().getProfileId().equals(client.getClientSettings().getSetting(CLIENT_PROFILE_SETTING))
                && fingerprint(properties).equals(client.getClientSettings().getSetting(CLIENT_POLICY_SETTING))
                && client.getClientSettings().isRequireProofKey()
                && client.getRedirectUris().equals(Set.of(properties.getOauth().getRedirectUri()))
                && client.getScopes().equals(Set.copyOf(properties.getOauth().getScopes()))
                && client.getClientSecret() != null && !client.getClientSecret().isBlank();
    }

    static String fingerprint(ClaudeV1Properties properties) {
        ClaudeV1Properties.OAuth oauth = properties.getOauth();
        // No raw secret, secret hash, or mutable bcrypt salt enters the policy fingerprint.
        // Credential compromise is cut over by changing authorization-policy-version; routine
        // credential rotation need not invalidate already issued, strongly authenticated grants.
        String policy = oauth.isConfidential()
                ? String.join("\n", oauth.getProfileId(), oauth.getClientId(), oauth.getClientAuthenticationMethod(),
                        oauth.getRedirectUri(), properties.getPublicMcpUrl(), "S256",
                        String.join(" ", oauth.getScopes().stream().sorted().toList()), oauth.getAuthorizationPolicyVersion())
                : publicFingerprint(properties);
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(policy.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    static String publicFingerprint(ClaudeV1Properties properties) {
        // Public and confidential authorization epochs are separate even when they coexist.
        return String.join("\n", ClaudeV1Properties.OAuth.PUBLIC_PROFILE, properties.getPublicMcpUrl(),
                ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID, ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK,
                ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID, "http://127.0.0.1/callback http://localhost/callback",
                "none", "S256", "refresh-family-v1", "skillpilot.read skillpilot.write offline_access",
                properties.getOauth().getPublicAuthorizationPolicyVersion());
    }

    private ClaudeV1ClientPolicy() {}
}
