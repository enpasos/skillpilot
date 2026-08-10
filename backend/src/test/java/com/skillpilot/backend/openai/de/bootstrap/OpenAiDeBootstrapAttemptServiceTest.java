package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBootstrapAttemptStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapability;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapabilityStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapLaunchAttempt;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapCapabilityRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapLaunchAttemptRepository;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeBootstrapAttemptServiceTest {

    private static final String SKILLPILOT_ID = "2c089f6b-615d-4c14-8225-82a973f842cf";
    private static final String OTHER_SKILLPILOT_ID = "cf411b27-5fa7-4a5d-a155-669864856073";
    private static final String CLIENT_REQUEST_ID = "0f967c3b-114e-4b83-891d-cde9863d8fb3";
    private static final String AUTHORIZATION_REFERENCE = "stable-sas-authorization-id";
    private static final String SESSION_ID = "sps_" + "A".repeat(43);
    private static final Instant START = Instant.parse("2026-08-09T10:00:00Z");

    private OpenAiDeBootstrapCapabilityRepository capabilities;
    private OpenAiDeBootstrapLaunchAttemptRepository attempts;
    private LearnerRepository learners;
    private OpenAiDeCoachConnectionService connectionService;
    private OpenAiDeBootstrapAuthorizationVerifier verifier;
    private OpenAiDeBootstrapCrypto crypto;
    private OpenAiDeProperties properties;
    private MutableClock clock;
    private AtomicReference<OpenAiDeBootstrapLaunchAttempt> persistedAttempt;
    private String rawCapability;
    private OpenAiDeBootstrapCapability capability;
    private OpenAiDeBootstrapAttemptService service;

    @BeforeEach
    void setUp() {
        capabilities = mock(OpenAiDeBootstrapCapabilityRepository.class);
        attempts = mock(OpenAiDeBootstrapLaunchAttemptRepository.class);
        learners = mock(LearnerRepository.class);
        connectionService = mock(OpenAiDeCoachConnectionService.class);
        verifier = mock(OpenAiDeBootstrapAuthorizationVerifier.class);
        crypto = new OpenAiDeBootstrapCrypto(
                "attempt-service-test-secret".getBytes(StandardCharsets.UTF_8),
                new SecureRandom());
        properties = properties();
        clock = new MutableClock(START);
        persistedAttempt = new AtomicReference<>();

        rawCapability = crypto.issueCapability();
        var fingerprint = crypto.capabilityFingerprint(rawCapability);
        capability = capability(fingerprint);
        when(capabilities.findById(fingerprint.value())).thenReturn(Optional.of(capability));
        when(capabilities.findByFingerprintForUpdate(fingerprint.value()))
                .thenReturn(Optional.of(capability));
        when(capabilities.saveAndFlush(any(OpenAiDeBootstrapCapability.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(attempts.findByCapabilityFingerprintForUpdate(fingerprint.value()))
                .thenAnswer(invocation -> Optional.ofNullable(persistedAttempt.get()));
        when(attempts.findByIdempotencyTupleForUpdate(
                        OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                        AUTHORIZATION_REFERENCE,
                        CLIENT_REQUEST_ID))
                .thenAnswer(invocation -> Optional.ofNullable(persistedAttempt.get()));
        when(attempts.saveAndFlush(any(OpenAiDeBootstrapLaunchAttempt.class)))
                .thenAnswer(invocation -> {
                    OpenAiDeBootstrapLaunchAttempt attempt = invocation.getArgument(0);
                    persistedAttempt.set(attempt);
                    return attempt;
                });

        Learner learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum("curriculum");
        learner.setPersonalCurriculum("{}");
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.of(learner));
        when(connectionService.createLaunch(anyString(), any()))
                .thenAnswer(invocation -> successfulLaunch(clock.instant()));

        service = new OpenAiDeBootstrapAttemptService(
                capabilities,
                attempts,
                learners,
                connectionService,
                crypto,
                verifier,
                properties,
                new ObjectMapper().findAndRegisterModules(),
                transactionManager(),
                clock);
    }

    @Test
    void firstRequestCreatesOneRandomSessionAndExactRetryDecryptsStoredResponse() {
        OpenAiDeBootstrapLaunchResponse first = service.launch(rawCapability, request(SKILLPILOT_ID));
        OpenAiDeBootstrapLaunchResponse retry = service.launch(rawCapability, request(SKILLPILOT_ID));

        assertThat(retry).isEqualTo(first);
        assertThat(first.startMessage()).isEqualTo(
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: " + SESSION_ID);
        verify(connectionService, times(1)).createLaunch(anyString(), any());
        verify(learners, times(1)).findBySkillpilotIdForUpdate(SKILLPILOT_ID);

        OpenAiDeBootstrapLaunchAttempt attempt = persistedAttempt.get();
        assertThat(attempt.getStatus()).isEqualTo(OpenAiDeBootstrapAttemptStatus.SUCCEEDED);
        assertThat(attempt.getRequestHmac()).matches("^[0-9a-f]{64}$");
        assertThat(attempt.getResponseKeyId()).isEqualTo(OpenAiDeBootstrapCrypto.DELIVERY_KEY_ID);
        assertThat(attempt.getResponseCiphertext())
                .doesNotContain(SKILLPILOT_ID, SESSION_ID, "learningSessionId", "startMessage");
        assertThat(attempt.getResponseExpiresAt()).isEqualTo(START.plusSeconds(900));
        assertThat(attempt.getRecordExpiresAt()).isEqualTo(START.plusSeconds(86_400));
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
    }

    @Test
    void knownLearnerWithoutCurriculumOrPersonalizationCanStart() {
        Learner learner = new Learner();
        learner.setSkillpilotId(SKILLPILOT_ID);
        learner.setSelectedCurriculum(null);
        learner.setPersonalCurriculum(null);
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID))
                .thenReturn(Optional.of(learner));

        OpenAiDeBootstrapLaunchResponse response =
                service.launch(rawCapability, request(SKILLPILOT_ID));

        assertThat(response.status()).isEqualTo(OpenAiDeBootstrapConstants.RESPONSE_STATUS);
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.SUCCEEDED);
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
        verify(connectionService, times(1)).createLaunch(eq(SKILLPILOT_ID), any());
    }

    @Test
    void bothTransactionsUseCapabilityThenAttemptThenLearnerLockOrder() {
        service.launch(rawCapability, request(SKILLPILOT_ID));

        String fingerprint = crypto.capabilityFingerprint(rawCapability).value();
        InOrder locks = inOrder(capabilities, attempts, learners);
        locks.verify(capabilities).findByFingerprintForUpdate(fingerprint);
        locks.verify(attempts).findByCapabilityFingerprintForUpdate(fingerprint);
        locks.verify(capabilities).findByFingerprintForUpdate(fingerprint);
        locks.verify(attempts).findByCapabilityFingerprintForUpdate(fingerprint);
        locks.verify(learners).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
    }

    @Test
    void bindingExtendsCapabilityRetentionThroughTheAttemptTombstone() {
        clock.advance(Duration.ofMinutes(9));

        service.launch(rawCapability, request(SKILLPILOT_ID));

        Instant retainedUntil = START.plus(Duration.ofMinutes(9)).plus(Duration.ofHours(24));
        assertThat(persistedAttempt.get().getRecordExpiresAt()).isEqualTo(retainedUntil);
        assertThat(capability.getRecordExpiresAt()).isEqualTo(retainedUntil);
    }

    @Test
    void sameCapabilityAndRequestIdWithDifferentLearnerIsIrreversibleConflict() {
        service.launch(rawCapability, request(SKILLPILOT_ID));

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(OTHER_SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED);

        verify(connectionService, times(1)).createLaunch(anyString(), any());
        verify(learners, never()).findBySkillpilotIdForUpdate(OTHER_SKILLPILOT_ID);
    }

    @Test
    void unknownProfileCommitsStableTerminalAttemptBeforeReturningNeutralError() {
        when(learners.findBySkillpilotIdForUpdate(SKILLPILOT_ID)).thenReturn(Optional.empty());

        assertProfileUnavailable();
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE.name());
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);

        assertProfileUnavailable();
        verify(connectionService, never()).createLaunch(anyString(), any());
        verify(learners, times(1)).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
    }

    @Test
    void transientFailureLeavesBoundAndExactRetryCanFinishOnce() {
        when(connectionService.createLaunch(anyString(), any()))
                .thenThrow(new IllegalStateException("transient core failure"))
                .thenAnswer(invocation -> successfulLaunch(clock.instant()));

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .satisfies(exception -> {
                    assertThat(exception.code())
                            .isEqualTo(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
                    assertThat(exception.getCause()).isInstanceOf(IllegalStateException.class);
                });
        assertThat(persistedAttempt.get().getStatus()).isEqualTo(OpenAiDeBootstrapAttemptStatus.BOUND);

        OpenAiDeBootstrapLaunchResponse response = service.launch(rawCapability, request(SKILLPILOT_ID));

        assertThat(response.status()).isEqualTo(OpenAiDeBootstrapConstants.RESPONSE_STATUS);
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.SUCCEEDED);
        verify(connectionService, times(2)).createLaunch(anyString(), any());
    }

    @Test
    void deterministicCoreRejectionCommitsStableProfileFailureAfterRollback() {
        when(connectionService.createLaunch(anyString(), any()))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "deterministic learner state rejection"));

        assertProfileUnavailable();
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE.name());
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);

        assertProfileUnavailable();
        verify(connectionService, times(1)).createLaunch(anyString(), any());
    }

    @Test
    void expiredBoundAttemptBecomesStableTerminalAndNeverStartsLater() {
        when(connectionService.createLaunch(anyString(), any()))
                .thenThrow(new IllegalStateException("transient core failure"));

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.BOUND);
        clock.advance(Duration.ofMinutes(15));

        for (int retry = 0; retry < 2; retry++) {
            assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                    .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                    .extracting(OpenAiDeBootstrapException::code)
                    .isEqualTo(OpenAiDeBootstrapErrorCode.RETRY_EXPIRED);
        }

        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.RETRY_EXPIRED.name());
        assertThat(capability.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
        verify(connectionService, times(1)).createLaunch(anyString(), any());
    }

    @Test
    void expiredDeliveryNeverCreatesAReplacementSession() {
        service.launch(rawCapability, request(SKILLPILOT_ID));
        clock.advance(Duration.ofMinutes(15));

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.DELIVERY_EXPIRED);

        assertThat(persistedAttempt.get().getResponseCiphertext()).isNull();
        verify(connectionService, times(1)).createLaunch(anyString(), any());
    }

    @Test
    void oauthRevocationPreventsReplayWithoutResolvingLearnerAgain() {
        service.launch(rawCapability, request(SKILLPILOT_ID));
        doThrow(new OpenAiDeBootstrapException(
                        OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID))
                .when(verifier)
                .requireActiveAuthorization(AUTHORIZATION_REFERENCE);

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);

        assertThat(capability.getStatus())
                .isEqualTo(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
        assertThat(capability.getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());
        assertThat(persistedAttempt.get().getResponseExpiresAt()).isNull();
        assertThat(persistedAttempt.get().getResponseKeyId()).isNull();
        assertThat(persistedAttempt.get().getResponseNonce()).isNull();
        assertThat(persistedAttempt.get().getResponseCiphertext()).isNull();

        reset(verifier);
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);

        verify(connectionService, times(1)).createLaunch(anyString(), any());
        verify(learners, times(1)).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
    }

    @Test
    void authorizationRevokedWhileBindingTerminalizesIssuedCapabilityAfterRollback() {
        doNothing()
                .doThrow(new OpenAiDeBootstrapException(
                        OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID))
                .when(verifier)
                .requireActiveAuthorization(AUTHORIZATION_REFERENCE);

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
        assertThat(persistedAttempt.get()).isNull();
        assertThat(capability.getStatus())
                .isEqualTo(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
        assertThat(capability.getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());

        reset(verifier);
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
        verify(connectionService, never()).createLaunch(anyString(), any());
    }

    @Test
    void authorizationRevokedAfterBindingCommitsTerminalStateInsideTransactionB() {
        doNothing()
                .doNothing()
                .doThrow(new OpenAiDeBootstrapException(
                        OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID))
                .when(verifier)
                .requireActiveAuthorization(AUTHORIZATION_REFERENCE);

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getTerminalCode())
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());
        assertThat(capability.getStatus())
                .isEqualTo(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);

        reset(verifier);
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
        verify(learners, never()).findBySkillpilotIdForUpdate(SKILLPILOT_ID);
        verify(connectionService, never()).createLaunch(anyString(), any());
    }

    @Test
    void policyBlockTerminalizesCiphertextAndCannotReviveAfterPolicyReopens() {
        service.launch(rawCapability, request(SKILLPILOT_ID));
        properties.setWritesEnabled(false);

        assertPolicyUnavailable();
        assertThat(capability.getTerminalCode()).isEqualTo("POLICY_BLOCKED");
        assertThat(capability.getStatus())
                .isEqualTo(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
        assertThat(persistedAttempt.get().getStatus())
                .isEqualTo(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        assertThat(persistedAttempt.get().getResponseCiphertext()).isNull();

        properties.setWritesEnabled(true);
        assertPolicyUnavailable();
        verify(connectionService, times(1)).createLaunch(anyString(), any());
    }

    private void assertProfileUnavailable() {
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE);
    }

    private void assertPolicyUnavailable() {
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.launch(rawCapability, request(SKILLPILOT_ID)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
    }

    private OpenAiDeBootstrapCapability capability(OpenAiDeBootstrapCrypto.Fingerprint fingerprint) {
        OpenAiDeBootstrapCapability issue = new OpenAiDeBootstrapCapability();
        issue.setCapabilityFingerprint(fingerprint.value());
        issue.setFingerprintKeyId(fingerprint.keyId());
        issue.setSchemaVersion(OpenAiDeBootstrapConstants.CAPABILITY_SCHEMA_VERSION);
        issue.setContractMajor(OpenAiDeBootstrapConstants.CONTRACT_MAJOR);
        issue.setPurpose(OpenAiDeBootstrapConstants.PURPOSE);
        issue.setOauthAuthorizationReference(AUTHORIZATION_REFERENCE);
        issue.setOauthClientId(properties().getOauth().getClientId());
        issue.setResource(OpenAiDeBootstrapConstants.RESOURCE);
        issue.setScopes(String.join(" ", OpenAiDeBootstrapConstants.REQUIRED_SCOPES));
        issue.setProviderNoticeVersion(OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION);
        issue.setSourceMajorDecision(OpenAiDeBootstrapConstants.ALLOW_SOURCE_MAJOR_DECISION);
        issue.setPolicyRevision(OpenAiDeBootstrapConstants.POLICY_REVISION);
        issue.setIssuanceRevision("test-build");
        issue.setIssuedAt(START);
        issue.setExpiresAt(START.plus(OpenAiDeBootstrapConstants.CAPABILITY_TTL));
        issue.setRecordExpiresAt(START.plus(OpenAiDeBootstrapConstants.TOMBSTONE_TTL));
        issue.setStatus(OpenAiDeBootstrapCapabilityStatus.ISSUED);
        return issue;
    }

    private static OpenAiDeBootstrapLaunchRequest request(String skillpilotId) {
        return new OpenAiDeBootstrapLaunchRequest(
                OpenAiDeBootstrapConstants.REQUEST_SCHEMA_VERSION,
                skillpilotId,
                "de",
                new OpenAiDeBootstrapLaunchRequest.LaunchIntent(
                        OpenAiDeBootstrapConstants.LAUNCH_INTENT),
                OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                CLIENT_REQUEST_ID);
    }

    private static OpenAiDeLaunchResponse successfulLaunch(Instant now) {
        return new OpenAiDeLaunchResponse(
                "Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId: " + SESSION_ID,
                "https://chatgpt.com/",
                SESSION_ID,
                now.plus(Duration.ofHours(24)));
    }

    private static OpenAiDeProperties properties() {
        OpenAiDeProperties value = new OpenAiDeProperties();
        value.setWritesEnabled(true);
        value.setOauthResource(OpenAiDeBootstrapConstants.RESOURCE);
        value.setServerBuild("test-build");
        value.getOauth().setClientId("openai-v1-confidential-client");
        return value;
    }

    private static DataSourceTransactionManager transactionManager() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:bootstrap-attempt-" + System.nanoTime());
        dataSource.setUsername("sa");
        return new DataSourceTransactionManager(dataSource);
    }

    private static final class MutableClock extends Clock {

        private Instant value;

        private MutableClock(Instant value) {
            this.value = value;
        }

        void advance(Duration duration) {
            value = value.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            if (!ZoneOffset.UTC.equals(zone)) {
                throw new IllegalArgumentException("Only UTC is supported by this test clock.");
            }
            return this;
        }

        @Override
        public Instant instant() {
            return value;
        }
    }
}
