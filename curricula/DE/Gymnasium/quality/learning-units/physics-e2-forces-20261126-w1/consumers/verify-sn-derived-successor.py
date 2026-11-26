#!/usr/bin/env python3
"""Verify the bounded, stock-generated Sachsen source-report successor.

Large prior/current reports remain in the supplied external CI handover.
This script verifies both exact bytes and the independently measured deltas.
"""

import argparse
import gzip
import hashlib
import json
from pathlib import Path


G = "77b44d13-4368-5950-a943-decb377c7302"
ROW = "sn-phys-sekii-sn-jahrgangsstufe-11-leistungskurs-lb3-049-03-ebb3ab09"
AUDIT = "docs/qa-ci/status/curriculum-source-coverage-audit.json"
RATIONALE = "app/public/data/goal-source-rationales-physics-public.json"
STATUS = "docs/qa-ci/status/curriculum-quality-status.json"
ORIGINALS = "app/public/lernzielbuch/de-gym-physik-bundesweit.original-sources.json"


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def differences(before, after, path=""):
    if type(before) is not type(after):
        return [{"path": path, "before": before, "after": after}]
    if isinstance(before, dict):
        return [row for key in sorted(before.keys() | after.keys())
                for row in differences(before.get(key), after.get(key), path + "/" + key)]
    if isinstance(before, list):
        if len(before) != len(after):
            return [{"path": path, "before": before, "after": after}]
        return [row for index, (left, right) in enumerate(zip(before, after))
                for row in differences(left, right, path + "/" + str(index))]
    return [] if before == after else [{"path": path, "before": before, "after": after}]


def semantic_differences(before, after):
    return [row for row in differences(before, after) if row["path"] != "/generatedAt"]


def compact_audit_differences(before, after):
    result = []
    for row in semantic_differences(before, after):
        if isinstance(row["before"], list):
            left, right = row["before"], row["after"]
            assert all("goalId" in item for item in left + right)
            result.append({"path": row["path"], "beforeCount": len(left), "afterCount": len(right),
                           "removedGoalIds": [item["goalId"] for item in left if item not in right],
                           "addedGoalIds": [item["goalId"] for item in right if item not in left]})
        else:
            result.append(row)
    return result


def summarize(before, baseline, current):
    audit_before = before[AUDIT]
    audit_after = current[AUDIT]
    assert baseline["curricula"][0] == audit_after["curricula"][0]
    baseline_sn = baseline["curricula"][1]["jurisdictions"][13]
    current_sn = audit_after["curricula"][1]["jurisdictions"][13]
    assert baseline_sn["jurisdiction"] == current_sn["jurisdiction"] == "DE-SN"
    assert (baseline_sn["visibleAtomicGoals"], baseline_sn["visibleCoveredAtomicGoals"],
            baseline_sn["unsupportedAssignedAtomicGoals"]) == (439, 438, 1)
    assert (current_sn["visibleAtomicGoals"], current_sn["visibleCoveredAtomicGoals"],
            current_sn["unsupportedAssignedAtomicGoals"]) == (439, 439, 0)
    assert [row["goalId"] for row in baseline_sn["unsupportedAssignedAtomicGoalIds"]] == [G]
    assert current_sn["unsupportedAssignedAtomicGoalIds"] == []
    for curriculum in audit_after["curricula"]:
        assert all(row["viewStatus"] == "covered" for row in curriculum["jurisdictions"])

    rationale_before, rationale_after = before[RATIONALE], current[RATIONALE]
    assert rationale_before["request"] == rationale_after["request"]
    assert rationale_before["summary"] == rationale_after["summary"]
    assert len(rationale_after["items"]) == 451
    assert [row["goal"] for row in rationale_before["items"]] == [
        row["goal"] for row in rationale_after["items"]]
    changed = []
    for left, right in zip(rationale_before["items"], rationale_after["items"]):
        if left == right:
            continue
        changed.append(right["goal"]["id"])
        if right["goal"]["id"] == G:
            assert left["classicSourceRoute"] == right["classicSourceRoute"]
            assert right["classicSourceRoute"]["jurisdiction"] == "DE-BY"
            left_routes = left["alternateClassicSourceRoutes"]
            right_routes = right["alternateClassicSourceRoutes"]
            added = [route for route in right_routes if route not in left_routes]
            assert len(right_routes) - len(left_routes) == len(added) == 2
            assert all(route in right_routes for route in left_routes)
            assert all(route["sourceGoalId"] == ROW and route["jurisdiction"] == "DE-SN"
                       and "2019" in route["sourceRef"] for route in added)
            assert sorted(route["matchType"] or "decision" for route in added) == ["decision", "partial"]
        else:
            deltas = differences(left, right)
            assert len(deltas) == 1 and deltas[0]["path"].endswith("/rationale")
            assert "19:13 CET" in deltas[0]["after"]
    assert changed == [G, "156edddc-ce8d-580d-8d17-d9376d59e60e",
                       "2b700858-bc2e-5ddf-a791-b14d44160480"]

    return {
        "publishedAuditSemanticDeltaEntries": len(semantic_differences(audit_before, audit_after)),
        "acceptedSnMappingOnlyAuditDeltas": compact_audit_differences(baseline, audit_after),
        "incidentalMathematicsRefreshAlreadyPresentWithOldSnMapping": True,
        "physicsAuditAtoms": [audit_before["curricula"][1]["totalAtomicGoals"],
                              audit_after["curricula"][1]["totalAtomicGoals"]],
        "rationaleItems": 451,
        "rationaleChangedGoalIds": changed,
        "gPreferredSourceJurisdiction": "DE-BY",
        "gAddedAlternateRouteRepresentations": 2,
        "statusSemanticDeltas": semantic_differences(before[STATUS], current[STATUS]),
    }


