"""Pure technical scoped A/M/P integration into K; never edits frozen R14 or N."""
from pathlib import Path
import copy,datetime,hashlib,json
O=Path(__file__).resolve().parent;B=O.parent;K=O/'capsule';F=B/'current439-remediation14-author-assembly-technical-v1/capsule';N=B/'current439-AV-and-native-registry-integration-root-v1/capsule'
Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1')
CANON=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');QA=Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');LEDGER=Path('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json')
def read(p):return json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);raw=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)}
def dump(x):return (json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode()
guards={};writes=[]
def guard(p,sha=None):
 actual=pin(p)
 if sha:assert actual['sha256']==sha.removeprefix('sha256:'),str(p)
 if str(p) in guards:assert guards[str(p)]==actual
 guards[str(p)]=actual;return actual
def own(p):
 assert p==K or K in p.parents
 if p==K:return
 own(p.parent)
 if p.is_symlink():
  src=p.resolve(strict=True);p.unlink();p.mkdir()
  for child in src.iterdir():(p/child.name).symlink_to(child,target_is_directory=child.is_dir())
 elif not p.exists():p.mkdir()
 assert p.is_dir() and not p.is_symlink()
def put(p,raw):
 assert p.is_relative_to(O)
 if p.is_relative_to(K):
  own(p.parent)
  if p.is_symlink():p.unlink()
 else:p.parent.mkdir(parents=True,exist_ok=True)
 assert not p.exists() and not p.is_symlink(),str(p)
 with p.open('xb') as f:f.write(raw)
 writes.append(pin(p));return pin(p)
def rows(p):
 raw=Path(p).read_bytes().splitlines(keepends=True);return [(json.loads(line),line) for line in raw if line.strip()]
def archive_source(p,label):
 guard(p);return put(O/'source-history'/label/Path(p).name,Path(p).read_bytes())

assert K.exists() and read(O/'BOOTSTRAP.guarded-K-ready.json')['rootNative14SubtreeUnmodified']
sp=B/'current439-remediation14-author-assembly-technical-v1/SELECTOR.clean-remediation14-reviewer-inputs.sealed.json';guard(sp,'0ee1e9432d7e2e82435a9e83ce9a19e6acf1da35d98f00e4ac54403c9d43e38b');frozen=read(sp)
plan14=read(B/'current439-remediation14-author-assembly-technical-v1/PLAN.author14.exact-prospective-change-map.json');ids14=set(frozen['goalIds']);ids4=set(plan14['descriptionGoalIds'])
pp=read(B/'current439-remediation14-author-assembly-technical-v1/CHECK.actual-author14-stock-fingerprints-and-exact-profile-retention.json')
sem_rel=Path(pp['SEM650']['path']).relative_to(F);p439_rel=Path(pp['P439']['path']).relative_to(F)
for p in [F/CANON,F/LEDGER,Path(pp['SEM650']['path']),Path(pp['P439']['path']),Path(pp['QA']['path'])]:guard(p)
assert (K/CANON).read_bytes()==(F/CANON).read_bytes();assert (K/LEDGER).read_bytes()==(F/LEDGER).read_bytes()
dplan_path=N.parent/'PLAN.prospective-D111-actual-paired87-exact-owners-not-activated.json';guard(dplan_path,'18e5f3c96609966378ee4b613f2f7ace250879ca6a9c2fea8f100696fbc79bf2');dplan=read(dplan_path)
central_path=Path(dplan['prospectiveConfig']['path']);guard(central_path,dplan['prospectiveConfig']['sha256']);before=read(central_path);central=copy.deepcopy(before);subject=central['subjects'][0];assert subject['subject']=='chemie'
assert len(subject['semanticAtomicityConfigPaths'])==76 and len(subject['positiveEvidenceConfigPaths'])==112 and len(subject['resolutionIndexPaths'])==111
am_path=B/'chemie-four-description-conditions-independent-A-M-v1/SELECTOR.independent-A-M4.sealed.json';guard(am_path,'065b3d5e4667679710b7f120ff0397f1d9b0af1ff02764b1bbf6ab9ae720e385');am=read(am_path)
for item in am['artifacts']:guard(Path(item['path']),item['sha256'])
acfg=read(am['stockAConfig']);mcfg4=read(am['stockMConfig']);guard(Path(acfg['reviewPath']));guard(Path(mcfg4['reviewPath']))
a4rows=rows(acfg['reviewPath']);m4rows=rows(mcfg4['reviewPath']);assert {r['goalId'] for r,_ in a4rows}==ids4=={r['goalId'] for r,_ in m4rows}
assert all(r['reviewId']==acfg['reviewId'] for r,_ in a4rows);assert all(r['reviewId']=='canonical-chemistry-full' for r,_ in m4rows)
archive_source(am_path,'AM4-selector');archive_source(Path(acfg['reviewPath']),'actual-A4');archive_source(Path(mcfg4['reviewPath']),'actual-M4')
arows_rel=Q/'records/A4.native-independent.exact.jsonl';put(K/arows_rel,Path(acfg['reviewPath']).read_bytes())
newA=[];achanges=[];a_source_owner={}
for number,ref in enumerate(subject['semanticAtomicityConfigPaths'],1):
 cfg=read(N/ref);guard(N/ref);oldrows=rows(N/cfg['reviewPath']);guard(N/cfg['reviewPath']);scope=cfg['scope']['leafGoalIds']
 assert {r['goalId'] for r,_ in oldrows}==set(scope)
 for gid in scope:assert gid not in a_source_owner;a_source_owner[gid]=ref
 removed=[gid for gid in scope if gid in ids4]
 if not removed:newA.append(ref);continue
 archive_source(N/ref,f'A{number:03d}-config');archive_source(N/cfg['reviewPath'],f'A{number:03d}-rows')
 rest=[gid for gid in scope if gid not in ids4];successor=None
 if rest:
  out=copy.deepcopy(cfg);out['scope']['leafGoalIds']=rest;out['landscapePath']=str(CANON);out['reviewPath']=str(Q/f'records/A{number:03d}.exact-rest.jsonl')
  put(K/out['reviewPath'],b''.join(line for row,line in oldrows if row['goalId'] in set(rest)))
  successor=str(Q/f'config/A{number:03d}.same-identity-exact-rest.config.json');put(K/successor,dump(out));newA.append(successor)
 achanges.append({'sourceConfig':guard(N/ref),'removedGoalIds':removed,'retainedGoalIds':rest,'successorConfigRelativePath':successor,'oldWholeRowsPreservedInHistory':True})
assert len(a_source_owner)==439 and ids4<=set(a_source_owner)
anew=copy.deepcopy(acfg);anew['landscapePath']=str(CANON);anew['reviewPath']=str(arows_rel);anew_ref=str(Q/'config/A4.actual-independent.relative-canonical.config.json');put(K/anew_ref,dump(anew));newA.append(anew_ref)

old_mref=subject['memoryReviewConfigPath'];mcfg=read(N/old_mref);guard(N/old_mref);mrows=rows(N/mcfg['reviewPath']);guard(N/mcfg['reviewPath']);assert len(mrows)==439
for key in ['reviewPath','cardReviewPath']:
 archive_source(N/mcfg[key],f'M439-{key}')
assert len(rows(N/mcfg['cardReviewPath']))==80 and len(mcfg['visibilityScopes'])==39
for view in mcfg['visibilityScopes']:guard(N/view['viewPath'])
mmap={row['goalId']:line for row,line in m4rows};mout=b''.join(mmap.get(row['goalId'],line) for row,line in mrows)
new_mrows=Q/'records/M439.exact-other435-plus-genuine-native4.jsonl';put(K/new_mrows,mout)
mnew=copy.deepcopy(mcfg);mnew['landscapePath']=str(CANON);mnew['reviewPath']=str(new_mrows);mnew['reportPath']=str(Q/'reports/M439.stock-report.md')
mnew_ref=str(Q/'config/M439.actual-native4-other435-exact.config.json');put(K/mnew_ref,dump(mnew))
assert mnew['visibilityScopes']==mcfg['visibilityScopes'] and mnew['cardReviewPath']==mcfg['cardReviewPath']
assert all(line==dict((r['goalId'],b) for r,b in rows(K/new_mrows))[row['goalId']] for row,line in mrows if row['goalId'] not in ids4)

frozen_rows=rows(F/p439_rel);p439by={r['goalId']:(r,line) for r,line in frozen_rows};assert len(p439by)==439
newP=[];pchanges=[];powners={};old_p_cfg_by_goal={};newPcheck=[]
for number,ref in enumerate(subject['positiveEvidenceConfigPaths'],1):
 cfg=read(N/ref);guard(N/ref);oldrows=rows(N/cfg['reviewPath']);guard(N/cfg['reviewPath']);gids=cfg['scope']['goalIds'];assert {r['goalId'] for r,_ in oldrows}==set(gids)
 for gid in gids:assert gid not in powners;powners[gid]=ref;old_p_cfg_by_goal[gid]=cfg
 for r,line in oldrows:
  if r['goalId'] not in ids14:assert p439by[r['goalId']][1]==line,('Original P line mismatch',r['goalId'])
 out=copy.deepcopy(cfg);out['semanticKindLedgerPath']=str(sem_rel);out['landscapePath']=str(CANON)
 removed=[gid for gid in gids if gid in ids14];rest=[gid for gid in gids if gid not in ids14]
 if removed:
  archive_source(N/ref,f'P{number:03d}-config');archive_source(N/cfg['reviewPath'],f'P{number:03d}-rows')
  if not rest:pchanges.append({'oldConfig':guard(N/ref),'removedGoalIds':removed,'retainedGoalIds':[],'retiredEmptyScope':True});continue
  out['scope']['goalIds']=rest;out['reviewPath']=str(Q/f'records/P{number:03d}.exact-current-rest.jsonl')
  retained=[(row,line) for row,line in oldrows if row['goalId'] in set(rest)];put(K/out['reviewPath'],b''.join(line for _,line in retained))
  referenced={run for row,_ in retained for run in row['reviewRunIds']}
  paths=[]
  for run_ref in out.get('reviewRunManifestPaths',[]):
   guard(N/run_ref)
   if read(N/run_ref)['runId'] in referenced:paths.append(run_ref)
  if 'reviewRunManifestPaths' in out:out['reviewRunManifestPaths']=paths
  pchanges.append({'oldConfig':guard(N/ref),'removedGoalIds':removed,'retainedGoalIds':rest,'retiredEmptyScope':False})
 path=str(Q/f'config/P{number:03d}.original-identity-current-SEM-exact-rest.config.json');put(K/path,dump(out));newP.append(path)
 if removed:newPcheck.append(path)
assert len(powners)==439 and ids14<=set(powners)
for gid in frozen['goalIds']:
 record,line=p439by[gid];oldcfg=old_p_cfg_by_goal[gid];assert record['reviewRunIds']==[]
 assert record['goalFingerprintRuleVersion']==oldcfg['goalFingerprintRuleVersion'] and record['profileRuleVersion']==oldcfg['profileRuleVersion']
 criteria=guard(N/oldcfg['reviewCriteriaPath']);assert record['reviewCriteriaFingerprint']=='sha256:'+criteria['sha256']
 out=copy.deepcopy(oldcfg);out['reviewId']=record['reviewId'];out['scope']={'label':'Exact frozen R14 author candidate record; no new scientific approval','goalIds':[gid]};out['landscapePath']=str(CANON);out['semanticKindLedgerPath']=str(sem_rel)
 out['reviewRunManifestPaths']=[];out['reviewPath']=str(Q/f'records/P14.{gid}.frozen-whole-line.jsonl');put(K/out['reviewPath'],line)
 path=str(Q/f'config/P14.{gid}.actual-record-identity.config.json');put(K/path,dump(out));newP.append(path);newPcheck.append(path)
assert (K/p439_rel).read_bytes()==(F/p439_rel).read_bytes()

# Install genuine R14 V ledger bytes at the standard path; stock generation is a
# separate recorded step and may only refresh actual current display metadata.
put(K/QA,Path(pp['QA']['path']).read_bytes())
central['reportId']='chemie-current439-remediation14-AM-P-prospective-D111-not-activated'
subject.update(semanticKindLedgerPath=str(sem_rel),semanticAtomicityConfigPaths=newA,memoryReviewConfigPath=mnew_ref,visualizationQaPath=str(QA),positiveEvidenceConfigPaths=newP)
newcentral_rel=str(Q/'central.current439.actual-AM4-frozen-P14.D111-PROSPECTIVE-not-activated.config.json');put(K/newcentral_rel,dump(central))
for key in ['resolutionIndexPaths','resolutionSupersessions','resolutionWithdrawals','resolutionSemanticRetirements']:assert subject[key]==before['subjects'][0][key]
coverage={}
for role,paths,scopekey in [('A',newA,'leafGoalIds'),('P',newP,'goalIds')]:
 seen={};rowbytes={}
 for ref in paths:
  cfg=read(K/ref);body=rows(K/cfg['reviewPath']);gids=cfg['scope'][scopekey];assert set(gids)=={r['goalId'] for r,_ in body}
  for row,line in body:assert row['goalId'] not in seen;seen[row['goalId']]=ref;rowbytes[row['goalId']]=line
 assert len(seen)==439
 if role=='P':assert all(rowbytes[gid]==line for gid,(r,line) in p439by.items())
 coverage[role]={'configCount':len(paths),'recordCount':len(seen),'exactlyOneOwnerPerGoal':True}
for path,expected in guards.items():assert pin(path)==expected,path
checks={'A':{'changedConfigPaths':[c['successorConfigRelativePath'] for c in achanges if c['successorConfigRelativePath']]+[anew_ref]},'M':{'configPath':mnew_ref},'P':{'allConfigPaths':newP,'changedConfigPaths':newPcheck}}
handoff={'role':'Technical current A/M/P owner integration, with D111 preserved prospective and material findings still open','atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'K':str(K),'sourceFrozenR14':str(F),'newCentralConfigRelativePath':newcentral_rel,'newCentralConfig':pin(K/newcentral_rel),'prospectiveSourceConfig':guard(central_path),
 'sourceGuards':list(guards.values()),'coverage':coverage,'Mcoverage':{'wholeRecords':439,'originalWholeLinesRetained':435,'actualIndependentRowsReplaced':4,'cards80Unchanged':guard(N/mcfg['cardReviewPath']),'visibilityScopes39Unchanged':mcfg['visibilityScopes']},
 'Achanges':achanges,'Pchanges':pchanges,'P14WholeRecordMetadataExact':True,'P425WholeOriginalLinesExact':True,'P439AggregateUnchanged':pin(K/p439_rel),'SEM650UnchangedFromR14':pin(K/sem_rel),
 'QAStandardBeforeStockRefresh':pin(K/QA),'sourceVQADraft':pp['QA'],'stockChecksToRun':checks,'privateWrites':writes,
 'D111Status':'PROSPECTIVE; no whole-chain validation or activation asserted','nativeD14TouchedByThisScript':False,
 'openMaterialGoalIds':['f85b4651-50ea-5b42-b193-3465c05257a7','b8d3b453-d638-5518-aab0-d84ec2e8567c','188bd684-e894-5753-8a50-798220b04d97','28c90c6a-3020-5c51-ac40-d802f3f12d2d'],
 'newScienceDecisions':False,'humanApproval':False,'activation':False,'fullCentralRun':False}
put(O/'HANDOFF.exact-current-AM-P-prospective-integration.json',dump(handoff))
print(json.dumps({'centralConfigRelativePath':newcentral_rel,'coverage':coverage,'Mcoverage':[439,435,4,80,39],'Aaffected':len(achanges),'Paffected':len(pchanges),'sourceGuardCount':len(guards),'changedChecks':{'A':len(checks['A']['changedConfigPaths']),'P':len(newPcheck)},'handoff':pin(O/'HANDOFF.exact-current-AM-P-prospective-integration.json')}))
