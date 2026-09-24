# Five mathematics volume goals: current image-bound P-v2 AI candidates

This package is a targeted positive-understanding-evidence-v2 re-review for the
current prism, pyramid, cylinder, cone, and sphere goals. It is **not** a human
approval, a learner-performance record, a source-review decision, or a V-gate
approval. Every generated record must remain `needs_human_review` with
`reviewAuthority: ai_candidate`, `E1`, and `G1`.

The historical `m7-q2-bodies-volume-keep9-p-20260923-v1/text-only-six` files
are preserved byte-for-byte, but their old review-input fingerprints predate
the changed images. They are not a current P owner and must not be registered
alongside this package. The sixth historical goal (scalar triple product) is
outside this five-goal package and remains independently unresolved.

The materializer checks the exact canonical goal/page/image/alt-text binding,
current AI V decision and identical PNG copies, the exact Hessian legacy-to-
canonical mapping, and the exact current DE/EN goal wording before creating
current P records. It rejects stale page/goal fingerprints and retains the
prior image-bound P fingerprints as an audit baseline. All five current canonical goals have no direct `sourceRef`; the
exact mapping is supporting provenance only, not a substitute for the
independent D/source review. `binding-review.json` records the current page
fingerprints and this limitation.

Transfer is deliberately separate from the pictures. The new pyramid and
sphere cases replace historical tasks that reproduced the new illustrations'
numbers exactly; the cone case also changes its dimensions. Each goal keeps
two mathematically distinct demonstrations (dimensioned sketch and coordinate
representation, or fresh scale change) and demands a reasoned relation,
perpendicular height or radius, and correct units as appropriate. The
operative goal and profile never make a formula sheet the competence.

Run from the repository root after the visualization QA batch is stable:

```bash
./app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1/materialize.ts --write
./app/node_modules/.bin/tsx curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1/materialize.ts --check
./app/node_modules/.bin/tsx app/scripts/positiveGoalEvidenceReview.ts --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-volume-five-image-bound-p-20260924-v1/current-five.config.json --mode=check
```

The central registry and five-gate report are deliberately not edited here;
the integrating owner handles their registration and reporting. A green P
package alone does not close any M7 goal.

Targeted check on 24 September 2026 after the five-image V batch became
stable: materializer `--write` and `--check`, P review `--mode=check`, the
positive-evidence profile/review/candidate tests, and `git diff --check` all
passed. The P review reported exactly **five `needs_human_review` AI
candidates**, zero approvals and zero blocking issues. Current goal-book pages
are 721 (prism), 722 (pyramid), 725 (cylinder), 726 (cone), and 727 (sphere);
the exact page and image fingerprints are in `binding-review.json`.

After the canonical DE/EN descriptions changed from TeX to plain Unicode
notation, each formula and its associated assessment demand was re-reviewed:
prism layering `V = G · h`; pyramid as one third of a matching prism;
cylinder with circular base `V = πr²h`; cone as one third of a matching
cylinder; sphere with cubic radius dependence `V = (4/3)πr³`. These are
notation-only changes, so the independent two-case transfer profiles retain
their exact prior fingerprints. The five current goal and P-input fingerprints
were regenerated; `binding-review.json` identifies both old and new
fingerprints and records the semantic decision for each goal. The targeted
materializer, P review and three P tests passed again; there are still five
`needs_human_review`/`ai_candidate` records and no human approvals.
