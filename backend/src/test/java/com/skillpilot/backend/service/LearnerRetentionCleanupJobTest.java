package com.skillpilot.backend.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

class LearnerRetentionCleanupJobTest {

    @Test
    void oneRunDrainsMoreThanOneBatch() {
        LearnerLifecycleService lifecycle = mock(LearnerLifecycleService.class);
        when(lifecycle.deleteInactiveBatch(2)).thenReturn(2, 2, 1);
        LearnerRetentionCleanupJob job = new LearnerRetentionCleanupJob(lifecycle, 2);

        job.cleanupInactiveLearners();

        verify(lifecycle, times(3)).deleteInactiveBatch(2);
    }
}
