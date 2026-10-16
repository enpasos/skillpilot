# SPDX-License-Identifier: Apache-2.0
"""Exactly one final stock Prepare/Check, after final real image/QA and input diff."""
import datetime,hashlib,json,shutil,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(REPO).as_posix()
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'native-four').exists() and not (OWN/'checks/NATIVE4.exactly-one.started-marker.json').exists()
plan=load(OWN/'checks/INPUTS.no-render-stock-context.final-QA-ready.plan.technical.json');assert plan['finalQAReady']
assert load(OWN/'checks/DIAGNOSTIC.final-a142-QA-ready.command.actual.json')['exitCode']==0
diff=load(OWN/'checks/DIFF.actual-stock422-goal-page-contexts.no-render.json');assert diff['comparedActualStockPages']==422 and set(diff['actualCanonicalOrRequiredBindingChangedGoalIds'])==set(plan['descriptionChangeGoalIds'])
ps=load(OWN/'checks/DIFF.actual-all392-selected-P-binding-scope-preservation.no-new-review.json');assert ps['oldSelectedRows']==392 and ps['allOriginalBindingsExact'] and set(ps['changedGoalIds'])==set(plan['descriptionChangeGoalIds'])
sourceSeal=load(OWN/'FILES.finite-preliminary-source-only-four.complete-union-partners-v2.seal.json')
for r in sourceSeal['files']+sourceSeal['externalWholePrimaryPageTexts']:verify(r)
base=load(verify(plan['base367Selector']))
for r in load(verify(plan['base367Seal']))['files']:verify(r)
baseline=Path(base['actualPostCentralPreservation']['path']).parent.parent
protected=load(baseline/'checks/PROTECTED697.actual-phase1-before.json')
for r in protected['files']:verify(r)
raw=OWN/'profiles/four-current-raw-E0G0.stock-bound.neutral.jsonl';rr=[json.loads(l) for l in raw.read_text().splitlines()]
assert len(rr)==4 and {r['goalId'] for r in rr}==set(plan['targetGoalIds']) and all(r['evidenceLevel']=='E0' and r['maximumClaimScope']=='G0' and r['reviewRunIds']==[] for r in rr)
mpath=Path(base['finalExactRebuildMap']['path']);oldmap=load(mpath)
host=REPO/'tmp/chemie-m7-resumed-20261015/equilibrium-source4-final-native4-host-v1';assert not host.exists()
aliases=[{'normalHostAlias':'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','physicalRepositorySource':plan['canonical']},{'normalHostAlias':'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','physicalRepositorySource':plan['semantic']},{'normalHostAlias':'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','physicalRepositorySource':plan['finalQA']}]
assets=[]
for r in plan['assets']:
 q=dict(r);q['publicMustBePhysicalWithinHostPublicRoot']=r['goalId'] in plan['targetGoalIds'];q['publicMaterialization']='physical selected raster required by unmodified renderer' if q['publicMustBePhysicalWithinHostPublicRoot'] else 'exact immutable original reference; no image copy';assets.append(q)
mp={'schemaVersion':1,'role':'Final normal Native4 technical host; source/course sidecars remain external unreviewed reading inputs','executionHost':host.relative_to(REPO).as_posix(),'canonical':plan['canonical'],'semantic':plan['semantic'],'finalQA':plan['finalQA'],'aliases':aliases,'stockPhysicalModules':plan['stockPhysicalModules'],'selectedCurrentAssetRows':assets,'legacyQaDispositionDiscoveryInput':oldmap['legacyQaDispositionDiscoveryInput'],'rawFourProfiles':ref(raw),'nativeConfig':ref(OWN/'config/native4.final-once.normal-prepare.config.json'),'sourceSidecarsEffectiveInStockDInput':False,'sourceOrCourseOrSourceAtlasRegistrationApplied':False,'physicalPublicImages':4,'physicalPublicImageBytes':sum(r['physicalRepositorySource']['bytes'] for r in assets if r['publicMustBePhysicalWithinHostPublicRoot']),'other431ImagesAreReferencesOnly':True,'centralRuns':0,'newScienceVotes':0}
put(OWN/'checks/REBUILD.final-native4.minimal-exact-physical-map.json',mp)
host.mkdir(parents=True)
for p in REPO.iterdir():
 if p.name not in ['app','tmp','.git']:(host/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app').mkdir()
for p in (REPO/'app').iterdir():
 if p.name not in ['scripts','public']:(host/'app'/p.name).symlink_to(p,target_is_directory=p.is_dir())
(host/'app/scripts').mkdir();(host/'app/public').mkdir()
def branch(p):
 if p.is_symlink():
  children=list(p.resolve().iterdir());p.unlink();p.mkdir()
  for c in children:(p/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not p.exists():p.mkdir()
def install(src,relative,physical=False):
 p=host/relative;parent=host
 for s in p.relative_to(host).parts[:-1]:parent/=s;branch(parent)
 if p.is_symlink() or p.is_file():p.unlink()
 if physical:shutil.copyfile(src,p)
 else:p.symlink_to(src)
for r in mp['stockPhysicalModules']:install(verify(r),r['path'],True)
for r in aliases:install(verify(r['physicalRepositorySource']),r['normalHostAlias'],True)
for r in assets:
 src=verify(r['physicalRepositorySource']);install(src,r['normalPublicDestination'],r['publicMustBePhysicalWithinHostPublicRoot'])
 if r['goalId'] in plan['targetGoalIds']:install(src,r['normalCanonicalDestination'])
review=host/'curricula/DE/Gymnasium/quality/goal-visualization-review';assert review.is_symlink();review.unlink();review.mkdir();legacy=load(verify(mp['legacyQaDispositionDiscoveryInput']));assert legacy['selectedChemistryLegacyMarkdownCount']==0 and legacy['rows']==[]
regular=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink())
put(OWN/'checks/HOST.actual-final-native4-minimal-materialization.json',{'host':mp['executionHost'],'regularBytes':regular,'stockPhysicalModules':len(mp['stockPhysicalModules']),'physicalJsonAliases':len(aliases),'physicalRasterCopies':4,'physicalRasterBytes':mp['physicalPublicImageBytes'],'other431RasterBodiesReferenced':True,'exactLegacySelectedMarkdownCount':0,'rootPublicOrCanonicalOrOldHostWrites':0})
cfg=REL+'/config/native4.final-once.normal-prepare.config.json'
put(OWN/'checks/NATIVE4.exactly-one.started-marker.json',{'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'config':mp['nativeConfig'],'map':ref(OWN/'checks/REBUILD.final-native4.minimal-exact-physical-map.json'),'maximumPrepareRuns':1,'maximumCheckRuns':1,'noWriteFlag':True})
for mode in ['prepare','check']:
 argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),mode,'--config',cfg]
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic();p=subprocess.run(argv,cwd=host,capture_output=True)
 out=OWN/'checks'/f'NATIVE4.{mode}.stdout.actual.txt';err=OWN/'checks'/f'NATIVE4.{mode}.stderr.actual.txt';out.write_bytes(p.stdout);err.write_bytes(p.stderr)
 put(OWN/'checks'/f'NATIVE4.{mode}.command.actual.json',{'role':'Actual unchanged stock Native4 technical command','argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'actualRunNumberForThisMode':1,'newScienceVotes':0,'centralRuns':0})
 print(json.dumps({'mode':mode,'exitCode':p.returncode,'elapsedSeconds':round(time.monotonic()-t,3)}),flush=True)
 if p.returncode:raise SystemExit(p.stderr.decode()+p.stdout.decode())
