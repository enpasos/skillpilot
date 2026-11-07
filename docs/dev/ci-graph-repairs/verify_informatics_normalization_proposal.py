#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of the bounded Informatik requires-only proposal.

The Informatik input is byte-pinned. Other catalog inputs are loaded from the
current workspace and reported with their actual hashes: changed unrelated
sources require a fresh global proof, not a fabricated historical match.
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import verify_german_minimality_review as graph


def verify(root, base_commit=None, verify_active=False):
    manifest_path = Path(__file__).with_name(
        "informatics-prerequisite-normalization-proposal-2026-11-06.json")
    manifest = json.loads(manifest_path.read_bytes())
    require = graph.require
    require(base_commit is None or re.fullmatch(r"[0-9a-f]{40}", base_commit),
            "Expected an exact source commit")
    def read_source(path):
        return ((root / path).read_bytes() if base_commit is None else
                subprocess.check_output(["git", "-C", str(root), "show", base_commit + ":" + path]))
    source_path = root / manifest["sourceFile"]
    source_bytes = read_source(manifest["sourceFile"])
    require(graph.sha256(source_bytes) == manifest["sourceSha256"],
            "Informatik source SHA changed; review/rebase explicitly")
    original = json.loads(source_bytes)
    original_by_id = {goal["id"]: goal for goal in original["goals"]}
    snapshots = []
    documents = []
    for entry in manifest["verification"]["currentCatalogSourceSnapshot"]:
        raw = read_source(entry["path"])
        snapshots.append({"path": entry["path"], "sha256": graph.sha256(raw)})
        documents.append(json.loads(raw))
    catalog = graph.Catalog(documents)
    effective_before, _ = catalog.effective()
    atomic_before = catalog.atomic(effective_before)
    raw_before = {key: catalog.authored[key] & set(catalog.atom_keys)
                  for key in catalog.atom_keys}
    goal_closure, goal_cycles = graph.closure(catalog.keys, effective_before)
    atomic_closure, atomic_cycles = graph.closure(catalog.keys, atomic_before)
    raw_closure, _ = graph.closure(catalog.keys, raw_before)
    owner = manifest["landscapeId"]
    seen = set()
    for case in manifest["cases"]:
        source = owner + ":" + case["sourceGoalId"]
        target = owner + ":" + case["removedPrerequisiteGoalId"]
        require((source, target) not in seen, "Duplicate removal")
        seen.add((source, target))
        if case["kind"] == "inherited_duplicate":
            cover = owner + ":" + case["coveringOriginGoalId"]
            require(catalog.is_ancestor(cover, source) and target in catalog.authored[cover],
                    "Missing retained inherited cover")
            catalog.validate_path(catalog.contains, case["containsPath"])
        catalog.remove_origin(source, target)
        effective, _ = catalog.effective()
        atomic = catalog.atomic(effective)
        if case["kind"] == "inherited_duplicate":
            require(effective == effective_before and atomic == atomic_before,
                    "G16 changed effective or atomic adjacency")
        else:
            catalog.validate_path(effective, case["sequentialWitness"])
            require(case["sequentialWitness"][0] == source
                    and case["sequentialWitness"][-1] == target
                    and len(case["sequentialWitness"]) > 2, "Invalid G17 witness endpoints")
        require(graph.closure(catalog.keys, effective)[0] == goal_closure,
                "Global Goal-node closure changed: " + case["caseId"])
        require(graph.closure(catalog.keys, atomic)[0] == atomic_closure,
                "Global atomic closure changed: " + case["caseId"])
        raw = {key: catalog.authored[key] & set(catalog.atom_keys)
               for key in catalog.atom_keys}
        require(graph.closure(catalog.keys, raw)[0] == raw_closure,
                "Authored atomic route closure changed: " + case["caseId"])
    final, origins = catalog.effective()
    for case in manifest["cases"]:
        if case["kind"] == "inherited_duplicate":
            require(owner + ":" + case["removedPrerequisiteGoalId"]
                    in catalog.authored[owner + ":" + case["coveringOriginGoalId"]],
                    "Final inherited cover removed")
        else:
            catalog.validate_path(final, case["finalWitness"])
            for hop in case["finalWitnessOrigins"]:
                require(hop["to"] in catalog.authored[hop["authoredOrigin"]]
                        and (hop["authoredOrigin"] == hop["from"]
                             or catalog.is_ancestor(hop["authoredOrigin"], hop["from"])),
                        "Final witness origin missing")
    changed = set()
    for operation in manifest["operations"]:
        goal_id = operation["guardGoalId"]
        before = original_by_id[goal_id]
        index = int(operation["path"].split("/")[2])
        require(operation["op"] == "replace"
                and operation["path"] == f"/goals/{index}/requires"
                and original["goals"][index]["id"] == goal_id, "Patch address mismatch")
        require(before.get("requires", []) == operation["guardRequiresBefore"]
                and graph.sha256(graph.stable(before)) == operation["guardGoalSha256"]
                and graph.sha256(graph.stable(before.get("examData")))
                == operation["guardExamDataSha256"], "Patch old-value guard mismatch")
        after = catalog.nodes[owner + ":" + goal_id][1]
        require(after["requires"] == operation["value"], "Final requires differs from proposal")
        require({k: v for k, v in before.items() if k != "requires"}
                == {k: v for k, v in after.items() if k != "requires"},
                "A non-requires field changed")
        changed.add(goal_id)
    require(len(changed) == 9 and len(seen) == 32, "Unexpected proposal size")
    require(changed == {case["sourceGoalId"] for case in manifest["cases"]},
            "Operations and removal authors differ")
    require(manifest["summary"]["inheritedOriginRemovals"] == 22
            and manifest["summary"]["transitiveOriginRemovals"] == 10
            and manifest["summary"]["totalOriginRemovals"] == 32,
            "Summary differs from the reviewed32 proposal")
    require(len(manifest["deferredCases"]) == 1
            and manifest["deferredCases"][0]["caseId"] == "INFO-G17-056",
            "Missing independent-review hold")
    held = manifest["deferredCases"][0]
    require(owner + ":" + held["removedPrerequisiteGoalId"]
            in catalog.authored[owner + ":" + held["sourceGoalId"]],
            "The held DFS/BFS origin was silently removed")
    require(all("INFO-G17-056" not in operation["caseIds"]
                and set(operation["caseIds"]) == {
                    case["caseId"] for case in manifest["cases"]
                    if case["sourceGoalId"] == operation["guardGoalId"]}
                for operation in manifest["operations"]),
            "Operation case IDs include a held or undeclared removal")
    if verify_active:
        require(base_commit is not None, "Active comparison needs a fixed original Git snapshot")
        final_document = next(doc for doc in documents if doc["landscapeId"] == owner)
        require(json.loads(source_path.read_bytes()) == final_document,
                "Active source differs from the fully replayed candidate")
    return {"status": "PASS", "readOnly": True, "taskAdequacyApproved": False,
            "humanApproval": False, "proposalSha256": graph.sha256(manifest_path.read_bytes()),
            "arrayChanges": len(changed), "sequentialOriginRemovals": len(seen),
            "independentReviewHoldsRetained": ["INFO-G17-056"],
            "effectiveAndAtomicAdjacencyEqualAfterEachG16": True,
            "goalAtomicAndAuthoredAtomicClosuresEqualAfterEveryRemoval": True,
            "existingUnrelatedEffectiveCyclicComponents": goal_cycles,
            "existingUnrelatedAtomicCyclicComponents": atomic_cycles,
            "sourceBaseCommit": base_commit, "activeCandidateCompared": verify_active,
            "currentCatalogSources": snapshots}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-commit")
    parser.add_argument("--verify-active", action="store_true")
    args = parser.parse_args()
    try:
        print(json.dumps(verify(Path(__file__).resolve().parents[3], args.base_commit, args.verify_active), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error)}), file=sys.stderr)
        sys.exit(1)
