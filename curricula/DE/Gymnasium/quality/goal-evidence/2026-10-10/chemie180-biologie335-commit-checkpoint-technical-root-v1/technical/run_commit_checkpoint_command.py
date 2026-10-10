"""Record an existing check against the current commit checkpoint, without overwrite."""
import datetime
import json
import pathlib
import subprocess
import sys
import time

root = pathlib.Path('/home/enpasos/projects/skillpilot')
own = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie180-biologie335-commit-checkpoint-technical-root-v1'
checks = own / 'checks'
checks.mkdir(parents=True, exist_ok=True)
label, command = sys.argv[1], sys.argv[2:]
assert command and '/' not in label
out = checks / (label + '.stdout.actual.txt')
err = checks / (label + '.stderr.actual.txt')
terminal = checks / (label + '.terminal.actual.json')
assert not any(p.exists() for p in [out, err, terminal])
started = datetime.datetime.now(datetime.timezone.utc)
clock = time.monotonic()
with out.open('w') as stdout, err.open('w') as stderr:
    result = subprocess.run(command, cwd=root, stdout=stdout, stderr=stderr)
receipt = {'schemaVersion': 1, 'command': command, 'startedAt': started.isoformat(), 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'durationSeconds': round(time.monotonic() - clock, 3), 'exitCode': result.returncode, 'stdoutPath': str(out.relative_to(root)), 'stderrPath': str(err.relative_to(root))}
terminal.write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
print(out.read_text()[-1500:])
print(err.read_text()[-1500:])
sys.exit(result.returncode)
