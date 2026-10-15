# SPDX-License-Identifier: Apache-2.0
"""Exact bounded inactive selections only; D4 pairing waits for genuine B and ROOTREADY."""
import datetime,hashlib,json,shutil
from pathlib import Path
REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1];E=OWN.parent
BASE=E/'chemie-native9-current422-bounded-inactive-integration-technical-20261015-v1'
NATIVE=E/'chemie-equilibrium-four-source-scope-native-preparation-inactive-technical-20261015-v1'
C=E/'chemie-equilibrium-kpkc-pourbaix-two-wording-current422-informed-P2-A2-M2-V2-20261015-v1'
A=E/'chemie-equilibrium-four-source-scope-fresh-independent-a-20261015-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(REPO).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):
 p=REPO/r['path'];a=ref(p);assert a['sha256']==r['sha256'] and ('bytes' not in r or a['bytes']==r['bytes']),p;return p
def put(p,v):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
assert not (OWN/'checks/PHASE1.exact-selection-and-raw-preservation.json').exists()
for d in ['checks','candidate','records','config','scripts']:(OWN/d).mkdir(exist_ok=True)
bs=BASE/'OUTPUTS.finite-native9-current422-inactive-integration.final-selector.json';b=load(bs)
oldseal=BASE/'FILES.finite-native9-current422-inactive-integration.seal.json';assert ref(oldseal)['sha256']=='sha256:fbda427e6c4b4f15b807890a9a1207e867634434a69e103a714e66fdabb8222e'
oldrows=load(oldseal)['files'];assert len(oldrows)==142
for r in oldrows:verify(r)
protected=load(BASE/'checks/PROTECTED697.actual-phase1-before.json')
for r in protected['files']:verify(r)
put(OWN/'checks/PROTECTED697.actual-before-phase1.json',{'role':'Actual original697 before bounded inactive preparation','sourceSnapshot':ref(BASE/'checks/PROTECTED697.actual-phase1-before.json'),'files':protected['files'],'all697ActualBytesExact':True,'baselineOtherSubjects':protected['baselineOtherSubjects'],'activeWrites':0})
cs=C/'SELECTION.final-current-Kp-Pourbaix-informed-P2-A2-M2-V2.json';assert ref(cs)['sha256']=='sha256:3a9a99865399b1d5ba938b0cd8f0188a5d0ec0093435f68972fdc3350fb17397'
c=load(cs);cseal=REPO/c['finalSealPath'];assert ref(cseal)['sha256']=='sha256:a9a49247611c57f632f143ac1f2a860017411d9cc7420bfea52165e37cf7e144'
for r in load(cseal)['files']:verify(r)
asel=A/'FINAL.selector.json';aseal=A/'FINAL.seal.json';assert ref(aseal)['sha256']=='sha256:a8e4503c0f061991360dad533054be2782129abcc9bc2455c63c7531613d26c4'
for r in load(aseal)['files']:verify(r)
a=load(asel)
nativeSelector=NATIVE/'INPUTS.blind-native4-final-whole-scientific-sources-and-pages.selector.json';assert ref(nativeSelector)['sha256']=='sha256:c00eed0f5cffd711903892f8165a005f5c88557fc73cf79c192f9b8242d371a7'
n=load(nativeSelector);ids=n['goalIds'];replace=set(c['goalIds']);assert len(ids)==4 and len(replace)==2 and replace<set(ids)
assert a['finalCombinedNeutralScientificSelector']==ref(nativeSelector)
oldcfg=load(verify(b['actualCentralConfig']));subject=oldcfg['subjects'][0]
originalPins=[ref(bs),ref(oldseal),b['actualCentralConfig'],b['actualCentralReport'],b['finalExactRebuildMap'],ref(cs),ref(cseal),ref(asel),ref(aseal),ref(nativeSelector)]
prepared={};overlap=[];preservedcounts={};selectedUnique={}
for kind,key in [('P','positiveEvidenceConfigPaths'),('A','semanticAtomicityConfigPaths')]:
 paths=[];beforeAll=[];afterAll=[];affectedContainers=[]
 for ordinal,cp in enumerate(subject[key]):
  p=REPO/cp;cfg=load(p);rp=REPO/cfg['reviewPath'];lines=rp.read_bytes().splitlines(keepends=True);rows=[json.loads(l) for l in lines if l.strip()];beforeAll+=rows
  originalPins.extend([ref(p),ref(rp)])
  if kind=='P':originalPins.extend(ref(REPO/p) for p in cfg.get('reviewRunManifestPaths',[]))
  hits=[r['goalId'] for r in rows if r['goalId'] in replace]
  if not hits:paths.append(cp);afterAll+=rows;continue
  remaining=[line for line in lines if json.loads(line)['goalId'] not in replace];retained=[json.loads(l) for l in remaining]
  out=OWN/'records'/f'{kind}-old-residual-{ordinal:02d}.whole-lines.exact.jsonl';assert not out.exists();out.write_bytes(b''.join(remaining))
  newcfg=json.loads(json.dumps(cfg));newcfg['reviewPath']=ref(out)['path'];scopekey='goalIds' if kind=='P' else 'leafGoalIds'
  newcfg['scope']={**cfg['scope'],scopekey:[r['goalId'] for r in retained]}
  if kind=='A':
   for incompatible in ['goalIds','rootGoalIds']:newcfg['scope'].pop(incompatible,None)
  outcfg=OWN/'config'/f'{kind}-old-residual-{ordinal:02d}.normal.config.json';put(outcfg,newcfg);paths.append(ref(outcfg)['path']);afterAll+=retained
  affectedContainers.append({'ordinal':ordinal,'originalConfig':ref(p),'originalRecords':ref(rp),'removedGoalIds':hits,'originalRows':len(rows),'retainedWholeRawLines':len(retained),'residualConfig':ref(outcfg),'residualRecords':ref(out),'allRetainedRawLinesExact':True,'originalResourceScopesAndRunBindingsExact':True})
 assert len(affectedContainers)==1 and set(affectedContainers[0]['removedGoalIds'])==replace
 src=verify(c[kind+'2']['records']);cfg=load(verify(c[kind+'2']['config']));dst=OWN/'records'/f'{kind}2.genuine-informed-C.whole-records.exact.jsonl';assert not dst.exists();shutil.copyfile(src,dst);assert src.read_bytes()==dst.read_bytes()
 cfg['landscapePath']='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
 if kind=='P':cfg['semanticKindLedgerPath']='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
 cfg['reviewPath']=ref(dst)['path'];outcfg=OWN/'config'/f'{kind}2.genuine-informed-C.normal-address-only.config.json';put(outcfg,cfg);paths.append(ref(outcfg)['path'])
 if kind=='P':
  originalRun=verify(c['P2']['runManifest']);assert cfg['reviewRunManifestPaths']==load(verify(c['P2']['config']))['reviewRunManifestPaths'] and ref(src)['sha256']==c['P2']['records']['sha256']
 originalPins.extend([c[kind+'2']['records'],c[kind+'2']['config']])
 selected=[json.loads(l) for l in dst.read_text().splitlines() if l.strip()];assert {r['goalId'] for r in selected}==replace;afterAll+=selected
 beforeBy={r['goalId']:r for r in beforeAll};afterBy={r['goalId']:r for r in afterAll};assert len(beforeBy)==len(beforeAll) and len(afterBy)==len(afterAll) and beforeBy.keys()==afterBy.keys()
 assert all(beforeBy[g]==afterBy[g] for g in beforeBy if g not in replace)
 prepared[key]=paths;overlap+=affectedContainers;preservedcounts[kind]={'totalRowsBefore':len(beforeAll),'totalRowsPrepared':len(afterAll),'oldRowsReplacedExactly':2,'otherWholeRecordObjectsExact':len(beforeAll)-2}
 selectedUnique[kind]={'noDuplicateGoalIds':True,'sameSelectedGoalIds':True,'fourSourceTargetRows':[{ 'goalId':g,'count':sum(r['goalId']==g for r in afterAll),'changedScientificBinding':g in replace} for g in ids]}
