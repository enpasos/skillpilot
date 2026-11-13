## Continuous Integration (CI) {#sec:qal-ci-overview}

This chapter documents the two-tier CI workflow in `.github/workflows/ci.yml`, the optional package and ontology workflow in `.github/workflows/owl-ci.yml`, and the local `./run_ci.sh` suite.

### Triggers and Two-Tier Execution {#sec:qal-ci-tiers}

The `.github/workflows/ci.yml` workflow runs on:

- pushes to `main`,
- pull requests targeting `main` (when opened, updated, reopened, or marked ready for review),
- manual dispatch (`workflow_dispatch`).

Documentation-only and temporary changes (`README.md`, `AGENTS.md`, `docs/**`, `sandbox/**`, `tmp/**`) do not trigger `ci.yml`; documentation is gated by its dedicated `.github/workflows/docs_checks.yml` workflow.

Execution is organized into two tiers whose invariants are enforced by `scripts/ci_tiers.test.mjs` inside `quick-checks`:

- **Quick tier:** Runs on every trigger, including draft pull requests. Its jobs depend on no upstream job and therefore report early feedback first.
- **Complete check:** Runs in parallel across all full verification jobs on pushes to `main`, manual starts, and non-draft pull requests.

Binding tier rules:

- The complete check contains every required gate on its own; the quick tier only repeats fast checks early and never substitutes for a full check.
- A draft pull request runs only the quick tier (complete-check jobs appear as `skipped`). Marking the PR ready for review starts the complete check for that head; because GitHub never merges drafts, every mergeable PR carries a complete check for its current head.
- Neither tier selects or skips individual jobs by changed file paths.
- Any job split off from a parent job preserves that parent's runner image, toolchain, and restored goal-book artifact.

### Quick-Tier and Complete-Check Jobs {#sec:qal-ci-jobs}

:::table{cols="4.6cm,X"}
| Quick-tier job | Verified scope |
| --- | --- |
| `action-regression-ci` | Spring-hosted Custom GPT Action regression client and deployment entrypoint guards |
| `openai-mcp-app-ci` | OpenAI MCP App contracts, plugin release, and submission checks |
| `claude-connector-v1-ci` | Claude MCP Apps, plugin package, and direct-install publication |
| `openai-v1-public-edge-ci` | OpenAI V1 public edge and mTLS verification scripts |
| `quick-checks` | CI structure tests plus early runs of ESLint, TypeScript type-checking, `validate:graph`, and `validate_schemas.py` |
| `backend-quick-checks` | CI runner tests and compilation of backend main and test sources (without running backend tests) |
:::

In the complete check, `goal-book-publication` builds and verifies all registered learning-goal books once; every downstream job marked `yes` restores that artifact from the same run:

:::table{cols="4.6cm,1.6cm,X",longtable=true}
| Complete-check job | Goal books | Verified scope |
| --- | --- | --- |
| `goal-book-publication` | – | Build and verification of all registered learning-goal book publications |
| `frontend-ci` | yes | Fixture-based application logic, package/runtime adapters, learner-goal selection, GPT instruction limits, deterministic ZIP primitive, ESLint, `npm run build:application` (application-only against committed assets, unlike integrated `npm run build`), and built-app checks |
| `goal-book-contracts` | yes | `test:goal-book-pipeline` |
| `graph-validation` | yes | Skill graph, view, source, review, and status gates |
| `curriculum-assessment-proofs` | yes | Transitive-minimality proofs plus assessment, exam, and route tests |
| `curriculum-integrated-build` | yes | Runtime assets, visualization checks, integrated application build, and package-only frontend |
| `curriculum-package-contracts` | yes | Package contracts and self-tests, schemas, goal IDs, archive, and legacy-reference validators |
| `backend-ci` | yes | Every backend test class across three disjoint parallel test JVMs (`scripts/run_backend_ci.py`; previously failed tests retry first); plain `./gradlew check` runs the same suite serially |
:::

### Curriculum, View, and Archive Boundaries and Optional Package CI {#sec:qal-ci-scopes}

Together, the four curriculum jobs validate code, contracts, models, reviews, schemas, and committed status files, without materializing a real 1.7-GB curriculum ZIP in per-commit CI:

- **Graph and projection rules:** `validate:graph` enforces all active `GVR-*` rules as errors, with no environment-controlled warning mode. Retired `GVR-004`, `GVR-005`, `GVR-006`, and `GVR-013` remain reserved. `check:transitive-minimality` directly checks all 21 canonical catalog roots for G17; `check:curriculum-maturity-floors` directly checks pinned curriculum/scope obligations against `--base-ref` (PR base SHA, push-before SHA, or local `origin/main`). Both gates run in `graph-validation` and the local curriculum suite. In CI, `validate:view-filters` covers the 21 canonical DE Gymnasium landscapes (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Italienisch`, `Russisch`, `Polnisch`, `Tschechisch`, `Wirtschaft`, `Overview`; locally widenable via `APPLICABILITY_VALIDATION_SCOPE=all`). Reviewed residual `APV-201` warnings are tracked in `docs/qa-ci/applicability-accepted-warnings.json`; `APV-202` is diagnostic only.
- **Duration, source, documentation, and memory-card gates:** CI enforces the Hessen Mathematics Sek I G8/G9 duration projection (`check:he-math-duration-projection`), visible source coverage for Mathematics and Physics (`quality:source-coverage-audit:check`), explicit learner-facing composition views (`validate:composition-views`), generated-doc notices, status registries, links, and indexes (`check:generated-doc-notices`, `check:generated-status-registry`, `check:docs-links`, `check:docs-indexes`), and all configured memory-card ledgers (`quality:memory-card-review:check:all`, where missing `CQR-302` configuration blocks `M6` rather than core `M5`).
- **Archive and legacy-reference fences:** Validators enforce the Hessen upper-secondary retained-asset boundary under `curricula/DE/Gymnasium/input/HE/abi` (`curricula/DE/Gymnasium/input/HE/retained-asset-registry.json` and `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`), the lower-secondary boundary under `curricula/DE/Gymnasium/input/HE/lower-secondary` (`curricula/DE/Gymnasium/provenance/hessen-lower-secondary-retirement-registry.json`), and the Hessen 2026 chemistry Abitur pipeline artifacts (`slot_matrix.json`, `coverage_requirements.json`, `task_bank.json`).
- **Optional package and FWU-OWL CI (`.github/workflows/owl-ci.yml`):** Runs weekly or manually on fresh runners covering the real 1.7-GB standalone JSON package and hermetic consumer, all subject-export ZIPs, and the Core-first FWU-OWL/roundtrip lane. Production runtime consumes only JSON packages and requires no OWL; the required JSON release-model gate verifies only the pinned FWU Core commit and file hash recorded as provenance without creating RDF or invoking ROBOT/HermiT. Real 2.36-GB FWU-OWL wrappers remain explicit release operations.

### Ubuntu Package Sources and Failover {#sec:qal-ci-ubuntu-apt}

Every job that installs OS packages first runs `.github/actions/ubuntu-apt`, keeping APT strictly on Ubuntu sources while excluding the runner image's Chrome and Microsoft repositories:

- **Mirror-list failover:** Each Ubuntu stanza reads `/etc/apt/skillpilot-ubuntu-mirrors/` (`archive.txt` prefers `https://archive.ubuntu.com/ubuntu/` and `security.txt` prefers `https://security.ubuntu.com/ubuntu/`, with the runner image's Azure mirror `http://azure.archive.ubuntu.com/ubuntu/` second in both). APT's mirror transport shifts any file that fails or stalls beyond 30 s to the alternate source, with same-source retries disabled (`Acquire::Retries "0"`).
- **Pre-update `InRelease` probe & signature pinning:** Before every `apt-get update` (including Playwright's nested call), `/usr/local/sbin/skillpilot-order-ubuntu-mirrors` probes each source's `InRelease` (at most 20 s), assigns priority `1` to the first answering source, and logs `SkillPilot Ubuntu mirror order: …`. Suites, components, and `Signed-By` remain unchanged so every mirror is verified against the Ubuntu archive keyring and signed index hashes; [ci_ubuntu_apt.test.mjs](repo:scripts/ci_ubuntu_apt.test.mjs) pins this policy offline against a signed local fixture repository.

### Running CI Locally and Status Snapshots {#sec:qal-ci-local}

From the repository root, `./run_ci.sh` dispatches the local verification suites (unknown or multiple suite arguments exit with code `2`):

```bash
./run_ci.sh
./run_ci.sh all
./run_ci.sh application
./run_ci.sh curriculum
./run_ci.sh package
./run_ci.sh owl
./run_ci.sh full
```

- `application`: Custom GPT Action regression, fixture-based frontend logic, GPT instruction limits, lint, `build:application`, and isolated Gradle backend checks.
- `curriculum`: Graph/data/review/asset gates, schemas, and deterministic JSON release-model conformance (without materializing the real 1.7-GB ZIP).
- `package`: Optional real standalone JSON ZIP, independent package validation, secure provisioning/activation, Readiness evaluation, and hash-bound hermetic consumer.
- `owl`: Optional FWU-OWL builder/contracts, reverse-compiler tests, semantic MEM/FWU roundtrip, and OWL 2 DL/HermiT validation.
- `all` (default with no argument): Every required application and curriculum check once (always finish cross-cutting runtime changes with `./run_ci.sh` or `./run_ci.sh all`).
- `full`: `all` plus the optional `package` and `owl` lanes.

Optional local status and MEM snapshots:

```bash
cd app
npm run quality:curriculum-status
npm run quality:mem-sparql-consistency
```

The first command updates [curriculum-quality-status.json](repo:docs/qa-ci/status/curriculum-quality-status.json) and `.md` for `/quality-dashboard`; the second writes the non-blocking MEM/FWU audit and review-queue artifacts under `docs/qa-ci/status/` (see @ref{sec:qal-mem-sparql-runbook}).
