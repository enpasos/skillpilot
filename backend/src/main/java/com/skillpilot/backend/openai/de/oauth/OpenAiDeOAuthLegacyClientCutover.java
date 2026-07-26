package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.transaction.support.TransactionOperations;

/**
 * One-way, allowlist-scoped migration from former public OpenAI-DE OAuth
 * clients to the CIMD/private_key_jwt client.
 *
 * <p>The migration deliberately does not discover candidates by provider
 * naming conventions or authentication method. It touches only exact client
 * IDs configured in {@code legacy-client-ids}, and only after proving that the
 * persisted client still uses the single legacy authentication method
 * {@code none}.</p>
 */
final class OpenAiDeOAuthLegacyClientCutover {

    private static final String LEGACY_AUTHENTICATION_METHOD = "none";

    private final JdbcOperations jdbcOperations;
    private final TransactionOperations transactionOperations;

    OpenAiDeOAuthLegacyClientCutover(
            JdbcOperations jdbcOperations,
            TransactionOperations transactionOperations) {
        this.jdbcOperations = jdbcOperations;
        this.transactionOperations = transactionOperations;
    }

    void execute(OpenAiDeProperties properties) {
        if (!OpenAiDeOAuthConfiguration.isPrivateKeyJwt(properties)) {
            return;
        }
        List<String> legacyClientIds = OpenAiDeOAuthConfiguration.normalizedLegacyClientIds(properties);
        transactionOperations.executeWithoutResult(status -> {
            Instant revokedAt = Instant.now();
            for (String legacyClientId : legacyClientIds) {
                cutOverClient(legacyClientId, revokedAt);
            }
            assertNoConfiguredLegacyClientsRemain(legacyClientIds);
        });
    }

    private void cutOverClient(String legacyClientId, Instant revokedAt) {
        List<PersistedClient> clients = jdbcOperations.query(
                """
                SELECT id, client_authentication_methods
                  FROM oauth2_registered_client
                 WHERE client_id = ?
                """,
                (resultSet, rowNumber) -> persistedClient(resultSet),
                legacyClientId);
        if (clients.isEmpty()) {
            return;
        }
        if (clients.size() != 1) {
            throw new IllegalStateException(
                    "OpenAI-DE legacy client ID must identify exactly one registered client: "
                            + legacyClientId);
        }
        PersistedClient client = clients.getFirst();
        if (!Set.of(LEGACY_AUTHENTICATION_METHOD).equals(client.authenticationMethods())) {
            throw new IllegalStateException(
                    "Refusing to remove allowlisted OpenAI-DE legacy client because it does not use only "
                            + "client authentication method none: "
                            + legacyClientId);
        }

        Set<String> principalNames = new LinkedHashSet<>(jdbcOperations.queryForList(
                "SELECT DISTINCT principal_name FROM oauth2_authorization WHERE registered_client_id = ?",
                String.class,
                client.registeredClientId()));
        principalNames.addAll(jdbcOperations.queryForList(
                "SELECT DISTINCT principal_name FROM oauth2_authorization_consent WHERE registered_client_id = ?",
                String.class,
                client.registeredClientId()));

        for (String principalName : principalNames) {
            jdbcOperations.update(
                    """
                    UPDATE openai_de_connection
                       SET revoked_at = ?, oauth_expires_at = ?
                     WHERE subject = ?
                    """,
                    revokedAt,
                    revokedAt,
                    principalName);
            jdbcOperations.update(
                    "DELETE FROM openai_de_pending_launch WHERE connection_subject = ?",
                    principalName);
            jdbcOperations.update(
                    "DELETE FROM openai_de_learning_session WHERE connection_subject = ?",
                    principalName);
        }

        jdbcOperations.update(
                "DELETE FROM oauth2_authorization_consent WHERE registered_client_id = ?",
                client.registeredClientId());
        jdbcOperations.update(
                "DELETE FROM oauth2_authorization WHERE registered_client_id = ?",
                client.registeredClientId());
        jdbcOperations.update(
                "DELETE FROM oauth2_registered_client WHERE id = ? AND client_id = ?",
                client.registeredClientId(),
                legacyClientId);
    }

    private void assertNoConfiguredLegacyClientsRemain(List<String> legacyClientIds) {
        for (String legacyClientId : legacyClientIds) {
            Integer remaining = jdbcOperations.queryForObject(
                    "SELECT COUNT(*) FROM oauth2_registered_client WHERE client_id = ?",
                    Integer.class,
                    legacyClientId);
            if (remaining == null || remaining != 0) {
                throw new IllegalStateException(
                        "OpenAI-DE secure startup refused because an allowlisted legacy client remains: "
                                + legacyClientId);
            }
        }
    }

    private static PersistedClient persistedClient(ResultSet resultSet) throws SQLException {
        return new PersistedClient(
                resultSet.getString("id"),
                parseAuthenticationMethods(resultSet.getString("client_authentication_methods")));
    }

    private static Set<String> parseAuthenticationMethods(String serializedMethods) {
        Set<String> methods = new LinkedHashSet<>();
        if (serializedMethods == null) {
            return methods;
        }
        for (String method : serializedMethods.split(",")) {
            if (!method.isBlank()) {
                methods.add(method.trim().toLowerCase(Locale.ROOT));
            }
        }
        return Set.copyOf(methods);
    }

    private record PersistedClient(
            String registeredClientId,
            Set<String> authenticationMethods) {}
}
