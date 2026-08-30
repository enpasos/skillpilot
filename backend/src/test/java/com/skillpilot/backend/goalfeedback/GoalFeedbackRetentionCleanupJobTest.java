package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

class GoalFeedbackRetentionCleanupJobTest {

    @Test
    void dailyPolicyIsFixedAndDelegatesToTheNonTransactionalCoordinator() throws Exception {
        GoalFeedbackRetentionCoordinator retention = mock(GoalFeedbackRetentionCoordinator.class);

        new GoalFeedbackRetentionCleanupJob(retention).purgeExpiredFeedback();

        verify(retention).purgeAllExpiredContent();
        Scheduled schedule = GoalFeedbackRetentionCleanupJob.class
                .getMethod("purgeExpiredFeedback")
                .getAnnotation(Scheduled.class);
        assertThat(schedule.fixedRate()).isEqualTo(86_400_000L);
        assertThat(schedule.initialDelay()).isEqualTo(60_000L);
        assertThat(schedule.fixedRateString()).isEmpty();
        assertThat(schedule.initialDelayString()).isEmpty();
        assertThat(GoalFeedbackRetentionCleanupJob.class.getAnnotation(
                org.springframework.boot.autoconfigure.condition.ConditionalOnExpression.class)).isNull();
        assertThat(GoalFeedbackRetentionService.class.getAnnotation(
                org.springframework.boot.autoconfigure.condition.ConditionalOnExpression.class)).isNull();
        assertThat(GoalFeedbackSchedulingConfiguration.class.getAnnotation(EnableScheduling.class))
                .isNotNull();
    }
}
