# Canonical Gymnasium Physics Topic Workboard

Snapshot: `2026-04-16`

Purpose:

- steer canonical Gymnasium Physics by **topic first**
- use Bundeslaender as evidence and validation lanes, not as the pedagogical design driver
- make open nationwide topic debt explicit before more state-local rollout entropy accumulates

Scope rule for now:

1. the active cross-state Physics surface is still mainly **Sek II**
2. the board therefore starts with the four upper-secondary topic rows that already have real multi-state evidence
3. Sek-I Physics rows should be added once more non-Hessen lower-secondary source lanes become real

Working rule:

1. pick one Physics topic row
2. review the current canonical atom inventory for that row
3. compare the row against all currently available Bundesland sources
4. classify each state cell
5. add canonical atoms only where multiple states or strong pedagogical structure justify them
6. only then widen or refine the state mappings for that topic

Coverage rule:

1. every active Physics topic row runs in `all states required` mode
2. a topic row is operationally closed for now once every **currently available retained-source** state column is resolved once
3. `seed`, `anchor`, `corr`, `gap`, and `loc` count as resolved cells; only `n/s` means the row is still unchecked for that state
4. if a Bundesland column stays `n/s` only because no retained Physics source lane exists in the repo yet, that does not block temporary row closure; the board still keeps that nationwide debt explicit instead of hiding it behind lane-local progress

Legend:

- `seed`: canonical topic already materially seeded from the Hessen reference lane
- `anchor`: only broad structural or area-level alignment exists
- `corr`: at least one reviewed corridor is already mapped for this topic
- `gap`: current reviewed source evidence suggests a canonical gap or unresolved atomic split
- `n/s`: not started
- `loc`: state-local packaging; do not automatically canonicalize

State columns use Bundesland abbreviations:

- `BW BY BE BB HB HH HE MV NI NW RP SL SN ST SH TH`

## Topic board

| Topic | Canonical | BW | BY | BE | BB | HB | HH | HE | MV | NI | NW | RP | SL | SN | ST | SH | TH | Open canonical gaps | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Sek II Mechanik / Dynamik | `seed` | `n/s` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `seed` | `n/s` | `corr` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | the active shared mechanics surface around free fall, horizontal throw, Newton, circle motion, and kinetic/energy entry is currently sufficient for the reviewed `HE`/`BY`/`NI`/`NW` evidence; the open debt is nationwide coverage rather than a visible new package split | keep the row stable, do not reopen canonical mechanics packaging now, and only revisit it when another state source lane produces a real shared mismatch beyond the current E-phase mechanics surface |
| Sek II Elektrizitaet / Magnetismus / Induktion | `seed` | `corr` | `n/s` | `corr` | `corr` | `n/s` | `n/s` | `seed` | `n/s` | `corr` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `n/s` | the active shared field/induction strip now covers the reviewed `HE`/`BW`/`NI`/`NW` evidence, the retained Berlin/Brandenburg `3.2.1` -> `3.2.2` route from the shared BE/BB source family, and now also one first Schleswig-Holstein field-concept corridor from the combined-stage SH source family without forcing another visible package or new canonical atom on the current canonical surface; the shared BE/BB trio `c0` / `Relativitaet` / `Eintrittswinkel` remains explicitly frozen as source-led residue, while the open debt now shifts to the still-unchecked SH follow-ons plus the remaining unchecked state columns | reopen this row through the new SH source family: keep the shared canonical cut stable, but continue Schleswig-Holstein next on `Koerper in statischen Feldern` before switching to another physics topic row |
| Sek II Schwingungen / Wellen | `seed` | `corr` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `seed` | `n/s` | `corr` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | the shared surface now covers reviewed `HE`, refreshed `BY`, widened `BW`, widened `NI`, and narrow `NW` evidence across mechanical waves, first optics/spectrum leaves, and the shared `Q2/Q3` bridge without forcing a new top-level package; the remaining open debt is now almost entirely the still-missing source lanes in the unchecked state columns, while `Michelson` in `NI` still stays intentionally source-led | treat this as the current topic-first reference row, but keep the shared cut stable: all currently available retained source states on this row are now resolved once, so reopen the row only when another Bundesland source lane becomes real or a genuinely shared gap appears |
| Sek II Quanten / Atom / Kernphysik | `seed` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `seed` | `n/s` | `n/s` | `corr` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | the currently visible `Q3/Q4` quantum, atom-model, and kernel surface is sufficient for the reviewed `HE`/`BW`/`NW` evidence; the open problem is still the many unchecked state cells, not another immediate canonical split | keep this row quiet while `Schwingungen / Wellen` catches up nationwide; reopen quantum breadth only after the active wave row has reduced its `n/s` debt or another state source clearly forces a shared gap |

## Current recommendation

Current focus:

1. keep `Sek II Mechanik / Dynamik` stable
2. treat `Sek II Elektrizitaet / Magnetismus / Induktion` as the active row again because Schleswig-Holstein now opened a new retained source family on the same shared field surface
3. keep `Sek II Schwingungen / Wellen` stable as the current broader reference row
4. keep `Sek II Quanten / Atom / Kernphysik` in residue-control mode until another retained source lane creates a real shared reason to reopen breadth

Active coordination artifact:

1. `docs/dev/canonical-gymnasium-physics-topic-workboard.md`

Why:

- Physics now has enough reviewed multi-state evidence to stop steering only by state lane
- Berlin and Brandenburg still close the retained BE/BB `3.2.1` -> `3.2.2` cut without forcing another canonical atom, and the remaining trio stays explicitly frozen as source-led residue
- Schleswig-Holstein now opens a different retained source family on the same shared field row, so the next clean move is a source-led SH follow-on rather than another BE/BB residue attempt
- the widened Niedersachsen wave strip plus the refreshed Bayern contribution now close the current wave row once across all currently available retained source states
- the active wave row is now resolved once across all currently available retained source states, so the remaining nationwide Physics debt is easier to see as missing source lanes than as another sequence of pseudo-active lane notes

Current blocker note:

1. many Physics state cells are still `n/s` because the repository does not yet have retained source snapshots for most Bundeslaender on the current Physics path
2. that is acceptable for now, but it should stay explicit on the topic board instead of being hidden behind a single still-active state lane

Definition of done for one Physics topic row:

1. the canonical atom inventory for that row is reviewed and, where needed, tightened
2. reviewed state evidence no longer forces obvious new shared Physics atoms
3. every currently available retained-source state cell in that row is resolved once; remaining `n/s` cells are only missing-source placeholders
4. state mappings for the resolved states are consistent with the revised canonical cuts
5. state-local leftovers are explicitly marked as `loc` or left out of the canonical core
