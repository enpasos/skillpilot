#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay the reviewed German semantic changes and subsequent normalization.

Reads pinned Git inputs and adjacent review manifests; never applies changes to
the active curriculum. Optional outputs contain the hypothetical final source
and its independently computed proof. Requires only Python's standard library.
"""
import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import verify_german_minimality_review as graph

BASE = "be07d93e9357a8405a892b354c1eefaa3442568e"
OWNER = "67bd301b-e11a-582d-94ba-4f4b1a4cefff"
TERMINAL = OWNER + ":886ffd34-44f6-5daa-4451-d21dd846a53a"


def reviewed_deltas(keys, before, after, kind="Goal"):
    def names(bits):
        return sorted(key.split(":", 1)[1] for index, key in enumerate(keys)
                      if bits & (1 << index))
    return {key.split(":", 1)[1]: {
        f"lost{kind}Prerequisites": names(old & ~new),
        f"added{kind}Prerequisites": names(new & ~old),
    } for key, old, new in zip(keys, before, after) if old != new}


def verify(root):
    here = Path(__file__).resolve().parent
    proposal_path = here / "german-held-prerequisites-repair-proposal-2026-11-06.json"
    review_path = here / "german-terminal-normalization-review-2026-11-06.json"
    proposal = json.loads(proposal_path.read_bytes())
    review = json.loads(review_path.read_bytes())
    follow_up = review["followUpReview"]
    graph.require(graph.sha256(proposal_path.read_bytes()) ==
                  follow_up["reviewedSemanticProposal"]["sha256"], "Stale independent review")
    source_files = subprocess.check_output([
        "git", "-C", str(root), "ls-tree", "-r", "--name-only", BASE,
        "curricula/DE/Gymnasium/canonical",
    ], text=True).splitlines()
    documents, sources = [], []
    for path in source_files:
        if not path.endswith(".de.json") or "_deck" in path:
            continue
        raw = subprocess.check_output(["git", "-C", str(root), "show", BASE + ":" + path])
        documents.append(json.loads(raw))
        sources.append({"sourceFile": path, "sha256": graph.sha256(raw)})
    graph.require(len(documents) == 21, "Unexpected canonical catalog")
    original = next(doc for doc in documents if doc["landscapeId"] == OWNER)
    original = copy.deepcopy(original)
    source = next(s for s in sources if s["sourceFile"] == proposal["sourceFile"])
    graph.require(source["sha256"] == proposal["sourceBaselineSha256"], "Wrong reviewed source")
    catalog = graph.Catalog(documents)
    before_effective, _ = catalog.effective()
    before_goal, goal_cycles = graph.closure(catalog.keys, before_effective)
    before_atomic, atom_cycles = graph.closure(catalog.atom_keys, catalog.atomic(before_effective))
    operations = proposal["operations"]
    graph.require(len(operations) == len({op["guardGoalId"] for op in operations}) == 68,
                  "Unexpected or repeated semantic operations")
    document = next(doc for doc in documents if doc["landscapeId"] == OWNER)
    for op in operations:
        parts = op["path"].split("/")
        graph.require(parts[1] == "goals" and parts[3:] == ["requires"], "Non-requires patch")
        goal = document["goals"][int(parts[2])]
        graph.require(goal["id"] == op["guardGoalId"] and
                      goal.get("requires") == op["guardRequiresBefore"] and
                      graph.sha256(graph.stable(goal)) == op["guardGoalCanonicalJsonSha256"],
                      "Semantic operation guard mismatch")
        goal["requires"] = op["value"]
    catalog = graph.Catalog(documents)
    semantic_effective, _ = catalog.effective()
    semantic_goal, after_goal_cycles = graph.closure(catalog.keys, semantic_effective)
    semantic_atomic, after_atom_cycles = graph.closure(catalog.atom_keys, catalog.atomic(semantic_effective))
    goal_deltas = reviewed_deltas(catalog.keys, before_goal, semantic_goal)
    expected = {d["goalId"]: {key: sorted(d[key]) for key in
                ["lostGoalPrerequisites", "addedGoalPrerequisites"]}
                for d in proposal["localHypotheticalValidation"]["intendedClosureChanges"]}
    graph.require(goal_deltas == expected and len(goal_deltas) == 84,
                  "Global semantic deltas exceed the individually reviewed changes")
    atomic_deltas = reviewed_deltas(catalog.atom_keys, before_atomic, semantic_atomic, "Atomic")
    expected_atomic = {d["goalId"]: {key: sorted(d[key]) for key in
                       ["lostAtomicPrerequisites", "addedAtomicPrerequisites"]}
                       for d in proposal["localHypotheticalValidation"]["intendedAtomicClosureChanges"]}
    graph.require(atomic_deltas == expected_atomic and len(atomic_deltas) == 99,
                  "Global atomic deltas exceed the individually reviewed changes")
    graph.require((goal_cycles, atom_cycles) == (after_goal_cycles, after_atom_cycles),
                  "Semantic correction changed unrelated global cyclic components")
    graph.require(before_goal[catalog.keys.index(TERMINAL)] == semantic_goal[catalog.keys.index(TERMINAL)]
                  and before_atomic[catalog.atom_keys.index(TERMINAL)] ==
                  semantic_atomic[catalog.atom_keys.index(TERMINAL)], "Changed full assessment demand")
    semantic_source_sha = graph.sha256((json.dumps(document, ensure_ascii=False, indent=2) + "\n").encode())
    approved = {case["removedPrerequisiteGoalId"] for case in review["cases"]
                if case["decision"] == "approve-terminal-normalization-conditional"}
    approved.update(case["removedPrerequisiteGoalId"] for case in follow_up["changedWitnessReviews"]
                    if case["decision"] == "approve-terminal-normalization-conditional")
    graph.require(len(approved) == follow_up["remainingTerminalCases"] == 41,
                  "Unexpected independent terminal approvals")
    steps = []
    for target_id in sorted(approved):
        target = OWNER + ":" + target_id
        catalog.remove_origin(TERMINAL, target)
        effective, _ = catalog.effective()
        path = graph.witness(effective, TERMINAL, target)
        graph.require(path is not None, "Missing alternative witness after origin removal")
        now_goal, _ = graph.closure(catalog.keys, effective)
        now_atomic, _ = graph.closure(catalog.atom_keys, catalog.atomic(effective))
        graph.require(now_goal == semantic_goal and now_atomic == semantic_atomic,
                      "Normalization changed complete global demand")
        steps.append({"source": TERMINAL, "prerequisite": target, "survivingWitness": path})
    for old, new in zip(original["goals"], document["goals"]):
        old, new = dict(old), dict(new)
        old.pop("requires", None)
        new.pop("requires", None)
        graph.require(old == new, "A non-requires field changed")
    final_bytes = (json.dumps(document, ensure_ascii=False, indent=2) + "\n").encode()
    proof = {
        "schemaVersion": 1, "status": "verified-hypothesis-not-applied", "humanApproval": False,
        "verifierSha256": graph.sha256(Path(__file__).read_bytes()),
        "graphHelperSha256": graph.sha256(Path(graph.__file__).read_bytes()),
        "baseCommit": BASE, "sourceFile": proposal["sourceFile"], "catalogSources": sources,
        "semanticProposalSha256": graph.sha256(proposal_path.read_bytes()),
        "independentReviewSha256": graph.sha256(review_path.read_bytes()),
        "beforeSourceSha256": source["sha256"], "afterSemanticSourceSha256": semantic_source_sha,
        "afterSourceSha256": graph.sha256(final_bytes), "semanticOperations": 68,
        "individuallyReviewedChangedGoalClosures": 84, "changedAtomicClosures": 99,
        "wholeAssessmentGoalAndAtomicDemandUnchanged": True,
        "normalizationOperations": steps, "globalGoalAndAtomicClosureEqualAfterEveryNormalization": True,
        "allNonRequiresFieldsUnchanged": True,
        "existingUnrelatedGlobalGoalCyclicComponents": goal_cycles,
        "existingUnrelatedGlobalAtomicCyclicComponents": atom_cycles,
        "unrelatedCyclesAcceptedAsValid": False,
    }
    return final_bytes, proof


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument("--output-candidate", type=Path)
    parser.add_argument("--output-proof", type=Path)
    args = parser.parse_args()
    try:
        graph.self_test()
        source, proof = verify(args.repo_root.resolve())
        if args.output_candidate:
            args.output_candidate.write_bytes(source)
        if args.output_proof:
            args.output_proof.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + "\n")
        print(json.dumps({key: value for key, value in proof.items()
                          if key not in {"catalogSources", "normalizationOperations"}}, indent=2))
        return 0
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error)}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
