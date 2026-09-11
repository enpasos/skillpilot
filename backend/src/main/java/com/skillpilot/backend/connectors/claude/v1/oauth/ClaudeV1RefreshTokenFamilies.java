package com.skillpilot.backend.connectors.claude.v1.oauth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.function.Supplier;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Durable public-client rotation. Locks cover the complete exchange, not just token lookup. */
public final class ClaudeV1RefreshTokenFamilies {
    private final JdbcOperations jdbc;
    private final TransactionTemplate transaction;
    private final TransactionTemplate refreshTransaction;

    public ClaudeV1RefreshTokenFamilies(JdbcOperations jdbc, PlatformTransactionManager manager) {
        this.jdbc = Objects.requireNonNull(jdbc);
        this.transaction = new TransactionTemplate(manager);
        this.refreshTransaction = new TransactionTemplate(manager);
        this.refreshTransaction.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    <T> T transaction(Supplier<T> action) { return transaction.execute(status -> action.get()); }

    void record(OAuth2Authorization authorization) {
        var refresh = authorization.getRefreshToken();
        if (refresh == null) return;
        java.time.Instant retainedUntil = refresh.getToken().getExpiresAt();
        if (authorization.getAccessToken() != null && authorization.getAccessToken().getToken().getExpiresAt().isAfter(retainedUntil)) {
            retainedUntil = authorization.getAccessToken().getToken().getExpiresAt();
        }
        String familyId = authorization.getId();
        List<Boolean> families = lock(familyId);
        if (families.isEmpty()) {
            jdbc.update("INSERT INTO claude_v1_refresh_family (authorization_id, registered_client_id, revoked, expires_at) VALUES (?, ?, ?, ?)",
                    familyId, authorization.getRegisteredClientId(), false, Timestamp.from(retainedUntil));
        } else if (families.getFirst()) {
            throw new OAuth2AuthenticationException("invalid_grant");
        }
        String originalClient = jdbc.queryForObject("SELECT registered_client_id FROM claude_v1_refresh_family WHERE authorization_id = ?",
                String.class, familyId);
        if (!authorization.getRegisteredClientId().equals(originalClient)) {
            throw new OAuth2AuthenticationException("invalid_grant");
        }
        String hash = hash(refresh.getToken().getTokenValue());
        List<Boolean> known = jdbc.query("SELECT consumed FROM claude_v1_refresh_history WHERE token_hash = ? AND authorization_id = ?",
                (rs, row) -> rs.getBoolean(1), hash, familyId);
        if (known.isEmpty()) {
            jdbc.update("UPDATE claude_v1_refresh_history SET consumed = ? WHERE authorization_id = ?", true, familyId);
            jdbc.update("INSERT INTO claude_v1_refresh_history (token_hash, authorization_id, consumed) VALUES (?, ?, ?)", hash, familyId, false);
            jdbc.update("UPDATE claude_v1_refresh_family SET expires_at = ? WHERE authorization_id = ?",
                    Timestamp.from(retainedUntil), familyId);
        } else if (known.getFirst()) {
            // A stale writer cannot resurrect an already consumed refresh token.
            throw new OAuth2AuthenticationException("invalid_grant");
        }
    }

    boolean permits(OAuth2Authorization authorization) {
        if (authorization == null) return false;
        List<Boolean> state = jdbc.query("SELECT revoked FROM claude_v1_refresh_family WHERE authorization_id = ?",
                (rs, row) -> rs.getBoolean(1), authorization.getId());
        return state.isEmpty() ? authorization.getRefreshToken() == null : !state.getFirst();
    }

    void revoke(String familyId) {
        lock(familyId);
        jdbc.update("UPDATE claude_v1_refresh_family SET revoked = ? WHERE authorization_id = ?", true, familyId);
    }

    /** Bounded retention: keep ALL consumed hashes while their family could still issue tokens. */
    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 3600000, initialDelay = 600000)
    public void cleanupExpiredFamilies() {
        // One bounded batch per invocation; no unbounded table scan or startup deletion.
        List<String> expired = jdbc.query("SELECT authorization_id FROM claude_v1_refresh_family WHERE expires_at < CURRENT_TIMESTAMP ORDER BY expires_at LIMIT 200",
                (rs, row) -> rs.getString(1));
        for (String familyId : expired) {
            transaction(() -> {
                lock(familyId);
                Integer eligible = jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_refresh_family WHERE authorization_id = ? AND expires_at < CURRENT_TIMESTAMP",
                        Integer.class, familyId);
                if (eligible != null && eligible == 1) {
                    jdbc.update("DELETE FROM claude_v1_refresh_history WHERE authorization_id = ?", familyId);
                    jdbc.update("DELETE FROM claude_v1_refresh_family WHERE authorization_id = ?", familyId);
                }
                return null;
            });
        }
    }

    /** The denial is thrown AFTER the transaction commits, so reuse revocation is never rolled back. */
    Authentication refresh(String token, String registeredClientId, Supplier<Authentication> exchange) {
        Authentication result = refreshTransaction.execute(status -> {
            String tokenHash = hash(token);
            List<String> ids = jdbc.query("SELECT h.authorization_id FROM claude_v1_refresh_history h JOIN claude_v1_refresh_family f ON f.authorization_id = h.authorization_id WHERE h.token_hash = ? AND f.registered_client_id = ?",
                    (rs, row) -> rs.getString(1), tokenHash, registeredClientId);
            if (ids.size() != 1) return null;
            String familyId = ids.getFirst();
            List<Boolean> state = lock(familyId);
            if (state.isEmpty() || state.getFirst()) return null;
            Boolean consumed = jdbc.queryForObject("SELECT consumed FROM claude_v1_refresh_history WHERE token_hash = ? AND authorization_id = ?",
                    Boolean.class, tokenHash, familyId);
            if (Boolean.TRUE.equals(consumed)) {
                revoke(familyId);
                com.skillpilot.backend.oauth.OAuthProfileDiagnostics.markProfile("claude-cimd-public");
                com.skillpilot.backend.oauth.OAuthProfileDiagnostics.markReason(com.skillpilot.backend.oauth.OAuthProfileDiagnostics.Reason.REFRESH_REUSED);
                return null;
            }
            return exchange.get();
        });
        if (result == null) throw new OAuth2AuthenticationException("invalid_grant");
        return result;
    }

    private List<Boolean> lock(String familyId) {
        return jdbc.query("SELECT revoked FROM claude_v1_refresh_family WHERE authorization_id = ? FOR UPDATE",
                (rs, row) -> rs.getBoolean(1), familyId);
    }

    static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException("SHA-256 unavailable", e); }
    }
}
