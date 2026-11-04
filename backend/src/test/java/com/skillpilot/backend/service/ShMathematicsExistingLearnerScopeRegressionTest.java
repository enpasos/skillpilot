package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.LearningPlanCompletionContext;
import com.skillpilot.backend.completion.LearningPlanCompletionProjection;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Persisted pre-correction learner state against the current real SH Mathematics
 * projection. H2 contains synthetic learners only; all runtime services, graph,
 * composition views, completion semantics and the recall deck are real.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ShMathematicsExistingLearnerScopeRegressionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String MEMORY = "ffbdd7a9-45c6-54f1-988c-58256ca05eeb";
    private static final String ASSESSMENT = "6644a4dc-a773-525f-a382-5e1e3c592b4f";
    private static final List<String> REMOVED_TARGETS = List.of(
            "0a7ff229-bf90-523c-a6b4-dad2ecd54ed8", "4b58b855-cd26-538c-8e6f-304f4cfd8ad6",
            "4d906967-9f4b-5dc8-af7a-d403b95d61f5", "5c9ac68c-3928-518c-bbe0-e044667035a6",
            "5f328147-619c-568d-9a0d-e1787ca0c01b", "677be619-5f0a-59bf-9730-0071c7d3f150",
            "78bfbde4-8e16-529e-bd53-4e29d960b2b2", "aa14d9e4-5790-5d94-a245-2ff9a70bf633",
            "ae483d98-54e0-5985-96d2-fc1351d22e4f", "d1910e24-bd21-4b51-9f9a-d8c5c5e63e5b",
            "eb2cecd6-5dca-5a2e-988b-a29b24c20345", "f14e1643-ad8d-5235-a832-97987fa18489",
            "f85419c4-63ac-5d6d-b73b-fcb12a0ff89f", ASSESSMENT);
    private static final Instant CAPTURED_AT = Instant.parse("2026-09-01T08:00:00Z");
    private static final LocalDate TODAY = LocalDate.of(2026, 11, 1);

    @Autowired private LearnerService learners;
    @Autowired private LearnerRepository learnerRepository;
    @Autowired private LearnerLearningPlanRepository planRepository;
    @Autowired private PlannedGoalRepository focusRepository;
    @Autowired private MasteryRepository masteryRepository;
    @Autowired private LearnerClientStateRepository recallRepository;
    @Autowired private LandscapeService landscapes;
    @Autowired private DeckResourceService decks;
    @Autowired private ObjectMapper mapper;
    @Autowired private ApplicationEventPublisher events;
    @Autowired private EntityManager entityManager;
    private LearnerLearningPlanService plans;

    @BeforeEach
    void useARequestLocalFixedPlanClock() {
        ZoneId berlin = ZoneId.of("Europe/Berlin");
        plans = new LearnerLearningPlanService(planRepository, learners, mapper, events, landscapes,
                Clock.fixed(TODAY.atStartOfDay(berlin).toInstant(), berlin));
    }

    @ParameterizedTest(name = "SH GK {0} {1}: retained learner state and stale dated G")
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void removedTargetsRequireExplicitFocusChoiceAndCannotEarnDatedPlanCredit(String stage, String duration)
            throws Exception {
        var fixture = existingLearner(stage, duration);
        String learnerId = fixture.learnerId();
        var before = persistedState(learnerId);
        var context = learners.getLearningPlanCompletionContext(learnerId, Set.copyOf(REMOVED_TARGETS));
        assertThat(context).isNotNull();
        assertThat(context.semantics()).isEqualTo(LearningPlanCompletionContext.Semantics.AUTOMATIC);
        assertThat(context.canonicalGoals().keySet()).containsAll(REMOVED_TARGETS).contains(MEMORY);
        assertThat(context.level2TargetGoalIds()).doesNotContainAnyElementsOf(REMOVED_TARGETS);
        assertThat(learners.getPlanningScope(learnerId, MATH).scopeAtomicGoalIds())
                .isNotEmpty().doesNotContainAnyElementsOf(REMOVED_TARGETS);
        assertThatThrownBy(() -> new LearningPlanCompletionProjection().waivedGoals(
                context, Set.copyOf(REMOVED_TARGETS), ignored -> learners.getMastery(learnerId)))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        exception -> assertThat(exception.code()).isEqualTo("FOREIGN_TARGET"));

        // Repeated public reads must not turn the saved but invalid focus into a
        // first start, broaden T, invent mastery or silently replace captured G.
        for (int read = 0; read < 2; read++) {
            assertThat(learners.getPlannedGoals(learnerId)).isEmpty();
            assertThat(learners.getFrontier(learnerId)).isEmpty();
            var state = learners.getLearnerState(learnerId);
            assertThat(state.activeGoal()).isNull();
            assertThat(state.goals().planned()).isEmpty();
            assertThat(state.goals().scope_completed()).isFalse();
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(state.nextAllowedActions()).contains("setScope").doesNotContain("setActiveGoal");
            assertThat(state.frontier()).allSatisfy(goal -> assertThat(goal.type()).isNotEqualTo("atomic"));
            assertThat(learners.getCoachLearnerState(learnerId).stateMachine().requiredAction())
                    .isEqualTo("setScope");

            assertThat(learners.isLearningPlanCompatible(learnerId, ROOT, MATH, fixture.blocks())).isFalse();
            var detail = plans.getPlan(learnerId, MATH, TODAY);
            assertThat(detail.stale()).isTrue();
            assertThat(detail.revision()).isEqualTo(7L);
            assertThat(detail.blocks()).isEqualTo(fixture.blocks());
            assertThat(detail.canContinue()).isFalse();
            assertThat(detail.nextEligibleGoal()).isNull();
            assertThat(detail.learningScope()).isNull();
            assertThat(detail.continueReason()).isEqualTo("personal-curriculum-changed");
            var collection = plans.getPlans(learnerId, TODAY, "de");
            assertThat(collection.plans()).singleElement().satisfies(summary -> {
                assertThat(summary.stale()).isTrue();
                assertThat(summary.revision()).isEqualTo(detail.revision());
                assertThat(summary.canContinue()).isFalse();
                assertThat(summary.nextEligibleGoal()).isNull();
                assertThat(summary.learningScope()).isNull();
            });
            assertThat(collection.status().unavailablePlanCount()).isEqualTo(1);
            var status = plans.getTodayStatus(learnerId, "de");
            assertThat(status.evaluable()).isFalse();
            assertThat(status.unavailablePlanCount()).isEqualTo(1);
            assertThat(status.statusText()).contains("nicht auswertbar");
            assertThat(status.automaticResumeAvailable()).isFalse();
            assertThat(status.subjects()).singleElement().satisfies(subject -> {
                assertThat(subject.evaluable()).isFalse();
                assertThat(subject.statusDirection()).isNull();
                assertThat(subject.periodGauge()).isNull();
                assertThat(subject.balanceGauge()).isNull();
                assertThat(subject.planCreditText()).isNull();
            });
            assertThat(persistedState(learnerId)).isEqualTo(before);
        }

        var request = new LearnerLearningPlanApi.ContinueRequest(7L, TODAY);
        assertConflict(() -> plans.continuePlan(learnerId, fixture.planId(), request));
        assertConflict(() -> plans.switchPlan(learnerId, fixture.planId(), request));
        assertThat(plans.reconcile(learnerId, new LearnerLearningPlanApi.ReconcileRequest(TODAY)).changed())
                .isFalse();
        assertThat(persistedState(learnerId)).isEqualTo(before);
    }

    @ParameterizedTest(name = "SH GK {0} {1}: explicit new focus preserves captured G and learning")
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void explicitNewFocusDoesNotRewriteTheHistoricalDatedPlanOrLearnerResults(String stage, String duration)
            throws Exception {
        var fixture = existingLearner(stage, duration);
        var before = persistedState(fixture.learnerId());
        var context = learners.getLearningPlanCompletionContext(fixture.learnerId());
        String currentAssessment = context.level2TargetGoalIds().stream()
                .filter(id -> "exam".equals(context.canonicalGoals().get(id).getNodeKind()))
                .sorted().findFirst().orElseThrow();

        assertThat(learners.setPlannedGoals(fixture.learnerId(), Set.of(currentAssessment)))
                .containsExactly(currentAssessment);
        assertThat(learners.getPlannedGoals(fixture.learnerId())).containsExactly(currentAssessment);
        // Replacing Level-3 focus does not silently disable plan mode or repair
        // its incompatible G. The old plan still blocks automatic continuation.
        assertThat(learners.getFrontier(fixture.learnerId())).isEmpty();
        assertThat(plans.getPlan(fixture.learnerId(), MATH, TODAY).stale()).isTrue();

        var after = persistedState(fixture.learnerId());
        assertThat(after.plan()).isEqualTo(before.plan());
        assertThat(after.mastery()).isEqualTo(before.mastery());
        assertThat(after.recall()).isEqualTo(before.recall());
        assertThat(after.learner().personalCurriculum()).isEqualTo(before.learner().personalCurriculum());
        assertThat(after.learner().activeGoal()).isNull();
        assertThat(after.focus()).extracting(FocusSnapshot::goalId).containsExactly(currentAssessment);
        assertThat(after.learner().revision()).isEqualTo(before.learner().revision() + 1);
    }

    @ParameterizedTest(name = "SH GK {0} {1}: revision-checked explicit replacement of stale G")
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void readableOldRevisionAllowsExplicitPublicationOfACorrectedPlan(String stage, String duration)
            throws Exception {
        var fixture = existingLearner(stage, duration);
        var before = persistedState(fixture.learnerId());
        var old = plans.getPlan(fixture.learnerId(), MATH, TODAY);
        var context = learners.getLearningPlanCompletionContext(fixture.learnerId());
        String currentAssessment = context.level2TargetGoalIds().stream()
                .filter(id -> "exam".equals(context.canonicalGoals().get(id).getNodeKind()))
                .sorted().findFirst().orElseThrow();
        var corrected = List.of(new LearnerLearningPlanApi.Block("corrected-stochastics", "learning", null,
                "Explicitly corrected plan", TODAY, TODAY.plusDays(7), null, List.of(currentAssessment)));
        // Replacing a dated schedule needs no implicit-credit proof. The whole
        // current PC still has uncovered routes, which must remain an explicit refusal.
        assertThatThrownBy(() -> new LearningPlanCompletionProjection().waivedGoals(
                context, Set.of(currentAssessment), ids -> learners.resolveLearningPlanCompletionMastery(
                        fixture.learnerId(), learners.getMastery(fixture.learnerId()), ids)))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        exception -> assertThat(exception.code()).isEqualTo("UNCOVERED_COMPLETION_TARGETS"));

        // The GUI reads the old detail to obtain expectedRevision before it can
        // offer an explicit replacement. A wrong revision must still be refused.
        assertConflict(() -> plans.upsert(fixture.learnerId(), MATH,
                new LearnerLearningPlanApi.UpsertRequest(old.revision() - 1, "Wrong revision", corrected), TODAY));
        assertThat(persistedState(fixture.learnerId())).isEqualTo(before);
        var published = plans.upsert(fixture.learnerId(), MATH,
                new LearnerLearningPlanApi.UpsertRequest(old.revision(), "Explicit replacement", corrected), TODAY);

        assertThat(published.planId()).isEqualTo(old.planId());
        assertThat(published.revision()).isEqualTo(old.revision() + 1);
        assertThat(published.stale()).isFalse();
        assertThat(published.blocks()).isEqualTo(corrected);
        assertThat(published.canContinue()).isFalse();
        assertThat(published.nextEligibleGoal()).isNull();
        assertThat(published.learningScope()).isNull();
        assertThat(published.continueReason()).isEqualTo("assessment-coverage-unavailable");
        var after = persistedState(fixture.learnerId());
        assertThat(after.mastery()).isEqualTo(before.mastery());
        assertThat(after.recall()).isEqualTo(before.recall());
        assertThat(after.learner().personalCurriculum()).isEqualTo(before.learner().personalCurriculum());
        assertThat(after.learner().activeGoal()).isNull();
        assertThat(after.focus()).isEqualTo(before.focus());
    }

    @ParameterizedTest(name = "SH GK {0} {1}: the complete stochastics recall contract is outside GK T")
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void wholeStochasticsMemoryContractIsNotAGkTarget(String stage, String duration) throws Exception {
        var fixture = existingLearner(stage, duration);
        var context = learners.getLearningPlanCompletionContext(fixture.learnerId());
        // The reviewed correction excludes the whole goal from these four GK
        // offerings. Its canonical twelve-card contract and saved recall remain
        // intact; a runtime card subset must never disguise a broader GK target.
        assertThat(context.canonicalGoals()).containsKey(MEMORY);
        assertThat(context.canonicalGoals().get(MEMORY).getNodeKind()).isEqualTo("memory");
        assertThat(context.level2TargetGoalIds()).doesNotContain(MEMORY);
        assertThat(learners.getPlanningScope(fixture.learnerId(), MATH).scopeAtomicGoalIds())
                .doesNotContain(MEMORY);
        assertThat(learners.getPersonalCurriculumAtomicTargetsByLandscape(fixture.learnerId()).get(MATH))
                .doesNotContain(MEMORY);
    }

    private Fixture existingLearner(String stage, String duration) throws Exception {
        var learner = new Learner();
        learner.setSkillpilotId("sh-scope-regression-" + stage + "-" + duration);
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-SH", "stage", stage, "durationModel", duration),
                MATH, Map.of("selected", true, "filterId", "GK"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learner.setLearningState(LearningState.FRONTIER);
        learner.setLearningPlanPeriodBasis(PeriodBasis.DAY);
        learner.setFollowLearningPlans(true);
        learner.setAutoPilot(true);
        learner.setCoachStateRevision(12L);
        learner.setLastActivityAt(CAPTURED_AT);
        learnerRepository.saveAndFlush(learner);
        focusRepository.saveAllAndFlush(REMOVED_TARGETS.stream().map(id -> new PlannedGoal(learner, id)).toList());
        masteryRepository.saveAllAndFlush(List.of(
                new Mastery(learner, REMOVED_TARGETS.get(0), 1.0),
                new Mastery(learner, REMOVED_TARGETS.get(1), 0.0),
                new Mastery(learner, ASSESSMENT, 1.0), new Mastery(learner, MEMORY, 1.0)));

        var memory = landscapes.getGoalDefinition(MEMORY);
        var resource = decks.resolveDeckResource(MEMORY, (String) memory.getExtendedData().get("vocabularySource"));
        assertThat(resource).isNotNull();
        String cardId;
        try (var input = resource.getInputStream()) {
            var cards = mapper.readTree(input).path("cards");
            assertThat(cards.size()).isEqualTo(12);
            cardId = cards.get(0).path("id").asText();
        }
        var recall = Map.of(cardId, Map.of("id", cardId, "interval", 6, "repetition", 2,
                "ef", 2.5, "nextReview", 1793577600000L, "verifiedRecall", Map.of(
                        "status", "passed", "attempts", 1, "failures", 0,
                        "lastTestedAt", CAPTURED_AT.toString(), "passedAt", CAPTURED_AT.toString())));
        recallRepository.saveAndFlush(new LearnerClientState(learner, MEMORY,
                mapper.writeValueAsString(recall), CAPTURED_AT));

        // The service could no longer create this historical G after the scope
        // correction. Seed the capture directly, without pretending to migrate it.
        var historicalGoals = new ArrayList<>(REMOVED_TARGETS);
        historicalGoals.add(MEMORY);
        var blocks = List.of(new LearnerLearningPlanApi.Block("old-stochastics", "learning", null,
                "Captured stochastics goals", TODAY.minusDays(7), TODAY, null, List.copyOf(historicalGoals)));
        var plan = new LearnerLearningPlan();
        plan.setLearner(learner);
        plan.setLandscapeId(MATH);
        plan.setCurriculumId(ROOT);
        plan.setScopeFingerprint("sha256:" + "a".repeat(64));
        plan.setRevision(7L);
        plan.setPlanLabel("Pre-correction synthetic learner plan");
        plan.setBlocksJson(mapper.writeValueAsString(blocks));
        plan.setCapturedAt(CAPTURED_AT);
        planRepository.saveAndFlush(plan);
        return new Fixture(learner.getSkillpilotId(), plan.getId(), blocks);
    }

    private PersistedState persistedState(String learnerId) {
        entityManager.flush();
        entityManager.clear();
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var plan = planRepository.findByLearner_SkillpilotIdAndLandscapeId(learnerId, MATH).orElseThrow();
        return new PersistedState(
                new LearnerSnapshot(learner.getPersonalCurriculum(), learner.getActiveGoalId(),
                        learner.getLearningState(), learner.getAutoPilot(), learner.getFollowLearningPlans(),
                        learner.getCoachStateRevision(), learner.getLastActivityAt()),
                new PlanSnapshot(plan.getId(), plan.getCurriculumId(), plan.getLandscapeId(), plan.getPlanLabel(),
                        plan.getBlocksJson(), plan.getScopeFingerprint(), plan.getRevision(), plan.getCapturedAt(),
                        plan.getCreatedAt(), plan.getUpdatedAt()),
                focusRepository.findByLearner_SkillpilotId(learnerId).stream()
                        .map(goal -> new FocusSnapshot(goal.getGoalId(), goal.getCreatedAt()))
                        .sorted(java.util.Comparator.comparing(FocusSnapshot::goalId)).toList(),
                masteryRepository.findByLearner_SkillpilotId(learnerId).stream().collect(Collectors.toMap(
                        Mastery::getGoalKey, mastery -> new MasterySnapshot(mastery.getValue(), mastery.getUpdatedAt()))),
                recallRepository.findByLearner_SkillpilotId(learnerId).stream().collect(Collectors.toMap(
                        state -> state.getId().getNodeId(), state -> new RecallSnapshot(
                                state.getClientState(), state.getClientStateUpdatedAt()))));
    }

    private static void assertConflict(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    private record Fixture(String learnerId, UUID planId, List<LearnerLearningPlanApi.Block> blocks) { }
    private record LearnerSnapshot(String personalCurriculum, String activeGoal, LearningState state,
            Boolean autopilot, Boolean followsPlans, long revision, Instant lastActivity) { }
    private record PlanSnapshot(UUID id, String curriculum, String landscape, String label, String blocks,
            String fingerprint, long revision, Instant capturedAt, Instant createdAt, Instant updatedAt) { }
    private record FocusSnapshot(String goalId, Instant createdAt) { }
    private record MasterySnapshot(double value, Instant updatedAt) { }
    private record RecallSnapshot(String state, Instant updatedAt) { }
    private record PersistedState(LearnerSnapshot learner, PlanSnapshot plan, List<FocusSnapshot> focus,
            Map<String, MasterySnapshot> mastery, Map<String, RecallSnapshot> recall) { }
}
