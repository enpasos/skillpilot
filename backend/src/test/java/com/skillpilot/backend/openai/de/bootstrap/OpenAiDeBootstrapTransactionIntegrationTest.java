package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBootstrapAttemptStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapabilityStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapLaunchAttempt;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapCapabilityRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapLaunchAttemptRepository;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest(
        classes = OpenAiDeBootstrapTransactionIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.NONE)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-bootstrap-transaction;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.task.scheduling.enabled=false",
        "skillpilot.security.signing-secret=bootstrap-transaction-integration-secret",
        "skillpilot.openai.coach.v1.enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.writes-enabled=true",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.client-id=openai-v1-confidential-client",
        "skillpilot.openai.coach.v1.server-build=integration-test-build"
})
class OpenAiDeBootstrapTransactionIntegrationTest {

    private static final String SKILLPILOT_ID = "2c089f6b-615d-4c14-8225-82a973f842cf";
    private static final String AUTHORIZATION_REFERENCE = "stable-sas-authorization-id";
    private static final String CLIENT_REQUEST_ID = "0f967c3b-114e-4b83-891d-cde9863d8fb3";
    private static final String SESSION_ID = "sps_" + "Z".repeat(43);

    @Autowired
    private OpenAiDeBootstrapCapabilityService capabilityService;

    @Autowired
    private OpenAiDeBootstrapAttemptService attemptService;

    @Autowired
    private OpenAiDeBootstrapLaunchAttemptRepository attempts;

    @Autowired
    private OpenAiDeBootstrapCapabilityRepository capabilities;

    @Autowired
    private LearnerRepository learners;

    @Autowired
    private OpenAiDeCoachConnectionService connectionService;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void clearBootstrapState() {
        jdbc.update("delete from openai_de_bootstrap_launch_attempt");
        jdbc.update("delete from openai_de_bootstrap_capability");
        jdbc.update("delete from openai_de_learning_session");
        jdbc.update("delete from learner");
        reset(connectionService);
    }

    @Test
    void transactionACommitsBeforeTransientTransactionBAndRetryReplaysEncryptedResult() {
        Learner learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("curriculum");
        learner.setPersonalCurriculum("{}");
        learners.saveAndFlush(learner);

        var issued = capabilityService.issueCapability(
                AUTHORIZATION_REFERENCE,
                new OpenAiDeBootstrapCapabilityIssueRequest(
                        OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                        true,
                        null));
        OpenAiDeBootstrapLaunchRequest request = request();

        when(connectionService.createLaunch(anyString(), any()))
                .thenThrow(new IllegalStateException("transient core failure"));
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> attemptService.launch(issued.setupCapability(), request))
                .satisfies(exception -> {
                    assertThat(exception.code())
                            .isEqualTo(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
                    assertThat(exception.getCause()).isInstanceOf(IllegalStateException.class);
                });

        OpenAiDeBootstrapLaunchAttempt bound = attempts.findAll().getFirst();
        assertThat(bound.getStatus()).isEqualTo(OpenAiDeBootstrapAttemptStatus.BOUND);
        assertThat(bound.getResponseCiphertext()).isNull();

        reset(connectionService);
        when(connectionService.createLaunch(anyString(), any())).thenAnswer(invocation -> {
            Instant now = Instant.now();
            return new OpenAiDeLaunchResponse(
                    "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: " + SESSION_ID,
                    "https://chatgpt.com/",
                    SESSION_ID,
                    now.plus(Duration.ofHours(24)));
        });
        OpenAiDeBootstrapLaunchResponse success =
                attemptService.launch(issued.setupCapability(), request);
        OpenAiDeBootstrapLaunchResponse replay =
                attemptService.launch(issued.setupCapability(), request);

        assertThat(replay).isEqualTo(success);
        verify(connectionService, times(1)).createLaunch(anyString(), any());
        OpenAiDeBootstrapLaunchAttempt completed = attempts.findAll().getFirst();
        assertThat(completed.getStatus()).isEqualTo(OpenAiDeBootstrapAttemptStatus.SUCCEEDED);
        assertThat(completed.getResponseCiphertext())
                .isNotBlank()
                .doesNotContain(SKILLPILOT_ID, SESSION_ID, "learningSessionId", "startMessage");
        assertThat(completed.getRequestHmac()).doesNotContain(SKILLPILOT_ID);

        String persistedFingerprint = jdbc.queryForObject(
                "select capability_fingerprint from openai_de_bootstrap_capability",
                String.class);
        assertThat(persistedFingerprint)
                .isEqualTo(capabilities.findAll().getFirst().getCapabilityFingerprint())
                .isNotEqualTo(issued.setupCapability());
        Integer forbiddenPlaintextColumns = jdbc.queryForObject(
                """
                select count(*) from information_schema.columns
                 where table_name in ('OPENAI_DE_BOOTSTRAP_CAPABILITY',
                                      'OPENAI_DE_BOOTSTRAP_LAUNCH_ATTEMPT')
                   and column_name in ('SKILLPILOT_ID', 'LEARNING_SESSION_ID',
                                       'SETUP_CAPABILITY', 'REQUEST_BODY', 'START_MESSAGE')
                """,
                Integer.class);
        assertThat(forbiddenPlaintextColumns).isZero();
    }

