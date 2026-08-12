package com.skillpilot.backend.openai.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** Provider-specific settings for the language-neutral OpenAI Coach V1 MCP app. */
@ConfigurationProperties(prefix = "skillpilot.openai.coach.v1")
public class OpenAiDeProperties {

    private boolean enabled;
    private boolean bootstrapEnabled;
    private boolean writesEnabled;
    private Duration learningSessionTtl = Duration.ofHours(24);
    private boolean diagnosticSessionTtlEnabled;
    private MtlsEdgeMode mtlsEdgeMode = MtlsEdgeMode.DISABLED;
    private String mcpUrl = OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT;
    private String oauthResource = OpenAiDeV1ContractMetadata.OAUTH_RESOURCE;
    private String serverBuild = OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD;
    /**
     * Optional deployment assertion. The effective revision is derived from
     * the loaded runtime and startup fails when this value does not match.
     */
    private String curriculumRevision = "";
    private String workflowVersion = OpenAiDeV1ContractMetadata.WORKFLOW_VERSION;
    private String openAiAppsChallenge = "";
    private String chatgptUrl = "https://chatgpt.com/";
    private final Security security = new Security();
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

    public Duration getLearningSessionTtl() {
        return learningSessionTtl;
    }

    public void setLearningSessionTtl(Duration learningSessionTtl) {
        this.learningSessionTtl = learningSessionTtl;
    }

    public boolean isDiagnosticSessionTtlEnabled() {
        return diagnosticSessionTtlEnabled;
    }

    public void setDiagnosticSessionTtlEnabled(boolean diagnosticSessionTtlEnabled) {
        this.diagnosticSessionTtlEnabled = diagnosticSessionTtlEnabled;
    }

    public MtlsEdgeMode getMtlsEdgeMode() {
        return mtlsEdgeMode;
    }

    public void setMtlsEdgeMode(MtlsEdgeMode mtlsEdgeMode) {
        this.mtlsEdgeMode = mtlsEdgeMode;
    }

    public String getMcpUrl() {
        return mcpUrl;
    }

    public void setMcpUrl(String mcpUrl) {
        this.mcpUrl = mcpUrl;
    }

    public String getOauthResource() {
        return oauthResource;
    }

    public void setOauthResource(String oauthResource) {
        this.oauthResource = oauthResource;
    }

    public String getServerBuild() {
        return serverBuild;
    }

    public void setServerBuild(String serverBuild) {
        this.serverBuild = serverBuild;
    }

    public String getCurriculumRevision() {
        return curriculumRevision;
    }

    public void setCurriculumRevision(String curriculumRevision) {
        this.curriculumRevision = curriculumRevision;
    }

    public String getWorkflowVersion() {
        return workflowVersion;
    }

    public void setWorkflowVersion(String workflowVersion) {
        this.workflowVersion = workflowVersion;
    }

    public String getOpenAiAppsChallenge() {
        return openAiAppsChallenge;
    }

    public void setOpenAiAppsChallenge(String openAiAppsChallenge) {
        this.openAiAppsChallenge = openAiAppsChallenge;
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

    public OAuth getOauth() {
        return oauth;
    }

    public RateLimit getRateLimit() {
        return rateLimit;
    }

    /** Backend assertion for the root-owned OpenAI V1 mTLS edge mode. */
    public enum MtlsEdgeMode {
        DISABLED("disabled"),
        OBSERVE("observe"),
        ENFORCE("enforce");

        private final String wireValue;

        MtlsEdgeMode(String wireValue) {
            this.wireValue = wireValue;
        }

        public String wireValue() {
            return wireValue;
        }
    }

    /**
     * Fail-closed OAuth and provider baseline for the OpenAI Coach V1 boundary.
     *
     * <p>Every normally activated provider instance must satisfy all secure-mode
     * invariants before the application starts. Isolated component tests must load
     * their components without activating the normal provider configuration;
     * setting this property to {@code false} is not a runtime escape hatch.</p>
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
        // With a pre-registered client this is the exact opaque client ID
        // entered in ChatGPT app management. In the optional private_key_jwt
        // profile it is the exact HTTPS CIMD metadata-document URL supplied by
        // ChatGPT.
        private String clientId = "";
        private String clientSecret = "";
        private List<String> redirectUris = new ArrayList<>();
        // The normal SkillPilot ChatGPT app is a pre-registered confidential
        // client. Public-client mode must be selected explicitly in isolated
        // compatibility tests and is rejected by secure production mode.
        private String clientAuthenticationMethod = "client_secret_basic";
        private String clientJwkSetUri = "";
        private String clientAssertionSigningAlgorithm = "RS256";
        private int clientAssertionReplayCacheSize = 10_000;
        private List<String> legacyClientIds = new ArrayList<>();
        private String protectedResourceMetadata =
                OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_ENDPOINT;
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

        public String getClientSecret() {
            return clientSecret;
        }

        public void setClientSecret(String clientSecret) {
            this.clientSecret = clientSecret;
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
         * Exact former OpenAI Coach V1 public-client IDs that may be removed during
         * an explicit switch to a different configured client.
         *
         * <p>The list is deliberately empty by default. A configured entry is
         * eligible for removal only when the persisted client uses the public
         * client authentication method {@code none}.</p>
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
