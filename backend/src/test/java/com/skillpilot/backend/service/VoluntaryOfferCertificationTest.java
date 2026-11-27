package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.ARROW;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.ARROW_TASK;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.INTRO;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.PHYSICS;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.ROOT;
import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.TEMPERATURE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doReturn;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.completion.CompiledCompletionProfile;
import com.skillpilot.backend.completion.UnitAssessmentContract;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(properties = "skillpilot.completion.unit-assessment-pilot-enabled=true")
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
@Transactional
class VoluntaryOfferCertificationTest {
    private static final String VIEW = "test-physics-voluntary-certification";
    private static final String NODE = "thermal-expansion";
    private static final String SECTION = "composition:" + VIEW + ":structure:" + NODE;
    private static final String EXPANSION = "b60f63b6-e70b-5557-9f54-86d42fa80325";
    private static final String EXPANSION_TASK = "44ada28b-8635-5481-8d09-2d91686d352b";
    private static final LocalDate DAY = LocalDate.of(2026, 11, 27);

    @Autowired LearnerService learners;
    @Autowired LearnerRepository rows;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LandscapeService landscapes;
    @Autowired VerifiedExamPassService exams;
    @Autowired ObjectMapper mapper;
    @MockitoSpyBean UnitLearningMaterialService unitMaterials;

    @Test
    void explicitWorkCountsOnlyInItsPlanWithTheSameCompiledProfileAndEarnedUnitQualification() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId("voluntary-certification-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-TH", "stage", "CrossStage"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek1__", Map.of("selected", true),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        rows.saveAndFlush(learner);
        String learnerId = learner.getSkillpilotId();
        registerUnitWithPassedVersionedAssessment(learnerId);

        var baseline = save(learnerId, 0, List.of(SECTION));
        var subject = learners.getPlanningScope(learnerId, PHYSICS).scopeAtomicGoalIds();
        var required = learners.getLearningPlanCompletionContext(learnerId).requiredRegularGoalIds();
        var compiled = compiledSection(learner);
        var qualification = learners.getUnitAssignmentOptions(learnerId, PHYSICS);
        assertThat(subject).contains(TEMPERATURE, EXPANSION, EXPANSION_TASK).doesNotContain(ARROW, ARROW_TASK);
        assertThat(required).containsExactly(EXPANSION);
        assertThat(compiled.targetGoalIds()).contains(TEMPERATURE, EXPANSION, EXPANSION_TASK).doesNotContain(ARROW, ARROW_TASK);
        assertThat(compiled.requiredAssessmentGoalIds()).containsExactly(EXPANSION_TASK);
        assertThat(qualification).singleElement().satisfies(unit -> {
            assertThat(unit.passed()).isTrue();
            assertThat(unit.parts()).extracting(LearnerLearningPlanApi.UnitAssignmentPart::goalId).containsExactly(EXPANSION_TASK);
        });

        var explicit = save(learnerId, baseline.revision(), List.of(SECTION, ARROW, ARROW_TASK));
        assertThat(explicit.learningScope().goalIds()).contains(ARROW, ARROW_TASK)
                .containsAll(baseline.learningScope().goalIds());
        assertThat(explicit.learningScope().targetGoalCount()).isEqualTo(baseline.learningScope().targetGoalCount() + 2);
        assertThat(learners.getPlanningScope(learnerId, PHYSICS).scopeAtomicGoalIds()).isEqualTo(subject);
        assertThat(learners.getLearningPlanCompletionContext(learnerId).requiredRegularGoalIds()).isEqualTo(required);
        var after = compiledSection(learner);
        assertThat(after.targetGoalIds()).isEqualTo(compiled.targetGoalIds());
        assertThat(after.requiredAssessmentGoalIds()).isEqualTo(compiled.requiredAssessmentGoalIds());
        assertThat(after.protectedGoalIds()).isEqualTo(compiled.protectedGoalIds());
        assertThat(learners.getUnitAssignmentOptions(learnerId, PHYSICS)).isEqualTo(qualification);
    }

    private void registerUnitWithPassedVersionedAssessment(String learnerId) {
        var exam = landscapes.getGoalDefinition(EXPANSION_TASK).getExamData();
        var revision = AssessmentMaterialRevision.of(exam);
        var contract = new UnitAssessmentContract("test-expansion-unit", List.of(VIEW),
                List.of(new UnitAssessmentContract.Part(EXPANSION_TASK, revision)), List.of(EXPANSION), List.of());
        var assessment = new UnitLearningMaterialService.AssessmentBinding(PHYSICS, VIEW, NODE, contract);
        var opening = new UnitLearningMaterialService.OrientationBinding(PHYSICS, VIEW, NODE, INTRO, List.of());
        var exercise = new UnitLearningMaterialService.Exercise(null, null, true);
        var materials = new UnitLearningMaterialService.Material(null, EXPANSION_TASK, INTRO, Map.of(),
                Map.of(EXPANSION, exercise, ARROW, exercise), contract, null, List.of());
        doReturn(List.of(assessment)).when(unitMaterials).assessmentBindings(argThat(views -> views.contains(VIEW)));
        doReturn(List.of(opening)).when(unitMaterials).orientationBindings(argThat(views -> views.contains(VIEW)));
        doReturn(Optional.of(assessment)).when(unitMaterials).assessmentBindingForReference(SECTION);
        doReturn(Optional.of(materials)).when(unitMaterials).find(PHYSICS, VIEW, NODE);
        var scoring = exam.getScoring();
        exams.record(learnerId, EXPANSION_TASK, revision, scoring.getPassingPoints(), scoring.getMaxPoints(), scoring.getPassingPoints());
    }

    private LearnerLearningPlanApi.PlanDetail save(String learnerId, long revision, List<String> roots) {
        var ids = learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, roots);
        var block = new LearnerLearningPlanApi.Block("expansion", "learning", SECTION, "Thermische Ausdehnung",
                DAY, DAY, null, ids, roots, true);
        return plans.upsert(learnerId, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(revision,
                "Physik", List.of(block)), DAY);
    }

    private CompiledCompletionProfile compiledSection(Learner learner) {
        var target = org.springframework.test.util.AopTestUtils.getUltimateTargetObject(learners);
        Object projection = ReflectionTestUtils.invokeMethod(target, "getGoalProjection", ROOT, learner.getPersonalCurriculum());
        Map<?, ?> graph = ReflectionTestUtils.invokeMethod(target, "completionGraph", learner, projection);
        return ReflectionTestUtils.invokeMethod(target, "compileCompletionScope", learner, "automatic:" + SECTION, projection, graph);
    }
}
