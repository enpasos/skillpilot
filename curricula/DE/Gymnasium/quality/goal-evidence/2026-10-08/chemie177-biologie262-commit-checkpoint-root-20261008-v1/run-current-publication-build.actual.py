# SPDX-License-Identifier: Apache-2.0
"""Run the ordinary source-input gate and complete application build once."""
import hashlib
import json
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def binding(path):
    return {
        'path': str(path.relative_to(ROOT)),
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'bytes': path.stat().st_size,
    }


for label, argv in [
    ('current-goal-book-mandatory-source-inputs', ['npm', '--prefix', 'app', 'run', 'test:goal-book-build']),
    ('current-complete-application-and-four-book-build', ['npm', '--prefix', 'app', 'run', 'build']),
]:
    out = OWN / f'{label}.stdout.actual.txt'
    err = OWN / f'{label}.stderr.actual.txt'
    terminal = OWN / f'{label}.terminal.actual.json'
    assert not any(path.exists() for path in (out, err, terminal))
    started = time.monotonic()
    with out.open('w') as stdout, err.open('w') as stderr:
        result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr)
    terminal.write_text(json.dumps({
        'argv': argv, 'actualExitCode': result.returncode,
        'elapsedSeconds': time.monotonic() - started,
        'endedAt': datetime.now(timezone.utc).isoformat(),
        'stdout': binding(out), 'stderr': binding(err),
        'deployment': False, 'humanAcceptance': False,
    }, indent=2) + '\n')
    print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
    if result.returncode:
        raise SystemExit(result.returncode)
