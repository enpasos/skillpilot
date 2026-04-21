# Canonical Gymnasium Physics Bundeslaender Status

Snapshot: `2026-04-20T19:00:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `scripts/render_canonical_physics_bundesland_status.py`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `16/16`
- States with active snapshots (`P2+`): `16/16`
- States with structural anchors mapped (`P3+`): `16/16`
- States with reviewed corridor (`P4+`): `9/16`
- States with broad coverage (`P5+`): `2/16`
- States operationally cutover-ready (`P6`): `2/16`
- Active canonical corridors: `1/13`
- Priority `active`: `0`

## Steering model

- Primary work unit: `topic_first_reviewed_corridor`
- Canonical view rule: Treat the canonical DE Physics landscape as a curated pedagogical source of truth, not as the raw union of all state-specific package structures.
- State view rule: Treat Bundesland views as projections that stay as close as possible to the canonical Physics tree while omitting or deferring atoms that would overclaim the local curriculum.
- Execution sequence:
  - First archive the official Physics source materials for every still-missing Bundesland lane locally under the DE-level input structure, for both Sek I and Sek II where applicable; do not widen another reviewed state corridor before that source-onboarding tranche is complete.
  - Once the source base is locally complete, choose one active Physics topic row and compare that row across all retained Bundesland sources before widening another state lane.
  - Archive or refresh the retained state source lane first, then narrow the affected delta to mappings, provenance, applicability, and only the learner-facing views that really change inside that topic row.
  - Prefer reviewed source splits and conservative partial bridges over premature canonical atom growth when the current shared Physics surface is still semantically narrower or broader than the source wording.
  - Re-run the standard Physics mapping, applicability, and runtime fences before merging the rollout delta.
- Canonical atom admission:
  - Add a canonical Physics atom only if it improves the pedagogical completeness of the shared DE graph.
  - Do not add canonical atoms only to mirror one state's package wording or to avoid a temporary source-led residual.
  - Prefer canonical subtree quality over short-term mapping convenience.

## Canonical corridor register

| Corridor | Status | Focus states | Next step |
| --- | --- | --- | --- |
| `M1.HE_BY_HARDENED_BASE` Hessen and Bayern hardened base | `completed` | `DE-HE`, `DE-BY` | Treat the Hessen/Bayern base as maintenance-only: refresh retained source snapshots, mappings, provenance, applicability, and state-scoped composition views together whenever a curriculum revision changes visible Physics scope. |
| `SEK2.NW.UPPER_SECONDARY` Nordrhein-Westfalen upper-secondary narrow corridor lane | `completed` | `DE-NW` | Treat the current NRW upper-secondary corridor as complete at the reviewed pilot-cut level and keep it stable inside the current topic-first maintenance phase. Reopen NRW only for another clearly source-led corridor outside the exhausted GK atom-model strip or when a later retained source lane creates a genuinely shared Physics gap; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them. |
| `SEK2.NI.UPPER_SECONDARY_ENTRY` Niedersachsen upper-secondary first entry lane | `completed` | `DE-NI` | Treat the Niedersachsen upper-secondary first-entry lane as closed at the current reviewed pilot-cut level: the imported Niedersachsen pilot corridor now includes the reviewed `Michelson`, crossed-field, and fine-beam-tube follow-ons, so keep that retained row stable. Reopen Niedersachsen only when another later Bundesland source lane forces a genuinely shared Physics gap or when the still source-led sustainability-related Bewertungsblatt gains a genuinely shared Physics evaluation surface. |
| `SEK2.BW.UPPER_SECONDARY_ENTRY` Baden-Wuerttemberg upper-secondary first entry lane | `completed` | `DE-BW` | Treat the current BW upper-secondary first-entry lane as complete at the reviewed pilot-cut level and keep it stable inside the current topic-first maintenance phase. Reopen BW only for another clearly missing reviewed corridor outside the now-covered Basisfach-/Leistungsfach optics and quantum strips, or when a later retained source lane creates a genuinely shared Physics gap; still avoid BW-specific Physics composition views or a broader applicability sweep before wider evidence exists. |
| `SEK2.BE.UPPER_SECONDARY_ENTRY` Berlin upper-secondary first entry lane | `completed` | `DE-BE` | Treat the current Berlin upper-secondary first-entry lane as complete at the reviewed pilot-cut level. The shared BE/BB residue is now reduced to the still source-led `beliebige Eintrittswinkel` clause, so reopen Berlin only if that remaining clause later becomes jointly reviewable or another later retained source lane creates a genuinely shared Physics gap. |
| `SEK2.BB.UPPER_SECONDARY_ENTRY` Brandenburg upper-secondary first entry lane | `completed` | `DE-BB` | Treat the current Brandenburg retained `3.2.1` -> `3.2.2` upper-secondary lane as complete at the reviewed pilot-cut level. The shared BE/BB residue is now reduced to the still source-led `beliebige Eintrittswinkel` clause, so reopen Brandenburg only if that remaining clause later becomes jointly reviewable or another later retained source lane creates a genuinely shared Physics gap. |
| `SEK2.SH.UPPER_SECONDARY_ENTRY` Schleswig-Holstein upper-secondary first entry lane | `completed` | `DE-SH` | Treat the current Schleswig-Holstein upper-secondary lane as complete at the reviewed pilot-cut level. Keep only `Massenspektrometer` frozen as an explicit source-led micro-residue unless broader reviewed evidence later warrants a narrow shared canonical split, and move the next active Physics rollout to a new source family. |
| `SEK2.RP.UPPER_SECONDARY_ENTRY` Rheinland-Pfalz upper-secondary first entry lane | `completed` | `DE-RP` | Treat the current Rheinland-Pfalz upper-secondary lane as explicitly closed on the reviewed pilot-cut level. Keep the remaining source-led LF residue set beginning with `Individuelles Thema` frozen unless later shared canonical evidence really warrants narrower targets. |
| `F4.ALL_MISSING_STATE_SOURCE_ONBOARDING` All-missing-state Physics source onboarding tranche | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The source-archive tranche is now complete: all seven previously missing Physics state families are archived locally for Sek I and Sek II where applicable. Keep the archived bundles stable and move the active rollout to source-snapshot and provenance activation before another reviewed topic-row widening. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` All-newly-archived-state Physics snapshot activation tranche | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The snapshot/provenance tranche is now complete: Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen all have active retained lower-secondary and upper-secondary Physics source lanes. Keep those source-backed bundles stable and move the active rollout to the first structural-anchor pass before another reviewed topic-row widening. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` All-newly-archived-state Physics structural-anchor activation tranche | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The first conservative `P3` structural-anchor pass is now complete for Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen. Keep those statewide anchor cuts stable and move the active rollout back to the first horizontal all-state reviewed Physics topic row instead of another state-local structural activation. |
| `F5.ALL_STATE_HORIZONTAL_TOPIC_REENTRY` All-state horizontal Physics topic-pass reentry | `completed` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HH`, `DE-HE`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The horizontal all-state reentry tranche is now complete at the current reviewed cut: the four initial Sek-II rows, the first eight lower-secondary rows, and the first post-tranche lower-secondary candidate sweep are all closed once. Keep the audited rows stable, keep additional lower-secondary row admission frozen, and reopen this corridor only when new source-backed evidence or a genuinely new Hessen-seeded lower-secondary strip justifies another nationwide row. |
| `F6.MAINTENANCE_EVIDENCE_WATCH` Physics maintenance and evidence watch | `active` | `DE-BB`, `DE-BE`, `DE-BW`, `DE-BY`, `DE-HB`, `DE-HH`, `DE-HE`, `DE-MV`, `DE-NI`, `DE-NW`, `DE-RP`, `DE-SH`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Physics is now in maintenance / evidence-watch mode. Keep the completed Hessen/Bayern base, the reviewed upper-secondary state corridors, the first eight audited lower-secondary rows, and the frozen post-tranche candidate decisions stable. Use the machine-readable watch manifest `curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json`, the rendered watch status `docs/dev/canonical-gymnasium-physics-evidence-watch-status.md`, the baseline-driven delta view `docs/dev/canonical-gymnasium-physics-evidence-watch-delta.md`, the exit-code check `python3 scripts/check_canonical_physics_evidence_watch_delta.py`, the fixed run path `./scripts/run_canonical_physics_evidence_watch.sh`, and the scheduled workflow `.github/workflows/canonical_physics_evidence_watch.yml` as the operational watch surface for lower-secondary candidate rows and upper-secondary residue lanes. Reopen active rollout only when one of the watched source files changes in a way that satisfies the documented reopen triggers. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Hessen and Bayern hardened base | `completed` |
| `F2` Third-state activation | `completed` |
| `F3` Repeatable multi-state rollout | `completed` |
| `F4` Retained-state maintenance and future source onboarding | `completed` |
| `F5` Horizontal all-state reviewed pass | `completed` |
| `F6` Maintenance and evidence watch | `active` |

