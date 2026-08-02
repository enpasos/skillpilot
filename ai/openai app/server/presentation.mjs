function choiceFor(state, catalog) {
  return catalog.copy.choices.find((choice) => choice.code === state.courseCode) || null;
}

export function publicCoachState(state, catalog) {
  if (!state) {
    return {
      communicationLocale: catalog.locale,
      revision: 0,
      phase: "not-started",
      title: catalog.copy.scopeTitle,
      summary: catalog.copy.emptyContext,
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

  const course = choiceFor(state, catalog);
  const common = {
    communicationLocale: catalog.locale,
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
      title: catalog.copy.scopeTitle,
      summary: catalog.copy.scopeSummary,
      prompt: catalog.copy.scopePrompt,
      choices: catalog.copy.choices.map(({ label, detail }) => ({ label, detail }))
    };
  }

  if (state.phase === "practice") {
    return {
      ...common,
      title: catalog.copy.practiceTitle,
      summary: catalog.copy.practiceSummary,
      prompt: catalog.copy.practicePrompt,
      answerLabel: catalog.copy.answerLabel,
      answerPlaceholder: catalog.copy.answerPlaceholder,
      submitLabel: catalog.copy.submitLabel
    };
  }

  if (state.phase === "awaiting-evaluation") {
    return {
      ...common,
      title: catalog.copy.awaitingTitle,
      summary: catalog.copy.awaitingSummary,
      prompt: null
    };
  }

  return {
    ...common,
    title: catalog.copy.feedbackTitle,
    summary: catalog.copy.practiceSummary,
    prompt: null,
    feedback: state.evaluation?.feedback || null,
    score: state.evaluation?.score ?? null,
    maxScore: state.evaluation?.maxScore ?? null,
    passed: state.evaluation?.passed ?? null
  };
}

export function privateWidgetMeta(state, catalog) {
  if (!state) return {};
  const choiceRefs =
    state.phase === "scope-choice"
      ? catalog.copy.choices.map((choice) => state.optionRefs[choice.code])
      : [];
  return {
    skillpilotApp: {
      sessionRef: state.sessionRef,
      choiceRefs
    }
  };
}

export function pendingSubmissionForModel(state, catalog) {
  const course = choiceFor(state, catalog);
  return {
    communicationLocale: catalog.locale,
    task: catalog.copy.practicePrompt,
    learnerAnswer: state.submission.answer,
    courseLabel: course?.label || null,
    gradingInstruction: catalog.copy.gradingInstruction
  };
}

export function visibleSummary(state, catalog) {
  const view = publicCoachState(state, catalog);
  if (view.phase === "not-started") return view.summary;
  if (view.phase === "scope-choice") return view.summary;
  if (view.phase === "practice") {
    return catalog.copy.practiceReady.replace("{course}", view.courseLabel ?? "");
  }
  if (view.phase === "awaiting-evaluation") return view.summary;
  return catalog.copy.evaluationStored
    .replace("{score}", String(view.score))
    .replace("{maxScore}", String(view.maxScore));
}
