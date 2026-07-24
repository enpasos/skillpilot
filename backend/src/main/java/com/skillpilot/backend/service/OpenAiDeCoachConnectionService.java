package com.skillpilot.backend.service;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.OpenAiDeConnectStartResponse;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBindingGrant;
import com.skillpilot.backend.domain.OpenAiDeConnection;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.domain.OpenAiDePendingLaunch;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBindingGrantRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.repository.OpenAiDePendingLaunchRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Owns the browser-to-OAuth binding and provider-specific learner connection
 * lifecycle for the German ChatGPT app.
 *
 * <p>The permanent SkillPilot ID is never an OAuth principal. A short-lived,
 * one-time browser grant creates a random OpenAI-DE connection subject which
 * is the only identity visible to the authorization server and MCP layer.</p>
 */
@Service
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public class OpenAiDeCoachConnectionService {

    public static final String BINDING_COOKIE_NAME = "skillpilot_openai_de_binding";
    public static final String BROWSER_SESSION_COOKIE_NAME = "skillpilot_openai_de_browser";
    public static final String AUTHORIZATION_PATH = "/api/openai/de/oauth2/authorize";
    public static final String BROWSER_SESSION_COOKIE_PATH = "/api";

    public record BindingGrant(String token, OpenAiDeConnectStartResponse response) {
    }

    private record NormalizedLaunch(
            String client,
            String selectedCurriculum,
            LaunchIntentType type,
            String goalId,
            Integer batchSize,
            String courseLevel) {
    }

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String WRITES_DISABLED_MESSAGE =
            "OpenAI-DE state changes are temporarily disabled.";
    private static final Duration REVOKED_CONNECTION_RETENTION = Duration.ofDays(30);
    private static final String ABI26_GK_GOAL_ID = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";
    private static final String ABI26_LK_GOAL_ID = "68a262fc-43f4-5d23-af30-853870bfd45b";

    private final OpenAiDeBindingGrantRepository bindingGrantRepository;
    private final OpenAiDeConnectionRepository connectionRepository;
    private final OpenAiDeLearningSessionRepository learningSessionRepository;
    private final OpenAiDePendingLaunchRepository pendingLaunchRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerService learnerService;
    private final LandscapeService landscapeService;
    private final JdbcOperations jdbcOperations;
    private final OpenAiDeProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] hashSecret;

    public OpenAiDeCoachConnectionService(
            OpenAiDeBindingGrantRepository bindingGrantRepository,
            OpenAiDeConnectionRepository connectionRepository,
            OpenAiDeLearningSessionRepository learningSessionRepository,
            OpenAiDePendingLaunchRepository pendingLaunchRepository,
            LearnerRepository learnerRepository,
            LearnerService learnerService,
            LandscapeService landscapeService,
            JdbcOperations jdbcOperations,
            OpenAiDeProperties properties,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}") String hashSecret) {
        this.bindingGrantRepository = bindingGrantRepository;
        this.connectionRepository = connectionRepository;
        this.learningSessionRepository = learningSessionRepository;
        this.pendingLaunchRepository = pendingLaunchRepository;
        this.learnerRepository = learnerRepository;
        this.learnerService = learnerService;
        this.landscapeService = landscapeService;
        this.jdbcOperations = jdbcOperations;
        this.properties = properties;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    public String createBrowserSessionToken() {
        return generateSecret("spobs_");
    }

    @Transactional
    public BindingGrant createBindingGrant(
            String skillpilotId,
            String rawBrowserSession,
            OpenAiDeCoachStartRequest request) {
        requireProviderEligibilityConfirmation(request);
        NormalizedLaunch launch = normalizeLaunch(request);
        Learner learner = requireLearner(skillpilotId);
        validateLaunchDefinition(learner, launch);
        assertLaunchMutationAllowed(learner, launch);
        Instant now = Instant.now();
        String browserSessionHash = requireBrowserSessionHash(rawBrowserSession);
        Optional<OpenAiDeBindingGrant> existingGrant = bindingGrantRepository
                .findByActiveBrowserSessionHashForUpdate(browserSessionHash);
        if (existingGrant.isPresent()) {
            // A browser may retry after a blocked popup, a cancelled ChatGPT
            // dialog, or an interrupted redirect. Replace the still-open
            // one-time grant instead of trapping the browser in a 409 until
            // its TTL expires. Deleting it first also invalidates any stale
            // binding cookie before the fresh token is returned.
            bindingGrantRepository.delete(existingGrant.get());
            bindingGrantRepository.flush();
        }
        String token = generateSecret("spodb_");

        OpenAiDeBindingGrant grant = new OpenAiDeBindingGrant();
        grant.setTokenHash(hashSecretValue(token));
        grant.setBrowserSessionHash(browserSessionHash);
        grant.setActiveBrowserSessionHash(browserSessionHash);
        grant.setLearner(learner);
        grant.setCreatedAt(now);
        grant.setExpiresAt(now.plus(properties.getBindingTtl()));
        grant.setClient(launch.client());
        grant.setSelectedCurriculum(launch.selectedCurriculum());
        grant.setLaunchIntentType(launch.type().name());
        grant.setLaunchGoalId(launch.goalId());
        grant.setLaunchBatchSize(launch.batchSize());
        grant.setLaunchCourseLevel(launch.courseLevel());
        try {
            bindingGrantRepository.saveAndFlush(grant);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This browser session already has an open OpenAI-DE connection attempt.",
                    exception);
        }

        boolean alreadyConnected = connectionRepository
                .existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfter(
                        learner.getSkillpilotId(), now);
        return new BindingGrant(
                token,
                new OpenAiDeConnectStartResponse(
                        properties.getChatgptUrl(),
                        launchPrompt(launch),
                        grant.getExpiresAt(),
                        alreadyConnected));
    }

    @Transactional
    public String consumeBindingGrant(String rawToken, String rawBrowserSession) {
        String token = trimToNull(rawToken);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing OpenAI-DE binding grant.");
        }
        String browserSessionHash = requireBrowserSessionHash(rawBrowserSession);
        OpenAiDeBindingGrant grant = bindingGrantRepository.findByTokenHashForUpdate(hashSecretValue(token))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid OpenAI-DE binding grant."));
        Instant now = Instant.now();
        if (grant.getConsumedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "OpenAI-DE binding grant has already been used.");
        }
        if (!grant.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.GONE, "OpenAI-DE binding grant has expired.");
        }
        if (!secretHashesEqual(grant.getBrowserSessionHash(), browserSessionHash)
                || !secretHashesEqual(grant.getActiveBrowserSessionHash(), browserSessionHash)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "OpenAI-DE binding grant does not belong to this browser session.");
        }

        String skillpilotId = grant.getLearner().getSkillpilotId();
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for OpenAI-DE binding grant no longer exists."));
        OpenAiDeConnection connection = newConnection(learner, now);
        connectionRepository.save(connection);

        NormalizedLaunch launch = launchFrom(grant);
        pendingLaunchRepository.save(newPendingLaunch(learner, connection.getSubject(), launch, now));

        grant.setConsumedAt(now);
        grant.setConnectionSubject(connection.getSubject());
        grant.setActiveBrowserSessionHash(null);
        bindingGrantRepository.save(grant);
        return connection.getSubject();
    }

    @Transactional
    public OpenAiDeLaunchResponse createPendingLaunch(String skillpilotId, OpenAiDeCoachStartRequest request) {
        requireProviderEligibilityConfirmation(request);
        NormalizedLaunch launchRequest = normalizeLaunch(request);
        Learner learner = requireLearnerForUpdate(skillpilotId);
        Instant now = Instant.now();
        OpenAiDeConnection connection = connectionRepository
                .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfterOrderByCreatedAtDesc(
                        learner.getSkillpilotId(), now)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "ChatGPT is not connected for this learner."));

        OpenAiDePendingLaunch launch = newPendingLaunch(
                learner,
                connection.getSubject(),
                launchRequest,
                now);
        learner = prepareLaunchState(skillpilotId, learner, launchRequest);
        launch.setLearner(learner);
        launch.setConsumedAt(now);
        pendingLaunchRepository.save(launch);
        Instant learningSessionExpiresAt = activateLearningSession(connection.getSubject(), now);

        return new OpenAiDeLaunchResponse(
                launchPrompt(launchRequest),
                properties.getChatgptUrl(),
                learningSessionExpiresAt);
    }

    @Transactional
    public String resolveConnectedSkillpilotId(String connectionSubject) {
        OpenAiDeConnection connection = authorizedConnection(connectionSubject);
        connection.setLastUsedAt(Instant.now());
        connectionRepository.save(connection);
        return connection.getLearner().getSkillpilotId();
    }

    @Transactional
    public String resolveActiveLearningSessionSkillpilotId(String connectionSubject) {
        OpenAiDeConnection connection = authorizedConnection(connectionSubject);
        Instant now = Instant.now();
        OpenAiDeLearningSession learningSession = learningSessionRepository
                .findById(connection.getSubject())
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        if (!learningSession.getExpiresAt().isAfter(now)) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        connection.setLastUsedAt(now);
        connectionRepository.save(connection);
        return connection.getLearner().getSkillpilotId();
    }

    @Transactional
    public void markOAuthConnected(String connectionSubject, Instant oauthExpiresAt) {
        String normalizedSubject = trimToNull(connectionSubject);
        if (normalizedSubject == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing OpenAI-DE connection subject.");
        }
        String skillpilotId = connectionRepository.findLearnerSkillpilotIdBySubject(normalizedSubject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown OpenAI-DE connection."));
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for OpenAI-DE connection no longer exists."));
        OpenAiDeConnection connection = connectionRepository.findBySubjectForUpdate(normalizedSubject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown OpenAI-DE connection."));
        if (connection.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI-DE connection has been revoked.");
        }
        Instant now = Instant.now();
        Instant normalizedExpiry = requireFutureOAuthExpiry(oauthExpiresAt, now);

        Optional<OpenAiDePendingLaunch> pendingLaunch = pendingLaunchRepository
                .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                        connection.getSubject(), now);
        if (pendingLaunch.isPresent()) {
            OpenAiDePendingLaunch launch = pendingLaunch.get();
            learner = prepareLaunchState(skillpilotId, learner, launchFrom(launch));
            launch.setLearner(learner);
            // For pending launches, consumed means that the backend state was
            // applied successfully. It is intentionally unrelated to any MCP
            // request or concrete ChatGPT conversation.
            launch.setConsumedAt(Instant.now());
            pendingLaunchRepository.save(launch);
            activateLearningSession(connection.getSubject(), now);
        }

        connection.setLastAuthorizedAt(now);
        connection.setOauthExpiresAt(normalizedExpiry);
        connectionRepository.save(connection);

        List<OpenAiDeConnection> replacedConnections = connectionRepository
                .findAllByLearnerSkillpilotIdAndRevokedAtIsNull(connection.getLearner().getSkillpilotId())
                .stream()
                .filter(candidate -> !candidate.getSubject().equals(connection.getSubject()))
                .filter(candidate -> candidate.getLastAuthorizedAt() != null)
                .toList();
        revokeConnections(replacedConnections, now);
    }

    @Transactional
    public void updateOAuthAuthorizationExpiry(String connectionSubject, Instant oauthExpiresAt) {
        String normalizedSubject = trimToNull(connectionSubject);
        if (normalizedSubject == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing OpenAI-DE connection subject.");
        }
        String skillpilotId = connectionRepository.findLearnerSkillpilotIdBySubject(normalizedSubject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown OpenAI-DE connection."));
        learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for OpenAI-DE connection no longer exists."));
        OpenAiDeConnection connection = connectionRepository.findBySubjectForUpdate(normalizedSubject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown OpenAI-DE connection."));
        if (connection.getRevokedAt() != null || connection.getLastAuthorizedAt() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI-DE connection is not active.");
        }
        connection.setOauthExpiresAt(requireFutureOAuthExpiry(oauthExpiresAt, Instant.now()));
        connectionRepository.save(connection);
    }

    @Transactional
    public void revokeConnectionSubject(String connectionSubject) {
        String normalizedSubject = trimToNull(connectionSubject);
        if (normalizedSubject == null) {
            return;
        }
        Optional<String> skillpilotId = connectionRepository.findLearnerSkillpilotIdBySubject(normalizedSubject);
        if (skillpilotId.isEmpty()) {
            return;
        }
        learnerRepository.findBySkillpilotIdForUpdate(skillpilotId.get())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for OpenAI-DE connection no longer exists."));
        connectionRepository.findBySubjectForUpdate(normalizedSubject)
                .filter(connection -> connection.getRevokedAt() == null)
                .ifPresent(connection -> revokeConnections(List.of(connection), Instant.now()));
    }

    @Scheduled(fixedDelayString = "${skillpilot.openai.de.cleanup-interval-ms:3600000}")
    @Transactional
    public void cleanupExpiredLaunchState() {
        Instant now = Instant.now();
        List<OpenAiDeConnection> abandonedConnections = connectionRepository
                .findAllByLastAuthorizedAtIsNullAndRevokedAtIsNullAndCreatedAtLessThanEqual(
                        now.minus(properties.getLaunchTtl()));
        revokeConnections(abandonedConnections, now);
        List<OpenAiDeConnection> expiredConnections = new java.util.ArrayList<>(connectionRepository
                .findAllByLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtIsNull());
        expiredConnections.addAll(connectionRepository
                .findAllByLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtLessThanEqual(now));
        revokeConnections(expiredConnections, now);
        pendingLaunchRepository.deleteByExpiresAtLessThanEqual(now);
        bindingGrantRepository.deleteByExpiresAtLessThanEqual(now);
        learningSessionRepository.deleteByExpiresAtLessThanEqual(now);
        connectionRepository.deleteByRevokedAtLessThanEqual(now.minus(REVOKED_CONNECTION_RETENTION));
    }

    @Transactional
    public void disconnect(String skillpilotId) {
        Learner learner = requireLearnerForUpdate(skillpilotId);
        List<OpenAiDeConnection> connections = connectionRepository
                .findAllByLearnerSkillpilotIdAndRevokedAtIsNull(learner.getSkillpilotId());
        revokeConnections(connections, Instant.now());
    }

    @Transactional(readOnly = true)
    public boolean isConnected(String skillpilotId) {
        requireLearner(skillpilotId);
        return connectionRepository
                .existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullAndOauthExpiresAtAfter(
                        skillpilotId, Instant.now());
    }

    private Learner requireLearner(String skillpilotId) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "skillpilotId must not be empty.");
        }
        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        return learnerService.getLearner(skillpilotId);
    }

    private Learner requireLearnerForUpdate(String skillpilotId) {
        Learner learner = requireLearner(skillpilotId);
        return learnerRepository.findBySkillpilotIdForUpdate(learner.getSkillpilotId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found."));
    }

    private OpenAiDeConnection authorizedConnection(String subject) {
        OpenAiDeConnection connection = connection(subject);
        if (connection.getLastAuthorizedAt() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI-DE connection is not authorized.");
        }
        if (connection.getOauthExpiresAt() == null || !connection.getOauthExpiresAt().isAfter(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI-DE connection credentials expired.");
        }
        return connection;
    }

    private OpenAiDeConnection connection(String subject) {
        String normalized = trimToNull(subject);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing OpenAI-DE connection subject.");
        }
        OpenAiDeConnection connection = connectionRepository.findById(normalized)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown OpenAI-DE connection."));
        if (connection.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OpenAI-DE connection has been revoked.");
        }
        return connection;
    }

    private OpenAiDeConnection newConnection(Learner learner, Instant now) {
        OpenAiDeConnection connection = new OpenAiDeConnection();
        connection.setSubject(generateSecret("spod_"));
        connection.setLearner(learner);
        connection.setCreatedAt(now);
        return connection;
    }

    private Learner prepareLaunchState(
            String skillpilotId,
            Learner learner,
            NormalizedLaunch launch) {
        // Revalidate immediately before mutation. The same read-only validation
        // also runs before a browser binding grant is returned, but curriculum
        // content may change before OAuth completes.
        validateLaunchDefinition(learner, launch);
        assertLaunchMutationAllowed(learner, launch);
        if (launch.selectedCurriculum() != null
                && !launch.selectedCurriculum().equals(learner.getSelectedCurriculum())) {
            learnerService.assertWritableLearningSession(skillpilotId);
            learnerService.setCurriculum(skillpilotId, launch.selectedCurriculum());
            learner = learnerService.getLearner(skillpilotId);
        }
        if (launch.type() == LaunchIntentType.VERIFIED_RECALL) {
            if (!launch.goalId().equals(learner.getActiveGoalId())) {
                learnerService.assertWritableLearningSession(skillpilotId);
                learnerService.setActiveGoal(skillpilotId, launch.goalId());
                learner = learnerService.getLearner(skillpilotId);
            }
            validateVerifiedRecallGoal(skillpilotId, launch.goalId());
        } else if (launch.type() == LaunchIntentType.ABI26_EXAM) {
            validateAbi26TargetPair(launch.goalId(), launch.courseLevel());
            if (!launch.goalId().equals(learner.getActiveGoalId())) {
                learnerService.assertWritableLearningSession(skillpilotId);
                learnerService.setActiveGoal(skillpilotId, launch.goalId());
                learner = learnerService.getLearner(skillpilotId);
            }
            validateAbi26Goal(skillpilotId, launch.goalId(), launch.courseLevel());
        }
        return learner;
    }

    private void assertLaunchMutationAllowed(Learner learner, NormalizedLaunch launch) {
        boolean changesCurriculum = launch.selectedCurriculum() != null
                && !launch.selectedCurriculum().equals(learner.getSelectedCurriculum());
        boolean changesActiveGoal = (launch.type() == LaunchIntentType.VERIFIED_RECALL
                        || launch.type() == LaunchIntentType.ABI26_EXAM)
                && !launch.goalId().equals(learner.getActiveGoalId());
        if (!properties.isWritesEnabled() && (changesCurriculum || changesActiveGoal)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, WRITES_DISABLED_MESSAGE);
        }
    }

    private OpenAiDePendingLaunch newPendingLaunch(
            Learner learner,
            String connectionSubject,
            NormalizedLaunch launchRequest,
            Instant now) {
        OpenAiDePendingLaunch launch = new OpenAiDePendingLaunch();
        launch.setId(UUID.randomUUID().toString());
        launch.setLearner(learner);
        launch.setConnectionSubject(connectionSubject);
        launch.setCreatedAt(now);
        launch.setExpiresAt(now.plus(properties.getLaunchTtl()));
        launch.setSelectedCurriculum(launchRequest.selectedCurriculum());
        launch.setClient(launchRequest.client());
        launch.setLaunchIntentType(launchRequest.type().name());
        launch.setLaunchGoalId(launchRequest.goalId());
        launch.setLaunchBatchSize(launchRequest.batchSize());
        launch.setLaunchCourseLevel(launchRequest.courseLevel());
        return launch;
    }

    private Instant activateLearningSession(String connectionSubject, Instant startedAt) {
        OpenAiDeLearningSession learningSession = learningSessionRepository
                .findById(connectionSubject)
                .orElseGet(OpenAiDeLearningSession::new);
        learningSession.setConnectionSubject(connectionSubject);
        learningSession.setStartedAt(startedAt);
        Instant expiresAt = startedAt.plus(properties.getLearningSessionTtl());
        learningSession.setExpiresAt(expiresAt);
        learningSessionRepository.save(learningSession);
        return expiresAt;
    }

    private NormalizedLaunch launchFrom(OpenAiDeBindingGrant grant) {
        return new NormalizedLaunch(
                grant.getClient(),
                grant.getSelectedCurriculum(),
                persistedIntentType(grant.getLaunchIntentType()),
                grant.getLaunchGoalId(),
                grant.getLaunchBatchSize(),
                grant.getLaunchCourseLevel());
    }

    private NormalizedLaunch launchFrom(OpenAiDePendingLaunch launch) {
        return new NormalizedLaunch(
                launch.getClient(),
                launch.getSelectedCurriculum(),
                persistedIntentType(launch.getLaunchIntentType()),
                launch.getLaunchGoalId(),
                launch.getLaunchBatchSize(),
                launch.getLaunchCourseLevel());
    }

    private void validateVerifiedRecallGoal(String skillpilotId, String goalId) {
        FrontierGoal activeGoal = requirePreparedActiveGoal(skillpilotId, goalId, "VERIFIED_RECALL");
        boolean memoryGoal = "memory".equalsIgnoreCase(activeGoal.nodeKind())
                || activeGoal.tags() != null && activeGoal.tags().stream()
                        .filter(java.util.Objects::nonNull)
                        .anyMatch(tag -> "memorization".equals(tag) || tag.startsWith("srs-deck"));
        if (!"atomic".equalsIgnoreCase(activeGoal.type()) || !memoryGoal) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "VERIFIED_RECALL requires an atomic Memory/SRS goal from the current learner state.");
        }
    }

    private void validateLaunchDefinition(Learner learner, NormalizedLaunch launch) {
        String curriculumId = launch.selectedCurriculum() != null
                ? launch.selectedCurriculum()
                : trimToNull(learner.getSelectedCurriculum());
        LearningLandscape curriculum = curriculumId == null ? null : landscapeService.getById(curriculumId);
        if (launch.selectedCurriculum() != null && curriculum == null) {
            throw badLaunchRequest("selectedCurriculum is not a known curriculum.");
        }
        if (curriculum != null && landscapeService.isCompatibilityOnlyLandscape(curriculumId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "selectedCurriculum is compatibility-only and cannot be activated.");
        }
        if (launch.type() == LaunchIntentType.CURRENT_UNIT) {
            return;
        }
        if (curriculum == null) {
            throw badLaunchRequest("A selected curriculum is required for " + launch.type() + ".");
        }
        if (launch.type() == LaunchIntentType.ABI26_EXAM) {
            validateAbi26TargetPair(launch.goalId(), launch.courseLevel());
        }

        LearningGoal goal = findGoalInCurriculum(curriculum, curriculumId, launch.goalId())
                .orElseThrow(() -> badLaunchRequest(
                        "launchIntent.goalId is not part of the selected curriculum."));
        if (launch.type() == LaunchIntentType.VERIFIED_RECALL) {
            if (!isAtomic(goal) || !isMemoryOrSrsGoal(goal)) {
                throw badLaunchRequest(
                        "VERIFIED_RECALL requires an atomic Memory/SRS goal from the selected curriculum.");
            }
            return;
        }

        boolean matchingCourseTag = goal.getTags() != null
                && goal.getTags().stream().anyMatch(launch.courseLevel()::equals);
        if (!isAtomic(goal) || goal.getExamData() == null || !matchingCourseTag) {
            throw badLaunchRequest(
                    "ABI26_EXAM requires the released exam goal for the selected course level.");
        }
    }

    private Optional<LearningGoal> findGoalInCurriculum(
            LearningLandscape curriculum,
            String curriculumId,
            String goalId) {
        List<LearningLandscape> landscapes = new java.util.ArrayList<>(landscapeService.getClosure(curriculumId));
        if (landscapes.stream().noneMatch(candidate -> curriculumId.equals(candidate.getLandscapeId()))) {
            landscapes.add(curriculum);
        }
        return landscapes.stream()
                .filter(java.util.Objects::nonNull)
                .flatMap(candidate -> candidate.getGoals() == null
                        ? java.util.stream.Stream.empty()
                        : candidate.getGoals().stream())
                .filter(goal -> goalId.equals(goal.getId()))
                .findFirst();
    }

    private boolean isAtomic(LearningGoal goal) {
        String type = trimToNull(goal.getType());
        return type == null
                ? goal.getContains() == null || goal.getContains().isEmpty()
                : "atomic".equalsIgnoreCase(type);
    }

    private boolean isMemoryOrSrsGoal(LearningGoal goal) {
        if ("memory".equalsIgnoreCase(goal.getNodeKind())) {
            return true;
        }
        if (goal.getExtendedData() != null
                && goal.getExtendedData().get("vocabularySource") instanceof String source
                && !source.isBlank()) {
            return true;
        }
        return goal.getTags() != null && goal.getTags().stream()
                .filter(java.util.Objects::nonNull)
                .anyMatch(tag -> "memorization".equals(tag) || tag.startsWith("srs-deck"));
    }

    private void validateAbi26TargetPair(String goalId, String courseLevel) {
        String expectedGoalId = "LK".equals(courseLevel) ? ABI26_LK_GOAL_ID : ABI26_GK_GOAL_ID;
        if (!expectedGoalId.equals(goalId)) {
            throw badLaunchRequest("ABI26_EXAM goalId does not match the selected course level.");
        }
    }

    private void validateAbi26Goal(String skillpilotId, String goalId, String courseLevel) {
        FrontierGoal activeGoal = requirePreparedActiveGoal(skillpilotId, goalId, "ABI26_EXAM");
        boolean matchingCourseTag = activeGoal.tags() != null
                && activeGoal.tags().stream().anyMatch(courseLevel::equals);
        if (!"atomic".equalsIgnoreCase(activeGoal.type())
                || activeGoal.examData() == null
                || !matchingCourseTag) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "ABI26_EXAM requires the released exam goal for the selected course level.");
        }
    }

    private FrontierGoal requirePreparedActiveGoal(String skillpilotId, String goalId, String intentName) {
        var state = learnerService.getLearnerState(skillpilotId);
        FrontierGoal activeGoal = state == null ? null : state.activeGoal();
        if (activeGoal == null || !goalId.equals(activeGoal.id())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    intentName + " target is not the active goal in the current learner state.");
        }
        return activeGoal;
    }

    private LaunchIntentType persistedIntentType(String value) {
        String normalized = trimToNull(value);
        if (normalized == null) {
            return LaunchIntentType.CURRENT_UNIT;
        }
        try {
            return LaunchIntentType.valueOf(normalized);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("Unknown persisted OpenAI-DE launch intent: " + normalized, exception);
        }
    }

    private NormalizedLaunch normalizeLaunch(OpenAiDeCoachStartRequest request) {
        String language = trimToNull(request == null ? null : request.language());
        if (language != null && !language.toLowerCase(java.util.Locale.ROOT).startsWith("de")) {
            throw badLaunchRequest("language must select the German OpenAI coach.");
        }
        String client = trimAndValidateLength(
                request == null ? null : request.client(),
                "client",
                64);
        String selectedCurriculum = trimAndValidateLength(
                request == null ? null : request.selectedCurriculum(),
                "selectedCurriculum",
                255);
        OpenAiDeCoachStartRequest.LaunchIntent requestedIntent =
                request == null ? null : request.launchIntent();
        if (requestedIntent == null) {
            return new NormalizedLaunch(
                    client,
                    selectedCurriculum,
                    LaunchIntentType.CURRENT_UNIT,
                    null,
                    null,
                    null);
        }
        LaunchIntentType type = requestedIntent.type();
        if (type == null) {
            throw badLaunchRequest("launchIntent.type must not be empty.");
        }
        String goalId = trimAndValidateLength(requestedIntent.goalId(), "launchIntent.goalId", 255);
        Integer batchSize = requestedIntent.batchSize();
        String courseLevel = trimToNull(requestedIntent.courseLevel());
        return switch (type) {
            case CURRENT_UNIT -> {
                requireAbsent(goalId, batchSize, courseLevel, type);
                yield new NormalizedLaunch(client, selectedCurriculum, type, null, null, null);
            }
            case VERIFIED_RECALL -> {
                if (goalId == null) {
                    throw badLaunchRequest("launchIntent.goalId is required for VERIFIED_RECALL.");
                }
                if (batchSize == null || batchSize < 1 || batchSize > 20) {
                    throw badLaunchRequest("launchIntent.batchSize must be between 1 and 20 for VERIFIED_RECALL.");
                }
                if (courseLevel != null) {
                    throw badLaunchRequest("launchIntent.courseLevel is not allowed for VERIFIED_RECALL.");
                }
                yield new NormalizedLaunch(client, selectedCurriculum, type, goalId, batchSize, null);
            }
            case ABI26_EXAM -> {
                if (goalId == null) {
                    throw badLaunchRequest("launchIntent.goalId is required for ABI26_EXAM.");
                }
                if (batchSize != null) {
                    throw badLaunchRequest("launchIntent.batchSize is not allowed for ABI26_EXAM.");
                }
                String normalizedCourseLevel = courseLevel == null
                        ? null
                        : courseLevel.toUpperCase(java.util.Locale.ROOT);
                if (!"GK".equals(normalizedCourseLevel) && !"LK".equals(normalizedCourseLevel)) {
                    throw badLaunchRequest("launchIntent.courseLevel must be GK or LK for ABI26_EXAM.");
                }
                yield new NormalizedLaunch(
                        client,
                        selectedCurriculum,
                        type,
                        goalId,
                        null,
                        normalizedCourseLevel);
            }
        };
    }

    private void requireProviderEligibilityConfirmation(OpenAiDeCoachStartRequest request) {
        if (request == null || !Boolean.TRUE.equals(request.providerEligibilityConfirmed())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Provider eligibility confirmation is required before starting the OpenAI coach.");
        }
    }

    private void requireAbsent(
            String goalId,
            Integer batchSize,
            String courseLevel,
            LaunchIntentType type) {
        if (goalId != null || batchSize != null || courseLevel != null) {
            throw badLaunchRequest("No launch-specific fields are allowed for " + type + ".");
        }
    }

    private String launchPrompt(NormalizedLaunch launch) {
        return switch (launch.type()) {
            case CURRENT_UNIT ->
                    "Verwende die App SkillPilot Coach (Deutsch) und fahre mit dem in SkillPilot vorbereiteten "
                            + "nächsten Schritt fort.";
            case VERIFIED_RECALL ->
                    "Verwende die App SkillPilot Coach (Deutsch) und starte für mein aktuell ausgewähltes Lernziel "
                            + "eine harte Kartenprüfung mit " + launch.batchSize() + " Karten.";
            case ABI26_EXAM ->
                    "Verwende die App SkillPilot Coach (Deutsch) und starte im Prüfungsmodus mit meiner im Cockpit "
                            + "ausgewählten Mathematik-Abituraufgabe für den "
                            + ("LK".equals(launch.courseLevel()) ? "Leistungskurs." : "Grundkurs.");
        };
    }

    private String trimAndValidateLength(String value, String field, int maxLength) {
        String normalized = trimToNull(value);
        if (normalized != null && normalized.length() > maxLength) {
            throw badLaunchRequest(field + " must not exceed " + maxLength + " characters.");
        }
        return normalized;
    }

    private ResponseStatusException badLaunchRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private void revokeConnections(List<OpenAiDeConnection> connections, Instant revokedAt) {
        if (connections.isEmpty()) {
            return;
        }
        List<String> subjects = connections.stream()
                .map(OpenAiDeConnection::getSubject)
                .toList();
        connections.forEach(connection -> connection.setRevokedAt(revokedAt));
        connectionRepository.saveAll(connections);
        learningSessionRepository.deleteAllById(subjects);
        pendingLaunchRepository.deleteAllByConnectionSubjectIn(subjects);
        subjects.forEach(subject -> {
            jdbcOperations.update("DELETE FROM oauth2_authorization WHERE principal_name = ?", subject);
            jdbcOperations.update("DELETE FROM oauth2_authorization_consent WHERE principal_name = ?", subject);
        });
    }

    private String generateSecret(String prefix) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return prefix + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashSecretValue(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hashSecret, HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not hash OpenAI-DE credential.", exception);
        }
    }

    private String requireBrowserSessionHash(String rawBrowserSession) {
        String browserSession = trimToNull(rawBrowserSession);
        if (browserSession == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing OpenAI-DE browser session.");
        }
        return hashSecretValue(browserSession);
    }

    private boolean secretHashesEqual(String left, String right) {
        return left != null
                && right != null
                && MessageDigest.isEqual(
                        left.getBytes(StandardCharsets.US_ASCII),
                        right.getBytes(StandardCharsets.US_ASCII));
    }

    private Instant requireFutureOAuthExpiry(Instant oauthExpiresAt, Instant now) {
        if (oauthExpiresAt == null || !oauthExpiresAt.isAfter(now)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "OpenAI-DE OAuth credentials are missing or expired.");
        }
        return oauthExpiresAt;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
