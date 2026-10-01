# Chemistry evidence-watch baseline review — 1 October 2026

## Decision and scope

This is a maintenance acknowledgement of Chemistry goal wording already committed
in PR [#68](https://github.com/enpasos/skillpilot/pull/68), merged as
`cbc32044f55223979815dc0eef3757caee82a5e0`. The PR's
[Chemistry evidence-watch job](https://github.com/enpasos/skillpilot/actions/runs/36809019248/job/110199679040)
failed with `changed=1 added=0 removed=0`; its uploaded delta identifies only
the canonical Chemistry JSON. This review does not edit canonical content,
reapprove learning goals, claim human approval, or complete Chemistry M7.

The prior baseline at `2026-09-07T08:01:17Z` hashes the canonical source at the
first parent of the merge (`cbc32044f^`, also `4eb105ac1`) to:

```text
cc1d63eed31a93420a2dd34890aed18bd62119fc42d50420e55ba9ee6e5a4ba3
```

The same `canonical-evidence-json-v1` normalization of the merged canonical
source hashes to:

```text
64e40c82adb83f37a397e512de0ee645658a3ea3e1802e51baba124bcb1aa8d5
```

The normalization ignores only `goal-visualization` resource links and JSON
formatting. It continues to watch descriptions, graph structure, source links,
and other canonical fields.

## Exact semantic delta

A field-by-field comparison of those two normalized sources finds **473 identical
goal IDs** and exactly the following ten changed fields. There are no added or
removed goals, top-level changes, or other goal-field changes. The full previous
and current wording is in `git diff cbc32044f^ cbc32044f --
curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`.

| Goal ID | Changed fields | Reviewed substance of the new wording | Existing machine-review evidence |
| --- | --- | --- | --- |
| `326d45bf-9f77-57d5-a054-93e76b034dd5` | `description`, `descriptionEn` | Distinguishes solid, liquid and gas by observable properties; treats transitions as states of the same substance. | `chemie/rollout-v1/2026-09-30/batch-004w-states-corrected-image-current-1-v1` in `curricula/DE/Gymnasium/quality/goal-description-review/` |
| `d2ccd1d5-56f7-583f-9724-e97441367f91` | `description`, `descriptionEn` | Uses the actual indicator colour scale and broad pH ranges for suitable school experiments. | `chemie/rollout-v1/2026-09-30/batch-004v-indicator-reference-current-1-v2` in the same review root |
| `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566` | `description`, `descriptionEn` | Uses formation of new substances to distinguish reactions; temperature or colour changes alone are inconclusive. | `chemie/rollout-v1/2026-10-01/b009-reaction-vs-physical-current-1-v1` in the same review root |
| `4dab7d52-5b89-52ab-a425-17a7707f44c8` | `description`, `descriptionEn` | Compares direct CO₂ release and combustion heat on consistent reference bases and system boundaries. | `chemie/rollout-v1/2026-10-01/b009-fuel-comparison-current-1-20261001-v3` in the same review root |
| `0503c975-3934-5206-962e-b1c247de0c12` | `description`, `descriptionEn` | Explains the fossil-store-to-atmosphere transfer and atmospheric increase when total inflow exceeds total uptake. | `chemie/rollout-v1/2026-10-01/b009-fossil-carbon-current-1-20261001-v2` in the same review root |

The B009 package's current five-gate checkpoint documents its three newly
closed goals as **58/376** Chemistry goals strictly complete, with the separate
human gate still open. The two B004 packages have current dual-round
resolutions. This watch acknowledgement adds **zero** new strict goal closures.

## Why the P6 watch baseline may advance

The watch manifest reopens P6 maintenance only if a canonical or tracker delta
changes visible scope, source-backed projection status, runtime mapping coverage,
or composition-view eligibility. The exact normalized delta above changes none
of these. The checker reports the other **136 watched files unchanged**, including
source extractions, mappings, composition views and the rollout tracker. Their
baseline records remain byte-for-byte identical. The five descriptions were
changed and reviewed in the separate machine Curriculum-QS lane; this baseline
change records that active source state without presenting a hash refresh as a
new fachliche Prüfung.

Only the canonical Chemistry baseline record's evidence hash and observed file
modification time, plus the baseline `updatedAt`, advance. The historical
[7 September review](canonical-gymnasium-chemistry-evidence-watch-review-2026-09-07.md)
and Git history preserve the earlier baseline. The watch manifest, normalized
hash algorithm, checker, workflow and canonical source remain unchanged.

## Verification

- Compare the normalized first-parent and merged sources: exactly five goal IDs,
  each with only `description` and `descriptionEn` changed; all 473 IDs retained.
- Compare watch records before and after this acknowledgement: all 136 other
  records are unchanged.
- Run `python3 -B scripts/canonical_chemistry_evidence_watch.py self-test` and
  `./scripts/run_canonical_chemistry_evidence_watch.sh`; the expected delta is
  `changed=0 added=0 removed=0`.
