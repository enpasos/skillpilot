# SPDX-License-Identifier: Apache-2.0
"""Verify exact completed first verdict and its frozen public-content inputs.

This is a technical seal/portability check, not a new science or V review.
"""
import hashlib
import json
from pathlib import Path

root = Path.cwd()
own = Path(__file__).resolve().parent
first = own / 'completed-one-current-native-D1-P1-V1.independent-b.first.freeze.json'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
assert sha(first) == '11e591fcf4198f8fa278116d420aa3dc489cc1e78b9134b69da47dcd521612e9'
record = json.loads(first.read_text())
assert len(record['frozenFiles']) == 20
for row in record['frozenFiles']:
    p = root / row['path']
    assert p.is_file() and not p.is_symlink(), p
    assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes'], p
author = root / record['authorExactInputSeal']['path']
assert sha(author) == record['authorExactInputSeal']['sha256']
author_rows = json.loads(author.read_text())['frozenFiles']
assert len(author_rows) == 92
for row in author_rows:
    p = root / row['path']
    assert p.is_file() and not p.is_symlink(), p
    assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes'], p
all_files = [p for p in own.rglob('*') if p.is_file()]
assert not any(p.is_symlink() for p in own.rglob('*'))
assert not any(p.name in {'book.pdf', 'book.html'} for p in all_files)
for p in all_files:
    if p.suffix == '.json': json.loads(p.read_text())
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
assert record['activeWrites'] == 0 and record['strictGainClaimed'] == 0
assert not record['humanApproval'] and not record['humanTrial']
assert not record['peerANewNativeOutputsReadBeforeOwnFirstSeal']
print('Own native19 first seal:20 exact completed files; author92 exact inputs; no symlinks or native-render copies; all own JSON/JSONL parse; machine/human boundaries retained. Technical check only, not new science approval.')
