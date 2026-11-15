# Elementary table/diagram delivery — frozen candidate

15 November 2026. **Inactive revised author candidate, ready for genuinely independent content review.** All work stays under this directory. No active app/curriculum/documentation, retained input, V9 proof, release status or learner result was changed. No commit or push was made. The final delivery remains one integrated follow-up on `main` with a fresh fully successful CI run, after the first delivery integrates.

## Concrete changes

The exact complete current ordinary objects are preserved except for their `requires` lists:

| Target | Proposed direct prerequisites |
| --- | --- |
| `f39c49c7` create/label tables | `f6b13b8e` rational number line |
| `c9df47fa` read/compare tables | `4eeab7d5` rational addition/subtraction and `f6b13b8e` rational number line |
| `5e7d5ff2` read diagrams | `f6b13b8e` rational number line |
| `0c2ddfcd` interpret simple diagrams | retain `5e7d5ff2`, add `4eeab7d5` |

The fourth edit is necessary: the full current P of `0c` demands a quantified difference. Native measurement proves addition/subtraction is absent from the three-edge variant; `0c-arithmetic-witness.actual.json` and `five-context-audit.md` document the concrete deficiency and correction. Full negative/decimal/fraction meanings remain; no ordinary description or source claim is narrowed.

Three fresh original assessments have separate UUIDv5 identities, each requiring and covering exactly its one target. Namespace `68a8ac50-f5f5-4e24-8aa9-5e408ca01ced`, name prefix `canonical-math-seki-elementary-assessment-20261115-v1:` and keys below reproduce the IDs:

| Key | Assessment ID | Coverage |
| --- | --- | --- |
| `construct-tables` | `54ce7136-5bdd-5d36-b0a5-f9a781bff82a` | `f39c49c7-003b-471a-a33e-6cfea1d7b7b1` |
| `read-tables` | `148a0b27-5895-5331-ab90-bf40c0ee5d5c` | `c9df47fa-81a9-4890-91b7-2cc80da813cb` |
| `read-diagrams` | `4f265904-c805-57c3-8b40-25a1d32c7e7f` | `5e7d5ff2-b92c-4989-85bc-8d87ad7edadd` |

Each has two independent cases, four adequate-core criteria scored 0/1/2, maximum/passing 8/8. Full core credit means adequate independent performance, with explicit fair treatment of equivalent tables/units/fractions, Kelvin temperature differences, halving/common-price statements and isolated arithmetic slips supported by the rest of the answer. It does not require error-free arithmetic or excuse omitted performance. Both complete rubric languages appear in native scoring `description` strings because the existing scalar schema has no localized step field. Localized Markdown also carries each full rubric.

All previous review findings are concretely addressed: English table reading uses actual Markdown tables; the table-reading temperatures differ from construction; construction A's title is explicit; counts name entities without inventing a physical unit; four actual localized diagram SVG/PNG variants are supplied with larger labels. No diagram-construction claim is added to the reading assessment. New task figures are justified precise assessment stimuli, not replacement goal illustrations or copied third-party pictures.

The technical placement proposal appends the three assessments to existing J6 folder `7a2a5706`. Its existing Sek-I paths remain. Applicability is copied from each exact covered target, and `applicabilityFromRequires` plus boundary semantics follow existing assessment conventions. This is not an official nationwide year-6 assignment. No source mapping is invented; current HE/BW/SH witnesses, including partial status, are retained in `source-witnesses.actual.json`. Duration regeneration and final backend target/support acceptance are still required.

## Actual measured evidence

