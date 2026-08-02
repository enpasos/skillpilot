export const englishCatalog = Object.freeze({
  locale: "en",
  genericError: "The SkillPilot learning coach could not complete the action.",
  copy: {
    scopeTitle: "Your learning path",
    scopeSummary: "For upper-secondary mathematics in Hesse, only your course level is still needed.",
    scopePrompt: "Which course are you taking?",
    choices: [
      { code: "basic", label: "Basic course", detail: "Standard requirement level" },
      { code: "advanced", label: "Advanced course", detail: "Higher requirement level" }
    ],
    practiceTitle: "Your next learning step",
    practiceSummary: "Solve linear equations confidently",
    practicePrompt: "Solve the equation 3(x − 2) = 15 and briefly describe your method.",
    answerLabel: "Your answer",
    answerPlaceholder: "For example: First, I divide …",
    submitLabel: "Submit answer",
    awaitingTitle: "Answer submitted",
    awaitingSummary: "Your answer is safely stored and is waiting for subject-matter evaluation.",
    evaluationRequestLabel: "Evaluate answer now",
    feedbackTitle: "Feedback",
    completeLabel: "Keep learning",
    emptyContext: "The learning coach has not been set up yet.",
    pendingMessage: "Please load the answer I just submitted in the SkillPilot learning coach, evaluate it for subject-matter correctness, and store the evaluation.",
    selectedContext: "The learner selected {choice}. The current learning state is stored by SkillPilot.",
    submittedContext: "The learner submitted an answer in the SkillPilot widget. The complete answer is stored server-side and is waiting for subject-matter evaluation.",
    gradingInstruction: "Grade for subject-matter correctness and accept every mathematically equivalent solution path. Maximum 2 points.",
    practiceReady: "{course} is selected. The next task is ready.",
    evaluationStored: "Evaluation stored: {score} of {maxScore} points."
  },
  preview: {
    initialRequest: "I want to learn upper-secondary mathematics in Hesse.",
    resetLabel: "Reset prototype",
    correctFeedback: "Correct. From 3(x − 2) = 15 we get x − 2 = 5 and therefore x = 7. Your method may of course be worded differently.",
    partialFeedback: "Your approach was considered, but x = 7 was not yet derived clearly. Check the division by 3 and the subsequent addition of 2."
  }
});
