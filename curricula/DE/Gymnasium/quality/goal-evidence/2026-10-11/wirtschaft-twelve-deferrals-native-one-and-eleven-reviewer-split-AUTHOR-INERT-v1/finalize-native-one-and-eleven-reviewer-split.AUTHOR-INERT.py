"""Seal two native input campaigns with one actual planned reviewer per round."""
from pathlib import Path
import json,hashlib,datetime,subprocess
R=Path.cwd();O=Path(__file__).resolve().parent;D=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-twelve-historical-D-deferrals-current-native-inputbundle-AUTHOR-INERT-v1'
def read(p):return json.loads(Path(p).read_text())
def bind(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R) if p.is_absolute() else p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,a):
 p=O/n
 with p.open('x') as f:f.write(json.dumps(a,ensure_ascii=False,indent=2)+'\n')
 return bind(p)
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
preSeal=read(D/'SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json')
for b in preSeal['artifacts']:assert bind(R/b['path'])==b
shared=read(D/'actual-twelve-whole-current-goals-P24-native-page-bindings-original-findings-and-author-boundaries.INPUT.json');sharedInput=read(D/'native/round-a/description-review-input.json');by={g['goalId']:g for g in sharedInput['goals']};sideBy={g['goalId']:g for g in shared['goals']};base=read(D/'actual-native-full346-base-selected12-pages-and-context.INPUT.json');models=[];goals=[];plans=[];ownChecks=[]
for label,reviewer in [('one-monopoly','/root/economics_final56_current_round_a'),('eleven-other-deferrals','/root/economics_final679_required_gate_plan')]:
 p=O/'native'/label;config=read(O/(label+'.native-batch.config.json'));batch=read(p/'batch-manifest.json');a=read(p/'round-a/description-review-input.json');b=read(p/'round-b/description-review-input.json');model=read(p/'bundle/book-model.json');manifest=read(p/'bundle/manifest.json')
 assert a==b and batch['source']['baseBookDigest']==base['baseModelDigest'] and batch['curriculumAtomicDenominatorAtPreparation']==346
 assert model['source']==base['source'] and config['baseGoalBookConfigPath']==shared['nativeBatchManifest']['source']['baseGoalBookConfigPath'] if 'source' in shared['nativeBatchManifest'] else model['source']==base['source']
 assert config['criteriaPath']==str((D/'description-current12-disclosed-history-and-author-boundaries.criteria.md').relative_to(R))
 assert a['schemaVersion']==3 and [g['goalId'] for g in a['goals']]==config['goalIds']
 for g in a['goals']:
  old=by[g['goalId']]
  for k in ['goalFingerprint','currentTitleDe','currentTitleEn','currentDescriptionDe','currentDescriptionEn','canonicalContext']:assert g[k]==old[k]
  assert g['reviewContext']['evidenceProfile']==old['reviewContext']['evidenceProfile']
  for k in ['title','description','breadcrumbs','chapterIds','visualization','evidenceReview','goalFingerprint']:assert g['reviewContext']['page'][k]==old['reviewContext']['page'][k]
  for rel in ['requires','reverseRequires']:
   nativeIds=set(x['goalId'] for x in g['reviewContext']['page'][rel])|set(x['goalId'] for x in g['reviewContext']['page']['externalPrerequisites' if rel=='requires' else 'externalReverseRequires'])
   originalIds=set(x['goalId'] for x in old['reviewContext']['page'][rel])|set(x['goalId'] for x in old['reviewContext']['page']['externalPrerequisites' if rel=='requires' else 'externalReverseRequires'])
   assert nativeIds==originalIds
  goals.append(g['goalId']);ownChecks.append({'goalId':g['goalId'],'canonicalContextAndGoalFingerprintAndAllFourTextStringsExact':True,'wholeCurrentPRecordAndTwoCasesExact':True,'currentWholeVisualizationAndNativeAssetBindingsExact':True,'actualNativeSubsetPageFingerprint':g['pageFingerprint'],'nativeSubsetReferenceIDsPreserved':True,'originalProblemAndSourceContextPointer':{'artifact':shared['nativeBatchManifest'],'goalId':g['goalId']}})
 for rd in ['round-a','round-b']:assert not list((p/rd/'results').iterdir())
 assert not list((p/'resolutions').iterdir())
 commands=[read(O/(label+'-native-'+mode+'.command-receipt.json')) for mode in ['prepare','check']];assert all(c['exitCode']==0 for c in commands)
 plans.append({'batch':label,'goalCount':len(a['goals']),'goalIds':config['goalIds'],'plannedRoundAReviewer':'/root/economics_common_source_course_independent_c','plannedRoundBReviewer':reviewer,'nativeBatchManifest':bind(p/'batch-manifest.json'),'nativeBundleManifest':bind(p/'bundle/manifest.json'),'nativeBookModel':bind(p/'bundle/book-model.json'),'nativeDescriptionInput':{'roundA':bind(p/'round-a/description-review-input.json'),'roundB':bind(p/'round-b/description-review-input.json')},'schemaVersion':a['schemaVersion'],'bundleFingerprint':a['bundleFingerprint'],'bookDigest':a['bookDigest'],'reviewInputFingerprint':a['reviewInputFingerprint'],'exactNativePrepareAndCheckCommands':commands,'DVerdicts':0})
