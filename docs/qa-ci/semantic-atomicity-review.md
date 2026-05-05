# Semantic Atomicity Review

This QA lane checks whether technical content leaf goals are also semantically atomic.

Rule version `semantic-atomicity-v1`:

- A technical content leaf goal is semantically atomic only if it contains exactly one content learning goal.
- It should name one assessable competence, not a list of independent routines.
- Conjunctions such as "berechnen und deuten" are not automatically wrong; they are review signals.
- The decision is semantic, not algorithmic. Scripts only track coverage and staleness.

The review scope intentionally excludes non-content leaves:

- terminal practice / assessment nodes (`Practice`, `Assessment`, or `examData`)
- motivation / orientation anchors (`Motivation`, `Orientation`)
- memorization/SRS deck leaves (`memorization` or `srs-deck:*`)

These nodes are validated in their own lanes, for example route coverage, terminal autonomy, SRS, or assessment-data checks.

## Review Statuses

- `atomic`: reviewed as semantically atomic; `semanticAtomic` must be `true`.
- `needs_developer_review`: reviewed, but the reviewer is not confident enough to mark it atomic; `semanticAtomic` must be `null`.
- `non_atomic`: reviewed as too broad; `semanticAtomic` must be `false` and a split should be planned.

## Pilot

The current pilot is:

- Config: `curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-j8-linear-functions-pilot.config.json`
- Review ledger: `curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-j8-linear-functions-pilot.review.jsonl`
- Scope root: `Lineare Funktionen rechnerisch untersuchen`

Run:

```bash
cd app
npm run quality:semantic-atomicity
npm run quality:semantic-atomicity:check
```

`check` fails only for process problems:

- a technical leaf in scope has no review record
- a reviewed leaf changed semantically and its fingerprint is stale
- review records are malformed or duplicated

Known `needs_developer_review` and `non_atomic` records stay visible as a queue but do not make the process check fail. This lets the pipeline protect incremental graph edits while still keeping human review decisions explicit.

The local Workbench route `/semantic-atomicity-review` can load and edit these ledgers. It is only a file/status editor: semantic bulk review is still done from the Codex command line, then persisted in the JSONL ledger.

## Fingerprints

Each review record stores a fingerprint over semantic fields:

- title / English title
- description / English description
- `shortKey`
- phase, area, topic code
- node kind

If one of these fields changes, the record becomes stale. The goal must be reviewed again before the fingerprint is updated.

For an initial review batch only, fingerprints can be written mechanically after the reviewer has filled the decisions:

```bash
cd app
npm run quality:semantic-atomicity -- --write-fingerprints
```

Do not use `--write-fingerprints` to bypass stale reviews after content changes. It is only the final bookkeeping step after a semantic re-review.

## Expanding The Process

To review another subtree:

1. Add a new config file under `curricula/DE/Gymnasium/quality/semantic-atomicity/`.
2. Point it at the canonical landscape and one or more subtree roots.
3. Create a JSONL ledger with one record per technical leaf.
4. Run `npm run quality:semantic-atomicity -- --config=<path>`.
5. Once decisions are filled, run `--write-fingerprints`.
6. Add the config to CI only after the first review batch is complete.
