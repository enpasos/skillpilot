package com.skillpilot.backend.service;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest;
import com.skillpilot.backend.api.OpenAiDeCoachStartRequest.LaunchIntentType;
import com.skillpilot.backend.api.OpenAiDeLaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.openai.OpenAiCoachLocale;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Owns the independently issued learner-session lifecycle for the
 * language-neutral ChatGPT app.
 *
 * <p>OAuth is deliberately handled outside this service and proves only the
 * predefined confidential ChatGPT app client. The permanent SkillPilot ID is
 * never an OAuth principal. Every UI launch creates a fresh, short-lived
 * learning-session ID that selects the learner on every MCP tool call.</p>
 */
@Service
@ConditionalOnProperty(name = "skillpilot.openai.coach.v1.enabled", havingValue = "true")
public class OpenAiDeCoachConnectionService {

    private record IssuedLearningSession(String id, Instant expiresAt) {
    }

    private record NormalizedLaunch(
            String communicationLocale,
            String client,
            String selectedCurriculum,
            LaunchIntentType type,
            String goalId,
            Integer batchSize,
            String courseLevel) {
    }

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Pattern LEARNING_SESSION_ID_PATTERN =
            Pattern.compile("^sps_[A-Za-z0-9_-]{43}$");
    private static final String WRITES_DISABLED_MESSAGE =
            "OpenAI Coach state changes are temporarily disabled.";
    private static final String ABI26_GK_GOAL_ID = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";
    private static final String ABI26_LK_GOAL_ID = "68a262fc-43f4-5d23-af30-853870bfd45b";

    private final OpenAiDeLearningSessionRepository learningSessionRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerService learnerService;
    private final LandscapeService landscapeService;
    private final OpenAiDeProperties properties;
    private final OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider;
    private final SecureRandom secureRandom = new SecureRandom();
    private final byte[] hashSecret;

    public OpenAiDeCoachConnectionService(
            OpenAiDeLearningSessionRepository learningSessionRepository,
            LearnerRepository learnerRepository,
            LearnerService learnerService,
            LandscapeService landscapeService,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}") String hashSecret) {
        this.learningSessionRepository = learningSessionRepository;
        this.learnerRepository = learnerRepository;
        this.learnerService = learnerService;
        this.landscapeService = landscapeService;
        this.properties = properties;
        this.curriculumRevisionProvider = curriculumRevisionProvider;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Starts a new learner session independently of the OAuth app connection.
     * Every invocation creates exactly one fresh 24-hour learning-session ID.
     */
    @Transactional
    public OpenAiDeLaunchResponse createLaunch(String skillpilotId, OpenAiDeCoachStartRequest request) {
        requireProviderEligibilityConfirmation(request);
        NormalizedLaunch launchRequest = normalizeLaunch(request);
        Learner learner = requireLearnerForUpdate(skillpilotId);
        Instant now = Instant.now();
        learner = prepareLaunchState(skillpilotId, learner, launchRequest);
        IssuedLearningSession learningSession = issueLearningSession(
                learner,
                launchRequest.communicationLocale(),
                now);

        return new OpenAiDeLaunchResponse(
                launchPrompt(launchRequest, learningSession.id()),
                properties.getChatgptUrl(),
                learningSession.id(),
                learningSession.expiresAt());
    }

    @Transactional
    public String resolveActiveLearningSessionSkillpilotId(String rawLearningSessionId) {
        String learningSessionId = trimToNull(rawLearningSessionId);
        if (learningSessionId == null
                || !LEARNING_SESSION_ID_PATTERN.matcher(learningSessionId).matches()) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        Instant now = Instant.now();
        OpenAiDeLearningSession learningSession = learningSessionRepository
                .findById(hashSecretValue(learningSessionId))
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        if (!learningSession.getExpiresAt().isAfter(now)) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        return learningSession.getLearner().getSkillpilotId();
    }

