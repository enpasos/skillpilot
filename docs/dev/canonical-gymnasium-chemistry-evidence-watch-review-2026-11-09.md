# Chemistry evidence-watch maintenance review — 9 November 2026

The [failed watch on PR #105](https://github.com/enpasos/skillpilot/actions/runs/42695191030/job/129425049518)
reported `changed=1 added=0 removed=0`. The unchanged
`canonical-evidence-json-v1` hash detects the canonical Chemistry applicability
cache correction already committed at `2333bd7e9a`.

Exactly seven `applicability.jurisdiction` lists change, adding thirteen real
goal/jurisdiction visibility pairs. The four existing reopening conditions remain
binding: this bounded maintenance review explicitly acknowledges the visibility
change. Every addition has existing `requires-closure` evidence in the actual
applicability-writer report; no new source claim or scientific review is inferred.

| Goal | Added jurisdictions |
| --- | --- |
| `17fe22c4-1248-5f37-9d0c-52ee4571d09f` | `DE-HB` |
| `c441d9e8-d9d9-5e55-a189-a37345541321` | `DE-BW`, `DE-HB` |
| `fcaf8c9b-bd81-552e-9d91-43649895471e` | `DE-NI` |
| `79db6d68-b402-5563-a348-f2784fed8867` | `DE-BB`, `DE-BE` |
| `7964cb36-e9b1-5176-9426-a82041a5b72f` | `DE-BB`, `DE-BE`, `DE-HB`, `DE-NI` |
| `965ca297-5dbf-5e58-b5f0-6559a4433646` | `DE-HB`, `DE-NI` |
| `8576b82b-811a-5e13-b5dc-ec5d42030565` | `DE-NI` |

This is HB 4, NI 4, BB 2, BE 2 and BW 1. Full before/current JSON comparison
confirms all other values unchanged, including authored `requires`, `contains`,
goal text and source semantics. The actual source-fingerprint function records
all **6,524** fingerprints unchanged across the 21 source documents. Mappings,
composition views, tasks, images, units and learner mastery are unchanged. This
adds **zero scientific reviews or completions** and starts no new review campaign.

Only baseline `updatedAt` and canonical Chemistry's hash and file timestamp
advance. Its hash moves from `5da87f60f3a8…` to `333c35b70529…`; the other
**159 complete records** and all remaining metadata are exact. The 160-path
inventory, hash mode, checker, runner, workflow and manifest remain unchanged.
The complete prior baseline remains in reachable Git history. The
[compact technical receipt](../../qa-artifacts/ci-contract-audit/2026-11-09/g17-chemistry-cache-watch-ack/receipt.json)
binds that baseline, the actual cache/source evidence, V7 registry
`8e56e88b70e0…` and the completed local results.

Existing validation passed: ordinary whole CQR in 1,000.272 seconds and all ten
protected maturity floors, the full TypeScript proof suite in 1,509.555 seconds,
and 22 Python tests in 492.793 seconds. Their recorded input checks remained
unchanged. These results were inspected, not rerun for this observation update;
this acknowledgement makes no final V7 or Physics runtime-acceptance claim.

The normal unchanged watch runner first reproduced Exit 1 with only canonical
Chemistry changed. After this single-record acknowledgement, it passes locally
with Exit 0, `changed=0 added=0 removed=0` and
`CHEMISTRY_EVIDENCE_WATCH=OK`; its self-test passes and both generated views are
regenerated. Future unacknowledged changes still fail. Fresh remote CI is pending.
