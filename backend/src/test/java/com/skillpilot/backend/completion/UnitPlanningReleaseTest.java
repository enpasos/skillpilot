package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UnitPlanningReleaseTest {
    @Test void planningCreditRequiresEachOwnAssessmentAndItsCurrentCoverageReview() throws Exception {
        var mapper = new ObjectMapper();
        var curricula = Path.of("../curricula");
        var materials = com.skillpilot.backend.service.UnitLearningMaterialService.fromRepository(curricula, mapper);
        var contract = materials.assessmentBindingForReference("composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion")
                .orElseThrow().contract();
        var rule = contract.planningCredits().getFirst();
        var release = rule.release();
        var landscape = mapper.readValue(curricula.resolve("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile(), SkillLandscape.class);
        var unit = landscape.getProgramUnits().stream().filter(u -> release.ownerUnitId().equals(u.getId())).findFirst().orElseThrow();
        var c = rule.requiredPartIds().getFirst();
        var placement = landscape.getGoalPlacements().stream().filter(p -> p.isOwnership() && c.equals(p.getGoalId())).findFirst().orElseThrow();
        var coverage = unit.getCoverageReviews().stream().filter(r -> c.equals(r.getAssessmentGoalId())).findFirst().orElseThrow();

        assertThat(release.hasReviewedOwnership(landscape, contract, rule)).isTrue();
        placement.setUnitId("another-unit");
        assertThat(release.hasReviewedOwnership(landscape, contract, rule)).isFalse();
        placement.setUnitId(unit.getId());
        String reviewedRubric = coverage.getRubricRevision();
        coverage.setRubricRevision("earlier-rubric");
        assertThat(release.hasReviewedOwnership(landscape, contract, rule)).isFalse();
        coverage.setRubricRevision(reviewedRubric);
        coverage.setGoalIds(List.of());
        assertThat(release.hasReviewedOwnership(landscape, contract, rule)).isFalse();
    }

    @Test void absentReviewDigestDisablesTheReleaseWithoutRejectingTheUnitMaterial() throws Exception {
        var mapper = new ObjectMapper();
        var materials = com.skillpilot.backend.service.UnitLearningMaterialService.fromRepository(Path.of("../curricula"), mapper);
        var valid = materials.assessmentBindingForReference("composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion")
                .orElseThrow().contract().planningCredits().getFirst().release();
        var incomplete = new UnitPlanningRelease(valid.schemaVersion(), valid.revision(), valid.ownerUnitId(),
                valid.ownerRevision(), valid.viewIds(), new UnitPlanningRelease.Review(valid.review().path(), null),
                valid.goalDefinitions(), valid.fingerprint());
        assertThat(materials.isReviewedPlanningRelease(valid)).isTrue();
        assertThat(materials.isReviewedPlanningRelease(incomplete)).isFalse();
        assertThat(materials.assessmentBindingForReference("composition:de-he-gym-sekii-physics-gk:structure:physics-q4"))
                .isEmpty();
    }
    @Test void matchesTheIndependentAuthoringDigestAndRejectsChangedMeaningsAndViews() throws Exception {
        var mapper = new ObjectMapper();
        var curricula = Path.of("../curricula");
        var unit = mapper.readTree(curricula.resolve("DE/Gymnasium/materials/physics/he-e1-motion-practice.json").toFile()).required("unit");
        var contract = mapper.treeToValue(unit.required("assessmentContract"), UnitAssessmentContract.class);
        var rule = contract.planningCredits().getFirst();
        var release = rule.release();
        assertThat(release.calculateFingerprint(unit.required("landscapeId").asText(),
                unit.required("compositionNodeId").asText(), contract, rule))
                .isEqualTo("sha256:d795236680087accef0ab60ed4d4257bbf651d83f8f2a5fc3dbbc5e28d9a96ba");
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        for (var source : mapper.readTree(curricula.resolve("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile()).required("goals")) {
            if (rule.goalIds().contains(source.required("id").asText())) {
                var goal = mapper.treeToValue(source, LearningGoal.class);
                goals.put(goal.getId(), goal);
                assertThat(UnitPlanningRelease.definitionFingerprint(goal)).as(goal.getId())
                        .isEqualTo(release.goalDefinitions().get(goal.getId()).definition());
            }
        }
        assertThat(release.valid(unit.required("landscapeId").asText(), unit.required("compositionNodeId").asText(),
                contract, rule, "de-he-gym-sekii-physics-gk", goals)).isTrue();
        assertThat(release.valid(unit.required("landscapeId").asText(), unit.required("compositionNodeId").asText(),
                contract, rule, "de-by-gym-physics-gk-g9", goals)).isFalse();
        goals.values().iterator().next().setDescription("Ein zusätzlicher fachlicher Anspruch");
        assertThat(release.valid(unit.required("landscapeId").asText(), unit.required("compositionNodeId").asText(),
                contract, rule, "de-he-gym-sekii-physics-gk", goals)).isFalse();
    }
}
