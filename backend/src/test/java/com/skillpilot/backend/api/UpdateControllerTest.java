package com.skillpilot.backend.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.service.SseService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class UpdateControllerTest {

    private static final String LEARNER_ID = "sse-learner";

    @Test
    void holdsTheTransactionAcrossTheLearnerLockAndEmitterRegistration() throws Exception {
        assertThat(UpdateController.class
                        .getDeclaredMethod("subscribe", String.class)
                        .isAnnotationPresent(Transactional.class))
                .isTrue();
    }

    @Test
    void locksTheLearnerBeforeRegisteringTheEmitter() {
        LearnerRepository learners = mock(LearnerRepository.class);
        SseService sse = mock(SseService.class);
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        SseEmitter emitter = new SseEmitter();
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.of(learner));
        when(sse.subscribe(LEARNER_ID)).thenReturn(emitter);

        SseEmitter response = new UpdateController(sse, learners).subscribe(LEARNER_ID);

        assertThat(response).isSameAs(emitter);
        InOrder ordered = inOrder(learners, sse);
        ordered.verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        ordered.verify(sse).subscribe(LEARNER_ID);
    }

    @Test
    void rejectsAnUnknownLearnerBeforeRegisteringAnEmitter() {
        LearnerRepository learners = mock(LearnerRepository.class);
        SseService sse = mock(SseService.class);
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> new UpdateController(sse, learners).subscribe(LEARNER_ID))
                .isInstanceOfSatisfying(
                        ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.NOT_FOUND));

        verifyNoInteractions(sse);
    }
}
