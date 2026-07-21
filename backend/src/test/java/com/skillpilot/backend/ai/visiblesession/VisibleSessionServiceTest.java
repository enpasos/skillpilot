package com.skillpilot.backend.ai.visiblesession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;

class VisibleSessionServiceTest {

    private static final String TOKEN = "sps_VisibleSessionToken123";

    @Test
    void getState_returnsCompactLocalizedRelayFooterAndActiveGoal() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal goal = goal("9ef6c4fa-b97a-5d7a-86c1-96690f02d916", "Zahlen ordnen");
        UnifiedLearnerStateResponse state = state("teachActiveGoal", goal, List.of(goal));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test/");

        VisibleCoachStateResponse german = service.getState(TOKEN, "de");
        VisibleCoachStateResponse english = service.getState(TOKEN, "en-US");

        assertThat(german.relayFooter()).isEqualTo(
                "— SkillPilot · Sitzung: " + TOKEN + " · Lernziel-ID: " + goal.id());
        assertThat(english.relayFooter()).isEqualTo(
                "— SkillPilot · Session: " + TOKEN + " · Learning goal ID: " + goal.id());
        assertThat(german.activeGoal().goalId()).isEqualTo(goal.id());
        assertThat(german.activeGoal().cockpitUrl()).isEqualTo(
                "https://skillpilot.test/?l=math&goal=" + goal.id());
        assertThat(german.selection()).isNull();
        assertThat(german.curriculum().title()).isEqualTo("Mathematik");
        assertThat(german.allowedActions()).containsExactly(
                "getVisibleState",
                "setVisibleActiveGoal",
                "setVisibleMastery");
    }

    @Test
    void choose_mapsVisibleNumberToServerSideGoalAndReloadsState() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal first = goal("goal-1", "Erstes Ziel");
        FrontierGoal second = goal("goal-2", "Zweites Ziel");
        UnifiedLearnerStateResponse choices = state("setActiveGoal", null, List.of(first, second));
        UnifiedLearnerStateResponse updated = state("teachActiveGoal", second, List.of(second));
        when(facade.getSessionState(TOKEN)).thenReturn(choices, choices, updated);
        when(facade.setSessionActiveGoal(eq(TOKEN), any(ActiveGoalRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");
        assertThat(presented.allowedActions()).containsExactly(
                "getVisibleState",
                "applyVisibleChoice",
                "setVisibleActiveGoal");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(presented.selection().selectionReference(), 2));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().activeGoal().goalId()).isEqualTo(second.id());
        assertThat(outcome.response().relayFooter()).contains(TOKEN).contains(second.id());
        ArgumentCaptor<ActiveGoalRequest> requestCaptor = ArgumentCaptor.forClass(ActiveGoalRequest.class);
        verify(facade).setSessionActiveGoal(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(second.id());
        assertThat(requestCaptor.getValue().redirect()).isFalse();
    }

    @Test
    void choose_rejectsStaleReferenceWithoutApplyingAnyOption() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal option = goal("goal-current", "Aktuelles Ziel");
        UnifiedLearnerStateResponse state = state("setActiveGoal", null, List.of(option));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest("A-STALE000000", 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(outcome.response().instruction()).contains("nicht mehr aktuell");
        assertThat(outcome.response().selection()).isNotNull();
        verify(facade, never()).setSessionActiveGoal(any(), any());
        verify(facade, never()).setSessionScope(any(), any());
        verify(facade, never()).setSessionCurriculum(any(), any());
    }

    @Test
    void scopeChoiceKeepsInternalGoalIdOutOfVisibleOptionsButResolvesItServerSide() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal scope = goal("internal-scope-goal", "Analysis");
        UnifiedLearnerStateResponse choices = state("setScope", null, List.of(scope));
        UnifiedLearnerStateResponse updated = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(choices, choices, updated);
        when(facade.setSessionScope(eq(TOKEN), any(ScopeRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");
        assertThat(presented.selection().options()).singleElement().satisfies(option -> {
            assertThat(option.choiceNumber()).isEqualTo(1);
            assertThat(option.label()).isEqualTo("Analysis");
            assertThat(option.goalId()).isNull();
        });

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(presented.selection().selectionReference(), 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<ScopeRequest> requestCaptor = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(facade).setSessionScope(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalIds()).containsExactly(scope.id());
    }

    @Test
    void choose_returnsControlledConflictForUnsupportedPhaseOneAction() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal goal = goal("memory-goal", "Lernkarten");
        UnifiedLearnerStateResponse state = state("chooseMemoryMode", goal, List.of(goal));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest("A-ANY", 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(outcome.response().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThat(outcome.response().instruction()).contains("Visible-Session-Pilot").contains("Cockpit");
        assertThat(outcome.response().selection()).isNull();
        assertThat(outcome.response().allowedActions()).containsExactly("getVisibleState");
    }

    @Test
    void setMastery_requiresTheExplicitCurrentlyActivePublicGoalId() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        UnifiedLearnerStateResponse state = state("setMastery", active, List.of(active));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome outcome = service.setMastery(
                TOKEN,
                "de",
                new VisibleMasteryRequest("old-branch-goal", 1.0));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(outcome.response().instruction()).contains("nicht mehr das aktive Lernziel");
        verify(facade, never()).setSessionMastery(any(), any());
    }

    @Test
    void setMastery_translatesFixedShapeAndReturnsReloadedCompactState() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        FrontierGoal next = goal("next-goal", "Danach");
        UnifiedLearnerStateResponse before = state("setMastery", active, List.of(active));
        UnifiedLearnerStateResponse after = state("teachActiveGoal", next, List.of(next));
        when(facade.getSessionState(TOKEN)).thenReturn(before, after);
        when(facade.setSessionMastery(eq(TOKEN), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        null,
                        null,
                        null));
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome outcome = service.setMastery(
                TOKEN,
                "de",
                new VisibleMasteryRequest(active.id(), 0.9));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().activeGoal().goalId()).isEqualTo(next.id());
        assertThat(outcome.response().instruction()).contains("gespeichert");
        ArgumentCaptor<MasteryUpdateRequest> requestCaptor = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(facade).setSessionMastery(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().mastery()).containsEntry(active.id(), 0.9);
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(active.id());
    }

    private static FrontierGoal goal(String id, String title) {
        return new FrontierGoal(
                id,
                title,
                "Beschreibung für " + title,
                "atomic",
                "tutor",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private static UnifiedLearnerStateResponse state(
            String requiredAction,
            FrontierGoal activeGoal,
            List<FrontierGoal> options) {
        LandscapeSummary curriculum = new LandscapeSummary(
                "math",
                "Mathematik",
                "Curriculum",
                "DE",
                "DE",
                "canonical",
                "Mathematik",
                "de",
                List.of());
        return new UnifiedLearnerStateResponse(
                null,
                curriculum,
                options,
                null,
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        options,
                        List.of(),
                        activeGoal));
    }
}
