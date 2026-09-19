package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.ChampionTrialRequest;
import com.skillpilot.backend.domain.CurriculumChampion;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.landscape.LearningGoal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class ChampionTrialServiceTest {
    private final LearnerGoalCompletionService completions = mock(LearnerGoalCompletionService.class);
    private final ChampionPracticeFingerprint fingerprints = new ChampionPracticeFingerprint(
            new ObjectMapper(), mock(DeckResourceService.class));
    private final ChampionTrialService service = new ChampionTrialService(completions, fingerprints, new ObjectMapper());
    private CurriculumChampion champion;
    private LearningGoal a;
    private LearningGoal b;

    @BeforeEach
    void setup() {
        champion = new CurriculumChampion();
        champion.setSkillpilotId("private-learner-a");
        champion.setCurriculumId("curriculum");
        champion.setGithubId("owner");
        a = goal("a"); b = goal("b");
        when(completions.getPracticeHistory(anyString())).thenReturn(List.of());
    }

    @Test
    void registrationAndLegacyMasteryNeverStartOrCompleteTrial() {
        when(completions.getPracticeHistory("private-learner-a")).thenReturn(List.of(legacy("a"), legacy("b")));
        assertThat(service.status(champion, scope()).state()).isEqualTo("not_started");
        assertThat(service.status(champion, scope()).practicedGoals()).isZero();
        assertThat(service.status(champion, scope()).canComplete()).isFalse();
        assertThat(service.status(champion, scope()).canStart()).isTrue();
    }

    @Test
    void m5AllowsExplicitStartAndPauseResumePreserveEvidence() {
        start();
        assertThat(service.status(champion, scope()).state()).isEqualTo("in_progress");
        service.apply(champion, scope(), new ChampionTrialRequest("pause", null));
        assertThat(service.status(champion, scope()).state()).isEqualTo("paused");
        service.apply(champion, scope(), new ChampionTrialRequest("resume", null));
        assertThat(service.status(champion, scope()).state()).isEqualTo("in_progress");
        assertThat(champion.getTrialScopeJson()).isEqualTo("named-scope");
    }

    @Test
    void belowM5AndEmptyScopesCannotStart() {
        assertThatThrownBy(() -> service.apply(champion,
                new ChampionTrialService.Scope("x", "Scope", true, Map.of("a", a), false, 0),
                new ChampionTrialRequest("start", null))).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.apply(champion,
                new ChampionTrialService.Scope("x", "Scope", true, Map.of(), true, 0),
                new ChampionTrialRequest("start", null))).isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void realPriorPracticeIsReusableButStillNeedsExplicitConfirmation() {
        evidence(a, b);
        start();
        assertThat(service.status(champion, scope()).canComplete()).isTrue();
        assertThat(service.status(champion, scope()).state()).isEqualTo("in_progress");
        assertThatThrownBy(() -> service.apply(champion, scope(), new ChampionTrialRequest("complete", false)))
                .isInstanceOf(ResponseStatusException.class);
        complete();
        assertThat(service.status(champion, scope()).state()).isEqualTo("completed");
        assertThat(service.status(champion, scope()).canComplete()).isFalse();
    }

    @Test
    void differentChampionsPartialCompletionsAreNeverCombined() {
        when(completions.getPracticeHistory("private-learner-a")).thenReturn(List.of(practice(a)));
        when(completions.getPracticeHistory("private-learner-b")).thenReturn(List.of(practice(b)));
        start();
        assertThat(service.status(champion, scope()).practicedGoals()).isEqualTo(1);
        assertThat(service.status(champion, scope()).canComplete()).isFalse();
        verify(completions, never()).getPracticeHistory("private-learner-b");
    }

    @Test
    void knownBlockerCannotBeOverriddenByCompletionConfirmation() {
        evidence(a, b); start();
        var blocked = new ChampionTrialService.Scope("named-scope", "Mathematik, Hessen, Sek II", true,
                Map.of("a", a, "b", b), true, 1);
        assertThat(service.status(champion, blocked).canComplete()).isFalse();
        assertThatThrownBy(() -> service.apply(champion, blocked, new ChampionTrialRequest("complete", true)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void newOrChangedGoalsRequireOnlyTheirOwnSupplementaryPractice() throws Exception {
        evidence(a, b); start(); complete();
        b.setDescription("Substantively new competence");
        assertThat(service.status(champion, scope()).state()).isEqualTo("stale");
        assertThat(service.status(champion, scope()).practicedGoals()).isEqualTo(1);
        service.apply(champion, scope(), new ChampionTrialRequest("resume", null));
        evidence(a, b); complete();
        assertThat(service.status(champion, scope()).state()).isEqualTo("completed");
        assertThat(new ObjectMapper().readTree(champion.getTrialConfirmationsJson()).size()).isEqualTo(2);
        LearningGoal c = goal("c");
        var expanded = new ChampionTrialService.Scope("named-scope", "Mathematik, Hessen, Sek II", true,
                Map.of("a", a, "b", b, "c", c), true, 0);
        assertThat(service.status(champion, expanded).state()).isEqualTo("stale");
        assertThat(service.status(champion, expanded).practicedGoals()).isEqualTo(2);
    }

    @Test
    void cosmeticWhitespaceDoesNotInvalidatePractice() {
        evidence(a, b); start(); complete();
        a.setDescription("  Competence   a \n ");
        assertThat(service.status(champion, scope()).state()).isEqualTo("completed");
    }

    @Test
    void endingRolePreservesCompletedEvidenceButEndsUnfinishedActiveState() {
        start(); champion.setAssignmentEndedAt(Instant.now());
        assertThat(service.status(champion, scope()).state()).isEqualTo("paused");
        champion.setAssignmentEndedAt(null); evidence(a, b); complete();
        champion.setAssignmentEndedAt(Instant.now());
        assertThat(service.status(champion, scope()).state()).isEqualTo("completed");
        assertThatThrownBy(() -> service.apply(champion, scope(), new ChampionTrialRequest("resume", null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void incompleteFingerprintsFailClosedAndDoNotCountAsPractice() {
        a.setExtendedData(Map.of("vocabularySource", "missing.json"));
        when(completions.getPracticeHistory("private-learner-a")).thenReturn(List.of(practice(b)));
        start();
        assertThat(service.status(champion, scope()).canComplete()).isFalse();
    }

    private ChampionTrialService.Scope scope() {
        return new ChampionTrialService.Scope("named-scope", "Mathematik, Hessen, Sek II", true,
                Map.of("a", a, "b", b), true, 0);
    }
    private void start() { service.apply(champion, scope(), new ChampionTrialRequest("start", null)); }
    private void complete() { service.apply(champion, scope(), new ChampionTrialRequest("complete", true)); }
    private void evidence(LearningGoal... goals) {
        when(completions.getPracticeHistory("private-learner-a")).thenReturn(java.util.Arrays.stream(goals).map(this::practice).toList());
    }
    private LearnerGoalCompletion practice(LearningGoal goal) {
        var result = legacy(goal.getId());
        result.bindPracticeEvidence("coach_learning", fingerprints.forGoal(goal), Instant.parse("2026-01-01T12:00:00Z"));
        return result;
    }
    private LearnerGoalCompletion legacy(String goal) {
        return new LearnerGoalCompletion(new Learner(), goal, LocalDate.of(2026, 1, 1), Instant.parse("2026-01-01T12:00:00Z"), 1);
    }
    private static LearningGoal goal(String id) {
        LearningGoal goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setDescription("Competence " + id);
        return goal;
    }
}
