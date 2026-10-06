"""Reproducible, credential-free Gemini SKILL.md upload artifact (Apache-2.0)."""
from pathlib import Path
from hashlib import sha256
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
repo = root.parents[2]
output = root / "dist" / "skillpilot-gemini-poc-0.1.0.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for name, path in [("SKILL.md", root / "skill/SKILL.md"), ("LICENSE", repo / "LICENSE")]:
        info = ZipInfo(name, date_time=(2026, 10, 5, 0, 0, 0))
        info.external_attr = 0o100644 << 16
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, path.read_bytes())
print(f"{output}\nsha256={sha256(output.read_bytes()).hexdigest()}")
