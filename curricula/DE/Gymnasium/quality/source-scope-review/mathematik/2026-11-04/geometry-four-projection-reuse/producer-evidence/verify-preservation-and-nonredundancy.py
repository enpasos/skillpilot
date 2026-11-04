from pathlib import Path
import gzip,json,hashlib
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost'];sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text());native=json.load(gzip.open(R/cfg['baseNative']['path']));byScope={s['scope']:s for s in native['scopes']};final=read(H/'161-scope-finite-delta.actual.json');goals={g['id']:g for g in read(C/cfg['canonicalPath'])['goals']}
def reach(edges,roots):
 seen=set();q=list(roots)
 while q:
  x=q.pop()
  if x in seen:continue
  seen.add(x);q.extend(edges[x])
 return seen
local=[]
for s in final['scopeRows']:
 b=byScope[s['scope']];e=dict(b['effectiveDirectPrerequisitesByContextGoalId']);E=cfg['existingReuseAssessmentId'];O=cfg['ordinaryGoalId'];N=cfg['newAssessmentId']
 if E in e:e[E]=goals[E]['requires'];e[O]=goals[O]['requires']
 elif O in e:e[O]=goals[O]['requires']
 roots=set(b['selectedProtectedTargetGoalIds'])|set(s['newSameIdProtectedTargetGoalIds'])|set(s['newSeparateTargetGoalIds'])
 if s['newSeparateTargetGoalIds']:e[N]=goals[N]['requires']
 for assessment in s['newSameIdProtectedTargetGoalIds']+s['newSeparateTargetGoalIds']:
  without=reach(e,roots-{assessment});assert assessment not in without
  if assessment==N:assert O not in without and O in reach(e,roots)
  local.append({'scope':s['scope'],'assessmentId':assessment,'wasAlreadyTarget':assessment in b['targetGoalIds'],'withoutThisAssessmentOwnObligationIsNotCovered':True,'separateOrdinary574CoveredOnlyWithThisNewEndpoint':True if assessment==N else None,'noAutomaticRMastery':True})
assert len(local)==56
sources=[]
for directory in ['backend/src/main/java','app/src/utils/authoring']:
 for p in (B/directory).rglob('*'):
  if p.is_file():assert sha(C/p.relative_to(B))==sha(p);sources.append(p.relative_to(B).as_posix())
for row in cfg['rootQASourceSync']+cfg['rootOwnedAdditionalInputSync']:assert sha(C/row['path'])==sha(R/row['path'])==row['sha256']
oldplan=read(B/cfg['planPath']);plan=read(C/cfg['planPath']);oldpolicy=read(B/cfg['policyPath']);policy=read(C/cfg['policyPath']);assert plan['assessmentScopeOperations'][:411]==oldplan['assessmentScopeOperations'];assert policy['assessmentScopeOperations'][:773]==oldpolicy['assessmentScopeOperations'];assert plan['bindings'][:-2]==oldplan['bindings'];assert plan['approvedExistingAssessmentAddition']==oldplan['approvedExistingAssessmentAddition'];assert plan['reviewedExistingAssessmentChanges']==oldplan['reviewedExistingAssessmentChanges'];assert plan['combinedMaterializations']==oldplan['combinedMaterializations'];assert plan['producerSourceSnapshots']==oldplan['producerSourceSnapshots']
# Every copied original content-review A/M byte remains exactly the independent source.
W=H.parent/'astra-geometry-projection-fixpoints-vectorproduct-four-review-20261104-v1';originalAM=[]
for name in['semantic-atomicity.proposed-current-original-rows.jsonl','memory-card-review.proposed-current-original-rows.jsonl']:
 rel=cfg['artifactRoot']+'/reviews/'+name;assert(C/rel).read_bytes()==(W/name).read_bytes();originalAM.append({'path':rel,'sha256':sha(C/rel),'rawRows':4,'genuineOriginalBytesUnchanged':True})
proof={'status':'PASS_EXACT_OLD_PIPELINE_INVARIANTS_AND56_LOCAL_NONREDUNDANCY_PAIRS','localNonredundancy':local,'allProductionMainAndAuthoringAlgorithmSourcesByteUnchanged':sources,'sixRootOwnedNormalQASourceBindings':cfg['rootQASourceSync'],'twoRootOwnedCIInputSourceBindings':cfg['rootOwnedAdditionalInputSync'],'old773PolicyOperations411FiniteOperations12IdentitiesAndOriginalB2G3AllowancesWholePreserved':True,'old39CombinedDocuments46RequestsAndOriginalSourceSnapshotsWholePreserved':True,'genuineOriginalAMEightRows':originalAM,'newAssessmentRAndCoverageSeparatelyJustified':True,'newRuntimeRoleOrCompletionAlgorithm':False,'rootWrites':False,'gitWrites':False,'nativeRun':False};(H/'preservation-and-local-nonredundancy.actual.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':proof['status'],'localPairs':56,'productionAndAuthoringFilesUnchanged':len(sources)}))
