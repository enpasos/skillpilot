package com.skillpilot.backend.goalfeedback;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/** Daily safety-net in addition to cleanup on every intake/export operation. */
@Service
public class GoalFeedbackRetentionCleanupJob {

    static final long CLEANUP_INTERVAL_MILLIS = 86_400_000L;
    static final long INITIAL_DELAY_MILLIS = 60_000L;

    private final GoalFeedbackRetentionCoordinator retention;

    public GoalFeedbackRetentionCleanupJob(GoalFeedbackRetentionCoordinator retention) {
        this.retention = retention;
    }

    @Scheduled(fixedRate = CLEANUP_INTERVAL_MILLIS, initialDelay = INITIAL_DELAY_MILLIS)
    public void purgeExpiredFeedback() {
        retention.purgeAllExpiredContent();
    }
}
