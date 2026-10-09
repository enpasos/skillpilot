# SPDX-License-Identifier: Apache-2.0
"""Use the existing schema validator and exact portable input bindings."""
import datetime
import hashlib
import importlib.util
import json
import os
import pathlib
import subprocess
import sys

sys.dont_write_bytecode = True
root = pathlib.Path.cwd()
own = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-two-corrosion-whole-source-independent-a-v1'
spec = importlib.util.spec_from_file_location('existing_validate_schemas', root / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
schema = json.loads((root / 'docs/landscape-runtime.schema.json').read_bytes())
files = sorted(p for p in own.rglob('*') if p.is_file())
json_files = [p for p in files if p.suffix == '.json']
for file in json_files:
    assert module.validate_file(str(file.relative_to(root)), schema), file
canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert module.validate_file(canonical, schema)
entry_path = own / 'neutral-completed-two-whole-corrosion-source-independent-A.entry.json'
entry = json.loads(entry_path.read_bytes())
for b in entry['requiredPortableReviewInputBindings']:
    path = pathlib.Path(b['path'])
    assert not path.is_absolute() and '..' not in path.parts and path.parts[0] == 'curricula'
    actual = root / path
    data = actual.read_bytes()
    assert len(data) == b['bytes'] and hashlib.sha256(data).hexdigest() == b['sha256'], path
    for part in [actual, *actual.parents]:
        assert not part.is_symlink(), part
        if part == root:
            break
paths = sorted(set(str(p.relative_to(root)) for p in files) | {b['path'] for b in entry['requiredPortableReviewInputBindings']})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(paths)+'\n', text=True, capture_output=True)
assert ignored.returncode in [0, 1] and not ignored.stdout.strip(), ignored.stdout
rel = str(own.relative_to(root))
for args in [['git', 'diff', '--check', '--', rel], ['git', 'diff', '--cached', '--check', '--', rel]]:
    actual = subprocess.run(args, capture_output=True, text=True)
    assert actual.returncode == 0, actual.stdout + actual.stderr
first = own / 'whole-COR2-independent-A.science-source-FIRST.json'
assert hashlib.sha256(first.read_bytes()).hexdigest() == '8782923a5227bd725f28383d1f1da6e493aa03babd300d4f99540668dd7426b5'
pdf = own / 'primary/TH-whole-original-official.actual-original.pdf'
indexed = subprocess.run(['git', 'show', ':'+str(pdf.relative_to(root))], capture_output=True)
assert indexed.returncode == 0 and indexed.stdout == pdf.read_bytes()
result = {'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'evidenceLicense': 'CC-BY-4.0',
          'status': 'PASS_normal_targeted_schema_JSON_portability_and_byte_bindings',
          'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'normalExistingValidatorUnmodified': True, 'qualityJSONFilesParsed': len(json_files),
          'activeWholeCanonicalRuntimeSchemaChecked': canonical,
          'requiredPortableBoundInputs': len(entry['requiredPortableReviewInputBindings']),
          'checkedPathsUnignoredOrAlreadyIndexed': len(paths),
          'portableWholeTHPDFIndexExact': True, 'requiredPathsHaveNoSymlink': True,
          'ownFIRSTUnchanged': True, 'ownDiffAndIndexWhitespaceCheckPassed': True,
          'fullRepositorySchemaRunClaim': False, 'newStrictClosures': 0,
          'humanApproval': False, 'humanTrial': False}
destination = own / 'normal-schema-and-portability.actual-result.json'
data = json.dumps(result, ensure_ascii=False, indent=2)+'\n'
json.loads(data)
temporary = pathlib.Path(str(destination)+'.writing')
temporary.write_text(data, encoding='utf-8')
os.replace(temporary, destination)
print(json.dumps(result, ensure_ascii=False))
