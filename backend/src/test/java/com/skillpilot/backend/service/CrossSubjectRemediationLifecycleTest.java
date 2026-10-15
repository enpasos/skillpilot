package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Real service/database regression; fixture mastery does not certify learner work. */
@SpringBootTest
@ActiveProfiles("test")
class CrossSubjectRemediationLifecycleTest {

    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS_GOAL = "ce431132-dfc4-42c2-aff6-bd72035190f8";
    private static final String MATH_SUPPORT = "a8c42ee9-2898-4247-819f-c235032ac78a";

    @Autowired private LearnerService service;
    @Autowired private LearnerRepository learners;
    @Autowired private MasteryRepository masteries;
    @Autowired private PlannedGoalRepository focus;
    @Autowired private CompositionViewService compositionViews;
    private String learnerId;
    private String physicsProfile;
    private String mathProfile;
    private final Map<String, Map<String, Object>> matchedCompositionViews = new java.util.LinkedHashMap<>();

    @AfterEach
    void removeOnlyThisTestLearner() {
        if (learnerId == null) return;
        focus.deleteAll(focus.findByLearner_SkillpilotId(learnerId));
        masteries.deleteAll(masteries.findByLearner_SkillpilotId(learnerId));
        learners.deleteById(learnerId);
    }

    @ParameterizedTest
    @CsvSource({"GK, GK", "LK, GK", "LK, GK+LK"})
    void explicitSubjectChoicesEnableMathLearningAndPreserveMasteryOnPhysicsReturn(
            String profile, String selectedMathProfile) throws Exception {
        physicsProfile = profile;
        mathProfile = selectedMathProfile;
        Learner created = service.createLearner();
        learnerId = created.getSkillpilotId();
        service.setPreferences(learnerId, "SEQUENTIAL", false, true, null, null);
        service.setCurriculum(learnerId, ROOT);
        choose(option -> "DE-HE".equals(option.filterId()));
        choose(option -> "durationModel".equals(option.scopeKey()) && "G9".equals(option.scopeValue()));
        choose(option -> "stage".equals(option.scopeKey()) && "CrossStage".equals(option.scopeValue()));
        chooseSubject(PHYSICS);
        finishSubjectsAndChooseCurrentProfiles();
        assertThat(service.getPersonalCurriculumSubjectIds(learnerId)).containsExactly(PHYSICS);
        assertMatchedViews(false);

        // Existing independent competency estimates isolate this prerequisite.
        Learner physicsLearner = persisted();
        List<String> priorCompetencies = List.of(
                "5c44b9ba-9b05-4774-95d5-073230d3fc4f",
                "ae67bcf1-f3ee-50d6-9a12-25a159dff659",
                "09f47964-2cd0-410e-93ee-9632b582fc91",
                "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2",
                "65365dce-f33f-49d8-9516-42f75883aa86",
                "2bb4bb91-7929-483a-b735-44275f6b5cdc");
        masteries.saveAll(priorCompetencies.stream()
                .map(id -> new Mastery(physicsLearner, id, 1.0)).toList());
        service.setPlannedGoals(learnerId, Set.of(PHYSICS_GOAL));
        String originalCurriculum = persisted().getPersonalCurriculum();
        Map<String, Double> originalMastery = service.getMastery(learnerId);
        Map<String, Double> originalStoredMastery = storedMastery();
        long originalRevision = persisted().getCoachStateRevision();

        var blocked = service.getLearnerState(learnerId);
        assertThat(blocked.stateMachine().prerequisiteBlockers()).anySatisfy(blocker -> {
            assertThat(blocker.goalId()).isEqualTo(PHYSICS_GOAL);
            assertThat(blocker.prerequisiteId()).isEqualTo(MATH_SUPPORT);
            assertThat(blocker.reason()).isEqualTo("EXTERNAL_PREREQUISITE_UNMASTERED");
            assertThat(blocker.remediation()).isEqualTo("OPEN_PERSONAL_CURRICULUM");
        });
        assertThat(service.getFrontier(learnerId)).doesNotContain(PHYSICS_GOAL, MATH_SUPPORT);
        assertThat(service.getPersonalizationPlan(learnerId).stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(persisted().getPersonalCurriculum()).isEqualTo(originalCurriculum);
        assertThat(persisted().getCoachStateRevision()).isEqualTo(originalRevision);
        assertThat(service.getMastery(learnerId)).containsAllEntriesOf(originalMastery).doesNotContainKey(MATH_SUPPORT);
        assertThat(storedMastery()).isEqualTo(originalStoredMastery);
        assertThat(service.getPlannedGoals(learnerId)).containsExactly(PHYSICS_GOAL);
        assertSupportFocusRejected();
        assertThat(service.getPlannedGoals(learnerId)).containsExactly(PHYSICS_GOAL);
        assertThat(storedMastery()).isEqualTo(originalStoredMastery);

        // Every mutation below represents an explicit current Cockpit choice.
        reopenSubjectChoice();
        chooseSubject(PHYSICS);
        chooseSubject(MATH);
        finishSubjectsAndChooseCurrentProfiles();
        assertThat(service.getPersonalCurriculumSubjectIds(learnerId)).containsExactlyInAnyOrder(PHYSICS, MATH);
        assertThat(service.getMastery(learnerId)).containsAllEntriesOf(originalMastery).doesNotContainKey(MATH_SUPPORT);
        assertThat(storedMastery()).isEqualTo(originalStoredMastery);
        assertMatchedViews(true);
        assertJoinedClosureKeepsMathPlacement();
        var personalCurriculum = new ObjectMapper().readTree(persisted().getPersonalCurriculum());
        assertThat(personalCurriculum.path(MATH).path("filterId").asText()).isEqualTo(mathProfile);
        assertThat(personalCurriculum.path(PHYSICS).path("filterId").asText()).isEqualTo(physicsProfile);
        assertThat(personalCurriculum.path(ROOT).path("stage").asText()).isEqualTo("CrossStage");
        if ("GK+LK".equals(mathProfile)) assertCombinedMathRuntimeTargetUnion();
        service.setPlannedGoals(learnerId, Set.of(MATH_SUPPORT));
        assertThat(service.getFrontier(learnerId)).contains(MATH_SUPPORT).doesNotContain(PHYSICS_GOAL);
        service.setActiveGoal(learnerId, MATH_SUPPORT);
        service.setMastery(learnerId, new MasteryUpdateRequest(Map.of(MATH_SUPPORT, 1.0), MATH_SUPPORT));
        assertThat(masteries.findByLearner_SkillpilotId(learnerId))
                .anySatisfy(entry -> {
                    assertThat(entry.getId().getGoalKey()).isEqualTo(MATH_SUPPORT);
                    assertThat(entry.getValue()).isEqualTo(1.0);
                });

        Map<String, Double> completedMathMastery = service.getMastery(learnerId);
        Map<String, Double> completedStoredMathMastery = storedMastery();
        assertThat(completedMathMastery).containsAllEntriesOf(originalMastery).containsEntry(MATH_SUPPORT, 1.0);
        assertThat(completedMathMastery).doesNotContainKey(PHYSICS_GOAL);
        reopenSubjectChoice();
        chooseSubject(PHYSICS);
        finishSubjectsAndChooseCurrentProfiles();
        assertThat(service.getPersonalCurriculumSubjectIds(learnerId)).containsExactly(PHYSICS);
        assertThat(storedMastery()).isEqualTo(completedStoredMathMastery);
        assertThat(service.getMastery(learnerId)).containsAllEntriesOf(originalMastery).containsEntry(MATH_SUPPORT, 1.0);
        service.setPlannedGoals(learnerId, Set.of(PHYSICS_GOAL));
        assertThat(service.getFrontier(learnerId)).contains(PHYSICS_GOAL).doesNotContain(MATH_SUPPORT);
        assertThat(service.getLearnerState(learnerId).stateMachine().prerequisiteBlockers()).isEmpty();
        assertThat(service.getMastery(learnerId)).containsEntry(MATH_SUPPORT, 1.0).doesNotContainKey(PHYSICS_GOAL);
        assertSupportFocusRejected();
        assertThat(service.getPlannedGoals(learnerId)).containsExactly(PHYSICS_GOAL);
        assertThat(storedMastery()).isEqualTo(completedStoredMathMastery);
    }

    @ParameterizedTest
    @CsvSource({"G8, GK", "G8, LK", "G8, GK+LK", "G9, GK", "G9, LK", "G9, GK+LK"})
    void explicitMathOnlyStageDetourRetainsSavedMathOnPhysicsReturn(
            String duration, String profile) throws Exception {
        String kineticEnergy = "7eeff2de-6015-49a6-a96e-a488d886dc9f";
        String substitution = "a6469c01-6ca3-5eb2-a82c-94f3d0560b32";
        physicsProfile = profile;
        mathProfile = "GK";
        learnerId = service.createLearner().getSkillpilotId();
        service.setPreferences(learnerId, "SEQUENTIAL", false, true, null, null);
        service.setCurriculum(learnerId, ROOT);
        choose(option -> "DE-RP".equals(option.filterId()));
        choose(option -> "durationModel".equals(option.scopeKey()) && duration.equals(option.scopeValue()));
        choose(option -> "stage".equals(option.scopeKey()) && "SekII".equals(option.scopeValue()));
        chooseSubject(PHYSICS);
        finishSubjectsAndChooseCurrentProfiles();

        // Independent imported estimates isolate the still-open substitution skill.
        // This fixture does not claim that these foundations were learned here.
        List<String> priorCompetencies = List.of(
                "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd", "5c44b9ba-9b05-4774-95d5-073230d3fc4f",
                "0a6dab2e-1bbb-5587-adb0-456d3991c327", "65365dce-f33f-49d8-9516-42f75883aa86",
                "ee48e811-4c9c-5080-9836-8403fc9f0810", "5d1decb2-b01b-5c85-88fc-9fc255ff9776",
                "3fde4db5-9e92-5f3a-98e1-d386a42b9e01", "d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe",
                "9ef6c4fa-b97a-5d7a-86c1-96690f02d916", "cf474eab-1379-4877-907e-58b0892ce734",
                "4b67bed9-06da-40b2-a306-24e9e7dfd390", "d825f7ce-e19b-594a-8181-eff199c21d93",
                "cafd6520-c4af-4109-9863-cc49ba6fad4d", "a4c2b831-02f0-5d55-a300-7823a71352c4",
                "6ff61721-b2cc-5b1b-ade5-b3c1fd7f7077", "4eeab7d5-eeb3-579b-845e-1c52ffe9e89f",
                "c9112f89-ffaf-40f3-af1f-86a04b5ad4ee", "b41cb496-dad5-596e-9c23-cdcbdab3ec2e",
                "6b0075bb-f71c-59f6-ab98-fb894568cc26", "624764d6-becd-5f9b-ada3-0d4f9d143073",
                "05012547-7263-5bfa-9e7c-df970745a011", "26f668a0-6425-5466-9cf7-6295dd189005",
                "e331a425-e9c6-46eb-89cb-dedf72857974", "d658e26a-e351-4bca-824e-f346deaa87c5",
                "44cb7404-114e-5b14-b33a-ddee41952d46", "199fe2ed-2576-4611-b8de-fd56fb9f78fc",
                "2f565855-bcd6-4da5-bc80-4b72a2d93d50", "f6a54a49-b6cf-4ab7-a185-aa08bfcb6c97",
                "ec9f2ed4-c9e6-5fb3-a073-75b53127e55d", "f6b13b8e-1ecd-5420-905d-21290aa996a6",
                "02013455-72a0-5213-9509-ed77f7ede62b", "339a7bf5-f1df-5d5a-9ec4-41f471f0c111",
                "ca8b2e67-7d14-5baf-8404-26820fe3d548", "fe07241a-b779-5f35-a82d-7aa51ae74f42");
        Learner learner = persisted();
        masteries.saveAll(priorCompetencies.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        service.setPlannedGoals(learnerId, Set.of(kineticEnergy));
        Set<String> originalTargets = currentTargets();
        String originalCurriculum = persisted().getPersonalCurriculum();
        Map<String, Double> originalStored = storedMastery();
        assertThat(originalTargets).contains(kineticEnergy).doesNotContain(substitution);
        assertThat(service.getLearnerState(learnerId).stateMachine().prerequisiteBlockers())
                .anySatisfy(blocker -> {
                    assertThat(blocker.goalId()).isEqualTo(kineticEnergy);
                    assertThat(blocker.prerequisiteId()).isEqualTo(substitution);
                    assertThat(blocker.reason()).isEqualTo("EXTERNAL_PREREQUISITE_UNMASTERED");
                });
        assertThat(service.getFrontier(learnerId)).doesNotContain(kineticEnergy, substitution);
        assertThat(service.getPersonalizationPlan(learnerId).stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(persisted().getPersonalCurriculum()).isEqualTo(originalCurriculum);
        assertThat(storedMastery()).isEqualTo(originalStored).doesNotContainKey(substitution);

        // Explicitly select Math alone for this temporary detour. CrossStage Physics currently
        // omits some SekII targets; that authored-view defect is not a required test behavior.
        reopenStageChoice();
        choose(option -> "stage".equals(option.scopeKey()) && "CrossStage".equals(option.scopeValue()));
        chooseSubject(MATH);
        finishSubjectsAndChooseCurrentProfiles();
        assertThat(service.getPersonalCurriculumSubjectIds(learnerId)).containsExactly(MATH);
        assertThat(currentTargets()).contains(substitution).doesNotContain(kineticEnergy);
        assertThat(service.getPlannedGoals(learnerId)).doesNotContain(kineticEnergy);
        assertThat(storedMastery()).isEqualTo(originalStored).doesNotContainKey(substitution);
        service.setPlannedGoals(learnerId, Set.of(substitution));
        assertThat(service.getFrontier(learnerId)).contains(substitution).doesNotContain(kineticEnergy);
        service.setActiveGoal(learnerId, substitution);
        service.setMastery(learnerId, new MasteryUpdateRequest(Map.of(substitution, 1.0), substitution));
        Map<String, Double> completedStored = storedMastery();
        assertThat(completedStored).containsAllEntriesOf(originalStored).containsEntry(substitution, 1.0)
                .doesNotContainKey(kineticEnergy);

        reopenStageChoice();
        choose(option -> "stage".equals(option.scopeKey()) && "SekII".equals(option.scopeValue()));
        chooseSubject(PHYSICS);
        finishSubjectsAndChooseCurrentProfiles();
        assertThat(service.getPersonalCurriculumSubjectIds(learnerId)).containsExactly(PHYSICS);
        assertThat(currentTargets()).containsExactlyInAnyOrderElementsOf(originalTargets);
        var returnedConfig = new ObjectMapper().readTree(persisted().getPersonalCurriculum());
        assertThat(returnedConfig.path(ROOT).path("stage").asText()).isEqualTo("SekII");
        assertThat(returnedConfig.path(ROOT).path("durationModel").asText()).isEqualTo(duration);
        assertThat(returnedConfig.path(PHYSICS).path("filterId").asText()).isEqualTo(profile);
        assertThat(storedMastery()).isEqualTo(completedStored);
        assertThat(service.getMastery(learnerId)).containsEntry(substitution, 1.0).doesNotContainKey(kineticEnergy);
        service.setPlannedGoals(learnerId, Set.of(kineticEnergy));
        assertThat(service.getFrontier(learnerId)).contains(kineticEnergy).doesNotContain(substitution);
        assertThat(service.getLearnerState(learnerId).stateMachine().prerequisiteBlockers()).isEmpty();
        assertThatThrownBy(() -> service.setPlannedGoals(learnerId, Set.of(substitution)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThat(service.getPlannedGoals(learnerId)).containsExactly(kineticEnergy);
        assertThat(storedMastery()).isEqualTo(completedStored);
    }

    private Set<String> currentTargets() {
        return service.getFilteredAtomicGoalIds(ROOT, persisted().getPersonalCurriculum(), null, false);
    }

    private void reopenStageChoice() {
        String rewindId = service.getPersonalizationPlan(learnerId).completedDecisions().stream()
                .filter(decision -> "stage".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst().orElseThrow(() -> new AssertionError("Missing current stage rewind"));
        service.rewindPersonalization(learnerId, rewindId);
    }

    private void assertSupportFocusRejected() {
        assertThatThrownBy(() -> service.setPlannedGoals(learnerId, Set.of(MATH_SUPPORT)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason()).contains("learner-facing targets").contains(MATH_SUPPORT);
                });
    }

    private void assertMatchedViews(boolean mathSelected) {
        Map<String, String> scope = Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                "durationModel", "G9", "stage", "CrossStage", "courseProfile", physicsProfile);
        var physicsView = compositionViews.findLearnerScopeView(PHYSICS, scope);
        assertThat(physicsView)
                .containsEntry("viewId", "de-he-gym-physics-" + physicsProfile.toLowerCase());
        matchedCompositionViews.put(PHYSICS, physicsView);
        if (mathSelected) {
            var mathScope = new java.util.LinkedHashMap<>(scope);
            mathScope.put("courseProfile", mathProfile);
            var mathView = compositionViews.findLearnerScopeView(MATH, mathScope);
            assertThat(mathView)
                    .containsEntry("viewId", "GK+LK".equals(mathProfile)
                            ? "merged:de-he-gym-math-lk-g9+de-he-gym-math-gk-g9"
                            : "de-he-gym-math-gk-g9");
            matchedCompositionViews.put(MATH, mathView);
        }
    }

    private void assertJoinedClosureKeepsMathPlacement() throws Exception {
        var closure = service.getLearnerLandscapeClosure(learnerId, ROOT, "de");
        assertThat(closure.stream().filter(landscape -> landscape.getGoals().stream()
                        .anyMatch(goal -> MATH_SUPPORT.equals(goal.getId())))
                .map(com.skillpilot.backend.landscape.SkillLandscape::getLandscapeId).toList())
                .containsExactly(MATH);
        var math = closure.stream().filter(landscape -> MATH.equals(landscape.getLandscapeId()))
                .findFirst().orElseThrow();
        assertThat(math.getGoals().stream().filter(goal -> goal.getContains() != null
                        && goal.getContains().contains(MATH_SUPPORT))
                .map(com.skillpilot.backend.landscape.LearningGoal::getId).toList())
                .containsExactly("c9d92f32-167a-4006-a940-b8063a6ed434");
        assertThat(closure.stream().filter(landscape -> PHYSICS.equals(landscape.getLandscapeId()))
                .flatMap(landscape -> landscape.getGoals().stream()))
                .noneMatch(goal -> MATH_SUPPORT.equals(goal.getId())
                        || (goal.getContains() != null && goal.getContains().contains(MATH_SUPPORT)));
        String evidenceDirectory = System.getenv("SKILLPILOT_CROSS_SUBJECT_EVIDENCE_DIRECTORY");
        if (evidenceDirectory != null && !evidenceDirectory.isBlank()) {
            var mapper = new ObjectMapper();
            java.nio.file.Files.writeString(java.nio.file.Path.of(evidenceDirectory,
                            "joined-physics-" + physicsProfile + "-math-" + mathProfile + ".actual.json"),
                    mapper.writeValueAsString(Map.of("closure", closure, "matchedCompositionViews", matchedCompositionViews,
                            "personalCurriculum", mapper.readTree(persisted().getPersonalCurriculum()))) + "\n",
                    java.nio.file.StandardOpenOption.CREATE_NEW);
        }
    }

    @SuppressWarnings("unchecked")
    private void assertCombinedMathRuntimeTargetUnion() throws Exception {
        var mapper = new ObjectMapper();
        Map<String, Map<String, Object>> config = mapper.readValue(persisted().getPersonalCurriculum(), Map.class);
        // Resolve each actually authored source profile through the same runtime,
        // with Physics deselected so its support references cannot affect the comparison.
        config.get(PHYSICS).put("selected", false);
        config.get(MATH).put("filterId", "GK");
        var gk = service.getFilteredAtomicGoalIds(ROOT, mapper.writeValueAsString(config), null, false);
        var expected = new java.util.LinkedHashSet<>(gk);
        config.get(MATH).put("filterId", "LK");
        var lk = service.getFilteredAtomicGoalIds(ROOT, mapper.writeValueAsString(config), null, false);
        expected.addAll(lk);
        config.get(MATH).put("filterId", "GK+LK");
        var combined = service.getFilteredAtomicGoalIds(ROOT, mapper.writeValueAsString(config), null, false);
        assertThat(combined)
                .containsExactlyInAnyOrderElementsOf(expected);
        String evidenceDirectory = System.getenv("SKILLPILOT_CROSS_SUBJECT_EVIDENCE_DIRECTORY");
        if (evidenceDirectory != null && !evidenceDirectory.isBlank()) {
            java.nio.file.Files.writeString(java.nio.file.Path.of(evidenceDirectory, "math-runtime-target-union.actual.json"),
                    mapper.writeValueAsString(Map.of("gk", gk, "lk", lk, "combined", combined)) + "\n",
                    java.nio.file.StandardOpenOption.CREATE_NEW);
        }
    }

    private Map<String, Double> storedMastery() {
        return masteries.findByLearner_SkillpilotId(learnerId).stream()
                .collect(java.util.stream.Collectors.toMap(entry -> entry.getId().getGoalKey(), Mastery::getValue));
    }

    private Learner persisted() {
        return learners.findById(learnerId).orElseThrow();
    }

    private void reopenSubjectChoice() {
        PersonalizationPlan plan = service.getPersonalizationPlan(learnerId);
        String rewindId = plan.completedDecisions().stream()
                .filter(decision -> "subject".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst().orElseThrow(() -> new AssertionError("Missing current subject rewind: " + plan));
        service.rewindPersonalization(learnerId, rewindId);
    }

    private void chooseSubject(String subject) {
        choose(option -> option.kind() == PersonalizationPlan.OptionKind.VALUE
                && subject.equals(option.landscapeId()) && option.filterId() == null);
    }

    private void finishSubjectsAndChooseCurrentProfiles() {
        choose(option -> option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP);
        for (int step = 0; step < 4; step++) {
            PersonalizationPlan plan = service.getPersonalizationPlan(learnerId);
            if (plan.stage() == PersonalizationPlan.Stage.COMPLETE) return;
            choose(option -> option.kind() == PersonalizationPlan.OptionKind.VALUE
                    && (PHYSICS.equals(option.landscapeId()) || MATH.equals(option.landscapeId()))
                    && (PHYSICS.equals(option.landscapeId()) ? physicsProfile : mathProfile).equals(option.filterId()));
        }
        throw new AssertionError("Current authored profiles did not complete: " + service.getPersonalizationPlan(learnerId));
    }

    private void choose(Predicate<PersonalizationPlan.Option> predicate) {
        PersonalizationPlan plan = service.getPersonalizationPlan(learnerId);
        String optionId = plan.options().stream().filter(predicate).map(PersonalizationPlan.Option::optionId)
                .findFirst().orElseThrow(() -> new AssertionError("Expected current authored option in " + plan));
        service.patchPersonalCurriculum(learnerId, Map.of(), List.of(), List.of(), optionId);
    }
}
