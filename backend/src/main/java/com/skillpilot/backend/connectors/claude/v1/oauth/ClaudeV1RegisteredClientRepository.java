package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/**
 * Restricts the shared client table to the selected Claude v1 authentication profile.
 *
 * <p>The OAuth tables are shared across provider lanes. Without this boundary the Claude v1
 * authorization server would resolve OpenAI and Claude-beta clients as its own. Foreign rows are
 * reported as absent rather than as an error, so a lookup for another lane's client behaves exactly
 * like a lookup for a client that was never registered. Each client retains its exact method: public
 * CIMD may coexist with one dedicated Custom Connector or Anthropic-held credential registration,
 * but a failed confidential lookup never falls back to either public identity.</p>
 */
public final class ClaudeV1RegisteredClientRepository implements RegisteredClientRepository {

    private final RegisteredClientRepository delegate;
    private final ClaudeV1Properties properties;
    private volatile String activeEncodedSecret;

    public ClaudeV1RegisteredClientRepository(RegisteredClientRepository delegate) {
        this(delegate, new ClaudeV1Properties());
    }

    public ClaudeV1RegisteredClientRepository(RegisteredClientRepository delegate, ClaudeV1Properties properties) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        Objects.requireNonNull(registeredClient, "registeredClient");
        if (!ClaudeV1ClientPolicy.permitsClient(properties, registeredClient)) {
            throw new IllegalArgumentException("OAuth client does not belong to the Claude v1 boundary.");
        }
        delegate.save(registeredClient);
        if (ClaudeV1ClientPolicy.isConfidentialClient(properties, registeredClient)) {
            // Pin what this instance actually registered. A stale instance must not silently
            // replace the credential accepted by a running instance, even at the same revision.
            activeEncodedSecret = registeredClient.getClientSecret();
        }
    }

    @Override
    public RegisteredClient findById(String id) {
        return keepClaudeV1(delegate.findById(id));
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        if (!belongsToClaudeV1(clientId)) {
            return null;
        }
        return keepClaudeV1(delegate.findByClientId(clientId));
    }

    private RegisteredClient keepClaudeV1(RegisteredClient candidate) {
        if (!ClaudeV1ClientPolicy.permitsClient(properties, candidate)) {
            return null;
        }
        return !ClaudeV1ClientPolicy.isConfidentialClient(properties, candidate)
                || (activeEncodedSecret != null && activeEncodedSecret.equals(candidate.getClientSecret()))
                ? candidate : null;
    }

    private boolean belongsToClaudeV1(String clientId) {
        return clientId != null && ((properties.getOauth().isConfidential()
                && clientId.equals(properties.getOauth().getClientId()))
                || (properties.getOauth().isPublicCimdEnabled() && ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS.contains(clientId)));
    }

    /** Registrar-only lookup permits rotation, but never takes over another provider's row. */
    RegisteredClient findForRegistration(String clientId) {
        if (!belongsToClaudeV1(clientId)) {
            throw new IllegalArgumentException("OAuth client does not belong to the Claude v1 boundary.");
        }
        RegisteredClient existing = delegate.findByClientId(clientId);
        if (existing != null && ClaudeV1ClientPolicy.isConfidentialClient(properties, existing)
                && !java.util.Set.of(ClaudeV1ClientPolicy.CONFIDENTIAL_PROFILE, properties.getOauth().getProfileId())
                        .contains(Objects.toString(existing.getClientSettings().getSetting(ClaudeV1ClientPolicy.CLIENT_PROFILE_SETTING), ""))) {
            throw new IllegalStateException("Claude oauth.client-id is already registered outside the confidential profile.");
        }
        return existing;
    }
}
