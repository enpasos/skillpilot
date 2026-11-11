## Learning Velocity {#sec:learning-velocity}

:::note{title="Boundary to Cockpit History and Schedule Status"}
The current Cockpit chart counts **recorded completion events**, not mutable mastery update timestamps. An event can represent a renewed completion on a later calendar day rather than necessarily a lifetime first transition to mastered, and the event ledger includes completion markers such as orientation without certifying subject-matter mastery. Raw weekly velocity alone must **not** be presented as schedule adherence; authoritative schedule evaluation is governed by @ref{sec:unified-plan-status}, and broader calendar-pacing exploration is documented in [Curriculum Time Axis and Pacing](repo:docs/concept/didactic/curriculum-time-axis-and-pacing.md).
:::

### Purpose and conceptual definition {#sec:velocity-definition}

Learning Velocity is a didactic momentum metric reflecting a learner's **consistency over time** — encouraging steady habits (*"don't break the chain"*) rather than isolated cramming bursts.

Conceptually, Learning Velocity is the count of newly mastered **atomic** goals per calendar week $w$:

$$
\mathrm{velocity}(w) = \bigl|\{\, g \in A \mid \mathrm{mastered}(g) \land \mathrm{achieved\_at}(g) \in w \,\}\bigr|.
$$

- **Atomic goals only:** Only leaf goals count (never cluster containers), preventing structural double-counting.
- **Binary goal outcome:** A goal is either mastered or not mastered; there is no partial goal credit. The current storage compatibility threshold `mastery >= 0.9` interprets persisted values and is not a grading scale or permission for partial mastery.
- **Calendar basis:** The present Cockpit implementation ("recorded completions", see [Daily Learning Progress](repo:docs/concept/runtime-workflows/daily-learning-progress.md)) groups events by `Europe/Berlin` calendar weeks, counts the same goal at most once per day, and keeps legacy undated history visible without backfilling it into the chart.

### Interpretation, design principles, and caveats {#sec:velocity-caveats}

- **Behavioral indicator, not a grade:** A steady sequence of non-zero weeks signals sustainable learning habits; peaks often reflect sprint phases and gaps highlight interruptions or overload.
- **Fairness, stability, motivation:** Counting only atomic goals across fixed weekly buckets (such as an 8–12 week bar chart alongside recent achievements) keeps the indicator transparent at a glance.
- **No import spikes:** Imports and mutable update timestamps must not fabricate completion spikes; the transactional completion ledger excludes them rather than reconstructing artificial timestamps.
- **Non-comparability across learners and calendars:** Learners have different time budgets, atomic goals vary in effort, context switches (a new subject or phase) can temporarily lower weekly counts, and raw calendar weeks do not model holidays, cancelled lessons, or explicit buffers.
- **Optional future extensions:** Moving-average trend lines, per-subject or per-phase breakdowns, and strictly opt-in inactivity reminders.
