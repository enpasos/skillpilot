# SPDX-License-Identifier: Apache-2.0
"""Recreate exact physical files in a fresh tmp host, without votes or checker reruns."""
import hashlib,json,shutil,sys
from pathlib import Path
repo=Path.cwd(); own=Path(__file__).resolve().parents[1]
m=json.loads((own/'checks/REBUILD.two-V2.minimal-physical-host.json').read_text())
host=repo/sys.argv[1];assert host.is_relative_to(repo/'tmp') and not host.exists()
rows=[{'normalAlias':x['path'],'physical':x} for x in m['stockPhysicalModules']]+m['dataAndAssetAliases']
for r in rows:
 p=repo/r['physical']['path'];b=p.read_bytes();assert len(b)==r['physical']['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==r['physical']['sha256']
for r in rows:
 p=host/r['normalAlias'];p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(repo/r['physical']['path'],p)
(host/'app/node_modules').symlink_to(repo/'app/node_modules',target_is_directory=True)
print(json.dumps({'freshHost':str(host.relative_to(repo)),'physicalFiles':len(rows),'newVotes':0,'normalReruns':0}))
