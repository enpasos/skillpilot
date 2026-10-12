# Normal adoption requires genuine first-pass reviews

There is no unmodified strict adoption route for the sealed `follow_up` pair. The actual dual CLI exits 1 with exactly two errors: both campaigns must be `first_pass`. The root prepared batch check exits 0. Root/A/B bundles and inputs are byte-exact; the campaign JSON differs only at `reviewPass`, producing different raw digests and stable campaign fingerprints. Exact values and verified seals are in `technical-diagnosis.json`.

Both the standalone batch path and direct `validateGoalDescriptionDualRoundResolution` path revalidate the dual first-pass requirement. The Math GK scope-narrowing compatibility lane does not cover these resource metadata changes. Preserve the sealed follow-up reviews as supplementary evidence.

Use a new additive normal batch configuration/output directory, the unchanged root-v2 base and final four IDs. Prepare before commissioning the reviewers. Compare its actual bundle/input/page/P identities with root v2; the new reviewers must receive the exact actual prepared first-pass artifacts. Use a capsule containing the exact current final asset bytes when the active public directory still contains old assets. Do not copy existing follow-up results into the fresh first-pass result directories.

Run from `app/`, replacing the explicit placeholder paths with the additive configuration and files:

```bash
node --import tsx scripts/materializeGoalDescriptionRolloutBatch.ts prepare --config <additive-batch.config.json>
node --import tsx scripts/materializeGoalDescriptionRolloutBatch.ts check --config <additive-batch.config.json>
```

After two genuine blind first current-tuple reviews and individual normal campaign-result validation:

```bash
node --import tsx scripts/materializeGoalDescriptionRolloutBatch.ts summarize --config <additive-batch.config.json> --write
node --import tsx scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts --config <additive-batch.config.json> --authoring <additive-batch/synthesis-authoring.json> --write
node --import tsx scripts/materializeGoalDescriptionRolloutResolutions.ts --config <additive-batch.config.json> --synthesis-manifest <additive-batch/synthesis-decisions.json> --write
node --import tsx scripts/materializeGoalDescriptionRolloutBatch.ts finalize --config <additive-batch.config.json> --write
```

The synthesis authoring must contain explicit bilingual decisions from the actual fresh reviews. No existing package, active source, registry, Git state or normal validator was changed during this diagnosis.
