from pathlib import Path
import json,hashlib,os
from collections import Counter
R=Path.cwd()
Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current336-actual173-native-description-input-preparation-technical-v1'
def read(p):return json.loads((R/p).read_text())
def sha(p):return 'sha256:'+hashlib.sha256((R/p).read_bytes()).hexdigest()
def fields(a,b,p=''):
 if type(a)!=type(b):return [p]
 if isinstance(a,dict):
  out=[]
  for k in sorted(set(a)|set(b)):
   if k not in a or k not in b:out.append(p+'/'+k)
   else:out+=fields(a[k],b[k],p+'/'+k)
  return out
 return [] if a==b else [p]
def logical(page):
 page=json.loads(json.dumps(page))
 for k in ['pageNumber','navigationOrder','treeOrder','pageFingerprint','goalFingerprint']:page.pop(k,None)
 for k in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']:
  page[k]=sorted([{key:value for key,value in ref.items() if key!='pageNumber'} for ref in page[k]],key=lambda x:x['goalId'])
 return page
history=json.loads((Q/'private-preparation-evidence/historical300-and-accepted311-owner-baseline.actual.json').read_text())
plan=json.loads((Q/'actual173-native-batch-configs-and336-freeze.preparation-plan.json').read_text())
model=json.loads((Q/'freeze/whole-active-current336.normal-production-book-model.json').read_text())
actualCtx=json.loads((Q/'private-preparation-evidence/current336-actual-native-canonical-contexts.json').read_text())
ctx={x['goalId']:x for x in actualCtx['rows']}
prior=read(history['acceptedCurrent311OwnerModel']['path'])
assert sha(history['acceptedCurrent311OwnerModel']['path'])==history['acceptedCurrent311OwnerModel']['wholeBytesDigest']
priorPages={x['goalId']:x for x in prior['pages']}
currentPpath=model['source']['evidenceReviewSources'][0]['path']
currentPs={r['goalId']:r for r in map(json.loads,(R/currentPpath).read_text().splitlines())}
oldcfg=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-nine-reviewed-Q2-materials-root-bounded-assembly-v1/book-config.current311-reviewed-Q2-nine.frozen-P311624.inert.json')
oldPs={}
for path in oldcfg['evidenceReviewPaths']:
 for row in map(json.loads,(R/path).read_text().splitlines()):
  assert row['goalId'] not in oldPs
  oldPs[row['goalId']]=row
