## Requires Relation Checks {#sec:qal-relation-checks}

This chapter serves as a stable compatibility entry point for references to structural relation checks.

The maintained normative rule catalog lives in [Graph Validation Rules (`GVR`/`APV`/`CPV`)](repo:docs/qa-ci/graph-validation-rules.md) in Volume IV of the Quality Handbook, which is the single source of truth for:

- all implemented validator rules (`GVR-*`, `APV-*`, `CPV-*`),
- unconditional error enforcement (`npm run validate:graph`),
- the complete-catalog atomic-normal-form and transitive-minimality gate (`npm run check:transitive-minimality`, all 21 canonical roots).

There is no environment-controlled warning mode. Retired codes `GVR-004`, `GVR-005`, `GVR-006`, and `GVR-013` remain reserved for historical evidence.

The direct `npm run check:curriculum-maturity-floors` gate additionally checks pinned subject and scope obligations against the Git base selected by `--base-ref`; the PR uses its base SHA, a push uses its preceding SHA, and local runs use `origin/main`. Both direct gates run in the complete `graph-validation` job and the local curriculum suite.

For manual didactic inspection of prerequisite step sizes and inherited edges, see the Requires Review Process in @ref{sec:qal-requires-review}.
