# SPDX-License-Identifier: Apache-2.0
"""Prepare exact reviewed inputs and guards, without changing active files."""
import copy,hashlib,json,shutil,subprocess
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;BASE=OWN.parent
OLD=BASE/'biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
SRC=BASE/'biologie-basis2-source-supplement-technical-author-resumed-v1'
A=BASE/'biologie-basis2-supplement-context-independent-a-resumed-v1'
B=BASE/'biologie-basis2-supplement-context-independent-b-resumed-v1'
IDS=['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38','32483d30-2162-50a5-a6cc-05b7f2467ab1'];WORD='576d59e2-397a-5654-b853-7c0c4870fbd3'
ROOT_ID='e8d54127-d42e-51f5-bfa5-51d826069f95';SHARED='860c80f9-e463-598b-8ef8-79f65c12f235'
def data(p):return json.loads(Path(p).read_text())
def rows(p):return [json.loads(s) for s in Path(p).read_text().splitlines() if s.strip()]
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':p.relative_to(ROOT).as_posix() if p.is_relative_to(ROOT) else str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def put(p,v):
 p=Path(p);assert p.is_relative_to(OWN),str(p);content=json.dumps(v,ensure_ascii=False,indent=2)+'\n';p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists():assert p.read_text()==content,str(p)
 else:p.write_text(content)
 return bind(p)
def exactcopy(a,b):
 b=Path(b);assert b.is_relative_to(OWN),str(b);b.parent.mkdir(parents=True,exist_ok=True)
 if b.exists():assert Path(a).read_bytes()==b.read_bytes(),str(b)
 else:shutil.copyfile(a,b)
 return bind(b)
verified={}
def verify(ref,aliases=None):
 p=ROOT/ref['path'];aliases=aliases or {};actual=ROOT/aliases.get(ref['path'],ref['path']);assert actual.is_file(),str(actual)
 v=bind(actual);assert v['sha256']==ref['sha256'].removeprefix('sha256:') and v['bytes']==ref['bytes'],str(actual)
 verified[actual.as_posix()]=v;return actual
def refs(x):
 if isinstance(x,dict):
  if isinstance(x.get('path'),str) and isinstance(x.get('sha256'),str) and isinstance(x.get('bytes'),int):yield x
  for v in x.values():yield from refs(v)
 elif isinstance(x,list):
  for v in x:yield from refs(v)
assert not (OWN/'reviewed-supplement-adoption.initial.guard.json').exists()
entryPath=SRC/'neutral-source-supplement-two-context-review.entry.json';assert bind(entryPath)['sha256']=='1a56decb9f8340a2d3152c64f9aceb92f5f0cdaa1faa31a2b6d6e0e65ba9bb18';entry=data(entryPath)
aEntryPath=A/'neutral-independent-context-a.completed.entry.json';assert bind(aEntryPath)['sha256']=='0da7a7f9c5f1f9b7ede654a8a54c3539edb0bc33c0950871b5ee7023e319dd14';a=data(aEntryPath)
bEntryPath=B/'neutral-independent-b-targeted-context.completed.entry.json';assert bind(bEntryPath)['sha256']=='6d14c1f69c7fde87216021108e43a78d63e9567dc323f16e7bbeaefa3869770b';b=data(bEntryPath)
original=data(BASE/'biologie-basis2-original-seals-root-verification-resumed-v1/original-six-seals-and-current-bindings.root.actual.json')
aliases={r['originalPath']:r['immutableHistoricalCopy']['path'] for r in original['originalMutableBeforeInputsPreserved']}
for r in original['originalMutableBeforeInputsPreserved']:verify(r['immutableHistoricalCopy'])
for s in original['originalSeals']:
 verify(s['seal'])
 for r in s['verifiedOriginalFiles']:verify(r,aliases)
for d,first in [(a,a['firstOwnScientificFreeze']),(b,b['firstFreeze'])]:
 verify(first)
 for r in refs(data(ROOT/first['path'])):verify(r,aliases)
 for r in refs(d):verify(r,aliases)
verify(bind(B/'independent-b.final-completed.freeze.json'))
for r in refs(data(B/'independent-b.final-completed.freeze.json')):verify(r,aliases)
verify(bind(SRC/'technical-author.first.freeze.json'))
for r in refs(data(SRC/'technical-author.first.freeze.json')):verify(r,aliases)
assert a['scientificContextBlockingFindings']==0 and b['scientificContextBlockers']==0
assert set(b['openTechnicalFindingIds'])=={'BIO-BASIS2-CONTEXT-B-TECH-001'}
assert a['descriptionContextDecisions']==dict.fromkeys(IDS,'keep') and a['unchangedPBodyContextCompatibilityApprovedForBoth']
currentBVerdict=data(verify(b['firstVerdict']));assert b['scientificContextBlockers']==0 and currentBVerdict['scientificContextFindings']==[]
oldGuard=data(OLD/'reviewed-basis2-current-final-adoption.guard.json')
labels=['canonical','kinds','qa','registry','sourceInputs','atomicityConfig','memoryConfig'];before={}
for label in labels:
 live=ROOT/oldGuard['before'][label]['active']['path'];before[label]={'active':bind(live),'snapshot':exactcopy(live,OWN/'before'/(label+'.current-active.exact.json'))}
