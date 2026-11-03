package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerClientState;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.domain.LearnerGoalCompletion;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.LearnerGoalCompletionRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.service.srs.SrsStateUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.util.ReflectionTestUtils;

/** Real automatic compilation through public frontier and explicit-learning APIs. */
class AutomaticCompletionFrontierTest {
    private static final String LEARNER = "automatic-frontier-learner";
    private final Map<String, LearningGoal> graph = new LinkedHashMap<>();
    private final Map<String, Double> mastery = new LinkedHashMap<>();
    private final List<String> focus = new ArrayList<>(List.of("ROOT"));
    private Learner learner;
    private SkillLandscape landscape;
    private LearnerService service;
    private MasteryRepository masteryRepository;
    private LearnerClientStateRepository clientStates;
    private DeckResourceService decks;
    private CompletionApplicationService completion;

    @BeforeEach void setUp() {
        // Complete protected route Q -> C -> B -> A.
        graph.put("A", atomic("A"));
        graph.put("B", atomic("B", "A"));
        graph.put("C", atomic("C", "B"));
        graph.put("Q", atomic("Q", "C"));
        graph.get("Q").setNodeKind("exam");
        LearningGoal middle = atomic("MIDDLE");
        middle.setContains(List.of("A"));
        graph.put("MIDDLE", middle);
        LearningGoal root = atomic("ROOT");
        root.setContains(List.of("MIDDLE", "B", "C", "Q"));
        graph.put("ROOT", root);

        landscape = new SkillLandscape();
        landscape.setLandscapeId("base");
        landscape.setTitle("Test curriculum");
        landscape.setGoals(List.copyOf(graph.values()));
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getById("base")).thenReturn(landscape);
        when(landscapes.getClosure("base")).thenReturn(List.of(landscape));
        when(landscapes.getOverview(anyString(), anyBoolean()))
                .thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> graph.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn("base");

        learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum("base");
        learner.setLearningState(LearningState.FRONTIER);
        learner.setAutoPilot(false);
        LearnerRepository learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        when(learners.save(any(Learner.class))).thenAnswer(call -> call.getArgument(0));
        masteryRepository = mock(MasteryRepository.class);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call -> mastery.entrySet().stream()
                .map(entry -> new Mastery(learner, entry.getKey(), entry.getValue())).toList());
        when(masteryRepository.save(any(Mastery.class))).thenAnswer(call -> {
            Mastery saved = call.getArgument(0);
            mastery.put(saved.getGoalKey(), saved.getValue());
            return saved;
        });
        PlannedGoalRepository planned = mock(PlannedGoalRepository.class);
        when(planned.findByLearner_SkillpilotId(LEARNER)).thenAnswer(call -> focus.stream()
                .map(id -> new PlannedGoal(learner, id)).toList());
        doAnswer(call -> {
            Iterable<PlannedGoal> removed = call.getArgument(0);
            removed.forEach(goal -> focus.remove(goal.getGoalId()));
            return null;
        }).when(planned).deleteAll(any());
        when(planned.save(any(PlannedGoal.class))).thenAnswer(call -> {
            PlannedGoal saved = call.getArgument(0);
            focus.add(saved.getGoalId());
            return saved;
        });
        clientStates = mock(LearnerClientStateRepository.class);
        decks = mock(DeckResourceService.class);
        service = new LearnerService(learners, clientStates, masteryRepository, planned,
                landscapes, mock(GoalMappingService.class), decks,
                new ObjectMapper(), mock(ApplicationEventPublisher.class));
        completion = new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(), Map.of(), "frontier-generation", true));
        ReflectionTestUtils.setField(service, "completionApplicationService", completion);
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("base")).thenReturn(graph);
        ReflectionTestUtils.setField(service, "completionCanonicalGraphResolver", resolver);
    }

    @Test void validProtectedRouteOffersRequiredPreparationWithoutWritingMastery() {
        assertThat(service.getFrontier(LEARNER)).contains("A").doesNotContain("Z", "O");
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("A").doesNotContain("Z", "O");
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A");
        verify(masteryRepository, never()).save(any());
    }

    @Test void masteredIntermediateEndsOnlyItsOwnPreparationDemandAndUsesOneMasteryRead() {
        mastery.put("B", 1.0);
        clearInvocations(masteryRepository);
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("C").doesNotContain("A", "B");
        verify(masteryRepository, times(1)).findByLearner_SkillpilotId(LEARNER);
        assertThat(service.getFrontier(LEARNER)).contains("C").doesNotContain("A", "B");
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A", "C");
        mastery.clear();
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("A").doesNotContain("C");
        verify(masteryRepository, never()).save(any());
    }

    @Test void focusDoesNotDiscardConsumersElsewhereInThePersonalCurriculum() {
        focus.clear();
        focus.add("A");
        assertThat(service.getFrontier(LEARNER)).containsExactly("A");
        assertThat(ids(service.getRichFrontier(LEARNER))).containsExactly("A");
        mastery.put("B", 1.0);
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        assertThat(service.getRichFrontier(LEARNER)).isEmpty();
        assertThat(ids(service.getUncompactedRichFrontierForFocus(LEARNER, List.of("A"))))
                .containsExactly("A");
    }

    @Test void disablingDirectAssessmentOffersDoesNotRestoreUnneededWork() {
        learner.setUseAssessmentShortcuts(false);
        mastery.put("B", 1.0);
        assertThat(service.getFrontier(LEARNER)).contains("C").doesNotContain("A", "O", "Z");
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("C").doesNotContain("A", "O", "Z");
    }

    @Test void releasedExamWithoutPreparationRemainsNormallyAvailableWhenShortcutOffersAreOff() {
        learner.setUseAssessmentShortcuts(false);
        LearningGoal exam = graph.get("Q");
        // Existing explicit mastery ends preparation demand while retaining a
        // structurally valid route for new learners.
        mastery.put("C", 1.0);
        ExamData task = new ExamData();
        task.setReviewStatus("released");
        task.setTaskContent("Solve the assessment task.");
        task.setSolutionContent("Assessment solution.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(1.0);
        scoring.setPassingPoints(1.0);
        ExamData.Step step = new ExamData.Step();
        step.setId("answer");
        step.setPoints(1.0);
        step.setDescription("Correct answer");
        scoring.setSteps(List.of(step));
        task.setScoring(scoring);
        exam.setExamData(task);

        assertThat(service.getFrontier(LEARNER)).contains("Q").doesNotContain("A", "B", "C");
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("Q").doesNotContain("A", "B", "C");
        service.setActiveGoal(LEARNER, "Q");
        assertThat(learner.getActiveGoalId()).isEqualTo("Q");
        assertThat(mastery).containsOnlyKeys("C");
        verify(masteryRepository, never()).save(any());
    }

    @Test void explicitlyChosenImplicitPreparationRemainsLearnableWithoutWritingMastery() {
        mastery.put("B", 1.0);
        service.setActiveGoal(LEARNER, "A");
        assertThat(learner.getActiveGoalId()).isEqualTo("A");
        assertThat(learner.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(mastery).containsOnlyKeys("B");
        verify(masteryRepository, never()).save(any());
    }

    @ParameterizedTest
    @CsvSource({"DAY,false", "DAY,true", "WEEK,false", "WEEK,true"})
    void completingPlanGoalNeverAutomaticallyActivatesItsImplicitPreparation(
            PeriodBasis basis, boolean onlyExplicit) throws Exception {
        prepareAutomaticPlan(basis, onlyExplicit, List.of("A", "B"));

        var result = service.setMastery(LEARNER, new MasteryUpdateRequest(Map.of("B", 1.0), "B"));

        assertThat(result.activeGoal()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B", 1.0));
        assertThat(ids(service.getUncompactedRichFrontierForFocus(LEARNER, List.of("ROOT"))))
                .contains("A"); // Explicit voluntary learning remains available.
        assertThat(result.levelCompletion().waivedTargetGoalIds()).contains("A");
        verify(masteryRepository, times(1)).save(any(Mastery.class));
    }

    @ParameterizedTest
    @CsvSource({"DAY,false", "DAY,true", "WEEK,false", "WEEK,true"})
    void automaticPlanHandoffSkipsImplicitPreparationAndContinuesActualRequiredWork(
            PeriodBasis basis, boolean onlyExplicit) throws Exception {
        prepareAutomaticPlan(basis, onlyExplicit, List.of("A", "B", "C"));

        var result = service.setMastery(LEARNER, new MasteryUpdateRequest(Map.of("B", 1.0), "B"));

        assertThat(result.activeGoal()).isNotNull();
        assertThat(result.activeGoal().id()).isEqualTo("C");
        assertThat(learner.getActiveGoalId()).isEqualTo("C");
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B", 1.0));
    }

    @ParameterizedTest
    @CsvSource({"DAY,false", "DAY,true", "WEEK,false", "WEEK,true"})
    void anExplicitPeriodCompletionStopsAutomaticHandoffDespiteRemainingRequiredWork(
            PeriodBasis basis, boolean onlyExplicit) throws Exception {
        var plan = prepareAutomaticPlan(basis, onlyExplicit, List.of("A", "B", "C"));
        LocalDate day = LocalDate.parse("2026-11-02");
        // C is the sole current DAY/WEEK quota; A and B were scheduled last Friday.
        var blocks = List.of(
                new LearnerLearningPlanApi.Block("earlier", "learning", "ROOT", "Earlier",
                        day.minusDays(3), day.minusDays(3), null, List.of("A", "B")),
                new LearnerLearningPlanApi.Block("current", "learning", "ROOT", "Current",
                        day, day, null, List.of("C")));
        assertThat(service.isLearningPlanCompatible(LEARNER, "base", "base", blocks)).isTrue();
        plan.setBlocksJson(new ObjectMapper().findAndRegisterModules().writeValueAsString(blocks));
        List<LearnerGoalCompletion> events = new ArrayList<>();
        var repository = mock(LearnerGoalCompletionRepository.class);
        when(repository.save(any(LearnerGoalCompletion.class))).thenAnswer(call -> {
            LearnerGoalCompletion saved = call.getArgument(0);
            events.add(saved);
            return saved;
        });
        when(repository.findByLearner_SkillpilotIdAndCompletionDateOrderByOccurredAtAsc(anyString(), any()))
                .thenAnswer(call -> List.copyOf(events));
        when(repository.findByLearner_SkillpilotIdAndCompletionDateBetweenOrderByOccurredAtAsc(anyString(), any(), any()))
                .thenAnswer(call -> List.copyOf(events));
        ReflectionTestUtils.setField(service, "goalCompletionService", new LearnerGoalCompletionService(repository));

        var result = service.setMastery(LEARNER, new MasteryUpdateRequest(Map.of("B", 1.0), "B"));

        assertThat(events).singleElement().satisfies(event -> {
            assertThat(event.getGoalId()).isEqualTo("B");
            assertThat(event.getCompletionDate()).isEqualTo(day);
            assertThat(event.isObservedTransition()).isTrue();
        });
        assertThat(result.activeGoal()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(ids(service.getUncompactedRichFrontierForFocus(LEARNER, List.of("ROOT"))))
                .contains("C"); // Required and accessible, but further work now needs explicit consent.
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B", 1.0));
    }

    @Test void unavailableAutomaticCompletionStopsPlanHandoffWithoutBlockingTheMasteryWrite() throws Exception {
        prepareAutomaticPlan(PeriodBasis.DAY, false, List.of("A", "B", "C"));
        ReflectionTestUtils.setField(completion.catalog(), "available", false);

        var result = service.setMastery(LEARNER, new MasteryUpdateRequest(Map.of("B", 1.0), "B"));

        assertThat(result.activeGoal()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B", 1.0));
        assertThat(result.levelCompletion().calculationStatus()).isEqualTo("unavailable");
    }

    @ParameterizedTest
    @ValueSource(strings = {"nodeKind", "semanticMemory", "semanticMemorization", "source", "srsTag", "memorizationTag"})
    void missingRecallDeckCannotQualifyStoredMemoryMasteryForAnySupportedEncoding(String encoding) {
        encodeMemory(graph.get("B"), encoding);
        mastery.put("B", 1.0);
        mastery.put("Q", 1.0);

        assertThatThrownBy(() -> service.resolveSrsMasterySnapshot(LEARNER, List.of(graph.get("B"))))
                .isInstanceOf(SrsStateUnavailableException.class);
        var unavailableState = service.getCoachLearnerState(LEARNER);
        assertThat(unavailableState.stateMachine().goalOptions()).isEmpty();
        assertThat(unavailableState.stateMachine().requiredAction()).isNotEqualTo("setActiveGoal");
        var result = unavailableState.levelCompletion();
        assertThat(result.calculationStatus()).isEqualTo("unavailable");
        assertThat(result.complete()).isNull();
        assertThat(result.waivedTargetGoalIds()).isEmpty();
        assertThat(service.getMastery(LEARNER)).containsEntry("B", 1.0); // Tolerant normal overlay preserves it.
        assertThat(mastery).containsExactlyInAnyOrderEntriesOf(Map.of("B", 1.0, "Q", 1.0));
        verify(masteryRepository, never()).save(any());
        verify(clientStates, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"nodeKind", "semanticMemory", "semanticMemorization", "source", "srsTag", "memorizationTag"})
    void verifiedRecallRemainsTheMemoryResultForEverySupportedEncoding(String encoding) {
        encodeMemory(graph.get("B"), encoding);
        graph.get("B").setExtendedData(Map.of("vocabularySource", "synthetic-memory.json"));
        var resource = new ByteArrayResource(
                "{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\",\"tags\":[\"memorization\"]}]}"
                        .getBytes(StandardCharsets.UTF_8));
        when(decks.resolveDeckResource("B", "synthetic-memory.json")).thenReturn(resource);
        var recall = new LearnerClientState(learner, "B",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",
                Instant.parse("2026-10-29T12:00:00Z"));
        when(clientStates.findByLearnerAndNodeIds(anyString(), any())).thenReturn(List.of(recall));
        mastery.put("Q", 1.0); // No stored memory mastery; the existing recall is authoritative.

        assertThat(service.resolveSrsMasterySnapshot(LEARNER, List.of(graph.get("B"))))
                .containsExactlyEntriesOf(Map.of("B", true));
        var result = service.getCoachLearnerState(LEARNER).levelCompletion();
        assertThat(result.calculationStatus()).isEqualTo("valid");
        assertThat(result.complete()).isTrue();
        assertThat(result.masteredTargetCount()).isEqualTo(2);
        assertThat(result.waivedTargetGoalIds()).containsExactly("A", "C");
        assertThat(mastery).containsExactlyEntriesOf(Map.of("Q", 1.0));
        verify(masteryRepository, never()).save(any());
        verify(clientStates, never()).save(any());
    }

    private LearnerLearningPlan prepareAutomaticPlan(PeriodBasis basis, boolean onlyExplicit, List<String> atoms) throws Exception {
        focus.clear();
        focus.add("B");
        service.setActiveGoal(LEARNER, "B");
        landscape.setSubject("Mathematik");
        learner.setLearningPlanPeriodBasis(basis);
        learner.setLearningPlanCountOnlyExplicitGoals(onlyExplicit);
        learner.setFollowLearningPlans(true);
        LocalDate day = LocalDate.parse("2026-11-02");
        ReflectionTestUtils.setField(service, "learningPlanClock",
                Clock.fixed(Instant.parse("2026-11-02T12:00:00Z"), ZoneId.of("Europe/Berlin")));
        var mapper = new ObjectMapper().findAndRegisterModules();
        ReflectionTestUtils.setField(service, "objectMapper", mapper);
        var blocks = List.of(new LearnerLearningPlanApi.Block("block", "learning", "ROOT", "Test",
                day, day, null, atoms));
        assertThat(service.isLearningPlanCompatible(LEARNER, "base", "base", blocks)).isTrue();
        var plan = new LearnerLearningPlan();
        plan.setId(UUID.randomUUID());
        plan.setLearner(learner);
        plan.setLandscapeId("base");
        plan.setCurriculumId("base");
        plan.setBlocksJson(mapper.writeValueAsString(blocks));
        var plans = mock(LearnerLearningPlanRepository.class);
        when(plans.findByLearner_SkillpilotIdOrderByLandscapeIdAsc(LEARNER)).thenReturn(List.of(plan));
        ReflectionTestUtils.setField(service, "learnerLearningPlanRepository", plans);
        return plan;
    }

    private static void encodeMemory(LearningGoal goal, String encoding) {
        switch (encoding) {
            case "nodeKind" -> goal.setNodeKind("memory");
            case "semanticMemory" -> goal.setSemanticKind("memory");
            case "semanticMemorization" -> goal.setSemanticKind("memorization");
            case "source" -> goal.setExtendedData(Map.of("vocabularySource", "synthetic-memory.json"));
            case "srsTag" -> goal.setTags(List.of("srs-deck:synthetic"));
            case "memorizationTag" -> goal.setTags(List.of("memorization"));
            default -> throw new IllegalArgumentException(encoding);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"assessment", "practiceAssessment"})
    void semanticOnlyAssessmentCannotBypassTheConcreteTaskRequirement(String semanticKind) {
        graph.get("Q").setNodeKind(null);
        graph.get("Q").setSemanticKind(semanticKind);
        mastery.put("C", 1.0);
        assertThat(service.getFrontier(LEARNER)).doesNotContain("Q");
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).doesNotContain("Q");
        assertThatThrownBy(() -> service.setActiveGoal(LEARNER, "Q"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("released, concrete exam goal");
        assertThat(learner.getActiveGoalId()).isNull();
        verify(masteryRepository, never()).save(any());
    }

    @Test void explicitMasteryWriteIsNotRejectedBecauseTheGoalWasImplicitlyCompleted() {
        mastery.put("B", 1.0);
        service.setMastery(LEARNER, new MasteryUpdateRequest(Map.of("A", 1.0), "A"));
        assertThat(mastery).containsExactlyInAnyOrderEntriesOf(Map.of("A", 1.0, "B", 1.0));
        verify(masteryRepository, times(1)).save(any(Mastery.class));
    }

    @Test void completedScopeDoesNotLeaveAnUnmasteredNavigationClusterAsRequiredWork() {
        mastery.put("Q", 1.0);
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        assertThat(service.getRichFrontier(LEARNER)).isEmpty();
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A");
        assertThat(mastery).containsOnlyKeys("Q");
    }

    @Test void curriculumWithoutProtectedRootsCannotInventCompletionButOrdinaryLearningRemainsAvailable() {
        graph.get("Q").setNodeKind(null);
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        assertThat(service.getRichFrontier(LEARNER)).isEmpty();
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.goals().scope_completed()).isFalse();
        assertThat(state.goals().scope().mastered_atomic()).isZero();
        assertThat(state.levelCompletion().requiredAssessmentCount()).isZero();
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(ids(state.stateMachine().goalOptions())).containsExactly("A");
        assertThat(state.stateMachine().goalOptions().getFirst().reason()).contains("Freiwillig");
        assertThat(state.frontier()).isEmpty();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A");
        service.setActiveGoal(LEARNER, "A");
        assertThat(learner.getActiveGoalId()).isEqualTo("A");
        assertThat(mastery).isEmpty();
        verify(masteryRepository, never()).save(any());
    }

    @Test void implicitFocusCompletionOffersTheNextScopeWithActualRemainingWork() {
        focus.clear();
        focus.add("A");
        mastery.put("B", 1.0);
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.goals().scope().mastered_atomic()).isZero();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
        assertThat(ids(state.stateMachine().goalOptions())).contains("ROOT").doesNotContain("MIDDLE");
        assertThat(focus).containsExactly("A");
        assertThat(learner.getActiveGoalId()).isNull();
        verify(masteryRepository, never()).save(any());
    }

    @Test void allExplicitTargetsRemainCompleteWithAnIndependentGraphQualityWarning() {
        graph.put("ORPHAN", atomic("ORPHAN"));
        var children = new ArrayList<>(graph.get("ROOT").getContains());
        children.add("ORPHAN");
        graph.get("ROOT").setContains(children);
        landscape.setGoals(List.copyOf(graph.values()));
        for (String id : List.of("A", "B", "C", "Q")) mastery.put(id, 1.0);

        var partial = service.getLearnerState(LEARNER).levelCompletion();
        assertThat(partial.calculationStatus()).isEqualTo("invalid");
        assertThat(partial.complete()).isNull();
        assertThat(partial.notice()).isEqualTo("completion_target_routes_uncovered");

        mastery.put("ORPHAN", 1.0);
        var explicit = service.getLearnerState(LEARNER).levelCompletion();
        assertThat(explicit.calculationStatus()).isEqualTo("valid");
        assertThat(explicit.complete()).isTrue();
        assertThat(explicit.targetCount()).isEqualTo(5);
        assertThat(explicit.masteredTargetCount()).isEqualTo(explicit.targetCount());
        assertThat(explicit.waivedTargetGoalIds()).isEmpty();
        assertThat(explicit.waivedTargetCount()).isZero();
        assertThat(explicit.pendingTargetCount()).isZero();
        assertThat(explicit.notice()).isEqualTo("completion_target_routes_uncovered");

        mastery.remove("ORPHAN");
        var reopened = service.getLearnerState(LEARNER).levelCompletion();
        assertThat(reopened.calculationStatus()).isEqualTo("invalid");
        assertThat(reopened.complete()).isNull();
        assertThat(reopened.notice()).isEqualTo("completion_target_routes_uncovered");
        verify(masteryRepository, never()).save(any());
    }

    @Test void implicitCompletionDoesNotOfferLargerScopesWithNoRemainingWork() {
        focus.clear();
        focus.add("A");
        mastery.put("Q", 1.0);
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.stateMachine().goalOptions()).isEmpty();
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
        assertThat(mastery).containsOnlyKeys("Q");
        verify(masteryRepository, never()).save(any());
    }

    @Test void unavailableAutomaticInputsDoNotInventRequiredWorkOrBlockRawAvailability() {
        ReflectionTestUtils.setField(completion.catalog(), "available", false);
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        assertThat(service.getRichFrontier(LEARNER)).isEmpty();
        assertThat(service.getUncompactedRichFrontier(LEARNER)).isNotEmpty();
        assertThat(service.getCoachLearnerState(LEARNER).stateMachine().goalOptions()).isEmpty();
        verify(masteryRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"physics", "non-m7-language"})
    void defectiveForeignSubjectOffersOnlyVoluntaryCurrentFocusWithoutDroppingItsConsumer(String foreignId) {
        readyAssessment();
        addForeignSubject(foreignId);
        learner.setAutoPilot(true);
        long revision = learner.getCoachStateRevision();
        String config = learner.getPersonalCurriculum();
        for (int read = 0; read < 2; read++) {
            var state = service.getCoachLearnerState(LEARNER);
            assertThat(service.getFrontier(LEARNER)).isEmpty();
            assertThat(state.frontier()).isEmpty();
            assertThat(ids(state.stateMachine().goalOptions())).containsExactly("A");
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
            assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
            assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
            assertThat(state.levelCompletion().complete()).isNull();
            assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
            assertThat(learner.getActiveGoalId()).isNull();
            assertThat(learner.getPersonalCurriculum()).isEqualTo(config);
            assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
            assertThat(focus).containsExactly("ROOT");
        }
        var whole = service.getLearningPlanCompletionContext(LEARNER, Set.of("A"));
        assertThat(whole.level2TargetGoalIds()).contains("FOREIGN");
        assertThat(whole.canonicalGoals().get("FOREIGN").getRequires()).containsExactly("A");
        verify((PlannedGoalRepository) ReflectionTestUtils.getField(service, "plannedGoalRepository"), never()).save(any());
        verify(masteryRepository, never()).save(any());
        new com.skillpilot.backend.ai.CoachToolFacade(service, null,
                new com.skillpilot.backend.ai.CoachStateProjection("https://skillpilot.test"), null)
                .setActiveGoal(LEARNER, new com.skillpilot.backend.api.ActiveGoalRequest("A", false));
        assertThat(learner.getActiveGoalId()).isEqualTo("A");
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision + 1);
        assertThat(mastery).isEmpty();
        assertThat(focus).containsExactly("ROOT");
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void voluntaryChoiceKeepsNormalAndStrictPrerequisitesDistinct(boolean strict) {
        addForeignSubject("physics");
        focus.clear(); focus.add("B");
        learner.setStrictMode(strict);
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.frontier()).isEmpty();
        if (strict) assertThat(state.stateMachine().goalOptions()).isEmpty();
        else assertThat(ids(state.stateMachine().goalOptions())).containsExactly("B");
        assertThat(mastery).isEmpty();
        assertThat(focus).containsExactly("B");
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void voluntaryChoicesUseTheSameStrictRecallSnapshotDespiteALaterTolerantReadFailure(boolean verified) {
        readyAssessment(); addForeignSubject("physics");
        encodeMemory(graph.get("B"), "nodeKind");
        graph.get("B").setExtendedData(Map.of("vocabularySource", "synthetic-memory.json"));
        var resource = new ByteArrayResource(
                "{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\",\"tags\":[\"memorization\"]}]}"
                        .getBytes(StandardCharsets.UTF_8));
        when(decks.resolveDeckResource("B", "synthetic-memory.json")).thenReturn(resource);
        var recall = new LearnerClientState(learner, "B",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",
                Instant.parse("2026-10-29T12:00:00Z"));
        var reads = new java.util.concurrent.atomic.AtomicInteger();
        when(clientStates.findByLearnerAndNodeIds(anyString(), any())).thenAnswer(call -> {
            if (reads.incrementAndGet() == 1) return verified ? List.of(recall) : List.of();
            throw new IllegalStateException("Later SRS read is unavailable");
        });
        mastery.put("B", 1.0); // The strict first snapshot must override this stored marker.
        learner.setAutoPilot(true);
        var state = service.getCoachLearnerState(LEARNER);
        List<String> choices = ids(state.stateMachine().goalOptions());
        assertThat(reads.get()).isGreaterThan(1); // The later tolerant failure really occurred.
        if (verified) assertThat(choices).contains("C");
        else assertThat(choices).doesNotContain("C");
        assertThat(choices).doesNotContain("B", "Q", "FOREIGN");
        assertThat(state.frontier()).isEmpty();
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B", 1.0));
        assertThat(focus).containsExactly("ROOT");
        verify(masteryRepository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {"missing-reference", "cycle", "invalid-focus", "following-plan"})
    void unrelatedRawAvailabilityCannotOpenOtherFailuresOrNavigationBoundaries(String boundary) {
        addForeignSubject("physics");
        switch (boundary) {
            case "missing-reference" -> graph.get("FOREIGN").setRequires(List.of("A", "UNKNOWN"));
            case "cycle" -> graph.get("FOREIGN").setRequires(List.of("A", "FOREIGN"));
            case "invalid-focus" -> { focus.clear(); focus.add("composition:removed-view:structure:removed-wrapper"); }
            case "following-plan" -> learner.setFollowLearningPlans(true);
            default -> throw new AssertionError(boundary);
        }
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setActiveGoal");
        if (boundary.equals("invalid-focus")) {
            // An initial scope option may itself denote an atom. setScope still
            // requires an explicit focus choice and never authorizes teaching it.
            assertThat(state.stateMachine().requiredAction()).isEqualTo("setScope");
            assertThat(state.nextAllowedActions()).doesNotContain("setActiveGoal");
            assertThat(focus).containsExactly("composition:removed-view:structure:removed-wrapper");
        } else assertThat(state.stateMachine().goalOptions()).isEmpty();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(mastery).isEmpty();
    }

    @Test void correctlyOwnedReadyDirectExamRemainsVisibleUnderActualCoverageFailure() {
        readyAssessment(); addForeignSubject("physics");
        var owner = new com.skillpilot.backend.completion.CompletionCallContext(
                "claude", "owner", Instant.now().plusSeconds(600), true);
        service.startCompletionAssessment(LEARNER,
                new com.skillpilot.backend.api.CompletionAssessmentStart("automatic:personal-curriculum", "Q",
                        learner.getCoachStateRevision()), "claude", "owner", owner.expiresAt());
        long revision = learner.getCoachStateRevision();
        String workflow = learner.getCompletionWorkflow();
        var state = com.skillpilot.backend.completion.CompletionCallContext.with(owner,
                () -> service.getCoachLearnerState(LEARNER));
        assertThat(state.activeGoal().id()).isEqualTo("Q");
        assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(state.nextAllowedActions()).contains("setMastery").doesNotContain("setActiveGoal");
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
        var safe = new com.skillpilot.backend.ai.CoachStateProjection("https://skillpilot.test").project(state);
        assertThat(safe.activeGoal().examData().getTaskContent()).isEqualTo("Assessment task.");
        assertThat(safe.activeGoal().examData().getSolutionContent()).isNull();
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(mastery).isEmpty();
        assertThat(focus).containsExactly("ROOT");
    }

    @ParameterizedTest
    @ValueSource(strings = {"foreign-owner", "unsupported", "unready", "expired", "generation", "scope"})
    void coverageFailureDoesNotWeakenAnyDirectExamBindingGuard(String reason) throws Exception {
        readyAssessment(); addForeignSubject("physics");
        service.startCompletionAssessment(LEARNER,
                new com.skillpilot.backend.api.CompletionAssessmentStart("automatic:personal-curriculum", "Q",
                        learner.getCoachStateRevision()), "claude", "owner", Instant.now().plusSeconds(600));
        var mapper = new ObjectMapper();
        var workflow = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(learner.getCompletionWorkflow());
        switch (reason) {
            case "unready" -> graph.get("Q").getExamData().setReviewStatus("draft");
            case "expired" -> ((com.fasterxml.jackson.databind.node.ObjectNode) workflow.get("directAssessment"))
                    .put("expiresAt", Instant.now().minusSeconds(1).toString());
            case "generation" -> workflow.put("curriculumGeneration", "old-generation");
            case "scope" -> workflow.put("personalCurriculumDigest", "different-scope");
            default -> { }
        }
        learner.setCompletionWorkflow(mapper.writeValueAsString(workflow));
        var call = new com.skillpilot.backend.completion.CompletionCallContext("claude",
                reason.equals("foreign-owner") ? "foreign" : "owner", Instant.now().plusSeconds(600),
                !reason.equals("unsupported"));
        var state = com.skillpilot.backend.completion.CompletionCallContext.with(call,
                () -> service.getCoachLearnerState(LEARNER));
        assertThat(state.activeGoal()).isNull();
        assertThat(state.frontier()).isEmpty();
        assertThat(state.nextAllowedActions()).isEmpty();
        assertThat(state.stateMachine().requiredAction()).isEqualTo("completionUnavailable");
        assertThat(mastery).isEmpty();
        verify(masteryRepository, never()).save(any());
    }

    private void readyAssessment() {
        // Direct-assessment fixtures persist their actual Instant binding, just
        // like the normal Spring-configured mapper used by the integration test.
        ReflectionTestUtils.setField(service, "objectMapper", new ObjectMapper().findAndRegisterModules());
        ExamData task = new ExamData();
        task.setReviewStatus("released"); task.setTaskContent("Assessment task.");
        task.setSolutionContent("Assessment solution.");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(1.0); scoring.setPassingPoints(1.0);
        ExamData.Step step = new ExamData.Step();
        step.setId("answer"); step.setPoints(1.0); step.setDescription("Correct answer");
        scoring.setSteps(List.of(step)); task.setScoring(scoring); graph.get("Q").setExamData(task);
    }

    private void addForeignSubject(String id) {
        LearningGoal foreign = atomic("FOREIGN", "A");
        graph.put("FOREIGN", foreign);
        SkillLandscape subject = new SkillLandscape();
        subject.setLandscapeId(id); subject.setTitle(id); subject.setGoals(List.of(foreign));
        LandscapeService landscapes = (LandscapeService) ReflectionTestUtils.getField(service, "landscapeService");
        when(landscapes.getById(id)).thenReturn(subject);
        when(landscapes.getAll()).thenReturn(List.of(landscape, subject));
        when(landscapes.getClosure("base")).thenReturn(List.of(landscape, subject));
        when(landscapes.getLandscapeIdForGoal("FOREIGN")).thenReturn(id);
    }

    private static LearningGoal atomic(String id, String... requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setContains(List.of());
        goal.setRequires(List.of(requires));
        return goal;
    }

    private static List<String> ids(List<FrontierGoal> goals) {
        return goals.stream().map(FrontierGoal::id).toList();
    }

    // Same stable competency identity; explicit acceptance of its current task is process state only.
    private void currentSameIdentityExam() {
        readyAssessment();
        graph.get("B").setNodeKind("exam");
        graph.get("B").setSemanticKind("curricularAtomic");
        graph.get("B").setExamData(graph.get("Q").getExamData());
        mastery.put("A", 1.0);
    }

    private com.skillpilot.backend.ai.CoachToolFacade startFacade() {
        return new com.skillpilot.backend.ai.CoachToolFacade(service, null,
                new com.skillpilot.backend.ai.CoachStateProjection("https://skillpilot.test"), null);
    }

    private com.skillpilot.backend.ai.CoachToolFacade.ExamEvaluationRequest evaluationB() {
        return new com.skillpilot.backend.ai.CoachToolFacade.ExamEvaluationRequest("B");
    }

    @Test void explicitNormalSameIdentityStartWorksWithoutDirectOrSupportedProvider() throws Exception {
        currentSameIdentityExam();
        var call = new com.skillpilot.backend.completion.CompletionCallContext(
                "openai", "ordinary", Instant.now().plusSeconds(600), false);
        com.skillpilot.backend.completion.CompletionCallContext.with(call, () -> {
            service.setActiveGoal(LEARNER, "B");
            assertThat(startFacade().getExamEvaluation(LEARNER, evaluationB()).solutionContent()).isEqualTo("Assessment solution.");
            return null;
        });
        var process = new ObjectMapper().findAndRegisterModules().readValue(learner.getCompletionWorkflow(),
                com.skillpilot.backend.completion.CompletionWorkflowState.class);
        assertThat(process.profileId()).isNull(); assertThat(process.directAssessment()).isNull();
        assertThat(process.assessmentStart().goalId()).isEqualTo("B");
        assertThat(com.skillpilot.backend.completion.CompletionNavigationPolicy.ownsNavigation(learner)).isFalse();
        learner.setFollowLearningPlans(true);
        assertThat(com.skillpilot.backend.completion.CompletionNavigationPolicy.followsPlans(learner)).isTrue();
        assertThat(mastery).containsExactlyEntriesOf(Map.of("A", 1.0));
        verify(masteryRepository, never()).save(any());
    }

    @Test void historicalActiveExamReadRequiresOneExplicitSameIdConfirmationAndIsIdempotent() {
        currentSameIdentityExam(); learner.setActiveGoalId("B"); learner.setLearningState(LearningState.TEACHING);
        long before = learner.getCoachStateRevision();
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.activeGoal().id()).isEqualTo("B");
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(ids(state.stateMachine().goalOptions())).containsExactly("B");
        assertThat(state.nextAllowedActions()).doesNotContain("setMastery");
        assertThat(com.skillpilot.backend.ai.CoachStateProjection.requiresAssessmentStartConfirmation(state)).isTrue();
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThatThrownBy(() -> startFacade().getExamEvaluation(LEARNER, evaluationB()))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        var refused = startFacade().setMastery(LEARNER, new MasteryUpdateRequest(Map.of("B",1.0), "B"));
        assertThat(refused.status()).isEqualTo(com.skillpilot.backend.ai.CoachToolFacade.MasteryStatus.CONFLICT);
        assertThat(learner.getCompletionWorkflow()).isNull();
        startFacade().setActiveGoal(LEARNER, new com.skillpilot.backend.api.ActiveGoalRequest("B", false));
        assertThat(learner.getActiveGoalId()).isEqualTo("B"); assertThat(focus).containsExactly("ROOT");
        String started = learner.getCompletionWorkflow(); long revision = learner.getCoachStateRevision();
        service.setActiveGoal(LEARNER,"B");
        assertThat(learner.getCompletionWorkflow()).isEqualTo(started);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(service.getCoachLearnerState(LEARNER).stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(startFacade().getExamEvaluation(LEARNER,evaluationB()).solutionContent()).isEqualTo("Assessment solution.");
        verify(masteryRepository, never()).save(any());
    }

    @Test void automaticSelectionAndMasteryRecoveryNeverEstablishAStart() {
        currentSameIdentityExam();
        service.setActiveGoalAutomatically(LEARNER,"B");
        assertThat(learner.getActiveGoalId()).isEqualTo("B");
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThatThrownBy(() -> startFacade().getExamEvaluation(LEARNER,evaluationB()))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(startFacade().setMastery(LEARNER,new MasteryUpdateRequest(Map.of("B",1.0),"B")).status())
                .isEqualTo(com.skillpilot.backend.ai.CoachToolFacade.MasteryStatus.CONFLICT);
        assertThat(learner.getCompletionWorkflow()).isNull();
        service.setActiveGoal(LEARNER,"B");
        assertThat(learner.getCompletionWorkflow()).isNotNull();
        verify(masteryRepository,never()).save(any());
    }

    @Test void actualAutopilotExamSuccessorStillRequiresExplicitTaskConfirmation() {
        currentSameIdentityExam(); learner.setAutoPilot(true);
        learner.setActiveGoalId("A"); learner.setLearningState(LearningState.TEACHING);
        mastery.clear();
        service.setMastery(LEARNER,new MasteryUpdateRequest(Map.of("A",1.0),"A"));
        assertThat(learner.getActiveGoalId()).isEqualTo("B");
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(service.getCoachLearnerState(LEARNER).stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThatThrownBy(() -> startFacade().getExamEvaluation(LEARNER,evaluationB()))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(mastery).doesNotContainKey("B");
    }

    @Test void currentTaskAndScoringChangesRequireConfirmationButBibliographyDoesNot() {
        currentSameIdentityExam(); service.setActiveGoal(LEARNER,"B");
        String initial = learner.getCompletionWorkflow();
        graph.get("B").setSourceRef("Corrected printed page 52");
        graph.get("B").getExamData().setSourceArtifactPath("renamed/bibliography.md");
        graph.get("B").getExamData().setReviewNote("Updated source pointer");
        assertThat(startFacade().getExamEvaluation(LEARNER,evaluationB()).solutionContent()).isNotBlank();
        assertThat(learner.getCompletionWorkflow()).isEqualTo(initial);
        graph.get("B").getExamData().setTaskContent("Actually changed complete assessment task.");
        assertThatThrownBy(() -> startFacade().getExamEvaluation(LEARNER,evaluationB()))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(initial);
        service.setActiveGoal(LEARNER,"B");
        assertThat(learner.getCompletionWorkflow()).isNotEqualTo(initial);
        graph.get("B").getExamData().getScoring().setPassingPoints(0.5);
        assertThatThrownBy(() -> service.assertCurrentAssessmentStarted(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        verify(masteryRepository,never()).save(any());
    }

    @Test void ordinaryPrerequisiteAndReadinessGuardsStillApplyBeforeExplicitStart() {
        currentSameIdentityExam(); mastery.clear();
        assertThatThrownBy(() -> service.setActiveGoal(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isNull();
        mastery.put("A",1.0); graph.get("B").getExamData().setReviewStatus("draft");
        assertThatThrownBy(() -> service.setActiveGoal(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void oneCurrentStartIsRetiredWhenTheCursorReallyLeavesThatTask() {
        currentSameIdentityExam();
        graph.put("D", atomic("D"));
        var children = new ArrayList<>(graph.get("ROOT").getContains()); children.add("D");
        graph.get("ROOT").setContains(children);
        landscape.setGoals(List.copyOf(graph.values()));
        service.setActiveGoal(LEARNER,"B");
        service.setActiveGoalAutomatically(LEARNER,"D");
        assertThat(learner.getCompletionWorkflow()).isNull();
        service.setActiveGoalAutomatically(LEARNER,"B");
        assertThatThrownBy(() -> service.assertCurrentAssessmentStarted(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }

    @Test void directStartBindsCurrentTaskAndRetainsForeignOwnerRefusal() throws Exception {
        currentSameIdentityExam();
        var owner = new com.skillpilot.backend.completion.CompletionCallContext(
                "claude","owner",Instant.now().plusSeconds(600),true);
        service.startCompletionAssessment(LEARNER,new com.skillpilot.backend.api.CompletionAssessmentStart(
                "automatic:personal-curriculum","B",learner.getCoachStateRevision()),"claude","owner",owner.expiresAt());
        var process = new ObjectMapper().findAndRegisterModules().readValue(learner.getCompletionWorkflow(),
                com.skillpilot.backend.completion.CompletionWorkflowState.class);
        assertThat(process.assessmentStart().goalId()).isEqualTo("B");
        com.skillpilot.backend.completion.CompletionCallContext.with(owner,()->{
            service.assertCurrentAssessmentStarted(LEARNER,"B"); return null;
        });
        var foreign = new com.skillpilot.backend.completion.CompletionCallContext("claude","foreign",owner.expiresAt(),true);
        assertThatThrownBy(()->com.skillpilot.backend.completion.CompletionCallContext.with(foreign,()->{
            service.assertCurrentAssessmentStarted(LEARNER,"B"); return null;
        })).isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }

    @ParameterizedTest @ValueSource(strings={"{bad", "{\"profileId\":\"old\"}",
            "{\"profileId\":\"\",\"assessmentStart\":{\"goalId\":\"B\",\"taskFingerprint\":\"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}}"})
    void malformedOrResidualRouteCannotBeOverwrittenByANormalStart(String raw) {
        currentSameIdentityExam(); learner.setCompletionWorkflow(raw);
        assertThatThrownBy(()->service.setActiveGoal(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThatThrownBy(()->service.assertCurrentAssessmentStarted(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(raw);
        verify(masteryRepository,never()).save(any());
    }

    @Test void masteredResultAndTrustedTeacherWriteRemainIndependentOfCurrentStart() {
        currentSameIdentityExam(); learner.setActiveGoalId("B"); mastery.put("B",1.0);
        service.assertCurrentAssessmentStarted(LEARNER,"B");
        assertThat(learner.getCompletionWorkflow()).isNull();
        mastery.remove("B");
        service.setMastery(LEARNER,new MasteryUpdateRequest(Map.of("B",1.0),"B"));
        assertThat(mastery).containsEntry("B",1.0);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    @Test void genericClientStateCannotForgeTheServerOwnedTaskStart() {
        currentSameIdentityExam(); learner.setActiveGoalId("B");
        String alleged = "{\"assessmentStart\":{\"goalId\":\"B\",\"taskFingerprint\":\"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}}";
        assertThatThrownBy(()->service.upsertClientState(LEARNER,"B",new com.skillpilot.backend.api.ClientStateRequest(
                Instant.now(),Map.of("completionWorkflow",alleged))))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThatThrownBy(()->service.assertCurrentAssessmentStarted(LEARNER,"B"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
    }

    @Test void startedNormalExamUsesTheExistingSingleBinaryResultWithoutASecondQualification() {
        currentSameIdentityExam(); service.setActiveGoal(LEARNER,"B");
        var incomplete=startFacade().setMastery(LEARNER,new MasteryUpdateRequest(Map.of("B",0.0),"B"));
        assertThat(incomplete.status()).isEqualTo(com.skillpilot.backend.ai.CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(mastery).containsEntry("B",0.0);
        // The established non-plan default ends the cursor after any recorded result, including0.
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getCompletionWorkflow()).isNull();
        startFacade().setActiveGoal(LEARNER,new com.skillpilot.backend.api.ActiveGoalRequest("B",false));
        var complete=startFacade().setMastery(LEARNER,new MasteryUpdateRequest(Map.of("B",1.0),"B"));
        assertThat(complete.status()).isEqualTo(com.skillpilot.backend.ai.CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(mastery).containsEntry("B",1.0).containsEntry("A",1.0);
        assertThat(learner.getCompletionWorkflow()).isNull();
    }

    private LearnerClientState currentExamWithSrsPreparationAndForeignUncoveredTarget() {
        readyAssessment(); addForeignSubject("physics");
        encodeMemory(graph.get("B"),"nodeKind");
        graph.get("B").setExtendedData(Map.of("vocabularySource","synthetic-memory.json"));
        var resource=new ByteArrayResource(
                "{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\",\"tags\":[\"memorization\"]}]}".getBytes(StandardCharsets.UTF_8));
        when(decks.resolveDeckResource("B","synthetic-memory.json")).thenReturn(resource);
        graph.get("C").setNodeKind("exam");graph.get("C").setSemanticKind("curricularAtomic");
        graph.get("C").setExamData(graph.get("Q").getExamData());
        learner.setActiveGoalId("C");learner.setLearningState(LearningState.TEACHING);
        mastery.put("B",1.0);
        return new LearnerClientState(learner,"B",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-10-29T12:00:00Z\"}}}",
                Instant.parse("2026-10-29T12:00:00Z"));
    }

    @ParameterizedTest @ValueSource(booleans={false,true})
    void retainedExamChoiceAndActualConfirmationUseCurrentStrictRecallDespiteLaterFailure(boolean verified) {
        var recall=currentExamWithSrsPreparationAndForeignUncoveredTarget();
        var reads=new java.util.concurrent.atomic.AtomicInteger();
        when(clientStates.findByLearnerAndNodeIds(anyString(),any())).thenAnswer(call->{
            if(reads.incrementAndGet()==1)return verified?List.of(recall):List.of();
            throw new IllegalStateException("Actual later tolerant SRS read failed");
        });
        var state=service.getCoachLearnerState(LEARNER);
        assertThat(reads.get()).isGreaterThan(1);
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_target_routes_uncovered");
        assertThat(state.levelCompletion().calculationStatus()).isEqualTo("invalid");
        assertThat(state.activeGoal().id()).isEqualTo("C");
        if(verified)assertThat(ids(state.stateMachine().goalOptions())).containsExactly("C");
        else assertThat(ids(state.stateMachine().goalOptions())).doesNotContain("C");
        assertThat(learner.getCompletionWorkflow()).isNull();
        // The write must obtain a fresh strict proof, not reuse either storedB1 or the read's stale capture.
        reads.set(0);long before=learner.getCoachStateRevision();
        if(verified){
            service.setActiveGoal(LEARNER,"C");
            assertThat(learner.getCompletionWorkflow()).isNotNull();
            assertThat(learner.getCoachStateRevision()).isGreaterThan(before);
        }else{
            assertThatThrownBy(()->service.setActiveGoal(LEARNER,"C"))
                    .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
            assertThat(learner.getCompletionWorkflow()).isNull();
            assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        }
        assertThat(reads.get()).isGreaterThan(0);
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B",1.0));
        verify(masteryRepository,never()).save(any());
    }

    @Test void aPreviouslyPublishedChoiceDoesNotSurviveUnavailableStrictInputAtItsWrite() {
        var recall=currentExamWithSrsPreparationAndForeignUncoveredTarget();
        when(clientStates.findByLearnerAndNodeIds(anyString(),any())).thenReturn(List.of(recall));
        var state=service.getCoachLearnerState(LEARNER);
        assertThat(ids(state.stateMachine().goalOptions())).containsExactly("C");
        when(clientStates.findByLearnerAndNodeIds(anyString(),any()))
                .thenThrow(new IllegalStateException("Current strict SRS input is unavailable"));
        long before=learner.getCoachStateRevision();
        assertThatThrownBy(()->service.setActiveGoal(LEARNER,"C"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(learner.getActiveGoalId()).isEqualTo("C");
        assertThat(learner.getCoachStateRevision()).isEqualTo(before);
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B",1.0));
        verify(masteryRepository,never()).save(any());
    }

    @Test void alreadyCurrentStartedTaskIsNotRequalifiedByLaterCompletionInputFailure() {
        var recall=currentExamWithSrsPreparationAndForeignUncoveredTarget();
        when(clientStates.findByLearnerAndNodeIds(anyString(),any())).thenReturn(List.of(recall));
        service.setActiveGoal(LEARNER,"C");String started=learner.getCompletionWorkflow();
        when(clientStates.findByLearnerAndNodeIds(anyString(),any()))
                .thenThrow(new IllegalStateException("Later completion input failed"));
        service.assertCurrentAssessmentStarted(LEARNER,"C");
        assertThat(learner.getCompletionWorkflow()).isEqualTo(started);
        assertThat(mastery).containsExactlyEntriesOf(Map.of("B",1.0));
        verify(masteryRepository,never()).save(any());
    }

    @Test void ordinaryNormalExamStartRemainsAvailableWithCompletionDisabledAndNoProfile() {
        currentSameIdentityExam();
        var disabled=new CompletionProfileCatalog(new com.skillpilot.backend.landscape.LandscapeProperties(),
                new ObjectMapper(),mock(LandscapeService.class),mock(GoalMappingService.class),decks,
                false,"","repository");
        ReflectionTestUtils.setField(service,"completionApplicationService",new CompletionApplicationService(disabled));
        service.setActiveGoal(LEARNER,"B");
        assertThat(startFacade().getExamEvaluation(LEARNER,evaluationB()).solutionContent()).isEqualTo("Assessment solution.");
        assertThat(com.skillpilot.backend.completion.CompletionNavigationPolicy.ownsNavigation(learner)).isFalse();
        assertThat(mastery).containsExactlyEntriesOf(Map.of("A",1.0));
        verify(masteryRepository,never()).save(any());
    }
}
