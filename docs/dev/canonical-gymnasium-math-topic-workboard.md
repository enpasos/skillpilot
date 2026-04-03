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
| Sek I Zahlen / Terme / Algebra | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `anchor` | `anchor` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `n/s` | visible `A1-A4` packaging is in place and `SH` now confirms that late lower-secondary equation residue does not justify a separate visible `A5`; remaining work is residue control only | freeze algebra package churn and reopen only if a later reviewed lane forces a genuinely new shared late-algebra corridor |
| Sek I Funktionen / Zuordnungen | `seed` | `n/s` | `n/s` | `corr` | `corr` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `F3-F5` packaging is now connected on the first reviewed lanes; remaining broad HB/HH mixed corridors look more like source-granularity residue than like a new canonical gap | freeze more function package churn unless the remaining mixed lower-secondary lanes force a genuinely new shared atom |
| Sek I Geometrie / Raum | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | canonical `G2-G7` packaging and the first `HB`/`HH` realignment are now in place; the next open question is only whether additional reviewed states force new shared atoms, especially around `G6/G7` | freeze geometry widening until another reviewed state exposes a concrete shared gap in the canonical cut |
| Sek I Daten / Zufall | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `anchor` | `anchor` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `n/s` | `n/s` | canonical `D1-D5` package surface is now explicit; further reviewed state work should only test mapping residue, not reopen the package split without strong contrary evidence | freeze package churn here and use additional state lanes only for bridge quality and residue control |
| Sek II Analysis | `seed` | `n/s` | `corr` | `corr` | `corr` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `AN2-AN4` packaging is now in place, the reviewed `BB`/`BE`/`BY`/`HB`/`HH`/`SH` realignment pressure passes are connected, and the reviewed `NI` late-continuation lane does not justify a separate visible `AN5` package | freeze package churn here and reopen only if another reviewed lane exposes a shared canonical gap beyond the current late-continuation atoms |
| Sek II Stochastik | `seed` | `n/s` | `corr` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `ST2`, `ST4`, and `ST5` packaging is now in place, `ST3` remains an explicit LK-boundary marker, and the reviewed `BB`/`BY`/`HB`/`HH`/`HE`/`SH` pressure passes do not force a new bridge package; only broader multi-state residue could reopen this topic | freeze package churn here and reopen only if another reviewed lane shows a real shared canonical gap |
| Sek II Analytische Geometrie / Vektoren | `seed` | `n/s` | `corr` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `corr` | `n/s` | visible `AGV2-AGV5` packaging is now in place and reviewed `BB`/`BE`/`BY`/`HB`/`HH`/`HE`/`SH` evidence does not force a new shared package; remaining tension sits mainly in source-granularity residue between broad overview parents and the tighter late packages | freeze package churn here and reopen only if another reviewed lane shows a real shared canonical gap |
| Sek II Lineare Algebra / Matrizen | `seed` | `n/s` | `corr` | `n/s` | `n/s` | `corr` | `corr` | `seed` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | `n/s` | visible `LM2-LM5` packaging is now in place, reviewed `BB`/`BE`/`BY`/`HB`/`HH`/`HE` evidence is stable, and the reviewed `NI` projection-with-matrices lane confirms that the late `LM5` branch is a real but sufficiently narrow continuation rather than a sign of missing shared packaging | freeze package churn here and reopen only if another reviewed lane shows a real shared canonical gap |

## Current recommendation

Active next focus:

1. no new top-level package pass
2. switch to residue control and additional reviewed-state evidence

Active coordination artifact:

1. `docs/dev/canonical-gymnasium-math-residue-control-board.md`

Supporting audit artifacts:

1. `docs/dev/canonical-gymnasium-math-sek2-linear-algebra-audit.md`
2. the existing topic audits for residual reopen decisions only

Why:

- the first canonical packaging passes for the current top-level math topics are now in place
- the reviewed upper-secondary pressure tests across `BB`, `BE`, `BW`, `BY`, `HB`, `HH`, `NI`, `NW`, and `SH` do not currently force another top-level package split
- the next gains now come more likely from residue control and additional reviewed-state evidence than from opening another top-level package split immediately

Definition of done for one topic:

1. the canonical atom inventory is reviewed and, where needed, tightened
2. reviewed state evidence no longer forces obvious new shared atoms
3. state mappings for the started states are consistent with the revised canonical cuts
4. state-local leftovers are explicitly marked as `loc` or kept out of the canonical core
