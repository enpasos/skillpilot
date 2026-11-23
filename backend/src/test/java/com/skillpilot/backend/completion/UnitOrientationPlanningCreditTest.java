package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.UnitLearningMaterialService;
import com.skillpilot.backend.service.VerifiedExamPassService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Synthetic future edition; no current or historical curriculum claim is extended. */
class UnitOrientationPlanningCreditTest {
    private static final String LEARNER = "orientation-credit-learner";
    private static final String LANDSCAPE = "orientation-credit-landscape";
    private static final String VIEW = "orientation-credit-view";
    private static final String UNIT = "own-unit";
    private static final String OPENING = "opening";
    private static final String CONTENT = "content";
    private static final String RECALL = "own-recall";
    private static final String SECTION = "composition:" + VIEW + ":structure:" + UNIT;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void currentOwnAssessmentsAndPersonalRecallGrantOnlyEphemeralPlanningCredit() throws Exception {
        var fixture = new Fixture();
        var credits = fixture.credits();
        assertThat(credits).containsOnlyKeys(OPENING);
        assertThat(credits.get(OPENING).ruleId()).isEqualTo("versioned_unit_assessment:" + fixture.release.fingerprint());
        assertThat(credits.get(OPENING).assessmentGoalIds()).containsExactly("exam-a", "exam-b");

        var targets = Set.of(OPENING, CONTENT, RECALL, "exam-a", "exam-b");
        var definition = new CompletionProfileDefinition(1, "automatic:future-unit", "v2", Map.of("de", "Einheit", "en", "Unit"),
                SECTION, Map.of(), List.of(), null, List.of());
        var compiled = new CompletionProfileCompiler().compileAutomaticProfile(definition,
                fixture.graph, targets, targets, "future-edition");
        var explicit = Set.of(RECALL, "exam-a", "exam-b");
        var before = new CompletionEvaluator().evaluate(compiled, explicit);
        assertThat(before.pendingTargetGoalIds()).contains(OPENING);
        CompletionEvaluation after = ReflectionTestUtils.invokeMethod(fixture.learners, "withUnitPlanningCredits",
                before, compiled, fixture.learner, fixture.projection, fixture.graph);
        assertThat(after.waivedGoalIds()).contains(OPENING);
        assertThat(after.masteredGoalIds()).containsExactlyInAnyOrderElementsOf(explicit).doesNotContain(OPENING);
        assertThat(after.complete()).isTrue();
        verify(fixture.mastery, atLeastOnce()).findMasteredGoalIds(LEARNER, List.of(RECALL), Mastery.LEGACY_MASTERED_THRESHOLD);
        verifyNoMoreInteractions(fixture.mastery);
        verifyNoInteractions(fixture.learnerRepository, fixture.clientStates, fixture.plannedGoals, fixture.events);
    }

    @Test
    void changedGermanOrEnglishIntroductionAndChangedGoalMeaningDisableTheRelease() throws Exception {
        for (String language : List.of("de", "en")) {
            var fixture = new Fixture();
            var introductions = new LinkedHashMap<>(fixture.material.intro());
            var old = introductions.get(language);
            introductions.put(language, new UnitLearningMaterialService.Intro(old.question(),
                    old.promise() + " Additional promise.", old.scene(), old.imageUrl(), old.imageAlt(), old.topics()));
            fixture.material = new UnitLearningMaterialService.Material(null, null, OPENING, introductions, Map.of(),
                    fixture.contract, null, List.of());
            assertThat(fixture.credits()).as(language).isEmpty();
        }
        var changedGoal = new Fixture();
        changedGoal.opening.setDescription("A changed orientation meaning.");
        assertThat(changedGoal.credits()).isEmpty();
    }

