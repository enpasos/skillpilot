# SPDX-License-Identifier: Apache-2.0
"""Independent, bounded preservation checks; never writes active inputs or D freeze."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / "chemie-8ceb-six-state-source-candidate-v1"
BASE = OWN.parent / "chemie-8ceb-split-scope-preservation-candidate-v1"
errors = []


def read(path):
    return json.loads(Path(path).read_text())


def digest(path):
    return "sha256:" + hashlib.sha256(Path(path).read_bytes()).hexdigest()


def expect(condition, message):
    if not condition:
        errors.append(message)


def at(value, pointer):
    for part in pointer.split("/")[1:]:
        key = part.replace("~1", "/").replace("~0", "~")
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


freeze = read(OWN / "D-before-P.freeze.receipt.json")
expect(digest(OWN / freeze["file"]) == freeze["sha256"], "D freeze changed after P")
inputs = read(AUTHOR / "exact-current-input-bindings.receipt.json")
for row in inputs["stableInputFiles"]:
    expect(digest(ROOT / row["path"]) == row["sha256"], f"Base candidate changed: {row['path']}")
for row in inputs["sourceInputs"]:
    expect(digest(ROOT / row["mappingPath"]) == row["mappingSha256"], f"Mapping input changed: {row['mappingPath']}")
    expect(digest(ROOT / row["sourcePath"]) == row["sourceSha256"], f"Extraction input changed: {row['sourcePath']}")

placements = read(AUTHOR / "placement-and-scope-options.candidates.json")
base_placements = read(BASE / "placements-and-views.delta.candidate.json")
base_by_key = {(x["path"], x["pointer"]): x for x in base_placements["authoredGoalEntryDeltas"]}
selected = placements["preferredOption"]["nodeDeltas"]
children = ["5db9ba57-6a80-56db-8b9d-e8ca4ac41855", "7c22f436-e550-5b0b-85ae-a073b0c50418"]
for row in selected:
    expect(digest(ROOT / row["path"]) == row["sha256"], f"View input changed: {row['path']}")
    view = read(ROOT / row["path"])
    expect(at(view, row["pointer"]) == row["nodeBefore"], f"Placement before differs: {row['viewId']}")
    original = base_by_key[(row["path"], row["pointer"])]
    for field in ("nodeBefore", "nodeAfterCandidate", "childTargetIds", "scopeBefore"):
        expect(row[field] == original[field], f"Additional placement mutation: {row['viewId']} {field}")
    expect(row["childTargetIds"] == children and row["normativeNamedProcessApproval"] is False,
           f"Mandatory-child scope overclaim: {row['viewId']}")
expect(len(selected) == 12 and len(base_by_key) == 26, "Expected 12 reviewed of 26 preserved placements")

locator = read(AUTHOR / "exact-source-locator.delta.candidates.json")
source_overlays = {}
locator_rows = []
for row in locator["deltas"]:
    path = ROOT / row["sourcePath"]
    expect(digest(path) == row["sourcePathSha256"], f"Locator extraction changed: {row['sourceGoalId']}")
    original = read(path)
    goal = at(original, row["sourceGoalPointer"])
    expect(goal["id"] == row["sourceGoalId"] and goal["sourceText"] == row["sourceTextBeforeUnchanged"],
           f"Locator actual source row differs: {row['sourceGoalId']}")
    overlay = source_overlays.setdefault(row["sourcePath"], copy.deepcopy(original))
    target = at(overlay, row["sourceGoalPointer"])
    for field, change in row["fieldDeltas"].items():
        expect(field in ("sourceSpan", "sourceRef"), f"Unexpected locator field: {field}")
        expect(goal[field] == change["before"], f"Locator before differs: {row['sourceGoalId']} {field}")
        target[field] = change["afterCandidate"]
    expect(row["reviewStatusMutation"] is False, f"Locator promotes review status: {row['sourceGoalId']}")
    locator_rows.append({"sourceGoalId": row["sourceGoalId"], "printedPage": row["printedPageAfterCandidate"],
                         "physicalPdfPage": row["pdfPageAfterCandidate"], "changedFields": list(row["fieldDeltas"]),
                         "sourceTextRetainedAsHistoricalInputOnly": True})
unchanged_source_rows = 0
for path, overlay in source_overlays.items():
    original = read(ROOT / path)
    changed = {r["sourceGoalId"] for r in locator["deltas"] if r["sourcePath"] == path}
    for before, after in zip(original["sourceGoals"], overlay["sourceGoals"]):
        if before["id"] not in changed:
            expect(before == after, f"Unrelated source goal changed: {before['id']}")
            unchanged_source_rows += 1
expect(len(locator_rows) == 7, "Expected seven narrow locator corrections")

components = read(AUTHOR / "component-source-binding.delta.candidates.json")
canonical = read(ROOT / inputs["canonicalPath"])
goals = {g["id"]: g for g in canonical["goals"]}
additions = []
for row in components["mappingAdditions"]:
    mapping = read(ROOT / row["mappingPath"])
    expect(digest(ROOT / row["mappingPath"]) == row["mappingSha256"], f"Addition mapping changed: {row['sourceGoalId']}")
    extraction = read(ROOT / mapping["sourceExtractionPath"])
    source = next(g for g in extraction["sourceGoals"] if g["id"] == row["sourceGoalId"])
    if "sourceGoalBefore" in row:
        expect(source == row["sourceGoalBefore"], f"Addition source snapshot differs: {row['sourceGoalId']}")
    edge = row["edgeAfterCandidate"]
    expect(edge["legacyGoalId"] == source["id"] and edge["canonicalGoalId"] in goals,
           f"Missing source or target: {source['id']}")
    expect(edge["matchType"] == "partial" and edge["canonicalGoalId"] not in children,
           f"Broad child/source promotion: {source['id']}")
    expect(not any(x["legacyGoalId"] == edge["legacyGoalId"] and x["canonicalGoalId"] == edge["canonicalGoalId"]
                   for x in mapping["mappings"]), f"Duplicate mapping edge: {source['id']}")
    decisions_exist = any(x.get("id") == edge["reviewDecisionId"] for x in mapping["decisions"])
    additions.append({"sourceGoalId": source["id"], "canonicalGoalId": edge["canonicalGoalId"],
                      "matchType": "partial", "currentDecisionAlreadyExists": decisions_exist,
                      "successorDecisionMaterializationRequired": not decisions_exist})
expect(len(additions) == 3, "Expected three additional component edges")
preserved_edges = []
for row in components["existingTrueComponentExamples"]:
    mapping = read(ROOT / row["mappingPath"])
    extraction = read(ROOT / row["sourcePath"])
    source = next(g for g in extraction["sourceGoals"] if g["id"] == row["legacyGoalId"])
    expect(source == row["sourceGoalBefore"], f"Retained component source differs: {source['id']}")
    for edge in row["existingComponentEdgesBefore"]:
        expect(edge in mapping["mappings"], f"Existing component edge lost: {source['id']}")
    target = row["actualAtomicComponentGoal"]
    expect(all(goals[target["id"]].get(k) == v for k, v in target.items()), f"Retained target description changed: {target['id']}")
    preserved_edges.append({"sourceGoalId": source["id"], "canonicalGoalId": target["id"], "decision": "KEEP_existing_partial_component_only"})

download = read(AUTHOR / "live-official-fetch.receipt.json")
documents = {d["key"]: d for d in download["documents"]}
for doc in documents.values():
    expect(digest(doc["localPdfCache"]) == doc["sha256"], f"Actual downloaded PDF changed: {doc['key']}")
fragments = read(AUTHOR / "selected-current-source-fragments.candidates.json")
fragment_rows = []
for row in fragments["fragments"]:
    doc = documents[row["sourceDocumentKey"]]
    expect(row["sourceSha256"] == doc["sha256"], f"New fragment PDF binding differs: {row['candidateSourceId']}")
    actual = subprocess.check_output(["pdftotext", "-layout", "-f", str(row["pdfPage"]), "-l", str(row["pdfPage"]), doc["localPdfCache"], "-"], text=True)
    expect(row["shortExactQuote"] in " ".join(actual.split()), f"New fragment quote absent: {row['candidateSourceId']}")
    expect(row["childBindingCandidate"] is None and row["matchTypeCandidate"] == "partial", f"New fragment overclaims child: {row['candidateSourceId']}")
    fragment_rows.append({"candidateSourceId": row["candidateSourceId"], "sourceDocumentKey": row["sourceDocumentKey"],
                          "actualPdfBytesChecked": True, "actualSelectedPageTextRead": True,
                          "printedPage": row["printedPage"], "physicalPdfPage": row["pdfPage"],
                          "onlyPartialExistingComponentBinding": True})

receipt = {"schemaVersion": 1, "checkedAtUtc": datetime.now(timezone.utc).isoformat(),
           "independentReviewer": "codex-chemie-8ceb-split-review-a",
           "status": "PASS_bounded_structure_with_substantive_source_operator_HOLD" if not errors else "FAIL",
           "frozenDUnchanged": digest(OWN / freeze["file"]) == freeze["sha256"],
           "frozenDSha256": freeze["sha256"], "sixStateEntriesReviewed": len(selected),
           "wholePreservedEntryCount": len(base_by_key), "otherEntriesAlreadyCheckedInFrozenD": len(base_by_key) - len(selected),
           "exactLocatorDeltas": locator_rows, "unchangedSourceGoalRowsInLocatorOverlay": unchanged_source_rows,
           "additionalPartialEdges": additions, "preservedExistingComponentEdges": preserved_edges,
           "selectedCurrentFragments": fragment_rows, "allElevenAuthorDownloadedPdfHashesIndependentlyChecked": True,
           "newCompletePlanApproval": False, "fullOtherGoalsReviewRestarted": False,
           "technicalBindingChecksDoNotResolveSourceOperatorFinding": "MV016 actual source says erläutern; historical normalized sourceText says beurteilen.",
           "activeWrites": [], "strictClosures": 0, "humanApprovals": 0, "errors": errors}
output = OWN / "six-state-continuation-check.receipt.json"
if not output.exists():
    output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"status": receipt["status"], "entries": len(selected), "locators": len(locator_rows),
                  "additionalPartialEdges": len(additions), "preservedEdges": len(preserved_edges),
                  "fragments": len(fragment_rows), "errors": errors}, ensure_ascii=False))
raise SystemExit(bool(errors))
