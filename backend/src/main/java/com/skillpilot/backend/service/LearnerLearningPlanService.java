package com.skillpilot.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.service.learningplan.PlanBalanceInputs;
import com.skillpilot.backend.service.learningplan.PlanBalanceResult;
import com.skillpilot.backend.service.learningplan.UnifiedLearningPlanStatusCalculator;
import com.skillpilot.backend.service.learningplan.UnifiedLearningPlanStatusFormatter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.TreeMap;
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
    private static final int PREVIEW_DAYS = 7;
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
    private final LandscapeService landscapeService;
    private final Clock clock;

    @Autowired
    public LearnerLearningPlanService(
            LearnerLearningPlanRepository plans,
            LearnerService learners,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            LandscapeService landscapeService) {
        this(
                plans,
                learners,
                objectMapper,
                eventPublisher,
                landscapeService,
                Clock.system(PLAN_ZONE));
    }

    LearnerLearningPlanService(
            LearnerLearningPlanRepository plans,
            LearnerService learners,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            LandscapeService landscapeService,
            Clock clock) {
        this.plans = plans;
        this.learners = learners;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.landscapeService = landscapeService;
        this.clock = clock;
    }

    /**
     * Returns one backend-formulated period balance per subject using its captured
     * plan goals, current mastery and real completion events. Invalid part plans
     * make their subject unavailable; authorized continuation remains independent.
     */
    @Transactional
    public LearnerPlanTodayStatus getTodayStatus(
            String skillpilotId,
            String communicationLocale) {
        // The same learner lock used by mastery, preference and plan writes gives this
        // read a coherent snapshot. Locking never changes learner state or activity.
        learners.acquireLearningPlanMutationLock(skillpilotId);
        Learner learner = learners.getLearner(skillpilotId);
        return calculateStatus(skillpilotId, learner,
                plans.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId),
                LocalDate.now(clock.withZone(PLAN_ZONE)), communicationLocale, false);
    }

    private LearnerPlanTodayStatus calculateStatus(
            String skillpilotId, Learner learner, List<LearnerLearningPlan> subjectPlans,
            LocalDate asOf, String communicationLocale, boolean preview) {
        PeriodBasis periodBasis = learner.getLearningPlanPeriodBasis();
        LocalDate periodStart = periodStart(periodBasis, asOf);
        LocalDate periodEnd = periodEnd(periodBasis, asOf);
        // Hosts pass the language stored with their learning session; the WebGUI
        // passes its chosen language. There is no separate learner-language setting.
        String effectiveLocale = normalizeLocale(communicationLocale);

        boolean enabled = Boolean.TRUE.equals(learner.getFollowLearningPlans());
        String activeGoalId = learner.getActiveGoalId();
        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        boolean activeGoalInProgress = activeGoalId != null
                && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) < MASTERY_THRESHOLD;

        // One balance per subject: every plan of the same subject is merged before the
        // calculation, so a goal shared by two plans counts once and its earliest valid
        // scheduled date wins. The stable subject key orders the output identically in
        // every channel.
        Map<String, SubjectAggregate> bySubject = new TreeMap<>();
        int unavailablePlanCount = 0;
        int unidentifiedPlanCount = 0;
        for (LearnerLearningPlan plan : subjectPlans) {
            String subjectKey = stableSubjectKey(plan.getLandscapeId());
            Optional<String> label = localizedSubjectLabel(plan.getLandscapeId(), effectiveLocale);
            if (subjectKey == null || label.isEmpty()) {
                unavailablePlanCount++;
                unidentifiedPlanCount++;
                continue;
            }
            SubjectAggregate aggregate = bySubject.computeIfAbsent(
                    subjectKey, key -> new SubjectAggregate(key, label.get()));
            aggregate.addPlan(plan.getLandscapeId());
            Optional<PlanEvaluation> evaluation = evaluatePlan(
                    skillpilotId,
                    plan,
                    asOf,
                    periodBasis,
                    periodStart,
                    periodEnd,
                    enabled,
                    activeGoalInProgress ? activeGoalId : null);
            if (evaluation.isEmpty()) {
                unavailablePlanCount++;
                aggregate.markUnevaluable();
                continue;
            }
            aggregate.merge(evaluation.get());
        }

        // Missing plans do not create invented subject balances. An explicitly requested
        // personal-curriculum continuation remains independently available.
        boolean personalContinuationAvailable = false;
        if (enabled) {
            for (String landscapeId : learners.getPersonalCurriculumSubjectIds(skillpilotId)) {
                String subjectKey = stableSubjectKey(landscapeId);
                SubjectAggregate aggregate = subjectKey == null ? null : bySubject.get(subjectKey);
                if (aggregate != null && (aggregate.evaluable() || aggregate.canContinue())) continue;
                if (firstPersonalCurriculumGoal(skillpilotId, landscapeId).isPresent()) {
                    personalContinuationAvailable = true;
                    if (aggregate != null) aggregate.allowContinuation();
                }
                if (aggregate != null && activeGoalInProgress
                        && landscapeId.equals(landscapeService.getLandscapeIdForGoal(activeGoalId))) {
                    aggregate.markCurrent();
                }
            }
        }

        Map<String, Instant> periodCompletions = periodBasis == PeriodBasis.WEEK
                ? learners.getGoalCompletionsBetween(skillpilotId, periodStart, periodEnd)
                : learners.getGoalCompletionsOnDate(skillpilotId, asOf);

        List<LearnerPlanTodayStatus.SubjectStatus> subjects = new ArrayList<>();
        List<String> subjectLines = new ArrayList<>();
        List<String> unavailableSubjectLabels = new ArrayList<>();
        boolean resumeAvailable = !activeGoalInProgress && personalContinuationAvailable;
        for (SubjectAggregate aggregate : bySubject.values()) {
            LearnerPlanTodayStatus.SubjectStatus subject = aggregate.toSubjectStatus(
                    periodBasis, periodStart, periodEnd, mastery, periodCompletions, effectiveLocale);
            subjects.add(subject);
            if (subject.subjectLine() != null && !subject.subjectLine().isBlank()) {
                subjectLines.add(subject.subjectLine());
            }
            if (!subject.evaluable() && !unavailableSubjectLabels.contains(subject.subjectLabel())) {
                unavailableSubjectLabels.add(subject.subjectLabel());
            }
            if (!activeGoalInProgress && aggregate.resumable()) {
                resumeAvailable = true;
            }
        }

        LearnerPlanTodayStatus.ActiveGoal activeGoal = null;
        if (activeGoalInProgress) {
            com.skillpilot.backend.landscape.LearningGoal goal =
                    landscapeService.getGoalDefinition(activeGoalId);
            String title = localizedGoalTitle(goal, effectiveLocale);
            if (title != null) {
                activeGoal = new LearnerPlanTodayStatus.ActiveGoal(
                        activeGoalId, title,
                        UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement(title, effectiveLocale));
            }
        }

        String noticeText = UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(
                unavailableSubjectLabels, effectiveLocale);
        String unidentifiedNotice = UnifiedLearningPlanStatusFormatter.formatUnidentifiedPlansNotice(
                unidentifiedPlanCount, effectiveLocale);
        if (!unidentifiedNotice.isBlank()) {
            noticeText = noticeText.isBlank() ? unidentifiedNotice : noticeText + "\n" + unidentifiedNotice;
        }
        if (subjectPlans.isEmpty()) {
            noticeText = UnifiedLearningPlanStatusFormatter.formatNoPlansNotice(effectiveLocale);
        }
        String statusText = String.join("\n", subjectLines);
        if (!noticeText.isBlank()) {
            statusText = statusText.isBlank() ? noticeText : statusText + "\n" + noticeText;
        }

        List<LearnerPlanTodayStatus.SubjectStatus> evaluated = subjects.stream()
                .filter(LearnerPlanTodayStatus.SubjectStatus::evaluable)
                .toList();
        boolean evaluable = !subjects.isEmpty() && unavailablePlanCount == 0
                && subjects.stream().allMatch(LearnerPlanTodayStatus.SubjectStatus::evaluable);
        boolean periodQuotaFulfilled = evaluated.stream()
                .allMatch(subject -> subject.balance().offenesPeriodenpensum() == 0);

        boolean automaticResume = !preview && enabled && !activeGoalInProgress && firstCandidateAcrossPlans(
                skillpilotId, subjectPlans, asOf, mastery, false).isPresent();

        return new LearnerPlanTodayStatus(
                asOf,
                periodBasis,
                periodStart,
                periodEnd,
                PLAN_ZONE.getId(),
                effectiveLocale,
                evaluable,
                statusText,
                noticeText,
                periodQuotaFulfilled,
                activeGoal,
                enabled,
                resumeAvailable,
                List.copyOf(subjects),
                unavailablePlanCount,
                automaticResume);
    }

    /**
     * Reads one plan's schedule and capabilities for the shared subject balance.
     *
     * <p>Returns empty when the plan cannot be evaluated reliably. Such a plan never
     * contributes a partial balance to its subject: a subject with an unevaluable part
     * plan must not appear to have a complete one.</p>
     */
    /** The goal title in the session language, as the localized landscape presents it. */
    private static String localizedGoalTitle(
            com.skillpilot.backend.landscape.LearningGoal goal, String locale) {
        if (goal == null) {
            return null;
        }
        boolean english = locale != null && locale.trim().toLowerCase(Locale.ROOT).startsWith("en");
        if (english && goal.getTitleEn() != null && !goal.getTitleEn().isBlank()) {
            return goal.getTitleEn().trim();
        }
        return goal.getTitle() != null && !goal.getTitle().isBlank() ? goal.getTitle().trim() : null;
    }

    private Optional<PlanEvaluation> evaluatePlan(
            String skillpilotId,
            LearnerLearningPlan plan,
            LocalDate asOf,
            PeriodBasis periodBasis,
            LocalDate periodStart,
            LocalDate periodEnd,
            boolean enabled,
            String activeGoalId) {
        final Evaluation evaluation;
        try {
            evaluation = summarize(
                    skillpilotId,
                    plan,
                    asOf,
                    periodBasis,
                    periodStart,
                    periodEnd,
                    enabled,
                    activeGoalId);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) {
                throw exception;
            }
            return Optional.empty();
        } catch (IllegalStateException | NullPointerException exception) {
            return Optional.empty();
        }
        LearnerLearningPlanApi.PlanSummary summary = evaluation.summary();
        if (summary.stale()) {
            return Optional.empty();
        }

        final Map<String, LocalDate> dueDates;
        try {
            dueDates = scheduledAtomicGoalDueDatesForSchedule(evaluation.blocks());
        } catch (IllegalStateException | NullPointerException exception) {
            return Optional.empty();
        }
        Set<String> plannedGoalIds = atomicIds(evaluation.blocks());

        return Optional.of(new PlanEvaluation(
                dueDates,
                plannedGoalIds,
                enabled && summary.nextEligibleGoal() != null,
                summary.canContinue(),
                activeGoalId != null && (plannedGoalIds.contains(activeGoalId)
                        || plan.getLandscapeId().equals(
                                landscapeService.getLandscapeIdForGoal(activeGoalId)))));
    }

    /** Stable subject identity: the landscape's canonical subject, never its translated label. */
    private String stableSubjectKey(String landscapeId) {
        return stableSubjectKey(landscapeService.getById(landscapeId));
    }

    static String stableSubjectKey(SkillLandscape landscape) {
        String subject = landscape == null ? null : optionalLabel(landscape.getSubject());
        return subject == null ? null : subject.toLowerCase(Locale.ROOT);
    }

    static LocalDate periodStart(PeriodBasis basis, LocalDate asOf) {
        return basis == PeriodBasis.WEEK
                ? asOf.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)) : asOf;
    }

    static LocalDate periodEnd(PeriodBasis basis, LocalDate asOf) {
        return basis == PeriodBasis.WEEK
                ? asOf.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)) : asOf;
    }

    private static String normalizeLocale(String locale) {
        if (locale == null || locale.isBlank()) return "de";
        String language = Locale.forLanguageTag(locale.trim()).getLanguage();
        if (!"de".equals(language) && !"en".equals(language)) {
            throw badRequest("language must be de or en");
        }
        return language;
    }

    private Optional<String> localizedSubjectLabel(
            String landscapeId,
            String communicationLocale) {
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null) {
            return Optional.empty();
        }
        String subject = optionalLabel(landscape.getSubject());
        if (subject == null) {
            return Optional.empty();
        }
        if (communicationLocale == null
                || !communicationLocale.trim().toLowerCase(Locale.ROOT).startsWith("en")) {
            return Optional.ofNullable(sanitizedSubjectLabel(subject));
        }
        return Optional.ofNullable(sanitizedSubjectLabel(switch (subject.toLowerCase(Locale.ROOT)) {
            case "mathematik" -> "Mathematics";
            case "physik" -> "Physics";
            case "chemie" -> "Chemistry";
            case "biologie" -> "Biology";
            case "informatik" -> "Computer Science";
            case "wirtschaftswissenschaften" -> "Economics";
            case "politik und wirtschaft" -> "Politics and Economics";
            case "deutsch" -> "German";
            case "englisch" -> "English";
            case "französisch" -> "French";
            case "latein" -> "Latin";
            case "geschichte" -> "History";
            default -> subject;
        }));
    }

    /**
     * Keeps control characters out of the binding status text.
     *
     * <p>The text itself is now the payload every channel quotes, so the label has to be
     * safe where it enters the text, not only where a projection copies it out again.</p>
     */
    private static String sanitizedSubjectLabel(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
        return cleaned.isEmpty() ? null : cleaned.substring(0, Math.min(cleaned.length(), 120));
    }

    private static String optionalLabel(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    @Transactional
    public LearnerLearningPlanApi.CollectionResponse getPlans(
            String skillpilotId, LocalDate requestedAsOf) {
        return getPlans(skillpilotId, requestedAsOf, null);
    }

    @Transactional
    public LearnerLearningPlanApi.CollectionResponse getPlans(
            String skillpilotId, LocalDate requestedAsOf, String communicationLocale) {
        learners.acquireLearningPlanMutationLock(skillpilotId);
        LocalDate asOf = asOf(requestedAsOf);
        Learner learner = learners.getLearner(skillpilotId);
        boolean enabled = Boolean.TRUE.equals(learner.getFollowLearningPlans());
        List<LearnerLearningPlan> storedPlans = plans
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId);
        LearnerPlanTodayStatus status = calculateStatus(
                skillpilotId, learner, storedPlans, asOf, communicationLocale, false);
        List<LearnerLearningPlanApi.PlanSummary> summaries = storedPlans.stream()
                .map(plan -> safeSummary(skillpilotId, plan, asOf, enabled, learner.getActiveGoalId()))
                .filter(Objects::nonNull)
                .toList();
        return new LearnerLearningPlanApi.CollectionResponse(asOf, enabled, summaries, status);
    }

    private LearnerLearningPlanApi.PlanSummary safeSummary(
            String skillpilotId, LearnerLearningPlan plan, LocalDate asOf,
            boolean enabled, String activeGoalId) {
        try {
            return summarize(skillpilotId, plan, asOf, enabled, activeGoalId).summary();
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) throw exception;
            return null;
        } catch (IllegalStateException | NullPointerException exception) {
            // The status retains this subject's unavailability. Corrupt details are
            // omitted instead of fabricating schedule dates or buffer values.
            return null;
        }
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
        try {
            Evaluation evaluation = summarize(
                    skillpilotId,
                    plan,
                    asOf(requestedAsOf),
                    Boolean.TRUE.equals(learner.getFollowLearningPlans()),
                    learner.getActiveGoalId());
            return detail(evaluation.summary(), evaluation.blocks());
        } catch (IllegalStateException | NullPointerException exception) {
            // Match today's unavailable-plan handling; a corrupt schedule must
            // not prevent a separately authorized personal-curriculum fallback.
            throw conflict("Stored learning plan cannot be evaluated");
        }
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

    /** Drafts use the live calculation with today's known mastery, never predicted completions. */
    @Transactional
    public LearnerLearningPlanApi.PreviewResponse previewPlans(
            String skillpilotId, LearnerLearningPlanApi.ActivateRequest request) {
        return previewPlans(skillpilotId, request, null);
    }

    @Transactional
    public LearnerLearningPlanApi.PreviewResponse previewPlans(
            String skillpilotId, LearnerLearningPlanApi.ActivateRequest request,
            String communicationLocale) {
        if (request == null) throw badRequest("request is required");
        learners.acquireLearningPlanMutationLock(skillpilotId);
        LocalDate asOf = LocalDate.now(clock.withZone(PLAN_ZONE));
        if (request.asOf() != null && !asOf.equals(request.asOf())) {
            throw badRequest("asOf for preview must equal the current server date in Europe/Berlin");
        }
        LinkedHashMap<String, LearnerLearningPlanApi.ActivationPlan> requestedByLandscape =
                requestedActivationPlans(request);
        Learner learner = learners.getLearner(skillpilotId);
        assertNoCurrentStoredPlanIsHidden(skillpilotId, requestedByLandscape.keySet());
        List<LearnerLearningPlan> drafts = requestedByLandscape.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> preparePlan(skillpilotId, learner, entry.getKey(),
                        entry.getValue().expectedRevision(), entry.getValue().planLabel(),
                        entry.getValue().blocks(), false))
                .map(this::previewPlan)
                .toList();
        List<LearnerLearningPlanApi.PreviewDay> days = new ArrayList<>();
        for (int offset = 0; offset < PREVIEW_DAYS; offset++) {
            LocalDate date = asOf.plusDays(offset);
            days.add(new LearnerLearningPlanApi.PreviewDay(date,
                    calculateStatus(skillpilotId, learner, drafts, date, communicationLocale, true)));
        }
        return new LearnerLearningPlanApi.PreviewResponse(asOf, List.copyOf(days));
    }

    private LearnerLearningPlan previewPlan(PreparedPlan prepared) {
        LearnerLearningPlan draft = new LearnerLearningPlan();
        draft.setId(prepared.existing().map(LearnerLearningPlan::getId).orElse(null));
        draft.setLearner(prepared.learner());
        draft.setLandscapeId(prepared.landscapeId());
        draft.setCurriculumId(prepared.scope().curriculumId());
        draft.setScopeFingerprint(prepared.fingerprint());
        draft.setRevision(prepared.existing().map(LearnerLearningPlan::getRevision).orElse(0L));
        draft.setPlanLabel(prepared.planLabel());
        draft.setBlocksJson(writeBlocks(prepared.blocks()));
        draft.setCapturedAt(prepared.scope().capturedAt());
        return draft;
    }

    @Transactional
    public LearnerLearningPlanApi.ActivateResponse activatePlans(
            String skillpilotId,
            LearnerLearningPlanApi.ActivateRequest request) {
        if (request == null) {
            throw badRequest("request is required");
        }
        LocalDate asOf = requireCurrentMutationDate(request.asOf(), "activation");
        LinkedHashMap<String, LearnerLearningPlanApi.ActivationPlan> requestedByLandscape =
                requestedActivationPlans(request);

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

    private LinkedHashMap<String, LearnerLearningPlanApi.ActivationPlan> requestedActivationPlans(
            LearnerLearningPlanApi.ActivateRequest request) {
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

        return requestedByLandscape;
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
                boolean current = learners.isLearningPlanCompatible(
                        skillpilotId, stored.getCurriculumId(), stored.getLandscapeId(), blocks);
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
        DueGoal dueGoal = firstExplicitContinuationGoal(skillpilotId, plan.getLandscapeId(), blocks,
                periodEnd(learner.getLearningPlanPeriodBasis(), asOf), mastery)
                .orElseThrow(() -> conflict("No open personal-curriculum goal is currently on the learner frontier"));
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
        return reconcileInternal(skillpilotId, request, false);
    }

    /** Explicitly requested continuation may select voluntary extra work. */
    @Transactional
    public LearnerLearningPlanApi.TransitionResponse resumeExplicitly(
            String skillpilotId,
            LearnerLearningPlanApi.ReconcileRequest request) {
        return reconcileInternal(skillpilotId, request, true);
    }

    /** Subject-name resolution has already been authorized by the coach facade. */
    @Transactional
    public LearnerLearningPlanApi.TransitionResponse switchPersonalCurriculumSubject(
            String skillpilotId, String landscapeId) {
        learners.acquireLearningPlanMutationLock(skillpilotId);
        if (!Boolean.TRUE.equals(learners.getLearner(skillpilotId).getFollowLearningPlans())
                || !learners.getPersonalCurriculumSubjectIds(skillpilotId).contains(landscapeId)) {
            throw conflict("Subject is not in the current personal curriculum");
        }
        DueGoal goal = firstPersonalCurriculumGoal(skillpilotId, landscapeId)
                .orElseThrow(() -> conflict("No open personal-curriculum goal is currently on the learner frontier"));
        return applyPersonalCurriculumContinuation(skillpilotId, landscapeId, goal,
                "LEARNING_PLAN_SUBJECT_SWITCH");
    }

    private LearnerLearningPlanApi.TransitionResponse applyPersonalCurriculumContinuation(
            String skillpilotId, String landscapeId, DueGoal goal, String changeType) {
        var result = learners.applyLearningPlanTransition(skillpilotId, false, true,
                goal.focusGoalId(), goal.atomicGoalId(), true, changeType);
        return new LearnerLearningPlanApi.TransitionResponse(null, null, landscapeId,
                goal.focusGoalId(), goal.atomicGoalId(), result.changed(), result.state());
    }

    private LearnerLearningPlanApi.TransitionResponse reconcileInternal(
            String skillpilotId,
            LearnerLearningPlanApi.ReconcileRequest request,
            boolean allowExtra) {
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
                false,
                allowExtra);
        boolean parkedCompletedPointer = previousActiveGoalId != null && !previousActiveGoalId.isBlank();
        if (selected.isEmpty() && allowExtra) {
            for (String landscapeId : learners.getPersonalCurriculumSubjectIds(skillpilotId)) {
                Optional<DueGoal> goal = firstPersonalCurriculumGoal(skillpilotId, landscapeId);
                if (goal.isPresent()) {
                    return applyPersonalCurriculumContinuation(skillpilotId, landscapeId, goal.get(),
                            "LEARNING_PLAN_RECONCILED");
                }
            }
        }
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
        DueGoal selected = firstExplicitContinuationGoal(skillpilotId, plan.getLandscapeId(), blocks,
                periodEnd(learner.getLearningPlanPeriodBasis(), asOf), mastery)
                .orElseThrow(() -> conflict("No open personal-curriculum goal is currently on the learner frontier"));

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
        return preparePlan(skillpilotId, learner, landscapeId, requestedRevision,
                requestedPlanLabel, requestedBlocks, true);
    }

    private PreparedPlan preparePlan(
            String skillpilotId,
            Learner learner,
            String landscapeId,
            Long requestedRevision,
            String requestedPlanLabel,
            List<LearnerLearningPlanApi.Block> requestedBlocks,
            boolean forUpdate) {
        long expectedRevision = requireExpectedRevision(requestedRevision);
        String planLabel = optionalText(requestedPlanLabel, "planLabel", 160);
        LearnerPlanningScopeResponse scope = learners.getPlanningScope(skillpilotId, landscapeId);
        Optional<LearnerLearningPlan> existing = forUpdate
                ? plans.findForUpdate(skillpilotId, landscapeId)
                : plans.findByLearner_SkillpilotIdAndLandscapeId(skillpilotId, landscapeId);
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
        if (!learners.isLearningPlanCompatible(
                skillpilotId, plan.getCurriculumId(), plan.getLandscapeId(), blocks)) {
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
        return firstCandidateAcrossPlans(skillpilotId, candidatePlans, asOf, mastery, failOnInvalidPlan, false);
    }

    private Optional<PlanGoalCandidate> firstCandidateAcrossPlans(
            String skillpilotId,
            List<LearnerLearningPlan> candidatePlans,
            LocalDate asOf,
            Map<String, Double> mastery,
            boolean failOnInvalidPlan,
            boolean allowExtra) {
        List<PlanGoalCandidate> candidates = new ArrayList<>();
        List<PlanGoalCandidate> furtherLearning = new ArrayList<>();
        Learner learner = learners.getLearner(skillpilotId);
        PeriodBasis periodBasis = learner.getLearningPlanPeriodBasis();
        LocalDate periodStart = periodStart(periodBasis, asOf);
        LocalDate periodEnd = periodEnd(periodBasis, asOf);
        Map<String, List<LearnerLearningPlanApi.Block>> validBlocks = new LinkedHashMap<>();
        Map<String, Set<String>> goalsBySubject = new LinkedHashMap<>();
        Map<String, Map<String, LocalDate>> datesBySubject = new LinkedHashMap<>();
        Set<String> unavailableSubjects = new HashSet<>();
        Map<String, Instant> completions = periodBasis == PeriodBasis.WEEK
                ? learners.getGoalCompletionsBetween(skillpilotId, periodStart, periodEnd)
                : learners.getGoalCompletionsOnDate(skillpilotId, asOf);
        for (LearnerLearningPlan plan : candidatePlans) {
            String subjectKey = stableSubjectKey(plan.getLandscapeId());
            if (subjectKey == null) continue;
            try {
                List<LearnerLearningPlanApi.Block> blocks = requireCurrentBlocks(skillpilotId, plan);
                Map<String, LocalDate> dueDates = scheduledAtomicGoalDueDatesForSchedule(blocks);
                validBlocks.put(plan.getLandscapeId(), blocks);
                goalsBySubject.computeIfAbsent(subjectKey, key -> new LinkedHashSet<>()).addAll(atomicIds(blocks));
                Map<String, LocalDate> merged = datesBySubject.computeIfAbsent(subjectKey, key -> new LinkedHashMap<>());
                dueDates.forEach((id, date) -> merged.merge(id, date,
                        (left, right) -> left.isBefore(right) ? left : right));
            } catch (ResponseStatusException exception) {
                if (failOnInvalidPlan || exception.getStatusCode().is5xxServerError()) throw exception;
                unavailableSubjects.add(subjectKey);
            } catch (IllegalStateException | NullPointerException exception) {
                if (failOnInvalidPlan) throw exception;
                unavailableSubjects.add(subjectKey);
            }
        }
        for (LearnerLearningPlan plan : candidatePlans) {
            List<LearnerLearningPlanApi.Block> blocks = validBlocks.get(plan.getLandscapeId());
            if (blocks == null) continue;
            String subjectKey = stableSubjectKey(plan.getLandscapeId());
            // An invalid part plan must not leave an apparently complete subject quota.
            // Explicit continuation remains independent of the unavailable balance.
            if (unavailableSubjects.contains(subjectKey) && !allowExtra) continue;
            PlanBalanceResult balance = calculateBalance(goalsBySubject.get(subjectKey),
                    datesBySubject.get(subjectKey), periodStart, periodEnd, mastery, completions);
            boolean quotaComplete = balance.offenesPeriodenpensum() == 0;
            if (quotaComplete && !allowExtra) continue;
            Optional<DueGoal> due = firstEligibleDueGoal(skillpilotId, blocks, periodEnd, mastery);
            if (due.isPresent()) {
                // With explicit authorization, an earlier open goal keeps its priority
                // even when advance work has already covered this subject's quota.
                candidates.add(new PlanGoalCandidate(plan, due.get()));
            } else if (allowExtra) {
                firstExplicitContinuationGoal(skillpilotId, plan.getLandscapeId(), blocks, periodEnd, mastery)
                        .ifPresent(goal -> furtherLearning.add(new PlanGoalCandidate(plan, goal)));
            }
        }
        return (!candidates.isEmpty() ? candidates : furtherLearning)
                .stream().min(planCandidateComparator());
    }

    private static Comparator<PlanGoalCandidate> planCandidateComparator() {
        return Comparator
                .comparing(
                        (PlanGoalCandidate candidate) -> candidate.dueGoal().scheduledDate(),
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        candidate -> candidate.dueGoal().blockEndDate(),
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
        Learner learner = learners.getLearner(skillpilotId);
        PeriodBasis periodBasis = learner.getLearningPlanPeriodBasis();
        LocalDate periodStart = periodStart(periodBasis, asOf);
        LocalDate periodEnd = periodEnd(periodBasis, asOf);
        return summarize(
                skillpilotId,
                plan,
                asOf,
                periodBasis,
                periodStart,
                periodEnd,
                enabled,
                activeGoalId);
    }

    private Evaluation summarize(
            String skillpilotId,
            LearnerLearningPlan plan,
            LocalDate asOf,
            PeriodBasis periodBasis,
            LocalDate periodStart,
            LocalDate periodEnd,
            boolean enabled,
            String activeGoalId) {
        List<LearnerLearningPlanApi.Block> blocks = readBlocks(plan);
        boolean stale = true;
        try {
            stale = !learners.isLearningPlanCompatible(
                    skillpilotId, plan.getCurriculumId(), plan.getLandscapeId(), blocks);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) {
                throw exception;
            }
            stale = true;
        }

        Map<String, Double> mastery = learners.getMastery(skillpilotId);
        LocalDate continuationCutoff = periodBasis == PeriodBasis.WEEK ? periodEnd : asOf;
        Optional<DueGoal> eligible = !stale
                ? firstExplicitContinuationGoal(skillpilotId, plan.getLandscapeId(), blocks, continuationCutoff, mastery)
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

        // Plan details describe the schedule only. The learning-plan status itself is
        // formulated once, per subject, in getTodayStatus; a second per-plan wording
        // here would compete with it as soon as a subject has more than one plan.
        LearnerLearningPlanApi.PlanSummary summary = new LearnerLearningPlanApi.PlanSummary(
                plan.getId(),
                plan.getRevision(),
                plan.getLandscapeId(),
                plan.getPlanLabel(),
                stale,
                period(blocks),
                currentBlock(blocks, asOf).orElse(null),
                nextMilestone(blocks, asOf).orElse(null),
                buffer(blocks, asOf),
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

    private Optional<DueGoal> firstPersonalCurriculumGoal(String skillpilotId, String landscapeId) {
        return learners.getPersonalCurriculumSubjectFrontier(skillpilotId, landscapeId).stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .findFirst().map(goal -> new DueGoal(goal.id(), goal.id(), null, null));
    }

    /** A schedule orders explicit further learning; dates never deny it. */
    private Optional<DueGoal> firstExplicitContinuationGoal(
            String skillpilotId, String landscapeId, List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf, Map<String, Double> mastery) {
        Optional<DueGoal> due = firstEligibleDueGoal(skillpilotId, blocks, asOf, mastery);
        if (due.isPresent()) {
            return due;
        }
        // Reuse the exact block-focus frontier with all scheduled slots exposed.
        // This changes selection only, never dates, quota counts or completion events.
        LocalDate scheduleEnd = blocks.stream().filter(block -> "learning".equals(block.kind()))
                .map(LearnerLearningPlanApi.Block::endDate).max(LocalDate::compareTo).orElse(asOf);
        Optional<DueGoal> planned = firstEligibleDueGoal(skillpilotId, blocks, scheduleEnd, mastery);
        if (planned.isPresent()) {
            return planned;
        }
        return firstPersonalCurriculumGoal(skillpilotId, landscapeId);
    }

    static Optional<DueGoal> firstEligibleDueGoal(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf,
            Map<String, Double> mastery,
            Function<List<String>, Set<String>> frontierIdsForFocus) {
        Map<String, LocalDate> dueDates = scheduledAtomicGoalDueDatesForSchedule(blocks);
        LinkedHashSet<String> alreadyDue = new LinkedHashSet<>();
        List<DueGoal> candidates = new ArrayList<>();
        for (DueBlock dueBlock : dueLearningBlocks(blocks, asOf)) {
            LearnerLearningPlanApi.Block block = dueBlock.block();
            List<String> openDueInBlock = dueBlock.atomicGoalIds().stream()
                    .filter(alreadyDue::add)
                    .filter(goalId -> mastery.getOrDefault(goalId, 0.0) < MASTERY_THRESHOLD)
                    .toList();
            if (openDueInBlock.isEmpty()) continue;
            if (block.goalId() != null && !block.goalId().isBlank()) {
                Set<String> frontierIds = frontierIdsForFocus.apply(List.of(block.goalId()));
                for (String goalId : openDueInBlock) {
                    if (frontierIds.contains(goalId)) candidates.add(new DueGoal(
                            goalId, block.goalId(), block.startDate(), block.endDate(), dueDates.get(goalId)));
                }
            } else {
                for (String goalId : openDueInBlock) {
                    if (frontierIdsForFocus.apply(List.of(goalId)).contains(goalId)) {
                        candidates.add(new DueGoal(goalId, goalId, block.startDate(), block.endDate(),
                                dueDates.get(goalId)));
                    }
                }
            }
        }
        return candidates.stream().min(Comparator.comparing(DueGoal::scheduledDate)
                .thenComparing(DueGoal::blockEndDate).thenComparing(DueGoal::blockStartDate));
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

    /**
     * Returns the exact cumulative due assignment used by learner-plan runtime
     * evaluation. Package visibility lets plan-order validation reuse the same
     * rounding semantics without exposing the internal due-block model.
     */
    static List<String> dueAtomicGoalIdsForSchedule(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        LinkedHashSet<String> due = new LinkedHashSet<>();
        for (DueBlock dueBlock : dueLearningBlocks(blocks, asOf)) {
            due.addAll(dueBlock.atomicGoalIds());
        }
        return List.copyOf(due);
    }

    /**
     * Returns the immutable global due-slot assignment for one cutoff date.
     *
     * <p>The global rounded target count is monotone. Each newly available slot
     * is assigned to the earliest-ending started block and consumes exactly the
     * next atom of that block. Consequently, later evaluations only extend the
     * due prefixes; an atom that was due can never disappear again.</p>
     */
    private static List<DueBlock> dueLearningBlocks(
            List<LearnerLearningPlanApi.Block> blocks,
            LocalDate asOf) {
        LearningDueSchedule schedule = learningDueSchedule(blocks);
        List<DueBlock> dueBlocks = new ArrayList<>();
        for (ScheduledDueBlock scheduledBlock : schedule.blocks()) {
            int dueCount = 0;
            while (dueCount < scheduledBlock.dueDates().size()
                    && !scheduledBlock.dueDates().get(dueCount).isAfter(asOf)) {
                dueCount++;
            }
            dueBlocks.add(new DueBlock(
                    scheduledBlock.block(),
                    scheduledBlock.block().atomicGoalIds().stream().limit(dueCount).toList()));
        }
        return List.copyOf(dueBlocks);
    }

    /**
     * Actual per-goal due dates used by runtime evaluation. Package visibility
     * keeps prerequisite validation on the same schedule instead of a separate
     * block-local approximation.
     */
    static Map<String, LocalDate> scheduledAtomicGoalDueDatesForSchedule(
            List<LearnerLearningPlanApi.Block> blocks) {
        LinkedHashMap<String, LocalDate> dueDates = new LinkedHashMap<>();
        for (ScheduledDueBlock scheduledBlock : learningDueSchedule(blocks).blocks()) {
            List<String> atomicGoalIds = scheduledBlock.block().atomicGoalIds();
            for (int index = 0; index < atomicGoalIds.size(); index++) {
                dueDates.merge(atomicGoalIds.get(index), scheduledBlock.dueDates().get(index),
                        (left, right) -> left.isBefore(right) ? left : right);
            }
        }
        return Map.copyOf(dueDates);
    }

    private static LearningDueSchedule learningDueSchedule(
            List<LearnerLearningPlanApi.Block> blocks) {
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

        List<ScheduledBlockState> states = new ArrayList<>();
        for (IndexedBlock indexedBlock : indexedLearningBlocks) {
            LearnerLearningPlanApi.Block block = indexedBlock.block();
            int size = block.atomicGoalIds().size();
            if (size == 0) {
                states.add(new ScheduledBlockState(
                        indexedBlock,
                        null,
                        null,
                        0));
                continue;
            }
            int totalWorkdays = workdaysInclusive(block.startDate(), block.endDate());
            if (totalWorkdays == 0) {
                throw new IllegalStateException("learning block must contain a workday");
            }
            LocalDate firstWorkday = firstPlanWorkday(block.startDate());
            LocalDate lastWorkday = lastPlanWorkday(block.endDate());
            if (firstWorkday.isAfter(lastWorkday)) {
                throw new IllegalStateException("learning block must contain a workday");
            }
            states.add(new ScheduledBlockState(
                    indexedBlock,
                    firstWorkday,
                    lastWorkday,
                    totalWorkdays));
        }

        List<ScheduledBlockState> nonEmptyStates = states.stream()
                .filter(state -> state.size() > 0)
                .toList();
        if (!nonEmptyStates.isEmpty()) {
            assignGlobalDueSlots(nonEmptyStates);
        }

        List<ScheduledDueBlock> scheduledBlocks = states.stream()
                .map(state -> new ScheduledDueBlock(
                        state.block(),
                        List.copyOf(state.dueDates())))
                .toList();
        return new LearningDueSchedule(scheduledBlocks);
    }

    private static void assignGlobalDueSlots(List<ScheduledBlockState> states) {
        LocalDate lastScheduleDate = states.stream()
                .map(ScheduledBlockState::lastWorkday)
                .max(LocalDate::compareTo)
                .orElseThrow();
        TreeMap<LocalDate, ScheduleBoundary> boundaries = new TreeMap<>();
        for (ScheduledBlockState state : states) {
            boundaries.computeIfAbsent(state.firstWorkday(), ignored -> new ScheduleBoundary())
                    .starts().add(state);
            if (state.lastWorkday().isBefore(lastScheduleDate)) {
                LocalDate stopDate = addPlanWorkdays(state.lastWorkday(), 1);
                boundaries.computeIfAbsent(stopDate, ignored -> new ScheduleBoundary())
                        .stops().add(state);
            }
        }

        Comparator<ScheduledBlockState> earliestDeadlineFirst = Comparator
                .comparing((ScheduledBlockState state) -> state.block().endDate())
                .thenComparing(state -> state.block().startDate())
                .thenComparingInt(ScheduledBlockState::originalIndex)
                .thenComparing(state -> state.block().id());
        PriorityQueue<ScheduledBlockState> eligible = new PriorityQueue<>(earliestDeadlineFirst);
        LinkedHashSet<ScheduledBlockState> active = new LinkedHashSet<>();
        List<LocalDate> boundaryDates = List.copyOf(boundaries.keySet());
        double cumulativeExpectedBefore = 0.0;
        long roundedBefore = 0L;

        for (int boundaryIndex = 0; boundaryIndex < boundaryDates.size(); boundaryIndex++) {
            LocalDate segmentStart = boundaryDates.get(boundaryIndex);
            ScheduleBoundary boundary = boundaries.get(segmentStart);
            for (ScheduledBlockState stopped : boundary.stops()) {
                active.remove(stopped);
                if (stopped.assignedCount() != stopped.size()) {
                    throw new IllegalStateException("global due-slot schedule missed a block deadline");
                }
            }
            for (ScheduledBlockState started : boundary.starts()) {
                active.add(started);
                eligible.add(started);
            }

            LocalDate segmentEnd = boundaryIndex + 1 < boundaryDates.size()
                    ? addPlanWorkdays(boundaryDates.get(boundaryIndex + 1), -1)
                    : lastScheduleDate;
            if (segmentEnd.isBefore(segmentStart)) {
                continue;
            }
            int segmentWorkdays = workdaysInclusive(segmentStart, segmentEnd);
            double dailyExpected = 0.0;
            for (ScheduledBlockState state : states) {
                if (active.contains(state)) {
                    dailyExpected += (double) state.size() / state.totalWorkdays();
                }
            }
            double cumulativeExpectedEnd = cumulativeExpectedBefore
                    + dailyExpected * segmentWorkdays;
            long roundedEnd = Math.round(cumulativeExpectedEnd + 1e-9);
            for (long slot = roundedBefore + 1L; slot <= roundedEnd; slot++) {
                int ordinal = earliestSegmentOrdinal(
                        slot,
                        cumulativeExpectedBefore,
                        dailyExpected,
                        segmentWorkdays);
                LocalDate dueDate = addPlanWorkdays(segmentStart, ordinal - 1L);
                ScheduledBlockState state = nextEligibleBlock(eligible);
                state.assign(dueDate);
                if (state.assignedCount() < state.size()) {
                    eligible.add(state);
                }
            }
            cumulativeExpectedBefore = cumulativeExpectedEnd;
            roundedBefore = roundedEnd;
        }

        int totalGoals = states.stream().mapToInt(ScheduledBlockState::size).sum();
        if (roundedBefore != totalGoals
                || states.stream().anyMatch(state -> state.assignedCount() != state.size())) {
            throw new IllegalStateException("global due-slot schedule is incomplete");
        }
    }

    private static int earliestSegmentOrdinal(
            long slot,
            double expectedBefore,
            double dailyExpected,
            int segmentWorkdays) {
        if (!(dailyExpected > 0.0)) {
            throw new IllegalStateException("global due-slot schedule has no eligible capacity");
        }
        double threshold = slot - 0.5 - 1e-9;
        int ordinal = (int) Math.ceil((threshold - expectedBefore) / dailyExpected);
        ordinal = Math.max(1, Math.min(segmentWorkdays, ordinal));
        while (ordinal > 1
                && Math.round(expectedBefore + dailyExpected * (ordinal - 1L) + 1e-9)
                        >= slot) {
            ordinal--;
        }
        while (ordinal <= segmentWorkdays
                && Math.round(expectedBefore + dailyExpected * ordinal + 1e-9) < slot) {
            ordinal++;
        }
        if (ordinal > segmentWorkdays) {
            throw new IllegalStateException("global due-slot date could not be resolved");
        }
        return ordinal;
    }

    private static ScheduledBlockState nextEligibleBlock(
            PriorityQueue<ScheduledBlockState> eligible) {
        ScheduledBlockState state = eligible.poll();
        while (state != null && state.assignedCount() >= state.size()) {
            state = eligible.poll();
        }
        if (state == null) {
            throw new IllegalStateException("global due-slot schedule has no started block");
        }
        return state;
    }

    private static LocalDate firstPlanWorkday(LocalDate date) {
        LocalDate result = date;
        while (result.getDayOfWeek() == DayOfWeek.SATURDAY
                || result.getDayOfWeek() == DayOfWeek.SUNDAY) {
            result = result.plusDays(1);
        }
        return result;
    }

    private static LocalDate lastPlanWorkday(LocalDate date) {
        LocalDate result = date;
        while (result.getDayOfWeek() == DayOfWeek.SATURDAY
                || result.getDayOfWeek() == DayOfWeek.SUNDAY) {
            result = result.minusDays(1);
        }
        return result;
    }

    private static LocalDate addPlanWorkdays(LocalDate date, long offset) {
        if (offset == 0L) {
            return date;
        }
        long direction = offset > 0L ? 1L : -1L;
        long remaining = Math.abs(offset);
        LocalDate result = date.plusWeeks(direction * (remaining / 5L));
        remaining %= 5L;
        while (remaining > 0L) {
            result = result.plusDays(direction);
            DayOfWeek day = result.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                remaining--;
            }
        }
        return result;
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

    private static Set<String> atomicIds(List<LearnerLearningPlanApi.Block> blocks) {
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
        } catch (JsonProcessingException | NullPointerException exception) {
            throw conflict("Stored learning-plan blocks are invalid");
        }
    }

    private LocalDate asOf(LocalDate requested) {
        return requested == null ? LocalDate.now(clock.withZone(PLAN_ZONE)) : requested;
    }

    private LocalDate requireCurrentMutationDate(LocalDate requested, String action) {
        LocalDate current = LocalDate.now(clock.withZone(PLAN_ZONE));
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
                summary.buffer(),
                summary.nextEligibleGoal(),
                summary.continueReason(),
                summary.canContinue(),
                blocks);
    }

    /**
     * The one quantitative balance, over an already merged subject goal set.
     *
     * <p>S counts plan goals scheduled through the end of the period, P those newly due
     * within it, I every currently mastered plan goal regardless of its date, and H the
     * distinct goals actually completed within the period that are still mastered.</p>
     */
    static PlanBalanceResult calculateBalance(
            Set<String> plannedGoalIds,
            Map<String, LocalDate> dueDates,
            LocalDate periodStart,
            LocalDate periodEnd,
            Map<String, Double> mastery,
            Map<String, Instant> periodCompletions) {
        Objects.requireNonNull(plannedGoalIds, "plan goal set");
        Objects.requireNonNull(dueDates, "plan due dates");
        Objects.requireNonNull(mastery, "mastery snapshot");
        Objects.requireNonNull(periodCompletions, "completion snapshot");
        if (periodStart == null || periodEnd == null || periodEnd.isBefore(periodStart)
                || !plannedGoalIds.equals(dueDates.keySet()) || dueDates.values().stream().anyMatch(Objects::isNull)) {
            throw new IllegalArgumentException("Plan goals, due dates and period must form one valid basis");
        }
        int s = 0;
        int p = 0;
        for (LocalDate dueDate : dueDates.values()) {
            if (dueDate.isAfter(periodEnd)) {
                continue;
            }
            s++;
            if (!dueDate.isBefore(periodStart)) {
                p++;
            }
        }
        int i = (int) plannedGoalIds.stream()
                .filter(id -> mastery.getOrDefault(id, 0.0) >= MASTERY_THRESHOLD)
                .count();
        int h = (int) periodCompletions.entrySet().stream()
                .filter(entry -> plannedGoalIds.contains(entry.getKey()))
                .filter(entry -> entry.getValue() != null)
                .filter(entry -> {
                    LocalDate completedOn = entry.getValue().atZone(PLAN_ZONE).toLocalDate();
                    return !completedOn.isBefore(periodStart) && !completedOn.isAfter(periodEnd);
                })
                .filter(entry -> mastery.getOrDefault(entry.getKey(), 0.0) >= MASTERY_THRESHOLD)
                .count();
        return UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(s, p, i, h));
    }

    /**
     * Projects the current period's existing balance into a dial. A zero target has no
     * meaningful needle position; it remains distinct from an unavailable plan status.
     */
    static LearnerPlanTodayStatus.PeriodGauge periodGauge(PlanBalanceResult balance) {
        Objects.requireNonNull(balance, "plan balance");
        int completed = balance.erfuelltesPeriodenziel();
        int target = completed + balance.offenesPeriodenpensum();
        return new LearnerPlanTodayStatus.PeriodGauge(
                completed, target, target == 0 ? null : (double) completed / target);
    }

    /**
     * Typical positive quota of the complete, merged subject schedule. Empty days or weeks
     * do not erase the scale. For an even number of scheduled periods, the mean of the two
     * central quotas is rounded up to a whole progress-effective goal.
     */
    static Integer typicalPeriodAmount(Map<String, LocalDate> dueDates, PeriodBasis periodBasis) {
        Objects.requireNonNull(dueDates, "plan due dates");
        Objects.requireNonNull(periodBasis, "period basis");
        Map<LocalDate, Integer> periodCounts = new LinkedHashMap<>();
        for (LocalDate dueDate : dueDates.values()) {
            Objects.requireNonNull(dueDate, "plan due date");
            LocalDate period = periodBasis == PeriodBasis.WEEK
                    ? dueDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                    : dueDate;
            periodCounts.merge(period, 1, Integer::sum);
        }
        if (periodCounts.isEmpty()) {
            return null;
        }
        List<Integer> positiveQuotas = periodCounts.values().stream().sorted().toList();
        int upperIndex = positiveQuotas.size() / 2;
        if (positiveQuotas.size() % 2 == 1) {
            return positiveQuotas.get(upperIndex);
        }
        int lower = positiveQuotas.get(upperIndex - 1);
        int upper = positiveQuotas.get(upperIndex);
        return lower + (upper - lower + 1) / 2;
    }

    /** The authoritative signed balance and bounded needle position for one subject. */
    static LearnerPlanTodayStatus.BalanceGauge balanceGauge(
            PlanBalanceResult balance,
            Map<String, LocalDate> dueDates,
            PeriodBasis periodBasis) {
        Objects.requireNonNull(balance, "plan balance");
        Integer typicalAmount = typicalPeriodAmount(dueDates, periodBasis);
        if (typicalAmount == null) {
            return null;
        }
        long scaleLimit = 2L * typicalAmount;
        int net = balance.vorsprung() - balance.rueckstand();
        // The red extreme is strict (> 2M behind), whereas dark green starts at >= 2M.
        // With integral goals, 2M+1 is the first point at the negative needle stop.
        double divisor = net < 0 ? scaleLimit + 1.0 : scaleLimit;
        double needlePosition = Math.max(-1.0, Math.min(1.0, net / divisor));
        return new LearnerPlanTodayStatus.BalanceGauge(
                net,
                typicalAmount,
                scaleLimit,
                needlePosition,
                net < -scaleLimit,
                net >= scaleLimit);
    }

    /** One plan's contribution to its subject: merged schedule and capabilities. */
    private record PlanEvaluation(
            Map<String, LocalDate> dueDates,
            Set<String> plannedGoalIds,
            boolean canContinue,
            boolean resumable,
            boolean current) {
    }

    /**
     * Collects every plan of one subject so a single balance can be calculated from the
     * merged goal set. A goal shared by several plans counts once, with its earliest date.
     */
    private static final class SubjectAggregate {

        private final String subjectKey;
        private final String subjectLabel;
        private final List<String> landscapeIds = new ArrayList<>();
        private final Map<String, LocalDate> dueDates = new LinkedHashMap<>();
        private final Set<String> plannedGoalIds = new LinkedHashSet<>();
        private boolean evaluable = true;
        private boolean canContinue;
        private boolean resumable;
        private boolean current;

        SubjectAggregate(String subjectKey, String subjectLabel) {
            this.subjectKey = subjectKey;
            this.subjectLabel = subjectLabel;
        }

        void addPlan(String landscapeId) {
            landscapeIds.add(landscapeId);
        }

        void markUnevaluable() {
            evaluable = false;
        }

        void markCurrent() {
            current = true;
        }

        void allowContinuation() {
            canContinue = true;
            resumable = true;
        }

        boolean resumable() {
            return resumable;
        }

        boolean evaluable() {
            return evaluable;
        }

        boolean canContinue() {
            return canContinue;
        }

        void merge(PlanEvaluation evaluation) {
            evaluation.dueDates().forEach((goalId, dueDate) -> dueDates.merge(
                    goalId, dueDate, (left, right) -> left.isBefore(right) ? left : right));
            plannedGoalIds.addAll(evaluation.plannedGoalIds());
            canContinue |= evaluation.canContinue();
            resumable |= evaluation.resumable();
            current |= evaluation.current();
        }

        LearnerPlanTodayStatus.SubjectStatus toSubjectStatus(
                PeriodBasis periodBasis,
                LocalDate periodStart,
                LocalDate periodEnd,
                Map<String, Double> mastery,
                Map<String, Instant> periodCompletions,
                String locale) {
            // An ambiguous subject fails closed for switching: a switch must never guess
            // which plan of a subject the learner meant.
            boolean switchable = canContinue && landscapeIds.size() == 1;
            if (!evaluable) {
                return new LearnerPlanTodayStatus.SubjectStatus(
                        List.copyOf(landscapeIds), subjectKey, subjectLabel, false,
                        null, null, null, null, current, switchable, null, null, null);
            }
            PlanBalanceResult balance = calculateBalance(
                    plannedGoalIds, dueDates, periodStart, periodEnd, mastery, periodCompletions);
            return new LearnerPlanTodayStatus.SubjectStatus(
                    List.copyOf(landscapeIds),
                    subjectKey,
                    subjectLabel,
                    true,
                    UnifiedLearningPlanStatusFormatter.formatPeriodText(periodBasis, balance, locale),
                    UnifiedLearningPlanStatusFormatter.formatPlanStatusText(balance, locale),
                    UnifiedLearningPlanStatusFormatter.formatSubjectLine(
                            subjectLabel, periodBasis, balance, locale),
                    balance.statusDirection(),
                    current,
                    switchable,
                    periodGauge(balance),
                    balanceGauge(balance, dueDates, periodBasis),
                    balance);
        }
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
            LocalDate blockEndDate,
            LocalDate scheduledDate) {
        DueGoal(String atomicGoalId, String focusGoalId, LocalDate blockStartDate, LocalDate blockEndDate) {
            this(atomicGoalId, focusGoalId, blockStartDate, blockEndDate, null);
        }
    }

    private record DueBlock(LearnerLearningPlanApi.Block block, List<String> atomicGoalIds) {
    }

    private record LearningDueSchedule(List<ScheduledDueBlock> blocks) {
    }

    private record ScheduledDueBlock(
            LearnerLearningPlanApi.Block block,
            List<LocalDate> dueDates) {
    }

    private static final class ScheduledBlockState {
        private final IndexedBlock indexedBlock;
        private final LocalDate firstWorkday;
        private final LocalDate lastWorkday;
        private final int totalWorkdays;
        private final List<LocalDate> dueDates = new ArrayList<>();

        private ScheduledBlockState(
                IndexedBlock indexedBlock,
                LocalDate firstWorkday,
                LocalDate lastWorkday,
                int totalWorkdays) {
            this.indexedBlock = indexedBlock;
            this.firstWorkday = firstWorkday;
            this.lastWorkday = lastWorkday;
            this.totalWorkdays = totalWorkdays;
        }

        private int originalIndex() {
            return indexedBlock.originalIndex();
        }

        private LearnerLearningPlanApi.Block block() {
            return indexedBlock.block();
        }

        private int size() {
            return block().atomicGoalIds().size();
        }

        private LocalDate firstWorkday() {
            return firstWorkday;
        }

        private LocalDate lastWorkday() {
            return lastWorkday;
        }

        private int totalWorkdays() {
            return totalWorkdays;
        }

        private List<LocalDate> dueDates() {
            return dueDates;
        }

        private int assignedCount() {
            return dueDates.size();
        }

        private void assign(LocalDate dueDate) {
            dueDates.add(dueDate);
        }
    }

    private static final class ScheduleBoundary {
        private final List<ScheduledBlockState> starts = new ArrayList<>();
        private final List<ScheduledBlockState> stops = new ArrayList<>();

        private List<ScheduledBlockState> starts() {
            return starts;
        }

        private List<ScheduledBlockState> stops() {
            return stops;
        }
    }
}
