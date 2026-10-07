# Canonical Gymnasium Chemistry Evidence Watch Delta

Snapshot: `2026-10-07T00:40:27Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json`
- `scripts/canonical_chemistry_evidence_watch.py`

## Headline

- Baseline snapshot: `2026-10-06T04:22:04Z`
- Current watched files: `146`
- Unchanged watched files: `139`
- Changed watched files: `7`
- Added watch paths since baseline: `0`
- Removed watch paths since baseline: `0`

## Interpretation

- A file-level delta is a maintenance signal, not an automatic rollout reopen.
- Reopen remains gated by the documented reopen rules in the watch manifest.
- The canonical Chemistry hash excludes `goal-visualization` resource links and JSON formatting; those are presentation metadata covered by the visualization QA lane.

## Changed files

| File | Exists (baseline -> current) | SHA256-12 (baseline -> current) | Last modified UTC (baseline -> current) |
| --- | --- | --- | --- |
| `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json` | `True -> True` | `9fea23940a6a -> 219a7b9c3a14` | `2026-10-06T04:04:29Z -> 2026-10-07T00:32:40Z` |
| `curricula/DE/Gymnasium/composition-views/chemie/de-bb-gk.view.json` | `True -> True` | `41be795c3ab0 -> 304d030ac8c6` | `2026-05-11T15:47:52Z -> 2026-10-06T22:07:09Z` |
| `curricula/DE/Gymnasium/composition-views/chemie/de-bb-lk.view.json` | `True -> True` | `7b2b8027aa32 -> c2a9753bd619` | `2026-05-11T15:47:52Z -> 2026-10-06T22:07:09Z` |
| `curricula/DE/Gymnasium/composition-views/chemie/de-be-gk.view.json` | `True -> True` | `00de28f46bfc -> 7aa0cc2fd01c` | `2026-05-11T15:47:52Z -> 2026-10-06T22:07:09Z` |
| `curricula/DE/Gymnasium/composition-views/chemie/de-be-lk.view.json` | `True -> True` | `a6f8659c8e2c -> fa0dc13e9304` | `2026-05-11T15:47:52Z -> 2026-10-06T22:07:09Z` |
| `curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json` | `True -> True` | `83f91e666aaf -> 79e4b03d7631` | `2026-05-15T15:06:30Z -> 2026-10-06T23:14:29Z` |
| `curricula/DE/Gymnasium/input/BW/upper-secondary/source-extraction/DE_BW_CHEMIE_SEKII_BP2016_V2.source-extraction.json` | `True -> True` | `cd568fd6ad8c -> 3f74205ca89f` | `2026-05-15T15:06:30Z -> 2026-10-06T22:00:42Z` |

## Added watch paths

- none

## Removed watch paths

- none

## Target delta register

| Target | Changed files | Added paths | Removed paths |
| --- | ---: | ---: | ---: |
| `chemistry_canonical_and_tracker_watch` | `1` | `0` | `0` |
| `chemistry_source_evidence_watch` | `2` | `0` | `0` |
| `chemistry_mapping_watch` | `0` | `0` | `0` |
| `chemistry_composition_view_watch` | `4` | `0` | `0` |

## Regeneration

```bash
python3 scripts/canonical_chemistry_evidence_watch.py capture-baseline
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
python3 scripts/canonical_chemistry_evidence_watch.py check-delta
./scripts/run_canonical_chemistry_evidence_watch.sh
```
