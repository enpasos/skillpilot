# Native national top-level learning-map repair

Recorded on 15 November 2026, 17:27 UTC. This is a reproducible local native-pipeline result, not browser/production acceptance or successful main CI. No learner mastery was read or changed.

The two owner screenshots are reproduced exactly from main `64793bdc2270ce67feced439ae20ef03a59e2abe`, using that revision's native Java merger and frontend projection code. Its 21 canonical catalogs and four selected national views are byte-identical to the PR #157 merge `a44c157b536680985dca30737b560b10c7633a04`. The After run reads the actual activated worktree: Physics has 809 goals and raw SHA-256 `e36f8b00b57094e978ff9defdbd00bfac1e9a03bdb94dd56d404ccf3252ba4e2`.

| Epoch and profile | Physics SekI/SekII goals | Mathematics SekI/SekII goals | Direct backflow pairs Physics/Math | Transitive backflow pairs | External root atoms |
|---|---:|---:|---:|---:|---:|
| Main GK | 199/410 | 334/600 | 37/6 | 496 | 0 |
| Main LK | 199/411 | 334/605 | 37/6 | 496 | 0 |
| Main GK+LK (screenshots) | 204/418 | 334/616 | 35/6 | 512 | 2 |
| After GK | 184/448 | 350/599 | 0/0 | 0 | 0 |
| After LK | 184/449 | 350/604 | 0/0 | 0 | 0 |
| After GK+LK | 184/461 | 350/617 | 0/0 | 0 | 0 |

Both actual subject-filtered After maps have only the two stage-unit root children and no backward summary arrow. Scalar product `2ac2e902-a6ad-53c9-b139-d1c63d823023` and vector product `54541d08-61cc-5a6d-b6d9-d0270a7d1949` remain necessary preparation goals, with actual map paths under Sekundarstufe II. Their prerequisite edges remain present. This stage-level placement does not resolve their finer Q2 timing relative to early Physics applications.

The separately pinned intermediate `working` epoch explains the final increment: Mathematics was already clear; Physics still had two direct backflows from SekI digital-data evaluation `72effc66` to sensor acquisition `691c11d0` and mean/spread `f23fdfa9` in SekII. The six whole-method placements address that complete prerequisite chain. Seven new Physics assessment tasks and the astronomical successor placement are also part of the final After input, so this report does not attribute the complete numerical delta to one isolated edit.

## Measurement and limits

The harness runs the actual `CourseProfileCompositionViewMerger`, `prepareLandscapeEntries`, Composition and Personal Curriculum projections, canonical `requires` closure, learner-tree normalization, native unit preview/projection, subject filters and completion denominators. It uses the shared national Mathematics/Physics Personal Curriculum, then filters the same map by subject. It does not substitute an independently selected single-subject curriculum. Zero mastery is used solely to derive total denominators; no learner-result claim follows.

The measured domain is exactly the national GK, LK and combined GK+LK top-level SekI/SekII map. The report does not accept Land plans, nested year/phase ordering, other subjects, source fidelity, assessment quality, real host rendering or remote CI. Those obligations remain separate. All six main/After rows have zero native diagnostic findings.

- [Comparison](comparison.actual.json): exact direct atomic causes, visible root children, stage denominators and retained vector placements; intermediate results are included separately.
- [Input pins](input-pins.json): every catalog, view, native frontend module and Java merger source; report digests bind the larger local full-goal reports.
- [Reproduction receipt](reproduction.actual.json): actual second execution of the committed harness, both epochs and all three profile variants; exit 0 and unchanged input/code guards.

The large reports, whole-goal dumps and extracted sources stay outside Git. Reproduction regenerates them from pinned Git/worktree bytes rather than copying canonical catalogs into this evidence package.

The subsequent content-release epoch (`1ab73005…` Physics catalog) changes eighteen
assessment release statuses and three strand classifications. A fresh complete
native replay at 17:50 UTC again reproduced all six rows, including every
denominator and vector placement. The [current receipt](current-status-replay.actual.json)
and [current input pins](current-status-input-pins.json) retain that separate epoch;
the initial evidence remains unchanged. This refresh does not assert full Physics
quality acceptance.

## Reproduce

From the repository root, with the repository Java toolchain and installed `app/node_modules`:

```bash
python3 contracts/stage-plan-review-evidence/2026-11-15/top-level-current-view-repair/reproduce.py \
  --output tmp/top-level-map-reproduction
```

For the subsequent task-release epoch use `reproduce-current-status.py` with the
same arguments. It runs the unchanged native harness with the separately retained
current input manifest. The earlier `reproduce.py` intentionally retains its
original epoch and rejects the changed catalog.

The output directory must not already exist. The default validates After against the current worktree and fails on changed inputs or code. Once the implementation is committed, pass `--after-ref <implementation-commit>` to read the same pinned bytes from Git. Main always reads its fixed historical revision and its own native code. Dependency manifests are also checked; use the matching implementation checkout.

The default resolves the Gradle production runtime classpath without compiling the backend or copying static assets. An existing runtime classpath file can instead be passed through `--classpath-file <path>` (colon or newline separated). Only the small actual merger and probe are compiled. Both executions check the complete pinned inputs/code again after running and compare atomic causes, visible arrows, external atoms, vector placement and denominators against the recorded results.
