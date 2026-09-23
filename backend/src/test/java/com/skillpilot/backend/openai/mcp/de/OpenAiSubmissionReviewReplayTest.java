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
        // The separate learner closure turn is checked by the dialog evaluator; these
        // backend fixtures verify the authorized transition and no-next-goal case.
        fixture().contextUsesRealContentAndStructuredContentWithoutLearnerIdSecretsOrExamSolution();
        fixture().orientationCompletionActivatesTheFirstAvailableGoalFromTheSelectedAuthoritativePath();
        fixture().orientationCompletionRejectsAPathOutsideTheCurrentAuthoritativeMap();
        fixture().plannedOrientationCompletionStopsAtQuotaDespiteSelectedPathEntry();
        fixture().masteryContinuesTheAutoActivatedSuccessorWithoutPublishingAnotherGoalChoice();
    }

    @Test
    void p3PracticeAndVerifiedRecall() throws Exception {
        // The dialog case places feedback after answer release and records the batch
        // only on the later learner closure turn. This replay checks the backend receipt.
        fixture().memoryPracticeStartHidesCardContentsFromTheModelAndExposesThemOnlyToTheComponent();
        fixture().validMemoryPracticeReviewCapabilityAuthorizesExactlyItsIssuedCard();
        fixture().capabilityBoundRecallFlowLoadsAllAnswersAndSavesOneAtomicOrderedReceipt();
        fixture().completedRecallBatchWithVisualSuccessorReturnsAndExecutesTheServerDirectedRendererCall();
        fixture().recallCapabilitiesRejectManipulationAndTruncatedAssessmentsBeforeAnyWrite();
    }

    @Test
    void p4CompleteExamAssessment() {
        // The dialog case evaluates the full submission before feedback and saves
        // mastery only after the separate learner closure turn.
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
