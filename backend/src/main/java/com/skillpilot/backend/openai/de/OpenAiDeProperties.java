package com.skillpilot.backend.openai.de;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Provider- and locale-specific settings for the German ChatGPT MCP app. */
@ConfigurationProperties(prefix = "skillpilot.openai.de")
public class OpenAiDeProperties {

    private boolean enabled;
    private boolean bootstrapEnabled;
    private boolean writesEnabled;
    private boolean secureCookie = true;
    private Duration bindingTtl = Duration.ofMinutes(5);
    private Duration launchTtl = Duration.ofMinutes(5);
    private Duration learningSessionTtl = Duration.ofHours(24);
    private String mcpUrl = "https://skillpilot.com/api/openai/de/mcp";
    private String chatgptUrl = "https://chatgpt.com/";
    private final Security security = new Security();
    private final MtlsEdge mtlsEdge = new MtlsEdge();
    private final OAuth oauth = new OAuth();
    private final RateLimit rateLimit = new RateLimit();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isBootstrapEnabled() {
        return bootstrapEnabled;
    }

    public void setBootstrapEnabled(boolean bootstrapEnabled) {
        this.bootstrapEnabled = bootstrapEnabled;
    }

    public boolean isWritesEnabled() {
        return writesEnabled;
    }

    public void setWritesEnabled(boolean writesEnabled) {
        this.writesEnabled = writesEnabled;
    }

    public boolean isSecureCookie() {
        return secureCookie;
    }

    public void setSecureCookie(boolean secureCookie) {
        this.secureCookie = secureCookie;
    }

    public Duration getBindingTtl() {
        return bindingTtl;
    }

    public void setBindingTtl(Duration bindingTtl) {
        this.bindingTtl = bindingTtl;
    }

    public Duration getLaunchTtl() {
        return launchTtl;
    }

    public void setLaunchTtl(Duration launchTtl) {
        this.launchTtl = launchTtl;
    }

    public Duration getLearningSessionTtl() {
        return learningSessionTtl;
    }

    public void setLearningSessionTtl(Duration learningSessionTtl) {
        this.learningSessionTtl = learningSessionTtl;
    }

    public String getMcpUrl() {
        return mcpUrl;
    }

    public void setMcpUrl(String mcpUrl) {
        this.mcpUrl = mcpUrl;
    }

    public String getChatgptUrl() {
        return chatgptUrl;
    }

    public void setChatgptUrl(String chatgptUrl) {
        this.chatgptUrl = chatgptUrl;
    }

    public Security getSecurity() {
        return security;
    }

    public MtlsEdge getMtlsEdge() {
        return mtlsEdge;
    }

