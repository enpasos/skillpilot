package com.skillpilot.backend.connectors.claude.v1;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed configuration properties for SkillPilot Claude Connector v1.
 *
 * <p>Bound under prefix {@code skillpilot.claude.connector.v1}. All settings default to
 * safe, fail-closed values. When enabled, missing or invalid settings prevent startup.</p>
 */
@ConfigurationProperties(prefix = ClaudeV1Contract.PROPERTY_PREFIX)
public class ClaudeV1Properties {

    private boolean enabled = false;
    private String publicBaseUrl = ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL;
    private String publicMcpUrl = ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL;
    private String publicResourceMetadataUrl = ClaudeV1Contract.DEFAULT_PUBLIC_RESOURCE_METADATA_URL;
    private String publicAuthServerMetadataUrl = ClaudeV1Contract.DEFAULT_PUBLIC_AUTH_SERVER_METADATA_URL;
    private String internalBasePath = ClaudeV1Contract.INTERNAL_BASE_PATH;
    private String serverName = "SkillPilot Claude Connector";
    private String serverVersion = "1.0.0";
    private String signingSecret;
    private String capabilitySecret;
    private Duration accessTokenTtl = Duration.ofHours(1);
    private Duration refreshTokenTtl = Duration.ofDays(30);
    private Duration bindingTransactionTtl = Duration.ofMinutes(5);
    private Duration capabilityTtl = Duration.ofMinutes(5);
    private Duration idempotencyTtl = Duration.ofHours(24);
    private Duration requestTimeout = Duration.ofSeconds(30);
    private Duration cimdConnectTimeout = Duration.ofSeconds(3);
    private Duration cimdReadTimeout = Duration.ofSeconds(5);
    private Duration cimdCacheTtl = Duration.ofHours(1);
    private int maxRequestBodyBytes = 65536;
    private int maxResponseBytes = 262144;
    private int maxToolCallsPerConnectionPerMinute = 60;
    /**
     * Abuse budget for the OAuth and connect endpoints, counted per calling peer rather than per
     * OAuth client: the allowed CIMD client identities are shared by every learner, so a per-client
     * budget would be a single global bucket. See {@code ClaudeV1OAuthBoundaryFilter}.
     */
    private int maxOAuthRequestsPerCallerPerMinute = 30;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getPublicBaseUrl() {
        return publicBaseUrl;
    }

    public void setPublicBaseUrl(String publicBaseUrl) {
        this.publicBaseUrl = publicBaseUrl;
    }

    public String getPublicMcpUrl() {
        return publicMcpUrl;
    }

    public void setPublicMcpUrl(String publicMcpUrl) {
        this.publicMcpUrl = publicMcpUrl;
    }

    public String getPublicResourceMetadataUrl() {
        return publicResourceMetadataUrl;
    }

    public void setPublicResourceMetadataUrl(String publicResourceMetadataUrl) {
        this.publicResourceMetadataUrl = publicResourceMetadataUrl;
    }

    public String getPublicAuthServerMetadataUrl() {
        return publicAuthServerMetadataUrl;
    }

    public void setPublicAuthServerMetadataUrl(String publicAuthServerMetadataUrl) {
        this.publicAuthServerMetadataUrl = publicAuthServerMetadataUrl;
    }

    /** Public origin without a trailing slash, or {@code null} when unset. */
    public String getPublicOrigin() {
        return publicBaseUrl == null ? null : publicBaseUrl.replaceAll("/+$", "");
    }