assert set(goals)==set(by) and len(goals)==12
assert plans[0]['goalIds']==['1826fe19-4d06-5183-9b41-9121ae1cc219'] and len(plans[1]['goalIds'])==11
before=read(O/'before-native-one-and-eleven-current-input-bindings.READONLY.json');changed=[];after=[]
for b in before['bindings']:
 a=bind(R/b['path']);after.append(a)
 if a!=b:changed.append({'before':b,'after':a})
assert not changed,f'Actual active native inputs changed {changed}'
endguard=write('actual-one-and-eleven-native-input-stability-and-shared12-parity.READONLY.json',{'observedAtUtc':now(),'originalTwelveSeal':bind(D/'SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json'),'twelveSealedArtifactsAllExact':True,'before':bind(O/'before-native-one-and-eleven-current-input-bindings.READONLY.json'),'after':after,'changes':changed,'currentRegistryFinalEpoch':bind(R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),'goals':ownChecks,'activeWrites':0})
receipt=write('actual-two-separate-native-one-and-eleven-reviewer-campaigns.AUTHOR-INERT.receipt.json',{'artifactKind':'AUTHOR_INERT_NATIVE_REVIEW_INPUT_SPLIT_NO_D_VERDICT','observedAtUtc':now(),'localHeadAtPreparation':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'nativeBaseGoalBookDigest':base['baseModelDigest'],'currentOrdinaryDenominator':346,'sharedCurrentBookConfigPath':'app/scripts/config/goal-books/de-gym-economics-current-canonical.json','sharedTwelveSourceCriteria':bind(D/'description-current12-disclosed-history-and-author-boundaries.criteria.md'),'sharedOriginalDeferralsWholeCurrentGoalsP24AndSourceBounds':bind(D/'actual-twelve-whole-current-goals-P24-native-page-bindings-original-findings-and-author-boundaries.INPUT.json'),'actual472CurrentSourceContextsAndPartialLimits':bind(D/'actual472-current-source-atom-parent-and-partial-edge-context-parity.READONLY.json'),'campaigns':plans,'nativeInputsAndGoalPPageParityEndguard':endguard,'reviewerAuthorshipBoundary':'RoundB A reviews only1826. This reviewer reviews the remaining11, including7c authored by A. C RoundA reviews all12 via the two native campaigns. No concatenated mixed-reviewer round manifest or synthesized reviewer identity.','historicalKnowledgeDisclosure':'Original historical problem statements and prior shared Source/composition exposure are disclosed; future other current reviewer decisions have not been read.','DDecisionsWritten':0,'currentResultsPresent':False,'strictCompletionsClaimed':0,'automaticAcceptanceClaimed':False,'humanApprovalClaimed':False,'activeWrites':0})
artifacts=[bind(p) for p in sorted(O.rglob('*')) if p.is_file() and not p.is_symlink()];assert not [p for p in O.rglob('*') if p.is_symlink()]
seal=write('SEALED-two-native-one-and-eleven-description-review-input-campaigns.AUTHOR-INERT.json',{'artifactKind':'AUTHOR_INERT_NATIVE_INPUT_ONLY_SEAL','sealedAtUtc':now(),'receipt':receipt,'artifactCount':len(artifacts),'artifacts':artifacts,'predecessor12Seal':bind(D/'SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json'),'descriptionDecisionsWritten':0,'activeWrites':0,'humanApprovalClaimed':False})
print(json.dumps({'seal':seal,'receipt':receipt,'campaigns':[{'batch':x['batch'],'goalCount':x['goalCount'],'bookDigest':x['bookDigest'],'reviewInputFingerprint':x['reviewInputFingerprint']} for x in plans],'artifacts':len(artifacts),'activeInputChanges':len(changed)}))
