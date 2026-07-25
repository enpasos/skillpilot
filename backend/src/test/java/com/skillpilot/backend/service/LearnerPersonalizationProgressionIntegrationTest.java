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
    private LearnerRepository learnerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void appliesEachCurrentStageAtomicallyBeforeAcceptingTheDescendantFilter() throws Exception {
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

        var afterSubjectSelection = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                null);

        JsonNode afterSubjectConfig = persistedConfig(learner.getSkillpilotId());
        assertThat(afterSubjectConfig.path(ROOT_ID).path("filterId").asText())
                .isEqualTo("DE-HE");
        assertThat(afterSubjectConfig.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(afterSubjectConfig.path(MATH_ID).has("filterId")).isFalse();
        assertThat(afterSubjectConfig.size()).isEqualTo(2);
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
        assertThat(afterCourseConfig.path(MATH_ID).path("filterId").asText())
                .isEqualTo("LK");
        assertThat(afterCourseConfig.has(BIOLOGY_ID)).isFalse();
        assertThat(afterCourseProfile.activeFilters()).contains("DE-HE", "LK");
        assertThat(afterCourseProfile.stateMachine().requiredAction())
                .isNotEqualTo("setPersonalization");
        assertThat(afterCourseProfile.frontier()).isNotEmpty();
        assertThat(afterCourseProfile.stateMachine().goalOptions()).isNotEmpty();
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

        var afterSubjectSelection = applyCurrentValueOption(
                learner.getSkillpilotId(),
                MATH_ID,
                null);

        JsonNode selectedSubject = persistedConfig(learner.getSkillpilotId());
        assertThat(selectedSubject.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
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
        assertThat(persisted.path(ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persisted.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.path(MATH_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persisted.has(BIOLOGY_ID)).isFalse();
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
    void rejectsMutationAfterPersonalizationIsCompleteAndPreservesCockpitConfiguration() throws Exception {
        Learner learner = createLearner(
                "explicit-multi-subject-personalization",
                Map.of(
                        ROOT_ID, Map.of("selected", true, "filterId", "DE-HE"),
                        MATH_ID, Map.of("selected", true, "filterId", "GK"),
                        BIOLOGY_ID, Map.of("selected", true, "filterId", "GK")));
        JsonNode beforeMutation = persistedConfig(learner.getSkillpilotId());

        assertConflict(() -> learnerService.patchPersonalCurriculum(
                learner.getSkillpilotId(),
                Map.of(),
                List.of(MATH_ID),
                List.of("LK")));

        JsonNode persisted = persistedConfig(learner.getSkillpilotId());
        assertThat(persisted).isEqualTo(beforeMutation);
        assertThat(persisted.path(MATH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persisted.path(MATH_ID).path("filterId").asText()).isEqualTo("GK");
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
