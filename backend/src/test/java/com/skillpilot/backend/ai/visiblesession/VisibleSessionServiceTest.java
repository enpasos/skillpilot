package com.skillpilot.backend.ai.visiblesession;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

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
                "requestVisibleNavigation",
                "setVisibleActiveGoal",
                "setVisibleMastery");
    }

    @Test
    void orientationStateBuildsInterestWithoutTestingSubjectKnowledge() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal orientation = orientationGoal(
                "orientation-goal",
                "Warum Mathematik? – Denken, Muster & Zukunft");
        UnifiedLearnerStateResponse state = state(
                "orientActiveGoal",
                orientation,
                List.of(orientation));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse german = service.getState(TOKEN, "de");
        VisibleCoachStateResponse english = service.getState(TOKEN, "en");

        assertThat(german.allowedActions()).containsExactly(
                "getVisibleState",
                "requestVisibleNavigation",
                "setVisibleActiveGoal",
                "setVisibleMastery");
        assertThat(german.instruction())
                .contains("Möglichkeiten", "positive Perspektiven")
                .contains("weder Vorwissen noch inhaltliches Detailwissen")
                .contains("keine richtige Fachantwort")
                .contains("ausdrücklich weiterlernen möchte")
                .doesNotContain("ausreichender Evidenz");
        assertThat(english.instruction())
                .contains("accessible possibilities", "positive perspectives")
                .contains("Do not test prior or detailed subject knowledge")
                .contains("explicitly chooses to continue")
                .doesNotContain("sufficient evidence");
    }

    @Test
    void selectionInstructionsKeepNaturalIntentWithinTheCurrentTurnInBothLocales() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        UnifiedLearnerStateResponse choices = state(
                "setScope",
                null,
                List.of(goal("math", "Mathematik", "cluster"), goal("physics", "Physik", "cluster")));
        when(facade.getSessionState(TOKEN)).thenReturn(choices);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse german = service.getState(TOKEN, "de");
        VisibleCoachStateResponse english = service.getState(TOKEN, "en");

        assertThat(german.instruction())
                .contains("fortgeltende Absicht")
                .contains("reine Nummernantwort gilt nur einmal");
        assertThat(english.instruction())
                .contains("standing intent")
                .contains("numbers-only reply is consumed once");
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
                "requestVisibleNavigation",
                "applyVisibleChoice",
                "setVisibleActiveGoal");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(presented.selection().selectionReference(), 2));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().activeGoal().goalId()).isEqualTo(second.id());
        assertThat(outcome.response().relayFooter()).contains(TOKEN).contains(second.id());
        assertThat(outcome.response().instruction()).contains("fortgeltenden natürlichen Mehrfachwunsch");
        ArgumentCaptor<ActiveGoalRequest> requestCaptor = ArgumentCaptor.forClass(ActiveGoalRequest.class);
        verify(facade).setSessionActiveGoal(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(second.id());
        assertThat(requestCaptor.getValue().redirect()).isFalse();
    }

    @Test
    void freshChoiceResponsesCanBeRelayedAcrossOneAssistantTurn() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal mathematics = goal("scope-math", "Mathematik", "cluster");
        FrontierGoal physics = goal("scope-physics", "Physik", "cluster");
        LandscapeSummary gymnasium = curriculum(
                "gymnasium",
                "Gymnasium (DE)",
                List.of(filter("DE-BY", "Bayern"), filter("DE-HE", "Hessen")));
        UnifiedLearnerStateResponse subjectChoices = stateWithDetails(
                "setScope",
                null,
                List.of(mathematics, physics),
                gymnasium,
                null,
                List.of());
        UnifiedLearnerStateResponse stateChoices = stateWithDetails(
                "setPersonalization",
                null,
                List.of(),
                gymnasium,
                null,
                List.of());
        FrontierGoal firstGoal = goal("math-first", "Erstes Mathematikziel");
        UnifiedLearnerStateResponse goalChoices = stateWithDetails(
                "setActiveGoal",
                null,
                List.of(firstGoal),
                gymnasium,
                null,
                List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(
                subjectChoices,
                subjectChoices,
                stateChoices,
                stateChoices,
                goalChoices);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse initial = service.getState(TOKEN, "de");
        VisibleSessionService.ActionOutcome afterSubject = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(initial.selection().selectionReference(), 1));

        assertThat(afterSubject.status()).isEqualTo(HttpStatus.OK);
        assertThat(afterSubject.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Bayern", "Hessen");
        assertThat(afterSubject.response().instruction()).contains("frischen State sofort");
        assertThat(afterSubject.response().selection().selectionReference())
                .isNotEqualTo(initial.selection().selectionReference());

        VisibleSessionService.ActionOutcome afterState = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(afterSubject.response().selection().selectionReference(), 2));

        assertThat(afterState.status()).isEqualTo(HttpStatus.OK);
        assertThat(afterState.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Erstes Mathematikziel");
        ArgumentCaptor<PersonalizationRequest> personalization =
                ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(facade).setSessionPersonalization(eq(TOKEN), personalization.capture());
        assertThat(personalization.getValue().goalIds()).containsExactly("gymnasium");
        assertThat(personalization.getValue().filters()).containsExactly("DE-HE");
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
        assertThat(presented.selection().question()).contains("eine oder mehrere Nummern");
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
    void scopeChoiceSupportsSeveralUniqueVisibleNumbers() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal first = goal("scope-a", "Analysis");
        FrontierGoal second = goal("scope-b", "Geometrie");
        UnifiedLearnerStateResponse choices = state("setScope", null, List.of(first, second));
        UnifiedLearnerStateResponse updated = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(choices, choices, updated);
        when(facade.setSessionScope(eq(TOKEN), any(ScopeRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(
                        presented.selection().selectionReference(),
                        null,
                        List.of(2, 1)));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<ScopeRequest> requestCaptor = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(facade).setSessionScope(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalIds()).containsExactly(second.id(), first.id());
    }

    @Test
    void choiceRejectsDuplicatesBothShapesAndMultipleNumbersOutsideScope() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal first = goal("goal-a", "A");
        FrontierGoal second = goal("goal-b", "B");
        UnifiedLearnerStateResponse choices = state("setActiveGoal", null, List.of(first, second));
        when(facade.getSessionState(TOKEN)).thenReturn(choices);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");
        String reference = presented.selection().selectionReference();

        assertThat(service.choose(TOKEN, "de", new VisibleChoiceRequest(reference, null, List.of(1, 1))).status())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(service.choose(TOKEN, "de", new VisibleChoiceRequest(reference, 1, List.of(1))).status())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(service.choose(TOKEN, "de", new VisibleChoiceRequest(reference, null, List.of(1, 2))).status())
                .isEqualTo(HttpStatus.BAD_REQUEST);
        verify(facade, never()).setSessionActiveGoal(any(), any());
    }

    @Test
    void personalizationOffersAllCurriculumFiltersAndKeepsIdsServerSide() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        LandscapeFilter hesse = filter("DE-HE", "Hessen");
        LandscapeFilter canonical = filter("ALL", "Kanonische DE-Sicht");
        UnifiedLearnerStateResponse choices = stateWithDetails(
                "setPersonalization",
                null,
                List.of(goal("subject-root", "Mathematik")),
                curriculum(List.of(canonical, hesse)),
                null,
                List.of());
        UnifiedLearnerStateResponse updated = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(choices, choices, updated);
        when(facade.setSessionPersonalization(eq(TOKEN), any(PersonalizationRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");

        assertThat(presented.selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Kanonische DE-Sicht", "Hessen");
        assertThat(presented.selection().options())
                .allSatisfy(option -> assertThat(option.goalId()).isNull());

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(presented.selection().selectionReference(), 2));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<PersonalizationRequest> captor = ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(facade).setSessionPersonalization(eq(TOKEN), captor.capture());
        assertThat(captor.getValue().goalIds()).containsExactly("math");
        assertThat(captor.getValue().filters()).containsExactly("DE-HE");
    }

    @Test
    void personalizationReferenceBecomesStaleAfterCurriculumChangesEvenWithSameFilterIds() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        LandscapeFilter filter = filter("GK", "Grundkurs");
        FrontierGoal root = goal("subject-root", "Fach");
        UnifiedLearnerStateResponse before = stateWithDetails(
                "setPersonalization",
                null,
                List.of(root),
                curriculum("curriculum-a", "Lehrplan A", List.of(filter)),
                null,
                List.of());
        UnifiedLearnerStateResponse changed = stateWithDetails(
                "setPersonalization",
                null,
                List.of(root),
                curriculum("curriculum-b", "Lehrplan B", List.of(filter)),
                null,
                List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(before, changed);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        String oldReference = service.getState(TOKEN, "de").selection().selectionReference();

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(oldReference, 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        verify(facade, never()).setSessionPersonalization(any(), any());
    }

    @Test
    void memoryModeIsAVisibleChoiceAndVerificationCanStartOnTheNextTurn() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal goal = memoryGoal("mem_de_vocab", "Lernkarten");
        UnifiedLearnerStateResponse state = stateWithDetails(
                "chooseMemoryMode",
                goal,
                List.of(goal),
                curriculum(List.of()),
                null,
                List.of(
                        new LearningModeOption("practice", "Üben", "Im Cockpit üben", "openCockpitPractice", "cockpit", goal.id()),
                        new LearningModeOption("verify", "Prüfen", "Im Chat prüfen", "startVerifiedRecall", "gpt", goal.id())));
        when(facade.getSessionState(TOKEN)).thenReturn(state);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse presented = service.getState(TOKEN, "de");

        assertThat(presented.interactionMode()).isEqualTo("selection");
        assertThat(presented.activeGoal().nodeKind()).isEqualTo("memory");
        assertThat(presented.selection().options()).extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Im Cockpit üben", "Mit Lerncoach prüfen");
        assertThat(presented.allowedActions()).containsExactly(
                "getVisibleState",
                "requestVisibleNavigation",
                "applyVisibleChoice",
                "startVisibleVerifiedRecall");

        VisibleCoachStateResponse english = service.getState(TOKEN, "en");
        assertThat(english.selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Practice in the Cockpit", "Check with the learning coach");

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(presented.selection().selectionReference(), 2));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().requiredAction()).isEqualTo("chooseMemoryMode");
        assertThat(outcome.response().instruction()).contains("startVisibleVerifiedRecall");
    }

    @Test
    void memoryModeReferenceBecomesStaleWhenTheActiveMemoryGoalChanges() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal first = memoryGoal("memory-a", "Erstes Kartenziel");
        FrontierGoal second = memoryGoal("memory-b", "Zweites Kartenziel");
        UnifiedLearnerStateResponse before = stateWithDetails(
                "chooseMemoryMode",
                first,
                List.of(first),
                curriculum(List.of()),
                null,
                List.of(new LearningModeOption(
                        "verify", "Prüfen", "Im Chat prüfen", "startVerifiedRecall", "gpt", first.id())));
        UnifiedLearnerStateResponse changed = stateWithDetails(
                "chooseMemoryMode",
                second,
                List.of(second),
                curriculum(List.of()),
                null,
                List.of(new LearningModeOption(
                        "verify", "Prüfen", "Im Chat prüfen", "startVerifiedRecall", "gpt", second.id())));
        when(facade.getSessionState(TOKEN)).thenReturn(before, changed);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        String oldReference = service.getState(TOKEN, "de").selection().selectionReference();

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(oldReference, 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(outcome.response().activeGoal().goalId()).isEqualTo(second.id());
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
                new VisibleMasteryRequest("old-branch-goal"));

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
                new VisibleMasteryRequest(active.id()));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().activeGoal().goalId()).isEqualTo(next.id());
        assertThat(outcome.response().instruction()).contains("gespeichert");
        ArgumentCaptor<MasteryUpdateRequest> requestCaptor = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(facade).setSessionMastery(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().mastery()).containsEntry(active.id(), 1.0);
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(active.id());
    }

    @Test
    void completingOrientationStoresOneWithoutCallingItSubjectMastery() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal orientation = orientationGoal("orientation-goal", "Warum Mathematik?");
        UnifiedLearnerStateResponse before = state(
                "orientActiveGoal",
                orientation,
                List.of(orientation));
        UnifiedLearnerStateResponse after = state("setActiveGoal", null, List.of());
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
                new VisibleMasteryRequest(orientation.id()));

        assertThat(outcome.status()).isEqualTo(HttpStatus.OK);
        assertThat(outcome.response().instruction())
                .contains("Orientierung wurde als abgeschlossen")
                .doesNotContain("Mastery");
        ArgumentCaptor<MasteryUpdateRequest> requestCaptor = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(facade).setSessionMastery(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().mastery()).containsEntry(orientation.id(), 1.0);
    }

    @Test
    void verifiedRecallRelaysPromptAnswerAndResultWithoutLeakingAnswerInPrompt() throws Exception {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal memory = memoryGoal("mem_de_vocab", "Begriffe");
        UnifiedLearnerStateResponse state = stateWithDetails(
                "chooseMemoryMode",
                memory,
                List.of(memory),
                curriculum(List.of()),
                null,
                List.of(new LearningModeOption(
                        "verify", "Prüfen", "Im Chat prüfen", "startVerifiedRecall", "gpt", memory.id())));
        UnifiedLearnerStateResponse completed = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(state, state, state, completed);
        VerifiedRecallPromptResponse prompt = recallPrompt(memory.id(), "card-1", "Was bedeutet Demokratie?");
        when(facade.startSessionVerifiedRecall(eq(TOKEN), eq("de"), any(VerifiedRecallStartRequest.class)))
                .thenReturn(prompt);
        when(facade.getSessionVerifiedRecallAnswer(eq(TOKEN), eq("de"), any(VerifiedRecallAnswerRequest.class)))
                .thenReturn(new VerifiedRecallAnswerResponse(
                        "Jetzt vergleichen.", memory.id(), "card-1", "Was bedeutet Demokratie?",
                        "Herrschaft des Volkes", "Begriff"));
        when(facade.recordSessionVerifiedRecallResult(eq(TOKEN), eq("de"), any(VerifiedRecallResultRequest.class)))
                .thenReturn(new VerifiedRecallResultResponse(
                        "card-1", true, 1, 0, true, memory.id(), "Ziel abgeschlossen.",
                        new VerifiedRecallPromptResponse(
                                "complete", "Abgeschlossen.", null, memory.id(), memory.title(),
                                1, 1, 0, 0, 0, null, 0, List.of(), null, null, null)));
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleVerifiedRecallPromptResponse visiblePrompt = service.startVerifiedRecall(
                TOKEN, "de", new VerifiedRecallStartRequest(null, false, 1));

        assertThat(visiblePrompt.relayFooter()).contains(TOKEN).contains(memory.id());
        assertThat(visiblePrompt.cards()).singleElement().satisfies(card -> {
            assertThat(card.cardId()).isEqualTo("card-1");
            assertThat(card.prompt()).isEqualTo("Was bedeutet Demokratie?");
        });
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        com.fasterxml.jackson.databind.JsonNode promptJson = objectMapper.valueToTree(visiblePrompt);
        assertThat(objectMapper.writeValueAsString(visiblePrompt))
                .doesNotContain("expectedAnswer")
                .doesNotContain("Herrschaft des Volkes");
        assertThat(promptJson.has("cardId")).isFalse();
        assertThat(promptJson.has("prompt")).isFalse();
        assertThat(promptJson.has("category")).isFalse();
        assertThat(visiblePrompt.instruction())
                .contains("getVisibleVerifiedRecallAnswer", "recordVisibleVerifiedRecallResult")
                .doesNotContain("verified-recall/start");

        VisibleVerifiedRecallAnswerResponse answer = service.getVerifiedRecallAnswer(
                TOKEN, "de", new VerifiedRecallAnswerRequest(memory.id(), "card-1"));
        assertThat(answer.expectedAnswer()).isEqualTo("Herrschaft des Volkes");
        assertThat(answer.relayFooter()).contains(memory.id());
        assertThat(answer.instruction()).contains("recordVisibleVerifiedRecallResult");

        VisibleVerifiedRecallResultResponse result = service.recordVerifiedRecallResult(
                TOKEN,
                "de",
                new VerifiedRecallResultRequest(memory.id(), "card-1", true, "korrekt"));
        assertThat(result.masterySaved()).isTrue();
        assertThat(result.masteryGoalId()).isEqualTo(memory.id());
        assertThat(result.next().status()).isEqualTo("complete");
        assertThat(result.relayFooter()).isEqualTo("— SkillPilot · Sitzung: " + TOKEN);
        assertThat(result.next().goalId()).isEqualTo(memory.id());
        assertThat(result.instruction()).contains("setVisibleMastery").doesNotContain(" setMastery");
        com.fasterxml.jackson.databind.JsonNode resultJson = objectMapper.valueToTree(result);
        assertThat(resultJson.path("next").has("relayFooter")).isFalse();
        assertThat(resultJson.path("next").has("instruction")).isFalse();
        assertThat(resultJson.path("next").has("cardId")).isFalse();
    }

    @Test
    void curriculumNavigationUsesFullCatalogAndAppliesAnExplicitSelection() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        UnifiedLearnerStateResponse current = state("teachActiveGoal", active, List.of(active));
        UnifiedLearnerStateResponse updated = state("setPersonalization", null, List.of());
        LandscapeSummary mathematics = curriculum("math", "Mathematik", List.of());
        LandscapeSummary physics = curriculum("physics", "Physik", List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(current, current, updated);
        when(facade.getSessionCurriculumOptions(TOKEN)).thenReturn(List.of(mathematics, physics));
        when(facade.setSessionCurriculum(eq(TOKEN), any(UpdateCurriculumRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome navigation = service.requestNavigation(
                TOKEN,
                "de",
                new VisibleNavigationRequest(VisibleNavigationRequest.Target.CURRICULUM));

        assertThat(navigation.status()).isEqualTo(HttpStatus.OK);
        assertThat(navigation.response().interactionMode()).isEqualTo("selection");
        assertThat(navigation.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Mathematik", "Physik");
        assertThat(navigation.response().instruction()).contains("fortgeltende Absicht");
        verify(facade, never()).setSessionCurriculum(any(), any());

        VisibleSessionService.ActionOutcome applied = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(navigation.response().selection().selectionReference(), 2));

        assertThat(applied.status()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<UpdateCurriculumRequest> requestCaptor = ArgumentCaptor.forClass(UpdateCurriculumRequest.class);
        verify(facade).setSessionCurriculum(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().getCurriculumId()).isEqualTo("physics");
    }

    @Test
    void personalizationNavigationOffersAllFiltersEvenWhenOneIsAlreadyActive() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        LandscapeFilter basic = filter("GK", "Grundkurs");
        LandscapeFilter advanced = filter("LK", "Leistungskurs");
        UnifiedLearnerStateResponse current = stateWithDetails(
                "teachActiveGoal",
                active,
                List.of(active),
                curriculum(List.of(basic, advanced)),
                null,
                List.of(),
                List.of("GK"));
        UnifiedLearnerStateResponse updated = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(current, current, updated);
        when(facade.setSessionPersonalization(eq(TOKEN), any(PersonalizationRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome navigation = service.requestNavigation(
                TOKEN,
                "de",
                new VisibleNavigationRequest(VisibleNavigationRequest.Target.PERSONALIZATION));

        assertThat(navigation.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Grundkurs", "Leistungskurs");
        verify(facade, never()).setSessionPersonalization(any(), any());

        service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(navigation.response().selection().selectionReference(), 2));

        ArgumentCaptor<PersonalizationRequest> requestCaptor = ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(facade).setSessionPersonalization(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalIds()).containsExactly("math");
        assertThat(requestCaptor.getValue().filters()).containsExactly("LK");
    }

    @Test
    void scopeNavigationPrefersClustersAndSupportsSeveralSelectedAreas() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        FrontierGoal analysis = goal("scope-analysis", "Analysis", "cluster");
        FrontierGoal geometry = goal("scope-geometry", "Geometrie", "cluster");
        FrontierGoal atomic = goal("atomic-hidden", "Einzelziel");
        UnifiedLearnerStateResponse current = state(
                "teachActiveGoal",
                active,
                List.of(analysis, atomic, geometry));
        UnifiedLearnerStateResponse updated = state("setActiveGoal", null, List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(current, current, updated);
        when(facade.setSessionScope(eq(TOKEN), any(ScopeRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome navigation = service.requestNavigation(
                TOKEN,
                "de",
                new VisibleNavigationRequest(VisibleNavigationRequest.Target.SCOPE));

        assertThat(navigation.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Analysis", "Geometrie");
        assertThat(navigation.response().selection().question()).contains("eine oder mehrere Nummern");
        assertThat(navigation.response().selection().options())
                .allSatisfy(option -> assertThat(option.goalId()).isNull());
        verify(facade, never()).setSessionScope(any(), any());

        service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(
                        navigation.response().selection().selectionReference(),
                        null,
                        List.of(1, 2)));

        ArgumentCaptor<ScopeRequest> requestCaptor = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(facade).setSessionScope(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalIds()).containsExactly(analysis.id(), geometry.id());
    }

    @Test
    void goalNavigationUsesAtomicFrontierAndAppliesARealRedirect() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        FrontierGoal cluster = goal("scope-analysis", "Analysis", "cluster");
        FrontierGoal first = goal("goal-first", "Erstes Ziel");
        FrontierGoal second = goal("goal-second", "Zweites Ziel");
        UnifiedLearnerStateResponse current = state(
                "teachActiveGoal",
                active,
                List.of(cluster, first, second));
        UnifiedLearnerStateResponse updated = state("teachActiveGoal", second, List.of(second));
        when(facade.getSessionState(TOKEN)).thenReturn(current, current, updated);
        when(facade.setSessionActiveGoal(eq(TOKEN), any(ActiveGoalRequest.class))).thenReturn(updated);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleSessionService.ActionOutcome navigation = service.requestNavigation(
                TOKEN,
                "de",
                new VisibleNavigationRequest(VisibleNavigationRequest.Target.GOAL));

        assertThat(navigation.response().selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::goalId)
                .containsExactly(first.id(), second.id());
        verify(facade, never()).setSessionActiveGoal(any(), any());

        service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(navigation.response().selection().selectionReference(), 2));

        ArgumentCaptor<ActiveGoalRequest> requestCaptor = ArgumentCaptor.forClass(ActiveGoalRequest.class);
        verify(facade).setSessionActiveGoal(eq(TOKEN), requestCaptor.capture());
        assertThat(requestCaptor.getValue().goalId()).isEqualTo(second.id());
        assertThat(requestCaptor.getValue().redirect()).isTrue();
    }

    @Test
    void changedNavigationOptionsMakeTheReferenceStaleWithoutMutation() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal active = goal("active-goal", "Aktiv");
        UnifiedLearnerStateResponse before = state(
                "teachActiveGoal",
                active,
                List.of(goal("goal-before", "Vorher")));
        UnifiedLearnerStateResponse changed = state(
                "teachActiveGoal",
                active,
                List.of(goal("goal-after", "Danach")));
        when(facade.getSessionState(TOKEN)).thenReturn(before, changed);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");
        VisibleSessionService.ActionOutcome navigation = service.requestNavigation(
                TOKEN,
                "de",
                new VisibleNavigationRequest(VisibleNavigationRequest.Target.GOAL));

        VisibleSessionService.ActionOutcome outcome = service.choose(
                TOKEN,
                "de",
                new VisibleChoiceRequest(navigation.response().selection().selectionReference(), 1));

        assertThat(outcome.status()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(outcome.response().instruction()).contains("nicht mehr aktuell");
        verify(facade, never()).setSessionActiveGoal(any(), any());
    }

    @Test
    void examStateFiltersUnreleasedCandidatesAndEvaluationAloneContainsSolution() throws Exception {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal released = examGoal("exam-released", "Freigegebene Prüfung", "released");
        FrontierGoal draft = examGoal("exam-draft", "Entwurf", "needs_review");
        FrontierGoal missingPayload = new FrontierGoal(
                "exam-missing", "Prüfung ohne Daten", "Nicht auswählbar", "atomic", "exam", "test",
                List.of(), List.of(), null, null, null, null);
        UnifiedLearnerStateResponse selectionState = state(
                "setActiveGoal",
                null,
                List.of(released, draft, missingPayload));
        when(facade.getSessionState(TOKEN)).thenReturn(selectionState);
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse selection = service.getState(TOKEN, "de");

        assertThat(selection.selection().options())
                .extracting(VisibleCoachStateResponse.SelectionOption::label)
                .containsExactly("Freigegebene Prüfung");

        UnifiedLearnerStateResponse activeState = stateWithDetails(
                "teachActiveGoal",
                released,
                List.of(released),
                curriculum(List.of()),
                new LearnerGoals(
                        List.of(released),
                        2,
                        5,
                        new GoalStats(2, 5),
                        new GoalStats(1, 2),
                        false),
                List.of());
        when(facade.getSessionState(TOKEN)).thenReturn(activeState);
        when(facade.getSessionExamEvaluation(
                TOKEN,
                new CoachToolFacade.ExamEvaluationRequest(released.id())))
                .thenReturn(examEvaluation(released));
        when(facade.getSessionExamEvaluation(
                TOKEN,
                new CoachToolFacade.ExamEvaluationRequest("other-goal")))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The cited goal is not the active exam goal."));

        VisibleCoachStateResponse active = service.getState(TOKEN, "de");

        assertThat(active.interactionMode()).isEqualTo("exam");
        assertThat(active.activeGoal().nodeKind()).isEqualTo("exam");
        assertThat(active.activeGoal().examData().taskContent())
                .doesNotContain("IMAGE_PATH:")
                .contains("\\(x\\)");
        assertThat(active.activeGoal().examData().hasImage()).isTrue();
        assertThat(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(active))
                .doesNotContain("solutionContent")
                .doesNotContain("sourceArtifactPath")
                .doesNotContain("Musterlösung");
        assertThat(active.allowedActions()).contains("getVisibleExamEvaluation");
        assertThat(active.progress().masteredAtomic()).isEqualTo(2);
        assertThat(active.progress().personalized().totalAtomic()).isEqualTo(5);
        assertThat(active.completion().curriculumComplete()).isFalse();
        assertThat(active.resources())
                .anySatisfy(resource -> {
                    assertThat(resource.type()).isEqualTo("goal-visualization");
                    assertThat(resource.title()).isEqualTo("goal-visualization");
                    assertThat(resource.url()).isEqualTo(active.activeGoal().cockpitUrl());
                    assertThat(resource.requiresCockpit()).isTrue();
                })
                .anySatisfy(resource -> {
                    assertThat(resource.type()).isEqualTo("reference");
                    assertThat(resource.url()).isEqualTo("https://skillpilot.test/ai-assets/guide.pdf");
                    assertThat(resource.requiresCockpit()).isFalse();
                });

        VisibleExamEvaluationResponse evaluation = service.getExamEvaluation(
                TOKEN, "de", new VisibleExamEvaluationRequest(released.id()));
        assertThat(evaluation.solutionContent())
                .contains("Musterlösung")
                .contains("\\(x=2\\)")
                .contains("https://skillpilot.test/ai-assets/rubric.pdf");
        assertThat(evaluation.scoring().maxPoints()).isEqualTo(10);
        assertThat(evaluation.scoring().steps()).singleElement().satisfies(step -> {
            assertThat(step.id()).isEqualTo("step-1");
            assertThat(step.points()).isEqualTo(10);
        });
        assertThat(evaluation.instruction())
                .contains("nur Referenz")
                .contains("gleichwertige")
                .contains("bestimmte Antwortform")
                .contains("Anforderungen bleiben verbindlich")
                .contains("ohne Rückfrage")
                .contains("keinen konkreten fachlichen Fehler");

        VisibleExamEvaluationResponse englishEvaluation = service.getExamEvaluation(
                TOKEN, "en", new VisibleExamEvaluationRequest(released.id()));
        assertThat(englishEvaluation.instruction())
                .contains("reference only")
                .contains("equivalent")
                .contains("specific answer form")
                .contains("requirements remain binding")
                .contains("without follow-up questions")
                .contains("never invent a specific subject error");
        verify(facade, times(2)).getSessionExamEvaluation(
                TOKEN,
                new CoachToolFacade.ExamEvaluationRequest(released.id()));

        assertThatThrownBy(() -> service.getExamEvaluation(
                TOKEN, "de", new VisibleExamEvaluationRequest("other-goal")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void examEvaluationDelegatesBadRequestWithoutASeparateStateRead() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        when(facade.getSessionExamEvaluation(TOKEN, null))
                .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "goalId must not be empty."));
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        assertThatThrownBy(() -> service.getExamEvaluation(TOKEN, "de", null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        verify(facade).getSessionExamEvaluation(TOKEN, null);
        verify(facade, never()).getSessionState(any());
    }

    @Test
    void unreleasedOrIncompleteActiveExamNeverExposesTaskSolutionOrEvaluation() throws Exception {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal draft = examGoal("exam-draft", "Entwurf", "needs_review");
        FrontierGoal incomplete = examGoal("exam-incomplete", "Unvollständig", "released");
        incomplete.examData().setScoring(null);
        UnifiedLearnerStateResponse draftState = state("teachActiveGoal", draft, List.of(draft));
        UnifiedLearnerStateResponse incompleteState = state("teachActiveGoal", incomplete, List.of(incomplete));
        when(facade.getSessionState(TOKEN)).thenReturn(draftState, incompleteState);
        when(facade.getSessionExamEvaluation(
                TOKEN,
                new CoachToolFacade.ExamEvaluationRequest(draft.id())))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The cited goal is not the active exam goal."));
        when(facade.getSessionExamEvaluation(
                TOKEN,
                new CoachToolFacade.ExamEvaluationRequest(incomplete.id())))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "The cited goal is not the active exam goal."));
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse visibleDraft = service.getState(TOKEN, "de");

        assertThat(visibleDraft.activeGoal().nodeKind()).isEqualTo("exam");
        assertThat(visibleDraft.activeGoal().examData()).isNull();
        assertThat(visibleDraft.allowedActions()).doesNotContain("getVisibleExamEvaluation");
        assertThat(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(visibleDraft))
                .doesNotContain("Berechne")
                .doesNotContain("Musterlösung");
        assertThatThrownBy(() -> service.getExamEvaluation(
                TOKEN,
                "de",
                new VisibleExamEvaluationRequest(draft.id())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        VisibleCoachStateResponse visibleIncomplete = service.getState(TOKEN, "de");
        assertThat(visibleIncomplete.activeGoal().examData()).isNull();
        assertThatThrownBy(() -> service.getExamEvaluation(
                TOKEN,
                "de",
                new VisibleExamEvaluationRequest(incomplete.id())))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void ordinaryGoalWithoutNodeKindIsNormalizedToTutor() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        FrontierGoal ordinary = new FrontierGoal(
                "ordinary-goal", "Ordentliches Ziel", "Beschreibung", "atomic", null, null,
                List.of(), List.of(), null, null, null, null);
        when(facade.getSessionState(TOKEN)).thenReturn(state("teachActiveGoal", ordinary, List.of(ordinary)));
        VisibleSessionService service = new VisibleSessionService(facade, "https://skillpilot.test");

        VisibleCoachStateResponse response = service.getState(TOKEN, "de");

        assertThat(response.activeGoal().nodeKind()).isEqualTo("tutor");
        assertThat(response.interactionMode()).isEqualTo("chat");
    }

    private static FrontierGoal goal(String id, String title) {
        return goal(id, title, "atomic");
    }

    private static FrontierGoal goal(String id, String title, String type) {
        return new FrontierGoal(
                id,
                title,
                "Beschreibung für " + title,
                type,
                "tutor",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private static FrontierGoal orientationGoal(String id, String title) {
        return new FrontierGoal(
                id,
                title,
                "Zeigt Möglichkeiten und positive Perspektiven auf.",
                "atomic",
                "tutor",
                "orientation",
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private static FrontierGoal memoryGoal(String id, String title) {
        FrontierGoal base = goal(id, title);
        return new FrontierGoal(
                base.id(), base.title(), base.description(), base.type(), "memory", base.reason(),
                base.tags(), base.resourceLinks(), base.sourceRef(), base.sourceLicense(),
                base.sourceLicenseUrl(), null);
    }

    private static FrontierGoal examGoal(String id, String title, String reviewStatus) {
        ExamData exam = new ExamData();
        exam.setReviewStatus(reviewStatus);
        exam.setSourceArtifactPath("private/source.json");
        exam.setTaskContent("![Material](/assets/exam.png)\n\nBerechne $x$.");
        exam.setTaskContentEn("![Material](/assets/exam.png)\n\nCompute $x$.");
        exam.setSolutionContent("Musterlösung: $x=2$. [Anlage](/assets/rubric.pdf)");
        exam.setSolutionContentEn("Solution: $x=2$.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(5);
        ExamData.Step step = new ExamData.Step();
        step.setId("step-1");
        step.setPoints(10);
        step.setDescription("Vollständige Lösung");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return new FrontierGoal(
                id,
                title,
                "Beschreibung für " + title,
                "atomic",
                null,
                "test",
                List.of(),
                List.of(
                        new GoalSourceLink(
                                "goal-visualization", null, "/assets/private-image.png", "image",
                                "SkillPilot", List.of(), null, "de", null, id, "primary", "Diagramm", "released"),
                        new GoalSourceLink(
                                "reference", "Merkblatt", "/assets/guide.pdf", "document",
                                "SkillPilot", List.of(), null, "de", null, id, null, null, "released")),
                null,
                null,
                null,
                exam);
    }

    private static CoachToolFacade.ExamEvaluationResult examEvaluation(FrontierGoal goal) {
        ExamData exam = goal.examData();
        CoachToolFacade.ExamScoring scoring = exam.getScoring() == null
                ? null
                : new CoachToolFacade.ExamScoring(
                        exam.getScoring().getMaxPoints(),
                        exam.getScoring().getPassingPoints(),
                        exam.getScoring().getSteps().stream()
                                .map(step -> new CoachToolFacade.ExamScoringStep(
                                        step.getId(),
                                        step.getPoints(),
                                        step.getDescription()))
                                .toList());
        return new CoachToolFacade.ExamEvaluationResult(
                goal.id(),
                exam.getSolutionContent(),
                exam.getSolutionContentEn(),
                scoring);
    }

    private static VerifiedRecallPromptResponse recallPrompt(String goalId, String cardId, String prompt) {
        return new VerifiedRecallPromptResponse(
                "ready",
                "Stelle die Frage.",
                null,
                goalId,
                "Begriffe",
                1,
                0,
                1,
                1,
                0,
                null,
                1,
                List.of(new VerifiedRecallPromptCard(cardId, prompt, "Begriff")),
                cardId,
                prompt,
                "Begriff");
    }

    private static LandscapeFilter filter(String id, String label) {
        LandscapeFilter filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(label);
        return filter;
    }

    private static LandscapeSummary curriculum(List<LandscapeFilter> filters) {
        return curriculum("math", "Mathematik", filters);
    }

    private static LandscapeSummary curriculum(String id, String title, List<LandscapeFilter> filters) {
        return new LandscapeSummary(
                id,
                title,
                "Curriculum",
                "DE",
                "DE",
                "canonical",
                "Mathematik",
                "de",
                filters);
    }

    private static UnifiedLearnerStateResponse state(
            String requiredAction,
            FrontierGoal activeGoal,
            List<FrontierGoal> options) {
        return stateWithDetails(
                requiredAction,
                activeGoal,
                options,
                curriculum(List.of()),
                null,
                List.of());
    }

    private static UnifiedLearnerStateResponse stateWithDetails(
            String requiredAction,
            FrontierGoal activeGoal,
            List<FrontierGoal> options,
            LandscapeSummary curriculum,
            LearnerGoals goals,
            List<LearningModeOption> modeOptions) {
        return stateWithDetails(
                requiredAction,
                activeGoal,
                options,
                curriculum,
                goals,
                modeOptions,
                List.of());
    }

    private static UnifiedLearnerStateResponse stateWithDetails(
            String requiredAction,
            FrontierGoal activeGoal,
            List<FrontierGoal> options,
            LandscapeSummary curriculum,
            LearnerGoals goals,
            List<LearningModeOption> modeOptions,
            List<String> activeFilters) {
        return new UnifiedLearnerStateResponse(
                null,
                curriculum,
                options,
                goals,
                List.of("setMastery"),
                activeFilters,
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        options,
                        List.of(),
                        activeGoal,
                        modeOptions));
    }
}
