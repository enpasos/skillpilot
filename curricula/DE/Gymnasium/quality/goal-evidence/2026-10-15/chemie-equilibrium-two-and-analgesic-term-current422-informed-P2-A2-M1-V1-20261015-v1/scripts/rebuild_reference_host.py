# SPDX-License-Identifier: Apache-2.0
"""Recreate exact final reference capsule; no normal execution or new votes."""
from pathlib import Path
import hashlib
import json
import shutil
import sys

repo = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
own = Path(__file__).resolve().parents[1]
mapping = json.loads((own / 'checks/REBUILD.final.reference-host.physical-map.json').read_text())
host = (repo / sys.argv[1]).resolve()
assert host.is_relative_to(repo / 'tmp') and not host.exists()
for row in mapping['sourceMap'] + mapping['imageAliases']:
    r = row['physicalRepositorySource']
    b = (repo / r['path']).read_bytes()
    assert len(b) == r['bytes'] and 'sha256:' + hashlib.sha256(b).hexdigest() == r['sha256']
for row in mapping['sourceMap']:
    target = host / row['normalHostAlias']
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(repo / row['physicalRepositorySource']['path'], target)
for row in mapping['imageAliases']:
    target = host / row['normalHostAlias']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.symlink_to(repo / row['physicalRepositorySource']['path'])
(host / 'app/node_modules').symlink_to(repo / 'app/node_modules', target_is_directory=True)
print(json.dumps({'host': str(host.relative_to(repo)), 'regularFiles': len(mapping['sourceMap']),
                  'sourceImageCopies': 0, 'newNormalChecks': 0, 'newVotes': 0}))
