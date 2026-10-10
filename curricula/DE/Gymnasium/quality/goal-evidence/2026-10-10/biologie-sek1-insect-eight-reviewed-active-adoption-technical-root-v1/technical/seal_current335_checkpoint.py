"""Seal completed normal checks and the technical current-ID comparison."""
import datetime
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

root = Path('/home/enpasos/projects/skillpilot')
own = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1'
doc = root / 'docs/qa-ci/chemie-biologie-m7-chemie180-biologie335-integration-2026-10-10.md'
checkpoint = own / 'stable-current335-terminal-checkpoint.actual.json'
freeze = own / 'FINAL.stable-current335.technical.freeze.json'
assert not checkpoint.exists() and not freeze.exists()

def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(root).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(binding):
    assert bind(root / binding['path']) == binding, binding['path']

proof_path = own / 'current335-exact-strict-ID-gain-and-protected-subjects.actual.json'
proof = json.loads(proof_path.read_text())
assert proof['newScientificClosures'] == proof['strictNetGain'] == 8
assert proof['lostPriorStrictIDs'] == proof['restoredPriorStrictBindings'] == proof['blockingIssueCount'] == 0
adoption = json.loads((own / 'actual-reviewed-eight-active-adoption.receipt.json').read_text())
for binding in adoption['afterActiveBindings'] + adoption['copyOutputs']:
    verify(binding)

labels = [
    'central-current394-eight-check',
    'full-curriculum-status-current335',
    'maturity-floors-current335',
    'normal-source-atlas394-active-build',
    'normal-source-atlas394-active-check',
    'normal-P7-active-check',
    'normal-P1-active-check',
    'normal-QA8-current-ledger-check',
    'normal-goal-visualization-assets-current2308-check',
    'normal-LayerA-current2308-check',
    'schema-current335',
    'five-goal-books-current335',
    'generated-status-current335',
    'generated-doc-notices-current335',
]
terminals = []
for label in labels:
    path = own / 'checks' / (label + '.terminal.actual.json')
    receipt = json.loads(path.read_text())
    assert receipt['exitCode'] == 0, label
    terminals.append({'label': label, 'terminal': bind(path), 'command': receipt['command'], 'exitCode': receipt['exitCode'], 'durationSeconds': receipt.get('durationSeconds'), 'stdout': bind(root / receipt['stdoutPath']), 'stderr': bind(root / receipt['stderrPath'])})
assert 'Checked 57404 files.' in (own / 'checks/schema-current335.stdout.actual.txt').read_text()
assert 'Goal-book publication ready: 5 books; 1 rendered;' in (own / 'checks/five-goal-books-current335.stdout.actual.txt').read_text()

status_path = root / 'docs/qa-ci/status/curriculum-quality-status.json'
status = json.loads(status_path.read_text())
canonical = {c['subject']: c for c in status['curricula'] if '/canonical/' in c['path']}
status_summary = {}
for subject, expected, maturity, strict in [('Biologie', 394, 'M6', 335), ('Chemie', 381, 'M6', 180), ('Mathematik', 807, 'M7', 807), ('Physik', 478, 'M7', 478)]:
    curriculum = canonical[subject]
    rule = next(r for r in curriculum['rules'] if r['id'] == 'CQR-303')
    assert curriculum['maturity'] == maturity
    assert rule['metrics']['expectedGoals'] == expected and rule['metrics']['strictComplete'] == strict
    assert rule['metrics']['blockingIssues'] == 0
    assert rule['status'] == ('pass' if expected == strict else 'warn')
    status_summary[subject] = {'maturity': maturity, 'CQR303': rule, 'humanTrialBlockingFindings': curriculum['humanTrialBlockingFindings']}
assert canonical['Biologie']['humanTrialBlockingFindings'] == 1
global_failures = [{'landscapeId': c['landscapeId'], 'subject': c['subject'], 'rule': r} for c in status['curricula'] for r in c['rules'] if r['status'] == 'fail']
assert len(global_failures) == 4

remote = root / 'tmp/m7-resumption-20261010/main-CI-20261010T054519Z.actual.json'
remote_value = json.loads(remote.read_text())
assert remote_value['success'] == 27 and remote_value['skipped'] == 1
assert remote_value['pending'] == remote_value['failed'] == 0
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip() == remote_value['headSha']
remote_copy = own / 'checks/main-CI-current-committed-head27.actual.json'
assert not remote_copy.exists()
shutil.copyfile(remote, remote_copy)

for name in ['run_biology_insect_checkpoint_command.py', 'prove_current335_exact_strict_gain.py', 'seal_current335_checkpoint.py']:
    source = root / 'tmp/m7-resumption-20261010' / name
    dest = own / 'technical' / name
    assert not dest.exists()
    shutil.copyfile(source, dest)

result = {
    'schemaVersion': 1,
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Stable technical integration checkpoint after actual completed normal checks; not another scientific review',
    'exactStrictIDComparison': bind(proof_path),
    'actualReviewedAdoption': bind(own / 'actual-reviewed-eight-active-adoption.receipt.json'),
    'requiredSuccessfulNormalTerminals': terminals,
    'successfulNormalTerminalCount': len(terminals),
    'currentStatus': bind(status_path),
    'actualMaturityAndCQR303': status_summary,
    'allNineProtectedMaturityFloorsPassed': True,
    'newScientificClosures': 8,
    'restoredPriorStrictBindings': 0,
    'strictNetGain': 8,
    'lostPriorStrictIDs': 0,
    'sourceAtlas': {'publishedGoals': 394, 'scopeViews': 24, 'unresolvedScopeDecisions': 0, 'omittedGoals': 0},
    'layerA': {'visualizations': 2308, 'C2PAContainerMarkers': 2257, 'otherBoundRuntimeImages': 64, 'localizedCardRecords': 731, 'boundAudioFiles': 8},
    'schemas': {'normalCheckPassed': True, 'checkedFiles': 57404},
    'fiveGoalBooksVerified': True,
    'fullStableNormalChecksPending': False,
    'globalUnrelatedFailuresRemain': global_failures,
    'currentCommittedMainCI': bind(remote_copy),
    'remoteResultsCoverUncommittedWorktree': False,
    'committedOrPushedHere': False,
    'chemistry205of398CandidateRemainsInactiveDueToActualRouteHold': True,
    'humanApproval': False,
    'humanTrial': False,
    'actualLearnerEvidence': False,
    'humanReleaseGatesPreservedSeparately': True,
    'document': bind(doc),
}
checkpoint.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
files = [bind(p) for p in sorted(own.rglob('*')) if p.is_file()] + [bind(doc)]
sealed = {'schemaVersion': 1, 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'Immutable technical record of the stable current335 integration checkpoint', 'files': files, 'fileCount': len(files), 'checkpoint': bind(checkpoint), 'humanApproval': False, 'actualLearnerEvidence': False}
freeze.write_text(json.dumps(sealed, ensure_ascii=False, indent=2) + '\n')
for binding in files:
    verify(binding)
print(json.dumps({'checkpoint': bind(checkpoint), 'freeze': bind(freeze), 'fileCount': len(files), 'normalSuccessfulTerminals': len(terminals), 'bioStrict': 335, 'chemStrict': 180, 'newScientificClosures': 8, 'restoredBindings': 0, 'netGain': 8, 'lost': 0, 'historicalFilesOverwritten': 0}))
