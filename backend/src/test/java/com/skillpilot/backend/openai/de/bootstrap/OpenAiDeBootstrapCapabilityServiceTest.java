package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.domain.OpenAiDeBootstrapCapability;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapabilityStatus;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.repository.OpenAiDeBootstrapCapabilityRepository;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

class OpenAiDeBootstrapCapabilityServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-09T10:00:00Z");
    private static final String AUTHORIZATION_REFERENCE = "stable-sas-authorization-id";

    private OpenAiDeBootstrapCapabilityRepository capabilities;
    private OpenAiDeBootstrapAuthorizationVerifier verifier;
    private OpenAiDeBootstrapIssuanceRateLimiter issuanceRateLimiter;
    private OpenAiDeBootstrapCapabilityService service;

    @BeforeEach
    void setUp() {
        capabilities = mock(OpenAiDeBootstrapCapabilityRepository.class);
        when(capabilities.saveAndFlush(any(OpenAiDeBootstrapCapability.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        verifier = mock(OpenAiDeBootstrapAuthorizationVerifier.class);
        issuanceRateLimiter = mock(OpenAiDeBootstrapIssuanceRateLimiter.class);

        OpenAiDeProperties properties = properties();
        service = new OpenAiDeBootstrapCapabilityService(
                capabilities,
                new OpenAiDeBootstrapCrypto(
                        "capability-service-test-secret".getBytes(StandardCharsets.UTF_8),
                        new SecureRandom()),
                verifier,
                issuanceRateLimiter,
                properties,
                transactionManager(),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void issuerPersistsLearnerNeutralOpaqueHandleRecordWithExactPolicyAndTtl() {
        var result = service.issueCapability(
                AUTHORIZATION_REFERENCE,
                new OpenAiDeBootstrapCapabilityIssueRequest(
                        OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                        true,
                        null));

        ArgumentCaptor<OpenAiDeBootstrapCapability> persisted =
                ArgumentCaptor.forClass(OpenAiDeBootstrapCapability.class);
        verify(capabilities).saveAndFlush(persisted.capture());
        verify(verifier).requireActiveAuthorization(AUTHORIZATION_REFERENCE);
        verify(issuanceRateLimiter).requirePermit(
                AUTHORIZATION_REFERENCE,
                1,
                "openai-v1-confidential-client");
        OpenAiDeBootstrapCapability issue = persisted.getValue();

        assertThat(result.setupCapability()).matches("^spc_[A-Za-z0-9_-]{43}$");
        assertThat(result.expiresAt()).isEqualTo(NOW.plusSeconds(600));
        assertThat(result.contractMajor()).isEqualTo(1);
        assertThat(result.policyRevision()).isEqualTo(OpenAiDeV1ContractMetadata.POLICY_REVISION);
        assertThat(result.sourceMajorDecision()).isEqualTo("ALLOW_CURRENT_MAJOR");
        assertThat(issue.getCapabilityFingerprint()).matches("^[0-9a-f]{64}$");
        assertThat(issue.getCapabilityFingerprint()).isNotEqualTo(result.setupCapability());
        assertThat(issue.getOauthAuthorizationReference()).isEqualTo(AUTHORIZATION_REFERENCE);
        assertThat(issue.getSourceMajorDecision()).isEqualTo("ALLOW_CURRENT_MAJOR");
        assertThat(issue.getPolicyRevision()).isEqualTo(OpenAiDeV1ContractMetadata.POLICY_REVISION);
        assertThat(issue.getIssuedAt()).isEqualTo(NOW);
        assertThat(issue.getExpiresAt()).isEqualTo(NOW.plusSeconds(600));
        assertThat(issue.getRecordExpiresAt()).isEqualTo(NOW.plusSeconds(86_400));
        assertThat(issue.getStatus()).isEqualTo(OpenAiDeBootstrapCapabilityStatus.ISSUED);
        assertThat(issue.getTerminalCode()).isNull();
    }

    @Test
    void allowPolicyRejectsClientSuppliedMajorDecisionAndIssuesNothing() {
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.issueCapability(
                        AUTHORIZATION_REFERENCE,
                        new OpenAiDeBootstrapCapabilityIssueRequest(
                                OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                                true,
                                "START_CURRENT_MAJOR")))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);

        verify(verifier, never()).requireActiveAuthorization(any());
        verify(issuanceRateLimiter, never()).requirePermit(any(), anyInt(), any());
        verify(capabilities, never()).saveAndFlush(any());
    }

    @Test
    void issuerBudgetRejectsBeforeEntropyOrPersistence() {
        doThrow(new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.RATE_LIMITED))
                .when(issuanceRateLimiter)
                .requirePermit(
                        AUTHORIZATION_REFERENCE,
                        1,
                        "openai-v1-confidential-client");

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> service.issueCapability(
                        AUTHORIZATION_REFERENCE,
                        new OpenAiDeBootstrapCapabilityIssueRequest(
                                OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                                true,
                                null)))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.RATE_LIMITED);

        verify(verifier).requireActiveAuthorization(AUTHORIZATION_REFERENCE);
        verify(capabilities, never()).saveAndFlush(any());
    }

    private static OpenAiDeProperties properties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setWritesEnabled(true);
        properties.setOauthResource(OpenAiDeBootstrapConstants.RESOURCE);
        properties.setServerBuild("bootstrap-policy-revision-test");
        properties.getOauth().setClientId("openai-v1-confidential-client");
        return properties;
    }

    private static DataSourceTransactionManager transactionManager() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("org.h2.Driver");
        dataSource.setUrl("jdbc:h2:mem:bootstrap-capability-" + System.nanoTime());
        dataSource.setUsername("sa");
        return new DataSourceTransactionManager(dataSource);
    }
}
