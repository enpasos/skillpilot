#!/usr/bin/env python3
"""Check by default; Root may explicitly apply the frozen technical pointer plan."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import uuid


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve(strict=True)
    plan = json.loads((Path(__file__).parent / "portable-symlink-replacement-plan.json").read_text())
    prepared = []
    for row in plan["links"]:
        link = root / row["path"]
        assert link.is_symlink(), f"Not a symlink: {row['path']}"
        assert os.readlink(link) == row["originalTargetLiteral"], f"Pointer drift: {row['path']}"
        target = root / row["targetLexicalRootRelative"]
        resolved = link.resolve(strict=True)
        assert resolved == (root / row["resolvedRootRelative"]).resolve(strict=True)
        assert resolved.is_relative_to(root)
        assert (link.parent / row["newRelativeTargetLiteral"]).resolve(strict=True) == resolved
        if row["linkTracked"]:
            original_blob = subprocess.check_output(
                ["git", "rev-parse", f":{row['path']}"], cwd=root,
            ).decode().strip()
            assert original_blob == row["indexBlob"], f"Index drift: {row['path']}"
        fresh_hash = digest(target) if target.is_file() else None
        prepared.append((row, fresh_hash))
    for row in plan["unchangedRelativeLinks"]:
        assert os.readlink(root / row["path"]) == row["targetLiteral"], f"Existing relative pointer drift: {row['path']}"

    receipt = {"operation": "apply" if args.apply else "check", "scientificApproval": False,
               "count": len(prepared), "applied": [], "filePayloadHashesFreshlyBound": [],
               "existingRelativePointersUnchanged": len(plan["unchangedRelativeLinks"])}
    for row, fresh_hash in prepared:
        link = root / row["path"]
        if args.apply:
            mode = stat.S_IMODE(link.parent.stat().st_mode)
            temporary = link.parent / (".portable-symlink-" + uuid.uuid4().hex)
            try:
                if not mode & stat.S_IWUSR:
                    link.parent.chmod(mode | stat.S_IWUSR)
                temporary.symlink_to(row["newRelativeTargetLiteral"])
                os.replace(temporary, link)
            finally:
                if temporary.is_symlink():
                    temporary.unlink()
                link.parent.chmod(mode)
            assert os.readlink(link) == row["newRelativeTargetLiteral"]
            receipt["applied"].append(row["path"])
        assert link.resolve(strict=True) == (root / row["resolvedRootRelative"]).resolve(strict=True)
        if fresh_hash is not None:
            assert digest(link) == fresh_hash, f"Target changed during pointer operation: {row['path']}"
            receipt["filePayloadHashesFreshlyBound"].append({"path": row["path"], "sha256": fresh_hash,
                "matchesPreparationSnapshot": fresh_hash == row["fileSha256AtPreparation"]})
    for row in plan["unchangedRelativeLinks"]:
        assert os.readlink(root / row["path"]) == row["targetLiteral"]
    print(json.dumps(receipt, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
