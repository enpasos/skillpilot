# Independent round B verification

All commands were executed with Node 20.20.2 on the PATH. Both native validators
read only this round's existing campaign, input, bundle, batch input and result
directory. They returned exit code 0.

- `npm --prefix app run validate:goal-description-review -- ...`: `Goal-description review batch valid: 5`.
- `npm --prefix app run validate:goal-description-review-campaign -- ...`: `Goal-description review campaign results valid: 5`.
- `node <round-b>/materialize-independent-review.mjs --check`: `PASS: five individual decisions, native bindings, image hashes and reproducible output bytes.`
- `node scripts/check_openai_plugin_review_freeze.mjs`: `CHECK openai_plugin_review_freeze PASS skillpilot-coach-v1 1.0.0 state=IN_REVIEW trees=6 files=22`.

The exact native arguments are reproducible with these shell variables from the
repository root:

```bash
export PATH=/home/enpasos/.nvm/versions/node/v20.20.2/bin:$PATH
review_round=curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-038s-exponential-wording-and-images-5-v1/round-b
review_batch=mathematik-rollout-v1-batch-038s-exponential-wording-and-images-5-v1-20260907-first-pass-b.batch-001
npm --prefix app run validate:goal-description-review -- \
  --bundle "../$review_round/review-bundle-manifest.json" \
  --input "../$review_round/description-review-input.json" \
  --campaign "../$review_round/description-review-campaign.json" \
  --run "../$review_round/results/$review_batch.run.json" \
  --batch-input "../$review_round/batches/$review_batch.input.jsonl" \
  --records "../$review_round/results/$review_batch.records.jsonl"
npm --prefix app run validate:goal-description-review-campaign -- \
  --bundle "../$review_round/review-bundle-manifest.json" \
  --input "../$review_round/description-review-input.json" \
  --campaign "../$review_round/description-review-campaign.json" \
  --batches-dir "../$review_round/batches" \
  --results-dir "../$review_round/results"
node "$review_round/materialize-independent-review.mjs" --check
```

Result: five individually justified `keep` records in the configured order,
all `candidate` / `ai_candidate`, all recommending `create` for the separately
governed understanding-evidence profile. Five actual `view_image` inspections
and matching original JPEG hashes are recorded in `independent-review-log.json`.
No current goal text, input, image, profile, registry or other round was changed.
The review grants no human approval, publication permission or learner-mastery
claim.