    /**
     * Host authority of the public origin, used by the edge-boundary check. Returns {@code null}
     * when the configured origin is not a parsable absolute URL.
     */
    public String getPublicHost() {
        String origin = getPublicOrigin();
        if (origin == null) {
            return null;
        }
        try {
            java.net.URI uri = java.net.URI.create(origin);
            if (uri.getHost() == null) {
                return null;
            }
            return uri.getPort() < 0 || ("https".equalsIgnoreCase(uri.getScheme()) && uri.getPort() == 443)
                    ? uri.getHost()
                    : uri.getHost() + ":" + uri.getPort();
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /** Absolute public URL for a path that the edge maps onto this connector. */
    public String publicUrl(String path) {
        String origin = getPublicOrigin();
        return origin == null ? path : origin + path;
    }

    public String getPublicConnectUrl() {
        return publicUrl(ClaudeV1Contract.PUBLIC_PATH_CONNECT);
    }

    public String getPublicAuthorizeUrl() {
        return publicUrl(ClaudeV1Contract.PUBLIC_PATH_AUTHORIZE);
    }

    public String getPublicPrivacyUrl() {
        return publicUrl(ClaudeV1Contract.PUBLIC_PATH_PRIVACY);
    }

    public String getCapabilitySecret() {
        return capabilitySecret;
    }

    public void setCapabilitySecret(String capabilitySecret) {
        this.capabilitySecret = capabilitySecret;
    }

    public String getInternalBasePath() {
        return internalBasePath;
    }

    public void setInternalBasePath(String internalBasePath) {
        this.internalBasePath = internalBasePath;
    }

    public String getServerName() {
        return serverName;
    }

    public void setServerName(String serverName) {
        this.serverName = serverName;
    }

    public String getServerVersion() {
        return serverVersion;
    }

    public void setServerVersion(String serverVersion) {
        this.serverVersion = serverVersion;
    }

    public String getSigningSecret() {
        return signingSecret;
    }

    public void setSigningSecret(String signingSecret) {
        this.signingSecret = signingSecret;
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

    public Duration getBindingTransactionTtl() {
        return bindingTransactionTtl;
    }

    public void setBindingTransactionTtl(Duration bindingTransactionTtl) {
        this.bindingTransactionTtl = bindingTransactionTtl;
    }

    public Duration getCapabilityTtl() {
        return capabilityTtl;
    }

    public void setCapabilityTtl(Duration capabilityTtl) {
        this.capabilityTtl = capabilityTtl;
    }

    public Duration getIdempotencyTtl() {
        return idempotencyTtl;
    }

    public void setIdempotencyTtl(Duration idempotencyTtl) {
        this.idempotencyTtl = idempotencyTtl;
    }

    public Duration getRequestTimeout() {
        return requestTimeout;
    }

    public void setRequestTimeout(Duration requestTimeout) {
        this.requestTimeout = requestTimeout;
    }

    public Duration getCimdConnectTimeout() {
        return cimdConnectTimeout;
    }

    public void setCimdConnectTimeout(Duration cimdConnectTimeout) {
        this.cimdConnectTimeout = cimdConnectTimeout;
    }

    public Duration getCimdReadTimeout() {
        return cimdReadTimeout;
    }

    public void setCimdReadTimeout(Duration cimdReadTimeout) {
        this.cimdReadTimeout = cimdReadTimeout;
    }

    public Duration getCimdCacheTtl() {
        return cimdCacheTtl;
    }

    public void setCimdCacheTtl(Duration cimdCacheTtl) {
        this.cimdCacheTtl = cimdCacheTtl;
    }

    public int getMaxRequestBodyBytes() {
        return maxRequestBodyBytes;
    }

    public void setMaxRequestBodyBytes(int maxRequestBodyBytes) {
        this.maxRequestBodyBytes = maxRequestBodyBytes;
    }

    public int getMaxResponseBytes() {
        return maxResponseBytes;
    }

    public void setMaxResponseBytes(int maxResponseBytes) {
        this.maxResponseBytes = maxResponseBytes;
    }

    public int getMaxToolCallsPerConnectionPerMinute() {
        return maxToolCallsPerConnectionPerMinute;
    }

    public void setMaxToolCallsPerConnectionPerMinute(int maxToolCallsPerConnectionPerMinute) {
        this.maxToolCallsPerConnectionPerMinute = maxToolCallsPerConnectionPerMinute;
    }

    public int getMaxOAuthRequestsPerCallerPerMinute() {
        return maxOAuthRequestsPerCallerPerMinute;
    }

    public void setMaxOAuthRequestsPerCallerPerMinute(int maxOAuthRequestsPerCallerPerMinute) {
        this.maxOAuthRequestsPerCallerPerMinute = maxOAuthRequestsPerCallerPerMinute;
    }
}
