package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
@Transactional
class VoluntaryOfferFrontierTest {
    @Autowired LearnerService learners;
    @Autowired CoachToolFacade coachTools;
    @Autowired LearnerRepository rows;
    @Autowired MasteryRepository mastery;
    @Autowired ObjectMapper json;
    @Autowired CompositionViewService views;
    private Object previousPilot;

    @BeforeEach
    void rememberAssessmentPilot() {
        previousPilot = ReflectionTestUtils.getField(learners, "unitAssessmentPilotEnabled");
    }

    @AfterEach
    void restoreAssessmentPilot() {
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", previousPilot);
    }

    private Learner learner(boolean autoPilot, boolean math) throws Exception {
        return learner(autoPilot, math, "DE-HE");
    }

    private Learner learner(boolean autoPilot, boolean math, String state) throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("optional-frontier-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        var selection = new LinkedHashMap<String, Object>();
        selection.put(ROOT, Map.of("selected", true, "filterId", state, "stage", "SekII", "durationModel", "G9"));
        selection.put(PHYSICS, Map.of("selected", true, "filterId", "GK"));
        selection.put(MATH, Map.of("selected", math, "filterId", "GK"));
        selection.put("__skillpilot_stage_scope_sek2__", Map.of("selected", true));
        selection.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(json.writeValueAsString(selection));
        learner.setAutoPilot(autoPilot);
        learner.setStrictMode(false);
        return rows.saveAndFlush(learner);
    }

    private void pass(String id, String goal) {
        learners.setActiveGoal(id, goal);
        learners.setMastery(id, new MasteryUpdateRequest(Map.of(goal, 1.0), goal));
    }

