"""Inspect the real prospective commit files; no scientific approval or staging."""
import datetime
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

root = Path('/home/enpasos/projects/skillpilot')
own = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie180-biologie335-commit-checkpoint-technical-root-v1'
prefix = own.relative_to(root).as_posix() + '/'
output = own / (sys.argv[1] if len(sys.argv) == 2 else 'complete-prospective-file-set.syntax-and-portability.actual.json')
assert not output.exists()
sys.path.insert(0, str(root / 'scripts'))
from validate_schemas import curriculum_symlink_errors

def names(command):
    return {p.decode() for p in subprocess.check_output(command, cwd=root).split(b'\0') if p}

tracked = names(['git', 'diff', '--name-only', 'HEAD', '-z'])
new = names(['git', 'ls-files', '--others', '--exclude-standard', '-z'])
paths = sorted((tracked | new) - {p for p in tracked | new if p.startswith(prefix)})
bindings = []
issues = [{'error': error} for error in curriculum_symlink_errors(root)]
json_count = jsonl_files = jsonl_rows = 0
for name in paths:
    path = root / name
    if path.is_symlink():
        # Use the repository's unchanged portable-link policy. A relative link
        # to a committed bundle is valid; hash its actual Git blob, not copies.
        target = os.readlink(path)
        data = os.fsencode(target)
        bindings.append({'path': name, 'type': 'symlink', 'target': target, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'currentlyTracked': name in tracked})
        continue
    if not path.is_file():
        issues.append({'path': name, 'error': 'Prospective file is missing or not regular'})
        continue
    data = path.read_bytes()
    if len(data) > 100 * 1024 * 1024:
        issues.append({'path': name, 'error': 'File exceeds GitHub regular-file limit'})
    bindings.append({'path': name, 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'currentlyTracked': name in tracked})
    try:
        if path.suffix == '.json':
            json.loads(data)
            json_count += 1
        elif path.suffix == '.jsonl':
            jsonl_files += 1
            for number, line in enumerate(data.decode().splitlines(), 1):
                if line.strip():
                    json.loads(line)
                    jsonl_rows += 1
    except (UnicodeError, json.JSONDecodeError) as error:
        issues.append({'path': name, 'error': str(error)})

requirements = json.loads((own / 'prospective-required-source-input-index.receipt.json').read_text())['newRequiredSourceInputs']
by_path = {binding['path']: binding for binding in bindings}
for required in requirements:
    actual = by_path.get(required['path'])
    assert actual and all(actual[key] == value for key, value in required.items()), required['path']

before = json.loads((own / 'before-docs/committed-main.curriculum-quality-status.exact.json').read_text())
after = json.loads((root / 'docs/qa-ci/status/curriculum-quality-status.json').read_text())
def summary(status):
    return {c['subject']: {'maturity': c['maturity'], 'CQR303': next(r for r in c['rules'] if r['id'] == 'CQR-303')} for c in status['curricula'] if '/canonical/' in c['path'] and c['subject'] in ['Chemie', 'Biologie', 'Mathematik', 'Physik']}

result = {
    'schemaVersion': 1,
    'inspectedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Actual file syntax, intended source closure and byte bindings only; not a new scientific review',
    'baseCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(),
    'allPackageWritersStopped': True,
    'changedOrNewApplicationContentAndCandidateFiles': bindings,
    'technicalCheckpointSelfFilesExcludedFromThisManifestAndSealedSeparately': prefix,
    'files': len(bindings),
    'totalBytes': sum(binding['bytes'] for binding in bindings),
    'completeJSONFilesParsed': json_count,
    'completeJSONLFilesParsed': jsonl_files,
    'completeJSONLRowsParsed': jsonl_rows,
    'issues': issues,
    'newRequiredSourceInputsIncludedAndByteExact': True,
    'actualCommittedStatus': summary(before),
    'actualCurrentStatus': summary(after),
    'normalFullSchemaResultSeparate': True,
    'portableLinkPolicy': 'Unchanged scripts/validate_schemas.py curriculum_symlink_errors',
    'realIndexModified': False,
    'committedOrPushedHere': False,
    'humanApproval': False,
    'actualLearnerEvidence': False,
}
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: result[k] for k in ['files', 'totalBytes', 'completeJSONFilesParsed', 'completeJSONLFilesParsed', 'completeJSONLRowsParsed', 'issues', 'newRequiredSourceInputsIncludedAndByteExact']}))
if issues:
    raise SystemExit(1)