canon=data(verify(entry['canonicalCandidate']));baseCanon=data(ROOT/before['canonical']['active']['path']);cb={g['id']:g for g in canon['goals']};ob={g['id']:g for g in baseCanon['goals']}
assert len(ob)==476 and len(cb)==479 and len(canon['goals'])==479
supp=entry['newSupplementWholeGoal']['id'];assert set(cb)-set(ob)==set(IDS+[supp])
for gid,g in ob.items():
 expected=copy.deepcopy(g)
 if gid==ROOT_ID:expected['contains'].append(supp)
 assert cb[gid]==expected,gid
 assert cb[gid].get('requires',[])==g.get('requires',[]),gid
assert cb[ROOT_ID]['weight']==1 and cb[SHARED]==ob[SHARED] and cb[SHARED]['weight']==5 and len(cb[SHARED]['contains'])==5
canref=exactcopy(ROOT/entry['canonicalCandidate']['path'],OWN/'candidate/canonical479.exact-reviewed-supplement.future-active.json')
kinds=data(verify(entry['semanticKindsCandidate']));kinds['sourceLandscapePath']=before['canonical']['active']['path'];kindref=put(OWN/'candidate/semantic-kinds479.established-path.future-active.json',kinds)
assert kinds['counts']['curricularAtomic']==394 and len(kinds['decisions'])==479
qaSource=OLD/'candidate/visualization-QA394.ordinary-normalized-future-active.json';qa=data(qaSource);oldqa=data(ROOT/before['qa']['active']['path'])
assert [r for r in qa['records'] if r['goalId'] not in IDS]==oldqa['records'] and len(qa['records'])==394
qaref=exactcopy(qaSource,OWN/'candidate/visualization-QA394.old392-exact-reviewed2.future-active.json')
pcfg=data(OLD/'positive/P2.future-active.config.json');assert rows(ROOT/pcfg['reviewPath'])==rows(ROOT/entry['originalWholeP2Profiles']['path'])
pref=put(OWN/'positive/P2.exact-genuine-science.future-active.config.json',pcfg)
am={}
for key,prefix in [('atomicityConfig','A'),('memoryConfig','M')]:
 cfg=data(OLD/f'atomicity-memory/{prefix}394.future-active.config.json');current=data(ROOT/before[key]['active']['path'])
 rpath=ROOT/cfg['reviewPath'];oldbytes=(ROOT/current['reviewPath']).read_bytes();assert rpath.read_bytes().startswith(oldbytes) and len(rows(rpath))==394
 assert {k:v for k,v in cfg.items() if k!='reviewPath'}=={k:v for k,v in current.items() if k!='reviewPath'}
 am[key]=put(OWN/f'atomicity-memory/{prefix}394.exact-science.future-active.config.json',cfg)
source=data(ROOT/before['sourceInputs']['active']['path']);newsource=data(verify(entry['ordinaryAtlasInputs']))
assert source['expectedCurricularAtomicGoalCount']==392 and newsource['expectedCurricularAtomicGoalCount']==394
assert len(newsource['mappingPaths'])==len(source['mappingPaths'])==29
assert sum(a!=b for a,b in zip(source['mappingPaths'],newsource['mappingPaths']))==8
installs=data(SRC/'candidate-preparation.actual.json')['ordinaryMappingInstallsUnchanged'];assert len(installs)==8
assert len({i['destination'] for i in installs})==8
raw=data(verify(entry['tenDirectPartialMappingRows']))['rows'];expectedRows=[r['wholePartialPartnerRow'] for r in raw];assert len(expectedRows)==10
allbefore=[]
for p in source['mappingPaths']:allbefore.extend(data(ROOT/p)['mappings'])
assert len(allbefore)==3084
newrows=[];mappingInstalls=[]
for item in installs:
 p=verify(item['candidate']);assert not (ROOT/item['destination']).exists(),item['destination']
 actual=data(p);newrows.extend(actual['mappings']);assert all(m['matchType']=='partial' and m['canonicalGoalId'] in IDS for m in actual['mappings'])
 archive=exactcopy(p,OWN/'candidate/mapping-installs'/item['destination']);mappingInstalls.append({'source':archive,'destination':item['destination'],'mustNotExist':True})
