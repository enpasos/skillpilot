package com.skillpilot.backend.actionregression;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ActionRegressionAuditLoggerTest {

    private static final String PROBE_ID = "123e4567-e89b-42d3-a456-426614174000";
    private static final String TOKEN = "SPREG-ABCDEFGHJKLMNPQR";
    private static final String PROOF = "156a16e2b6c746c9ae6434cf86eba6e4";

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void claudeMcpEventsCorrelateWithHashesWithoutLoggingMarkers() throws Exception {
        List<String> lines = new ArrayList<>();
        ActionRegressionAuditLogger logger = new ActionRegressionAuditLogger(objectMapper, lines::add);

        logger.logClaudeMcpProbeIssued(PROBE_ID, TOKEN, PROOF);
        logger.logClaudeMcpProbeVerified(PROBE_ID, TOKEN, PROOF, true);

        assertThat(lines).hasSize(2).allSatisfy(line -> {
            assertThat(line).doesNotContain(TOKEN, PROOF);
        });

        JsonNode issued = objectMapper.readTree(lines.getFirst());
        JsonNode verified = objectMapper.readTree(lines.getLast());
        String tokenHash = ActionRegressionService.sha256Hex(TOKEN.getBytes(StandardCharsets.UTF_8));
        String proofHash = ActionRegressionService.sha256Hex(PROOF.getBytes(StandardCharsets.UTF_8));

        assertThat(issued.path("event").asText()).isEqualTo("probe_issued");
        assertThat(issued.path("service").asText()).isEqualTo("skillpilot-action-regression");
        assertThat(issued.path("transport").asText()).isEqualTo("claude-mcp");
        assertThat(issued.path("probe_id").asText()).isEqualTo(PROBE_ID);
        assertThat(issued.path("token_sha256").asText()).isEqualTo(tokenHash);
        assertThat(issued.path("proof_sha256").asText()).isEqualTo(proofHash);
        assertThat(issued.path("ts").asText()).isNotBlank();
        assertThat(issued.has("token")).isFalse();
        assertThat(issued.has("proof")).isFalse();
        assertThat(issued.has("proof_valid")).isFalse();

        assertThat(verified.path("event").asText()).isEqualTo("probe_verified");
        assertThat(verified.path("transport").asText()).isEqualTo("claude-mcp");
        assertThat(verified.path("probe_id").asText()).isEqualTo(PROBE_ID);
        assertThat(verified.path("token_sha256").asText()).isEqualTo(tokenHash);
        assertThat(verified.path("proof_sha256").asText()).isEqualTo(proofHash);
        assertThat(verified.path("verify_called").asBoolean()).isTrue();
        assertThat(verified.path("proof_valid").asBoolean()).isTrue();
        assertThat(verified.has("token")).isFalse();
        assertThat(verified.has("proof")).isFalse();
    }
}
