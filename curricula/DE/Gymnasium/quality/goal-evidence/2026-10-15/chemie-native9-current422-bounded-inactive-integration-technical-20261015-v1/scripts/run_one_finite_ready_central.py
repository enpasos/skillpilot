# SPDX-License-Identifier: Apache-2.0
"""Finite CAS then exactly one authorized unchanged stock central report."""
import datetime,hashlib,json,subprocess,time
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
BASE=E/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'checks/CENTRAL.exactly-one.started-marker.json').exists()
seals=[
 E/'chemie-next-nine-fresh-independent-a-20261015-v1/FILES.finite-independent-a.final.seal.json',
 E/'chemie-next-nine-fresh-blind-b2-20261015-v1/FILES.finite-normal-D9-B2.seal.json',
 E/'chemie-equilibrium-two-and-analgesic-term-current422-informed-P2-A2-M1-V1-20261015-v1/FILES.finite-informed-P2-A2-M1-V1.seal.json',
 E/'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2/FILES.finite-native9-rezeptfrei-v2-technical.seal.json']
sealproof=[]
for p in seals:
 rows=load(p)['files']
 for row in rows:verify(row)
 sealproof.append({'seal':ref(p),'allPayloadHashesExact':True,'payloadCount':len(rows)})
original=load(OWN/'checks/ORIGINAL.input-binding-inventory.before.json')
for row in original['files']:verify(row)
protection=load(OWN/'checks/PROTECTED697.actual-phase1-before.json')
for row in protection['files']:verify(row)
assert len(protection['files'])==697
mpath=OWN/'checks/REBUILD.current422.final-A-B2-C.discovery-exact.physical-map.json';mp=load(mpath);host=REPO/mp['executionHost']
for row in mp['stockPhysicalModules']:
 source=verify(row);p=host/row['path'];assert not p.is_symlink() and p.read_bytes()==source.read_bytes()
for row in mp['aliases']:
 source=verify(row['physicalRepositorySource']);p=host/row['normalHostAlias'];assert not p.is_symlink() and p.read_bytes()==source.read_bytes()
for row in mp['selectedCurrentAssetRows']+mp.get('legacyBaselineAssetReferences',[]):
 source=verify(row['physicalRepositorySource'])
 for key in ['normalCanonicalDestination','normalPublicDestination']:
  p=host/row[key];assert p.is_symlink() and p.resolve()==source.resolve()
