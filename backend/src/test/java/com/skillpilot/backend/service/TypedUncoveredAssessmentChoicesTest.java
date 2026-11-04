package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.*;
import com.skillpilot.backend.completion.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

/** Real compilation and transitions with synthetic persistence; explicit offers never prove required work. */
class TypedUncoveredAssessmentChoicesTest {
    private static final String ID = TypedUncoveredLearningFixture.ID;
    private TypedUncoveredLearningFixture f;

    @BeforeEach void setup() {
        f = new TypedUncoveredLearningFixture();
        f.addForeignUncoveredConsumer();
        f.learner.setFollowLearningPlans(false);
        for (String id : List.of("A", "B", "C", "D")) f.mastery.put(id, 1.0);
        f.clearObservedWrites();
    }

    @ParameterizedTest @ValueSource(booleans = {false, true})
    void explicitReadyAssessmentChoiceDoesNotBecomeRequiredWorkOrAutopilot(boolean autopilot) {
        f.learner.setAutoPilot(autopilot);
        long revision = f.learner.getCoachStateRevision();
        var state = f.learners.getCoachLearnerState(ID);
        assertThat(state.frontier()).isEmpty();
        assertThat(f.learners.getRichFrontier(ID)).isEmpty();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(state.stateMachine().goalOptions()).singleElement().satisfies(goal -> {
            assertThat(goal.id()).isEqualTo("Q");
            assertThat(goal.examReadyForSelection()).isTrue();
            assertThat(goal.examData()).isNull();
        });
        assertThat(state.nextAllowedActions()).contains("setActiveGoal").doesNotContain("setMastery");
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
        assertThat(state.levelCompletion().actions()).isEmpty();
        var projected = new CoachStateProjection("https://skillpilot.test").project(state);
        assertThat(projected.stateMachine().goalOptions()).singleElement()
                .satisfies(goal -> assertThat(goal.examData()).isNull());
        assertThat(CoachStateProjection.isVoluntaryLearningChoice(projected)).isTrue();
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(f.mastery).containsOnlyKeys("A", "B", "C", "D");
        assertNoWrites();
    }

