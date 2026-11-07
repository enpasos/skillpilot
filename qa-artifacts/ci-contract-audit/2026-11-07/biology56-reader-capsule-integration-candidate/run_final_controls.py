#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from prepare_and_qualify import R, P, W, frame_command, js, write
from datetime import datetime, timezone
import subprocess
import time

base = frame_command('test_biology56_controls_final.mts')
position = base.index('--chdir')
asset = base[:position] + ['--ro-bind', str(W / 'changed-current-public-asset.png'),
    str(R / 'app/public/assets/goal-visualizations/biologie/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0/1abf08d7-6fc1-5705-b2d4-21cb44ceeba0.png')] + base[position:] + ['--changed-current-asset']
children = [(name, command, subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE), time.monotonic())
    for name, command in [('final-controls', base), ('final-current-asset-control', asset)]]
rows = []
for name, command, child, begin in children:
    out, err = child.communicate()
    write(P / (name + '.stdout'), out)
    write(P / (name + '.stderr'), err)
    rows.append({'check': name, 'argv': command, 'exitCode': child.returncode, 'elapsedSeconds': time.monotonic() - begin,
        'finishedAtActualUTC': datetime.now(timezone.utc).isoformat(),
        'reasonForRepeatingSameSevenControls': 'Verify the exact final reader bytes after the behavior-preserving unused-variable lint correction.'})
    print(name, child.returncode, out.decode()[-4000:], err.decode()[-4000:], flush=True)
js(P / 'final-controls.execution.json', rows)
assert all(row['exitCode'] == 0 for row in rows)
