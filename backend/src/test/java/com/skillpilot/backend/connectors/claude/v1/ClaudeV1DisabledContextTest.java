package com.skillpilot.backend.connectors.claude.v1;

import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CapabilityService;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1McpContractAdapter;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1SessionCoordinator;
import com.skillpilot.backend.connectors.claude.v1.observability.ClaudeV1Telemetry;
import com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1CimdMetadataValidator;
import com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1OAuthMetadataController;
import com.skillpilot.backend.connectors.claude.v1.oauth.ClaudeV1TokenLifecycleService;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1ConnectionController;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Proves the lane is genuinely inert while switched off.
 *
 * <p>Bean absence alone is not enough: a component-scanned controller would still register its
 * routes, and those routes would then be served by the application-wide default security chain. So
 * this also asserts that no request mapping mentions the Claude v1 internal prefix.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
// This property set is used by exactly one class, so caching its context past the class
// only holds heap that the rest of the suite needs.
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(properties = {
        ClaudeV1TestProperties.DISABLED,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.DISABLED_DATASOURCE,
        "skillpilot.openai.coach.v1.enabled=false"
})
class ClaudeV1DisabledContextTest {

    private static final List<Class<?>> CLAUDE_V1_BEAN_TYPES = List.of(
            ClaudeV1ConnectionController.class,
            ClaudeV1OAuthMetadataController.class,
            ClaudeV1BindingService.class,
            ClaudeV1ConnectionRepository.class,
            ClaudeV1IdempotencyRepository.class,
            ClaudeV1CapabilityService.class,
            ClaudeV1SessionCoordinator.class,
            ClaudeV1McpContractAdapter.class,
            ClaudeV1CimdMetadataValidator.class,
            ClaudeV1TokenLifecycleService.class,
            ClaudeV1Telemetry.class);

    private static final List<String> CLAUDE_V1_BEAN_NAMES = List.of(
            "claudeV1AuthorizationServerSecurityFilterChain",
            "claudeV1ResourceServerSecurityFilterChain",
            "claudeV1McpRouterFunction",
            "claudeV1McpServerRegistration",
            "claudeV1RegisteredClientRepository",
            "claudeV1AuthorizationService",
            "claudeV1OpaqueTokenIntrospector",
            "claudeV1ClientRegistrar");

    @Autowired
    private ApplicationContext context;

    @Autowired
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

    @Test
    void propertiesBeanExistsAndReportsDisabled() {
        // The properties holder is inert and stays registered so the rest of the application can
        // observe that the lane is off.
        assertFalse(context.getBean(ClaudeV1Properties.class).isEnabled());
    }

    @Test
    void noClaudeV1BeanIsRegistered() {
        for (Class<?> beanType : CLAUDE_V1_BEAN_TYPES) {
            assertEquals(
                    0,
                    context.getBeanNamesForType(beanType).length,
                    () -> "Disabled lane must not register " + beanType.getSimpleName());
        }
        for (String beanName : CLAUDE_V1_BEAN_NAMES) {
            assertFalse(
                    context.containsBean(beanName),
                    () -> "Disabled lane must not register bean " + beanName);
        }
    }

    @Test
    void noClaudeV1RouteIsMapped() {
        List<String> mappedClaudePatterns = requestMappingHandlerMapping.getHandlerMethods().keySet().stream()
                .map(RequestMappingInfo::toString)
                .filter(pattern -> pattern.contains(ClaudeV1Contract.INTERNAL_BASE_PATH))
                .toList();
        assertTrue(
                mappedClaudePatterns.isEmpty(),
                () -> "Disabled lane must expose no route; found " + mappedClaudePatterns);
    }
}
