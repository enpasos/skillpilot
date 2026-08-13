package com.skillpilot.backend.ai.visiblesession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.ClaudeConnectionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.SseService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;

class VisibleSessionActivityContractTest {

    private static final String LEARNER_ID = "visible-ai-activity";
    private static final String SESSION_TOKEN = "visible-session-token";
    private static final Instant PREVIOUS_ACTIVITY = Instant.parse("2025-01-01T00:00:00Z");

    private Learner learner;
    private LearnerRepository learners;
    private LearnerService learnerService;
    private ChatSessionService chatSessions;
    private VisibleSessionAiController controller;

    @BeforeEach
    void setUp() {
        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setLastActivityAt(PREVIOUS_ACTIVITY);
        learners = mock(LearnerRepository.class);
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.of(learner));
        when(learners.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        LearnerLifecycleService lifecycle = new LearnerLifecycleService(
                learners,
                mock(ClaudeConnectionRepository.class),
                mock(OpenAiDeConnectionRepository.class),
                mock(JdbcOperations.class),
                mock(SseService.class));
        learnerService = mock(LearnerService.class);
        chatSessions = mock(ChatSessionService.class);
        when(chatSessions.resolveSkillpilotIdWithoutActivity(SESSION_TOKEN))
                .thenReturn(LEARNER_ID);
        CoachToolFacade facade = new CoachToolFacade(
                learnerService,
                chatSessions,
                new CoachStateProjection("https://skillpilot.test"),
                lifecycle);
        controller = new VisibleSessionAiController(
                new VisibleSessionService(facade, "https://skillpilot.test"));
    }

    @Test
    void successfulVisibleStateCountsExactlyOnce() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("teachActiveGoal"));

        assertThat(controller.getState("de", SESSION_TOKEN).getStatusCode())
                .isEqualTo(HttpStatus.OK);

        assertThat(learner.getLastActivityAt()).isAfter(PREVIOUS_ACTIVITY);
        verify(chatSessions, times(1)).resolveSkillpilotIdWithoutActivity(SESSION_TOKEN);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners).save(learner);
    }

    @Test
    void invalidVisibleChoiceDoesNotCountTheStateReadAsActivity() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("setScope"));

        assertThat(controller.choose(
                                "de",
                                SESSION_TOKEN,
                                new VisibleChoiceRequest("", 1))
                        .getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThat(learner.getLastActivityAt()).isEqualTo(PREVIOUS_ACTIVITY);
        verify(chatSessions, times(1)).resolveSkillpilotIdWithoutActivity(SESSION_TOKEN);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners, never()).save(learner);
    }

    @Test
    void staleVisibleChoiceConflictDoesNotCountTheStateReadAsActivity() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("setScope"));

        assertThat(controller.choose(
                                "de",
                                SESSION_TOKEN,
                                new VisibleChoiceRequest("A-STALE000000", 1))
                        .getStatusCode())
                .isEqualTo(HttpStatus.CONFLICT);

        assertThat(learner.getLastActivityAt()).isEqualTo(PREVIOUS_ACTIVITY);
        verify(chatSessions, times(1)).resolveSkillpilotIdWithoutActivity(SESSION_TOKEN);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners, never()).save(learner);
    }

    private static UnifiedLearnerStateResponse state(String requiredAction) {
        FrontierGoal goal = new FrontierGoal(
                "goal-1",
                "Goal",
                "Description",
                "atomic",
                "tutor",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
        List<FrontierGoal> options = "setScope".equals(requiredAction)
                ? List.of()
                : List.of(goal);
        return new UnifiedLearnerStateResponse(
                null,
                null,
                options,
                null,
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                goal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        options,
                        List.of(),
                        goal));
    }
}
