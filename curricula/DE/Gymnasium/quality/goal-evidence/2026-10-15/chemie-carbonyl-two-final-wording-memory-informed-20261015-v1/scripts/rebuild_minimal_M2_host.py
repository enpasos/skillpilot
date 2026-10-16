# SPDX-License-Identifier: Apache-2.0
"""Recreate only exact final sparse files; no votes or normal reruns."""
import hashlib,json,shutil,sys
from pathlib import Path
repo=Path.cwd();own=Path(__file__).resolve().parents[1];m=json.loads((own/'checks/REBUILD.two-M-final.minimal-host.json').read_text());host=repo/sys.argv[1]
assert host.is_relative_to(repo/'tmp') and not host.exists()
for r in m['sourceMap']:
 p=repo/r['physicalRepositorySource']['path'];b=p.read_bytes();assert len(b)==r['physicalRepositorySource']['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==r['physicalRepositorySource']['sha256']
for r in m['sourceMap']:
 p=host/r['normalHostAlias'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(repo/r['physicalRepositorySource']['path'],p)
(host/'app/node_modules').symlink_to(repo/'app/node_modules',target_is_directory=True)
print(json.dumps({'freshHost':str(host.relative_to(repo)),'physicalFiles':len(m['sourceMap']),'newVotes':0,'normalReruns':0}))
