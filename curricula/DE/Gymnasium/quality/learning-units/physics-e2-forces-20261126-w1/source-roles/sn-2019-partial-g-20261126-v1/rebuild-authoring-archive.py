#!/usr/bin/env python3
"""Rebuild the externally retained SN authoring archive from its exact inputs."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import tarfile

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / "app/package.json").is_file())


def archive_bytes(bindings):
    tar_buffer = io.BytesIO()
    with tarfile.open(fileobj=tar_buffer, mode="w", format=tarfile.PAX_FORMAT) as archive:
        for binding in sorted(bindings, key=lambda row: row["path"]):
            relative = Path(binding["path"])
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError("Unsafe authoring input path")
            raw = (ROOT / relative).read_bytes()
            if hashlib.sha256(raw).hexdigest() != binding["sha256"]:
                raise ValueError("Authoring input changed: " + relative.as_posix())
            entry = tarfile.TarInfo(relative.as_posix())
            entry.size, entry.mode, entry.mtime = len(raw), 0o644, 0
            entry.uid = entry.gid = 0
            entry.uname = entry.gname = ""
            archive.addfile(entry, io.BytesIO(raw))
    output = io.BytesIO()
    with gzip.GzipFile(filename="", fileobj=output, mode="wb", compresslevel=9, mtime=0) as compressed:
        compressed.write(tar_buffer.getvalue())
    return output.getvalue()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    target = args.output.resolve()
    if target.is_relative_to(ROOT):
        raise ValueError("Retain regenerated authoring output outside the repository")
    manifest = json.loads((HERE / "authoring-inputs.successor.actual.json").read_text())
    raw = archive_bytes(manifest["inputs"])
    digest = hashlib.sha256(raw).hexdigest()
    if digest != manifest["externalArchive"]["sha256"]:
        raise ValueError("Regenerated authoring archive differs from its accepted hash")
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("xb") as stream:
        stream.write(raw)
    print(json.dumps({"status": "PASS", "inputs": len(manifest["inputs"]), "sha256": digest}))


if __name__ == "__main__":
    main()
