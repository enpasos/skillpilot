# Inactive Bio 0beb adoption route

SPDX-License-Identifier: Apache-2.0

This preparation writes only new adoption configs, `native-D1`, `positive`, and
`prepared-plan` artifacts. Root owns active/Git writes and the existing
`before-active`, `historical-original` and `FIRST` receipt. The sealed technical
96-file input remains unchanged.

## Actual prepared files

- `configs/D1.relocated.batch.config.json`: exactly the original standard batch
  config with `outputDirectory` relocated to this adoption package.
- `native-D1`: initially a 28-file clone. All 27 non-manifest files are byte-exact. Only
  the batch manifest's `configPath` and `configDigest` change to the relocated
  config; book/PDF/page/context/campaign/run descriptors remain exact.
- `active-configs/P1.future-active.config.json`: live canonical/semantic paths,
  original author review ID, no `reportPath`, unchanged candidate status, exact
  new-image author record at `positive/P1.current.exact.jsonl`.
- `active-configs/P10.future-active.config.json`: the ten unchanged original
  P11 records at `positive/P10.current.exact.jsonl`, with their original run
  manifest retained and live canonical/semantic paths.
- `prepared-plan/registry.one-goal.future-active.json`: only one new D1 index,
  one 0beb supersession from the historical D14 index, and P11 → P10 + P1.
- `prepared-plan/canonical.alt-only.future-active.json` and
  `QA.single-image.future-active.json`: the exact prepared one-goal changes.
- `prepared-plan/INACTIVE.single-goal-CAS-and-native-relocation.actual.json`:
  before hashes, exact native copy bindings, unchanged A/M/semantic hashes,
  and the actual scope of the future CAS.

The actual sealed A/B D pair has now been imported and normal synthesis completed.
The new D1 index exists with one strict `keep_current` resolution. Registry
references remain an inactive plan. Current A397/M397 configs and semantic decisions are unchanged; no new
A/M vote is invented. All non-Biology registry fields and all other Biology
fields are exact. The old D14/P11 records remain historical originals.

## Actual-results import and normal finalization

Root must provide a JSON request with `first` and `second` objects. Each has:
`sealPath`, `sealSha256`, `recordsPath`, `recordsSha256`, `runPath`, `runSha256`.
Paths identify actual completed separately sealed D KEEP output, not proposed
records. The helper verifies every declared seal file, ownership of the record
and run, byte hashes, one KEEP record, exact current goal/page/text fingerprints,
bundle/book binding, actual completed run, first-pass campaign, independence
group and distinct run IDs. It preserves record/run bytes and never writes a
peer verdict or human attestation.

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/prepared-plan/import-actual-D-and-finalize.py <root-actual-D-import-request.json>
```

The helper invokes unchanged normal scripts in the existing skinny ignored
capsule, using the fixed current candidate inputs and exact new asset. It runs:

```bash
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts summarize --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/configs/D1.relocated.batch.config.json --write
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/configs/D1.relocated.batch.config.json --authoring curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/native-D1/ACTUAL.dual-keep-synthesis-authoring.json --write
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutResolutions.ts --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/configs/D1.relocated.batch.config.json --synthesis-manifest curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/native-D1/synthesis-decisions.json --write
app/node_modules/.bin/tsx app/scripts/materializeGoalDescriptionRolloutBatch.ts finalize --config curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-active-adoption-root-20261012-v1/configs/D1.relocated.batch.config.json --write
```

The ordinary validators check the full actual batch input/context and result
contracts before any resolution. Generated summaries, synthesis and resolutions
are copied back only if new or byte-exact. Failed receipts remain preserved.

Actual execution receipts are:

- `prepared-plan/ACTUAL.sealed-D-result-byte-import.json`
- `prepared-plan/ACTUAL.normal-D-finalization-commands.json`
- `prepared-plan/checks/{summarize,synthesis-manifest,resolutions,finalize}.actual.txt`
- `prepared-plan/ACTUAL.normal-D1-finalization.json`
- `native-D1/resolution-index.json`

The latest four normal commands all exited 0. The first synthesis attempt rejected
the authoring path outside the exact batch directory; its failed receipt and
original helper bytes remain preserved. Only the inactive helper path was corrected;
normal code, schemas and actual peer records/runs remain unchanged.

The index SHA is `sha256:2558c34653c6ce43d2150c92a322c8e5f923026119d8bbd22c7768e4c38fa47b`.
Its one resolution SHA is `sha256:66c6c8fdf55fae328c820e8ed4eaa0df38ec9afd62bd54648b6a6a948ec46495`.
The valid tuple is:

- goal fingerprint: `sha256:c62ad78e7eb5580d90f5964506946fcc3a83f8b2be293aca551ae6bf1f27e85f`
- page fingerprint: `sha256:eb74268451e36ed75c93db5706ce1d60c43fe8b51b9399fbee9917eabbad5ece`
- goal review context fingerprint: `sha256:0212a2e312880dec9c448697175c586ba910308a2c6f7bcca926eb2d843faded`

Both raw record/run pairs are byte-exact, and the 96-file technical seal was
reverified unchanged. Whole-profile P acceptance is handled by root from its
actual separately sealed pair; the author P1 record is retained
exactly as a candidate, with scientific provenance bound separately by root.
Only root applies the recorded CAS once the proof is complete, then verifies
the normal strict Biology 397/397 checkpoint. No active or Git write, review
vote, strict gain, human approval or deployment is claimed here.
