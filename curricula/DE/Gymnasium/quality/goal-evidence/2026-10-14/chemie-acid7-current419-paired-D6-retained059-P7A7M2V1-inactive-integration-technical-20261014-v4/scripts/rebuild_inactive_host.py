# SPDX-License-Identifier: Apache-2.0
"""Rebuild only an ignored inactive chemistry host from bound physical sources.

Usage: python3 <this-file> /absolute/path/to/a/NEW/ignored/tmp/host
The destination must not exist. This does not run review or central checks.
"""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
OWN = Path(__file__).resolve().parents[1]
MANIFEST = OWN / "checks/REBUILD.current419-final.alias50-assets428-plus-currentM.physical-map.actual.json"
HOST = Path(sys.argv[1]).resolve()
assert HOST.is_relative_to(REPO / "tmp") and not HOST.exists(), "A new ignored tmp destination is required"
DATA = json.loads(MANIFEST.read_text())


def verified(ref):
    source = REPO / ref["path"]
    assert source.is_file() and not source.is_symlink(), source
    assert "sha256:" + hashlib.sha256(source.read_bytes()).hexdigest() == ref["sha256"], source
    return source


def branch(path):
    if path.is_symlink():
        children = list(path.resolve(strict=True).iterdir())
        path.unlink()
        path.mkdir()
        for child in children:
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
    elif not path.exists():
        path.mkdir()
    assert path.is_dir() and not path.is_symlink()


def leaf(path):
    current = HOST
    for part in path.relative_to(HOST).parts[:-1]:
        current /= part
        branch(current)
    if path.is_symlink() or path.is_file():
        path.unlink()
    else:
        assert not path.exists(), path


# All immutable sources are checked before making the destination.
for row in DATA["aliases"]:
    verified(row["physicalRepositorySource"])
for row in DATA["selectedCurrentAssetRows"]:
    verified(row["physicalRepositorySource"])
for key in ("integrationMemoryConfig", "integrationMemoryReview", "centralConfig"):
    verified(DATA[key])
HOST.mkdir(parents=True)
for source in REPO.iterdir():
    if source.name in ("tmp", ".git", "app"):
        continue
    (HOST / source.name).symlink_to(source, target_is_directory=source.is_dir())
(HOST / "app").mkdir()
for source in (REPO / "app").iterdir():
    if source.name == "scripts":
        shutil.copytree(source, HOST / "app/scripts")
    else:
        (HOST / "app" / source.name).symlink_to(source, target_is_directory=source.is_dir())
for row in DATA["aliases"]:
    dest = HOST / row["normalHostAlias"]
    leaf(dest)
    shutil.copy2(verified(row["physicalRepositorySource"]), dest)
for row in DATA["selectedCurrentAssetRows"]:
    source = verified(row["physicalRepositorySource"])
    for key in ("normalCanonicalDestination", "normalPublicDestination"):
        dest = HOST / row[key]
        leaf(dest)
        if key == "normalPublicDestination" and row["publicMustBePhysicalWithinHostPublicRoot"]:
            shutil.copy2(source, dest)
            assert dest.resolve().is_relative_to((HOST / "app/public").resolve())
        else:
            dest.symlink_to(source)
# Reproduce O305's zero regular chemie-*.md discovery input. Full history is
# retained in the real source checkout and evidence packages, never deleted.
review_root = HOST / "curricula/DE/Gymnasium/quality/goal-visualization-review"
parent = HOST
for part in review_root.relative_to(HOST).parts[:-1]:
    parent /= part
    branch(parent)
if review_root.is_symlink():
    review_root.unlink()
else:
    assert not review_root.exists(), review_root
review_root.mkdir()
print(json.dumps({"host": str(HOST), "aliases": len(DATA["aliases"]),
                  "assets": len(DATA["selectedCurrentAssetRows"]),
                  "physicalPublicSeven": 7, "centralExecuted": False}))