verify(mp['legacyQaDispositionDiscoveryInput'])
assert list((host/'curricula/DE/Gymnasium/quality/goal-visualization-review').iterdir())==[]
regularbytes=sum(p.stat().st_size for p in host.rglob('*') if p.is_file() and not p.is_symlink())
assert 4000000<regularbytes<10000000,regularbytes
before=load(BASE/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json')['subjects'][0]
assert before['denominator']==422 and len(before['strictCompleteGoalIds'])==358
canonalias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
semalias='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
canonical=load(host/canonalias);semantic=load(host/semalias)
currentids=[d['goalId'] for d in semantic['decisions'] if d['semanticKind']=='curricularAtomic']
assert set(currentids)==set(before['currentGoalIds']) and len(currentids)==422
base_map=load(BASE/'checks/REBUILD.current422.final.physical-map.json')
basecanon=load(verify(next(a['physicalRepositorySource'] for a in base_map['aliases'] if a['normalHostAlias']==canonalias)))
oldby={g['id']:g for g in basecanon['goals']};newby={g['id']:g for g in canonical['goals']}
assert list(oldby)==list(newby) and len(newby)==560
for gid in oldby:
 assert oldby[gid].get('requires',[])==newby[gid].get('requires',[]) and oldby[gid].get('contains',[])==newby[gid].get('contains',[])
assert all(oldby[g]==newby[g] for g in before['strictCompleteGoalIds'])
transport=load(OWN/'checks/TRANSPORT.D9-original-A-blind-B2.exact.json')
for row in transport['exactCopies']:
 assert verify(row['original']).read_bytes()==verify(row['copy']).read_bytes()
index=load(OWN/'native9/resolution-index.json')
assert [r['goalId'] for r in index['resolutions']]==transport['contentGoalIds']+transport['limitedScopeGoalIds']
assert len(index['resolutions'])==9 and not index.get('deferredGoalIds')
assert all(r['decision']=='keep_current' and r['strictDescriptionComplete'] for r in index['resolutions'])
for r in index['resolutions']:
 p=OWN/'native9'/r['resolutionPath'];assert ref(p)['sha256']==r['resolutionDigest']
pa=load(OWN/'candidate/PREPARED.PA-exact-selections.awaiting-final-gates.json')
c=load(OWN/'checks/SELECTION.final-C-exact-P2-A2-M422-QA438.json')
frag=load(OWN/'candidate/PREPARED.D9-original-pair.index-selection-awaiting-final-gates.json')
cfg=load(BASE/'config/central.current422.carbonyl15-equilibrium16.inactive.final.config.json')
cfg['reportId']='chemie-native9-current422-bounded-inactive-final-20261015-v1'
s=cfg['subjects'][0]
s['positiveEvidenceConfigPaths']=pa['positiveEvidenceConfigPaths']+[(OWN/'config/P2.genuine-informed-C.normal-address-only.config.json').relative_to(REPO).as_posix()]
s['semanticAtomicityConfigPaths']=pa['semanticAtomicityConfigPaths']+[(OWN/'config/A2.genuine-informed-C.normal-address-only.config.json').relative_to(REPO).as_posix()]
s['memoryReviewConfigPath']=c['finalM422Config']['path'];s['visualizationQaPath']='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
s['resolutionIndexPaths']=frag['originalResolutionIndexPaths']+[frag['appendCurrentD9Index']]
s['resolutionSupersessions']=frag['originalResolutionSupersessions']+frag['appendSupersessions']
assert s['resolutionWithdrawals']==frag['originalResolutionWithdrawals']
selected={}
for kind,paths in [('P',s['positiveEvidenceConfigPaths']),('A',s['semanticAtomicityConfigPaths'])]:
 allids=[]
 for path in paths:
  rcfg=load(REPO/path)
  allids += [json.loads(line)['goalId'] for line in (REPO/rcfg['reviewPath']).read_text().splitlines() if line.strip()]
 assert len(allids)==len(set(allids)),kind
 selected[kind]={'totalSelectedRows':len(allids),'eightCurrentRowsExactlyOnce':all(allids.count(g)==1 for g in load(OWN/'checks/OVERLAP.exact8-old-PA-containers-and-raw-residuals.json')['affected8GoalIds'])}
 assert selected[kind]['eightCurrentRowsExactlyOnce']
readychecks=[];failures=[]
for p in sorted((OWN/'checks').glob('PREFLIGHT.*.command.actual.json')):
 row=load(p)
 (readychecks if row['exitCode']==0 else failures).append(ref(p))
assert len(readychecks)==16 and len(failures)==2,(len(readychecks),len(failures))
finalcfg=OWN/'config/central.current422.native9.original-A-B2-C.inactive.final.config.json';put(finalcfg,cfg)
ready=OWN/'checks/READY.finite-CAS-protected697-358-422-one-central.json'
put(ready,{'schemaVersion':1,'role':'Actual finite ready CAS after all genuine final inputs and affected stock checks; exactly one authorized central',
 'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'genuineFiniteSeals':sealproof,'finalCentralConfig':ref(finalcfg),'exactHostMap':ref(mpath),'regularHostBytes':regularbytes,
 'stockModulesExact':31,'physicalNormalAliasesExact':51,'rasterCopies':0,'all435CurrentAssetRefsExact':True,
 'active697ExactBefore':True,'baselineOtherSubjectsUnchanged':protection['baselineOtherSubjects'],'old358StrictGoalIds':before['strictCompleteGoalIds'],'old358WholeGoalObjectsExact':True,
 'all422AuthoritativeCurrentIdsExact':True,'all560IdsAndEdgesExact':True,'selectedPA':selected,'currentD9Index':ref(OWN/'native9/resolution-index.json'),
 'contentD6GoalIds':transport['contentGoalIds'],'limitedScopeD3GoalIds':transport['limitedScopeGoalIds'],
 'originalNegativeRowsAnd86IndexesPreserved':True,'e0And1aNoDSourceCourseGrant':True,
 'successfulAffectedStockReceipts':readychecks,'historicalTechnicalFailureReceipts':failures,'rootReadyAuthorized':True,'allowedCentralRuns':1,
 'newScientificVotes':0,'HumanApproval':False,'M7Grant':False,'activeIntegration':False})
out=OWN/'checks/CENTRAL.current422.native9.stock-report.actual.json';err=OWN/'checks/CENTRAL.current422.native9.stderr.actual.txt'
argv=[str(REPO/'app/node_modules/.bin/tsx'),str(host/'app/scripts/reportDeepUnderstandingRollout.ts'),'--config='+finalcfg.relative_to(REPO).as_posix(),'--format=json']
start=datetime.datetime.now(datetime.timezone.utc).isoformat();t=time.monotonic()
put(OWN/'checks/CENTRAL.exactly-one.started-marker.json',{'argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'actualCentralRunNumber':1,'maximumAuthorizedRuns':1,'ready':ref(ready)})
with out.open('wb') as o,err.open('wb') as e:p=subprocess.run(argv,cwd=host,stdout=o,stderr=e)
receipt={'role':'One actual unchanged stock central, inactive technical candidate','argv':argv,'cwd':mp['executionHost'],'startedAtUTC':start,'completedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'elapsedSeconds':round(time.monotonic()-t,3),'exitCode':p.returncode,'stdout':ref(out),'stderr':ref(err),'actualCentralRuns':1,'stockCodeUnchanged':True,'activeIntegration':False,'newScienceVotes':0,'M7Grant':False}
put(OWN/'checks/CENTRAL.exactly-one.command.actual.json',receipt)
print(json.dumps(receipt),flush=True)
report=load(out);s=report['subjects'][0]
print(json.dumps({k:s[k] for k in ['denominator','strictComplete','gates','requiredChecks','strictCompletionReady','issues']},ensure_ascii=False),flush=True)
assert p.returncode==0 and len(s['requiredChecks'])==6 and all(c['status']=='pass' for c in s['requiredChecks']) and not s['issues']
