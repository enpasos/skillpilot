"""Restore owner-write on regular current output copies, preserving image bytes."""

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import stat


ROOT = Path(__file__).resolve().parents[7]
BASE = Path(__file__).resolve().parent
OUTPUTS = (
    ROOT / "app/public/assets/goal-visualizations",
    ROOT / "backend/src/main/resources/static/assets/goal-visualizations",
)
SOURCE = ROOT / "curricula/DE/Gymnasium/visualizations"


def binding(path):
    data = path.read_bytes()
    metadata = path.stat()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), "mode": stat.S_IMODE(metadata.st_mode), "inode": metadata.st_ino, "device": metadata.st_dev, "hardlinkCount": metadata.st_nlink}


def inspect_outputs():
    selected = []
    inspected = []
    for output in OUTPUTS:
        assert output.resolve(strict=True) == output, output
        files = 0
        directories = 0
        for directory, names, filenames in os.walk(output, followlinks=False):
            current = Path(directory)
            assert not current.is_symlink(), current
            assert current.stat().st_mode & stat.S_IWUSR, current
            directories += 1
            for name in names:
                assert not (current / name).is_symlink(), current / name
            for name in filenames:
                path = current / name
                assert not path.is_symlink(), path
                assert stat.S_ISREG(path.stat().st_mode), path
                files += 1
                if not path.stat().st_mode & stat.S_IWUSR:
                    before = binding(path)
                    assert path.stat().st_uid == os.getuid(), path
                    assert before["hardlinkCount"] == 1, path
                    source = SOURCE / path.relative_to(output)
                    source_before = binding(source)
                    assert (before["device"], before["inode"]) != (source_before["device"], source_before["inode"]), path
                    assert before["sha256"] == source_before["sha256"] and before["bytes"] == source_before["bytes"], path
                    selected.append({"outputBefore": before, "sourceBefore": source_before})
        inspected.append({"outputRoot": output.relative_to(ROOT).as_posix(), "regularFilesInspected": files, "writableDirectoriesInspected": directories, "symlinksEncountered": 0})
    return selected, inspected


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    assert args.apply != args.verify, "Use exactly one of --apply or --verify"
    receipt = BASE / "current-output-owner-write-restoration.actual.receipt.json"
    if args.verify:
        data = json.loads(receipt.read_text())
        for row in data["changedOutputFiles"]:
            after = binding(ROOT / row["outputAfter"]["path"])
            assert after == row["outputAfter"], after
            assert binding(ROOT / row["sourceBefore"]["path"]) == row["sourceBefore"], row
        selected, inspected = inspect_outputs()
        assert not selected, selected
        print(json.dumps({"actualVerifiedAt": datetime.now(timezone.utc).isoformat(), "verifiedChangedOutputCopies": len(data["changedOutputFiles"]), "remainingReadOnlyCurrentOutputFiles": 0, "sourcePayloadsAndModesUnchanged": True, "outputBytesUnchanged": True, "inspection": inspected, "scientificApproval": False, "strictNetGain": 0}, indent=2))
        return
    assert not receipt.exists(), "Actual application receipt is immutable"
    started = datetime.now(timezone.utc).isoformat()
    selected, inspected = inspect_outputs()
    changed = []
    for row in selected:
        path = ROOT / row["outputBefore"]["path"]
        before = row["outputBefore"]
        assert binding(path) == before, path
        path.chmod(before["mode"] | stat.S_IWUSR)
        after = binding(path)
        for key in ("sha256", "bytes", "device", "inode", "hardlinkCount"):
            assert after[key] == before[key], path
        assert after["mode"] == before["mode"] | stat.S_IWUSR, path
        assert binding(ROOT / row["sourceBefore"]["path"]) == row["sourceBefore"], path
        changed.append({**row, "outputAfter": after, "onlyOwnerWritePermissionAdded": True, "payloadBytesUnchanged": True, "sourceBytesAndModeUnchanged": True})
    remaining, after_inspection = inspect_outputs()
    assert not remaining, remaining
    result = {"kind": "actualCurrentOutputCopyPermissionRepair", "startedAt": started, "finishedAt": datetime.now(timezone.utc).isoformat(), "scientificApproval": False, "strictNetGain": 0, "outputRoots": [p.relative_to(ROOT).as_posix() for p in OUTPUTS], "beforeInspection": inspected, "afterInspection": after_inspection, "changedOutputFiles": changed, "changedOutputFileCount": len(changed), "remainingReadOnlyCurrentOutputFiles": 0, "sourcePermissionsChanged": False, "historicalSnapshotPermissionsChanged": False, "assetBytesChanged": False, "productionScriptsChanged": False, "buildRun": False}
    receipt.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"receipt": receipt.relative_to(ROOT).as_posix(), "changedOutputCopies": len(changed), "remainingReadOnlyCurrentOutputFiles": 0, "imageBytesChanged": False, "sourceAndHistoricalPermissionsChanged": False, "strictNetGain": 0}, indent=2))


if __name__ == "__main__":
    main()
