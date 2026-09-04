package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import org.springframework.http.HttpStatus;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Owns learner-side plan persistence and plan-to-learning transitions. */
@Service
public class LearnerLearningPlanService {

    static final double MASTERY_THRESHOLD = 0.9;
    private static final int MAX_BLOCKS = 500;
    private static final int MAX_ATOMIC_IDS = 10_000;
    private static final int MAX_ACTIVATION_PLANS = 50;
    private static final int MAX_BLOCK_TITLE_LENGTH = 500;
    private static final long MAX_BLOCK_SPAN_DAYS = 36_600;
    private static final LocalDate MIN_PLAN_DATE = LocalDate.of(0, 1, 1);
    private static final LocalDate MAX_PLAN_DATE = LocalDate.of(9999, 12, 31);
    private static final ZoneId PLAN_ZONE = ZoneId.of("Europe/Berlin");
    private static final TypeReference<List<LearnerLearningPlanApi.Block>> BLOCK_LIST_TYPE =
            new TypeReference<>() { };

    private final LearnerLearningPlanRepository plans;
    private final LearnerService learners;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    @Autowired
    public LearnerLearningPlanService(
            LearnerLearningPlanRepository plans,
            LearnerService learners,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher) {
        this(plans, learners, objectMapper, eventPublisher, Clock.system(PLAN_ZONE));
    }

    LearnerLearningPlanService(
            LearnerLearningPlanRepository plans,
            LearnerService learners,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            Clock clock) {
        this.plans = plans;
        this.learners = learners;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public LearnerLearningPlanApi.CollectionResponse getPlans(
            String skillpilotId,
            LocalDate requestedAsOf) {
        LocalDate asOf = asOf(requestedAsOf);
        Learner learner = learners.getLearner(skillpilotId);
        boolean enabled = Boolean.TRUE.equals(learner.getFollowLearningPlans());
        List<LearnerLearningPlanApi.PlanSummary> summaries = plans
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId)
                .stream()
                .map(plan -> summarize(
                        skillpilotId,
                        plan,
                        asOf,
                        enabled,
                        learner.getActiveGoalId()).summary())
                .toList();
        return new LearnerLearningPlanApi.CollectionResponse(asOf, enabled, summaries);
    }

    @Transactional(readOnly = true)
    public LearnerLearningPlanApi.PlanDetail getPlan(
            String skillpilotId,
            String landscapeId,
            LocalDate requestedAsOf) {
        String normalizedLandscapeId = requireText(landscapeId, "landscapeId", 255);
        Learner learner = learners.getLearner(skillpilotId);
        LearnerLearningPlan plan = plans
                .findByLearner_SkillpilotIdAndLandscapeId(skillpilotId, normalizedLandscapeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learning plan not found"));
        Evaluation evaluation = summarize(
                skillpilotId,
                plan,
                asOf(requestedAsOf),
                Boolean.TRUE.equals(learner.getFollowLearningPlans()),
                learner.getActiveGoalId());
        return detail(evaluation.summary(), evaluation.blocks());
    }

    @Transactional
    public LearnerLearningPlanApi.PlanDetail upsert(
            String skillpilotId,
            String landscapeId,
            LearnerLearningPlanApi.UpsertRequest request,
            LocalDate requestedAsOf) {
        if (request == null) {
            throw badRequest("request is required");
        }
        String normalizedLandscapeId = requireText(landscapeId, "landscapeId", 255);

        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        PreparedPlan prepared = preparePlan(
                skillpilotId,
                learner,
                normalizedLandscapeId,
                request.expectedRevision(),
                request.planLabel(),
                request.blocks());
        LearnerLearningPlan saved = persistPreparedPlan(prepared);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                skillpilotId,
                "LEARNING_PLAN_UPDATE"));

