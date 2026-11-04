#!/usr/bin/env python3
"""Materialize the exact independently reviewed SH sine-derivative source scope."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CAPSULE = ROOT / "docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction"
MANIFEST_SHA256 = "83797050c6b3a66bd497bc8da0b164758ea7363b7f3ea5fcbb76a05472653068"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    manifest_path = CAPSULE / "integration-manifest.json"
    require(digest(manifest_path) == MANIFEST_SHA256, "The reviewed integration manifest changed")
    manifest = json.loads(manifest_path.read_text())
    receipt_path = ROOT / manifest["reviewReceipt"]["path"]
    require(digest(receipt_path) == manifest["reviewReceipt"]["sha256"], "Independent review receipt changed")
    receipt = json.loads(receipt_path.read_text())
    require(receipt["verdict"] == "PASS" and receipt["authorIndependent"], "Independent source review is not PASS")
    relocation = json.loads((ROOT / manifest["capsuleRelocationPath"]).read_text())
    for item in relocation["files"]:
        require(digest(ROOT / item["retainedPath"]) == item["sha256"], "Retained evidence changed: " + item["retainedPath"])
    require(digest(ROOT / receipt["primarySource"]["path"]) == receipt["primarySource"]["sha256"], "Primary PDF changed")
    for item in manifest["files"]:
        require(digest(ROOT / item["afterPath"]) == item["afterSha256"], "Prepared after-file changed: " + item["path"])
    states = [digest(ROOT / item["path"]) for item in manifest["files"]]
    before = [item["beforeSha256"] for item in manifest["files"]]
    after = [item["afterSha256"] for item in manifest["files"]]
    if states == after:
        print("SH source scope already matches all 8 exact reviewed after-files; no writes.")
        return
    require(states == before, "Live inputs differ from the complete reviewed before-state")
    if not args.write:
        print("SH source scope before-state and retained review guards pass; 8 exact files prepared.")
        return
    for item in manifest["files"]:
        path = ROOT / item["path"]
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes((ROOT / item["afterPath"]).read_bytes())
    require([digest(ROOT / item["path"]) for item in manifest["files"]] == after, "Written bytes differ from reviewed after-state")
    application = {
        "schemaVersion": 1,
        "appliedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "manifestPath": str(manifest_path.relative_to(ROOT)),
        "manifestSha256": MANIFEST_SHA256,
        "scriptPath": str(Path(__file__).resolve().relative_to(ROOT)),
        "scriptSha256": digest(Path(__file__)),
        "exactBeforeAndAfterGuardsPassed": True,
        "filesWritten": [item["path"] for item in manifest["files"]],
        "nativeChecksStillRequired": True,
        "m7Acceptance": False,
    }
    (CAPSULE / "application.receipt.json").write_text(json.dumps(application, indent=2) + "\n")
    print("Applied exactly 8 reviewed SH source-scope files; canonical goal/task objects unchanged.")


if __name__ == "__main__":
    main()
