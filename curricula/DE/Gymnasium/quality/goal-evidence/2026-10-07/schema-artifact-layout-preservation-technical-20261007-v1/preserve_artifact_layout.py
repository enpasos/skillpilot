"""Preserve frozen technical snapshots outside runtime curriculum discovery.

No schema exceptions, scientific judgments, or modifications to historical bytes.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import tempfile


ROOT = Path(__file__).resolve().parents[7]
BASE = Path(__file__).resolve().parent
DAY = BASE.parent
ARCHIVE = ROOT / "qa-artifacts/native-review-inputs/2026-10-07" / BASE.name
CHEM = DAY / "chemie-four-final-images-native-d17-plus-c441-p18-technical-author-20261007-v1"
PREP = DAY / "portable-curriculum-symlink-repair-preparation-author-20261007-v1"
MOVES = (
    (CHEM / "native-root/contracts", ARCHIVE / "native-contracts"),
    (PREP / "checks", ARCHIVE / "portable-preparation-checks"),
)
MANIFESTS = (
    (CHEM / "final-own-files-and-reused-inputs.freeze.json", "ownFiles", ROOT),
    (PREP / "author.final.freeze.json", "payloads", PREP),
)


def pin(path):
    data = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def verify_frozen_payloads():
    checked = []
    for path, key, payload_base in MANIFESTS:
        manifest = json.loads(path.read_text())
        rows = manifest[key]
        for row in rows:
            payload = payload_base / row["path"]
            observed = pin(payload)
            assert observed["sha256"] == row["sha256"], payload
            assert observed["bytes"] == row["bytes"], payload
        checked.append({"freeze": pin(path), "verifiedFrozenPayloads": len(rows)})
    return checked


def inventory(directory):
    result = []
    for path in sorted(directory.rglob("*")):
        assert not path.is_symlink(), path
        if path.is_file():
            binding = pin(path)
            binding["originalRelativePath"] = path.relative_to(directory).as_posix()
            binding["fileMode"] = stat.S_IMODE(path.stat().st_mode)
            result.append(binding)
    return result


def target_checks():
    checked = []
    for original, archived in MOVES:
        assert original.is_symlink(), original
        target = os.readlink(original)
        assert not os.path.isabs(target), original
        assert original.resolve(strict=True) == archived.resolve(strict=True), original
        assert archived.resolve(strict=True).is_relative_to(ROOT), archived
        checked.append({"originalDirectory": original.relative_to(ROOT).as_posix(), "archiveDirectory": archived.relative_to(ROOT).as_posix(), "relativeAliasLiteral": target})
    invalid_fixture = MOVES[0][1] / "curriculum-package/v1/fixtures/package-provisioner/raw-invalid/trailing-token.install-record.raw.json"
    failed_stdout = MOVES[1][1] / "root-apply-helper.check-only.actual.json"
    for path, reason in ((invalid_fixture, "intentionally malformed negative test fixture"), (failed_stdout, "zero-byte raw stdout from failed historical attempt")):
        try:
            json.loads(path.read_bytes())
        except json.JSONDecodeError as exc:
            checked.append({"historicalRawPayload": pin(path), "preservedReason": reason, "actualJSONRejection": str(exc)})
        else:
            raise AssertionError(f"Historical malformed/raw payload was changed: {path}")
    assert failed_stdout.read_bytes() == b""
    spec = importlib.util.spec_from_file_location("actual_schema_validator", ROOT / "scripts/validate_schemas.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    errors = module.curriculum_symlink_errors(ROOT)
    assert not errors, errors
    checked.append({"genericCommittableCurriculumSymlinkErrors": errors})
    with tempfile.TemporaryDirectory(prefix="skillpilot-actual-artifact-layout-") as temp:
        fixture = Path(temp) / "before-move"
        fixture.mkdir()
        try:
            for original, archived in MOVES:
                copy = fixture / archived.relative_to(ROOT)
                copy.parent.mkdir(parents=True, exist_ok=True)
                shutil.copytree(archived, copy)
                alias = fixture / original.relative_to(ROOT)
                alias.parent.mkdir(parents=True, exist_ok=True)
                alias.symlink_to(os.readlink(original), target_is_directory=True)
            subprocess.run(["git", "init", "--quiet"], cwd=fixture, check=True, capture_output=True)
            before_errors = module.curriculum_symlink_errors(fixture)
            assert not before_errors, before_errors
            relocated = fixture.parent / "after-move"
            fixture.rename(relocated)
            fixture = relocated
            after_errors = module.curriculum_symlink_errors(fixture)
            assert not after_errors, after_errors
            relocated_files = 0
            for original, archived in MOVES:
                for path in archived.rglob("*"):
                    if path.is_file():
                        resolved_alias = fixture / original.relative_to(ROOT) / path.relative_to(archived)
                        assert resolved_alias.read_bytes() == path.read_bytes(), resolved_alias
                        relocated_files += 1
            checked.append({"actualTwoAliasesRelocatedWithArchivedPayloads": relocated_files, "genericBeforeRelocationErrors": before_errors, "genericAfterRelocationErrors": after_errors})
        finally:
            for path in sorted(fixture.rglob("*"), reverse=True):
                if path.is_dir() and not path.is_symlink():
                    path.chmod(stat.S_IMODE(path.stat().st_mode) | stat.S_IWUSR | stat.S_IXUSR)
    parsed = 0
    for path in BASE.rglob("*.json"):
        json.loads(path.read_bytes())
        parsed += 1
    checked.append({"newTechnicalDossierJSONFilesParsed": parsed})
    return checked


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    assert args.apply != args.verify, "Use exactly one of --apply or --verify"
    receipt = BASE / "historical-layout-preservation.actual.receipt.json"
    if args.verify:
        print(json.dumps({"actualVerifiedAt": datetime.now(timezone.utc).isoformat(), "frozenPayloadChecks": verify_frozen_payloads(), "targetedLayoutChecks": target_checks()}, indent=2))
        return
    assert not receipt.exists(), "The actual application receipt is immutable"
    freezes_before = verify_frozen_payloads()
    layouts = []
    for original, archived in MOVES:
        already_archived = original.is_symlink()
        alias_literal = os.path.relpath(archived, original.parent)
        if already_archived:
            assert original.resolve(strict=True) == archived.resolve(strict=True), original
            assert os.readlink(original) == alias_literal, original
            snapshot = inventory(archived)
            for binding in snapshot:
                binding["path"] = (original / binding["originalRelativePath"]).relative_to(ROOT).as_posix()
        else:
            assert original.is_dir(), original
            assert not archived.exists(), archived
            snapshot = inventory(original)
        layout = {"originalDirectory": original.relative_to(ROOT).as_posix(), "archiveDirectory": archived.relative_to(ROOT).as_posix(), "relativeAliasLiteral": alias_literal, "originalDirectoryMode": stat.S_IMODE(original.stat().st_mode), "originalFileBindings": snapshot, "alreadyArchivedBeforeThisSuccessfulCall": already_archived}
        if original == MOVES[0][0]:
            source_contracts = []
            for row in snapshot:
                live_contract = ROOT / "contracts" / row["originalRelativePath"]
                actual = pin(live_contract)
                assert actual["sha256"] == row["sha256"] and actual["bytes"] == row["bytes"], live_contract
                source_contracts.append(actual)
            layout["actualByteExactLiveContractBindingsAtArchival"] = source_contracts
        layouts.append(layout)
    for (original, archived), layout in zip(MOVES, layouts):
        if not layout["alreadyArchivedBeforeThisSuccessfulCall"]:
            archived.parent.mkdir(parents=True, exist_ok=True)
            parent_mode = stat.S_IMODE(original.parent.stat().st_mode)
            directory_mode = stat.S_IMODE(original.stat().st_mode)
            try:
                original.parent.chmod(parent_mode | stat.S_IWUSR)
                original.chmod(directory_mode | stat.S_IWUSR)
                original.rename(archived)
                original.symlink_to(layout["relativeAliasLiteral"], target_is_directory=True)
            finally:
                if archived.exists():
                    archived.chmod(directory_mode)
                elif original.exists() and not original.is_symlink():
                    original.chmod(directory_mode)
                original.parent.chmod(parent_mode)
        actual = inventory(archived)
        for before, after in zip(layout["originalFileBindings"], actual):
            for key in ("originalRelativePath", "sha256", "bytes", "fileMode"):
                assert before[key] == after[key], (before, after)
        assert len(actual) == len(layout["originalFileBindings"])
        layout["archivedFileBindings"] = actual
        layout["allOriginalBytesAndModesPreserved"] = True
    freezes_after = verify_frozen_payloads()
    assert freezes_after == freezes_before
    checks = target_checks()
    result = {"kind": "actualHistoricalTechnicalLayoutPreservation", "actualAppliedAt": datetime.now(timezone.utc).isoformat(), "scientificApproval": False, "strictNetGain": 0, "schemaExceptionsAdded": False, "historicalFreezeBytesChanged": False, "historicalPayloadBytesChanged": False, "historicalFrozenPathsRemainReadable": True, "layoutChanges": layouts, "frozenPayloadChecks": freezes_after, "targetedLayoutChecks": checks, "fullSchemaValidation": "pending root final run"}
    receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"receipt": pin(receipt), "actualArchivedFilesTotal": sum(len(row["originalFileBindings"]) for row in layouts), "actualMovedFilesThisSuccessfulCall": sum(len(row["originalFileBindings"]) for row in layouts if not row["alreadyArchivedBeforeThisSuccessfulCall"]), "verifiedFrozenPayloads": sum(row["verifiedFrozenPayloads"] for row in freezes_after), "genericSymlinkErrors": [], "strictNetGain": 0}, indent=2))


if __name__ == "__main__":
    main()
