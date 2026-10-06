package com.skillpilot.backend.connectors.gemini.v1.session;

import com.skillpilot.backend.connectors.gemini.v1.ConditionalOnGeminiV1Enabled;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachStartRequest;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1LaunchResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.LearnerService;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Owns the independent, exactly-24-hour learner-session lifecycle for Gemini v1. */
@Service
@ConditionalOnGeminiV1Enabled
public class GeminiV1LearningSessionService {

    public static final Duration SESSION_TTL = Duration.ofHours(24);
    public static final String GEMINI_WEB_URL = "https://gemini.google.com/app?hl=en";

    private final GeminiV1LearningSessionRepository sessions;
    private final GeminiV1SessionTokenCodec tokenCodec;
    private final LearnerRepository learners;
    private final LearnerService learnerService;

    public GeminiV1LearningSessionService(
            GeminiV1LearningSessionRepository sessions,
            GeminiV1SessionTokenCodec tokenCodec,
            LearnerRepository learners,
            LearnerService learnerService) {
        this.sessions = Objects.requireNonNull(sessions, "sessions");
        this.tokenCodec = Objects.requireNonNull(tokenCodec, "tokenCodec");
        this.learners = Objects.requireNonNull(learners, "learners");
        this.learnerService = Objects.requireNonNull(learnerService, "learnerService");
    }

    @Transactional
    public GeminiV1LaunchResponse createFirstPartyLaunch(
            String skillpilotId,
            GeminiV1CoachStartRequest request) {
        String locale = requireLocale(request == null ? null : request.communicationLocale());
        if (request == null || !"web-start".equals(request.client())) {
            throw badRequest("client must be web-start.");
        }
        if (skillpilotId == null || skillpilotId.isBlank()) {
            throw badRequest("skillpilotId must not be empty.");
        }

        learnerService.assertActiveLearnerRouteAccess(skillpilotId);
        Learner learner = learners.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found."));

        // PostgreSQL timestamps retain microsecond precision. Normalize before deriving the
        // response so the returned expiry is byte-for-byte identical to the persisted boundary.
        Instant startedAt = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        String learningSessionId = tokenCodec.issue();
        Instant expiresAt = startedAt.plus(SESSION_TTL);
        sessions.insert(new GeminiV1LearningSession(
                tokenCodec.hash(learningSessionId),
                learner.getSkillpilotId(),
                startedAt,
                expiresAt,
                locale,
                learner.getCoachStateRevision()));
        learner.setLastActivityAt(startedAt);
        learners.save(learner);

        return new GeminiV1LaunchResponse(
                launchPrompt(locale, learningSessionId),
                GEMINI_WEB_URL,
                learningSessionId,
                expiresAt);
    }

    @Transactional
    @Scheduled(fixedDelayString = "${skillpilot.gemini.connector.v1.learning-session-cleanup-interval-ms:3600000}")
    public int cleanupExpiredSessions() {
        return sessions.deleteExpired(Instant.now());
    }

    private String requireLocale(String raw) {
        String locale = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (!"de".equals(locale) && !"en".equals(locale)) {
            throw badRequest("communicationLocale must be de or en.");
        }
        return locale;
    }

    private String launchPrompt(String locale, String learningSessionId) {
        String instruction = "de".equals(locale)
                ? "@SkillPilot Aktiviere den SkillPilot Coach Skill und lerne mit meinem aktuellen SkillPilot-Lernkontext weiter. Lade zuerst get_skillpilot_coach_context."
                : "@SkillPilot Activate the SkillPilot Coach skill and continue with my current SkillPilot learning context. First call get_skillpilot_coach_context.";
        return instruction + "\nlearningSessionId: " + learningSessionId;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
