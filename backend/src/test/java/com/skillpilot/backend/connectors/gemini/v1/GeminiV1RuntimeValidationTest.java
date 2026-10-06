package com.skillpilot.backend.connectors.gemini.v1;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class GeminiV1RuntimeValidationTest {
    @Test void disabledLaneRequiresNoCredentials() {
        assertTrue(GeminiV1RuntimeValidation.inspect(new GeminiV1Properties(), new MockEnvironment()).valid());
    }

    @Test void dedicatedProfileValidates() {
        assertTrue(GeminiV1RuntimeValidation.inspect(GeminiV1TestProperties.validProperties(), new MockEnvironment()).valid());
    }

    @Test void enabledLaneFailsClosedWithoutOwnSecretsOrAudience() {
        GeminiV1Properties properties = new GeminiV1Properties();
        properties.setEnabled(true);
        var result = GeminiV1RuntimeValidation.inspect(properties, new MockEnvironment());
        assertFalse(result.valid());
        assertEquals(4, result.violations().size());
    }

    @Test void secretsCannotBeReusedWithinGeminiOrAcrossProvidersAndNeverAppearInErrors() {
        GeminiV1Properties properties = GeminiV1TestProperties.validProperties();
        properties.setGatewaySecret(properties.getSigningSecret());
        var result = GeminiV1RuntimeValidation.inspect(properties,
                new MockEnvironment().withProperty("skillpilot.claude.connector.v1.signing-secret", properties.getSigningSecret()));
        assertFalse(result.valid());
        assertTrue(result.violations().stream().anyMatch(value -> value.contains("independent Gemini key")));
        assertFalse(result.violations().toString().contains(properties.getSigningSecret()));
    }

    @Test void changedPublicOriginRequiresEveryExactPublicIdentifierAndGatewayAudienceToMatch() {
        GeminiV1Properties properties = GeminiV1TestProperties.validProperties();
        properties.setPublicBaseUrl("https://gemini-test.example");
        assertFalse(GeminiV1RuntimeValidation.inspect(properties, new MockEnvironment()).valid());
        properties.setPublicMcpUrl("https://gemini-test.example/mcp");
        properties.setPublicResourceMetadataUrl("https://gemini-test.example/.well-known/oauth-protected-resource/mcp");
        properties.setPublicAuthServerMetadataUrl("https://gemini-test.example/.well-known/oauth-authorization-server");
        properties.setGatewayAudience(properties.getPublicMcpUrl());
        assertTrue(GeminiV1RuntimeValidation.inspect(properties, new MockEnvironment()).valid());
        properties.setGatewayAudience("https://mcp-claude-v1.skillpilot.com/mcp");
        assertFalse(GeminiV1RuntimeValidation.inspect(properties, new MockEnvironment()).valid());
    }

    @Test void unsafeOriginOrUnboundedRequestLimitsAreRejected() {
        GeminiV1Properties properties = GeminiV1TestProperties.validProperties();
        properties.setPublicBaseUrl("https://user:secret@example.com/path?query=1");
        properties.setRequestTimeout(Duration.ofMinutes(10));
        properties.setMaxRequestBodyBytes(Integer.MAX_VALUE);
        assertFalse(GeminiV1RuntimeValidation.inspect(properties, new MockEnvironment()).valid());
    }
}
