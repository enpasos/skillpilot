#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reproduce current source companions in a fresh directory; retained inputs stay immutable."""
import argparse,copy,hashlib,json,pathlib
HERE=pathlib.Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
PARENT=HERE.parent

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--generator-report',type=pathlib.Path,required=True);p.add_argument('--output-dir',type=pathlib.Path,required=True);args=p.parse_args()
 assert not args.output_dir.exists(),'Choose a fresh directory; retained evidence is immutable'
 captured={}
 def raw(path):
  if path not in captured:captured[path]=path.read_bytes()
  return captured[path]
 def read(path):return json.loads(raw(path))
 def sha(path):return hashlib.sha256(raw(path)).hexdigest()
 policy=ROOT/'scripts/generate_laender_physics_stage_views.sources.json';selection_path=HERE/'closing-task-selection.actual.json';selection=read(selection_path)
 assert selection['state']=='active-approved-selection' and selection['scenario']=='k2-only'
 known=set(selection['knownAssessmentGoalIds']);approved=set(selection['approvedAssessmentGoalIds']);assert approved=={'b50e9903-58b3-520d-96bf-d5bc1fe51ebf'}
 # Every previous target and acquisition payload/path/order remains exactly the accepted385 state.
 references=read(HERE/'baseline-reference-places.actual.json')
 for row in references['views']:
  view=read(ROOT/row['path']);places=[]
  def visit(nodes,trail=()):
   for node in nodes:
    if node['kind']=='structure':visit(node['children'],(*trail,node['id']))
    elif node['goalId'] not in approved:places.append({'path':trail,'reference':node})
  visit(view['rootNodes'])
  assert len(places)==row['referenceCount']
  assert hashlib.sha256(json.dumps(places,ensure_ascii=True,sort_keys=True,separators=(',',':')).encode()).hexdigest()==row['orderedReferencePlacesSha256'],row['path']
 reports={row['file']:row for row in read(args.generator_report)}
 assert {'de-bw-gk.view.json','de-bw-lk.view.json','de-bw-seki.view.json'}<=reports.keys()
 values={}
 for name in ['source-demand-place-exceptions.actual.json','source-placement-witnesses.actual.json']:
  old=PARENT/name;value=read(old);value['predecessor']={'path':str(old.relative_to(ROOT)),'sha256':sha(old),'boundary':'Retained scientific source/demand/place decisions. This successor renews current source-policy and affected view byte pins for the approved own BW task only.'}
  if name.startswith('source-demand'):
   value['currentSourcePlanSha256']=sha(policy)
   for row in value['records']:
    for place in row['actualTargetPlaces']:place['sha256']=sha(ROOT/place['file'])
  else:
   value['sourcePolicySha256']=sha(policy)
   for row in value['views']:
    if row['file'] not in reports:continue
    current=reports[row['file']]
    for key in ['reviewedMomentumBindings','reviewedSourceAssignmentCorrections','reviewedNewMomentumPreparationPlaces']:assert row[key]==current.get(key,[]),(row['file'],key)
    for goal,assignment in row['sourceAssignments'].items():
     generated=copy.deepcopy(current['sourceAssignments'][goal])
     for passage in generated['sourcePassages']:assert passage.pop('canonicalGoalId',goal)==goal
     assert assignment==generated,(row['file'],goal)
  value['currentSelection']={'path':str(selection_path.relative_to(ROOT)),'sha256':sha(selection_path)};values[name]=value
 # Validate all captured bytes once more before any output file is created.
 for path,content in captured.items():assert path.read_bytes()==content,'Concurrent input edit '+str(path)
 args.output_dir.mkdir(parents=True)
 for name,value in values.items():
  with (args.output_dir/name).open('x') as handle:json.dump(value,handle,ensure_ascii=False,indent=2);handle.write('\n')
 print(json.dumps({'status':'PASS','outputs':{name:hashlib.sha256((args.output_dir/name).read_bytes()).hexdigest() for name in values}}))
if __name__=='__main__':main()
