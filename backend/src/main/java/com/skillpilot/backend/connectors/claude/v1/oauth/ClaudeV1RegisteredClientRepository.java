package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/**
 * Restricts the shared Spring Authorization Server client table to the two Claude v1 identities.
 *
 * <p>The OAuth tables are shared across provider lanes. Without this boundary the Claude v1
 * authorization server would resolve OpenAI and Claude-beta clients as its own. Foreign rows are
 * reported as absent rather than as an error, so a lookup for another lane's client behaves exactly
 * like a lookup for a client that was never registered.</p>
 */
public final class ClaudeV1RegisteredClientRepository implements RegisteredClientRepository {

    private final RegisteredClientRepository delegate;

    public ClaudeV1RegisteredClientRepository(RegisteredClientRepository delegate) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        Objects.requireNonNull(registeredClient, "registeredClient");
        if (!belongsToClaudeV1(registeredClient.getClientId())) {
            throw new IllegalArgumentException("OAuth client does not belong to the Claude v1 boundary.");
        }
        delegate.save(registeredClient);
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
        return candidate != null && belongsToClaudeV1(candidate.getClientId()) ? candidate : null;
    }

    private static boolean belongsToClaudeV1(String clientId) {
        return clientId != null && ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS.contains(clientId);
    }
}