## State phase scale

| Phase | Score | Meaning |
| --- | ---: | --- |
| `P0` Placeholder | `0%` | README/source links only, no active Physics rollout lane. |
| `P1` Source archived | `15%` | Physics source material is archived in the DE-level input lane. |
| `P2` Snapshots active | `30%` | Physics source snapshots and provenance are active. |
| `P3` Anchors mapped | `50%` | Canonical structural anchors are mapped on the shared Physics spine. |
| `P4` First corridor reviewed | `65%` | At least one didactically closed reviewed Physics corridor is mapped. |
| `P5` Broad state coverage | `85%` | The state has broad reviewed coverage across the active Physics spine. |
| `P6` State cutover ready | `100%` | The state is operationally ready on the canonical Physics landscape. |

## State view

| State | Operational phase | Score | Applicability | Mappings | Source stage | Priority |
| --- | --- | ---: | --- | ---: | --- | --- |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `yes` | `26` | `subtree_adopted` | `backlog` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `yes` | `26` | `subtree_adopted` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `64` | `subtree_adopted` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `yes` | `44` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P3` Anchors mapped | `50%` | `yes` | `16` | `anchors_mapped` | `backlog` |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `yes` | `429` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P3` Anchors mapped | `50%` | `yes` | `14` | `anchors_mapped` | `backlog` |
| `DE-MV` Mecklenburg-Vorpommern | `P3` Anchors mapped | `50%` | `yes` | `18` | `anchors_mapped` | `backlog` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `56` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `28` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` First corridor reviewed | `65%` | `yes` | `91` | `subtree_adopted` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `yes` | `23` | `subtree_adopted` | `backlog` |
| `DE-SL` Saarland | `P3` Anchors mapped | `50%` | `yes` | `24` | `anchors_mapped` | `backlog` |
| `DE-SN` Sachsen | `P3` Anchors mapped | `50%` | `yes` | `33` | `anchors_mapped` | `backlog` |
| `DE-ST` Sachsen-Anhalt | `P3` Anchors mapped | `50%` | `yes` | `40` | `anchors_mapped` | `backlog` |
| `DE-TH` Thueringen | `P3` Anchors mapped | `50%` | `yes` | `17` | `anchors_mapped` | `backlog` |

## Immediate queue

- none

## Next steps

- `DE-BB`: Keep Brandenburg stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue is now reduced to the still source-led `beliebige Eintrittswinkel` clause; the next rollout move should therefore come from a different source family unless that remaining clause later becomes jointly reviewable.
- `DE-BE`: Keep Berlin stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue is now reduced to the still source-led `beliebige Eintrittswinkel` clause; the next rollout move should therefore come from a different source family unless that remaining clause later becomes jointly reviewable.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only at the current reviewed pilot-cut level: preserve the existing first-entry strip inside the current topic-first maintenance phase, and reopen BW only for another clearly missing reviewed corridor outside the now-covered Basisfach-/Leistungsfach optics and quantum strips or when later retained source lanes create a genuinely shared Physics gap; do not introduce BW-specific Physics composition views before wider reviewed evidence requires them.
- `DE-BY`: Keep Bayern on maintenance only, but treat the refreshed BY contribution on the retained Ph11/Ph12 wave strip and on the imported fine-beam-tube experiment clause as part of that maintenance surface: if later Bayern source revisions touch either strip, refresh mappings, applicability, provenance, and the DE-BY Physics composition views together without inventing Bayern-specific composition views or new canonical atoms unless broader reviewed evidence really forces them.
- `DE-HB`: Keep Bremen stable at the first conservative `P3` structural-anchor cut. Do not widen Bremen into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Bremen-relevant strip.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-HE Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HH`: Keep Hamburg stable at the first conservative `P3` structural-anchor cut. Do not widen Hamburg into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Hamburg-relevant strip.
- `DE-MV`: Keep Mecklenburg-Vorpommern stable at the first conservative `P3` structural-anchor cut. Do not widen Mecklenburg-Vorpommern into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Mecklenburg-Vorpommern-relevant strip.
- `DE-NI`: Keep Niedersachsen on maintenance only at the current reviewed pilot-cut level: preserve the imported retained pilot corridor including the reviewed `Michelson`, crossed-field, and fine-beam-tube follow-ons. Leave the sustainability-related Bewertungsblatt intentionally source-led unless a later retained rollout creates a genuinely shared Physics evaluation surface, and continue to avoid Niedersachsen-specific Physics composition views or new canonical atoms without broader reviewed evidence.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only at the current reviewed pilot-cut level: preserve the existing upper-secondary corridor inside the current topic-first maintenance phase, and reopen NRW only for another clearly source-led corridor outside the exhausted GK atom-model strip or when later retained source lanes create a genuinely shared Physics gap; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them.
- `DE-RP`: Keep Rheinland-Pfalz stable at the current conservative reviewed cut. The lane-closure decision is now explicit; reopen it only if later shared canonical evidence really warrants narrower targets for the still source-led LF residue set beginning with `Individuelles Thema`.
- `DE-SH`: Treat Schleswig-Holstein as complete at the current reviewed pilot-cut level. Keep only `Massenspektrometer` frozen as an explicit source-led micro-residue unless broader reviewed evidence warrants a narrow shared canonical split, and reopen SH only if a later multi-state source lane creates a genuinely shared Physics gap on that residue.
- `DE-SL`: Keep Saarland stable at the first conservative `P3` structural-anchor cut. Do not widen Saarland into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Saarland-relevant strip.
- `DE-SN`: Keep Sachsen stable at the first conservative `P3` structural-anchor cut. Do not widen Sachsen into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Sachsen-relevant strip.
- `DE-ST`: Keep Sachsen-Anhalt stable at the first conservative `P3` structural-anchor cut. Do not widen Sachsen-Anhalt into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Sachsen-Anhalt-relevant strip.
- `DE-TH`: Keep Thueringen stable at the first conservative `P3` structural-anchor cut. Do not widen Thueringen into another state-local corridor on the current evidence floor; reopen it only when a later source-backed nationwide row or a genuinely shared Physics gap reaches a Thueringen-relevant strip.

## Regeneration

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
