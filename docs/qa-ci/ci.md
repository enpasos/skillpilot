# Continuous Integration (CI)

This document describes the CI workflow defined in `.github/workflows/ci.yml`.

## Triggers

The workflow runs on:

- push to `main`
- pull requests targeting `main`, when they are opened, updated, reopened or marked ready for review
- manual start (`workflow_dispatch`)

The workflow ignores documentation-only and temporary changes (`README.md`, `AGENTS.md`, `docs/**`, `sandbox/**`, `tmp/**`).

## Tiers

The workflow has two tiers.

- **Quick tier**: runs on every trigger, including draft pull requests. Its jobs wait for no other job, so they report first.
- **Complete check**: runs on pushes to `main`, on manual starts and on pull requests that are not drafts. It consists of all other jobs; they run in parallel.

Rules:

- The complete check contains every check on its own. The quick tier only repeats cheap checks early and never replaces one.
- A draft pull request receives the quick tier only. Marking it ready for review starts the complete check for that head. GitHub does not merge drafts, so a mergeable pull request always carries a complete check of its current head.
- Neither tier selects jobs by changed paths.
- A job that was split off another job keeps that job's runner image, tools and restored goal-book artifact.

`scripts/ci_tiers.test.mjs` enforces these rules and runs in `quick-checks`.

## Jobs

### Quick tier

| Job | Content |
|---|---|
| `action-regression-ci` | Custom GPT Action regression control client and deployment entrypoint guards |
| `openai-mcp-app-ci` | OpenAI MCP App contracts, plugin release and submission checks |
| `claude-connector-v1-ci` | Claude MCP Apps, plugin package and direct-install publication |
| `openai-v1-public-edge-ci` | OpenAI V1 public edge and mTLS verifier scripts |
| `quick-checks` | CI structure tests, then early repeats of ESLint, the TypeScript type-check, `validate:graph` and `validate_schemas.py` |
| `backend-quick-checks` | CI runner tests and a compile of the backend main and test sources; no backend test runs here |

### Complete check

`goal-book-publication` builds and verifies the learning-goal books once. Every job marked "yes" below waits for it and restores its artifact of the same run.

| Job | Waits for goal books | Content |
|---|---|---|
| `goal-book-publication` | – | build and verification of all registered goal-book publications |
| `frontend-ci` | yes | application logic, lint, application build and checks on the built application |
| `goal-book-contracts` | yes | `test:goal-book-pipeline` |
| `graph-validation` | yes | graph, view, source, review and status gates |
| `curriculum-assessment-proofs` | yes | transitive-minimality tests and assessment, exam and route tests |
| `curriculum-integrated-build` | yes | runtime assets, visualization checks, integrated application build and package-only frontend |
| `curriculum-package-contracts` | yes | package contracts and self-tests, schemas, goal IDs, archive and legacy-reference validators |
| `backend-ci` | yes | every backend test class except the prerequisite-reduction proofs, in three parallel test JVMs |
| `backend-reduction-proofs` | no | the prerequisite-reduction proofs, as two parallel partitions |

The three backend partitions are defined in `scripts/run_backend_ci.py`. Each partition excludes exactly what another one includes, so together they run every backend test once. `./gradlew check` without options still runs the complete suite serially.

### `action-regression-ci`

Purpose: validate the Spring-hosted Custom GPT Action regression control client.

### `frontend-ci` — application logic

Purpose: validate fixture-based frontend application behavior, source quality, and buildability (`app/`) without regenerating curriculum assets.

This includes the package/runtime adapters, learner-goal selection, GPT instruction limits, the deterministic ZIP primitive, ESLint, and `npm run build:application`.

`build:application` deliberately compiles and builds only the application against the committed runtime assets. The normal production command `npm run build` remains integrated and first prepares curriculum runtime assets.

### `graph-validation` and the three curriculum jobs split off it

Purpose: validate skill graph/data integrity, generated artifacts, package contracts and self-tests, schemas, and deterministic release-model conformance.

Together the four jobs contain the graph, view, placement, source, review, asset, schema, archive, and legacy-reference gates. They build the package-only frontend and exercise the package builder, validator, provisioner, Readiness evaluator, and consumer through bounded self-tests, but they do not materialize or consume a real curriculum ZIP. Those production-boundary checks belong exclusively to the optional Package CI.

The complete check always runs the application, curriculum and backend jobs together. The split into jobs is for ownership, diagnosis, parallel execution and faster local iteration; it is not a path-based permission to skip a suite.

The local and hosted curriculum paths intentionally run the same scope/readiness and goal-source-rationale gates, so a local curriculum result cannot diverge merely because the two checklists differ.

### Optional package, subject-export, and FWU-OWL workflow

