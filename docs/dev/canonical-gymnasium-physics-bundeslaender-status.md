# Canonical Gymnasium Physics Bundeslaender Status

Snapshot: `2026-04-20T08:45:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `scripts/render_canonical_physics_bundesland_status.py`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `16/16`
- States with active snapshots (`P2+`): `16/16`
- States with structural anchors mapped (`P3+`): `9/16`
- States with reviewed corridor (`P4+`): `9/16`
- States with broad coverage (`P5+`): `2/16`
- States operationally cutover-ready (`P6`): `2/16`
- Active canonical corridors: `1/11`
- Priority `active`: `7`

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
| `SEK2.BE.UPPER_SECONDARY_ENTRY` Berlin upper-secondary first entry lane | `completed` | `DE-BE` | Treat the current Berlin upper-secondary first-entry lane as complete at the reviewed pilot-cut level. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level, so reopen Berlin only if that trio later becomes jointly reviewable or another later retained source lane creates a genuinely shared Physics gap. |
| `SEK2.BB.UPPER_SECONDARY_ENTRY` Brandenburg upper-secondary first entry lane | `completed` | `DE-BB` | Treat the current Brandenburg retained `3.2.1` -> `3.2.2` upper-secondary lane as complete at the reviewed pilot-cut level. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level, so reopen Brandenburg only if that trio later becomes jointly reviewable or another later retained source lane creates a genuinely shared Physics gap. |
| `SEK2.SH.UPPER_SECONDARY_ENTRY` Schleswig-Holstein upper-secondary first entry lane | `completed` | `DE-SH` | Treat the current Schleswig-Holstein upper-secondary lane as complete at the reviewed pilot-cut level. Keep `Massenspektrometer` plus `Drehimpuls und Drehimpulserhaltung` frozen as explicit source-led micro-residues unless broader reviewed evidence later warrants narrow shared canonical splits, and move the next active Physics rollout to a new source family. |
| `SEK2.RP.UPPER_SECONDARY_ENTRY` Rheinland-Pfalz upper-secondary first entry lane | `completed` | `DE-RP` | Treat the current Rheinland-Pfalz upper-secondary lane as stable at the reviewed pilot-cut level and do not widen it further until the still-missing Bundesland source lanes are archived locally. When Rheinland-Pfalz is revisited later, start with an explicit closure decision on the remaining LF residue `Individuelles Thema` rather than another spontaneous corridor widening. |
| `F4.ALL_MISSING_STATE_SOURCE_ONBOARDING` All-missing-state Physics source onboarding tranche | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The source-archive tranche is now complete: all seven previously missing Physics state families are archived locally for Sek I and Sek II where applicable. Keep the archived bundles stable and move the active rollout to source-snapshot and provenance activation before another reviewed topic-row widening. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` All-newly-archived-state Physics snapshot activation tranche | `completed` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | The snapshot/provenance tranche is now complete: Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen all have active retained lower-secondary and upper-secondary Physics source lanes. Keep those source-backed bundles stable and move the active rollout to the first structural-anchor pass before another reviewed topic-row widening. |
| `F4.ALL_NEWLY_ARCHIVED_STATE_STRUCTURAL_ANCHOR_ACTIVATION` All-newly-archived-state Physics structural-anchor activation tranche | `active` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Start the first conservative `P3` structural-anchor pass across Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen. Use broad lower-secondary and upper-secondary source anchors only, and do not widen topic-specific reviewed Physics corridors again before those first anchor cuts exist. |

## Program phases

| Program phase | Status |
| --- | --- |
| `F0` Tracking scaffold | `completed` |
| `F1` Hessen and Bayern hardened base | `completed` |
| `F2` Third-state activation | `completed` |
| `F3` Repeatable multi-state rollout | `completed` |
| `F4` Retained-state maintenance and future source onboarding | `active` |

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
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `yes` | `24` | `subtree_adopted` | `backlog` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `yes` | `24` | `subtree_adopted` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `64` | `subtree_adopted` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `yes` | `44` | `cutover_ready` | `backlog` |
| `DE-HB` Bremen | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `yes` | `429` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-MV` Mecklenburg-Vorpommern | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `56` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `28` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` First corridor reviewed | `65%` | `yes` | `90` | `subtree_adopted` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `yes` | `22` | `subtree_adopted` | `backlog` |
| `DE-SL` Saarland | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-SN` Sachsen | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-ST` Sachsen-Anhalt | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |
| `DE-TH` Thueringen | `P2` Snapshots active | `30%` | `yes` | `0` | `snapshots_active` | `active` |

