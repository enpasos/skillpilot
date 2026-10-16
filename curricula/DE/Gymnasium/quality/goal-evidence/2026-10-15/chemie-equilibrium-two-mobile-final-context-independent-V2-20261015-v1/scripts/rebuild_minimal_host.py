# SPDX-License-Identifier: Apache-2.0
"""Rebuild exact private capsule only; no review, check or scientific vote."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

repo = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
own = Path(__file__).resolve().parents[1]
mapping = json.loads((own / 'checks/REBUILD.two-PNG-V2.final-minimal-host.json').read_text())
host = (repo / sys.argv[1]).resolve()
assert host.is_relative_to(repo / 'tmp') and not host.exists()
for row in mapping['sourceMap'] + mapping['imageAliases']:
    ref = row['physicalRepositorySource']
    payload = (repo / ref['path']).read_bytes()
    assert len(payload) == ref['bytes']
    assert 'sha256:' + hashlib.sha256(payload).hexdigest() == ref['sha256']
for row in mapping['sourceMap']:
    target = host / row['normalHostAlias']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(repo / row['physicalRepositorySource']['path'], target)
for row in mapping['imageAliases']:
    target = host / row['normalHostAlias']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.symlink_to(repo / row['physicalRepositorySource']['path'])
(host / 'app/node_modules').symlink_to(repo / 'app/node_modules', target_is_directory=True)
print(json.dumps({'host': str(host.relative_to(repo)),
                  'regularFiles': len(mapping['sourceMap']),
                  'imageCopies': 0, 'normalOrCentralChecksExecuted': 0,
                  'newVotes': 0}))
