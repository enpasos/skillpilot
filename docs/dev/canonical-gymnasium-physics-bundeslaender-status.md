# Canonical Gymnasium Physics Bundeslaender Status

Snapshot: `2026-04-20T04:10:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `scripts/render_canonical_physics_bundesland_status.py`

## Headline

- Tracked states: `16`
- Canonical source coverage present: `16/16`
- States with active snapshots (`P2+`): `9/16`
- States with structural anchors mapped (`P3+`): `9/16`
- States with reviewed corridor (`P4+`): `9/16`
- States with broad coverage (`P5+`): `2/16`
- States operationally cutover-ready (`P6`): `2/16`
- Active canonical corridors: `1/10`
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
| `F4.ALL_NEWLY_ARCHIVED_STATE_SNAPSHOT_ACTIVATION` All-newly-archived-state Physics snapshot activation tranche | `active` | `DE-HB`, `DE-HH`, `DE-MV`, `DE-SL`, `DE-SN`, `DE-ST`, `DE-TH` | Activate the first retained lower-secondary and upper-secondary Physics source snapshots plus provenance scaffold for Bremen, Hamburg, Mecklenburg-Vorpommern, Saarland, Sachsen, Sachsen-Anhalt, and Thueringen from the newly archived DE-level input bundles. Do not reopen another reviewed topic-row widening before those source-backed lanes exist. |

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
| `DE-HB` Bremen | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `yes` | `429` | `cutover_ready` | `backlog` |
| `DE-HH` Hamburg | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-MV` Mecklenburg-Vorpommern | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `56` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `28` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` First corridor reviewed | `65%` | `yes` | `90` | `subtree_adopted` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `yes` | `22` | `subtree_adopted` | `backlog` |
| `DE-SL` Saarland | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-SN` Sachsen | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-ST` Sachsen-Anhalt | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |
| `DE-TH` Thueringen | `P1` Source archived | `15%` | `yes` | `0` | `source_archived` | `active` |

## Immediate queue

- `DE-HB` Bremen: Bremen now has both official retained Physics source families archived locally: the Gymnasium Sek-I Naturwissenschaften plan plus its 2022 restriction note and the Gymnasiale-Oberstufe Physics Bildungsplan (`curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_10_2006.pdf`, `curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf`, `curricula/DE/Gymnasium/input/HB/GyO_Physik_2022.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-HH` Hamburg: Hamburg now has both official retained Physics source families archived locally: the Gymnasium Sek-I Physik Bildungsplan and the Studienstufe Physik Bildungsplan (`curricula/DE/Gymnasium/input/HH/physik-gym-seki-data.pdf`, `curricula/DE/Gymnasium/input/HH/physik-gyo-2022-data.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-MV` Mecklenburg-Vorpommern: Mecklenburg-Vorpommern now has both official retained Physics source families archived locally: the Gymnasium/Gesamtschule Sek-I Physics framework for Klassen 7-10 and the Sekundarbereich-II Physics framework for Klassen 11-12 (`curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_7_10_2022.pdf`, `curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_11_12_2022.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-SL` Saarland: Saarland now has the official retained Physics source family archived locally: the Naturwissenschaften feeder for Klassenstufen `5/6`, the branch-sensitive Gymnasium Physik bundle for Klassenstufen `7-10`, and the gymnasiale Oberstufe bundle with Einfuehrungsphase, Hauptphase `G-Kurs`, Hauptphase `Leistungskurs`, plus the retained APA/IQB support documents (`curricula/DE/Gymnasium/input/SL/NW_5und6_Gym_2012.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_7_2023.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_NW_Zweig_2024.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_8_spr_Zweig_2024.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_inf_Zweig_2024.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_9_nw_Zweig_2024.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_inf_Zweig_2026.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_nw_Zweig_2026.pdf`, `curricula/DE/Gymnasium/input/SL/LP_PH_gym9_10_zweistuendig_ohne_Infozweig_2026.pdf`, `curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf`, `curricula/DE/Gymnasium/input/SL/LP_Ph_HP_GK_2023.pdf`, `curricula/DE/Gymnasium/input/SL/LP_Ph_HP_LK_2023.pdf`, `curricula/DE/Gymnasium/input/SL/APA_Physik_2023.pdf`, `curricula/DE/Gymnasium/input/SL/HInweis_IQB_Formelsammlung.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-SN` Sachsen: Sachsen now has the official retained Gymnasium Physics source family archived locally: the shared Lehrplan PDF for Physik covering Klassenstufen `6-10` and Jahrgangsstufen `11/12` (`curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-ST` Sachsen-Anhalt: Sachsen-Anhalt now has the official retained Physics source family archived locally: the 2019 Fachlehrplan Physik Gymnasium/Berufliches Gymnasium plus the 2022 Anpassungsstand (`curricula/DE/Gymnasium/input/ST/Physik_FLP_Gym_01_07_2019.pdf`, `curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf`). The retained official PDF family covers Sek I and Sek II in one source set, including Schuljahrgaenge `6`, `7/8`, `9`, `10 (Einfuehrungsphase)`, and `11/12 (Qualifikationsphase)`. No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.
- `DE-TH` Thueringen: Thueringen now has the official retained Gymnasium Physics source family archived locally: the 2012 Lehrplan for Physik covering Klassenstufen `7-10`, Einfuehrungsphase, and Qualifikationsphase plus the 2024 Lehrplan update that replaces Kapitel `1` und `4` for the Qualifikationsphase with roll-in from Klassenstufe `11` in Schuljahr `2025/26` (`curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2012.pdf`, `curricula/DE/Gymnasium/input/TH/LP_GY_Physik_2024.pdf`). No Physics source snapshot is active yet, no provenance-backed source lane exists yet, and no Physics mapping lane has been opened yet.

## Next steps

- `DE-BB`: Keep Brandenburg stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-BE`: Keep Berlin stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only at the current reviewed pilot-cut level: preserve the existing first-entry strip inside the current topic-first maintenance phase, and reopen BW only for another clearly missing reviewed corridor outside the now-covered Basisfach-/Leistungsfach optics and quantum strips or when later retained source lanes create a genuinely shared Physics gap; do not introduce BW-specific Physics composition views before wider reviewed evidence requires them.
- `DE-BY`: Keep Bayern on maintenance only, but treat the refreshed BY contribution on the retained Ph11/Ph12 wave strip and on the imported fine-beam-tube experiment clause as part of that maintenance surface: if later Bayern source revisions touch either strip, refresh mappings, applicability, provenance, and the DE-BY Physics composition views together without inventing Bayern-specific composition views or new canonical atoms unless broader reviewed evidence really forces them.
- `DE-HB`: Use the archived Bremen Sek-I and Sek-II Physics PDFs as the source base for the first retained `DE-HB` Physics snapshots and provenance scaffold. Do not author any topic-specific reviewed Physics mapping for Bremen before those source-backed lanes exist.
- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-HE Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-HH`: Use the archived Hamburg Sek-I and Sek-II Physics PDFs as the source base for the first retained `DE-HH` Physics snapshots and provenance scaffold. Do not author any topic-specific reviewed Physics mapping for Hamburg before those source-backed lanes exist.
- `DE-MV`: Use the archived Mecklenburg-Vorpommern Sek-I and Sek-II Physics PDFs as the source base for the first retained `DE-MV` Physics snapshots and provenance scaffold. Do not author any topic-specific reviewed Physics mapping for Mecklenburg-Vorpommern before those source-backed lanes exist.
- `DE-NI`: Keep Niedersachsen on maintenance only at the current reviewed pilot-cut level: preserve the imported retained pilot corridor including the reviewed `Michelson`, crossed-field, and fine-beam-tube follow-ons. Leave the sustainability-related Bewertungsblatt intentionally source-led unless a later retained rollout creates a genuinely shared Physics evaluation surface, and continue to avoid Niedersachsen-specific Physics composition views or new canonical atoms without broader reviewed evidence.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only at the current reviewed pilot-cut level: preserve the existing upper-secondary corridor inside the current topic-first maintenance phase, and reopen NRW only for another clearly source-led corridor outside the exhausted GK atom-model strip or when later retained source lanes create a genuinely shared Physics gap; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them.
- `DE-RP`: Keep Rheinland-Pfalz stable at the current conservative reviewed cut and pause further widening until the still-missing Bundesland Physics source lanes are archived locally for both Sek I and Sek II where applicable. When Rheinland-Pfalz is revisited after that source-onboarding tranche, start with an explicit closure decision on the remaining LF residue `Individuelles Thema`.
- `DE-SH`: Treat Schleswig-Holstein as complete at the current reviewed pilot-cut level. Keep `Massenspektrometer` plus `Drehimpuls und Drehimpulserhaltung` frozen as explicit source-led micro-residues unless broader reviewed evidence warrants narrow shared canonical splits, and reopen SH only if a later multi-state source lane creates a genuinely shared Physics gap on either residue.
- `DE-SL`: Use the archived Saarland lower-secondary and upper-secondary Physics PDFs as the source base for the first retained `DE-SL` Physics snapshots and provenance scaffold. Do not author any topic-specific reviewed Physics mapping for Saarland before those source-backed lanes exist.
- `DE-SN`: Use the archived Sachsen Gymnasium Physics PDF as the source base for the first retained `DE-SN` Physics snapshots and provenance scaffold across Sek I and Sek II. Do not author any topic-specific reviewed Physics mapping for Sachsen before those source-backed lanes exist.
- `DE-ST`: Use the archived Sachsen-Anhalt Physics PDFs as the source base for the first retained `DE-ST` Physics snapshots and provenance scaffold across Sek I and Sek II. Do not author any topic-specific reviewed Physics mapping for Sachsen-Anhalt before those source-backed lanes exist.
- `DE-TH`: Use the archived Thueringen Physics PDFs as the source base for the first retained `DE-TH` Physics snapshots and provenance scaffold across Sek I and Sek II. Do not author any topic-specific reviewed Physics mapping for Thueringen before those source-backed lanes exist.

## Regeneration

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
