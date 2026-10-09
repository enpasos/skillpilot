# SPDX-License-Identifier: Apache-2.0
"""Seal actual seven-profile/native author outputs after ordinary checks."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'seven-operative-native-preparation-v2'
CAP = ROOT / 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule'

def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(p, value):
    assert p.is_relative_to(OUT) and not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

assert not (OUT / 'current-seven-operative-native-author.first.freeze.json').exists()
req = read(OUT / 'four-required-native-seven-originals.exact-index-request.json')
index_rows = []
for item in req['files']:
    p = ROOT / item['path']
    actual = bind(p)
    assert actual['sha256'] == item['sha256'].removeprefix('sha256:') and actual['bytes'] == item['bytes']
    blob = subprocess.run(['git', 'show', ':' + item['path']], cwd=ROOT, check=True, capture_output=True).stdout
    assert blob == p.read_bytes()
    index_rows.append({**actual, 'actualIndexBytesExact': True})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=ROOT,
                         input='\n'.join(row['path'] for row in index_rows) + '\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout
index_proof = write(OUT / 'four-native-originals.actual-index-byte-and-portability-proof.json',
                    {'schemaVersion': 1, 'files': index_rows, 'normalGitCheckIgnoreExit': ignored.returncode,
                     'targetedIndexAdditionPerformedByRoot': True, 'authorStagedFiles': [],
                     'noIgnoreOrValidatorException': True, 'noCommit': True})
cfg = OUT / 'P7.actual-current-raster.ordinary-author-candidate.config.json'
argv = [str(ROOT / 'app/node_modules/.bin/tsx'), 'scripts/positiveGoalEvidenceReview.ts',
        '--mode=check', '--config=' + str(cfg.relative_to(ROOT))]
run = subprocess.run(argv, cwd=CAP / 'app', capture_output=True, text=True)
stdout = OUT / 'ordinary-current-seven-P-check.actual.stdout.txt'
assert not stdout.exists()
stdout.write_text(run.stdout + run.stderr)
terminal = write(OUT / 'ordinary-current-seven-P-check.actual-terminal.json',
                 {'schemaVersion': 1, 'argv': argv, 'workingDirectory': str((CAP / 'app').relative_to(ROOT)),
                  'actualExitCode': run.returncode, 'output': bind(stdout), 'profiles': 7,
                  'firstTwoInvocationErrorsPreservedAsTechnicalHistory':
                    [{'exitCode': 127, 'cause': 'Wrong relative executable path; no validator ran'},
                     {'exitCode': 1, 'cause': 'Unsupported --config separated argument; corrected to normal --config=path'}],
                  'sourceOrScientificApproval': False})
assert run.returncode == 0, run.stdout + run.stderr
proof = read(OUT / 'ordinary-current-seven-native-campaign-and-material-bindings.actual.json')
assert proof['normalCampaignErrors'] == [] and proof['actualCurrentNormalProfiles'] == 7
assert proof['actualWholeOperativeCases'] == 14 and proof['actualMaterializedCaseRemedies'] == 4
spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
paths = sorted(OUT.rglob('*.json'))
errors = [str(p.relative_to(ROOT)) for p in paths if not validator.validate_file(str(p.relative_to(ROOT)), schema)]
assert not errors, errors
schema_proof = write(OUT / 'ordinary-selected-current-seven-JSON-schema.actual.json',
                     {'schemaVersion': 1, 'normalAPI': 'scripts/validate_schemas.py:validate_file',
                      'actualFileCount': len(paths), 'paths': [str(p.relative_to(ROOT)) for p in paths],
                      'errors': [], 'noValidatorChanges': True, 'noSymlinks': all(not p.is_symlink() for p in paths)})
entry = write(OUT / 'neutral-current-seven-complete-operative-native-author.handoff.entry.json',
              {'schemaVersion': 1, 'role': 'Actual ordinary native/P7 author candidate, ready for independent current native review',
               'neutralNativeEntry': bind(OUT / 'neutral-current-seven-actual-operative-native-independent-review.entry.json'),
               'wholeOperativeMaterialIntake': bind(OUT / 'neutral-current-seven-operative-material-profile-native-intake.entry.json'),
               'ordinaryCampaignAndMaterialCheck': bind(OUT / 'ordinary-current-seven-native-campaign-and-material-bindings.actual.json'),
               'ordinaryPCheck': terminal, 'ordinarySchemaCheck': schema_proof, 'actualIndexByteProof': index_proof,
               'wholeProfiles': 7, 'wholeBilingualCases': 14, 'actualCaseRemedies': 4,
               'independentCurrentNativeReviews': 'PENDING', 'wholeSource19And354of395AtlasStatus': 'HOLD',
               'protectedEightContextReviews': 'PENDING', 'atomicityMemory25Status': 'PENDING',
               'currentCanonicalAtoms': 378, 'inactiveProspectiveAtoms': 395, 'actualCurrentNationalBookPages': 359,
               'netStrictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0,
               'activeWrites': [], 'humanApproval': False, 'humanTrial': False})
scripts = [Path(__file__), OWN / 'materialize-current7-paired-v2-operative-profiles-and-cases.technical.py',
           OWN / 'render-current7-operative-v2-native-review-candidate.technical.mts',
           OWN / 'check-current7-operative-v2-normal-campaigns-and-bindings.technical.mts']
files = sorted(set([p for p in OUT.rglob('*') if p.is_file()] + scripts))
seal = write(OUT / 'current-seven-operative-native-author.first.freeze.json',
             {'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
              'role': 'First immutable actual native seven technical-author outputs; no independent science approval',
              'files': [bind(p) for p in files], 'neutralCompleteEntry': entry,
              'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False})
print(json.dumps({'neutralEntry': entry, 'firstSeal': seal, 'actualIndexOriginalCount': len(index_rows),
                  'ordinarySchemaFileCount': len(paths), 'ordinaryPExit': run.returncode, 'netStrictGain': 0}))
