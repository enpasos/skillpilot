package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import java.time.Duration;
import org.junit.jupiter.api.Test;

class ClaudeV1CompletionReceiptCapabilityTest {
    private static final String SESSION = "spc_" + "A".repeat(43);
    private static final String OTHER = "spc_" + "B".repeat(43);
    private ClaudeV1CapabilityService service(Duration ttl) {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setSigningSecret(ClaudeV1TestProperties.SIGNING_SECRET_VALUE);
        properties.setCapabilitySecret(ClaudeV1TestProperties.CAPABILITY_SECRET_VALUE);
        properties.setCapabilityTtl(ttl);
        return new ClaudeV1CapabilityService(properties);
    }
    @Test void receiptBindsSessionAndExactContractGenerationAndCannotBeForged() {
        var service = service(Duration.ofMinutes(2));
        String capability = service.mintCompletionContractCapability(SESSION, "a".repeat(64));
        service.verifyCompletionContractCapability(capability, SESSION, "a".repeat(64));
        assertThatThrownBy(() -> service.verifyCompletionContractCapability(capability, OTHER, "a".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
        assertThatThrownBy(() -> service.verifyCompletionContractCapability(capability, SESSION, "b".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
        assertThatThrownBy(() -> service.verifyCompletionContractCapability("forged", SESSION, "a".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
    }
    @Test void expiredReceiptAndDifferentCapabilityPurposeCannotAuthorizeConfirmation() {
        var expired = service(Duration.ofSeconds(-1));
        String receipt = expired.mintCompletionContractCapability(SESSION, "a".repeat(64));
        assertThatThrownBy(() -> expired.verifyCompletionContractCapability(receipt, SESSION, "a".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
        var service = service(Duration.ofMinutes(2));
        String evaluation = service.mintExamEvaluationCapability(SESSION, "a".repeat(64), 7);
        assertThatThrownBy(() -> service.verifyCompletionContractCapability(evaluation, SESSION, "a".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
        assertThatThrownBy(() -> service.verifyExamEvaluationCapability(
                service.mintCompletionContractCapability(SESSION, "a".repeat(64)), SESSION, "a".repeat(64)))
                .isInstanceOf(ClaudeV1CapabilityService.CapabilityException.class);
    }
}
