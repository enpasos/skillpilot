# Daily Learning Progress: Daily Quota First, Voluntary Extra Work Afterward

> **Superseded.** Since September 2026, the authoritative specification for learning-plan
> status is the [Unified Learning-Plan Status Concept](../didactic/unified-learning-plan-status.md).
> It uses a per-subject quantitative balance on a daily or weekly basis whose wording is
> formulated authoritatively by the backend. The daily-quota counter fields described here
> (`dueToday`, `completedToday`, `openToday`, `openOverdue`, `extraCompletedToday`) are no
> longer emitted to the UI or the coach. This document is retained as a record of the
> superseded calculation model.

Status: 14 September 2026. This specification applies to personal subject plans in the
Cockpit and their safe projection for the SkillPilot coaches. The backend computes the
numbers; the UI and coach render them. Domain mastery decisions and prerequisites remain
unchanged by this calculation.

## Learner View

The daily quota is a count per subject, not a rigid list of specific goals. An already due
Mathematics goal genuinely completed today counts toward the Mathematics quota first, even
if it was originally scheduled for an earlier day. Extra Mathematics completions never
offset a still-open Physics quota.

Example: The Mathematics daily quota is 2 goals, and 3 additional open goals exist outside
this quota. The completed goals may be older scheduled goals.

| Actual completions today | Daily display | Extra completed | Further open plan goals |
| --- | --- | --- | --- |
| 0 | 0 of 2 completed | 0 | 3 |
| 1 | 1 of 2 completed | 0 | 3 |
| 2 | 2 of 2 completed | 0 | 3 |
| 3 | 2 of 2 completed | 1 | 2 |

**A plan guides and prioritizes learning; it must never lock learning.**
The first priority is an achievable daily target. Once it is met, the coach acknowledges
the achievement. If a backlog remains, the coach primarily invites the learner to use their
momentum to catch up without creating pressure or guilt. For example: "Your daily target is
complete. If you want to keep learning, we can catch up on one of the open Mathematics goals
now." Taking a requested break remains possible, though it is not foregrounded when backlog
exists. Further open plan goals are not appended as an extra obligation to every progress
message. An explicit request to continue learning is honored rather than dismissed with
"done for today" or "come back tomorrow."

A day without a scheduled quota, such as a weekend, is labeled "No fixed target today," not
"All done." Voluntary completions on such a day count as extra progress. Meeting the daily
quota means neither that the overall plan is finished nor that the entire subject competence
has been mastered.

## Authoritative Calculation

The calendar day is determined server-side in `Europe/Berlin`. For each valid subject plan,
`LearnerLearningPlanService.dailyMetrics` computes the following sets:

- `D`: distinct atomic goal IDs due through today according to the unmodified schedule;
- `Y`: the corresponding set due through yesterday;
- `S = |D without Y|`: number of goals originally newly scheduled for today;
- `O`: goals in `D` that are currently not yet mastered;
- `C`: distinct goals in `D` that have a genuine completion event today and whose current
  mastery remains at least `0.9`.

The quantities (`Q` daily quota, `A` counted today, `R` still open today, `E` extra
completed today, `B` further open goals) are:

```text
Tagespensum             Q = min(S, O + C)
Heute angerechnet       A = min(Q, C)
Heute noch offen        R = Q - A
Zusätzlich geschafft   E = C - A
Weitere offene Ziele   B = O - R
```

During ordinary completions today, `O` decreases by the exact amount by which `C` increases.
As a result, `Q` remains stable. The denominator does not shrink with every success. The
cap prevents an unachievable quota when less open work remains overall than was originally
scheduled.

Plan edits, retroactive mastery adjustments, or imports can change the available work and
therefore the computed quota. Those interventions are not ordinary learning completions. The
quota is a reproducible calculation over the current plan, not a separately persisted daily
plan.

`B` is a **remaining budget outside the still-open daily quota**, not a count of the exact
goal IDs with a past due date. The existing API field name `openOverdue` is kept for
compatibility. Visible copy must not turn it into "this many goals are calendar-overdue." A
completion is not subtracted simultaneously from the daily quota and from the remaining
budget. Only extra work beyond the daily quota reduces this remaining budget.

Schedule distribution and goal ordering remain unchanged. Goal selection and switching use
the ordinary `requires` frontier of the current Personal Curriculum. A plan prioritizes that
selection without restricting access to other reachable personal goals. A goal that is not
yet due or a goal from another subject does not satisfy this plan's quota. Overlapping
blocks count a goal ID at most once. Invalid or stale plans do not emit seemingly reliable
numbers and prevent an unqualified "all done" statement.

## Completion Events Instead of Update Timestamps

The `learner_goal_completion` table is created by Liquibase change
`033-add-learner-goal-completions`. An event record stores:

- internal event ID, learner reference, and goal ID;
- actual timestamp `occurred_at` and the derived Berlin calendar date `completion_date`;
- the mastery value persisted at that transition.

An event is created only upon an actual transition from mastery below `0.9` to at least
`0.9`. Ordinary mastery writes and successfully completed Verified Recall use the same
ledger service. Routine flashcard review without crossing the mastery threshold is not a
goal completion.

Mastery and completion event are persisted in the same transaction under the learner lock. A
rollback reverts both. A unique database constraint on learner ID, goal ID, and Berlin
calendar date prevents double counting, including across repeats, a reset followed by
re-completion on the same day, or retries. A new genuine completion on a later calendar day
can create a new event. A subsequent correction below the mastery threshold removes today's
credit claim without deleting the historical event record.

