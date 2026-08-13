package com.skillpilot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(
        name = "skillpilot.learner-retention.enabled",
        havingValue = "true",
        matchIfMissing = true)
public class LearnerRetentionCleanupJob {

    private final LearnerLifecycleService lifecycle;
    private final int batchSize;

    public LearnerRetentionCleanupJob(
            LearnerLifecycleService lifecycle,
            @Value("${skillpilot.learner-retention.batch-size:100}") int batchSize) {
        this.lifecycle = lifecycle;
        this.batchSize = batchSize;
    }

    @Scheduled(
            fixedDelayString = "${skillpilot.learner-retention.cleanup-interval-ms:86400000}",
            initialDelayString = "${skillpilot.learner-retention.initial-delay-ms:60000}")
    public void cleanupInactiveLearners() {
        while (lifecycle.deleteInactiveBatch(batchSize) == batchSize) {
            // Drain every due learner in bounded transactions during this run.
        }
    }
}
