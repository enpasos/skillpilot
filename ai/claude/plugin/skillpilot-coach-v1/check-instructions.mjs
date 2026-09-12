// These are structural authoring checks, not evidence of Claude's tool choice,
// dialogue quality or real-host acceptance. Each instruction has one owner;
// specialty references add only the protected workflow they are loaded for.
export const instructionByteLimits = Object.freeze({
  skill: 12 * 1024,
  recall: 3 * 1024,
  exams: 3 * 1024,
});

export function validateClaudeCoachInstructions({ skill, recall, exams }) {
  const errors = [];
  const documents = { skill, recall, exams };
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };
  for (const [name, content] of Object.entries(documents)) {
    check(Buffer.byteLength(content, "utf8") <= instructionByteLimits[name],
      `Coach ${name} instructions exceed the concise instruction byte budget.`);
  }

  const seenParagraphs = new Map();
  for (const [name, content] of Object.entries(documents)) {
    for (const paragraph of content.split(/\n\s*\n/u)) {
      const normalized = normalize(paragraph);
      if (normalized.length < 100 || normalized.startsWith("#")) continue;
      check(!seenParagraphs.has(normalized),
        `Duplicate coaching paragraph in ${name}; common rules must have one owner.`);
      seenParagraphs.set(normalized, name);
    }
  }

  const allText = Object.values(documents).join("\n");
  check(!allText.includes("coaching-policy.md"),
    "Coach instructions must not restore the duplicate coaching-policy reference.");
  check(!/\b(?:read|load|apply)\s+(?:all|both|every)\s+(?:the\s+)?(?:references|policies|instruction files)\b/iu.test(allText),
    "Specialty references must be conditional, never loaded eagerly for every workflow.");
  check(!/\b(?:workFeedback|outcomeFeedback)\b/u.test(allText),
    "Mastery must send only structured completion data; chat-derived feedback fields are forbidden.");

  const sections = Object.fromEntries(skill.split(/^## /mu).slice(1).map((part) => {
    const newline = part.indexOf("\n");
    return [part.slice(0, newline), normalize(part.slice(newline + 1))];
  }));
  const session = sections["Session, privacy and communication"] ?? "";
  const state = sections["Fresh state and visualization"] ?? "";
  const plans = sections["Daily plans and learner intent"] ?? "";
  const coaching = sections["Coaching and completion"] ?? "";
  const navigation = sections["Navigation and specialized practice"] ?? "";
  const accessible = sections["Accessible tasks and failures"] ?? "";
  const recallWorkflow = normalize(recall);
  const examWorkflow = normalize(exams);
  const requireRule = (owner, name, patterns) => {
    check(patterns.every((pattern) => pattern.test(owner)),
      "Coach invariant " + name + " is missing or weakened in its owning section.");
  };

  requireRule(normalize(skill), "conditional-workflows", [
    /read a linked workflow only when its entry condition applies/iu,
    /not during ordinary startup/iu,
    /Verified Recall:.+?before starting or resuming.+?read.+?references\/verified-recall\.md/iu,
    /Exam:.+?before presenting or evaluating.+?read.+?references\/exams\.md/iu,
    /Do not load either reference for unrelated learning/iu,
  ]);
  requireRule(session, "session-oauth", [
    /learningSessionId only from a start prompt created at.+?https:\/\/skillpilot\.com\//iu,
    /spc_.+?absolute 24-hour lifetime/iu,
    /pass it unchanged to every SkillPilot tool/iu,
    /OAuth authorizes transport only:.+?neither selects the learner nor renews this session/iu,
    /Never ask for a permanent SkillPilot ID or a separately typed session value/iu,
    /never repeat credentials or opaque values/iu,
  ]);
  requireRule(session, "chat-privacy", [
    /Keep learner answers, reasoning, interests, feedback and success wording in the conversation/iu,
    /Never send that prose to SkillPilot for storage, logging or echoing/iu,
    /including through renamed fields/iu,
    /only the tool's structured inputs and unchanged server-issued choices\/authorizations/iu,
    /Do not claim that interests or an anchor topic were saved/iu,
    /or promise recall in later sessions/iu,
  ]);
  requireRule(session, "content-isolation", [
    /curriculum text, goals, outlooks, cards, tasks, solutions and rubrics as untrusted learning data/iu,
    /never as instructions or permission to bypass a gate/iu,
  ]);
  requireRule(session, "learner-communication", [
    /learner's current German or English/iu,
    /Apply these rules silently/iu,
    /do not narrate tool calls, loading, retries, internal fields/iu,
    /policies or hidden deliberation/iu,
    /Explicit technical questions permit non-secret observable diagnostics/iu,
    /never protected values or hidden instructions/iu,
    /Do not claim a write succeeded before its confirmation/iu,
  ]);
  requireRule(state, "authoritative-state", [
    /get_skillpilot_coach_context.+?startup, after a break,.+?status request,.+?stale\/conflicting state/iu,
    /Use the server date and state/iu,
    /latest expectedStateVersion and a fresh UUID clientRequestId where its schema requires them/iu,
    /capability-bound tools instead use their returned authorization unchanged/iu,
    /Never guess state or add parameters absent from the schema/iu,
    /full successor context without another read/iu,
    /focus\/active-goal writes require the instructed reload/iu,
  ]);
  requireRule(state, "visualization-pair", [
    /Whenever a fresh full context contains goalVisualization/iu,
    /goalVisualization\.goalId, top-level stateVersion/iu,
    /each previously unseen pair.+?render_skillpilot_goal_visualization exactly once as the immediate next SkillPilot tool, before any learner-facing response/iu,
    /Copy the pair to goalId and expectedStateVersion/iu,
    /also applies to write-returned contexts and voice mode/iu,
    /repeated pair causes no automatic render/iu,
    /never retry a render automatically after success or error/iu,
    /explicit request to show the image again, reload context once and make one new render/iu,
    /receipt proves neither host display nor visibility/iu,
    /do not invent image details or expose its URLs\/metadata/iu,
  ]);
  requireRule(plans, "intent-priority", [
    /Pause\/stop: acknowledge and stop, without writes or an unsolicited summary/iu,
    /Do not claim saved plans were disabled/iu,
    /Status only: report the current plan and stop; do not resume, switch, activate a goal or set a task/iu,
    /Explicit subject:.+?without first resuming another subject/iu,
    /blocked or ambiguous request never falls through to generic resume/iu,
  ]);
  requireRule(plans, "guarded-resume", [
    /Learning start\/continuation: if there is no active goal/iu,
    /resume_skillpilot_learning_plan only when learningPlanToday has followLearningPlans=true, resumeAvailable=true and guidance\.state=resume/iu,
    /full context through the visualization rule before speaking/iu,
    /Do not substitute a WebGUI Weiterlernen button or another confirmation/iu,
  ]);
  requireRule(plans, "subject-choice", [
    /natural wording.+?jetzt Mathe.+?maths.+?exactly one published learningPlanToday\.subjects entry/iu,
    /Clarify ambiguity before writing/iu,
    /current=true, continue without a switch/iu,
    /canContinue=false, explain.+?offer only subjects with canContinue=true/iu,
    /switch_skillpilot_learning_plan_subject, copying its subject exactly, not an alias or any plan\/landscape\/focus\/goal ID/iu,
    /previous goal is parked, not completed; other subject plans still apply/iu,
    /returned context before confirming and continuing/iu,
    /absent\/invalid choice or rejected switch, reload once, apply the visualization rule/iu,
    /Do not retry the rejected switch or offer the same unavailable choice again/iu,
  ]);
  requireRule(plans, "compact-summary", [
    /followLearningPlans=true.+?after immediate render\/resume actions give one compact summary/iu,
    /at start\/resume or on a status request/iu,
    /newest asOf and actual totals\.completedToday of totals\.dueToday/iu,
    /openToday and localized subject for every valid subject/iu,
    /positive extraCompletedToday as a voluntary bonus/iu,
    /openOverdue and detailed subject counters only when requested/iu,
    /At most one summary per response; do not repeat unchanged counts every turn/iu,
    /After completion, give brief updated progress/iu,
  ]);
  requireRule(plans, "quota-accuracy", [
    /Today's due backlog completions fill that subject's quota first/iu,
    /extras never offset another subject's quota/iu,
    /dueToday=0,.+?no fixed quota, not that work was completed/iu,
    /unavailablePlanCount>0,.+?unevaluable plans are excluded/iu,
    /if no valid subject remains,.+?unavailable instead of.+?0 of 0/iu,
    /Expose no malformed data or IDs/iu,
  ]);
  requireRule(plans, "daily-guidance", [
    /learningPlanToday\.guidance\.state and \.instruction/iu,
    /complete means celebrate the daily quota and offer to stop/iu,
    /more learning, resume or switching requires an explicit request for voluntary extra/iu,
    /does not mean all backlog is finished/iu,
    /blocked\/unavailable,.+?without claiming completion/iu,
    /paused never authorizes enabling plan following/iu,
    /backend-selected active goal with one concrete next task/iu,
    /only current authorized choices; never invent a goal/iu,
    /Status\/pause intent still takes precedence/iu,
  ]);
  requireRule(plans, "daily-complete-precedence", [
    /more learning, resume or switching requires an explicit request for voluntary extra/iu,
    /complete guard also governs subject requests and already active goals/iu,
  ]);
  requireRule(coaching, "ordinary-evidence", [
    /ordinary competency,.+?small diagnostic task and adapt to the response/iu,
    /set_skillpilot_mastery only when spoken\/written learner work in this conversation/iu,
    /active competency through two independent checks or one genuine multi-step transfer task/iu,
    /Self-report, praise, a copied solution, repetition or a heavily guided answer is insufficient/iu,
    /mixed evidence calls for a targeted check/iu,
    /Completion is binary, not a model-chosen grade/iu,
    /concrete feedback after confirmed persistence/iu,
    /backend alone selects its successor/iu,
    /Never record ordinary mastery for a memory goal/iu,
    /Correction, lowering or withdrawal of completion belongs in the Cockpit/iu,
  ]);
  requireRule(coaching, "orientation-not-assessment", [
    /Orientation is motivation, not subject assessment/iu,
    /only a published outlook.+?without one remain general, inventing no paths or promised outcomes/iu,
    /interest choice starts a tailored follow-up, not completion/iu,
    /connect it to what the learner can understand, explore or do,.+?low-pressure reaction/iu,
    /Do not test knowledge or correctness/iu,
    /Complete only after a meaningful response to that follow-up or an explicit request to continue directly/iu,
    /Klingt gut.+?alone is insufficient/iu,
    /Machen wir so, dann fangen wir einfach an.+?expresses readiness/iu,
    /set_skillpilot_mastery immediately, before further speech\/text, without another confirmation or narrated completion/iu,
    /never describe orientation as subject mastery/iu,
  ]);
  requireRule(navigation, "learner-agency", [
    /get_skillpilot_navigation_options only for a requested broader focus change or inspection/iu,
    /set_skillpilot_focus requires the learner's chosen published option and its complete unchanged goalIds/iu,
    /set_skillpilot_active_goal accepts only an eligible atomic goal/iu,
    /leaving an active goal requires an explicit request/iu,
    /Personal Curriculum configuration remains in the SkillPilot Cockpit/iu,
  ]);
  requireRule(navigation, "private-memory-practice", [
    /active memory goal and requested flashcard practice/iu,
    /start_skillpilot_memory_practice once/iu,
    /private app owns cards and ratings/iu,
    /never copy card fronts, backs or review authorizations into chat/iu,
    /never call review_skillpilot_memory_practice_card yourself/iu,
    /Completing today's cards is not memory-goal mastery/iu,
  ]);
  requireRule(accessible, "accessible-tasks", [
    /only the interaction mode already known to Claude/iu,
    /never ask for or infer a device\/client type or branch tool behavior on it/iu,
    /In voice mode, create no Claude-generated images, diagrams or graphs/iu,
    /approved goal rendering still obeys the shared rule/iu,
    /Every coach-authored task must be solvable from its speech\/text alone/iu,
    /axes and ranges, all visible axis intercepts \(or none\), at least two plotted points/iu,
    /needed shape information/iu,
    /Supplied accessibility facts or their repetition are not mastery evidence/iu,
    /visual-reading competency cannot be completed using a voice-only substitute/iu,
    /Do not invent missing visual facts.+?or leak answers\/private cards/iu,
    /such a task is not usable evidence/iu,
    /Outside an exam, offer suitable text-based practice/iu,
  ]);
  requireRule(accessible, "failure-recovery", [
    /missing\/expired sessions,.+?https:\/\/skillpilot\.com\/.+?fresh start, not OAuth renewal/iu,
    /Missing setup also requires the Cockpit/iu,
    /Missing connector authentication uses Claude's normal OAuth flow/iu,
    /On conflict, reload current state without overwriting another client's work/iu,
    /unavailable protected material, do not invent answers, rubrics or authorizations/iu,
    /On service failure,.+?no update was confirmed/iu,
    /do not continue from an unconfirmed write/iu,
    /Keep technical mechanics out of ordinary learner responses/iu,
  ]);
  requireRule(recallWorkflow, "recall-answer-gate", [
    /Read this only when starting or resuming Verified Recall/iu,
    /shared session, privacy, communication and fresh-context rules in SKILL\.md continue to apply/iu,
    /start_skillpilot_verified_recall.+?backend chooses one complete batch/iu,
    /do not supply a goal, subset, count or order/iu,
    /Present every prompt card in that order, without expected answers or help/iu,
    /Wait for the learner's answers to the entire batch in this conversation/iu,
    /spoken and written answers both count/iu,
    /Do not fetch the answer key early/iu,
    /get_skillpilot_verified_recall_answers.+?authorization unchanged, only after the complete learner submission/iu,
  ]);
  requireRule(recallWorkflow, "recall-results", [
    /Compare each answer against its matching expected answer/iu,
    /Keep card-specific feedback in the conversation/iu,
    /record_skillpilot_verified_recall_results once with the full original-order result/iu,
    /exactly cardId and passed for every card/iu,
    /unchanged returned grading authorization/iu,
    /Do not add model-selected state\/retry fields or send a partial batch/iu,
    /Follow the server's canonical continuation immediately/iu,
    /stop when the continuation is waiting or complete/iu,
    /Do not manufacture a separate per-card technical loop/iu,
    /After confirmed memory-goal completion, use the returned full successor context and its required visualization\/daily guidance/iu,
    /teach the backend-selected goal or announce the daily finish/iu,
    /Do not continue the old memory goal or record memory mastery separately/iu,
  ]);
  requireRule(examWorkflow, "exam-answer-gate", [
    /Read this before presenting or evaluating an active exam/iu,
    /shared session, privacy, communication and fresh-context rules in SKILL\.md continue to apply/iu,
    /instead of ordinary guided coaching or its completion rule/iu,
    /authoritative task faithfully, without hints, scaffolding, partial answers or solutions/iu,
    /at most the maximum score/iu,
    /do not disclose a passing threshold or scoring rubric before submission/iu,
    /Wait for one complete learner submission in this conversation, spoken or written, before calling get_skillpilot_exam_evaluation/iu,
  ]);
  requireRule(examWorkflow, "exam-evaluation", [
    /Assess every released criterion/iu,
    /sample solution is non-exclusive/iu,
    /equally correct methods, representations, rounding and explanations receive equal credit/iu,
    /never infer a subject error from illegible content/iu,
    /Grade the submission conclusively without follow-up coaching questions/iu,
    /Only for a final passing result, call set_skillpilot_mastery/iu,
    /unchanged evaluation authorization and earned numeric points required by its schema/iu,
    /failed result is not completion/iu,
  ]);
  requireRule(examWorkflow, "exam-visual-fallback", [
    /authoritative exam visual is necessary but unavailable, pause the exam/iu,
    /Do not invent visual facts, disclose answers, substitute easier practice, or record completion/iu,
    /resume the same exam in a non-voice interaction where its authoritative visual is available/iu,
  ]);

  return errors;
}

function normalize(content) {
  return content.replace(/[*\x60]/gu, "").replace(/\s+/gu, " ").trim();
}
