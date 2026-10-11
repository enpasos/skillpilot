"""Bind native preparation inputs and original problem statements; never write D verdicts."""
from pathlib import Path
import json,hashlib,datetime,subprocess
ROOT=Path.cwd();O=Path(__file__).resolve().parent
S=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-historical-D-deferrals-current-contract-author-and-source-scope-READONLY-v1'
def read(p):return json.loads(Path(p).read_text())
def binding(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(ROOT) if p.is_absolute() else p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,a):
 p=O/n
 assert not (O/'SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json').exists(), 'Never rewrite a sealed input bundle'
 with p.open('w') as f:f.write(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
 return binding(p)
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
cfg=read(O/'twelve-current-deferrals.native-batch.config.json');ids=cfg['goalIds'];base=read(O/'actual-native-full346-base-selected12-pages-and-context.INPUT.json');batch=read(O/'native/batch-manifest.json');ai=read(O/'native/round-a/description-review-input.json');bi=read(O/'native/round-b/description-review-input.json');model=read(O/'native/bundle/book-model.json')
assert ai==bi and ai['goalCount']==12 and base['book']['pageCount']==346
assert batch['source']['baseBookDigest']==base['baseModelDigest']
assert [g['goalId'] for g in ai['goals']]==ids
assert model['source']==base['source']
old=read(S/'actual-twelve-original-deferrals-current-whole-contracts-P-and-authorship.READONLY.json'); oldby={g['goalId']:g for g in old['goals']};sources=read(S/'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json')
canpath=base['source']['landscapePath'];can=read(ROOT/canpath);goalby={g['id']:g for g in can['goals']};nativeby={g['goalId']:g for g in ai['goals']};baseby={g['goalId']:g for g in base['pages']}
regpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';reg=read(ROOT/regpath);econ=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften')
currentP={}
for p in econ['positiveEvidenceConfigPaths']:
 pc=read(ROOT/p);matched=set(ids).intersection(pc.get('scope',{}).get('goalIds',[]))
 if not matched:continue
 for lineNum,line in enumerate((ROOT/pc['reviewPath']).read_text().splitlines(),1):
  if not line.strip():continue
  r=json.loads(line)
  if r['goalId'] in matched:
   assert r['goalId'] not in currentP
   currentP[r['goalId']]={'configPath':p,'recordPath':pc['reviewPath'],'recordLine':lineNum,'wholeRecord':r,'wholeConfig':pc}
assert set(currentP)==set(ids)
# All source clauses below are the already scoped current public source bytes. No new source verdict is inferred.
sourceCache={};mappingCache={};sourceChecks=[]
for gid,contexts in sources['goalSourceContexts'].items():
 for row in contexts:
  sp=row['sourceExtractionPath'];mp=row['mappingPath']
  src=sourceCache.setdefault(sp,read(ROOT/sp));mapping=mappingCache.setdefault(mp,read(ROOT/mp))
  atom=next(g for g in src['sourceGoals'] if g['id']==row['wholeCurrentSourceAtom']['id'])
  assert atom==row['wholeCurrentSourceAtom'],f'Changed actual source atom {atom["id"]}'
  parent=next((p for p in src['passages'] if p.get('id',p.get('passageId'))==atom.get('passageId')),None)
  assert parent==row['wholeCurrentParent'],f'Changed actual parent {atom["id"]}'
  assert row['edge'] in mapping['mappings'],f'Missing edge {atom["id"]}'
  assert row['wholeMappingDecision'] in mapping['decisions'],f'Changed decision {atom["id"]}'
  sourceChecks.append({'goalId':gid,'sourceGoalId':atom['id'],'mappingPath':mp,'matchType':row['edge']['matchType'],'wholeAtomAndParentAndEdgeAndDecisionExactToSealedScoping':True})