    @Test
    void aChangedOwnerOrAnOmittedOwnAssessmentCannotProduceAnOrientationCredit() throws Exception {
        var changedOwner = new Fixture();
        changedOwner.owner.setRevision("later-owner-edition");
        assertThat(changedOwner.credits()).isEmpty();
        var foreignOpening = new Fixture();
        foreignOpening.landscape.getGoalPlacements().stream().filter(p -> OPENING.equals(p.getGoalId()))
                .findFirst().orElseThrow().setUnitId("another-owner");
        assertThat(foreignOpening.credits()).isEmpty();
        var omittedAssessment = new Fixture();
        omittedAssessment.addOwnGoal(exam("exam-c"));
        assertThat(omittedAssessment.credits()).isEmpty();
    }

    @Test
    void everyOwnPassingReceiptMustCarryThisExactReleaseBinding() throws Exception {
        var missing = new Fixture();
        missing.receipts.remove("exam-b");
        assertThat(missing.credits()).isEmpty();
        var historical = new Fixture();
        historical.receipts.put("exam-b", List.of(historical.pass("exam-b", List.of())));
        assertThat(historical.credits()).isEmpty();
        var anotherRelease = new Fixture();
        anotherRelease.receipts.put("exam-b", List.of(anotherRelease.pass("exam-b", List.of("sha256:" + "e".repeat(64)))));
        assertThat(anotherRelease.credits()).isEmpty();
    }

    @Test
    void personalRecallAndTheCompleteOwnRecallInventoryAreBothRequired() throws Exception {
        var personallyOpen = new Fixture();
        when(personallyOpen.mastery.findMasteredGoalIds(LEARNER, List.of(RECALL), Mastery.LEGACY_MASTERED_THRESHOLD)).thenReturn(Set.of());
        assertThat(personallyOpen.credits()).isEmpty();
        var omittedRecall = new Fixture();
        var secondRecall = goal("second-own-recall", "memory");
        secondRecall.setNodeKind("memory");
        omittedRecall.addOwnGoal(secondRecall);
        assertThat(omittedRecall.credits()).isEmpty();
    }

    @Test
    void ordinaryCreditAndOrdinaryGoalTypesCannotMasqueradeAsOrientationCredit() throws Exception {
        var ordinaryRule = new Fixture();
        var invalid = new UnitAssessmentContract.PlanningCredit(List.of("exam-a", "exam-b"), List.of(OPENING),
                ordinaryRule.release);
        ordinaryRule.contract = new UnitAssessmentContract("future-v2", List.of(VIEW), ordinaryRule.contract.parts(),
                List.of(CONTENT, OPENING), List.of(invalid));
        assertThat(ordinaryRule.credits()).isEmpty();
        var ordinaryGoal = new Fixture();
        ordinaryGoal.graph.get(OPENING).setSemanticKind("curricularAtomic");
        assertThat(ordinaryGoal.credits()).isEmpty();
    }

    private static class Fixture {
        final MasteryRepository mastery = mock(MasteryRepository.class);
        final LearnerRepository learnerRepository = mock(LearnerRepository.class);
        final LearnerClientStateRepository clientStates = mock(LearnerClientStateRepository.class);
        final PlannedGoalRepository plannedGoals = mock(PlannedGoalRepository.class);
        final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
        final LandscapeService landscapes = mock(LandscapeService.class);
        final UnitLearningMaterialService materials = mock(UnitLearningMaterialService.class);
        final VerifiedExamPassService passes = mock(VerifiedExamPassService.class);
        final LearnerService learners;
        final Learner learner = new Learner();
        final SkillLandscape landscape = new SkillLandscape();
        final ProgramUnit owner = new ProgramUnit();
        final LearningGoal opening = goal(OPENING, "orientation");
        final Map<String, LearningGoal> graph = new LinkedHashMap<>();
        final Map<String, List<VerifiedExamPassResponse>> receipts = new LinkedHashMap<>();
        UnitAssessmentContract contract;
        UnitPlanningRelease release;
        UnitLearningMaterialService.Material material;
        final Object projection;

