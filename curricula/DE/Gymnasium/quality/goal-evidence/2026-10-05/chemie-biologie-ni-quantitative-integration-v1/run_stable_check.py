# SPDX-License-Identifier: Apache-2.0
"""Record actual scoped commands and terminal results at the stable integration."""
from datetime import datetime, timezone
from pathlib import Path
import argparse
import hashlib
import json
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
parser = argparse.ArgumentParser()
parser.add_argument('label')
parser.add_argument('--cwd', default=str(ROOT))
parser.add_argument('command', nargs=argparse.REMAINDER)
args = parser.parse_args()
command = args.command[1:] if args.command[:1] == ['--'] else args.command
assert args.label and all(c.isalnum() or c in '-_' for c in args.label)
assert command
outputs = [OWN / f'{args.label}.{suffix}' for suffix in ['stdout.txt', 'stderr.txt', 'terminal.receipt.json']]
assert not any(p.exists() for p in outputs), 'Use a new additive label.'
start = datetime.now(timezone.utc).isoformat()
with outputs[0].open('wb') as stdout, outputs[1].open('wb') as stderr:
    result = subprocess.run(command, cwd=args.cwd, stdout=stdout, stderr=stderr)
receipt = {
    'startedAtUTC': start, 'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'command': command, 'cwd': args.cwd, 'exitCode': result.returncode,
    'stdoutSHA256': hashlib.sha256(outputs[0].read_bytes()).hexdigest(),
    'stderrSHA256': hashlib.sha256(outputs[1].read_bytes()).hexdigest(),
    'humanApproval': False, 'humanTrial': False,
}
outputs[2].write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(receipt, ensure_ascii=False))
if result.returncode != 0:
    print(outputs[1].read_text(errors='replace')[-6000:])
raise SystemExit(result.returncode)
