#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of the single guarded authentication/log prerequisite proposal.

Recomputes global Goal and Atomic demand from all 21 pinned catalog files.
Checks stored native probe evidence; does not claim to rerun those producers.
No canonical source, QA ledger or learner data is written.
"""

from __future__ import annotations

import copy
import gzip
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "scripts"))
import canonical_goal_identity_migration as canonical  # noqa: E402
import verify_german_minimality_review as graph  # noqa: E402
from verify_informatics_ordinary_prerequisites_hypothesis import (  # noqa: E402
    definition_delta,
    relations,
)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def check(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def bound_bytes(binding: dict) -> bytes:
    raw = (ROOT / binding["path"]).read_bytes()
    check(sha(raw) == binding["sha256"], f"Changed input: {binding['path']}")
    return raw


def main() -> None:
    proposal_path = Path(__file__).with_name(
        "informatics-auth-logs-prerequisite-proposal-2026-11-06.json"
    )
    proposal = json.loads(proposal_path.read_bytes())
    for kernel in proposal["kernels"]:
        bound_bytes(kernel)
    docs = [json.loads(bound_bytes(pin)) for pin in proposal["catalogSources"]]
    check(len(docs) == 21, "Expected the complete pinned 21-catalog universe")
    source = json.loads(bound_bytes(proposal["source"]))
    owner = source["landscapeId"]
    check(len(proposal["operations"]) == 1, "Expected exactly one operation")
    operation = proposal["operations"][0]
    check(operation["path"] == "/goals/114/requires", "Unexpected field path")
    check(operation["op"] == "replace", "Unexpected operation")
    check(operation["file"] == proposal["source"]["path"], "Unexpected owner file")
    goal = source["goals"][114]
    check(goal["id"] == operation["guardGoalId"], "Goal identity guard failed")
    check(sha(canonical.stable(goal)) == operation["guardGoalCanonicalSha256"],
          "Whole goal guard failed")
    check(goal["requires"] == operation["guardRequiresBefore"], "Before array changed")
    check(operation["value"] == ["d848ceb9-cd73-5a13-9407-f3364764c223"],
          "Unexpected preparation replacement")
    candidate = copy.deepcopy(source)
    candidate["goals"][114]["requires"] = operation["value"]
    serialized = (json.dumps(candidate, ensure_ascii=False, indent=2) + "\n").encode()
    check(sha(serialized) == proposal["expectedCandidateSourceSha256"],
          "Candidate serialization mismatch")
    check(sha(canonical.stable(candidate["goals"][114])) ==
          proposal["expectedCandidateGoalCanonicalSha256"], "Candidate goal mismatch")

    before, _, bg, ba, bc = relations(docs)
    after, _, ag, aa, ac = relations([
        candidate if doc["landscapeId"] == owner else doc for doc in docs
    ])
    goal_deltas = definition_delta(before.keys, bg, ag, before)
    atom_deltas = definition_delta(before.atom_keys, ba, aa, before)
    check(goal_deltas == proposal["globalGoalDemandDeltas"], "Goal deltas differ")
    check(atom_deltas == proposal["globalAtomicDemandDeltas"], "Atomic deltas differ")
    check(len(goal_deltas) == 3 and len(atom_deltas) == 4, "Unexpected delta cardinality")
    check(all(not row["added"] for row in goal_deltas + atom_deltas), "New demand")
    check(all(row["sourceKey"].startswith(owner + ":")
              for row in goal_deltas + atom_deltas), "Foreign source affected")
    check(bc == proposal["cyclesBefore"] == [0, 0] and ac == proposal["cyclesAfter"] == [0, 0],
          "Cycle outcome differs")
    for label, keys, rows, name in [
        ("goalClosureBeforeSha256", before.keys, bg, "R_effective+"),
        ("goalClosureAfterSha256", after.keys, ag, "R_effective+"),
        ("atomicClosureBeforeSha256", before.atom_keys, ba, "R_atomic+"),
        ("atomicClosureAfterSha256", after.atom_keys, aa, "R_atomic+"),
    ]:
        check(graph.digest_relation(keys, rows, name) == proposal[label], label)
    terminal = owner + ":49ba66cf-accd-5938-a63e-f031bc786767"
    check(bg[before.keys.index(terminal)] == ag[after.keys.index(terminal)],
          "E terminal Goal demand changed")
    check(ba[before.atom_keys.index(terminal)] == aa[after.atom_keys.index(terminal)],
          "E terminal Atomic demand changed")
    check("ace0c141-9e7c-546e-914f-64c24d42d85d" in after.nodes[terminal][1]["requires"],
          "Direct E terminal SMTP preparation lost")

    evidence = json.loads(gzip.decompress(bound_bytes(proposal["nativeEvidence"])))
    old, new = evidence["baseline"], evidence["candidate"]
    for key in ["scopes", "globalCompiledApplicability", "globalApplicabilityFindings",
                "nativeRoutes", "nativeA", "nativeM", "actualUnchangedTerminalReadiness"]:
        check(old[key] == new[key], "Archived native comparison differs: " + key)
    check(len(old["scopes"]) == 35, "Expected 35 scope results")
    check(old["strictChecks"] == proposal["nativeResults"]["strictBefore"] and
          new["strictChecks"] == proposal["nativeResults"]["strictAfter"],
          "Native integrity result mismatch")
    for capture in evidence["probeSourceCaptures"].values():
        check(sha(capture["text"].encode()) == capture["sha256"], "Probe capture mismatch")
    addendum = json.loads(bound_bytes(proposal["freshContextAddendum"]))
    check(addendum["operation"] == operation, "Context addendum operation mismatch")
    for pin in addendum["originalReviewsUnchanged"] + addendum["materialsRead"]:
        bound_bytes(pin)
    for pin in proposal["sourceAuthority"]["bindings"]:
        bound_bytes(pin)
    code_drift = [path for path, digest in evidence["beforeAndAfterCheckedInputPins"].items()
                  if sha((ROOT / path).read_bytes()) != digest]
    print(json.dumps({
        "status": "pass-read-only-hypothesis-replay-no-application",
        "proposalSha256": sha(proposal_path.read_bytes()),
        "catalogs": len(docs), "goalNodes": len(before.keys),
        "atomicNodes": len(before.atom_keys),
        "goalDemandSourcesChanged": len(goal_deltas),
        "atomicDemandSourcesChanged": len(atom_deltas),
        "foreignSourcesChanged": 0, "goalAndAtomicCyclesBeforeAfter": [bc, ac],
        "eTerminalGoalAndAtomicDemandEqual": True,
        "archivedNativeCommandsExitCodes": [run["exitCode"] for run in evidence["nativeRuns"]],
        "archivedNativeScopeEquality": 35,
        "currentInputsDifferingFromArchivedNativeCapture": code_drift,
        "nativeProducersRerun": False,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
