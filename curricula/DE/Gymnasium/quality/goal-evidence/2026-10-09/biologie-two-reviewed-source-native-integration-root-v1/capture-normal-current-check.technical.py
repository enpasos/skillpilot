# SPDX-License-Identifier: Apache-2.0
"""Capture an actual normal command, its raw output and terminal result."""
import datetime
import hashlib
import json
import pathlib
import subprocess
import sys
import time

root = pathlib.Path.cwd()
own = pathlib.Path(__file__).resolve().parent
prefix, command_json = sys.argv[1:]
argv = json.loads(command_json)
assert argv and all(isinstance(value, str) for value in argv)
assert argv[0].strip()
out = own / (prefix + ".stdout.actual.txt")
err = own / (prefix + ".stderr.actual.txt")
terminal = own / (prefix + ".terminal.actual.json")
assert not terminal.exists()
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
tick = time.monotonic()
with out.open("xb") as stdout, err.open("xb") as stderr:
    code = subprocess.run(argv, cwd=root, stdout=stdout, stderr=stderr).returncode

def bind(path):
    return {"path": path.relative_to(root).as_posix(), "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size}

receipt = {"schemaVersion": 1, "argv": argv, "workingDirectory": str(root), "startedAt": started, "completedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), "elapsedSeconds": time.monotonic() - tick, "exitCode": code, "stdout": bind(out), "stderr": bind(err)}
terminal.write_text(json.dumps(receipt, indent=2) + "\n")
print(json.dumps(receipt), flush=True)
for path in [out, err]:
    body = path.read_text(errors="replace")
    if len(body) < 4000:
        print(body, flush=True)
    elif path == err:
        print(body[-3000:], flush=True)
sys.exit(code)
