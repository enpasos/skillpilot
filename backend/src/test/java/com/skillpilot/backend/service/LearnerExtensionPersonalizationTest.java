package com.skillpilot.backend.service;

import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_CONFIRM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_MAXIMUM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_MINIMUM;
import static com.skillpilot.backend.api.PersonalizationPlan.OptionKind.EXTENSION_SELECT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationPlan.Option;
import com.skillpilot.backend.api.PersonalizationPlan.OptionKind;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.PersonalizationStage;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.web.server.ResponseStatusException;

class LearnerExtensionPersonalizationTest {
    private static final String LEARNER = "extension-flow-learner";
    private static final Path EXAMPLES = Path.of("../contracts/composition-view/v1.3/examples/extensions");

    private final ObjectMapper json = new ObjectMapper();
    private final Learner learner = new Learner();
    private LearnerService service;
    private SkillLandscape root;
    private SkillLandscape subject;

    @TempDir Path curriculum;

    @BeforeEach
    void setUp() throws Exception {
        root = json.readValue(EXAMPLES.resolve("root.json").toFile(), SkillLandscape.class);
        subject = json.readValue(EXAMPLES.resolve("subject.json").toFile(), SkillLandscape.class);
        Path views = Files.createDirectories(curriculum.resolve("DE/Gymnasium/composition-views"));
        for (String file : List.of("neutral.view.json", "neutral-lk.view.json")) {
            Files.copy(EXAMPLES.resolve(file), views.resolve(file));
        }
        var properties = new LandscapeProperties();
        properties.setDirectory(curriculum.toString());
        var compositionViews = new CompositionViewService(properties, json);
        var learners = mock(LearnerRepository.class);
        var planned = mock(PlannedGoalRepository.class);
        var mastery = mock(MasteryRepository.class);
        var landscapes = mock(LandscapeService.class);
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(root.getLandscapeId());
        learner.setAutoPilot(false);
        learner.setPersonalCurriculum("{}");
        when(learners.findBySkillpilotIdForUpdate(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        when(learners.existsById(LEARNER)).thenReturn(true);
        when(learners.save(any(Learner.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(planned.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        when(mastery.findByLearner_SkillpilotId(LEARNER)).thenReturn(List.of());
        when(landscapes.getById(root.getLandscapeId())).thenReturn(root);
        when(landscapes.getById(subject.getLandscapeId())).thenReturn(subject);
        when(landscapes.getClosure(root.getLandscapeId())).thenReturn(List.of(root, subject));
        when(landscapes.getOverview("de", true)).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery, planned,
                landscapes, mock(GoalMappingService.class), mock(DeckResourceService.class), compositionViews,
                json, mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
    }

    @Test
    void minimumAsksOnlyUnmetGroupsAndRequiresAnExplicitTopic() throws Exception {
        chooseProfile("GK");
        var first = plan();
        assertThat(first.extensionStage().landscapeId()).isEqualTo(subject.getLandscapeId());
        assertThat(first.extensionStage().groups()).extracting(PersonalizationPlan.ExtensionGroup::id)
                .containsExactly("topics", "optional", "deepening");
        var topics = first.extensionStage().groups().getFirst();
        assertThat(topics.rule()).containsEntry("location", "Section 1");
        assertThat(first.extensionStage().groups()).extracting(PersonalizationPlan.ExtensionGroup::groupInstanceId)
                .doesNotHaveDuplicates();
        assertThat(option(EXTENSION_SELECT, "B").groupInstanceId()).isEqualTo(topics.groupInstanceId());
        assertThat(first.options()).extracting(Option::kind).doesNotContain(EXTENSION_CONFIRM);
        Option stale = option(EXTENSION_SELECT, "B");
        apply(option(EXTENSION_MINIMUM, null));
        assertThat(plan().extensionStage().groups()).extracting(PersonalizationPlan.ExtensionGroup::id)
                .containsExactly("topics");
        assertThat(plan().options().stream().filter(o -> o.kind() == EXTENSION_SELECT)).extracting(Option::scopeValue)
                .containsExactly("A", "B", "C");
        assertThatThrownBy(() -> apply(stale)).isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThat(storedSelection().isMissingNode()).isTrue();

        apply(option(EXTENSION_SELECT, "B"));
        assertThat(plan().extensionStage().groups()).isEmpty();
        apply(option(EXTENSION_CONFIRM, null));
        assertThat(plan().required()).isFalse();
        assertThat(storedSelection()).containsExactly(json.getNodeFactory().textNode("B"));
    }

    @Test
    void individualChoicesSurviveProfileChangesAndRejectRawReplacement() throws Exception {
        chooseProfile("GK");
        for (String id : List.of("B", "C", "E")) apply(option(EXTENSION_SELECT, id));
        apply(option(EXTENSION_CONFIRM, null));
        assertThat(storedSelection()).containsExactlyElementsOf(json.valueToTree(List.of("B", "C", "E")));

        changeProfile("LK");
        assertThat(plan().required()).isFalse();
        assertThat(storedSelection()).containsExactlyElementsOf(json.valueToTree(List.of("B", "C", "E")));
        changeProfile("GK");
        assertThat(plan().required()).isFalse();
        assertThat(storedSelection()).containsExactlyElementsOf(json.valueToTree(List.of("B", "C", "E")));

        assertThatThrownBy(() -> service.setPersonalCurriculum(LEARNER, Map.of(
                subject.getLandscapeId(), Map.of("selected", true, "filterId", "GK", "extensionSelection", "maximum")),
                List.of(), List.of())).isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void zeroMinimumCanPersistAnExplicitEmptySelection() throws Exception {
        chooseProfile("LK");
        apply(option(EXTENSION_MINIMUM, null));
        assertThat(plan().extensionStage().groups()).isEmpty();
        apply(option(EXTENSION_CONFIRM, null));
        assertThat(storedSelection().isArray()).isTrue();
        assertThat(storedSelection()).isEmpty();
        assertThat(plan().required()).isFalse();

        changeProfile("GK");
        assertThat(plan().extensionStage().groups()).extracting(PersonalizationPlan.ExtensionGroup::id)
                .containsExactly("topics", "optional", "deepening");
        assertThat(plan().options()).extracting(Option::kind).doesNotContain(EXTENSION_CONFIRM);
    }

    @Test
    void maximumPersistsTheModeAndFinishes() throws Exception {
        chooseProfile("GK");
        apply(option(EXTENSION_MAXIMUM, null));
        assertThat(storedSelection().asText()).isEqualTo("maximum");
        assertThat(plan().required()).isFalse();
        changeProfile("LK");
        assertThat(storedSelection().asText()).isEqualTo("maximum");
        assertThat(plan().required()).isFalse();
    }

    @Test
    void confirmationPreservesAnUnavailableRestoredId() throws Exception {
        chooseProfile("GK");
        var restored = json.readTree(learner.getPersonalCurriculum());
        var subjectSettings = (com.fasterxml.jackson.databind.node.ObjectNode) restored.get(subject.getLandscapeId());
        subjectSettings.set("extensionSelection", json.valueToTree(List.of("former-interest")));
        learner.setPersonalCurriculum(json.writeValueAsString(restored));

        assertThat(plan().extensionStage().selectedIds()).containsExactly("former-interest");
        apply(option(EXTENSION_MINIMUM, null));
        apply(option(EXTENSION_SELECT, "B"));
        apply(option(EXTENSION_CONFIRM, null));
        assertThat(storedSelection()).containsExactlyElementsOf(json.valueToTree(List.of("former-interest", "B")));
    }

    @Test
    void aProfileChangeInvalidatesAnOptionFromThePreviousView() throws Exception {
        chooseProfile("GK");
        Option oldChoice = option(EXTENSION_SELECT, "B");
        changeProfile("LK");
        assertThat(plan().stageId()).isEqualTo("extensions");
        assertThatThrownBy(() -> apply(oldChoice)).isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        assertThat(storedSelection().isMissingNode()).isTrue();
    }

    @Test
    void aNormalAuthoredStageCanFollowExtensions() throws Exception {
        var stages = new ArrayList<>(root.getPersonalizationFlow().getStages());
        stages.add(json.readValue("""
                {"id":"studyPace","order":40,"label":"Lerntempo","groups":[{
                  "id":"studyPace","order":1,"label":"Lerntempo","minSelections":1,"maxSelections":1,
                  "source":{"kind":"scopeValues","landscapeId":"%s","scopeKey":"pace",
                            "values":[{"value":"regular","label":"Regulär"}]}}]}
                """.formatted(subject.getLandscapeId()), PersonalizationStage.class));
        root.getPersonalizationFlow().setStages(stages);
        chooseProfile("GK");
        apply(option(EXTENSION_MAXIMUM, null));
        assertThat(plan().stageId()).isEqualTo("studyPace");
        apply(plan().options().getFirst());
        assertThat(plan().required()).isFalse();
        assertThat(storedSelection().asText()).isEqualTo("maximum");
    }

    @Test
    void anOrdinaryFlowWithoutAnExtensionsStageAsksNoNewQuestion() throws Exception {
        root.getPersonalizationFlow().setStages(root.getPersonalizationFlow().getStages().stream()
                .filter(stage -> !"extensions".equals(stage.getId())).toList());
        for (String version : List.of("1", "2")) {
            root.getPersonalizationFlow().setVersion(version);
            learner.setPersonalCurriculum("{}");
            chooseSubjectStageAndProfile("GK");
            assertThat(plan().stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
            assertThat(json.valueToTree(plan()).has("extensionStage")).isFalse();
            assertThat(storedSelection().isMissingNode()).isTrue();
        }
    }

    @Test
    void extensionsBeforeSubjectProfileAreInvalid() {
        root.getPersonalizationFlow().getStages().stream()
                .filter(stage -> "extensions".equals(stage.getId())).findFirst().orElseThrow().setOrder(19);
        assertThat(plan().problemCode()).isEqualTo("personalization-extension-stage-invalid");
    }

    @Test
    void versionOneRejectsTheExtensionsStage() {
        root.getPersonalizationFlow().setVersion("1");
        assertThat(plan().problemCode()).isEqualTo("personalization-extension-stage-invalid");
    }

    private void chooseProfile(String profile) {
        chooseSubjectStageAndProfile(profile);
        assertThat(plan().stageId()).isEqualTo("extensions");
    }

    private void chooseSubjectStageAndProfile(String profile) {
        apply(plan().options().getFirst());
        assertThat(plan().stageId()).isEqualTo("stage");
        apply(plan().options().getFirst());
        assertThat(plan().stageId()).isEqualTo("subjectProfile");
        apply(plan().options().stream().filter(o -> profile.equals(o.filterId())).findFirst().orElseThrow());
    }

    private void changeProfile(String profile) throws Exception {
        Map<String, Object> existing = json.readValue(learner.getPersonalCurriculum(), new TypeReference<>() {});
        existing.remove(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY);
        existing.put(subject.getLandscapeId(), Map.of("selected", true, "filterId", profile));
        service.setPersonalCurriculum(LEARNER, existing, List.of(), List.of());
    }

    private JsonNode storedSelection() throws Exception {
        return json.readTree(learner.getPersonalCurriculum()).path(subject.getLandscapeId()).path("extensionSelection");
    }

    private PersonalizationPlan plan() {
        return service.getPersonalizationPlan(LEARNER);
    }

    private Option option(OptionKind kind, String value) {
        return plan().options().stream().filter(o -> o.kind() == kind && Objects.equals(value, o.scopeValue()))
                .findFirst().orElseThrow();
    }

    private void apply(Option option) {
        service.patchPersonalCurriculum(LEARNER, null, List.of(), List.of(), option.optionId());
    }
}
