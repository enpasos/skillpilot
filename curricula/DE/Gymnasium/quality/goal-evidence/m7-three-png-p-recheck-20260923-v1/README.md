# M7 P-v2: three current PNG bindings, 2026-09-23

This is an informed AI re-review of the **current** goal, page, context, and PNG for
`163dd583…`, `fb4dcd2a…`, and `6fc9246a…`. It does not replace the historical
reviews or claim an independent human judgment. The new records are all
`needs_human_review` / `ai_candidate`, limited to `E1` / `G1`. Only two of the
three are currently eligible for registry integration: `163dd583…` has a
separate curricular-applicability HOLD.

The native P-v2 audit and proposed registry scopes are split as follows:

| Config | Goals | What it contains |
| --- | ---: | --- |
| `three-current-png.config.json` | 3 | Complete re-review audit, including the applicability-held candidate; **do not register this whole config**. |
| `current-two.config.json` | 2 | The two new records eligible for later P-registry integration: `fb4dcd2a…`, `6fc9246a…`. |
| `applicability-held-163.config.json` | 1 | Documents `163dd583…` separately; **do not register while GK/LK mismatch remains**. |
| `modeling-retained14.config.json` | 14 | Byte-identical records retained from the earlier modeling-sixteen review, excluding `163dd583…` and `fb4dcd2a…`. |
| `spatial-retained8.config.json` | 8 | Byte-identical records retained from the earlier spatial-nine review, excluding `6fc9246a…`. |

`binding-receipt.json` pins each new goal/page fingerprint and image digest,
records the old and new P review-input fingerprints, and pins both source
config/review digests. The materializer verifies current canonical and public
PNG bytes, GoalBook visualization URL, page context, and exact-image QA. It
fails if those bindings change. A global BookModel digest alone is not used as
the decision: unrelated pages can change without altering these three inputs.

## Fachliche Nachprüfung

- `163dd583…` — The current picture poses simplicity, data fit, and
  interpretability as *questions*; it does not establish that one model always
  wins. The two independent E1 cases compare a short-term growth forecast and
  a piecewise tariff against data and purpose. A good fit is not treated as
  unlimited validity; constructing models or sensitivity analysis is not
  asserted here. The DE/EN profile text is retained, but the P input binding
  is new. **Integration HOLD:** the canonical goal and its exact-mapped HE
  source both say `(LK)` and have only `LK` tags, whereas the current base
  GoalBook projects the page into GK, including DE-HE. The HE GK composition
  view includes the shared `Problemlösen und Argumentieren` subtree containing
  this LK-only descendant. The P content is assessable for the LK goal, but
  the current page scope overclaims it; no GK P clearance is inferred.
- `fb4dcd2a…` — The picture proposes a taxi base price and asks whether real
  prices support it. It is an illustration, not evidence that a tariff applies.
  The E1 cases instead test a waiting-time charge and a changing tank outflow.
  The new DE/EN case wording fixes the mathematical conditions: taxi distance
  is in km, waiting time in min, the extra rate is positive in €/min, and the
  charge requires contextual support. For the tank, `t` is in min on
  `0 ≤ t ≤ 40 min`; a later, measured outflow rate must be nonnegative and
  smaller than `3 L/min`, with the earlier trajectory unchanged for the
  stated comparison. No extrapolation beyond the interval is claimed.
- `6fc9246a…` — The new picture has `a=(1,0,0)`, `b=(0,1,0)`, and
  `c=(1,1,0)=a+b` on an orthogonal x/y grid at `z=0`, and the three standard
  basis vectors aligned with their 3D axes. Thus the left triple is dependent
  by a nontrivial zero combination, and the right triple is independent. E1
  instead asks for fresh algebraic evidence and geometric interpretation for
  other triples, including the zero-vector transfer; reading the picture is
  not a learner demonstration. The DE/EN profile text is retained, but the P
  input binding is new.

All three profiles require two independent demonstrations, fresh variation,
and transfer. None prescribes one calculation method. The PNGs support
instruction; they do not themselves prove understanding. The page/QA state is
still `review_candidate`, not publication approval, and there is no human P
approval.

The reported GK/LK mismatch does **not** concern `fb4dcd2a…`: its canonical
goal and exact-mapped HE source both carry `GK` and `LK`, and its GoalBook
projection includes both. The LK-only inconsistency is `163dd583…`.

## Reproduction and integration boundary

From the repository root:

```bash
app/node_modules/.bin/tsx app/scripts/materializeMathM7ThreePngPRecheckPackage.ts
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/three-current-png.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/three-current-png.candidates.json
for stem in three-current-png current-two applicability-held-163 modeling-retained14 spatial-retained8; do
  app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-three-png-p-recheck-20260923-v1/${stem}.config.json --mode=check
done
```

No central registry was edited here. To integrate only the currently valid
P records later, replace the *two* old `positiveEvidenceConfigPaths` entries
for modeling-sixteen and spatial-nine in one registry change with these
*three* paths: `modeling-retained14.config.json`,
`spatial-retained8.config.json`, and `current-two.config.json`. Neither
`three-current-png.config.json` nor `applicability-held-163.config.json` is
registry-eligible yet. Do not add new configs beside the old ones: that would
overlap goal IDs. This split leaves `163dd583…` without a current registered P
record until the GK/LK applicability mismatch is fixed and freshly rebound.

The base GoalBook config has `evidenceReviewPaths: []`, and its page fingerprint
is computed from the page itself; a change only to the separate rollout P
registry does not change these pages or the D3 page fingerprints. Any
canonical, composition-view, QA, or GoalBook-config repair may change them
and requires targeted rebinding. Re-run the native reviews and the global
rollout/quality and protected-Maturity checks after any registry change. The
native rollout may count valid AI P candidates for the machine P gate, but
**human adjudication remains open**. The earlier D page-bound reviews for
these three images were not rebound here; this P package does not resolve
their separate D currency or claim M7 completion.
