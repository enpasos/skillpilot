#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Source-only identity proof for isolated QA candidate generation.

This is a different proof type from the historical blocked migration proposals.
Declared current outputs are excluded from source hashes and remain obligations
of a separate activation receipt. Unknown inputs and unready source producers
are fatal. No runtime/learner activation or data application is implemented.
"""

import argparse
import copy
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import canonical_goal_identity_migration as kernel

SOURCE_SCHEMA_PATH = "contracts/canonical-goal-identity/v1/source-bijection-proof.schema.json"
ACTIVATION_SCHEMA_PATH = "contracts/canonical-goal-identity/v1/activation-receipt.schema.json"
SOURCE_VERIFIER_PATH = "scripts/canonical_goal_source_identity_proof.py"


def source_inputs(proposal, exclusions, original_classifications=()):
    """Select a closed source scope; do not reinterpret the old proposal status."""
    by_path = {entry["path"]: entry for entry in exclusions}
    kernel.require(len(by_path) == len(exclusions), "Duplicate exact output exclusion")
    classified = {entry["path"]: entry for entry in original_classifications}
    kernel.require(len(classified) == len(original_classifications), "Duplicate exact original-input classification")
    kernel.require(not set(classified).intersection(by_path), "An original input must remain bound, not excluded")
    catalog_paths = {source["path"] for source in proposal["catalog"]["sourceFiles"]}
    kernel.require(not catalog_paths.intersection(by_path), "A catalog input cannot be an output exclusion")
    remaining = [issue for issue in proposal["blockers"] if issue["path"] not in by_path and issue["path"] not in classified]
    kernel.require(not remaining, "Unclassified or unready source inputs: " + json.dumps(remaining[:6], ensure_ascii=False))
    documents = [copy.deepcopy(document) for document in proposal["documents"] if document["path"] not in by_path]
    for document in documents:
        if document["path"] in classified:
            declaration = classified[document["path"]]
            kernel.require(declaration["classification"] == "immutable-original"
                           and declaration["handling"] == "preserve-exact-bytes", "Unsupported original-input classification")
            kernel.require(document["path"] not in catalog_paths, "Canonical catalog bytes cannot be reclassified as evidence")
            document.update(classification=declaration["classification"], handling=declaration["handling"], reason=declaration["reason"])
    allowed = {"runtime-graph", "composition", "mapping", "provenance-registry", "qa-scope-config",
               "duration-policy", "immutable-original"}
    kernel.require(all(document["classification"] in allowed for document in documents), "Unclassified source document")
    kernel.require(all(document["handling"] in ("explicit-pointer-projection", "preserve-exact-bytes")
                       for document in documents), "Unready source document handling")
    return documents


def projection_digest(catalog_source_files, rules, documents):
    return kernel.digest(kernel.stable({"catalog": catalog_source_files, "rules": rules, "documents": documents}))


def generate_source_proof(repo_root, base_commit):
    root = Path(repo_root)
    schema_raw = (root / SOURCE_SCHEMA_PATH).read_bytes()
    schema = kernel.parse_json(schema_raw)
    exclusions = schema["properties"]["derivedOutputExclusions"]["const"]
    originals = schema["$defs"]["sourceInputClassifications"]["const"]
    proposal = kernel.generate(root, base_commit)
    documents = source_inputs(proposal, exclusions, originals)
    result = {
        "$schema": "https://skillpilot.com/contracts/canonical-goal-identity/v1/source-bijection-proof.schema.json",
        "schemaVersion": 1,
        "proofType": "canonical-goal-source-bijection",
        "capability": "isolated-qa-candidate-projection",
        "migrationId": proposal["migrationId"],
        "uuidNamespace": proposal["uuidNamespace"],
        "baseCommit": proposal["baseCommit"],
        "runtimeActivationAllowed": False,
        "qaValidityClaimed": False,
        "registry": proposal["registry"],
        "registrySchemaBinding": proposal["registrySchemaBinding"],
        "schemaBinding": {"path": SOURCE_SCHEMA_PATH, "sha256": kernel.digest(schema_raw)},
        "canonicalJsonProfile": proposal["canonicalJsonProfile"],
        "verifier": {"path": SOURCE_VERIFIER_PATH, "sha256": kernel.digest(Path(__file__).read_bytes())},
        "identityKernelBinding": proposal["verifier"],
        "catalog": proposal["catalog"],
        "rules": proposal["rules"],
        "documents": documents,
        "derivedOutputExclusions": exclusions,
        "proof": {
            "bijectiveRuleCount": len(proposal["rules"]),
            "globalExistingIdentityCollisionCount": 0,
            "inverseDocumentEqualityVerified": True,
            "unclassifiedInputHitCount": 0,
            "historicalInputBytesBound": True,
            "cardAndAssetBytesRenamed": False,
            "sourceProjectionSha256": projection_digest(proposal["catalog"]["sourceFiles"], proposal["rules"], documents),
        },
    }
    kernel.validate_closed_schema(result, schema)
    return result


def verify_source_proof(repo_root, manifest_path, expected_base=None, accepted_digest=None):
    raw = Path(manifest_path).read_bytes()
    proof = kernel.parse_json(raw)
    schema = kernel.parse_json((Path(repo_root) / SOURCE_SCHEMA_PATH).read_bytes())
    kernel.validate_closed_schema(proof, schema)
    if expected_base is not None or accepted_digest is not None:
        kernel.verify_accepted_bindings(proof, raw, expected_base, accepted_digest)
    actual = generate_source_proof(repo_root, proof["baseCommit"])
    kernel.require(kernel.stable(proof) == kernel.stable(actual), "Source proof differs from independent source-inventory recomputation")
    return proof, raw


def verify_source_candidate(repo_root, candidate_root, proof):
    """Read-only check of bound original/current bytes, without B authority."""
    root = Path(candidate_root)
    kernel.verify_candidate_catalog_sources(root, proof)
    original = kernel.GitSnapshot(repo_root, proof["baseCommit"])
    try:
        for document in proof["documents"]:
            before_raw = original.read(document["path"])
            kernel.require(kernel.digest(before_raw) == document["sourceSha256"], "Bound original source is stale")
            current_raw = (root / document["path"]).read_bytes()
            if document["handling"] == "preserve-exact-bytes":
                kernel.require(kernel.digest(current_raw) == document["sourceSha256"], "Original QA/card/asset bytes changed")
            else:
                candidate = kernel.parse_json(current_raw)
                kernel.require(kernel.digest(kernel.stable(candidate)) == document["hypotheticalCanonicalSha256"],
                               "Source candidate is not the exact declared identity projection")
                kernel.inverse_proof(kernel.parse_json(before_raw), candidate, document["fields"])
    finally:
        original.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    sub = parser.add_subparsers(dest="command", required=True)
    generate = sub.add_parser("generate", help="Generate a source-only proof, never an activation receipt")
    generate.add_argument("--base-commit", required=True)
    generate.add_argument("--output", type=Path, required=True)
    verify = sub.add_parser("verify", help="Recompute the complete source inventory and inverse proof")
    verify.add_argument("--manifest", type=Path, required=True)
    verify.add_argument("--candidate-root", type=Path)
    verify.add_argument("--expected-base-commit")
    verify.add_argument("--accepted-manifest-sha256")
    args = parser.parse_args()
    try:
        if args.command == "generate":
            proof = generate_source_proof(args.repo_root, args.base_commit)
            raw = (json.dumps(proof, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(raw)
        else:
            proof, raw = verify_source_proof(args.repo_root, args.manifest, args.expected_base_commit,
                                             args.accepted_manifest_sha256)
            if args.candidate_root is not None:
                kernel.verify_accepted_bindings(proof, raw, args.expected_base_commit, args.accepted_manifest_sha256)
                verify_source_candidate(args.repo_root, args.candidate_root, proof)
        print(json.dumps({"status": "source-projection-verified", "rules": len(proof["rules"]),
                          "catalogFiles": proof["catalog"]["fileCount"], "boundSourceDocuments": len(proof["documents"]),
                          "sourceProjectionSha256": proof["proof"]["sourceProjectionSha256"],
                          "manifestRawSha256": kernel.digest(raw), "runtimeActivationAllowed": False,
                          "qaValidityClaimed": False}, indent=2))
        return 0
    except (kernel.ContractError, ValueError, KeyError, TypeError, OSError, kernel.subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "runtimeActivationAllowed": False, "error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