        Fixture() throws Exception {
            learner.setSkillpilotId(LEARNER);
            landscape.setLandscapeId(LANDSCAPE);
            landscape.setGoals(new ArrayList<>());
            landscape.setGoalPlacements(new ArrayList<>());
            owner.setId(UNIT);
            owner.setKind("learningUnit");
            owner.setRevision("future-owner-v2");
            owner.setCoverageReviews(new ArrayList<>());
            landscape.setProgramUnits(List.of(owner));
            addOwnGoal(opening);
            addOwnGoal(goal(CONTENT, "curricularAtomic"));
            var recall = goal(RECALL, "memory");
            recall.setNodeKind("memory");
            addOwnGoal(recall);
            addOwnGoal(exam("exam-a"));
            addOwnGoal(exam("exam-b"));
            var parts = List.of(new UnitAssessmentContract.Part("exam-a", AssessmentMaterialRevision.of(graph.get("exam-a").getExamData())),
                    new UnitAssessmentContract.Part("exam-b", AssessmentMaterialRevision.of(graph.get("exam-b").getExamData())));
            for (var part : parts) {
                var coverage = new ProgramUnit.CoverageReview();
                coverage.setAssessmentGoalId(part.goalId());
                coverage.setGoalIds(List.of(CONTENT));
                coverage.setReference("reviews/future-orientation-v2.md");
                coverage.setTaskRevision(part.material().taskRevision());
                coverage.setRubricRevision(part.material().rubricRevision());
                owner.getCoverageReviews().add(coverage);
            }
            var intro = Map.of("de", new UnitLearningMaterialService.Intro("Was möchtest du erkunden?", "Du erkundest Bewegungen.",
                    "Ein Ball liegt auf einem Tisch.", "/assets/future.png", "Ein Ball.", List.of("Bewegung")),
                    "en", new UnitLearningMaterialService.Intro("What would you like to explore?", "You will explore motion.",
                    "A ball rests on a table.", "/assets/future.png", "A ball.", List.of("Motion")));
            var definitions = Map.of(OPENING, new UnitPlanningRelease.GoalDefinition(
                    UnitPlanningRelease.definitionFingerprint(opening), UnitPlanningRelease.hash(intro)));
            var review = new UnitPlanningRelease.Review("reviews/future-orientation-v2.md", "sha256:" + "a".repeat(64));
            var draft = new UnitPlanningRelease(1, "future-credit-v2", UNIT, owner.getRevision(), List.of(VIEW), review,
                    definitions, "sha256:" + "0".repeat(64));
            var orientation = new UnitAssessmentContract.OrientationCredit(List.of(RECALL));
            var draftRule = new UnitAssessmentContract.PlanningCredit(List.of("exam-a", "exam-b"), List.of(OPENING), draft, orientation);
            var draftContract = new UnitAssessmentContract("future-v2", List.of(VIEW), parts, List.of(CONTENT), List.of(draftRule));
            release = new UnitPlanningRelease(1, draft.revision(), UNIT, owner.getRevision(), List.of(VIEW), review,
                    definitions, draft.calculateFingerprint(LANDSCAPE, UNIT, draftContract, draftRule));
            var rule = new UnitAssessmentContract.PlanningCredit(draftRule.requiredPartIds(), draftRule.goalIds(), release, orientation);
            contract = new UnitAssessmentContract("future-v2", List.of(VIEW), parts, List.of(CONTENT), List.of(rule));
            material = new UnitLearningMaterialService.Material(null, null, OPENING, intro, Map.of(), contract, null, List.of());
            for (var part : parts) receipts.put(part.goalId(), List.of(pass(part.goalId(), List.of(release.fingerprint()))));

            var projectedOpening = MAPPER.convertValue(opening, LearningGoal.class);
            projectedOpening.setExtendedData(Map.of("skillpilotRequiredUnitEntry", true));
            graph.put(OPENING, projectedOpening);
            var targetIds = Set.copyOf(graph.keySet());
            var views = mock(CompositionViewService.class);
            when(views.resolveStructureReference(SECTION)).thenReturn(new CompositionViewService.CompositionStructureResolution(
                    SECTION, VIEW, UNIT, "Future unit", List.copyOf(targetIds)));
            var constructor = Class.forName(LearnerService.class.getName() + "$GoalProjection").getDeclaredConstructors()[0];
            constructor.setAccessible(true);
            projection = constructor.newInstance(graph, targetIds, Set.of(), graph, Set.of(VIEW), List.of(SECTION), true, null, graph);
            learners = new LearnerService(learnerRepository, clientStates, mastery, plannedGoals, landscapes,
                    mock(GoalMappingService.class), mock(DeckResourceService.class), MAPPER, events);
            ReflectionTestUtils.setField(learners, "compositionViewService", views);
            ReflectionTestUtils.setField(learners, "unitLearningMaterialService", materials);
            ReflectionTestUtils.setField(learners, "verifiedExamPassService", passes);
            ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
            var completion = mock(CompletionApplicationService.class);
            var catalog = mock(CompletionProfileCatalog.class);
            when(completion.catalog()).thenReturn(catalog);
            when(catalog.enabled()).thenReturn(true);
            when(catalog.available()).thenReturn(true);
            when(catalog.automatic()).thenReturn(true);
            ReflectionTestUtils.setField(learners, "completionApplicationService", completion);
            when(landscapes.getById(LANDSCAPE)).thenReturn(landscape);
            when(landscapes.getLandscapeIdForGoal(any())).thenReturn(LANDSCAPE);
            when(materials.isReviewedPlanningRelease(release)).thenReturn(true);
            when(materials.find(LANDSCAPE, VIEW, UNIT)).thenAnswer(call -> Optional.of(material));
            when(materials.assessmentBindings(Set.of(VIEW))).thenAnswer(call -> List.of(binding()));
            when(passes.findForGoals(eq(LEARNER), any())).thenAnswer(call -> Map.copyOf(receipts));
            when(mastery.findMasteredGoalIds(LEARNER, List.of(RECALL), Mastery.LEGACY_MASTERED_THRESHOLD)).thenReturn(Set.of(RECALL));
        }

