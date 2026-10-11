from pathlib import Path
import json,hashlib,datetime,subprocess
R=Path(__file__).resolve().parent;ROOT=R.parents[6]
base=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11'
O=base/'wirtschaft-twelve-deferrals-native-one-and-eleven-reviewer-split-AUTHOR-INERT-v1'
D=base/'wirtschaft-twelve-historical-D-deferrals-current-native-inputbundle-AUTHOR-INERT-v1'
S=base/'wirtschaft-twelve-historical-D-deferrals-current-contract-author-and-source-scope-READONLY-v1'
def binding(p):
 b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(name,x):
 p=R/name;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return p
seals=[O/'SEALED-two-native-one-and-eleven-description-review-input-campaigns.AUTHOR-INERT.json',D/'SEALED-twelve-current-native-description-inputs-and-original-deferral-context.AUTHOR-INERT.json']
prior=[]
for p in seals:
 x=json.loads(p.read_text());checks=[]
 for b in x['artifacts']:
  assert binding(ROOT/b['path'])==b,b;checks.append(b)
 prior.append({'seal':binding(p),'allArtifactBytesExact':True,'artifactCount':len(checks)})
before=json.loads((O/'before-native-one-and-eleven-current-input-bindings.READONLY.json').read_text())['bindings']
for b in before:assert binding(ROOT/b['path'])==b,b
cp=json.loads((O/'native/eleven-other-deferrals/round-b/description-review-campaign.json').read_text());batch=cp['batches'][0]['batchId']
runp=R/'results'/(batch+'.run.json');recordp=R/'results'/(batch+'.records.jsonl');run=json.loads(runp.read_text());records=[json.loads(s)for s in recordp.read_text().splitlines()]
assert len(records)==11 and all(r['decision']=='keep' and r['reviewAuthority']=='ai_candidate'and r['recordStatus']=='candidate'for r in records)
assert not any(r['goalId'].startswith('1826')for r in records)
assert run['outputDigest']=='sha256:'+binding(recordp)['sha256']
commands=[]
for label in ['batch','campaign-results']:
 p=R/(label+'.actual-command-receipt.READONLY.json');x=json.loads(p.read_text());assert x['exitCode']==0
 assert binding(ROOT/x['stdoutPath'])['sha256']==x['stdoutSha256'];assert binding(ROOT/x['scriptPath'])['sha256']==x['scriptSha256'];commands.append(binding(p))
observed=datetime.datetime.now(datetime.timezone.utc).isoformat();head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
receipt=save('actual-independent-eleven-current-deferrals-round-b-native-valid-candidate-only.READONLY.receipt.json',{
 'artifactKind':'INDEPENDENT_DESCRIPTION_ROUND_B_REVIEW_CANDIDATES_ONLY',
 'observedAtUtc':observed,'reviewInputEpochHead':'43461b906438572f4f3b64d056112f4189dca4f4','currentHeadAtEndguard':head,
 'headChangeHandling':'Any archive/documentation-only integration is context only; all622 actual review-input/code/science bindings were checked exactly. This receipt never turns a changed Git HEAD into a fictitious science refresh.',
 'reviewer':'/root/economics_final679_required_gate_plan','provider':run['provider'],'model':run['model'],'reviewStartedAt':run['startedAt'],'reviewCompletedAt':run['completedAt'],
 'exactModelOrSamplingParametersInvented':False,'otherCurrentRoundResultsRead':False,
 'historyExposure':'Original deferral statements and earlier disclosed technical/source/composition authorship are known. Blindness is only to current other reviewer runs. Own1826 excluded; currentRoot7/A7c descriptions not authored by this reviewer.',
 'goalIds':run['goalIds'],'excludedOwnAuthoredGoal':'1826fe19-4d06-5183-9b41-9121ae1cc219',
 'wholeDEENGoalCount':11,'wholeCurrentPCaseCount':22,'sourceAssignmentContextCount':464,
 'sourceContextArtifact':binding(S/'actual-twelve-current-source-edges-atoms-parents-and-partial-boundaries.READONLY.json'),
 'sourceReviewBoundary':'All relevant current sourceText clauses/partial bounds used as context. No renewed whole464-extraction fidelity, historic source-union coverage or country/course approval is claimed. Exact source artifacts bind the context; they are not scientific proof by hash alone.',
 'ownIndividualDecisionCounts':{'keep':11,'revise':0,'split_review':0,'block':0},'individualUnresolvedDDescriptionFindings':[],
 'ownScienceEvidence':binding(R/'actual-eleven-individual-complete-case-answers-counterexamples-and-scope-boundaries.INDEPENDENT.json'),
 'nativeFormat':{'inputSchemaVersion':3,'recordSchemaVersion':1,'runManifestSchemaVersion':1,'formatOrigin':'Actual unchanged repository-native schemas; no fabricated v3 output format.'},
 'nativeInputBundleSeal':prior[0],'sharedTwelveInputBundleSeal':prior[1],
 'run':binding(runp),'records':binding(recordp),'commands':commands,'nativeBatchValidation':'PASS11','nativeCampaignResultsValidation':'PASS11',
 'all622InputBindingsWholeExact':True,'sourceAndRuntimeCheckerMutations':0,'activeWrites':0,
 'humanApprovalClaimed':False,'learnerPerformanceClaimed':False,'newPOrVApprovalClaimed':False,'wholeSubjectM7OrStrictCompletionClaimed':False,
 'inertOnly':True,'modelVotesGrantReleaseAuthority':False,
 'nextIntegrationAuthority':'Parent reviews independent rounds and actual native finalization separately. No ledger or registry changed by this reviewer.'})
arts=[binding(p)for p in sorted(R.rglob('*'))if p.is_file()]
assert not any(p.is_symlink()for p in R.rglob('*'))
seal=save('SEALED-eleven-current-description-round-b-independent-native-candidates-only.READONLY.json',{'artifactKind':'INDEPENDENT_READONLY_REVIEW_SEAL_NO_RELEASE_AUTHORITY','sealedAtUtc':observed,'receipt':binding(receipt),'artifactCount':len(arts),'artifacts':arts,'inputEpochHead':'43461b906438572f4f3b64d056112f4189dca4f4','currentHeadAtSeal':head,'activeWrites':0,'otherCurrentRoundResultsRead':False,'humanApprovalClaimed':False,'newM7CompletionClaimed':False})
print(json.dumps({'seal':binding(seal),'receipt':binding(receipt),'artifactCount':len(arts),'nativePass':'11 batch +11 campaign','goals':11,'ownCases':22,'endguard622':'exact','headAtSeal':head},ensure_ascii=False))
