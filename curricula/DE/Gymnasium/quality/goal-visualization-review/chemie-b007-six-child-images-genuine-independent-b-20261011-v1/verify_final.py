"""Verify the sealed independent V review using repository-relative bindings."""

import hashlib
import json
from pathlib import Path, PureWindowsPath
import subprocess
import sys

sys.dont_write_bytecode = True
REPO_ROOT = Path(__file__).resolve().parents[6]
REVIEW_ROOT = Path(__file__).resolve().parent
FINAL_PATH = REVIEW_ROOT / "FINAL.six-child-images.independent-b.freeze.json"
sys.path.insert(0, str(REPO_ROOT / "scripts"))
from validate_schemas import curriculum_symlink_errors, validate_file


def main():
    freeze = json.loads(FINAL_PATH.read_text(encoding="utf-8"))
    expected_owned = {record["path"] for record in freeze["ownedFiles"]}
    actual_owned = {
        path.relative_to(REPO_ROOT).as_posix()
        for path in REVIEW_ROOT.rglob("*")
        if path.is_file() and path != FINAL_PATH
    }
    assert expected_owned == actual_owned, "Unsealed or missing owned file"
    committable = {
        path.decode()
        for path in subprocess.check_output(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z", "--"],
            cwd=REPO_ROOT,
        ).split(b"\0")
        if path
    }
    for record in freeze["ownedFiles"] + freeze["externalExactBindings"]:
        relative = Path(record["path"])
        assert not relative.is_absolute()
        assert not PureWindowsPath(record["path"]).is_absolute()
        assert ".." not in relative.parts
        path = REPO_ROOT / relative
        assert path.is_file() and not path.is_symlink(), record["path"]
        assert record["path"] in committable, record["path"]
        data = path.read_bytes()
        assert len(data) == record["bytes"], record["path"]
        assert "sha256:" + hashlib.sha256(data).hexdigest() == record["sha256"], record["path"]
    schema = json.loads((REPO_ROOT / "docs/landscape-runtime.schema.json").read_text())
    for path in REVIEW_ROOT.rglob("*.json"):
        assert validate_file(str(path), schema), str(path)
    assert FINAL_PATH.relative_to(REPO_ROOT).as_posix() in committable
    errors = curriculum_symlink_errors(REPO_ROOT)
    assert not errors, errors
    first = json.loads((REVIEW_ROOT / "FIRST.six-child-images.independent-b.json").read_text())
    qa = json.loads((REVIEW_ROOT / "chemie.six-child-images.independent-b.qa.json").read_text())
    assert len(first["records"]) == len(qa["records"]) == 6
    first_by_id = {row["goalId"]: row for row in first["records"]}
    for row in qa["records"]:
        initial = first_by_id[row["goalId"]]
        assert row["assetSha256"] == row["aiApprovedAssetSha256"] == initial["asset"]["sha256"]
        assert row["aiApproved"] == "yes" and row["humanApproved"] == "no"
        assert row["title"] == initial["wholeGoal"]["title"]
        assert row["description"] == initial["wholeGoal"]["description"]
    assert freeze["strictGain"] == 0
    assert not freeze["humanApproval"] and not freeze["humanTrial"]
    print(json.dumps({
        "portableFinalVerificationPassed": True,
        "ownedFiles": len(freeze["ownedFiles"]),
        "externalExactBindings": len(freeze["externalExactBindings"]),
        "exactQaRows": len(qa["records"]),
        "rootCurriculumSymlinkErrors": errors,
        "finalSha256": "sha256:" + hashlib.sha256(FINAL_PATH.read_bytes()).hexdigest(),
        "strictGain": 0,
        "humanApproval": False,
        "humanTrial": False,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
