#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproduce the sealed companions from a full report without changing retained inputs."""
import argparse,copy,hashlib,json,pathlib
PREFIX='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/'
PREDECESSORS={
 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v2/refresh-source-companions.py':'f44bdcbc051211ec1b9221bb09cdd1d24fc52ea014131c0a63115dab966eb0d8',
 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v2/README.md':'aa587f85637112b1443cca5d2e13c1e8fe7c81a4bf48cf190d95d598ab3829e1',
 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v2/successor.actual.json':'5b7b7e58e05e0c9a19da8837ed58593f9e650e20ed59f15af673f160d76e3f3d',
 PREFIX+'lower-closures-v1/refresh-source-companions.py':'76fc6b96bfb75c40987eafd96c57faeb0979f5eeedc72f62aecad65b82ef22f9',
 PREFIX+'lower-closures-v1/README.md':'4d4494f66e088b62c4793f2d437535a3b86afaa57ab6a2a515fab3ef7b8c5a77',
 PREFIX+'lower-closures-v1/checks.actual.json':'32abedd753f3110d942ee32080cbf106020d4e9fc198d6b854e4e70d74d31d52',
 PREFIX+'source-demand-place-exceptions.actual.json':'0143bd662c571cdf768f0fdf7e35a12e42b1d390c008a1b7668b5aba7ebeac1d',
 PREFIX+'source-placement-witnesses.actual.json':'da22fa26cb75dc7f3a791702d0458bbd806806fd9eef67ac8ef059ceb496e268',
 PREFIX+'lower-closures-v1/closing-task-selection.actual.json':'cedd1b000f17e48c3529009bf25199ff8d7efba8c3f535fffaeb2ee7097e6612',
 PREFIX+'lower-closures-v1/source-demand-place-exceptions.actual.json':'01cac447e25f0a6ceb21bacf6b2838568ca788d67092ea0bc5356829913910e0',
 PREFIX+'lower-closures-v1/source-placement-witnesses.actual.json':'adb68358ac3610b3772c29de78e82de76a535d39487bffbd884c014a5993c435',
}
FLAT_FILES={'de-by-gk.view.json','de-by-lk.view.json'}
FLAT_GOALS={'53afbda1-5776-502b-8867-471975d7b766','839ecc8f-3a60-418b-bc92-64bfeef33824'}

