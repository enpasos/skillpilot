package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.GoalFeedbackExportBatch;
import com.skillpilot.backend.domain.GoalFeedbackExportBatchStatus;
import com.skillpilot.backend.repository.GoalFeedbackExportBatchRepository;
import com.skillpilot.backend.repository.GoalFeedbackSubmissionRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

class GoalFeedbackExportExpiryTest {

    private static final Instant NOW = Instant.parse("2026-09-01T12:00:00Z");
    private static final String DIGEST = "sha256:" + "a".repeat(64);

    private GoalFeedbackExportBatchRepository batches;
    private GoalFeedbackExportService service;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        batches = mock(GoalFeedbackExportBatchRepository.class);
        service = new GoalFeedbackExportService(
                objectMapper,
                new GoalFeedbackCanonicalJson(objectMapper),
                mock(GoalFeedbackPublicationRegistry.class),
                mock(GoalFeedbackSubmissionRepository.class),
                batches,
                mock(JdbcTemplate.class),
                Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void expiredBatchIsGoneAndCannotMasqueradeAsAcknowledgedDeletion() {
        UUID exportId = UUID.randomUUID();
        GoalFeedbackExportBatch expired = batch(
                exportId,
                GoalFeedbackExportBatchStatus.EXPIRED,
                null,
                null,
                NOW);
        when(batches.findById(exportId)).thenReturn(Optional.of(expired));
        when(batches.findByIdForUpdate(exportId)).thenReturn(Optional.of(expired));

        assertGone(() -> service.get(exportId), "expired before acknowledgement");
        assertGone(() -> service.delete(exportId, "\"" + DIGEST + "\""),
                "expired before acknowledgement");
        assertGone(() -> service.delete(exportId, null),
                "expired before acknowledgement");
    }

    @Test
    void confirmedDeletionKeepsItsIdempotentDeletedReceipt() {
        UUID exportId = UUID.randomUUID();
        Instant deletedAt = NOW.minusSeconds(10);
        GoalFeedbackExportBatch deleted = batch(
                exportId,
                GoalFeedbackExportBatchStatus.DELETED,
                null,
                deletedAt,
                null);
        when(batches.findById(exportId)).thenReturn(Optional.of(deleted));
        when(batches.findByIdForUpdate(exportId)).thenReturn(Optional.of(deleted));

        assertGone(() -> service.get(exportId), "deleted after acknowledgement");
        GoalFeedbackApi.DeletedExportReceipt receipt =
                service.delete(exportId, "\"" + DIGEST + "\"");
        assertThat(receipt.status()).isEqualTo("DELETED");
        assertThat(receipt.deletedAt()).isEqualTo(deletedAt);
    }

    private static GoalFeedbackExportBatch batch(
            UUID id,
            GoalFeedbackExportBatchStatus status,
            String payload,
            Instant deletedAt,
            Instant expiredAt) {
        GoalFeedbackExportBatch batch = new GoalFeedbackExportBatch();
        batch.setId(id);
        batch.setStatus(status);
        batch.setPayloadDigest(DIGEST);
        batch.setRecordCount(2);
        batch.setPayloadJson(payload);
        batch.setDeletedAt(deletedAt);
        batch.setExpiredAt(expiredAt);
        return batch;
    }

    private static void assertGone(
            org.assertj.core.api.ThrowableAssert.ThrowingCallable call,
            String reason) {
        assertThatThrownBy(call)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.GONE);
                    assertThat(exception.getReason()).contains(reason);
                });
    }
}
