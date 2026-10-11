"""Preserve active reviewed bytes and restore pre-import local hardlink copies.

The native importer wrote through eight shared source inodes. Each original is
available as an independent pre-import copy and is verified against HEAD. This
driver first detaches the active path, then restores the retained old inode.
It never retouches or regenerates image pixels.
"""

import datetime
import hashlib
import json
import os
import pathlib
import stat
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUTPUT = pathlib.Path(__file__).resolve().parent
IDS = ["7c72848d-8bc9-58e2-a690-fd17ac650a88", "543bf91f-f6c6-5b1b-ba9e-43de321d8c7f",
       "1826fe19-4d06-5183-9b41-9121ae1cc219", "648224f4-cc8f-5f41-9cae-6d783cd1ae77"]


def sha(data):
    return "sha256:" + hashlib.sha256(data).hexdigest()


def main():
    receipt_path = OUTPUT / "07-eight-source-files-detached-and-original-local-alias-inodes-restored.receipt.json"
    assert not receipt_path.exists()
    rows = []
    for goal_id in IDS:
        for name in [goal_id + ".png", "prompt.de.md"]:
            relative = pathlib.Path("curricula/DE/Gymnasium/visualizations/wirtschaftswissenschaften") / goal_id / name
            active = ROOT / relative
            preserved = OUTPUT / "unchanged-predecessor-source-history" / goal_id / name
            current_bytes = active.read_bytes()
            original_bytes = preserved.read_bytes()
            head_bytes = subprocess.check_output(["git", "show", "HEAD:" + str(relative)], cwd=ROOT)
            assert original_bytes == head_bytes
            assert preserved.stat().st_nlink == 1
            previous_stat = active.stat()
            assert previous_stat.st_nlink > 1
            assert not active.is_symlink()
            with active.open("r+b") as retained_old_inode:
                descriptor_stat = os.fstat(retained_old_inode.fileno())
                assert descriptor_stat.st_ino == previous_stat.st_ino
                temp_descriptor, temp_name = tempfile.mkstemp(prefix=".qualified-detach-", dir=active.parent)
                try:
                    with os.fdopen(temp_descriptor, "wb") as new_file:
                        new_file.write(current_bytes)
                        new_file.flush()
                        os.fsync(new_file.fileno())
                    os.chmod(temp_name, stat.S_IMODE(previous_stat.st_mode))
                    os.replace(temp_name, active)
                finally:
                    if os.path.exists(temp_name):
                        os.unlink(temp_name)
                assert active.read_bytes() == current_bytes
                assert active.stat().st_nlink == 1
                assert active.stat().st_ino != descriptor_stat.st_ino
                retained_old_inode.seek(0)
                retained_old_inode.write(original_bytes)
                retained_old_inode.truncate()
                retained_old_inode.flush()
                os.fsync(retained_old_inode.fileno())
                retained_old_inode.seek(0)
                assert retained_old_inode.read() == original_bytes
                old_after_stat = os.fstat(retained_old_inode.fileno())
                assert old_after_stat.st_nlink == previous_stat.st_nlink - 1
                rows.append({"activePath": str(relative), "beforeSharedInode": descriptor_stat.st_ino,
                             "beforeLinkCount": previous_stat.st_nlink, "activeNewInode": active.stat().st_ino,
                             "activeLinkCount": 1, "activeQualifiedBytesUnchanged": sha(current_bytes),
                             "originalPreImportBytesAndHeadExact": sha(original_bytes),
                             "remainingPriorLocalAliasesRestoredOnOriginalInode": old_after_stat.st_nlink})
            assert active.read_bytes() == current_bytes
            assert preserved.read_bytes() == original_bytes
    receipt = {"status": "EIGHT_ACTIVE_SOURCE_FILES_ATOMICALLY_DETACHED_ORIGINAL_LOCAL_SHARED_INODES_RESTORED",
               "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "records": rows,
               "activeImageAndPromptContentsChangedByRepair": 0,
               "originalWholeHeadBytesVerified": 8, "repositoryQHistoricalAliasesFoundByIndependentA": 0,
               "scope": "Only the eight old source inodes written by this fourteen-image import. External alias names were not read; every remaining alias shares the exactly restored original inode.",
               "imagePixelEditing": False, "newReviewOrHumanClaim": False}
    receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"sourceFilesDetached": len(rows), "activeContentsUnchanged": True,
                      "priorAliasOriginalBytesRestored": sum(row["remainingPriorLocalAliasesRestoredOnOriginalInode"] for row in rows)}))


if __name__ == "__main__":
    main()
