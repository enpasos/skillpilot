package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LearnerPersonalizationProgressionIntegrationTest {

    private static final String ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String MATH_SEK_TWO_ORIENTATION_ID = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String MATH_SEK_TWO_LK_SCOPE_ID =
            "composition:de-he-gym-sekii-math-lk:structure:sek2-lk";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private CompositionViewService compositionViewService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void orientationClassificationPrefersSemanticKindAndUsesOnlyExplicitLegacyTagsAsFallback() {
        LearningGoal semanticOrientation = new LearningGoal();
        semanticOrientation.setSemanticKind("orientation");
        semanticOrientation.setTags(List.of("curricular"));

        LearningGoal legacyOrientation = new LearningGoal();
        legacyOrientation.setTags(List.of("Motivation"));

        LearningGoal authoritativeNonOrientation = new LearningGoal();
        authoritativeNonOrientation.setSemanticKind("curricularAtomic");
        authoritativeNonOrientation.setTags(List.of("Orientation", "Motivation"));

        LearningGoal titleOnly = new LearningGoal();
        titleOnly.setTitle("Warum Mathematik?");
        titleOnly.setTags(List.of("curricular"));

        assertThat(LearnerService.isOrientationGoal(semanticOrientation)).isTrue();
        assertThat(LearnerService.isOrientationGoal(legacyOrientation)).isTrue();
        assertThat(LearnerService.isOrientationGoal(authoritativeNonOrientation)).isFalse();
        assertThat(LearnerService.isOrientationGoal(titleOnly)).isFalse();
    }

    @Test
    void hessenMathLkSekTwoG9FlowResolvesReviewedViewInAuthoredLevelTwoOrder() throws Exception {
        Learner learner = createLearner("personalization-progression", null);

        var afterJurisdiction = applyCurrentValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "DE-HE");

        JsonNode afterJurisdictionConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterJurisdictionConfig.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(afterJurisdictionConfig.size()).isOne();
        assertThat(afterJurisdiction.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");
        assertThat(afterJurisdiction.frontier()).isEmpty();
        assertCurrentDurationModelOptions(learner.getSkillpilotId());

        var afterDurationModel = applyCurrentScopeValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "durationModel",
                "G9");

        JsonNode afterDurationConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterDurationConfig.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(afterDurationConfig.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(afterDurationModel.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");
        assertThat(afterDurationModel.frontier()).isEmpty();
        assertCurrentStageOptions(learner.getSkillpilotId());

        var afterStage = applyCurrentScopeValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "stage",
                "SekII");

        JsonNode afterStageConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterStageConfig.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertStage(afterStageConfig, "SekII");
        assertThat(afterStage.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");
        assertThat(afterStage.frontier()).isEmpty();

        PersonalizationPlan subjectPlan =
                learnerService.getPersonalizationPlan(learner.getSkillpilotId());
        assertThat(subjectPlan.groupId()).isEqualTo("subject");
        assertThat(subjectPlan.options())
                .extracting(PersonalizationPlan.Option::landscapeLabel)
                .containsExactly(
                        "Mathematik",
                        "Physik",
                        "Chemie",
                        "Geschichte",
                        "Deutsch");
        assertThat(subjectPlan.displayOptions())
                .extracting(PersonalizationPlan.Option::landscapeLabel)
                .containsExactly(
                        "Mathematik",
                        "Physik",
                        "Chemie",
                        "Biologie",
                        "Informatik",
                        "Geschichte",
                        "Deutsch",
                        "Politik und Wirtschaft",
                        "Englisch",
                        "Französisch",
                        "Latein",
                        "Spanisch",
                        "Italienisch",
                        "Russisch",
                        "Polnisch",
                        "Tschechisch",
                        "Griechisch",
                        "Chinesisch",
                        "Musik",
                        "Wirtschaftswissenschaften");

        PersonalizationPlan.Option unavailableBiology = subjectPlan.displayOptions().stream()
                .filter(option -> BIOLOGY_ID.equals(option.landscapeId()))
                .findFirst()
                .orElseThrow();
        JsonNode beforeUnavailableSelection = persistedConfig(learner.getSkillpilotId());
        assertConflict(() -> learnerService.patchPersonalCurriculum(
                learner.getSkillpilotId(),
                Map.of(),
                List.of(),
                List.of(),
                unavailableBiology.optionId()));
        assertThat(persistedConfig(learner.getSkillpilotId()))
                .isEqualTo(beforeUnavailableSelection);

        var afterSubjectSelection = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                null);

        JsonNode afterSubjectConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterSubjectConfig.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(afterSubjectConfig.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertStage(afterSubjectConfig, "SekII");
        assertThat(afterSubjectConfig.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(afterSubjectConfig.path(MATH_ID).has("filterId")).isFalse();
        assertThat(afterSubjectSelection.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");

        var afterSubjectCompletion = completeCurrentGroup(learner.getSkillpilotId());
        assertThat(afterSubjectCompletion.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");

        var afterCourseProfile = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                "LK");

        JsonNode afterCourseConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterCourseConfig.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(afterCourseConfig.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertStage(afterCourseConfig, "SekII");
        assertThat(afterCourseConfig.path(MATH_ID).path("filterId").asText())
                .isEqualTo("LK");
        assertThat(afterCourseConfig.has(BIOLOGY_ID)).isFalse();
        assertThat(afterCourseProfile.activeFilters()).contains("DE-HE", "LK", "G9");
        assertThat(afterCourseProfile.stateMachine().requiredAction())
                .isNotEqualTo("setPersonalization");
        assertThat(afterCourseProfile.frontier())
                .extracting(goal -> goal.id())
                .containsExactly(MATH_SEK_TWO_LK_SCOPE_ID);

        learnerService.setPlannedGoals(
                learner.getSkillpilotId(),
                Set.of(MATH_SEK_TWO_LK_SCOPE_ID));
        assertThat(learnerService.getFrontier(learner.getSkillpilotId()))
                .containsExactly(MATH_SEK_TWO_ORIENTATION_ID);
        var orientationOnlyFrontier = learnerService.getRichFrontier(learner.getSkillpilotId());
        assertThat(orientationOnlyFrontier)
                .extracting(goal -> goal.id())
                .containsExactly(MATH_SEK_TWO_ORIENTATION_ID);
        assertThat(orientationOnlyFrontier)
                .extracting(goal -> goal.reason())
                .containsExactly("Orientation required");
        assertThat(orientationOnlyFrontier)
                .extracting(goal -> goal.semanticKind())
                .containsExactly("orientation");

        learnerService.setActiveGoal(
                learner.getSkillpilotId(),
                MATH_SEK_TWO_ORIENTATION_ID);
        UnifiedLearnerStateResponse orientationState =
                learnerService.getCoachLearnerState(learner.getSkillpilotId());
        assertThat(orientationState.activeGoal().id()).isEqualTo(MATH_SEK_TWO_ORIENTATION_ID);
        assertThat(orientationState.activeGoal().semanticKind()).isEqualTo("orientation");
        assertThat(orientationState.stateMachine().requiredAction()).isEqualTo("orientActiveGoal");

        OrientationOutlook orientationOutlook = learnerService.getCoachOrientationOutlook(
                learner.getSkillpilotId(),
                "de-DE");
        assertThat(orientationOutlook).isNotNull();
        assertThat(orientationOutlook.orientationGoalId()).isEqualTo(MATH_SEK_TWO_ORIENTATION_ID);
        assertThat(orientationOutlook.paths())
                .extracting(OrientationOutlook.Path::pathId)
                .containsExactly(
                        "change-and-models",
                        "space-and-linear-algebra",
                        "data-and-decisions");
        assertThat(orientationOutlook.paths())
                .allSatisfy(path -> {
                    assertThat(path.learningOutlook()).isNotBlank();
                    assertThat(path.practicalContexts()).hasSizeBetween(1, 3);
                    assertThat(path.representativeGoals()).hasSizeBetween(1, 4);
                    assertThat(path.relatedGoalIds()).isNotEmpty();
                });
        Map<String, List<String>> relatedGoalIdsByPath = orientationOutlook.paths().stream()
                .collect(java.util.stream.Collectors.toMap(
                        OrientationOutlook.Path::pathId,
                        OrientationOutlook.Path::relatedGoalIds));
        assertThat(relatedGoalIdsByPath).containsExactlyInAnyOrderEntriesOf(Map.of(
                "change-and-models",
                List.of(
                        "8dd9f210-2683-5902-acab-e3be22725232",
                        "cdf49335-cebf-54b4-9f52-50d5badabe2f",
                        "50b9426f-ebec-526d-8b9d-e61d9707a46e"),
                "space-and-linear-algebra",
                List.of("be0e8715-3c3a-5ffb-937a-0b6bce4f01d8"),
                "data-and-decisions",
                List.of("508292f2-671b-4fd3-acbf-53d705e44693")));
        assertThat(orientationOutlook.paths())
                .flatExtracting(OrientationOutlook.Path::representativeGoals)
                .extracting(OrientationOutlook.GoalReference::title)
                .contains(
                        "Integral als Bestand und Flächeninhalt verstehen",
                        "Skalarprodukt als Orthogonalitätskriterium nutzen",
                        "Argumentationsmuster von Hypothesentests erläutern")
                .noneMatch(title -> title.contains("Source-Extraction"));
        OrientationOutlook englishOrientationOutlook = learnerService.getCoachOrientationOutlook(
                learner.getSkillpilotId(),
                "en-GB");
        assertThat(englishOrientationOutlook.paths())
                .extracting(OrientationOutlook.Path::title)
                .containsExactly(
                        "Change, growth and models",
                        "Space, vectors and linear transformations",
                        "Data, chance and evidence-based decisions");

        assertThatThrownBy(() -> learnerService.setMastery(
                        learner.getSkillpilotId(),
                        new MasteryUpdateRequest(
                                Map.of(MATH_SEK_TWO_ORIENTATION_ID, 0.5),
                                MATH_SEK_TWO_ORIENTATION_ID)))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        learnerService.setMastery(
                learner.getSkillpilotId(),
                new MasteryUpdateRequest(
                        Map.of(MATH_SEK_TWO_ORIENTATION_ID, 1.0),
                        MATH_SEK_TWO_ORIENTATION_ID));

        assertThat(learnerService.getCoachOrientationOutlook(learner.getSkillpilotId(), "de-DE"))
                .isNull();

        var frontierAfterOrientation = learnerService.getRichFrontier(learner.getSkillpilotId());
        assertThat(frontierAfterOrientation)
                .isNotEmpty()
                .extracting(goal -> goal.id())
                .doesNotContain(MATH_SEK_TWO_ORIENTATION_ID);
        assertThat(frontierAfterOrientation)
                .allSatisfy(goal -> assertThat(goal.tags())
                        .doesNotContain("Orientation", "Motivation"));
        assertThat(frontierAfterOrientation)
                .noneMatch(goal -> "exam".equals(goal.nodeKind()));
        assertThat(learnerService.getFrontier(learner.getSkillpilotId()))
                .isNotEmpty()
                .doesNotContain(MATH_SEK_TWO_ORIENTATION_ID);

        String existingProgressGoalId = frontierAfterOrientation.stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .findFirst()
                .orElseThrow()
                .id();
        masteryRepository.save(new Mastery(
                learnerRepository.findById(learner.getSkillpilotId()).orElseThrow(),
                existingProgressGoalId,
                0.5));
        Mastery orientationMastery = masteryRepository.findById(new MasteryId(
                        learner.getSkillpilotId(),
                        MATH_SEK_TWO_ORIENTATION_ID))
                .orElseThrow();
        orientationMastery.setValue(0.0);
        masteryRepository.saveAndFlush(orientationMastery);

        assertThat(learnerService.getRichFrontier(learner.getSkillpilotId()))
                .isNotEmpty()
                .allSatisfy(goal -> assertThat(goal.reason()).isNotEqualTo("Orientation required"));

        Mastery existingProgressMastery = masteryRepository.findById(new MasteryId(
                        learner.getSkillpilotId(),
                        existingProgressGoalId))
                .orElseThrow();
        existingProgressMastery.setValue(0.0);
        masteryRepository.saveAndFlush(existingProgressMastery);
        Learner learnerWithExistingActiveGoal = learnerRepository.findById(learner.getSkillpilotId()).orElseThrow();
        learnerWithExistingActiveGoal.setActiveGoalId(existingProgressGoalId);
        learnerRepository.saveAndFlush(learnerWithExistingActiveGoal);

        assertThat(learnerService.getRichFrontier(learner.getSkillpilotId()))
                .isNotEmpty()
                .allSatisfy(goal -> assertThat(goal.reason()).isNotEqualTo("Orientation required"));

        Map<String, Object> matchedView = compositionViewService.findMatchingView(
                MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", afterCourseConfig.path(ROOT_ID).path("filterId").asText(),
                        "durationModel", afterCourseConfig.path(ROOT_ID).path("durationModel").asText(),
                        "stage", afterCourseConfig.path(ROOT_ID).path("stage").asText(),
                        "courseProfile", afterCourseConfig.path(MATH_ID).path("filterId").asText()));
        assertThat(matchedView).isNotNull();
        assertThat(matchedView.get("viewId")).isEqualTo("de-he-gym-sekii-math-lk");
    }

    @Test
    void rewindsToSubjectWithoutRepeatingJurisdictionDurationOrStage() throws Exception {
        Learner learner = createLearner("personalization-subject-rewind", null);
        String learnerId = learner.getSkillpilotId();

        applyCurrentValueOption(learnerId, ROOT_ID, "DE-HE");
        applyCurrentScopeValueOption(learnerId, ROOT_ID, "durationModel", "G9");
        applyCurrentScopeValueOption(learnerId, ROOT_ID, "stage", "SekII");
        applyCurrentValueOption(learnerId, MATH_ID, null);
        completeCurrentGroup(learnerId);
        applyCurrentValueOption(learnerId, MATH_ID, "LK");

        PersonalizationPlan complete = learnerService.getPersonalizationPlan(learnerId);
        assertThat(complete.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(complete.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly(
                        "jurisdiction",
                        "durationModel",
                        "stage",
                        "subject",
                        "subjectProfile");
        assertThat(complete.completedDecisions().get(0).selectedOptions())
                .extracting(PersonalizationPlan.Option::filterId)
                .containsExactly("DE-HE");
        assertThat(complete.completedDecisions().get(1).selectedOptions())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("G9");
        assertThat(complete.completedDecisions().get(2).selectedOptions())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("SekII");
        String subjectRewindId = complete.completedDecisions().stream()
                .filter(decision -> "subject".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst()
                .orElseThrow();

        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(learnerId, subjectRewindId);

        assertThat(rewound.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(rewound.groupId()).isEqualTo("subject");
        assertThat(rewound.selectedCount()).isZero();
        assertThat(rewound.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("jurisdiction", "durationModel", "stage");
        assertThat(rewound.options())
                .filteredOn(option -> option.kind() == PersonalizationPlan.OptionKind.VALUE)
                .extracting(PersonalizationPlan.Option::landscapeId)
                .contains(MATH_ID);

        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persisted.path(ROOT_ID).path("durationModel").asText()).isEqualTo("G9");
        assertStage(persisted, "SekII");
        assertThat(persisted.has(MATH_ID)).isFalse();
    }

    @Test
    void rewindingDurationPreservesTheIndependentStageChoice() throws Exception {
        Learner learner = createLearner("personalization-duration-rewind", null);
        String learnerId = learner.getSkillpilotId();

        applyCurrentValueOption(learnerId, ROOT_ID, "DE-HE");
        applyCurrentScopeValueOption(learnerId, ROOT_ID, "durationModel", "G9");
        applyCurrentScopeValueOption(learnerId, ROOT_ID, "stage", "SekII");
        applyCurrentValueOption(learnerId, MATH_ID, null);
        completeCurrentGroup(learnerId);
        applyCurrentValueOption(learnerId, MATH_ID, "LK");

        PersonalizationPlan complete = learnerService.getPersonalizationPlan(learnerId);
        String durationRewindId = complete.completedDecisions().stream()
                .filter(decision -> "durationModel".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst()
                .orElseThrow();

        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(learnerId, durationRewindId);

        assertThat(rewound.groupId()).isEqualTo("durationModel");
        assertThat(rewound.preservedDecisions())
                .extracting(PersonalizationPlan.DecisionSummary::groupId)
                .containsExactly("stage");
        assertThat(rewound.preservedDecisions().getFirst().selectedOptions())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("SekII");
        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persisted.path(ROOT_ID).has("durationModel")).isFalse();
        assertStage(persisted, "SekII");
        assertThat(persisted.has(MATH_ID)).isFalse();

        applyCurrentScopeValueOption(
                learnerId,
                ROOT_ID,
                "durationModel",
                "G9");

        PersonalizationPlan subjectPlan =
                learnerService.getPersonalizationPlan(learnerId);
        assertThat(subjectPlan.groupId()).isEqualTo("subject");
        assertThat(subjectPlan.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("jurisdiction", "durationModel", "stage");
    }

    @Test
    void rewindAfterMigrationRemovesHiddenDependentSelectionsButKeepsStage()
            throws Exception {
        Learner learner = createLearner(
                "personalization-migrated-hidden-rewind",
                Map.of(
                        ROOT_ID,
                        Map.of(
                                "selected", true,
                                "filterId", "DE-HE",
                                "stage", "SekII"),
                        MATH_ID,
                        Map.of("selected", true, "filterId", "LK"),
                        "__skillpilot_stage_scope_sek1__",
                        Map.of("selected", false),
                        "__skillpilot_stage_scope_sek2__",
                        Map.of("selected", true),
                        CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                        Map.of(
                                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                                ROOT_ID,
                                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                                List.of(),
                                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                                true)));
        String learnerId = learner.getSkillpilotId();

        PersonalizationPlan migrated =
                learnerService.getPersonalizationPlan(learnerId);
        assertThat(migrated.canReopenMigratedPersonalization()).isTrue();
        assertThat(migrated.preservedDecisions())
                .extracting(PersonalizationPlan.DecisionSummary::groupId)
                .containsExactly(
                        "jurisdiction",
                        "stage",
                        "subject",
                        "subjectProfile");

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(learnerId);
        assertThat(reopened.groupId()).isEqualTo("durationModel");
        assertThat(reopened.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("jurisdiction");
        String jurisdictionRewindId =
                reopened.completedDecisions().getFirst().rewindId();

        PersonalizationPlan jurisdiction =
                learnerService.rewindPersonalization(
                        learnerId,
                        jurisdictionRewindId);

        assertThat(jurisdiction.groupId()).isEqualTo("jurisdiction");
        assertThat(jurisdiction.preservedDecisions())
                .extracting(PersonalizationPlan.DecisionSummary::groupId)
                .containsExactly("stage");
        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).has("filterId")).isFalse();
        assertThat(persisted.path(ROOT_ID).has("durationModel")).isFalse();
        assertStage(persisted, "SekII");
        assertThat(persisted.path(ROOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.has(MATH_ID)).isFalse();
        assertThat(persisted
                        .path("__skillpilot_stage_scope_sek1__")
                        .path("selected")
                        .asBoolean())
                .isFalse();
        assertThat(persisted
                        .path("__skillpilot_stage_scope_sek2__")
                        .path("selected")
                        .asBoolean())
                .isTrue();
    }

    @Test
    void choosingAMissingMigratedScopeRemovesHiddenDependentSelections()
            throws Exception {
        Learner learner = createLearner(
                "personalization-migrated-scope-revalidation",
                Map.of(
                        ROOT_ID,
                        Map.of(
                                "selected", true,
                                "filterId", "DE-HE",
                                "stage", "SekII"),
                        MATH_ID,
                        Map.of("selected", true, "filterId", "LK"),
                        "__skillpilot_stage_scope_sek1__",
                        Map.of("selected", false),
                        "__skillpilot_stage_scope_sek2__",
                        Map.of("selected", true),
                        CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                        Map.of(
                                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                                ROOT_ID,
                                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                                List.of(),
                                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                                true)));
        String learnerId = learner.getSkillpilotId();

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(learnerId);
        assertThat(reopened.groupId()).isEqualTo("durationModel");

        applyCurrentScopeValueOption(
                learnerId,
                ROOT_ID,
                "durationModel",
                "G9");

        PersonalizationPlan subjectPlan =
                learnerService.getPersonalizationPlan(learnerId);
        assertThat(subjectPlan.groupId()).isEqualTo("subject");
        assertThat(subjectPlan.currentSelectedOptions()).isEmpty();
        JsonNode persisted = persistedConfig(learnerId);
        assertThat(persisted.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(persisted.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertStage(persisted, "SekII");
        assertThat(persisted.has(MATH_ID)).isFalse();
    }

    @Test
    void canonicalDeSelectionUsesRepositoryOfferingsWithoutAJurisdictionScope() throws Exception {
        Learner learner = createLearner("canonical-de-personalization", null);

        applyCurrentValueOption(learner.getSkillpilotId(), ROOT_ID, "ALL");
        assertThat(persistedConfig(learner.getSkillpilotId())
                        .path(ROOT_ID)
                        .path("filterId")
                        .asText())
                .isEqualTo("ALL");
        assertCurrentStageOptions(learner.getSkillpilotId());
        applyCurrentScopeValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "stage",
                "SekII");

        PersonalizationPlan subjectPlan =
                learnerService.getPersonalizationPlan(learner.getSkillpilotId());
        assertThat(subjectPlan.valid()).isTrue();
        assertThat(subjectPlan.groupId()).isEqualTo("subject");
        assertThat(subjectPlan.options())
                .filteredOn(option -> option.kind() == PersonalizationPlan.OptionKind.VALUE)
                .extracting(PersonalizationPlan.Option::landscapeId)
                .contains(MATH_ID);

        assertThat(compositionViewService.findMatchingView(
                        MATH_ID,
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "stage", "SekII",
                                "courseProfile", "LK")))
                .containsEntry("viewId", "de-de-gym-sekii-math-lk");
    }

    @Test
    void recoversAnAlreadyPersistedRootOnlyJurisdictionSelection() throws Exception {
        Learner learner = createLearner(
                "root-only-personalization-recovery",
                Map.of(ROOT_ID, Map.of("selected", true, "filterId", "DE-HE")));

        var recoveredState = learnerService.getLearnerState(learner.getSkillpilotId());

        assertThat(recoveredState.stateMachine().requiredAction()).isEqualTo("setPersonalization");
        assertThat(recoveredState.frontier()).isEmpty();
        assertThat(persistedConfig(learner.getSkillpilotId()).size()).isOne();
        assertCurrentDurationModelOptions(learner.getSkillpilotId());

        var afterDurationModel = applyCurrentScopeValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "durationModel",
                "G8");

        JsonNode afterDurationConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterDurationConfig.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(afterDurationConfig.path(ROOT_ID).path("durationModel").asText()).isEqualTo("G8");
        assertThat(afterDurationModel.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");
        assertCurrentStageOptions(learner.getSkillpilotId());

        var afterStage = applyCurrentScopeValueOption(
                learner.getSkillpilotId(),
                ROOT_ID,
                "stage",
                "SekII");

        JsonNode afterStageConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterStageConfig.path(ROOT_ID).path("durationModel").asText()).isEqualTo("G8");
        assertStage(afterStageConfig, "SekII");
        assertThat(afterStage.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");

        var afterSubjectSelection = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                null);

        JsonNode selectedSubject = persistedConfig(learner.getSkillpilotId());
        assertThat(selectedSubject.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(selectedSubject.path(ROOT_ID).path("durationModel").asText()).isEqualTo("G8");
        assertStage(selectedSubject, "SekII");
        assertThat(selectedSubject.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(selectedSubject.path(MATH_ID).has("filterId")).isFalse();
        assertThat(afterSubjectSelection.stateMachine().requiredAction()).isEqualTo("setPersonalization");

        var afterSubjectCompletion = completeCurrentGroup(learner.getSkillpilotId());
        assertThat(afterSubjectCompletion.stateMachine().requiredAction())
                .isEqualTo("setPersonalization");

        var afterCourseProfile = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                "LK");

        JsonNode persisted = persistedConfig(learner.getSkillpilotId());
        assertThat(persisted.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(persisted.path(ROOT_ID).path("durationModel").asText())
                .isEqualTo("G8");
        assertStage(persisted, "SekII");
        assertThat(persisted.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.path(MATH_ID).path("filterId").asText())
                .isEqualTo("LK");
        assertThat(persisted.has(BIOLOGY_ID)).isFalse();
        assertThat(afterCourseProfile.activeFilters()).contains("DE-HE", "LK", "G8");
        assertThat(afterCourseProfile.stateMachine().requiredAction())
                .isNotEqualTo("setPersonalization");
        assertThat(afterCourseProfile.frontier()).isNotEmpty();
        assertThat(afterCourseProfile.stateMachine().goalOptions()).isNotEmpty();
    }

    @Test
    void rejectsAReplayedRootOptionAndPreservesTheCurrentStageConfiguration() throws Exception {
        Learner learner = createLearner(
                "replayed-root-personalization",
                Map.of(ROOT_ID, Map.of("selected", true, "filterId", "DE-HE")));
        JsonNode beforeReplay = persistedConfig(learner.getSkillpilotId());

        assertConflict(() -> learnerService.patchPersonalCurriculum(
                learner.getSkillpilotId(),
                Map.of(),
                List.of(ROOT_ID),
                List.of("DE-HE")));

        assertThat(persistedConfig(learner.getSkillpilotId())).isEqualTo(beforeReplay);
    }

    @Test
    void rejectsMutationAfterCompletePersonalizationAndPreservesIndependentSubjectProfiles()
            throws Exception {
        Learner learner = createLearner(
                "explicit-multi-subject-personalization",
                Map.of(
                        ROOT_ID, Map.of(
                                "selected", true,
                                "filterId", "DE-HE",
                                "stage", "CrossStage",
                                "durationModel", "G9"),
                        MATH_ID, Map.of("selected", true, "filterId", "LK"),
                        BIOLOGY_ID, Map.of("selected", true, "filterId", "GK")));
        JsonNode beforeMutation = persistedConfig(learner.getSkillpilotId());

        assertConflict(() -> learnerService.patchPersonalCurriculum(
                learner.getSkillpilotId(),
                Map.of(),
                List.of(MATH_ID),
                List.of("GK")));

        JsonNode persisted = persistedConfig(learner.getSkillpilotId());
        assertThat(persisted).isEqualTo(beforeMutation);
        assertStage(persisted, "CrossStage");
        assertThat(persisted.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.path(MATH_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persisted.path(BIOLOGY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.path(BIOLOGY_ID).path("filterId").asText()).isEqualTo("GK");
    }

    @Test
    void selectedFalseEntriesDoNotCompletePersonalizationOrBecomeActiveFilters() throws Exception {
        Learner learner = createLearner(
                "explicitly-unselected-descendant",
                Map.of(
                        ROOT_ID, Map.of("selected", true, "filterId", "DE-HE"),
                        MATH_ID, Map.of("selected", false, "filterId", "LK")));

        var state = learnerService.getLearnerState(learner.getSkillpilotId());

        assertThat(state.stateMachine().requiredAction()).isEqualTo("setPersonalization");
        assertThat(state.activeFilters()).contains("DE-HE").doesNotContain("LK");
        assertThat(state.frontier()).isEmpty();
    }

    @Test
    void staleActiveGoalCannotBypassIncompletePersonalization() throws Exception {
        Learner learner = createLearner(
                "stale-active-goal-during-personalization",
                Map.of(ROOT_ID, Map.of("selected", true, "filterId", "DE-HE")));
        learner.setActiveGoalId("goal-that-is-not-part-of-the-current-sparse-selection");
        learnerRepository.saveAndFlush(learner);

        var state = learnerService.getLearnerState(learner.getSkillpilotId());

        assertThat(state.stateMachine().requiredAction()).isEqualTo("setPersonalization");
        assertThat(state.stateMachine().state()).isEqualTo("PERSONALIZATION");
    }

    private Learner createLearner(String learnerId, Map<String, ?> personalCurriculum) throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(ROOT_ID);
        if (personalCurriculum != null) {
            learner.setPersonalCurriculum(objectMapper.writeValueAsString(personalCurriculum));
        }
        return learnerRepository.saveAndFlush(learner);
    }

    private JsonNode persistedConfig(String learnerId) throws Exception {
        Learner persisted = learnerRepository.findById(learnerId).orElseThrow();
        return objectMapper.readTree(persisted.getPersonalCurriculum());
    }

    private UnifiedLearnerStateResponse applyCurrentValueOption(
            String learnerId,
            String landscapeId,
            String filterId) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        PersonalizationPlan.Option option = plan.options().stream()
                .filter(candidate -> candidate.kind() == PersonalizationPlan.OptionKind.VALUE)
                .filter(candidate -> landscapeId.equals(candidate.landscapeId()))
                .filter(candidate -> filterId == null
                        ? candidate.filterId() == null
                        : filterId.equals(candidate.filterId()))
                .findFirst()
                .orElseThrow();
        return learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of(),
                option.optionId());
    }

    private UnifiedLearnerStateResponse applyCurrentScopeValueOption(
            String learnerId,
            String landscapeId,
            String scopeKey,
            String scopeValue) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        PersonalizationPlan.Option option = plan.options().stream()
                .filter(candidate -> candidate.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE)
                .filter(candidate -> landscapeId.equals(candidate.landscapeId()))
                .filter(candidate -> scopeKey.equals(candidate.scopeKey()))
                .filter(candidate -> scopeValue.equals(candidate.scopeValue()))
                .findFirst()
                .orElseThrow();
        return learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of(),
                option.optionId());
    }

    private void assertCurrentStageOptions(String learnerId) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.options())
                .hasSize(3)
                .allSatisfy(option -> {
                    assertThat(option.kind()).isEqualTo(PersonalizationPlan.OptionKind.SCOPE_VALUE);
                    assertThat(option.landscapeId()).isEqualTo(ROOT_ID);
                    assertThat(option.scopeKey()).isEqualTo("stage");
                });
        assertThat(plan.options())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("SekI", "SekII", "CrossStage");
    }

    private void assertCurrentDurationModelOptions(String learnerId) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(plan.options())
                .hasSize(2)
                .allSatisfy(option -> {
                    assertThat(option.kind()).isEqualTo(PersonalizationPlan.OptionKind.SCOPE_VALUE);
                    assertThat(option.landscapeId()).isEqualTo(ROOT_ID);
                    assertThat(option.scopeKey()).isEqualTo("durationModel");
                });
        assertThat(plan.options())
                .extracting(PersonalizationPlan.Option::scopeValue)
                .containsExactly("G8", "G9");
    }

    private void assertStage(JsonNode config, String expectedStage) {
        assertThat(config.path(ROOT_ID).path("stage").asText()).isEqualTo(expectedStage);
    }

    private UnifiedLearnerStateResponse completeCurrentGroup(String learnerId) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(learnerId);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        PersonalizationPlan.Option completion = plan.options().stream()
                .filter(option -> option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                .findFirst()
                .orElseThrow();
        return learnerService.patchPersonalCurriculum(
                learnerId,
                Map.of(),
                List.of(),
                List.of(),
                completion.optionId());
    }

    private void assertConflict(Runnable mutation) {
        assertThatThrownBy(mutation::run)
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }
}
