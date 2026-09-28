# P-v2 binding after the ae348 image hold

The original `image-bound-10` config, candidate set and review remain unchanged
as historical evidence. The canonical visualization link for
`ae3483e3-4712-56a1-a881-2e1f8a1a8df9` was withdrawn after the image review
found that the JPG's `G(n)` axis and selection claim did not represent the
current OC/power-graph learning goal. Its former image-bound input fingerprint
is stale. The image remains on V HOLD.

`image-bound-9-retained-after-ae348-hold.review.jsonl` contains exactly the
nine unaffected, byte-identical review lines. Their config retains the
original review ID and image binding. The separate `ae348-text-only-after-image-hold`
config has no reviewed resource type and binds a new P-v2 candidate to the
current goal text and criteria only. The two inherited application cases give
all OC/power values and requirements explicitly; their expected choices and
null/alternative calculations were checked again. They do not claim that the
withdrawn JPG depicts either case correctly.

All ten active records have `status: needs_human_review` and
`reviewAuthority: ai_candidate`; none is a human approval. The central registry
references the nine-goal retained config and the one-goal text-only config,
without duplicate P ownership. A corrected image needs its own exact-asset V
review and fresh image-bound P review if it is to become P evidence.

From `app/`, reproduce and check the derivation with:

```bash
npx tsx ../curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1/materialize-after-ae348-image-hold.ts --check
npm run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1/image-bound-9-retained-after-ae348-hold.config.json
npm run quality:positive-goal-evidence:check -- --config=curricula/DE/Gymnasium/quality/goal-evidence/m7-p-gap-second16-20260923-v1/ae348-text-only-after-image-hold.config.json
```
