"""Prepare byte-exact copies of the preserved Gemini import artifact (Apache-2.0)."""

import argparse
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
import sys
from zipfile import BadZipFile, ZipFile


ARCHIVE_NAME = "skillpilot-coach-v1-0.1.0.zip"
IMPORTED_SHA256 = "2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40"


def import_artifact(root, repo):
    """Validate the tested artifact and its current sources before copying it."""
    artifact = (root / "artifacts" / ARCHIVE_NAME).read_bytes()
    if sha256(artifact).hexdigest() != IMPORTED_SHA256:
        raise ValueError("preserved 0.1.0 archive differs from the imported artifact")
    sources = [("SKILL.md", root / "SKILL.md"), ("LICENSE.txt", repo / "LICENSE")]
    with ZipFile(BytesIO(artifact)) as archive:
        if archive.namelist() != [name for name, _path in sources]:
            raise ValueError("preserved archive must contain only SKILL.md and LICENSE.txt")
        for name, path in sources:
            if archive.read(name) != path.read_bytes():
                raise ValueError(f"{name} differs from the preserved 0.1.0 artifact; prepare a new versioned candidate")
    return artifact, sources


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--frontend", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    repo = root.parents[2]
    # DEFLATE output can vary with the host's zlib. The host-tested ZIP itself
    # is the immutable input; deployment never recreates its compressed bytes.
    artifact, names = import_artifact(root, repo)
    output = root / "dist" / ARCHIVE_NAME
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(artifact)
    receipt = {
        "schemaVersion": 1,
        "name": "skillpilot-coach-v1",
        "provider": "gemini-v1",
        "version": "0.1.0",
        "status": "LOCAL_CANDIDATE",
        "actualGeminiHostAcceptance": "NOT_RUN",
        "sha256": sha256(artifact).hexdigest(),
        "files": {name: sha256(path.read_bytes()).hexdigest() for name, path in names},
    }
    (output.parent / "manifest.json").write_text(json.dumps(receipt, indent=2) + "\n")
    if args.frontend:
        public = repo / "app/public/plugins/gemini"
        public.mkdir(parents=True, exist_ok=True)
        (public / output.name).write_bytes(artifact)
    print(json.dumps({"path": str(output), "sha256": receipt["sha256"]}))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, BadZipFile) as error:
        print(f"Gemini import artifact check failed: {error}", file=sys.stderr)
        sys.exit(1)
