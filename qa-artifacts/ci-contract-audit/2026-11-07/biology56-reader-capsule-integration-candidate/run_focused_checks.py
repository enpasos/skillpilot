#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from prepare_and_qualify import R, P, W, frame_command, js, write
from datetime import datetime, timezone
import json
import subprocess
import time

base = frame_command('test_biology56_controls.mts')
normal = list(base)
raw = bytearray((R / 'app/public/assets/goal-visualizations/biologie/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0.png').read_bytes())
raw[-1] ^= 1
changed = W / 'changed-current-public-asset.png'
write(changed, raw)
position = base.index('--chdir')
asset = base[:position] + ['--ro-bind', str(changed), str(R / 'app/public/assets/goal-visualizations/biologie/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0.png')] + base[position:] + ['--changed-current-asset']
prefix = base[:base.index('--') + 1]
prefix[prefix.index('--chdir') + 1] = str(R / 'app')
compiler = prefix + [str(R / 'app/node_modules/.bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--allowJs', '--esModuleInterop',
    '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--types', 'node',
    '--noUnusedLocals', '--noUnusedParameters', 'scripts/goalVisualizationReviewedContext.ts', 'scripts/lib/goalVisualizationBiology56Contexts.ts']
lint = prefix + [str(R / 'app/node_modules/.bin/eslint'), 'scripts/goalVisualizationReviewedContext.ts', 'scripts/lib/goalVisualizationBiology56Contexts.ts']
jobs = []
for name, command in [('controls', normal), ('current-asset-control', asset), ('strict-types', compiler), ('lint', lint)]:
    jobs.append((name, command, subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE), time.monotonic(), datetime.now(timezone.utc).isoformat()))
rows = []
for name, command, child, begin, started in jobs:
    out, err = child.communicate()
    write(P / (name + '.stdout'), out)
    write(P / (name + '.stderr'), err)
    rows.append({'check': name, 'argv': command, 'exitCode': child.returncode, 'elapsedSeconds': time.monotonic() - begin, 'startedAtActualUTC': started})
    print(name, child.returncode, out.decode()[-5000:], err.decode()[-5000:], flush=True)
js(P / 'focused-checks.execution.json', rows)
assert all(row['exitCode'] == 0 for row in rows)
