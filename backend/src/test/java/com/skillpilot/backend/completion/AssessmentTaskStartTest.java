package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class AssessmentTaskStartTest {
    private static final String SHA = "sha256:" + "a".repeat(64);
    private final ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();

    @Test void exactNormalOnlyFormDoesNotOwnNavigationOrDisablePlanFollowing() throws Exception {
        var learner = new Learner(); learner.setFollowLearningPlans(true);
        var state = CompletionWorkflowState.normalAssessmentStart(new CompletionWorkflowState.AssessmentStart("B", SHA));
        learner.setCompletionWorkflow(mapper.writeValueAsString(state));
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(learner.getCompletionWorkflow())).isEqualTo(state);
        assertThat(CompletionNavigationPolicy.ownsNavigation(learner)).isFalse();
        assertThat(CompletionNavigationPolicy.followsPlans(learner)).isTrue();
        assertThat(mapper.writeValueAsString(learner)).doesNotContain("completionWorkflow", "assessmentStart", SHA);
        var publicJson=mapper.createObjectNode(); publicJson.put("completionWorkflow",learner.getCompletionWorkflow());
        assertThat(mapper.treeToValue(publicJson,Learner.class).getCompletionWorkflow()).isNull();
    }

    @ParameterizedTest @ValueSource(strings={"profileId","profileRevision","curriculumGeneration","curriculumId",
            "personalCurriculumDigest","navigationIntent","currentGoalId","directAssessment","unknown"})
    void anyRouteResidueOrUnknownPropertyKeepsTheOldFailClosedOwnership(String field) throws Exception {
        var tree = mapper.valueToTree(CompletionWorkflowState.normalAssessmentStart(
                new CompletionWorkflowState.AssessmentStart("B", SHA)));
        ((com.fasterxml.jackson.databind.node.ObjectNode)tree).put(field, "");
        var learner=new Learner();learner.setFollowLearningPlans(true);learner.setUseAssessmentShortcuts(true);
        learner.setCompletionWorkflow(mapper.writeValueAsString(tree));
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(learner.getCompletionWorkflow())).isNull();
        assertThat(CompletionNavigationPolicy.ownsNavigation(learner)).isTrue();
        assertThat(CompletionNavigationPolicy.followsPlans(learner)).isFalse();
    }

    @ParameterizedTest @ValueSource(strings={"{bad","{}","[]","null",
            "{\"assessmentStart\":{\"goalId\":\"B\",\"taskFingerprint\":\"not-a-hash\"}}",
            "{\"assessmentStart\":{\"goalId\":\"B\",\"taskFingerprint\":\"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\",\"extra\":true}}",
            "{\"profileId\":\"bad\",\"profileId\":null,\"assessmentStart\":{\"goalId\":\"B\",\"taskFingerprint\":\"sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\"}}"})
    void malformedOrDuplicateKeyProcessNeverBecomesTheNonOwningNormalForm(String json) {
        var learner=new Learner();learner.setUseAssessmentShortcuts(true);learner.setCompletionWorkflow(json);
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(json)).isNull();
        assertThat(CompletionNavigationPolicy.ownsNavigation(learner)).isTrue();
    }

    @Test void normalStartCannotEraseTheExistingDirectOrProfileFields() {
        var route=new CompletionWorkflowState("profile","revision","generation","curriculum","scope","required","B",null);
        var direct=new CompletionWorkflowState.DirectAssessmentContext("claude","owner","B",java.time.Instant.now().plusSeconds(60));
        var bound=route.withDirectAssessment(direct).withAssessmentStart(new CompletionWorkflowState.AssessmentStart("B",SHA));
        assertThat(bound.profileId()).isEqualTo("profile");assertThat(bound.directAssessment()).isEqualTo(direct);
        assertThat(bound.assessmentStart().goalId()).isEqualTo("B");
        assertThat(bound.withNavigation("paused",null).assessmentStart()).isNull();
    }

    @Test void taskFingerprintTracksExecutableTaskCoverageAndRubricButNotBibliography() {
        LearningGoal goal=new LearningGoal();goal.setId("B");goal.setNodeKind("exam");
        ExamData exam=new ExamData();exam.setTaskContent("Task");exam.setSolutionContent("Solution");exam.setCoveredGoalIds(List.of("B"));
        ExamData.Scoring scoring=new ExamData.Scoring();scoring.setMaxPoints(1);scoring.setPassingPoints(1);exam.setScoring(scoring);goal.setExamData(exam);
        var original=AssessmentTaskContract.start(goal);
        goal.setSourceRef("Printed page 52");exam.setSourceArtifactPath("renamed-source.md");exam.setReviewNote("Bibliographic correction");
        exam.setCoveredStrands(List.of("L1"));exam.setDemandLevels(List.of("AB1"));
        assertThat(AssessmentTaskContract.start(goal)).isEqualTo(original);
        exam.setTaskContentEn("English task");assertThat(AssessmentTaskContract.start(goal)).isNotEqualTo(original);
        exam.setTaskContentEn(null);scoring.setPassingPoints(0.5);assertThat(AssessmentTaskContract.start(goal)).isNotEqualTo(original);
        scoring.setPassingPoints(1);exam.setCoveredGoalIds(List.of("C"));assertThat(AssessmentTaskContract.start(goal)).isNotEqualTo(original);
    }

    @ParameterizedTest @ValueSource(strings={" {}"," false"," trailing-text"," null"," []"})
    void aValidNormalRecordFollowedByAnyFurtherValueOrTextRemainsFailClosed(String suffix) throws Exception {
        String valid=mapper.writeValueAsString(CompletionWorkflowState.normalAssessmentStart(
                new CompletionWorkflowState.AssessmentStart("B",SHA)));
        var learner=new Learner();learner.setUseAssessmentShortcuts(true);learner.setCompletionWorkflow(valid+suffix);
        assertThat(CompletionNavigationPolicy.normalAssessmentProcess(learner.getCompletionWorkflow())).isNull();
        assertThat(CompletionNavigationPolicy.ownsNavigation(learner)).isTrue();
    }
}