- Full native graph CQR-001 auditor: **21/21 proposed canonical roots pass**, covering references, DAGs, atomic endpoints, explicit types and transitive minimality. Full runtime schema passes. No redundant direct edge was found.
- Complete frozen current inventory: **21 catalogs / 6,538 goals**, proposed **6,541 goals** including three new assessments. Existing closure changes are exactly five Mathematics contexts; none in Physics. Secured ordinary before → after: f39 **27→4**, c9 **28→19**, 5e **29→4**, 0c **30→20**, existing J6 Task6 **48→39**. Full added/removed objects and bilingual native contexts are retained.
- Existing J6 Task6 `47c515c9` is byte-equivalent as a goal object: task, solution, scoring, coverage, source and ID unchanged. Its needed table-frequency preparation remains on `Task6 → acbb7e26 → 91571d3f`; the latter's full current P explicitly includes a frequency-table construction case. Concrete witness and all other retained task demands are documented. Its old aggregate pass is never treated as new coverage evidence.
- Native authoring compiler: **88 Mathematics views, zero errors** with the proposed catalog. Each new assessment belongs to **54 authored target subtrees** before final applicability/learning-closure filtering. This is an authored-placement measurement, not final backend Personal Curriculum or host acceptance.
- Actual task Markdown uses the same ReactMarkdown/GFM/math/KaTeX components as `GoalCard.tsx`, rendered in Chromium at **320/375 px**, DE and EN. Each language produced **two actual tables and two localized figures**, no document/table overflow. Minimum figure text is **15.6/18.58 CSS px** at 288/343 px image width. Actual screenshots were opened and inspected; scales, signs, values, category roles and labels are coherent and unclipped. This is an isolated task surface with 16px inset, not the complete application or a real host.
- All four existing original goal images were actually opened and checked as an author. They remain unchanged and fit the full retained competencies; final independent goal review and current V checks remain separate.
- Scalar omission-bound enumeration: all **81** score vectors checked; only `[2,2,2,2]` passes. This proves no inadequate criterion can be compensated; it is not a semantic fairness/coverage verdict.

## Review and integration

Start with `reviewer-instructions.md`. `candidate-manifest.actual.json` pins the entire review candidate. `native-review-obligations.md` identifies genuine current D/P/A/M/V, semantic-kind, assessment, route and source obligations with native code pointers. `physics-edge-decisions.md` individually evaluates both later Physics edges; neither reroute is included or approved for downstream activation here.

Reproduce author checks from the repository root:

```bash
python tmp/elementary-diagram-delivery-20261115/build_candidate.py
python tmp/elementary-diagram-delivery-20261115/extract_review_evidence.py
./app/node_modules/.bin/tsx tmp/elementary-diagram-delivery-20261115/measure_native.mts
./app/node_modules/.bin/tsx tmp/elementary-diagram-delivery-20261115/measure_placements.mts
./app/node_modules/.bin/tsx tmp/elementary-diagram-delivery-20261115/render_candidate.mts
```

The builder intentionally fails on catalog drift. Review first-wave integration changes before rebuilding. The checked payload application is object-scoped, so unrelated integrated catalog changes are allowed. After independent review, from this checkout run against the chosen integration checkout:

```bash
python tmp/elementary-diagram-delivery-20261115/apply_candidate.py --target-root /absolute/path/to/integration-checkout
python tmp/elementary-diagram-delivery-20261115/apply_candidate.py --target-root /absolute/path/to/integration-checkout --apply
```

The first command is dry-run. The second writes only the four reviewed ordinary changes, three fresh assessments, parent append and 14 material/figure files. It keeps `needs_review`; it does not manufacture release or native approvals. The full canonical diff is `canonical.patch`; object-safe apply is preferred after first-wave catalog additions.

Then implement the concrete native evidence obligations, release only the genuinely approved current assessments and regenerate/check actual duration views. The normal final checks include, from the integration checkout:

```bash
python scripts/validate_schemas.py
npm --prefix app run generate:math-duration-composition-views
npm --prefix app run check:math-duration-composition-views
npm --prefix app run validate:composition-views
npm --prefix app run quality:deep-understanding-rollout:check
npm --prefix app run quality:curriculum-status
npm --prefix app run check:curriculum-maturity-floors
npm --prefix app run validate:learning-units:offered
```

Use the existing actual native D batch pipeline (`materializeGoalDescriptionRolloutBatch.ts prepare/check/summarize/finalize --config ...`), two genuine current independent review runs, and exact current source/profile bindings before the final deep check; details are in `native-review-obligations.md`. Do not treat these local commands or this candidate as current native release acceptance. Keep all floors unchanged. Preserve source/retained-evidence pins and old learner-result contracts, integrate the one follow-up delivery, update the current management summary after actual integration, and require fresh fully successful CI on integrated main.
