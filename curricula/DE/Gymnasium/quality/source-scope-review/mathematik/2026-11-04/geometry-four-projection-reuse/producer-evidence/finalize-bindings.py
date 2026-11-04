from pathlib import Path
from copy import deepcopy
import json,hashlib
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';O=H/'overlay';cfg=json.loads((H/'integration-config.json').read_text());B=R/cfg['baseHost'];Q=cfg['qualityRoot']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def both(rel,v):
 for root in[C,O]:
  p=root/rel;p.parent.mkdir(parents=True,exist_ok=True);t=p.with_name(p.name+'.new');t.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');t.replace(p)
def pin(rel):return {'path':rel,'sha256':sha(C/rel)}
CAN=cfg['canonicalPath'];LED=cfg['ledgerPath'];POL=cfg['policyPath'];LAY=cfg['layoutPath'];PLAN=cfg['planPath'];GUARD='backend/src/test/java/com/skillpilot/backend/composition/MaterializeMathContextualCombinedViews.java'
baseStage=read(B/POL)['reviewReceiptPath'];assert read(B/baseStage)['verdict']=='PASS'
author={'schemaVersion':1,'status':'AUTHOR_EXACT_G4_IMPLEMENTATION_CONTENT_CONDITIONAL_GENUINE_STAGE_NATIVE_PENDING','baseFrozenManifest':cfg['baseManifest'],'baseNative':cfg['baseNative'],'baseCanonical':{'path':CAN,'sha256':sha(B/CAN)},'candidateCanonical':pin(CAN),'candidateLedger':pin(LED),'genuineWholeContentReview':pin(cfg['roleReviewPath']),'exactNewIdAndSourceScopeProposal':pin(cfg['allowancePath']),'exactWholeGoalDelta':pin(Q+'/exact-fieldwise-merge.actual.json'),'finalFingerprintBindings':pin(Q+'/final-fingerprint-bindings.actual.json'),'guardCodeDelta':pin(Q+'/guard-code-deltas.json'),'finitePlan':pin(PLAN),'newSameIdProtectionGoalIds':cfg['sameIdAssessmentIds'],'ordinary574Retained':cfg['ordinaryGoalId'],'existingReuseAssessmentId':cfg['existingReuseAssessmentId'],'newSeparateAssessmentId':cfg['newAssessmentId'],'newTargetScopePairs':cfg['approvedNewTargetScopePairs'],'sameIdRequiresDescriptionsApplicabilityAnd807CurricularKindsUnchanged':True,'canonicalNavigationOnlyAddition':{'parent':cfg['canonicalRootId'],'child':cfg['newAssessmentId'],'reason':'The new explicitly BY-applicable node must remain reachable in the canonical source applicability graph. None of the 147 composition views references the canonical root, so this adds no target pairs.'},'old773PolicyOps411FiniteOps12IdentitiesB2AndG3AllowancesPreserved':True,'additionalPolicyAndFiniteOperations':2,'newAMJudgmentsAuthored':0,'AMHashRebindingOfThreeSameIdFormsStillContentConditional':True,'solutionOnlyAsset':'app/public/assets/assessment-materials/mathematik/5748633c-113f-5ea8-9041-24da55919de7/coordinate-views-solution-v1.png','explicitScopeSourceBoundary':'The new broad coordinate-view form is SkillPilot-authored only for the actual four BY LK/union G9 gaps; this creates no new official universal BY content claim or HE assessment obligation. Existing original curricular descriptions/source mappings/applicability are unchanged.','bindingOrder':'Final canonical/ledger/guard/content/finite-plan -> author -> policy and layout -> external finite/producer evidence. No final policy/layout hash is embedded upstream.','genuinePriorStage':{'path':baseStage,'sha256':sha(B/baseStage)},'reservedFinalGenuineStageReceipt':cfg['stageReceipt'],'rootGitNativeMasteryWrites':False}
both(cfg['authorPath'],author)
p=read(C/POL);p['canonical']=pin(CAN);p['priorImplementationReview']=pin(baseStage)
for row in p['sourceBindings']:
 if row['path']in{LED,GUARD}:row['sha256']=sha(C/row['path'])
for row in p['stageDecisionBindings']:
 if row['path']==PLAN:row['sha256']=sha(C/PLAN)
for rel in[cfg['roleReviewPath'],cfg['allowancePath'],Q+'/before-g3-finite-scope-operations.json',cfg['authorPath']]:p['stageDecisionBindings']=[x for x in p['stageDecisionBindings']if x['path']!=rel]+[pin(rel)]
assert p['assessmentScopeOperations'][:773]==read(B/POL)['assessmentScopeOperations'];assert len(p['assessmentScopeOperations'])==775
both(POL,p)
l=deepcopy(read(B/LAY));l['inputs']['canonical']=pin(CAN);l['inputs']['sourceScopeDecisions'].append(pin(cfg['authorPath']));both(LAY,l)
both(Q+'/final-producer-input-bindings.actual.json',{'status':'AUTHOR_FINAL_CODE_THEN_ACYCLIC_PINS_BOUND_PREVIEW_PENDING','canonical':pin(CAN),'ledger':pin(LED),'policy':pin(POL),'layout':pin(LAY),'plan':pin(PLAN),'author':pin(cfg['authorPath']),'guard':pin(GUARD),'policyOps':775,'finiteOps':413,'newIdentityInventory':13,'oldIdentityInventoryRetained':12,'combinedDocuments':39,'combinedRequests':46,'reservedGenuineStage':cfg['stageReceipt'],'freshNativeRun':False,'noStageApprovalInvented':True})
print(json.dumps({'status':'PRIVATE_G4_INPUT_BINDINGS_READY','canonical':sha(C/CAN),'ledger':sha(C/LED),'policy':sha(C/POL),'layout':sha(C/LAY)}))