assert len(sourceChecks)==472
sourceBindings=[binding(ROOT/p) for p in sorted(set(sourceCache)|set(mappingCache))]
rows=[];caseCount=0
for gid in ids:
 g=goalby[gid];h=oldby[gid];n=nativeby[gid];p=currentP[gid];record=p['wholeRecord'];profile=record['profile'];cases=profile.get('applicationCaseBriefs',[])
 assert n['reviewContext']['evidenceProfile']==record
 assert profile==h['currentPositiveRecord']['wholeRecord']['profile']
 assert cases==h['actualApplicationCases'] and len(cases)==2
 for f,nf in [('title','currentTitleDe'),('titleEn','currentTitleEn'),('description','currentDescriptionDe'),('descriptionEn','currentDescriptionEn')]:assert g[f]==n[nf]
 assert n['reviewContext']['page']==next(x for x in model['pages'] if x['goalId']==gid)
 oldG=h['wholeHistoricalGoal'];fields=sorted(set(oldG)|set(g));deltas=[{'field':f,'before':oldG.get(f),'current':g.get(f)} for f in fields if oldG.get(f)!=g.get(f)]
 contractFields=['title','titleEn','description','descriptionEn','requires','contains','tags','dimensionTags']
 assert all(g.get(f)==h['wholeCurrentGoal'].get(f) for f in contractFields)
 allocation={'roundAReviewer':'/root/economics_common_source_course_independent_c','roundBReviewer':'/root/economics_final56_current_round_a' if gid=='1826fe19-4d06-5183-9b41-9121ae1cc219' else '/root/economics_final679_required_gate_plan','currentGoalAuthor':h['authorship']['goalContractAuthor'],'currentGoalAndPAuthorExcludedFromOwnDReview':True,'priorOriginalProblemAndSharedCompositionExposureDisclosed':True,'futureOtherCurrentRoundResultsMayBeRead':False}
 rows.append({'goalId':gid,'originalDeferral':h['historicalDeferral'],'wholeHistoricalGoal':oldG,'wholeCurrentGoal':g,'actualOriginalToCurrentFieldDeltas':deltas,'currentNativeDescriptionBindings':{k:n[k] for k in ['goalFingerprint','pageFingerprint','canonicalContext']},'wholeCurrentNativeBasePage':baseby[gid],'wholeCurrentNativeSubsetPage':n['reviewContext']['page'],'currentNativePRecordAndConfig':p,'wholeActualApplicationCases':cases,'currentRequiresWholeGoals':[goalby[x] for x in g.get('requires',[])],'authorship':h['authorship'],'plannedIndependentGoalReviewAllocation':allocation,'originalCurrentSourceContextArtifact':binding(S/'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json'),'directCurrentSourceEdgeCount':len(sources['goalSourceContexts'][gid]),'DDecision':None,'humanApproval':False})
 caseCount+=len(cases)
sidecar=write('actual-twelve-whole-current-goals-P24-native-page-bindings-original-findings-and-author-boundaries.INPUT.json',{'artifactKind':'AUTHOR_INERT_NATIVE_BOUND_CURRENT_DESCRIPTION_INPUT_NO_D_VERDICT','observedAtUtc':now(),'goalIds':ids,'currentCanonicalBinding':binding(ROOT/canpath),'currentRegistryBindingAtFinalization':binding(ROOT/regpath),'nativeBatchManifest':binding(O/'native/batch-manifest.json'),'originalScopingSeal':binding(S/'SEALED-twelve-historical-D-deferrals-current-contract-P-source-and-authorship.SCOPING.READONLY.json'),'sourceBoundaryPolicy':sources['scientificLimits'],'goals':rows,'actualPCaseCount':caseCount,'newDDecisions':0,'sourceCurricularFullCoverageClaim':False})
sourceReceipt=write('actual472-current-source-atom-parent-and-partial-edge-context-parity.READONLY.json',{'artifactKind':'TECHNICAL_PARITY_OF_ALREADY_SCOPED_SOURCE_CONTEXTS_NOT_NEW_SCIENCE','sourceContextArtifact':binding(S/'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json'),'actualSourceMappingFiles':len(mappingCache),'actualDirectSourceAssignments':len(sourceChecks),'allCurrentWholeScopedObjectsExact':True,'actualCurrentSourceAndMappingFileBindings':sourceBindings,'checks':sourceChecks,'limits':sources['scientificLimits']})
before=read(O/'inputs-before-native-preparation.bindings.json');changes=[];after=[]
for b in before['bindings']:
 a=binding(ROOT/b['path']);after.append(a)
 if a!=b:changes.append({'before':b,'after':a})