    public OAuth getOauth() {
        return oauth;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    /**
     * Fail-closed production profile for the OpenAI-DE provider boundary.
     *
     * <p>Every normally activated provider instance must satisfy all secure-mode
     * invariants before the application starts. Isolated component tests must
     * load their components without activating the normal provider
     * configuration; setting this property to {@code false} is not a runtime
     * escape hatch.</p>
     */
    public static class Security {

        private boolean secureMode;

        public boolean isSecureMode() {
            return secureMode;
        }

        public void setSecureMode(boolean secureMode) {
            this.secureMode = secureMode;
        }
    }

    /** Configuration of the trusted reverse-proxy boundary for OpenAI mTLS. */
    public static class MtlsEdge {

        private boolean enabled;
        private List<String> trustedProxies = new ArrayList<>(List.of("127.0.0.1", "::1"));

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public List<String> getTrustedProxies() {
            return trustedProxies;
        }

        public void setTrustedProxies(List<String> trustedProxies) {
            this.trustedProxies =
                    trustedProxies == null ? new ArrayList<>() : new ArrayList<>(trustedProxies);
        }
    }

    /**
     * Per-instance safety limit at the Spring provider boundary.
     *
     * <p>A shared gateway must additionally enforce an aggregate limit when
     * more than one backend instance is active. Client addresses are used only
     * as short-lived in-memory bucket keys and are never emitted as metric
     * tags.</p>
     */
    public static class RateLimit {

        private boolean enabled = true;
        private Duration window = Duration.ofMinutes(1);
        private int mcpRequests = 120;
        private int oauthRequests = 60;
        private int uiRequests = 60;
        private int metadataRequests = 120;
        private int maxClientBuckets = 10_000;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public Duration getWindow() {
            return window;
        }

        public void setWindow(Duration window) {
            this.window = window;
        }

        public int getMcpRequests() {
            return mcpRequests;
        }

        public void setMcpRequests(int mcpRequests) {
            this.mcpRequests = mcpRequests;
        }

        public int getOauthRequests() {
            return oauthRequests;
        }

        public void setOauthRequests(int oauthRequests) {
            this.oauthRequests = oauthRequests;
        }

        public int getUiRequests() {
            return uiRequests;
        }

        public void setUiRequests(int uiRequests) {
            this.uiRequests = uiRequests;
        }

        public int getMetadataRequests() {
            return metadataRequests;
        }

        public void setMetadataRequests(int metadataRequests) {
            this.metadataRequests = metadataRequests;
        }

        public int getMaxClientBuckets() {
            return maxClientBuckets;
        }

        public void setMaxClientBuckets(int maxClientBuckets) {
            this.maxClientBuckets = maxClientBuckets;
        }
    }

    public static class OAuth {

        private boolean enabled;
        // In the production private_key_jwt mode this is the exact HTTPS CIMD
        // metadata-document URL supplied by ChatGPT. The legacy "none" binding
        // remains only for isolated component tests that do not activate the
        // normal OpenAI-DE provider.
        private String clientId = "";
        private List<String> redirectUris = new ArrayList<>();
        private String clientAuthenticationMethod = "none";
        private String clientJwkSetUri = "";
        private String clientAssertionSigningAlgorithm = "RS256";
        private int clientAssertionReplayCacheSize = 10_000;
        private List<String> legacyClientIds = new ArrayList<>();
        private String protectedResourceMetadata =
                "https://skillpilot.com/api/openai/de/oauth/protected-resource";
        private Duration accessTokenTtl = Duration.ofHours(1);
        private Duration refreshTokenTtl = Duration.ofDays(30);

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }

        public List<String> getRedirectUris() {
            return redirectUris;
        }

        public void setRedirectUris(List<String> redirectUris) {
            this.redirectUris = redirectUris == null ? new ArrayList<>() : new ArrayList<>(redirectUris);
        }

        public String getClientAuthenticationMethod() {
            return clientAuthenticationMethod;
        }

        public void setClientAuthenticationMethod(String clientAuthenticationMethod) {
            this.clientAuthenticationMethod = clientAuthenticationMethod;
        }

        public String getClientJwkSetUri() {
            return clientJwkSetUri;
        }

        public void setClientJwkSetUri(String clientJwkSetUri) {
            this.clientJwkSetUri = clientJwkSetUri;
        }

        public String getClientAssertionSigningAlgorithm() {
            return clientAssertionSigningAlgorithm;
        }

        public void setClientAssertionSigningAlgorithm(String clientAssertionSigningAlgorithm) {
            this.clientAssertionSigningAlgorithm = clientAssertionSigningAlgorithm;
        }

        public int getClientAssertionReplayCacheSize() {
            return clientAssertionReplayCacheSize;
        }

        public void setClientAssertionReplayCacheSize(int clientAssertionReplayCacheSize) {
            this.clientAssertionReplayCacheSize = clientAssertionReplayCacheSize;
        }

        /**
         * Exact former OpenAI-DE OAuth client IDs that may be removed during
         * the one-way switch to CIMD/private_key_jwt.
         *
         * <p>The list is deliberately empty by default. A configured entry is
         * eligible for removal only when the persisted client still uses the
         * legacy public-client authentication method {@code none}.</p>
         */
        public List<String> getLegacyClientIds() {
            return legacyClientIds;
        }

        public void setLegacyClientIds(List<String> legacyClientIds) {
            this.legacyClientIds =
                    legacyClientIds == null ? new ArrayList<>() : new ArrayList<>(legacyClientIds);
        }

        public String getProtectedResourceMetadata() {
            return protectedResourceMetadata;
        }

        public void setProtectedResourceMetadata(String protectedResourceMetadata) {
            this.protectedResourceMetadata = protectedResourceMetadata;
        }

        public Duration getAccessTokenTtl() {
            return accessTokenTtl;
        }

        public void setAccessTokenTtl(Duration accessTokenTtl) {
            this.accessTokenTtl = accessTokenTtl;
        }

        public Duration getRefreshTokenTtl() {
            return refreshTokenTtl;
        }

        public void setRefreshTokenTtl(Duration refreshTokenTtl) {
            this.refreshTokenTtl = refreshTokenTtl;
        }
    }
}
