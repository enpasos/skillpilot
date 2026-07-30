package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.PersonalizationFlow;
import com.skillpilot.backend.landscape.PersonalizationGroup;
import com.skillpilot.backend.landscape.PersonalizationOptionSource;
import com.skillpilot.backend.landscape.PersonalizationScopeValue;
import com.skillpilot.backend.landscape.PersonalizationSourceKind;
import com.skillpilot.backend.landscape.PersonalizationStage;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class LearnerPersonalizationMutationContractTest {

    private static final String LEARNER_ID = "learner-neutral";
    private static final String ROOT_LANDSCAPE_ID = "landscape-orbit";
    private static final String ALTERNATE_ROOT_LANDSCAPE_ID = "landscape-nova";
    private static final String FIRST_LANDSCAPE_ID = "landscape-cobalt";
    private static final String SECOND_LANDSCAPE_ID = "landscape-ember";
    private static final String FILTERLESS_LANDSCAPE_ID = "landscape-silver";

    private final LearnerRepository learnerRepository = mock(LearnerRepository.class);
    private final LearnerClientStateRepository learnerClientStateRepository =
            mock(LearnerClientStateRepository.class);
    private final MasteryRepository masteryRepository = mock(MasteryRepository.class);
    private final PlannedGoalRepository plannedGoalRepository = mock(PlannedGoalRepository.class);
    private final LandscapeService landscapeService = mock(LandscapeService.class);
    private final GoalMappingService goalMappingService = mock(GoalMappingService.class);
    private final DeckResourceService deckResourceService = mock(DeckResourceService.class);
    private final ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private Learner learner;
    private LearnerService learnerService;

    @BeforeEach
    void setUp() {
        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(ROOT_LANDSCAPE_ID);
        learner.setPersonalCurriculum("""
                {
                  "landscape-orbit": {"selected": true, "filterId": "Dial-A"},
                  "landscape-cobalt": {"selected": true},
                  "landscape-ember": {"selected": true, "filterId": "Mode-Stable"}
                }
                """);

        when(learnerRepository.findBySkillpilotIdForUpdate(LEARNER_ID))
                .thenReturn(Optional.of(learner));
        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        SkillLandscape rootLandscape = landscape(
                ROOT_LANDSCAPE_ID,
                filter("Dial-A", "Dial A"),
                filter("Dial-B", "Dial B"));
        SkillLandscape firstLandscape = landscape(
                FIRST_LANDSCAPE_ID,
                filter("Band-Mixed", "Mixed band"),
                filter("Band-Alternate", "Alternate band"));
        SkillLandscape secondLandscape = landscape(
                SECOND_LANDSCAPE_ID,
                filter("Mode-Stable", "Stable mode"));
        SkillLandscape filterlessLandscape = landscape(FILTERLESS_LANDSCAPE_ID);
        rootLandscape.setPersonalizationFlow(personalizationFlow());

        when(landscapeService.getById(ROOT_LANDSCAPE_ID)).thenReturn(rootLandscape);
        when(landscapeService.getById(FIRST_LANDSCAPE_ID))
                .thenReturn(firstLandscape);
        when(landscapeService.getById(SECOND_LANDSCAPE_ID))
                .thenReturn(secondLandscape);
        when(landscapeService.getById(FILTERLESS_LANDSCAPE_ID))
                .thenReturn(filterlessLandscape);
        when(landscapeService.getClosure(ROOT_LANDSCAPE_ID))
                .thenReturn(List.of(
                        rootLandscape,
                        firstLandscape,
                        secondLandscape,
                        filterlessLandscape));
        when(landscapeService.getOverview("de", true))
                .thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of());

        learnerService = new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                objectMapper,
                eventPublisher);
    }

    @Test
    void currentDescendantSelectionPreservesAuthoredSpellingAndOtherSparseSelections() throws Exception {
        String optionId = currentOption(FIRST_LANDSCAPE_ID, "Band-Mixed").optionId();

        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                optionId);

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Band-Mixed");
        assertThat(persisted.path(SECOND_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(SECOND_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Mode-Stable");
        assertThat(persisted.path("landscape-orbit").path("filterId").asText())
                .isEqualTo("Dial-A");
        assertThat(persisted).hasSize(3);
    }

    @Test
    void mixedCaseRestrictionPersistsTheDeclaringLandscapesCanonicalFilterId() throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        PersonalizationOptionSource mixedCaseRestriction =
                landscapeFilters(FIRST_LANDSCAPE_ID);
        mixedCaseRestriction.setFilterIds(List.of("bAnD-mIxEd"));
        root.setPersonalizationFlow(flow(stage(
                "stage-restricted",
                1,
                group(
                        "group-restricted",
                        1,
                        1,
                        1,
                        mixedCaseRestriction))));
        learner.setPersonalCurriculum("{}");

        PersonalizationPlan plan = learnerService.getPersonalizationPlan(LEARNER_ID);
        PersonalizationPlan.Option option = plan.options().getFirst();
        assertThat(option.filterId()).isEqualTo("Band-Mixed");
        assertThat(option.filterLabel()).isEqualTo("Mixed band");

        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                option.optionId());

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Band-Mixed");
    }

    @Test
    void rejectsRawConfigurationAtTheCoachMutationBoundary() {
        assertStatus(
                HttpStatus.BAD_REQUEST,
                () -> learnerService.patchPersonalCurriculum(
                        LEARNER_ID,
                        Map.of(ROOT_LANDSCAPE_ID, Map.of("selected", true)),
                        List.of(FIRST_LANDSCAPE_ID),
                        List.of("Band-Mixed")));

        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void rawCockpitConfigurationCannotForgeServerManagedFlowCompletion() {
        assertStatus(
                HttpStatus.BAD_REQUEST,
                () -> learnerService.setPersonalCurriculum(
                        LEARNER_ID,
                        Map.of(
                                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                                Map.of(
                                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                                        ROOT_LANDSCAPE_ID,
                                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                                        true)),
                        List.of(),
                        List.of()));

        assertThat(learnerService.getPersonalizationPlan(LEARNER_ID).stage())
                .isEqualTo(PersonalizationPlan.Stage.SELECTION);
        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void rejectsAStaleRootOptionWhileTheCurrentStepTargetsAnIncompleteDescendant() {
        String currentConfig = learner.getPersonalCurriculum();
        learner.setPersonalCurriculum("{}");
        String staleRootOptionId = currentOption(ROOT_LANDSCAPE_ID, "Dial-A").optionId();
        learner.setPersonalCurriculum(currentConfig);

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.patchPersonalCurriculum(
                        LEARNER_ID,
                        null,
                        List.of(),
                        List.of(),
                        staleRootOptionId));

        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void acceptsASelectionOnlyOptionForAFilterlessDescendant() throws Exception {
        learner.setPersonalCurriculum("""
                {
                  "landscape-orbit": {"selected": true, "filterId": "Dial-A"},
                  "landscape-cobalt": {"selected": true, "filterId": "Band-Mixed"}
                }
                """);
        String optionId = currentOption(FILTERLESS_LANDSCAPE_ID, null).optionId();

        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                optionId);

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(FILTERLESS_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(FILTERLESS_LANDSCAPE_ID).has("filterId"))
                .isFalse();
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Dial-A");
    }

    @Test
    void explicitCompletionPersistsOnlyFlowStateAndCannotBeReplayed() throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(stage(
                "stage-optional",
                1,
                group(
                        "group-optional",
                        1,
                        0,
                        2,
                        landscapes(FIRST_LANDSCAPE_ID, SECOND_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum("{}");
        PersonalizationPlan.Option finish = learnerService.getPersonalizationPlan(LEARNER_ID)
                .options().stream()
                .filter(option -> option.kind()
                        == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                .findFirst()
                .orElseThrow();

        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                finish.optionId());

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted).hasSize(1);
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.has(SECOND_LANDSCAPE_ID)).isFalse();
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY)
                        .asText())
                .isEqualTo(ROOT_LANDSCAPE_ID);
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY)
                        .isArray())
                .isTrue();
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY)
                        .get(0)
                        .asText())
                .isEqualTo(finish.optionId());
        assertThat(learnerService.getPersonalizationPlan(LEARNER_ID).stage())
                .isEqualTo(PersonalizationPlan.Stage.COMPLETE);

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.patchPersonalCurriculum(
                        LEARNER_ID,
                        null,
                        List.of(),
                        List.of(),
                        finish.optionId()));
    }

    @Test
    void rejectsValueAndCompletionOptionsFromAnotherRootAndIgnoresItsCompletionState()
            throws Exception {
        SkillLandscape firstRoot = landscapeService.getById(ROOT_LANDSCAPE_ID);
        SkillLandscape secondRoot = landscape(ALTERNATE_ROOT_LANDSCAPE_ID);
        PersonalizationFlow sharedFlow = flow(stage(
                "stage-shared",
                1,
                group(
                        "group-shared",
                        1,
                        0,
                        2,
                        landscapes(FIRST_LANDSCAPE_ID, SECOND_LANDSCAPE_ID))));
        firstRoot.setPersonalizationFlow(sharedFlow);
        secondRoot.setPersonalizationFlow(flow(stage(
                "stage-shared",
                1,
                group(
                        "group-shared",
                        1,
                        0,
                        2,
                        landscapes(FIRST_LANDSCAPE_ID, SECOND_LANDSCAPE_ID)))));
        when(landscapeService.getById(ALTERNATE_ROOT_LANDSCAPE_ID))
                .thenReturn(secondRoot);
        learner.setPersonalCurriculum("{}");

        PersonalizationPlan firstPlan =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        PersonalizationPlan.Option foreignValue = firstPlan.options().stream()
                .filter(option -> option.kind() == PersonalizationPlan.OptionKind.VALUE)
                .findFirst()
                .orElseThrow();
        PersonalizationPlan.Option foreignCompletion = firstPlan.options().stream()
                .filter(option -> option.kind()
                        == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                .findFirst()
                .orElseThrow();

        learner.setSelectedCurriculum(ALTERNATE_ROOT_LANDSCAPE_ID);

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.patchPersonalCurriculum(
                        LEARNER_ID,
                        null,
                        List.of(),
                        List.of(),
                        foreignValue.optionId()));
        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.patchPersonalCurriculum(
                        LEARNER_ID,
                        null,
                        List.of(),
                        List.of(),
                        foreignCompletion.optionId()));

        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(foreignCompletion.optionId())))));

        PersonalizationPlan secondPlan =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(secondPlan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(secondPlan.options())
                .extracting(PersonalizationPlan.Option::optionId)
                .doesNotContain(
                        foreignValue.optionId(),
                        foreignCompletion.optionId());
        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void rejectsAFilterThatIsDeclaredOnlyByAnotherLandscape() {
        assertBadRequest(() -> learnerService.setPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(FIRST_LANDSCAPE_ID),
                List.of("Mode-Stable")));

        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void rejectsMultipleDistinctFiltersInsteadOfSilentlyDroppingOne() {
        assertBadRequest(() -> learnerService.setPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(FIRST_LANDSCAPE_ID),
                List.of("Band-Mixed", "Band-Alternate")));

        verify(learnerRepository, never()).save(any(Learner.class));
    }

    @Test
    void curriculumChangeClearsDependentScopeWhileSameCurriculumKeepsIt() throws Exception {
        SkillLandscape alternateRoot = landscape(ALTERNATE_ROOT_LANDSCAPE_ID);
        when(landscapeService.getById(ALTERNATE_ROOT_LANDSCAPE_ID))
                .thenReturn(alternateRoot);
        learner.setActiveGoalId("active-goal-a");
        learner.setLearningState(LearningState.TEACHING);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of(
                        "selected", true,
                        "filterId", "Dial-A",
                        "stage", "SekII"),
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"),
                "__skillpilot_stage_scope_sek1__",
                Map.of("selected", false),
                "__skillpilot_stage_scope_sek2__",
                Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of("completed-option")))));
        String originalPersonalCurriculum = learner.getPersonalCurriculum();

        learnerService.setCurriculum(LEARNER_ID, ROOT_LANDSCAPE_ID);

        assertThat(learner.getPersonalCurriculum()).isEqualTo(originalPersonalCurriculum);
        assertThat(learner.getActiveGoalId()).isEqualTo("active-goal-a");
        verify(plannedGoalRepository, never())
                .deleteByLearner_SkillpilotId(LEARNER_ID);

        learnerService.setCurriculum(LEARNER_ID, ALTERNATE_ROOT_LANDSCAPE_ID);

        assertThat(learner.getSelectedCurriculum()).isEqualTo(ALTERNATE_ROOT_LANDSCAPE_ID);
        assertThat(learner.getPersonalCurriculum()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        verify(plannedGoalRepository).deleteByLearner_SkillpilotId(LEARNER_ID);
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void guidedStageScopeSynchronizesCanonicalRootAndLegacyMarkers() throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(stage(
                "stage-entry-scope",
                1,
                group(
                        "group-stage",
                        1,
                        1,
                        1,
                        scopeValues(
                                ROOT_LANDSCAPE_ID,
                                "stage",
                                scopeValue("SekI"),
                                scopeValue("SekII"),
                                scopeValue("CrossStage"))))));

        Map<String, List<Boolean>> expectedMarkers = Map.of(
                "SekI", List.of(true, false),
                "SekII", List.of(false, true),
                "CrossStage", List.of(true, true));
        for (Map.Entry<String, List<Boolean>> expected : expectedMarkers.entrySet()) {
            learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                    ROOT_LANDSCAPE_ID,
                    Map.of("selected", true, "filterId", "Dial-A"),
                    FIRST_LANDSCAPE_ID,
                    Map.of(
                            "selected", true,
                            "filterId", "Band-Mixed",
                            "stage", "CrossStage"),
                    "__skillpilot_stage_scope_sek1__",
                    Map.of("selected", false),
                    "__skillpilot_stage_scope_sek2__",
                    Map.of("selected", false),
                    "landscape-unrelated",
                    Map.of(
                            "selected", true,
                            "filterId", "Keep-Me",
                            "stage", "SekI"))));

            PersonalizationPlan.Option stageOption =
                    currentScopeOption("stage", expected.getKey());
            learnerService.patchPersonalCurriculum(
                    LEARNER_ID,
                    Map.of(),
                    List.of(),
                    List.of(),
                    stageOption.optionId());

            JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
            assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("stage").asText())
                    .isEqualTo(expected.getKey());
            assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("filterId").asText())
                    .isEqualTo("Dial-A");
            assertThat(persisted.path(FIRST_LANDSCAPE_ID).has("stage"))
                    .isFalse();
            assertThat(persisted
                            .path("__skillpilot_stage_scope_sek1__")
                            .path("selected")
                            .asBoolean())
                    .isEqualTo(expected.getValue().get(0));
            assertThat(persisted
                            .path("__skillpilot_stage_scope_sek2__")
                            .path("selected")
                            .asBoolean())
                    .isEqualTo(expected.getValue().get(1));
            assertThat(persisted.path("landscape-unrelated").path("filterId").asText())
                    .isEqualTo("Keep-Me");
            assertThat(persisted.path("landscape-unrelated").path("stage").asText())
                    .isEqualTo("SekI");
        }
    }

    @Test
    void guidedIntermediateMutationClearsKnownFocusWhileLevelTwoRemainsUnresolved()
            throws Exception {
        String previouslyVisibleGoalId = "goal-known-before-level-two-change";
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setGoals(List.of(goal(previouslyVisibleGoalId)));
        learner.setPersonalCurriculum("{}");
        learner.setActiveGoalId(previouslyVisibleGoalId);

        List<PlannedGoal> storedFocus = new ArrayList<>(
                List.of(new PlannedGoal(learner, previouslyVisibleGoalId)));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenAnswer(ignored -> List.copyOf(storedFocus));
        doAnswer(invocation -> {
            Iterable<PlannedGoal> deleted = invocation.getArgument(0);
            deleted.forEach(storedFocus::remove);
            return null;
        }).when(plannedGoalRepository).deleteAll(any());

        PersonalizationPlan.Option jurisdictionOption =
                currentOption(ROOT_LANDSCAPE_ID, "Dial-A");
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                Map.of(),
                List.of(),
                List.of(),
                jurisdictionOption.optionId());

        assertThat(storedFocus).isEmpty();
        assertThat(learner.getActiveGoalId()).isNull();
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void guidedStageChangeKeepsOnlyCurrentTargetFocusAndDropsSekOnePrerequisiteAndUnknown()
            throws Exception {
        String sekOneGoalId = "goal-seki";
        String sekTwoTargetId = "goal-sekii-target";
        String prerequisiteOnlyId = "goal-sekii-prerequisite";
        String unknownGoalId = "goal-unknown";

        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setFrameworkId("canonical-gymnasium-test");
        root.setGoals(List.of(
                goal(sekOneGoalId),
                goal(sekTwoTargetId),
                goal(prerequisiteOnlyId)));
        root.setPersonalizationFlow(flow(stage(
                "stage-entry-scope",
                1,
                group(
                        "group-stage",
                        1,
                        1,
                        1,
                        scopeValues(
                                ROOT_LANDSCAPE_ID,
                                "stage",
                                scopeValue("SekI"),
                                scopeValue("SekII"))))));
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"))));
        learner.setActiveGoalId(sekOneGoalId);

        List<PlannedGoal> storedFocus = new ArrayList<>(List.of(
                new PlannedGoal(learner, sekOneGoalId),
                new PlannedGoal(learner, sekTwoTargetId),
                new PlannedGoal(learner, prerequisiteOnlyId),
                new PlannedGoal(learner, unknownGoalId)));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenAnswer(ignored -> List.copyOf(storedFocus));
        doAnswer(invocation -> {
            Iterable<PlannedGoal> deleted = invocation.getArgument(0);
            deleted.forEach(storedFocus::remove);
            return null;
        }).when(plannedGoalRepository).deleteAll(any());

        CompositionViewService compositionViews = mock(CompositionViewService.class);
        when(compositionViews.findLearnerScopeView(
                        eq(ROOT_LANDSCAPE_ID),
                        anyMap()))
                .thenReturn(Map.of(
                        "viewId", "fixture-sekii",
                        "rootNodes", List.of(
                                Map.of(
                                        "kind", "goalEntry",
                                        "goalId", sekTwoTargetId),
                                Map.of(
                                        "kind", "goalEntry",
                                        "goalId", prerequisiteOnlyId,
                                        "projectionRole", "prerequisiteOnly"))));
        learnerService = new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                compositionViews,
                objectMapper,
                eventPublisher,
                mock(PlatformTransactionManager.class));

        PersonalizationPlan.Option sekTwoOption =
                currentScopeOption("stage", "SekII");
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                Map.of(),
                List.of(),
                List.of(),
                sekTwoOption.optionId());

        assertThat(storedFocus)
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(sekTwoTargetId);
        assertThat(learner.getActiveGoalId()).isNull();
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void restartClearsOnlyTheSelectedRootClosureAndItsMatchingFlowProgress()
            throws Exception {
        PlannedGoal unknownFocus = new PlannedGoal(learner, "goal-unknown");
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(unknownFocus));
        learner.setActiveGoalId("active-before-restart");
        learner.setLearningState(LearningState.TEACHING);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"),
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"),
                SECOND_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Mode-Stable"),
                "__skillpilot_stage_scope_sek1__",
                Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__",
                Map.of("selected", false),
                "landscape-unrelated",
                Map.of("selected", true, "filterId", "Keep-Me"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of("completed-option")))));

        PersonalizationPlan restarted =
                learnerService.restartPersonalization(LEARNER_ID);

        assertThat(restarted.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(restarted.options())
                .extracting(PersonalizationPlan.Option::filterId)
                .containsExactly("Dial-A", "Dial-B");
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted).hasSize(1);
        assertThat(persisted.path("landscape-unrelated").path("filterId").asText())
                .isEqualTo("Keep-Me");
        assertThat(persisted.has(ROOT_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.has(SECOND_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.has("__skillpilot_stage_scope_sek1__")).isFalse();
        assertThat(persisted.has("__skillpilot_stage_scope_sek2__")).isFalse();
        assertThat(persisted.has(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY))
                .isFalse();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        verifyNoInteractions(masteryRepository);
        verify(plannedGoalRepository).deleteAll(List.of(unknownFocus));
    }

    @Test
    void rewindKeepsEarlierSelectionsAndUnrelatedConfiguration() throws Exception {
        PlannedGoal staleFocus = new PlannedGoal(learner, "goal-before-rewind");
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(staleFocus));
        learner.setActiveGoalId("active-before-rewind");
        learner.setLearningState(LearningState.TEACHING);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"),
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"),
                SECOND_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Mode-Stable"),
                FILTERLESS_LANDSCAPE_ID,
                Map.of("selected", true),
                "landscape-unrelated",
                Map.of("selected", true, "filterId", "Keep-Me"))));
        PersonalizationPlan complete = learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(complete.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(complete.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly(
                        "group-root-filter",
                        "group-descendant-filter",
                        "group-filterless-selection");
        String rewindId = complete.completedDecisions().get(1).rewindId();

        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(LEARNER_ID, rewindId);

        assertThat(rewound.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(rewound.groupId()).isEqualTo("group-descendant-filter");
        assertThat(rewound.selectedCount()).isZero();
        assertThat(rewound.options())
                .extracting(PersonalizationPlan.Option::filterId)
                .containsExactly("Band-Mixed", "Band-Alternate");
        assertThat(rewound.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("group-root-filter");

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Dial-A");
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.path(FILTERLESS_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(SECOND_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Mode-Stable");
        assertThat(persisted.path("landscape-unrelated").path("filterId").asText())
                .isEqualTo("Keep-Me");
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        verify(plannedGoalRepository).deleteAll(List.of(staleFocus));
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void rewindRemovesOnlyTheTargetedFieldsFromSharedLandscapeSettings()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-duration",
                        1,
                        group(
                                "group-duration",
                                1,
                                1,
                                1,
                                scopeValues(
                                        ROOT_LANDSCAPE_ID,
                                        "durationModel",
                                        scopeValue("G8"),
                                        scopeValue("G9")))),
                /*
                 * Keep the filter after duration intentionally. Rewind replay
                 * must restore both retained fields independent of authored
                 * stage order.
                 */
                stage(
                        "stage-region",
                        2,
                        group(
                                "group-region",
                                1,
                                1,
                                1,
                                landscapeFilters(ROOT_LANDSCAPE_ID))),
                stage(
                        "stage-scope",
                        3,
                        group(
                                "group-stage",
                                1,
                                1,
                                1,
                                scopeValues(
                                        ROOT_LANDSCAPE_ID,
                                        "stage",
                                        scopeValue("SekI"),
                                        scopeValue("SekII")))),
                stage(
                        "stage-subject",
                        4,
                        group(
                                "group-subject",
                                1,
                                1,
                                1,
                                landscapes(FILTERLESS_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of(
                        "selected", true,
                        "filterId", "Dial-A",
                        "durationModel", "G9",
                        "stage", "SekII",
                        "keep", "untouched"),
                FILTERLESS_LANDSCAPE_ID,
                Map.of("selected", true),
                "__skillpilot_stage_scope_sek1__",
                Map.of("selected", false),
                "__skillpilot_stage_scope_sek2__",
                Map.of("selected", true))));
        PersonalizationPlan complete = learnerService.getPersonalizationPlan(LEARNER_ID);
        String rewindId = complete.completedDecisions().stream()
                .filter(decision -> "group-stage".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst()
                .orElseThrow();

        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(LEARNER_ID, rewindId);

        assertThat(rewound.groupId()).isEqualTo("group-stage");
        assertThat(rewound.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("group-duration", "group-region");
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Dial-A");
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("durationModel").asText())
                .isEqualTo("G9");
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("keep").asText())
                .isEqualTo("untouched");
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).has("stage")).isFalse();
        assertThat(persisted.path(FILTERLESS_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.has("__skillpilot_stage_scope_sek1__")).isFalse();
        assertThat(persisted.has("__skillpilot_stage_scope_sek2__")).isFalse();
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void rewindOfAProfileKeepsItsPreviouslySelectedSubject() throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-subject",
                        1,
                        group(
                                "group-subject",
                                1,
                                1,
                                1,
                                landscapes(FIRST_LANDSCAPE_ID))),
                stage(
                        "stage-profile",
                        2,
                        group(
                                "group-profile",
                                1,
                                1,
                                1,
                                landscapeFilters(FIRST_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"))));
        PersonalizationPlan complete = learnerService.getPersonalizationPlan(LEARNER_ID);
        String profileRewindId = complete.completedDecisions().get(1).rewindId();

        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(LEARNER_ID, profileRewindId);

        assertThat(rewound.groupId()).isEqualTo("group-profile");
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).has("filterId")).isFalse();
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void rewindingOneDynamicProfileShowsTheOtherRetainedProfile()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-subject",
                        1,
                        group(
                                "group-subject",
                                1,
                                2,
                                2,
                                landscapes(
                                        FIRST_LANDSCAPE_ID,
                                        SECOND_LANDSCAPE_ID))),
                stage(
                        "stage-profile",
                        2,
                        group(
                                "group-profile",
                                1,
                                1,
                                1,
                                filtersForSelectedLandscapes(
                                        "group-subject")))));
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"),
                SECOND_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Mode-Stable"))));
        PersonalizationPlan complete = learnerService.getPersonalizationPlan(LEARNER_ID);
        PersonalizationPlan.CompletedDecision firstProfile =
                complete.completedDecisions().stream()
                        .filter(decision -> "group-profile".equals(decision.groupId()))
                        .filter(decision -> decision.selectedOptions().stream()
                                .anyMatch(option -> FIRST_LANDSCAPE_ID.equals(
                                        option.landscapeId())))
                        .findFirst()
                        .orElseThrow();

        PersonalizationPlan rewound = learnerService.rewindPersonalization(
                LEARNER_ID,
                firstProfile.rewindId());

        assertThat(rewound.groupId()).isEqualTo("group-profile");
        assertThat(rewound.groupInstanceId()).contains(FIRST_LANDSCAPE_ID);
        assertThat(rewound.preservedDecisions()).hasSize(1);
        assertThat(rewound.preservedDecisions().getFirst().selectedOptions())
                .extracting(
                        PersonalizationPlan.Option::landscapeId,
                        PersonalizationPlan.Option::filterId)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(
                                SECOND_LANDSCAPE_ID,
                                "Mode-Stable"));
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path(FIRST_LANDSCAPE_ID).has("filterId")).isFalse();
        assertThat(persisted.path(SECOND_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Mode-Stable");

        PersonalizationPlan.Option replacementProfile = rewound.options().stream()
                .filter(option -> FIRST_LANDSCAPE_ID.equals(
                        option.landscapeId()))
                .filter(option -> "Band-Mixed".equals(option.filterId()))
                .findFirst()
                .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                replacementProfile.optionId());

        PersonalizationPlan completedAgain =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(completedAgain.stage())
                .isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        JsonNode afterReplacement =
                objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(afterReplacement
                        .path(SECOND_LANDSCAPE_ID)
                        .path("filterId")
                        .asText())
                .isEqualTo("Mode-Stable");
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void rewindCanClearAPartialCurrentMultiSelectionWithoutRestartingEarlierSteps()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-region",
                        1,
                        group(
                                "group-region",
                                1,
                                1,
                                1,
                                landscapeFilters(ROOT_LANDSCAPE_ID))),
                stage(
                        "stage-subject",
                        2,
                        group(
                                "group-subject",
                                1,
                                1,
                                2,
                                landscapes(FIRST_LANDSCAPE_ID, SECOND_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"),
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Band-Mixed"))));
        PersonalizationPlan partial = learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(partial.groupId()).isEqualTo("group-subject");
        assertThat(partial.currentSelectedOptions())
                .extracting(PersonalizationPlan.Option::landscapeId)
                .containsExactly(FIRST_LANDSCAPE_ID);

        PersonalizationPlan rewound = learnerService.rewindPersonalization(
                LEARNER_ID,
                partial.currentRewindId());

        assertThat(rewound.groupId()).isEqualTo("group-subject");
        assertThat(rewound.selectedCount()).isZero();
        assertThat(rewound.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("group-region");
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("filterId").asText())
                .isEqualTo("Dial-A");
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void rewindRejectsUnknownReferencesWithoutMutation() {
        String originalConfig = learner.getPersonalCurriculum();

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.rewindPersonalization(
                        LEARNER_ID,
                        "unknown-or-stale-rewind"));

        assertThat(learner.getPersonalCurriculum()).isEqualTo(originalConfig);
        verify(learnerRepository, never()).save(any(Learner.class));
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void rewindKeepsEarlierCompletionMarkersAndRemovesTheReopenedMarker()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-pathways",
                        1,
                        group(
                                "group-pathways",
                                1,
                                0,
                                2,
                                landscapes(FIRST_LANDSCAPE_ID, SECOND_LANDSCAPE_ID))),
                stage(
                        "stage-addition",
                        2,
                        group(
                                "group-addition",
                                1,
                                0,
                                1,
                                landscapes(FILTERLESS_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum("{}");

        PersonalizationPlan firstPlan = learnerService.getPersonalizationPlan(LEARNER_ID);
        PersonalizationPlan.Option firstValue = firstPlan.options().stream()
                .filter(option -> FIRST_LANDSCAPE_ID.equals(option.landscapeId()))
                .findFirst()
                .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                firstValue.optionId());
        PersonalizationPlan.Option firstCompletion =
                learnerService.getPersonalizationPlan(LEARNER_ID).options().stream()
                        .filter(option -> option.kind()
                                == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                        .findFirst()
                        .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                firstCompletion.optionId());

        PersonalizationPlan.Option secondCompletion =
                learnerService.getPersonalizationPlan(LEARNER_ID).options().stream()
                        .filter(option -> option.kind()
                                == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                        .findFirst()
                        .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                secondCompletion.optionId());

        PersonalizationPlan complete = learnerService.getPersonalizationPlan(LEARNER_ID);
        String secondRewindId = complete.completedDecisions().get(1).rewindId();
        PersonalizationPlan rewound =
                learnerService.rewindPersonalization(LEARNER_ID, secondRewindId);

        assertThat(rewound.groupId()).isEqualTo("group-addition");
        JsonNode completionIds = objectMapper.readTree(learner.getPersonalCurriculum())
                .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                .path(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY);
        assertThat(completionIds).hasSize(1);
        assertThat(completionIds.get(0).asText()).isEqualTo(firstCompletion.optionId());
        assertThat(completionIds.toString()).doesNotContain(secondCompletion.optionId());
        assertThat(objectMapper.readTree(learner.getPersonalCurriculum())
                        .path(FIRST_LANDSCAPE_ID)
                        .path("selected")
                        .asBoolean())
                .isTrue();
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void repeatedRewindsKeepAnIndependentLaterCompletionMarker()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setPersonalizationFlow(flow(
                stage(
                        "stage-a",
                        1,
                        group(
                                "group-a",
                                1,
                                1,
                                1,
                                landscapeFilters(ROOT_LANDSCAPE_ID))),
                stage(
                        "stage-b",
                        2,
                        group(
                                "group-b",
                                1,
                                1,
                                1,
                                landscapeFilters(FIRST_LANDSCAPE_ID))),
                stage(
                        "stage-c",
                        3,
                        group(
                                "group-c",
                                1,
                                0,
                                1,
                                landscapes(FILTERLESS_LANDSCAPE_ID)))));
        learner.setPersonalCurriculum("{}");

        PersonalizationPlan.Option firstA =
                currentOption(ROOT_LANDSCAPE_ID, "Dial-A");
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                firstA.optionId());
        PersonalizationPlan.Option firstB =
                currentOption(FIRST_LANDSCAPE_ID, "Band-Mixed");
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                firstB.optionId());
        PersonalizationPlan.Option completionC =
                learnerService.getPersonalizationPlan(LEARNER_ID).options().stream()
                        .filter(option -> option.kind()
                                == PersonalizationPlan.OptionKind.COMPLETE_GROUP)
                        .findFirst()
                        .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                completionC.optionId());

        PersonalizationPlan complete =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        String rewindB = complete.completedDecisions().stream()
                .filter(decision -> "group-b".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst()
                .orElseThrow();
        PersonalizationPlan reopenedB =
                learnerService.rewindPersonalization(LEARNER_ID, rewindB);
        String rewindA = reopenedB.completedDecisions().stream()
                .filter(decision -> "group-a".equals(decision.groupId()))
                .map(PersonalizationPlan.CompletedDecision::rewindId)
                .findFirst()
                .orElseThrow();

        PersonalizationPlan reopenedA =
                learnerService.rewindPersonalization(LEARNER_ID, rewindA);

        JsonNode completionIdsAfterRewinds =
                objectMapper.readTree(learner.getPersonalCurriculum())
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY);
        assertThat(completionIdsAfterRewinds)
                .anySatisfy(id -> assertThat(id.asText())
                        .isEqualTo(completionC.optionId()));
        assertThat(reopenedA.groupId()).isEqualTo("group-a");

        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                reopenedA.options().stream()
                        .filter(option -> "Dial-A".equals(option.filterId()))
                        .findFirst()
                        .orElseThrow()
                        .optionId());
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                learnerService.getPersonalizationPlan(LEARNER_ID)
                        .options()
                        .stream()
                        .filter(option -> "Band-Mixed".equals(
                                option.filterId()))
                        .findFirst()
                        .orElseThrow()
                        .optionId());

        assertThat(learnerService.getPersonalizationPlan(LEARNER_ID).stage())
                .isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void restartPreservesFlowProgressOwnedByAnotherRoot() throws Exception {
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"),
                "landscape-unrelated",
                Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ALTERNATE_ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of("foreign-completion")))));

        learnerService.restartPersonalization(LEARNER_ID);

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.has(ROOT_LANDSCAPE_ID)).isFalse();
        assertThat(persisted.path("landscape-unrelated").path("selected").asBoolean())
                .isTrue();
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY)
                        .asText())
                .isEqualTo(ALTERNATE_ROOT_LANDSCAPE_ID);
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .path(CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY)
                        .get(0)
                        .asText())
                .isEqualTo("foreign-completion");
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void explicitReopenClearsFocusAndActiveGoalWhenLevelTwoBecomesUnresolved()
            throws Exception {
        PlannedGoal staleFocus = new PlannedGoal(learner, "goal-visible-before-reopen");
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(staleFocus));
        learner.setActiveGoalId(staleFocus.getGoalId());
        learner.setLearningState(LearningState.TEACHING);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));

        Learner reopened =
                learnerService.reopenPersonalizationForExplicitLaunch(learner);

        JsonNode persisted = objectMapper.readTree(reopened.getPersonalCurriculum());
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .has(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY))
                .isFalse();
        assertThat(learnerService.getPersonalizationPlan(LEARNER_ID).stage())
                .isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(reopened.getActiveGoalId()).isNull();
        assertThat(reopened.getLearningState()).isEqualTo(LearningState.FRONTIER);
        verify(plannedGoalRepository).deleteAll(List.of(staleFocus));
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void migratedReopenPreservesExistingChoicesAndReturnsTheFirstMissingDecision()
            throws Exception {
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true),
                "landscape-unrelated",
                Map.of("selected", true, "keep", "untouched"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(LEARNER_ID);

        assertThat(reopened.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        assertThat(reopened.groupId()).isEqualTo("group-root-filter");
        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.path(ROOT_LANDSCAPE_ID).path("selected").asBoolean())
                .isTrue();
        assertThat(persisted.path("landscape-unrelated").path("keep").asText())
                .isEqualTo("untouched");
        assertThat(persisted
                        .path(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY)
                        .has(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY))
                .isFalse();
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void migratedSummaryDoesNotPresentOrReactivateAnInactiveResidualFilter()
            throws Exception {
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                FIRST_LANDSCAPE_ID,
                Map.of("selected", false, "filterId", "Band-Mixed"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));

        PersonalizationPlan migrated =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(migrated.preservedDecisions())
                .flatExtracting(PersonalizationPlan.DecisionSummary::selectedOptions)
                .extracting(PersonalizationPlan.Option::filterId)
                .doesNotContain("Band-Mixed");

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(LEARNER_ID);
        PersonalizationPlan.Option rootOption = reopened.options().stream()
                .filter(option -> "Dial-A".equals(option.filterId()))
                .findFirst()
                .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                rootOption.optionId());

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void migratedSummaryDoesNotPresentOrReplayAnUnknownAuthoredFilter()
            throws Exception {
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                FIRST_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Removed-Profile"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));

        PersonalizationPlan migrated =
                learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(migrated.preservedDecisions())
                .flatExtracting(PersonalizationPlan.DecisionSummary::selectedOptions)
                .extracting(PersonalizationPlan.Option::filterId)
                .doesNotContain("Removed-Profile");

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(LEARNER_ID);
        PersonalizationPlan.Option rootOption = reopened.options().stream()
                .filter(option -> "Dial-A".equals(option.filterId()))
                .findFirst()
                .orElseThrow();
        learnerService.patchPersonalCurriculum(
                LEARNER_ID,
                null,
                List.of(),
                List.of(),
                rootOption.optionId());

        JsonNode persisted = objectMapper.readTree(learner.getPersonalCurriculum());
        assertThat(persisted.has(FIRST_LANDSCAPE_ID)).isFalse();
        verify(masteryRepository, never()).save(any());
    }

    @Test
    void migratedReopenRejectsAnInvalidAuthoredFlowWithoutChangingStoredState()
            throws Exception {
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.getPersonalizationFlow().setVersion("unsupported-version");
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));
        String originalConfig = learner.getPersonalCurriculum();

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.reopenMigratedPersonalization(LEARNER_ID));

        assertThat(learner.getPersonalCurriculum()).isEqualTo(originalConfig);
        verify(learnerRepository, never()).save(any(Learner.class));
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void migratedReopenKeepsTeachingStateWhenTheRetainedScopeIsComplete()
            throws Exception {
        String activeGoalId = "goal-still-visible";
        SkillLandscape root = landscapeService.getById(ROOT_LANDSCAPE_ID);
        root.setGoals(List.of(goal(activeGoalId)));
        root.setPersonalizationFlow(flow(stage(
                "stage-region",
                1,
                group(
                        "group-region",
                        1,
                        1,
                        1,
                        landscapeFilters(ROOT_LANDSCAPE_ID)))));
        learner.setActiveGoalId(activeGoalId);
        learner.setLearningState(LearningState.TEACHING);
        learner.setPersonalCurriculum(objectMapper.writeValueAsString(Map.of(
                ROOT_LANDSCAPE_ID,
                Map.of("selected", true, "filterId", "Dial-A"),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                        ROOT_LANDSCAPE_ID,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                        List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                        true))));

        PersonalizationPlan reopened =
                learnerService.reopenMigratedPersonalization(LEARNER_ID);

        assertThat(reopened.stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        assertThat(reopened.canReopenMigratedPersonalization()).isFalse();
        assertThat(reopened.completedDecisions())
                .extracting(PersonalizationPlan.CompletedDecision::groupId)
                .containsExactly("group-region");
        assertThat(learner.getActiveGoalId()).isEqualTo(activeGoalId);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.TEACHING);
        verifyNoInteractions(masteryRepository);
    }

    @Test
    void unresolvedLevelTwoBlocksNewLevelThreeStateButStillAllowsClearingFocus() {
        learner.setPersonalCurriculum("{}");

        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.setPlannedGoals(
                        LEARNER_ID,
                        java.util.Set.of("goal-before-level-two")));
        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.setScope(
                        LEARNER_ID,
                        List.of("goal-before-level-two")));
        assertStatus(
                HttpStatus.CONFLICT,
                () -> learnerService.setActiveGoal(
                        LEARNER_ID,
                        "goal-before-level-two"));
        verifyNoInteractions(plannedGoalRepository);

        assertThat(learnerService.setPlannedGoals(LEARNER_ID, java.util.Set.of()))
                .isEmpty();
    }

    private void assertBadRequest(Runnable mutation) {
        assertStatus(HttpStatus.BAD_REQUEST, mutation);
    }

    private void assertStatus(HttpStatus expectedStatus, Runnable mutation) {
        assertThatThrownBy(mutation::run)
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(expectedStatus));
    }

    private PersonalizationPlan.Option currentOption(
            String landscapeId,
            String filterId) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        return plan.options().stream()
                .filter(option -> landscapeId.equals(option.landscapeId()))
                .filter(option -> filterId == null
                        ? option.filterId() == null
                        : filterId.equals(option.filterId()))
                .findFirst()
                .orElseThrow();
    }

    private PersonalizationPlan.Option currentScopeOption(
            String scopeKey,
            String scopeValue) {
        PersonalizationPlan plan = learnerService.getPersonalizationPlan(LEARNER_ID);
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.SELECTION);
        return plan.options().stream()
                .filter(option -> option.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE)
                .filter(option -> scopeKey.equals(option.scopeKey()))
                .filter(option -> scopeValue.equals(option.scopeValue()))
                .findFirst()
                .orElseThrow();
    }

    private static SkillLandscape landscape(
            String id,
            LandscapeFilter... filters) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setSubject(id);
        landscape.setFilters(List.of(filters));
        return landscape;
    }

    private static LearningGoal goal(String id) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setContains(List.of());
        goal.setCore(true);
        goal.setWeight(1.0);
        return goal;
    }

    private static LandscapeFilter filter(String id, String label) {
        LandscapeFilter filter = new LandscapeFilter();
        filter.setId(id);
        filter.setLabel(label);
        return filter;
    }

    private static PersonalizationFlow personalizationFlow() {
        return flow(
                stage(
                        "stage-root",
                        1,
                        group(
                                "group-root-filter",
                                1,
                                1,
                                1,
                                landscapeFilters(ROOT_LANDSCAPE_ID))),
                stage(
                        "stage-descendant",
                        2,
                        group(
                                "group-descendant-filter",
                                1,
                                1,
                                1,
                                landscapeFilters(FIRST_LANDSCAPE_ID))),
                stage(
                        "stage-filterless",
                        3,
                        group(
                                "group-filterless-selection",
                                1,
                                1,
                                1,
                                landscapes(FILTERLESS_LANDSCAPE_ID))));
    }

    private static PersonalizationFlow flow(PersonalizationStage... stages) {
        PersonalizationFlow flow = new PersonalizationFlow();
        flow.setVersion("1");
        flow.setStages(List.of(stages));
        return flow;
    }

    private static PersonalizationStage stage(
            String id,
            int order,
            PersonalizationGroup... groups) {
        PersonalizationStage stage = new PersonalizationStage();
        stage.setId(id);
        stage.setOrder(order);
        stage.setLabel(id);
        stage.setGroups(List.of(groups));
        return stage;
    }

    private static PersonalizationGroup group(
            String id,
            int order,
            int minSelections,
            int maxSelections,
            PersonalizationOptionSource source) {
        PersonalizationGroup group = new PersonalizationGroup();
        group.setId(id);
        group.setOrder(order);
        group.setLabel(id);
        group.setMinSelections(minSelections);
        group.setMaxSelections(maxSelections);
        group.setSource(source);
        return group;
    }

    private static PersonalizationOptionSource landscapeFilters(String landscapeId) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.LANDSCAPE_FILTERS);
        source.setLandscapeId(landscapeId);
        return source;
    }

    private static PersonalizationOptionSource landscapes(String... landscapeIds) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.LANDSCAPES);
        source.setLandscapeIds(List.of(landscapeIds));
        return source;
    }

    private static PersonalizationOptionSource filtersForSelectedLandscapes(
            String selectedLandscapesFromGroupId) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.FILTERS_FOR_SELECTED_LANDSCAPES);
        source.setSelectedLandscapesFromGroupId(selectedLandscapesFromGroupId);
        return source;
    }

    private static PersonalizationOptionSource scopeValues(
            String landscapeId,
            String scopeKey,
            PersonalizationScopeValue... values) {
        PersonalizationOptionSource source = new PersonalizationOptionSource();
        source.setKind(PersonalizationSourceKind.SCOPE_VALUES);
        source.setLandscapeId(landscapeId);
        source.setScopeKey(scopeKey);
        source.setValues(List.of(values));
        return source;
    }

    private static PersonalizationScopeValue scopeValue(String value) {
        PersonalizationScopeValue scopeValue = new PersonalizationScopeValue();
        scopeValue.setValue(value);
        scopeValue.setLabel(value);
        return scopeValue;
    }
}
