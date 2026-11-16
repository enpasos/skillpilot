#!/usr/bin/env python3
"""Verify retained validation artifacts, optionally restore under a new directory."""
import argparse
import gzip
import hashlib
import json
import lzma
from pathlib import Path
import shutil
import struct
import subprocess
import tempfile
import zlib


def digest(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda: f.read(1024 * 1024), b""):
            h.update(b)
    return h.hexdigest()


def restore(artifact, repo, destination):
    retained = (repo / artifact["retainedPath"]).resolve()
    if not retained.is_relative_to(repo):
        raise ValueError("Retained path escapes repository")
    if (retained.stat().st_size, digest(retained)) != (
        artifact["retainedBytes"], artifact["retainedSha256"]
    ):
        raise ValueError(f"Retained bytes differ: {retained}")
    relative = Path(artifact["sourcePath"])
    if relative.is_absolute() or ".." in relative.parts:
        raise ValueError("Unsafe original source path")
    target = destination / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    compression = artifact["compression"]
    opener = {"identity": Path.open, "gzip": gzip.open, "xz": lzma.open,
              "xz-gzip-content": lzma.open}[compression]
    with opener(retained, "rb") as src, target.open("xb") as out:
        if compression != "xz-gzip-content":
            shutil.copyfileobj(src, out, 1024 * 1024)
        else:
            spec = artifact["gzipReconstruction"]
            out.write(bytes.fromhex(spec["headerHex"]))
            out.flush()
            payload_hash = hashlib.sha256()
            crc = size = 0
            if spec["engine"] == "python-zlib":
                if zlib.ZLIB_RUNTIME_VERSION != spec["zlibVersion"]:
                    raise RuntimeError("Exact gzip reconstruction requires Python zlib " + spec["zlibVersion"])
                encoder = zlib.compressobj(spec["level"], zlib.DEFLATED, -15, 8, 0)
                process = None
            else:
                # The Node maps were compressed by this exact bundled zlib.
                command = """const z=require('zlib'),p=require('stream/promises');
if(process.versions.zlib!==process.argv[1])process.exit(72);
p.pipeline(process.stdin,z.createDeflateRaw({level:9,windowBits:15,memLevel:8,strategy:0}),process.stdout).catch(()=>process.exit(73));"""
                process = subprocess.Popen(
                    ["node", "-e", command, spec["zlibVersion"]],
                    stdin=subprocess.PIPE, stdout=out,
                )
            for b in iter(lambda: src.read(1024 * 1024), b""):
                payload_hash.update(b)
                size += len(b)
                crc = zlib.crc32(b, crc)
                if process:
                    process.stdin.write(b)
                else:
                    out.write(encoder.compress(b))
            if process:
                process.stdin.close()
                if process.wait() != 0:
                    raise RuntimeError("Exact gzip reconstruction requires Node zlib " + spec["zlibVersion"])
            else:
                out.write(encoder.flush())
            if (size, payload_hash.hexdigest()) != (spec["payloadBytes"], spec["payloadSha256"]):
                raise ValueError("Decoded gzip payload differs")
            out.write(struct.pack("<II", crc, size & 0xffffffff))
    if (target.stat().st_size, digest(target)) != (artifact["sourceBytes"], artifact["sourceSha256"]):
        raise ValueError(f"Original source bytes were not reproduced: {target}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--restore-under", type=Path, help="Create this new directory; never overwrite original tmp files")
    args = parser.parse_args()
    folder = Path(__file__).resolve().parent
    repo = folder.parents[3]
    manifest = json.loads((folder / "validation-retention.actual.json").read_text())
    temporary = tempfile.TemporaryDirectory(prefix="spectrum-retention-") if not args.restore_under else None
    destination = Path(temporary.name) if temporary else args.restore_under.resolve()
    if not temporary:
        destination.mkdir(parents=True, exist_ok=False)
    try:
        for artifact in manifest["artifacts"]:
            restore(artifact, repo, destination)
        for reference in manifest.get("referencedHelpers", []):
            p = repo / reference["retainedPath"]
            if (p.stat().st_size, digest(p)) != (reference["retainedBytes"], reference["retainedSha256"]):
                raise ValueError("Referenced helper differs")
        print(f"Verified {len(manifest['artifacts'])} original artifacts and {len(manifest.get('referencedHelpers', []))} referenced helper; all original byte counts and SHA-256 values match.")
    finally:
        if temporary:
            temporary.cleanup()


if __name__ == "__main__":
    main()
