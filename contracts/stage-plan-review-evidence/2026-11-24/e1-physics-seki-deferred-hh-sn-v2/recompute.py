"""Independently recompute all twenty Physics Sek-I S/L contexts.

The predecessor's transparent Python projection algorithm is reused unchanged;
neither the native Java export nor expected fixture values determine any set.
--view-root points to an isolated full repository preview before activation.
Without it, verify the additive four-row successor against current live files.
"""
import argparse
import importlib.util
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
PREDECESSOR = Path("contracts/stage-plan-review-evidence/2026-11-24/e1-physics-seki-current-v1")
ORIGINAL = Path("contracts/stage-plan-review-evidence/2026-11-17/pr160-backend-ci-repair-v1/sek1-seed-fixtures.actual.json")
FIXTURE = Path(__file__).with_name("sek1-seed-fixtures.actual.json")


def independent_projections(view_root=None):
    spec = importlib.util.spec_from_file_location("independent_e1_predecessor_projection", ROOT / PREDECESSOR / "recompute.py")
    projection = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(projection)
    projection.GYMNASIUM = Path(view_root or ROOT) / "curricula/DE/Gymnasium"
    return projection.projections()


def predecessor_scopes():
    original = json.loads((ROOT / ORIGINAL).read_text())["scopes"]
    prior = json.loads((ROOT / PREDECESSOR / "sek1-seed-fixtures.actual.json").read_text())["scopes"]
    return {**original, **prior}


def deltas(rows):
    previous = predecessor_scopes()
    changed = {}
    for key, row in rows.items():
        before = previous[key]
        fields = ("currentSeedAtomicGoalIds", "currentLearningAtomicGoalIds")
        if all(row[field] == sorted(before[field]) for field in fields):
            continue
        assert key.split("|")[1] in ("DE-HH", "DE-SN"), "Unexpected independent scope delta: " + key
        changed[key] = {**row,
            "addedSeedAtomicGoalIds": sorted(set(row[fields[0]]) - set(before[fields[0]])),
            "removedSeedAtomicGoalIds": sorted(set(before[fields[0]]) - set(row[fields[0]])),
            "addedLearningAtomicGoalIds": sorted(set(row[fields[1]]) - set(before[fields[1]])),
            "removedLearningAtomicGoalIds": sorted(set(before[fields[1]]) - set(row[fields[1]])),
        }
    return changed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--view-root", type=Path)
    args = parser.parse_args()
    os.chdir(ROOT)
    rows = independent_projections(args.view_root)
    if args.view_root:
        print(json.dumps({"allTwentyContexts": rows, "changedScopes": deltas(rows)}, indent=2))
    else:
        fixture = json.loads(FIXTURE.read_text())
        import hashlib
        assert fixture["supersedes"]["sha256"] == hashlib.sha256((ROOT / PREDECESSOR / "sek1-seed-fixtures.actual.json").read_bytes()).hexdigest()
        assert deltas(rows) == fixture["scopes"], "Exact scope identity, S/L closure or bound source view changed"
        assert len(fixture["scopes"]) == 4
        print("Independently verified twenty contexts and exactly four HH/SN scope successors; historical fixtures unchanged.")
