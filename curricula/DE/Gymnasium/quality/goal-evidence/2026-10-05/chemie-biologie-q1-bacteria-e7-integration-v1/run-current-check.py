#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture a real native check without overwriting an earlier receipt."""
from pathlib import Path
from datetime import datetime, timezone
import argparse
import hashlib
import json
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

parser = argparse.ArgumentParser()
parser.add_argument('name')
parser.add_argument('command', nargs=argparse.REMAINDER)
args = parser.parse_args()
assert args.name and all(c.isalnum() or c in '-_' for c in args.name)
command = args.command[1:] if args.command[:1] == ['--'] else args.command
assert command, 'A real command is required'
stdout = OWN / (args.name + '.stdout.txt')
stderr = OWN / (args.name + '.stderr.txt')
receipt = OWN / (args.name + '.terminal.receipt.json')
assert not any(p.exists() for p in [stdout, stderr, receipt]), 'Use a distinct attempt name'
started = datetime.now(timezone.utc).isoformat()
with stdout.open('xb') as out, stderr.open('xb') as err:
    result = subprocess.run(command, cwd=ROOT, stdout=out, stderr=err)
record = dict(command=command, cwd=str(ROOT), startedAt=started,
              completedAt=datetime.now(timezone.utc).isoformat(), exitCode=result.returncode,
              stdoutPath=str(stdout.relative_to(ROOT)), stdoutSHA256=digest(stdout),
              stderrPath=str(stderr.relative_to(ROOT)), stderrSHA256=digest(stderr),
              machineCheckOnly=True, humanApprovalClaimed=False)
receipt.write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(record, ensure_ascii=False))
raise SystemExit(result.returncode)
