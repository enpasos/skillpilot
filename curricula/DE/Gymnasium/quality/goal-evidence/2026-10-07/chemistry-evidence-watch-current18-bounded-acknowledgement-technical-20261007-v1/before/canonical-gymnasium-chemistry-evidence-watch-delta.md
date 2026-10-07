# Canonical Gymnasium Chemistry Evidence Watch Delta

Snapshot: `2026-10-07T09:24:58Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json`
- `scripts/canonical_chemistry_evidence_watch.py`

## Headline

- Baseline snapshot: `2026-10-07T00:54:59Z`
- Current watched files: `146`
- Unchanged watched files: `144`
- Changed watched files: `2`
- Added watch paths since baseline: `0`
- Removed watch paths since baseline: `0`

## Interpretation

- A file-level delta is a maintenance signal, not an automatic rollout reopen.
- Reopen remains gated by the documented reopen rules in the watch manifest.
- The canonical Chemistry hash excludes `goal-visualization` resource links and JSON formatting; those are presentation metadata covered by the visualization QA lane.

## Changed files

| File | Exists (baseline -> current) | SHA256-12 (baseline -> current) | Last modified UTC (baseline -> current) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json` | `True -> True` | `219a7b9c3a14 -> 2e63a6cf788c` | `2026-10-07T00:47:21Z -> 2026-10-07T07:59:11Z` |
| `curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json` | `True -> True` | `21ca2e0a08ae -> 003c861d1a25` | `2026-05-11T11:07:28Z -> 2026-10-07T07:59:11Z` |

## Added watch paths

- none

## Removed watch paths

- none

## Target delta register

| Target | Changed files | Added paths | Removed paths |
| --- | ---: | ---: | ---: |
| `chemistry_canonical_and_tracker_watch` | `1` | `0` | `0` |
| `chemistry_source_evidence_watch` | `0` | `0` | `0` |
| `chemistry_mapping_watch` | `1` | `0` | `0` |
| `chemistry_composition_view_watch` | `0` | `0` | `0` |

## Regeneration

```bash
python3 scripts/canonical_chemistry_evidence_watch.py capture-baseline
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
python3 scripts/canonical_chemistry_evidence_watch.py check-delta
./scripts/run_canonical_chemistry_evidence_watch.sh
```
