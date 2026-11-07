#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only replay of the two applied CQR104 archives and original locators."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile

PLAN = "docs/dev/ci-graph-repairs/source-identity-cqr104-two-log-archive-plan-2026-11-07.json"
PLAN_SHA = "577b5611d8cdf7fb27dbc55b66f55d66e7c385faa8108e875a95a4e119436fc9"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def oid(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[3])
    args = parser.parse_args()
    root = args.repo_root.resolve()
    plan_raw = (root / PLAN).read_bytes()
    assert sha(plan_raw) == PLAN_SHA
    plan = json.loads(plan_raw)
    for pin in plan["codeAndContractPins"]:
        assert sha((root / pin["path"]).read_bytes()) == pin["sha256"]
    receipt = (root / plan["originalReceipt"]["path"]).read_bytes()
    assert sha(receipt) == plan["originalReceipt"]["sha256"]
    original = json.loads(receipt)
    assert [row["exitCode"] for row in original["actualCommands"]] == [0, 1]
    assert len(original["protectedFloorViolations"]) == 7
    operations = plan["archiveOperations"]
    assert len(operations) == 2 and not plan["supportingLocatorAliases"]
    for item in operations:
        archive, old = root / item["archivePath"], root / item["originalPath"]
        assert stat.S_ISREG(archive.lstat().st_mode) and stat.S_IMODE(archive.stat().st_mode) == 0o644
        raw = archive.read_bytes()
        assert sha(raw) == item["rawSha256"] and len(raw) == item["bytes"] and oid(raw) == item["archiveGitObjectId"]
        assert old.is_symlink() and os.readlink(old) == item["aliasTarget"]
        assert oid(os.readlink(old).encode()) == item["aliasGitObjectId"]
        assert old.resolve(strict=True) == archive.resolve(strict=True) and old.resolve().is_relative_to(root)
        assert old.read_bytes() == raw
    spec = importlib.util.spec_from_file_location("unchanged_identity_kernel", root / "scripts/canonical_goal_identity_migration.py")
    kernel = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kernel)
    # Actual applied archive and symlink bytes enter a separate small Git tree.
    with tempfile.TemporaryDirectory(prefix="cqr104-applied-locator-", dir="/dev/shm") as directory:
        private = Path(directory)
        for item in operations:
            archive, old = private / item["archivePath"], private / item["originalPath"]
            archive.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(root / item["archivePath"], archive)
            archive.chmod(0o644)
            old.parent.mkdir(parents=True, exist_ok=True)
            old.symlink_to(os.readlink(root / item["originalPath"]))
        git = lambda *command: subprocess.check_output(["git", "-C", str(private), *command])
        git("init", "-q")
        git("add", ".")
        git("-c", "user.name=Applied locator fixture", "-c", "user.email=fixture@example.invalid",
            "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "commit", "-qm", "Actual two-log archive replay")
        commit = git("rev-parse", "HEAD").decode().strip()
        snapshot = kernel.GitSnapshot(private, commit)
        observed = []
        try:
            for item in operations:
                old, archive = item["originalPath"], item["archivePath"]
                assert snapshot.entries[old] == ("120000", item["aliasGitObjectId"])
                assert snapshot.entries[archive] == ("100644", item["archiveGitObjectId"])
                assert snapshot.read(old) == snapshot.read(archive) == (root / archive).read_bytes()
                observed.append({"originalPath": old, "archivePath": archive, "sha256": sha(snapshot.read(old)),
                                 "aliasGitObjectId": snapshot.entries[old][1], "archiveGitObjectId": snapshot.entries[archive][1],
                                 "nativeOriginalAndArchiveBytesEqual": True})
        finally:
            snapshot.close()
    assert sha((root / plan["originalReceipt"]["path"]).read_bytes()) == plan["originalReceipt"]["sha256"]
    print(json.dumps({"status": "actual-two-log-archive-native-replay-pass", "planSha256": PLAN_SHA,
                      "operations": observed, "originalReceiptSha256": sha(receipt),
                      "originalProducerExitCode": 0, "originalFloorExitCode": 1, "protectedFloorViolations": 7,
                      "sourceOrQaOrStateWrites": False, "newSourceProofProduced": False,
                      "candidateQaApproved": False, "runtimeActivationAllowed": False}, indent=2))


if __name__ == "__main__":
    main()
