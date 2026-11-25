#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Recheck all retained witnesses and bind the exact K1-only pin delta from a492."""
import argparse,hashlib,json,pathlib,runpy,sys
PREFIX='curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--repository',type=pathlib.Path);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--write-pins',action='store_true');args=p.parse_args();assert not args.output.exists(),'Choose a fresh output';assert args.output.parent.is_dir(),'Create the external output parent first'
 inferred=next((p for p in pathlib.Path(__file__).resolve().parents if (p/'scripts/normalize_mathematics_stage_views.py').is_file()),None);root=args.repository or inferred
 if root is None:p.error('Pass --repository for an out-of-tree replay')
 root=root.resolve();parent=root/PREFIX;script=parent/'verify-foreign-math.py';predecessor=parent/'lower-closures-v4/foreign-math-recheck.actual.json';policy=root/'app/scripts/config/math-foreign-acquisition-demand.json'
 assert sha(script)=='ef6dc3da0b4fce46acf6791916c3298ee60cdab50adb3a12056cd5f9cb358769'
 assert sha(predecessor)=='fb23028100d452fd3df265eac5d6b1532341cd32aea696bcb2865eb2849c9f28'
 prior=json.loads(predecessor.read_bytes());before_policy=policy.read_bytes();scope=runpy.run_path(str(script),run_name='retained_current_math_witness');scope['main'].__globals__['ROOT']=root;legacy_report=(scope['HERE']/'foreign-math-recheck.actual.json').resolve();staged={};original=pathlib.Path.write_text
 def capture(path,text,*pos,**kw):
  resolved=path.resolve();assert resolved in {policy.resolve(),legacy_report},'Unexpected verifier write '+str(path);staged[resolved]=text;return len(text)
 pathlib.Path.write_text=capture;argv=sys.argv[:]
 try:sys.argv=[str(script)]+(['--write-pins'] if args.write_pins else []);scope['main']()
 finally:pathlib.Path.write_text=original;sys.argv=argv
 report=json.loads(staged[legacy_report]);assert report['status']=='PASS';rows=report.pop('allRetainedRowChecks');row_sha=hashlib.sha256(json.dumps(rows,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
 assert row_sha==prior['retainedWitnessRows']['sha256'] and len(rows)==1036,'Retained witness row changed'
 for pin in report['canonicalAndSourceInputs']+report['unchangedMathematicsSourceViews']:assert sha(root/pin['path'])==pin['sha256'],pin['path']
 for pin in report['physicsSourcePins']:assert sha(root/pin['path'])==pin['currentSha256'],pin['path']
 assert policy.read_bytes()==before_policy,'Concurrent policy edit'
 old={row['path']:row['currentSha256'] for row in prior['physicsSourcePins']};delta=[{'path':row['path'],'previousSha256':old[row['path']],'sha256':row['currentSha256']} for row in report['physicsSourcePins'] if old[row['path']]!=row['currentSha256']]
 assert delta==[],'Metadata-only epoch changed a source-view pin'
 report.update(contract='e2-release-metadata-epoch5-foreign-math-current-witness-successor-v1',baselineCommit='a4923a80928e4211c02fb53feaadad2054a3fb94',predecessor={'path':str(predecessor.relative_to(root)),'sha256':sha(predecessor)},retainedVerifier={'path':str(script.relative_to(root)),'sha256':sha(script)},retainedWitnessRows={'predecessorPath':str(predecessor.relative_to(root)),'field':'retainedWitnessRows','count':1036,'sha256':row_sha,'allRowsRecheckedAndUnchanged':True},currentPhysicsSourcePinDeltaFromPredecessor=delta)
 if args.write_pins:
  after=staged[policy.resolve()];before=json.loads(before_policy);renewed=json.loads(after);assert {k:v for k,v in before.items() if k!='currentPhysicsSourcePins'}=={k:v for k,v in renewed.items() if k!='currentPhysicsSourcePins'};policy.write_text(after)
 with args.output.open('x') as f:json.dump(report,f,ensure_ascii=False,indent=2);f.write('\n')
 print(json.dumps({'status':'PASS','demandRows':1036,'verifiedRequiresEdges':report['verifiedRequiresEdges'],'changedPinsFromV4':len(delta)}))
if __name__=='__main__':main()