assert sorted(json.dumps(r,sort_keys=True) for r in expectedRows)==sorted(json.dumps(r,sort_keys=True) for r in newrows)
sourceafter=copy.deepcopy(source);sourceafter['mappingPaths']=newsource['mappingPaths'];sourceafter['expectedCurricularAtomicGoalCount']=394
assert {k:v for k,v in sourceafter.items() if k not in ['mappingPaths','expectedCurricularAtomicGoalCount']}=={k:v for k,v in source.items() if k not in ['mappingPaths','expectedCurricularAtomicGoalCount']}
sourceRef=put(OWN/'candidate/source-atlas394.reviewed-full29-pointers.future-active.json',sourceafter)
allafter=[]
for p in sourceafter['mappingPaths']:allafter.extend(data(ROOT/p)['mappings'])
assert len(allafter)==3094
from collections import Counter
serialize=lambda r:json.dumps(r,sort_keys=True)
assert Counter(map(serialize,allafter))==Counter(map(serialize,allbefore))+Counter(map(serialize,newrows))
historical=data(verify(entry['wholeSourceReadingInputs']));assert len(historical['entries'])==20 and historical['originalPartnerCount']==268
historicalRows=[r for e in historical['entries'] for r in e['originalPartnerRows']];assert len(historicalRows)==268
retained=[r for r in historicalRows if r in allbefore];refined=[r for r in historicalRows if r not in allbefore];assert (len(retained),len(refined))==(248,20)
put(OWN/'checks/current-source-partner-preservation.corrected-baseline-comparison.actual.json',{'schemaVersion':1,'role':'new technical correction of old preservation claim, not a new source review or restoration of rejected weak witnesses','technicalFindingResolved':'BIO-BASIS2-CONTEXT-B-TECH-001','originalHistoricalWholeDutyCount':20,'historicalPartnerRowCount':268,'historicalPartnerRowsCurrentlyEffective':248,'previouslyScopeRefinedHistoricalPartnerRows':20,'historicalReadingInput':entry['wholeSourceReadingInputs'],'wholeCurrent3084MappingRowsExactlyRetained':True,'currentBaselineWholeMappingPaths':[bind(ROOT/p) for p in source['mappingPaths']],'exactBoundedNewPartialRows':newrows,'newBoundedPartialRowCount':10,'newOrdinaryMappingFileCount':8,'previouslyRefinedRowsNotRestored':refined,'fourOriginalOperatorHoldsStillOpen':True,'wholeOriginalSourceCoverageApproved':False,'historicalFalseClaimAndAllOriginalSealsUnchanged':True,'activeWrites':0,'newScientificReview':False,'humanApproval':False})
put(OWN/'checks/original-six-science-and-two-current-context-seals.actual.json',{'schemaVersion':1,'role':'technical verification of existing genuine original judgments, not a new review','originalScienceSealCount':6,'currentContextSealCount':2,'immutableOriginalMutableBeforeInputAliases':original['originalMutableBeforeInputsPreserved'],'verifiedArtifactCount':len(verified),'verifiedArtifacts':list(verified.values()),'currentContextA':bind(aEntryPath),'currentContextB':bind(bEntryPath),'currentSourceAuthor':bind(entryPath),'currentContextsKeepCount':2,'scientificContextBlockers':0,'separateTechnicalCorrectionPath':str((OWN/'checks/current-source-partner-preservation.corrected-baseline-comparison.actual.json').relative_to(ROOT)),'oldP2ScienceAndV2PNGsReusedExactly':True,'fourOriginalOperatorHoldsRetained':True,'newScientificReviewByIntegrator':False,'humanApproval':False,'activeWrites':0})
images=[]
for i in oldGuard['imageInstalls']:
 verify(i['source']);assert not (ROOT/i['destination']).exists();images.append(i)
assert len(images)==10
guard={'schemaVersion':1,'expectedHead':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'currentStrictComplete':244,'currentDenominator':392,'candidateStrictCompletePendingActualCapsule':246,'candidateDenominator':394,'candidateCanonicalNodes':479,'newGoalIds':IDS,'contextSupersessionGoalId':WORD,'supplementId':supp,'before':before,'candidate':{'canonical':canref,'kinds':kindref,'qa':qaref,'sourceInputs':sourceRef,**am},'positiveConfig':pref,'imageInstalls':images,'mappingInstalls':mappingInstalls,'currentSourceAuthor':bind(entryPath),'currentContextA':bind(aEntryPath),'currentContextB':bind(bEntryPath),'existingWordResolutionIndex':str((OLD/'native-d-existing576-context/resolution-index.json').relative_to(ROOT)),'technicalVerification':bind(OWN/'checks/original-six-science-and-two-current-context-seals.actual.json'),'activeWrites':0,'humanApproval':False}
put(OWN/'reviewed-supplement-adoption.initial.guard.json',guard)
print(json.dumps({'preparedCanonical':479,'candidateAtoms':394,'originalScienceSeals':6,'currentContextSeals':2,'original3084MappingRowsRetained':True,'newPartialRows':10,'historicalPartners':'268 original /248 effective /20 previously refined','activeWrites':0}))
