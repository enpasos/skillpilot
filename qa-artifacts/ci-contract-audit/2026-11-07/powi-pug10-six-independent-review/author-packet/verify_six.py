#!/usr/bin/env python3
"""Read-only exact replay of this six-edge proposal; no generalized reduction."""
import argparse,copy,hashlib,json,sys
from pathlib import Path
sys.dont_write_bytecode=True
H=lambda b:hashlib.sha256(b).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--repo',type=Path,required=True);ap.add_argument('--packet',type=Path,required=True);args=ap.parse_args();root=args.repo.resolve();packet=args.packet.resolve();p=json.loads((packet/'proposal.json').read_bytes());sys.path.insert(0,str(root/'docs/dev/ci-graph-repairs'));import verify_german_minimality_review as k
 docs=[]
 for pin in p['catalogSources']:
  raw=(root/pin['path']).read_bytes();assert H(raw)==pin['sha256'],pin['path'];docs.append(json.loads(raw))
 assert len(docs)==21 and len({d['landscapeId']for d in docs})==21
 assert len(p['operations'])==6 and len({o['guardGoalId']for o in p['operations']})==6
 owner=p['source']['landscapeId'];before=next(d for d in docs if d['landscapeId']==owner);after=copy.deepcopy(before);cat=k.Catalog(copy.deepcopy(docs));e,_=cat.effective();bg,cy=k.closure(cat.keys,e);ba,acy=k.closure(cat.atom_keys,cat.atomic(e));assert cy==acy==0
 for op in p['operations']:
  parts=op['path'].split('/');assert len(parts)==4 and parts[:2]==['','goals']and parts[3]=='requires';idx=int(parts[2]);g=after['goals'][idx];assert op['file']==p['source']['path']and op['op']=='replace';assert g['id']==op['guardGoalId'];assert H(k.stable(g))==op['guardGoalCanonicalSha256'];assert g['requires']==op['guardRequiresBefore'];assert not g.get('contains')and not g.get('examData');assert op['value']==[r for r in g['requires']if r!='b76a024a-55a6-5c77-85cd-b37ef10e5197'];assert len(op['value'])==1
  g['requires']=op['value'];cat.remove_origin(owner+':'+g['id'],owner+':b76a024a-55a6-5c77-85cd-b37ef10e5197')
 assert H((json.dumps(after,ensure_ascii=False,indent=2)+'\n').encode())==p['candidateSourceSha256']
 e,orig=cat.effective();ag,cy=k.closure(cat.keys,e);aa,acy=k.closure(cat.atom_keys,cat.atomic(e));assert bg==ag and ba==aa and cy==acy==0
 proof=json.loads((packet/'closure-comparison.json').read_bytes());assert H((packet/'closure-comparison.json').read_bytes())==p['proofSha256']
 for row in proof['finalWitnesses']:cat.validate_path(e,row['witnessKeys']);cat.validate_origins(row['witnessKeys'],row['origins'])
 assert k.digest_relation(cat.keys,bg,'goal')==proof['beforeGoalClosureSha256']==proof['afterGoalClosureSha256'];assert k.digest_relation(cat.atom_keys,ba,'atomic')==proof['beforeAtomicClosureSha256']==proof['afterAtomicClosureSha256']
 neg=proof['negativeControl'];bad=copy.deepcopy(cat);bad.remove_origin(owner+':'+neg['sourceGoalId'],owner+':'+neg['requiredGoalId']);ne,_=bad.effective();ng,_=k.closure(bad.keys,ne);na,_=k.closure(bad.atom_keys,bad.atomic(ne));assert ng!=bg and na!=ba
 held=p['heldCase']['goalId'];heldGoal=next(g for g in after['goals']if g['id']==held);assert H(k.stable(heldGoal))==p['heldCase']['wholeGoalSha256']
 old=root/p['priorFourReceipt']['path'];assert H(old.read_bytes())==p['priorFourReceipt']['sha256'];four=json.loads(old.read_bytes());goals={g['id']:g for g in after['goals']}
 for op in four['exactOperations']:assert goals[op['guardGoalId']]['requires']==op['value']
 for pin in p['catalogSources']:assert H((root/pin['path']).read_bytes())==pin['sha256']
 print(json.dumps({'status':'six-specific-edges-readonly-pass','goalKeys':len(cat.keys),'atomicKeys':len(cat.atom_keys),'combinedGoalClosureEqual':True,'combinedAtomicClosureEqual':True,'cycles':0,'negativeSubstantiveEdgeRejected':True,'priorFourStillApplied':True,'heldFifthUnchanged':True,'all21ActiveSourcesUnchanged':True,'dataApplied':False},indent=2))
if __name__=='__main__':main()
