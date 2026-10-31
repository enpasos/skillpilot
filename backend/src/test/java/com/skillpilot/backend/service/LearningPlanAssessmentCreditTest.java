package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.completion.CompletionProfileDefinition;
import com.skillpilot.backend.completion.LearningPlanCompletionContext;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class LearningPlanAssessmentCreditTest {
    private static final String ID = "learner";
    private static final LocalDate DATE = LocalDate.parse("2026-10-30");
    private final LearnerLearningPlanRepository plans = mock(LearnerLearningPlanRepository.class);
    private final LearnerService learners = mock(LearnerService.class);
    private final LandscapeService landscapes = mock(LandscapeService.class);
    private final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
    private final Learner learner = new Learner();
    private final Map<String, Double> mastery = new LinkedHashMap<>();
    private final Map<String, Instant> completions = new LinkedHashMap<>();
    private final List<LearnerLearningPlan> storedPlans = new ArrayList<>();
    private LearnerLearningPlanService service;
    private LearningPlanCompletionContext context;

    @BeforeEach void setup() throws Exception {
        learner.setSkillpilotId(ID); learner.setSelectedCurriculum("base");
        learner.setLearningPlanPeriodBasis(PeriodBasis.DAY);
        service = new LearnerLearningPlanService(plans, learners, mapper, events, landscapes,
                Clock.fixed(Instant.parse("2026-10-30T12:00:00Z"), ZoneOffset.UTC));
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (String id : List.of("a", "b", "q", "consumer", "extra", "physics")) {
            var goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setContains(List.of());
            goal.setRequires("q".equals(id) ? List.of("a", "b")
                    : "consumer".equals(id) || "physics".equals(id) ? List.of("a") : List.of());
            if ("q".equals(id)) goal.setNodeKind("exam");
            graph.put(id, goal);
            when(landscapes.getGoalDefinition(id)).thenReturn(goal);
            when(landscapes.getLandscapeIdForGoal(id)).thenReturn("physics".equals(id) ? "physics" : "math");
        }
        var definition = new CompletionProfileDefinition(1, "reviewed", "1", Map.of("de", "Abschnitt", "en", "Section"),
                "scope", Map.of(), List.of(), new CompletionProfileDefinition.Review("review", "1", "1", "1"),
                List.of(new CompletionProfileDefinition.WaiverRule("rule", List.of("q"), List.of("a", "b"),
                        "Reviewed task coverage", "review")));
        var compiled = new CompletionProfileCompiler().compile(definition, graph,
                Set.of("a", "b", "q"), graph.keySet(), "generation");
        context = new LearningPlanCompletionContext("base", "generation", graph, graph.keySet(), List.of(compiled));
        when(learners.getLearner(ID)).thenReturn(learner);
        when(learners.getMastery(ID)).thenAnswer(inv -> Map.copyOf(mastery));
        when(learners.getGoalCompletionsOnDate(eq(ID), any())).thenAnswer(inv -> Map.copyOf(completions));
        when(learners.getGoalCompletionsBetween(eq(ID), any(), any())).thenAnswer(inv -> Map.copyOf(completions));
        when(learners.getLearningPlanCompletionContext(eq(ID), any())).thenAnswer(inv -> {
            Set<String> obligations = inv.getArgument(1);
            return obligations.contains("a") || obligations.contains("b") ? context : null;
        });
        when(learners.resolveLearningPlanCompletionMastery(eq(ID), any(), any()))
                .thenAnswer(inv -> inv.getArgument(1));
        when(learners.isLearningPlanCompatible(eq(ID), any(), anyString(), any())).thenReturn(true);
        when(learners.resolveLearningPlanGoalIds(eq(ID), anyString(), any()))
                .thenAnswer(inv -> inv.getArgument(2));
        when(learners.getPersonalCurriculumAtomicTargetsByLandscape(ID))
                .thenReturn(Map.of("math", List.of("a", "b", "q", "consumer", "extra"), "physics", List.of("physics")));
        when(plans.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(ID)).thenAnswer(inv -> List.copyOf(storedPlans));
        for (String landscape : List.of("math", "math-other", "physics")) {
            var value = new SkillLandscape();
            value.setSubject("physics".equals(landscape) ? "Physik" : "Mathematik");
            value.setTitle(value.getSubject());
            when(landscapes.getById(landscape)).thenReturn(value);
        }
        addPlan("math", List.of("a", "b", "q"), List.of("a", "b", "q"));
        mastery.put("q", 1.0);
        completions.put("q", Instant.parse("2026-10-30T09:00:00Z"));
    }

    @Test void inclusiveAndExplicitCountingShareOneFixedScheduleAndRealEvents() throws Exception {
        String originalBlocks = storedPlans.getFirst().getBlocksJson();
        var inclusive = subject("mathematik");
        assertThat(inclusive.balance().rohsaldo()).isZero();
        assertThat(inclusive.learningScope().achievedGoalCount()).isEqualTo(3);
        assertThat(inclusive.achievedGoalCount()).isEqualTo(1); // Global Level-2 mastery stays separate.
        assertThat(inclusive.planCreditText()).contains("3 Ziele", "2 implizit erledigt");
        learner.setLearningPlanCountOnlyExplicitGoals(true);
        var explicit = subject("mathematik");
        assertThat(explicit.balance().rohsaldo()).isEqualTo(-2);
        assertThat(explicit.learningScope().achievedGoalCount()).isEqualTo(1);
        assertThat(explicit.planCreditText()).isNull();
        assertThat(explicit.periodGauge().target()).isEqualTo(inclusive.periodGauge().target());
        assertThat(storedPlans.getFirst().getBlocksJson()).isEqualTo(originalBlocks);
        assertThat(mastery).containsExactly(Map.entry("q", 1.0));
        assertThat(completions).containsOnlyKeys("q");
        verify(events, never()).publishEvent(any(Object.class));
        assertThat(mapper.readTree(mapper.writeValueAsString(inclusive)).path("planCreditText").asText())
                .isEqualTo(inclusive.planCreditText());
    }

    @Test void routeChangesAndShortcutOptOutCannotChangePlanCredit() {
        var before = subject("mathematik").balance();
        learner.setUseAssessmentShortcuts(false);
        learner.setCompletionWorkflow(null);
        learner.setActiveGoalId("extra");
        assertThat(subject("mathematik").balance()).isEqualTo(before);
        learner.setLearningPlanPeriodBasis(PeriodBasis.WEEK);
        assertThat(subject("mathematik").balance().rohsaldo()).isZero();
    }

    @Test void authoredConsumerExcludedFromCapturedGStillBlocksAfterItsMasteryIsRevoked() throws Exception {
        storedPlans.clear();
        addPlan("math", List.of("a", "b", "q"), List.of("a", "b", "q", "consumer"));
        mastery.put("consumer", 1.0);
        assertThat(subject("mathematik").balance().rohsaldo()).isZero();
        mastery.remove("consumer");
        assertThat(subject("mathematik").balance().rohsaldo()).isEqualTo(-1);
    }

    @Test void sameSubjectPlansShareDemandBeforeDeduplication() throws Exception {
        addPlan("math-other", List.of("a", "consumer"), List.of("a", "consumer"));
        var status = subject("mathematik");
        assertThat(status.periodGauge().target()).isEqualTo(4);
        assertThat(status.balance().rohsaldo()).isEqualTo(-2); // q + b; a remains required by consumer.
        mastery.put("consumer", 1.0);
        assertThat(subject("mathematik").balance().rohsaldo()).isZero();
    }

    @Test void foreignSubjectConsumerDoesNotReopenOwnPlanCredit() throws Exception {
        addPlan("physics", List.of("physics"), List.of("physics"));
        assertThat(subject("mathematik").balance().rohsaldo()).isZero();
        assertThat(subject("physik").balance().rohsaldo()).isEqualTo(-1);
    }

    @Test void missingExpectedCoverageIsVisibleButAnUnrelatedSubjectRemainsEvaluable() throws Exception {
        addPlan("physics", List.of("physics"), List.of("physics"));
        when(learners.getLearningPlanCompletionContext(eq(ID), any())).thenAnswer(inv -> {
            Set<String> goals = inv.getArgument(1);
            if (goals.contains("a")) throw new IllegalStateException("Pinned review inputs unavailable");
            return null;
        });
        assertThat(subject("mathematik").evaluable()).isFalse();
        assertThat(subject("mathematik").balance()).isNull();
        assertThat(subject("physik").evaluable()).isTrue();
        assertThat(service.getTodayStatus(ID, "de").noticeText()).isNotBlank();
    }

    @Test void navigationSkipsWaivedPreparationInBothCountingModesWithoutChangingTheNormalFrontier() {
        when(learners.getUncompactedRichFrontierForFocus(eq(ID), any()))
                .thenReturn(List.of(frontier("a"), frontier("b")));
        when(learners.getPersonalCurriculumSubjectFrontier(ID, "math"))
                .thenReturn(List.of(frontier("a"), frontier("b"), frontier("extra")));
        var normal = service.getPlan(ID, "math", DATE);
        assertThat(normal.nextEligibleGoal().goalId()).isEqualTo("extra");
        learner.setLearningPlanCountOnlyExplicitGoals(true);
        assertThat(service.getPlan(ID, "math", DATE).nextEligibleGoal().goalId()).isEqualTo("extra");
        assertThat(learners.getUncompactedRichFrontierForFocus(ID, List.of("a", "b", "q")))
                .extracting(FrontierGoal::id).containsExactly("a", "b");
    }

    @Test void collectionSummariesReuseTheSameSubjectSnapshot() throws Exception {
        addPlan("math-other", List.of("a", "consumer"), List.of("a", "consumer"));
        service.getPlans(ID, DATE, "de");
        verify(learners, times(1)).getMastery(ID);
        verify(learners, times(1)).getLearningPlanCompletionContext(eq(ID), any());
        verify(learners, times(1)).resolveLearningPlanCompletionMastery(eq(ID), any(), any());
    }

    @Test void automaticPlansAcrossSubjectsShareOneFullCurriculumResultPerOperation() throws Exception {
        context = LearningPlanCompletionContext.automatic("base", "generation",
                context.canonicalGoals(), context.level2TargetGoalIds());
        addPlan("math-other", List.of("a", "consumer"), List.of("a", "consumer"));
        addPlan("physics", List.of("physics"), List.of("physics"));
        when(learners.getLearningPlanCompletionContext(eq(ID), any())).thenReturn(context);
        var result = service.getPlans(ID, DATE, "de");
        assertThat(result.plans()).hasSize(3);
        var math = result.status().subjects().stream().filter(s -> "mathematik".equals(s.subjectKey())).findFirst().orElseThrow();
        var physics = result.status().subjects().stream().filter(s -> "physik".equals(s.subjectKey())).findFirst().orElseThrow();
        assertThat(math.periodGauge().target()).isEqualTo(4); // Shared a is counted once across the two plans.
        assertThat(math.balance().rohsaldo()).isZero();
        assertThat(math.planCreditText()).contains("4 Ziele", "3 implizit erledigt");
        assertThat(physics.periodGauge().target()).isEqualTo(1);
        assertThat(physics.balance().rohsaldo()).isZero();
        assertThat(physics.planCreditText()).contains("1 Ziel", "1 implizit erledigt");
        verify(learners, times(1)).getMastery(ID);
        verify(learners, times(1)).getLearningPlanCompletionContext(eq(ID), any());
        verify(learners, times(1)).resolveLearningPlanCompletionMastery(eq(ID), any(), eq(context.level2TargetGoalIds()));
        assertThat(mastery).containsExactly(Map.entry("q", 1.0));
        assertThat(completions).containsOnlyKeys("q");
    }

    @Test void explicitOnlyRetainsItsCountButDoesNotNavigateWhenCoverageIsUnavailable() {
        learner.setLearningPlanCountOnlyExplicitGoals(true);
        learner.setFollowLearningPlans(true);
        when(learners.getLearningPlanCompletionContext(eq(ID), any()))
                .thenThrow(new IllegalStateException("Review unavailable"));
        var status = service.getTodayStatus(ID, "de");
        assertThat(status.subjects().getFirst().evaluable()).isTrue();
        assertThat(status.subjects().getFirst().balance().rohsaldo()).isEqualTo(-2);
        assertThat(status.subjects().getFirst().canContinue()).isFalse();
        assertThat(status.resumeAvailable()).isFalse();
        assertThat(status.noticeText()).contains("Abschlussberechnung", "pausiert");
    }

    @Test void explicitOnlyDisplayDoesNotInventPrerequisiteBlockageForWaivedWork() {
        learner.setLearningPlanCountOnlyExplicitGoals(true);
        when(learners.getPersonalCurriculumSubjectFrontier(ID, "math"))
                .thenReturn(List.of(frontier("a"), frontier("b")));
        var scope = service.getPlan(ID, "math", DATE).learningScope();
        assertThat(scope.achievedGoalCount()).isEqualTo(1);
        verify(learners, never()).describeLearningPlanBlockage(anyString(), any(), anyString());
    }

    @Test void laterExplicitCompletionDoesNotDoubleCountAndRevokedAssessmentReopensRemainingWork() {
        mastery.put("a", 1.0);
        completions.put("a", Instant.parse("2026-10-30T10:00:00Z"));
        assertThat(subject("mathematik").balance().rohsaldo()).isZero();
        assertThat(subject("mathematik").planCreditText()).contains("1 implizit erledigt");
        mastery.remove("q");
        assertThat(subject("mathematik").balance().rohsaldo()).isEqualTo(-2);
        assertThat(subject("mathematik").planCreditText()).isNull();
    }

    private LearnerPlanTodayStatus.SubjectStatus subject(String key) {
        return service.getTodayStatus(ID, "de").subjects().stream()
                .filter(s -> key.equals(s.subjectKey())).findFirst().orElseThrow();
    }

    private void addPlan(String landscape, List<String> captured, List<String> authored) throws Exception {
        var block = new LearnerLearningPlanApi.Block("block-" + landscape, "learning", null, "Plan",
                DATE, DATE, null, captured, authored);
        var plan = new LearnerLearningPlan(); plan.setId(UUID.randomUUID()); plan.setLearner(learner);
        plan.setLandscapeId(landscape); plan.setCurriculumId("base"); plan.setRevision(1);
        plan.setBlocksJson(mapper.writeValueAsString(List.of(block)));
        storedPlans.add(plan);
        when(plans.findByLearner_SkillpilotIdAndLandscapeId(ID, landscape)).thenReturn(Optional.of(plan));
    }

    private static FrontierGoal frontier(String id) {
        return new FrontierGoal(id, id, "Description", "atomic", null, "available", List.of(), List.of(),
                null, null, null, null);
    }
}
