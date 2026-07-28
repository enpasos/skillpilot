package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.landscape.PersonalizationFlow;
import com.skillpilot.backend.landscape.PersonalizationGroup;
import com.skillpilot.backend.landscape.PersonalizationOptionSource;
import com.skillpilot.backend.landscape.PersonalizationSourceKind;
import com.skillpilot.backend.landscape.PersonalizationStage;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
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

    private static SkillLandscape landscape(
            String id,
            LandscapeFilter... filters) {
        SkillLandscape landscape = new SkillLandscape();
        landscape.setLandscapeId(id);
        landscape.setSubject(id);
        landscape.setFilters(List.of(filters));
        return landscape;
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
}