    @Test
    void deterministicFourHundredRejectionCommitsTerminalStateAfterRollback() {
        Learner learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("curriculum");
        learner.setPersonalCurriculum("{}");
        learners.saveAndFlush(learner);

        var issued = capabilityService.issueCapability(
                AUTHORIZATION_REFERENCE,
                new OpenAiDeBootstrapCapabilityIssueRequest(
                        OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                        true,
                        null));
        when(connectionService.createLaunch(anyString(), any()))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "deterministic learner state rejection"));

        for (int retry = 0; retry < 2; retry++) {
            assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                    .isThrownBy(() -> attemptService.launch(issued.setupCapability(), request()))
                    .extracting(OpenAiDeBootstrapException::code)
                    .isEqualTo(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE);
        }

        OpenAiDeBootstrapLaunchAttempt attempt = attempts.findAll().getFirst();
        assertThat(attempt.getStatus()).isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(attempt.getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE.name());
        assertThat(capabilities.findAll().getFirst().getStatus())
                .isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
        verify(connectionService, times(1)).createLaunch(anyString(), any());
    }

    private static OpenAiDeBootstrapLaunchRequest request() {
        return new OpenAiDeBootstrapLaunchRequest(
                OpenAiDeBootstrapConstants.REQUEST_SCHEMA_VERSION,
                SKILLPILOT_ID,
                "de",
                new OpenAiDeBootstrapLaunchRequest.LaunchIntent("CURRENT_UNIT"),
                OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                CLIENT_REQUEST_ID);
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration
    @EnableConfigurationProperties(OpenAiDeProperties.class)
    @EntityScan(basePackages = "com.skillpilot.backend.domain")
    @EnableJpaRepositories(basePackages = "com.skillpilot.backend.repository")
    @Import({
            OpenAiDeBootstrapCrypto.class,
            OpenAiDeBootstrapCapabilityService.class,
            OpenAiDeBootstrapAttemptService.class
    })
    static class TestApplication {

        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper().findAndRegisterModules();
        }

        @Bean
        OpenAiDeBootstrapAuthorizationVerifier openAiDeBootstrapAuthorizationVerifier() {
            return reference -> {
                if (!AUTHORIZATION_REFERENCE.equals(reference)) {
                    throw new OpenAiDeBootstrapException(
                            OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
                }
            };
        }

        @Bean
        OpenAiDeBootstrapIssuanceRateLimiter openAiDeBootstrapIssuanceRateLimiter() {
            return mock(OpenAiDeBootstrapIssuanceRateLimiter.class);
        }

        @Bean
        OpenAiDeCoachConnectionService openAiDeCoachConnectionService() {
            return mock(OpenAiDeCoachConnectionService.class);
        }
    }
}
