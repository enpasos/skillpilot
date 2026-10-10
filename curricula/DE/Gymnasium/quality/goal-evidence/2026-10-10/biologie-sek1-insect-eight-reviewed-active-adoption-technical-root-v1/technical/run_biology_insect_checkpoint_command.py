"""Capture one ordinary check's real output and terminal result, without overwrite."""
import datetime
import json
import pathlib
import subprocess
import sys
import time

root = pathlib.Path('/home/enpasos/projects/skillpilot')
package = root / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-sek1-insect-eight-reviewed-active-adoption-technical-root-v1'
assert (package / 'actual-reviewed-eight-active-adoption.receipt.json').is_file()
checks = package / 'checks'
label, command = sys.argv[1], sys.argv[2:]
assert command and '/' not in label
out = checks / (label + '.stdout.actual.txt')
err = checks / (label + '.stderr.actual.txt')
terminal = checks / (label + '.terminal.actual.json')
assert not any(path.exists() for path in [out, err, terminal]), 'Choose a new receipt label'
started = datetime.datetime.now(datetime.timezone.utc)
clock = time.monotonic()
with out.open('w') as stdout, err.open('w') as stderr:
    result = subprocess.run(command, cwd=root, stdout=stdout, stderr=stderr)
receipt = {'schemaVersion': 1, 'command': command, 'startedAt': started.isoformat(), 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'durationSeconds': round(time.monotonic() - clock, 3), 'exitCode': result.returncode, 'stdoutPath': str(out.relative_to(root)), 'stderrPath': str(err.relative_to(root))}
terminal.write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
print(out.read_text()[-1800:])
print(err.read_text()[-1800:])
sys.exit(result.returncode)
