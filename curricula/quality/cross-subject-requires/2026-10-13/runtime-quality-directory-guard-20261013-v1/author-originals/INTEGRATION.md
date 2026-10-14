The candidate changes only `LandscapeService.java` and `CurriculumDirectoryScanTest.java`. A root-relative directory component exactly named `quality` is excluded from discovery, file admission and reload timestamps. The configured root itself may be named `quality`; `quality-neighbor`, `Quality` and `quality.json` remain accepted. Existing `input`/`archive`, filename extension, sorted duplicate selection, file symlinks, mapping, registry, learner/mastery and package behavior are preserved.

Full candidate files are under `candidate/backend/`; original files and all prerequisite hashes are retained in `original/`, `original-inputs.sha256.json` and `isolated-source-baseline.sha256.json`. `quality-directory-guard.patch` is the exact two-file integration patch.

Actual isolated candidate execution passed eight tests: four `CurriculumDirectoryScanTest` and four `PrunedFileTreeTest`. The unchanged production code compiled against the identical new scan test class failed three of four tests. The original-code negative control is intentional regression evidence, not a candidate failure. Logs and actual JUnit XML are preserved under this directory. All compilation/class output and project caches are local to this directory; active backend resources and publication generation were disabled for the focused fixtures.

Wait until Root CI session 20862 has completed and the separately assigned independent review has checked this exact candidate. Then verify the active baseline still matches and apply from the repository root:

```bash
python3 tmp/cross-subject-requires/runtime-quality-directory-guard-20261013/verify-isolation.py
git apply --check tmp/cross-subject-requires/runtime-quality-directory-guard-20261013/quality-directory-guard.patch
git apply tmp/cross-subject-requires/runtime-quality-directory-guard-20261013/quality-directory-guard.patch
```

If a protected input changed, stop and prepare an additive candidate against that actual new baseline; preserve this candidate and its receipts. After integration, run the same two focused classes with the normal pinned CI environment, then Root's required broader CI. `verify-isolation.py` intentionally verifies the pre-integration original hashes, so its active-source check is not expected to pass after applying the patch.

To reproduce only the isolated evidence without applying anything:

```bash
bash tmp/cross-subject-requires/runtime-quality-directory-guard-20261013/run-isolated-tests.sh candidate
bash tmp/cross-subject-requires/runtime-quality-directory-guard-20261013/run-isolated-tests.sh original-control
```

The second command intentionally exits 1 because the unfixed code fails the regression checks. Existing exact test logs/outputs are hash-bound in the author manifest; use a fresh additive directory for a new sealed execution receipt. The author preparation script also uses exclusive creation and must not overwrite the sealed input capture.

No source activation, deployment, publishing, UUID change, owner selection, FOS identity resolution, source union, mastery operation, frontend/provider contract change or asset edit is included. Explicit archival/source registries retain their existing behavior; this small guard concerns ordinary filesystem discovery and reload scanning. Independent code review and integration remain pending.
