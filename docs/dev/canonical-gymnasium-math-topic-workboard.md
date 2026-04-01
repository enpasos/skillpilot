# Canonical Gymnasium Mathematics Topic Workboard

Snapshot: `2026-04-01`

Purpose:

- steer nationwide canonical math work by **topic first**
- use Bundeslaender as evidence and validation lanes, not as the pedagogical design driver
- make canonical gaps explicit before more state-local rollout work is done

Working rule:

1. pick one high-level topic
2. review the current canonical atom inventory for that topic
3. compare that topic against the reviewed Bundesland sources
4. classify each state cell
5. add canonical atoms only where multiple states or strong pedagogical structure justify them
6. only then deepen or widen state mappings for that topic

Legend:

- `seed`: canonical topic already materially seeded from the Hessen legacy baseline
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
| Sek I Zahlen / Terme / Algebra | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `anchor` | `anchor` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `A1-A4` packaging is in place and the first reviewed `HB` / `HH` pressure test is connected; only `A5` and late residue handling should remain open for now | freeze more algebra package churn until another reviewed lane or a residue conflict really forces a separate `A5` decision |
| Sek I Funktionen / Zuordnungen | `seed` | `n/s` | `n/s` | `corr` | `corr` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `F3-F5` packaging is now connected on the first reviewed lanes; remaining broad HB/HH mixed corridors look more like source-granularity residue than like a new canonical gap | freeze more function package churn unless the remaining mixed lower-secondary lanes force a genuinely new shared atom |
| Sek I Geometrie / Raum | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | canonical `G2-G7` packaging and the first `HB`/`HH` realignment are now in place; the next open question is only whether additional reviewed states force new shared atoms, especially around `G6/G7` | freeze geometry widening until another reviewed state exposes a concrete shared gap in the canonical cut |
| Sek I Daten / Zufall | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `anchor` | `anchor` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `n/s` | `n/s` | canonical `D1-D5` package surface is now explicit; further reviewed state work should only test mapping residue, not reopen the package split without strong contrary evidence | freeze package churn here and use additional state lanes only for bridge quality and residue control |
| Sek II Analysis | `seed` | `n/s` | `n/s` | `corr` | `corr` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `AN2-AN4` packaging is now in place and the first obvious `BE`/`HB`/`HH` realignment corrections are connected; the remaining open tension sits mainly in the late continuation corridor around differential equations, LK-depth, and parameter-family packaging | freeze more package churn and reopen `AN5` only if additional reviewed residue shows that the late continuation corridor still hides a real shared split |
| Sek II Stochastik | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `ST2`, `ST4`, and `ST5` packaging is now in place, `ST3` remains an explicit LK-boundary marker, and the first reviewed `HB`/`HH`/`HE` pass does not force a new bridge package; only broader multi-state residue could reopen this topic | freeze package churn here and reopen only if another reviewed lane shows a real shared canonical gap |
| Sek II Analytische Geometrie / Vektoren | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `AGV2-AGV5` packaging is now in place; the next question is no longer package invention but whether reviewed `HB`/`HH`/`HE` residue forces broader parent mappings or another cut between relation work and metric/application work | freeze more package churn and run the first reviewed `HB`/`HH`/`HE` realignment pass before deciding on any further space-geometry split |
| Sek II Lineare Algebra / Matrizen | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | linear systems, matrix operations, transition models, and long-term behavior need a canonical pass to separate shared core from LK depth cleanly | review canonical matrix and transition-process atoms before further lane widening |

## Current recommendation

Active next topic:

1. `Sek II Analytische Geometrie / Vektoren`

Active audit artifact:

1. `docs/dev/canonical-gymnasium-math-sek2-analytic-geometry-audit.md`

Why:

- the first canonical Sek-II analytic-geometry packaging pass is now in place
- the next bottleneck is no longer package invention but pressure-testing whether the revised visible space/vector surface survives real reviewed mappings cleanly
- the reviewed `HB` / `HH` / `HE` evidence already available there is enough for a first realignment pass without widening more state lanes first

Definition of done for one topic:

1. the canonical atom inventory is reviewed and, where needed, tightened
2. reviewed state evidence no longer forces obvious new shared atoms
3. state mappings for the started states are consistent with the revised canonical cuts
4. state-local leftovers are explicitly marked as `loc` or kept out of the canonical core
