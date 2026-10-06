package com.skillpilot.backend.connectors.gemini.v1;

/** Dedicated non-production keys and database for Gemini integration tests. */
public final class GeminiV1TestProperties {
    public static final String ENABLED = "skillpilot.gemini.connector.v1.enabled=true";
    public static final String DISABLED = "skillpilot.gemini.connector.v1.enabled=false";
    public static final String BETA_DISABLED = "skillpilot.claude.enabled=false";
    public static final String SIGNING_SECRET_VALUE = "gemini-v1-test-signing-secret-0123456789";
    public static final String CAPABILITY_SECRET_VALUE = "gemini-v1-test-capability-secret-9876543210";
    public static final String GATEWAY_SECRET_VALUE = "gemini-v1-test-gateway-secret-31415926535";
    public static final String SIGNING_SECRET = "skillpilot.gemini.connector.v1.signing-secret=" + SIGNING_SECRET_VALUE;
    public static final String CAPABILITY_SECRET = "skillpilot.gemini.connector.v1.capability-secret=" + CAPABILITY_SECRET_VALUE;
    public static final String GATEWAY_SECRET = "skillpilot.gemini.connector.v1.gateway-secret=" + GATEWAY_SECRET_VALUE;
    public static final String GATEWAY_AUDIENCE = "skillpilot.gemini.connector.v1.gateway-audience=https://mcp-gemini-v1.skillpilot.com/mcp";
    public static final String CORE_DATASOURCE =
            "spring.datasource.url=jdbc:h2:mem:gemini-v1-core;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE";

    public static GeminiV1Properties validProperties() {
        GeminiV1Properties properties = new GeminiV1Properties();
        properties.setEnabled(true);
        properties.setSigningSecret(SIGNING_SECRET_VALUE);
        properties.setCapabilitySecret(CAPABILITY_SECRET_VALUE);
        properties.setGatewaySecret(GATEWAY_SECRET_VALUE);
        properties.setGatewayAudience(GeminiV1Contract.DEFAULT_PUBLIC_MCP_URL);
        return properties;
    }

    private GeminiV1TestProperties() {}
}
