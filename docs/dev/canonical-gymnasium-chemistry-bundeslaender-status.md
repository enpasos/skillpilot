# Canonical Gymnasium Chemistry Bundeslaender Status

Snapshot: `2026-05-12T01:05:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
- `docs/qa-ci/status/curriculum-quality-status.json`
- Chemistry `*.source-extraction.json` files under `curricula/DE/Gymnasium/input`
- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- `scripts/render_canonical_chemistry_bundesland_status.py`

## Headline

- Tracked states: `16`
- Source inventories readable and registered: `16/16`
- Source-backed projections clean: `16/16`
- Source atomic goals: `5865`
- Source atomic goals mapped into views: `5865`
- Extracted Chemistry source goals in local source-extraction files: `5813`
- Local Chemistry source-extraction files: `31`
- Unsupported assigned atomic goals: `0`
- States with source extraction active (`P2+`): `16/16`
- States with clean source-backed projection (`P4+`): `16/16`
- States with broad coverage (`P5+`): `16/16`
- States operationally cutover-ready (`P6`): `16/16`
- Active canonical corridors: `1/6`
- Priority `backlog`: `16`

## Evidence watch

- Manifest: `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- Status view: `docs/dev/canonical-gymnasium-chemistry-evidence-watch-status.md`
- Delta view: `docs/dev/canonical-gymnasium-chemistry-evidence-watch-delta.md`
- Local run: `./scripts/run_canonical_chemistry_evidence_watch.sh`
- Scheduled workflow: `.github/workflows/canonical_chemistry_evidence_watch.yml`
- Interpretation: file-level deltas are maintenance signals; active rollout reopens only when the watch manifest's documented reopen rules are satisfied.

## Steering model

- Primary work unit: `source_onboarding_tranche`
- Canonical view rule: Treat the canonical DE Chemistry landscape as a curated pedagogical source of truth, not as a raw union of state package wording.
- State view rule: Treat Bundesland views as source-backed projections over the canonical Chemistry spine; do not assign atoms to a state without registered source evidence or an explicit reviewed applicability decision.
- Execution sequence:
  - First archive the official Chemistry source materials for each still-missing Bundesland lane locally under the DE-level input structure, for Sek I and Sek II where applicable.
  - Create source extractions and registry entries before widening mappings, applicability, or composition views.
  - Map each new state through reviewed source-to-canonical edges, preferring conservative partial bridges over premature canonical atom growth.
  - Only add canonical Chemistry atoms when the shared DE graph is pedagogically incomplete, not merely because one state phrases a package differently.
  - Regenerate applicability, composition views if needed, source coverage audit, curriculum quality status, and backend runtime fences before merging a rollout delta.
- Canonical atom admission:
  - Add a canonical Chemistry atom only if it improves the shared DE Chemistry graph.
  - Do not add canonical atoms only to mirror one state's table structure, wording, or package boundary.
  - Keep missing-state work source-led until the official local inventory is present.

## Canonical corridor register