    @ParameterizedTest
    @CsvSource({"false,false", "false,true", "true,false", "true,true"})
    void regularWorkDoesNotChooseAnOfferAndTheLearnerCanChooseItInChat(boolean autoPilot, boolean assessmentPilot) throws Exception {
        ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", assessmentPilot);
        var learner = learner(autoPilot, false);
        String id = learner.getSkillpilotId();
        learners.setPlannedGoals(id, Set.of(MIXED));
        pass(id, INTRO);
        // Temperature already has a regular completion waiver in this minimal view.
        assertThat(learners.getFrontier(id)).contains(ARROW).doesNotContain(TEMPERATURE, MASS, ARROW_TASK);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED)))
                .filteredOn(goal -> goal.id().equals(ARROW)).singleElement().matches(FrontierGoal::voluntaryStudy);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED)))
                .filteredOn(goal -> goal.id().equals(TEMPERATURE)).singleElement().matches(goal -> !goal.voluntaryStudy());
        var coach = learners.getCoachLearnerState(id);
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isNotEqualTo(ARROW);
        if (autoPilot && TEMPERATURE.equals(learner.getActiveGoalId())) pass(id, TEMPERATURE);
        if (!autoPilot) assertThat(coach.frontier()).extracting(FrontierGoal::id).contains(ARROW);
        assertThatThrownBy(() -> learners.setMastery(id, new MasteryUpdateRequest(Map.of(ARROW, 1.0), ARROW)))
                .isInstanceOf(ResponseStatusException.class);
        var chosen = coachTools.setActiveGoal(id, new ActiveGoalRequest(ARROW, true));
        assertThat(chosen.activeGoal()).isNotNull();
        assertThat(chosen.activeGoal().id()).isEqualTo(ARROW);
        learners.getCoachLearnerState(id);
        assertThat(rows.findById(id).orElseThrow().getActiveGoalId()).isEqualTo(ARROW);
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
        learners.setMastery(id, new MasteryUpdateRequest(Map.of(ARROW, 1.0), ARROW));
        assertThat(learners.getMastery(id)).containsEntry(ARROW, 1.0);
        assertThat(learners.getPlanningScope(id, PHYSICS).scopeAtomicGoalIds()).doesNotContain(ARROW);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void anOfferRequiresEvidenceEvenWhenTheLearnerTurnsOffStrictMode(boolean mathematics) throws Exception {
        var learner = learner(false, mathematics);
        String id = learner.getSkillpilotId();
        learners.setPlannedGoals(id, Set.of(MIXED));
        pass(id, INTRO);
        learners.setPlannedGoals(id, Set.of(MASS));
        assertThat(learners.getFrontier(id)).doesNotContain(MASS);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MASS))).extracting(FrontierGoal::id)
                .doesNotContain(MASS);
        assertThatThrownBy(() -> learners.setActiveGoal(id, MASS)).isInstanceOf(ResponseStatusException.class);
        assertThat(learners.getMastery(id)).doesNotContainKeys(MASS, NUMBER_LINE);
        if (!mathematics) {
            assertThat(learners.getFrontier(id)).doesNotContain(NUMBER_LINE);
            assertThat(learners.getPlanningScope(id, PHYSICS).scopeAtomicGoalIds()).doesNotContain(NUMBER_LINE);
            return;
        }
        var mathematicsTargets = learners.getPlanningScope(id, MATH).scopeAtomicGoalIds();
        assertThat(mathematicsTargets).contains(NUMBER_LINE);
        // The learner brings verifiable Mathematics results from earlier study.
        // A goal being waived for certification supplies no mastery for this offer.
        mathematicsTargets.forEach(goal -> mastery.save(new Mastery(learner, goal, 1.0)));
        mastery.flush();
        assertThat(learners.getMastery(id)).containsEntry(NUMBER_LINE, 1.0);
        assertThat(learners.getFrontier(id)).contains(MASS);
        assertThat(learners.getPlanningScope(id, PHYSICS).scopeAtomicGoalIds()).doesNotContain(MASS);
    }

    @Test
    void onlyEligibleOffersAppearInTheOfferOnlySectionAndItsPlaceCanBeRead() throws Exception {
        var learner = learner(false, false);
        String id = learner.getSkillpilotId();
        learners.setPlannedGoals(id, Set.of(MIXED));
        pass(id, INTRO);
        learners.setPlannedGoals(id, Set.of(ARROW_TASK));
        assertThat(learners.getFrontier(id)).contains(ARROW).doesNotContain(ARROW_TASK, MASS);
        pass(id, ARROW);
        learners.setPlannedGoals(id, Set.of(OPTIONAL));
        assertThat(learners.getFrontier(id)).contains(ARROW_TASK).doesNotContain(ARROW, MASS, TEMPERATURE);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(OPTIONAL)))
                .filteredOn(goal -> goal.id().equals(ARROW_TASK)).singleElement().matches(FrontierGoal::voluntaryStudy);
        assertThat(views.findStudyRootScopeOptions(VIEW)).extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .contains(OPTIONAL);
    }
    @Test
    void selectedSubjectCanConsistEntirelyOfOffersWithoutCreatingAnyRequiredWork() throws Exception {
        var learner = learner(false, false, "DE-NI");
        String id = learner.getSkillpilotId();
        assertThatThrownBy(() -> learners.getPlanningScope(id, PHYSICS)).isInstanceOf(ResponseStatusException.class);
        assertThat(learners.getPersonalCurriculumAtomicTargetsByLandscape(id).getOrDefault(PHYSICS, List.of())).isEmpty();
        assertThat(learners.getPersonalCurriculumSubjectIds(id)).contains(PHYSICS);
        assertThat(learners.getPersonalCurriculumSubjectFrontier(id, PHYSICS)).isEmpty();
        String placement = "composition:physics-ni-gk:structure:mechanics";
        learners.setPlannedGoals(id, Set.of(placement));
        assertThat(learners.getPlannedGoals(id)).contains(placement);
        assertThat(learners.getFrontier(id)).doesNotContain(ARROW, MASS, INTRO);
        assertThat(learners.getMastery(id)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void explicitlyChosenOfferPassesThroughItsRealUnitOpeningWhenGuidanceIsEnabled(boolean guided) throws Exception {
        var learner = learner(false, false, "DE-BW");
        String id = learner.getSkillpilotId();
        String opening = "70b358bf-da6d-53ba-8393-51d5c2365b04";
        String placement = "composition:physics-bw-gk:structure:mechanics";
        var previous = ReflectionTestUtils.getField(learners, "unitLearningMaterialService");
        var materials = mock(UnitLearningMaterialService.class);
        if (guided) when(materials.orientationBindings(anyCollection()))
                .thenReturn(List.of(new UnitLearningMaterialService.OrientationBinding(PHYSICS, "physics-bw-gk",
                        "mechanics", opening, List.of())));
        ReflectionTestUtils.setField(learners, "unitLearningMaterialService", materials);
        try {
            mastery.saveAndFlush(new Mastery(learner, INTRO, 1.0));
            learners.setPlannedGoals(id, Set.of(placement));
            // Mathematics has no learning place here, even if an opening could otherwise be started.
            assertThatThrownBy(() -> learners.setActiveGoal(id, MASS)).isInstanceOf(ResponseStatusException.class);
            assertThat(learner.getActiveGoalId()).isNull();
            learners.setActiveGoal(id, ARROW);
            var read = rows.findById(id).orElseThrow();
            assertThat(read.getActiveGoalId()).isEqualTo(guided ? opening : ARROW);
            if (guided) {
                learners.setMastery(id, new MasteryUpdateRequest(Map.of(opening, 1.0), opening));
                assertThat(read.getActiveGoalId()).isEqualTo(ARROW);
                assertThat(learners.getMastery(id)).containsEntry(opening, 1.0);
            }
            assertThat(learners.getMastery(id)).doesNotContainKeys(ARROW, MASS);
            assertThat(learners.getPlanningScope(id, PHYSICS).scopeAtomicGoalIds()).doesNotContain(ARROW);
        } finally {
            ReflectionTestUtils.setField(learners, "unitLearningMaterialService", previous);
        }
    }

}
