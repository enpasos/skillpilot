package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.JdbcTemplateAutoConfiguration;
import org.springframework.boot.liquibase.autoconfigure.LiquibaseAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.jdbc.core.JdbcOperations;

/** The hermetic package consumer retains the real JDBC security policy in its H2 runtime. */
class PackageConsumerSecurityInitializationTest {
    private ApplicationContextRunner contextRunner() {
        return new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(
                        DataSourceAutoConfiguration.class,
                        DataSourceTransactionManagerAutoConfiguration.class,
                        JdbcTemplateAutoConfiguration.class,
                        LiquibaseAutoConfiguration.class))
                .withUserConfiguration(AuthenticatedClientPolicyConfiguration.class)
                .withPropertyValues(
                        "spring.datasource.url=jdbc:h2:mem:consumer_smoke_" + UUID.randomUUID()
                                + ";DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
                        "spring.datasource.driver-class-name=org.h2.Driver",
                        "spring.datasource.username=sa",
                        "spring.datasource.password=",
                        "spring.liquibase.enabled=true",
                        "spring.liquibase.change-log=classpath:db/changelog/changes/030-add-oauth-client-security.yaml");
    }

    @Test
    void productionMigrationInitializesPolicyAndReplayStorageBeforeSecurityBeans() {
        contextRunner().run(context -> {
            assertThat(context).hasNotFailed();
            JdbcOperations jdbc = context.getBean(JdbcOperations.class);
            assertThat(jdbc.queryForObject(
                    "SELECT authenticated_required FROM oauth_client_security_policy WHERE id=1", Boolean.class))
                    .isTrue(); // Real independent-profile startup fences older compatibility binaries.
            assertThatCode(context.getBean(AuthenticatedClientPolicy.class)::assertCompatible)
                    .doesNotThrowAnyException();
            JdbcOAuthClientAssertionReplayStore replay = context.getBean(JdbcOAuthClientAssertionReplayStore.class);
            Instant retainUntil = Instant.now().plusSeconds(60);
            assertThat(replay.consume("synthetic-client", "one-use-assertion", retainUntil, 10)).isTrue();
            assertThat(replay.consume("synthetic-client", "one-use-assertion", retainUntil, 10)).isFalse();
            assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM oauth_client_assertion_replay", Long.class))
                    .isEqualTo(1L);
        });
    }

    @Test
    void missingMigrationRetainsFailClosedStartup() {
        contextRunner().withPropertyValues("spring.liquibase.enabled=false").run(context -> {
            assertThat(context).hasFailed();
            assertThat(context.getStartupFailure())
                    .hasStackTraceContaining("OAUTH_CLIENT_SECURITY_POLICY")
                    .hasStackTraceContaining("not found");
        });
    }
}
