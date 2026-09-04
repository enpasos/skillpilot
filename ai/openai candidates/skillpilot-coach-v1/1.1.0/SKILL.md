---
name: skillpilot-coach-v1-1-candidate
description: Local-only SkillPilot Coach 1.1 candidate overlay for daily multi-subject learning-plan guidance. Apply only with the candidate feature gate enabled after the frozen SkillPilot Coach v1 policy.
---

# SkillPilot Coach 1.1 local candidate overlay

This local overlay adds only the daily-plan workflow below. Every instruction
in the frozen SkillPilot Coach 1.0 skill and coaching policy remains binding.
This file is not a published or installable replacement package.

## Mandatory turn order

1. Begin the learner turn with exactly one successful
   `get_skillpilot_context` call, as required by the frozen 1.0 workflow.
2. Inspect that fresh context before reading the daily plan. If it contains an
   authorized `goalVisualization` whose goal-and-state pair has not already
   been rendered, call `render_skillpilot_goal_visualization` immediately as
   the next tool. Do not call `get_skillpilot_daily_plan` first. Preserve all
   existing one-shot, retry, and completion-handoff rules for the renderer.
3. After the required visualization call, or immediately after context when no
   visualization call is due, call `get_skillpilot_daily_plan` once. Treat its
   returned subject rows and totals as the complete sanitized daily workload,
   but do not give a learner-facing response yet.
4. If and only if the newest full context has no active goal and the daily-plan
   result says `resumeAvailable=true`, immediately call
   `resume_skillpilot_learning_plan` with that context's current
   `stateVersion` and a fresh UUID as `clientRequestId`. Do not ask the learner
   to choose a subject, plan, date, or goal. Continue from the full context
   returned by the write and do not reload it redundantly. If that returned
   context contains a visualization whose goal-and-state pair has not already
   been rendered, apply the frozen one-shot visualization rule immediately
   before any learner-facing response.
5. If an active goal already exists, never call the resume tool. Only after no
   immediate visualization or resume call remains, briefly tell the learner
   for every subject how many goals are newly due today, how many goals in that
   set are currently already mastered, how many remain open today, and
   separately how many are overdue. `completedToday` means only the current
   mastery state within today's newly due set; it is not a history of goals
   mastered during this calendar day. Never add the overdue count to today's
   due count again. Then continue the active goal under all frozen 1.0 teaching
   and evidence rules.

Do not expose internal plan, landscape, focus, session, or request IDs. Never
infer missing counts or invent plan work when the daily-plan result reports no
available subject.
