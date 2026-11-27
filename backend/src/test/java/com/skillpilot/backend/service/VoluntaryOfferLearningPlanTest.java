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
    @Autowired CompositionViewService views;
    private String learnerId;

    @BeforeEach
    void selectHessianPhysics() throws Exception {
        Learner learner = new Learner();
        learnerId = "voluntary-plan-" + UUID.randomUUID();
        learner.setSkillpilotId(learnerId);
        selectPhysics(learner, "DE-HE", "GK");
    }

    private void selectPhysics(Learner learner, String jurisdiction, String course) throws Exception {
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", jurisdiction, "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", course),
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

    @Test
    void anOfferRootDoesNotAddAnAtomMissingFromTheCapture() {
        var captured = block(List.of(TEMPERATURE, ARROW), List.of(TEMPERATURE));
        var plan = save(0, captured);
        assertThat(plan.blocks()).containsExactly(captured);
        assertThat(plan.learningScope().goalIds()).containsExactly(TEMPERATURE);
    }

    @Test
    void captureNormalizesWhitespaceAroundAnExplicitOffer() {
        String submitted = " " + ARROW + " ";
        var plan = save(0, block(List.of(submitted), List.of(submitted)));
        assertThat(plan.blocks()).containsExactly(block(List.of(ARROW), List.of(ARROW)));
        assertThat(plan.learningScope().goalIds()).containsExactly(ARROW);
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
            assertThat(detail.nextEligibleGoal()).isNotNull();
            assertThat(detail.nextEligibleGoal().goalId()).isEqualTo(INTRO);
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

    @ParameterizedTest
    @ValueSource(strings = {"composition:" + VIEW + ":structure:qualified", "e41356c1-968b-435a-af25-b663f080ae5a"})
    void historicalFocusCanResolveAnOfferViaAQualifiedSectionReferenceOrCanonicalCluster(String focus) throws Exception {
        var original = save(0, block(List.of(MASS), List.of(MASS)));
        var historical = block(List.of(focus), List.of(MASS));
        var row = rows.findById(original.planId()).orElseThrow();
        row.setBlocksJson(mapper.writeValueAsString(List.of(historical)));
        rows.saveAndFlush(row);

        assertThat(learners.resolveLearningPlanGoalIds(learnerId, PHYSICS, List.of(focus))).isEmpty();
        var detail = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.blocks()).containsExactly(block(List.of(focus), List.of()));

        var archive = learners.exportLearner(learnerId);
        assertThat(archive.data().learningPlans().getFirst().blocks()).containsExactly(historical);
        learners.importLearner(learnerId, archive);
        assertThat(plans.getPlan(learnerId, PHYSICS, THURSDAY).blocks()).isEqualTo(detail.blocks());
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).containsExactly(historical);
    }

    @Test
    void historicalImplicitOfferDoesNotConstrainScheduleOrSignedRestore() throws Exception {
        selectPhysics(learners.getLearner(learnerId), "DE-HE", "GK+LK");
        var view = views.findLearnerScopeView(PHYSICS, Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE",
                "stage", "SekII", "durationModel", "G9", "courseProfile", "GK+LK"));
        String optional = "composition:" + view.get("viewId") + ":structure:optional";
        assertThat(learners.getPlanningScope(learnerId, PHYSICS).scopeAtomicGoalIds())
                .contains(ARROW).doesNotContain(ARROW_TASK);

        var original = save(0, block(List.of(ARROW), List.of(ARROW)));
        var early = block(List.of(optional), List.of(ARROW_TASK));
        var friday = THURSDAY.plusDays(1);
        var later = new LearnerLearningPlanApi.Block("arrows", "learning", ARROW, "Pfeile",
                friday, friday, null, List.of(ARROW), List.of(ARROW), true);
        var capture = List.of(early, later);
        // The captured relation now runs backwards. It is irrelevant to today's plan
        // because only the first block's implicit offer has that prerequisite.
        assertThatThrownBy(() -> learners.orderLearningPlanBlocksByPrerequisites(learnerId, capture))
                .isInstanceOf(ResponseStatusException.class);
        var row = rows.findById(original.planId()).orElseThrow();
        String json = mapper.writeValueAsString(capture);
        row.setBlocksJson(json);
        rows.saveAndFlush(row);

        var detail = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.learningScope().goalIds()).containsExactly(ARROW);
        assertThat(detail.blocks()).containsExactly(block(List.of(optional), List.of()), later);
        assertThat(row.getBlocksJson()).isEqualTo(json);
        assertThat(row.getRevision()).isEqualTo(original.revision());

        var archive = learners.exportLearner(learnerId);
        learners.importLearner(learnerId, archive);
        var restored = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(restored.stale()).isFalse();
        assertThat(restored.blocks()).isEqualTo(detail.blocks());
        assertThat(learners.exportLearner(learnerId).data().learningPlans().getFirst().blocks()).isEqualTo(capture);
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
        assertThatThrownBy(() -> save(0, block(List.of(OPTIONAL), List.of(ARROW_TASK))))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("no currently open atomic goals");
        assertThat(rows.findByLearner_SkillpilotIdAndLandscapeId(learnerId, PHYSICS)).isEmpty();
    }

    @Test
    void historicalPlanWhoseSubjectHasOnlyOffersHasNoOrdinaryContinuation() throws Exception {
        var original = save(0, block(List.of(ARROW), List.of(ARROW)));
        String offerSection = "composition:test-physics-voluntary-only:structure:offers";
        var row = rows.findById(original.planId()).orElseThrow();
        row.setBlocksJson(mapper.writeValueAsString(List.of(block(List.of(offerSection), List.of(ARROW)))));
        rows.saveAndFlush(row);
        selectPhysics(learners.getLearner(learnerId), "DE-NW", "GK");

        var detail = plans.getPlan(learnerId, PHYSICS, THURSDAY);
        assertThat(detail.stale()).isFalse();
        assertThat(detail.blocks()).containsExactly(block(List.of(offerSection), List.of()));
        assertThat(detail.learningScope()).isNull();
        assertThat(detail.nextEligibleGoal()).isNull();
        assertThatThrownBy(() -> learners.getPlanningScope(learnerId, PHYSICS))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
    }

    @Test
    void newPausedPlanRequiresAnAtomOrAnAssignment() {
        var implicit = block(List.of(OPTIONAL), List.of(ARROW_TASK)).withActive(false);
        assertThatThrownBy(() -> save(0, implicit))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("no currently open atomic goals");
        assertThat(rows.findByLearner_SkillpilotIdAndLandscapeId(learnerId, PHYSICS)).isEmpty();
    }

    @Test
    void newPausedPlanCanKeepExplicitWork() {
        var explicit = block(List.of(ARROW_TASK), List.of(ARROW_TASK)).withActive(false);
        var plan = save(0, explicit);
        assertThat(plan.stale()).isFalse();
        assertThat(plan.blocks()).containsExactly(explicit);
        assertThat(plan.nextEligibleGoal()).isNull();
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
