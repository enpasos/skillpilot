# SPDX-License-Identifier: Apache-2.0
"""Use the normal validator for files written since the completed full check."""
import datetime
import hashlib
import importlib.util
import json
import pathlib
import subprocess

root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("normal_schemas", root / "scripts/validate_schemas.py")
normal = importlib.util.module_from_spec(spec)
spec.loader.exec_module(normal)
full_receipt = own / "stable-complete-schema-after-current-native-context.terminal.actual.json"
full = json.loads(full_receipt.read_text())
assert full["exitCode"] == 0
cutoff = datetime.datetime.fromisoformat(full["startedAt"]).timestamp()
schema = json.loads((root / normal.SCHEMA_PATH).read_text())
link_errors = normal.curriculum_symlink_errors(root)
assert not link_errors, link_errors

checked = []
jsonl_rows = 0
for path in sorted((root / "curricula").rglob("*")):
    if not path.is_file() or path.suffix not in {".json", ".jsonl"}:
        continue
    file_stat = path.stat()
    if max(file_stat.st_mtime, file_stat.st_ctime) < cutoff:
        continue
    data = path.read_bytes()
    if path.suffix == ".json":
        assert normal.validate_file(str(path.relative_to(root)), schema), str(path)
    else:
        for line in data.decode("utf-8").splitlines():
            if line.strip():
                json.loads(line)
                jsonl_rows += 1
    checked.append({"path": path.relative_to(root).as_posix(),
                    "sha256": "sha256:" + hashlib.sha256(data).hexdigest(),
                    "bytes": len(data)})

for argv in [["git", "diff", "--check"], ["git", "diff", "--cached", "--check"]]:
    result = subprocess.run(argv, cwd=root, check=True, capture_output=True, text=True)
    assert not result.stdout and not result.stderr

receipt = {"schemaVersion": 1,
           "recordedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
           "role": "Targeted normal schema and portability check after completed full validation",
           "completedFullSchemaReceipt": full_receipt.relative_to(root).as_posix(),
           "completedFullSchemaExitCode": 0,
           "cutoff": full["startedAt"],
           "normalValidatorUnchanged": True,
           "allModifiedJSONPassedNormalValidator": True,
           "allModifiedJSONLFullyParsed": True,
           "jsonlRowsParsed": jsonl_rows,
           "filesChecked": len(checked),
           "bindings": checked,
           "normalCurriculumSymlinkErrors": link_errors,
           "unstagedAndStagedGitDiffChecksPassed": True}
output = own / "final-files-after-full-schema.normal-targeted-check.actual.json"
with output.open("x") as handle:
    handle.write(json.dumps(receipt, indent=2) + "\n")
print(json.dumps({"normalSchemaAndPortability": "PASS", "filesChecked": len(checked),
                  "jsonlRowsParsed": jsonl_rows, "gitDiffChecks": "PASS"}))
