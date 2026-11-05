package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.completion.learningunit.*;
import com.skillpilot.backend.domain.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.test.util.ReflectionTestUtils;

/** Public runtime seams share explicit outcomes and one authoritative global unit result. */
class LearningUnitRecognitionIntegrationTest {
    @Test void uncontractedMathEndpointsStayOpenInsteadOfReceivingLegacyVacuousCredit() throws Exception {
        var f = fixture(false);
        assertThat(f.service().getMasteryResponse("learner").learningUnits().recognizedGoalIds()).isEmpty();
        assertThat(ids(f.service().getRichFrontier("learner"))).contains("A", "Z");
        var state = f.service().getCoachLearnerState("learner");
        assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
        assertThat(state.levelCompletion().complete()).isFalse();
        assertThat(state.goals().personalized().mastered_atomic()).isZero();
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void masteredOrOutsideFocusIntermediateCannotHideAnOpenInFocusRequirement() throws Exception {
        var f = fixture(false);
        f.mastery().put("B", 1.0);
        assertThat(ids(f.service().getRichFrontier("learner"))).contains("A", "Z").doesNotContain("Q");
        f.focus().clear(); f.focus().addAll(List.of("A", "Q"));
        assertThat(ids(f.service().getRichFrontier("learner"))).containsExactly("A");
        f.focus().clear(); f.focus().add("Q");
        assertThat(ids(f.service().getRichFrontier("learner"))).containsExactly("Q");
        f.learner().setStrictMode(true);
        assertThat(f.service().getRichFrontier("learner")).isEmpty();
    }

    @Test void globalRecognitionSurvivesShortcutAndPlanPreferencesAndNoSelectedCurriculum() throws Exception {
        var f = fixture(false);
        f.mastery().put("Q", 1.0);
        f.learner().setUseAssessmentShortcuts(false);
        f.learner().setLearningPlanCountOnlyExplicitGoals(true);
        var response = f.service().getMasteryResponse("learner");
        assertThat(response.mastery()).containsOnlyKeys("Q");
        assertThat(response.learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        assertThat(ids(f.service().getRichFrontier("learner"))).contains("Z").doesNotContain("A", "B", "Q");
        var state = f.service().getCoachLearnerState("learner");
        assertThat(state.goals().personalized().mastered_atomic()).isEqualTo(3);
        f.learner().setSelectedCurriculum(null);
        assertThat(f.service().getMasteryResponse("learner").learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        assertThat(f.service().getMasteryResponse("learner").learningUnits().units()).isEmpty();
        assertThat(f.mastery()).containsOnlyKeys("Q");
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void genuineVoluntaryRepetitionDoesNotCreateOrWithdrawDerivedResults() throws Exception {
        var f = fixture(false);
        f.mastery().put("Q", 1.0);
        f.service().setActiveGoal("learner", "A");
        assertThat(f.learner().getActiveGoalId()).isEqualTo("A");
        assertThat(f.service().getMasteryResponse("learner").learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        assertThat(f.service().getMasteryResponse("learner").learningUnits().voluntaryGoalIds()).contains("A");
        var state = f.service().getCoachLearnerState("learner");
        assertThat(state.activeGoal().id()).isEqualTo("A");
        assertThat(state.learningState()).isEqualTo(LearningState.TEACHING.name());
        assertThat(state.learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        assertThat(f.mastery()).containsOnlyKeys("Q");
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void recallAndExplicitResultsUseOneBatchAndCorrectionsInvalidateRecognitionCache() throws Exception {
        var f = fixture(true);
        f.mastery().put("Q", 1.0);
        var passed = new LearnerClientState(f.learner(), "K",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-11-05T09:00:00Z\"}}}", Instant.now());
        when(f.cardStates().findByLearnerAndNodeIds(eq("learner"), anyList())).thenReturn(List.of(passed));
        clearInvocations(f.cardStates());
        var first = f.service().getMasteryResponse("learner");
        assertThat(first.mastery()).containsEntry("Q", 1.0).containsEntry("K", 1.0).doesNotContainKeys("A", "B");
        assertThat(first.learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        verify(f.cardStates(), times(1)).findByLearnerAndNodeIds(eq("learner"), anyList());
        when(f.cardStates().findByLearnerAndNodeIds(eq("learner"), anyList())).thenReturn(List.of());
        clearInvocations(f.cardStates());
        var corrected = f.service().getMasteryResponse("learner");
        assertThat(corrected.mastery()).containsEntry("K", 0.0);
        assertThat(corrected.learningUnits().recognizedGoalIds()).containsExactly("B");
        assertThat(corrected.learningUnits().units().getFirst().complete()).isFalse();
        verify(f.cardStates(), times(1)).findByLearnerAndNodeIds(eq("learner"), anyList());
        verify(f.masteryRepository(), never()).save(any());
    }

    @Test void planOverallCreditNeverCreatesAnExplicitDatedCompletion() throws Exception {
        var f = fixture(false);
        f.mastery().put("Q", 1.0);
        var recognition = f.service().reconcileLearningUnitPlanRecognition("learner", f.service().getMastery("learner"), Set.of("Z"));
        assertThat(recognition).containsExactlyInAnyOrder("A", "B").doesNotContain("Z");
        Map<String, Instant> events = Map.of("Q", Instant.parse("2026-11-05T09:00:00Z"));
        assertThat(events).hasSize(1).doesNotContainKey("A");
        var balance = LearnerLearningPlanService.calculateBalance(Set.of("A", "Q"),
                Map.of("A", LocalDate.of(2026, 11, 5), "Q", LocalDate.of(2026, 11, 5)),
                LocalDate.of(2026, 11, 5), LocalDate.of(2026, 11, 5), f.mastery(), events, recognition);
        assertThat(balance.rohsaldo()).isZero(); // Total achievement is two; the ledger still has one event.
        assertThat(LearnerLearningPlanService.periodGauge(Set.of("A", "Q"),
                Map.of("A", LocalDate.of(2026, 11, 5), "Q", LocalDate.of(2026, 11, 5)),
                LocalDate.of(2026, 11, 5), LocalDate.of(2026, 11, 5), f.mastery(), events))
                .isEqualTo(new com.skillpilot.backend.api.LearnerPlanTodayStatus.PeriodGauge(1, 2, 0.5));
    }

    @Test void liveUnderstandingMappingCannotBecomeAnExplicitUnitExamOrFeedRecognition() throws Exception {
        var f = fixture(false);
        f.mastery().put("HE:understanding", 1.0);
        when(f.mappings().getAllMappings()).thenReturn(List.of(new ResolvedGoalMapping("HE", "base",
                "HE:understanding", "Q", "exact", "live-unreviewed-mapping.json")));
        var response = f.service().getMasteryResponse("learner");
        assertThat(response.mastery()).containsEntry("HE:understanding", 1.0).doesNotContainKey("Q");
        assertThat(response.learningUnits().recognizedGoalIds()).isEmpty();
        assertThat(response.learningUnits().units().getFirst().explicitTargetCount()).isZero();
        var coach = f.service().getCoachLearnerState("learner");
        assertThat(coach.learningUnits().recognizedGoalIds()).isEmpty();
        assertThat(coach.levelCompletion().masteredAssessmentCount()).isZero();
        assertThat(coach.levelCompletion().waivedTargetGoalIds()).isEmpty();
        assertThat(f.service().getMasteryWithTimestamps("learner")).doesNotContainKey("Q");
    }

    @Test void unknownLiveOrdinaryAliasCannotCreateContradictoryCardAndUnitCounts() throws Exception {
        var f = fixture(false);
        f.mastery().put("HE:understanding", 1.0);
        when(f.mappings().getAllMappings()).thenReturn(List.of(new ResolvedGoalMapping("HE", "base",
                "HE:understanding", "A", "exact", "live-mapping.json")));
        var response = f.service().getMasteryResponse("learner");
        assertThat(response.mastery()).doesNotContainKey("A");
        assertThat(response.learningUnits().units().getFirst().explicitTargetCount()).isZero();
        assertThat(f.service().getCoachLearnerState("learner").goals().personalized().mastered_atomic()).isZero();
    }

    @Test void admittedHistoricalExamAndOrdinaryAliasesSurviveCountryAndCurriculumChanges() throws Exception {
        var exam = fixture(false, Map.of("HE:old-Q", "Q"));
        exam.mastery().put("HE:old-Q", 1.0);
        exam.learner().setPersonalCurriculum("{\"base\":{\"filterId\":\"DE-HE\"}}");
        assertThat(exam.service().getMasteryResponse("learner").learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        exam.learner().setPersonalCurriculum("{\"base\":{\"filterId\":\"DE-BY\"}}");
        assertThat(exam.service().getMasteryResponse("learner").mastery()).containsEntry("Q", 1.0);
        assertThat(exam.service().getMasteryResponse("learner").learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        var ordinary = fixture(false, Map.of("HE:old-A", "A"));
        ordinary.mastery().put("HE:old-A", 1.0);
        ordinary.learner().setPersonalCurriculum("{\"base\":{\"filterId\":\"DE-BY\"}}");
        var direct = ordinary.service().getMasteryResponse("learner");
        assertThat(direct.mastery()).containsEntry("A", 1.0);
        assertThat(direct.learningUnits().recognizedGoalIds()).isEmpty();
        assertThat(direct.learningUnits().units().getFirst().explicitTargetCount()).isEqualTo(1);
    }

    @Test void unifiedCoachStateUsesOneChangingRepositorySnapshotForMasteryRecallAndRecognition() throws Exception {
        var f = fixture(true);
        var passed = new LearnerClientState(f.learner(), "K",
                "{\"card\":{\"verifiedRecall\":{\"status\":\"passed\",\"passedAt\":\"2026-11-05T09:00:00Z\"}}}", Instant.now());
        when(f.masteryRepository().findByLearner_SkillpilotId("learner"))
                .thenReturn(List.of(new Mastery(f.learner(), "Q", 1.0)), List.of());
        when(f.cardStates().findByLearnerAndNodeIds(eq("learner"), anyList())).thenReturn(List.of(passed), List.of());
        clearInvocations(f.masteryRepository(), f.cardStates());
        var state = f.service().getCoachLearnerState("learner");
        assertThat(state.learningUnits().recognizedGoalIds()).containsExactly("A", "B");
        assertThat(state.goals().personalized().mastered_atomic()).isEqualTo(4);
        assertThat(state.levelCompletion().masteredTargetCount()).isEqualTo(2);
        assertThat(state.levelCompletion().waivedTargetCount()).isEqualTo(2);
        verify(f.masteryRepository(), times(1)).findByLearner_SkillpilotId("learner");
        verify(f.cardStates(), times(1)).findByLearnerAndNodeIds(eq("learner"), anyList());
    }

    @Test void oneUnavailableRecallInputDoesNotAbortOtherReliableOutcomes() throws Exception {
        var f = fixture(true);
        f.mastery().put("Q", 1.0); f.mastery().put("other-subject-result", 1.0);
        when(f.decks().resolveDeckResource(eq("K"), anyString())).thenReturn(null);
        var response = f.service().getMasteryResponse("learner");
        assertThat(response.mastery()).containsEntry("Q", 1.0).containsEntry("other-subject-result", 1.0);
        assertThat(response.learningUnits().calculationStatus()).isEqualTo("partial");
        assertThat(response.learningUnits().recognizedGoalIds()).containsExactly("B");
        assertThat(response.learningUnits().units().getFirst().calculationStatus()).isEqualTo("unavailable");
        assertThat(response.learningUnits().units().getFirst().complete()).isFalse();
        verify(f.masteryRepository(), never()).save(any());
    }

    private Fixture fixture(boolean recall) throws Exception {
        return fixture(recall, Map.of());
    }

    private Fixture fixture(boolean recall, Map<String, String> admittedAliases) throws Exception {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        graph.put("A", goal("A")); graph.put("B", goal("B", "A")); graph.put("Q", goal("Q", "B"));
        graph.get("Q").setNodeKind("exam"); graph.get("Q").setSemanticKind("practiceAssessment");
        ExamData exam = new ExamData(); exam.setReviewStatus("released");
        exam.setTaskContent("Apply A and B independently."); exam.setSolutionContent("Complete independent application.");
        ExamData.Scoring scoring = new ExamData.Scoring(); scoring.setMaxPoints(1); scoring.setPassingPoints(1);
        ExamData.Step step = new ExamData.Step(); step.setId("application"); step.setPoints(1); step.setDescription("Applies A and B.");
        scoring.setSteps(List.of(step)); exam.setScoring(scoring); graph.get("Q").setExamData(exam);
        graph.put("Z", goal("Z"));
        if (recall) {
            graph.put("K", goal("K", "A"));
            graph.get("K").setNodeKind("memory"); graph.get("K").setSemanticKind("memory");
            graph.get("K").setTags(List.of()); graph.get("K").setExtendedData(Map.of("vocabularySource", "/data/unit-fixture.json"));
        }
        LearningGoal root = goal("ROOT"); root.setType("cluster"); root.setContains(new ArrayList<>(graph.keySet())); graph.put("ROOT", root);
        Learner learner = new Learner(); learner.setSkillpilotId("learner"); learner.setSelectedCurriculum("base");
        learner.setLearningState(LearningState.FRONTIER); learner.setAutoPilot(false);
        var learners = mock(LearnerRepository.class);
        when(learners.findById("learner")).thenReturn(Optional.of(learner));
        when(learners.findBySkillpilotIdForUpdate("learner")).thenReturn(Optional.of(learner));
        when(learners.existsById("learner")).thenReturn(true);
        when(learners.save(any())).thenAnswer(call -> call.getArgument(0));
        var states = mock(LearnerClientStateRepository.class);
        var masteryRepository = mock(MasteryRepository.class);
        Map<String, Double> mastery = new LinkedHashMap<>();
        when(masteryRepository.findByLearner_SkillpilotId("learner")).thenAnswer(call -> mastery.entrySet().stream()
                .map(entry -> new Mastery(learner, entry.getKey(), entry.getValue())).toList());
        List<String> focus = new ArrayList<>(List.of("ROOT"));
        var planned = mock(PlannedGoalRepository.class);
        when(planned.findByLearner_SkillpilotId("learner")).thenAnswer(call -> focus.stream().map(id -> new PlannedGoal(learner, id)).toList());
        var landscapes = mock(LandscapeService.class);
        var landscape = new SkillLandscape(); landscape.setLandscapeId("base"); landscape.setTitle("Math fixture"); landscape.setGoals(List.copyOf(graph.values()));
        when(landscapes.getById("base")).thenReturn(landscape); when(landscapes.getClosure("base")).thenReturn(List.of(landscape));
        when(landscapes.getOverview(anyString(), anyBoolean())).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(call -> graph.get(call.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenReturn("base");
        var decks = mock(DeckResourceService.class);
        when(decks.resolveDeckResource(eq("K"), anyString())).thenReturn(new ByteArrayResource(
                "{\"cards\":[{\"id\":\"card\",\"front\":\"Question\",\"back\":\"Answer\"}]}".getBytes(StandardCharsets.UTF_8)));
        ObjectMapper mapper = new ObjectMapper();
        var mappings = mock(GoalMappingService.class);
        var service = new LearnerService(learners, states, masteryRepository, planned, landscapes,
                mappings, decks, mapper, mock(ApplicationEventPublisher.class));
        var completion = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), "unit-fixture", true));
        ReflectionTestUtils.setField(service, "completionApplicationService", completion);
        var resolver = mock(CompletionCanonicalGraphResolver.class); when(resolver.load("base")).thenReturn(graph);
        ReflectionTestUtils.setField(service, "completionCanonicalGraphResolver", resolver);
        List<String> own = recall ? List.of("A", "B", "Q", "K") : List.of("A", "B", "Q");
        Map<String, LearningUnitDefinition.GoalMeaning> meanings = new HashMap<>();
        Map<String, String> digests = new HashMap<>(); Map<String, String> kinds = new HashMap<>();
        own.forEach(id -> { meanings.put(id, LearningUnitSourceBindings.meaning(graph.get(id)));
            digests.put(id, LearningUnitSourceBindings.meaningDigest(graph.get(id)));
            kinds.put(id, LearningUnitSourceBindings.resolvedKind(graph.get(id))); });
        Map<String, List<String>> edges = new CompletionProfileCompiler().compileAtomicPrerequisites(graph, Set.copyOf(own));
        Map<String, String> text = Map.of("de", "Test", "en", "Test");
        var definition = new LearningUnitDefinition(1, LearningUnitDefinition.SEMANTICS, "unit", "1",
                new LearningUnitDefinition.SourceBinding("base", "unit", "1", Map.of()), text, text, text,
                own, List.of(), List.of("Q"), recall ? List.of("K") : List.of(), List.of(), meanings, kinds, digests, edges,
                Map.of("Q", new LearningUnitDefinition.AssessmentClaim(List.of("A", "B"), "task", "rubric", "review")), "review");
        // The compiler/evaluator is real. File/source admission has its own tests;
        // this fixture isolates public learner-service behavior without file I/O.
        var constructor = LearningUnitCatalog.class.getDeclaredConstructor(List.class, Map.class, Map.class, Map.class); constructor.setAccessible(true);
        var catalog = constructor.newInstance(List.of(definition), Map.of(), graph, admittedAliases);
        ReflectionTestUtils.setField(service, "learningUnitApplicationService", new LearningUnitApplicationService(catalog,
                own.stream().collect(java.util.stream.Collectors.toMap(id -> id, graph::get)),
                recall ? Set.of("A", "B", "Q", "K", "Z") : Set.of("A", "B", "Q", "Z"), Set.of(definition.ref())));
        return new Fixture(service, learner, mastery, focus, masteryRepository, states, mappings, decks);
    }

    private static LearningGoal goal(String id, String... requires) {
        LearningGoal goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setDescription("Can apply " + id);
        goal.setType("atomic"); goal.setNodeKind("tutor"); goal.setSemanticKind("curricularAtomic");
        goal.setContains(List.of()); goal.setRequires(List.of(requires)); return goal;
    }
    private static List<String> ids(List<FrontierGoal> goals) { return goals.stream().map(FrontierGoal::id).toList(); }
    private record Fixture(LearnerService service, Learner learner, Map<String, Double> mastery, List<String> focus,
                           MasteryRepository masteryRepository, LearnerClientStateRepository cardStates,
                           GoalMappingService mappings, DeckResourceService decks) { }
}
