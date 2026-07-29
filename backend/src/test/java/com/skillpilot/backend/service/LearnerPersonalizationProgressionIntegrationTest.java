package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.List;
import java.util.Map;
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

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private CompositionViewService compositionViewService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ObjectMapper objectMapper;

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
        assertThat(afterCourseProfile.frontier()).isNotEmpty();
        assertThat(afterCourseProfile.stateMachine().goalOptions()).isNotEmpty();

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
