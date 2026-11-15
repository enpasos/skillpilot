# PR #157: bounded package-contract repair

The failed `Curriculum package contracts` job is job `132777183073` of run
`43700773614`, head `161acc0d483780c6bece1be316b51fd0054c2e2f`. The actual
log is `../completion-audit/package-contracts-132777183073.actual.log`.
The failing command was the redistribution `--check` inside
`scripts/run_curriculum_release_model_conformance.sh`, after compilation and
independent model validation succeeded. The stale staging ledger failed with
`REVIEW_IDENTITY_MISMATCH` and `SOURCE_RELEASE_MODEL_DRIFT`.

## Concrete repair

`pending-ledger-current-binding.candidate.patch` contains exactly three changed
lines in two files: the staging ledger's `contentDigest` and
`sourceReleaseModel.buildInputsSha256`, plus the full-conformance wrapper's
`EXPECTED_CONTENT_DIGEST`. Root applied precisely this candidate; see
`root-application.actual.json`.

- Content digest: `sha256:5db6e33c9118c7382ae439e7713a8ae399a3d5ae6fb3fc8ebe1c125963439049`.
- Build-input digest: `sha256:05a26409151abb27b8ddce94e258312ff60766558752006c2c18fbaf97579e37`.
- Original raw ledger SHA-256: `b24decfe3ecd15024c3e7e31c81bd8749657b321b4b00164d90813d0967f31b5`.
- Candidate raw ledger SHA-256: `cdc9bf84ec9e1236d7931eea54abf67ecaf83143a634f082f6a4348bfbdb98d4`.

`candidate-delta.receipt.json` and its executable assertion script
`compare_ledger_candidate.py` prove that every asset decision, class decision,
summary field and resource-index binding is identical. The unchanged state is
836 pending images, three pending classes, one root-LICENSE-bound automatic
Apache class, zero human approvals, 839 open human-review items, and
`publicationReady: false`. No completed historical review was rebound and no
rights or publication approval was created. Independent content P/D reviews
remain the separate native curriculum-quality obligation.

## Exact local commands and outputs

All commands ran from `/home/enpasos/projects/skillpilot`. The paths below keep
all model/probe output bounded to this directory. `--ledger` is absolute for
generation because the generator's success message uses `relative_to(REPO_ROOT)`.

```bash
python3 -B scripts/compile_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --output tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model

python3 -B scripts/validate_curriculum_release_model.py \
  --profile contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-release-model-v1.profile.json \
  --release-root tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model

python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --check \
  --release-root tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model \
  --ledger tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/original.review.json

python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --generate \
  --release-root tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model \
  --ledger /home/enpasos/projects/skillpilot/tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/candidate.review.json

python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --check \
  --release-root tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model \
  --ledger /home/enpasos/projects/skillpilot/tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/candidate.review.json

python3 -B scripts/generate_curriculum_package_redistribution_review.py \
  --self-test \
  --release-root tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/current-model \
  --ledger /home/enpasos/projects/skillpilot/tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/candidate.review.json

python3 -B scripts/generate_curriculum_source_verification_review.py --check
python3 -B scripts/generate_curriculum_source_verification_review.py --self-test
python3 -B tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/compare_ledger_candidate.py
python3 -B tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/verify_current_input_bytes.py
bash -n tmp/pr157-phase-guard-ci-repair-20261115/package-contract-probe/candidate.run_curriculum_release_model_conformance.sh
```

- Compilation: exit 0; `compile.stdout.json`, empty `compile.stderr.log`.
- Original-ledger reproduction: expected exit 1; `reproduce.check.stderr.log`
  contains the same two CI error codes, with the current `5db6…` content digest
  instead of CI's pre-repair `a0c22…` digest.
- Candidate generation and check: exit 0; `candidate.generate.*` and
  `candidate.check.*` logs.
- Redistribution mutations: exit 0; `candidate.self-test.*` proves 39 fail-closed
  mutations, six rejected native-metadata pairs and 15 invalid import-prompt
  cases, including stale completed-decision rejection.
- Source verification check and mutations: exit 0; `source-verification.*`
  logs. 9,978 source goals, 9,492 carrier-verified, five PDF-projection-verified,
  481 pending; eight ledger mutations, duplicate-key/stale-completed guards,
  six PDF-mode guarantees.
- Candidate equality assertions and shell syntax: exit 0.
- Current raw input byte checks: exit 0; `current-source-pins.receipt.json`
  records 1,025 matching bindings: current canonical Mathematics, semantic-kind
  ledger, 82 assessment sources, 100 publication-evidence input files, 836
  images, profiles, FWU ontology and immutable V9 registry.
- Independent model validator: **exit 0, `passed: true`, 51 adversarial cases**
  (49 base cases and two actual conformance-proof tamper cases). See
  `validate-model.stdout.json`; `validate-model.stderr.log` is empty. Its
  content digest equals the candidate, with 836 binary resources, 1,262 goals
  and 807 `curricularAtomic` goals. The conformance metadata was restored
  exactly to the compiler's original output after the tamper tests.

The independent validator reconstructed the model from the current canonical
source, views, decks and evidence; it compares all expected documents and
build-input hashes and runs the standard adversarial suite. It was invoked
without `--skip-adversarial-self-tests`. Consequently its success plus the raw
input receipt is current-source evidence and avoids a redundant compilation.
This bounded probe is local evidence; it does not establish a successful fresh
PR/main CI run, package publication, deployment or learner-result migration.

## Evidence retention

Keep the compact logs, original/candidate ledgers, two assertion scripts,
candidate patch, receipts, and model metadata. `current-model` is roughly
42 MB of unpacked build output and need not be duplicated in committed evidence.
The retained raw source inputs, V9 proof, published bytes and learner results
were not edited by this probe.

`verification.manifest.json` binds the retained evidence by raw SHA-256 and
byte count, with actual terminal command exit codes. The active repaired files
were checked again after terminal validation and remain byte-identical to the
validated candidate.
