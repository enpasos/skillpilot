#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize and verify the guarded GK24/E25 draft outside the repository.

There is deliberately no apply command. Existing source, QA, views, code and
learner state are never written. The output contains five private overlay files;
it is not an accepted release or a passing full route gate.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
from verify_informatics_ordinary_prerequisites_hypothesis import relations  # noqa: E402
import verify_german_minimality_review as graph  # noqa: E402


def require(value: bool, message: str) -> None:
    if not value:
        raise ValueError(message)


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def encode(value: object) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def read_bound(binding: dict) -> bytes:
    raw = (ROOT / binding["path"]).read_bytes()
    require(sha(raw) == binding["sha256"], "Changed bound input: " + binding["path"])
    return raw


def relation_sets(keys: list[str], rows: list[int]) -> dict[str, set[str]]:
    result = {}
    for key, bits in zip(keys, rows):
        targets = set()
        while bits:
            low = bits & -bits
            targets.add(keys[low.bit_length() - 1])
            bits ^= low
        result[key] = targets
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-root", required=True, type=Path)
    args = parser.parse_args()
    destination = args.output_root.resolve()
    require(destination != ROOT and ROOT not in destination.parents,
            "Overlay output must be outside the repository")
    require(not destination.exists(), "Output directory must not already exist")
    manifest_path = Path(__file__).with_name(
        "informatics-gk24-e25-integration-overlay-2026-11-06.json"
    )
    manifest = json.loads(manifest_path.read_bytes())
    for kernel in manifest["globalKernels"]:
        read_bound(kernel)
    documents = [json.loads(read_bound(pin)) for pin in manifest["catalogSources"]]
    require(len(documents) == 21, "The complete 21-catalog input is required")
    source = json.loads(read_bound(manifest["source"]))
    source_path = manifest["source"]["path"]
    owner = source["landscapeId"]
    for pin in manifest["boundHistoricalReviews"]:
        read_bound(pin)
    read_bound(manifest["freshContextAddendum"])
    read_bound(manifest["nativeEvidence"])
    files = {source_path: copy.deepcopy(source)}
    for operation in manifest["sourceOperations"]:
        path = operation["file"]
        require(not Path(path).is_absolute() and ".." not in Path(path).parts,
                "Unsafe output path")
        if path not in files:
            files[path] = json.loads(read_bound({
                "path": path, "sha256": operation["guardFileSha256"],
            }))
        document = files[path]
        parts = operation["path"].strip("/").split("/")
        parent = document
        for part in parts[:-1]:
            parent = parent[int(part)] if isinstance(parent, list) else parent[part]
        leaf = parts[-1]
        value = copy.deepcopy(operation.get("value"))
        if "valueFromJsonArtifact" in operation:
            value = json.loads(read_bound(operation["valueFromJsonArtifact"]))
        if "examDataFromJsonArtifact" in operation:
            value["examData"] = json.loads(read_bound(operation["examDataFromJsonArtifact"]))
        if operation["op"] == "replace":
            require(parent["id"] == operation["guardGoalId"], "Wrong guarded goal")
            require(parent[leaf] == operation["guardBefore"], "Wrong before value")
            parent[leaf] = value
        elif operation["op"] == "add":
            if "guardGoalIdAbsent" in operation:
                require(parts == ["goals", "-"], "Unexpected goal append")
                require(not any(g["id"] == operation["guardGoalIdAbsent"]
                                for doc in documents for g in doc["goals"]),
                        "Draft identity already exists in the pinned catalog")
            require(isinstance(parent, list), "Only array insertion is allowed")
            if leaf == "-":
                parent.append(value)
            else:
                parent.insert(int(leaf), value)
        else:
            raise ValueError("Unknown operation")
    output_bytes = {path: encode(document) for path, document in files.items()}
    for expected in manifest["candidateFileBindings"]:
        require(sha(output_bytes[expected["path"]]) == expected["sha256"],
                "Candidate byte mismatch: " + expected["path"])
    code = manifest["codeOverlay"]
    text = read_bound({"path": code["path"], "sha256": code["guardFileSha256"]}).decode()
    for operation in code["replacements"]:
        require(text.count(operation["before"]) == 1, "Ambiguous code insertion")
        text = text.replace(operation["before"], operation["after"])
    output_bytes[code["path"]] = text.encode()
    require(sha(text.encode()) == code["candidateWithoutProbeExportsSha256"],
            "Code overlay mismatch")

    # Recompute on the complete catalog; different node universes are aligned
    # by qualified identity, never by raw bit positions.
    before, _, bg, ba, bc = relations(documents)
    after, effective, ag, aa, ac = relations([
        files[source_path] if doc["landscapeId"] == owner else doc for doc in documents
    ])
    bgs, ags = relation_sets(before.keys, bg), relation_sets(after.keys, ag)
    bas, aas = relation_sets(before.atom_keys, ba), relation_sets(after.atom_keys, aa)
    def deltas(old: dict, new: dict) -> list[dict]:
        return [{"sourceKey": key, "removed": sorted(old[key] - new[key]),
                 "added": sorted(new[key] - old[key])}
                for key in old if old[key] != new[key]]
    proof = manifest["globalPreparationProof"]
    require(deltas(bgs, ags) == proof["existingGoalDemandDeltas"], "Goal deltas differ")
    require(deltas(bas, aas) == proof["existingAtomicDemandDeltas"], "Atomic deltas differ")
    require(bc == proof["cyclesBefore"] == [0, 0] and ac == proof["cyclesAfter"] == [0, 0],
            "Cycle results differ")
    gk = owner + ":" + manifest["draftIdentityStatus"]["newGkEndpoint"]
    require(sorted(ags[gk]) == proof["newGkGoalDemand"], "GK Goal demand differs")
    require(sorted(aas[gk]) == proof["newGkAtomicDemand"], "GK Atomic demand differs")
    for field, keys, values, kind in [
        ("goalClosureBeforeSha256", before.keys, bg, "R_effective+"),
        ("goalClosureAfterSha256", after.keys, ag, "R_effective+"),
        ("atomicClosureBeforeSha256", before.atom_keys, ba, "R_atomic+"),
        ("atomicClosureAfterSha256", after.atom_keys, aa, "R_atomic+"),
    ]:
        require(graph.digest_relation(keys, values, kind) == proof[field], field)
    for row in proof["coveragePaths"]:
        after.validate_path(effective, row["path"])
    for row in proof["newRequiresIrredundancy"]:
        origin, target = row["removedAuthoredPair"]
        test = graph.Catalog(copy.deepcopy([
            files[source_path] if doc["landscapeId"] == owner else doc for doc in documents
        ]))
        test.remove_origin(origin, target)
        edges, _ = test.effective()
        require(graph.witness(edges, origin, target) is None, "Redundant GK preparation")

    # All guards and proofs precede creation of any output file.
    destination.mkdir()
    written = []
    for path, raw in output_bytes.items():
        target = destination / path
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("xb") as handle:
            handle.write(raw)
        target.chmod(0o444)
        written.append({"path": path, "sha256": sha(raw), "bytes": len(raw)})
    result = {
        "status": "private-guarded-overlay-materialized-global-proof-pass-NOT-application",
        "manifestSha256": sha(manifest_path.read_bytes()),
        "outputRoot": str(destination), "files": written,
        "globalExistingGoalChanges": proof["existingGoalDemandDeltas"],
        "globalExistingAtomicChanges": proof["existingAtomicDemandDeltas"],
        "gkDirectPreparationCount": len(proof["newRequiresIrredundancy"]),
        "gkAtomicPreparationCount": len(aas[gk]),
        "fullRouteGatePassClaimed": False,
        "nativeProducerRerun": False,
        "sourceOrStateWritten": False,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
