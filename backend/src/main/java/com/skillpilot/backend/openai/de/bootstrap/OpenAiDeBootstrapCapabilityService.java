package com.skillpilot.backend.openai.de.bootstrap;

import com.skillpilot.backend.domain.OpenAiDeBootstrapCapability;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapabilityStatus;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.repository.OpenAiDeBootstrapCapabilityRepository;
import java.time.Clock;
import java.time.Instant;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** Issues a learner-neutral, single-bootstrap capability under one stable OAuth grant. */
@Service
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapCapabilityService {

    private final OpenAiDeBootstrapCapabilityRepository capabilities;
    private final OpenAiDeBootstrapCrypto crypto;
    private final OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier;
    private final OpenAiDeBootstrapIssuanceRateLimiter issuanceRateLimiter;
    private final OpenAiDeProperties properties;
    private final TransactionTemplate requiresNew;
    private final Clock clock;

    @Autowired
    public OpenAiDeBootstrapCapabilityService(
            OpenAiDeBootstrapCapabilityRepository capabilities,
            OpenAiDeBootstrapCrypto crypto,
            OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier,
            OpenAiDeBootstrapIssuanceRateLimiter issuanceRateLimiter,
            OpenAiDeProperties properties,
            PlatformTransactionManager transactionManager) {
        this(
                capabilities,
                crypto,
                authorizationVerifier,
                issuanceRateLimiter,
                properties,
                transactionManager,
                Clock.systemUTC());
    }

    OpenAiDeBootstrapCapabilityService(
            OpenAiDeBootstrapCapabilityRepository capabilities,
            OpenAiDeBootstrapCrypto crypto,
            OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier,
            OpenAiDeBootstrapIssuanceRateLimiter issuanceRateLimiter,
            OpenAiDeProperties properties,
            PlatformTransactionManager transactionManager,
            Clock clock) {
        this.capabilities = capabilities;
        this.crypto = crypto;
        this.authorizationVerifier = authorizationVerifier;
        this.issuanceRateLimiter = issuanceRateLimiter;
        this.properties = properties;
        this.clock = clock;
        this.requiresNew = new TransactionTemplate(transactionManager);
        this.requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public OpenAiDeBootstrapCapabilityIssueResult issueCapability(
            String oauthAuthorizationReference,
            OpenAiDeBootstrapCapabilityIssueRequest request) {
        requireIssueRequest(request);
        requireCurrentPolicy();
        authorizationVerifier.requireActiveAuthorization(oauthAuthorizationReference);
        issuanceRateLimiter.requirePermit(
                oauthAuthorizationReference,
                OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                properties.getOauth().getClientId());

        Instant issuedAt = clock.instant();
        Instant expiresAt = issuedAt.plus(OpenAiDeBootstrapConstants.CAPABILITY_TTL);
        String rawCapability = crypto.issueCapability();
        OpenAiDeBootstrapCrypto.Fingerprint fingerprint =
                crypto.capabilityFingerprint(rawCapability);

        OpenAiDeBootstrapCapability issue = new OpenAiDeBootstrapCapability();
        issue.setCapabilityFingerprint(fingerprint.value());
        issue.setFingerprintKeyId(fingerprint.keyId());
        issue.setSchemaVersion(OpenAiDeBootstrapConstants.CAPABILITY_SCHEMA_VERSION);
        issue.setContractMajor(OpenAiDeBootstrapConstants.CONTRACT_MAJOR);
        issue.setPurpose(OpenAiDeBootstrapConstants.PURPOSE);
        issue.setOauthAuthorizationReference(oauthAuthorizationReference);
        issue.setOauthClientId(properties.getOauth().getClientId());
        issue.setResource(OpenAiDeBootstrapConstants.RESOURCE);
        issue.setScopes(String.join(" ", OpenAiDeBootstrapConstants.REQUIRED_SCOPES));
        issue.setProviderNoticeVersion(OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION);
        issue.setSourceMajorDecision(OpenAiDeBootstrapConstants.ALLOW_SOURCE_MAJOR_DECISION);
        issue.setPolicyRevision(OpenAiDeBootstrapConstants.POLICY_REVISION);
        issue.setIssuanceRevision(currentIssuanceRevision());
        issue.setIssuedAt(issuedAt);
        issue.setExpiresAt(expiresAt);
        issue.setRecordExpiresAt(issuedAt.plus(OpenAiDeBootstrapConstants.TOMBSTONE_TTL));
        issue.setStatus(OpenAiDeBootstrapCapabilityStatus.ISSUED);

        Objects.requireNonNull(requiresNew.execute(status -> capabilities.saveAndFlush(issue)));
        return new OpenAiDeBootstrapCapabilityIssueResult(
                rawCapability,
                expiresAt,
                OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                OpenAiDeBootstrapConstants.POLICY_REVISION,
                OpenAiDeBootstrapConstants.ALLOW_SOURCE_MAJOR_DECISION);
    }

    private void requireIssueRequest(OpenAiDeBootstrapCapabilityIssueRequest request) {
        if (request == null
                || !OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION.equals(
                        request.providerNoticeVersion())
                || !Boolean.TRUE.equals(request.providerEligibilityConfirmed())
                // V1 is currently ALLOW. A future WARN policy must introduce
                // an explicit policy service before accepting this field.
                || request.sourceMajorDecision() != null) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
    }

    private void requireCurrentPolicy() {
        String clientId = properties.getOauth().getClientId();
        if (!properties.isWritesEnabled()
                || !"ALLOW".equals(OpenAiDeV1ContractMetadata.NEW_SESSION_POLICY)
                || clientId == null
                || clientId.isBlank()
                || clientId.length() > 512
                || !OpenAiDeBootstrapConstants.RESOURCE.equals(properties.getOauthResource())) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
        }
        currentIssuanceRevision();
    }

    private String currentIssuanceRevision() {
        String revision = properties.getServerBuild();
        if (revision == null || revision.isBlank() || revision.length() > 160) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
        }
        return revision;
    }
}
