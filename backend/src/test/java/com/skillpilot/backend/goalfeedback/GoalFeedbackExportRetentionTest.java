package com.skillpilot.backend.goalfeedback;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class GoalFeedbackExportRetentionTest {

    @Test
    void coordinatorDrainsTheCompleteExpiredBacklogInIndependentCleanupCalls() {
        GoalFeedbackRetentionService retention = mock(GoalFeedbackRetentionService.class);
        Instant now = Instant.parse("2026-09-01T12:00:00Z");
        Instant cutoff = now.minus(Duration.ofDays(30));
        when(retention.purgeExpiredUnacknowledgedContent()).thenReturn(
                new GoalFeedbackRetentionService.CleanupResult(500, 10_000, 0, cutoff),
                new GoalFeedbackRetentionService.CleanupResult(0, 0, 1, cutoff),
                new GoalFeedbackRetentionService.CleanupResult(0, 0, 0, cutoff));

        new GoalFeedbackRetentionCoordinator(retention).purgeAllExpiredContent();

        verify(retention, times(3)).purgeExpiredUnacknowledgedContent();
    }
}
