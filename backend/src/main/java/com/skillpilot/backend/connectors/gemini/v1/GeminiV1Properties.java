package com.skillpilot.backend.connectors.gemini.v1;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Typed configuration properties for SkillPilot Gemini Connector v1.
 *
 * <p>Bound under prefix {@code skillpilot.gemini.connector.v1}. All settings default to
 * safe, fail-closed values. When enabled, missing or invalid settings prevent startup.</p>
 */
@ConfigurationProperties(prefix = GeminiV1Contract.PROPERTY_PREFIX)
public class GeminiV1Properties {

    private boolean enabled = false;
    private String publicBaseUrl = GeminiV1Contract.DEFAULT_PUBLIC_BASE_URL;
    private String publicMcpUrl = GeminiV1Contract.DEFAULT_PUBLIC_MCP_URL;
    private String publicResourceMetadataUrl = GeminiV1Contract.DEFAULT_PUBLIC_RESOURCE_METADATA_URL;
    private String publicAuthServerMetadataUrl = GeminiV1Contract.DEFAULT_PUBLIC_AUTH_SERVER_METADATA_URL;
    private String publicDocumentationUrl = GeminiV1Contract.DEFAULT_PUBLIC_DOCUMENTATION_URL;
    private String internalBasePath = GeminiV1Contract.INTERNAL_BASE_PATH;
    private String serverName = "SkillPilot Gemini Connector";
    private String serverVersion = "0.1.0";
    private String signingSecret;
    private String capabilitySecret;
    private String gatewaySecret;
    private String gatewayAudience;
    private Duration capabilityTtl = Duration.ofMinutes(5);
    private Duration idempotencyTtl = Duration.ofHours(24);
    private Duration requestTimeout = Duration.ofSeconds(30);
    private int maxRequestBodyBytes = 65536;
    private int maxResponseBytes = 262144;
    private int maxToolCallsPerConnectionPerMinute = 60;

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

    public String getPublicDocumentationUrl() {
        return publicDocumentationUrl;
    }

    public void setPublicDocumentationUrl(String publicDocumentationUrl) {
        this.publicDocumentationUrl = publicDocumentationUrl;
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

    public String getPublicAuthorizeUrl() {
        return publicUrl(GeminiV1Contract.PUBLIC_PATH_AUTHORIZE);
    }

    public String getPublicPrivacyUrl() {
        return publicUrl(GeminiV1Contract.PUBLIC_PATH_PRIVACY);
    }

    /** Independent key for the loopback gateway's signed transport assertion. */
    public String getGatewaySecret() { return gatewaySecret; }
    public void setGatewaySecret(String value) { gatewaySecret = value; }
    /** Exact audience of the public Gemini MCP resource; no provider fallback. */
    public String getGatewayAudience() { return gatewayAudience; }
    public void setGatewayAudience(String value) { gatewayAudience = value; }

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

}
