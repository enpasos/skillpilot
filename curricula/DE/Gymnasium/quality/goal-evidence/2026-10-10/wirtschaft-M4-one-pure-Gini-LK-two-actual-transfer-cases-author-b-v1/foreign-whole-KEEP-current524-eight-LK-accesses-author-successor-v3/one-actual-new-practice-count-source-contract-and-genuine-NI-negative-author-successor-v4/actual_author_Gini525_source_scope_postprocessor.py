import copy,gzip,hashlib,json,pathlib,subprocess
from jsonschema import Draft202012Validator
ROOT=pathlib.Path.cwd();S=pathlib.Path(__file__).resolve().parent;O=S.parent
def bind(p):return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def dump(name,obj):
 p=S/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return bind(p)
before=json.loads((O/'before-current524.actual-native.json').read_text());after=json.loads((O/'after-current525-eight-LK-accesses.actual-native.json').read_text());neg=json.loads((S/'negative-current525-NI-LK-required-material-access-drop.actual-native.json').read_text());idx=json.loads((O/'actual-one-status-nav-and-eight-LK-accesses.current524-fieldwise-author-index.json').read_text());mid='b2086441-16a8-58f9-8036-49a9758c6aac';m=after['actualMaterials'][0]
def sourcecontract(s):
 s=copy.deepcopy(s);del s['rawAtomicGoals']
 for j in s['jurisdictions']:
  del j['visibleGoals'];del j['visibleClusterGoals']
 return s
assert sourcecontract(before['wholeSource'])==sourcecontract(after['wholeSource'])==sourcecontract(neg['wholeSource'])
assert after['wholeSource']['rawAtomicGoals']-before['wholeSource']['rawAtomicGoals']==1
context=[]
for b,a in zip(before['wholeSource']['jurisdictions'],after['wholeSource']['jurisdictions']):
 d={k:{'before':b[k],'after':a[k]} for k in b if b[k]!=a[k]}
 if d:
  assert set(d)=={'visibleGoals','visibleClusterGoals'}
  assert all(r['after']-r['before']==1 for r in d.values())
  context.append({'jurisdiction':b['jurisdiction'],'actualContextCountDelta':d})
assert {x['jurisdiction'] for x in context}==set(m['wholeCompiledRow']['compiledApplicability']['jurisdiction'])
def non(rows):
 return [{k:([i for i in v if i!=mid] if isinstance(v,list) else v) for k,v in s.items()} for s in rows]
