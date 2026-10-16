from pathlib import Path
import json,hashlib,copy,os,subprocess,datetime
R=Path.cwd();E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16';O=Path(__file__).resolve().parent;L2=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1';L3=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-shared-and-seven-final-review-capsule-v1'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';CENT='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';M='curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';S=E/'chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1';X=E/'chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1'
def read(p):return json.loads(p.read_text())
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):return {'path':str(p.relative_to(R)),'sha256':sha(p),'bytes':p.stat().st_size}
def putO(n,v):
 p=O/n;assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return p
assert sha(L2/C)=='sha256:15367459e483db82c47c08d1ed4844ef6719beea54a17ee3b723b97c81ac40c7'
sf=S/'CAS.six-whole-goal-operations.author-inactive-v3.json';vf=S/'CAS.eight-whole-views.author-inactive.json';xf=X/'CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json'
assert sha(sf)=='sha256:c8ca095ecd7054bcbb8db68a9cb09fe1e5be8e2e7d65b9d536567b5054d7ea63';assert sha(vf)=='sha256:bfa9c03c2f6f6afbda362974a278509f6b7b79a9de89d692fdd207555ddd7db5';assert sha(xf)=='sha256:d80ff21215ed5699b8b37cb8dfc6085c3ccd7ef2385f243b3fc20c06aa6a4675'
s=read(sf)['operations'];v=read(vf)['operations'];x=read(xf)['operations'];can=read(L2/C);gb={g['id']:g for g in can['goals']};six={o['goalId'] for o in s};seven={o['goalId'] for o in x};assert not six&seven;assert len(six)==6 and len(seven)==7;assert '0e3f849b-133d-57da-882c-0d67c3eb05b8' not in six|seven
for op in s:assert gb[op['goalId']]==op['beforeWhole']
for op in x:assert gb[op['goalId']]==op['before']
for op in v:assert read(L2/op['beforePath'])==op['beforeWhole'] and sha(L2/op['beforePath'])==op['beforeFileSHA256']
protected=[L2/C,L2/CENT,L2/M]+[L2/op['beforePath'] for op in v]+[R/C,R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'/C,R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'/C]
protected=[p for p in protected if p.exists()];pins=[pin(p) for p in protected]
putO('FIRST.technical-only-author-candidate-composition-inputs.json',{'recordKind':'Technical candidate composition and native4 preparation only; no science/approval','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'frozenL2Canonical':pin(L2/C),'sharedWholeCAS':pin(sf),'sharedEightViewCAS':pin(vf),'sevenExamCAS':pin(xf),'allBeforeBodiesAndViewBytesExact':True,'sixAndSevenDisjointAndNo0e3Operation':True,'protectedInputs':pins,'cloneMode':'cp -a --link; every write unlinks target first and expands any symlink parent into an owned directory','independentVotes':0,'normalWrites':0,'HumanApproval':False,'HumanTrial':False})
assert not L3.exists();subprocess.run(['cp','-a','--link','--',str(L2),str(L3)],check=True)
log=[]
def parent_owned(rel):
 cur=L3
 for part in Path(rel).parent.parts:
  cur=cur/part
  if cur.is_symlink():
   origin=cur.resolve(strict=True);entries=list(origin.iterdir());cur.unlink();cur.mkdir()
   for child in entries:(cur/child.name).symlink_to(child)
   log.append({'operation':'detach-parent-directory-symlink','path':str(cur.relative_to(L3)),'origin':str(origin)})
  elif not cur.exists():cur.mkdir()
  else:assert cur.is_dir()
def putL(rel,data):
 parent_owned(rel);dest=L3/rel;before=None
 if dest.exists() or dest.is_symlink():
  st=dest.lstat();before={'nlink':st.st_nlink,'symlink':dest.is_symlink(),'inode':st.st_ino};dest.unlink()
 with dest.open('xb') as f:f.write(data)
 assert dest.lstat().st_nlink==1 and not dest.is_symlink();log.append({'operation':'write-private-detached-file','path':rel,'priorLink':before,'afterNlink':dest.lstat().st_nlink,'sha256':sha(dest)})
def putJ(rel,j):putL(rel,(json.dumps(j,ensure_ascii=False,indent=2)+'\n').encode())
for op in s:gb[op['goalId']]=copy.deepcopy(op['afterWhole'])
for op in x:gb[op['goalId']]=copy.deepcopy(op['after'])
can['goals']=[gb[g['id']] for g in can['goals']];assert len(can['goals'])==639;putJ(C,can)
for op in v:putJ(op['beforePath'],op['afterWhole'])
central=read(L3/CENT);beforeCentral=copy.deepcopy(central);chem=next(q for q in central['subjects'] if q['subject']=='chemie');oldMP=chem['memoryReviewConfigPath'];normal=read(L3/M);assert len(normal['scope']['leafGoalIds'])==495;chem['memoryReviewConfigPath']=M
assert [q for q in central['subjects'] if q['subject']!='chemie']==[q for q in beforeCentral['subjects'] if q['subject']!='chemie'];putJ(CENT,central)
for p in pins:assert sha(R/p['path'])==p['sha256'],p['path']
putO('COMPOSITION.actual-private-L3-six-goal-eight-view-seven-exam-and-memory-scope-receipt.json',{'recordKind':'Actual private technical composition; no scientific decisions','createdAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'privateL3':str(L3.relative_to(R)),'frozenL2Canonical':pin(L2/C),'privateCanonical':pin(L3/C),'wholeGoalOperations':13,'sharedSixIds':sorted(six),'examSevenIds':sorted(seven),'viewOperations':[op['beforePath'] for op in v],'no0e3CanonicalChange':gb['0e3f849b-133d-57da-882c-0d67c3eb05b8']==next(g for g in read(L2/C)['goals'] if g['id']=='0e3f849b-133d-57da-882c-0d67c3eb05b8'),'other626BodiesExact':all(gb[g['id']]==g for g in read(L2/C)['goals'] if g['id'] not in six|seven),'memoryRegistryScopeFix':{'registry':CENT,'before':oldMP,'after':M,'scopeLeaves':495,'normalFullConfig':pin(L3/M),'newScienceOrMemoryApproval':False},'writeDetachmentLog':log,'protectedInputPinsAfter':[pin(R/p['path']) for p in pins],'protectedInputDrift':[],'newIndependentVotes':0,'normalWrites':0,'R_H_K_L_L2_Writes':0,'HumanApproval':False,'HumanTrial':False})
print(json.dumps({'privateL3':str(L3.relative_to(R)),'canonical':sha(L3/C),'operations':13,'views':8,'memoryScope':495,'detachedWrites':len(log),'protectedDrift':0}))
