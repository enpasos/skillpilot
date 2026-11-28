"""Trusted local provenance of the four Mathematics Pillow drawings in the 1.3 candidate."""
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path

DIRECTORY = "curricula/DE/Gymnasium/quality/learning-units/math-planar-vector-ladder-20261128-v1/pillow-provenance"
MANIFEST_PATH = DIRECTORY + "/renderer.json"
MANIFEST_SHA256 = "sha256:c33959c8b97b5c204c0ca0c5850259d18271140086415c3a17ede7e1ca1fc92d"
VERIFIER_SHA256 = "sha256:e6e81813db52df2a5bb56219446a533a2aab3a0ac0fef9ba4a8c1b68d3bc02f1"
PROVIDER = "Codex · maßstäbliche Vektorzeichnung mit Python/Pillow"
PROVENANCE_CLASS = "skillpilot-authored-program-drawing"
SOURCE = "hash-bound-python-pillow-render"


def trusted_bytes(path: Path, expected_sha256: str) -> bytes:
    payload = path.read_bytes()
    if "sha256:" + hashlib.sha256(payload).hexdigest() != expected_sha256:
        raise ValueError(f"Program drawing provenance authority differs: {path.name}")
    return payload


def drawing_rows(root: Path, *, replay: bool = False) -> dict[str, dict]:
    """The archive never selects an executable or its trust root."""
    manifest = json.loads(trusted_bytes(root / MANIFEST_PATH, MANIFEST_SHA256))
    if replay:
        verifier = root / DIRECTORY / "verify_pillow.py"
        trusted_bytes(verifier, VERIFIER_SHA256)
        result = subprocess.run([sys.executable, str(verifier), "--verify", "--repository-root", str(root)],
                                capture_output=True, text=True)
        if result.returncode:
            raise ValueError(f"Program drawing replay failed: {result.stderr.strip() or result.stdout.strip()}")
    return {row["goalId"]: row for row in manifest["images"]}


def drawing_evidence(row: dict) -> dict:
    return {"manifestPath": MANIFEST_PATH, "manifestSha256": MANIFEST_SHA256, "rendererOutput": row["rendererOutput"]}


def artifact_path(row: dict) -> str:
    return "assets/goal-visualizations/" + row["output"]["path"].removeprefix("curricula/DE/Gymnasium/visualizations/")
