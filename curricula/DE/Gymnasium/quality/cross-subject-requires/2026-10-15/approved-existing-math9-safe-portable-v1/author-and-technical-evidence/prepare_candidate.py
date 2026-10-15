"""Exact private transport of eleven approved Physics requires additions.
SPDX-License-Identifier: Apache-2.0
"""
from pathlib import Path
import datetime,hashlib,json,os,shutil
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root'
A=M/'tmp/cross-subject-requires/remaining18-whole-science-author-20261014-v1'
P=M/'tmp/cross-subject-requires/remaining18-independent-science-peer-20261014-v1'
MP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
PP='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
IP='curricula/quality/cross-subject-requires/math-physics.inventory.json'
REG='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
B='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1'
def js(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(M)),'bytes':p.stat().st_size,'sha256':sha(p)}
def write(p,j):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x') as f:json.dump(j,f,ensure_ascii=False,indent=2);f.write('\n')
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
assert not R.exists();R.mkdir()
expected={MP:'61742f50b76efbb63e5fee4212b1d1b0452bb23cff4bcf8c2ce7268038828ec4',PP:'7e321fc5d8a40e5137968e5c7000def0b0443b6c619062807a502b3d207b45a0',IP:'34b41bcc849d4f55b381a61c201fb50b38f44b8fe62e83376af4767a930fa7db',REG:'1b335d3380c7857c09e7c43fbccdaa9a852dfbcd45ca144aef0007f53355a67c'}
for p,s in expected.items():assert sha(M/p)=='sha256:'+s,p
author=js(A/'native-proposal.bound.inert.json');peer=js(P/'native-independent-review.bound.inert.json')
assert sha(A/'native-proposal.bound.inert.json')=='sha256:b98560e18d8de84cc7adcbe5931693ba5915b0008eb7b444af1a6d01ce9b49d3'
assert sha(P/'native-independent-review.bound.inert.json')=='sha256:ec0c85cd982e4e2e8f26f52236ad921fe68f80c73d92ec146995f2157ebcd3ba'
index_path=M/'tmp/cross-subject-requires/canonical-gymnasium-effective-review-index-20261014-v8/effective-goal-index.json'
index=js(index_path);byindex={x['goalId']:x for x in index['records']};reviews={x['decisionId']:x for x in peer['decisions']}
selected=[d for d in author['decisions'] if d['decision']=='add' and reviews[d['decisionId']]['decision']=='approved']
selected=[d for d in selected if d['dependentGoalId'] not in {'8cdef591-6ddb-5151-8c74-a80be0271079','f47a7fa0-b929-5264-b038-b83fd682967f'}]
assert len(selected)==9 and sum(len(d['prerequisiteGoalIds']) for d in selected)==10
assert all(not d['dependentGoalId'].startswith('cd1903') for d in selected)
inventory=js(M/IP);byid={g['goalId']:g for g in inventory['families'][0]['goals']}
assert inventory['families'][0]['counts']['stableGoalIds']==2016 and inventory['families'][0]['counts']['curricularAtomic']==1285
phys=js(M/PP);physics={g['id']:g for g in phys['goals']};math=js(M/MP);mathby={g['id']:g for g in math['goals']}
intake=[];watched=[M/MP,M/PP,M/IP,M/REG,index_path,A/'native-proposal.bound.inert.json',P/'native-independent-review.bound.inert.json',M/'curricula/quality/cross-subject-requires/2026-10-13/work-checkpoint.json']
for d in selected:
 gid=d['dependentGoalId'];old=physics[gid];idx=byindex[gid]
 assert idx['effectiveCurrentScientificBindingAccepted'] and idx['selectedRecord']['decisionId']==d['decisionId']
 assert idx['selectedRecord']['authorSha256']==sha(A/'native-proposal.bound.inert.json') and idx['selectedRecord']['reviewSha256']==sha(P/'native-independent-review.bound.inert.json')
 assert byid[gid]['occurrences'][0]['reviewInput']==d['reviewInput']
 assert old['requires']==d['proposalBinding']['baselineRequires']
 reader=next(A.glob('readings/*-'+gid+'.current-whole.json'));reading=js(reader);assert reading['wholeCurrentGoal']==old
 owner=reading['positiveOwner'];recpath=M/owner['recordFile']['path'];lines=recpath.read_text().splitlines();rec=json.loads(lines[owner['recordLine']-1])
 assert rec['profile']==reading['wholeCurrentPositiveProfile'] and rec['profileFingerprint']==owner['profileFingerprint']
 # Current central P configs may use a path-only transported owner; the native
 # audit below finds that owner and compares the whole profile independently.
 for fid in d['prerequisiteGoalIds']:
  assert fid in mathby and byid[fid]['occurrences'][0]['semanticKind']=='curricularAtomic'
  assert set(old['applicability']['jurisdiction'])<=set(mathby[fid]['applicability']['jurisdiction'])
 oldforeign=[x for x in old['requires'] if x.split(':')[-1] in mathby]
 assert not oldforeign
 new=old['requires']+d['prerequisiteGoalIds'];assert new==d['proposalBinding']['proposedRequires']
 physics[gid]={**old,'requires':new}
 intake.append({'goalId':gid,'title':old['title'],'decisionId':d['decisionId'],'wholeGoalUnchangedExceptRequires':True,
  'currentIndexSelectedRecord':idx['selectedRecord'],'currentIndexBindingAccepted':True,'exactOriginalAuthorDecision':d,
  'exactOriginalIndependentReviewRecord':reviews[d['decisionId']],'wholeP':rec,'PReaderOwner':owner,
  'currentWholeReader':bind(reader),'baselineRequires':old['requires'],'proposedRequires':new,
  'preservedLocalRequires':old['requires'],'sourceRefs':d['sourceRefs'],'sourceScopeLimits':d['applicability']['alternatives'],
  'newSourceOrPlacementApproval':False})
 watched.extend([reader,recpath])
