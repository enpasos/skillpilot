# SPDX-License-Identifier: Apache-2.0
"""Record one ordinary repository command without altering its contract."""
import hashlib
import json
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
label, *argv = sys.argv[1:]
assert label and argv and '/' not in label
out, err = [OWN / f'{label}.{stream}.actual.txt' for stream in ('stdout', 'stderr')]
terminal = OWN / f'{label}.terminal.actual.json'
assert not any(path.exists() for path in (out, err, terminal))
started = time.monotonic()
with out.open('w') as stdout, err.open('w') as stderr:
    result = subprocess.run(argv, cwd=ROOT, stdout=stdout, stderr=stderr)


def binding(path):
    return {'path': str(path.relative_to(ROOT)),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'bytes': path.stat().st_size}


terminal.write_text(json.dumps({'argv': argv, 'actualExitCode': result.returncode,
    'elapsedSeconds': time.monotonic() - started,
    'endedAt': datetime.now(timezone.utc).isoformat(),
    'stdout': binding(out), 'stderr': binding(err)}, indent=2) + '\n')
print(json.dumps({'check': label, 'actualExitCode': result.returncode}), flush=True)
raise SystemExit(result.returncode)
