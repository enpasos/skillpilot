package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doCallRealMethod;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LearnerLearningPlanServiceIntegrationTest {

    private static final String LEARNER_ID = "learner-plan-h2";
    private static final String CURRICULUM_ID = "curriculum";
    private static final String LANDSCAPE_ID = "math";
    private static final String PHYSICS_LANDSCAPE_ID = "physics";
    private static final Instant CAPTURED_AT = Instant.parse("2026-09-01T08:00:00Z");
    private static final LocalDate TODAY = LocalDate.parse("2026-09-04");

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private LearnerLearningPlanRepository planRepository;

    private LearnerLearningPlanService service;

    @MockitoBean
    private LearnerService learnerService;

    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
    private final LandscapeService landscapeService = mock(LandscapeService.class);

    @Autowired
    private ObjectMapper objectMapper;

    private Learner learner;

    @BeforeEach
    void setUp() {
        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setLastActivityAt(CAPTURED_AT);
        learner.setFollowLearningPlans(false);
        // Most scenarios below intentionally exercise the explicitly selected day mode.
        learner.setLearningPlanPeriodBasis(com.skillpilot.backend.service.learningplan.PeriodBasis.DAY);
        learnerRepository.saveAndFlush(learner);
        ZoneId zone = ZoneId.of("Europe/Berlin");
        service = new LearnerLearningPlanService(
                planRepository,
                learnerService,
                objectMapper,
                eventPublisher,
                landscapeService,
                Clock.fixed(TODAY.atStartOfDay(zone).toInstant(), zone));
        when(learnerService.getLearner(LEARNER_ID)).thenReturn(learner);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of());
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c"), List.of("atom-a", "atom-b")));
        when(learnerService.getPlanningScope(LEARNER_ID, PHYSICS_LANDSCAPE_ID))
                .thenReturn(scopeFor(
                        PHYSICS_LANDSCAPE_ID,
                        List.of("atom-p", "atom-q"),
                        List.of("atom-p", "atom-q")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(LANDSCAPE_ID), any()))
                .thenAnswer(invocation -> LearnerLearningPlanService.scopeFingerprint(
                        learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID)));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(PHYSICS_LANDSCAPE_ID), any()))
                .thenAnswer(invocation -> LearnerLearningPlanService.scopeFingerprint(
                        learnerService.getPlanningScope(LEARNER_ID, PHYSICS_LANDSCAPE_ID)));
        when(learnerService.orderLearningPlanBlocksByPrerequisites(eq(LEARNER_ID), any()))
                .thenAnswer(invocation -> invocation.getArgument(1));
        doCallRealMethod().when(learnerService).isLearningPlanCompatible(
                eq(LEARNER_ID), any(), any(), any());
        when(landscapeService.getById(LANDSCAPE_ID))
                .thenReturn(landscape(LANDSCAPE_ID, "Mathematik"));
        when(landscapeService.getById(PHYSICS_LANDSCAPE_ID))
                .thenReturn(landscape(PHYSICS_LANDSCAPE_ID, "Physik"));
    }

    @Test
    void missingPeriodPreferenceDefaultsToTheCurrentWeekWithoutChangingAnExplicitDayChoice() {
        learner.setLearningPlanPeriodBasis(null);
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "This week", List.of(
                        learning("monday", "2026-08-31", "2026-08-31", "atom-a"),
                        learning("friday", "2026-09-04", "2026-09-04", "atom-b"))), TODAY);

        var weekly = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(weekly.periodBasis()).isEqualTo(com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);
        assertThat(weekly.periodStart()).isEqualTo(LocalDate.parse("2026-08-31"));
        assertThat(weekly.periodEnd()).isEqualTo(LocalDate.parse("2026-09-06"));
        assertThat(weekly.statusText()).isEqualTo("Mathematik: Wochenziel 0 von 2 · im Plan");

        learner.setLearningPlanPeriodBasis(com.skillpilot.backend.service.learningplan.PeriodBasis.DAY);
        var daily = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(daily.periodBasis()).isEqualTo(com.skillpilot.backend.service.learningplan.PeriodBasis.DAY);
        assertThat(daily.periodStart()).isEqualTo(TODAY);
        assertThat(daily.periodEnd()).isEqualTo(TODAY);
        assertThat(daily.statusText()).isEqualTo("Mathematik: Tagesziel 0 von 1 · 1 Lernziel im Rückstand");
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).blocks()).isEqualTo(plan.blocks());
    }

    @Test
    void explicitPlanEditRetainsPostCreationMasteryInTheCapturedGoalSet() {
        var created = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Original", List.of(
                        learning("original", "2026-09-04", "2026-09-04", "atom-a", "atom-b", "atom-c"))), TODAY);
        assertThat(created.blocks().getFirst().atomicGoalIds()).containsExactly("atom-a", "atom-b");
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0, "atom-c", 1.0));
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c"), List.of("atom-b")));
        var edited = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(created.revision(), "Explicitly rescheduled", List.of(
                        learning("today", "2026-09-04", "2026-09-04", "atom-a", "atom-c"),
                        learning("next-week", "2026-09-07", "2026-09-07", "atom-b"))), TODAY);

        assertThat(edited.revision()).isEqualTo(created.revision() + 1);
        assertThat(edited.blocks().getFirst().atomicGoalIds()).containsExactly("atom-a");
        assertThat(edited.blocks().get(1).atomicGoalIds()).containsExactly("atom-b");
        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).isEqualTo("Mathematik: Tagesziel erreicht · im Plan");
        assertThat(status.subjects().getFirst().balance().erfuelltesPeriodenziel()).isEqualTo(1);
        assertThat(learnerService.getMastery(LEARNER_ID)).containsEntry("atom-a", 1.0).containsEntry("atom-c", 1.0);
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).blocks()).isEqualTo(edited.blocks());
    }

    @Test
    void overlappingGoalsAcrossSubjectPlansCountOnceAtTheirEarliestScheduledDate() {
        String extension = "math-extension";
        when(landscapeService.getById(extension)).thenReturn(landscape(extension, "Mathematik"));
        when(learnerService.getPlanningScope(LEARNER_ID, extension))
                .thenReturn(scopeFor(extension, List.of("atom-a", "atom-b"), List.of("atom-a", "atom-b")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(extension), any())).thenReturn("extension");
        service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Earlier", List.of(
                        learning("earlier", "2026-09-03", "2026-09-03", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, extension,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Repeated and new", List.of(
                        learning("today", "2026-09-04", "2026-09-04", "atom-a", "atom-b"))), TODAY);

        var before = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(before.statusText()).isEqualTo("Mathematik: Tagesziel 0 von 1 · 1 Lernziel im Rückstand");
        assertThat(before.subjects()).singleElement().satisfies(subject ->
                assertThat(subject.landscapeIds()).containsExactly(LANDSCAPE_ID, extension));
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenReturn(Map.of("atom-a", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        var after = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(after.statusText()).isEqualTo("Mathematik: Tagesziel erreicht · 1 Lernziel im Rückstand");
        assertThat(after.subjects().getFirst().balance().erfuelltesPeriodenziel()).isEqualTo(1);
    }

    @Test
    void mondayWeeklyReconcileCanStartFridaysGoalAndBasisChangesKeepThatActiveGoal() {
        var mondayService = serviceAt("2026-08-31T08:00:00Z");
        LocalDate monday = LocalDate.parse("2026-08-31");
        learner.setFollowLearningPlans(true);
        var plan = mondayService.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Friday", List.of(
                        learning("friday", "2026-09-04", "2026-09-04", "atom-a", "atom-b"))), monday);
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.getCoachLearnerState(LEARNER_ID)).thenReturn(state);
        assertThat(mondayService.reconcile(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(monday)).changed())
                .isFalse();
        learner.setLearningPlanPeriodBasis(com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);
        assertThat(mondayService.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Wochenziel 0 von 2 · im Plan");
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "block-focus", "atom-a", true, "LEARNING_PLAN_RECONCILED"))
                .thenAnswer(invocation -> {
                    learner.setActiveGoalId("atom-a");
                    return new LearnerService.LearningPlanTransitionResult(true, state);
                });
        var started = mondayService.reconcile(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(monday));
        assertThat(started.activeGoalId()).isEqualTo("atom-a");
        assertThat(started.changed()).isTrue();
        for (var basis : List.of(com.skillpilot.backend.service.learningplan.PeriodBasis.DAY,
                com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK)) {
            learner.setLearningPlanPeriodBasis(basis);
            mondayService.getTodayStatus(LEARNER_ID, "de");
            assertThat(mondayService.reconcile(LEARNER_ID,
                    new LearnerLearningPlanApi.ReconcileRequest(monday)).changed()).isFalse();
            assertThat(learner.getActiveGoalId()).isEqualTo("atom-a");
            assertThat(mondayService.getPlan(LEARNER_ID, LANDSCAPE_ID, monday).blocks()).isEqualTo(plan.blocks());
            assertThat(learnerService.getMastery(LEARNER_ID)).isEmpty();
        }
        verify(learnerService, times(1)).applyLearningPlanTransition(LEARNER_ID, false, true,
                "block-focus", "atom-a", true, "LEARNING_PLAN_RECONCILED");
    }

    @Test
    void weeklyDraftUsesTheSamePeriodAndTextsAsLiveStatusAcrossTheWeekBoundary() {
        learner.setLearningPlanPeriodBasis(com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Week", List.of(
                        learning("this-week", "2026-09-03", "2026-09-03", "atom-a"),
                        learning("next-week", "2026-09-07", "2026-09-07", "atom-b"))), TODAY);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        when(learnerService.getGoalCompletionsBetween(LEARNER_ID,
                LocalDate.parse("2026-08-31"), LocalDate.parse("2026-09-06")))
                .thenReturn(Map.of("atom-a", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        var preview = service.previewPlans(LEARNER_ID, new LearnerLearningPlanApi.ActivateRequest(
                TODAY, List.of(new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID,
                        plan.revision(), plan.planLabel(), plan.blocks()))), "en-GB");
        var live = service.getPlans(LEARNER_ID, TODAY, "en").status();
        assertThat(live.statusText()).isEqualTo("Mathematics: Weekly target reached · on track");
        assertThat(preview.days().subList(0, 3)).allSatisfy(day -> {
            assertThat(day.status().statusText()).isEqualTo(live.statusText());
            assertThat(day.status().periodEnd()).isEqualTo(LocalDate.parse("2026-09-06"));
            assertThat(day.status().language()).isEqualTo("en");
        });
        assertThat(preview.days().get(3).status().statusText())
                .isEqualTo("Mathematics: Weekly target 0 of 1 · on track");
        assertThat(preview.days().get(3).status().periodStart()).isEqualTo(LocalDate.parse("2026-09-07"));
    }

    @Test
    void mergedSubjectAdvanceWorkPreventsAutomaticExtraWorkFromAnIncompletePartPlan() {
        String extension = "math-extension";
        when(landscapeService.getById(extension)).thenReturn(landscape(extension, "Mathematik"));
        when(learnerService.getPlanningScope(LEARNER_ID, extension))
                .thenReturn(scopeFor(extension, List.of("atom-b"), List.of("atom-b")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(extension), any()))
                .thenReturn("extension");
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(0L, "Due",
                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, extension, new LearnerLearningPlanApi.UpsertRequest(0L, "Ahead",
                List.of(learning("future", "2026-09-07", "2026-09-07", "atom-b"))), TODAY);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-b", 1.0));
        learner.setFollowLearningPlans(true);
        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).isEqualTo("Mathematik: Tagesziel erreicht · im Plan");
        assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(status.resumeAvailable()).isTrue();
        verify(learnerService, never()).applyLearningPlanTransition(any(), anyBoolean(), anyBoolean(), any(), any(), anyBoolean(), any());
    }

    @Test
    void noStoredPlanHasAnHonestNoticeAndIndependentVoluntaryContinuation() {
        learner.setFollowLearningPlans(true);
        when(learnerService.getPersonalCurriculumSubjectIds(LEARNER_ID)).thenReturn(List.of(LANDSCAPE_ID));
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-a")));
        var status = service.getTodayStatus(LEARNER_ID, null);
        assertThat(status.subjects()).isEmpty();
        assertThat(status.statusText()).isEqualTo("Kein Lernplan eingerichtet.");
        assertThat(status.noticeText()).isEqualTo(status.statusText());
        assertThat(status.evaluable()).isFalse();
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.automaticResumeAvailable()).isFalse();
    }

    @Test
    void unidentifiablePlanCannotMakeTheRemainingCollectionAppearFullyEvaluable() {
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(0L, "Math",
                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, PHYSICS_LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(0L, "Physics",
                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-p"))), TODAY);
        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(null);
        var status = service.getPlans(LEARNER_ID, TODAY, "de").status();
        assertThat(status.evaluable()).isFalse();
        assertThat(status.subjects()).singleElement().satisfies(subject -> assertThat(subject.evaluable()).isTrue());
        assertThat(status.statusText()).isEqualTo("Physik: Tagesziel 0 von 1 · im Plan\n1 Fachplan nicht auswertbar.");
        assertThat(status.noticeText()).isEqualTo("1 Fachplan nicht auswertbar.");

        when(landscapeService.getById(LANDSCAPE_ID)).thenReturn(landscape(LANDSCAPE_ID, "Mathematik"));
        var corrupted = planRepository.findByLearner_SkillpilotIdAndLandscapeId(LEARNER_ID, LANDSCAPE_ID).orElseThrow();
        corrupted.setBlocksJson("{broken");
        planRepository.saveAndFlush(corrupted);
        var partial = service.getPlans(LEARNER_ID, TODAY, "de");
        assertThat(partial.plans()).singleElement()
                .satisfies(plan -> assertThat(plan.landscapeId()).isEqualTo(PHYSICS_LANDSCAPE_ID));
        assertThat(partial.status().subjects()).hasSize(2);
        assertThat(partial.status().noticeText()).isEqualTo("1 Fachplan nicht auswertbar (Mathematik).");
    }

    @Test
    void draftPreviewUsesTheSharedStatusWithoutChangingExistingPlansOrLearnerState() {
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-b", "atom-c", "atom-d")));
        List<LearnerLearningPlanApi.Block> mathBlocks = List.of(
                learning("backlog", "2026-09-03", "2026-09-03", "atom-a"),
                learning("today-1", "2026-09-04", "2026-09-04", "atom-b"),
                learning("today-2", "2026-09-04", "2026-09-04", "atom-c", "atom-b"),
                learning("future", "2026-09-07", "2026-09-10", "atom-d"));
        List<LearnerLearningPlanApi.Block> physicsBlocks = List.of(
                learning("backlog", "2026-09-03", "2026-09-03", "atom-p"),
                learning("today", "2026-09-04", "2026-09-04", "atom-q"));
        LearnerLearningPlanApi.PlanDetail math = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Math original", mathBlocks), TODAY);
        LearnerLearningPlanApi.PlanDetail physics = service.upsert(LEARNER_ID, PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Physics original", physicsBlocks), TODAY);
        learner.setActiveGoalId("already-active");
        when(learnerService.getMastery(LEARNER_ID))
                .thenReturn(Map.of("atom-a", 0.5, "atom-b", 0.9, "atom-q", 1.0));
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-c", "atom-d")));
        when(learnerService.getPlanningScope(LEARNER_ID, PHYSICS_LANDSCAPE_ID))
                .thenReturn(scopeFor(PHYSICS_LANDSCAPE_ID,
                        List.of("atom-p", "atom-q"), List.of("atom-p")));
        LearnerLearningPlanApi.ActivateRequest request = new LearnerLearningPlanApi.ActivateRequest(
                TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(PHYSICS_LANDSCAPE_ID,
                                physics.revision(), "Physics draft", physicsBlocks),
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID,
                                math.revision(), "Math draft", mathBlocks)));
        clearInvocations(learnerService, eventPublisher);

        LearnerLearningPlanApi.PreviewResponse preview = service.previewPlans(LEARNER_ID, request);

        assertThat(preview.asOf()).isEqualTo(TODAY);
        assertThat(preview.days()).hasSize(7);
        assertThat(preview.days()).extracting(LearnerLearningPlanApi.PreviewDay::date)
                .containsExactly(TODAY, TODAY.plusDays(1), TODAY.plusDays(2), TODAY.plusDays(3),
                        TODAY.plusDays(4), TODAY.plusDays(5), TODAY.plusDays(6));
        assertThat(preview.days().get(0).status().statusText()).isEqualTo(
                "Mathematik: Tagesziel 0 von 2 · im Plan\nPhysik: Tagesziel 0 von 1 · im Plan");
        // Weekends remain visible; the same formula moves unfulfilled daily work to backlog.
        assertThat(preview.days().get(1).status().statusText()).isEqualTo(
                "Mathematik: Heute kein Tagesziel · 2 Lernziele im Rückstand\n"
                        + "Physik: Heute kein Tagesziel · 1 Lernziel im Rückstand");
        assertThat(preview.days().get(2).status().statusText())
                .isEqualTo(preview.days().get(1).status().statusText());
        assertThat(preview.days().get(3).status().statusText())
                .isEqualTo(preview.days().get(1).status().statusText());
        assertThat(preview.days().get(4).status().statusText()).isEqualTo(
                "Mathematik: Tagesziel 0 von 1 · 2 Lernziele im Rückstand\n"
                        + "Physik: Heute kein Tagesziel · 1 Lernziel im Rückstand");
        assertThat(learner.getFollowLearningPlans()).isFalse();
        assertThat(learner.getActiveGoalId()).isEqualTo("already-active");
        assertThat(learner.getLastActivityAt()).isEqualTo(CAPTURED_AT);
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).planLabel()).isEqualTo("Math original");
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).revision()).isEqualTo(math.revision());
        assertThat(service.getPlan(LEARNER_ID, PHYSICS_LANDSCAPE_ID, TODAY).planLabel())
                .isEqualTo("Physics original");
        verify(learnerService, org.mockito.Mockito.atLeastOnce()).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(eventPublisher, never()).publishEvent(any());

        when(learnerService.applyLearningPlanTransition(LEARNER_ID, true, true,
                null, null, false, "LEARNING_PLAN_PACKAGE_ACTIVATED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true,
                        mock(UnifiedLearnerStateResponse.class)));
        LearnerLearningPlanApi.ActivateResponse activated = service.activatePlans(LEARNER_ID, request);
        assertThat(activated.plans()).hasSize(2);
        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo(preview.days().get(0).status().statusText());
    }

    @Test
    void futurePreviewUsesDailyQuotaWithoutInventingFutureCompletions() {
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-b", 1.0));
        var preview = service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID, 0L, "Math", List.of(
                                learning("backlog", "2026-09-03", "2026-09-03", "atom-a"),
                                learning("monday", "2026-09-07", "2026-09-07", "atom-b"))))));

        // Even if Monday's originally assigned ID is already mastered, the quota
        // can be fulfilled with the still-open backlog. No future event is invented.
        assertThat(preview.days().get(3).status().statusText())
                .isEqualTo("Mathematik: Tagesziel 0 von 1 · im Plan");
    }

    @Test
    void newDraftPreviewDoesNotCreateStoredPlans() {
        LearnerLearningPlanApi.PreviewResponse preview = service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID, 0L, "Draft",
                                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))),
                        new LearnerLearningPlanApi.ActivationPlan(PHYSICS_LANDSCAPE_ID, 0L, "Draft",
                                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-p"))))));

        assertThat(preview.days().get(0).status().subjects()).hasSize(2);
        assertThat(preview.days().get(0).status().subjects()).allSatisfy(subject ->
                assertThat(subject.periodText()).isEqualTo("Tagesziel 0 von 1"));
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID)).isEmpty();
        assertThat(learner.getFollowLearningPlans()).isFalse();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLastActivityAt()).isEqualTo(CAPTURED_AT);
        verify(learnerService, org.mockito.Mockito.atLeastOnce()).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void compatibleLegacyPlanSurvivesScopeAdditionsWithoutReadOrPreviewRewritingStoredState() {
        var created = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Original plan", List.of(
                        learning("block", "2026-09-01", "2026-09-04", "atom-a", "atom-b"))), TODAY);
        String legacyFingerprint = useLegacyFingerprint(created.planId());
        var stored = planRepository.findById(created.planId()).orElseThrow();
        String originalBlocks = stored.getBlocksJson();
        Instant originalCapturedAt = stored.getCapturedAt();
        Instant originalUpdatedAt = stored.getUpdatedAt();
        Instant originalCreatedAt = stored.getCreatedAt();
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-b", "atom-c", "atom-d")));
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        clearInvocations(learnerService, eventPublisher);

        var detail = service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.blocks()).isEqualTo(created.blocks());
        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Heute kein Tagesziel · 1 Lernziel im Rückstand");
        assertThat(service.getPlans(LEARNER_ID, TODAY).plans()).singleElement()
                .satisfies(summary -> assertThat(summary.stale()).isFalse());
        assertThat(service.getTodayStatus(LEARNER_ID, "de").unavailablePlanCount()).isZero();
        var preview = service.previewPlans(LEARNER_ID, new LearnerLearningPlanApi.ActivateRequest(
                TODAY, List.of(new LearnerLearningPlanApi.ActivationPlan(
                        LANDSCAPE_ID, created.revision(), created.planLabel(), created.blocks()))));
        assertThat(preview.days().get(0).status().statusText())
                .isEqualTo(service.getTodayStatus(LEARNER_ID, "de").statusText());

        planRepository.flush();
        var afterReads = planRepository.findById(created.planId()).orElseThrow();
        assertThat(afterReads.getScopeFingerprint()).isEqualTo(legacyFingerprint);
        assertThat(afterReads.getRevision()).isEqualTo(created.revision());
        assertThat(afterReads.getBlocksJson()).isEqualTo(originalBlocks);
        assertThat(afterReads.getCapturedAt()).isEqualTo(originalCapturedAt);
        assertThat(afterReads.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(afterReads.getUpdatedAt()).isEqualTo(originalUpdatedAt);
        assertThat(afterReads.getCurriculumId()).isEqualTo(CURRICULUM_ID);
        assertThat(afterReads.getLandscapeId()).isEqualTo(LANDSCAPE_ID);
        assertThat(afterReads.getPlanLabel()).isEqualTo("Original plan");
        assertThat(learner.getFollowLearningPlans()).isFalse();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLastActivityAt()).isEqualTo(CAPTURED_AT);
        verify(learnerService, org.mockito.Mockito.atLeastOnce()).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(learnerService, never()).setPlannedGoalsAndGetState(any(), any());
        verify(learnerService, never()).setActiveGoal(any(), any());
        verify(learnerService, never()).applyLearningPlanTransition(
                any(), any(Boolean.class), any(Boolean.class), any(), any(), any(Boolean.class), any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void removedPlannedAtomFailsClosedForStatusContinueSwitchAndReconcileWithoutPlanRewrite() {
        var created = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Original plan", List.of(
                        learning("block", "2026-09-01", "2026-09-04", "atom-a", "atom-b"))), TODAY);
        String legacyFingerprint = useLegacyFingerprint(created.planId());
        String originalBlocks = planRepository.findById(created.planId()).orElseThrow().getBlocksJson();
        learner.setFollowLearningPlans(true);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-c"), List.of("atom-a", "atom-c")));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        clearInvocations(learnerService, eventPublisher);

        assertStoredPlanCannotDriveLearning(created);

        var unchanged = planRepository.findById(created.planId()).orElseThrow();
        assertThat(unchanged.getScopeFingerprint()).isEqualTo(legacyFingerprint);
        assertThat(unchanged.getBlocksJson()).isEqualTo(originalBlocks);
        assertThat(unchanged.getRevision()).isEqualTo(created.revision());
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getFollowLearningPlans()).isTrue();
        assertThat(learner.getLastActivityAt()).isEqualTo(CAPTURED_AT);
    }

    @Test
    void currentPrerequisiteReorderOrInvalidFocusDoesNotSilentlyRepairAStoredPlan() {
        var created = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Original plan", List.of(
                        learning("block", "2026-09-01", "2026-09-04", "atom-a", "atom-b"))), TODAY);
        String originalBlocks = planRepository.findById(created.planId()).orElseThrow().getBlocksJson();
        learner.setFollowLearningPlans(true);
        when(learnerService.orderLearningPlanBlocksByPrerequisites(eq(LEARNER_ID), any()))
                .thenReturn(List.of(learning("block", "2026-09-01", "2026-09-04", "atom-b", "atom-a")));
        clearInvocations(learnerService, eventPublisher);

        assertStoredPlanCannotDriveLearning(created);
        when(learnerService.orderLearningPlanBlocksByPrerequisites(eq(LEARNER_ID), any()))
                .thenAnswer(invocation -> invocation.getArgument(1));
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Focus is outside the subject target"))
                .when(learnerService).validateLearningPlanBlockFoci(eq(LEARNER_ID), eq(LANDSCAPE_ID), any());
        assertStoredPlanCannotDriveLearning(created);
        assertThat(planRepository.findById(created.planId()).orElseThrow().getBlocksJson())
                .isEqualTo(originalBlocks);
        assertThat(planRepository.findById(created.planId()).orElseThrow().getRevision())
                .isEqualTo(created.revision());
    }

    @Test
    void draftPreviewFailsClosedOnStaleRevisionHiddenSubjectOrUnavailableScope() {
        List<LearnerLearningPlanApi.Block> blocks =
                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"));
        service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Original", blocks), TODAY);
        clearInvocations(learnerService, eventPublisher);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID, 0L, "Stale", blocks)))),
                HttpStatus.CONFLICT);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(PHYSICS_LANDSCAPE_ID, 0L, "Hidden math",
                                List.of(learning("today", "2026-09-04", "2026-09-04", "atom-p")))))),
                HttpStatus.CONFLICT);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Scope unavailable"));
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID, 1L, "Unavailable", blocks)))),
                HttpStatus.CONFLICT);
        assertThat(planRepository.findByLearner_SkillpilotIdAndLandscapeId(LEARNER_ID, LANDSCAPE_ID))
                .get().satisfies(plan -> {
                    assertThat(plan.getRevision()).isEqualTo(1);
                    assertThat(plan.getPlanLabel()).isEqualTo("Original");
                });
        verify(learnerService, org.mockito.Mockito.atLeastOnce()).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void draftPreviewRejectsInvalidDatesDuplicateSubjectsAndUnboundedRequests() {
        LearnerLearningPlanApi.ActivationPlan plan = new LearnerLearningPlanApi.ActivationPlan(
                LANDSCAPE_ID, 0L, "Draft", List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a")));
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY.minusDays(1), List.of(plan))),
                HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY.plusDays(1), List.of(plan))),
                HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(plan, plan))),
                HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, java.util.Collections.nCopies(51, plan))),
                HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of())), HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.previewPlans(LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                        new LearnerLearningPlanApi.ActivationPlan(LANDSCAPE_ID, 0L, "Empty", List.of())))),
                HttpStatus.BAD_REQUEST);
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID)).isEmpty();
        verify(learnerService, org.mockito.Mockito.atLeastOnce()).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void createMaterializesOnlyOpenAtomsAndDeduplicatesInChronologicalBlockOrder() {
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Mein Plan",
                        List.of(
                                learning("late", "2026-09-08", "2026-09-11", "atom-b", "atom-a"),
                                learning("early", "2026-09-01", "2026-09-04", "atom-a", "atom-c"),
                                milestone("exam", "2026-09-14"))),
                TODAY);

        assertThat(created.revision()).isEqualTo(1);
        assertThat(created.planLabel()).isEqualTo("Mein Plan");
        assertThat(created.blocks()).extracting(LearnerLearningPlanApi.Block::id)
                .containsExactly("early", "late", "exam");
        assertThat(created.blocks().get(0).atomicGoalIds()).containsExactly("atom-a");
        assertThat(created.blocks().get(1).atomicGoalIds()).containsExactly("atom-b");
        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Heute kein Tagesziel · 1 Lernziel im Rückstand");
        assertThat(created.continueReason()).isEqualTo("learning-plan-following-disabled");
        assertThat(created.period().startDate()).isEqualTo(LocalDate.parse("2026-09-01"));
        assertThat(created.period().endDate()).isEqualTo(LocalDate.parse("2026-09-14"));
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .singleElement()
                .satisfies(plan -> {
                    assertThat(plan.getRevision()).isEqualTo(1);
                    assertThat(plan.getBlocksJson()).contains("atom-a", "atom-b").doesNotContain("atom-c");
                });
        verify(eventPublisher).publishEvent(any(LearnerStateChangedEvent.class));
    }

    @Test
    void summarySeparatesGoalsNewlyDueTodayAndPreviewsTheNextEligibleAtom() {
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(
                        List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-b", "atom-c", "atom-d")));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-d")));

        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Wochenplan",
                        List.of(learning(
                                "block",
                                "2026-09-01",
                                "2026-09-04",
                                "atom-a",
                                "atom-b",
                                "atom-c",
                                "atom-d"))),
                TODAY);

        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Tagesziel 0 von 1 · 3 Lernziele im Rückstand");
        assertThat(created.nextEligibleGoal()).isEqualTo(
                new LearnerLearningPlanApi.NextEligibleGoal("atom-d"));
        assertThat(created.canContinue()).isTrue();
    }

    @Test
    void dueCountsRoundTheCumulativeEquivalentAcrossLearningBlocks() {
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Parallel plan",
                        List.of(
                                learning("first", "2026-09-01", "2026-09-04", "atom-a"),
                                learning("second", "2026-09-01", "2026-09-04", "atom-b"))),
                LocalDate.parse("2026-09-01"));

        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                created.blocks(), LocalDate.parse("2026-09-01"))).hasSize(1);
    }

    @Test
    void sameStartBlocksUseEndDateBeforeAuthoredOrderForConcreteDueAtoms() {
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(
                        List.of("atom-a", "atom-b", "atom-c"),
                        List.of("atom-a", "atom-b", "atom-c")));
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-c")));

        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Parallel plan",
                        List.of(
                                learning(
                                        "long-authored-first",
                                        "2026-09-01",
                                        "2026-09-14",
                                        "atom-a",
                                        "atom-b"),
                                learning(
                                        "short-authored-second",
                                        "2026-09-01",
                                        "2026-09-07",
                                        "atom-c"))),
                LocalDate.parse("2026-09-02"));

        assertThat(created.blocks()).extracting(LearnerLearningPlanApi.Block::id)
                .containsExactly("short-authored-second", "long-authored-first");
        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                created.blocks(), LocalDate.parse("2026-09-02"))).containsExactly("atom-c");
        assertThat(created.nextEligibleGoal()).isEqualTo(
                new LearnerLearningPlanApi.NextEligibleGoal("atom-c"));
    }

    @Test
    void unknownAtomAndStaleRevisionFailClosedWithoutChangingTheStoredPlan() {
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        null,
                        List.of(learning("block", "2026-09-01", "2026-09-04", "atom-a"))),
                LocalDate.parse("2026-09-01"));

        assertStatus(
                () -> service.upsert(
                        LEARNER_ID,
                        LANDSCAPE_ID,
                        new LearnerLearningPlanApi.UpsertRequest(
                                created.revision(),
                                null,
                                List.of(learning("bad", "2026-09-01", "2026-09-04", "unknown"))),
                        LocalDate.parse("2026-09-01")),
                HttpStatus.BAD_REQUEST);
        assertStatus(
                () -> service.upsert(
                        LEARNER_ID,
                        LANDSCAPE_ID,
                        new LearnerLearningPlanApi.UpsertRequest(
                                0L,
                                null,
                                List.of(learning("block", "2026-09-01", "2026-09-04", "atom-a"))),
                        LocalDate.parse("2026-09-01")),
                HttpStatus.CONFLICT);

        assertThat(planRepository.findByLearner_SkillpilotIdAndLandscapeId(LEARNER_ID, LANDSCAPE_ID))
                .get()
                .extracting(plan -> plan.getRevision())
                .isEqualTo(1L);
    }

    @Test
    void multiSubjectActivationPublishesAtomicallyAndSelectsTheOldestDueEligibleGoal() {
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("math-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(
                        LEARNER_ID,
                        true,
                        true,
                        "physics-focus",
                        "atom-p",
                        false,
                        "LEARNING_PLAN_PACKAGE_ACTIVATED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        LearnerLearningPlanApi.ActivateResponse response = service.activatePlans(
                LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(
                        TODAY,
                        List.of(
                                new LearnerLearningPlanApi.ActivationPlan(
                                        LANDSCAPE_ID,
                                        0L,
                                        "Mathematik",
                                        List.of(learningWithFocus(
                                                "math-block",
                                                "math-focus",
                                                "2026-09-01",
                                                "2026-09-04",
                                                "atom-a"),
                                                learningWithFocus("math-today", "math-focus",
                                                        "2026-09-04", "2026-09-04", "atom-b"))),
                                new LearnerLearningPlanApi.ActivationPlan(
                                        PHYSICS_LANDSCAPE_ID,
                                        0L,
                                        "Physik",
                                        List.of(learningWithFocus(
                                                "physics-block",
                                                "physics-focus",
                                                "2026-08-20",
                                                "2026-09-04",
                                                "atom-p"),
                                                learningWithFocus("physics-today", "physics-focus",
                                                        "2026-09-04", "2026-09-04", "atom-q"))))));

        assertThat(response.followLearningPlans()).isTrue();
        assertThat(response.selectedLandscapeId()).isEqualTo(PHYSICS_LANDSCAPE_ID);
        assertThat(response.focusGoalId()).isEqualTo("physics-focus");
        assertThat(response.activeGoalId()).isEqualTo("atom-p");
        assertThat(response.state()).isSameAs(state);
        assertThat(response.plans())
                .extracting(LearnerLearningPlanApi.PlanDetail::landscapeId)
                .containsExactly(LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID);
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .extracting(plan -> plan.getLandscapeId())
                .containsExactly(LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID);
        verify(learnerService).applyLearningPlanTransition(
                LEARNER_ID,
                true,
                true,
                "physics-focus",
                "atom-p",
                false,
                "LEARNING_PLAN_PACKAGE_ACTIVATED");
        verify(eventPublisher, times(1)).publishEvent(any(LearnerStateChangedEvent.class));
    }

    @Test
    void activationClassifiesPrerequisiteScheduleConflictWithoutPublishingAPlan() {
        when(learnerService.orderLearningPlanBlocksByPrerequisites(eq(LEARNER_ID), any()))
                .thenThrow(new LearningPlanPrerequisiteScheduleConflictException());

        assertThatThrownBy(() -> service.activatePlans(
                        LEARNER_ID,
                        new LearnerLearningPlanApi.ActivateRequest(
                                TODAY,
                                List.of(new LearnerLearningPlanApi.ActivationPlan(
                                        PHYSICS_LANDSCAPE_ID,
                                        0L,
                                        "Physik",
                                        List.of(learningWithFocus(
                                                "physics-block",
                                                "physics-focus",
                                                "2026-09-01",
                                                "2026-09-10",
                                                "atom-p",
                                                "atom-q")))))))
                .isInstanceOfSatisfying(
                        LearningPlanPrerequisiteScheduleConflictException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.BAD_REQUEST));

        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .isEmpty();
        verify(learnerService, never()).applyLearningPlanTransition(
                eq(LEARNER_ID),
                eq(true),
                eq(true),
                any(),
                any(),
                eq(false),
                eq("LEARNING_PLAN_PACKAGE_ACTIVATED"));
    }

    @Test
    void activationReconcilesThePlanFocusEvenWhenTheActiveAtomIsPreserved() {
        learner.setActiveGoalId("atom-p");
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(
                        LEARNER_ID,
                        true,
                        true,
                        "physics-focus",
                        "atom-p",
                        false,
                        "LEARNING_PLAN_PACKAGE_ACTIVATED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        LearnerLearningPlanApi.ActivateResponse response = service.activatePlans(
                LEARNER_ID,
                new LearnerLearningPlanApi.ActivateRequest(
                        TODAY,
                        List.of(new LearnerLearningPlanApi.ActivationPlan(
                                PHYSICS_LANDSCAPE_ID,
                                0L,
                                "Physik",
                                List.of(learningWithFocus(
                                        "physics-block",
                                        "physics-focus",
                                        "2026-09-01",
                                        "2026-09-04",
                                        "atom-p"))))));

        assertThat(response.activeGoalId()).isEqualTo("atom-p");
        assertThat(response.focusGoalId()).isEqualTo("physics-focus");
        assertThat(response.state()).isSameAs(state);
        verify(learnerService).applyLearningPlanTransition(
                LEARNER_ID,
                true,
                true,
                "physics-focus",
                "atom-p",
                false,
                "LEARNING_PLAN_PACKAGE_ACTIVATED");
    }

    @Test
    void invalidSecondSubjectLeavesExistingPlanAndLearnerStateUntouched() {
        LearnerLearningPlanApi.PlanDetail existing = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Vorher",
                        List.of(learning("math-block", "2026-09-01", "2026-09-04", "atom-a"))),
                TODAY);
        clearInvocations(learnerService, eventPublisher);

        assertStatus(
                () -> service.activatePlans(
                        LEARNER_ID,
                        new LearnerLearningPlanApi.ActivateRequest(
                                TODAY,
                                List.of(
                                        new LearnerLearningPlanApi.ActivationPlan(
                                                LANDSCAPE_ID,
                                                existing.revision(),
                                                "Darf nicht gespeichert werden",
                                                List.of(learning(
                                                        "math-block",
                                                        "2026-09-01",
                                                        "2026-09-04",
                                                        "atom-b"))),
                                        new LearnerLearningPlanApi.ActivationPlan(
                                                PHYSICS_LANDSCAPE_ID,
                                                0L,
                                                "Ungültig",
                                                List.of(learningWithFocus(
                                                        "physics-block",
                                                        "physics-focus",
                                                        "2026-09-01",
                                                        "2026-09-04",
                                                        "unknown-physics-atom")))))),
                HttpStatus.BAD_REQUEST);

        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .singleElement()
                .satisfies(plan -> {
                    assertThat(plan.getLandscapeId()).isEqualTo(LANDSCAPE_ID);
                    assertThat(plan.getRevision()).isEqualTo(1);
                    assertThat(plan.getPlanLabel()).isEqualTo("Vorher");
                    assertThat(plan.getBlocksJson()).contains("atom-a").doesNotContain("atom-b");
                });
        verify(learnerService, never()).applyLearningPlanTransition(
                any(),
                any(Boolean.class),
                any(Boolean.class),
                any(),
                any(),
                any(Boolean.class),
                any());
        verify(eventPublisher, never()).publishEvent(any());
        assertThat(learner.getFollowLearningPlans()).isFalse();
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test
    void activationRejectsAnOmittedCurrentStoredPlanBeforeAnyMutation() {
        var created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Mathematik",
                        List.of(learning("math-block", "2026-09-01", "2026-09-04", "atom-a"))),
                TODAY);
        String legacyFingerprint = useLegacyFingerprint(created.planId());
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-b", "atom-d")));
        clearInvocations(learnerService, eventPublisher);

        assertStatus(
                () -> service.activatePlans(
                        LEARNER_ID,
                        new LearnerLearningPlanApi.ActivateRequest(
                                TODAY,
                                List.of(new LearnerLearningPlanApi.ActivationPlan(
                                        PHYSICS_LANDSCAPE_ID,
                                        0L,
                                        "Physik",
                                        List.of(learningWithFocus(
                                                "physics-block",
                                                "physics-focus",
                                                "2026-09-01",
                                                "2026-09-04",
                                                "atom-p")))))),
                HttpStatus.CONFLICT);

        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .singleElement()
                .satisfies(plan -> {
                    assertThat(plan.getLandscapeId()).isEqualTo(LANDSCAPE_ID);
                    assertThat(plan.getRevision()).isEqualTo(1);
                    assertThat(plan.getPlanLabel()).isEqualTo("Mathematik");
                    assertThat(plan.getScopeFingerprint()).isEqualTo(legacyFingerprint);
                });
        verify(learnerService, never()).applyLearningPlanTransition(
                any(),
                any(Boolean.class),
                any(Boolean.class),
                any(),
                any(),
                any(Boolean.class),
                any());
        verify(eventPublisher, never()).publishEvent(any());
        assertThat(learner.getFollowLearningPlans()).isFalse();
    }

    @Test
    void blockTitlesAcceptFiveHundredCharactersAndRejectFiveHundredOne() {
        String acceptedTitle = "x".repeat(500);
        LearnerLearningPlanApi.Block accepted = new LearnerLearningPlanApi.Block(
                "section",
                "learning",
                "block-focus",
                acceptedTitle,
                LocalDate.parse("2026-09-01"),
                LocalDate.parse("2026-09-04"),
                null,
                List.of("atom-a"));
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, null, List.of(accepted)),
                TODAY);
        assertThat(created.blocks().get(0).title()).hasSize(500);

        LearnerLearningPlanApi.Block tooLong = new LearnerLearningPlanApi.Block(
                accepted.id(),
                accepted.kind(),
                accepted.goalId(),
                "x".repeat(501),
                accepted.startDate(),
                accepted.endDate(),
                null,
                accepted.atomicGoalIds());
        assertStatus(
                () -> service.upsert(
                        LEARNER_ID,
                        LANDSCAPE_ID,
                        new LearnerLearningPlanApi.UpsertRequest(
                                created.revision(),
                                null,
                                List.of(tooLong)),
                        TODAY),
                HttpStatus.BAD_REQUEST);
        assertThat(planRepository.findByLearner_SkillpilotIdAndLandscapeId(
                        LEARNER_ID,
                        LANDSCAPE_ID))
                .get()
                .extracting(plan -> plan.getRevision())
                .isEqualTo(1L);
    }

    @Test
    void pathologicallyLargeDateSpansAreRejectedBeforeAnyWorkdayExpansion() {
        assertStatus(
                () -> service.upsert(
                        LEARNER_ID,
                        LANDSCAPE_ID,
                        new LearnerLearningPlanApi.UpsertRequest(
                                0L,
                                null,
                                List.of(new LearnerLearningPlanApi.Block(
                                        "centuries",
                                        "learning",
                                        "block-focus",
                                        null,
                                        LocalDate.of(1900, 1, 1),
                                        LocalDate.of(2101, 1, 1),
                                        null,
                                        List.of("atom-a")))),
                        TODAY),
                HttpStatus.BAD_REQUEST);
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .isEmpty();
    }

    @Test
    void everyPlanDateMustRemainInTheFourDigitFrontendContract() {
        List<LearnerLearningPlanApi.Block> invalidBlocks = List.of(
                new LearnerLearningPlanApi.Block(
                        "future-learning",
                        "learning",
                        "block-focus",
                        null,
                        LocalDate.of(10_000, 1, 1),
                        LocalDate.of(10_001, 1, 1),
                        null,
                        List.of("atom-a")),
                new LearnerLearningPlanApi.Block(
                        "ancient-milestone",
                        "milestone",
                        null,
                        "Prüfung",
                        null,
                        null,
                        LocalDate.of(-1, 1, 1),
                        null));

        for (LearnerLearningPlanApi.Block invalidBlock : invalidBlocks) {
            assertStatus(
                    () -> service.upsert(
                            LEARNER_ID,
                            LANDSCAPE_ID,
                            new LearnerLearningPlanApi.UpsertRequest(
                                    0L,
                                    null,
                                    List.of(invalidBlock)),
                            TODAY),
                    HttpStatus.BAD_REQUEST);
        }
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID))
                .isEmpty();
    }

    @Test
    void continueRequiresOptInCurrentCompatibilityRevisionAndFrontierEligibility() {
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        null,
                        List.of(learning("block", "2026-09-01", "2026-09-04", "atom-a", "atom-b"))),
                TODAY);
        String legacyFingerprint = useLegacyFingerprint(created.planId());
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-b", "atom-d")));

        LearnerLearningPlanApi.ContinueRequest request = new LearnerLearningPlanApi.ContinueRequest(
                created.revision(),
                TODAY);
        assertStatus(() -> service.continuePlan(LEARNER_ID, created.planId(), request), HttpStatus.CONFLICT);

        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        assertStatus(
                () -> service.continuePlan(
                        LEARNER_ID,
                        created.planId(),
                        new LearnerLearningPlanApi.ContinueRequest(
                                created.revision(),
                                TODAY.plusDays(1))),
                HttpStatus.BAD_REQUEST);
        assertStatus(() -> service.continuePlan(LEARNER_ID, created.planId(), request), HttpStatus.CONFLICT);

        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-b")));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.getLearnerState(LEARNER_ID)).thenReturn(state);

        LearnerLearningPlanApi.ContinueResponse response = service.continuePlan(
                LEARNER_ID,
                created.planId(),
                request);

        assertThat(response.focusGoalId()).isEqualTo("block-focus");
        assertThat(response.activeGoalId()).isEqualTo("atom-b");
        assertThat(response.state()).isSameAs(state);
        verify(learnerService).setPlannedGoalsAndGetState(LEARNER_ID, Set.of("block-focus"));
        verify(learnerService).setActiveGoal(LEARNER_ID, "atom-b");
        assertThat(planRepository.findById(created.planId()).orElseThrow().getScopeFingerprint())
                .isEqualTo(legacyFingerprint);

        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-c", "atom-d"), List.of("atom-d")));
        assertStatus(() -> service.continuePlan(LEARNER_ID, created.planId(), request), HttpStatus.CONFLICT);
    }

    @Test
    void explicitSubjectSwitchParksAnotherGoalAndStillReconcilesFocusForTheSameAtom() {
        learner.setFollowLearningPlans(true);
        learner.setActiveGoalId("atom-a");
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(
                        LEARNER_ID,
                        false,
                        true,
                        "physics-focus",
                        "atom-p",
                        true,
                        "LEARNING_PLAN_SUBJECT_SWITCH"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));
        LearnerLearningPlanApi.PlanDetail physics = service.upsert(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Physik",
                        List.of(learningWithFocus(
                                "physics-block",
                                "physics-focus",
                                "2026-09-01",
                                "2026-09-04",
                                "atom-p"))),
                TODAY);
        String legacyFingerprint = useLegacyFingerprint(physics.planId());

        LearnerLearningPlanApi.TransitionResponse response = service.switchPlan(
                LEARNER_ID,
                physics.planId(),
                new LearnerLearningPlanApi.ContinueRequest(physics.revision(), TODAY));

        assertThat(response.changed()).isTrue();
        assertThat(response.landscapeId()).isEqualTo(PHYSICS_LANDSCAPE_ID);
        assertThat(response.activeGoalId()).isEqualTo("atom-p");
        assertThat(response.state()).isSameAs(state);
        verify(learnerService).applyLearningPlanTransition(
                LEARNER_ID,
                false,
                true,
                "physics-focus",
                "atom-p",
                true,
                "LEARNING_PLAN_SUBJECT_SWITCH");

        learner.setActiveGoalId("atom-p");
        LearnerLearningPlanApi.TransitionResponse samePointer = service.switchPlan(
                LEARNER_ID,
                physics.planId(),
                new LearnerLearningPlanApi.ContinueRequest(physics.revision(), TODAY));
        assertThat(samePointer.changed()).isTrue();
        assertThat(planRepository.findById(physics.planId()).orElseThrow().getScopeFingerprint())
                .isEqualTo(legacyFingerprint);
        verify(learnerService, times(2)).applyLearningPlanTransition(
                LEARNER_ID,
                false,
                true,
                "physics-focus",
                "atom-p",
                true,
                "LEARNING_PLAN_SUBJECT_SWITCH");
    }

    @Test
    void reconcileSelectsOnceAndThenNoOpsWhileAnIncompleteGoalIsActive() {
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(
                        LEARNER_ID,
                        List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        UnifiedLearnerStateResponse selectedState = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(
                        LEARNER_ID,
                        false,
                        true,
                        "physics-focus",
                        "atom-p",
                        true,
                        "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, selectedState));
        var created = service.upsert(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Physik",
                        List.of(learningWithFocus(
                                "physics-block",
                                "physics-focus",
                                "2026-08-20",
                                "2026-09-04",
                                "atom-p"),
                                learningWithFocus("physics-today", "physics-focus",
                                        "2026-09-04", "2026-09-04", "atom-q"))),
                TODAY);
        String legacyFingerprint = useLegacyFingerprint(created.planId());

        LearnerLearningPlanApi.TransitionResponse selected = service.reconcile(
                LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(selected.changed()).isTrue();
        assertThat(selected.activeGoalId()).isEqualTo("atom-p");
        assertThat(planRepository.findById(created.planId()).orElseThrow().getScopeFingerprint())
                .isEqualTo(legacyFingerprint);

        learner.setActiveGoalId("atom-p");
        UnifiedLearnerStateResponse noOpState = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.getCoachLearnerState(LEARNER_ID)).thenReturn(noOpState);
        LearnerLearningPlanApi.TransitionResponse noOp = service.reconcile(
                LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY));

        assertThat(noOp.changed()).isFalse();
        assertThat(noOp.planId()).isNull();
        assertThat(noOp.landscapeId()).isNull();
        assertThat(noOp.focusGoalId()).isNull();
        assertThat(noOp.activeGoalId()).isNull();
        assertThat(noOp.state()).isSameAs(noOpState);
        verify(learnerService, times(1)).applyLearningPlanTransition(
                LEARNER_ID,
                false,
                true,
                "physics-focus",
                "atom-p",
                true,
                "LEARNING_PLAN_RECONCILED");
    }

    @Test
    void explicitContinuationPrioritizesOlderOpenGoalsAcrossSubjectsEvenWhenTheirQuotaIsCovered() {
        service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learningWithFocus("math-yesterday", "math-focus", "2026-09-03", "2026-09-03", "atom-a"),
                        learningWithFocus("math-today", "math-focus", "2026-09-04", "2026-09-04", "atom-b"))), TODAY);
        service.upsert(LEARNER_ID, PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Physik", List.of(
                        learningWithFocus("physics-today", "physics-focus", "2026-09-04", "2026-09-04", "atom-p"))), TODAY);
        learner.setFollowLearningPlans(true);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-b", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenReturn(Map.of("atom-b", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("math-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "math-focus", "atom-a", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "physics-focus", "atom-p", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText()).isEqualTo(
                "Mathematik: Tagesziel erreicht · 1 Lernziel im Rückstand\nPhysik: Tagesziel 0 von 1 · im Plan");
        // These independent mocked transitions start from the same unchanged learner snapshot.
        var automatic = service.reconcile(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(automatic.activeGoalId()).isEqualTo("atom-p");
        var explicit = service.resumeExplicitly(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(explicit.activeGoalId()).isEqualTo("atom-a");
        assertThat(explicit.changed()).isTrue();
    }

    @Test
    void completedQuotaStopsAutomaticReconcileButExplicitResumeAllowsExtraWork() {
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-p", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenReturn(Map.of("atom-p", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-q")));
        service.upsert(LEARNER_ID, PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Physik", List.of(
                        learningWithFocus("yesterday", "physics-focus", "2026-09-03", "2026-09-03", "atom-p"),
                        learningWithFocus("today", "physics-focus", "2026-09-04", "2026-09-04", "atom-q"))), TODAY);
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.getCoachLearnerState(LEARNER_ID)).thenReturn(state);

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).contains("Tagesziel erreicht", "1 Lernziel im Rückstand");
        assertThat(status.resumeAvailable()).isTrue();
        var automatic = service.reconcile(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(automatic.changed()).isFalse();
        verify(learnerService, never()).applyLearningPlanTransition(
                any(), anyBoolean(), anyBoolean(), any(), any(), anyBoolean(), any());

        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "physics-focus", "atom-q", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));
        var explicit = service.resumeExplicitly(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(explicit.changed()).isTrue();
        assertThat(explicit.activeGoalId()).isEqualTo("atom-q");
    }

    @Test
    void explicitFurtherLearningStartsFutureGoalsWithoutDailyQuotaOrBacklog() {
        learner.setFollowLearningPlans(true);
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-a")));
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("future", "2026-09-07", "2026-09-10", "atom-a", "atom-b"))), TODAY);
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.getCoachLearnerState(LEARNER_ID)).thenReturn(state);
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-a", "atom-a", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).contains("Heute kein Tagesziel", "im Plan");
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.subjects().getFirst().canContinue()).isTrue();
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).canContinue()).isTrue();
        assertThat(service.reconcile(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();
        var explicit = service.resumeExplicitly(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(explicit.activeGoalId()).isEqualTo("atom-a");
        assertThat(explicit.changed()).isTrue();
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).blocks()).isEqualTo(plan.blocks());
    }

    @Test
    void completedPlanStillOffersUnplannedOpenPersonalTargets() {
        learner.setFollowLearningPlans(true);
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("done", "2026-09-03", "2026-09-03", "atom-a"))), TODAY);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-b")));
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-b", "atom-b", true, "LEARNING_PLAN_SUBJECT_SWITCH"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).contains("im Plan").doesNotContain("Rückstand");
        assertThat(status.resumeAvailable()).isTrue();
        var switched = service.switchPlan(LEARNER_ID, plan.planId(),
                new LearnerLearningPlanApi.ContinueRequest(plan.revision(), TODAY));
        assertThat(switched.activeGoalId()).isEqualTo("atom-b");
        assertThat(switched.changed()).isTrue();
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).revision()).isEqualTo(plan.revision());
    }

    @Test
    void blockedBacklogCanContinueWithAnEligiblePersonalFoundation() {
        learner.setFollowLearningPlans(true);
        service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("backlog", "2026-09-03", "2026-09-03", "atom-b"))), TODAY);
        // The due goal cannot start yet, but its personal foundation can.
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-a")));
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-a", "atom-a", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).contains("1 Lernziel im Rückstand");
        assertThat(status.resumeAvailable()).isTrue();
        var resumed = service.resumeExplicitly(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY));
        assertThat(resumed.activeGoalId()).isEqualTo("atom-a");
        assertThat(resumed.changed()).isTrue();
    }

    @Test
    void personalCurriculumRemainsAvailableWithoutAStoredScheduleUntilCompleted() {
        learner.setFollowLearningPlans(true);
        when(learnerService.getPersonalCurriculumSubjectIds(LEARNER_ID)).thenReturn(List.of(LANDSCAPE_ID));
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-a")));
        var state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-a", "atom-a", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true, state));
        when(learnerService.getCoachLearnerState(LEARNER_ID)).thenReturn(state);

        assertThat(service.getTodayStatus(LEARNER_ID, "de").resumeAvailable()).isTrue();
        assertThat(service.resumeExplicitly(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isEqualTo("atom-a");
        assertThat(planRepository.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER_ID)).isEmpty();

        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID)).thenReturn(List.of());
        assertThat(service.getTodayStatus(LEARNER_ID, "de").resumeAvailable()).isFalse();
        assertThat(service.resumeExplicitly(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();
    }

    @Test
    void explicitFallbackDoesNotAuthorizeAutomaticExtraWhenTodaysQuotaIsBlocked() {
        learner.setFollowLearningPlans(true);
        service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("today-blocked", "2026-09-04", "2026-09-04", "atom-b"))), TODAY);
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-a")));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.statusText()).contains("Tagesziel 0 von 1");
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(service.reconcile(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed()).isFalse();
        verify(learnerService, never()).applyLearningPlanTransition(
                any(), anyBoolean(), anyBoolean(), any(), any(), anyBoolean(), any());
    }

    @Test
    void staleScheduleCannotRevokeCurrentPersonalSubjectContinuation() {
        learner.setFollowLearningPlans(true);
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("old", "2026-09-03", "2026-09-03", "atom-a"))), TODAY);
        var stored = planRepository.findById(plan.planId()).orElseThrow();
        String originalBlocks = stored.getBlocksJson();
        when(learnerService.isLearningPlanCompatible(eq(LEARNER_ID), any(), eq(LANDSCAPE_ID), any()))
                .thenReturn(false);
        when(learnerService.getPersonalCurriculumSubjectIds(LEARNER_ID)).thenReturn(List.of(LANDSCAPE_ID));
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-b")));
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-b", "atom-b", true, "LEARNING_PLAN_SUBJECT_SWITCH"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true,
                        mock(UnifiedLearnerStateResponse.class)));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.unavailablePlanCount()).isEqualTo(1);
        assertThat(status.evaluable()).isFalse();
        assertThat(status.statusText()).contains("nicht auswertbar");
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.automaticResumeAvailable()).isFalse();
        assertThat(service.switchPersonalCurriculumSubject(LEARNER_ID, LANDSCAPE_ID).activeGoalId())
                .isEqualTo("atom-b");
        assertStatus(() -> service.switchPersonalCurriculumSubject(LEARNER_ID, PHYSICS_LANDSCAPE_ID),
                HttpStatus.CONFLICT);
        assertThat(planRepository.findById(plan.planId()).orElseThrow().getBlocksJson()).isEqualTo(originalBlocks);
    }

    @ParameterizedTest
    @ValueSource(strings = {"not-json", "[null]",
            "[{\"kind\":\"learning\",\"atomicGoalIds\":[\"atom-a\"]}]"})
    void corruptScheduleDoesNotBreakStatusOrExplicitPersonalContinuation(String blocksJson) {
        learner.setFollowLearningPlans(true);
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(
                        learning("old", "2026-09-03", "2026-09-03", "atom-a"))), TODAY);
        var stored = planRepository.findById(plan.planId()).orElseThrow();
        stored.setBlocksJson(blocksJson);
        planRepository.saveAndFlush(stored);
        when(learnerService.getPersonalCurriculumSubjectIds(LEARNER_ID)).thenReturn(List.of(LANDSCAPE_ID));
        when(learnerService.getPersonalCurriculumSubjectFrontier(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(List.of(frontier("atom-b")));
        when(learnerService.applyLearningPlanTransition(LEARNER_ID, false, true,
                "atom-b", "atom-b", true, "LEARNING_PLAN_RECONCILED"))
                .thenReturn(new LearnerService.LearningPlanTransitionResult(true,
                        mock(UnifiedLearnerStateResponse.class)));

        var status = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(status.unavailablePlanCount()).isEqualTo(1);
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.canContinue()).isTrue();
            // Continuation stays possible even though the plan status is not determinable.
            assertThat(subject.evaluable()).isFalse();
            assertThat(subject.statusDirection()).isNull();
        });
        assertThat(status.automaticResumeAvailable()).isFalse();
        assertStatus(() -> service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY), HttpStatus.CONFLICT);
        assertThat(service.resumeExplicitly(LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isEqualTo("atom-b");
        assertThat(planRepository.findById(plan.planId()).orElseThrow().getBlocksJson()).isEqualTo(blocksJson);
    }

    @Test
    void activeUnmasteredGoalDisablesAndRejectsPlanContinueBeforeAnyStateMutation() {
        learner.setFollowLearningPlans(true);
        learner.setActiveGoalId("other-active");
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        doThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Another unmastered active goal is already in progress."))
                .when(learnerService)
                .assertLearningPlanMayActivateGoal(LEARNER_ID, "atom-a");

        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        null,
                        List.of(learning("block", "2026-09-01", "2026-09-04", "atom-a"))),
                TODAY);

        assertThat(created.canContinue()).isFalse();
        assertThat(created.continueReason()).isEqualTo("active-goal-in-progress");
        assertStatus(
                () -> service.continuePlan(
                        LEARNER_ID,
                        created.planId(),
                        new LearnerLearningPlanApi.ContinueRequest(created.revision(), TODAY)),
                HttpStatus.CONFLICT);
        verify(learnerService, never()).setPlannedGoalsAndGetState(any(), any());
        verify(learnerService, never()).setActiveGoal(any(), any());
        assertThat(learner.getActiveGoalId()).isEqualTo("other-active");
    }

    @Test
    void todayStatusAddsValidSubjectPlansAndLocalizesTheirLabels() {
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(
                        List.of("atom-a", "atom-b", "atom-c", "atom-d"),
                        List.of("atom-a", "atom-b", "atom-c", "atom-d")));
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of(
                "atom-a", 1.0,
                "atom-d", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenReturn(Map.of("atom-d", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        when(learnerService.getUncompactedRichFrontierForFocus(
                LEARNER_ID,
                List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-d")));
        when(learnerService.getUncompactedRichFrontierForFocus(
                LEARNER_ID,
                List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-q")));

        service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Math plan",
                        List.of(learning(
                                "math-block",
                                "2026-09-01",
                                "2026-09-04",
                                "atom-a",
                                "atom-b",
                                "atom-c",
                                "atom-d"))),
                TODAY);
        service.upsert(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Physics plan",
                        List.of(learningWithFocus(
                                "physics-block",
                                "physics-focus",
                                "2026-09-03",
                                "2026-09-04",
                                "atom-p",
                                "atom-q"))),
                TODAY);
        clearInvocations(eventPublisher);

        LearnerPlanTodayStatus status = service.getTodayStatus(LEARNER_ID, "en-GB");

        assertThat(status.asOf()).isEqualTo(TODAY);
        assertThat(status.followLearningPlans()).isTrue();
        assertThat(status.resumeAvailable()).isTrue();
        assertThat(status.unavailablePlanCount()).isZero();
        // Subjects appear in one stable order, and the combined text is exactly their lines:
        // there is no second formulation anywhere.
        assertThat(status.subjects())
                .extracting(LearnerPlanTodayStatus.SubjectStatus::subjectLabel)
                .containsExactly("Mathematics", "Physics");
        assertThat(status.subjects()).allSatisfy(subject -> {
            assertThat(subject.evaluable()).isTrue();
            assertThat(subject.statusDirection()).isNotNull();
            assertThat(subject.subjectLine()).startsWith(subject.subjectLabel() + ": ");
        });
        assertThat(status.statusText()).isEqualTo(String.join("\n", status.subjects().stream()
                .map(LearnerPlanTodayStatus.SubjectStatus::subjectLine)
                .toList()));
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void todayStatusNamesStaleAndMalformedPlansAsUnevaluableInsteadOfFakingABalance() {
        LearnerLearningPlanApi.PlanDetail math = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Math plan",
                        List.of(learning(
                                "math-block",
                                "2026-09-01",
                                "2026-09-04",
                                "atom-a"))),
                TODAY);
        LearnerLearningPlanApi.PlanDetail physics = service.upsert(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Physics plan",
                        List.of(learningWithFocus(
                                "physics-block",
                                "physics-focus",
                                "2026-09-01",
                                "2026-09-04",
                                "atom-p"))),
                TODAY);

        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-b", "atom-c"), List.of("atom-b")));
        var malformed = planRepository.findById(physics.planId()).orElseThrow();
        malformed.setBlocksJson("{not-json");
        planRepository.saveAndFlush(malformed);

        LearnerPlanTodayStatus status = service.getTodayStatus(LEARNER_ID, "de-DE");

        // Evaluability is its own state: no direction and no status line are invented,
        // and the shortfall is named rather than silently dropped.
        assertThat(status.subjects()).isNotEmpty().allSatisfy(subject -> {
            assertThat(subject.evaluable()).isFalse();
            assertThat(subject.statusDirection()).isNull();
            assertThat(subject.subjectLine()).isNull();
            assertThat(subject.periodGauge()).isNull();
            assertThat(subject.balanceGauge()).isNull();
        });
        assertThat(status.evaluable()).isFalse();
        assertThat(status.statusText()).contains("nicht auswertbar");
        assertThat(status.resumeAvailable()).isFalse();
        assertThat(status.unavailablePlanCount()).isEqualTo(2);
    }

    @Test
    void todayStatusAlwaysUsesTheEuropeBerlinCalendarDate() {
        LearnerLearningPlanService utcClockService = new LearnerLearningPlanService(
                planRepository,
                learnerService,
                objectMapper,
                eventPublisher,
                landscapeService,
                Clock.fixed(
                        Instant.parse("2026-09-03T22:30:00Z"),
                        ZoneId.of("UTC")));

        LearnerPlanTodayStatus status = utcClockService.getTodayStatus(LEARNER_ID, "de-DE");

        assertThat(status.asOf()).isEqualTo(TODAY);
    }

    @Test
    void todayStatusDoesNotOfferResumeWhileTheSelectedPlanGoalIsStillInProgress() {
        learner.setFollowLearningPlans(true);
        learner.setActiveGoalId("atom-a");
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(
                LEARNER_ID,
                List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));

        service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        "Math plan",
                        List.of(learning(
                                "math-block",
                                "2026-09-04",
                                "2026-09-04",
                                "atom-a"))),
                TODAY);

        LearnerPlanTodayStatus status = service.getTodayStatus(LEARNER_ID, "de-DE");

        assertThat(status.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.subjectLabel()).isEqualTo("Mathematik");
            assertThat(subject.periodText()).isEqualTo("Tagesziel 0 von 1");
            assertThat(subject.current()).isTrue();
            assertThat(subject.canContinue()).isTrue();
        });
        assertThat(status.resumeAvailable()).isFalse();
    }

    @Test
    void todayStatusOffersExplicitPhysicsSwitchWhileMathIsActiveButNotAfterPhysicsIsDone() {
        learner.setFollowLearningPlans(true);
        learner.setActiveGoalId("atom-a");
        learnerRepository.saveAndFlush(learner);
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("block-focus")))
                .thenReturn(List.of(frontier("atom-a")));
        when(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of("physics-focus")))
                .thenReturn(List.of(frontier("atom-p")));
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Math", List.of(learning("math", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, PHYSICS_LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Physics", List.of(learningWithFocus(
                        "physics", "physics-focus", "2026-09-04", "2026-09-04", "atom-p"))), TODAY);
        clearInvocations(eventPublisher);

        LearnerPlanTodayStatus duringMath = service.getTodayStatus(LEARNER_ID, "de");

        assertThat(duringMath.resumeAvailable()).isFalse();
        assertThat(duringMath.subjects()).filteredOn(subject -> "Physik".equals(subject.subjectLabel()))
                .singleElement().satisfies(subject -> {
                    assertThat(subject.current()).isFalse();
                    assertThat(subject.canContinue()).isTrue();
                });

        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-p", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenReturn(Map.of("atom-p", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        LearnerPlanTodayStatus physicsDone = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(physicsDone.subjects()).filteredOn(subject -> "Physik".equals(subject.subjectLabel()))
                .singleElement().satisfies(subject -> {
                    assertThat(subject.periodText()).isEqualTo("Tagesziel erreicht");
                    assertThat(subject.canContinue()).isFalse();
                });
        assertThat(learner.getActiveGoalId()).isEqualTo("atom-a");
        verify(eventPublisher, never()).publishEvent(any());
    }

    private String useLegacyFingerprint(UUID planId) {
        var stored = planRepository.findById(planId).orElseThrow();
        String fingerprint = "sha256:" + "a".repeat(64);
        stored.setScopeFingerprint(fingerprint);
        planRepository.saveAndFlush(stored);
        return fingerprint;
    }

    private void assertStoredPlanCannotDriveLearning(LearnerLearningPlanApi.PlanDetail plan) {
        var detail = service.getPlan(LEARNER_ID, plan.landscapeId(), TODAY);
        assertThat(detail.stale()).isTrue();
        assertThat(detail.canContinue()).isFalse();
        assertThat(detail.nextEligibleGoal()).isNull();
        assertThat(service.getPlans(LEARNER_ID, TODAY).plans()).singleElement()
                .satisfies(summary -> assertThat(summary.stale()).isTrue());
        var today = service.getTodayStatus(LEARNER_ID, "de");
        // The subject is named as unevaluable rather than disappearing from the status.
        assertThat(today.subjects()).singleElement()
                .satisfies(subject -> assertThat(subject.evaluable()).isFalse());
        assertThat(today.unavailablePlanCount()).isEqualTo(1);
        var request = new LearnerLearningPlanApi.ContinueRequest(plan.revision(), TODAY);
        assertStatus(() -> service.continuePlan(LEARNER_ID, plan.planId(), request), HttpStatus.CONFLICT);
        assertStatus(() -> service.switchPlan(LEARNER_ID, plan.planId(), request), HttpStatus.CONFLICT);
        assertThat(service.reconcile(LEARNER_ID, new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed())
                .isFalse();
        verify(learnerService, never()).setPlannedGoalsAndGetState(any(), any());
        verify(learnerService, never()).setActiveGoal(any(), any());
        verify(learnerService, never()).applyLearningPlanTransition(
                any(), any(Boolean.class), any(Boolean.class), any(), any(), any(Boolean.class), any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void severalPlansOfTheSameSubjectMergeIntoOneBalanceWithoutDoubleCounting() {
        String secondMathLandscape = "math-advanced";
        when(learnerService.getPlanningScope(LEARNER_ID, secondMathLandscape))
                .thenReturn(scopeFor(secondMathLandscape,
                        List.of("atom-m1", "atom-m2"), List.of("atom-m1", "atom-m2")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(secondMathLandscape), any()))
                .thenAnswer(invocation -> LearnerLearningPlanService.scopeFingerprint(
                        learnerService.getPlanningScope(LEARNER_ID, secondMathLandscape)));
        when(landscapeService.getById(secondMathLandscape))
                .thenReturn(landscape(secondMathLandscape, "Mathematik"));
        learner.setFollowLearningPlans(true);

        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe Basis", List.of(learning("a", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, secondMathLandscape, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe Vertiefung", List.of(learning("b", "2026-09-04", "2026-09-04", "atom-m1"))), TODAY);

        LearnerPlanTodayStatus status = service.getTodayStatus(LEARNER_ID, "de");

        // Two plans, one subject, one balance: a merged subject yields a single status line
        // whose period target is the sum, never two competing lines for the same subject.
        assertThat(status.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.subjectLabel()).isEqualTo("Mathematik");
            assertThat(subject.periodText()).isEqualTo("Tagesziel 0 von 2");
            // Ambiguity fails closed: a subject behind two plans cannot be switched to.
            assertThat(subject.canContinue()).isFalse();
        });
        assertThat(status.statusText()).isEqualTo("Mathematik: Tagesziel 0 von 2 · im Plan");
    }

    @Test
    void mergedSubjectGaugeUsesEarliestDueDateOnceAndKeepsItsDailyScaleOnAFreeDay() {
        String secondMathLandscape = "math-advanced";
        when(learnerService.getPlanningScope(LEARNER_ID, secondMathLandscape))
                .thenReturn(scopeFor(secondMathLandscape,
                        List.of("atom-a", "atom-m1"), List.of("atom-a", "atom-m1")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(secondMathLandscape), any()))
                .thenAnswer(invocation -> LearnerLearningPlanService.scopeFingerprint(
                        learnerService.getPlanningScope(LEARNER_ID, secondMathLandscape)));
        when(landscapeService.getById(secondMathLandscape))
                .thenReturn(landscape(secondMathLandscape, "Mathematik"));

        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe Basis", List.of(learning("first", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        service.upsert(LEARNER_ID, secondMathLandscape, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe Vertiefung", List.of(learning("second", "2026-09-07", "2026-09-07",
                        "atom-a", "atom-m1"))), TODAY);

        LearnerPlanTodayStatus today = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(today.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.periodGauge().target()).isEqualTo(1);
            assertThat(subject.balanceGauge().typicalAmount()).isEqualTo(1);
            assertThat(subject.balanceGauge().net()).isZero();
        });

        LearnerPlanTodayStatus freeDay = serviceAt("2026-09-04T22:30:00Z")
                .getTodayStatus(LEARNER_ID, "de");
        assertThat(freeDay.asOf()).isEqualTo(LocalDate.parse("2026-09-05"));
        assertThat(freeDay.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.periodGauge().target()).isZero();
            assertThat(subject.periodGauge().needlePosition()).isNull();
            assertThat(subject.periodText()).isEqualTo("Heute kein Tagesziel");
            assertThat(subject.balanceGauge().typicalAmount()).isEqualTo(1);
            assertThat(subject.balanceGauge().net()).isEqualTo(-1);
        });
    }

    @Test
    void weekBasisEvaluatesTheWholeCurrentWeekAndSwitchingBackChangesNeitherPlanNorProgress() {
        learner.setFollowLearningPlans(true);
        learner.setLearningPlanPeriodBasis(
                com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);
        // TODAY is Friday, so the running week is Mon 2026-08-31 to Sun 2026-09-06. The second
        // goal sits on Thursday: inside the week, but before today.
        var plan = service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe", List.of(
                        learning("earlier-this-week", "2026-09-03", "2026-09-03", "atom-b"),
                        learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        // Creating the plan is a state change and rightly publishes. What must stay silent is
        // everything that follows: the status calculation is a read projection.
        clearInvocations(eventPublisher);

        LearnerPlanTodayStatus weekly = service.getTodayStatus(LEARNER_ID, "de");

        assertThat(weekly.periodBasis())
                .isEqualTo(com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);
        assertThat(weekly.periodStart().getDayOfWeek()).isEqualTo(java.time.DayOfWeek.MONDAY);
        assertThat(weekly.periodEnd().getDayOfWeek()).isEqualTo(java.time.DayOfWeek.SUNDAY);
        assertThat(weekly.periodStart()).isBeforeOrEqualTo(TODAY);
        assertThat(weekly.periodEnd()).isAfterOrEqualTo(TODAY);
        // The whole running week is the reference period, not just today.
        assertThat(weekly.statusText()).isEqualTo("Mathematik: Wochenziel 0 von 2 · im Plan");
        assertThat(weekly.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.periodGauge().target()).isEqualTo(2);
            assertThat(subject.balanceGauge().typicalAmount()).isEqualTo(2);
            assertThat(subject.balanceGauge().net()).isZero();
        });

        learner.setLearningPlanPeriodBasis(
                com.skillpilot.backend.service.learningplan.PeriodBasis.DAY);
        LearnerPlanTodayStatus daily = service.getTodayStatus(LEARNER_ID, "de");

        // The day basis splits the same facts differently: what the week legitimately absorbs
        // as one period target appears here as today's target plus a visible backlog.
        assertThat(daily.statusText())
                .isEqualTo("Mathematik: Tagesziel 0 von 1 · 1 Lernziel im Rückstand");
        assertThat(daily.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.periodGauge().target()).isEqualTo(1);
            assertThat(subject.balanceGauge().typicalAmount()).isEqualTo(1);
            assertThat(subject.balanceGauge().net()).isEqualTo(-1);
        });
        // Changing the basis shifts the frame of reference, never the schedule or the progress.
        assertThat(service.getPlan(LEARNER_ID, LANDSCAPE_ID, TODAY).blocks()).isEqualTo(plan.blocks());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void withdrawnMasteryStopsCountingAsCompletedWorkInTheSamePeriod() {
        learner.setFollowLearningPlans(true);
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe", List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY)).thenReturn(
                Map.of("atom-a", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));

        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Tagesziel erreicht · im Plan");

        // Taking mastery back must not leave the completion credited to the period.
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of());

        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Tagesziel 0 von 1 · im Plan");
    }

    @Test
    void statusTextNeverAnnouncesTheActiveGoalWhoseLocalizedAnnouncementStaysSeparate() {
        learner.setFollowLearningPlans(true);
        learner.setActiveGoalId("atom-a");
        learnerRepository.saveAndFlush(learner);
        LearningGoal goal = new LearningGoal();
        goal.setId("atom-a");
        goal.setTitle("Potenzfunktionen beschreiben");
        goal.setTitleEn("Describe power functions");
        when(landscapeService.getGoalDefinition("atom-a")).thenReturn(goal);
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe", List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);

        LearnerPlanTodayStatus german = service.getTodayStatus(LEARNER_ID, "de");
        assertThat(german.statusText()).isEqualTo("Mathematik: Tagesziel 0 von 1 · im Plan");
        assertThat(german.activeGoal().announcement())
                .isEqualTo("Dein aktives Lernziel: Potenzfunktionen beschreiben");

        LearnerPlanTodayStatus english = service.getTodayStatus(LEARNER_ID, "en");
        assertThat(english.statusText()).isEqualTo("Mathematics: Daily target 0 of 1 · on track");
        assertThat(english.activeGoal().announcement())
                .isEqualTo("Your active learning goal: Describe power functions");
    }

    @Test
    void goalsMasteredBeforePlanCreationStayOutOfTheWholeBalance() {
        // atom-c is part of the scope but already mastered when the plan is created, so the
        // captured plan set G holds only atom-a and atom-b (scope set up in setUp()).
        learner.setFollowLearningPlans(true);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-c", 1.0));
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe", List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a", "atom-c"))),
                TODAY);
        // A re-sent completion of the previously mastered goal is no progress of this plan.
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY)).thenReturn(
                Map.of("atom-c", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));

        // Counting atom-c would read "Tagesziel 1 von 2": S, P, I and H must all ignore it.
        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Tagesziel 0 von 1 · im Plan");

        // A plan goal mastered after plan creation stays in G and counts as completed work.
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-c", 1.0, "atom-a", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY)).thenReturn(Map.of(
                "atom-c", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant(),
                "atom-a", TODAY.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant()));
        assertThat(service.getTodayStatus(LEARNER_ID, "de").statusText())
                .isEqualTo("Mathematik: Tagesziel erreicht · im Plan");
    }

    @Test
    void unreadableCompletionEventsNeverBecomeAZeroCompletionBalance() {
        learner.setFollowLearningPlans(true);
        service.upsert(LEARNER_ID, LANDSCAPE_ID, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Mathe", List.of(learning("today", "2026-09-04", "2026-09-04", "atom-a"))), TODAY);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of("atom-a", 1.0));
        when(learnerService.getGoalCompletionsOnDate(LEARNER_ID, TODAY))
                .thenThrow(new DataAccessResourceFailureException("completion store unavailable"));

        // Without reliable completion events there is no status at all, never "Tagesziel 0 von 1".
        assertThatThrownBy(() -> service.getTodayStatus(LEARNER_ID, "de"))
                .isInstanceOf(DataAccessResourceFailureException.class);
    }

    @Test
    void weekBoundariesFollowLocalCalendarDatesAcrossBothDaylightSavingTransitions() {
        learner.setFollowLearningPlans(true);
        learner.setLearningPlanPeriodBasis(
                com.skillpilot.backend.service.learningplan.PeriodBasis.WEEK);

        // Spring forward: 01:30 and 03:30 Berlin time on the same Sunday, on either side of the
        // hour that does not exist locally. Both must read as the same local date and week.
        for (String instant : List.of("2026-03-29T00:30:00Z", "2026-03-29T01:30:00Z")) {
            LearnerPlanTodayStatus status = serviceAt(instant).getTodayStatus(LEARNER_ID, "de");
            assertThat(status.asOf()).isEqualTo(LocalDate.parse("2026-03-29"));
            assertThat(status.periodStart()).isEqualTo(LocalDate.parse("2026-03-23"));
            assertThat(status.periodEnd()).isEqualTo(LocalDate.parse("2026-03-29"));
        }

        // Autumn back: 02:30 Berlin time occurs twice on the same Sunday. The ambiguous hour
        // must not move the day or the week either.
        for (String instant : List.of("2026-10-25T00:30:00Z", "2026-10-25T01:30:00Z")) {
            LearnerPlanTodayStatus status = serviceAt(instant).getTodayStatus(LEARNER_ID, "de");
            assertThat(status.asOf()).isEqualTo(LocalDate.parse("2026-10-25"));
            assertThat(status.periodStart()).isEqualTo(LocalDate.parse("2026-10-19"));
            assertThat(status.periodEnd()).isEqualTo(LocalDate.parse("2026-10-25"));
        }

        // The boundaries stay Monday to Sunday: a week is a span of local dates, never a
        // blanket addition of 168 hours.
        assertThat(LocalDate.parse("2026-03-23").getDayOfWeek()).isEqualTo(java.time.DayOfWeek.MONDAY);
        assertThat(LocalDate.parse("2026-10-25").getDayOfWeek()).isEqualTo(java.time.DayOfWeek.SUNDAY);
    }

    /** A service pinned to one absolute instant, deliberately with a non-Berlin clock zone. */
    private LearnerLearningPlanService serviceAt(String instant) {
        return new LearnerLearningPlanService(
                planRepository,
                learnerService,
                objectMapper,
                eventPublisher,
                landscapeService,
                Clock.fixed(Instant.parse(instant), ZoneId.of("UTC")));
    }

    private static LearnerPlanningScopeResponse scope(List<String> all, List<String> open) {
        return scopeFor(LANDSCAPE_ID, all, open);
    }

    private static LearnerPlanningScopeResponse scopeFor(
            String landscapeId,
            List<String> all,
            List<String> open) {
        return new LearnerPlanningScopeResponse(
                CURRICULUM_ID,
                landscapeId,
                all,
                all.size(),
                all.size() - open.size(),
                open,
                CAPTURED_AT);
    }

    private static LearnerLearningPlanApi.Block learning(
            String id,
            String start,
            String end,
            String... atomIds) {
        return learningWithFocus(id, "block-focus", start, end, atomIds);
    }

    private static LearnerLearningPlanApi.Block learningWithFocus(
            String id,
            String focusGoalId,
            String start,
            String end,
            String... atomIds) {
        return new LearnerLearningPlanApi.Block(
                id,
                "learning",
                focusGoalId,
                id,
                LocalDate.parse(start),
                LocalDate.parse(end),
                null,
                List.of(atomIds));
    }

    private static LearnerLearningPlanApi.Block milestone(String id, String date) {
        return new LearnerLearningPlanApi.Block(
                id,
                "milestone",
                null,
                "Prüfung",
                null,
                null,
                LocalDate.parse(date),
                null);
    }

    private static FrontierGoal frontier(String id) {
        return new FrontierGoal(
                id,
                id,
                id,
                "atomic",
                "tutor",
                null,
                "ready",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private static SkillLandscape landscape(String landscapeId, String subject) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(landscapeId);
        landscape.setSubject(subject);
        return landscape;
    }

    private static void assertStatus(Runnable operation, HttpStatus status) {
        assertThatThrownBy(operation::run)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(status));
    }
}
