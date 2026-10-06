#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run existing native description contracts on the exact relocated reviews."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import sys

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
ISO = ROOT / 'tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root'
scope = sys.argv[1]
assert scope in ['d18', 'd5']
attempt = sys.argv[2] if len(sys.argv) > 2 else 'first'
assert attempt in ['first', 'native-filenames']
relative = str(OWN.relative_to(ROOT))
config = f'{relative}/{scope}.batch.config.json'
book = f'{relative}/native-{scope}'
steps = [
    ('summarize', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'summarize', '--config', config, '--write']),
    ('synthesis-manifest', ['app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts', '--config', config, '--authoring', f'{book}/synthesis-authoring.json', '--write']),
    ('resolutions', ['app/scripts/materializeGoalDescriptionRolloutResolutions.ts', '--config', config, '--synthesis-manifest', f'{book}/synthesis-decisions.json', '--write']),
    ('finalize', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', config, '--write']),
    ('current-check', ['app/scripts/materializeGoalDescriptionRolloutBatch.ts', 'finalize', '--config', config]),
]
receipt = []
for label, args in steps:
    start = datetime.now(timezone.utc).isoformat()
    command = ['app/node_modules/.bin/tsx', *args]
    proc = subprocess.run(command, cwd=ISO, capture_output=True)
    streams = {}
    for kind, data in [('stdout', proc.stdout), ('stderr', proc.stderr)]:
        path = OWN / f'{scope}-{attempt}-{label}.{kind}.txt'
        with path.open('xb') as stream:
            stream.write(data)
        streams[f'{kind}Path'] = str(path.relative_to(ROOT))
        streams[f'{kind}SHA256'] = hashlib.sha256(data).hexdigest()
    receipt.append({'command': command, 'cwd': str(ISO), 'startedAtUTC': start,
                    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
                    'actualExitCode': proc.returncode, **streams})
    print(scope, label, 'Exit', proc.returncode, flush=True)
    if proc.returncode:
        print(proc.stderr.decode(), flush=True)
        break
path = OWN / f'{scope}-{attempt}-native-synthesis.actual.receipt.json'
with path.open('x') as stream:
    stream.write(json.dumps({'commands': receipt, 'humanApproval': False,
                            'humanTrial': False, 'activeWrites': 0,
                            'operativeStrictNetIncrease': 0}, ensure_ascii=False, indent=2) + '\n')
assert len(receipt) == 5 and all(row['actualExitCode'] == 0 for row in receipt)