## Immediate queue

- `DE-HB` Bremen: Bremen now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2006/2022 source family. The lower-secondary lane carries one shared orientation anchor, one retained `J7/8` strip on `Schall und Laerm`, `Sehen, Licht und Farben`, `Kraefte und Bewegung`, and `Elektrostatik`, and one retained `J9` strip on `Der elektrische Stromkreis als System`, `Elektromagnetismus`, and `Radioaktivitaet und Kernenergie`. The upper-secondary lane carries one shared orientation anchor, one Einfuehrungsphase strip on `Mechanik` and `Energie`, and three broad qualification anchors on `Elektrische und magnetische Felder`, `Mechanische und elektromagnetische Schwingungen und Wellen`, and `Quantenphysik und Materie` plus one explicit LK-only `Struktur der Materie` leaf. Both lanes are now provenance-backed through membership and closure, but no Bremen Physics mapping lane is open yet, no Bremen-specific canonical Physics atom exists yet, and no committed Bremen applicability cut exists yet.
- `DE-HH` Hamburg: Hamburg now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2011/2022 source family. The lower-secondary lane carries one shared orientation anchor, one retained `J8` strip on `Elektrizitaet`, `Bewegung und Kraft`, and `Licht und Schall`, and one retained transition strip on `Elektrizitaet und Magnetismus`, `Bewegung und Kraft`, `Energie`, and `Licht und Materie`. The upper-secondary lane carries one shared orientation anchor and four broad Studienstufen anchors on `Elektrische und magnetische Felder`, `Mechanische und elektromagnetische Schwingungen und Wellen`, `Quantenphysik und Materie`, and `Gravitation und Astrophysik`. Both lanes are now provenance-backed through membership and closure, but no Hamburg Physics mapping lane is open yet, no Hamburg-specific canonical Physics atom exists yet, and no committed Hamburg applicability cut exists yet.
- `DE-MV` Mecklenburg-Vorpommern: Mecklenburg-Vorpommern now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2022 source family. The lower-secondary lane carries one shared orientation anchor and retained class strips for `Klasse 7` (`Dichte`, `Kraefte`, `Physik auf der Baustelle`), `Klasse 8` (`Licht`, `elektrische Ladung`, `Stromkreise`, `Temperatur und Waerme`), `Klasse 9` (`Magnetismus`, `Gleichstrommotor und Induktion`, `geradlinige Bewegung`, `Mit dem E-Bike unterwegs`), and `Klasse 10` (`gleichmaessig beschleunigte Bewegung`, `Dynamik`, `Gravitationsfeld und Kreisbewegung`, `Kernphysik`). The upper-secondary lane carries one shared orientation anchor, one integratives Oberstufenband, and three broad retained theme anchors on `Elektrische und magnetische Felder`, `Schwingungen und Wellen`, and `Quantenphysik und Materie`. Both lanes are now provenance-backed through membership and closure, but no Mecklenburg-Vorpommern Physics mapping lane is open yet, no Mecklenburg-Vorpommern-specific canonical Physics atom exists yet, and no committed Mecklenburg-Vorpommern applicability cut exists yet.
- `DE-SL` Saarland: Saarland now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2012/2023/2024/2026 source family. The lower-secondary lane carries one shared orientation anchor, one retained `Klassenstufen 5/6` Naturwissenschaften feeder strip, one retained `Klassenstufe 7` strip, and branch-sensitive retained `Klassenstufe 8`, `Klassenstufe 9`, and `Klassenstufe 10` strips. The upper-secondary lane carries one shared orientation anchor plus broad retained `Einfuehrungsphase`, `Hauptphase G-Kurs`, and `Hauptphase Leistungskurs` strips. Both lanes are now provenance-backed through membership and closure, but no Saarland Physics mapping lane is open yet, no Saarland-specific canonical Physics atom exists yet, and no committed Saarland applicability cut exists yet.
- `DE-SN` Sachsen: Sachsen now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived shared Gymnasium Physics PDF. The lower-secondary lane carries one shared orientation anchor plus retained class strips for `6`, `7`, `8`, `9`, and `10`; the upper-secondary lane carries one shared orientation anchor plus broad retained `GK11`, `GK12`, `LK11`, and `LK12` strips. Both lanes are now provenance-backed through membership and closure, but no Sachsen Physics mapping lane is open yet, no Sachsen-specific canonical Physics atom exists yet, and no committed Sachsen applicability cut exists yet.
- `DE-ST` Sachsen-Anhalt: Sachsen-Anhalt now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2019/2022 source family. The lower-secondary lane carries one shared orientation anchor plus retained `Schuljahrgang 6`, `Schuljahrgaenge 7/8`, and `Schuljahrgang 9` strips. The upper-secondary lane carries one shared orientation anchor plus retained `Schuljahrgang 10 (Einfuehrungsphase)`, `grundlegendes Anforderungsniveau`, `erhoehtes Anforderungsniveau`, and `zweistuendiges Wahlpflichtfach` strips. Both lanes are now provenance-backed through membership and closure, but no Sachsen-Anhalt Physics mapping lane is open yet, no Sachsen-Anhalt-specific canonical Physics atom exists yet, and no committed Sachsen-Anhalt applicability cut exists yet.
- `DE-TH` Thueringen: Thueringen now has active retained lower-secondary and upper-secondary Physics source snapshots from the archived 2012/2024 source family. The lower-secondary lane carries one shared orientation anchor plus retained `Klassenstufen 7/8` and `Klassenstufen 9/10` strips. The upper-secondary lane carries one shared orientation anchor plus a retained `Klassenstufe 11` strip and a retained `Qualifikationsphase` strip built from the 2024 content-area update. Both lanes are now provenance-backed through membership and closure, but no Thueringen Physics mapping lane is open yet, no Thueringen-specific canonical Physics atom exists yet, and no committed Thueringen applicability cut exists yet.

