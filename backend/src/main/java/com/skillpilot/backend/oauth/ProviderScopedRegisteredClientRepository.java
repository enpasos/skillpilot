package com.skillpilot.backend.oauth;

import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/**
 * Restricts an OAuth authorization-server instance to exactly one provider client.
 *
 * <p>SkillPilot intentionally keeps the standard Spring Authorization Server tables shared while
 * exposing provider-specific issuers and endpoints. A plain JDBC repository would let either
 * issuer resolve every client stored in that table. This wrapper makes the client boundary
 * explicit for registration, authorization-code, refresh, consent, and token lookups.</p>
 */
public final class ProviderScopedRegisteredClientRepository implements RegisteredClientRepository {

    private final RegisteredClientRepository delegate;
    private final String expectedClientId;

    public ProviderScopedRegisteredClientRepository(
            RegisteredClientRepository delegate,
            String expectedClientId) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.expectedClientId = normalize(expectedClientId);
    }

    @Override
    public void save(RegisteredClient registeredClient) {
        Objects.requireNonNull(registeredClient, "registeredClient");
        if (!expectedClientId.equals(normalize(registeredClient.getClientId()))) {
            throw new IllegalArgumentException("OAuth client does not belong to this provider boundary.");
        }
        delegate.save(registeredClient);
    }

    @Override
    public RegisteredClient findById(String id) {
        return keepExpected(delegate.findById(id));
    }

    @Override
    public RegisteredClient findByClientId(String clientId) {
        if (!expectedClientId.equals(normalize(clientId))) {
            return null;
        }
        return keepExpected(delegate.findByClientId(clientId));
    }

    private RegisteredClient keepExpected(RegisteredClient candidate) {
        return candidate != null && expectedClientId.equals(normalize(candidate.getClientId()))
                ? candidate
                : null;
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
