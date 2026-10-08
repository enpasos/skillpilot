# SPDX-License-Identifier: Apache-2.0
"""Run ordinary commands in the existing isolated capsule, keeping every terminal."""
from pathlib import Path
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import subprocess
import time

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT / 'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
PREP_REL = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
CLI = ['node', 'app/node_modules/tsx/dist/cli.mjs']


def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def run(label, argv):
    out = OWN / 'checks' / f'{label}.stdout.actual.txt'
    err = OWN / 'checks' / f'{label}.stderr.actual.txt'
    terminal = OWN / 'checks' / f'{label}.terminal.actual.json'
    assert not out.exists() and not err.exists() and not terminal.exists()
    start = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=CAP, stdout=stdout, stderr=stderr)
    record = {'argv': argv, 'capsuleRoot': str(CAP.relative_to(ROOT)),
              'exitCode': result.returncode, 'elapsedSeconds': time.monotonic() - start,
              'endedAtUtc': datetime.now(timezone.utc).isoformat(),
              'stdout': bind(out), 'stderr': bind(err), 'activeWrites': 0,
              'checkIsIndependentScientificApproval': False}
    terminal.write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    return record


# Verify all report outputs that these commands can write are isolated regular paths.
status = CAP / 'docs/qa-ci/status'
for name in ['curriculum-quality-status.json', 'curriculum-quality-status.md',
             'curriculum-source-coverage-audit.json', 'curriculum-source-coverage-audit.md']:
    path = status / name
    assert not path.is_symlink() and path.resolve().is_relative_to(CAP), path

read_checks = [
    ('ordinary-source-atlas-current', CLI + ['app/scripts/buildGoalBookSourceAtlasInputs.ts', '--config', 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json', '--check']),
    ('ordinary-A394-existing-full-config', CLI + ['app/scripts/semanticAtomicityReview.ts', '--mode=check', '--config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json']),
    ('ordinary-M394-existing-eight-scopes', CLI + ['app/scripts/memoryCardReview.ts', '--mode=check', '--config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json']),
    ('ordinary-P2-original-whole-profiles', CLI + ['app/scripts/positiveGoalEvidenceReview.ts', '--mode=check', '--config=' + PREP_REL + '/positive/P2.future-active.config.json']),
]
with ThreadPoolExecutor(max_workers=4) as pool:
    outcomes = list(pool.map(lambda item: run(*item), read_checks))
with ThreadPoolExecutor(max_workers=2) as pool:
    generated = list(pool.map(lambda item: run(*item), [
        ('ordinary-curriculum-status-refresh', CLI + ['app/scripts/generateCurriculumQualityStatus.ts']),
        ('ordinary-source-coverage-audit-refresh', CLI + ['app/scripts/generateCurriculumSourceCoverageAudit.ts']),
    ]))
if generated[0]['exitCode'] == 0:
    outcomes.append(run('ordinary-protected-maturity-floors', CLI + ['app/scripts/checkCurriculumMaturityFloors.ts']))
    for name in ['curriculum-quality-status.json', 'curriculum-quality-status.md']:
        (OWN / 'checks' / f'capsule.{name}').write_bytes((status / name).read_bytes())
if generated[1]['exitCode'] == 0:
    for name in ['curriculum-source-coverage-audit.json', 'curriculum-source-coverage-audit.md']:
        (OWN / 'checks' / f'capsule.{name}').write_bytes((status / name).read_bytes())
summary = {'schemaVersion': 1, 'ordinaryChecks': outcomes + generated,
           'allFailuresRetained': True, 'newScientificReviewByAuthor': False,
           'activeWrites': 0, 'activeStrictGain': 0, 'humanApproval': False}
(OWN / 'checks/ordinary-checks.actual-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps({'complete': True, 'passed': sum(r['exitCode'] == 0 for r in outcomes + generated), 'failed': sum(r['exitCode'] != 0 for r in outcomes + generated), 'activeWrites': 0}), flush=True)
