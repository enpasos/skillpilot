package com.skillpilot.backend.openai.mcp.de;

import org.junit.jupiter.api.Test;

/**
 * Executable backend portions of the eight portal cases on the current 1.1 contract.
 * Reuses real adapter/tool/capability assertions with isolated domain fixtures.
 * This does not simulate a model, OAuth host UI, visible chat wording, or native ChatGPT widgets.
 */
class OpenAiSubmissionReviewReplayTest {

    private OpenAiDeCoachMcpContractTest fixture() {
        OpenAiDeCoachMcpContractTest fixture = new OpenAiDeCoachMcpContractTest();
        fixture.setUp();
        fixture.useCurrentContract();
        return fixture;
    }

    @Test
    void p1SessionlessStart() {
        fixture().missingLearningSessionReturnsSessionRequiredBeforeResolvingIdentity();
        fixture().expiredLearningSessionReturnsSessionRequiredWithoutAnOauthChallenge();
        fixture().expiringSessionReturnsLocalizedWebGuiRenewalWithoutCallingTheFacade();
    }

    @Test
    void p2OrientationThenLearning() throws Exception {
        fixture().contextUsesRealContentAndStructuredContentWithoutLearnerIdSecretsOrExamSolution();
        fixture().orientationCompletionActivatesTheFirstAvailableGoalFromTheSelectedAuthoritativePath();
        fixture().orientationCompletionRejectsAPathOutsideTheCurrentAuthoritativeMap();
        fixture().masteryContinuesTheAutoActivatedSuccessorWithoutPublishingAnotherGoalChoice();
    }

    @Test
    void p3PracticeAndVerifiedRecall() throws Exception {
        fixture().memoryPracticeStartHidesCardContentsFromTheModelAndExposesThemOnlyToTheComponent();
        fixture().validMemoryPracticeReviewCapabilityAuthorizesExactlyItsIssuedCard();
        fixture().capabilityBoundRecallFlowLoadsAllAnswersAndSavesOneAtomicOrderedReceipt();
        fixture().completedRecallBatchWithVisualSuccessorReturnsAndExecutesTheServerDirectedRendererCall();
        fixture().recallCapabilitiesRejectManipulationAndTruncatedAssessmentsBeforeAnyWrite();
    }

    @Test
    void p4CompleteExamAssessment() {
        fixture().examMasteryRequiresEvaluationCapabilityAndAtLeastThePassingScore();
    }

    @Test
    void p5ConsentedFocusWidening() {
        fixture().scopeNavigationPublishesBroaderAncestorsNearestFirstAndCopiesTheFirstGoalIdsUnchanged();
        fixture().setScopeRejectsGoalIdsThatDoNotMatchOneFreshPublishedOption();
    }

    @Test
    void n1MissingSession() {
        fixture().missingLearningSessionReturnsSessionRequiredBeforeResolvingIdentity();
        fixture().malformedLearningSessionReturnsSessionRequiredBeforeResolvingIdentity();
        fixture().expiredLearningSessionReturnsSessionRequiredWithoutAnOauthChallenge();
    }

    @Test
    void n2PersonalCurriculumRemainsWebOnly() {
        fixture().unconfiguredWebGuiContextFailsClosedWithoutPublishingSetupChoices();
        fixture().navigationRejectsRedirectForTargetsOtherThanGoal();
    }

    @Test
    void n3EarlyExamSolutionRemainsAbsentFromContext() throws Exception {
        fixture().contextUsesRealContentAndStructuredContentWithoutLearnerIdSecretsOrExamSolution();
        fixture().releasedExamSummariesRemainSelectableWithoutExposingProtectedExamContent();
        fixture().examMasteryRequiresEvaluationCapabilityAndAtLeastThePassingScore();
    }
}
