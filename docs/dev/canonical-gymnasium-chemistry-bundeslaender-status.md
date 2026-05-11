# Canonical Gymnasium Chemistry Bundeslaender Status

Snapshot: `2026-05-11T18:21:56Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/chemistry-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`
- `docs/qa-ci/status/curriculum-quality-status.json`
- Chemistry `*.source-extraction.json` files under `curricula/DE/Gymnasium/input`
- `scripts/render_canonical_chemistry_bundesland_status.py`

## Headline

- Tracked states: `16`
- Source inventories readable and registered: `13/16`
- Source-backed projections clean: `13/16`
- Source atomic goals: `3812`
- Source atomic goals mapped into views: `3812`
- Extracted Chemistry source goals in local source-extraction files: `3760`
- Local Chemistry source-extraction files: `22`
- Unsupported assigned atomic goals: `0`
- States with source extraction active (`P2+`): `13/16`
- States with clean source-backed projection (`P4+`): `13/16`
- States with broad coverage (`P5+`): `7/16`
- States operationally cutover-ready (`P6`): `2/16`
- Active canonical corridors: `1/3`
- Priority `active`: `3`
- Priority `next_wave`: `6`
- Priority `backlog`: `7`

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
| `CHEM.REMAINING_SOURCE_ONBOARDING` Remaining Chemistry source onboarding tranche | `active` | `DE-MV`, `DE-RP`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Keep Mecklenburg-Vorpommern, Rheinland-Pfalz, and Sachsen-Anhalt stable on their source-backed P4 Chemistry projections. Archive official Chemistry sources for Saarland, Sachsen, and Thueringen next; broaden covered states only through a later horizontal all-state Chemistry topic pass or a real source revision. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Hessen and Bayern base | `completed` |
| `F2` Ten-state source-backed projection pass | `completed` |
| `F3` Remaining state source onboarding | `active` |
| `F4` Horizontal all-state Chemistry topic pass | `pending` |
| `F5` Cutover and maintenance | `pending` |

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
| `DE-BB` Brandenburg | `P4` Source-backed projection clean | `65%` | `151` | `203` | `203` | `1` | `203` | `0` | `316` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-BE` Berlin | `P4` Source-backed projection clean | `65%` | `151` | `203` | `203` | `1` | `203` | `0` | `316` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-BW` Baden-Wuerttemberg | `P5` Broad state coverage | `85%` | `151` | `191` | `191` | `2` | `191` | `0` | `337` | `clean` | `subtree_adopted` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `302` | `384` | `332` | `1` | `384` | `0` | `468` | `clean` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P4` Source-backed projection clean | `65%` | `62` | `42` | `42` | `1` | `42` | `0` | `123` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `302` | `324` | `324` | `2` | `324` | `0` | `473` | `clean` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P5` Broad state coverage | `85%` | `128` | `162` | `162` | `2` | `162` | `0` | `526` | `clean` | `subtree_adopted` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P4` Source-backed projection clean | `65%` | `138` | `236` | `236` | `2` | `236` | `0` | `999` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-NI` Niedersachsen | `P5` Broad state coverage | `85%` | `201` | `529` | `529` | `2` | `529` | `0` | `1440` | `clean` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P5` Broad state coverage | `85%` | `106` | `233` | `233` | `2` | `233` | `0` | `2016` | `clean` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` Source-backed projection clean | `65%` | `150` | `390` | `390` | `2` | `390` | `0` | `1541` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-SH` Schleswig-Holstein | `P5` Broad state coverage | `85%` | `153` | `321` | `321` | `2` | `321` | `0` | `1019` | `clean` | `subtree_adopted` | `backlog` |
| `DE-SL` Saarland | `P0` No source lane | `0%` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `missing` | `source_onboarding_pending` | `active` |
| `DE-SN` Sachsen | `P0` No source lane | `0%` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `missing` | `source_onboarding_pending` | `active` |
| `DE-ST` Sachsen-Anhalt | `P4` Source-backed projection clean | `65%` | `134` | `594` | `594` | `2` | `594` | `0` | `2477` | `clean` | `subtree_adopted` | `next_wave` |
| `DE-TH` Thueringen | `P0` No source lane | `0%` | `0` | `0` | `0` | `0` | `0` | `0` | `0` | `missing` | `source_onboarding_pending` | `active` |

## Immediate queue

- `DE-SL` (`P0`, `active`): No local Chemistry source inventory is registered or extracted.
- `DE-SN` (`P0`, `active`): No local Chemistry source inventory is registered or extracted.
- `DE-TH` (`P0`, `active`): No local Chemistry source inventory is registered or extracted.
- `DE-BE` (`P4`, `next_wave`): Upper-secondary Chemistry is source-backed and clean; lower-secondary source onboarding is not yet represented in this lane.
- `DE-BB` (`P4`, `next_wave`): Upper-secondary Chemistry is source-backed and clean; lower-secondary source onboarding is not yet represented in this lane.
- `DE-HB` (`P4`, `next_wave`): The declared Bremen lower-secondary Chemistry source lane is clean; no upper-secondary Chemistry lane is registered yet.
- `DE-MV` (`P4`, `next_wave`): Official MV Chemistry Sek-I and Sek-II PDFs, source extractions, registry entries, reviewed source-to-canonical mappings, compiled applicability, and DE-MV GK/LK composition views are active and clean for 236 source goals.
- `DE-RP` (`P4`, `next_wave`): Official RP Chemistry Sek-I and MSS PDFs, source extractions, registry entries, reviewed source-to-canonical mappings, compiled applicability, and DE-RP GK/LK composition views are active and clean for 390 source goals.
- `DE-ST` (`P4`, `next_wave`): Official Chemistry source PDFs, lower-/upper-secondary source extractions, registry entries, reviewed source-to-canonical mappings, compiled applicability, and DE-ST GK/LK composition views are active and clean.

## Next steps

- `DE-BB`: Keep the current upper-secondary Berlin-Brandenburg projection stable, then add a lower-secondary Chemistry source lane only from official local material before broadening the state view.
- `DE-BE`: Keep the current upper-secondary Berlin-Brandenburg projection stable, then add a lower-secondary Chemistry source lane only from official local material before broadening the state view.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only unless a source revision or all-state Chemistry topic pass exposes a genuine shared canonical gap.
- `DE-BY`: Keep Bayern on maintenance only; refresh mappings, applicability, and learner-facing scope together if LehrplanPLUS source material changes.
- `DE-HB`: Keep the current lower-secondary Bremen projection stable, then onboard official upper-secondary Chemistry material before broadening the state view.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and state-scoped Chemistry composition views together whenever a curriculum revision changes visible scope.
- `DE-HH`: Keep Hamburg on maintenance only unless a source revision or all-state Chemistry topic pass exposes a genuine shared canonical gap.
- `DE-MV`: Keep the Mecklenburg-Vorpommern Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Rahmenplan evidence.
- `DE-NI`: Keep Niedersachsen on maintenance only unless a source revision or all-state Chemistry topic pass exposes a genuine shared canonical gap.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only unless a source revision or all-state Chemistry topic pass exposes a genuine shared canonical gap.
- `DE-RP`: Keep the Rheinland-Pfalz Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Lehrplan evidence.
- `DE-SH`: Keep Schleswig-Holstein on maintenance only unless a source revision or all-state Chemistry topic pass exposes a genuine shared canonical gap.
- `DE-SL`: Archive official Saarland Chemistry source material for the relevant Gymnasium stages, then create source extraction, registry, mappings, applicability, and learner-facing projection artifacts.
- `DE-SN`: Archive official Sachsen Chemistry source material for the relevant Gymnasium stages, then create source extraction, registry, mappings, applicability, and learner-facing projection artifacts.
- `DE-ST`: Keep the Sachsen-Anhalt Chemistry projection stable; broaden it only through a later horizontal all-state Chemistry topic pass or if a source revision changes the retained Fachlehrplan evidence.
- `DE-TH`: Archive official Thueringen Chemistry source material for the relevant Gymnasium stages, then create source extraction, registry, mappings, applicability, and learner-facing projection artifacts.

## Regeneration

```bash
python3 scripts/render_canonical_chemistry_bundesland_status.py
```
