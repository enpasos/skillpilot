package com.skillpilot.backend.oauth;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Map;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;
import java.util.function.Supplier;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.dao.DataAccessException;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Durable, independent client-profile policies. Provenance never identifies a learner or
 * attests plugin bytes. The legacy floor is retained solely as an old-binary barrier;
 * public PKCE and confidential profiles can coexist under the new policy protocol.
 */
public final class AuthenticatedClientPolicy implements SmartInitializingSingleton {
    public static final String PROVENANCE_ATTRIBUTE = "skillpilot_oauth_client_policy";
    public static final String PROFILE_ATTRIBUTE = "skillpilot_oauth_profile";
    public static final String METHOD_ATTRIBUTE = "skillpilot_oauth_client_authentication_method";

    public record Profile(String id, String fingerprint, String authenticationMethod, boolean acceptLegacyUnmarked) {
        public Profile {
            if (id == null || !id.matches("[a-z][a-z0-9-]{0,79}")
                    || fingerprint == null || fingerprint.isBlank()
                    || authenticationMethod == null
                    || !Set.of("none", "client_secret_basic", "client_secret_post", "private_key_jwt")
                            .contains(authenticationMethod)) {
                throw new IllegalArgumentException("An explicit OAuth profile and authentication method are required.");
            }
            if (acceptLegacyUnmarked && !("chatgpt-basic-transition".equals(id)
                    && "client_secret_basic".equals(authenticationMethod))) {
                throw new IllegalArgumentException("Only the explicit ChatGPT Basic transition may retain unmarked grants.");
            }
        }

        private String digest() {
            return JdbcOAuthClientAssertionReplayStore.digest(
                    id + "\n" + authenticationMethod + "\n" + acceptLegacyUnmarked + "\n" + fingerprint);
        }
    }

    public static final class PolicyRejectedException extends IllegalStateException {
        public PolicyRejectedException(String message) {
            super(message);
        }
    }
    private final JdbcOperations jdbc;
    private final TransactionTemplate transaction;
    private final boolean required;
    private final boolean independent;
    private final Map<String, String> profiles = new ConcurrentHashMap<>();
    private final Map<String, Map<String, Profile>> independentProfiles = new ConcurrentHashMap<>();
    private volatile boolean initialized;

    public AuthenticatedClientPolicy(
            JdbcOperations jdbc, PlatformTransactionManager manager, boolean required) {
        this(jdbc, manager, required, false);
    }

    private AuthenticatedClientPolicy(
            JdbcOperations jdbc, PlatformTransactionManager manager, boolean required, boolean independent) {
        this.jdbc = Objects.requireNonNull(jdbc);
        this.transaction = new TransactionTemplate(Objects.requireNonNull(manager));
        this.required = required;
        this.independent = independent;
    }

    public static AuthenticatedClientPolicy independentProfiles(JdbcOperations jdbc, PlatformTransactionManager manager) {
        return new AuthenticatedClientPolicy(jdbc, manager, false, true);
    }

    public boolean isRequired() {
        // Legacy provider configurations may only use the old compatibility protocol.
        // New provider code selects its method per Profile, never through this accessor.
        return independent || required;
    }

    /** Read-only startup compatibility check; validation failure must not activate the cutover. */
    public void assertCompatible() {
        transaction.executeWithoutResult(status -> checkFloor());
    }

    /** Readiness must describe the local provider policy, not merely the shared security floor. */
    public void assertActiveProfile(String provider) {
        if (independent) {
            Map<String, Profile> configured = independentProfiles.get(provider);
            if (configured == null || configured.isEmpty()) {
                throw new PolicyRejectedException("The OAuth provider has no registered client profiles.");
            }
            transaction.executeWithoutResult(status -> {
                checkFloor();
                configured.values().forEach(profile -> checkActive(provider, profile));
            });
            return;
        }
        String fingerprint = profiles.get(provider);
        if (required && fingerprint == null) {
            throw new PolicyRejectedException("The OAuth provider has no registered authentication policy.");
        }
        underPolicy(provider, fingerprint, () -> null);
    }

