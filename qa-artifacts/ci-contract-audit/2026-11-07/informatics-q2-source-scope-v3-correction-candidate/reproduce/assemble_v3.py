import pathlib,json,gzip,hashlib,tarfile,io,shutil,collections,datetime
W=pathlib.Path(__file__).parent;R=pathlib.Path('/home/enpasos/projects/skillpilot');P=W/'package';P.mkdir(exist_ok=True);C=W/'candidate';F=W/'frozen';h=lambda b:hashlib.sha256(b).hexdigest();J=lambda x:(json.dumps(x,ensure_ascii=False,indent=2)+'\n').encode();read=lambda n:json.loads((W/n).read_text());gzread=lambda n:json.load(gzip.open(W/n,'rt'))
def put(name,raw):
 p=P/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(raw)
def cp(name,to=None):put(to or name,(W/name).read_bytes())
def compress(name,to=None):put(to or name+'.gz',gzip.compress((W/name).read_bytes(),mtime=0))
changes=read('candidate-file-changes.json')['files']
# One lossless overlay contains all proposed files, including fixed history and code.
with (P/'candidate-overlay.tar.gz').open('wb') as dest:
 with gzip.GzipFile(fileobj=dest,mode='wb',mtime=0) as z:
  with tarfile.open(fileobj=z,mode='w|') as a:
   for row in changes:
    raw=(C/row['path']).read_bytes();assert h(raw)==row['candidateSha256'];t=tarfile.TarInfo(row['path']);t.size=len(raw);t.mode=0o644;t.mtime=0;a.addfile(t,io.BytesIO(raw))
for name in ['frozen-manifest.json','postguards.json','source-a84-preservation-guard.json','candidate-file-changes.json','initial-review-bindings.json','ci-integration-receipt.json','backend-reuse-current-guards.json','additional-contract-directory-pins.json']:compress(name,'pins/'+name+'.gz')
for name in ['build_v3.py','correct_projection_authority.py','freeze.py','native_source.mts','native_routes.mts','native_actual_q3_chain.mts','native-closure-functions.mts','native-closure-pins.json','run_overlay.py','prepare_backend.py','run_backend.py','V3AuthoredGlobalScopeProbe.java','V3DirectEmptyPcFalseProbe.java','V3ExplicitWiringScopeProbe.java','V3InfoScopeProbe.java','assemble_v3.py']:
 cp(name,'reproduce/'+name)
for name in ['old-24-raw-definitions.json','old24-full-native-before-after.json','source-author-decisions.json','source-changes.initial.json','source-projection-authority-decisions.json','sh-db4-primary-and-fullmatch-review.json','native-historical-mastery-preservation.json','actual-q3-consumer-chain.json','native-loader-adapter-correction.json','observation-only-patch.json']:compress(name,'evidence/'+name+'.gz')
for name in ['sh-p48.txt','sh-db4-page.png']:cp(name,'evidence/'+name)
for label in ['baseline-structure','candidate-initial','candidate-authority','candidate-scope-final','candidate-merged-native']:
 cp(label+'.native.json.gz','native/'+label+'.native.json.gz')
 for suffix in ['execution.json','stdout','stderr']:compress(label+'.'+suffix,'native/'+label+'.'+suffix+'.gz')
cp('candidate-final-50scopes.native.json.gz','native/candidate-final-50scopes.native.json.gz')
cp('candidate-final-50scopes.untrusted-loader.native.json.gz','diagnostics/candidate-final-50scopes.untrusted-loader.native.json.gz')
for label in ['candidate-final-50scopes','candidate-final-50scopes-captured','actual-q3-consumer-chain']:
 for suffix in ['execution.json','stdout','stderr']:compress(label+'.'+suffix,'native/'+label+'.'+suffix+'.gz')
for label in ['candidate-direct-false.runtime','candidate-v3-all25mastery.runtime','candidate-v3-explicit-wiring.runtime','candidate-v3-authored-global-wiring-final.runtime']:
 for suffix in ['json','execution.json','stdout','stderr']:compress(label+'.'+suffix,'runtime/'+label+'.'+suffix+'.gz')
for name in ['PATCH-FILES.json','IMPLEMENTATION-RECEIPT.json','completed-21-tests.stdout','completed-21-tests.stderr','source-v3-retained-coverage.actual.json','source-v3-prospective-bindings.review-pending.json','tracked-code-changes.patch']:
 compress('ci/'+name,'ci/'+name+'.gz')
# Exact material object integration is checked before relying on its review.
INFO='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';source=json.loads((C/INFO).read_text());old=json.loads((F/INFO).read_text());by={g['id']:g for g in source['goals']};oldby={g['id']:g for g in old['goals']}
materialPath=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-material-review-corrections/native-examData.json';material=json.loads(materialPath.read_text())
# Material is a goalID->examData mapping.
assert isinstance(material,dict)
ids=['0df1bedd-5fda-5b3b-a959-c9610237bb3e','269a561b-f12e-57b2-9b05-e20f58c9dcf6','ca2ff162-c71f-500f-8ce7-321ab2cf3f1f','6ebc2a67-ea20-5c4e-8a63-635f40438d6a']
for i in ids:assert by[i]['examData']==material[i]
held='f37f2d37-7686-5ed7-9c20-6f83d4fd2254';assert held not in by
put('material-bindings.json',J({'materialPath':str(materialPath.relative_to(R)),'materialSha256':h(materialPath.read_bytes()),'exactRegisteredGoalIds':ids,'everyExamDataObjectDeepEqual':True,'heldHeGoalIdNotRegistered':held,'status':'Author drafts; independent material recheck is separate from source/retained first binding'}))
# Complete goal field paths and full before/after changed values, rather than opaque counts.
def diff(a,b,path=''):
 if type(a)!=type(b):return[{'path':path,'before':a,'after':b}]
 if isinstance(a,dict):
  rows=[]
  for k in sorted(a.keys()|b.keys()):
   p=path+'/'+k
   if k not in a:rows.append({'path':p,'beforeAbsent':True,'after':b[k]})
   elif k not in b:rows.append({'path':p,'before':a[k],'afterAbsent':True})
   else:rows+=diff(a[k],b[k],p)
  return rows
 if a!=b:return[{'path':path,'before':a,'after':b}]
 return[]
