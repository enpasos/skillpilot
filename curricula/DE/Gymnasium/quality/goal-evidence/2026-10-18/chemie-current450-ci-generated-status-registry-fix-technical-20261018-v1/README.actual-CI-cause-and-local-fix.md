# Docs CI: refresh the generated status registry

The GitHub **Documentation Checks** job for commit `06a03ecbc193550b73d7d7b3af53a5a7e61b17fb` failed in **Check Generated Status Registry**:

> docs/qa-ci/status/README.md is stale.

The actual job log records that message at line 777, then exit 1 at line 778. [Original failed job](https://github.com/enpasos/skillpilot/actions/runs/39124585177/job/117666923957). The complete retrieved job log and metadata remain under `tmp/chemie450-ci-docs-failure.job117666923957.*` as local diagnostic files. The portable receipt here preserves the exact error excerpt, job/head identity and their hashes; those ignored local files are not required Git evidence.

## Bounded fix

Root explicitly authorized the original generator after reviewing the exact render diff. Its unchanged rendering functions were first called in memory without invoking the writer. The candidate differed in **one table line**: the active Chemistry memory-report link changed from historical `M402.actual.md` to the already configured `M450.current-normal.report.md`. No report decisions or quality rules changed.

The original `npm --prefix app run docs:generated-status-registry` then ran once. Its sole normal output, `docs/qa-ci/status/README.md`, equals the preview bytes exactly. The source generator, source registry, workflow and all other tracked normal files remain unchanged. The exact small patch and before/after raw hashes are included.

## Actual local gates

| Original command | Result |
| --- | --- |
| `npm --prefix app run docs:generated-status-registry` | PASS; one generated normal file |
| `npm --prefix app run check:generated-status-registry` | PASS; README current |
| `npm --prefix app run check:docs-links` | PASS; 361 files |
| `npm --prefix app run check:docs-indexes` | PASS; 8 indexes |
| `git diff --check` | PASS |

Terminal receipts and unedited stdout/stderr are present. This is local evidence for the concrete CI cause and fix. It does not claim a new GitHub CI result, commit, push, release, full build, M7 or human approval.

Technical scripts/evidence: Apache-2.0. Existing curriculum and historical review authority are unchanged.