assert all(x['before']['path']==regpath for x in changes),f'Unexpected native input changes {changes}'
# The only observed registry movement is Root's separate P44/P45 non-deferral pointer successor.
book=read(ROOT/cfg['baseGoalBookConfigPath']);assert book['landscapePath']==canpath
for p in before['selectedCurrentPositiveConfigPaths']:assert p in econ['positiveEvidenceConfigPaths']
assert all(binding(ROOT/p['configPath']) in after for p in currentP.values())
inputReceipt=write('actual-native-input-before-after-and-final-registry-epoch.READONLY.json',{'observedAtUtc':now(),'beforeSnapshot':binding(O/'inputs-before-native-preparation.bindings.json'),'afterBindings':after,'actualObservedChanges':changes,'explainedRegistryFollower':'Root09 P44/P45 reviewed-resource fingerprint pointer followers concern seven non-deferral new goals; all seven selected D12 P configs and the combined15 Book input remained byte exact','actualSelectedDeferralPConfigs':before['selectedCurrentPositiveConfigPaths'],'currentNativeBaseModelDigest':base['baseModelDigest'],'nativePreparedBaseDigestExact':True,'currentNativeSubsetDigest':model['digest'],'nativeReviewInputFingerprint':ai['reviewInputFingerprint'],'activeWrites':0,'DDecisions':0})
# The native prepare/check command receipts retain exact failures as history; the initial .ts launch failed before reading inputs, then .mts succeeded.
commands=[read(O/(n+'.command-receipt.json')) for n in ['01-native-current-full346-base-context','01b-native-current-full346-base-context','02-native-twelve-deferrals-prepare','03-native-twelve-deferrals-check']]
assert [x['exitCode'] for x in commands]==[1,0,0,0]
assert not any(any((O/'native'/r/'results').iterdir()) for r in ['round-a','round-b'])
assert not list((O/'native/resolutions').iterdir())
receipt=write('actual-twelve-native-bound-description-inputbundle.AUTHOR-INERT.receipt.json',{'artifactKind':'AUTHOR_INERT_INPUT_PREPARATION_ONLY_NO_D_VERDICT','observedAtUtc':now(),'headAtFinalization':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'nativeFunctionsUnmodified':['loadGoalBookBuildInputs','prepareGoalDescriptionRolloutBatch','validatePreparedGoalDescriptionRolloutBatch','buildGoalBookReviewBundle','buildGoalDescriptionReviewInput'],'actualGoalIds':ids,'goalCount':12,'currentEligibleOrdinaryBasePages':346,'actualWholePProfiles':12,'actualWholeBilingualPCaseBriefs':24,'descriptionPilotInputSchemaVersion':ai['schemaVersion'],'descriptionPilotInputSchema':ai['$schema'],'nativeBatchManifest':batch,'nativeChecks':[{'label':c['label'],'exitCode':c['exitCode'],'rawLog':c['rawLog']} for c in commands],'initialWrapperFormatFailure':'The initial own .ts wrapper was interpreted as CJS and rejected top-level await before any native call. The unchanged own wrapper in .mts succeeded; failed command/log are retained. Active source bytes were never changed.','wholeCurrentGoalPOriginalFindingAndContextSidecar':sidecar,'sourceContextParityReceipt':sourceReceipt,'sourceFullScienceApprovalClaim':False,'nativeInputEndguardReceipt':inputReceipt,'plannedRoundA':'C: all twelve','plannedRoundB':'This reviewer: eleven except1826; A:1826 only; A excludes self-authored7c','blindnessLimits':'Original historic deferral problem statements and disclosed author/composition exposure are supplied. No future or other current Round A/B decisions were read; no broader blind-history claim.','futureReviewResultsPresent':False,'descriptionVerdictsWritten':0,'strictCompletionsClaimed':0,'activeWrites':0,'humanApprovalClaimed':False})
artifacts=[binding(p) for p in sorted(O.rglob('*')) if p.is_file() and not p.is_symlink()]
symlinks=[str(p.relative_to(ROOT)) for p in O.rglob('*') if p.is_symlink()];assert not symlinks
seal=write('SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json',{'artifactKind':'AUTHOR_INERT_INPUT_BUNDLE_SEAL_NO_D_VERDICT','sealedAtUtc':now(),'receipt':receipt,'artifactCount':len(artifacts),'artifacts':artifacts,'symlinks':[],'newRoundResultsRead':False,'newDDecisions':0,'newStrictCompletionClaims':0,'activeWrites':0,'humanApprovalClaimed':False})
print(json.dumps({'seal':seal,'receipt':receipt,'nativeInputFingerprint':ai['reviewInputFingerprint'],'baseDigest':base['baseModelDigest'],'subsetDigest':model['digest'],'sourceAssignments':len(sourceChecks),'goalCount':len(ids),'PCaseCount':caseCount,'registryOnlyChanges':len(changes),'artifacts':len(artifacts)}))
