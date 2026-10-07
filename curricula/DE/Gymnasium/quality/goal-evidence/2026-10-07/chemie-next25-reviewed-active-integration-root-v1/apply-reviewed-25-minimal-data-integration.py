# SPDX-License-Identifier: Apache-2.0
"""Apply reviewed current data; no review runs, generator or quality-floor changes."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,copy,shutil
root=Path(__file__).resolve().parents[7]; own=Path(__file__).resolve().parent; rootbase=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'; author=rootbase/'chemie-next25-orbital-nano-targeted-author-v3'; prep=rootbase/'chemie-next25-reviewed-integration-preparation-root-v1'; d=rootbase/'chemie-next25-description-native-reviewed-integration-preparation-v1'; mem=root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-regional-all-required-memory-placement-author-v3'; operative=root/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-seven-reviewed-png-operative-preparation-integrator-20261007-v1'
def read(p):return json.loads(Path(p).read_text())
def rel(p):return str(Path(p).relative_to(root))
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':rel(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,obj):p=Path(p);p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def same(p,r):assert pin(p)['sha256']=='sha256:'+r['sha256'].removeprefix('sha256:'),(p,r)
def backup(p):
 p=Path(p);out=own/'before'/rel(p);out.parent.mkdir(parents=True,exist_ok=True)
 if out.exists():assert out.read_bytes()==p.read_bytes()
 else:shutil.copy2(p,out)
 return pin(out)
assert not (own/'actual-reviewed-25-active-application.receipt.json').exists()
dseal=d/'native-description-D25-reviewed-integration-preparation.integrator-v1.final.freeze.json'
assert dseal.exists(), 'Wait for final immutable D25 integration freeze'
assert pin(dseal)['sha256']=='sha256:c5049f5946a8d608515a765dc812295ead951c26d1f2307a48e2ef07a1ae1cac'
for row in read(dseal)['files']:
 same(root/row['path'],row)
# All D indices derive from actual immutable independent rounds, with original REVISE deferred.
indices=[d/name/'resolution-index.json' for name in ['native-current-nineteen','native-current-five','native-current-orbital-one']]
ids=[r['goalId'] for f in indices for r in read(f)['resolutions']];assert len(ids)==len(set(ids))==25
for f in indices:assert all(r['strictDescriptionComplete'] for r in read(f)['resolutions'])
regpath=root/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=read(regpath);beforeRegistry=copy.deepcopy(registry);subject=next(s for s in registry['subjects'] if s['subject']=='chemie');canon=root/subject['landscapePath'];kind=root/subject['semanticKindLedgerPath'];qa=root/subject['visualizationQaPath'];source=root/'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json';beforeCanon=read(canon);afterCanon=read(author/'canonical.targeted-final-complete-alttext.candidate.json');beforeGoals={g['id']:g for g in beforeCanon['goals']};afterGoals={g['id']:g for g in afterCanon['goals']};assert pin(canon)['sha256']=='sha256:4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6';assert beforeGoals.keys()==afterGoals.keys()
route=read(operative/'seven-reviewed-png-operative-candidates.final-routing.json');seven={r['goalId'] for r in route['imageInstallRouting']};orb='0acc8cd2-be6d-567e-a023-1d9e90475510';bc='3bc48951-025c-5144-99b1-924db611a5f9';nano='5e2eb826-6e60-5273-91d6-c23f6dfa33b1';changed={i for i in beforeGoals if beforeGoals[i]!=afterGoals[i]};assert changed==seven|{orb,bc} and len(changed)==9
for i in beforeGoals:assert beforeGoals[i].get('requires',[])==afterGoals[i].get('requires',[]) and beforeGoals[i].get('contains',[])==afterGoals[i].get('contains',[])
protected=next(s for s in read(root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json')['subjects'] if s['subject']=='chemie')['strictCompleteGoalIds'];assert len(protected)==127 and not set(protected)&changed
candidateQA=read(author/'qa.seven-reviewed-PNGs-and-two-current-text-KEEPs.candidate.json');beforeQA=read(qa);a={r['goalId']:r for r in beforeQA['records']};b={r['goalId']:r for r in candidateQA['records']};assert a.keys()==b.keys();qaChanged={i for i in a if a[i]!=b[i]};assert qaChanged==changed
ledger=read(prep/'semantic-kinds.future-active.current479.json');oldKind=read(kind);a={r['goalId']:r for r in oldKind['decisions']};b={r['goalId']:r for r in ledger['decisions']};assert a.keys()==b.keys();kindChanged={i for i in a if a[i]!=b[i]};assert kindChanged=={orb,bc,nano}
for i in a:assert {k:v for k,v in a[i].items() if k!='sourceFingerprint'}=={k:v for k,v in b[i].items() if k!='sourceFingerprint'}
sourceCandidate=read(author/'BW-SekI.nano-printed-page14-only.source-extraction.candidate.json');oldSource=read(source);a={r['id']:r for r in oldSource['sourceGoals']};b={r['id']:r for r in sourceCandidate['sourceGoals']};sourceID='bw-chem-seki-3-2-1-1-b07-a01-b0c6f1f5';assert {i for i in a if a[i]!=b[i]}=={sourceID};assert {k:v for k,v in a[sourceID].items() if k!='sourceRef'}=={k:v for k,v in b[sourceID].items() if k!='sourceRef'}
assert {k:v for k,v in oldSource.items() if k!='sourceGoals'}=={k:v for k,v in sourceCandidate.items() if k!='sourceGoals'}
# Verify candidates and archival originals before any active write.
for row in route['imageInstallRouting']:
 same(root/row['preparedExactCopy']['path'],row['preparedExactCopy']);assert not (root/row['finalActiveDestination']).exists()
for row in route['oldJPGsToArchiveThenRetire']:
 same(root/row['oldActivePath'],row['oldBinding']);same(root/row['requiredHistoryCopyAlreadyPrepared']['path'],row['oldBinding'])
for row in route['sevenPromptInstallRouting']:
 same(root/row['preparedNativeHelperPrompt']['path'],row['preparedNativeHelperPrompt'])
viewPlan=read(mem/'raw-four-real-regional-memory-reference-placement-review-input.author-candidate.json')['fourViewCandidatePlans']
for row in viewPlan:
 assert pin(root/row['futureActiveViewPath'])['sha256']=='sha256:'+row['originalSHA256'];assert pin(root/row['candidateViewPath'])['sha256']=='sha256:'+row['candidateSHA256']
mutable=[canon,kind,qa,source,regpath]+[root/r['futureActiveViewPath'] for r in viewPlan]+[root/r['finalActiveDestination'] for r in route['sevenPromptInstallRouting']]
backups=[backup(p) for p in mutable]
# Apply only whole goal/QA rows checked against the fresh baseline; all unrelated rows exact.
current=copy.deepcopy(beforeCanon)
for i,g in enumerate(current['goals']):
 if g['id'] in changed:current['goals'][i]=afterGoals[g['id']]
assert current==afterCanon
currentQA=copy.deepcopy(beforeQA)
candidateQARows={r['goalId']:r for r in candidateQA['records']}
for i,r in enumerate(currentQA['records']):
 if r['goalId'] in qaChanged:currentQA['records'][i]=candidateQARows[r['goalId']]
assert currentQA==candidateQA
for row in route['imageInstallRouting']:
 dst=root/row['finalActiveDestination'];dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/row['preparedExactCopy']['path'],dst)
for row in route['sevenPromptInstallRouting']:shutil.copy2(root/row['preparedNativeHelperPrompt']['path'],root/row['finalActiveDestination'])
for p,obj in [(canon,current),(qa,currentQA),(kind,ledger),(source,sourceCandidate)]:write(p,obj)
for row in viewPlan:shutil.copy2(root/row['candidateViewPath'],root/row['futureActiveViewPath'])
# Retire only proven old layouts after exact archive/install verification. History stays immutable.
for row in route['imageInstallRouting']:same(root/row['finalActiveDestination'],row['preparedExactCopy'])
for row in route['oldJPGsToArchiveThenRetire']:(root/row['oldActivePath']).unlink()
# Routing only; existing valid D/P lists and protected subject declarations remain exact.
subject['resolutionIndexPaths'] += [rel(p) for p in indices]
subject['positiveEvidenceConfigPaths'] += [rel(prep/'positive24.future-active.config.json'),rel(prep/'positive1.future-active.config.json')]
oldConfigs=json.loads((prep/'before'/regpath.relative_to(root)).read_text());oldS=next(s for s in oldConfigs['subjects'] if s['subject']=='chemie')
amRows=read(root/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-current-atomicity-memory-impact-independent-a-v1/current25-native-A-M-fingerprints-and-prospective-deltas.actual.json')['records'];configs={r['goalId']:r['atomicityConfigPath'] for r in amRows}
replacements={configs[bc]:rel(prep/'atomicity/quantum-rules.future-active.config.json'),configs[orb]:rel(prep/'atomicity/orbitals.future-active.config.json')};subject['semanticAtomicityConfigPaths']=[replacements.get(p,p) for p in subject['semanticAtomicityConfigPaths']];assert set(replacements)<=set(oldS['semanticAtomicityConfigPaths'])
subject['memoryReviewConfigPath']=rel(prep/'memory/current378-seven-real-scopes.future-active.config.json')
for s in registry['subjects']:
 if s['subject']!='chemie':assert s==next(x for x in beforeRegistry['subjects'] if x['subject']==s['subject'])
write(regpath,registry)
write(own/'actual-reviewed-25-active-application.receipt.json',{'documentType':'actual reviewed local data integration; strict gain awaits central measurement','completedAtUTC':datetime.now(timezone.utc).isoformat(),'changedWholeCanonicalGoals':sorted(changed),'exactUnchangedWholeCanonicalGoals':470,'all479IDsAndAllEdgesExact':True,'protectedWhole127ChemistryGoalsExact':True,'protectedRegistryMathPhysicsBiologyDeclarationsExact':True,'semanticKindOnlyNativeFingerprintChanges':sorted(kindChanged),'correctedPNGImages':7,'installedExactSourcePublicBackendPNGCopies':21,'retiredOldJPGs':21,'oldJPGAndHumanQAEvidencePreserved':True,'unchangedExistingImagesActuallyInspected':2,'fourActualMemoryViewsUpdated':4,'whole376UnchangedMemoryRecordLines':True,'nativeDIndices':list(map(pin,indices)),'nativePositiveConfigs':[pin(prep/'positive24.future-active.config.json'),pin(prep/'positive1.future-active.config.json')],'backupBindings':backups,'newScienceByTechnicalIntegrator':False,'newStrictCompletions':'await completed current central report','restoredStrictBindings':'await completed current central report','humanApproval':False,'humanTrial':False,'gitWrites':False,'fullBuildsRepeatedByThisScript':False})
print('Applied25 reviewed data package; 9 whole goal deltas,470 exact; 7 PNGs,4 real Memory views; central strict measurement pending.')
