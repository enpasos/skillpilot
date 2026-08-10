package com.skillpilot.backend.openai.de.bootstrap;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntent;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBootstrapAttemptStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapability;
import com.skillpilot.backend.domain.OpenAiDeBootstrapCapabilityStatus;
import com.skillpilot.backend.domain.OpenAiDeBootstrapLaunchAttempt;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.bootstrap.OpenAiDeBootstrapLaunchRequest.IdentityMode;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapCapabilityRepository;
import com.skillpilot.backend.repository.OpenAiDeBootstrapLaunchAttemptRepository;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

/** Two-transaction, exact-retry core for the direct HTTPS V1 start. */
@Service
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapAttemptService {

    private record NormalizedRequest(
            IdentityMode identityMode,
            String skillpilotId,
            String communicationLocale,
            String clientRequestId) {
    }

    private record BoundAttempt(String id) {
    }

    private record DeliveryOutcome(
            OpenAiDeBootstrapLaunchResponse response,
            OpenAiDeBootstrapErrorCode error) {

        static DeliveryOutcome success(OpenAiDeBootstrapLaunchResponse response) {
            return new DeliveryOutcome(response, null);
        }

        static DeliveryOutcome failure(OpenAiDeBootstrapErrorCode error) {
            return new DeliveryOutcome(null, error);
        }
    }

    private static final Pattern SKILLPILOT_ID_PATTERN = Pattern.compile(
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
    private static final Pattern LEARNING_SESSION_ID_PATTERN =
            Pattern.compile("^sps_[A-Za-z0-9_-]{43}$");
    private static final Duration MAXIMUM_SESSION_TTL = Duration.ofHours(24);
    private static final String DIRECT_CLIENT = "openai-mcp-app-direct";

    private final OpenAiDeBootstrapCapabilityRepository capabilities;
    private final OpenAiDeBootstrapLaunchAttemptRepository attempts;
    private final LearnerRepository learners;
    private final LearnerService learnerService;
    private final OpenAiDeCoachConnectionService connectionService;
    private final OpenAiDeBootstrapCrypto crypto;
    private final OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier;
    private final OpenAiDeProperties properties;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate requiresNew;
    private final Clock clock;

    @Autowired
    public OpenAiDeBootstrapAttemptService(
            OpenAiDeBootstrapCapabilityRepository capabilities,
            OpenAiDeBootstrapLaunchAttemptRepository attempts,
            LearnerRepository learners,
            LearnerService learnerService,
            OpenAiDeCoachConnectionService connectionService,
            OpenAiDeBootstrapCrypto crypto,
            OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier,
            OpenAiDeProperties properties,
            ObjectMapper objectMapper,
            PlatformTransactionManager transactionManager) {
        this(
                capabilities,
                attempts,
                learners,
                learnerService,
                connectionService,
                crypto,
                authorizationVerifier,
                properties,
                objectMapper,
                transactionManager,
                Clock.systemUTC());
    }

    OpenAiDeBootstrapAttemptService(
            OpenAiDeBootstrapCapabilityRepository capabilities,
            OpenAiDeBootstrapLaunchAttemptRepository attempts,
            LearnerRepository learners,
            LearnerService learnerService,
            OpenAiDeCoachConnectionService connectionService,
            OpenAiDeBootstrapCrypto crypto,
            OpenAiDeBootstrapAuthorizationVerifier authorizationVerifier,
            OpenAiDeProperties properties,
            ObjectMapper objectMapper,
            PlatformTransactionManager transactionManager,
            Clock clock) {
        this.capabilities = capabilities;
        this.attempts = attempts;
        this.learners = learners;
        this.learnerService = learnerService;
        this.connectionService = connectionService;
        this.crypto = crypto;
        this.authorizationVerifier = authorizationVerifier;
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.clock = clock;
        this.requiresNew = new TransactionTemplate(transactionManager);
        this.requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public OpenAiDeBootstrapLaunchResponse launch(
            String setupCapability,
            OpenAiDeBootstrapLaunchRequest request) {
        NormalizedRequest normalized = normalizeRequest(request);
        OpenAiDeBootstrapCrypto.Fingerprint fingerprint =
                crypto.capabilityFingerprint(setupCapability);
        OpenAiDeBootstrapCapability capability = capabilities
                .findById(fingerprint.value())
                .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
        requireCapabilityContract(capability, fingerprint, false, clock.instant());
        OpenAiDeBootstrapErrorCode terminalCapabilityError = terminalCapabilityError(capability);
        if (terminalCapabilityError != null) {
            throw failure(terminalCapabilityError);
        }
        enforceCapabilityPolicyBeforeBinding(capability, fingerprint);
        requireActiveAuthorizationBeforeBinding(capability, fingerprint);

        OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication =
                crypto.authenticateRequest(
                        OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                        fingerprint.value(),
                        OpenAiDeBootstrapConstants.REQUEST_SCHEMA_VERSION,
                        normalized.clientRequestId(),
                        normalized.identityMode().name(),
                        normalized.skillpilotId() == null ? "" : normalized.skillpilotId(),
                        normalized.communicationLocale(),
                        OpenAiDeBootstrapConstants.LAUNCH_INTENT,
                        OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION,
                        capability.getPolicyRevision(),
                        capability.getSourceMajorDecision());

        BoundAttempt bound = bindRequest(
                capability,
                fingerprint,
                normalized,
                requestAuthentication);
        DeliveryOutcome outcome;
        try {
            outcome = Objects.requireNonNull(requiresNew.execute(status ->
                    executeOrReplay(
                            bound,
                            fingerprint,
                            normalized,
                            requestAuthentication)));
        } catch (ResponseStatusException exception) {
            if (!exception.getStatusCode().is4xxClientError()) {
                throw transientDeliveryFailure(exception);
            }
            try {
                outcome = terminalizeDeterministicLaunchRejection(
                        bound,
                        fingerprint,
                        normalized,
                        requestAuthentication);
            } catch (OpenAiDeBootstrapException terminalizationFailure) {
                throw terminalizationFailure;
            } catch (RuntimeException terminalizationFailure) {
                throw transientDeliveryFailure(terminalizationFailure);
            }
        } catch (OpenAiDeBootstrapException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            // Transaction B has already rolled back here. Keep the durable
            // attempt BOUND and expose only the closed retryable envelope.
            throw transientDeliveryFailure(exception);
        }
        if (outcome.error() != null) {
            throw failure(outcome.error());
        }
        return outcome.response();
    }

    @Scheduled(fixedDelayString = "${skillpilot.openai.coach.v1.bootstrap-cleanup-interval-ms:60000}")
    public void cleanupExpiredBootstrapState() {
        Instant now = clock.instant();
        requiresNew.executeWithoutResult(status -> {
            attempts.clearExpiredDeliveries(OpenAiDeBootstrapAttemptStatus.SUCCEEDED, now);
            attempts.deleteExpiredTombstones(now);
            capabilities.deleteUnusedExpired(now);
        });
    }

    private BoundAttempt bindRequest(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            NormalizedRequest normalized,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        try {
            return Objects.requireNonNull(requiresNew.execute(status -> bindRequestInTransaction(
                    capability,
                    fingerprint,
                    normalized,
                    requestAuthentication)));
        } catch (DataIntegrityViolationException conflict) {
            // Different capabilities can race on the authorization/request-ID
            // uniqueness boundary. Resolve only after the losing transaction
            // has rolled back and the winner is visible.
            return Objects.requireNonNull(requiresNew.execute(status -> resolveExistingBinding(
                    fingerprint,
                    capability.getOauthAuthorizationReference(),
                    normalized.clientRequestId(),
                    requestAuthentication)));
        } catch (OpenAiDeBootstrapException exception) {
            if (exception.code() != OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID) {
                throw exception;
            }
            OpenAiDeBootstrapErrorCode persistedError = terminalizeAuthorizationInNewTransaction(
                    fingerprint,
                    capability.getOauthAuthorizationReference(),
                    true);
            throw failure(persistedError);
        }
    }

    private BoundAttempt bindRequestInTransaction(
            OpenAiDeBootstrapCapability prevalidatedCapability,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            NormalizedRequest normalized,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        OpenAiDeBootstrapCapability capability = capabilities
                .findByFingerprintForUpdate(fingerprint.value())
                .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
        requireCapabilityContract(capability, fingerprint, false, clock.instant());
        OpenAiDeBootstrapErrorCode terminalCapabilityError = terminalCapabilityError(capability);
        if (terminalCapabilityError != null) {
            throw failure(terminalCapabilityError);
        }
        if (capabilityPolicyFailure(capability) != null) {
            throw failure(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
        }
        authorizationVerifier.requireActiveAuthorization(capability.getOauthAuthorizationReference());
        if (!Objects.equals(
                capability.getOauthAuthorizationReference(),
                prevalidatedCapability.getOauthAuthorizationReference())) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }

        Optional<OpenAiDeBootstrapLaunchAttempt> byCapability =
                attempts.findByCapabilityFingerprintForUpdate(fingerprint.value());
        Optional<OpenAiDeBootstrapLaunchAttempt> byRequest = attempts.findByIdempotencyTupleForUpdate(
                OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                capability.getOauthAuthorizationReference(),
                normalized.clientRequestId());
        if (byCapability.isPresent() || byRequest.isPresent()) {
            OpenAiDeBootstrapLaunchAttempt existing = byCapability.orElseGet(byRequest::orElseThrow);
            if (byCapability.isPresent()
                    && byRequest.isPresent()
                    && !byCapability.get().getId().equals(byRequest.get().getId())) {
                throw failure(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED);
            }
            requireExactBinding(
                    existing,
                    fingerprint,
                    capability.getOauthAuthorizationReference(),
                    normalized.clientRequestId(),
                    requestAuthentication);
            if (extendCapabilityRetention(capability, existing.getRecordExpiresAt())) {
                capabilities.saveAndFlush(capability);
            }
            return new BoundAttempt(existing.getId());
        }

        requireCapabilityContract(capability, fingerprint, true, clock.instant());
        Instant boundAt = clock.instant();
        OpenAiDeBootstrapLaunchAttempt attempt = new OpenAiDeBootstrapLaunchAttempt();
        attempt.setId(UUID.randomUUID().toString());
        attempt.setContractMajor(OpenAiDeBootstrapConstants.CONTRACT_MAJOR);
        attempt.setCapabilityFingerprint(fingerprint.value());
        attempt.setCapabilityFingerprintKeyId(fingerprint.keyId());
        attempt.setOauthAuthorizationReference(capability.getOauthAuthorizationReference());
        attempt.setCapabilityExpiresAt(capability.getExpiresAt());
        attempt.setClientRequestId(normalized.clientRequestId());
        attempt.setRequestHmacKeyId(requestAuthentication.keyId());
        attempt.setRequestHmac(requestAuthentication.value());
        attempt.setStatus(OpenAiDeBootstrapAttemptStatus.BOUND);
        attempt.setAttemptRetryUntil(boundAt.plus(OpenAiDeBootstrapConstants.ATTEMPT_RETRY_TTL));
        attempt.setBoundAt(boundAt);
        attempt.setRecordExpiresAt(boundAt.plus(OpenAiDeBootstrapConstants.TOMBSTONE_TTL));
        attempts.saveAndFlush(attempt);
        capability.setStatus(OpenAiDeBootstrapCapabilityStatus.BOUND);
        extendCapabilityRetention(capability, attempt.getRecordExpiresAt());
        capabilities.saveAndFlush(capability);
        return new BoundAttempt(attempt.getId());
    }

    private BoundAttempt resolveExistingBinding(
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            String authorizationReference,
            String clientRequestId,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        OpenAiDeBootstrapLaunchAttempt existing = attempts
                .findByCapabilityFingerprintForUpdate(fingerprint.value())
                .orElseGet(() -> attempts
                        .findByIdempotencyTupleForUpdate(
                                OpenAiDeBootstrapConstants.CONTRACT_MAJOR,
                                authorizationReference,
                                clientRequestId)
                        .orElseThrow(() -> failure(
                                OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED)));
        requireExactBinding(
                existing,
                fingerprint,
                authorizationReference,
                clientRequestId,
                requestAuthentication);
        return new BoundAttempt(existing.getId());
    }

    private DeliveryOutcome executeOrReplay(
            BoundAttempt bound,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            NormalizedRequest normalized,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        // Fixed lock order across both transactions: capability, attempt, then
        // learner only in the BOUND branch. Keeping the capability first also
        // prevents a retry in transaction A from deadlocking with transaction
        // B while the latter records CONSUMED or terminal policy state.
        OpenAiDeBootstrapCapability capability = capabilities
                .findByFingerprintForUpdate(fingerprint.value())
                .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
        OpenAiDeBootstrapLaunchAttempt attempt = attempts
                .findByCapabilityFingerprintForUpdate(fingerprint.value())
                .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
        if (!attempt.getId().equals(bound.id())) {
            throw failure(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED);
        }
        requireExactBinding(
                attempt,
                fingerprint,
                attempt.getOauthAuthorizationReference(),
                normalized.clientRequestId(),
                requestAuthentication);

        requireCapabilityContract(capability, fingerprint, false, clock.instant());
        if (!attempt.getOauthAuthorizationReference().equals(capability.getOauthAuthorizationReference())) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
        Instant now = clock.instant();
        OpenAiDeBootstrapErrorCode terminalCapabilityError = terminalCapabilityError(capability);
        if (terminalCapabilityError != null) {
            terminalizeAttemptForCapabilityError(
                    capability,
                    attempt,
                    terminalCapabilityError,
                    now);
            return DeliveryOutcome.failure(terminalCapabilityError);
        }
        String policyFailure = capabilityPolicyFailure(capability);
        if (policyFailure != null) {
            terminalizeForPolicy(capability, attempt, policyFailure, now);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
        }
        try {
            authorizationVerifier.requireActiveAuthorization(attempt.getOauthAuthorizationReference());
        } catch (OpenAiDeBootstrapException exception) {
            if (exception.code() != OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID) {
                throw exception;
            }
            terminalizeForAuthorization(capability, attempt, now);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
        }

        if (attempt.getStatus() == OpenAiDeBootstrapAttemptStatus.SUCCEEDED) {
            return replaySuccessfulDelivery(attempt, normalized, now);
        }
        if (attempt.getStatus() == OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL) {
            if (!attempt.getRecordExpiresAt().isAfter(now)) {
                return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.DELIVERY_EXPIRED);
            }
            return DeliveryOutcome.failure(terminalError(attempt));
        }
        if (attempt.getStatus() != OpenAiDeBootstrapAttemptStatus.BOUND) {
            throw failure(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        }
        if (!attempt.getAttemptRetryUntil().isAfter(now)) {
            terminalizeConsumedAttempt(
                    capability,
                    attempt,
                    OpenAiDeBootstrapErrorCode.RETRY_EXPIRED,
                    now);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.RETRY_EXPIRED);
        }

        // CURRENT_UNIT deliberately permits unfinished learner setup. For an
        // existing identity, the learner lock follows capability and attempt.
        // CREATE instead persists one new learner inside this same transaction,
        // before the session is created; rollback therefore removes both.
        String effectiveSkillpilotId = normalized.skillpilotId();
        String createdSkillpilotId = null;
        if (normalized.identityMode() == IdentityMode.CREATE) {
            Learner createdLearner = learnerService.createLearner();
            createdSkillpilotId = canonicalCreatedSkillpilotId(createdLearner);
            effectiveSkillpilotId = createdSkillpilotId;
        } else if (learners.findBySkillpilotIdForUpdate(effectiveSkillpilotId).isEmpty()) {
            terminalizeConsumedAttempt(
                    capability,
                    attempt,
                    OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE,
                    now);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE);
        }

        OpenAiDeLaunchResponse launch = connectionService.createLaunch(
                effectiveSkillpilotId,
                currentUnitRequest(normalized.communicationLocale()));
        Instant completedAt = clock.instant();
        requireCanonicalLaunch(launch, normalized.communicationLocale(), completedAt);
        OpenAiDeBootstrapLaunchResponse response = new OpenAiDeBootstrapLaunchResponse(
                OpenAiDeBootstrapConstants.RESPONSE_SCHEMA_VERSION,
                OpenAiDeBootstrapConstants.RESPONSE_STATUS,
                normalized.communicationLocale(),
                launch.expiresAt(),
                launch.prompt(),
                createdSkillpilotId);
        OpenAiDeBootstrapCrypto.EncryptedDelivery encrypted = crypto.encryptDelivery(
                serializeResponse(response),
                attempt.getId(),
                attempt.getContractMajor(),
                attempt.getCapabilityFingerprint(),
                attempt.getRequestHmac(),
                OpenAiDeBootstrapConstants.RESPONSE_SCHEMA_VERSION);
        attempt.setResponseSchemaVersion(OpenAiDeBootstrapConstants.RESPONSE_SCHEMA_VERSION);
        attempt.setResponseKeyId(encrypted.keyId());
        attempt.setResponseNonce(encrypted.nonce());
        attempt.setResponseCiphertext(encrypted.ciphertext());
        attempt.setResponseExpiresAt(completedAt.plus(OpenAiDeBootstrapConstants.RESPONSE_TTL));
        attempt.setCompletedAt(completedAt);
        if (launch.expiresAt().isAfter(attempt.getRecordExpiresAt())) {
            // Keep the idempotency tombstone at least as long as the session it
            // protects; it still carries no learner or session plaintext.
            attempt.setRecordExpiresAt(launch.expiresAt());
        }
        attempt.setStatus(OpenAiDeBootstrapAttemptStatus.SUCCEEDED);
        attempts.saveAndFlush(attempt);
        capability.setStatus(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
        extendCapabilityRetention(capability, attempt.getRecordExpiresAt());
        capabilities.saveAndFlush(capability);
        return DeliveryOutcome.success(response);
    }

    private DeliveryOutcome terminalizeDeterministicLaunchRejection(
            BoundAttempt bound,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            NormalizedRequest normalized,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        return Objects.requireNonNull(requiresNew.execute(status -> {
            OpenAiDeBootstrapCapability capability = capabilities
                    .findByFingerprintForUpdate(fingerprint.value())
                    .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
            OpenAiDeBootstrapLaunchAttempt attempt = attempts
                    .findByCapabilityFingerprintForUpdate(fingerprint.value())
                    .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
            if (!attempt.getId().equals(bound.id())) {
                throw failure(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED);
            }
            requireExactBinding(
                    attempt,
                    fingerprint,
                    attempt.getOauthAuthorizationReference(),
                    normalized.clientRequestId(),
                    requestAuthentication);
            requireCapabilityContract(capability, fingerprint, false, clock.instant());
            if (!attempt.getOauthAuthorizationReference().equals(
                    capability.getOauthAuthorizationReference())) {
                throw failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
            }

            Instant now = clock.instant();
            OpenAiDeBootstrapErrorCode terminalCapabilityError =
                    terminalCapabilityError(capability);
            if (terminalCapabilityError != null) {
                terminalizeAttemptForCapabilityError(
                        capability,
                        attempt,
                        terminalCapabilityError,
                        now);
                return DeliveryOutcome.failure(terminalCapabilityError);
            }
            String policyFailure = capabilityPolicyFailure(capability);
            if (policyFailure != null) {
                terminalizeForPolicy(capability, attempt, policyFailure, now);
                return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE);
            }
            try {
                authorizationVerifier.requireActiveAuthorization(
                        attempt.getOauthAuthorizationReference());
            } catch (OpenAiDeBootstrapException exception) {
                if (exception.code() != OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID) {
                    throw exception;
                }
                terminalizeForAuthorization(capability, attempt, now);
                return DeliveryOutcome.failure(
                        OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
            }

            if (attempt.getStatus() == OpenAiDeBootstrapAttemptStatus.SUCCEEDED) {
                return replaySuccessfulDelivery(attempt, normalized, now);
            }
            if (attempt.getStatus() == OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL) {
                return DeliveryOutcome.failure(terminalError(attempt));
            }
            if (attempt.getStatus() != OpenAiDeBootstrapAttemptStatus.BOUND) {
                throw failure(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
            }
            terminalizeConsumedAttempt(
                    capability,
                    attempt,
                    OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE,
                    now);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE);
        }));
    }

    private DeliveryOutcome replaySuccessfulDelivery(
            OpenAiDeBootstrapLaunchAttempt attempt,
            NormalizedRequest normalized,
            Instant now) {
        if (attempt.getResponseExpiresAt() == null
                || !attempt.getResponseExpiresAt().isAfter(now)
                || attempt.getResponseKeyId() == null
                || attempt.getResponseNonce() == null
                || attempt.getResponseCiphertext() == null) {
            attempt.clearExpiredDelivery();
            attempts.saveAndFlush(attempt);
            return DeliveryOutcome.failure(OpenAiDeBootstrapErrorCode.DELIVERY_EXPIRED);
        }
        OpenAiDeBootstrapCrypto.EncryptedDelivery encrypted =
                new OpenAiDeBootstrapCrypto.EncryptedDelivery(
                        attempt.getResponseKeyId(),
                        attempt.getResponseNonce(),
                        attempt.getResponseCiphertext());
        byte[] plaintext = crypto.decryptDelivery(
                encrypted,
                attempt.getId(),
                attempt.getContractMajor(),
                attempt.getCapabilityFingerprint(),
                attempt.getRequestHmac(),
                Objects.requireNonNull(attempt.getResponseSchemaVersion()));
        OpenAiDeBootstrapLaunchResponse response = deserializeResponse(plaintext);
        requireCanonicalResponse(response, normalized, now);
        return DeliveryOutcome.success(response);
    }

    private void requireCapabilityContract(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            boolean requireUnexpiredFirstUse,
            Instant now) {
        Instant issuedAt = capability.getIssuedAt();
        Instant expiresAt = capability.getExpiresAt();
        boolean invalidLifetime = issuedAt == null
                || expiresAt == null
                || !expiresAt.isAfter(issuedAt)
                || Duration.between(issuedAt, expiresAt)
                        .compareTo(OpenAiDeBootstrapConstants.CAPABILITY_TTL) > 0;
        if (!fingerprint.value().equals(capability.getCapabilityFingerprint())
                || !fingerprint.keyId().equals(capability.getFingerprintKeyId())
                || capability.getSchemaVersion() != OpenAiDeBootstrapConstants.CAPABILITY_SCHEMA_VERSION
                || capability.getContractMajor() != OpenAiDeBootstrapConstants.CONTRACT_MAJOR
                || !OpenAiDeBootstrapConstants.PURPOSE.equals(capability.getPurpose())
                || capability.getOauthAuthorizationReference() == null
                || capability.getOauthAuthorizationReference().isBlank()
                || capability.getOauthClientId() == null
                || capability.getOauthClientId().isBlank()
                || capability.getOauthClientId().length() > 512
                || !OpenAiDeBootstrapConstants.RESOURCE.equals(capability.getResource())
                || !String.join(" ", OpenAiDeBootstrapConstants.REQUIRED_SCOPES)
                        .equals(capability.getScopes())
                || capability.getIssuanceRevision() == null
                || capability.getIssuanceRevision().isBlank()
                || capability.getIssuanceRevision().length() > 160
                || invalidLifetime
                || capability.getRecordExpiresAt() == null
                || !capability.getRecordExpiresAt().isAfter(now)
                || capability.getStatus() == null
                || requireUnexpiredFirstUse
                        && capability.getStatus() != OpenAiDeBootstrapCapabilityStatus.ISSUED
                || requireUnexpiredFirstUse && !expiresAt.isAfter(now)) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
        }
    }

    private void requireExactBinding(
            OpenAiDeBootstrapLaunchAttempt attempt,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            String authorizationReference,
            String clientRequestId,
            OpenAiDeBootstrapCrypto.RequestAuthentication requestAuthentication) {
        if (attempt.getContractMajor() != OpenAiDeBootstrapConstants.CONTRACT_MAJOR
                || !fingerprint.value().equals(attempt.getCapabilityFingerprint())
                || !fingerprint.keyId().equals(attempt.getCapabilityFingerprintKeyId())
                || !Objects.equals(authorizationReference, attempt.getOauthAuthorizationReference())
                || !clientRequestId.equals(attempt.getClientRequestId())
                || !requestAuthentication.keyId().equals(attempt.getRequestHmacKeyId())
                || !crypto.constantTimeEquals(requestAuthentication.value(), attempt.getRequestHmac())) {
            throw failure(OpenAiDeBootstrapErrorCode.IDEMPOTENCY_KEY_REUSED);
        }
    }

    private NormalizedRequest normalizeRequest(OpenAiDeBootstrapLaunchRequest request) {
        if (request == null
                || request.schemaVersion() != OpenAiDeBootstrapConstants.REQUEST_SCHEMA_VERSION
                || request.launchIntent() == null
                || !OpenAiDeBootstrapConstants.LAUNCH_INTENT.equals(request.launchIntent().type())
                || !OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION.equals(
                        request.providerNoticeVersion())) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        IdentityMode identityMode = request.identityMode();
        String skillpilotId;
        if (identityMode == IdentityMode.EXISTING) {
            skillpilotId = canonicalUuid(request.skillpilotId(), false);
        } else if (identityMode == IdentityMode.CREATE && request.skillpilotId() == null) {
            skillpilotId = null;
        } else {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        String clientRequestId = canonicalUuid(request.clientRequestId(), true);
        String locale = request.communicationLocale();
        if (!"de".equals(locale) && !"en".equals(locale)) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        return new NormalizedRequest(identityMode, skillpilotId, locale, clientRequestId);
    }

    private String canonicalUuid(String value, boolean requireVersionFour) {
        if (value == null || !SKILLPILOT_ID_PATTERN.matcher(value).matches()) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
        try {
            UUID parsed = UUID.fromString(value);
            if (requireVersionFour && parsed.version() != 4) {
                throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
            }
            return parsed.toString().toLowerCase(Locale.ROOT);
        } catch (IllegalArgumentException exception) {
            throw failure(OpenAiDeBootstrapErrorCode.INVALID_REQUEST);
        }
    }

    private OpenAiDeCoachStartRequest currentUnitRequest(String communicationLocale) {
        return new OpenAiDeCoachStartRequest(
                communicationLocale,
                DIRECT_CLIENT,
                null,
                true,
                new LaunchIntent(LaunchIntentType.CURRENT_UNIT, null, null, null));
    }

    private void requireCanonicalLaunch(
            OpenAiDeLaunchResponse launch,
            String communicationLocale,
            Instant completedAt) {
        if (launch == null
                || launch.learningSessionId() == null
                || !LEARNING_SESSION_ID_PATTERN.matcher(launch.learningSessionId()).matches()
                || launch.expiresAt() == null
                || !launch.expiresAt().isAfter(completedAt)
                || Duration.between(completedAt, launch.expiresAt()).compareTo(MAXIMUM_SESSION_TTL) > 0
                || !expectedStartMessage(communicationLocale, launch.learningSessionId())
                        .equals(launch.prompt())) {
            throw failure(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        }
    }

    private void requireCanonicalResponse(
            OpenAiDeBootstrapLaunchResponse response,
            NormalizedRequest normalized,
            Instant now) {
        String communicationLocale = normalized.communicationLocale();
        String prefix = startMessagePrefix(communicationLocale) + "\nlearningSessionId: ";
        String message = response == null ? null : response.startMessage();
        String sessionId = message != null && message.startsWith(prefix)
                ? message.substring(prefix.length())
                : null;
        if (response == null
                || response.schemaVersion() != OpenAiDeBootstrapConstants.RESPONSE_SCHEMA_VERSION
                || !OpenAiDeBootstrapConstants.RESPONSE_STATUS.equals(response.status())
                || !communicationLocale.equals(response.communicationLocale())
                || response.expiresAt() == null
                || !response.expiresAt().isAfter(now)
                || sessionId == null
                || !LEARNING_SESSION_ID_PATTERN.matcher(sessionId).matches()
                || !expectedStartMessage(communicationLocale, sessionId).equals(message)
                || (normalized.identityMode() == IdentityMode.EXISTING
                        && response.createdSkillpilotId() != null)
                || (normalized.identityMode() == IdentityMode.CREATE
                        && !isCanonicalVersionFourUuid(response.createdSkillpilotId()))) {
            throw failure(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        }
    }

    private String canonicalCreatedSkillpilotId(Learner learner) {
        String value = learner == null ? null : learner.getSkillpilotId();
        if (!isCanonicalVersionFourUuid(value)) {
            throw failure(OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE);
        }
        return value;
    }

    private boolean isCanonicalVersionFourUuid(String value) {
        if (value == null || !SKILLPILOT_ID_PATTERN.matcher(value).matches()) {
            return false;
        }
        try {
            UUID parsed = UUID.fromString(value);
            return parsed.version() == 4
                    && parsed.variant() == 2
                    && parsed.toString().equals(value);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private String expectedStartMessage(String communicationLocale, String learningSessionId) {
        return startMessagePrefix(communicationLocale)
                + "\nlearningSessionId: "
                + learningSessionId;
    }

    private String startMessagePrefix(String communicationLocale) {
        return "en".equals(communicationLocale)
                ? "Use SkillPilot Coach v1 and continue."
                : "Verwende SkillPilot Coach v1 und fahre fort.";
    }

    private byte[] serializeResponse(OpenAiDeBootstrapLaunchResponse response) {
        try {
            return objectMapper.writeValueAsBytes(response);
        } catch (Exception exception) {
            throw new OpenAiDeBootstrapException(
                    OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                    exception);
        }
    }

    private OpenAiDeBootstrapLaunchResponse deserializeResponse(byte[] plaintext) {
        try {
            return objectMapper.readValue(plaintext, OpenAiDeBootstrapLaunchResponse.class);
        } catch (Exception exception) {
            throw new OpenAiDeBootstrapException(
                    OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                    exception);
        }
    }

    private OpenAiDeBootstrapErrorCode terminalError(OpenAiDeBootstrapLaunchAttempt attempt) {
        if (OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE.name().equals(attempt.getTerminalCode())) {
            return OpenAiDeBootstrapErrorCode.PROFILE_UNAVAILABLE;
        }
        if (OpenAiDeBootstrapErrorCode.RETRY_EXPIRED.name().equals(attempt.getTerminalCode())) {
            return OpenAiDeBootstrapErrorCode.RETRY_EXPIRED;
        }
        if (OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE.name().equals(attempt.getTerminalCode())) {
            return OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE;
        }
        if (OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name()
                .equals(attempt.getTerminalCode())) {
            return OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID;
        }
        return OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE;
    }

    private void requireActiveAuthorizationBeforeBinding(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint) {
        try {
            authorizationVerifier.requireActiveAuthorization(
                    capability.getOauthAuthorizationReference());
        } catch (OpenAiDeBootstrapException exception) {
            if (exception.code() != OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID
                    || capability.getStatus() == OpenAiDeBootstrapCapabilityStatus.ISSUED) {
                throw exception;
            }
            OpenAiDeBootstrapErrorCode persistedError = terminalizeAuthorizationInNewTransaction(
                    fingerprint,
                    capability.getOauthAuthorizationReference(),
                    false);
            throw failure(persistedError);
        }
    }

    private OpenAiDeBootstrapErrorCode terminalizeAuthorizationInNewTransaction(
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint,
            String authorizationReference,
            boolean invalidateIssuedCapability) {
        return Objects.requireNonNull(requiresNew.execute(status -> {
            OpenAiDeBootstrapCapability capability = capabilities
                    .findByFingerprintForUpdate(fingerprint.value())
                    .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
            requireCapabilityContract(capability, fingerprint, false, clock.instant());
            if (!Objects.equals(
                    authorizationReference,
                    capability.getOauthAuthorizationReference())) {
                throw failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY);
            }

            Optional<OpenAiDeBootstrapLaunchAttempt> attempt =
                    attempts.findByCapabilityFingerprintForUpdate(fingerprint.value());
            OpenAiDeBootstrapErrorCode existingTerminal = terminalCapabilityError(capability);
            if (existingTerminal != null) {
                attempt.ifPresent(value -> terminalizeAttemptForCapabilityError(
                        capability,
                        value,
                        existingTerminal,
                        clock.instant()));
                return existingTerminal;
            }
            if (attempt.isEmpty()
                    && !invalidateIssuedCapability
                    && capability.getStatus() == OpenAiDeBootstrapCapabilityStatus.ISSUED) {
                return OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID;
            }

            Instant now = clock.instant();
            if (attempt.isPresent()) {
                terminalizeForAuthorization(capability, attempt.orElseThrow(), now);
            } else {
                capability.setTerminalCode(
                        OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());
                capability.setInvalidatedAt(now);
                capability.setStatus(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
                capabilities.saveAndFlush(capability);
            }
            return OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID;
        }));
    }

    private void enforceCapabilityPolicyBeforeBinding(
            OpenAiDeBootstrapCapability prevalidatedCapability,
            OpenAiDeBootstrapCrypto.Fingerprint fingerprint) {
        OpenAiDeBootstrapErrorCode existingTerminal =
                terminalCapabilityError(prevalidatedCapability);
        if (existingTerminal != null) {
            throw failure(existingTerminal);
        }
        String prevalidatedFailure = capabilityPolicyFailure(prevalidatedCapability);
        if (prevalidatedFailure == null) {
            return;
        }
        OpenAiDeBootstrapErrorCode policyError = requiresNew.execute(status -> {
            OpenAiDeBootstrapCapability capability = capabilities
                    .findByFingerprintForUpdate(fingerprint.value())
                    .orElseThrow(() -> failure(OpenAiDeBootstrapErrorCode.INVALID_CAPABILITY));
            requireCapabilityContract(capability, fingerprint, false, clock.instant());
            OpenAiDeBootstrapErrorCode currentTerminal = terminalCapabilityError(capability);
            if (currentTerminal != null) {
                return currentTerminal;
            }
            String reason = Optional.ofNullable(capabilityPolicyFailure(capability))
                    .orElse(prevalidatedFailure);
            Instant now = clock.instant();
            Optional<OpenAiDeBootstrapLaunchAttempt> attempt =
                    attempts.findByCapabilityFingerprintForUpdate(fingerprint.value());
            if (attempt.isPresent()) {
                terminalizeForPolicy(capability, attempt.orElseThrow(), reason, now);
            } else {
                capability.setTerminalCode(reason);
                capability.setInvalidatedAt(now);
                capability.setStatus(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
                capabilities.saveAndFlush(capability);
            }
            return OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE;
        });
        if (policyError != null) {
            throw failure(policyError);
        }
    }

    private String capabilityPolicyFailure(OpenAiDeBootstrapCapability capability) {
        if (capability.getPolicyRevision() != OpenAiDeBootstrapConstants.POLICY_REVISION
                || !OpenAiDeBootstrapConstants.PROVIDER_NOTICE_VERSION.equals(
                        capability.getProviderNoticeVersion())
                // The current V1 policy is ALLOW. WARN capabilities must bind
                // an explicit source-major decision under a later revision.
                || !OpenAiDeBootstrapConstants.ALLOW_SOURCE_MAJOR_DECISION.equals(
                        capability.getSourceMajorDecision())) {
            return "POLICY_STALE";
        }
        String clientId = properties.getOauth().getClientId();
        if (!properties.isWritesEnabled()
                || !"ALLOW".equals(OpenAiDeV1ContractMetadata.NEW_SESSION_POLICY)
                || clientId == null
                || clientId.isBlank()
                || !clientId.equals(capability.getOauthClientId())
                || !OpenAiDeBootstrapConstants.RESOURCE.equals(properties.getOauthResource())) {
            return "POLICY_BLOCKED";
        }
        return null;
    }

    private OpenAiDeBootstrapErrorCode terminalCapabilityError(
            OpenAiDeBootstrapCapability capability) {
        if (capability.getTerminalCode() == null
                && capability.getStatus()
                        != OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL) {
            return null;
        }
        if (OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name()
                .equals(capability.getTerminalCode())) {
            return OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID;
        }
        return OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE;
    }

    private void terminalizeAttemptForCapabilityError(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapLaunchAttempt attempt,
            OpenAiDeBootstrapErrorCode error,
            Instant now) {
        if (error == OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID) {
            terminalizeForAuthorization(capability, attempt, now);
            return;
        }
        terminalizeForPolicy(
                capability,
                attempt,
                Optional.ofNullable(capability.getTerminalCode()).orElse("POLICY_BLOCKED"),
                now);
    }

    private void terminalizeForAuthorization(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapLaunchAttempt attempt,
            Instant now) {
        capability.setTerminalCode(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID.name());
        if (capability.getInvalidatedAt() == null) {
            capability.setInvalidatedAt(now);
        }
        capability.setStatus(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
        terminalizeAttempt(
                attempt,
                OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID,
                now);
        extendCapabilityRetention(capability, attempt.getRecordExpiresAt());
        attempts.saveAndFlush(attempt);
        capabilities.saveAndFlush(capability);
    }

    private void terminalizeConsumedAttempt(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapLaunchAttempt attempt,
            OpenAiDeBootstrapErrorCode error,
            Instant now) {
        terminalizeAttempt(attempt, error, now);
        capability.setStatus(OpenAiDeBootstrapCapabilityStatus.CONSUMED);
        extendCapabilityRetention(capability, attempt.getRecordExpiresAt());
        attempts.saveAndFlush(attempt);
        capabilities.saveAndFlush(capability);
    }

    private void terminalizeAttempt(
            OpenAiDeBootstrapLaunchAttempt attempt,
            OpenAiDeBootstrapErrorCode error,
            Instant now) {
        attempt.setStatus(OpenAiDeBootstrapAttemptStatus.FAILED_TERMINAL);
        attempt.setTerminalCode(error.name());
        attempt.setCompletedAt(now);
        attempt.setResponseExpiresAt(null);
        attempt.clearExpiredDelivery();
        if (attempt.getRecordExpiresAt() == null) {
            attempt.setRecordExpiresAt(now.plus(OpenAiDeBootstrapConstants.TOMBSTONE_TTL));
        }
    }

    private boolean extendCapabilityRetention(
            OpenAiDeBootstrapCapability capability,
            Instant retainUntil) {
        if (retainUntil == null
                || capability.getRecordExpiresAt() != null
                        && !retainUntil.isAfter(capability.getRecordExpiresAt())) {
            return false;
        }
        capability.setRecordExpiresAt(retainUntil);
        return true;
    }

    private void terminalizeForPolicy(
            OpenAiDeBootstrapCapability capability,
            OpenAiDeBootstrapLaunchAttempt attempt,
            String reason,
            Instant now) {
        if (capability.getTerminalCode() == null) {
            capability.setTerminalCode(reason);
            capability.setInvalidatedAt(now);
        }
        capability.setStatus(OpenAiDeBootstrapCapabilityStatus.INVALIDATED_TERMINAL);
        terminalizeAttempt(
                attempt,
                OpenAiDeBootstrapErrorCode.POLICY_UNAVAILABLE,
                now);
        extendCapabilityRetention(capability, attempt.getRecordExpiresAt());
        attempts.saveAndFlush(attempt);
        capabilities.saveAndFlush(capability);
    }

    private static OpenAiDeBootstrapException failure(OpenAiDeBootstrapErrorCode code) {
        return new OpenAiDeBootstrapException(code);
    }

    private static OpenAiDeBootstrapException transientDeliveryFailure(RuntimeException cause) {
        return new OpenAiDeBootstrapException(
                OpenAiDeBootstrapErrorCode.DELIVERY_UNAVAILABLE,
                cause);
    }
}
