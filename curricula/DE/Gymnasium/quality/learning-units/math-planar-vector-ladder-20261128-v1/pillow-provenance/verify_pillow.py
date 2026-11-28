"""Reproduce the four V1 vector figures and compare their repository PNG bytes."""

import argparse
import hashlib
import json
import platform
import subprocess
import sys
import tempfile
from pathlib import Path

MANIFEST_PATH = Path(__file__).with_name("renderer.json")
MANIFEST_SHA256 = "sha256:c33959c8b97b5c204c0ca0c5850259d18271140086415c3a17ede7e1ca1fc92d"
REPOSITORY_ROOT = Path(__file__).resolve().parents[7]
# The original renderer uses the DejaVu directory provided by fonts-dejavu-core.
FONT_DIRECTORY = Path("/usr/share/fonts/truetype/dejavu")


def check_digest(data: bytes, expected: str, label: str) -> None:
    actual = "sha256:" + hashlib.sha256(data).hexdigest()
    if actual != expected:
        raise ValueError(f"SHA-256 mismatch for {label}: {actual}, expected {expected}")


def verify(repository_root: Path) -> None:
    import PIL
    from PIL import features

    manifest_bytes = MANIFEST_PATH.read_bytes()
    check_digest(manifest_bytes, MANIFEST_SHA256, MANIFEST_PATH.name)
    manifest = json.loads(manifest_bytes)
    environment = manifest["environment"]
    runtime = {
        "pythonImplementation": platform.python_implementation(),
        "pillowVersion": PIL.__version__,
        "freetypeVersion": features.version("freetype2"),
        "zlibVersion": features.version("zlib"),
        "raqmVersion": features.version("raqm"),
        "harfbuzzVersion": features.version("harfbuzz"),
        "fribidiVersion": features.version("fribidi"),
    }
    for key, value in runtime.items():
        if environment[key] != value:
            raise ValueError(f"{key} is {value}; the renderer requires {environment[key]}")

    for font in environment["fonts"]:
        path = FONT_DIRECTORY / font["filename"]
        check_digest(path.read_bytes(), font["sha256"], font["filename"])

    renderer = manifest["renderer"]
    script = (repository_root / renderer["path"]).read_bytes()
    check_digest(script, renderer["sha256"], renderer["path"])
    with tempfile.TemporaryDirectory(prefix="skillpilot-pillow-") as directory:
        output = Path(directory)
        private_script = output / "render.py"
        private_script.write_bytes(script)
        subprocess.run([sys.executable, "-I", "-B", str(private_script)], cwd=output,
                       check=True, timeout=30)
        for image in manifest["images"]:
            prompt = image["prompt"]
            check_digest((repository_root / prompt["path"]).read_bytes(), prompt["sha256"], prompt["path"])
            asset = image["output"]
            supplied = (repository_root / asset["path"]).read_bytes()
            rendered = (output / image["rendererOutput"]).read_bytes()
            if supplied != rendered:
                raise ValueError(f"{asset['path']}: PNG differs from the original Pillow output")
            check_digest(supplied, asset["sha256"], asset["path"])
            if len(supplied) != asset["bytes"]:
                raise ValueError(f"{asset['path']}: unexpected PNG size")
    print(f"Verified {len(manifest['images'])} original PNGs using CPython {platform.python_version()} "
          f"and Pillow {PIL.__version__}; authoring CPython {environment['pythonVersion']}.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", action="store_true", help="verify all four figures (the default)")
    parser.add_argument("--repository-root", type=Path, default=REPOSITORY_ROOT,
                        help="repository supplying the bound renderer, prompts and PNGs")
    args = parser.parse_args()
    try:
        verify(args.repository_root.resolve())
    except (ImportError, OSError, ValueError, subprocess.SubprocessError) as error:
        parser.exit(1, f"Planar-vector Pillow provenance: {error}\n")
