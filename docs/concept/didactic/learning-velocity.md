# Learning Velocity (Concept)

> This is the narrow observational metric approximated by the current UI. Its
> current snapshot timestamps do not yet prove first atomic threshold
> crossings, and the current history boundary does not itself validate that
> every counted entry is an atomic plan-capable goal. The target model for
> dated curriculum planning, effective teaching weeks, buffers, baselines,
> target pace and forecasts is defined in
> [Curriculum-Zeitachse, Pufferplanung und Soll-Ist-Lerntempo](curriculum-time-axis-and-pacing.md).
> Raw weekly velocity alone must not be presented as schedule adherence.

## Purpose
Learning Velocity is a didactic metric that reflects a learner's **consistency and momentum** over time.
It is designed to encourage steady practice ("don't break the chain") rather than short bursts.

## Definition
Learning Velocity is the count of newly mastered **atomic** goals per time unit.

**Default definition:**
-   **Atomic goals only:** Only leaf nodes count (no containers), to avoid inflation.
-   **Mastery threshold:** A goal is counted when mastery reaches **0.9** or higher.
-   **Time basis:** Group by calendar week (ISO week).

Formally, for week `w`:

```
velocity(w) = | { g is atomic | mastery[g] >= 0.9 and achieved_at(g) in week w } |
```

## Interpretation
- A stable sequence of non-zero weeks indicates consistent learning habits.
- Peaks can indicate sprint phases; gaps often signal interruptions or overload.
- Velocity is **not** a grading metric; it is a behavioral and motivational indicator.

## Recommended presentation (conceptual)
- **Weekly bar chart** over a recent window (e.g., last 8–12 weeks).
- **Recent achievements list** to reinforce tangible progress.

This is an example of presentation; UI specifics are intentionally flexible.

## Design principles
1. **Fairness:** Avoid counting container goals directly; only atomic goals count.
2. **Stability:** Use fixed time buckets to make progress visible and comparable.
3. **Motivation:** Keep the metric simple enough to be understood at a glance.

## Caveats
- Bulk imports or late updates can create artificial spikes.
- Learners with different time budgets are not directly comparable.
- Context switches (new curriculum or new phase) may temporarily reduce velocity.
- The current mutable mastery timestamp is not sufficient evidence for the
  first threshold crossing. Reliable pacing requires an append-only achievement
  event plus stable global and assignment-specific achievement projections.
- Calendar weeks do not represent teaching capacity: holidays, cancelled
  lessons and explicit buffers require an instructional calendar.

## Optional extensions (future)
- Moving average or trend line for smoothing.
- Separate velocity per subject or phase.
- Alerts for long inactivity gaps (opt-in).
