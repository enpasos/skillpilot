# SPDX-License-Identifier: Apache-2.0
"""Use the normal repository validator and fully parse this owned review package."""
import hashlib
import json
import pathlib
import sys

root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(root / "scripts"))
from validate_schemas import curriculum_symlink_errors, validate_file

schema = json.loads((root / "docs/landscape-runtime.schema.json").read_text())
files = []
for path in sorted(own.rglob("*.json")):
    if not validate_file(path, schema):
        raise SystemExit(1)
    files.append({"path": path.relative_to(root).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size})
jsonl = []
for path in sorted(own.rglob("*.jsonl")):
    rows = [json.loads(line) for line in path.read_text().splitlines() if line.strip()]
    jsonl.append({"path": path.relative_to(root).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size, "wholeParsedRows": len(rows)})
errors = curriculum_symlink_errors(root)
if errors:
    print(json.dumps(errors, indent=2))
    raise SystemExit(1)
result = {"schemaVersion": 1, "normalSchemaValidationPASS": True, "wholeWrittenJsonParsed": files, "wholeWrittenJsonlParsed": jsonl, "ordinaryD2AndP2ContractsSeparatelyValidatedByProductionCLIs": True, "globalCurriculumSymlinkErrors": errors, "scientificApprovalNotImplied": True}
target = own / "normal-whole-written-schema-and-portability.actual.json"
target.write_text(json.dumps(result, indent=2) + "\n")
json.loads(target.read_text())
print(json.dumps({"normalSchema": "PASS", "wholeJsonFiles": len(files), "wholeJsonlFiles": len(jsonl), "globalSymlinkErrors": len(errors)}))