# Read-only scaffolding and physical CLI/source directories. Curriculum
# directory entries are physical so native discovery does not skip symlink dirs.
for child in M.iterdir():
 if child.name not in ['.git','tmp','app','curricula','scripts']:(R/child.name).symlink_to(child,target_is_directory=child.is_dir())
(R/'app').mkdir()
for child in (M/'app').iterdir():
 dst=R/'app'/child.name
 if child.name in ['scripts','src']:shutil.copytree(child,dst,symlinks=False)
 else:dst.symlink_to(child,target_is_directory=child.is_dir())
shutil.copytree(M/'scripts',R/'scripts',symlinks=False)
def mirror(src,dst):
 dst.mkdir()
 for child in src.iterdir():
  target=dst/child.name
  if child.is_dir():
   if child.name=='quality':target.symlink_to(child,target_is_directory=True)
   else:mirror(child,target)
  else:target.symlink_to(child)
mirror(M/'curricula',R/'curricula')
def detach_parent(p):
 for parent in reversed(list(p.parents)):
  if parent==R or R in parent.parents:
   if parent.is_symlink():
    old=parent.resolve();parent.unlink();parent.mkdir()
    for child in old.iterdir():(parent/child.name).symlink_to(child,target_is_directory=child.is_dir())
   else:parent.mkdir(exist_ok=True)
def output(path,source=None,data=None):
 p=R/path;detach_parent(p)
 if p.is_symlink():p.unlink()
 assert not p.exists(),str(p)
 if source is not None:shutil.copyfile(source,p)
 else:write(p,data)
 return p
output(PP,data={**phys,'goals':[physics[g['id']] for g in phys['goals']]})
# Preserve this central registry byte-for-byte with all FIVE subjects. Focused
# config is private only and never a proposed replacement for this registry.
output(REG,source=M/REG);assert sha(R/REG)==sha(M/REG)
registry=js(M/REG);assert len(registry['subjects'])==5
focused={**registry,'reportId':'approved-existing-math11-private-focused-20261015-v1','subjects':[s for s in registry['subjects'] if s['subject'] in ['mathematik','physik']]}
write(R/'native-input/M7.focused.config.json',focused)
write(O/'selected-nine-current-authority-and-source-limits.actual.json',{'schemaVersion':1,'atUTC':now(),'scope':'exact9approved existing Math adds/10edges only',
 'currentIndex':bind(index_path),'originalAuthorPacket':bind(A/'native-proposal.bound.inert.json'),'originalPeerPacket':bind(P/'native-independent-review.bound.inert.json'),
 'selected':intake,'exclusions':[{'goalId':'cd1903a5-d70a-5320-9124-b6b24917ba14','reason':'Entire ideal-gas branch excluded by explicit task; original pair rejected and later successor not part of this candidate.'}],
 'sixNegativeDecisionsNotGraphMutations':True,'newMathGoals':0,'freshScientificOrSourceApprovalCreated':False})
write(O/'Main-inputs.before.actual.json',{'atUTC':now(),'files':[bind(p) for p in dict.fromkeys(watched)],'centralRegistrySubjects':[s['subject'] for s in registry['subjects']]})
write(O/'materialization.actual.json',{'atUTC':now(),'isolatedRoot':str(R.relative_to(M)),'nativeScriptPhysical':not(R/'app/scripts/reportDeepUnderstandingRollout.ts').is_symlink(),
 'physicalDirectories':['app/scripts','app/src','scripts'],'exactCentralFiveSubjectRegistry':bind(R/REG),'focusedPrivateConfigNotProposed':bind(R/'native-input/M7.focused.config.json'),
 'MainWritten':False,'onlyInitialMutation':'9 Physics requires arrays; support closure follows in private native script','bundlePath':B})
print(json.dumps({'privateRoot':str(R.relative_to(M)),'selected':len(selected),'addedEdges':10,'fiveRegistrySubjectsPreserved':5,'MainWritten':False}),flush=True)