oldmap=load(verify(b['finalExactRebuildMap']));aliases=[]
for r in oldmap['aliases']:
 q=json.loads(json.dumps(r));path=q['normalHostAlias']
 if path.endswith('DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'):q['physicalRepositorySource']=c['finalCanonical']
 if path.endswith('chemie.semantic-kinds.json'):q['physicalRepositorySource']=c['finalSemanticSourceIdentities']
 if path.endswith('chemie.qa.json'):q['physicalRepositorySource']=c['V2']['wholeQA438Candidate']
 q['physicalWithinHost']=path.endswith(('DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','chemie.semantic-kinds.json','chemie.qa.json'));aliases.append(q)
assets=load(NATIVE/'checks/REBUILD.final-native4.minimal-exact-physical-map.json')['selectedCurrentAssetRows']
for r in assets:r['publicMustBePhysicalWithinHostPublicRoot']=False;r['publicMaterialization']='Exact immutable source reference; no renderer in integration host'
mp={'schemaVersion':1,'role':'Phase1 bounded inactive source4 current alias template; no rendering or science votes','executionHost':'tmp/chemie-m7-resumed-20261015/source4-current422-inactive-integration-check-only-host-v1','canonical':c['finalCanonical'],'semantic':c['finalSemanticSourceIdentities'],'finalQA':c['V2']['wholeQA438Candidate'],'finalMemory422Config':c['M2']['whole422TenViewsConfig'],'finalMemory422Records':c['M2']['whole422Records'],'aliases':aliases,'stockPhysicalModules':oldmap['stockPhysicalModules'],'selectedCurrentAssetRows':assets,'legacyBaselineAssetReferences':oldmap.get('legacyBaselineAssetReferences',[]),'legacyQaDispositionDiscoveryInput':oldmap['legacyQaDispositionDiscoveryInput'],'physicalRasterCopies':0,'maximumPhysicalRegularHostBytes':6500000,'ROOTREADY':False,'centralAllowed':False,'nativeBuilds':0,'newScienceVotes':0}
put(OWN/'checks/REBUILD.phase1.final-current-aliases.reference-only-assets.physical-map.json',mp)
prepared.update({'schemaVersion':1,'role':'Selection fragment only; no runnable final central configuration before B/ROOTREADY','baseline367Config':b['actualCentralConfig'],'baseline367Report':b['actualCentralReport'],'canonical':c['finalCanonical'],'semantic':c['finalSemanticSourceIdentities'],'memoryReviewConfigPath':c['M2']['whole422TenViewsConfig']['path'],'memory422ExactOriginal':c['M2']['whole422Records'],'visualizationQaNormalAlias':'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json','visualizationQA438ExactOriginal':c['V2']['wholeQA438Candidate'],'unchangedResolutionIndexPaths':subject['resolutionIndexPaths'],'unchangedResolutionSupersessions':subject['resolutionSupersessions'],'unchangedResolutionWithdrawals':subject['resolutionWithdrawals'],'genuineASource4Selector':ref(asel),'genuineASource4Seal':ref(aseal),'genuineBSource4Selector':None,'newD4ResolutionIndex':None,'ROOTREADY':False,'centralAllowed':False,'newD4VotesByThisRole':0,'sourceMapOrCourseRegistrationApplied':False,'normalSource4GoalIds':ids})
put(OWN/'candidate/PREPARED.exact-current422-selection.awaiting-genuine-B-and-ROOTREADY.json',prepared)
drefs=[]
for ordinal,path in enumerate(subject['resolutionIndexPaths']):
 j=load(REPO/path);pos=[r for r in j['resolutions'] if r['goalId'] in ids];deferred=[g for g in j.get('deferredGoalIds',[]) if g in ids]
 if pos or deferred:drefs.append({'ordinal':ordinal,'index':ref(REPO/path),'positiveClaims':pos,'historicalDeferrals':deferred})
