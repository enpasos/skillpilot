package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
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

    @Autowired
    private ObjectMapper objectMapper;

    private Learner learner;

    @BeforeEach
    void setUp() {
        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setLastActivityAt(CAPTURED_AT);
        learner.setFollowLearningPlans(false);
        learnerRepository.saveAndFlush(learner);
        ZoneId zone = ZoneId.of("Europe/Berlin");
        service = new LearnerLearningPlanService(
                planRepository,
                learnerService,
                objectMapper,
                eventPublisher,
                Clock.fixed(TODAY.atStartOfDay(zone).toInstant(), zone));
        when(learnerService.getLearner(LEARNER_ID)).thenReturn(learner);
        when(learnerService.getMastery(LEARNER_ID)).thenReturn(Map.of());
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c"), List.of("atom-a", "atom-b")));
        when(learnerService.learningPlanFingerprint(eq(LEARNER_ID), eq(LANDSCAPE_ID), any()))
                .thenAnswer(invocation -> LearnerLearningPlanService.scopeFingerprint(
                        learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID)));
        when(learnerService.orderLearningPlanBlocksByPrerequisites(eq(LEARNER_ID), any()))
                .thenAnswer(invocation -> invocation.getArgument(1));
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
        assertThat(created.metrics().totalPlanned()).isEqualTo(2);
        assertThat(created.metrics().dueThroughToday()).isEqualTo(1);
        assertThat(created.pace().status()).isEqualTo("neutral");
        assertThat(created.pace().reason()).isEqualTo("mastery-history-not-event-backed");
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

        assertThat(created.metrics().dueThroughToday()).isEqualTo(4);
        assertThat(created.metrics().dueToday()).isEqualTo(1);
        assertThat(created.metrics().completedDueToday()).isZero();
        assertThat(created.metrics().openDueToday()).isEqualTo(1);
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

        assertThat(created.metrics().dueThroughToday()).isEqualTo(1);
        assertThat(created.metrics().dueToday()).isEqualTo(1);
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
                .thenReturn(List.of(frontier("atom-a")));

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
        assertThat(created.metrics().dueThroughToday()).isEqualTo(1);
        assertThat(created.metrics().dueToday()).isEqualTo(1);
        assertThat(created.nextEligibleGoal()).isEqualTo(
                new LearnerLearningPlanApi.NextEligibleGoal("atom-a"));
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
    void continueRequiresOptInCurrentFingerprintRevisionAndFrontierEligibility() {
        LearnerLearningPlanApi.PlanDetail created = service.upsert(
                LEARNER_ID,
                LANDSCAPE_ID,
                new LearnerLearningPlanApi.UpsertRequest(
                        0L,
                        null,
                        List.of(learning("block", "2026-09-01", "2026-09-04", "atom-a", "atom-b"))),
                TODAY);

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

        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(scope(List.of("atom-a", "atom-b", "atom-c", "atom-d"), List.of("atom-b", "atom-d")));
        assertStatus(() -> service.continuePlan(LEARNER_ID, created.planId(), request), HttpStatus.CONFLICT);
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

    private static LearnerPlanningScopeResponse scope(List<String> all, List<String> open) {
        return new LearnerPlanningScopeResponse(
                CURRICULUM_ID,
                LANDSCAPE_ID,
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
        return new LearnerLearningPlanApi.Block(
                id,
                "learning",
                "block-focus",
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

    private static void assertStatus(Runnable operation, HttpStatus status) {
        assertThatThrownBy(operation::run)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(status));
    }
}
