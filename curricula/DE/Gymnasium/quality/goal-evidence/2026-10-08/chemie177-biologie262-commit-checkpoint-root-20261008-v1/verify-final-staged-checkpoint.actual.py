# SPDX-License-Identifier: Apache-2.0
"""Verify exact commit bytes and JSONs added after the completed full gate.

This calls the unchanged repository validator for the final JSON delta. Git's
optional whitespace diagnostic remains recorded with its actual exit code;
immutable source/renderer/command-output evidence is never rewritten.
"""
import hashlib
import importlib.util
import json
import re
import subprocess
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
receipt = OWN / 'final-staged-index-bytes-and-new-json.actual.json'
assert not receipt.exists()
assert subprocess.check_output(['git', 'rev-parse', '--show-object-format']).strip() == b'sha1'
names = [name for name in subprocess.check_output([
    'git', 'diff', '--cached', '--name-only', '--diff-filter=ACM', '-z',
]).decode().split('\0') if name]
index = {}
for item in subprocess.check_output(['git', 'ls-files', '--stage', '-z']).split(b'\0'):
    if item:
        metadata, path = item.decode().split('\t', 1)
        mode, oid, stage = metadata.split()
        assert stage == '0'
        index[path] = (mode, oid)
exact = []
for name in names:
    path = ROOT / name
    assert path.is_file() and not path.is_symlink(), name
    mode, oid = index[name]
    assert mode in ('100644', '100755'), (name, mode)
    data = path.read_bytes()
    raw_oid = hashlib.sha1(f'blob {len(data)}\0'.encode() + data).hexdigest()
    assert raw_oid == oid, (name, 'index differs from exact reviewed bytes')
    exact.append({'path': name, 'sha256': hashlib.sha256(data).hexdigest(),
                  'bytes': len(data), 'gitBlobId': oid, 'exactIndexBytes': True})

full_terminal = json.loads((OWN / 'current-full-validate-schemas.terminal.actual.json').read_text())
assert full_terminal['actualExitCode'] == 0
ended = datetime.fromisoformat(full_terminal['endedAt']).timestamp()
schema_path = ROOT / 'docs/landscape-runtime.schema.json'
schema = json.loads(schema_path.read_text())
validator_path = ROOT / 'scripts/validate_schemas.py'
assert subprocess.check_output(['git', 'show', 'HEAD:scripts/validate_schemas.py']) == validator_path.read_bytes()
spec = importlib.util.spec_from_file_location('ordinary_checkpoint_validator', validator_path)
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
json_delta = []
for name in names:
    path = ROOT / name
    if path.suffix == '.json' and path.stat().st_mtime >= ended:
        assert validator.validate_file(path, schema), name
        json_delta.append(name)

diagnostic = subprocess.run(['git', 'diff', '--cached', '--check'], capture_output=True)
assert diagnostic.returncode in (0, 2), diagnostic.returncode
warnings = Counter()
for line in diagnostic.stdout.decode().splitlines():
    match = re.match(r'^(curricula/.+):(\d+): (.+)$', line)
    if match:
        name, _, message = match.groups()
        assert name.startswith('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/'), name
        warnings[(name, message)] += 1
editable = subprocess.run(['git', 'diff', '--cached', '--check', '--', '.',
    ':!curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'], capture_output=True)
assert editable.returncode == 0, editable.stdout.decode()
receipt.write_text(json.dumps({'schemaVersion': 1,
    'actualStagedFileCount': len(exact), 'stagedBindings': exact,
    'allStagedFilesEqualExactWorkingBytes': True,
    'unchangedOrdinaryValidatorAppliedToFinalJsonDelta': json_delta,
    'fullSchemaGateActualExitCode': 0, 'schemaOrDiscoveryChanges': False,
    'gitWhitespaceDiagnosticActualExitCode': diagnostic.returncode,
    'gitWhitespaceDiagnosticCapturedStreamSha256': hashlib.sha256(diagnostic.stdout).hexdigest(),
    'gitWhitespaceDiagnosticWarningCount': sum(warnings.values()),
    'gitWhitespaceDiagnosticWarnings': [{'path': path, 'message': message, 'count': count}
        for (path, message), count in sorted(warnings.items())],
    'whitespaceWarningsConfinedToEvidenceArtifacts': True,
    'editableFileWhitespaceCheckActualExitCode': editable.returncode,
    'immutableEvidenceBytesNormalized': False, 'privateDataExported': False,
}, indent=2) + '\n')
assert validator.validate_file(receipt, schema)
print(json.dumps({'exactStagedFiles': len(exact), 'finalJsonDeltaChecked': len(json_delta),
    'evidenceWhitespaceWarnings': sum(warnings.values()), 'editableFileCheckPassed': True}))
