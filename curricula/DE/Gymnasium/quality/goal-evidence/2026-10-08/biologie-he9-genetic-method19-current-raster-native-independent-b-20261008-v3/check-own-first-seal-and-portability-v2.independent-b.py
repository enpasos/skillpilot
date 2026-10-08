# SPDX-License-Identifier: Apache-2.0
"""Exact own seal and contained relative source-asset symlink verification.

The earlier overstrict no-author-symlink diagnostic is retained unchanged.
Relative contained links to frozen existing raster files are portable; this
does not waive missing files or change any repository validator.
"""
import hashlib
import json
import os
from pathlib import Path

root = Path.cwd()
own = Path(__file__).resolve().parent
first = own / 'completed-one-current-native-D1-P1-V1.independent-b.first.freeze.json'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(root)),'sha256':sha(p),'bytes':p.stat().st_size}
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
sealed_paths = {root / row['path'] for row in author_rows}
links = []
for row in author_rows:
    p = root / row['path']
    assert p.is_file(), p
    assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes'], p
    if p.is_symlink():
        target = os.readlink(p)
        assert not os.path.isabs(target), (p,target)
        resolved = p.resolve(strict=True)
        assert resolved.is_relative_to(author.parent.resolve()), (p,resolved)
        assert resolved in sealed_paths and not resolved.is_symlink() and resolved.is_file(), (p,resolved)
        assert sha(resolved) == row['sha256'], (p,resolved)
        links.append({'linkPath':str(p.relative_to(root)),'relativeTarget':target,'actualExistingSealedTarget':bind(resolved),'portableContainedRelativeLink':True})
assert len(links) == 1
all_files = [p for p in own.rglob('*') if p.is_file()]
assert not any(p.is_symlink() for p in own.rglob('*'))
assert not any(p.name in {'book.pdf','book.html'} for p in all_files)
for p in all_files:
    if p.suffix == '.json': json.loads(p.read_text())
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip(): json.loads(line)
assert record['activeWrites'] == 0 and record['strictGainClaimed'] == 0
assert not record['humanApproval'] and not record['humanTrial']
assert not record['peerANewNativeOutputsReadBeforeOwnFirstSeal']
with (own / 'actual-contained-author-symlink-portability-v2.independent-b.receipt.json').open('x') as f:
    json.dump({'schemaVersion':1,'artifactKind':'independent-B-exact-first-seal-contained-relative-symlink-technical-followup',
        'firstSeal':bind(first),'ownFirstFrozenFiles':20,'authorFrozenFiles':92,'actualRelativeContainedLinks':links,
        'earlierOverstrictCheckPreserved':'check-own-first-seal-and-portability.terminal.actual.json',
        'earlierExit1IsNewScienceOrVDefect':False,'ownSymlinks':0,'missingTargets':0,'outsideAuthorTargets':0,
        'allOwnJSONAndJSONLParse':True,'repositoryValidatorChanges':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False},f,ensure_ascii=False,indent=2);f.write('\n')
print('Own native19 first seal:20 exact completed files; author92 exact inputs;1 actual relative contained symlink targets a sealed existing PNG; all own JSON/JSONL parse. Earlier overstrict diagnostic preserved. Technical verification only.')