    /** Must precede provider registration writes, including attempted rollback startups. */
    public void assertProfileAvailable(String provider, String policyFingerprint) {
        String fingerprint = JdbcOAuthClientAssertionReplayStore.digest(policyFingerprint);
        transaction.executeWithoutResult(status -> {
            checkFloor();
            if (required) {
                Long retired = jdbc.queryForObject(
                        "SELECT COUNT(*) FROM oauth_client_retired_profile WHERE provider_id = ? AND fingerprint = ?",
                        Long.class, provider, fingerprint);
                if (retired == null || retired != 0) {
                    throw new PolicyRejectedException("A retired OAuth client policy cannot be reactivated.");
                }
            }
        });
    }

    /** All provider initializers must validate their configuration before activating the floor. */
    @Override
    public void afterSingletonsInstantiated() {
        if (independent) {
            activateIndependentProfiles();
            return;
        }
        transaction.executeWithoutResult(status -> {
            checkFloor();
            if (required) {
                jdbc.update("UPDATE oauth_client_security_policy SET authenticated_required = TRUE, activated_at = COALESCE(activated_at, ?) WHERE id = 1",
                        Timestamp.from(Instant.now()));
                profiles.forEach((provider, fingerprint) -> {
                    Long retired = jdbc.queryForObject(
                            "SELECT COUNT(*) FROM oauth_client_retired_profile WHERE provider_id = ? AND fingerprint = ?",
                            Long.class, provider, fingerprint);
                    if (retired == null || retired != 0) {
                        throw new PolicyRejectedException("A retired OAuth client policy cannot be reactivated.");
                    }
                    List<String> current = jdbc.queryForList(
                            "SELECT fingerprint FROM oauth_client_auth_profile WHERE provider_id = ?", String.class, provider);
                    if (!current.isEmpty() && !fingerprint.equals(current.getFirst())) {
                        jdbc.update("INSERT INTO oauth_client_retired_profile (provider_id, fingerprint, retired_at) VALUES (?, ?, ?)",
                                provider, current.getFirst(), Timestamp.from(Instant.now()));
                    }
                    int updated = jdbc.update("UPDATE oauth_client_auth_profile SET fingerprint = ? WHERE provider_id = ?",
                            fingerprint, provider);
                    if (updated == 0) {
                        jdbc.update("INSERT INTO oauth_client_auth_profile (provider_id, fingerprint) VALUES (?, ?)", provider, fingerprint);
                    }
                });
            }
        });
        initialized = true;
    }

    public OAuth2AuthorizationService protect(
            OAuth2AuthorizationService delegate, String provider, String policyFingerprint) {
        Objects.requireNonNull(delegate);
        if (independent) {
            throw new PolicyRejectedException("Legacy OAuth policy wiring is disabled; register explicit client profiles.");
        }
        if (provider == null || provider.isBlank() || provider.length() > 128
                || policyFingerprint == null || policyFingerprint.isBlank()) {
            throw new IllegalArgumentException("Provider and nonsecret policy fingerprint are required.");
        }
        // Callers pass only nonsecret policy/configuration values, never a client secret.
        String fingerprint = JdbcOAuthClientAssertionReplayStore.digest(policyFingerprint);
        assertProfileAvailable(provider, policyFingerprint);
        String previous = profiles.putIfAbsent(provider, fingerprint);
        if (previous != null && !previous.equals(fingerprint)) {
            throw new IllegalArgumentException("Conflicting OAuth client policies for one provider.");
        }
        return new ProtectedAuthorizationService(delegate, provider, fingerprint);
    }

    private void checkFloor() {
        Boolean active = lockPolicyRow(jdbc);
        if (active && !required && !independent) {
            throw new PolicyRejectedException("Authenticated OAuth clients are required by the durable security policy.");
        }
    }

