package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1McpContractTest {

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private ClaudeV1CoachContextProjector contextProjector;

    private McpSchema.Tool tool(String name) {
        return contractAdapter.toolSpecifications().stream()
                .map(McpStatelessServerFeatures.SyncToolSpecification::tool)
                .filter(candidate -> candidate.name().equals(name))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Tool not published: " + name));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> schemaOf(String toolName) {
        Object schema = tool(toolName).inputSchema();
        return (Map<String, Object>) schema;
    }

    @SuppressWarnings("unchecked")
    private List<String> requiredOf(String toolName) {
        Object required = schemaOf(toolName).get("required");
        return required == null ? List.of() : (List<String>) required;
    }

    @Test
    void publishesExactlyTheNineApprovedTools() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = contractAdapter.toolSpecifications();
        assertEquals(9, tools.size());

        Set<String> published = tools.stream()
                .map(specification -> specification.tool().name())
                .collect(Collectors.toSet());
        assertEquals(Set.copyOf(ClaudeV1Contract.ALL_TOOL_NAMES), published);

        // Level 2 configuration and MCP App widgets are out of scope for Claude v1.
        assertFalse(published.contains("set_skillpilot_curriculum"));
        assertFalse(published.contains("set_skillpilot_personalization"));
        assertFalse(published.contains("render_skillpilot_goal_visualization"));
        assertFalse(published.contains("start_skillpilot_memory_practice"));
    }

    @Test
    void everyToolCarriesRealMcpAnnotationsNotMetaHints() {
        for (McpStatelessServerFeatures.SyncToolSpecification specification : contractAdapter.toolSpecifications()) {
            McpSchema.Tool tool = specification.tool();

            assertNotNull(tool.title(), () -> "missing title: " + tool.name());
            assertFalse(tool.title().isBlank());
            assertNotNull(tool.description(), () -> "missing description: " + tool.name());
            assertNotNull(tool.inputSchema());
            assertTrue(tool.name().length() <= 64, () -> "tool name too long: " + tool.name());

            McpSchema.ToolAnnotations annotations = tool.annotations();
            assertNotNull(annotations, () -> "annotations must be set, not _meta: " + tool.name());

            boolean expectedReadOnly = ClaudeV1Contract.READ_TOOL_NAMES.contains(tool.name());
            assertEquals(expectedReadOnly, annotations.readOnlyHint(), () -> "readOnlyHint: " + tool.name());
            assertEquals(!expectedReadOnly, annotations.destructiveHint(), () -> "destructiveHint: " + tool.name());
            assertEquals(Boolean.TRUE, annotations.idempotentHint(), () -> "idempotentHint: " + tool.name());
            assertEquals(Boolean.FALSE, annotations.openWorldHint(), () -> "openWorldHint: " + tool.name());
        }
    }

    @Test
    void readAndWriteToolSetsCoverTheWholeCatalogue() {
        Set<String> classified = new java.util.HashSet<>(ClaudeV1Contract.READ_TOOL_NAMES);
        classified.addAll(ClaudeV1Contract.WRITE_TOOL_NAMES);
        assertEquals(Set.copyOf(ClaudeV1Contract.ALL_TOOL_NAMES), classified);
        assertTrue(
                java.util.Collections.disjoint(
                        ClaudeV1Contract.READ_TOOL_NAMES, ClaudeV1Contract.WRITE_TOOL_NAMES),
                "No tool may be classified as both read and write");
    }

    @Test
    void everyWriteToolDemandsConcurrencyAndIdempotencyArguments() {
        for (String writeTool : ClaudeV1Contract.WRITE_TOOL_NAMES) {
            List<String> required = requiredOf(writeTool);
            assertTrue(required.contains("expectedStateVersion"), () -> writeTool + " must require expectedStateVersion");
            assertTrue(required.contains("clientRequestId"), () -> writeTool + " must require clientRequestId");
        }
    }

    @Test
    void solutionReleasingToolsRequireACapability() {
        assertTrue(requiredOf(ClaudeV1Contract.TOOL_GET_VERIFIED_RECALL_ANSWERS).contains("batchCapability"));
        assertTrue(requiredOf(ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS).contains("gradingCapability"));
    }

    @Test
    void recallStartTakesNeitherGoalNorBatchSizeFromTheModel() {
        @SuppressWarnings("unchecked")
        Map<String, Object> properties =
                (Map<String, Object>) schemaOf(ClaudeV1Contract.TOOL_START_VERIFIED_RECALL).get("properties");
        assertFalse(properties.containsKey("goalId"), "The server chooses the recall goal");
        assertFalse(properties.containsKey("batchSize"), "The server chooses the complete batch size");
        assertEquals(List.of(), requiredOf(ClaudeV1Contract.TOOL_START_VERIFIED_RECALL));
    }

    @Test
    void masteryIsCanonicalCompletionRatherThanAModelSelectedNumber() {
        @SuppressWarnings("unchecked")
        Map<String, Object> properties =
                (Map<String, Object>) schemaOf(ClaudeV1Contract.TOOL_SET_MASTERY).get("properties");
        assertFalse(properties.containsKey("mastery"));
        assertTrue(requiredOf(ClaudeV1Contract.TOOL_SET_MASTERY).contains("workFeedback"));
        assertTrue(requiredOf(ClaudeV1Contract.TOOL_SET_MASTERY).contains("outcomeFeedback"));
    }

    @Test
    void schemasRejectUnknownArguments() {
        for (String toolName : ClaudeV1Contract.ALL_TOOL_NAMES) {
            assertEquals(
                    Boolean.FALSE,
                    schemaOf(toolName).get("additionalProperties"),
                    () -> toolName + " must not accept free-form arguments");
        }
    }

    @Test
    void navigationOptionsExposeTheCompletePublishedFocusPayload() {
        FrontierGoal option = new FrontierGoal(
                "wider-focus",
                "Wider focus",
                "Retains an independent focus root.",
                "cluster",
                "tutor",
                null,
                "focus-widening",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                false,
                List.of("replacement-root", "independent-root"));

        assertEquals(
                List.of("replacement-root", "independent-root"),
                contextProjector.formatNavigationGoal(option).get("goalIds"));
        assertFalse(
                contextProjector.formatGoal(option).containsKey("goalIds"),
                "The compound payload belongs only to actionable navigation options");
    }

    @Test
    void serverInstructionsCarryTheCoachingRulesNotTheToolDescriptions() {
        String instructions = contractAdapter.serverInstructions();
        assertNotNull(instructions);
        assertTrue(instructions.contains("SkillPilot Coach for Claude"));
        assertTrue(instructions.contains("expectedStateVersion"));
        assertTrue(instructions.contains("earnedPoints"));
        assertTrue(instructions.contains("two independent checks"));
        assertTrue(instructions.contains("merely selecting one offered path"));
        assertTrue(instructions.contains("follow the returned next continuation immediately"));
    }
}