        void addOwnGoal(LearningGoal goal) {
            graph.put(goal.getId(), goal);
            landscape.getGoals().add(goal);
            var placement = new GoalPlacement();
            placement.setGoalId(goal.getId());
            placement.setUnitId(UNIT);
            placement.setRelation("own");
            landscape.getGoalPlacements().add(placement);
        }

        VerifiedExamPassResponse pass(String goalId, List<String> bindings) {
            var part = contract.parts().stream().filter(p -> goalId.equals(p.goalId())).findFirst().orElseThrow();
            return new VerifiedExamPassResponse(Instant.parse("2026-11-22T07:00:00Z"), 2, 2, 2,
                    part.material().taskRevision(), part.material().rubricRevision(), part.material().fingerprint(), bindings);
        }

        UnitLearningMaterialService.AssessmentBinding binding() {
            return new UnitLearningMaterialService.AssessmentBinding(LANDSCAPE, VIEW, UNIT, contract);
        }

        Map<String, CompletionEvaluation.WaiverReason> credits() {
            return ReflectionTestUtils.invokeMethod(learners, "unitPlanningCredits", learner, projection, graph);
        }
    }

    private static LearningGoal goal(String id, String kind) {
        var goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setDescription("A synthetic test goal.");
        goal.setSemanticKind(kind);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of());
        return goal;
    }

    private static LearningGoal exam(String id) {
        var goal = goal(id, "practiceAssessment");
        var exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setTaskContent("Bestimme die Differenz aus 12 cm und 5 cm und begründe das Ergebnis.");
        exam.setSolutionContent("Die Differenz beträgt 7 cm, weil 12 cm minus 5 cm gleich 7 cm ist.");
        var scoring = new ExamData.Scoring();
        scoring.setMaxPoints(2);
        scoring.setPassingPoints(2);
        var step = new ExamData.Step();
        step.setId(id + "-criterion");
        step.setDescription("Bestimmt und begründet die Differenz mit passender Einheit.");
        step.setPoints(2);
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        goal.setExamData(exam);
        return goal;
    }
}
