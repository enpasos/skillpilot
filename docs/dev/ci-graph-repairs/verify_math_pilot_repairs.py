#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay the two reviewed Math proposals on the complete canonical catalog.

Reads a fixed Git snapshot and the adjacent proposals. No active curriculum,
review ledger or learner state is written. Optional outputs are hypothetical.
Local reviewed deltas are checked exactly; extra cross-subject effects remain
explicit review obligations, never inferred approvals.
"""
import argparse
import copy
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.dont_write_bytecode = True
import verify_german_minimality_review as graph

BASE = "42e62121a991e29c108b85a1ffa81f50ff1a5e63"
OWNER = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced"
SOURCE = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"


def deltas(keys, before, after):
    def members(bits):
        return [key for index, key in enumerate(keys) if bits & (1 << index)]
    return [{"sourceKey": key, "removed": members(old & ~new),
             "added": members(new & ~old)}
            for key, old, new in zip(keys, before, after) if old != new]


def relations(documents):
    catalog = graph.Catalog(documents)
    effective, _ = catalog.effective()
    goal_closure, goal_cycles = graph.closure(catalog.keys, effective)
    atomic_closure, atomic_cycles = graph.closure(catalog.atom_keys, catalog.atomic(effective))
    for keys, values in [(catalog.keys, goal_closure), (catalog.atom_keys, atomic_closure)]:
        graph.require(not any(key.startswith(OWNER + ":") and bits & (1 << index)
                              for index, (key, bits) in enumerate(zip(keys, values))),
                      "Math participates in a global cyclic component")
    return catalog, effective, goal_closure, atomic_closure, (goal_cycles, atomic_cycles)


def apply_operation(document, operation):
    graph.require(operation["operation"] == "replace", "Unexpected operation")
    match = re.fullmatch(r"/goals/(\d+)/requires", operation["path"])
    graph.require(match is not None, "Only a declared requires array can change")
    goal = document["goals"][int(match.group(1))]
    graph.require(goal["id"] == operation["guardGoalId"]
                  and goal.get("requires") == operation["guardRequiresBefore"]
                  and graph.sha256(graph.stable(goal)) == operation["guardGoalCanonicalJsonSha256"],
                  "Operation guard mismatch: " + operation["operationId"])
    graph.require(isinstance(operation["value"], list)
                  and all(isinstance(value, str) and value for value in operation["value"])
                  and len(operation["value"]) == len(set(operation["value"])),
                  "Invalid or duplicate endpoint")
    goal["requires"] = list(operation["value"])


def run_scenario(originals, proposals, label):
    documents = copy.deepcopy(originals)
    document = next(doc for doc in documents if doc["landscapeId"] == OWNER)
    original_document = copy.deepcopy(document)
    catalog, _, before_goal, before_atomic, original_cycles = relations(documents)
    semantic = [op for proposal in proposals for op in proposal["operations"]
                if op["stage"] == "semantic-correction"]
    normalization = [op for proposal in proposals for op in proposal["operations"]
                     if op["stage"] == "closure-preserving-normalization"]
    graph.require(len(semantic) + len(normalization) == sum(len(p["operations"]) for p in proposals),
                  "Unknown operation stage")
    for operation in semantic:
        apply_operation(document, operation)
    catalog, _, semantic_goal, semantic_atomic, semantic_cycles = relations(documents)
    graph.require(semantic_cycles == original_cycles, "Changed unrelated cyclic components")
    goal_changes = deltas(catalog.keys, before_goal, semantic_goal)
    atomic_changes = deltas(catalog.atom_keys, before_atomic, semantic_atomic)
    if len(proposals) == 1:
        validation = proposals[0]["localHypotheticalValidation"]
        goal_key = "semanticCorrectionGoalClosureChanges" if label == "memory" else "semanticGoalClosureChanges"
        atomic_key = "semanticCorrectionAtomicClosureChanges" if label == "memory" else "semanticAtomicClosureChanges"
        for actual, expected in [(goal_changes, validation[goal_key]), (atomic_changes, validation[atomic_key])]:
            local = [row for row in actual if row["sourceKey"].startswith(OWNER + ":")]
            graph.require(local == expected, "Global Math deltas differ from the individual proposal: " + label)
    steps = []
    for operation in normalization:
        previous = list(operation["guardRequiresBefore"])
        graph.require(set(operation["value"]) < set(previous)
                      and len(previous) - len(operation["value"]) == 1,
                      "A normalization must remove exactly one authored origin")
        target_id = next(value for value in previous if value not in operation["value"])
        apply_operation(document, operation)
        catalog, effective, now_goal, now_atomic, now_cycles = relations(documents)
        graph.require(now_goal == semantic_goal and now_atomic == semantic_atomic
                      and now_cycles == original_cycles,
                      "Normalization changed complete global demand: " + operation["operationId"])
        source_key = OWNER + ":" + operation["guardGoalId"]
        target_key = catalog.resolve(target_id, OWNER)
        witness = graph.witness(effective, source_key, target_key)
        graph.require(witness is not None, "No surviving alternative witness")
        steps.append({"operationId": operation["operationId"], "sourceKey": source_key,
                      "removedPrerequisiteKey": target_key, "survivingWitness": witness,
                      "globalGoalAndAtomicClosureEqual": True})
    graph.require(len(original_document["goals"]) == len(document["goals"]), "Changed goal count")
    changed = []
    for before, after in zip(original_document["goals"], document["goals"]):
        if before != after:
            changed.append(before["id"])
        left, right = dict(before), dict(after)
        left.pop("requires", None)
        right.pop("requires", None)
        graph.require(left == right, "Changed a non-requires goal field")
    before_meta, after_meta = dict(original_document), dict(document)
    before_meta.pop("goals"); after_meta.pop("goals")
    graph.require(before_meta == after_meta, "Changed landscape metadata")
    foreign = [row for row in goal_changes if not row["sourceKey"].startswith(OWNER + ":")]
    foreign_atomic = [row for row in atomic_changes if not row["sourceKey"].startswith(OWNER + ":")]
    raw = (json.dumps(document, ensure_ascii=False, indent=2) + "\n").encode()
    return raw, {
        "scenario": label, "sourceSha256": graph.sha256(raw),
        "semanticOperationIds": [op["operationId"] for op in semantic],
        "normalizationSteps": steps, "changedGoalIds": changed,
        "globalGoalClosureChanges": goal_changes,
        "globalAtomicClosureChanges": atomic_changes,
        "crossSubjectChangedGoalClosures": len(foreign),
        "crossSubjectChangedAtomicClosures": len(foreign_atomic),
        "crossSubjectChangesClaimedReviewed": False,
        "allNonRequiresFieldsUnchanged": True,
        "existingUnrelatedGlobalGoalCyclicComponents": original_cycles[0],
        "existingUnrelatedGlobalAtomicCyclicComponents": original_cycles[1],
        "unrelatedCyclesAcceptedAsValid": False,
        "currentQaValidityClaimed": False,
    }


def verify(root):
    here = Path(__file__).resolve().parent
    proposals, bindings = [], []
    approved = [
        ("memory", 5, "c5afb519c5561cac90962f761403bb343e45d2332a1feeee2d87c242a6f7ea04"),
        ("arithmetic", 7, "7181bd8837df7db2dbd1bfb66e71064906810be6478c7ac3fe3b10a9c6e036e1"),
    ]
    for name, expected_count, expected_operations_hash in approved:
        path = here / ("math-" + name + "-prerequisites-repair-proposal-2026-11-06.json")
        raw = path.read_bytes(); proposal = json.loads(raw)
        graph.require(proposal["status"] == "independently-reviewed-proposal-no-application"
                      and proposal["humanApproval"] is False and proposal["independentReview"]
                      and len(proposal["operations"]) == expected_count, "Unreviewed or wrong proposal")
        graph.require(proposal["source"]["path"] == SOURCE
                      and proposal["source"]["landscapeId"] == OWNER, "Wrong proposal owner/source")
        graph.require(graph.sha256(graph.stable(proposal["operations"])) == expected_operations_hash
                      == proposal["independentReview"]["reviewedOperationsCanonicalJsonSha256"],
                      "Operations differ from the independently reviewed bytes")
        proposals.append(proposal)
        bindings.append({"path": str(path.relative_to(root)), "sha256": graph.sha256(raw)})
    files = subprocess.check_output(["git", "-C", str(root), "ls-tree", "-r", "--name-only",
                                     BASE, "curricula/DE/Gymnasium/canonical"], text=True).splitlines()
    documents, sources = [], []
    for path in files:
        if not path.endswith(".de.json") or "_deck" in path:
            continue
        raw = subprocess.check_output(["git", "-C", str(root), "show", BASE + ":" + path])
        documents.append(json.loads(raw)); sources.append({"path": path, "sha256": graph.sha256(raw)})
    graph.require(len(documents) == 21, "Unexpected canonical catalog size")
    source_hash = next(row["sha256"] for row in sources if row["path"] == SOURCE)
    graph.require(all(p["source"]["sha256"] == source_hash for p in proposals), "Stale source proposal")
    results = {}
    for label, selected in [("memory", [proposals[0]]), ("arithmetic", [proposals[1]]), ("combined", proposals)]:
        candidate, proof = run_scenario(documents, selected, label)
        results[label] = proof
    return candidate, {
        "schemaVersion": 1, "status": "verified-global-hypotheses-no-application",
        "baseCommit": BASE, "humanApproval": False, "sourceFile": SOURCE,
        "verifierSha256": graph.sha256(Path(__file__).read_bytes()),
        "graphHelperSha256": graph.sha256(Path(graph.__file__).read_bytes()),
        "catalogSources": sources, "proposalBindings": bindings, "scenarios": results,
        "applied": False, "qaRequalified": False, "milestoneRestorationClaimed": False,
    }


def write_hypothesis(root, path, raw):
    destination = path.resolve()
    if destination.is_relative_to(root):
        graph.require(destination.is_relative_to(root / "tmp"),
                      "Repository outputs are restricted to tmp; no active document may be replaced")
    # Replacing the directory entry also preserves any historical hardlinked inode.
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as temporary:
        temporary.write(raw)
        temporary_path = Path(temporary.name)
    os.replace(temporary_path, destination)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument("--output-candidate", type=Path)
    parser.add_argument("--output-proof", type=Path)
    args = parser.parse_args()
    try:
        graph.self_test()
        root = args.repo_root.resolve()
        candidate, proof = verify(root)
        if args.output_candidate:
            write_hypothesis(root, args.output_candidate, candidate)
        if args.output_proof:
            write_hypothesis(root, args.output_proof,
                             (json.dumps(proof, ensure_ascii=False, indent=2) + "\n").encode())
        print(json.dumps({"status": proof["status"], "baseCommit": BASE,
                          "scenarios": {name: {"changedGoals": len(p["changedGoalIds"]),
                            "goalDeltas": len(p["globalGoalClosureChanges"]),
                            "atomicDeltas": len(p["globalAtomicClosureChanges"]),
                            "normalizations": len(p["normalizationSteps"]),
                            "foreignGoalDeltas": p["crossSubjectChangedGoalClosures"],
                            "foreignAtomicDeltas": p["crossSubjectChangedAtomicClosures"]}
                            for name, p in proof["scenarios"].items()}}, indent=2))
        return 0
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
