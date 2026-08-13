package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
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
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

class LearnerAiControllerActivityTest {

    private static final String LEARNER_ID = "legacy-ai-activity";
    private static final String SESSION_TOKEN = "legacy-session-token";
    private static final Instant PREVIOUS_ACTIVITY = Instant.parse("2025-01-01T00:00:00Z");

    private Learner learner;
    private LearnerRepository learners;
    private LearnerService learnerService;
    private ChatSessionService chatSessions;
    private LearnerAiController controller;

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
        controller = new LearnerAiController(learnerService, facade);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("https");
        request.setServerName("skillpilot.test");
        request.setServerPort(443);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void successfulDirectStateCountsExactlyOnce() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("teachActiveGoal"));

        UnifiedLearnerStateResponse response = controller.getLearnerState(LEARNER_ID);

        assertThat(response.skillpilotId()).isEqualTo(LEARNER_ID);
        assertThat(learner.getLastActivityAt()).isAfter(PREVIOUS_ACTIVITY);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners).save(learner);
    }

    @Test
    void successfulSessionStateCountsExactlyOnce() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("teachActiveGoal"));

        UnifiedLearnerStateResponse response = controller.getSessionState(SESSION_TOKEN);

        assertThat(response.skillpilotId()).isNull();
        assertThat(learner.getLastActivityAt()).isAfter(PREVIOUS_ACTIVITY);
        verify(chatSessions).resolveSkillpilotIdWithoutActivity(SESSION_TOKEN);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners).save(learner);
    }

    @Test
    void invalidDirectMasteryDoesNotCountAsActivity() {
        assertThat(controller.setMastery(LEARNER_ID, null).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);

        assertThat(learner.getLastActivityAt()).isEqualTo(PREVIOUS_ACTIVITY);
        verify(learners).findBySkillpilotIdForUpdate(LEARNER_ID);
        verify(learners, never()).save(learner);
    }

    @Test
    void staleSessionMasteryConflictDoesNotCountAsActivityOrDoubleResolve() {
        when(learnerService.getCoachLearnerState(LEARNER_ID))
                .thenReturn(state("setScope"));

        assertThat(controller.setSessionMastery(
                                SESSION_TOKEN,
                                new MasteryUpdateRequest(Map.of("goal-1", 1.0), "goal-1"))
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
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                null,
                List.of(goal),
                null,
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                goal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        List.of(goal),
                        List.of(),
                        goal));
    }
}
