# SPDX-License-Identifier: Apache-2.0
"""Capture actual terminal results of bounded inactive author checks."""
from pathlib import Path
import hashlib
import json
import subprocess
import time

own = Path(__file__).resolve().parent
root = own.parents[6]
rel = lambda p: str(p.relative_to(root))
images = root / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he7-ten-image-author-root-20261008-v1/selected-ten-author-images.exact.json'
tsx = 'app/node_modules/tsx/dist/cli.mjs'
commands = [
    ('guarded-ten-image-candidate', ['python', rel(own / 'prepare-final-ten-raster-candidate.guarded.py'), rel(images), hashlib.sha256(images.read_bytes()).hexdigest()]),
    ('native-ten-PNG-page-campaign-P-author', ['node', tsx, rel(own / 'materialize-final-ten-native-author.mts'), rel(own / 'ten-current-closed-contract.author.candidates.json'), rel(own / 'ten-whole-goals-twenty-complete-DEEN-cases.exact.md')]),
    ('retained-A10-native', ['node', tsx, 'app/scripts/checkSemanticAtomicity.ts', '--config=' + rel(own / 'A10.exact-retained-current.inactive-native.config.json'), '--mode=check']),
    ('retained-M17-origin-closure-native', ['node', tsx, 'app/scripts/checkMemoryCardReview.ts', '--config=' + rel(own / 'M.shared-memory-origin-closure.exact-retained-current.inactive-native.config.json'), '--mode=check']),
]
for name, command in commands:
    started = time.time()
    result = subprocess.run(command, cwd=root, capture_output=True, text=True)
    for stream in ['stdout', 'stderr']:
        with (own / (name + '.' + stream + '.actual.txt')).open('x') as f:
            f.write(getattr(result, stream))
    with (own / (name + '.terminal.actual.json')).open('x') as f:
        json.dump({'command': command, 'cwd': str(root), 'exitCode': result.returncode,
                   'durationSeconds': time.time() - started, 'activeWrites': 0}, f, indent=2)
        f.write('\n')
    print(json.dumps({'check': name, 'exitCode': result.returncode}), flush=True)
    if result.returncode:
        print(result.stderr[-4000:], flush=True)
        raise SystemExit(result.returncode)
