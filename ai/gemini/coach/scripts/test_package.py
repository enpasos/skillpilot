"""Check the import artifact rather than claiming Gemini host acceptance."""

from hashlib import sha256
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from unittest.mock import patch
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
repo = root.parents[2]
builder = root / "scripts/package_skill.py"
subprocess.run([sys.executable, str(builder), "--frontend"], check=True, capture_output=True)
output = root / "dist/skillpilot-coach-v1-0.1.0.zip"
first = output.read_bytes()
preserved = root / "artifacts/skillpilot-coach-v1-0.1.0.zip"
assert first == preserved.read_bytes(), "Preparation must retain the exact imported archive bytes"
assert sha256(first).hexdigest() == "2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40"
subprocess.run([sys.executable, str(builder), "--frontend"], check=True, capture_output=True)
assert output.read_bytes() == first, "ZIP bytes must be reproducible"
assert (repo / "app/public/plugins/gemini" / output.name).read_bytes() == first
with ZipFile(output) as archive:
    assert archive.namelist() == ["SKILL.md", "LICENSE.txt"]
    assert archive.testzip() is None
    assert archive.read("SKILL.md") == (root / "SKILL.md").read_bytes()
    assert archive.read("LICENSE.txt") == (repo / "LICENSE").read_bytes()
    assert all(entry.date_time == (2026, 10, 6, 0, 0, 0) for entry in archive.infolist())
manifest = json.loads((root / "dist/manifest.json").read_text())
assert manifest["sha256"] == sha256(first).hexdigest()
assert manifest["status"] == "LOCAL_CANDIDATE"
assert manifest["actualGeminiHostAcceptance"] == "NOT_RUN"

# Use a disposable checkout to prove preparation never invokes the host
# compressor and rejects drift before overwriting an existing download.
spec = importlib.util.spec_from_file_location("gemini_package_builder", builder)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
with tempfile.TemporaryDirectory() as directory:
    fixture_repo = Path(directory) / "repo"
    fixture_root = fixture_repo / "ai/gemini/coach"
    fixture_artifact = fixture_root / "artifacts" / output.name
    fixture_artifact.parent.mkdir(parents=True)
    fixture_artifact.write_bytes(first)
    (fixture_root / "SKILL.md").write_bytes((root / "SKILL.md").read_bytes())
    (fixture_repo / "LICENSE").write_bytes((repo / "LICENSE").read_bytes())
    fixture_builder = fixture_root / "scripts/package_skill.py"
    fixture_output = fixture_root / "dist" / output.name
    fixture_public = fixture_repo / "app/public/plugins/gemini" / output.name
    with patch.object(module, "__file__", str(fixture_builder)), \
         patch.object(sys, "argv", [str(fixture_builder), "--frontend"]), \
         patch("zipfile._get_compressor", side_effect=AssertionError("Host compression must never run")):
        module.main()
        assert fixture_output.read_bytes() == first
        assert fixture_public.read_bytes() == first
        for source in (fixture_root / "SKILL.md", fixture_repo / "LICENSE", fixture_artifact):
            original = source.read_bytes()
            source.write_bytes(original + b"changed")
            try:
                module.main()
            except ValueError as error:
                assert "preserved" in str(error)
            else:
                raise AssertionError("Changed source or artifact must fail before copying")
            finally:
                source.write_bytes(original)
            assert fixture_output.read_bytes() == first, "Failed validation must preserve dist"
            assert fixture_public.read_bytes() == first, "Failed validation must preserve the download"
        fixture_artifact.unlink()
        try:
            module.main()
        except FileNotFoundError:
            pass
        else:
            raise AssertionError("A missing archive must fail rather than be recompressed")
        assert fixture_public.read_bytes() == first

print("Gemini Skill exact imported bytes, source integrity, no recompression and failure isolation passed.")
