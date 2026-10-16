"""Read sealed repo inputs and run normal check in a small private host.

No dependency on an earlier tmp host, no rendering, no writes to evidence roots.
"""
from pathlib import Path
import argparse,hashlib,json,shutil,subprocess,uuid

def main():
 repo=next(p for p in Path(__file__).resolve().parents if (p/'AGENTS.md').is_file() and (p/'app').is_dir())
 own=Path(__file__).resolve().parents[1]
 data=json.loads((own/'checks/REBUILD.portable-check-only.physical-source-alias-map.json').read_text())
 parser=argparse.ArgumentParser();parser.add_argument('--host',type=Path,default=repo/'tmp'/('chemie-paired11-portable-'+str(uuid.uuid4())))
 args=parser.parse_args();host=args.host.resolve()
 assert host.is_relative_to(repo/'tmp') and not host.exists()
 def verified(row):
  source=repo/row['path'];b=source.read_bytes()
  assert len(b)==row['bytes'] and 'sha256:'+hashlib.sha256(b).hexdigest()==row['sha256'],source
  return source
 for row in data['aliases']:verified(row['physicalRepositorySource'])
 for row in data['selectedCurrentAssetRows']:verified(row['physicalRepositorySource'])
 for row in data['stockPhysicalModules']:verified(row)
 host.mkdir(parents=True)
 for p in repo.iterdir():
  if p.name not in ['app','tmp','.git']:(host/p.name).symlink_to(p,target_is_directory=p.is_dir())
 (host/'app').mkdir()
 for p in (repo/'app').iterdir():
  if p.name not in ['scripts','public']:(host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
 (host/'app/scripts').mkdir();(host/'app/public').mkdir()
 def branch(p):
  if p.is_symlink():
   children=list(p.resolve().iterdir());p.unlink();p.mkdir()
   for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
  elif not p.exists():p.mkdir()
 def install(source,relative,physical):
  target=host/relative;parent=host
  for part in Path(relative).parts[:-1]:parent/=part;branch(parent)
  if target.exists() or target.is_symlink():target.unlink()
  if physical:shutil.copyfile(source,target)
  else:target.symlink_to(source,target_is_directory=source.is_dir())
 for row in data['stockPhysicalModules']:install(verified(row),row['path'],True)
 for row in data['aliases']:install(verified(row['physicalRepositorySource']),row['normalHostAlias'],True)
 for row in data['selectedCurrentAssetRows']:
  source=verified(row['physicalRepositorySource'])
  install(source,row['normalCanonicalDestination'],False)
  install(source,row['normalPublicDestination'],False)
 # Exact historical empty discovery remains an input; no source history is deleted.
 disposition=json.loads(verified(data['legacyQaDispositionDiscoveryInput']).read_text())
 assert disposition['selectedChemistryLegacyMarkdownCount']==0 and disposition['rows']==[]
 review=host/'curricula/DE/Gymnasium/quality/goal-visualization-review';parent=host
 for part in review.relative_to(host).parts[:-1]:parent/=part;branch(parent)
 if review.is_symlink():review.unlink();review.mkdir()
 else:assert not list(review.iterdir())
 install(repo/data['ownRoot'],data['ownRoot'],False)
 size=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink())
 assert size<data['maximumRegularHostBytes']
 command=[str(repo/'app/node_modules/.bin/tsx'),str(host/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'check','--config',data['normalPairedConfig']]
 subprocess.run(command,cwd=host,check=True)
 print(json.dumps({'host':str(host.relative_to(repo)),'regularHostBytes':size,'normalCheckExitCode':0,'earlierTmpHostDependency':False,'fullTreeCopies':0,'rendering':False}))

if __name__=='__main__':main()
