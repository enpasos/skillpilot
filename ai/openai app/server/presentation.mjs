function choiceFor(state, contract) {
  return contract.copy.choices.find((choice) => choice.code === state.courseCode) || null;
}

export function publicCoachState(state, contract) {
  if (!state) {
    return {
      locale: contract.locale,
      revision: 0,
      phase: "not-started",
      title: contract.copy.scopeTitle,
      summary: contract.copy.emptyContext,
      prompt: null,
      choices: [],
      answerLabel: null,
      answerPlaceholder: null,
      submitLabel: null,
      courseLabel: null,
      feedback: null,
      score: null,
      maxScore: null,
      passed: null
    };
  }

  const course = choiceFor(state, contract);
  const common = {
    locale: contract.locale,
    revision: state.revision,
    phase: state.phase,
    choices: [],
    answerLabel: null,
    answerPlaceholder: null,
    submitLabel: null,
    courseLabel: course?.label || null,
    feedback: null,
    score: null,
    maxScore: null,
    passed: null
  };

  if (state.phase === "scope-choice") {
    return {
      ...common,
      title: contract.copy.scopeTitle,
      summary: contract.copy.scopeSummary,
      prompt: contract.copy.scopePrompt,
      choices: contract.copy.choices.map(({ label, detail }) => ({ label, detail }))
    };
  }

  if (state.phase === "practice") {
    return {
      ...common,
      title: contract.copy.practiceTitle,
      summary: contract.copy.practiceSummary,
      prompt: contract.copy.practicePrompt,
      answerLabel: contract.copy.answerLabel,
      answerPlaceholder: contract.copy.answerPlaceholder,
      submitLabel: contract.copy.submitLabel
    };
  }

  if (state.phase === "awaiting-evaluation") {
    return {
      ...common,
      title: contract.copy.awaitingTitle,
      summary: contract.copy.awaitingSummary,
      prompt: null
    };
  }

  return {
    ...common,
    title: contract.copy.feedbackTitle,
    summary: contract.copy.practiceSummary,
    prompt: null,
    feedback: state.evaluation?.feedback || null,
    score: state.evaluation?.score ?? null,
    maxScore: state.evaluation?.maxScore ?? null,
    passed: state.evaluation?.passed ?? null
  };
}

export function privateWidgetMeta(state, contract) {
  if (!state) return {};
  const choiceRefs =
    state.phase === "scope-choice"
      ? contract.copy.choices.map((choice) => state.optionRefs[choice.code])
      : [];
  return {
    skillpilotApp: {
      sessionRef: state.sessionRef,
      choiceRefs
    }
  };
}

export function pendingSubmissionForModel(state, contract) {
  const course = choiceFor(state, contract);
  return {
    locale: contract.locale,
    task: contract.copy.practicePrompt,
    learnerAnswer: state.submission.answer,
    courseLabel: course?.label || null,
    gradingInstruction:
      contract.locale === "de"
        ? "Bewerte fachlich korrekt und akzeptiere jeden mathematisch äquivalenten Lösungsweg. Maximal 2 Punkte."
        : "Grade for subject-matter correctness and accept every mathematically equivalent solution path. Maximum 2 points."
  };
}

export function visibleSummary(state, contract) {
  const view = publicCoachState(state, contract);
  if (view.phase === "not-started") return view.summary;
  if (view.phase === "scope-choice") return view.summary;
  if (view.phase === "practice") {
    return contract.locale === "de"
      ? `${view.courseLabel} ist gewählt. Die nächste Aufgabe ist bereit.`
      : `${view.courseLabel} is selected. The next task is ready.`;
  }
  if (view.phase === "awaiting-evaluation") return view.summary;
  return contract.locale === "de"
    ? `Bewertung gespeichert: ${view.score} von ${view.maxScore} Punkten.`
    : `Evaluation stored: ${view.score} of ${view.maxScore} points.`;
}
