"""Run existing validators on this bounded candidate continuation, without adoption."""
import ast
import hashlib
import importlib.util
import json
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
OLD = json.loads((OUT / "affected-normal-schema-syntax-links-and-portable-symlinks.actual.json").read_text())
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09"
FOLDERS = [
    OUT,
    BASE / "biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v7",
    BASE / "biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/six-targeted-phone-and-population-remedies-v1",
]

def binding(path):
    data = path.read_bytes()
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}

spec = importlib.util.spec_from_file_location("normal_validate_schemas", ROOT / "scripts/validate_schemas.py")
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
schema = json.loads((ROOT / normal.SCHEMA_PATH).read_text())
files = {ROOT / name for name in OLD["checkedJsonFiles"] + OLD["syntaxFiles"]}
for folder in FOLDERS:
    files.update(p for p in folder.rglob("*") if p.is_file() and p.suffix in {".json", ".jsonl"})
files.update(OUT.glob("*.py"))
files.add(BASE / "biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1/six-targeted-phone-and-population-remedies-v1/finalize-six-targeted-neutral-images.author.py")
errors = []
checked = []
counts = {"json": 0, "jsonl": 0, "python": 0}
for path in sorted(files):
    try:
        if path.suffix == ".json":
            counts["json"] += 1
            if not normal.validate_file(str(path.relative_to(ROOT)), schema):
                errors.append(f"Normal validation failed: {path.relative_to(ROOT)}")
        elif path.suffix == ".jsonl":
            counts["jsonl"] += 1
            for line in path.read_text().splitlines():
                if line.strip():
                    json.loads(line)
        else:
            counts["python"] += 1
            ast.parse(path.read_text(), filename=str(path))
        checked.append(binding(path))
    except Exception as exc:
        errors.append(f"{path.relative_to(ROOT)}: {exc}")
symlink_errors = normal.curriculum_symlink_errors(ROOT)
errors.extend(symlink_errors)
doc = ROOT / "docs/qa-ci/chemie-biologie-m7-science-and-source-continuation-2026-10-09.md"
links = []
for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", doc.read_text()):
    target = match.group(1).strip().strip("<>")
    if re.match(r"(?:https?://|mailto:|#)", target):
        continue
    target = unquote(target.split("#", 1)[0])
    path = ROOT / target.lstrip("/") if target.startswith("/") else doc.parent / target
    links.append(target)
    if not path.exists():
        errors.append(f"Missing document link: {target}")
diff = subprocess.run(["git", "diff", "--check", "--", "AGENTS.md", str(doc.relative_to(ROOT))], cwd=ROOT, capture_output=True, text=True)
if diff.returncode:
    errors.append(diff.stdout + diff.stderr)
result = {
    "schemaVersion": 1,
    "role": "targeted_existing_normal_validators_and_declared_executable_syntax_after_exact_portability_repair",
    "checkedAt": datetime.now(timezone.utc).isoformat(),
    "historicalFailedReceipt": binding(OUT / "affected-normal-schema-syntax-links-and-portable-symlinks.actual.json"),
    "normalValidator": "scripts/validate_schemas.py::validate_file",
    "normalCommittableSymlinkValidator": "scripts/validate_schemas.py::curriculum_symlink_errors",
    "checkedFiles": checked,
    "syntaxScope": "Previously checked runnable scripts, current root technical helpers, and current author finalization script. Original failed-script source retained as nonexecuted historical failure evidence; no syntax success claimed for that archived attempt.",
    "historicalArchivedSyntaxFailureReceipt": binding(OUT / "affected-current-artifacts-after-portability-repair.actual.json"),
    "counts": counts,
    "document": binding(doc),
    "generalAuthoringInstructions": binding(ROOT / "AGENTS.md"),
    "localDocumentLinks": links,
    "symlinkErrors": symlink_errors,
    "affectedDiffCheckExitCode": diff.returncode,
    "errors": errors,
    "validatorExceptionsAdded": False,
    "fullRepositorySchemaSweepClaimed": False,
    "newScientificClosures": 0,
    "restoredStrictBindings": 0,
    "humanApproval": False,
    "activeCurriculumWrites": False,
}
target = OUT / "affected-current-artifacts-declared-executables.after-portability-repair-v2.actual.json"
if target.exists():
    raise RuntimeError("Preserve existing receipt; use an additive successor for another run")
target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"receipt": binding(target), "counts": counts, "documentLinks": len(links), "errors": errors}, ensure_ascii=False))
raise SystemExit(bool(errors))
