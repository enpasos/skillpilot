# Independent completion audit and bounded route fixture repair

Observed on 15 November 2026, 11:43 CET (UTC+01:00). This directory records local checks and remote CI observations. It does not claim successful PR CI, a merge, successful main CI, host acceptance or observed learner effectiveness.

## Exactly two active fixture values changed

`app/scripts/testSemanticRouteInventory.ts` changes only the diagnostic total from 8 to 7 and the pending Physics Sek-I finding count from 5 to 4. All four required-scope pass assertions, the two pending scopes, the six unavailable scopes, four ledger bindings, three Physics selector bindings and Physics Sek-II alignment debt (43 additional goals / 42 findings) remain enforced. No production policy, gate, semantic assertion or curriculum source was edited by this audit.

The native current semantic-route audit reports four passing required scopes, pending Physics Sek-I with four findings and pending Chemistry Sek-II with three findings. It continues to expose both pending scopes. The exact source of the count reduction is the removed finding on terminal assessment `1abfd5ef-1f42-5b71-8c9a-80c0a6b0322e`. In the baseline Physics source and views, its prerequisite route contains no selected ordinary Sek-I goal. In the current reviewed Physics source and views, the route includes the selected ordinary goal `7badac4d-2874-5b3a-87e8-bf8f4440b2a6` (Leiter, Nichtleiter und Halbleiter). The assessment itself continues to require and cover `df010b2b-b182-5f7e-bbe4-49b72e48c27a`. This records an actual change in the route, not promotion of the pending Physics scope.

`physics-route-baseline-diagnostic.actual.log` and `physics-route-current-diagnostic.actual.log` reproduce that bounded graph comparison with native profile and route functions. These diagnostic computations do not themselves validate all historical cross-subject review bindings. Two earlier exploratory fixture attempts failed strictly on a nonregular catalog entry and missing historical Math review context; they did not modify active inputs or weaken validation. The acceptance evidence for the active current model is the complete normal test command below and `semantic-route-current.actual.json`.

## Actual normal regression result

From `app/`:

```sh
SEMANTIC_ROUTE_POLICY_BASE=a7c7e9ceb26f06194e25f29e32941d4e4cb17c32 npm run test:hard-learning-routes
```

Exit 0: 25 tests passed, zero failures, zero skipped, 57,911.890343 ms. Original output: `hard-learning-routes-current2R.actual.log`; exit code: `hard-learning-routes-current2R.exit-code`; exact two-value diff: `testSemanticRouteInventory.measured-snapshot.patch`; receipt and hashes: `exact-two-value-route-fixture-repair.actual.json`. No runtime-asset or application-build writer was started.

The missing isolated `origin/main` failures in CI were cascading after the invalid J5→J6 control assertion aborted before the temporary ref was restored. All CLI contract subtests now pass with the actual two-prerequisite-boundary repair; no CLI test code change was needed.

## Bounded backend-fixture implication

`compare_recorded_seed_closures.py` reads all 21 current canonical catalogs and the 128 seed sets previously recorded by the native integration tests. Against head `161acc0d483780c6bece1be316b51fd0054c2e2f`, it finds zero changed unpruned canonical prerequisite closures for those seed sets. Its JSON result binds every current canonical input, the exact original seed dataset and the baseline Math bytes. It is graph evidence, not a new native backend run. Root's separate duration-view comparison establishes that all 18 regenerated views remain byte-identical to that head, so this change supplies no reason to modify backend seed/closure fixtures or rerun the complete local backend suite.

## Remote CI observation

Run `43700773614`, event `pull_request`, head `161acc0d483780c6bece1be316b51fd0054c2e2f`, base `a7c7e9ceb26f06194e25f29e32941d4e4cb17c32`: 14 jobs of that specific workflow. At 11:42 CET, eight were successful, five failed and backend-ci was still running. Original snapshots and exact failed-job logs are retained here. The package-contract failure was sent to the separately assigned package-repair agent. The root agent owns native D finalization, duration pin and generation, runtime assets, quality status and integration.

## Final technical review and handoff

At 11:49 CET the bounded independent technical review passes. `technical-current-boundary-review.actual.json`, its original log and `technical_current_boundary_review.mts` verify the two canonical requires arrays, unchanged task contents, the two native semantic fingerprints, complete unchanged P profile, one page-bound fresh D resolution and active goal-scoped supersession, the native duration input pin, all 18 byte-identical duration views and current visualization counts. Other four deep-QA subject configurations remain identical. Model diversity is not independently attested; the actual independent agent groups and both keep decisions are bound.

The small package repair changes only the redistribution review's current content digest and build-input hash plus the conformance script's expected digest. Exact JSON comparison confirms all 836 asset decisions, all four class decisions, pending states, source/resource evidence and every other field remain unchanged. The refreshed build-input and resource-index hashes match the current compiled files, and the digest matches the compiler's actual result. The separately supplied current source-pin receipt covers 1,025 bindings. This technical review does not assert completion of the separately running independent native model validator.

The incidental `app/public/index.md` and `app/public/whitepaper/index.md` generator changes were reported to root, who restored them; this audit never edited them. No commit or push was made.

Remote handoff snapshot `run43700773614-jobs-handoff.actual.json` at 11:47:56 CET still records exactly 14 jobs: eight successful, five failed, backend-ci running. Known failed jobs are Quick checks / Validate Graph, Curriculum CI / Validate Graph, Curriculum integrated build / Check goal visualization rollout coverage, Skill-graph and assessment proofs / Test hard Sek-I/Sek-II learning routes, and Curriculum package contracts / Validate Curriculum Package Contracts. Head remains `161acc0d483780c6bece1be316b51fd0054c2e2f`. Root explicitly takes over backend observation, final source checks, fresh PR CI, merge and fresh main CI; no all-terminal or all-green claim is made here.
