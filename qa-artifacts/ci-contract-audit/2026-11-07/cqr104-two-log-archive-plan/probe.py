#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Plan-only native locator experiment; does not alter the shared repository."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile

BASE = "cb1289bf067fb9831ef855685daa8b0ab4e6aa96"
RECEIPT = "docs/dev/ci-graph-repairs/cqr104-current-cqr-2026-11-06.json"
RECEIPT_SHA = "d7493ce576364c7243b4a5f8a6775021d89201bc43c741cec32a0636da8fcae0"
KERNEL_SHA = "a1e45c45ea75f872722d56a5eef351ff896d2ebbc415eedc8c66f7883bcec7e5"
REGISTRY_SHA = "3ac1012f56fa57a27c78bd1f4b73d4b0f1aa455055a559590d276c7db2c1323e"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def oid(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    root = args.repo_root.resolve()
    for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_COMMON_DIR", "GIT_INDEX_FILE", "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES"):
        os.environ.pop(key, None)
    os.environ.update(GIT_NO_REPLACE_OBJECTS="1", GIT_GRAFT_FILE="/dev/null")
    git = lambda where, *command: subprocess.check_output(["git", "--no-replace-objects", "-C", str(where), *command])
    receipt_raw = git(root, "show", BASE + ":" + RECEIPT)
    assert sha(receipt_raw) == RECEIPT_SHA and (root / RECEIPT).read_bytes() == receipt_raw
    receipt = json.loads(receipt_raw)
    assert [row["exitCode"] for row in receipt["actualCommands"]] == [0, 1]
    assert len(receipt["protectedFloorViolations"]) == 7
    kernel_path = root / "scripts/canonical_goal_identity_migration.py"
    assert sha(kernel_path.read_bytes()) == KERNEL_SHA
    spec = importlib.util.spec_from_file_location("unchanged_identity_kernel", kernel_path)
    kernel = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kernel)
    registry_raw = (root / "contracts/canonical-goal-identity/v1/reference-fields.json").read_bytes()
    assert sha(registry_raw) == REGISTRY_SHA
    registry = json.loads(registry_raw)
    operations = []
    originals = {}
    for command in receipt["actualCommands"]:
        log = command["log"]
        old = log["path"]
        assert old in {"docs/dev/ci-graph-repairs/cqr104-current-cqr-2026-11-06/floors.txt",
                       "docs/dev/ci-graph-repairs/cqr104-current-cqr-2026-11-06/producer.txt"}
        raw = git(root, "show", BASE + ":" + old)
        assert sha(raw) == log["sha256"]
        source_entry = git(root, "ls-tree", BASE, "--", old).decode().rstrip("\n").split("\t", 1)
        assert source_entry == ["100644 blob " + oid(raw), old]
        assert (root / old).is_file() and not (root / old).is_symlink() and (root / old).read_bytes() == raw
        archive = "qa-artifacts/ci-contract-audit/2026-11-06/cqr104-current-cqr-2026-11-06/" + Path(old).name
        assert not (root / archive).exists() and not (root / archive).is_symlink()
        target = os.path.relpath(archive, Path(old).parent)
        assert not Path(target).is_absolute() and (Path(old).parent / target).as_posix().endswith(Path(old).name)
        rules = [rule for rule in registry["immutableDocumentRules"] if archive.startswith(rule["prefix"])]
        assert len(rules) == 1 and rules[0]["prefix"] == "qa-artifacts/"
        assert kernel.document_class(archive) == (None, None)
        originals[old] = raw
        operations.append({"originalPath": old, "archivePath": archive, "aliasTarget": target,
                           "rawSha256": sha(raw), "bytes": len(raw), "sourceGitMode": "100644",
                           "archiveGitObjectId": oid(raw), "aliasGitObjectId": oid(target.encode()),
                           "originalCommandExitCode": command["exitCode"], "matchedExistingImmutableRule": rules[0]})
    assert len(operations) == 2
    # All writes below occur only in a disposable small RAM repository.
    with tempfile.TemporaryDirectory(prefix="cqr104-two-log-locator-", dir="/dev/shm") as directory:
        private = Path(directory)
        for operation in operations:
            archive, old = private / operation["archivePath"], private / operation["originalPath"]
            archive.parent.mkdir(parents=True, exist_ok=True)
            archive.write_bytes(originals[operation["originalPath"]])
            archive.chmod(0o644)
            old.parent.mkdir(parents=True, exist_ok=True)
            old.symlink_to(operation["aliasTarget"])
            assert old.resolve().is_relative_to(private) and old.read_bytes() == archive.read_bytes()
        for path, target in {"negative/cycle-a": "cycle-b", "negative/cycle-b": "cycle-a",
                             "negative/escape": "../../outside", "negative/missing": "absent"}.items():
            link = private / path
            link.parent.mkdir(exist_ok=True)
            link.symlink_to(target)
        git(private.parent, "init", "-q", str(private))
        git(private, "add", ".")
        git(private, "-c", "user.name=Locator fixture", "-c", "user.email=fixture@example.invalid",
            "-c", "core.hooksPath=/dev/null", "-c", "commit.gpgsign=false", "commit", "-qm", "Private two-log locator proposal")
        commit = git(private, "rev-parse", "HEAD").decode().strip()
        snapshot = kernel.GitSnapshot(private, commit)
        try:
            for operation in operations:
                old, archive = operation["originalPath"], operation["archivePath"]
                assert snapshot.entries[old] == ("120000", operation["aliasGitObjectId"])
                assert snapshot.entries[archive] == ("100644", operation["archiveGitObjectId"])
                assert git(private, "show", commit + ":" + old) == operation["aliasTarget"].encode()
                assert snapshot.read(old) == snapshot.read(archive) == originals[old]
                operation.update(nativeAliasBytesEqual=True, filesystemAliasBytesEqual=True, gitEntryModesAndObjectIdsExact=True)
            for path in ["negative/cycle-a", "negative/escape", "negative/missing"]:
                try:
                    snapshot.read(path)
                except kernel.ContractError:
                    pass
                else:
                    raise AssertionError("Invalid locator unexpectedly accepted: " + path)
            # Use the actual old IDs from the frozen successful proof, only as native search patterns.
            import gzip
            prior = json.loads(gzip.decompress((root / "qa-artifacts/ci-contract-audit/2026-11-06/source-bijection-db9c711559-2026-11-06.proposal.json.gz").read_bytes()))
            matches = snapshot.matching_paths({row["sourceGoalId"] for row in prior["rules"]})
            assert matches == sorted(operation["archivePath"] for operation in operations)
        finally:
            snapshot.close()
    for old, raw in originals.items():
        assert not (root / old).is_symlink() and (root / old).read_bytes() == raw
    result = {"status": "plan-only-native-locator-controls-pass", "sourceBase": BASE,
              "originalReceipt": {"path": RECEIPT, "sha256": RECEIPT_SHA}, "kernelSha256": KERNEL_SHA,
              "registrySha256": REGISTRY_SHA, "operations": operations, "nativeIdentityMatchingPaths": matches,
              "nativeNegativeLocatorsRejected": ["cycle", "escape", "missing"], "supportingLocatorAliasesRequired": [],
              "originalProducerExitCode": 0, "originalFloorExitCode": 1, "originalProtectedFloorViolationCount": 7,
              "sharedRepositorySourceWrites": False, "archivesApplied": False, "newSourceProofProduced": False,
              "candidateQaApproved": False, "runtimeActivationAllowed": False}
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": result["status"], "operations": len(operations), "nativeFoundArchives": len(matches)}))


if __name__ == "__main__":
    main()
