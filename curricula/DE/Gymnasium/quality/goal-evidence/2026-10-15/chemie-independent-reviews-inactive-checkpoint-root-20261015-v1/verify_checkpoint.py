# SPDX-License-Identifier: Apache-2.0
"""Verify this finite evidence checkpoint without granting scientific approval."""
import ast
import hashlib
import json
from pathlib import Path
import subprocess


REPO = Path(__file__).resolve().parents[7]
DATE_ROOT = Path(__file__).resolve().parent.parent
SEALED_PACKAGES = {
    "chemie-acid-analytics-ten-current419-native-preparation-technical-20261015-v1":
        ("FILES.finite-technical-native-ten.seal.json",
         "7721b2b9e0c0e57d3e39840e9509c20dbebb773804371197aed304e36c255df9"),
    "chemie-acid-analytics-ten-current419-independent-a-20261015-v1":
        ("FILES.final-checkpoint-stop.seal.json",
         "3ce616d36210587951928bc08cc5144831b8f3979d541f6af70b83f7fe24485f"),
    "chemie-three-source-duty-carriers-prospective422-fresh-independent-a-20261015-v1":
        ("FILES.finite-own-artifacts.seal.json",
         "1338b5587d6281ebeff420529368d5feb8908a81614fef8eb7511a2d638c4fac"),
}


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    assert (REPO / "AGENTS.md").is_file(), REPO
    packages = []
    parsed_json = parsed_jsonl_rows = python_files = 0
    for name, (seal_name, expected_digest) in SEALED_PACKAGES.items():
        package = DATE_ROOT / name
        seal = package / seal_name
        assert digest(seal) == expected_digest, seal
        data = json.loads(seal.read_text())
        expected_paths = {seal}
        for row in data["files"]:
            relative = Path(row["path"])
            assert not relative.is_absolute(), row["path"]
            path = (REPO if relative.parts[0] == "curricula" else package) / relative
            assert path.resolve().is_relative_to(package.resolve()), path
            assert path.is_file() and not path.is_symlink(), path
            assert digest(path) == row["sha256"].removeprefix("sha256:"), path
            assert path.stat().st_size == row["bytes"], path
            expected_paths.add(path)
        actual = {p for p in package.rglob("*") if p.is_file() or p.is_symlink()}
        assert actual == expected_paths, (name, actual ^ expected_paths)
        for path in actual:
            if path.suffix == ".json":
                json.loads(path.read_text())
                parsed_json += 1
            elif path.suffix == ".jsonl":
                for line in path.read_text().splitlines():
                    if line.strip():
                        json.loads(line)
                        parsed_jsonl_rows += 1
            elif path.suffix == ".py":
                ast.parse(path.read_text(), filename=str(path))
                python_files += 1
        packages.append({
            "path": package.relative_to(REPO).as_posix(),
            "seal": seal_name,
            "sha256": "sha256:" + expected_digest,
            "physicalFiles": len(actual),
            "bytes": sum(p.stat().st_size for p in actual),
        })
    status = subprocess.run(
        ["git", "diff", "--name-only", "HEAD", "--"], cwd=REPO,
        check=True, capture_output=True, text=True,
    ).stdout.splitlines()
    permitted = {
        "docs/qa-ci/index.md",
        "docs/qa-ci/chemie-independent-reviews-checkpoint-2026-10-15.md",
    }
    prefix = DATE_ROOT.relative_to(REPO).as_posix() + "/"
    assert all(path.startswith(prefix) or path in permitted for path in status), status
    print(json.dumps({
        "schemaVersion": 1,
        "scope": "finite technical integrity, not scientific completion",
        "packages": packages,
        "jsonFilesParsed": parsed_json,
        "jsonlRowsParsed": parsed_jsonl_rows,
        "pythonFilesASTParsed": python_files,
        "packageSealsAndAllOwnedBytesMatch": True,
        "trackedChangesWithinCheckpointScope": True,
        "newStrictClosures": 0,
        "restoredCompletionBindings": 0,
        "humanApproval": False,
        "humanTrial": False,
    }, indent=2))


if __name__ == "__main__":
    main()
