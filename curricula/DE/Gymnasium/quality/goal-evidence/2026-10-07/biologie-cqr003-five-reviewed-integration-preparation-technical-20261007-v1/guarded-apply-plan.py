#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepared only: Root owns execution. Default validates/stages in memory; --apply writes 7 named active inputs.
No published files, images, cards, histories, gate code, or other subject registry object is written.
"""
import argparse,copy,hashlib,json,os,pathlib,tempfile
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot');OWN=pathlib.Path(__file__).resolve().parent
CANON='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KIND='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
MAP='curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
QA='curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
ID='9f73b963-5fac-5a90-a993-d7b7c0cc8526'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p):return json.loads(p.read_text())
def serialized(v):return (json.dumps(v,ensure_ascii=False,indent=2)+'\n').encode()
def checked_seal(p,expected):
 assert sha(p.read_bytes())==expected,f'Seal drift {p}'
 s=read(p)
 for e in s.get('payloads',s.get('files',[])):
  q=pathlib.Path(e['path']);q=ROOT/q if str(q).startswith(('curricula/','app/')) else p.parent/q;b=q.read_bytes()
  assert sha(b).removeprefix('sha256:')==e.get('sha256',e.get('digest')).removeprefix('sha256:'),f'Payload drift {q}'
  assert len(b)==e['bytes']
def prepare(expected_seal_sha256):
 # The technical seal exists only after all targeted checks have completed; its relative payload paths are dossier-owned.
 seal=OWN/'technical.final.sealed.json';assert seal.is_file(),'Technical final seal is required before Root execution.'
 checked_seal(seal,expected_seal_sha256)
 for e in read(OWN/'checks/source-seals.actual.json').values():checked_seal(ROOT/e['path'],e['sha256'])
 expected={e['path']:e for e in read(OWN/'checks/active-before-bindings.actual.json')}
 # Permit concurrent Chemie changes only by comparing the Biology subject, never replacing the whole snapshotted registry.
 for p,e in expected.items():
  if p!=REG:assert sha((ROOT/p).read_bytes())==e['sha256'],f'Active input drift {p}'
 before=read(OWN/'before'/CANON);current=read(ROOT/CANON);assert current==before
 new=copy.deepcopy(current);goals={g['id']:g for g in new['goals']}
 deltas=read(OWN/'candidate/canonical-field-deltas.author-exact.json')['canonicalDeltas'];assert len(deltas)==6
 for d in deltas:assert goals[d['goalId']][d['field']]==d['before'];goals[d['goalId']][d['field']]=d['after']
 assert new==read(OWN/'candidate/canonical.json');assert [g['id'] for g in new['goals']]==[g['id'] for g in before['goals']]
 for g in new['goals']:assert g.get('contains')==next(x for x in before['goals'] if x['id']==g['id']).get('contains')
 staged={CANON:serialized(new)}
 oldkind=read(ROOT/KIND);kind=copy.deepcopy(oldkind);target=read(OWN/'candidate/semantic-kinds.json');changed=[]
 for d in kind['decisions']:
  t=next(x for x in target['decisions'] if x['goalId']==d['goalId'])
  if t!=d:
   assert d['goalId'] in ['05358518-f66c-5c1b-ad3f-d16211d0fc1c',ID]
   assert {k:v for k,v in d.items() if k!='sourceFingerprint'}=={k:v for k,v in t.items() if k!='sourceFingerprint'}
   d['sourceFingerprint']=t['sourceFingerprint'];changed.append(d['goalId'])
 assert len(changed)==2 and kind==target;staged[KIND]=serialized(kind)
 oldmap=read(ROOT/MAP);mapping=read(OWN/'candidate/th.mapping.json');assert mapping['mappings'][:-1]==oldmap['mappings'];assert len(mapping['mappings'])==len(oldmap['mappings'])+1;assert mapping['mappings'][-1]['matchType']=='partial'
 for i,(old,d) in enumerate(zip(oldmap['decisions'],mapping['decisions'])):
  if old!=d:assert i==6;assert d['canonicalGoalIds'][:-1]==old['canonicalGoalIds'] and d['canonicalGoalIds'][-1]=='ffef97e3-12d6-5090-9816-46ab9e57fae2'
 staged[MAP]=serialized(mapping)
 for label,area in [('atomicity','semantic-atomicity'),('memory','memory-card-review')]:
  p=f'curricula/DE/Gymnasium/quality/{area}/canonical-biology-full.review.jsonl';old=(ROOT/p).read_bytes().splitlines(keepends=True);newlines=(OWN/f'candidate/{label}.391.review.jsonl').read_bytes().splitlines(keepends=True);assert len(old)==len(newlines)==391
  changed=[i for i,(a,b) in enumerate(zip(old,newlines)) if a!=b];assert len(changed)==1 and json.loads(old[changed[0]])['goalId']==ID and json.loads(newlines[changed[0]])['goalId']==ID
  staged[p]=b''.join(newlines)
 oldqa=read(ROOT/QA);qa=read(OWN/'candidate/visualization-qa.metadata-only.json');changed=[(a,b) for a,b in zip(oldqa['records'],qa['records']) if a!=b];assert len(changed)==1;old,row=changed[0];assert row['goalId']==ID
 assert {k:v for k,v in old.items() if k!='description'}=={k:v for k,v in row.items() if k!='description'};assert row['description']==goals[ID]['description'];assert row['visualizationState']=='missing' and row['contentApprovedChatGpt']=='no' and not row['assetSha256'];staged[QA]=serialized(qa)
 reg=read(ROOT/REG);snapshot=read(OWN/'before'/REG);oldbio=next(x for x in snapshot['subjects'] if x['subject']=='biologie');i=next(i for i,x in enumerate(reg['subjects']) if x['subject']=='biologie');assert reg['subjects'][i]==oldbio,'Biology registry changed; re-prepare rather than overwrite.'
 other=copy.deepcopy([x for x in reg['subjects'] if x['subject']!='biologie']);reg['subjects'][i]=read(OWN/'candidate/biologie.registry-subject.json');assert [x for x in reg['subjects'] if x['subject']!='biologie']==other;staged[REG]=serialized(reg)
 # Actual selected assets are unchanged in all three delivery locations; current global QA approvals remain historical and exact.
 for row in read(OWN/'checks/V100-unchanged-assets-scope-and-open-V-metadata.actual.json')['affectedTwoActualBindings']:
  for e in row['actualAssets']:assert sha((ROOT/e['path']).read_bytes())==e['sha256']
 return staged

def main():
 args=argparse.ArgumentParser();args.add_argument('--apply',action='store_true');args.add_argument('--expected-seal-sha256',required=True);a=args.parse_args();staged=prepare(a.expected_seal_sha256 if a.expected_seal_sha256.startswith('sha256:') else 'sha256:'+a.expected_seal_sha256);print(json.dumps({'activeFiles':list(staged),'stagedOnly':not a.apply,'applyOwner':'Root','historyWrites':False,'newM7Completions':0},ensure_ascii=False,indent=2))
 if not a.apply:return
 # Guard every input before the first write. Individual same-directory atomic renames avoid partial bytes, but this is not a multi-file transaction.
 for p,b in staged.items():
  target=ROOT/p;fd,tmp=tempfile.mkstemp(prefix='.'+target.name+'.bio-reviewed-',dir=target.parent)
  try:
   with os.fdopen(fd,'wb') as f:f.write(b);f.flush();os.fsync(f.fileno())
   os.replace(tmp,target)
  finally:
   if os.path.exists(tmp):os.unlink(tmp)
 print('Applied only prepared active Biology fields/metadata and Biology registry object; run the written post-apply native gates before committing.')
if __name__=='__main__':main()
