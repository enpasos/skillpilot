"""Launch only this private supervisor; no existing service is touched."""
from pathlib import Path
import json
import subprocess
import sys

HERE = Path(__file__).resolve().parent
assert (HERE / 'authorization.json').is_file()
assert (HERE / 'preparation-script-seal.json').is_file()
assert not (HERE / 'launch.json').exists(), 'Never restart an attempt because observation expired'
with (HERE / 'supervisor.log').open('x') as log:
    process = subprocess.Popen([sys.executable, '-u', str(HERE / 'supervise.py')], cwd=HERE,
                               stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT,
                               start_new_session=True)
with (HERE / 'launch.json').open('x') as handle:
    json.dump({'pid': process.pid, 'supervisor': str(HERE / 'supervise.py'), 'detached': True}, handle, indent=2)
    handle.write('\n')
print(json.dumps({'detachedSupervisorPid': process.pid, 'folder': str(HERE)}))