assert non(before['all64NativeScopeSets'])==non(after['all64NativeScopeSets'])==non(neg['all64NativeScopeSets'])
metrics=lambda x:next(r['metrics'] for r in x['wholeRoute']['rules'] if r['id']=='CQR-104')
for x,gcount in [(before,524),(after,525),(neg,525)]:
 assert x['wholeCompiler']['summary']=={'goals':gcount,'errors':0,'warnings':0,'diagnostics':1457}
 assert (x['wholeSource']['totalJurisdictions'],x['wholeSource']['sourceAtomicGoals'],x['wholeSource']['unsupportedAssignedAtomicGoals'],x['wholeSource']['unmappedSourceAtomicGoals'])==(16,2134,0,0)
 assert len(x['all64NativeScopeSets'])==64 and sum(len(s['ordinaryTargets']) for s in x['all64NativeScopeSets'])==6974
 assert metrics(x)['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==0
 assert metrics(x)['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==0
 assert metrics(x)['visibleProjectedRouteTargetGoalOccurrencesExcludedFromRouteChecks']==0
valid=[s for s in m['actual64Scopes'] if s['materialCurrentlyVisible']];assert len(valid)==14
assert set(m['wholeClosure']['atomicGoalIds'])=={'424bae9f-8f2e-5093-a17d-ee5eadb6edde','6bf2d1cc-e745-50dd-a617-71c06a6c6945'}
assert not m['wholeClosure']['unresolvedReferences']
for s in valid:assert s['courseProfile']=='LK' and s['countryCompatible'] and s['courseCompatible'] and s['wholeCoveredTargetsPresent'] and s['wholeCoveredSupportPresent'] and not s['missingPrerequisites']
assert not any(s['materialCurrentlyVisible'] and s['courseProfile']=='GK' for s in m['actual64Scopes'])
nr=[s for s in neg['actualMaterials'][0]['actual64Scopes'] if s['jurisdiction']=='DE-NI' and s['courseProfile']=='LK'];assert len(nr)==2 and not any(s['materialCurrentlyVisible'] for s in nr)
assert metrics(before)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']==1968
assert metrics(after)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']==1960
assert metrics(neg)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute']>1960
schema=json.loads((ROOT/'contracts/curriculum-package/v1/composition-view.schema.json').read_text());validator=Draft202012Validator(schema);schemas=[]
for v in idx['views']:
 b=json.loads((ROOT/v['before']['path']).read_text());a=json.loads((ROOT/v['after']['path']).read_text());errors=[e.message for e in validator.iter_errors(a)];assert not errors
 assert a['rootNodes'][0]['children'][:-1]==b['rootNodes'][0]['children'] and a['rootNodes'][0]['children'][-1]==v['addedReference']
 x=copy.deepcopy(a);x['viewId']=b['viewId'];x['rootNodes'][0]['children']=x['rootNodes'][0]['children'][:-1];assert x==b
 schemas.append({'view':v['activePath'],'schemaErrors':errors,'onlyAppendOnePracticeAndUniqueHeader':True})
native= dump('actual-one-new-practice-source-context-deltas-and-eight-refs64-scope-author-native-PASS.json',{'role':'AUTHOR_ONLY_PENDING_FOREIGN_SCOPE','actualCompilerThreeFrames0Errors0Warnings':True,'currentSourceAtomicContract16_2134_0_0WholeExact':True,'sourceRawAtomicPhysicalPracticeCount':{'before':before['wholeSource']['rawAtomicGoals'],'after':after['wholeSource']['rawAtomicGoals'],'actualNewPracticeDelta':1},'allOtherSourceFieldsExactExceptDeclaredContextCounts':True,'actualSevenCountryContextDeltas':context,'all64NonPracticeOrdinary6974SupportPOnlyMemoryOrientationExact':True,'wholeClosure':m['wholeClosure'],'actual14WholeEligibleLKAccessInstances':valid,'actualEightChangedViewClosedSchema':schemas,'actualCQR104Before':metrics(before),'actualCQR104After':metrics(after),'actualCQR104Negative':metrics(neg),'actualNInegativeRemovesBothCountryAndAuthoritativeNationalAccess':nr,'historicalNativeWrapperExit1':'Original2frames were actually complete; equalityguard wrongly included physical newPractice raw count. Original runner/reports/stdout/stderr/receipt remain exact; no PASS attributed to exit1. This independent diagnostic postprocessor plus new genuine nativeNInegative has its own actual exit0.','newStrictClosures':0,'restoredLocalRouteBindings':8,'machineGenerationOrAuthorProbeIsNotForeignScopeApproval':True})
body=json.loads((ROOT/idx['wholeNewPractice']['path']).read_text());old=json.loads((O.parent/'two-solutions-original-numeric-token-readability-author-successor-v2/whole-one-pure-Gini-LK.only-two-solutions-original-number-tokens.DRAFT-author-v2.json').read_text());x=copy.deepcopy(body);x['examData']['reviewStatus']=old['examData']['reviewStatus'];del x['examData']['reviewNote'];assert x==old
kind=dump('one-current-new-Gini-practiceAssessment-kind.author-proposal-not-active.json',{'goalId':mid,'semanticKind':'practiceAssessment','status':'PROPOSAL_PENDING_NATIVE_SEM_BINDING','reason':'Whole released candidate assesses the already-existing424contract through two actual cases; foreignRoot1709 wholeScience approved exact8ff, not a new ordinary/math goal. No source evidence or human release.'})
can=json.loads((ROOT/idx['afterCAN']['path']).read_text());oldcan=json.loads((ROOT/idx['beforeCAN']['path']).read_text());oldg={g['id']:g for g in oldcan['goals']};newg={g['id']:g for g in can['goals']};assert len(newg)==525 and set(newg)-set(oldg)=={mid};assert [i for i in oldg if oldg[i]!=newg[i]]==['5317d078-413b-58bb-9262-d57387d51655']
assert all(oldg[i]==newg[i] for i in oldg if i!='5317d078-413b-58bb-9262-d57387d51655')
# Compress raw reports only before first external finalhandoff. Keep the exact
# original raw SHA, so the exit1 history remains byte-recoverable.
archives=[]
for p in [O/'before-current524.actual-native.json',O/'after-current525-eight-LK-accesses.actual-native.json',S/'negative-current525-NI-LK-required-material-access-drop.actual-native.json']:
 raw=p.read_bytes();z=pathlib.Path(str(p)+'.gz');z.write_bytes(gzip.compress(raw,mtime=0));assert gzip.decompress(z.read_bytes())==raw;archives.append({'originalPath':str(p.relative_to(ROOT)),'rawSHA256':hashlib.sha256(raw).hexdigest(),'rawBytes':len(raw),'losslessArchive':bind(z)});p.unlink()
rawindex=dump('actual-three-whole-native-reports-lossless-pre-first-handoff.index.json',{'reports':archives,'originalCommandHistoryPreserved':True,'executedScriptsReferToRawNames':'To reproduce extract archives into an isolated copy first; do not mutate frozen external evidence.'})
guard=dump('actual-fieldwise525-only-new-practice-nav-and-eight-practice-refs.author-guard.json',{'beforeCAN':idx['beforeCAN'],'afterCAN':idx['afterCAN'],'onlyOldGoalChanged':'5317d078-413b-58bb-9262-d57387d51655','onlyOldFieldsChanged':['contains','description','descriptionEn'],'actualNewPracticeObject':idx['wholeNewPractice'],'newPracticeOnlyStatusAndNoteForeignBound':True,'all523OtherOldGoalsWholeExact':True,'newOrdinaryGoals':0,'ordinaryTargetSupportMemoryDeltas':0,'allOldMaterialBodiesExact':True,'old81d572TagsBodiesReviewsUntouched':True})
files=[p for p in O.rglob('*') if p.is_file()];assert not any(p.is_symlink() for p in O.rglob('*'))
ignored=subprocess.run(['git','check-ignore','--stdin'],input='\n'.join(str(p.relative_to(ROOT)) for p in files)+'\n',text=True,capture_output=True);assert not ignored.stdout and ignored.returncode==1
manifest=dump('actual-final-one-Gini524-525-status-nav-eight-accesses.portable-author-freeze.manifest.json',{'role':'AUTHOR_PENDING_FOREIGN_SCOPE_REVIEW','wholeInputsOutputsHistory':[bind(p) for p in sorted(files)],'committedSymlinks':0,'absoluteIgnoredInputs':0,'bodyForeignRoot1709WholeScience':idx['foreignWholeScience']})
receipt=dump('actual-final-one-foreign-science-Gini-current524-status-nav-eight-LK-accesses.author-handoff.json',{'status':'AUTHOR_PENDING_FOREIGN_SCOPE_ONLY','manifest':manifest,'fieldwiseAuthorIndex':bind(O/'actual-one-status-nav-and-eight-LK-accesses.current524-fieldwise-author-index.json'),'ownNative':native,'wholeRawThreeFrames':rawindex,'guard':guard,'kindProposal':kind,'foreignWholeScience':idx['foreignWholeScience'],'wholeMaterialScienceNotRepeated':True,'actualOldOrdinaryGoalP336685Unchanged':True,'actualScopeCount':14,'actualAppendRefs':8,'actualChangedViews':8,'ownRouteBindingsRestored':8,'strictNewClosures':0,'SEMActiveWrite':False,'activeCANViewRegistryPCodeWrites':0,'SourceCourseHumanOrWholeM4M6M7ReleaseClaim':False,'integration':'Guarded fields only: append new1Practice; append nav1child and two bounded purposes; append8Refs in8currentLKviews. Preserve any independently changed source-role/ordinary/support fields. Bind newpractice/navSEM fingerprints separately through native generator.'})
print(json.dumps(receipt))
