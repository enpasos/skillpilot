# Q2 LK line and plane reflection: isolated P-v2 AI candidate

This two-goal candidate set covers `a97c7cce-1343-5d04-926f-4a4f323b3c21` (line) and `985d5529-a586-50eb-bd7f-2db2be8906d1` (plane). The current canonical DE/EN wording claims reflection in general spatial configurations; the reviewed HMKB Q2.3 source extraction says “Spiegeln von Punkten, Geraden und Ebenen allgemein” (p. 43, bullet 13). The source phrase does not explicitly name the mirror object. Both current JPGs depict reflection in a mirror plane `x=2`, so this profile tests plane mirrors only and records the scope uncertainty in `dissent`. It makes no claim about reflection in a point or line.

The earlier image-bound AI candidates use only the axis-aligned mirrors `x=0` and `z=1`. This package adds two independent, fresh cases per goal. The line cases use a crossing line with changed direction under `S:x+y=2`, and a distinct parallel line whose direction remains unchanged under `R:x-y+z=1`. The plane cases use an intersecting plane with changed normal under `S` and a parallel plane with reversed signed offset under `R`. The current images remain teaching context; none of the four new answers is copied from them.

The reviewed original/public JPG bytes match exactly:

| Goal | SHA-256 |
| --- | --- |
| Line | `e49940b3d327ba539aef28d21ec8db69bab4a7be8761265dbf94e45f6113e34d` |
| Plane | `cf54e59eaf5edb3a7ac481d4b370906f984053f3416a37dfab8f96fee5f31d32` |

For each mirror `n·X=d`, the exact check is `X′=X−2(n·X−d)n/|n|²`. `verify-examples.mjs` checks every stated point image, midpoint, and normal connector; each image line/plane equation; non-collinearity of plane point triples; fixed intersection points; parallel directions; opposite signed plane offsets; and both exact JPG hashes.

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-line-plane-oblique-mirror-p-candidate-20260926-v1/verify-examples.mjs
app/node_modules/.bin/tsx app/scripts/materializePositiveGoalEvidenceCandidates.ts --config curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-line-plane-oblique-mirror-p-candidate-20260926-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-line-plane-oblique-mirror-p-candidate-20260926-v1/positive-evidence.candidates.json
app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-q2-line-plane-oblique-mirror-p-candidate-20260926-v1/positive-evidence.config.json --mode=check
```

The materialized records remain `needs_human_review` / `ai_candidate`, `E1/G1`. This package does not edit the current ten-goal P owner, the central rollout registry, the canonical goals, visualization assets, or human decisions. Its config must not be registered alongside the overlapping old owner; a later adjudicated replacement would need coordinated ownership splitting and the normal quality gates. This candidate does not establish learner understanding or real-host acceptance.
