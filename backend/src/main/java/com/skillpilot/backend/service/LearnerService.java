package com.skillpilot.backend.service;

import com.skillpilot.backend.api.ActiveGoalContext;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.UnitAssessmentResponse;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.composition.CompositionViewExtensions;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ResolvedGoalMapping;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.util.BundeslandCodeNormalizer;
import org.springframework.context.ApplicationEventPublisher;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Collection;
import java.util.Collections;
import java.util.Deque;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;
import java.io.InputStream;
import org.springframework.stereotype.Service;
import org.springframework.util.function.SingletonSupplier;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.support.SimpleTransactionStatus;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CreateLearnerRequest;
import com.skillpilot.backend.api.ClientStateRequest;
import com.skillpilot.backend.api.ClientStateResponse;
import com.skillpilot.backend.api.ClientStateSnapshot;
import com.skillpilot.backend.api.PortableSrsData;
import com.skillpilot.backend.service.srs.SrsCard;
import com.skillpilot.backend.service.srs.SrsCardRelease;
import com.skillpilot.backend.service.srs.SrsCardSelection;
import com.skillpilot.backend.service.srs.SrsCardStateStore;
import com.skillpilot.backend.service.srs.SrsCardStateSummary;
import com.skillpilot.backend.service.srs.SrsCardStepFacts;
import com.skillpilot.backend.service.srs.SrsDeck;
import com.skillpilot.backend.service.srs.SrsDeckCatalog;
import com.skillpilot.backend.service.srs.SrsPracticeStateGuard;
import com.skillpilot.backend.service.srs.SrsStateUnavailableException;
import com.skillpilot.backend.service.srs.UnitCheckStart;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.FrontierGoal.StudyGuidance;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.service.learningplan.LearningPlanScopeResolver;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.LearnerDataDTO;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeProgress;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import com.skillpilot.backend.api.PlannedGoalsMutationResponse;
import com.skillpilot.backend.api.SignedLearnerDataDTO;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerCard;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchCardResult;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchSavedResult;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import com.fasterxml.jackson.core.type.TypeReference;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import org.springframework.core.io.Resource;

@Service
public class LearnerService {

    private static final int MEMORY_PRACTICE_BATCH_LIMIT = 20;
    private static final double PLANNING_SCOPE_MASTERY_THRESHOLD = Mastery.LEGACY_MASTERED_THRESHOLD;

    private static final Logger LOGGER = LoggerFactory.getLogger(LearnerService.class);
    /** Curriculum and failure code pairs already logged; keeps repeated reads quiet. */
    private final Set<String> reportedSeedScopeFallbacks = java.util.concurrent.ConcurrentHashMap.newKeySet();
    /** Derived once per loaded landscape instance; a reloaded catalog brings new instances. */
    private final Map<SkillLandscape, Set<String>> retiredGoalIdsByLandscape =
            Collections.synchronizedMap(new java.util.WeakHashMap<>());
    private static final ZoneId VERIFIED_RECALL_DAY_ZONE = ZoneId.of("Europe/Berlin");
    private static final ZoneId LEARNING_PLAN_ZONE = ZoneId.of("Europe/Berlin");
    private static final int LEGACY_VERIFIED_RECALL_BATCH_SIZE = 1;
    private static final int DEFAULT_VERIFIED_RECALL_BATCH_SIZE = 10;
    private static final int MAX_VERIFIED_RECALL_BATCH_SIZE = 20;
    private static final int MAX_LEARNING_PLAN_SCHEDULE_CHECK_WORKDAYS = 1_000;
    private static final int MAX_LEARNING_PLAN_REPAIR_ITERATIONS = 64;
    private static final long MAX_LEARNING_PLAN_SCHEDULE_CHECK_OPERATIONS = 50_000_000L;
    private static final int MAX_LEARNING_PLAN_GRAPH_NODES = 100_000;
    private static final int MAX_LEARNING_PLAN_GRAPH_REFERENCES = 1_000_000;
    private static final Object COACH_STATE_REVISION_TRANSACTION_RESOURCE =
            LearnerService.class.getName() + ".coachStateRevision";

    private final LearnerRepository learnerRepository;
    /**
     * The former JSON block per learner and deck goal. Since Liquibase change 047
     * its rows are only the untouched fallback copy of the migration to
     * {@link SrsCardStateStore}; the service neither reads nor writes them.
     */
    @SuppressWarnings("unused")
    private final LearnerClientStateRepository learnerClientStateRepository;
    private final MasteryRepository masteryRepository;
    private final PlannedGoalRepository plannedGoalRepository;
    private final LearnerLearningPlanRepository learnerLearningPlanRepository;
    private final LandscapeService landscapeService;
    private final GoalMappingService goalMappingService;
    private final DeckResourceService deckResourceService;
    private final CompositionViewService compositionViewService;

    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;
    /** Parsed decks shared by all learners of this runtime generation (issue #85). */
    private final SrsDeckCatalog deckCatalog;
    private final CompletionProfileCompiler frontierPrerequisiteCompiler = new CompletionProfileCompiler();
    private Clock verifiedRecallClock = Clock.systemUTC();
    private final com.skillpilot.backend.completion.LearningPlanCompletionProjection planHandoffProjection =
            new com.skillpilot.backend.completion.LearningPlanCompletionProjection();
    private Clock learningPlanClock = Clock.system(LEARNING_PLAN_ZONE);

    @Autowired
    private LearnerGoalCompletionService goalCompletionService;

    @Autowired
    private VerifiedExamPassService verifiedExamPassService;

    @Autowired(required = false)
    private CompletionApplicationService completionApplicationService;

    /** Card states, one row per card; hand-built service fixtures without storage read no state. */
    @Autowired(required = false)
    private SrsCardStateStore cardStateStore;

    @Value("${skillpilot.completion.unit-assessment-pilot-enabled:false}")
    private boolean unitAssessmentPilotEnabled;

    public boolean completionRouteOwnsNavigation(Learner learner) {
        return CompletionNavigationPolicy.ownsNavigation(learner);
    }

    public boolean effectivePlanFollowing(Learner learner) {
        return CompletionNavigationPolicy.followsPlans(learner);
    }

    public boolean supportsCompletionWorkflow() {
        return completionApplicationService != null && completionApplicationService.catalog().available();
    }

    private CompletionWorkflowState completionWorkflow(Learner learner) {
        if (!completionRouteOwnsNavigation(learner)) return null;
        try {
            return objectMapper.readValue(learner.getCompletionWorkflow(), CompletionWorkflowState.class);
        } catch (Exception e) {
            return null; // The route remains paused; malformed private state never opens a bypass.
        }
    }

    private void saveCompletionWorkflow(Learner learner, CompletionWorkflowState state) {
        try {
            learner.setCompletionWorkflow(state == null ? null : objectMapper.writeValueAsString(state));
        } catch (Exception e) {
            throw new IllegalStateException("Cannot serialize completion navigation", e);
        }
    }

    private String completionScopeDigest(Learner learner) {
        try {
            byte[] input = (String.valueOf(learner.getSelectedCurriculum()) + "\n"
                    + String.valueOf(learner.getPersonalCurriculum())).getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(input));
        } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }

    private boolean completionWorkflowMatches(Learner learner, CompletionWorkflowState workflow) {
        CompletionProfileDefinition definition = workflow == null ? null : completionDefinition(learner, workflow.profileId());
        return workflow != null && completionApplicationService != null
                && completionApplicationService.catalog().available()
                && Objects.equals(workflow.curriculumId(), learner.getSelectedCurriculum())
                && Objects.equals(workflow.personalCurriculumDigest(), completionScopeDigest(learner))
                && Objects.equals(workflow.curriculumGeneration(), completionApplicationService.catalog().generation())
                && definition != null && Objects.equals(workflow.profileRevision(), definition.revision());
    }

    private boolean currentDirectAssessmentBinding(Learner learner, CompletionWorkflowState workflow) {
        if (!completionWorkflowMatches(learner, workflow) || workflow.directAssessment() == null
                || !workflow.directAssessment().live(Instant.now())) return false;
        try {
            GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
            var compiled = compileCompletionScope(learner, workflow.profileId(), projection,
                    completionGraph(learner, projection));
            assertCompletionApplicability(learner, compiled);
            return compiled.assessmentGoalIds().contains(workflow.directAssessment().goalId());
        } catch (RuntimeException error) { return false; }
    }

    private boolean preservesDirectAssessment(Learner learner, String goalId) {
        CompletionWorkflowState workflow = completionWorkflow(learner);
        return currentDirectAssessmentBinding(learner, workflow)
                && Objects.equals(goalId, workflow.directAssessment().goalId());
    }

    private boolean ownsDirectAssessment(CompletionCallContext call, CompletionWorkflowState workflow) {
        return call != null && call.supported() && workflow != null && workflow.directAssessment() != null
                && Objects.equals(call.provider(), workflow.directAssessment().provider())
                && Objects.equals(call.sessionBinding(), workflow.directAssessment().sessionBinding());
    }

    /** Ownership is checked for actions, while ordinary cockpit reads may preserve the running goal. */
    public void assertCompletionAssessmentOwner(String skillpilotId, String goalId) {
        Learner learner = getLearner(skillpilotId);
        CompletionWorkflowState workflow = completionWorkflow(learner);
        if (workflow == null || workflow.directAssessment() == null) return;
        CompletionCallContext context = CompletionCallContext.current();
        if (!preservesDirectAssessment(learner, goalId) || context == null || !context.supported()
                || !Objects.equals(context.provider(), workflow.directAssessment().provider())
                || !Objects.equals(context.sessionBinding(), workflow.directAssessment().sessionBinding())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "This assessment belongs to another or expired learning session. Start again deliberately.");
        }
    }

    @org.springframework.beans.factory.annotation.Autowired
    private CompletionCanonicalGraphResolver completionCanonicalGraphResolver;

    private Map<String, LearningGoal> completionCanonicalGraph(String curriculumId) {
        return completionApplicationService.canonicalGraph(curriculumId,
                () -> completionCanonicalGraphResolver.load(curriculumId));
    }

    private static final String AUTOMATIC_COMPLETION_PREFIX = "automatic:";
    private static final String AUTOMATIC_COMPLETION_DEFAULT = AUTOMATIC_COMPLETION_PREFIX + "personal-curriculum";
    private static final String AUTOMATIC_COMPLETION_REVISION = "atomic-prerequisite-learning-v1";

    private Map<String, LearningGoal> completionGraph(Learner learner, GoalProjection projection) {
        if (!completionApplicationService.catalog().automatic())
            return completionCanonicalGraph(learner.getSelectedCurriculum());
        return prerequisiteGraph(learner, projection);
    }

    private Map<String, LearningGoal> prerequisiteGraph(Learner learner, GoalProjection projection) {
        if (projection.learningScope() != null) {
            return applyRequiredUnitEntries(projection.canonicalPrerequisiteGoals(), projection);
        }
        CompletionCanonicalGraphResolver resolver = completionCanonicalGraphResolver != null
                ? completionCanonicalGraphResolver
                : new CompletionCanonicalGraphResolver(landscapeService, objectMapper);
        Set<String> targets = automaticCompletionTargets(AUTOMATIC_COMPLETION_DEFAULT, projection);
        java.util.function.Supplier<Map<String, LearningGoal>> loader = () -> resolver.loadForTargets(
                learner.getSelectedCurriculum(), targets, projection.structuralGoals());
        Map<String, LearningGoal> canonical = completionApplicationService != null
                && completionApplicationService.catalog().available()
                ? completionApplicationService.automaticCanonicalGraph(
                        learner.getSelectedCurriculum() + ":" + completionScopeDigest(learner)
                                + ":" + AUTOMATIC_COMPLETION_REVISION, loader)
                : loader.get();
        return applyAuthoredAtomicEntries(canonical, projection);
    }

    private Map<String, LearningGoal> applyAuthoredAtomicEntries(
            Map<String, LearningGoal> canonical, GoalProjection projection) {
        Map<String, LearningGoal> resolved = new LinkedHashMap<>(canonical);
        // A reviewed direct goalEntry can intentionally make a canonical cluster
        // an atomic target. Apply that authoritative structure, never UI collapse.
        for (String id : projection.targetGoalIds()) {
            LearningGoal visible = projection.visibleGoals().get(id);
            LearningGoal original = canonical.get(id);
            if (visible != null && original != null && isAtomicGoal(visible) && !isAtomicGoal(original)) {
                LearningGoal atomic = objectMapper.convertValue(original, LearningGoal.class);
                atomic.setContains(List.of());
                atomic.setType("atomic");
                resolved.put(id, atomic);
            }
        }
        return applyRequiredUnitEntries(Collections.unmodifiableMap(resolved), projection);
    }

    private record UnitEntryGraphOverlay(Map<String, LearningGoal> source, Set<String> openingIds,
            Map<String, LearningGoal> graph) { }
    private volatile UnitEntryGraphOverlay unitEntryGraphOverlay;

    private Map<String, LearningGoal> applyRequiredUnitEntries(Map<String, LearningGoal> canonical, GoalProjection projection) {
        Set<String> openingIds = Set.copyOf(guidedUnitOrientationScopes(projection).keySet());
        if (openingIds.isEmpty()) return canonical;
        UnitEntryGraphOverlay cached = unitEntryGraphOverlay;
        if (cached != null && cached.source() == canonical && cached.openingIds().equals(openingIds)) return cached.graph();
        Map<String, LearningGoal> resolved = new LinkedHashMap<>(canonical);
        // Unit openings are explicit navigation/completion obligations. This
        // runtime annotation comes from the same validated material binding as
        // entry selection and never changes the retained canonical definition.
        for (String id : openingIds) {
            LearningGoal original = resolved.get(id);
            if (original == null) continue;
            LearningGoal opening = objectMapper.convertValue(original, LearningGoal.class);
            Map<String, Object> metadata = new LinkedHashMap<>(opening.getExtendedData() == null ? Map.of() : opening.getExtendedData());
            metadata.put("skillpilotRequiredUnitEntry", true);
            opening.setExtendedData(metadata);
            resolved.put(id, opening);
        }
        Map<String, LearningGoal> graph = Collections.unmodifiableMap(resolved);
        unitEntryGraphOverlay = new UnitEntryGraphOverlay(canonical, openingIds, graph);
        return graph;
    }

    private Set<String> requiredRegularGoals(GoalProjection projection, Set<String> targets) {
        Set<String> required = new TreeSet<>(projection.extensionPreparations());
        required.retainAll(targets);
        if (unitLearningMaterialService == null) return required;
        for (var binding : unitLearningMaterialService.orientationBindings(projection.compositionViewIds())) {
            var material = unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId());
            if (material.isEmpty()) continue;
            var candidates = material.get().exercises().entrySet().stream()
                    .filter(entry -> entry.getValue().requiredForRegularLearning() && targets.contains(entry.getKey()))
                    .map(Map.Entry::getKey).toList();
            if (candidates.isEmpty()) continue;
            var placed = projectedAtomicTargetIds(List.of(binding.sectionGoalId()), projection);
            for (String id : candidates) {
                var goal = projection.visibleGoals().get(id);
                if (placed.contains(id) && binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id))
                        && isAtomicGoal(goal) && !isExamGoal(goal) && !isSrsGoal(goal) && !isOrientationGoal(goal)) {
                    required.add(id);
                }
            }
        }
        return required;
    }

    private CompletionProfileDefinition automaticCompletionDefinition(String id, GoalProjection projection) {
        if (id == null || !id.startsWith(AUTOMATIC_COMPLETION_PREFIX)) return null;
        Map<String, String> title;
        if (AUTOMATIC_COMPLETION_DEFAULT.equals(id)) {
            title = Map.of("de", "Dein Personal Curriculum", "en", "Your Personal Curriculum");
        } else {
            String root = id.substring(AUTOMATIC_COMPLETION_PREFIX.length());
            if (projectedAtomicTargetIds(List.of(root), projection).isEmpty()) return null;
            var declaredUnit = projection.declaredUnits().focus(root);
            if (declaredUnit != null) {
                String local = declaredUnit.label() == null ? root : declaredUnit.label();
                String english = declaredUnit.labelEn() == null ? local : declaredUnit.labelEn();
                title = Map.of("de", local, "en", english);
            } else if (isCompositionStructureGoalId(root)) {
                var structure = projectedStructure(root, projection);
                if (structure == null || !projection.compositionViewIds().contains(structure.viewId())) return null;
                String label = structure.label() == null || structure.label().isBlank() ? root : structure.label();
                title = Map.of("de", label, "en", label);
            } else {
                LearningGoal goal = projection.visibleGoals().get(root);
                if (goal == null || isAtomicGoal(goal)) return null;
                title = completionTitle(goal);
            }
        }
        return new CompletionProfileDefinition(1, id, AUTOMATIC_COMPLETION_REVISION, title, id,
                Map.of(), List.of(), null, List.of());
    }

    private CompletionProfileDefinition completionDefinition(Learner learner, String id) {
        if (completionApplicationService == null) return null;
        if (!completionApplicationService.catalog().automatic()) return completionApplicationService.catalog().profile(id);
        if (id == null || !id.startsWith(AUTOMATIC_COMPLETION_PREFIX)) return null;
        return automaticCompletionDefinition(id,
                getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum()));
    }

    private Set<String> automaticCompletionTargets(String id, GoalProjection projection) {
        if (AUTOMATIC_COMPLETION_DEFAULT.equals(id)) {
            // The validated learning basis owns completion. A display-pruned unit
            // is navigation, even when none of its children remain visible.
            if (projection.learningScope() != null) {
                return new LinkedHashSet<>(projection.learningScope().learningAtomicGoalIds());
            }
            return projection.targetGoalIds().stream()
                    .filter(goalId -> isAtomicGoal(projection.visibleGoals().get(goalId)))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        String root = id.substring(AUTOMATIC_COMPLETION_PREFIX.length());
        Set<String> targets = new LinkedHashSet<>(projectedAtomicTargetIds(List.of(root), projection));
        addRequiredExtensionPreparations(targets, projection);
        // A reviewed assessment route retains exactly its historical assignment
        // demand. New ordinary openings neither enlarge that claim nor become
        // implicitly completed by its old exam results.
        if (unitLearningMaterialService != null && unitLearningMaterialService.assessmentBindingForReference(root).isPresent()) {
            targets.removeAll(guidedUnitOrientationScopes(projection).keySet());
        }
        return targets;
    }

    private CompiledCompletionProfile compileCompletionScope(Learner learner, String id,
            GoalProjection projection, Map<String, LearningGoal> graph) {
        if (!completionApplicationService.catalog().automatic()) return completionApplicationService.compile(id,
                learner.getSelectedCurriculum(), graph, projection.targetGoalIds());
        CompletionProfileDefinition definition = automaticCompletionDefinition(id, projection);
        if (definition == null) throw new CompletionApplicationService.ScopeNotApplicableException();
        Set<String> targets = automaticCompletionTargets(id, projection);
        // Only the selected unit assessment route has its separately versioned completion terms.
        boolean unitAssessmentRoute = unitPlanningCreditsEnabled() && unitLearningMaterialService != null
                && unitLearningMaterialService.assessmentBindingForReference(id.substring(AUTOMATIC_COMPLETION_PREFIX.length())).isPresent();
        return completionApplicationService.compileAutomatic(definition,
                learner.getSelectedCurriculum() + ":" + completionScopeDigest(learner), graph, targets,
                projection.targetGoalIds(), voluntaryAssessments(id, projection, graph, targets),
                unitAssessmentRoute ? Set.of() : requiredRegularGoals(projection, targets));
    }

    /** An individual assessment offer is optional in a broader assignment and required when explicitly selected. */
    private Set<String> voluntaryAssessments(String profileId, GoalProjection projection,
            Map<String, LearningGoal> graph, Set<String> targets) {
        var optional = new HashSet<>(voluntarySectionAssessments(profileId, projection, graph, targets));
        if (unitLearningMaterialService == null || !unitLearningMaterialService.hasIndividualOfferIn(targets)) return optional;
        var bindings = unitLearningMaterialService.assessmentBindings(projection.compositionViewIds());
        var partIds = bindings.stream().flatMap(binding -> binding.contract().parts().stream())
                .map(UnitAssessmentContract.Part::goalId).collect(Collectors.toSet());
        for (var binding : unitLearningMaterialService.orientationBindings(projection.compositionViewIds())) {
            if (usesMigratedAssessmentPlacements(binding.viewId(), projection)) continue;
            var material = unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId()).orElseThrow();
            for (var offer : material.individualAssessmentOffers()) {
                String id = offer.assessmentGoalId();
                if (!targets.contains(id) || partIds.contains(id) || profileId.equals(AUTOMATIC_COMPLETION_PREFIX + id)) continue;
                var assessment = graph.get(id);
                String target = offer.targetGoalId();
                if (isAtomicGoal(assessment) && CompletionProfileCompiler.isAssessment(assessment) && releasedSectionAssessment(assessment)
                        && binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id))
                        && binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(target))
                        && List.of(target).equals(assessment.getExamData().getCoveredGoalIds())
                        && assessment.getRequires() != null && assessment.getRequires().contains(target)
                        && projectedAtomicTargetIds(List.of(binding.sectionGoalId()), projection).contains(target)) {
                    optional.add(id);
                }
            }
        }
        return optional;
    }

    private Set<String> voluntarySectionAssessments(String profileId, GoalProjection projection,
            Map<String, LearningGoal> graph, Set<String> targets) {
        if (!unitPlanningCreditsEnabled() || unitLearningMaterialService == null
                || !profileId.startsWith(AUTOMATIC_COMPLETION_PREFIX + "composition:")) return Set.of();
        var binding = unitLearningMaterialService.assessmentBindingForReference(
                profileId.substring(AUTOMATIC_COMPLETION_PREFIX.length())).orElse(null);
        if (binding == null || !projection.compositionViewIds().contains(binding.viewId())
                || usesMigratedAssessmentPlacements(binding.viewId(), projection)) return Set.of();
        var policy = unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId())
                .map(UnitLearningMaterialService.Material::sectionAssessmentPolicy).orElse(null);
        if (policy == null || !binding.contract().revision().equals(policy.unitContractRevision())) return Set.of();
        Set<String> required = binding.contract().parts().stream().map(UnitAssessmentContract.Part::goalId).collect(Collectors.toSet());
        var optional = policy.voluntaryAssessmentsFor(binding.viewId());
        if (optional.isEmpty()) return Set.of();
        if (optional.stream().anyMatch(id -> id == null || !targets.contains(id) || required.contains(id)
                || !binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id))
                || !isAtomicGoal(graph.get(id)) || !CompletionProfileCompiler.isAssessment(graph.get(id))
                || !releasedSectionAssessment(graph.get(id)))) return Set.of();
        var unit = validatedUnitAssessment(binding, projection, graph, Map.of(), Set.of());
        return unit != null && unit.response().parts().stream().allMatch(UnitAssessmentResponse.Part::materialCurrent)
                ? Set.copyOf(optional) : Set.of();
    }

    private boolean releasedSectionAssessment(LearningGoal goal) {
        var exam = goal.getExamData();
        return exam != null && "released".equals(exam.getReviewStatus()) && isExamDataReadyForHardCheck(exam);
    }

    /** A section-wide plan includes its required assessments. An explicit additional goal stays required. */
    Set<String> implicitVoluntaryAssessments(Learner learner, List<String> roots, Collection<String> captured) {
        if (learner == null || captured.isEmpty() || unitLearningMaterialService == null || roots.stream().anyMatch(Objects::isNull)) return Set.of();
        if (!unitLearningMaterialService.hasIndividualOfferIn(captured)
                && (!unitPlanningCreditsEnabled() || roots.stream().noneMatch(root -> hasCapturedVoluntaryAssessment(root, captured)))) return Set.of();
        var projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        var graph = completionGraph(learner, projection);
        Set<String> optional = new HashSet<>();
        Set<String> requiredByAnotherRoot = new HashSet<>();
        for (String root : roots) {
            var targets = projectedAtomicTargetIds(List.of(root), projection);
            var choices = voluntaryAssessments(AUTOMATIC_COMPLETION_PREFIX + root, projection, graph, targets);
            optional.addAll(choices);
            targets.stream().filter(id -> !choices.contains(id)).forEach(requiredByAnotherRoot::add);
        }
        optional.removeAll(requiredByAnotherRoot);
        return optional;
    }

    private boolean hasCapturedVoluntaryAssessment(String root, Collection<String> captured) {
        if (root == null || !root.startsWith("composition:")) return false;
        return unitLearningMaterialService.assessmentBindingForReference(root)
                .flatMap(binding -> unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId())
                        .map(UnitLearningMaterialService.Material::sectionAssessmentPolicy)
                        .map(policy -> policy.voluntaryAssessmentsFor(binding.viewId())))
                .stream().flatMap(Collection::stream).anyMatch(captured::contains);
    }

    /** Discovery may rank scopes by focus; the chosen scope itself never depends on subsequent focus changes. */
    private List<CompletionProfileDefinition> automaticCompletionOptions(Learner learner, GoalProjection projection) {
        LinkedHashSet<String> roots = new LinkedHashSet<>(projection.presentationRootGoalIds());
        List<String> focuses = resolveEffectiveProjectedFocusIds(learner, projection);
        for (String viewId : projection.compositionViewIds()) {
            projectedRootOptions(viewId, projection).forEach(scope -> roots.add(scope.syntheticGoalId()));
            for (String focusId : focuses) {
                if (isCompositionStructureGoalId(focusId)) roots.add(focusId);
                projectedFocusAncestors(viewId, focusId, projection)
                        .forEach(scope -> roots.add(scope.syntheticGoalId()));
            }
        }
        List<CompletionProfileDefinition> result = new ArrayList<>();
        CompletionProfileDefinition all = automaticCompletionDefinition(AUTOMATIC_COMPLETION_DEFAULT, projection);
        if (all != null && !automaticCompletionTargets(all.id(), projection).isEmpty()) result.add(all);
        for (String root : roots) {
            CompletionProfileDefinition definition = automaticCompletionDefinition(AUTOMATIC_COMPLETION_PREFIX + root, projection);
            if (definition != null) result.add(definition);
        }
        return List.copyOf(result);
    }

    private Comparator<String> completionAssessmentOrder(Learner learner, GoalProjection projection,
            Map<String, LearningGoal> graph) {
        if (projection == null) return Comparator.naturalOrder();
        List<String> focusRoots = resolveEffectiveProjectedFocusIds(learner, projection);
        Set<String> focused = projectedAtomicTargetIds(focusRoots, projection);
        Set<String> anchors = new LinkedHashSet<>();
        if (learner.getActiveGoalId() != null) anchors.add(learner.getActiveGoalId());
        else focusRoots.stream().filter(id -> isAtomicGoal(graph.get(id))).forEach(anchors::add);
        Set<String> directlyRelated = graph.values().stream()
                .filter(CompletionProfileCompiler::isAssessment)
                .filter(goal -> anchors.contains(goal.getId()) || goal.getRequires() != null
                        && goal.getRequires().stream().anyMatch(anchors::contains))
                .map(LearningGoal::getId).collect(Collectors.toSet());
        Set<String> nearby = new LinkedHashSet<>();
        Set<String> linkedAssessments = new HashSet<>();
        if (compositionViewService != null) {
            if (unitLearningMaterialService != null && anchors.isEmpty() && focusRoots.size() == 1) {
                var section = projectedStructure(focusRoots.getFirst(), projection);
                if (section != null) {
                    Map<String, Object> view = compositionViewService.findViewById(section.viewId());
                    if (view != null && view.get("landscapeId") instanceof String landscapeId) {
                        unitLearningMaterialService.find(landscapeId, section.viewId(), section.nodeId())
                                .map(UnitLearningMaterialService.Material::assessmentGoalId).ifPresent(linkedAssessments::add);
                    }
                }
            }
            for (String view : projection.compositionViewIds()) {
                for (String anchor : anchors) {
                    var path = projectedFocusAncestors(view, anchor, projection);
                    if (unitLearningMaterialService != null && !path.isEmpty()) {
                        String landscapeId = landscapeService.getLandscapeIdForGoal(anchor);
                        path.stream().flatMap(section -> unitLearningMaterialService.find(landscapeId, view, section.nodeId()).stream())
                                .map(UnitLearningMaterialService.Material::assessmentGoalId).filter(Objects::nonNull)
                                .findFirst().ifPresent(linkedAssessments::add);
                    }
                    for (var parent : path) {
                        Set<String> atoms = projectedAtomicTargetIds(List.of(parent.syntheticGoalId()), projection);
                        if (atoms.stream().anyMatch(id -> CompletionProfileCompiler.isAssessment(graph.get(id)))) {
                            nearby.addAll(atoms);
                            break;
                        }
                    }
                }
            }
        }
        return Comparator.<String>comparingInt(id -> linkedAssessments.contains(id) ? -1 : directlyRelated.contains(id) ? 0
                        : nearby.contains(id) ? 1 : focused.contains(id) ? 2 : 3)
                .thenComparing(id -> completionTitle(graph.get(id)).getOrDefault("de", id))
                .thenComparing(Comparator.naturalOrder());
    }

    /** Reuse the validated default graph for discovery, including supporting assessment obligations. */
    private Set<String> completionScopeAssessments(CompiledCompletionProfile complete, Set<String> targets) {
        Set<String> seen = new HashSet<>();
        Set<String> assessments = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(targets);
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!seen.add(id)) continue;
            if (complete.assessmentGoalIds().contains(id)) assessments.add(id);
            pending.addAll(complete.directPrerequisites(id));
        }
        return assessments;
    }

    private record CompletionSnapshot(LevelCompletionResponse response,
                                      CompiledCompletionProfile compiled, CompletionEvaluation evaluation) { }

    private static final int MAX_COMPLETION_DISCOVERY_CHOICES = 24;

    /** One result snapshot for discovery and the selected route, never one database read per profile. */
    private Map<String, Double> completionMasterySnapshot(Learner learner, GoalProjection projection,
            Map<String, LearningGoal> graph, Collection<CompiledCompletionProfile> profiles, boolean includePreparation) {
        Map<String, LearningGoal> contextGoals = new LinkedHashMap<>();
        profiles.forEach(profile -> (includePreparation ? profile.contextGoalIds() : profile.assessmentGoalIds())
                .forEach(id -> contextGoals.put(id, graph.get(id))));
        Map<String, Double> storedMastery = new LinkedHashMap<>();
        masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())
                .forEach(entry -> storedMastery.put(entry.getGoalKey(), entry.getValue()));
        Map<String, Double> mastery = new LinkedHashMap<>(applyCanonicalMasteryProjection(
                contextGoals, storedMastery, resolveProjectionStateFilterId(learner)));
        // The ordinary discovery surface needs only assessment results; its exams are
        // never memorisation goals. Preparation/SRS work belongs to route evaluation.
        if (includePreparation) {
            resolveSrsMasterySnapshot(learner.getSkillpilotId(), contextGoals.values().stream()
                    .filter(Objects::nonNull).toList(), projection)
                    .forEach((id, mastered) -> mastery.put(id, mastered ? 1.0 : 0.0));
        }
        return mastery;
    }

    private void assertCompletionApplicability(Learner learner, CompiledCompletionProfile compiled) {
        if (compiled.profile().applicability().isEmpty()) return;
        Set<String> subjects = compiled.targetGoalIds().stream().map(landscapeService::getLandscapeIdForGoal)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (subjects.contains(null)) throw new CompletionApplicability.UnresolvedScopeException();
        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(learner.getPersonalCurriculum());
        CompletionApplicability.requireMatches(compiled.profile().applicability(), subjects.stream()
                .map(subject -> deriveCompositionScope(subject, config)).toList());
    }

    /** Reviewed plan inputs belong to Level 2 independently of the active route. */
    @Transactional(readOnly = true)
    public LearningPlanCompletionContext getLearningPlanCompletionContext(String skillpilotId) {
        return getLearningPlanCompletionContext(skillpilotId, null);
    }

    @Transactional(readOnly = true)
    public LearningPlanCompletionContext getLearningPlanCompletionContext(String skillpilotId,
            Set<String> planObligationIds) {
        Learner learner = getLearner(skillpilotId);
        if (completionApplicationService == null || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) return null;
        var catalog = completionApplicationService.catalog();
        if (!catalog.enabled()) return null;
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        if (catalog.automatic()) {
            if (!catalog.available()) throw new IllegalStateException("Plan completion graph is unavailable");
            return LearningPlanCompletionContext.automatic(
                    learner.getSelectedCurriculum() + ":" + completionScopeDigest(learner), catalog.generation(),
                    completionGraph(learner, projection), projection.targetGoalIds(),
                    requiredRegularGoals(projection, projection.targetGoalIds()));
        }
        if (catalog.profiles().isEmpty()) return null;
        // An unrelated curriculum must not require a prepared completion base.
        var candidates = catalog.profiles().values().stream()
                .filter(profile -> profile.rules().stream().flatMap(rule -> rule.waivableGoalIds().stream())
                        .anyMatch(projection.targetGoalIds()::contains))
                .sorted(Comparator.comparing(CompletionProfileDefinition::id)).toList();
        if (candidates.isEmpty()) return null;
        // A base may share preparation goals but not contain the full reviewed
        // scope. Check its loaded definitions before requiring a warmed context.
        Map<String, LearningGoal> baseGoals = landscapeService.getClosure(learner.getSelectedCurriculum()).stream()
                .filter(landscape -> landscape.getGoals() != null)
                .flatMap(landscape -> landscape.getGoals().stream())
                .collect(Collectors.toMap(LearningGoal::getId, goal -> goal, (first, duplicate) -> first));
        Set<String> relevantIds = planObligationIds == null ? baseGoals.keySet()
                : learningPlanPossibleDependencyIds(planObligationIds, baseGoals);
        candidates = candidates.stream().filter(profile -> {
            var scope = catalog.scope(profile.levelScopeRef());
            if (scope == null) throw new IllegalStateException("Plan completion scope is unresolved");
            return baseGoals.keySet().containsAll(scope.targetRootIds())
                    && profile.rules().stream().flatMap(rule -> rule.waivableGoalIds().stream())
                        .anyMatch(relevantIds::contains);
        }).toList();
        if (candidates.isEmpty()) return null;
        if (!catalog.available()) throw new IllegalStateException("Plan completion rules are unavailable");
        Map<String, LearningGoal> graph = completionGraph(learner,
                getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum()));
        List<CompiledCompletionProfile> profiles = new ArrayList<>();
        for (var profile : candidates) {
            try {
                CompiledCompletionProfile compiled = completionApplicationService.compile(profile.id(),
                        learner.getSelectedCurriculum(), graph, projection.targetGoalIds());
                assertCompletionApplicability(learner, compiled);
                profiles.add(compiled);
            } catch (CompletionApplicationService.ScopeNotApplicableException ignored) {
                // A reviewed scope outside this Personal Curriculum supplies no plan credit.
            }
        }
        if (profiles.isEmpty()) return null;
        return new LearningPlanCompletionContext(learner.getSelectedCurriculum(), catalog.generation(),
                graph, projection.targetGoalIds(), profiles);
    }

    /** Conservative discovery only; the strict completion compiler remains authoritative. */
    private Set<String> learningPlanPossibleDependencyIds(Set<String> obligations,
            Map<String, LearningGoal> goals) {
        Map<String, List<String>> requirements = computeEffectiveRequires(goals);
        Set<String> relevant = new HashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(obligations);
        while (!pending.isEmpty()) {
            String id = resolveGoalRef(pending.removeFirst(), goals);
            // Never interpret malformed input as evidence that a profile is irrelevant.
            if (id == null) return goals.keySet();
            if (!relevant.add(id)) continue;
            LearningGoal goal = goals.get(id);
            if (goal.getContains() != null) pending.addAll(goal.getContains());
            pending.addAll(requirements.getOrDefault(id, List.of()));
        }
        return relevant;
    }

    /** Resolve the whole obligation context from an existing read, with strict batched card results. */
    @Transactional(readOnly = true)
    public Map<String, Double> resolveLearningPlanCompletionMastery(String skillpilotId,
            Map<String, Double> existingMastery, Set<String> contextGoalIds) {
        if (contextGoalIds.isEmpty()) return existingMastery;
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Map<String, LearningGoal> graph = completionGraph(learner, projection);
        Map<String, LearningGoal> contextGoals = new LinkedHashMap<>();
        for (String id : contextGoalIds) {
            LearningGoal goal = graph.get(id);
            if (goal == null) throw new IllegalStateException("Plan completion context has an unresolved goal");
            contextGoals.put(id, goal);
        }
        Map<String, Double> resolved = new LinkedHashMap<>(applyCanonicalMasteryProjection(
                contextGoals, existingMastery, resolveProjectionStateFilterId(learner)));
        resolveSrsMasterySnapshot(skillpilotId, List.copyOf(contextGoals.values()), projection)
                .forEach((id, mastered) -> resolved.put(id, mastered ? 1.0 : 0.0));
        return resolved;
    }

    /** Current, version-bound unit evidence. It is never persisted as individual mastery. */
    @Transactional(readOnly = true)
    public Map<String, CompletionEvaluation.WaiverReason> getUnitPlanningCredits(String skillpilotId) {
        if (!unitPlanningCreditsEnabled()) return Map.of();
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return unitPlanningCredits(learner, projection, completionGraph(learner, projection));
    }

    private boolean unitPlanningCreditsEnabled() {
        if (!unitAssessmentPilotEnabled || completionApplicationService == null) return false;
        var catalog = completionApplicationService.catalog();
        return catalog.automatic() && catalog.enabled() && catalog.available();
    }

    private Map<String, CompletionEvaluation.WaiverReason> unitPlanningCredits(Learner learner,
            GoalProjection projection, Map<String, LearningGoal> graph) {
        if (unitLearningMaterialService == null || verifiedExamPassService == null || compositionViewService == null
                || !unitPlanningCreditsEnabled()) return Map.of();
        var bindings = unitLearningMaterialService.assessmentBindings(projection.compositionViewIds());
        if (bindings.isEmpty()) return Map.of();
        var partIds = bindings.stream().flatMap(binding -> binding.contract().parts().stream())
                .map(UnitAssessmentContract.Part::goalId).distinct().toList();
        var receipts = verifiedExamPassService.findForGoals(learner.getSkillpilotId(), partIds);
        var recall = masteredUnitRecall(learner.getSkillpilotId(), bindings);
        Map<String, CompletionEvaluation.WaiverReason> credits = new LinkedHashMap<>();
        for (var binding : bindings) {
            var result = validatedUnitAssessment(binding, projection, graph, receipts, recall);
            if (result == null) continue;
            result.credits().forEach(credits::putIfAbsent);
        }
        projection.extensionPreparations().forEach(credits::remove);
        return Map.copyOf(credits);
    }

    private record UnitAssessmentProjection(UnitAssessmentResponse response,
            Map<String, CompletionEvaluation.WaiverReason> credits) { }

    private Set<String> masteredUnitRecall(String learnerId, List<UnitLearningMaterialService.AssessmentBinding> bindings) {
        var goals = bindings.stream().flatMap(binding -> binding.contract().requiredRecallGoalIds().stream()).distinct().toList();
        return goals.isEmpty() ? Set.of() : masteryRepository.findMasteredGoalIds(learnerId, goals, PLANNING_SCOPE_MASTERY_THRESHOLD);
    }

    /** Resolve only the authored meaning that is active when this newly graded result is persisted. */
    @Transactional(readOnly = true)
    public List<String> resolvePlanningCreditBindingsForAssessment(String skillpilotId, String goalId,
            AssessmentMaterialRevision material) {
        if (!unitPlanningCreditsEnabled() || unitLearningMaterialService == null) return List.of();
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Map<String, LearningGoal> graph = completionGraph(learner, projection);
        Set<String> bindings = new TreeSet<>();
        for (var binding : unitLearningMaterialService.assessmentBindings(projection.compositionViewIds())) {
            if (validatedUnitAssessment(binding, projection, graph, Map.of(), Set.of()) == null) continue;
            boolean exactPart = binding.contract().parts().stream().anyMatch(part -> goalId.equals(part.goalId())
                    && part.material().equals(material) && currentUnitPart(part, graph));
            if (!exactPart) continue;
            var section = "composition:" + binding.viewId() + ":structure:" + binding.compositionNodeId();
            var unitTargets = projectedAtomicTargetIds(List.of(section), projection);
            for (var rule : binding.contract().planningCredits()) {
                if (rule.requiredPartIds().contains(goalId) && rule.appliesToTargets(unitTargets)
                        && validPlanningRelease(binding, rule, graph)) {
                    bindings.add(rule.release().fingerprint());
                }
            }
        }
        return List.copyOf(bindings);
    }

    boolean isUnitAssignmentSubjectSelected(Learner learner, String landscapeId) {
        if (landscapeId == null) return false;
        String rootId = learner.getSelectedCurriculum();
        if (rootId == null || rootId.isBlank()) return false;
        if (landscapeId.equals(rootId)) return true;
        var config = parsePersonalCurriculumConfig(learner.getPersonalCurriculum());
        if (isSelectedInPersonalCurriculum(config.get(landscapeId))) return true;
        SkillLandscape root = landscapeService.getById(rootId);
        if (!config.isEmpty() || root == null || root.getPersonalizationFlow() != null) return false;
        // Older programmes select their contained modules with the root itself.
        // A requires edge alone never enrolls an independent subject.
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (SkillLandscape landscape : Optional.ofNullable(landscapeService.getClosure(rootId)).orElse(List.of())) {
            landscape.getGoals().forEach(goal -> graph.put(goal.getId(), goal));
        }
        root.getGoals().forEach(goal -> graph.putIfAbsent(goal.getId(), goal));
        ArrayDeque<String> pending = new ArrayDeque<>(root.getGoals().stream().map(LearningGoal::getId).toList());
        Set<String> visited = new HashSet<>();
        while (!pending.isEmpty()) {
            String id = resolveGoalRef(pending.removeFirst(), graph);
            if (id == null || !visited.add(id)) continue;
            if (landscapeId.equals(landscapeService.getLandscapeIdForGoal(id))) return true;
            LearningGoal goal = graph.get(id);
            if (goal != null && goal.getContains() != null) pending.addAll(goal.getContains());
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<LearnerLearningPlanApi.UnitAssignmentOption> getUnitAssignmentOptions(String skillpilotId, String landscapeId) {
        if (!unitPlanningCreditsEnabled() || unitLearningMaterialService == null || verifiedExamPassService == null) return List.of();
        Learner learner = getLearner(skillpilotId);
        if (!hasCompletedPersonalCurriculum(learner) || !isUnitAssignmentSubjectSelected(learner, landscapeId)) return List.of();
        var projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        var bindings = unitLearningMaterialService.assessmentBindings(projection.compositionViewIds()).stream()
                .filter(binding -> binding.landscapeId().equals(landscapeId)).toList();
        if (bindings.isEmpty()) return List.of();
        return unitAssignmentOptions(learner, landscapeId, projection, completionGraph(learner, projection), bindings, true);
    }

    private List<LearnerLearningPlanApi.UnitAssignmentOption> unitAssignmentOptions(
            Learner learner, String landscapeId, GoalProjection projection, Map<String, LearningGoal> graph,
            List<UnitLearningMaterialService.AssessmentBinding> bindings, boolean includeUnfinished) {
        String skillpilotId = learner.getSkillpilotId();
        var receipts = verifiedExamPassService.findForGoals(skillpilotId, bindings.stream()
                .flatMap(binding -> binding.contract().parts().stream()).map(UnitAssessmentContract.Part::goalId).distinct().toList());
        var options = new ArrayList<LearnerLearningPlanApi.UnitAssignmentOption>();
        var recall = masteredUnitRecall(skillpilotId, bindings);
        var subjectScope = deriveCompositionScope(landscapeId, parsePersonalCurriculumConfig(learner.getPersonalCurriculum()));
        CompletionSnapshot available = null;
        for (var binding : bindings) {
            var contract = binding.contract();
            var unit = validatedUnitAssessment(binding, projection, graph, receipts, recall);
            if (unit == null || unit.response().parts().stream().anyMatch(part -> !part.materialCurrent())) continue;
            var response = unit.response();
            if (!includeUnfinished && !response.passed()) continue;
            String fingerprint = contract.assignmentFingerprint(landscapeId, binding.viewId(), binding.compositionNodeId(), subjectScope);
            var section = projectedStructure(response.sectionGoalId(), projection);
            if (section == null) continue;
            String title = coachSectionTitle(section, projection, "de");
            if (title == null) continue;
            String english = coachSectionTitle(section, projection, "en");
            Set<String> offered = Set.of();
            if (!response.passed()) {
                if (available == null) available = completionSnapshot(learner, projection);
                if (available != null) {
                    var completion = available.response();
                    String profileId = AUTOMATIC_COMPLETION_PREFIX + response.sectionGoalId();
                    var assessments = profileId.equals(completion.profileId()) ? completion.assessments().stream()
                            : completion.profileOptions().stream().filter(option -> profileId.equals(option.profileId()))
                                    .flatMap(option -> option.assessments().stream());
                    offered = assessments.filter(LevelCompletionResponse.Assessment::startAvailable)
                            .map(LevelCompletionResponse.Assessment::goalId).collect(Collectors.toSet());
                }
            }
            var startable = offered;
            // Earlier exact task and rubric receipts also certify a later order for this edition.
            var parts = response.parts().stream().map(part -> new LearnerLearningPlanApi.UnitAssignmentPart(
                    part.goalId(), part.title(), part.passed(), part.materialCurrent(), startable.contains(part.goalId()))).toList();
            List<LearnerLearningPlanApi.VoluntaryGoal> voluntaryGoals = List.of();
            if (response.passed() && !response.individuallyOpenGoalIds().isEmpty()) {
                var mastered = masteryRepository.findMasteredGoalIds(skillpilotId, response.individuallyOpenGoalIds(),
                        PLANNING_SCOPE_MASTERY_THRESHOLD);
                voluntaryGoals = response.individuallyOpenGoalIds().stream()
                        .filter(goalId -> !mastered.contains(goalId))
                        .map(goalId -> new LearnerLearningPlanApi.VoluntaryGoal(goalId, completionTitle(graph.get(goalId))))
                        .toList();
            }
            options.add(new LearnerLearningPlanApi.UnitAssignmentOption(response.sectionGoalId(), response.revision(),
                    fingerprint, Map.of("de", title, "en", english == null ? title : english), response.passed(), parts,
                    voluntaryGoals));
        }
        return List.copyOf(options);
    }

    private boolean validPlanningRelease(UnitLearningMaterialService.AssessmentBinding binding,
            UnitAssessmentContract.PlanningCredit rule, Map<String, LearningGoal> graph) {
        var release = rule.release();
        if (release == null || !unitLearningMaterialService.isReviewedPlanningRelease(release)
                || binding.contract().parts().stream()
                    .filter(part -> rule.requiredPartIds().contains(part.goalId())).anyMatch(part -> !currentUnitPart(part, graph))) return false;
        var landscape = landscapeService.getById(binding.landscapeId());
        if (!release.hasReviewedOwnership(landscape, binding.contract(), rule)) return false;
        var definitions = graph;
        if (rule.orientation() != null) {
            String id = rule.goalIds().getFirst();
            var material = unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId());
            var definition = release.goalDefinitions().get(id);
            if (!isAtomicGoal(graph.get(id)) || !CompletionProfileCompiler.isOrientation(graph.get(id))
                    || !binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id))
                    || material.isEmpty() || !id.equals(material.get().orientationGoalId()) || definition == null
                    || !UnitPlanningRelease.hash(material.get().intro()).equals(definition.profileFingerprint())) return false;
            // Bind the authored definition. The projected node also carries runtime-only entry metadata.
            var canonical = landscape.getGoals().stream().filter(goal -> id.equals(goal.getId())).findFirst();
            if (canonical.isEmpty()) return false;
            definitions = Map.of(id, canonical.get());
        }
        return release.valid(binding.landscapeId(), binding.compositionNodeId(), binding.contract(), rule, binding.viewId(), definitions);
    }

    private boolean currentUnitPart(UnitAssessmentContract.Part part, Map<String, LearningGoal> graph) {
        LearningGoal goal = graph.get(part.goalId());
        if (isExamGoalUnavailableForHardCheck(goal)) return false;
        try { return part.material().equals(AssessmentMaterialRevision.of(goal.getExamData())); }
        catch (IllegalArgumentException | NullPointerException invalidMaterial) { return false; }
    }

    private boolean hasBoundPlanningReceipt(UnitAssessmentContract.Part part, String bindingId,
            Map<String, List<VerifiedExamPassResponse>> receipts) {
        return receipts.getOrDefault(part.goalId(), List.of()).stream().anyMatch(receipt ->
                part.material().taskRevision().equals(receipt.taskRevision())
                && part.material().rubricRevision().equals(receipt.rubricRevision())
                && part.material().fingerprint().equals(receipt.fingerprint())
                && receipt.planningCreditBindingIds().contains(bindingId));
    }

    /** One current-material and ownership decision for cards, coach, prerequisites and plan credit. */
    private UnitAssessmentProjection validatedUnitAssessment(UnitLearningMaterialService.AssessmentBinding binding,
            GoalProjection projection, Map<String, LearningGoal> graph,
            Map<String, List<VerifiedExamPassResponse>> receipts, Set<String> individuallyMastered) {
        var contract = binding.contract();
        if (!unitPlanningCreditsEnabled() || !contract.appliesTo(binding.viewId())) return null;
        String sectionId = "composition:" + binding.viewId() + ":structure:" + binding.compositionNodeId();
        Set<String> unitTargets = projectedAtomicTargetIds(List.of(sectionId), projection);
        if (contract.contentGoalIds().stream().anyMatch(id -> !isAtomicGoal(graph.get(id))
                || CompletionProfileCompiler.isAssessment(graph.get(id)) || CompletionProfileCompiler.isMemory(graph.get(id))
                || CompletionProfileCompiler.isOrientation(graph.get(id))
                || !binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id)))
                || contract.parts().stream().anyMatch(part -> !isAtomicGoal(graph.get(part.goalId()))
                    || !CompletionProfileCompiler.isAssessment(graph.get(part.goalId()))
                    || !binding.landscapeId().equals(landscapeService.getLandscapeIdForGoal(part.goalId())))) return null;
        Map<String, List<VerifiedExamPassResponse>> currentReceipts = new LinkedHashMap<>();
        Set<String> currentParts = new HashSet<>();
        for (var part : contract.parts()) {
            if (currentUnitPart(part, graph)) {
                currentParts.add(part.goalId());
                currentReceipts.put(part.goalId(), receipts.getOrDefault(part.goalId(), List.of()));
            }
        }
        var result = contract.evaluate(sectionId, unitTargets, graph, currentReceipts, individuallyMastered).orElse(null);
        if (result == null) return null;
        Map<String, CompletionEvaluation.WaiverReason> credits = new LinkedHashMap<>();
        Set<String> missingBindings = new HashSet<>();
        for (var rule : contract.planningCredits()) {
            if (!rule.appliesToTargets(unitTargets) || !validPlanningRelease(binding, rule, graph)) continue;
            var missing = contract.parts().stream().filter(part -> rule.requiredPartIds().contains(part.goalId()))
                    .filter(part -> !hasBoundPlanningReceipt(part, rule.release().fingerprint(), currentReceipts)).toList();
            if (!missing.isEmpty()) {
                missing.forEach(part -> missingBindings.add(part.goalId()));
                continue;
            }
            if (!rule.recallComplete(individuallyMastered)) continue;
            var reason = new CompletionEvaluation.WaiverReason("versioned_unit_assessment:" + rule.release().fingerprint(), rule.requiredPartIds());
            rule.goalIds().forEach(id -> credits.putIfAbsent(id, reason));
        }
        var response = new UnitAssessmentResponse(result.sectionGoalId(), result.revision(), result.passed(),
                result.parts().stream().map(part -> new UnitAssessmentResponse.Part(part.goalId(), part.title(),
                        part.passed(), currentParts.contains(part.goalId()),
                        part.passed() && missingBindings.contains(part.goalId()))).toList(),
                List.copyOf(credits.keySet()), result.individuallyOpenGoalIds());
        return new UnitAssessmentProjection(response, Map.copyOf(credits));
    }

    private CompletionEvaluation withUnitPlanningCredits(CompletionEvaluation evaluation,
            CompiledCompletionProfile compiled, Learner learner, GoalProjection projection, Map<String, LearningGoal> graph) {
        if (!compiled.automatic()) return evaluation;
        var credits = unitPlanningCredits(learner, projection, graph);
        if (credits.isEmpty()) return evaluation;
        var protectedGoals = new HashSet<>(compiled.protectedGoalIds());
        protectedGoals.removeIf(id -> credits.containsKey(id) && CompletionProfileCompiler.isOrientation(graph.get(id)));
        return evaluation.withPlanningCredits(credits, compiled.contextGoalIds(), compiled.targetGoalIds(), protectedGoals);
    }

    private CompletionSnapshot completionSnapshot(Learner learner, GoalProjection projection) {
        if (completionApplicationService == null || (!completionApplicationService.catalog().enabled()
                && !completionRouteOwnsNavigation(learner))) return null;
        var catalog = completionApplicationService.catalog();
        CompletionWorkflowState persistedWorkflow = completionWorkflow(learner);
        boolean routeOwnsNavigation = completionRouteOwnsNavigation(learner);
        boolean overview = catalog.automatic() && persistedWorkflow == null && !routeOwnsNavigation;
        CompletionWorkflowState workflow = overview ? new CompletionWorkflowState(AUTOMATIC_COMPLETION_DEFAULT,
                AUTOMATIC_COMPLETION_REVISION, catalog.generation(), learner.getSelectedCurriculum(),
                completionScopeDigest(learner), null, null, null) : persistedWorkflow;
        if (!routeOwnsNavigation && !catalog.automatic() && catalog.profiles().isEmpty()) return null;
        List<CompletionProfileDefinition> definitions = catalog.automatic() && projection != null
                ? automaticCompletionOptions(learner, projection)
                : catalog.profiles().values().stream().sorted(Comparator.comparing(CompletionProfileDefinition::id))
                        .limit(MAX_COMPLETION_DISCOVERY_CHOICES).toList();
        List<LevelCompletionResponse.ProfileOption> options = new ArrayList<>();
        Map<String, LearningGoal> graph = Map.of();
        String graphProblem = null;
        if (projection != null && catalog.available() && !definitions.isEmpty()) {
            try {
                graph = completionGraph(learner, projection);
            } catch (IllegalArgumentException e) {
                graphProblem = "invalid";
            } catch (RuntimeException e) {
                graphProblem = "unavailable";
            }
        }
        Set<String> targets = projection == null ? Set.of() : projection.targetGoalIds();
        Map<String, CompiledCompletionProfile> candidates = new LinkedHashMap<>();
        if (catalog.available() && graphProblem == null) {
            for (var profile : definitions) {
                // Discovery uses resolved target membership. Compile the complete
                // Personal Curriculum and the selected scope, not every menu item.
                if (catalog.automatic() && !AUTOMATIC_COMPLETION_DEFAULT.equals(profile.id())
                        && (workflow == null || !Objects.equals(workflow.profileId(), profile.id()))) continue;
                try {
                    var candidate = compileCompletionScope(learner, profile.id(), projection, graph);
                    assertCompletionApplicability(learner, candidate);
                    candidates.put(profile.id(), candidate);
                } catch (CompletionApplicationService.PreparedContextUnavailableException | IllegalArgumentException e) {
                    /* Unprepared or inapplicable profiles are never offered. */
                }
            }
        }
        Map<String, Double> masterySnapshot = Map.of();
        RuntimeException masteryFailure = null;
        UnitAssessmentResponse unitResult = null;
        if (!candidates.isEmpty()) {
            try {
                masterySnapshot = completionMasterySnapshot(learner, projection, graph, candidates.values(),
                        workflow != null && completionWorkflowMatches(learner, workflow));
                if (workflow != null && unitPlanningCreditsEnabled() && compositionViewService != null && unitLearningMaterialService != null) {
                    var section = overview ? explicitCoachUnitFocus(learner, projection) : completionUnitSection(workflow.profileId(), projection);
                    unitResult = unitAssessment(learner, section, projection, graph);
                }
            } catch (RuntimeException e) {
                masteryFailure = e;
            }
        }
        Comparator<String> assessmentOrder = completionAssessmentOrder(learner, projection, graph);
        Map<String, Boolean> partResults = unitResult == null ? Map.of() : unitResult.parts().stream()
                .collect(Collectors.toMap(UnitAssessmentResponse.Part::goalId, UnitAssessmentResponse.Part::passed));
        String unitProfileId = unitResult == null ? null : AUTOMATIC_COMPLETION_PREFIX + unitResult.sectionGoalId();
        Map<String, Set<String>> changedUnitParts = new HashMap<>();
        for (var definition : definitions) {
            var candidate = candidates.get(definition.id());
            if (candidate == null && !catalog.automatic()) continue;
            if (catalog.automatic() && !candidates.containsKey(AUTOMATIC_COMPLETION_DEFAULT)) continue;
            Set<String> optionTargets = candidate == null ? automaticCompletionTargets(definition.id(), projection)
                    : candidate.targetGoalIds();
            Set<String> optionAssessments = candidate == null
                    ? completionScopeAssessments(candidates.get(AUTOMATIC_COMPLETION_DEFAULT), optionTargets)
                    : candidate.assessmentGoalIds();
            Set<String> optional = voluntaryAssessments(definition.id(), projection, graph, optionTargets);
            List<LevelCompletionResponse.Assessment> preview = new ArrayList<>();
            if (masteryFailure == null) {
                for (String id : optionAssessments.stream().sorted(assessmentOrder)
                        .limit(catalog.automatic() ? Long.MAX_VALUE : MAX_COMPLETION_DISCOVERY_CHOICES).toList()) {
                    LearningGoal goal = graph.get(id);
                    boolean mastered = Mastery.isMastered(masterySnapshot.get(id));
                    if (definition.id().equals(unitProfileId)) mastered = partResults.getOrDefault(id, mastered);
                    boolean materialCurrent = unitPartMaterialCurrent(definition.id(), id, graph, changedUnitParts);
                    boolean taskAvailable = targets.contains(id) && !isExamGoalUnavailableForHardCheck(goal) && materialCurrent;
                    boolean available = !routeOwnsNavigation
                            && persistedWorkflow == null && !mastered && taskAvailable;
                    preview.add(new LevelCompletionResponse.Assessment(id, completionTitle(goal), mastered,
                            available, mastered ? null : routeOwnsNavigation ? "completion_route_active"
                                    : !targets.contains(id) ? "assessment_outside_personal_curriculum"
                                    : !materialCurrent ? "assessment_material_changed"
                                    : taskAvailable ? null : "assessment_task_unavailable", optional.contains(id) ? true : null));
                }
            }
            options.add(new LevelCompletionResponse.ProfileOption(
                    definition.id(), definition.title(), optionTargets.size(),
                    (int) optionAssessments.stream().filter(id -> !optional.contains(id)).count(), preview));
        }
        if (!routeOwnsNavigation && options.isEmpty() && !catalog.automatic()) return null;
        String status = "unresolved";
        String notice = null;
        CompiledCompletionProfile compiled = null;
        CompletionEvaluation evaluation = null;
        List<LevelCompletionResponse.Assessment> assessments = new ArrayList<>();
        List<LevelCompletionResponse.Action> actions = new ArrayList<>();
        boolean storedDirect = workflow != null && workflow.directAssessment() != null;
        boolean directRunning = storedDirect && currentDirectAssessmentBinding(learner, workflow);
        boolean invalidDirectBinding = storedDirect && !directRunning;
        if (!catalog.available()) { status = "unavailable"; notice = "completion_generation_unavailable"; }
        else if (graphProblem != null) { status = graphProblem; notice = "completion_profile_invalid"; }
        else if (masteryFailure != null) { status = "unavailable"; notice = "completion_mastery_unavailable"; }
        else if (workflow == null && completionRouteOwnsNavigation(learner)) {
            status = "invalid"; notice = "completion_workflow_invalid";
        } else if (workflow != null && !completionWorkflowMatches(learner, workflow)) {
            status = "notApplicable";
            var currentProfile = completionDefinition(learner, workflow.profileId());
            if (!Objects.equals(workflow.curriculumGeneration(), catalog.generation())) notice = "completion_generation_changed";
            else if (currentProfile == null || !Objects.equals(workflow.profileRevision(), currentProfile.revision())) {
                notice = "completion_profile_changed";
            } else notice = "completion_scope_changed";
        } else if (workflow != null) {
            try {
                compiled = compileCompletionScope(learner, workflow.profileId(), projection, graph);
                assertCompletionApplicability(learner, compiled);
                if (masteryFailure != null) throw masteryFailure;
                if (!candidates.containsKey(compiled.profile().id())) {
                    masterySnapshot = completionMasterySnapshot(learner, projection, graph, List.of(compiled), true);
                }
                if (workflow.profileId().equals(unitProfileId)
                        && compiled.requiredAssessmentGoalIds().size() < compiled.assessmentGoalIds().size()) {
                    masterySnapshot = new HashMap<>(masterySnapshot);
                    for (var part : unitResult.parts()) {
                        if (part.passed()) masterySnapshot.put(part.goalId(), 1.0);
                        else masterySnapshot.remove(part.goalId());
                    }
                }
                evaluation = withUnitPlanningCredits(completionApplicationService.evaluate(compiled, masterySnapshot),
                        compiled, learner, projection, graph);
                status = "valid";
                CompletionCallContext call = CompletionCallContext.current();
                boolean foreignOwner = storedDirect && call != null && !ownsDirectAssessment(call, workflow);
                boolean compatible = !invalidDirectBinding && (call == null || (call.supported() && !foreignOwner));
                if (invalidDirectBinding) notice = "completion_profile_invalid";
                else if (!overview && call != null && !call.supported()) notice = "completion_coach_contract_unsupported";
                else if (foreignOwner) notice = "completion_assessment_owned_elsewhere";
                for (String id : compiled.assessmentGoalIds().stream().sorted(assessmentOrder).toList()) {
                    LearningGoal goal = graph.get(id);
                    boolean mastered = evaluation.masteredGoalIds().contains(id);
                    if (workflow.profileId().equals(unitProfileId)) mastered = partResults.getOrDefault(id, mastered);
                    boolean materialCurrent = unitPartMaterialCurrent(workflow.profileId(), id, graph, changedUnitParts);
                    boolean available = compatible && !mastered && !directRunning && materialCurrent
                            && targets.contains(id) && !isExamGoalUnavailableForHardCheck(goal);
                    assessments.add(new LevelCompletionResponse.Assessment(id, completionTitle(goal), mastered,
                            available, available || mastered ? null : invalidDirectBinding ? "assessment_context_unavailable"
                                    : directRunning ? "assessment_running"
                                    : !targets.contains(id) ? "assessment_outside_personal_curriculum"
                                    : !materialCurrent ? "assessment_material_changed"
                                    : compatible ? "assessment_task_unavailable" : "coach_contract_unsupported",
                            compiled.requiredAssessmentGoalIds().contains(id) ? null : true));
                }
                if (compatible && !overview) {
                    if (directRunning && unitPartMaterialCurrent(workflow.profileId(), workflow.directAssessment().goalId(), graph, changedUnitParts)) actions.add(new LevelCompletionResponse.Action("retryAssessment",
                            workflow.directAssessment().goalId(),
                            Map.of("de", "Prüfung erneut versuchen", "en", "Try assessment again"), null));
                    CompletionEvaluation evaluated = evaluation;
                    Set<String> learnable = filterAtomicFrontier(getUncompactedRichFrontier(learner.getSkillpilotId()))
                            .stream().map(FrontierGoal::id).collect(Collectors.toCollection(LinkedHashSet::new));
                    for (String id : compiled.contextGoalIds().stream().filter(learnable::contains)
                            .filter(targets::contains)
                            .filter(id -> !evaluated.masteredGoalIds().contains(id))
                            .filter(id -> !evaluated.waivedGoalIds().contains(id)).limit(8).toList()) {
                        if (compiled.assessmentGoalIds().contains(id)) continue;
                        actions.add(new LevelCompletionResponse.Action("learnGoal", id,
                                completionTitle(graph.get(id)), compiled.targetGoalIds().contains(id) ? "required" : "support"));
                    }
                    for (String id : evaluation.waivedGoalIds().stream().filter(compiled.targetGoalIds()::contains)
                            .filter(targets::contains)
                            .filter(learnable::contains).limit(8).toList()) {
                        actions.add(new LevelCompletionResponse.Action("learnGoal", id,
                                completionTitle(graph.get(id)), "voluntary"));
                    }
                    Set<String> focusedAtoms = projectedAtomicTargetIds(
                            resolveEffectiveProjectedFocusIds(learner, projection), projection);
                    Set<String> requiredAssessments = compiled.assessmentGoalIds();
                    for (String id : evaluation.pendingTargetGoalIds().stream().filter(targets::contains)
                            .filter(id -> !focusedAtoms.contains(id)).filter(id -> !requiredAssessments.contains(id))
                            .sorted().limit(4).toList()) {
                        var title = completionTitle(graph.get(id));
                        actions.add(new LevelCompletionResponse.Action("includeTarget", id,
                                Map.of("de", "Zum Lernfokus hinzufügen: " + title.get("de"),
                                        "en", "Add to learning focus: " + title.get("en")), null));
                    }
                    Set<String> profileTargets = compiled.targetGoalIds();
                    boolean hasUnfocusedSupport = compiled.contextGoalIds().stream()
                            .anyMatch(id -> targets.contains(id) && !profileTargets.contains(id)
                                    && !focusedAtoms.contains(id)
                                    && !evaluated.masteredGoalIds().contains(id)
                                    && !evaluated.waivedGoalIds().contains(id));
                    if (!evaluation.complete() && hasUnfocusedSupport
                            && actions.stream().noneMatch(action -> "learnGoal".equals(action.action()))) {
                        // Preview once over the whole eligible support context. No focus or
                        // result is changed by this read; the accepted choice adds only its
                        // exact goal and retains every independent existing focus root.
                        List<String> supportPreview = compiled.contextGoalIds().stream().filter(targets::contains).toList();
                        for (FrontierGoal goal : filterAtomicFrontier(getUncompactedRichFrontierForFocus(
                                learner.getSkillpilotId(), supportPreview)).stream()
                                .filter(goal -> !profileTargets.contains(goal.id()) && !focusedAtoms.contains(goal.id()))
                                .filter(goal -> !evaluated.masteredGoalIds().contains(goal.id())
                                        && !evaluated.waivedGoalIds().contains(goal.id()))
                                .limit(4).toList()) {
                            var title = completionTitle(graph.get(goal.id()));
                            actions.add(new LevelCompletionResponse.Action("includeSupport", goal.id(),
                                    Map.of("de", "Unterstützung starten: " + title.get("de"),
                                            "en", "Start support: " + title.get("en")), "support"));
                        }
                    }
                }
                if (compatible && !storedDirect && compiled.automatic() && unitPlanningCreditsEnabled()) {
                    addIndividualPractice(learner, compiled, evaluation, graph, actions, projection, unitResult);
                }
            } catch (CompletionApplicability.UnresolvedScopeException e) {
                status = "unresolved"; notice = "completion_scope_unresolved";
            } catch (CompletionApplicationService.ScopeNotApplicableException e) {
                status = "notApplicable"; notice = "completion_scope_changed";
            } catch (IllegalArgumentException e) {
                status = "invalid"; notice = "completion_profile_invalid";
            } catch (RuntimeException e) {
                status = "unavailable"; notice = "completion_mastery_unavailable";
            }
        }
        if (!"valid".equals(status)) evaluation = null;
        if (completionRouteOwnsNavigation(learner)
                && (CompletionCallContext.current() == null || !storedDirect
                    || ownsDirectAssessment(CompletionCallContext.current(), workflow))) {
            actions.add(new LevelCompletionResponse.Action("leaveProfile", null,
                    Map.of("de", "Zur normalen Lernansicht", "en", "Return to ordinary learning"), null));
            if (storedDirect) actions.add(new LevelCompletionResponse.Action("endAssessment", null,
                    Map.of("de", "Prüfung beenden und pausieren", "en", "End assessment and pause"), null));
        }
        var profile = workflow == null ? null : completionDefinition(learner, workflow.profileId());
        completionApplicationService.recordStatus(status);
        String contextRef = workflow == null ? null : workflow.profileId() + ":" + workflow.profileRevision()
                + ":" + catalog.generation() + ":" + learner.getCoachStateRevision();
        LevelCompletionResponse response = new LevelCompletionResponse(status, contextRef,
                workflow == null ? null : workflow.profileId(), profile == null ? null : profile.revision(),
                catalog.generation(), learner.getCoachStateRevision(), profile == null ? null : profile.title(),
                evaluation == null ? null : evaluation.complete(),
                evaluation == null ? 0 : evaluation.masteredTargetCount(),
                evaluation == null ? 0 : evaluation.waivedTargetCount(),
                evaluation == null ? 0 : evaluation.pendingTargetCount(),
                evaluation == null ? 0 : evaluation.targetCount(),
                evaluation == null ? 0 : evaluation.masteredAssessmentCount(),
                evaluation == null ? 0 : evaluation.requiredAssessmentCount(),
                evaluation == null ? List.of() : evaluation.waivedGoalIds().stream()
                        .filter(compiled.targetGoalIds()::contains).sorted()
                        .limit(catalog.automatic() ? Long.MAX_VALUE : 100).toList(),
                List.copyOf(assessments), List.copyOf(options), workflow == null ? null : workflow.navigationIntent(),
                directRunning, notice, List.copyOf(actions));
        response = CompletionResponseProjection.withExplanations(response, evaluation, graph);
        if (evaluation != null && unitResult != null) response = response.withUnitAssessment(unitResult);
        return new CompletionSnapshot(response, compiled, evaluation);
    }

    /** A current completed assignment retains its voluntary goals when its obligation is paused. */
    private Set<String> completedAssignmentPracticeGoals(Learner learner, GoalProjection projection,
            Map<String, LearningGoal> graph, List<LearnerLearningPlan> followed) {
        if (followed.isEmpty() || unitLearningMaterialService == null || verifiedExamPassService == null) return Set.of();
        Set<String> goals = new LinkedHashSet<>();
        for (var plan : followed) {
            String landscape = plan.getLandscapeId();
            if (!Objects.equals(learner.getSelectedCurriculum(), plan.getCurriculumId())
                    || !isUnitAssignmentSubjectSelected(learner, landscape)) continue;
            List<LearnerLearningPlanApi.Block> blocks;
            try { blocks = readPortableLearningPlanBlocks(plan); }
            catch (IllegalStateException invalidCapture) { continue; }
            var assignments = blocks.stream().filter(block -> block.unitAssignment() != null).toList();
            var bindings = assignments.stream().map(block -> block.unitAssignment().sectionGoalId()).distinct()
                    .flatMap(id -> unitLearningMaterialService.assessmentBindingForReference(id).stream())
                    .filter(binding -> landscape.equals(binding.landscapeId()) && projection.compositionViewIds().contains(binding.viewId()))
                    .toList();
            if (bindings.isEmpty()) continue;
            // The completed-only read never asks completionSnapshot for available examinations.
            var current = unitAssignmentOptions(learner, landscape, projection, graph, bindings, false).stream()
                    .filter(option -> assignments.stream().anyMatch(option::matches)).toList();
            if (!current.isEmpty() && isLearningPlanCompatible(learner.getSkillpilotId(), plan.getCurriculumId(), landscape, blocks)) {
                current.forEach(option -> option.voluntaryGoals().forEach(goal -> goals.add(goal.goalId())));
            }
        }
        return goals;
    }

    /** Explicit individual work uses the same focus and availability rules as the ordinary learning plan. */
    private void addIndividualPractice(Learner learner, CompiledCompletionProfile compiled,
            CompletionEvaluation evaluation, Map<String, LearningGoal> graph, List<LevelCompletionResponse.Action> actions,
            GoalProjection projection, UnitAssessmentResponse section) {
        Set<String> credits = evaluation.waiverReasons().entrySet().stream()
                .filter(entry -> entry.getValue().ruleId().startsWith("versioned_unit_assessment:"))
                .map(Map.Entry::getKey).collect(Collectors.toCollection(LinkedHashSet::new));
        var followed = currentFollowedLearningPlans(learner);
        Set<String> practiceGoals = new LinkedHashSet<>(credits);
        if (AUTOMATIC_COMPLETION_DEFAULT.equals(compiled.profile().id())) {
            practiceGoals.addAll(completedAssignmentPracticeGoals(learner, projection, graph, followed));
        } else if (section != null && section.passed()
                && compiled.profile().id().equals(AUTOMATIC_COMPLETION_PREFIX + section.sectionGoalId())) {
            practiceGoals.addAll(section.individuallyOpenGoalIds());
        }
        if (practiceGoals.isEmpty()) return;
        // These facts are stable for this read. Each candidate still gets its own exact prospective focus.
        var frontierFacts = SingletonSupplier.of(() -> richFrontierFacts(learner, projection));
        Set<String> unitOpeningIds = guidedUnitOrientationScopes(projection).keySet();
        for (String id : practiceGoals) {
            if (!compiled.targetGoalIds().contains(id) || evaluation.masteredGoalIds().contains(id)) continue;
            Map<String, Integer> distance = new LinkedHashMap<>();
            distance.put(id, 0);
            ArrayDeque<String> pending = new ArrayDeque<>(List.of(id));
            while (!pending.isEmpty()) {
                String current = pending.removeFirst();
                for (String prerequisite : compiled.directPrerequisites(current)) {
                    if (distance.putIfAbsent(prerequisite, distance.get(current) + 1) == null) pending.addLast(prerequisite);
                }
            }
            distance.remove(id);
            Set<String> prerequisites = distance.keySet();
            prerequisites.removeAll(evaluation.masteredGoalIds());
            prerequisites.removeAll(credits);
            var open = prerequisites.stream().map(goal -> new LevelCompletionResponse.PracticePrerequisite(
                    goal, completionTitle(graph.get(goal)))).toList();
            // Keep an already published in-focus transition, including its completion navigation intent.
            var available = actions.stream().filter(action -> id.equals(action.goalId())
                    && "voluntary".equals(action.intent()) && "learnGoal".equals(action.action())).findFirst();
            if (available.isPresent()) {
                var action = available.get();
                actions.set(actions.indexOf(action), new LevelCompletionResponse.Action(action.action(), id,
                        action.title(), action.intent(), new LevelCompletionResponse.PracticeStep(id, open)));
                continue;
            }
            boolean strict = Boolean.TRUE.equals(learner.getStrictMode());
            List<String> focus = new ArrayList<>(List.of(id));
            if (strict) focus.addAll(prerequisites);
            Set<String> followedScope = followedLearningScopeIds(learner, projection, focus, followed);
            if (followedScope != null && followedScope.isEmpty()) continue;
            var frontier = filterAtomicFrontier(getRichFrontier(learner, projection, frontierFacts.get(),
                    false, focus, false, followedScope));
            String start = frontier.stream().map(FrontierGoal::id).filter(id::equals).findFirst().orElse(null);
            if (start == null) start = frontier.stream().filter(goal -> unitOpeningIds.contains(goal.id()))
                    .map(FrontierGoal::id).findFirst().orElse(null);
            if (start == null && strict) {
                start = frontier.stream().map(FrontierGoal::id).filter(prerequisites::contains)
                        .filter(goal -> !isExamGoal(graph.get(goal)))
                        .min(Comparator.comparingInt(distance::get)).orElse(null);
            }
            if (start == null) continue;
            var title = completionTitle(graph.get(id));
            var first = completionTitle(graph.get(start));
            var label = id.equals(start)
                    ? Map.of("de", "Einzelfokus starten: " + title.get("de"), "en", "Start individual focus: " + title.get("en"))
                    : unitOpeningIds.contains(start)
                    ? Map.of("de", "Mit dem Einheitseinstieg beginnen: " + title.get("de"),
                            "en", "Start with the unit introduction: " + title.get("en"))
                    : Map.of("de", "Grundlagen für „" + title.get("de") + "“ erarbeiten: " + first.get("de"),
                            "en", "Study the prerequisites for “" + title.get("en") + "”: " + first.get("en"));
            actions.add(new LevelCompletionResponse.Action("focusPractice", id, label, "voluntary",
                    new LevelCompletionResponse.PracticeStep(start, open, unitOpeningIds.contains(start) ? start : null)));
        }
    }

    private CompositionViewService.CompositionStructureResolution completionUnitSection(String profileId, GoalProjection projection) {
        if (compositionViewService == null || profileId == null || !profileId.startsWith(AUTOMATIC_COMPLETION_PREFIX)) return null;
        String root = profileId.substring(AUTOMATIC_COMPLETION_PREFIX.length());
        return isCompositionStructureGoalId(root) ? projectedStructure(root, projection) : null;
    }

    private boolean unitPartMaterialCurrent(String profileId, String goalId, Map<String, LearningGoal> graph,
            Map<String, Set<String>> changedByProfile) {
        if (!unitPlanningCreditsEnabled() || unitLearningMaterialService == null || profileId == null
                || !profileId.startsWith(AUTOMATIC_COMPLETION_PREFIX)) return true;
        Set<String> changed = changedByProfile.computeIfAbsent(profileId, id -> unitLearningMaterialService
                .assessmentBindingForReference(id.substring(AUTOMATIC_COMPLETION_PREFIX.length()))
                .map(binding -> binding.contract().parts().stream().filter(part -> !currentUnitPart(part, graph))
                    .map(UnitAssessmentContract.Part::goalId).collect(Collectors.toUnmodifiableSet()))
                .orElse(Set.of()));
        return !changed.contains(goalId);
    }

    private UnitAssessmentResponse unitAssessment(Learner learner, CompositionViewService.CompositionStructureResolution section,
            GoalProjection projection, Map<String, LearningGoal> graph) {
        if (section == null || unitLearningMaterialService == null || verifiedExamPassService == null
                || !projection.compositionViewIds().contains(section.viewId())) return null;
        Map<String, Object> view = compositionViewService.findViewById(section.viewId());
        if (view == null || !(view.get("landscapeId") instanceof String landscape)) return null;
        var contract = unitLearningMaterialService.find(landscape, section.viewId(), section.nodeId())
                .map(UnitLearningMaterialService.Material::assessmentContract).orElse(null);
        if (contract == null || !contract.appliesTo(section.viewId())) return null;
        String learnerId = learner.getSkillpilotId();
        var statusGoalIds = new LinkedHashSet<>(contract.contentGoalIds());
        statusGoalIds.addAll(contract.requiredRecallGoalIds());
        Set<String> mastered = masteryRepository.findMasteredGoalIds(learnerId,
                List.copyOf(statusGoalIds), PLANNING_SCOPE_MASTERY_THRESHOLD);
        var receipts = verifiedExamPassService.findForGoals(learnerId,
                contract.parts().stream().map(UnitAssessmentContract.Part::goalId).toList());
        var result = validatedUnitAssessment(new UnitLearningMaterialService.AssessmentBinding(landscape,
                section.viewId(), section.nodeId(), contract), projection, graph, receipts, mastered);
        return result == null ? null : result.response();
    }

    private Map<String, String> completionTitle(LearningGoal goal) {
        return CompletionResponseProjection.titleFor(goal);
    }

    @Transactional
    public UnifiedLearnerStateResponse chooseLevelCompletion(String skillpilotId, LevelCompletionActionRequest request) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        if (request == null || request.expectedRevision() == null
                || request.expectedRevision() != learner.getCoachStateRevision()) {
            if (request != null && request.expectedRevision() != null) recordCompletionRevisionConflict();
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Refresh the completion choices.");
        }
        long revisionBefore = learner.getCoachStateRevision();
        CompletionWorkflowState existingWorkflow = completionWorkflow(learner);
        if (CompletionCallContext.current() != null && existingWorkflow != null
                && existingWorkflow.directAssessment() != null) {
            boolean neutralExit = "leaveProfile".equals(request.action()) || "endAssessment".equals(request.action());
            if (neutralExit) {
                if (!ownsDirectAssessment(CompletionCallContext.current(), existingWorkflow)) {
                    throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                            "This assessment belongs to another learning session.");
                }
            } else assertCompletionAssessmentOwner(skillpilotId, existingWorkflow.directAssessment().goalId());
        }
        GoalProjection currentProjection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        CompletionSnapshot offered = completionSnapshot(learner, currentProjection);
        boolean published = offered != null && ("selectProfile".equals(request.action())
                ? existingWorkflow == null && ("unresolved".equals(offered.response().calculationStatus())
                    || completionApplicationService.catalog().automatic() && "valid".equals(offered.response().calculationStatus()))
                    && offered.response().notice() == null && offered.response().profileOptions().stream()
                    .anyMatch(option -> Objects.equals(option.profileId(), request.profileId()))
                : offered.response().actions().stream().anyMatch(action ->
                    Objects.equals(action.action(), request.action()) && Objects.equals(action.goalId(), request.goalId())
                        && Objects.equals(action.intent(), request.intent())));
        if (!published || "retryAssessment".equals(request.action())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Refresh the completion choices.");
        }
        if ("leaveProfile".equals(request.action())) {
            CompletionWorkflowState old = completionWorkflow(learner);
            if (old != null && old.directAssessment() != null) {
                learner.setActiveGoalId(null);
                learner.setLearningState(LearningState.FRONTIER);
            }
            saveCompletionWorkflow(learner, null);
        } else if ("selectProfile".equals(request.action())) {
            assertPersonalizationCompleteForLearning(learner);
            if (request.profileId() == null || request.profileId().isBlank()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "profileId is required.");
            }
            GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
            if (completionApplicationService == null || !completionApplicationService.catalog().available()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Completion is unavailable.");
            }
            var compiled = compileCompletionScope(learner, request.profileId(), projection, completionGraph(learner, projection));
            assertCompletionApplicability(learner, compiled);
            String currentGoalId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), projection.visibleGoals(), false);
            if (currentGoalId == null || !compiled.contextGoalIds().contains(currentGoalId)) {
                // Selecting the profile deliberately leaves unrelated work. Existing
                // work inside its context, including newly waived work, is retained.
                currentGoalId = null;
                learner.setActiveGoalId(null);
                learner.setLearningState(LearningState.FRONTIER);
            } else {
                learner.setActiveGoalId(currentGoalId);
            }
            String intent = currentGoalId != null && !compiled.targetGoalIds().contains(currentGoalId) ? "support" : "required";
            saveCompletionWorkflow(learner, new CompletionWorkflowState(compiled.profile().id(),
                    compiled.profile().revision(), compiled.curriculumGeneration(), learner.getSelectedCurriculum(),
                    completionScopeDigest(learner), intent, currentGoalId, null));
        } else if ("endAssessment".equals(request.action())) {
            CompletionWorkflowState old = completionWorkflow(learner);
            if (old == null) throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "No completion route.");
            if (CompletionCallContext.current() != null && old.directAssessment() != null
                    && !ownsDirectAssessment(CompletionCallContext.current(), old)) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                        "This assessment belongs to another learning session.");
            }
            learner.setActiveGoalId(null); learner.setLearningState(LearningState.FRONTIER);
            saveCompletionWorkflow(learner, old.withNavigation("paused", null));
        } else if ("focusPractice".equals(request.action())) {
            var action = offered.response().actions().stream().filter(item -> "focusPractice".equals(item.action())
                    && Objects.equals(item.goalId(), request.goalId()) && item.practice() != null).findFirst().orElseThrow();
            Set<String> focus = new LinkedHashSet<>(List.of(action.goalId()));
            if (Boolean.TRUE.equals(learner.getStrictMode())) {
                action.practice().openPrerequisites().forEach(prerequisite -> focus.add(prerequisite.goalId()));
            }
            setPlannedGoals(skillpilotId, focus);
            setActiveGoal(skillpilotId, action.practice().orientationGoalId() != null
                    ? action.goalId() : action.practice().startGoalId());
        } else if ("learnGoal".equals(request.action())) {
            CompletionWorkflowState old = completionWorkflow(learner);
            if (!completionWorkflowMatches(learner, old) || request.intent() == null
                    || !Set.of("required", "support", "voluntary").contains(request.intent())) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Refresh the completion choices.");
            }
            GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
            var snapshot = completionSnapshot(learner, projection);
            if (snapshot == null || snapshot.evaluation() == null
                    || !snapshot.compiled().contextGoalIds().contains(request.goalId())
                    || !projection.targetGoalIds().contains(request.goalId())
                    || snapshot.response().actions().stream().noneMatch(action ->
                        "learnGoal".equals(action.action()) && Objects.equals(action.goalId(), request.goalId())
                            && Objects.equals(action.intent(), request.intent()))) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Goal is not available in this context.");
            }
            saveCompletionWorkflow(learner, old.withNavigation(request.intent(), request.goalId()));
            setActiveGoal(skillpilotId, request.goalId());
        } else if ("includeTarget".equals(request.action()) || "includeSupport".equals(request.action())) {
            boolean support = "includeSupport".equals(request.action());
            if (!completionWorkflowMatches(learner, existingWorkflow) || offered.evaluation() == null
                    || (support ? !offered.compiled().contextGoalIds().contains(request.goalId())
                        || offered.compiled().targetGoalIds().contains(request.goalId())
                        || !"support".equals(request.intent())
                        : !offered.evaluation().pendingTargetGoalIds().contains(request.goalId()))
                    || !currentProjection.targetGoalIds().contains(request.goalId())) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Refresh the completion choices.");
            }
            Set<String> roots = plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId).stream()
                    .map(PlannedGoal::getGoalId).collect(Collectors.toCollection(LinkedHashSet::new));
            if (roots.add(request.goalId())) plannedGoalRepository.save(new PlannedGoal(learner, request.goalId()));
            if (existingWorkflow.directAssessment() != null) {
                learner.setActiveGoalId(null); learner.setLearningState(LearningState.FRONTIER);
            }
            saveCompletionWorkflow(learner, existingWorkflow.withNavigation(support ? "support" : "required",
                    support ? request.goalId() : learner.getActiveGoalId()));
            if (support) setActiveGoal(skillpilotId, request.goalId());
        } else throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Unknown completion action.");
        if (learner.getCoachStateRevision() == revisionBefore) advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "COMPLETION_NAVIGATION"));
        return getLearnerState(skillpilotId);
    }

    private void recordCompletionRevisionConflict() {
        if (completionApplicationService != null) completionApplicationService.recordRevisionConflict(
                CompletionCallContext.current() == null ? CompletionTelemetry.RevisionConflictSource.UI
                        : CompletionTelemetry.RevisionConflictSource.COACH);
    }

    /** Called by a trusted, newly issued provider session in the same locked transaction. */
    @Transactional
    public void startCompletionAssessment(String skillpilotId, CompletionAssessmentStart request,
            String provider, String sessionBinding, Instant expiresAt) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        CompletionWorkflowState workflow = completionWorkflow(learner);
        boolean newRoute = workflow == null && !completionRouteOwnsNavigation(learner);
        CompletionCallContext call = CompletionCallContext.current();
        if (request == null || request.expectedRevision() == null
                || request.expectedRevision() != learner.getCoachStateRevision()
                || (!newRoute && (!completionWorkflowMatches(learner, workflow)
                    || !Objects.equals(workflow.profileId(), request.profileId())))
                || (newRoute && Boolean.TRUE.equals(request.restartCurrent()))
                || !("claude".equals(provider) || "openai".equals(provider) && call != null)
                || sessionBinding == null || sessionBinding.isBlank()
                || expiresAt == null || !expiresAt.isAfter(Instant.now())
                || (call != null && (!call.supported() || !Objects.equals(call.provider(), provider)
                    || !Objects.equals(call.sessionBinding(), sessionBinding) || !Objects.equals(call.expiresAt(), expiresAt)))) {
            if (request != null && request.expectedRevision() != null
                    && request.expectedRevision() != learner.getCoachStateRevision()) recordCompletionRevisionConflict();
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Refresh and deliberately choose the assessment again.");
        }
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        CompletionSnapshot snapshot = completionSnapshot(learner, projection);
        boolean publishedStart = snapshot != null && (newRoute
                ? snapshot.response().profileOptions().stream()
                    .filter(option -> Objects.equals(option.profileId(), request.profileId()))
                    .flatMap(option -> option.assessments().stream())
                    .anyMatch(assessment -> assessment.startAvailable() && !assessment.mastered()
                        && Objects.equals(assessment.goalId(), request.goalId()))
                : Boolean.TRUE.equals(request.restartCurrent())
                ? snapshot.response().actions().stream().anyMatch(action -> "retryAssessment".equals(action.action())
                    && Objects.equals(action.goalId(), request.goalId()))
                : snapshot.response().assessments().stream().anyMatch(assessment -> assessment.startAvailable()
                    && Objects.equals(assessment.goalId(), request.goalId())));
        if (!publishedStart || (!newRoute && (snapshot.evaluation() == null
                || !snapshot.compiled().assessmentGoalIds().contains(request.goalId())
                || snapshot.response().assessments().stream().anyMatch(assessment ->
                        assessment.goalId().equals(request.goalId()) && assessment.mastered())))
                || isExamGoalUnavailableForHardCheck(projection.visibleGoals().get(request.goalId()))) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "This assessment cannot be started.");
        }
        if (newRoute) {
            assertPersonalizationCompleteForLearning(learner);
            var compiled = compileCompletionScope(learner, request.profileId(), projection, completionGraph(learner, projection));
            assertCompletionApplicability(learner, compiled);
            workflow = new CompletionWorkflowState(compiled.profile().id(), compiled.profile().revision(),
                    compiled.curriculumGeneration(), learner.getSelectedCurriculum(), completionScopeDigest(learner),
                    "required", null, null);
        }
        // The explicit assessment choice selects its reviewed section and binds the exam in
        // one transaction. Discovery and rejected starts never change navigation or mastery.
        saveCompletionWorkflow(learner, workflow.withDirectAssessment(new CompletionWorkflowState.DirectAssessmentContext(
                provider, sessionBinding, request.goalId(), expiresAt)));
        learner.setActiveGoalId(request.goalId()); learner.setLearningState(LearningState.TEACHING);
        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "COMPLETION_ASSESSMENT_START"));
    }

    @org.springframework.beans.factory.annotation.Autowired
    private ChampionPracticeFingerprint championPracticeFingerprint;

    private static final Set<String> SRS_FILTER_EXCLUDE = Set.of(
            "structure",
            "root",
            "module",
            "lesson",
            "vocabulary",
            "grammar",
            "practice",
            "A1",
            "A2",
            "B1",
            "B2",
            "C1",
            "C2");

    private static final String COMBINED_COURSE_FILTER_ID = "GK+LK";
    private static final Set<String> COURSE_FILTER_IDS = Set.of("GK", "LK", COMBINED_COURSE_FILTER_ID);
    private static final Set<String> DURATION_MODEL_FILTER_IDS = Set.of("G8", "G9");
    private static final String STAGE_SCOPE_SEK1_ID = "__skillpilot_stage_scope_sek1__";
    private static final String STAGE_SCOPE_SEK2_ID = "__skillpilot_stage_scope_sek2__";
    private static final String APPLICABILITY_DIMENSION_JURISDICTION = "jurisdiction";
    private static final String APPLICABILITY_DIMENSION_DURATION_MODEL = "durationModel";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_GYMNASIUM_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String LEGACY_HE_BROAD_TRANSFORMATION_GOAL_ID = "9f8fcb66-4cf0-4e65-a6cb-9d7f7cb0f2d6";

    @Value("${skillpilot.security.signing-secret}")
    private String signingSecret;

    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            GoalMappingService goalMappingService,
            DeckResourceService deckResourceService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher) {
        this(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                null,
                objectMapper,
                eventPublisher,
                new NoOpTransactionManager(),
                null);
    }

    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            GoalMappingService goalMappingService,
            DeckResourceService deckResourceService,
            CompositionViewService compositionViewService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            PlatformTransactionManager transactionManager) {
        this(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                compositionViewService,
                objectMapper,
                eventPublisher,
                transactionManager,
                null);
    }

    @Autowired
    public LearnerService(
            LearnerRepository learnerRepository,
            LearnerClientStateRepository learnerClientStateRepository,
            MasteryRepository masteryRepository,
            PlannedGoalRepository plannedGoalRepository,
            LandscapeService landscapeService,
            GoalMappingService goalMappingService,
            DeckResourceService deckResourceService,
            CompositionViewService compositionViewService,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            PlatformTransactionManager transactionManager,
            LearnerLearningPlanRepository learnerLearningPlanRepository) {
        this.learnerRepository = learnerRepository;
        this.learnerClientStateRepository = learnerClientStateRepository;
        this.masteryRepository = masteryRepository;
        this.plannedGoalRepository = plannedGoalRepository;
        this.learnerLearningPlanRepository = learnerLearningPlanRepository;
        this.landscapeService = landscapeService;
        this.goalMappingService = goalMappingService;
        this.deckResourceService = deckResourceService;
        this.compositionViewService = compositionViewService;
        this.objectMapper = objectMapper;
        this.deckCatalog = new SrsDeckCatalog(objectMapper != null ? objectMapper : new ObjectMapper());
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    private static final class NoOpTransactionManager implements PlatformTransactionManager {
        @Override
        public TransactionStatus getTransaction(TransactionDefinition definition) {
            return new SimpleTransactionStatus();
        }

        @Override
        public void commit(TransactionStatus status) {
            // no-op
        }

        @Override
        public void rollback(TransactionStatus status) {
            // no-op
        }
    }

    /**
     * Verified Recall input of the active deck goal.
     *
     * @param cards every card of the deck goal, in deck order
     * @param scope the cards a new batch may contain: the unit context's cards of this deck, or all cards
     * @param unitScope whether {@code scope} is a unit context
     * @param release the release rule of this request
     * @param states the typed stored states of the deck goal's cards (no entry: never practised)
     */
    private record VerifiedRecallContext(
            LearningGoal goal,
            List<SrsCard> cards,
            List<SrsCard> scope,
            boolean unitScope,
            SrsCardRelease release,
            Map<String, SrsCardStateSummary> states) {
    }

    private record VerifiedRecallDeckStatus(
            int verifiedCards,
            int pendingCards,
            int eligibleCards,
            int blockedCards,
            int sameDayBlockedCards,
            Instant nextEligibleAt) {
    }

    private record GlobalAssessmentFocus(
            Set<String> allGoalIds,
            Set<String> explicitlyFocusedGoalIds) {
    }

    private record MutablePersonalCurriculumDocument(
            Map<String, Object> document,
            Map<String, Object> payload) {
    }

    private boolean isSrsGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        Map<String, Object> extended = goal.getExtendedData();
        if (extended != null && extended.get("vocabularySource") instanceof String) {
            return true;
        }
        List<String> tags = goal.getTags();
        if (tags == null) {
            return false;
        }
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("srs-deck") || "memorization".equals(tag)) {
                return true;
            }
        }
        return false;
    }

    private String getVocabularySource(LearningGoal goal) {
        return getVocabularySource(goal, null);
    }

    private String getVocabularySource(LearningGoal goal, String language) {
        if (goal == null) {
            return null;
        }
        Map<String, Object> extended = goal.getExtendedData();
        if (extended == null) {
            return null;
        }
        Object source = extended.get("vocabularySource");
        Object sourceEn = extended.get("vocabularySourceEn");
        boolean preferEnglish = language != null && language.trim().toLowerCase(Locale.ROOT).startsWith("en");
        Object preferred = preferEnglish ? sourceEn : source;
        Object fallback = preferEnglish ? source : sourceEn;
        if (preferred instanceof String text && !text.isBlank()) {
            return text;
        }
        return fallback instanceof String text && !text.isBlank() ? text : null;
    }

    private List<String> getSrsFilterTags(LearningGoal goal) {
        List<String> tags = goal != null ? goal.getTags() : null;
        if (tags == null || tags.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> selectTags = new ArrayList<>();
        for (String tag : tags) {
            if (tag != null && tag.startsWith("select:")) {
                selectTags.add(tag);
            }
        }
        if (!selectTags.isEmpty()) {
            return selectTags;
        }
        List<String> filtered = new ArrayList<>();
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("srs-deck")) {
                continue;
            }
            if (SRS_FILTER_EXCLUDE.contains(tag)) {
                continue;
            }
            filtered.add(tag);
        }
        return filtered;
    }

    /** The shared parsed deck of a goal; an unresolvable reference is the missing deck. */
    private SrsDeck srsDeck(LearningGoal goal, String vocabularySource, Map<Resource, SrsDeck> callLocal) {
        if (goal == null || vocabularySource == null || vocabularySource.isBlank()) {
            return SrsDeck.missing();
        }
        return deckCatalog.deck(deckResourceService.resolveDeckResource(goal.getId(), vocabularySource), callLocal);
    }

    private SrsCardStateStore.NodeState loadCardNode(String skillpilotId, String nodeId) {
        return cardStateStore == null
                ? new SrsCardStateStore.NodeState(null, Map.of(), null, null)
                : cardStateStore.loadNode(skillpilotId, nodeId);
    }

    private Map<String, Object> loadSrsStateStrict(String skillpilotId, String nodeId) {
        return loadCardNode(skillpilotId, nodeId).readable();
    }

    private Map<String, SrsCardStateStore.NodeSummary> cardStateSummaries(
            String skillpilotId, Collection<String> nodeIds) {
        return cardStateStore == null ? Map.of() : cardStateStore.summaries(skillpilotId, nodeIds);
    }

    /** Typed states of one deck goal; a damaged node is a technical failure, as before. */
    private Map<String, SrsCardStateSummary> readableCardStates(String skillpilotId, String nodeId) {
        SrsCardStateStore.NodeSummary node = cardStateSummaries(skillpilotId, List.of(nodeId)).get(nodeId);
        if (node == null) {
            return Map.of();
        }
        node.requireReadable();
        return node.cards();
    }

    private SrsCardStateStore requireCardStateStore() {
        if (cardStateStore == null) {
            throw new IllegalStateException("Card state storage is unavailable");
        }
        return cardStateStore;
    }

    private record SrsGoalSnapshot(boolean mastered, boolean recallAvailable) { }

    /**
     * One call-local input snapshot shared by strict completion and tolerant normal projections.
     *
     * <p>Decks come from the shared catalog and card states from one typed query
     * per 500 goals; no state object is parsed. Recall availability is computed
     * only when a release rule is supplied, and the rule is requested only for a
     * goal that still has an untested, not yet passed card.</p>
     */
    private Map<String, SrsGoalSnapshot> resolveSrsGoalSnapshots(
            String skillpilotId, Collection<LearningGoal> goals, boolean strict, Supplier<SrsCardRelease> release,
            GoalProjection projection) {
        Map<String, LearningGoal> srsGoals = new LinkedHashMap<>();
        if (goals != null) for (LearningGoal goal : goals) {
            if (!isSrsGoal(goal)) continue;
            if (goal.getId() == null || goal.getId().isBlank()) {
                if (strict) throw new SrsStateUnavailableException("Memorization goal identifier is missing");
                continue;
            }
            srsGoals.put(goal.getId(), goal);
        }
        if (srsGoals.isEmpty()) return Map.of();
        Map<String, SrsCardStateStore.NodeSummary> storedByGoal;
        try {
            storedByGoal = cardStateSummaries(skillpilotId, srsGoals.keySet());
        } catch (RuntimeException error) {
            if (strict) throw new SrsStateUnavailableException("Memorization state is unavailable", error);
            return Map.of(); // Preserve existing normal mastery instead of fabricating an unsuccessful result.
        }
        // Resource equality identifies paths/classpath objects or actual package bytes;
        // a shared source label alone must not conflate distinct package decks.
        Map<Resource, SrsDeck> decks = new HashMap<>();
        Map<String, SrsGoalSnapshot> result = new LinkedHashMap<>();
        Instant now = Instant.now();
        for (LearningGoal goal : srsGoals.values()) {
            try {
                String source = getVocabularySource(goal);
                if (source == null || source.isBlank()) throw new SrsStateUnavailableException("Memorization deck reference is missing");
                Resource resource = deckResourceService.resolveDeckResource(goal.getId(), source);
                if (resource == null) throw new SrsStateUnavailableException("Required memorization deck is unavailable");
                List<SrsCard> required = filterSrsCards(goal, deckCatalog.deck(resource, decks), true);
                if (required.isEmpty()) throw new SrsStateUnavailableException("Required memorization deck is empty for this goal");
                required = deckCardRelease(projection, goal, SrsCardRelease.all()).countedCards(required);
                if (required.isEmpty()) {
                    result.put(goal.getId(), new SrsGoalSnapshot(false, false));
                    continue;
                }
                SrsCardStateStore.NodeSummary stored = storedByGoal.get(goal.getId());
                if (stored != null) stored.requireReadable();
                Map<String, SrsCardStateSummary> states = stored == null ? Map.of() : stored.cards();
                result.put(goal.getId(), new SrsGoalSnapshot(SrsCardSelection.deckMastered(required, states),
                        release != null && hasReleasedRecallCard(required, states, now, release)));
            } catch (RuntimeException error) {
                if (strict) {
                    if (error instanceof SrsStateUnavailableException unavailable) throw unavailable;
                    throw new SrsStateUnavailableException("Memorization input is unavailable", error);
                }
                // Omit only the damaged goal. Normal projections retain its stored mastery.
            }
        }
        return Collections.unmodifiableMap(result);
    }

    /** Complete SRS input for a completion snapshot; absence is not a technical failure. */
    @Transactional(readOnly = true)
    public Map<String, Boolean> resolveSrsMasterySnapshot(
            String skillpilotId, Collection<LearningGoal> goals) {
        return resolveSrsMasterySnapshot(skillpilotId, goals, null);
    }

    private Map<String, Boolean> resolveSrsMasterySnapshot(
            String skillpilotId, Collection<LearningGoal> goals, GoalProjection projection) {
        Map<String, Boolean> result = new LinkedHashMap<>();
        resolveSrsGoalSnapshots(skillpilotId, goals, true, null, projection)
                .forEach((id, snapshot) -> result.put(id, snapshot.mastered()));
        return Collections.unmodifiableMap(result);
    }

    private boolean hasReleasedRecallCard(List<SrsCard> cards, Map<String, SrsCardStateSummary> states,
            Instant now, Supplier<SrsCardRelease> release) {
        SrsCardRelease resolved = null;
        for (SrsCard card : cards) {
            SrsCardStateSummary state = states.get(card.id());
            // Only a card that is still open today needs the (lazily computed) release rule.
            if (state != null && (state.recallPassed() || state.testedOn(now, VERIFIED_RECALL_DAY_ZONE))) continue;
            if (resolved == null) resolved = release.get();
            if (SrsCardSelection.recallEligible(card, state, resolved, now, VERIFIED_RECALL_DAY_ZONE)) return true;
        }
        return false;
    }

    private boolean isVerifiedRecallPassed(Object value) {
        if (!(value instanceof Map<?, ?> verified)) {
            return false;
        }
        Object status = verified.get("status");
        Object passedAt = verified.get("passedAt");
        return "passed".equals(status) && passedAt instanceof String text && !text.isBlank();
    }

    private boolean wasVerifiedRecallTestedOn(Object value, Instant instant) {
        if (!(value instanceof Map<?, ?> verified) || instant == null) {
            return false;
        }
        Object lastTestedAt = verified.get("lastTestedAt");
        Instant testedAt = parseInstant(lastTestedAt);
        if (testedAt == null) {
            return false;
        }
        LocalDate testedDate = testedAt.atZone(VERIFIED_RECALL_DAY_ZONE).toLocalDate();
        LocalDate referenceDate = instant.atZone(VERIFIED_RECALL_DAY_ZONE).toLocalDate();
        return testedDate.equals(referenceDate);
    }

    private Instant parseInstant(Object value) {
        return SrsCardStateSummary.parseInstant(value);
    }

    private Instant nextVerifiedRecallEligibleAt(Instant now) {
        return now.atZone(VERIFIED_RECALL_DAY_ZONE)
                .toLocalDate()
                .plusDays(1)
                .atStartOfDay(VERIFIED_RECALL_DAY_ZONE)
                .toInstant();
    }

    /**
     * The release rule of issue #85 for this request: counted understanding
     * goals are the learner-facing targets and any extension goals still required
     * as preparations. Passed goals are stored mastery at the threshold plus
     * unit planning credits.
     */
    private SrsCardRelease cardRelease(GoalProjection projection, Map<String, Double> mastery, Set<String> credits) {
        if (projection == null) {
            return SrsCardRelease.all();
        }
        Set<String> passed = new HashSet<>(credits == null ? Set.of() : credits);
        if (mastery != null) {
            mastery.forEach((goalId, value) -> {
                if (goalId != null && value != null && value >= PLANNING_SCOPE_MASTERY_THRESHOLD) passed.add(goalId);
            });
        }
        return new SrsCardRelease(countedCardOriginGoals(projection), passed);
    }

    private Set<String> countedCardOriginGoals(GoalProjection projection) {
        Set<String> counted = new HashSet<>(projection.targetGoalIds());
        counted.removeAll(projection.prerequisiteOnlyGoalIds());
        // Closure restores necessary extension preparations as learning goals even
        // though navigation treats them as prerequisite-only.
        if (projection.learningScope() != null) counted.addAll(projection.extensionPreparations());
        return counted;
    }

    private SrsCardRelease deckCardRelease(GoalProjection projection, LearningGoal deck, SrsCardRelease release) {
        if (projection == null || projection.removedExtensionGoalIdsByLandscape().isEmpty()) return release;
        String landscapeId = landscapeService.getLandscapeIdForGoal(deck.getId());
        if (landscapeId == null) return release;
        Set<String> removed = projection.removedExtensionGoalIdsByLandscape().get(landscapeId);
        return removed == null ? release : release.excludingRemovedOrigins(removed);
    }

    private SrsCardRelease cardRelease(Learner learner, GoalProjection projection) {
        if (learner == null || projection == null) {
            return SrsCardRelease.all();
        }
        return cardRelease(projection, ordinaryGoalMastery(learner), unitEntryPlanningCredits(learner, projection));
    }

    /**
     * The learner's mastery as {@link #getMastery} projects it, without the card-derived
     * deck goal overlay: understanding goals are ordinary goals, so release needs no card state.
     */
    private Map<String, Double> ordinaryGoalMastery(Learner learner) {
        Map<String, Double> stored = new HashMap<>();
        for (Mastery mastery : masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())) {
            stored.put(mastery.getGoalKey(), mastery.getValue());
        }
        return applyCanonicalMasteryProjection(masteryProjectionGoals(learner), stored,
                resolveProjectionStateFilterId(learner));
    }

    private SrsCardRelease cardRelease(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (learner.getSelectedCurriculum() == null || learner.getSelectedCurriculum().isBlank()) {
            return SrsCardRelease.all();
        }
        return cardRelease(learner, getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum()));
    }

    /** Deck goals without a released card that is eligible today; one batched snapshot for all goals. */
    private Set<String> unavailableVerifiedRecallGoals(
            String skillpilotId, Collection<LearningGoal> goals, Supplier<SrsCardRelease> release,
            GoalProjection projection) {
        List<LearningGoal> memoryGoals = goals == null ? List.of()
                : goals.stream().filter(Objects::nonNull).filter(this::isSrsGoal).toList();
        if (memoryGoals.isEmpty()) return Set.of();
        Map<String, SrsGoalSnapshot> snapshots = resolveSrsGoalSnapshots(
                skillpilotId, memoryGoals, false, SingletonSupplier.of(release), projection);
        Set<String> unavailable = new HashSet<>();
        for (LearningGoal goal : memoryGoals) {
            SrsGoalSnapshot snapshot = snapshots.get(goal.getId());
            if (snapshot == null || !snapshot.recallAvailable()) unavailable.add(goal.getId());
        }
        return unavailable;
    }

    private boolean isSrsGoalUnavailableForVerifiedRecall(
            Learner learner, GoalProjection projection, Map<String, Double> mastery, LearningGoal goal) {
        if (goal == null || !isSrsGoal(goal)) {
            return false;
        }
        return unavailableVerifiedRecallGoals(learner.getSkillpilotId(), List.of(goal),
                () -> cardRelease(projection, mastery, projection == null ? Set.of()
                        : unitEntryPlanningCredits(learner, projection)), projection).contains(goal.getId());
    }

    private List<FrontierGoal> filterVerifiedRecallAvailableMemoryGoals(
            String skillpilotId, List<FrontierGoal> goals) {
        return filterVerifiedRecallAvailableMemoryGoals(skillpilotId, goals, () -> cardRelease(skillpilotId), null);
    }

    private List<FrontierGoal> filterVerifiedRecallAvailableMemoryGoals(
            String skillpilotId, List<FrontierGoal> goals, Supplier<SrsCardRelease> release, GoalProjection projection) {
        if (goals == null || goals.isEmpty()) return goals;
        List<LearningGoal> memoryGoals = goals.stream().filter(this::isMemoryFrontierGoal)
                .map(goal -> landscapeService.getGoalDefinition(goal.id())).filter(Objects::nonNull).toList();
        Map<String, SrsGoalSnapshot> snapshots = resolveSrsGoalSnapshots(
                skillpilotId, memoryGoals, false, SingletonSupplier.of(release), projection);
        return goals.stream().filter(goal -> !isMemoryFrontierGoal(goal)
                || snapshots.containsKey(goal.id()) && snapshots.get(goal.id()).recallAvailable()).toList();
    }

    private Map<String, Double> applySrsMasteryOverlay(String skillpilotId,
            Map<String, LearningGoal> goals, Map<String, Double> mastery) {
        return applySrsMasteryOverlay(skillpilotId, goals, mastery, null);
    }

    private Map<String, Double> applySrsMasteryOverlay(String skillpilotId,
            Map<String, LearningGoal> goals, Map<String, Double> mastery, GoalProjection projection) {
        if (goals == null || goals.isEmpty()) return mastery;
        Map<String, SrsGoalSnapshot> snapshots = resolveSrsGoalSnapshots(skillpilotId, goals.values(), false, null, projection);
        if (snapshots.isEmpty()) return mastery;
        Map<String, Double> result = new HashMap<>(mastery);
        snapshots.forEach((id, snapshot) -> result.put(id, snapshot.mastered() ? 1.0 : 0.0));
        return result;
    }

    /** Counts the existing authoritative card-derived outcomes without per-goal SQL/deck parsing. */
    public long countSrsMastery(String skillpilotId, Set<String> goalIds) {
        if (skillpilotId == null || goalIds == null || goalIds.isEmpty()) return 0;
        List<LearningGoal> goals = goalIds.stream().map(landscapeService::getGoalDefinition).filter(Objects::nonNull).toList();
        return resolveSrsGoalSnapshots(skillpilotId, goals, false, null, null).values().stream().filter(SrsGoalSnapshot::mastered).count();
    }

    private Map<String, MasteryEntryDTO> applySrsMasteryOverlayWithTimestamps(String skillpilotId,
            Map<String, LearningGoal> goals, Map<String, MasteryEntryDTO> mastery) {
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, mastery, null);
    }

    private Map<String, MasteryEntryDTO> applySrsMasteryOverlayWithTimestamps(String skillpilotId,
            Map<String, LearningGoal> goals, Map<String, MasteryEntryDTO> mastery, GoalProjection projection) {
        if (goals == null || goals.isEmpty()) return mastery;
        Map<String, SrsGoalSnapshot> snapshots = resolveSrsGoalSnapshots(skillpilotId, goals.values(), false, null, projection);
        if (snapshots.isEmpty()) return mastery;
        Map<String, MasteryEntryDTO> result = new HashMap<>(mastery);
        Instant now = Instant.now();
        snapshots.forEach((id, snapshot) -> result.put(id, new MasteryEntryDTO(snapshot.mastered() ? 1.0 : 0.0, now)));
        return result;
    }

    @Transactional
    public Learner createLearner(CreateLearnerRequest request) {
        Learner learner = new Learner();
        learner.setSkillpilotId(UUID.randomUUID().toString());
        learner.setLearningState(LearningState.FRONTIER);
        learner.setActiveGoalId(null);

        return learnerRepository.save(learner);
    }

    @Transactional
    public Learner createLearner() {
        return createLearner(null);
    }

    @Transactional(readOnly = true)
    public ClientStateSnapshot getClientState(String skillpilotId, String nodeId) {
        ensureLearnerExists(skillpilotId);
        SrsCardStateStore.NodeState stored = loadCardNode(skillpilotId, nodeId);
        DeckCardLocks locks = deckCardLocks(getLearner(skillpilotId), nodeId);
        return new ClientStateSnapshot(stored.updatedAt(), stored.readable(),
                List.copyOf(locks.locked()), List.copyOf(locks.excluded()));
    }

    private record DeckCardLocks(Set<String> locked, Set<String> excluded) {
        private static final DeckCardLocks NONE = new DeckCardLocks(Set.of(), Set.of());
    }

    /** Locked and excluded cards, in deck order of the German and then the English deck. */
    private DeckCardLocks deckCardLocks(Learner learner, String nodeId) {
        if (learner == null || nodeId == null || nodeId.isBlank()
                || learner.getSelectedCurriculum() == null || learner.getSelectedCurriculum().isBlank()) {
            return DeckCardLocks.NONE;
        }
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        LearningGoal goal = projection.visibleGoals().get(nodeId);
        if (goal == null) goal = landscapeService.getGoalDefinition(nodeId);
        if (goal == null || !isSrsGoal(goal)) return DeckCardLocks.NONE;
        SrsCardRelease release = deckCardRelease(projection, goal, cardRelease(learner, projection));
        Set<String> locked = new LinkedHashSet<>();
        Set<String> excluded = new LinkedHashSet<>();
        Map<Resource, SrsDeck> decks = new HashMap<>();
        for (String language : List.of("de", "en")) {
            for (SrsCard card : filterSrsCards(goal, srsDeck(goal, getVocabularySource(goal, language), decks), false)) {
                if (!release.isReleased(card)) locked.add(card.id());
                if (!release.countsCard(card)) excluded.add(card.id());
            }
        }
        return new DeckCardLocks(locked, excluded);
    }

    @Transactional
    public ClientStateResponse upsertClientState(String skillpilotId, String nodeId, ClientStateRequest request) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        if (request == null) {
            return new ClientStateResponse("ok", Instant.now(), 0);
        }

        SrsCardStateStore.NodeState existing = loadCardNode(skillpilotId, nodeId);
        Instant currentUpdatedAt = existing.updatedAt();
        if (!SrsPracticeStateGuard.matches(currentUpdatedAt, request.expectedUpdatedAt())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "SRS state changed. Reload the current state before synchronizing practice.");
        }
        Map<String, Object> merged;
        try {
            DeckCardLocks locks = deckCardLocks(learner, nodeId);
            // Issue #85: a locked card without stored state is not in the box; its practice entry is ignored.
            Map<String, Object> incoming = SrsPracticeStateGuard.withoutLockedUnstoredCards(
                    request.srsState(), existing.readable(), locks.locked());
            if (incoming != null && !locks.excluded().isEmpty()) {
                incoming = new LinkedHashMap<>(incoming);
                incoming.keySet().removeAll(locks.excluded());
            }
            merged = SrsPracticeStateGuard.mergePractice(existing.readable(), incoming);
            // Keep the schedule and recall result of every excluded card for a later scope change.
            for (String cardId : locks.excluded()) {
                if (existing.readable().containsKey(cardId)) merged.put(cardId, existing.readable().get(cardId));
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid client state payload", exception);
        }
        Instant savedAt = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        // The node's timestamp is the latest of its rows; a whole-node write must exceed all of them.
        if (currentUpdatedAt != null && !savedAt.isAfter(currentUpdatedAt)) {
            savedAt = currentUpdatedAt.truncatedTo(java.time.temporal.ChronoUnit.MICROS)
                    .plus(1, java.time.temporal.ChronoUnit.MICROS);
        }
        requireCardStateStore().replaceNode(skillpilotId, nodeId, merged, savedAt);
        advanceCoachStateRevision(learner);

        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "CLIENT_STATE_UPDATED", nodeId));
        return new ClientStateResponse("ok", savedAt, merged.size());
    }

    @Transactional
    public MemoryPracticeResponse startMemoryPractice(
            String skillpilotId,
            String language,
            MemoryPracticeStartRequest request) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        MemoryPracticeContext context = resolveMemoryPracticeContext(
                skillpilotId,
                request != null ? request.goalId() : null,
                request != null ? request.practiceScopeId() : null,
                language,
                learner);
        return buildMemoryPracticeResponse(language, context, Instant.now());
    }

    @Transactional
    public MemoryPracticeResponse reviewMemoryPracticeCard(
            String skillpilotId,
            String language,
            MemoryPracticeReviewRequest request) {
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "memory practice review requires cardId.");
        }
        int quality = memoryPracticeQuality(request.rating());
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        MemoryPracticeContext context = resolveMemoryPracticeContext(
                skillpilotId,
                request.goalId(),
                request.practiceScopeId(),
                language,
                learner);
        SrsCard card = findSrsCard(context.cards(), request.cardId());
        if (card == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Card is not part of this memorization goal.");
        }

        Instant reviewedAt = Instant.now();
        // A locked or removed card is never due; it is rejected like a scheduled one.
        if (!SrsCardSelection.due(card, context.states().get(card.id()), context.release(), reviewedAt)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Card is not due for memory practice.");
        }

        Map<String, Object> cardState = requireCardStateStore().updateCards(skillpilotId, context.goal().getId(),
                List.of(card.id()), (cardId, previous) -> {
                    int previousInterval = nonNegativeFiniteInt(previous.get("interval"), 0);
                    int previousRepetition = nonNegativeFiniteInt(
                            firstPresent(previous, "repetition", "repetitions"),
                            0);
                    double previousEf = numberValue(firstPresent(previous, "ef", "easeFactor"), 2.5).doubleValue();
                    if (!Double.isFinite(previousEf)) {
                        previousEf = 2.5;
                    }
                    previousEf = Math.max(1.3, previousEf);

                    SrsReviewResult review = calculateSrsReview(
                            quality,
                            previousInterval,
                            previousEf,
                            previousRepetition);
                    previous.put("id", cardId);
                    previous.put("interval", review.interval());
                    previous.put("repetition", review.repetition());
                    previous.put("ef", review.ef());
                    previous.put(
                            "nextReview",
                            reviewedAt.toEpochMilli() + review.interval() * 24L * 60L * 60L * 1000L);
                    return previous;
                }, reviewedAt).get(card.id());

        publishMemoryPracticeChange(learner, context.goal().getId());
        Map<String, SrsCardStateSummary> nextStates = new HashMap<>(context.states());
        nextStates.put(card.id(), SrsCardStateSummary.of(cardState));
        MemoryPracticeResponse response = buildMemoryPracticeResponse(
                language,
                new MemoryPracticeContext(context.goal(), context.title(), context.cards(), context.release(),
                        Collections.unmodifiableMap(nextStates)),
                reviewedAt);
        if (response.progress().dueCards() == 0 && request.practiceScopeId() != null
                && Boolean.TRUE.equals(learner.getAutoPilot()) && learner.getActiveGoalId() == null) {
            var projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
            if (projection.declaredUnits().units().stream().anyMatch(unit -> unit.scopeId().equals(request.practiceScopeId()))) {
                getLearnerState(skillpilotId);
            }
        }
        return response;
    }

    @Transactional
    public VerifiedRecallPromptResponse startVerifiedRecall(
            String skillpilotId,
            String language,
            VerifiedRecallStartRequest request) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        VerifiedRecallContext context = resolveVerifiedRecallContext(
                skillpilotId,
                request != null ? request.goalId() : null,
                language,
                learner);
        return buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                context,
                normalizeVerifiedRecallBatchSize(request != null ? request.batchSize() : null),
                false);
    }

    /** Starts the provider-neutral strict recall flow with a backend-owned batch size. */
    @Transactional
    public VerifiedRecallPromptResponse startVerifiedRecallBatch(
            String skillpilotId,
            String language,
            String goalId) {
        return startVerifiedRecallBatch(
                skillpilotId,
                language,
                goalId,
                DEFAULT_VERIFIED_RECALL_BATCH_SIZE);
    }

    /** Starts a batch whose size was selected by a trusted first-party launcher. */
    @Transactional
    public VerifiedRecallPromptResponse startVerifiedRecallBatch(
            String skillpilotId,
            String language,
            String goalId,
            int batchSize) {
        requireVerifiedRecallBatchSize(batchSize);
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        VerifiedRecallContext context = resolveVerifiedRecallContext(
                skillpilotId,
                goalId,
                language,
                learner);
        return buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                context,
                batchSize,
                true);
    }

    @Transactional
    public VerifiedRecallAnswerResponse getVerifiedRecallAnswer(
            String skillpilotId,
            String language,
            VerifiedRecallAnswerRequest request) {
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall answer requires cardId.");
        }
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        VerifiedRecallContext context =
                resolveVerifiedRecallContext(skillpilotId, request.goalId(), language, learner);
        SrsCard card = findSrsCard(context.cards(), request.cardId());
        if (card == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Card is not part of this memorization goal.");
        }
        requireReleasedForVerifiedRecall(context, card);
        return new VerifiedRecallAnswerResponse(
                verifiedRecallAnswerInstruction(language),
                context.goal().getId(),
                card.id(),
                card.front(),
                card.back(),
                card.category());
    }

    /**
     * Loads the expected answers for one complete, ordered server-issued batch.
     * The caller must pass the immutable card order from the batch receipt; a
     * shortened, reordered, duplicated, stale, or foreign batch is rejected.
     */
    @Transactional
    public VerifiedRecallBatchAnswerResponse getVerifiedRecallAnswersBatch(
            String skillpilotId,
            String language,
            VerifiedRecallBatchAnswerRequest request) {
        return getVerifiedRecallAnswersBatch(skillpilotId, language, request, null);
    }

    /**
     * Loads the expected answers of an issued batch; with {@code practiceScopeId}
     * the batch belongs to the unit check of that unit (issue #85) and the deck
     * goal does not need to be the active goal.
     */
    @Transactional
    public VerifiedRecallBatchAnswerResponse getVerifiedRecallAnswersBatch(
            String skillpilotId,
            String language,
            VerifiedRecallBatchAnswerRequest request,
            String practiceScopeId) {
        if (request == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall answer batch is required.");
        }
        requireVerifiedRecallBatchIssuedAt(request.issuedAt());
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        IssuedRecallBatch issued;
        VerifiedRecallContext context;
        if (practiceScopeId == null) {
            context = resolveVerifiedRecallContext(skillpilotId, request.goalId(), language, learner);
            issued = requireIssuedVerifiedRecallBatch(context, List.of(context.scope()),
                    request.configuredBatchSize(), request.cardIds(), request.issuedAt());
        } else {
            UnitCheckScopes unit = resolveUnitCheckScopes(skillpilotId, learner, request.goalId(), practiceScopeId, language);
            context = unit.context();
            issued = requireIssuedVerifiedRecallBatch(context, unit.scopes(),
                    request.configuredBatchSize(), request.cardIds(), request.issuedAt());
        }
        List<VerifiedRecallBatchAnswerCard> answers = issued.cards().stream()
                .map(card -> new VerifiedRecallBatchAnswerCard(
                        card.id(),
                        card.front(),
                        card.back(),
                        card.category()))
                .toList();
        return new VerifiedRecallBatchAnswerResponse(
                verifiedRecallBatchAnswerInstruction(language),
                context.goal().getId(),
                answers);
    }

    @Transactional
    public VerifiedRecallResultResponse recordVerifiedRecallResult(
            String skillpilotId,
            String language,
            VerifiedRecallResultRequest request) {
        if (request == null || request.cardId() == null || request.cardId().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall result requires cardId.");
        }
        if (request.passed() == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall result requires passed=true or passed=false.");
        }

        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        VerifiedRecallContext context =
                resolveVerifiedRecallContext(skillpilotId, request.goalId(), language, learner);
        SrsCard card = findSrsCard(context.cards(), request.cardId());
        if (card == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Card is not part of this memorization goal.");
        }

        Instant testedAt = Instant.now();
        SrsCardStateSummary previous = context.states().get(card.id());
        if (previous != null && previous.recallPassed()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Card has already been verified for this memorization goal.");
        }
        if (previous != null && previous.testedOn(testedAt, VERIFIED_RECALL_DAY_ZONE)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Card has already been tested today.");
        }
        requireReleasedForVerifiedRecall(context, card);
        Map<String, Object> cardState = requireCardStateStore().updateCards(skillpilotId, context.goal().getId(),
                List.of(card.id()), (cardId, state) -> {
                    state.put("id", cardId);
                    applyVerifiedRecallScheduling(state, request.passed(), testedAt);
                    return state;
                }, testedAt).get(card.id());

        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this, skillpilotId, "CLIENT_STATE_UPDATED", context.goal().getId()));

        VerifiedRecallContext updatedContext = withCardState(context, card.id(), cardState);
        VerifiedRecallPromptResponse next = buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                updatedContext,
                LEGACY_VERIFIED_RECALL_BATCH_SIZE,
                false);
        int verifiedCards = countVerifiedRecall(updatedContext.cards(), updatedContext.states());
        int pendingCards = Math.max(0, updatedContext.cards().size() - verifiedCards);
        boolean masterySaved = false;
        if (pendingCards == 0 && SrsCardSelection.deckMastered(updatedContext.cards(), updatedContext.states())) {
            persistVerifiedRecallMastery(skillpilotId, context.goal());
            if (Boolean.TRUE.equals(learner.getFollowLearningPlans())) {
                getLearnerState(skillpilotId, context.goal().getId(), true, true);
            }
            masterySaved = true;
        }
        return new VerifiedRecallResultResponse(
                card.id(),
                request.passed(),
                verifiedCards,
                pendingCards,
                masterySaved,
                masterySaved ? context.goal().getId() : null,
                verifiedRecallResultInstruction(language, masterySaved),
                next);
    }

    /**
     * Persists one complete verified-recall batch atomically.
     *
     * <p>All structural and state-dependent checks happen before the first
     * mutation. Exactly the batch's card rows are written, the learner revision
     * advances once, and one aggregate learner-state event is published. The
     * returned successor is the authoritative mutable state after normal
     * active-goal, autopilot, and focus-completion transitions have run.</p>
     */
    @Transactional
    public VerifiedRecallBatchResultResponse recordVerifiedRecallResultsBatch(
            String skillpilotId,
            String language,
            VerifiedRecallBatchResultRequest request) {
        return recordVerifiedRecallResultsBatch(skillpilotId, language, request, null);
    }

    /**
     * Persists one complete batch; with {@code practiceScopeId} the batch is a
     * unit check (issue #85). A unit check writes only its cards' rows, derives
     * the deck goal's mastery exactly as before, never writes mastery to another
     * goal, keeps the learner's active ordinary goal and returns to it instead of
     * handing off as after a completed deck goal.
     */
    @Transactional
    public VerifiedRecallBatchResultResponse recordVerifiedRecallResultsBatch(
            String skillpilotId,
            String language,
            VerifiedRecallBatchResultRequest request,
            String practiceScopeId) {
        validateVerifiedRecallBatchResultRequest(request);

        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        VerifiedRecallContext context;
        IssuedRecallBatch issued;
        if (practiceScopeId == null) {
            context = resolveVerifiedRecallContext(skillpilotId, request.goalId(), language, learner);
            issued = requireIssuedVerifiedRecallBatch(context, List.of(context.scope()),
                    request.configuredBatchSize(), request.cardIds(), request.issuedAt());
        } else {
            UnitCheckScopes unit = resolveUnitCheckScopes(skillpilotId, learner, request.goalId(), practiceScopeId, language);
            context = unit.context();
            issued = requireIssuedVerifiedRecallBatch(context, unit.scopes(),
                    request.configuredBatchSize(), request.cardIds(), request.issuedAt());
        }
        Instant testedAt = verifiedRecallNow();
        List<SrsCard> cards = issued.cards();

        // Validate every item before building or persisting any successor state.
        Map<String, Boolean> passedByCard = new LinkedHashMap<>();
        for (int index = 0; index < cards.size(); index++) {
            VerifiedRecallBatchCardResult result = request.results().get(index);
            if (!cards.get(index).id().equals(result.cardId())) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall results must match the complete batch in exact order.");
            }
            passedByCard.put(result.cardId(), result.passed());
        }
        boolean deckGoalWasActive = context.goal().getId().equals(learner.getActiveGoalId());

        Map<String, Map<String, Object>> written = requireCardStateStore().updateCards(skillpilotId,
                context.goal().getId(), List.copyOf(passedByCard.keySet()), (cardId, state) -> {
                    state.put("id", cardId);
                    applyVerifiedRecallScheduling(state, passedByCard.get(cardId), testedAt);
                    return state;
                }, testedAt);
        List<VerifiedRecallBatchSavedResult> savedResults = new ArrayList<>(cards.size());
        Map<String, SrsCardStateSummary> nextStates = new HashMap<>(context.states());
        for (SrsCard card : cards) {
            nextStates.put(card.id(), SrsCardStateSummary.of(written.get(card.id())));
            savedResults.add(new VerifiedRecallBatchSavedResult(card.id(), passedByCard.get(card.id())));
        }

        // The next batch comes from the scope this batch was issued for.
        VerifiedRecallContext updatedContext = new VerifiedRecallContext(context.goal(), context.cards(),
                issued.scope(), context.unitScope(), context.release(), Collections.unmodifiableMap(nextStates));
        int verifiedCards = countVerifiedRecall(updatedContext.cards(), updatedContext.states());
        int pendingCards = Math.max(0, updatedContext.cards().size() - verifiedCards);
        boolean masterySaved = pendingCards == 0
                && SrsCardSelection.deckMastered(updatedContext.cards(), updatedContext.states());
        if (masterySaved) {
            persistVerifiedRecallMastery(skillpilotId, context.goal(), false);
        }

        // One public batch mutation occupies one optimistic-concurrency revision,
        // even when mastery and autopilot also change inside this transaction.
        advanceCoachStateRevision(learner);

        VerifiedRecallPromptResponse next = buildVerifiedRecallPromptResponse(
                skillpilotId,
                language,
                updatedContext,
                request.configuredBatchSize(),
                true);
        // A unit check hands off only when it completed the deck goal that was itself active.
        boolean handOff = masterySaved && (practiceScopeId == null || deckGoalWasActive);
        UnifiedLearnerStateResponse successor = getLearnerState(
                skillpilotId,
                handOff ? context.goal().getId() : null,
                true,
                false);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                skillpilotId,
                "VERIFIED_RECALL_BATCH_UPDATE",
                context.goal().getId()));

        return new VerifiedRecallBatchResultResponse(
                List.copyOf(savedResults),
                verifiedCards,
                pendingCards,
                masterySaved,
                masterySaved ? context.goal().getId() : null,
                next,
                successor);
    }

    private VerifiedRecallContext withCardState(VerifiedRecallContext context, String cardId, Map<String, Object> state) {
        Map<String, SrsCardStateSummary> states = new HashMap<>(context.states());
        states.put(cardId, SrsCardStateSummary.of(state));
        return new VerifiedRecallContext(context.goal(), context.cards(), context.scope(), context.unitScope(),
                context.release(), Collections.unmodifiableMap(states));
    }

    /** A locked card is never eligible for Verified Recall. */
    private void requireReleasedForVerifiedRecall(VerifiedRecallContext context, SrsCard card) {
        if (!context.release().isReleased(card)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Card is not released for Verified Recall yet.");
        }
    }

    private void validateVerifiedRecallBatchResultRequest(VerifiedRecallBatchResultRequest request) {
        if (request == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall result batch is required.");
        }
        requireVerifiedRecallBatchSize(request.configuredBatchSize());
        requireVerifiedRecallBatchIssuedAt(request.issuedAt());
        requireNonEmptyDistinctVerifiedRecallCardIds(request.cardIds());
        if (request.results() == null || request.results().isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall results must not be empty.");
        }
        if (request.results().size() != request.cardIds().size()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall results must cover the complete batch.");
        }
        for (int index = 0; index < request.results().size(); index++) {
            VerifiedRecallBatchCardResult result = request.results().get(index);
            if (result == null || result.cardId() == null || result.cardId().isBlank()) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall result cardId must not be empty.");
            }
            if (result.passed() == null) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall result requires passed=true or passed=false for every card.");
            }
            if (!request.cardIds().get(index).equals(result.cardId())) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall results must match the complete batch in exact order.");
            }
        }
    }

    /** A server-issued Verified Recall batch and the scope it was issued from. */
    private record IssuedRecallBatch(List<SrsCard> scope, List<SrsCard> cards) {
    }

    /**
     * Validates a server-issued batch against the scope it was issued for.
     *
     * <p>The batch must equal the selection the server makes at the issue
     * instant for one of the candidate scopes: the whole deck for the deck
     * goal's own check, or the issued unit's cards for a unit check. A change of
     * the learner's unit context between issue and grading therefore keeps a
     * unit batch answerable and gradable for exactly its cards, while a
     * shortened, reordered, re-graded or otherwise stale batch matches none.</p>
     */
    private IssuedRecallBatch requireIssuedVerifiedRecallBatch(
            VerifiedRecallContext context,
            List<List<SrsCard>> candidateScopes,
            int batchSize,
            List<String> cardIds,
            Instant issuedAt) {
        requireVerifiedRecallBatchSize(batchSize);
        requireNonEmptyDistinctVerifiedRecallCardIds(cardIds);
        List<SrsCard> scope = SrsCardSelection.matchIssuedScope(candidateScopes, cardIds, context.states(),
                context.release(), issuedAt, VERIFIED_RECALL_DAY_ZONE, batchSize).orElseThrow(() ->
                new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                        "verified-recall batch is incomplete, reordered, or no longer current."));
        List<SrsCard> expected = SrsCardSelection.nextRecallBatch(scope, context.states(), context.release(),
                issuedAt, VERIFIED_RECALL_DAY_ZONE, batchSize);
        for (SrsCard card : expected) {
            SrsCardStateSummary state = context.states().get(card.id());
            if (state != null && state.testedAfter(issuedAt)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "verified-recall batch changed after it was issued.");
            }
        }
        return new IssuedRecallBatch(scope, expected);
    }

    private List<SrsCard> requireCurrentVerifiedRecallBatch(
            VerifiedRecallContext context,
            int batchSize,
            List<String> cardIds,
            Instant issuedAt) {
        return requireIssuedVerifiedRecallBatch(context, List.of(context.scope()), batchSize, cardIds, issuedAt).cards();
    }

    private void requireVerifiedRecallBatchIssuedAt(Instant issuedAt) {
        if (issuedAt == null || issuedAt.isAfter(verifiedRecallNow().plusSeconds(300))) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall batch issuedAt is invalid.");
        }
    }

    private void requireVerifiedRecallBatchSize(int batchSize) {
        if (batchSize < 1 || batchSize > MAX_VERIFIED_RECALL_BATCH_SIZE) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall batchSize must be between 1 and 20.");
        }
    }

    private void requireNonEmptyDistinctVerifiedRecallCardIds(List<String> cardIds) {
        if (cardIds == null || cardIds.isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall batch cardIds must not be empty.");
        }
        if (cardIds.size() > MAX_VERIFIED_RECALL_BATCH_SIZE) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "verified-recall batch exceeds the maximum card count.");
        }
        LinkedHashSet<String> distinct = new LinkedHashSet<>();
        for (String cardId : cardIds) {
            if (cardId == null || cardId.isBlank()) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall batch cardId must not be empty.");
            }
            if (!distinct.add(cardId)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "verified-recall batch cardIds must not contain duplicates.");
            }
        }
    }

    private void persistVerifiedRecallMastery(String skillpilotId, LearningGoal goal) {
        persistVerifiedRecallMastery(skillpilotId, goal, true);
    }

    private void persistVerifiedRecallMastery(
            String skillpilotId,
            LearningGoal goal,
            boolean publishEvent) {
        if (goal == null || goal.getId() == null || goal.getId().isBlank()) {
            return;
        }
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        MasteryId id = new MasteryId(skillpilotId, goal.getId());
        Mastery mastery = masteryRepository.findById(id)
                .orElseGet(() -> new Mastery(learner, goal.getId(), 0.0));
        double previousValue = mastery.getValue();
        boolean masteryChanged = mastery.getValue() < 1.0;
        mastery.setValue(1.0);
        masteryRepository.save(mastery);
        recordGoalCompletion(learner, goal.getId(), goal, previousValue, 1.0, verifiedRecallNow(), "verified_recall");

        boolean activeGoalCleared = goal.getId().equals(learner.getActiveGoalId());
        if (activeGoalCleared) {
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
            learnerRepository.save(learner);
        }
        if (masteryChanged || activeGoalCleared) resumePendingUnitEntry(learner, goal.getId());

        if (publishEvent && (masteryChanged || activeGoalCleared)) {
            eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "MASTERY_UPDATE"));
        }
    }

    private record MemoryPracticeContext(LearningGoal goal, String title, List<SrsCard> cards,
            SrsCardRelease release, Map<String, SrsCardStateSummary> states) {}

    private MemoryPracticeContext resolveMemoryPracticeContext(String skillpilotId, String goalId,
            String practiceScopeId, String language, Learner learner) {
        if (practiceScopeId == null) {
            VerifiedRecallContext full = resolveVerifiedRecallContext(skillpilotId, goalId, language, learner);
            return new MemoryPracticeContext(full.goal(), full.goal().getTitle(), full.cards(), full.release(),
                    full.states());
        }
        if (goalId == null || !hasCompletedPersonalCurriculum(learner)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Unit flashcard practice requires the learner’s selected curriculum and deck.");
        }
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        // A completion route that owns navigation still wins over guided card work.
        if (!completionRouteOwnsNavigation(learner)) {
            CardContext context = resolveCardContext(learner, projection, language);
            if (context != null && practiceScopeId.equals(context.section().scopeId())) {
                List<SrsCard> cards = context.cardsByDeckGoal().get(goalId);
                if (cards != null && !cards.isEmpty()) {
                    // One mastery and credit read serves the orientation gate and the release rule.
                    Map<String, Double> mastery = ordinaryGoalMastery(learner);
                    Set<String> credits = unitEntryPlanningCredits(learner, projection);
                    if (requiredUnitOrientationGoalId(learner, projection, context.section().focusId(),
                            null, mastery, credits) == null) {
                        String sectionTitle = context.section().title();
                        String title = (isEnglish(language) ? "Flashcards · " : "Lernkarten · ") + sectionTitle;
                        return new MemoryPracticeContext(projection.visibleGoals().get(goalId), title, cards,
                                cardRelease(projection, mastery, credits), readableCardStates(skillpilotId, goalId));
                    }
                }
            }
        }
        throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "No flashcard practice is offered for this unit in the current learner context.");
    }

    /**
     * One learner-facing unit and, per deck goal, the cards of its atomic goals (issue #85).
     *
     * @param cardsByDeckGoal deck goal id to the unit's cards of that deck in deck order;
     *        every entry is non-empty and the map follows projection order
     */
    private record CardContext(ProjectedUnit section,
            Map<String, List<SrsCard>> cardsByDeckGoal) {
    }

    /**
     * The card context: the learner's explicit unit focus when the active goal
     * lies inside it, otherwise the innermost learner-facing unit on the active
     * goal's unit path that has cards. Without an active goal the explicit unit
     * focus is the context; without both, the goal of the learner's latest
     * completion anchors it, so the goal boundary after a completed goal keeps
     * that goal's unit (issue #85). The context is never widened to the subject root.
     */
    private CardContext resolveCardContext(Learner learner, GoalProjection projection, String language) {
        return resolveCardContext(learner, projection, language, () -> latestGoalCompletion(learner));
    }

    private CardContext resolveCardContext(Learner learner, GoalProjection projection, String language,
            Supplier<LearnerGoalCompletion> latestCompletion) {
        if (learner == null || projection == null || !hasCompletedPersonalCurriculum(learner)
                || (projection.compositionViewIds().isEmpty() && projection.declaredUnits().units().isEmpty())) return null;
        String focusId = explicitUnitFocusId(learner, projection);
        String activeId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), projection.visibleGoals(), false);
        var focus = projectedCardUnit(focusId, projection, language);
        if (activeId == null && focus == null) {
            LearnerGoalCompletion anchor = latestCompletion.get();
            activeId = anchor == null ? null : resolveGoalIdInVisibleGoals(anchor.getGoalId(), projection.visibleGoals(), false);
        }
        List<ProjectedUnit> path;
        if (activeId == null) {
            path = focus == null ? List.of() : List.of(focus);
        } else if (!projection.declaredUnits().path(activeId).isEmpty()) {
            path = projection.declaredUnits().path(activeId).stream().map(unit -> ProjectedUnit.declared(unit, language)).toList();
            if (focus != null && path.stream().anyMatch(unit -> unit.focusId().equals(focus.focusId()))) path = List.of(focus);
        } else {
            String contextGoalId = activeId;
            var paths = projection.compositionViewIds().stream()
                    .flatMap(viewId -> projectedFocusPaths(viewId, contextGoalId, projection).stream()).toList();
            if (focus != null && paths.stream().flatMap(List::stream).anyMatch(unit ->
                    unit.viewId().equals(focus.viewId()) && unit.nodeId().equals(focus.scopeId()))) {
                path = List.of(focus);
            } else {
                path = preferredCoachUnitPath(paths, new LinkedHashSet<>(resolveEffectiveProjectedFocusIds(learner, projection)))
                        .stream().map(section -> projectedViewUnit(section, projection, language)).filter(Objects::nonNull).toList();
            }
        }
        Map<Resource, SrsDeck> decks = new HashMap<>();
        for (var section : path) {
            var cards = unitCards(projection, section, language, decks);
            if (!cards.isEmpty()) return new CardContext(section, cards);
        }
        return null;
    }

    private ProjectedUnit projectedCardUnit(String focusId, GoalProjection projection, String language) {
        if (focusId == null) return null;
        var declared = projection.declaredUnits().focus(focusId);
        if (declared != null) return ProjectedUnit.declared(declared, language);
        return compositionViewService == null ? null
                : projectedViewUnit(projectedStructure(focusId, projection), projection, language);
    }

    private ProjectedUnit projectedViewUnit(CompositionViewService.CompositionStructureResolution section,
            GoalProjection projection, String language) {
        if (section == null || !projection.compositionViewIds().contains(section.viewId())) return null;
        var view = compositionViewService.findViewById(section.viewId());
        if (view == null || !(view.get("landscapeId") instanceof String landscapeId)) return null;
        return new ProjectedUnit(landscapeId, section.viewId(), section.syntheticGoalId(), section.nodeId(), null,
                coachSectionTitle(section, projection, language), null);
    }

    /** The learner's latest completion record, or {@code null}; hand-built fixtures have no ledger. */
    private LearnerGoalCompletion latestGoalCompletion(Learner learner) {
        return goalCompletionService == null || learner == null ? null
                : goalCompletionService.latest(learner.getSkillpilotId()).orElse(null);
    }

    /**
     * The cards of a unit: of every deck goal in the target projection (same
     * landscape), the cards whose understanding goals intersect the unit's
     * atomic content goals at every level of the unit hierarchy. Prerequisite-only
     * entries, assessments, deck goals and orientation goals are not content goals.
     */
    private Map<String, List<SrsCard>> unitCards(GoalProjection projection,
            ProjectedUnit section, String language, Map<Resource, SrsDeck> decks) {
        String landscapeId = section.landscapeId();
        boolean explicitExtensions = projection.explicitExtensionLandscapeIds().contains(landscapeId);
        Set<String> members = section.declaration() == null ? projectedAtomicTargetIds(List.of(section.focusId()), projection)
                : section.declaration().atoms();
        Set<String> atoms = members.stream()
                .filter(id -> !projection.prerequisiteOnlyGoalIds().contains(id)
                        && (!explicitExtensions || projection.targetGoalIds().contains(id))
                        && landscapeId.equals(landscapeService.getLandscapeIdForGoal(id)))
                .filter(id -> {
                    LearningGoal member = projection.visibleGoals().get(id);
                    return !isExamGoal(member) && !isSrsGoal(member) && !isOrientationGoal(member);
                }).collect(Collectors.toSet());
        if (atoms.isEmpty()) return Map.of();
        Map<String, List<SrsCard>> result = new LinkedHashMap<>();
        for (String deckId : unitDeckGoalIds(projection, landscapeId, language)) {
            LearningGoal deckGoal = projection.visibleGoals().get(deckId);
            SrsDeck deck = srsDeck(deckGoal, getVocabularySource(deckGoal, language), decks);
            List<SrsCard> byGoal = deck.cardsForUnderstandingGoals(atoms);
            if (byGoal.isEmpty()) continue;
            List<SrsCard> selected = filterSrsCards(deckGoal, deck, false);
            Set<SrsCard> selectedCards = Collections.newSetFromMap(new java.util.IdentityHashMap<>());
            selectedCards.addAll(selected);
            List<SrsCard> cards = selected.size() == deck.cards(false).size() ? byGoal
                    : byGoal.stream().filter(selectedCards::contains).toList();
            if (!cards.isEmpty()) result.put(deckId, cards);
        }
        return result;
    }

    /** Learner-facing atomic deck goals of the target projection in one landscape, in projection order. */
    private List<String> unitDeckGoalIds(GoalProjection projection, String landscapeId, String language) {
        List<String> decks = new ArrayList<>();
        for (var entry : projection.visibleGoals().entrySet()) {
            String id = entry.getKey();
            LearningGoal goal = entry.getValue();
            if (!projection.targetGoalIds().contains(id) || projection.prerequisiteOnlyGoalIds().contains(id)
                    || !isAtomicGoal(goal) || !isSrsGoal(goal)) continue;
            String source = getVocabularySource(goal, language);
            if (source == null || source.isBlank() || !landscapeId.equals(landscapeService.getLandscapeIdForGoal(id))) continue;
            decks.add(id);
        }
        return decks;
    }

    /**
     * The card box of the learner's current card context, with the gates of guided card work.
     *
     * @param states per deck goal of the context, the typed card states; a damaged deck state is absent
     */
    private record UnitCardBox(CardContext context, Map<String, SrsCardSelection.BoxTally> tallies,
            SrsCardRelease release, Map<String, Map<String, SrsCardStateSummary>> states) {
    }

    private UnitCardBox unitCardBox(Learner learner, GoalProjection projection, String language,
            Map<String, Double> mastery, Set<String> credits) {
        return unitCardBox(learner, projection, language, mastery, credits, () -> latestGoalCompletion(learner));
    }

    private UnitCardBox unitCardBox(Learner learner, GoalProjection projection, String language,
            Map<String, Double> mastery, Set<String> credits, Supplier<LearnerGoalCompletion> latestCompletion) {
        if (learner == null || projection == null || completionRouteOwnsNavigation(learner)) return null;
        CardContext context = resolveCardContext(learner, projection, language, latestCompletion);
        if (context == null || requiredUnitOrientationGoalId(learner, projection,
                context.section().focusId(), null, mastery, credits) != null) return null;
        SrsCardRelease release = cardRelease(projection, mastery, credits);
        Map<String, SrsCardStateStore.NodeSummary> stored =
                cardStateSummaries(learner.getSkillpilotId(), context.cardsByDeckGoal().keySet());
        Instant now = Instant.now();
        Map<String, SrsCardSelection.BoxTally> tallies = new LinkedHashMap<>();
        Map<String, Map<String, SrsCardStateSummary>> states = new LinkedHashMap<>();
        context.cardsByDeckGoal().forEach((deckId, cards) -> {
            SrsCardStateStore.NodeSummary node = stored.get(deckId);
            if (node != null && node.damaged()) return; // A damaged deck state offers no card work.
            Map<String, SrsCardStateSummary> deckStates = node == null ? Map.of() : node.cards();
            states.put(deckId, deckStates);
            tallies.put(deckId, SrsCardSelection.tally(cards, deckStates, release, now));
        });
        return new UnitCardBox(context, tallies, release, states);
    }

    /** The deck goal the unit check covers: the first of the context with a card a batch may contain now. */
    private String unitCheckDeckGoalId(UnitCardBox box, Instant now) {
        for (var entry : box.context().cardsByDeckGoal().entrySet()) {
            Map<String, SrsCardStateSummary> states = box.states().get(entry.getKey());
            if (states != null && SrsCardSelection.recallEligibleCount(entry.getValue(), states, box.release(), now,
                    VERIFIED_RECALL_DAY_ZONE) > 0) return entry.getKey();
        }
        return null;
    }

    /**
     * Facts for the coach's card step in the learner's current context (issue #85).
     *
     * <p>Counts and identifiers only: no card text and no learner identifier. It
     * reads the shared deck catalog (no deck parsing after the first read of a
     * runtime generation), the learner's mastery and unit credits once, the
     * typed card states of the context's deck goals with one query and the
     * latest completion record once. While the active goal is itself a deck goal
     * or an exam, that goal's workflow owns card work and the step is empty.</p>
     */
    @Transactional(readOnly = true)
    public SrsCardStepFacts getCardStepFacts(String skillpilotId, String language) {
        Learner learner = getLearner(skillpilotId);
        if (!hasCompletedPersonalCurriculum(learner)) return SrsCardStepFacts.none();
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String activeId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), projection.visibleGoals(), false);
        LearningGoal active = activeId == null ? null : projection.visibleGoals().get(activeId);
        if (active != null && (isSrsGoal(active) || isExamGoal(active))) return SrsCardStepFacts.none();
        Map<String, Double> mastery = ordinaryGoalMastery(learner);
        Set<String> credits = unitEntryPlanningCredits(learner, projection);
        Supplier<LearnerGoalCompletion> latest = SingletonSupplier.of(() -> latestGoalCompletion(learner));
        UnitCardBox box = unitCardBox(learner, projection, language, mastery, credits, latest);
        if (box == null) return SrsCardStepFacts.none();
        List<String> deckGoalIds = new ArrayList<>();
        String practiceGoalId = null;
        int dueCards = 0;
        int boxCards = 0;
        boolean ready = false;
        boolean allReady = true;
        for (var entry : box.tallies().entrySet()) {
            SrsCardSelection.BoxTally tally = entry.getValue();
            if (tally.boxCards() == 0) continue;
            deckGoalIds.add(entry.getKey());
            if (practiceGoalId == null && tally.dueCards() > 0) practiceGoalId = entry.getKey();
            dueCards += tally.dueCards();
            boxCards += tally.boxCards();
            ready = true;
            allReady &= tally.recallProposalReady();
        }
        String scopeId = box.context().section().scopeId();
        String checkGoalId = unitCheckDeckGoalId(box, verifiedRecallNow());
        boolean proposal = ready && allReady;
        String offerKey = null;
        if (practiceGoalId != null || (proposal && checkGoalId != null)) {
            LearnerGoalCompletion boundary = latest.get();
            offerKey = SrsCardStepFacts.offerKey(boundary == null ? null
                    : boundary.getId() + "@" + boundary.getOccurredAt().toEpochMilli(), scopeId, practiceGoalId);
        }
        return new SrsCardStepFacts(scopeId, List.copyOf(deckGoalIds), dueCards, boxCards, proposal,
                practiceGoalId, checkGoalId, Boolean.TRUE.equals(learner.getAutoPilot()), offerKey);
    }

    /**
     * Starts the unit check of the learner's current card context (issue #85):
     * one server-sized batch of the context unit's released, not yet passed
     * cards of one deck goal that were not tested today, without the deck goal
     * being the active goal. The orientation and completion-route gates of
     * guided card work apply. The returned scope binds the batch to its unit.
     */
    @Transactional
    public UnitCheckStart startVerifiedRecallUnitCheck(String skillpilotId, String language) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        if (!hasCompletedPersonalCurriculum(learner)) throw unitCheckUnavailable();
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Map<String, Double> mastery = ordinaryGoalMastery(learner);
        UnitCardBox box = unitCardBox(learner, projection, language, mastery, unitEntryPlanningCredits(learner, projection));
        String deckGoalId = box == null ? null : unitCheckDeckGoalId(box, verifiedRecallNow());
        if (deckGoalId == null) throw unitCheckUnavailable();
        LearningGoal goal = projection.visibleGoals().get(deckGoalId);
        SrsCardRelease release = deckCardRelease(projection, goal, box.release());
        VerifiedRecallContext context = new VerifiedRecallContext(goal, requireDeckGoalCards(goal, language, release),
                box.context().cardsByDeckGoal().get(deckGoalId), true, release, box.states().get(deckGoalId));
        return new UnitCheckStart(deckGoalId, box.context().section().scopeId(), buildVerifiedRecallPromptResponse(
                skillpilotId, language, context, DEFAULT_VERIFIED_RECALL_BATCH_SIZE, true));
    }

    private ResponseStatusException unitCheckUnavailable() {
        return new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                "No unit card check is available in the current learner context.");
    }

    /** A unit check's deck goal context and every scope its issued unit can have in the learner's views. */
    private record UnitCheckScopes(VerifiedRecallContext context, List<List<SrsCard>> scopes) {
    }

    /**
     * Resolves an issued unit check for its answers and results: the deck goal
     * must still be a learner-facing deck goal of the target projection and the
     * unit a learner-facing unit with cards of that deck. The current card
     * context is not consulted, so a batch outlives a change of the context.
     */
    private UnitCheckScopes resolveUnitCheckScopes(String skillpilotId, Learner learner, String deckGoalId,
            String practiceScopeId, String language) {
        if (deckGoalId == null || deckGoalId.isBlank() || practiceScopeId.isBlank()
                || !hasCompletedPersonalCurriculum(learner)) {
            throw unitCheckUnavailable();
        }
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        LearningGoal goal = projection.visibleGoals().get(deckGoalId);
        if (goal == null || !projection.targetGoalIds().contains(deckGoalId)
                || projection.prerequisiteOnlyGoalIds().contains(deckGoalId) || !isAtomicGoal(goal) || !isSrsGoal(goal)) {
            throw unitCheckUnavailable();
        }
        SrsCardRelease release = deckCardRelease(projection, goal, cardRelease(learner, projection));
        List<SrsCard> cards = requireDeckGoalCards(goal, language, release);
        Map<Resource, SrsDeck> decks = new HashMap<>();
        List<List<SrsCard>> scopes = new ArrayList<>();
        List<ProjectedUnit> sections = new ArrayList<>();
        for (String viewId : projection.compositionViewIds()) {
            var section = projectedViewUnit(projectedStructure(
                    "composition:" + viewId + ":structure:" + practiceScopeId, projection), projection, language);
            if (section != null) sections.add(section);
        }
        projection.declaredUnits().units().stream().filter(unit -> practiceScopeId.equals(unit.scopeId()))
                .map(unit -> ProjectedUnit.declared(unit, language)).forEach(sections::add);
        for (var section : sections) {
            List<SrsCard> unit = unitCards(projection, section, language, decks).get(deckGoalId);
            if (unit != null && !unit.isEmpty() && !scopes.contains(unit)) scopes.add(unit);
        }
        if (scopes.isEmpty()) throw unitCheckUnavailable();
        return new UnitCheckScopes(new VerifiedRecallContext(goal, cards, scopes.getFirst(), true,
                release, readableCardStates(skillpilotId, deckGoalId)), List.copyOf(scopes));
    }

    /**
     * Verified Recall of the active deck goal covers the whole deck goal: its
     * released, not yet passed cards, exactly the cards that make the deck goal
     * available on the frontier and that its mastery needs (issue #85). The unit
     * check of a card context is the separate {@link #startVerifiedRecallUnitCheck}.
     */
    private VerifiedRecallContext resolveVerifiedRecallContext(
            String skillpilotId,
            String requestedGoalId,
            String language,
            Learner lockedLearner) {
        LearningGoal goal = requireActiveVisibleMemoryGoal(lockedLearner, requestedGoalId);
        GoalProjection projection = getGoalProjection(
                lockedLearner.getSelectedCurriculum(), lockedLearner.getPersonalCurriculum());
        SrsCardRelease release = deckCardRelease(projection, goal, cardRelease(lockedLearner, projection));
        List<SrsCard> cards = requireDeckGoalCards(goal, language, release);
        return new VerifiedRecallContext(goal, cards, cards, false, release,
                readableCardStates(skillpilotId, goal.getId()));
    }

    /** The deck goal's counted cards in deck order. */
    private List<SrsCard> requireDeckGoalCards(LearningGoal goal, String language, SrsCardRelease release) {
        String source = getVocabularySource(goal, language);
        if (source == null || source.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "The memorization goal has no vocabulary source.");
        }
        List<SrsCard> cards = filterSrsCards(goal, srsDeck(goal, source, null), false);
        if (cards.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No cards match this memorization goal.");
        }
        List<SrsCard> counted = release.countedCards(cards);
        if (counted.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "No cards count for this memorization goal in the current Personal Curriculum.");
        }
        return counted;
    }

    private LearningGoal requireActiveVisibleMemoryGoal(
            Learner learner,
            String requestedGoalId) {
        if (learner == null
                || learner.getSkillpilotId() == null
                || learner.getSkillpilotId().isBlank()
                || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            throw verifiedRecallActiveGoalConflict();
        }

        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(),
                learner.getPersonalCurriculum());
        String activeGoalId = resolveGoalIdInVisibleGoals(
                learner.getActiveGoalId(),
                projection.visibleGoals(),
                false);
        String requestedProjectedGoalId =
                requestedGoalId == null || requestedGoalId.isBlank()
                        ? activeGoalId
                        : resolveGoalIdInVisibleGoals(
                                requestedGoalId.trim(),
                                projection.visibleGoals(),
                                false);
        if (activeGoalId == null
                || requestedProjectedGoalId == null
                || !activeGoalId.equals(requestedProjectedGoalId)
                || !projection.targetGoalIds().contains(activeGoalId)) {
            throw verifiedRecallActiveGoalConflict();
        }

        List<String> plannedIds = resolveEffectiveProjectedFocusIds(
                learner,
                projection);
        List<String> plannedScopeIds = resolveProjectedTargetScopeIds(
                plannedIds,
                projection);
        if (isGoalOutOfPlannedScope(
                activeGoalId,
                plannedScopeIds,
                projection.structuralGoals(),
                null)) {
            throw verifiedRecallActiveGoalConflict();
        }

        LearningGoal goal = projection.visibleGoals().get(activeGoalId);
        if (goal == null
                || !"atomic".equalsIgnoreCase(resolveNodeType(goal))
                || !isSrsGoal(goal)) {
            throw verifiedRecallActiveGoalConflict();
        }
        return goal;
    }

    private ResponseStatusException verifiedRecallActiveGoalConflict() {
        return new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "Verified Recall requires the current active learner-facing atomic memorization/SRS goal.");
    }

    /** The goal's selection of a deck; a strict read reports the deck's first defect. */
    private List<SrsCard> filterSrsCards(LearningGoal goal, SrsDeck deck, boolean strict) {
        if (deck.cards(strict).isEmpty()) {
            return List.of();
        }
        return deck.select(getSrsFilterTags(goal));
    }

    private MemoryPracticeResponse buildMemoryPracticeResponse(
            String language,
            MemoryPracticeContext context,
            Instant now) {
        // Progress describes the box of the context: released and not removed cards only.
        List<SrsCard> dueCards = context.cards().stream()
                .filter(card -> SrsCardSelection.due(card, context.states().get(card.id()), context.release(), now))
                .toList();
        int totalCards = SrsCardSelection.tally(context.cards(), context.states(), context.release(), now).boxCards();
        MemoryPracticeProgress progress = new MemoryPracticeProgress(
                totalCards,
                dueCards.size(),
                Math.max(0, totalCards - dueCards.size()));
        if (dueCards.isEmpty()) {
            return new MemoryPracticeResponse(
                    "complete",
                    memoryPracticeCompleteInstruction(language),
                    context.goal().getId(),
                    context.title(),
                    progress,
                    List.of());
        }
        List<MemoryPracticeCard> batch = dueCards.stream()
                .limit(MEMORY_PRACTICE_BATCH_LIMIT)
                .map(card -> new MemoryPracticeCard(
                        card.id(),
                        card.front(),
                        card.back(),
                        card.category()))
                .toList();
        return new MemoryPracticeResponse(
                "ready",
                memoryPracticeReadyInstruction(language),
                context.goal().getId(),
                context.title(),
                progress,
                batch);
    }

    private int memoryPracticeQuality(String rating) {
        if (rating == null || rating.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "memory practice review requires rating not_known or known.");
        }
        return switch (rating.trim().toLowerCase(Locale.ROOT)) {
            case "not_known" -> 1;
            case "known" -> 4;
            default -> throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "memory practice review requires rating not_known or known.");
        };
    }

    private int nonNegativeFiniteInt(Object value, int fallback) {
        double parsed = numberValue(value, fallback).doubleValue();
        if (!Double.isFinite(parsed)) {
            return fallback;
        }
        return Math.max(0, (int) parsed);
    }

    private void publishMemoryPracticeChange(Learner learner, String goalId) {
        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                learner.getSkillpilotId(),
                "CLIENT_STATE_UPDATED",
                goalId));
    }

    private String memoryPracticeReadyInstruction(String language) {
        return isEnglish(language)
                ? "Show the front first. Reveal the back only after the learner turns the card, then ask whether it was known or not known."
                : "Zeige zuerst die Vorderseite. Decke die Rückseite erst nach dem Umdrehen auf und frage danach nur, ob die Antwort gewusst oder nicht gewusst wurde.";
    }

    private String memoryPracticeCompleteInstruction(String language) {
        return isEnglish(language)
                ? "No cards in this selection are due today. Verified recall is the separate check for the memorization goal."
                : "In dieser Auswahl sind heute keine Karten mehr fällig. Der Nachweis für das Lernkartenziel erfolgt in der separaten Kartenprüfung.";
    }

    private VerifiedRecallPromptResponse buildVerifiedRecallPromptResponse(
            String skillpilotId,
            String language,
            VerifiedRecallContext context,
            int batchSize,
            boolean batchContract) {
        Instant issuedAt = verifiedRecallNow();
        VerifiedRecallDeckStatus status = summarizeVerifiedRecallDeck(context, issuedAt);
        List<SrsCard> nextCards = selectNextVerifiedRecallCards(context, issuedAt, batchSize);
        if (nextCards.isEmpty()) {
            // "complete" only when every card of the deck goal is verified, never for a unit alone.
            boolean complete = status.pendingCards() == 0;
            return new VerifiedRecallPromptResponse(
                    complete ? "complete" : "waiting",
                    complete
                            ? verifiedRecallCompleteInstruction(language)
                            : verifiedRecallWaitingInstruction(language, status, context.unitScope()),
                    skillpilotId,
                    context.goal().getId(),
                    context.goal().getTitle(),
                    context.cards().size(),
                    status.verifiedCards(),
                    status.pendingCards(),
                    status.eligibleCards(),
                    status.blockedCards(),
                    status.nextEligibleAt() != null ? status.nextEligibleAt().toString() : null,
                    0,
                    Collections.emptyList(),
                    null,
                    null,
                    null,
                    batchSize,
                    issuedAt);
        }
        List<VerifiedRecallPromptCard> promptCards = nextCards.stream()
                .map(card -> new VerifiedRecallPromptCard(card.id(), card.front(), card.category()))
                .toList();
        SrsCard firstCard = nextCards.get(0);
        return new VerifiedRecallPromptResponse(
                "ready",
                batchContract
                        ? verifiedRecallBatchPromptInstruction(language)
                        : verifiedRecallPromptInstruction(language),
                skillpilotId,
                context.goal().getId(),
                context.goal().getTitle(),
                context.cards().size(),
                status.verifiedCards(),
                status.pendingCards(),
                status.eligibleCards(),
                status.blockedCards(),
                status.nextEligibleAt() != null ? status.nextEligibleAt().toString() : null,
                promptCards.size(),
                promptCards,
                firstCard.id(),
                firstCard.front(),
                firstCard.category(),
                batchSize,
                issuedAt);
    }

    private Instant verifiedRecallNow() {
        return Instant.now(verifiedRecallClock);
    }

    private int countVerifiedRecall(List<SrsCard> cards, Map<String, SrsCardStateSummary> states) {
        if (cards == null || cards.isEmpty() || states == null || states.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (SrsCard card : cards) {
            SrsCardStateSummary state = states.get(card.id());
            if (state != null && state.recallPassed()) {
                count++;
            }
        }
        return count;
    }

    private List<SrsCard> selectNextVerifiedRecallCards(VerifiedRecallContext context, Instant now, int batchSize) {
        return SrsCardSelection.nextRecallBatch(context.scope(), context.states(), context.release(), now,
                VERIFIED_RECALL_DAY_ZONE, batchSize);
    }

    private int normalizeVerifiedRecallBatchSize(Integer requestedBatchSize) {
        if (requestedBatchSize == null) {
            return LEGACY_VERIFIED_RECALL_BATCH_SIZE;
        }
        return Math.max(LEGACY_VERIFIED_RECALL_BATCH_SIZE,
                Math.min(MAX_VERIFIED_RECALL_BATCH_SIZE, requestedBatchSize));
    }

    private VerifiedRecallDeckStatus summarizeVerifiedRecallDeck(VerifiedRecallContext context, Instant now) {
        var status = SrsCardSelection.recallStatus(context.cards(), context.scope(), context.states(),
                context.release(), now, VERIFIED_RECALL_DAY_ZONE);
        Instant nextEligibleAt = status.sameDayBlockedCards() > 0 ? nextVerifiedRecallEligibleAt(now) : null;
        return new VerifiedRecallDeckStatus(status.verifiedCards(), status.pendingCards(), status.eligibleCards(),
                status.blockedCards(), status.sameDayBlockedCards(), nextEligibleAt);
    }

    private SrsCard findSrsCard(List<SrsCard> cards, String cardId) {
        if (cards == null || cardId == null) {
            return null;
        }
        String normalized = cardId.trim();
        return cards.stream()
                .filter(card -> normalized.equals(card.id()))
                .findFirst()
                .orElse(null);
    }

    private void applyVerifiedRecallScheduling(
            Map<String, Object> cardState,
            boolean passed,
            Instant testedAt) {
        Map<String, Object> previousVerified = toMutableStringObjectMap(cardState.get("verifiedRecall"));
        int attempts = Math.max(0, numberValue(previousVerified.get("attempts"), 0).intValue()) + 1;
        int failures = Math.max(0, numberValue(previousVerified.get("failures"), 0).intValue()) + (passed ? 0 : 1);

        int previousRepetition = Math.max(0, numberValue(firstPresent(cardState, "repetition", "repetitions"), 0).intValue());
        double previousEf = Math.max(1.3, numberValue(firstPresent(cardState, "ef", "easeFactor"), 2.5).doubleValue());
        int previousInterval = Math.max(0, numberValue(cardState.get("interval"), 0).intValue());

        long now = testedAt.toEpochMilli();
        if (passed) {
            SrsReviewResult review = calculateSrsReview(5, previousInterval, previousEf, previousRepetition);
            cardState.put("interval", review.interval());
            cardState.put("repetition", review.repetition());
            cardState.put("ef", review.ef());
            cardState.put("nextReview", now + review.interval() * 24L * 60L * 60L * 1000L);
        } else {
            cardState.put("interval", 0);
            cardState.put("repetition", 0);
            cardState.put("ef", previousEf);
            cardState.put("nextReview", now);
        }
        cardState.put("lastReviewed", now);

        Map<String, Object> verified = new LinkedHashMap<>();
        verified.put("status", passed ? "passed" : "failed");
        verified.put("attempts", attempts);
        verified.put("failures", failures);
        verified.put("lastTestedAt", testedAt.toString());
        if (passed) {
            verified.put("passedAt", testedAt.toString());
            Object lastFailedAt = previousVerified.get("lastFailedAt");
            if (lastFailedAt instanceof String text && !text.isBlank()) {
                verified.put("lastFailedAt", text);
            }
        } else {
            verified.put("lastFailedAt", testedAt.toString());
            verified.put("nextEligibleAt", nextVerifiedRecallEligibleAt(testedAt).toString());
        }
        cardState.put("verifiedRecall", verified);
    }

    private record SrsReviewResult(int interval, int repetition, double ef) {
    }

    private SrsReviewResult calculateSrsReview(
            int quality,
            int lastInterval,
            double lastEf,
            int lastRepetition) {
        int interval;
        int repetition;
        double ef;
        if (quality >= 3) {
            if (lastRepetition == 0) {
                interval = 1;
            } else if (lastRepetition == 1) {
                interval = 6;
            } else {
                interval = Math.max(1, (int) Math.round(lastInterval * lastEf));
            }
            repetition = lastRepetition + 1;
            ef = lastEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
            if (ef < 1.3) {
                ef = 1.3;
            }
        } else {
            interval = 1;
            repetition = 0;
            ef = lastEf;
        }
        return new SrsReviewResult(interval, repetition, ef);
    }

    private Map<String, Object> toMutableStringObjectMap(Object value) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (value instanceof Map<?, ?> map) {
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() != null) {
                    result.put(String.valueOf(entry.getKey()), entry.getValue());
                }
            }
        }
        return result;
    }

    private Object firstPresent(Map<String, Object> map, String firstKey, String secondKey) {
        Object first = map.get(firstKey);
        return first != null ? first : map.get(secondKey);
    }

    private Number numberValue(Object value, double fallback) {
        if (value instanceof Number number) {
            return number;
        }
        if (value instanceof String text) {
            try {
                return Double.parseDouble(text.trim());
            } catch (Exception ignored) {
                return fallback;
            }
        }
        return fallback;
    }

    private boolean isEnglish(String language) {
        return language != null && language.trim().toLowerCase(Locale.ROOT).startsWith("en");
    }

    private String verifiedRecallPromptInstruction(String language) {
        return isEnglish(language)
                ? "Ask all returned card prompts as one numbered batch. Do not reveal expected answers before the learner has answered without help. Then call the answer tool and save passed or failed with the result tool for each card."
                : "Stelle alle zurückgegebenen Kartenfragen als einen nummerierten Batch. Verrate die erwarteten Antworten nicht, bevor die Antworten ohne Hilfe abgegeben wurden. Rufe danach je Karte das Antwort-Werkzeug auf und speichere passed oder failed mit dem Ergebnis-Werkzeug.";
    }

    private String verifiedRecallBatchPromptInstruction(String language) {
        return isEnglish(language)
                ? "Ask every returned prompt as one numbered batch and wait for all answers. Do not reveal expected answers early. Then load all expected answers once and save exactly one complete result batch."
                : "Stelle jede zurückgegebene Frage als einen nummerierten Batch und warte auf alle Antworten. Verrate die Sollantworten nicht vorzeitig. Lade danach alle Sollantworten genau einmal und speichere genau einen vollständigen Ergebnis-Batch.";
    }

    private String verifiedRecallAnswerInstruction(String language) {
        return isEnglish(language)
                ? "Compare the learner answer with the expected answer. Accept equivalent wording when the substance is correct. Then call the result tool with passed=true or passed=false."
                : "Vergleiche die Lernendenantwort mit der erwarteten Antwort. Akzeptiere gleichwertige Formulierungen, wenn die Sache stimmt. Rufe danach das Ergebnis-Werkzeug mit passed=true oder passed=false auf.";
    }

    private String verifiedRecallBatchAnswerInstruction(String language) {
        return isEnglish(language)
                ? "Compare every submitted answer with the matching expected answer in this exact order. Accept substantively equivalent wording and submit exactly one complete result batch."
                : "Vergleiche jede abgegebene Antwort in dieser exakten Reihenfolge mit der zugehörigen Sollantwort. Akzeptiere sachlich gleichwertige Formulierungen und übermittle genau einen vollständigen Ergebnis-Batch.";
    }

    private String verifiedRecallCompleteInstruction(String language) {
        return isEnglish(language)
                ? "All required cards for this memorization goal are verified. Backend mastery is saved automatically; do not call setMastery. Reload state only if the learner wants the next goal."
                : "Alle erforderlichen Karten dieses Lernkartenziels sind hart geprüft. Das Backend speichert Mastery automatisch; rufe nicht setMastery auf. Lade den Zustand nur neu, wenn das nächste Ziel gewünscht ist.";
    }

    private String verifiedRecallResultInstruction(String language, boolean masterySaved) {
        if (masterySaved) {
            return verifiedRecallCompleteInstruction(language);
        }
        return isEnglish(language)
                ? "Card result saved. Continue with next.status: ask next.cards when ready; if waiting, stop today's flashcard verification."
                : "Kartenergebnis gespeichert. Folge next.status: bei ready nächste cards stellen; bei waiting die heutige Kartenprüfung beenden.";
    }

    /**
     * Instruction for a recall without an available card. Status "waiting" is
     * also used when every released card of the scope is verified but the deck
     * goal still has cards without a result, because "complete" would read as
     * mastery of the deck goal.
     */
    private String verifiedRecallWaitingInstruction(String language, VerifiedRecallDeckStatus status, boolean unitScope) {
        if (status.sameDayBlockedCards() > 0) {
            if (isEnglish(language)) {
                return "No further flashcard exam item is available today. Explain mistakes if useful, but do not test today's failed cards again. Continue tomorrow for the remaining "
                        + status.sameDayBlockedCards() + " card(s).";
            }
            return "Heute ist keine weitere Kartenprüfung verfügbar. Erkläre Fehler bei Bedarf, aber prüfe heute falsch beantwortete Karten nicht noch einmal. Weiter geht es morgen mit den verbleibenden "
                    + status.sameDayBlockedCards() + " Karte(n).";
        }
        if (unitScope) {
            return isEnglish(language)
                    ? "All released cards of this unit are verified. The memorization goal stays open because "
                            + status.pendingCards() + " of its card(s) still need their own check, outside this unit or once their learning goals are passed. Do not test other cards now and do not report the memorization goal as complete."
                    : "Alle freigegebenen Karten dieser Einheit sind geprüft. Das Lernkartenziel bleibt offen, weil "
                            + status.pendingCards() + " seiner Karte(n) noch eine eigene Prüfung brauchen, außerhalb dieser Einheit oder sobald ihre Lernziele bestanden sind. Prüfe jetzt keine anderen Karten und melde das Lernkartenziel nicht als abgeschlossen.";
        }
        return isEnglish(language)
                ? "All released cards of this memorization goal are verified. " + status.pendingCards()
                        + " card(s) are not released yet; each becomes available once its learning goal is passed. Do not report the memorization goal as complete."
                : "Alle freigegebenen Karten dieses Lernkartenziels sind geprüft. " + status.pendingCards()
                        + " Karte(n) sind noch nicht freigegeben; jede wird verfügbar, sobald ihr Lernziel bestanden ist. Melde das Lernkartenziel nicht als abgeschlossen.";
    }

    @Transactional(readOnly = true)
    public Map<String, Double> getMastery(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, Double> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), m.getValue());
        }
        GoalProjection projection = masteryGoalProjection(learner);
        Map<String, LearningGoal> goals = projection == null ? Map.of() : projection.visibleGoals();
        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, Double> projected = applyCanonicalMasteryProjection(goals, result, projectionStateFilterId);
        return applySrsMasteryOverlay(skillpilotId, goals, projected, projection);
    }

    @Transactional(readOnly = true)
    public Map<String, MasteryEntryDTO> getMasteryWithTimestamps(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, MasteryEntryDTO> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), new MasteryEntryDTO(m.getValue(), m.getUpdatedAt()));
        }
        GoalProjection projection = masteryGoalProjection(learner);
        Map<String, LearningGoal> goals = projection == null ? Map.of() : projection.visibleGoals();
        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, MasteryEntryDTO> projected = applyCanonicalMasteryProjectionWithTimestamps(
                goals,
                result,
                projectionStateFilterId);
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, projected, projection);
    }

    /** Historical or unresolved result reads retain seed aliases/overlays without compiling a learning basis. */
    private Map<String, LearningGoal> masteryProjectionGoals(Learner learner) {
        GoalProjection projection = masteryGoalProjection(learner);
        return projection == null ? Map.of() : projection.visibleGoals();
    }

    private GoalProjection masteryGoalProjection(Learner learner) {
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null) return null;
        if (isReadOnlyCompatibilitySession(learner) || !hasCompletedPersonalCurriculum(learner)) {
            // Keep this result out of the full learning-projection cache.
            return computeSeedGoalProjection(curriculumId, learner.getPersonalCurriculum(), false);
        }
        return getGoalProjection(curriculumId, learner.getPersonalCurriculum());
    }

    @Transactional(readOnly = true)
    public Map<String, MasteryEntryDTO> getMasteryProjectedToGoalIds(String skillpilotId, Set<String> goalIds) {
        if (skillpilotId == null || skillpilotId.isBlank() || goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Learner learner = getLearner(skillpilotId);
        List<Mastery> mastered = masteryRepository.findByLearner_SkillpilotId(skillpilotId);
        Map<String, MasteryEntryDTO> result = new HashMap<>();
        for (Mastery m : mastered) {
            result.put(m.getGoalKey(), new MasteryEntryDTO(m.getValue(), m.getUpdatedAt()));
        }

        Map<String, LearningGoal> goals = new HashMap<>();
        for (String goalId : goalIds) {
            LearningGoal goal = landscapeService.getGoalDefinition(goalId);
            if (goal != null) {
                goals.put(goal.getId(), goal);
            }
        }

        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        Map<String, MasteryEntryDTO> projected = applyCanonicalMasteryProjectionWithTimestamps(
                goals,
                result,
                projectionStateFilterId);
        GoalProjection projection = goals.values().stream().anyMatch(this::isSrsGoal)
                && parsePersonalCurriculumConfig(learner.getPersonalCurriculum()).values().stream()
                        .anyMatch(selection -> selection.containsKey(SubjectExtensionScope.KEY))
                ? masteryGoalProjection(learner) : null;
        return applySrsMasteryOverlayWithTimestamps(skillpilotId, goals, projected, projection);
    }

    private Map<String, Double> applyCanonicalMasteryProjection(Map<String, LearningGoal> goals,
            Map<String, Double> masteryMap,
            String stateFilterId) {
        if (goals == null || goals.isEmpty() || masteryMap == null || masteryMap.isEmpty()) {
            return masteryMap;
        }

        Map<String, Double> projected = new HashMap<>(masteryMap);
        boolean changed = false;

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }
            if (!mappingMatchesProjectionStateFilter(mapping, stateFilterId)) {
                continue;
            }
            Double legacyMastery = masteryMap.get(mapping.legacyGoalId());
            if (legacyMastery == null) {
                continue;
            }

            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), goals)) {
                double current = projected.getOrDefault(canonicalGoalId, 0.0);
                if (legacyMastery > current) {
                    projected.put(canonicalGoalId, legacyMastery);
                    changed = true;
                }
            }
        }

        return changed ? projected : masteryMap;
    }

    private Map<String, MasteryEntryDTO> applyCanonicalMasteryProjectionWithTimestamps(Map<String, LearningGoal> goals,
            Map<String, MasteryEntryDTO> masteryMap,
            String stateFilterId) {
        if (goals == null || goals.isEmpty() || masteryMap == null || masteryMap.isEmpty()) {
            return masteryMap;
        }

        Map<String, MasteryEntryDTO> projected = new HashMap<>(masteryMap);
        boolean changed = false;

        for (ResolvedGoalMapping mapping : goalMappingService.getAllMappings()) {
            if (!"exact".equals(mapping.matchType())) {
                continue;
            }
            if (!mappingMatchesProjectionStateFilter(mapping, stateFilterId)) {
                continue;
            }
            MasteryEntryDTO legacyEntry = masteryMap.get(mapping.legacyGoalId());
            if (legacyEntry == null) {
                continue;
            }

            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), goals)) {
                MasteryEntryDTO current = projected.get(canonicalGoalId);
                if (shouldReplaceProjectedEntry(current, legacyEntry)) {
                    projected.put(canonicalGoalId, legacyEntry);
                    changed = true;
                }
            }
        }

        return changed ? projected : masteryMap;
    }

    private List<String> resolveCanonicalProjectionTargetIds(String canonicalGoalId, Map<String, LearningGoal> visibleGoals) {
        if (canonicalGoalId == null || canonicalGoalId.isBlank()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> targetIds = new LinkedHashSet<>();
        if (isProjectionTargetVisible(canonicalGoalId, visibleGoals)) {
            targetIds.add(canonicalGoalId);
        }
        collectSplitProjectionTargetIds(canonicalGoalId, canonicalGoalId, visibleGoals, targetIds, new HashSet<>());
        return new ArrayList<>(targetIds);
    }

    private void collectSplitProjectionTargetIds(
            String splitParentGoalId,
            String currentGoalId,
            Map<String, LearningGoal> visibleGoals,
            LinkedHashSet<String> targetIds,
            Set<String> visiting) {
        if (splitParentGoalId == null || currentGoalId == null || !visiting.add(currentGoalId)) {
            return;
        }

        try {
            LearningGoal current = resolveProjectionGoal(currentGoalId, visibleGoals);
            if (current == null || current.getContains() == null || current.getContains().isEmpty()) {
                return;
            }

            for (String childRef : current.getContains()) {
                String childId = resolveProjectionGoalRef(childRef, visibleGoals);
                if (childId == null || childId.isBlank()) {
                    continue;
                }
                LearningGoal child = resolveProjectionGoal(childId, visibleGoals);
                if (child == null) {
                    continue;
                }

                String splitFromCanonicalGoalId = landscapeService.resolveGoalProvenanceValue(
                        child,
                        "splitFromCanonicalGoalId");
                if (splitParentGoalId.equals(splitFromCanonicalGoalId)
                        && isProjectionTargetVisible(child.getId(), visibleGoals)) {
                    targetIds.add(child.getId());
                }

                collectSplitProjectionTargetIds(splitParentGoalId, child.getId(), visibleGoals, targetIds, visiting);
            }
        } finally {
            visiting.remove(currentGoalId);
        }
    }

    private LearningGoal resolveProjectionGoal(String goalId, Map<String, LearningGoal> visibleGoals) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        if (visibleGoals != null && !visibleGoals.isEmpty() && visibleGoals.containsKey(goalId)) {
            return visibleGoals.get(goalId);
        }
        return landscapeService.getGoalDefinition(goalId);
    }

    private String resolveProjectionGoalRef(String goalRef, Map<String, LearningGoal> visibleGoals) {
        if (goalRef == null || goalRef.isBlank()) {
            return null;
        }
        if (visibleGoals != null && !visibleGoals.isEmpty()) {
            String visibleGoalId = resolveGoalRef(goalRef, visibleGoals);
            if (visibleGoalId != null) {
                return visibleGoalId;
            }
        }

        LearningGoal goal = landscapeService.getGoalDefinition(goalRef);
        if (goal == null && goalRef.contains(":")) {
            goal = landscapeService.getGoalDefinition(goalRef.substring(goalRef.indexOf(':') + 1));
        }
        return goal == null ? null : goal.getId();
    }

    private boolean isProjectionTargetVisible(String goalId, Map<String, LearningGoal> visibleGoals) {
        return visibleGoals == null || visibleGoals.isEmpty() || visibleGoals.containsKey(goalId);
    }

    private boolean mappingMatchesProjectionStateFilter(ResolvedGoalMapping mapping, String stateFilterId) {
        if (stateFilterId == null || stateFilterId.isBlank()) {
            return true;
        }
        if (mapping == null) {
            return false;
        }
        String sourceJurisdiction = normalizeFilterId(
                landscapeService.resolveSourceLandscapeJurisdiction(mapping.sourceLandscapeId()));
        return stateFilterId.equals(sourceJurisdiction);
    }

    private boolean shouldReplaceProjectedEntry(MasteryEntryDTO current, MasteryEntryDTO candidate) {
        if (candidate == null) {
            return false;
        }
        if (current == null) {
            return true;
        }
        if (candidate.value() > current.value()) {
            return true;
        }
        if (candidate.value() < current.value()) {
            return false;
        }
        Instant currentTs = current.updatedAt();
        Instant candidateTs = candidate.updatedAt();
        if (currentTs == null) {
            return candidateTs != null;
        }
        if (candidateTs == null) {
            return false;
        }
        return candidateTs.isAfter(currentTs);
    }

    private String mapGoalIdForVisibleGoals(String goalId, Map<String, LearningGoal> visibleGoals, boolean allowPartial) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return goalId;
        }
        if (visibleGoals.containsKey(goalId)) {
            return goalId;
        }
        List<ResolvedGoalMapping> mappings = goalMappingService.findAllByLegacyGoalId(goalId);
        if (!mappings.isEmpty()) {
            for (ResolvedGoalMapping mapping : mappings) {
                if (!allowPartial && !"exact".equals(mapping.matchType())) {
                    continue;
                }
                if (visibleGoals.containsKey(mapping.canonicalGoalId())) {
                    return mapping.canonicalGoalId();
                }
            }
            // The historical HE transformation goal is broader than the narrowed
            // central-dilation target. Its partial edge must not become an alias
            // for a mastery write through the provenance fallback below. Other
            // legacy partial mappings retain their established continuity path.
            if (!allowPartial
                    && LEGACY_HE_BROAD_TRANSFORMATION_GOAL_ID.equals(goalId)
                    && mappings.stream().noneMatch(mapping -> "exact".equals(mapping.matchType()))) {
                return goalId;
            }
        }
        if (isKnownCanonicalGoalId(goalId)) {
            return goalId;
        }
        String provenanceMappedGoalId = findCanonicalGoalIdByLegacySourceId(goalId, visibleGoals);
        if (provenanceMappedGoalId != null) {
            return provenanceMappedGoalId;
        }
        return goalId;
    }

    private boolean isKnownCanonicalGoalId(String goalId) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        String landscapeId = landscapeService.getLandscapeIdForGoal(goalId);
        if (landscapeId == null || landscapeId.isBlank()) {
            return false;
        }
        return isCanonicalGymnasiumLandscape(landscapeService.getById(landscapeId));
    }

    private String resolveGoalIdInVisibleGoals(String goalId, Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
        if (mappedGoalId == null || mappedGoalId.isBlank()) {
            return null;
        }
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return mappedGoalId;
        }
        return visibleGoals.containsKey(mappedGoalId) ? mappedGoalId : null;
    }

    private List<String> mapGoalIdsForVisibleGoals(List<String> goalIds, Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyList();
        }
        LinkedHashSet<String> mappedGoalIds = new LinkedHashSet<>();
        for (String goalId : goalIds) {
            String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                mappedGoalIds.add(mappedGoalId);
            }
        }
        return new ArrayList<>(mappedGoalIds);
    }

    private List<String> normalizePlannedGoalIdsForVisibleGoals(List<String> goalIds,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        List<String> mappedGoalIds = mapGoalIdsForVisibleGoals(goalIds, visibleGoals, allowPartial);
        return collapseContainedGoalIds(mappedGoalIds, visibleGoals);
    }

    /**
     * Projects stored Level-3 focus references into the current authored
     * learner-facing target scope without rewriting the stored IDs.
     *
     * <p>Direct and legacy-mapped goal references survive when they resolve to
     * either an authored target or a visible canonical structure ancestor with
     * at least one target descendant. Synthetic composition structure
     * references survive only when they belong to the matched view and contain
     * at least one target. Structure ancestors are scope aliases only; in
     * particular, {@code prerequisiteOnly} goals remain available in the
     * structural graph for prerequisite checks but cannot become learner-facing
     * focus entries.</p>
     */
    private List<String> resolveProjectedTargetFocusIds(
            List<String> storedGoalIds,
            GoalProjection projection) {
        if (storedGoalIds == null
                || storedGoalIds.isEmpty()
                || projection == null
                || projection.targetGoalIds().isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> projectedGoalIds = new LinkedHashSet<>();
        for (String storedGoalId : storedGoalIds) {
            if (storedGoalId == null || storedGoalId.isBlank()) {
                continue;
            }
            var unit = projection.declaredUnits().focus(storedGoalId);
            if (unit != null) {
                projectedGoalIds.add(unit.focusId());
                continue;
            }
            if (isCompositionStructureGoalId(storedGoalId)) {
                if (isProjectedTargetFocus(storedGoalId, projection)) {
                    projectedGoalIds.add(storedGoalId);
                }
                continue;
            }

            String projectedGoalId = resolveGoalIdInVisibleGoals(
                    storedGoalId,
                    projection.visibleGoals(),
                    true);
            if (projectedGoalId != null
                    && isProjectedTargetFocus(projectedGoalId, projection)) {
                projectedGoalIds.add(declaredFocusId(projectedGoalId, projection));
            }
        }
        return collapseContainedGoalIds(
                new ArrayList<>(projectedGoalIds),
                projection.visibleGoals());
    }

    /**
     * Expands already validated learner-facing focus entries for frontier and
     * completion calculations, then retains authored targets only.
     */
    private List<String> resolveProjectedTargetScopeIds(
            List<String> projectedFocusIds,
            GoalProjection projection) {
        if (projectedFocusIds == null
                || projectedFocusIds.isEmpty()
                || projection == null
                || projection.targetGoalIds().isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> targetGoalIds = new LinkedHashSet<>();
        for (String projectedFocusId : projectedFocusIds) {
            targetGoalIds.addAll(resolveProjectedFocusTargetIds(
                    projectedFocusId,
                    projection));
        }
        return collapseContainedGoalIds(
                new ArrayList<>(targetGoalIds),
                projection.structuralGoals());
    }

    /**
     * Resolves a learner-facing focus entry to the authored target goals whose
     * scope it represents.
     *
     * <p>A focus entry may be either a direct authored target, an active
     * synthetic composition structure, or a visible canonical structure
     * ancestor such as the subject root shown in the cockpit. Structure
     * ancestors remain scope aliases only: they are never added to
     * {@link GoalProjection#targetGoalIds()} and therefore do not alter
     * learner-facing progress, frontier, or completion semantics.</p>
     */
    private List<String> resolveProjectedFocusTargetIds(
            String focusGoalId,
            GoalProjection projection) {
        if (focusGoalId == null
                || focusGoalId.isBlank()
                || projection == null
                || projection.targetGoalIds().isEmpty()
                || projection.structuralGoals().isEmpty()) {
            return Collections.emptyList();
        }

        var unit = projection.declaredUnits().focus(focusGoalId);
        if (unit != null) return List.copyOf(unit.atoms());

        LinkedHashSet<String> scopeRoots = new LinkedHashSet<>();
        if (isCompositionStructureGoalId(focusGoalId)) {
            if (compositionViewService == null) {
                return Collections.emptyList();
            }
            CompositionViewService.CompositionStructureResolution resolution =
                    projectedStructure(focusGoalId, projection);
            if (resolution == null
                    || !projection.compositionViewIds().contains(resolution.viewId())) {
                return Collections.emptyList();
            }
            for (String referencedGoalId : resolution.referencedGoalIds()) {
                String mappedGoalId = mapGoalIdForVisibleGoals(
                        referencedGoalId,
                        projection.structuralGoals(),
                        true);
                if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                    scopeRoots.add(mappedGoalId);
                }
            }
        } else {
            String projectedGoalId = resolveGoalIdInVisibleGoals(
                    focusGoalId,
                    projection.visibleGoals(),
                    true);
            if (projectedGoalId != null
                    && !projectedGoalId.isBlank()
                    && !projection.prerequisiteOnlyGoalIds().contains(projectedGoalId)) {
                scopeRoots.add(projectedGoalId);
            }
        }
        if (scopeRoots.isEmpty()) {
            return Collections.emptyList();
        }

        Set<String> expandedScope = computeScope(
                new ArrayList<>(scopeRoots),
                projection.structuralGoals(),
                Collections.emptyMap());
        return projection.regularTargetGoalIds().stream()
                .filter(expandedScope::contains)
                .toList();
    }

    private List<String> resolvePlannedGoalIdsForScope(List<String> goalIds,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (goalIds == null || goalIds.isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> resolvedGoalIds = new LinkedHashSet<>();
        for (String goalId : goalIds) {
            List<String> compositionGoalIds = resolveCompositionStructureGoalIds(goalId, visibleGoals, allowPartial);
            if (!compositionGoalIds.isEmpty()) {
                resolvedGoalIds.addAll(compositionGoalIds);
                continue;
            }

            String mappedGoalId = mapGoalIdForVisibleGoals(goalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                resolvedGoalIds.add(mappedGoalId);
            }
        }

        return collapseContainedGoalIds(new ArrayList<>(resolvedGoalIds), visibleGoals);
    }

    private List<String> resolveCompositionStructureGoalIds(String goalId,
            Map<String, LearningGoal> visibleGoals,
            boolean allowPartial) {
        if (compositionViewService == null || goalId == null || goalId.isBlank()) {
            return Collections.emptyList();
        }

        CompositionViewService.CompositionStructureResolution resolution =
                compositionViewService.resolveStructureReference(goalId);
        if (resolution == null || resolution.referencedGoalIds().isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> mappedGoalIds = new LinkedHashSet<>();
        for (String referencedGoalId : resolution.referencedGoalIds()) {
            String mappedGoalId = mapGoalIdForVisibleGoals(referencedGoalId, visibleGoals, allowPartial);
            if (mappedGoalId != null && !mappedGoalId.isBlank()) {
                mappedGoalIds.add(mappedGoalId);
            }
        }
        return new ArrayList<>(mappedGoalIds);
    }

    private List<String> collapseContainedGoalIds(List<String> goalIds, Map<String, LearningGoal> visibleGoals) {
        if (goalIds == null || goalIds.isEmpty() || visibleGoals == null || visibleGoals.isEmpty()) {
            return goalIds == null ? Collections.emptyList() : goalIds;
        }

        LinkedHashSet<String> orderedGoalIds = new LinkedHashSet<>(goalIds);
        Set<String> redundantGoalIds = new HashSet<>();
        for (String goalId : orderedGoalIds) {
            if (!visibleGoals.containsKey(goalId)) {
                continue;
            }
            Set<String> descendants = new HashSet<>();
            collectDescendants(goalId, visibleGoals, descendants);
            redundantGoalIds.addAll(descendants);
        }

        return orderedGoalIds.stream()
                .filter(goalId -> !redundantGoalIds.contains(goalId))
                .toList();
    }

    private String findCanonicalGoalIdByLegacySourceId(String legacyGoalId, Map<String, LearningGoal> visibleGoals) {
        if (legacyGoalId == null || legacyGoalId.isBlank() || visibleGoals == null || visibleGoals.isEmpty()) {
            return null;
        }
        // Progress checks ask this for every stored result. For the immutable goal
        // map of a projection the answers are read from one index per transaction
        // instead of one scan of all goals per question.
        ProjectionComputationCache cache = IMMUTABLE_GOAL_MAP_TYPE.isInstance(visibleGoals)
                ? transactionProjectionCache() : null;
        if (cache != null) {
            return cache.legacySourceGoalIds
                    .computeIfAbsent(visibleGoals, this::indexGoalIdsByLegacySourceId)
                    .get(legacyGoalId);
        }
        for (LearningGoal goal : visibleGoals.values()) {
            String sourceGoalId = landscapeService.resolveGoalProvenanceValue(goal, "sourceGoalId");
            if (legacyGoalId.equals(sourceGoalId)) {
                return goal.getId();
            }
        }
        return null;
    }

    @Transactional
    public MasteryUpdateResponse setMastery(String skillpilotId, MasteryUpdateRequest request) {
        return setMastery(skillpilotId, request, null);
    }

    /** Trusted scored-result hook runs after persistence and before successor planning in the same transaction. */
    @Transactional
    public MasteryUpdateResponse setMastery(String skillpilotId, MasteryUpdateRequest request, Runnable verifiedAssessmentReceipt) {
        assertWritableLearningSession(skillpilotId);
        Map<String, Double> requestedMastery = request == null ? null : request.mastery();
        if (request == null || requestedMastery == null || requestedMastery.isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery must contain exactly one goal update.");
        }
        if (requestedMastery.size() != 1) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery must contain exactly one goal update.");
        }

        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));

        Map<String, LearningGoal> visibleGoals = Collections.emptyMap();
        if (learner.getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isBlank()) {
            visibleGoals = getFilteredGoals(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        }

        String activeGoalId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), visibleGoals, false);
        String requestedGoalId = request.goalId();
        requestedGoalId = mapGoalIdForVisibleGoals(requestedGoalId, visibleGoals, false);
        Map.Entry<String, Double> masteryEntry = requestedMastery.entrySet().iterator().next();
        if (masteryEntry.getKey() == null || masteryEntry.getKey().isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery goalId must not be empty.");
        }
        if (masteryEntry.getValue() == null
                || masteryEntry.getValue().isNaN()
                || masteryEntry.getValue().isInfinite()
                || masteryEntry.getValue() < 0.0
                || masteryEntry.getValue() > 1.0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "mastery value must be between 0.0 and 1.0.");
        }
        if (masteryEntry.getValue() != 0.0 && masteryEntry.getValue() != 1.0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Learning goals use binary mastery: 0 or 1.");
        }
        String masteryEntryGoalId = mapGoalIdForVisibleGoals(masteryEntry.getKey(), visibleGoals, false);
        if ((requestedGoalId == null || requestedGoalId.isBlank()) && masteryEntryGoalId != null) {
            requestedGoalId = masteryEntryGoalId;
        }
        if (requestedGoalId != null && !requestedGoalId.isBlank()
                && masteryEntryGoalId != null && !requestedGoalId.equals(masteryEntryGoalId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalId must match the mastery map entry.");
        }
        if (activeGoalId != null && !activeGoalId.isBlank()
                && masteryEntryGoalId != null && !activeGoalId.equals(masteryEntryGoalId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "mastery update must target the active goal.");
        }

        String effectiveGoalId = (activeGoalId != null && !activeGoalId.isBlank())
                ? activeGoalId
                : requestedGoalId;
        assertCompletionAssessmentOwner(skillpilotId, effectiveGoalId);

        if (effectiveGoalId == null || effectiveGoalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "No active goal selected and no goalId provided.");
        }

        if (activeGoalId == null || activeGoalId.isBlank()) {
            List<FrontierGoal> frontierAtomic = filterAtomicFrontier(getUncompactedRichFrontier(skillpilotId));
            boolean allowed = frontierAtomic.stream().anyMatch(goal -> goal.id().equals(effectiveGoalId));
            if (!allowed) {
                Map<String, Double> masterySnapshot = getMastery(skillpilotId);
                double currentMastery = masterySnapshot.getOrDefault(effectiveGoalId, 0.0);
                boolean explicitCorrection = masteryEntry != null
                        && masteryEntry.getValue() != null
                        && effectiveGoalId.equals(masteryEntryGoalId)
                        && masteryEntry.getValue() < currentMastery;

                // Allow explicit correction (e.g. reset from 1.0 to 0.0) even if the goal
                // is currently outside the frontier.
                if (explicitCorrection) {
                    // continue with save flow
                } else {
                    throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                            "goalId must be an atomic goal from the current frontier.");
                }
            }
        }

        double masteryValue = masteryEntry.getValue();
        CompletionWorkflowState currentCompletion = completionWorkflow(learner);
        if (currentCompletion != null && currentCompletion.directAssessment() != null && masteryValue != 1.0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "An unsuccessful direct assessment leaves mastery unchanged; choose the next action instead.");
        }

        // A composition-view goalEntry can intentionally project a canonical cluster as
        // one opaque learner-facing leaf. Validate the projected definition first so
        // every atomic frontier option can also be completed.
        com.skillpilot.backend.landscape.LearningGoal def = visibleGoals.get(effectiveGoalId);
        if (def == null) {
            def = landscapeService.getGoalDefinition(effectiveGoalId);
        }
        if (def != null && def.getContains() != null && !def.getContains().isEmpty()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Cannot set mastery on cluster goals. Select an atomic goal first.");
        }
        if (isOrientationGoal(def) && Double.compare(masteryValue, 1.0) != 0) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Orientation goals use completion marker 1.0 only; they do not carry graded mastery.");
        }

        MasteryId id = new MasteryId(skillpilotId, effectiveGoalId);
        Mastery mastery = masteryRepository.findById(id)
                .orElseGet(() -> new Mastery(learner, effectiveGoalId, 0.0));
        double previousValue = mastery.getValue();
        mastery.setValue(masteryValue);
        masteryRepository.save(mastery);
        recordGoalCompletion(learner, effectiveGoalId, def, previousValue, masteryValue, learningPlanClock.instant(), "coach_learning");
        if (masteryValue == 1.0 && verifiedAssessmentReceipt != null) verifiedAssessmentReceipt.run();

        // A failed/partial plan attempt remains the current work item. This is
        // intentionally scoped to plan mode so the established default
        // Autopilot semantics stay unchanged when followLearningPlans=false.
        boolean completedGoal = masteryValue >= PLANNING_SCOPE_MASTERY_THRESHOLD;
        if (!effectivePlanFollowing(learner) || completedGoal) {
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
        }
        CompletionWorkflowState completionWorkflow = completionWorkflow(learner);
        if (completedGoal && completionWorkflow != null && completionWorkflow.directAssessment() != null
                && Objects.equals(effectiveGoalId, completionWorkflow.directAssessment().goalId())) {
            saveCompletionWorkflow(learner, completionWorkflow.withNavigation("required", null));
        }
        if (completedGoal) resumePendingUnitEntry(learner, effectiveGoalId);
        advanceCoachStateRevision(learner);

        String sequentialAutopilotAnchorGoalId = completedGoal ? effectiveGoalId : null;
        UnifiedLearnerStateResponse state = getLearnerState(skillpilotId, sequentialAutopilotAnchorGoalId);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "MASTERY_UPDATE"));
        return new MasteryUpdateResponse(
                true,
                effectiveGoalId,
                masteryValue,
                state.frontier(),
                state.nextAllowedActions(),
                state.learningState(),
                state.activeGoal(),
                state.stateMachine(),
                state.goals(),
                state.levelCompletion());
    }

    @Transactional(readOnly = true)
    public List<String> getPlannedGoals(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return getStoredPlannedGoals(skillpilotId);
        }
        if (!hasCompletedPersonalCurriculum(learner)) {
            return Collections.emptyList();
        }
        GoalProjection projection = getGoalProjection(
                curriculumId,
                learner.getPersonalCurriculum());
        return resolveEffectiveProjectedFocusIds(learner, projection);
    }

    /**
     * Returns a side-effect-free snapshot of every personalized atomic target
     * in one subject landscape for local course planning.
     *
     * <p>The planning universe is the completed Level-2 Personal Curriculum,
     * deliberately independent of the learner's mutable Level-3 focus. The
     * requested landscape keeps multi-subject personalization separated. The
     * response contains no teacher identity and creates no relationship or
     * other server-side state.</p>
     */
    @Transactional(readOnly = true)
    public LearnerPlanningScopeResponse getPlanningScope(
            String skillpilotId,
            String landscapeId) {
        if (landscapeId == null || landscapeId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "landscapeId is required.");
        }

        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The learner has no selected curriculum.");
        }
        if (!hasCompletedPersonalCurriculum(learner)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The learner's personal curriculum is incomplete.");
        }

        String requestedLandscapeId = landscapeId.trim();
        GoalProjection projection = getGoalProjection(
                curriculumId,
                learner.getPersonalCurriculum());
        if (projection.targetGoalIds().isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The current personal curriculum has no learner-facing target projection.");
        }
        // Planning uses canonical atomic identity; display collapse cannot
        // replace a cluster's actual learning obligations.
        List<String> scopeAtomicGoalIds = projection.regularTargetGoalIds().stream()
                .filter(goalId -> requestedLandscapeId.equals(
                        landscapeService.getLandscapeIdForGoal(goalId)))
                .filter(goalId -> isCountedAtomicGoal(
                        projection.structuralGoals().get(goalId)))
                .toList();
        if (scopeAtomicGoalIds.isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "landscapeId has no atomic targets in the learner's personal curriculum.");
        }

        Map<String, Double> mastery = getMastery(skillpilotId);
        List<String> openAtomicGoalIds = scopeAtomicGoalIds.stream()
                .filter(goalId -> mastery.getOrDefault(goalId, 0.0)
                        < PLANNING_SCOPE_MASTERY_THRESHOLD)
                .toList();
        long totalAtomicGoalCount = scopeAtomicGoalIds.size();
        long masteredAtomicGoalCount = totalAtomicGoalCount - openAtomicGoalIds.size();

        return new LearnerPlanningScopeResponse(
                curriculumId,
                requestedLandscapeId,
                scopeAtomicGoalIds,
                totalAtomicGoalCount,
                masteredAtomicGoalCount,
                openAtomicGoalIds,
                Instant.now());
    }

    /** Explicitly selected subjects with targets; foreign prerequisites do not select another subject. */
    @Transactional(readOnly = true)
    public List<String> getPersonalCurriculumSubjectIds(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!hasCompletedPersonalCurriculum(learner)
                || learner.getSelectedCurriculum() == null || learner.getSelectedCurriculum().isBlank()) {
            return List.of();
        }
        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return projection.regularTargetGoalIds().stream()
                .filter(id -> isCountedAtomicGoal(projection.structuralGoals().get(id)))
                .map(landscapeService::getLandscapeIdForGoal)
                .filter(Objects::nonNull).distinct()
                .filter(id -> isUnitAssignmentSubjectSelected(learner, id))
                .sorted().toList();
    }

    /**
     * The current Level-2 atomic targets grouped by landscape, without reading mastery.
     * A plan status already has one effective mastery snapshot, so its Cockpit achievement
     * counts can use that same snapshot without rebuilding the projection or SRS overlay
     * once per subject. An unresolved Personal Curriculum has no usable target result.
     */
    @Transactional(readOnly = true)
    Map<String, List<String>> getPersonalCurriculumAtomicTargetsByLandscape(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!hasCompletedPersonalCurriculum(learner)
                || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            return Map.of();
        }
        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Map<String, LinkedHashSet<String>> byLandscape = new LinkedHashMap<>();
        for (String goalId : projection.regularTargetGoalIds()) {
            if (!isCountedAtomicGoal(projection.structuralGoals().get(goalId))) {
                continue;
            }
            String landscapeId = landscapeService.getLandscapeIdForGoal(goalId);
            if (landscapeId != null) {
                byLandscape.computeIfAbsent(landscapeId, ignored -> new LinkedHashSet<>())
                        .add(goalId);
            }
        }
        Map<String, List<String>> result = new LinkedHashMap<>();
        byLandscape.forEach((landscapeId, goalIds) ->
                result.put(landscapeId, List.copyOf(goalIds)));
        return Map.copyOf(result);
    }

    /**
     * Explicit further learning may leave a dated plan or its temporary focus,
     * but only within this subject's personal targets and the real frontier.
     */
    @Transactional(readOnly = true)
    public List<FrontierGoal> getPersonalCurriculumSubjectFrontier(String skillpilotId, String landscapeId) {
        LearnerPlanningScopeResponse scope = getPlanningScope(skillpilotId, landscapeId);
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Set<String> subjectAtoms = new LinkedHashSet<>(scope.scopeAtomicGoalIds());
        if (projection.learningScope() != null) {
            Set<String> subjectSeeds = projection.learningScope().seedAtomicGoalIds().stream()
                    .filter(id -> landscapeId.equals(landscapeService.getLandscapeIdForGoal(id)))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            if (subjectSeeds.equals(projection.learningScope().seedAtomicGoalIds())) {
                subjectAtoms = projection.learningScope().learningAtomicGoalIds();
            } else if (!subjectSeeds.isEmpty()) {
                // Other subjects, including legacy runtime support landscapes, may
                // have their own seeds. They cannot widen this subject's learning path.
                subjectAtoms = PersonalCurriculumLearningScope.compile(
                        projection.canonicalPrerequisiteGoals(), subjectSeeds).learningAtomicGoalIds();
            }
        }
        List<String> prospectiveFocus = List.copyOf(subjectAtoms);
        if (prospectiveFocus.isEmpty()) return List.of();
        // Only this subject's own plan binds an explicit request for the subject. The learning
        // path holds prerequisites of other subjects; they must not draw the exam of another
        // subject into this one (issue #205).
        List<LearnerLearningPlan> followed = currentFollowedLearningPlans(learner);
        Set<String> followedScope = followedLearningScopeIds(learner, projection, prospectiveFocus,
                followed.stream().filter(plan -> landscapeId.equals(plan.getLandscapeId())).toList());
        if (followedScope != null && followedScope.isEmpty()) return List.of();
        // A prerequisite of another subject is bound by that subject's own plan, exactly as the
        // write that starts it: what this subject offers must be a goal that can be started.
        Map<String, Boolean> startable = new HashMap<>();
        return getRichFrontier(learner, projection, richFrontierFacts(learner, projection),
                false, prospectiveFocus, false, followedScope, true).stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .filter(goal -> {
                    String owner = landscapeService.getLandscapeIdForGoal(goal.id());
                    if (owner == null || owner.equals(landscapeId)) return true;
                    return startable.computeIfAbsent(goal.id(), id -> {
                        Set<String> ownerScope = followedLearningScopeIds(learner, projection, List.of(id),
                                followed.stream().filter(plan -> owner.equals(plan.getLandscapeId())).toList());
                        return ownerScope == null || ownerScope.contains(id);
                    });
                })
                .toList();
    }

    /**
     * Catalog retirements and assessments retained only for history in the learner's matched view.
     * Stored plans omit them from execution while retaining their original blocks.
     */
    Set<String> retiredGoalIds(Learner learner, String landscapeId) {
        SkillLandscape landscape = landscapeId == null ? null : landscapeService.getById(landscapeId);
        if (landscape == null || landscape.getGoals() == null) return Set.of();
        Set<String> globallyRetired = retiredGoalIdsByLandscape.computeIfAbsent(landscape, loaded -> {
            Set<String> ids = new HashSet<>();
            for (LearningGoal goal : loaded.getGoals()) {
                if (goal != null && "atomic".equals(goal.getType()) && goal.getExtendedData() != null
                        && "excluded".equals(goal.getExtendedData().get("applicabilityProjection"))) {
                    ids.add(goal.getId());
                }
            }
            return ids;
        });
        if (learner == null || !parsePersonalCurriculumConfig(learner.getPersonalCurriculum())
                .getOrDefault(landscapeId, Map.of()).containsKey(SubjectExtensionScope.KEY)) {
            return globallyRetired;
        }
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        if (!projection.explicitExtensionLandscapeIds().contains(landscapeId)) return globallyRetired;
        Set<String> retired = new HashSet<>(globallyRetired);
        projection.learnerViews().values().stream().filter(view -> landscapeId.equals(view.get("landscapeId")))
                .map(CompositionViewExtensions::retiredHistoricalAssessmentGoalId)
                .filter(Objects::nonNull).forEach(retired::add);
        return retired;
    }

    /**
     * Checks current executability, not historical graph identity. Stored v2
     * fingerprints remain capture evidence and are never rewritten by this read.
     * Unplanned additions and content-only edits do not invalidate unchanged
     * blocks. Missing targets, changed foci or prerequisite schedules do. A goal
     * the catalog has retired does not: the rest of the plan stays valid.
     */
    @Transactional(readOnly = true)
    public boolean isLearningPlanCompatible(
            String skillpilotId,
            String capturedCurriculumId,
            String landscapeId,
            List<LearnerLearningPlanApi.Block> capturedBlocks) {
        try {
            Learner learner = getLearner(skillpilotId);
            List<LearnerLearningPlanApi.Block> storedBlocks = LearnerLearningPlanService.withoutRetiredGoals(
                    capturedBlocks, retiredGoalIds(learner, landscapeId));
            // A retained plan for a deselected subject is history, even when
            // some of its atoms remain necessary foundations of another subject.
            if (!isUnitAssignmentSubjectSelected(learner, landscapeId)) return false;
            LearnerPlanningScopeResponse scope = getPlanningScope(skillpilotId, landscapeId);
            if (!Objects.equals(capturedCurriculumId, scope.curriculumId())
                    || !Objects.equals(landscapeId, scope.landscapeId())) {
                return false;
            }
            List<LearnerLearningPlanApi.Block> normalized = LearnerLearningPlanService.normalizeBlocks(
                    storedBlocks, scope, Set.of(), true);
            if (!normalized.equals(storedBlocks)) {
                return false;
            }
            // A stored plan keeps the goals it captured when a later regrouping moved them to
            // another section (Product Owner, 24 November 2026: old plans stay valid as long as
            // they still work).
            validateLearningPlanBlockFoci(skillpilotId, landscapeId, storedBlocks,
                    learningPlanCapturedSelections(storedBlocks));
            validateLearningPlanCurrentGraph(skillpilotId, storedBlocks);
            return orderLearningPlanBlocksByPrerequisites(skillpilotId, storedBlocks).equals(storedBlocks);
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) {
                throw exception;
            }
            return false;
        } catch (IllegalStateException | IllegalArgumentException | NullPointerException exception) {
            return false;
        }
    }

    void validateLearningPlanCurrentGraph(
            String skillpilotId, List<LearnerLearningPlanApi.Block> blocks) {
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        validateLearningPlanCompatibilityGraph(blocks, projection.structuralGoals());
    }

    /** Validates only graph data needed by the captured atoms; never tests mastery. */
    void validateLearningPlanCompatibilityGraph(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, LearningGoal> goals) {
        if (goals == null || goals.isEmpty() || goals.size() > MAX_LEARNING_PLAN_GRAPH_NODES) {
            throw new IllegalStateException("Learning-plan graph is missing or exceeds the supported bound");
        }
        Map<String, List<String>> parents = new HashMap<>();
        int references = 0;
        for (LearningGoal goal : goals.values()) {
            for (String ref : learningPlanGraphReferences(goal)) {
                if (++references > MAX_LEARNING_PLAN_GRAPH_REFERENCES) {
                    throw new IllegalStateException("Learning-plan graph exceeds the supported reference bound");
                }
            }
            for (String ref : goal.getContains() == null ? List.<String>of() : goal.getContains()) {
                String child = resolveGoalRef(ref, goals);
                if (child != null) {
                    parents.computeIfAbsent(child, ignored -> new ArrayList<>()).add(goal.getId());
                }
            }
        }
        List<String> atoms = blocks.stream().filter(block -> block.isAtomicLearning())
                .flatMap(block -> block.atomicGoalIds().stream()).toList();
        // Detect relevant contains cycles before inherited-requirement resolution.
        assertLearningPlanGraphAcyclic(atoms, goals,
                goalId -> parents.getOrDefault(goalId, List.of()));
        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(goals);
        Set<String> dependencies = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(atoms);
        int examined = 0;
        while (!pending.isEmpty()) {
            String goalId = pending.removeFirst();
            if (!goals.containsKey(goalId)) {
                throw new IllegalStateException("Learning-plan graph target is missing");
            }
            if (!dependencies.add(goalId)) {
                continue;
            }
            List<String> refs = new ArrayList<>(learningPlanGraphReferences(goals.get(goalId)));
            refs.addAll(effectiveRequires.getOrDefault(goalId, List.of()));
            for (String ref : refs) {
                if (++examined > MAX_LEARNING_PLAN_GRAPH_REFERENCES) {
                    throw new IllegalStateException("Learning-plan dependency closure exceeds the supported bound");
                }
                String resolved = resolveGoalRef(ref, goals);
                if (resolved == null) {
                    throw new IllegalStateException("Learning-plan graph reference is missing");
                }
                pending.addLast(resolved);
            }
        }
        // The model guarantees DAGs per edge kind, not for contains + requires
        // together. In particular a parent may legitimately require its child.
        assertLearningPlanGraphAcyclic(dependencies, goals,
                goalId -> goals.get(goalId).getContains() == null ? List.of() : goals.get(goalId).getContains());
        assertLearningPlanGraphAcyclic(dependencies, goals, goalId -> {
            List<String> refs = new ArrayList<>(effectiveRequires.getOrDefault(goalId, List.of()));
            if (goals.get(goalId).getRequires() != null) {
                refs.addAll(goals.get(goalId).getRequires());
            }
            return refs;
        });
        assertLearningPlanGraphAcyclic(dependencies, goals,
                goalId -> parents.getOrDefault(goalId, List.of()));
    }

    private Set<String> assertLearningPlanGraphAcyclic(
            Collection<String> roots,
            Map<String, LearningGoal> goals,
            java.util.function.Function<String, List<String>> referencesForGoal) {
        Map<String, Boolean> completed = new HashMap<>();
        ArrayDeque<Map.Entry<String, java.util.Iterator<String>>> stack = new ArrayDeque<>();
        int examinedReferences = 0;
        for (String root : roots) {
            if (completed.containsKey(root)) {
                continue;
            }
            if (!goals.containsKey(root)) {
                throw new IllegalStateException("Learning-plan graph target is missing");
            }
            completed.put(root, false);
            stack.push(Map.entry(root, referencesForGoal.apply(root).iterator()));
            while (!stack.isEmpty()) {
                var frame = stack.peek();
                if (!frame.getValue().hasNext()) {
                    completed.put(frame.getKey(), true);
                    stack.pop();
                    continue;
                }
                if (++examinedReferences > MAX_LEARNING_PLAN_GRAPH_REFERENCES) {
                    throw new IllegalStateException("Learning-plan dependency closure exceeds the supported bound");
                }
                String next = resolveGoalRef(frame.getValue().next(), goals);
                if (next == null || Boolean.FALSE.equals(completed.get(next))) {
                    throw new IllegalStateException("Learning-plan graph has a missing reference or cycle");
                }
                if (completed.containsKey(next)) {
                    continue;
                }
                completed.put(next, false);
                stack.push(Map.entry(next, referencesForGoal.apply(next).iterator()));
            }
        }
        return completed.keySet();
    }

    /**
     * Records the personalized subject projection and graph structure at an
     * explicit plan capture. This v2 digest is historical audit evidence, not a
     * validity predicate: current execution uses isLearningPlanCompatible and
     * still requires the current frontier before any Level-3 write.
     */
    @Transactional(readOnly = true)
    public String learningPlanFingerprint(
            String skillpilotId,
            String landscapeId,
            List<LearnerLearningPlanApi.Block> blocks) {
        return learningPlanFingerprint(skillpilotId, landscapeId, blocks, Map.of());
    }

    /** As above for a plan that already existed; see {@link #validateLearningPlanBlockFoci(String, String, List, Map)}. */
    @Transactional(readOnly = true)
    public String learningPlanFingerprint(
            String skillpilotId,
            String landscapeId,
            List<LearnerLearningPlanApi.Block> blocks,
            Map<Set<String>, Set<String>> capturedSelections) {
        List<LearnerLearningPlanApi.Block> effectiveBlocks = blocks == null
                ? Collections.emptyList()
                : List.copyOf(blocks);
        try {
            validateLearningPlanBlockFoci(skillpilotId, landscapeId, effectiveBlocks, capturedSelections);
            List<LearnerLearningPlanApi.Block> currentOrder =
                    orderLearningPlanBlocksByPrerequisites(skillpilotId, effectiveBlocks);
            if (!currentOrder.equals(effectiveBlocks)) {
                throw new IllegalStateException(
                        "The current prerequisite graph changes the stored plan order");
            }

            Learner learner = getLearner(skillpilotId);
            LearnerPlanningScopeResponse scope = getPlanningScope(skillpilotId, landscapeId);
            GoalProjection projection = getGoalProjection(
                    learner.getSelectedCurriculum(),
                    learner.getPersonalCurriculum());
            Map<String, List<String>> focusTargetIds = new LinkedHashMap<>();
            for (LearnerLearningPlanApi.Block block : effectiveBlocks) {
                if (block == null) {
                    continue;
                }
                List<String> focusGoalIds;
                if (("milestone".equals(block.kind()) || block.isAtomicLearning()) && block.goalIds() != null) {
                    focusGoalIds = block.goalIds();
                } else if (block.isAtomicLearning()) {
                    String focusGoalId = block.goalId();
                    if (focusGoalId == null || focusGoalId.isBlank()) {
                        if (block.atomicGoalIds() != null) {
                            for (String atomicGoalId : block.atomicGoalIds()) {
                                focusTargetIds.put(atomicGoalId, List.of(atomicGoalId));
                            }
                        }
                        continue;
                    }
                    focusGoalIds = List.of(focusGoalId);
                } else {
                    continue;
                }
                for (String focusGoalId : focusGoalIds) {
                    List<String> resolvedTargets = resolveProjectedFocusTargetIds(focusGoalId, projection)
                            .stream()
                            .filter(projection.regularTargetGoalIds()::contains)
                            .filter(goalId -> landscapeId.equals(
                                    landscapeService.getLandscapeIdForGoal(goalId)))
                            .sorted()
                            .toList();
                    focusTargetIds.put(focusGoalId, resolvedTargets);
                }
            }
            return computeLearningPlanFingerprint(
                    scope,
                    projection.structuralGoals(),
                    effectiveBlocks,
                    focusTargetIds);
        } catch (ResponseStatusException | IllegalStateException exception) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The personal curriculum or learning graph changed after this plan was captured");
        }
    }

    String computeLearningPlanFingerprint(
            LearnerPlanningScopeResponse scope,
            Map<String, LearningGoal> structuralGoals,
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, List<String>> focusTargetIds) {
        if (scope == null) {
            throw new IllegalStateException("Learning-plan scope is missing");
        }
        Map<String, LearningGoal> goals = structuralGoals == null
                ? Collections.emptyMap()
                : structuralGoals;
        Set<String> subjectAtoms = new LinkedHashSet<>(scope.scopeAtomicGoalIds());
        Map<String, Boolean> reachesSubjectAtom = new HashMap<>();
        LinkedHashSet<String> subjectPathGoalIds = new LinkedHashSet<>();
        for (String goalId : goals.keySet()) {
            if (learningPlanGoalReachesSubjectAtom(
                    goalId,
                    subjectAtoms,
                    goals,
                    reachesSubjectAtom,
                    new HashSet<>())) {
                subjectPathGoalIds.add(goalId);
            }
        }

        LinkedHashSet<String> dependencyGoalIds = new LinkedHashSet<>();
        ArrayDeque<String> dependencyQueue = new ArrayDeque<>();
        for (String goalId : subjectPathGoalIds) {
            LearningGoal goal = goals.get(goalId);
            if (goal == null || goal.getRequires() == null) {
                continue;
            }
            for (String requirement : goal.getRequires()) {
                String resolved = resolveGoalRef(requirement, goals);
                if (resolved != null) {
                    dependencyQueue.add(resolved);
                }
            }
        }
        while (!dependencyQueue.isEmpty()) {
            String goalId = dependencyQueue.removeFirst();
            if (!dependencyGoalIds.add(goalId)) {
                continue;
            }
            LearningGoal goal = goals.get(goalId);
            if (goal == null) {
                continue;
            }
            for (String reference : learningPlanGraphReferences(goal)) {
                String resolved = resolveGoalRef(reference, goals);
                if (resolved != null && !dependencyGoalIds.contains(resolved)) {
                    dependencyQueue.addLast(resolved);
                }
            }
        }

        LinkedHashSet<String> fingerprintGoalIds = new LinkedHashSet<>(subjectPathGoalIds);
        fingerprintGoalIds.addAll(dependencyGoalIds);
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            updateLearningPlanDigest(digest, "skillpilot-learning-plan-structure-v2");
            updateLearningPlanDigest(digest, scope.curriculumId());
            updateLearningPlanDigest(digest, scope.landscapeId());
            subjectAtoms.stream().sorted().forEach(goalId -> {
                updateLearningPlanDigest(digest, "subject-atom");
                updateLearningPlanDigest(digest, goalId);
            });

            fingerprintGoalIds.stream().sorted().forEach(goalId -> {
                LearningGoal goal = goals.get(goalId);
                updateLearningPlanDigest(digest, "goal");
                updateLearningPlanDigest(digest, goalId);
                updateLearningPlanDigest(digest, goal == null ? null : goal.getType());
                updateLearningPlanDigest(digest, goal == null ? null : goal.getNodeKind());
                updateLearningPlanDigest(digest, goal == null ? null : goal.getSemanticKind());
                if (goal == null) {
                    return;
                }
                boolean completeDependencyNode = dependencyGoalIds.contains(goalId);
                normalizedLearningPlanReferences(goal.getContains(), goals).stream()
                        .filter(childId -> completeDependencyNode || subjectPathGoalIds.contains(childId))
                        .sorted()
                        .forEach(childId -> {
                            updateLearningPlanDigest(digest, "contains");
                            updateLearningPlanDigest(digest, childId);
                        });
                normalizedLearningPlanReferences(goal.getRequires(), goals).stream()
                        .sorted()
                        .forEach(requiredId -> {
                            updateLearningPlanDigest(digest, "requires");
                            updateLearningPlanDigest(digest, requiredId);
                        });
            });

            (focusTargetIds == null ? Collections.<String, List<String>>emptyMap() : focusTargetIds)
                    .entrySet()
                    .stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> {
                        updateLearningPlanDigest(digest, "focus");
                        updateLearningPlanDigest(digest, entry.getKey());
                        (entry.getValue() == null ? Collections.<String>emptyList() : entry.getValue())
                                .stream()
                                .sorted()
                                .forEach(targetId -> {
                                    updateLearningPlanDigest(digest, "focus-target");
                                    updateLearningPlanDigest(digest, targetId);
                                });
                    });

            for (LearnerLearningPlanApi.Block block : blocks == null
                    ? Collections.<LearnerLearningPlanApi.Block>emptyList()
                    : blocks) {
                updateLearningPlanDigest(digest, "block");
                updateLearningPlanDigest(digest, block.id());
                updateLearningPlanDigest(digest, block.kind());
                if (block.unitAssignment() != null) {
                    updateLearningPlanDigest(digest, "unit-assignment");
                    updateLearningPlanDigest(digest, block.unitAssignment().sectionGoalId());
                    updateLearningPlanDigest(digest, block.unitAssignment().revision());
                    updateLearningPlanDigest(digest, block.unitAssignment().fingerprint());
                }
                if (!block.isActive()) updateLearningPlanDigest(digest, "inactive");
                updateLearningPlanDigest(digest, block.goalId());
                updateLearningPlanDigest(digest, block.startDate() == null ? null : block.startDate().toString());
                updateLearningPlanDigest(digest, block.endDate() == null ? null : block.endDate().toString());
                updateLearningPlanDigest(digest, block.date() == null ? null : block.date().toString());
                if (block.atomicGoalIds() != null) {
                    for (String atomicGoalId : block.atomicGoalIds()) {
                        updateLearningPlanDigest(digest, "block-atom");
                        updateLearningPlanDigest(digest, atomicGoalId);
                    }
                }
                if (("milestone".equals(block.kind()) || block.isAtomicLearning()) && block.goalIds() != null) {
                    for (String goalId : block.goalIds()) {
                        updateLearningPlanDigest(digest, "milestone".equals(block.kind()) ? "milestone-goal" : "learning-goal");
                        updateLearningPlanDigest(digest, goalId);
                    }
                }
            }
            return "sha256:" + java.util.HexFormat.of().formatHex(digest.digest());
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Could not fingerprint the current learning-plan structure", exception);
        }
    }

    private boolean learningPlanGoalReachesSubjectAtom(
            String goalId,
            Set<String> subjectAtoms,
            Map<String, LearningGoal> goals,
            Map<String, Boolean> memo,
            Set<String> visiting) {
        if (subjectAtoms.contains(goalId)) {
            return true;
        }
        if (memo.containsKey(goalId)) {
            return memo.get(goalId);
        }
        if (!visiting.add(goalId)) {
            throw new IllegalStateException("Learning-plan graph contains a contains cycle");
        }
        LearningGoal goal = goals.get(goalId);
        boolean reaches = false;
        if (goal != null && goal.getContains() != null) {
            for (String childReference : goal.getContains()) {
                String childId = resolveGoalRef(childReference, goals);
                if (childId != null && learningPlanGoalReachesSubjectAtom(
                        childId,
                        subjectAtoms,
                        goals,
                        memo,
                        visiting)) {
                    reaches = true;
                }
            }
        }
        visiting.remove(goalId);
        memo.put(goalId, reaches);
        return reaches;
    }

    private static List<String> learningPlanGraphReferences(LearningGoal goal) {
        List<String> references = new ArrayList<>();
        if (goal.getContains() != null) {
            references.addAll(goal.getContains());
        }
        if (goal.getRequires() != null) {
            references.addAll(goal.getRequires());
        }
        return references;
    }

    private List<String> normalizedLearningPlanReferences(
            List<String> references,
            Map<String, LearningGoal> goals) {
        if (references == null || references.isEmpty()) {
            return Collections.emptyList();
        }
        return references.stream()
                .filter(Objects::nonNull)
                .map(reference -> {
                    String resolved = resolveGoalRef(reference, goals);
                    return resolved == null ? reference.trim() : resolved;
                })
                .filter(reference -> !reference.isBlank())
                .distinct()
                .toList();
    }

    private static void updateLearningPlanDigest(
            java.security.MessageDigest digest,
            String value) {
        byte[] bytes = (value == null ? "<null>" : value).getBytes(StandardCharsets.UTF_8);
        byte[] length = Integer.toString(bytes.length).getBytes(StandardCharsets.US_ASCII);
        digest.update(length);
        digest.update((byte) ':');
        digest.update(bytes);
        digest.update((byte) '\n');
    }

    /**
     * Validates authored section foci before they become learner-owned plan
     * state. A focus must resolve inside the current learner-facing target
     * projection, stay within the requested subject, and contain every
     * materialized atomic goal of its learning block. Milestone topic roots
     * obey the same projection and subject boundary, including already mastered
     * targets, but never materialize scheduled learning work.
     */
    @Transactional(readOnly = true)
    public void validateLearningPlanBlockFoci(
            String skillpilotId,
            String landscapeId,
            List<LearnerLearningPlanApi.Block> blocks) {
        validateLearningPlanBlockFoci(skillpilotId, landscapeId, blocks, Map.of());
    }

    /**
     * As above, for a plan that already existed. {@code capturedSelections} names, per set of
     * foci, the goals the plan held in a block with exactly these foci before this check (see
     * {@link #learningPlanCapturedSelections(List)}): a stored or restored plan, or the stored
     * state of a plan that is being edited. A regrouping of the curriculum can move such a goal
     * out of its section. It stays in a block that names the same foci as long as it is a counted
     * goal of this subject. A block with other foci is a new selection: which of several foci a
     * goal came from is not stored, so adding or removing one must not hand the goal on to
     * another section. A block whose foci are all single goals loses nothing to a regrouping and
     * never keeps another goal. Every other goal must lie under a focus of its block.
     */
    @Transactional(readOnly = true)
    public void validateLearningPlanBlockFoci(
            String skillpilotId,
            String landscapeId,
            List<LearnerLearningPlanApi.Block> blocks,
            Map<Set<String>, Set<String>> capturedSelections) {
        if (blocks == null || blocks.isEmpty()) {
            return;
        }
        Map<Set<String>, Set<String>> captured = capturedSelections == null ? Map.of() : capturedSelections;
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The learner has no selected curriculum.");
        }
        String requestedLandscapeId = landscapeId == null ? "" : landscapeId.trim();
        GoalProjection projection = getGoalProjection(
                curriculumId,
                learner.getPersonalCurriculum());

        for (LearnerLearningPlanApi.Block block : blocks) {
            if (block == null || !(block.isAtomicLearning() || "milestone".equals(block.kind()))) continue;
            List<String> roots = "milestone".equals(block.kind())
                    ? block.goalIds() == null ? List.of() : block.goalIds()
                    : block.focusGoalIds();
            if (roots.isEmpty()) continue;
            LinkedHashSet<String> allowedAtoms = new LinkedHashSet<>();
            for (String root : roots) {
                allowedAtoms.addAll(validateLearningPlanFocus(root, block.id(), requestedLandscapeId, projection));
            }
            // Multiple canonical roots are a union, not an intersection. Each
            // submitted atom must still belong to this subject and to that union,
            // unless the plan had captured it in a block with exactly these roots
            // before and it is still a goal of the subject.
            if (!block.isAtomicLearning() || block.atomicGoalIds() == null) continue;
            Set<String> keptWithTheseSections = roots.stream().allMatch(root -> isSingleGoalFocus(root, projection))
                    ? Set.of() : captured.getOrDefault(new HashSet<>(roots), Set.of());
            for (String atomicGoalId : block.atomicGoalIds()) {
                if (allowedAtoms.contains(atomicGoalId)) continue;
                if (!keptWithTheseSections.contains(atomicGoalId)
                        || !isCountedAtomicGoal(projection.structuralGoals().get(atomicGoalId))
                        || !requestedLandscapeId.equals(landscapeService.getLandscapeIdForGoal(atomicGoalId))) {
                    throw invalidLearningPlanFocus(block.id());
                }
            }
        }
    }

    /**
     * The focus selections a plan holds: per set of foci of a learning block, the goals of the
     * blocks with exactly these foci. This is what a stored or restored plan, or the stored state
     * of an edited plan, may keep. Block ids play no part, so renaming or splitting a block keeps
     * its goals.
     */
    public static Map<Set<String>, Set<String>> learningPlanCapturedSelections(
            List<LearnerLearningPlanApi.Block> blocks) {
        Map<Set<String>, Set<String>> selections = new LinkedHashMap<>();
        if (blocks == null) return selections;
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (block == null || !block.isAtomicLearning() || block.atomicGoalIds() == null
                    || block.focusGoalIds().isEmpty() || block.focusGoalIds().stream().anyMatch(Objects::isNull)) {
                continue;
            }
            Set<String> goals = selections.computeIfAbsent(
                    new HashSet<>(block.focusGoalIds()), ignored -> new LinkedHashSet<>());
            block.atomicGoalIds().stream().filter(Objects::nonNull).forEach(goals::add);
        }
        return selections;
    }

    /** A section or cluster can lose a goal to a regrouping; a single goal used as a focus cannot. */
    private boolean isSingleGoalFocus(String focusGoalId, GoalProjection projection) {
        if (isCompositionStructureGoalId(focusGoalId)) return false;
        String projectedGoalId = resolveGoalIdInVisibleGoals(focusGoalId, projection.visibleGoals(), true);
        return projectedGoalId == null || isAtomicGoal(projection.visibleGoals().get(projectedGoalId));
    }

    /**
     * The counted goals of this subject that lie under the given plan foci today, including
     * voluntary assessments. {@code null} when a focus no longer resolves; that plan is outdated.
     * Plan navigation uses this to find a goal that a regrouping moved out of its block's section.
     */
    @Transactional(readOnly = true)
    public Set<String> getLearningPlanFocusAtomicGoalIds(
            String skillpilotId, String landscapeId, List<String> roots) {
        if (roots == null || roots.isEmpty()) return null;
        Learner learner = getLearner(skillpilotId);
        if (learner.getSelectedCurriculum() == null || learner.getSelectedCurriculum().isBlank()) return null;
        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String requestedLandscapeId = landscapeId == null ? "" : landscapeId.trim();
        LinkedHashSet<String> atoms = new LinkedHashSet<>();
        try {
            for (String root : roots) {
                atoms.addAll(validateLearningPlanFocus(root, "selected-scope", requestedLandscapeId, projection));
            }
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().is5xxServerError()) throw exception;
            return null;
        }
        return atoms;
    }

    /**
     * Visible, subject-local atoms of an explicit selection, never its requires closure.
     *
     * <p>A selection that no longer resolves is an ordinary answer for the readers of stored
     * plans: they catch the client error and treat the plan as outdated. The error must therefore
     * not mark their transaction for rollback. This method only reads; a caller that lets the error
     * pass still rolls its own transaction back.
     */
    @Transactional(readOnly = true, noRollbackFor = ResponseStatusException.class)
    public List<String> resolveLearningPlanGoalIds(
            String skillpilotId, String landscapeId, List<String> roots) {
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        LinkedHashSet<String> atoms = new LinkedHashSet<>();
        for (String root : roots) {
            atoms.addAll(validateLearningPlanFocus(root, "selected-scope", landscapeId, projection));
        }
        atoms.removeAll(implicitVoluntaryAssessments(learner, roots, atoms));
        return projection.regularTargetGoalIds().stream().filter(atoms::contains).toList();
    }

    /** Stored focus, without defaulting or widening, for binding an ongoing exam. */
    @Transactional(readOnly = true)
    public List<String> getStoredLearningPlanFocus(String skillpilotId, String landscapeId) {
        return getStoredPlannedGoals(skillpilotId).stream()
                .filter(id -> landscapeId.equals(landscapeService.getLandscapeIdForGoal(id))).toList();
    }

    /** The explicit focus binds manual plan choices only if its projected targets lie in one subject. */
    @Transactional(readOnly = true)
    Optional<String> getStoredLearningPlanFocusSubject(Learner learner) {
        List<String> focus = getStoredPlannedGoals(learner.getSkillpilotId());
        if (focus.isEmpty() || !hasCompletedPersonalCurriculum(learner)) return Optional.empty();
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Set<String> subjects = requestedLearningPlanSubjects(
                focus, projectedAtomicTargetIds(focus, projection), projection);
        return subjects.size() == 1 ? Optional.of(subjects.iterator().next()) : Optional.empty();
    }

    /**
     * The subjects a focus asks for. A section of a subject's view asks for that subject, also
     * when it holds the learning place of a goal of another subject, for example a Mathematics
     * preparation in a Physics section; any other focus asks for the subjects of its goals. The
     * plans and the exam of a subject bind what asks for that subject (issue #216).
     */
    private Set<String> requestedLearningPlanSubjects(
            List<String> focusIds, Set<String> focusAtoms, GoalProjection projection) {
        Set<String> subjects = landscapeIdsOf(focusAtoms);
        if (subjects.size() < 2 || focusIds.stream().noneMatch(this::isCompositionStructureGoalId)) return subjects;
        LinkedHashSet<String> narrowed = new LinkedHashSet<>();
        List<String> otherFoci = new ArrayList<>();
        for (String focusId : focusIds) {
            String viewSubject = sectionViewSubject(focusId, projection);
            if (viewSubject == null) {
                otherFoci.add(focusId);
                continue;
            }
            Set<String> owners = landscapeIdsOf(projectedAtomicTargetIds(List.of(focusId), projection));
            // A section without a goal of its own subject asks for the subjects it does hold.
            if (owners.contains(viewSubject)) narrowed.add(viewSubject);
            else narrowed.addAll(owners);
        }
        if (!otherFoci.isEmpty()) narrowed.addAll(landscapeIdsOf(projectedAtomicTargetIds(otherFoci, projection)));
        return narrowed;
    }

    private Set<String> landscapeIdsOf(Collection<String> goalIds) {
        return goalIds.stream().map(landscapeService::getLandscapeIdForGoal).filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    /**
     * A section of a subject's view asks for that subject only. A goal of another subject that has
     * its learning place under the section stays bound by the plans of its own subject: the
     * frontier under the section offers it, and a required opening of that subject, only if those
     * plans admit it, and the write that starts it reads the same frontier (issue #216).
     *
     * <p>The result gives, for a goal, the scope of its own subject's plans that binds it under
     * this focus, or null when nothing binds it: a goal of a subject the focus asks for, a subject
     * without followed plans, ordinary learning in that subject.
     */
    private java.util.function.Function<String, Set<String>> foreignSubjectPlanScopes(
            Learner learner, GoalProjection projection, List<String> prospectiveFocusIds) {
        List<LearnerLearningPlan> followed = currentFollowedLearningPlans(learner);
        if (followed.isEmpty()) return goalId -> null;
        List<String> focus = prospectiveFocusIds == null
                ? getStoredPlannedGoals(learner.getSkillpilotId()) : prospectiveFocusIds;
        if (focus.stream().noneMatch(this::isCompositionStructureGoalId)) return goalId -> null;
        Set<String> focusAtoms = projectedAtomicTargetIds(focus, projection);
        Set<String> requested = requestedLearningPlanSubjects(focus, focusAtoms, projection);
        if (requested.containsAll(landscapeIdsOf(focusAtoms))) return goalId -> null;
        // The exam of the other subject is the one that is going on once this focus is the stored
        // one, as the write under it sees it: the focus is the exam binding, never the goal asked
        // about. So the scope is the same for every goal of that subject: one evaluation each.
        Map<String, Optional<Set<String>>> scopes = new HashMap<>();
        return goalId -> {
            String owner = landscapeService.getLandscapeIdForGoal(goalId);
            if (owner == null || requested.contains(owner)) return null;
            return scopes.computeIfAbsent(owner, subject -> {
                List<LearnerLearningPlan> plans = followed.stream()
                        .filter(plan -> subject.equals(plan.getLandscapeId())).toList();
                return plans.isEmpty() ? Optional.empty()
                        : Optional.ofNullable(followedPlanScope(learner, projection, plans, focus));
            }).orElse(null);
        };
    }

    /** Names real missing requirements without enrolling or marking any of them. */
    @Transactional(readOnly = true)
    public String describeLearningPlanBlockage(String skillpilotId, List<String> selectedIds, String locale) {
        Learner learner = getLearner(skillpilotId);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        Map<String, Double> mastery = getMastery(skillpilotId);
        Map<String, Double> prerequisiteMastery = computeEffectivePrereqMastery(projection.structuralGoals(), mastery);
        Map<String, List<String>> requirements = computeEffectiveRequires(projection.structuralGoals());
        LinkedHashSet<String> names = new LinkedHashSet<>();
        boolean english = locale != null && locale.startsWith("en");
        for (String id : selectedIds) {
            if (mastery.getOrDefault(id, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD) continue;
            for (String reference : requirements.getOrDefault(id, List.of())) {
                String prerequisite = resolveGoalRef(reference, projection.structuralGoals());
                if (prerequisite == null || selectedIds.contains(prerequisite)
                        || prerequisiteMastery.getOrDefault(prerequisite, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD) continue;
                LearningGoal goal = projection.structuralGoals().get(prerequisite);
                if (goal != null) names.add(english && goal.getTitleEn() != null && !goal.getTitleEn().isBlank()
                        ? goal.getTitleEn() : goal.getTitle());
                if (names.size() >= 3) break;
            }
            if (names.size() >= 3) break;
        }
        return names.isEmpty()
                ? (english ? "No reachable learning goal in the selected scope at present"
                        : "Derzeit kein erreichbares Lernziel im ausgewählten Umfang")
                : (english ? "Open prerequisites: " : "Offene Voraussetzungen: ") + String.join(", ", names);
    }

    /** Null means ordinary learning; an empty set retains a paused individual plan or exam scope. */
    private Set<String> followedLearningScopeIds(Learner learner, GoalProjection projection,
            List<String> prospectiveFocusIds) {
        return followedLearningScopeIds(learner, projection, prospectiveFocusIds, currentFollowedLearningPlans(learner));
    }

    private Set<String> followedLearningScopeIds(Learner learner, GoalProjection projection,
            List<String> prospectiveFocusIds, List<LearnerLearningPlan> followed) {
        if (followed.isEmpty()) return null;
        List<String> binding = prospectiveFocusIds == null
                ? getStoredPlannedGoals(learner.getSkillpilotId()) : prospectiveFocusIds;
        Set<String> plannedLandscapes = followed.stream().map(LearnerLearningPlan::getLandscapeId)
                .collect(Collectors.toSet());
        Set<String> requestedAtoms = projectedAtomicTargetIds(binding, projection);
        Set<String> requestedLandscapes = requestedLearningPlanSubjects(binding, requestedAtoms, projection);
        // Explicit learning in another subject without any time plan remains free.
        if (!requestedAtoms.isEmpty() && requestedLandscapes.stream().noneMatch(plannedLandscapes::contains)) return null;
        return followedPlanScope(learner, projection, followed.stream()
                .filter(plan -> requestedLandscapes.isEmpty() || requestedLandscapes.contains(plan.getLandscapeId()))
                .toList(), binding);
    }

    /**
     * The scope the given followed plans define: null for ordinary learning, an empty set for a
     * paused individual plan, otherwise the goals of the exam. Of the binding, each plan reads the
     * goals of its own subject to find the exam that is going on.
     */
    private Set<String> followedPlanScope(Learner learner, GoalProjection projection,
            List<LearnerLearningPlan> plans, List<String> binding) {
        LinkedHashSet<String> atoms = new LinkedHashSet<>();
        LocalDate asOf = LocalDate.now(learningPlanClock.withZone(LEARNING_PLAN_ZONE));
        boolean hasExam = false;
        boolean ordinaryLearning = false;
        boolean unavailablePlan = false;
        for (LearnerLearningPlan plan : plans) {
            try {
                var captured = readPortableLearningPlanBlocks(plan);
                validateFollowedLearningPlanShape(captured);
                var blocks = LearnerLearningPlanService.effectivePlanBlocks(this, learner, plan.getLandscapeId(), captured);
                // A plan that cannot be evaluated today defines no exam scope and leaves ordinary
                // learning open; the plan status keeps reporting it (Product Owner, 26 November
                // 2026, issue #205). Two things narrow learning: an exam day, and a plan whose
                // learning is all paused, which narrows it to nothing. For both the complete
                // compatibility of the stored plan is decisive.
                if (!Objects.equals(plan.getCurriculumId(), learner.getSelectedCurriculum())) {
                    unavailablePlan = true;
                    continue;
                }
                boolean examDay = LearnerLearningPlanService.hasActiveExamDay(captured);
                if (examDay && !isLearningPlanCompatible(
                        learner.getSkillpilotId(), plan.getCurriculumId(), plan.getLandscapeId(), captured)) {
                    unavailablePlan = true;
                    continue;
                }
                var scope = LearningPlanScopeResolver.resolve(blocks, asOf,
                        roots -> resolveLearningPlanGoalIds(learner.getSkillpilotId(), plan.getLandscapeId(), roots),
                        binding.stream().filter(id -> plan.getLandscapeId().equals(
                                landscapeService.getLandscapeIdForGoal(id))).toList());
                if ("exam".equals(scope.kind())) {
                    hasExam = true;
                    scope.goalIds().stream().filter(projection.targetGoalIds()::contains).forEach(atoms::add);
                } else if (!scope.goalIds().isEmpty() || blocks.stream().anyMatch(block ->
                        block.unitAssignment() != null)) {
                    ordinaryLearning = true;
                } else if (!examDay && !isLearningPlanCompatible(
                        learner.getSkillpilotId(), plan.getCurriculumId(), plan.getLandscapeId(), captured)) {
                    unavailablePlan = true;
                }
            } catch (ResponseStatusException exception) {
                if (exception.getStatusCode().is5xxServerError()) throw exception;
                unavailablePlan = true;
            } catch (IllegalStateException | IllegalArgumentException exception) {
                unavailablePlan = true;
            }
        }
        if (!hasExam && (ordinaryLearning || unavailablePlan)) return null;
        if (hasExam && !atoms.isEmpty() && !projection.extensionPreparations().isEmpty()) {
            // A captured exam topic may need a goal from a deselected block. Its
            // prerequisites belong to this execution scope, never to the saved plan.
            addRequiredExtensionPreparations(atoms, projection);
        }
        return atoms;
    }

    /** The historical JSON boundary is explicit; internal programming errors are not fallback signals. */
    private void validateFollowedLearningPlanShape(List<LearnerLearningPlanApi.Block> blocks) {
        for (var block : blocks) {
            if (block.kind() == null || !Set.of("learning", "buffer", "milestone").contains(block.kind())
                    || ("milestone".equals(block.kind()) ? block.date() == null
                            : block.startDate() == null || block.endDate() == null)
                    || (block.isAtomicLearning() && (block.atomicGoalIds() == null
                            || block.atomicGoalIds().stream().anyMatch(id -> id == null || id.isBlank())))
                    || (block.goalIds() != null && block.goalIds().stream().anyMatch(id -> id == null || id.isBlank()))) {
                throw new IllegalStateException("Stored learning-plan block has an invalid shape");
            }
        }
    }

    private Set<String> validateLearningPlanFocus(
            String goalId,
            String blockId,
            String requestedLandscapeId,
            GoalProjection projection) {
        List<String> focusTargetIds = resolveProjectedFocusTargetIds(goalId, projection);
        if (focusTargetIds.isEmpty()) throw invalidLearningPlanFocus(blockId);
        // A section of this subject's own view can hold the learning place of a goal of another
        // subject, for example a Mathematics preparation in a Physics section. That goal belongs
        // to the plan of its own subject, so the selection of this plan leaves it out. A focus
        // that is not a section of this subject is still refused as soon as it holds a goal of
        // another subject (issue #216).
        boolean sectionOfThisSubject = requestedLandscapeId.equals(sectionViewSubject(goalId, projection));
        LinkedHashSet<String> focusedAtomicIds = new LinkedHashSet<>();
        for (String targetGoalId : focusTargetIds) {
            LearningGoal structuralGoal = projection.structuralGoals().get(targetGoalId);
            if (!isCountedAtomicGoal(structuralGoal) || projection.extensionPreparations().contains(targetGoalId)) continue;
            if (!requestedLandscapeId.equals(landscapeService.getLandscapeIdForGoal(targetGoalId))) {
                if (sectionOfThisSubject) continue;
                throw invalidLearningPlanFocus(blockId);
            }
            focusedAtomicIds.add(targetGoalId);
        }
        if (focusedAtomicIds.isEmpty()) throw invalidLearningPlanFocus(blockId);
        return Set.copyOf(focusedAtomicIds);
    }

    /** The subject of the composition view whose structure the focus is; null for any other focus. */
    private String sectionViewSubject(String focusGoalId, GoalProjection projection) {
        if (!isCompositionStructureGoalId(focusGoalId) || compositionViewService == null) return null;
        CompositionViewService.CompositionStructureResolution resolution =
                projectedStructure(focusGoalId, projection);
        if (resolution == null) return null;
        Map<String, Object> view = compositionViewService.findViewById(resolution.viewId());
        return view != null && view.get("landscapeId") instanceof String owner && !owner.isBlank()
                ? owner.trim() : null;
    }

    /**
     * Keeps an already valid plan order and otherwise repairs prerequisite
     * scheduling across the whole subject plan. Atoms never leave their
     * submitted block; only their positions inside that block may change.
     */
    @Transactional(readOnly = true)
    public List<LearnerLearningPlanApi.Block> orderLearningPlanBlocksByPrerequisites(
            String skillpilotId,
            List<LearnerLearningPlanApi.Block> blocks) {
        if (blocks == null || blocks.isEmpty()) {
            return blocks == null ? List.of() : List.copyOf(blocks);
        }
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The learner has no selected curriculum.");
        }
        GoalProjection projection = getGoalProjection(
                curriculumId,
                learner.getPersonalCurriculum());
        Map<String, LearningGoal> structuralGoals = projection.structuralGoals();
        Map<String, List<String>> effectiveRequires = computeEffectiveRequires(structuralGoals);
        List<String> submittedAtoms = blocks.stream()
                .filter(block -> block.isActive() && block.isAtomicLearning())
                .filter(block -> block.atomicGoalIds() != null)
                .flatMap(block -> block.atomicGoalIds().stream())
                .toList();
        Map<String, LinkedHashSet<String>> prerequisitesByDependent =
                planPrerequisitesByDependent(
                        submittedAtoms,
                        structuralGoals,
                        effectiveRequires);
        return orderLearningPlanBlocksForPrerequisites(blocks, prerequisitesByDependent);
    }

    /** Core fixed-block scheduler, package-visible for focused graph regressions. */
    List<LearnerLearningPlanApi.Block> orderLearningPlanBlocksForPrerequisites(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, ? extends Collection<String>> submittedPrerequisitesByDependent) {
        List<String> submittedAtoms = blocks.stream()
                .filter(block -> block.isActive() && block.isAtomicLearning())
                .filter(block -> block.atomicGoalIds() != null)
                .flatMap(block -> block.atomicGoalIds().stream())
                .toList();
        LinkedHashSet<String> planAtoms = new LinkedHashSet<>(submittedAtoms);
        Map<String, LinkedHashSet<String>> prerequisitesByDependent = new LinkedHashMap<>();
        for (String dependentId : planAtoms) {
            LinkedHashSet<String> plannedPrerequisites = new LinkedHashSet<>();
            Collection<String> submittedPrerequisites = submittedPrerequisitesByDependent
                    .get(dependentId);
            if (submittedPrerequisites == null) {
                submittedPrerequisites = List.of();
            }
            for (String prerequisiteId : submittedPrerequisites) {
                if (planAtoms.contains(prerequisiteId) && !dependentId.equals(prerequisiteId)) {
                    plannedPrerequisites.add(prerequisiteId);
                }
            }
            prerequisitesByDependent.put(dependentId, plannedPrerequisites);
        }
        List<String> topologicalOrder = stablePlanTopologicalOrder(
                submittedAtoms,
                prerequisitesByDependent);
        List<LocalDate> activeWorkdays = learningPlanActiveWorkdays(blocks);
        LearningPlanScheduleCheckBudget scheduleCheckBudget =
                new LearningPlanScheduleCheckBudget();

        if (hasValidLearningPlanSchedule(
                blocks,
                prerequisitesByDependent,
                activeWorkdays,
                scheduleCheckBudget)) {
            return List.copyOf(blocks);
        }

        Map<String, LinkedHashSet<String>> dependentsByPrerequisite = new HashMap<>();
        topologicalOrder.forEach(goalId ->
                dependentsByPrerequisite.put(goalId, new LinkedHashSet<>()));
        prerequisitesByDependent.forEach((dependentId, prerequisiteIds) ->
                prerequisiteIds.forEach(prerequisiteId ->
                        dependentsByPrerequisite
                                .computeIfAbsent(prerequisiteId, ignored -> new LinkedHashSet<>())
                                .add(dependentId)));

        Map<String, LocalDate> firstPossibleDue = new HashMap<>();
        Map<String, LocalDate> lastPossibleDue = new HashMap<>();
        Map<String, LocalDate> scheduledDueDates = LearnerLearningPlanService
                .scheduledAtomicGoalDueDatesForSchedule(blocks);
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (!block.isActive() || !block.isAtomicLearning()
                    || block.atomicGoalIds() == null
                    || block.atomicGoalIds().isEmpty()) {
                continue;
            }
            LocalDate firstDue = scheduledDueDates.get(block.atomicGoalIds().get(0));
            LocalDate lastDue = scheduledDueDates.get(
                    block.atomicGoalIds().get(block.atomicGoalIds().size() - 1));
            if (firstDue == null || lastDue == null) {
                throw new LearningPlanPrerequisiteScheduleConflictException();
            }
            block.atomicGoalIds().forEach(goalId -> {
                firstPossibleDue.put(goalId, firstDue);
                lastPossibleDue.put(goalId, lastDue);
            });
        }
        List<LearnerLearningPlanApi.Block> repaired = repairLearningPlanDueOrderSequence(
                blocks,
                topologicalOrder,
                prerequisitesByDependent,
                dependentsByPrerequisite,
                firstPossibleDue,
                lastPossibleDue,
                activeWorkdays,
                scheduleCheckBudget,
                true);
        if (repaired == null) {
            repaired = repairLearningPlanDueOrderSequence(
                    blocks,
                    topologicalOrder,
                    prerequisitesByDependent,
                    dependentsByPrerequisite,
                    firstPossibleDue,
                    lastPossibleDue,
                    activeWorkdays,
                    scheduleCheckBudget,
                    false);
        }
        if (repaired == null) {
            throw new LearningPlanPrerequisiteScheduleConflictException();
        }
        return List.copyOf(repaired);
    }

    private List<LocalDate> learningPlanActiveWorkdays(
            List<LearnerLearningPlanApi.Block> blocks) {
        TreeSet<LocalDate> activeWorkdays = new TreeSet<>();
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (!block.isActive() || !block.isAtomicLearning()
                    || block.atomicGoalIds() == null
                    || block.atomicGoalIds().isEmpty()) {
                continue;
            }
            LocalDate start = block.startDate();
            LocalDate end = block.endDate();
            if (start == null || end == null || end.isBefore(start)) {
                throw new LearningPlanPrerequisiteScheduleConflictException();
            }
            LocalDate date = start;
            while (true) {
                if (!isPlanWeekend(date)
                        && activeWorkdays.add(date)
                        && activeWorkdays.size()
                                > MAX_LEARNING_PLAN_SCHEDULE_CHECK_WORKDAYS) {
                    throw new LearningPlanPrerequisiteScheduleConflictException();
                }
                if (date.equals(end)) {
                    break;
                }
                date = date.plusDays(1);
            }
        }
        return List.copyOf(activeWorkdays);
    }

    private LearningPlanDueCheck learningPlanScheduleCheck(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent,
            List<LocalDate> activeWorkdays,
            LearningPlanScheduleCheckBudget scheduleCheckBudget) {
        long learningBlockCount = blocks.stream()
                .filter(block -> block.isActive() && block.isAtomicLearning())
                .count();
        long atomCount = blocks.stream()
                .filter(block -> block.isActive() && block.isAtomicLearning())
                .filter(block -> block.atomicGoalIds() != null)
                .mapToLong(block -> block.atomicGoalIds().size())
                .sum();
        long prerequisiteEdgeCount = prerequisitesByDependent.values().stream()
                .mapToLong(Set::size)
                .sum();
        long positionCheckOperations = atomCount + prerequisiteEdgeCount;
        long scheduleOperations = atomCount
                + 10L * learningBlockCount
                + activeWorkdays.size();
        scheduleCheckBudget.consume(positionCheckOperations + scheduleOperations);

        // The global due-slot schedule is monotone, so comparing its actual
        // per-goal due dates is both necessary and sufficient for every
        // cumulative prerequisite frontier.
        LearningPlanDueCheck positionCheck = learningPlanDueCheck(
                blocks,
                prerequisitesByDependent);
        return positionCheck;
    }

    private boolean hasValidLearningPlanSchedule(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent,
            List<LocalDate> activeWorkdays,
            LearningPlanScheduleCheckBudget scheduleCheckBudget) {
        return learningPlanScheduleCheck(
                blocks,
                prerequisitesByDependent,
                activeWorkdays,
                scheduleCheckBudget).violations().isEmpty();
    }

    private LearningPlanDueCheck learningPlanDueCheck(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent) {
        Map<String, LocalDate> dueDates = LearnerLearningPlanService
                .scheduledAtomicGoalDueDatesForSchedule(blocks);

        List<LearningPlanDueViolation> violations = new ArrayList<>();
        prerequisitesByDependent.forEach((dependentId, prerequisiteIds) -> {
            LocalDate dependentDue = dueDates.get(dependentId);
            for (String prerequisiteId : prerequisiteIds) {
                LocalDate prerequisiteDue = dueDates.get(prerequisiteId);
                if (prerequisiteDue != null
                        && dependentDue != null
                        && prerequisiteDue.isAfter(dependentDue)) {
                    violations.add(new LearningPlanDueViolation(
                            dependentId,
                            prerequisiteId,
                            dependentDue,
                            prerequisiteDue));
                }
            }
        });
        return new LearningPlanDueCheck(dueDates, List.copyOf(violations));
    }

    private List<LearnerLearningPlanApi.Block> repairLearningPlanDueOrderSequence(
            List<LearnerLearningPlanApi.Block> blocks,
            List<String> topologicalOrder,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent,
            Map<String, LinkedHashSet<String>> dependentsByPrerequisite,
            Map<String, LocalDate> firstPossibleDue,
            Map<String, LocalDate> lastPossibleDue,
            List<LocalDate> activeWorkdays,
            LearningPlanScheduleCheckBudget scheduleCheckBudget,
            boolean prerequisitesEarlierFirst) {
        LearningPlanRepairAttempt firstDirection =
                repairLearningPlanDueOrderDirection(
                        blocks,
                        topologicalOrder,
                        prerequisitesByDependent,
                        dependentsByPrerequisite,
                        prerequisitesEarlierFirst ? lastPossibleDue : firstPossibleDue,
                        activeWorkdays,
                        scheduleCheckBudget,
                        prerequisitesEarlierFirst);
        if (firstDirection.valid()) {
            return firstDirection.blocks();
        }

        LearningPlanRepairAttempt secondDirection =
                repairLearningPlanDueOrderDirection(
                        firstDirection.blocks(),
                        topologicalOrder,
                        prerequisitesByDependent,
                        dependentsByPrerequisite,
                        prerequisitesEarlierFirst ? firstPossibleDue : lastPossibleDue,
                        activeWorkdays,
                        scheduleCheckBudget,
                        !prerequisitesEarlierFirst);
        return secondDirection.valid() ? secondDirection.blocks() : null;
    }

    private LearningPlanRepairAttempt repairLearningPlanDueOrderDirection(
            List<LearnerLearningPlanApi.Block> blocks,
            List<String> topologicalOrder,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent,
            Map<String, LinkedHashSet<String>> dependentsByPrerequisite,
            Map<String, LocalDate> initialPriority,
            List<LocalDate> activeWorkdays,
            LearningPlanScheduleCheckBudget scheduleCheckBudget,
            boolean prerequisitesEarlier) {
        Map<String, LocalDate> priorityByGoalId = new HashMap<>(initialPriority);
        propagateLearningPlanPriority(
                topologicalOrder,
                prerequisitesByDependent,
                dependentsByPrerequisite,
                priorityByGoalId,
                prerequisitesEarlier);

        List<LearnerLearningPlanApi.Block> currentBlocks = List.copyOf(blocks);
        int maxIterations = Math.max(
                32,
                Math.min(
                        MAX_LEARNING_PLAN_REPAIR_ITERATIONS,
                        topologicalOrder.size()));
        for (int iteration = 0; iteration < maxIterations; iteration++) {
            List<LearnerLearningPlanApi.Block> ordered = orderLearningPlanBlocksByPriority(
                    currentBlocks,
                    priorityByGoalId);
            LearningPlanDueCheck checked = learningPlanScheduleCheck(
                    ordered,
                    prerequisitesByDependent,
                    activeWorkdays,
                    scheduleCheckBudget);
            currentBlocks = ordered;
            if (checked.violations().isEmpty()) {
                return new LearningPlanRepairAttempt(ordered, true);
            }

            boolean changed = false;
            for (LearningPlanDueViolation violation : checked.violations()) {
                String goalId = prerequisitesEarlier
                        ? violation.prerequisiteId()
                        : violation.dependentId();
                LocalDate requestedPriority = prerequisitesEarlier
                        ? violation.earlierPriority()
                        : violation.laterPriority();
                LocalDate currentPriority = priorityByGoalId.get(goalId);
                if (currentPriority != null
                        && requestedPriority != null
                        && (prerequisitesEarlier
                                ? requestedPriority.isBefore(currentPriority)
                                : requestedPriority.isAfter(currentPriority))) {
                    priorityByGoalId.put(goalId, requestedPriority);
                    changed = true;
                }
            }
            if (!changed) {
                return new LearningPlanRepairAttempt(ordered, false);
            }
            propagateLearningPlanPriority(
                    topologicalOrder,
                    prerequisitesByDependent,
                    dependentsByPrerequisite,
                    priorityByGoalId,
                    prerequisitesEarlier);
        }
        return new LearningPlanRepairAttempt(currentBlocks, false);
    }

    private void propagateLearningPlanPriority(
            List<String> topologicalOrder,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent,
            Map<String, LinkedHashSet<String>> dependentsByPrerequisite,
            Map<String, LocalDate> priorityByGoalId,
            boolean prerequisitesEarlier) {
        if (prerequisitesEarlier) {
            for (int index = topologicalOrder.size() - 1; index >= 0; index--) {
                String dependentId = topologicalOrder.get(index);
                LocalDate dependentPriority = priorityByGoalId.get(dependentId);
                Set<String> prerequisiteIds = prerequisitesByDependent.get(dependentId);
                if (prerequisiteIds == null) {
                    continue;
                }
                for (String prerequisiteId : prerequisiteIds) {
                    LocalDate prerequisitePriority = priorityByGoalId.get(prerequisiteId);
                    if (prerequisitePriority != null
                            && dependentPriority != null
                            && prerequisitePriority.isAfter(dependentPriority)) {
                        priorityByGoalId.put(prerequisiteId, dependentPriority);
                    }
                }
            }
            return;
        }
        for (String prerequisiteId : topologicalOrder) {
            LocalDate prerequisitePriority = priorityByGoalId.get(prerequisiteId);
            Set<String> dependentIds = dependentsByPrerequisite.get(prerequisiteId);
            if (dependentIds == null) {
                continue;
            }
            for (String dependentId : dependentIds) {
                LocalDate dependentPriority = priorityByGoalId.get(dependentId);
                if (prerequisitePriority != null
                        && dependentPriority != null
                        && prerequisitePriority.isAfter(dependentPriority)) {
                    priorityByGoalId.put(dependentId, prerequisitePriority);
                }
            }
        }
    }

    private List<LearnerLearningPlanApi.Block> orderLearningPlanBlocksByPriority(
            List<LearnerLearningPlanApi.Block> blocks,
            Map<String, LocalDate> priorityByGoalId) {
        Map<String, Integer> currentOrderIndex = new HashMap<>();
        int currentIndex = 0;
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (!block.isActive() || !block.isAtomicLearning() || block.atomicGoalIds() == null) {
                continue;
            }
            for (String goalId : block.atomicGoalIds()) {
                currentOrderIndex.putIfAbsent(goalId, currentIndex++);
            }
        }
        List<LearnerLearningPlanApi.Block> orderedBlocks = new ArrayList<>(blocks.size());
        Comparator<String> byPriority = Comparator
                .comparing(
                        (String goalId) -> priorityByGoalId.get(goalId),
                        Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparingInt(goalId -> currentOrderIndex.getOrDefault(
                        goalId,
                        Integer.MAX_VALUE))
                .thenComparing(goalId -> goalId);
        for (LearnerLearningPlanApi.Block block : blocks) {
            if (!block.isActive() || !block.isAtomicLearning()
                    || block.atomicGoalIds() == null
                    || block.atomicGoalIds().size() < 2) {
                orderedBlocks.add(block);
                continue;
            }
            List<String> orderedAtoms = new ArrayList<>(block.atomicGoalIds());
            orderedAtoms.sort(byPriority);
            orderedBlocks.add(new LearnerLearningPlanApi.Block(
                    block.id(),
                    block.kind(),
                    block.goalId(),
                    block.title(),
                    block.startDate(),
                    block.endDate(),
                    block.date(),
                    List.copyOf(orderedAtoms),
                    block.goalIds(),
                    block.active()));
        }
        return List.copyOf(orderedBlocks);
    }

    private Map<String, LinkedHashSet<String>> planPrerequisitesByDependent(
            List<String> planAtoms,
            Map<String, LearningGoal> structuralGoals,
            Map<String, List<String>> effectiveRequires) {
        LinkedHashSet<String> planAtomSet = new LinkedHashSet<>(planAtoms);
        Map<String, LinkedHashSet<String>> prerequisitesByDependent = new LinkedHashMap<>();
        for (String dependentId : planAtomSet) {
            LinkedHashSet<String> prerequisiteAtoms = new LinkedHashSet<>();
            for (String prerequisiteRef : effectiveRequires.getOrDefault(
                    dependentId,
                    Collections.emptyList())) {
                collectPlanPrerequisiteAtoms(
                        prerequisiteRef,
                        structuralGoals,
                        planAtomSet,
                        prerequisiteAtoms,
                        new HashSet<>());
            }
            prerequisiteAtoms.remove(dependentId);
            prerequisitesByDependent.put(dependentId, prerequisiteAtoms);
        }
        return prerequisitesByDependent;
    }

    private record LearningPlanDueViolation(
            String dependentId,
            String prerequisiteId,
            LocalDate earlierPriority,
            LocalDate laterPriority) {
    }

    private record LearningPlanDueCheck(
            Map<String, LocalDate> dueDates,
            List<LearningPlanDueViolation> violations) {
    }

    private record LearningPlanRepairAttempt(
            List<LearnerLearningPlanApi.Block> blocks,
            boolean valid) {
    }

    private static final class LearningPlanScheduleCheckBudget {
        private long remaining = MAX_LEARNING_PLAN_SCHEDULE_CHECK_OPERATIONS;

        private void consume(long operations) {
            if (operations < 0L || operations > remaining) {
                throw new LearningPlanPrerequisiteScheduleConflictException();
            }
            remaining -= operations;
        }
    }

    private static boolean isPlanWeekend(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    private List<String> stablePlanTopologicalOrder(
            List<String> submittedAtoms,
            Map<String, LinkedHashSet<String>> prerequisitesByDependent) {
        LinkedHashSet<String> atomSet = new LinkedHashSet<>(submittedAtoms);
        Map<String, Integer> submittedIndex = new HashMap<>();
        Map<String, Integer> indegree = new HashMap<>();
        Map<String, LinkedHashSet<String>> dependents = new HashMap<>();
        int index = 0;
        for (String atomId : atomSet) {
            submittedIndex.put(atomId, index++);
            indegree.put(atomId, 0);
            dependents.put(atomId, new LinkedHashSet<>());
        }

        for (String dependentId : atomSet) {
            Set<String> prerequisiteIds = prerequisitesByDependent.get(dependentId);
            if (prerequisiteIds == null) {
                continue;
            }
            for (String prerequisiteId : prerequisiteIds) {
                if (dependents.get(prerequisiteId).add(dependentId)) {
                    indegree.compute(dependentId, (ignored, value) -> value == null ? 1 : value + 1);
                }
            }
        }

        PriorityQueue<String> ready = new PriorityQueue<>(
                Comparator.comparingInt(submittedIndex::get));
        indegree.forEach((goalId, count) -> {
            if (count == 0) {
                ready.add(goalId);
            }
        });
        List<String> ordered = new ArrayList<>(atomSet.size());
        while (!ready.isEmpty()) {
            String prerequisiteId = ready.remove();
            ordered.add(prerequisiteId);
            Set<String> dependentIds = dependents.get(prerequisiteId);
            if (dependentIds == null) {
                continue;
            }
            for (String dependentId : dependentIds) {
                int remaining = indegree.computeIfPresent(dependentId, (ignored, value) -> value - 1);
                if (remaining == 0) {
                    ready.add(dependentId);
                }
            }
        }
        if (ordered.size() != atomSet.size()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Learning-plan atoms contain a prerequisite cycle.");
        }
        return List.copyOf(ordered);
    }

    private void collectPlanPrerequisiteAtoms(
            String goalRef,
            Map<String, LearningGoal> structuralGoals,
            Set<String> blockAtoms,
            Set<String> result,
            Set<String> visiting) {
        String goalId = resolveGoalRef(goalRef, structuralGoals);
        if (goalId == null || !visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = structuralGoals.get(goalId);
        if (goal == null) {
            visiting.remove(goalId);
            return;
        }
        if (goal.getContains() == null || goal.getContains().isEmpty()) {
            if (blockAtoms.contains(goalId)) {
                result.add(goalId);
            }
            visiting.remove(goalId);
            return;
        }
        for (String childRef : goal.getContains()) {
            collectPlanPrerequisiteAtoms(
                    childRef,
                    structuralGoals,
                    blockAtoms,
                    result,
                    visiting);
        }
        visiting.remove(goalId);
    }

    /** Locks the owning learner before any learner-plan row lock is acquired. */
    @Transactional
    public void acquireLearningPlanMutationLock(String skillpilotId) {
        learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
    }

    private static ResponseStatusException invalidLearningPlanFocus(String blockId) {
        return new ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST,
                "Learning-plan block focus is not a subject-local ancestor of its atomic goals: "
                        + (blockId == null ? "<unknown>" : blockId));
    }

    private List<String> resolveEffectiveProjectedFocusIds(
            Learner learner,
            GoalProjection projection) {
        if (learner == null || projection == null) {
            return Collections.emptyList();
        }
        Set<String> followedScope = followedLearningScopeIds(learner, projection, null);
        if (followedScope != null) return List.copyOf(followedScope);
        List<String> projectedFocusIds = resolveProjectedTargetFocusIds(
                getStoredPlannedGoals(learner.getSkillpilotId()),
                projection);
        if (!projectedFocusIds.isEmpty()
                || !hasCompletedPersonalCurriculum(learner)) {
            return projectedFocusIds;
        }
        String defaultFocusId = resolveDefaultProjectedFocusId(
                learner.getSelectedCurriculum(),
                projection);
        return defaultFocusId == null
                ? Collections.emptyList()
                : List.of(defaultFocusId);
    }

    /**
     * The focus the learner chose, plus the goal in progress that a regrouping moved out of it.
     * Only what teaches and completes that goal reads this: frontier, required unit opening, the
     * coach's unit context and the check that would otherwise clear the goal. Everything that
     * shows, stores or exports the learner's choice keeps reading the chosen focus.
     */
    private List<String> resolveRuntimeProjectedFocusIds(Learner learner, GoalProjection projection) {
        List<String> chosenFocusIds = resolveEffectiveProjectedFocusIds(learner, projection);
        String regrouped = regroupedGoalInProgress(learner, projection, chosenFocusIds);
        if (regrouped == null) return chosenFocusIds;
        List<String> widened = new ArrayList<>(chosenFocusIds);
        widened.add(regrouped);
        return widened;
    }

    /**
     * A regrouping of the curriculum can move the goal a learner is working on out of the section
     * they focus. A focus change by the learner clears a goal outside the new focus when it is
     * written, and an ordinary goal can only be started inside the focus, so an ordinary goal in
     * progress outside the chosen focus was moved by the curriculum. It stays in progress as long
     * as it is a target of the Personal Curriculum in a subject of the focus. Exams and card decks
     * are not kept this way: an exam outside the focus is governed by its own direct-assessment
     * binding or by the explicit choice of its offer, a deck by its practice context. A learner
     * who follows plans is governed by the scope of the plans.
     */
    private String regroupedGoalInProgress(
            Learner learner, GoalProjection projection, List<String> chosenFocusIds) {
        if (learner == null || projection == null || chosenFocusIds == null || chosenFocusIds.isEmpty()) return null;
        String storedActiveGoalId = learner.getActiveGoalId();
        if (storedActiveGoalId == null || storedActiveGoalId.isBlank()
                || chosenFocusIds.contains(storedActiveGoalId)) {
            return null;
        }
        String activeGoalId = resolveGoalIdInVisibleGoals(storedActiveGoalId, projection.visibleGoals(), false);
        LearningGoal goal = activeGoalId == null ? null : projection.visibleGoals().get(activeGoalId);
        if (!storedActiveGoalId.equals(activeGoalId)
                || !projection.targetGoalIds().contains(activeGoalId)
                || !isAtomicGoal(goal) || isExamGoal(goal) || CompletionProfileCompiler.isMemory(goal)) {
            return null;
        }
        if (followedLearningScopeIds(learner, projection, null) != null) return null;
        List<String> focusScopeIds = resolveProjectedTargetScopeIds(chosenFocusIds, projection);
        if (focusScopeIds.isEmpty()
                || !isGoalOutOfPlannedScope(activeGoalId, focusScopeIds, projection.structuralGoals(), null)) {
            return null;
        }
        String landscapeId = landscapeService.getLandscapeIdForGoal(activeGoalId);
        if (landscapeId == null || focusScopeIds.stream()
                .noneMatch(id -> landscapeId.equals(landscapeService.getLandscapeIdForGoal(id)))) {
            return null;
        }
        return activeGoalId;
    }

    private boolean hasCompletedPersonalCurriculum(Learner learner) {
        if (learner == null
                || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            return false;
        }
        PersonalizationPlan plan = buildPersonalizationPlan(learner);
        return plan.valid() && !plan.required();
    }

    /**
     * Chooses the highest visible focus root in the same order used by the
     * cockpit. Canonical top-level roots are preferred so the persisted ID is
     * the ID of the checkbox row the learner sees; synthetic composition roots
     * remain a fallback for views without a visible canonical root.
     */
    private String resolveDefaultProjectedFocusId(
            String curriculumId,
            GoalProjection projection) {
        if (curriculumId == null || curriculumId.isBlank() || projection == null) {
            return null;
        }
        LinkedHashSet<String> candidates = new LinkedHashSet<>();
        if (projection.compositionViewApplied()) {
            candidates.addAll(projection.presentationRootGoalIds());
        }
        candidates.addAll(getVisibleRootFocusGoalIds(projection.visibleGoals()));
        getInitialScopeOptions(curriculumId, projection).stream()
                .map(FrontierGoal::id)
                .forEach(candidates::add);
        // Defensive fallbacks keep Level 3 non-empty for legacy or atomic-only
        // projections that do not publish a structural root option.
        projection.visibleGoals().keySet().stream()
                .filter(projection.targetGoalIds()::contains)
                .forEach(candidates::add);
        return candidates.stream()
                .filter(candidateId -> isProjectedTargetFocus(candidateId, projection))
                .map(candidateId -> declaredFocusId(candidateId, projection))
                .findFirst()
                .orElse(null);
    }

    private List<String> orderVisibleFocusGoalIds(
            Collection<String> goalIds,
            Map<String, LearningGoal> visibleGoals) {
        if (goalIds == null || goalIds.isEmpty() || visibleGoals == null) {
            return Collections.emptyList();
        }
        Map<String, Integer> authoredIndexByGoalId = new LinkedHashMap<>();
        int authoredIndex = 0;
        for (String goalId : visibleGoals.keySet()) {
            authoredIndexByGoalId.put(goalId, authoredIndex++);
        }
        return goalIds.stream()
                .map(visibleGoals::get)
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparingInt(this::goalTreeOrder)
                        .thenComparingInt(goal -> authoredIndexByGoalId.getOrDefault(
                                goal.getId(),
                                Integer.MAX_VALUE))
                        .thenComparing(
                                goal -> goal.getTitle() == null ? "" : goal.getTitle(),
                                String.CASE_INSENSITIVE_ORDER))
                .map(LearningGoal::getId)
                .toList();
    }

    private List<String> ensurePersistedDefaultProjectedFocus(
            Learner learner,
            GoalProjection projection) {
        if (learner == null || projection == null || !hasCompletedPersonalCurriculum(learner)) {
            return Collections.emptyList();
        }

        List<PlannedGoal> storedGoals = plannedGoalRepository
                .findByLearner_SkillpilotId(learner.getSkillpilotId());
        List<String> projectedFocusIds = resolveProjectedTargetFocusIds(
                storedGoals.stream().map(PlannedGoal::getGoalId).toList(),
                projection);
        List<PlannedGoal> invalidGoals = storedGoals.stream()
                .filter(Objects::nonNull)
                .filter(goal -> !isProjectedTargetFocus(goal.getGoalId(), projection))
                .toList();
        boolean changed = normalizeStoredDeclaredFocuses(learner, storedGoals, projection);
        if (!invalidGoals.isEmpty()) {
            plannedGoalRepository.deleteAll(invalidGoals);
            changed = true;
        }

        if (projectedFocusIds.isEmpty()) {
            String defaultFocusId = resolveDefaultProjectedFocusId(
                    learner.getSelectedCurriculum(),
                    projection);
            if (defaultFocusId != null) {
                plannedGoalRepository.save(new PlannedGoal(learner, defaultFocusId));
                projectedFocusIds = List.of(defaultFocusId);
                changed = true;
            }
        }
        if (changed) {
            advanceCoachStateRevision(learner);
            eventPublisher.publishEvent(new LearnerStateChangedEvent(
                    this,
                    learner.getSkillpilotId(),
                    "PLANNED_GOALS_DEFAULTED"));
        }
        return projectedFocusIds;
    }

    private String declaredFocusId(String id, GoalProjection projection) {
        var unit = projection.declaredUnits().focus(id);
        return unit == null ? id : unit.focusId();
    }

    private boolean normalizeStoredDeclaredFocuses(
            Learner learner, List<PlannedGoal> existing, GoalProjection projection) {
        if (projection.declaredUnits().units().isEmpty() || existing == null || existing.isEmpty()) return false;
        List<PlannedGoal> aliases = existing.stream().filter(Objects::nonNull)
                .filter(goal -> !Objects.equals(goal.getGoalId(), declaredFocusId(goal.getGoalId(), projection)))
                .toList();
        if (aliases.isEmpty()) return false;
        Set<String> storedIds = existing.stream().filter(Objects::nonNull).map(PlannedGoal::getGoalId)
                .collect(Collectors.toSet());
        plannedGoalRepository.deleteAll(aliases);
        plannedGoalRepository.saveAll(aliases.stream()
                .map(goal -> declaredFocusId(goal.getGoalId(), projection))
                .distinct().filter(id -> !storedIds.contains(id))
                .map(id -> new PlannedGoal(learner, id)).toList());
        return true;
    }

    private List<String> getStoredPlannedGoals(String skillpilotId) {
        ensureLearnerExists(skillpilotId);
        return plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .map(PlannedGoal::getGoalId)
                .toList();
    }

    @Transactional
    public List<String> setPlannedGoals(String skillpilotId, Set<String> goalIds) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        learner.setPendingUnitEntry(null);
        // A deliberate focus choice ends the completion navigation route, not mastery.
        if (completionRouteOwnsNavigation(learner)) {
            CompletionWorkflowState old = completionWorkflow(learner);
            if (old != null && old.directAssessment() != null) learner.setActiveGoalId(null);
            saveCompletionWorkflow(learner, null);
        }

        Set<String> targetIds = goalIds == null ? Collections.emptySet() : goalIds;
        Set<String> saneTargetIds = targetIds.stream()
                .filter(id -> id != null && !id.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (!saneTargetIds.isEmpty()) {
            assertPersonalizationCompleteForLearning(learner);
        }
        boolean hasLearningProjection = hasCompletedPersonalCurriculum(learner);

        List<PlannedGoal> existing = plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId);
        Set<String> existingIds = existing.stream().map(PlannedGoal::getGoalId).collect(Collectors.toSet());

        if (hasLearningProjection) {
            Map<String, LearningGoal> structuralGoals = getStructuralGoals(learner.getSelectedCurriculum());
            GoalProjection projection = getGoalProjection(
                    learner.getSelectedCurriculum(),
                    learner.getPersonalCurriculum());
            LinkedHashSet<String> mappedTargetIds = new LinkedHashSet<>();
            for (String id : saneTargetIds) {
                var declared = projection.declaredUnits().focus(id);
                String mapped = declared != null ? declared.focusId() : mapGoalIdForVisibleGoals(id, structuralGoals, true);
                if (mapped != null && !mapped.isBlank()) mappedTargetIds.add(declaredFocusId(mapped, projection));
            }
            List<String> invalidTargetIds = mappedTargetIds.stream()
                    .filter(id -> !isProjectedTargetFocus(id, projection))
                    .sorted()
                    .toList();
            if (!invalidTargetIds.isEmpty()) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "Planned goals must be learner-facing targets in the current curriculum projection: "
                                + String.join(", ", invalidTargetIds));
            }
            saneTargetIds = new LinkedHashSet<>(
                    collapseContainedGoalIds(new ArrayList<>(mappedTargetIds), structuralGoals));
            if (saneTargetIds.isEmpty() && hasCompletedPersonalCurriculum(learner)) {
                String defaultFocusId = resolveDefaultProjectedFocusId(
                        learner.getSelectedCurriculum(),
                        projection);
                if (defaultFocusId != null) {
                    saneTargetIds.add(defaultFocusId);
                }
            }
        }
        final Set<String> normalizedTargetIds = saneTargetIds;

        List<PlannedGoal> toDelete = existing.stream()
                .filter(pg -> !normalizedTargetIds.contains(pg.getGoalId()))
                .toList();
        plannedGoalRepository.deleteAll(toDelete);

        List<PlannedGoal> toAdd = normalizedTargetIds.stream()
                .filter(id -> !existingIds.contains(id))
                .map(id -> new PlannedGoal(learner, id))
                .toList();
        plannedGoalRepository.saveAll(toAdd);

        String curriculumId = learner.getSelectedCurriculum();
        if (hasLearningProjection) {
            GoalProjection projection = getGoalProjection(
                    curriculumId,
                    learner.getPersonalCurriculum());
            List<String> newProjectedFocusIds = resolveProjectedTargetFocusIds(
                    new ArrayList<>(normalizedTargetIds),
                    projection);
            String invalidationReason = resolveActiveGoalInvalidationReason(
                    learner,
                    projection,
                    newProjectedFocusIds);
            if (invalidationReason != null) {
                clearPersistedActiveGoal(learner, skillpilotId, invalidationReason);
            }
        } else if (curriculumId != null && !curriculumId.isBlank()
                && learner.getActiveGoalId() != null && !learner.getActiveGoalId().isBlank()) {
            clearPersistedActiveGoal(learner, skillpilotId, "ACTIVE_GOAL_CLEARED_INVALID_VIEW");
        }

        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                skillpilotId,
                "PLANNED_GOALS_UPDATE"));
        return getPlannedGoals(skillpilotId);
    }

    /**
     * Applies a learner focus change and returns the authoritative state after
     * active-goal reconciliation and, when enabled, Autopilot selection.
     */
    @Transactional
    public PlannedGoalsMutationResponse setPlannedGoalsAndGetState(
            String skillpilotId,
            Set<String> goalIds) {
        List<String> plannedGoalIds = setPlannedGoals(skillpilotId, goalIds);
        UnifiedLearnerStateResponse state = getLearnerState(skillpilotId);
        return new PlannedGoalsMutationResponse(plannedGoalIds, state);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode) {
        setPreferences(skillpilotId, learningStrategy, autoPilot, strictMode, null, null);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode,
            Boolean showGoalVisualizationsInChat) {
        setPreferences(
                skillpilotId,
                learningStrategy,
                autoPilot,
                strictMode,
                showGoalVisualizationsInChat,
                null);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode,
            Boolean showGoalVisualizationsInChat, Boolean followLearningPlans) {
        setPreferences(
                skillpilotId,
                learningStrategy,
                autoPilot,
                strictMode,
                showGoalVisualizationsInChat,
                followLearningPlans,
                null);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode,
            Boolean showGoalVisualizationsInChat, Boolean followLearningPlans,
            com.skillpilot.backend.service.learningplan.PeriodBasis learningPlanPeriodBasis) {
        setPreferences(skillpilotId, learningStrategy, autoPilot, strictMode,
                showGoalVisualizationsInChat, followLearningPlans, learningPlanPeriodBasis, null);
    }

    @Transactional
    public void setPreferences(String skillpilotId, String learningStrategy, Boolean autoPilot, Boolean strictMode,
            Boolean showGoalVisualizationsInChat, Boolean followLearningPlans,
            com.skillpilot.backend.service.learningplan.PeriodBasis learningPlanPeriodBasis,
            Boolean learningPlanCountOnlyExplicitGoals) {
        if (learningPlanCountOnlyExplicitGoals != null && CompletionCallContext.current() != null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN,
                    "The plan counting preference is changed in the cockpit.");
        }
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        boolean coachStateChanged = false;
        if (learningStrategy != null) {
            coachStateChanged |= !Objects.equals(learner.getLearningStrategy(), learningStrategy);
            learner.setLearningStrategy(learningStrategy);
        }
        if (autoPilot != null) {
            coachStateChanged |= !Objects.equals(learner.getAutoPilot(), autoPilot);
            learner.setAutoPilot(autoPilot);
        }
        if (strictMode != null) {
            coachStateChanged |= !Objects.equals(learner.getStrictMode(), strictMode);
            learner.setStrictMode(strictMode);
        }
        if (showGoalVisualizationsInChat != null) {
            coachStateChanged |= !Objects.equals(
                    learner.getShowGoalVisualizationsInChat(),
                    showGoalVisualizationsInChat);
            learner.setShowGoalVisualizationsInChat(showGoalVisualizationsInChat);
        }
        if (followLearningPlans != null) {
            coachStateChanged |= !Objects.equals(
                    learner.getFollowLearningPlans(),
                    followLearningPlans);
            learner.setFollowLearningPlans(followLearningPlans);
        }
        if (learningPlanPeriodBasis != null) {
            coachStateChanged |= !Objects.equals(
                    learner.getLearningPlanPeriodBasis(),
                    learningPlanPeriodBasis);
            learner.setLearningPlanPeriodBasis(learningPlanPeriodBasis);
        }
        if (learningPlanCountOnlyExplicitGoals != null) {
            coachStateChanged |= !Objects.equals(
                    learner.getLearningPlanCountOnlyExplicitGoals(), learningPlanCountOnlyExplicitGoals);
            learner.setLearningPlanCountOnlyExplicitGoals(learningPlanCountOnlyExplicitGoals);
        }
        if (coachStateChanged) {
            advanceCoachStateRevision(learner);
            eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "PREFERENCES_CHANGED"));
        }
    }

    @Transactional(readOnly = true)
    public boolean showGoalVisualizationsInChat(String skillpilotId) {
        return !Boolean.FALSE.equals(getLearner(skillpilotId).getShowGoalVisualizationsInChat());
    }

    @Transactional(readOnly = true)
    public Learner getLearner(String skillpilotId) {
        return learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
    }

    @Transactional(readOnly = true)
    public void assertWritableLearningSession(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        assertWritableLearningSession(learner);
    }

    private void assertWritableLearningSession(Learner learner) {
        CompletionCallContext call = CompletionCallContext.current();
        if (completionRouteOwnsNavigation(learner) && call != null && !call.supported()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "This coach session does not support the active completion route. Start a fresh supported session or leave the route in the cockpit.");
        }
        if (!isReadOnlyCompatibilitySession(learner)) {
            return;
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "This retired compatibility learner session is read-only.");
    }

    @Transactional(readOnly = true)
    public void assertActiveLearnerRouteAccess(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        if (!isReadOnlyCompatibilitySession(learner)) {
            return;
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "This retired compatibility-only curriculum is not available as an active learner route.");
    }

    @Transactional(readOnly = true)
    public List<SkillLandscape> getLearnerLandscapeClosure(String skillpilotId, String landscapeId, String lang) {
        Learner learner = getLearner(skillpilotId);
        if (!Objects.equals(landscapeId, learner.getSelectedCurriculum())) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "Personal learning scope must use the learner's selected curriculum");
        }
        GoalProjection projection = getGoalProjection(landscapeId, learner.getPersonalCurriculum());
        Map<String, LearningGoal> visibleGoals = projection.visibleGoals();
        List<SkillLandscape> localizedClosure = landscapeService.getClosure(landscapeId, lang);
        LinkedHashMap<String, SkillLandscape> sources = new LinkedHashMap<>();
        if (localizedClosure != null) {
            for (SkillLandscape landscape : localizedClosure) sources.put(landscape.getLandscapeId(), landscape);
        }
        Set<String> knownIds = sources.values().stream().filter(l -> l.getGoals() != null)
                .flatMap(l -> l.getGoals().stream()).map(LearningGoal::getId).collect(Collectors.toSet());
        // A prerequisite can belong to an unselected subject. Import its owner
        // for localization, then export only the actually needed canonical rows.
        for (String id : visibleGoals.keySet()) {
            if (knownIds.contains(id)) continue;
            String owner = landscapeService.getLandscapeIdForGoal(id);
            SkillLandscape source = owner == null ? null : landscapeService.getById(owner);
            if (source == null) {
                throw new CompletionCompilationException("MISSING_REFERENCE", "No canonical owner for required goal " + id);
            }
            List<SkillLandscape> localizedOwner = landscapeService.getClosure(owner, lang);
            if (localizedOwner != null) {
                source = localizedOwner.stream().filter(l -> owner.equals(l.getLandscapeId())).findFirst().orElse(source);
            }
            sources.put(owner, source);
            if (source.getGoals() != null) source.getGoals().forEach(g -> knownIds.add(g.getId()));
        }

        List<SkillLandscape> scopedClosure = new ArrayList<>();
        Set<String> deliveredTargets = new LinkedHashSet<>();
        for (SkillLandscape landscape : sources.values()) {
            if (landscape.getGoals() == null) continue;
            List<LearningGoal> filteredGoals = landscape.getGoals().stream()
                    .filter(goal -> visibleGoals.containsKey(goal.getId()))
                    .map(goal -> cloneScopedGoal(goal, visibleGoals)).toList();
            if (filteredGoals.isEmpty()) continue;
            SkillLandscape scopedLandscape = objectMapper.convertValue(landscape, SkillLandscape.class);
            scopedLandscape.setGoals(filteredGoals);
            if (scopedLandscape.getGoalPlacements() != null) {
                scopedLandscape.setGoalPlacements(scopedLandscape.getGoalPlacements().stream()
                        .filter(placement -> placement != null && visibleGoals.containsKey(placement.getGoalId())).toList());
            }
            if (projection.learningScope() != null) {
                PersonalCurriculumLearningScope learning = projection.learningScope();
                Set<String> owned = filteredGoals.stream().map(LearningGoal::getId).collect(Collectors.toSet());
                List<String> targets = learning.learningAtomicGoalIds().stream().filter(owned::contains).toList();
                deliveredTargets.addAll(targets);
                Map<String, List<String>> paths = new LinkedHashMap<>();
                learning.requiredByPaths().forEach((id, path) -> { if (owned.contains(id)) paths.put(id, path); });
                scopedLandscape.setPersonalCurriculumProjection(new SkillLandscape.PersonalCurriculumProjection(
                        AUTOMATIC_COMPLETION_REVISION, landscapeId, completionScopeDigest(learner),
                        learning.seedAtomicGoalIds().stream().filter(owned::contains).toList(), targets, paths));
            }
            scopedClosure.add(scopedLandscape);
        }
        if (projection.learningScope() != null
                && !deliveredTargets.equals(projection.learningScope().learningAtomicGoalIds())) {
            throw new CompletionCompilationException("MISSING_REFERENCE", "Learner export lost required learning targets");
        }
        return scopedClosure;
    }

    private boolean isReadOnlyCompatibilitySession(Learner learner) {
        if (learner == null) {
            return false;
        }
        String curriculumId = learner.getSelectedCurriculum();
        return curriculumId != null
                && !curriculumId.isBlank()
                && landscapeService.isCompatibilityOnlyLandscape(curriculumId);
    }

    @Transactional
    public void setCurriculum(String skillpilotId, String curriculumId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        applyCurriculumSelection(learner, curriculumId);
    }

    @Transactional
    public void setCurriculumFromPublicCatalog(String skillpilotId, String curriculumId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        assertWritableLearningSession(learner);

        String effectiveCurriculumId = curriculumId == null ? null : curriculumId.trim();
        if (effectiveCurriculumId == null || effectiveCurriculumId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "curriculumId must not be empty.");
        }
        long publishedMatches = getAvailableBaseCurricula(false).stream()
                .filter(Objects::nonNull)
                .filter(summary -> effectiveCurriculumId.equals(summary.getCurriculumId()))
                .limit(2)
                .count();
        if (publishedMatches != 1) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected curriculum is no longer available in the current public catalog.");
        }

        applyCurriculumSelection(learner, effectiveCurriculumId);
    }

    private void applyCurriculumSelection(Learner learner, String curriculumId) {
        String effectiveCurriculumId = curriculumId == null ? null : curriculumId.trim();
        if (effectiveCurriculumId == null || effectiveCurriculumId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "curriculumId must not be empty.");
        }
        if (landscapeService.isCompatibilityOnlyLandscape(effectiveCurriculumId)) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    buildCompatibilityOnlyRetirementMessage(effectiveCurriculumId));
        }
        if (landscapeService.getById(effectiveCurriculumId) == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid curriculum ID: " + effectiveCurriculumId);
        }
        boolean curriculumChanged = !Objects.equals(learner.getSelectedCurriculum(), effectiveCurriculumId);
        learner.setSelectedCurriculum(effectiveCurriculumId);
        if (curriculumChanged) {
            saveCompletionWorkflow(learner, null);
            // Level 2 and Level 3a belong to the selected root. Level 4 mastery
            // remains global and is deliberately not touched here.
            learner.setPersonalCurriculum(null);
            plannedGoalRepository.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
            learner.setActiveGoalId(null);
            if (hasCompletedPersonalCurriculum(learner)) {
                GoalProjection projection = getGoalProjection(
                        effectiveCurriculumId,
                        learner.getPersonalCurriculum());
                String defaultFocusId = resolveDefaultProjectedFocusId(
                        effectiveCurriculumId,
                        projection);
                if (defaultFocusId != null) {
                    plannedGoalRepository.save(new PlannedGoal(learner, defaultFocusId));
                }
            }
        }
        learner.setLearningState(LearningState.FRONTIER);
        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                learner.getSkillpilotId(),
                "CURRICULUM_UPDATE"));
    }

    @Transactional
    public void setPersonalCurriculum(String skillpilotId, Map<String, Object> config, List<String> goalIds,
            List<String> filters) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        Map<String, Object> submitted = normalizePersonalCurriculumPayload(config);
        if (submitted.containsKey(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Personalization flow state is server-managed and cannot be written as raw config.");
        }

        Map<String, Object> finalConfig;
        try {
            finalConfig = SubjectExtensionScope.mergeCockpitSettings(
                    mutablePersonalCurriculumPayload(learner.getPersonalCurriculum()), submitted);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage());
        }
        applyPersonalCurriculumMutation(learner, finalConfig, goalIds, filters);
    }

    /**
     * Incrementally updates coach-provided personalization while preserving the
     * learner's existing cockpit configuration. The mutation and the returned
     * state projection intentionally share one transaction so a projection
     * failure rolls the mutation back.
     */
    @Transactional
    public UnifiedLearnerStateResponse patchPersonalCurriculum(
            String skillpilotId,
            Map<String, Object> config,
            List<String> goalIds,
            List<String> filters) {
        return patchPersonalCurriculum(skillpilotId, config, goalIds, filters, null);
    }

    @Transactional
    public UnifiedLearnerStateResponse patchPersonalCurriculum(
            String skillpilotId,
            Map<String, Object> config,
            List<String> goalIds,
            List<String> filters,
            String optionId) {
        if (config != null && !config.isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Coach personalization accepts only current option references; raw config is not supported");
        }

        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);

        PersonalizationPlan currentPlan = buildPersonalizationPlan(learner);
        PersonalizationPlan.Option selectedOption =
                requireCurrentPersonalizationOption(
                        currentPlan,
                        optionId,
                        goalIds,
                        filters);
        applyCurrentPersonalizationOption(learner, currentPlan, selectedOption);
        return getLearnerState(skillpilotId, null);
    }

    private void applyCurrentPersonalizationOption(
            Learner learner, PersonalizationPlan currentPlan, PersonalizationPlan.Option option) {
        Map<String, Object> finalConfig = mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        preparePersonalizationMutation(learner, finalConfig, currentPlan);
        applyCurrentPersonalizationOption(learner, finalConfig, option);
    }

    /**
     * Explicitly restarts the authored personalization flow of the learner's
     * selected base curriculum.
     *
     * <p>The reset is deliberately scoped to the selected root's landscape
     * closure. Unrelated curriculum configuration, stable goal IDs and mastery
     * remain untouched. Flow progress is removed only when it belongs to the
     * same selected root.</p>
     */
    @Transactional
    public PersonalizationPlan restartPersonalization(String skillpilotId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        String rootLandscapeId = learner.getSelectedCurriculum();
        if (rootLandscapeId == null || rootLandscapeId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected for personalization.");
        }

        SkillLandscape rootLandscape = landscapeService.getById(rootLandscapeId);
        if (rootLandscape == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected personalization curriculum is no longer available.");
        }
        if (rootLandscape.getPersonalizationFlow() == null) {
            return PersonalizationPlan.complete(List.of());
        }

        PersonalizationPlan cleanPlan = CurriculumPersonalizationPlanner.plan(
                rootLandscapeId,
                landscapeService::getById,
                personalizationOfferings,
                Map.of());
        if (!cleanPlan.valid()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The authored personalization flow is invalid.");
        }

        Map<String, Object> personalCurriculum =
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        LinkedHashSet<String> closureLandscapeIds = new LinkedHashSet<>();
        List<SkillLandscape> closure = landscapeService.getClosure(rootLandscapeId);
        if (closure != null) {
            closure.stream()
                    .filter(Objects::nonNull)
                    .map(SkillLandscape::getLandscapeId)
                    .filter(Objects::nonNull)
                    .filter(id -> !id.isBlank())
                    .forEach(closureLandscapeIds::add);
        }
        closureLandscapeIds.add(rootLandscapeId);
        closureLandscapeIds.forEach(personalCurriculum::remove);
        personalCurriculum.remove(STAGE_SCOPE_SEK1_ID);
        personalCurriculum.remove(STAGE_SCOPE_SEK2_ID);

        Object rawFlowState =
                personalCurriculum.get(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY);
        if (rawFlowState instanceof Map<?, ?> flowState
                && rootLandscapeId.equals(
                        flowState.get(CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY))) {
            personalCurriculum.remove(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY);
        }

        /*
         * An active teaching goal cannot remain active while Level 2 is
         * unresolved. Stable goal IDs are never rewritten, but the current
         * Level-3 focus must not retain goals outside the newly projected
         * learner-facing target scope.
         */
        learner.setActiveGoalId(null);
        learner.setLearningState(LearningState.FRONTIER);
        revalidatePlannedGoalsForProjectedScope(learner, personalCurriculum);
        persistPersonalCurriculum(learner, personalCurriculum);
        return buildPersonalizationPlan(learner);
    }

    /**
     * Reopens a legacy-migrated flow without discarding any existing Level-2
     * choice.
     *
     * <p>The migration shortcut is removed only for the learner's current
     * authored root. The regular planner then either exposes the first missing
     * decision or reconstructs editable completed decisions from the retained
     * configuration.</p>
     */
    @Transactional
    public PersonalizationPlan reopenMigratedPersonalization(String skillpilotId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);
        String rootLandscapeId = learner.getSelectedCurriculum();
        if (rootLandscapeId == null || rootLandscapeId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected for personalization.");
        }
        SkillLandscape rootLandscape = landscapeService.getById(rootLandscapeId);
        if (rootLandscape == null
                || rootLandscape.getPersonalizationFlow() == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected personalization flow is no longer available.");
        }

        Map<String, Object> personalCurriculum =
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        if (!reopenStoredPersonalization(rootLandscapeId, personalCurriculum)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The migrated personalization flow is already open; reload the current context.");
        }
        List<CurriculumPersonalizationPlanner.StoredSelection> storedSelections =
                CurriculumPersonalizationPlanner.storedSelections(
                        rootLandscape.getPersonalizationFlow(),
                        landscapeService::getById,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(
                                        personalCurriculum)));
        List<PersonalizationPlan.Option> residualValues = storedSelections.stream()
                .filter(stored -> !stored.activeAndAuthored())
                .map(this::storedSelectionOption)
                .toList();
        if (!residualValues.isEmpty()) {
            List<PersonalizationPlan.Option> retainedValues =
                    storedSelections.stream()
                            .filter(
                                    CurriculumPersonalizationPlanner.StoredSelection
                                            ::activeAndAuthored)
                            .map(this::storedSelectionOption)
                            .toList();
            clearReopenedPersonalizationValues(
                    learner,
                    personalCurriculum,
                    residualValues,
                    retainedValues);
        }

        PersonalizationPlan reopenedPlan = openAvailableExtensionChoices(rootLandscapeId, personalCurriculum);
        if (!reopenedPlan.valid()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The authored personalization flow is invalid.");
        }

        revalidatePlannedGoalsForProjectedScope(learner, personalCurriculum);
        if (learner.getActiveGoalId() == null || learner.getActiveGoalId().isBlank()) {
            learner.setLearningState(LearningState.FRONTIER);
        }
        persistPersonalCurriculum(learner, personalCurriculum);
        return decoratePersonalizationPlan(
                reopenedPlan,
                rootLandscapeId,
                personalCurriculum);
    }

    /**
     * Reopens one completed or partially selected authored decision without
     * restarting the entire personalization flow.
     *
     * <p>The opaque rewind reference is resolved against the learner's current
     * plan while the learner row is locked. The selected values of that
     * decision and every authored dependent decision are removed field by
     * field. Independent choices, unrelated curriculum configuration, stable
     * goal IDs and mastery remain untouched.</p>
     */
    @Transactional
    public PersonalizationPlan rewindPersonalization(
            String skillpilotId,
            String rewindId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);
        String rootLandscapeId = learner.getSelectedCurriculum();
        if (rootLandscapeId == null || rootLandscapeId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected for personalization.");
        }

        PersonalizationPlan currentPlan = buildPersonalizationPlan(learner);
        if (!currentPlan.valid()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The authored personalization flow is invalid.");
        }
        SkillLandscape rootLandscape = landscapeService.getById(rootLandscapeId);
        if (rootLandscape == null || rootLandscape.getPersonalizationFlow() == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected personalization flow is no longer available.");
        }
        String submittedRewindId = rewindId == null ? null : rewindId.trim();
        List<PersonalizationPlan.CompletedDecision> matches =
                currentPlan.completedDecisions().stream()
                        .filter(Objects::nonNull)
                        .filter(decision -> submittedRewindId != null
                                && submittedRewindId.equals(decision.rewindId()))
                        .toList();
        boolean reopensCurrentDecision = currentPlan.required()
                && submittedRewindId != null
                && submittedRewindId.equals(currentPlan.currentRewindId())
                && !currentPlan.currentSelectedOptions().isEmpty();
        if ((!reopensCurrentDecision && matches.size() != 1)
                || (reopensCurrentDecision && !matches.isEmpty())) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The personalization rewind reference is stale or unknown; reload the current context.");
        }

        PersonalizationPlan.CompletedDecision target =
                reopensCurrentDecision ? null : matches.getFirst();
        String targetStageId =
                reopensCurrentDecision ? currentPlan.stageId() : target.stageId();
        String targetGroupId =
                reopensCurrentDecision ? currentPlan.groupId() : target.groupId();
        String targetGroupInstanceId = reopensCurrentDecision
                ? currentPlan.groupInstanceId()
                : target.groupInstanceId();
        Set<String> affectedGroupIds =
                CurriculumPersonalizationPlanner.dependentGroupIds(
                        rootLandscape.getPersonalizationFlow(),
                        targetGroupId);
        if (!affectedGroupIds.contains(targetGroupId)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected personalization decision can no longer be reopened.");
        }

        List<PersonalizationPlan.CompletedDecision> reopenedDecisions =
                currentPlan.completedDecisions().stream()
                        .filter(Objects::nonNull)
                        .filter(decision -> submittedRewindId.equals(decision.rewindId())
                                || (!Objects.equals(targetGroupId, decision.groupId())
                                        && affectedGroupIds.contains(decision.groupId())))
                        .toList();
        Set<String> reopenedDecisionIds = reopenedDecisions.stream()
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<PersonalizationPlan.CompletedDecision> retainedDecisions =
                currentPlan.completedDecisions().stream()
                        .filter(Objects::nonNull)
                        .filter(decision -> !reopenedDecisionIds.contains(decision.rewindId()))
                        .toList();
        boolean reopensCurrentSelection = reopensCurrentDecision
                || (currentPlan.groupId() != null
                        && !Objects.equals(targetGroupId, currentPlan.groupId())
                        && affectedGroupIds.contains(currentPlan.groupId()));

        Map<String, Object> personalCurriculum =
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        List<PersonalizationPlan.Option> reopenedOptions = new ArrayList<>();
        reopenedDecisions.stream()
                .filter(Objects::nonNull)
                .flatMap(decision -> decision.selectedOptions().stream())
                .filter(Objects::nonNull)
                .forEach(reopenedOptions::add);
        if (reopensCurrentSelection) {
            currentPlan.currentSelectedOptions().stream()
                    .filter(Objects::nonNull)
                    .forEach(reopenedOptions::add);
        }
        List<PersonalizationPlan.Option> retainedOptions = new ArrayList<>();
        retainedDecisions.stream()
                .flatMap(decision -> decision.selectedOptions().stream())
                .filter(Objects::nonNull)
                .forEach(retainedOptions::add);
        if (!reopensCurrentSelection) {
            currentPlan.currentSelectedOptions().stream()
                    .filter(Objects::nonNull)
                    .forEach(retainedOptions::add);
        }

        List<CurriculumPersonalizationPlanner.StoredSelection> storedSelections =
                CurriculumPersonalizationPlanner.storedSelections(
                        rootLandscape.getPersonalizationFlow(),
                        landscapeService::getById,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(personalCurriculum)));
        for (CurriculumPersonalizationPlanner.StoredSelection stored : storedSelections) {
            PersonalizationPlan.Option storedOption = new PersonalizationPlan.Option(
                    null,
                    stored.stageId(),
                    stored.groupId(),
                    stored.groupInstanceId(),
                    stored.landscapeId(),
                    personalizationLandscapeLabel(stored.landscapeId()),
                    stored.filterId(),
                    personalizationFilterLabel(
                            stored.landscapeId(),
                            stored.filterId()),
                    stored.scopeKey(),
                    stored.scopeValue(),
                    stored.scopeLabel(),
                    stored.kind());
            boolean targetsExactInstance =
                    Objects.equals(targetGroupId, stored.groupId())
                            && Objects.equals(targetGroupInstanceId, stored.groupInstanceId());
            boolean belongsToDependentGroup =
                    !Objects.equals(targetGroupId, stored.groupId())
                            && affectedGroupIds.contains(stored.groupId());
            if (!stored.activeAndAuthored()
                    || targetsExactInstance
                    || belongsToDependentGroup) {
                reopenedOptions.add(storedOption);
            } else {
                retainedOptions.add(storedOption);
            }
        }

        clearReopenedPersonalizationValues(
                learner,
                personalCurriculum,
                reopenedOptions,
                retainedOptions);
        List<PersonalizationPlan.Option> validCompletionOptions =
                CurriculumPersonalizationPlanner.validCompletionOptions(
                        rootLandscapeId,
                        landscapeService::getById,
                        personalizationOfferings,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(
                                        personalCurriculum)));
        Set<String> retainedCompletionIds = validCompletionOptions.stream()
                .filter(option -> {
                    boolean targetsExactInstance =
                            Objects.equals(targetGroupId, option.groupId())
                                    && Objects.equals(
                                            targetGroupInstanceId,
                                            option.groupInstanceId());
                    boolean belongsToDependentGroup =
                            !Objects.equals(targetGroupId, option.groupId())
                                    && affectedGroupIds.contains(
                                            option.groupId());
                    return !targetsExactInstance
                            && !belongsToDependentGroup;
                })
                .map(PersonalizationPlan.Option::optionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        retainPersonalizationCompletionIds(
                personalCurriculum,
                rootLandscapeId,
                retainedCompletionIds);

        PersonalizationPlan rewoundPlan = openAvailableExtensionChoices(rootLandscapeId, personalCurriculum);
        if (!rewoundPlan.valid()
                || !rewoundPlan.required()
                || !Objects.equals(targetStageId, rewoundPlan.stageId())
                || !Objects.equals(targetGroupId, rewoundPlan.groupId())
                || !Objects.equals(targetGroupInstanceId, rewoundPlan.groupInstanceId())) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The selected personalization decision can no longer be reopened.");
        }

        learner.setLearningState(LearningState.FRONTIER);
        revalidatePlannedGoalsForProjectedScope(learner, personalCurriculum);
        persistPersonalCurriculum(learner, personalCurriculum);
        return decoratePersonalizationPlan(
                rewoundPlan,
                rootLandscapeId,
                personalCurriculum);
    }

    @SuppressWarnings("unchecked")
    private void clearReopenedPersonalizationValues(
            Learner learner,
            Map<String, Object> personalCurriculum,
            List<PersonalizationPlan.Option> reopenedOptions,
            List<PersonalizationPlan.Option> retainedOptions) {
        LinkedHashSet<String> affectedLandscapeIds = reopenedOptions.stream()
                .map(PersonalizationPlan.Option::landscapeId)
                .filter(Objects::nonNull)
                .filter(id -> !id.isBlank())
                .collect(Collectors.toCollection(LinkedHashSet::new));
        boolean reopensStage = reopenedOptions.stream()
                .anyMatch(option -> "stage".equals(option.scopeKey()));

        for (PersonalizationPlan.Option option : reopenedOptions) {
            if (option.landscapeId() == null || option.landscapeId().isBlank()) {
                continue;
            }
            Object rawSettings = personalCurriculum.get(option.landscapeId());
            if (!(rawSettings instanceof Map<?, ?> existingSettings)) {
                continue;
            }
            Map<String, Object> settings =
                    new LinkedHashMap<>((Map<String, Object>) existingSettings);
            settings.remove("selected");
            if (option.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE
                    && option.scopeKey() != null
                    && !option.scopeKey().isBlank()) {
                settings.remove(option.scopeKey());
            } else if (option.kind() == PersonalizationPlan.OptionKind.VALUE) {
                if (option.filterId() != null && !option.filterId().isBlank()) {
                    settings.remove("filterId");
                    settings.remove("durationModel");
                } else {
                    /*
                     * A landscape selection owns the downstream profile and
                     * compatibility fields on that landscape as well. This
                     * also removes stale profile data from a partially
                     * completed legacy flow before the subject is selected
                     * again.
                     */
                    settings.remove("filterId");
                    settings.remove("durationModel");
                    settings.remove("stage");
                }
            }
            if (settings.isEmpty()) {
                personalCurriculum.remove(option.landscapeId());
            } else {
                personalCurriculum.put(option.landscapeId(), settings);
            }
        }

        /*
         * Restore retained landscape/filter ownership first and explicit
         * scope values second. A filter write removes the legacy
         * durationModel alias, but it must not erase an independently authored
         * durationModel scope merely because that scope appeared earlier in
         * the flow.
         */
        for (PersonalizationPlan.Option option : retainedOptions) {
            if (option == null
                    || option.landscapeId() == null
                    || option.landscapeId().isBlank()
                    || !affectedLandscapeIds.contains(option.landscapeId())) {
                continue;
            }
            Object rawSettings = personalCurriculum.get(option.landscapeId());
            Map<String, Object> settings = rawSettings instanceof Map<?, ?> existingSettings
                    ? new LinkedHashMap<>((Map<String, Object>) existingSettings)
                    : new LinkedHashMap<>();
            settings.put("selected", true);
            if (option.kind() == PersonalizationPlan.OptionKind.VALUE
                    && option.filterId() != null
                    && !option.filterId().isBlank()) {
                settings.put("filterId", option.filterId());
                settings.remove("durationModel");
            }
            personalCurriculum.put(option.landscapeId(), settings);
        }
        for (PersonalizationPlan.Option option : retainedOptions) {
            if (option == null
                    || option.kind() != PersonalizationPlan.OptionKind.SCOPE_VALUE
                    || option.landscapeId() == null
                    || option.landscapeId().isBlank()
                    || !affectedLandscapeIds.contains(option.landscapeId())
                    || option.scopeKey() == null
                    || option.scopeKey().isBlank()
                    || option.scopeValue() == null
                    || option.scopeValue().isBlank()) {
                continue;
            }
            Object rawSettings = personalCurriculum.get(option.landscapeId());
            Map<String, Object> settings = rawSettings instanceof Map<?, ?> existingSettings
                    ? new LinkedHashMap<>((Map<String, Object>) existingSettings)
                    : new LinkedHashMap<>();
            settings.put("selected", true);
            settings.put(option.scopeKey(), storedScopeValue(option));
            personalCurriculum.put(option.landscapeId(), settings);
        }

        if (reopensStage) {
            personalCurriculum.remove(STAGE_SCOPE_SEK1_ID);
            personalCurriculum.remove(STAGE_SCOPE_SEK2_ID);
            retainedOptions.stream()
                    .filter(option -> "stage".equals(option.scopeKey()))
                    .findFirst()
                    .ifPresent(option ->
                            synchronizeCanonicalStageScope(learner, personalCurriculum, option));
        }
    }

    @SuppressWarnings("unchecked")
    private void retainPersonalizationCompletionIds(
            Map<String, Object> personalCurriculum,
            String rootLandscapeId,
            Set<String> retainedCompletionIds) {
        Object rawFlowState =
                personalCurriculum.get(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY);
        if (!(rawFlowState instanceof Map<?, ?> existingFlowState)
                || !rootLandscapeId.equals(existingFlowState.get(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY))) {
            return;
        }
        Map<String, Object> flowState =
                new LinkedHashMap<>((Map<String, Object>) existingFlowState);
        Object rawCompletedIds =
                flowState.get(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY);
        if (rawCompletedIds instanceof List<?> completedIds) {
            List<String> remainingCompletionIds = completedIds.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .filter(retainedCompletionIds::contains)
                    .toList();
            flowState.put(
                    CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                    remainingCompletionIds);
        }
        personalCurriculum.put(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                flowState);
    }

    /**
     * Revalidates a coach selection against the current metadata-derived stage
     * while the learner row is locked by {@link #patchPersonalCurriculum}.
     *
     * <p>This service-level check is authoritative. Provider adapters must pass
     * the opaque option ID unchanged and must not resolve labels. The check
     * prevents stale, replayed, ambiguous, cross-curriculum and parallel
     * mutations from changing the learner configuration.</p>
     */
    private PersonalizationPlan.Option requireCurrentPersonalizationOption(
            PersonalizationPlan currentPlan,
            String submittedOptionId,
            List<String> submittedGoalIds,
            List<String> submittedFilterIds) {
        if (currentPlan == null || !currentPlan.valid()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The authored personalization flow is invalid");
        }
        if (!currentPlan.required() || currentPlan.options().isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Personalization is complete or the submitted option is no longer current");
        }

        if (submittedOptionId != null && !submittedOptionId.isBlank()) {
            List<PersonalizationPlan.Option> matches = currentPlan.options().stream()
                    .filter(Objects::nonNull)
                    .filter(option -> submittedOptionId.trim().equals(option.optionId()))
                    .toList();
            if (matches.size() != 1) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "The personalization option is stale or unknown; reload the current context");
            }
            return matches.getFirst();
        }

        // Legacy compatibility path for already deployed adapters. Only exact
        // landscape IDs are accepted; competence-goal aliases are deliberately
        // forbidden because graph structure is not a personalization protocol.
        Set<String> submittedLandscapeIds = new LinkedHashSet<>();
        for (String reference : normalizedReferences(submittedGoalIds)) {
            SkillLandscape landscape = landscapeService.getById(reference);
            if (landscape != null) {
                submittedLandscapeIds.add(landscape.getLandscapeId());
                continue;
            }
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unknown personalization landscape reference");
        }
        if (submittedLandscapeIds.size() > 1) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A personalization option must target exactly one landscape");
        }

        List<String> submittedFilters = normalizedReferences(submittedFilterIds);
        if (submittedLandscapeIds.isEmpty() && submittedFilters.isEmpty()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A current personalization option is required");
        }

        List<PersonalizationPlan.Option> matches = currentPlan.options().stream()
                .filter(Objects::nonNull)
                .filter(option -> submittedLandscapeIds.isEmpty()
                        || submittedLandscapeIds.contains(option.landscapeId()))
                .filter(option -> {
                    if (submittedFilters.isEmpty()) {
                        return option.filterId() == null || option.filterId().isBlank();
                    }
                    return option.filterId() != null
                            && submittedFilters.stream()
                                    .allMatch(filter -> option.filterId().equalsIgnoreCase(filter));
                })
                .toList();
        if (matches.size() != 1) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The personalization option is stale, unknown or ambiguous; reload the current context");
        }
        return matches.getFirst();
    }

    /**
     * Reconciles sparse later selections before one current authored option is
     * applied.
     *
     * <p>Ordinary forward progress has no later values yet. Legacy-migrated
     * configurations can, however, already contain subjects and profiles
     * behind a newly introduced missing decision. Values owned by explicit
     * downstream dependencies are cleared so they are asked again under the
     * new scope; later independent values remain. Persisted values in the
     * current group that are no longer among its resolved options are removed
     * as well, while valid partial selections and completed dynamic instances
     * stay intact.</p>
     */
    private void preparePersonalizationMutation(
            Learner learner,
            Map<String, Object> personalCurriculum,
            PersonalizationPlan currentPlan) {
        if (learner == null
                || personalCurriculum == null
                || currentPlan == null
                || !currentPlan.valid()
                || !currentPlan.required()
                || currentPlan.groupId() == null
                || currentPlan.groupId().isBlank()) {
            return;
        }
        String rootLandscapeId = learner.getSelectedCurriculum();
        SkillLandscape rootLandscape =
                rootLandscapeId == null
                        ? null
                        : landscapeService.getById(rootLandscapeId);
        if (rootLandscape == null
                || rootLandscape.getPersonalizationFlow() == null) {
            return;
        }

        Set<String> affectedGroupIds =
                CurriculumPersonalizationPlanner.dependentGroupIds(
                        rootLandscape.getPersonalizationFlow(),
                        currentPlan.groupId());
        Set<String> strictDependentGroupIds = affectedGroupIds.stream()
                .filter(groupId -> !currentPlan.groupId().equals(groupId))
                .collect(Collectors.toSet());
        List<PersonalizationPlan.Option> visibleSelections =
                java.util.stream.Stream.concat(
                                currentPlan.completedDecisions().stream()
                                        .filter(Objects::nonNull)
                                        .flatMap(decision ->
                                                decision.selectedOptions()
                                                        .stream()),
                                currentPlan.currentSelectedOptions().stream())
                        .filter(Objects::nonNull)
                        .toList();

        List<CurriculumPersonalizationPlanner.StoredSelection> storedSelections =
                CurriculumPersonalizationPlanner.storedSelections(
                        rootLandscape.getPersonalizationFlow(),
                        landscapeService::getById,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(
                                        personalCurriculum)));
        List<PersonalizationPlan.Option> valuesToClear = new ArrayList<>();
        List<PersonalizationPlan.Option> valuesToRetain = new ArrayList<>();
        for (CurriculumPersonalizationPlanner.StoredSelection stored :
                storedSelections) {
            PersonalizationPlan.Option storedOption =
                    storedSelectionOption(stored);
            boolean isStrictDependent =
                    strictDependentGroupIds.contains(stored.groupId());
            boolean isUnresolvedCurrentValue =
                    currentPlan.groupId().equals(stored.groupId())
                            && Objects.equals(
                                    currentPlan.groupInstanceId(),
                                    stored.groupInstanceId())
                            && visibleSelections.stream().noneMatch(option ->
                                    sameStoredSelection(stored, option));
            if (!stored.activeAndAuthored()
                    || isStrictDependent
                    || isUnresolvedCurrentValue) {
                valuesToClear.add(storedOption);
            } else {
                valuesToRetain.add(storedOption);
            }
        }
        if (!valuesToClear.isEmpty()) {
            clearReopenedPersonalizationValues(
                    learner,
                    personalCurriculum,
                    valuesToClear,
                    valuesToRetain);
        }

        List<PersonalizationPlan.Option> validCompletions =
                CurriculumPersonalizationPlanner.validCompletionOptions(
                        rootLandscapeId,
                        landscapeService::getById,
                        personalizationOfferings,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(
                                        personalCurriculum)));
        Set<String> retainedCompletionIds = validCompletions.stream()
                .filter(option -> !strictDependentGroupIds.contains(
                        option.groupId()))
                .map(PersonalizationPlan.Option::optionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        retainPersonalizationCompletionIds(
                personalCurriculum,
                rootLandscapeId,
                retainedCompletionIds);
    }

    private boolean sameStoredSelection(
            CurriculumPersonalizationPlanner.StoredSelection stored,
            PersonalizationPlan.Option option) {
        if (stored == null || option == null) {
            return false;
        }
        return Objects.equals(stored.groupId(), option.groupId())
                && Objects.equals(
                        stored.groupInstanceId(),
                        option.groupInstanceId())
                && Objects.equals(stored.landscapeId(), option.landscapeId())
                && stored.kind() == option.kind()
                && equalsIgnoreCaseNullable(
                        stored.filterId(),
                        option.filterId())
                && Objects.equals(stored.scopeKey(), option.scopeKey())
                && equalsIgnoreCaseNullable(
                        stored.scopeValue(),
                        option.scopeValue());
    }

    private boolean equalsIgnoreCaseNullable(String left, String right) {
        if (left == null || right == null) {
            return left == null && right == null;
        }
        return left.equalsIgnoreCase(right);
    }

    /**
     * Persists one already revalidated authored plan option without passing it
     * through curriculum-specific compatibility rules.
     *
     * <p>A value option persists its selected landscape and optional filter
     * exactly as authored. A group-completion option persists only reserved
     * flow progress and never creates fachliche configuration. Course profiles
     * are persisted per selected subject and remain independent of learning
     * stage and duration model; they never change goals, graph relationships
     * or mastery.</p>
     */
    private void applyCurrentPersonalizationOption(
            Learner learner,
            Map<String, Object> finalConfig,
            PersonalizationPlan.Option option) {
        if (learner == null || option == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A valid authored personalization option is required");
        }

        if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP) {
            try {
                CurriculumPersonalizationPlanner.recordGroupCompletion(
                        finalConfig,
                        learner.getSelectedCurriculum(),
                        option);
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "The authored personalization completion is no longer valid");
            }
            persistGuidedPersonalCurriculum(learner, finalConfig);
            return;
        }

        if (option.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE) {
            if (option.landscapeId() == null
                    || option.landscapeId().isBlank()
                    || option.scopeKey() == null
                    || option.scopeKey().isBlank()
                    || option.scopeValue() == null
                    || option.scopeValue().isBlank()) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "A valid authored personalization scope option is required");
            }
            SkillLandscape landscape = landscapeService.getById(option.landscapeId());
            if (landscape == null) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "The authored personalization landscape is no longer available");
            }

            Object existingSettings = finalConfig.get(option.landscapeId());
            Map<String, Object> settings = existingSettings instanceof Map<?, ?> existingMap
                    ? new LinkedHashMap<>((Map<String, Object>) existingMap)
                    : new LinkedHashMap<>();
            settings.put("selected", true);
            /*
             * Scope values are orthogonal to curriculum filters. In
             * particular, persisting G8/G9 must preserve an already selected
             * jurisdiction or course profile instead of replacing it.
             */
            settings.put(option.scopeKey(), storedScopeValue(option));
            finalConfig.put(option.landscapeId(), settings);
            synchronizeCanonicalStageScope(learner, finalConfig, option);

            persistGuidedPersonalCurriculum(learner, finalConfig);
            return;
        }

        if (option.kind() != PersonalizationPlan.OptionKind.VALUE
                || option.landscapeId() == null
                || option.landscapeId().isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A valid authored personalization value option is required");
        }

        SkillLandscape landscape = landscapeService.getById(option.landscapeId());
        if (landscape == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "The authored personalization landscape is no longer available");
        }

        String canonicalFilterId = null;
        if (option.filterId() != null && !option.filterId().isBlank()) {
            canonicalFilterId =
                    CurriculumPersonalizationPlanner.canonicalFilterId(landscape, option.filterId());
            if (!option.filterId().equals(canonicalFilterId)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "The authored personalization option is no longer available");
            }
        }

        Object existingSettings = finalConfig.get(option.landscapeId());
        Map<String, Object> settings = existingSettings instanceof Map<?, ?> existingMap
                ? new LinkedHashMap<>((Map<String, Object>) existingMap)
                : new LinkedHashMap<>();
        settings.put("selected", true);
        if (canonicalFilterId != null) {
            settings.put("filterId", canonicalFilterId);
            // durationModel is a legacy storage alias. An explicitly authored
            // flow always persists the declared filter field and cannot retain
            // both representations.
            settings.remove("durationModel");
        }
        finalConfig.put(option.landscapeId(), settings);

        persistGuidedPersonalCurriculum(learner, finalConfig);
    }

    private Object storedScopeValue(PersonalizationPlan.Option option) {
        return SubjectExtensionScope.KEY.equals(option.scopeKey())
                ? SubjectExtensionScope.storedValue(option.scopeValue())
                : option.scopeValue();
    }

    private void persistGuidedPersonalCurriculum(Learner learner, Map<String, Object> config) {
        openAvailableExtensionChoices(learner.getSelectedCurriculum(), config);
        learner.setLearningState(LearningState.FRONTIER);
        revalidatePlannedGoalsForProjectedScope(learner, config);
        persistPersonalCurriculum(learner, config);
    }

    private boolean reopenStoredPersonalization(String rootLandscapeId, Map<String, Object> config) {
        if (CurriculumPersonalizationPlanner.reopenMigratedFlow(config, rootLandscapeId)) {
            return true;
        }
        var prior = planForPersonalCurriculum(rootLandscapeId, config);
        if (!prior.canReopenMigratedPersonalization()) {
            return false;
        }
        CurriculumPersonalizationPlanner.markExtensionChoicesOpen(config, rootLandscapeId);
        return true;
    }

    private PersonalizationPlan openAvailableExtensionChoices(String rootLandscapeId, Map<String, Object> config) {
        var plan = planForPersonalCurriculum(rootLandscapeId, config);
        if (!plan.canReopenMigratedPersonalization()) {
            return plan;
        }
        // The same compatibility affordance also covers completed V1 configurations without
        // an extension decision. Reaching that decision through a new write opens it.
        CurriculumPersonalizationPlanner.markExtensionChoicesOpen(config, rootLandscapeId);
        return planForPersonalCurriculum(rootLandscapeId, config);
    }

    private PersonalizationPlan planForPersonalCurriculum(String rootLandscapeId, Map<String, Object> config) {
        String json = writePersonalCurriculumConfig(config);
        return rawPersonalizationPlan(rootLandscapeId, json, parsePersonalCurriculumConfig(json));
    }

    /**
     * Removes stale Level-3 focus and active-goal entries after a guided
     * Level-2 mutation.
     *
     * <p>The current learner-facing projection is authoritative: only its
     * {@code targetGoalIds} remain focusable, including intentional
     * non-authoritative fallback targets. Canonical IDs are retained unchanged,
     * while unknown IDs and goals visible solely as {@code prerequisiteOnly}
     * are removed. An unresolved plan cannot retain an active goal. Mastery and
     * skill graph data are not modified.</p>
     */
    private void revalidatePlannedGoalsForProjectedScope(
            Learner learner,
            Map<String, Object> projectedConfig) {
        if (learner == null
                || learner.getSkillpilotId() == null
                || learner.getSkillpilotId().isBlank()) {
            return;
        }

        List<PlannedGoal> plannedGoals =
                plannedGoalRepository.findByLearner_SkillpilotId(learner.getSkillpilotId());
        if (learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            learner.setActiveGoalId(null);
            if (plannedGoals != null && !plannedGoals.isEmpty()) {
                plannedGoalRepository.deleteAll(plannedGoals);
            }
            return;
        }

        String projectedConfigJson = writePersonalCurriculumConfig(
                projectedConfig == null ? Collections.emptyMap() : projectedConfig);
        Map<String, Map<String, Object>> parsedProjectedConfig =
                parsePersonalCurriculumConfig(projectedConfigJson);
        PersonalizationPlan personalizationPlan = rawPersonalizationPlan(
                learner.getSelectedCurriculum(), projectedConfigJson, parsedProjectedConfig);
        if (!personalizationPlan.valid() || personalizationPlan.required()) {
            learner.setActiveGoalId(null);
            if (plannedGoals != null && !plannedGoals.isEmpty()) {
                plannedGoalRepository.deleteAll(plannedGoals);
            }
            return;
        }

        GoalProjection projection = getGoalProjection(
                learner.getSelectedCurriculum(),
                projectedConfigJson);
        List<String> projectedFocusIds = resolveProjectedTargetFocusIds(
                plannedGoals == null
                        ? Collections.emptyList()
                        : plannedGoals.stream().map(PlannedGoal::getGoalId).toList(),
                projection);
        List<PlannedGoal> invalidGoals = plannedGoals == null
                ? Collections.emptyList()
                : plannedGoals.stream()
                        .filter(Objects::nonNull)
                        .filter(plannedGoal -> !isProjectedTargetFocus(
                                plannedGoal.getGoalId(),
                                projection))
                        .toList();
        normalizeStoredDeclaredFocuses(learner, plannedGoals, projection);
        if (!invalidGoals.isEmpty()) {
            plannedGoalRepository.deleteAll(invalidGoals);
        }
        if (projectedFocusIds.isEmpty()) {
            String defaultFocusId = resolveDefaultProjectedFocusId(
                    learner.getSelectedCurriculum(),
                    projection);
            if (defaultFocusId != null) {
                plannedGoalRepository.save(new PlannedGoal(learner, defaultFocusId));
                projectedFocusIds = List.of(defaultFocusId);
            }
        }

        String invalidationReason = resolveActiveGoalInvalidationReason(
                learner,
                projection,
                projectedFocusIds);
        if (invalidationReason != null) {
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
        }
    }

    /**
     * Resolves the one reason an active goal cannot survive a projected focus
     * change. This rule is shared by direct focus writes and by Level-2
     * personalization revalidation so every mutation observes the same target
     * projection and planned scope.
     */
    private String resolveActiveGoalInvalidationReason(
            Learner learner,
            GoalProjection projection,
            List<String> projectedFocusIds) {
        if (learner == null || projection == null) {
            return null;
        }
        String storedActiveGoalId = learner.getActiveGoalId();
        if (storedActiveGoalId == null || storedActiveGoalId.isBlank()) {
            return null;
        }

        String projectedActiveGoalId = resolveGoalIdInVisibleGoals(
                storedActiveGoalId,
                projection.visibleGoals(),
                false);
        if (projectedActiveGoalId == null
                || !projection.targetGoalIds().contains(projectedActiveGoalId)) {
            return "ACTIVE_GOAL_CLEARED_INVALID_VIEW";
        }

        List<String> projectedScopeIds = resolveProjectedTargetScopeIds(
                projectedFocusIds == null ? Collections.emptyList() : projectedFocusIds,
                projection);
        Set<String> scope = projection.extensionPreparations().contains(projectedActiveGoalId)
                ? extensionAwareFocusScope(projection, projectedScopeIds) : null;
        if (!preservesDirectAssessment(learner, projectedActiveGoalId) && isGoalOutOfPlannedScope(
                projectedActiveGoalId,
                projectedScopeIds,
                projection.structuralGoals(),
                scope)) {
            return "ACTIVE_GOAL_CLEARED_OUT_OF_SCOPE";
        }

        GlobalAssessmentFocus globalAssessmentFocus = resolveGlobalAssessmentFocus(
                projection.structuralGoals(),
                projectedFocusIds == null ? Collections.emptyList() : projectedFocusIds);
        if (!preservesDirectAssessment(learner, projectedActiveGoalId) && isGlobalAssessmentGoalWithoutExplicitFocus(
                projectedActiveGoalId,
                globalAssessmentFocus)) {
            return "ACTIVE_GOAL_CLEARED_ASSESSMENT_FOCUS";
        }
        return null;
    }

    private boolean isProjectedTargetFocus(
            String storedGoalId,
            GoalProjection projection) {
        return !resolveProjectedFocusTargetIds(storedGoalId, projection).isEmpty();
    }

    /**
     * Removes only the legacy migration shortcut when the learner explicitly
     * starts the coach. Existing Level-2 selections and mastery remain
     * unchanged; Level-3 focus and the active goal are revalidated against the
     * reopened flow.
     */
    Learner reopenPersonalizationForExplicitLaunch(Learner learner) {
        if (learner == null
                || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            return learner;
        }
        Map<String, Object> personalCurriculum =
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        if (!reopenStoredPersonalization(learner.getSelectedCurriculum(), personalCurriculum)) {
            return learner;
        }
        openAvailableExtensionChoices(learner.getSelectedCurriculum(), personalCurriculum);
        learner.setPersonalCurriculum(writePersonalCurriculumConfig(personalCurriculum));
        revalidatePlannedGoalsForProjectedScope(learner, personalCurriculum);
        if (learner.getActiveGoalId() == null || learner.getActiveGoalId().isBlank()) {
            learner.setLearningState(LearningState.FRONTIER);
        }
        Learner saved = advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(
                new LearnerStateChangedEvent(this, learner.getSkillpilotId(), "PERSONALIZATION_UPDATE"));
        return saved;
    }

    private void persistPersonalCurriculum(Learner learner, Map<String, Object> finalConfig) {
        try {
            String json = objectMapper.writeValueAsString(finalConfig);
            if (!Objects.equals(json, learner.getPersonalCurriculum()) && completionRouteOwnsNavigation(learner)) {
                CompletionWorkflowState old = completionWorkflow(learner);
                if (old != null && old.directAssessment() != null) learner.setActiveGoalId(null);
                saveCompletionWorkflow(learner, null);
            }
            learner.setPersonalCurriculum(json);
            advanceCoachStateRevision(learner);
        } catch (Exception e) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid personalization config");
        }
        eventPublisher.publishEvent(
                new LearnerStateChangedEvent(this, learner.getSkillpilotId(), "PERSONALIZATION_UPDATE"));
    }

    @SuppressWarnings("unchecked")
    private void synchronizeCanonicalStageScope(
            Learner learner,
            Map<String, Object> personalCurriculum,
            PersonalizationPlan.Option option) {
        if (learner == null
                || personalCurriculum == null
                || option == null
                || !"stage".equals(option.scopeKey())) {
            return;
        }
        String canonicalStage = resolveStageScope(option.scopeValue());
        String rootLandscapeId = learner.getSelectedCurriculum();
        if (canonicalStage == null
                || rootLandscapeId == null
                || rootLandscapeId.isBlank()) {
            return;
        }

        Object existingRootSettings = personalCurriculum.get(rootLandscapeId);
        Map<String, Object> rootSettings = existingRootSettings instanceof Map<?, ?> existingMap
                ? new LinkedHashMap<>((Map<String, Object>) existingMap)
                : new LinkedHashMap<>();
        rootSettings.put("selected", true);
        rootSettings.put("stage", canonicalStage);
        personalCurriculum.put(rootLandscapeId, rootSettings);

        List<SkillLandscape> rootClosure = landscapeService.getClosure(rootLandscapeId);
        if (rootClosure != null) {
            for (SkillLandscape landscape : rootClosure) {
                if (landscape == null
                        || landscape.getLandscapeId() == null
                        || landscape.getLandscapeId().isBlank()
                        || rootLandscapeId.equals(landscape.getLandscapeId())) {
                    continue;
                }
                Object existingSettings =
                        personalCurriculum.get(landscape.getLandscapeId());
                if (!(existingSettings instanceof Map<?, ?> existingMap)) {
                    continue;
                }
                Map<String, Object> normalizedSettings =
                        new LinkedHashMap<>((Map<String, Object>) existingMap);
                if (normalizedSettings.remove("stage") != null) {
                    personalCurriculum.put(
                            landscape.getLandscapeId(),
                            normalizedSettings);
                }
            }
        }

        boolean sek1Selected =
                "SekI".equals(canonicalStage) || "CrossStage".equals(canonicalStage);
        boolean sek2Selected =
                "SekII".equals(canonicalStage) || "CrossStage".equals(canonicalStage);
        personalCurriculum.put(
                STAGE_SCOPE_SEK1_ID,
                new LinkedHashMap<>(Map.of("selected", sek1Selected)));
        personalCurriculum.put(
                STAGE_SCOPE_SEK2_ID,
                new LinkedHashMap<>(Map.of("selected", sek2Selected)));
    }

    private List<String> normalizedReferences(List<String> references) {
        if (references == null || references.isEmpty()) {
            return List.of();
        }
        return references.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(reference -> !reference.isBlank())
                .distinct()
                .toList();
    }

    private void applyPersonalCurriculumMutation(
            Learner learner,
            Map<String, Object> finalConfig,
            List<String> goalIds,
            List<String> filters) {
        Set<String> targetLandscapes = new LinkedHashSet<>();
        List<String> effectiveFilters = new ArrayList<>();
        if (filters != null) {
            filters.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(filter -> !filter.isBlank())
                    .forEach(effectiveFilters::add);
        }

        if (goalIds != null) {
            for (String gid : goalIds) {
                if (gid == null || gid.isBlank()) {
                    continue;
                }
                String submittedId = gid.trim();

                if (landscapeService.getById(submittedId) != null) {
                    targetLandscapes.add(submittedId);
                    continue;
                }

                String landscapeId = landscapeService.getLandscapeIdForGoal(submittedId);
                if (landscapeId != null) {
                    targetLandscapes.add(landscapeId);
                    continue;
                }

                // Backward-compatible input shape; validation below still requires
                // the value to be declared by the selected landscape.
                effectiveFilters.add(submittedId);
            }
        }

        learner.setLearningState(LearningState.FRONTIER);

        if (targetLandscapes.isEmpty() && !effectiveFilters.isEmpty()) {
            String current = learner.getSelectedCurriculum();
            if (current != null && !current.isBlank()) {
                targetLandscapes.add(current);
            }
        }

        if (!effectiveFilters.isEmpty() && targetLandscapes.size() != 1) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A personalization option must target exactly one landscape");
        }

        String resolvedFilterId = null;
        String resolvedDurationModel = null;
        if (!effectiveFilters.isEmpty()) {
            SkillLandscape targetLandscape = landscapeService.getById(targetLandscapes.iterator().next());
            if (targetLandscape == null) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Unknown personalization landscape");
            }

            Set<String> resolvedOptions = new LinkedHashSet<>();
            for (String submittedFilter : effectiveFilters) {
                String canonicalFilter =
                        CurriculumPersonalizationPlanner.canonicalFilterId(targetLandscape, submittedFilter);
                String legacyDurationModel = usesLegacyStructuredFilterSemantics(targetLandscape)
                        ? normalizeDurationModelScope(submittedFilter)
                        : null;
                if (canonicalFilter == null && legacyDurationModel == null) {
                    throw new ResponseStatusException(
                            org.springframework.http.HttpStatus.BAD_REQUEST,
                            "The personalization option is not declared by the target landscape");
                }
                if (legacyDurationModel != null
                        && (canonicalFilter == null
                                || DURATION_MODEL_FILTER_IDS.contains(normalizeFilterId(canonicalFilter)))) {
                    resolvedOptions.add("durationModel:" + legacyDurationModel);
                } else {
                    resolvedOptions.add("filterId:" + canonicalFilter);
                }
            }
            if (resolvedOptions.size() > 1) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Exactly one authored personalization option is allowed per mutation");
            }

            String resolvedOption = resolvedOptions.iterator().next();
            int separator = resolvedOption.indexOf(':');
            if (resolvedOption.startsWith("durationModel:")) {
                resolvedDurationModel = resolvedOption.substring(separator + 1);
            } else {
                resolvedFilterId = resolvedOption.substring(separator + 1);
            }
        }

        for (String landscapeId : targetLandscapes) {
            SkillLandscape landscape = landscapeService.getById(landscapeId);
            if (landscape == null) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Unknown personalization landscape");
            }
            Object existingSettings = finalConfig.get(landscapeId);
            Map<String, Object> settings = existingSettings instanceof Map<?, ?> existingMap
                    ? new LinkedHashMap<>((Map<String, Object>) existingMap)
                    : new LinkedHashMap<>();
            settings.put("selected", true);
            if (resolvedDurationModel != null) {
                settings.put("durationModel", resolvedDurationModel);
            } else if (resolvedFilterId != null) {
                settings.put("filterId", resolvedFilterId);
            }
            finalConfig.put(landscapeId, settings);
        }

        PersonalizationPlan updatedPlan = planForPersonalCurriculum(learner.getSelectedCurriculum(), finalConfig);
        if (updatedPlan.canReopenMigratedPersonalization()
                && !buildPersonalizationPlan(learner).canReopenMigratedPersonalization()) {
            CurriculumPersonalizationPlanner.markExtensionChoicesOpen(finalConfig, learner.getSelectedCurriculum());
        }
        revalidatePlannedGoalsForProjectedScope(learner, finalConfig);
        persistPersonalCurriculum(learner, finalConfig);
    }

    private Map<String, Object> mutablePersonalCurriculumPayload(String personalCurriculumJson) {
        Map<String, Object> mutable = new LinkedHashMap<>();
        parsePersonalCurriculumConfig(personalCurriculumJson)
                .forEach((landscapeId, settings) -> mutable.put(landscapeId, new LinkedHashMap<>(settings)));
        return mutable;
    }

    /**
     * Reads a stored personalization payload without dropping extension keys
     * whose values are not landscape-setting maps.
     *
     * <p>Normal request validation intentionally coerces the payload to the
     * supported landscape-map shape. A compatibility migration, however, must
     * be lossless for data it does not own, so it changes only the copied root
     * settings and serializes all other stored values again unchanged.</p>
     */
    private MutablePersonalCurriculumDocument readPersonalCurriculumDocument(
            String personalCurriculumJson) {
        if (personalCurriculumJson == null || personalCurriculumJson.isBlank()) {
            Map<String, Object> empty = new LinkedHashMap<>();
            return new MutablePersonalCurriculumDocument(empty, empty);
        }
        try {
            Object parsed = objectMapper.readValue(personalCurriculumJson, Object.class);
            if (!(parsed instanceof Map<?, ?> rawPayload)) {
                Map<String, Object> empty = new LinkedHashMap<>();
                return new MutablePersonalCurriculumDocument(empty, empty);
            }
            Map<String, Object> document = copyStringKeyedMap(rawPayload);
            Map<String, Object> payload = document;
            if (rawPayload.size() == 1
                    && rawPayload.get("personalCurriculum") instanceof Map<?, ?> nestedPayload) {
                payload = copyStringKeyedMap(nestedPayload);
                document.put("personalCurriculum", payload);
            }
            return new MutablePersonalCurriculumDocument(document, payload);
        } catch (Exception ignored) {
            Map<String, Object> empty = new LinkedHashMap<>();
            return new MutablePersonalCurriculumDocument(empty, empty);
        }
    }

    private Map<String, Object> copyStringKeyedMap(Map<?, ?> source) {
        Map<String, Object> copied = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : source.entrySet()) {
            if (entry.getKey() instanceof String key) {
                copied.put(key, entry.getValue());
            }
        }
        return copied;
    }

    private boolean isSelectedInPersonalCurriculum(Object rawConfig) {
        if (!(rawConfig instanceof Map<?, ?> config)) {
            return false;
        }
        Object selected = config.get("selected");
        return selected instanceof Boolean && (Boolean) selected;
    }

    private String buildCompatibilityOnlyRetirementMessage(String curriculumId) {
        String jurisdiction = landscapeService.resolveSourceLandscapeJurisdiction(curriculumId);
        String canonicalFilterLabel = BundeslandCodeNormalizer.formatDisplayLabelEn(jurisdiction);
        if (canonicalFilterLabel != null) {
            return "This compatibility-only curriculum is retired. Select Gymnasium (DE) and use the canonical "
                    + canonicalFilterLabel + " filter instead.";
        }
        return "This compatibility-only curriculum is retired. Select Gymnasium (DE) instead.";
    }

    private Map<String, Map<String, Object>> parsePersonalCurriculumConfig(String personalCurriculumJson) {
        if (personalCurriculumJson == null || personalCurriculumJson.isBlank()) {
            return new HashMap<>();
        }
        try {
            Object parsed = objectMapper.readValue(personalCurriculumJson, Object.class);
            return coercePersonalCurriculumConfig(parsed);
        } catch (Exception ignored) {
            return new HashMap<>();
        }
    }

    private String resolveProjectionStateFilterId(Learner learner) {
        if (learner == null) {
            return null;
        }
        return resolveProjectionStateFilterId(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
    }

    private String resolveProjectionStateFilterId(String curriculumId, String personalCurriculumJson) {
        if (curriculumId == null || curriculumId.isBlank()) {
            return null;
        }
        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(personalCurriculumJson);
        if (config.isEmpty()) {
            return null;
        }
        Map<String, Object> rootConfig = config.get(curriculumId);
        if (rootConfig == null) {
            return null;
        }
        Object filterId = rootConfig.get("filterId");
        if (!(filterId instanceof String textFilterId)) {
            return null;
        }
        String normalizedFilterId = normalizeFilterId(textFilterId);
        return isStateFilterId(normalizedFilterId) ? normalizedFilterId : null;
    }

    private Map<String, Object> normalizePersonalCurriculumPayload(Map<String, Object> config) {
        if (config == null || config.isEmpty()) {
            return new LinkedHashMap<>();
        }

        Object nestedConfig = config.get("personalCurriculum");
        if (config.size() == 1 && nestedConfig instanceof Map<?, ?> nestedMap) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : nestedMap.entrySet()) {
                if (entry.getKey() instanceof String key) {
                    normalized.put(key, entry.getValue());
                }
            }
            return normalized;
        }

        return new LinkedHashMap<>(config);
    }

    private Map<String, Map<String, Object>> coercePersonalCurriculumConfig(Object parsed) {
        if (!(parsed instanceof Map<?, ?> rawConfig)) {
            return new HashMap<>();
        }

        Object configCandidate = rawConfig;
        if (rawConfig.size() == 1 && rawConfig.get("personalCurriculum") instanceof Map<?, ?> nestedConfig) {
            configCandidate = nestedConfig;
        }

        if (!(configCandidate instanceof Map<?, ?> configMap)) {
            return new HashMap<>();
        }

        Map<String, Map<String, Object>> normalized = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : configMap.entrySet()) {
            if (!(entry.getKey() instanceof String key) || !(entry.getValue() instanceof Map<?, ?> valueMap)) {
                continue;
            }
            Map<String, Object> normalizedEntry = new LinkedHashMap<>();
            for (Map.Entry<?, ?> valueEntry : valueMap.entrySet()) {
                if (valueEntry.getKey() instanceof String valueKey) {
                    normalizedEntry.put(valueKey, valueEntry.getValue());
                }
            }
            normalized.put(key, normalizedEntry);
        }
        return normalized;
    }

    private boolean readSelectedFlag(Map<String, Map<String, Object>> config, String landscapeId) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return false;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean && (Boolean) selected;
    }

    private String writePersonalCurriculumConfig(Map<String, Object> config) {
        try {
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to serialize personal curriculum config.");
        }
    }

    static boolean isAtomicGoal(LearningGoal goal) {
        return goal != null && !"cluster".equals(goal.getType())
                && (goal.getContains() == null || goal.getContains().isEmpty());
    }

    /**
     * Work demand belongs to the complete Personal Curriculum, not the current focus.
     * A null result means unavailable automatic inputs; it is never an empty demand claim.
     * This uses the caller's mastery read and never enters completionSnapshot/frontier again.
     */
    private Set<String> automaticFrontierWaivers(Learner learner, GoalProjection projection,
            Map<String, Double> existingMastery) {
        if (completionApplicationService == null || !completionApplicationService.catalog().automatic()
                || !completionApplicationService.catalog().enabled()) return Set.of();
        if (!completionApplicationService.catalog().available()) return null;
        if (projection.targetGoalIds().isEmpty()) return Set.of();
        try {
            Map<String, LearningGoal> graph = completionGraph(learner, projection);
            CompiledCompletionProfile compiled = compileCompletionScope(learner, AUTOMATIC_COMPLETION_DEFAULT,
                    projection, graph);
            Map<String, LearningGoal> contextGoals = new LinkedHashMap<>();
            compiled.contextGoalIds().forEach(id -> contextGoals.put(id, graph.get(id)));
            Map<String, Double> mastery = new LinkedHashMap<>(applyCanonicalMasteryProjection(
                    contextGoals, existingMastery, resolveProjectionStateFilterId(learner)));
            resolveSrsMasterySnapshot(learner.getSkillpilotId(), List.copyOf(contextGoals.values()), projection)
                    .forEach((id, mastered) -> mastery.put(id, mastered ? 1.0 : 0.0));
            return withUnitPlanningCredits(completionApplicationService.evaluate(compiled, mastery),
                    compiled, learner, projection, graph).waivedGoalIds();
        } catch (RuntimeException unavailable) {
            // The context projection publishes the error. Do not recommend work from an
            // invented fallback outcome; explicit raw availability remains separate.
            completionApplicationService.recordStatus("unavailable");
            return null;
        }
    }

    /** Lift derived completion to navigation clusters without changing mastery. */
    private Set<String> completedFrontierWork(Map<String, LearningGoal> goals,
            Map<String, Double> effectiveMastery, Set<String> waived) {
        if (waived.isEmpty()) return Set.of();
        Set<String> completed = new HashSet<>(waived);
        effectiveMastery.forEach((id, value) -> {
            if (value >= PLANNING_SCOPE_MASTERY_THRESHOLD) completed.add(id);
        });
        Map<String, Set<String>> parents = new HashMap<>();
        Map<String, Integer> pendingChildren = new HashMap<>();
        for (LearningGoal goal : goals.values()) {
            // A navigation node without children has no completed child basis.
            // It must neither crash on null contains nor finish by empty demand.
            if (isAtomicGoal(goal) || goal.getContains() == null || goal.getContains().isEmpty()) continue;
            Set<String> children = goal.getContains().stream().map(reference -> {
                String resolved = resolveGoalRef(reference, goals);
                return resolved == null ? reference : resolved;
            }).collect(Collectors.toSet());
            pendingChildren.put(goal.getId(), children.size());
            for (String child : children) {
                parents.computeIfAbsent(child, ignored -> new HashSet<>()).add(goal.getId());
            }
        }
        ArrayDeque<String> queue = new ArrayDeque<>(completed);
        while (!queue.isEmpty()) {
            for (String parent : parents.getOrDefault(queue.removeFirst(), Set.of())) {
                int remaining = pendingChildren.computeIfPresent(parent, (id, count) -> count - 1);
                if (remaining == 0 && completed.add(parent)) queue.addLast(parent);
            }
        }
        return completed;
    }

    @Transactional(readOnly = true)
    public List<String> getFrontier(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }

        GoalProjection projection = getGoalProjection(curriculumId, learner.getPersonalCurriculum());
        Set<String> followedScope = followedLearningScopeIds(learner, projection, null);
        if (followedScope != null && followedScope.isEmpty()) return List.of();
        Map<String, LearningGoal> allGoals = projection.visibleGoals();
        Map<String, Double> masteryMap = getMastery(skillpilotId);
        Map<String, Double> effectiveMastery = computeEffectiveMastery(allGoals, masteryMap);
        Set<String> waived = automaticFrontierWaivers(learner, projection, masteryMap);
        if (waived == null) return List.of();
        Set<String> completedWork = completedFrontierWork(allGoals, effectiveMastery, waived);

        List<String> projectedFocusIds = resolveRuntimeProjectedFocusIds(
                learner,
                projection);
        List<String> plannedIds = resolveProjectedTargetScopeIds(projectedFocusIds, projection);
        Set<String> scope = Collections.emptySet();
        List<FrontierGoal> requiredOrientationGoals = List.of();
        Map<String, Set<String>> unitOrientationScopes = guidedUnitOrientationScopes(projection);
        java.util.function.Function<String, Set<String>> foreignScopes = foreignSubjectPlanScopes(learner, projection, null);
        if (!plannedIds.isEmpty()) {
            scope = extensionAwareFocusScope(projection, plannedIds);
            includeGuidedOpeningsInAtomFocus(learner, projection, projectedFocusIds, scope);
            requiredOrientationGoals = getRequiredOrientationGoals(
                    learner,
                    projection,
                    allGoals,
                    projection.structuralGoals(),
                    effectiveMastery,
                    masteryMap,
                    projectedFocusIds,
                    plannedIds,
                    scope, waived).stream().filter(goal -> isNavigationInFollowedScope(
                            goal.id(), foreignScopes.apply(goal.id()), unitOrientationScopes)).toList();
            if (requiredOrientationGoals.stream().anyMatch(goal -> !unitOrientationScopes.containsKey(goal.id()))) {
                return requiredOrientationGoals.stream()
                        .filter(goal -> isNavigationInFollowedScope(goal.id(), followedScope, unitOrientationScopes))
                        .map(FrontierGoal::id)
                        .distinct()
                        .toList();
            }
        }
        GlobalAssessmentFocus globalAssessmentFocus = resolveGlobalAssessmentFocus(
                projection.structuralGoals(),
                projectedFocusIds);
        FrontierPrerequisites prerequisites = frontierPrerequisites(
                learner, projection, masteryMap, plannedIds.isEmpty() ? null : scope);
        Set<String> laterStudyGoals = deferredUnitStudyGoals(learner, projection, projectedFocusIds, scope,
                followedScope, unitOrientationScopes, effectiveMastery, waived, prerequisites.planningCredits());

        List<String> frontier = requiredOrientationGoals.stream()
                .filter(goal -> isNavigationInFollowedScope(goal.id(), followedScope, unitOrientationScopes))
                .map(FrontierGoal::id).collect(Collectors.toCollection(ArrayList::new));
        for (LearningGoal goal : allGoals.values()) {
            if (projection.declaredUnits().rejectedOpenings().contains(goal.getId())) continue;
            if (frontier.contains(goal.getId())) continue;
            if (laterStudyGoals.contains(goal.getId())) continue;
            if (isGatedByUnitOpening(goal.getId(), requiredOrientationGoals, unitOrientationScopes)) continue;
            if (isDeferredLandscapeOrientation(goal, requiredOrientationGoals, unitOrientationScopes)) continue;
            if (completedWork.contains(goal.getId())) continue;
            if (followedScope != null && !followedScope.contains(goal.getId())) continue;
            if (!projection.targetGoalIds().contains(goal.getId())) {
                continue;
            }
            if (!plannedIds.isEmpty() && !scope.contains(goal.getId())) {
                continue;
            }
            Set<String> foreignScope = foreignScopes.apply(goal.getId());
            if (foreignScope != null && !foreignScope.contains(goal.getId())) continue;
            boolean globalAssessmentGoal = globalAssessmentFocus.allGoalIds().contains(goal.getId());
            if (globalAssessmentGoal
                    && !globalAssessmentFocus.explicitlyFocusedGoalIds().contains(goal.getId())) {
                continue;
            }
            Double currentMastery = effectiveMastery.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= PLANNING_SCOPE_MASTERY_THRESHOLD) {
                continue; // Already mastered
            }

            boolean prerequisitesMet = areFrontierPrerequisitesMastered(
                    goal, projection, prerequisites);

            if (prerequisitesMet
                    && !isExamGoalUnavailableForHardCheck(goal)
                    && !isNonGlobalExamWithoutDirectPrerequisite(goal, globalAssessmentGoal)) {
                frontier.add(goal.getId());
            }
        }

        // One batched snapshot; the release rule is computed only if a deck goal still has an open card.
        Set<String> unavailableRecall = unavailableVerifiedRecallGoals(skillpilotId,
                frontier.stream().map(allGoals::get).toList(),
                () -> cardRelease(projection, masteryMap, prerequisites.planningCredits()), projection);
        List<String> available = frontier.stream()
                .filter(goalId -> !unavailableRecall.contains(goalId))
                .toList();
        return orderByStudyGuidance(available, unitStudyGuidance(learner, projection, projectedFocusIds,
                scope, followedScope, unitOrientationScopes, completedWork, prerequisites, available));
    }

    @Transactional(readOnly = true)
    public List<FrontierGoal> getRichFrontier(String skillpilotId) {
        return getRichFrontier(skillpilotId, true, null, true);
    }

    /**
     * Complete personalized availability for explicit server-side transitions.
     *
     * <p>The ordinary learner projection may compact equivalent choices for
     * display. Callers that must activate one explicitly authored goal need
     * the unabridged frontier, including work already implicitly completed.
     * Neither UI compaction nor automatic demand reduction may prevent a
     * learner from voluntarily studying an otherwise available goal.</p>
     */
    @Transactional(readOnly = true)
    public List<FrontierGoal> getUncompactedRichFrontier(String skillpilotId) {
        return getRichFrontier(skillpilotId, false, null, false);
    }

    private List<FrontierGoal> getRichFrontier(String skillpilotId, boolean compactFrontier) {
        return getRichFrontier(skillpilotId, compactFrontier, null, true);
    }

    /**
     * Side-effect-free frontier projection for a prospective learner focus.
     * Used by learner-owned plans to fail closed before changing Level-3 state.
     */
    @Transactional(readOnly = true)
    public List<FrontierGoal> getUncompactedRichFrontierForFocus(
            String skillpilotId,
            List<String> focusGoalIds) {
        if (focusGoalIds == null || focusGoalIds.isEmpty()) {
            return Collections.emptyList();
        }
        return getRichFrontier(skillpilotId, false, focusGoalIds, false);
    }

    private List<FrontierGoal> getRichFrontier(
            String skillpilotId,
            boolean compactFrontier,
            List<String> prospectiveFocusGoalIds,
            boolean requiredRecommendations) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }

        GoalProjection projection = getGoalProjection(curriculumId, learner.getPersonalCurriculum());
        Set<String> followedScope = followedLearningScopeIds(learner, projection, prospectiveFocusGoalIds);
        if (followedScope != null && followedScope.isEmpty()) return List.of();
        return getRichFrontier(learner, projection, richFrontierFacts(learner, projection), compactFrontier,
                prospectiveFocusGoalIds, requiredRecommendations, followedScope);
    }

    private record RichFrontierFacts(Map<String, Double> mastery, Map<String, Double> effectiveMastery,
            Set<String> automaticWaivers, Supplier<FrontierPrerequisites> prerequisites) { }

    private RichFrontierFacts richFrontierFacts(Learner learner, GoalProjection projection) {
        var mastery = getMastery(learner.getSkillpilotId());
        return new RichFrontierFacts(mastery, computeEffectiveMastery(projection.visibleGoals(), mastery),
                automaticFrontierWaivers(learner, projection, mastery), SingletonSupplier.of(
                        () -> frontierPrerequisites(learner, projection, mastery, null)));
    }

    private List<FrontierGoal> getRichFrontier(Learner learner, GoalProjection projection, RichFrontierFacts facts,
            boolean compactFrontier, List<String> prospectiveFocusGoalIds, boolean requiredRecommendations, Set<String> followedScope) {
        return getRichFrontier(learner, projection, facts, compactFrontier, prospectiveFocusGoalIds,
                requiredRecommendations, followedScope, false);
    }

    private List<FrontierGoal> getRichFrontier(Learner learner, GoalProjection projection, RichFrontierFacts facts,
            boolean compactFrontier, List<String> prospectiveFocusGoalIds, boolean requiredRecommendations,
            Set<String> followedScope, boolean subjectContinuation) {
        return getRichFrontier(learner, projection, facts, compactFrontier, prospectiveFocusGoalIds,
                requiredRecommendations, followedScope, subjectContinuation, Set.of());
    }

    private List<FrontierGoal> getRichFrontier(Learner learner, GoalProjection projection, RichFrontierFacts facts,
            boolean compactFrontier, List<String> prospectiveFocusGoalIds, boolean requiredRecommendations,
            Set<String> followedScope, boolean subjectContinuation, Set<String> excludedUnitOpenings) {
        String skillpilotId = learner.getSkillpilotId();
        boolean strictMode = Boolean.TRUE.equals(learner.getStrictMode());
        Map<String, LearningGoal> allFilteredGoals = projection.visibleGoals();
        Map<String, LearningGoal> allStructuralGoals = projection.structuralGoals();

        Map<String, Double> masteryMap = facts.mastery();
        Map<String, Double> effectiveMastery = facts.effectiveMastery();
        Set<String> automaticWaivers = facts.automaticWaivers();
        if (requiredRecommendations && automaticWaivers == null) return List.of();
        Set<String> waived = automaticWaivers == null ? Set.of() : automaticWaivers;
        Set<String> completedWork = requiredRecommendations
                ? completedFrontierWork(allFilteredGoals, effectiveMastery, waived) : Set.of();

        // The focus is the union of selected roots and their contains descendants.
        List<String> projectedFocusIds = prospectiveFocusGoalIds == null
                ? resolveRuntimeProjectedFocusIds(learner, projection)
                : resolveProjectedTargetFocusIds(prospectiveFocusGoalIds, projection);
        List<String> plannedIds = resolveProjectedTargetScopeIds(
                projectedFocusIds,
                projection);
        GlobalAssessmentFocus globalAssessmentFocus = resolveGlobalAssessmentFocus(
                allStructuralGoals,
                projectedFocusIds);

        // CRITICAL FIX: Use Structural (Unfiltered) Goals for Scope!
        // This ensures that if the User plans a Parent that is currently "Hidden" by a
        // filter,
        // we still find its children and include them in the scope.
        Set<String> scope = extensionAwareFocusScope(projection, plannedIds);
        includeGuidedOpeningsInAtomFocus(learner, projection, projectedFocusIds, scope, excludedUnitOpenings);

        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Plan: " + plannedIds);
        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Scope Size: " + scope.size());
        System.out.println("DEBUG_SKILLPILOT: getRichFrontier - Strict Mode: " + strictMode);
        if (!plannedIds.isEmpty() && scope.size() < 10) {
            System.out.println("DEBUG_SKILLPILOT: Scope Content: " + scope);
        }

        if (scope.isEmpty()) {
            if (followedScope != null) return List.of();
            // If the scope is empty (including stale stored IDs), publish the
            // initial choices. Composition views must expose their writable
            // roots; legacy projections retain their top-level modules.
            return getInitialScopeOptions(learner.getSelectedCurriculum(), projection);
        }

        // Only still-required orientation work gates the route. An implicitly
        // completed orientation remains voluntarily available without blocking
        // other explicitly chosen goals.
        java.util.function.Function<String, Set<String>> foreignScopes =
                foreignSubjectPlanScopes(learner, projection, prospectiveFocusGoalIds);
        Map<String, Set<String>> unitOrientationScopes = guidedUnitOrientationScopes(projection);
        List<FrontierGoal> requiredOrientationGoals = getRequiredOrientationGoals(
                learner,
                projection,
                allFilteredGoals,
                allStructuralGoals,
                effectiveMastery,
                masteryMap,
                projectedFocusIds,
                plannedIds,
                scope, waived).stream().filter(goal -> isNavigationInFollowedScope(
                        goal.id(), foreignScopes.apply(goal.id()), unitOrientationScopes)).toList();
        if (requiredOrientationGoals.stream().anyMatch(goal -> !unitOrientationScopes.containsKey(goal.id()))) {
            return orderFrontierByProjection(requiredOrientationGoals.stream()
                    .filter(goal -> isNavigationInFollowedScope(goal.id(), followedScope, unitOrientationScopes)).toList(), projection);
        }

        FrontierPrerequisites prerequisites = facts.prerequisites().get().within(scope);
        // Explicit selection uses the raw current frontier. Regular recommendations and
        // prospective section plans use the teaching order of their selected units.
        Set<String> laterStudyGoals = requiredRecommendations || prospectiveFocusGoalIds != null
                ? deferredUnitStudyGoals(learner, projection, projectedFocusIds, scope, followedScope,
                        unitOrientationScopes, effectiveMastery, waived, prerequisites.planningCredits()) : Set.of();
        List<FrontierGoal> frontier = requiredOrientationGoals.stream()
                .filter(goal -> isNavigationInFollowedScope(goal.id(), followedScope, unitOrientationScopes))
                .collect(Collectors.toCollection(ArrayList::new));
        Set<String> openingIds = frontier.stream().map(FrontierGoal::id).collect(Collectors.toSet());

        // Iterate FILTERED goals (what the user should see)
        for (LearningGoal goal : allFilteredGoals.values()) {
            if (projection.declaredUnits().rejectedOpenings().contains(goal.getId())) continue;
            if (openingIds.contains(goal.getId())) continue;
            if (laterStudyGoals.contains(goal.getId())) continue;
            if (isGatedByUnitOpening(goal.getId(), requiredOrientationGoals, unitOrientationScopes)) continue;
            if (isDeferredLandscapeOrientation(goal, requiredOrientationGoals, unitOrientationScopes)) continue;
            if (completedWork.contains(goal.getId())) continue;
            if (followedScope != null && !followedScope.contains(goal.getId())) continue;
            if (!projection.targetGoalIds().contains(goal.getId())) {
                continue;
            }
            boolean globalAssessmentGoal = globalAssessmentFocus.allGoalIds().contains(goal.getId());
            if (globalAssessmentGoal
                    && !globalAssessmentFocus.explicitlyFocusedGoalIds().contains(goal.getId())) {
                continue;
            }
            // Filter by Scope (calculated from Structural)
            if (!plannedIds.isEmpty() && !scope.contains(goal.getId())) {
                continue;
            }
            Double currentMastery = effectiveMastery.getOrDefault(goal.getId(), 0.0);
            if (currentMastery >= PLANNING_SCOPE_MASTERY_THRESHOLD) {
                continue;
            }
            Set<String> foreignScope = foreignScopes.apply(goal.getId());
            if (foreignScope != null && !foreignScope.contains(goal.getId())) continue;

            boolean prerequisitesMet = areFrontierPrerequisitesMastered(
                    goal, projection, prerequisites);

            if (isExamGoalUnavailableForHardCheck(goal)) {
                continue;
            }
            if (isNonGlobalExamWithoutDirectPrerequisite(goal, globalAssessmentGoal)) {
                continue;
            }

            if (prerequisitesMet) {
                String reason = projection.extensionPreparations().contains(goal.getId())
                        ? "Required preparation" : "Prerequisites met";
                frontier.add(toFrontierGoal(goal, reason, null));
            }
        }
        frontier = new ArrayList<>(filterVerifiedRecallAvailableMemoryGoals(skillpilotId, frontier,
                () -> cardRelease(projection, masteryMap, facts.prerequisites().get().planningCredits()), projection));
        frontier = new ArrayList<>(orderFrontierByProjection(frontier, projection));
        Map<String, StudyGuidance> studyGuidance = requiredRecommendations || prospectiveFocusGoalIds != null
                ? unitStudyGuidance(learner, projection, subjectContinuation ? List.of() : projectedFocusIds,
                        scope, followedScope, unitOrientationScopes,
                        completedWork, prerequisites, frontier.stream().map(FrontierGoal::id).toList()) : Map.of();
        frontier = applyStudyGuidance(frontier, studyGuidance);

        // Compaction Logic: If frontier is too large, prefer atomic goals for
        // actionable next steps.
        if (compactFrontier && frontier.size() > 20) {
            List<FrontierGoal> atomic = frontier.stream()
                    .filter(g -> "atomic".equals(g.type()))
                    .toList();
            if (!atomic.isEmpty()) {
                List<FrontierGoal> balancedAtomic = compactAtomicFrontierAcrossPlannedScopes(
                        atomic,
                        plannedIds,
                        allStructuralGoals);
                if (!balancedAtomic.isEmpty()) {
                    return applyStudyGuidance(retainStudyPreparation(balancedAtomic, atomic, studyGuidance), studyGuidance);
                }
                return applyStudyGuidance(retainStudyPreparation(
                        atomic.subList(0, Math.min(atomic.size(), 20)), atomic, studyGuidance), studyGuidance);
            }

            List<FrontierGoal> clusters = frontier.stream()
                    .filter(g -> "cluster".equals(g.type()))
                    .toList();
            if (!clusters.isEmpty()) {
                return clusters.subList(0, Math.min(clusters.size(), 20));
            }

            return frontier.subList(0, Math.min(frontier.size(), 20));
        }

        return frontier;
    }

    private List<FrontierGoal> orderFrontierByProjection(
            List<FrontierGoal> frontier,
            GoalProjection projection) {
        if (frontier == null || frontier.size() < 2 || projection == null) {
            return frontier == null ? Collections.emptyList() : frontier;
        }

        return orderFrontierByTargetOrder(frontier, projection.targetGoalIds());
    }

    private List<FrontierGoal> applyStudyGuidance(List<FrontierGoal> frontier, Map<String, StudyGuidance> guidance) {
        if (guidance.isEmpty()) return frontier;
        Map<String, FrontierGoal> available = frontier.stream().collect(Collectors.toMap(
                FrontierGoal::id, goal -> goal, (first, duplicate) -> first, LinkedHashMap::new));
        return orderByStudyGuidance(List.copyOf(available.keySet()), guidance).stream().map(id -> {
            FrontierGoal goal = available.get(id);
            StudyGuidance item = guidance.get(id);
            if (item == null) return goal;
            var preparation = item.recommendedPreparationGoalIds().stream().filter(available::containsKey).toList();
            return goal.withStudyGuidance(preparation.isEmpty() && !item.voluntary()
                    ? null : new StudyGuidance(preparation, item.voluntary()));
        }).toList();
    }

    /** Keep a reachable teaching step in the displayed choices when compaction retains its assessment. */
    private static List<FrontierGoal> retainStudyPreparation(List<FrontierGoal> compact, List<FrontierGoal> available,
            Map<String, StudyGuidance> guidance) {
        if (guidance.isEmpty()) return compact;
        var selected = new ArrayList<>(compact);
        Set<String> selectedIds = compact.stream().map(FrontierGoal::id).collect(Collectors.toSet());
        Set<String> preparationIds = compact.stream().map(FrontierGoal::id).map(guidance::get).filter(Objects::nonNull)
                .flatMap(item -> item.recommendedPreparationGoalIds().stream()).collect(Collectors.toSet());
        for (FrontierGoal goal : compact) {
            var item = guidance.get(goal.id());
            if (item == null || item.recommendedPreparationGoalIds().isEmpty()
                    || item.recommendedPreparationGoalIds().stream().anyMatch(selectedIds::contains)) continue;
            var preparation = available.stream().filter(choice -> item.recommendedPreparationGoalIds().contains(choice.id()))
                    .findFirst().orElse(null);
            if (preparation == null) continue;
            for (int index = selected.size() - 1; index >= 0; index--) {
                String id = selected.get(index).id();
                if (guidance.containsKey(id) || preparationIds.contains(id)) continue;
                selected.set(index, preparation);
                selectedIds.remove(id);
                selectedIds.add(preparation.id());
                break;
            }
        }
        return selected;
    }

    private static List<String> orderByStudyGuidance(List<String> frontier, Map<String, StudyGuidance> guidance) {
        if (guidance.isEmpty()) return frontier;
        Set<String> available = Set.copyOf(frontier);
        Set<String> visited = new HashSet<>();
        Set<String> ordered = new LinkedHashSet<>();
        for (String id : frontier) addStudyGuidedGoal(id, available, guidance, visited, ordered);
        return List.copyOf(ordered);
    }

    private static void addStudyGuidedGoal(String id, Set<String> available, Map<String, StudyGuidance> guidance,
            Set<String> visited, Set<String> ordered) {
        if (!visited.add(id)) return;
        StudyGuidance item = guidance.get(id);
        if (item != null) {
            for (String preparation : item.recommendedPreparationGoalIds()) {
                if (available.contains(preparation)) addStudyGuidedGoal(preparation, available, guidance, visited, ordered);
            }
        }
        ordered.add(id);
    }

    private List<FrontierGoal> orderFrontierByTargetOrder(
            List<FrontierGoal> frontier,
            Collection<String> targetGoalIds) {
        if (frontier == null || frontier.size() < 2 || targetGoalIds == null) {
            return frontier == null ? Collections.emptyList() : frontier;
        }

        Map<String, Integer> presentationRank = new LinkedHashMap<>();
        int rank = 0;
        for (String goalId : targetGoalIds) {
            if (goalId != null && !goalId.isBlank()) {
                presentationRank.putIfAbsent(goalId, rank++);
            }
        }
        List<FrontierGoal> ordered = new ArrayList<>(frontier);
        ordered.sort(Comparator.comparingInt(goal -> presentationRank.getOrDefault(
                goal == null ? null : goal.id(),
                Integer.MAX_VALUE)));
        return ordered;
    }

    static boolean isOrientationGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        String semanticKind = goal.getSemanticKind();
        if (semanticKind != null && !semanticKind.isBlank()) {
            return "orientation".equalsIgnoreCase(semanticKind.trim());
        }
        if (goal.getTags() == null) {
            return false;
        }
        return goal.getTags().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .anyMatch(tag -> "Orientation".equalsIgnoreCase(tag)
                        || "Motivation".equalsIgnoreCase(tag));
    }

    static boolean isOrientationGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        String semanticKind = goal.semanticKind();
        if (semanticKind != null && !semanticKind.isBlank()) {
            return "orientation".equalsIgnoreCase(semanticKind.trim());
        }
        if (goal.tags() == null) {
            return false;
        }
        return goal.tags().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .anyMatch(tag -> "Orientation".equalsIgnoreCase(tag)
                        || "Motivation".equalsIgnoreCase(tag));
    }

    /** One prerequisite policy for simple, rich and prospective plan frontiers. */
    private FrontierPrerequisites frontierPrerequisites(
            Learner learner, GoalProjection projection, Map<String, Double> mastery, Set<String> scope) {
        boolean strictMode = Boolean.TRUE.equals(learner.getStrictMode());
        Set<String> prerequisiteScope = strictMode ? null : projection.targetGoalIds().stream()
                .filter(id -> scope == null || scope.contains(id))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        try {
            Map<String, LearningGoal> lookup = prerequisiteGraph(learner, projection);
            var topology = frontierPrerequisiteCompiler.normalizePrerequisites(lookup);
            topology.validateContext(automaticCompletionTargets(AUTOMATIC_COMPLETION_DEFAULT, projection));
            return new FrontierPrerequisites(lookup, topology, mastery, prerequisiteScope,
                    unitPlanningCredits(learner, projection, lookup).keySet());
        } catch (CompletionCompilationException invalid) {
            // Broken authored definitions never become an empty, successful demand.
            return new FrontierPrerequisites(Map.of(), null, mastery, prerequisiteScope, Set.of());
        }
    }

    private record FrontierPrerequisites(Map<String, LearningGoal> lookup,
            CompletionProfileCompiler.PrerequisiteTopology topology, Map<String, Double> mastery,
            Set<String> scope, Set<String> planningCredits) {
        FrontierPrerequisites within(Set<String> focus) {
            if (scope == null || focus == null) return this;
            Set<String> selected = focus.stream().filter(scope::contains).collect(Collectors.toSet());
            return new FrontierPrerequisites(lookup, topology, mastery, selected, planningCredits);
        }
    }

    private Set<String> extensionAwareFocusScope(GoalProjection projection, List<String> roots) {
        Set<String> scope = computeScope(roots, projection.structuralGoals(), Map.of());
        addRequiredExtensionPreparations(scope, projection);
        return scope;
    }

    private void addRequiredExtensionPreparations(Set<String> scope, GoalProjection projection) {
        Set<String> preparations = projection.extensionPreparations();
        if (scope.isEmpty() || preparations.isEmpty()) return;
        // Canonical contains descendants can include goals from a removed section.
        // Admit those preparations only when an actual in-scope target needs them.
        scope.removeAll(preparations);
        var topology = projection.extensionPreparationTopology();
        if (topology == null) return;
        List<String> atomicTargets = scope.stream()
                .filter(projection.targetGoalIds()::contains)
                .filter(id -> isAtomicGoal(projection.canonicalPrerequisiteGoals().get(id)))
                .toList();
        scope.addAll(topology.matchingTransitivePrerequisites(atomicTargets, preparations));
    }

    private boolean areFrontierPrerequisitesMastered(
            LearningGoal goal, GoalProjection projection, FrontierPrerequisites prerequisites) {
        // Visible navigation clusters can have no atomic descendants in this
        // scope and therefore no node in the validated prerequisite graph.
        if (prerequisites.topology() == null || !prerequisites.lookup().containsKey(goal.getId())) return false;
        Set<String> requiredAtoms = prerequisites.topology().transitivePrerequisites(goal.getId());
        // Derived requirements must also survive actual target/definition emission.
        // Mastery and focus cannot excuse a broken personal learning projection.
        if (projection.learningScope() != null) {
            if (!projection.learningScope().learningAtomicGoalIds().containsAll(requiredAtoms)
                    || !projection.targetGoalIds().containsAll(requiredAtoms)
                    || !projection.visibleGoals().keySet().containsAll(requiredAtoms)) return false;
        } else if (projection.compositionViewApplied()) {
            for (String id : prerequisites.topology().transitiveGoalPrerequisites(goal.getId())) {
                if (!projection.targetGoalIds().contains(id)
                        && !projection.prerequisiteOnlyGoalIds().contains(id)) return false;
            }
        }
        for (String id : requiredAtoms) {
            if (prerequisites.scope() != null && !prerequisites.scope().contains(id)) continue;
            if (prerequisites.mastery().getOrDefault(id, 0.0) < PLANNING_SCOPE_MASTERY_THRESHOLD
                    && !prerequisites.planningCredits().contains(id)) return false;
        }
        return true;
    }

    private boolean isDirectRequirement(
            LearningGoal goal,
            String resolvedRequirementId,
            Map<String, LearningGoal> requirementLookupGoals) {
        if (goal == null || goal.getRequires() == null || resolvedRequirementId == null) {
            return false;
        }
        return goal.getRequires().stream()
                .anyMatch(requirement -> resolvedRequirementId.equals(requirement)
                        || resolvedRequirementId.equals(resolveGoalRef(requirement, requirementLookupGoals)));
    }

    /** References a unit in the learner projection. The focus enters navigation and the scope identifies card actions. */
    private record ProjectedUnit(String landscapeId, String viewId, String focusId, String scopeId, String openingId,
            String title, DeclaredCourseUnits.Unit declaration) {
        private static ProjectedUnit declared(DeclaredCourseUnits.Unit unit, String language) {
            String title = "en".equals(language) && org.springframework.util.StringUtils.hasText(unit.labelEn())
                    ? unit.labelEn() : unit.label();
            return new ProjectedUnit(unit.landscapeId(), null, unit.focusId(), unit.scopeId(), unit.openingId(), title, unit);
        }
    }

    private List<ProjectedUnit> projectedOpenings(GoalProjection projection) {
        List<ProjectedUnit> units = new ArrayList<>();
        if (unitLearningMaterialService != null) {
            for (var binding : unitLearningMaterialService.orientationBindings(projection.compositionViewIds())) {
                units.add(new ProjectedUnit(binding.landscapeId(), binding.viewId(), binding.sectionGoalId(), binding.compositionNodeId(),
                        binding.orientationGoalId(), null, null));
            }
        }
        for (var unit : projection.declaredUnits().units()) {
            if (unit.openingId() != null) units.add(ProjectedUnit.declared(unit, null));
        }
        return units;
    }

    /** Only real, visible atomic openings with a placement in their authored unit can guide entry. */
    private Map<String, Set<String>> guidedUnitOrientationScopes(GoalProjection projection) {
        if (projection == null) return Map.of();
        Map<String, Set<String>> scopes = new LinkedHashMap<>();
        for (var unit : projectedOpenings(projection)) {
            LearningGoal goal = projection.visibleGoals().get(unit.openingId());
            if (!projection.targetGoalIds().contains(unit.openingId()) || !isAtomicGoal(goal) || !isOrientationGoal(goal)) continue;
            Set<String> unitScope;
            if (unit.declaration() != null) {
                unitScope = unit.declaration().atoms();
            } else {
                unitScope = computeScope(resolveProjectedTargetScopeIds(List.of(unit.focusId()), projection),
                        projection.structuralGoals(), Map.of());
                unitScope.removeIf(id -> !unit.landscapeId().equals(landscapeService.getLandscapeIdForGoal(id)));
            }
            if (unitScope.contains(unit.openingId())) scopes.computeIfAbsent(unit.openingId(),
                    ignored -> new LinkedHashSet<>()).addAll(unitScope);
        }
        return scopes;
    }

    private Set<String> unitEntryPlanningCredits(Learner learner, GoalProjection projection) {
        return unitPlanningCreditsEnabled() ? unitPlanningCredits(learner, projection, completionGraph(learner, projection)).keySet() : Set.of();
    }

    /** Within a focused section, offer its first open teaching step. An explicit individual
     * choice, exam route or milestone keeps its own scope. This never changes prerequisites or mastery. */
    private Set<String> deferredUnitStudyGoals(Learner learner, GoalProjection projection,
            List<String> focusIds, Set<String> scope, Set<String> followedScope, Map<String, Set<String>> unitScopes,
            Map<String, Double> effectiveMastery, Set<String> waived, Set<String> credits) {
        if (unitLearningMaterialService == null || unitScopes.isEmpty() || followedScope != null || completionRouteOwnsNavigation(learner)
                || focusIds.stream().allMatch(id -> isAtomicGoal(projection.visibleGoals().get(id)))) return Set.of();
        Set<String> deferred = new HashSet<>();
        for (var binding : unitLearningMaterialService.orientationBindings(projection.compositionViewIds())) {
            if (binding.guidedStudyOrder().isEmpty() || !scope.contains(binding.orientationGoalId())) continue;
            Set<String> unit = unitScopes.getOrDefault(binding.orientationGoalId(), Set.of());
            boolean previousStepOpen = false;
            for (String id : binding.guidedStudyOrder()) {
                if (!unit.contains(id) || !scope.contains(id) || !projection.targetGoalIds().contains(id)
                        || !isAtomicGoal(projection.visibleGoals().get(id))
                        || effectiveMastery.getOrDefault(id, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD
                        || waived.contains(id) || credits.contains(id)) continue;
                if (previousStepOpen && !focusIds.contains(id)) deferred.add(id);
                previousStepOpen = true;
            }
        }
        return deferred;
    }

    /** Reorder only eligible choices. When the suggested goal is blocked, prefer a reachable real foundation in focus. */
    private Map<String, StudyGuidance> unitStudyGuidance(Learner learner, GoalProjection projection,
            List<String> focusIds, Set<String> scope, Set<String> followedScope, Map<String, Set<String>> unitScopes,
            Set<String> completedWork, FrontierPrerequisites prerequisites, List<String> frontier) {
        if (unitLearningMaterialService == null || unitScopes.isEmpty() || followedScope != null || completionRouteOwnsNavigation(learner) || frontier.isEmpty()) {
            return Map.of();
        }
        Set<String> available = Set.copyOf(frontier);
        var preparation = new LinkedHashMap<String, Set<String>>();
        var voluntary = new LinkedHashSet<String>();
        for (var binding : unitLearningMaterialService.orientationBindings(projection.compositionViewIds())) {
            Set<String> unit = unitScopes.get(binding.orientationGoalId());
            if (unit == null) continue;
            var material = unitLearningMaterialService.find(binding.landscapeId(), binding.viewId(), binding.compositionNodeId())
                    .orElse(null);
            if (scope.contains(binding.orientationGoalId())
                    && !usesMigratedAssessmentPlacements(binding.viewId(), projection)
                    && material != null && material.sectionAssessmentPolicy() != null && material.assessmentContract() != null
                    && material.assessmentContract().appliesTo(binding.viewId())) {
                for (String id : material.sectionAssessmentPolicy().voluntaryAssessmentsFor(binding.viewId())) {
                    if (available.contains(id) && unit.contains(id) && releasedSectionAssessment(projection.visibleGoals().get(id))
                            && !focusIds.contains(id)) {
                        voluntary.add(id);
                    }
                }
            }
            for (var recommendation : binding.studyRecommendations()) {
                String after = recommendation.afterGoalId();
                String before = recommendation.beforeGoalId();
                if (!available.contains(after) || !unit.contains(after) || !isAtomicGoal(projection.visibleGoals().get(after))
                        || !unit.contains(before) || !scope.contains(before) || !projection.targetGoalIds().contains(before)
                        || !isAtomicGoal(projection.visibleGoals().get(before)) || completedWork.contains(before)
                        || prerequisites.planningCredits().contains(before)
                        || Mastery.isMastered(prerequisites.mastery().get(before))) continue;
                if (available.contains(before)) {
                    preparation.computeIfAbsent(after, ignored -> new LinkedHashSet<>()).add(before);
                } else if (prerequisites.topology() != null && prerequisites.lookup().containsKey(before)) {
                    Set<String> foundations = prerequisites.topology().transitivePrerequisites(before);
                    for (String candidate : frontier) {
                        if (foundations.contains(candidate) && !isExamGoal(projection.visibleGoals().get(candidate))
                                && !completedWork.contains(candidate) && !prerequisites.planningCredits().contains(candidate)) {
                            preparation.computeIfAbsent(after, ignored -> new LinkedHashSet<>()).add(candidate);
                        }
                    }
                }
            }
        }
        var guidance = new HashMap<String, StudyGuidance>();
        preparation.forEach((id, goals) -> guidance.put(id, new StudyGuidance(List.copyOf(goals), voluntary.contains(id))));
        voluntary.forEach(id -> guidance.putIfAbsent(id, new StudyGuidance(List.of(), true)));
        return guidance;
    }

    private boolean isGatedByUnitOpening(String goalId, List<FrontierGoal> openings,
            Map<String, Set<String>> unitScopes) {
        return openings.stream().anyMatch(opening -> !goalId.equals(opening.id())
                && unitScopes.getOrDefault(opening.id(), Set.of()).contains(goalId));
    }

    /** An opening guides selected work without becoming another exam target or quota item. */
    private boolean isNavigationInFollowedScope(String goalId, Set<String> followedScope,
            Map<String, Set<String>> unitScopes) {
        return followedScope == null || followedScope.contains(goalId)
                || unitScopes.containsKey(goalId) && followedScope.stream().anyMatch(unitScopes.get(goalId)::contains);
    }

    private boolean isDeferredLandscapeOrientation(LearningGoal goal, List<FrontierGoal> openings,
            Map<String, Set<String>> unitScopes) {
        if (!isOrientationGoal(goal) || unitScopes.containsKey(goal.getId())) return false;
        String landscape = landscapeService.getLandscapeIdForGoal(goal.getId());
        return landscape != null && openings.stream().filter(opening -> unitScopes.containsKey(opening.id()))
                .anyMatch(opening -> landscape.equals(landscapeService.getLandscapeIdForGoal(opening.id())));
    }

    private record PendingUnitEntry(String targetGoalId, String openingGoalId, String curriculumDigest,
            Set<String> focusIds, String completionWorkflow) { }

    private void parkUnitEntry(Learner learner, String targetGoalId, String openingGoalId) {
        try {
            learner.setPendingUnitEntry(objectMapper.writeValueAsString(new PendingUnitEntry(targetGoalId,
                    openingGoalId, completionScopeDigest(learner), Set.copyOf(getStoredPlannedGoals(learner.getSkillpilotId())),
                    learner.getCompletionWorkflow())));
        } catch (Exception invalid) { throw new IllegalStateException("Cannot preserve unit entry navigation", invalid); }
    }

    private PendingUnitEntry pendingUnitEntry(Learner learner) {
        if (learner.getPendingUnitEntry() == null) return null;
        try {
            PendingUnitEntry pending = objectMapper.readValue(learner.getPendingUnitEntry(), PendingUnitEntry.class);
            return Objects.equals(pending.curriculumDigest(), completionScopeDigest(learner))
                    && Objects.equals(pending.focusIds(), Set.copyOf(getStoredPlannedGoals(learner.getSkillpilotId())))
                    && Objects.equals(pending.completionWorkflow(), learner.getCompletionWorkflow()) ? pending : null;
        } catch (Exception invalid) { return null; }
    }

    /** A confirmed opening resumes only the exact validated choice the learner already made. */
    private void resumePendingUnitEntry(Learner learner, String completedOpeningId) {
        PendingUnitEntry pending = pendingUnitEntry(learner);
        if (pending == null || !Objects.equals(pending.openingGoalId(), completedOpeningId)) return;
        learner.setPendingUnitEntry(null);
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        if (!projection.targetGoalIds().contains(pending.targetGoalId())
                || !isAtomicGoal(projection.visibleGoals().get(pending.targetGoalId()))) return;
        String nextOpening = requiredUnitOrientationGoalId(learner, projection, pending.targetGoalId());
        String destination = nextOpening == null ? pending.targetGoalId() : nextOpening;
        List<String> focus = new ArrayList<>(getStoredPlannedGoals(learner.getSkillpilotId()));
        if (nextOpening != null && !computeScope(resolveProjectedTargetScopeIds(focus, projection),
                projection.structuralGoals(), Map.of()).contains(nextOpening)
                && !focus.stream().allMatch(id -> isAtomicGoal(projection.visibleGoals().get(id)))) {
            plannedGoalRepository.save(new PlannedGoal(learner, nextOpening));
        }
        // Follow only this selected target's real path. An unrelated sibling
        // unit's opening must not displace one of its required foundations.
        Map<String, Integer> distance = new LinkedHashMap<>();
        ArrayDeque<String> pendingIds = new ArrayDeque<>(List.of(pending.targetGoalId()));
        distance.put(pending.targetGoalId(), 0);
        while (!pendingIds.isEmpty()) {
            String current = pendingIds.removeFirst();
            LearningGoal definition = projection.structuralGoals().get(current);
            for (String reference : definition == null || definition.getRequires() == null ? List.<String>of() : definition.getRequires()) {
                String prerequisite = resolveGoalRef(reference, projection.structuralGoals());
                if (prerequisite != null && distance.putIfAbsent(prerequisite, distance.get(current) + 1) == null) pendingIds.add(prerequisite);
            }
        }
        Set<String> currentScope = computeScope(resolveProjectedTargetScopeIds(
                getStoredPlannedGoals(learner.getSkillpilotId()), projection), projection.structuralGoals(), Map.of());
        List<String> selectedPath = distance.keySet().stream().filter(currentScope::contains)
                .collect(Collectors.toCollection(ArrayList::new));
        if (!selectedPath.contains(pending.targetGoalId())) selectedPath.add(pending.targetGoalId());
        if (nextOpening != null) selectedPath.add(nextOpening);
        // Keep the reduced work path: broadening it to a section can hide a
        // real foundation behind an unrelated opening. Only exclude inferred
        // ancestors outside the selected unit; other prerequisite entries stay.
        Map<String, Set<String>> unitScopes = guidedUnitOrientationScopes(projection);
        Set<String> excludedOpenings = unitScopes.keySet().stream()
                .filter(opening -> !currentScope.contains(opening))
                .filter(opening -> unitScopes.keySet().stream().anyMatch(entered -> currentScope.contains(entered)
                        && unitScopes.get(entered).contains(pending.targetGoalId())
                        && unitScopes.get(opening).contains(entered)))
                .collect(Collectors.toSet());
        Set<String> followedScope = followedLearningScopeIds(learner, projection, selectedPath);
        List<FrontierGoal> frontier = followedScope != null && followedScope.isEmpty() ? List.of()
                : getRichFrontier(learner, projection, richFrontierFacts(learner, projection), false,
                        selectedPath, false, followedScope, false, excludedOpenings);
        boolean available = frontier.stream().anyMatch(goal -> destination.equals(goal.id()) && "atomic".equals(goal.type()));
        if (!available) {
            // Receiving the opening never certifies a curricular prerequisite.
            String foundation = frontier.stream().filter(goal -> "atomic".equals(goal.type()) && !isExamGoal(
                    projection.visibleGoals().get(goal.id()))).map(FrontierGoal::id)
                    .filter(distance::containsKey).min(Comparator.comparingInt(distance::get)).orElse(null);
            if (foundation == null) {
                foundation = frontier.stream().map(FrontierGoal::id).filter(unitScopes::containsKey)
                        .filter(id -> distance.keySet().stream().anyMatch(unitScopes.get(id)::contains))
                        .findFirst().orElse(null);
            }
            if (foundation == null) {
                parkUnitEntry(learner, pending.targetGoalId(), completedOpeningId);
                return;
            }
            learner.setActiveGoalId(foundation);
            learner.setLearningState(LearningState.TEACHING);
            parkUnitEntry(learner, pending.targetGoalId(), foundation);
            return;
        }
        learner.setActiveGoalId(destination);
        learner.setLearningState(LearningState.TEACHING);
        if (nextOpening != null) parkUnitEntry(learner, pending.targetGoalId(), nextOpening);
    }

    /** Read-only entry decision shared by first-party resource links and normal goal selection. */
    @Transactional(readOnly = true)
    public String getRequiredUnitOrientationGoalId(String skillpilotId, String requestedGoalId) {
        Learner learner = getLearner(skillpilotId);
        if (learner.getSelectedCurriculum() == null || requestedGoalId == null || requestedGoalId.isBlank()) return null;
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return requiredUnitOrientationGoalId(learner, projection, requestedGoalId);
    }

    /** The same read decision for a due plan target before its runtime focus is selected. */
    @Transactional(readOnly = true)
    public String getRequiredUnitOrientationGoalIdForFocus(String skillpilotId, String requestedGoalId,
            List<String> focusGoalIds) {
        Learner learner = getLearner(skillpilotId);
        if (learner.getSelectedCurriculum() == null || requestedGoalId == null || requestedGoalId.isBlank()
                || focusGoalIds == null || focusGoalIds.isEmpty()) return null;
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        return requiredUnitOrientationGoalId(learner, projection, requestedGoalId, focusGoalIds);
    }

    private String requiredUnitOrientationGoalId(Learner learner, GoalProjection projection, String requestedGoalId) {
        return requiredUnitOrientationGoalId(learner, projection, requestedGoalId, null);
    }

    private void includeGuidedOpeningsInAtomFocus(Learner learner, GoalProjection projection,
            List<String> focusIds, Set<String> scope) {
        includeGuidedOpeningsInAtomFocus(learner, projection, focusIds, scope, Set.of());
    }

    private void includeGuidedOpeningsInAtomFocus(Learner learner, GoalProjection projection,
            List<String> focusIds, Set<String> scope, Set<String> excludedOpenings) {
        if (focusIds.isEmpty() || !focusIds.stream().allMatch(id -> isAtomicGoal(projection.visibleGoals().get(id)))) return;
        var unitScopes = guidedUnitOrientationScopes(projection);
        if (unitScopes.isEmpty()) return;
        Map<String, Double> mastery = getMastery(learner.getSkillpilotId());
        Set<String> credits = unitEntryPlanningCredits(learner, projection);
        List<String> pending = unitScopes.keySet().stream()
                .filter(id -> !excludedOpenings.contains(id))
                .filter(id -> mastery.getOrDefault(id, 0.0) < PLANNING_SCOPE_MASTERY_THRESHOLD && !credits.contains(id))
                .filter(id -> focusIds.stream().anyMatch(unitScopes.get(id)::contains)).toList();
        pending.stream().filter(id -> pending.stream().noneMatch(parent -> !parent.equals(id)
                && unitScopes.get(parent).contains(id))).forEach(scope::add);
    }

    private String requiredUnitOrientationGoalId(Learner learner, GoalProjection projection, String requestedGoalId,
            List<String> prospectiveFocus) {
        return requiredUnitOrientationGoalId(learner, projection, requestedGoalId, prospectiveFocus, null, null);
    }

    /** Variant for callers that already hold the learner's mastery and unit credits of this request. */
    private String requiredUnitOrientationGoalId(Learner learner, GoalProjection projection, String requestedGoalId,
            List<String> prospectiveFocus, Map<String, Double> knownMastery, Set<String> knownCredits) {
        Map<String, Set<String>> unitScopes = guidedUnitOrientationScopes(projection);
        if (unitScopes.isEmpty()) return null;
        List<String> requestedRoots = resolveProjectedTargetScopeIds(List.of(requestedGoalId), projection);
        Set<String> requestedScope = computeScope(requestedRoots, projection.structuralGoals(), Map.of());
        if (requestedScope.isEmpty()) return null;
        boolean explicitUnit = isCompositionStructureGoalId(requestedGoalId) || projection.declaredUnits().focus(requestedGoalId) != null;
        String requestedFocusId = declaredFocusId(requestedGoalId, projection);
        Set<String> explicitMarkers = explicitUnit ? projectedOpenings(projection).stream()
                .filter(unit -> requestedFocusId.equals(unit.focusId()))
                .map(ProjectedUnit::openingId).collect(Collectors.toSet()) : Set.of();
        boolean explicitOpening = unitScopes.containsKey(requestedGoalId);
        List<String> focusedRoots = prospectiveFocus == null
                ? resolveRuntimeProjectedFocusIds(learner, projection) : prospectiveFocus;
        Set<String> focusedScope = computeScope(resolveProjectedTargetScopeIds(
                focusedRoots, projection), projection.structuralGoals(), Map.of());
        boolean atomFocus = !focusedRoots.isEmpty() && focusedRoots.stream()
                .allMatch(id -> isAtomicGoal(projection.visibleGoals().get(id)));
        Map<String, Double> mastery = knownMastery != null ? knownMastery : getMastery(learner.getSkillpilotId());
        Set<String> credits = knownCredits != null ? knownCredits : unitEntryPlanningCredits(learner, projection);
        List<String> pending = unitScopes.keySet().stream()
                .filter(id -> mastery.getOrDefault(id, 0.0) < PLANNING_SCOPE_MASTERY_THRESHOLD && !credits.contains(id))
                .filter(id -> explicitUnit ? explicitMarkers.contains(id) : explicitOpening ? requestedGoalId.equals(id)
                        : requestedScope.stream().anyMatch(unitScopes.get(id)::contains))
                .filter(id -> explicitUnit || explicitOpening || !focusedScope.contains(requestedGoalId) || focusedScope.contains(id)
                        // An explicit atom focus has no sibling marker. Its owning opening remains available.
                        || atomFocus)
                .toList();
        boolean directForeignFocusEntry = !explicitUnit && !explicitOpening && !focusedScope.contains(requestedGoalId);
        return pending.stream().filter(id -> directForeignFocusEntry
                ? pending.stream().noneMatch(child -> !child.equals(id) && unitScopes.get(id).contains(child))
                : pending.stream().noneMatch(parent -> !parent.equals(id) && unitScopes.get(parent).contains(id)))
                .findFirst().orElse(null);
    }

    private List<FrontierGoal> getRequiredOrientationGoals(
            Learner learner,
            GoalProjection projection,
            Map<String, LearningGoal> visibleGoals,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Double> effectiveMastery,
            Map<String, Double> mastery,
            List<String> projectedFocusIds,
            List<String> plannedIds,
            Set<String> scope,
            Set<String> waived) {
        if (scope == null || scope.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Set<String>> unitScopes = guidedUnitOrientationScopes(projection);
        Set<String> unitCredits = unitScopes.isEmpty() ? Set.of() : unitEntryPlanningCredits(learner, projection);
        List<FrontierGoal> unmasteredOrientationGoals = visibleGoals.values().stream()
                .filter(goal -> projection.targetGoalIds().contains(goal.getId()))
                .filter(goal -> plannedIds.isEmpty() || scope.contains(goal.getId()))
                .filter(LearnerService::isOrientationGoal)
                .filter(goal -> !projection.declaredUnits().rejectedOpenings().contains(goal.getId()))
                // A unit marker without its authored view binding must never
                // become a broad subject introduction in another curriculum.
                .filter(goal -> unitScopes.containsKey(goal.getId()) || unitLearningMaterialService == null
                        || !unitLearningMaterialService.isUnitOrientationGoal(goal.getId()))
                .filter(goal -> effectiveMastery.getOrDefault(goal.getId(), 0.0) < PLANNING_SCOPE_MASTERY_THRESHOLD)
                .filter(goal -> !(unitScopes.containsKey(goal.getId()) ? unitCredits : waived).contains(goal.getId()))
                .map(goal -> toFrontierGoal(goal, "Orientation required", null))
                .toList();
        if (unmasteredOrientationGoals.isEmpty()) {
            return Collections.emptyList();
        }

        // A unit's authored opening is a real completion marker. Existing subject
        // progress or an active ordinary goal never stands in for receiving it.
        // Keep the old broad landscape orientations' continuity policy separately.
        Set<String> openUnitOrientations = unmasteredOrientationGoals.stream().map(FrontierGoal::id)
                .filter(unitScopes::containsKey).collect(Collectors.toSet());
        boolean explicitGuidedEntry = projectedOpenings(projection).stream()
                    .anyMatch(unit -> projectedFocusIds.contains(unit.focusId()))
                || !projectedFocusIds.isEmpty() && projectedFocusIds.stream()
                    .allMatch(id -> isAtomicGoal(visibleGoals.get(id))) && projectedFocusIds.stream()
                    .anyMatch(id -> unitScopes.values().stream().anyMatch(unitScope -> unitScope.contains(id)));
        String projectionStateFilterId = resolveProjectionStateFilterId(learner);
        return unmasteredOrientationGoals.stream()
                .filter(orientationGoal -> {
                    if (unitScopes.containsKey(orientationGoal.id())) {
                        // Within ordinary parent descent the parent's opening comes
                        // first. Explicit child focus contains only the child's marker.
                        return openUnitOrientations.stream().noneMatch(parent -> !parent.equals(orientationGoal.id())
                                && unitScopes.get(parent).contains(orientationGoal.id()));
                    }
                    Set<String> relevantScope = resolveRelevantPlannedScope(
                            orientationGoal.id(),
                            projectedFocusIds,
                            structuralGoals,
                            scope);
                    String landscape = landscapeService.getLandscapeIdForGoal(orientationGoal.id());
                    boolean hasUnitEntryOnThisPath = explicitGuidedEntry && unitScopes.entrySet().stream()
                            .filter(entry -> Objects.equals(landscape, landscapeService.getLandscapeIdForGoal(entry.getKey())))
                            .filter(entry -> scope.stream().anyMatch(entry.getValue()::contains))
                            .anyMatch(entry -> openUnitOrientations.contains(entry.getKey()) || unitCredits.contains(entry.getKey())
                                    || mastery.getOrDefault(entry.getKey(), 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD);
                    if (hasUnitEntryOnThisPath) return false;
                    // A deliberate unit opening is the learner's entry route;
                    // a broader landscape invitation remains voluntary here.
                    if (explicitGuidedEntry && unitScopes.keySet().stream().anyMatch(relevantScope::contains)) return false;
                    return !hasExistingCurricularProgressInScope(
                                    relevantScope,
                                    visibleGoals,
                                    projection.targetGoalIds(),
                                    effectiveMastery,
                                    mastery,
                                    projectionStateFilterId)
                            && !resolvesToCurricularTargetInScope(
                                    learner.getActiveGoalId(),
                                    relevantScope,
                                    visibleGoals,
                                    projection.targetGoalIds(),
                                    projectionStateFilterId);
                })
                .toList();
    }

    private Set<String> resolveRelevantPlannedScope(
            String orientationGoalId,
            List<String> plannedIds,
            Map<String, LearningGoal> structuralGoals,
            Set<String> fallbackScope) {
        LinkedHashSet<String> relevantScope = new LinkedHashSet<>();
        for (String plannedId : plannedIds) {
            Set<String> localScope = computeScope(
                    List.of(plannedId),
                    structuralGoals,
                    Collections.emptyMap());
            if (localScope.contains(orientationGoalId)) {
                relevantScope.addAll(localScope);
            }
        }
        if (relevantScope.isEmpty()) {
            relevantScope.addAll(fallbackScope);
        }
        return relevantScope;
    }

    private boolean hasExistingCurricularProgressInScope(
            Set<String> scope,
            Map<String, LearningGoal> goals,
            Set<String> targetGoalIds,
            Map<String, Double> effectiveMastery,
            Map<String, Double> mastery,
            String stateFilterId) {
        boolean currentProgress = goals.values().stream()
                .filter(goal -> isCurricularTargetInScope(goal, scope, targetGoalIds))
                .anyMatch(goal -> effectiveMastery.getOrDefault(goal.getId(), 0.0) > 0.0);
        if (currentProgress) {
            return true;
        }

        // Partial legacy mappings do not project mastery values, but a positive
        // value still proves that this learner has already started the mapped
        // curricular area. Use that evidence only for continuity of the entry
        // gate; it does not change canonical mastery.
        return mastery.entrySet().stream()
                .filter(entry -> entry.getValue() != null && entry.getValue() > 0.0)
                .anyMatch(entry -> resolvesToCurricularTargetInScope(
                        entry.getKey(),
                        scope,
                        goals,
                        targetGoalIds,
                        stateFilterId));
    }

    private boolean resolvesToCurricularTargetInScope(
            String goalId,
            Set<String> scope,
            Map<String, LearningGoal> goals,
            Set<String> targetGoalIds,
            String stateFilterId) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }

        LearningGoal directGoal = goals.get(goalId);
        if (isCurricularTargetInScope(directGoal, scope, targetGoalIds)) {
            return true;
        }

        for (ResolvedGoalMapping mapping : goalMappingService.findAllByLegacyGoalId(goalId)) {
            if (!("exact".equals(mapping.matchType()) || "partial".equals(mapping.matchType()))) {
                continue;
            }
            if (!mappingMatchesProjectionStateFilter(mapping, stateFilterId)) {
                continue;
            }
            for (String canonicalGoalId : resolveCanonicalProjectionTargetIds(mapping.canonicalGoalId(), goals)) {
                if (isCurricularTargetInScope(goals.get(canonicalGoalId), scope, targetGoalIds)) {
                    return true;
                }
            }
        }

        String provenanceMappedGoalId = findCanonicalGoalIdByLegacySourceId(goalId, goals);
        return provenanceMappedGoalId != null
                && isCurricularTargetInScope(goals.get(provenanceMappedGoalId), scope, targetGoalIds);
    }

    private boolean isCurricularTargetInScope(
            LearningGoal goal,
            Set<String> scope,
            Set<String> targetGoalIds) {
        return goal != null
                && scope.contains(goal.getId())
                && targetGoalIds.contains(goal.getId())
                && isAtomicGoal(goal)
                && !isOrientationGoal(goal);
    }

    private Map<String, Double> computeEffectiveMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();
        for (String goalId : allGoals.keySet()) {
            computeEffectiveMastery(goalId, allGoals, masteryMap, cache, visiting);
        }
        return cache;
    }

    private List<FrontierGoal> compactAtomicFrontierAcrossPlannedScopes(
            List<FrontierGoal> atomicFrontier,
            List<String> plannedIds,
            Map<String, LearningGoal> structuralGoals) {
        if (atomicFrontier == null || atomicFrontier.isEmpty()) {
            return Collections.emptyList();
        }
        if (plannedIds == null || plannedIds.size() <= 1 || structuralGoals == null || structuralGoals.isEmpty()) {
            return Collections.emptyList();
        }

        List<Deque<FrontierGoal>> buckets = new ArrayList<>();
        for (String plannedId : plannedIds) {
            if (plannedId == null || plannedId.isBlank() || !structuralGoals.containsKey(plannedId)) {
                continue;
            }
            Deque<FrontierGoal> bucket = buildSeededAtomicBucketForPlannedId(plannedId, atomicFrontier, structuralGoals);
            if (!bucket.isEmpty()) {
                buckets.add(bucket);
            }
        }

        if (buckets.size() <= 1) {
            return Collections.emptyList();
        }

        int[] quotas = allocateAtomicCompactionQuotas(buckets, 20);
        int[] consumedPerBucket = new int[buckets.size()];

        List<FrontierGoal> compacted = new ArrayList<>(20);
        Set<String> seen = new LinkedHashSet<>();
        while (compacted.size() < 20) {
            boolean addedInRound = false;
            for (int bucketIndex = 0; bucketIndex < buckets.size(); bucketIndex++) {
                if (consumedPerBucket[bucketIndex] >= quotas[bucketIndex]) {
                    continue;
                }
                Deque<FrontierGoal> bucket = buckets.get(bucketIndex);
                while (!bucket.isEmpty()) {
                    FrontierGoal next = bucket.removeFirst();
                    if (!seen.add(next.id())) {
                        continue;
                    }
                    compacted.add(next);
                    consumedPerBucket[bucketIndex]++;
                    addedInRound = true;
                    break;
                }
                if (compacted.size() >= 20) {
                    break;
                }
            }
            if (!addedInRound) {
                break;
            }
        }

        if (compacted.size() >= 20) {
            return compacted;
        }

        for (FrontierGoal goal : atomicFrontier) {
            if (!seen.add(goal.id())) {
                continue;
            }
            compacted.add(goal);
            if (compacted.size() >= 20) {
                break;
            }
        }

        return compacted;
    }

    private Deque<FrontierGoal> buildSeededAtomicBucketForPlannedId(
            String plannedId,
            List<FrontierGoal> atomicFrontier,
            Map<String, LearningGoal> structuralGoals) {
        Set<String> localScope = computeScope(List.of(plannedId), structuralGoals, Collections.emptyMap());
        Deque<FrontierGoal> rawBucket = buildAtomicBucketForScope(localScope, atomicFrontier);
        if (rawBucket.isEmpty()) {
            return rawBucket;
        }

        LearningGoal plannedGoal = structuralGoals.get(plannedId);
        if (plannedGoal == null || plannedGoal.getContains() == null || plannedGoal.getContains().isEmpty()) {
            return rawBucket;
        }

        List<FrontierGoal> rawOrder = new ArrayList<>(rawBucket);
        LinkedHashSet<String> seededIds = new LinkedHashSet<>();
        for (String childRef : plannedGoal.getContains()) {
            String childId = resolveGoalRef(childRef, structuralGoals);
            if (childId == null) {
                continue;
            }
            Set<String> childScope = computeScope(List.of(childId), structuralGoals, Collections.emptyMap());
            for (FrontierGoal goal : rawOrder) {
                if (childScope.contains(goal.id())) {
                    seededIds.add(goal.id());
                    break;
                }
            }
        }

        for (String childRef : plannedGoal.getContains()) {
            String childId = resolveGoalRef(childRef, structuralGoals);
            if (childId == null) {
                continue;
            }
            Set<String> childScope = computeScope(List.of(childId), structuralGoals, Collections.emptyMap());
            seedPrioritySkillGoal(rawOrder, childScope, structuralGoals, seededIds, true);
            seedPrioritySkillGoal(rawOrder, childScope, structuralGoals, seededIds, false);
        }

        if (seededIds.isEmpty()) {
            return rawBucket;
        }

        Deque<FrontierGoal> seededBucket = new ArrayDeque<>();
        Set<String> seen = new LinkedHashSet<>();
        for (String goalId : seededIds) {
            for (FrontierGoal goal : rawOrder) {
                if (goal.id().equals(goalId) && seen.add(goal.id())) {
                    seededBucket.addLast(goal);
                    break;
                }
            }
        }
        for (FrontierGoal goal : rawOrder) {
            if (seen.add(goal.id())) {
                seededBucket.addLast(goal);
            }
        }
        return seededBucket;
    }

    private void seedPrioritySkillGoal(
            List<FrontierGoal> rawOrder,
            Set<String> childScope,
            Map<String, LearningGoal> structuralGoals,
            LinkedHashSet<String> seededIds,
            boolean productiveFirst) {
        for (FrontierGoal goal : rawOrder) {
            if (!childScope.contains(goal.id())) {
                continue;
            }
            LearningGoal goalDefinition = structuralGoals.get(goal.id());
            if (matchesPrioritySkillSeed(goalDefinition, productiveFirst)) {
                seededIds.add(goal.id());
                return;
            }
        }
    }

    private boolean matchesPrioritySkillSeed(LearningGoal goal, boolean productiveFirst) {
        if (goal == null || goal.getTags() == null || goal.getTags().isEmpty()) {
            return false;
        }
        if (productiveFirst) {
            return goal.getTags().contains("skill:mediation")
                    || goal.getTags().contains("skill:writing")
                    || goal.getTags().contains("skill:schreiben");
        }
        return goal.getTags().contains("skill:intercultural");
    }

    private Deque<FrontierGoal> buildAtomicBucketForScope(Set<String> scope, List<FrontierGoal> atomicFrontier) {
        Deque<FrontierGoal> bucket = new ArrayDeque<>();
        if (scope == null || scope.isEmpty() || atomicFrontier == null || atomicFrontier.isEmpty()) {
            return bucket;
        }
        for (FrontierGoal goal : atomicFrontier) {
            if (scope.contains(goal.id())) {
                bucket.addLast(goal);
            }
        }
        return bucket;
    }

    private int[] allocateAtomicCompactionQuotas(List<Deque<FrontierGoal>> buckets, int limit) {
        int[] quotas = new int[buckets.size()];
        if (buckets.isEmpty() || limit <= 0) {
            return quotas;
        }

        int totalSize = buckets.stream().mapToInt(Deque::size).sum();
        if (totalSize <= limit) {
            for (int i = 0; i < buckets.size(); i++) {
                quotas[i] = buckets.get(i).size();
            }
            return quotas;
        }

        int preferredBasePerBucket = buckets.size() <= 2 ? 5 : 4;
        int basePerBucket = Math.max(1, Math.min(preferredBasePerBucket, limit / buckets.size()));
        double[] remainders = new double[buckets.size()];
        int assigned = 0;
        int totalRemainingCapacity = 0;
        for (int i = 0; i < buckets.size(); i++) {
            int bucketSize = buckets.get(i).size();
            if (bucketSize <= 0) {
                continue;
            }
            int quota = Math.min(basePerBucket, bucketSize);
            quotas[i] = quota;
            assigned += quota;
            totalRemainingCapacity += Math.max(0, bucketSize - quota);
        }

        if (assigned >= limit || totalRemainingCapacity <= 0) {
            while (assigned > limit) {
                int bestIndex = -1;
                for (int i = 0; i < quotas.length; i++) {
                    if (quotas[i] <= 1) {
                        continue;
                    }
                    if (bestIndex < 0 || quotas[i] > quotas[bestIndex]) {
                        bestIndex = i;
                    }
                }
                if (bestIndex < 0) {
                    break;
                }
                quotas[bestIndex]--;
                assigned--;
            }
            return quotas;
        }

        for (int i = 0; i < buckets.size(); i++) {
            int bucketSize = buckets.get(i).size();
            int remainingCapacity = Math.max(0, bucketSize - quotas[i]);
            if (remainingCapacity <= 0) {
                continue;
            }
            double exactAdditionalQuota = ((limit - assigned) * (double) remainingCapacity) / totalRemainingCapacity;
            int additionalQuota = (int) Math.floor(exactAdditionalQuota);
            additionalQuota = Math.min(additionalQuota, remainingCapacity);
            quotas[i] += additionalQuota;
            remainders[i] = exactAdditionalQuota - Math.floor(exactAdditionalQuota);
        }

        assigned = Arrays.stream(quotas).sum();

        while (assigned > limit) {
            int bestIndex = -1;
            for (int i = 0; i < quotas.length; i++) {
                if (quotas[i] <= 1) {
                    continue;
                }
                if (bestIndex < 0 || remainders[i] < remainders[bestIndex]) {
                    bestIndex = i;
                }
            }
            if (bestIndex < 0) {
                break;
            }
            quotas[bestIndex]--;
            assigned--;
        }

        while (assigned < limit) {
            int bestIndex = -1;
            for (int i = 0; i < quotas.length; i++) {
                if (quotas[i] >= buckets.get(i).size()) {
                    continue;
                }
                if (bestIndex < 0
                        || remainders[i] > remainders[bestIndex]
                        || (Double.compare(remainders[i], remainders[bestIndex]) == 0
                                && buckets.get(i).size() > buckets.get(bestIndex).size())) {
                    bestIndex = i;
                }
            }
            if (bestIndex < 0) {
                break;
            }
            quotas[bestIndex]++;
            assigned++;
        }

        return quotas;
    }

    private double computeEffectiveMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<Double> childValues = new ArrayList<>();
            for (String childId : goal.getContains()) {
                if (!allGoals.containsKey(childId)) {
                    continue;
                }
                childValues.add(computeEffectiveMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private Map<String, Double> computeEffectivePrereqMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap) {
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();
        for (String goalId : allGoals.keySet()) {
            computeEffectivePrereqMastery(goalId, allGoals, masteryMap, cache, visiting);
        }
        return cache;
    }

    private Map<String, Double> computeEffectivePrereqMastery(Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Set<String> prerequisiteScope) {
        if (prerequisiteScope == null) return computeEffectivePrereqMastery(allGoals, masteryMap);
        Map<String, Double> cache = new HashMap<>();
        Set<String> visiting = new HashSet<>();
        for (String goalId : prerequisiteScope) {
            computeScopedPrerequisiteMastery(goalId, allGoals, masteryMap, prerequisiteScope, cache, visiting);
        }
        cache.keySet().retainAll(prerequisiteScope);
        return cache;
    }

    /** Atoms_F(C) = global contains descendants of C intersected with F. */
    private double computeScopedPrerequisiteMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Set<String> scope, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) return cached;
        if (!visiting.add(goalId)) return 0.0;
        LearningGoal goal = allGoals.get(goalId);
        double effective = 1.0;
        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            // Traverse global contains paths even through a non-target cluster;
            // an explicitly targeted descendant can still belong to F.
            List<String> children = goal.getContains().stream().map(ref -> resolveGoalRef(ref, allGoals))
                    .filter(Objects::nonNull).toList();
            // Preserve the existing global core/extension basis before intersecting
            // with F, so optimistic evaluation never adds a stricter obligation.
            boolean hasCoreChild = children.stream().anyMatch(id -> isCoreForPrereqs(allGoals.get(id)));
            for (String childId : children) {
                if (hasCoreChild && !isCoreForPrereqs(allGoals.get(childId))) continue;
                effective = Math.min(effective, computeScopedPrerequisiteMastery(
                        childId, allGoals, masteryMap, scope, cache, visiting));
            }
        } else if (scope.contains(goalId)) {
            effective = masteryMap.getOrDefault(goalId, 0.0);
        }
        // No atomic descendant in F means no local obligation. No result is persisted.
        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private double computeEffectivePrereqMastery(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, Double> masteryMap, Map<String, Double> cache, Set<String> visiting) {
        Double cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (visiting.contains(goalId)) {
            return masteryMap.getOrDefault(goalId, 0.0);
        }
        visiting.add(goalId);

        LearningGoal goal = allGoals.get(goalId);
        double mastery = masteryMap.getOrDefault(goalId, 0.0);
        double effective = mastery;

        if (goal != null && goal.getContains() != null && !goal.getContains().isEmpty()) {
            List<String> childIds = new ArrayList<>();
            boolean hasCoreChild = false;
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                childIds.add(childId);
                LearningGoal child = allGoals.get(childId);
                if (child != null && isCoreForPrereqs(child)) {
                    hasCoreChild = true;
                }
            }

            List<Double> childValues = new ArrayList<>();
            for (String childId : childIds) {
                LearningGoal child = allGoals.get(childId);
                if (child == null) {
                    continue;
                }
                if (hasCoreChild && !isCoreForPrereqs(child)) {
                    continue;
                }
                childValues.add(computeEffectivePrereqMastery(childId, allGoals, masteryMap, cache, visiting));
            }
            if (!childValues.isEmpty()) {
                effective = childValues.stream().min(Double::compareTo).orElse(mastery);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, effective);
        return effective;
    }

    private boolean isCoreForPrereqs(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }
        return tags.contains("GK");
    }

    @Transactional
    public UnifiedLearnerStateResponse getLearnerState(String skillpilotId) {
        return getLearnerState(skillpilotId, null, true, true);
    }

    /**
     * Side-effect-free learner projection for read-only coach tools.
     *
     * <p>Unlike the cockpit projection, this method never performs a legacy
     * personalization migration, clears a stale active goal, or activates an
     * autopilot goal. Such changes require an explicitly versioned write tool.</p>
     */
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public UnifiedLearnerStateResponse getCoachLearnerState(String skillpilotId) {
        return getLearnerState(skillpilotId, null, false, true);
    }

    @Autowired(required = false)
    private UnitLearningMaterialService unitLearningMaterialService;

    /** Read enrichment of a confirmed goal in the same learner revision as the coach response. */
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ActiveGoalContext getCoachActiveGoalContext(String skillpilotId, String goalId, long stateVersion,
            String language, Set<String> publishedFrontierIds, boolean includeActivities) {
        Learner learner = getLearner(skillpilotId);
        if (learner.getCoachStateRevision() != stateVersion
                || !org.springframework.util.StringUtils.hasText(learner.getSelectedCurriculum())) return null;

        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String activeId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), projection.visibleGoals(), false);
        if (goalId == null) {
            // A stored active goal that is no longer visible (a retired assessment, a goal outside the
            // Personal Curriculum) is reported as no active goal; the focused unit is then described as usual.
            return includeActivities && activeId == null
                    ? getCoachFocusedUnitContext(learner, projection, publishedFrontierIds, language) : null;
        }
        if (!goalId.equals(activeId) || !projection.targetGoalIds().contains(activeId)) return null;
        LearningGoal goal = projection.visibleGoals().get(activeId);
        if (!isAtomicGoal(goal)) return null;

        String phase = goal.getPhase();
        if (phase != null && !phase.matches("E|Q[1-4]")) phase = null;
        if (isExamGoal(goal)) {
            return new ActiveGoalContext(activeId, phase, List.of(), List.of(), null, List.of());
        }

        Set<String> focus = new LinkedHashSet<>(resolveRuntimeProjectedFocusIds(learner, projection));
        List<List<CompositionViewService.CompositionStructureResolution>> paths = compositionViewService == null
                ? List.of()
                : projection.compositionViewIds().stream().flatMap(viewId -> projectedFocusPaths(viewId, activeId, projection).stream()).toList();
        return buildCoachUnitContext(learner, goal, phase, projection, focus, paths,
                publishedFrontierIds, includeActivities, landscapeService.getLandscapeIdForGoal(activeId), language);
    }

    private ActiveGoalContext getCoachFocusedUnitContext(Learner learner, GoalProjection projection,
            Set<String> publishedFrontierIds, String language) {
        if (unitLearningMaterialService == null) return null;
        var focusedSection = explicitCoachUnitFocus(learner, projection);
        if (focusedSection == null) return null;
        String focusId = focusedSection.syntheticGoalId();
        Map<String, Object> view = compositionViewService.findViewById(focusedSection.viewId());
        if (view == null || !(view.get("landscapeId") instanceof String landscapeId)) return null;
        if (unitLearningMaterialService.find(landscapeId, focusedSection.viewId(), focusedSection.nodeId()).isEmpty()) return null;
        List<CompositionViewService.CompositionStructureResolution> path = new ArrayList<>();
        path.add(focusedSection);
        path.addAll(projectedFocusAncestors(focusedSection.viewId(), focusId, projection));
        return buildCoachUnitContext(learner, null, null, projection, Set.of(focusId), List.of(path),
                publishedFrontierIds, true, landscapeId, language);
    }

    private String explicitUnitFocusId(Learner learner, GoalProjection projection) {
        var focus = resolveProjectedTargetFocusIds(getStoredPlannedGoals(learner.getSkillpilotId()), projection);
        return focus.size() == 1 && isProjectedTargetFocus(focus.getFirst(), projection) ? focus.getFirst() : null;
    }

    private CompositionViewService.CompositionStructureResolution explicitCoachUnitFocus(Learner learner, GoalProjection projection) {
        String focusId = explicitUnitFocusId(learner, projection);
        if (focusId == null || compositionViewService == null) return null;
        var focusedSection = projectedStructure(focusId, projection);
        return focusedSection != null && projection.compositionViewIds().contains(focusedSection.viewId())
                ? focusedSection : null;
    }

    private ActiveGoalContext buildCoachUnitContext(Learner learner, LearningGoal goal, String phase,
            GoalProjection projection, Set<String> focus, List<List<CompositionViewService.CompositionStructureResolution>> paths,
            Set<String> publishedFrontierIds, boolean includeActivities, String landscapeId, String language) {
        String activeId = goal == null ? null : goal.getId();
        List<CompositionViewService.CompositionStructureResolution> path = preferredCoachUnitPath(paths, focus);
        List<String> sectionTitles = path.stream().map(section -> coachSectionTitle(section, projection, language))
                .filter(Objects::nonNull).toList();
        List<ActiveGoalContext.UnitPath> unitPaths = sectionTitles.isEmpty() ? List.of()
                : List.of(new ActiveGoalContext.UnitPath(sectionTitles, coachFocusDistance(path, focus) < Integer.MAX_VALUE,
                        paths.stream().distinct().limit(2).count() > 1));

        List<ActiveGoalContext.Prerequisite> prerequisites = goal == null ? List.of()
                : coachDirectPrerequisites(learner, goal, projection, language);
        ActiveGoalContext.UnitIntroduction introduction = null;
        ActiveGoalContext.PracticeExercise practiceExercise = null;
        Map<String, ActiveGoalContext.Activity> activities = new LinkedHashMap<>();
        if (includeActivities && (goal == null || !isSrsGoal(goal))) {
            // Unit cards come from the unit hierarchy (issue #85), independent of material files.
            addCoachUnitCardActivities(activities, learner, projection, activeId, publishedFrontierIds, language);
        }
        if (unitLearningMaterialService != null) {
            for (var section : path) {
                var material = unitLearningMaterialService.find(landscapeId, section.viewId(), section.nodeId());
                if (material.isEmpty()) continue;
                String title = coachSectionTitle(section, projection, language);
                if (title == null) continue;
                var intro = material.get().introduction(language);
                String openingId = material.get().orientationGoalId();
                String entryState = null;
                if (openingId != null) {
                    if (activeId != null && !openingId.equals(activeId)) entryState = "learning";
                    else {
                        Map<String, Double> progress = getMastery(learner.getSkillpilotId());
                        Set<String> credits = unitEntryPlanningCredits(learner, projection);
                        entryState = progress.getOrDefault(openingId, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD
                                || credits.contains(openingId) ? "return" : "orientation";
                    }
                }
                introduction = new ActiveGoalContext.UnitIntroduction(title, intro.question(), intro.promise(),
                        openingId, entryState, intro.scene(), intro.imageUrl(), intro.imageAlt(), intro.topics());
                if (includeActivities) {
                    if (goal != null && !isSrsGoal(goal) && !isOrientationGoal(goal)) {
                        practiceExercise = material.get().exercise(activeId, language).orElse(null);
                    }
                    // A deck goal named by the material keeps its plain route; unit practice of it
                    // is offered above when the card context contains its cards.
                    addCoachUnitActivity(activities, material.get().flashcardGoalId(), title, activeId,
                            projection, publishedFrontierIds, language, null);
                    String assessmentId = material.get().assessmentGoalId();
                    if (assessmentId != null && projection.targetGoalIds().contains(assessmentId)) {
                        // A topic may link a cross-topic assessment. Describe its own placement.
                        String placement = projectedFocusAncestors(section.viewId(), assessmentId, projection).stream()
                                .limit(2).map(parent -> coachSectionTitle(parent, projection, language))
                                .filter(Objects::nonNull).collect(Collectors.joining(" · "));
                        if (!placement.isBlank()) {
                            addCoachUnitActivity(activities, assessmentId, placement, activeId,
                                    projection, publishedFrontierIds, language, null);
                        }
                    }
                }
                break;
            }
        }
        return new ActiveGoalContext(activeId, phase, unitPaths, prerequisites, introduction,
                activities.values().stream().limit(4).toList(), practiceExercise);
    }

    private static List<CompositionViewService.CompositionStructureResolution> preferredCoachUnitPath(
            List<List<CompositionViewService.CompositionStructureResolution>> paths, Set<String> focus) {
        return paths.stream().min(Comparator.comparingInt(candidate -> coachFocusDistance(candidate, focus)))
                .orElseGet(List::of);
    }

    private static int coachFocusDistance(List<CompositionViewService.CompositionStructureResolution> path, Set<String> focus) {
        for (int index = 0; index < path.size(); index++) {
            if (focus.contains(path.get(index).syntheticGoalId())) return index;
        }
        return Integer.MAX_VALUE;
    }

    private List<ActiveGoalContext.Prerequisite> coachDirectPrerequisites(Learner learner, LearningGoal goal,
            GoalProjection projection, String language) {
        if (goal.getRequires() == null || goal.getRequires().isEmpty()) return List.of();
        boolean hasBoundUnits = unitPlanningCreditsEnabled() && unitLearningMaterialService != null
                && !unitLearningMaterialService.assessmentBindings(projection.compositionViewIds()).isEmpty();
        Set<String> planningCredits = hasBoundUnits
                ? unitPlanningCredits(learner, projection, prerequisiteGraph(learner, projection)).keySet() : Set.of();
        Set<String> savedMastery = masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId()).stream()
                .filter(result -> result.getValue() >= PLANNING_SCOPE_MASTERY_THRESHOLD)
                .map(Mastery::getGoalKey).collect(Collectors.toSet());
        return goal.getRequires().stream().map(reference -> resolveGoalRef(reference, projection.structuralGoals()))
                .filter(Objects::nonNull).distinct().filter(projection.targetGoalIds()::contains)
                .map(projection.visibleGoals()::get).filter(Objects::nonNull)
                .filter(prerequisite -> isAtomicGoal(prerequisite) && !isOrientationGoal(prerequisite)
                        && !isExamGoal(prerequisite) && !isSrsGoal(prerequisite))
                .limit(5)
                .map(prerequisite -> new ActiveGoalContext.Prerequisite(prerequisite.getId(), coachGoalTitle(prerequisite, language),
                        savedMastery.contains(prerequisite.getId()), planningCredits.contains(prerequisite.getId())))
                .filter(prerequisite -> prerequisite.title() != null && !prerequisite.title().isBlank()).toList();
    }

    private String coachSectionTitle(CompositionViewService.CompositionStructureResolution section,
            GoalProjection projection, String language) {
        LearningGoal goal = projection.visibleGoals().get(section.syntheticGoalId());
        if (section.syntheticGoalId().equals(section.nodeId()) && goal == null) return null;
        if ("en".equals(language) && goal != null && org.springframework.util.StringUtils.hasText(goal.getTitleEn())) {
            return goal.getTitleEn();
        }
        return org.springframework.util.StringUtils.hasText(section.label()) ? section.label() : null;
    }

    private String coachGoalTitle(LearningGoal goal, String language) {
        return "en".equals(language) && org.springframework.util.StringUtils.hasText(goal.getTitleEn())
                ? goal.getTitleEn() : goal.getTitle();
    }

    /** One unit-practice activity per deck goal with cards in the box of the learner's card context. */
    private void addCoachUnitCardActivities(Map<String, ActiveGoalContext.Activity> activities, Learner learner,
            GoalProjection projection, String activeGoalId, Set<String> publishedFrontierIds, String language) {
        Map<String, Double> mastery = ordinaryGoalMastery(learner);
        UnitCardBox box = unitCardBox(learner, projection, language, mastery, unitEntryPlanningCredits(learner, projection));
        if (box == null) return;
        String title = box.context().section().title();
        box.tallies().forEach((deckId, tally) -> {
            if (tally.boxCards() > 0) {
                addCoachUnitActivity(activities, deckId, title, activeGoalId, projection, publishedFrontierIds,
                        language, box.context().section().scopeId());
            }
        });
    }

    private void addCoachUnitActivity(Map<String, ActiveGoalContext.Activity> activities, String goalId, String sectionTitle,
            String activeGoalId, GoalProjection projection, Set<String> publishedFrontierIds, String language,
            String practiceScopeId) {
        if (goalId == null || sectionTitle == null || !projection.targetGoalIds().contains(goalId)) return;
        LearningGoal goal = projection.visibleGoals().get(goalId);
        if (goal == null || !isAtomicGoal(goal)) return;
        boolean memory = isSrsGoal(goal) && org.springframework.util.StringUtils.hasText(getVocabularySource(goal, language));
        if (!memory && (!isExamGoal(goal) || !isExamDataReadyForHardCheck(goal.getExamData()))) return;
        String title = coachGoalTitle(goal, language);
        if (!org.springframework.util.StringUtils.hasText(title)) return;
        String route = memory && practiceScopeId != null ? "unitPractice" : memory && goalId.equals(activeGoalId)
                ? "activeMemory" : publishedFrontierIds.contains(goalId) ? "frontier" : "cockpit";
        activities.putIfAbsent(goalId,
                new ActiveGoalContext.Activity(goalId, title, memory ? "memory" : "assessment", sectionTitle, route,
                        practiceScopeId));
    }

    /**
     * Returns the reviewed skill-landscape map for the current orientation
     * goal, filtered through the learner's current target projection.
     *
     * <p>Graph structure determines which authored paths are actually present;
     * practical contexts always come from reviewed curriculum metadata. If
     * either side is missing or inconsistent, the method fails closed.</p>
     */
    @Transactional(readOnly = true)
    public OrientationOutlook getCoachOrientationOutlook(String skillpilotId, String communicationLocale) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return null;
        }

        GoalProjection projection = getGoalProjection(curriculumId, learner.getPersonalCurriculum());
        Map<String, LearningGoal> visibleGoals = projection.visibleGoals();
        String activeGoalId = resolveGoalIdInVisibleGoals(learner.getActiveGoalId(), visibleGoals, false);
        LearningGoal orientationGoal = activeGoalId == null ? null : visibleGoals.get(activeGoalId);
        if (orientationGoal == null
                || !projection.targetGoalIds().contains(activeGoalId)
                || !isOrientationGoal(orientationGoal)) {
            return null;
        }

        Map<String, Object> extendedData = orientationGoal.getExtendedData();
        Object rawOutlook = extendedData == null ? null : extendedData.get("orientationOutlook");
        if (!(rawOutlook instanceof Map<?, ?> outlookMap)) {
            return null;
        }
        Object rawPaths = outlookMap.get("paths");
        if (!(rawPaths instanceof List<?> authoredPaths) || authoredPaths.isEmpty()) {
            return null;
        }

        Map<String, LearningGoal> structuralGoals = projection.structuralGoals();
        Set<String> permittedGoalIds = new LinkedHashSet<>(projection.targetGoalIds());
        List<String> focusIds = resolveEffectiveProjectedFocusIds(
                learner,
                projection);
        List<String> plannedScopeIds = resolveProjectedTargetScopeIds(focusIds, projection);
        if (!plannedScopeIds.isEmpty()) {
            Set<String> plannedScope = computeScope(
                    plannedScopeIds,
                    structuralGoals,
                    Collections.emptyMap());
            permittedGoalIds.retainAll(plannedScope);
        }

        boolean english = communicationLocale != null
                && communicationLocale.toLowerCase(Locale.ROOT).startsWith("en");
        List<OrientationOutlook.Path> paths = new ArrayList<>();
        Set<String> seenPathIds = new LinkedHashSet<>();
        for (Object rawPath : authoredPaths) {
            if (paths.size() >= 4 || !(rawPath instanceof Map<?, ?> pathMap)) {
                continue;
            }
            String pathId = authoredString(pathMap, "id");
            String title = localizedAuthoredString(pathMap, "title", english);
            String learningOutlook = localizedAuthoredString(pathMap, "learningOutlook", english);
            List<String> practicalContexts = localizedAuthoredStrings(
                    pathMap,
                    "practicalContexts",
                    english,
                    3);
            if (pathId == null || title == null || learningOutlook == null
                    || practicalContexts.isEmpty() || !seenPathIds.add(pathId)) {
                continue;
            }

            Set<String> pathDescendantIds = new LinkedHashSet<>();
            for (String rootRef : authoredStrings(pathMap, "subtreeRootIds", 12)) {
                String rootId = resolveGoalRef(rootRef, structuralGoals);
                if (rootId == null) {
                    continue;
                }
                pathDescendantIds.add(rootId);
                collectResolvedDescendants(rootId, structuralGoals, pathDescendantIds, new HashSet<>());
            }
            pathDescendantIds.retainAll(permittedGoalIds);

            List<String> relatedGoalIds = new ArrayList<>();
            for (String entryRef : authoredStrings(pathMap, "entryGoalIds", 6)) {
                String entryId = resolveGoalRef(entryRef, structuralGoals);
                LearningGoal entryGoal = entryId == null ? null : structuralGoals.get(entryId);
                if (entryGoal == null
                        || !pathDescendantIds.contains(entryId)
                        || projection.prerequisiteOnlyGoalIds().contains(entryId)
                        || !isAtomicGoal(entryGoal)
                        || !hasAuthoredAtomicRequiresPath(entryGoal, activeGoalId, structuralGoals)) {
                    continue;
                }
                relatedGoalIds.add(entryId);
            }
            if (relatedGoalIds.isEmpty()) {
                continue;
            }

            List<OrientationOutlook.GoalReference> representativeGoals = new ArrayList<>();
            for (String milestoneRef : authoredStrings(pathMap, "milestoneGoalIds", 6)) {
                String milestoneId = resolveGoalRef(milestoneRef, structuralGoals);
                if (milestoneId == null || !pathDescendantIds.contains(milestoneId)) {
                    continue;
                }
                LearningGoal milestone = structuralGoals.get(milestoneId);
                if (!isAtomicGoal(milestone)
                        || projection.prerequisiteOnlyGoalIds().contains(milestoneId)) {
                    continue;
                }
                String milestoneTitle = english && milestone.getTitleEn() != null
                        && !milestone.getTitleEn().isBlank()
                                ? milestone.getTitleEn().trim()
                                : milestone.getTitle();
                if (milestoneTitle != null && !milestoneTitle.isBlank()) {
                    representativeGoals.add(new OrientationOutlook.GoalReference(
                            milestoneId,
                            milestoneTitle.trim()));
                }
                if (representativeGoals.size() >= 4) {
                    break;
                }
            }
            if (representativeGoals.isEmpty()) {
                continue;
            }
            paths.add(new OrientationOutlook.Path(
                    pathId,
                    title,
                    learningOutlook,
                    List.copyOf(practicalContexts),
                    List.copyOf(representativeGoals),
                    List.copyOf(relatedGoalIds)));
        }
        return paths.size() < 2 ? null : new OrientationOutlook(activeGoalId, List.copyOf(paths));
    }

    private boolean hasAuthoredAtomicRequiresPath(
            LearningGoal goal,
            String requiredGoalId,
            Map<String, LearningGoal> structuralGoals) {
        if (!isAtomicGoal(goal) || !isAtomicGoal(structuralGoals.get(requiredGoalId))) {
            return false;
        }
        Set<String> visited = new HashSet<>();
        Deque<LearningGoal> pending = new ArrayDeque<>();
        pending.add(goal);
        while (!pending.isEmpty()) {
            LearningGoal current = pending.removeFirst();
            if (!visited.add(current.getId()) || current.getRequires() == null) {
                continue;
            }
            for (String requirementRef : current.getRequires()) {
                String prerequisiteId = resolveGoalRef(requirementRef, structuralGoals);
                LearningGoal prerequisite = prerequisiteId == null ? null : structuralGoals.get(prerequisiteId);
                if (!isAtomicGoal(prerequisite)) {
                    continue;
                }
                if (requiredGoalId.equals(prerequisiteId)) {
                    return true;
                }
                pending.addLast(prerequisite);
            }
        }
        return false;
    }

    private void collectResolvedDescendants(
            String goalId,
            Map<String, LearningGoal> structuralGoals,
            Set<String> result,
            Set<String> visiting) {
        if (!visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = structuralGoals.get(goalId);
        if (goal != null && goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, structuralGoals);
                if (childId != null && result.add(childId)) {
                    collectResolvedDescendants(childId, structuralGoals, result, visiting);
                }
            }
        }
        visiting.remove(goalId);
    }

    private String localizedAuthoredString(Map<?, ?> source, String key, boolean english) {
        String localized = authoredString(source, english ? key + "En" : key);
        return localized != null ? localized : authoredString(source, key);
    }

    private List<String> localizedAuthoredStrings(
            Map<?, ?> source,
            String key,
            boolean english,
            int limit) {
        List<String> localized = authoredStrings(source, english ? key + "En" : key, limit);
        return localized.isEmpty() ? authoredStrings(source, key, limit) : localized;
    }

    private String authoredString(Map<?, ?> source, String key) {
        Object value = source.get(key);
        if (!(value instanceof String text) || text.isBlank()) {
            return null;
        }
        return text.trim();
    }

    private List<String> authoredStrings(Map<?, ?> source, String key, int limit) {
        Object value = source.get(key);
        if (!(value instanceof List<?> values)) {
            return List.of();
        }
        return values.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(String::trim)
                .filter(text -> !text.isBlank())
                .distinct()
                .limit(limit)
                .toList();
    }

    /**
     * Returns backend-authorized Level-3 focus choices for an explicit focus
     * change. Genuine learner-facing ancestors that add unmastered targets are
     * published nearest-first; the existing top-level choices follow so a
     * deliberate lateral/root switch remains possible.
     */
    @Transactional(readOnly = true)
    public List<FrontierGoal> getScopeNavigationOptions(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return Collections.emptyList();
        }
        GoalProjection projection = getGoalProjection(
                curriculumId,
                learner.getPersonalCurriculum());
        List<String> currentFocusIds = resolveEffectiveProjectedFocusIds(
                learner,
                projection);
        Map<String, Double> mastery = getMastery(skillpilotId);

        LinkedHashMap<String, FrontierGoal> options = new LinkedHashMap<>();
        buildBroaderFocusOptions(projection, currentFocusIds, mastery)
                .forEach(option -> options.putIfAbsent(option.id(), option));
        for (DeclaredCourseUnits.Unit unit : projection.declaredUnits().units()) {
            if (currentFocusIds.contains(unit.focusId())) continue;
            FrontierGoal option = focusNavigationGoal(unit.focusId(), projection, "Module");
            if (option != null) options.putIfAbsent(option.id(), option);
        }

        Set<String> currentTargetAtoms = projectedAtomicTargetIds(
                currentFocusIds,
                projection);
        for (FrontierGoal rootOption : getInitialScopeOptions(curriculumId, projection)) {
            if (rootOption == null || rootOption.id() == null || rootOption.id().isBlank()) {
                continue;
            }
            Set<String> optionTargetAtoms = projectedAtomicTargetIds(
                    List.of(rootOption.id()),
                    projection);
            if (optionTargetAtoms.equals(currentTargetAtoms)) {
                continue;
            }
            options.putIfAbsent(rootOption.id(), rootOption);
        }
        return new ArrayList<>(options.values());
    }

    private UnifiedLearnerStateResponse getLearnerState(
            String skillpilotId,
            String sequentialAutopilotAnchorGoalId) {
        return getLearnerState(skillpilotId, sequentialAutopilotAnchorGoalId, true, true);
    }

    private UnifiedLearnerStateResponse getLearnerState(
            String skillpilotId,
            String sequentialAutopilotAnchorGoalId,
            boolean allowSideEffects) {
        return getLearnerState(
                skillpilotId,
                sequentialAutopilotAnchorGoalId,
                allowSideEffects,
                true);
    }

    private UnifiedLearnerStateResponse getLearnerState(
            String skillpilotId,
            String sequentialAutopilotAnchorGoalId,
            boolean allowSideEffects,
            boolean publishTransitionEvents) {
        Learner learner = allowSideEffects
                ? learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"))
                : learnerRepository.findById(skillpilotId)
                        .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        CompletionWorkflowState navigationAtRead = completionWorkflow(learner);
        if (allowSideEffects && navigationAtRead != null && navigationAtRead.directAssessment() != null
                && !currentDirectAssessmentBinding(learner, navigationAtRead)) {
            long beforeCleanup = learner.getCoachStateRevision();
            if (learner.getActiveGoalId() != null) {
                clearPersistedActiveGoal(learner, skillpilotId, "ACTIVE_GOAL_CLEARED_ASSESSMENT_BINDING", publishTransitionEvents);
            }
            saveCompletionWorkflow(learner, navigationAtRead.withNavigation("paused", null));
            if (learner.getCoachStateRevision() == beforeCleanup) advanceCoachStateRevision(learner);
        }
        if (allowSideEffects) {
            migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);
        }
        String curriculumId = learner.getSelectedCurriculum();
        com.skillpilot.backend.landscape.LandscapeSummary curriculumSummary = null;

        if (curriculumId != null) {
            SkillLandscape full = landscapeService.getById(curriculumId);
            if (full != null) {
                curriculumSummary = getAvailableLandscapes().stream()
                        .filter(s -> s.getCurriculumId().equals(curriculumId))
                        .findFirst()
                        .orElse(new com.skillpilot.backend.landscape.LandscapeSummary(
                                curriculumId,
                                full.getTitle() != null ? full.getTitle() : full.getSubject(),
                                full.getDescription(),
                                full.getCountry(),
                                full.getRegion(),
                                full.getSchoolType(),
                                full.getSubject(),
                                full.getLocale(),
                                full.getFilters(),
                                landscapeService.isCompatibilityOnlyLandscape(curriculumId)));
            }
        }

        // Level 3 is never intentionally empty once Level 2 is complete. Heal
        // older cockpit sessions before frontier calculation so every
        // downstream projection observes the same deterministic focus.
        if (allowSideEffects && !completionRouteOwnsNavigation(learner)
                && curriculumId != null && !curriculumId.isBlank()) {
            GoalProjection focusProjection = getGoalProjection(
                    curriculumId,
                    learner.getPersonalCurriculum());
            if (followedLearningScopeIds(learner, focusProjection, null) == null) {
                ensurePersistedDefaultProjectedFocus(learner, focusProjection);
            }
        }

        GoalProjection completionProjection = curriculumId == null ? null
                : getGoalProjection(curriculumId, learner.getPersonalCurriculum());
        CompletionSnapshot completion = completionSnapshot(learner, completionProjection);
        boolean completionOwnsNavigation = completionRouteOwnsNavigation(learner);
        Map<String, Double> mastery = getMastery(skillpilotId);
        boolean followingLearningPlans = effectivePlanFollowing(learner);
        List<LearnerLearningPlan> followedLearningPlans = currentFollowedLearningPlans(learner);
        boolean hasFollowedLearningPlans = !followedLearningPlans.isEmpty();
        if (allowSideEffects
                && hasFollowedLearningPlans
                && sequentialAutopilotAnchorGoalId != null
                && !sequentialAutopilotAnchorGoalId.isBlank()) {
            maybeAutoHandoffToLearningPlan(
                    learner,
                    followedLearningPlans,
                    sequentialAutopilotAnchorGoalId,
                    mastery,
                    publishTransitionEvents);
        }

        List<FrontierGoal> frontier = getRichFrontier(skillpilotId);
        List<FrontierGoal> frontierAtomic = completionRecommendations(filterAtomicFrontier(frontier), completion,
                completionOwnsNavigation);

        // Build a map of all goals in the closure for quick lookup
        Map<String, LearningGoal> allGoals = new LinkedHashMap<>();
        Map<String, LearningGoal> structuralGoals = Collections.emptyMap();
        GoalProjection goalProjection = null;
        if (curriculumId != null) {
            goalProjection = getGoalProjection(curriculumId, learner.getPersonalCurriculum());
            allGoals = goalProjection.visibleGoals();
            structuralGoals = goalProjection.structuralGoals();
        }
        List<FrontierGoal> sequentialAutopilotSearchAtomic = frontierAtomic;
        if (sequentialAutopilotAnchorGoalId != null
                && !sequentialAutopilotAnchorGoalId.isBlank()
                && isSequentialLearningStrategy(learner)
                && Boolean.TRUE.equals(learner.getAutoPilot())) {
            sequentialAutopilotSearchAtomic = completionRecommendations(
                    filterAtomicFrontier(getRichFrontier(skillpilotId, false)), completion, completionOwnsNavigation);
        }

        List<String> plannedIds = resolveEffectiveProjectedFocusIds(
                learner,
                goalProjection);
        List<String> plannedScopeIds = resolveProjectedTargetScopeIds(
                plannedIds,
                goalProjection);
        boolean exactFollowedScope = hasFollowedLearningPlans
                && followedLearningScopeIds(learner, goalProjection, null) != null;
        List<FrontierGoal> plannedRich = new ArrayList<>();

        for (String pid : plannedIds) {
            var unit = goalProjection == null ? null : goalProjection.declaredUnits().focus(pid);
            if (unit != null) {
                plannedRich.add(toDeclaredUnitFrontierGoal(unit, "Planned"));
                continue;
            }
            LearningGoal g = allGoals.get(pid);
            if (g == null) {
                g = structuralGoals.get(pid);
            }
            if (g == null) {
                // Fallback: Goal might be filtered out by personalization, but since it's
                // planned, we want to see it.
                // Try to resolve it from the landscape service directly.
                String containerId = landscapeService.getLandscapeIdForGoal(pid);
                if (containerId != null) {
                    com.skillpilot.backend.landscape.SkillLandscape l = landscapeService.getById(containerId);
                    if (l != null && l.getGoals() != null) {
                        g = l.getGoals().stream().filter(goal -> goal.getId().equals(pid)).findFirst().orElse(null);
                    }
                }
            }

            if (g != null) {
                plannedRich.add(toFrontierGoal(g, "Planned", null));
            } else if (isCompositionStructureGoalId(pid)) {
                plannedRich.add(toCompositionStructureFrontierGoal(pid, "Planned", goalProjection));
            } else {
                // True unknown (deleted or invalid ID)
                plannedRich.add(new FrontierGoal(pid, "Unknown Goal", "", "unknown", null, "Planned",
                        null, null, null, null, null, null));
            }
        }

        Set<String> scope = Collections.emptySet();
        if (curriculumId != null && !plannedScopeIds.isEmpty()) {
            scope = extensionAwareFocusScope(goalProjection, plannedScopeIds);
        }
        String storedActiveGoalId = learner.getActiveGoalId();
        String activeGoalId = resolveGoalIdInVisibleGoals(storedActiveGoalId, allGoals, false);
        boolean activeGoalMastered = activeGoalId != null && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD;
        boolean activeGoalInvalidInView = storedActiveGoalId != null
                && !storedActiveGoalId.isBlank()
                && activeGoalId == null;
        boolean activeGoalIsCurrentViewGoal = storedActiveGoalId != null
                && !storedActiveGoalId.isBlank()
                && storedActiveGoalId.equals(activeGoalId);
        PendingUnitEntry pendingNavigation = pendingUnitEntry(learner);
        boolean activeGuidedNavigation = pendingNavigation != null
                && Objects.equals(pendingNavigation.openingGoalId(), activeGoalId)
                && scope.contains(pendingNavigation.targetGoalId());
        boolean activeGoalOutOfScope = activeGoalIsCurrentViewGoal
                && !preservesDirectAssessment(learner, activeGoalId)
                && !activeGuidedNavigation
                && activeGoalId != null
                && !exactFollowedScope
                && isGoalOutOfPlannedScope(activeGoalId, plannedScopeIds, structuralGoals, scope)
                && !activeGoalId.equals(regroupedGoalInProgress(learner, goalProjection, plannedIds));
        GlobalAssessmentFocus globalAssessmentFocus = resolveGlobalAssessmentFocus(
                structuralGoals,
                plannedIds);
        boolean activeGoalOutOfCompletionContext = completionOwnsNavigation && completion != null
                && completion.compiled() != null && activeGoalId != null
                && !completion.compiled().contextGoalIds().contains(activeGoalId)
                && !activeGuidedNavigation;
        boolean globalAssessmentFocusRemoved = !preservesDirectAssessment(learner, activeGoalId)
                && isGlobalAssessmentGoalWithoutExplicitFocus(
                activeGoalId,
                globalAssessmentFocus) && !exactFollowedScope;
        if (activeGoalMastered
                || activeGoalInvalidInView
                || activeGoalOutOfScope
                || activeGoalOutOfCompletionContext
                || globalAssessmentFocusRemoved) {
            if (allowSideEffects) {
                clearPersistedActiveGoal(
                        learner,
                        skillpilotId,
                        activeGoalOutOfCompletionContext
                                ? "ACTIVE_GOAL_CLEARED_OUTSIDE_COMPLETION_CONTEXT"
                                : activeGoalInvalidInView
                                ? "ACTIVE_GOAL_CLEARED_INVALID_VIEW"
                                : globalAssessmentFocusRemoved
                                        ? "ACTIVE_GOAL_CLEARED_ASSESSMENT_FOCUS"
                                : activeGoalOutOfScope
                                        ? "ACTIVE_GOAL_CLEARED_OUT_OF_SCOPE"
                                        : "ACTIVE_GOAL_CLEARED_STALE",
                        publishTransitionEvents);
                if (activeGoalOutOfCompletionContext) {
                    CompletionWorkflowState old = completionWorkflow(learner);
                    if (old != null) saveCompletionWorkflow(learner, old.withNavigation("required", null));
                }
            }
            activeGoalId = null;
            activeGoalMastered = false;
        }
        if (activeGoalId != null && !activeGoalId.isBlank()) {
            LearningGoal activeLearningGoal = allGoals.get(activeGoalId);
            if (isSrsGoalUnavailableForVerifiedRecall(learner, goalProjection, mastery, activeLearningGoal)
                    || isExamGoalUnavailableForHardCheck(activeLearningGoal)) {
                if (allowSideEffects) {
                    clearPersistedActiveGoal(
                            learner,
                            skillpilotId,
                            "ACTIVE_GOAL_CLEARED_UNAVAILABLE_HARD_CHECK",
                            publishTransitionEvents);
                }
                activeGoalId = null;
                activeGoalMastered = false;
            }
        }

        Set<String> projectedTargetGoalIds = goalProjection == null
                ? allGoals.keySet()
                : goalProjection.regularTargetGoalIds();
        Set<String> projectedScope = scope.isEmpty()
                ? scope
                : scope.stream()
                        .filter(projectedTargetGoalIds::contains)
                        .collect(Collectors.toCollection(LinkedHashSet::new));
        com.skillpilot.backend.api.GoalStats personalizedStats =
                computeAtomicStats(allGoals, projectedTargetGoalIds, mastery);
        com.skillpilot.backend.api.GoalStats scopeStats = plannedScopeIds.isEmpty()
                ? null
                : computeAtomicStats(allGoals, projectedScope, mastery);
        com.skillpilot.backend.api.GoalStats focusStats = (scopeStats != null && scopeStats.total_atomic() > 0)
                ? scopeStats
                : personalizedStats;
        Set<String> ordinaryWaivers;
        if (completionOwnsNavigation || goalProjection == null) {
            ordinaryWaivers = Set.of();
        } else if (completion != null && completion.evaluation() != null && completion.compiled() != null
                && completion.compiled().automatic()
                && AUTOMATIC_COMPLETION_DEFAULT.equals(completion.compiled().profile().id())) {
            ordinaryWaivers = completion.evaluation().waivedGoalIds();
        } else {
            ordinaryWaivers = automaticFrontierWaivers(learner, goalProjection, mastery);
        }
        Set<String> focusTargetAtoms = goalProjection == null ? Set.of()
                : projectedAtomicTargetIds(plannedIds, goalProjection);
        if (!scope.isEmpty() && goalProjection != null) {
            scope.stream().filter(goalProjection.extensionPreparations()::contains).forEach(focusTargetAtoms::add);
        }
        boolean scopeCompleted = ordinaryWaivers != null && !focusTargetAtoms.isEmpty()
                && focusTargetAtoms.stream().allMatch(id -> ordinaryWaivers.contains(id)
                    || mastery.getOrDefault(id, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD);

        List<String> nextAllowedActions = new ArrayList<>();
        if (curriculumId == null) {
            nextAllowedActions.add("setCurriculum");
        }
        List<String> activeFilters = new ArrayList<>();
        PersonalizationPlan personalizationPlan = PersonalizationPlan.complete(List.of());
        if (curriculumId != null) {
            try {
                String json = learner.getPersonalCurriculum();
                if (json != null && !json.isBlank()) {
                    Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(json);
                    Set<String> currentLandscapeIds = resolveRuntimeLandscapes(
                                    curriculumId,
                                    landscapeService.getById(curriculumId),
                                    config,
                                    json)
                            .stream()
                            .map(SkillLandscape::getLandscapeId)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toCollection(LinkedHashSet::new));
                    for (Map.Entry<String, Map<String, Object>> configEntry : config.entrySet()) {
                        if (!currentLandscapeIds.contains(configEntry.getKey())) {
                            continue;
                        }
                        Map<String, Object> landscapeConfig = configEntry.getValue();
                        if (Boolean.FALSE.equals(landscapeConfig.get("selected"))) {
                            continue;
                        }
                        Object filterObj = landscapeConfig.get("filterId");
                        if (filterObj instanceof String) {
                            SkillLandscape declaringLandscape =
                                    landscapeService.getById(configEntry.getKey());
                            String f = canonicalConfiguredFilterId(declaringLandscape, filterObj);
                            if (f != null && !activeFilters.contains(f)) {
                                activeFilters.add(f);
                            }
                        }
                        Object durationModelObj = landscapeConfig.get("durationModel");
                        if (durationModelObj instanceof String) {
                            String durationModel = normalizeFilterId((String) durationModelObj);
                            if (DURATION_MODEL_FILTER_IDS.contains(durationModel)
                                    && !activeFilters.contains(durationModel)) {
                                activeFilters.add(durationModel);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
            personalizationPlan = buildPersonalizationPlan(learner);
        }
        boolean personalizationRequired =
                personalizationPlan.required() || !personalizationPlan.valid();

        if (allowSideEffects && !followingLearningPlans) {
            activeGoalId = maybeAutoActivateFrontierGoal(
                    learner,
                    activeGoalId,
                    frontierAtomic,
                    sequentialAutopilotSearchAtomic,
                    personalizationRequired,
                    sequentialAutopilotAnchorGoalId,
                    goalProjection,
                    publishTransitionEvents);
        }
        activeGoalMastered = activeGoalId != null && !activeGoalId.isBlank()
                && mastery.getOrDefault(activeGoalId, 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD;

        FrontierGoal activeGoal = resolveActiveGoal(activeGoalId, allGoals);
        boolean activeGoalIsMemory = isMemoryFrontierGoal(activeGoal);

        if (curriculumId != null) {
            if (personalizationPlan.required()) {
                nextAllowedActions.add("setPersonalization");
            }
            if (personalizationPlan.valid() && !personalizationRequired) {
                nextAllowedActions.add("setScope");
                nextAllowedActions.add("getFrontier");
                if (activeGoalId != null && !activeGoalId.isBlank() && !activeGoalMastered) {
                    if (activeGoalIsMemory) {
                        nextAllowedActions.add("chooseMemoryMode");
                        nextAllowedActions.add("startVerifiedRecall");
                    } else {
                        nextAllowedActions.add("setMastery");
                    }
                } else if (!frontierAtomic.isEmpty()) {
                    nextAllowedActions.add("setActiveGoal");
                }
            }
        }

        LearningState learningState = learner.getLearningState();
        if (learningState == null) {
            learningState = (activeGoalId == null || activeGoalId.isBlank() || activeGoalMastered)
                    ? LearningState.FRONTIER
                    : LearningState.TEACHING;
        } else if ((activeGoalId == null || activeGoalId.isBlank() || activeGoalMastered)
                && learningState == LearningState.TEACHING) {
            learningState = LearningState.FRONTIER;
        } else if (activeGoalId != null && !activeGoalId.isBlank() && !activeGoalMastered
                && learningState == LearningState.FRONTIER) {
            learningState = LearningState.TEACHING;
        }

        List<FrontierGoal> scopeExpansionOptions = Collections.emptyList();
        if (curriculumId != null && !completionOwnsNavigation && !personalizationRequired && activeGoal == null
                && !exactFollowedScope
                && scopeCompleted && !plannedScopeIds.isEmpty()) {
            scopeExpansionOptions = buildBroaderFocusOptions(
                    goalProjection,
                    plannedIds,
                    mastery,
                    ordinaryWaivers);
        }

        CompletionWorkflowState projectedNavigation = completionWorkflow(learner);
        CompletionCallContext call = CompletionCallContext.current();
        boolean invalidDirect = projectedNavigation != null && projectedNavigation.directAssessment() != null
                && !preservesDirectAssessment(learner, projectedNavigation.directAssessment().goalId());
        boolean blockedCoach = completionOwnsNavigation && call != null
                && (!call.supported() || completion == null || completion.evaluation() == null
                    || (projectedNavigation != null && projectedNavigation.directAssessment() != null
                        && !ownsDirectAssessment(call, projectedNavigation)));
        if (invalidDirect || blockedCoach) {
            // Hide protected teaching state without clearing another session's persisted work.
            activeGoal = null;
            activeGoalMastered = false;
            learningState = LearningState.FRONTIER;
            nextAllowedActions.clear();
            frontierAtomic = List.of();
        }
        if (completionOwnsNavigation) nextAllowedActions.remove("setActiveGoal");
        StateMachineInfo stateMachine = invalidDirect || blockedCoach
                ? new StateMachineInfo("completionPaused", "completionUnavailable", List.of(), List.of(), null)
                : completionOwnsNavigation && activeGoal == null
                    ? new StateMachineInfo("levelCompletion", "chooseCompletionRoute", List.of(), List.of(), null)
                : buildStateMachineInfo(curriculumId, frontierAtomic, activeGoal,
                activeGoalMastered, learningState, personalizationRequired, scopeExpansionOptions);

        /*
         * An unresolved entry-scope decision (for example G8 versus G9) is a
         * hard navigation boundary. The graph may already have a technically
         * computable frontier, but exposing it would let clients start
         * learning in a scope the learner has not selected yet. Keep the
         * internal graph and mastery untouched and suppress only the projected
         * frontier until personalization is complete.
         */
        List<FrontierGoal> projectedFrontier =
                personalizationRequired || invalidDirect || blockedCoach ? Collections.emptyList() : frontier;
        if (completionOwnsNavigation) {
            CompletionWorkflowState navigation = completionWorkflow(learner);
            CompletionSnapshot routeSnapshot = completion;
            boolean selected = navigation != null && navigation.directAssessment() == null
                    && navigation.navigationIntent() != null && Set.of("required", "support", "voluntary").contains(navigation.navigationIntent())
                    && routeSnapshot != null && routeSnapshot.evaluation() != null;
            projectedFrontier = !selected ? List.of() : projectedFrontier.stream()
                    .filter(goal -> routeSnapshot.compiled().contextGoalIds().contains(goal.id()))
                    .filter(goal -> Objects.equals(navigation.currentGoalId(), goal.id()))
                    .filter(goal -> "voluntary".equals(navigation.navigationIntent())
                            || !routeSnapshot.evaluation().waivedGoalIds().contains(goal.id()))
                    .toList();
        }

        if (completion != null && completion.response().learnerRevision() != learner.getCoachStateRevision()) {
            completion = completionSnapshot(learner, goalProjection);
        }
        return new UnifiedLearnerStateResponse(learner.getSkillpilotId(), curriculumSummary, projectedFrontier,
                new LearnerGoals(plannedRich, focusStats.mastered_atomic(), focusStats.total_atomic(),
                        personalizedStats, scopeStats, scopeCompleted),
                nextAllowedActions, activeFilters,
                learner.getCopySources(), learningState.name(), activeGoal, stateMachine,
                completion == null ? null : completion.response());
    }

    private List<FrontierGoal> completionRecommendations(List<FrontierGoal> normal,
            CompletionSnapshot snapshot, boolean routeOwnsNavigation) {
        if (!routeOwnsNavigation) return normal;
        if (snapshot == null || snapshot.evaluation() == null || snapshot.evaluation().complete()
                || "paused".equals(snapshot.response().navigationIntent())
                || "completion_coach_contract_unsupported".equals(snapshot.response().notice())) return List.of();
        if ("completion_assessment_owned_elsewhere".equals(snapshot.response().notice())) return List.of();
        return normal.stream().filter(g -> snapshot.evaluation().pendingTargetGoalIds().contains(g.id())).toList();
    }

    private List<LearnerLearningPlan> currentFollowedLearningPlans(Learner learner) {
        if (learnerLearningPlanRepository == null
                || !effectivePlanFollowing(learner)) {
            return Collections.emptyList();
        }
        return learnerLearningPlanRepository
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(learner.getSkillpilotId());
    }

    /**
     * Hands off only after completing a goal that belongs to a currently valid
     * plan. A due candidate from the completed anchor's subject wins;
     * otherwise the oldest due candidate is selected deterministically across
     * subjects. Invalid or stale plans are ignored for activation. While
     * plan-following mode is enabled, generic Autopilot stays suppressed
     * independently of whether a usable plan is currently stored.
     */
    private void maybeAutoHandoffToLearningPlan(
            Learner learner,
            List<LearnerLearningPlan> plans,
            String completedAnchorGoalId,
            Map<String, Double> mastery,
            boolean publishEvent) {
        GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String currentActiveGoalId = learner.getActiveGoalId();
        if (currentActiveGoalId != null
                && !currentActiveGoalId.isBlank()
                && mastery.getOrDefault(currentActiveGoalId, 0.0)
                        < PLANNING_SCOPE_MASTERY_THRESHOLD) {
            return;
        }

        LocalDate asOf = LocalDate.now(learningPlanClock.withZone(LEARNING_PLAN_ZONE));
        PeriodBasis basis = learner.getLearningPlanPeriodBasis();
        LocalDate periodStart = LearnerLearningPlanService.periodStart(basis, asOf);
        LocalDate periodEnd = LearnerLearningPlanService.periodEnd(basis, asOf);
        Map<String, Instant> completions = basis == PeriodBasis.WEEK
                ? getGoalCompletionsBetween(learner.getSkillpilotId(), periodStart, periodEnd)
                : getGoalCompletionsOnDate(learner.getSkillpilotId(), asOf);

        // Evaluate the whole subject before choosing any candidate. A completed future
        // goal can cover another plan's quota within the same subject; an invalid part
        // plan must not turn the remaining part into a supposedly complete balance.
        Map<LearnerLearningPlan, List<LearnerLearningPlanApi.Block>> validPlans = new LinkedHashMap<>();
        Map<String, Map<String, LocalDate>> subjectSchedules = new LinkedHashMap<>();
        Set<String> unavailableSubjects = new HashSet<>();
        Set<String> anchorSubjects = new HashSet<>();
        for (LearnerLearningPlan plan : plans) {
            String subject = LearnerLearningPlanService.stableSubjectKey(
                    landscapeService.getById(plan.getLandscapeId()));
            if (subject == null) {
                continue;
            }
            try {
                var captured = readPortableLearningPlanBlocks(plan);
                if (!isLearningPlanCompatible(
                        learner.getSkillpilotId(), plan.getCurriculumId(), plan.getLandscapeId(), captured)) {
                    unavailableSubjects.add(subject);
                    continue;
                }
                var blocks = LearnerLearningPlanService.effectivePlanBlocks(this, learner, plan.getLandscapeId(), captured);
                Map<String, LocalDate> schedule = subjectSchedules.computeIfAbsent(
                        subject, ignored -> new LinkedHashMap<>());
                LearnerLearningPlanService.scheduledAtomicGoalDueDatesForSchedule(blocks)
                        .forEach((goalId, date) -> schedule.merge(
                                goalId, date, (left, right) -> left.isBefore(right) ? left : right));
                validPlans.put(plan, blocks);
                if (blocks.stream().filter(block -> block.isActive() && block.isAtomicLearning())
                        .map(LearnerLearningPlanApi.Block::atomicGoalIds)
                        .filter(Objects::nonNull)
                        .anyMatch(goalIds -> goalIds.contains(completedAnchorGoalId))) {
                    anchorSubjects.add(subject);
                }
            } catch (ResponseStatusException exception) {
                if (exception.getStatusCode().is5xxServerError()) {
                    throw exception;
                }
                unavailableSubjects.add(subject);
            } catch (IllegalStateException exception) {
                unavailableSubjects.add(subject);
            }
        }
        var fulfillment = LearnerLearningPlanService.planFulfillment(this, learner, plans, mastery,
                this::readPortableLearningPlanBlocks, id -> LearnerLearningPlanService.stableSubjectKey(landscapeService.getById(id)),
                planHandoffProjection);
        Map<String, Set<String>> creditedBySubject = new HashMap<>();
        for (var plan : validPlans.keySet()) {
            String subject = LearnerLearningPlanService.stableSubjectKey(landscapeService.getById(plan.getLandscapeId()));
            if (fulfillment.unavailable().contains(plan.getLandscapeId())) {
                unavailableSubjects.add(subject);
            } else {
                creditedBySubject.put(subject, fulfillment.waived(plan.getLandscapeId()));
            }
        }
        Set<String> subjectsWithOpenQuota = new HashSet<>();
        subjectSchedules.forEach((subject, schedule) -> {
            if (!unavailableSubjects.contains(subject)
                    && LearnerLearningPlanService.calculateBalance(
                            schedule.keySet(), schedule, periodStart, periodEnd, mastery, completions,
                            creditedBySubject.getOrDefault(subject, Set.of()))
                            .offenesPeriodenpensum() > 0) {
                subjectsWithOpenQuota.add(subject);
            }
        });
        List<LearningPlanHandoffCandidate> candidates = new ArrayList<>();
        boolean completedAnchorBelongsToValidPlan = !anchorSubjects.isEmpty();
        for (var entry : validPlans.entrySet()) {
            LearnerLearningPlan plan = entry.getKey();
            List<LearnerLearningPlanApi.Block> blocks = entry.getValue();
            try {
                String subject = LearnerLearningPlanService.stableSubjectKey(
                        landscapeService.getById(plan.getLandscapeId()));
                // A fulfilled period quota is a stopping point. Explicit further learning
                // remains possible, but automatic continuation may not create extra work.
                if (!subjectsWithOpenQuota.contains(subject)) {
                    continue;
                }
                var learningScope = LearningPlanScopeResolver.resolve(blocks, asOf,
                        roots -> resolveLearningPlanGoalIds(learner.getSkillpilotId(), plan.getLandscapeId(), roots),
                        getStoredLearningPlanFocus(learner.getSkillpilotId(), plan.getLandscapeId()));
                Map<String, List<String>> preparation = new HashMap<>();
                java.util.function.Function<List<String>, Set<String>> frontierOf = roots -> roots.isEmpty() ? Set.of()
                        : getUncompactedRichFrontierForFocus(learner.getSkillpilotId(), roots).stream()
                                .filter(goal -> "atomic".equals(goal.type()) && !goal.voluntaryStudy())
                                .peek(goal -> LearnerLearningPlanService.collectStudyPreparation(preparation, goal))
                                .map(FrontierGoal::id).collect(Collectors.toSet());
                // An exam binds the whole selected scope. An ordinary plan judges each goal under the
                // focus it will run under, exactly like plan continuation: the frontier of all plan
                // goals taken together can hide a due goal behind a goal that is scheduled later.
                Set<String> examEligibleIds = "exam".equals(learningScope.kind())
                        ? frontierOf.apply(learningScope.goalIds()) : null;
                Optional<LearnerLearningPlanService.DueGoal> selected =
                        LearnerLearningPlanService.firstEligibleDueGoal(
                                blocks,
                                periodEnd,
                                mastery,
                                fulfillment.waived(plan.getLandscapeId()),
                                examEligibleIds != null ? ignored -> examEligibleIds : frontierOf,
                                (goalId, focusIds) -> !"exam".equals(learningScope.kind()) || learningScope.goalIds().contains(goalId)
                                        ? requiredUnitOrientationGoalId(learner, projection, goalId,
                                                "exam".equals(learningScope.kind()) ? learningScope.goalIds() : focusIds)
                                        : null,
                                goalId -> !"exam".equals(learningScope.kind()) || learningScope.goalIds().contains(goalId),
                                preparation,
                                // As in plan continuation: a goal moved out of its section runs under its own focus.
                                roots -> "exam".equals(learningScope.kind()) ? null : getLearningPlanFocusAtomicGoalIds(
                                        learner.getSkillpilotId(), plan.getLandscapeId(), roots));
                if (selected.isEmpty()) {
                    continue;
                }
                LearnerLearningPlanService.DueGoal dueGoal = selected.get();
                if (!learningScope.goalIds().contains(dueGoal.requestedGoalId())) continue;
                candidates.add(new LearningPlanHandoffCandidate(
                        plan.getId(),
                        plan.getLandscapeId(),
                        dueGoal.focusGoalId(),
                        dueGoal.atomicGoalId(),
                        dueGoal.blockStartDate(),
                        dueGoal.blockEndDate(),
                        anchorSubjects.contains(subject),
                        dueGoal.scheduledDate(),
                        "exam".equals(learningScope.kind()) ? learningScope.goalIds() : null,
                        dueGoal.requestedGoalId()));
            } catch (ResponseStatusException exception) {
                if (exception.getStatusCode().is5xxServerError()) {
                    throw exception;
                }
                // An ineligible plan must never mutate Level-3 state automatically.
            } catch (IllegalStateException exception) {
                // A stale, malformed, or no-longer-projectable plan must never
                // mutate Level-3 state automatically.
            }
        }

        Optional<LearningPlanHandoffCandidate> selected = selectLearningPlanHandoffCandidate(
                completedAnchorBelongsToValidPlan,
                candidates);
        if (selected.isEmpty()) {
            return;
        }
        applyLearningPlanHandoff(learner, selected.get(), publishEvent);
    }

    static Optional<LearningPlanHandoffCandidate> selectLearningPlanHandoffCandidate(
            boolean completedAnchorBelongsToValidPlan,
            List<LearningPlanHandoffCandidate> candidates) {
        if (!completedAnchorBelongsToValidPlan || candidates == null || candidates.isEmpty()) {
            return Optional.empty();
        }
        List<LearningPlanHandoffCandidate> anchored = candidates.stream()
                .filter(LearningPlanHandoffCandidate::sameSubjectAsCompletedAnchor)
                .toList();
        List<LearningPlanHandoffCandidate> pool = anchored.isEmpty() ? candidates : anchored;
        return pool.stream().min(Comparator
                .comparing(
                        LearningPlanHandoffCandidate::scheduledDate,
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        LearningPlanHandoffCandidate::blockEndDate,
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        LearningPlanHandoffCandidate::blockStartDate,
                        Comparator.nullsLast(LocalDate::compareTo))
                .thenComparing(
                        LearningPlanHandoffCandidate::landscapeId,
                        Comparator.nullsLast(String::compareTo))
                .thenComparing(LearningPlanHandoffCandidate::atomicGoalId)
                .thenComparing(LearningPlanHandoffCandidate::planId));
    }

    private void applyLearningPlanHandoff(
            Learner learner,
            LearningPlanHandoffCandidate candidate,
            boolean publishEvent) {
        List<PlannedGoal> currentFocus = plannedGoalRepository
                .findByLearner_SkillpilotId(learner.getSkillpilotId());
        List<String> selectedFocus = candidate.scopeGoalIds() == null
                ? List.of(candidate.focusGoalId()) : candidate.scopeGoalIds();
        GoalProjection entryProjection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String activeGoalId = candidate.atomicGoalId();
        if (candidate.scopeGoalIds() == null) {
            // An ordinary plan stores exactly what plan continuation would store for this goal
            // under this focus: the selection may have judged the goal under all sections of its
            // block, while the stored focus is one of them or the goal itself, and a unit opening
            // that this focus requires comes first. A goal the stored focus does not offer is left
            // to plan continuation.
            LearningPlanEntry entry = resolveLearningPlanEntry(
                    learner, entryProjection, candidate.requestedGoalId(), selectedFocus);
            if (!isLearningPlanEntryEligible(learner.getSkillpilotId(), entry)) return;
            selectedFocus = entry.focusGoalIds();
            activeGoalId = entry.activeGoalId();
        } else {
            Set<String> expandedFocus = computeScope(resolveProjectedTargetScopeIds(selectedFocus, entryProjection),
                    entryProjection.structuralGoals(), Map.of());
            if (!expandedFocus.contains(candidate.atomicGoalId()) && !selectedFocus.stream()
                    .allMatch(id -> isAtomicGoal(entryProjection.visibleGoals().get(id)))) {
                selectedFocus = new ArrayList<>(selectedFocus);
                selectedFocus.add(candidate.atomicGoalId());
            }
        }
        boolean focusAlreadySelected = currentFocus.stream().map(PlannedGoal::getGoalId).collect(Collectors.toSet())
                .equals(Set.copyOf(selectedFocus));
        if (!focusAlreadySelected) {
            plannedGoalRepository.deleteAll(currentFocus);
            for (String goalId : selectedFocus) plannedGoalRepository.save(new PlannedGoal(learner, goalId));
        }
        learner.setActiveGoalId(activeGoalId);
        learner.setLearningState(LearningState.TEACHING);
        if (!Objects.equals(activeGoalId, candidate.requestedGoalId())) {
            parkUnitEntry(learner, candidate.requestedGoalId(), activeGoalId);
        } else learner.setPendingUnitEntry(null);
        advanceCoachStateRevision(learner);
        if (publishEvent) {
            eventPublisher.publishEvent(new LearnerStateChangedEvent(
                    this,
                    learner.getSkillpilotId(),
                    "LEARNING_PLAN_AUTO_HANDOFF"));
        }
    }

    record LearningPlanHandoffCandidate(
            UUID planId,
            String landscapeId,
            String focusGoalId,
            String atomicGoalId,
            LocalDate blockStartDate,
            LocalDate blockEndDate,
            boolean sameSubjectAsCompletedAnchor,
            LocalDate scheduledDate,
            List<String> scopeGoalIds,
            String requestedGoalId) {
        LearningPlanHandoffCandidate(UUID planId, String landscapeId, String focusGoalId,
                String atomicGoalId, LocalDate blockStartDate, LocalDate blockEndDate,
                boolean sameSubjectAsCompletedAnchor, LocalDate scheduledDate, List<String> scopeGoalIds) {
            this(planId, landscapeId, focusGoalId, atomicGoalId, blockStartDate, blockEndDate,
                    sameSubjectAsCompletedAnchor, scheduledDate, scopeGoalIds, atomicGoalId);
        }
        LearningPlanHandoffCandidate(UUID planId, String landscapeId, String focusGoalId,
                String atomicGoalId, LocalDate blockStartDate, LocalDate blockEndDate,
                boolean sameSubjectAsCompletedAnchor, LocalDate scheduledDate) {
            this(planId, landscapeId, focusGoalId, atomicGoalId, blockStartDate, blockEndDate,
                    sameSubjectAsCompletedAnchor, scheduledDate, null);
        }
        LearningPlanHandoffCandidate(UUID planId, String landscapeId, String focusGoalId,
                String atomicGoalId, LocalDate blockStartDate, LocalDate blockEndDate,
                boolean sameSubjectAsCompletedAnchor) {
            this(planId, landscapeId, focusGoalId, atomicGoalId, blockStartDate, blockEndDate,
                    sameSubjectAsCompletedAnchor, blockEndDate, null, atomicGoalId);
        }
    }

    private String maybeAutoActivateFrontierGoal(
            Learner learner,
            String activeGoalId,
            List<FrontierGoal> frontierAtomic,
            List<FrontierGoal> sequentialAutopilotSearchAtomic,
            boolean personalizationRequired,
            String sequentialAutopilotAnchorGoalId,
            GoalProjection projection,
            boolean publishEvent) {
        CompletionWorkflowState workflow = completionWorkflow(learner);
        if (workflow != null && "paused".equals(workflow.navigationIntent())) return activeGoalId;
        if (!Boolean.TRUE.equals(learner.getAutoPilot())) {
            return activeGoalId;
        }
        if (activeGoalId != null && !activeGoalId.isBlank()) {
            return activeGoalId;
        }
        if (personalizationRequired || frontierAtomic == null || frontierAtomic.isEmpty()) {
            return activeGoalId;
        }

        FrontierGoal nextGoal = completionRouteOwnsNavigation(learner) ? frontierAtomic.get(0) : chooseAutopilotFrontierGoal(
                learner,
                frontierAtomic,
                sequentialAutopilotSearchAtomic,
                sequentialAutopilotAnchorGoalId,
                projection == null ? Map.of() : projection.structuralGoals());
        if (nextGoal == null || nextGoal.id() == null || nextGoal.id().isBlank()) {
            return activeGoalId;
        }

        // An active exam or deck owns the chat. Let newly released unit cards be offered at this boundary first.
        if (projection != null && !projection.declaredUnits().units().isEmpty()) {
            LearningGoal next = projection.visibleGoals().get(nextGoal.id());
            if ((isSrsGoal(next) || isExamGoal(next)) && dueDeclaredUnitCards(learner, projection, nextGoal.id())) return activeGoalId;
        }

        learner.setActiveGoalId(nextGoal.id());
        learner.setLearningState(LearningState.TEACHING);
        advanceCoachStateRevision(learner);
        if (publishEvent) {
            eventPublisher.publishEvent(
                    new LearnerStateChangedEvent(this, learner.getSkillpilotId(), "ACTIVE_GOAL_UPDATE_AUTOPILOT"));
        }
        return nextGoal.id();
    }

    private boolean dueDeclaredUnitCards(Learner learner, GoalProjection projection, String nextId) {
        try {
            var box = unitCardBox(learner, projection, null, ordinaryGoalMastery(learner), unitEntryPlanningCredits(learner, projection));
            return box != null && box.context().section().declaration() != null
                    && box.context().section().landscapeId().equals(landscapeService.getLandscapeIdForGoal(nextId))
                    && box.tallies().values().stream().anyMatch(tally -> tally.dueCards() > 0);
        } catch (SrsStateUnavailableException unavailable) {
            return false;
        }
    }

    private FrontierGoal chooseAutopilotFrontierGoal(
            Learner learner,
            List<FrontierGoal> frontierAtomic,
            List<FrontierGoal> sequentialAutopilotSearchAtomic,
            String sequentialAutopilotAnchorGoalId,
            Map<String, LearningGoal> structuralGoals) {
        if (frontierAtomic == null || frontierAtomic.isEmpty()) {
            return null;
        }
        List<FrontierGoal> automaticChoices = frontierAtomic.stream()
                .filter(goal -> !goal.voluntaryStudy()).toList();
        if (isSequentialLearningStrategy(learner)
                && sequentialAutopilotAnchorGoalId != null
                && !sequentialAutopilotAnchorGoalId.isBlank()) {
            FrontierGoal localNext = findSequentialLocalFrontierGoal(
                    sequentialAutopilotAnchorGoalId,
                    sequentialAutopilotSearchAtomic == null || sequentialAutopilotSearchAtomic.isEmpty()
                            ? automaticChoices
                            : sequentialAutopilotSearchAtomic.stream()
                                    .filter(goal -> !goal.voluntaryStudy()).toList(),
                    structuralGoals);
            if (localNext != null) {
                if (localNext.studyGuidance() != null && !localNext.studyGuidance().recommendedPreparationGoalIds().isEmpty()) {
                    List<String> preparation = localNext.studyGuidance().recommendedPreparationGoalIds();
                    Optional<FrontierGoal> recommended = automaticChoices.stream().filter(goal -> preparation.contains(goal.id()))
                            .findFirst();
                    if (recommended.isPresent()) return recommended.get();
                    return automaticChoices.stream().filter(option -> !localNext.id().equals(option.id()))
                            .findFirst().orElse(null);
                }
                return localNext;
            }
            // A finished program segment is not the end of the learning route. The
            // frontier is already restricted to the current focus and ordered by the
            // authored target order, so falling through never leaves the focus and never
            // skips an earlier open goal.
        }
        return automaticChoices.isEmpty() ? null : automaticChoices.getFirst();
    }

    private boolean isSequentialLearningStrategy(Learner learner) {
        return learner != null && "SEQUENTIAL".equalsIgnoreCase(learner.getLearningStrategy());
    }

    private FrontierGoal findSequentialLocalFrontierGoal(
            String anchorGoalId,
            List<FrontierGoal> frontierAtomic,
            Map<String, LearningGoal> structuralGoals) {
        if (anchorGoalId == null
                || anchorGoalId.isBlank()
                || frontierAtomic == null
                || frontierAtomic.isEmpty()
                || structuralGoals == null
                || structuralGoals.isEmpty()) {
            return null;
        }

        LinkedHashMap<String, FrontierGoal> frontierById = new LinkedHashMap<>();
        for (FrontierGoal goal : frontierAtomic) {
            if (goal != null && goal.id() != null && !goal.id().isBlank()) {
                frontierById.putIfAbsent(goal.id(), goal);
            }
        }
        if (frontierById.isEmpty()) {
            return null;
        }

        Map<String, Set<String>> parentMap = buildParentMap(structuralGoals);
        return findSequentialLocalFrontierGoal(
                anchorGoalId,
                frontierById,
                structuralGoals,
                parentMap,
                new HashSet<>());
    }

    private FrontierGoal findSequentialLocalFrontierGoal(
            String anchorGoalId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Set<String>> parentMap,
            Set<String> visitedAnchors) {
        if (anchorGoalId == null || anchorGoalId.isBlank() || !visitedAnchors.add(anchorGoalId)) {
            return null;
        }

        List<String> parentIds = orderedLocalParentIds(anchorGoalId, parentMap, structuralGoals);
        // "Schritt für Schritt" must not skip an earlier open sibling in the
        // anchor's immediate authored program segment. Keep this lookup local:
        // broader ancestor fallback is deliberately handled by the existing
        // terminal-boundary rules below.
        if (!parentIds.isEmpty()) {
            String immediateParentId = parentIds.get(0);
            FrontierGoal firstOpenInParent = findFirstFrontierInSubtree(
                    immediateParentId,
                    frontierById,
                    structuralGoals,
                    new HashSet<>());
            if (firstOpenInParent != null) {
                return firstOpenInParent;
            }
        }

        boolean hasLocalFollowingSibling = false;
        for (String parentId : parentIds) {
            LocalParentFrontierSearch nextInParent = findNextFrontierAfterChildInParent(
                    parentId,
                    anchorGoalId,
                    frontierById,
                    structuralGoals);
            if (nextInParent.goal() != null) {
                return nextInParent.goal();
            }
            hasLocalFollowingSibling = hasLocalFollowingSibling || nextInParent.hasFollowingSibling();
        }

        if (hasLocalFollowingSibling) {
            return null;
        }

        for (String parentId : parentIds) {
            FrontierGoal nextAfterParent = findSequentialLocalFrontierGoal(
                    parentId,
                    frontierById,
                    structuralGoals,
                    parentMap,
                    visitedAnchors);
            if (nextAfterParent != null) {
                return nextAfterParent;
            }
        }

        return null;
    }

    private record LocalParentFrontierSearch(FrontierGoal goal, boolean hasFollowingSibling) {
    }

    private List<String> orderedLocalParentIds(
            String goalId,
            Map<String, Set<String>> parentMap,
            Map<String, LearningGoal> structuralGoals) {
        Set<String> parentIds = parentMap.getOrDefault(goalId, Collections.emptySet());
        if (parentIds.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Integer> descendantCountCache = new HashMap<>();
        return parentIds.stream()
                .sorted(Comparator.comparingInt(parentId ->
                        countStructuralDescendants(parentId, structuralGoals, descendantCountCache, new HashSet<>())))
                .toList();
    }

    private int countStructuralDescendants(
            String goalId,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Integer> cache,
            Set<String> visiting) {
        Integer cached = cache.get(goalId);
        if (cached != null) {
            return cached;
        }
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return 0;
        }

        LearningGoal goal = structuralGoals.get(goalId);
        int count = 0;
        if (goal != null && goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, structuralGoals);
                if (childId == null) {
                    continue;
                }
                count += 1 + countStructuralDescendants(childId, structuralGoals, cache, visiting);
            }
        }

        visiting.remove(goalId);
        cache.put(goalId, count);
        return count;
    }

    private LocalParentFrontierSearch findNextFrontierAfterChildInParent(
            String parentId,
            String childId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals) {
        LearningGoal parent = structuralGoals.get(parentId);
        if (parent == null || parent.getContains() == null || parent.getContains().isEmpty()) {
            return new LocalParentFrontierSearch(null, false);
        }

        boolean afterChild = false;
        boolean hasFollowingSibling = false;
        for (String siblingRef : parent.getContains()) {
            String siblingId = resolveGoalRef(siblingRef, structuralGoals);
            if (siblingId == null) {
                continue;
            }
            if (!afterChild) {
                afterChild = siblingId.equals(childId);
                continue;
            }
            hasFollowingSibling = true;
            FrontierGoal next = findFirstFrontierInSubtree(siblingId, frontierById, structuralGoals, new HashSet<>());
            if (next != null) {
                return new LocalParentFrontierSearch(next, true);
            }
        }
        return new LocalParentFrontierSearch(null, hasFollowingSibling);
    }

    private FrontierGoal findFirstFrontierInSubtree(
            String goalId,
            Map<String, FrontierGoal> frontierById,
            Map<String, LearningGoal> structuralGoals,
            Set<String> visiting) {
        FrontierGoal direct = frontierById.get(goalId);
        if (direct != null) {
            return direct;
        }
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return null;
        }

        LearningGoal goal = structuralGoals.get(goalId);
        if (goal != null && goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, structuralGoals);
                if (childId == null) {
                    continue;
                }
                FrontierGoal next = findFirstFrontierInSubtree(childId, frontierById, structuralGoals, visiting);
                if (next != null) {
                    visiting.remove(goalId);
                    return next;
                }
            }
        }

        visiting.remove(goalId);
        return null;
    }

    private List<FrontierGoal> filterAtomicFrontier(List<FrontierGoal> frontier) {
        return frontier.stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .toList();
    }

    private StateMachineInfo buildStateMachineInfo(String curriculumId, List<FrontierGoal> frontierAtomic,
            FrontierGoal activeGoal, boolean activeGoalMastered,
            LearningState learningState, boolean personalizationRequired, List<FrontierGoal> scopeExpansionOptions) {
        String state = curriculumId == null
                ? "SETUP"
                : personalizationRequired ? "PERSONALIZATION" : learningState.name();
        String requiredAction = "getFrontier";
        List<FrontierGoal> goalOptions = Collections.emptyList();
        List<com.skillpilot.backend.landscape.LandscapeSummary> curriculumOptions = Collections.emptyList();

        if (curriculumId == null) {
            requiredAction = "setCurriculum";
            curriculumOptions = getAvailableBaseCurricula(false);
        } else if (personalizationRequired) {
            requiredAction = "setPersonalization";
        } else if (activeGoal != null && !activeGoalMastered && isMemoryFrontierGoal(activeGoal)) {
            requiredAction = "chooseMemoryMode";
            goalOptions = List.of(activeGoal);
        } else if (activeGoal != null && !activeGoalMastered && isOrientationGoal(activeGoal)) {
            requiredAction = "orientActiveGoal";
            goalOptions = List.of(activeGoal);
        } else if (activeGoal != null && !activeGoalMastered) {
            requiredAction = "teachActiveGoal";
            goalOptions = List.of(activeGoal);
        } else if (!frontierAtomic.isEmpty()) {
            requiredAction = "setActiveGoal";
            goalOptions = frontierAtomic;
        } else if (scopeExpansionOptions != null && !scopeExpansionOptions.isEmpty()) {
            requiredAction = "setScope";
            goalOptions = scopeExpansionOptions;
        }

        List<LearningModeOption> modeOptions = activeGoal != null && !activeGoalMastered && isMemoryFrontierGoal(activeGoal)
                ? buildMemoryModeOptions(activeGoal)
                : Collections.emptyList();
        return new StateMachineInfo(state, requiredAction, goalOptions, curriculumOptions, activeGoal, modeOptions);
    }

    private List<LearningModeOption> buildMemoryModeOptions(FrontierGoal activeGoal) {
        if (activeGoal == null) {
            return Collections.emptyList();
        }
        return List.of(
                new LearningModeOption(
                        "practice",
                        "Karteikarten lernen",
                        "Öffne das Karteikartenlernen im Cockpit für fällige Karten und Wiederholung.",
                        "openCockpitPractice",
                        "cockpit",
                        activeGoal.id()),
                new LearningModeOption(
                        "verify",
                        "Mit Lerncoach prüfen",
                        "Harte Abfrage ohne Hilfestellung.",
                        "startVerifiedRecall",
                        "gpt",
                        activeGoal.id()));
    }

    private boolean isMemoryFrontierGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("memory".equals(goal.nodeKind())) {
            return true;
        }
        if (goal.tags() == null) {
            return false;
        }
        return goal.tags().stream().anyMatch(tag -> "memorization".equals(tag) || tag.startsWith("srs-deck:"));
    }

    /**
     * Builds strict Level-3 supersets along the learner-facing contains path.
     * Explicit navigation may include any unmastered target. Required successor
     * offers additionally omit work already implicitly completed in the full
     * Personal Curriculum. Neither form changes a goal's mastery.
     */
    private List<FrontierGoal> buildBroaderFocusOptions(
            GoalProjection projection,
            List<String> currentFocusIds,
            Map<String, Double> mastery) {
        return buildBroaderFocusOptions(projection, currentFocusIds, mastery, Set.of());
    }

    private List<FrontierGoal> buildBroaderFocusOptions(
            GoalProjection projection,
            List<String> currentFocusIds,
            Map<String, Double> mastery,
            Set<String> waived) {
        if (projection == null || currentFocusIds == null || currentFocusIds.isEmpty() || waived == null) {
            return Collections.emptyList();
        }

        Set<String> currentTargetAtoms = projectedAtomicTargetIds(
                currentFocusIds,
                projection);
        if (currentTargetAtoms.isEmpty()) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> candidateIds = new LinkedHashSet<>();
        if (projection.compositionViewApplied() && compositionViewService != null) {
            for (String viewId : projection.compositionViewIds()) {
                for (String currentFocusId : currentFocusIds) {
                    projectedFocusAncestors(viewId, currentFocusId, projection)
                            .stream()
                            .map(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                            .filter(Objects::nonNull)
                            .filter(id -> !id.isBlank())
                            .forEach(candidateIds::add);
                }
            }
            candidateIds.addAll(projection.presentationRootGoalIds());
        }
        // Declared focus IDs live outside the canonical graph. Start their
        // ancestor search at the owned atoms, whether or not an alias exists.
        List<String> canonicalAnchors = new ArrayList<>();
        for (String focusId : currentFocusIds) {
            var unit = projection.declaredUnits().focus(focusId);
            if (unit != null) {
                canonicalAnchors.addAll(unit.atoms());
            } else if (!projection.compositionViewApplied() || compositionViewService == null) {
                canonicalAnchors.add(focusId);
            }
        }
        candidateIds.addAll(findCanonicalFocusAncestorIds(canonicalAnchors, projection.structuralGoals()));

        Map<String, Double> effectiveMastery = computeEffectiveMastery(
                projection.visibleGoals(),
                mastery == null ? Collections.emptyMap() : mastery);
        LinkedHashMap<List<String>, FrontierGoal> options = new LinkedHashMap<>();
        for (String rawCandidateId : candidateIds) {
            String candidateId = preferFlattenedPresentationRoot(
                    rawCandidateId,
                    projection);
            if (candidateId == null
                    || candidateId.isBlank()
                    || currentFocusIds.contains(candidateId)
                    || !isProjectedTargetFocus(candidateId, projection)) {
                continue;
            }
            List<String> replacementFocusIds = replaceCoveredFocusRoots(
                    currentFocusIds,
                    candidateId,
                    projection);
            if (replacementFocusIds.isEmpty() || replacementFocusIds.equals(currentFocusIds)) {
                continue;
            }
            Set<String> candidateTargetAtoms = projectedAtomicTargetIds(
                    replacementFocusIds,
                    projection);
            if (candidateTargetAtoms.size() <= currentTargetAtoms.size()
                    || !candidateTargetAtoms.containsAll(currentTargetAtoms)) {
                continue;
            }
            boolean addsUnmasteredTarget = candidateTargetAtoms.stream()
                    .filter(goalId -> !currentTargetAtoms.contains(goalId))
                    .filter(goalId -> !waived.contains(goalId))
                    .anyMatch(goalId -> effectiveMastery.getOrDefault(goalId, 0.0) < PLANNING_SCOPE_MASTERY_THRESHOLD);
            if (!addsUnmasteredTarget) {
                continue;
            }

            FrontierGoal option = focusNavigationGoal(
                    candidateId,
                    projection,
                    "Broader focus");
            if (option != null) {
                List<String> immutableReplacement = replacementFocusIds.stream()
                        .map(id -> declaredFocusId(id, projection)).distinct().toList();
                options.putIfAbsent(
                        immutableReplacement,
                        option.withSelectionGoalIds(immutableReplacement));
            }
        }
        return new ArrayList<>(options.values());
    }

    /**
     * The cockpit flattens an outer composition wrapper when it represents the
     * same atomic target set as the canonical presentation root. Publish the
     * same canonical root instead of a duplicate synthetic alias.
     */
    private String preferFlattenedPresentationRoot(
            String candidateId,
            GoalProjection projection) {
        if (candidateId == null
                || projection == null
                || compositionViewService == null
                || !isCompositionStructureGoalId(candidateId)) {
            return candidateId;
        }
        CompositionViewService.CompositionStructureResolution candidate =
                projectedStructure(candidateId, projection);
        if (candidate == null) {
            return candidateId;
        }
        List<CompositionViewService.CompositionStructureResolution> viewRoots =
                projectedRootOptions(candidate.viewId(), projection);
        if (viewRoots.size() != 1
                || !candidateId.equals(viewRoots.getFirst().syntheticGoalId())) {
            return candidateId;
        }
        Set<String> candidateAtoms = projectedAtomicTargetIds(
                List.of(candidateId),
                projection);
        if (candidateAtoms.isEmpty()) {
            return candidateId;
        }
        for (String presentationRootId : projection.presentationRootGoalIds()) {
            LearningGoal presentationRoot = projection.visibleGoals().get(presentationRootId);
            if (presentationRoot == null) {
                presentationRoot = projection.structuralGoals().get(presentationRootId);
            }
            Set<String> presentationAtoms = projectedAtomicTargetIds(
                    List.of(presentationRootId),
                    projection);
            if (presentationRoot != null
                    && presentationRoot.getTitle() != null
                    && candidate.label() != null
                    && presentationRoot.getTitle().trim().equalsIgnoreCase(candidate.label().trim())
                    && !presentationAtoms.isEmpty()
                    && presentationAtoms.equals(candidateAtoms)) {
                return presentationRootId;
            }
        }
        return candidateId;
    }

    /**
     * Widens the branch covered by {@code candidateId} while retaining every
     * independent focus root. If the ancestor covers several current roots,
     * they collapse into that one ancestor at their first position.
     */
    private List<String> replaceCoveredFocusRoots(
            List<String> currentFocusIds,
            String candidateId,
            GoalProjection projection) {
        if (currentFocusIds == null
                || currentFocusIds.isEmpty()
                || candidateId == null
                || candidateId.isBlank()) {
            return Collections.emptyList();
        }
        Set<String> candidateAtoms = projectedAtomicTargetIds(
                List.of(candidateId),
                projection);
        if (candidateAtoms.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> replacement = new ArrayList<>();
        boolean insertedCandidate = false;
        boolean coveredAnyRoot = false;
        for (String currentFocusId : currentFocusIds) {
            Set<String> currentRootAtoms = projectedAtomicTargetIds(
                    List.of(currentFocusId),
                    projection);
            boolean covered = !currentRootAtoms.isEmpty()
                    && candidateAtoms.containsAll(currentRootAtoms);
            if (covered) {
                coveredAnyRoot = true;
                if (!insertedCandidate) {
                    replacement.add(candidateId);
                    insertedCandidate = true;
                }
            } else if (currentFocusId != null
                    && !currentFocusId.isBlank()
                    && !replacement.contains(currentFocusId)) {
                replacement.add(currentFocusId);
            }
        }
        return coveredAnyRoot ? replacement : Collections.emptyList();
    }

    private Set<String> projectedAtomicTargetIds(
            List<String> focusIds,
            GoalProjection projection) {
        if (focusIds == null || focusIds.isEmpty() || projection == null) {
            return Collections.emptySet();
        }
        List<String> projectedRoots = resolveProjectedTargetScopeIds(
                focusIds,
                projection);
        if (projectedRoots.isEmpty()) {
            return Collections.emptySet();
        }
        Set<String> expanded = computeScope(
                projectedRoots,
                projection.structuralGoals(),
                Collections.emptyMap());
        return projection.regularTargetGoalIds().stream()
                .filter(expanded::contains)
                .filter(goalId -> isAtomicGoal(projection.visibleGoals().get(goalId)))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    /**
     * Uses the same explicit node-type rule as learner goal statistics. In
     * particular, structural leaves explicitly typed as clusters are not
     * counted merely because their {@code contains} list is empty.
     */
    private boolean isCountedAtomicGoal(LearningGoal goal) {
        return goal != null && !"cluster".equals(resolveNodeType(goal));
    }

    private List<String> findCanonicalFocusAncestorIds(
            List<String> focusIds,
            Map<String, LearningGoal> structuralGoals) {
        if (focusIds == null
                || focusIds.isEmpty()
                || structuralGoals == null
                || structuralGoals.isEmpty()) {
            return Collections.emptyList();
        }
        Map<String, Set<String>> parentMap = buildParentMap(structuralGoals);
        LinkedHashSet<String> ancestors = new LinkedHashSet<>();
        for (String focusId : focusIds) {
            if (focusId == null || focusId.isBlank()) {
                continue;
            }
            LinkedHashSet<String> visited = new LinkedHashSet<>();
            String currentId = focusId;
            while (visited.add(currentId)) {
                String parentId = parentMap
                        .getOrDefault(currentId, Collections.emptySet())
                        .stream()
                        .findFirst()
                        .orElse(null);
                if (parentId == null) {
                    break;
                }
                ancestors.add(parentId);
                currentId = parentId;
            }
        }
        return new ArrayList<>(ancestors);
    }

    private FrontierGoal focusNavigationGoal(
            String focusId,
            GoalProjection projection,
            String reason) {
        var unit = projection.declaredUnits().focus(focusId);
        if (unit != null) return toDeclaredUnitFrontierGoal(unit, reason);
        if (isCompositionStructureGoalId(focusId)) {
            return toCompositionStructureFrontierGoal(focusId, reason, projection);
        }
        LearningGoal goal = projection.visibleGoals().get(focusId);
        if (goal == null) {
            goal = projection.structuralGoals().get(focusId);
        }
        return toFrontierGoal(goal, reason, null);
    }

    private Map<String, Set<String>> buildParentMap(Map<String, LearningGoal> allGoals) {
        Map<String, Set<String>> parentMap = new HashMap<>();
        for (LearningGoal parent : allGoals.values()) {
            if (parent.getContains() == null) {
                continue;
            }
            for (String childRef : parent.getContains()) {
                String childId = resolveGoalRef(childRef, allGoals);
                if (childId == null) {
                    continue;
                }
                parentMap.computeIfAbsent(childId, k -> new LinkedHashSet<>()).add(parent.getId());
            }
        }
        return parentMap;
    }

    private com.skillpilot.backend.api.GoalStats computeAtomicStats(Map<String, LearningGoal> goals,
            Set<String> scope, Map<String, Double> mastery) {
        if (goals == null || goals.isEmpty()) {
            return new com.skillpilot.backend.api.GoalStats(0, 0);
        }

        long total = 0;
        long mastered = 0;
        for (LearningGoal g : goals.values()) {
            if ("cluster".equals(resolveNodeType(g))) {
                continue;
            }
            if (scope != null && !scope.isEmpty() && !scope.contains(g.getId())) {
                continue;
            }
            total++;
            if (mastery.getOrDefault(g.getId(), 0.0) >= PLANNING_SCOPE_MASTERY_THRESHOLD) {
                mastered++;
            }
        }

        return new com.skillpilot.backend.api.GoalStats(mastered, total);
    }

    private String resolveNodeType(LearningGoal goal) {
        if (goal == null) {
            return "atomic";
        }
        String type = goal.getType();
        if (type != null && !type.isBlank()) {
            return type;
        }
        String resolved = (goal.getContains() != null && !goal.getContains().isEmpty()) ? "cluster" : "atomic";
        goal.setType(resolved);
        return resolved;
    }

    private String resolveNodeKind(LearningGoal goal) {
        if (goal == null) {
            return "tutor";
        }
        String kind = goal.getNodeKind();
        if (kind != null && !kind.isBlank()) {
            return kind;
        }
        String resolved = (goal.getExamData() != null) ? "exam" : "tutor";
        goal.setNodeKind(resolved);
        return resolved;
    }

    @Transactional
    public UnifiedLearnerStateResponse setScope(String skillpilotId, List<String> goalIds) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "No curriculum selected. Please select a curriculum first using updateCurriculum.");
        }

        if (goalIds == null || goalIds.isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalIds must not be empty. String instructions are no longer supported.");
        }

        // Scope selection is exclusive: replace planned goals with the new scope.
        Set<String> newPlanned = new LinkedHashSet<>(goalIds);
        learner.setLearningState(LearningState.FRONTIER);
        learnerRepository.save(learner);
        UnifiedLearnerStateResponse state = setPlannedGoalsAndGetState(skillpilotId, newPlanned).state();
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "SCOPE_UPDATE"));
        return state;
    }

    @Transactional
    public void setActiveGoal(String skillpilotId, String goalId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        assertWritableLearningSession(learner);
        if (goalId == null || goalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "goalId must not be empty.");
        }
        assertPersonalizationCompleteForLearning(learner);

        Map<String, LearningGoal> visibleGoals = Collections.emptyMap();
        if (learner.getSelectedCurriculum() != null && !learner.getSelectedCurriculum().isBlank()) {
            visibleGoals = getFilteredGoals(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        }
        String requestedGoalId = resolveGoalIdInVisibleGoals(goalId, visibleGoals, false);
        GoalProjection entryProjection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
        String requiredOpening = requestedGoalId == null ? null
                : requiredUnitOrientationGoalId(learner, entryProjection, requestedGoalId);
        String effectiveGoalId = requiredOpening == null ? requestedGoalId : requiredOpening;
        if (effectiveGoalId == null || effectiveGoalId.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must be an atomic goal from the current frontier.");
        }
        CompletionWorkflowState workflow = completionWorkflow(learner);
        if (workflow != null) {
            if (workflow.directAssessment() != null) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                        "End the current direct assessment before choosing another goal.");
            }
            GoalProjection projection = getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum());
            CompletionSnapshot snapshot = completionSnapshot(learner, projection);
            PendingUnitEntry pendingEntry = pendingUnitEntry(learner);
            boolean selectedChoice = (Objects.equals(workflow.currentGoalId(), effectiveGoalId)
                    || requiredOpening != null && Objects.equals(workflow.currentGoalId(), requestedGoalId)
                    || pendingEntry != null && Objects.equals(pendingEntry.openingGoalId(), effectiveGoalId)
                        && Objects.equals(workflow.currentGoalId(), pendingEntry.targetGoalId()))
                    && workflow.navigationIntent() != null && Set.of("required", "support", "voluntary").contains(workflow.navigationIntent());
            boolean voluntaryChoice = selectedChoice && "voluntary".equals(workflow.navigationIntent());
            if (snapshot == null || snapshot.evaluation() == null || !selectedChoice
                    || !snapshot.compiled().contextGoalIds().contains(pendingEntry != null
                            && Objects.equals(pendingEntry.openingGoalId(), effectiveGoalId)
                            ? pendingEntry.targetGoalId() : requiredOpening == null ? effectiveGoalId : requestedGoalId)
                    || (requiredOpening == null && !voluntaryChoice && snapshot.evaluation().waivedGoalIds().contains(effectiveGoalId))) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                        "Choose the goal explicitly from the current completion route.");
            }
        }
        if (isExamGoalUnavailableForHardCheck(visibleGoals.get(effectiveGoalId))) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must reference a released, concrete exam goal.");
        }

        boolean unitFocusChanged = false;
        PendingUnitEntry priorEntry = pendingUnitEntry(learner);
        if (Objects.equals(requestedGoalId, requiredOpening)
                && !(priorEntry != null && Objects.equals(priorEntry.openingGoalId(), requestedGoalId))) {
            Map<String, Set<String>> openingScopes = guidedUnitOrientationScopes(entryProjection);
            boolean nestedOpening = openingScopes.entrySet().stream().anyMatch(entry ->
                    !entry.getKey().equals(requestedGoalId) && entry.getValue().contains(requestedGoalId));
            if (nestedOpening) {
                var binding = projectedOpenings(entryProjection).stream()
                        .filter(item -> requestedGoalId.equals(item.openingId())).findFirst().orElseThrow();
                List<PlannedGoal> existingFocus = plannedGoalRepository.findByLearner_SkillpilotId(skillpilotId);
                List<PlannedGoal> coveringFocus = existingFocus.stream().filter(item -> computeScope(
                        resolveProjectedTargetScopeIds(List.of(item.getGoalId()), entryProjection),
                        entryProjection.structuralGoals(), Map.of()).contains(requestedGoalId)).toList();
                if (existingFocus.stream().noneMatch(item -> binding.focusId().equals(item.getGoalId()))) {
                    plannedGoalRepository.deleteAll(coveringFocus);
                    plannedGoalRepository.save(new PlannedGoal(learner, binding.focusId()));
                    unitFocusChanged = true;
                }
            }
        }

        if (requiredOpening != null) {
            Set<String> focus = computeScope(resolveProjectedTargetScopeIds(
                    resolveEffectiveProjectedFocusIds(learner, entryProjection), entryProjection),
                    entryProjection.structuralGoals(), Map.of());
            if (!focus.contains(requestedGoalId) && !isOrientationGoal(visibleGoals.get(requestedGoalId))) {
                var binding = projectedOpenings(entryProjection).stream()
                        .filter(item -> requiredOpening.equals(item.openingId())).findFirst().orElseThrow();
                plannedGoalRepository.save(new PlannedGoal(learner, binding.focusId()));
                focus.addAll(computeScope(resolveProjectedTargetScopeIds(List.of(binding.focusId()), entryProjection),
                        entryProjection.structuralGoals(), Map.of()));
                unitFocusChanged = true;
            }
            if (!focus.contains(requiredOpening)) plannedGoalRepository.save(new PlannedGoal(learner, requiredOpening));
            if (Boolean.TRUE.equals(learner.getStrictMode()) && !isOrientationGoal(visibleGoals.get(requestedGoalId))) {
                Set<String> foundations = frontierPrerequisiteCompiler.normalizePrerequisites(
                        prerequisiteGraph(learner, entryProjection)).transitivePrerequisites(requestedGoalId);
                for (String foundation : foundations) {
                    if (!focus.contains(foundation) && entryProjection.targetGoalIds().contains(foundation)) {
                        plannedGoalRepository.save(new PlannedGoal(learner, foundation));
                    }
                }
            }
        }
        // Selection remains valid for every genuine frontier goal, even when the
        // learner-facing read model compacted an equivalent option for display.
        // Server-authored transitions (for example an orientation-path entry)
        // must not be rejected merely because that goal was omitted by UI
        // compaction.
        List<FrontierGoal> frontierAtomic = filterAtomicFrontier(getUncompactedRichFrontier(skillpilotId));
        boolean explicitUnitOpening = Objects.equals(requestedGoalId, requiredOpening)
                && guidedUnitOrientationScopes(entryProjection).containsKey(requestedGoalId);
        boolean allowed = explicitUnitOpening || frontierAtomic.stream().anyMatch(goal -> goal.id().equals(effectiveGoalId));
        if (!allowed) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,
                    "goalId must be an atomic goal from the current frontier.");
        }

        String previousPendingEntry = learner.getPendingUnitEntry();
        PendingUnitEntry pendingEntry = pendingUnitEntry(learner);
        if (requiredOpening != null && !requiredOpening.equals(requestedGoalId)) {
            parkUnitEntry(learner, requestedGoalId, requiredOpening);
        } else if (!(Objects.equals(learner.getActiveGoalId(), effectiveGoalId) && pendingEntry != null
                && Objects.equals(pendingEntry.openingGoalId(), effectiveGoalId))) learner.setPendingUnitEntry(null);

        String currentActiveGoalId = learner.getActiveGoalId();
        if (currentActiveGoalId != null && !currentActiveGoalId.isBlank() && currentActiveGoalId.equals(effectiveGoalId)
                && !unitFocusChanged && Objects.equals(previousPendingEntry, learner.getPendingUnitEntry())) {
            return;
        }

        learner.setActiveGoalId(effectiveGoalId);
        learner.setLearningState(LearningState.TEACHING);
        advanceCoachStateRevision(learner);
        eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, "ACTIVE_GOAL_UPDATE"));
    }

    /**
     * Applies one server-authored learning-plan transition with a single state
     * revision. Replacing the pointer parks any previous goal without touching
     * mastery. Plan-package activation can defer publication until every plan
     * row has been stored successfully.
     */
    @Transactional
    public LearningPlanTransitionResult applyLearningPlanTransition(
            String skillpilotId,
            boolean enableFollowing,
            boolean replaceActiveGoal,
            String focusGoalId,
            String activeGoalId,
            boolean publishEvent,
            String changeType) {
        return applyLearningPlanScopeTransition(skillpilotId, enableFollowing, replaceActiveGoal,
                focusGoalId == null || focusGoalId.isBlank() ? null : List.of(focusGoalId),
                activeGoalId, publishEvent, changeType);
    }

    /** Keeps the complete selected scope separate from its one active learning cursor. */
    @Transactional
    public LearningPlanTransitionResult applyLearningPlanScopeTransition(
            String skillpilotId, boolean enableFollowing, boolean replaceActiveGoal,
            List<String> focusGoalIds, String activeGoalId, boolean publishEvent, String changeType) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        List<String> normalizedFocusGoalIds = focusGoalIds == null ? null
                : focusGoalIds.stream().filter(Objects::nonNull).map(String::trim)
                        .filter(id -> !id.isBlank()).distinct().toList();
        String requestedActiveGoalId = activeGoalId == null || activeGoalId.isBlank()
                ? null
                : activeGoalId.trim();
        if (!replaceActiveGoal && (normalizedFocusGoalIds != null || requestedActiveGoalId != null)) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "focusGoalId and activeGoalId require replaceActiveGoal");
        }
        if (replaceActiveGoal && requestedActiveGoalId != null
                && (normalizedFocusGoalIds == null || normalizedFocusGoalIds.isEmpty())) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "focusGoalId is required when activating a learning-plan goal");
        }
        LearningPlanEntry entry = requestedActiveGoalId == null ? null : resolveLearningPlanEntry(learner,
                getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum()),
                requestedActiveGoalId, normalizedFocusGoalIds);
        String requiredOpening = entry == null ? null : entry.requiredOpening();
        String normalizedActiveGoalId = entry == null ? null : entry.activeGoalId();
        if (entry != null) {
            normalizedFocusGoalIds = entry.focusGoalIds();
            assertPersonalizationCompleteForLearning(learner);
            if (!isLearningPlanEntryEligible(skillpilotId, entry)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.CONFLICT,
                        "activeGoalId must be an atomic goal from the requested plan focus frontier");
            }
        }

        boolean changed = false;
        if (enableFollowing && !Boolean.TRUE.equals(learner.getFollowLearningPlans())) {
            learner.setFollowLearningPlans(true);
            changed = true;
        }
        if (replaceActiveGoal) {
            learner.setPendingUnitEntry(null);
            if (normalizedFocusGoalIds != null) {
                List<PlannedGoal> currentFocus = plannedGoalRepository
                        .findByLearner_SkillpilotId(skillpilotId);
                boolean focusAlreadySelected = currentFocus.stream().map(PlannedGoal::getGoalId).collect(Collectors.toSet())
                        .equals(Set.copyOf(normalizedFocusGoalIds));
                if (!focusAlreadySelected) {
                    plannedGoalRepository.deleteAll(currentFocus);
                    for (String id : normalizedFocusGoalIds) {
                        plannedGoalRepository.save(new PlannedGoal(learner, id));
                    }
                    changed = true;
                }
            }
            if (!Objects.equals(learner.getActiveGoalId(), normalizedActiveGoalId)) {
                learner.setActiveGoalId(normalizedActiveGoalId);
                changed = true;
            }
            LearningState requestedState = normalizedActiveGoalId == null
                    ? LearningState.FRONTIER
                    : LearningState.TEACHING;
            if (learner.getLearningState() != requestedState) {
                learner.setLearningState(requestedState);
                changed = true;
            }
            if (requiredOpening != null && !requiredOpening.equals(requestedActiveGoalId)) {
                parkUnitEntry(learner, requestedActiveGoalId, requiredOpening);
                changed = true;
            }
        }
        if (changed) {
            advanceCoachStateRevision(learner);
            learnerRepository.save(learner);
            if (publishEvent) {
                eventPublisher.publishEvent(new LearnerStateChangedEvent(
                        this,
                        skillpilotId,
                        changeType == null || changeType.isBlank()
                                ? "LEARNING_PLAN_TRANSITION"
                                : changeType));
            }
        }
        return new LearningPlanTransitionResult(changed, getLearnerState(skillpilotId));
    }

    public record LearningPlanTransitionResult(
            boolean changed,
            UnifiedLearnerStateResponse state) { }

    /**
     * What a plan transition stores for a requested goal under a focus. A required unit opening
     * comes first; the requested goal is then kept for the return. A section focus that does not
     * hold the opening is widened by it.
     */
    private record LearningPlanEntry(String activeGoalId, String requiredOpening, List<String> focusGoalIds) { }

    private LearningPlanEntry resolveLearningPlanEntry(Learner learner, GoalProjection projection,
            String requestedGoalId, List<String> focusGoalIds) {
        String requiredOpening = requiredUnitOrientationGoalId(learner, projection, requestedGoalId, focusGoalIds);
        List<String> focus = focusGoalIds;
        if (requiredOpening != null) {
            Set<String> expanded = computeScope(resolveProjectedTargetScopeIds(focus, projection),
                    projection.structuralGoals(), Map.of());
            if (!expanded.contains(requiredOpening) && !focus.stream()
                    .allMatch(id -> isAtomicGoal(projection.visibleGoals().get(id)))) {
                focus = new ArrayList<>(focus);
                focus.add(requiredOpening);
            }
        }
        return new LearningPlanEntry(requiredOpening == null ? requestedGoalId : requiredOpening, requiredOpening, focus);
    }

    private boolean isLearningPlanEntryEligible(String skillpilotId, LearningPlanEntry entry) {
        return getUncompactedRichFrontierForFocus(skillpilotId, entry.focusGoalIds()).stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .anyMatch(goal -> entry.activeGoalId().equals(goal.id()));
    }

    /**
     * Whether a plan transition would accept this goal under this focus: directly, or behind its
     * required unit opening, which the transition then starts while it keeps the goal for the return.
     */
    @Transactional(readOnly = true)
    public boolean learningPlanTransitionAccepts(String skillpilotId, String requestedGoalId, List<String> focusGoalIds) {
        if (requestedGoalId == null || requestedGoalId.isBlank() || focusGoalIds == null || focusGoalIds.isEmpty()) {
            return false;
        }
        Learner learner = getLearner(skillpilotId);
        if (learner.getSelectedCurriculum() == null || learner.getSelectedCurriculum().isBlank()) return false;
        return isLearningPlanEntryEligible(skillpilotId, resolveLearningPlanEntry(learner,
                getGoalProjection(learner.getSelectedCurriculum(), learner.getPersonalCurriculum()),
                requestedGoalId, focusGoalIds));
    }

    /**
     * Acquires the learner write lock before a plan transition. An unrelated
     * active goal may only be replaced after it is mastered; selecting the
     * same active goal remains idempotent.
     */
    @Transactional
    public void assertLearningPlanMayActivateGoal(
            String skillpilotId,
            String proposedGoalId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        if (proposedGoalId == null || proposedGoalId.isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "proposedGoalId must not be empty.");
        }
        String activeGoalId = learner.getActiveGoalId();
        if (activeGoalId == null
                || activeGoalId.isBlank()
                || activeGoalId.equals(proposedGoalId)) {
            return;
        }
        if (getMastery(skillpilotId).getOrDefault(activeGoalId, 0.0)
                < PLANNING_SCOPE_MASTERY_THRESHOLD) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Another unmastered active goal is already in progress.");
        }
    }

    private boolean isExamGoalUnavailableForHardCheck(LearningGoal goal) {
        if (goal == null || !isExamGoal(goal)) {
            return false;
        }
        return !isExamDataReadyForHardCheck(goal.getExamData());
    }

    private boolean isNonGlobalExamWithoutDirectPrerequisite(
            LearningGoal goal,
            boolean globalAssessmentGoal) {
        // In general completion an exam is an endpoint even without authored
        // preparation. Absence of requires must not make it unreachable.
        if (completionApplicationService != null && completionApplicationService.catalog().automatic()) return false;
        return !globalAssessmentGoal
                && isExamGoal(goal)
                && (goal.getRequires() == null || goal.getRequires().isEmpty());
    }

    private boolean isGlobalAssessmentGoalWithoutExplicitFocus(
            String goalId,
            GlobalAssessmentFocus globalAssessmentFocus) {
        return goalId != null
                && globalAssessmentFocus != null
                && globalAssessmentFocus.allGoalIds().contains(goalId)
                && !globalAssessmentFocus.explicitlyFocusedGoalIds().contains(goalId);
    }

    /**
     * Separates the globally offered final-assessment layer from the ordinary
     * curriculum frontier. The only semantic marker is an authored
     * {@code release.kind=offer} root; titles, phases, curriculum IDs, and exam
     * labels are deliberately ignored.
     *
     * <p>A broad synthetic composition focus does not opt into this layer. A
     * canonical focus on an offer root or one of its descendants does, and only
     * that offer branch is enabled. This keeps ordinary learning routes free of
     * global final exams while preserving explicit exam campaigns whose concrete
     * released tasks intentionally have no direct didactic prerequisites.</p>
     */
    private GlobalAssessmentFocus resolveGlobalAssessmentFocus(
            Map<String, LearningGoal> structuralGoals,
            List<String> projectedFocusIds) {
        if (structuralGoals == null || structuralGoals.isEmpty()) {
            return new GlobalAssessmentFocus(Collections.emptySet(), Collections.emptySet());
        }

        List<Set<String>> offerBranches = new ArrayList<>();
        Set<String> allGlobalAssessmentGoalIds = new LinkedHashSet<>();
        for (LearningGoal goal : structuralGoals.values()) {
            if (goal == null
                    || goal.getId() == null
                    || goal.getRelease() == null
                    || !"offer".equalsIgnoreCase(goal.getRelease().getKind())) {
                continue;
            }
            Set<String> branchGoalIds = new LinkedHashSet<>();
            branchGoalIds.add(goal.getId());
            collectDescendants(goal.getId(), structuralGoals, branchGoalIds);
            offerBranches.add(branchGoalIds);
            allGlobalAssessmentGoalIds.addAll(branchGoalIds);
        }

        if (offerBranches.isEmpty()) {
            return new GlobalAssessmentFocus(Collections.emptySet(), Collections.emptySet());
        }

        Set<String> explicitlyFocusedGoalIds = new LinkedHashSet<>();
        if (projectedFocusIds != null) {
            for (String focusId : projectedFocusIds) {
                if (focusId == null
                        || focusId.isBlank()
                        || isCompositionStructureGoalId(focusId)) {
                    continue;
                }
                String resolvedFocusId = resolveGoalRef(focusId, structuralGoals);
                if (resolvedFocusId == null) {
                    continue;
                }
                for (Set<String> offerBranch : offerBranches) {
                    if (offerBranch.contains(resolvedFocusId)) {
                        explicitlyFocusedGoalIds.addAll(offerBranch);
                    }
                }
            }
        }
        return new GlobalAssessmentFocus(
                Set.copyOf(allGlobalAssessmentGoalIds),
                Set.copyOf(explicitlyFocusedGoalIds));
    }

    private boolean isExamGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        return "exam".equalsIgnoreCase(goal.getNodeKind()) || goal.getExamData() != null;
    }

    private boolean isExamDataReadyForHardCheck(com.skillpilot.backend.landscape.ExamData exam) {
        if (exam == null) {
            return false;
        }
        if (hasBlockingExamReviewStatus(exam.getReviewStatus())) {
            return false;
        }
        if (containsPlaceholderExamText(exam)) {
            return false;
        }
        return hasScoringStructure(exam)
                && exam.getTaskContent() != null
                && !exam.getTaskContent().isBlank()
                && exam.getSolutionContent() != null
                && !exam.getSolutionContent().isBlank();
    }

    private boolean hasBlockingExamReviewStatus(String reviewStatus) {
        if (reviewStatus == null || reviewStatus.isBlank()) {
            return false;
        }
        return !"released".equals(reviewStatus.trim().toLowerCase(Locale.ROOT));
    }

    private boolean containsPlaceholderExamText(com.skillpilot.backend.landscape.ExamData exam) {
        String task = normalizeExamTextForInspection(exam.getTaskContent());
        String solution = normalizeExamTextForInspection(exam.getSolutionContent());
        if (task.matches("^eine materialgestuetzte j\\d+[- ]uebungsaufgabe\\b.*")) {
            return true;
        }
        if (task.matches("^eine integrative sek[- ]i[- ]abschlussaufgabe\\b.*")) {
            return true;
        }
        if (task.contains("uebungsaufgabe verbindet") && !hasExamSubtaskMarkers(task)) {
            return true;
        }
        return solution.startsWith("die loesung zeigt ")
                && !hasExamSubtaskMarkers(task)
                && !task.matches(".*\\b\\d+[,.]?\\d*\\b.*");
    }

    private boolean hasExamSubtaskMarkers(String normalizedTask) {
        return normalizedTask.matches("(?s).*(?:\\b1\\.|\\ba\\)|\\baufgabe\\s+1\\b|\\bteilaufgabe\\b).*");
    }

    private String normalizeExamTextForInspection(String value) {
        if (value == null) {
            return "";
        }
        return value
                .toLowerCase(Locale.ROOT)
                .replace("ü", "ue")
                .replace("ä", "ae")
                .replace("ö", "oe")
                .replace("ß", "ss")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasScoringStructure(com.skillpilot.backend.landscape.ExamData exam) {
        com.skillpilot.backend.landscape.ExamData.Scoring scoring = exam.getScoring();
        return scoring != null
                && scoring.getMaxPoints() > 0
                && scoring.getPassingPoints() > 0
                && scoring.getSteps() != null
                && !scoring.getSteps().isEmpty();
    }

    private CompositionViewService.CompositionStructureResolution projectedStructure(
            String id, GoalProjection projection) {
        return projection == null || projection.learnerViews().isEmpty()
                ? compositionViewService.resolveStructureReference(id)
                : compositionViewService.resolveStructureReference(id, projection.learnerViews());
    }

    private boolean usesMigratedAssessmentPlacements(String viewId, GoalProjection projection) {
        var view = projection.learnerViews().get(viewId);
        return view != null && view.containsKey(CompositionViewExtensions.HISTORICAL_ASSESSMENT_PLACEMENTS)
                && projection.explicitExtensionLandscapeIds().contains(view.get("landscapeId"));
    }

    private List<CompositionViewService.CompositionStructureResolution> projectedRootOptions(
            String viewId, GoalProjection projection) {
        return projection.learnerViews().isEmpty()
                ? compositionViewService.findRootScopeOptions(viewId)
                : compositionViewService.findRootScopeOptions(viewId, projection.learnerViews());
    }

    private List<CompositionViewService.CompositionStructureResolution> projectedFocusAncestors(
            String viewId, String goalId, GoalProjection projection) {
        return projection.learnerViews().isEmpty()
                ? compositionViewService.findLearnerFacingFocusAncestors(viewId, goalId, projection.structuralGoals())
                : compositionViewService.findLearnerFacingFocusAncestors(viewId, goalId,
                        projection.structuralGoals(), projection.learnerViews());
    }

    private List<List<CompositionViewService.CompositionStructureResolution>> projectedFocusPaths(
            String viewId, String goalId, GoalProjection projection) {
        return projection.learnerViews().isEmpty()
                ? compositionViewService.findLearnerFacingFocusAncestorPaths(viewId, goalId, projection.structuralGoals())
                : compositionViewService.findLearnerFacingFocusAncestorPaths(viewId, goalId,
                        projection.structuralGoals(), projection.learnerViews());
    }

    private boolean isCompositionStructureGoalId(String goalId) {
        return goalId != null && goalId.startsWith("composition:") && goalId.contains(":structure:");
    }

    private FrontierGoal toDeclaredUnitFrontierGoal(DeclaredCourseUnits.Unit unit, String reason) {
        return new FrontierGoal(unit.focusId(), unit.label(), "", "cluster", "tutor", reason,
                List.of("synthetic:program-unit"), List.of(), null, null, null, null);
    }

    private FrontierGoal toCompositionStructureFrontierGoal(String goalId, String reason, GoalProjection projection) {
        CompositionViewService.CompositionStructureResolution resolution = compositionViewService == null
                ? null
                : projectedStructure(goalId, projection);
        String title = resolution == null || resolution.label() == null || resolution.label().isBlank()
                ? "Geplanter Lernbereich"
                : resolution.label();
        String description = resolution == null || resolution.referencedGoalIds().isEmpty()
                ? ""
                : "Geplanter Lernbereich aus der Curriculum-Ansicht.";
        return new FrontierGoal(
                goalId,
                title,
                description,
                "cluster",
                "tutor",
                reason,
                List.of("synthetic:program-unit"),
                Collections.emptyList(),
                null,
                null,
                null,
                null);
    }

    private FrontierGoal toFrontierGoal(LearningGoal goal, String reason, com.skillpilot.backend.landscape.ExamData examData) {
        if (goal == null) {
            return null;
        }
        List<Map<String, Object>> rawSourceLinks = extractRawSourceLinks(goal);
        Map<String, GoalSourceLink> dedupedLinks = new LinkedHashMap<>();
        rawSourceLinks.stream()
                .filter(link -> !"license".equalsIgnoreCase(readString(link.get("type"))))
                .map(this::toGoalSourceLink)
                .filter(Objects::nonNull)
                .forEach(link -> dedupedLinks.putIfAbsent(link.url(), link));
        List<GoalSourceLink> resourceLinks = new ArrayList<>(dedupedLinks.values());

        ProvenanceInfo provenance = extractProvenance(goal, rawSourceLinks);

        return new FrontierGoal(
                goal.getId(),
                goal.getTitle(),
                goal.getDescription(),
                resolveNodeType(goal),
                resolveNodeKind(goal),
                goal.getSemanticKind(),
                reason,
                goal.getTags(),
                resourceLinks,
                provenance.sourceRef(),
                provenance.sourceLicense(),
                provenance.sourceLicenseUrl(),
                examData,
                isExamGoal(goal) && isExamDataReadyForHardCheck(goal.getExamData()));
    }

    private record ProvenanceInfo(String sourceRef, String sourceLicense, String sourceLicenseUrl) {
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractRawSourceLinks(LearningGoal goal) {
        if (goal == null) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> links = new ArrayList<>();
        appendRawLinks(links, goal.getResourceLinks());

        return links;
    }

    @SuppressWarnings("unchecked")
    private void appendRawLinks(List<Map<String, Object>> target, List<?> entries) {
        if (entries == null) {
            return;
        }
        for (Object entry : entries) {
            if (entry instanceof Map<?, ?> map) {
                target.add((Map<String, Object>) map);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private ProvenanceInfo extractProvenance(LearningGoal goal, List<Map<String, Object>> rawSourceLinks) {
        String sourceRef = trimToNull(goal.getSourceRef());
        String sourceLicense = extractLicenseFromTags(goal.getTags());
        String sourceLicenseUrl = null;

        if (goal.getExtendedData() != null) {
            Object provenanceRaw = goal.getExtendedData().get("provenance");
            if (provenanceRaw instanceof Map<?, ?> map) {
                Map<String, Object> provenance = (Map<String, Object>) map;
                sourceRef = coalesce(trimToNull(readString(provenance.get("sourceUrl"))), sourceRef);
                sourceLicense = coalesce(trimToNull(readString(provenance.get("license"))), sourceLicense);
                sourceLicenseUrl = coalesce(trimToNull(readString(provenance.get("licenseUrl"))), sourceLicenseUrl);
            }
        }

        for (Map<String, Object> link : rawSourceLinks) {
            String type = readString(link.get("type"));
            String url = trimToNull(readString(link.get("url")));
            if (sourceRef == null && "concept".equalsIgnoreCase(type)) {
                sourceRef = url;
            }
            if ("license".equalsIgnoreCase(type)) {
                sourceLicense = coalesce(trimToNull(readString(link.get("license"))), sourceLicense);
                sourceLicenseUrl = coalesce(url, sourceLicenseUrl);
            }
        }

        return new ProvenanceInfo(sourceRef, sourceLicense, sourceLicenseUrl);
    }

    private GoalSourceLink toGoalSourceLink(Map<String, Object> rawLink) {
        String url = trimToNull(readString(rawLink.get("url")));
        if (url == null) {
            return null;
        }
        List<String> sections = null;
        Object rawSections = rawLink.get("sections");
        if (rawSections instanceof List<?> list) {
            sections = list.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .map(this::trimToNull)
                    .filter(Objects::nonNull)
                    .toList();
        }
        return new GoalSourceLink(
                trimToNull(readString(rawLink.get("type"))),
                trimToNull(readString(rawLink.get("title"))),
                url,
                trimToNull(readString(rawLink.get("resourceType"))),
                trimToNull(readString(rawLink.get("provider"))),
                sections,
                trimToNull(readString(rawLink.get("description"))),
                trimToNull(readString(rawLink.get("lang"))),
                trimToNull(readString(rawLink.get("license"))),
                trimToNull(readString(rawLink.get("skillpilotId"))),
                trimToNull(readString(rawLink.get("role"))),
                trimToNull(readString(rawLink.get("altText"))),
                trimToNull(readString(rawLink.get("reviewStatus"))));
    }

    private String extractLicenseFromTags(List<String> tags) {
        if (tags == null) {
            return null;
        }
        for (String tag : tags) {
            if (tag == null) {
                continue;
            }
            if (tag.startsWith("license:")) {
                return trimToNull(tag.substring("license:".length()));
            }
        }
        return null;
    }

    private String readString(Object value) {
        return value instanceof String str ? str : null;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String coalesce(String first, String second) {
        return first != null ? first : second;
    }

    private FrontierGoal resolveActiveGoal(String goalId, Map<String, LearningGoal> allGoals) {
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        LearningGoal g = allGoals.get(goalId);
        if (g == null) {
            String containerId = landscapeService.getLandscapeIdForGoal(goalId);
            if (containerId != null) {
                SkillLandscape l = landscapeService.getById(containerId);
                if (l != null && l.getGoals() != null) {
                    g = l.getGoals().stream().filter(goal -> goal.getId().equals(goalId)).findFirst().orElse(null);
                }
            }
        }
        if (g == null) {
            return new FrontierGoal(goalId, "Unknown Goal", "", "unknown", null, "Active",
                    null, null, null, null, null, null);
        }
        return toFrontierGoal(g, "Active", g.getExamData());
    }

    private void ensureLearnerExists(String skillpilotId) {
        if (!learnerRepository.existsById(skillpilotId)) {
            throw new ResponseStatusException(NOT_FOUND, "Learner not found");
        }
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableBaseCurricula() {
        return getAvailableBaseCurricula(true);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableBaseCurricula(boolean includeCompatibility) {
        return landscapeService.getBaseCurricula(includeCompatibility);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableLandscapes() {
        return getAvailableLandscapes(true);
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.landscape.LandscapeSummary> getAvailableLandscapes(boolean includeCompatibility) {
        return landscapeService.getOverview("de", includeCompatibility).getSummaries();
    }

    /**
     * Materializes the canonical stage for Gymnasium learners that were saved
     * before the authored personalization flow existed.
     *
     * <p>The migration is deliberately narrower than normal personalization:
     * it only recognizes the former pair of explicit stage markers, never
     * guesses from subjects, goals or course profiles, and never revalidates
     * Level 3 or Level 4 state. A complete legacy selection is marked as
     * migrated so newly introduced flow decisions do not make the learner
     * repeat established choices.</p>
     */
    public int migrateCanonicalGymnasiumPreFlowPersonalization() {
        List<String> learnerIds =
                learnerRepository.findSkillpilotIdsBySelectedCurriculum(
                        CANONICAL_GYMNASIUM_ROOT_ID);
        int migrated = 0;
        int failed = 0;
        for (String learnerId : learnerIds) {
            try {
                Boolean changed = transactionTemplate.execute(status -> {
                    Learner learner = learnerRepository
                            .findBySkillpilotIdForUpdate(learnerId)
                            .orElse(null);
                    return learner != null
                            && migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(
                                    learner);
                });
                if (Boolean.TRUE.equals(changed)) {
                    migrated++;
                }
            } catch (RuntimeException exception) {
                failed++;
                LOGGER.error(
                        "Canonical Gymnasium pre-flow personalization migration failed for one learner.",
                        exception);
            }
        }
        if (migrated > 0 || failed > 0) {
            LOGGER.info(
                    "Canonical Gymnasium pre-flow personalization migration finished: {} migrated, {} failed.",
                    migrated,
                    failed);
        }
        return migrated;
    }

    @SuppressWarnings("unchecked")
    private boolean migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(
            Learner learner) {
        if (learner == null
                || !CANONICAL_GYMNASIUM_ROOT_ID.equals(
                        learner.getSelectedCurriculum())
                || learner.getPersonalCurriculum() == null
                || learner.getPersonalCurriculum().isBlank()) {
            return false;
        }

        MutablePersonalCurriculumDocument storedDocument =
                readPersonalCurriculumDocument(
                        learner.getPersonalCurriculum());
        Map<String, Object> storedPayload = storedDocument.payload();
        Map<String, Map<String, Object>> parsedConfig =
                parsePersonalCurriculumConfig(learner.getPersonalCurriculum());
        if (storedPayload.isEmpty()
                || parsedConfig.isEmpty()
                || storedPayload.containsKey(
                        CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)) {
            return false;
        }
        Map<String, Object> parsedRootSettings =
                parsedConfig.get(CANONICAL_GYMNASIUM_ROOT_ID);
        if (parsedRootSettings == null
                || parsedRootSettings.containsKey("stage")) {
            // A stored canonical value, including a malformed explicit value,
            // is never overwritten by the compatibility migration.
            return false;
        }

        Boolean sek1Selected =
                readSelectedFlagIfPresent(parsedConfig, STAGE_SCOPE_SEK1_ID);
        Boolean sek2Selected =
                readSelectedFlagIfPresent(parsedConfig, STAGE_SCOPE_SEK2_ID);
        if (sek1Selected == null || sek2Selected == null) {
            // Both historical fields must be present and well-typed. A
            // missing or malformed half is not enough evidence for migration.
            return false;
        }
        String canonicalStage = null;
        if (Boolean.TRUE.equals(sek1Selected)
                && Boolean.TRUE.equals(sek2Selected)) {
            canonicalStage = "CrossStage";
        } else if (Boolean.TRUE.equals(sek1Selected)) {
            canonicalStage = "SekI";
        } else if (Boolean.TRUE.equals(sek2Selected)) {
            canonicalStage = "SekII";
        }
        if (canonicalStage == null) {
            // false/false is intentionally unresolved and must remain a real
            // learner decision.
            return false;
        }

        SkillLandscape rootLandscape =
                landscapeService.getById(CANONICAL_GYMNASIUM_ROOT_ID);
        boolean hasAuthoredRootSelection =
                rootLandscape != null
                        && rootLandscape.getPersonalizationFlow() != null
                        && Boolean.TRUE.equals(parsedRootSettings.get("selected"))
                        && canonicalConfiguredFilterId(
                                rootLandscape,
                                parsedRootSettings.get("filterId")) != null;
        boolean hasAuthoredSubjectSelection =
                hasAuthoredRootSelection
                        && CurriculumPersonalizationPlanner.storedSelections(
                                        rootLandscape.getPersonalizationFlow(),
                                        landscapeService::getById,
                                        parsedConfig)
                                .stream()
                                .filter(Objects::nonNull)
                                .anyMatch(selection ->
                                        selection.activeAndAuthored()
                                                && "subject".equals(
                                                        selection.groupId()));
        if (!hasAuthoredSubjectSelection) {
            // Do not turn a partial or foreign JSON payload into a completed
            // personalization merely because it contains legacy marker names.
            return false;
        }

        Map<String, Object> migratedConfig = storedPayload;
        Object rawRootSettings =
                migratedConfig.get(CANONICAL_GYMNASIUM_ROOT_ID);
        if (!(rawRootSettings instanceof Map<?, ?> existingRootSettings)) {
            return false;
        }
        Map<String, Object> rootSettings =
                new LinkedHashMap<>(
                        (Map<String, Object>) existingRootSettings);
        rootSettings.put("stage", canonicalStage);
        migratedConfig.put(CANONICAL_GYMNASIUM_ROOT_ID, rootSettings);

        /*
         * Do not replay the current authored flow here. Historical profiles
         * may contain valid legacy values (for example a broad subject filter)
         * that are no longer selectable as new per-subject choices. The
         * compatibility marker deliberately grandfathers those values without
         * normalizing, deleting or interpreting them.
         */
        CurriculumPersonalizationPlanner.markMigrationCompleted(
                migratedConfig,
                CANONICAL_GYMNASIUM_ROOT_ID);

        learner.setPersonalCurriculum(
                writePersonalCurriculumConfig(storedDocument.document()));
        advanceCoachStateRevision(learner);
        return true;
    }

    @Transactional
    public PersonalizationPlan getPersonalizationPlan(String skillpilotId) {
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);
        return buildPersonalizationPlan(learner);
    }

    /** Side-effect-free personalization projection for read-only coach tools. */
    @Transactional(readOnly = true)
    public PersonalizationPlan getCoachPersonalizationPlan(String skillpilotId) {
        Learner learner = learnerRepository.findById(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        return buildPersonalizationPlan(learner);
    }

    private PersonalizationPlan buildPersonalizationPlan(Learner learner) {
        if (learner == null) {
            return PersonalizationPlan.complete(List.of());
        }
        String curriculumId = learner.getSelectedCurriculum();
        if (curriculumId == null || curriculumId.isBlank()) {
            return PersonalizationPlan.complete(List.of());
        }

        Map<String, Object> personalCurriculum =
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum());
        PersonalizationPlan plan = rawPersonalizationPlan(
                curriculumId,
                learner.getPersonalCurriculum(),
                parsePersonalCurriculumConfig(
                        writePersonalCurriculumConfig(personalCurriculum)));
        return decoratePersonalizationPlan(
                plan,
                curriculumId,
                personalCurriculum);
    }

    private PersonalizationPlan decoratePersonalizationPlan(
            PersonalizationPlan plan,
            String rootLandscapeId,
            Map<String, Object> personalCurriculum) {
        if (plan == null
                || !plan.valid()
                || rootLandscapeId == null
                || rootLandscapeId.isBlank()) {
            return plan;
        }
        boolean migratedSummary = plan.canReopenMigratedPersonalization();
        if (!migratedSummary
                && (!plan.required() || plan.groupId() == null)) {
            return plan;
        }
        SkillLandscape root = landscapeService.getById(rootLandscapeId);
        if (root == null || root.getPersonalizationFlow() == null) {
            return plan;
        }

        Set<String> unavailableGroupIds = migratedSummary
                ? Set.of()
                : CurriculumPersonalizationPlanner.dependentGroupIds(
                        root.getPersonalizationFlow(),
                        plan.groupId());
        Set<String> visibleDecisionInstances = plan.completedDecisions().stream()
                .filter(Objects::nonNull)
                .map(decision -> decision.groupId()
                        + "\u0000"
                        + decision.groupInstanceId())
                .collect(Collectors.toSet());
        List<CurriculumPersonalizationPlanner.StoredSelection> storedSelections =
                CurriculumPersonalizationPlanner.storedSelections(
                        root.getPersonalizationFlow(),
                        landscapeService::getById,
                        parsePersonalCurriculumConfig(
                                writePersonalCurriculumConfig(personalCurriculum)));

        LinkedHashMap<String, CurriculumPersonalizationPlanner.StoredSelection> summaries =
                new LinkedHashMap<>();
        LinkedHashMap<String, List<PersonalizationPlan.Option>> optionsByDecision =
                new LinkedHashMap<>();
        for (CurriculumPersonalizationPlanner.StoredSelection stored : storedSelections) {
            if (stored == null || !stored.activeAndAuthored()) {
                continue;
            }
            boolean belongsToUnavailableDependentGroup =
                    !Objects.equals(plan.groupId(), stored.groupId())
                            && unavailableGroupIds.contains(stored.groupId());
            if (belongsToUnavailableDependentGroup
                    || Objects.equals(plan.groupInstanceId(), stored.groupInstanceId())) {
                continue;
            }
            String decisionKey =
                    stored.groupId() + "\u0000" + stored.groupInstanceId();
            if (visibleDecisionInstances.contains(decisionKey)) {
                continue;
            }
            summaries.putIfAbsent(decisionKey, stored);
            optionsByDecision
                    .computeIfAbsent(decisionKey, ignored -> new ArrayList<>())
                    .add(storedSelectionOption(stored));
        }
        if (summaries.isEmpty()) {
            return plan;
        }

        List<PersonalizationPlan.DecisionSummary> preservedDecisions =
                summaries.entrySet().stream()
                        .map(entry -> {
                            CurriculumPersonalizationPlanner.StoredSelection stored =
                                    entry.getValue();
                            return new PersonalizationPlan.DecisionSummary(
                                    stored.stageId(),
                                    stored.stageLabel(),
                                    stored.groupId(),
                                    stored.groupLabel(),
                                    stored.groupInstanceId(),
                                    optionsByDecision.get(entry.getKey()),
                                    stored.stageLabelEn(),
                                    stored.groupLabelEn());
                        })
                        .toList();
        return plan.withPreservedDecisions(preservedDecisions);
    }

    private PersonalizationPlan.Option storedSelectionOption(
            CurriculumPersonalizationPlanner.StoredSelection stored) {
        String displayOptionId = "preserved-"
                + UUID.nameUUIDFromBytes(String.join(
                                "\u0000",
                                Objects.toString(stored.groupId(), ""),
                                Objects.toString(stored.groupInstanceId(), ""),
                                Objects.toString(stored.landscapeId(), ""),
                                Objects.toString(stored.filterId(), ""),
                                Objects.toString(stored.scopeKey(), ""),
                                Objects.toString(stored.scopeValue(), ""))
                        .getBytes(StandardCharsets.UTF_8));
        return new PersonalizationPlan.Option(
                displayOptionId,
                stored.stageId(),
                stored.groupId(),
                stored.groupInstanceId(),
                stored.landscapeId(),
                personalizationLandscapeLabel(stored.landscapeId()),
                stored.filterId(),
                personalizationFilterLabel(
                        stored.landscapeId(),
                        stored.filterId()),
                stored.scopeKey(),
                stored.scopeValue(),
                stored.scopeLabel(),
                stored.kind(),
                personalizationLandscapeLabelEn(stored.landscapeId()),
                personalizationFilterLabelEn(
                        stored.landscapeId(),
                        stored.filterId()),
                stored.scopeLabelEn());
    }

    private String personalizationLandscapeLabel(String landscapeId) {
        if (landscapeId == null || landscapeId.isBlank()) {
            return null;
        }
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null) {
            return landscapeId;
        }
        if (landscape.getSubject() != null && !landscape.getSubject().isBlank()) {
            return landscape.getSubject();
        }
        if (landscape.getTitle() != null && !landscape.getTitle().isBlank()) {
            return landscape.getTitle();
        }
        return landscapeId;
    }

    private String personalizationLandscapeLabelEn(String landscapeId) {
        if (landscapeId == null || landscapeId.isBlank()) {
            return null;
        }
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape != null
                && landscape.getTitleEn() != null
                && !landscape.getTitleEn().isBlank()) {
            return landscape.getTitleEn();
        }
        return personalizationLandscapeLabel(landscapeId);
    }

    private String personalizationFilterLabel(
            String landscapeId,
            String filterId) {
        if (filterId == null || filterId.isBlank()) {
            return null;
        }
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null || landscape.getFilters() == null) {
            return filterId;
        }
        return landscape.getFilters().stream()
                .filter(Objects::nonNull)
                .filter(filter -> filter.getId() != null
                        && filter.getId().equalsIgnoreCase(filterId))
                .map(filter -> filter.getLabel() == null
                                || filter.getLabel().isBlank()
                        ? filter.getId()
                        : filter.getLabel())
                .findFirst()
                .orElse(filterId);
    }

    private String personalizationFilterLabelEn(
            String landscapeId,
            String filterId) {
        if (filterId == null || filterId.isBlank()) {
            return null;
        }
        SkillLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null || landscape.getFilters() == null) {
            return filterId;
        }
        return landscape.getFilters().stream()
                .filter(Objects::nonNull)
                .filter(filter -> filter.getId() != null
                        && filter.getId().equalsIgnoreCase(filterId))
                .map(filter -> filter.getLabelEn() == null
                                || filter.getLabelEn().isBlank()
                        ? (filter.getLabel() == null || filter.getLabel().isBlank()
                                ? filter.getId()
                                : filter.getLabel())
                        : filter.getLabelEn())
                .findFirst()
                .orElseGet(() -> personalizationFilterLabel(landscapeId, filterId));
    }

    private void assertPersonalizationCompleteForLearning(Learner learner) {
        if (learner == null
                || learner.getSelectedCurriculum() == null
                || learner.getSelectedCurriculum().isBlank()) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT,
                    "Select a base curriculum before setting a learning focus or active goal.");
        }
        migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(learner);
        PersonalizationPlan plan = buildPersonalizationPlan(learner);
        if (plan.valid() && !plan.required()) {
            return;
        }
        throw new ResponseStatusException(
                org.springframework.http.HttpStatus.CONFLICT,
                "Complete a valid personal curriculum before setting a learning focus or active goal.");
    }

    private final CurriculumPersonalizationOfferingResolver personalizationOfferings =
            new CurriculumPersonalizationOfferingResolver() {
                @Override
                public Map<String, String> resolveScope(String landscapeId, Map<String, String> requestedScope) {
                    return resolvePersonalizationOfferingScope(landscapeId, requestedScope);
                }

                @Override
                public List<PersonalizationScopeValue> extensionOptions(
                        String landscapeId, Map<String, String> requestedScope) {
                    return compositionViewService == null || !compositionViewService.hasRepositoryExtensionViews(landscapeId)
                            ? List.of()
                            : SubjectExtensionScope.options(
                                    compositionViewService.findLearnerScopeView(landscapeId, requestedScope));
                }
            };

    private Map<String, String> resolvePersonalizationOfferingScope(
            String landscapeId,
            Map<String, String> requestedScope) {
        if (compositionViewService == null
                || landscapeId == null
                || landscapeId.isBlank()
                || requestedScope == null
                || requestedScope.isEmpty()) {
            return null;
        }
        ProjectionComputationCache cache = transactionProjectionCache();
        if (cache == null) {
            return computePersonalizationOfferingScope(landscapeId, requestedScope);
        }
        OfferingScopeKey key = new OfferingScopeKey(landscapeId,
                Collections.unmodifiableMap(new LinkedHashMap<>(requestedScope)));
        return cache.offeringScopes.computeIfAbsent(key, ignored -> Optional.ofNullable(
                computePersonalizationOfferingScope(landscapeId, requestedScope))).orElse(null);
    }

    private Map<String, String> computePersonalizationOfferingScope(
            String landscapeId,
            Map<String, String> requestedScope) {
        Map<String, Object> resolvedView =
                compositionViewService.findLearnerScopeView(
                        landscapeId,
                        requestedScope);
        if (resolvedView == null || !(resolvedView.get("scope") instanceof Map<?, ?> rawScope)) {
            return null;
        }
        Map<String, String> scope = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : rawScope.entrySet()) {
            if (!(entry.getKey() instanceof String key)
                    || key.isBlank()
                    || !(entry.getValue() instanceof String value)
                    || value.isBlank()) {
                return null;
            }
            scope.put(key, value);
        }
        return scope.isEmpty() ? null : Map.copyOf(scope);
    }

    @Transactional(readOnly = true)
    public Set<String> getFilteredAtomicGoalIds(
            String curriculumId,
            String personalCurriculumJson,
            String topicId,
            boolean ignoreCourseFilters) {
        GoalProjection projection = getGoalProjection(curriculumId, personalCurriculumJson, ignoreCourseFilters);
        Map<String, LearningGoal> filteredGoals = projection.visibleGoals();
        if (filteredGoals.isEmpty()) {
            return Collections.emptySet();
        }
        if (topicId == null || topicId.isBlank()) {
            return filteredGoals.values().stream()
                    .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                    .map(LearningGoal::getId)
                    .filter(id -> !projection.extensionPreparations().contains(id))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        }
        Set<String> structuralTopicGoalIds = new LinkedHashSet<>();
        collectStructuralGoalAndDescendantIds(topicId, structuralTopicGoalIds, new HashSet<>());
        return filteredGoals.values().stream()
                .filter(goal -> structuralTopicGoalIds.contains(goal.getId()))
                .filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                .map(LearningGoal::getId)
                .filter(id -> !projection.extensionPreparations().contains(id))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson) {
        return getGoalProjection(curriculumId, personalCurriculumJson).visibleGoals();
    }

    private Map<String, LearningGoal> getStructuralGoals(String curriculumId) {
        return getGoalProjection(curriculumId, "{}", true).structuralGoals();
    }

    private Map<String, LearningGoal> getFilteredGoals(String curriculumId, String personalCurriculumJson,
            boolean ignoreCourseFilters) {
        return getGoalProjection(curriculumId, personalCurriculumJson, ignoreCourseFilters).visibleGoals();
    }

    private record CurriculumConfigurationKey(String curriculumId, String personalCurriculumJson) { }

    private record ProjectionKey(String curriculumId, String personalCurriculumJson, boolean ignoreCourseFilters) { }

    private record OfferingScopeKey(String landscapeId, Map<String, String> requestedScope) { }

    /**
     * Pure projection work is shared only inside the current transaction. This
     * synchronization belongs to Spring's transaction lifecycle, including
     * suspension for REQUIRES_NEW; it stores no learner/mastery/session state.
     * Configuration changes create another exact key, and completion discards
     * all results. No request or transaction can reuse a preceding one's cache.
     */
    private static final class ProjectionComputationCache implements TransactionSynchronization {
        private final LearnerService owner;
        private final Map<ProjectionKey, GoalProjection> projections = new HashMap<>();
        private final Map<Map<String, LearningGoal>, Map<String, String>> legacySourceGoalIds =
                new java.util.IdentityHashMap<>();
        private final Map<CurriculumConfigurationKey, PersonalizationPlan> personalizationPlans = new HashMap<>();
        private final Map<OfferingScopeKey, Optional<Map<String, String>>> offeringScopes = new HashMap<>();

        private ProjectionComputationCache(LearnerService owner) {
            this.owner = owner;
        }

        @Override
        public void afterCompletion(int status) {
            projections.clear();
            legacySourceGoalIds.clear();
            personalizationPlans.clear();
            offeringScopes.clear();
        }
    }

    private ProjectionComputationCache transactionProjectionCache() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || !TransactionSynchronizationManager.isSynchronizationActive()) {
            return null;
        }
        for (TransactionSynchronization synchronization : TransactionSynchronizationManager.getSynchronizations()) {
            if (synchronization instanceof ProjectionComputationCache cache && cache.owner == this) {
                return cache;
            }
        }
        ProjectionComputationCache cache = new ProjectionComputationCache(this);
        TransactionSynchronizationManager.registerSynchronization(cache);
        return cache;
    }

    private PersonalizationPlan rawPersonalizationPlan(
            String curriculumId,
            String personalCurriculumJson,
            Map<String, Map<String, Object>> config) {
        ProjectionComputationCache cache = transactionProjectionCache();
        if (cache == null) {
            return CurriculumPersonalizationPlanner.plan(curriculumId, landscapeService::getById,
                    personalizationOfferings, config);
        }
        CurriculumConfigurationKey key = new CurriculumConfigurationKey(curriculumId, personalCurriculumJson);
        return cache.personalizationPlans.computeIfAbsent(key, ignored -> CurriculumPersonalizationPlanner.plan(
                curriculumId, landscapeService::getById, personalizationOfferings, config));
    }

    private GoalProjection getGoalProjection(String curriculumId, String personalCurriculumJson) {
        return getGoalProjection(curriculumId, personalCurriculumJson, false);
    }

    private GoalProjection getGoalProjection(
            String curriculumId,
            String personalCurriculumJson,
            boolean ignoreCourseFilters) {
        ProjectionComputationCache cache = transactionProjectionCache();
        if (cache == null) {
            return computeGoalProjection(curriculumId, personalCurriculumJson, ignoreCourseFilters);
        }
        ProjectionKey key = new ProjectionKey(curriculumId, personalCurriculumJson, ignoreCourseFilters);
        return cache.projections.computeIfAbsent(key, ignored ->
                computeGoalProjection(curriculumId, personalCurriculumJson, ignoreCourseFilters));
    }

    private GoalProjection computeGoalProjection(
            String curriculumId,
            String personalCurriculumJson,
            boolean ignoreCourseFilters) {
        return projectGoals(curriculumId, personalCurriculumJson, ignoreCourseFilters, !ignoreCourseFilters);
    }

    private GoalProjection computeSeedGoalProjection(
            String curriculumId, String personalCurriculumJson, boolean ignoreCourseFilters) {
        return projectGoals(curriculumId, personalCurriculumJson, ignoreCourseFilters, false);
    }

    private GoalProjection projectGoals(String curriculumId, String personalCurriculumJson,
            boolean ignoreCourseFilters, boolean closeLearningScope) {
        SkillLandscape root = landscapeService.getById(curriculumId);
        Map<String, Map<String, Object>> config = parsePersonalCurriculumConfig(personalCurriculumJson);
        List<SkillLandscape> runtimeLandscapes =
                resolveRuntimeLandscapes(curriculumId, root, config, personalCurriculumJson);

        String rootFilterId = null;
        String rootDurationModel = null;
        boolean legacyRootFilters = usesLegacyStructuredFilterSemantics(root);
        if (!config.isEmpty()) {
            Map<String, Object> rootConfig = config.get(curriculumId);
            if (rootConfig != null) {
                Object rootFilterObj = rootConfig.get("filterId");
                if (rootFilterObj instanceof String) {
                    rootFilterId = canonicalConfiguredFilterId(root, rootFilterObj);
                }
                Object rootDurationObj = rootConfig.get("durationModel");
                if (legacyRootFilters && rootDurationObj instanceof String) {
                    rootDurationModel = normalizeFilterId((String) rootDurationObj);
                }
            }
        }

        Map<String, Set<String>> mappedCanonicalGoalIdsByState = new HashMap<>();
        Map<String, Boolean> canonicalStateCoverageCache = new HashMap<>();
        Map<String, LearningGoal> allGoals = new LinkedHashMap<>();
        Map<String, LearningGoal> structuralGoals = new LinkedHashMap<>();
        for (SkillLandscape l : runtimeLandscapes) {
            // Filter by landscape selection
            // With a sparse personalization configuration, descendants are active
            // only when explicitly selected. The root remains active unless it is
            // explicitly disabled.
            boolean isRoot = l.getLandscapeId().equals(curriculumId);
            boolean isSelected = config.isEmpty() || isRoot;
            String filterId = null;
            String durationModel = null;

            if (!config.isEmpty()) {
                Map<String, Object> landscapeConfig = config.get(l.getLandscapeId());
                if (landscapeConfig != null) {
                    Object selectedObj = landscapeConfig.get("selected");
                    isSelected = isRoot
                            ? !Boolean.FALSE.equals(selectedObj)
                            : Boolean.TRUE.equals(selectedObj);
                    Object filterObj = landscapeConfig.get("filterId");
                    if (filterObj instanceof String) {
                        filterId = canonicalConfiguredFilterId(l, filterObj);
                    }
                    Object durationObj = landscapeConfig.get("durationModel");
                    if (usesLegacyStructuredFilterSemantics(l) && durationObj instanceof String) {
                        durationModel = normalizeFilterId((String) durationObj);
                    }
                }
            }

            if (!isSelected) {
                continue;
            }

            List<String> effectiveFilterIds = new ArrayList<>();
            if (filterId != null && !filterId.isBlank()) {
                effectiveFilterIds.add(filterId);
            }
            if (rootFilterId != null
                    && legacyRootFilters
                    && isStateFilterId(normalizeFilterId(rootFilterId))
                    && !l.getLandscapeId().equals(curriculumId)
                    && !effectiveFilterIds.contains(rootFilterId)) {
                effectiveFilterIds.add(rootFilterId);
            }
            if (usesLegacyStructuredFilterSemantics(l)
                    && durationModel != null
                    && DURATION_MODEL_FILTER_IDS.contains(durationModel)
                    && !effectiveFilterIds.contains(durationModel)) {
                effectiveFilterIds.add(durationModel);
            } else if (legacyRootFilters
                    && rootDurationModel != null
                    && DURATION_MODEL_FILTER_IDS.contains(rootDurationModel)
                    && !l.getLandscapeId().equals(curriculumId)
                    && !effectiveFilterIds.contains(rootDurationModel)) {
                effectiveFilterIds.add(rootDurationModel);
            }

            // Bavaria uses GK for compulsory Mathematics and LK for those
            // goals plus all Vertiefungskurs modules. Legacy GK/LK tags on
            // shared canonical goals describe other states' courses. The
            // authored Bavarian composition view owns this course selection.
            if ("DE-BY".equals(normalizeFilterId(rootFilterId))
                    && CANONICAL_GYMNASIUM_MATH_ID.equals(l.getLandscapeId())
                    && compositionViewService != null
                    && compositionViewService.findLearnerScopeView(
                            l.getLandscapeId(), deriveCompositionScope(l.getLandscapeId(), config)) != null) {
                effectiveFilterIds.removeIf(id -> COURSE_FILTER_IDS.contains(normalizeFilterId(id)));
            }

            if (l.getGoals() != null) {
                for (LearningGoal g : l.getGoals()) {
                    structuralGoals.put(g.getId(), g);
                    if (!matchesAllEffectiveFilters(g, l, effectiveFilterIds, ignoreCourseFilters, mappedCanonicalGoalIdsByState,
                            canonicalStateCoverageCache)) {
                        continue;
                    }
                    allGoals.put(g.getId(), g);
                }
            }
        }
        if (ignoreCourseFilters) return identityGoalProjection(allGoals, structuralGoals);
        GoalProjection seeds = applyCompositionViewProjection(curriculumId, allGoals, structuralGoals, config, runtimeLandscapes);
        if (!closeLearningScope) return seeds;
        GoalProjection projection = closePersonalCurriculumLearningScope(curriculumId, seeds);
        // A foundation restored by prerequisite closure belongs to its unit and releases its cards there.
        DeclaredCourseUnits declared = DeclaredCourseUnits.build(runtimeLandscapes, projection.visibleGoals(),
                projection.targetGoalIds(), id -> compositionViewService != null
                        && (compositionViewService.isAuthoritativeForLandscape(id) || compositionViewService.hasRepositoryViews(id)),
                id -> projectedAtomicTargetIds(List.of(id), projection));
        if (declared == DeclaredCourseUnits.EMPTY) return projection;
        return new GoalProjection(projection.visibleGoals(), projection.targetGoalIds(), projection.prerequisiteOnlyGoalIds(),
                projection.structuralGoals(), projection.compositionViewIds(), projection.presentationRootGoalIds(),
                projection.compositionViewApplied(), projection.learningScope(), projection.canonicalPrerequisiteGoals(),
                declared, projection.learnerViews(), projection.extensionPreparations(), projection.explicitExtensionLandscapeIds(),
                projection.extensionPreparationTopology(), projection.removedExtensionGoalIdsByLandscape());
    }

    /** Select reviewed seeds first, then retain their full canonical atomic demand. */
    private GoalProjection closePersonalCurriculumLearningScope(
            String curriculumId, GoalProjection projection) {
        LinkedHashSet<String> seeds = projection.targetGoalIds().stream()
                .filter(id -> isAtomicGoal(projection.structuralGoals().get(id)))
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (seeds.isEmpty()) return projection;

        CompletionCanonicalGraphResolver resolver = completionCanonicalGraphResolver != null
                ? completionCanonicalGraphResolver
                : new CompletionCanonicalGraphResolver(landscapeService, objectMapper);
        Map<String, LearningGoal> canonical;
        PersonalCurriculumLearningScope.Compilation compilation;
        try {
            canonical = resolver.loadForAtomicSeeds(curriculumId, seeds, projection.structuralGoals());
            compilation = PersonalCurriculumLearningScope.compileWithTopology(canonical, seeds);
        } catch (CompletionCompilationException notCompilable) {
            // A graph that is not strictly compilable keeps its reviewed seed scope without
            // the derived closure: state, results and exports stay readable. No learning
            // basis is claimed, so the projection carries no learning scope.
            if (reportedSeedScopeFallbacks.add(curriculumId + ":" + notCompilable.code())) {
                LOGGER.warn("Personal learning scope of curriculum {} keeps its seed scope: {} ({})",
                        curriculumId, notCompilable.code(), notCompilable.getMessage());
            }
            return projection;
        }
        PersonalCurriculumLearningScope learningScope = compilation.scope();
        Map<String, LearningGoal> structural = new LinkedHashMap<>(projection.structuralGoals());
        canonical.forEach(structural::putIfAbsent);
        Map<String, LearningGoal> visible = new LinkedHashMap<>(projection.visibleGoals());
        // Retain the bounded canonical context too: required clusters and
        // inheritance ancestors must not disappear from the exported graph.
        canonical.forEach(visible::putIfAbsent);
        LinkedHashSet<String> targets = new LinkedHashSet<>(projection.targetGoalIds());
        targets.addAll(learningScope.learningAtomicGoalIds());
        LinkedHashSet<String> support = new LinkedHashSet<>(projection.prerequisiteOnlyGoalIds());
        support.removeAll(learningScope.learningAtomicGoalIds());
        Set<String> extensionPreparations = new LinkedHashSet<>(projection.extensionPreparations());
        extensionPreparations.retainAll(learningScope.learningAtomicGoalIds());
        support.addAll(extensionPreparations);
        Map<String, Set<String>> removedExtensionGoalIdsByLandscape = new LinkedHashMap<>();
        projection.removedExtensionGoalIdsByLandscape().forEach((landscapeId, ids) -> {
            Set<String> removed = new LinkedHashSet<>(ids);
            removed.removeAll(learningScope.learningAtomicGoalIds());
            if (!removed.isEmpty()) removedExtensionGoalIdsByLandscape.put(landscapeId, Set.copyOf(removed));
        });
        return new GoalProjection(immutableGoalMap(visible), Collections.unmodifiableSet(targets),
                Collections.unmodifiableSet(support), immutableGoalMap(structural),
                projection.compositionViewIds(), projection.presentationRootGoalIds(),
                projection.compositionViewApplied(), learningScope, immutableGoalMap(canonical), DeclaredCourseUnits.EMPTY,
                projection.learnerViews(), Set.copyOf(extensionPreparations), projection.explicitExtensionLandscapeIds(),
                extensionPreparations.isEmpty() ? null : compilation.topology(), Map.copyOf(removedExtensionGoalIdsByLandscape));
    }

    /**
     * Resolves the landscapes that may contribute goals to the current learner
     * runtime.
     *
     * <p>The skill-graph closure remains the compatibility baseline.
     * Additionally, a landscape can enter the runtime only when all of the
     * following hold:</p>
     *
     * <ol>
     *   <li>the root curriculum has a valid authored personalization flow,</li>
     *   <li>the validated plan exposes the landscape as an authored option, and</li>
     *   <li>the learner configuration marks that exact landscape as selected.</li>
     * </ol>
     *
     * <p>This deliberately does not inspect goal IDs, {@code contains},
     * {@code requires}, subjects, regions, course labels, or other
     * curriculum-specific conventions. Unknown or unrelated configuration
     * entries therefore cannot inject a runtime landscape.</p>
     */
    private List<SkillLandscape> resolveRuntimeLandscapes(
            String curriculumId,
            SkillLandscape root,
            Map<String, Map<String, Object>> config,
            String personalCurriculumJson) {
        LinkedHashMap<String, SkillLandscape> resolved = new LinkedHashMap<>();
        List<SkillLandscape> graphClosure = landscapeService.getClosure(curriculumId);
        if (graphClosure != null) {
            for (SkillLandscape landscape : graphClosure) {
                addRuntimeLandscape(resolved, landscape);
            }
        }
        addRuntimeLandscape(resolved, root);

        if (root == null
                || root.getPersonalizationFlow() == null
                || config == null
                || config.isEmpty()) {
            return List.copyOf(resolved.values());
        }

        PersonalizationPlan plan = rawPersonalizationPlan(
                curriculumId,
                personalCurriculumJson,
                config);
        if (!plan.valid()) {
            return List.copyOf(resolved.values());
        }

        for (PersonalizationPlan.Option option : plan.navigationOptions()) {
            if (option == null
                    || option.landscapeId() == null
                    || option.landscapeId().isBlank()
                    || resolved.containsKey(option.landscapeId())) {
                continue;
            }
            Map<String, Object> landscapeConfig = config.get(option.landscapeId());
            if (landscapeConfig == null
                    || !Boolean.TRUE.equals(landscapeConfig.get("selected"))) {
                continue;
            }
            SkillLandscape selectedLandscape =
                    landscapeService.getById(option.landscapeId());
            if (selectedLandscape != null
                    && option.landscapeId().equals(selectedLandscape.getLandscapeId())) {
                addRuntimeLandscape(resolved, selectedLandscape);
            }
        }
        return List.copyOf(resolved.values());
    }

    private void addRuntimeLandscape(
            Map<String, SkillLandscape> target,
            SkillLandscape landscape) {
        if (target == null
                || landscape == null
                || landscape.getLandscapeId() == null
                || landscape.getLandscapeId().isBlank()) {
            return;
        }
        target.putIfAbsent(landscape.getLandscapeId(), landscape);
    }

    private Map<String, LearningGoal> applyCompositionViewScope(
            String curriculumId,
            Map<String, LearningGoal> allGoals,
            Map<String, Map<String, Object>> config,
            List<SkillLandscape> closure) {
        return applyCompositionViewProjection(
                curriculumId,
                allGoals,
                allGoals,
                config,
                closure).visibleGoals();
    }

    private GoalProjection applyCompositionViewProjection(
            String curriculumId,
            Map<String, LearningGoal> allGoals,
            Map<String, LearningGoal> structuralGoals,
            Map<String, Map<String, Object>> config,
            List<SkillLandscape> closure) {
        if (compositionViewService == null
                || curriculumId == null
                || curriculumId.isBlank()
                || allGoals == null
                || allGoals.isEmpty()
                || closure == null
                || closure.isEmpty()) {
            return identityGoalProjection(allGoals, structuralGoals);
        }
        boolean authoritativeCurriculum = compositionViewService.isAuthoritativeForLandscape(curriculumId);
        if ((config == null || config.isEmpty()) && !authoritativeCurriculum) {
            return identityGoalProjection(allGoals, structuralGoals);
        }
        Map<String, Map<String, Object>> effectiveConfig =
                config == null ? Collections.emptyMap() : config;

        LinkedHashMap<String, CompositionGoalReference> referencedGoals = new LinkedHashMap<>();
        List<Map<String, CompositionGoalReference>> referencesByView = new ArrayList<>();
        LinkedHashSet<String> fallbackGoalIds = new LinkedHashSet<>();
        LinkedHashSet<String> compositionViewIds = new LinkedHashSet<>();
        Map<String, Map<String, Object>> learnerViews = new LinkedHashMap<>();
        Map<String, CompositionGoalReference> excludedReferences = new LinkedHashMap<>();
        Map<String, Map<String, CompositionGoalReference>> deselectedExtensionReferences = new LinkedHashMap<>();
        Set<String> explicitExtensionLandscapeIds = new LinkedHashSet<>();
        LinkedHashSet<String> presentationRootGoalIds = new LinkedHashSet<>();
        boolean authoritativeCandidateSeen = authoritativeCurriculum;
        boolean defaultCurriculumViewRequested = authoritativeCurriculum && effectiveConfig.isEmpty();
        if (defaultCurriculumViewRequested) {
            Map<String, Object> defaultView = compositionViewService.findDefaultView(curriculumId);
            if (defaultView != null && !defaultView.isEmpty()) {
                if (CompositionViewExtensions.supports(defaultView)) {
                    defaultView = compositionViewService.selectExtensionsForLearnerScope(defaultView, null).view();
                    learnerViews.put(readString(defaultView.get("viewId")), defaultView);
                }
                addCompositionViewId(defaultView, compositionViewIds);
                addCompositionPresentationRootGoalId(
                        defaultView,
                        landscapeService.getById(readString(defaultView.get("landscapeId"))),
                        presentationRootGoalIds);
                collectCompositionViewGoalReferences(defaultView.get("rootNodes"), referencedGoals);
                referencesByView.add(new LinkedHashMap<>(referencedGoals));
            }
            authoritativeCandidateSeen = true;
        }
        for (SkillLandscape landscape : closure) {
            if (!isCompositionViewCandidate(curriculumId, landscape, effectiveConfig)) {
                continue;
            }
            String landscapeId = landscape.getLandscapeId();
            if (defaultCurriculumViewRequested && landscapeId.equals(curriculumId)) continue;
            boolean authoritative = compositionViewService.isAuthoritativeForLandscape(landscapeId);
            authoritativeCandidateSeen |= authoritative;
            Map<String, String> requestedScope = deriveCompositionScope(landscapeId, effectiveConfig);
            if (requestedScope.isEmpty()) {
                if (!authoritative) {
                    addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
                }
                continue;
            }
            Map<String, Object> matchedView =
                    compositionViewService.findLearnerScopeView(landscapeId, requestedScope);
            if (matchedView == null || matchedView.isEmpty()) {
                if (!authoritative) {
                    addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
                }
                continue;
            }
            if (CompositionViewExtensions.supports(matchedView)) {
                authoritative = true;
                authoritativeCandidateSeen = true;
                Map<String, Object> settings = effectiveConfig.getOrDefault(landscapeId, Map.of());
                Object choice = settings.get(SubjectExtensionScope.KEY);
                if (settings.containsKey(SubjectExtensionScope.KEY)) {
                    CompositionViewExtensions.validateStoredSelection(choice);
                    explicitExtensionLandscapeIds.add(landscapeId);
                }
                var selection = compositionViewService.selectExtensionsForLearnerScope(matchedView, choice);
                matchedView = selection.view();
                learnerViews.put(readString(matchedView.get("viewId")), matchedView);
                if (choice != null) {
                    collectCompositionViewGoalReferences(selection.excludedNodes(), excludedReferences);
                    var deselectedSections = selection.excludedNodes().stream()
                            .filter(node -> node.containsKey("extension")).toList();
                    if (!deselectedSections.isEmpty()) {
                        Map<String, CompositionGoalReference> references = new LinkedHashMap<>();
                        collectCompositionViewGoalReferences(deselectedSections, references);
                        deselectedExtensionReferences.put(landscapeId, references);
                    }
                }
            }
            addCompositionViewId(matchedView, compositionViewIds);
            addCompositionPresentationRootGoalId(
                    matchedView,
                    landscape,
                    presentationRootGoalIds);
            LinkedHashMap<String, CompositionGoalReference> landscapeReferencedGoals = new LinkedHashMap<>();
            collectCompositionViewGoalReferences(matchedView.get("rootNodes"), landscapeReferencedGoals);
            if (landscapeReferencedGoals.isEmpty()) {
                if (!authoritative) {
                    addFilteredLandscapeGoalIds(landscape, allGoals, fallbackGoalIds);
                }
            } else {
                referencesByView.add(landscapeReferencedGoals);
                landscapeReferencedGoals.forEach((goalId, reference) ->
                        referencedGoals.merge(goalId, reference, this::mergeCompositionGoalReferences));
            }
        }

        if (referencedGoals.isEmpty() && fallbackGoalIds.isEmpty()) {
            return authoritativeCandidateSeen
                    ? emptyGoalProjection(structuralGoals)
                    : identityGoalProjection(allGoals, structuralGoals);
        }

        Map<String, LearningGoal> compositionStructuralGoals =
                hydrateExternalPrerequisiteOnlyStructuralGoals(
                        referencedGoals,
                        structuralGoals);
        Map<String, CompositionProjectionAssignment> projectionAssignments = new LinkedHashMap<>();
        Set<String> independentlyPresentedRootGoalIds = new LinkedHashSet<>();
        for (Map<String, CompositionGoalReference> viewReferences : referencesByView) {
            // Specificity resolves roles inside one subject view. Independently
            // selected views then join their targets without removing enrollment.
            Map<String, CompositionProjectionAssignment> viewAssignments =
                    resolveCompositionProjectionAssignments(viewReferences, compositionStructuralGoals);
            Set<String> viewTargetAncestors = viewAssignments.entrySet().stream()
                    .filter(entry -> entry.getValue().role() == ProjectionRole.TARGET)
                    .map(Map.Entry::getKey)
                    .filter(allGoals::containsKey)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            addCompositionAncestors(compositionStructuralGoals, viewTargetAncestors);
            for (String rootGoalId : presentationRootGoalIds) {
                CompositionProjectionAssignment ownAssignment = viewAssignments.get(rootGoalId);
                if (viewTargetAncestors.contains(rootGoalId)
                        && (ownAssignment == null || ownAssignment.role() == ProjectionRole.TARGET)) {
                    independentlyPresentedRootGoalIds.add(rootGoalId);
                }
            }
            viewAssignments.forEach((goalId, assignment) -> {
                CompositionProjectionAssignment current = projectionAssignments.get(goalId);
                if (current != null && current.role() != assignment.role()) {
                    if (assignment.role() == ProjectionRole.TARGET) {
                        projectionAssignments.put(goalId, assignment);
                    }
                } else {
                    mergeCompositionProjectionAssignment(goalId, assignment, projectionAssignments);
                }
            });
        }
        LinkedHashSet<String> targetGoalIds = projectionAssignments.entrySet().stream()
                .filter(entry -> entry.getValue().role() == ProjectionRole.TARGET)
                .map(Map.Entry::getKey)
                .filter(allGoals::containsKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        targetGoalIds.addAll(fallbackGoalIds);
        if (targetGoalIds.isEmpty()) {
            return authoritativeCandidateSeen
                    ? emptyGoalProjection(compositionStructuralGoals)
                    : identityGoalProjection(allGoals, compositionStructuralGoals);
        }

        LinkedHashSet<String> prerequisiteOnlyGoalIds = projectionAssignments.entrySet().stream()
                .filter(entry -> entry.getValue().role() == ProjectionRole.PREREQUISITE_ONLY)
                .map(Map.Entry::getKey)
                .filter(compositionStructuralGoals::containsKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        // Non-authoritative fallback goals are learner-facing targets.
        prerequisiteOnlyGoalIds.removeAll(targetGoalIds);
        // A foreign support view cannot hide the existing navigation anchor
        // of an independently selected subject. This does not enroll the
        // anchor as a target or override POnly authored in that own view.
        prerequisiteOnlyGoalIds.removeAll(independentlyPresentedRootGoalIds);

        LinkedHashSet<String> visibleGoalIds = new LinkedHashSet<>(targetGoalIds);
        addCompositionAncestors(allGoals, visibleGoalIds);

        Map<String, LearningGoal> scopedGoals = new LinkedHashMap<>();
        for (Map.Entry<String, LearningGoal> entry : allGoals.entrySet()) {
            if (visibleGoalIds.contains(entry.getKey())) {
                LearningGoal scopedGoal = entry.getValue();
                scopedGoals.put(entry.getKey(), scopedGoal);
            }
        }
        if (scopedGoals.isEmpty() && !authoritativeCandidateSeen) {
            return identityGoalProjection(allGoals, structuralGoals);
        }

        LinkedHashSet<String> effectiveTargetGoalIds = targetGoalIds.stream()
                .filter(scopedGoals::containsKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        LinkedHashSet<String> effectivePrerequisiteOnlyGoalIds = prerequisiteOnlyGoalIds.stream()
                .filter(compositionStructuralGoals::containsKey)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Set<String> excludedGoalIds = resolveCompositionProjectionAssignments(excludedReferences, compositionStructuralGoals)
                .keySet();
        excludedGoalIds.removeAll(effectiveTargetGoalIds);
        Set<String> extensionPreparations = Set.copyOf(excludedGoalIds);
        // Historical assessments are migrated independently of deselecting an extension.
        // A surviving placement or a prerequisite retained by closure keeps its card origins.
        Map<String, Set<String>> removedExtensionGoalIdsByLandscape = new LinkedHashMap<>();
        deselectedExtensionReferences.forEach((landscapeId, references) -> {
            Set<String> removed = resolveCompositionProjectionAssignments(references, compositionStructuralGoals)
                    .entrySet().stream()
                    .filter(entry -> entry.getValue().role() == ProjectionRole.TARGET)
                    .map(Map.Entry::getKey)
                    .filter(allGoals::containsKey)
                    .filter(id -> !effectiveTargetGoalIds.contains(id) && !effectivePrerequisiteOnlyGoalIds.contains(id))
                    .collect(Collectors.toUnmodifiableSet());
            if (!removed.isEmpty()) removedExtensionGoalIdsByLandscape.put(landscapeId, removed);
        });
        var removedOrigins = Map.copyOf(removedExtensionGoalIdsByLandscape);
        var projectedViews = Map.copyOf(learnerViews);
        var explicitLandscapeIds = Set.copyOf(explicitExtensionLandscapeIds);
        GoalProjection provisionalProjection = new GoalProjection(
                immutableGoalMap(scopedGoals),
                Collections.unmodifiableSet(effectiveTargetGoalIds),
                Collections.unmodifiableSet(effectivePrerequisiteOnlyGoalIds),
                immutableGoalMap(compositionStructuralGoals),
                Collections.unmodifiableSet(compositionViewIds),
                Collections.emptyList(),
                true, null, Map.of(), DeclaredCourseUnits.EMPTY,
                projectedViews, extensionPreparations, explicitLandscapeIds, null, removedOrigins);
        List<String> effectivePresentationRootGoalIds = orderVisibleFocusGoalIds(
                        presentationRootGoalIds,
                        provisionalProjection.visibleGoals()).stream()
                .filter(goalId -> isProjectedTargetFocus(goalId, provisionalProjection))
                .toList();
        return new GoalProjection(
                provisionalProjection.visibleGoals(),
                provisionalProjection.targetGoalIds(),
                provisionalProjection.prerequisiteOnlyGoalIds(),
                provisionalProjection.structuralGoals(),
                provisionalProjection.compositionViewIds(),
                effectivePresentationRootGoalIds,
                true, null, Map.of(), DeclaredCourseUnits.EMPTY,
                projectedViews, extensionPreparations, explicitLandscapeIds, null, removedOrigins);
    }

    private GoalProjection identityGoalProjection(
            Map<String, LearningGoal> visibleGoals,
            Map<String, LearningGoal> structuralGoals) {
        Map<String, LearningGoal> immutableVisibleGoals = immutableGoalMap(visibleGoals);
        Map<String, LearningGoal> immutableStructuralGoals =
                immutableGoalMap(structuralGoals == null || structuralGoals.isEmpty()
                        ? visibleGoals
                        : structuralGoals);
        LinkedHashSet<String> targetGoalIds = new LinkedHashSet<>(immutableVisibleGoals.keySet());
        return new GoalProjection(
                immutableVisibleGoals,
                Collections.unmodifiableSet(targetGoalIds),
                Collections.emptySet(),
                immutableStructuralGoals,
                Collections.emptySet(),
                Collections.emptyList(),
                false, null, Collections.emptyMap());
    }

    private GoalProjection emptyGoalProjection(Map<String, LearningGoal> structuralGoals) {
        return new GoalProjection(
                Collections.emptyMap(),
                Collections.emptySet(),
                Collections.emptySet(),
                immutableGoalMap(structuralGoals),
                Collections.emptySet(),
                Collections.emptyList(),
                true, null, Collections.emptyMap());
    }

    private void addCompositionViewId(
            Map<String, Object> view,
            Set<String> viewIds) {
        if (view == null || viewIds == null) {
            return;
        }
        Object rawViewId = view.get("viewId");
        if (rawViewId instanceof String viewId && !viewId.isBlank()) {
            viewIds.add(viewId);
        }
    }

    /**
     * Captures the same authored presentation anchor that the cockpit uses
     * while the matching view and landscape are still explicit. This keeps a
     * connecting catalog/overview ancestor out of the learner's default focus
     * without deriving curriculum semantics from IDs, titles, stages, or
     * subjects later in the runtime.
     */
    private void addCompositionPresentationRootGoalId(
            Map<String, Object> view,
            SkillLandscape landscape,
            Set<String> presentationRootGoalIds) {
        if (view == null
                || landscape == null
                || presentationRootGoalIds == null
                || !Objects.equals(
                        readString(view.get("landscapeId")),
                        landscape.getLandscapeId())
                || landscape.getGoals() == null) {
            return;
        }
        landscape.getGoals().stream()
                .filter(Objects::nonNull)
                .filter(goal -> goal.getId() != null && !goal.getId().isBlank())
                .filter(goal -> goal.getTags() != null && goal.getTags().contains("root"))
                .filter(goal -> goal.getContains() != null && !goal.getContains().isEmpty())
                .map(LearningGoal::getId)
                .findFirst()
                .ifPresent(presentationRootGoalIds::add);
    }

    /** The type {@link #immutableGoalMap} returns: a private copy nobody can change. */
    private static final Class<?> IMMUTABLE_GOAL_MAP_TYPE =
            Collections.unmodifiableMap(new LinkedHashMap<String, LearningGoal>()).getClass();

    /** The first goal per legacy source id, in the order a scan of the map finds it. */
    private Map<String, String> indexGoalIdsByLegacySourceId(Map<String, LearningGoal> goals) {
        Map<String, String> index = new HashMap<>();
        for (LearningGoal goal : goals.values()) {
            String sourceGoalId = landscapeService.resolveGoalProvenanceValue(goal, "sourceGoalId");
            if (sourceGoalId != null) index.putIfAbsent(sourceGoalId, goal.getId());
        }
        return index;
    }

    private Map<String, LearningGoal> immutableGoalMap(Map<String, LearningGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return Collections.emptyMap();
        }
        return Collections.unmodifiableMap(new LinkedHashMap<>(goals));
    }

    private record GoalProjection(
            Map<String, LearningGoal> visibleGoals,
            Set<String> targetGoalIds,
            Set<String> prerequisiteOnlyGoalIds,
            Map<String, LearningGoal> structuralGoals,
            Set<String> compositionViewIds,
            List<String> presentationRootGoalIds,
            boolean compositionViewApplied,
            PersonalCurriculumLearningScope learningScope,
            Map<String, LearningGoal> canonicalPrerequisiteGoals,
            DeclaredCourseUnits declaredUnits,
            Map<String, Map<String, Object>> learnerViews,
            Set<String> extensionPreparations,
            Set<String> explicitExtensionLandscapeIds,
            CompletionProfileCompiler.PrerequisiteTopology extensionPreparationTopology,
            Map<String, Set<String>> removedExtensionGoalIdsByLandscape) {
        GoalProjection(Map<String, LearningGoal> visibleGoals, Set<String> targetGoalIds, Set<String> prerequisiteOnlyGoalIds,
                Map<String, LearningGoal> structuralGoals, Set<String> compositionViewIds, List<String> presentationRootGoalIds,
                boolean compositionViewApplied, PersonalCurriculumLearningScope learningScope,
                Map<String, LearningGoal> canonicalPrerequisiteGoals) {
            this(visibleGoals, targetGoalIds, prerequisiteOnlyGoalIds, structuralGoals, compositionViewIds,
                    presentationRootGoalIds, compositionViewApplied, learningScope, canonicalPrerequisiteGoals,
                    DeclaredCourseUnits.EMPTY, Map.of(), Set.of(), Set.of(), null, Map.of());
        }

        private Set<String> regularTargetGoalIds() {
            if (extensionPreparations.isEmpty()) return targetGoalIds;
            Set<String> regular = new LinkedHashSet<>(targetGoalIds);
            regular.removeAll(extensionPreparations);
            return regular;
        }
    }

    private enum ProjectionRole {
        TARGET,
        PREREQUISITE_ONLY;

        private static ProjectionRole from(Object rawRole) {
            return "prerequisiteOnly".equals(rawRole)
                    ? PREREQUISITE_ONLY
                    : TARGET;
        }
    }

    private record CompositionGoalReference(
            List<CompositionProjectionSource> sources) {

        private CompositionGoalReference {
            sources = sources == null ? List.of() : List.copyOf(sources);
        }
    }

    private record CompositionProjectionSource(
            boolean includeDescendants,
            ProjectionRole role) {
    }

    private record CompositionProjectionAssignment(
            ProjectionRole role,
            boolean direct,
            int distance) {
    }

    private void addFilteredLandscapeGoalIds(
            SkillLandscape landscape,
            Map<String, LearningGoal> allGoals,
            Set<String> goalIds) {
        if (landscape == null || landscape.getGoals() == null || allGoals == null || allGoals.isEmpty() || goalIds == null) {
            return;
        }
        for (LearningGoal goal : landscape.getGoals()) {
            if (goal != null && allGoals.containsKey(goal.getId())) {
                goalIds.add(goal.getId());
            }
        }
    }

    private boolean isCompositionViewCandidate(
            String curriculumId,
            SkillLandscape landscape,
            Map<String, Map<String, Object>> config) {
        if (!isCanonicalGymnasiumLandscape(landscape)) {
            return false;
        }
        String landscapeId = landscape.getLandscapeId();
        if (landscapeId == null || landscapeId.isBlank() || CANONICAL_GYMNASIUM_ROOT_ID.equals(landscapeId)) {
            return false;
        }
        if (landscapeId.equals(curriculumId)) {
            return true;
        }
        if (!config.containsKey(landscapeId)) {
            return false;
        }
        return readSelectedFlag(config, landscapeId);
    }

    private Map<String, String> deriveCompositionScope(String landscapeId, Map<String, Map<String, Object>> config) {
        String rootFilterId = readFilterId(config, CANONICAL_GYMNASIUM_ROOT_ID);
        String landscapeFilterId = readFilterId(config, landscapeId);
        String jurisdiction = resolveJurisdictionFilter(rootFilterId, landscapeFilterId);
        String courseProfile = normalizeCourseProfileScope(landscapeFilterId);
        String stage = inferCompositionStageScope(config, landscapeId);
        String durationModel = resolveDurationModelScope(
                readScopeValue(config, landscapeId, "durationModel"),
                readScopeValue(config, CANONICAL_GYMNASIUM_ROOT_ID, "durationModel"),
                rootFilterId,
                landscapeFilterId);

        if (jurisdiction == null && stage == null && courseProfile == null && durationModel == null) {
            return Collections.emptyMap();
        }

        Map<String, String> scope = new LinkedHashMap<>();
        scope.put("schoolForm", "Gymnasium");
        if (jurisdiction != null) {
            scope.put("jurisdiction", jurisdiction);
        }
        if (stage != null) {
            scope.put("stage", stage);
        }
        if (courseProfile != null && !"SekI".equals(stage)) {
            scope.put("courseProfile", courseProfile);
        }
        if (durationModel != null) {
            scope.put("durationModel", durationModel);
        }
        return scope;
    }

    private String readFilterId(Map<String, Map<String, Object>> config, String landscapeId) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object filterId = entry.get("filterId");
        return filterId instanceof String textFilterId ? normalizeFilterId(textFilterId) : null;
    }

    private String readScopeValue(Map<String, Map<String, Object>> config, String landscapeId, String key) {
        Map<String, Object> entry = config.get(landscapeId);
        if (entry == null) {
            return null;
        }
        Object value = entry.get(key);
        return value instanceof String textValue ? normalizeFilterId(textValue) : null;
    }

    private String resolveJurisdictionFilter(String... filterCandidates) {
        for (String filterCandidate : filterCandidates) {
            String jurisdiction = BundeslandCodeNormalizer.normalize(filterCandidate);
            if (jurisdiction != null && !jurisdiction.isBlank()) {
                return jurisdiction;
            }
        }
        return null;
    }

    private String resolveDurationModelScope(String... candidates) {
        for (String candidate : candidates) {
            String durationModel = normalizeDurationModelScope(candidate);
            if (durationModel != null) {
                return durationModel;
            }
        }
        return null;
    }

    private String normalizeDurationModelScope(String value) {
        String normalized = normalizeFilterId(value);
        if (normalized == null) {
            return null;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return DURATION_MODEL_FILTER_IDS.contains(normalized) ? normalized : null;
    }

    private String normalizeCourseProfileScope(String filterId) {
        String normalized = normalizeFilterId(filterId);
        if (normalized == null) {
            return null;
        }
        if ("ALL".equals(normalized) || COMBINED_COURSE_FILTER_ID.equals(normalized)) {
            return COMBINED_COURSE_FILTER_ID;
        }
        return COURSE_FILTER_IDS.contains(normalized) ? normalized : null;
    }

    private String inferCompositionStageScope(
            Map<String, Map<String, Object>> config,
            String landscapeId) {
        String explicitStage = resolveStageScope(
                readScopeValue(config, CANONICAL_GYMNASIUM_ROOT_ID, "stage"),
                readScopeValue(config, landscapeId, "stage"));
        if (explicitStage != null) {
            return explicitStage;
        }
        Boolean sek1Selected = readSelectedFlagIfPresent(config, STAGE_SCOPE_SEK1_ID);
        Boolean sek2Selected = readSelectedFlagIfPresent(config, STAGE_SCOPE_SEK2_ID);
        if (sek1Selected == null && sek2Selected == null) {
            return null;
        }
        if (Boolean.TRUE.equals(sek1Selected) && Boolean.TRUE.equals(sek2Selected)) {
            return "CrossStage";
        }
        if (Boolean.TRUE.equals(sek1Selected)) {
            return "SekI";
        }
        if (Boolean.TRUE.equals(sek2Selected)) {
            return "SekII";
        }
        return null;
    }

    private String resolveStageScope(String... candidates) {
        for (String candidate : candidates) {
            String normalized = normalizeFilterId(candidate);
            if ("SEKI".equals(normalized)) {
                return "SekI";
            }
            if ("SEKII".equals(normalized)) {
                return "SekII";
            }
            if ("CROSSSTAGE".equals(normalized)) {
                return "CrossStage";
            }
        }
        return null;
    }

    private boolean readSelectedFlag(Map<String, Map<String, Object>> config, String configId, boolean defaultValue) {
        if (config == null || config.isEmpty()) {
            return defaultValue;
        }
        Map<String, Object> entry = config.get(configId);
        if (entry == null) {
            return defaultValue;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean selectedFlag ? selectedFlag : defaultValue;
    }

    private Boolean readSelectedFlagIfPresent(
            Map<String, Map<String, Object>> config,
            String configId) {
        if (config == null || config.isEmpty()) {
            return null;
        }
        Map<String, Object> entry = config.get(configId);
        if (entry == null || !entry.containsKey("selected")) {
            return null;
        }
        Object selected = entry.get("selected");
        return selected instanceof Boolean selectedFlag ? selectedFlag : null;
    }

    private CompositionGoalReference mergeCompositionGoalReferences(
            CompositionGoalReference left,
            CompositionGoalReference right) {
        List<CompositionProjectionSource> mergedSources =
                new ArrayList<>(left == null ? List.of() : left.sources());
        if (right != null) {
            mergedSources.addAll(right.sources());
        }
        return new CompositionGoalReference(mergedSources);
    }

    /**
     * Adds only explicitly authored prerequisite-only references from a matched
     * composition view to the structural goal universe.
     *
     * <p>Cross-subject prerequisites do not have to belong to the selected
     * landscape closure. They still need their definitions for exact
     * prerequisite checks, while remaining outside the learner-facing target
     * and visible-goal sets. A direct {@code goalEntry} contributes exactly one
     * definition; a {@code canonicalSubtree} contributes its complete
     * {@code contains} subtree.</p>
     *
     * <p>A reference with any target source is not hydrated in this pass.
     * Unknown support references fail. A canonical cluster entry retains its
     * descendant basis rather than becoming a replacement atom.</p>
     */
    private Map<String, LearningGoal> hydrateExternalPrerequisiteOnlyStructuralGoals(
            Map<String, CompositionGoalReference> references,
            Map<String, LearningGoal> structuralGoals) {
        LinkedHashMap<String, LearningGoal> hydrated = new LinkedHashMap<>();
        if (structuralGoals != null) {
            hydrated.putAll(structuralGoals);
        }
        if (references == null || references.isEmpty()) {
            return hydrated;
        }

        references.forEach((goalRef, reference) -> {
            if (reference == null || reference.sources().isEmpty()) {
                return;
            }
            boolean exclusivelyPrerequisiteOnly = reference.sources().stream()
                    .allMatch(source -> source.role() == ProjectionRole.PREREQUISITE_ONLY);
            if (!exclusivelyPrerequisiteOnly) {
                return;
            }

            LearningGoal referencedGoal = resolveCompositionStructuralGoal(goalRef, hydrated);
            if (referencedGoal == null) {
                throw invalidCompositionPrerequisiteReference(
                        goalRef,
                        "does not resolve to a known goal");
            }

            for (CompositionProjectionSource source : reference.sources()) {
                if (source.includeDescendants() || !isAtomicGoal(referencedGoal)) {
                    hydrateExternalStructuralGoalAndDescendants(
                            goalRef,
                            hydrated,
                            new HashSet<>());
                } else {
                    LearningGoal goal = resolveCompositionStructuralGoal(goalRef, hydrated);
                    if (goal != null && goal.getId() != null && !goal.getId().isBlank()) {
                        hydrated.putIfAbsent(goal.getId(), goal);
                    }
                }
            }
        });
        return hydrated;
    }

    private void hydrateExternalStructuralGoalAndDescendants(
            String goalRef,
            Map<String, LearningGoal> structuralGoals,
            Set<String> visiting) {
        LearningGoal goal = resolveCompositionStructuralGoal(goalRef, structuralGoals);
        if (goal == null) {
            throw invalidCompositionPrerequisiteReference(
                    goalRef,
                    "canonicalSubtree contains an unknown goal");
        }
        if (goal.getId() == null || goal.getId().isBlank()) {
            throw invalidCompositionPrerequisiteReference(
                    goalRef,
                    "resolved goal has no stable id");
        }
        if (!visiting.add(goal.getId())) {
            return;
        }
        structuralGoals.putIfAbsent(goal.getId(), goal);
        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                hydrateExternalStructuralGoalAndDescendants(
                        childRef,
                        structuralGoals,
                        visiting);
            }
        }
        visiting.remove(goal.getId());
    }

    private LearningGoal resolveCompositionStructuralGoal(
            String goalRef,
            Map<String, LearningGoal> structuralGoals) {
        String resolvedGoalId = resolveGoalRef(goalRef, structuralGoals);
        if (resolvedGoalId != null) {
            return structuralGoals.get(resolvedGoalId);
        }
        LearningGoal definition = landscapeService.getGoalDefinition(goalRef);
        if (definition == null && goalRef != null && goalRef.contains(":")) {
            definition = landscapeService.getGoalDefinition(
                    goalRef.substring(goalRef.indexOf(':') + 1));
        }
        return definition;
    }

    private IllegalStateException invalidCompositionPrerequisiteReference(
            String goalRef,
            String reason) {
        return new IllegalStateException(
                "Invalid prerequisiteOnly composition reference '"
                        + goalRef
                        + "': "
                        + reason);
    }

    private Map<String, CompositionProjectionAssignment> resolveCompositionProjectionAssignments(
            Map<String, CompositionGoalReference> references,
            Map<String, LearningGoal> goals) {
        LinkedHashMap<String, CompositionProjectionAssignment> assignments =
                new LinkedHashMap<>();
        if (references == null
                || references.isEmpty()
                || goals == null
                || goals.isEmpty()) {
            return assignments;
        }
        references.forEach((referencedGoalId, reference) -> {
            if (reference == null || reference.sources().isEmpty()) {
                return;
            }
            String exactGoalId = resolveGoalRef(referencedGoalId, goals);
            if (exactGoalId == null) {
                LearningGoal external = resolveCompositionStructuralGoal(referencedGoalId, goals);
                if (external != null) {
                    goals.putIfAbsent(external.getId(), external);
                    exactGoalId = external.getId();
                }
            }
            if (exactGoalId == null || !goals.containsKey(exactGoalId)) {
                throw new CompletionCompilationException("MISSING_REFERENCE",
                        "Unknown composition seed reference " + referencedGoalId);
            }
            for (CompositionProjectionSource source : reference.sources()) {
                if (source.includeDescendants() || !isAtomicGoal(goals.get(exactGoalId))) {
                    assignCompositionSubtreeProjection(
                            exactGoalId,
                            source.role(),
                            goals,
                            assignments);
                }
                if (!source.includeDescendants()) {
                    mergeCompositionProjectionAssignment(
                            exactGoalId,
                            new CompositionProjectionAssignment(
                                    source.role(),
                                    true,
                                    0),
                            assignments);
                }
            }
        });
        return assignments;
    }

    private void assignCompositionSubtreeProjection(
            String goalId,
            ProjectionRole role,
            Map<String, LearningGoal> goals,
            Map<String, CompositionProjectionAssignment> assignments) {
        if (goalId == null || !goals.containsKey(goalId)) {
            return;
        }
        // Specificity is the shortest distance from this authored reference to
        // each goal, not its root's global depth. A shared descendant in a DAG
        // must not change roles because an unrelated branch has more ancestors.
        Map<String, Integer> distances = new HashMap<>();
        Map<String, Set<String>> children = new LinkedHashMap<>();
        Deque<String> pending = new ArrayDeque<>();
        distances.put(goalId, 0);
        pending.add(goalId);
        while (!pending.isEmpty()) {
            String currentId = pending.removeFirst();
            LearningGoal goal = goals.get(currentId);
            if (goal == null) continue;
            Set<String> resolvedChildren = new LinkedHashSet<>();
            children.put(currentId, resolvedChildren);
            int distance = distances.get(currentId);
            mergeCompositionProjectionAssignment(
                    currentId,
                    new CompositionProjectionAssignment(role, false, distance),
                    assignments);
            for (String childRef : goal.getContains() == null ? List.<String>of() : goal.getContains()) {
                String childId = resolveGoalRef(childRef, goals);
                if (childId == null) {
                    LearningGoal external = resolveCompositionStructuralGoal(childRef, goals);
                    if (external != null) {
                        goals.putIfAbsent(external.getId(), external);
                        childId = external.getId();
                    }
                }
                if (childId == null || !goals.containsKey(childId)) {
                    throw new CompletionCompilationException("MISSING_REFERENCE",
                            "Unknown composition contains reference " + childRef + " below " + currentId);
                }
                resolvedChildren.add(childId);
                if (!distances.containsKey(childId)) {
                    distances.put(childId, distance + 1);
                    pending.addLast(childId);
                }
            }
        }
        // Validate authored structure even if a cycle leaves no atomic seeds.
        Map<String, Integer> incoming = new LinkedHashMap<>();
        children.keySet().forEach(id -> incoming.put(id, 0));
        children.values().forEach(ids -> ids.forEach(id -> incoming.merge(id, 1, Integer::sum)));
        Deque<String> ready = new ArrayDeque<>();
        incoming.forEach((id, count) -> { if (count == 0) ready.addLast(id); });
        int visited = 0;
        while (!ready.isEmpty()) {
            String id = ready.removeFirst();
            visited++;
            for (String child : children.get(id)) {
                if (incoming.merge(child, -1, Integer::sum) == 0) ready.addLast(child);
            }
        }
        if (visited != children.size()) {
            throw new CompletionCompilationException("CONTAINS_CYCLE", "Cycle in composition subtree " + goalId);
        }
    }

    private void mergeCompositionProjectionAssignment(
            String goalId,
            CompositionProjectionAssignment candidate,
            Map<String, CompositionProjectionAssignment> assignments) {
        assignments.merge(goalId, candidate, (current, incoming) -> {
            if (current.direct() != incoming.direct()) {
                return incoming.direct() ? incoming : current;
            }
            if (!current.direct() && current.distance() != incoming.distance()) {
                return incoming.distance() < current.distance()
                        ? incoming
                        : current;
            }
            if (current.role() == ProjectionRole.TARGET
                    || incoming.role() == ProjectionRole.TARGET) {
                return new CompositionProjectionAssignment(
                        ProjectionRole.TARGET,
                        current.direct(),
                        Math.min(current.distance(), incoming.distance()));
            }
            return current;
        });
    }

    @SuppressWarnings("unchecked")
    private void collectCompositionViewGoalReferences(
            Object rawNodes,
            Map<String, CompositionGoalReference> goals) {
        if (!(rawNodes instanceof List<?> nodeList)) {
            return;
        }
        for (Object rawNode : nodeList) {
            if (!(rawNode instanceof Map<?, ?> node)) {
                continue;
            }
            Object kind = node.get("kind");
            if (!(kind instanceof String kindText)) {
                continue;
            }
            switch (kindText) {
                case "structure" -> collectCompositionViewGoalReferences(node.get("children"), goals);
                case "canonicalSubtree", "goalEntry" -> {
                    Object goalId = node.get("goalId");
                    if (goalId instanceof String goalIdText && !goalIdText.isBlank()) {
                        boolean includeDescendants = "canonicalSubtree".equals(kindText);
                        ProjectionRole role = ProjectionRole.from(node.get("projectionRole"));
                        goals.merge(
                                goalIdText,
                                new CompositionGoalReference(List.of(
                                        new CompositionProjectionSource(
                                                includeDescendants,
                                                role))),
                                this::mergeCompositionGoalReferences);
                    }
                }
                case "landscapeEntry" -> {
                    Object landscapeId = node.get("landscapeId");
                    if (landscapeId instanceof String landscapeIdText && !landscapeIdText.isBlank()) {
                        SkillLandscape landscape = landscapeService.getById(landscapeIdText);
                        if (landscape != null && landscape.getGoals() != null) {
                            landscape.getGoals().stream()
                                    .filter(goal -> goal.getTags() != null && goal.getTags().contains("root"))
                                    .findFirst()
                                    .map(LearningGoal::getId)
                                    .ifPresent(goalId -> goals.merge(
                                            goalId,
                                            new CompositionGoalReference(List.of(
                                                    new CompositionProjectionSource(
                                                            true,
                                                            ProjectionRole.TARGET))),
                                            this::mergeCompositionGoalReferences));
                        }
                    }
                }
                default -> {
                }
            }
        }
    }

    private void collectCompositionGoalAndDescendants(
            String goalRef,
            Map<String, LearningGoal> allGoals,
            Set<String> visibleGoalIds,
            Set<String> visiting) {
        String goalId = resolveGoalRef(goalRef, allGoals);
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null) {
            visiting.remove(goalId);
            return;
        }
        visibleGoalIds.add(goalId);
        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                collectCompositionGoalAndDescendants(childRef, allGoals, visibleGoalIds, visiting);
            }
        }
        visiting.remove(goalId);
    }

    private void addCompositionAncestors(Map<String, LearningGoal> allGoals, Set<String> visibleGoalIds) {
        boolean changed;
        do {
            changed = false;
            for (LearningGoal goal : allGoals.values()) {
                if (goal == null || visibleGoalIds.contains(goal.getId()) || goal.getContains() == null) {
                    continue;
                }
                for (String childRef : goal.getContains()) {
                    String childId = resolveGoalRef(childRef, allGoals);
                    if (childId != null && visibleGoalIds.contains(childId)) {
                        visibleGoalIds.add(goal.getId());
                        changed = true;
                        break;
                    }
                }
            }
        } while (changed);
    }

    private boolean matchesAllEffectiveFilters(LearningGoal goal, SkillLandscape landscape, List<String> effectiveFilterIds,
            boolean ignoreCourseFilters,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        if (effectiveFilterIds == null || effectiveFilterIds.isEmpty()) {
            return true;
        }
        for (String filterId : effectiveFilterIds) {
            if (!matchesFilter(goal, landscape, filterId, ignoreCourseFilters, mappedCanonicalGoalIdsByState,
                    canonicalStateCoverageCache)) {
                return false;
            }
        }
        return true;
    }

    private boolean matchesFilter(LearningGoal goal, SkillLandscape landscape, String filterId,
            boolean ignoreCourseFilters,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        String authoredFilterId = filterId == null ? null : filterId.trim();
        String normalizedFilterId = normalizeFilterId(filterId);
        if (normalizedFilterId == null || normalizedFilterId.isBlank()) {
            return true;
        }
        if (usesLegacyStructuredFilterSemantics(landscape)) {
            if ("ALL".equals(normalizedFilterId)) {
                return true;
            }
            if (COURSE_FILTER_IDS.contains(normalizedFilterId)) {
                if (ignoreCourseFilters) {
                    return true;
                }
                return matchesCourseFilter(goal, normalizedFilterId);
            }
            if (isStateFilterId(normalizedFilterId)) {
                return matchesStateFilter(goal, landscape, normalizedFilterId, mappedCanonicalGoalIdsByState,
                        canonicalStateCoverageCache);
            }
            if (DURATION_MODEL_FILTER_IDS.contains(normalizedFilterId)) {
                return matchesDurationModelFilter(goal, normalizedFilterId);
            }
        }
        return matchesTagFilter(goal, authoredFilterId);
    }

    private boolean isStateFilterId(String filterId) {
        return BundeslandCodeNormalizer.isStateFilterId(filterId);
    }

    private void collectVisibleAtomicGoalIds(
            String goalId,
            Map<String, LearningGoal> filteredGoals,
            Set<String> atomicIds,
            Set<String> visiting) {
        if (goalId == null || goalId.isBlank() || !visiting.add(goalId)) {
            return;
        }
        LearningGoal goal = filteredGoals.get(goalId);
        if (goal == null) {
            goal = landscapeService.getGoalDefinition(goalId);
        }
        if (goal == null) {
            visiting.remove(goalId);
            return;
        }
        List<String> contains = goal.getContains();
        if (contains == null || contains.isEmpty()) {
            if (filteredGoals.containsKey(goal.getId())) {
                atomicIds.add(goal.getId());
            }
            visiting.remove(goalId);
            return;
        }
        for (String childRef : contains) {
            String childId = resolveGoalRef(childRef, filteredGoals);
            if (childId == null) {
                LearningGoal child = landscapeService.getGoalDefinition(childRef);
                if (child == null && childRef.contains(":")) {
                    child = landscapeService.getGoalDefinition(childRef.substring(childRef.indexOf(':') + 1));
                }
                childId = child != null ? child.getId() : null;
            }
            if (childId != null) {
                collectVisibleAtomicGoalIds(childId, filteredGoals, atomicIds, visiting);
            }
        }
        visiting.remove(goalId);
    }

    private void collectStructuralGoalAndDescendantIds(
            String goalRef,
            Set<String> goalIds,
            Set<String> visiting) {
        if (goalRef == null || goalRef.isBlank()) {
            return;
        }
        LearningGoal goal = landscapeService.getGoalDefinition(goalRef);
        if (goal == null && goalRef.contains(":")) {
            goal = landscapeService.getGoalDefinition(goalRef.substring(goalRef.indexOf(':') + 1));
        }
        if (goal == null || !visiting.add(goal.getId())) {
            return;
        }
        goalIds.add(goal.getId());
        if (goal.getContains() != null) {
            for (String childRef : goal.getContains()) {
                collectStructuralGoalAndDescendantIds(childRef, goalIds, visiting);
            }
        }
        visiting.remove(goal.getId());
    }

    private boolean matchesCourseFilter(LearningGoal goal, String filterId) {
        if (COMBINED_COURSE_FILTER_ID.equals(filterId)) {
            return matchesCourseFilter(goal, "GK") || matchesCourseFilter(goal, "LK");
        }
        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }
        if (tags.contains(filterId)) {
            return true;
        }
        String releaseCourseLevel = goal.getRelease() != null ? normalizeFilterId(goal.getRelease().getCourseLevel()) : null;
        if (filterId.equals(releaseCourseLevel)) {
            return true;
        }
        boolean hasExplicitCourseRestriction = tags.contains("GK") || tags.contains("LK")
                || (releaseCourseLevel != null && !releaseCourseLevel.isBlank());
        return !hasExplicitCourseRestriction;
    }

    private boolean matchesStateFilter(LearningGoal goal, SkillLandscape landscape, String filterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState, Map<String, Boolean> canonicalStateCoverageCache) {
        if (isCanonicalGymnasiumLandscape(landscape)) {
            Boolean explicitApplicabilityMatch = matchesApplicabilityDimension(goal, APPLICABILITY_DIMENSION_JURISDICTION,
                    filterId);
            if (explicitApplicabilityMatch != null) {
                if (explicitApplicabilityMatch.booleanValue()) {
                    return true;
                }
            }
            return hasCanonicalStateCoverage(goal.getId(), filterId, mappedCanonicalGoalIdsByState,
                    canonicalStateCoverageCache, new HashSet<>());
        }
        String landscapeState = normalizeBundeslandCode(landscape);
        if (landscapeState != null) {
            return landscapeState.equals(filterId);
        }
        return matchesTagFilter(goal, filterId);
    }

    private Boolean matchesApplicabilityDimension(LearningGoal goal, String dimension, String filterId) {
        if (goal == null || dimension == null || dimension.isBlank() || filterId == null || filterId.isBlank()) {
            return null;
        }
        Map<String, List<String>> applicability = goal.getApplicability();
        if (applicability == null || applicability.isEmpty() || !applicability.containsKey(dimension)) {
            return null;
        }
        List<String> configuredValues = applicability.get(dimension);
        if (configuredValues == null || configuredValues.isEmpty()) {
            return false;
        }
        String normalizedFilterId = normalizeFilterId(filterId);
        for (String configuredValue : configuredValues) {
            if (normalizedFilterId.equals(normalizeFilterId(configuredValue))) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesDurationModelFilter(LearningGoal goal, String filterId) {
        Boolean explicitApplicabilityMatch = matchesApplicabilityDimension(goal, APPLICABILITY_DIMENSION_DURATION_MODEL,
                filterId);
        if (explicitApplicabilityMatch != null) {
            return explicitApplicabilityMatch.booleanValue();
        }

        List<String> tags = goal.getTags();
        if (tags == null || tags.isEmpty()) {
            return true;
        }

        String normalizedFilterId = normalizeFilterId(filterId);
        boolean hasExplicitDurationRestriction = false;
        for (String tag : tags) {
            String normalizedTag = normalizeDurationModelTag(tag);
            if (normalizedTag == null) {
                continue;
            }
            hasExplicitDurationRestriction = true;
            if (normalizedTag.equals(normalizedFilterId)) {
                return true;
            }
        }
        return !hasExplicitDurationRestriction;
    }

    private boolean hasCanonicalStateCoverage(String goalId, String stateFilterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState,
            Map<String, Boolean> canonicalStateCoverageCache,
            Set<String> visitedGoalIds) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        if (!visitedGoalIds.add(goalId)) {
            return false;
        }

        try {
            String cacheKey = stateFilterId + "::" + goalId;
            Boolean cached = canonicalStateCoverageCache.get(cacheKey);
            if (cached != null) {
                return cached;
            }

            LearningGoal goal = landscapeService.getGoalDefinition(goalId);
            if (goal == null) {
                canonicalStateCoverageCache.put(cacheKey, false);
                return false;
            }

            boolean covered = hasStateProvenance(goal, stateFilterId)
                    || getMappedCanonicalGoalIdsForState(stateFilterId, mappedCanonicalGoalIdsByState).contains(goalId);

            if (!covered && goal.getContains() != null) {
                for (String childId : goal.getContains()) {
                    if (hasCanonicalStateCoverage(childId, stateFilterId, mappedCanonicalGoalIdsByState,
                            canonicalStateCoverageCache, visitedGoalIds)) {
                        covered = true;
                        break;
                    }
                }
            }

            canonicalStateCoverageCache.put(cacheKey, covered);
            return covered;
        } finally {
            visitedGoalIds.remove(goalId);
        }
    }

    private boolean hasStateProvenance(LearningGoal goal, String stateFilterId) {
        Map<String, Object> provenance = landscapeService.resolveGoalProvenance(goal);
        if (provenance.isEmpty()) {
            return false;
        }

        List<String> referencedLandscapeIds = new ArrayList<>();
        collectLandscapeIdsFromProvenanceValue(provenance.get("sourceLandscapeId"), referencedLandscapeIds);
        collectLandscapeIdsFromProvenanceValue(provenance.get("additionalSourceLandscapeIds"), referencedLandscapeIds);
        collectLandscapeIdsFromProvenanceValue(provenance.get("crossSubjectPrerequisiteLandscapeIds"),
                referencedLandscapeIds);

        for (String landscapeId : referencedLandscapeIds) {
            if (stateFilterId.equals(landscapeService.resolveSourceLandscapeJurisdiction(landscapeId))) {
                return true;
            }
        }
        return false;
    }

    private void collectLandscapeIdsFromProvenanceValue(Object value, List<String> target) {
        if (value instanceof String text) {
            if (!text.isBlank()) {
                target.add(text);
            }
            return;
        }
        if (value instanceof List<?> list) {
            for (Object item : list) {
                if (item instanceof String text && !text.isBlank()) {
                    target.add(text);
                }
            }
        }
    }

    private Set<String> getMappedCanonicalGoalIdsForState(String stateFilterId,
            Map<String, Set<String>> mappedCanonicalGoalIdsByState) {
        return mappedCanonicalGoalIdsByState.computeIfAbsent(stateFilterId, key -> goalMappingService.getAllMappings().stream()
                .filter(mapping -> key.equals(landscapeService.resolveSourceLandscapeJurisdiction(mapping.sourceLandscapeId())))
                .map(ResolvedGoalMapping::canonicalGoalId)
                .collect(Collectors.toSet()));
    }

    private boolean isCanonicalGymnasiumLandscape(SkillLandscape landscape) {
        if (landscape == null) {
            return false;
        }
        String frameworkId = landscape.getFrameworkId();
        return frameworkId != null && frameworkId.startsWith("canonical-gymnasium");
    }

    private boolean usesLegacyStructuredFilterSemantics(SkillLandscape landscape) {
        return isCanonicalGymnasiumLandscape(landscape);
    }

    private boolean matchesTagFilter(LearningGoal goal, String filterId) {
        List<String> tags = goal.getTags();
        return tags == null
                || tags.isEmpty()
                || tags.stream().anyMatch(tag -> tag != null && tag.equalsIgnoreCase(filterId));
    }

    private String canonicalConfiguredFilterId(SkillLandscape landscape, Object rawFilterId) {
        if (!(rawFilterId instanceof String submitted) || submitted.isBlank()) {
            return null;
        }
        String canonical = CurriculumPersonalizationPlanner.canonicalFilterId(landscape, submitted);
        return canonical;
    }

    private String normalizeDurationModelTag(String value) {
        String normalized = normalizeFilterId(value);
        if (DURATION_MODEL_FILTER_IDS.contains(normalized)) {
            return normalized;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return null;
    }

    private String normalizeBundeslandCode(SkillLandscape landscape) {
        if (landscape == null) {
            return null;
        }
        return normalizeBundeslandCode(landscape.getRegion());
    }

    private String normalizeBundeslandCode(String region) {
        return BundeslandCodeNormalizer.normalize(region);
    }

    private String normalizeFilterId(String filterId) {
        if (filterId == null || filterId.isBlank()) {
            return null;
        }
        String normalized = filterId.trim().toUpperCase(Locale.ROOT);
        String normalizedBundesland = BundeslandCodeNormalizer.normalize(normalized);
        if (normalizedBundesland != null) {
            return normalizedBundesland;
        }
        if ("DURATIONMODEL:G8".equals(normalized) || "DURATION-MODEL:G8".equals(normalized)) {
            return "G8";
        }
        if ("DURATIONMODEL:G9".equals(normalized) || "DURATION-MODEL:G9".equals(normalized)) {
            return "G9";
        }
        return normalized;
    }

    // Package-private for testing
    Map<String, List<String>> computeEffectiveRequires(Map<String, LearningGoal> allGoals) {
        Map<String, List<String>> parentMap = new HashMap<>();
        for (LearningGoal goal : allGoals.values()) {
            List<String> contains = goal.getContains();
            if (contains == null) {
                continue;
            }
            for (String childRef : contains) {
                String resolvedChild = childRef;
                // Normalize "landscapeId:goalId" references if valid
                if (!allGoals.containsKey(resolvedChild) && childRef.contains(":")) {
                    String[] parts = childRef.split(":", 2);
                    if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                        resolvedChild = parts[1];
                    }
                }
                if (!allGoals.containsKey(resolvedChild)) {
                    continue;
                }
                List<String> parents = parentMap.getOrDefault(resolvedChild, new ArrayList<>());
                parents.add(goal.getId());
                parentMap.put(resolvedChild, parents);
            }
        }

        Map<String, List<String>> memo = new HashMap<>();
        Set<String> visiting = new HashSet<>();

        for (String goalId : allGoals.keySet()) {
            collectEffectiveRequires(goalId, allGoals, parentMap, memo, visiting);
        }
        return memo;
    }

    private List<String> collectEffectiveRequires(String goalId, Map<String, LearningGoal> allGoals,
            Map<String, List<String>> parentMap, Map<String, List<String>> memo, Set<String> visiting) {
        if (memo.containsKey(goalId)) {
            return memo.get(goalId);
        }
        if (visiting.contains(goalId)) {
            // Cycle guard: return direct requires only to avoid infinite recursion
            LearningGoal self = allGoals.get(goalId);
            List<String> direct = self != null && self.getRequires() != null ? self.getRequires()
                    : Collections.emptyList();
            memo.put(goalId, direct);
            return direct;
        }
        visiting.add(goalId);

        LinkedHashSet<String> effective = new LinkedHashSet<>();
        LearningGoal goal = allGoals.get(goalId);
        if (goal != null && goal.getRequires() != null) {
            effective.addAll(goal.getRequires());
        }

        List<String> parents = parentMap.getOrDefault(goalId, Collections.emptyList());
        for (String parentId : parents) {
            List<String> parentReqs = collectEffectiveRequires(parentId, allGoals, parentMap, memo, visiting);
            effective.addAll(parentReqs);
        }

        effective.remove(goalId); // avoid self-dependency through inheritance

        List<String> result = new ArrayList<>(effective);
        memo.put(goalId, result);
        visiting.remove(goalId);
        return result;
    }

    private String resolveGoalRef(String ref, Map<String, LearningGoal> allGoals) {
        if (ref == null || ref.isBlank() || allGoals == null || allGoals.isEmpty()) {
            return null;
        }
        if (allGoals.containsKey(ref)) {
            return ref;
        }
        if (ref.contains(":")) {
            String[] parts = ref.split(":", 2);
            if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                return parts[1];
            }
        }
        String suffix = ":" + ref;
        for (String key : allGoals.keySet()) {
            if (key.endsWith(suffix)) {
                return key;
            }
        }
        return null;
    }

    private LearningGoal cloneScopedGoal(LearningGoal goal, Map<String, LearningGoal> visibleGoals) {
        LearningGoal clonedGoal = objectMapper.convertValue(goal, LearningGoal.class);
        clonedGoal.setContains(filterVisibleGoalRefs(goal.getContains(), visibleGoals));
        clonedGoal.setRequires(filterVisibleGoalRefs(goal.getRequires(), visibleGoals));
        return clonedGoal;
    }

    private List<String> filterVisibleGoalRefs(List<String> refs, Map<String, LearningGoal> visibleGoals) {
        if (refs == null || refs.isEmpty() || visibleGoals == null || visibleGoals.isEmpty()) {
            return refs == null ? null : Collections.emptyList();
        }
        List<String> filtered = new ArrayList<>();
        for (String ref : refs) {
            if (resolveGoalRef(ref, visibleGoals) != null) {
                filtered.add(ref);
            }
        }
        return filtered;
    }

    private void collectDescendants(String goalId, Map<String, LearningGoal> allGoals, Set<String> result) {
        LearningGoal goal = allGoals.get(goalId);
        if (goal == null) {
            // Log warning?
            System.out.println("DEBUG_SKILLPILOT: collectDescendants failed to find goal: " + goalId);
            return;
        }
        if (goal.getContains() == null) {
            return;
        }
        for (String childRef : goal.getContains()) {
            String childId = childRef;
            boolean found = allGoals.containsKey(childId);

            // 1. Normalize "landscapeId:goalId" references if valid
            if (!found && childRef.contains(":")) {
                String[] parts = childRef.split(":", 2);
                if (parts.length == 2 && allGoals.containsKey(parts[1])) {
                    childId = parts[1];
                    found = true;
                }
            }

            // 2. Fuzzy Lookup: Try to find a key that ends with ":childRef"
            // This handles the case where the parent references "A" but the map has "S:A"
            if (!found) {
                final String suffix = ":" + childRef;
                for (String key : allGoals.keySet()) {
                    if (key.endsWith(suffix)) {
                        childId = key;
                        found = true;
                        break;
                    }
                }
            }

            if (result.add(childId)) { // Avoid cycles
                if (found) {
                    collectDescendants(childId, allGoals, result);
                } else {
                    System.out.println(
                            "DEBUG_SKILLPILOT: Could not resolve child: " + childRef + " for parent: " + goalId);
                }
            }
        }
    }

    private List<FrontierGoal> getTopLevelModules(String curriculumId, Map<String, LearningGoal> allGoals) {
        SkillLandscape curriculum = landscapeService.getById(curriculumId);
        if (curriculum == null || curriculum.getGoals() == null || curriculum.getGoals().isEmpty()) {
            return Collections.emptyList();
        }

        // Assume the first goal in the curriculum file is the root (e.g. "Program")
        // Or find the one that is "core" and has no parent within the file?
        // Usually the curriculum file defines the structure.
        // Let's take all goals defined in the curriculum file that are "roots" within
        // that file.

        // Better: The curriculum file usually defines a single root goal that contains
        // the subjects.
        // Let's iterate over goals in the curriculum landscape and find those that
        // contain others.

        List<FrontierGoal> roots = new ArrayList<>();
        for (LearningGoal g : curriculum.getGoals()) {
            if (g.getContains() != null && !g.getContains().isEmpty()) {
                for (String childRef : g.getContains()) {
                    String childId = childRef;
                    LearningGoal child = allGoals.get(childId);
                    if (child != null) {
                        roots.add(toFrontierGoal(child, "Module", null));
                    }
                }
                // If we found a container, we assume it's the root and we returned its
                // children.
                // We stop here to avoid returning the root itself or other things.
                // This assumes there is ONE main root in the curriculum file.
                if (!roots.isEmpty()) {
                    return roots;
                }
            }
        }
        return roots;
    }

    /**
     * Returns the highest visible structural roots in the exact deterministic
     * order used by the cockpit tree: authored {@code root} nodes first, then
     * {@code treeOrder}, source order, and title. The single-child suppression
     * mirrors the UI and prevents duplicate wrapper roots from winning over a
     * broader root that displays the same child.
     */
    private List<String> getVisibleRootFocusGoalIds(
            Map<String, LearningGoal> visibleGoals) {
        if (visibleGoals == null || visibleGoals.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Integer> authoredIndexByGoalId = new LinkedHashMap<>();
        Map<String, List<String>> parentIdsByChild = new LinkedHashMap<>();
        int authoredIndex = 0;
        for (LearningGoal goal : visibleGoals.values()) {
            if (goal == null || goal.getId() == null || goal.getId().isBlank()) {
                continue;
            }
            authoredIndexByGoalId.put(goal.getId(), authoredIndex++);
            if (goal.getContains() == null) {
                continue;
            }
            for (String childRef : goal.getContains()) {
                String childId = resolveGoalRef(childRef, visibleGoals);
                if (childId != null) {
                    parentIdsByChild
                            .computeIfAbsent(childId, ignored -> new ArrayList<>())
                            .add(goal.getId());
                }
            }
        }

        List<LearningGoal> roots = visibleGoals.values().stream()
                .filter(Objects::nonNull)
                .filter(goal -> goal.getId() != null && !goal.getId().isBlank())
                .filter(goal -> goal.getContains() != null && !goal.getContains().isEmpty())
                .filter(goal -> parentIdsByChild
                        .getOrDefault(goal.getId(), Collections.emptyList())
                        .isEmpty())
                .toList();
        Map<String, LearningGoal> rootsById = roots.stream()
                .collect(Collectors.toMap(
                        LearningGoal::getId,
                        goal -> goal,
                        (left, right) -> left,
                        LinkedHashMap::new));

        List<LearningGoal> explicitRoots = roots.stream()
                .filter(goal -> goal.getTags() != null && goal.getTags().contains("root"))
                .toList();
        List<LearningGoal> effectiveRoots = explicitRoots.isEmpty()
                ? roots.stream()
                        .filter(goal -> !isDuplicateSingleChildRoot(
                                goal,
                                rootsById,
                                parentIdsByChild,
                                visibleGoals))
                        .toList()
                : explicitRoots;

        return effectiveRoots.stream()
                .sorted(Comparator
                        .comparingInt(this::goalTreeOrder)
                        .thenComparingInt(goal -> authoredIndexByGoalId.getOrDefault(
                                goal.getId(),
                                Integer.MAX_VALUE))
                        .thenComparing(
                                goal -> goal.getTitle() == null ? "" : goal.getTitle(),
                                String.CASE_INSENSITIVE_ORDER))
                .map(LearningGoal::getId)
                .toList();
    }

    private boolean isDuplicateSingleChildRoot(
            LearningGoal goal,
            Map<String, LearningGoal> rootsById,
            Map<String, List<String>> parentIdsByChild,
            Map<String, LearningGoal> visibleGoals) {
        if (goal == null || goal.getContains() == null || goal.getContains().size() != 1) {
            return false;
        }
        String childId = resolveGoalRef(goal.getContains().get(0), visibleGoals);
        if (childId == null) {
            return false;
        }
        return parentIdsByChild.getOrDefault(childId, Collections.emptyList()).stream()
                .filter(parentId -> !parentId.equals(goal.getId()))
                .map(rootsById::get)
                .filter(Objects::nonNull)
                .anyMatch(otherRoot -> {
                    int otherChildCount = otherRoot.getContains() == null
                            ? 0
                            : otherRoot.getContains().size();
                    int childCount = goal.getContains().size();
                    return otherChildCount > childCount
                            || (otherChildCount == childCount
                                    && otherRoot.getId().compareTo(goal.getId()) < 0);
                });
    }

    private int goalTreeOrder(LearningGoal goal) {
        if (goal == null || goal.getExtendedData() == null) {
            return Integer.MAX_VALUE;
        }
        Object rawTreeOrder = goal.getExtendedData().get("treeOrder");
        return rawTreeOrder instanceof Number number
                ? number.intValue()
                : Integer.MAX_VALUE;
    }

    private List<FrontierGoal> getInitialScopeOptions(
            String curriculumId,
            GoalProjection projection) {
        if (projection == null) {
            return Collections.emptyList();
        }
        LinkedHashMap<String, FrontierGoal> options = new LinkedHashMap<>();
        DeclaredCourseUnits declared = projection.declaredUnits();
        for (DeclaredCourseUnits.Unit unit : declared.units()) {
            boolean topLevel = unit.atoms().stream()
                    .map(declared::path)
                    .anyMatch(path -> !path.isEmpty() && unit.equals(path.getLast()));
            if (!topLevel) continue;
            FrontierGoal option = focusNavigationGoal(unit.focusId(), projection, "Module");
            if (option != null) options.putIfAbsent(option.id(), option);
        }
        if (!projection.compositionViewApplied()) {
            List<FrontierGoal> legacyOptions = getTopLevelModules(curriculumId, projection.visibleGoals());
            if (options.isEmpty()) return legacyOptions;
            for (FrontierGoal option : legacyOptions) {
                var alias = declared.focus(option.id());
                FrontierGoal entry = alias == null ? option : toDeclaredUnitFrontierGoal(alias, "Module");
                options.putIfAbsent(entry.id(), entry);
            }
            return new ArrayList<>(options.values());
        }
        if (compositionViewService == null) return new ArrayList<>(options.values());

        LinkedHashSet<String> coveredLandscapeIds = new LinkedHashSet<>();
        for (String viewId : projection.compositionViewIds()) {
            boolean addedViewRoot = false;
            for (CompositionViewService.CompositionStructureResolution rootOption :
                    projectedRootOptions(viewId, projection)) {
                if (rootOption == null
                        || rootOption.syntheticGoalId() == null
                        || rootOption.syntheticGoalId().isBlank()
                        || !isProjectedTargetFocus(rootOption.syntheticGoalId(), projection)) {
                    continue;
                }

                FrontierGoal option;
                if (isCompositionStructureGoalId(rootOption.syntheticGoalId())) {
                    option = toCompositionStructureFrontierGoal(
                            rootOption.syntheticGoalId(),
                            "Module", projection);
                } else {
                    String goalId = resolveGoalIdInVisibleGoals(
                            rootOption.syntheticGoalId(),
                            projection.visibleGoals(),
                            true);
                    option = goalId == null
                            ? null
                            : toFrontierGoal(
                                    projection.visibleGoals().get(goalId),
                                    "Module",
                                    null);
                }
                if (option != null) {
                    options.putIfAbsent(option.id(), option);
                    addedViewRoot = true;
                }
            }
            if (addedViewRoot) {
                Map<String, Object> view = compositionViewService.findViewById(viewId);
                String landscapeId = view == null ? null : readString(view.get("landscapeId"));
                if (landscapeId != null && !landscapeId.isBlank()) {
                    coveredLandscapeIds.add(landscapeId);
                }
            }
        }
        for (FrontierGoal topLevelOption :
                getTopLevelModules(curriculumId, projection.visibleGoals())) {
            if (!isProjectedTargetFocus(topLevelOption.id(), projection)) {
                continue;
            }
            var alias = declared.focus(topLevelOption.id());
            String landscapeId = alias == null ? landscapeService.getLandscapeIdForGoal(topLevelOption.id())
                    : alias.landscapeId();
            if (landscapeId != null && coveredLandscapeIds.contains(landscapeId)) continue;
            FrontierGoal entry = alias == null ? topLevelOption : toDeclaredUnitFrontierGoal(alias, "Module");
            options.putIfAbsent(entry.id(), entry);
        }
        return new ArrayList<>(options.values());
    }

    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public SignedLearnerDataDTO exportLearner(String skillpilotId) {
        // Related rows may already have put a learner proxy in this transaction.
        // Always sign and return the same portable learner representation.
        Learner learner = org.hibernate.Hibernate.unproxy(getLearner(skillpilotId), Learner.class);
        Map<String, MasteryEntryDTO> mastery = getMasteryWithTimestamps(skillpilotId);
        List<String> planned = hasCompletedPersonalCurriculum(learner)
                ? getPlannedGoals(skillpilotId)
                : getStoredPlannedGoals(skillpilotId);
        return buildSignedLearnerExport(
                learner,
                mastery,
                planned,
                exportPersonalLearningPlans(skillpilotId));
    }

    @Transactional(readOnly = true)
    public List<com.skillpilot.backend.api.MasteryHistoryEntry> getHistory(String skillpilotId) {
        Learner learner = getLearner(skillpilotId);
        String curriculumId = learner.getSelectedCurriculum();
        Map<String, LearningGoal> goals = Collections.emptyMap();
        if (curriculumId != null && !curriculumId.isBlank()) {
            goals = getStructuralGoals(curriculumId);
        }
        final Set<String> goalIds = goals.isEmpty() ? Collections.emptySet() : new HashSet<>(goals.keySet());
        List<com.skillpilot.backend.api.MasteryHistoryEntry> history = new ArrayList<>();
        Set<String> observedGoals = new HashSet<>();
        if (goalCompletionService != null) {
            for (var completion : goalCompletionService.getHistory(skillpilotId)) {
                observedGoals.add(completion.getGoalId());
                if (isKnownHistoryGoal(completion.getGoalId(), goalIds)) {
                    history.add(new com.skillpilot.backend.api.MasteryHistoryEntry(
                            completion.getGoalId(), completion.getOccurredAt(),
                            completion.getMasteryValue(), "completion_event"));
                }
            }
        }
        // Keep pre-ledger history, but label the weaker timestamp evidence.
        // Neither these rows nor imports ever create daily completion credit.
        masteryRepository.findByLearner_SkillpilotId(skillpilotId)
                .stream()
                .filter(m -> m.getValue() >= PLANNING_SCOPE_MASTERY_THRESHOLD)
                .filter(m -> !observedGoals.contains(m.getGoalKey()))
                .filter(m -> isKnownHistoryGoal(m.getGoalKey(), goalIds))
                .map(m -> new com.skillpilot.backend.api.MasteryHistoryEntry(
                        m.getGoalKey(),
                        m.getUpdatedAt(),
                        m.getValue()))
                .forEach(history::add);
        return history.stream()
                .sorted(Comparator.comparing(
                        com.skillpilot.backend.api.MasteryHistoryEntry::timestamp,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    /** Real threshold crossings on the given Berlin day, still mastered now. */
    @Transactional(readOnly = true)
    public Map<String, Instant> getGoalCompletionsOnDate(String skillpilotId, LocalDate date) {
        ensureLearnerExists(skillpilotId);
        Objects.requireNonNull(date, "completion date");
        if (goalCompletionService == null) {
            return Map.of();
        }
        Set<String> masteredGoals = masteryRepository.findByLearner_SkillpilotId(skillpilotId).stream()
                .filter(mastery -> mastery.getValue() >= PLANNING_SCOPE_MASTERY_THRESHOLD)
                .map(Mastery::getGoalKey)
                .collect(Collectors.toSet());
        Map<String, Instant> completions = new LinkedHashMap<>();
        for (var completion : goalCompletionService.getCompletionsOnDate(skillpilotId, date)) {
            if (masteredGoals.contains(completion.getGoalId())) {
                completions.putIfAbsent(completion.getGoalId(), completion.getOccurredAt());
            }
        }
        return Collections.unmodifiableMap(completions);
    }

    /** Real threshold crossings in the given Berlin date range, still mastered now. */
    @Transactional(readOnly = true)
    public Map<String, Instant> getGoalCompletionsBetween(String skillpilotId, LocalDate startDate, LocalDate endDate) {
        ensureLearnerExists(skillpilotId);
        Objects.requireNonNull(startDate, "completion start date");
        Objects.requireNonNull(endDate, "completion end date");
        if (goalCompletionService == null) {
            return Map.of();
        }
        Set<String> masteredGoals = masteryRepository.findByLearner_SkillpilotId(skillpilotId).stream()
                .filter(mastery -> mastery.getValue() >= PLANNING_SCOPE_MASTERY_THRESHOLD)
                .map(Mastery::getGoalKey)
                .collect(Collectors.toSet());
        Map<String, Instant> completions = new LinkedHashMap<>();
        for (var completion : goalCompletionService.getCompletionsBetween(skillpilotId, startDate, endDate)) {
            if (masteredGoals.contains(completion.getGoalId())) {
                completions.putIfAbsent(completion.getGoalId(), completion.getOccurredAt());
            }
        }
        return Collections.unmodifiableMap(completions);
    }

    private void recordGoalCompletion(
            Learner learner, String goalId, LearningGoal goal, double previousValue, double nextValue, Instant occurredAt,
            String practiceSource) {
        // Existing hand-built service fixtures predate the ledger dependency.
        // Spring production construction always injects this required bean.
        if (goalCompletionService != null) {
            LearningGoal canonical = landscapeService.getGoalDefinition(goalId);
            String fingerprint = championPracticeFingerprint == null ? null
                    : championPracticeFingerprint.forGoal(canonical == null ? goal : canonical);
            goalCompletionService.recordTransition(
                    learner, goalId, previousValue, nextValue, occurredAt, practiceSource, fingerprint);
        }
    }

    private boolean isKnownHistoryGoal(String goalKey, Set<String> goalIds) {
        if (goalIds == null || goalIds.isEmpty()) {
            return true;
        }
        if (goalIds.contains(goalKey)) {
            return true;
        }
        if (goalKey != null) {
            int idx = goalKey.indexOf(':');
            if (idx >= 0 && idx < goalKey.length() - 1) {
                String suffix = goalKey.substring(idx + 1);
                return goalIds.contains(suffix);
            }
        }
        return false;
    }

    private SignedLearnerDataDTO buildSignedLearnerExport(
            Learner learner,
            Map<String, MasteryEntryDTO> mastery,
            List<String> plannedGoals,
            List<LearnerLearningPlanApi.PortablePlan> learningPlans) {
        LearnerDataDTO data = new LearnerDataDTO(
                learner,
                mastery,
                plannedGoals,
                learner.getCopySources(),
                learningPlans,
                exportPortableSrsData(learner.getSkillpilotId()),
                verifiedExamPassService.export(learner.getSkillpilotId()));
        String signature = calculateSignature(data);
        return new SignedLearnerDataDTO(data, signature);
    }

    /** Unchanged signed format (schemaVersion 1, goal to card to state), now read from the card rows. */
    private PortableSrsData exportPortableSrsData(String skillpilotId) {
        Map<String, Map<String, Object>> states = cardStateStore == null
                ? new LinkedHashMap<>() : cardStateStore.exportAll(skillpilotId);
        return new PortableSrsData(1, states);
    }

    private Map<String, Map<String, Object>> validatePortableSrsImport(LearnerDataDTO data) {
        PortableSrsData portable = data.srsData();
        if (portable != null) {
            if (portable.schemaVersion() != 1) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Unsupported signed SRS archive version");
            }
            try {
                SrsPracticeStateGuard.validatePortable(portable.states());
            } catch (IllegalArgumentException exception) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Invalid signed SRS archive", exception);
            }
        }
        if (data.mastery() != null) {
            for (var entry : data.mastery().entrySet()) {
                if (entry.getValue() == null || entry.getValue().value() < PLANNING_SCOPE_MASTERY_THRESHOLD) {
                    continue;
                }
                LearningGoal goal = landscapeService.getGoalDefinition(entry.getKey());
                if (goal == null && entry.getKey() != null && entry.getKey().contains(":")) {
                    goal = landscapeService.getGoalDefinition(entry.getKey().substring(entry.getKey().indexOf(':') + 1));
                }
                if (goal != null && isSrsGoal(goal)
                        && (portable == null || !portable.states().containsKey(goal.getId()))) {
                    throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                            "This archive cannot safely restore memorization progress without signed card state. "
                                    + "Create a new export from the original learner before importing.");
                }
            }
        }
        return portable == null ? Map.of() : portable.states();
    }

    private Map<String, Map<String, Object>> preparePortableSrsRestore(
            Learner learner, Map<String, Map<String, Object>> states) {
        Map<String, Map<String, Object>> prepared = new LinkedHashMap<>();
        for (var entry : states.entrySet()) {
            Map<String, Object> current = loadSrsStateStrict(learner.getSkillpilotId(), entry.getKey());
            Map<String, Object> merged = new LinkedHashMap<>(current);
            merged.putAll(entry.getValue());
            // Restoring an older valid backup must not erase success already in this account.
            current.forEach((cardId, raw) -> {
                if (raw instanceof Map<?, ?> old && isVerifiedRecallPassed(old.get("verifiedRecall"))) {
                    Object replacement = merged.get(cardId);
                    if (!(replacement instanceof Map<?, ?> next)
                            || !isVerifiedRecallPassed(next.get("verifiedRecall"))) {
                        merged.put(cardId, raw);
                    }
                }
            });
            prepared.put(entry.getKey(), merged);
        }
        return prepared;
    }

    private void restorePortableSrsData(Learner learner, Map<String, Map<String, Object>> states) {
        Instant restoredAt = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        states.forEach((goalId, state) -> requireCardStateStore()
                .replaceNode(learner.getSkillpilotId(), goalId, state, restoredAt));
    }

    private List<LearnerLearningPlanApi.PortablePlan> exportPersonalLearningPlans(
            String skillpilotId) {
        if (learnerLearningPlanRepository == null) {
            return List.of();
        }
        return learnerLearningPlanRepository
                .findByLearner_SkillpilotIdOrderByLandscapeIdAsc(skillpilotId)
                .stream()
                .map(plan -> new LearnerLearningPlanApi.PortablePlan(
                        plan.getLandscapeId(),
                        plan.getPlanLabel(),
                        readPortableLearningPlanBlocks(plan)))
                .toList();
    }

    private List<LearnerLearningPlanApi.Block> readPortableLearningPlanBlocks(
            LearnerLearningPlan plan) {
        try {
            List<LearnerLearningPlanApi.Block> blocks = objectMapper.readValue(
                    plan.getBlocksJson(),
                    new TypeReference<List<LearnerLearningPlanApi.Block>>() { });
            if (blocks == null) {
                throw new IllegalStateException("Learning-plan blocks are missing");
            }
            return List.copyOf(blocks);
        } catch (Exception exception) {
            throw new IllegalStateException("Could not export personal learning-plan blocks", exception);
        }
    }

    @Transactional
    public void importLearner(String skillpilotId, SignedLearnerDataDTO signedData) {
        if (signedData == null || signedData.data() == null || signedData.signature() == null) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Signed learner archive is required");
        }
        // distinct verification logic
        String calculatedSignature = calculateSignature(signedData.data());
        if (!java.security.MessageDigest.isEqual(
                calculatedSignature.getBytes(StandardCharsets.UTF_8),
                signedData.signature().getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Invalid data signature. Data may have been tampered with.");
        }

        LearnerDataDTO data = signedData.data();
        // Validate the entire card restoration contract before the first mutation.
        Map<String, Map<String, Object>> importedSrs = validatePortableSrsImport(data);
        Learner existing = learnerRepository.findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Learner not found"));
        Map<String, Map<String, Object>> restoredSrs = preparePortableSrsRestore(existing, importedSrs);
        verifiedExamPassService.restoreOwnArchive(existing, data,
                com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation.isValidSigningSecret(signingSecret));

        // Provenance / Chain of Custody
        Map<String, CopySource> candidateCopySources = new LinkedHashMap<>();
        if (data.copySources() != null) {
            data.copySources().stream()
                    .filter(Objects::nonNull)
                    .filter(source -> source.getSourceId() != null)
                    .filter(source -> !source.getSourceId().isBlank())
                    .filter(source -> source.getCopiedAt() != null)
                    .forEach(source -> candidateCopySources.put(source.getSourceId(), source));
        }
        if (data.learner() != null) {
            String sourceId = data.learner().getSkillpilotId();
            // Add immediate source if not self
            if (sourceId != null && !sourceId.isBlank() && !sourceId.equals(skillpilotId)) {
                candidateCopySources.put(sourceId, new CopySource(sourceId, Instant.now()));
            }
        }
        candidateCopySources.remove(skillpilotId);
        if (!candidateCopySources.isEmpty()) {
            Set<String> existingSourceIds = new HashSet<>(
                    learnerRepository.findExistingSkillpilotIds(candidateCopySources.keySet()));
            candidateCopySources.entrySet().stream()
                    .filter(entry -> existingSourceIds.contains(entry.getKey()))
                    .map(Map.Entry::getValue)
                    .forEach(existing.getCopySources()::add);
        }

        // Restore Learner properties
        if (data.learner() != null) {
            existing.setSelectedCurriculum(data.learner().getSelectedCurriculum());
            existing.setPersonalCurriculum(data.learner().getPersonalCurriculum());
            existing.setShowGoalVisualizationsInChat(
                    !Boolean.FALSE.equals(data.learner().getShowGoalVisualizationsInChat()));
            existing.setUseAssessmentShortcuts(data.learner().getUseAssessmentShortcuts());
            existing.setLearningPlanCountOnlyExplicitGoals(data.learner().getLearningPlanCountOnlyExplicitGoals());
            existing.setFollowLearningPlans(
                    Boolean.TRUE.equals(data.learner().getFollowLearningPlans()));
            if (data.learner().getClientState() != null) {
                existing.setClientState(data.learner().getClientState());
                existing.setClientStateUpdatedAt(data.learner().getClientStateUpdatedAt());
            }
            learnerRepository.save(existing);
            migrateCanonicalGymnasiumPreFlowPersonalizationIfNeeded(existing);
        }

        // Restore Mastery with original timestamps
        if (data.mastery() != null) {
            for (Map.Entry<String, MasteryEntryDTO> entry : data.mastery().entrySet()) {
                MasteryId mid = new MasteryId(skillpilotId, entry.getKey());
                MasteryEntryDTO entryData = entry.getValue();
                Mastery m = masteryRepository.findById(mid)
                        .orElse(new Mastery(existing, entry.getKey(), entryData.value()));
                m.setValue(entryData.value());
                masteryRepository.saveAndFlush(m);
                // Restore original timestamp using native query (bypasses @PreUpdate)
                if (entryData.updatedAt() != null) {
                    masteryRepository.updateTimestamp(skillpilotId, entry.getKey(), entryData.updatedAt());
                }
            }
        }

        // Restore Planned Goals
        restorePortableSrsData(existing, restoredSrs);
        // Navigation bindings must not authorize an imported goal during revalidation.
        // All signature, format and restorable-state checks have already completed.
        existing.setCompletionWorkflow(null);
        restoreImportedPlannedGoals(existing, data.plannedGoals());
        restoreImportedPersonalLearningPlans(existing, data.learningPlans());
    }

    private void restoreImportedPersonalLearningPlans(
            Learner learner,
            List<LearnerLearningPlanApi.PortablePlan> importedPlans) {
        // An omitted field is a signed pre-plan archive and leaves current
        // personal plans untouched. A present empty list explicitly clears them.
        if (importedPlans == null || learnerLearningPlanRepository == null) {
            return;
        }

        LinkedHashSet<String> landscapeIds = new LinkedHashSet<>();
        List<LearnerLearningPlan> restored = new ArrayList<>();
        for (LearnerLearningPlanApi.PortablePlan portable : importedPlans) {
            if (portable == null) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "learningPlans must not contain null entries");
            }
            String landscapeId = requirePortableText(portable.landscapeId(), "learningPlans.landscapeId", 255);
            if (!landscapeIds.add(landscapeId)) {
                throw new ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST,
                        "learningPlans must contain at most one plan per landscape");
            }
            String planLabel = optionalPortableText(portable.planLabel(), "learningPlans.planLabel", 160);
            // The learning results of a backup are restored also when one of its plans cannot be
            // read against the curriculum today (Product Owner, 25 November 2026). A server error
            // is passed on and still refuses the backup. A plan that was read and then fails with a
            // client error, and a plan that fails with an IllegalStateException or
            // IllegalArgumentException, is kept as outdated too, because the results come first;
            // it is reported as unexpected and not as an outdated reference.
            LearnerLearningPlan plan;
            RestoredPlanReading reading = null;
            try {
                reading = readRestoredLearningPlan(learner, landscapeId, portable.blocks());
                plan = restoredCurrentLearningPlan(learner, landscapeId, planLabel, reading);
            } catch (ResponseStatusException exception) {
                if (!exception.getStatusCode().is4xxClientError()) throw exception;
                plan = restoredOutdatedLearningPlan(
                        learner, landscapeId, planLabel, portable.blocks(), exception, reading != null);
            } catch (IllegalStateException | IllegalArgumentException exception) {
                plan = restoredOutdatedLearningPlan(
                        learner, landscapeId, planLabel, portable.blocks(), exception, true);
            }
            restored.add(plan);
        }

        learnerLearningPlanRepository.deleteByLearner_SkillpilotId(learner.getSkillpilotId());
        learnerLearningPlanRepository.flush();
        if (!restored.isEmpty()) {
            learnerLearningPlanRepository.saveAll(restored);
            learnerLearningPlanRepository.flush();
        }
        eventPublisher.publishEvent(new LearnerStateChangedEvent(
                this,
                learner.getSkillpilotId(),
                "LEARNING_PLAN_IMPORT"));
    }

    /** The blocks of a restored plan as they apply today, with the scope they were read against. */
    private record RestoredPlanReading(LearnerPlanningScopeResponse scope,
            List<LearnerLearningPlanApi.Block> blocks, Map<Set<String>, Set<String>> capturedSelections) { }

    /**
     * Reads a plan of the backup against today's curriculum: subject, goals, sections, exam topics
     * and the order its blocks need for today's prerequisites. A client error here means that the
     * plan no longer fits the curriculum.
     */
    private RestoredPlanReading readRestoredLearningPlan(Learner learner, String landscapeId,
            List<LearnerLearningPlanApi.Block> portableBlocks) {
        LearnerPlanningScopeResponse scope = getPlanningScope(
                learner.getSkillpilotId(),
                landscapeId);
        // A backup restores a plan that existed. It is read like a stored plan: goals the
        // catalog retains only as history leave it, and goals a regrouping moved to another
        // section stay in their blocks.
        List<LearnerLearningPlanApi.Block> restorableBlocks = LearnerLearningPlanService.withoutRetiredGoals(
                portableBlocks, retiredGoalIds(learner, landscapeId));
        Map<Set<String>, Set<String>> capturedSelections = learningPlanCapturedSelections(restorableBlocks);
        List<LearnerLearningPlanApi.Block> normalizedBlocks =
                LearnerLearningPlanService.normalizeBlocks(
                        restorableBlocks,
                        scope,
                        Set.of(),
                        true);
        validateLearningPlanBlockFoci(
                learner.getSkillpilotId(),
                landscapeId,
                normalizedBlocks,
                capturedSelections);
        normalizedBlocks = orderLearningPlanBlocksByPrerequisites(
                learner.getSkillpilotId(),
                normalizedBlocks);
        return new RestoredPlanReading(scope, normalizedBlocks, capturedSelections);
    }

    /** A plan of the backup that was read against today's curriculum, with its fingerprint. */
    private LearnerLearningPlan restoredCurrentLearningPlan(Learner learner, String landscapeId, String planLabel,
            RestoredPlanReading reading) {
        List<LearnerLearningPlanApi.Block> orderedBlocks = reading.blocks();
        LearnerLearningPlan plan = new LearnerLearningPlan();
        plan.setLearner(learner);
        plan.setLandscapeId(landscapeId);
        plan.setCurriculumId(reading.scope().curriculumId());
        plan.setScopeFingerprint(learningPlanFingerprint(
                learner.getSkillpilotId(),
                landscapeId,
                orderedBlocks,
                reading.capturedSelections()));
        plan.setRevision(1);
        plan.setPlanLabel(planLabel);
        plan.setBlocksJson(portableBlocksJson(orderedBlocks));
        plan.setCapturedAt(reading.scope().capturedAt());
        return plan;
    }

    /**
     * A plan of the backup that cannot be read today. Its learning results are restored with the
     * rest of the backup; the plan itself is kept as the backup held it and marked outdated, see
     * {@link LearnerLearningPlan#RESTORED_OUTDATED_CURRICULUM_ID}. A plan that is not well formed is
     * refused as before. The form check does not ask whether a save would accept the plan today:
     * the archived values are kept, not their normalized form. The stored fingerprint is the digest
     * of the kept blocks, not a statement about today's graph.
     */
    private LearnerLearningPlan restoredOutdatedLearningPlan(Learner learner, String landscapeId, String planLabel,
            List<LearnerLearningPlanApi.Block> portableBlocks, RuntimeException failure, boolean unexpected) {
        LearnerLearningPlanService.requireWellFormedBlocks(landscapeId, portableBlocks);
        if (unexpected) {
            // Not an outdated reference: the plan could be read, or the failure is none of a client.
            LOGGER.warn("Restoring a learning plan of landscape {} as outdated after an unexpected failure",
                    landscapeId, failure);
        } else {
            LOGGER.info("Restoring a learning plan of landscape {} as outdated: {}", landscapeId, failure.getMessage());
        }
        String blocksJson = portableBlocksJson(portableBlocks);
        LearnerLearningPlan plan = new LearnerLearningPlan();
        plan.setLearner(learner);
        plan.setLandscapeId(landscapeId);
        plan.setCurriculumId(LearnerLearningPlan.RESTORED_OUTDATED_CURRICULUM_ID);
        try {
            plan.setScopeFingerprint("sha256:" + java.util.HexFormat.of().formatHex(
                    java.security.MessageDigest.getInstance("SHA-256").digest(blocksJson.getBytes(StandardCharsets.UTF_8))));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
        plan.setRevision(1);
        plan.setPlanLabel(planLabel);
        plan.setBlocksJson(blocksJson);
        plan.setCapturedAt(Instant.now(learningPlanClock));
        return plan;
    }

    private String portableBlocksJson(List<LearnerLearningPlanApi.Block> blocks) {
        try {
            return objectMapper.writeValueAsString(blocks);
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Could not import personal learning-plan blocks", exception);
        }
    }

    private static String requirePortableText(String value, String field, int maxLength) {
        String normalized = optionalPortableText(value, field, maxLength);
        if (normalized == null) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    field + " is required");
        }
        return normalized;
    }

    private static String optionalPortableText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    field + " exceeds the supported length");
        }
        return normalized;
    }

    /**
     * Restores an exported Level-3 focus as historical input and immediately
     * revalidates it against the imported Level-2 learner-facing projection.
     *
     * <p>Unlike the public focus mutation, imports may legitimately contain a
     * focus authored before the current personalization flow existed. Such a
     * focus must not abort restoration of curriculum or global mastery. Valid
     * current {@code target} goals survive; stale, prerequisite-only, unknown,
     * or unresolved-scope goals are discarded by the shared revalidation
     * semantics.</p>
     */
    private void restoreImportedPlannedGoals(
            Learner learner,
            List<String> importedPlannedGoalIds) {
        if (importedPlannedGoalIds != null) {
            List<PlannedGoal> existingGoals =
                    plannedGoalRepository.findByLearner_SkillpilotId(learner.getSkillpilotId());
            Set<String> importedGoalIds = importedPlannedGoalIds.stream()
                    .filter(Objects::nonNull)
                    .filter(goalId -> !goalId.isBlank())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> existingGoalIds = existingGoals.stream()
                    .map(PlannedGoal::getGoalId)
                    .collect(Collectors.toSet());

            List<PlannedGoal> removedGoals = existingGoals.stream()
                    .filter(plannedGoal -> !importedGoalIds.contains(plannedGoal.getGoalId()))
                    .toList();
            if (!removedGoals.isEmpty()) {
                plannedGoalRepository.deleteAll(removedGoals);
            }

            List<PlannedGoal> addedGoals = importedGoalIds.stream()
                    .filter(goalId -> !existingGoalIds.contains(goalId))
                    .map(goalId -> new PlannedGoal(learner, goalId))
                    .toList();
            if (!addedGoals.isEmpty()) {
                plannedGoalRepository.saveAll(addedGoals);
            }
        }

        revalidatePlannedGoalsForProjectedScope(
                learner,
                mutablePersonalCurriculumPayload(learner.getPersonalCurriculum()));
        if (learner.getActiveGoalId() == null || learner.getActiveGoalId().isBlank()) {
            learner.setLearningState(LearningState.FRONTIER);
        }
        advanceCoachStateRevision(learner);
    }

    private String calculateSignature(LearnerDataDTO data) {
        try {
            String json = objectMapper.writeValueAsString(data);
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacData = mac.doFinal(json.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hmacData);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating signature", e);
        }
    }

    private Set<String> computeScope(List<String> plannedIds, Map<String, LearningGoal> allGoals,
            Map<String, List<String>> effectiveRequires) {
        // If no scope is set (plannedGoals empty), we conceptually have "no
        // restriction"
        // But for getRichFrontier, empty plan means "Top Level Modules".
        // However, this helper is for validating if a goal is IN scope.
        // If plan is empty, is everything in scope? Or nothing?
        // UI behavior: Empty plan -> Show top level. Active goal CANNOT be set if we
        // are at top level (usually).
        // Actually, if plan is empty, we are in "Overview Mode".
        if (plannedIds.isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> scope = new HashSet<>();
        // 1. Start with Plan
        // 1. Start with Plan (Only if they exist in current context)
        for (String pid : plannedIds) {
            if (allGoals.containsKey(pid)) {
                scope.add(pid);
            }
        }

        // 2. Add Descendants (e.g. Math -> Analysis)
        Set<String> descendants = new HashSet<>();
        for (String pid : plannedIds) {
            collectDescendants(pid, allGoals, descendants);
        }
        scope.addAll(descendants);

        // 3. Add Prerequisites (Transitive Closure) - DISABLED for "Pragmatic Approach"
        // User requested that focus should strictly be Plan + Descendants.
        // Prerequisites outside this scope should be ignored in getRichFrontier.
        return scope;
    }

    private boolean isGoalOutOfPlannedScope(
            String goalId,
            List<String> plannedIds,
            Map<String, LearningGoal> structuralGoals,
            Set<String> precomputedScope) {
        if (goalId == null || goalId.isBlank()) {
            return false;
        }
        if (plannedIds == null || plannedIds.isEmpty()) {
            return true;
        }
        if (structuralGoals == null || structuralGoals.isEmpty()) {
            return true;
        }
        Set<String> scope = precomputedScope != null
                ? precomputedScope
                : computeScope(plannedIds, structuralGoals, Collections.emptyMap());
        return !scope.contains(goalId);
    }

    private void clearPersistedActiveGoal(Learner learner, String skillpilotId, String changeType) {
        clearPersistedActiveGoal(learner, skillpilotId, changeType, true);
    }

    private void clearPersistedActiveGoal(
            Learner learner,
            String skillpilotId,
            String changeType,
            boolean publishEvent) {
        learner.setActiveGoalId(null);
        learner.setLearningState(LearningState.FRONTIER);
        advanceCoachStateRevision(learner);
        if (publishEvent) {
            eventPublisher.publishEvent(new LearnerStateChangedEvent(this, skillpilotId, changeType));
        }
    }

    /**
     * Advances the canonical learner-scoped revision used by every coach
     * transport for optimistic concurrency. Call this in the same transaction
     * as each persisted learner-state mutation so web UI and MCP writes share
     * one conflict domain.
     */
    private Learner advanceCoachStateRevision(Learner learner) {
        if (learner == null) {
            throw new IllegalArgumentException("learner must not be null");
        }
        if (markCoachStateRevisionAdvance(learner.getSkillpilotId())) {
            learner.setCoachStateRevision(Math.addExact(learner.getCoachStateRevision(), 1L));
        }
        return learnerRepository.save(learner);
    }

    /**
     * Returns {@code true} once per learner and transaction. A single public
     * mutation may touch curriculum, focus and active goal through nested
     * helpers; all those changes belong to one optimistic-concurrency revision.
     */
    @SuppressWarnings("unchecked")
    private boolean markCoachStateRevisionAdvance(String skillpilotId) {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            return true;
        }
        Set<String> advanced =
                (Set<String>) TransactionSynchronizationManager.getResource(
                        COACH_STATE_REVISION_TRANSACTION_RESOURCE);
        if (advanced == null) {
            advanced = new HashSet<>();
            TransactionSynchronizationManager.bindResource(
                    COACH_STATE_REVISION_TRANSACTION_RESOURCE,
                    advanced);
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCompletion(int status) {
                            TransactionSynchronizationManager.unbindResourceIfPossible(
                                    COACH_STATE_REVISION_TRANSACTION_RESOURCE);
                        }
                    });
        }
        return advanced.add(skillpilotId);
    }

}