canonical=read(model['source']['landscapePath'])
byid={g['id']:g for g in canonical['goals']}
histHashes=history['historicalInputWholeHashes']
historicalBefore={p:sha(p) for p in histHashes}
changedHistorical=[{'path':p,'oldWholeDigest':d,'currentWholeDigest':historicalBefore[p]} for p,d in histHashes.items() if d!=historicalBefore[p]]
assert {x['path'] for x in changedHistorical}=={
 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'}
rows=[]
for page in model['pages']:
 gid=page['goalId'];old=priorPages.get(gid);hist=history['activeHistoricalResolutions'].get(gid)
 raw=fields(old,page) if old else []
 owner=fields(logical(old),logical(page)) if old else []
 canonicalDelta=fields(hist['inputGoal']['canonicalContext'],ctx[gid]['canonicalContext']) if hist else []
 fpDelta=hist is not None and hist['inputGoal']['goalFingerprint']!=page['goalFingerprint']
 profileDelta=old is not None and oldPs[gid]['profile']!=currentPs[gid]['profile']
 affected=hist is None or bool(canonicalDelta) or fpDelta or profileDelta or bool(owner)
 paginationOnly=bool(raw) and not owner
 resolutionBindingExact=None
 finalTextExact=None
 if hist:
  assert sha(hist['resolutionPath'])==hist['resolutionDigest']
  resolution=read(hist['resolutionPath'])
  assert resolution['goal']==hist['resolutionGoalBinding']
  assert resolution['decision']==hist['decision']=='keep_current'
  assert sha(hist['inputPath'])==hist['inputWholeFileDigest']
  ownInput=read(hist['inputPath'])
  assert next(x for x in ownInput['goals'] if x['goalId']==gid)==hist['inputGoal']
  resolutionBindingExact=True
  g=byid[gid]
  currentText={k: g[f] for k,f in [('titleDe','title'),('titleEn','titleEn'),('descriptionDe','description'),('descriptionEn','descriptionEn')]}
  finalTextExact=resolution['goal']['finalText']==currentText
 if not affected:
  assert hist and resolutionBindingExact and finalTextExact
  assert page['goalFingerprint']==hist['resolutionGoalBinding']['goalFingerprint']
  assert not canonicalDelta and not fpDelta and not profileDelta and not owner
  assert page['visualization']==old['visualization']
 rows.append({'goalId':gid,'currentNativePageNumber':page['pageNumber'],
  'hasHistoricalStrictD':hist is not None,'actualCanonicalContextChangedFields':canonicalDelta,
  'actualGoalFingerprintChanged':fpDelta,'actualPProfileBodyChanged':profileDelta,
  'actualWholeOwnerRawChangedFields':raw,'actualOwnerContentContextChangedFields':owner,
  'ownerPaginationOnly':paginationOnly,'targetedDInputRequired':affected,
  'historicalResolutionWholeBytesExact':resolutionBindingExact,'historicalFinalTextMatchesCurrent':finalTextExact,
  'historicalResolutionPath':hist['resolutionPath'] if hist else None,
  'historicalPageFingerprintUnmodified':hist['resolutionGoalBinding']['pageFingerprint'] if hist else None,
  'currentWholeOwnerPageFingerprint':page['pageFingerprint']})
target=[r['goalId'] for r in rows if r['targetedDInputRequired']]
reuse=[r['goalId'] for r in rows if not r['targetedDInputRequired']]
assert target==plan['nativeOrderGoalIds173'] and len(target)==173
assert reuse==plan['unchangedHistorical163GoalIds'] and len(reuse)==163
paginationExcluded=[r['goalId'] for r in rows if r['ownerPaginationOnly'] and not r['targetedDInputRequired']]
paginationIncluded=[r['goalId'] for r in rows if r['ownerPaginationOnly'] and r['targetedDInputRequired']]
assert len(paginationExcluded)==46 and len(paginationIncluded)==12
assert all(sha(p)==d for p,d in historicalBefore.items())
sourceBindings={
 history['acceptedCurrent311OwnerModel']['path']:sha(history['acceptedCurrent311OwnerModel']['path']),
 currentPpath:sha(currentPpath),
}
globalSymlinkErrors=[]
symlinkCount=0
for directory,dirs,files in os.walk(R/'curricula',followlinks=False):
 for name in dirs+files:
  p=Path(directory)/name
  if p.is_symlink():
   symlinkCount+=1
   if not p.exists():globalSymlinkErrors.append(str(p.relative_to(R)))
assert not globalSymlinkErrors
output={'technicalOnly':True,'currentNativeWholeModelDigest':model['digest'],
 'currentModelWholeSha256':hashlib.sha256((Q/'freeze/whole-active-current336.normal-production-book-model.json').read_bytes()).hexdigest(),
 'independentlyRecomputedNative173GoalIds':target,'historical163UnchangedBindingGoalIds':reuse,
 'paginationOnlyExcluded46':paginationExcluded,'paginationOnlyIncluded12DueToOtherActualChanges':paginationIncluded,
 'counts':{'currentPages':len(rows),'targetedInputGoals':len(target),'historicalUnchangedBindings':len(reuse),
  'withoutHistoricalStrictD':sum(not r['hasHistoricalStrictD'] for r in rows),
  'newVersus311Owner':len(set(currentPs)-set(priorPages)),
  'nativeCanonicalContextChanged':sum(bool(r['actualCanonicalContextChangedFields']) for r in rows),
  'actualPProfileBodyChanged':sum(r['actualPProfileBodyChanged'] for r in rows),
  'actualOwnerContentContextChanged':sum(bool(r['actualOwnerContentContextChangedFields']) for r in rows)},
 'actual336IndividualComparisons':rows,'historicalImmutableArtifactWholeBindings':{p:d for p,d in historicalBefore.items() if p not in {x['path'] for x in changedHistorical}},
 'legitimateCurrentActiveWholeRegistryAndCanonicalSuccessors':changedHistorical,
 'historicalInputsExactBeforeAfterThisCheck':True,'sourceBindings':sourceBindings,
 'global_curriculum_symlink_errors':globalSymlinkErrors,'globalCurriculumSymlinkCount':symlinkCount,
 'limitations':['Logical owner-field comparison is a declared technical classification, not a native scientific carryover resolution.',
 'Historical subset page fingerprints and reviewer records retain exact old bytes; current page fingerprints are not asserted equal.',
 'No new D review, human approval, whole-course or whole-source validity is claimed.'],
 'reviewRecordsAuthored':0,'historicalRecordsRebound':0,'activeLedgerWrites':0}
dest=Q/'private-preparation-evidence/actual-independent336-delta-and163-lineage-technical-proof.json'
dest.write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'PASS':True,'output':str(dest.relative_to(R)),'counts':output['counts'],
 'paginationOnlyExcluded':len(paginationExcluded),'historicalWholeHashes':len(historicalBefore),
 'legitimateActiveWholeSuccessors':len(changedHistorical),'global_curriculum_symlink_errors':globalSymlinkErrors},ensure_ascii=False))

