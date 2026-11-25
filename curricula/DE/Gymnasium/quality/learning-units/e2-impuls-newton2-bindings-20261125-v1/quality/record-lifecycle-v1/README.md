# H record lifecycle and binding inventory

`record-lifecycle.actual.json` classifies every H-owned file and every H JSON/JSONL record as **current** or **earlier state**, with exact raw bytes, a concrete preservation commit/step and a successor. Earlier records whose names contain “current” or “final” receive an explicit historical replacement label. This is a classification successor; sealed records, votes and inputs remain unchanged.

The domain is the union of non-merge first-parent H changes after catalog draft `84b220d0e5`. Files introduced only by merged main are excluded. Files touched by both H and main remain whole-file pins; that does not attribute upstream code to H. The finite nine dossier files are a bootstrap anchored by the final Git commit, so no checksum cycle or broad directory exclusion is needed.

The compact JSONL column schemas and record-index mapping are declared in the `compactTableSchema` key in `record-lifecycle.actual.json`; every record path remains explicit in its records table.

`raw-bindings.actual.jsonl` contains true `path` plus `sha256`/`digest` bindings and explicitly typed native filename-key operational manifests. `binding-origins.actual.json` distinguishes current raw bytes, exact historic Git blobs, exact recovered bytes, deliberately external operational packets and native parsed-value digests. Recovery proves bytes; it does not invent an original workspace location. `value-digest-contracts.actual.jsonl` classifies every standalone 64-hex field without guessing that a semantic fingerprint is a file. Current semantic freshness continues to depend on the unmodified native D/P/A/M/V gates. The native value helper recomputes all 15 book-model value bindings (eight distinct parsed values), 130 embedded profile-body fingerprints and three sealed model validations.

The supplementary audits disclose 15 retained pre-H card records with status `remove` whose original card bodies were not recovered, plus two ancient full-catalog hashes without full snapshots. Exact pre-H rows and goal-level precedent witnesses remain; none grants current admission.

Four original working-state hashes have no recovered bytes: three entries in initial `views/checks.actual.json` (superseded by `checks-v2`), and one working test source in `checks/count-repairs.actual.json` at 2026-11-25T14:40:25Z. They are explicitly **earlier state / historical unavailable**. This dossier does not claim their raw hashes were reproduced, and they never grant current approval. Current successors have their own checks.

The literal a492 comparison reproduces 1,463 matches, 97 mismatches and 77 missing files after including 13 real external diagnostic bindings. The exact Git added/modified JSON domain contains 652 valid JSON files; the supplied claim said 651 and did not provide its selection. This one-record discrepancy is disclosed. The literal comparator treats native parsed-value digests as raw hashes; the native inventory verifies their real serialization separately.

Run the portable audit with the preserved external roots:

```sh
python3 <this-directory>/verify_lifecycle.py --repo <checkout> --anchor <final-commit> \
  --external-root qualityScratch=<quality-scratch> \
  --external-root viewsScratch=<views-scratch> \
  --external-root assessmentScratch=<assessment-scratch> \
  --external-root memoryRecovery=<memory-recovery> \
  --external-root rootScratch=<root-scratch> \
  --external-root providerSessions=<provider-session-archive> \
  --external-root mainHandover=<main-handover> \
  --external-root temporaryRoot=<temporary-root> --legacy-a492 --native
```

Provider-session logical paths use `@providerSessions/…`; the resolver reads the exact bytes below the supplied `providerSessions` root. No account-specific home path is stored. Only roots actually used by the origin index are required. A missing external root/file, a changed raw binding, an unclassified H record/digest, or a falsely-current historical binding fails. Four specifically listed unavailable historical rows remain disclosed; no other missing raw origin is accepted. `--native` imports the repository value/profile/model functions and runs the ordinary integrated strict report with its unchanged configuration. Exact six-render/three-campaign recovery stays under `quality/reproduce-review-artifacts-v2.mts`; native current seed/release checks stay under `inventory/k1-v4-seed-successor-v1/`.

The lifecycle chains distinguish initial six-goal scientific reviews, corrected-four reviews, the clarification of 839, four arrow-image successors and the IMP-only mass-example context successor. Rejected K1 V1–3 and K2 V1–2 remain rejected history. Accepted scored bodies are linked through form metadata and strand metadata to the current V5 context with nine offers. The old E2 eight-row fixture and every predecessor stay sealed; the two BW rows remain the BW layer and the four HH/TH rows are additive. No learner results, human approval or new scientific votes are created by this inventory.
