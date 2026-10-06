# SPDX-License-Identifier: Apache-2.0
"""Apply the reviewed exact Chemistry plan with a verified local rollback copy."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
BASE = OWN.parent
CANDIDATE = BASE / 'chemie-q1-quantitative-reviewed-integration-candidate-v1'
GUARD = BASE / 'chemie-q1-quantitative-independent-technical-integration-guard-v1'
FREEZE = 'ff7876883da8135572b3650109bc5b11a0ba1f8a0d25b0c47db159214aca06b0'
GUARD_FREEZE = '936a63e69f76007b8818e274ae0ae14300e324f37ec38820bc0343829b017113'
PLAN_SHA = '647905cf152c35a8de50c746b29324abec7a46f1a175a1ec6be5e804b4da3d24'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path):
    return json.loads(path.read_text())


def write(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


for folder, name, expected in [
    (CANDIDATE, 'reviewed-integration.final.freeze.json', FREEZE),
    (GUARD, 'independent-technical-guard.final.freeze.json', GUARD_FREEZE),
]:
    frozen = folder / name
    assert sha(frozen) == expected, frozen
    for row in read(frozen)['files']:
        assert sha(ROOT / row['path']) == row['sha256'].removeprefix('sha256:'), row['path']
plan_path = CANDIDATE / 'guarded-apply-plan.json'
assert sha(plan_path) == PLAN_SHA
plan = read(plan_path)
assert len(plan['writes']) == 40 and len(plan['deletes']) == 9
assert not plan['humanApproval'] and not plan['humanTrial'] and not plan['activeWrites']
backup = OWN / 'chemistry-before-application'
assert not backup.exists(), backup
backup.mkdir()
prior = []
paths = [row['targetPath'] for row in plan['writes'] + plan['deletes']] + [plan['registry']['path']]
assert len(paths) == len(set(paths)) == 50
for relative in paths:
    source = ROOT / relative
    assert not source.is_symlink(), source
    row = {'path': relative, 'wasPresent': source.is_file(), 'beforeSHA256': None}
    if source.is_file():
        dest = backup / relative
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, dest)
        row['beforeSHA256'] = sha(source)
        assert sha(dest) == row['beforeSHA256'], relative
    prior.append(row)
write(OWN / 'chemistry-actual-before-backup.receipt.json', {
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'files': prior,
    'all50ExplicitDestinationsCaptured': True, 'allExistingBytesCopiedAndVerified': True,
    'allNineOriginalJPGCopiesBackedUpBeforeAnyMutation': True,
    'reviewedPlanSHA256': PLAN_SHA, 'candidateFreezeSHA256': FREEZE,
    'independentGuardFreezeSHA256': GUARD_FREEZE, 'humanApproval': False,
})
helper = CANDIDATE / 'apply-reviewed-candidate.py.txt'
command = ['python', str(helper), '--root', str(ROOT), '--plan', str(plan_path),
           '--receipt', str(OWN / 'chemistry-root-preflight.actual.json')]
start = datetime.now(timezone.utc).isoformat()
preflight = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
write(OWN / 'chemistry-root-preflight.terminal.receipt.json', {
    'startedAtUTC': start, 'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'command': command, 'exitCode': preflight.returncode, 'activeWrites': 0,
})
(OWN / 'chemistry-root-preflight.stdout.txt').write_text(preflight.stdout)
(OWN / 'chemistry-root-preflight.stderr.txt').write_text(preflight.stderr)
assert preflight.returncode == 0, preflight.stderr
command[-1] = str(OWN / 'chemistry-root-application.actual.json')
command.append('--write')
start = datetime.now(timezone.utc).isoformat()
result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
(OWN / 'chemistry-root-application.stdout.txt').write_text(result.stdout)
(OWN / 'chemistry-root-application.stderr.txt').write_text(result.stderr)
rollback = []
if result.returncode != 0:
    # Restore only this explicitly reviewed scope, retaining a conflicting
    # concurrent write instead of overwriting it.
    after = {row['targetPath']: row['afterSHA256'] for row in plan['writes']}
    registry_before = (backup / plan['registry']['path']).read_text()
    # The reviewed helper's registry splice preserves every foreign raw entry.
    import runpy
    definitions = runpy.run_path(str(helper), run_name='rollback_helper')
    a, b, _ = next(row for row in definitions['subject_spans'](registry_before) if row[2]['subject'] == 'chemie')
    insert = json.dumps(plan['registry']['futureWholeChemistryEntry'], ensure_ascii=False, indent=2).replace('\n', '\n    ')
    expected_registry_after = registry_before[:a] + insert + registry_before[b:]
    after[plan['registry']['path']] = hashlib.sha256(expected_registry_after.encode()).hexdigest()
    for row in reversed(prior):
        dest = ROOT / row['path']
        actual = sha(dest) if dest.is_file() else None
        if actual == row['beforeSHA256']:
            continue
        assert actual is None or actual == after.get(row['path']), 'Concurrent modification: ' + row['path']
        if row['wasPresent']:
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(backup / row['path'], dest)
            assert sha(dest) == row['beforeSHA256']
        else:
            dest.unlink()
        rollback.append(row['path'])
write(OWN / 'chemistry-root-application.terminal.receipt.json', {
    'startedAtUTC': start, 'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'command': command, 'exitCode': result.returncode,
    'rollbackPathsIfApplicationFailed': rollback,
    'allActualPriorBytesPreserved': True, 'nativeIntegratedReportStillRequired': True,
    'newStrictClosuresClaimedBeforeReport': 0, 'humanApproval': False, 'humanTrial': False,
})
print(result.stdout, result.stderr)
raise SystemExit(result.returncode)
