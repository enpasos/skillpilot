package com.skillpilot.backend.claude.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import com.skillpilot.backend.oauth.AuthenticatedClientPolicyConfiguration;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * The retired /oauth2 Claude flow must not start with the production profile policy.
 * Supported public-client PKCE, refresh and revocation flows are tested separately
 * in the Claude V1 OAuth integration suites.
 */
class ClaudeOAuthFlowIntegrationTest {

    private static final String LEGACY_POLICY_REJECTION =
            "The legacy public Claude lane must be disabled when authenticated OAuth clients are required.";

    @Test
    void retiredLegacyFlowCannotStartWithProductionProfilePolicy() {
        productionPolicyRunner()
                .withPropertyValues("skillpilot.claude.enabled=true")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseMessage(LEGACY_POLICY_REJECTION);
                });
    }

    @Test
    void deprecatedFalseSwitchDoesNotReopenRetiredLegacyFlow() {
        productionPolicyRunner()
                .withPropertyValues(
                        "skillpilot.claude.enabled=true",
                        "skillpilot.oauth.authenticated-clients-required=false")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseMessage(LEGACY_POLICY_REJECTION);
                });
    }

    @Test
    void disabledLegacyFlowLeavesProductionProfilePolicyActive() {
        productionPolicyRunner()
                .withPropertyValues("skillpilot.claude.enabled=false")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(AuthenticatedClientPolicy.class);
                    assertThat(context.getBean(AuthenticatedClientPolicy.class).isRequired()).isTrue();
                    assertThat(context).doesNotHaveBean("claudeRegisteredClientRepository");
                    assertThat(context).doesNotHaveBean("claudeAuthorizationService");
                    assertThat(context).doesNotHaveBean("registerClaudeCimdClient");
                    assertThat(context.getBean(JdbcTemplate.class).queryForObject(
                            "SELECT authenticated_required FROM oauth_client_security_policy WHERE id = 1",
                            Boolean.class)).isTrue();
                    verifyNoInteractions(context.getBean(ClaudeCoachConnectionService.class));
                });
    }

    private WebApplicationContextRunner productionPolicyRunner() {
        return new WebApplicationContextRunner()
                .withUserConfiguration(TestApplication.class)
                .withPropertyValues(
                        "spring.datasource.url=jdbc:h2:mem:claude-legacy-policy-" + UUID.randomUUID()
                                + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
                        "spring.datasource.driver-class-name=org.h2.Driver",
                        "spring.datasource.username=sa",
                        "spring.datasource.password=",
                        "spring.liquibase.enabled=true",
                        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
                        "skillpilot.claude.mcp.enabled=false",
                        "skillpilot.claude.secure-cookie=false",
                        "skillpilot.public-base-url=https://skillpilot.test",
                        "skillpilot.claude.mcp-url=https://skillpilot.test/api/claude/mcp",
                        "skillpilot.claude.oauth.protected-resource-metadata="
                                + "https://skillpilot.test/api/claude/oauth/protected-resource");
    }

    @TestConfiguration(proxyBeanMethods = false)
    @EnableAutoConfiguration(exclude = {
            HibernateJpaAutoConfiguration.class,
            DataJpaRepositoriesAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import({AuthenticatedClientPolicyConfiguration.class, ClaudeOAuthConfiguration.class})
    static class TestApplication {

        @Bean
        ClaudeCoachConnectionService claudeCoachConnectionService() {
            return mock(ClaudeCoachConnectionService.class);
        }
    }
}
