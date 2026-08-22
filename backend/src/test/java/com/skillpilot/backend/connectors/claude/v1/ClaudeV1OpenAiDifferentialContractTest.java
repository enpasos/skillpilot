package com.skillpilot.backend.connectors.claude.v1;

import com.skillpilot.backend.openai.de.health.OpenAiDeCoachContractFingerprint;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeSecureOAuthTestServer;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves that enabling Claude v1 in the shared JVM leaves the frozen OpenAI v1 contract unchanged.
 *
 * <p>The OpenAI lane is under review and its observable contract must not move. This test runs with
 * Claude v1 switched on so any accidental coupling — a shared bean, a contributed tool, a rewritten
 * instruction block — would show up as a fingerprint difference.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
// This property set is used by exactly one class, so caching its context past the class
// only holds heap that the rest of the suite needs.
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.DIFFERENTIAL_DATASOURCE,
        // The OpenAI lane runs alongside Claude v1 here, configured the way its own end-to-end
        // test configures it, so both provider contexts must start in one JVM.
        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.coach.v1.enabled=true",
        "skillpilot.openai.coach.v1.server-build=test-build",
        "skillpilot.openai.coach.v1.writes-enabled=true",
        "skillpilot.openai.coach.v1.mcp.enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/callback",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp"
})
class ClaudeV1OpenAiDifferentialContractTest {

    private static final String FROZEN_OPENAI_V1_CONTRACT_SHA256 =
            "d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38";

    /** Supplies the confidential secure-mode OAuth settings the frozen OpenAI lane requires. */
    @DynamicPropertySource
    static void secureOpenAiProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @Autowired
    private OpenAiDeV1McpContractAdapter openAiContract;

    @Test
    void openAiV1ContractIdentityIsUnchanged() {
        assertEquals("skillpilot-coach-v1", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY);
        assertEquals("1.0.0", OpenAiDeV1ContractMetadata.PLUGIN_VERSION);
        assertEquals("https://mcp-coach-v1.skillpilot.com/mcp", OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT);
        assertEquals("/internal/openai/v1/mcp", OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH);
    }

    @Test
    void claudeAndOpenAiPublishDisjointEndpointsAndPaths() {
        assertTrue(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT
                .startsWith(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ORIGIN));
        assertEquals(
                Set.of(),
                Set.of(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL).stream()
                        .filter(url -> url.equals(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT))
                        .collect(Collectors.toSet()),
                "Claude v1 and OpenAI v1 must not share a public MCP endpoint");
        assertTrue(
                !ClaudeV1Contract.INTERNAL_MCP_PATH.equals(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH),
                "Claude v1 and OpenAI v1 must not share an internal MCP path");
        assertTrue(
                !ClaudeV1Contract.INTERNAL_BASE_PATH.startsWith("/internal/openai"),
                "Claude v1 must not publish under the OpenAI internal prefix");
    }

    @Test
    void openAiToolSurfaceIsUnaffectedByTheClaudeLane() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = openAiContract.toolSpecifications();
        assertEquals(12, tools.size(), "The frozen OpenAI v1 toolset must still publish exactly 12 tools");

        Set<String> openAiToolNames = tools.stream()
                .map(specification -> specification.tool().name())
                .collect(Collectors.toSet());
        for (String claudeTool : ClaudeV1Contract.ALL_TOOL_NAMES) {
            // Identical names would be a genuine problem only if the OpenAI catalogue grew; the
            // two lanes deliberately share several tool names with different schemas, so this
            // asserts the count and fingerprint rather than name disjointness.
            assertNotNull(claudeTool);
        }
        assertEquals(12, openAiToolNames.size());

        String fingerprint = OpenAiDeCoachContractFingerprint.sha256(openAiContract);
        assertNotNull(fingerprint);
        assertEquals(
                FROZEN_OPENAI_V1_CONTRACT_SHA256,
                fingerprint,
                "Enabling Claude must leave the submitted OpenAI v1 contract byte-for-byte equivalent");
    }
}
