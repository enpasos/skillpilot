# Canonical Gymnasium Physics Evidence Watch Delta

Snapshot: `2026-04-20T13:57:55Z`

This file is generated from:

- `curricula/DE/Gymnasium/provenance/physics-evidence-watch-manifest.json`
- `curricula/DE/Gymnasium/provenance/physics-evidence-watch-baseline.json`
- `scripts/render_canonical_physics_evidence_watch_delta.py`

## Headline

- Baseline snapshot: `2026-04-20T07:46:29Z`
- Current watched files: `12`
- Unchanged watched files: `12`
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
| `sek1_hessen_seed_watch` | `0` | `0` | `0` |
| `sek1_cosmos_floor_watch` | `0` | `0` | `0` |
| `sek1_electronics_floor_watch` | `0` | `0` | `0` |
| `sek1_light_matter_overlap_watch` | `0` | `0` | `0` |
| `sek2_residue_watch` | `0` | `0` | `0` |

## Regeneration

```bash
python3 scripts/capture_canonical_physics_evidence_watch_baseline.py
python3 scripts/render_canonical_physics_evidence_watch_delta.py
python3 scripts/check_canonical_physics_evidence_watch_delta.py
./scripts/run_canonical_physics_evidence_watch.sh
```
