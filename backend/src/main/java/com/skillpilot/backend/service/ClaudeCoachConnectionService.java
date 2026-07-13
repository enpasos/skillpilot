package com.skillpilot.backend.service;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ClaudeConnectStartResponse;
import com.skillpilot.backend.api.ClaudeLaunchResponse;
import com.skillpilot.backend.domain.ClaudeBindingGrant;
import com.skillpilot.backend.domain.ClaudeConnection;
import com.skillpilot.backend.domain.ClaudePendingLaunch;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ClaudeBindingGrantRepository;
import com.skillpilot.backend.repository.ClaudeConnectionRepository;
import com.skillpilot.backend.repository.ClaudePendingLaunchRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ClaudeCoachConnectionService {

    public static final String BINDING_COOKIE_NAME = "skillpilot_claude_binding";

    public record BindingGrant(String token, ClaudeConnectStartResponse response) {
    }

    public record PendingLaunch(
            String id,
            String language,
            String selectedCurriculum,
            Instant expiresAt) {
    }

    private static final String HMAC_ALGORITHM = "HmacSHA256";

    private final ClaudeBindingGrantRepository bindingGrantRepository;
    private final ClaudeConnectionRepository connectionRepository;
    private final ClaudePendingLaunchRepository pendingLaunchRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerService learnerService;
    private final JdbcOperations jdbcOperations;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Duration bindingTtl;
    private final Duration launchTtl;
    private final byte[] hashSecret;
    private final String mcpUrl;

    public ClaudeCoachConnectionService(
            ClaudeBindingGrantRepository bindingGrantRepository,
            ClaudeConnectionRepository connectionRepository,
            ClaudePendingLaunchRepository pendingLaunchRepository,
            LearnerRepository learnerRepository,
            LearnerService learnerService,
            JdbcOperations jdbcOperations,
            @Value("${skillpilot.claude.binding-ttl:PT5M}") Duration bindingTtl,
            @Value("${skillpilot.claude.launch-ttl:PT5M}") Duration launchTtl,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}") String hashSecret,
            @Value("${skillpilot.claude.mcp-url:https://skillpilot.com/api/claude/mcp}") String mcpUrl) {
        this.bindingGrantRepository = bindingGrantRepository;
        this.connectionRepository = connectionRepository;
        this.pendingLaunchRepository = pendingLaunchRepository;
        this.learnerRepository = learnerRepository;
        this.learnerService = learnerService;
        this.jdbcOperations = jdbcOperations;
        this.bindingTtl = bindingTtl;
        this.launchTtl = launchTtl;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
        this.mcpUrl = stripTrailingSlash(mcpUrl);
    }

    @Transactional
    public BindingGrant createBindingGrant(String skillpilotId, ChatStartRequest request) {
        Learner learner = requireLearner(skillpilotId);
        Instant now = Instant.now();
        String token = generateSecret("spcb_");

        ClaudeBindingGrant grant = new ClaudeBindingGrant();
        grant.setTokenHash(hashSecretValue(token));
        grant.setLearner(learner);
        grant.setCreatedAt(now);
        grant.setExpiresAt(now.plus(bindingTtl));
        grant.setLanguage(normalizeLanguage(request == null ? null : request.language()));
        grant.setClient(trimToNull(request == null ? null : request.client()));
        bindingGrantRepository.save(grant);

        String installUrl = "https://claude.ai/customize/connectors"
                + "?modal=add-custom-connector"
                + "&connectorName=SkillPilot"
                + "&connectorUrl=" + URLEncoder.encode(mcpUrl, StandardCharsets.UTF_8);
        boolean alreadyConnected = connectionRepository
                .existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNull(
                        learner.getSkillpilotId());
        return new BindingGrant(
                token,
                new ClaudeConnectStartResponse(installUrl, grant.getExpiresAt(), alreadyConnected));
    }

    @Transactional
    public String consumeBindingGrant(String rawToken) {
        String token = trimToNull(rawToken);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Claude binding grant.");
        }
        ClaudeBindingGrant grant = bindingGrantRepository.findByTokenHashForUpdate(hashSecretValue(token))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Claude binding grant."));
        Instant now = Instant.now();
        if (grant.getConsumedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Claude binding grant has already been used.");
        }
        if (!grant.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.GONE, "Claude binding grant has expired.");
        }

        String skillpilotId = grant.getLearner().getSkillpilotId();
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for Claude binding grant no longer exists."));
        // Each OAuth ceremony receives a new opaque subject. The previously
        // authorized connection remains usable until this one actually obtains
        // an access token; markOAuthConnected then performs the atomic replace.
        ClaudeConnection connection = newConnection(learner, now);
        connectionRepository.save(connection);

        grant.setConsumedAt(now);
        grant.setConnectionSubject(connection.getSubject());
        bindingGrantRepository.save(grant);
        return connection.getSubject();
    }

    @Transactional
    public ClaudeLaunchResponse createPendingLaunch(String skillpilotId, ChatStartRequest request) {
        Learner learner = requireLearnerForUpdate(skillpilotId);
        ClaudeConnection connection = connectionRepository
                .findFirstByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNullOrderByCreatedAtDesc(
                        learner.getSkillpilotId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Claude is not connected for this learner."));
        String selectedCurriculum = trimToNull(request == null ? null : request.selectedCurriculum());
        if (selectedCurriculum != null && !selectedCurriculum.equals(learner.getSelectedCurriculum())) {
            learnerService.assertWritableLearningSession(skillpilotId);
            learnerService.setCurriculum(skillpilotId, selectedCurriculum);
            learner = learnerService.getLearner(skillpilotId);
        }

        Instant now = Instant.now();
        ClaudePendingLaunch launch = new ClaudePendingLaunch();
        launch.setId(UUID.randomUUID().toString());
        launch.setLearner(learner);
        launch.setConnectionSubject(connection.getSubject());
        launch.setCreatedAt(now);
        launch.setExpiresAt(now.plus(launchTtl));
        launch.setLanguage(normalizeLanguage(request == null ? null : request.language()));
        launch.setSelectedCurriculum(selectedCurriculum);
        launch.setClient(trimToNull(request == null ? null : request.client()));
        pendingLaunchRepository.save(launch);

        String prompt = "en".equals(launch.getLanguage())
                ? "Use the SkillPilot connector and start my current learning session."
                : "Verwende den SkillPilot-Connector und starte meine aktuelle Lerneinheit.";
        String desktopUrl = "claude://claude.ai/new?q=" + URLEncoder.encode(prompt, StandardCharsets.UTF_8);
        return new ClaudeLaunchResponse(prompt, "https://claude.ai/new", desktopUrl, launch.getExpiresAt());
    }

    @Transactional
    public Optional<PendingLaunch> consumePendingLaunch(String connectionSubject) {
        ClaudeConnection connection = authorizedConnection(connectionSubject);
        Instant now = Instant.now();
        connection.setLastUsedAt(now);
        connectionRepository.save(connection);

        return pendingLaunchRepository
                .findFirstByConnectionSubjectAndConsumedAtIsNullAndExpiresAtAfterOrderByCreatedAtDesc(
                        connection.getSubject(), now)
                .map(launch -> {
                    launch.setConsumedAt(now);
                    pendingLaunchRepository.save(launch);
                    return new PendingLaunch(
                            launch.getId(),
                            launch.getLanguage(),
                            launch.getSelectedCurriculum(),
                            launch.getExpiresAt());
                });
    }

    @Transactional
    public String resolveSkillpilotId(String connectionSubject) {
        ClaudeConnection connection = authorizedConnection(connectionSubject);
        connection.setLastUsedAt(Instant.now());
        connectionRepository.save(connection);
        return connection.getLearner().getSkillpilotId();
    }

    @Transactional
    public void markOAuthConnected(String connectionSubject) {
        String normalizedSubject = trimToNull(connectionSubject);
        if (normalizedSubject == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Claude connection subject.");
        }
        String skillpilotId = connectionRepository.findLearnerSkillpilotIdBySubject(normalizedSubject)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Unknown Claude connection."));
        learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Learner for Claude connection no longer exists."));
        ClaudeConnection connection = connection(connectionSubject);
        Instant now = Instant.now();
        connection.setLastAuthorizedAt(now);
        connectionRepository.save(connection);

        List<ClaudeConnection> replacedConnections = connectionRepository
                .findAllByLearnerSkillpilotIdAndRevokedAtIsNull(connection.getLearner().getSkillpilotId())
                .stream()
                .filter(candidate -> !candidate.getSubject().equals(connection.getSubject()))
                .filter(candidate -> candidate.getLastAuthorizedAt() != null)
                .toList();
        revokeConnections(replacedConnections, now);
    }

    @Transactional
    public void disconnect(String skillpilotId) {
        Learner learner = requireLearnerForUpdate(skillpilotId);
        Instant now = Instant.now();
        List<ClaudeConnection> connections = connectionRepository
                .findAllByLearnerSkillpilotIdAndRevokedAtIsNull(learner.getSkillpilotId());
        revokeConnections(connections, now);
    }

    @Transactional(readOnly = true)
    public boolean isConnected(String skillpilotId) {
        requireLearner(skillpilotId);
        return connectionRepository
                .existsByLearnerSkillpilotIdAndLastAuthorizedAtIsNotNullAndRevokedAtIsNull(skillpilotId);
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

    private ClaudeConnection authorizedConnection(String subject) {
        ClaudeConnection connection = connection(subject);
        if (connection.getLastAuthorizedAt() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Claude connection is not authorized.");
        }
        return connection;
    }

    private ClaudeConnection connection(String subject) {
        String normalized = trimToNull(subject);
        if (normalized == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing Claude connection subject.");
        }
        ClaudeConnection connection = connectionRepository.findById(normalized)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown Claude connection."));
        if (connection.getRevokedAt() != null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Claude connection has been revoked.");
        }
        return connection;
    }

    private ClaudeConnection newConnection(Learner learner, Instant now) {
        ClaudeConnection connection = new ClaudeConnection();
        connection.setSubject(generateSecret("spc_"));
        connection.setLearner(learner);
        connection.setCreatedAt(now);
        return connection;
    }

    private void revokeConnections(List<ClaudeConnection> connections, Instant revokedAt) {
        if (connections.isEmpty()) {
            return;
        }
        List<String> subjects = connections.stream()
                .map(ClaudeConnection::getSubject)
                .toList();
        connections.forEach(connection -> connection.setRevokedAt(revokedAt));
        connectionRepository.saveAll(connections);
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
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash Claude credential.", e);
        }
    }

    private String normalizeLanguage(String value) {
        String normalized = value == null ? "" : value.trim().toLowerCase();
        return normalized.startsWith("en") ? "en" : "de";
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String stripTrailingSlash(String value) {
        String normalized = value == null ? "" : value.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
