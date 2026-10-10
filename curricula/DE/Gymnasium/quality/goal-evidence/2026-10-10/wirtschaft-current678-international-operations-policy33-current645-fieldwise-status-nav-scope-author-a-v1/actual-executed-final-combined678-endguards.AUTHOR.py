from pathlib import Path
import json,hashlib,gzip,copy,os,shutil
from jsonschema import Draft202012Validator
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-international-operations-policy33-current645-fieldwise-status-nav-scope-author-a-v1';V=O/'twentyone-past-author-candidate-review-notes-only-successor-v2';CAP=Path('/tmp/economics-combined678-current645-author-a-path.txt').read_text().strip();CAP=Path(CAP)
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
def native(label):return json.loads(gzip.decompress((O/(label+'.actual-native.json.gz')).read_bytes()))
def metrics(x):return next(r for r in x['route']['rules'] if r['id']=='CQR-104')['metrics']
beforeLabel='own-before645-and33-prospective-unplaced-drafts-author-A';afterLabel='own-after678-combined359-current645-whole-scope-author-A';negLabels=['own-negative-RP-LK-policy-principles-needed-material-refdrop-author-A','own-negative-HE-GK-digital-hidden-whole-closure-access-injection-author-A','own-negative-BY-GK-tariff-existing942-support-drop-author-A'];b=native(beforeLabel);a=native(afterLabel);n,ill,po=[native(label) for label in negLabels];ix=read(V/'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json');v1ix=read(O/'actual-fieldwise678-foreign33-fiveNav359-references-author-index.json');ids=set(ix['newMaterialIds']);assert len(ids)==33
assert (metrics(b)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute'],metrics(b)['uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'])==(174,33)
assert all(metrics(a)[k]==0 for k in ['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute','uniqueVisibleSelectedGoalsMissingDirectTerminalRoute','projectionScopesMissingTerminalAutonomyGoals','wholeMaterialPrerequisiteOccurrencesMissingFromProjection','wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath'])
assert (metrics(n)['visibleSelectedGoalOccurrencesMissingDirectTerminalRoute'],metrics(n)['uniqueVisibleSelectedGoalsMissingDirectTerminalRoute'],metrics(n)['projectionScopesMissingTerminalAutonomyGoals'])==(2,1,1)
assert metrics(ill)['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==6 and metrics(ill)['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==2
assert metrics(po)['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']==metrics(po)['wholeMaterialCoveredGoalOccurrencesWithoutVisiblePrerequisitePath']==4
assert a['compiler']['summary']['errors']==a['compiler']['summary']['warnings']==0 and metrics(a)['visibleProjectedRouteTargetGoalOccurrences']==6974
strip=lambda rows:[{k:[i for i in v if i not in ids] if isinstance(v,list) else v for k,v in r.items()} for r in rows]
assert strip(b['all64NativeScopeSets'])==strip(a['all64NativeScopeSets'])==strip(n['all64NativeScopeSets'])==strip(ill['all64NativeScopeSets'])
pos=strip(a['all64NativeScopeSets']);poneg=strip(po['all64NativeScopeSets']);pd=[]
for x,y in zip(pos,poneg):
 if x!=y:
  assert x['jurisdiction']=='DE-BY' and x['courseProfile']=='GK';changes={k:{'before':v,'after':y[k]} for k,v in x.items() if v!=y[k]};assert set(changes)=={'allSupportAtomicIds','prerequisiteOnlyAtomicIds','ordinarySupport'}
  for change in changes.values():assert set(change['before'])-set(change['after'])=={'94264f00-d0b2-564c-8338-747228390c20'} and not set(change['after'])-set(change['before'])
  pd.append({'viewPath':x['viewPath'],'jurisdiction':x['jurisdiction'],'courseProfile':x['courseProfile'],'actualSupportOnlyDeltas':changes})
assert len(pd)==2
def atomicSource(s):
 t=copy.deepcopy(s);t.pop('rawAtomicGoals')
 for row in t['jurisdictions']:
  for key in ['visibleGoals','visibleClusterGoals','diagnosticPartialOnlyWarnings']:row.pop(key,None)
 return t
assert atomicSource(b['source'])==atomicSource(a['source']);assert a['source']['rawAtomicGoals']-b['source']['rawAtomicGoals']==33;assert a['source']==n['source']==ill['source']==po['source'];assert a['source']['totalJurisdictions']==a['source']['sourceCompleteJurisdictions']==16 and a['source']['sourceAtomicGoals']==2134 and a['source']['unsupportedAssignedAtomicGoals']==a['source']['unmappedSourceAtomicGoals']==0
kind={d['goalId']:d['semanticKind'] for d in read(O/'whole-current645-semantic-kinds.readonly.json')['decisions']};bc={g['goalId']:g for g in b['compiler']['goals']};ac={g['goalId']:g for g in a['compiler']['goals']}
for gid,k in kind.items():
 if k in ['curricularAtomic','memory','orientation']:assert bc[gid]==ac[gid]
matrix=a['whole2112Combined33MaterialContextBindings'];assert len(matrix)==2112 and sum(r['actuallyVisible'] for r in matrix)==718 and all(r['actuallyVisible']==r['actualWholeClosureEligible'] for r in matrix)
held=[r for r in matrix if r['actualCountryEligible'] and r['actualCourseEligible'] and r['actualMissingPrerequisiteIds']];assert len(held)==22 and all(not r['actuallyVisible'] for r in held)
exception=[r for r in matrix if r['actuallyVisible'] and not r['allCoveredOrdinaryTargets']];assert len(exception)==16 and all(r['allCoveredExistingPrerequisiteOnly'] for r in exception)
assert sum(r['materialId']=='306e72b4-5795-5393-accb-bcdb92fdb575' for r in exception)==4
finalCAN=R/ix['wholeAfterCAN']['path'];v1CAN=R/v1ix['wholeAfterCAN']['path'];base=read(R/ix['wholeBeforeCAN']['path']);whole=read(finalCAN);v1=read(v1CAN);assert len(whole['goals'])==678 and bind(finalCAN)['sha256']=='237c9bfd2730d916e5e1a453eeb0822113a8a48d2391f8e721c6e693edc6f452';changedNoteIds={d['goalId'] for d in ix['actual21ReviewNotePastTemporalOnlyDeltas']};assert len(changedNoteIds)==21
for x,y in zip(v1['goals'],whole['goals']):
 z=copy.deepcopy(y)
 if y['id'] in changedNoteIds:z['examData']['reviewNote']=x['examData']['reviewNote']
 assert z==x
fm={g['id']:g for g in whole['goals']};navRows=read(R/ix['fiveWholeNavDeltas']['path']);navids={r['goalId'] for r in navRows};assert len(navids)==5
for g in base['goals']:
 if g['id'] not in navids:assert fm[g['id']]==g
for nav in navRows:
 assert nav['wholeAfter']['contains'][:len(nav['wholeBefore']['contains'])]==nav['wholeBefore']['contains'];assert len(nav['wholeAfter']['contains'])==len(set(nav['wholeAfter']['contains']))
 union=sorted({j for child in nav['wholeAfter']['contains'] for j in ac[child]['compiledApplicability'].get('jurisdiction',[])});assert union==sorted(ac[nav['goalId']]['compiledApplicability']['jurisdiction'])
 if nav['actualDerivedJurisdictionChange']:assert nav['phase']=='Q4' and set(nav['wholeAfter']['applicability']['jurisdiction'])-set(nav['wholeBefore']['applicability']['jurisdiction'])=={'DE-HB'}
assert sum(nav['actualDerivedJurisdictionChange'] for nav in navRows)==1
schema=Draft202012Validator(read(R/'docs/landscape-runtime.schema.json'));errs=list(schema.iter_errors(whole));assert not errs
vs=Draft202012Validator(read(R/'contracts/curriculum-package/v1/composition-view.schema.json'));viewErrors=[];oldErrors=[];allCross=0
for row in ix['viewRows']:
 p=R/row['candidate']['path'];oldp=R/row['before']['path'];cp=CAP/row['activePath'];assert cp.resolve().is_relative_to(CAP.resolve()) and not cp.is_symlink() and not os.path.samefile(cp,R/row['activePath']);assert cp.read_bytes()==p.read_bytes();old=read(oldp);new=read(p)
 if row['newReferenceCount']:
  restored=copy.deepcopy(new);restored['viewId']=old['viewId'];restored['rootNodes'][0]['children']=restored['rootNodes'][0]['children'][:len(old['rootNodes'][0]['children'])];assert restored==old;assert len(row['newMaterialIds'])==len(set(row['newMaterialIds']))==row['newReferenceCount']
 else:assert old==new
 for output,obj in [(viewErrors,new),(oldErrors,old)]:output.extend({'activePath':row['activePath'],'path':list(e.path),'message':e.message} for e in vs.iter_errors(obj))
 if new['scope']['stage']=='CrossStage':assert not list(vs.iter_errors(new));allCross+=1
assert allCross==34 and viewErrors==oldErrors and len(viewErrors)==3 and all(e['activePath'].endswith('de-de-gym-seki-economics.view.json') for e in viewErrors)
assert sum(r['newReferenceCount'] for r in ix['viewRows'])==359 and all(r['newReferenceCount']==0 for r in ix['viewRows'] if r['activePath'].split('/')[-1].startswith('de-de-'))
start=read(O/'actual-current645-private-physical-start-and-unplaced33-science-pending-author-intake.json')
for row in start['actualMutableCurrentInputs']:assert bind(R/row['path'])==row
for row in start['source34WholeBytesMatchPreviousQualifiedFrame']:assert bind(R/row['path'])==row
memory=[]
for row in start['previousMemoryCardsScienceByteReuseOnly']:
 assert all(bind(R/row['path'])[k]==row[k] for k in ['path','sha256','bytes']);memory.append(row)
assert len([r for r in memory if '/memory-decks/' in r['path']])==10 and sum(len(read(R/r['path'])['cards']) for r in memory if '/memory-decks/' in r['path'])==66
reg=read(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');econ=next(s for s in reg['subjects'] if s['subject']=='wirtschaftswissenschaften');profiles={};profileBindings=[]
for p in econ['positiveEvidenceConfigPaths']:
 cfg=read(R/p);rp=R/cfg['reviewPath'];profileBindings+=[bind(R/p),bind(rp)]
 for line in rp.read_text().splitlines():
  if line.strip():
   z=json.loads(line);assert z['goalId'] not in profiles;profiles[z['goalId']]=z
assert len(profiles)==336 and sum(len(p['profile']['applicationCaseBriefs']) for p in profiles.values())==685
contracts=[{'wholeCurrentGoal':fm[g['requires'][0]],'wholeOriginalPRecord':profiles[g['requires'][0]],'sourceMaterialId':g['id'],'wholeCurrentCompilerSourceContext':ac[g['requires'][0]]} for g in read(R/ix['wholeForeign33StatusOnlyBodies']['path'])];assert len({r['wholeCurrentGoal']['id'] for r in contracts})==33 and sum(len(r['wholeOriginalPRecord']['profile']['applicationCaseBriefs']) for r in contracts)==66
assert (CAP/econ['landscapePath']).read_bytes()==finalCAN.read_bytes();privateSEM=read(V/'whole-conditional678-SEM.only21-note-FP-followers.PRIVATE-native-only-INERT-v2.json');originalSEM=read(O/'whole-current645-semantic-kinds.readonly.json');changedFP=navids|changedNoteIds
for old in originalSEM['decisions']:
 current=next(d for d in privateSEM['decisions'] if d['goalId']==old['goalId'])
 if old['goalId'] not in navids:assert current==old
assert len(privateSEM['decisions'])==678 and privateSEM['counts']['curricularAtomic']==336
commands=read(O/'actual-three-executed-genuine-combined678-scope-negative-command-and-restoration-records.AUTHOR.json');assert len(commands['actualThreeRuns'])==3 and all(r['actualExitCode']==0 for r in commands['actualThreeRuns'])
check=save('actual-final-four-owned-combined678-scope-frames-note-only-reuse-and-current645-endguards.AUTHOR.json',{'role':'AUTHOR_SCOPE_NATIVE_PENDING_FOREIGN_ROOT_KEEP','actualFourNativeFrames':4,'actualFreshOwn645BaselineSource16_2134CQR104174_33':True,'actualOwn678WholeCompiler0Errors0Warnings':True,'actualOwnAfterMissing0Goals0Expected0Closure0Coverage0':True,'actualNetLocalRouteRepair174':174,'actualWholeContractLocalRouteClosure33':33,'actualNewStrictCurricularAtomicClosure':0,'actualHistoricalEvidenceBindingRestoration':0,'actualExecutedNativeV1WholeCAN':bind(v1CAN),'actualFinalV2WholeCAN':bind(finalCAN),'actualOnly21ReviewNoteChronologyDifferenceScopeReuse':ix['actual21ReviewNotePastTemporalOnlyDeltas'],'actualNoNativeV2ScopeRerunClaim':True,'actualNative21PracticeSourceFPOnlyFollowerAll678Match':True,'conditionalNativeSEMSeparateFromActualV17TechnicalBinding':bind(V/'whole-conditional678-SEM.only21-note-FP-followers.PRIVATE-native-only-INERT-v2.json'),'actualRpLkRefdrop2Missing1GoalExpected1':True,'actualIllegalHeGkDigital6MissingClosure2Coverage':True,'actualByGkExisting942Drop4Closure4Coverage':True,'actualByGkOnlyTwoOldSupportScopeDeltas':pd,'positiveWhole64OldOrdinarySupportPOnlyMemoryOrientationProjectionSetsExact':True,'actual6974OrdinaryTargetOccurrencesExact':True,'all336CurricularAtomic10Memory1OrientationCompilerWholeRowsExact':True,'actualWhole33CurrentGoalContractsAnd66OriginalCases':contracts,'whole43CurrentPositiveConfigAndReviewBindings':profileBindings,'wholeOriginal336Profiles685CasesUnchanged':True,'actualSource16Jurisdictions2134SourceAtomsWholeExactPartialClaimsUnchanged':True,'actualSourceRawPlus33PracticeOnly':True,'actual2112WholeMaterialContextMatrix':matrix,'actual718VisibleWholeBindings359CountryAnd359NationalContextsViaExistingSubtrees':True,'actual359NewCountryRefsNoNationalRefs':True,'actual22SourceCourseEligibleButWholeClosureMissingContextsHeld':held,'actual16AuthorisedPracticeTargetsOverExistingPOnlyContexts':exception,'POnlyRawRoleTruth':'These are 8 country plus8 national runtime contexts over previously existing support-only competencies. They are not16 new prerequisiteOnly references; national raw ordinary references can be target before authority-country intersection. No new ordinary/support/foundation reference was authored.','actualFiveNavChildUnionsAndQ4OnlyHBChangeQualifiedAuthorCandidate':True,'actual34CrossStageViewSchemaErrors0':True,'untouchedOldSekIThreeHeaderErrorsIdenticalBeforeAfter':viewErrors,'actualRuntime678SchemaErrors0':True,'actual35ViewsAndCurrentFinalPrivateCANRestoredAfterNegatives':True,'actual124CurrentActiveEndguards':start['actualMutableCurrentInputs'],'actual34CurrentSourceInputByteGuards':start['source34WholeBytesMatchPreviousQualifiedFrame'],'actualMemoryDecisionsAnd10Deck66CardBytesUnchanged':memory,'actualNoNewCardOrHistoricalMaterialScienceClaim':True,'activeWrites':0,'ownScopeKEEP':False,'M4M6M7Claim':False,'humanApproval':False})
for src,name in [(CAP/'app/scripts/internationalOperationsPolicy33Current645Combined678ScopeAuthorA.mts','actual-executed-combined678-native-scope-observer.AUTHOR.mts'),(CAP/'app/scripts/internationalOperationsPolicy33Current645Conditional678SEMPrivateAuthorA.mts','actual-executed-private-conditional678-native-kind-adapter.AUTHOR.mts'),(CAP/'app/scripts/internationalOperationsPolicy33Current645Conditional678NoteSourceFPOnlyAuthorA.mts','actual-executed-private21-note-semantic-sourceFP-only-follower.AUTHOR.mts'),(Path('/tmp/economics-combined678-final-current645-author-a.py'),'actual-executed-final-combined678-endguards.AUTHOR.py')]:assert not(O/name).exists();shutil.copyfile(src,O/name)
manifest=save('actual-final-current678-combined359-whole-author-manifest.json',{'role':'IMMUTABLE_AUTHOR_WHOLE_INPUTS_BEFORE_FINAL_HANDOFF','files':[bind(p) for p in sorted(O.rglob('*')) if p.is_file()]})
handoff=save('actual-final-current678-international-operations-policy33-fiveNav359-accesses718-current645.AUTHOR-handoff.json',{'role':'AUTHOR_ONLY_READY_FOR_INDEPENDENT_ROOT_COMBINED_SCOPE_AND_MAIN_NAV_STATUS_REVIEW','wholeBeforeCAN':ix['wholeBeforeCAN'],'wholeFinalAfterCAN':ix['wholeAfterCAN'],'wholeFinalForeign33StatusOnlyBodies':ix['wholeForeign33StatusOnlyBodies'],'wholeFirstV1CANActualFourNativeFrames':v1ix['wholeAfterCAN'],'wholeV2Only21PastReviewNotesDeltaIndex':bind(V/'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json'),'wholeFiveNavFieldDeltas':ix['fiveWholeNavDeltas'],'all35WholeBeforeAfterViewRows':ix['viewRows'],'wholeFinalReferenceAndContextIndex':bind(V/'actual-final-fieldwise678-V2-21note-only-full-before-after-binding-index.AUTHOR.json'),'internationalScienceReceipt':ix['internationalScienceReceipt'],'operationsScienceReceipt':ix['operationsScienceReceipt'],'policyScienceReceipt':ix['policyScienceReceipt'],'immutableSeparateIntl12AuthorHandoff':ix['internationalAuthorHandoff'],'actual33NewMaterialIDs':ix['newMaterialIds'],'actual33OriginalContracts66Cases336Profiles685TotalUnchanged':True,'actualNetRoutes174AndLocalWholeContractClosures33':True,'actualMissingLocalRoutesAndIDsAfter0_0':True,'actualWholeVisibleMaterialContextBindings718':718,'actual359CountryReferencesAnd0NationalReferences':True,'actual22WholeClosureContextsHeld':True,'actual16ExistingPOnlyPracticeContexts8CountryPlus8NationalNoNewPOnlyRefs':True,'actualOwnFourNativeScopeFramesSourceMemoryPAndSchemaEndguards':check,'actualThreeGenuineNegatives':bind(O/'actual-three-executed-genuine-combined678-scope-negative-command-and-restoration-records.AUTHOR.json'),'currentPrivatePhysicalCAP':str(CAP),'nativeHelper':'app/scripts/internationalOperationsPolicy33Current645Combined678ScopeAuthorA.mts','nativeArgs':'CAP OUT ROOT LABEL','nativeNode':'/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node','actualFinalV2ScopeReuseOnly21AdministrativeNoteHistoryFieldsNotFullRerun':True,'conditionalSEMIsNativeAdapterNotActualV17TechnicalKEEP':True,'portableWholeManifest':manifest,'actualStrictNewClosures':0,'historicalBindingsRestored':0,'SourceOrdinarySupportMemoryFoundationRoleWidening':False,'imagesRuntimePrivacyOtherSubjectsTouched':False,'ownIndependentScienceOrScopeKEEP':False,'M4M6M7ReachedClaim':False,'humanReviewReleaseTrialClaim':False,'activeWrites':0,'nextRequiredSteps':'Independent Root complete combined scope and Main bounded Nav/status/semantics review; B actual current678 SEM/P43/book technical bindings; then Root integration, bundled required current reports, dependent Layer-A checks and protected floors.'})
print(json.dumps({'handoff':handoff,'CAN':bind(finalCAN),'actualScopeBefore174_33After0_0':True,'refs359':True,'contexts718':True,'schema678Errors':len(errs),'active645InputGuardsPASS':True}))
