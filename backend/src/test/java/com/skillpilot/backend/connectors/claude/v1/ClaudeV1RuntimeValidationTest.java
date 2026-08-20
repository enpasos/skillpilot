package com.skillpilot.backend.connectors.claude.v1;

import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClaudeV1RuntimeValidationTest {

    private static ClaudeV1Properties validEnabledProperties() {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setEnabled(true);
        properties.setSigningSecret(ClaudeV1TestProperties.SIGNING_SECRET_VALUE);
        properties.setCapabilitySecret(ClaudeV1TestProperties.CAPABILITY_SECRET_VALUE);
        return properties;
    }

    private static MockEnvironment environmentWithBeta(boolean betaEnabled) {
        MockEnvironment environment = new MockEnvironment();
        environment.setProperty(ClaudeV1Contract.LEGACY_BETA_ENABLED_PROPERTY, Boolean.toString(betaEnabled));
        return environment;
    }

    private static boolean hasViolationContaining(
            ClaudeV1RuntimeValidation.ValidationResult result, String fragment) {
        return result.violations().stream().anyMatch(violation -> violation.contains(fragment));
    }

    @Test
    void aDisabledLaneNeedsNoConfiguration() {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setEnabled(false);

        assertTrue(ClaudeV1RuntimeValidation.inspect(properties, new MockEnvironment()).valid());
    }

    @Test
    void aFullyConfiguredLanePasses() {
        assertTrue(ClaudeV1RuntimeValidation
                .inspect(validEnabledProperties(), environmentWithBeta(false))
                .valid());
    }

    @Test
    void bothSecretsAreRequiredAndMustDiffer() {
        ClaudeV1Properties noSecrets = validEnabledProperties();
        noSecrets.setSigningSecret(null);
        noSecrets.setCapabilitySecret(null);
        var missing = ClaudeV1RuntimeValidation.inspect(noSecrets, environmentWithBeta(false));
        assertFalse(missing.valid());
        assertTrue(hasViolationContaining(missing, "signing-secret"));
        assertTrue(hasViolationContaining(missing, "capability-secret"));

        ClaudeV1Properties shared = validEnabledProperties();
        shared.setCapabilitySecret(shared.getSigningSecret());
        var reused = ClaudeV1RuntimeValidation.inspect(shared, environmentWithBeta(false));
        assertFalse(reused.valid());
        assertTrue(hasViolationContaining(reused, "must differ"));
    }

    @Test
    void thereIsNoFallbackToAnApplicationWideSecret() {
        ClaudeV1Properties properties = validEnabledProperties();
        properties.setSigningSecret(null);
        properties.setCapabilitySecret(null);

        MockEnvironment environment = environmentWithBeta(false);
        environment.setProperty("skillpilot.security.signing-secret", "a-shared-application-wide-secret-value-32");

        // A shared key would let another lane forge Claude v1 capabilities.
        assertFalse(ClaudeV1RuntimeValidation.inspect(properties, environment).valid());
    }

    @Test
    void aShortSecretIsRefused() {
        ClaudeV1Properties properties = validEnabledProperties();
        properties.setCapabilitySecret("short");

        assertFalse(ClaudeV1RuntimeValidation.inspect(properties, environmentWithBeta(false)).valid());
    }

    @Test
    void betaAndV1MustNotBothBeEnabled() {
        var result = ClaudeV1RuntimeValidation.inspect(validEnabledProperties(), environmentWithBeta(true));

        assertFalse(result.valid());
        assertTrue(hasViolationContaining(result, "must not both be true"));
    }

    @Test
    void publicIdentifiersMustBeHttpsAndMutuallyConsistent() {
        ClaudeV1Properties httpOrigin = validEnabledProperties();
        httpOrigin.setPublicBaseUrl("http://mcp-claude-v1.skillpilot.com");
        assertFalse(ClaudeV1RuntimeValidation.inspect(httpOrigin, environmentWithBeta(false)).valid());

        // The resource identifier is compared verbatim against the token audience, so a mismatch
        // between origin and MCP URL must not start.
        ClaudeV1Properties mismatchedResource = validEnabledProperties();
        mismatchedResource.setPublicMcpUrl("https://mcp-claude-v1.skillpilot.com/mcp/v1");
        var mismatch = ClaudeV1RuntimeValidation.inspect(mismatchedResource, environmentWithBeta(false));
        assertFalse(mismatch.valid());
        assertTrue(hasViolationContaining(mismatch, "publicMcpUrl"));

        ClaudeV1Properties mismatchedMetadata = validEnabledProperties();
        mismatchedMetadata.setPublicResourceMetadataUrl("https://elsewhere.example/.well-known/x");
        assertFalse(ClaudeV1RuntimeValidation.inspect(mismatchedMetadata, environmentWithBeta(false)).valid());
    }

    @Test
    void aDivergingInternalBasePathIsRefused() {
        ClaudeV1Properties properties = validEnabledProperties();
        properties.setInternalBasePath("/internal/somewhere/else");

        // The security matchers are compiled against the contract constant; a diverging property
        // would publish routes those matchers do not cover.
        var result = ClaudeV1RuntimeValidation.inspect(properties, environmentWithBeta(false));
        assertFalse(result.valid());
        assertTrue(hasViolationContaining(result, "internalBasePath"));
    }

    @Test
    void ttlsAndLimitsMustBePositive() {
        ClaudeV1Properties zeroTtl = validEnabledProperties();
        zeroTtl.setCapabilityTtl(Duration.ZERO);
        assertFalse(ClaudeV1RuntimeValidation.inspect(zeroTtl, environmentWithBeta(false)).valid());

        ClaudeV1Properties negativeTtl = validEnabledProperties();
        negativeTtl.setAccessTokenTtl(Duration.ofSeconds(-1));
        assertFalse(ClaudeV1RuntimeValidation.inspect(negativeTtl, environmentWithBeta(false)).valid());

        ClaudeV1Properties noRateLimit = validEnabledProperties();
        noRateLimit.setMaxToolCallsPerConnectionPerMinute(0);
        assertFalse(ClaudeV1RuntimeValidation.inspect(noRateLimit, environmentWithBeta(false)).valid());

        ClaudeV1Properties noBodyLimit = validEnabledProperties();
        noBodyLimit.setMaxRequestBodyBytes(0);
        assertFalse(ClaudeV1RuntimeValidation.inspect(noBodyLimit, environmentWithBeta(false)).valid());
    }

    @Test
    void violationTextsNameThePropertyButNeverItsValue() {
        ClaudeV1Properties properties = validEnabledProperties();
        properties.setCapabilitySecret("short-secret-value");

        var result = ClaudeV1RuntimeValidation.inspect(properties, environmentWithBeta(false));
        assertFalse(result.valid());
        for (String violation : result.violations()) {
            assertFalse(violation.contains("short-secret-value"), "A failed startup must not log a secret");
            assertFalse(violation.contains(ClaudeV1TestProperties.SIGNING_SECRET_VALUE));
        }
    }
}