rows=[]
for i in sorted(oldby.keys()|by.keys()):
 if i not in oldby:rows.append({'goalId':i,'status':'new-author-definition','completeGoal':by[i]})
 elif i not in by:raise AssertionError('Original definition deleted '+i)
 else:
  d=diff(oldby[i],by[i])
  if d:rows.append({'goalId':i,'title':by[i]['title'],'changes':d})
put('evidence/full-goal-field-differences.json.gz',gzip.compress(J(rows),mtime=0))
# Every retained contract's native coverage/preparation arrays remain in raw evidence.
b=gzread('baseline-structure.native.json.gz');s=gzread('candidate-scope-final.native.json.gz');q=gzread('candidate-final-50scopes.native.json.gz');runtime=read('candidate-v3-authored-global-wiring-final.runtime.json');rr=runtime['nativeAuthoredGlobalCases'];legacy=set(ids[:3]+['875cb53c-b48d-5b2b-8cb0-e20f27534f16'])
assert len(s['views'])==19 and all(not(legacy&set(v['targetGoalIds']))for v in s['views'])
complete=[r for r in rr if r['nativeFinalPlan']['stage']=='COMPLETE'];notOffered=[r for r in rr if r['nativeFinalPlan']['stage']!='COMPLETE'];assert len(complete)==39 and len(notOffered)==12
assert all(r['actualPackageState'] is None and r['serviceFindDefaultViewOwner'] is None for r in rr)
assert all(r['targetIds'] and not(legacy&set(r['targetIds'])) and r['masteryUnchanged'] and r['oldMasteryCount']==25 and r['newOwnExamMasteryUnset'] for r in complete)
summary={'status':'Private implemented and natively checked successor; not source/material/CI approval','sourceBeforeSha256':h((F/INFO).read_bytes()),'sourceCandidateSha256':h((C/INFO).read_bytes()),'sourceGoalsBefore':len(old['goals']),'sourceGoalsCandidate':len(source['goals']),'proposedChangedOrNewFiles':len(changes),'graphBefore':dict(collections.Counter(f['ruleId']for f in b['graph']['findings'])),'graphCandidate':dict(collections.Counter(f['ruleId']for f in s['graph']['findings'])),'authoredViewsActuallyChecked':19,'no875OrHistoricalThreeInAnyAuthoredViewTargets':True,'all24HistoricalCoverageExpansionPreserved':read('old24-full-native-before-after.json')['all24CoverageContractsPreserved'],'coverage14Declared10Absent':True,'projectionScopesActuallyObserved':q['observedScopeCount'],'globalDiscovery':q['globalDiscoveryCounts'],'finalDiscoveryIssues':q['discovery']['discoveryIssues'],'finalRetainedFailingGoalIds':q['discovery']['retainedCoverage']['manifest']['failingGoalIds'],'finalAssessmentRules':[{'id':r['id'],'status':r['status'],'metrics':r['metrics']}for r in q['assessment']],'routeRules':q['route']['rules'],'actualGlobalAuthoredFlow':{'requested':len(rr),'completeNonempty':len(complete),'notOfferedSelection':len(notOffered),'actualRepositoryPackageStateNullAll51':True,'allCompleteHaveNoFourLegacyTargets':True,'all25HistoricalMasteryValuesUnchanged':True,'notOffered':[{'jurisdiction':r['requestedJurisdiction'],'profile':r['requestedProfile'],'planStage':r['nativeFinalPlan']['stage']}for r in notOffered]},'directOwnerProfileFixture':{'contexts':51,'complete':51,'interpretation':'Explicit direct-owner profiles only; not valid global-flow proof'},'directEmptyOwnerCounterexample':{'strictMode':False,'planComplete':True,'identityTargets':288,'unsupportedLegacyStillTargets':True,'owner':'7d51b38c-a149-5407-bddc-d2ce7878b020','separateRuntimeAnalysis':'/dev/shm/informatics-owner-direct-entry-analysis-7vb6e1mj/summary.json'},'held':{'HE2027_28':'material exists but cohort cannot be a timeless universal route; unregistered','BYregularLate':'model hold retained','materialPlaceholders':5,'fourAdditionalDbAbiturNamedAssets':'task prose names material1-4 without complete assets; hold remains even if generic rule misses it','sourceAuthority':'SH basic DB4 fragment introduced, no whole-match canonical target; needsCanonicalGoal','retainedBindings':4,'scopesWithoutExpectedTerminal':42,'scopesWithoutJurisdictionStageAuthority':32,'scopesWithoutDirectOrEffectiveTerminalRoute':49},'CI':'21 test groups pass; production concrete evidence bindings remain empty; actual source still fails four expected retained rows','noActiveWrites':True,'noSourceA84Mutation':True,'noDatabaseWrites':True,'frame':'All21 inputs and1708 frozen files after terminal unchanged; no live code drift; current frozen code plus listed private CI overlay, not V57'}
# Fix counter keys for tools whose finding calls it rule instead.
put('RESULT.json',J(summary))
print(json.dumps({'files':len(list(P.rglob('*'))),'payloadBytes':sum(p.stat().st_size for p in P.rglob('*')if p.is_file()),'source':summary['sourceCandidateSha256'],'graph':summary['graphCandidate']}))
