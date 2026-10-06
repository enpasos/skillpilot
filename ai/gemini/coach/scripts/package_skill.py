"""Build the credential-free Gemini coaching Skill reproducibly (Apache-2.0)."""

import argparse
from hashlib import sha256
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--frontend", action="store_true")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    repo = root.parents[2]
    names = [("SKILL.md", root / "SKILL.md"), ("LICENSE.txt", repo / "LICENSE")]
    output = root / "dist" / "skillpilot-coach-v1-0.1.0.zip"
    output.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
        for name, path in names:
            info = ZipInfo(name, date_time=(2026, 10, 6, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, path.read_bytes())
    artifact = output.read_bytes()
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
    main()
