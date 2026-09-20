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
    void registrationAndUnboundCompletionRowsAloneNeverStartOrCompleteTrial() {
        when(completions.getPracticeHistory("private-learner-a")).thenReturn(List.of(legacy("a"), legacy("b")));
        assertThat(service.status(champion, scope()).state()).isEqualTo("not_started");
        assertThat(service.status(champion, scope()).practicedGoals()).isZero();
        assertThat(service.status(champion, scope()).canComplete()).isFalse();
        assertThat(service.status(champion, scope()).canStart()).isTrue();
    }

    @Test
    void currentLearningProgressStartsOldAndNewAssignmentsWithoutInventingEvidenceOrDates() {
        var progress = progressScope(1);
        for (Instant registration : List.of(Instant.parse("2020-01-01T00:00:00Z"), Instant.now())) {
            champion.setCreatedAt(registration);
            var status = service.status(champion, progress);
            assertThat(status.state()).isEqualTo("in_progress");
            assertThat(status.canStart()).isFalse();
            assertThat(status.practicedGoals()).isZero();
            assertThat(status.canComplete()).isFalse();
            assertThat(champion.getTrialStartedAt()).isNull();
            assertThat(champion.getTrialScopeJson()).isNull();
        }
        assertThat(service.status(champion, progressScope(0)).state()).isEqualTo("not_started");
    }

    @Test
    void completeMasteryAloneNeverGrantsHumanCompletion() {
        var progress = progressScope(2);
        assertThat(service.status(champion, progress).state()).isEqualTo("in_progress");
        assertThat(service.status(champion, progress).canComplete()).isFalse();
        assertThatThrownBy(() -> service.apply(champion, progress, new ChampionTrialRequest("complete", true)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(champion.getTrialConfirmationsJson()).isNull();
    }

    @Test
    void inferredTrialCanPauseAndResumeWithPinnedScopeButNoInventedStartTime() {
        var progress = progressScope(1);
        service.apply(champion, progress, new ChampionTrialRequest("pause", null));
        assertThat(service.status(champion, progress).state()).isEqualTo("paused");
        assertThat(champion.getTrialScopeJson()).isEqualTo("named-scope");
        assertThat(champion.getTrialStartedAt()).isNull();
        // A later mastery reset must not erase an explicit pause or prevent resumption.
        assertThat(service.status(champion, progressScope(0)).state()).isEqualTo("paused");
        service.apply(champion, progressScope(0), new ChampionTrialRequest("resume", null));
        assertThat(service.status(champion, progressScope(0)).state()).isEqualTo("in_progress");
        assertThat(champion.getTrialStartedAt()).isNull();
    }

    @Test
    void progressNeverOverridesPausedEndedOrBelowCoreReadyState() {
        var progress = progressScope(1);
        champion.setTrialPausedAt(Instant.now());
        assertThat(service.status(champion, progress).state()).isEqualTo("paused");
        champion.setTrialPausedAt(null);
        champion.setAssignmentEndedAt(Instant.now());
        assertThat(service.status(champion, progress).state()).isEqualTo("paused");
        assertThat(service.status(champion, progress).canComplete()).isFalse();
        champion.setAssignmentEndedAt(null);
        var belowM5 = new ChampionTrialService.Scope("named-scope", "Scope", true,
                Map.of("a", a, "b", b), false, 0, true, 1);
        assertThat(service.status(champion, belowM5).state()).isEqualTo("not_started");
    }

    @Test
    void inferredTrialCanCompleteOnlyWithCurrentPracticalCoverageAndExplicitConfirmation() {
        var progress = progressScope(2);
        evidence(a, b);
        assertThat(service.status(champion, progress).canComplete()).isTrue();
        assertThatThrownBy(() -> service.apply(champion, progress, new ChampionTrialRequest("complete", false)))
                .isInstanceOf(ResponseStatusException.class);
        service.apply(champion, progress, new ChampionTrialRequest("complete", true));
        assertThat(service.status(champion, progressScope(0)).state()).isEqualTo("completed");
        assertThat(champion.getTrialStartedAt()).isNull();
        assertThat(champion.getTrialScopeJson()).isEqualTo("named-scope");
        b.setDescription("Changed competence");
        assertThat(service.status(champion, progress).state()).isEqualTo("stale");
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
    void unavailableFindingsPermitTrialButNeverCompletionOrInventedBlockerCounts() {
        evidence(a, b); start();
        var unknown = new ChampionTrialService.Scope("named-scope", "Math", true,
                Map.of("a", a, "b", b), true, 0, false);
        assertThat(service.status(champion, unknown).state()).isEqualTo("in_progress");
        assertThat(service.status(champion, unknown).blockingFindings()).isZero();
        assertThat(service.status(champion, unknown).findingsAvailable()).isFalse();
        assertThat(service.status(champion, unknown).canComplete()).isFalse();
    }

    @Test
    void confirmationBindsExactlyTheEvidenceSnapshotThatPassedValidation() {
        var changing = mock(ChampionPracticeFingerprint.class);
        when(changing.forGoal(a)).thenReturn(fingerprints.forGoal(a), "different-content");
        when(changing.forGoal(b)).thenReturn(fingerprints.forGoal(b));
        evidence(a, b);
        champion.setTrialStartedAt(Instant.now());
        champion.setTrialScopeJson("named-scope");
        var once = new ChampionTrialService(completions, changing, new ObjectMapper());
        once.apply(champion, scope(), new ChampionTrialRequest("complete", true));
        verify(changing, times(1)).forGoal(a);
        verify(changing, times(1)).forGoal(b);
        assertThat(service.status(champion, scope()).state()).isEqualTo("completed");
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
    private ChampionTrialService.Scope progressScope(long masteredGoals) {
        return new ChampionTrialService.Scope("named-scope", "Mathematik, Hessen, Sek II", true,
                Map.of("a", a, "b", b), true, 0, true, masteredGoals);
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
