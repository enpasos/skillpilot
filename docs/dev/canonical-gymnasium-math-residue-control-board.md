# Canonical Gymnasium Mathematics Residue Control Board

Snapshot: `2026-04-01`

Purpose:

- control the remaining canonical math residue after the first package passes for the main top-level topics
- prevent random reopening of frozen topic cuts without concrete reviewed-state pressure
- make explicit which residues are
  - accepted as source-granularity noise
  - waiting for more reviewed-state evidence
  - strong enough to justify reopening a canonical package split

Working rule:

1. do not reopen a frozen topic package just because one broad source corridor feels imperfect
2. classify each residue explicitly
3. only reopen a canonical cut if multiple reviewed lanes or a hard runtime/validation problem force it
4. otherwise prefer
   - state-local parent remaps
   - clearer broad-parent placement
   - explicit documentation that the residue is source granularity, not a canonical gap

Legend:

- `accept`: reviewed and accepted as source granularity or stable packaging residue
- `watch`: real tension exists, but not enough reviewed pressure to reopen yet
- `reopen-if-forced`: next contradictory reviewed lane should reopen the package cut
- `next-lane`: more reviewed-state evidence is the right next step

## Residue board

| Residue | Topic | Scope | Status | Current judgment | Next action |
| --- | --- | --- | --- | --- | --- |
| `AN5-late-continuation` | `Sek II Analysis` | canonical + `BB/BE/HB/HH/HE/NI` | `accept` | the reviewed `NI` upper-secondary lane adds explicit differential-equation continuation and parameter-family evidence, but these already land on distinct canonical atoms without forcing a new visible `AN5` package | keep the current `AN2-AN4` surface frozen and reopen only if another reviewed lane shows a shared late continuation gap that cannot be absorbed by the existing atomic targets |
| `ST3-HH-Modul-5.2` | `Sek II Stochastik` | `HH` | `accept` | `Modul 5.2 Hypothesentests und Normalverteilung` is a real source hybrid, but child mappings already separate `ST3` and `ST4` cleanly enough | keep broad parent placement and do not invent a new canonical bridge package from this alone |
| `AGV-HH-Modul-6-parent` | `Sek II Analytische Geometrie / Vektoren` | `HH + BB/BE/BY/SH` | `accept` | the broad `HH Modul 6` parent still sits above tighter `AGV4/AGV5` children, but `BB`, `BE`, `BY`, and `SH` reviewed upper-secondary lanes now fit the frozen `AGV` surface without forcing an extra bridge package | keep the current `AGV` package cut frozen and only reopen if another reviewed state shows the same late relation/metric hybrid pattern at parent level |
| `LM5-role` | `Sek II Lineare Algebra / Matrizen` | canonical + `BB/BE/BY/NI` | `accept` | `BE` fits the frozen `LM2-LM4` surface cleanly, `BY` now adds a first reviewed `LM2-LM4` parent pass on the same frozen surface, `BB` contributes the first exact projection-intuition side lane, and the reviewed `NI` lane adds explicit matrix-based projection evidence that lands directly on the late `LM5` continuation | keep the current `LM2-LM5` package cut frozen and reopen only if another reviewed lane exposes a real shared gap between transition-matrix work and geometric mapping matrices |
| `A5-late-equation-split` | `Sek I Zahlen / Terme / Algebra` | canonical + `HB/HH/HE/SH` | `accept` | the `SH` lower-secondary lane adds the missing pressure test: linear systems fit the current `A4` surface, while quadratic and exponential equations stay attached to the function-side boundary packages rather than forming one shared late-algebra corridor | keep `A5` closed for now and reopen only if another reviewed lane exposes a genuinely shared late-algebra continuation outside both `A4` and the function packages |
| `F-mixed-lower-secondary-corridors` | `Sek I Funktionen / Zuordnungen` | `HB/HH` | `accept` | remaining broad lower-secondary corridors still mix algebra and function language, but the shared canonical function surface no longer looks like the main problem | keep correcting parent mappings locally instead of reopening the function packages |

## Current recommendation

Next productive mode:

1. residue control on frozen topics
2. additional reviewed-state pressure where the residue board says `watch` or `next-lane`

Best next reviewed-state pressure tests:

1. keep residue control quiet until a validator finding or a new reviewed lane creates concrete package pressure
2. reopen a frozen topic only when the new evidence cannot be absorbed by parent remaps or existing atomic targets

Reason:

- the upper-secondary package surfaces for analysis, stochastics, analytic geometry, and matrices now exist
- `AGV` now has additional reviewed pressure from `BB/BE/BY/SH` without reopening the package cut
- `LM` now has additional reviewed pressure from `BB/BE/BY` without forcing a package split or remap wave
- `A5` is now pressure-tested by `SH` and does not need to be opened as a visible package
- the main remaining uncertainty is no longer first package invention but the remaining `watch` residues
