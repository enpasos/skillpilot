#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay reviewed preparation corrections against fixed actual catalog bytes.

Uses the existing shared audit graph model. Never writes curricula or reviews.
Semantic demand changes must equal the complete individually reviewed lists.
"""
import argparse
import copy
import json
from pathlib import Path
import re
import subprocess
import sys

sys.dont_write_bytecode = True
import verify_german_minimality_review as graph

BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
FOUND = BASE / "informatics-foundation-prerequisite-repair-proposal-2026-11-06.json"
DFS = BASE / "informatics-dfs-foundation-repair-proposal-2026-11-06.json"


def deltas(keys, before, after):
    def members(bits):
        return [key for index, key in enumerate(keys) if bits & (1 << index)]
    return [{"sourceKey": key, "removed": members(old & ~new),
             "added": members(new & ~old)}
            for key, old, new in zip(keys, before, after) if old != new]


def relations(documents):
    catalog = graph.Catalog(documents)
    effective, _ = catalog.effective()
    goals, goal_cycles = graph.closure(catalog.keys, effective)
    atoms, atom_cycles = graph.closure(catalog.atom_keys, catalog.atomic(effective))
    return catalog, goals, atoms, (goal_cycles, atom_cycles)


def verify(base_commit, include_dfs=False, verify_active=False, german_follow_up=False):
    require = graph.require
    require(re.fullmatch(r"[0-9a-f]{40}", base_commit), "An exact Git snapshot is required")
    foundation = json.loads(FOUND.read_bytes())
    source = foundation["source"]
    snapshots = foundation["globalHypothesis"]["catalogSources"]
    documents, original_raw = [], {}
    for entry in snapshots:
        path = entry["path"]
        raw = subprocess.check_output(["git", "-C", str(ROOT), "show", base_commit + ":" + path])
        require(graph.sha256(raw) == entry["sha256"], "Original catalog pin differs: " + path)
        original_raw[path] = raw
        documents.append(json.loads(raw))
    require(graph.sha256(original_raw[source["path"]]) == source["sha256"], "Foundation source pin differs")
    original = next(document for document in documents if document["landscapeId"] == source["landscapeId"])
    candidates = {source["path"]: copy.deepcopy(original)}
    changed_owners = {source["landscapeId"]}
    operations = list(foundation["operations"])
    expected_goals = list(foundation["globalHypothesis"]["globalGoalDeltas"])
    expected_atoms = list(foundation["globalHypothesis"]["globalAtomicDeltas"])
    proposals = [{"path": str(FOUND.relative_to(ROOT)), "sha256": graph.sha256(FOUND.read_bytes())}]
    if include_dfs:
        dfs = json.loads(DFS.read_bytes())
        require(dfs["source"] == source, "Independent DFS proposal uses another source")
        operations.append(dfs["operation"])
        standalone = next(row for row in dfs["scenarios"] if row["label"] == "standalone")
        for expected, extra in [(expected_goals, standalone["globalGoalDeltas"]),
                                (expected_atoms, standalone["globalAtomicDeltas"])]:
            require(not {row["sourceKey"] for row in expected} & {row["sourceKey"] for row in extra},
                    "Overlapping demand effects need an explicitly recomposed content review")
            expected.extend(extra)
        proposals.append({"path": str(DFS.relative_to(ROOT)), "sha256": graph.sha256(DFS.read_bytes())})
    if german_follow_up:
        german_path = BASE / "german-phase-foundation-repair-proposal-2026-11-06.json"
        german = json.loads(german_path.read_bytes())
        german_source = german["source"]
        require(graph.sha256(original_raw[german_source["path"]]) == german_source["sha256"],
                "German source pin differs")
        candidates[german_source["path"]] = json.loads(original_raw[german_source["path"]])
        changed_owners.add(german_source["landscapeId"])
        operations.extend(german["operations"])
        for expected, extra in [(expected_goals, german["globalHypothesis"]["globalGoalDeltas"]),
                                (expected_atoms, german["globalHypothesis"]["globalAtomicDeltas"])]:
            require(not {row["sourceKey"] for row in expected} & {row["sourceKey"] for row in extra},
                    "Interacting subject changes require a new composition review")
            expected.extend({key: row[key] for key in ("sourceKey", "removed", "added")} for row in extra)
        proposals.append({"path": str(german_path.relative_to(ROOT)),
                          "sha256": graph.sha256(german_path.read_bytes())})
    authors = set()
    allowed_fields = {}
    for operation in operations:
        match = re.fullmatch(r"/goals/(\d+)/(requires|applicability)", operation["path"])
        require(operation["op"] == "replace" and match is not None
                and operation["file"] in candidates, "Only a reviewed field may change")
        field = match.group(2)
        goal = candidates[operation["file"]]["goals"][int(match.group(1))]
        guard = "guardRequiresBefore" if field == "requires" else "guardApplicabilityBefore"
        require(goal["id"] == operation["guardGoalId"]
                and graph.sha256(graph.stable(goal)) == operation["guardGoalCanonicalSha256"]
                and goal[field] == operation[guard], "Full goal/field guard differs")
        identity = (operation["file"], goal["id"], field)
        require(identity not in authors, "Duplicate field operation")
        authors.add(identity)
        allowed_fields.setdefault((operation["file"], goal["id"]), set()).add(field)
        goal[field] = operation["value"]
    for path, candidate in candidates.items():
        for before, after in zip(json.loads(original_raw[path])["goals"], candidate["goals"]):
            allowed = allowed_fields.get((path, before["id"]), set())
            require({key: value for key, value in before.items() if key not in allowed}
                    == {key: value for key, value in after.items() if key not in allowed},
                    "An unrelated field changed")
    before_catalog, before_goals, before_atoms, before_cycles = relations(copy.deepcopy(documents))
    by_owner = {candidate["landscapeId"]: candidate for candidate in candidates.values()}
    after_documents = [by_owner.get(document["landscapeId"], document) for document in documents]
    after_catalog, after_goals, after_atoms, after_cycles = relations(after_documents)
    require(before_catalog.keys == after_catalog.keys and before_catalog.atom_keys == after_catalog.atom_keys,
            "Goal identities or atomicity changed")
    goal_changes = deltas(before_catalog.keys, before_goals, after_goals)
    atom_changes = deltas(before_catalog.atom_keys, before_atoms, after_atoms)
    require(goal_changes == sorted(expected_goals, key=lambda row: row["sourceKey"]),
            "Complete actual Goal demand changes differ from the reviewed endpoint lists")
    require(atom_changes == sorted(expected_atoms, key=lambda row: row["sourceKey"]),
            "Complete actual Atomic demand changes differ from the reviewed endpoint lists")
    require(before_cycles == after_cycles, "Cyclic component count changed")
    for keys, closures in [(after_catalog.keys, after_goals), (after_catalog.atom_keys, after_atoms)]:
        require(not any(key.split(":", 1)[0] in changed_owners and bits & (1 << index)
                        for index, (key, bits) in enumerate(zip(keys, closures))),
                "A changed subject participates in a cyclic component")
    require(all(row["sourceKey"].split(":", 1)[0] in changed_owners
                for row in goal_changes + atom_changes), "Foreign demand changed")
    if verify_active:
        for path, candidate in candidates.items():
            require(json.loads((ROOT / path).read_bytes()) == candidate,
                    "Active source differs from the reviewed complete candidate: " + path)
    return {"schemaVersion": 1, "status": "PASS-complete-reviewed-demand-deltas",
            "readOnly": True, "sourceBaseCommit": base_commit, "proposals": proposals,
            "source": source, "catalogSources": snapshots,
            "graphHelper": {"path": str(Path(graph.__file__).relative_to(ROOT)),
                            "sha256": graph.sha256(Path(graph.__file__).read_bytes())},
            "verifierSha256": graph.sha256(Path(__file__).read_bytes()),
            "fieldOperations": len(operations),
            "requiresArrays": sum(op["path"].endswith("/requires") for op in operations),
            "changedGoalSources": len(goal_changes),
            "changedAtomicSources": len(atom_changes),
            "globalGoalDeltas": goal_changes, "globalAtomicDeltas": atom_changes,
            "removedGoalDemandPairs": sum(len(row["removed"]) for row in goal_changes),
            "addedGoalDemandPairs": sum(len(row["added"]) for row in goal_changes),
            "removedAtomicDemandPairs": sum(len(row["removed"]) for row in atom_changes),
            "addedAtomicDemandPairs": sum(len(row["added"]) for row in atom_changes),
            "unrelatedFieldsUnchanged": True, "foreignDemandChanges": 0,
            "existingUnrelatedCyclicComponents": list(after_cycles),
            "includeDfs": include_dfs, "activeCandidateCompared": verify_active,
            "germanFollowUp": german_follow_up,
            "otherCatalogInputs": "Fixed original Git snapshot; later foreign changes require their own composed proof",
            "humanApproval": False, "qaReleaseClaimed": False, "masteryWritten": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-commit", required=True)
    parser.add_argument("--include-dfs", action="store_true")
    parser.add_argument("--verify-active", action="store_true")
    parser.add_argument("--german-follow-up", action="store_true")
    args = parser.parse_args()
    try:
        print(json.dumps(verify(args.base_commit, args.include_dfs, args.verify_active, args.german_follow_up),
                         ensure_ascii=False, indent=2))
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        raise SystemExit(str(error)) from error


if __name__ == "__main__":
    main()
