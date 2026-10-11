#!/usr/bin/env python3
"""Restore/audit exact regular execution inputs under a private temporary root."""
import argparse,hashlib,json,shutil
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--repository-root',required=True);parser.add_argument('--capsule-root',required=True);parser.add_argument('--audit-only',action='store_true');args=parser.parse_args()
repo=Path(args.repository_root).resolve();capsule=Path(args.capsule_root).resolve();package=Path(__file__).resolve().parent
manifest=json.loads((package/'inputs/portable-execution-aliases.neutral.json').read_text());package_path=Path(manifest['packagePath'])
assert capsule!=repo and not capsule.is_symlink() and not capsule.is_relative_to(repo/'curricula'), 'Use a separate temporary capsule root'
def digest(path):return 'sha256:'+hashlib.sha256(path.read_bytes()).hexdigest()
def safe(root,path):
 p=root/path
 assert not Path(path).is_absolute() and p.resolve().is_relative_to(root),path
 return p
if not args.audit_only:
 assert not capsule.exists(),'Restore into a new empty capsule path'
 capsule.mkdir(parents=True)
 shutil.copytree(package,safe(capsule,package_path),copy_function=shutil.copyfile)
for row in manifest['aliases']:
 target=safe(capsule,Path(row['path']))
 if args.audit_only:source=target
 elif row.get('frozenRegularCopy'):
  relative=Path(row['frozenRegularCopy']).relative_to(package_path);source=safe(package,relative)
 else:source=safe(repo,Path(row['path']))
 assert source.is_file()and not source.is_symlink()and digest(source)==row['sha256'],row['path']
 if not args.audit_only:
  target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 assert target.stat().st_nlink==1 and digest(target)==row['sha256'],row['path']
print(json.dumps({'executionAliases':len(manifest['aliases']),'missing':0,'drift':0,'symlinks':0,'hardlinks':0,'auditOnly':args.audit_only}))