    /** Every authorization writer locks policy before the authorization row, within its transaction. */
    static boolean lockPolicyRow(JdbcOperations jdbc) {
        Boolean active;
        try {
            active = jdbc.queryForObject(
                    "SELECT authenticated_required FROM oauth_client_security_policy WHERE id = 1 FOR UPDATE",
                    Boolean.class);
        } catch (DataAccessException unavailable) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.STORAGE_UNAVAILABLE);
            throw unavailable;
        }
        if (active == null) {
            throw new PolicyRejectedException("OAuth client security policy is unavailable.");
        }
        return active;
    }

    public void assertProfileAvailable(String provider, Profile profile) {
        requireIndependentProvider(provider);
        Objects.requireNonNull(profile);
        transaction.executeWithoutResult(status -> {
            checkFloor();
            checkNotRetired(profileKey(provider, profile.id()), profile.digest());
        });
    }

    public void assertActiveProfile(String provider, String profileId) {
        Map<String, Profile> configured = independentProfiles.get(provider);
        Profile profile = configured == null ? null : configured.get(profileId);
        if (profile == null) throw new PolicyRejectedException("This OAuth profile is not enabled.");
        transaction.executeWithoutResult(status -> {
            checkFloor();
            checkActive(provider, profile);
        });
    }

    /** Resolver must use the allowlisted registered client, never request headers or token input. */
    public OAuth2AuthorizationService protectProfiles(OAuth2AuthorizationService delegate, String provider,
            Collection<Profile> configured, Function<String, String> profileByRegisteredClientId) {
        requireIndependentProvider(provider);
        Objects.requireNonNull(delegate);
        Objects.requireNonNull(profileByRegisteredClientId);
        Map<String, Profile> byId = new LinkedHashMap<>();
        for (Profile profile : configured) {
            assertProfileAvailable(provider, profile);
            if (byId.putIfAbsent(profile.id(), profile) != null) {
                throw new IllegalArgumentException("Duplicate OAuth client profile.");
            }
        }
        if (byId.isEmpty()) throw new IllegalArgumentException("At least one enabled OAuth profile is required.");
        Map<String, Profile> immutable = Map.copyOf(byId);
        Map<String, Profile> previous = independentProfiles.putIfAbsent(provider, immutable);
        if (previous != null && !previous.equals(immutable)) {
            throw new IllegalArgumentException("Conflicting profile sets for an OAuth provider.");
        }
        return new ProfileAuthorizationService(delegate, provider, immutable, profileByRegisteredClientId);
    }

    private void requireIndependentProvider(String provider) {
        if (!independent) throw new IllegalStateException("Independent client-profile policy is required.");
        if (provider == null || !provider.matches("[a-z][a-z0-9-]{0,39}")) {
            throw new IllegalArgumentException("Invalid OAuth provider key.");
        }
    }

    private static String profileKey(String provider, String id) {
        return provider + "/" + id;
    }

    private void checkNotRetired(String key, String fingerprint) {
        Long retired = jdbc.queryForObject(
                "SELECT COUNT(*) FROM oauth_client_retired_profile WHERE provider_id = ? AND fingerprint = ?",
                Long.class, key, fingerprint);
        if (retired == null || retired != 0) {
            throw new PolicyRejectedException("A retired OAuth profile requires a new policy revision before activation.");
        }
    }

    private void checkActive(String provider, Profile profile) {
        OAuthProfileDiagnostics.markProfile(profile.id());
        if (!initialized) throw new PolicyRejectedException("OAuth profiles have not completed startup validation.");
        List<String> active;
        try {
            active = jdbc.queryForList(
                    "SELECT fingerprint FROM oauth_client_auth_profile WHERE provider_id = ?",
                    String.class, profileKey(provider, profile.id()));
        } catch (DataAccessException unavailable) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.STORAGE_UNAVAILABLE);
            throw unavailable;
        }
        if (active.size() != 1 || !profile.digest().equals(active.getFirst())) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.PROFILE_SUPERSEDED);
            throw new PolicyRejectedException("This OAuth profile is disabled or superseded; use its active revision.");
        }
    }

    private void activateIndependentProfiles() {
        transaction.executeWithoutResult(status -> {
            checkFloor();
            // Old compatibility binaries must not continue issuing unprofiled authorizations.
            // This historical column is NOT a requirement that public profiles use a secret.
            jdbc.update("UPDATE oauth_client_security_policy SET authenticated_required = TRUE, activated_at = COALESCE(activated_at, ?) WHERE id = 1",
                    Timestamp.from(Instant.now()));
            independentProfiles.forEach((provider, configured) -> {
                // Earlier V1 wiring used the domain provider marker as its policy key.
                // Fence that exact historical alias as well; never expose a second ingress.
                if ("claude".equals(provider)) retireActive("claude-v1");
                configured.values().forEach(profile -> checkNotRetired(profileKey(provider, profile.id()), profile.digest()));
                List<String> stored = jdbc.queryForList(
                        "SELECT provider_id FROM oauth_client_auth_profile WHERE provider_id LIKE ?",
                        String.class, provider + "/%");
                for (String key : stored) {
                    if (!configured.containsKey(key.substring(provider.length() + 1))) retireActive(key);
                }
                configured.values().forEach(profile -> replaceActive(profileKey(provider, profile.id()), profile.digest()));
                // Supersede old strict binaries too. Retain the former revision in the ledger
                // so an accidental restart cannot restore old authorizations.
                String aggregate = JdbcOAuthClientAssertionReplayStore.digest("independent-profiles-v1\n"
                        + configured.values().stream().map(profile -> profile.id() + ":" + profile.digest())
                                .sorted().collect(java.util.stream.Collectors.joining("\n")));
                replaceActive(provider, aggregate);
            });
        });
        initialized = true;
    }

    private void retireActive(String key) {
        List<String> active = jdbc.queryForList(
                "SELECT fingerprint FROM oauth_client_auth_profile WHERE provider_id = ?", String.class, key);
        if (!active.isEmpty()) {
            Long existing = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM oauth_client_retired_profile WHERE provider_id = ? AND fingerprint = ?",
                    Long.class, key, active.getFirst());
            if (existing != null && existing == 0) {
                jdbc.update("INSERT INTO oauth_client_retired_profile (provider_id, fingerprint, retired_at) VALUES (?, ?, ?)",
                        key, active.getFirst(), Timestamp.from(Instant.now()));
            }
            jdbc.update("DELETE FROM oauth_client_auth_profile WHERE provider_id = ?", key);
        }
    }

    private void replaceActive(String key, String fingerprint) {
        List<String> active = jdbc.queryForList(
                "SELECT fingerprint FROM oauth_client_auth_profile WHERE provider_id = ?", String.class, key);
        if (!active.isEmpty() && fingerprint.equals(active.getFirst())) return;
        retireActive(key);
        jdbc.update("INSERT INTO oauth_client_auth_profile (provider_id, fingerprint) VALUES (?, ?)", key, fingerprint);
    }

    private final class ProfileAuthorizationService implements OAuth2AuthorizationService {
        private final OAuth2AuthorizationService delegate;
        private final String provider;
        private final Map<String, Profile> configured;
        private final Function<String, String> resolver;

        private ProfileAuthorizationService(OAuth2AuthorizationService delegate, String provider,
                Map<String, Profile> configured, Function<String, String> resolver) {
            this.delegate = delegate;
            this.provider = provider;
            this.configured = configured;
            this.resolver = resolver;
        }

        private Profile profile(OAuth2Authorization authorization) {
            if (authorization == null) return null;
            String id = resolver.apply(authorization.getRegisteredClientId());
            return id == null ? null : configured.get(id);
        }

        private String provenance(Profile profile) {
            return profileKey(provider, profile.id()) + ":" + profile.digest();
        }

        private boolean matches(OAuth2Authorization authorization, Profile profile) {
            return provenance(profile).equals(authorization.getAttribute(PROVENANCE_ATTRIBUTE))
                    && profile.id().equals(authorization.getAttribute(PROFILE_ATTRIBUTE))
                    && profile.authenticationMethod().equals(authorization.getAttribute(METHOD_ATTRIBUTE));
        }

        private boolean unmarkedTransition(OAuth2Authorization authorization, Profile profile) {
            boolean unmarked = profile.acceptLegacyUnmarked()
                    && authorization.getAttribute(PROVENANCE_ATTRIBUTE) == null
                    && authorization.getAttribute(PROFILE_ATTRIBUTE) == null
                    && authorization.getAttribute(METHOD_ATTRIBUTE) == null;
            if (!unmarked) return false;
            // Unmarked grants have no revision with which to prove continuity. They may survive
            // the initial Basic migration only, never a disable/re-enable or security cutover.
            Long retired = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM oauth_client_retired_profile WHERE provider_id = ?",
                    Long.class, profileKey(provider, profile.id()));
            return retired != null && retired == 0;
        }

        @Override
        public void save(OAuth2Authorization authorization) {
            Objects.requireNonNull(authorization);
            transaction.executeWithoutResult(status -> {
                checkFloor();
                Profile profile = profile(authorization);
                if (profile == null) throw new IllegalArgumentException("OAuth authorization has no allowlisted client profile.");
                checkActive(provider, profile);
                OAuth2Authorization existing = delegate.findById(authorization.getId());
                requireStableAuthorizationCode(existing, authorization);
                if (existing != null && (!existing.getRegisteredClientId().equals(authorization.getRegisteredClientId())
                        || !Objects.equals(existing.getPrincipalName(), authorization.getPrincipalName())
                        || !Objects.equals(existing.getAuthorizationGrantType(), authorization.getAuthorizationGrantType()))) {
                    OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.INVALID_PROVENANCE);
                    throw new IllegalArgumentException("An existing OAuth grant cannot change its client, principal, or grant type.");
                }
                OAuth2Authorization candidate = authorization;
                if (!matches(authorization, profile)) {
                    if (existing != null && unmarkedTransition(existing, profile) && unmarkedTransition(authorization, profile)) {
                        // Preserve already-issued Basic grants without claiming a new provenance.
                    } else if (existing == null && authorization.getAccessToken() == null
                            && authorization.getRefreshToken() == null
                            && authorization.getAttribute(PROVENANCE_ATTRIBUTE) == null
                            && authorization.getAttribute(PROFILE_ATTRIBUTE) == null
                            && authorization.getAttribute(METHOD_ATTRIBUTE) == null) {
                        candidate = OAuth2Authorization.from(authorization)
                                .attribute(PROVENANCE_ATTRIBUTE, provenance(profile))
                                .attribute(PROFILE_ATTRIBUTE, profile.id())
                                .attribute(METHOD_ATTRIBUTE, profile.authenticationMethod()).build();
                    } else {
                        OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.INVALID_PROVENANCE);
                        throw new IllegalArgumentException("OAuth authorization lacks its original active client-profile provenance.");
                    }
                } else if (existing != null && !matches(existing, profile)) {
                    OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.INVALID_PROVENANCE);
                    throw new IllegalArgumentException("An existing OAuth grant cannot be promoted to another profile.");
                }
                delegate.save(candidate);
            });
        }

        @Override
        public void remove(OAuth2Authorization authorization) {
            transaction.executeWithoutResult(status -> {
                checkFloor();
                if (keep(authorization) == null) throw new IllegalArgumentException("OAuth grant does not belong to this active profile.");
                delegate.remove(authorization);
            });
        }

        @Override
        public OAuth2Authorization findById(String id) {
            return transaction.execute(status -> {
                checkFloor();
                return keep(delegate.findById(id));
            });
        }

        @Override
        public OAuth2Authorization findByToken(String token, OAuth2TokenType type) {
            return transaction.execute(status -> {
                checkFloor();
                return keep(delegate.findByToken(token, type));
            });
        }

        private OAuth2Authorization keep(OAuth2Authorization authorization) {
            Profile profile = profile(authorization);
            if (profile == null) return null;
            checkActive(provider, profile);
            if (matches(authorization, profile) || unmarkedTransition(authorization, profile)) return authorization;
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.INVALID_PROVENANCE);
            return null;
        }
    }

    private static void requireStableAuthorizationCode(OAuth2Authorization existing, OAuth2Authorization candidate) {
        if (existing == null) return;
        var issued = existing.getToken(org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode.class);
        if (issued == null) return;
        var next = candidate.getToken(org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode.class);
        // A delayed second consent must not replace an issued code or resurrect its consumed
        // predecessor. In particular, an issued refresh family must never become a fresh-code
        // authorization: that would reintroduce policy -> family lock inversion at exchange.
        if (next == null || !issued.getToken().equals(next.getToken())
                || (issued.isInvalidated() && !next.isInvalidated())) {
            OAuthProfileDiagnostics.markReason(OAuthProfileDiagnostics.Reason.INVALID_PROVENANCE);
            throw new org.springframework.security.oauth2.core.OAuth2AuthenticationException("invalid_grant");
        }
    }

    private <T> T underPolicy(String provider, String fingerprint, Supplier<T> operation) {
        return transaction.execute(status -> {
            checkFloor();
            if (required) {
                if (!initialized) {
                    throw new PolicyRejectedException("OAuth client security policy has not completed startup validation.");
                }
                List<String> active = jdbc.queryForList(
                        "SELECT fingerprint FROM oauth_client_auth_profile WHERE provider_id = ?", String.class, provider);
                if (active.size() != 1 || !fingerprint.equals(active.getFirst())) {
                    throw new PolicyRejectedException("This OAuth client policy has been superseded; restart with the active configuration.");
                }
            }
            return operation.get();
        });
    }

    private final class ProtectedAuthorizationService implements OAuth2AuthorizationService {
        private final OAuth2AuthorizationService delegate;
        private final String provider;
        private final String fingerprint;
        private final String provenance;

        private ProtectedAuthorizationService(OAuth2AuthorizationService delegate, String provider, String fingerprint) {
            this.delegate = delegate;
            this.provider = provider;
            this.fingerprint = fingerprint;
            this.provenance = provider + ":" + fingerprint;
        }

        @Override
        public void save(OAuth2Authorization authorization) {
            Objects.requireNonNull(authorization);
            underPolicy(provider, fingerprint, () -> {
                OAuth2Authorization candidate = authorization;
                if (required && !matches(authorization)) {
                    // Only a new authorization flow may acquire provenance. Never upgrade a
                    // pre-cutover access/refresh token, even if its client registration was reused.
                    if (authorization.getAttribute(PROVENANCE_ATTRIBUTE) != null
                            || authorization.getAccessToken() != null || authorization.getRefreshToken() != null
                            || delegate.findById(authorization.getId()) != null) {
                        throw new IllegalArgumentException("OAuth authorization lacks the active client authentication provenance.");
                    }
                    candidate = OAuth2Authorization.from(authorization)
                            .attribute(PROVENANCE_ATTRIBUTE, provenance).build();
                }
                delegate.save(candidate);
                return null;
            });
        }

        @Override
        public void remove(OAuth2Authorization authorization) {
            underPolicy(provider, fingerprint, () -> {
                delegate.remove(authorization);
                return null;
            });
        }

        @Override
        public OAuth2Authorization findById(String id) {
            return underPolicy(provider, fingerprint, () -> keep(delegate.findById(id)));
        }

        @Override
        public OAuth2Authorization findByToken(String token, OAuth2TokenType type) {
            return underPolicy(provider, fingerprint, () -> keep(delegate.findByToken(token, type)));
        }

        private OAuth2Authorization keep(OAuth2Authorization authorization) {
            return authorization != null && (!required || matches(authorization)) ? authorization : null;
        }

        private boolean matches(OAuth2Authorization authorization) {
            return provenance.equals(authorization.getAttribute(PROVENANCE_ATTRIBUTE));
        }
    }
}
