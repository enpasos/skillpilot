#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only bounded replay; no apply or scope/learner-state implementation."""
import argparse,copy,hashlib,json,sys
from pathlib import Path
sys.dont_write_bytecode=True

def main():
 p=argparse.ArgumentParser();p.add_argument('--repo',type=Path,required=True);p.add_argument('--proposal',type=Path,required=True);a=p.parse_args();root=a.repo.resolve();m=json.loads(a.proposal.read_bytes());sys.path.insert(0,str(root/'docs/dev/ci-graph-repairs'));import verify_german_minimality_review as k
 h=lambda b:hashlib.sha256(b).hexdigest();docs=[]
 for pin in m['catalogSources']:
  raw=(root/pin['path']).read_bytes();assert h(raw)==pin['sha256'],pin['path'];d=json.loads(raw);assert d['landscapeId']==pin['landscapeId'];docs.append(d)
 assert len(docs)==21 and len({x['landscapeId']for x in docs})==21
 for pin in m.get('replayCodePins',[]):assert h((root/pin['path']).read_bytes())==pin['sha256'],pin['path']
 c=k.Catalog(copy.deepcopy(docs));e,_=c.effective();bg,bc=k.closure(c.keys,e);ba,bac=k.closure(c.atom_keys,c.atomic(e));owner=m['source']['landscapeId'];source=next(x for x in docs if x['landscapeId']==owner);intro='b76a024a-55a6-5c77-85cd-b37ef10e5197';ids=['041b4a11-d7a3-5557-b5d0-2c365faccc5b','bf0f8cac-3fb9-5c50-ad93-bbb6e2241aee','022c620f-fdb3-5814-a9b7-f18614130793','b2d76b0d-cdb3-5f35-893f-896903d673db'];assert[o['guardGoalId']for o in m['operations']]==ids
 def validate(op):
  parts=op['path'].split('/');assert len(parts)==4 and parts[:2]==['','goals']and parts[3]=='requires';g=source['goals'][int(parts[2])];assert op['op']=='replace' and op['file']==m['source']['path'];assert g['id']==op['guardGoalId'];assert h(k.stable(g))==op['guardGoalCanonicalSha256'];assert g['requires']==op['guardRequiresBefore'];assert len(g['requires'])==2 and g['requires'].count(intro)==1;assert op['value']==[v for v in g['requires']if v!=intro];assert not g.get('contains') and not g.get('examData')
 steps=[]
 for op,expected in zip(m['operations'],m['formalProof']['steps']):
  validate(op);c.remove_origin(owner+':'+op['guardGoalId'],owner+':'+intro);e,o=c.effective();v,cy=k.closure(c.keys,e);aa,acy=k.closure(c.atom_keys,c.atomic(e));assert v==bg and aa==ba;assert k.digest_relation(c.keys,v,'goal')==expected['goalClosureSha256'];assert k.digest_relation(c.atom_keys,aa,'atomic')==expected['atomicClosureSha256'];c.validate_path(e,expected['witnessKeys']);c.validate_origins(expected['witnessKeys'],expected['origins']);steps.append({'caseId':op['caseId'],'goalEqual':True,'atomicEqual':True})
 for row in m['formalProof']['finalWitnesses']:c.validate_path(e,row['witnessKeys']);c.validate_origins(row['witnessKeys'],row['origins'])
 negative=[]
 for label,source_id,target in [('remove-final-motivational-anchor','a2bd27fa-8e31-59ff-ab34-66fac86c0bb5',intro),('remove-substantive-retained-foundation',ids[0],'a2bd27fa-8e31-59ff-ab34-66fac86c0bb5')]:
  bad=copy.deepcopy(c);bad.remove_origin(owner+':'+source_id,owner+':'+target);ee,_=bad.effective();gv,_=k.closure(bad.keys,ee);av,_=k.closure(bad.atom_keys,bad.atomic(ee));assert gv!=bg and av!=ba;negative.append({'id':label,'goalEqualityRejects':True,'atomicEqualityRejects':True})
 altered=copy.deepcopy(m['operations'][0]);altered['guardRequiresBefore']=[]
 try:validate(altered)
 except AssertionError:negative.append({'id':'wrong-exact-field-precondition','guardRejects':True})
 else:raise AssertionError('Wrong guard unexpectedly accepted')
 for pin in m['catalogSources']:assert h((root/pin['path']).read_bytes())==pin['sha256']
 print(json.dumps({'status':'bounded-readonly-replay-pass','dataApplied':False,'nativeScopeOrRuntimeExecutionClaimed':False,'goalKeys':len(c.keys),'atomicKeys':len(c.atom_keys),'baselineCycles':[bc,bac],'steps':steps,'negativeControls':negative,'all21SourcePinsUnchanged':True},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
