#!/usr/bin/env python3
"""Read-only Source-A verification of both actual QA roots; no activation API."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True


def require(value, message):
    if not value:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def verify(args):
    original, candidate = args.original_root.resolve(), args.candidate_root.resolve()
    raw = args.manifest.read_bytes()
    require(sha(raw) == args.accepted_manifest_sha256, "External Source-A raw pin differs")
    header = json.loads(raw)
    require(header["baseCommit"] == args.expected_base_commit, "External Source-A base differs")
    for field in ("registry", "registrySchemaBinding", "schemaBinding", "canonicalJsonProfile", "verifier", "identityKernelBinding"):
        binding = header[field]
        require(sha((original / binding["path"]).read_bytes()) == binding["sha256"], "Pinned Source-A artifact differs: " + field)
    sys.path.insert(0, str(original / "scripts"))
    spec = importlib.util.spec_from_file_location("verified_source_a", original / header["verifier"]["path"])
    source = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(source)
    proof = source.kernel.parse_json(raw)
    schema = source.kernel.parse_json((original / proof["schemaBinding"]["path"]).read_bytes())
    source.kernel.validate_closed_schema(proof, schema)
    # Genuine negatives stop before the expensive full inventory replay.
    source.kernel.verify_candidate_catalog_sources(candidate, proof)
    for document in proof["documents"]:
        if document["path"].endswith(".semantic-kinds.json"):
            require(sha((original / document["path"]).read_bytes()) == document["sourceSha256"],
                    "Original semantic-kind ledger differs: " + document["path"])
    snapshot = source.kernel.GitSnapshot(original, args.expected_base_commit)
    ledger_bindings = []
    try:
        prefix = "curricula/DE/Gymnasium/quality/release-model/"
        expected_paths = {path for path in snapshot.entries if path.startswith(prefix) and path.endswith(".semantic-kinds.json")}
        actual_paths = {path.relative_to(original).as_posix() for path in (original / prefix).rglob("*.semantic-kinds.json")}
        require(actual_paths == expected_paths, "Original semantic-kind ledger inventory is missing/extra")
        candidate_paths = {path.relative_to(candidate).as_posix() for path in (candidate / prefix).rglob("*.semantic-kinds.json")}
        require(candidate_paths == expected_paths, "Candidate original-ledger inventory is missing/extra")
        for relative in sorted(expected_paths):
            path = original / relative
            before = snapshot.read(relative)
            require(sha(path.read_bytes()) == sha(before), "Original semantic-kind ledger differs: " + relative)
            require(sha((candidate / relative).read_bytes()) == sha(before), "Candidate original-ledger bytes differ: " + relative)
            ledger_bindings.append({"path": relative, "sha256": sha(before)})
    finally:
        snapshot.close()
    require(bool(ledger_bindings), "Original semantic-kind scope is empty")
    bound = {item["path"]: item["sha256"] for item in proof["catalog"]["sourceFiles"]}
    bound.update({item["path"]: item["sourceSha256"] for item in proof["documents"]})
    for path, expected in bound.items():
        require(sha((original / path).read_bytes()) == expected, "Actual original bytes differ: " + path)
    source.verify_source_proof(original, args.manifest, args.expected_base_commit, args.accepted_manifest_sha256)
    source.verify_source_candidate(original, candidate, proof)
    return {"purpose": "source-a-isolated-qa-context", "baseCommit": args.expected_base_commit,
            "manifestRawSha256": sha(raw), "originalRoot": str(original), "candidateRoot": str(candidate),
            "catalogFiles": len(proof["catalog"]["sourceFiles"]), "sourceDocuments": len(proof["documents"]),
            "originalBoundPaths": len(bound), "ruleCount": len(proof["rules"]), "ledgerBindings": ledger_bindings,
            "runtimeActivationAllowed": False, "qaValidityClaimed": False}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", type=Path, required=True)
    p.add_argument("--accepted-manifest-sha256", required=True)
    p.add_argument("--expected-base-commit", required=True)
    p.add_argument("--original-root", type=Path, required=True)
    p.add_argument("--candidate-root", type=Path, required=True)
    try:
        print(json.dumps(verify(p.parse_args()), sort_keys=True))
    except (ValueError, OSError, KeyError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
