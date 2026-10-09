# SPDX-License-Identifier: Apache-2.0
"""Run unmodified ordinary P17 checker in a small external regular-file capsule."""
from pathlib import Path
import json, hashlib, shutil, subprocess, datetime

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT / 'tmp/biologie-evolution-native17-current394-capsule'
FIRST = OWN / 'native17-and-source-contexts.technical-FIRST.freeze.json'
assert FIRST.is_file(), 'The technical FIRST must precede the ordinary P17 check.'


def binding(path):
    data = path.read_bytes()
    assert path.is_file() and not path.is_symlink()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def copy(relative):
    source, target = ROOT / relative, CAP / relative
    assert source.is_file() and not source.is_symlink()
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        assert not target.is_symlink() and target.read_bytes() == source.read_bytes(), relative
    else:
        shutil.copyfile(source, target)
    assert target.read_bytes() == source.read_bytes()
    return binding(source)


code = []
for relative in ['app/package.json', 'app/scripts/positiveGoalEvidenceReview.ts',
                 'app/scripts/positiveGoalEvidenceProfileModel.ts', 'app/scripts/goalEvidenceProfileModel.ts',
                 'app/src/landscapeTypes.ts', 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
                 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',
                 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json']:
    code.append(copy(relative))
for package in ['ajv', 'ajv-formats', 'fast-deep-equal', 'fast-uri', 'json-schema-traverse', 'require-from-string']:
    source = ROOT / 'app/node_modules' / package
    assert source.is_dir() and not source.is_symlink()
    for path in sorted(source.rglob('*')):
        if path.is_file():
            code.append(copy(path.relative_to(ROOT).as_posix()))

config = (OWN / 'positive/P17.current-raster.inactive.config.json').relative_to(ROOT).as_posix()
argv = [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/positiveGoalEvidenceReview.ts',
        '--config=' + config, '--mode=check']
completed = subprocess.run(argv, cwd=CAP, capture_output=True, text=True)
checks = OWN / 'checks'
name = 'ordinary-P17-current-raster-capsule'
for suffix, text in [('stdout.actual.txt', completed.stdout), ('stderr.actual.txt', completed.stderr)]:
    path = checks / (name + '.' + suffix)
    assert not path.exists()
    path.write_text(text)
terminal = checks / (name + '.terminal.actual.json')
assert not terminal.exists()
terminal.write_text(json.dumps({'schemaVersion': 1,
    'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'argv': argv,
    'workingDirectory': CAP.relative_to(ROOT).as_posix(), 'actualExitCode': completed.returncode,
    'technicalFirst': binding(FIRST), 'ordinaryUnmodifiedCodeAndSchemaBindings': code,
    'copyPolicy': 'Required ordinary code, schemas and six dependency packages as regular exact copies; all capsule writes outside curricula',
    'symlinksCreated': 0, 'existingNodeModulesDeletedOrModified': False, 'activeWrites': 0,
    'independentScientificApproval': False, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
print(completed.stdout)
print(completed.stderr)
print('Actual P17 exit:', completed.returncode)
raise SystemExit(completed.returncode)
