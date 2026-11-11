## Semantic Atomicity Review {#sec:qa-semantic-atomicity}

:::note{title="Rule version semantic-atomicity-v1"}
This QA lane verifies whether technical content leaf goals (empty `contains`) are also **semantically atomic** (`CQR-301` in @ref{sec:qa-cqr-catalog}). Tooling tracks coverage and fingerprint freshness only; the atomicity judgment itself is strictly semantic rather than algorithmic.
:::

### Domain Criterion, Scope Exclusions, and Review Statuses {#sec:qa-atomicity-criteria}

Under `semantic-atomicity-v1`, a technical content leaf goal is semantically atomic if and only if it expresses **one cohesive assessable competence** rather than a bundle of independent routines (conjunctions such as *"calculate and interpret"* act as review signals rather than automatic failures). Non-content leaves are intentionally excluded and validated in their dedicated lanes:

- terminal practice and assessment nodes (`Practice`, `Assessment`, or `examData`),
- motivation and orientation anchors (`Motivation`, `Orientation`),
- memorization and SRS deck leaves (`memorization` or `srs-deck:*`).

:::table{cols="4.6cm,X"}
| Review status | Meaning in the JSONL ledger |
| --- | --- |
| **`atomic`** | Reviewed and accepted as semantically atomic (`semanticAtomic: true`). |
| **`needs_developer_review`** | Escalated for closer subject/developer review (`semanticAtomic: null`). |
| **`non_atomic`** | Too broad; scheduled for splitting (`semanticAtomic: false`). |
:::

### Active Configurations, Fingerprints, and Expansion Workflow {#sec:qa-atomicity-workflow}

Configuration files and JSONL review ledgers reside under `curricula/DE/Gymnasium/quality/semantic-atomicity/`, for example the pilot lane `canonical-math-j8-linear-functions-pilot`, the foundational lane `canonical-chemistry-sek1-foundations` (with 26 accepted atomic leaves), and the full-subject lanes `canonical-physics-full` and `canonical-math-full`. In the local Workbench, route `/semantic-atomicity-review` provides an interactive status editor while CLI scripts run the checks:

```bash
cd app
npm run quality:semantic-atomicity
npm run quality:semantic-atomicity:check
```

`quality:semantic-atomicity:check` fails on process violations (missing in-scope record, stale fingerprint after semantic edits, malformed or duplicate rows), whereas known `needs_developer_review` and `non_atomic` items remain visible in the `CQR-301` (`M5`) queue. Every record stores a **semantic fingerprint** over `title`/`titleEn`, `description`/`descriptionEn`, `shortKey`, `phase`/`area`/topic code, and `nodeKind` (`--write-fingerprints` may be run solely as final bookkeeping after an actual semantic review).

**Six steps to onboard a new subtree:** (1) add a `.config.json` under `curricula/DE/Gymnasium/quality/semantic-atomicity/`, (2) reference the canonical landscape and subtree roots, (3) initialize `.review.jsonl` with one record per content leaf, (4) run `npm run quality:semantic-atomicity -- --config=<path>`, (5) write `--write-fingerprints` once semantic decisions are recorded, and (6) wire the config into CI only after the initial batch is complete.
