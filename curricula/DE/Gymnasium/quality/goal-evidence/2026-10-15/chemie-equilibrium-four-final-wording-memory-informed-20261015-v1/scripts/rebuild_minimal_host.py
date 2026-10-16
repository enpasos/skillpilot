# SPDX-License-Identifier: Apache-2.0
"""Rebuild exact private capsule only; no review, normal check or scientific vote."""
from pathlib import Path
import hashlib,json,shutil,sys
repo=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file())
own=Path(__file__).resolve().parents[1]
m=json.loads((own/'checks/REBUILD.four-M-final.minimal-host.json').read_text())
host=(repo/sys.argv[1]).resolve();assert host.is_relative_to(repo/'tmp') and not host.exists()
for row in m['sourceMap']+m.get('imageAliases',[]):
 r=row['physicalRepositorySource'];p=repo/r['path'];b=p.read_bytes()
 assert len(b)==r['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==r['sha256'],p
for row in m['sourceMap']:
 target=host/row['normalHostAlias'];target.parent.mkdir(parents=True,exist_ok=True)
 shutil.copyfile(repo/row['physicalRepositorySource']['path'],target)
for row in m.get('imageAliases',[]):
 target=host/row['normalHostAlias'];target.parent.mkdir(parents=True,exist_ok=True)
 target.symlink_to(repo/row['physicalRepositorySource']['path'])
(host/'app/node_modules').symlink_to(repo/'app/node_modules',target_is_directory=True)
print(json.dumps({'host':str(host.relative_to(repo)),'regularFiles':len(m['sourceMap']),'imageCopies':0,'normalOrCentralChecksExecuted':0,'newVotes':0}))
