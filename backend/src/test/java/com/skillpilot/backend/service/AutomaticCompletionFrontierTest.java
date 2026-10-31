package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.clearInvocations;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.domain.Learner;
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
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Real automatic compilation through public frontier and explicit-learning APIs. */
class AutomaticCompletionFrontierTest {
    private static final String LEARNER = "automatic-frontier-learner";
    private final Map<String, LearningGoal> graph = new LinkedHashMap<>();
    private final Map<String, Double> mastery = new LinkedHashMap<>();
    private final List<String> focus = new ArrayList<>(List.of("ROOT"));
    private Learner learner;
    private LearnerService service;
    private MasteryRepository masteryRepository;
    private CompletionApplicationService completion;

    @BeforeEach void setUp() {
        // Q -> C -> B -> A. Z and O have no consumers; neither is a final exam.
        graph.put("A", atomic("A"));
        graph.put("B", atomic("B", "A"));
        graph.put("C", atomic("C", "B"));
        graph.put("Q", atomic("Q", "C"));
        graph.get("Q").setNodeKind("exam");
        graph.put("Z", atomic("Z"));
        graph.put("O", atomic("O"));
        graph.get("O").setSemanticKind("orientation");
        LearningGoal middle = atomic("MIDDLE");
        middle.setContains(List.of("A", "Z"));
        graph.put("MIDDLE", middle);
        LearningGoal root = atomic("ROOT");
        root.setContains(List.of("MIDDLE", "B", "C", "Q", "O"));
        graph.put("ROOT", root);

        SkillLandscape landscape = new SkillLandscape();
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
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), masteryRepository, planned,
                landscapes, mock(GoalMappingService.class), mock(DeckResourceService.class),
                new ObjectMapper(), mock(ApplicationEventPublisher.class));
        completion = new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(), Map.of(), "frontier-generation", true));
        ReflectionTestUtils.setField(service, "completionApplicationService", completion);
        var resolver = mock(CompletionCanonicalGraphResolver.class);
        when(resolver.load("base")).thenReturn(graph);
        ReflectionTestUtils.setField(service, "completionCanonicalGraphResolver", resolver);
    }

    @Test void unusedGoalsAndOrientationDoNotBlockTheRequiredPreparation() {
        assertThat(service.getFrontier(LEARNER)).contains("A").doesNotContain("Z", "O");
        assertThat(ids(service.getRichFrontier(LEARNER))).contains("A").doesNotContain("Z", "O");
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A", "Z", "O");
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
        exam.setRequires(List.of());
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
        assertThat(mastery).isEmpty();
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
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A", "O", "Z");
        assertThat(mastery).containsOnlyKeys("Q");
    }

    @Test void curriculumWithoutAssessmentsIsImplicitlyCompleteButVoluntaryLearningRemainsAvailable() {
        graph.get("Q").setNodeKind(null);
        assertThat(service.getFrontier(LEARNER)).isEmpty();
        assertThat(service.getRichFrontier(LEARNER)).isEmpty();
        var state = service.getCoachLearnerState(LEARNER);
        assertThat(state.goals().scope_completed()).isTrue();
        assertThat(state.goals().scope().mastered_atomic()).isZero();
        assertThat(state.levelCompletion().requiredAssessmentCount()).isZero();
        assertThat(state.levelCompletion().complete()).isTrue();
        assertThat(state.stateMachine().goalOptions()).isEmpty();
        assertThat(ids(service.getUncompactedRichFrontier(LEARNER))).contains("A", "O", "Z");
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
        verify(masteryRepository, never()).save(any());
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
}
