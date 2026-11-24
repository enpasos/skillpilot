package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.completion.AssessmentMaterialRevision;
import com.skillpilot.backend.completion.UnitAssessmentContract;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.test.util.ReflectionTestUtils;
import static org.assertj.core.api.Assertions.assertThat;

/** Read-only product audit: only ephemeral H2 learner fixtures and /tmp results are written. */
class ZbIdentityAuditTest extends ClaudeV1CompletionRouteIntegrationTest {
    private static final String ZB="6ea3fb3c-abdc-568f-ab13-97c36dc274e4";
    private static final String MOD="d6dc0e02-831d-4894-a61a-852bcc74f147";
    private static final Path OUT=Path.of("/tmp/e1-pr186-ci-20261124/zb-identity");
    @ParameterizedTest @ValueSource(strings={"HISTORICAL22","CURRENT36","RAW_ONLY"})
    void actualHistoricalZbConsumption(String edition) throws Exception {
        String learnerId=(String)ReflectionTestUtils.getField(this,"learnerId");
        String section=ReflectionTestUtils.invokeMethod(this,"selectHessianMotionUnit","G9","SekII","LK");
        ReflectionTestUtils.invokeMethod(this,"prepareUnitContinuation",section,4,false);
        var learner=learnerRepository.findById(learnerId).orElseThrow();
        learners.chooseLevelCompletion(learnerId,new LevelCompletionActionRequest("selectProfile","automatic:"+section,null,null,learner.getCoachStateRevision()));
        var before=learners.getLearnerState(learnerId).levelCompletion();
        var oldGoal=mapper.readTree(OUT.resolve(edition.equals("CURRENT36")?"current36.goal.json":"historical-base22.goal.json").toFile());
        var oldExam=mapper.treeToValue(oldGoal.required("examData"),ExamData.class);
        var oldMaterial=AssessmentMaterialRevision.of(oldExam);
        if(!edition.equals("RAW_ONLY")) transactions.executeWithoutResult(s -> examPasses.record(learnerId,ZB,oldMaterial,edition.equals("HISTORICAL22")?30:36,36,oldExam.getScoring().getPassingPoints()));
        learner=learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner,ZB,1));
        var history=examPasses.findForGoals(learnerId,List.of(ZB));
        var after=learners.getLearnerState(learnerId).levelCompletion();
        var assessment=after.assessments().stream().filter(a->ZB.equals(a.goalId())).findFirst().orElseThrow();
        assertThat(assessment.mastered()).isTrue();
        assertThat(assessment.startAvailable()).isFalse();
        assertThat(assessment.voluntary()).isTrue();
        assertThat(after.requiredAssessmentCount()).isEqualTo(4);
        assertThat(after.masteredAssessmentCount()).isEqualTo(4);
        assertThat(after.unitAssessment().parts()).allMatch(a->a.passed()&&a.materialCurrent());
        assertThat(after.unitAssessment().parts()).noneMatch(a->ZB.equals(a.goalId()));
        assertThat(after.unitAssessment().planningCreditGoalIds()).containsExactly("e4b38061-1f28-43ad-8371-a3e7c0e81856");
        assertThat(learners.getMastery(learnerId)).doesNotContainKey(MOD);
        assertThat(learners.getUnitPlanningCredits(learnerId)).doesNotContainKey(MOD);
        assertThat(examPasses.findForGoals(learnerId,List.of(ZB))).isEqualTo(history);
        assertThat(after.unitAssessment()).isEqualTo(before.unitAssessment());
        var graph=new LinkedHashMap<String,LearningGoal>();
        var canonical=mapper.readTree(Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile());
        for(var g:canonical.required("goals"))graph.put(g.required("id").asText(),mapper.treeToValue(g,LearningGoal.class));
        var current=graph.get(ZB);var currentMaterial=AssessmentMaterialRevision.of(current.getExamData());
        boolean actualGuard=ReflectionTestUtils.invokeMethod(learners,"unitPartMaterialCurrent","automatic:"+section,ZB,graph,new HashMap<String,Set<String>>());
        // A discriminator proves that this native predicate does not bind a voluntary ZB revision.
        // This private graph copy is NOT a proposed learner task or a live curriculum edit.
        var changed=mapper.treeToValue(mapper.valueToTree(current),LearningGoal.class);
        changed.getExamData().setTaskContent(current.getExamData().getTaskContent()+"\n\nSYNTHETIC_AUDIT_REVISION_DISCRIMINATOR");
        graph.put(ZB,changed);
        var changedMaterial=AssessmentMaterialRevision.of(changed.getExamData());
        boolean changedGuard=ReflectionTestUtils.invokeMethod(learners,"unitPartMaterialCurrent","automatic:"+section,ZB,graph,new HashMap<String,Set<String>>());
        assertThat(actualGuard).isTrue();assertThat(changedGuard).isTrue();assertThat(changedMaterial).isNotEqualTo(currentMaterial);
        var strictControl=new UnitAssessmentContract("synthetic-version-control",List.of("audit"),List.of(new UnitAssessmentContract.Part(ZB,changedMaterial)),List.of(MOD),List.of());
        var control=strictControl.evaluate("audit",graph.keySet(),graph,history,Set.of()).orElseThrow();
        assertThat(control.passed()).isFalse();
        var result=new LinkedHashMap<String,Object>();
        result.put("fixture",edition);result.put("historicalMaterial",oldMaterial);result.put("currentMaterial",currentMaterial);result.put("syntheticChangedMaterial",changedMaterial);
        result.put("storedReceipt",history);result.put("actualAssessmentResponse",assessment);result.put("unitPartMaterialCurrent",actualGuard);result.put("unitPartMaterialCurrentAfterSyntheticTaskChange",changedGuard);
        result.put("strictSinglePartControlIsSyntheticNotActualUnit",true);result.put("strictMaterialControlPassed",control.passed());
        result.put("requiredAssessments",after.requiredAssessmentCount());result.put("masteredRequiredAssessments",after.masteredAssessmentCount());result.put("unitAssessmentUnchanged",after.unitAssessment().equals(before.unitAssessment()));
        result.put("unitPlanningCreditGoalIds",after.unitAssessment().planningCreditGoalIds());result.put("modelingRawMasteryPresent",learners.getMastery(learnerId).containsKey(MOD));result.put("modelingPlanningCreditPresent",learners.getUnitPlanningCredits(learnerId).containsKey(MOD));
        Files.writeString(OUT.resolve(edition+".native.actual.json"),mapper.writerWithDefaultPrettyPrinter().writeValueAsString(result)+"\n");
    }
}
