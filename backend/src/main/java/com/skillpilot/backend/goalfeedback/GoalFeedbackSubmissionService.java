package com.skillpilot.backend.goalfeedback;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.domain.GoalFeedbackSubmission;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.LinkBinding;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.ResolvedContext;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.SubmissionReceipt;
import com.skillpilot.backend.repository.GoalFeedbackSubmissionRepository;
import java.io.IOException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Strict, versioned parser and idempotent persistence boundary for public feedback. */
@Service
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackSubmissionService {

    public static final int MAX_BODY_BYTES = 32 * 1024;
    private static final Set<String> WRAPPER_FIELDS = Set.of("clientSubmissionId", "website", "envelope");
    private static final Set<String> ENVELOPE_FIELDS = Set.of(
            "$schema",
            "schemaVersion",
            "context",
            "feedback",
            "privacyNoticeVersion",
            "privacyNoticeLocale",
            "privacyAcknowledged",
            "automatedProcessingAcknowledged");
    private static final Set<String> CONTEXT_FIELDS = Set.of(
            "goalId",
            "goalFingerprint",
            "pageFingerprint",
            "bookId",
            "bookEdition",
            "bookDigest",
            "locale",
            "scopeLabel",
            "pageNumber",
            "canonicalUrl",
            "publicationManifestFingerprint");
    private static final Set<String> FEEDBACK_FIELDS = Set.of(
            "category",
            "observation",
            "evidence",
            "proposedImprovement",
            "sourceReference",
            "reviewerRole");
    private static final Set<String> CATEGORIES = Set.of(
            "factual_error",
            "wording_or_language",
            "missing_or_overbroad_goal",
            "prerequisite_or_sequence",
            "chapter_structure",
            "scope_or_applicability",
            "source_assignment",
            "visualization_or_accessibility",
            "other");
    private static final Set<String> REVIEWER_ROLES = Set.of(
            "teacher", "learner", "parent", "researcher", "subject_expert", "other");
    private static final Pattern GOAL_ID = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}");
    private static final Pattern EDITION = Pattern.compile("[A-Za-z0-9][A-Za-z0-9._:+-]{0,199}");
    private static final Pattern SHA256 = Pattern.compile("sha256:[0-9a-f]{64}");

    private final ObjectMapper strictMapper;
    private final ObjectMapper objectMapper;
    private final GoalFeedbackPublicationRegistry publications;
    private final GoalFeedbackCanonicalJson canonicalJson;
    private final GoalFeedbackSubmissionRepository submissions;
    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final long maxPendingRows;
    private final long maxPendingBytes;

    @Autowired
    public GoalFeedbackSubmissionService(
            ObjectMapper objectMapper,
            GoalFeedbackPublicationRegistry publications,
            GoalFeedbackCanonicalJson canonicalJson,
            GoalFeedbackSubmissionRepository submissions,
            JdbcTemplate jdbc,
            @Value("${skillpilot.goal-feedback.inbox.max-pending-rows:${SKILLPILOT_GOAL_FEEDBACK_MAX_PENDING_ROWS:10000}}")
                    long maxPendingRows,
            @Value("${skillpilot.goal-feedback.inbox.max-pending-bytes:${SKILLPILOT_GOAL_FEEDBACK_MAX_PENDING_BYTES:104857600}}")
                    long maxPendingBytes) {
        this(objectMapper, publications, canonicalJson, submissions, jdbc,
                Clock.systemUTC(), maxPendingRows, maxPendingBytes);
    }

    GoalFeedbackSubmissionService(
            ObjectMapper objectMapper,
            GoalFeedbackPublicationRegistry publications,
            GoalFeedbackCanonicalJson canonicalJson,
            GoalFeedbackSubmissionRepository submissions,
            JdbcTemplate jdbc,
            Clock clock,
            long maxPendingRows,
            long maxPendingBytes) {
        this.objectMapper = objectMapper;
        this.strictMapper = objectMapper.copy()
                .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
                .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
        this.publications = publications;
        this.canonicalJson = canonicalJson;
        this.submissions = submissions;
        this.jdbc = jdbc;
        this.clock = clock;
        if (maxPendingRows < 1 || maxPendingBytes < 1) {
            throw new IllegalStateException("Goal-feedback inbox bounds must be positive");
        }
        this.maxPendingRows = maxPendingRows;
        this.maxPendingBytes = maxPendingBytes;
    }

    @Transactional
    public SubmissionReceipt submit(byte[] body) {
        if (body == null || body.length == 0 || body.length > MAX_BODY_BYTES) {
            throw badRequest("Feedback body is empty or too large");
        }
        JsonNode wrapper = parse(body);
        requireObjectWithExactFields(wrapper, WRAPPER_FIELDS, "submission wrapper");
        UUID clientSubmissionId = parseUuid(requiredText(wrapper, "clientSubmissionId", 36));
        String website = requiredString(wrapper, "website", 200, true);
        if (!website.isEmpty()) {
            // A plausible success response avoids teaching bots how the trap works.
            // Neither the honeypot value nor any other request content is persisted.
            return new SubmissionReceipt(clientSubmissionId, clock.instant());
        }

        JsonNode envelope = wrapper.get("envelope");
        requireObjectWithExactFields(envelope, ENVELOPE_FIELDS, "envelope");
        require(GoalFeedbackApi.SCHEMA_URL.equals(requiredText(envelope, "$schema", 200)),
                "Unsupported feedback schema");
        require(envelope.path("schemaVersion").isIntegralNumber()
                        && envelope.path("schemaVersion").intValue() == 2,
                "Unsupported feedback schemaVersion");
        require(GoalFeedbackApi.PRIVACY_NOTICE_VERSION.equals(
                        requiredText(envelope, "privacyNoticeVersion", 50)),
                "Unsupported privacyNoticeVersion");
        String privacyNoticeLocale = requiredText(envelope, "privacyNoticeLocale", 2);
        require(GoalFeedbackApi.PRIVACY_NOTICE_LOCALES.contains(privacyNoticeLocale),
                "Unsupported privacyNoticeLocale");
        require(envelope.path("privacyAcknowledged").isBoolean()
                        && envelope.path("privacyAcknowledged").booleanValue(),
                "privacyAcknowledged must be true");
        require(envelope.path("automatedProcessingAcknowledged").isBoolean()
                        && envelope.path("automatedProcessingAcknowledged").booleanValue(),
                "automatedProcessingAcknowledged must be true");

        JsonNode suppliedContext = envelope.get("context");
        requireObjectWithExactFields(suppliedContext, CONTEXT_FIELDS, "context");
        ResolvedContext trusted = resolveContext(suppliedContext);
        JsonNode trustedContext = objectMapper.valueToTree(trusted.context());
        require(trustedContext.equals(suppliedContext), "Feedback context does not match the publication");

        JsonNode normalizedFeedback = normalizeFeedback(envelope.get("feedback"));
        ObjectNode normalizedEnvelope = objectMapper.createObjectNode();
        normalizedEnvelope.put("$schema", GoalFeedbackApi.SCHEMA_URL);
        normalizedEnvelope.put("schemaVersion", 2);
        normalizedEnvelope.set("context", trustedContext);
        normalizedEnvelope.set("feedback", normalizedFeedback);
        normalizedEnvelope.put("privacyNoticeVersion", GoalFeedbackApi.PRIVACY_NOTICE_VERSION);
        normalizedEnvelope.put("privacyNoticeLocale", privacyNoticeLocale);
        normalizedEnvelope.put("privacyAcknowledged", true);
        normalizedEnvelope.put("automatedProcessingAcknowledged", true);

        String envelopeJson = canonicalJson.serialize(normalizedEnvelope);
        String envelopeDigest = canonicalJson.digest(envelopeJson);
        ObjectNode duplicateMaterial = objectMapper.createObjectNode();
        duplicateMaterial.set("context", trustedContext);
        duplicateMaterial.set("feedback", normalizedFeedback);
        String exactDuplicateKey = canonicalJson.digest(duplicateMaterial);
        String trustedContextJson = canonicalJson.serialize(objectMapper.valueToTree(trusted));

        long storedBytes = envelopeJson.getBytes(java.nio.charset.StandardCharsets.UTF_8).length
                + trustedContextJson.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;

        Capacity capacity = jdbc.queryForObject(
                "SELECT pending_rows, pending_bytes FROM goal_feedback_inbox_capacity WHERE id = 1 FOR UPDATE",
                (resultSet, rowNumber) -> new Capacity(resultSet.getLong(1), resultSet.getLong(2)));
        if (capacity == null) {
            throw new IllegalStateException("Goal-feedback capacity row is missing");
        }
        GoalFeedbackSubmission existing = submissions.findByClientSubmissionId(clientSubmissionId).orElse(null);
        if (existing != null) {
            if (!envelopeDigest.equals(existing.getEnvelopeDigest())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "clientSubmissionId is already bound to different feedback");
            }
            return new SubmissionReceipt(existing.getId(), existing.getReceivedAt());
        }
        if (capacity.pendingRows() >= maxPendingRows
                || storedBytes > maxPendingBytes - capacity.pendingBytes()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Goal-feedback inbox is temporarily full");
        }

        UUID feedbackId = UUID.randomUUID();
        Instant receivedAt = clock.instant().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        int inserted = jdbc.update(
                """
                INSERT INTO goal_feedback_submission
                    (id, client_submission_id, received_at, envelope_digest,
                     exact_duplicate_key, envelope_json, trusted_context_json, stored_bytes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                feedbackId,
                clientSubmissionId,
                Timestamp.from(receivedAt),
                envelopeDigest,
                exactDuplicateKey,
                envelopeJson,
                trustedContextJson,
                storedBytes);
        if (inserted != 1) {
            throw new IllegalStateException("Goal-feedback insertion did not create one row");
        }
        int capacityUpdated = jdbc.update(
                "UPDATE goal_feedback_inbox_capacity "
                        + "SET pending_rows = pending_rows + 1, pending_bytes = pending_bytes + ?, updated_at = ? "
                        + "WHERE id = 1",
                storedBytes,
                Timestamp.from(receivedAt));
        if (capacityUpdated != 1) {
            throw new IllegalStateException("Goal-feedback capacity update failed");
        }
        return new SubmissionReceipt(feedbackId, receivedAt);
    }

    private ResolvedContext resolveContext(JsonNode context) {
        String goalId = requiredText(context, "goalId", 200);
        String goalFingerprint = requiredText(context, "goalFingerprint", 71);
        String pageFingerprint = requiredText(context, "pageFingerprint", 71);
        String bookId = requiredText(context, "bookId", 200);
        String bookEdition = requiredText(context, "bookEdition", 200);
        String bookDigest = requiredText(context, "bookDigest", 71);
        require(GOAL_ID.matcher(goalId).matches(), "Invalid goalId");
        require(EDITION.matcher(bookEdition).matches(), "Invalid bookEdition");
        require(SHA256.matcher(goalFingerprint).matches(), "Invalid goalFingerprint");
        require(SHA256.matcher(pageFingerprint).matches(), "Invalid pageFingerprint");
        require(SHA256.matcher(bookDigest).matches(), "Invalid bookDigest");
        JsonNode pageNumber = context.get("pageNumber");
        require(pageNumber != null && pageNumber.isIntegralNumber()
                        && pageNumber.canConvertToInt() && pageNumber.intValue() >= 1,
                "Invalid pageNumber");
        // Bound all server-derived strings before comparing the whole context.
        requiredText(context, "locale", 35);
        requiredText(context, "scopeLabel", 500);
        requiredText(context, "canonicalUrl", 2_000);
        String manifest = requiredText(context, "publicationManifestFingerprint", 71);
        require(SHA256.matcher(manifest).matches(), "Invalid publicationManifestFingerprint");
        return publications.resolve(new LinkBinding(
                        bookId,
                        bookEdition,
                        goalId,
                        goalFingerprint,
                        pageFingerprint,
                        bookDigest,
                        pageNumber.intValue()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Published goal context not found"));
    }

    private JsonNode normalizeFeedback(JsonNode feedback) {
        requireObjectWithAllowedFields(feedback, FEEDBACK_FIELDS, "feedback");
        String category = requiredText(feedback, "category", 64);
        require(CATEGORIES.contains(category), "Unsupported feedback category");
        ObjectNode result = objectMapper.createObjectNode();
        result.put("category", category);
        result.put("observation", requiredPlainText(feedback, "observation", 4_000));
        optionalPlainText(feedback, result, "evidence", 4_000);
        optionalPlainText(feedback, result, "proposedImprovement", 4_000);
        optionalPlainText(feedback, result, "sourceReference", 4_000);
        if (feedback.has("reviewerRole")) {
            String reviewerRole = requiredPlainText(feedback, "reviewerRole", 64);
            require(REVIEWER_ROLES.contains(reviewerRole), "Unsupported reviewerRole");
            result.put("reviewerRole", reviewerRole);
        }
        return result;
    }

    private void optionalPlainText(JsonNode source, ObjectNode target, String name, int maximumLength) {
        if (source.has(name)) {
            target.put(name, requiredPlainText(source, name, maximumLength));
        }
    }

    private String requiredPlainText(JsonNode parent, String name, int maximumLength) {
        String value = requiredString(parent, name, maximumLength, false);
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            if ((character < 0x20 && character != '\n' && character != '\r' && character != '\t')
                    || character == 0x7f) {
                throw badRequest("Invalid control character in " + name);
            }
        }
        return value;
    }

    private JsonNode parse(byte[] body) {
        try {
            JsonNode parsed = strictMapper.readTree(body);
            require(parsed != null, "Feedback body is empty");
            return parsed;
        } catch (IOException exception) {
            throw badRequest("Invalid feedback JSON");
        }
    }

    private static UUID parseUuid(String value) {
        try {
            UUID parsed = UUID.fromString(value);
            require(parsed.toString().equals(value), "clientSubmissionId must be a canonical UUID");
            return parsed;
        } catch (IllegalArgumentException exception) {
            throw badRequest("Invalid clientSubmissionId");
        }
    }

    private static void requireObjectWithExactFields(JsonNode node, Set<String> fields, String label) {
        requireObjectWithAllowedFields(node, fields, label);
        require(node.size() == fields.size(), "Missing field in " + label);
        for (String field : fields) {
            require(node.has(field), "Missing " + field + " in " + label);
        }
    }

    private static void requireObjectWithAllowedFields(JsonNode node, Set<String> fields, String label) {
        require(node != null && node.isObject(), label + " must be an object");
        Iterator<Map.Entry<String, JsonNode>> iterator = node.fields();
        while (iterator.hasNext()) {
            require(fields.contains(iterator.next().getKey()), "Unknown field in " + label);
        }
    }

    private static String requiredText(JsonNode parent, String name, int maximumLength) {
        return requiredString(parent, name, maximumLength, false);
    }

    static String requiredString(JsonNode parent, String name, int maximumLength, boolean allowEmpty) {
        JsonNode value = parent.get(name);
        require(value != null && value.isTextual(), name + " must be a string");
        String text = value.textValue();
        require(text.length() <= maximumLength, name + " is too long");
        require(text.isEmpty()
                        || (!isEcmaScriptWhitespace(text.charAt(0))
                                && !isEcmaScriptWhitespace(text.charAt(text.length() - 1))),
                name + " must not have surrounding whitespace");
        require(allowEmpty || !text.isEmpty(), name + " must not be empty");
        return text;
    }

    /** Matches the whitespace recognized by the JSON Schema consumer's ECMAScript {@code \\s}. */
    private static boolean isEcmaScriptWhitespace(char character) {
        return character == '\t'
                || character == '\n'
                || character == '\u000b'
                || character == '\f'
                || character == '\r'
                || character == '\ufeff'
                || Character.isSpaceChar(character);
    }

    private static void require(boolean condition, String message) {
        if (!condition) {
            throw badRequest(message);
        }
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private record Capacity(long pendingRows, long pendingBytes) {
    }
}
