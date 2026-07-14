package com.skillpilot.backend.claude.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.actionregression.ActionRegressionAuditLogger;
import com.skillpilot.backend.actionregression.ActionRegressionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ActionRegressionMcpToolsTest {

    private static final String PROBE_ID = "123e4567-e89b-42d3-a456-426614174000";
    private static final String TOKEN = "SPREG-ABCDEFGHJKLMNPQR";
    private static final String PROOF = "156a16e2b6c746c9ae6434cf86eba6e4";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private ActionRegressionService regressionService;
    private ActionRegressionAuditLogger auditLogger;
    private ActionRegressionMcpTools tools;

    @BeforeEach
    void setUp() {
        regressionService = mock(ActionRegressionService.class);
        auditLogger = mock(ActionRegressionAuditLogger.class);
        tools = new ActionRegressionMcpTools(regressionService, auditLogger);
    }

    @Test
    void delegatesProbeCreationAndVerificationWithoutLearnerData() {
        when(regressionService.issueProbe())
                .thenReturn(new ActionRegressionService.Probe(PROBE_ID, TOKEN, PROOF));
        when(regressionService.verifyProbe(PROBE_ID, TOKEN, PROOF)).thenReturn(true);

        ActionRegressionMcpTools.RegressionProbe probe = tools.createRegressionProbe();
        ActionRegressionMcpTools.RegressionVerification verification = tools.verifyRegressionProbe(
                probe.probeId(), probe.token(), probe.proof());

        assertThat(probe).isEqualTo(new ActionRegressionMcpTools.RegressionProbe(PROBE_ID, TOKEN, PROOF));
        assertThat(verification).isEqualTo(
                new ActionRegressionMcpTools.RegressionVerification(true, PROBE_ID, true));
        verify(regressionService).issueProbe();
        verify(regressionService).verifyProbe(PROBE_ID, TOKEN, PROOF);
        verify(auditLogger).logClaudeMcpProbeIssued(PROBE_ID, TOKEN, PROOF);
        verify(auditLogger).logClaudeMcpProbeVerified(PROBE_ID, TOKEN, PROOF, true);
    }

    @Test
    void auditsARejectedProofWithoutChangingTheToolResult() {
        when(regressionService.verifyProbe(PROBE_ID, TOKEN, PROOF)).thenReturn(false);

        ActionRegressionMcpTools.RegressionVerification verification = tools.verifyRegressionProbe(
                PROBE_ID, TOKEN, PROOF);

        assertThat(verification).isEqualTo(
                new ActionRegressionMcpTools.RegressionVerification(false, PROBE_ID, false));
        verify(auditLogger).logClaudeMcpProbeVerified(PROBE_ID, TOKEN, PROOF, false);
    }

    @Test
    void publishesOnlyTheTwoRegressionToolsWithStableWireNames() throws Exception {
        when(regressionService.issueProbe())
                .thenReturn(new ActionRegressionService.Probe(PROBE_ID, TOKEN, PROOF));
        when(regressionService.verifyProbe(PROBE_ID, TOKEN, PROOF)).thenReturn(true);

        ToolCallback[] callbacks = MethodToolCallbackProvider.builder().toolObjects(tools).build().getToolCallbacks();

        assertThat(Arrays.stream(callbacks).map(callback -> callback.getToolDefinition().name()))
                .containsExactlyInAnyOrder("createRegressionProbe", "verifyRegressionProbe");

        ToolCallback create = callbackNamed(callbacks, "createRegressionProbe");
        ToolCallback verify = callbackNamed(callbacks, "verifyRegressionProbe");
        JsonNode verifySchema = objectMapper.readTree(verify.getToolDefinition().inputSchema());
        assertThat(verifySchema.path("properties").fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder("probe_id", "token", "proof");
        assertThat(verifySchema.path("required")).extracting(JsonNode::asText)
                .containsExactlyInAnyOrder("probe_id", "token", "proof");

        JsonNode createResult = objectMapper.readTree(create.call("{}"));
        assertThat(createResult.path("probe_id").asText()).isEqualTo(PROBE_ID);
        assertThat(createResult.path("token").asText()).isEqualTo(TOKEN);
        assertThat(createResult.path("proof").asText()).isEqualTo(PROOF);

        JsonNode verifyResult = objectMapper.readTree(verify.call(objectMapper.writeValueAsString(
                new ActionRegressionMcpTools.RegressionProbe(PROBE_ID, TOKEN, PROOF))));
        assertThat(verifyResult.path("ok").asBoolean()).isTrue();
        assertThat(verifyResult.path("probe_id").asText()).isEqualTo(PROBE_ID);
        assertThat(verifyResult.path("proof_valid").asBoolean()).isTrue();
    }

    private ToolCallback callbackNamed(ToolCallback[] callbacks, String name) {
        return Arrays.stream(callbacks)
                .filter(callback -> callback.getToolDefinition().name().equals(name))
                .findFirst()
                .orElseThrow();
    }
}
