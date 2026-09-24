# SkillPilot Coach v1 — 1.1.0 resubmission draft

This unpublished successor replaces the rejected 1.0.0 submission. The Product
Owner explicitly lifted its development freeze on 9 September 2026. The old
snapshot remains historical evidence, not an active source-code freeze.

## Changes

- Include the sanitized daily multi-subject plan in authoritative full context,
  without a redundant daily-plan read tool.
- Add guarded plan continuation and subject switching, preserving unfinished
  work and respecting status-only, pause, exam, and learner-consent boundaries.
- Report the plan status by quoting the backend-formulated
  `learningPlanToday.text` verbatim, as shown in the SkillPilot cockpit: one
  line per subject with its day or week target and any backlog or advance work.
  The context carries no plan counts or totals; the coach does no arithmetic.
  Celebrate a reached period target before offering voluntary extra learning.
- Plans guide learning but never prevent explicit continuation: prioritize due
  goals, then reachable future or unplanned personal targets. With backlog,
  invite catching up without pressure or foregrounding a break. Name
  unevaluable plans explicitly without revoking learning capabilities.
  Never infer a completion date from a mastery snapshot or legacy update time.
- Keep orientation, teaching, mastery, memory practice, Verified Recall and
  assessment safeguards. Optional visualizations never replace complete text.
- Keep learner answers, assessment reasoning and feedback exclusively in the
  chat. Mastery writes carry only structured completion facts and concurrency
  data; Verified Recall assessments carry only pass/fail outcomes. Reject
  extra assessment fields before replay processing or Core mutation, and
  keep the evidence decision and technical plans private in chat and voice.
- Align coaching content with the current Claude 1.1.10 source: persist an
  evidenced ordinary-goal success or passing exam immediately, before result
  feedback, including when the learner also requests a pause. A solved task
  alone is not goal mastery. Orientation and Verified Recall retain their
  separate post-feedback consent rules.
- Wait for explicit continuation after result feedback before the next task or
  its image, with or without Autopilot. Plain consent does not change the fixed
  verdict. Failed exams make no write and permit unlimited retries.
- Keep the full exam workflow in the entry skill: preserve required drawings,
  withhold scoring rubrics before submission, use the exact OpenAI evaluation
  schema, and pause if a required authoritative visual is unavailable.
- Add speech/text-accessible coach-authored tasks, private practice-card rules,
  untrusted-content handling and a ban on unsupported interest-memory promises.
- Submit the remote MCP server directly, without the former development-app
  reference. Refresh listing and review scenarios from maintained sources.
- Generate complete positive and negative portal test cases, with regression
  checks against truncation, stale tool metadata, missing outcomes and drift.

The plugin remains contract major 1; package version is 1.1.0, workflow version
is `coach@1.1`, and lifecycle policy revision is 5. No release has been published.
Local fixtures and widget tests are not a substitute for model tool-choice or
real ChatGPT host acceptance. A new portal scan, current reviewer evidence and
explicit final submission remain separate steps; the old video does not certify
the successor. This change does not deploy or submit anything.