## Next steps

- `DE-BB`: Keep Brandenburg stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-BE`: Keep Berlin stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only at the current reviewed pilot-cut level: preserve the existing first-entry strip inside the current topic-first maintenance phase, and reopen BW only for another clearly missing reviewed corridor outside the now-covered Basisfach-/Leistungsfach optics and quantum strips or when later retained source lanes create a genuinely shared Physics gap; do not introduce BW-specific Physics composition views before wider reviewed evidence requires them.
- `DE-BY`: Keep Bayern on maintenance only, but treat the refreshed BY contribution on the retained Ph11/Ph12 wave strip and on the imported fine-beam-tube experiment clause as part of that maintenance surface: if later Bayern source revisions touch either strip, refresh mappings, applicability, provenance, and the DE-BY Physics composition views together without inventing Bayern-specific composition views or new canonical atoms unless broader reviewed evidence really forces them.
- `DE-HB`: Keep Bremen stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Bremen Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-HE Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HH`: Keep Hamburg stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Hamburg Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-MV`: Keep Mecklenburg-Vorpommern stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Mecklenburg-Vorpommern Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-NI`: Keep Niedersachsen on maintenance only at the current reviewed pilot-cut level: preserve the imported retained pilot corridor including the reviewed `Michelson`, crossed-field, and fine-beam-tube follow-ons. Leave the sustainability-related Bewertungsblatt intentionally source-led unless a later retained rollout creates a genuinely shared Physics evaluation surface, and continue to avoid Niedersachsen-specific Physics composition views or new canonical atoms without broader reviewed evidence.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only at the current reviewed pilot-cut level: preserve the existing upper-secondary corridor inside the current topic-first maintenance phase, and reopen NRW only for another clearly source-led corridor outside the exhausted GK atom-model strip or when later retained source lanes create a genuinely shared Physics gap; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them.
- `DE-RP`: Keep Rheinland-Pfalz stable at the current conservative reviewed cut and pause further widening until the still-missing Bundesland Physics source lanes are archived locally for both Sek I and Sek II where applicable. When Rheinland-Pfalz is revisited after that source-onboarding tranche, start with an explicit closure decision on the remaining LF residue `Individuelles Thema`.
- `DE-SH`: Treat Schleswig-Holstein as complete at the current reviewed pilot-cut level. Keep `Massenspektrometer` plus `Drehimpuls und Drehimpulserhaltung` frozen as explicit source-led micro-residues unless broader reviewed evidence warrants narrow shared canonical splits, and reopen SH only if a later multi-state source lane creates a genuinely shared Physics gap on either residue.
- `DE-SL`: Keep Saarland stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Saarland Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-SN`: Keep Sachsen stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Sachsen Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-ST`: Keep Sachsen-Anhalt stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Sachsen-Anhalt Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.
- `DE-TH`: Keep Thueringen stable as a source-backed retained Physics lane. The nationwide `P2` snapshot/provenance tranche is now complete; use these Thueringen Sek-I and Sek-II lanes as one candidate input for the first `P3` structural-anchor pass.

## Regeneration

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