`.github/workflows/owl-ci.yml` is the single optional Package CI. It runs weekly and can be started manually; it is not run for every push or pull request. Separate fresh runners cover the real 1.7-GB standalone JSON package and hermetic consumer, all real subject-export packages, and the Core-first FWU-OWL/roundtrip lane. Ordinary per-commit CI materializes no real curriculum package for any subject; it validates code, contracts, models, reviews, schemas, and committed status instead. SkillPilot's production runtime consumes the JSON curriculum package and does not require OWL.

The real 2.36-GB FWU-OWL release-conformance wrappers remain explicit release operations rather than ordinary CI. The optional workflow syntax-checks them but uses bounded contract tests and the focused roundtrip lane.

The required JSON release-model gate still verifies the exact FWU Core commit and file hash recorded as provenance in its build profile. That small checkout/trust check is not an OWL test: it creates no RDF, runs neither ROBOT nor HermiT, and performs no ontology validation or roundtrip.

The graph rule catalog is documented in:

- `docs/qa-ci/graph-validation-rules.md`
- `docs/qa-ci/curriculum-quality-dashboard.md` for the generated Workbench quality-status view
- `docs/qa-ci/curriculum-quality-maturity-and-routes.md` for detailed `M0`-`M4`, QA-scope, route, and `CQR-*` semantics

`validate:graph` supports two enforcement profiles:

- default: `GVR-*` rules are strict (failing)
- legacy-warn mode: `VALIDATE_GRAPH_STRICT_RULES=0 npm run validate:graph`

Current scope note:

- the curriculum jobs validate the full authored landscapes as committed
- they additionally validate projected filtered learner graphs via `validate:view-filters`
- they additionally enforce the Hessen Mathematik Sek-I G8/G9 duration projection via `check:he-math-duration-projection`; the check fails if G8/G9 evidence is missing, no G8/G9 differences are detected, or any canonical-duration-grade evidence link is not represented by authored year structure or duration-specific `goalPlacements`
- they additionally enforce visible curriculum source coverage for the canonical Mathematik/Physik projections via `quality:source-coverage-audit:check`; global missing source-backed goals may remain as non-visible rollout backlog, but visible atomic goals must have direct source/mapping evidence or explicitly accepted surrogate evidence
- they additionally check registered generated Markdown status artifacts for the standard "do not edit manually" notice via `check:generated-doc-notices`
- they additionally check that the generated QA status artifact registry is in sync with `app/scripts/generatedMarkdownNoticeRegistry.ts` via `check:generated-status-registry`
- they additionally check local Markdown links under `docs/` via `check:docs-links`
- they additionally check coverage for the main documentation indexes via `check:docs-indexes`
- they additionally validate explicit learner-facing composition-view files via `validate:composition-views`
- they additionally enforce all configured memory-card review ledgers via `quality:memory-card-review:check:all`; in the dashboard, missing `CQR-302` review configuration blocks `M6`, while `M5` remains the core curriculum QA level
- they additionally enforce the Hessen Oberstufe retained-asset boundary: under `curricula/DE/Gymnasium/input/HE/abi`, legacy `Gymnasiale_Oberstufe` path strings may only remain inside allowlisted raw archival provenance files from `curricula/DE/Gymnasium/input/HE/retained-asset-registry.json`
- they also enforce the Hessen Oberstufe repo-handoff boundary: the retired legacy tree must stay absent from the active repo, and active tooling/runtime/test surfaces may mention it only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-upper-secondary-retirement-registry.json`
- they validate the Hessen 2026 chemistry exam pipeline artifacts (`slot_matrix.json`, `coverage_requirements.json`, `task_bank.json`, and source-landscape release anchors)
- they now also enforce the Hessen Sek-I retained-asset boundary: under `curricula/DE/Gymnasium/input/HE/lower-secondary`, legacy `Gymnasium_9_Mittelstufe` path strings are forbidden in retained operational archive content
- they also enforce the Hessen Sek-I repo-handoff boundary: active tooling/runtime/test surfaces may mention the lower-secondary legacy tree only from the explicit allowlist in `curricula/DE/Gymnasium/provenance/hessen-lower-secondary-retirement-registry.json`
- the current CI scope for `validate:view-filters` is the reviewed canonical DE Gymnasium set (`Mathematik`, `Physik`, `Chemie`, `Biologie`, `Informatik`, `Deutsch`, `Englisch`, `Französisch`, `Griechisch`, `Chinesisch`, `Geschichte`, `Politik und Wirtschaft`, `Musik`, `Latein`, `Spanisch`, `Wirtschaft`, `Overview`)
- the validator can be widened locally via `APPLICABILITY_VALIDATION_SCOPE=all npm run validate:view-filters`, but CI does not enforce that broader scope yet
- reviewed residual `APV-201` warning cases are tracked in `docs/qa-ci/applicability-accepted-warnings.json` and are reported as accepted warnings, not active warnings; `APV-202` is reported as a diagnostic finding, not as warning debt

Optional local status snapshot:

```bash
cd app
npm run quality:curriculum-status
```

This writes `docs/qa-ci/status/curriculum-quality-status.json` and `.md`, which are read by the local Workbench route `/quality-dashboard`.

Optional MEM/FWU endpoint review snapshot:

```bash
cd app
npm run quality:mem-sparql-consistency
```

This writes the MEM audit and review-queue artifacts under `docs/qa-ci/status/`. It is not part of the blocking CI workflow because the MEM endpoint is external and currently exposes concrete curriculum data only for some configured jurisdictions. See `docs/qa-ci/mem-sparql-consistency-runbook.md` for the operational workflow.

### `backend-ci` and `backend-reduction-proofs` — application logic

Purpose: validate backend (`backend/`) via Gradle checks.

`scripts/run_backend_ci.py` first retries the tests that failed in the previous run of the same partition and then runs every test of that partition:

1. `backend-ci`: `./gradlew check` without the prerequisite-reduction proof class, with three parallel test JVMs
2. `backend-reduction-proofs`: the proof class without its Physics method, and the Physics method on its own

## Ubuntu package sources and failover

Every job that installs OS packages first runs `.github/actions/ubuntu-apt`. It keeps APT on Ubuntu sources only: the runner's Chrome and Microsoft repositories are excluded.

Each Ubuntu stanza reads a mirror list in `/etc/apt/skillpilot-ubuntu-mirrors/`. `archive.txt` prefers `https://archive.ubuntu.com/ubuntu/` and `security.txt` prefers `https://security.ubuntu.com/ubuntu/`; the runner image's Azure mirror (`http://azure.archive.ubuntu.com/ubuntu/`) is second in both. APT's mirror transport moves every file that fails, or does not connect or send data within 30 s, to the other source. Same-source retries are off (`Acquire::Retries "0"`): they would multiply the wait for a stalled source, and APT 2.8 can hang when they meet mirror redirects.

