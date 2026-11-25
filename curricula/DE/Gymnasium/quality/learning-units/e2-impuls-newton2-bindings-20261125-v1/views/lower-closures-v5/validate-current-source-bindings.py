#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Validate current epoch5 offer/source/Atlas/Math bindings without editing predecessors."""
import argparse,copy,hashlib,json,pathlib,subprocess
HERE=pathlib.Path(__file__).resolve().parent;ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').is_file());PREFIX='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/';K1='d8fc6295-d0db-59e5-bd90-080bbc508c3a';K2='b50e9903-58b3-520d-96bf-d5bc1fe51ebf';TASKS={K1:('53afbda1-5776-502b-8867-471975d7b766',{'HH','TH'}),K2:('ecbaa101-cb10-5da3-9368-ae40ff587d74',{'BW'})}
def read(p):return json.loads(p.read_bytes())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(ref):assert sha(ROOT/ref['path'])==ref['sha256'],ref['path']
def value_sha(v):return hashlib.sha256(json.dumps(v,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=pathlib.Path,required=True);args=p.parse_args();assert not args.output.exists()
 selection=read(HERE/'closing-task-selection.actual.json');assert selection['state']=='active-approved-selection' and set(selection['approvedAssessmentGoalIds'])==set(TASKS)
 policy_path=ROOT/'scripts/generate_laender_physics_stage_views.sources.json';policy=read(policy_path);assert value_sha({k:v for k,v in policy.items() if k!='reviewedLowerAssessmentBindings'})=='8d31c6da955d34b3e75401148339158b7d0ddc72b932aca2525495bc75ff4904'
 retained=copy.deepcopy(policy['reviewedLowerAssessmentBindings']);assert {s for s,row in retained.items() if K1 in row['assessments']}=={'HH','TH'}
 for task,(covered,states) in TASKS.items():
  for state in states:
   row=retained[state]['assessments'][task];assert row['requires']==[covered] and row['coveredGoalIds']==[covered] and row['courseProfiles']==['GK','LK'] and row['ensureCrossStageExposure'] is True
   assert row['offerReview'].endswith('/offer-bindings-v5.actual.json') and (ROOT/row['independentReview']).is_file()
 for state in ['HH','TH']:retained[state]['assessments'].pop(K1)
 retained['BW']['assessments'][K2]['offerReview']='curricula/DE/Gymnasium/quality/assessment-review/physik/e2-lower-momentum-closures-20261125-v1/offer-bindings.actual.json'
 assert value_sha(retained)=='33f1ac5a02270372414422d9b1722281fc44003cd258ebd5ef23cefe73af6d2e'
 offer_path=ROOT/'curricula/DE/Gymnasium/quality/assessment-review/physik/e2-lower-momentum-closures-20261125-v1/offer-bindings-v5.actual.json';offer=read(offer_path);assert sha(offer_path)=='fc4b376a58eb1566149f27cc9ed01316d2c877840f0ed6312114a51560ff276b'
 assert offer['status']=='accepted_for_declared_offer_only' and offer['boundedOfferChecks']=='PASS' and offer['activeOfferCount']==9 and set(offer['activeAssessmentGoalIds'])==set(TASKS)
 assert offer['ownTaskOffersOnly'] is True and offer['officialTaskClaim'] is False and offer['hessenExcluded'] is True
 for key in ['formSuccessorEquivalence','strandMetadataSuccessorEquivalence','currentNativeOfferContext']:pin(offer[key])
 assert offer['formSuccessorEquivalence']['sha256']=='d9dd798d0d119a19066a606de1b2ce982d3ce52d4e27463e0ee78954c9364a40';assert offer['strandMetadataSuccessorEquivalence']['sha256']=='7010c0d0a04096437ed7af34078cfe4f5b2cdfd724d1f982fa97232091e3f60d'
 native=read(ROOT/offer['currentNativeOfferContext']['path']);assert native['status']=='PASS' and len(native['rows'])==9 and native['remainingRouteGapCount']==0
 assert native['cqr104']['status']=='pass' and native['cqr104']['metrics']['evaluatedProjectionScopes']==106 and native['cqr104']['metrics']['requiredTerminalAutonomyGoals']==58
 for item in native['inputs']:pin(item)
 bindings={r['assessmentGoalId']:r for r in offer['assessmentBindings']};assert set(bindings)==set(TASKS)
 for task,(covered,states) in TASKS.items():
  row=bindings[task]
  for key in ['acceptedContentReview','reviewedCandidate','currentReleasedGoal','acceptedReviewedSourceArtifact','sourceArtifact','formPredecessorReleasedGoal','releaseMetadataReview']:pin(row[key])
  assert row['coveredGoalIds']==[covered] and row['directRequires']==[covered] and row['currentParentGoalId']=='bf980fff-b62b-4ea4-a20d-31681a7ad785'
  saved=next(r for r in native['contentReceipts'] if r['goalId']==task);assert saved['currentCanonicalPayloadSha256']==row['currentCanonicalPayloadSha256'] and saved['canonicalGoalValueSha256']==row['canonicalGoalValueSha256']
  rows=[r for r in native['rows'] if r['assessmentGoalId']==task];assert len(rows)==3*len(states)
  for context in rows:assert not context['missingTaskDemandGoalIds'] and not context['unexposedTaskDemandGoalIds'];assert sha(ROOT/context['viewPath'])==context['viewSha256']
 exceptions=read(HERE/'source-demand-place-exceptions.actual.json');assert exceptions['currentSourcePlanSha256']==sha(policy_path);checked=0
 for row in exceptions['records']:
  for place in row['actualTargetPlaces']:assert sha(ROOT/place['file'])==place['sha256'];checked+=1
 assert checked==66
 witness=read(HERE/'source-placement-witnesses.actual.json');assert witness['sourcePolicySha256']==sha(policy_path)
 sn={r['goalId']:r for r in policy['reviewedMomentumBindings']['targets'] if r['state']=='SN'};assert {k:v['pages'] for k,v in sn.items()}=={'53afbda1-5776-502b-8867-471975d7b766':[57],'ecbaa101-cb10-5da3-9368-ae40ff587d74':[57,58],'059c1adc-e4d2-5222-a923-15abc417d59f':[58]};sn_count=0
 for entry in witness['views']:
  if entry['file'] not in ['de-sn-lk.view.json','de-sn-sekii-lk.view.json']:continue
  declared={r['goalId']:r for r in entry['reviewedMomentumBindings'] if r['goalId'] in sn};assert set(declared)==set(sn)
  for goal,source in sn.items():
   passages=entry['sourceAssignments'][goal]['sourcePassages'];assert len(passages)==1
   for key in ['pages','boundary','sourcePath','sourceSha256']:assert declared[goal][key]==source[key] and passages[0][key]==source[key]
   sn_count+=1
 assert sn_count==6
 atlas=read(HERE/'national-atlas-current-sources.actual.json');pin(atlas['predecessor']);assert atlas['sourceViewCount']==70 and not atlas['changedSourceViews'] and atlas['currentActualUnionCount']==492 and atlas['canonicalProfileTargets']['count']==424
 for row in atlas['sourceViews']:assert sha(ROOT/row['path'])==row['sha256'] and row['sha256']==row['previousSha256']
 for item in atlas['inputs']:pin(item)
 math=read(HERE/'foreign-math-recheck.actual.json');pin(math['predecessor']);assert math['status']=='PASS' and math['demandRows']==1036 and math['verifiedRequiresEdges']==4349 and not math['currentPhysicsSourcePinDeltaFromPredecessor']
 for item in math['canonicalAndSourceInputs']+math['unchangedMathematicsSourceViews']:pin(item)
 for row in math['physicsSourcePins']:assert sha(ROOT/row['path'])==row['currentSha256']
 result={'schemaVersion':1,'status':'PASS','technicalEpoch':5,'rubricVersions':{'K1':4,'K2':3},'currentSourcePolicy':{'path':str(policy_path.relative_to(ROOT)),'sha256':sha(policy_path)},'currentSharedOffer':{'path':str(offer_path.relative_to(ROOT)),'sha256':sha(offer_path)},'nativeInputsRechecked':len(native['inputs']),'activeOffers':9,'CQR104':{'status':'pass','scopes':106,'missing':0,'maxRequiredTerminals':58},'exceptionHashes':66,'SNBothForms':6,'Atlas':{'sources':70,'newViewChangesFromV4':0,'targets':492,'profile':424},'Math':{'rows':1036,'edges':4349,'newPinsFromV4':0},'boundaries':'Current metadata/offer/source consistency; full CI, integration, learner-result and host acceptance remain separate.'}
 with args.output.open('x') as f:json.dump(result,f,indent=2);f.write('\n')
 print(json.dumps(result))
if __name__=='__main__':main()
