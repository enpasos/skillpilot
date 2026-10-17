# SPDX-License-Identifier: Apache-2.0
"""Verify the frozen checkpoint bytes without writing or reissuing reviews."""
import hashlib
import json
from pathlib import Path


def main():
    here = Path(__file__).resolve().parent
    root = next(p for p in here.parents if (p / "contracts").is_dir()
                and (p / "curricula").is_dir() and (p / "app").is_dir())
    manifest = json.loads((here / "MANIFEST.visible-reviewed-checkpoint.json").read_text())
    for entry in manifest["files"]:
        path = (root / entry["path"]).resolve()
        assert path.is_relative_to(root), entry["path"]
        data = path.read_bytes()
        assert len(data) == entry["bytes"], entry["path"]
        assert hashlib.sha256(data).hexdigest() == entry["sha256"], entry["path"]
        name = path.name
        if name.endswith((".json", ".json.snapshot")):
            json.loads(data)
        elif name.endswith((".jsonl", ".jsonl.snapshot")):
            for line in data.splitlines():
                if line.strip():
                    json.loads(line)
    old = (root / manifest["previousP439"]).read_bytes().splitlines(keepends=True)
    new = (root / manifest["currentP439"]).read_bytes().splitlines(keepends=True)
    ids = set(manifest["fiveReplacedGoalIds"])
    assert len(old) == len(new) == 439
    assert {json.loads(a)["goalId"] for a in old} == {json.loads(a)["goalId"] for a in new}
    assert {json.loads(a)["goalId"] for a, b in zip(old, new) if a != b} == ids
    assert sum(a == b for a, b in zip(old, new)) == 434
    assert next(a for a in old if json.loads(a)["goalId"].startswith("3c9bfa10")) == next(
        a for a in new if json.loads(a)["goalId"].startswith("3c9bfa10"))
    print(f"PASS: {len(manifest['files'])} pinned files; P439 replaces exactly five rows; "
          "434 rows and the earlier CFC/HFC correction remain exact. No M7 or human approval claim.")


if __name__ == "__main__":
    main()
