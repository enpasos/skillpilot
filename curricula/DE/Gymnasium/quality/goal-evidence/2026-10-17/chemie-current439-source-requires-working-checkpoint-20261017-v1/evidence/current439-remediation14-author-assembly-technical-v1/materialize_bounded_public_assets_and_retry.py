from pathlib import Path
import json,hashlib,datetime,subprocess,os,time
O=Path(__file__).resolve().parent;C=O/'capsule';plan=json.loads((O/'PLAN.author14.exact-prospective-change-map.json').read_text());N=Path(plan['sourceRoot'])
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def own(p):
 assert p==C or C in p.parents
 if p==C:return
 own(p.parent)
 if p.is_symlink():
  old=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in old.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
q=json.loads((C/plan['privateReviewRootRelativePath']/'QA.four-unapproved-image-author-bindings.draft.json').read_text());qa={r['goalId']:r for r in q['records']};copies=[]
guard=json.loads((O/'INPUTS.final-actual-P4-V4-material-pins.json').read_text())['sourceGuards']
for p in guard:assert pin(p['path'])==p,p['path']
for gid in plan['goalIds']:
 r=qa[gid];p=C/r['publicAssetPath'];raw=p.read_bytes();assert 'sha256:'+hashlib.sha256(raw).hexdigest()==r['assetSha256'];before=pin(p)
 own(p.parent)
 if p.is_symlink():p.unlink()
 if not p.exists():
  with p.open('xb') as f:f.write(raw)
 else:assert p.read_bytes()==raw
 assert p.resolve().is_relative_to((C/'app/public').resolve())
 copies.append({'goalId':gid,'byteExactBeforeAndAfter':True,'before':before,'local':pin(p)})
out=O/'CHECK.only-fourteen-bound-public-assets-materialized-exact.json';assert not out.exists();out.write_text(json.dumps({'role':'Path-safety correction only; fourteen bound images remain byte-identical','copies':copies,'sourceWrites':False},indent=2)+'\n')
native=C/plan['privateReviewRootRelativePath']/'native14';assert not native.exists()
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs',str(C/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),'prepare','--config',plan['draftBatchConfigRelativePath']]
meta={'role':'Documented bounded14 retry after materializing exact public assets; first attempt failed before freeze','argv':argv,'cwd':str(C),'startedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stockPrepareInvocation':2,'firstAttemptExitCode':1,'scienceOrReviewInputChangedByRetry':False,'fullCentralBuildRun':False,'humanApproval':False};t=time.monotonic()
p=O/'EXECUTION.native14-stock-prepare-retry.started.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
with (O/'EXECUTION.native14-stock-prepare-retry.stdout.txt').open('xb') as stdout,(O/'EXECUTION.native14-stock-prepare-retry.stderr.txt').open('xb') as stderr:
 result=subprocess.run(argv,cwd=C,env=dict(os.environ,TSX_DISABLE_CACHE='1',NO_COLOR='1'),stdout=stdout,stderr=stderr,check=False)
meta.update(exitCode=result.returncode,finishedAtUTC=datetime.datetime.now(datetime.timezone.utc).isoformat(),elapsedSeconds=time.monotonic()-t)
p=O/'EXECUTION.native14-stock-prepare-retry.completed.json';assert not p.exists();p.write_text(json.dumps(meta,indent=2)+'\n')
for p in guard:assert pin(p['path'])==p,p['path']
print(json.dumps(meta));print((O/'EXECUTION.native14-stock-prepare-retry.stdout.txt').read_text()[-3000:]);print((O/'EXECUTION.native14-stock-prepare-retry.stderr.txt').read_text()[-4000:])
raise SystemExit(result.returncode)
