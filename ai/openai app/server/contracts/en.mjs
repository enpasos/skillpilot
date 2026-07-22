export const englishContract = Object.freeze({
  locale: "en",
  appName: "SkillPilot Coach English",
  serverName: "skillpilot-coach-en",
  instructions:
    "Use only the English SkillPilot tools exposed by this server. Open the learning coach for a natural learning request without asking for technical IDs or tokens. When the visible widget message requests evaluation of a submitted answer, first load the pending answer and then store exactly one subject-matter evaluation. Accept mathematically equivalent solution paths regardless of wording. After a new turn or whenever conversation context is uncertain, reload the current learning state from SkillPilot.",
  mcpPath: "/mcp/en",
  resourceName: "skillpilot-coach-en-widget",
  resourceUri: "ui://skillpilot-coach-en/coach.html",
  tools: {
    open: {
      name: "open_skillpilot_coach_en",
      title: "Open SkillPilot learning coach",
      description:
        "Opens or refreshes the English SkillPilot learning coach. Use this tool when the learner wants to learn with SkillPilot, continue their learning path, or view their current learning state. A natural learning intent may be passed as learning_request.",
      invoking: "Loading learning path…",
      invoked: "Learning path ready"
    },
    choose: {
      name: "choose_skillpilot_path_en",
      title: "Choose learning path",
      description:
        "Applies a subject-specific option selected in the SkillPilot widget. This tool is intended only for direct calls from the app.",
      invoking: "Applying selection…",
      invoked: "Selection applied"
    },
    submit: {
      name: "submit_skillpilot_answer_en",
      title: "Submit answer",
      description:
        "Stores the answer entered in the SkillPilot widget. This tool is intended only for direct calls from the app.",
      invoking: "Saving answer…",
      invoked: "Answer saved"
    },
    pending: {
      name: "get_pending_skillpilot_answer_en",
      title: "Load submitted answer",
      description:
        "Loads the currently submitted but not yet evaluated answer from the English SkillPilot coach. Call this tool before evaluating; it does not require a technical session identifier.",
      invoking: "Loading answer…",
      invoked: "Answer loaded"
    },
    evaluate: {
      name: "record_skillpilot_evaluation_en",
      title: "Evaluate learning answer",
      description:
        "Stores the subject-matter evaluation of the SkillPilot answer loaded immediately before. Grade mathematically equivalent solution paths by correctness rather than exact wording against a reference answer.",
      invoking: "Saving evaluation…",
      invoked: "Evaluation saved"
    },
    context: {
      name: "get_skillpilot_context_en",
      title: "Load current learning state",
      description:
        "Loads the current English SkillPilot learning state from persistent storage. Use this tool after a new user turn or when conversation context is uncertain; it requires no session identifier visible in chat.",
      invoking: "Loading learning state…",
      invoked: "Learning state loaded"
    }
  },
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
    feedbackTitle: "Feedback",
    completeLabel: "Keep learning",
    emptyContext: "The learning coach has not been set up yet.",
    pendingMessage: "Please evaluate the answer I just submitted in the SkillPilot learning coach.",
    selectedContext: "The learner selected {choice}. The current learning state is stored by SkillPilot.",
    submittedContext: "The learner submitted an answer in the SkillPilot widget. The complete answer is stored server-side and is waiting for subject-matter evaluation."
  }
});