| Corridor | Status | Focus states | Next step |
| --- | --- | --- | --- |
| `CHEM.HE_BY_BASE` Hessen and Bayern canonical Chemistry base | `completed` | `DE-HE`, `DE-BY` | Keep Hessen and Bayern on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and learner-facing Chemistry views together whenever a curriculum revision changes visible scope. |
| `CHEM.SOURCE_BACKED_TEN_STATE_PASS` Source-backed ten-state Chemistry projection pass | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-NI`, `DE-NW`, `DE-SH` | Treat the current ten-state source-backed projection surface as stable. Reopen a covered state only when a source revision changes visible scope or when a later all-state Chemistry row exposes a genuine shared canonical gap. |
| `CHEM.REMAINING_SOURCE_ONBOARDING` Remaining Chemistry source onboarding tranche | `completed` | `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | All tracked Chemistry Bundesland source lanes are source-backed and clean on P4; keep the source onboarding tranche closed unless an official source revision changes evidence. |
| `CHEM.HORIZONTAL_TOPIC_GAP_REVIEW` Horizontal all-state Chemistry topic-gap review | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | F4 is closed: 710 broad cluster-target mappings were reviewed or accepted as package evidence, with no shared canonical atom gap proven. |
| `CHEM.P5_BROADENING_AND_CUTOVER_MAINTENANCE` P5 broad coverage and cutover maintenance | `completed` | - | All tracked Chemistry Bundesland lanes are cutover-ready on P6; reopen this corridor only if a source revision or runtime regression creates a non-cutover maintenance lane. |
| `CHEM.P6_CUTOVER_READY_MAINTENANCE` P6 cutover-ready Chemistry maintenance | `active` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HE`, `DE-HH`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Chemistry is now in P6 maintenance / evidence-watch mode with no open canonical residue lane. Use the machine-readable watch manifest `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`, the rendered watch status `docs/dev/canonical-gymnasium-chemistry-evidence-watch-status.md`, the baseline-driven delta view `docs/dev/canonical-gymnasium-chemistry-evidence-watch-delta.md`, the fixed run path `./scripts/run_canonical_chemistry_evidence_watch.sh`, and the scheduled workflow `.github/workflows/canonical_chemistry_evidence_watch.yml` as the operational watch surface. Keep cutover-ready Chemistry states on maintenance only: refresh retained source evidence, runtime mappings, archive-only fences, composition views, and learner migration checks together only when a source revision or watched file delta changes visible scope. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Hessen and Bayern base | `completed` |
| `F2` Ten-state source-backed projection pass | `completed` |
| `F3` Remaining state source onboarding | `completed` |
| `F4` Horizontal all-state Chemistry topic pass | `completed` |
| `F5` Cutover, maintenance, and evidence watch | `active` |

## State phase scale

| Phase | Score | Meaning |
| --- | ---: | --- |
| `P0` No source lane | `0%` | No local Chemistry source inventory is registered or extracted for this state. |
| `P1` Source archived | `15%` | Chemistry source material is archived in the DE-level input lane. |
| `P2` Source extraction active | `30%` | Chemistry source extraction and source-landscape registry entries are active. |
| `P3` Mapping review active | `50%` | Source-to-canonical Chemistry mappings are under active review. |
| `P4` Source-backed projection clean | `65%` | The declared Chemistry inventory has clean source-backed atom-level projection coverage. |
| `P5` Broad state coverage | `85%` | The state has broad reviewed Chemistry coverage across the active canonical spine. |
| `P6` State cutover ready | `100%` | The state is operationally ready on the canonical Chemistry landscape. |

## State view

| State | Operational phase | Score | Visible atoms | Source atoms | Extracted source goals | Extraction files | Source mapped | Unsupported | Mappings | Source status | Source stage | Priority |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | --- |
| `DE-BB` Brandenburg | `P6` State cutover ready | `100%` | `143` | `271` | `271` | `2` | `271` | `0` | `507` | `clean` | `cutover_ready` | `backlog` |
| `DE-BE` Berlin | `P6` State cutover ready | `100%` | `143` | `271` | `271` | `2` | `271` | `0` | `507` | `clean` | `cutover_ready` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P6` State cutover ready | `100%` | `143` | `191` | `191` | `2` | `191` | `0` | `337` | `clean` | `cutover_ready` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `334` | `384` | `332` | `1` | `384` | `0` | `468` | `clean` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P6` State cutover ready | `100%` | `163` | `130` | `130` | `2` | `130` | `0` | `377` | `clean` | `cutover_ready` | `backlog` |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `334` | `324` | `324` | `2` | `324` | `0` | `473` | `clean` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P6` State cutover ready | `100%` | `118` | `162` | `162` | `2` | `162` | `0` | `526` | `clean` | `cutover_ready` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P6` State cutover ready | `100%` | `128` | `236` | `236` | `2` | `236` | `0` | `999` | `clean` | `cutover_ready` | `backlog` |
| `DE-NI` Niedersachsen | `P6` State cutover ready | `100%` | `190` | `529` | `529` | `2` | `529` | `0` | `1440` | `clean` | `cutover_ready` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P6` State cutover ready | `100%` | `99` | `233` | `233` | `2` | `233` | `0` | `2016` | `clean` | `cutover_ready` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P6` State cutover ready | `100%` | `140` | `390` | `390` | `2` | `390` | `0` | `1541` | `clean` | `cutover_ready` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P6` State cutover ready | `100%` | `143` | `321` | `321` | `2` | `321` | `0` | `1019` | `clean` | `cutover_ready` | `backlog` |
| `DE-SL` Saarland | `P6` State cutover ready | `100%` | `141` | `902` | `902` | `2` | `902` | `0` | `3756` | `clean` | `cutover_ready` | `backlog` |
| `DE-SN` Sachsen | `P6` State cutover ready | `100%` | `144` | `478` | `478` | `2` | `478` | `0` | `2592` | `clean` | `cutover_ready` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P6` State cutover ready | `100%` | `124` | `594` | `594` | `2` | `594` | `0` | `2477` | `clean` | `cutover_ready` | `backlog` |
| `DE-TH` Thueringen | `P6` State cutover ready | `100%` | `134` | `449` | `449` | `2` | `449` | `0` | `2007` | `clean` | `cutover_ready` | `backlog` |

## Immediate queue

- none

## Next steps

- `DE-BB`: Keep Brandenburg on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-BB Chemistry composition views together if Berlin-Brandenburg Chemistry source material changes.
- `DE-BE`: Keep Berlin on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-BE Chemistry composition views together if Berlin-Brandenburg Chemistry source material changes.
- `DE-BW`: Keep Baden-Wuerttemberg on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-BW Chemistry composition views together if BW Chemistry source material changes.
- `DE-BY`: Keep Bayern on maintenance only; refresh mappings, applicability, and learner-facing scope together if LehrplanPLUS source material changes.
- `DE-HB`: Keep Bremen on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-HB Chemistry composition views together if Bremen source material changes.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and state-scoped Chemistry composition views together whenever a curriculum revision changes visible scope.
- `DE-HH`: Keep Hamburg on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-HH Chemistry composition views together if Hamburg Chemistry source material changes.
- `DE-MV`: Keep Mecklenburg-Vorpommern on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-MV Chemistry composition views together if MV Chemistry source material changes.
- `DE-NI`: Keep Niedersachsen on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-NI Chemistry composition views together if Niedersachsen Chemistry source material changes.
- `DE-NW`: Keep Nordrhein-Westfalen on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-NW Chemistry composition views together if NRW Chemistry source material changes.
- `DE-RP`: Keep Rheinland-Pfalz on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-RP Chemistry composition views together if Rheinland-Pfalz Chemistry source material changes.
- `DE-SH`: Keep Schleswig-Holstein on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-SH Chemistry composition views together if Schleswig-Holstein Chemistry source material changes.
- `DE-SL`: Keep Saarland on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-SL Chemistry composition views together if Saarland Chemistry source material changes.
- `DE-SN`: Keep Sachsen on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-SN Chemistry composition views together if Sachsen Chemistry source material changes.
- `DE-ST`: Keep Sachsen-Anhalt on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-ST Chemistry composition views together if Sachsen-Anhalt Chemistry source material changes.
- `DE-TH`: Keep Thueringen on P6 maintenance: refresh source extractions, runtime mappings, source-only archive fences, and DE-TH Chemistry composition views together if Thueringen Chemistry source material changes.

## Regeneration

```bash
python3 scripts/render_canonical_chemistry_bundesland_status.py
```