    @Scheduled(fixedDelayString = "${skillpilot.openai.coach.v1.cleanup-interval-ms:3600000}")
    @Transactional
    public void cleanupExpiredLearningSessions() {
        learningSessionRepository.deleteByExpiresAtLessThanEqual(Instant.now());
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
        learner = learnerService.reopenPersonalizationForExplicitLaunch(learner);
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

    private IssuedLearningSession issueLearningSession(
            Learner learner,
            String communicationLocale,
            Instant startedAt) {
        String learningSessionId = generateSecret("sps_");
        OpenAiDeLearningSession learningSession = new OpenAiDeLearningSession();
        learningSession.setTokenHash(hashSecretValue(learningSessionId));
        learningSession.setLearner(learner);
        learningSession.setStartedAt(startedAt);
        Instant expiresAt = startedAt.plus(properties.getLearningSessionTtl());
        learningSession.setExpiresAt(expiresAt);
        learningSession.setContractMajor(OpenAiDeV1ContractMetadata.CONTRACT_MAJOR);
        // Retain the revision visible when the session was issued for
        // diagnostics. Runtime conflict checks always use the canonical
        // learner-scoped revision so later web or parallel-session writes are
        // visible immediately.
        learningSession.setStateVersion(learner.getCoachStateRevision());
        learningSession.setStateSchemaVersion(OpenAiDeV1ContractMetadata.STATE_SCHEMA_VERSION);
        learningSession.setWorkflowVersion(properties.getWorkflowVersion());
        learningSession.setCurriculumRevision(curriculumRevisionProvider.currentRevision());
        learningSession.setCommunicationLocale(communicationLocale);
        learningSessionRepository.save(learningSession);
        return new IssuedLearningSession(learningSessionId, expiresAt);
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
        SkillLandscape curriculum = curriculumId == null ? null : landscapeService.getById(curriculumId);
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
            SkillLandscape curriculum,
            String curriculumId,
            String goalId) {
        List<SkillLandscape> landscapes = new java.util.ArrayList<>(landscapeService.getClosure(curriculumId));
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

    private NormalizedLaunch normalizeLaunch(OpenAiDeCoachStartRequest request) {
        String communicationLocale;
        try {
            communicationLocale = OpenAiCoachLocale.normalize(
                    request == null ? null : request.communicationLocale());
        } catch (IllegalArgumentException exception) {
            throw badLaunchRequest(exception.getMessage());
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
                    communicationLocale,
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
                yield new NormalizedLaunch(
                        communicationLocale,
                        client,
                        selectedCurriculum,
                        type,
                        null,
                        null,
                        null);
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
                yield new NormalizedLaunch(
                        communicationLocale,
                        client,
                        selectedCurriculum,
                        type,
                        goalId,
                        batchSize,
                        null);
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
                        communicationLocale,
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

    private String launchPrompt(NormalizedLaunch launch, String learningSessionId) {
        boolean english = OpenAiCoachLocale.isEnglish(launch.communicationLocale());
        String instruction = switch (launch.type()) {
            case CURRENT_UNIT ->
                    english
                            ? "Use the SkillPilot Coach v1 app and continue with the next step prepared in SkillPilot."
                            : "Verwende die App SkillPilot Coach v1 und fahre mit dem in SkillPilot vorbereiteten "
                                    + "nächsten Schritt fort.";
            case VERIFIED_RECALL ->
                    english
                            ? "Use the SkillPilot Coach v1 app and start a strict recall check with "
                                    + launch.batchSize() + " cards for my currently selected learning goal."
                            : "Verwende die App SkillPilot Coach v1 und starte für mein aktuell ausgewähltes Lernziel "
                                    + "eine harte Kartenprüfung mit " + launch.batchSize() + " Karten.";
            case ABI26_EXAM ->
                    english
                            ? "Use the SkillPilot Coach v1 app and start exam mode with the mathematics Abitur task "
                                    + "selected in my cockpit for the "
                                    + ("LK".equals(launch.courseLevel()) ? "advanced course." : "basic course.")
                            : "Verwende die App SkillPilot Coach v1 und starte im Prüfungsmodus mit meiner im Cockpit "
                                    + "ausgewählten Mathematik-Abituraufgabe für den "
                                    + ("LK".equals(launch.courseLevel()) ? "Leistungskurs." : "Grundkurs.");
        };
        return instruction
                + (english ? "\n\nSkillPilot learning session: " : "\n\nSkillPilot-Lernsession: ")
                + learningSessionId
                + (english
                        ? "\nUse this learning session unchanged in the learningSessionId parameter for every "
                                + "SkillPilot app call."
                        : "\nVerwende diese Lernsession bei jedem SkillPilot-App-Aufruf unverändert im Parameter "
                                + "learningSessionId.");
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
            throw new IllegalStateException("Could not hash OpenAI Coach credential.", exception);
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
