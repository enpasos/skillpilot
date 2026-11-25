#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify the bounded source-policy successor without rewriting accepted predecessors."""
import argparse,copy,hashlib,json,pathlib
HERE=pathlib.Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
PARENT=HERE.parent
TASKS={'d8fc6295-d0db-59e5-bd90-080bbc508c3a':('53afbda1-5776-502b-8867-471975d7b766',{'HH','TH'}),
       'b50e9903-58b3-520d-96bf-d5bc1fe51ebf':('ecbaa101-cb10-5da3-9368-ae40ff587d74',{'BW'})}
def read(path):return json.loads(path.read_bytes())
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def value_sha(value):return hashlib.sha256(json.dumps(value,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=pathlib.Path,required=True);args=p.parse_args()
 assert not args.output.exists(),'Choose a fresh verification output; retained evidence is immutable'
 policy_path=ROOT/'scripts/generate_laender_physics_stage_views.sources.json';policy=read(policy_path)
 selection_path=HERE/'closing-task-selection.actual.json';selection=read(selection_path)
 assert selection['state']=='active-approved-selection','A planned scenario is not an activated acceptance record'
 approved=set(selection['approvedAssessmentGoalIds']);assert approved<=TASKS.keys()
 assert value_sha({k:v for k,v in policy.items() if k!='reviewedLowerAssessmentBindings'})=='8d31c6da955d34b3e75401148339158b7d0ddc72b932aca2525495bc75ff4904','Official source policy changed outside this own-task offering'
 retained=copy.deepcopy(policy['reviewedLowerAssessmentBindings']);goals={g['id']:g for g in read(ROOT/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')['goals']}
 assert approved==TASKS.keys()&goals.keys(),'Installed assessment identities differ from the declared accepted selection'
 for task,(covered,states) in TASKS.items():
  offered={state for state,row in retained.items() if task in row['assessments']}
  if task not in approved:
   assert not offered,(task,'unaccepted offering');continue
  assert offered==states,(task,offered)
  assert goals[task]['requires']==[covered] and goals[task]['examData']['coveredGoalIds']==[covered]
  assert goals[task]['examData']['reviewStatus']=='released'
  for state in states:
   binding=retained[state]['assessments'].pop(task)
   assert binding['requires']==[covered] and binding['coveredGoalIds']==[covered]
   assert binding['ensureCrossStageExposure'] is True and binding['courseProfiles']==['GK','LK']
   for key in ['independentReview','offerReview']:assert (ROOT/binding[key]).is_file(),binding[key]
 if 'BW' in retained and not retained['BW']['assessments']:del retained['BW']
 assert value_sha(retained)=='c5c5710919a25b2617220b89918133a8892a6e8e3384dd8b6e1129aa5fe1a268','An earlier own-task offer changed'
 offer_path=ROOT/'curricula/DE/Gymnasium/quality/assessment-review/physik/e2-lower-momentum-closures-20261125-v1/offer-bindings.actual.json'
 offer=read(offer_path)
 assert offer['status']=='accepted_for_declared_offer_only' and offer['boundedOfferChecks']=='PASS'
 assert set(offer['activeAssessmentGoalIds'])==approved and offer['officialTaskClaim'] is False and offer['hessenExcluded'] is True
 assert offer['activeOfferCount']==selection['expectedActualOfferCount'] and offer['integrationComplete'] is False
 for key in ['contentReview','candidateGoal','sourceArtifact','currentNativeOfferContext']:
  pin=offer[key];assert sha(ROOT/pin['path'])==pin['sha256'],pin['path']
 native=read(ROOT/offer['currentNativeOfferContext']['path'])
 assert native['nativeInputChecks']=='PASS' and native['remainingRouteGapCount']==selection['expectedUnresolvedRouteCount']
 assert native['cqr104']['status']==selection['expectedCqr104Status']
 for pin in native['inputs']:assert sha(ROOT/pin['path'])==pin['sha256'],pin['path']
 for row in native['rows']:
  assert sha(ROOT/row['viewPath'])==row['viewSha256']
  assert not row['missingTaskDemandGoalIds'] and not row['unexposedTaskDemandGoalIds']
 for pin in native['contentReceipts']:
  assert sha(ROOT/pin['path'])==pin['sha256']
  assert hashlib.sha256(json.dumps(goals[pin['goalId']],ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()==pin['canonicalGoalValueSha256']
 exception_path=HERE/'source-demand-place-exceptions.actual.json'
 if not exception_path.exists():exception_path=PARENT/'source-demand-place-exceptions.actual.json'
 exceptions=read(exception_path)
 assert sha(PARENT/'source-demand-place-exceptions.actual.json')=='0143bd662c571cdf768f0fdf7e35a12e42b1d390c008a1b7668b5aba7ebeac1d'
 assert exceptions['currentSourcePlanSha256']==sha(policy_path)
 checked=0
 for row in exceptions['records']:
  for place in row['actualTargetPlaces']:
   assert place['sha256']==sha(ROOT/place['file']),place['file'];checked+=1
 assert checked==66
 witness_path=HERE/'source-placement-witnesses.actual.json'
 if not witness_path.exists():witness_path=PARENT/'source-placement-witnesses.actual.json'
 witness=read(witness_path)
 assert witness['sourcePolicySha256']==sha(policy_path)
 sn={row['goalId']:row for row in policy['reviewedMomentumBindings']['targets'] if row['state']=='SN'}
 assert sn['53afbda1-5776-502b-8867-471975d7b766']['pages']==[57]
 assert sn['ecbaa101-cb10-5da3-9368-ae40ff587d74']['pages']==[57,58]
 assert sn['059c1adc-e4d2-5222-a923-15abc417d59f']['pages']==[58]
 rows=0
 for entry in witness['views']:
  if entry['file'] not in ['de-sn-lk.view.json','de-sn-sekii-lk.view.json']:continue
  declared={r['goalId']:r for r in entry['reviewedMomentumBindings'] if r['goalId'] in sn};assert set(declared)==set(sn)
  for goal,source in sn.items():
   passages=entry['sourceAssignments'][goal]['sourcePassages'];assert len(passages)==1
   for key in ['pages','boundary','sourcePath','sourceSha256']:
    assert declared[goal][key]==source[key] and passages[0][key]==source[key]
   rows+=1
 assert rows==6
 heading=PARENT/'final-heading-delta-v2.actual.json'
 assert sha(heading)=='a065f6390b8be885782147546acdb75fe54c83e81596fe53f44179629407989a'
 for row in read(heading)['changedViews']:
  assert row['sha256']==sha(ROOT/row['path']) and row['allOtherTargetAndAcquisitionReferencePlacesUnchanged'] is True
 result={'schemaVersion':1,'status':'PASS','contract':'e2-lower-closures-current-source-bindings-v1','selection':{'path':str(selection_path.relative_to(ROOT)),'sha256':sha(selection_path),'approvedAssessmentGoalIds':sorted(approved)},'currentSourcePolicy':{'path':str(policy_path.relative_to(ROOT)),'sha256':sha(policy_path)},'currentBoundedOfferReceipt':{'path':str(offer_path.relative_to(ROOT)),'sha256':sha(offer_path)},'nativeOfferInputsRechecked':len(native['inputs']),'remainingRouteGapCount':native['remainingRouteGapCount'],'checkedCurrentExceptionViewHashes':checked,'checkedSNGoalBindingsInBothForms':rows,'previousOfficialSourcePolicyUnchanged':True,'previousOwnTaskOffersUnchanged':True,'newOwnTaskOfferStates':{task:sorted(states) for task,(_,states) in TASKS.items() if task in approved},'currentCompanions':{str(q.relative_to(ROOT)):sha(q) for q in [exception_path,witness_path,heading]},'boundary':'Current-input consistency only; no new official-source review vote or learner-result transfer. Original accepted companions remain historical inputs. This does not waive remaining route gaps in a partial or empty selection.'}
 with args.output.open('x') as output:json.dump(result,output,ensure_ascii=False,indent=2);output.write('\n')
 print(json.dumps(result))
if __name__=='__main__':main()
