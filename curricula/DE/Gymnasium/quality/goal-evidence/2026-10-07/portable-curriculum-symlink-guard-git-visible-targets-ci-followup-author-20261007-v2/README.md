# Git-visible destination guard and CI follow-up

Technical author preparation, 7 October 2026. No scientific approval or symlink application. The prior portable repair preparation remains byte exact: all 387 payloads and its final freeze were checked unchanged. Its remaining 352-pointer plan and original 358-pointer evidence are retained there.

## Changes

The generic guard in `scripts/validate_schemas.py` discovers all tracked and nonignored untracked repository paths through Git, then checks curriculum symlinks. Relative resolutions must stay inside the repository and exist. A file destination must itself be committable; a directory must contain a committable file, located through sorted prefix lookup. Absolute, dangling/cyclic, escaping and ignored-only destination links fail without artifact-name exceptions or schema changes. Ordinary ignored scratch dependencies remain excluded, while force-tracked pointers and payloads still count.

An eighth unittest fixture covers locally existing ignored file and directory destinations: both fail, then both pass after the real file payload becomes tracked. The seven existing tests still pass, including actual checkout relocation and ignored scratch pointers.

One new step in the existing Curriculum CI runs `python -B scripts/test_validate_schemas_symlinks.py -v` from repository root immediately before Validate Schemas, after Python dependency installation. No other workflow behavior changed.

## Verification

Eight tests completed with exit 0; `git diff --check` completed with exit 0. The current generic scan finds only the remaining absolute pointer failures, with zero ignored-only target, dangling/cyclic or escaping failures. Existing relative pointers and all proposed repair destinations have Git-visible payloads. Full schema-validator success follows Root application of the separately frozen pointer plan. Source snapshots and terminal results are frozen here; historical review/scientific payloads and the first dossier were not changed.
