package com.skillpilot.backend.goalfeedback;

import org.springframework.stereotype.Service;

/**
 * Runs retention before request-scoped feedback transactions begin.
 *
 * <p>Each bounded cleanup call owns its independent transaction. Keeping this
 * coordinator non-transactional avoids holding an outer pool connection while
 * {@code REQUIRES_NEW} obtains the cleanup connection.</p>
 */
@Service
public class GoalFeedbackRetentionCoordinator {

    private final GoalFeedbackRetentionService retention;

    public GoalFeedbackRetentionCoordinator(GoalFeedbackRetentionService retention) {
        this.retention = retention;
    }

    public void purgeAllExpiredContent() {
        GoalFeedbackRetentionService.CleanupResult result;
        do {
            result = retention.purgeExpiredUnacknowledgedContent();
        } while (result.removedRows() > 0 || result.expiredBatches() > 0);
    }
}
