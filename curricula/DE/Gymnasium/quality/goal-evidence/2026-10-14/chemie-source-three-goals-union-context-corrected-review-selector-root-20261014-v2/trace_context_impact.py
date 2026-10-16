"""Trace both old and new direct contexts, including newly added reverse edges."""
import hashlib
import json
from pathlib import Path


def affected(old, new, completed):
    changed = {key for key in old.keys() | new.keys() if old.get(key) != new.get(key)}
    result = []
    for goal_id in completed:
        neighbors = set()
        for graph in (old, new):
            goal = graph.get(goal_id, {})
            neighbors.update(goal.get("requires", []) + goal.get("contains", []))
            neighbors.update(row["id"] for row in graph.values()
                             if goal_id in row.get("requires", []) + row.get("contains", []))
        hits = sorted(neighbors & changed)
        if old.get(goal_id) != new.get(goal_id) or hits:
            result.append({"goalId": goal_id,
                           "ownBodyChanged": old.get(goal_id) != new.get(goal_id),
                           "changedDirectNeighborBodies": hits})
    return result


def verify_regression_properties():
    old = {"a": {"id": "a", "requires": [], "contains": []}}
    extra = {"id": "new", "requires": ["a"], "contains": []}
    assert affected(old, {**old, "new": extra}, ["a"]) == [
        {"goalId": "a", "ownBodyChanged": False, "changedDirectNeighborBodies": ["new"]}]
    assert affected(old, {**old, "new": {**extra, "requires": []}}, ["a"]) == []
    assert affected({**old, "new": extra}, old, ["a"])[0]["changedDirectNeighborBodies"] == ["new"]
    assert affected(old, old, ["a"]) == []


if __name__ == "__main__":
    verify_regression_properties()
    root = Path(__file__).resolve().parents[7]
    out = Path(__file__).resolve().parent
    evidence = out.parent
    old_path = evidence / "chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/canonical551.current419.three-author-deltas.exact.json"
    new_path = evidence / "chemie-source-three-goals-materials-and-images-review-selector-root-20261014-v1/candidate/canonical554.prospective422.three-source-goals-plus-current-acid-deltas.inactive.json"
    report_path = evidence / "chemie-NAT9-current419-isolated-integration-technical-20261014-v1/receipts/ACTUAL.current419-NAT9-D2-D5-final.central.stock-report.json"
    old = {g["id"]: g for g in json.loads(old_path.read_text())["goals"]}
    new = {g["id"]: g for g in json.loads(new_path.read_text())["goals"]}
    completed = json.loads(report_path.read_text())["subjects"][0]["strictCompleteGoalIds"]
    rows = affected(old, new, completed)
    assert len(completed) == 305 and all(old[g] == new[g] for g in completed)
    assert len(rows) == 6
    payload = {
        "schemaVersion": 1,
        "role": "Complete prospective context audit; no scientific rereview or approval",
        "algorithm": "Union of both graph versions, outgoing and reverse requires/contains; compare complete neighbor bodies",
        "priorStrictCount": 305,
        "all305OwnBodiesExact": True,
        "affectedPriorClosedGoals": rows,
        "unaffectedPriorClosedGoals": 305 - len(rows),
        "regressionPropertiesPassed": ["added reverse dependency", "removed reverse dependency", "unrelated addition", "unchanged graph"],
        "inputs": [{"path": str(p.relative_to(root)), "sha256": "sha256:" + hashlib.sha256(p.read_bytes()).hexdigest()}
                   for p in (old_path, new_path, report_path)],
        "earlierOldGraphOnlyAuditWasIncomplete": True,
        "strictClosuresGranted": 0,
    }
    (out / "CHECK.actual-complete305-old-new-union-context-impact.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"regressionProperties": "PASS", "prior305BodiesExact": True,
                      "affectedContexts": len(rows), "unaffected": 305 - len(rows)}))
