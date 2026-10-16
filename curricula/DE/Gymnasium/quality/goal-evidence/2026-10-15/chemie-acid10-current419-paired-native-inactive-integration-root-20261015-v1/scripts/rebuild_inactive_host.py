# SPDX-License-Identifier: Apache-2.0
"""Reconstruct a NEW ignored host from finite physical repository bindings.

Usage: python3 <this-file> /absolute/path/inside/repository/tmp/NEW-host
This creates no scientific outcomes and runs no checker.
"""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())
OWN = Path(__file__).resolve().parents[1]
DATA = json.loads((OWN / "checks/REBUILD.current419-P10-A7-native-pair.physical-map.json").read_text())
HOST = Path(sys.argv[1]).resolve()
assert HOST.is_relative_to(REPO / "tmp") and not HOST.exists()


def verified(row):
    source = REPO / row["path"]
    assert source.is_file() and not source.is_symlink(), source
    assert source.stat().st_size == row["bytes"]
    assert "sha256:" + hashlib.sha256(source.read_bytes()).hexdigest() == row["sha256"], source
    return source


for row in DATA["aliases"]:
    verified(row["physicalRepositorySource"])
for row in DATA["selectedCurrentAssetRows"]:
    verified(row["physicalRepositorySource"])
for row in DATA["stockPhysicalModules"]:
    verified(row)
HOST.mkdir(parents=True)
for source in REPO.iterdir():
    if source.name not in ("app", "tmp", ".git"):
        (HOST / source.name).symlink_to(source, target_is_directory=source.is_dir())
(HOST / "app").mkdir()
for source in (REPO / "app").iterdir():
    if source.name != "scripts":
        (HOST / "app" / source.name).symlink_to(source, target_is_directory=source.is_dir())
(HOST / "app/scripts").mkdir()


def branch(path):
    if path.is_symlink():
        children = list(path.resolve(strict=True).iterdir())
        path.unlink()
        path.mkdir()
        for child in children:
            (path / child.name).symlink_to(child, target_is_directory=child.is_dir())
    elif not path.exists():
        path.mkdir()
    assert path.is_dir() and not path.is_symlink(), path


def install(source, destination, physical=False):
    current = HOST
    for part in destination.relative_to(HOST).parts[:-1]:
        current /= part
        branch(current)
    if destination.is_file() or destination.is_symlink():
        destination.unlink()
    else:
        assert not destination.exists(), destination
    if physical:
        shutil.copy2(source, destination)
    else:
        destination.symlink_to(source)


for row in DATA["stockPhysicalModules"]:
    install(verified(row), HOST / row["path"], True)
for row in DATA["aliases"]:
    install(verified(row["physicalRepositorySource"]), HOST / row["normalHostAlias"], True)
for row in DATA["selectedCurrentAssetRows"]:
    source = verified(row["physicalRepositorySource"])
    install(source, HOST / row["normalCanonicalDestination"])
    install(source, HOST / row["normalPublicDestination"], row["publicMustBePhysicalWithinHostPublicRoot"])
# Reproduce the frozen baseline discovery input without touching real history.
# This is an inactive current419 comparison, not active whole-main quality approval.
assert DATA["legacyQaDispositionDiscoveryInput"]
review_root = HOST / "curricula/DE/Gymnasium/quality/goal-visualization-review"
current = HOST
for part in review_root.relative_to(HOST).parts[:-1]:
    current /= part
    branch(current)
assert review_root.is_symlink()
review_root.unlink()
review_root.mkdir()
print(json.dumps({"host": HOST.relative_to(REPO).as_posix(), "aliases": len(DATA["aliases"]), "assets": len(DATA["selectedCurrentAssetRows"]), "physicalPublicLeaves": 10, "stockModules": len(DATA["stockPhysicalModules"]), "checksRun": False}))
