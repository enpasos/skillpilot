# Three current mathematics P-v2 candidates without image evidence

This package supersedes only the three stale P-v2 **bindings** listed below. It
does not change canonical goals, the central rollout registry, historical
reviews, or any visualization decision. All three current canonical goals have
no `resourceLinks`, because an identified mathematical error put their former
images on V HOLD. `reviewedResourceTypes: []` is deliberate: these records
claim positive understanding from fresh text tasks, not from the held images.

The earlier P-v2 profiles were checked again against the current bilingual
goal wording, direct prerequisites, demand level and GoalBook context. The
profile fields were retained only after these concrete checks:

| Goal | Current context and substantive reinspection | Image separation |
| --- | --- | --- |
| `1b70498a-62a0-5a84-99dd-476b8af68da6` | E-phase, GK/LK; prior knowledge of linear parameters and quadratic graphs remains prerequisite, while model choice, parameter determination and contextual interpretation are assessed here. A fare of 4 € plus 2 €/km gives `P(d)=4+2d` and `P(5)=14 €`. The independent thrown-ball data `(t,H)=(0,1),(1,4),(2,5)` give `H(t)=-t²+4t+1`, `H(3)=4 m`, and a physical flight domain ending at `t=2+√5` s. The two cases genuinely vary the change structure and domain limit. | Previous ball-*fall* picture showed an upward arc starting at zero and is not used. |
| `2231c29b-eb4e-51ae-9cb1-eb033bf16099` | J5 geometry, AB1; the cases distinguish the underlying lines of short segments from the visible segment pieces, and a right angle remains a right angle after rotation. This directly tests recognition, precise language and geometric justification without importing construction competence. | Previous 90° markings did not match the drawn angles; the current profile makes no image claim. |
| `944dd479-9f30-5acb-ab32-3ea0b6dc8e06` | Q2 spatial geometry, GK/LK, AB2; with right-handed axes, `a=(2,0,0)`, `b=(0,3,0)`, `c=(0,0,4)` yield `b×c=(12,0,0)`, `[a,b,c]=24 cm³`, `[a,c,b]=-24 cm³`, and volume `24 cm³`. The non-axis-aligned transfer `a=(1,1,0)`, `b=(1,0,1)`, `c=(0,1,2)` yields `b×c=(-1,-2,1)`, signed product `-3 cm³`, and volume `3 cm³`. Thus orientation and absolute volume are separated. | Previous vector arrows contradicted the labeled axes; the current profile makes no image claim. |

The GoalBook contexts inspected were the functions-diagrams ten-page bundle of
23 September for the first goal, the Batch-001 final twenty-page bundle for
the second, and the Q2 bodies eight-page bundle of 24 September for the third.
The older second-goal book bundle still contains its then-linked image;
the **current canonical goal** no longer does. The materializer checks that
all three current goals remain atomic and have no resource links before it
builds candidate records. The standard P-v2 materializer computes the current
goal/review-input fingerprints. This is a new, content-reinspected candidate
binding, not a representation that the three images have passed V.

`materialize-candidates.mjs` pins the exact three historical review files and
profile fingerprints and constructs `positive-evidence.candidates.json` with
new per-goal reasons. The previous source files are not rewritten. The standard
P-v2 materializer then creates `positive-evidence.review.jsonl` from current
canonical input; both scripts can verify their generated outputs without
`--write`.

Focused verification on 24 September 2026:

```bash
node curricula/DE/Gymnasium/quality/goal-evidence/m7-three-held-image-text-current-20260924-v1/materialize-candidates.mjs
npm --prefix app run quality:positive-goal-evidence-candidates -- --config curricula/DE/Gymnasium/quality/goal-evidence/m7-three-held-image-text-current-20260924-v1/positive-evidence.config.json --candidates curricula/DE/Gymnasium/quality/goal-evidence/m7-three-held-image-text-current-20260924-v1/positive-evidence.candidates.json
npm --prefix app run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-three-held-image-text-current-20260924-v1/positive-evidence.config.json
```

All three focused checks passed: three `needs_human_review` AI candidates,
zero validator issues. They are E1/G1 candidate profiles, **not** human
approvals or learner-mastery evidence. Their V image HOLDs remain open, so this
P package alone does not increase the strict D/P/A/M/V M7 intersection.
