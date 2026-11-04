"""Detached preparation and actual JVM, with one terminal supervisor receipt."""
from pathlib import Path
from datetime import datetime, timezone
import json
import os
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
def write(name, value):
    with (HERE / name).open('x') as handle:
        json.dump(value, handle, indent=2)
        handle.write('\n')

started = time.monotonic()
write('supervisor.started.json', {'pid': os.getpid(), 'timestampUtc': datetime.now(timezone.utc).isoformat()})
try:
    for phase in ['prepare', 'run']:
        command = [sys.executable, '-u', str(HERE / f'{phase}.py')]
        with (HERE / f'{phase}.stdout.log').open('x') as handle:
            process = subprocess.Popen(command, cwd=HERE, stdin=subprocess.DEVNULL,
                                       stdout=handle, stderr=subprocess.STDOUT)
            write(f'{phase}.process.json', {'pid': process.pid, 'command': command})
            code = process.wait()
        write(f'{phase}.terminal.json', {'exitCode': code})
        if code:
            raise RuntimeError(f'{phase} exited {code}; see {phase}.stdout.log')
    write('supervisor.complete.json', {'status': 'PASS_ACTUAL_FINITE_MEASUREMENT_COMPLETED',
          'seconds': round(time.monotonic() - started, 2), 'resultPath': str(HERE / 'result.json')})
except BaseException as error:
    write('supervisor.complete.json', {'status': 'FAILED_NO_SUCCESS_CLAIM',
          'seconds': round(time.monotonic() - started, 2), 'type': type(error).__name__, 'message': str(error)})
    raise
