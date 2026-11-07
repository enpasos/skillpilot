#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of the 78 named inherited-requirement duplicate proposals.

Uses the adjacent independent graph verifier and the recorded Git catalog.
No source file, review, fingerprint or learner result is modified or approved.
"""

import argparse
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import verify_german_minimality_review as graph_verifier


def verify(repo_root, manifest_path):
    require = graph_verifier.require
    manifest = json.loads(manifest_path.read_bytes())
    require(manifest["humanApproval"] is False and manifest["dataChangesApplied"] == 0,
            "This verifier is only for the unapplied AI proposal")
    graph = graph_verifier.Catalog(graph_verifier.load_catalog(repo_root, manifest))
    before, _ = graph.effective()
    atomic_before = graph.atomic(before)
    goal_closure, goal_cycles = graph_verifier.closure(graph.keys, before)
    atom_closure, atom_cycles = graph_verifier.closure(graph.keys, atomic_before)
    pairs, case_ids = set(), set()
    for case in manifest["cases"]:
        source, target, origin = case["sourceKey"], case["prerequisiteKey"], case["finalCoveringOriginKey"]
        require(case["caseId"] not in case_ids and (source, target) not in pairs, "Repeated proposal")
        case_ids.add(case["caseId"])
        pairs.add((source, target))
        require(target in graph.authored[source], "Missing baseline authored edge")
        require(graph.is_ancestor(origin, source) and target in graph.authored[origin],
                "No authored containment-ancestor cover")
        path = case["finalCoveringContainsPath"]
        require(path[0] == origin and path[-1] == source, "Cover path endpoints mismatch")
        graph.validate_path(graph.contains, path)
    require(pairs, "Empty proposal set")
    for case in manifest["cases"]:
        source, target, origin = case["sourceKey"], case["prerequisiteKey"], case["finalCoveringOriginKey"]
        require((origin, target) not in pairs, "The final covering origin is itself scheduled for removal")
        graph.remove_origin(source, target)
        after, _ = graph.effective()
        require(after == before, "Effective adjacency changed after " + case["caseId"])
        require(graph.atomic(after) == atomic_before, "Atomic adjacency changed after " + case["caseId"])
        require(target in graph.authored[origin], "Covering origin disappeared")
    require(len(pairs) == manifest["summary"]["proposedOriginRemovals"], "Proposal count mismatch")
    goal_hash = graph_verifier.digest_relation(graph.keys, goal_closure, "R_effective+")
    atom_hash = graph_verifier.digest_relation(graph.keys, atom_closure, "R_atomic+")
    expected = manifest["verification"]
    require(goal_hash == expected["effectiveClosureSha256"] and atom_hash == expected["atomicClosureSha256"],
            "Recorded global closure hash mismatch")
    require(graph_verifier.sha256(Path(__file__).read_bytes()) == expected["verifierSha256"],
            "G16 verifier SHA mismatch")
    require(graph_verifier.sha256(Path(graph_verifier.__file__).read_bytes()) == expected["graphHelpersSha256"],
            "Independent graph helper SHA mismatch")
    return {"status": "PASS", "readOnly": True, "humanApproval": False,
            "catalogCommit": manifest["catalogBaseline"]["gitCommit"], "catalogGoals": len(graph.keys),
            "sequentialOriginRemovals": len(pairs), "effectiveAdjacencyEqualAtEveryStep": True,
            "atomicAdjacencyEqualAtEveryStep": True, "allFinalCoveringOriginsRetained": True,
            "effectiveClosureSha256": goal_hash, "atomicClosureSha256": atom_hash,
            "existingUnrelatedGlobalEffectiveCyclicComponents": goal_cycles,
            "existingUnrelatedGlobalAtomicCyclicComponents": atom_cycles,
            "runtimePresentationAndReviewEquivalenceClaimed": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument("--manifest", type=Path,
                        default=Path(__file__).with_name("inherited-duplicate-review-2026-11-06.json"))
    args = parser.parse_args()
    try:
        graph_verifier.self_test()
        print(json.dumps(verify(args.repo_root.resolve(), args.manifest.resolve()), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, TypeError, OSError, graph_verifier.subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "readOnly": True, "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
