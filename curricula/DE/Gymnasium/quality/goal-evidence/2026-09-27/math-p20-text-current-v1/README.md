# Mathematics M7: 20 current text-only P-v2 candidates

This package closes the **registration/evidence-profile** gap for the 20 current
`curricularAtomic` mathematics goals absent from the central P-v2 registry on
27 September 2026. It does not change the canonical landscape, visualization
assets or QA, learner mastery, or human review status. All records are
`needs_human_review / ai_candidate`, E1/G1. The rollout counts them as
machine-reviewable P evidence, **not** as human-approved content.

The exact IDs are the 20 ordered `scope.goalIds` in
`positive-evidence.config.json`. `reviewedResourceTypes: []` is intentional:
the user is preparing replacement images separately, and none of these
profiles claims an image is correct. Every case must be answered on fresh
work, not copied from an illustration.

## Reinspection and provenance

`materialize-candidates.mjs` pins nine historical candidate sets by SHA-256,
selects exactly these 20 IDs, and carries their bilingual content into a new
current-input binding. The records were checked against current DE and EN goal
descriptions and direct prerequisites. Arithmetic and geometry were
recomputed, notably:

- line–plane angle `18be713b`: direction `(1,0,√3)` meets `z=0` at 60°;
- probability `21fa0c22`: red/red without replacement is `3/10`, and at
  least one six in four independent throws is `671/1296`;
- cone net `74d29d0c`: `r=3`, `s=5` gives arc `6π` and sector angle `6π/5`;
- vector product `7bb3c312`: the triangle and parallelogram cases yield
  `3√2` and `3` square units respectively;
- Mandelbrot `9b339361`: `c=i` yields the bounded orbit
  `0, i, −1+i, −i, −1+i, …`, while `c=1` escapes;
- constrained profit `e02b994f`: on integers `0≤x≤5`, the maximum is
  `P(5)=15`, not the excluded continuous peak at `x=6`.

Three old profiles needed a substantive improvement before reuse. For
`9023226b`, the rectangle case now actually uses the quadratic formula and
checks its negative root against the positive-length domain. For `a594dec0`,
the transfer tetrahedron is genuinely oblique: its triple product has
magnitude 6 cm³ and its volume is 1 cm³. For `f2a12269`, a constant-section
prism case now transfers to a similar-pyramid cut: the top:remainder volume
ratio is `1:63`, while the top:whole share is `1/64`. This distinguishes
linear height ratios from cubic volume scaling. Their DE and EN task and
answer fields were updated together. Every other mathematical case was
retained only after checking its calculations and fit to the present goal.

The older source candidates included image-HOLD notes in `dissent`. Those
notes are **not** carried as P-profile disagreement: image defects remain a
separate V gate. The source files and their original notes remain in Git and
are hash-pinned by the materializer. No prior review record was rewritten.

## Reproducible verification

Run from repository root:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-p20-text-current-v1/materialize-candidates.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-p20-text-current-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-p20-text-current-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-p20-text-current-v1/positive-evidence.config.json
npm --prefix app run quality:deep-understanding-rollout:check
```

The focused checker returned 20 candidates, zero blocking issues. After the
nonoverlapping central registration, the deep-understanding checker returned
Math **P 797/797** and **D/P/A/M/V = 737/797/797/797/760**, with 0 blockers.
The strict intersection is still **729/797**: raising P alone cannot make a
goal complete while D or V remains open. Physics remains 478/478.
