"""Check the import artifact rather than claiming Gemini host acceptance."""

from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
repo = root.parents[2]
builder = root / "scripts/package_skill.py"
subprocess.run([sys.executable, str(builder), "--frontend"], check=True, capture_output=True)
output = root / "dist/skillpilot-coach-v1-0.1.0.zip"
first = output.read_bytes()
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
print("Gemini Skill root entries, license, exact source bytes and reproducibility passed.")
