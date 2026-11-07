#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
from prepare_and_qualify import P, W, frame_command, js, write
from datetime import datetime, timezone
import shutil
import subprocess
import time

shutil.copy2(P / 'candidate/app/scripts/lib/goalVisualizationBiology56Contexts.ts', W / 'lib/goalVisualizationBiology56Contexts.ts')
attempts = P / 'qualification-attempts'
attempts.mkdir(exist_ok=True)
number = len(list(attempts.glob('*.execution.json'))) + 2
prefix = attempts / ('attempt-' + str(number).zfill(2))
command = frame_command('qualify_biology56_and_regress132.mts')
started = datetime.now(timezone.utc).isoformat()
begin = time.monotonic()
result = subprocess.run(command, capture_output=True)
write(prefix.with_suffix('.stdout'), result.stdout)
write(prefix.with_suffix('.stderr'), result.stderr)
js(prefix.with_suffix('.execution.json'), {'argv': command, 'exitCode': result.returncode,
    'startedAtActualUTC': started, 'finishedAtActualUTC': datetime.now(timezone.utc).isoformat(),
    'elapsedSeconds': time.monotonic() - begin, 'combinedProducerRuns': 0, 'originalSealsOrBytesMutated': False})
print(result.returncode, result.stdout.decode()[-4000:], result.stderr.decode()[-6000:], flush=True)
assert result.returncode == 0
