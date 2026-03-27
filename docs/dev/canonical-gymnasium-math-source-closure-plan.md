# Canonical Gymnasium Mathematics Source-Closure Plan

Snapshot: `2026-03-26`

This document complements the existing rollout artifacts:

- [canonical-gymnasium-math-de-expansion-plan.md](/home/enpasos/projects/skillpilot/docs/dev/canonical-gymnasium-math-de-expansion-plan.md)
- [canonical-gymnasium-math-bundeslaender-status.md](/home/enpasos/projects/skillpilot/docs/dev/canonical-gymnasium-math-bundeslaender-status.md)
- [math-bundesland-rollout-tracker.json](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/provenance/math-bundesland-rollout-tracker.json)

Its narrower purpose is different:

- not "how far is the operational rollout on the canonical spine?"
- but "how far is each Bundesland from a source-complete closure of its official mathematics source material?"

For Baden-Wuerttemberg, the current reference source is:

- [BP2016BW_ALLG_GYM_M.pdf](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf)

The same closure logic should be usable for all `16` Bundeslaender.

## Management view

This document uses one deliberately simple management score:

- `source-closure score` = completed closure gates / `6`

Closure gates:

| Gate | Meaning |
| --- | --- |
| `G1` | Official math source package archived in the DE-level input lane |
| `G2` | Lower-secondary source lane active (`snapshot` or equivalent retained source lane) |
| `G3` | Upper-secondary source lane active (`snapshot` or equivalent retained source lane) |
| `G4` | Lower-secondary inhaltsbezogene standards (`3.x`) broadly closed |
| `G5` | Upper-secondary inhaltsbezogene standards (`3.x`) broadly closed |
| `G6` | Non-core PDF remainder explicitly dispositioned (`1.x`, `2.x`, `4`, `5`): mapped, archived, or intentionally out of canonical-goal scope |

Resulting percentages:

| Completed gates | Score |
| ---: | ---: |
| `0/6` | `0%` |
| `1/6` | `17%` |
| `2/6` | `33%` |
| `3/6` | `50%` |
| `4/6` | `67%` |
| `5/6` | `83%` |
| `6/6` | `100%` |

Important interpretation:

- this is a source-closure score, not the existing rollout-phase score
- a Bundesland can already be operationally useful on the canonical spine while still being source-incomplete
- `100%` means: no known open source-coverage debt remains for the chosen official math source package

## Nationwide snapshot

Initial working estimate on `2026-03-26`:

- nationwide source-closure headline: `32%`
- states at `83%`: `3`
- states at `67%`: `1`
- states at `50%`: `4`
- states at `0%`: `8`

This is intentionally coarse. It is good enough for steering and ordering work; it is not intended as a legal or curricular certification number.

## 16-state matrix

