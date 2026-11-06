#!/usr/bin/env python3
"""Authenticate a real original-QA producer's successful reads against Git."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True

from prepare_identity_qa_candidate import load_kernel, read_inventory, resolve_snapshot_read


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--original-root", type=Path, required=True)
    p.add_argument("--expected-base-commit", required=True)
    p.add_argument("--read-trace", type=Path, required=True)
    a = p.parse_args()
    root = a.original_root.resolve()
    subprocess.run(["git", "-C", str(root), "diff-index", "--cached", "--quiet", a.expected_base_commit], check=True)
    k = load_kernel(root)
    snapshot = k.GitSnapshot(root, a.expected_base_commit)
    count, size = 0, 0
    try:
        for logical in sorted(read_inventory(a.read_trace, root)):
            if logical.startswith((".git/", "app/node_modules/")):
                continue
            path = root / logical
            if path.is_dir():
                continue
            actual, _ = resolve_snapshot_read(snapshot, logical)
            k.require(actual in snapshot.entries, "Original producer read is not a Git snapshot input: " + logical)
            raw = path.read_bytes()
            mode, oid = snapshot.entries[actual]
            if mode == "120000":
                k.require(k.digest(raw) == k.digest(snapshot.read(actual)), "Original producer alias bytes differ: " + logical)
            else:
                current = hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()
                k.require(current == oid, "Original producer bytes differ from Git base: " + logical)
            count += 1
            size += len(raw)
    finally:
        snapshot.close()
    k.require(count > 0, "Original producer read scope is empty")
    print(json.dumps({"purpose": "original-qa-producer-read-authentication", "baseCommit": a.expected_base_commit,
                      "originalRoot": str(root), "authenticatedReadPaths": count, "authenticatedBytes": size}))


if __name__ == "__main__":
    main()
