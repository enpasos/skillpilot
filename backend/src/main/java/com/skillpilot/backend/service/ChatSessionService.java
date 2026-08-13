package com.skillpilot.backend.service;

import com.skillpilot.backend.api.ChatStartRequest;
import com.skillpilot.backend.api.ChatStartResponse;
import com.skillpilot.backend.domain.ChatSession;
import com.skillpilot.backend.domain.ChatStartCode;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ChatSessionRepository;
import com.skillpilot.backend.repository.ChatStartCodeRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChatSessionService {

    public record RedeemedSession(String chatSessionToken, Instant expiresAt, String skillpilotId) {
    }

    /**
     * A directly issued, provider-visible chat session. The permanent learner ID is
     * deliberately not part of this boundary.
     */
    public record IssuedVisibleSession(String chatSessionToken, Instant expiresAt, String prompt) {
    }

    public static class ChatSessionExpiredException extends ResponseStatusException {
        public ChatSessionExpiredException() {
            super(
                    HttpStatus.GONE,
                    "Chat session has expired. Ask the learner to return to skillpilot.com and start the SkillPilot learning coach again. Do not ask for the SkillPilot ID inside ChatGPT.");
        }
    }

    private static final String START_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final int START_CODE_RANDOM_CHARS = 8;
    private static final int SESSION_TOKEN_BYTES = 32;
    private static final Duration VISIBLE_SESSION_MAX_TTL = Duration.ofHours(24);
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Pattern CHAT_SESSION_TOKEN_PATTERN = Pattern.compile(
            "(?i)(?<![A-Za-z0-9_-])sps_[A-Za-z0-9_-]+(?![A-Za-z0-9_-])");
    private static final Pattern START_CODE_PATTERN = Pattern.compile(
            "(?i)\\bSP\\s*[-:]?\\s*[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}\\s*-?\\s*[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}\\b");

    private final ChatStartCodeRepository startCodeRepository;
    private final ChatSessionRepository sessionRepository;
    private final LearnerRepository learnerRepository;
    private final LearnerService learnerService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Duration startCodeTtl;
    private final Duration sessionTtl;
    private final byte[] hashSecret;

    public ChatSessionService(
            ChatStartCodeRepository startCodeRepository,
            ChatSessionRepository sessionRepository,
            LearnerRepository learnerRepository,
            LearnerService learnerService,
            @Value("${skillpilot.chat.start-code-ttl:PT5M}") Duration startCodeTtl,
            @Value("${skillpilot.chat.session-ttl:PT24H}") Duration sessionTtl,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}") String hashSecret) {
        this.startCodeRepository = startCodeRepository;
        this.sessionRepository = sessionRepository;
        this.learnerRepository = learnerRepository;
        this.learnerService = learnerService;
        this.startCodeTtl = startCodeTtl;
        this.sessionTtl = sessionTtl;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Transactional
    public ChatStartResponse createStartCode(String skillpilotId, ChatStartRequest request) {
        Learner learner = prepareLearnerForChatStart(skillpilotId, request);

        Instant now = Instant.now();
        String startCode = null;
        String codeHash = null;
        for (int attempt = 0; attempt < 5; attempt++) {
            String candidate = generateStartCode();
            String candidateHash = hashSecretValue(normalizeStartCode(candidate));
            if (!startCodeRepository.existsById(candidateHash)) {
                startCode = candidate;
                codeHash = candidateHash;
                break;
            }
        }
        if (startCode == null || codeHash == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create a unique start code.");
        }

        ChatStartCode entity = new ChatStartCode();
        entity.setCodeHash(codeHash);
        entity.setLearner(learner);
        entity.setCreatedAt(now);
        entity.setExpiresAt(now.plus(startCodeTtl));
        entity.setClient(trimToNull(request == null ? null : request.client()));
        entity.setLanguage(normalizeLanguage(request == null ? null : request.language()));
        startCodeRepository.save(entity);

        learner.setLastActivityAt(now);

        return new ChatStartResponse(startCode, entity.getExpiresAt(), buildPrompt(startCode, request));
    }

    /**
     * Creates the same 24-hour hashed session used after start-code redemption, but
     * issues it directly to the SkillPilot cockpit. The returned prompt contains the
     * temporary token exactly once and cannot carry the permanent learner ID, another
     * chat-session token, or a legacy start code through promptContext.
     */
    @Transactional
    public IssuedVisibleSession createVisibleSession(String skillpilotId, ChatStartRequest request) {
        Learner learner = prepareLearnerForChatStart(skillpilotId, request);
        Instant now = Instant.now();
        String token = generateSessionToken();

        ChatSession session = new ChatSession();
        session.setTokenHash(hashSecretValue(token));
        session.setLearner(learner);
        session.setCreatedAt(now);
        session.setExpiresAt(now.plus(shorterDuration(sessionTtl, VISIBLE_SESSION_MAX_TTL)));
        session.setLastUsedAt(now);
        session.setSourceStartCodeHash(null);
        session.setLanguage(normalizeLanguage(request == null ? null : request.language()));
        sessionRepository.save(session);
        learner.setLastActivityAt(now);

        return new IssuedVisibleSession(
                token,
                session.getExpiresAt(),
                buildVisiblePrompt(token, learner.getSkillpilotId(), request));
    }

    @Transactional
    public RedeemedSession redeemStartCode(String startCode, String language) {
        String normalizedCode = normalizeStartCode(startCode);
        if (normalizedCode.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startCode must not be empty.");
        }

        String codeHash = hashSecretValue(normalizedCode);
        String skillpilotId = startCodeRepository
                .findLearnerSkillpilotIdByCodeHash(codeHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Start code not found."));
        Learner learner = requireLearnerForUpdate(skillpilotId, HttpStatus.UNAUTHORIZED);
        ChatStartCode code = startCodeRepository.findByCodeHashForUpdate(codeHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Start code not found."));
        if (!learner.getSkillpilotId().equals(code.getLearner().getSkillpilotId())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Learner for start code no longer exists.");
        }

        Instant now = Instant.now();
        if (code.getRedeemedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Start code has already been used.");
        }
        if (!code.getExpiresAt().isAfter(now)) {
            throw new ResponseStatusException(HttpStatus.GONE, "Start code has expired.");
        }

        String token = generateSessionToken();
        String tokenHash = hashSecretValue(token);

        ChatSession session = new ChatSession();
        session.setTokenHash(tokenHash);
        session.setLearner(learner);
        session.setCreatedAt(now);
        session.setExpiresAt(now.plus(sessionTtl));
        session.setLastUsedAt(now);
        session.setSourceStartCodeHash(codeHash);
        session.setLanguage(normalizeLanguage(language != null ? language : code.getLanguage()));
        sessionRepository.save(session);

        code.setRedeemedAt(now);
        code.setRedeemedSessionTokenHash(tokenHash);
        startCodeRepository.save(code);
        learner.setLastActivityAt(now);

        return new RedeemedSession(token, session.getExpiresAt(), learner.getSkillpilotId());
    }

    @Transactional
    public String resolveSkillpilotId(String chatSessionToken) {
        ChatSession session = requireActiveSession(chatSessionToken);
        Instant now = Instant.now();
        Learner learner = requireLearnerForUpdate(
                session.getLearner().getSkillpilotId(),
                HttpStatus.UNAUTHORIZED);
        session.setLastUsedAt(now);
        sessionRepository.save(session);
        learner.setLastActivityAt(now);
        return learner.getSkillpilotId();
    }

    /** Resolves transport identity only; the completed tool operation owns activity. */
    @Transactional(readOnly = true)
    public String resolveSkillpilotIdWithoutActivity(String chatSessionToken) {
        return requireActiveSession(chatSessionToken).getLearner().getSkillpilotId();
    }

    private ChatSession requireActiveSession(String chatSessionToken) {
        String token = trimToNull(chatSessionToken);
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing chat session token.");
        }

        String tokenHash = hashSecretValue(token);
        ChatSession session = sessionRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid chat session token."));

        Instant now = Instant.now();
        if (session.getRevokedAt() != null || !session.getExpiresAt().isAfter(now)) {
            throw new ChatSessionExpiredException();
        }
        return session;
    }

    private String generateStartCode() {
        StringBuilder sb = new StringBuilder("SP-");
        for (int i = 0; i < START_CODE_RANDOM_CHARS; i++) {
            if (i == 4) {
                sb.append('-');
            }
            sb.append(START_CODE_ALPHABET.charAt(secureRandom.nextInt(START_CODE_ALPHABET.length())));
        }
        return sb.toString();
    }

    private String generateSessionToken() {
        byte[] bytes = new byte[SESSION_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return "sps_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Learner prepareLearnerForChatStart(String skillpilotId, ChatStartRequest request) {
        if (skillpilotId == null || skillpilotId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "skillpilotId must not be empty.");
        }
        Learner learner = requireLearnerForUpdate(skillpilotId, HttpStatus.NOT_FOUND);
        String selectedCurriculum = trimToNull(request == null ? null : request.selectedCurriculum());
        if (selectedCurriculum != null && !selectedCurriculum.equals(learner.getSelectedCurriculum())) {
            learnerService.assertWritableLearningSession(skillpilotId);
            learnerService.setCurriculum(skillpilotId, selectedCurriculum);
            learner = requireLearnerForUpdate(skillpilotId, HttpStatus.NOT_FOUND);
        }
        return learner;
    }

    private Learner requireLearnerForUpdate(String skillpilotId, HttpStatus missingStatus) {
        return learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(missingStatus, "Learner not found."));
    }

    private String normalizeStartCode(String value) {
        String compact = (value == null ? "" : value)
                .toUpperCase()
                .replaceAll("[^A-Z0-9]", "");
        if (compact.startsWith("SP") && compact.length() == 10) {
            return "SP-" + compact.substring(2, 6) + "-" + compact.substring(6);
        }
        return compact;
    }

    private String buildPrompt(String startCode, ChatStartRequest request) {
        String language = normalizeLanguage(request == null ? null : request.language());
        String context = trimToNull(request == null ? null : request.promptContext());
        String base = "en".equals(language)
                ? "Start SkillPilot with start code: " + startCode
                : "Starte SkillPilot mit Startcode: " + startCode;
        if (context == null) {
            return base;
        }
        return base + "\n\n" + context.substring(0, Math.min(context.length(), 2000));
    }

    private String buildVisiblePrompt(String chatSessionToken, String skillpilotId, ChatStartRequest request) {
        String language = normalizeLanguage(request == null ? null : request.language());
        String base = "en".equals(language)
                ? "Start my SkillPilot learning coach.\n\nSkillPilot session: " + chatSessionToken
                : "Starte meinen SkillPilot-Lerncoach.\n\nSkillPilot-Sitzung: " + chatSessionToken;
        String context = sanitizeVisiblePromptContext(
                request == null ? null : request.promptContext(),
                skillpilotId);
        return context == null ? base : base + "\n\n" + context;
    }

    private String sanitizeVisiblePromptContext(String value, String skillpilotId) {
        String context = trimToNull(value);
        if (context == null) {
            return null;
        }
        context = CHAT_SESSION_TOKEN_PATTERN.matcher(context).replaceAll("");
        context = START_CODE_PATTERN.matcher(context).replaceAll("");
        if (skillpilotId != null && !skillpilotId.isBlank()) {
            context = Pattern.compile(Pattern.quote(skillpilotId), Pattern.CASE_INSENSITIVE)
                    .matcher(context)
                    .replaceAll("");
        }
        context = context.replaceAll("[ \\t]+(?=\\R|$)", "")
                .replaceAll("\\R{3,}", "\n\n")
                .trim();
        if (context.isEmpty()) {
            return null;
        }
        return context.substring(0, Math.min(context.length(), 2000));
    }

    private String normalizeLanguage(String value) {
        String normalized = (value == null ? "" : value).trim().toLowerCase();
        return normalized.startsWith("en") ? "en" : "de";
    }

    private Duration shorterDuration(Duration first, Duration second) {
        return first.compareTo(second) <= 0 ? first : second;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String hashSecretValue(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hashSecret, HMAC_ALGORITHM));
            byte[] digest = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Could not hash chat credential.", e);
        }
    }
}
