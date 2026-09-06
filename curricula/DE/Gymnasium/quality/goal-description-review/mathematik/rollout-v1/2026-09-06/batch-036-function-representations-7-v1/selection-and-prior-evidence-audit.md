# Mathematics B036 bounded selection and prior-evidence audit

Started 2026-09-06T09:14:31Z; completed 2026-09-06T09:23:12Z.
No reviews, candidate profiles, reservations, generation or global status changes were performed.

## Selection

Native `loadGoalBookBuildInputs` rebuilt the current source model in memory and matched the published Math book and Root checkpoint digest exactly:
`sha256:24a5ac6024a94423a5a6cad76be3f1eeae2d904b2917f96bb7d74dd6941a3fa7`.

The guarded checkpoint is Root's verified **280/796 strict**, D280/P280, atomicity/memory/visualization796, zero issues. This audit did **not** rerun the expensive central report. It checked 280 unique registered D IDs, 280 unique registered P IDs, identical D/P sets, native full coverage of exactly 796 authoritative curricularAtomic goals, current source hashes and the applicable in-flight exclusions. The completed 24-goal expert pool (B034's17 + B035's7) is completely included in the excluded completed set.

Three Math holds remain excluded: `09f47964-2cd0-410e-93ee-9632b582fc91`, `1bc118c3-1f05-5f2a-b125-418017180d75`, `a8ff2666-8df3-4253-8021-3efe42114e40`.

Native `selectGoalDescriptionRolloutCandidates`, strategy `coherent-area-phase`, maximum20, selects **seven** contiguous remaining atlas pages197–203 in the E-phase representation block. The next remaining page204 changes the metadata phase to J7, so the native coherence strategy deliberately stops rather than filling to20. These are all neighbours in the atlas section “Funktionen und ihre Darstellung”.

| Atlas page | Goal ID | Title | Old D evidence | Record suffix and line |
| --- | --- | --- | --- | --- |
| 197 | `cf4fe700-dec2-502f-888b-90acefa307bb` | Informationen aus Darstellungen entnehmen | keep; goal/text match | `batch-007.records.jsonl:18` |
| 198 | `0272c501-2931-5e52-b62f-af068db63c44` | Aus Term einen Graphen erstellen | keep; goal/text match | `batch-007.records.jsonl:19` |
| 199 | `99bfb566-f875-5646-ac3e-05a039838c54` | Termmerkmale aus Graphen ableiten | revise; changed EN + goal fingerprint | `batch-007.records.jsonl:20` |
| 200 | `7ba19509-8ee6-50e0-a411-a371f05b1801` | Verschiebungen und Streckungen von Funktionsgraphen erkennen | keep; goal/text match | `batch-008.records.jsonl:1` |
| 201 | `1801c759-d92d-5bfb-a44f-cfd2455d207b` | Funktionsgleichungen aus Graphen bestimmen | keep; goal/text match | `batch-008.records.jsonl:2` |
| 202 | `b04d65dc-1214-5323-89a7-317d6b099e1a` | Zwischen Tabelle, Graph und Term wechseln | keep; goal/text match | `batch-008.records.jsonl:3` |
| 203 | `42b57670-d2be-5da2-be2f-d58055901813` | Übertragungen begründen und prüfen | keep; goal/text match | `batch-008.records.jsonl:4` |

Record suffixes above are relative to:
`tmp/goal-description-reviews/math-gymnasium-full-20260816-v1/review-campaign/results/codex-first-pass-20260816-v1.`

The companion `../batch-036-function-representations-7-v1.config.json` passed the native batch-config schema loader. `buildGoalDescriptionRolloutSubsetModel` validated the source-atlas subset in memory, including exact ordered7 IDs and prerequisite-safe order:
`sha256:7c3228cf0fa28432222a22e11c5933d5339a41f953480713e62394b6a113a2d9`.
No subset model, book, PDF, bundle, campaign or review was generated on disk. The config is proposed selection only; **no in-flight claim was created**.

## Existing evidence and usable scope

- **Durable direct Description records:0. Direct resolutions:0.**
- **Historical tmp direct Description records:7**, exactly one per selected goal, all from one old first-pass independence group. All seven record objects still satisfy the current individual record schema.
- **Six old keep records have identical current DE/EN text and native goal fingerprints.** Preserve them as historical reasoning/evidence anchors. They do not constitute current strict closure: their original input uses schemaVersion1, has neither canonicalContext nor full reviewContext.page for these goals, and there is no second independent current record or resolution. Their old prompt and criteria fingerprints differ from today's v2 prompt/Math criteria. Page-fingerprint differences from a differently laid-out atlas alone were **not** used to infer semantic staleness.
- **99bfb566… has an old revise record and genuinely changed English description / goal fingerprint.** Old English demanded stating a suitable function equation; current English requires describing corresponding expression features using mathematical terminology. It is historical adjudication evidence only, not a current review.
- **Positive V2 profiles:0 bound records and0 unbound candidate bodies found** for these seven IDs in the searched durable quality lanes and relevant tmp. No matching positive config exists under the durable goal-evidence directory, registered or unregistered. Old Description `evidenceProfileRecommendation:create` is not a profile and grants no P credit.
- **Current strict D/P evidence reusable without new contextual review/materialization:0 goals.** This conclusion is scoped to these seven, not a recommendation to rerun all Math. Existing historical records remain intact and precisely located for any later non-blind reconciliation.

Search coverage:1169 candidate Description record/resolution-ledger files across durable goal-description-review and tmp/goal-description-reviews, tmp/goal-description-pilots, tmp/goal-books; a second recursive own-goal JSON/JSONL sweep checked197 matching files including unconventional filenames and found the same7 records, no resolution. Fourteen hits from copied atomicity/memory ledgers were explicitly excluded from D counts. Positive discovery examined1841 files containing the positive understanding field in durable quality and tmp, excluding node_modules and generated deployment/package-store copies. No parse errors.

## Reproduction and artifacts

All writes are bounded to this new batch and its companion config, using apply_patch:

- `selection-audit.ts`: checkpoint guards, native current-source load, native selection and in-memory subset validation; stdout only.
- `selection-audit.json`: exact selection, source bindings, central index/config hashes, exclusions and subset result.
- `prior-evidence-discovery.ts` / `prior-evidence-discovery.json`: targeted direct D/P discovery, counts and paths.
- `prior-evidence-currency.ts` / `prior-evidence-currency.json`: independent wider own-goal scan, current record-schema check, native goal fingerprints, exact DE/EN comparisons and scoped checkpoint recheck.
- This note.

Scripts run with `app/node_modules/.bin/tsx <path>` and do not write artifacts themselves. Selection script initial import-path typo was corrected before the successful native run. No central registry, in-flight ledger, canonical goal, previous evidence record or profile was changed. Math checkpoint subject paths and their hashes still matched at the final currency check (2026-09-06T09:21:34.496Z); Root subsequently confirmed Math280/796 and the book digest unchanged while Physics registry work proceeded independently.
