# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import sys
import jsonschema

ROOT = Path(__file__).resolve().parents[8]
sys.dont_write_bytecode = True
PACKAGE = Path(__file__).resolve().parents[1]
(PACKAGE / 'checks').mkdir(parents=True, exist_ok=True)
def bind(p):
    b = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

schema_path = ROOT / 'docs/landscape-runtime.schema.json'
schema = json.loads(schema_path.read_text())
candidate_path = PACKAGE / 'candidate/whole517.inactive.terminal-assessment-author.json'
candidate = json.loads(candidate_path.read_text())
jsonschema.Draft202012Validator(schema).validate(candidate)
spec = importlib.util.spec_from_file_location('skillpilot_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
files = sorted(PACKAGE.rglob('*.json'))
assert all(module.validate_file(str(p), schema) for p in files)
bindings = json.loads((PACKAGE / 'inputs/actual-input-bindings.json').read_text())['inputs']
for b in bindings:
    assert bind(ROOT / b['path']) == b
assert len({g['id'] for g in candidate['goals']}) == 517
assert not any(p.is_symlink() for p in PACKAGE.rglob('*'))
ignored = subprocess.run(['git', 'check-ignore', '--no-index', *[p.relative_to(ROOT).as_posix() for p in PACKAGE.rglob('*') if p.is_file()]], cwd=ROOT, text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
out = {'schemaVersion': 1, 'actualExitCode': 0, 'role': 'Scoped normal validator and explicit runtime schema check, AUTHOR only', 'normalValidateFileJsonCount': len(files), 'runtimeSchema': bind(schema_path), 'wholeCandidate': bind(candidate_path), 'runtimeSchemaStatus': 'PASS', 'actualInputHashBindingsExact': len(bindings), 'symlinks': 0, 'ignoredPackageFiles': 0, 'all517IdsUnique': True, 'activeWrites': [], 'strictGain': 0, 'currentStrictDenominator': None}
(PACKAGE / 'checks/normal-scoped-schema-portability-and-inputs.actual.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'runtimeSchema': 'PASS', 'normalValidateFileJsonCount': len(files), 'exactBoundInputs': len(bindings), 'ignoredFiles': 0, 'symlinks': 0}))
