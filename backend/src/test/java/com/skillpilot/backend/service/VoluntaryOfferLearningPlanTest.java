package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
class VoluntaryOfferLearningPlanTest {
    private static final LocalDate THURSDAY = LocalDate.of(2026, 11, 26);

    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LearnerLearningPlanRepository rows;
    @Autowired ObjectMapper mapper;
    private String learnerId;

    @BeforeEach
    void selectHessianPhysics() throws Exception {
        Learner learner = new Learner();
        learnerId = "voluntary-plan-" + UUID.randomUUID();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learnerRepository.saveAndFlush(learner);
    }

    @Test
    void sectionCountsRegularWorkAndOnlyAnExplicitAtomAddsTheOfferToThePlan() {
        var masteryBefore = learners.getMastery(learnerId);
        var regularSubject = learners.getPlanningScope(learnerId, PHYSICS).scopeAtomicGoalIds();
        assertThat(regularSubject).contains(TEMPERATURE).doesNotContain(ARROW, ARROW_TASK, MASS);
        var section = learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, List.of(MIXED));
        assertThat(section).contains(TEMPERATURE).doesNotContain(ARROW, ARROW_TASK, MASS);
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, List.of(OPTIONAL))).isEmpty();
        assertThat(learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, List.of(ARROW))).containsExactly(ARROW);
        var withArrow = learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, List.of(MIXED, ARROW));
        assertThat(withArrow).containsExactlyInAnyOrderElementsOf(
                java.util.stream.Stream.concat(section.stream(), java.util.stream.Stream.of(ARROW)).toList());

        var implicit = save(0, block(List.of(MIXED), withArrow));
        assertThat(implicit.learningScope().goalIds()).containsExactlyInAnyOrderElementsOf(section);
        var explicit = save(implicit.revision(), block(List.of(MIXED, ARROW), withArrow));
        assertThat(explicit.learningScope().goalIds()).containsExactlyInAnyOrderElementsOf(withArrow);
        assertThat(explicit.learningScope().targetGoalCount()).isEqualTo(section.size() + 1);
        assertThat(learners.getPlanningScope(learnerId, PHYSICS).scopeAtomicGoalIds()).isEqualTo(regularSubject);
        assertThat(learners.getMastery(learnerId)).isEqualTo(masteryBefore);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void historicalPlanReadsTheCapturedSelectionUnderTheCurrentRole(boolean explicitlySelected) throws Exception {
        var original = save(0, block(List.of(ARROW_TASK), List.of(ARROW_TASK)));
        var roots = explicitlySelected ? List.of(OPTIONAL, ARROW_TASK) : List.of(OPTIONAL);
        var historical = block(roots, List.of(ARROW_TASK));
        var row = rows.findById(original.planId()).orElseThrow();
        String captured = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(List.of(historical));
        row.setBlocksJson(captured);
        rows.saveAndFlush(row);

        var detail = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.blocks().getFirst().atomicGoalIds()).isEqualTo(explicitlySelected ? List.of(ARROW_TASK) : List.of());
        if (explicitlySelected) {
            assertThat(detail.learningScope().goalIds()).containsExactly(ARROW_TASK);
        } else {
            assertThat(detail.learningScope()).isNull();
            assertThat(detail.nextEligibleGoal()).isNull();
        }
        var archive = learners.exportLearner(learnerId);
        assertThat(archive.data().learningPlans().getFirst().blocks()).containsExactly(historical);
        var afterRead = rows.findById(original.planId()).orElseThrow();
        assertThat(afterRead.getRevision()).isEqualTo(original.revision());
        assertThat(afterRead.getBlocksJson()).isEqualTo(captured);

        learners.importLearner(learnerId, archive);
        var restored = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(detail.blocks());
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).containsExactly(historical);
    }

    @Test
    void legacyIndividualAtomListKeepsItsOfferThroughSignedRestore() {
        var individual = new LearnerLearningPlanApi.Block("arrow", "learning", null, "Pfeile",
                THURSDAY, THURSDAY, null, List.of(ARROW), null, true);
        var plan = save(0, individual);
        assertThat(plan.learningScope().goalIds()).containsExactly(ARROW);
        assertThat(plan.blocks()).containsExactly(individual);
        var backup = learners.exportLearner(learnerId);
        learners.importLearner(learnerId, backup);
        var restored = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.learningScope().goalIds()).containsExactly(ARROW);
        assertThat(restored.blocks()).containsExactly(individual);
    }

    @Test
    void historicallyDeduplicatedOfferMovesToTheLaterBlockThatChoseItExplicitly() throws Exception {
        var original = save(0, block(List.of(MIXED), List.of(TEMPERATURE)));
        var implicit = block(List.of(MIXED), List.of(TEMPERATURE, ARROW));
        var friday = THURSDAY.plusDays(1);
        var later = new LearnerLearningPlanApi.Block("arrow", "learning", ARROW, "Pfeile",
                friday, friday, null, List.of(), List.of(ARROW), true);
        var row = rows.findById(original.planId()).orElseThrow();
        String captured = mapper.writeValueAsString(List.of(implicit, later));
        row.setBlocksJson(captured);
        rows.saveAndFlush(row);

        var detail = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.blocks()).extracting(LearnerLearningPlanApi.Block::atomicGoalIds)
                .containsExactly(List.of(TEMPERATURE), List.of(ARROW));
        assertThat(row.getBlocksJson()).isEqualTo(captured);
        assertThat(row.getRevision()).isEqualTo(original.revision());
    }

    @Test
    void newOfferOnlySectionDoesNotCreateAnEmptyPlan() {
        assertThatThrownBy(() -> save(0, block(List.of(OPTIONAL), List.of(ARROW_TASK, MASS))))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("no currently open atomic goals");
        assertThat(rows.findByLearner_SkillpilotIdAndLandscapeId(learnerId, PHYSICS)).isEmpty();
    }

    private LearnerLearningPlanApi.PlanDetail save(long revision, LearnerLearningPlanApi.Block block) {
        return plans.upsert(learnerId, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(revision,
                "Physik", List.of(block)), THURSDAY);
    }

    private static LearnerLearningPlanApi.Block block(List<String> roots, List<String> atoms) {
        return new LearnerLearningPlanApi.Block("physics", "learning", roots.getFirst(), "Physik",
                THURSDAY, THURSDAY, null, atoms, roots, true);
    }
}
