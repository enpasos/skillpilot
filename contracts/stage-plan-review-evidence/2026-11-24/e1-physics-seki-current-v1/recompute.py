"""Reproduce the 20 reviewed Physics Sek-I projections from the repository root.

Usage: python3 path/to/recompute.py
No Java projection code, prior fixture values or learner output enter the computation.
"""
import hashlib
import json
from collections import deque
from functools import cache
from pathlib import Path

SUBJECT = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a"
LANDS = ("BW", "BY", "HB", "HE", "HH", "MV", "SL", "SN", "ST", "TH")
GYMNASIUM = Path("curricula/DE/Gymnasium")
PREVIOUS = Path("contracts/stage-plan-review-evidence/2026-11-17/pr160-backend-ci-repair-v1/sek1-seed-fixtures.actual.json")
FIXTURE = Path(__file__).with_name("sek1-seed-fixtures.actual.json")


def read(path):
    return json.loads(path.read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_goals():
    goals = {}
    for path in sorted((GYMNASIUM / "canonical").glob("*.json")):
        for goal in read(path)["goals"]:
            if goal["id"] in goals:
                raise ValueError(f"Duplicate canonical ID {goal['id']}")
            goals[goal["id"]] = goal
    return goals


def projections():
    goals = read_goals()

    @cache
    def descendants(root):
        """Atomic descendants with shortest contains distance from this root."""
        distances = {}
        queue = deque([(root, 0)])
        visited = set()
        while queue:
            goal_id, distance = queue.popleft()
            if goal_id in visited:
                continue
            visited.add(goal_id)
            children = goals[goal_id].get("contains", [])
            if children:
                queue.extend((ref.split(":")[-1], distance + 1) for ref in children)
            else:
                distances[goal_id] = distance
        return distances

    def target_ids(nodes):
        best = {}

        def visit(node):
            kind = node["kind"]
            if kind == "structure":
                for child in node["children"]:
                    visit(child)
                return
            root = node["goalId"]
            role = node.get("projectionRole", "target")
            if role not in {"target", "prerequisiteOnly"}:
                raise ValueError(role)
            if kind == "goalEntry":
                members = {} if goals[root].get("contains") else {root: 0}
            elif kind == "canonicalSubtree":
                members = descendants(root)
            else:
                raise ValueError(kind)
            for member, distance in members.items():
                rank = (kind != "goalEntry", distance, role != "target")
                if member not in best or rank < best[member]:
                    best[member] = rank

        for node in nodes:
            visit(node)
        return {member for member, rank in best.items() if not rank[2]}

    def learning_closure(seeds):
        learning = set(seeds)
        pending = list(seeds)
        while pending:
            for ref in goals[pending.pop()].get("requires", []):
                for atom in descendants(ref.split(":")[-1]):
                    if atom not in learning:
                        learning.add(atom)
                        pending.append(atom)
        return learning

    def in_scope(atom, land, duration):
        goal = goals[atom]
        levels = set(goal.get("tags", [])) | {goal.get("release", {}).get("courseLevel")}
        if "LK" in levels and "GK" not in levels:
            return False
        applicability = goal.get("applicability", {})
        filters = {"jurisdiction": f"DE-{land}", "durationModel": duration, "schoolForm": "Gymnasium"}
        return all(not applicability.get(field) or value in applicability[field]
                   for field, value in filters.items())

    rows = {}
    for land in LANDS:
        for duration in ("G8", "G9"):
            suffix = f"-{duration.lower()}" if land == "HE" else ""
            path = GYMNASIUM / "composition-views/physik" / f"de-{land.lower()}-seki{suffix}.view.json"
            view = read(path)
            assert view["landscapeId"] == SUBJECT
            seeds = {atom for atom in target_ids(view["rootNodes"]) if in_scope(atom, land, duration)}
            key = "|".join((SUBJECT, f"DE-{land}", "SekI", duration, "GK"))
            rows[key] = {
                "currentSeedAtomicGoalIds": sorted(seeds),
                "currentLearningAtomicGoalIds": sorted(learning_closure(seeds)),
                "sourceViewId": view["viewId"],
                "sourceViewSha256": sha(path),
            }
    return rows


def changed_rows(rows, previous):
    changed = {}
    for key, row in rows.items():
        old = previous[key]
        if all(row[field] == sorted(old[field]) for field in ("currentSeedAtomicGoalIds", "currentLearningAtomicGoalIds")):
            continue
        seeds = set(row["currentSeedAtomicGoalIds"])
        old_seeds = set(old["currentSeedAtomicGoalIds"])
        changed[key] = {
            **row,
            "addedSeedAtomicGoalIds": sorted(seeds - old_seeds),
            "removedSeedAtomicGoalIds": sorted(old_seeds - seeds),
        }
    return changed


if __name__ == "__main__":
    fixture = read(FIXTURE)
    assert fixture["supersedes"]["sha256"] == sha(PREVIOUS)
    reviewed = changed_rows(projections(), read(PREVIOUS)["scopes"])
    assert reviewed == fixture["scopes"], "Exact scope, seed, learning identity or source view changed"
    print(f"Independently verified all {2 * len(LANDS)} scopes, including {len(reviewed)} superseding rows.")
