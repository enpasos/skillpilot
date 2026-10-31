package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** The operator's emergency off switch keeps the previously published core contract. */
@SpringBootTest(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "skillpilot.completion.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:completion-disabled-contract;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
@ActiveProfiles("test")
class ClaudeV1CompletionDisabledContractTest {
    @Autowired ClaudeV1McpContractAdapter adapter;

    @Test void explicitOperatorDisablePublishesExactlyTheFourteenCoreTools() {
        assertThat(adapter.toolSpecifications()).hasSize(14)
                .extracting(specification -> specification.tool().name())
                .containsExactlyInAnyOrderElementsOf(ClaudeV1Contract.ALL_TOOL_NAMES)
                .doesNotContain(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                        ClaudeV1McpContractAdapter.TOOL_CHOOSE_COMPLETION_ROUTE);
    }
}
