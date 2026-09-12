package com.skillpilot.backend.connectors.claude.v1;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachContractFingerprint;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
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
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves that enabling Claude v1 in the shared JVM preserves the OpenAI 1.1.0 candidate contract.
 *
 * <p>The providers evolve independently. This test runs with Claude v1 switched on so accidental
 * coupling — a shared bean, a contributed tool, a rewritten instruction block — is detected against
 * the explicit OpenAI 1.1.0 candidate baseline, not the retired 1.0.0 review contract.</p>
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

    // Read the independently committed candidate, never regenerate it from the runtime under test.
    // Keeping a second literal digest here would drift whenever the authorized draft is refreshed.
    private static final Path OPENAI_1_1_0_CONTRACT = Path.of(
            "../contracts/drafts/openai/skillpilot-coach-v1/1.1.0-SNAPSHOT/contract/contract.json");

    private static final Set<String> OPENAI_1_1_0_TOOL_NAMES = Set.of(
            "get_skillpilot_context",
            "get_skillpilot_exam_evaluation",
            "get_skillpilot_navigation",
            "get_skillpilot_verified_recall_answers",
            "record_skillpilot_verified_recall_results",
            "render_skillpilot_goal_visualization",
            "resume_skillpilot_learning_plan",
            "review_skillpilot_memory_practice_card",
            "set_skillpilot_active_goal",
            "set_skillpilot_mastery",
            "set_skillpilot_scope",
            "start_skillpilot_memory_practice",
            "start_skillpilot_verified_recall",
            "switch_skillpilot_learning_plan_subject");

    /** Supplies the confidential secure-mode OAuth settings required by the OpenAI lane. */
    @DynamicPropertySource
    static void secureOpenAiProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @Autowired
    private OpenAiDeV1McpContractAdapter openAiContract;

    @Test
    void openAiCandidateIdentityRemainsIndependentOfClaude() {
        assertEquals("skillpilot-coach-v1", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY);
        assertEquals("1.1.0", OpenAiDeV1ContractMetadata.PLUGIN_VERSION);
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
    void openAiToolSurfaceIsUnaffectedByTheClaudeLane() throws IOException {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = openAiContract.toolSpecifications();
        assertEquals(14, tools.size(), "The OpenAI 1.1.0 candidate must publish exactly 14 tools");

        Set<String> openAiToolNames = tools.stream()
                .map(specification -> specification.tool().name())
                .collect(Collectors.toSet());
        assertEquals(OPENAI_1_1_0_TOOL_NAMES, openAiToolNames);
        // Shared tool names are intentional; Claude-specific entry/navigation/focus tools are not.
        assertFalse(openAiToolNames.contains(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT));
        assertFalse(openAiToolNames.contains(ClaudeV1Contract.TOOL_GET_NAVIGATION_OPTIONS));
        assertFalse(openAiToolNames.contains(ClaudeV1Contract.TOOL_SET_FOCUS));

        String fingerprint = OpenAiDeCoachContractFingerprint.sha256(openAiContract);
        assertNotNull(fingerprint);
        assertEquals(
                preparedOpenAiContractSha256(),
                fingerprint,
                "Enabling Claude must preserve the explicit OpenAI 1.1.0 candidate contract");
    }

    private static String preparedOpenAiContractSha256() throws IOException {
        assertTrue(Files.isRegularFile(OPENAI_1_1_0_CONTRACT),
                "The independently prepared OpenAI 1.1.0 candidate must be checked in");
        JsonNode candidate = new ObjectMapper().readTree(Files.readString(OPENAI_1_1_0_CONTRACT));
        assertEquals(1, candidate.path("schemaVersion").asInt());
        assertEquals("skillpilot-coach-v1", candidate.path("pluginIdentity").asText());
        assertEquals(1, candidate.path("contractMajor").asInt());
        String fingerprint = candidate.path("contractSha256").asText();
        assertTrue(fingerprint.matches("[0-9a-f]{64}"),
                "The prepared candidate must contain a valid contract fingerprint");
        return fingerprint;
    }
}