| State | Score | Current basis | Main remaining closure debt | Next closure move |
| --- | ---: | --- | --- | --- |
| `DE-HE` Hessen | `83%` | broad lower/upper canonical donor lane | explicit disposition for residual non-core source sections | document and freeze residual source-policy boundary |
| `DE-BY` Bayern | `83%` | broad retained source lane on shared spine | explicit disposition for residual non-core source sections | document and freeze residual source-policy boundary |
| `DE-BW` Baden-Wuerttemberg | `83%` | source archived, lower + upper source lanes active, upper `3.4` / `3.5` broadly closed, lower `3.1`, `3.2.3`, `3.2.5`, the first broad `3.3.2 / 3.3.3` geometry strip, the late-Sek-I coordinate/vector follow-on, the broadened `3.3.4` differential-technique strip, and the first broad `3.3.5` stochastics strip are now reviewed on the shared spine | late Sek I is no longer broadly open, but residual row-granularity debt remains; residual non-core sections still undocumented as closure decision | close the remaining BW Sek-I residual `3.2.1 / 3.3.1` debt plus source-perfect cleanup inside the already active `3.3.2 / 3.3.3 / 3.3.4 / 3.3.5` strips, then disposition `1.2` / `1.3` / `2.x` / `4` / `5` |
| `DE-NI` Niedersachsen | `67%` | source archived, lower + upper source lanes active, upper active pilot surface broadly closed | lower-secondary still not broadly closed end-to-end; residual non-core sections still undocumented as closure decision | widen Sek I next |
| `DE-NW` Nordrhein-Westfalen | `50%` | lower + upper active corridors, useful canonical bridge | both stages still corridor-first rather than broad source closure | widen from first corridors toward broad lower/upper closure |
| `DE-BB` Brandenburg | `50%` | source archived, lower + upper lanes active, first reviewed corridors live | lower and upper still corridor-first; no broad source closure yet | widen lower-secondary first, then keep upper broadening |
| `DE-BE` Berlin | `50%` | source archived, lower + upper lanes active, first reviewed corridors live | lower and upper still corridor-first; no broad source closure yet | widen upper-secondary first, then lower-secondary |
| `DE-HB` Bremen | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-HH` Hamburg | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-MV` Mecklenburg-Vorpommern | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-RP` Rheinland-Pfalz | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-SH` Schleswig-Holstein | `50%` | source archived, lower + upper source lanes active, first source-native year-band / phase snapshots live, structural entry anchors bridged, widened coarse reviewed lower/upper surface live, all official `5/6` cells refined into smaller source atoms with first basic-counting, simple-mapping, narrower table-construction/table-reading, narrower diagram-reading/diagram-interpretation, and narrower early-figure/body bridges now in place, all official `7/8/9` cells refined into first later-Sek-I number, measurement, geometry, data/probability, and structures/functions corridors with the combined integer/rational-number atom now split into narrower integer/rational bridges, the combined percentage/interest atom now split into narrower percentage/interest source atoms on the same conservative canonical percentage anchor, the descriptive-statistics atom now split into narrower boxplot/distribution-interpretation bridges, the combined triangle/quadrilateral/congruence atom now split into narrower quadrilateral and triangle/congruence bridges, and the quadratic-function atom now split into narrower graph/representation/parameter bridges, and all official `10` cells refined into first trig, circle/sector, pyramid/cone, sphere, composite-body, trig/exponential-function, exponential-equation/logarithm, and similarity corridors, with the sole-child `Jahrgangsstufe 10: Raum und Form` cell now also bridged directly to the narrow similarity target, the late-Sek-I `Jahrgangsstufe 10: Groessen und Messen` and `Jahrgangsband 7/8/9: Groessen und Messen` cells now also narrowed directly to `Geometrie und Raum (Sek I)`, and the mixed early-geometry/body `Einfache geometrische Figuren und Koerper` cell no longer pointing only to the narrower figure-only branch | no broad `3.x` closure yet; reviewed surface is still partly coarse and corridor-level despite full Sek-I source refinement, no remaining unmapped Sek-I source atoms or clusters, and no remaining Sek-I atom-to-cluster bridges | widen reviewed canonical coverage on the fully refined SH Sek-I lane next |
| `DE-SL` Saarland | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-SN` Sachsen | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-ST` Sachsen-Anhalt | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |
| `DE-TH` Thueringen | `0%` | placeholder only | no active source lane | archive official source bundle and scaffold lanes |

## Reusable closure sequence for every Bundesland

The standard closure order should be:

1. archive the official mathematics source package under `curricula/DE/Gymnasium/input/<STATE>/...`
2. activate lower-secondary and upper-secondary source lanes with stable provenance
3. close the inhaltsbezogene standards `3.x` before spending time on non-core front matter
4. prefer a full lower-secondary close before over-widening already-strong upper-secondary lanes
5. only after `3.x` is broadly closed, document the disposition of `1.x`, `2.x`, `4`, and `5`
6. then treat the state as source-closed for mathematics

Working rule:

- `3.x` closure is the main curricular closure target
- `1.x`, `2.x`, `4`, and `5` must not stay implicit forever, but they also do not all need to become canonical atomic goals

Acceptable dispositions for residual non-core sections:

- mapped into canonical goals
- retained as provenance / policy note only
- retained as exam / operator metadata
- explicitly declared out of canonical-goal scope

## BW first: concrete closure plan

### Reference source

The BW source package is the combined Gymnasium mathematics PDF:

- [BP2016BW_ALLG_GYM_M.pdf](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_M.pdf)

Its relevant top-level structure is:

- `1.1` to `1.4` in [BW_M.txt](/home/enpasos/projects/skillpilot/tmp/bw_pdf_check/BW_M.txt#L112)
- `2.1` to `2.5` in [BW_M.txt](/home/enpasos/projects/skillpilot/tmp/bw_pdf_check/BW_M.txt#L117)
- `3.1` to `3.5` in [BW_M.txt](/home/enpasos/projects/skillpilot/tmp/bw_pdf_check/BW_M.txt#L130)
- `4. Operatoren` and `5. Anhang` in [BW_M.txt](/home/enpasos/projects/skillpilot/tmp/bw_pdf_check/BW_M.txt#L182)

### Current BW closure score

Current working score: `83%` = `5/6` gates

Completed:

- `G1` source archived
- `G2` lower-secondary source lane active
- `G3` upper-secondary source lane active
- `G4` lower-secondary `3.x` broadly closed
- `G5` upper-secondary `3.x` broadly closed

Open:

- `G6` residual non-core sections explicitly dispositioned

### What is already broadly closed in BW

The current repo note already records:

- BW Sek I is still partial in [math-structure-note.md](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/math-structure-note.md#L23)
- BW Sek II already reaches all inhaltsbezogene Kursstufen-Leitideen `3.4.1` to `3.5.5` in [math-structure-note.md](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/math-structure-note.md#L28)

That matches the active snapshots:

- lower-secondary pilot snapshot in [DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/lower-secondary/source-json/DE_BAW_S_GYM_1_MATHEMATIK.de.json.snapshot#L9)
- upper-secondary pilot snapshot in [DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/BW/upper-secondary/source-json/DE_BAW_S_GYM_2_MATHEMATIK.de.json.snapshot#L9)

### Exact BW gaps

Still open against the full source package:

1. lower-secondary content closure
- broadly closed on the active pilot lane: `3.1.1`, `3.1.2`, `3.1.3`, `3.1.5`, `3.2.3`, `3.2.5`
- materially widened but still not source-perfect: `3.3.2`, `3.3.3`, `3.3.4`, `3.3.5`
- still partial: `3.2.1`, `3.3.1`
- fully open on the active lower-secondary content lane: none
- not a real gap: `3.2.2`, because the source itself says `keine Inhalte in den Klassen 7/8`

2. non-core source disposition
- `1.2 Kompetenzen`
- `1.3 Didaktische Hinweise`
- `2.1` to `2.5 Prozessbezogene Kompetenzen`
- `4. Operatoren`
- `5. Anhang`

### BW closure order

The recommended BW close-out order is:

1. `3.1.1 + 3.1.2 + 3.1.3 + 3.1.5` for Klassen `5/6`
- status: done
- reason: fastest visible improvement in BW Sek I breadth

2. `3.2.3 + 3.2.5` plus the first broad residual debt in `3.2.1` for Klassen `7/8`
- status: materially done, but not yet source-perfect at row granularity
- reason: finishes the middle Sek-I band cleanly before adding more advanced `9/10` debt

3. `3.3.2 + 3.3.3` broad geometry / measurement widening in `Klassen 9/10`
- status: materially done, and the remaining coordinate/vector residue is now also closed on a dedicated Sek-I vector corridor
- reason: closes the cleanest non-duplicative late-Sek-I surface first and keeps BW learner-facing Sek I broad without leaking into Sek II

4. `3.3.5` broad data / probability widening in `Klassen 9/10`
- status: materially done, but not yet source-perfect at row granularity
- reason: closes the last still-broadly-open late-Sek-I content lane before the remaining fine-grained cleanup

5. remaining debt in `3.2.1`, `3.3.1`, and the still-open fine-grained residual rows inside the already active `3.3.2 / 3.3.3 / 3.3.4 / 3.3.5` strips
- reason: finishes late Sek I end-to-end without forcing fragile duplicate routes into the learner-facing BW tree

6. explicit residual-section disposition note for:
- `1.2`
- `1.3`
- `2.x`
- `4`
- `5`

7. after that, raise BW from `83%` to `100%`

### BW exit criteria

BW counts as source-closed only when all of the following are true:

- all lower-secondary inhaltsbezogene sections `3.1` to `3.3` are either broadly mapped or explicitly declared intentionally out of canonical-goal scope
- upper-secondary sections `3.4` and `3.5` remain fully covered
- the learner-facing BW views no longer expose obvious Sek-I breadth holes
- `1.x`, `2.x`, `4`, and `5` have an explicit retained / mapped / out-of-scope decision
- the closure decision is documented in persisted provenance, not only in ad-hoc chat context

## Suggested maintenance rule

Whenever one Bundesland moves materially on source closure:

1. update this plan document
2. update the relevant state provenance note
3. if the operational rollout phase changed, update `math-bundesland-rollout-tracker.json`
4. regenerate [canonical-gymnasium-math-bundeslaender-status.md](/home/enpasos/projects/skillpilot/docs/dev/canonical-gymnasium-math-bundeslaender-status.md)

This keeps the management view, the closure view, and the operational rollout view aligned without mixing them into one oversized status file.