def validate_assignment(filename,goal,retained,current):
 """Permit only recorded representations; compare the complete scientific assignment."""
 generated=copy.deepcopy(current)
 flat='sourcePassages' not in retained
 if flat:
  assert filename in FLAT_FILES and goal in FLAT_GOALS,(filename,goal,'undeclared flat source assignment')
  assert 'sourcePassages' not in generated,(filename,goal,'changed flat representation')
  assert retained['sourceTopicCodes']==['Ph10.2']
  representation='flatBY'
 else:
  assert isinstance(retained['sourcePassages'],list) and retained['sourcePassages']
  assert isinstance(generated.get('sourcePassages'),list),(filename,goal,'missing nested source evidence')
  assert len(generated['sourcePassages'])==len(retained['sourcePassages']),(filename,goal,'changed passage count')
  representation='nestedWithGoalIdentity' if any('canonicalGoalId' in p for p in retained['sourcePassages']) else 'nestedWithoutRedundantGoalIdentity'
 # A missing array is accepted only after the explicit legitimate-flat checks above.
 for index,passage in enumerate(generated.get('sourcePassages',[])):
  assert isinstance(passage,dict)
  expected=retained['sourcePassages'][index]
  if 'canonicalGoalId' in passage:assert passage['canonicalGoalId']==goal,(filename,goal,'wrong source goal identity')
  if 'canonicalGoalId' in expected:
   assert expected['canonicalGoalId']==goal and passage.get('canonicalGoalId')==goal,(filename,goal,'missing retained source goal identity')
  else:passage.pop('canonicalGoalId',None)
 assert retained==generated,(filename,goal,'complete source assignment changed')
 return representation

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--repository',type=pathlib.Path);parser.add_argument('--generator-report',type=pathlib.Path,required=True);parser.add_argument('--output-dir',type=pathlib.Path,required=True);args=parser.parse_args()
 inferred=next((p for p in pathlib.Path(__file__).resolve().parents if (p/'scripts/generate_laender_physics_stage_views.py').is_file()),None)
 root=(args.repository or inferred)
 if root is None:parser.error('Pass --repository for an out-of-tree replay')
 root=root.resolve();here=root/PREFIX/'lower-closures-v5';parent=root/PREFIX/'lower-closures-v4'
 assert not args.output_dir.exists(),'Choose a fresh directory; retained evidence is immutable'
 captured={}
 def raw(path):
  path=path.resolve()
  if path not in captured:captured[path]=path.read_bytes()
  return captured[path]
 def read(path):return json.loads(raw(path))
 def sha(path):return hashlib.sha256(raw(path)).hexdigest()
 for relative,digest in PREDECESSORS.items():assert sha(root/relative)==digest,('Changed retained input',relative)
 policy=root/'scripts/generate_laender_physics_stage_views.sources.json';selection_path=here/'closing-task-selection.actual.json';selection=read(selection_path)
 assert selection['state']=='active-approved-selection' and selection['scenario']=='k1-v4-with-k2-retained'
 approved=set(selection['newlyActiveAssessmentGoalIds']);assert approved=={'d8fc6295-d0db-59e5-bd90-080bbc508c3a'}
 assert set(selection['approvedAssessmentGoalIds'])==approved|{'b50e9903-58b3-520d-96bf-d5bc1fe51ebf'}
 plan=read(policy);official={k:v for k,v in plan.items() if k!='reviewedLowerAssessmentBindings'}
 assert hashlib.sha256(json.dumps(official,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()=='8d31c6da955d34b3e75401148339158b7d0ddc72b932aca2525495bc75ff4904'
 retained_bindings=copy.deepcopy(plan['reviewedLowerAssessmentBindings']);task='d8fc6295-d0db-59e5-bd90-080bbc508c3a';covered='53afbda1-5776-502b-8867-471975d7b766'
 assert {state for state,row in retained_bindings.items() if task in row['assessments']}=={'HH','TH'}
 for state in ['HH','TH']:
  binding=retained_bindings[state]['assessments'].pop(task);assert binding['requires']==[covered] and binding['coveredGoalIds']==[covered]
  assert binding['ensureCrossStageExposure'] is True and binding['courseProfiles']==['GK','LK']
  assert binding['independentReview'].endswith('/'+task+'/content-review-v4.actual.json') and binding['offerReview'].endswith('/offer-bindings-v5.actual.json')
 bw=retained_bindings['BW']['assessments']['b50e9903-58b3-520d-96bf-d5bc1fe51ebf'];assert bw['offerReview'].endswith('/offer-bindings-v5.actual.json')
 bw['offerReview']='curricula/DE/Gymnasium/quality/assessment-review/physik/e2-lower-momentum-closures-20261125-v1/offer-bindings.actual.json'
 assert hashlib.sha256(json.dumps(retained_bindings,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()=='33f1ac5a02270372414422d9b1722281fc44003cd258ebd5ef23cefe73af6d2e','A previous own-task binding changed beyond the declared global authority pointer'
 references=read(root/PREFIX/'lower-closures-v4/baseline-reference-places.actual.json');report_files=set();reference_count=0;changed_views=[]

 for row in references['views']:
  view=read(root/row['path']);places=[]
  if sha(root/row['path'])!=row['sha256']:changed_views.append(row['path'])
  if view['scope'].get('jurisdiction')!='DE-HE':report_files.add(pathlib.Path(row['path']).name)
  def visit(nodes,trail=()):
   for node in nodes:
    if node['kind']=='structure':visit(node['children'],(*trail,node['id']))
    elif node['goalId'] not in approved:places.append({'path':trail,'reference':node})
  visit(view['rootNodes']);assert len(places)==row['referenceCount']
  assert hashlib.sha256(json.dumps(places,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()==row['orderedReferencePlacesSha256'],row['path'];reference_count+=len(places)
 assert len(references['views'])==90 and reference_count==75673
 assert sorted(changed_views)==sorted(selection['expectedChangedPhysicsViewPaths'])
 v4native=read(root/PREFIX/'lower-closures-v4/current-offer-context.actual.json')
 for pin in v4native['allViewChecks']:assert sha(root/pin['path'])==pin['sha256'],'Metadata epoch changed a view'
 report=read(args.generator_report);reports={row['file']:row for row in report}
 assert len(report)==len(reports)==len(report_files)==80 and set(reports)==report_files,'Provide the complete current80-view Länder/national report'
 assert not any(row['changed'] for row in report),'The full generator check must be current and idempotent'
 values={};forms={};comparisons=[]
 for name in ['source-demand-place-exceptions.actual.json','source-placement-witnesses.actual.json']:
  old=parent/name;value=read(old);value['predecessor']={'path':str(old.relative_to(root)),'sha256':sha(old),'boundary':'Retained scientific source/demand/place decisions. This successor renews current source-policy and affected view byte pins for the accepted K1 V4 HH/TH additions while retaining the accepted BW task.'}
  if name.startswith('source-demand'):
   value['currentSourcePlanSha256']=sha(policy)
   for row in value['records']:
    for place in row['actualTargetPlaces']:place['sha256']=sha(root/place['file'])
  else:
   value['sourcePolicySha256']=sha(policy)
   for row in value['views']:
    if row['file'] not in reports:continue
    current=reports[row['file']]
    for key in ['reviewedMomentumBindings','reviewedSourceAssignmentCorrections','reviewedNewMomentumPreparationPlaces']:assert row[key]==current.get(key,[]),(row['file'],key)
    for goal,assignment in row['sourceAssignments'].items():
     form=validate_assignment(row['file'],goal,assignment,current['sourceAssignments'][goal]);forms[form]=forms.get(form,0)+1;comparisons.append({'file':row['file'],'goalId':goal,'representation':form,'completeAssignmentEqual':True})
  value['currentSelection']={'path':str(selection_path.relative_to(root)),'sha256':sha(selection_path)};values[name]=value
 encoded={name:(json.dumps(value,ensure_ascii=False,indent=2)+'\n').encode() for name,value in values.items()}
 # New policy and six HH/TH raw hashes are intentional; all complete scientific assignments were compared above.
 for name,content in encoded.items():assert json.loads(content)['predecessor']['sha256']==sha(parent/name)
 for path,content in captured.items():assert path.read_bytes()==content,'Concurrent input edit '+str(path)
 args.output_dir.mkdir(parents=True)
 for name,content in encoded.items():
  with (args.output_dir/name).open('xb') as output:output.write(content)
 receipt={'schemaVersion':1,'status':'PASS','contract':'e2-release-metadata-epoch5-current-source-companion-successor-v1','fullGeneratorReportViews':80,'oldReferenceContracts':75673,'assignmentNormalForms':forms,'assignmentComparisons':comparisons,'sealedPredecessors':[{'path':p,'sha256':h} for p,h in PREDECESSORS.items()],'sourcePolicy':{'path':str(policy.relative_to(root)),'sha256':sha(policy)},'generatorReport':{'sha256':sha(args.generator_report),'retainedOutsideRepository':True},'reproducer':{'path':PREFIX+'lower-closures-v5/refresh-source-companions.py','sha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest()},'outputs':{name:hashlib.sha256(content).hexdigest() for name,content in encoded.items()},'boundary':'Technical full-report representation repair only. Sealed helper, README, checks and source records remain unchanged; complete source assignments remain exact. No new source vote, goal, edge, view, Math pin or learner result. K1 may be active only after two V4 acceptances and root authorization; current native route acceptance is recorded separately.'}
 with (args.output_dir/'replay.actual.json').open('x') as output:json.dump(receipt,output,ensure_ascii=False,indent=2);output.write('\n')
 print(json.dumps({'status':'PASS','views':80,'normalForms':forms,'outputs':receipt['outputs']}))
if __name__=='__main__':main()
