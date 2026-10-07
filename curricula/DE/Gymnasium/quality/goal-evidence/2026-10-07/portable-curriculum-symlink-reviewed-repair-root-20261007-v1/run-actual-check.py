"""Capture terminal tool output and status; publish JSON only after completion."""
import datetime
import json
import subprocess
import sys
from pathlib import Path

out = Path(__file__).resolve().parent
name = sys.argv[1]
argv = sys.argv[2:]
assert name and all(c.isalnum() or c in '-_' for c in name)
receipt_path = out / f'{name}.actual.terminal.receipt.json'
assert not receipt_path.exists(), 'Keep prior attempts intact.'
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
with (out / f'{name}.actual.stdout.txt').open('wb') as stdout, (out / f'{name}.actual.stderr.txt').open('wb') as stderr:
    completed = subprocess.run(argv, stdout=stdout, stderr=stderr)
receipt = {'documentType': 'actual completed local command', 'name': name, 'argv': argv, 'startedAtUTC': started, 'completedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'exitCode': completed.returncode}
receipt_path.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
if completed.returncode == 0 and '--format=json' in argv:
    parsed = json.loads((out / f'{name}.actual.stdout.txt').read_text())
    (out / f'{name}.actual.report.json').write_text(json.dumps(parsed, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(receipt))
if completed.returncode != 0:
    for stream in ['stderr', 'stdout']:
        print((out / f'{name}.actual.{stream}.txt').read_text(errors='replace')[-12000:])
sys.exit(completed.returncode)
