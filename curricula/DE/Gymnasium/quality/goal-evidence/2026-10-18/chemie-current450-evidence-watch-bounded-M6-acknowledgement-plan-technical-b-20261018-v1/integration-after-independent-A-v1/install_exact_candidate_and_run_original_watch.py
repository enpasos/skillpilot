#!/usr/bin/env python3
"""Execute the root-authorized narrow installation after explicit A PASS."""
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import time

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[8]
HERE = Path(__file__).resolve().parent
PLAN = HERE.parent
HEAD = '06a03ecbc193550b73d7d7b3af53a5a7e61b17fb'
APATH = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-evidence-watch-independent-technical-second-check-a-20261018-v1/SEAL.independent-bounded-M6-watch-plan.json'

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def digest(raw):
    return hashlib.sha256(raw).hexdigest()

def load(path):
    return json.loads(path.read_text())

def pin(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(raw), 'bytes': len(raw)}

def write(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip() == HEAD
assert digest(APATH.read_bytes()) == '6c414d65f91cc61bb3be203e88bd2a656084f68786cad0e305ab3f0cb3d14401'
assert digest((PLAN / 'SEAL.pre-install-plan.json').read_bytes()) == '8c9194385c3ca9ea0b8190e6bf00a1877dc0f7fa96f209b55a2f98e343ea29d3'
for member in load(PLAN / 'SEAL.pre-install-plan.json')['members']:
    p = ROOT / member['path']
    assert pin(p) == member, p
plan = load(PLAN / 'PLAN.pending-independent-review-and-root-installation.json')
allowlist = plan['proposedNormalWriteAllowlist']
bindings = load(PLAN / 'BINDINGS.142-paths-current-HEAD-and-existing-evidence.json')['records']
controls = load(PLAN / 'PROTECTED.controls-tracker-and-floors.exact.json')['files']
for item in controls:
    assert pin(ROOT / item['path']) == item
for row in bindings:
    item = row['headRawBytes']
    current = pin(ROOT / row['path'])
    assert all(current[k] == item[k] for k in ['path', 'sha256', 'bytes']), row['path']
baseline = ROOT / allowlist[0]
assert baseline.read_bytes() == (PLAN / 'history/chemistry-evidence-watch-baseline.before.exact.json').read_bytes()
for p in allowlist[1:]:
    assert (ROOT / p).read_bytes() == (PLAN / 'history' / ('before-normal.' + Path(p).name)).read_bytes()
before = [pin(ROOT / p) for p in allowlist]
preexisting = subprocess.check_output(['git', 'diff', '--name-only', '-z'], cwd=ROOT).decode().split('\0')
foreign_before = {p: pin(ROOT / p) for p in preexisting if p and p not in allowlist}
candidate = ROOT / plan['candidate']['path']
assert pin(candidate) == plan['candidate']
started = now()
write('PREWRITE.actual-A-PASS-and-byte-CAS.receipt.json', {
    'role': 'AUTHORIZED_NARROW_TECHNICAL_M6_WATCH_INSTALLATION_AFTER_EXPLICIT_INDEPENDENT_A_PASS',
    'checkedAt': started, 'head': HEAD,
    'rootAuthorization': 'Explicit prior authorization contingent on exact A PASS, reiterated after PASS in root message.',
    'independentAExplicitPassReceived': True, 'independentASeal': pin(APATH),
    'preInstallPlanSeal': pin(PLAN / 'SEAL.pre-install-plan.json'), 'candidate': pin(candidate),
    'all142CurrentRawPinsExact': True, 'allPreInstallPlanMembersExact': True,
    'protectedControlsExact': controls, 'normalBefore': before,
    'preexistingForeignNormalChanges': list(foreign_before.values()),
    'writeAllowlist': allowlist, 'newScienceDOrM7Vote': False, 'humanApproval': False})
baseline.write_bytes(candidate.read_bytes())
executions = []
commands = [
    ['python3', 'scripts/canonical_chemistry_evidence_watch.py', 'render-status'],
    ['python3', 'scripts/canonical_chemistry_evidence_watch.py', 'render-delta'],
    ['bash', 'scripts/run_canonical_chemistry_evidence_watch.sh'],
]
for label, command in zip(['render-status', 'render-delta', 'original-watch-full'], commands):
    start = now()
    tick = time.monotonic()
    with (HERE / (label + '.stdout.log')).open('wb') as out, (HERE / (label + '.stderr.log')).open('wb') as err:
        result = subprocess.run(command, cwd=ROOT, stdout=out, stderr=err)
    execution = {'command': command, 'startedAt': start, 'completedAt': now(),
                 'durationSeconds': round(time.monotonic() - tick, 6), 'exitCode': result.returncode,
                 'stdout': pin(HERE / (label + '.stdout.log')), 'stderr': pin(HERE / (label + '.stderr.log'))}
    executions.append(execution)
    write(label + '.execution.json', execution)
    print(json.dumps({'phase': label, 'exitCode': result.returncode}), flush=True)
    if result.returncode:
        write('FAILURE.actual-execution.json', {'completedAt': now(), 'executions': executions,
              'normalAfter': [pin(ROOT / p) for p in allowlist], 'normalBaselineInstalled': True})
        raise SystemExit(result.returncode)
spec = importlib.util.spec_from_file_location('watch', ROOT / 'scripts/canonical_chemistry_evidence_watch.py')
watch = importlib.util.module_from_spec(spec)
spec.loader.exec_module(watch)
manifest = watch.load_json(watch.MANIFEST_PATH)
installed = load(baseline)
original = load(PLAN / 'history/chemistry-evidence-watch-baseline.before.exact.json')
_, changed, added, removed, unchanged = watch.diff_records(manifest, installed)
assert not changed and not added and not removed
old_records = {r['relativePath']: r for r in original['watchedFiles']}
new_records = {r['relativePath']: r for r in installed['watchedFiles']}
old_rest = load(PLAN / 'CHECK.actual-bounded-candidate-and142-bindings.json')['unchangedCompleteRecordsPreservedExactly']
assert all(old_records[p] == new_records[p] for p in old_rest) and len(old_rest) == 18
assert baseline.read_bytes() == candidate.read_bytes()
for item in controls:
    assert pin(ROOT / item['path']) == item
for row in bindings:
    current = pin(ROOT / row['path'])
    assert all(current[k] == row['headRawBytes'][k] for k in ['path', 'sha256', 'bytes'])
for p, expected in foreign_before.items():
    assert pin(ROOT / p) == expected, ('concurrent foreign change', p)
diff_after = subprocess.check_output(['git', 'diff', '--name-only', '-z'], cwd=ROOT).decode().split('\0')
new_changes = sorted(set(p for p in diff_after if p) - set(p for p in preexisting if p))
assert set(new_changes) <= set(allowlist), new_changes
stdout = (HERE / 'original-watch-full.stdout.log').read_text()
assert 'chemistry-evidence-watch: changed=0 added=0 removed=0' in stdout
assert 'CHEMISTRY_EVIDENCE_WATCH=OK' in stdout
receipt = {
    'role': 'ACTUAL_NARROW_TECHNICAL_M6_WATCH_ACKNOWLEDGEMENT_INTEGRATION_NOT_NEW_SCIENTIFIC_APPROVAL',
    'reviewerId': '/root/chemie_final_native_round_b_20261018', 'startedAt': started, 'completedAt': now(),
    'head': HEAD, 'independentASeal': pin(APATH), 'preInstallPlanSeal': pin(PLAN / 'SEAL.pre-install-plan.json'),
    'candidate': pin(candidate), 'installedBaseline': pin(baseline),
    'normalBefore': before, 'normalAfter': [pin(ROOT / p) for p in allowlist],
    'onlyThreeAllowedNormalFilesWritten': True, 'newTrackedNormalDiffPaths': new_changes,
    'preexistingForeignNormalChangesPreserved': list(foreign_before.values()),
    'selectedChangedRecords': 138, 'selectedAddedRecords': 4, 'removedRecords': 0,
    'all18CompleteOldRecordsPreservedExactly': True, 'all160EffectiveHashModesUnchanged': True,
    'all142WatchedNormalInputsStillExactTo06aHEAD': True, 'controlsTrackerRegistryAndFloorsUnchanged': controls,
    'stockDiffAfterInstallation': {'changed': 0, 'added': 0, 'removed': 0},
    'executions': executions, 'originalWatchFullExitCode': 0, 'originalWatchOKMarker': True,
    'maturity': 'M6', 'CQR303': 'fail', 'strictComplete': 260, 'strictExpected': 450, 'strictRemaining': 190,
    'existingDPANativeAndPipelineFindingsRemainOpen': True,
    'newScienceDOrM7Vote': False, 'humanApproval': False, 'buildExecuted': False,
    'commitCreated': False, 'remoteWrite': False}
write('RECEIPT.actual-bounded-M6-watch-installation.json', receipt)
members = [pin(p) for p in sorted(HERE.iterdir()) if p.is_file() and p.name != 'SEAL.actual-bounded-M6-watch-installation.json']
write('SEAL.actual-bounded-M6-watch-installation.json', {'role': 'ACTUAL_TECHNICAL_INSTALLATION_AND_ORIGINAL_WATCH_PASS',
      'sealedAt': now(), 'independentASeal': pin(APATH), 'preInstallPlanSeal': pin(PLAN / 'SEAL.pre-install-plan.json'),
      'members': members, 'newScienceDOrM7Vote': False, 'humanApproval': False})
print(json.dumps({'status': 'PASS_INSTALLED_AND_ORIGINAL_WATCH_FULL', 'installedBaseline': pin(baseline),
                  'receipt': pin(HERE / 'RECEIPT.actual-bounded-M6-watch-installation.json'),
                  'seal': pin(HERE / 'SEAL.actual-bounded-M6-watch-installation.json')}, ensure_ascii=False), flush=True)
