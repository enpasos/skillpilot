# SPDX-License-Identifier: Apache-2.0
"""The existing residual wrapper scope has five leaves and cannot certify the 26 routines."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
source_path = ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-chemistry-inquiry-communication.config.json'
config = json.loads(source_path.read_text())
raw = json.loads((OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json').read_text())
ids = [row['wholeGoal']['id'] for row in raw['routineBodies']]
assert len(ids) == len(set(ids)) == 26
config['landscapePath'] = (OWN / 'candidate/canonical504-current26-resource-links.inactive.json').relative_to(ROOT).as_posix()
config['scope'] = {'label': 'Exact 26 current whole B008 prospective routines; old residual five-leaf wrapper review does not cover this scope',
                   'leafGoalIds': ids}
path = OWN / 'candidate/atomicity.current26-explicit-scope.existing-records.normal-probe.config.json'
assert not path.exists()
path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n')
command = ['node', str(ROOT / 'app/node_modules/tsx/dist/cli.mjs'),
           str(ROOT / 'app/scripts/semanticAtomicityReview.ts'), '--config=' + path.relative_to(ROOT).as_posix(), '--mode=check']
result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, timeout=30)
log = OWN / 'checks/atomicity.exact26-unmodified-old-records.actual.stdout.txt'
assert not log.exists()
log.write_text(result.stdout + result.stderr)
terminal = {'schemaVersion': 1, 'argv': command, 'actualExitCode': result.returncode,
            'normalOutput': {'path': log.relative_to(ROOT).as_posix(),
                             'sha256': 'sha256:' + hashlib.sha256(log.read_bytes()).hexdigest(), 'bytes': log.stat().st_size},
            'selectedRoutineIds': ids, 'existingResidualWrapperLeaves': 5,
            'residualWrapperProbePassIsNotSelectedRoutineApproval': True,
            'actualSelected26AtomicityStatus': 'PENDING_MISSING_OR_STALE_SCIENTIFIC_RECORDS',
            'normalScopeCounts': [line for line in result.stdout.splitlines()
                                 if any(term in line for term in ['Content leaf', 'Current reviewed', 'Missing ', 'Stale ', 'Obsolete '])],
            'noFingerprintRefreshOrScienceReview': True, 'activeWrites': [], 'strictGain': 0}
target = OWN / 'checks/atomicity.exact26-unmodified-old-records.actual-terminal.json'
assert not target.exists()
target.write_text(json.dumps(terminal, ensure_ascii=False, indent=2) + '\n')
assert result.returncode == 1
assert 'Content leaf goals in scope: 26' in result.stdout
assert 'Missing review records: 24' in result.stdout
assert 'Stale review records: 1' in result.stdout
assert 'Current reviewed atomic: 1' in result.stdout
print(json.dumps({'actualSelected26': True, 'exactOldAtomicityReuse': 1,
                  'missingScientificRecords': 24, 'changedOldGoalNeedingTargetedReview': 1,
                  'actualExitCode': result.returncode, 'activeWrites': 0, 'strictGain': 0}))
