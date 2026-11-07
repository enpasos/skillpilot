#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from prepare_and_qualify import R, P, W, frame_command, js, write
from datetime import datetime, timezone
import shutil
import subprocess
import time

shutil.copy2(P / 'candidate/contracts/goal-visualization-context/v1/qualification.schema.json', W / 'contracts-v1/qualification.schema.json')
base = frame_command('test_cold_188_authority.mts')
tmp = W / 'cold-authority-tmp'
tmp.mkdir(exist_ok=False)
base[base.index('--setenv') + 2] = str(tmp)
position = base.index('--chdir')
cold = base[:position] + ['--ro-bind', str(W / 'contracts-v1'), str(R / 'contracts/goal-visualization-context/v1'),
    '--ro-bind', str(P / 'candidate/scripts/visualization_qualified_context_capsule.py'), str(R / 'scripts/visualization_qualified_context_capsule.py')] + base[position:]
prefix = base[:base.index('--') + 1]
prefix[prefix.index('--chdir') + 1] = str(R / 'app')
compiler = prefix + [str(R / 'app/node_modules/.bin/tsc'), '--noEmit', '--strict', '--skipLibCheck', '--allowJs', '--esModuleInterop',
    '--target', 'ES2022', '--module', 'ESNext', '--moduleResolution', 'Bundler', '--types', 'node', '--noUnusedLocals', '--noUnusedParameters',
    'scripts/goalVisualizationReviewedContext.ts', 'scripts/lib/goalVisualizationBiology56Contexts.ts', 'scripts/lib/qualifiedVisualizationContextAuthority.ts']
lint = prefix + [str(R / 'app/node_modules/.bin/eslint'), 'scripts/goalVisualizationReviewedContext.ts',
    'scripts/lib/goalVisualizationBiology56Contexts.ts', 'scripts/lib/qualifiedVisualizationContextAuthority.ts']
jobs = []
for name, command in [('cold-authority', cold), ('final-strict-types', compiler), ('final-lint', lint)]:
    jobs.append((name, command, subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE), time.monotonic(), datetime.now(timezone.utc).isoformat()))
rows = []
for name, command, child, begin, started in jobs:
    out, err = child.communicate()
    write(P / (name + '.stdout'), out)
    write(P / (name + '.stderr'), err)
    rows.append({'check': name, 'argv': command, 'exitCode': child.returncode, 'elapsedSeconds': time.monotonic() - begin, 'startedAtActualUTC': started})
    print(name, child.returncode, out.decode()[-5000:], err.decode()[-6000:], flush=True)
js(P / 'final-checks.execution.json', rows)
assert all(row['exitCode'] == 0 for row in rows)