Before every `apt-get update`, including Playwright's nested call, the hook `/usr/local/sbin/skillpilot-order-ubuntu-mirrors` probes each source's `InRelease` (at most 20 s) and gives priority 1 to the first source in list order that answers. It logs `SkillPilot Ubuntu mirror order: …`. Without the probe, a source that accepts connections and then stalls would cost the timeout for every file.

Suites, components and `Signed-By` are unchanged, so every mirror is verified against the Ubuntu archive keyring and the signed index hashes. When every source fails, `apt-get update` only warns and the following `apt-get install` fails the step.

`scripts/ci_ubuntu_apt.test.mjs` pins this policy and proves the failover offline against a signed local fixture repository.

## Status checks

All jobs of the tiers that apply to a run must pass for a successful workflow run. On a draft pull request the jobs of the complete check are shown as skipped.

## Run CI locally

From repository root:

```bash
./run_ci.sh
./run_ci.sh all
./run_ci.sh application
./run_ci.sh curriculum
./run_ci.sh package
./run_ci.sh owl
./run_ci.sh full
```

With no argument, `all` remains the default required repository gate. The modes are:

- `application`: Custom GPT Action regression, fixture-based frontend application logic, GPT instruction limits, lint, application-only build, and isolated Gradle backend checks.
- `curriculum`: graph/data/review/asset gates, schemas, and deterministic JSON release-model conformance; it does not materialize the real 1.7-GB ZIP.
- `package`: optional real standalone JSON ZIP, independent package validation, secure provisioning/activation, Readiness evaluation, and the hash-bound hermetic package consumer.
- `owl`: optional FWU-OWL builder/contracts, reverse-compiler tests, semantic MEM/FWU roundtrip, and OWL 2 DL/HermiT validation.
- `all`: every required application and curriculum check exactly once, sharing dependency and tool setup where possible; package materialization and OWL are intentionally excluded.
- `full`: `all` plus the optional real package and OWL checks.

Unknown or multiple suite arguments fail with exit code 2. Do not infer the required suite from changed paths: cross-cutting runtime changes must still finish with `./run_ci.sh` or `./run_ci.sh all`. Use `package` for package/provisioning/consumer changes and `owl` for ontology or roundtrip changes; `full` runs both optional lanes.

The real package, reproducible subject exports, and OWL/roundtrip checks share the optional scheduled/manual GitHub workflow. Bounded builder, validator, provisioner, Readiness, consumer, and generated-status checks remain required per commit, while multi-gigabyte production-boundary exercises are kept out of ordinary commit CI.
