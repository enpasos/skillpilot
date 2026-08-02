package com.skillpilot.backend.openai.mcp.de.v1;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;

/** Exact fail-closed binding between runtime configuration and the V1 line. */
public final class OpenAiDeV1PublicContractValidation {

    public static final String PROTECTED_RESOURCE_METADATA =
            OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_ENDPOINT;

    private OpenAiDeV1PublicContractValidation() {
    }

    public static Result inspect(OpenAiDeProperties properties) {
        return new Result(
                OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT.equals(properties.getMcpUrl()),
                OpenAiDeV1ContractMetadata.OAUTH_RESOURCE.equals(properties.getOauthResource()),
                PROTECTED_RESOURCE_METADATA.equals(
                        properties.getOauth().getProtectedResourceMetadata()));
    }

    public static void requireExact(OpenAiDeProperties properties) {
        Result result = inspect(properties);
        if (!result.mcpEndpointExact()) {
            throw mismatch(
                    "public MCP endpoint",
                    OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT,
                    properties.getMcpUrl());
        }
        if (!result.oauthResourceExact()) {
            throw mismatch(
                    "OAuth resource",
                    OpenAiDeV1ContractMetadata.OAUTH_RESOURCE,
                    properties.getOauthResource());
        }
        if (!result.protectedResourceMetadataExact()) {
            throw mismatch(
                    "protected-resource metadata URL",
                    PROTECTED_RESOURCE_METADATA,
                    properties.getOauth().getProtectedResourceMetadata());
        }
    }

    private static IllegalStateException mismatch(
            String field,
            String expected,
            String actual) {
        return new IllegalStateException(
                "OpenAI Coach V1 V1 " + field + " must exactly match " + expected
                        + "; configured value was " + actual + ".");
    }

    public record Result(
            boolean mcpEndpointExact,
            boolean oauthResourceExact,
            boolean protectedResourceMetadataExact) {

        public boolean valid() {
            return mcpEndpointExact
                    && oauthResourceExact
                    && protectedResourceMetadataExact;
        }
    }
}
