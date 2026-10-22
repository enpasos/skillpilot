package com.skillpilot.backend.service.learningplan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LearningPlanScopeResolverTest {
    private static final LocalDate TODAY = LocalDate.parse("2026-10-22");

    @Test
    void nearestSelectedExamUsesStableIdTieBreakAndDoesNotUnionExamsOrAnUnselectedAppointment() {
        var appointment = exam("appointment", TODAY, List.of(), true);
        var later = exam("later", TODAY.plusDays(5), List.of("c"), true);
        var tieB = exam("b", TODAY.plusDays(2), List.of("b"), true);
        var tieA = exam("a", TODAY.plusDays(2), List.of("a"), true);
        var scope = LearningPlanScopeResolver.resolve(List.of(later, appointment, tieB, tieA), TODAY,
                List::copyOf, List.of());
        assertThat(scope.sourceBlockId()).isEqualTo("a");
        assertThat(scope.goalIds()).containsExactly("a");
    }

    @Test
    void ongoingExactScopeSurvivesDateChangeWithoutMovingToTheNextExam() {
        var first = exam("first", TODAY.minusDays(1), List.of("a", "b"), true);
        var second = exam("second", TODAY.plusDays(2), List.of("c"), true);
        var scope = LearningPlanScopeResolver.resolve(List.of(first, second), TODAY, List::copyOf, List.of("b", "a"));
        assertThat(scope.sourceBlockId()).isEqualTo("first");
        assertThat(scope.goalIds()).containsExactly("a", "b");
        var nextStart = LearningPlanScopeResolver.resolve(List.of(first, second), TODAY, List::copyOf, List.of());
        assertThat(nextStart.sourceBlockId()).isEqualTo("second");
    }

    @Test
    void identicalSelectionsUseTheSameNextExamRuleForReadAndExplicitStart() {
        var old = exam("old", TODAY.minusDays(1), List.of("a"), true);
        var next = exam("next", TODAY.plusDays(1), List.of("a"), true);
        var read = LearningPlanScopeResolver.resolve(List.of(old, next), TODAY, List::copyOf, List.of("a"));
        var start = LearningPlanScopeResolver.resolve(List.of(old, next), TODAY, List::copyOf, List.of());
        assertThat(read).isEqualTo(start);
        assertThat(read.sourceBlockId()).isEqualTo("next");
    }

    @Test
    void inactiveExamCannotBindEvenWhenItsOldFocusStillMatches() {
        var inactive = exam("inactive", TODAY, List.of("a"), false);
        var learning = new LearnerLearningPlanApi.Block("section", "learning", null, "Plan",
                TODAY, TODAY, null, List.of("b"), null, true);
        var scope = LearningPlanScopeResolver.resolve(List.of(inactive, learning), TODAY, List::copyOf, List.of("a"));
        assertThat(scope.kind()).isEqualTo("plan");
        assertThat(scope.goalIds()).containsExactly("b");
    }

    @Test
    void oldUnvalidatedGoalIdDoesNotBreakUsableDatedLearningButExplicitInvalidSelectionFailsClosed() {
        var legacy = new LearnerLearningPlanApi.Block("old", "milestone", "removed", "Alter Termin",
                null, null, TODAY, null);
        var learning = new LearnerLearningPlanApi.Block("section", "learning", null, "Plan",
                TODAY, TODAY, null, List.of("b"), null, true);
        var scope = LearningPlanScopeResolver.resolve(List.of(legacy, learning), TODAY,
                roots -> { throw new ResponseStatusException(HttpStatus.BAD_REQUEST); }, List.of());
        assertThat(scope.kind()).isEqualTo("plan");
        assertThat(scope.goalIds()).containsExactly("b");
        assertThatThrownBy(() -> LearningPlanScopeResolver.resolve(
                List.of(exam("explicit", TODAY, List.of("removed"), true), learning), TODAY,
                roots -> { throw new ResponseStatusException(HttpStatus.BAD_REQUEST); }, List.of()))
                .isInstanceOf(ResponseStatusException.class);
    }

    private LearnerLearningPlanApi.Block exam(String id, LocalDate date, List<String> roots, boolean active) {
        return new LearnerLearningPlanApi.Block(id, "milestone", null, "Klausur " + id,
                null, null, date, null, roots, active);
    }
}
