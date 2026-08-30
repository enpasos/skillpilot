package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.skillpilot.backend.domain.GoalFeedbackExportBatch;
import com.skillpilot.backend.domain.GoalFeedbackSubmission;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.Goal;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.ResolvedContext;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.TrustedContext;
import com.skillpilot.backend.repository.GoalFeedbackExportBatchRepository;
import com.skillpilot.backend.repository.GoalFeedbackSubmissionRepository;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class GoalFeedbackExportSizeTest {

    @Test
    void bindsOnlyTheLargestOldestPrefixWhoseCompleteResponseFitsSixteenMib() {
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        GoalFeedbackCanonicalJson canonical = new GoalFeedbackCanonicalJson(mapper);
        GoalFeedbackPublicationRegistry publications = mock(GoalFeedbackPublicationRegistry.class);
        GoalFeedbackSubmissionRepository submissions = mock(GoalFeedbackSubmissionRepository.class);
        GoalFeedbackExportBatchRepository batches = mock(GoalFeedbackExportBatchRepository.class);
        JdbcTemplate jdbc = mock(JdbcTemplate.class);

        String digest = "sha256:" + "a".repeat(64);
        TrustedContext context = new TrustedContext(
                "goal-1", digest, digest, "book-1", "edition-1", digest,
                "de-DE", "Buch", 1, "https://skillpilot.com/lernzielbuch#goal-goal-1", digest);
        List<String> largeBreadcrumbs = java.util.stream.IntStream.range(0, 40)
                .mapToObj(index -> "Kapitel " + index + " " + "x".repeat(880))
                .toList();
        ResolvedContext trusted = new ResolvedContext(
                1,
                context,
                new Goal("Titel", "Beschreibung", largeBreadcrumbs),
                GoalFeedbackApi.SUBMISSION_ENDPOINT);
        ObjectNode envelope = mapper.createObjectNode();
        envelope.put("$schema", GoalFeedbackApi.SCHEMA_URL);
        envelope.put("schemaVersion", 2);
        envelope.set("context", mapper.valueToTree(context));
        envelope.putObject("feedback").put("category", "other").put("observation", "Hinweis");
        envelope.put("privacyNoticeVersion", GoalFeedbackApi.PRIVACY_NOTICE_VERSION);
        envelope.put("privacyNoticeLocale", "de");
        envelope.put("privacyAcknowledged", true);
        envelope.put("automatedProcessingAcknowledged", true);
        String envelopeJson = canonical.serialize(envelope);
        String trustedJson = canonical.serialize(mapper.valueToTree(trusted));

        List<GoalFeedbackSubmission> candidates = new ArrayList<>();
        Instant receivedAt = Instant.parse("2026-08-30T10:00:00Z");
        for (int index = 0; index < 500; index++) {
            GoalFeedbackSubmission submission = new GoalFeedbackSubmission();
            submission.setId(UUID.randomUUID());
            submission.setClientSubmissionId(UUID.randomUUID());
            submission.setReceivedAt(receivedAt.plus(index, java.time.temporal.ChronoUnit.MICROS));
            submission.setEnvelopeDigest(canonical.digest(envelopeJson));
            submission.setExactDuplicateKey(digest);
            submission.setEnvelopeJson(envelopeJson);
            submission.setTrustedContextJson(trustedJson);
            submission.setStoredBytes(envelopeJson.length() + trustedJson.length());
            candidates.add(submission);
        }

        when(batches.findOldestByStatusForUpdate(any(), any())).thenReturn(List.of());
        when(submissions.findOldestUnboundForUpdate(any())).thenReturn(candidates);
        when(publications.resolve(any())).thenReturn(Optional.of(trusted));
        when(publications.isCurrent(any())).thenReturn(true);
        when(jdbc.queryForObject(anyString(), eq(Long.class))).thenReturn(500L);
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        when(batches.findById(any())).thenAnswer(invocation -> {
            GoalFeedbackExportBatch batch = new GoalFeedbackExportBatch();
            batch.setId(invocation.getArgument(0));
            return Optional.of(batch);
        });
        when(submissions.saveAllAndFlush(any())).thenAnswer(invocation -> {
            List<GoalFeedbackSubmission> saved = new ArrayList<>();
            invocation.<Iterable<GoalFeedbackSubmission>>getArgument(0).forEach(saved::add);
            return saved;
        });

        GoalFeedbackExportService service = new GoalFeedbackExportService(
                mapper,
                canonical,
                publications,
                submissions,
                batches,
                jdbc,
                Clock.fixed(receivedAt, ZoneOffset.UTC));
        JsonNode response = service.create(500);

        int bound = response.path("payload").path("recordCount").intValue();
        int responseBytes = canonical.serialize(response).getBytes(StandardCharsets.UTF_8).length;
        assertThat(bound).isBetween(1, 499);
        assertThat(response.path("payload").path("records").size()).isEqualTo(bound);
        assertThat(responseBytes).isLessThanOrEqualTo(GoalFeedbackExportService.MAX_EXPORT_RESPONSE_BYTES);
        assertThat(responseBytes).isGreaterThan(15 * 1024 * 1024);
        assertThat(candidates.stream().filter(item -> item.getExportBatch() != null).count()).isEqualTo(bound);
        assertThat(candidates.subList(bound, candidates.size()))
                .allMatch(item -> item.getExportBatch() == null);
    }
}
