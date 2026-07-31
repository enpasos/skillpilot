package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;

class OpenAiDeV1PublicContractValidationTest {

    @Test
    void acceptsOnlyTheCanonicalV1Origins() {
        OpenAiDeProperties properties = canonicalProperties();

        assertThat(OpenAiDeV1PublicContractValidation.inspect(properties).valid())
                .isTrue();
        OpenAiDeV1PublicContractValidation.requireExact(properties);
    }

    @Test
    void rejectsEveryCrossMajorOrLegacyPublicBoundary() {
        assertMismatch(
                properties -> properties.setMcpUrl("https://mcp-v2.skillpilot.com/mcp"),
                "public MCP endpoint");
        assertMismatch(
                properties -> properties.setOauthResource("https://skillpilot.com"),
                "OAuth resource");
        assertMismatch(
                properties -> properties.setUiOrigin("https://ui-v2.skillpilot.com"),
                "UI origin");
        assertMismatch(
                properties -> properties.getOauth().setProtectedResourceMetadata(
                        "https://skillpilot.com/.well-known/oauth-protected-resource"),
                "protected-resource metadata URL");
    }

    private static void assertMismatch(
            Consumer<OpenAiDeProperties> change,
            String field) {
        OpenAiDeProperties properties = canonicalProperties();
        change.accept(properties);

        assertThat(OpenAiDeV1PublicContractValidation.inspect(properties).valid())
                .isFalse();
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> OpenAiDeV1PublicContractValidation.requireExact(properties))
                .withMessageContaining(field);
    }

    private static OpenAiDeProperties canonicalProperties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setMcpUrl(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT);
        properties.setOauthResource(OpenAiDeV1ContractMetadata.OAUTH_RESOURCE);
        properties.setUiOrigin(OpenAiDeV1ContractMetadata.PUBLIC_UI_ORIGIN);
        properties.getOauth().setProtectedResourceMetadata(
                OpenAiDeV1PublicContractValidation.PROTECTED_RESOURCE_METADATA);
        return properties;
    }
}
