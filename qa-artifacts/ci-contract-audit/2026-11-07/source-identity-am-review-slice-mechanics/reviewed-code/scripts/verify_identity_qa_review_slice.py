#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check a bounded A/M input slice against an externally accepted Source-A proof.

Uses the unchanged identity kernel. This is not the complete source inventory
recomputation, a producer read authentication, or an activation verifier.
"""
import argparse
import copy
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
import canonical_goal_identity_migration as kernel


def verify(args):
    raw = args.manifest.read_bytes()
    proof = kernel.parse_json(raw)
    kernel.verify_accepted_bindings(proof, raw, args.expected_base_commit, args.accepted_manifest_sha256)
    for field in ("registry", "registrySchemaBinding", "schemaBinding", "canonicalJsonProfile", "verifier", "identityKernelBinding"):
        binding = proof[field]
        kernel.require(kernel.digest((args.repo_root / binding["path"]).read_bytes()) == binding["sha256"],
                       "Bound Source-A implementation differs: " + field)
    schema = kernel.parse_json((args.repo_root / proof["schemaBinding"]["path"]).read_bytes())
    kernel.validate_closed_schema(proof, schema)
    kernel.require(proof["proof"]["sourceProjectionSha256"] == kernel.digest(kernel.stable({
        "catalog": proof["catalog"]["sourceFiles"], "rules": proof["rules"], "documents": proof["documents"]})),
        "Source-A input projection digest differs")
    request = kernel.parse_json(args.request.read_bytes())
    kernel.require(set(request) == {"owner", "sourcePath", "originalPath", "candidatePath", "evidence"},
                   "Unexpected review-slice request fields")
    sources = [row for row in proof["catalog"]["sourceFiles"]
               if row["path"] == request["sourcePath"] and row["landscapeId"] == request["owner"]]
    kernel.require(len(sources) == 1 and request["sourcePath"].startswith("curricula/DE/Gymnasium/canonical/"),
                   "Review slice has no exact canonical owner/source binding")
    source = sources[0]
    before_raw = Path(request["originalPath"]).read_bytes()
    candidate_raw = Path(request["candidatePath"]).read_bytes()
    kernel.require(kernel.digest(before_raw) == source["sha256"], "Original canonical source differs")
    before, candidate = kernel.parse_json(before_raw), kernel.parse_json(candidate_raw)
    kernel.require(before["landscapeId"] == candidate["landscapeId"] == request["owner"], "Canonical owner differs")
    documents = [row for row in proof["documents"] if row["path"] == source["path"]]
    kernel.require(len(documents) == 1, "Expected one explicit projected source document")
    document = documents[0]
    kernel.require(document["classification"] == "runtime-graph" and document["handling"] == "explicit-pointer-projection",
                   "Expected an explicit canonical identity projection")
    kernel.require(document["sourceSha256"] == source["sha256"], "Catalog/document original binding differs")
    projected = copy.deepcopy(before)
    for field in document["fields"]:
        kernel.set_field(projected, field)
    kernel.require(kernel.stable(projected) == kernel.stable(candidate), "Candidate is not the exact kernel identity projection")
    kernel.require(kernel.digest(kernel.stable(candidate)) == document["hypotheticalCanonicalSha256"],
                   "Declared projected source digest differs")
    kernel.require(kernel.inverse_proof(before, candidate, document["fields"]) == document["inverseCanonicalSha256"],
                   "Declared inverse source digest differs")
    seen = set()
    evidence = []
    for entry in request["evidence"]:
        kernel.require(set(entry) == {"path", "localPath", "kind"} and entry["path"] not in seen,
                       "Duplicate/unexpected original evidence input")
        seen.add(entry["path"])
        kind = entry["kind"]
        kernel.require(kind in ("atomicity", "memory-goal", "memory-card")
                       and entry["path"].startswith("curricula/DE/Gymnasium/quality/")
                       and entry["path"].endswith(".review.jsonl"),
                       "Evidence path/kind is outside the bounded A/M adapter")
        matches = [row for row in proof["documents"] if row["path"] == entry["path"]]
        kernel.require(len(matches) == 1 and matches[0]["classification"] == "immutable-original"
                       and matches[0]["handling"] == "preserve-exact-bytes", "Evidence is not a bound immutable original")
        evidence_raw = Path(entry["localPath"]).read_bytes()
        kernel.require(kernel.digest(evidence_raw) == matches[0]["sourceSha256"], "Original review evidence differs")
        rows = [kernel.parse_json(line) for line in evidence_raw.splitlines() if line.strip()]
        kernel.require(rows and all(row.get("landscapeId") == request["owner"] for row in rows),
                       "Original review evidence has a foreign owner or no records")
        required_fields = {"deckId", "cardId", "fingerprint"} if kind == "memory-card" else {"goalId", "fingerprint"}
        kernel.require(all(required_fields.issubset(row) for row in rows), "Original review kind/typed identity fields differ")
        evidence.append({"path": entry["path"], "kind": kind, "sha256": kernel.digest(evidence_raw), "rows": len(rows)})
    kernel.require(evidence, "Review evidence slice is empty")
    return {"kind": "isolated-source-a-review-slice", "owner": request["owner"], "sourcePath": source["path"],
            "sourceBase": proof["baseCommit"], "manifestRawSha256": kernel.digest(raw),
            "originalRawSha256": kernel.digest(before_raw), "candidateRawSha256": kernel.digest(candidate_raw),
            "candidateCanonicalSha256": document["hypotheticalCanonicalSha256"], "evidence": evidence,
            "completeSourceInventoryRecomputed": False, "producerReadScopeAuthenticated": False,
            "qaApproval": False, "runtimeActivationAllowed": False}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--request", type=Path, required=True)
    parser.add_argument("--expected-base-commit", required=True)
    parser.add_argument("--accepted-manifest-sha256", required=True)
    try:
        print(json.dumps(verify(parser.parse_args()), sort_keys=True))
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
