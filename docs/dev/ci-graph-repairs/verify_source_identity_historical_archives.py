#!/usr/bin/env python3
"""Read-only archive/locator replay; never generates or activates a Source-A proof."""
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
PLAN = "docs/dev/ci-graph-repairs/source-identity-historical-evidence-locator-review-2026-11-06.json"
PIN = "4e2a88ba0224e7fa593c1b152a8803900b710412d0b19a7d087898d13e379b8c"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def oid(raw):
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()


def main():
    raw = (ROOT / PLAN).read_bytes()
    assert sha(raw) == PIN
    plan = json.loads(raw)
    observed = []
    for item in plan["codeAndContractPins"]:
        current = sha((ROOT / item["path"]).read_bytes())
        if item["role"] == "unchanged-proof-contract":
            assert current == item["sha256"]
        observed.append({"path": item["path"], "actualSha256": current, "planSha256": item["sha256"],
                         "equalsPlanAtReplay": current == item["sha256"], "role": item["role"]})
    operations, supports = plan["archiveOperations"], plan["supportingLocatorAliases"]
    assert len(operations) == 7 and len(supports) == 2
    for item in operations:
        archive, old = ROOT / item["archivePath"], ROOT / item["originalPath"]
        assert archive.is_file() and not archive.is_symlink()
        body = archive.read_bytes()
        assert len(body) == item["bytes"] and sha(body) == item["sha256"] and oid(body) == item["archiveGitObjectId"]
        assert old.is_symlink() and os.readlink(old) == item["aliasTarget"]
        assert old.resolve(strict=True) == archive.resolve(strict=True) and old.resolve().is_relative_to(ROOT)
        assert old.read_bytes() == body and oid(os.readlink(old).encode()) == item["aliasGitObjectId"]
    for item in supports:
        alias, target = ROOT / item["path"], ROOT / item["unchangedTargetPath"]
        assert alias.is_symlink() and os.readlink(alias) == item["target"]
        assert alias.resolve(strict=True) == target.resolve(strict=True) and alias.resolve().is_relative_to(ROOT)
        assert sha(alias.read_bytes()) == item["sha256"] and oid(item["target"].encode()) == item["aliasGitObjectId"]
    spec = importlib.util.spec_from_file_location("unchanged_identity_kernel", ROOT / "scripts/canonical_goal_identity_migration.py")
    kernel = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(kernel)
    proof = json.loads((ROOT / operations[0]["archivePath"]).read_text())
    for key in ["registry", "registrySchemaBinding", "schemaBinding", "canonicalJsonProfile", "verifier", "identityKernelBinding"]:
        item = proof[key]
        assert sha((ROOT / item["path"]).read_bytes()) == item["sha256"]
    source_ids = {item["sourceGoalId"] for item in proof["rules"]}
    assert len(source_ids) == 164
    registry = json.loads((ROOT / "contracts/canonical-goal-identity/v1/reference-fields.json").read_text())
    for item in operations:
        assert kernel.document_class(item["archivePath"]) == (None, None)
        assert any(item["archivePath"].startswith(rule["prefix"]) for rule in registry["immutableDocumentRules"])
    # A disposable small Git tree exercises the unchanged native reader over
    # the actual applied bytes; the shared repository is never committed here.
    with tempfile.TemporaryDirectory(prefix="source-a-archive-locator-", dir="/dev/shm") as directory:
        temporary = Path(directory)
        regular_paths = [item["archivePath"] for item in operations] + [item["unchangedTargetPath"] for item in supports]
        for relative in regular_paths:
            destination = temporary / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, destination)
        alias_paths = [(item["originalPath"], item["aliasTarget"]) for item in operations]
        alias_paths += [(item["path"], item["target"]) for item in supports]
        for relative, target in alias_paths:
            destination = temporary / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.symlink_to(target)
        negatives = {"locator-negative/cycle-a": "cycle-b", "locator-negative/cycle-b": "cycle-a",
                     "locator-negative/escape": "../../outside", "locator-negative/missing": "absent"}
        for relative, target in negatives.items():
            destination = temporary / relative
            destination.parent.mkdir(exist_ok=True)
            destination.symlink_to(target)
        subprocess.run(["git", "init", "-q", str(temporary)], check=True)
        subprocess.run(["git", "-C", str(temporary), "add", "."], check=True)
        subprocess.run(["git", "-C", str(temporary), "-c", "user.name=Locator fixture", "-c", "user.email=fixture@example.invalid",
                        "-c", "commit.gpgsign=false", "commit", "-qm", "Actual archive locator replay"], check=True)
        commit = subprocess.check_output(["git", "-C", str(temporary), "rev-parse", "HEAD"], text=True).strip()
        snapshot = kernel.GitSnapshot(temporary, commit)
        native = []
        try:
            for item in operations:
                alias_raw = subprocess.check_output(["git", "-C", str(temporary), "show", commit + ":" + item["originalPath"]])
                assert alias_raw == item["aliasTarget"].encode() and oid(alias_raw) == item["aliasGitObjectId"]
                assert snapshot.entries[item["originalPath"]] == ("120000", item["aliasGitObjectId"])
                assert snapshot.entries[item["archivePath"]] == ("100644", item["archiveGitObjectId"])
                assert sha(snapshot.read(item["originalPath"])) == item["sha256"]
                assert snapshot.read(item["originalPath"]) == snapshot.read(item["archivePath"])
                native.append({"oldPath": item["originalPath"], "archivePath": item["archivePath"],
                               "sha256": item["sha256"], "aliasGitObjectId": item["aliasGitObjectId"], "nativeBytesEqual": True})
            for item in supports:
                assert snapshot.entries[item["path"]] == ("120000", item["aliasGitObjectId"])
                assert sha(snapshot.read(item["path"])) == item["sha256"]
            rejected = []
            for relative in ["locator-negative/cycle-a", "locator-negative/escape", "locator-negative/missing"]:
                try:
                    snapshot.read(relative)
                except kernel.ContractError:
                    rejected.append(relative)
                else:
                    raise AssertionError("Unsafe locator was accepted: " + relative)
            matching = snapshot.matching_paths(source_ids)
            assert matching == sorted(item["archivePath"] for item in operations)
        finally:
            snapshot.close()
    markdown = plan["actualExperiment"]["nativeMarkdownCheck"]["arguments"]
    checked = subprocess.run([str(ROOT / "app/node_modules/.bin/tsx"), str(ROOT / "app/scripts/checkMarkdownLinks.ts"), *markdown],
                             cwd=ROOT, capture_output=True, text=True)
    assert checked.returncode == 0, checked.stderr
    for item in observed:
        assert sha((ROOT / item["path"]).read_bytes()) == item["actualSha256"]
    print(json.dumps({"status": "PASS-actual-seven-archive-nine-alias-locator-replay", "planSha256": PIN,
                      "sourceBase": plan["sourceBase"], "appliedArchives": native, "supportAliases": supports,
                      "privateFixtureCommit": commit, "projectCommitCreated": False, "nativeMatchingPaths": matching,
                      "negativeAliasesRejected": rejected, "markdown": {"paths": markdown, "exitCode": checked.returncode,
                      "stdout": checked.stdout, "stderr": checked.stderr}, "observedCodeAtReplay": observed, "completeSourceAReplayed": False,
                      "publishedSiteRenderingClaimed": False, "runtimeActivationAllowed": False}, indent=2))


if __name__ == "__main__":
    main()
