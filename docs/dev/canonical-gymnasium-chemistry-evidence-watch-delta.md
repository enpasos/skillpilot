# Canonical Gymnasium Chemistry Evidence Watch Delta

Snapshot: `2026-05-12T05:23:24Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-manifest.json`
- `curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json`
- `scripts/canonical_chemistry_evidence_watch.py`

## Headline

- Baseline snapshot: `2026-05-12T05:22:32Z`
- Current watched files: `137`
- Unchanged watched files: `137`
- Changed watched files: `0`
- Added watch paths since baseline: `0`
- Removed watch paths since baseline: `0`

## Interpretation

- A file-level delta is a maintenance signal, not an automatic rollout reopen.
- Reopen remains gated by the documented reopen rules in the watch manifest.

## Changed files

- none

## Added watch paths

- none

## Removed watch paths

- none

## Target delta register

| Target | Changed files | Added paths | Removed paths |
| --- | ---: | ---: | ---: |
| `chemistry_canonical_and_tracker_watch` | `0` | `0` | `0` |
| `chemistry_source_evidence_watch` | `0` | `0` | `0` |
| `chemistry_mapping_watch` | `0` | `0` | `0` |
| `chemistry_composition_view_watch` | `0` | `0` | `0` |

## Regeneration

```bash
python3 scripts/canonical_chemistry_evidence_watch.py capture-baseline
python3 scripts/canonical_chemistry_evidence_watch.py render-delta
python3 scripts/canonical_chemistry_evidence_watch.py check-delta
./scripts/run_canonical_chemistry_evidence_watch.sh
```
