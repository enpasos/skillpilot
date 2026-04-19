# Canonical Gymnasium Physics Bundeslaender Status

Snapshot: `2026-04-18T09:00:00Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-bundesland-rollout-tracker.json`
- `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json`
- `scripts/render_canonical_physics_bundesland_status.py`

## Headline

- Tracked states: `9`
- Canonical source coverage present: `9/9`
- States with active snapshots (`P2+`): `9/9`
- States with structural anchors mapped (`P3+`): `9/9`
- States with reviewed corridor (`P4+`): `9/9`
- States with broad coverage (`P5+`): `2/9`
- States operationally cutover-ready (`P6`): `2/9`
- Active canonical corridors: `1/8`
- Priority `active`: `1`

## Steering model

- Primary work unit: `topic_first_reviewed_corridor`
- Canonical view rule: Treat the canonical DE Physics landscape as a curated pedagogical source of truth, not as the raw union of all state-specific package structures.
- State view rule: Treat Bundesland views as projections that stay as close as possible to the canonical Physics tree while omitting or deferring atoms that would overclaim the local curriculum.
- Execution sequence:
  - Choose the active Physics topic row first, then compare that row across all currently available Bundesland sources before widening another state lane.
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
| `SEK2.RP.UPPER_SECONDARY_ENTRY` Rheinland-Pfalz upper-secondary first entry lane | `active` | `DE-RP` | Treat the Rheinland-Pfalz field/induction family, the opened oscillation/wave strips, the first GF quantum corridor `Quantenobjekte I`, the opened LF strips `Quantenobjekte II`, `Elementarteilchenphysik`, `Relativistische Kinematik`, and `Relativistische Dynamik`, the opened GF/LF atom-model strips `Quantenmechanische Atomvorstellung I` and `Quantenmechanische Atomvorstellung II`, and the first narrow LF interaction strip `Wechselwirkung von Quantenobjekten` as stable on the current conservative reviewed cut. Keep `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, and `gekoppelte Schwingungen` frozen as explicit source-led RP micro-residues, keep `Plancksches Wirkungsquantum mit einer experimentellen Methode naeherungsweise bestimmen` source-led inside the RP quantum strip, keep `Lumineszenz`, `Laser`, `chemische Bindung/Molekuelstruktur`, and `Farbstoffmolekuele` source-led inside the RP LF atom-model strip, keep `Paarerzeugung` source-led inside the RP LF interaction strip, keep `Offene Fragen der Elementarteilchenphysik` source-led inside the RP LF particle-physics strip, keep `Masse-Energie-Aequivalenz` plus the retained RP relativity-dynamics clause on `Energie`, `Impuls`, `Geschwindigkeit`, `Grenzgeschwindigkeit`, and `Grenzfaelle` source-led inside the opened LF dynamics strip, and move the next active RP widening to the adjacent LF strip `Astrophysik`. |

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
| `DE-HE` Hessen | `P6` State cutover ready | `100%` | `yes` | `429` | `cutover_ready` | `backlog` |
| `DE-BY` Bayern | `P6` State cutover ready | `100%` | `yes` | `44` | `cutover_ready` | `backlog` |
| `DE-NI` Niedersachsen | `P4` First corridor reviewed | `65%` | `yes` | `56` | `subtree_adopted` | `backlog` |
| `DE-NW` Nordrhein-Westfalen | `P4` First corridor reviewed | `65%` | `yes` | `28` | `subtree_adopted` | `backlog` |
| `DE-BW` Baden-Wuerttemberg | `P4` First corridor reviewed | `65%` | `yes` | `64` | `subtree_adopted` | `backlog` |
| `DE-BE` Berlin | `P4` First corridor reviewed | `65%` | `yes` | `24` | `subtree_adopted` | `backlog` |
| `DE-BB` Brandenburg | `P4` First corridor reviewed | `65%` | `yes` | `24` | `subtree_adopted` | `backlog` |
| `DE-SH` Schleswig-Holstein | `P4` First corridor reviewed | `65%` | `yes` | `22` | `subtree_adopted` | `backlog` |
| `DE-RP` Rheinland-Pfalz | `P4` First corridor reviewed | `65%` | `yes` | `83` | `subtree_adopted` | `active` |

## Immediate queue

- `DE-RP` Rheinland-Pfalz: Rheinland-Pfalz now has an active upper-secondary Physics source snapshot for the Mainzer Studienstufe, the archived official MSS Physics PDF, provenance-backed membership and closure, one first reviewed narrow mapping lane on the shared orientation anchor, one structural Qualifikationsphasen-Anker `Statische elektrische und magnetische Felder`, one first reviewed gemeinsamer Grundfach-/Leistungsfach-Korridor on the Pflichtbaustein `Feldkonzept fuer statische elektrische und magnetische Felder`, one first reviewed GF/LF-common follow-on on `Wechselwirkung von geladenen Koerpern mit statischen Feldern`, one first narrow reviewed LK follow-on on `Hall-Effekt`, two adjacent conservative LK follow-ons on `Kreisbahnen` and `gekreuzten Feldern`, one first reviewed GF/LF-common induction corridor `Veraenderliche elektromagnetische Felder`, one adjacent shared induction follow-on on `Selbstinduktion` / `Ein- und Ausschaltvorgaenge bei der Spule`, one adjacent narrow LK induction follow-on on `Induktionsgesetz in differentieller Form`, one first reviewed GF/LF-common oscillation corridor `Harmonische Schwingungen`, one first reviewed Grundfach wave corridor `Harmonische Wellen`, one first reviewed Grundfach superposition/interference follow-on `Superposition von Wellen`, one first narrow reviewed LF follow-on `Harmonische Wellen und ihre Superposition`, one first narrow reviewed LF Pflichtbaustein follow-on `Schwingungen und Wellen`, one first reviewed Grundfach quantum corridor `Quantenobjekte I` with one structural quantum/atom anchor on the shared Q4 surface plus reviewed bridges across double-slit behavior of photons/electrons, photon energy-frequency-momentum relations, De-Broglie matter waves, probability interpretation via the wavefunction, and the model/worldview reflection surface, one first narrow reviewed LF follow-on `Quantenobjekte II` with reviewed bridges across the measurement problem, the electron diffraction tube, Hallwachs as an evidence experiment, and the quantum eraser / which-path surface on the same shared Q4 quantum-object surface, one first reviewed Grundfach atom-model corridor `Quantenmechanische Atomvorstellung I` with reviewed bridges across quantized absorption / emission, the hydrogen energy-level model, and orbital probability interpretation on the shared canonical atom-model surface, one first narrow reviewed LF atom-model follow-on `Quantenmechanische Atomvorstellung II` with reviewed bridges across Franck-Hertz, Natriumresonanzabsorption, and Spektralanalyse on the same shared canonical atom-model surface, one first narrow reviewed LF interaction follow-on `Wechselwirkung von Quantenobjekten` with reviewed bridges across Compton-Effekt, Hallwachs-Effekt, Elektronenbeugung / Bragg-Reflexion, and Roentgenstrahlung, one first narrow reviewed LF particle-physics follow-on `Elementarteilchenphysik` with reviewed bridges across the Standardmodell as ordering scheme, fundamental interactions, and experimental evidence on the shared Q4 particle-physics surface, one first narrow reviewed LF relativity follow-on `Relativistische Kinematik` with reviewed bridges across relativity postulates / simultaneity / experiments, relativistic consequences, and spacetime diagrams on the shared special-relativity surface, and now also one first narrow reviewed LF relativity-dynamics follow-on `Relativistische Dynamik` with one reviewed bridge across gravitation-dependent time and experimental evidence on the shared relativity surface. The lane currently carries 83 reviewed mappings, introduces no Rheinland-Pfalz-specific canonical Physics atoms, no Rheinland-Pfalz-specific composition views, and no committed Rheinland-Pfalz applicability cut yet; the retained RP field/induction family is closed on the current conservative reviewed cut, the remaining RP oscillation/wave micro-residues on period dependence, wave types / polarization, the white-light double-slit spectrum, and coupled oscillations are explicitly frozen as source-led residues on the same reviewed cut, the adjacent RP clause `Plancksches Wirkungsquantum mit einer experimentellen Methode naeherungsweise bestimmen` stays intentionally source-led because the current shared canonical method surface remains photoeffect-specific, the remaining LF atom-model application examples `Lumineszenz`, `Laser`, `chemische Bindung/Molekuelstruktur`, and `Farbstoffmolekuele` stay intentionally source-led because the current shared canonical Physics surface still has no narrow reviewed targets for them, `Paarerzeugung` stays intentionally source-led inside the LF interaction strip because the current shared canonical quantum surface still has no genuinely narrow reviewed target for it, `Offene Fragen der Elementarteilchenphysik` stays intentionally source-led inside the LF particle-physics strip because the current shared canonical research surface still remains broader than the RP wording, and the newly visible RP dynamics clauses on `Masse-Energie-Aequivalenz` plus `Energie`, `Impuls`, `Geschwindigkeit`, `Grenzgeschwindigkeit`, and `Grenzfaelle` stay intentionally source-led because the current shared canonical relativity surface still has no genuinely narrow reviewed targets for them.

## Next steps

- `DE-HE`: Keep Hessen on maintenance only: refresh retained source snapshots, mappings, provenance, applicability, and the DE-HE Physics composition views together whenever a curriculum revision changes visible scope or learner-facing tree shape.
- `DE-BY`: Keep Bayern on maintenance only, but treat the refreshed BY contribution on the retained Ph11/Ph12 wave strip and on the imported fine-beam-tube experiment clause as part of that maintenance surface: if later Bayern source revisions touch either strip, refresh mappings, applicability, provenance, and the DE-BY Physics composition views together without inventing Bayern-specific composition views or new canonical atoms unless broader reviewed evidence really forces them.
- `DE-NI`: Keep Niedersachsen on maintenance only at the current reviewed pilot-cut level: preserve the imported retained pilot corridor including the reviewed `Michelson`, crossed-field, and fine-beam-tube follow-ons. Leave the sustainability-related Bewertungsblatt intentionally source-led unless a later retained rollout creates a genuinely shared Physics evaluation surface, and continue to avoid Niedersachsen-specific Physics composition views or new canonical atoms without broader reviewed evidence.
- `DE-NW`: Keep Nordrhein-Westfalen on maintenance only at the current reviewed pilot-cut level: preserve the existing upper-secondary corridor inside the current topic-first maintenance phase, and reopen NRW only for another clearly source-led corridor outside the exhausted GK atom-model strip or when later retained source lanes create a genuinely shared Physics gap; do not invent NRW-specific Physics composition views before broader reviewed evidence actually requires them.
- `DE-BW`: Keep Baden-Wuerttemberg on maintenance only at the current reviewed pilot-cut level: preserve the existing first-entry strip inside the current topic-first maintenance phase, and reopen BW only for another clearly missing reviewed corridor outside the now-covered Basisfach-/Leistungsfach optics and quantum strips or when later retained source lanes create a genuinely shared Physics gap; do not introduce BW-specific Physics composition views before wider reviewed evidence requires them.
- `DE-BE`: Keep Berlin stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-BB`: Keep Brandenburg stable on the reviewed retained `3.2.1` -> `3.2.2` route. The shared BE/BB residue on `c0` / `Relativitaet` / `Eintrittswinkel` is now explicitly frozen at the current reviewed level; the next rollout move should therefore come from a different source family unless that trio later becomes jointly reviewable.
- `DE-SH`: Treat Schleswig-Holstein as complete at the current reviewed pilot-cut level. Keep `Massenspektrometer` plus `Drehimpuls und Drehimpulserhaltung` frozen as explicit source-led micro-residues unless broader reviewed evidence warrants narrow shared canonical splits, and reopen SH only if a later multi-state source lane creates a genuinely shared Physics gap on either residue.
- `DE-RP`: Keep the Rheinland-Pfalz field/induction family, the opened oscillation/wave strips, the first GF quantum corridor `Quantenobjekte I`, the opened LF strips `Quantenobjekte II`, `Elementarteilchenphysik`, `Relativistische Kinematik`, and `Relativistische Dynamik`, the opened GF/LF atom-model strips `Quantenmechanische Atomvorstellung I` and `Quantenmechanische Atomvorstellung II`, and the first narrow LF interaction strip `Wechselwirkung von Quantenobjekten` stable at the current conservative reviewed cut. Leave `Periodendauer`, `Polarisation`, `Weisslichtspektrum`, and `gekoppelte Schwingungen` explicitly frozen as source-led RP micro-residues, keep `Plancksches Wirkungsquantum mit einer experimentellen Methode naeherungsweise bestimmen` source-led inside the RP quantum strip, keep `Lumineszenz`, `Laser`, `chemische Bindung/Molekuelstruktur`, and `Farbstoffmolekuele` source-led inside the RP LF atom-model strip, keep `Paarerzeugung` source-led inside the RP LF interaction strip, keep `Offene Fragen der Elementarteilchenphysik` source-led inside the RP LF particle-physics strip, keep `Masse-Energie-Aequivalenz` plus the retained RP relativity-dynamics clause on `Energie`, `Impuls`, `Geschwindigkeit`, `Grenzgeschwindigkeit`, and `Grenzfaelle` source-led inside the opened LF dynamics strip, and move the next active RP widening to the adjacent LF strip `Astrophysik`.

## Regeneration

```bash
python3 scripts/render_canonical_physics_bundesland_status.py
```