Completion events are historical observations and are not synthesized from imported mastery
data. Deleting a learner cascades deletion of their events via the foreign key. Provider
projections receive exclusively the required aggregated numbers, never ledger or learner
IDs.

## History and Rollout on an Existing System

`mastery.updated_at` proves only the latest modification, not an original completion. There
is therefore **no backfill** from legacy timestamps. The new table starts empty; existing
mastery and plans remain untouched. Achievements reached prior to rollout are not
retroactively claimed as verified completions today. In particular, this applies to an
achievement reached earlier on deployment day before the deployment went live.

The existing history endpoint distinguishes:

- `source = completion_event`: actual recorded completion event;
- `source = legacy_last_updated`: existing mastery entry with weaker date evidence. The UI
  labels this date as the last update.

Legacy achievements remain visible. Weekly statistics count only genuine completion events
by Berlin calendar week; legacy modification dates are not reported as measured learning
velocity. The history view may also display earlier achievements outside the current subject
plan. Only that plan's due scope counts toward the daily quota.

## Automatic Continuation and Explicit Extra Work

Automatic plan activation, `reconcile`, and post-completion continuation select only
subjects with a still-open daily quota. Once Mathematics has met its quota, a suitable open
Physics goal may follow, whereas no further Mathematics goal starts automatically solely
because of remaining backlog budget. If Physics is blocked, that blocker is not masked by
unsolicited extra Mathematics work.

Once quotas are met, automatic selection stays empty. The explicit continuation action
`resumeExplicitly` and deliberate subject selection prioritize reachable due goals first,
then further reachable plan goals, and finally the remaining frontier of the current
personal subject curriculum. Future due dates, an exhausted plan, an absent daily quota, or
the absence of backlog do not block explicit continuation. Even without a valid schedule,
current personal goals remain reachable; invalid plan figures are not emitted as reliable
daily counts, and the old plan is not rewritten. Only when every goal in the Personal
Curriculum has been achieved is the regular learning path complete. An empty frontier alone
does not prove completion: domain or technical obstacles are named as such, never as the end
of the day. Technical guards for state, plan revision (when a valid plan is present), exams,
session, and authorization remain in force. An explicit request for extra work overrides
neither prerequisites nor the boundaries of the Personal Curriculum.

In chat, once the quota is met and no goal is active, the provider adapter sets daily
guidance to `complete`, even when `resumeAvailable=true` is present as a capability for
voluntary further learning. Capability is not a prompt to continue. An already activated,
unfinished goal remains workable as usual. Status questions or taking a break still trigger
neither a task, nor a visualization, nor a state mutation.

`resumeAvailable` and the per-subject capability `canContinue` describe explicit further
learning independently of daily-quota or backlog numbers. The internal flag
`automaticResumeAvailable`, which is not exposed to the coach, is computed separately from
actually reachable due work while a daily quota remains open. Only this narrower capability
permits `guidance.state=resume` and thus automatic continuation. Fallback goals when the
daily quota is blocked remain reachable upon request without starting unsolicited.

## Interface and Preview

Existing field names remain in place, with their daily semantics now defined explicitly:

- `dueToday`: daily quota `Q`;
- `completedDueToday` / `completedToday`: credited genuine completions `A`;
- `openDueToday` / `openToday`: remaining daily quota `R`;
- new `extraCompletedToday`: extra completions `E`;
- cumulative fields such as `completedDueThroughToday`: current mastery across cumulatively
  due goals, **not** achievements newly reached today.

Totals are summed per subject, never offset across subjects. On older responses, the WebGUI
treats a missing extra field as `0` while validating present extra fields for consistency.
Backend, safe provider projections, JSON schemas, and current coach instructions must ship
together.

For today, the draft preview uses the same calculation with existing completion events.
Future days apply the same quota rule against the current mastery snapshot without inventing
future completion events. It is a projection assuming unchanged mastery, not a promise of
future performance.

## Automated Evidence and Real Acceptance

Regression coverage includes, among others:

- `LearningPlanDailyProgressTest`: quota, older scheduled goals, extra work, subject
  boundaries, weekends, day rollover, and deduplication;
- `LearnerGoalCompletionIntegrationTest` and `LearnerGoalCompletionMigrationTest`: real
  writes, atomic history, threshold crossing, retry/reset, imports, time zone, and
  migration;
- `LearnerLearningPlanServiceIntegrationTest`, `LearnerServiceTest`, and
  `CoachToolFacadeLearningPlanTest`: shared daily status, automatic stops, subject
  switching, explicit extra work, future goals, exhausted or absent plans, personal
  boundaries, prerequisites, and preview;
- OpenAI/Claude contract tests: safe figures and matching continuation semantics;
- App API, component, and browser tests: visible progress display, completion notice,
  voluntary continuation click, and honest history labeling.

Local tests and prepared plugin artifacts are neither a deployment nor proof of actual host
model behavior. After regular deployment, a short real learning run in production using a
dedicated test profile is advisable: complete an older scheduled goal, verify matching
progress in chat and Cockpit, fulfill the daily quota, observe the automatic stop, and
voluntarily start an additional goal. Never relabel real learner achievements for testing or
fabricate historical completions.