assert not any(r['positiveClaims'] for r in drefs)
put(OWN/'checks/D4.original-A-and-existing-index-reference-only.no-pair.json',{'role':'Original A4 and old D claim inventory only; B not read or anticipated','genuineASelector':ref(asel),'genuineASeal':ref(aseal),'genuineARecords':a['normalRecords'],'genuineARun':a['normalRun'],'normalNative4ScientificInput':ref(nativeSelector),'targetGoalIds':ids,'existingIndexIntersections':drefs,'all87OldDIndexesAndOldD9Preserved':True,'positiveOldDClaimsForTheseFour':0,'negativeOriginalRowsRemainExact':True,'newResolutions':0,'dualSummaries':0,'BPending':True,'ROOTREADY':False,'centralRuns':0})
put(OWN/'checks/PHASE1.exact-selection-and-raw-preservation.json',{'role':'Actual row-by-row replacement/residual selection; no new science vote','targetGoalIds':ids,'replacedCurrentPAndAIds':sorted(replace),'unchangedSourceContextOnlyPAndAIds':[g for g in ids if g not in replace],'affectedOldContainers':overlap,'wholeRecordPreservation':preservedcounts,'selectedUniqueness':selectedUnique,'old367Payload142FilesExact':True,'active697ExactAtPreparation':True,'oldD9AndOtherIndexesUnmodified':True,'newD4Resolutions':0,'centralRuns':0,'newScienceVotes':0})
originalPins=list({r['path']:r for r in originalPins}.values());put(OWN/'checks/ORIGINAL.all-selected-source-bindings.before.json',{'role':'Finite original config/ledger/run/source authority CAS','files':originalPins,'originalWrites':0})
print(json.dumps({'P':preservedcounts['P'],'A':preservedcounts['A'],'oldD4PositiveOverlaps':0,'dataAliases':len(aliases),'physicalDataAliases':sum(r['physicalWithinHost'] for r in aliases),'rasterCopies':0,'BPending':True,'centralAllowed':False}))
