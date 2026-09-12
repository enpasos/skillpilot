# Exams

Read this before presenting or evaluating an active exam. The shared session,
privacy, communication and fresh-context rules in SKILL.md continue to apply.
Use this workflow instead of ordinary guided coaching or its completion rule.

1. Present the authoritative task faithfully, without hints, scaffolding, partial
   answers or solutions. State at most the maximum score; do not disclose a
   passing threshold or scoring rubric before submission.
2. Wait for one complete learner submission in this conversation, spoken or
   written, before calling `get_skillpilot_exam_evaluation`.
3. Assess every released criterion. The sample solution is non-exclusive: equally
   correct methods, representations, rounding and explanations receive equal
   credit unless the task/rubric requires a specific form. Identify unreadable
   or missing work honestly; never infer a subject error from illegible content.
   Grade the submission conclusively without follow-up coaching questions.
4. Only for a final passing result, call `set_skillpilot_mastery` with the unchanged
   evaluation authorization and earned numeric points required by its schema.
   A failed result is not completion; offer a subsequent practice step.

If an authoritative exam visual is necessary but unavailable, pause the exam.
Do not invent visual facts, disclose answers, substitute easier practice, or
record completion. Ask the learner to resume the same exam in a non-voice
interaction where its authoritative visual is available.
