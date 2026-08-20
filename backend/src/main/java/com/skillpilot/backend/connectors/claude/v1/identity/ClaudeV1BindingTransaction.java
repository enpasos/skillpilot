package com.skillpilot.backend.connectors.claude.v1.identity;

import java.time.Instant;
import java.util.Objects;

/**
 * Short-lived transaction tying one OAuth authorization request and its PKCE parameters to the
 * browser-based learner binding step.
 *
 * <p>The row never holds the permanent SkillPilot id. The binding result is the opaque connection
 * id in {@code boundConnectionId}; the learner mapping itself lives on the connection, which
 * outlives this transaction.</p>
 */
public record ClaudeV1BindingTransaction(
        String id,
        String oauthState,
        String codeChallenge,
        String codeChallengeMethod,
        String registeredClientId,
        String redirectUri,
        String scope,
        String resource,
        String boundConnectionId,
        String status,
        Instant expiresAt,
        Instant createdAt) {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_BOUND = "BOUND";
    public static final String STATUS_CONSUMED = "CONSUMED";

    public ClaudeV1BindingTransaction {
        Objects.requireNonNull(id, "id");
        Objects.requireNonNull(oauthState, "oauthState");
        Objects.requireNonNull(codeChallenge, "codeChallenge");
        Objects.requireNonNull(codeChallengeMethod, "codeChallengeMethod");
        Objects.requireNonNull(registeredClientId, "registeredClientId");
        Objects.requireNonNull(redirectUri, "redirectUri");
        Objects.requireNonNull(scope, "scope");
        Objects.requireNonNull(resource, "resource");
        Objects.requireNonNull(status, "status");
        Objects.requireNonNull(expiresAt, "expiresAt");
        Objects.requireNonNull(createdAt, "createdAt");
    }

    public boolean isPending() {
        return STATUS_PENDING.equals(status) && isUnexpired();
    }

    public boolean isBound() {
        return STATUS_BOUND.equals(status) && isUnexpired();
    }

    public boolean isUnexpired() {
        return Instant.now().isBefore(expiresAt);
    }

    /**
     * Confirms that a returning authorization request is the same one that opened this transaction.
     * All four values are compared because {@code state} alone is a value the caller supplies.
     */
    public boolean matchesAuthorizationRequest(
            String clientId,
            String requestRedirectUri,
            String requestCodeChallenge,
            String requestCodeChallengeMethod,
            String requestScope,
            String requestResource) {
        return registeredClientId.equals(clientId)
                && redirectUri.equals(requestRedirectUri)
                && codeChallenge.equals(requestCodeChallenge)
                && codeChallengeMethod.equals(requestCodeChallengeMethod)
                && scope.equals(requestScope)
                && resource.equals(requestResource);
    }

    public ClaudeV1BindingTransaction withBoundConnection(String connectionId) {
        return new ClaudeV1BindingTransaction(
                id, oauthState, codeChallenge, codeChallengeMethod, registeredClientId, redirectUri,
                scope, resource, connectionId, STATUS_BOUND, expiresAt, createdAt);
    }

    public ClaudeV1BindingTransaction consumed() {
        return new ClaudeV1BindingTransaction(
                id, oauthState, codeChallenge, codeChallengeMethod, registeredClientId, redirectUri,
                scope, resource, boundConnectionId, STATUS_CONSUMED, expiresAt, createdAt);
    }
}
