package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.sql.SQLException;
import org.junit.jupiter.api.Test;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.transaction.support.TransactionSynchronizationManager;

class LearnerUiStateRetryTest {
    @Test void repeatedSerializationConflictsAreBoundedAndNeverRepeatAMutation() {
        var service = mock(LearnerService.class);
        var lifecycle = mock(LearnerLifecycleService.class);
        var conflict = new CannotAcquireLockException("Concurrent snapshot", new SQLException("changed", "40001"));
        when(service.getLearnerState("learner")).thenThrow(conflict);
        var controller = new LearnerUiController(service, mock(ChatSessionService.class), lifecycle);
        assertThatThrownBy(() -> controller.getLearnerState("learner")).isSameAs(conflict);
        verify(service, times(3)).getLearnerState("learner");
        verifyNoInteractions(lifecycle);
    }

    @Test void postgresSerializationTranslationUsesTheSameFreshReadBoundary() {
        var service = mock(LearnerService.class);
        var conflict = new org.springframework.dao.CannotSerializeTransactionException("Concurrent snapshot", new SQLException("changed", "40001"));
        when(service.getLearnerState("learner")).thenThrow(conflict).thenReturn(null);
        var controller = new LearnerUiController(service, mock(ChatSessionService.class), mock(LearnerLifecycleService.class));
        controller.getLearnerState("learner");
        verify(service, times(2)).getLearnerState("learner");
    }

    @Test void ordinaryLockTimeoutsAndOtherFailuresAreNotRetried() {
        var service = mock(LearnerService.class);
        var conflict = new CannotAcquireLockException("Lock timeout", new SQLException("busy", "55P03"));
        when(service.getLearnerState("learner")).thenThrow(conflict);
        var controller = new LearnerUiController(service, mock(ChatSessionService.class), mock(LearnerLifecycleService.class));
        assertThatThrownBy(() -> controller.getLearnerState("learner")).isSameAs(conflict);
        verify(service, times(1)).getLearnerState("learner");
    }

    @Test void anExistingCallerTransactionCannotBeRetriedInsideItsAbortedSnapshot() {
        var service = mock(LearnerService.class);
        var conflict = new CannotAcquireLockException("Concurrent snapshot", new SQLException("changed", "40001"));
        when(service.getLearnerState("learner")).thenThrow(conflict);
        var controller = new LearnerUiController(service, mock(ChatSessionService.class), mock(LearnerLifecycleService.class));
        TransactionSynchronizationManager.setActualTransactionActive(true);
        try {
            assertThatThrownBy(() -> controller.getLearnerState("learner")).isSameAs(conflict);
            verify(service, times(1)).getLearnerState("learner");
        } finally { TransactionSynchronizationManager.setActualTransactionActive(false); }
    }
}