        Evaluation evaluation = summarize(
                skillpilotId,
                saved,
                asOf(requestedAsOf),
                Boolean.TRUE.equals(learner.getFollowLearningPlans()),
                learner.getActiveGoalId());
        return detail(evaluation.summary(), evaluation.blocks());
    }

    /**
     * Atomically materializes every submitted subject plan and turns the set
     * into the learner's active guided plan package. All revisions, scopes,
     * block foci, and fingerprints are validated before the first row changes.
     */
    @Transactional
    public LearnerLearningPlanApi.ActivateResponse activatePlans(
            String skillpilotId,
            LearnerLearningPlanApi.ActivateRequest request) {
        if (request == null) {
            throw badRequest("request is required");
        }
        LocalDate asOf = requireCurrentMutationDate(request.asOf(), "activation");
        if (request.plans() == null || request.plans().isEmpty()) {
            throw badRequest("plans must not be empty");
        }
        if (request.plans().size() > MAX_ACTIVATION_PLANS) {
            throw badRequest("plans exceeds the supported limit");
        }

        LinkedHashMap<String, LearnerLearningPlanApi.ActivationPlan> requestedByLandscape =
                new LinkedHashMap<>();
        for (LearnerLearningPlanApi.ActivationPlan requested : request.plans()) {
            if (requested == null) {
                throw badRequest("plans must not contain null entries");
            }
            String landscapeId = requireText(requested.landscapeId(), "landscapeId", 255);
            if (requestedByLandscape.putIfAbsent(landscapeId, requested) != null) {
                throw badRequest("landscapeId must be unique within an activation request");
            }
        }

        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        assertNoCurrentStoredPlanIsHidden(skillpilotId, requestedByLandscape.keySet());
        List<PreparedPlan> preparedPlans = requestedByLandscape.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> preparePlan(
                        skillpilotId,
                        learner,
                        entry.getKey(),
                        entry.getValue().expectedRevision(),
                        entry.getValue().planLabel(),
                        entry.getValue().blocks()))
                .toList();

        List<LearnerLearningPlan> savedPlans = new ArrayList<>();
        for (PreparedPlan prepared : preparedPlans) {
            savedPlans.add(persistPreparedPlan(prepared));
        }

        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        String previousActiveGoalId = learner.getActiveGoalId();
        Optional<PlanGoalCandidate> selected = findPreservedActiveCandidate(
                skillpilotId,
                savedPlans,
                previousActiveGoalId,
                mastery);
        if (selected.isEmpty()) {
            selected = firstCandidateAcrossPlans(skillpilotId, savedPlans, asOf, mastery, true);
        }

        LearnerService.LearningPlanTransitionResult transition;
        if (selected.isPresent()) {
            PlanGoalCandidate candidate = selected.get();
            transition = learners.applyLearningPlanTransition(
                    skillpilotId,
                    true,
                    true,
                    candidate.dueGoal().focusGoalId(),
                    candidate.dueGoal().atomicGoalId(),
                    false,
                    "LEARNING_PLAN_PACKAGE_ACTIVATED");
        } else {
            transition = learners.applyLearningPlanTransition(
                    skillpilotId,
                    true,
                    true,
                    null,
                    null,
                    false,
                    "LEARNING_PLAN_PACKAGE_ACTIVATED");
        }

        String effectiveActiveGoalId = selected
                .map(candidate -> candidate.dueGoal().atomicGoalId())
                .orElse(null);
        List<LearnerLearningPlanApi.PlanDetail> details = savedPlans.stream()
                .map(plan -> {
                    Evaluation evaluation = summarize(
                            skillpilotId,
                            plan,
                            asOf,
                            true,
                            effectiveActiveGoalId);
                    return detail(evaluation.summary(), evaluation.blocks());
                })
                .toList();
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                skillpilotId,
                "LEARNING_PLAN_PACKAGE_ACTIVATED"));

        PlanGoalCandidate selectedCandidate = selected.orElse(null);
        return new LearnerLearningPlanApi.ActivateResponse(
                asOf,
                true,
                details,
                selectedCandidate == null ? null : selectedCandidate.plan().getId(),
                selectedCandidate == null ? null : selectedCandidate.plan().getLandscapeId(),
                selectedCandidate == null ? null : selectedCandidate.dueGoal().focusGoalId(),
                effectiveActiveGoalId,
                transition.state());
    }

    private void assertNoCurrentStoredPlanIsHidden(
            String skillpilotId,
            Set<String> requestedLandscapeIds) {
        List<String> omittedCurrentPlans = new ArrayList<>();
        for (LearnerLearningPlan stored : plans
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId)) {
            if (requestedLandscapeIds.contains(stored.getLandscapeId())) {
                continue;
            }
            try {
                List<LearnerLearningPlanApi.Block> blocks = readBlocks(stored);
                boolean current = Objects.equals(
                        stored.getScopeFingerprint(),
                        learners.learningPlanFingerprint(
                                skillpilotId,
                                stored.getLandscapeId(),
                                blocks));
                if (current) {
                    omittedCurrentPlans.add(stored.getLandscapeId());
                }
            } catch (ResponseStatusException exception) {
                if (exception.getStatusCode().is5xxServerError()) {
                    throw exception;
                }
                // A no-longer-projectable plan is stale and cannot become a
                // later automatic transition candidate.
            } catch (IllegalStateException exception) {
                // Malformed stored plans fail closed during reconciliation and
                // therefore do not need to block replacement of the live set.
            }
        }
        if (!omittedCurrentPlans.isEmpty()) {
            throw conflict("Activation must include every current stored learning plan: "
                    + String.join(", ", omittedCurrentPlans));
        }
    }

    /** Explicit subject switch; unlike the legacy continue action it may park another goal. */
    @Transactional
    public LearnerLearningPlanApi.TransitionResponse switchPlan(
            String skillpilotId,
            UUID planId,
            LearnerLearningPlanApi.ContinueRequest request) {
        if (request == null) {
            throw badRequest("request is required");
        }
        if (planId == null) {
            throw badRequest("planId is required");
        }
        long expectedRevision = requireExpectedRevision(request.expectedRevision());
        LocalDate asOf = requireCurrentMutationDate(request.asOf(), "switch");

        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        if (!Boolean.TRUE.equals(learner.getFollowLearningPlans())) {
            throw conflict("Following learning plans is not enabled for this learner");
        }
        LearnerLearningPlan plan = requireCurrentPlan(skillpilotId, planId, expectedRevision);
        List<LearnerLearningPlanApi.Block> blocks = requireCurrentBlocks(skillpilotId, plan);
        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        DueGoal dueGoal = firstEligibleDueGoal(skillpilotId, blocks, asOf, mastery)
                .orElseThrow(() -> conflict("No open due atomic goal is currently on the learner frontier"));
        PlanGoalCandidate candidate = new PlanGoalCandidate(plan, dueGoal);

        LearnerService.LearningPlanTransitionResult transition =
                learners.applyLearningPlanTransition(
                        skillpilotId,
                        false,
                        true,
                        dueGoal.focusGoalId(),
                        dueGoal.atomicGoalId(),
                        true,
                        "LEARNING_PLAN_SUBJECT_SWITCH");
        return transition(candidate, dueGoal.atomicGoalId(), transition.changed(), transition.state());
    }

    /**
     * Idempotent explicit repair point used when plan mode is active but no
     * learning goal is selected. Reads remain side-effect free.
     */
    @Transactional
    public LearnerLearningPlanApi.TransitionResponse reconcile(
            String skillpilotId,
            LearnerLearningPlanApi.ReconcileRequest request) {
        if (request == null) {
            throw badRequest("request is required");
        }
        LocalDate asOf = requireCurrentMutationDate(request.asOf(), "reconcile");
        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        String previousActiveGoalId = learner.getActiveGoalId();
        Map<String, Double> mastery = learners.getMastery(skillpilotId);

        if (!Boolean.TRUE.equals(learner.getFollowLearningPlans())
                || (previousActiveGoalId != null
                        && !previousActiveGoalId.isBlank()
                        && mastery.getOrDefault(previousActiveGoalId, 0.0) < MASTERY_THRESHOLD)) {
            return new LearnerLearningPlanApi.TransitionResponse(
                    null,
                    null,
                    null,
                    null,
                    null,
                    false,
                    learners.getCoachLearnerState(skillpilotId));
        }

        List<LearnerLearningPlan> currentPlans = plans
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId);
        Optional<PlanGoalCandidate> selected = firstCandidateAcrossPlans(
                skillpilotId,
                currentPlans,
                asOf,
                mastery,
                false);
        boolean parkedCompletedPointer = previousActiveGoalId != null && !previousActiveGoalId.isBlank();
        if (selected.isEmpty()) {
            LearnerService.LearningPlanTransitionResult transition = parkedCompletedPointer
                    ? learners.applyLearningPlanTransition(
                            skillpilotId,
                            false,
                            true,
                            null,
                            null,
                            true,
                            "LEARNING_PLAN_RECONCILED")
                    : new LearnerService.LearningPlanTransitionResult(
                            false,
                            learners.getCoachLearnerState(skillpilotId));
            return new LearnerLearningPlanApi.TransitionResponse(
                    null,
                    null,
                    null,
                    null,
                    null,
                    transition.changed(),
                    transition.state());
        }

        PlanGoalCandidate candidate = selected.get();
        LearnerService.LearningPlanTransitionResult transition = learners.applyLearningPlanTransition(
                skillpilotId,
                false,
                true,
                candidate.dueGoal().focusGoalId(),
                candidate.dueGoal().atomicGoalId(),
                true,
                "LEARNING_PLAN_RECONCILED");
        return transition(
                candidate,
                candidate.dueGoal().atomicGoalId(),
                transition.changed(),
                transition.state());
    }

    @Transactional
    public LearnerLearningPlanApi.ContinueResponse continuePlan(
            String skillpilotId,
            UUID planId,
            LearnerLearningPlanApi.ContinueRequest request) {
        if (request == null) {
            throw badRequest("request is required");
        }
        long expectedRevision = requireExpectedRevision(request.expectedRevision());
        if (planId == null) {
            throw badRequest("planId is required");
        }
        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        if (!Boolean.TRUE.equals(learner.getFollowLearningPlans())) {
            throw conflict("Following learning plans is not enabled for this learner");
        }

        LearnerLearningPlan plan = requireCurrentPlan(skillpilotId, planId, expectedRevision);
        List<LearnerLearningPlanApi.Block> blocks = requireCurrentBlocks(skillpilotId, plan);
        LocalDate asOf = requireCurrentMutationDate(request.asOf(), "continue");
        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        DueGoal selected = firstEligibleDueGoal(skillpilotId, blocks, asOf, mastery)
                .orElseThrow(() -> conflict("No open due atomic goal is currently on the learner frontier"));

        learners.assertLearningPlanMayActivateGoal(skillpilotId, selected.atomicGoalId());
        learners.setPlannedGoalsAndGetState(skillpilotId, Set.of(selected.focusGoalId()));
        learners.setActiveGoal(skillpilotId, selected.atomicGoalId());
        UnifiedLearnerStateResponse state = learners.getLearnerState(skillpilotId);
        return new LearnerLearningPlanApi.ContinueResponse(
                plan.getId(),
                plan.getRevision(),
                plan.getLandscapeId(),
                selected.focusGoalId(),
                selected.atomicGoalId(),
                state);
    }

    private PreparedPlan preparePlan(
            String skillpilotId,
            Learner learner,
            String landscapeId,
            Long requestedRevision,
            String requestedPlanLabel,
            List<LearnerLearningPlanApi.Block> requestedBlocks) {
        long expectedRevision = requireExpectedRevision(requestedRevision);
        String planLabel = optionalText(requestedPlanLabel, "planLabel", 160);
        LearnerPlanningScopeResponse scope = learners.getPlanningScope(skillpilotId, landscapeId);
        Optional<LearnerLearningPlan> existing = plans.findForUpdate(skillpilotId, landscapeId);
        if (existing.isEmpty() && expectedRevision != 0) {
            throw conflict("expectedRevision must be 0 when creating a learning plan");
        }
        if (existing.isPresent() && existing.get().getRevision() != expectedRevision) {
            throw conflict("Learning plan revision conflict");
        }

        List<LearnerLearningPlanApi.Block> existingBlocks = existing
                .map(this::readBlocks)
                .orElseGet(List::of);
        List<LearnerLearningPlanApi.Block> normalizedBlocks = normalizeBlocks(
                requestedBlocks,
                scope,
                atomicIds(existingBlocks),
                false);
        learners.validateLearningPlanBlockFoci(skillpilotId, landscapeId, normalizedBlocks);
        normalizedBlocks = learners.orderLearningPlanBlocksByPrerequisites(
                skillpilotId,
                normalizedBlocks);
        String fingerprint = learners.learningPlanFingerprint(
                skillpilotId,
                landscapeId,
                normalizedBlocks);
        return new PreparedPlan(
                learner,
                landscapeId,
                planLabel,
                scope,
                existing,
                normalizedBlocks,
                fingerprint);
    }

    private LearnerLearningPlan persistPreparedPlan(PreparedPlan prepared) {
        LearnerLearningPlan plan = prepared.existing().orElseGet(LearnerLearningPlan::new);
        if (prepared.existing().isEmpty()) {
            plan.setLearner(prepared.learner());
            plan.setLandscapeId(prepared.landscapeId());
            plan.setRevision(1);
        } else {
            plan.setRevision(plan.getRevision() + 1);
        }
        plan.setCurriculumId(prepared.scope().curriculumId());
        plan.setScopeFingerprint(prepared.fingerprint());
        plan.setPlanLabel(prepared.planLabel());
        plan.setBlocksJson(writeBlocks(prepared.blocks()));
        plan.setCapturedAt(prepared.scope().capturedAt());
        try {
            return plans.saveAndFlush(plan);
        } catch (DataIntegrityViolationException exception) {
            if (prepared.existing().isEmpty()) {
                throw conflict("A learning plan for this landscape was created concurrently");
            }
            throw exception;
        }
    }

    private LearnerLearningPlan requireCurrentPlan(
            String skillpilotId,
            UUID planId,
            long expectedRevision) {
        LearnerLearningPlan plan = plans.findByIdForUpdate(skillpilotId, planId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Learning plan not found"));
        if (plan.getRevision() != expectedRevision) {
            throw conflict("Learning plan revision conflict");
        }
        return plan;
    }

    private List<LearnerLearningPlanApi.Block> requireCurrentBlocks(
            String skillpilotId,
            LearnerLearningPlan plan) {
        List<LearnerLearningPlanApi.Block> blocks = readBlocks(plan);
        if (!Objects.equals(
                plan.getScopeFingerprint(),
                learners.learningPlanFingerprint(skillpilotId, plan.getLandscapeId(), blocks))) {
            throw conflict("The personal curriculum changed after this learning plan was captured");
        }
        return blocks;
    }

    private Optional<PlanGoalCandidate> findPreservedActiveCandidate(
            String skillpilotId,
            List<LearnerLearningPlan> activatedPlans,
            String activeGoalId,
            Map<String, Double> mastery) {
        if (activeGoalId == null
                || activeGoalId.isBlank()
                || mastery.getOrDefault(activeGoalId, 0.0) >= MASTERY_THRESHOLD) {
            return Optional.empty();
        }
        List<PlanGoalCandidate> candidates = new ArrayList<>();
        for (LearnerLearningPlan plan : activatedPlans) {
            for (LearnerLearningPlanApi.Block block : readBlocks(plan)) {
                if ("learning".equals(block.kind())
                        && block.atomicGoalIds() != null
                        && block.atomicGoalIds().contains(activeGoalId)) {
                    String focusGoalId = block.goalId() == null || block.goalId().isBlank()
                            ? activeGoalId
                            : block.goalId();
                    boolean remainsEligible = learners.getUncompactedRichFrontierForFocus(
                                    skillpilotId,
                                    List.of(focusGoalId))
                            .stream()
                            .filter(goal -> "atomic".equals(goal.type()))
                            .anyMatch(goal -> activeGoalId.equals(goal.id()));
                    if (!remainsEligible) {
                        continue;
                    }
                    candidates.add(new PlanGoalCandidate(
                            plan,
                            new DueGoal(
                                    activeGoalId,
                                    focusGoalId,
                                    block.startDate(),
                                    block.endDate())));
                }
            }
        }
        return candidates.stream().min(planCandidateComparator());
    }

    private Optional<PlanGoalCandidate> firstCandidateAcrossPlans(
            String skillpilotId,
            List<LearnerLearningPlan> candidatePlans,
            LocalDate asOf,
            Map<String, Double> mastery,
            boolean failOnInvalidPlan) {
        List<PlanGoalCandidate> candidates = new ArrayList<>();
        for (LearnerLearningPlan plan : candidatePlans) {
            try {
                List<LearnerLearningPlanApi.Block> blocks = requireCurrentBlocks(skillpilotId, plan);
                firstEligibleDueGoal(skillpilotId, blocks, asOf, mastery)
                        .ifPresent(dueGoal -> candidates.add(new PlanGoalCandidate(plan, dueGoal)));
            } catch (ResponseStatusException exception) {
                if (failOnInvalidPlan || exception.getStatusCode().is5xxServerError()) {
                    throw exception;
                }
            } catch (IllegalStateException exception) {
                if (failOnInvalidPlan) {
                    throw exception;
                }
            }
        }
        return candidates.stream().min(planCandidateComparator());
    }

    private static Comparator<PlanGoalCandidate> planCandidateComparator() {
        return Comparator
                .comparing(
                        (PlanGoalCandidate candidate) -> candidate.dueGoal().blockEndDate(),
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        candidate -> candidate.dueGoal().blockStartDate(),
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        candidate -> candidate.plan().getLandscapeId(),
                        Comparator.nullsLast(String::compareTo))
                .thenComparing(candidate -> candidate.dueGoal().atomicGoalId())
                .thenComparing(candidate -> candidate.plan().getId());
    }

    private static LearnerLearningPlanApi.TransitionResponse transition(
            PlanGoalCandidate candidate,
            String activeGoalId,
            boolean changed,
            UnifiedLearnerStateResponse state) {
        return new LearnerLearningPlanApi.TransitionResponse(
                candidate.plan().getId(),
                candidate.plan().getRevision(),
                candidate.plan().getLandscapeId(),
                candidate.dueGoal().focusGoalId(),
                activeGoalId,
                changed,
                state);
    }

    private Evaluation summarize(
            String skillpilotId,
            LearnerLearningPlan plan,
            LocalDate asOf,
            boolean enabled,
            String activeGoalId) {
        List<LearnerLearningPlanApi.Block> blocks = readBlocks(plan);
        boolean stale = true;
        try {
            stale = !Objects.equals(
                    plan.getScopeFingerprint(),
                    learners.learningPlanFingerprint(skillpilotId, plan.getLandscapeId(), blocks));
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) {
                throw exception;
            }
            stale = true;
        }

        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        List<String> due = dueAtomicGoalIds(blocks, asOf);
        Set<String> dueBeforeToday = Set.copyOf(dueAtomicGoalIds(blocks, asOf.minusDays(1)));
        List<String> dueToday = due.stream()
                .filter(goalId -> !dueBeforeToday.contains(goalId))
                .toList();
        int completed = (int) due.stream()
                .filter(goalId -> mastery.getOrDefault(goalId, 0.0) >= MASTERY_THRESHOLD)
                .count();
        int completedToday = (int) dueToday.stream()
                .filter(goalId -> mastery.getOrDefault(goalId, 0.0) >= MASTERY_THRESHOLD)
                .count();
        int openDue = due.size() - completed;
        int openDueToday = dueToday.size() - completedToday;
        Optional<DueGoal> eligible = !stale
                ? firstEligibleDueGoal(skillpilotId, blocks, asOf, mastery)
                : Optional.empty();
        boolean blockedByActiveGoal = eligible
                .map(next -> isBlockingActiveGoal(activeGoalId, next.atomicGoalId(), mastery))
                .orElse(false);
        boolean canContinue = enabled && !stale && eligible.isPresent() && !blockedByActiveGoal;
        String continueReason = canContinue
                ? null
                : !enabled
                        ? "learning-plan-following-disabled"
                        : stale
                                ? "personal-curriculum-changed"
                                : eligible.isEmpty()
                                        ? "no-open-due-frontier-goal"
                                        : "active-goal-in-progress";

        LearnerLearningPlanApi.PlanSummary summary = new LearnerLearningPlanApi.PlanSummary(
                plan.getId(),
                plan.getRevision(),
                plan.getLandscapeId(),
                plan.getPlanLabel(),
                stale,
                period(blocks),
                currentBlock(blocks, asOf).orElse(null),
                nextMilestone(blocks, asOf).orElse(null),
                new LearnerLearningPlanApi.Metrics(
                        due.size(),
                        completed,
                        openDue,
                        dueToday.size(),
                        completedToday,
                        openDueToday,
                        atomicIds(blocks).size()),
                buffer(blocks, asOf),
                new LearnerLearningPlanApi.Pace(
                        "neutral",
                        "mastery-history-not-event-backed"),
                eligible
                        .map(next -> new LearnerLearningPlanApi.NextEligibleGoal(next.atomicGoalId()))
                        .orElse(null),
                continueReason,
                canContinue);
        return new Evaluation(summary, blocks);
    }

    private Optional<DueGoal> firstEligibleDueGoal(
            String skillpilotId,
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf,
            Map<String, Double> mastery) {
        return firstEligibleDueGoal(
                blocks,
                asOf,
                mastery,
                focusGoalIds -> learners.getUncompactedRichFrontierForFocus(
                                skillpilotId,
                                focusGoalIds)
                        .stream()
                        .filter(goal -> "atomic".equals(goal.type()))
                        .map(FrontierGoal::id)
                        .collect(java.util.stream.Collectors.toSet()));
    }

    static Optional<DueGoal> firstEligibleDueGoal(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf,
            Map<String, Double> mastery,
            Function<List<String>, Set<String>> frontierIdsForFocus) {
        LinkedHashSet<String> alreadyDue = new LinkedHashSet<>();
        for (DueBlock dueBlock : dueLearningBlocks(blocks, asOf)) {
            LearnerLearningPlanApi.Block block = dueBlock.block();
            List<String> openDueInBlock = dueBlock.atomicGoalIds().stream()
                    .filter(alreadyDue::add)
                    .filter(goalId -> mastery.getOrDefault(goalId, 0.0) < MASTERY_THRESHOLD)
                    .toList();
            if (openDueInBlock.isEmpty()) {
                continue;
            }

            if (block.goalId() != null && !block.goalId().isBlank()) {
                Set<String> frontierIds = frontierIdsForFocus.apply(List.of(block.goalId()));
                Optional<String> selected = openDueInBlock.stream()
                        .filter(frontierIds::contains)
                        .findFirst();
                if (selected.isPresent()) {
                    return Optional.of(new DueGoal(
                            selected.get(),
                            block.goalId(),
                            block.startDate(),
                            block.endDate()));
                }
                continue;
            }

            // If a portable block has no authored section focus, the atom is
            // the narrowest valid focus and therefore needs its own projection.
            for (String atomicGoalId : openDueInBlock) {
                boolean eligible = frontierIdsForFocus.apply(List.of(atomicGoalId))
                        .contains(atomicGoalId);
                if (eligible) {
                    return Optional.of(new DueGoal(
                            atomicGoalId,
                            atomicGoalId,
                            block.startDate(),
                            block.endDate()));
                }
            }
        }
        return Optional.empty();
    }

    static List<LearnerLearningPlanApi.Block> normalizeBlocks(
            List<LearnerLearningPlanApi.Block> requested,
            LearnerPlanningScopeResponse scope,
            Set<String> previouslyCaptured,
            boolean preserveAllScopeAtoms) {
        if (requested == null || requested.isEmpty()) {
            throw badRequest("blocks must not be empty");
        }
        if (requested.size() > MAX_BLOCKS) {
            throw badRequest("blocks exceeds the supported limit");
        }
        Set<String> scopeIds = Set.copyOf(scope.scopeAtomicGoalIds());
        Set<String> openIds = Set.copyOf(scope.openAtomicGoalIds());
        LinkedHashSet<String> unknownIds = new LinkedHashSet<>();
        HashSet<String> blockIds = new HashSet<>();
        List<IndexedBlock> indexed = new ArrayList<>();
        int submittedAtoms = 0;

        for (int index = 0; index < requested.size(); index++) {
            LearnerLearningPlanApi.Block raw = requested.get(index);
            if (raw == null) {
                throw badRequest("blocks must not contain null entries");
            }
            String id = requireText(raw.id(), "block.id", 120);
            if (!blockIds.add(id)) {
                throw badRequest("block.id must be unique");
            }
            String kind = requireText(raw.kind(), "block.kind", 20).toLowerCase(Locale.ROOT);
            LearnerLearningPlanApi.Block normalized;
            LocalDate sortDate;
            LocalDate sortEndDate;
            switch (kind) {
                case "learning" -> {
                    LocalDate start = requireDate(raw.startDate(), "block.startDate");
                    LocalDate end = requireDate(raw.endDate(), "block.endDate");
                    requireDateOrder(start, end);
                    if (workdaysInclusive(start, end) == 0) {
                        throw badRequest("learning blocks must contain at least one workday");
                    }
                    if (raw.atomicGoalIds() == null) {
                        throw badRequest("learning block atomicGoalIds is required");
                    }
                    submittedAtoms += raw.atomicGoalIds().size();
                    if (submittedAtoms > MAX_ATOMIC_IDS) {
                        throw badRequest("atomicGoalIds exceeds the supported limit");
                    }
                    List<String> atoms = new ArrayList<>();
                    for (String rawGoalId : raw.atomicGoalIds()) {
                        String goalId = requireText(rawGoalId, "atomicGoalIds entry", 255);
                        if (!scopeIds.contains(goalId)) {
                            unknownIds.add(goalId);
                        } else if (preserveAllScopeAtoms
                                || openIds.contains(goalId)
                                || previouslyCaptured.contains(goalId)) {
                            atoms.add(goalId);
                        }
                    }
                    normalized = new LearnerLearningPlanApi.Block(
                            id,
                            kind,
                            optionalText(raw.goalId(), "block.goalId", 255),
                            optionalText(raw.title(), "block.title", MAX_BLOCK_TITLE_LENGTH),
                            start,
                            end,
                            null,
                            List.copyOf(atoms));
                    sortDate = start;
                    sortEndDate = end;
                }
                case "buffer" -> {
                    LocalDate start = requireDate(raw.startDate(), "block.startDate");
                    LocalDate end = requireDate(raw.endDate(), "block.endDate");
                    requireDateOrder(start, end);
                    normalized = new LearnerLearningPlanApi.Block(
                            id,
                            kind,
                            null,
                            requireText(raw.title(), "block.title", MAX_BLOCK_TITLE_LENGTH),
                            start,
                            end,
                            null,
                            null);
                    sortDate = start;
                    sortEndDate = end;
                }
                case "milestone" -> {
                    LocalDate date = requireDate(raw.date(), "block.date");
                    normalized = new LearnerLearningPlanApi.Block(
                            id,
                            kind,
                            optionalText(raw.goalId(), "block.goalId", 255),
                            requireText(raw.title(), "block.title", MAX_BLOCK_TITLE_LENGTH),
                            null,
                            null,
                            date,
                            null);
                    sortDate = date;
                    sortEndDate = date;
                }
                default -> throw badRequest("block.kind must be learning, buffer, or milestone");
            }
            indexed.add(new IndexedBlock(index, sortDate, sortEndDate, normalized));
        }
        if (!unknownIds.isEmpty()) {
            throw badRequest("Unknown atomicGoalIds: " + String.join(", ", unknownIds));
        }

        indexed.sort(Comparator
                .comparing(IndexedBlock::sortDate)
                .thenComparing(IndexedBlock::sortEndDate)
                .thenComparingInt(IndexedBlock::originalIndex)
                .thenComparing(entry -> entry.block().id()));
        LinkedHashSet<String> seenAtoms = new LinkedHashSet<>();
        List<LearnerLearningPlanApi.Block> normalized = new ArrayList<>();
        for (IndexedBlock entry : indexed) {
            LearnerLearningPlanApi.Block block = entry.block();
            if (!"learning".equals(block.kind())) {
                normalized.add(block);
                continue;
            }
            List<String> deduplicated = block.atomicGoalIds().stream()
                    .filter(seenAtoms::add)
                    .toList();
            normalized.add(new LearnerLearningPlanApi.Block(
                    block.id(),
                    block.kind(),
                    block.goalId(),
                    block.title(),
                    block.startDate(),
                    block.endDate(),
                    null,
                    deduplicated));
        }
        if (seenAtoms.isEmpty()) {
            throw conflict("The plan contains no currently open atomic goals");
        }
        return List.copyOf(normalized);
    }

    private List<String> dueAtomicGoalIds(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        return dueGoals(blocks, asOf).stream().map(DueGoal::atomicGoalId).toList();
    }

    private List<DueGoal> dueGoals(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        LinkedHashSet<String> due = new LinkedHashSet<>();
        List<DueGoal> result = new ArrayList<>();
        for (DueBlock dueBlock : dueLearningBlocks(blocks, asOf)) {
            LearnerLearningPlanApi.Block block = dueBlock.block();
            String blockFocus = block.goalId();
            for (String atomicGoalId : dueBlock.atomicGoalIds()) {
                if (due.add(atomicGoalId)) {
                    result.add(new DueGoal(
                            atomicGoalId,
                            blockFocus == null || blockFocus.isBlank() ? atomicGoalId : blockFocus,
                            block.startDate(),
                            block.endDate()));
                }
            }
        }
        return List.copyOf(result);
    }

    /** Mirrors the teacher planner: accumulate exact equivalents, then round once across blocks. */
    private static List<DueBlock> dueLearningBlocks(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        List<IndexedBlock> indexedLearningBlocks = new ArrayList<>();
        for (int index = 0; index < blocks.size(); index++) {
            LearnerLearningPlanApi.Block block = blocks.get(index);
            if ("learning".equals(block.kind()) && block.atomicGoalIds() != null) {
                indexedLearningBlocks.add(new IndexedBlock(
                        index,
                        block.startDate(),
                        block.endDate(),
                        block));
            }
        }
        indexedLearningBlocks.sort(Comparator
                .comparing(IndexedBlock::sortDate)
                .thenComparing(IndexedBlock::sortEndDate)
                .thenComparingInt(IndexedBlock::originalIndex)
                .thenComparing(entry -> entry.block().id()));
        List<DueBlock> dueBlocks = new ArrayList<>();
        double cumulativeExpected = 0.0;
        int cumulativeRounded = 0;
        for (IndexedBlock indexedBlock : indexedLearningBlocks) {
            LearnerLearningPlanApi.Block block = indexedBlock.block();
            int size = block.atomicGoalIds().size();
            double fraction;
            if (size == 0 || asOf.isBefore(block.startDate())) {
                fraction = 0.0;
            } else if (!asOf.isBefore(block.endDate())) {
                fraction = 1.0;
            } else {
                int total = workdaysInclusive(block.startDate(), block.endDate());
                int elapsed = workdaysInclusive(block.startDate(), asOf);
                fraction = total == 0 ? 0.0 : (double) elapsed / total;
            }
            cumulativeExpected += fraction * size;
            int nextRounded = (int) Math.round(cumulativeExpected + 1e-9);
            int dueCount = Math.max(0, Math.min(size, nextRounded - cumulativeRounded));
            cumulativeRounded += dueCount;
            dueBlocks.add(new DueBlock(block, block.atomicGoalIds().stream().limit(dueCount).toList()));
        }
        return List.copyOf(dueBlocks);
    }

    private LearnerLearningPlanApi.Period period(List<LearnerLearningPlanApi.Block> blocks) {
        LocalDate start = blocks.stream()
                .map(this::blockStart)
                .filter(Objects::nonNull)
                .min(LocalDate::compareTo)
                .orElseThrow(() -> conflict("Learning plan has no dated blocks"));
        LocalDate end = blocks.stream()
                .map(this::blockEnd)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo)
                .orElseThrow(() -> conflict("Learning plan has no dated blocks"));
        return new LearnerLearningPlanApi.Period(start, end);
    }

    private Optional<LearnerLearningPlanApi.CurrentBlock> currentBlock(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        return blocks.stream()
                .filter(block -> !"milestone".equals(block.kind()))
                .filter(block -> !asOf.isBefore(block.startDate()) && !asOf.isAfter(block.endDate()))
                .findFirst()
                .map(block -> new LearnerLearningPlanApi.CurrentBlock(
                        block.id(),
                        block.kind(),
                        displayTitle(block),
                        block.goalId(),
                        block.startDate(),
                        block.endDate()));
    }

    private Optional<LearnerLearningPlanApi.Milestone> nextMilestone(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        return blocks.stream()
                .filter(block -> "milestone".equals(block.kind()))
                .filter(block -> !block.date().isBefore(asOf))
                .findFirst()
                .map(block -> new LearnerLearningPlanApi.Milestone(
                        block.id(), block.title(), block.goalId(), block.date()));
    }

    private LearnerLearningPlanApi.Buffer buffer(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        int total = 0;
        int remaining = 0;
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (!"buffer".equals(block.kind())) {
                continue;
            }
            total += workdaysInclusive(block.startDate(), block.endDate());
            if (asOf.isBefore(block.startDate())) {
                remaining += workdaysInclusive(block.startDate(), block.endDate());
            } else if (!asOf.isAfter(block.endDate())) {
                remaining += workdaysInclusive(asOf, block.endDate());
            }
        }
        return new LearnerLearningPlanApi.Buffer(total, remaining);
    }

    private static String displayTitle(LearnerLearningPlanApi.Block block) {
        if (block.title() != null && !block.title().isBlank()) {
            return block.title();
        }
        if (block.goalId() != null && !block.goalId().isBlank()) {
            return block.goalId();
        }
        return "Lernabschnitt";
    }

    private LocalDate blockStart(LearnerLearningPlanApi.Block block) {
        return "milestone".equals(block.kind()) ? block.date() : block.startDate();
    }

    private LocalDate blockEnd(LearnerLearningPlanApi.Block block) {
        return "milestone".equals(block.kind()) ? block.date() : block.endDate();
    }

    private Set<String> atomicIds(List<LearnerLearningPlanApi.Block> blocks) {
        LinkedHashSet<String> ids = new LinkedHashSet<>();
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (block.atomicGoalIds() != null) {
                ids.addAll(block.atomicGoalIds());
            }
        }
        return Set.copyOf(ids);
    }

    static String scopeFingerprint(LearnerPlanningScopeResponse scope) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(scope.curriculumId().getBytes(StandardCharsets.UTF_8));
            digest.update((byte) '\n');
            digest.update(scope.landscapeId().getBytes(StandardCharsets.UTF_8));
            List<String> sorted = scope.scopeAtomicGoalIds().stream().sorted().toList();
            for (String goalId : sorted) {
                digest.update((byte) '\n');
                digest.update(goalId.getBytes(StandardCharsets.UTF_8));
            }
            return "sha256:" + HexFormat.of().formatHex(digest.digest());
        } catch (Exception exception) {
            throw new IllegalStateException("Could not fingerprint the personal curriculum scope", exception);
        }
    }

    private String writeBlocks(List<LearnerLearningPlanApi.Block> blocks) {
        try {
            return objectMapper.writeValueAsString(blocks);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not persist learning-plan blocks", exception);
        }
    }

    private List<LearnerLearningPlanApi.Block> readBlocks(LearnerLearningPlan plan) {
        try {
            List<LearnerLearningPlanApi.Block> blocks = objectMapper.readValue(
                    plan.getBlocksJson(),
                    BLOCK_LIST_TYPE);
            return blocks == null ? List.of() : List.copyOf(blocks);
        } catch (JsonProcessingException exception) {
            throw conflict("Stored learning-plan blocks are invalid");
        }
    }

    private LocalDate asOf(LocalDate requested) {
        return requested == null ? LocalDate.now(clock) : requested;
    }

    private LocalDate requireCurrentMutationDate(LocalDate requested, String action) {
        LocalDate current = LocalDate.now(clock);
        if (requested != null && !current.equals(requested)) {
            throw badRequest("asOf for " + action
                    + " must equal the current server date in Europe/Berlin");
        }
        return current;
    }

    private static long requireExpectedRevision(Long revision) {
        if (revision == null || revision < 0) {
            throw badRequest("expectedRevision must be zero or positive");
        }
        return revision;
    }

    private static String requireText(String value, String field, int maxLength) {
        String normalized = optionalText(value, field, maxLength);
        if (normalized == null) {
            throw badRequest(field + " is required");
        }
        return normalized;
    }

    private static String optionalText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw badRequest(field + " exceeds the supported length");
        }
        return normalized;
    }

    private static LocalDate requireDate(LocalDate value, String field) {
        if (value == null) {
            throw badRequest(field + " is required");
        }
        if (value.isBefore(MIN_PLAN_DATE) || value.isAfter(MAX_PLAN_DATE)) {
            throw badRequest(field + " must use a four-digit ISO year between 0000 and 9999");
        }
        return value;
    }

    private static void requireDateOrder(LocalDate start, LocalDate end) {
        if (end.isBefore(start)) {
            throw badRequest("block.endDate must not be before block.startDate");
        }
        if (ChronoUnit.DAYS.between(start, end) > MAX_BLOCK_SPAN_DAYS) {
            throw badRequest("a plan block must not span more than 100 years");
        }
    }

    private static int workdaysInclusive(LocalDate start, LocalDate end) {
        if (start == null || end == null || end.isBefore(start)) {
            return 0;
        }
        long inclusiveDays = ChronoUnit.DAYS.between(start, end) + 1;
        long count = (inclusiveDays / 7) * 5;
        int remainder = (int) (inclusiveDays % 7);
        for (int offset = 0; offset < remainder; offset++) {
            DayOfWeek day = start.plusDays(offset).getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        if (count > Integer.MAX_VALUE) {
            throw badRequest("plan block workday count exceeds the supported range");
        }
        return (int) count;
    }

    private static LearnerLearningPlanApi.PlanDetail detail(
            LearnerLearningPlanApi.PlanSummary summary,
            List<LearnerLearningPlanApi.Block> blocks) {
        return new LearnerLearningPlanApi.PlanDetail(
                summary.planId(),
                summary.revision(),
                summary.landscapeId(),
                summary.planLabel(),
                summary.stale(),
                summary.period(),
                summary.currentBlock(),
                summary.nextMilestone(),
                summary.metrics(),
                summary.buffer(),
                summary.pace(),
                summary.nextEligibleGoal(),
                summary.continueReason(),
                summary.canContinue(),
                blocks);
    }

    private static boolean isBlockingActiveGoal(
            String activeGoalId,
            String proposedGoalId,
            Map<String, Double> mastery) {
        return activeGoalId != null
                && !activeGoalId.isBlank()
                && !activeGoalId.equals(proposedGoalId)
                && mastery.getOrDefault(activeGoalId, 0.0) < MASTERY_THRESHOLD;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private record IndexedBlock(
            int originalIndex,
            LocalDate sortDate,
            LocalDate sortEndDate,
            LearnerLearningPlanApi.Block block) {
    }

    private record Evaluation(
            LearnerLearningPlanApi.PlanSummary summary,
            List<LearnerLearningPlanApi.Block> blocks) {
    }

    private record PreparedPlan(
            Learner learner,
            String landscapeId,
            String planLabel,
            LearnerPlanningScopeResponse scope,
            Optional<LearnerLearningPlan> existing,
            List<LearnerLearningPlanApi.Block> blocks,
            String fingerprint) {
    }

    private record PlanGoalCandidate(
            LearnerLearningPlan plan,
            DueGoal dueGoal) {
    }

    record DueGoal(
            String atomicGoalId,
            String focusGoalId,
            LocalDate blockStartDate,
            LocalDate blockEndDate) {
    }

    private record DueBlock(LearnerLearningPlanApi.Block block, List<String> atomicGoalIds) {
    }
}