    @Test void explicitFacadeStartBindsTheActualTaskAndAllowsEvaluationWithoutInventingMastery() {
        assertThatThrownBy(() -> f.facade.getExamEvaluation(ID, new CoachToolFacade.ExamEvaluationRequest("Q")))
                .isInstanceOf(ResponseStatusException.class);
        var state = f.facade.setActiveGoal(ID, new ActiveGoalRequest("Q", false));
        assertThat(state.activeGoal().id()).isEqualTo("Q");
        assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(f.learner.getCompletionWorkflow())
                .assessmentStart()).isEqualTo(AssessmentTaskContract.start(f.graph.get("Q")));
        f.clearObservedWrites();
        var evaluation = f.facade.getExamEvaluation(ID, new CoachToolFacade.ExamEvaluationRequest("Q"));
        assertThat(evaluation.goalId()).isEqualTo("Q");
        assertThat(evaluation.solutionContent()).isEqualTo("Protected synthetic solution.");
        assertThat(evaluation.scoring().maxPoints()).isEqualTo(1.0);
        assertThat(f.mastery).doesNotContainKey("Q");
        assertNoWrites();
    }

    @ParameterizedTest @ValueSource(strings = {"Q", "FOREIGN", "unknown-assessment"})
    void evaluationAndMasteryCannotSubstituteForExplicitTaskConsent(String requestedGoal) {
        long revision = f.learner.getCoachStateRevision();
        var result = f.facade.setMastery(ID, new MasteryUpdateRequest(Map.of(requestedGoal, 1.0), requestedGoal));
        assertThat(result.status()).isEqualTo(CoachToolFacade.MasteryStatus.CONFLICT);
        assertThatThrownBy(() -> f.facade.getExamEvaluation(ID, new CoachToolFacade.ExamEvaluationRequest("Q")))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(f.learner.getCompletionWorkflow())).isNull();
        assertThat(f.mastery).doesNotContainKey("Q");
        verify(f.masteryRepository, never()).save(any());
        assertThat(f.completionHistory).isEmpty();
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);
        assertNoWrites();
    }

    @Test void ordinaryMasteryRecoveryStillSelectsAnAvailableOrdinaryGoal() {
        f.mastery.remove("A");
        assertThat(f.learners.getCoachLearnerState(ID).frontier()).extracting(FrontierGoal::id).contains("A");
        var result = f.facade.setMastery(ID, new MasteryUpdateRequest(Map.of("A", 1.0), "A"));
        assertThat(result.status()).isEqualTo(CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(f.mastery).containsEntry("A", 1.0).doesNotContainKey("Q");
        assertThat(f.learner.getCompletionWorkflow()).isNull();
        verify(f.masteryRepository).save(any());
    }

    @ParameterizedTest @ValueSource(strings = {"prerequisite", "focus", "removed-target", "draft", "missing-task", "missing-rubric", "stored-focus", "owned-workflow", "catalog", "strict-input"})
    void displayOnlyChoicesCannotCrossScopeReadinessOrInputBoundaries(String boundary) {
        switch (boundary) {
            case "prerequisite" -> { f.mastery.remove("C"); f.learner.setStrictMode(true); }
            case "focus" -> { f.focus.clear(); f.focus.add("D"); }
            case "removed-target" -> f.hideSelectedTarget("Q");
            case "draft" -> f.graph.get("Q").getExamData().setReviewStatus("draft");
            case "missing-task" -> f.graph.get("Q").getExamData().setTaskContent(null);
            case "missing-rubric" -> f.graph.get("Q").getExamData().setScoring(null);
            case "stored-focus" -> { f.focus.clear(); f.focus.add("composition:removed:structure:missing"); }
            case "owned-workflow" -> f.learner.setCompletionWorkflow("{}");
            case "catalog" -> ReflectionTestUtils.setField(f.automatic.catalog(), "available", false);
            case "strict-input" -> {
                f.strictMemory(true, false);
                doThrow(new IllegalStateException("Actual strict repository failure"))
                        .when(f.srs).findByLearnerAndNodeIds(anyString(), any());
            }
        }
        f.clearObservedWrites();
        long revision = f.learner.getCoachStateRevision();
        var state = f.learners.getCoachLearnerState(ID);
        if (boundary.equals("stored-focus")) {
            // Atomic IDs in an explicit scope chooser are choices, not authorization to start them.
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(state.nextAllowedActions()).doesNotContain("setActiveGoal");
        } else {
            assertThat(state.stateMachine().goalOptions()).extracting(FrontierGoal::id).doesNotContain("Q");
        }
        assertThatThrownBy(() -> f.facade.setActiveGoal(ID, new ActiveGoalRequest("Q", false)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertThat(f.learner.getCoachStateRevision()).isEqualTo(revision);
        assertNoWrites();
    }

    @ParameterizedTest @ValueSource(booleans = {false, true})
    void choicesReuseTheOneStrictSnapshotDespiteRealLaterSrsFailures(boolean verified) {
        f.graph.get("Q").setRequires(List.of("B"));
        f.strictMemory(verified, true);
        f.clearObservedWrites();
        var state = f.learners.getCoachLearnerState(ID);
        assertThat(state.frontier()).isEmpty();
        assertThat(state.stateMachine().goalOptions()).extracting(FrontierGoal::id)
                .containsExactlyElementsOf(verified ? List.of("Q") : List.of());
        assertThat(f.realLaterSrsFailures.get()).isPositive();
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertNoWrites();
    }

    @Test void displayOnlyExamsCannotResumeAPlanOrCreateQuotaCredit() throws Exception {
        f.learner.setFollowLearningPlans(true);
        f.learner.setAutoPilot(true);
        var plan = f.addPlan(List.of(f.block("exam", "Q", TypedUncoveredLearningFixture.TODAY,
                TypedUncoveredLearningFixture.TODAY, true)));
        String blocks = plan.getBlocksJson();
        f.clearObservedWrites();
        var state = f.learners.getCoachLearnerState(ID);
        assertThat(state.stateMachine().goalOptions()).extracting(FrontierGoal::id).containsExactly("Q");
        assertThat(state.frontier()).isEmpty();
        var status = f.plans.getTodayStatus(ID, "de");
        assertThat(status.evaluable()).isFalse();
        assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(status.subjects()).allSatisfy(subject -> assertThat(subject.balance()).isNull());
        assertThat(f.plans.reconcile(ID, new LearnerLearningPlanApi.ReconcileRequest(
                TypedUncoveredLearningFixture.TODAY)).changed()).isFalse();
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertThat(plan.getBlocksJson()).isEqualTo(blocks);
        assertThat(f.completionHistory).isEmpty();
        assertNoWrites();
    }

    @Test void previouslyPublishedChoicesDoNotAuthorizeAStartAfterPreparationChanges() {
        assertThat(f.learners.getCoachLearnerState(ID).stateMachine().goalOptions())
                .extracting(FrontierGoal::id).containsExactly("Q");
        f.learner.setStrictMode(true);
        f.mastery.remove("C");
        f.clearObservedWrites();
        assertThatThrownBy(() -> f.facade.setActiveGoal(ID, new ActiveGoalRequest("Q", false)))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(f.learner.getActiveGoalId()).isNull();
        assertNoWrites();
    }

    @Test void changingTheStartedTaskRequiresNewExplicitConsentBeforeEvaluationOrMastery() {
        f.facade.setActiveGoal(ID, new ActiveGoalRequest("Q", false));
        f.graph.get("Q").getExamData().setTaskContent("A different current complete task.");
        f.clearObservedWrites();
        assertThat(f.learners.getCoachLearnerState(ID).stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThatThrownBy(() -> f.facade.getExamEvaluation(ID, new CoachToolFacade.ExamEvaluationRequest("Q")))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(f.facade.setMastery(ID, new MasteryUpdateRequest(Map.of("Q", 1.0), "Q")).status())
                .isEqualTo(CoachToolFacade.MasteryStatus.CONFLICT);
        assertThat(f.mastery).doesNotContainKey("Q");
        assertNoWrites();
    }

    private void assertNoWrites() {
        verify(f.masteryRepository, never()).save(any());
        verify(f.focusRepository, never()).save(any());
        verify(f.focusRepository, never()).deleteAll(any());
        verify(f.planRepository, never()).saveAndFlush(any());
        verify(f.events, never()).publishEvent(any(Object.class));
    }
}