def repository_root():
    return next(parent for parent in Path(__file__).resolve().parents
                if (parent / "app/package.json").is_file())


def view_domain(root, directory):
    rows = [{"path": str(path.relative_to(root)), "sha256": digest(path.read_bytes())}
            for path in sorted((root / directory).rglob("*.view.json"))]
    payload = json.dumps(rows, sort_keys=True, separators=(",", ":")).encode()
    return {"count": len(rows), "orderedPathAndRawDigestSha256": digest(payload)}


def book_measurements(before, after):
    encode = lambda value: json.dumps(value, sort_keys=True, separators=(",", ":"))

    def normalize(payload):
        documents = {row["id"]: {key: value for key, value in row.items() if key != "id"}
                     for row in payload["documents"]}
        evidence = {row["id"]: {**{key: value for key, value in row.items()
                                  if key not in {"id", "documentId"}},
                                "document": documents[row["documentId"]]}
                    for row in payload["evidence"]}
        goals = {goal_id: [{**{key: value for key, value in scope.items() if key != "evidenceIds"},
                            "evidence": sorted(encode(evidence[key]) for key in scope["evidenceIds"])}
                           for scope in scopes] for goal_id, scopes in payload["goals"].items()}
        return documents, evidence, goals

    old_documents, old_evidence, old_goals = normalize(before)
    documents, evidence, goals = normalize(after)
    previous_rows = set(map(encode, old_evidence.values()))
    current_rows = set(map(encode, evidence.values()))
    added = [json.loads(row) for row in sorted(current_rows - previous_rows)]
    assert previous_rows <= current_rows
    assert all(goals.get(goal_id) == value for goal_id, value in old_goals.items())
    assert set(map(encode, old_documents.values())) == set(map(encode, documents.values()))
    sn_witnesses = [row for row in added if row["sourceScope"]["jurisdiction"] == "DE-SN"]
    assert len(sn_witnesses) == 1
    assert sn_witnesses[0]["mappedTargetGoalId"] == G and sn_witnesses[0]["sourceGoalId"] == ROW
    assert sn_witnesses[0]["sourceScope"]["stage"] == ["SekII"]
    assert sn_witnesses[0]["sourceScope"]["courseProfile"] == ["LK"]
    return {
        "beforeWasObservedPreW1RuntimeCache": True,
        "beforeGoalCount": len(old_goals), "currentGoalCount": len(goals),
        "newGoalIds": [goal_id for goal_id in goals if goal_id not in old_goals],
        "removedGoalIds": [], "retainedOldGoalScopesAndSourceEvidenceExact": True,
        "beforeEvidenceCount": len(old_evidence), "currentEvidenceCount": len(evidence),
        "addedSemanticEvidenceCounts": {goal_id: sum(row["mappedTargetGoalId"] == goal_id for row in added)
                                        for goal_id in sorted({row["mappedTargetGoalId"] for row in added})},
        "removedSemanticEvidenceCount": 0, "documentIdentitiesUnchanged": True,
        "newSnWitness": sn_witnesses[0],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=repository_root())
    parser.add_argument("--ci-handover", type=Path, required=True)
    args = parser.parse_args()
    receipt = json.loads(Path(__file__).with_name(
        "sn-2019-partial-g-derived.successor.actual.json").read_text())
    for row in receipt["currentInputs"] + receipt["activeOutputs"]:
        raw = (args.repo_root / row["path"]).read_bytes()
        assert len(raw) == row["bytes"] and digest(raw) == row["sha256"], row["path"]
    for row in receipt["retainedViewDomains"]:
        assert view_domain(args.repo_root, row["directory"]) == row["before"] == row["current"]
    decoded = {}
    for row in receipt["externalBindings"]:
        assert row["rootAlias"] == "ciHandover"
        relative = Path(row["relativePath"])
        assert not relative.is_absolute() and ".." not in relative.parts
        raw = (args.ci_handover / relative).read_bytes()
        assert len(raw) == row["bytes"] and digest(raw) == row["sha256"], str(relative)
        data = gzip.decompress(raw) if row.get("encoding") == "gzip" else raw
        assert len(data) == row["decodedBytes"] and digest(data) == row["decodedSha256"]
        if row.get("role") in {"before-active-output", "native-old-sn-mapping-audit",
                               "before-ignored-runtime-cache", "after-native-runtime-build"}:
            if not row["artifactPath"].endswith(".json"):
                continue
            decoded[row["role"], row["artifactPath"]] = json.loads(data)
    before = {path: decoded["before-active-output", path] for path in [AUDIT, RATIONALE, STATUS]}
    baseline = decoded["native-old-sn-mapping-audit", AUDIT]
    current = {path: json.loads((args.repo_root / path).read_text())
               for path in [AUDIT, RATIONALE, STATUS]}
    assert summarize(before, baseline, current) == receipt["measurements"]
    assert book_measurements(decoded["before-ignored-runtime-cache", ORIGINALS],
                             decoded["after-native-runtime-build", ORIGINALS]) == receipt["bookMeasurements"]
    print(json.dumps({"status": "PASS", "activeOutputs": len(receipt["activeOutputs"]),
                      "externalBindings": len(receipt["externalBindings"]),
                      "sourceAuditVisibleViews": 32, "physicsRationaleItems": 451}))


if __name__ == "__main__":
    main()
