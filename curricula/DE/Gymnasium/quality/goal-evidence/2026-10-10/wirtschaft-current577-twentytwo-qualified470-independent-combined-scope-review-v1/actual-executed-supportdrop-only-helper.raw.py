import json,pathlib,hashlib
C=pathlib.Path('/tmp/skillpilot-economics-combined548-independent-xri79b2w');R=pathlib.Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current577-twentytwo-qualified470-independent-combined-scope-review-v1';rel='curricula/DE/Gymnasium/composition-views/wirtschaft/de-be-gym-economics-gk.view.json';p=C/rel;v=json.loads(p.read_text());gid='87ee2b5a-8d10-51e4-a288-539e5ac251ea';removed=[]
def w(x,path=''):
 if isinstance(x,dict):
  for k,z in x.items():w(z,path+'.'+k)
 elif isinstance(x,list):
  for i,z in reversed(list(enumerate(x))):
   if isinstance(z,dict)and z.get('goalId')==gid:
    assert z['projectionRole']=='prerequisiteOnly';removed.append({'actualTreePath':path+f'[{i}]','wholeEntry':z});x.pop(i)
   else:w(z,path+f'[{i}]')
w(v);assert len(removed)==1;assert p.resolve().is_relative_to(C)and not p.is_symlink();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
(O/'actual-supportdrop-negative-one-real-nested-BE-GK-trade-distribution-prerequisiteOnly.json').write_text(json.dumps({'viewPath':rel,'goalId':gid,'wholeRemovedEntryAndActualPath':removed,'onlyDelta':'remove_existing_required_support_entry','ordinaryTargetChanged':False},ensure_ascii=False,indent=2)+'\n')
(O/'actual-first-supportdrop-preflight-direct-root-assumption-failure.history.json').write_text(json.dumps({'phase':'before_any_mutation_or_native_run','assertion':'Expected support entry as direct root child; actual authored entry is nested .rootNodes[0].children[5].children[2].children[2].','resolved':'Read whole actual authored tree and removed exactly the existing nested prerequisiteOnly entry. No candidate views altered in repository.','nativeFalsePASSClaim':False},indent=2)+'\n')
print('Exactly one nested BE-GK required trade-distribution support entry removed privately.')
