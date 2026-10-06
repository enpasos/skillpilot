# Chemistry evidence-watch checkpoint review — 6 October 2026

## Cause and bounded decision

The [Chemistry Evidence Watch](https://github.com/enpasos/skillpilot/actions/runs/37393365812)
on checkpoint `9aa9f21ec99f88ab5a51a8ca29b951fe23c710c7` correctly reported
`changed=6 added=2 removed=0`. Its baseline still described the earlier
`f3bc00419` checkpoint, dated 5 October at 14:47:16 UTC.

This maintenance acknowledgement advances six existing records and adds two
records after comparison with the independently reviewed integration plans and
actual checkpoint validation. All other **136 complete baseline records** remain
exact. Manifest, hash normalization, checker, workflow and curriculum files are
unchanged by this repair. Future watched changes still fail the same check.

This creates **zero new scientific completions**. Chemistry remains **104/376,
M6**, with CQR-303/M7 open; Biology remains 67/383. Mathematics and Physics M7
and all nine protected maturity floors remain intact. No human approval,
learning trial or release acceptance is claimed.

## Reviewed watch delta

| Watched input | Exact change and existing evidence |
| --- | --- |
| Canonical Chemistry JSON | 473→474 nodes: one additional structural cluster `bf001d50-ad32-5de8-885d-bd09174a0f5e`, 21 changed existing nodes, no removed IDs, no top-level changes and no additional curricularAtomic goal. Changes are the existing B010 wording/structure and Q1 wording/source-component bindings. |
| Country GK, LK and Sek-I views; Hessen GK and LK views | Each adds the new element-group cluster. Its three existing atoms move from the salt/application cluster. Ordered structural references match the reviewed B010 integration plan; atomic membership and occurrences remain unchanged, without duplicates. |
| Hessen lower-secondary B010 prospective mapping | Bytes match the reviewed integration plan. Its explicit `candidate` status is retained. Source and target IDs exist; partial component bindings do not approve the residual hydrogen/halogen/HCl synthesis scope. |
| Hessen upper-secondary Q1 fourteen-current mapping | Bytes match the reviewed Q1 integration plan. `complete` refers to the mapping inventory; it does not approve every source-group component. Separate ester naming, mechanism and prerequisite HOLDs remain open. |

The complete changed-node/field register, exact path list and before/after
baseline hashes are in the [bounded maintenance receipt](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemistry-evidence-watch-checkpoint-review-v1/bounded-baseline-maintenance.actual.json).
The prior baseline bytes are retained alongside it and in Git history. All
source extractions, runtime legacy mappings, rollout tracker and other views
retain their existing watched records.

## Existing scientific and integration evidence

- [B010 and source-compiler continuation](../qa-ci/chemie-biologie-m7-b010-tf-methylation-continuation-2026-10-05.md)
  records the five already reviewed B010 goals and separate structural/source
  boundaries. The held alkali-properties goal remains outside the strict count.
- [Q1 continuation](../qa-ci/chemie-biologie-m7-q1-bacteria-e7-continuation-2026-10-05.md)
  records the fourteen separately reviewed Q1 goals and retained open components.
- [Current NI checkpoint and inactive Chemistry candidate](../qa-ci/chemie-biologie-m7-ni-quantitative-continuation-2026-10-06.md)
  documents the actual Chemistry 104/376 and Biology 67/383 ID sets. The rejected
  eight-goal Chemistry integration stays inactive.
- [Actual checkpoint validation](https://github.com/enpasos/skillpilot/blob/main/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/stable-checkpoint-current-validation-summary.actual.json)
  includes native schema, graph, composition, Memory, image, status/floor and
  build checks, plus the selected synthetic-learner API integration test.
  Its eighteen bound current inputs and code files remain physically exact.

An independent read-only guard compared the baseline to its exact Git revision,
all five changed views and both mapping files to the reviewed plans, source and
target membership, current strict IDs, and complete checkpoint input bindings.
This reuses valid scientific reviews and does not turn a hash update into a new
description, positive-evidence, atomicity, Memory or visualization approval.

## Verification and integration

The unchanged `./scripts/run_canonical_chemistry_evidence_watch.sh` passed with
actual Exit 0, including its self-test, `changed=0 added=0 removed=0` and
`CHEMISTRY_EVIDENCE_WATCH=OK`. Both watch views were regenerated natively.
Documentation links, indexes, generated notices, whitespace and all nine
protected maturity floors also passed with actual Exit 0. Terminal results
are retained in the maintenance receipt directory.

The failed GitHub run belongs to the old baseline at `9aa9f21ec`. The local
correction requires a new commit/push before GitHub can verify the changed
baseline; a rerun of that old revision cannot apply the correction.
