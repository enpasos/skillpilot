#!/usr/bin/env python3
"""Materialize the exact independently reviewed SH sine-derivative source scope."""
import argparse
import datetime
import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CAPSULE = ROOT / "docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction"
MANIFEST_SHA256 = "3d580f956324418023ecd1e823c18405604dec37931e74431d9bec9c0503b748"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.exists() else None


def validate_retained_transport(manifest, receipt):
    relocation_path = ROOT / manifest["capsuleRelocationPath"]
    require(digest(relocation_path) == manifest["capsuleRelocationSha256"], "Retained-evidence relocation changed")
    relocation = json.loads(relocation_path.read_text())
    expected = {}

    def expect(path, sha256):
        require(path not in expected, "Duplicate retained-evidence source: " + path)
        expected[path] = sha256

    require(len(receipt["files"]) == 18, "The exact 18-file independent review transport is required")
    for item in receipt["files"]:
        expect(item["path"], item["sha256"])
    live_inputs = {path: sha256 for path, sha256 in receipt["boundLiveInputHashes"].items()
                   if Path(path).suffix.lower() != ".pdf"}
    require(len(live_inputs) == 8, "The exact 8 non-PDF reviewed live inputs must be retained")
    for path, sha256 in live_inputs.items():
        expect(path, sha256)
    original_receipt = manifest["originalReviewReceiptPath"]
    supplements = manifest["supplementalTransports"]
    required_supplements = {
        original_receipt,
        str(Path(original_receipt).with_name("baseline-actual-sh-offered-scopes.json")),
    }
    require(len(supplements) == 2 and {item["originalPath"] for item in supplements} == required_supplements,
            "Only the exact receipt and SH baseline supplemental transports are permitted")
    for item in supplements:
        expect(item["originalPath"], item["sha256"])
        if item["originalPath"] == original_receipt:
            require(item["sha256"] == manifest["reviewReceipt"]["sha256"], "Transported receipt hash differs")
    entries = relocation["files"]
    require(len(entries) == 28 and len({item["originalPath"] for item in entries}) == 28,
            "Retained-evidence transport must contain exactly 28 unique files")
    require({item["originalPath"] for item in entries} == set(expected),
            "Retained-evidence transport membership differs from receipt, reviewed inputs and supplements")
    retained_paths = set()
    for item in entries:
        require(item["sha256"] == expected[item["originalPath"]], "Transported evidence hash differs from review binding")
        retained_path = (ROOT / item["retainedPath"]).resolve()
        require(retained_path.is_relative_to(CAPSULE.resolve()), "Retained evidence must remain inside its capsule")
        require(retained_path not in retained_paths, "Duplicate retained-evidence destination")
        retained_paths.add(retained_path)
        require(digest(retained_path) == item["sha256"], "Retained evidence changed: " + item["retainedPath"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    manifest_path = CAPSULE / "integration-manifest-v2.json"
    require(digest(manifest_path) == MANIFEST_SHA256, "The reviewed integration manifest changed")
    manifest = json.loads(manifest_path.read_text())
    receipt_path = ROOT / manifest["reviewReceipt"]["path"]
    require(digest(receipt_path) == manifest["reviewReceipt"]["sha256"], "Independent review receipt changed")
    receipt = json.loads(receipt_path.read_text())
    require(receipt["verdict"] == "PASS" and receipt["authorIndependent"], "Independent source review is not PASS")
    validate_retained_transport(manifest, receipt)
    require(digest(ROOT / receipt["primarySource"]["path"]) == receipt["primarySource"]["sha256"], "Primary PDF changed")
    for item in manifest["files"]:
        require(digest(ROOT / item["afterPath"]) == item["afterSha256"], "Prepared after-file changed: " + item["path"])
    states = [digest(ROOT / item["path"]) for item in manifest["files"]]
    before = [item["beforeSha256"] for item in manifest["files"]]
    after = [item["afterSha256"] for item in manifest["files"]]
    if states == after:
        print("SH source scope matches all 8 reviewed after-files and exact 28-file evidence transport (18 review + 8 inputs + 2 supplements); no writes.")
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
    (CAPSULE / "application-v2.receipt.json").write_text(json.dumps(application, indent=2) + "\n")
    print("Applied exactly 8 reviewed SH source-scope files; canonical goal/task objects unchanged.")


if __name__ == "__main__":
    main()
