#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Reuse the immutable exhaustive witness verifier and write a fresh successor only."""
import argparse,hashlib,json,pathlib,runpy,sys
HERE=pathlib.Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/normalize_mathematics_stage_views.py').exists())
PARENT=ROOT/'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views'
SCRIPT=PARENT/'verify-foreign-math.py';PREDECESSOR=PARENT/'foreign-math-recheck.actual.json'
POLICY=ROOT/'app/scripts/config/math-foreign-acquisition-demand.json'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=pathlib.Path,required=True);p.add_argument('--write-pins',action='store_true');args=p.parse_args()
 assert not args.output.exists(),'Refusing to overwrite retained evidence; choose a fresh output path'
 assert sha(SCRIPT)=='ef6dc3da0b4fce46acf6791916c3298ee60cdab50adb3a12056cd5f9cb358769'
 assert sha(PREDECESSOR)=='01f6dc33b393a763d0b50ae704b70e20d3e3b9a32df494efcf45ab00b939e10f'
 before_policy=POLICY.read_bytes();staged={};original=pathlib.Path.write_text
 def capture(path,text,*pos,**kw):
  resolved=path.resolve()
  if resolved not in {POLICY.resolve(),(PARENT/'foreign-math-recheck.actual.json').resolve()}:
   raise RuntimeError('Unexpected verifier write '+str(path))
  staged[resolved]=text
  return len(text)
 pathlib.Path.write_text=capture
 try:
  sys.argv=[str(SCRIPT)]+(['--write-pins'] if args.write_pins else [])
  runpy.run_path(str(SCRIPT),run_name='__main__')
 finally:pathlib.Path.write_text=original
 report=json.loads(staged[(PARENT/'foreign-math-recheck.actual.json').resolve()]);assert report['status']=='PASS'
 # All retained inputs must still be the exact bytes seen by the exhaustive run.
 for item in report['canonicalAndSourceInputs']+report['unchangedMathematicsSourceViews']:
  assert sha(ROOT/item['path'])==item['sha256'],item['path']
 for item in report['physicsSourcePins']:
  assert sha(ROOT/item['path'])==item['currentSha256'],item['path']
 assert POLICY.read_bytes()==before_policy,'Concurrent policy edit'
 prior=json.loads(PREDECESSOR.read_bytes());old={r['path']:r['currentSha256'] for r in prior['physicsSourcePins']}
 assert report['allRetainedRowChecks']==prior['allRetainedRowChecks'],'A retained witness row changed'
 retained_rows=report.pop('allRetainedRowChecks')
 report['retainedWitnessRows']={'predecessorPath':str(PREDECESSOR.relative_to(ROOT)),'field':'allRetainedRowChecks','count':len(retained_rows),'sha256':hashlib.sha256(json.dumps(retained_rows,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest(),'allRowsRecheckedAndUnchanged':True}
 delta=[{'path':r['path'],'previousSha256':old[r['path']],'sha256':r['currentSha256']} for r in report['physicsSourcePins'] if old[r['path']]!=r['currentSha256']]
 report.update(contract='e2-lower-closures-foreign-math-current-witness-successor-v1',predecessor={'path':str(PREDECESSOR.relative_to(ROOT)),'sha256':sha(PREDECESSOR)},retainedVerifier={'path':str(SCRIPT.relative_to(ROOT)),'sha256':sha(SCRIPT)},currentPhysicsSourcePinDeltaFromPredecessor=delta)
 if args.write_pins:
  renewed=staged[POLICY.resolve()];before=json.loads(before_policy);after=json.loads(renewed)
  assert {k:v for k,v in before.items() if k!='currentPhysicsSourcePins'}=={k:v for k,v in after.items() if k!='currentPhysicsSourcePins'}
  POLICY.write_text(renewed)
 with args.output.open('x') as handle:json.dump(report,handle,ensure_ascii=False,indent=2);handle.write('\n')
 print(json.dumps({'status':'PASS','demandRows':report['demandRows'],'verifiedRequiresEdges':report['verifiedRequiresEdges'],'changedPhysicsPinsFromPredecessor':len(delta),'output':str(args.output)}))
if __name__=='__main__':main()
