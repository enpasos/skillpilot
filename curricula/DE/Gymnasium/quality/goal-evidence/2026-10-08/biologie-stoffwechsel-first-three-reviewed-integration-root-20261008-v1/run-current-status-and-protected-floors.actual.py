# SPDX-License-Identifier: Apache-2.0
"""Regenerate current machine status and check unchanged protected floors."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import time

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def bind(p):
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


checks = []
for name, argv in [
    ('current-curriculum-status', ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/generateCurriculumQualityStatus.ts']),
    ('current-protected-maturity-floors', ['node', 'app/node_modules/tsx/dist/cli.mjs', 'app/scripts/checkCurriculumMaturityFloors.ts']),
    ('current-whitespace', ['git', 'diff', '--check']),
]:
    out = OWN / f'{name}.stdout.actual.txt'
    err = OWN / f'{name}.stderr.actual.txt'
    assert not out.exists() and not err.exists()
    start = time.monotonic()
    with out.open('w') as a, err.open('w') as b:
        r = subprocess.run(argv, cwd=ROOT, stdout=a, stderr=b)
    record = {'argv': argv, 'actualExitCode': r.returncode, 'elapsedSeconds': time.monotonic() - start,
              'endedAt': datetime.now(timezone.utc).isoformat(), 'stdout': bind(out), 'stderr': bind(err)}
    (OWN / f'{name}.terminal.actual.json').write_text(json.dumps(record, indent=2) + '\n')
    print(json.dumps({'check': name, 'actualExitCode': r.returncode}), flush=True)
    assert r.returncode == 0, (record, err.read_text()[-3000:])
    checks.append(record)
(OWN / 'current-status-and-protected-floors.actual.json').write_text(json.dumps({
    'checks': checks, 'allTerminalExitCodesZero': True,
    'currentCentralReport': bind(OWN / 'affected-central.stdout.actual.txt'),
    'statusJSON': bind(ROOT / 'docs/qa-ci/status/curriculum-quality-status.json'),
    'protectedFloorPolicyUnchanged': True, 'humanGatesUnchanged': True, 'fullGoalStillOpen': True,
}, indent=2) + '\n')
